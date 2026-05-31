---
name: absuite-contacts
description: >
  Create, read, update, patch, and delete contacts in the Alliance Business Suite
  (ABS) CRM Service using the `absuite` CLI. Covers individual and organization
  contacts, extended views, relationship graphs, avatars, wallets, carts, social
  profiles, contact options (key-value metadata), contact emails, and user/tenant
  sync operations. Requires an authenticated CLI session (use the `absuite-login`
  skill to authenticate first).
---

# Alliance Business Suite — Contacts Skill

Manage contacts through the `absuite` CLI's `crm` service. All contact operations are tenant-scoped and require authentication.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant** — all contact operations require a tenant. Either set a default:
   ```bash
   absuite config set --tenant-id <tenant-guid>
   ```
   Or pass `--TenantId <guid>` on each call.
3. **Discover commands** — run `absuite crm list-commands` to see all CRM commands, or use `--help` on any command for full parameter and output schemas.

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

## Command Discovery

```bash
# List all CRM commands
absuite crm list-commands

# Filter for contact-related commands
absuite crm list-commands | grep contact

# Get detailed help for any command
absuite crm create contact --help
```

## Key Concepts

- **Contact** — a person or organization in the CRM. Type `0` = Individual, Type `1` = Organization.
- **Extended Contact** — a contact record enriched with related data (profiles, wallets, etc.).
- **Contact Option** — a key-value metadata pair attached to a contact (e.g., preferences, tags).
- **Social Profile** — a contact's linked social/web profiles.
- **Relationship Graph** — contacts can be linked: individual↔individual, individual↔organization, organization↔organization.

## CRUD Operations

### List Contacts

```bash
absuite crm list contacts --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Extended Contacts (with related data)

```bash
absuite crm list extended-contacts --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Contacts

```bash
absuite crm count contacts --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List by Type

**Individuals:**

```bash
absuite crm list business-owned-individuals --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Extended individuals:**

```bash
absuite crm list extended-business-owned-individuals --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Organizations:**

```bash
absuite crm list business-owned-organizations --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Extended organizations:**

```bash
absuite crm list extended-business-owned-organizations --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count by Type

```bash
absuite crm count business-owned-individuals --TenantId $TENANT_ID
absuite crm count business-owned-organizations --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Contact by ID

```bash
absuite crm get contact --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Extended Contact

```bash
absuite crm get extended-contact --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Individual by ID

```bash
absuite crm get business-owned-individual --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals/<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Organization by ID

```bash
absuite crm get business-owned-organization --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations/<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Contact

```bash
absuite crm create contact --TenantId $TENANT_ID --ContactCreateDto '{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "tenantId": "<tenant-guid>",
  "type": "0",
  "countryId": "USA",
  "currencyId": "USD.USA"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "type": "0",
    "countryId": "USA",
    "currencyId": "USD.USA"
  }'
```

**Key ContactCreateDto fields:**

| Field | Type | Description |
|---|---|---|
| `tenantId` | String | Owner tenant (required) |
| `firstName` | String | First name |
| `lastName` | String | Last name |
| `email` | String | Email address |
| `type` | String | `"0"` = Individual, `"1"` = Organization |
| `countryId` | String | Country code (e.g., `"USA"`, `"COL"`) |
| `currencyId` | String | Currency code (e.g., `"USD.USA"`) |
| `qualifiedName` | String | Display name |
| `companyName` | String | Company name (for organizations) |
| `jobTitle` | String | Job title |
| `phone` | String | Phone number |

Run `absuite crm create contact --help` for the full schema.

### Update Contact (Full Replace)

```bash
absuite crm update contact --TenantId $TENANT_ID --ContactId <contact-guid> --ContactUpdateDto '{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com"
  }'
```

### Patch Contact (Partial Update — RFC 6902)

```bash
absuite crm patch contact --TenantId $TENANT_ID --ContactId <contact-guid> --Body '[
  {"op": "replace", "path": "/FirstName", "value": "Janet"},
  {"op": "replace", "path": "/LastName", "value": "Smith"}
]'
```

