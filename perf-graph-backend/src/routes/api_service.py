from fastapi import Request
from fastapi import APIRouter

from agents import get_all_agent_info, DEFAULT_AGENT
from core import settings
from schema import ServiceMetadata

router = APIRouter()

@router.get("/health",
            tags=["Service"],
            summary="Check if the service is running"
            )
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@router.get("/info",
            response_model=ServiceMetadata,
            tags=["Service"],
            summary="Get service information",
            description="Returns a list of available agents and models, including the default configurations.",
            )
async def info(request: Request) -> ServiceMetadata:
    models = list(settings.AVAILABLE_MODELS)
    models.sort()
    return ServiceMetadata(
        agents=get_all_agent_info(),
        models=models,
        default_agent=DEFAULT_AGENT,
        default_model=settings.DEFAULT_MODEL,
    )
