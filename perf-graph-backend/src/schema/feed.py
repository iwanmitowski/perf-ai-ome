from datetime import datetime
from pydantic import BaseModel, Field

class FeedItem(BaseModel):
    id: str = Field(..., alias="_id")
    type: str
    title: str
    summary: str
    content: str | None = None
    imageUrl: str
    tags: list[str] = Field(default_factory=list)
    createTime: datetime | None = None

class FeedResponse(BaseModel):
    items: list[FeedItem]
    hasMore: bool