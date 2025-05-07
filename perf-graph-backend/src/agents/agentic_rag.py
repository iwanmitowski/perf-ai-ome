import json
import logging
from datetime import datetime
from typing import Any, Literal
from functools import lru_cache, partial
import asyncio

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage, BaseMessage, ToolMessage
from langchain_core.runnables import RunnableConfig, RunnableLambda, RunnableSerializable
from langchain_core.tools import StructuredTool

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, END
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from agents.tools.recommend_fragrances import recommend_fragrances_func, FragranceRecommendationInput
from agents.tools.unknown_information import provide_answer_for_missing_information, UnknownInformationInput
from agents.utils import document_to_string, get_agent_request_value, get_last_message_content, get_last_user_message_content, AgentState, get_last_message, ToolResponse
from core.persistence.db_factory import get_vector_db_client
from core.persistence.vector_db import GenericMetadataFilter
from core import get_model, settings

logger = logging.getLogger(__name__)

INIT_SYSTEM_INSTRUCTIONS = f"""
Today's date is {datetime.now().strftime("%B %d, %Y")}.

You are a knowledgeable and helpful assistant that provides expert-level fragrance recommendations tailored to individual preferences.
You live in a system where users describe their scent interests, such as fragrance types, notes, performance characteristics (longevity, sillage), or specific brands and names.

You may receive a request from the user involving some or all of the following elements:
- "types": Fragrance categories such as "woody", "floral", "oriental", "fresh", etc.
- "notes": Specific ingredients like "bergamot", "vanilla", "oud", "rose", etc.
- "hasLongevity": Desired lasting power of the fragrance (e.g. "long-lasting", "moderate", "soft").
- "hasSillage": Desired projection (e.g. "strong", "moderate", "intimate").
- "brandName": A specific fragrance house or brand (e.g. "Dior", "Creed", "Maison Francis Kurkdjian").
- "fragranceName": A known fragrance the user likes or is curious about.
- "count": A limit on how many results to return.

Your job is to:
1. Interpret the user's input, preferences, or questions clearly and convert them into a meaningful fragrance suggestion or insight.
2. If necessary, make a selection of recommended fragrances based on the user's stated desires, tastes, or even context (e.g. season, occasion).
3. Avoid referencing or mentioning system components such as APIs, databases, tools, frameworks, or any underlying mechanism.
4. When applicable, you may highlight why a fragrance fits the criteria — e.g. its typical composition, performance, or brand signature.
5. Present the output in a way that sounds natural, stylish, and human. Your tone is warm, elegant, and refined, like a fragrance concierge at a high-end boutique.
6. Suggest fragrances suiting the user's preferences, but do not provide links or purchase options. Focus on the fragrance itself and its characteristics.

Be prepared to reason through user input, even if it includes partial or loosely structured information. 
If a user is unsure or open-ended, help guide them with clarifying questions, or suggest discovery sets (e.g. "If you enjoy amber and spice, you might love...").

Do not include links, code, or any mention of internal processes in your final responses.
You are here to inspire, inform, and recommend — not to explain how the system works, do not tell to user that you don't know.
"""

NO_DOCS_FOUND_MESSAGE = "No relevant information found for the user. Tell the user to ask again.\n\n"

def retrieve_data(state: AgentState, config: RunnableConfig) -> AgentState:
    user_id = get_agent_request_value(config, "user_id", "")
    filters = GenericMetadataFilter(
        user_id=user_id,
    )

    last_message_content = get_last_message_content(state)

    vector_db_client = get_vector_db_client()
    vector_result = vector_db_client.search_documents(query=last_message_content, filters=filters)

    init_message = "------ Starting obtaining user information from database ----- \n"
    if vector_result:
        retrieved_docs = f"User information:\n{vector_result[0].page_content.strip()}\n"
    else:
        retrieved_docs = NO_DOCS_FOUND_MESSAGE

    end_message = "\n----- End obtaining user information from the vector database -----"

    return {"messages": state["messages"] + [SystemMessage(content=init_message + retrieved_docs + end_message)]}


@lru_cache(maxsize=1)
def get_agent_tools():
    """
    Returns a list of tools available for the current agent.
    As they are not dynamic, we can cache them.
    """
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

    return [
        recommend_fragrances_tool,
        answer_for_missing_information_tool
    ]

def ask_model_for_missing_information(config: RunnableConfig) -> str:
    """
    Asks the model for missing information based on the selected documents.
    """
    user_id = get_agent_request_value(config, "user_id", "")

    filters = GenericMetadataFilter(
        user_id=user_id,
    )

    vector_db_client = get_vector_db_client()
    vector_result = vector_db_client.search_documents(query="", k=1, filters=filters)

    if vector_result:
        return vector_result[0].page_content
    return ""

