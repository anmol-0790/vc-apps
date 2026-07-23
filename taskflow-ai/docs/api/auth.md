# Auth API

## `POST /api/auth/login`

Authenticate a user with email and password.

### Auth

None (public).

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

### Errors

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | Missing/invalid body or fields |
| `401` | `INVALID_CREDENTIALS` | Email/password rejected |
| `405` | `METHOD_NOT_ALLOWED` | Non-POST method |
| `500` | `INTERNAL_ERROR` | Unexpected failure |

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

### POC credentials

| Email | Password | Result |
|-------|----------|--------|
| `fail@example.com` | any valid password | `401` |
| any other valid email | any valid password | `200` |
