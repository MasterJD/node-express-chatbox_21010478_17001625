# GOLDEN_PATH.md — Deliverable 2

**Author:** Platform Engineering Squad  
**Date:** 2026-03-10  
**Repo:** node-express-chatbox_21010478_17001625

---

## Overview

This document describes the artifacts produced to eliminate every blocker and friction point identified in [DELIVERABLE-1-The-Pain-Audit/PAIN_LOG.md](../DELIVERABLE-1-The-Pain-Audit/PAIN_LOG.md). The goal is to give any new engineer a **one-command setup** and a clean, working codebase.

---

## Artifacts Produced

| Artifact | Purpose |
|---|---|
| **`.env.example`** | Documents every required environment variable with inline comments and sensible defaults |
| **`Makefile`** | Provides `make setup` (install deps, copy env, verify Node), `make dev`, `make start`, `make clean` |
| **`setup.sh`** | Shell script with runtime version checks, dependency install, and environment bootstrap with clear error messages |
| **`.nvmrc`** | Pins recommended Node version (18) for nvm users |
| **`server.js` (modified)** | Fixed deprecated `sendfile` → `sendFile`, added `dotenv` support, configurable `PORT` via env var |
| **`package.json` (modified)** | Fixed `main` field, added `start`/`dev` scripts, `engines` field, `nodemon` as devDependency, `dotenv` as dependency |
| **`public/js/chat.js` (modified)** | Fixed XSS vulnerability (sanitize all user input before `innerHTML`), replaced hardcoded `localhost:3001` with `window.location.origin` |

---

## Pain Point → Artifact Mapping

| Pain # | Description | Artifact That Fixes It | Status |
|---|---|---|---|
| 1 | **VERSION_HELL** — No Node version specified | `.nvmrc`, `engines` in `package.json` | **Fixed** |
| 2 | **IMPLICIT_DEP** — Global nodemon required | `nodemon` added as devDependency, `npm run dev` script | **Fixed** |
| 3 | **MISSING_DOC** — `main` is `index.js`, no `start` script | `package.json` corrected: `main: server.js`, `start`/`dev` scripts added | **Fixed** |
| 4 | **MISSING_DOC** — Hardcoded port 3001, no env var | `PORT` env var in `server.js` via `dotenv`, documented in `.env.example` | **Fixed** |
| 5 | **ENV_GAP** — No `.env.example`, no configurable vars | `.env.example` created with all variables documented | **Fixed** |
| 6 | **IMPLICIT_DEP** — CDN resources with no fallback/integrity | — | **Out of Scope** — Bundling CDN assets locally is a larger migration (requires a build tool like Webpack/Vite). Documented as known risk. |
| 7 | **BROKEN_CMD** — `response.sendfile()` deprecated | `server.js` changed to `response.sendFile()` | **Fixed** |
| 8 | **SILENT_FAIL** — 16 npm audit vulnerabilities | `setup.sh` warns on audit; full fix requires major version bumps of `socket.io` and `express` | **Partial** — Dependencies remain at original semver ranges; a full upgrade is a separate effort |
| 9 | **MISSING_DOC** — No instructions to open browser | `Makefile` and `setup.sh` both print the URL to open after setup | **Fixed** |
| 10 | **MISSING_DOC** — No runnable tests, misleading "Tests" section | — | **Out of Scope** — Writing a test suite is a separate effort beyond bootstrap tooling |
| 11 | **SILENT_FAIL** — XSS via unsanitized `innerHTML` | `chat.js` now sanitizes all user-supplied data (`data.name`, `data.message`, `data.id`, `data.previousName`, `data.newName`) through a `sanitize()` helper before inserting into DOM | **Fixed** |
| 12 | **VERSION_HELL** — Outdated dependencies | — | **Partial** — `engines` field guards against incompatible Node versions; full dependency upgrades (Socket.IO 4.x, Express 5.x) are a separate migration |
| 13 | **MISSING_DOC** — No linter or code style config | — | **Out of Scope** — Adding ESLint/Prettier is a separate tooling decision |
| 14 | **MISSING_DOC** — Screenshots use absolute GitHub URLs | — | **Out of Scope** — Cosmetic README fix, not a setup blocker |
| 15 | **IMPLICIT_DEP** — No `package-lock.json` in VCS | `npm install` during `make setup` / `setup.sh` generates it; should be committed | **Partial** — Lock file is generated but committing it is a VCS workflow choice |

---

## AI Prompts Used

| # | What Was Asked | What It Produced |
|---|---|---|
| 1 | Provided the full PAIN_LOG.md as context and asked the AI to generate a `.env.example`, a `Makefile` with a `make setup` target, and a `setup.sh` bootstrap script that address every friction point from the pain log | First drafts of all three artifacts, plus suggestions for code fixes to `server.js`, `package.json`, and `chat.js` |
| 2 | Asked the AI to fix the XSS vulnerability in `chat.js` by sanitizing all user input rendered via `innerHTML` | A `sanitize()` helper function using DOM text node creation, applied to all template literal injections |
| 3 | Asked the AI to make the server port configurable via environment variable and fix the deprecated `sendfile` call | Updated `server.js` with `dotenv`, `PORT` env var, and `sendFile` fix |
| 4 | Asked the AI to update `package.json` to add proper scripts, fix the `main` field, add `engines`, and move `nodemon` to devDependencies | Updated `package.json` with all requested changes |

---

## What the AI Got Wrong

### 1. Overly complex `setup.sh` with unnecessary database/migration steps

The AI's first draft of `setup.sh` included steps for running database migrations and seeding data (`npx sequelize db:migrate`, `npx sequelize db:seed:all`). This project has **no database** — it's a stateless in-memory chat app. The AI assumed a typical web app setup pattern and hallucinated database tooling that doesn't exist in this project. These steps were removed entirely.

### 2. Suggested installing `socket.io-client` as an npm dependency

The AI recommended adding `socket.io-client` to `package.json` and serving it via a local route, replacing the CDN link. While this would fix Pain Point #6 (CDN dependency), the Socket.IO server package already auto-serves its client-side library at `/socket.io/socket.io.js`. The AI's approach would have added a redundant dependency and required additional Express routing code. This was marked as Out of Scope instead — the proper fix is to use Socket.IO's built-in client serving or adopt a build tool, neither of which belongs in a bootstrap-only deliverable.

### 3. Incorrect Node version range in `engines`

The AI initially generated `"engines": { "node": ">=18.0.0" }` which would block anyone on Node 14, 16, or 17 from running the app — even though the app works perfectly fine on those versions. The range was manually corrected to `>=14.0.0 <23.0.0` to match the actual compatibility, since Express 4.17.1 and Socket.IO 2.2.0 support Node 14+.

---

## How to Use the Golden Path

### Quick Start (one command)

```sh
# Using make (Linux/macOS/WSL):
make setup

# Using the shell script:
chmod +x setup.sh
./setup.sh

# Then start the dev server:
make dev
# or
npm run dev
```

### What `make setup` Does

1. **Checks Node.js** — verifies `node` and `npm` are installed
2. **Creates `.env`** — copies `.env.example` → `.env` if it doesn't already exist
3. **Installs dependencies** — runs `npm install` (includes `nodemon` as devDependency)
4. **Prints next steps** — tells the new engineer exactly what command to run and what URL to open

### After Setup

```sh
# Start dev server with hot-reload:
npm run dev     # or: make dev

# Start production server:
npm start       # or: make start

# Open in browser:
# http://localhost:3001 (or whatever PORT is set in .env)
```
