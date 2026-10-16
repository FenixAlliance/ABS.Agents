---
name: absuite-system
description: >
  Manage system administration in the Alliance Business Suite (ABS) via the REST API.
  Covers cross-tenant admin (tenants, users), system/tenant/user/contact options,
  licensing, system portals, overview, IP lookups, carts, business domains, system
  emails, migrations and antiforgery, including atomic PATCH (JSON Patch) updates.
  Most operations require an instance-administrator bearer token (business_owner of
  the root tenant; see the absuite-login skill to authenticate).
key: fenixalliance.absuite.system
version: 1.1.0
---

# Alliance Business Suite: System (REST)

The **SystemService** is the platform administration surface of the Alliance Business Suite. It exposes
**cross-tenant** admin operations (manage every tenant and every user on the suite instance),
key-value **options** at four scopes (system, tenant, user, contact), **licensing** (validate / redeem /
inspect), **system portals** (read and patch), a **system overview**, **IP lookups**, **carts**,
**business domains**, admin **email** dispatch, database **migrations**, and **antiforgery** tokens.

Most of these operations are privileged: they read and write data across the whole instance, so the use
case authorizes them against the **root tenant** and requires the **`business_owner`** role there (an
instance administrator). The caller does not send the root tenant id; the server supplies it. Exceptions
are called out per section (emails need the `email_send` permission, licensing is tenant-scoped, license
validation and antiforgery are anonymous). Treat user/tenant deletion and migration as destructive.

