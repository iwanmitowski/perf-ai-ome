import asyncio
from uuid import uuid4

from dotenv import load_dotenv
from langchain_core.runnables import RunnableConfig

load_dotenv()

from agents import DEFAULT_AGENT, get_agent

agent = get_agent(DEFAULT_AGENT)


async def main() -> None:
    inputs = {"messages": [("user", "In short, what project is in drawing ID D001")]}
    result = await agent.ainvoke(
        inputs,
        config=RunnableConfig(configurable={"thread_id": uuid4()}),
    )
    result["messages"][-1].pretty_print()


if __name__ == "__main__":
    asyncio.run(main())
