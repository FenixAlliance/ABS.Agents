---
name: absuite-security
description: >
  Manage security roles, permissions, business applications, OAuth applications,
  OAuth authorizations, security certificates, security logs, and webhook requests
  in the Alliance Business Suite (ABS) using the `absuite` CLI. Covers RBAC
  assignment/revocation for enrollments, roles, and applications. Requires an
  authenticated CLI session.
---

# Alliance Business Suite — Security Skill

Manage security through the `absuite` CLI's `security` service. All operations are tenant-scoped.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite security list-commands`

## REST API Authentication

All REST examples below assume a valid bearer token. To obtain one:

1. **Obtain bearer token**: `POST $ABSUITE_HOST_URL/login` with `{"email":"...","password":"..."}`
2. **Use in requests**: `-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"`
3. **Base URL**: `$ABSUITE_HOST_URL/api/v2/`

## Roles

```bash
# List
absuite security list roles --TenantId $TENANT_ID

# Count
absuite security count roles --TenantId $TENANT_ID

# Get by ID
absuite security get role --TenantId $TENANT_ID --RoleId <role-guid>

# Create
absuite security create role --TenantId $TENANT_ID --SecurityRoleCreateDto '{
  "Name": "Sales Manager",
  "Description": "Can manage sales pipeline and customer data"
}'

# Update
absuite security update role --TenantId $TENANT_ID --RoleId <role-guid> --SecurityRoleUpdateDto '{...}'

# Delete
absuite security delete role --TenantId $TENANT_ID --RoleId <role-guid>
```

**REST API equivalent:**
```bash
# List roles
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count roles
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get role by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/$ROLE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create role
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "Sales Manager", "Description": "Can manage sales pipeline"}'

# Update role
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/$ROLE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete role
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/$ROLE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Permissions

```bash
# List
absuite security list permissions --TenantId $TENANT_ID

# Count
absuite security count permissions --TenantId $TENANT_ID

# Get by ID
absuite security get permission --TenantId $TENANT_ID --PermissionId <perm-guid>

# Create
absuite security create permission --TenantId $TENANT_ID --SecurityPermissionCreateDto '{
  "Name": "orders.read",
  "Description": "Read access to orders"
}'

# Update
absuite security update permission --TenantId $TENANT_ID --PermissionId <perm-guid> --SecurityPermissionUpdateDto '{...}'

# Delete
absuite security delete permission --TenantId $TENANT_ID --PermissionId <perm-guid>
```

### Permissions by Role

```bash
absuite security list role-permissions --TenantId $TENANT_ID --RoleId <role-guid>
```

**REST API equivalent (Permissions CRUD + by Role):**
```bash
# List permissions
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count permissions
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get permission by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/$PERM_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create permission
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "orders.read", "Description": "Read access to orders"}'

# Update / Delete
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/$PERM_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/$PERM_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Permissions by role
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/$ROLE_ID/Permissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## RBAC: Assign & Revoke

### Permission ↔ Role

```bash
# Assign permission to role
absuite security set permission-to-role --TenantId $TENANT_ID --RoleId <role-guid> --PermissionId <perm-guid>

# Revoke permission from role
absuite security revoke-permission-from-role --TenantId $TENANT_ID --RoleId <role-guid> --PermissionId <perm-guid>

# Get roles that have a permission
absuite security get roles-by-permission --TenantId $TENANT_ID --PermissionId <perm-guid>

# Assign role to permission (reverse direction)
absuite security set role-to-permission --TenantId $TENANT_ID --PermissionId <perm-guid> --RoleId <role-guid>
absuite security revoke-role-from-permission --TenantId $TENANT_ID --PermissionId <perm-guid> --RoleId <role-guid>
```

**REST API equivalent:**
```bash
# Assign permission to role
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/$ROLE_ID/Permissions/$PERM_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Revoke permission from role
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/$ROLE_ID/Permissions/$PERM_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Roles that have a permission
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/$PERM_ID/Roles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assign role to permission (reverse)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/$PERM_ID/Roles/$ROLE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Revoke role from permission
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/$PERM_ID/Roles/$ROLE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Role/Permission ↔ Enrollment

```bash
# Assign role to enrollment
absuite security set role-to-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --RoleId <role-guid>

# Revoke role from enrollment
absuite security revoke-role-from-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --RoleId <role-guid>

# Assign permission to enrollment
absuite security set permission-to-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --PermissionId <perm-guid>

# Revoke permission from enrollment
absuite security revoke-permission-from-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --PermissionId <perm-guid>