> For the CLI equivalent of these operations, see `absuite-system-cli`. For general REST conventions
> (auth, envelope, paging, JSON Patch), see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select`; page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource**: it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) causes silent data loss.
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902): it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

## Authentication

1. **Obtain a bearer token:**

```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<admin-email>", "password": "<password>"}'
```

Extract `accessToken` from the JSON response and export it:

```bash
export ABSUITE_ACCESS_TOKEN="<accessToken>"
```

2. **Send it on every request:**

```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/SystemService/...` (the Modules reads live under
   `$ABSUITE_HOST_URL/api/v2/StudioService/...`).

4. **Response envelope:** every call returns the following (except the Antiforgery and email Preview
   actions, which return raw tokens / raw HTML):

```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "...",
  "timestamp": "...",
  "result": <data | array | int | null>
}
```

Always check `isSuccess`; read the payload from `result`.

## Tenant scoping and authorization (read carefully: it varies per endpoint)

SystemService is mostly an instance-wide admin surface, so scoping is **not** uniform. Apply exactly
what each endpoint expects:

| Area | Scoping | Who may call |
|---|---|---|
| **Cross-tenant admin: Tenants, Users** | **No `tenantId`.** These act across the whole instance. Do **not** add `?tenantId=` or `X-TenantId`. | `business_owner` of the root tenant |
| **Tenant / User / Contact options** | Tenant/user/contact is identified by the **path segment** (`/Tenants/{tenantId}/...`, `/Users/{userId}/...`, `/Contacts/{contactId}/...`), **not** a `?tenantId=` query param. `portalId` is an optional query filter. | `business_owner` of the root tenant |
| **System options** | Scoped by **`portalId`** (query). Required on list / count / get-by-key; optional on create / upsert. No `tenantId`. | `business_owner` of the root tenant |
| **Licensing reads and redeem** | `tenantId` **required** (query or `X-TenantId`) on list, get-by-id, every sub-resource read (Assignments/Attributes/Features/Quota) and Redeem. | Any authenticated member of that tenant |
| **Licensing validate** | **No** `tenantId`. | Anonymous |
| **Modules** | `GET /StudioService/Modules` needs `tenantId` **required**. `GET /StudioService/Modules/Data` takes `tenantId` **optional**. | Authenticated user |
| **Tenant emails** (`/Tenants/{tenantId}/Emails/...`) | **No `tenantId` query**; the tenant is the path segment. | `email_send` permission in **that** tenant |
| **User emails, system Emails** | **No `tenantId`.** | `email_send` permission in the root tenant |
| **Overview, Portals, Carts, IPLookups, BusinessDomains, Migrations** | **No `tenantId`.** Instance/host scoped. | `business_owner` of the root tenant |
| **Antiforgery** | **No `tenantId`.** | Anonymous (no bearer needed) |

The platform reads `tenantId` from the `?tenantId=` query param or the `X-TenantId` header interchangeably
where it is accepted. Prefer the query param in examples.

## Key Concepts

- **Option**: a key-value setting (`key`, `value`) with flags: `frozen` (read-only/locked), `autoload`
  (eager-loaded), `transient` (not persisted long-term), and `expiration` (integer TTL). Options exist at
  four scopes addressed by route: **system** (`/Options`), **tenant** (`/Tenants/{tenantId}/Options`),
  **user** (`/Users/{userId}/Options`), and **contact** (`/Contacts/{contactId}/Options`). All four share
  the `OptionCreateDto` / `OptionUpdateDto` body shape. `portalId` optionally segments options by portal.
- **System option upsert**: `PUT /Options/Upsert/{key}` creates or updates a system option by key
  (idempotent configuration writes). System options only.
- **Tenant** (cross-tenant admin): a full business/org record created with `TenantCreateDto`
  (`name`, `email`, `countryId` are required; `currencyId` is optional and derived from the country when
  omitted). `Extended` variants return enriched records.
- **User** (cross-tenant admin, a.k.a. account holder): created with `UserCreateDto`. `gender` ∈
  `Unknown|Male|Female|PreferNotToSay`; on update `availability` ∈ `DND|Busy|Away|Offline|Available`.
- **License**: validated/redeemed by `licenseKey`. A license has Assignments, Attributes, Features and a
  records Quota, each readable by `licenseId`.
- **System portal**: a web portal record (`title`, `domain`, `websiteThemeId`, `businessDomainId`,
  `businessPortalApplicationId`, `root`, `disabled`, `description`), readable and patchable here
  (`WebPortalUpdateDto` shape).
- **Email dispatch**: admin email requests carry `title`, `message`, `culture`, `uiCulture`, and a
  `recipients` array (all required), plus optional `buttonLink`/`buttonText`, `alertMessage`,
  `alertType` ∈ `None|Info|Error|Warning|Success|Action|Alert`, and addressing arrays
  (`contactIds`, `tenantIds`, `userIds`) and template refs (`templateUrl`, `emailTemplateId`).
- **PATCH = JSON Patch (RFC 6902)**: body is a JSON **array** of operations
  (`{ "op": "replace", "path": "/value", "value": "..." }`); see the PATCH section below.

---

## Overview

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Overview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Tenants (cross-tenant admin, NO tenantId)

```bash
# List all tenants on this suite instance
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count tenants
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List extended tenants / count
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/Extended/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a tenant by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a tenant
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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

# Update a tenant (full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "Name": "<tenant-name>",
        "Email": "<tenant-email>",
        "CurrencyId": "<currency-id>",
        "CountryId": "<country-id>"
      }'

# Delete a tenant (destructive)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`TenantCreateDto` required: `name`, `email`, `countryId` (3-letter ISO code, e.g. `COL`). Optional incl.
`kind` (`Organization` default | `Individual`), `currencyId` (format `USD.USA`; derived from the country
when omitted), `legalName`, `phone`, `webUrl`, `handler`, `about`, `slogan`, `duns`, `taxId`, `avatarUrl`,
`stateId`, `cityId`, `languageId`, `timezoneId`, `businessTypeId`, `businessSegmentId`,
`businessIndustryId`, `businessSizeId`.
`TenantUpdateDto` required: `name`, `email`, `countryId`; optional `kind` and `currencyId`; adds social/contact fields
(`twitterUsername`, `facebookUrl`, `twitterUrl`, `gitHubUrl`, `linkedInUrl`, `instagramUrl`, `youTubeUrl`,
`whatsAppNumber`, `supportPhoneNumber`).

### Tenant emails (NO tenantId query; the tenant is the path segment)

Authorized against the **target tenant**: the caller needs the `email_send` permission in that tenant.
Preview returns raw HTML, not the envelope.

