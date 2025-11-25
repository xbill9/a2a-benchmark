# Makefile for testapp.py

.PHONY: all run build test lint format status pull push clean docs

# Variables
COUNT ?= 10

all: test lint

# Target to run the application
run:
	@echo "Running the application..."
	@python src/agents/a2a_hello_world/agent.py $(COUNT)

# Target to build the application (placeholder)
build:
	@echo "Building the application..."
	@echo "No build steps defined for this project."

# Target to run tests
test:
	@echo "Running tests..."
	@python -m unittest discover src/agents/a2a_hello_world/tests

# Target to lint the code
lint:
	@echo "Linting the code..."
	@flake8 src

# Target to format the code
format:
	@echo "Formatting the code..."
	@black src

# Target to show git status
status:
	@echo "Showing git status..."
	@git status

# Target to pull latest changes from git
pull:
	@echo "Pulling latest changes from git..."
	@git pull

# Target to push changes to git
push:
	@echo "Pushing changes to git..."
	@git push

# Target to generate documentation
docs:
	@echo "Generating documentation..."
	@mkdir -p docs
	@pydoc -w src.agents.a2a_hello_world.agent
	@mv src.agents.a2a_hello_world.agent.html docs/

.PHONY: clean
clean:
	@echo "Cleaning up..."
	@find src -type f -name "*.pyc" -delete
	@find src -type d -name "__pycache__" -exec rm -rf {} +
