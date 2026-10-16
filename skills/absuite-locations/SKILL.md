---
name: absuite-locations
key: fenixalliance.absuite.locations
version: 1.1.0
description: >
  Manage business locations and addresses in the Alliance Business Suite (ABS) via the
  REST API. Covers tenant-scoped Locations and wallet-scoped Locations, including atomic
  PATCH (JSON Patch) updates. Tenant Location calls require a tenantId and a Locations
  permission; wallet-location calls are gated on the caller owning the wallet and take an
  optional tenantId that selects the permission-checked business-wallet path. All calls
  require a bearer token; see the absuite-login skill to authenticate.
---

# Alliance Business Suite: Locations Skill (REST)

Drive the ABS **LocationsService** directly over HTTP with `curl`. A *location* is a
physical/business address record (title, street lines, unit, city/state/country IDs,
postal code, geocoordinates) plus shipping/routing flags (sender, return, shipping
default, label generation). Locations live in two scopes:

- **Tenant Locations**: owned by a business tenant; every call is **tenant-scoped** (`?tenantId=`,
  required) and checks a `Locations.*` permission.
- **Wallet Locations**: addresses attached to a specific wallet / billing profile. Every
  call is scoped by the `walletId` path segment and first requires the caller to **own that
  wallet**. `tenantId` is **optional**: send it to reach a business or contact wallet of that
  tenant (permission-checked); omit it to reach only your own personal wallet.

For the CLI equivalent, see `absuite-locations-cli`. For general REST conventions, see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select`; page through results, don't fetch-all-and-filter. Each dedicated `.../count` endpoint returns an integer and is **also** filterable (`?$filter=...` gives a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource**: it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) causes silent data loss.
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902): it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

## Authentication

1. **Obtain a bearer token:**
```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<user-email>", "password": "<user-password>"}'
```
Read `accessToken` from the JSON response and export it as `$ABSUITE_ACCESS_TOKEN`.

2. **Send the token on every request:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/LocationsService/...`

4. **Response envelope**: every response is wrapped:
```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "<guid>",
  "timestamp": "<iso-8601>",
  "result": { }
}
```
Always check `isSuccess`; read the payload from `result`.

## Tenant scoping (read carefully: it differs per scope)

- **Tenant Location endpoints** (`/Locations`, `/Locations/count`, `/Locations/{locationId}`)
  REQUIRE a tenant. Pass `?tenantId=<tenant-guid>` on **every** verb (GET, POST, PUT,
  PATCH, DELETE); omitting it returns 400. The header `X-TenantId: <tenant-guid>` is the
  equivalent of the query param; prefer the query param in examples. Permissions:
  `Locations.Read` (list, count, get), `Locations.Create`, `Locations.Update` (PUT and
  PATCH), `Locations.Delete`. A location owned by another tenant returns NotFound.
- **Wallet Location endpoints** (`/Locations/wallet/{walletId}/...`) take an **optional**
  tenant (`?tenantId=` or `X-TenantId`). It decides which wallets you can reach:
  - **With `tenantId`** (tenant path): the same `Locations.*` permission as the tenant
    endpoints is checked (`Locations.Read` for list, count and get; `Locations.Create`;
    `Locations.Update` for PUT and PATCH; `Locations.Delete`). Only a wallet that tenant
    owns matches: a business wallet of the tenant, or a contact wallet whose contact
    belongs to the tenant.
  - **Without `tenantId`** (user path): no `Locations.*` permission is checked, and only
    **your own personal wallet** matches. Business and contact wallets are unreachable here,
    even when your token acts in that tenant; send the `tenantId` and hold the permission.
  - A wallet you don't own returns **NotFound**, exactly like a missing one, on **every**
    verb including list and count (never an empty list or `0`). A location that is not in
    the wallet also returns NotFound.
  - Create on the tenant path stamps the new location with that tenant; on the user path
    it is owned by you only, with no tenant.

## Key Concepts

- **Location record fields** (create/update body, JSON camelCase): `title`, `email`,
  `phone`, `fax`, `address1`, `address2`, `address3`, `unit`, `cityId`, `stateId`,
  `postalCode`, `countryId`, `longitude` (number), `latitude` (number), plus boolean flags
  `isRoutable`, `isGlobalPrimary`, `isCountryPrimary`, `canGenerateLabels`,
  `isDefaultSenderAddress`, `isDefaultReturnAddress`, `isDefaultSuppingLocation`.
  The **create** body additionally accepts `id` and `timestamp`; the **update** body does not.
- **Geo / political IDs.** `countryId`, `stateId`, and `cityId` are reference IDs from the
  Globe service (use the globe lookups to resolve valid values), not free text.
- **Read shape (`LocationDto`).** Reads return the above fields plus `id`, `timestamp`,
  `business`, `tenantId`, and `enrollmentId`.
