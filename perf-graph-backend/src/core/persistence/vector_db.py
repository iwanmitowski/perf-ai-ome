import json
import os
import logging
from abc import ABC, abstractmethod
from typing import Union, Dict, Any, Callable, Optional

from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from langchain_milvus import Milvus
from pymilvus import Collection, FieldSchema, CollectionSchema, DataType, utility, connections, db, MilvusException

embeddings = OpenAIEmbeddings(
    model="text-embedding-ada-002",
    openai_api_key=os.getenv("OPENAI_API_KEY"),
)
embeddings_dimension = 1536

logger = logging.getLogger(__name__)


class GenericMetadataFilter:
    """
    Abstract filter structure for vector DBs, supporting dynamic fields and values.
    Example:
        GenericMetadataFilter(doc_id=["abc", "def"], project_id="123", score_gt=0.5)
    """
    def __init__(self, **filters: Union[str, list[str], int, float]):
        self.filters: Dict[str, Union[str, list[str], int, float]] = filters

    def is_empty(self) -> bool:
        return not self.filters

    def get(self, key: str) -> Any:
        return self.filters.get(key)

    def items(self):
        return self.filters.items()

    def __repr__(self):
        return f"GenericMetadataFilter({self.filters})"


class BaseVectorDBClient(ABC):
    """Abstract base class for vector databases."""

    @abstractmethod
    def add_document(self, doc_id: str, document: Document):
        pass

    @abstractmethod
    def delete_document(self, doc_id: str):
        pass

    @abstractmethod
    def search_documents(self, query: str, k: int = 3, filters: GenericMetadataFilter = None):
        pass

    @abstractmethod
    def get_database(self):
        pass

    @abstractmethod
    def get_all_documents(self):
        pass

    @abstractmethod
    def update_document(self, doc_id: str, document: Document):
        pass

class MilvusClientWrapper(BaseVectorDBClient):
    """Milvus client using LangChain integration."""

    def __init__(self):
        milvus_host = os.getenv("VECTOR_DB_HOST", "localhost")
        milvus_port = os.getenv("VECTOR_DB_PORT", "19530")

        milvus_user = os.getenv("MILVUS_USER", "root")
        milvus_password = os.getenv("MILVUS_PASSWORD", "Milvus")

        # Connect to Milvus
        connections.connect(host=milvus_host, port=milvus_port, token=f"{milvus_user}:{milvus_password}")
                        
        self.db_name = "users"
        self.collection_name = "fragrances"

        try:
            existing_databases = db.list_database()
            if self.db_name in existing_databases:
                logger.info(f"Database '{self.db_name}' already exists.")
            else:
                logger.info(f"Database '{self.db_name}' does not exist.")
                database = db.create_database(self.db_name)
                logger.info(f"Database '{self.db_name}' created successfully.")
        except MilvusException as e:
            print(f"An error occurred: {e}")

        # Initialize the vector store
        self.vectorstore = Milvus(
            embeddings,
            collection_name=self.collection_name,
            connection_args={
                "uri": f"http://{milvus_host}:{milvus_port}",
                "token": f"{milvus_user}:{milvus_password}",
                "db_name": f"{self.db_name}",
            },
            enable_dynamic_field=True,            
        )

    def add_document(self, doc_id: str, document: Document):
        """Insert a document into Milvus."""
        self.vectorstore.add_texts(ids=[doc_id], texts=[document.page_content], metadatas=[document.metadata])

    def delete_document(self, doc_id: str):
        """Delete a document from Milvus."""
        if self.vectorstore.col is not None:
            self.vectorstore.delete(ids=[doc_id])

    def search_documents(self, query: str, k: int = 3, filters: GenericMetadataFilter = None):
        milvus_filter = None
        if filters and not filters.is_empty():
            conditions = []
            for key, value in filters.items():
                if value is None or value == "" or (isinstance(value, list) and len(value) == 0):
                    continue  # skip empty values
                if isinstance(value, list):
                    value_list = ', '.join(f'"{v}"' if isinstance(v, str) else str(v) for v in value)
                    conditions.append(f'{key} in [{value_list}]')
                else:
                    value_str = f'"{value}"' if isinstance(value, str) else str(value)
                    conditions.append(f'{key} == {value_str}')
            milvus_filter = ' && '.join(conditions)
        return self.vectorstore.similarity_search(query, k=k, expr=milvus_filter)

    def get_document(self, doc_id: str) -> Optional[Document]:
        """
        Fetch a single document from Milvus by its primary key.
        Returns None if not found.
        """
        results = self.vectorstore.col.query(
            expr=f'{self.vectorstore._primary_field} == "{doc_id}"',
            output_fields=[self.vectorstore._text_field],  # adjust if you have metadata fields
            limit=1,
        )
        if not results:
            return None
        record = results[0]
        text = record[self.vectorstore._text_field]

        metadata = {
            k: v
            for k, v in record.items()
            if k not in {self.vectorstore._primary_field, self.vectorstore._text_field}
        }
        
        print("GET DOCUMENT")
        print(metadata)

        return Document(page_content=text, metadata=metadata)

    def update_document(self, doc_id: str, document: Document):
        self.delete_document(doc_id)
        self.add_document(doc_id, document)

    def get_database(self) -> Milvus:
        """Return Milvus vectorstore."""
        return self.vectorstore

    def get_all_documents(self):
        return self.vectorstore.col.query(expr="", output_fields=["*"], limit=1000)