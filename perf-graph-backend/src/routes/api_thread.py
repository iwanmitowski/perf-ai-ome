import logging
from typing import List

from fastapi import APIRouter, Query

from core.persistence.db_factory import get_schema_db_client
from schema import ChatThreadInput, ChatThread
from schema.models import OpenAIModelName
from core import get_model
from langchain_core.messages import SystemMessage, HumanMessage

router = APIRouter(prefix="/threads", tags=["Thread"])
logger = logging.getLogger(__name__)

@router.post("", response_model=ChatThread, summary="Create or update a chat thread")
def create_thread(thread: ChatThreadInput) -> ChatThread:
    """Create or update a chat thread in MongoDB."""
    collection = get_schema_db_client().get_collection("chat_threads")
    try:
        llm = get_model(OpenAIModelName.GPT_4O_MINI, temperature=0.0)
        messages = [
            SystemMessage(content="Summarize the following text in at most 6 words."),
            HumanMessage(content=thread.summary),
        ]
        ai_response = llm.invoke(messages)
        summary = ai_response.content.strip()
    except Exception as e:
        logger.error(f"Failed to generate summary: {e}", exc_info=True)
        summary = thread.summary[:50]

    data = thread.model_dump()
    data["_id"] = data.pop("thread_id")
    data["summary"] = summary
    collection.update_one({"_id": data["_id"]}, {"$set": data}, upsert=True)

    return ChatThread(thread_id=data["_id"], user_id=data["user_id"], summary=summary)

@router.get("", response_model=List[ChatThread], summary="List chat threads")
def list_threads(user_id: str = Query(None)) -> List[ChatThread]:
    collection = get_schema_db_client().get_collection("chat_threads")
    query = {"user_id": user_id} if user_id else {}
    docs = list(collection.find(query))
    threads = [ChatThread(thread_id=str(doc.get("_id")), user_id=doc.get("user_id"), summary=doc.get("summary", "")) for doc in docs]
    return threads