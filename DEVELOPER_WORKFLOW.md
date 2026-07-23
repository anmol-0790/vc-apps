# TaskFlow AI — Developer Workflow (Figma → Production)

This guide makes the path from a Figma page to a merged, tested, deployed feature **simple and repeatable** for developers.

Audience: developers using Cursor + Figma MCP on `taskflow-ai/`.

---

## Verdict on the approach

Your proposed flow is **the right direction** for this POC:

> Figma page → Cursor UI → Backend → Tests → Commit → PR → Human review → Merge → CI/CD

Keep these three corrections so it stays easy *and* safe:

| Your step | Keep? | Best-practice adjustment |
|-----------|-------|--------------------------|
| Page-by-page in Figma | Yes | One vertical slice per page (UI + API + tests), not UI-only forever |
| Cursor builds from Figma URL/node | Yes | Always paste a link with `node-id`; select the frame in Figma Desktop |
| Backend after UI | Yes for POC | Agree a thin API contract first (routes + shapes), then implement |
| Testing | Yes | Run tests **before commit** and again in **CI on the PR** |
| Commit → PR → Review → Merge | Yes | Human merge only; require green CI + at least one reviewer |
| GitHub Actions | Yes | Run Actions **on the PR (before merge)**, not only after merge |
| Deploy | Implied | Vercel Preview on PR; Production on merge to `main` |

**Golden rule:** CI is a gate *into* `main`, not a surprise after merge.

---

## Target pipeline

```text
1. Design (Figma) — one page / screen
2. Prompt Cursor — Figma URL + acceptance criteria
3. Frontend — match design, reuse components
4. Contract — agree API routes + request/response shapes
5. Backend — implement against the contract
6. Tests — unit / component / API smoke
7. Local verify — lint, test, build, manual check
8. Commit — small, focused message
9. PR — description + Figma link + test plan
10. Review — human (+ optional Bugbot / security review)
11. CI on PR — lint, test, build must pass
12. Merge — authorized reviewer / CODEOWNERS
13. Deploy — Vercel Production from main
```

---

## Roles (keep it simple)

| Role | Responsibility |
|------|----------------|
| Designer / PM | Owns Figma pages; marks frame “Ready for build” |
| Developer | Runs Cursor prompts; owns code quality, tests, PR |
| Reviewer | Checks design fidelity, security, correctness; approves merge |
| CI | Automated lint / test / build on every PR |
| Vercel | Preview URL per PR; Production on `main` |

One person can wear multiple hats on a small POC. Process still stays the same.

---

## Step-by-step (developer playbook)

### 1. Design the page in Figma

- One frame = one shippable screen (e.g. Login, Dashboard).
- Use Auto Layout; name layers clearly (`Email`, `LoginButton`, `Footer`).
- Prefer shared components / variables when available.
- When ready, mark the frame **Ready for build** and copy **Link to selection** (must include `node-id`).

**Do not** start Cursor work from a file URL without `node-id`.

### 2. Ask Cursor to build the UI

Use a short, consistent prompt:

```text
Build this Figma page with Next.js + Tailwind in taskflow-ai.

Figma: <paste link with node-id>

Rules:
- Reuse existing components under src/components
- Follow .cursor/rules and AGENTS.md
- Match layout, typography, and colors from the design
- Put the route under src/app/<route>/page.tsx
- Do not invent backend behavior yet
```

Review locally:

```bash
cd taskflow-ai
npm run dev
# open the new route, compare side-by-side with Figma
```

### 3. Define the backend contract (thin first)

Before deep backend work, write or ask Cursor for a short contract:

```text
For this page, define the API contract only:
- method + path
- request body / query
- success + error response shapes
- auth requirements
Put it in docs/api/<feature>.md (or OpenAPI if we already use it).
```

Example (Login):

| Method | Path | Body | Success | Errors |
|--------|------|------|---------|--------|
| `POST` | `/api/auth/login` | `{ email, password }` | `{ token, user }` | `401`, `400` |

### 4. Implement backend

```text
Implement the backend for <feature> against docs/api/<feature>.md.
- Add route handlers under taskflow-ai
- Validate input
- Return the documented status codes
- No unrelated refactors
```

### 5. Add / update tests

Minimum bar per page:

- **UI:** renders key labels/controls (Vitest + Testing Library)
- **API:** happy path + one failure path
- **Build:** `npm run build` must succeed

```text
Add tests for <feature>:
- component test for the page / critical form
- API smoke tests for success and 401/400
Follow existing vitest setup.
```

### 6. Local gate (before commit)

```bash
cd taskflow-ai
npm run lint
npm test
npm run build
```

Fix failures locally. Do not “hope CI will catch it.”

