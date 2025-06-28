"""Utilities for configuring LangGraph checkpoint storage."""

import os
import logging

from contextlib import AbstractAsyncContextManager
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.mongodb.aio import AsyncMongoDBSaver

logger = logging.getLogger(__name__)

def initialize_database() -> AbstractAsyncContextManager[AsyncMongoDBSaver]:
    """Return the configured LangGraph checkpoint saver.

    The saver type is selected via the ``CHECKPOINT_TYPE`` environment variable.
    Supported values are ``memory`` (default) and ``sqlite``.  When ``sqlite``
    is selected the checkpoint database will be stored at the location provided
    by ``CHECKPOINT_PATH`` or ``./checkpoints.sqlite`` if omitted.
    """
    connection_string = os.getenv("MONGO_CONNECTIONSTRING", "mongodb://localhost:27017")

    return AsyncMongoDBSaver.from_conn_string(
        connection_string, db_name="GraphCheckpoints"
    )

    return MemorySaver()


__all__ = ["initialize_database"]