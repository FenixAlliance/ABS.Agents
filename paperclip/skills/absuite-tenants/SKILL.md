---
name: absuite-tenants
description: >
  Manage tenant configuration in the Alliance Business Suite (ABS) using the `absuite`
  CLI. The largest service — covers tenant CRUD, departments, enrollments (employee
  and standard), industries, invitations, notifications, options, positions, segments,
  sizes, teams, territories, types, units/unit groups, licenses, web portals, avatars,
  carts, wallets, and social profiles. Requires an authenticated CLI session.
---

# Alliance Business Suite — Tenants Skill

Manage tenant configuration through the `absuite` CLI's `tenants` service. This is the most comprehensive service with 140+ commands. All operations are tenant-scoped.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite tenants list-commands`

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

## Tenant Basics

```bash
# Get current tenant
absuite tenants get --TenantId $TENANT_ID

# Get extended tenant
absuite tenants get extended --TenantId $TENANT_ID

# Update tenant
absuite tenants update --TenantId $TENANT_ID --TenantUpdateDto '{
  "Name": "My Business",
  "LegalName": "My Business LLC",
  "Email": "admin@mybusiness.com"
}'

# Patch tenant (partial update)
absuite tenants patch --TenantId $TENANT_ID --TenantPatchDto '{
  "Name": "Updated Name"
}'

# Create tenant
absuite tenants create --TenantCreateDto '{
  "Name": "New Venture",
  "LegalName": "New Venture Inc.",
  "Email": "info@newventure.com",
  "Phone": "+1-555-0100",
  "WebUrl": "https://newventure.com",
  "Handler": "newventure",
  "About": "A new business venture",
  "Slogan": "Innovation first",
  "CurrencyId": "<currency-guid>",
  "CountryId": "USA"
}'
```

**REST API equivalents:**
```bash
# Get tenant
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get extended tenant
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update tenant
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name":"My Business","LegalName":"My Business LLC","Email":"admin@mybusiness.com"}'

# Patch tenant (partial update)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name":"Updated Name"}'

# Create tenant
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name":"New Venture","LegalName":"New Venture Inc.","Email":"info@newventure.com"}'

# Delete tenant
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## Select / Deselect Tenant

```bash
# Select a tenant as the active context
absuite tenants select --TenantId $TENANT_ID

# Deselect the active tenant
absuite tenants deselect
```

**REST API equivalents:**
```bash
# Select tenant
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Select" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Deselect tenant
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/Deselect" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Current & Root Tenant

```bash
# Get the current (active) tenant
absuite tenants get current

# Get the root tenant
absuite tenants get root
```

**REST API equivalents:**
```bash
# Get current tenant
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/Current" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get root tenant
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/Root" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Departments

```bash
absuite tenants list departments --TenantId $TENANT_ID
absuite tenants count departments --TenantId $TENANT_ID
absuite tenants get department --TenantId $TENANT_ID --DepartmentId <dept-guid>
absuite tenants create department --TenantId $TENANT_ID --DepartmentCreateDto '{
  "Name": "Engineering",
  "Description": "Software engineering department"
}'
absuite tenants update department --TenantId $TENANT_ID --DepartmentId <dept-guid> --DepartmentUpdateDto '{...}'
absuite tenants delete department --TenantId $TENANT_ID --DepartmentId <dept-guid>
```

**REST API equivalents:**
```bash
# List departments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count departments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get department
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/<dept-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create department
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name":"Engineering","Description":"Software engineering department"}'

# Update department
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/<dept-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete department
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/<dept-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API equivalent:**
```bash
# List / Count / Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/$DEPT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create / Update / Delete
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"name": "Engineering", "description": "..."}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/$DEPT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/$DEPT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Enrollments (User Memberships)

```bash
# Standard enrollments
absuite tenants list enrollments --TenantId $TENANT_ID
absuite tenants count enrollments --TenantId $TENANT_ID
absuite tenants get enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>
absuite tenants create enrollment --TenantId $TENANT_ID --EnrollmentCreateDto '{...}'
absuite tenants update enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --EnrollmentUpdateDto '{...}'
absuite tenants delete enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>

