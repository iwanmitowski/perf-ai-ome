from typing import Annotated, Any

from dotenv import find_dotenv
from pydantic import (
    BeforeValidator,
    HttpUrl,
    SecretStr,
    TypeAdapter,
    computed_field,
    Field
)
from pydantic_settings import BaseSettings, SettingsConfigDict

from schema.models import (
    AllModelEnum,
    OpenAIModelName,
    Provider
)


def check_str_is_http(x: str) -> str:
    http_url_adapter = TypeAdapter(HttpUrl)
    return str(http_url_adapter.validate_python(x))


class Settings(BaseSettings):
    API_URL: Annotated[str, BeforeValidator(check_str_is_http)] = "http://perf-agent-backend:8080"

    model_config = SettingsConfigDict(
        env_file=find_dotenv(),
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
        validate_default=False,
    )

    TARGET_ENV: str | None = None

    HOST: str = "0.0.0.0"
    PORT: int = 8088

    DEFAULT_AGENT: str = "agentic-rag-alfa" #TODO smeni

    OPENAI_API_KEY: SecretStr | None = None
    USE_AWS_BEDROCK: bool = False

    DEFAULT_MODEL: AllModelEnum = OpenAIModelName.GPT_4O_MINI
    AVAILABLE_MODELS: set[AllModelEnum] = Field(default_factory=set)

    SCHEMA_DB_TYPE: str = "mongo"
    VECTOR_DB_TYPE: str = "milvus"
    def model_post_init(self, __context: Any) -> None:
        api_keys = {
            Provider.OPENAI: self.OPENAI_API_KEY,
        }
        active_keys = [k for k, v in api_keys.items() if v]
        if not active_keys:
            raise ValueError("At least one LLM API key must be provided.")

        for provider in active_keys:
            match provider:
                case Provider.OPENAI:
                    if self.DEFAULT_MODEL is None:
                        self.DEFAULT_MODEL = OpenAIModelName.GPT_4O_MINI
                    self.AVAILABLE_MODELS.update(set(OpenAIModelName))

    @computed_field
    @property
    def base_url(self) -> str:
        return f"http://{self.HOST}:{self.PORT}"

    def is_dev(self) -> bool:
        return self.TARGET_ENV == "dev"


settings = Settings()
