from enum import StrEnum, auto
from typing import TypeAlias


class Provider(StrEnum):
    OPENAI = auto()


class OpenAIModelName(StrEnum):
    """https://platform.openai.com/docs/models/gpt-4o"""
    GPT_4O_MINI = "gpt-4o-mini"
    GPT_4O = "gpt-4o"


AllModelEnum: TypeAlias = (
    OpenAIModelName
)
