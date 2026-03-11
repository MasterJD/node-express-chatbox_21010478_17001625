# node-express-chatbox — Makefile
# Usage:
#   make setup   — full first-time setup (install deps, create .env, ready to run)
#   make dev     — start dev server with hot-reload
#   make start   — start production server
#   make clean   — remove node_modules

.PHONY: setup dev start clean check-node env deps

# ── Primary target ──────────────────────────────────────────

## setup: Full first-time project bootstrap
setup: check-node env deps
	@echo ""
	@echo "========================================="
	@echo "  Setup complete!"
	@echo "  Run 'make dev' to start the dev server"
	@echo "  Then open http://localhost:3001"
	@echo "========================================="

# ── Sub-targets ─────────────────────────────────────────────

## check-node: Verify Node.js is installed and meets version requirements
check-node:
	@echo ">> Checking Node.js installation..."
	@node --version > /dev/null 2>&1 || (echo "ERROR: Node.js is not installed. Install from https://nodejs.org" && exit 1)
	@echo "   Node version: $$(node --version)"
	@echo "   npm  version: $$(npm --version)"

## env: Copy .env.example → .env if .env does not exist
env:
	@if [ ! -f .env ]; then \
		echo ">> Creating .env from .env.example..."; \
		cp .env.example .env; \
		echo "   .env created — edit it if you need to change PORT or other settings."; \
	else \
		echo ">> .env already exists, skipping."; \
	fi

## deps: Install all npm dependencies (production + dev)
deps:
	@echo ">> Installing npm dependencies..."
	npm install
	@echo "   Dependencies installed."

# ── Run targets ─────────────────────────────────────────────

## dev: Start the development server with nodemon hot-reload
dev:
	npx nodemon server.js

## start: Start the production server
start:
	node server.js

# ── Utility ─────────────────────────────────────────────────

## clean: Remove node_modules
clean:
	rm -rf node_modules
	@echo "   node_modules removed."
