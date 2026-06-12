---
name: absuite-security
description: >
  Manage security roles, permissions, business applications, OAuth applications,
  OAuth authorizations, certificates, security/tenant logs, and webhook requests via
  the Alliance Business Suite (ABS) REST API. Covers full RBAC assignment/revocation
  across roles, permissions, enrollments, and applications, including atomic PATCH
  (JSON Patch) updates. All operations are tenant-scoped and require a bearer token
  (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Security (REST API)

Manage the ABS **SecurityService** purely over HTTP with `curl`. This service governs the
tenant's RBAC graph: **roles**, **permissions**, **business applications**, and
**OAuth applications/authorizations**, plus read-only **certificates**, **logs**, and
**webhook requests**. Permissions and roles are wired to **enrollments** (a user's
membership in a tenant) and to applications to control access.

Every SecurityService endpoint is **tenant-scoped** (`tenantId` is required on every
verb, including writes). Send a bearer token on every call.

> For the CLI equivalent, see `absuite-security-cli`. For general REST conventions
> (auth, the response envelope, tenant scoping), see `absuite-rest`.

## Authentication

```bash
# 1. Obtain a bearer token
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"<your-email>","password":"<your-password>"}'
# -> { "accessToken": "...", ... }   (export it as $ABSUITE_ACCESS_TOKEN)

# 2. Send it on every request
#    -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

- **Base path:** `$ABSUITE_HOST_URL/api/v2/SecurityService/<Resource>`
- **Response envelope:** every response is
  `{ "isSuccess": bool, "errorMessage": str|null, "correlationId": str, "timestamp": str, "result": <data|array|int|null> }`.
  Always check `isSuccess`; read the payload from `result`.
- **Tenant scoping:** every SecurityService endpoint requires `?tenantId=<tenant-guid>`
  on **every** verb (GET/POST/PUT/PATCH/DELETE). Omitting it on a write returns `400`.
  The query param and the `X-TenantId: <tenant-guid>` header are interchangeable — examples
  below use the query param.

## Key Concepts

- **Role** (`SecurityRole`) — a named bundle of permissions. Fields: `Name` (required),
  `Description`.
- **Permission** (`SecurityPermission`) — a single named capability. Fields: `Name`
  (required), `Description`.
- **Business Application** (`Applications`) — an app registered in the tenant that roles
  and permissions can be granted to. Rich DTO (`Name` required; many optional flags for
  OAuth login, SPA hosting, git repo, etc.).
- **OAuth Application** (`OAuthApplications`) — an OpenIddict-style OAuth client.
  `DisplayName` is required; carries `ClientId`, `ClientSecret`, `RedirectUris`, etc.
- **OAuth Authorization** — a granted authorization record (read-only); listable and
  filterable by `userId`.
- **Enrollment** — a user's membership in the tenant. Roles and permissions are assigned
  to enrollments to grant a user access.
- **Certificates / Logs / Security Logs / Webhooks** — read-only telemetry and audit
  surfaces (list + count only).
- **RBAC is bidirectional** — you can assign permission→role or role→permission; both
  reach the same edge.
- **Never print real secrets.** When reading OAuth applications, treat `ClientSecret` as
  sensitive; use placeholders in any examples or logs.

---

## Roles

```bash
# List roles
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count roles
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get role by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create role  (Name required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Sales Manager",
    "Description": "Can manage the sales pipeline and customer data"
  }'

# Update role (PUT — full replace; Name required)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Senior Sales Manager",
    "Description": "Expanded sales pipeline access"
  }'

# Patch role (PATCH — JSON Patch; see PATCH section)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/description", "value": "Updated description" }]'

# Delete role
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`SecurityRoleCreateDto` / `SecurityRoleUpdateDto` fields: `Name` (required),
`Description`. (Create also accepts optional `Id`, `Timestamp`.)

## Permissions

