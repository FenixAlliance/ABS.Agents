---
name: absuite-identity
description: >
  Manage OAuth, OpenID Connect, and user identity in the Alliance Business Suite
  (ABS) via the REST API. Covers password sign-in, OAuth tokens, WhoAmI, user
  permissions, OIDC discovery/JWKS, and application permission/role grants. Most
  identity/auth flows are NOT tenant-scoped; a few reads are. Requires a bearer
  token for protected reads (see the absuite-login skill to authenticate). The
  identity service exposes NO PATCH endpoints.
---

# Alliance Business Suite — Identity (REST)

The ABS identity surface (`identityService`, backed by the OAuth controller and
related identity endpoints) handles the OAuth/OpenID-Connect plane: validating
credentials, issuing OAuth tokens, resolving the current user (`WhoAmI`),
enumerating permissions and role/permission grants, and serving OIDC discovery
documents and signing keys (JWKS). It is the lower-level identity layer that sits
underneath the basic login/WhoAmI convenience flow.

> **Scope / overlap.** This skill documents the `identityService`/OAuth endpoints.
> The simple email+password `/login` (basic auth → `accessToken`) and the
> convenience WhoAmI flow are covered by the **`absuite-login`** skill — use that
> to obtain the bearer token you pass here. This skill focuses on the OAuth/OIDC
> endpoints under `/api/v2/OAuth/*`, `/api/v2/Applications/*`,
> `/api/v2/Auth/Checker/*`, `/api/v2/IdentityService/Resource/*`, and
> `/connect/userinfo`.
>
> For the CLI equivalent, see **`absuite-identity-cli`**. For general REST
> conventions, see **`absuite-rest`**. To authenticate, see **`absuite-login`**.

## Authentication

Obtain a bearer token (basic login — see `absuite-login` for the full flow):

```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<your-email>", "password": "<your-password>"}'
```

Extract `accessToken` from the response and send it on every protected call:

```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

- **Base path:** `$ABSUITE_HOST_URL/api/v2/...` (plus host-level `/connect/userinfo`).
- **Response envelope:** `{ "isSuccess": bool, "errorMessage": str|null, "correlationId": str, "timestamp": str, "result": <data|array|bool|null> }`. Always check `isSuccess` and read the payload from `result`.
- **API version (optional, all endpoints):** every endpoint accepts an optional `api-version` query param or `x-api-version` request header. Omit unless you need to pin a version.

## Key Concepts

- **WhoAmI / AuthResult** — `GET /api/v2/OAuth/WhoAmI` returns the authorization
  result for the authenticated caller (identity + tenant context). `tenantId` is
  **optional** here: omit for the caller's default context, or pass it to resolve
  identity within a specific tenant.
- **Sign-in vs. Token** — `OAuth/SignIn` (POST) validates email+password and
  returns a token envelope; `OAuth/SignIn` (GET) checks/validates credentials
  without creating a session; `OAuth/Token` (POST) issues an OAuth token from a
  client-credentials / grant-type request.
- **Permissions** — `GET /api/v2/OAuth/Permissions` returns the permission-identifier
  list for a user within a tenant. `tenantId` is **REQUIRED**; `userId` is optional
  (defaults to the caller).
- **Application grants** — under `/api/v2/Applications/{appId}/*` you can read an
  application's required permissions, and the roles/permissions granted to it
  within a tenant (or through a specific role/enrollment).
- **OIDC discovery / JWKS** — `OAuth/{tenantId}/{applicationId}/.Well-Known/OpenId-Configuration`
  returns the OpenID discovery document; `OAuth/{applicationId}/Keys` returns the
  JSON Web Key Set (JWKS). Here `tenantId` and `applicationId` are **path** segments.
- **No tenant param on auth flows.** SignIn, Token, Checker/IsAuthenticated, Keys,
  Resource/message, and `/connect/userinfo` take **no** `tenantId` — do not add one.
- **No PATCH.** The identity service exposes **no PATCH endpoints**. Partial-update
  via JSON Patch is **not available** here. Use the dedicated POST/GET operations.

## Tenant scoping (read per-endpoint, do not assume)

| Endpoint | Tenant scoping |
|---|---|
| `GET /api/v2/OAuth/WhoAmI` | `tenantId` query — **optional** |
| `GET /api/v2/OAuth/Permissions` | `tenantId` query — **required** |
| `GET /api/v2/Applications/{appId}/GrantedPermissions` | `tenantId` query — **optional** |
| `GET /api/v2/Applications/{appId}/GrantedRoles` | `tenantId` query — **optional** |
| `GET /api/v2/Applications/{appId}/GrantedRoles/{securityRoleId}/GrantedPermissions` | `enrollmentId` query — **optional** (no tenantId) |
| `GET /api/v2/OAuth/{tenantId}/{applicationId}/.Well-Known/OpenId-Configuration` | `tenantId` is a **path** segment — required |
| All other identity endpoints | **No** tenant param — do not add one |

Where a `tenantId` query param applies, the platform also accepts the
`X-TenantId` request header interchangeably (e.g. `-H "X-TenantId: <tenant-guid>"`).

## Operations

### Sign in with password (issue token)

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OAuth/SignIn" \
  -H "Content-Type: application/json" \
  -d '{
        "email": "<your-email>",
        "password": "<your-password>"
      }'
```

Body is a `SigninModel`: `email` (string), `password` (string). Returns a
JSON Web Token envelope. No `tenantId`.

### Check password sign-in (validate credentials, no session)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/SignIn"
```

Verifies sign-in credentials and returns user details without creating a session.
No `tenantId`.

### Get an OAuth token

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OAuth/Token" \
  -H "Content-Type: application/json" \
  -d '{
        "client_id": "<client-id>",
        "client_secret": "<client-secret>",
        "grant_type": "<grant-type>",
        "requested_scopes": "<space-separated-scopes>",
        "requested_enrollment": "<enrollment-id>"
      }'
```

Body is an `OAuthTokenRequest`. All fields are strings:
`client_id`, `client_secret`, `grant_type`, `requested_scopes`,
`requested_enrollment`. Returns a JSON Web Token envelope. No `tenantId`.

### Check if the current user is authenticated

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Auth/Checker/IsAuthenticated" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Returns a boolean in `result`. No `tenantId`.

### Get current user identity (WhoAmI)

```bash
# Default context (no tenant)
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/WhoAmI" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Scoped to a specific tenant (optional)
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/WhoAmI?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`tenantId` (query) is **optional**. Returns an AuthResult envelope.

### Get user info (OpenID Connect userinfo)

```bash
# GET form
curl -X GET "$ABSUITE_HOST_URL/connect/userinfo" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# POST form
curl -X POST "$ABSUITE_HOST_URL/connect/userinfo" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Standard OIDC userinfo endpoint (host-level path, not under `/api/v2`). Use the
token obtained from `OAuth/Token` (or your bearer token). No `tenantId`.

### Get OpenID configuration (OIDC discovery)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/<tenant-guid>/<application-id>/.Well-Known/OpenId-Configuration"
```

`tenantId` and `applicationId` are **path** segments (both required). Returns the
OpenID discovery document. Typically a public (unauthenticated) read.

### Get JSON Web Key Set (JWKS)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/<application-id>/Keys"
```

`applicationId` is a **path** segment. Returns the JWKS (signing keys) envelope.
No `tenantId`. Typically a public read.

### Get user permissions

```bash
# tenantId is REQUIRED
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/Permissions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Optionally for a specific user
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/Permissions?tenantId=<tenant-guid>&userId=<user-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Returns a string list of permission identifiers. `tenantId` (query) is
**required**; `userId` (query) is optional (defaults to the caller).

### Get authenticated resource message

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/IdentityService/Resource/message" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Returns a message confirming the authenticated user's identity. Requires the
`abs_api` scope. No `tenantId`.

### Get application by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Applications/<application-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`appId` is a **path** segment. No `tenantId`.

### Get required permissions for an application

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Applications/<application-id>/RequiredPermissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`appId` is a **path** segment. No `tenantId`.

### Get granted tenant permissions for an application

```bash
# Optionally scope to a tenant
curl -X GET "$ABSUITE_HOST_URL/api/v2/Applications/<application-id>/GrantedPermissions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`appId` is a **path** segment. `tenantId` (query) is **optional**.

### Get granted tenant roles for an application

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Applications/<application-id>/GrantedRoles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`appId` is a **path** segment. `tenantId` (query) is **optional**.

### Get granted permissions for an application role

```bash
# Optionally scope to an enrollment
curl -X GET "$ABSUITE_HOST_URL/api/v2/Applications/<application-id>/GrantedRoles/<security-role-id>/GrantedPermissions?enrollmentId=<enrollment-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`appId` and `securityRoleId` are **path** segments. `enrollmentId` (query) is
**optional**. Note: this endpoint takes **no** `tenantId`.

## PATCH (JSON Patch)

**Not available.** The identity service exposes **no PATCH endpoints**. There is
no JSON-Patch surface on any identity/OAuth/Applications resource. Use the GET/POST
operations above. (PATCH/JSON-Patch is documented in other ABS REST skills where
the service actually supports it.)

## End-to-end workflow

A typical "authenticate, confirm, and enumerate access" flow using only verified
endpoints:

```bash
# 1. Issue a token by validating credentials (no session)
TOKEN_RESP=$(curl -s -X POST "$ABSUITE_HOST_URL/api/v2/OAuth/SignIn" \
  -H "Content-Type: application/json" \
  -d '{"email": "<your-email>", "password": "<your-password>"}')
# extract result.accessToken (shape per JsonWebToken envelope) into $ABSUITE_ACCESS_TOKEN

# 2. Confirm the session is authenticated
curl -X GET "$ABSUITE_HOST_URL/api/v2/Auth/Checker/IsAuthenticated" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 3. Resolve who you are
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/WhoAmI" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 4. List your permissions within a tenant (tenantId REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/Permissions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 5. Inspect an application's granted roles in that tenant
curl -X GET "$ABSUITE_HOST_URL/api/v2/Applications/<application-id>/GrantedRoles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| Sign in with password (issue token) | POST | `/api/v2/OAuth/SignIn` |
| Check password sign-in (validate, no session) | GET | `/api/v2/OAuth/SignIn` |
| Get OAuth token | POST | `/api/v2/OAuth/Token` |
| Check if authenticated | GET | `/api/v2/Auth/Checker/IsAuthenticated` |
| Get current user identity (WhoAmI) | GET | `/api/v2/OAuth/WhoAmI` *(tenantId opt)* |
| Get user info (OIDC userinfo) | GET | `/connect/userinfo` |
| Get user info (OIDC userinfo) | POST | `/connect/userinfo` |
| Get OpenID configuration (discovery) | GET | `/api/v2/OAuth/{tenantId}/{applicationId}/.Well-Known/OpenId-Configuration` |
| Get JSON Web Key Set (JWKS) | GET | `/api/v2/OAuth/{applicationId}/Keys` |
| Get user permissions | GET | `/api/v2/OAuth/Permissions` *(tenantId req)* |
| Get authenticated resource message | GET | `/api/v2/IdentityService/Resource/message` |
| Get application by ID | GET | `/api/v2/Applications/{appId}` |
| Get required permissions for an application | GET | `/api/v2/Applications/{appId}/RequiredPermissions` |
| Get granted tenant permissions for an application | GET | `/api/v2/Applications/{appId}/GrantedPermissions` *(tenantId opt)* |
| Get granted tenant roles for an application | GET | `/api/v2/Applications/{appId}/GrantedRoles` *(tenantId opt)* |
| Get granted permissions for an application role | GET | `/api/v2/Applications/{appId}/GrantedRoles/{securityRoleId}/GrantedPermissions` *(enrollmentId opt)* |

## Critical Rules

- **No PATCH on identity.** Do not attempt JSON-Patch against any identity/OAuth
  endpoint — there is none.
- **Tenant scoping is per-endpoint.** Only `OAuth/Permissions` *requires* `tenantId`
  (query); `WhoAmI`, `GrantedPermissions`, and `GrantedRoles` accept it
  *optionally*; OIDC discovery takes `tenantId` as a **path** segment. Everything
  else (SignIn, Token, Checker, Keys, Resource/message, userinfo,
  `GrantedRoles/.../GrantedPermissions`) takes **no** `tenantId` — do not add one.
- **Passwords and secrets are sensitive.** Never log, echo, or store `password`,
  `client_secret`, or issued tokens in plain text.
- **Use `absuite-login` for the basic flow.** For simple email+password auth and
  the convenience WhoAmI, prefer the `absuite-login` skill; reach for these
  endpoints when you need raw OAuth tokens, OIDC discovery/JWKS, or
  permission/role-grant queries.