# Query
absuite security get roles-by-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>
absuite security get permissions-by-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>
absuite security get enrollments-by-role --TenantId $TENANT_ID --RoleId <role-guid>
absuite security get enrollments-by-permission --TenantId $TENANT_ID --PermissionId <perm-guid>
```

**REST API equivalent:**
```bash
# Assign role to enrollment
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/$ROLE_ID/Enrollments/$ENROLLMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Revoke role from enrollment
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/$ROLE_ID/Enrollments/$ENROLLMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assign permission to enrollment
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/$PERM_ID/Enrollments/$ENROLLMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Revoke permission from enrollment
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/$PERM_ID/Enrollments/$ENROLLMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Query: roles/permissions by enrollment
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/ByEnrollment/$ENROLLMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/ByEnrollment/$ENROLLMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Query: enrollments by role/permission
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/$ROLE_ID/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/$PERM_ID/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Role/Permission ↔ Business Application

```bash
# Assign
absuite security set role-to-business-application --TenantId $TENANT_ID --BusinessApplicationId <app-guid> --RoleId <role-guid>
absuite security set permission-to-business-application --TenantId $TENANT_ID --BusinessApplicationId <app-guid> --PermissionId <perm-guid>

# Revoke
absuite security revoke-role-from-business-application --TenantId $TENANT_ID --BusinessApplicationId <app-guid> --RoleId <role-guid>
absuite security revoke-permission-from-business-application --TenantId $TENANT_ID --BusinessApplicationId <app-guid> --PermissionId <perm-guid>

# Query
absuite security get applications-by-role --TenantId $TENANT_ID --RoleId <role-guid>
absuite security get applications-by-permission --TenantId $TENANT_ID --PermissionId <perm-guid>
```

**REST API equivalent:**
```bash
# Assign role to application
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/$ROLE_ID/Applications/$APP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assign permission to application
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/$PERM_ID/Applications/$APP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Revoke role from application
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/$ROLE_ID/Applications/$APP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Revoke permission from application
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/$PERM_ID/Applications/$APP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Query: applications by role/permission
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Roles/$ROLE_ID/Applications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Permissions/$PERM_ID/Applications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Business Applications

```bash
absuite security list business-applications --TenantId $TENANT_ID
absuite security count business-applications --TenantId $TENANT_ID
absuite security get business-application-by-id --TenantId $TENANT_ID --BusinessApplicationId <app-guid>
absuite security create business-application --TenantId $TENANT_ID --BusinessApplicationCreateDto '{
  "Name": "CRM Portal",
  "Description": "Customer-facing CRM application"
}'
absuite security update business-application --TenantId $TENANT_ID --BusinessApplicationId <app-guid> --BusinessApplicationUpdateDto '{...}'
absuite security delete business-application --TenantId $TENANT_ID --BusinessApplicationId <app-guid>
```

**REST API equivalent:**
```bash
# List / Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/$APP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "CRM Portal", "Description": "Customer-facing CRM application"}'

# Update / Delete
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/$APP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/$APP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Permissions & Roles by Application

```bash
# Permissions granted to a business application
absuite security get permissions-by-application --TenantId $TENANT_ID --BusinessApplicationId <app-guid>

# Roles granted to a business application
absuite security get roles-by-application --TenantId $TENANT_ID --BusinessApplicationId <app-guid>
```

**REST API equivalent:**
```bash
# Permissions by application
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/$APP_ID/Permissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Roles by application
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Applications/$APP_ID/Roles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## OAuth Applications & Authorizations

```bash
# OAuth applications
absuite security list o-auth-applications --TenantId $TENANT_ID
absuite security count o-auth-applications --TenantId $TENANT_ID
absuite security get o-auth-application-by-id --TenantId $TENANT_ID --OAuthApplicationId <oauth-app-guid>
absuite security create o-auth-application --TenantId $TENANT_ID --OAuthApplicationCreateDto '{...}'
absuite security update o-auth-application --TenantId $TENANT_ID --OAuthApplicationId <oauth-app-guid> --OAuthApplicationUpdateDto '{...}'
absuite security delete o-auth-application --TenantId $TENANT_ID --OAuthApplicationId <oauth-app-guid>

# OAuth authorizations
absuite security list o-auth-authorizations --TenantId $TENANT_ID
absuite security count o-auth-authorizations --TenantId $TENANT_ID
absuite security get o-auth-authorization-by-id --TenantId $TENANT_ID --OAuthAuthorizationId <auth-guid>
```

**REST API equivalent:**
```bash
# OAuth Applications CRUD
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/$OAUTH_APP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/$OAUTH_APP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/$OAUTH_APP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# OAuth Authorizations
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Authorizations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Authorizations/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/OAuthApplications/Authorizations/$AUTH_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Security Logs & Certificates

