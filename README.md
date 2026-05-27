# A2A Multi-Language Performance Benchmark

This project serves as a performance benchmarking suite to measure and compare Agent-to-Agent (A2A) protocol communication and tool execution performance across multiple programming languages: **Python**, **Go**, **Node.js (TypeScript)**, and **Rust**.

The benchmark runs an agent in each language that implements a tool to calculate the first $N$ Mersenne primes using the Lucas-Lehmer primality test. A central **Master Coordinator Agent** orchestrates runs from $N = 1$ to $N = 20$ (or higher) across the language agents to measure performance and capture execution time.

## Project Architecture

The suite consists of the following components:

- **Master Coordinator Agent (Python)**: Orchestrates benchmarks by calling sub-agents via the A2A protocol and measuring execution times. Exposes a FastMCP interface on port `8100`.
- **Python Benchmark Agent**: Calculates Mersenne primes using the Lucas-Lehmer test, exposed as an A2A app on port `8101`.
- **Go Benchmark Agent**: Calculates Mersenne primes, built with the Go implementation of ADK, running on port `8102`.
- **Node.js Benchmark Agent**: Written in TypeScript using `@a2a-js/sdk`, running on port `8103`.
- **Rust Benchmark Agent**: Written in Rust using the `axum` web framework and `num_bigint` crate, running on port `8104`.

### Port Mappings

| Component / Agent | Language | Port | Type |
|---|---|---|---|
| Master Coordinator | Python | `8100` | FastMCP Server / Coordinator |
| Python Agent | Python | `8101` | A2A Endpoint |
| Go Agent | Go | `8102` | A2A Endpoint |
| Node.js Agent | TypeScript | `8103` | A2A / Express Endpoint |
| Rust Agent | Rust | `8104` | A2A / Axum JSON-RPC Endpoint |

---

## Getting Started

### 1. Initialization
Run the initialization script to set up your Google Cloud Project ID and Gemini API Key:
```bash
./init.sh
```

### 2. Sourcing Environment
Source the environment variables required for running the benchmarks:
```bash
source set_env.sh
```

---

## Running the Agents

You can run each agent individually in separate terminals:

### Python Benchmark Agent
Runs the target Python prime calculation agent:
```bash
./bench-python.sh
```

### Go Benchmark Agent
Runs the Go benchmark agent:
```bash
./bench-go.sh
```

### Node.js Benchmark Agent
Runs the Node.js/TypeScript benchmark agent:
```bash
./bench-node.sh
```

### Rust Benchmark Agent
Runs the Rust benchmark agent:
```bash
./bench-rust.sh
```

### Master Coordinator Agent
Runs the coordinator master agent that delegates tasks and benchmarks the other agents:
```bash
./bench-master.sh
```

---

## Verification & Testing

To quickly verify that the Rust agent is functional and responding to A2A requests:
```bash
./test-rust.sh
```

---

## Results Visualization

The benchmark results can be plotted using:
```bash
python plot_primes.py
```
This generates `prime_calculation_times.png`. Existing benchmarking comparison plots are saved as:
- `benchmark_performance.png` (General comparison)
- `benchmark_performance_15-20.png` (Comparison for larger counts)
