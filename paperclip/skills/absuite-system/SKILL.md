---
name: absuite-system
description: >
  Manage system administration in the Alliance Business Suite (ABS) using the
  `absuite` CLI. Covers user management, tenant management, system options, licensing,
  database migrations, health checks, admin emails, and antiforgery tokens. Requires
  an authenticated CLI session with admin privileges for most operations.
---

# Alliance Business Suite — System Skill

Manage system administration through the `absuite` CLI's `system` service. Most operations require admin-level access.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Discover commands**: `absuite system list-commands`

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

## Health & Version

```bash
# Health check
absuite system get health

# Platform version
absuite system get version

# Hello / ping
absuite system get hello
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Health" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Version" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Hello" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Overview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Users (Admin)

```bash
# List users
absuite system list users

# Count users
absuite system count users

# Get user by ID
absuite system get user --UserId <user-guid>

# List extended users
absuite system list extended-users
absuite system count extended-users

# Get extended user
absuite system get extended-account-holder --UserId <user-guid>

# Create user
absuite system create account-holder --AccountHolderCreateDto '{
  "Email": "newuser@example.com",
  "Password": "SecureP@ss123"
}'

# Update user
absuite system update account-holder --UserId <user-guid> --AccountHolderUpdateDto '{...}'

# Delete user
absuite system delete account-holder --UserId <user-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Extended users
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/Extended/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# User-specific emails
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
```

## User Options (Admin)

Manage per-user options (key-value settings scoped to a specific user).

```bash
# These endpoints are REST API only — no CLI equivalent.
```

**REST API:**
```bash
# List options for a user
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count options for a user
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Options/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a specific option
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create option for a user
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update option
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete option
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Tenants (Admin)

```bash
# List tenants
absuite system list all-tenants
absuite system count tenants

# List extended tenants
absuite system list all-extended-tenants
absuite system count extended-tenants

# Get tenant by ID
absuite system get tenant --TenantId <tenant-guid>

# Create tenant
absuite system create tenant --TenantCreateDto '{
  "Name": "New Business",
  "Email": "admin@newbusiness.com"
}'

# Update tenant
absuite system update tenant --TenantId <tenant-guid> --TenantUpdateDto '{...}'

# Delete tenant
absuite system delete tenant --TenantId <tenant-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Extended tenants
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/Extended/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Tenant-specific emails
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
```

## Tenant Options (Admin)

Manage per-tenant options (key-value settings scoped to a specific tenant).

```bash
# These endpoints are REST API only — no CLI equivalent.
```

**REST API:**
```bash
# List options for a tenant
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count options for a tenant
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a specific option
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create option for a tenant
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update option
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete option
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contact Options (Admin)

Manage per-contact options (key-value settings scoped to a specific contact).

```bash
# These endpoints are REST API only — no CLI equivalent.
```

**REST API:**
```bash
# List options for a contact
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Contacts/<contact-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count options for a contact
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Contacts/<contact-guid>/Options/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a specific option
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Contacts/<contact-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create option for a contact
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Contacts/<contact-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update option
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Contacts/<contact-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete option
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Contacts/<contact-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## System Options (Key-Value Configuration)

```bash
# List
absuite system list options
absuite system count options

# Get by ID
absuite system get option-by-id --OptionId <option-guid>

# Get by key
absuite system get option-by-key --Key "smtp.host"

# Create
absuite system create option --SystemOptionCreateDto '{
  "Key": "app.maintenance-mode",
  "Value": "false"
}'

# Update
absuite system update option --OptionId <option-guid> --SystemOptionUpdateDto '{
  "Value": "true"
}'

# Upsert (create or update by key)
absuite system upsert option --Key "app.maintenance-mode" --SystemOptionUpdateDto '{
  "Value": "true"
}'

# Delete
absuite system delete option --OptionId <option-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Options/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Options/Key/<key>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Options/Upsert/<key>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Licensing

```bash
# List licenses
absuite system list licenses

# Get license by ID
absuite system get license-by-id --LicenseId <license-guid>

# Get license quota
absuite system get license-records-quota

# List license assignments / attributes / features
absuite system list license-assignments --LicenseId <license-guid>
absuite system list license-attributes --LicenseId <license-guid>
absuite system list license-features --LicenseId <license-guid>

# Validate a license
absuite system confirm-license --LicenseKey <key>

# Redeem a license
absuite system redeem-license --LicenseKey <key>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/<license-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/<license-guid>/Assignments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/<license-guid>/Attributes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/<license-guid>/Features" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/<license-guid>/Quota" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/Validate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"licenseKey":"<key>"}'
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/Redeem" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"licenseKey":"<key>"}'
```

## Modules

```bash
# List all modules on the server
absuite system list all-modules

# List modules available to current tenant user
absuite system list available-modules --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StudioService/Modules" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/StudioService/Modules/Data" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Database Migrations

