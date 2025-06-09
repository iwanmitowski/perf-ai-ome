import logging
from io import BytesIO
from typing import List
import base64
import mimetypes
from langchain_openai import ChatOpenAI
from PIL import ImageFont, Image, ImageDraw
import json
from core import get_model, settings
from pydantic import BaseModel, Field
from langchain_core.runnables import RunnableConfig
from agents.utils import ToolResponse, ToolAsset, get_agent_request_value
from core import settings
from langchain_core.messages import SystemMessage, HumanMessage
from core.persistence.db_factory import get_vector_db_client

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    """
    You are a helpful assistant with the ability to use tools and retrieve information ONLY related to 
    fragrance and parfume domain.
    You are living in a system which accepts user questions with images and provides answers.
    Here is the user question:
    {user_question}
"""
)

class UnknownInformationInput(BaseModel):
    user_question: str = Field(..., description="The question the user is asking about the fragrance.")
    config: RunnableConfig

def provide_answer_for_missing_information(user_question: str, config: RunnableConfig) -> str:
    """
    Solve the problem of incomplete context about fragrances by fetching expert AI insight when the provided user information lacks the details needed to answer a user's query.

    This function bridges the gap by:
        1. Identifying that the current context is insufficient.
        2. Delegating the request to an AI-powered fragrances expert.
        3. Returning a concise, human-readable recommendation, explanation or clarification.

    Use this tool only when the assistant cannot answer directly from the available text and must retrieve missing recommendation about the fragrance.
    """
    print("=================provide_answer_for_missing_information")
    user_id = get_agent_request_value(config, "user_id")

    # 1) fetch the raw document object
    doc = get_vector_db_client().get_document(doc_id=user_id)

    # 2) extract just the textual content, with a default
    if doc and getattr(doc, "page_content", "").strip():
        prefs_text = doc.page_content.strip()
    else:
        prefs_text = "No user preferences found. Provide information according to the user question."

    print("user_preferences:")
    print(prefs_text)

    logger.info("Getting fragrances…")
    ai_msg = ask_llm(user_question, prefs_text)

    print("ai_msg:")
    print(ai_msg)

    response = ToolResponse(
        message=ai_msg,
        assets=[]
    )
    return response.model_dump_json()

def ask_llm(question: str, user_preferences: str) -> str:
    llm = get_model(settings.DEFAULT_MODEL, temperature=0.5)
    messages = [
        SystemMessage(
            content=SYSTEM_PROMPT
                .format(user_question=question)),
        HumanMessage(content=question + "My preferences are: " + user_preferences),
    ]

    response = llm.invoke(messages)
    return response.content 