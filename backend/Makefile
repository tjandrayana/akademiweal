# Backend Makefile — run PostgreSQL (Docker) and the API server.
# Run from repo: make -C backend <target>

BACKEND_ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
COMPOSE_FILE := $(BACKEND_ROOT)/docker-compose.yml
COMPOSE ?= docker compose
MIGRATION_FILES := $(sort $(wildcard $(BACKEND_ROOT)/migrations/*.sql))
PSQL ?= psql

# Match docker-compose postgres service; override for remote DB.
export DB_HOST ?= localhost
export DB_PORT ?= 5432
export DB_USER ?= postgres
export DB_PASSWORD ?= postgres
export DB_NAME ?= akademiweal
export DB_SSLMODE ?= disable

.DEFAULT_GOAL := help

.PHONY: help db db-up db-down db-reset migrate migrate-file run server dev

help:
	@echo "Targets:"
	@echo "  make db       Start PostgreSQL (docker compose, waits until healthy)"
	@echo "  make db-down  Stop and remove postgres container"
	@echo "  make db-reset Stop postgres and DELETE data volume (fixes wrong password after compose changes)"
	@echo "  make migrate  Apply backend/migrations/*.sql in order (uses psql if installed, else docker compose exec)"
	@echo "  make migrate-file FILE=013_backfill_lesson_explanations.sql  Apply one migration file"
	@echo "  make run      Run API on :9001 (requires DB reachable)"
	@echo "  make server   Same as run"
	@echo "  make dev      Start DB then run the server"

db db-up:
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --wait

db-down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

db-reset:
	$(COMPOSE) -f $(COMPOSE_FILE) down -v

# Apply SQL migrations in lexical order (001_, 002_, …).
# Uses host `psql` when available; otherwise pipes SQL into `psql` inside the postgres container (run `make db` first).
migrate:
	@if [ -z "$(MIGRATION_FILES)" ]; then echo "No files in migrations/"; exit 1; fi
	@set -e; \
	if command -v psql >/dev/null 2>&1; then \
		echo "Using local psql"; \
		for f in $(MIGRATION_FILES); do \
			echo "Applying $$f ..."; \
			PGPASSWORD="$(DB_PASSWORD)" $(PSQL) -h "$(DB_HOST)" -p "$(DB_PORT)" -U "$(DB_USER)" -d "$(DB_NAME)" \
				-v ON_ERROR_STOP=1 -f "$$f"; \
		done; \
	else \
		echo "psql not on PATH; using Docker (postgres service). Ensure the DB is up: make db"; \
		if ! $(COMPOSE) -f $(COMPOSE_FILE) exec -T postgres true 2>/dev/null; then \
			echo "Error: cannot exec into postgres container. Start Postgres with: make db"; \
			exit 1; \
		fi; \
		for f in $(MIGRATION_FILES); do \
			echo "Applying $$f ..."; \
			cat "$$f" | $(COMPOSE) -f $(COMPOSE_FILE) exec -T postgres \
				psql -U "$(DB_USER)" -d "$(DB_NAME)" -v ON_ERROR_STOP=1; \
		done; \
	fi
	@echo "Done."

# Apply a single SQL migration file by name or path.
# Examples:
#   make migrate-file FILE=013_backfill_lesson_explanations.sql
#   make migrate-file FILE=backend/migrations/013_backfill_lesson_explanations.sql
migrate-file:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make migrate-file FILE=<filename.sql|path.sql>"; \
		exit 1; \
	fi
	@set -e; \
	if [ -f "$(FILE)" ]; then \
		_target="$(FILE)"; \
	elif [ -f "$(BACKEND_ROOT)/migrations/$(FILE)" ]; then \
		_target="$(BACKEND_ROOT)/migrations/$(FILE)"; \
	else \
		echo "Migration file not found: $(FILE)"; \
		echo "Tip: use a file from backend/migrations/, e.g. FILE=013_backfill_lesson_explanations.sql"; \
		exit 1; \
	fi; \
	echo "Applying $$_target ..."; \
	if command -v psql >/dev/null 2>&1; then \
		echo "Using local psql"; \
		PGPASSWORD="$(DB_PASSWORD)" $(PSQL) -h "$(DB_HOST)" -p "$(DB_PORT)" -U "$(DB_USER)" -d "$(DB_NAME)" \
			-v ON_ERROR_STOP=1 -f "$$_target"; \
	else \
		echo "psql not on PATH; using Docker (postgres service). Ensure the DB is up: make db"; \
		if ! $(COMPOSE) -f $(COMPOSE_FILE) exec -T postgres true 2>/dev/null; then \
			echo "Error: cannot exec into postgres container. Start Postgres with: make db"; \
			exit 1; \
		fi; \
		$(COMPOSE) -f $(COMPOSE_FILE) exec -T postgres \
			psql -U "$(DB_USER)" -d "$(DB_NAME)" -v ON_ERROR_STOP=1 < "$$_target"; \
	fi
	@echo "Done."

run server:
	cd $(BACKEND_ROOT) && go run ./cmd

dev: db
	cd $(BACKEND_ROOT) && go run ./cmd
