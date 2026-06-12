---
name: absuite-locations-cli
description: >
  Manage business locations and addresses using the `absuite` CLI. Covers tenant-scoped
  Locations and wallet-scoped Locations via list/count/get/create/update/delete commands.
  Requires an authenticated CLI session (see absuite-login-cli). For atomic PATCH updates
  or raw HTTP, use the absuite-locations (REST) skill.
---

# Alliance Business Suite — Locations Skill (CLI)

Drive the ABS **LocationsService** through the `absuite` CLI. The CLI service token is
**`locations`**. A *location* is a physical/business address record (title, street lines,
unit, city/state/country IDs, postal code, geocoordinates) plus shipping/routing flags.
Locations live in two scopes:

- **Tenant Locations** — owned by a business tenant; commands are **tenant-scoped** (`--TenantId`).
- **Wallet Locations** — addresses attached to a specific wallet / billing profile; scoped
  by `--WalletId` and take **no** tenant parameter.

For general CLI usage and authentication, see `absuite-cli` and `absuite-login-cli`. For
atomic PATCH (JSON Patch) or raw HTTP, use the `absuite-locations` REST skill — **the CLI
does not support PATCH**.

## Prerequisites

1. **Authenticate first:** `absuite login` (see `absuite-login-cli`).
2. **Set a default tenant** (optional but recommended for tenant-scoped commands):
   `absuite config set --tenant-id <tenant-guid>`. When set, the CLI auto-injects `TenantId`
   on any command that needs it; otherwise pass `--TenantId <tenant-guid>` explicitly.
   (Wallet-location commands ignore tenant entirely — they use `--WalletId`.)
3. **Discover commands:** `absuite locations list-commands`, or `--help` on any command,
   e.g. `absuite locations create --help` (prints parameters and the DTO field schema).

## Command structure

```
absuite locations <verb> [<entity>] --Param value [--Param value ...]
```

- Verbs available for this service: **list, count, get, create, update, delete**.
- The canonical SDK function-name form also works, e.g.
  `absuite locations Get-LocationsAsync --TenantId <tenant-guid>`.
- JSON DTO parameters are passed as a single-quoted JSON string
  (`--LocationCreateDto '{...}'`) using the **same field names** as the REST API
  (`title`, `address1`, `cityId`, `isDefaultSenderAddress`, ...).
- There is **no `search` verb** for locations. To filter/page/sort, the REST `list`
  endpoint accepts OData query options — use the `absuite-locations` REST skill for that.

## Tenant Locations

```bash
# List locations
absuite locations list --TenantId <tenant-guid>

# Count locations
absuite locations count --TenantId <tenant-guid>

# Get a location by ID
absuite locations get --TenantId <tenant-guid> --LocationId <location-guid>

# Create a location
absuite locations create --TenantId <tenant-guid> --LocationCreateDto '{
  "title": "Main Warehouse",
  "email": "warehouse@example.com",
  "phone": "+1-555-0100",
  "address1": "123 Commerce Ave",
  "address2": "Building B",
  "unit": "Dock 4",
  "cityId": "<city-id>",
  "stateId": "<state-id>",
  "postalCode": "10001",
  "countryId": "<country-id>",
  "longitude": -74.006,
  "latitude": 40.7128,
  "isRoutable": true,
  "isCountryPrimary": true,
  "canGenerateLabels": true,
  "isDefaultSenderAddress": true,
  "isDefaultSuppingLocation": true
}'

# Update a location (full replace)
absuite locations update --TenantId <tenant-guid> --LocationId <location-guid> --LocationUpdateDto '{
  "title": "Main Warehouse (East)",
  "address1": "123 Commerce Ave",
  "cityId": "<city-id>",
  "stateId": "<state-id>",
  "countryId": "<country-id>",
  "postalCode": "10001",
  "isRoutable": true,
  "isDefaultSenderAddress": true
}'

# Delete a location
absuite locations delete --TenantId <tenant-guid> --LocationId <location-guid>
```