```bash
# List permissions
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count permissions
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get permission by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create permission  (Name required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "orders.read",
    "Description": "Read access to orders"
  }'

# Update permission (PUT — full replace; Name required)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "orders.read",
    "Description": "Read-only access to orders"
  }'

# Patch permission (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/description", "value": "Read-only access to orders" }]'

# Delete permission
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`SecurityPermissionCreateDto` / `SecurityPermissionUpdateDto` fields: `Name` (required),
`Description`. (Create also accepts optional `Id`, `Timestamp`.)

---

## RBAC: Assign & Revoke

These edges have **no request body** — the resources are identified entirely by path
GUIDs. Always include `?tenantId=`.

### Permission ↔ Role

```bash
# Assign permission to role
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>/Permissions/<permission-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Revoke permission from role
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>/Permissions/<permission-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Permissions on a role
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>/Permissions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Reverse direction — assign role to permission
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>/Roles/<role-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Revoke role from permission
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>/Roles/<role-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Roles that hold a permission
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>/Roles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Role / Permission ↔ Enrollment

```bash
# Assign / revoke role to/from an enrollment
curl -X POST   "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>/Enrollments/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>/Enrollments/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assign / revoke permission to/from an enrollment
curl -X POST   "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>/Enrollments/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>/Enrollments/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Enrollments holding a role / permission
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>/Enrollments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>/Enrollments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Roles / permissions held by an enrollment
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/ByEnrollment/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/ByEnrollment/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Role / Permission ↔ Business Application

```bash
# Assign / revoke role to/from a business application
curl -X POST   "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>/Applications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>/Applications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assign / revoke permission to/from a business application
curl -X POST   "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>/Applications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>/Applications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Applications holding a role / permission
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>/Applications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>/Applications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Business Applications

```bash
# List / Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (Name required; all other fields optional)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "CRM Portal",
    "Namespace": "crm.portal",
    "DisplayName": "CRM Portal",
    "WebsiteUrl": "https://crm.example.com",
    "ContactEmail": "ops@example.com",
    "IsMultiTenant": false,
    "RequireHttps": true,
    "EnableWebOAuthLogin": true
  }'

# Update (PUT — full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "CRM Portal",
    "DisplayName": "CRM Portal (v2)",
    "IsVerified": true,
    "MarkedForPublish": true
  }'

# Patch (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/isVerified", "value": true },
    { "op": "replace", "path": "/displayName", "value": "CRM Portal (v2)" }
  ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`BusinessApplicationCreateDto` / `BusinessApplicationUpdateDto` — `Name` is the only
required field. Other fields (all optional): `Namespace`, `DisplayName`, `AvatarURL`,
`WebsiteUrl`, `IsMultiTenant`, `IsVerified`, `IsDisabled`, `IsSinglePageApplication`,
`IsNativeOrDesktopApp`, `ContactEmail`, `PrivacyPolicyURL`, `TermsAndConditionsURL`,
`RequireHttps`, `RequireAppSecret`, `EnableClientOauthLogin`, `EnableWebOAuthLogin`,
`EnableDeviceOAuthLogin`, `AllowAccessToSuiteSettings`, `RequireWebOAuthReauthentication`,
`RequireTwoFactorReauthorization`, `EnableEmbeddedBrowserOAuthLogin`,
`UseStrictModeForRedirectURIs`, `CountryRestricted`, `SpaUIEngine`,
`SpaStaticFilesRootPath`, `SpaRelativeAppPath`, `SpaNpmStartScript`,
`SpaNpmPublishScript`, `SpaRelativeSourcePath`, `SpaRelativeOutputPath`,
`UseProxyToSpaDevelopmentServer`, `SpaDevelopmentServerUri`, `EnableGitRepoManagement`,
`GitRepoUrl`. The **Update** DTO additionally accepts `MarkedForPublish`; it does **not**
accept `Id`/`Timestamp` (those are Create-only).

### Permissions & Roles granted to a Business Application

```bash
# Permissions granted to a business application
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/<application-guid>/Permissions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Roles granted to a business application
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/<application-guid>/Roles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## OAuth Applications & Authorizations

