---
name: absuite-login
description: >
  Authenticate with the Alliance Business Suite (ABS) over the REST API and verify
  your identity. Use when you need to log in with user credentials, obtain a bearer
  token, refresh it, or confirm your ABS identity via the WhoAmI endpoint using
  direct HTTP (curl). Do NOT use for domain-specific ABS operations (tenants,
  invoices, contacts, etc.) — only for authentication and identity verification.
  For CLI-based login, see absuite-login-cli.
---

# Alliance Business Suite — Authentication Skill (REST)

Use this skill to establish and verify an authenticated ABS session over the **REST API** with a bearer token. For the `absuite` CLI equivalent, see `absuite-login-cli`.

This skill is only for:
- logging in with ABS credentials and obtaining a bearer token
- refreshing an expired token
- confirming the current ABS identity and scope (WhoAmI)

For domain operations, see `absuite-rest` (general) or the per-service `absuite-<domain>` skills.

## Environment variables

Injected by the agent runtime — never hard-code these:

| Variable | Description |
|---|---|
| `ABSUITE_USER_EMAIL` | Email for ABS login. |
| `ABSUITE_USER_PASSWORD` | Password for ABS login. |
| `ABSUITE_HOST_URL` | Base URL of the ABS instance (e.g. `https://absuite.net`). No trailing slash. |

## Step 1 — Log in

```bash
curl -s -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ABSUITE_USER_EMAIL\",\"password\":\"$ABSUITE_USER_PASSWORD\"}"
```

Response (note: `/login` is a public endpoint and returns the raw token object, **not** the standard envelope):

```json
{
  "tokenType": "Bearer",
  "accessToken": "<jwt-bearer-token>",
  "expiresIn": 3600,
  "refreshToken": "<refresh-token>"
}
```

Capture `accessToken` (and `refreshToken`). Send the access token on every subsequent call:

```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

If login fails, verify `ABSUITE_USER_EMAIL`, `ABSUITE_USER_PASSWORD`, and `ABSUITE_HOST_URL`.

## Step 2 — Verify identity (WhoAmI)

Confirm the token works and inspect your identity context:

```bash
curl -s -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/WhoAmI" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Returns the standard envelope; read `result`:

```json
{
  "isSuccess": true,
  "result": {
    "userId": "<guid>",
    "tenantId": "<guid-or-null>",
    "enrollmentId": "<guid-or-null>",
    "applicationId": "<guid-or-null>"
  }
}
```

To check identity **within a specific tenant context**, add the `X-TenantId` header (only meaningful once you are enrolled in that tenant):

```bash
curl -s -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/WhoAmI" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "X-TenantId: <tenant-guid>"
```

## Step 3 — Refresh the token

When the access token expires (`401 Unauthorized`), exchange the refresh token for a new one:

```bash
curl -s -X POST "$ABSUITE_HOST_URL/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$ABSUITE_REFRESH_TOKEN\"}"
```

Or simply re-run Step 1.

## Identity-adjacent reads (the `/Me` surface)

These are **user-scoped** (resolved from your token — no `tenantId` needed):

```bash
# Current user profile
curl -s "$ABSUITE_HOST_URL/api/v2/Me" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Tenants you can access
curl -s "$ABSUITE_HOST_URL/api/v2/Me/Tenants" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Your enrollments (tenant memberships)
curl -s "$ABSUITE_HOST_URL/api/v2/Me/Enrollments" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Pending invitations
curl -s "$ABSUITE_HOST_URL/api/v2/Me/Invitations" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Quick identity-check procedure

Use before any ABS-dependent workflow:

1. `GET /api/v2/OAuth/WhoAmI`.
   - Successful envelope → session is valid.
   - `401` → re-authenticate (Step 1) or refresh (Step 3), then retry.
2. Record `userId`, `tenantId`, `enrollmentId`, `applicationId` for downstream use.

## API endpoints quick reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Authenticate, obtain tokens (public; raw token object) |
| POST | `/refresh` | Exchange a refresh token for a new access token |
| GET | `/api/v2/OAuth/WhoAmI` | Verify current identity |
| GET | `/api/v2/Me` | Current user profile |
| GET | `/api/v2/Me/Tenants` | List accessible tenants |
| GET | `/api/v2/Me/Enrollments` | List enrollments |
| GET | `/api/v2/Me/Invitations` | List pending invitations |

## Critical rules

- **Never hard-code credentials or host.** Use `ABSUITE_USER_EMAIL`, `ABSUITE_USER_PASSWORD`, `ABSUITE_HOST_URL`.
- **Never log or print tokens** unless deliberately debugging auth.
- **Always verify identity after login** — a token alone is not proof; call WhoAmI.
- **`/login` and `/refresh` are public** and return the raw token object, not the envelope. All `/api/v2/*` calls return the standard envelope.
- **The `/Me` surface is user-scoped** — never attach a `tenantId` to it.
- This skill is for authentication only. For tenant onboarding (accepting an invitation, initializing a portal) see `absuite-onboarding`; for domain operations see `absuite-rest` and the `absuite-<domain>` skills.
