---
name: absuite-locations
description: >
  Manage business locations and addresses in the Alliance Business Suite (ABS) via the
  REST API. Covers tenant-scoped Locations and wallet-scoped Locations, including atomic
  PATCH (JSON Patch) updates. Location reads/writes are tenant-scoped and require a bearer
  token; wallet-location endpoints are scoped by walletId. See the absuite-login skill to
  authenticate.
---

# Alliance Business Suite — Locations Skill (REST)

Drive the ABS **LocationsService** directly over HTTP with `curl`. A *location* is a
physical/business address record (title, street lines, unit, city/state/country IDs,
postal code, geocoordinates) plus shipping/routing flags (sender, return, shipping
default, label generation). Locations live in two scopes:

- **Tenant Locations** — owned by a business tenant; every call is **tenant-scoped** (`?tenantId=`).
- **Wallet Locations** — addresses attached to a specific wallet / billing profile; every
  call is scoped by the `walletId` path segment and takes **no tenant parameter**.

For the CLI equivalent, see `absuite-locations-cli`. For general REST conventions, see `absuite-rest`.

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

4. **Response envelope** — every response is wrapped:
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

## Tenant scoping (read carefully — it differs per scope)

- **Tenant Location endpoints** (`/Locations`, `/Locations/count`, `/Locations/{locationId}`)
  REQUIRE a tenant. Pass `?tenantId=<tenant-guid>` on **every** verb — GET, POST, PUT,
  PATCH, DELETE. Omitting it on a write returns 400. The header `X-TenantId: <tenant-guid>`
  is the equivalent of the query param; prefer the query param in examples.
- **Wallet Location endpoints** (`/Locations/wallet/{walletId}/...`) take **no** tenant
  parameter — they are scoped entirely by the `walletId` path segment. Do **not** add
  `?tenantId=` or an `X-TenantId` header; it is ignored.

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
  verbatim from the spec) — use it exactly.

---

## Tenant Locations

### List locations
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```
Supports OData query options (e.g. `&\$filter=...`, `&\$top=...`, `&\$orderby=...`) for
server-side filtering/paging/sorting — this is how you "search" locations.

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

### Update a location (PUT — full replace)
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

### Patch a location (PATCH — atomic partial update)
See the **PATCH (JSON Patch)** section below.

### Delete a location
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/<location-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Wallet Locations

Addresses attached to a specific wallet / billing profile. Scoped by `walletId` in the
path — **no `tenantId` parameter**.

### List wallet locations
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count wallet locations
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a wallet location by ID
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/<location-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a wallet location
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>" \
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
(Same `LocationCreateDto` body as tenant create — `id`/`timestamp` are also accepted.)

### Update a wallet location (PUT — full replace)
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/<location-guid>" \
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

### Patch a wallet location (PATCH — atomic partial update)
See the **PATCH (JSON Patch)** section below.

### Delete a wallet location
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/<location-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## PATCH (JSON Patch, RFC 6902)

PATCH applies an **atomic partial update** — send only the fields you want to change instead
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
Wallet PATCH is scoped by `walletId` — **no `tenantId`**:
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
# 1. Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Distribution Center",
    "address1": "1 Logistics Way",
    "cityId": "<city-id>",
    "stateId": "<state-id>",
    "countryId": "<country-id>",
    "postalCode": "60601",
    "isRoutable": true
  }'
# → read result.id from the response as <location-guid>

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

| Action | Method | Path |
|---|---|---|
| List locations | `GET` | `/api/v2/LocationsService/Locations?tenantId=<tenant-guid>` |
| Count locations | `GET` | `/api/v2/LocationsService/Locations/count?tenantId=<tenant-guid>` |
| Get location | `GET` | `/api/v2/LocationsService/Locations/{locationId}?tenantId=<tenant-guid>` |
| Create location | `POST` | `/api/v2/LocationsService/Locations?tenantId=<tenant-guid>` |
| Update location (PUT) | `PUT` | `/api/v2/LocationsService/Locations/{locationId}?tenantId=<tenant-guid>` |
| Patch location | `PATCH` | `/api/v2/LocationsService/Locations/{locationId}?tenantId=<tenant-guid>` |
| Delete location | `DELETE` | `/api/v2/LocationsService/Locations/{locationId}?tenantId=<tenant-guid>` |
| List wallet locations | `GET` | `/api/v2/LocationsService/Locations/wallet/{walletId}` |
| Count wallet locations | `GET` | `/api/v2/LocationsService/Locations/wallet/{walletId}/count` |
| Get wallet location | `GET` | `/api/v2/LocationsService/Locations/wallet/{walletId}/{locationId}` |
| Create wallet location | `POST` | `/api/v2/LocationsService/Locations/wallet/{walletId}` |
| Update wallet location (PUT) | `PUT` | `/api/v2/LocationsService/Locations/wallet/{walletId}/{locationId}` |
| Patch wallet location | `PATCH` | `/api/v2/LocationsService/Locations/wallet/{walletId}/{locationId}` |
| Delete wallet location | `DELETE` | `/api/v2/LocationsService/Locations/wallet/{walletId}/{locationId}` |

## Critical Rules

- **Authenticate first** and send `Authorization: Bearer ...` on every call.
- **Tenant Location endpoints require `?tenantId=` on every verb** (GET/POST/PUT/PATCH/DELETE).
- **Wallet Location endpoints take NO tenant parameter** — they are scoped by `walletId`.
- **PATCH bodies are JSON arrays** of RFC 6902 operations with `Content-Type: application/json`.
- Use the Globe service to resolve valid `countryId`, `stateId`, and `cityId` values.
