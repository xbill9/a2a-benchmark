# Makefile for the Node.js TypeScript project

# Variables
SERVICE_NAME := poly-node
REGION := us-central1
PROJECT_ID := $(shell gcloud config get-value project) # Cache project ID
APP_DIR := .

.PHONY: all build run clean release test format check-fmt lint check deps docker-build deploy help

# The default target
all: build

# Build the project for development
build:
	@echo "Building the TypeScript project..."
	@npm run build

# Run the project
run:
	@echo "Running the Node.js project..."
	@npm start

# Clean the project
clean:
	@echo "Cleaning the project..."
	@rm -rf dist

# Build the project for release
release: build

# Run tests
test:
	@echo "Running tests..."
	@npm test

# Format the code
format:
	@echo "Formatting code..."
	@npm run format

# Check formatting
check-fmt:
	@echo "Checking formatting..."
	@npm run check-fmt

# Lint the code
lint:
	@echo "Linting code..."
	@npm run lint

# Check the code
check: lint check-fmt

# Update dependencies
deps:
	@echo "Installing dependencies..."
	@npm install

# Build the Docker image
docker-build:
	@echo "Building the Docker image..."
	@docker build -t gcr.io/$(PROJECT_ID)/$(SERVICE_NAME):latest .

# Submit the build to Google Cloud Build
deploy:
	@echo "Submitting build to Google Cloud Build..."
	@gcloud builds submit . --config cloudbuild.yaml

help:
	@echo "Makefile for the Node.js TypeScript project"
	@echo ""
	@echo "Usage:"
	@echo "    make <target>"
	@echo ""
	@echo "Targets:"
	@echo "    all          (default) same as 'build'"
	@echo "    build        Build the project for development"
	@echo "    run          Run the project"
	@echo "    clean        Clean the project"
	@echo "    release      Build the project for release"
	@echo "    test         Run tests"
	@echo "    format       Format the code"
	@echo "    check-fmt    Check code formatting"
	@echo "    lint         Lint the code"
	@echo "    check        Alias for lint and check-fmt"
	@echo "    deps         Install dependencies"
	@echo "    docker-build Build the Docker image"
	@echo "    deploy       Submit the build to Google Cloud Build"
