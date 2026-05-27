#!/bin/bash
# check-and-start-agents.sh - Check if the language agents and master agent are running, and start them if they are not.

# Exit on command errors
set -e

# Change directory to the workspace root where the script resides
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$WORKSPACE_ROOT"

echo "=== Sourcing Environment Setup ==="
if [ -f "./set_env.sh" ]; then
    source ./set_env.sh
else
    echo "Warning: set_env.sh not found in $WORKSPACE_ROOT"
fi

# Define check function
check_agent() {
    local name=$1
    local port=$2
    local path=$3
    local url="http://127.0.0.1:${port}${path}"
    
    if curl -s -o /dev/null --connect-timeout 2 "${url}"; then
        return 0 # Running and responsive
    else
        return 1 # Not running or not responsive
    fi
}

# Define agents: name, port, check_path, startup_script
agents=(
    "master_agent:8100:/:bench-master.sh"
    "python_agent:8101:/.well-known/agent-card.json:bench-python.sh"
    "go_agent:8102:/.well-known/agent-card.json:bench-go.sh"
    "node_agent:8103:/.well-known/agent-card.json:bench-node.sh"
    "rust_agent:8104:/.well-known/agent-card.json:bench-rust.sh"
)

failed=0

echo "=== Checking & Starting Agents ==="
for agent_info in "${agents[@]}"; do
    IFS=":" read -r name port path startup_script <<< "$agent_info"
    
    echo "Checking ${name} on port ${port}..."
    if check_agent "${name}" "${port}" "${path}"; then
        echo "✅ ${name} is already running."
    else
        echo "❌ ${name} is not running. Starting it..."
        log_file="${name}.log"
        
        # Start in the background and redirect logs
        nohup "./${startup_script}" > "${log_file}" 2>&1 &
        
        # Wait and poll for agent availability
        echo -n "Waiting for ${name} to become available"
        success=false
        
        # We give node/rust/go agents up to 30 seconds to start (since Go/Rust might compile or Node might run npm install/build)
        for i in {1..30}; do
            if check_agent "${name}" "${port}" "${path}"; then
                echo " - Active!"
                success=true
                break
            fi
            echo -n "."
            sleep 1
        done
        
        if [ "$success" = false ]; then
            echo -e "\nError: ${name} failed to start. Logs from ${log_file}:"
            echo "--------------------------------------------------------"
            tail -n 25 "${log_file}" 2>/dev/null || true
            echo "--------------------------------------------------------"
            failed=1
        fi
    fi
done

if [ $failed -eq 0 ]; then
    echo "=== All agents are active and responsive! ==="
    exit 0
else
    echo "=== Some agents failed to start! ==="
    exit 1
fi
