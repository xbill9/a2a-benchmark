"""This module defines an agent that calculates Mersenne primes."""

from google.adk.agents import Agent
from google.adk.a2a.utils.agent_to_a2a import to_a2a
import uvicorn
import time
import sys
import logging
import os


def find_mersenne_primes(count: int) -> dict:
    """Finds the first 'count' Mersenne primes.

    Args:
        count: The number of Mersenne primes to find.

    Returns:
        dict: A dictionary containing the elapsed time.
    """
    mersenne_primes = []
    start_time = time.time()
    p = 2
    while len(mersenne_primes) < count:
        # Check if p is prime
        is_p_prime = True
        if p > 2:
            if p % 2 == 0:
                is_p_prime = False
            else:
                d = 3
                while d * d <= p:
                    if p % d == 0:
                        is_p_prime = False
                        break
                    d += 2
        
        if is_p_prime:
            # Lucas-Lehmer test
            if p == 2:
                mersenne_primes.append(str(3))
            else:
                m_p = (1 << p) - 1
                s = 4
                for _ in range(p - 2):
                    s = (s * s - 2) % m_p
                if s == 0:
                    mersenne_primes.append(str(m_p))
        p += 1
    end_time = time.time()
    elapsed_time = end_time - start_time
    return {"elapsed_time": elapsed_time}


root_agent = Agent(
    name="python_agent",
    model=os.getenv("MODEL_NAME", "gemini-2.5-flash"),
    description="Python Agent to calculate Mersenne primes.",
    instruction=(
        "You are a helpful agent who can calculate Mersenne primes "
        "using the Lucas-Lehmer primality test. You can  "
        "find the list of the first N Mersenne primes. return the expired time."
    ),
    tools=[find_mersenne_primes],
)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    model_name = os.getenv("MODEL_NAME", "gemini-2.5-flash")
    logging.info("Using model: %s", model_name)
    PORT = 8101
    a2a_app = to_a2a(root_agent, port=PORT)
    # Use host='0.0.0.0' to allow external access.
    uvicorn.run(a2a_app, host="0.0.0.0", port=PORT)
