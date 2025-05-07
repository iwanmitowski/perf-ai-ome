import logging
from io import BytesIO
from typing import List, Optional

from PIL import ImageFont, Image, ImageDraw
import json

from pydantic import BaseModel, Field
from agents.utils import ToolResponse, ToolAsset, get_agent_request_value
from core import settings
from core.recommendation_client import get_recommendation_client
from langchain_core.runnables import RunnableConfig

logger = logging.getLogger(__name__)

class FragranceRecommendationInput(BaseModel):
    types: Optional[List[str]] = Field(
        description="Categories of fragrance (e.g. 'Woody', 'Floral', 'Gourmand', 'Fresh', 'Oriental').",
        default=[]
    )
    notes: Optional[List[str]] = Field(
        description="Specific fragrance notes the user enjoys or wants to explore (e.g. 'bergamot', 'vanilla', 'oud').",
        default=[]
    )
    hasLongevity: Optional[List[str]] = Field(
        description="Desired longevity level. Must use one or more of the following if provided by the user: "
                    "'ShortLongevity', 'ModerateLongevity', 'LongLongevity'.",
        default=[]
    )
    hasSillage: Optional[List[str]] = Field(
        description="Desired sillage or projection. Must use one or more of the following if provided by the user: "
                    "'BeastModeSillage', 'ModerateSillage', 'StrongSillage'.",
        default=[]
    )
    brandName: Optional[str] = Field(description="A specific brand or house (e.g. 'Dior', 'Creed').", default=None)
    fragranceName: Optional[str] = Field(description="A specific fragrance name to match against (e.g. 'Baccarat Rouge 540').", default=None)
    count: Optional[int] = Field(description="Maximum number of recommendations to return.", default=3)

def recommend_fragrances_func(
    config: RunnableConfig,
    types: Optional[List[str]] = [],
    notes: Optional[List[str]] = [],
    hasLongevity: Optional[List[str]] = [], 
    hasSillage: Optional[List[str]] = [], 
    brandName: Optional[str] = None,
    fragranceName: Optional[str] = None,
    count: Optional[int] = None) -> List[dict]:
    """
    Recommend fragrances based on user input.

    Use this tool when the user requests:
    - Suggestions based on specific **fragrance notes**, **types**, **longevity**, or **sillage**
    - Recommendations from a specific **brand** or for a specific **fragrance**
    - Discovery of perfumes with desired performance characteristics (e.g. long-lasting, strong projection)

    Limitations:
    - Does NOT provide detailed reviews, ingredient breakdowns, or purchase links.
    - Does not allow free-text search beyond structured fields.

    Args:
        types (List[str]): Categories of fragrance (e.g. "Woody", "Floral", "Gourmand", "Fresh", "Oriental").
        notes (List[str]): Specific fragrance notes the user enjoys or wants to explore (e.g. "bergamot", "vanilla", "oud").
        hasLongevity (List[str]): Desired longevity level. Must use one or more of the following if provided in some way by the user:
            - "ShortLongevity"
            - "ModerateLongevity"
            - "LongLongevity"
        hasSillage (List[str]): Desired sillage or projection. Must use one or more of the following if provided in some way by the user:
            - "BeastModeSillage"
            - "ModerateSillage"
            - "StrongSillage"
        brandName (Optional[str]): A specific brand or house (e.g. "Dior", "Creed").
        fragranceName (Optional[str]): A specific fragrance name to match against (e.g. "Baccarat Rouge 540").
        count (Optional[int]): Maximum number of recommendations to return.

    Returns:
        List[Fragrance]: A curated list of recommended fragrances matching the input preferences.
    """
    user_id = get_agent_request_value(config, "user_id")
    logger.info(f"Recommending fragrances for user with ID: {user_id}")

    client = get_recommendation_client()
    fragrances_info = client.recommend_fragrances(types, notes, hasLongevity, hasSillage, brandName, fragranceName, count)
    logger.info(f"Fetched fragrance recommendations for user with ID: {user_id}")

    print("Fragrance recommendations")
    print(fragrances_info)

    if fragrances_info is None:
        return ToolResponse(message="No fragrances are detected from our system", assets=[]).model_dump_json()
    dicts = [f.model_dump() for f in fragrances_info]
    payload_str = json.dumps(dicts)

    response = ToolResponse(
        message=payload_str,
        assets=[],
    )

    return response.model_dump_json()