**REST API equivalent:**
```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {"op": "replace", "path": "/FirstName", "value": "Janet"},
    {"op": "replace", "path": "/LastName", "value": "Smith"}
  ]'
```

**Supported operations:** `replace`, `add`, `remove`.

### Delete Contact

```bash
absuite crm delete contact --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contact Relationships

Contacts can be linked to each other, forming a relationship graph.

### Individual → Individuals

```bash
absuite crm list individual-related-individuals --TenantId $TENANT_ID --ContactId <individual-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals/<individual-guid>/Individuals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Individual → Organizations

```bash
absuite crm list individual-related-organizations --TenantId $TENANT_ID --ContactId <individual-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals/<individual-guid>/Organizations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Organization → Individuals

```bash
absuite crm list organization-related-individuals --TenantId $TENANT_ID --ContactId <organization-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations/<organization-guid>/Individuals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Organization → Organizations

```bash
absuite crm list organization-related-organizations --TenantId $TENANT_ID --ContactId <organization-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations/<organization-guid>/Organizations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Related Resources

### Wallet

```bash
absuite crm get contact-wallet --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Wallet" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Cart

```bash
absuite crm get contact-cart --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Cart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Social Profile

```bash
# Get primary social profile
absuite crm get contact-social-profile --TenantId $TENANT_ID --ContactId <contact-guid>

# List all social profiles
absuite crm list contact-profiles --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/SocialProfile" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Profiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Avatar

```bash
# Get avatar
absuite crm get contact-avatar --TenantId $TENANT_ID --ContactId <contact-guid>

# Update avatar
absuite crm update contact-avatar --TenantId $TENANT_ID --ContactId <contact-guid> --Avatar @/path/to/avatar.png
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Avatar" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Avatar" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/avatar.png"
```

## Contact Options (Key-Value Metadata)

Store arbitrary metadata on contacts using key-value pairs.

### List All Options

```bash
absuite crm list contact-options --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Options

```bash
absuite crm count contact-options --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Option by Key

```bash
absuite crm get contact-option-by-key --TenantId $TENANT_ID --ContactId <contact-guid> --ContactOptionKey preferred-language
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/Key/preferred-language" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Option by ID

```bash
absuite crm get contact-option-by-id --TenantId $TENANT_ID --ContactId <contact-guid> --ContactOptionId <option-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Option

```bash
absuite crm create contact-option --TenantId $TENANT_ID --ContactId <contact-guid> --ContactOptionCreateDto '{
  "key": "preferred-language",
  "value": "en-US"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "preferred-language",
    "value": "en-US"
  }'
```

### Upsert Option (Create or Update by Key)

```bash
absuite crm upsert contact-option --TenantId $TENANT_ID --ContactId <contact-guid> --ContactOptionKey preferred-language --ContactOptionUpdateDto '{
  "value": "es-CO"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/Upsert/preferred-language" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "preferred-language",
    "value": "es-CO"
  }'
```

### Update Option

```bash
absuite crm update contact-option --TenantId $TENANT_ID --ContactId <contact-guid> --ContactOptionId <option-guid> --ContactOptionUpdateDto '{
  "value": "fr-FR"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "preferred-language",
    "value": "fr-FR"
  }'
```

### Delete Option

```bash
absuite crm delete contact-option --TenantId $TENANT_ID --ContactId <contact-guid> --ContactOptionId <option-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contact Emails

### Send Email to a Contact

```bash
absuite crm send contact-email --TenantId $TENANT_ID --ContactId <contact-guid> --EmailDispatchRequest '{
  "title": "Your Report Is Ready",
  "message": "Please find your monthly report attached.",
  "culture": "en-US",
  "uiCulture": "en-US"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Report Is Ready",
    "message": "Please find your monthly report attached.",
    "culture": "en-US",
    "uiCulture": "en-US"
  }'
```

### Preview Contact Email Template

```bash
absuite crm preview contact-email-template --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Preview Subject",
    "message": "Preview body"
  }'
```

## Sync Operations

Synchronize users and tenants into a tenant's contact list.

### Sync Current User → Current Tenant

```bash
absuite crm sync-current-holder-to-current-tenant
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Sync" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Sync Current User → Specific Tenant

