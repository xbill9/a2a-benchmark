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

// 1. Define your agent's identity card.
const primeAgentCard: AgentCard = {
  name: "Prime Number Agent",
  description: "A simple agent that generates a prime number.",
  protocolVersion: "0.3.0",
  version: "0.1.0",
  url: "http://0.0.0.0:8091/", // The public URL of your agent server
  skills: [ { id: "generate-prime", name: "Generate Prime", description: "Generate a prime number", tags: ["math"] } ],
  capabilities: {},
  defaultInputModes: [],
  defaultOutputModes: [],
  // --- Other AgentCard fields omitted for brevity ---
};

// Helper function to check if a number is prime
function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i = i + 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

// Helper function to generate a prime number in a given range
function generatePrime(min = 1, max = 1000): number {
  let prime = Math.floor(Math.random() * (max - min + 1)) + min;
  while (!isPrime(prime)) {
    prime++;
    if (prime > max) { // restart if we go past the max
        prime = min;
    }
  }
  return prime;
}

// 2. Implement the agent's logic.
class PrimeExecutor implements AgentExecutor {
  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const prime = generatePrime();
    // Create a direct message response.
    const responseMessage: Message = {
      kind: "message",
      messageId: uuidv4(),
      role: "agent",
      parts: [{ kind: "text", text: `Here is a prime number: ${prime}` }],
      // Associate the response with the incoming request's context.
      contextId: requestContext.contextId,
    };

    // Publish the message and signal that the interaction is finished.
    eventBus.publish(responseMessage);
    eventBus.finished();
  }
  
  // cancelTask is not needed for this simple, non-stateful agent.
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

expressApp.listen(8091, () => {
  console.log(`🚀 Server started on http://localhost:8091`);
});
