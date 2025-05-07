from functools import cache
from typing import TypeAlias
from langchain_openai import ChatOpenAI

from schema.models import (
    AllModelEnum,
    OpenAIModelName,
)
_MODEL_TABLE = {
    OpenAIModelName.GPT_4O_MINI: "gpt-4o-mini",
    # OpenAIModelName.GPT_4O: "gpt-4o",
}


ModelT: TypeAlias = (
    ChatOpenAI
)

@cache
def get_model(model_name: AllModelEnum, temperature: float = 0.0) -> ModelT:
    api_model_name = _MODEL_TABLE.get(model_name)
    if not api_model_name:
        raise ValueError(f"Unsupported model: {model_name}")

    return ChatOpenAI(model=api_model_name, temperature=temperature, streaming=True)
