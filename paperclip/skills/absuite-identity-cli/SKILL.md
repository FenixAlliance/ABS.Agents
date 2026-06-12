---
name: absuite-identity-cli
description: >
  Manage OAuth, OpenID Connect, and user identity in the Alliance Business Suite
  (ABS) using the `absuite` CLI (service token `identity`). Covers password
  sign-in, OAuth tokens, WhoAmI, user permissions, OIDC discovery/JWKS, and
  application permission/role grants. Most identity/auth flows are NOT
  tenant-scoped; a few reads are. Requires an authenticated CLI session for
  protected reads (see absuite-login-cli). The identity service has NO PATCH and
  no partial-update commands — for raw HTTP, use the absuite-identity (REST) skill.
---

# Alliance Business Suite — Identity (CLI)

Drive the ABS identity surface through the `absuite` CLI's **`identity`** service.
This is the OAuth/OpenID-Connect plane: validating credentials, issuing OAuth
tokens, resolving the current user (`WhoAmI`), enumerating permissions and
role/permission grants, and serving OIDC discovery documents and signing keys
(JWKS).

> **Scope / overlap.** This skill covers the `identityService`/OAuth commands.
> The simple email+password login that stores your CLI session token is covered by
> **`absuite-login-cli`** — run that first to authenticate. Use the commands here
> when you need raw OAuth tokens, OIDC discovery/JWKS, or permission/role-grant
> queries.
>
> For raw HTTP / curl, or anything requiring atomic partial updates, see the
> **`absuite-identity`** (REST) skill. For general CLI conventions, see
> **`absuite-cli`**.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-identity` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-identity` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** (for protected reads): `absuite login` — see
   **`absuite-login-cli`**. Sign-in/token/discovery commands below can run without
   a prior session; permission/role/WhoAmI reads need a bearer token.
2. **Set a default tenant** (only needed for tenant-scoped commands):
   `absuite config set --tenant-id <tenant-guid>` — or pass `--TenantId <tenant-guid>`
   per call.
3. **Discover commands:** `absuite identity list-commands`, and `--help` on any
   command (e.g. `absuite identity Get-Permissions --help`).

## Command structure

```
absuite identity <Command> --Param value [--Param value ...]
```

The CLI exposes the identity service's generated function names directly. The
canonical function-name form is authoritative for this service (its generated
verbs are non-standard — e.g. WhoAmI is literally `Get-`). Use the exact names
below. Optional `--ApiVersion` / `--XApiVersion` may be added to any command but
are normally omitted.

## Operations

### Sign in with password (issue token)

```bash
absuite identity Invoke-PasswordSignInAsync --SigninModel '{"Email":"<your-email>","Password":"<your-password>"}'
```

Body is a `SigninModel` JSON string with fields `Email`, `Password`. Returns a
JSON Web Token envelope. No tenant.

### Check password sign-in (validate credentials, no session)

```bash
absuite identity Invoke-CheckPasswordSignInAsync
```

Verifies credentials and returns user details without creating a session. No tenant.

### Get an OAuth token

```bash
absuite identity Invoke-Token --OAuthTokenRequest '{
  "ClientId":"<client-id>",
  "ClientSecret":"<client-secret>",
  "GrantType":"<grant-type>",
  "RequestedScopes":"<space-separated-scopes>",
  "RequestedEnrollment":"<enrollment-id>"
}'
```

Body is an `OAuthTokenRequest` JSON string; all fields are strings: `ClientId`,
`ClientSecret`, `GrantType`, `RequestedScopes`, `RequestedEnrollment`. Returns a
JSON Web Token envelope. No tenant.

### Check if the current user is authenticated

```bash
absuite identity Invoke-IsAuthenticated
```

Returns a boolean. No tenant.

### Get current user identity (WhoAmI)

```bash
# Default context
absuite identity Get-

# Scoped to a specific tenant (optional)
absuite identity Get- --TenantId <tenant-guid>
```

`--TenantId` is **optional**. The WhoAmI command's generated name is literally
`Get-`. Returns an AuthResult envelope.

### Get user info (OpenID Connect userinfo)

```bash
# GET form
absuite identity Connect-UserinfoGet

# POST form
absuite identity Connect-UserinfoPost
```

Standard OIDC userinfo. No tenant.

### Get OpenID configuration (OIDC discovery)

```bash
absuite identity Get-OpenIdConfiguration --TenantId <tenant-guid> --ApplicationId <application-id>
```

`--TenantId` and `--ApplicationId` are **both required** (they are path segments).
Returns the OpenID discovery document.

### Get JSON Web Key Set (JWKS)

```bash
absuite identity Get-JwKs --ApplicationId <application-id>
```

