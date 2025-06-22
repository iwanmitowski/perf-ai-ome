import json
import logging
from datetime import datetime
from typing import Any, Literal, List
from functools import lru_cache, partial
import asyncio

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage, BaseMessage, ToolMessage
from langchain_core.runnables import RunnableConfig, RunnableLambda, RunnableSerializable
from langchain_core.tools import StructuredTool

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, END

# Assuming these are correctly imported from your project structure
from agents.tools.recommend_fragrances import recommend_fragrances_func, FragranceRecommendationInput
from agents.tools.unknown_information import provide_answer_for_missing_information, UnknownInformationInput
from agents.utils import get_agent_request_value, get_last_user_message_content, AgentState, get_last_message, ToolResponse
from core.persistence.db_factory import get_vector_db_client
from core.persistence.vector_db import GenericMetadataFilter
from core import get_model, settings

logger = logging.getLogger(__name__)

INIT_SYSTEM_INSTRUCTIONS = f"""
Today's date is {datetime.now().strftime("%B %d, %Y")}.

You are a knowledgeable and helpful assistant that provides expert-level fragrance recommendations tailored to individual preferences via tools.
You live in a system where users describe their favourite fragrances, their collection, scent interests, their fragrance collection or fragrance types, notes, performance characteristics (longevity, sillage), or specific brands and names.

You may receive a request from the user involving some or all of the following elements:
- "types": Fragrance categories such as "woody", "floral", "oriental", "fresh", etc.
- "notes": Specific ingredients like "bergamot", "vanilla", "oud", "rose", etc.
- "hasLongevity": Desired lasting power of the fragrance (e.g. "long-lasting", "moderate", "soft").
- "hasSillage": Desired projection (e.g. "strong", "moderate", "intimate").
- "brandName": A specific fragrance house or brand (e.g. "Dior", "Creed", "Maison Francis Kurkdjian").
- "fragranceName": A known fragrance the user likes or is curious about.
- "count": A limit on how many results to return.

You may also receive a request that does not include any of the above elements, but is still related to fragrances. In this case, you should provide an answer related to the question via tools.

Your job is to:
1. Interpret the user's input, preferences, or questions clearly and convert them into a meaningful fragrance suggestion or insight.
2. If necessary, make a selection of recommended fragrances based on the user's stated desires, tastes, or even context (e.g. season, occasion).
3. Avoid referencing or mentioning system components such as APIs, databases, tools, frameworks, or any underlying mechanism.
4. When applicable, you may highlight why a fragrance fits the criteria — e.g. its typical composition, performance, or brand signature.
5. Present the output in a way that sounds natural, stylish, and human. Your tone is warm, elegant, and refined, like a fragrance concierge at a high-end boutique.
6. Suggest fragrances suiting the user's preferences - notes, fragrances, types, but do not provide links or purchase options. Focus on the fragrance itself and its characteristics.

Be prepared to reason through user input, even if it includes partial or loosely structured information. 
If a user is unsure or open-ended and doesn't want experiment, help guide them with clarifying questions, or suggest discovery sets, (e.g. "If you enjoy amber and spice, you might love...").


Do NOT say you couldn’t find something in “the system.” 
Do not include links, code, or any mention of internal processes in your final responses.
You are here to inspire, inform, and recommend — not to explain how the system works, do not tell to user that you don't know.
"""

NO_DOCS_FOUND_MESSAGE = "No relevant information found for the user."

