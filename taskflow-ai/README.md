# TaskFlow AI

Next.js App Router app (TypeScript + Tailwind CSS + Vitest).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

```bash
npm run lint
npm test
npm run build
```

---

## Folder structure

```text
taskflow-ai/
├── docs/api/                 # API contracts
│   └── auth.md
├── src/
│   ├── app/                  # App Router routes + layouts
│   │   ├── login/page.tsx    # /login
│   │   └── api/auth/login/   # POST /api/auth/login
│   ├── components/
│   │   ├── ui/               # Reusable primitives
│   │   └── login/            # Login feature UI
│   └── lib/
│       ├── api/              # Shared JSON response helpers
│       ├── auth/             # Auth business logic + types
│       ├── login.ts          # Client validation + API client
│       └── cn.ts             # className helper
├── vitest.config.ts
└── vitest.setup.ts
```

---

## Login flow

1. User opens `/login` (`src/app/login/page.tsx`).
2. `LoginForm` validates email/password on the client.
3. On success, it calls `loginRequest()` → `POST /api/auth/login`.
4. The route handler delegates to `authenticateUser()` (business logic).
5. UI states:
   - **Loading** — fields + button disabled, “Signing in…”
   - **Success** — status message; optional “Remember me” stores email in `localStorage`
   - **Error** — alert (+ field errors when the API returns them)

Auth is backed by **Supabase Auth**. Configure env from `.env.example`.  
For local POC, disable **Confirm email** in the Supabase dashboard so signup returns a session immediately.

```text
/login → LoginForm → loginRequest() → POST /api/auth/login → authenticateUser() → Supabase
/signup → SignupForm → signupRequest() → POST /api/auth/register → registerUser() → Supabase
```

---

## Components created

| Component | Path | Role |
|-----------|------|------|
| `LoginForm` | `src/components/login/LoginForm.tsx` | Form state, validation, submit, loading/error/success |
| `Input` | `src/components/ui/Input.tsx` | Labeled text/email/password field with errors |
| `Button` | `src/components/ui/Button.tsx` | Submit button with loading state |
| `Checkbox` | `src/components/ui/Checkbox.tsx` | Remember me |
| `Alert` | `src/components/ui/Alert.tsx` | Error / success banners |

---

## APIs used

### `POST /api/auth/login`

Contract: [`docs/api/auth.md`](./docs/api/auth.md)  
Handler: `src/app/api/auth/login/route.ts`  
Service: `src/lib/auth/login-service.ts`

**Request**

```json
{ "email": "string", "password": "string" }
```

**Success `200`**

```json
{
  "token": "string",
  "user": { "id": "string", "email": "string" }
}
```

**Errors**

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | Invalid/missing fields |
| `401` | `INVALID_CREDENTIALS` | Rejected credentials |

Client wrapper: `loginRequest()` in `src/lib/login.ts`.
