---
name: absuite-system-cli
description: >
  Manage Alliance Business Suite (ABS) system administration using the `absuite` CLI.
  Covers cross-tenant admin (tenants, users), system/tenant/user/contact options,
  licensing, system portals, overview, IP lookups, carts, business domains, modules,
  system emails, migrations and antiforgery — via list/count/get/create/update/delete
  commands and service actions. Requires an authenticated CLI session with admin
  privileges (see absuite-login-cli). For atomic PATCH updates or raw HTTP, use the
  absuite-system (REST) skill.
---

# Alliance Business Suite — System Skill (CLI)

Manage platform administration through the `absuite` CLI's `system` service. These are
**privileged, instance-wide** operations: most require an admin-level account. The CLI does
**not** support PATCH (JSON Patch) — for partial atomic updates use the `absuite-system`
REST skill.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-system` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-system` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general CLI
   usage and configuration, see `absuite-cli`.
2. **Scoping is NOT uniform** — unlike tenant-scoped services, most SystemService commands act
   across the whole suite instance and take **no** tenant parameter. Pass a `--TenantId` /
   `--PortalId` / path-id parameter **only where a command requires it** (see each section).
   You may still set a default tenant for the licensing/modules commands that use one:
   ```powershell
   absuite config set --tenant-id <tenant-guid>
   ```
   …and reference it as `$TENANT_ID`.
3. **Discover commands:**
   ```powershell
   absuite system list-commands
   absuite system create tenant --help
   ```

## Command Structure

```
absuite system <verb> <entity> --Param value
```

- **Verbs:** `list`, `count`, `get`, `create`, `update`, `delete`, plus service actions
  (`verify`, `validate`, `redeem`, `upsert`, `migrate`, `send`/`preview` for emails).
- **Entities** include: `tenant`, `extended-tenant`, `user`, `extended-account-holder`,
  `option` (system), `tenant-option`, `user-option`, `contact-option`, `license`, `portal`,
  `business-domain`, `ip-lookup`, `cart`, `module`, `overview`, `migration`.
- The canonical PowerShell function-name form also works as the command. The function names map
  to PowerShell-approved verbs:
  - create → `New-` (e.g. `New-Tenant`, `New-AccountHolderAsync`, `New-SystemOption`, `New-SystemPortal`)
  - get/list/count → `Get-` (e.g. `Get-AllTenants`, `Get-UsersAsync`, `Get-SystemOptions`, `Get-SystemOverview`)
  - update → `Update-` (e.g. `Update-Tenant`, `Update-AccountHolderAsync`, `Update-SystemOption`)
  - delete → `Invoke-Delete...` (e.g. `Invoke-DeleteTenant`, `Invoke-DeleteAccountHolderAsync`)
  - validate license → `Confirm-LicenseAsync`; redeem → `Invoke-RedeemLicenseAsync`
  - upsert option → `Invoke-UpsertSystemOption`; verify domain → `Test-SystemBusinessDomain`
  - migrate → `Move-`; list migrations → `Invoke-Migrations`
  - antiforgery → `Get-AndStoreTokens` / `Invoke-IsRequestValidAsync`
- **JSON DTO params** are passed as a single-quoted JSON string (`--<Dto> '{...}'`) using the
  **same PascalCase field names** as the REST API.

## Key Concepts

- **Option** — a key-value setting with fields `Key`, `Value` and flags `Frozen`, `Autoload`,
  `Transient`, `Expiration` (integer). Options exist at four scopes addressed by the command's
  id parameter: **system** (by `--PortalId`), **tenant** (`--TenantId`), **user** (`--UserId`),
  **contact** (`--ContactId`). All four share the `--OptionCreateDto` / `--OptionUpdateDto` body.
- **Tenant** (cross-tenant admin) — created with `--TenantCreateDto`; required fields `Name`,
  `Email`, `CurrencyId`, `CountryId`.
- **User** (cross-tenant admin / account holder) — created with `--UserCreateDto`. `Gender` ∈
  `Unknown|Male|Female|PreferNotToSay`; on update `Availability` ∈ `DND|Busy|Away|Offline|Available`.
- **License** — validated/redeemed by `LicenseKey` in a `--LicenseValidationRequest` body.
- **System portal** — created with `--WebPortalCreateDto` (`Title`, `Domain`, `Root`, `Disabled`,
  `Description`, `WebsiteThemeId`, `BusinessDomainId`, `BusinessPortalApplicationId`).