# Extended enrollments (with related data)
absuite tenants list extended-enrollments --TenantId $TENANT_ID
absuite tenants count extended-enrollments --TenantId $TENANT_ID
absuite tenants get extended-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>

# Employee enrollments
absuite tenants list employee-enrollments --TenantId $TENANT_ID
absuite tenants count employee-enrollments --TenantId $TENANT_ID
absuite tenants get employee-enrollment --TenantId $TENANT_ID --EmployeeEnrollmentId <ee-guid>
absuite tenants create employee-enrollment --TenantId $TENANT_ID --EmployeeEnrollmentCreateDto '{...}'
absuite tenants update employee-enrollment --TenantId $TENANT_ID --EmployeeEnrollmentId <ee-guid> --EmployeeEnrollmentUpdateDto '{...}'
absuite tenants delete employee-enrollment --TenantId $TENANT_ID --EmployeeEnrollmentId <ee-guid>
```

**REST API equivalents:**
```bash
# Standard enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/<enrollment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/<enrollment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/<enrollment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Extended enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/Extended/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Tenant-scoped enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Enrollments/<enrollment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Enrollments/<enrollment-guid>/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Employee enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/<ee-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/<ee-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/<ee-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Enrollment Features & Access

```bash
# List features for an enrollment
absuite tenants list enrollment-features --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>

# Check if enrollment has access to a feature
absuite tenants check enrollment-access --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>
```

**REST API equivalents:**
```bash
# List enrollment features
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Enrollments/<enrollment-guid>/Features" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Check feature access
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Enrollments/<enrollment-guid>/HasAccess" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Enrollment Licenses

```bash
# List licenses for an enrollment
absuite tenants list enrollment-licenses --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>

# Get specific enrollment license
absuite tenants get enrollment-license --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --LicenseId <license-guid>

# Assign license to enrollment
absuite tenants assign enrollment-license --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --LicenseId <license-guid>

# Revoke license from enrollment
absuite tenants revoke enrollment-license --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --LicenseId <license-guid>
```

**REST API equivalents:**
```bash
# List enrollment licenses
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Enrollments/<enrollment-guid>/Licenses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get enrollment license
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Enrollments/<enrollment-guid>/Licenses/<license-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assign license to enrollment
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Enrollments/<enrollment-guid>/Licenses/<license-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Revoke license from enrollment
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Enrollments/<enrollment-guid>/Licenses/<license-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Enrollment Permissions

```bash
# List permissions for an enrollment
absuite tenants list enrollment-permissions --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>

# Validate enrollment permissions
absuite tenants validate enrollment-permissions --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>
```

**REST API equivalents:**
```bash
# List enrollment permissions
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Enrollments/<enrollment-guid>/Permissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Validate enrollment permissions
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Enrollments/<enrollment-guid>/Permissions/Validate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API equivalent:**
```bash
# Standard enrollments — List / Count / Get / Create / Update / Delete
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/$ENROLLMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"userId": "<user-guid>"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/$ENROLLMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/$ENROLLMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Extended enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/Extended/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Employee enrollments — List / Count / Get / Create / Update / Delete
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/$EE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/$EE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/$EE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Invitations

```bash
# List
absuite tenants list invitations --TenantId $TENANT_ID
absuite tenants count invitations --TenantId $TENANT_ID

# Send invitation
absuite tenants send invitation --TenantId $TENANT_ID --InvitationCreateDto '{
  "Email": "newmember@example.com",
  "RoleId": "<role-guid>"
}'

# Accept / Decline / Revoke
absuite tenants accept invitation --InvitationId <inv-guid>
absuite tenants decline invitation --InvitationId <inv-guid>
absuite tenants revoke invitation --TenantId $TENANT_ID --InvitationId <inv-guid>
```

