# First-time setup (do this once)

Complete these steps **before** the day-to-day Figma → PR loop.
When finished, follow [DEVELOPER_WORKFLOW.md](./DEVELOPER_WORKFLOW.md).

---

## Checklist

- [ ] 1. Accounts & tools
- [ ] 2. Clone / open the repo in Cursor
- [ ] 3. Install app dependencies
- [ ] 4. Connect Figma to Cursor
- [ ] 5. Restore CI + tests (if missing locally)
- [ ] 6. Verify local pipeline (`lint` / `test` / `build`)
- [ ] 7. GitHub CLI (for PRs)
- [ ] 8. Branch protection (CI required before merge)
- [ ] 9. Connect Vercel
- [ ] 10. Smoke-test the full loop once

---

## 1. Accounts & tools

You need:

| Tool | Why |
|------|-----|
| [Cursor](https://cursor.com) | AI coding + Figma MCP |
| [Figma](https://figma.com) account | Designs + MCP access |
| [GitHub](https://github.com) access to `anmol-0790/agents` | Code, PRs, Actions |
| [Vercel](https://vercel.com) account | Preview + production deploys |
| Node.js **22** (LTS) | Matches CI |

Check Node:

```bash
node -v   # should be v22.x
npm -v
```

If needed: install Node 22 from https://nodejs.org or via `nvm install 22`.

---

## 2. Open the repo in Cursor

```bash
cd /path/to/AI          # this monorepo
# App lives in: taskflow-ai/
```

Open the **AI** folder (or `taskflow-ai`) in Cursor so agents can see project rules.

---

## 3. Install dependencies

```bash
cd taskflow-ai
npm install
npm run dev
```

Open http://localhost:3000/login — you should see the VendorPro login page.

Stop the server with `Ctrl+C` when done.

---

## 4. Connect Figma → Cursor

1. In Cursor: **Settings → MCP** (or Features → MCP).
2. Ensure the **Figma** MCP server is enabled and authenticated.
3. In chat, confirm with something like: `Who am I in Figma?` (agent can call `whoami`).
4. Open your design in **Figma Desktop**, select a frame, copy **Link to selection** (URL must include `node-id=`).

You are ready for UI generation when this works:

```text
Build this Figma page in taskflow-ai with Next.js + Tailwind.
URL: https://www.figma.com/design/...?node-id=...
```

---

## 5. Restore CI + tests (if your tree is dirty)

On branch `feat/taskflow-figma-login-poc`, these files should exist:

- `.github/workflows/taskflow-ai.yml`
- `taskflow-ai/vitest.config.ts`
- `taskflow-ai/vitest.setup.ts`
- `taskflow-ai/src/components/login.test.tsx`
- `taskflow-ai/vercel.json`

If they show as deleted locally, restore from the last good commit:

```bash
cd /path/to/AI
git restore \
  .github/workflows/taskflow-ai.yml \
  taskflow-ai/vitest.config.ts \
  taskflow-ai/vitest.setup.ts \
  taskflow-ai/src/components/login.test.tsx \
  taskflow-ai/vercel.json \
  taskflow-ai/package.json
```

Keep your new docs:

```bash
# do NOT discard: taskflow-ai/docs/DEVELOPER_WORKFLOW.md
# do NOT discard: taskflow-ai/docs/SETUP.md
```

---

## 6. Verify local pipeline

```bash
cd taskflow-ai
npm run lint
npm test
npm run build
```

All three must pass before you rely on CI.

---

## 7. GitHub CLI (optional but recommended)

Makes “create PR” easy from Cursor/terminal.

```bash
# macOS
brew install gh
gh auth login
gh auth status
```

Pick **GitHub.com** → HTTPS → login via browser.

---

## 8. Protect `main` (important)

In GitHub → repo **Settings → Branches → Branch protection rules** for `main`:

1. Require a pull request before merging  
2. Require approvals: **1**  
3. Require status checks to pass: enable **TaskFlow AI CI** / `Lint, test, and build`  
4. Do **not** allow bypassing for the POC if you can avoid it  

This enforces: **review + green CI before merge**.

---

## 9. Connect Vercel

### Option A — Dashboard (easiest)

1. Go to https://vercel.com/new  
2. Import GitHub repo `anmol-0790/agents`  
3. Set **Root Directory** → `taskflow-ai`  
4. Framework → Next.js  
5. Deploy  

Then:

- Every **PR** → Preview URL  
- Merge to **`main`** → Production URL  

### Option B — CLI

```bash
cd taskflow-ai
npx vercel login          # complete browser auth
npx vercel link           # link to the project; root = taskflow-ai
```

Prefer linking via the GitHub integration so deploys are automatic (no manual `vercel --prod` each time).

---

## 10. Smoke-test the full loop once

Do this once to prove the setup:

| Step | Action | Pass when |
|------|--------|-----------|
| A | Small change on a feature branch (e.g. footer year text) | App still loads |
| B | `npm test && npm run build` | Pass locally |
| C | Commit + push + open PR | PR visible on GitHub |
| D | Wait for Actions | **TaskFlow AI CI** green |
| E | Check Vercel | Preview URL on the PR |
| F | Get approval + merge | Merged to `main` |
| G | Check Vercel Production | Live URL updated |

If A–G work, setup is complete. Day-to-day work = [DEVELOPER_WORKFLOW.md](./DEVELOPER_WORKFLOW.md).

---

## Current POC status (snapshot)

| Piece | Status |
|-------|--------|
| Next.js app `taskflow-ai` | Ready |
| Login UI from Figma | Ready (`/login`) |
| Vitest + CI workflow | In last commit — restore if deleted locally |
| Workflow docs | This file + `DEVELOPER_WORKFLOW.md` |
| GitHub Actions on branch | Has succeeded before |
| Vercel Git integration | **You still need to connect** |
| Branch protection | **You still need to enable** |

---

## Common blockers

| Problem | Fix |
|---------|-----|
| Figma MCP: “nothing selected” | Select the frame in Figma Desktop; use URL with `node-id` |
| CI not running | Workflow path filters; ensure PR touches `taskflow-ai/**` |
| `npm test` missing | Restore `package.json` scripts + vitest config |
| Vercel builds wrong app | Set Root Directory to `taskflow-ai` |
| `gh: command not found` | `brew install gh` then `gh auth login` |
| Node engine warnings | Use Node 22 for local + CI alignment |

---

## What to do next

1. Finish checklist items **1 → 9** above.  
2. Run the smoke test in **10**.  
3. For every new page, follow [DEVELOPER_WORKFLOW.md](./DEVELOPER_WORKFLOW.md).