### 7. Commit

Ask Cursor (or commit yourself):

```text
Commit only the files for <feature>.
Message: why this change exists, not a file list.
```

Branch naming:

```text
feat/<page-or-feature>     # e.g. feat/login
fix/<short-description>
```

One PR ≈ one page / one vertical slice.

### 8. Open a PR

```text
Push the branch and open a PR into main.
Include:
- Summary (what / why)
- Figma link
- Test plan checklist
- Screenshots or Preview notes
```

Suggested PR body:

```markdown
## Summary
- Built Login UI from Figma and wired login API.

## Figma
https://www.figma.com/design/...?node-id=...

## Test plan
- [ ] `/login` matches Figma (desktop)
- [ ] Form validation works
- [ ] API success + invalid credentials
- [ ] CI green

## Notes
- Out of scope: OAuth, password reset
```

### 9. PR review

Reviewer checks:

1. **Design fidelity** — spacing, type, colors vs Figma  
2. **Correctness** — happy path + errors  
3. **Reuse** — no duplicate components / one-off styles without reason  
4. **Security** — no secrets, safe auth handling  
5. **Tests** — meaningful, not only snapshots  
6. **CI** — must be green before approval  

Optional: ask Cursor for a Bugbot-style or security review on the PR diff.

### 10. Merge

- Merge only after **approval** from the right person (CODEOWNERS / team lead).
- Prefer **Squash and merge** for a clean `main` history on this POC.
- Do not force-merge with failing checks.

### 11. CI (GitHub Actions)

Workflow: [`.github/workflows/taskflow-ai.yml`](../../.github/workflows/taskflow-ai.yml)

On every PR / push that touches `taskflow-ai/**`:

1. `npm ci`
2. `npm run lint`
3. `npm test`
4. `npm run build`

**Required check** on `main`: TaskFlow AI CI must pass.

### 12. Deploy (Vercel)

| Event | Result |
|-------|--------|
| Open / update PR | Preview deployment URL on the PR |
| Merge to `main` | Production deployment |

Vercel project settings:

- Git repo: `anmol-0790/agents`
- **Root Directory:** `taskflow-ai`
- Framework: Next.js

---

## Copy-paste prompt pack

### A. UI from Figma

```text
Implement this Figma frame in taskflow-ai with Next.js + Tailwind.
URL: <figma-link>
Reuse src/components. Follow project rules. Create route /<name>.
```

### B. Backend from contract

```text
Implement API for <feature> per docs/api/<feature>.md.
Add validation, documented status codes, and keep the change scoped.
```

### C. Tests

```text
Add Vitest coverage for <feature> UI and API (happy + one failure).
Keep tests focused and fast.
```

### D. Ship

```text
1) Run lint, test, build and fix failures
2) Commit with a clear message
3) Push and open a PR into main with Figma link + test plan
```

### E. Review assist

```text
Review this PR diff for design fidelity gaps, bugs, and missing tests.
List findings by severity; do not rewrite unrelated code.
```

---

## Definition of Done (per page)

A page is done when all are true:

- [ ] Figma frame linked in the PR  
- [ ] UI matches design at the target breakpoint  
- [ ] API contract documented and implemented  
- [ ] Tests added and passing locally  
- [ ] Lint + build pass locally  
- [ ] PR opened with test plan  
- [ ] CI green on the PR  
- [ ] Approved by the right reviewer  
- [ ] Merged to `main`  
- [ ] Production (or Preview) URL verified  

---

## What not to do

- Jump from Figma → full app rewrite in one PR  
- Skip API contract and invent endpoints ad hoc  
- Commit without running tests  
- Merge with red CI  
- Rely on post-merge CI as the first quality gate  
- Hardcode secrets in the repo or Cursor prompts  
- Paste Figma MCP asset URLs as permanent production assets (they expire) — download or use app assets  

---

## Suggested repo hygiene (makes Cursor easier)

| Item | Purpose |
|------|---------|
| `.cursor/rules/*.mdc` | Stable frontend / backend / testing rules |
| `AGENTS.md` | Short “how we build here” for the agent |
| `docs/api/*.md` | Thin contracts per feature |
| PR template | Forces Figma link + test plan |
| CODEOWNERS | Right person must approve |
| Branch protection | Require CI + review on `main` |

---

## Quick reference

```text
Figma (page Ready)
    → Cursor UI (Figma URL)
    → API contract
    → Backend
    → Tests
    → lint / test / build
    → Commit
    → PR (+ Figma + test plan)
    → Human review
    → CI green on PR
    → Merge by owner
    → Vercel Production
```

This is the standard loop for TaskFlow AI. Optimize for **small pages, clear prompts, green PRs**.