**REST API equivalents:**
```bash
# List invitations
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Invitations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count invitations
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Send invitation
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Email":"newmember@example.com","RoleId":"<role-guid>"}'

# Get invitation
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/<inv-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Accept invitation
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/<inv-guid>/Accept" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Decline invitation
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/<inv-guid>/Decline" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Delete (revoke) invitation
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/<inv-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Invitation Status Filters

```bash
# List pending invitations
absuite tenants list pending-invitations --TenantId $TENANT_ID

# List redeemed invitations
absuite tenants list redeemed-invitations --TenantId $TENANT_ID

# List revoked invitations
absuite tenants list revoked-invitations --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
# Pending invitations
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Invitations/Pending" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Redeemed invitations
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Invitations/Redeemed" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Revoked invitations
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Invitations/Revoked" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API equivalent:**
```bash
# List invitations
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Send invitation
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "newmember@example.com"}'

# Get invitation by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/$INVITATION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Accept / Decline
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/$INVITATION_ID/Accept" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/$INVITATION_ID/Decline" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Delete (revoke)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/$INVITATION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Notifications

```bash
absuite tenants list notifications --TenantId $TENANT_ID
absuite tenants count notifications --TenantId $TENANT_ID
absuite tenants get notification --TenantId $TENANT_ID --NotificationId <notif-guid>
absuite tenants create notification --TenantId $TENANT_ID --NotificationCreateDto '{...}'
absuite tenants update notification --TenantId $TENANT_ID --NotificationId <notif-guid> --NotificationUpdateDto '{...}'
absuite tenants delete notification --TenantId $TENANT_ID --NotificationId <notif-guid>
```

**REST API equivalents:**
```bash
# List notifications
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Notifications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count notifications
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Notifications/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API equivalent:**
```bash
# Notifications — via tenant-scoped path
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Notifications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Notifications/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Tenant Options (Key-Value Configuration)

```bash
absuite tenants list options --TenantId $TENANT_ID
absuite tenants count options --TenantId $TENANT_ID
absuite tenants get option-by-id --TenantId $TENANT_ID --OptionId <option-guid>
absuite tenants get option-by-key --TenantId $TENANT_ID --Key "feature.new-ui-enabled"
absuite tenants create option --TenantId $TENANT_ID --TenantOptionCreateDto '{
  "Key": "feature.new-ui-enabled",
  "Value": "true"
}'
absuite tenants update option --TenantId $TENANT_ID --OptionId <option-guid> --TenantOptionUpdateDto '{...}'
absuite tenants upsert option --TenantId $TENANT_ID --Key "feature.new-ui-enabled" --TenantOptionUpdateDto '{"Value": "false"}'
absuite tenants delete option --TenantId $TENANT_ID --OptionId <option-guid>
```

**REST API equivalents:**
```bash
# List options
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count options
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get option by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get option by key
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/Key/feature.new-ui-enabled" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create option
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Key":"feature.new-ui-enabled","Value":"true"}'

# Update option
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Upsert option by key
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/Upsert/feature.new-ui-enabled" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Value":"false"}'

# Delete option
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API equivalent:**
```bash
# List / Count / Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/$OPTION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by key
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/Key/feature.new-ui-enabled" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create / Update / Delete
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"key": "feature.new-ui-enabled", "value": "true"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/$OPTION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/$OPTION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Upsert by key
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/Upsert/feature.new-ui-enabled" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"value": "false"}'
```

## Positions

```bash
absuite tenants list positions --TenantId $TENANT_ID
absuite tenants count positions --TenantId $TENANT_ID
absuite tenants get position --TenantId $TENANT_ID --PositionId <position-guid>
absuite tenants create position --TenantId $TENANT_ID --PositionCreateDto '{
  "Name": "Senior Engineer",
  "Description": "Senior software engineering role"
}'
absuite tenants update position --TenantId $TENANT_ID --PositionId <position-guid> --PositionUpdateDto '{...}'
absuite tenants delete position --TenantId $TENANT_ID --PositionId <position-guid>
```