```bash
# Preview a rendered email for a tenant
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "Title": "<subject>",
        "Message": "<body>",
        "Culture": "en-US",
        "UiCulture": "en-US",
        "Recipients": ["<recipient-email>"]
      }'

# Send an email to a tenant
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "Title": "<subject>",
        "Message": "<body>",
        "Culture": "en-US",
        "UiCulture": "en-US",
        "Recipients": ["<recipient-email>"],
        "AlertType": "Info"
      }'
```

## Users (cross-tenant admin, NO tenantId)

```bash
# List users / count
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List extended users / count
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/Extended/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a user by ID / extended by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a user
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "Email": "<user-email>",
        "FirstName": "<first>",
        "LastName": "<last>",
        "Password": "<password>",
        "Gender": "Unknown"
      }'

# Update a user (full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "Email": "<user-email>",
        "FirstName": "<first>",
        "LastName": "<last>",
        "Availability": "Available"
      }'

# Delete a user (destructive)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`UserCreateDto` fields (all optional in the schema): `qualifiedName`, `birthday`, `firstName`, `lastName`,
`publicName`, `idProvider`, `gender` (`Unknown|Male|Female|PreferNotToSay`), `email`, `about`, `status`,
`jobTitle`, social URLs (`gitHubUrl`, `websiteUrl`, `twitterUrl`, `facebookUrl`, `youTubeUrl`,
`linkedInUrl`, `instagramUrl`), `timezoneId`, `languageId`, `currencyId`, `countryId`, `stateId`, `cityId`,
`password`. `UserUpdateDto` adds `availability` (`DND|Busy|Away|Offline|Available`) and `webUrl`.

### User emails (NO tenantId; the user is the path segment)

Authorized against the root tenant: the caller needs the `email_send` permission there. Preview returns
raw HTML.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "<subject>", "Message": "<body>", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<recipient-email>"] }'

curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "<subject>", "Message": "<body>", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<recipient-email>"] }'
```

## System Options (scoped by portalId)

```bash
# List options for a portal (portalId REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Options?portalId=<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count options for a portal (portalId REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Options/Count?portalId=<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get an option by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get an option by key (portalId REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Options/Key/<key>?portalId=<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create an option (key REQUIRED as query param; portalId optional)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Options?key=<key>&portalId=<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "Key": "<key>",
        "Value": "<value>",
        "PortalId": "<portal-guid>",
        "Frozen": false,
        "Autoload": false,
        "Transient": false,
        "Expiration": 0
      }'

# Update an option (full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Key": "<key>", "Value": "<value>" }'

# Upsert an option by key (create or update; portalId optional)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Options/Upsert/<key>?portalId=<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Key": "<key>", "Value": "<value>" }'

# Delete an option
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`OptionCreateDto` required: `key`, `value`. Optional: `id`, `timestamp`, `portalId`, `frozen`, `autoload`,
`transient`, `expiration`. `OptionUpdateDto` omits `id`/`timestamp`.

## Tenant Options (admin; the tenant is the path segment)

```bash
# List / count options for a tenant (portalId optional filter)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a single tenant option
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a tenant option (key REQUIRED as query param; portalId optional)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options?key=<key>&portalId=<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Key": "<key>", "Value": "<value>" }'

# Update a tenant option (full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Key": "<key>", "Value": "<value>" }'

# Delete a tenant option
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## User Options (admin; the user is the path segment)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Options/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (key REQUIRED as query param; portalId optional)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Options?key=<key>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Key": "<key>", "Value": "<value>" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Key": "<key>", "Value": "<value>" }'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contact Options (admin; the contact is the path segment)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Contacts/<contact-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Contacts/<contact-guid>/Options/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Contacts/<contact-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (key REQUIRED as query param; portalId optional)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Contacts/<contact-guid>/Options?key=<key>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Key": "<key>", "Value": "<value>" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Contacts/<contact-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Key": "<key>", "Value": "<value>" }'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/Contacts/<contact-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Licensing

