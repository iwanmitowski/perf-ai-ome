from logging.config import dictConfig

def setup_logging():
    """
    Setup logging configuration and exports the logger to use it globally.
    """
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            }
        },
        "handlers": {
            "default": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "stream": "ext://sys.stdout"
            }
        },
        "root": {
            "handlers": ["default"],
            "level": "INFO"
        }
    }
    dictConfig(log_config)
