# AI Coding Assistant Context - `a2a-benchmark`

This document provides context for AI coding assistants (Claude Code, Gemini CLI, GitHub Copilot, Cursor, etc.) to understand the `a2a-benchmark` project and assist with development.

## Project Overview

The `a2a-benchmark` project is a multi-language performance benchmarking suite designed to measure and compare Agent-to-Agent (A2A) protocol communication and tool execution times. 

Each target language implements a tool to calculate the first $N$ Mersenne primes using the Lucas-Lehmer test. A **Master Coordinator Agent** delegates calls to these agents, benchmarks the time taken, and compares execution times.

### Source Structure

```
a2a-benchmark/
├── benchmark-python/     # Python benchmark agents
│   └── agents/
│       ├── bench_python/ # Target Python prime-calculating agent
│       └── bench_master/ # Master coordinator agent (FastMCP tool server)
├── benchmark-go/         # Go benchmark agent (using Go ADK implementation)
├── benchmark-node/       # Node.js/TypeScript benchmark agent (using @a2a-js/sdk)
├── benchmark-rust/       # Rust benchmark agent (using axum & num_bigint)
├── requirements.txt      # Python dependencies for the workspace
├── pyproject.toml        # Workspace metadata (formerly a2a-hello-world)
└── *.sh                  # Automation/execution helper scripts
```

## Agent Network and Port Configuration

All agents run locally and communicate via HTTP JSON-RPC using the A2A protocol.

| Agent Identity | Language | Port | Type / Details |
|---|---|---|---|
| `master_agent` | Python | `8100` | FastMCP Server / Coordinator |
| `python_agent` | Python | `8101` | A2A remote agent endpoint |
| `go_agent` | Go | `8102` | A2A remote agent endpoint |
| `node_agent` | TypeScript | `8103` | A2A remote agent endpoint |
| `rust_agent` | Rust | `8104` | A2A remote agent endpoint |

---

## Development & Testing Workflow

### 1. Sourcing Environment
Before running agents or scripts:
```bash
./init.sh
source set_env.sh
```

### 2. Launching Agents
- **Python target**: `./bench-python.sh` (runs python agent on port 8101)
- **Go target**: `./bench-go.sh` (runs Go agent on port 8102)
- **Node target**: `./bench-node.sh` (runs Node agent on port 8103)
- **Rust target**: `./bench-rust.sh` (runs Rust agent on port 8104)
- **Master**: `./bench-master.sh` (runs Master coordinator agent on port 8100)

### 3. Verification Scripts
You can run automated tests to check the Rust agent's A2A RPC server:
```bash
./test-rust.sh
```

### 4. Code Standards
- **Python**: Follow standard PEP 8 rules. Run `./autoformat.sh` before committing changes.
- **Go**: Always run `gofmt` to format files.
- **Node**: Run TS/ESLint checks.
- **Rust**: Run `cargo fmt` and `cargo test`.