```bash
# OAuth applications — List / Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID  (path segment is the OAuth application id)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/<oauth-application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (DisplayName required; never echo a real ClientSecret)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "DisplayName": "Mobile App Client",
    "ClientId": "<client-id>",
    "ClientSecret": "<client-secret>",
    "ConsentType": "explicit",
    "RedirectUris": "https://app.example.com/callback",
    "PostLogoutRedirectUris": "https://app.example.com/signout"
  }'

# Update (PUT — full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/<oauth-application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "DisplayName": "Mobile App Client (prod)",
    "ConsentType": "explicit",
    "RedirectUris": "https://app.example.com/callback"
  }'

# Patch (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/<oauth-application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/displayName", "value": "Mobile App Client (prod)" }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/<oauth-application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`OAuthApplicationCreateDto` fields: `DisplayName` (required), `ClientId`, `ClientSecret`,
`ConsentType`, `Permissions`, `Requirements`, `RedirectUris`, `PostLogoutRedirectUris`,
`Logo` (plus optional `Id`, `Timestamp`). `OAuthApplicationUpdateDto` drops
`Id`/`Timestamp`/`ClientId` and keeps `DisplayName`, `ClientSecret`, `ConsentType`,
`Permissions`, `Requirements`, `RedirectUris`, `PostLogoutRedirectUris`, `Logo`.

```bash
# OAuth authorizations — List (optionally filter by userId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Authorizations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Authorizations?tenantId=<tenant-guid>&userId=<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# OAuth authorizations — Count (optionally filter by userId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Authorizations/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# OAuth authorization — Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Authorizations/<authorization-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

OAuth authorizations are **read-only** (list / count / get-by-id). They have no
create/update/delete endpoints.

---

## Logs, Certificates & Webhooks (read-only)

All of the following are **list + count only** — no create/update/delete.

```bash
# Tenant logs
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Logs?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Logs/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Security (audit) logs
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/SecurityLogs?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/SecurityLogs/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Security certificates
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/SecurityCertificates?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/SecurityCertificates/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Webhook requests
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Webhooks?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Webhooks/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## PATCH (JSON Patch / RFC 6902)

PATCH lets you change a couple of fields atomically without resending the whole object —
safer than PUT under concurrent edits. The body is a JSON **array** of operations with
`Content-Type: application/json`:

- `op` ∈ `add | remove | replace | move | copy | test`
- `path` / `from` are JSON-Pointer strings (leading `/`, **camelCase** field name)

Four SecurityService aggregates support PATCH:

| Aggregate | PATCH path |
|---|---|
| Role | `/api/v2/SecurityService/Roles/<role-guid>` |
| Permission | `/api/v2/SecurityService/Permissions/<permission-guid>` |
| Business Application | `/api/v2/SecurityService/Applications/<application-guid>` |
| OAuth Application | `/api/v2/SecurityService/OAuthApplications/<oauth-application-guid>` |

Example — verify-and-rename a business application in one atomic request:

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "test",    "path": "/isDisabled",  "value": false },
    { "op": "replace", "path": "/isVerified",  "value": true },
    { "op": "replace", "path": "/displayName", "value": "CRM Portal (verified)" }
  ]'
```

> Note: JSON-Patch `path` uses **camelCase** field names (e.g. `/displayName`,
> `/isVerified`), whereas the PUT/POST request bodies use **PascalCase** keys
> (e.g. `"DisplayName"`, `"IsVerified"`).

---

## End-to-end workflow: grant a user access via a role