**REST API equivalents:**
```bash
# List positions
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count positions
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get position
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/<position-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create position
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name":"Senior Engineer","Description":"Senior software engineering role"}'

# Update position
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/<position-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete position
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/<position-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/$POSITION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"title": "Senior Engineer", "description": "..."}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/$POSITION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/$POSITION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Teams

```bash
# Team CRUD
absuite tenants list teams --TenantId $TENANT_ID
absuite tenants count teams --TenantId $TENANT_ID
absuite tenants get team --TenantId $TENANT_ID --TeamId <team-guid>
absuite tenants create team --TenantId $TENANT_ID --TeamCreateDto '{
  "Name": "Platform Team",
  "Description": "Platform engineering team"
}'
absuite tenants update team --TenantId $TENANT_ID --TeamId <team-guid> --TeamUpdateDto '{...}'
absuite tenants delete team --TenantId $TENANT_ID --TeamId <team-guid>

# Team contact enrollments
absuite tenants list team-contact-enrollments --TenantId $TENANT_ID --TeamId <team-guid>
absuite tenants count team-contact-enrollments --TenantId $TENANT_ID --TeamId <team-guid>
absuite tenants create team-contact-enrollment --TenantId $TENANT_ID --TeamId <team-guid> --TeamContactEnrollmentCreateDto '{...}'
absuite tenants delete team-contact-enrollment --TenantId $TENANT_ID --TeamContactEnrollmentId <tce-guid>

# Team project enrollments
absuite tenants list team-project-enrollments --TenantId $TENANT_ID --TeamId <team-guid>
absuite tenants count team-project-enrollments --TenantId $TENANT_ID --TeamId <team-guid>
absuite tenants create team-project-enrollment --TenantId $TENANT_ID --TeamId <team-guid> --TeamProjectEnrollmentCreateDto '{...}'
absuite tenants delete team-project-enrollment --TenantId $TENANT_ID --TeamProjectEnrollmentId <tpe-guid>

# Team records
absuite tenants list team-records --TenantId $TENANT_ID --TeamId <team-guid>
absuite tenants count team-records --TenantId $TENANT_ID --TeamId <team-guid>
absuite tenants create team-record --TenantId $TENANT_ID --TeamId <team-guid> --TeamRecordCreateDto '{...}'
absuite tenants update team-record --TenantId $TENANT_ID --TeamRecordId <record-guid> --TeamRecordUpdateDto '{...}'
absuite tenants delete team-record --TenantId $TENANT_ID --TeamRecordId <record-guid>
```

**REST API equivalents:**
```bash
# Teams
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/<team-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name":"Platform Team","Description":"Platform engineering team"}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/<team-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/<team-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Team contact enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamContactEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamContactEnrollments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamContactEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamContactEnrollments/<tce-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Team project enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamProjectEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamProjectEnrollments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamProjectEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamProjectEnrollments/<tpe-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Team records
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API equivalent:**
```bash
# Teams — CRUD
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/$TEAM_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"name": "Platform Team", "description": "..."}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/$TEAM_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/$TEAM_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Team contact enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamContactEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamContactEnrollments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamContactEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"businessTeamID": "<team-guid>", "contactID": "<contact-guid>"}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamContactEnrollments/$TCE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Team project enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamProjectEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamProjectEnrollments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamProjectEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"businessTeamID": "<team-guid>", "projectID": "<project-guid>"}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamProjectEnrollments/$TPE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Team records
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"businessTeamID": "<team-guid>"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords/$RECORD_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords/$RECORD_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Territories

```bash
absuite tenants list territories --TenantId $TENANT_ID
absuite tenants count territories --TenantId $TENANT_ID
absuite tenants get territory --TenantId $TENANT_ID --TerritoryId <territory-guid>
absuite tenants create territory --TenantId $TENANT_ID --TerritoryCreateDto '{
  "Name": "North America",
  "Description": "North American sales territory"
}'
absuite tenants update territory --TenantId $TENANT_ID --TerritoryId <territory-guid> --TerritoryUpdateDto '{...}'
absuite tenants delete territory --TenantId $TENANT_ID --TerritoryId <territory-guid>
```

**REST API equivalents:**
```bash
# List territories
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count territories
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get territory
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/<territory-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create territory
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name":"North America","Description":"North American sales territory"}'

