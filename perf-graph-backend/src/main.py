import uvicorn
from dotenv import load_dotenv
from core import settings
from core.logging import setup_logging
from routes.application import create_app

load_dotenv()
setup_logging()

app = create_app()

if __name__ == "__main__":
    uvicorn.run(app=app,
                host=settings.HOST,
                port=settings.PORT,
                timeout_keep_alive=120,
                timeout_graceful_shutdown=120,
                log_level="info",
                )
