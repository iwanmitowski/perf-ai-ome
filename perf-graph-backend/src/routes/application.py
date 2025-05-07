import logging
import warnings
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.persistence.db_factory import init_db_clients
from langchain_core._api import LangChainBetaWarning
from routes.api_agent import router as agent_router
from routes.api_org import router as org_router
from routes.api_service import router as service_router
from fastapi.staticfiles import StaticFiles

warnings.filterwarnings("ignore", category=LangChainBetaWarning)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app_ctx: FastAPI):
    """Handles startup and shutdown operations."""
    try:
        init_db_clients()
        yield
    except Exception as e:
        logger.error(f"Startup failure: {e}", exc_info=True)
        raise


openapi_tags_metadata = [
    {
        "name": "User",
        "description": "Endpoints related to yser management .",
    },
]


def create_app() -> FastAPI:
    """Creates and configures a FastAPI app instance."""
    app = FastAPI(
        title="Perf-ai-ome",
        description="An AI-powered agent service with great fragrance domain knowledge.",
        version="1.0.0",
        docs_url="/docs",
        lifespan=lifespan,
        openapi_tags=openapi_tags_metadata,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers per domain
    app.include_router(agent_router)
    app.include_router(org_router)
    app.include_router(service_router)

    class HealthCheckFilter(logging.Filter):
        def filter(self, record: logging.LogRecord) -> bool:
            return "/health" not in record.getMessage()
    logging.getLogger("uvicorn.access").addFilter(HealthCheckFilter())
    return app
