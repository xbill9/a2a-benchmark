// server.ts
const express = require("express");
import { v4 as uuidv4 } from "uuid";
import type { AgentCard, Message } from "@a2a-js/sdk";
import {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
  DefaultRequestHandler,
  InMemoryTaskStore,
} from "@a2a-js/sdk/server";
import { A2AExpressApp } from "@a2a-js/sdk/server/express";

const MODEL_NAME = process.env.MODEL_NAME || "Not specified";
console.log(`Agent configured with MODEL_NAME: ${MODEL_NAME}`);

// 1. Define your agent's identity card.
const primeAgentCard: AgentCard = {
  name: "Mersenne Prime Agent Node",
  description: `A node agent that finds the first X Mersenne primes and reports the elapsed time. Configured with model: ${MODEL_NAME}.`,
  protocolVersion: "0.3.0",
  version: "0.1.0",
  url: "http://0.0.0.0:8103/", // The public URL of your agent server
  skills: [
    {
      id: "find-mersenne-node",
      name: "Find Mersenne Primes in node",
      description: "Finds the first X Mersenne primes in node",
      tags: ["math", "benchmark"]
    }
  ],
  capabilities: {},
  defaultInputModes: [],
  defaultOutputModes: [],
};

// Helper function to check if a number is prime (used for exponents)
function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i = i + 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

// Lucas-Lehmer primality test for Mersenne numbers M_p = 2^p - 1
function isMersennePrime(p: number): boolean {
  if (p === 2) return true;
  const m_p = (1n << BigInt(p)) - 1n;
  let s = 4n;
  for (let i = 0; i < p - 2; i++) {
    s = ((s * s) - 2n) % m_p;
  }
  return s === 0n;
}

function findMersennePrimes(count: number): bigint[] {
  const primes: bigint[] = [];
  let p = 2;
  while (primes.length < count) {
    if (isPrime(p) && isMersennePrime(p)) {
      primes.push((1n << BigInt(p)) - 1n);
    }
    p++;
  }
  return primes;
}

// 2. Implement the agent's logic.
class PrimeExecutor implements AgentExecutor {
  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    // Default to 5 if not specified
    let count = 5;

    // Attempt to parse 'x' from the incoming message text
    if (requestContext.userMessage && requestContext.userMessage.parts) {
      for (const part of requestContext.userMessage.parts) {
        if (part.kind === "text") {
          // Look for a number in the text
          const match = part.text.match(/(\d+)/);
          if (match) {
            const parsed = parseInt(match[1], 10);
            if (!isNaN(parsed) && parsed > 0) {
              count = parsed;
            }
            break; // Stop after finding the first number
          }
        }
      }
    }

    console.log(`Starting search for first ${count} Mersenne primes...`);
    const startTime = performance.now();
    
    const primes = findMersennePrimes(count);
    
    const endTime = performance.now();
    const elapsed = endTime - startTime;
    
    console.log(`Found ${primes.length} primes in ${elapsed.toFixed(2)}ms`);

    // Create a direct message response.
    const responseMessage: Message = {
      kind: "message",
      messageId: uuidv4(),
      role: "agent",
      parts: [
        {
          kind: "text", 
          text: `Found first ${count} Mersenne primes in ${elapsed.toFixed(2)}ms.` 
        }
      ],
      // Associate the response with the incoming request's context.
      contextId: requestContext.contextId,
    };

    // Publish the message and signal that the interaction is finished.
    eventBus.publish(responseMessage);
    eventBus.finished();
  }
  
  cancelTask = async (): Promise<void> => {};
}

// 3. Set up and run the server.
const agentExecutor = new PrimeExecutor();
const requestHandler = new DefaultRequestHandler(
  primeAgentCard,
  new InMemoryTaskStore(),
  agentExecutor
);

const appBuilder = new A2AExpressApp(requestHandler);
const expressApp = appBuilder.setupRoutes(express());

expressApp.listen(8103, () => {
  console.log(`🚀 Server started on http://localhost:8103`);
});
