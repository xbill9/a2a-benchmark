"""
Master Benchmark Agent.

This agent acts as a coordinator, delegating tasks to sub-agents via the A2A protocol
and benchmarking their performance.
"""

from google.adk.agents.remote_a2a_agent import AGENT_CARD_WELL_KNOWN_PATH, RemoteA2aAgent
from google.adk.agents.llm_agent import LlmAgent
from google.adk.a2a.utils.agent_to_a2a import to_a2a
import uvicorn
from fastmcp import FastMCP
import asyncio
from google.adk.runners import InMemoryRunner
from google.genai.types import Content, Part

# bench master is running on 8100
# Python Prime generator  is on 8101

node_agent = RemoteA2aAgent(
    name="node_agent",
    description="Mersenne prime number Agent written in node",
    agent_card=(
        f"http://127.0.0.1:8103/{AGENT_CARD_WELL_KNOWN_PATH}"
    ),
)


go_agent = RemoteA2aAgent(
    name="go_agent",
    description="Mersenne prime number Agent written in Go",
    agent_card=(
        f"http://127.0.0.1:8102/{AGENT_CARD_WELL_KNOWN_PATH}"
    ),
)


python_agent = RemoteA2aAgent(
    name="python_agent",
    description="Mersenne prime number Agent written in Python",
    agent_card=(
        f"http://127.0.0.1:8101/{AGENT_CARD_WELL_KNOWN_PATH}"
    ),
)

root_agent = LlmAgent(
    name="master_agent",
    model="gemini-2.5-flash",
    instruction="""
        You are the Master Benchmark Agent
        you delegate to your sub agents by the a2a protocol
        and benchmark the time in each sub agent
        if the user asks to benchmark node call the node_agent
        if the user asks to benchmark go call the go_agent
        if the user asks to benchmark python call the python_agent
        for each benchmark run it 20 times - the first time for 1 prime
        the second time for 2 primes up to 20 primes

    """,
    sub_agents=[python_agent,go_agent,node_agent]
)

runner = InMemoryRunner(agent=root_agent)

mcp_server = FastMCP("benchmark")

@mcp_server.tool
async def ask_bench_agent(query: str) -> str:
    """Ask the master agent a question."""
    # Use run_debug to handle session creation automatically
    events = await runner.run_debug(
        user_messages=query,
        user_id="user",
        session_id="session",
        quiet=True
    )
    
    full_text = []
    for event in events:
        # Check for model response content
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    full_text.append(part.text)
                    
    return "".join(full_text)


if __name__ == "__main__":
    # Expose as MCP server
    mcp_server.run(transport="http", port=8100)