- **Shipping flags.** `isDefaultSenderAddress`, `isDefaultReturnAddress`, and
  `isDefaultSuppingLocation` mark which location is used by default as the ship-from, return,
  and shipping origin; `canGenerateLabels` and `isRoutable` gate carrier label/routing use.
- **Note:** `isDefaultSuppingLocation` is the field name as published by the API (transcribed
  verbatim from the DTO); use it exactly.

---

## Tenant Locations

### List locations
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```
Supports OData query options (e.g. `&\$filter=...`, `&\$top=...`, `&\$orderby=...`) for
server-side filtering/paging/sorting; this is how you "search" locations.

### Count locations
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a location by ID
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/<location-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a location
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Main Warehouse",
    "email": "warehouse@example.com",
    "phone": "+1-555-0100",
    "fax": "",
    "address1": "123 Commerce Ave",
    "address2": "Building B",
    "address3": "",
    "unit": "Dock 4",
    "cityId": "<city-id>",
    "stateId": "<state-id>",
    "postalCode": "10001",
    "countryId": "<country-id>",
    "longitude": -74.006,
    "latitude": 40.7128,
    "isRoutable": true,
    "isGlobalPrimary": false,
    "isCountryPrimary": true,
    "canGenerateLabels": true,
    "isDefaultSenderAddress": true,
    "isDefaultReturnAddress": false,
    "isDefaultSuppingLocation": true
  }'
```
(`id` and `timestamp` may also be supplied in the create body; omit them to let the server assign.)

### Update a location (PUT: full replace)
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/<location-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Main Warehouse (East)",
    "email": "warehouse@example.com",
    "phone": "+1-555-0100",
    "fax": "",
    "address1": "123 Commerce Ave",
    "address2": "Building B",
    "address3": "",
    "unit": "Dock 4",
    "cityId": "<city-id>",
    "stateId": "<state-id>",
    "postalCode": "10001",
    "countryId": "<country-id>",
    "longitude": -74.006,
    "latitude": 40.7128,
    "isRoutable": true,
    "isGlobalPrimary": false,
    "isCountryPrimary": true,
    "canGenerateLabels": true,
    "isDefaultSenderAddress": true,
    "isDefaultReturnAddress": false,
    "isDefaultSuppingLocation": true
  }'
```

### Patch a location (PATCH: atomic partial update)
See the **PATCH (JSON Patch)** section below.

### Delete a location
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/<location-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Wallet Locations

Addresses attached to a specific wallet / billing profile. Scoped by `walletId` in the
path and gated on wallet ownership (see **Tenant scoping** above). Append
`?tenantId=<tenant-guid>` for a business or contact wallet of that tenant; leave it off for
your own personal wallet. The examples below use the tenant form unless noted.

### List wallet locations
```bash
# Business wallet of a tenant (needs Locations.Read)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Your own personal wallet (no tenant)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count wallet locations
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a wallet location by ID
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/<location-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a wallet location
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Billing Address",
    "email": "billing@example.com",
    "phone": "+1-555-0199",
    "fax": "",
    "address1": "500 Finance St",
    "address2": "",
    "address3": "",
    "unit": "Suite 1200",
    "cityId": "<city-id>",
    "stateId": "<state-id>",
    "postalCode": "94105",
    "countryId": "<country-id>",
    "longitude": -122.3971,
    "latitude": 37.7937,
    "isRoutable": false,
    "isGlobalPrimary": false,
    "isCountryPrimary": false,
    "canGenerateLabels": false,
    "isDefaultSenderAddress": false,
    "isDefaultReturnAddress": false,
    "isDefaultSuppingLocation": false
  }'
```
(Same `LocationCreateDto` body as tenant create; `id`/`timestamp` are also accepted.)

### Update a wallet location (PUT: full replace)
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/<location-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Billing Address (Updated)",
    "email": "billing@example.com",
    "phone": "+1-555-0199",
    "fax": "",
    "address1": "500 Finance St",
    "address2": "",
    "address3": "",
    "unit": "Suite 1400",
    "cityId": "<city-id>",
    "stateId": "<state-id>",
    "postalCode": "94105",
    "countryId": "<country-id>",
    "longitude": -122.3971,
    "latitude": 37.7937,
    "isRoutable": false,
    "isGlobalPrimary": false,
    "isCountryPrimary": false,
    "canGenerateLabels": false,
    "isDefaultSenderAddress": false,
    "isDefaultReturnAddress": false,
    "isDefaultSuppingLocation": false
  }'
```

### Patch a wallet location (PATCH: atomic partial update)
See the **PATCH (JSON Patch)** section below.

### Delete a wallet location
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/<location-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## PATCH (JSON Patch, RFC 6902)

PATCH applies an **atomic partial update**: send only the fields you want to change instead
of resending the whole object (safer than PUT under concurrent edits). The request body is a
JSON **array** of operations with `Content-Type: application/json`. Each operation has an
`op` (`add` | `remove` | `replace` | `move` | `copy` | `test`), a `path` (JSON Pointer,
leading `/`, camelCase field), and a `value` (for add/replace/test) or `from` (for move/copy).

