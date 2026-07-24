# Technical debt — TaskFlow AI (`taskflow-ai/`)

Staff review notes after auth cleanup (no feature work). Track and burn down deliberately.

## Product / auth flow

| ID | Debt | Notes |
|----|------|-------|
| TD-1 | SSO buttons are presentational | Google/Microsoft on login; Google on signup — no OAuth wiring |
| TD-2 | No post-auth navigation | Success toasts no longer say “Redirecting…”; still no `router.push` / app home |
| TD-3 | Dual session model | SSR cookies via `@supabase/ssr` **and** JSON `token` in API body — clarify which clients should use |
| TD-4 | Placeholder links | Forgot password, Terms, Privacy still `href="#"` |
| TD-5 | Email confirmation UX | Empty `token` after signup when Confirm email is ON — handled in UI copy only |
| TD-6 | Microsoft only on login | Signup is Google-only — intentional UI mismatch |

## Platform / naming

| ID | Debt | Notes |
|----|------|-------|
| TD-7 | Brand vs package naming | UI “Meridian”; package/`localStorage` key `taskflow.login.email` |
| TD-8 | Shared chrome still under `components/login/` | `Logo`, `Divider`, `SSOButton`, `LoginBackground` used by signup; prefer eventual move to `components/auth/` |
| TD-9 | CSS token name | `--login-card-shadow` used on signup cards too |
| TD-10 | Unused browser client | `lib/supabase/client.ts` unused until client-side OAuth/session |

## Reliability / security

| ID | Debt | Notes |
|----|------|-------|
| TD-11 | Email-taken detection via string match | Brittle across Supabase message changes |
| TD-12 | Password rules not synced with Supabase project settings | Client/service enforce min 8 only |
| TD-13 | Remember-me stores email in `localStorage` | Privacy note for shared devices |
| TD-14 | No rate limiting / abuse controls on auth routes | Acceptable for POC; not for production scale |
| TD-15 | Config errors expose “Set Supabase env vars” | Fine for POC; tone down for production |

## Testing / ops

| ID | Debt | Notes |
|----|------|-------|
| TD-16 | No integration tests against real Supabase error taxonomy | Unit tests mock the client |
| TD-17 | Logger is `console.*` JSON lines | Upgrade to pino/OTel when ops matures |
| TD-18 | `cn()` is string-join only | No `tailwind-merge` — class conflicts possible if overused |

## Done in cleanup (for context)

- Shared `AuthPageShell` / `AuthFormCard` / trust badges / icons / password eye toggle
- Shared `apiJsonPost` + `parseJsonObjectBody`
- `AuthSuccess` naming (+ deprecated `LoginSuccess` aliases)
- Structured auth logging (no passwords/tokens)
- Network errors mapped to typed client errors; provider failures → `INTERNAL_ERROR` instead of fake validation
