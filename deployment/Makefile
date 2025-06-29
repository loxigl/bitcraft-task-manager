.PHONY: dev prod stop clean logs build help

# Development commands
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

dev-detached:
	@echo "Starting development environment in background..."
	docker-compose -f docker-compose.dev.yml up --build -d

dev-logs:
	@echo "Showing development logs..."
	docker-compose -f docker-compose.dev.yml logs -f

dev-stop:
	@echo "Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

dev-clean:
	@echo "Cleaning development environment (removing volumes)..."
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

# Production commands
prod:
	@echo "Starting production environment..."
	docker-compose up --build

prod-detached:
	@echo "Starting production environment in background..."
	docker-compose up --build -d

prod-logs:
	@echo "Showing production logs..."
	docker-compose logs -f

prod-stop:
	@echo "Stopping production environment..."
	docker-compose down

prod-clean:
	@echo "Cleaning production environment (removing volumes)..."
	docker-compose down -v
	docker system prune -f

# General commands
stop:
	@echo "Stopping all environments..."
	docker-compose down || true
	docker-compose -f docker-compose.dev.yml down || true

clean:
	@echo "Cleaning all Docker resources..."
	docker-compose down -v || true
	docker-compose -f docker-compose.dev.yml down -v || true
	docker system prune -af
	docker volume prune -f

build:
	@echo "Building all images..."
	docker-compose build
	docker-compose -f docker-compose.dev.yml build

# Database commands
seed-dev:
	@echo "Seeding development database..."
	docker-compose -f docker-compose.dev.yml exec backend npm run seed

seed-prod:
	@echo "Seeding production database..."
	docker-compose exec backend npm run seed

# Help
help:
	@echo "BitCraft Task Manager - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start development environment"
	@echo "  make dev-detached     - Start development environment in background"
	@echo "  make dev-logs         - Show development logs"
	@echo "  make dev-stop         - Stop development environment"
	@echo "  make dev-clean        - Clean development environment"
	@echo ""
	@echo "Production:"
	@echo "  make prod             - Start production environment"
	@echo "  make prod-detached    - Start production environment in background"
	@echo "  make prod-logs        - Show production logs"
	@echo "  make prod-stop        - Stop production environment"
	@echo "  make prod-clean       - Clean production environment"
	@echo ""
	@echo "General:"
	@echo "  make stop             - Stop all environments"
	@echo "  make clean            - Clean all Docker resources"
	@echo "  make build            - Build all images"
	@echo ""
	@echo "Database:"
	@echo "  make seed-dev         - Seed development database"
	@echo "  make seed-prod        - Seed production database"
	@echo ""
	@echo "  make help             - Show this help message" 