# Update territory
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/<territory-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete territory
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/<territory-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/$TERRITORY_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"name": "North America", "description": "..."}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/$TERRITORY_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/$TERRITORY_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Industries, Segments, Sizes, Types

```bash
# Industries
absuite tenants list industries --TenantId $TENANT_ID
absuite tenants count industries --TenantId $TENANT_ID
absuite tenants get industry --TenantId $TENANT_ID --IndustryId <industry-guid>
absuite tenants create industry --TenantId $TENANT_ID --IndustryCreateDto '{...}'
absuite tenants update industry --TenantId $TENANT_ID --IndustryId <industry-guid> --IndustryUpdateDto '{...}'
absuite tenants delete industry --TenantId $TENANT_ID --IndustryId <industry-guid>

# Segments
absuite tenants list segments --TenantId $TENANT_ID
absuite tenants count segments --TenantId $TENANT_ID
absuite tenants get segment --TenantId $TENANT_ID --SegmentId <segment-guid>
absuite tenants create segment --TenantId $TENANT_ID --SegmentCreateDto '{...}'
absuite tenants update segment --TenantId $TENANT_ID --SegmentId <segment-guid> --SegmentUpdateDto '{...}'
absuite tenants delete segment --TenantId $TENANT_ID --SegmentId <segment-guid>

# Sizes
absuite tenants list sizes --TenantId $TENANT_ID
absuite tenants count sizes --TenantId $TENANT_ID
absuite tenants get size --TenantId $TENANT_ID --SizeId <size-guid>
absuite tenants create size --TenantId $TENANT_ID --SizeCreateDto '{...}'
absuite tenants update size --TenantId $TENANT_ID --SizeId <size-guid> --SizeUpdateDto '{...}'
absuite tenants delete size --TenantId $TENANT_ID --SizeId <size-guid>

# Types
absuite tenants list types --TenantId $TENANT_ID
absuite tenants count types --TenantId $TENANT_ID
absuite tenants get type --TenantId $TENANT_ID --TypeId <type-guid>
absuite tenants create type --TenantId $TENANT_ID --TypeCreateDto '{...}'
absuite tenants update type --TenantId $TENANT_ID --TypeId <type-guid> --TypeUpdateDto '{...}'
absuite tenants delete type --TenantId $TENANT_ID --TypeId <type-guid>
```

**REST API equivalents:**
```bash
# Industries
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries/<industry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries/<industry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries/<industry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Segments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Segments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Segments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Segments/<segment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Segments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Segments/<segment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Segments/<segment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Sizes
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Sizes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Sizes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Sizes/<size-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Sizes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Sizes/<size-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Sizes/<size-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Types
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Types" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Types/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Types/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Types" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Types/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Types/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API equivalent:**
```bash
# Industries — CRUD (same pattern for all four resources)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries/$INDUSTRY_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries/$INDUSTRY_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries/$INDUSTRY_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Segments — same CRUD pattern at /api/v2/TenantsService/Segments
# Sizes    — same CRUD pattern at /api/v2/TenantsService/Sizes
# Types    — same CRUD pattern at /api/v2/TenantsService/Types
```

## Units & Unit Groups

```bash
# Unit groups
absuite tenants list unit-groups --TenantId $TENANT_ID
absuite tenants count unit-groups --TenantId $TENANT_ID
absuite tenants get unit-group --TenantId $TENANT_ID --UnitGroupId <group-guid>
absuite tenants create unit-group --TenantId $TENANT_ID --UnitGroupCreateDto '{...}'
absuite tenants update unit-group --TenantId $TENANT_ID --UnitGroupId <group-guid> --UnitGroupUpdateDto '{...}'
absuite tenants delete unit-group --TenantId $TENANT_ID --UnitGroupId <group-guid>

