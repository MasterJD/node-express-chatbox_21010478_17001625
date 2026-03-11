# PAIN_LOG.md — node-express-chatbox

**Auditor:** Platform Engineering Squad  
**Date:** 2026-03-10  
**Repo:** node-express-chatbox_21010478_17001625  
**Method:** Followed README.md top-to-bottom as a new engineer with zero prior context.

---

## Friction Points

1. **[VERSION_HELL]** README says "This project requires `nodejs` to run" but specifies **no Node version**. No `.nvmrc`, `.node-version`, or `engines` field in `package.json`. The project was built in 2019 with Express 4.17.1 and Socket.IO 2.2.0 — a new hire on Node 22 has no idea if that's compatible. In practice it starts, but `response.sendfile()` (used in `server.js:12`) is deprecated since Express 4.x and **removed in Express 5**. A future Node/Express upgrade will break the app silently.  
   **Severity: WARNING** — works today, time bomb tomorrow.

2. **[IMPLICIT_DEP]** README instructs `npm install nodemon -g` — a **global** install that modifies the engineer's system, not the project. nodemon is not listed in `package.json` (not even as a devDependency). If the engineer skips this step or is on a locked-down machine, the next command (`nodemon server.js`) fails with `'nodemon' is not recognized`. There is no `npm start` script as a fallback.  
   **Severity: BLOCKER** — new hire without global nodemon cannot follow the "Starting the dev server" step.

3. **[MISSING_DOC]** `package.json` has `"main": "index.js"` but the entry point is actually `server.js`. No `"start"` script exists — `npm start` produces an error. A new engineer looking at `package.json` for how to run the project gets zero useful information.  
   **Severity: MODERATE** — misleading, causes confusion about how to launch the app.

4. **[MISSING_DOC]** The README does not mention which **port** the server listens on. Port `3001` is hardcoded in `server.js:17` and again hardcoded in `public/js/chat.js:22` (`var url = 'http://localhost:3001'`). If port 3001 is occupied, the server crashes with `EADDRINUSE` and the error message gives no guidance. There is no `PORT` environment variable support.  
   **Severity: MODERATE** — new hire on a machine where 3001 is taken has to read source code to diagnose.

5. **[ENV_GAP]** No `.env.example` or any mention of configurable environment variables. The server URL is hardcoded on both the backend (`server.js:17`) and the frontend client (`chat.js:22` → `http://localhost:3001`). Deploying to any non-localhost environment requires editing source code. There is no documentation of this.  
   **Severity: WARNING** — irrelevant for local dev, but a trap for anyone trying to deploy.

6. **[IMPLICIT_DEP]** The frontend HTML (`index.html`) loads three external CDN resources with **no fallback and no integrity hashes**:
   - `https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.5/css/bulma.min.css`
   - `https://fonts.googleapis.com/css?family=Roboto+Mono`
   - `https://use.fontawesome.com/releases/v5.3.1/js/all.js`
   - `https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js`
   
   These are not documented anywhere. If the CDN is down, behind a corporate firewall, or the resource is removed, the app renders broken with no error message. The Socket.IO **client** is pinned to 2.2.0 via CDN, coupling it tightly to the server-side version.  
   **Severity: WARNING** — silent visual/functional breakage in restricted network environments.

7. **[BROKEN_CMD]** `server.js:12` uses `response.sendfile()` (lowercase 'f') which has been **deprecated** since Express 4.8.0 in favor of `response.sendFile()` (capital 'F'). On current Express 4.17.1 it still works but emits a deprecation warning. On Express 5.x it will fail outright.  
   **Severity: WARNING** — functional today but produces deprecation noise; will break on upgrade.

8. **[SILENT_FAIL]** `npm install` completes with exit code 0 but reports **16 known vulnerabilities (4 low, 2 moderate, 7 high, 3 critical)**. This includes:
   - `socket.io-parser` — 3 critical resource exhaustion / insufficient validation issues
   - `xmlhttprequest-ssl` — critical arbitrary code injection
   - `ws` — high severity ReDoS
   - `path-to-regexp` — high severity ReDoS
   - `qs` — high severity prototype pollution
   - `body-parser`, `send`, `cookie` — high/moderate severity DoS and XSS
   
   The README makes no mention of security posture or how to handle audit warnings. A new hire sees 16 vulns and has no guidance whether to run `npm audit fix` or leave things alone.  
   **Severity: BLOCKER** — a security-conscious engineer will stop here and escalate.