```bash
# List migrations
absuite system migrations

# Apply pending migrations
absuite system move-
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Migrations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Migrations/Migrate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Admin Email Operations

```bash
# Preview basic email template
absuite system admin-preview-basic-email-template --EmailTemplateId <template-guid>

# Send basic email
absuite system admin-send-basic-email --EmailDispatchRequest '{
  "title": "System Notification",
  "message": "Scheduled maintenance tonight.",
  "recipients": ["admin@example.com"]
}'

# Preview/send user-specific email
absuite system admin-preview-user-email-template --UserId <user-guid>
absuite system admin-send-user-email --UserId <user-guid> --EmailDispatchRequest '{...}'

# Preview/send tenant-specific email
absuite system admin-preview-tenant-email --TenantId <tenant-guid>
absuite system admin-send-tenant-email --TenantId <tenant-guid> --EmailDispatchRequest '{...}'
```

**REST API equivalents:**
```bash
# System-level emails
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Emails/SendBasic" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# User-specific emails
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Tenant-specific emails
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
```

## Authentication & Security

```bash
# Validate antiforgery request
absuite system is-request-valid

# Get and store antiforgery tokens
absuite system list and-store-tokens
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Antiforgery/GetAndStoreTokens" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Antiforgery/IsRequestValid" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## System Overview (REST API only)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Overview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Portals (REST API only)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Portals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Portals/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Portals/<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Portals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Portals/<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Portals/<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Carts (REST API only)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Carts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Carts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Carts/<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Carts/<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## IP Lookups (REST API only)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/IPLookups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/IPLookups/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/IPLookups/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/IPLookups/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| Health check | `absuite system get health` |
| Platform version | `absuite system get version` |
| List users | `absuite system list users` |
| Create user | `absuite system create account-holder --AccountHolderCreateDto '{...}'` |
| List tenants | `absuite system list all-tenants` |
| Create tenant | `absuite system create tenant --TenantCreateDto '{...}'` |
| List options | `absuite system list options` |
| Upsert option | `absuite system upsert option --Key <key> --SystemOptionUpdateDto '{...}'` |
| List licenses | `absuite system list licenses` |
| List modules | `absuite system list all-modules` |
| Check migrations | `absuite system migrations` |

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| **Health & Overview** | | |
| GET | `/api/v2/SystemService/Health` | Health check |
| GET | `/api/v2/SystemService/Version` | Platform version |
| GET | `/api/v2/SystemService/Hello` | Ping / hello |
| GET | `/api/v2/SystemService/Overview` | System overview |
| **Users** | | |
| POST | `/api/v2/SystemService/Users` | Create user |
| GET | `/api/v2/SystemService/Users` | List users |
| DELETE | `/api/v2/SystemService/Users/:userId` | Delete user |
| GET | `/api/v2/SystemService/Users/:userId` | Get user by ID |
| PUT | `/api/v2/SystemService/Users/:userId` | Update user |
| POST | `/api/v2/SystemService/Users/:userId/Emails/Preview` | Preview user email |
| POST | `/api/v2/SystemService/Users/:userId/Emails/Send` | Send user email |
| GET | `/api/v2/SystemService/Users/:userId/Extended` | Get extended user |
| GET | `/api/v2/SystemService/Users/Count` | Count users |
| GET | `/api/v2/SystemService/Users/Extended` | List extended users |
| GET | `/api/v2/SystemService/Users/Extended/Count` | Count extended users |
| **User Options** | | |
| POST | `/api/v2/SystemService/Users/:userId/Options` | Create user option |
| GET | `/api/v2/SystemService/Users/:userId/Options` | List user options |
| DELETE | `/api/v2/SystemService/Users/:userId/Options/:optionId` | Delete user option |
| GET | `/api/v2/SystemService/Users/:userId/Options/:optionId` | Get user option |
| PUT | `/api/v2/SystemService/Users/:userId/Options/:optionId` | Update user option |
| GET | `/api/v2/SystemService/Users/:userId/Options/Count` | Count user options |
| **Tenants** | | |
| POST | `/api/v2/SystemService/Tenants` | Create tenant |
| GET | `/api/v2/SystemService/Tenants` | List tenants |
| DELETE | `/api/v2/SystemService/Tenants/:tenantId` | Delete tenant |
| GET | `/api/v2/SystemService/Tenants/:tenantId` | Get tenant by ID |
| PUT | `/api/v2/SystemService/Tenants/:tenantId` | Update tenant |
| POST | `/api/v2/SystemService/Tenants/:tenantId/Emails/Preview` | Preview tenant email |
| POST | `/api/v2/SystemService/Tenants/:tenantId/Emails/Send` | Send tenant email |
| GET | `/api/v2/SystemService/Tenants/Count` | Count tenants |
| GET | `/api/v2/SystemService/Tenants/Extended` | List extended tenants |
| GET | `/api/v2/SystemService/Tenants/Extended/Count` | Count extended tenants |
| **Tenant Options** | | |
| POST | `/api/v2/SystemService/Tenants/:tenantId/Options` | Create tenant option |
| GET | `/api/v2/SystemService/Tenants/:tenantId/Options` | List tenant options |
| DELETE | `/api/v2/SystemService/Tenants/:tenantId/Options/:optionId` | Delete tenant option |
| GET | `/api/v2/SystemService/Tenants/:tenantId/Options/:optionId` | Get tenant option |
| PUT | `/api/v2/SystemService/Tenants/:tenantId/Options/:optionId` | Update tenant option |
| GET | `/api/v2/SystemService/Tenants/:tenantId/Options/Count` | Count tenant options |
| **Contact Options** | | |
| POST | `/api/v2/SystemService/Contacts/:contactId/Options` | Create contact option |
| GET | `/api/v2/SystemService/Contacts/:contactId/Options` | List contact options |
| DELETE | `/api/v2/SystemService/Contacts/:contactId/Options/:optionId` | Delete contact option |
| GET | `/api/v2/SystemService/Contacts/:contactId/Options/:optionId` | Get contact option |
| PUT | `/api/v2/SystemService/Contacts/:contactId/Options/:optionId` | Update contact option |
| GET | `/api/v2/SystemService/Contacts/:contactId/Options/Count` | Count contact options |
| **System Options** | | |
| POST | `/api/v2/SystemService/Options` | Create option |
| GET | `/api/v2/SystemService/Options` | List options |
| DELETE | `/api/v2/SystemService/Options/:optionId` | Delete option |
| GET | `/api/v2/SystemService/Options/:optionId` | Get option by ID |
| PUT | `/api/v2/SystemService/Options/:optionId` | Update option |
| GET | `/api/v2/SystemService/Options/Count` | Count options |
| GET | `/api/v2/SystemService/Options/Key/:key` | Get option by key |
| PUT | `/api/v2/SystemService/Options/Upsert/:key` | Upsert option by key |
| **Licensing** | | |
| GET | `/api/v2/SystemService/Licensing/Licenses` | List licenses |
| GET | `/api/v2/SystemService/Licensing/Licenses/:licenseId` | Get license |
| GET | `/api/v2/SystemService/Licensing/Licenses/:licenseId/Assignments` | License assignments |
| GET | `/api/v2/SystemService/Licensing/Licenses/:licenseId/Attributes` | License attributes |
| GET | `/api/v2/SystemService/Licensing/Licenses/:licenseId/Features` | License features |
| GET | `/api/v2/SystemService/Licensing/Licenses/:licenseId/Quota` | License quota |
| POST | `/api/v2/SystemService/Licensing/Licenses/Redeem` | Redeem license |
| POST | `/api/v2/SystemService/Licensing/Licenses/Validate` | Validate license |
| **Modules** | | |
| GET | `/api/v2/StudioService/Modules` | List modules |
| GET | `/api/v2/StudioService/Modules/Data` | List modules with data |
| **Migrations** | | |
| GET | `/api/v2/SystemService/Migrations` | List migrations |
| POST | `/api/v2/SystemService/Migrations/Migrate` | Apply pending migrations |
| **Emails** | | |
| POST | `/api/v2/SystemService/Emails/Preview` | Preview email template |
| POST | `/api/v2/SystemService/Emails/SendBasic` | Send basic email |
| **Antiforgery** | | |
| GET | `/api/v2/SystemService/Antiforgery/GetAndStoreTokens` | Get and store tokens |
| GET | `/api/v2/SystemService/Antiforgery/IsRequestValid` | Validate request |
| **Portals** | | |
| POST | `/api/v2/SystemService/Portals` | Create portal |
| GET | `/api/v2/SystemService/Portals` | List portals |
| DELETE | `/api/v2/SystemService/Portals/:portalId` | Delete portal |
| GET | `/api/v2/SystemService/Portals/:portalId` | Get portal |
| PUT | `/api/v2/SystemService/Portals/:portalId` | Update portal |
| GET | `/api/v2/SystemService/Portals/Count` | Count portals |
| **Carts** | | |
| GET | `/api/v2/SystemService/Carts` | List carts |
| DELETE | `/api/v2/SystemService/Carts/:cartId` | Delete cart |
| GET | `/api/v2/SystemService/Carts/:cartId` | Get cart |
| GET | `/api/v2/SystemService/Carts/Count` | Count carts |
| **IP Lookups** | | |
| GET | `/api/v2/SystemService/IPLookups` | List IP lookups |
| DELETE | `/api/v2/SystemService/IPLookups/:ipLookupId` | Delete IP lookup |
| GET | `/api/v2/SystemService/IPLookups/:ipLookupId` | Get IP lookup |
| GET | `/api/v2/SystemService/IPLookups/Count` | Count IP lookups |

## Critical Rules

- **Admin access required** for most system operations.
- **Be careful with user/tenant deletion** — these are destructive operations.
- **Use `upsert option`** for idempotent configuration updates.
- **Database migrations (`move-`)** should be used with caution in production.