def retrieve_data(state: AgentState, config: RunnableConfig) -> dict:
    """
    Retrieves user-specific information based on the last message and adds it
    to the 'retrieved_docs' field in the state.
    """
    user_id = get_agent_request_value(config, "user_id", "")
    filters = GenericMetadataFilter(user_id=user_id)

    last_user_message_content = get_last_user_message_content(state)
    logger.info(f"Retrieving data for user '{user_id}' based on query: '{last_user_message_content}'")

    vector_db_client = get_vector_db_client()
    vector_result = vector_db_client.get_document(doc_id=user_id) 

    if vector_result:
        retrieved_docs = f"Here is some information about the user that might be relevant to the conversation:\n{vector_result.page_content.strip()}"
        logger.info(f"User information found: {retrieved_docs}")
    else:
        logger.info("No user information found.")
        retrieved_docs = NO_DOCS_FOUND_MESSAGE

    return {"retrieved_docs": retrieved_docs}


@lru_cache(maxsize=1)
def get_agent_tools():
    """Returns a list of tools available for the current agent."""
    recommend_fragrances_tool = StructuredTool.from_function(
        func=recommend_fragrances_func,
        name="recommend_fragrances_func",
        args_schema=FragranceRecommendationInput
    )
    answer_for_missing_information_tool = StructuredTool.from_function(
        func=provide_answer_for_missing_information,
        name="provide_answer_for_missing_information",
        args_schema=UnknownInformationInput
    )
    return [recommend_fragrances_tool, answer_for_missing_information_tool]


def format_messages_for_prompt_context(messages: List[BaseMessage]) -> str:
    """
    Formats a list of messages into a human-readable string for inclusion
    as context within the system prompt.
    """
    if not messages:
        return "No prior conversation history available."
    
    formatted_lines = []
    for msg in messages:
        content = ""
        if isinstance(msg, HumanMessage):
            role = "Human"
            content = msg.content
        elif isinstance(msg, AIMessage):
            role = "AI"
            content = msg.content if msg.content else ""
            if msg.tool_calls:
                tool_calls_summary = "; ".join([f"Tool: {tc['name']}(id: {tc['id']})" for tc in msg.tool_calls])
                content += f" (Invoked: {tool_calls_summary})" if content else f"(Invoked: {tool_calls_summary})"
        elif isinstance(msg, ToolMessage):
            role = f"Tool Response (for id: {msg.tool_call_id})"
            content = msg.content
        elif isinstance(msg, SystemMessage):
            continue 
        else:
            role = msg.type.capitalize()
            content = msg.content
        
        content_str = str(content) if content is not None else "[No content]"
        formatted_lines.append(f"{role}: {content_str.strip()}")
        
    return "\n".join(formatted_lines) if formatted_lines else "No relevant conversation turns to display here."

def create_final_prompt(state: AgentState) -> List[BaseMessage]:
    """
    Constructs the final list of messages for the model.
    The SystemMessage content is enriched with formatted user information and chat history context.
    The overall structure [SystemMessage] + all_history_messages is maintained.
    """
    retrieved_docs = state.get("retrieved_docs", "")
    
    # 'history' here is the complete list of messages from the state,
    # including the current user query.
    all_messages_in_state = state["messages"] 
    
    system_prompt_parts = [INIT_SYSTEM_INSTRUCTIONS]
    
    # Add formatted retrieved documents (user information) to the system prompt
    if retrieved_docs and retrieved_docs != NO_DOCS_FOUND_MESSAGE:
        system_prompt_parts.append(f"==== RELEVANT USER INFORMATION ====\n{retrieved_docs}")
    
    if all_messages_in_state:
        formatted_chat_history_context = format_messages_for_prompt_context(all_messages_in_state)

        if formatted_chat_history_context not in ["No prior conversation history available.", "No relevant conversation turns to display here."]:
             system_prompt_parts.append(f"==== ONGOING CHAT HISTORY (FOR CONTEXT) ====\n{formatted_chat_history_context}")

    final_system_message = SystemMessage(content="\n\n".join(system_prompt_parts))

    return [final_system_message] + all_messages_in_state

def wrap_model(model: BaseChatModel, user_id: str) -> RunnableSerializable[Any, BaseMessage]:
    """Binds tools and the state-to-prompt preprocessor to the model."""
    model = model.bind_tools(get_agent_tools()).with_config(
        metadata={"user_id": user_id}
    )

    preprocessor = RunnableLambda(create_final_prompt, name="CreateFinalPrompt")
    return preprocessor | model


