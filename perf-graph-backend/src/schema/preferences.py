from typing import List, Optional
from pydantic import BaseModel, Field

class ScentProfile(BaseModel):
    vibe: str = Field(description="Primary mood for the fragrance")
    scene: str = Field(description="Scene that describes the desired scent")
    elements: List[str] = Field(default_factory=list, description="Preferred scent elements")
    loved: Optional[str] = Field(default=None, description="Fragrances the user loves")
    disliked: Optional[str] = Field(default=None, description="Fragrances the user dislikes")
    sillage: Optional[str] = Field(default=None, description="Sillage preference")
    longevity: Optional[str] = Field(default=None, description="Longevity preference")
    additional: Optional[str] = Field(default=None, description="Additional notes from the user")