- **Email dispatch** — instance emails use `--ObjectEmailDispatchRequest`; per-tenant/per-user
  emails use `--EmailDispatchRequest`. Required fields: `Title`, `Message`, `Culture`,
  `UiCulture`, `Recipients`. `AlertType` ∈ `None|Info|Error|Warning|Success|Action|Alert`.

## Overview

```powershell
absuite system get overview
```

## Tenants (cross-tenant admin — no tenant scope param)

### List / Count

```powershell
absuite system list all-tenants
absuite system count tenants
absuite system list all-extended-tenants
absuite system count extended-tenants
```

### Get by ID

```powershell
absuite system get tenant --TenantId <tenant-guid>
```

### Create

```powershell
absuite system create tenant --TenantCreateDto '{
  "Name": "<tenant-name>",
  "Email": "<tenant-email>",
  "CurrencyId": "<currency-id>",
  "CountryId": "<country-id>",
  "LegalName": "<legal-name>",
  "Phone": "<phone>",
  "WebUrl": "<web-url>",
  "Handler": "<handler>",
  "LanguageId": "<language-id>",
  "TimezoneId": "<timezone-id>"
}'
```

`TenantCreateDto` required: `Name`, `Email`, `CurrencyId`, `CountryId`. Optional incl. `LegalName`,
`Phone`, `WebUrl`, `Handler`, `About`, `Slogan`, `Duns`, `TaxId`, `AvatarUrl`, `StateId`, `CityId`,
`LanguageId`, `TimezoneId`, `BusinessTypeId`, `BusinessSegmentId`, `BusinessIndustryId`, `BusinessSizeId`.

### Update

```powershell
absuite system update tenant --TenantId <tenant-guid> --TenantUpdateDto '{
  "Name": "<tenant-name>",
  "Email": "<tenant-email>",
  "CurrencyId": "<currency-id>",
  "CountryId": "<country-id>",
  "SupportPhoneNumber": "<phone>"
}'
```

`TenantUpdateDto` required: `Name`, `Email`, `CurrencyId`, `CountryId`; adds social/contact fields
(`TwitterUsername`, `FacebookUrl`, `TwitterUrl`, `GitHubUrl`, `LinkedInUrl`, `InstagramUrl`,
`YouTubeUrl`, `WhatsAppNumber`, `SupportPhoneNumber`).

### Delete (destructive)

```powershell
absuite system delete tenant --TenantId <tenant-guid>
```

### Tenant emails (tenant is the id parameter — no separate tenant scope)

```powershell
absuite system preview tenant-email --TenantId <tenant-guid> --EmailDispatchRequest '{
  "Title": "<subject>", "Message": "<body>", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<recipient-email>"]
}'

absuite system send tenant-email --TenantId <tenant-guid> --EmailDispatchRequest '{
  "Title": "<subject>", "Message": "<body>", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<recipient-email>"], "AlertType": "Info"
}'
```

## Users (cross-tenant admin — no tenant scope param)

### List / Count

```powershell
absuite system list users
absuite system count users
absuite system list extended-users
absuite system count extended-users
```

### Get by ID

```powershell
absuite system get user --UserId <user-guid>
absuite system get extended-account-holder --UserId <user-guid>
```

### Create

```powershell
absuite system create account-holder --UserCreateDto '{
  "Email": "<user-email>",
  "FirstName": "<first>",
  "LastName": "<last>",
  "Password": "<password>",
  "Gender": "Unknown"
}'
```

`UserCreateDto` fields (all optional in schema): `QualifiedName`, `Birthday`, `FirstName`, `LastName`,
`PublicName`, `IdProvider`, `Gender` (`Unknown|Male|Female|PreferNotToSay`), `Email`, `About`, `Status`,
`JobTitle`, social URLs, `TimezoneId`, `LanguageId`, `CurrencyId`, `CountryId`, `StateId`, `CityId`,
`Password`.

### Update

```powershell
absuite system update account-holder --UserId <user-guid> --UserUpdateDto '{
  "Email": "<user-email>",
  "FirstName": "<first>",
  "LastName": "<last>",
  "Availability": "Available"
}'
```

`UserUpdateDto` adds `Availability` (`DND|Busy|Away|Offline|Available`) and `WebUrl`.

### Delete (destructive)

```powershell
absuite system delete account-holder --UserId <user-guid>
```

### User emails (user is the id parameter)

