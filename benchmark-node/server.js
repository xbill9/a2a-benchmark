"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const express = require("express");
const uuid_1 = require("uuid");
const server_1 = require("@a2a-js/sdk/server");
const express_1 = require("@a2a-js/sdk/server/express");
// 1. Define your agent's identity card.
const primeAgentCard = {
    name: "Prime Number Agent",
    description: "A simple agent that generates a prime number.",
    protocolVersion: "0.3.0",
    version: "0.1.0",
    url: "http://0.0.0.0:8091/", // The public URL of your agent server
    skills: [{ id: "generate-prime", name: "Generate Prime", description: "Generate a prime number", tags: ["math"] }],
    capabilities: {},
    defaultInputModes: [],
    defaultOutputModes: [],
    // --- Other AgentCard fields omitted for brevity ---
};
// Helper function to check if a number is prime
function isPrime(num) {
    if (num <= 1)
        return false;
    if (num <= 3)
        return true;
    if (num % 2 === 0 || num % 3 === 0)
        return false;
    for (let i = 5; i * i <= num; i = i + 6) {
        if (num % i === 0 || num % (i + 2) === 0)
            return false;
    }
    return true;
}
// Helper function to generate a prime number in a given range
function generatePrime(min = 1, max = 1000) {
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
class PrimeExecutor {
    constructor() {
        // cancelTask is not needed for this simple, non-stateful agent.
        this.cancelTask = async () => { };
    }
    async execute(requestContext, eventBus) {
        const prime = generatePrime();
        // Create a direct message response.
        const responseMessage = {
            kind: "message",
            messageId: (0, uuid_1.v4)(),
            role: "agent",
            parts: [{ kind: "text", text: `Here is a prime number: ${prime}` }],
            // Associate the response with the incoming request's context.
            contextId: requestContext.contextId,
        };
        // Publish the message and signal that the interaction is finished.
        eventBus.publish(responseMessage);
        eventBus.finished();
    }
}
// 3. Set up and run the server.
const agentExecutor = new PrimeExecutor();
const requestHandler = new server_1.DefaultRequestHandler(primeAgentCard, new server_1.InMemoryTaskStore(), agentExecutor);
const appBuilder = new express_1.A2AExpressApp(requestHandler);
const expressApp = appBuilder.setupRoutes(express());
expressApp.listen(8091, () => {
    console.log(`🚀 Server started on http://localhost:8091`);
});