```bash
absuite crm sync-current-holder-to-tenant --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Sync/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Sync a User → a Tenant

```bash
absuite crm sync-holder-to-tenant --TenantId $TENANT_ID --UserId <user-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Sync/User" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Sync a Tenant → Another Tenant

```bash
absuite crm sync-tenant-to-tenant --TenantId $TARGET_TENANT_ID --SourceTenantId <source-tenant-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Sync/Tenant" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Upsert User onto a Tenant's Contact List

```bash
absuite crm upsert user-onto-another-tenant-contact-list --TenantId $TENANT_ID --UserId <user-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals/Upsert" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Upsert Tenant onto Another Tenant's Contact List

```bash
absuite crm upsert tenant-onto-another-tenant-contact-list --TenantId $TARGET_TENANT_ID --SourceTenantId <source-tenant-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations/Upsert" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contact Profiles

Manage contact profiles as standalone resources.

### List Contact Profiles

```bash
absuite crm list contact-profiles-query --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Contact Profiles

```bash
absuite crm count contact-profiles --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Contact Profile by ID

```bash
absuite crm get contact-profile-by-id --TenantId $TENANT_ID --ContactProfileId <profile-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles/<profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Contact Profile

```bash
absuite crm create contact-profile --TenantId $TENANT_ID --ContactProfileCreateDto '{
  "contactId": "<contact-guid>",
  "type": "LinkedIn",
  "url": "https://linkedin.com/in/janedoe"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<contact-guid>",
    "type": "LinkedIn",
    "url": "https://linkedin.com/in/janedoe"
  }'
```

### Update Contact Profile

```bash
absuite crm update contact-profile --TenantId $TENANT_ID --ContactProfileId <profile-guid> --ContactProfileUpdateDto '{
  "url": "https://linkedin.com/in/janesmith"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles/<profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://linkedin.com/in/janesmith"
  }'
```

### Delete Contact Profile

```bash
absuite crm delete contact-profile --TenantId $TENANT_ID --ContactProfileId <profile-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles/<profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List contacts | `absuite crm list contacts --TenantId <guid>` |
| List extended | `absuite crm list extended-contacts --TenantId <guid>` |
| Count contacts | `absuite crm count contacts --TenantId <guid>` |
| List individuals | `absuite crm list business-owned-individuals --TenantId <guid>` |
| List organizations | `absuite crm list business-owned-organizations --TenantId <guid>` |
| Get contact | `absuite crm get contact --TenantId <guid> --ContactId <guid>` |
| Get extended | `absuite crm get extended-contact --TenantId <guid> --ContactId <guid>` |
| Create contact | `absuite crm create contact --TenantId <guid> --ContactCreateDto '{...}'` |
| Update contact | `absuite crm update contact --TenantId <guid> --ContactId <guid> --ContactUpdateDto '{...}'` |
| Patch contact | `absuite crm patch contact --TenantId <guid> --ContactId <guid> --Body '[...]'` |
| Delete contact | `absuite crm delete contact --TenantId <guid> --ContactId <guid>` |
| Related individuals | `absuite crm list individual-related-individuals --TenantId <guid> --ContactId <guid>` |
| Related orgs | `absuite crm list individual-related-organizations --TenantId <guid> --ContactId <guid>` |
| Get wallet | `absuite crm get contact-wallet --TenantId <guid> --ContactId <guid>` |
| Get cart | `absuite crm get contact-cart --TenantId <guid> --ContactId <guid>` |
| Get avatar | `absuite crm get contact-avatar --TenantId <guid> --ContactId <guid>` |
| List options | `absuite crm list contact-options --TenantId <guid> --ContactId <guid>` |
| Upsert option | `absuite crm upsert contact-option --TenantId <guid> --ContactId <guid> --ContactOptionKey <key> --ContactOptionUpdateDto '{...}'` |
| Send email | `absuite crm send contact-email --TenantId <guid> --ContactId <guid> --EmailDispatchRequest '{...}'` |
| Sync user | `absuite crm sync-holder-to-tenant --TenantId <guid> --UserId <guid>` |
| List profiles | `absuite crm list contact-profiles-query --TenantId <guid>` |
| Count profiles | `absuite crm count contact-profiles --TenantId <guid>` |
| Get profile | `absuite crm get contact-profile-by-id --TenantId <guid> --ContactProfileId <guid>` |
| Create profile | `absuite crm create contact-profile --TenantId <guid> --ContactProfileCreateDto '{...}'` |
| Update profile | `absuite crm update contact-profile --TenantId <guid> --ContactProfileId <guid> --ContactProfileUpdateDto '{...}'` |
| Delete profile | `absuite crm delete contact-profile --TenantId <guid> --ContactProfileId <guid>` |

## Full Example: End-to-End Contact Management

```bash
# 1. Authenticate
absuite login --email admin@company.com