```powershell
absuite system preview user-email-template --UserId <user-guid> --EmailDispatchRequest '{
  "Title": "<subject>", "Message": "<body>", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<recipient-email>"]
}'

absuite system send user-email --UserId <user-guid> --EmailDispatchRequest '{
  "Title": "<subject>", "Message": "<body>", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<recipient-email>"]
}'
```

## System Options (scoped by PortalId)

System options are segmented by portal. `--PortalId` is **required** on list / count / get-by-key,
and `--Key` is **required** on create and get-by-key.

```powershell
# List / count (PortalId required)
absuite system list options --PortalId <portal-guid>
absuite system count options --PortalId <portal-guid>

# Get by ID
absuite system get option-by-id --OptionId <option-guid>

# Get by key (PortalId required)
absuite system get option-by-key --Key "<key>" --PortalId <portal-guid>

# Create (Key required; PortalId optional)
absuite system create option --Key "<key>" --PortalId <portal-guid> --OptionCreateDto '{
  "Key": "<key>",
  "Value": "<value>",
  "PortalId": "<portal-guid>",
  "Frozen": false,
  "Autoload": false,
  "Transient": false,
  "Expiration": 0
}'

# Update (full replace)
absuite system update option --OptionId <option-guid> --OptionUpdateDto '{ "Key": "<key>", "Value": "<value>" }'

# Upsert by key (create or update; PortalId optional)
absuite system upsert option --Key "<key>" --PortalId <portal-guid> --OptionUpdateDto '{ "Key": "<key>", "Value": "<value>" }'

# Delete
absuite system delete option --OptionId <option-guid>
```

`OptionCreateDto` required: `Key`, `Value`. Optional: `Id`, `Timestamp`, `PortalId`, `Frozen`,
`Autoload`, `Transient`, `Expiration`. `OptionUpdateDto` omits `Id`/`Timestamp`.

## Tenant Options (tenant is the id parameter)

```powershell
absuite system list tenant-options --TenantId <tenant-guid>
absuite system count tenant-options --TenantId <tenant-guid>
absuite system get tenant-option-by-id --TenantId <tenant-guid> --OptionId <option-guid>

# Create (Key required; PortalId optional)
absuite system create tenant-option --TenantId <tenant-guid> --Key "<key>" --OptionCreateDto '{ "Key": "<key>", "Value": "<value>" }'

# Update
absuite system update tenant-option --TenantId <tenant-guid> --OptionId <option-guid> --OptionUpdateDto '{ "Key": "<key>", "Value": "<value>" }'

# Delete
absuite system delete tenant-option --TenantId <tenant-guid> --OptionId <option-guid>
```

## User Options (user is the id parameter)

```powershell
absuite system list user-options --UserId <user-guid>
absuite system count user-options --UserId <user-guid>
absuite system get user-option-by-id --UserId <user-guid> --OptionId <option-guid>

# Create (Key required; PortalId optional)
absuite system create user-option --UserId <user-guid> --Key "<key>" --OptionCreateDto '{ "Key": "<key>", "Value": "<value>" }'

# Update
absuite system update user-option --UserId <user-guid> --OptionId <option-guid> --OptionUpdateDto '{ "Key": "<key>", "Value": "<value>" }'

# Delete
absuite system delete user-option --UserId <user-guid> --OptionId <option-guid>
```

## Contact Options (contact is the id parameter)

```powershell
absuite system list contact-options --ContactId <contact-guid>
absuite system count contact-options --ContactId <contact-guid>
absuite system get contact-option-by-id --ContactId <contact-guid> --OptionId <option-guid>

# Create (Key required; PortalId optional)
absuite system create contact-option --ContactId <contact-guid> --Key "<key>" --OptionCreateDto '{ "Key": "<key>", "Value": "<value>" }'

# Update
absuite system update contact-option --ContactId <contact-guid> --OptionId <option-guid> --OptionUpdateDto '{ "Key": "<key>", "Value": "<value>" }'

# Delete
absuite system delete contact-option --ContactId <contact-guid> --OptionId <option-guid>
```

## Licensing

