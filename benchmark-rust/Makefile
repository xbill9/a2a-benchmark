# Makefile for the Rust project

# Variables
SERVICE_NAME := bench-rust
APP_DIR := .

.PHONY: all build run clean format check-fmt test deps help

# The default target
all: build

# Build the project for development
build:
	@echo "Building the Rust project..."
	@cargo build

# Run the project
run:
	@echo "Running the Rust project..."
	@cargo run

# Clean the project
clean:
	@echo "Cleaning the project..."
	@cargo clean

# Run tests
test:
	@echo "Running tests..."
	@cargo test

# Format the code
format:
	@echo "Formatting code..."
	@cargo fmt

# Check formatting
check-fmt:
	@echo "Checking formatting..."
	@cargo fmt -- --check

# Install/update dependencies
deps:
	@echo "Checking cargo dependencies..."
	@cargo check
