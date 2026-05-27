# Gemini Workspace for `a2a-benchmark`

You are an expert Python and multi-language Agent Developer working with A2A (Agent-to-Agent) benchmarks. This workspace contains benchmarking agents written in Python, Go, Node.js (TypeScript), and Rust, orchestrated by a Master Coordinator Agent.

## Multi-Language Agent Development Guidelines

When modifying or expanding the benchmark suite, adhere to the following language-specific guidelines:

### 1. Python (`benchmark-python`)
- **Coding Style**: Indentation of 2 spaces, maximum 80 characters line length.
- **Autoformatting**: Run `./autoformat.sh` before committing Python changes.
- **Agent Structure**: Follow the convention where `agent.py` exposes a `root_agent` or `app`.
- **Framework**: Use the standard Python Agent Development Kit (`google-adk`).

### 2. Go (`benchmark-go`)
- **Coding Style**: Use `gofmt` to format all code. Use standard unexported/exported naming conventions.
- **Error Handling**: Handle all errors explicitly using `if err != nil`.
- **Framework**: Built using the Go implementation of ADK (`google.golang.org/adk`). Expose endpoints using the ADK launcher.

### 3. Node.js / TypeScript (`benchmark-node`)
- **Coding Style**: Use standard ESLint/Prettier rules.
- **Framework**: Use the A2A JS SDK (`@a2a-js/sdk/server` and `@a2a-js/sdk/server/express`) to build and expose the A2A express endpoints.

### 4. Rust (`benchmark-rust`)
- **Coding Style**: Follow standard Rust naming and formatting conventions (`cargo fmt`).
- **Framework**: Rust implements a lightweight JSON-RPC agent handler manually using `axum` and `num_bigint` (to calculate Mersenne prime values with large numbers), running on port `8104`.

---

## Agent Specifications & Port Configuration

| Agent Name | Language | Port | Protocol Endpoint |
|---|---|---|---|
| `master_agent` | Python | `8100` | FastMCP Server / JSON-RPC |
| `python_agent` | Python | `8101` | A2A Well-Known / JSON-RPC |
| `go_agent` | Go | `8102` | A2A Well-Known / JSON-RPC |
| `node_agent` | TypeScript | `8103` | A2A Well-Known / JSON-RPC |
| `rust_agent` | Rust | `8104` | A2A Well-Known / JSON-RPC |

---

## Development & Execution Commands

### environment setup
Before running any script, initialize and source the environment variables:
```bash
./init.sh
source set_env.sh
```

### Running Language Benchmarks
- Python: `./bench-python.sh` (runs `benchmark-python/agents/bench_python/agent.py`)
- Go: `./bench-go.sh` (runs Go agent)
- Node: `./bench-node.sh` (runs Node/TS agent)
- Rust: `./bench-rust.sh` (runs Rust agent)
- Master Coordinator: `./bench-master.sh` (runs the orchestration agent)

### Testing Rust Agent
Verify the Rust implementation's A2A JSON-RPC interface with:
```bash
./test-rust.sh
```

## Useful Links
- ADK Python Repository: https://github.com/google/adk-python
- ADK Documentation: https://google.github.io/adk-docs/