# Units
absuite tenants list units --TenantId $TENANT_ID
absuite tenants count units --TenantId $TENANT_ID
absuite tenants get unit --TenantId $TENANT_ID --UnitId <unit-guid>
absuite tenants create unit --TenantId $TENANT_ID --UnitCreateDto '{...}'
absuite tenants update unit --TenantId $TENANT_ID --UnitId <unit-guid> --UnitUpdateDto '{...}'
absuite tenants delete unit --TenantId $TENANT_ID --UnitId <unit-guid>
```

**REST API equivalents:**
```bash
# Unit groups
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Units within a unit group
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>/Units" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>/Units/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>/Units/<unit-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Units (top-level)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Units" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Units/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Units/<unit-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Units" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Units/<unit-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Units/<unit-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API equivalent:**
```bash
# Unit groups — CRUD
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/$GROUP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/$GROUP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/$GROUP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Units within a unit group
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/$GROUP_ID/Units" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/$GROUP_ID/Units/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/$GROUP_ID/Units/$UNIT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/$GROUP_ID/Units" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/$GROUP_ID/Units/$UNIT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/$GROUP_ID/Units/$UNIT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Tenant units (flat) — same CRUD at /api/v2/TenantsService/Units
```

## Licenses

```bash
absuite tenants list licenses --TenantId $TENANT_ID
absuite tenants get license --TenantId $TENANT_ID --LicenseId <license-guid>
```

**REST API equivalents:**
```bash
# List tenant licenses
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Licenses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Licenses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Web Portals

```bash
absuite tenants list web-portals --TenantId $TENANT_ID
absuite tenants get web-portal --TenantId $TENANT_ID --WebPortalId <portal-guid>
```

**REST API equivalents:**
```bash
# List web portals
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/WebPortals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/WebPortals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Tenant-Level Resources

