---
name: absuite-security-cli
description: >
  Manage security roles, permissions, business applications, OAuth applications,
  OAuth authorizations, certificates, security/tenant logs, and webhook requests using
  the `absuite` CLI. Covers full RBAC assignment/revocation via list/count/get/create/
  update/delete commands plus assign/revoke actions. Requires an authenticated CLI
  session (see absuite-login-cli). For atomic PATCH updates or raw HTTP, use the
  absuite-security (REST) skill.
---

# Alliance Business Suite — Security (CLI)

Drive the ABS **SecurityService** through the `absuite` CLI's **`security`** service.
This service governs the tenant's RBAC graph: **roles**, **permissions**,
**business applications**, and **OAuth applications/authorizations**, plus read-only
**certificates**, **logs**, and **webhook requests**. Permissions and roles are wired to
**enrollments** (a user's membership in a tenant) and to applications to grant access.

Every command is **tenant-scoped** — pass `--TenantId <tenant-guid>` (or set a default,
below).

> The CLI does **not** support PATCH (JSON Patch) or raw HTTP. For atomic partial
> updates or `curl`, use the `absuite-security` (REST) skill. For general CLI usage
> (install, config, output), see `absuite-cli`.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-security` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-security` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first**: `absuite login` (see the `absuite-login-cli` skill).
2. **Set your tenant** once as a default, or pass it on every call:
   ```bash
   absuite config set --tenant-id <tenant-guid>     # default for all commands
   #   ...or per call:  --TenantId <tenant-guid>
   ```
3. **Discover commands**:
   ```bash
   absuite security list-commands
   absuite security <verb> <entity> --help
   ```

## Command structure

```
absuite security <verb> <entity> --Param value
```

- **Verbs**: `list`, `count`, `search`, `get`, `create`, `update`, `delete`, plus
  service actions (`set` / `revoke-*` for RBAC edges).
- The canonical **function-name form** also works and maps 1:1 to the PowerShell SDK
  cmdlets, e.g. `absuite security Get-RolesAsync`, `absuite security New-RoleAsync`,
  `absuite security Set-PermissionToRoleAsync`. Both forms are shown below.
- **JSON DTO params** are passed as a single-quoted JSON string with the **same
  PascalCase field names** as the REST API, e.g. `--SecurityRoleCreateDto '{...}'`.

Throughout, `$TENANT_ID` stands for your tenant GUID (or rely on the configured default
and drop `--TenantId`).

---

## Roles

```bash
# List   (function form: Get-RolesAsync)
absuite security list roles --TenantId $TENANT_ID

# Count  (Get-RolesCountAsync)
absuite security count roles --TenantId $TENANT_ID

# Search (client-side filter over the list)
absuite security search roles --TenantId $TENANT_ID --Query "Sales"

# Get by ID  (Get-RoleAsync)
absuite security get role --TenantId $TENANT_ID --SecurityRoleId <role-guid>

# Create  (New-RoleAsync)  — Name required
absuite security create role --TenantId $TENANT_ID --SecurityRoleCreateDto '{
  "Name": "Sales Manager",
  "Description": "Can manage the sales pipeline and customer data"
}'

# Update  (Update-RoleAsync)  — Name required
absuite security update role --TenantId $TENANT_ID --SecurityRoleId <role-guid> --SecurityRoleUpdateDto '{
  "Name": "Senior Sales Manager",
  "Description": "Expanded sales pipeline access"
}'

# Delete  (Invoke-DeleteRoleAsync)
absuite security delete role --TenantId $TENANT_ID --SecurityRoleId <role-guid>
```

`SecurityRoleCreateDto` / `SecurityRoleUpdateDto` fields: `Name` (required), `Description`.

## Permissions

```bash
# List   (Get-PermissionsAsync)
absuite security list permissions --TenantId $TENANT_ID

# Count  (Get-PermissionsCountAsync)
absuite security count permissions --TenantId $TENANT_ID

# Search
absuite security search permissions --TenantId $TENANT_ID --Query "orders"

# Get by ID  (Get-PermissionAsync)
absuite security get permission --TenantId $TENANT_ID --SecurityPermissionId <permission-guid>

# Create  (New-PermissionAsync)  — Name required
absuite security create permission --TenantId $TENANT_ID --SecurityPermissionCreateDto '{
  "Name": "orders.read",
  "Description": "Read access to orders"
}'

# Update  (Update-PermissionAsync)  — Name required
absuite security update permission --TenantId $TENANT_ID --SecurityPermissionId <permission-guid> --SecurityPermissionUpdateDto '{
  "Name": "orders.read",
  "Description": "Read-only access to orders"
}'

# Delete  (Invoke-DeletePermissionAsync)
absuite security delete permission --TenantId $TENANT_ID --SecurityPermissionId <permission-guid>
```

`SecurityPermissionCreateDto` / `SecurityPermissionUpdateDto` fields: `Name` (required),
`Description`.

---

## RBAC: Assign & Revoke

These edges take no DTO — just the path GUIDs. RBAC is bidirectional, so either
direction reaches the same edge.

### Permission ↔ Role

```bash
# Assign permission to role        (Set-PermissionToRoleAsync)
absuite security set permission-to-role --TenantId $TENANT_ID --SecurityRoleId <role-guid> --SecurityPermissionId <permission-guid>

# Revoke permission from role      (Revoke-PermissionFromRoleAsync)
absuite security revoke permission-from-role --TenantId $TENANT_ID --SecurityRoleId <role-guid> --SecurityPermissionId <permission-guid>

# Permissions on a role            (Get-RolePermissionsAsync)
absuite security get role-permissions --TenantId $TENANT_ID --SecurityRoleId <role-guid>

# Reverse — assign role to permission   (Set-RoleToPermissionAsync)
absuite security set role-to-permission --TenantId $TENANT_ID --SecurityPermissionId <permission-guid> --SecurityRoleId <role-guid>

# Revoke role from permission      (Revoke-RoleFromPermissionAsync)
absuite security revoke role-from-permission --TenantId $TENANT_ID --SecurityPermissionId <permission-guid> --SecurityRoleId <role-guid>

# Roles that hold a permission     (Get-RolesByPermissionAsync)
absuite security get roles-by-permission --TenantId $TENANT_ID --SecurityPermissionId <permission-guid>
```

### Role / Permission ↔ Enrollment

```bash
# Role <-> enrollment
absuite security set    role-to-enrollment     --TenantId $TENANT_ID --SecurityRoleId <role-guid> --EnrollmentId <enrollment-guid>   # Set-RoleToEnrollmentAsync
absuite security revoke role-from-enrollment   --TenantId $TENANT_ID --SecurityRoleId <role-guid> --EnrollmentId <enrollment-guid>   # Revoke-RoleFromEnrollmentAsync

# Permission <-> enrollment
absuite security set    permission-to-enrollment   --TenantId $TENANT_ID --SecurityPermissionId <permission-guid> --EnrollmentId <enrollment-guid>   # Set-PermissionToEnrollmentAsync
absuite security revoke permission-from-enrollment --TenantId $TENANT_ID --SecurityPermissionId <permission-guid> --EnrollmentId <enrollment-guid>   # Revoke-PermissionFromEnrollmentAsync

# Enrollments holding a role / permission
absuite security get enrollments-by-role       --TenantId $TENANT_ID --SecurityRoleId <role-guid>             # Get-EnrollmentsByRoleAsync
absuite security get enrollments-by-permission --TenantId $TENANT_ID --SecurityPermissionId <permission-guid> # Get-EnrollmentsByPermissionAsync

# Roles / permissions held by an enrollment
absuite security get roles-by-enrollment       --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>   # Get-RolesByEnrollmentAsync
absuite security get permissions-by-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>   # Get-PermissionsByEnrollmentAsync
```

### Role / Permission ↔ Business Application

```bash
# Role <-> business application
absuite security set    role-to-business-application   --TenantId $TENANT_ID --SecurityRoleId <role-guid> --ApplicationId <application-guid>   # Set-RoleToBusinessApplicationAsync
absuite security revoke role-from-business-application --TenantId $TENANT_ID --SecurityRoleId <role-guid> --ApplicationId <application-guid>   # Revoke-RoleFromBusinessApplicationAsync

# Permission <-> business application
absuite security set    permission-to-business-application   --TenantId $TENANT_ID --SecurityPermissionId <permission-guid> --ApplicationId <application-guid>   # Set-PermissionToBusinessApplicationAsync
absuite security revoke permission-from-business-application --TenantId $TENANT_ID --SecurityPermissionId <permission-guid> --ApplicationId <application-guid>   # Revoke-PermissionFromBusinessApplicationAsync

# Applications holding a role / permission
absuite security get applications-by-role       --TenantId $TENANT_ID --SecurityRoleId <role-guid>             # Get-ApplicationsByRoleAsync
absuite security get applications-by-permission --TenantId $TENANT_ID --SecurityPermissionId <permission-guid> # Get-ApplicationsByPermissionAsync
```

---

## Business Applications

```bash
# List   (Get-BusinessApplicationsAsync)
absuite security list business-applications --TenantId $TENANT_ID

# Count  (Get-BusinessApplicationsCountAsync)
absuite security count business-applications --TenantId $TENANT_ID

# Search
absuite security search business-applications --TenantId $TENANT_ID --Query "CRM"

# Get by ID  (Get-BusinessApplicationByIdAsync)  — path param is ApplicationId
absuite security get business-application --TenantId $TENANT_ID --ApplicationId <application-guid>

# Create  (New-BusinessApplicationAsync)  — Name required; all else optional
absuite security create business-application --TenantId $TENANT_ID --BusinessApplicationCreateDto '{
  "Name": "CRM Portal",
  "Namespace": "crm.portal",
  "DisplayName": "CRM Portal",
  "WebsiteUrl": "https://crm.example.com",
  "ContactEmail": "ops@example.com",
  "IsMultiTenant": false,
  "RequireHttps": true,
  "EnableWebOAuthLogin": true
}'

# Update  (Update-BusinessApplicationAsync)
absuite security update business-application --TenantId $TENANT_ID --ApplicationId <application-guid> --BusinessApplicationUpdateDto '{
  "Name": "CRM Portal",
  "DisplayName": "CRM Portal (v2)",
  "IsVerified": true,
  "MarkedForPublish": true
}'

# Delete  (Invoke-DeleteBusinessApplicationAsync)
absuite security delete business-application --TenantId $TENANT_ID --ApplicationId <application-guid>

# Permissions / Roles granted to a business application
absuite security get permissions-by-application --TenantId $TENANT_ID --ApplicationId <application-guid>   # Get-PermissionsByApplicationAsync
absuite security get roles-by-application        --TenantId $TENANT_ID --ApplicationId <application-guid>   # Get-RolesByApplicationAsync
```

`BusinessApplicationCreateDto` — only `Name` is required. Optional fields: `Namespace`,
`DisplayName`, `AvatarURL`, `WebsiteUrl`, `IsMultiTenant`, `IsVerified`, `IsDisabled`,
`IsSinglePageApplication`, `IsNativeOrDesktopApp`, `ContactEmail`, `PrivacyPolicyURL`,
`TermsAndConditionsURL`, `RequireHttps`, `RequireAppSecret`, `EnableClientOauthLogin`,
`EnableWebOAuthLogin`, `EnableDeviceOAuthLogin`, `AllowAccessToSuiteSettings`,
`RequireWebOAuthReauthentication`, `RequireTwoFactorReauthorization`,
`EnableEmbeddedBrowserOAuthLogin`, `UseStrictModeForRedirectURIs`, `CountryRestricted`,
`SpaUIEngine`, `SpaStaticFilesRootPath`, `SpaRelativeAppPath`, `SpaNpmStartScript`,
`SpaNpmPublishScript`, `SpaRelativeSourcePath`, `SpaRelativeOutputPath`,
`UseProxyToSpaDevelopmentServer`, `SpaDevelopmentServerUri`, `EnableGitRepoManagement`,
`GitRepoUrl`. `BusinessApplicationUpdateDto` adds `MarkedForPublish` and omits
`Id`/`Timestamp`.

---

## OAuth Applications & Authorizations

```bash
# OAuth applications — List / Count
absuite security list o-auth-applications  --TenantId $TENANT_ID    # Get-OAuthApplicationsAsync
absuite security count o-auth-applications --TenantId $TENANT_ID    # Get-OAuthApplicationsCountAsync

# Get by ID  (Get-OAuthApplicationByIdAsync)  — path param is ApplicationId
absuite security get o-auth-application --TenantId $TENANT_ID --ApplicationId <oauth-application-guid>

# Create  (New-OAuthApplicationAsync)  — DisplayName required; never echo a real ClientSecret
absuite security create o-auth-application --TenantId $TENANT_ID --OAuthApplicationCreateDto '{
  "DisplayName": "Mobile App Client",
  "ClientId": "<client-id>",
  "ClientSecret": "<client-secret>",
  "ConsentType": "explicit",
  "RedirectUris": "https://app.example.com/callback",
  "PostLogoutRedirectUris": "https://app.example.com/signout"
}'

# Update  (Update-OAuthApplicationAsync)
absuite security update o-auth-application --TenantId $TENANT_ID --ApplicationId <oauth-application-guid> --OAuthApplicationUpdateDto '{
  "DisplayName": "Mobile App Client (prod)",
  "ConsentType": "explicit",
  "RedirectUris": "https://app.example.com/callback"
}'

# Delete  (Invoke-DeleteOAuthApplicationAsync)
absuite security delete o-auth-application --TenantId $TENANT_ID --ApplicationId <oauth-application-guid>

# OAuth authorizations (read-only) — optionally filter by UserId
absuite security list  o-auth-authorizations --TenantId $TENANT_ID                       # Get-OAuthAuthorizationsAsync
absuite security list  o-auth-authorizations --TenantId $TENANT_ID --UserId <user-guid>
absuite security count o-auth-authorizations --TenantId $TENANT_ID                       # Get-OAuthAuthorizationsCountAsync
absuite security get   o-auth-authorization  --TenantId $TENANT_ID --AuthorizationId <authorization-guid>   # Get-OAuthAuthorizationByIdAsync
```

`OAuthApplicationCreateDto` fields: `DisplayName` (required), `ClientId`, `ClientSecret`,
`ConsentType`, `Permissions`, `Requirements`, `RedirectUris`, `PostLogoutRedirectUris`,
`Logo`. `OAuthApplicationUpdateDto` keeps the same minus `ClientId`/`Id`/`Timestamp`.
OAuth **authorizations** are read-only (no create/update/delete).

---

## Logs, Certificates & Webhooks (read-only)

All of these are **list + count only**.

```bash
# Tenant logs
absuite security list  logs --TenantId $TENANT_ID     # Get-LogsAsync
absuite security count logs --TenantId $TENANT_ID     # Get-LogsCountAsync

# Security (audit) logs
absuite security list  security-logs --TenantId $TENANT_ID   # Get-SecurityLogsAsync
absuite security count security-logs --TenantId $TENANT_ID   # Get-SecurityLogsCountAsync

# Security certificates
absuite security list  security-certificates --TenantId $TENANT_ID   # Get-SecurityCertificatesAsync
absuite security count security-certificates --TenantId $TENANT_ID   # Get-SecurityCertificatesCountAsync

# Webhook requests
absuite security list  webhook-requests --TenantId $TENANT_ID   # Get-WebhookRequestsAsync
absuite security count webhook-requests --TenantId $TENANT_ID   # Get-WebhookRequestsCountAsync
```

---

## End-to-end workflow: grant a user access via a role

```bash
# 1. Create a permission, capture its id from the result
absuite security create permission --TenantId $TENANT_ID --SecurityPermissionCreateDto '{"Name":"orders.read","Description":"Read access to orders"}'

# 2. Create a role, capture its id
absuite security create role --TenantId $TENANT_ID --SecurityRoleCreateDto '{"Name":"Sales Manager","Description":"Sales pipeline access"}'

# 3. Attach the permission to the role
absuite security set permission-to-role --TenantId $TENANT_ID --SecurityRoleId <role-guid> --SecurityPermissionId <permission-guid>

# 4. Assign the role to a user's enrollment
absuite security set role-to-enrollment --TenantId $TENANT_ID --SecurityRoleId <role-guid> --EnrollmentId <enrollment-guid>

# 5. Verify what the enrollment now holds
absuite security get roles-by-enrollment       --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>
absuite security get permissions-by-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>
```

> Need to flip a single field atomically (e.g. just `Description`) without resending the
> whole object? That is a PATCH — use the `absuite-security` (REST) skill; the CLI's
> `update` performs a full PUT replace.

---

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List roles | `absuite security list roles --TenantId <guid>` |
| Count roles | `absuite security count roles --TenantId <guid>` |
| Search roles | `absuite security search roles --TenantId <guid> --Query "<text>"` |
| Get role | `absuite security get role --TenantId <guid> --SecurityRoleId <guid>` |
| Create role | `absuite security create role --TenantId <guid> --SecurityRoleCreateDto '{...}'` |
| Update role | `absuite security update role --TenantId <guid> --SecurityRoleId <guid> --SecurityRoleUpdateDto '{...}'` |
| Delete role | `absuite security delete role --TenantId <guid> --SecurityRoleId <guid>` |
| List permissions | `absuite security list permissions --TenantId <guid>` |
| Count permissions | `absuite security count permissions --TenantId <guid>` |
| Get permission | `absuite security get permission --TenantId <guid> --SecurityPermissionId <guid>` |
| Create permission | `absuite security create permission --TenantId <guid> --SecurityPermissionCreateDto '{...}'` |
| Update permission | `absuite security update permission --TenantId <guid> --SecurityPermissionId <guid> --SecurityPermissionUpdateDto '{...}'` |
| Delete permission | `absuite security delete permission --TenantId <guid> --SecurityPermissionId <guid>` |
| Permissions on role | `absuite security get role-permissions --TenantId <guid> --SecurityRoleId <guid>` |
| Assign permission to role | `absuite security set permission-to-role --TenantId <guid> --SecurityRoleId <guid> --SecurityPermissionId <guid>` |
| Revoke permission from role | `absuite security revoke permission-from-role --TenantId <guid> --SecurityRoleId <guid> --SecurityPermissionId <guid>` |
| Assign role to permission | `absuite security set role-to-permission --TenantId <guid> --SecurityPermissionId <guid> --SecurityRoleId <guid>` |
| Revoke role from permission | `absuite security revoke role-from-permission --TenantId <guid> --SecurityPermissionId <guid> --SecurityRoleId <guid>` |
| Roles by permission | `absuite security get roles-by-permission --TenantId <guid> --SecurityPermissionId <guid>` |
| Assign role to enrollment | `absuite security set role-to-enrollment --TenantId <guid> --SecurityRoleId <guid> --EnrollmentId <guid>` |
| Revoke role from enrollment | `absuite security revoke role-from-enrollment --TenantId <guid> --SecurityRoleId <guid> --EnrollmentId <guid>` |
| Assign permission to enrollment | `absuite security set permission-to-enrollment --TenantId <guid> --SecurityPermissionId <guid> --EnrollmentId <guid>` |
| Revoke permission from enrollment | `absuite security revoke permission-from-enrollment --TenantId <guid> --SecurityPermissionId <guid> --EnrollmentId <guid>` |
| Roles by enrollment | `absuite security get roles-by-enrollment --TenantId <guid> --EnrollmentId <guid>` |
| Permissions by enrollment | `absuite security get permissions-by-enrollment --TenantId <guid> --EnrollmentId <guid>` |
| Enrollments by role | `absuite security get enrollments-by-role --TenantId <guid> --SecurityRoleId <guid>` |
| Enrollments by permission | `absuite security get enrollments-by-permission --TenantId <guid> --SecurityPermissionId <guid>` |
| Assign role to business app | `absuite security set role-to-business-application --TenantId <guid> --SecurityRoleId <guid> --ApplicationId <guid>` |
| Revoke role from business app | `absuite security revoke role-from-business-application --TenantId <guid> --SecurityRoleId <guid> --ApplicationId <guid>` |
| Assign permission to business app | `absuite security set permission-to-business-application --TenantId <guid> --SecurityPermissionId <guid> --ApplicationId <guid>` |
| Revoke permission from business app | `absuite security revoke permission-from-business-application --TenantId <guid> --SecurityPermissionId <guid> --ApplicationId <guid>` |
| Applications by role | `absuite security get applications-by-role --TenantId <guid> --SecurityRoleId <guid>` |
| Applications by permission | `absuite security get applications-by-permission --TenantId <guid> --SecurityPermissionId <guid>` |
| List business applications | `absuite security list business-applications --TenantId <guid>` |
| Count business applications | `absuite security count business-applications --TenantId <guid>` |
| Get business application | `absuite security get business-application --TenantId <guid> --ApplicationId <guid>` |
| Create business application | `absuite security create business-application --TenantId <guid> --BusinessApplicationCreateDto '{...}'` |
| Update business application | `absuite security update business-application --TenantId <guid> --ApplicationId <guid> --BusinessApplicationUpdateDto '{...}'` |
| Delete business application | `absuite security delete business-application --TenantId <guid> --ApplicationId <guid>` |
| Permissions by application | `absuite security get permissions-by-application --TenantId <guid> --ApplicationId <guid>` |
| Roles by application | `absuite security get roles-by-application --TenantId <guid> --ApplicationId <guid>` |
| List OAuth applications | `absuite security list o-auth-applications --TenantId <guid>` |
| Count OAuth applications | `absuite security count o-auth-applications --TenantId <guid>` |
| Get OAuth application | `absuite security get o-auth-application --TenantId <guid> --ApplicationId <guid>` |
| Create OAuth application | `absuite security create o-auth-application --TenantId <guid> --OAuthApplicationCreateDto '{...}'` |
| Update OAuth application | `absuite security update o-auth-application --TenantId <guid> --ApplicationId <guid> --OAuthApplicationUpdateDto '{...}'` |
| Delete OAuth application | `absuite security delete o-auth-application --TenantId <guid> --ApplicationId <guid>` |
| List OAuth authorizations | `absuite security list o-auth-authorizations --TenantId <guid> [--UserId <guid>]` |
| Count OAuth authorizations | `absuite security count o-auth-authorizations --TenantId <guid> [--UserId <guid>]` |
| Get OAuth authorization | `absuite security get o-auth-authorization --TenantId <guid> --AuthorizationId <guid>` |
| List tenant logs | `absuite security list logs --TenantId <guid>` |
| Count tenant logs | `absuite security count logs --TenantId <guid>` |
| List security logs | `absuite security list security-logs --TenantId <guid>` |
| Count security logs | `absuite security count security-logs --TenantId <guid>` |
| List security certificates | `absuite security list security-certificates --TenantId <guid>` |
| Count security certificates | `absuite security count security-certificates --TenantId <guid>` |
| List webhook requests | `absuite security list webhook-requests --TenantId <guid>` |
| Count webhook requests | `absuite security count webhook-requests --TenantId <guid>` |

## Critical Rules

- **Authenticate first** (`absuite login`) — see `absuite-login-cli`.
- **Always provide a tenant** — `--TenantId <guid>` or a configured default. Every
  SecurityService command is tenant-scoped.
- **Create roles and permissions before assigning them.**
- **RBAC is bidirectional** — `permission-to-role` and `role-to-permission` reach the
  same edge; use whichever reads better.
- **Path-param names match the SDK**: roles use `--SecurityRoleId`, permissions use
  `--SecurityPermissionId`, and **both** business applications and OAuth applications use
  `--ApplicationId` (not a separate `--OAuthApplicationId`).
- **DTO field names are PascalCase** and identical to the REST API.
- **Never print real OAuth client secrets** or other credentials — use placeholders.
- **No PATCH here** — the CLI's `update` is a full PUT replace. For atomic partial
  updates, use the `absuite-security` (REST) skill.
