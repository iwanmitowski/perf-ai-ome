from pydantic import BaseModel, Field

class ChatThreadInput(BaseModel):
    """Input schema for creating or updating a chat thread."""
    thread_id: str = Field(description="Unique thread identifier")
    user_id: str = Field(description="User ID owning the thread")
    summary: str = Field(description="Short summary of the chat")

class ChatThread(ChatThreadInput):
    pass