```powershell
# List licenses (TenantId optional — pass it to scope to a tenant)
absuite system list licenses --TenantId <tenant-guid>

# Get a license by ID (TenantId required)
absuite system get license-by-id --TenantId <tenant-guid> --LicenseId <license-guid>

# License sub-resources (TenantId required)
absuite system list license-assignments --TenantId <tenant-guid> --LicenseId <license-guid>
absuite system list license-attributes  --TenantId <tenant-guid> --LicenseId <license-guid>
absuite system list license-features     --TenantId <tenant-guid> --LicenseId <license-guid>
absuite system get  license-records-quota --TenantId <tenant-guid> --LicenseId <license-guid>

# Validate a license (no TenantId)
absuite system validate license --LicenseValidationRequest '{ "LicenseKey": "<license-key>" }'

# Redeem a license (TenantId required)
absuite system redeem license --TenantId <tenant-guid> --LicenseValidationRequest '{ "LicenseKey": "<license-key>" }'
```

`LicenseValidationRequest` required field: `LicenseKey`.

## System Portals

```powershell
absuite system list portals
absuite system count portals
absuite system get portal --PortalId <portal-guid>

absuite system create portal --WebPortalCreateDto '{
  "Title": "<portal-title>",
  "Domain": "<portal-domain>",
  "Root": false,
  "Disabled": false,
  "Description": "<description>",
  "WebsiteThemeId": "<theme-guid>",
  "BusinessDomainId": "<business-domain-guid>",
  "BusinessPortalApplicationId": "<app-guid>"
}'

absuite system update portal --PortalId <portal-guid> --WebPortalUpdateDto '{
  "Title": "<portal-title>",
  "Domain": "<portal-domain>",
  "Disabled": false
}'

absuite system delete portal --PortalId <portal-guid>
```

`WebPortalCreateDto` fields: `Id`, `Timestamp`, `Root`, `Title`, `Domain`, `Disabled`, `Description`,
`WebsiteThemeId`, `BusinessDomainId`, `BusinessPortalApplicationId`. `WebPortalUpdateDto` omits
`Id`/`Timestamp`.

## Business Domains

```powershell
absuite system list business-domains
absuite system count business-domains
absuite system get business-domain --BusinessDomainId <business-domain-guid>

# Verify a business domain (action)
absuite system verify business-domain --BusinessDomainId <business-domain-guid>

absuite system delete business-domain --BusinessDomainId <business-domain-guid>
```

## IP Lookups

```powershell
absuite system list ip-lookups
absuite system count ip-lookups
absuite system get ip-lookup --IpLookupId <ip-lookup-guid>
absuite system delete ip-lookup --IpLookupId <ip-lookup-guid>
```

## Carts

```powershell
absuite system list carts
absuite system count carts
absuite system get cart --CartId <cart-guid>
absuite system delete cart --CartId <cart-guid>
```

## Modules

```powershell
# All modules on this suite server instance (TenantId required)
absuite system get all-modules --TenantId <tenant-guid>

# Modules available to a tenant user (TenantId optional)
absuite system get available-modules --TenantId <tenant-guid>
```

## System Emails (instance-level)

```powershell
# Preview a rendered basic email template
absuite system preview basic-email-template --ObjectEmailDispatchRequest '{
  "Title": "<subject>", "Message": "<body>", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<recipient-email>"]
}'

# Send a basic transactional email
absuite system send basic-email --ObjectEmailDispatchRequest '{
  "Title": "<subject>", "Message": "<body>", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<recipient-email>"], "AlertType": "Info", "ButtonText": "<cta-label>", "ButtonLink": "<cta-url>"
}'
```

Email body required fields: `Title`, `Message`, `Culture`, `UiCulture`, `Recipients`. Optional:
`ButtonLink`, `ButtonText`, `AlertMessage`, `AlertType` (`None|Info|Error|Warning|Success|Action|Alert`),
`ContactIds`, `TenantIds`, `UserIds`, `TemplateUrl`, `EmailTemplateId`.

## Migrations

```powershell
# List migrations (add --Pending true to list only pending)
absuite system migrations --Pending true

# Apply pending migrations (destructive — use with caution in production)
absuite system migrate
```

## Antiforgery

```powershell
# Get and store antiforgery tokens
absuite system get and-store-tokens

# Validate the antiforgery request
absuite system is-request-valid
```

## End-to-End Workflow: provision a tenant with a portal and a config option

