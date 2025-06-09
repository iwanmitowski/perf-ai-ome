import logging
import traceback
import uuid
import asyncio
import os


import httpx
from bson import ObjectId
from langchain_core.documents import Document

import json
from fastapi import APIRouter, HTTPException, Header, Request, UploadFile, Depends, Body
import re
from agents.agents import DEFAULT_AGENT
from core.persistence.db_factory import get_schema_db_client, get_vector_db_client
from typing import List, Optional, Annotated
from schema.org import User, Project
from core import settings
from langchain_community.document_loaders.pdf import PyPDFLoader
from datetime import datetime
from langchain.text_splitter import TokenTextSplitter
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
