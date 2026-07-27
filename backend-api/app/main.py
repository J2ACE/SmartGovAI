from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.config.settings import settings
from app.core.logging import configure_logging, get_logger


configure_logging(settings.log_level)
logger = get_logger(__name__)

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/health", status_code=status.HTTP_200_OK, tags=["health"])
def health_check() -> dict[str, str]:
    """Return the service liveness state without depending on later-phase services."""
    logger.debug("Health check requested")
    return {"status": "healthy"}