def combine_system_messages(messages: list[BaseMessage]) -> list[BaseMessage]:
    system_messages = [m.content for m in messages if isinstance(m, SystemMessage)] # TODO what are other system messages
    other_messages = [m for m in messages if not isinstance(m, SystemMessage)] # here are the tools

    # Combine all system messages into one
    combined_system_msg = SystemMessage(content="\n\n".join([INIT_SYSTEM_INSTRUCTIONS] + system_messages))

    return [combined_system_msg] + other_messages


def wrap_model(model: BaseChatModel, client_id: str, user_question: str) -> RunnableSerializable[Any, BaseMessage]:
    model = model.bind_tools(get_agent_tools()).with_config(
        metadata={
            "client_id": client_id,
            "user_question": user_question,
        }
    )

    preprocessor = RunnableLambda(
        lambda state: combine_system_messages(state["messages"]),
        name="StateModifier",
    )
    return preprocessor | model

async def acall_model(state: AgentState, config: RunnableConfig) -> AgentState:
    model = get_model(get_agent_request_value(config, "model", settings.DEFAULT_MODEL))

    client_id = get_agent_request_value(config, "client_id", "")
    user_question = get_last_user_message_content(state)
    
    print(f"LAST USER User question: {user_question}")

    model_runnable = wrap_model(model, client_id, user_question)

    response = await model_runnable.ainvoke(state, config)
    state["messages"].append(response)
    if response.tool_calls:
        state["tool_calls"] = response.tool_calls
    return state

def pending_tool_calls(state: AgentState) -> Literal["tools", "done"]:
    """
    Determines whether the model's last message includes tool calls.
    Required as we implement custom ToolNode logic, see `call_tools`.
    """
    last_message = get_last_message(state)
    if not isinstance(last_message, AIMessage):
        raise TypeError(f"Expected AIMessage, got {type(last_message)}")
    if last_message.tool_calls:
        return "tools"
    return "done"


async def call_tools(state: AgentState, config: RunnableConfig) -> AgentState:
    tasks = []
    assets = state.get("assets", [])
    for tool_call in state["tool_calls"]:
        tool_func = next((t for t in get_agent_tools() if t.name == tool_call["name"]), None)
        if tool_func:
            tasks.append(run_tool(tool_func, tool_call["args"], tool_call["id"], config))

    results = await asyncio.gather(*tasks)
    for tool_msg, tool_assets in results:
        state["messages"].append(tool_msg)
        assets.extend(tool_assets)

    state["assets"] = assets
    return state

async def run_tool(tool_func, args, tool_call_id, config):
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, partial(tool_func.invoke, args, config))

    try:
        parsed = ToolResponse.model_validate(json.loads(result))
        message_content = parsed.message
        new_assets = [a.model_dump() | {"source_message": tool_call_id, "timestamp": datetime.now().isoformat()} for a in
                      parsed.assets]
    except Exception as e:
        logger.warning(f"Failed to parse tool response: {e}. Raw result: {result}")
        message_content = result
        new_assets = []

    return ToolMessage(content=message_content, tool_call_id=tool_call_id), new_assets



def build_agent_graph():
    """
    Constructs the agent graph with nodes and edges.
    This is where the agent's flow and logic are defined.
    """
    agent = StateGraph(AgentState)
    agent.add_node("retriever", retrieve_data)
    agent.add_node("model", acall_model)

    agent.set_entry_point("retriever")

    agent.add_edge("retriever", "model")
    agent.add_edge("tools", "model")

    agent.add_node("tools", call_tools)
    agent.add_conditional_edges("model", pending_tool_calls, {"tools": "tools", "done": END})

    # Compile and expose the agent graph
    return agent.compile(checkpointer=MemorySaver())

# Compile and expose the agent graph
agentic_rag = build_agent_graph()
#
# output_dir = "static/images"
# os.makedirs(output_dir, exist_ok=True)
#
# # Generate a unique filename
# file_id = str(uuid.uuid4())
# output_path = os.path.join(output_dir, f"graph.png")
#
# # Generate and save the graph image
# agentic_rag.get_graph().draw_mermaid_png(
#     # curve_style=CurveStyle.LINEAR,
#     # node_colors=NodeStyles(first="#ffdfba", last="#baffc9", default="#fad7de"),
#     # wrap_label_n_words=9,
#     output_file_path=output_path,
#     draw_method=MermaidDrawMethod.API,
#     # background_color="white",
#     # padding=10,
# )
