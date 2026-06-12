---
name: absuite-tenants
description: >
  Manage tenant configuration in the Alliance Business Suite (ABS) via the REST API.
  The largest service — covers tenant CRUD, departments, enrollments (standard, extended,
  and employee), industries, invitations, options, positions, segments, sizes, teams,
  team records, team contact/project enrollments, territories, types, units, unit groups,
  licenses, notifications, web portals, avatars, carts, wallets, and social profiles —
  including atomic PATCH (JSON Patch) updates. Most operations are tenant-scoped and
  require a bearer token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Tenants Skill (REST)

Manage tenant configuration and all of its sub-resources through the ABS `TenantsService`
REST API. This is the most comprehensive service in the platform. Almost every sub-resource
is tenant-scoped via a required `?tenantId=` query parameter; a handful of tenant-level
reads take the tenant in the **path** instead, and the invitation accept/decline flow and
the `Tenants/Root` read are NOT tenant-scoped at all (read the scoping rules below carefully
— they differ per endpoint).

> For the CLI equivalent of these operations, see `absuite-tenants-cli`.
> For general REST conventions (envelope, paging, errors), see `absuite-rest`.
> To create a brand-new tenant from scratch and initialize its portal, see `absuite-onboarding`.

## Authentication

1. **Obtain a bearer token:**

```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'"$ABSUITE_USER_EMAIL"'", "password": "'"$ABSUITE_USER_PASSWORD"'"}'
```

Extract `accessToken` from the JSON response.

2. **Send the token on every request:**

```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/TenantsService/<Resource>`.

4. **Response envelope** — every response is wrapped:

```json
{ "isSuccess": true, "errorMessage": null, "correlationId": "…", "timestamp": "…", "result": <data|array|int|null> }
```

Always check `isSuccess`; read the payload from `result`.

## Tenant Scoping (read this first)

Tenant scoping is **per-endpoint**. The platform binds the tenant from the `?tenantId=`
query parameter **or** the `X-TenantId` request header interchangeably. The three patterns
used in this service:

- **`?tenantId=<tenant-guid>` query — REQUIRED.** Used by every flat sub-resource collection
  (`Departments`, `Enrollments`, `EmployeeEnrollments`, `Industries`, `Invitations`,
  `Options`, `Positions`, `Segments`, `Sizes`, `Teams`, `TeamRecords`,
  `TeamContactEnrollments`, `TeamProjectEnrollments`, `Territories`, `Types`, `Units`,
  `UnitGroups`) and by `DELETE /Tenants` and `GET /Tenants/Current`. Pass it on **every**
  verb (GET/POST/PUT/PATCH/DELETE). Equivalent header: `X-TenantId: <tenant-guid>`.
- **`{tenantId}` in the PATH.** Used by the tenant-detail reads/writes under
  `/Tenants/{tenantId}/…` (Avatar, Cart, Enrollments, Invitations, Licenses, Notifications,
  Select, SocialProfile, Users, Wallet, WebPortals, Extended) and by
  `GET/PUT/PATCH /Tenants/{tenantId}`. Do NOT also add a `?tenantId=` query here.
- **No tenant param at all.** `POST /Tenants` (create — no tenant yet),
  `GET /Tenants/Root` (platform-derived), `POST /Tenants/Deselect` (user-scoped), and the
  invitation `…/Accept` and `…/Decline` actions (scoped by the `{invitationId}` path param,
  acted on by the current user). Do NOT add a tenant param/header to these.

> Note: `GET /Tenants/Current` **does** require `?tenantId=` (the controller binds it as
> `[BindTenantId, BindRequired]`); it returns that tenant's profile as the user's current
> default. Only `GET /Tenants/Root` takes no tenant at all.

Every endpoint also accepts the optional API-version params `?api-version=` (query) or
`x-api-version:` (header). They are omitted from the examples below for brevity.

## Key Concepts

- **Tenant** — the multi-tenant business aggregate. Required create fields: `name`, `email`,
  `currencyId`, `countryId`. Carries profile, social, locale, and taxonomy references
  (`businessTypeId`, `businessSegmentId`, `businessIndustryId`, `businessSizeId`).
- **Enrollment** — how a *user* joins a tenant. `TenantEnrollmentCreateDto` carries `userId`;
  `TenantEnrollmentUpdateDto` toggles `isAdmin` / `isDisabled`. "Extended" variants return the
  enrollment plus related data. Tenant-scoped enrollment detail also exposes features,
  licenses, and permissions.
- **EmployeeEnrollment** — links an employee profile to a business team
  (`businessTeamId` + `employeeProfileId`, both required).
- **Invitation** — invite a user to a tenant by `userEmail` (the only required create field).
  Lifecycle: send → accept / decline; revoke = delete. Status filters: pending / redeemed /
  revoked.
- **Option** — a tenant-level key/value config entry (`key` + `value` required), optionally
  scoped to a `portalId`, with flags `frozen` / `autoload` / `transient` and an `expiration`.
  Upsert by key for idempotent writes.