```powershell
# 1. Create a tenant (cross-tenant admin — no tenant scope param)
absuite system create tenant --TenantCreateDto '{
  "Name": "<tenant-name>", "Email": "<tenant-email>", "CurrencyId": "<currency-id>", "CountryId": "<country-id>"
}'
# -> note the returned tenant id as <tenant-guid>

# 2. Create a system portal
absuite system create portal --WebPortalCreateDto '{
  "Title": "<portal-title>", "Domain": "<portal-domain>", "Root": false, "Disabled": false
}'
# -> note the returned portal id as <portal-guid>

# 3. Upsert a system option scoped to that portal
absuite system upsert option --Key "app.maintenance-mode" --PortalId <portal-guid> --OptionUpdateDto '{ "Key": "app.maintenance-mode", "Value": "false" }'

# 4. Add a tenant-scoped option
absuite system create tenant-option --TenantId <tenant-guid> --Key "onboarding.completed" --OptionCreateDto '{ "Key": "onboarding.completed", "Value": "false" }'

# 5. Send the tenant a welcome email
absuite system send tenant-email --TenantId <tenant-guid> --EmailDispatchRequest '{
  "Title": "Welcome", "Message": "Your workspace is ready.", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<tenant-email>"], "AlertType": "Success"
}'

# 6. Verify the tenant
absuite system get tenant --TenantId <tenant-guid>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| System overview | `absuite system get overview` |
| List tenants | `absuite system list all-tenants` |
| Count tenants | `absuite system count tenants` |
| List extended tenants | `absuite system list all-extended-tenants` |
| Count extended tenants | `absuite system count extended-tenants` |
| Get tenant | `absuite system get tenant --TenantId <tenant-guid>` |
| Create tenant | `absuite system create tenant --TenantCreateDto '{...}'` |
| Update tenant | `absuite system update tenant --TenantId <tenant-guid> --TenantUpdateDto '{...}'` |
| Delete tenant | `absuite system delete tenant --TenantId <tenant-guid>` |
| Preview tenant email | `absuite system preview tenant-email --TenantId <tenant-guid> --EmailDispatchRequest '{...}'` |
| Send tenant email | `absuite system send tenant-email --TenantId <tenant-guid> --EmailDispatchRequest '{...}'` |
| List users | `absuite system list users` |
| Count users | `absuite system count users` |
| List extended users | `absuite system list extended-users` |
| Count extended users | `absuite system count extended-users` |
| Get user | `absuite system get user --UserId <user-guid>` |
| Get extended user | `absuite system get extended-account-holder --UserId <user-guid>` |
| Create user | `absuite system create account-holder --UserCreateDto '{...}'` |
| Update user | `absuite system update account-holder --UserId <user-guid> --UserUpdateDto '{...}'` |
| Delete user | `absuite system delete account-holder --UserId <user-guid>` |
| Preview user email | `absuite system preview user-email-template --UserId <user-guid> --EmailDispatchRequest '{...}'` |
| Send user email | `absuite system send user-email --UserId <user-guid> --EmailDispatchRequest '{...}'` |
| List system options | `absuite system list options --PortalId <portal-guid>` |
| Count system options | `absuite system count options --PortalId <portal-guid>` |
| Get option by ID | `absuite system get option-by-id --OptionId <option-guid>` |
| Get option by key | `absuite system get option-by-key --Key "<key>" --PortalId <portal-guid>` |
| Create option | `absuite system create option --Key "<key>" --OptionCreateDto '{...}'` |
| Update option | `absuite system update option --OptionId <option-guid> --OptionUpdateDto '{...}'` |
| Upsert option | `absuite system upsert option --Key "<key>" --OptionUpdateDto '{...}'` |
| Delete option | `absuite system delete option --OptionId <option-guid>` |
| List tenant options | `absuite system list tenant-options --TenantId <tenant-guid>` |
| Count tenant options | `absuite system count tenant-options --TenantId <tenant-guid>` |
| Get tenant option | `absuite system get tenant-option-by-id --TenantId <tenant-guid> --OptionId <option-guid>` |
| Create tenant option | `absuite system create tenant-option --TenantId <tenant-guid> --Key "<key>" --OptionCreateDto '{...}'` |
| Update tenant option | `absuite system update tenant-option --TenantId <tenant-guid> --OptionId <option-guid> --OptionUpdateDto '{...}'` |
| Delete tenant option | `absuite system delete tenant-option --TenantId <tenant-guid> --OptionId <option-guid>` |
| List user options | `absuite system list user-options --UserId <user-guid>` |
| Count user options | `absuite system count user-options --UserId <user-guid>` |
| Get user option | `absuite system get user-option-by-id --UserId <user-guid> --OptionId <option-guid>` |
| Create user option | `absuite system create user-option --UserId <user-guid> --Key "<key>" --OptionCreateDto '{...}'` |
| Update user option | `absuite system update user-option --UserId <user-guid> --OptionId <option-guid> --OptionUpdateDto '{...}'` |
| Delete user option | `absuite system delete user-option --UserId <user-guid> --OptionId <option-guid>` |
| List contact options | `absuite system list contact-options --ContactId <contact-guid>` |
| Count contact options | `absuite system count contact-options --ContactId <contact-guid>` |
| Get contact option | `absuite system get contact-option-by-id --ContactId <contact-guid> --OptionId <option-guid>` |
| Create contact option | `absuite system create contact-option --ContactId <contact-guid> --Key "<key>" --OptionCreateDto '{...}'` |
| Update contact option | `absuite system update contact-option --ContactId <contact-guid> --OptionId <option-guid> --OptionUpdateDto '{...}'` |
| Delete contact option | `absuite system delete contact-option --ContactId <contact-guid> --OptionId <option-guid>` |
| List licenses | `absuite system list licenses --TenantId <tenant-guid>` |
| Get license | `absuite system get license-by-id --TenantId <tenant-guid> --LicenseId <license-guid>` |
| License assignments | `absuite system list license-assignments --TenantId <tenant-guid> --LicenseId <license-guid>` |
| License attributes | `absuite system list license-attributes --TenantId <tenant-guid> --LicenseId <license-guid>` |
| License features | `absuite system list license-features --TenantId <tenant-guid> --LicenseId <license-guid>` |
| License quota | `absuite system get license-records-quota --TenantId <tenant-guid> --LicenseId <license-guid>` |
| Validate license | `absuite system validate license --LicenseValidationRequest '{...}'` |
| Redeem license | `absuite system redeem license --TenantId <tenant-guid> --LicenseValidationRequest '{...}'` |
| List portals | `absuite system list portals` |
| Count portals | `absuite system count portals` |
| Get portal | `absuite system get portal --PortalId <portal-guid>` |
| Create portal | `absuite system create portal --WebPortalCreateDto '{...}'` |
| Update portal | `absuite system update portal --PortalId <portal-guid> --WebPortalUpdateDto '{...}'` |
| Delete portal | `absuite system delete portal --PortalId <portal-guid>` |
| List business domains | `absuite system list business-domains` |
| Count business domains | `absuite system count business-domains` |
| Get business domain | `absuite system get business-domain --BusinessDomainId <business-domain-guid>` |
| Verify business domain | `absuite system verify business-domain --BusinessDomainId <business-domain-guid>` |
| Delete business domain | `absuite system delete business-domain --BusinessDomainId <business-domain-guid>` |
| List IP lookups | `absuite system list ip-lookups` |
| Count IP lookups | `absuite system count ip-lookups` |
| Get IP lookup | `absuite system get ip-lookup --IpLookupId <ip-lookup-guid>` |
| Delete IP lookup | `absuite system delete ip-lookup --IpLookupId <ip-lookup-guid>` |
| List carts | `absuite system list carts` |
| Count carts | `absuite system count carts` |
| Get cart | `absuite system get cart --CartId <cart-guid>` |
| Delete cart | `absuite system delete cart --CartId <cart-guid>` |
| List all modules | `absuite system get all-modules --TenantId <tenant-guid>` |
| List available modules | `absuite system get available-modules --TenantId <tenant-guid>` |
| Preview basic email | `absuite system preview basic-email-template --ObjectEmailDispatchRequest '{...}'` |
| Send basic email | `absuite system send basic-email --ObjectEmailDispatchRequest '{...}'` |
| List migrations | `absuite system migrations` |
| Apply migrations | `absuite system migrate` |
| Get & store antiforgery tokens | `absuite system get and-store-tokens` |
| Validate antiforgery request | `absuite system is-request-valid` |

## Critical Rules

- **Admin access required** for most system operations.
- **Cross-tenant admin commands (tenants, users, and their emails) take NO tenant scope param** —
  they act across the whole suite instance. The `--TenantId` / `--UserId` on those commands is the
  **record id** of the tenant/user being managed, not a scoping filter.
- **Options scope by their id parameter** — system options by `--PortalId`, tenant/user/contact
  options by `--TenantId` / `--UserId` / `--ContactId`.
- **Tenant/user/option/portal deletion is destructive.** **`absuite system migrate`** mutates the
  database — use with caution in production.
- **No PATCH in the CLI.** For atomic partial updates (JSON Patch), use the `absuite-system` REST skill.
