import logging
from datetime import datetime

from pymongo import DESCENDING
from pymongo.collation import Collation
from fastapi import APIRouter, Query
from core.persistence.db_factory import get_schema_db_client
from schema import ChatThreadInput, ChatThread
from schema.models import OpenAIModelName
from core import get_model
from langchain_core.messages import SystemMessage, HumanMessage

router = APIRouter(prefix="/threads", tags=["Thread"])
logger = logging.getLogger(__name__)

@router.post("", response_model=ChatThread, summary="Create a new chat thread")
def create_thread(thread: ChatThreadInput) -> ChatThread:
    """
    Always creates a brand-new thread in MongoDB.
    Ignores any thread_id passed in the payload.
    """
    collection = get_schema_db_client().get_collection("chat_threads")

    try:
        llm = get_model(OpenAIModelName.GPT_4O_MINI, temperature=0.0)
        messages = [
            SystemMessage(content="Create topic from the user input it in at most 6 words."),
            HumanMessage(content=thread.summary),
        ]
        summary = llm.invoke(messages).content.strip()
    except Exception:
        logger.exception("LLM summary generation failed; using raw summary")
        summary = thread.summary[:50]

    now = datetime.utcnow()
    doc = {
        "_id": thread.thread_id,
        "user_id": thread.user_id,
        "summary": summary,
        "createTime": now,

        **{k: v for k, v in thread.model_dump().items() if k not in ("thread_id", "user_id", "summary")},
    }

    collection.insert_one(doc)

    return ChatThread(
        thread_id=thread.thread_id,
        user_id=doc["user_id"],
        summary=doc["summary"],
        createTime=doc["createTime"],
    )

ENGLISH_CI_COLLATION = Collation(locale="en", strength=2)

@router.get("", summary="List chat threads")
def list_threads(
    user_id: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    q: str = Query("", alias="q"),
) -> dict:
    """List threads with optional pagination and case-insensitive substring search."""
    collection = get_schema_db_client().get_collection("chat_threads")
    
    query: dict = {}
    if user_id:
        query["user_id"] = user_id

    if q:
        query["summary"] = {"$regex": q, "$options": "i"}

    skip = (page - 1) * limit

    cursor = (
        collection
          .find(query)
          .collation(ENGLISH_CI_COLLATION)
          .sort("createTime", DESCENDING)
          .skip(skip)
          .limit(limit + 1)
    )

    docs = list(cursor)
    has_more = len(docs) > limit
    docs = docs[:limit]

    threads = [
        ChatThread(
            thread_id=str(d["_id"]),
            user_id=d["user_id"],
            summary=d.get("summary", ""),
            createTime=d.get("createTime"),
        )
        for d in docs
    ]

    return {"threads": threads, "hasMore": has_more}