- **Taxonomy** — `Industries`, `Segments`, `Sizes`, `Types` classify the tenant.
  `Segments` use `minEmployees`/`maxEmployees`; `Sizes` use
  `employeeLowRangeValue`/`employeeHighRangeValue`.
- **Org structure** — `Departments`, `Positions`, `Teams`, `Territories`, `Units`,
  `UnitGroups`. Several support a `parent…Id` for hierarchy.
- **Unit / UnitGroup** — units of measure. Units live inside a unit group
  (`/UnitGroups/{unitGroupId}/Units`) and reference a `baseUnitId` + `baseUnitAmount`. There is
  also a flat top-level `Units` collection.

## Tenant CRUD

```bash
# Create a tenant (NO tenant scoping — there is no tenant yet)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Venture",
    "legalName": "New Venture Inc.",
    "email": "info@example.com",
    "phone": "+1-555-0100",
    "webUrl": "https://example.com",
    "handler": "new-venture",
    "about": "A new business venture",
    "slogan": "Innovation first",
    "currencyId": "<currency-guid>",
    "countryId": "<country-id>",
    "languageId": "<language-id>",
    "timezoneId": "<timezone-id>",
    "businessTypeId": "<type-guid>",
    "businessSegmentId": "<segment-guid>",
    "businessIndustryId": "<industry-guid>",
    "businessSizeId": "<size-guid>"
  }'

# Get a tenant by ID (tenant in the PATH)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get the EXTENDED tenant profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update a tenant (PUT — full replace; tenant in the PATH)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Business",
    "legalName": "My Business LLC",
    "email": "admin@example.com",
    "currencyId": "<currency-guid>",
    "countryId": "<country-id>",
    "linkedInUrl": "https://www.linkedin.com/company/example",
    "supportPhoneNumber": "+1-555-0199"
  }'

# Delete a tenant (NOTE: no path id — uses the ?tenantId= QUERY param)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**`TenantCreateDto`** fields: `id`, `timestamp`, `name` (REQ), `legalName`, `email` (REQ),
`phone`, `webUrl`, `handler`, `about`, `slogan`, `currencyId` (REQ), `duns`, `taxId`,
`avatarUrl`, `countryId` (REQ), `stateId`, `cityId`, `languageId`, `timezoneId`,
`businessTypeId`, `businessSegmentId`, `businessIndustryId`, `businessSizeId`.

**`TenantUpdateDto`** fields: `name` (REQ), `legalName`, `email` (REQ), `phone`, `webUrl`,
`about`, `slogan`, `handler`, `currencyId` (REQ), `duns`, `taxId`, `avatarUrl`,
`twitterUsername`, `facebookUrl`, `twitterUrl`, `gitHubUrl`, `linkedInUrl`, `instagramUrl`,
`youTubeUrl`, `whatsAppNumber`, `supportPhoneNumber`, `countryId` (REQ), `timezoneId`,
`languageId`, `stateId`, `cityId`.

### Patch a tenant (JSON Patch — tenant in the PATH)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/slogan", "value": "Better, faster, together" },
    { "op": "replace", "path": "/supportPhoneNumber", "value": "+1-555-0142" }
  ]'
```

## Current / Root / Select / Deselect

```bash
# Current default tenant (REQUIRES ?tenantId= — returns that tenant's profile)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/Current?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Root tenant of the platform (NO tenant param)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/Root" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Select a tenant as the user's default (tenant in the PATH)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Select" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Deselect the user's default tenant (NO tenant param)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/Deselect" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Tenant-Level Resources (tenant in the PATH)

```bash
# Avatar (get)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Avatar" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Avatar (update — multipart upload)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Avatar" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@avatar.png"

# Default cart
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Cart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Billing profile / wallet account
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Wallet" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Social profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/SocialProfile" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Users enrolled in the tenant
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Users" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Web portals
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/WebPortals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Licenses available to the tenant (list only)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Licenses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Notifications (list + count only)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Notifications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Notifications/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Enrollments

Two collection styles exist: the **flat** `/Enrollments` collection (scoped by `?tenantId=`)
and the **tenant-path** `/Tenants/{tenantId}/Enrollments` reads that expose features,
licenses, and permissions.

### Flat enrollments (`?tenantId=` required)

```bash
# List / Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Extended list / count
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/Extended/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID (NOTE: this endpoint ALSO requires ?userId=)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/<enrollment-guid>?tenantId=<tenant-guid>&userId=<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (body carries userId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "<user-guid>"}'

# Update (toggle admin / disabled)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isAdmin": true, "isDisabled": false}'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/isAdmin", "value": true }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Enrollments/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`TenantEnrollmentCreateDto`: `id`, `timestamp`, `userId`.
`TenantEnrollmentUpdateDto`: `isAdmin`, `isDisabled`.

### Tenant-path enrollment reads (tenant in the PATH)

```bash
# List / get / extended-get for a tenant's enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Enrollments/<enrollment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Enrollments/<enrollment-guid>/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Features accessible to an enrollment
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Enrollments/<enrollment-guid>/Features" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Validate access to a specific feature (optional ?feature=)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Enrollments/<enrollment-guid>/HasAccess?feature=<feature-key>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Permissions list
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Enrollments/<enrollment-guid>/Permissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Validate roles/permissions (optional ?roles=&permissions=)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Enrollments/<enrollment-guid>/Permissions/Validate?roles=<role>&permissions=<permission>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Enrollment licenses (tenant in the PATH)

