.PHONY: help run build test clean install dev

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	go mod download
	go mod tidy

run: ## Run the application
	go run main.go

dev: ## Run with hot reload (requires air)
	air

build: ## Build the application
	go build -o bin/api main.go

test: ## Run tests
	go test -v ./...

test-coverage: ## Run tests with coverage
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out

clean: ## Clean build artifacts
	rm -rf bin/
	rm -rf tmp/
	rm -f coverage.out

fmt: ## Format code
	go fmt ./...

vet: ## Run go vet
	go vet ./...

lint: ## Run golangci-lint (requires golangci-lint)
	golangci-lint run

docker-build: ## Build docker image
	docker build -t ato-api .

docker-run: ## Run docker container
	docker run -p 8080:8080 --env-file .env ato-api