`--ApplicationId` is **required**. Returns the JWKS envelope. No tenant.

### Get user permissions

```bash
# tenantId is REQUIRED
absuite identity Get-Permissions --TenantId <tenant-guid>

# optionally for a specific user
absuite identity Get-Permissions --TenantId <tenant-guid> --UserId <user-id>
```

`--TenantId` is **required**; `--UserId` is optional (defaults to the caller).
Returns a string list of permission identifiers.

### Get authenticated resource message

```bash
absuite identity Get-Message
```

Returns a message confirming the authenticated user's identity. Requires the
`abs_api` scope. No tenant.

### Get application by ID

```bash
absuite identity Get-Application --AppId <application-id>
```

`--AppId` is **required**. No tenant.

### Get required permissions for an application

```bash
absuite identity Get-RequiredPermissions --AppId <application-id>
```

`--AppId` is **required**. No tenant.

### Get granted tenant permissions for an application

```bash
absuite identity Get-GrantedTenantPermissions --AppId <application-id> --TenantId <tenant-guid>
```

`--AppId` is **required**; `--TenantId` is **optional**.

### Get granted tenant roles for an application

```bash
absuite identity Get-GrantedTenantRoles --AppId <application-id> --TenantId <tenant-guid>
```

`--AppId` is **required**; `--TenantId` is **optional**.

### Get granted permissions for an application role

```bash
absuite identity Get-GrantedEnrollmentPermissions --AppId <application-id> --SecurityRoleId <security-role-id> --EnrollmentId <enrollment-id>
```

`--AppId` and `--SecurityRoleId` are **required**; `--EnrollmentId` is **optional**.
Note: this command takes **no** `--TenantId`.

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| Sign in with password (issue token) | `absuite identity Invoke-PasswordSignInAsync --SigninModel '{...}'` |
| Check password sign-in (validate, no session) | `absuite identity Invoke-CheckPasswordSignInAsync` |
| Get OAuth token | `absuite identity Invoke-Token --OAuthTokenRequest '{...}'` |
| Check if authenticated | `absuite identity Invoke-IsAuthenticated` |
| Get current user identity (WhoAmI) | `absuite identity Get- [--TenantId <guid>]` |
| Get user info (OIDC, GET) | `absuite identity Connect-UserinfoGet` |
| Get user info (OIDC, POST) | `absuite identity Connect-UserinfoPost` |
| Get OpenID configuration (discovery) | `absuite identity Get-OpenIdConfiguration --TenantId <guid> --ApplicationId <app-id>` |
| Get JSON Web Key Set (JWKS) | `absuite identity Get-JwKs --ApplicationId <app-id>` |
| Get user permissions | `absuite identity Get-Permissions --TenantId <guid> [--UserId <id>]` |
| Get authenticated resource message | `absuite identity Get-Message` |
| Get application by ID | `absuite identity Get-Application --AppId <app-id>` |
| Get required permissions for an application | `absuite identity Get-RequiredPermissions --AppId <app-id>` |
| Get granted tenant permissions for an application | `absuite identity Get-GrantedTenantPermissions --AppId <app-id> [--TenantId <guid>]` |
| Get granted tenant roles for an application | `absuite identity Get-GrantedTenantRoles --AppId <app-id> [--TenantId <guid>]` |
| Get granted permissions for an application role | `absuite identity Get-GrantedEnrollmentPermissions --AppId <app-id> --SecurityRoleId <role-id> [--EnrollmentId <id>]` |

## Critical Rules

- **No PATCH / no partial updates.** The `absuite` CLI does not support patch
  operations, and the identity service exposes none anyway. There is nothing to
  partially update here.
- **Tenant scoping is per-command.** Only `Get-Permissions` *requires*
  `--TenantId`; `Get-` (WhoAmI), `Get-GrantedTenantPermissions`, and
  `Get-GrantedTenantRoles` accept it *optionally*; `Get-OpenIdConfiguration` takes
  `--TenantId` as a required path value. Everything else takes **no** `--TenantId`.
- **Exact command names matter.** This service's generated verbs are unusual
  (`Get-` for WhoAmI, `Invoke-*` for sign-in/token/auth-check, `Connect-Userinfo*`
  for userinfo). Confirm with `absuite identity list-commands` / `--help` if unsure.
- **Passwords and secrets are sensitive.** Never log, echo, or store `Password`,
  `ClientSecret`, or issued tokens in plain text.
- **Use `absuite login` for the basic flow.** For simple email+password auth that
  stores your session, prefer `absuite login` (`absuite-login-cli`). Use the
  commands here for raw OAuth tokens, OIDC discovery/JWKS, or permission/role-grant
  queries.