```bash
# List licenses available to an enrollment
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Enrollments/<enrollment-guid>/Licenses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a specific enrollment license
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Enrollments/<enrollment-guid>/Licenses/<license-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assign a license to an enrollment
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Enrollments/<enrollment-guid>/Licenses/<license-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Revoke a license from an enrollment
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Enrollments/<enrollment-guid>/Licenses/<license-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Employee Enrollments (`?tenantId=` required)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/<ee-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (businessTeamId + employeeProfileId both required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessTeamId": "<team-guid>", "employeeProfileId": "<employee-profile-guid>"}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/<ee-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessTeamId": "<team-guid>", "employeeProfileId": "<employee-profile-guid>"}'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/<ee-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/businessTeamId", "value": "<new-team-guid>" }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/EmployeeEnrollments/<ee-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`TenantTeamEmployeeEnrollmentCreateDto`: `id`, `timestamp`, `businessTeamId` (REQ),
`employeeProfileId` (REQ). Update DTO: `businessTeamId`, `employeeProfileId`.

## Invitations

The flat `/Invitations` collection is scoped by `?tenantId=`. **Accept and Decline are NOT
tenant-scoped** — they are scoped by the `{invitationId}` path param and act on behalf of the
invited (current) user. The tenant-path invitation reads (issued / pending / redeemed /
revoked) take the tenant in the path.

```bash
# List / Count issued invitations (?tenantId=)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Send an invitation (only userEmail is required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "newmember@example.com"}'

# Get an invitation by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/<invitation-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Delete (revoke) an invitation
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/<invitation-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Accept / Decline an invitation (NO tenant scoping)

```bash
# Accept — scoped by the invitationId path param only
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/<invitation-guid>/Accept" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Decline — scoped by the invitationId path param only
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/<invitation-guid>/Decline" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Invitation status filters (tenant in the PATH)

```bash
# All invitations issued by a tenant
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Invitations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Pending
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Invitations/Pending" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Redeemed
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Invitations/Redeemed" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Revoked
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Invitations/Revoked" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`TenantInvitationCreateDto`: `id`, `timestamp`, `userEmail` (REQ).

## Options (key/value configuration, `?tenantId=` required)