Licensing reads and Redeem are **tenant-scoped**: `tenantId` is **required** (query or `X-TenantId`) and
the caller must be an authenticated member of that tenant. Validate is **anonymous** and takes no
`tenantId`.

```bash
# List the tenant's licenses (tenantId REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a license by ID (tenantId REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/<license-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# License sub-resources (tenantId REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/<license-guid>/Assignments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/<license-guid>/Attributes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/<license-guid>/Features?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/<license-guid>/Quota?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Validate a license (anonymous, NO tenantId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/Validate" \
  -H "Content-Type: application/json" \
  -d '{ "LicenseKey": "<license-key>" }'

# Redeem a license (tenantId REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Licensing/Licenses/Redeem?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "LicenseKey": "<license-key>" }'
```

`LicenseValidationRequest` required field: `licenseKey`.

## System Portals

System portals are root-tenant records: read and patch only (there are no create, full-replace or delete
endpoints with a handler). Use PATCH for changes; see the PATCH section below.

```bash
# List / count
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Portals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Portals/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Portals/<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`WebPortalUpdateDto` fields (the PATCH target): `root`, `title`, `domain`, `disabled`, `description`,
`websiteThemeId`, `businessDomainId`, `businessPortalApplicationId`.

## Business Domains

```bash
# List / count
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/BusinessDomains" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/BusinessDomains/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/BusinessDomains/<business-domain-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Verify a business domain (action)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/BusinessDomains/<business-domain-guid>/Verify" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/BusinessDomains/<business-domain-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## IP Lookups

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/IPLookups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/IPLookups/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/IPLookups/<ip-lookup-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SystemService/IPLookups/<ip-lookup-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Carts

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

## Modules

```bash
# All modules on this suite server instance (tenantId REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/StudioService/Modules?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Modules available to a tenant user (tenantId OPTIONAL)
curl -X GET "$ABSUITE_HOST_URL/api/v2/StudioService/Modules/Data?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

> Note: the `Modules` operations are published in the SystemService OpenAPI group but routed under the
> `/api/v2/StudioService/` base (`ModulesController` in `ABS.Studio.Hub`), so they are addressed with
> `StudioService`, not `SystemService`.

## System Emails (basic, instance-level)

Authorized against the root tenant: the caller needs the `email_send` permission there. Preview returns
raw HTML, not the envelope.

```bash
# Preview a rendered basic email template
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "Title": "<subject>",
        "Message": "<body>",
        "Culture": "en-US",
        "UiCulture": "en-US",
        "Recipients": ["<recipient-email>"]
      }'

# Send a basic transactional email
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Emails/SendBasic" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "Title": "<subject>",
        "Message": "<body>",
        "Culture": "en-US",
        "UiCulture": "en-US",
        "Recipients": ["<recipient-email>"],
        "AlertType": "Info",
        "ButtonText": "<cta-label>",
        "ButtonLink": "<cta-url>"
      }'
```

Email body required fields: `title`, `message`, `culture`, `uiCulture`, `recipients`. Optional:
`buttonLink`, `buttonText`, `alertMessage`, `alertType` (`None|Info|Error|Warning|Success|Action|Alert`),
`contactIds`, `tenantIds`, `userIds`, `templateUrl`, `emailTemplateId`, and (system Emails only)
`payload`. `message` must be at least 10 characters; `culture`/`uiCulture` use `en` or `en-US` form.

## Migrations

Root-tenant `business_owner` only.

```bash
# List migrations (pending=true to list only pending)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Migrations?pending=true" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Apply pending migrations (destructive: use with caution in production)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Migrations/Migrate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Antiforgery

Anonymous (no bearer required) and not wrapped in the envelope: the response is the raw antiforgery
token set.

```bash
# Get and store antiforgery tokens
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Antiforgery/GetAndStoreTokens"

# Validate the antiforgery request
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Antiforgery/IsRequestValid"
```

---

## PATCH (JSON Patch, RFC 6902)

PATCH bodies are a JSON **array** of operations: `op` ∈ `add|remove|replace|move|copy|test`; `path`/`from`
are JSON Pointers (leading `/`, camelCase field). Use PATCH for atomic partial updates: change a couple of
fields without resending the whole object.

