from pydantic import BaseModel, Field

class ChatTurn(BaseModel):
    """Vector DB record for a single chat turn."""

    question: str = Field(description="Text of the user's message")
    answer: str | None = Field(default=None, description="Assistant response")
    timestamp: str = Field(description="ISO timestamp when the message was stored")
    user_id: str = Field(description="User owning the message")
    thread_id: str = Field(description="Thread in which the message was sent")