# 2. Set tenant
absuite config set --tenant-id 00000000-0000-0000-0000-000000000000

# 3. Create an individual contact
absuite crm create contact --ContactCreateDto '{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@acme.com",
  "type": "0",
  "jobTitle": "VP of Engineering",
  "companyName": "Acme Corp",
  "countryId": "USA",
  "currencyId": "USD.USA"
}'
# Note the returned contact ID

# 4. Create an organization contact
absuite crm create contact --ContactCreateDto '{
  "qualifiedName": "Acme Corporation",
  "email": "info@acme.com",
  "type": "1",
  "companyName": "Acme Corporation",
  "countryId": "USA"
}'

# 5. Set metadata on the individual
absuite crm upsert contact-option --ContactId <jane-id> --ContactOptionKey preferred-language --ContactOptionUpdateDto '{"value": "en-US"}'
absuite crm upsert contact-option --ContactId <jane-id> --ContactOptionKey tier --ContactOptionUpdateDto '{"value": "enterprise"}'

# 6. Send a welcome email
absuite crm send contact-email --ContactId <jane-id> --EmailDispatchRequest '{
  "title": "Welcome to Our Platform",
  "message": "Hi Jane, welcome aboard!",
  "culture": "en-US"
}'

# 7. View relationships
absuite crm list individual-related-organizations --ContactId <jane-id>

# 8. Get extended view
absuite crm get extended-contact --ContactId <jane-id>

# 9. Patch update
absuite crm patch contact --ContactId <jane-id> --Body '[
  {"op": "replace", "path": "/JobTitle", "value": "CTO"}
]'

