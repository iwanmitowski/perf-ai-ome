"""Utilities for configuring LangGraph checkpoint storage."""

import os
import logging

from contextlib import AbstractAsyncContextManager
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.mongodb.aio import AsyncMongoDBSaver

logger = logging.getLogger(__name__)

def initialize_database() -> AbstractAsyncContextManager[AsyncMongoDBSaver]:
    """Return the configured LangGraph checkpoint saver.
    """
    connection_string = os.getenv("MONGO_CONNECTIONSTRING", "mongodb://localhost:27017")

    return AsyncMongoDBSaver.from_conn_string(
        connection_string, db_name="GraphCheckpoints"
    )

    return MemorySaver()


__all__ = ["initialize_database"]