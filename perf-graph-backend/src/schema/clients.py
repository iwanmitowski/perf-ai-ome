from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl, RootModel

class FragranceResponseModel(BaseModel):
    fragrance_id: str       = Field(alias="id")
    name: str
    brand: str
    top_notes: List[str]    = Field(alias="topNotes")
    middle_notes: List[str] = Field(alias="middleNotes")
    base_notes: List[str]   = Field(alias="baseNotes")
    sillage: str
    longevity: str
    types: List[str]

class FragranceRecommendationResponse(RootModel[List[FragranceResponseModel]]):
    """
    A root-model whose entire payload is a List[FragranceResponseModel].
    You can then do:
        resp = FragranceRecommendationResponse.model_validate(raw_list)
        fragrances = resp.root   # type: List[FragranceResponseModel]
    """