```bash
# Avatar
absuite tenants get avatar --TenantId $TENANT_ID

# Cart
absuite tenants get cart --TenantId $TENANT_ID

# Wallet
absuite tenants get wallet --TenantId $TENANT_ID

# Social profile
absuite tenants get social-profile --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
# Avatar
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Avatar" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update avatar
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Avatar" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@avatar.png"

# Cart
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Cart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Wallet
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Wallet" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Social profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/SocialProfile" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Tenant Users

```bash
# List users in a tenant
absuite tenants list users --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/$TENANT_ID/Users" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference
|---|---|
| Get tenant | `absuite tenants get --TenantId <guid>` |
| Update tenant | `absuite tenants update --TenantId <guid> --TenantUpdateDto '{...}'` |
| Patch tenant | `absuite tenants patch --TenantId <guid> --TenantPatchDto '{...}'` |
| List departments | `absuite tenants list departments --TenantId <guid>` |
| List enrollments | `absuite tenants list enrollments --TenantId <guid>` |
| Send invitation | `absuite tenants send invitation --TenantId <guid> --InvitationCreateDto '{...}'` |
| Accept invitation | `absuite tenants accept invitation --InvitationId <guid>` |
| List teams | `absuite tenants list teams --TenantId <guid>` |
| List options | `absuite tenants list options --TenantId <guid>` |
| Upsert option | `absuite tenants upsert option --TenantId <guid> --Key <k> --TenantOptionUpdateDto '{...}'` |
| List positions | `absuite tenants list positions --TenantId <guid>` |
| List territories | `absuite tenants list territories --TenantId <guid>` |

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/TenantsService/Tenants` | Create tenant |
| DELETE | `/api/v2/TenantsService/Tenants` | Delete tenant |
| GET | `/api/v2/TenantsService/Tenants/:tenantId` | Get tenant |
| PATCH | `/api/v2/TenantsService/Tenants/:tenantId` | Patch tenant |
| PUT | `/api/v2/TenantsService/Tenants/:tenantId` | Update tenant |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Avatar` | Get avatar |
| POST | `/api/v2/TenantsService/Tenants/:tenantId/Avatar` | Update avatar |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Cart` | Get cart |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Enrollments` | List enrollments |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Enrollments/:enrollmentId` | Get enrollment |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Enrollments/:enrollmentId/Extended` | Extended enrollment |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Enrollments/:enrollmentId/Features` | Enrollment features |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Enrollments/:enrollmentId/HasAccess` | Check feature access |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Enrollments/:enrollmentId/Licenses` | Enrollment licenses |
| POST | `/api/v2/TenantsService/Tenants/:tenantId/Enrollments/:enrollmentId/Licenses/:licenseId` | Assign license |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Enrollments/:enrollmentId/Licenses/:licenseId` | Get enrollment license |
| DELETE | `/api/v2/TenantsService/Tenants/:tenantId/Enrollments/:enrollmentId/Licenses/:licenseId` | Revoke license |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Enrollments/:enrollmentId/Permissions` | Enrollment permissions |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Enrollments/:enrollmentId/Permissions/Validate` | Validate permissions |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Extended` | Extended tenant |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Invitations` | List invitations |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Invitations/Pending` | Pending invitations |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Invitations/Redeemed` | Redeemed invitations |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Invitations/Revoked` | Revoked invitations |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Licenses` | Tenant licenses |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Notifications` | List notifications |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Notifications/Count` | Count notifications |
| POST | `/api/v2/TenantsService/Tenants/:tenantId/Select` | Select tenant |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/SocialProfile` | Social profile |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Users` | Users in tenant |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/Wallet` | Wallet |
| GET | `/api/v2/TenantsService/Tenants/:tenantId/WebPortals` | Web portals |
| GET | `/api/v2/TenantsService/Tenants/Current` | Current tenant |
| POST | `/api/v2/TenantsService/Tenants/Deselect` | Deselect tenant |
| GET | `/api/v2/TenantsService/Tenants/Root` | Root tenant |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/Departments` (+`/:id`, `/Count`) | Departments CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/Enrollments` (+`/:id`, `/Count`, `/Extended`, `/Extended/Count`) | Enrollments CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/EmployeeEnrollments` (+`/:id`, `/Count`) | Employee enrollments CRUD |
| POST/GET/DELETE | `/api/v2/TenantsService/Invitations` (+`/:id`, `/Count`, `/:id/Accept`, `/:id/Decline`) | Invitations CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/Industries` (+`/:id`, `/Count`) | Industries CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/Segments` (+`/:id`, `/Count`) | Segments CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/Territories` (+`/:id`, `/Count`) | Territories CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/Types` (+`/:id`, `/Count`) | Types CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/Positions` (+`/:id`, `/Count`) | Positions CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/Teams` (+`/:id`, `/Count`) | Teams CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/TeamContactEnrollments` (+`/:id`, `/Count`) | Team contact enrollments |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/TeamProjectEnrollments` (+`/:id`, `/Count`) | Team project enrollments |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/TeamRecords` (+`/:id`, `/Count`) | Team records CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/Options` (+`/:id`, `/Count`, `/Key/:key`, `/Upsert/:key`) | Options CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/UnitGroups` (+`/:id`, `/Count`, `/:id/Units`, `/:id/Units/:unitId`, `/:id/Units/Count`) | Unit groups CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/Units` (+`/:id`, `/Count`) | Units CRUD |
| POST/GET/PUT/DELETE | `/api/v2/TenantsService/Sizes` (+`/:id`, `/Count`) | Sizes CRUD |

## Critical Rules

- **Authenticate first.** Always provide a tenant context.
- **Enrollments** are how users join a tenant — each enrollment can have roles and permissions assigned via the security service.
- **Invitation lifecycle**: send → accept/decline. Revoke to cancel pending invitations.
- **Options** store tenant-level configuration — use `upsert option` for idempotent key-value updates.
- **Teams** can have both contact enrollments and project enrollments — use these to organize members and projects.
