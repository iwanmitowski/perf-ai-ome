import json
import logging
import random
from datetime import datetime

from fastapi import APIRouter, Query, BackgroundTasks, HTTPException
from pymongo import DESCENDING
from bson import ObjectId
from core.persistence.db_factory import get_schema_db_client
from core import get_model
from schema.models import OpenAIModelName
from langchain_core.messages import SystemMessage, HumanMessage
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
import openai

router = APIRouter(prefix="/feed", tags=["Feed"])
logger = logging.getLogger(__name__)

import json
from typing import List

async def _choose_topics(n: int) -> List[str]:
    """
    Ask the LLM to return exactly `n` distinct article-topic strings
    as a JSON list, using LangChain's StructuredOutputParser.
    """
    response_schemas = [
        ResponseSchema(
            name="topics",
            description="A JSON list of exactly n distinct fragrance-article topic strings"
        )
    ]
    parser = StructuredOutputParser.from_response_schemas(response_schemas)
    fmt_instructions = parser.get_format_instructions()
    logger.info("Choosing topics")
    llm = get_model(OpenAIModelName.GPT_4O_MINI, temperature=0.7)

    messages = [
        SystemMessage(
            content=(
                "You’re a creative editor for a fragrance magazine. Topics must be unique, and varied, "
                "and should not overlap with each other. "
                f"Please suggest exactly {n} distinct, interesting article topics."
            )
        ),
        HumanMessage(
            content=(
                "Return your answer **only** as valid JSON, "
                "conforming to these instructions:\n\n"
                f"{fmt_instructions}"
            )
        ),
    ]

    resp = await llm.ainvoke(messages)
    parsed = parser.parse(resp.content)

    topics = parsed["topics"]
    logger.info("Chosen topics: %s", topics)
    if not isinstance(topics, list) or len(topics) < n:
        raise ValueError(f"Expected {n} topics, got {topics!r}")
    return topics[:n]

@router.get("", summary="List feed items")
def list_feed(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    q: str = Query("", alias="q"),
) -> dict:
    collection = get_schema_db_client().get_collection("feed_items")

    query: dict = {}
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"summary": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
        ]

    skip = (page - 1) * limit
    cursor = (
        collection
        .find(query)
        .sort("createTime", DESCENDING)
        .skip(skip)
        .limit(limit + 1)
    )

    docs = list(cursor)
    has_more = len(docs) > limit
    docs = docs[:limit]

    items = [
        {
            "id": str(d.get("_id")),
            "type": d.get("type", "NEWS"),
            "title": d.get("title"),
            "summary": d.get("summary"),
            "imageUrl": d.get("imageUrl"),
            "tags": d.get("tags", []),
        }
        for d in docs
    ]

    return {"items": items, "hasMore": has_more}

@router.get("/{item_id}", summary="Get a feed item")
def get_feed_item(item_id: str) -> dict:
    collection = get_schema_db_client().get_collection("feed_items")
    doc = collection.find_one({"_id": ObjectId(item_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")

    return {
        "id": str(doc.get("_id")),
        "type": doc.get("type", "NEWS"),
        "title": doc.get("title"),
        "summary": doc.get("summary"),
        "content": doc.get("content", ""),
        "imageUrl": doc.get("imageUrl"),
        "tags": doc.get("tags", []),
    }

async def _generate_image(prompt: str) -> str:
    logger.info("Generating image for prompt: %s", prompt)
    client = openai.AsyncOpenAI()
    response = await client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        n=1,
        size="1024x1024",
    )
    return response.data[0].url

async def _create_single_item(topic: str) -> dict:
    llm = get_model(OpenAIModelName.GPT_4O_MINI, temperature=0.7)
    messages = [
        SystemMessage(
            content="You write long-form fragrance articles. Return JSON with keys title, summary, content, tags. 'summary' should be a short teaser, 'content' about 1000 words."
        ),
        HumanMessage(content=f"Write the article about {topic}.")
    ]
    resp = await llm.ainvoke(messages)
    try:
        data = json.loads(resp.content)
    except Exception as e:
        logger.error("Failed to parse JSON from LLM: %s", e)
        data = {
            "title": resp.content[:50],
            "summary": resp.content,
            "content": resp.content,
            "tags": [],
        }

    image_prompt = f"{data.get('title', topic)} in an artistic style"
    try:
        image_url = await _generate_image(image_prompt)
    except Exception:
        logger.exception("Image generation failed")
        image_url = ""

    doc = {
        "type": "NEWS",
        "title": data.get("title", ""),
        "summary": data.get("summary", ""),
        "content": data.get("content", ""),
        "imageUrl": image_url,
        "tags": data.get("tags", []),
        "createTime": datetime.utcnow(),
    }

    get_schema_db_client().get_collection("feed_items").insert_one(doc)
    doc["id"] = str(doc.get("_id"))
    return doc

async def _generate_feed_items(n: int = 1):
    topics = await _choose_topics(n)
    for topic in topics:
        await _create_single_item(topic)

@router.post("/generate", status_code=202)
async def generate_feed(background: BackgroundTasks) -> dict:
    background.add_task(_generate_feed_items, 1)
    return {"status": "accepted"}