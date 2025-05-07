import logging
from io import BytesIO
import requests
import uuid

from functools import lru_cache
from fastapi import HTTPException
from bson import ObjectId

from core.persistence.db_factory import get_schema_db_client

logger = logging.getLogger(__name__)

#TODO fix this
def get_user_metadata(user_id: str) -> dict:
    collection = get_schema_db_client().get_collection("fragrances")
    doc = collection.find_one({"_id": ObjectId(user_id)})

    if not doc:
        raise HTTPException(status_code=404, detail="Invalid user ID or metadata missing.")

    meta = doc.get("drawing_metadata", {})
    page_id, inner_id = meta.get("page_id"), meta.get("user_id")
    if not page_id or not inner_id:
        raise HTTPException(status_code=404, detail="Incomplete user metadata.")

    return {"page_id": page_id, "user_id": inner_id}