```bash
T="<tenant-guid>"
AUTH="-H Authorization:Bearer $ABSUITE_ACCESS_TOKEN"

# 1. Create a permission
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions?tenantId=$T" $AUTH \
  -H "Content-Type: application/json" \
  -d '{"Name":"orders.read","Description":"Read access to orders"}'
# -> result.id = <permission-guid>

# 2. Create a role
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles?tenantId=$T" $AUTH \
  -H "Content-Type: application/json" \
  -d '{"Name":"Sales Manager","Description":"Sales pipeline access"}'
# -> result.id = <role-guid>

# 3. Attach the permission to the role
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>/Permissions/<permission-guid>?tenantId=$T" $AUTH

# 4. Assign the role to a user's enrollment
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>/Enrollments/<enrollment-guid>?tenantId=$T" $AUTH

# 5. Verify what the enrollment now holds
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/ByEnrollment/<enrollment-guid>?tenantId=$T" $AUTH
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/ByEnrollment/<enrollment-guid>?tenantId=$T" $AUTH

# 6. Tweak the role description atomically (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>?tenantId=$T" $AUTH \
  -H "Content-Type: application/json" \
  -d '[{"op":"replace","path":"/description","value":"Sales pipeline + order read"}]'
```

---

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| List roles | GET | `/api/v2/SecurityService/Roles` |
| Count roles | GET | `/api/v2/SecurityService/Roles/Count` |
| Get role | GET | `/api/v2/SecurityService/Roles/{securityRoleId}` |
| Create role | POST | `/api/v2/SecurityService/Roles` |
| Update role | PUT | `/api/v2/SecurityService/Roles/{securityRoleId}` |
| **Patch role** | **PATCH** | `/api/v2/SecurityService/Roles/{securityRoleId}` |
| Delete role | DELETE | `/api/v2/SecurityService/Roles/{securityRoleId}` |
| Permissions on role | GET | `/api/v2/SecurityService/Roles/{securityRoleId}/Permissions` |
| Assign permission to role | POST | `/api/v2/SecurityService/Roles/{securityRoleId}/Permissions/{securityPermissionId}` |
| Revoke permission from role | DELETE | `/api/v2/SecurityService/Roles/{securityRoleId}/Permissions/{securityPermissionId}` |
| Applications on role | GET | `/api/v2/SecurityService/Roles/{securityRoleId}/Applications` |
| Assign role to application | POST | `/api/v2/SecurityService/Roles/{securityRoleId}/Applications/{applicationId}` |
| Revoke role from application | DELETE | `/api/v2/SecurityService/Roles/{securityRoleId}/Applications/{applicationId}` |
| Enrollments on role | GET | `/api/v2/SecurityService/Roles/{securityRoleId}/Enrollments` |
| Assign role to enrollment | POST | `/api/v2/SecurityService/Roles/{securityRoleId}/Enrollments/{enrollmentId}` |
| Revoke role from enrollment | DELETE | `/api/v2/SecurityService/Roles/{securityRoleId}/Enrollments/{enrollmentId}` |
| Roles by enrollment | GET | `/api/v2/SecurityService/Roles/ByEnrollment/{enrollmentId}` |
| List permissions | GET | `/api/v2/SecurityService/Permissions` |
| Count permissions | GET | `/api/v2/SecurityService/Permissions/Count` |
| Get permission | GET | `/api/v2/SecurityService/Permissions/{securityPermissionId}` |
| Create permission | POST | `/api/v2/SecurityService/Permissions` |
| Update permission | PUT | `/api/v2/SecurityService/Permissions/{securityPermissionId}` |
| **Patch permission** | **PATCH** | `/api/v2/SecurityService/Permissions/{securityPermissionId}` |
| Delete permission | DELETE | `/api/v2/SecurityService/Permissions/{securityPermissionId}` |
| Roles on permission | GET | `/api/v2/SecurityService/Permissions/{securityPermissionId}/Roles` |
| Assign role to permission | POST | `/api/v2/SecurityService/Permissions/{securityPermissionId}/Roles/{securityRoleId}` |
| Revoke role from permission | DELETE | `/api/v2/SecurityService/Permissions/{securityPermissionId}/Roles/{securityRoleId}` |
| Applications on permission | GET | `/api/v2/SecurityService/Permissions/{securityPermissionId}/Applications` |
| Assign permission to application | POST | `/api/v2/SecurityService/Permissions/{securityPermissionId}/Applications/{applicationId}` |
| Revoke permission from application | DELETE | `/api/v2/SecurityService/Permissions/{securityPermissionId}/Applications/{applicationId}` |
| Enrollments on permission | GET | `/api/v2/SecurityService/Permissions/{securityPermissionId}/Enrollments` |
| Assign permission to enrollment | POST | `/api/v2/SecurityService/Permissions/{securityPermissionId}/Enrollments/{enrollmentId}` |
| Revoke permission from enrollment | DELETE | `/api/v2/SecurityService/Permissions/{securityPermissionId}/Enrollments/{enrollmentId}` |
| Permissions by enrollment | GET | `/api/v2/SecurityService/Permissions/ByEnrollment/{enrollmentId}` |
| List business applications | GET | `/api/v2/SecurityService/Applications` |
| Count business applications | GET | `/api/v2/SecurityService/Applications/Count` |
| Get business application | GET | `/api/v2/SecurityService/Applications/{applicationId}` |
| Create business application | POST | `/api/v2/SecurityService/Applications` |
| Update business application | PUT | `/api/v2/SecurityService/Applications/{applicationId}` |
| **Patch business application** | **PATCH** | `/api/v2/SecurityService/Applications/{applicationId}` |
| Delete business application | DELETE | `/api/v2/SecurityService/Applications/{applicationId}` |
| Permissions by application | GET | `/api/v2/SecurityService/Applications/{applicationId}/Permissions` |
| Roles by application | GET | `/api/v2/SecurityService/Applications/{applicationId}/Roles` |
| List OAuth applications | GET | `/api/v2/SecurityService/OAuthApplications` |
| Count OAuth applications | GET | `/api/v2/SecurityService/OAuthApplications/Count` |
| Get OAuth application | GET | `/api/v2/SecurityService/OAuthApplications/{applicationId}` |
| Create OAuth application | POST | `/api/v2/SecurityService/OAuthApplications` |
| Update OAuth application | PUT | `/api/v2/SecurityService/OAuthApplications/{applicationId}` |
| **Patch OAuth application** | **PATCH** | `/api/v2/SecurityService/OAuthApplications/{applicationId}` |
| Delete OAuth application | DELETE | `/api/v2/SecurityService/OAuthApplications/{applicationId}` |
| List OAuth authorizations | GET | `/api/v2/SecurityService/OAuthApplications/Authorizations` |
| Count OAuth authorizations | GET | `/api/v2/SecurityService/OAuthApplications/Authorizations/Count` |
| Get OAuth authorization | GET | `/api/v2/SecurityService/OAuthApplications/Authorizations/{authorizationId}` |
| List tenant logs | GET | `/api/v2/SecurityService/Logs` |
| Count tenant logs | GET | `/api/v2/SecurityService/Logs/Count` |
| List security logs | GET | `/api/v2/SecurityService/SecurityLogs` |
| Count security logs | GET | `/api/v2/SecurityService/SecurityLogs/Count` |
| List security certificates | GET | `/api/v2/SecurityService/SecurityCertificates` |
| Count security certificates | GET | `/api/v2/SecurityService/SecurityCertificates/Count` |
| List webhook requests | GET | `/api/v2/SecurityService/Webhooks` |
| Count webhook requests | GET | `/api/v2/SecurityService/Webhooks/Count` |

## Critical Rules

- **Authenticate first** and send `Authorization: Bearer $ABSUITE_ACCESS_TOKEN` on every call.
- **Always pass `?tenantId=<tenant-guid>`** — on every verb, including POST/PUT/PATCH/DELETE.
  Omitting it on a write returns `400`. (`X-TenantId: <tenant-guid>` header is equivalent.)
- **Create roles and permissions before assigning them.**
- **RBAC is bidirectional** — `Roles/{id}/Permissions/{permId}` and
  `Permissions/{id}/Roles/{roleId}` reach the same edge; use whichever is convenient.
- **PATCH bodies are JSON-Patch arrays** with **camelCase** `path`; PUT/POST bodies are
  objects with **PascalCase** keys.
- **Never print real OAuth client secrets** or other credentials — use placeholders.
- **Logs, certificates, webhooks, and OAuth authorizations are read-only** (list/count,
  plus get-by-id for authorizations).