9. **[MISSING_DOC]** There is **no mention of how to verify the app is working** after starting the server. The README says `nodemon server.js` but never says "open http://localhost:3001 in your browser." A new hire sees `Listening to requests on port 3001` in the terminal and has to guess what to do next.  
   **Severity: MODERATE** — an experienced dev will figure it out, a junior may not.

10. **[MISSING_DOC]** The README "Tests" section says "Tested bidirectional messaging successfully" — this is a **human test log entry, not runnable tests**. `npm test` runs `echo "Error: no test specified" && exit 1`. A new engineer trying to validate the setup with `npm test` gets a failure. There are no automated tests of any kind.  
    **Severity: MODERATE** — misleading "Tests" section, no way to validate the app works without manual clicking.

11. **[SILENT_FAIL]** Chat messages are rendered via `innerHTML +=` with **unsanitized user input** (`data.name`, `data.message` in `chat.js:122-124`). Any user can inject arbitrary HTML/JavaScript into other users' browsers (stored XSS). The app appears to "work" but is fundamentally insecure. This is not documented anywhere.  
    **Severity: CRITICAL** — XSS vulnerability, security incident waiting to happen.

12. **[VERSION_HELL]** Dependencies are severely outdated:
    - `express` 4.17.1 → current 4.22.1 (patch: 4.x) / latest 5.2.1 (major)
    - `socket.io` 2.2.0 → current 2.5.1 (patch: 2.x) / latest 4.8.3 (major)
    
    Socket.IO 2.x reached end-of-life. Express 4.17.1 is over 5 years old. Running `npm audit fix` will update within semver range but cannot address all 16 vulnerabilities without major version bumps. The README provides no upgrade guidance.  
    **Severity: WARNING** — accumulating tech debt; major version upgrade required for full security remediation.

13. **[MISSING_DOC]** No contribution guide, no code style conventions, no linter configuration (no `.eslintrc`, `.prettierrc`, or equivalent). A new engineer has no idea how to format code or what standards to follow. The `.gitignore` includes Python and Jupyter templates that are irrelevant to this project, adding confusion.  
    **Severity: LOW** — cosmetic but adds cognitive overhead during onboarding.

14. **[MISSING_DOC]** README screenshots reference external GitHub URLs (`https://github.com/danielc92/node-express-chatbox/blob/master/screenshots/...`) rather than relative paths. There is a local `screenshots/` directory that appears to be empty or missing actual image files. Screenshots won't render for someone viewing the README locally.  
    **Severity: LOW** — documentation doesn't render correctly outside of the original GitHub repo.

15. **[IMPLICIT_DEP]** The project has no `package-lock.json` committed in the original repo (it's generated locally on `npm install`). Without a lockfile in version control, two engineers may get different dependency trees. The `.gitignore` does not explicitly ignore or include it, so this is ambiguous.  
    **Severity: WARNING** — non-deterministic builds across team members.

---

## Severity Summary

| Metric | Value |
|---|---|
| **Total friction points found** | 15 |
| **BLOCKER count** | 2 (#2 nodemon global dep, #8 security vulnerabilities) |
| **CRITICAL count** | 1 (#11 XSS vulnerability) |
| **WARNING count** | 5 (#1, #5, #7, #12, #15) |
| **MODERATE count** | 4 (#3, #4, #9, #10) |
| **LOW count** | 2 (#13, #14) |
| **First complete blocker** | Step 3 of README — "Starting the dev server" requires globally-installed nodemon (#2) |
| **Estimated time lost for a new hire** | 30–60 minutes of confusion, Googling, and source-code reading before chat is functional in a browser. Longer if security review is required. |

### Dependency Update Analysis

| Package | Installed | Wanted (semver) | Latest | Status |
|---|---|---|---|---|
| `express` | 4.17.1 | 4.22.1 | 5.2.1 | 5+ years behind; 16 transitive CVEs |
| `socket.io` | 2.2.0 | 2.5.1 | 4.8.3 | EOL major version; critical vulns in parser |
| `nodemon` | (global 3.1.14) | N/A | N/A | Not in package.json at all |
| `bulma` (CDN) | 0.7.5 | N/A | 1.0.x | 5 major versions behind |
| `font-awesome` (CDN) | 5.3.1 | N/A | 6.x | 1 major version behind |
| `socket.io-client` (CDN) | 2.2.0 | N/A | 4.8.x | Must match server version; currently hardcoded |

### Bottom Line

A new engineer following the README alone **cannot get this app running in under 5 minutes**. The two blockers (global nodemon requirement, security audit wall) hit before the app is even reachable in a browser. Once running, the app has an unpatched XSS vulnerability and 16 known dependency CVEs. The README is more of a personal dev journal entry than onboarding documentation.