In SystemService, **seven** resources support PATCH:

| Resource | Path |
|---|---|
| Tenant (cross-tenant admin) | `PATCH /SystemService/Tenants/{tenantId}` |
| User (cross-tenant admin) | `PATCH /SystemService/Users/{userId}` |
| System option | `PATCH /SystemService/Options/{optionId}` |
| Tenant option | `PATCH /SystemService/Tenants/{tenantId}/Options/{optionId}` |
| User option | `PATCH /SystemService/Users/{userId}/Options/{optionId}` |
| Contact option | `PATCH /SystemService/Contacts/{contactId}/Options/{optionId}` |
| System portal | `PATCH /SystemService/Portals/{portalId}` |

Example: flip a system option's value and lock it (no tenantId; option scope addressed by ID/portal):

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SystemService/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
        { "op": "replace", "path": "/value", "value": "true" },
        { "op": "replace", "path": "/frozen", "value": true }
      ]'
```

Example: rename a tenant and update its support phone (cross-tenant admin, NO tenantId):

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
        { "op": "replace", "path": "/name", "value": "<new-name>" },
        { "op": "replace", "path": "/supportPhoneNumber", "value": "<phone>" }
      ]'
```

Example: disable a system portal:

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SystemService/Portals/<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/disabled", "value": true } ]'
```

---

## End-to-end workflow: provision a tenant and its config options

```bash
# 1. Create a tenant (cross-tenant admin, no tenantId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Name": "<tenant-name>", "Email": "<tenant-email>", "CurrencyId": "<currency-id>", "CountryId": "<country-id>" }'
# -> capture result.id as <tenant-guid>

# 2. Pick the system portal to configure (portals are read/patch only)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SystemService/Portals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# -> capture the chosen portal's id as <portal-guid>

# 3. Upsert a system option scoped to that portal
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SystemService/Options/Upsert/app.maintenance-mode?portalId=<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Key": "app.maintenance-mode", "Value": "false" }'

# 4. Add a tenant-scoped option
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options?key=onboarding.completed" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Key": "onboarding.completed", "Value": "false" }'
# -> capture result.id as <option-guid>

# 5. Atomically flip the tenant option once onboarding finishes (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/value", "value": "true" } ]'

