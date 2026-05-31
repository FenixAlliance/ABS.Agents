---
name: absuite-locations
description: >
  Manage physical and wallet locations in the Alliance Business Suite (ABS) using
  the `absuite` CLI. Covers location CRUD and wallet location management.
  Requires an authenticated CLI session.
---

# Alliance Business Suite — Locations Skill

Manage locations through the `absuite` CLI's `locations` service.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite locations list-commands`

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

## Locations

```bash
# List
absuite locations list --TenantId $TENANT_ID

# Count
absuite locations count --TenantId $TENANT_ID

# Get by ID
absuite locations get --TenantId $TENANT_ID --LocationId <location-guid>

# Create
absuite locations create --TenantId $TENANT_ID --LocationCreateDto '{
  "Name": "Main Office",
  "Description": "Headquarters",
  "AddressLine1": "123 Business Ave",
  "CountryId": "USA",
  "StateId": "<state-guid>",
  "CityId": "<city-guid>"
}'

# Update
absuite locations update --TenantId $TENANT_ID --LocationId <location-guid> --LocationUpdateDto '{...}'

# Delete
absuite locations delete --TenantId $TENANT_ID --LocationId <location-guid>
```

**REST API equivalents:**
```bash
# List locations
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count locations
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get location by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/<location-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create location
curl -X POST "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Main Office",
    "Description": "Headquarters",
    "AddressLine1": "123 Business Ave",
    "CountryId": "USA",
    "StateId": "<state-guid>",
    "CityId": "<city-guid>"
  }'

# Update location
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/<location-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete location
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/<location-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Wallet Locations

Locations specifically associated with wallets/billing profiles.

```bash
# List
absuite locations list wallet --TenantId $TENANT_ID

# Count
absuite locations count wallet --TenantId $TENANT_ID

# Get by ID
absuite locations get wallet --TenantId $TENANT_ID --WalletLocationId <wallet-location-guid>

# Create
absuite locations create wallet --TenantId $TENANT_ID --WalletLocationCreateDto '{...}'

# Update
absuite locations update wallet --TenantId $TENANT_ID --WalletLocationId <wallet-location-guid> --WalletLocationUpdateDto '{...}'

# Delete
absuite locations delete wallet --TenantId $TENANT_ID --WalletLocationId <wallet-location-guid>
```

**REST API equivalents:**
```bash
# List wallet locations
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count wallet locations
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get wallet location by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/<location-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create wallet location
curl -X POST "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update wallet location
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/<location-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete wallet location
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LocationsService/Locations/wallet/<wallet-guid>/<location-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List locations | `absuite locations list --TenantId <guid>` |
| Create location | `absuite locations create --TenantId <guid> --LocationCreateDto '{...}'` |
| List wallet locations | `absuite locations list wallet --TenantId <guid>` |
| Create wallet location | `absuite locations create wallet --TenantId <guid> --WalletLocationCreateDto '{...}'` |

## API Endpoints Quick Reference

| Action | Method | Endpoint |
|---|---|---|
| Create location | `POST` | `/api/v2/LocationsService/Locations` |
| List locations | `GET` | `/api/v2/LocationsService/Locations` |
| Count locations | `GET` | `/api/v2/LocationsService/Locations/count` |
| Get location by ID | `GET` | `/api/v2/LocationsService/Locations/:locationId` |
| Update location | `PUT` | `/api/v2/LocationsService/Locations/:locationId` |
| Delete location | `DELETE` | `/api/v2/LocationsService/Locations/:locationId` |
| Create wallet location | `POST` | `/api/v2/LocationsService/Locations/wallet/:walletId` |
| List wallet locations | `GET` | `/api/v2/LocationsService/Locations/wallet/:walletId` |
| Count wallet locations | `GET` | `/api/v2/LocationsService/Locations/wallet/:walletId/count` |
| Get wallet location | `GET` | `/api/v2/LocationsService/Locations/wallet/:walletId/:locationId` |
| Update wallet location | `PUT` | `/api/v2/LocationsService/Locations/wallet/:walletId/:locationId` |
| Delete wallet location | `DELETE` | `/api/v2/LocationsService/Locations/wallet/:walletId/:locationId` |

## Critical Rules

- **Authenticate first.** Always provide a tenant context.
- **Use `absuite globe`** to look up valid `CountryId`, `StateId`, and `CityId` values.
