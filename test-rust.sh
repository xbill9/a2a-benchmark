#!/bin/bash
# test-rust.sh - Test the Rust A2A agent using curl.

# Exit immediately if a command exits with a non-zero status
set -e

PORT=8104
AGENT_URL="http://localhost:$PORT"

echo "Checking if Rust A2A agent is running on port $PORT..."
LAUNCHED_AGENT=false

# Check if port is open
if ! curl -s --connect-timeout 2 "$AGENT_URL/.well-known/agent-card.json" > /dev/null; then
    echo "Rust agent is not running. Starting it..."
    # Build the agent first
    echo "Building benchmark-rust..."
    (cd benchmark-rust && cargo build)
    
    # Run the agent in the background
    echo "Starting Rust agent in the background..."
    (cd benchmark-rust && cargo run > rust-agent-test.log 2>&1) &
    AGENT_PID=$!
    LAUNCHED_AGENT=true
    
    # Wait for the agent to start
    echo -n "Waiting for agent to become available..."
    for i in {1..15}; do
        if curl -s --connect-timeout 1 "$AGENT_URL/.well-known/agent-card.json" > /dev/null; then
            echo " Active!"
            break
        fi
        echo -n "."
        sleep 1
    done
    
    if ! curl -s --connect-timeout 1 "$AGENT_URL/.well-known/agent-card.json" > /dev/null; then
        echo " Error: Rust agent failed to start. Logs:"
        cat benchmark-rust/rust-agent-test.log
        kill $AGENT_PID 2>/dev/null || true
        exit 1
    fi
else
    echo "Rust agent is already running."
fi

# Cleanup function to kill the agent if we started it
cleanup() {
    if [ "$LAUNCHED_AGENT" = true ]; then
        echo "Stopping Rust agent (PID: $AGENT_PID)..."
        kill $AGENT_PID 2>/dev/null || true
        wait $AGENT_PID 2>/dev/null || true
        rm -f benchmark-rust/rust-agent-test.log
    fi
}
trap cleanup EXIT

# ----------------- TEST 1: Agent Card -----------------
echo "Running Test 1: Fetching Agent Card..."
CARD_RESPONSE=$(curl -s "$AGENT_URL/.well-known/agent-card.json")
echo "Agent Card Response:"
echo "$CARD_RESPONSE" | jq . 2>/dev/null || echo "$CARD_RESPONSE"

if [[ ! "$CARD_RESPONSE" =~ "Mersenne Prime Agent Rust" ]]; then
    echo "❌ Test 1 Failed: Name 'Mersenne Prime Agent Rust' not found in Agent Card!"
    exit 1
fi
echo "✅ Test 1 Passed: Agent Card is valid."

# ----------------- TEST 2: Send Message (Valid) -----------------
echo "Running Test 2: Sending message/send request to calculate 5 Mersenne primes..."

# Construct A2A JSON-RPC request
REQUEST_BODY=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "message/send",
  "params": {
    "message": {
      "kind": "message",
      "messageId": "test-msg-id-123",
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Calculate the first 5 Mersenne primes"
        }
      ],
      "contextId": "test-context-123"
    }
  }
}
EOF
)

RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$REQUEST_BODY" "$AGENT_URL/")
echo "Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

if [[ ! "$RESPONSE" =~ "Found first 5 Mersenne primes" ]]; then
    echo "❌ Test 2 Failed: Response does not contain expected prime calculation output!"
    exit 1
fi
echo "✅ Test 2 Passed: Successfully calculated primes."

# ----------------- TEST 3: Invalid Method -----------------
echo "Running Test 3: Sending invalid RPC method..."

INVALID_REQUEST_BODY=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "invalid/method",
  "params": {
    "message": {
      "kind": "message",
      "messageId": "test-msg-id-123",
      "role": "user",
      "parts": []
    }
  }
}
EOF
)

ERROR_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$INVALID_REQUEST_BODY" "$AGENT_URL/")
echo "Error Response:"
echo "$ERROR_RESPONSE" | jq . 2>/dev/null || echo "$ERROR_RESPONSE"

if [[ ! "$ERROR_RESPONSE" =~ "Method not found" ]]; then
    echo "❌ Test 3 Failed: Invalid method was not rejected with 'Method not found'!"
    exit 1
fi
echo "✅ Test 3 Passed: Invalid method was rejected successfully."

echo "All tests passed successfully!"