```bash
# List / Count (optional ?portalId= to scope to a portal)
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Options?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/<option-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by key
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/Key/feature.new-ui-enabled?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (NOTE: the create endpoint ALSO requires ?key= in the query, matching the body)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Options?tenantId=<tenant-guid>&key=feature.new-ui-enabled" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "feature.new-ui-enabled", "value": "true", "autoload": true}'

# Update by ID
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/<option-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "feature.new-ui-enabled", "value": "false"}'

# Upsert by key (create-or-update; key is in the PATH)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/Upsert/feature.new-ui-enabled?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": "false"}'

# Patch by ID
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/<option-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/value", "value": "true" }]'

# Delete by ID
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/<option-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`OptionCreateDto`: `id`, `timestamp`, `key` (REQ), `value` (REQ), `portalId`, `frozen`,
`autoload`, `transient`, `expiration` (integer). `OptionUpdateDto` is the same minus
`id`/`timestamp`.

## Departments (`?tenantId=` required)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/<department-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Engineering", "description": "Software engineering department", "disabled": false}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/<department-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Platform Engineering", "description": "Platform team", "disabled": false, "parentDepartmentId": "<parent-guid>"}'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/<department-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/disabled", "value": true }]'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments/<department-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`TenantDepartmentCreateDto`: `id`, `timestamp`, `name`, `description`, `disabled`,
`organizationProfileId`, `parentDepartmentId`. Update DTO drops `id`/`timestamp`.

## Positions (`?tenantId=` required)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/<position-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Senior Engineer", "description": "Senior software engineering role", "type": "<position-type>"}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/<position-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Staff Engineer", "description": "Staff role", "type": "<position-type>"}'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/<position-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/title", "value": "Principal Engineer" }]'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Positions/<position-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`TenantPositionCreateDto`: `id`, `timestamp`, `title`, `description`, `type`. Update DTO:
`title`, `description`, `type`.

## Teams (`?tenantId=` required)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/<team-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Platform Team", "description": "Platform engineering team", "isPublic": false, "businessUnitId": "<unit-guid>"}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/<team-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Platform Team", "description": "Updated", "isPublic": true}'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/<team-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/isPublic", "value": true }]'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams/<team-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`TenantTeamCreateDto`: `id`, `timestamp`, `name`, `description`, `avatarUrl`, `isPublic`,
`businessUnitId`, `organizationProfileId`. Update DTO drops `id`/`timestamp`.

### Team records, contact enrollments, project enrollments

All three are flat collections scoped by `?tenantId=` with full
list/count/get/create/update/patch/delete (records and the two enrollment kinds) — note
contact/project enrollments expose **no count gap**: they each have a `/Count`.

```bash
# Team records
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessTeamId": "<team-guid>"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords/<record-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"businessTeamId": "<team-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords/<record-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '[{ "op": "replace", "path": "/businessTeamId", "value": "<team-guid>" }]'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamRecords/<record-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Team contact enrollments (businessTeamId + contactId both required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamContactEnrollments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessTeamId": "<team-guid>", "contactId": "<contact-guid>"}'

# Team project enrollments (businessTeamId + projectId both required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/TeamProjectEnrollments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessTeamId": "<team-guid>", "projectId": "<project-guid>"}'
```

`TenantTeamRecordCreateDto`: `id`, `timestamp`, `businessTeamId` (REQ); update DTO:
`businessTeamId`.
`TenantTeamContactEnrollmentCreateDto`: `id`, `timestamp`, `businessTeamId` (REQ),
`contactId` (REQ); update DTO: `businessTeamId`, `contactId`.
`TenantTeamProjectEnrollmentCreateDto`: `id`, `timestamp`, `businessTeamId` (REQ),
`projectId` (REQ); update DTO: `businessTeamId`, `projectId`.

> Each of `TeamRecords`, `TeamContactEnrollments`, `TeamProjectEnrollments` also has
> `GET …/Count` and `GET …/<id>` (get by ID), `PATCH …/<id>`, `PUT …/<id>`,
> `DELETE …/<id>` — same shape as the examples above.

## Territories (`?tenantId=` required)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/<territory-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "North America", "description": "North American sales territory", "parentTerritoryId": "<parent-guid>"}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/<territory-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"name": "EMEA", "description": "Europe/MEA"}'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/<territory-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '[{ "op": "replace", "path": "/name", "value": "APAC" }]'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/Territories/<territory-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`TenantTerritoryCreateDto`: `id`, `timestamp`, `name`, `description`, `parentTerritoryId`.
Update DTO drops `id`/`timestamp`.

## Taxonomy: Industries, Segments, Sizes, Types (`?tenantId=` required)

All four follow the same CRUD + Count + PATCH shape. Substitute the resource path
(`Industries`, `Segments`, `Sizes`, `Types`) and the matching id param
(`tenantIndustryId`, `tenantSegmentId`, `tenantSizeId`, `tenantTypeId`).

```bash
# Industries
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Software", "parentBusinessIndustryId": "<parent-guid>"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries/<industry-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"name": "SaaS"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/Industries/<industry-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '[{ "op": "replace", "path": "/name", "value": "FinTech" }]'

# Segments (employee-count band)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Segments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"minEmployees": 50, "maxEmployees": 250}'

# Sizes (employee range)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Sizes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"employeeLowRangeValue": 1, "employeeHighRangeValue": 50}'

# Types
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Types?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"name": "LLC", "description": "Limited liability company"}'
```

DTO fields:
- `TenantIndustryCreateDto`: `id`, `timestamp`, `name`, `parentBusinessIndustryId`
  (update: `name`, `parentBusinessIndustryId`).
- `TenantSegmentCreateDto`: `id`, `timestamp`, `minEmployees` (number), `maxEmployees`
  (number) (update: `minEmployees`, `maxEmployees`).
- `TenantSizeCreateDto`: `id`, `timestamp`, `employeeLowRangeValue` (integer),
  `employeeHighRangeValue` (integer) (update: same two).
- `TenantTypeCreateDto`: `id`, `timestamp`, `name`, `description`
  (update: `name`, `description`).

## Units & Unit Groups (`?tenantId=` required)

Two distinct resources: the flat `Units` collection, and `UnitGroups` (each with its own
nested `Units`).

```bash
# Flat tenant units
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Units?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/Units/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Units?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Kilogram", "description": "Mass unit", "disabled": false, "countryId": "<country-id>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/Units/<unit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '[{ "op": "replace", "path": "/disabled", "value": true }]'

# Unit groups
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mass", "description": "Units of mass"}'
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '[{ "op": "replace", "path": "/description", "value": "SI mass units" }]'

# Units WITHIN a unit group
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>/Units?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>/Units/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>/Units?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Gram", "baseUnitAmount": 0.001, "baseUnitId": "<base-unit-guid>"}'
curl -X GET "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>/Units/<unit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>/Units/<unit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"name": "Gram", "baseUnitAmount": 0.001, "baseUnitId": "<base-unit-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>/Units/<unit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '[{ "op": "replace", "path": "/baseUnitAmount", "value": 0.001 }]'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TenantsService/UnitGroups/<group-guid>/Units/<unit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

DTO fields:
- `TenantUnitCreateDto` (flat): `id`, `timestamp`, `name`, `description`, `disabled`,
  `countryId`, `organizationProfileId`, `parentBusinessUnitId` (update drops `id`/`timestamp`).
- `UnitGroupCreateDto`: `id`, `timestamp`, `name` (REQ), `description` (update:
  `name`, `description`).
- `UnitCreateDto` (in-group): `id`, `timestamp`, `name` (REQ), `baseUnitAmount` (number),
  `baseUnitId` (update: `name`, `baseUnitAmount`, `baseUnitId`).

## PATCH (JSON Patch, RFC 6902)

