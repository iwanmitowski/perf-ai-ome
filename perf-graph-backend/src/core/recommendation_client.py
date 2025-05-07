import logging
from typing import Optional, List

import requests
from core.settings import settings
from schema.clients import FragranceRecommendationResponse
from pydantic import ValidationError

logger = logging.getLogger(__name__)


class RecommendationClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Content-Type": "application/json"
        }

    def recommend_fragrances(
        self,
        types: List[str],
        notes: List[str],
        hasLongevity: List[str],
        hasSillage: List[str],
        brandName: Optional[str] = None,
        fragranceName: Optional[str] = None,
        count: Optional[int] = None
    ) -> Optional[FragranceRecommendationResponse]:
        url = f"{self.base_url}/api/agent/recommend"
        payload = {
            "types": types,
            "notes": notes,
            "hasLongevity": hasLongevity,
            "hasSillage": hasSillage,
            "brandName": brandName,
            "fragranceName": fragranceName,
            "count": count
        }

        print("Payload")
        print(payload)

        try:
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            print("Response")
            print(response.json())
            try:
                validated = FragranceRecommendationResponse.model_validate(response.json())
                return validated.root
            except ValidationError as ve:
                logger.error(f"Failed to validate response: {ve}")
        except requests.RequestException as e:
            logger.error(f"Failed to recommend fragrances: {e}")
        
        return None

recommendation_client: Optional[RecommendationClient] = None

def get_recommendation_client() -> RecommendationClient:
    global recommendation_client
    if recommendation_client is None:
        recommendation_client = RecommendationClient(base_url=settings.API_URL)
    return recommendation_client
