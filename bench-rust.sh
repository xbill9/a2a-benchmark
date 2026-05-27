#!/bin/bash
cd "$(dirname "$0")/benchmark-rust"

echo "Current directory: $(pwd)"
echo "Starting Rust benchmark agent..."
cargo run --release
