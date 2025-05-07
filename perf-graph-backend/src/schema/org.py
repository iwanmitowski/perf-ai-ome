from enum import Enum
from typing import Optional, List

from datetime import datetime
from pydantic import BaseModel, Field
from pydantic.functional_validators import BeforeValidator
from typing_extensions import Annotated

PyObjectId = Annotated[str, BeforeValidator(str)]

class User(BaseModel):
    id: str = Field(description="User ID", examples=["123e4567-e89b-12d3-a456-426614174000"])

class Project(BaseModel):
    id: str = Field(description="Project ID", examples=["550e8400-e29b-41d4-a716-446655440000"])
    user_id: str = Field(description="User ID", examples=["123e4567-e89b-12d3-a456-426614174000"])
    name: str = Field(min_length=3, max_length=50, description="Project Name", examples=["My Architecture Project"])
