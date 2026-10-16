---
name: absuite-login-cli
description: >
  Authenticate with the Alliance Business Suite (ABS) using the `absuite` CLI and
  verify your identity. Use when you need to log in with user credentials, configure
  the CLI base URL and default tenant, or confirm your ABS identity via WhoAmI
  through the CLI. Do NOT use for domain-specific ABS operations — only for
  authentication, configuration, and identity verification. For REST/HTTP login,
  see absuite-login.
---

# Alliance Business Suite — Authentication Skill (CLI)

Use this skill to establish and verify an authenticated ABS session with the **`absuite` CLI**. The CLI caches and manages the token for you. For the REST/HTTP equivalent, see `absuite-login`.

This skill is only for: logging in, configuring the CLI, and verifying identity. For domain operations, see `absuite-cli` (general) or the per-service `absuite-<domain>-cli` skills.

## Prerequisites

The `absuite` CLI must be installed and on `PATH`:

```bash
absuite --version
```

Expected: `absuite v1.0.0` (or later). The CLI is a self-contained executable — no runtime dependencies.

## Environment variables

Injected by the agent runtime — never hard-code these:

| Variable | Description |
|---|---|
| `ABSUITE_USER_EMAIL` | Email for ABS login. |
| `ABSUITE_USER_PASSWORD` | Password for ABS login. |
| `ABSUITE_HOST_URL` | Base URL of the ABS instance. No trailing slash. |

## Configuration

The CLI stores config in `~/.absuite/config.json` (tokens DPAPI-encrypted on Windows, user- and machine-scoped). These commands manage **local CLI state** and have no REST equivalent.

```bash
# Set the base URL (only if not the default https://absuite.net)
absuite config set --base-url $ABSUITE_HOST_URL

# Set a default tenant so you don't pass --TenantId on every call
absuite config set --tenant-id <tenant-guid>

# View current configuration
absuite config show
```

> The default tenant is auto-injected as `--TenantId` **only** on commands that take a tenant parameter. User-scoped / public commands (identity, `/Me` reads, global reference data) ignore it.

## Step 1 — Log in

```bash
absuite login --email $ABSUITE_USER_EMAIL --password $ABSUITE_USER_PASSWORD
```

If the base URL is not the default, include it:

```bash
absuite login --email $ABSUITE_USER_EMAIL --password $ABSUITE_USER_PASSWORD --base-url $ABSUITE_HOST_URL
```

On success the CLI caches the token and uses it automatically for all subsequent calls. It tracks expiry and warns when the token has expired.

> If `--password` is omitted the CLI prompts interactively. For agent use, always pass `--password` explicitly.

## Step 2 — Verify identity (WhoAmI)

```bash
absuite identity Get-WhoAmIAsync
```

Returns the standard envelope; read `result` for `userId`, `tenantId`, `enrollmentId`, `applicationId`.

To check identity within a specific tenant context:

```bash
absuite identity Get-WhoAmIAsync --TenantId <tenant-guid>
```

## Step 3 — Token expiry

The CLI checks expiry before each call and warns:

```
Access token expired. Run 'absuite login' to re-authenticate.
```

When you see this, re-run Step 1.

## Quick identity-check procedure

Run on wake-up or before any ABS-dependent workflow:

1. `absuite --version` — confirm the CLI is available.
2. `absuite identity Get-WhoAmIAsync`.
   - Success → session valid.
   - Token-expired / auth error → `absuite login --email $ABSUITE_USER_EMAIL --password $ABSUITE_USER_PASSWORD`, then retry.
3. Record the identity context for downstream use.

## Identity-adjacent reads via CLI

| Action | CLI command |
|---|---|
| My profile | `absuite users Get-MeAsync` |
| My tenants | `absuite users Get-CurrentUserTenantsAsync` |
| My enrollments | `absuite users Get-CurrentUserEnrollmentsAsync` |
| My pending invitations | `absuite users Get-CurrentUserInvitationAsync` |

> Discover exact commands with `absuite <service> list-commands` and `absuite <service> <command> --help`.

## Critical rules

- **Never hard-code credentials or host.** Use `ABSUITE_USER_EMAIL`, `ABSUITE_USER_PASSWORD`, `ABSUITE_HOST_URL`.
- **Never log or print credentials or tokens** unless deliberately debugging auth.
- **Always verify identity after login** — run `absuite identity Get-WhoAmIAsync`.
- **The CLI manages the token automatically** — no need to pass `Authorization` headers.
- This skill is for authentication only. For tenant onboarding, see `absuite-onboarding-cli`; for domain operations, see `absuite-cli` and the `absuite-<domain>-cli` skills.