PATCH lets you change a couple of fields atomically without resending the whole object — safer
than PUT under concurrent edits. The body is a JSON **array** of operations; `op` ∈
`add | remove | replace | move | copy | test`; `path`/`from` are JSON-Pointers (leading `/`,
camelCase field names matching the create/update DTOs).

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/legalName", "value": "Example Holdings LLC" },
    { "op": "add", "path": "/linkedInUrl", "value": "https://www.linkedin.com/company/example" }
  ]'
```

**PATCH is supported on:** `Tenants/{tenantId}`, `Departments/{id}`,
`EmployeeEnrollments/{id}`, `Enrollments/{enrollmentId}`, `Industries/{id}`, `Options/{id}`,
`Positions/{id}`, `Segments/{id}`, `Sizes/{id}`, `TeamContactEnrollments/{id}`,
`TeamProjectEnrollments/{id}`, `TeamRecords/{id}`, `Teams/{id}`, `Territories/{id}`,
`Types/{id}`, `Units/{id}`, `UnitGroups/{unitGroupId}`, and
`UnitGroups/{unitGroupId}/Units/{unitId}`. All PATCH endpoints carry `?tenantId=` except
`Tenants/{tenantId}` (tenant in the path). There is no PATCH on the invitation accept/decline,
the tenant-path read endpoints, or `Tenants` create/delete.

## End-to-End Workflow: stand up a tenant's org structure

```bash
# 1. Create the tenant (no tenant scope yet; note the returned tenant id)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"name": "Acme Co", "email": "ops@example.com", "currencyId": "<currency-guid>", "countryId": "<country-id>"}'

# 2. Select it as the active tenant
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>/Select" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 3. Create a department
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Departments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"name": "Engineering"}'

# 4. Create a team
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Teams?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"name": "Platform Team", "isPublic": false}'

# 5. Invite a member
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"userEmail": "newmember@example.com"}'

# 6. The invited user accepts (scoped by invitationId only — NO tenant param)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/<invitation-guid>/Accept" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 7. Set a tenant option (idempotent upsert by key)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TenantsService/Options/Upsert/feature.new-ui-enabled?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"value": "true"}'

