from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.checkpoint.memory import MemorySaver


def initialize_database() -> BaseCheckpointSaver:
    """
    Initialize the appropriate database checkpointer based on configuration.
    Returns an initialized AsyncCheckpointer instance.
    Currently, only InMemorySaver is supported.
    """
    return MemorySaver()


__all__ = ["initialize_database"]
