from typing import List, Optional

from langchain_core.documents import Document
from langchain_core.messages import ToolCall, HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.graph import MessagesState
from pydantic import BaseModel

METADATA_FIELDS_FILTER_FOR_LLM_CONTEXT_OPTIMIZATION = [
    "general_description",
]

class AgentState(MessagesState, total=False):
    """Agent state containing conversation history."""
    tool_calls: list[ToolCall]
    assets: list[dict]
    retrieved_docs: str

class ToolAsset(BaseModel):
    id: str
    url: str
    name: str
    description: str
    type: str
    thumbnail_url: Optional[str] = None  # ← fix is here


class ToolResponse(BaseModel):
    message: str
    assets: List[ToolAsset]


def document_to_string(index: int, doc: Document, omit_full_document_description: bool) -> str:
    """
    Format a Document object as a string to be more RAG-friendly
    """
    metadata = "\n".join(
        f"{key.replace('_', ' ').title()}: {value}" for key, value in doc.metadata.items()
    )
    return (
        f"=== User description {index} ===\n"
        f"{metadata}\n\n"
        f"User description:\n{doc.page_content.strip()}\n" if not omit_full_document_description else ""
        f"=== End Document {index} ==="
    )

def get_agent_request_value(config: RunnableConfig, key: str, default=None):
    """
    Get the value of a key from the agent request configuration, as we use the configuration to pass variables
    """
    return config.get("configurable", {}).get(key, default)

def get_last_message(state: AgentState, index=-1):
    return state["messages"][index]

def get_last_message_content(state: AgentState, index=-1) -> str:
    msg = get_last_message(state, index)
    return msg if isinstance(msg, str) else msg.content

def get_last_user_message_content(state: AgentState) -> str:
    for msg in reversed(state.get("messages", [])):
        if isinstance(msg, HumanMessage):
            return msg.content
    return ""