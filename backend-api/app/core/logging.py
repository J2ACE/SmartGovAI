import logging


LOG_FORMAT = "%(asctime)s %(levelname)s %(name)s: %(message)s"


def configure_logging(log_level: str) -> None:
    """Configure the process logger once at application startup."""
    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format=LOG_FORMAT,
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
