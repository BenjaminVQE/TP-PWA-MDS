.PHONY: help install dev prod stop logs build-dev build-prod

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev        - Start development environment (hot-reload)"
	@echo "  make prod       - Start production environment"
	@echo "  make stop       - Stop all containers"
	@echo "  make logs       - View container logs"
	@echo "  make build-dev  - Rebuild development image"
	@echo "  make build-prod - Rebuild production image"
	@echo "  make install    - Initial setup (builds both)"

# Development (Hot Reload)
dev:
	docker compose -f compose.dev.yml up -d

build-dev:
	docker compose -f compose.dev.yml up -d --build

# Production
prod:
	docker compose -f compose.yml up -d

build-prod:
	docker compose -f compose.yml up -d --build

# Utilities
stop:
	docker compose -f compose.yml down
	docker compose -f compose.dev.yml down

logs:
	docker compose -f compose.dev.yml logs -f || docker compose -f compose.yml logs -f

install: build-dev build-prod
	@echo "Installation complete. Run 'make dev' or 'make prod' to start."
