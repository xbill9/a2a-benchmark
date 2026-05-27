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
    exponents = [2, 3, 5, 7, 13, 17, 19, 31, 61, 89, 107, 127, 521, 607, 1279, 2203, 2281, 3217, 4253, 4423, 9689, 9941, 11213, 19937, 21701, 23209]
    
    def is_mersenne_prime(p):
        if p == 2:
            return True
        m_p = (1 << p) - 1
        s = 4
        for _ in range(p - 2):
            s = s * s - 2
            while s > m_p:
                s = (s & m_p) + (s >> p)
            if s == m_p:
                s = 0
        return s == 0

    for i in range(min(count, len(exponents))):
        p = exponents[i]
        if is_mersenne_prime(p):
            mersenne_primes.append(str((1 << p) - 1))
            
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
        "generate the list of the first 'count' Mersenne primes. return the expired time."
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
