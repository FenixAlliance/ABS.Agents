---
name: absuite-login
description: >
  Authenticate with the Alliance Business Suite (ABS) using the `absuite` CLI
  and verify your identity. Use when you need to log in with user credentials,
  obtain a bearer token, check configuration, or confirm your ABS identity via
  the WhoAmI endpoint. Do NOT use for domain-specific ABS operations (managing
  tenants, invoices, contacts, organizations, opportunities, campaigns, etc.)
  — only for authentication, configuration, and identity verification.
---

# Alliance Business Suite — Authentication Skill

## Purpose

Use this skill to establish and maintain an authenticated ABS session using the `absuite` CLI.

This skill is only for:

- logging in with ABS credentials via the CLI
- configuring the CLI base URL and default tenant
- confirming the current ABS identity and scope
- verifying the CLI is installed and functional

Do not use this skill for domain-specific ABS operations. See the `absuite-cli` skill for general CLI usage.

---

## Prerequisites

The `absuite` CLI must be installed system-wide (available on `PATH`).

Verify installation:

```bash
absuite --version
```

Expected output: `absuite v1.0.0` (or later).

If the CLI is not found, it must be installed before proceeding. The CLI is a self-contained Windows executable — no runtime dependencies required.

---

## Environment Variables

Env vars auto-injected by the agent runtime:

| Variable | Description |
|---|---|
| `ABSUITE_USER_EMAIL` | The email address for ABS login. |
| `ABSUITE_USER_PASSWORD` | The password for ABS login. |
| `ABSUITE_HOST_URL` | The base URL of the ABS instance (e.g., `https://absuite.net`). No trailing slash. |

Never hard-code these values. Always read them from the environment.

---

## Configuration

The CLI stores configuration in `~/.absuite/config.json`. Tokens are encrypted with DPAPI (Windows) and are machine- and user-scoped.

### Set Base URL

If your ABS instance is not the default (`https://absuite.net`), configure it first:

```bash
absuite config set --base-url $ABSUITE_HOST_URL
```

> **Note:** There is no direct REST equivalent for CLI configuration commands — they modify the local CLI state stored in `~/.absuite/config.json`.

### Set Default Tenant

To avoid passing `--TenantId` on every call:

```bash
absuite config set --tenant-id <tenant-guid>
```

### View Current Configuration

```bash
absuite config show
```

> **Note:** `absuite config show` displays local CLI state. For REST API calls, no configuration step is needed — use `$ABSUITE_HOST_URL` directly in request URLs and pass the bearer token via the `Authorization` header.

---

## Authentication Flow

### Step 1 — Login

Authenticate with the CLI using credentials from environment variables:

```bash
absuite login --email $ABSUITE_USER_EMAIL --password $ABSUITE_USER_PASSWORD
```

If the base URL is not the default, include it:

```bash
absuite login --email $ABSUITE_USER_EMAIL --password $ABSUITE_USER_PASSWORD --base-url $ABSUITE_HOST_URL
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$ABSUITE_USER_EMAIL'", "password": "'$ABSUITE_USER_PASSWORD'"}'
```

On success, the CLI outputs a JSON object and caches the token locally:

```json
{
  "accessToken": "<jwt-bearer-token>",
  "refreshToken": "<refresh-token>",
  "expiresIn": 3600,
  "baseUrl": "https://absuite.net"
}
```

The CLI automatically:
- Encrypts and stores the access token and refresh token in `~/.absuite/config.json`
- Tracks token expiry and warns when it has expired on subsequent commands
- Uses the cached token for all subsequent API calls

If login fails, verify that `ABSUITE_USER_EMAIL`, `ABSUITE_USER_PASSWORD`, and `ABSUITE_HOST_URL` are set correctly.

**Interactive mode**: If `--password` is omitted, the CLI prompts for it interactively via secure input. For agent use, always provide `--password` explicitly.

---

### Step 2 — Verify Identity (WhoAmI)

After login, confirm the authenticated identity using the `identity` service:

```bash
absuite identity Get-WhoAmIAsync
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/WhoAmI" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Expected JSON response:

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

Capture from the result:
- `userId` — the ABS user identity
- `tenantId` — the currently scoped tenant, if any
- `enrollmentId` — the current enrollment within that tenant, if any
- `applicationId` — the current application context, if any

### Tenant-Scoped Identity Check

To verify identity in a specific tenant context, pass `--TenantId`:

```bash
absuite identity Get-WhoAmIAsync --TenantId <tenant-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/WhoAmI" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "X-Tenant-ID: <tenant-guid>"
```

### List Accessible Tenants

```bash
absuite tenants list tenants
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

### Step 3 — Token Expiry

The CLI automatically checks token expiry before each API call and warns if the token has expired:

```
Access token expired. Run 'absuite login' to re-authenticate.
```

When you see this warning, re-run Step 1 to obtain a fresh token.

---

## Quick Identity Check Procedure

Use this procedure on wake-up or before any ABS-dependent workflow:

1. Run `absuite --version` to confirm the CLI is available.
2. Run `absuite identity Get-WhoAmIAsync`.
   - If it returns a successful response, the session is valid.
   - If it returns a token-expired warning or authentication error, run `absuite login --email $ABSUITE_USER_EMAIL --password $ABSUITE_USER_PASSWORD`.
   - After re-login, retry the WhoAmI call.
3. Record the identity context (`userId`, `tenantId`, `enrollmentId`, `applicationId`) for downstream use.

---

## Additional Identity Endpoints via CLI

Once authenticated, use these commands for identity-adjacent context:

| Action | CLI Command |
|---|---|
| My profile | `absuite users Get-MeAsync` |
| My tenants | `absuite tenants list tenants` |
| My enrollments | `absuite tenants list enrollments` |
| My notifications | `absuite social list notifications` |
| My settings | `absuite users Get-UserSettingsAsync` |

**REST API equivalents:**

```bash
# My profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Check if authenticated
curl -X GET "$ABSUITE_HOST_URL/api/v2/Auth/Checker/IsAuthenticated" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# My tenants
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# My enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# My notifications
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Notifications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# My settings
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Settings" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Use `absuite <service> list-commands` to discover available commands, or `absuite <service> <command> --help` for detailed parameter and output schemas.

---

## Session Prerequisite for Other ABS Skills

Any downstream ABS skill that depends on an authenticated session must:
- Require a successful `absuite identity Get-WhoAmIAsync` before making ABS API calls
- If the token is expired or missing, invoke `absuite login` first
- If tenant-scoped behavior is required, either set a default tenant via `absuite config set --tenant-id` or pass `--TenantId` on each call

---

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Authenticate and obtain tokens |
| GET | `/api/v2/OAuth/WhoAmI` | Verify current identity |
| POST | `/api/v2/OAuth/SignIn` | OAuth sign-in |
| GET | `/api/v2/OAuth/SignIn` | Check/validate sign-in |
| POST | `/api/v2/OAuth/Token` | Get OAuth token |
| GET | `/api/v2/Auth/Checker/IsAuthenticated` | Check authentication status |
| GET | `/api/v2/Me` | Current user profile |
| GET | `/api/v2/Me/Tenants` | List accessible tenants |
| GET | `/api/v2/Me/Tenants/Count` | Count accessible tenants |
| GET | `/api/v2/Me/Enrollments` | List user enrollments |
| GET | `/api/v2/Me/Settings` | Get user settings |
| GET | `/api/v2/Me/Notifications` | Get user notifications |

## Critical Rules

- **Never hard-code credentials or host configuration.** Always use `ABSUITE_USER_EMAIL`, `ABSUITE_USER_PASSWORD`, and `ABSUITE_HOST_URL`.
- **Never log or print credentials, access tokens, or refresh tokens** unless explicitly performing controlled authentication debugging.
- **Always verify identity after login.** Successful token issuance alone is not enough — run `absuite identity Get-WhoAmIAsync` to confirm.
- **Token lifecycle is managed by the CLI.** Tokens are DPAPI-encrypted, expiry is tracked automatically, and the CLI warns on expiry. You do not need to manually manage token storage or refresh.
- **All CLI commands use the cached token automatically.** No need to pass `Authorization` headers — the CLI handles this.
- **Tenant-scoped operations require `--TenantId`** unless a default tenant is configured via `absuite config set --tenant-id`.
	•	Use /api/v2/me/tenants to retrieve the accessible tenant list.
	•	Do not use this skill for domain actions. This skill is only for authentication and identity verification.

⸻

Example: Full Login + Identity Check (bash)

#!/usr/bin/env bash
set -euo pipefail

LOGIN_RESPONSE=$(curl -s -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"Email\": \"$ABSUITE_USER_EMAIL\", \"Password\": \"$ABSUITE_USER_PASSWORD\"}")

ABSUITE_ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
ABSUITE_REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken')

if [ "$ABSUITE_ACCESS_TOKEN" = "null" ] || [ -z "$ABSUITE_ACCESS_TOKEN" ]; then
  echo "Login failed."
  exit 1
fi

WHOAMI_RESPONSE=$(curl -s -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/WhoAmI" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN")

echo "Identity:"
echo "$WHOAMI_RESPONSE" | jq '.result'


⸻

Example: Full Login + Identity Check (PowerShell)

$loginBody = @{
    Email = $env:ABSUITE_USER_EMAIL
    Password = $env:ABSUITE_USER_PASSWORD
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod `
    -Uri "$env:ABSUITE_HOST_URL/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

if (-not $loginResponse.accessToken) {
    Write-Error "Login failed."
    exit 1
}

$accessToken = $loginResponse.accessToken
$refreshToken = $loginResponse.refreshToken

$headers = @{
    Authorization = "Bearer $accessToken"
}

$whoami = Invoke-RestMethod `
    -Uri "$env:ABSUITE_HOST_URL/api/v2/OAuth/WhoAmI" `
    -Method GET `
    -Headers $headers

Write-Host "Identity:"
$whoami.result | Format-List
