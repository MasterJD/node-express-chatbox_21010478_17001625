#!/usr/bin/env bash
# ===========================================================
# setup.sh — node-express-chatbox bootstrap script
# ===========================================================
# Handles runtime version checks, dependency installation,
# and environment bootstrap with clear error messages.
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh
# ===========================================================

set -euo pipefail

# ── Colours (disabled if not a terminal) ────────────────────
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  NC='\033[0m'
else
  RED='' GREEN='' YELLOW='' NC=''
fi

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
fail()  { error "$*"; exit 1; }

# ── 1. Check Node.js ───────────────────────────────────────
info "Checking Node.js installation..."

if ! command -v node &> /dev/null; then
  fail "Node.js is not installed.
       Install it from https://nodejs.org or use nvm:
         curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
         nvm install 18"
fi

NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 14 ]; then
  fail "Node.js v$NODE_VERSION is too old. This project requires Node >= 14.
       Current: v$NODE_VERSION
       Run: nvm install 18"
fi

if [ "$NODE_MAJOR" -ge 23 ]; then
  warn "Node.js v$NODE_VERSION is newer than tested versions (14–22).
       The app may work, but consider using Node 18 LTS if you hit issues."
fi

info "Node.js v$NODE_VERSION — OK"

# ── 2. Check npm ───────────────────────────────────────────
info "Checking npm..."

if ! command -v npm &> /dev/null; then
  fail "npm is not installed. It should come with Node.js.
       Re-install Node.js from https://nodejs.org"
fi

info "npm $(npm --version) — OK"

# ── 3. Environment file ───────────────────────────────────
info "Setting up environment variables..."

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    info ".env created from .env.example"
    info "Edit .env to change PORT or other settings if needed."
  else
    fail ".env.example not found. Is this the project root?"
  fi
else
  info ".env already exists — skipping."
fi

# ── 4. Install dependencies ───────────────────────────────
info "Installing npm dependencies..."

npm install

if [ $? -eq 0 ]; then
  info "Dependencies installed successfully."
else
  fail "npm install failed. Check the output above for errors."
fi

# ── 5. Summary ─────────────────────────────────────────────
echo ""
echo "========================================="
echo "  Setup complete!"
echo ""
echo "  To start the dev server:"
echo "    npm run dev"
echo "  Or:"
echo "    make dev"
echo ""
echo "  Then open http://localhost:$(grep -E '^PORT=' .env 2>/dev/null | cut -d= -f2 || echo 3001)"
echo "========================================="
