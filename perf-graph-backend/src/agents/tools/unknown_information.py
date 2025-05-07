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

def provide_answer_for_missing_information(user_question: str) -> str:
    """
    Solve the problem of incomplete context about fragrances by fetching expert AI insight when the provided metadata or sheet text lacks the detail needed to answer a user's query.

    This function bridges the gap by:
        1. Identifying that the current context is insufficient.
        2. Delegating the request to an AI-powered fragrances expert.
        3. Returning a concise, human-readable recommendation, explanation or clarification.

    Use this tool only when the assistant cannot answer directly from the available text and must retrieve missing recommendation about the fragrance.
    """
    logger.info(f"Getting fragrancess")
    ai_msg = ask_llm(user_question)
    print("ai_msg")
    print(ai_msg)
    response = ToolResponse(
        message=ai_msg,
        assets=[]
    )
    return response.model_dump_json()

def ask_llm(question: str) -> str:
    llm = get_model(settings.DEFAULT_MODEL, temperature=0.5)
    messages = [
        SystemMessage(content=SYSTEM_PROMPT.format(user_question=question)),
        HumanMessage(content=question),
    ]

    response = llm.invoke(messages)
    return response.content 