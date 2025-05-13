from dataclasses import dataclass

from langgraph.graph.state import CompiledStateGraph

from agents.agentic_rag import agentic_rag
from core import settings
from schema import AgentInfo

DEFAULT_AGENT = settings.DEFAULT_AGENT

RECOMMENDATION_AGENT = "agentic-rag-alfa"

@dataclass
class Agent:
    description: str
    graph: CompiledStateGraph


agents: dict[str, Agent] = {
    RECOMMENDATION_AGENT: Agent(description="Fragrances recommendation.", graph=agentic_rag),
}


def get_agent(agent_id: str) -> CompiledStateGraph:
    return agents[agent_id].graph


def get_all_agent_info() -> list[AgentInfo]:
    return [
        AgentInfo(key=agent_id, description=agent.description) for agent_id, agent in agents.items()
    ]
