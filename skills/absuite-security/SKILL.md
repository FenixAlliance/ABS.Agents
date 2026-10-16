---
name: absuite-security
description: >
  Manage security roles, permissions, business applications, OAuth applications,
  OAuth authorizations, certificates, security/tenant logs, and webhook requests via
  the Alliance Business Suite (ABS) REST API. Covers full RBAC assignment/revocation
  across roles, permissions, enrollments, and applications, including atomic PATCH
  (JSON Patch) updates. All operations are tenant-scoped and require a bearer token
  (see the absuite-login skill to authenticate).
key: fenixalliance.absuite.security
version: 1.1.0
---

# Alliance Business Suite: Security (REST API)

Manage the ABS **SecurityService** purely over HTTP with `curl`. This service governs the
tenant's RBAC graph: **roles**, **permissions**, **business applications**, and
**OAuth applications/authorizations**, plus read-only **certificates**, **logs**, and
**webhook requests**. Permissions and roles are wired to **enrollments** (a user's
membership in a tenant) and to applications to control access.

Every SecurityService endpoint is **tenant-scoped** (`tenantId` is required on every
verb, including writes), with one exception: `Logs/Me` and `Logs/Me/Count` read the
signed-in user's own entries and take no tenant. Send a bearer token on every call.

> For the CLI equivalent, see `absuite-security-cli`. For general REST conventions
> (auth, the response envelope, tenant scoping), see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints for roles, permissions, business applications, logs, security logs, certificates and webhooks accept `$filter`, `$top`, `$skip`, `$orderby`, `$select`: page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). The OAuth application and OAuth authorization lists and counts do **not** take OData options. OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the resource**: treat it as an overwrite, not a merge. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) risks silent data loss. (Business applications are the exception in code: their PUT skips fields sent as `null` or omitted.)
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902): it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

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
- **Tenant scoping:** every tenant endpoint binds `tenantId` from the `?tenantId=<tenant-guid>`
  query string or, when that is absent, from the `X-TenantId: <tenant-guid>` header, on
  **every** verb (GET/POST/PUT/PATCH/DELETE). It is required: omitting both returns `400`,
  for reads and writes alike. The examples below use the query param.

## Key Concepts

- **Role** (`SecurityRole`): a named bundle of permissions. Fields: `name` (required),
  `description`.
- **Permission** (`SecurityPermission`): a single named capability. Fields: `name`
  (required), `description`.
- **Business Application** (`Applications`): an app registered in the tenant that roles
  and permissions can be granted to. Rich DTO (`name` required on create; many optional flags for
  OAuth login, SPA hosting, git repo, etc.).
- **OAuth Application** (`OAuthApplications`): an OpenIddict-style OAuth client.
  `displayName` is required; carries `clientId`, `clientSecret`, `redirectUris`, etc.
- **OAuth Authorization**: a granted authorization record (read-only); listable and
  filterable by `userId`.
- **Enrollment**: a user's membership in the tenant. Roles and permissions are assigned
  to enrollments to grant a user access.
- **Certificates / Logs / Security Logs / Webhooks**: read-only telemetry and audit
  surfaces (list + count only).
- **RBAC is bidirectional**: you can assign permission→role or role→permission; both
  reach the same edge.
- **Never print real secrets.** When reading OAuth applications, treat `clientSecret` as
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

# Create role  (name required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Manager",
    "description": "Can manage the sales pipeline and customer data"
  }'

# Update role (PUT: full replace; name required)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Senior Sales Manager",
    "description": "Expanded sales pipeline access"
  }'

# Patch role (PATCH: JSON Patch; see PATCH section)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/description", "value": "Updated description" }]'

# Delete role
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`SecurityRoleCreateDto` / `SecurityRoleUpdateDto` fields: `name` (required),
`description` (max 500 chars). (Create also accepts optional `id`, `timestamp`; if you
omit `id` the server generates one.)

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

# Which of the named permissions do I (the caller) hold?  (at most 32 comma-separated keys)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/Mine?tenantId=<tenant-guid>&keys=<permission-a>,<permission-b>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# -> result = { "<permission-a>": true, "<permission-b>": false }   (unknown keys are false)

# Create permission  (name required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "orders.read",
    "description": "Read access to orders"
  }'

# Update permission (PUT: full replace; name required)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "orders.read",
    "description": "Read-only access to orders"
  }'

# Patch permission (PATCH: JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/description", "value": "Read-only access to orders" }]'