# 8. Patch the tenant slogan
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/TenantsService/Tenants/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/slogan", "value": "Built to scale" }]'
```

## API Endpoints Quick Reference

Scoping legend: **Q** = `?tenantId=` query (required), **P** = tenant in the path,
**none** = no tenant scoping.

| Action | Method | Path | Scope |
|---|---|---|---|
| Create tenant | POST | `/api/v2/TenantsService/Tenants` | none |
| Delete tenant | DELETE | `/api/v2/TenantsService/Tenants` | Q |
| Get tenant | GET | `/api/v2/TenantsService/Tenants/{tenantId}` | P |
| Update tenant | PUT | `/api/v2/TenantsService/Tenants/{tenantId}` | P |
| Patch tenant | PATCH | `/api/v2/TenantsService/Tenants/{tenantId}` | P |
| Get extended tenant | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Extended` | P |
| Get avatar | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Avatar` | P |
| Update avatar | POST | `/api/v2/TenantsService/Tenants/{tenantId}/Avatar` | P |
| Get cart | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Cart` | P |
| Get wallet | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Wallet` | P |
| Get social profile | GET | `/api/v2/TenantsService/Tenants/{tenantId}/SocialProfile` | P |
| Get users | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Users` | P |
| Get web portals | GET | `/api/v2/TenantsService/Tenants/{tenantId}/WebPortals` | P |
| Get tenant licenses | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Licenses` | P |
| List notifications | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Notifications` | P |
| Count notifications | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Notifications/Count` | P |
| List tenant enrollments | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Enrollments` | P |
| Get tenant enrollment | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Enrollments/{enrollmentId}` | P |
| Get extended enrollment | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Enrollments/{enrollmentId}/Extended` | P |
| Get enrollment features | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Enrollments/{enrollmentId}/Features` | P |
| Validate feature access | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Enrollments/{enrollmentId}/HasAccess` | P |
| List enrollment licenses | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Enrollments/{enrollmentId}/Licenses` | P |
| Get enrollment license | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Enrollments/{enrollmentId}/Licenses/{licenseId}` | P |
| Assign license | POST | `/api/v2/TenantsService/Tenants/{tenantId}/Enrollments/{enrollmentId}/Licenses/{licenseId}` | P |
| Revoke license | DELETE | `/api/v2/TenantsService/Tenants/{tenantId}/Enrollments/{enrollmentId}/Licenses/{licenseId}` | P |
| List enrollment permissions | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Enrollments/{enrollmentId}/Permissions` | P |
| Validate enrollment permissions | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Enrollments/{enrollmentId}/Permissions/Validate` | P |
| List tenant invitations | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Invitations` | P |
| List pending invitations | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Invitations/Pending` | P |
| List redeemed invitations | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Invitations/Redeemed` | P |
| List revoked invitations | GET | `/api/v2/TenantsService/Tenants/{tenantId}/Invitations/Revoked` | P |
| Select tenant | POST | `/api/v2/TenantsService/Tenants/{tenantId}/Select` | P |
| Get current tenant | GET | `/api/v2/TenantsService/Tenants/Current` | Q |
| Get root tenant | GET | `/api/v2/TenantsService/Tenants/Root` | none |
| Deselect tenant | POST | `/api/v2/TenantsService/Tenants/Deselect` | none |
| List departments | GET | `/api/v2/TenantsService/Departments` | Q |
| Count departments | GET | `/api/v2/TenantsService/Departments/Count` | Q |
| Create department | POST | `/api/v2/TenantsService/Departments` | Q |
| Get department | GET | `/api/v2/TenantsService/Departments/{tenantDepartmentId}` | Q |
| Update department | PUT | `/api/v2/TenantsService/Departments/{tenantDepartmentId}` | Q |
| Patch department | PATCH | `/api/v2/TenantsService/Departments/{tenantDepartmentId}` | Q |
| Delete department | DELETE | `/api/v2/TenantsService/Departments/{tenantDepartmentId}` | Q |
| List enrollments | GET | `/api/v2/TenantsService/Enrollments` | Q |
| Count enrollments | GET | `/api/v2/TenantsService/Enrollments/Count` | Q |
| List extended enrollments | GET | `/api/v2/TenantsService/Enrollments/Extended` | Q |
| Count extended enrollments | GET | `/api/v2/TenantsService/Enrollments/Extended/Count` | Q |
| Create enrollment | POST | `/api/v2/TenantsService/Enrollments` | Q |
| Get enrollment | GET | `/api/v2/TenantsService/Enrollments/{enrollmentId}` | Q (+`userId` req) |
| Update enrollment | PUT | `/api/v2/TenantsService/Enrollments/{enrollmentId}` | Q |
| Patch enrollment | PATCH | `/api/v2/TenantsService/Enrollments/{enrollmentId}` | Q |
| Delete enrollment | DELETE | `/api/v2/TenantsService/Enrollments/{enrollmentId}` | Q |
| List employee enrollments | GET | `/api/v2/TenantsService/EmployeeEnrollments` | Q |
| Count employee enrollments | GET | `/api/v2/TenantsService/EmployeeEnrollments/Count` | Q |
| Create employee enrollment | POST | `/api/v2/TenantsService/EmployeeEnrollments` | Q |
| Get employee enrollment | GET | `/api/v2/TenantsService/EmployeeEnrollments/{tenantEmployeeEnrollmentId}` | Q |
| Update employee enrollment | PUT | `/api/v2/TenantsService/EmployeeEnrollments/{tenantEmployeeEnrollmentId}` | Q |
| Patch employee enrollment | PATCH | `/api/v2/TenantsService/EmployeeEnrollments/{tenantEmployeeEnrollmentId}` | Q |
| Delete employee enrollment | DELETE | `/api/v2/TenantsService/EmployeeEnrollments/{tenantEmployeeEnrollmentId}` | Q |
| List invitations | GET | `/api/v2/TenantsService/Invitations` | Q |
| Count invitations | GET | `/api/v2/TenantsService/Invitations/Count` | Q |
| Send invitation | POST | `/api/v2/TenantsService/Invitations` | Q |
| Get invitation | GET | `/api/v2/TenantsService/Invitations/{invitationId}` | Q |
| Delete (revoke) invitation | DELETE | `/api/v2/TenantsService/Invitations/{invitationId}` | Q |
| Accept invitation | POST | `/api/v2/TenantsService/Invitations/{invitationId}/Accept` | none |
| Decline invitation | POST | `/api/v2/TenantsService/Invitations/{invitationId}/Decline` | none |
| List options | GET | `/api/v2/TenantsService/Options` | Q |
| Count options | GET | `/api/v2/TenantsService/Options/Count` | Q |
| Create option | POST | `/api/v2/TenantsService/Options` | Q (+`key` req) |
| Get option by ID | GET | `/api/v2/TenantsService/Options/{optionId}` | Q |
| Get option by key | GET | `/api/v2/TenantsService/Options/Key/{key}` | Q |
| Update option | PUT | `/api/v2/TenantsService/Options/{optionId}` | Q |
| Upsert option by key | PUT | `/api/v2/TenantsService/Options/Upsert/{key}` | Q |
| Patch option | PATCH | `/api/v2/TenantsService/Options/{optionId}` | Q |
| Delete option | DELETE | `/api/v2/TenantsService/Options/{optionId}` | Q |
| List positions | GET | `/api/v2/TenantsService/Positions` | Q |
| Count positions | GET | `/api/v2/TenantsService/Positions/Count` | Q |
| Create position | POST | `/api/v2/TenantsService/Positions` | Q |
| Get position | GET | `/api/v2/TenantsService/Positions/{tenantPositionId}` | Q |
| Update position | PUT | `/api/v2/TenantsService/Positions/{tenantPositionId}` | Q |
| Patch position | PATCH | `/api/v2/TenantsService/Positions/{tenantPositionId}` | Q |
| Delete position | DELETE | `/api/v2/TenantsService/Positions/{tenantPositionId}` | Q |
| List teams | GET | `/api/v2/TenantsService/Teams` | Q |
| Count teams | GET | `/api/v2/TenantsService/Teams/Count` | Q |
| Create team | POST | `/api/v2/TenantsService/Teams` | Q |
| Get team | GET | `/api/v2/TenantsService/Teams/{tenantTeamId}` | Q |
| Update team | PUT | `/api/v2/TenantsService/Teams/{tenantTeamId}` | Q |
| Patch team | PATCH | `/api/v2/TenantsService/Teams/{tenantTeamId}` | Q |
| Delete team | DELETE | `/api/v2/TenantsService/Teams/{tenantTeamId}` | Q |
| List team records | GET | `/api/v2/TenantsService/TeamRecords` | Q |
| Count team records | GET | `/api/v2/TenantsService/TeamRecords/Count` | Q |
| Create team record | POST | `/api/v2/TenantsService/TeamRecords` | Q |
| Get team record | GET | `/api/v2/TenantsService/TeamRecords/{tenantTeamRecordId}` | Q |
| Update team record | PUT | `/api/v2/TenantsService/TeamRecords/{tenantTeamRecordId}` | Q |
| Patch team record | PATCH | `/api/v2/TenantsService/TeamRecords/{tenantTeamRecordId}` | Q |
| Delete team record | DELETE | `/api/v2/TenantsService/TeamRecords/{tenantTeamRecordId}` | Q |
| List team contact enrollments | GET | `/api/v2/TenantsService/TeamContactEnrollments` | Q |
| Count team contact enrollments | GET | `/api/v2/TenantsService/TeamContactEnrollments/Count` | Q |
| Create team contact enrollment | POST | `/api/v2/TenantsService/TeamContactEnrollments` | Q |
| Get team contact enrollment | GET | `/api/v2/TenantsService/TeamContactEnrollments/{tenantTeamContactEnrollmentId}` | Q |
| Update team contact enrollment | PUT | `/api/v2/TenantsService/TeamContactEnrollments/{tenantTeamContactEnrollmentId}` | Q |
| Patch team contact enrollment | PATCH | `/api/v2/TenantsService/TeamContactEnrollments/{tenantTeamContactEnrollmentId}` | Q |
| Delete team contact enrollment | DELETE | `/api/v2/TenantsService/TeamContactEnrollments/{tenantTeamContactEnrollmentId}` | Q |
| List team project enrollments | GET | `/api/v2/TenantsService/TeamProjectEnrollments` | Q |
| Count team project enrollments | GET | `/api/v2/TenantsService/TeamProjectEnrollments/Count` | Q |
| Create team project enrollment | POST | `/api/v2/TenantsService/TeamProjectEnrollments` | Q |
| Get team project enrollment | GET | `/api/v2/TenantsService/TeamProjectEnrollments/{tenantTeamProjectEnrollmentId}` | Q |
| Update team project enrollment | PUT | `/api/v2/TenantsService/TeamProjectEnrollments/{tenantTeamProjectEnrollmentId}` | Q |
| Patch team project enrollment | PATCH | `/api/v2/TenantsService/TeamProjectEnrollments/{tenantTeamProjectEnrollmentId}` | Q |
| Delete team project enrollment | DELETE | `/api/v2/TenantsService/TeamProjectEnrollments/{tenantTeamProjectEnrollmentId}` | Q |
| List territories | GET | `/api/v2/TenantsService/Territories` | Q |
| Count territories | GET | `/api/v2/TenantsService/Territories/Count` | Q |
| Create territory | POST | `/api/v2/TenantsService/Territories` | Q |
| Get territory | GET | `/api/v2/TenantsService/Territories/{tenantTerritoryId}` | Q |
| Update territory | PUT | `/api/v2/TenantsService/Territories/{tenantTerritoryId}` | Q |
| Patch territory | PATCH | `/api/v2/TenantsService/Territories/{tenantTerritoryId}` | Q |
| Delete territory | DELETE | `/api/v2/TenantsService/Territories/{tenantTerritoryId}` | Q |
| List industries | GET | `/api/v2/TenantsService/Industries` | Q |
| Count industries | GET | `/api/v2/TenantsService/Industries/Count` | Q |
| Create industry | POST | `/api/v2/TenantsService/Industries` | Q |
| Get industry | GET | `/api/v2/TenantsService/Industries/{tenantIndustryId}` | Q |
| Update industry | PUT | `/api/v2/TenantsService/Industries/{tenantIndustryId}` | Q |
| Patch industry | PATCH | `/api/v2/TenantsService/Industries/{tenantIndustryId}` | Q |
| Delete industry | DELETE | `/api/v2/TenantsService/Industries/{tenantIndustryId}` | Q |
| List segments | GET | `/api/v2/TenantsService/Segments` | Q |
| Count segments | GET | `/api/v2/TenantsService/Segments/Count` | Q |
| Create segment | POST | `/api/v2/TenantsService/Segments` | Q |
| Get segment | GET | `/api/v2/TenantsService/Segments/{tenantSegmentId}` | Q |
| Update segment | PUT | `/api/v2/TenantsService/Segments/{tenantSegmentId}` | Q |
| Patch segment | PATCH | `/api/v2/TenantsService/Segments/{tenantSegmentId}` | Q |
| Delete segment | DELETE | `/api/v2/TenantsService/Segments/{tenantSegmentId}` | Q |
| List sizes | GET | `/api/v2/TenantsService/Sizes` | Q |
| Count sizes | GET | `/api/v2/TenantsService/Sizes/Count` | Q |
| Create size | POST | `/api/v2/TenantsService/Sizes` | Q |
| Get size | GET | `/api/v2/TenantsService/Sizes/{tenantSizeId}` | Q |
| Update size | PUT | `/api/v2/TenantsService/Sizes/{tenantSizeId}` | Q |
| Patch size | PATCH | `/api/v2/TenantsService/Sizes/{tenantSizeId}` | Q |
| Delete size | DELETE | `/api/v2/TenantsService/Sizes/{tenantSizeId}` | Q |
| List types | GET | `/api/v2/TenantsService/Types` | Q |
| Count types | GET | `/api/v2/TenantsService/Types/Count` | Q |
| Create type | POST | `/api/v2/TenantsService/Types` | Q |
| Get type | GET | `/api/v2/TenantsService/Types/{tenantTypeId}` | Q |
| Update type | PUT | `/api/v2/TenantsService/Types/{tenantTypeId}` | Q |
| Patch type | PATCH | `/api/v2/TenantsService/Types/{tenantTypeId}` | Q |
| Delete type | DELETE | `/api/v2/TenantsService/Types/{tenantTypeId}` | Q |
| List units | GET | `/api/v2/TenantsService/Units` | Q |
| Count units | GET | `/api/v2/TenantsService/Units/Count` | Q |
| Create unit | POST | `/api/v2/TenantsService/Units` | Q |
| Get unit | GET | `/api/v2/TenantsService/Units/{tenantUnitId}` | Q |
| Update unit | PUT | `/api/v2/TenantsService/Units/{tenantUnitId}` | Q |
| Patch unit | PATCH | `/api/v2/TenantsService/Units/{tenantUnitId}` | Q |
| Delete unit | DELETE | `/api/v2/TenantsService/Units/{tenantUnitId}` | Q |
| List unit groups | GET | `/api/v2/TenantsService/UnitGroups` | Q |
| Count unit groups | GET | `/api/v2/TenantsService/UnitGroups/Count` | Q |
| Create unit group | POST | `/api/v2/TenantsService/UnitGroups` | Q |
| Get unit group | GET | `/api/v2/TenantsService/UnitGroups/{unitGroupId}` | Q |
| Update unit group | PUT | `/api/v2/TenantsService/UnitGroups/{unitGroupId}` | Q |
| Patch unit group | PATCH | `/api/v2/TenantsService/UnitGroups/{unitGroupId}` | Q |
| Delete unit group | DELETE | `/api/v2/TenantsService/UnitGroups/{unitGroupId}` | Q |
| List units in group | GET | `/api/v2/TenantsService/UnitGroups/{unitGroupId}/Units` | Q |
| Count units in group | GET | `/api/v2/TenantsService/UnitGroups/{unitGroupId}/Units/Count` | Q |
| Create unit in group | POST | `/api/v2/TenantsService/UnitGroups/{unitGroupId}/Units` | Q |
| Get unit in group | GET | `/api/v2/TenantsService/UnitGroups/{unitGroupId}/Units/{unitId}` | Q |
| Update unit in group | PUT | `/api/v2/TenantsService/UnitGroups/{unitGroupId}/Units/{unitId}` | Q |
| Patch unit in group | PATCH | `/api/v2/TenantsService/UnitGroups/{unitGroupId}/Units/{unitId}` | Q |
| Delete unit in group | DELETE | `/api/v2/TenantsService/UnitGroups/{unitGroupId}/Units/{unitId}` | Q |

## Critical Rules

- **Authenticate first** — bearer token on every call (see `absuite-login`).
- **Scope per endpoint** — `?tenantId=` query for the flat sub-resource collections and
  `Tenants/Current`/`DELETE Tenants`; tenant in the **path** for `/Tenants/{tenantId}/…`;
  **no** tenant param for `POST /Tenants`, `Tenants/Root`, `Tenants/Deselect`, and the
  invitation `Accept`/`Decline`. Omitting `?tenantId=` on a write that requires it returns 400.
- **Required create fields** — Tenant: `name`, `email`, `currencyId`, `countryId`. Invitation:
  `userEmail`. Employee enrollment: `businessTeamId`, `employeeProfileId`. Team contact
  enrollment: `businessTeamId`, `contactId`. Team project enrollment: `businessTeamId`,
  `projectId`. Option: `key`, `value` (and `?key=` query on create). Unit group / in-group
  unit: `name`.
- **Enrollment get-by-ID** (`/Enrollments/{enrollmentId}`) additionally requires `?userId=`.
- **Use PATCH for partial atomic edits** — JSON-Patch array; PUT requires the full DTO
  (including its required fields) and replaces the resource.
- **Invitation lifecycle** — send (by `userEmail`) → accept / decline (by invitationId, no
  tenant scope); revoke = `DELETE /Invitations/{invitationId}`.