### Location DTO fields

The create/update DTO (`LocationCreateDto` / `LocationUpdateDto`) accepts:
`title`, `email`, `phone`, `fax`, `address1`, `address2`, `address3`, `unit`, `cityId`,
`stateId`, `postalCode`, `countryId`, `longitude` (number), `latitude` (number),
`isRoutable`, `isGlobalPrimary`, `isCountryPrimary`, `canGenerateLabels`,
`isDefaultSenderAddress`, `isDefaultReturnAddress`, `isDefaultSuppingLocation` (booleans).
The **create** DTO additionally accepts `id` and `timestamp` (omit to let the server assign).
`isDefaultSuppingLocation` is the field name as published by the API — use it exactly.
`countryId` / `stateId` / `cityId` are Globe reference IDs (use `absuite globe ...` to resolve them).

## Wallet Locations

Addresses attached to a specific wallet / billing profile. Scoped by `--WalletId` —
**do not pass `--TenantId`**.

```bash
# List wallet locations
absuite locations list wallet --WalletId <wallet-guid>

# Count wallet locations
absuite locations count wallet --WalletId <wallet-guid>

# Get a wallet location by ID
absuite locations get wallet --WalletId <wallet-guid> --LocationId <location-guid>

# Create a wallet location (same LocationCreateDto body as tenant create)
absuite locations create wallet --WalletId <wallet-guid> --LocationCreateDto '{
  "title": "Billing Address",
  "email": "billing@example.com",
  "address1": "500 Finance St",
  "unit": "Suite 1200",
  "cityId": "<city-id>",
  "stateId": "<state-id>",
  "postalCode": "94105",
  "countryId": "<country-id>"
}'

# Update a wallet location (full replace)
absuite locations update wallet --WalletId <wallet-guid> --LocationId <location-guid> --LocationUpdateDto '{
  "title": "Billing Address (Updated)",
  "address1": "500 Finance St",
  "unit": "Suite 1400",
  "cityId": "<city-id>",
  "stateId": "<state-id>",
  "countryId": "<country-id>",
  "postalCode": "94105"
}'

# Delete a wallet location
absuite locations delete wallet --WalletId <wallet-guid> --LocationId <location-guid>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List locations | `absuite locations list --TenantId <tenant-guid>` |
| Count locations | `absuite locations count --TenantId <tenant-guid>` |
| Get location | `absuite locations get --TenantId <tenant-guid> --LocationId <location-guid>` |
| Create location | `absuite locations create --TenantId <tenant-guid> --LocationCreateDto '{...}'` |
| Update location | `absuite locations update --TenantId <tenant-guid> --LocationId <location-guid> --LocationUpdateDto '{...}'` |
| Delete location | `absuite locations delete --TenantId <tenant-guid> --LocationId <location-guid>` |
| List wallet locations | `absuite locations list wallet --WalletId <wallet-guid>` |
| Count wallet locations | `absuite locations count wallet --WalletId <wallet-guid>` |
| Get wallet location | `absuite locations get wallet --WalletId <wallet-guid> --LocationId <location-guid>` |
| Create wallet location | `absuite locations create wallet --WalletId <wallet-guid> --LocationCreateDto '{...}'` |
| Update wallet location | `absuite locations update wallet --WalletId <wallet-guid> --LocationId <location-guid> --LocationUpdateDto '{...}'` |
| Delete wallet location | `absuite locations delete wallet --WalletId <wallet-guid> --LocationId <location-guid>` |

## Critical Rules

- **Authenticate first** (`absuite login`).
- **Tenant-location commands need a tenant** — set a default with
  `absuite config set --tenant-id <guid>` or pass `--TenantId <guid>` on each call.
- **Wallet-location commands use `--WalletId`** and ignore tenant context — do not pass `--TenantId`.
- **No PATCH in the CLI.** For atomic partial updates, use the `absuite-locations` REST skill.
- Use `absuite globe ...` to resolve valid `countryId`, `stateId`, and `cityId` values.