```bash
# Logs
absuite security list logs --TenantId $TENANT_ID
absuite security count logs --TenantId $TENANT_ID

# Security Audit Logs
absuite security list security-logs --TenantId $TENANT_ID
absuite security count security-logs --TenantId $TENANT_ID

# Certificates
absuite security list certificates --TenantId $TENANT_ID
absuite security count certificates --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
# Security Logs
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Logs" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Logs/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/SecurityLogs" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/SecurityLogs/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Security Certificates
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/SecurityCertificates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/SecurityCertificates/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Webhook Requests

```bash
absuite security list webhook-requests --TenantId $TENANT_ID
absuite security count webhook-requests --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Webhooks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SecurityService/Webhooks/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List roles | `absuite security list roles --TenantId <guid>` |
| Create role | `absuite security create role --TenantId <guid> --SecurityRoleCreateDto '{...}'` |
| List permissions | `absuite security list permissions --TenantId <guid>` |
| Create permission | `absuite security create permission --TenantId <guid> --SecurityPermissionCreateDto '{...}'` |
| Assign perm to role | `absuite security set permission-to-role --TenantId <guid> --RoleId <guid> --PermissionId <guid>` |
| Assign role to enrollment | `absuite security set role-to-enrollment --TenantId <guid> --EnrollmentId <guid> --RoleId <guid>` |
| Revoke role from enrollment | `absuite security revoke-role-from-enrollment --TenantId <guid> --EnrollmentId <guid> --RoleId <guid>` |
| View security logs | `absuite security list logs --TenantId <guid>` |

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/v2/SecurityService/Roles` | Security roles |
| CRUD | `/api/v2/SecurityService/Permissions` | Security permissions |
| CRUD | `/api/v2/SecurityService/Applications` | Business applications |
| CRUD | `/api/v2/SecurityService/OAuthApplications` | OAuth applications |
| GET | `/api/v2/SecurityService/Roles/Count` | Count roles |
| GET | `/api/v2/SecurityService/Permissions/Count` | Count permissions |
| GET | `/api/v2/SecurityService/Applications/Count` | Count business applications |
| GET | `/api/v2/SecurityService/OAuthApplications/Count` | Count OAuth applications |
| GET | `/api/v2/SecurityService/Applications/:id/Permissions` | Permissions by application |
| GET | `/api/v2/SecurityService/Applications/:id/Roles` | Roles by application |
| GET | `/api/v2/SecurityService/Roles/:id/Permissions` | Permissions by role |
| POST/DELETE | `/api/v2/SecurityService/Roles/:id/Permissions/:permId` | Assign/revoke perm ↔ role |
| POST/DELETE | `/api/v2/SecurityService/Permissions/:id/Roles/:roleId` | Assign/revoke role ↔ perm |
| POST/DELETE | `/api/v2/SecurityService/Roles/:id/Enrollments/:enrollId` | Assign/revoke role ↔ enrollment |
| POST/DELETE | `/api/v2/SecurityService/Permissions/:id/Enrollments/:enrollId` | Assign/revoke perm ↔ enrollment |
| POST/DELETE | `/api/v2/SecurityService/Roles/:id/Applications/:appId` | Assign/revoke role ↔ app |
| POST/DELETE | `/api/v2/SecurityService/Permissions/:id/Applications/:appId` | Assign/revoke perm ↔ app |
| GET | `/api/v2/SecurityService/Roles/:id/Enrollments` | Enrollments by role |
| GET | `/api/v2/SecurityService/Permissions/:id/Enrollments` | Enrollments by permission |
| GET | `/api/v2/SecurityService/Roles/ByEnrollment/:enrollmentId` | Roles by enrollment |
| GET | `/api/v2/SecurityService/Permissions/ByEnrollment/:enrollmentId` | Permissions by enrollment |
| GET | `/api/v2/SecurityService/Roles/:id/Applications` | Applications by role |
| GET | `/api/v2/SecurityService/Permissions/:id/Applications` | Applications by permission |
| GET | `/api/v2/SecurityService/OAuthApplications/Authorizations` | OAuth authorizations |
| GET | `/api/v2/SecurityService/OAuthApplications/Authorizations/:authId` | OAuth authorization by ID |
| GET | `/api/v2/SecurityService/OAuthApplications/Authorizations/Count` | Count OAuth authorizations |
| GET | `/api/v2/SecurityService/Logs` | Tenant logs |
| GET | `/api/v2/SecurityService/Logs/Count` | Count tenant logs |
| GET | `/api/v2/SecurityService/SecurityLogs` | Security audit logs |
| GET | `/api/v2/SecurityService/SecurityLogs/Count` | Count security audit logs |
| GET | `/api/v2/SecurityService/SecurityCertificates` | Security certificates |
| GET | `/api/v2/SecurityService/SecurityCertificates/Count` | Count security certificates |
| GET | `/api/v2/SecurityService/Webhooks` | Webhook requests |
| GET | `/api/v2/SecurityService/Webhooks/Count` | Count webhook requests |

> **CRUD** = GET (list), GET (count), GET (by ID), POST (create), PUT (update), DELETE

## Critical Rules

- **Authenticate first.** Always provide a tenant context.
- **Create roles and permissions first** before assigning them.
- **RBAC is bidirectional** — you can assign permission-to-role or role-to-permission.
- **Enrollments** are user memberships in a tenant — assign roles/permissions to enrollments to control access.