### Patch a tenant location
```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/<location-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/title", "value": "Renamed Warehouse" },
    { "op": "replace", "path": "/isDefaultSenderAddress", "value": false },
    { "op": "replace", "path": "/postalCode", "value": "10002" }
  ]'
```

### Patch a wallet location
Wallet PATCH follows the wallet rules: add `?tenantId=` (and hold `Locations.Update`) for a
tenant's wallet, or leave it off for your own personal wallet, as here:
```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/<location-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/unit", "value": "Suite 1500" },
    { "op": "replace", "path": "/phone", "value": "+1-555-0200" }
  ]'
```

PATCH is supported on both sub-resources: the tenant location
(`/Locations/{locationId}`) and the wallet location
(`/Locations/wallet/{walletId}/{locationId}`).

---

## End-to-end workflow

Create a tenant location, set its primary/sender flags atomically, then verify:

```bash
# 1. Create (send your own "id" so you know <location-guid> up front; the 201 response
#    also echoes it as locationId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "<location-guid>",
    "title": "Distribution Center",
    "address1": "1 Logistics Way",
    "cityId": "<city-id>",
    "stateId": "<state-id>",
    "countryId": "<country-id>",
    "postalCode": "60601",
    "isRoutable": true
  }'

# 2. Atomically mark it as the default sender + shipping origin
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/<location-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/isDefaultSenderAddress", "value": true },
    { "op": "replace", "path": "/isDefaultSuppingLocation", "value": true },
    { "op": "replace", "path": "/canGenerateLabels", "value": true }
  ]'

# 3. Verify
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/<location-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## API Endpoints Quick Reference

| Action | Method | Path | Permission |
|---|---|---|---|
| List locations | `GET` | `/api/v2/LocationsService/Locations?tenantId=<tenant-guid>` | `Locations.Read` |
| Count locations | `GET` | `/api/v2/LocationsService/Locations/count?tenantId=<tenant-guid>` | `Locations.Read` |
| Get location | `GET` | `/api/v2/LocationsService/Locations/{locationId}?tenantId=<tenant-guid>` | `Locations.Read` |
| Create location | `POST` | `/api/v2/LocationsService/Locations?tenantId=<tenant-guid>` | `Locations.Create` |
| Update location (PUT) | `PUT` | `/api/v2/LocationsService/Locations/{locationId}?tenantId=<tenant-guid>` | `Locations.Update` |
| Patch location | `PATCH` | `/api/v2/LocationsService/Locations/{locationId}?tenantId=<tenant-guid>` | `Locations.Update` |
| Delete location | `DELETE` | `/api/v2/LocationsService/Locations/{locationId}?tenantId=<tenant-guid>` | `Locations.Delete` |
| List wallet locations | `GET` | `/api/v2/LocationsService/Locations/wallet/{walletId}[?tenantId=]` | `Locations.Read` (with tenant) |
| Count wallet locations | `GET` | `/api/v2/LocationsService/Locations/wallet/{walletId}/count[?tenantId=]` | `Locations.Read` (with tenant) |
| Get wallet location | `GET` | `/api/v2/LocationsService/Locations/wallet/{walletId}/{locationId}[?tenantId=]` | `Locations.Read` (with tenant) |
| Create wallet location | `POST` | `/api/v2/LocationsService/Locations/wallet/{walletId}[?tenantId=]` | `Locations.Create` (with tenant) |
| Update wallet location (PUT) | `PUT` | `/api/v2/LocationsService/Locations/wallet/{walletId}/{locationId}[?tenantId=]` | `Locations.Update` (with tenant) |
| Patch wallet location | `PATCH` | `/api/v2/LocationsService/Locations/wallet/{walletId}/{locationId}[?tenantId=]` | `Locations.Update` (with tenant) |
| Delete wallet location | `DELETE` | `/api/v2/LocationsService/Locations/wallet/{walletId}/{locationId}[?tenantId=]` | `Locations.Delete` (with tenant) |

Wallet rows: with `tenantId` the permission is checked and only that tenant's wallets match;
without it no permission is checked and only your own personal wallet matches.

## Critical Rules

- **Authenticate first** and send `Authorization: Bearer ...` on every call.
- **Tenant Location endpoints require `?tenantId=` on every verb** (GET/POST/PUT/PATCH/DELETE).
- **Wallet Location endpoints require that you own the wallet.** Send `?tenantId=` (and hold
  `Locations.*`) for a business or contact wallet; omit it only for your own personal wallet.
  A wallet you can't reach is NotFound on every verb, including list and count.
- **PATCH bodies are JSON arrays** of RFC 6902 operations with `Content-Type: application/json`.
- Use the Globe service to resolve valid `countryId`, `stateId`, and `cityId` values.