# Delete permission
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/<permission-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`SecurityPermissionCreateDto` / `SecurityPermissionUpdateDto` fields: `name` (required),
`description` (max 500 chars). (Create also accepts optional `id`, `timestamp`.)

`Permissions/Mine` answers only for the signed-in caller (its own enrollment in the
tenant); more than 32 keys returns a validation error.

---

## RBAC: Assign & Revoke

These edges have **no request body**: the resources are identified entirely by path
IDs. Always include `?tenantId=`.

> **Grantor holds what it grants.** Every assign (grant) edge below checks that the
> **caller** holds, in this tenant, every permission being granted: the permission itself
> for a permission grant, or every permission the role carries for a role grant. This
> applies to permission→role, role→permission, role/permission→enrollment and
> role/permission→application. Otherwise the call fails with an insufficient-permissions
> error naming the permissions not held. `GET Permissions/GrantableFor/<enrollment-guid>`
> lists the permissions the caller may grant to that member. The by-enrollment reads
> (`Roles/ByEnrollment/...`, `Permissions/ByEnrollment/...`) only answer for enrollments
> in the caller's tenant; any other enrollment ID returns `404`.

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

# Reverse direction: assign role to permission
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

# Roles / permissions held by an enrollment  (enrollment must belong to this tenant, else 404)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/ByEnrollment/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/ByEnrollment/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Permissions the caller may grant to an enrollment
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/GrantableFor/<enrollment-guid>?tenantId=<tenant-guid>" \
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

# Create  (name required; all other fields optional)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CRM Portal",
    "namespace": "crm.portal",
    "displayName": "CRM Portal",
    "websiteUrl": "https://crm.example.com",
    "contactEmail": "ops@example.com",
    "isMultiTenant": false,
    "requireHttps": true,
    "enableWebOAuthLogin": true
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CRM Portal",
    "displayName": "CRM Portal (v2)",
    "isVerified": true,
    "markedForPublish": true
  }'

# Patch (PATCH: JSON Patch)
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

`BusinessApplicationCreateDto`: `name` is the only required field. Other fields (all
optional): `namespace`, `displayName`, `avatarURL`, `websiteUrl`, `isMultiTenant`,
`isVerified`, `isDisabled`, `isSinglePageApplication`, `isNativeOrDesktopApp`,
`contactEmail`, `privacyPolicyURL`, `termsAndConditionsURL`, `requireHttps`,
`requireAppSecret`, `enableClientOauthLogin`, `enableWebOAuthLogin`,
`enableDeviceOAuthLogin`, `allowAccessToSuiteSettings`, `requireWebOAuthReauthentication`,
`requireTwoFactorReauthorization`, `enableEmbeddedBrowserOAuthLogin`,
`useStrictModeForRedirectURIs`, `countryRestricted`, `spaUIEngine`,
`spaStaticFilesRootPath`, `spaRelativeAppPath`, `spaNpmStartScript`,
`spaNpmPublishScript`, `spaRelativeSourcePath`, `spaRelativeOutputPath`,
`useProxyToSpaDevelopmentServer`, `spaDevelopmentServerUri`, `enableGitRepoManagement`,
`gitRepoUrl` (plus optional `id`, `timestamp`). `BusinessApplicationUpdateDto` has the
same fields, all optional (its booleans are nullable), plus `markedForPublish`; it does
**not** accept `id`/`timestamp` (those are Create-only). The update skips any field sent
as `null` or omitted.

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
# OAuth applications: List / Count  (no OData options on these two)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID  (path segment is the OAuth application id)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/<oauth-application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (displayName required; never echo a real clientSecret)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Mobile App Client",
    "clientId": "<client-id>",
    "clientSecret": "<client-secret>",
    "consentType": "explicit",
    "redirectUris": "https://app.example.com/callback",
    "postLogoutRedirectUris": "https://app.example.com/signout"
  }'

# Update (PUT: full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/<oauth-application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Mobile App Client (prod)",
    "consentType": "explicit",
    "redirectUris": "https://app.example.com/callback"
  }'

# Patch (PATCH: JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/<oauth-application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/displayName", "value": "Mobile App Client (prod)" }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/<oauth-application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`OAuthApplicationCreateDto` fields: `displayName` (required), `clientId`, `clientSecret`,
`consentType`, `permissions`, `requirements`, `redirectUris`, `postLogoutRedirectUris`,
`logo` (plus optional `id`, `timestamp`). `OAuthApplicationUpdateDto` drops
`id`/`timestamp`/`clientId` and keeps `displayName`, `clientSecret`, `consentType`,
`permissions`, `requirements`, `redirectUris`, `postLogoutRedirectUris`, `logo`.

