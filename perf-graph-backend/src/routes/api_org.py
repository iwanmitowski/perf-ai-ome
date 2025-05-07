import logging
import traceback
import uuid
import asyncio
import os


import httpx
from bson import ObjectId
from langchain_core.documents import Document

import json
from fastapi import APIRouter, HTTPException, Header, Request, UploadFile, Depends
import re
from agents.agents import DEFAULT_AGENT, RECOMMENDATION_AGENT
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

@router.get("/vectordb", summary="Get all vector db files", tags=["File"])
async def get_all_vectors():
    documents = get_vector_db_client().get_all_documents()
    # Clean up vectors from the documents
    cleaned_docs = []
    for doc in documents:
        # If 'payload' is used (Qdrant), unpack it
        if "payload" in doc:
            metadata = doc["payload"]
        else:
            metadata = doc

        # Drop 'vector' if it exists
        if "vector" in metadata:
            metadata.pop("vector")

        cleaned_docs.append(metadata)

    return cleaned_docs

