# Akademiweal — run database, backend API, and frontend dev server.
# Requires: Docker (for Postgres), Go 1.22+, Node/npm (for Vite).

REPO_ROOT := $(abspath .)
BACKEND_DIR := $(REPO_ROOT)/backend
FRONTEND_DIR := $(REPO_ROOT)/frontend

.DEFAULT_GOAL := help

.PHONY: help db db-down db-reset migrate backend frontend dev dev-all install install-frontend install-backend

help:
	@echo "Akademiweal — common targets"
	@echo ""
	@echo "  make db          Start PostgreSQL (Docker, waits until healthy)"
	@echo "  make db-down     Stop PostgreSQL container"
	@echo "  make db-reset    Stop Postgres and remove data volume (use if password/auth fails)"
	@echo "  make migrate     Apply backend/migrations/*.sql (psql or Docker; run make db first if using Docker)"
	@echo "  make backend     Run API on http://localhost:9001 (needs DB)"
	@echo "  make frontend    Run Vite dev server (proxies /api → backend)"
	@echo "  make dev         Start DB, then API (one terminal)"
	@echo "  make dev-all     Start DB, then API + Vite together (Ctrl+C stops both)"
	@echo ""
	@echo "  make install     npm install + go mod download"
	@echo ""
	@echo "Database env (optional): DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME DB_SSLMODE"
	@echo "Backend also uses JWT_SECRET (optional; dev default if unset)"

db:
	$(MAKE) -C $(BACKEND_DIR) db

db-down:
	$(MAKE) -C $(BACKEND_DIR) db-down

db-reset:
	$(MAKE) -C $(BACKEND_DIR) db-reset

migrate:
	$(MAKE) -C $(BACKEND_DIR) migrate

backend:
	$(MAKE) -C $(BACKEND_DIR) run

frontend:
	cd $(FRONTEND_DIR) && npm run dev

# Database + API only (open a second terminal for: make frontend)
dev:
	$(MAKE) -C $(BACKEND_DIR) dev

# Full stack: Postgres + Go (:9001) + Vite (default :5173)
dev-all: db
	@set -e; \
	cd $(BACKEND_DIR) && go run ./cmd & PID1=$$!; \
	cd $(FRONTEND_DIR) && npm run dev & PID2=$$!; \
	trap 'kill $$PID1 $$PID2 2>/dev/null' EXIT INT TERM; \
	wait

install: install-frontend install-backend

install-frontend:
	cd $(FRONTEND_DIR) && npm install

install-backend:
	cd $(BACKEND_DIR) && go mod download