```bash
# OAuth authorizations: List (optionally filter by userId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Authorizations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Authorizations?tenantId=<tenant-guid>&userId=<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# OAuth authorizations: Count (optionally filter by userId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Authorizations/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# OAuth authorization: Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Authorizations/<authorization-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

OAuth authorizations are **read-only** (list / count / get-by-id). They have no
create/update/delete endpoints.

---

## Logs, Certificates & Webhooks (read-only)

All of the following are **list + count only**: no create/update/delete.

```bash
# Tenant logs
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Logs?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Logs/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# My own log entries (signed-in user only; no tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Logs/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Logs/Me/Count" \
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

PATCH lets you change a couple of fields atomically without resending the whole object,
which is safer than PUT under concurrent edits. The body is a JSON **array** of operations with
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

Example: verify-and-rename a business application in one atomic request:

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
> `/isVerified`), the same casing the API uses for JSON request and response bodies
> (e.g. `"displayName"`, `"isVerified"`).

---

## End-to-end workflow: grant a user access via a role

```bash
T="<tenant-guid>"
AUTH="-H Authorization:Bearer $ABSUITE_ACCESS_TOKEN"

# 1. Create a permission (send your own "id" so you know it up front)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions?tenantId=$T" $AUTH \
  -H "Content-Type: application/json" \
  -d '{"id":"<permission-guid>","name":"orders.read","description":"Read access to orders"}'
# -> 201; result.securityPermissionId = <permission-guid> (also in the Location header)

# 2. Create a role
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles?tenantId=$T" $AUTH \
  -H "Content-Type: application/json" \
  -d '{"id":"<role-guid>","name":"Sales Manager","description":"Sales pipeline access"}'
# -> 201; result.securityRoleId = <role-guid>

# 3. Attach the permission to the role (you must hold orders.read yourself)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/<role-guid>/Permissions/<permission-guid>?tenantId=$T" $AUTH

# 4. Assign the role to a user's enrollment (you must hold every permission the role carries)
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
| Which named permissions I hold | GET | `/api/v2/SecurityService/Permissions/Mine?keys=a,b,c` |
| Permissions I may grant to an enrollment | GET | `/api/v2/SecurityService/Permissions/GrantableFor/{enrollmentId}` |
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
| List my logs (no tenantId) | GET | `/api/v2/SecurityService/Logs/Me` |
| Count my logs (no tenantId) | GET | `/api/v2/SecurityService/Logs/Me/Count` |
| List security logs | GET | `/api/v2/SecurityService/SecurityLogs` |
| Count security logs | GET | `/api/v2/SecurityService/SecurityLogs/Count` |
| List security certificates | GET | `/api/v2/SecurityService/SecurityCertificates` |
| Count security certificates | GET | `/api/v2/SecurityService/SecurityCertificates/Count` |
| List webhook requests | GET | `/api/v2/SecurityService/Webhooks` |
| Count webhook requests | GET | `/api/v2/SecurityService/Webhooks/Count` |

## Critical Rules

- **Authenticate first** and send `Authorization: Bearer $ABSUITE_ACCESS_TOKEN` on every call.
- **Always pass `?tenantId=<tenant-guid>`** (or the `X-TenantId: <tenant-guid>` header) on
  every verb, including POST/PUT/PATCH/DELETE. Omitting both returns `400`. Only
  `Logs/Me` and `Logs/Me/Count` take no tenant.
- **Create roles and permissions before assigning them.**
- **You can only grant what you hold.** Every assign edge requires the caller to hold each
  permission being granted (all of a role's permissions for a role grant).
- **RBAC is bidirectional**: `Roles/{id}/Permissions/{permId}` and
  `Permissions/{id}/Roles/{roleId}` reach the same edge; use whichever is convenient.
- **PATCH bodies are JSON-Patch arrays** with **camelCase** `path`; PUT/POST bodies are
  JSON objects, also written in **camelCase** in this skill (the API serializes camelCase).
- **Never print real OAuth client secrets** or other credentials; use placeholders.
- **Logs, certificates, webhooks, and OAuth authorizations are read-only** (list/count,
  plus get-by-id for authorizations).