async def acall_model(state: AgentState, config: RunnableConfig) -> dict:
    """Invokes the model with the full conversation history and context."""
    model_instance = get_model(get_agent_request_value(config, "model", settings.DEFAULT_MODEL)) # Renamed to avoid conflict
    user_id = get_agent_request_value(config, "user_id", "")
    logger.info(f"Invoking model for user '{user_id}' with full history.")

    model_runnable = wrap_model(model_instance, user_id)

    response = await model_runnable.ainvoke(state, config)
    
    messages = state["messages"] + [response]
    tool_calls = response.tool_calls if response.tool_calls else []
    
    return {"messages": messages, "tool_calls": tool_calls}


def pending_tool_calls(state: AgentState) -> Literal["tools", "done"]:
    """Determines the next step based on whether the last message has tool calls."""
    last_message = get_last_message(state)
    if not isinstance(last_message, AIMessage):
        return "done"
    if last_message.tool_calls:
        return "tools"
    return "done"


async def call_tools(state: AgentState, config: RunnableConfig) -> dict:
    """Executes all tool calls requested by the model in parallel."""
    tasks = []
    assets = state.get("assets", [])
    for tool_call in state["tool_calls"]:
        tool_func = next((t for t in get_agent_tools() if t.name == tool_call["name"]), None)
        if tool_func:
            tasks.append(run_tool(tool_func, tool_call["args"], tool_call["id"], config))

    results = await asyncio.gather(*tasks)
    
    new_messages = []
    for tool_msg_tuple in results: # Ensure it's treated as a tuple
        tool_msg, tool_assets = tool_msg_tuple # Unpack the tuple
        new_messages.append(tool_msg)
        assets.extend(tool_assets)

    return {
        "messages": state["messages"] + new_messages,
        "assets": assets,
        "tool_calls": [] 
    }


async def run_tool(tool_func, args, tool_call_id, config):
    """A helper to run a single tool and parse its response."""
    loop = asyncio.get_running_loop()
    result_content = "" # Initialize for error case
    new_assets = []
    try:
        # Run synchronous tool functions in an executor
        tool_raw_result = await loop.run_in_executor(None, partial(tool_func.invoke, args, config=config)) # Added config
        
        # Assuming ToolResponse.model_validate and assets handling are correct as per your utils
        # For standalone, we'll simplify
        if isinstance(tool_raw_result, str): # Simple handling if it's already a string
            try:
                parsed = ToolResponse.model_validate(json.loads(tool_raw_result))
                result_content = parsed.message
                # new_assets = [a.model_dump() | {"source_message": tool_call_id, "timestamp": datetime.now().isoformat()} for a in parsed.assets]
            except json.JSONDecodeError:
                 result_content = tool_raw_result # Use raw if not JSON
        else:
            result_content = str(tool_raw_result)

    except Exception as e:
        logger.warning(f"Tool execution or parsing failed for {tool_call_id} with args {args}: {e}. Raw result: {result_content}")
        result_content = f"Error executing tool {tool_func.name}: {e}" # Provide error message
        new_assets = []

    return ToolMessage(content=result_content, tool_call_id=tool_call_id), new_assets


def build_agent_graph():
    """Constructs and compiles the agent graph."""
    agent = StateGraph(AgentState)
    
    agent.add_node("retriever", retrieve_data)
    agent.add_node("model", acall_model)
    agent.add_node("tools", call_tools)

    agent.set_entry_point("retriever")

    agent.add_edge("retriever", "model")
    agent.add_edge("tools", "model")
    
    agent.add_conditional_edges("model", pending_tool_calls, {"tools": "tools", "done": END})

    return agent.compile(checkpointer=MemorySaver())

agentic_rag = build_agent_graph()