# 6. Send the tenant a welcome email (needs email_send in that tenant)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "Welcome", "Message": "Your workspace is ready.", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<tenant-email>"], "AlertType": "Success" }'
```

---

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| **Overview** | | |
| System overview | GET | `/api/v2/SystemService/Overview` |
| **Tenants (cross-tenant admin, no tenantId)** | | |
| List tenants | GET | `/api/v2/SystemService/Tenants` |
| Count tenants | GET | `/api/v2/SystemService/Tenants/Count` |
| List extended tenants | GET | `/api/v2/SystemService/Tenants/Extended` |
| Count extended tenants | GET | `/api/v2/SystemService/Tenants/Extended/Count` |
| Get tenant | GET | `/api/v2/SystemService/Tenants/{tenantId}` |
| Create tenant | POST | `/api/v2/SystemService/Tenants` |
| Update tenant | PUT | `/api/v2/SystemService/Tenants/{tenantId}` |
| Patch tenant | PATCH | `/api/v2/SystemService/Tenants/{tenantId}` |
| Delete tenant | DELETE | `/api/v2/SystemService/Tenants/{tenantId}` |
| Preview tenant email | POST | `/api/v2/SystemService/Tenants/{tenantId}/Emails/Preview` |
| Send tenant email | POST | `/api/v2/SystemService/Tenants/{tenantId}/Emails/Send` |
| **Users (cross-tenant admin, no tenantId)** | | |
| List users | GET | `/api/v2/SystemService/Users` |
| Count users | GET | `/api/v2/SystemService/Users/Count` |
| List extended users | GET | `/api/v2/SystemService/Users/Extended` |
| Count extended users | GET | `/api/v2/SystemService/Users/Extended/Count` |
| Get user | GET | `/api/v2/SystemService/Users/{userId}` |
| Get extended user | GET | `/api/v2/SystemService/Users/{userId}/Extended` |
| Create user | POST | `/api/v2/SystemService/Users` |
| Update user | PUT | `/api/v2/SystemService/Users/{userId}` |
| Patch user | PATCH | `/api/v2/SystemService/Users/{userId}` |
| Delete user | DELETE | `/api/v2/SystemService/Users/{userId}` |
| Preview user email | POST | `/api/v2/SystemService/Users/{userId}/Emails/Preview` |
| Send user email | POST | `/api/v2/SystemService/Users/{userId}/Emails/Send` |
| **System Options (portalId-scoped)** | | |
| List options | GET | `/api/v2/SystemService/Options` (portalId req) |
| Count options | GET | `/api/v2/SystemService/Options/Count` (portalId req) |
| Get option by ID | GET | `/api/v2/SystemService/Options/{optionId}` |
| Get option by key | GET | `/api/v2/SystemService/Options/Key/{key}` (portalId req) |
| Create option | POST | `/api/v2/SystemService/Options` (key req) |
| Update option | PUT | `/api/v2/SystemService/Options/{optionId}` |
| Patch option | PATCH | `/api/v2/SystemService/Options/{optionId}` |
| Upsert option by key | PUT | `/api/v2/SystemService/Options/Upsert/{key}` |
| Delete option | DELETE | `/api/v2/SystemService/Options/{optionId}` |
| **Tenant Options (tenant in path)** | | |
| List tenant options | GET | `/api/v2/SystemService/Tenants/{tenantId}/Options` |
| Count tenant options | GET | `/api/v2/SystemService/Tenants/{tenantId}/Options/Count` |
| Get tenant option | GET | `/api/v2/SystemService/Tenants/{tenantId}/Options/{optionId}` |
| Create tenant option | POST | `/api/v2/SystemService/Tenants/{tenantId}/Options` (key req) |
| Update tenant option | PUT | `/api/v2/SystemService/Tenants/{tenantId}/Options/{optionId}` |
| Patch tenant option | PATCH | `/api/v2/SystemService/Tenants/{tenantId}/Options/{optionId}` |
| Delete tenant option | DELETE | `/api/v2/SystemService/Tenants/{tenantId}/Options/{optionId}` |
| **User Options (user in path)** | | |
| List user options | GET | `/api/v2/SystemService/Users/{userId}/Options` |
| Count user options | GET | `/api/v2/SystemService/Users/{userId}/Options/Count` |
| Get user option | GET | `/api/v2/SystemService/Users/{userId}/Options/{optionId}` |
| Create user option | POST | `/api/v2/SystemService/Users/{userId}/Options` (key req) |
| Update user option | PUT | `/api/v2/SystemService/Users/{userId}/Options/{optionId}` |
| Patch user option | PATCH | `/api/v2/SystemService/Users/{userId}/Options/{optionId}` |
| Delete user option | DELETE | `/api/v2/SystemService/Users/{userId}/Options/{optionId}` |
| **Contact Options (contact in path)** | | |
| List contact options | GET | `/api/v2/SystemService/Contacts/{contactId}/Options` |
| Count contact options | GET | `/api/v2/SystemService/Contacts/{contactId}/Options/Count` |
| Get contact option | GET | `/api/v2/SystemService/Contacts/{contactId}/Options/{optionId}` |
| Create contact option | POST | `/api/v2/SystemService/Contacts/{contactId}/Options` (key req) |
| Update contact option | PUT | `/api/v2/SystemService/Contacts/{contactId}/Options/{optionId}` |
| Patch contact option | PATCH | `/api/v2/SystemService/Contacts/{contactId}/Options/{optionId}` |
| Delete contact option | DELETE | `/api/v2/SystemService/Contacts/{contactId}/Options/{optionId}` |
| **Licensing** | | |
| List licenses | GET | `/api/v2/SystemService/Licensing/Licenses` (tenantId req) |
| Get license | GET | `/api/v2/SystemService/Licensing/Licenses/{licenseId}` (tenantId req) |
| License assignments | GET | `/api/v2/SystemService/Licensing/Licenses/{licenseId}/Assignments` (tenantId req) |
| License attributes | GET | `/api/v2/SystemService/Licensing/Licenses/{licenseId}/Attributes` (tenantId req) |
| License features | GET | `/api/v2/SystemService/Licensing/Licenses/{licenseId}/Features` (tenantId req) |
| License quota | GET | `/api/v2/SystemService/Licensing/Licenses/{licenseId}/Quota` (tenantId req) |
| Validate license | POST | `/api/v2/SystemService/Licensing/Licenses/Validate` (anonymous) |
| Redeem license | POST | `/api/v2/SystemService/Licensing/Licenses/Redeem` (tenantId req) |
| **System Portals** | | |
| List portals | GET | `/api/v2/SystemService/Portals` |
| Count portals | GET | `/api/v2/SystemService/Portals/Count` |
| Get portal | GET | `/api/v2/SystemService/Portals/{portalId}` |
| Patch portal | PATCH | `/api/v2/SystemService/Portals/{portalId}` |
| **Business Domains** | | |
| List business domains | GET | `/api/v2/SystemService/BusinessDomains` |
| Count business domains | GET | `/api/v2/SystemService/BusinessDomains/Count` |
| Get business domain | GET | `/api/v2/SystemService/BusinessDomains/{businessDomainId}` |
| Verify business domain | POST | `/api/v2/SystemService/BusinessDomains/{businessDomainId}/Verify` |
| Delete business domain | DELETE | `/api/v2/SystemService/BusinessDomains/{businessDomainId}` |
| **IP Lookups** | | |
| List IP lookups | GET | `/api/v2/SystemService/IPLookups` |
| Count IP lookups | GET | `/api/v2/SystemService/IPLookups/Count` |
| Get IP lookup | GET | `/api/v2/SystemService/IPLookups/{ipLookupId}` |
| Delete IP lookup | DELETE | `/api/v2/SystemService/IPLookups/{ipLookupId}` |
| **Carts** | | |
| List carts | GET | `/api/v2/SystemService/Carts` |
| Count carts | GET | `/api/v2/SystemService/Carts/Count` |
| Get cart | GET | `/api/v2/SystemService/Carts/{cartId}` |
| Delete cart | DELETE | `/api/v2/SystemService/Carts/{cartId}` |
| **Modules** | | |
| List all modules | GET | `/api/v2/StudioService/Modules` (tenantId req) |
| List available modules | GET | `/api/v2/StudioService/Modules/Data` (tenantId opt) |
| **Emails (instance-level)** | | |
| Preview basic email | POST | `/api/v2/SystemService/Emails/Preview` |
| Send basic email | POST | `/api/v2/SystemService/Emails/SendBasic` |
| **Migrations** | | |
| List migrations | GET | `/api/v2/SystemService/Migrations` |
| Apply migrations | POST | `/api/v2/SystemService/Migrations/Migrate` |
| **Antiforgery (anonymous)** | | |
| Get & store tokens | GET | `/api/v2/SystemService/Antiforgery/GetAndStoreTokens` |
| Validate request | GET | `/api/v2/SystemService/Antiforgery/IsRequestValid` |

## Critical Rules

- **Instance-administrator access required** for most system operations: the `business_owner` role in
  the root tenant. Emails need `email_send`; licensing needs tenant membership; license validation and
  antiforgery are anonymous.
- **Cross-tenant admin endpoints (`/Tenants`, `/Users` and their `/Emails`) take NO `tenantId`**: they act
  across the whole suite instance. Do not append `?tenantId=` or send `X-TenantId`.
- **Options scope by route, not by `tenantId` query**: tenant/user/contact is the path segment; system
  options scope by `portalId`.
- **Tenant/user/option deletion is destructive.** **Migrations/Migrate** mutates the database; use it
  with caution in production.
- **Versioning is additive**: `api-version` / `x-api-version` are optional; omit unless you need a pinned
  revision.