# 10. Verify
absuite crm get contact --ContactId <jane-id>
```

## Critical Rules

- **Authenticate first.** Use `absuite login` before any CRM operation.
- **Always provide a tenant context.** Set a default with `absuite config set --tenant-id` or pass `--TenantId` on each call.
- **Use `--help` before unfamiliar commands.** It shows exact parameter names, types, DTO schemas, and return types.
- **Use `list-commands` for discovery.** Don't guess — run `absuite crm list-commands`.
- **Save the contact `id` after creation.** The response `result` includes the new contact's ID.
- **Use `upsert contact-option`** to set metadata — it creates or updates in one call.
- **Contact types:** `0` = Individual, `1` = Organization. Use `list business-owned-individuals` or `list business-owned-organizations` to filter.
- **JSON Patch for partial updates.** Use `patch contact` with RFC 6902 operations. Use `update contact` for full replacements.
- **Never hard-code IDs or credentials.** Use environment variables and values from API responses.

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v2/CrmService/Contacts` | Create a new contact |
| GET | `/api/v2/CrmService/Contacts` | List all contacts |
| GET | `/api/v2/CrmService/Contacts/Count` | Count contacts |
| GET | `/api/v2/CrmService/Contacts/Extended` | List extended contacts |
| GET | `/api/v2/CrmService/Contacts/:contactId` | Get contact by ID |
| PUT | `/api/v2/CrmService/Contacts/:contactId` | Update contact |
| PATCH | `/api/v2/CrmService/Contacts/:contactId` | Patch contact |
| DELETE | `/api/v2/CrmService/Contacts/:contactId` | Delete contact |
| GET | `/api/v2/CrmService/Contacts/:contactId/Extended` | Get extended contact |
| GET | `/api/v2/CrmService/Contacts/:contactId/Avatar` | Get avatar |
| POST | `/api/v2/CrmService/Contacts/:contactId/Avatar` | Upload avatar |
| GET | `/api/v2/CrmService/Contacts/:contactId/Cart` | Get contact's cart |
| GET | `/api/v2/CrmService/Contacts/:contactId/Wallet` | Get contact's wallet |
| GET | `/api/v2/CrmService/Contacts/:contactId/Profiles` | List social profiles |
| GET | `/api/v2/CrmService/Contacts/:contactId/SocialProfile` | Get social profile |
| POST | `/api/v2/CrmService/Contacts/:contactId/Emails/Send` | Send email |
| POST | `/api/v2/CrmService/Contacts/:contactId/Emails/Preview` | Preview email |
| POST | `/api/v2/CrmService/Contacts/:contactId/Options` | Create option |
| GET | `/api/v2/CrmService/Contacts/:contactId/Options` | List options |
| GET | `/api/v2/CrmService/Contacts/:contactId/Options/Count` | Count options |
| GET | `/api/v2/CrmService/Contacts/:contactId/Options/:optionId` | Get option by ID |
| PUT | `/api/v2/CrmService/Contacts/:contactId/Options/:optionId` | Update option |
| DELETE | `/api/v2/CrmService/Contacts/:contactId/Options/:optionId` | Delete option |
| GET | `/api/v2/CrmService/Contacts/:contactId/Options/Key/:key` | Get option by key |
| PUT | `/api/v2/CrmService/Contacts/:contactId/Options/Upsert/:key` | Upsert option by key |
| GET | `/api/v2/CrmService/Contacts/Individuals` | List individuals |
| GET | `/api/v2/CrmService/Contacts/Individuals/Count` | Count individuals |
| GET | `/api/v2/CrmService/Contacts/Individuals/Extended` | List extended individuals |
| GET | `/api/v2/CrmService/Contacts/Individuals/:contactId` | Get individual by ID |
| GET | `/api/v2/CrmService/Contacts/Individuals/:contactId/Individuals` | Related individuals |
| GET | `/api/v2/CrmService/Contacts/Individuals/:contactId/Organizations` | Related organizations |
| POST | `/api/v2/CrmService/Contacts/Individuals/Upsert` | Upsert user as contact |
| GET | `/api/v2/CrmService/Contacts/Organizations` | List organizations |
| GET | `/api/v2/CrmService/Contacts/Organizations/Count` | Count organizations |
| GET | `/api/v2/CrmService/Contacts/Organizations/Extended` | List extended orgs |
| GET | `/api/v2/CrmService/Contacts/Organizations/:contactId` | Get org by ID |
| GET | `/api/v2/CrmService/Contacts/Organizations/:contactId/Individuals` | Org's individuals |
| GET | `/api/v2/CrmService/Contacts/Organizations/:contactId/Organizations` | Org's organizations |
| POST | `/api/v2/CrmService/Contacts/Organizations/Upsert` | Upsert tenant as contact |
| POST | `/api/v2/CrmService/Sync` | Sync current user to current tenant |
| POST | `/api/v2/CrmService/Sync/Me` | Sync current user to tenant |
| POST | `/api/v2/CrmService/Sync/User` | Sync user to tenant |
| POST | `/api/v2/CrmService/Sync/Tenant` | Sync tenant to tenant |
| POST | `/api/v2/CrmService/ContactProfiles` | Create contact profile |
| GET | `/api/v2/CrmService/ContactProfiles` | List contact profiles |
| GET | `/api/v2/CrmService/ContactProfiles/Count` | Count contact profiles |
| DELETE | `/api/v2/CrmService/ContactProfiles/:contactProfileId` | Delete contact profile |
| GET | `/api/v2/CrmService/ContactProfiles/:contactProfileId` | Get contact profile |
| PUT | `/api/v2/CrmService/ContactProfiles/:contactProfileId` | Update contact profile |
