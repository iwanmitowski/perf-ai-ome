from core import settings
from core.persistence.schema_db import BaseDBClient
from core.persistence.schema_db import MongoDBClient
from core.persistence.vector_db import MilvusClientWrapper
from core.persistence.vector_db import BaseVectorDBClient

_schema_db_client: BaseDBClient | None = None
_vector_db_client: BaseVectorDBClient | None = None

def init_db_clients():
    """
    Initialize and cache database clients to be used as singletons.
    Call this once during FastAPI app startup.
    """
    global _schema_db_client, _vector_db_client

    if _schema_db_client is None:
        schema_db_type = settings.SCHEMA_DB_TYPE
        if schema_db_type == "mongo":
            _schema_db_client = MongoDBClient()
        else:
            raise ValueError(f"Invalid SCHEMA_DB_TYPE: {schema_db_type}. Supported: 'mongo'.")

    if _vector_db_client is None:
        vector_db_type = settings.VECTOR_DB_TYPE
        if vector_db_type == "milvus":
            _vector_db_client = MilvusClientWrapper()
        else:
            raise ValueError(f"Invalid VECTOR_DB_TYPE: {vector_db_type}. Supported: 'milvus'.")

def get_schema_db_client() -> BaseDBClient:
    if _schema_db_client is None:
        raise RuntimeError("Schema DB client not initialized. Call init_db_clients() first.")
    return _schema_db_client

def get_vector_db_client() -> BaseVectorDBClient:
    if _vector_db_client is None:
        raise RuntimeError("Vector DB client not initialized. Call init_db_clients() first.")
    return _vector_db_client
