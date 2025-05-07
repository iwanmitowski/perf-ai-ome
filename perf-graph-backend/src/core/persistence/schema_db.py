import os
import logging
from pymongo import MongoClient
from abc import ABC, abstractmethod
from langchain_core.documents import Document

logger = logging.getLogger(__name__)


class BaseDBClient(ABC):
    """Abstract base class for database clients (schema-based & vector-based)."""

    @abstractmethod
    def get_collection(self, name: str):
        pass

    @abstractmethod
    def add_document(self, doc_id: str, document: Document):
        pass

    @abstractmethod
    def delete_document(self, doc_id: str):
        pass

    @abstractmethod
    def search_users(self, query: str, k: int = 3, filters: dict = None):
        pass

    @abstractmethod
    def get_database(self):
        pass


class MongoDBClient(BaseDBClient):
    """MongoDB client for structured/schema-based data storage."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._client = MongoClient(os.getenv("MONGO_CONNECTIONSTRING", "mongodb://localhost:27017"))
            cls._instance._db = cls._instance._client["Agent"]
        return cls._instance

    def get_collection(self, name: str):
        """Get a specific MongoDB collection by name."""
        return self._db[name]

    def add_document(self, doc_id: str, document: Document):
        """Insert a document into MongoDB."""
        collection = self._db["users"]
        collection.insert_one({"_id": doc_id, "content": document.page_content, "metadata": document.metadata})

    def delete_document(self, doc_id: str):
        """Delete a document from MongoDB."""
        collection = self._db["users"]
        collection.delete_one({"_id": doc_id})

    def search_users(self, query: str, k: int = 0, filters: dict = None):
        """Find users in MongoDB (basic filtering, does not use embeddings)."""
        collection = self._db["users"]
        results = collection.find(filters or {}).limit(k)
        return [{"_id": r["_id"], "content": r["content"], "metadata": r["metadata"]} for r in results]

    def get_database(self):
        """Return MongoDB database instance."""
        return self._db
