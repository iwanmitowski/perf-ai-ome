import logging
from langchain_core.documents import Document

import json
from fastapi import APIRouter, HTTPException, Body
from langchain_core.documents import Document
from core.persistence.db_factory import get_schema_db_client, get_vector_db_client
from schema.preferences import ScentProfile
from langchain_core.documents import Document

router = APIRouter()

logger = logging.getLogger(__name__)

@router.get("/vectordb", summary="Get all vector db users", tags=["User"])
async def get_all_vectors():
    documents = get_vector_db_client().get_all_documents()
    cleaned_docs = []
    for doc in documents:
        if "payload" in doc:
            metadata = doc["payload"]
        else:
            metadata = doc

        if "vector" in metadata:
            metadata.pop("vector")

        cleaned_docs.append(metadata)

    return cleaned_docs

@router.post("/user/{user_id}/scent-profile", summary="Save scent profile quiz", tags=["User"])
async def save_scent_profile(user_id: str, profile: ScentProfile):
    mongo_client = get_schema_db_client()
    prefs_col = mongo_client.get_collection("user_preferences")
    prefs_col.update_one(
        {"_id": user_id},
        {"$set": {"preferences": profile.model_dump()}},
        upsert=True,
    )

    return {"message": "Scent profile saved"}


@router.get("/user/{user_id}/scent-profile", summary="Get scent profile", tags=["User"])
async def get_scent_profile(user_id: str):
    db = get_schema_db_client()
    prefs_col = db.get_collection("user_preferences")

    doc = prefs_col.find_one({"_id": user_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="User not found")

    data = doc.get("preferences", {})
    return {"user_id": user_id, "profile": data}

@router.post("/user/{user_id}", summary="Create user information in vector db", tags=["User"])
async def create_user_record(
    user_id: str, 
    description: str = Body(..., embed=True, description="The user's fragrances description")):

    if not description or not user_id:
        raise HTTPException(status_code=400, detail="Description and user_id are required.")

    vector_db_client = get_vector_db_client()

    document = Document(page_content=description)
    vector_db_client.add_document(doc_id=user_id, document=document)

    return {"message": "User information created successfully."}


@router.put("/user/{user_id}", summary="Update user information in vector db", tags=["User"])
async def update_user_record(
    user_id: str, 
    description: str = Body(..., embed=True, description="The user's bio or description")):

    if not description:
        raise HTTPException(status_code=400, detail="Description is required.")

    vector_db_client = get_vector_db_client()

    document = Document(page_content=description)
    vector_db_client.add_document(doc_id=user_id, document=document)

    return {"message": "User information updated successfully."}

@router.get("/user/{user_id}", summary="Get user information from vector db", tags=["User"])
async def get_user_record(user_id: str):
    client = get_vector_db_client()
    doc = client.get_document(user_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return {
        "user_id": user_id,
        "description": doc.page_content,
        "metadata": doc.metadata,
    }
