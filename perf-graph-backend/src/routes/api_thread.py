import logging
from typing import List
from datetime import datetime
from bson import ObjectId

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

    # 1) Generate a 6-word summary via LLM (fallback to raw summary if that fails)
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

    # 2) Build the document: new _id, user_id, summary, createTime
    now = datetime.utcnow()
    new_id = str(ObjectId())
    doc = {
        "_id": new_id,
        "user_id": thread.user_id,
        "summary": summary,
        "createTime": now,
        # include any other fields from your input, e.g.:
        **{k: v for k, v in thread.model_dump().items() if k not in ("thread_id", "user_id", "summary")},
    }

    # 3) Insert
    collection.insert_one(doc)

    # 4) Return
    return ChatThread(
        thread_id=new_id,
        user_id=doc["user_id"],
        summary=doc["summary"],
        createTime=doc["createTime"],
    )

@router.get("", response_model=List[ChatThread], summary="List chat threads")
def list_threads(user_id: str = Query(None)) -> List[ChatThread]:
    collection = get_schema_db_client().get_collection("chat_threads")
    query = {"user_id": user_id} if user_id else {}
    cursor = collection.find(query).sort("createTime", -1)

    return [
        ChatThread(
            thread_id=str(d["_id"]),
            user_id=d["user_id"],
            summary=d.get("summary", ""),
            createTime=d.get("createTime"),
        )
        for d in cursor
    ]
