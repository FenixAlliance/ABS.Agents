---
name: absuite-identity
description: >
  Manage authentication, authorization, OpenID Connect, and user identity in the
  Alliance Business Suite (ABS) using the `absuite` CLI. Covers password sign-in,
  OAuth tokens, user info, permissions, enrolled roles, and OIDC configuration.
  Requires an authenticated CLI session for most operations.
---

# Alliance Business Suite — Identity Skill

Manage identity and authentication through the `absuite` CLI's `identity` service.

## Prerequisites

1. For sign-in operations, no prior authentication is needed.
2. For permission/role queries, **authenticate first** using `absuite login`.
3. **Discover commands**: `absuite identity list-commands`

## REST API Authentication

To call the API directly via REST instead of the CLI:

1. **Obtain a bearer token:**
```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$ABSUITE_USER_EMAIL'", "password": "'$ABSUITE_USER_PASSWORD'"}'
```
Extract the `accessToken` from the JSON response.

2. **Use the token in all subsequent requests:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **All REST endpoints use the base path:** `$ABSUITE_HOST_URL/api/v2/`

## Authentication

### Password Sign-In

```bash
absuite identity password-sign-in --Email user@example.com --Password "YourPassword"
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OAuth/SignIn" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "YourPassword"}'
```

### Check Password Sign-In (Validate Credentials)

```bash
absuite identity check-password-sign-in --Email user@example.com --Password "YourPassword"
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/SignIn" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get OAuth Token

```bash
absuite identity token --GrantType password --Username user@example.com --Password "YourPassword"
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OAuth/Token" \
  -H "Content-Type: application/json" \
  -d '{"client_id": "<client-id>", "client_secret": "<client-secret>", "grant_type": "password", "requested_scopes": "<scopes>"}'
```

### Check if Authenticated

```bash
absuite identity is-authenticated
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Auth/Checker/IsAuthenticated" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Current User Identity

```bash
absuite identity get-
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/WhoAmI" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get User Info (OpenID Connect)

```bash
absuite identity connect-userinfo-get
absuite identity connect-userinfo-post
```

**REST API equivalent:**
```bash
# UserInfo is typically available at the standard OIDC userinfo endpoint.
# Use the token obtained from the OAuth/Token endpoint.
```

## OpenID Connect Configuration

```bash
# Get OIDC discovery document
absuite identity get open-id-configuration

# Get JSON Web Key Set
absuite identity list jw-ks
```

**REST API equivalent:**
```bash
# OIDC discovery document
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/$TENANT_ID/$APPLICATION_ID/.Well-Known/OpenId-Configuration"

# JSON Web Key Set
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/$APPLICATION_ID/Keys"
```

## Permissions & Roles

### List User Permissions

```bash
absuite identity list permissions
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OAuth/Permissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Resource Message (Authenticated Endpoint)

```bash
absuite identity get message
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/IdentityService/Resource/message" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Application by ID

```bash
absuite identity get application --ApplicationId <app-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Applications/$APP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Granted Permissions for an Enrollment

```bash
absuite identity list granted-enrollment-permissions --ApplicationId <app-guid> --RoleId <role-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Applications/$APP_ID/GrantedRoles/$ROLE_ID/GrantedPermissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Granted Tenant Permissions

```bash
absuite identity list granted-tenant-permissions --ApplicationId <app-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Applications/$APP_ID/GrantedPermissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Granted Tenant Roles

```bash
absuite identity list granted-tenant-roles --ApplicationId <app-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Applications/$APP_ID/GrantedRoles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Required Permissions for an Application

```bash
absuite identity list required-permissions --ApplicationId <app-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Applications/$APP_ID/RequiredPermissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| Sign in with password | `absuite identity password-sign-in --Email <email> --Password <pwd>` |
| Get OAuth token | `absuite identity token --GrantType password --Username <email> --Password <pwd>` |
| Check authentication | `absuite identity is-authenticated` |
| Get current user | `absuite identity get-` |
| List permissions | `absuite identity list permissions` |
| Get OIDC config | `absuite identity get open-id-configuration` |
| Get JWKS | `absuite identity list jw-ks` |

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/OAuth/SignIn` | Sign in with password |
| GET | `/api/v2/OAuth/SignIn` | Check/validate password sign-in |
| POST | `/api/v2/OAuth/Token` | Get OAuth token |
| GET | `/api/v2/OAuth/WhoAmI` | Get current user identity |
| GET | `/api/v2/OAuth/Permissions` | List user permissions |
| GET | `/api/v2/OAuth/:appId/Keys` | Get JSON Web Key Set |
| GET | `/api/v2/OAuth/:tenantId/:appId/.Well-Known/OpenId-Configuration` | OIDC discovery |
| GET | `/api/v2/Auth/Checker/IsAuthenticated` | Check if authenticated |
| GET | `/api/v2/Applications/:appId` | Get application by ID |
| GET | `/api/v2/Applications/:appId/GrantedPermissions` | Granted tenant permissions |
| GET | `/api/v2/Applications/:appId/GrantedRoles` | Granted tenant roles |
| GET | `/api/v2/Applications/:appId/GrantedRoles/:roleId/GrantedPermissions` | Role permissions |
| GET | `/api/v2/Applications/:appId/RequiredPermissions` | Required permissions |
| GET | `/api/v2/IdentityService/Resource/message` | Authenticated resource message |

## Critical Rules

- **For CLI sessions, prefer `absuite login`** over direct `identity password-sign-in` — the login skill handles token storage.
- **`identity` is lower-level** — use it when you need raw OAuth tokens, OIDC discovery, or permission queries.
- **Passwords are sensitive.** Never log or store them in plain text.
