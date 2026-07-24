# Auth API

Auth is backed by **Supabase Auth** (email + password).  
Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`).

## `POST /api/auth/login`

Authenticate a user with email and password.

### Auth

None (public). Sets Supabase auth cookies on success.

### Request body

```json
{
  "email": "string",
  "password": "string"
}
```

| Field | Rules |
|-------|--------|
| `email` | Required, valid email |
| `password` | Required, min 8 characters |

### Success — `200`

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string"
  }
}
```

`token` is the Supabase access token.

### Errors

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | Missing/invalid body or fields |
| `401` | `INVALID_CREDENTIALS` | Email/password rejected |
| `500` | `INTERNAL_ERROR` | Missing env / unexpected failure |

Error body shape:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "fields": { "email": "string", "password": "string" }
  }
}
```

`fields` is optional and only present for validation errors.

## `POST /api/auth/register`

Create an account with email and password.

### Request body

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "termsAccepted": true
}
```

### Success — `201`

Same shape as login success. If Supabase email confirmation is enabled, `token` may be `""` until the user confirms.

### Errors

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | Invalid fields |
| `409` | `EMAIL_TAKEN` | Email already registered |
| `500` | `INTERNAL_ERROR` | Missing env / unexpected failure |
