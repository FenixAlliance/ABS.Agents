---
name: absuite-assets
description: >
  Manage fixed and moveable assets in the Alliance Business Suite (ABS) via the REST API.
  Covers assets, asset categories, asset types, depreciation records, repairs, value
  amendments, and asset transfers, including atomic PATCH (JSON Patch) updates. All
  operations are tenant-scoped and require a bearer token (see the absuite-login skill
  to authenticate).
---

# Alliance Business Suite — Assets (REST)

The AssetsService manages a tenant's fixed and stock assets and everything that happens to
them over their lifecycle: classification (categories and types), depreciation records,
repairs/maintenance, value amendments (revaluations/impairments), and transfers between
locations, contacts, and departments. Every call below is a raw `curl` against the REST
API. For the `absuite` CLI equivalent, see the `absuite-assets-cli` skill. For general
REST conventions across services, see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select` — page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource** — it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) causes silent data loss.
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902) — it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

## Authentication

1. **Obtain a bearer token:**

```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<user-email>", "password": "<user-password>"}'
```

Extract `accessToken` from the response.

2. **Send the token on every request:**

```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/AssetsService/<Resource>`

4. **Response envelope** — every response is wrapped:

```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "<correlation-id>",
  "timestamp": "<iso-8601>",
  "result": { }
}
```

Always check `isSuccess`; read the payload from `result`.

## Tenant scoping

**Every AssetsService endpoint requires a tenant.** The manifest marks `tenantId` as
`query, required` on all routes — including POST / PUT / PATCH / DELETE. Pass
`?tenantId=<tenant-guid>` on **every** verb (omitting it on writes returns `400`).
The header form `X-TenantId: <tenant-guid>` is equivalent; examples below use the query
param.

## Key Concepts

- **Asset** — the core aggregate. Classified by:
  - `assetClass` — one of `Fixed | Stock` (verbatim from the spec; there are no other values).
  - `assetOwner` — one of `Business | Organization | Contact | Supplier`.
  - Optional links: `assetCategoryId`, `assetTypeId`, `itemId` (catalog stock item),
    `currencyId`, `purchaseInvoiceId`, `purchaseReceiptId`, `assetLocationId`,
    `contactId`, `organizationDepartmentId`.
  - Depreciation flags: `calculateDepreciation`, `allowMonthlyDepreciation`,
    `openingDepreciation`. `isExistingAsset` marks an asset already in service at import.
- **Asset Category** — grouping (`name`, `description`). Exposed at **two** paths that
  back the same data: `/AssetCategories` (top-level) and `/Assets/Categories` (nested).
- **Asset Type** — `name` + `description` classification at `/AssetTypes`.
- **Depreciation Record** — a posted depreciation entry for one asset
  (`depreciationAmount`, `accumulatedDepreciation`, `bookValue`, `depreciationDate`,
  `year`, `month`, optional `assetDepreciationPolicyId`).
- **Repair** — maintenance event for one asset. `repairStatus` is one of
  `Scheduled | InProgress | Completed | Cancelled`. Carries scheduling/cost fields and an
  optional `assetMaintenanceTeamId`.
- **Value Amend** — a revaluation/impairment entry (`previousValue`, `newValue`, `reason`,
  `amendmentDate`, `currencyId`).
- **Asset Transfer** — moves an asset between locations / contacts / departments. Exposed
  at **two** paths: top-level `/AssetTransfers` and nested `/Assets/{assetId}/Transfers`.

> Dates are ISO-8601 strings. Monetary amounts are numbers; pair them with `currencyId`
> where the DTO provides one. `id` and `timestamp` are accepted on create DTOs but are
> normally server-assigned — omit them unless you are importing.

---

## Assets

### List assets

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count assets

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get an asset

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create an asset

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<asset-name>",
    "description": "<asset-description>",
    "assetClass": "Fixed",
    "assetOwner": "Business",
    "isExistingAsset": false,
    "calculateDepreciation": true,
    "allowMonthlyDepreciation": false,
    "openingDepreciation": 0,
    "purchaseDate": "<iso-8601>",
    "purchasePrice": 0,
    "currencyId": "<currency-guid>",
    "itemId": "<item-guid>",
    "assetTypeId": "<type-guid>",
    "assetCategoryId": "<category-guid>",
    "purchaseInvoiceId": "<invoice-guid>",
    "purchaseReceiptId": "<receipt-guid>",
    "assetLocationId": "<location-guid>",
    "contactId": "<contact-guid>",
    "organizationDepartmentId": "<department-guid>"
  }'
```

**`AssetCreateDto` fields** (from the spec): `id`, `timestamp`, `name`, `description`,
`assetClass` (`Fixed|Stock`), `assetOwner` (`Business|Organization|Contact|Supplier`),
`isExistingAsset` (bool), `calculateDepreciation` (bool), `allowMonthlyDepreciation`
(bool), `openingDepreciation` (number), `purchaseDate` (string), `purchasePrice`
(number), `currencyId`, `itemId`, `assetTypeId`, `assetCategoryId`, `purchaseInvoiceId`,
`purchaseReceiptId`, `assetLocationId`, `contactId`, `organizationDepartmentId`.

### Update an asset (PUT — full replace)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<asset-name>",
    "description": "<asset-description>",
    "assetClass": "Fixed",
    "assetOwner": "Business",
    "calculateDepreciation": true,
    "allowMonthlyDepreciation": false,
    "openingDepreciation": 0,
    "purchaseDate": "<iso-8601>",
    "purchasePrice": 0,
    "currencyId": "<currency-guid>",
    "itemId": "<item-guid>",
    "assetTypeId": "<type-guid>",
    "assetCategoryId": "<category-guid>",
    "purchaseInvoiceId": "<invoice-guid>",
    "purchaseReceiptId": "<receipt-guid>",
    "assetLocationId": "<location-guid>",
    "contactId": "<contact-guid>",
    "organizationDepartmentId": "<department-guid>"
  }'
```

**`AssetUpdateDto`** is the create DTO minus `id`, `timestamp`, and `isExistingAsset`.

### Patch an asset (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/description", "value": "<new-description>" },
    { "op": "replace", "path": "/assetLocationId", "value": "<location-guid>" }
  ]'
```

### Delete an asset

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Asset Categories

Asset categories are exposed at two equivalent paths. The top-level `/AssetCategories` is
the primary surface; `/Assets/Categories` backs the same data. Both support full CRUD +
count + PATCH.

### Primary path — `/AssetCategories`

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories/count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (AssetCategoryCreateDto: id, timestamp, name, description)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<category-name>", "description": "<category-description>" }'

# Update (PUT)  (AssetCategoryUpdateDto: name, description)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<category-name>", "description": "<category-description>" }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/name", "value": "<category-name>" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Alternate path — `/Assets/Categories` (same data, same DTOs)

```bash
curl -X GET    "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories?tenantId=<tenant-guid>"                  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET    "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories/count?tenantId=<tenant-guid>"            -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET    "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories/<category-guid>?tenantId=<tenant-guid>" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST   "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories?tenantId=<tenant-guid>"                  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" -d '{ "name": "<category-name>", "description": "<category-description>" }'
curl -X PUT    "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories/<category-guid>?tenantId=<tenant-guid>" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" -d '{ "name": "<category-name>", "description": "<category-description>" }'
curl -X PATCH  "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories/<category-guid>?tenantId=<tenant-guid>" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" -d '[ { "op": "replace", "path": "/description", "value": "<category-description>" } ]'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories/<category-guid>?tenantId=<tenant-guid>" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Asset Types

`AssetTypeCreateDto` = `id, timestamp, name, description`; `AssetTypeUpdateDto` = `name, description`.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes/count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<type-name>", "description": "<type-description>" }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<type-name>", "description": "<type-description>" }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/name", "value": "<type-name>" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Depreciation Records (per asset)

Nested under a specific asset at `/Assets/{assetId}/DepreciationRecords`.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count  (note: capitalized "Count" segment)
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords/<record-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (AssetDepreciationRecordCreateDto)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "<asset-guid>",
    "assetDepreciationPolicyId": "<policy-guid>",
    "depreciationAmount": 0,
    "accumulatedDepreciation": 0,
    "bookValue": 0,
    "depreciationDate": "<iso-8601>",
    "year": 0,
    "month": 0
  }'

# Update (PUT)  (AssetDepreciationRecordUpdateDto: depreciationAmount, accumulatedDepreciation, bookValue, depreciationDate, year, month)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords/<record-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "depreciationAmount": 0,
    "accumulatedDepreciation": 0,
    "bookValue": 0,
    "depreciationDate": "<iso-8601>",
    "year": 0,
    "month": 0
  }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords/<record-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/bookValue", "value": 0 } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords/<record-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Repairs (per asset)

Nested under a specific asset at `/Assets/{assetId}/Repairs`. `repairStatus` ∈
`Scheduled | InProgress | Completed | Cancelled`.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs/<repair-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (AssetRepairCreateDto)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "<asset-guid>",
    "repairStatus": "Scheduled",
    "scheduledDate": "<iso-8601>",
    "completionDate": "<iso-8601>",
    "reportedDate": "<iso-8601>",
    "estimatedCost": 0,
    "actualCost": 0,
    "problemDescription": "<problem-description>",
    "repairDescription": "<repair-description>",
    "notes": "<notes>",
    "assetMaintenanceTeamId": "<team-guid>"
  }'

# Update (PUT)  (AssetRepairUpdateDto: repairStatus, scheduledDate, completionDate, estimatedCost, actualCost, problemDescription, repairDescription, notes, assetMaintenanceTeamId)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs/<repair-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repairStatus": "InProgress",
    "scheduledDate": "<iso-8601>",
    "completionDate": "<iso-8601>",
    "estimatedCost": 0,
    "actualCost": 0,
    "problemDescription": "<problem-description>",
    "repairDescription": "<repair-description>",
    "notes": "<notes>",
    "assetMaintenanceTeamId": "<team-guid>"
  }'

# Patch (PATCH) — e.g. mark a repair completed
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs/<repair-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/repairStatus", "value": "Completed" },
    { "op": "replace", "path": "/completionDate", "value": "<iso-8601>" },
    { "op": "replace", "path": "/actualCost", "value": 0 }
  ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs/<repair-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Value Amendments (per asset)

Nested under a specific asset at `/Assets/{assetId}/ValueAmends`. Record a revaluation or
impairment.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends/<amend-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (AssetValueAmendCreateDto)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "<asset-guid>",
    "previousValue": 0,
    "newValue": 0,
    "reason": "<reason>",
    "amendmentDate": "<iso-8601>",
    "currencyId": "<currency-guid>"
  }'

# Update (PUT)  (AssetValueAmendUpdateDto: newValue, reason, amendmentDate)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends/<amend-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newValue": 0,
    "reason": "<reason>",
    "amendmentDate": "<iso-8601>"
  }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends/<amend-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/reason", "value": "<reason>" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends/<amend-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Asset Transfers

Transfers are exposed at two surfaces. The **top-level** `/AssetTransfers` lists/creates
across all assets; the **nested** `/Assets/{assetId}/Transfers` scopes to one asset. Both
use the same `AssetTransferCreateDto` / `AssetTransferUpdateDto`.

`AssetTransferCreateDto` fields: `id`, `timestamp`, `assetId`, `isRootTransfer` (bool),
`serialList`, `quantity`, `serial`, `previousAssetTransferId`, `sourceLocationId`,
`destinationLocationId`, `sourceContactId`, `destinationContactId`, `sourceDepartmentId`,
`destinationDepartmentId`.
`AssetTransferUpdateDto` fields: `serialList`, `quantity`, `serial`,
`destinationLocationId`, `destinationContactId`, `destinationDepartmentId`.

### Top-level — `/AssetTransfers`

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers/<transfer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "<asset-guid>",
    "isRootTransfer": false,
    "serialList": "<serial-list>",
    "quantity": "<quantity>",
    "serial": "<serial>",
    "previousAssetTransferId": "<transfer-guid>",
    "sourceLocationId": "<location-guid>",
    "destinationLocationId": "<location-guid>",
    "sourceContactId": "<contact-guid>",
    "destinationContactId": "<contact-guid>",
    "sourceDepartmentId": "<department-guid>",
    "destinationDepartmentId": "<department-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers/<transfer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serialList": "<serial-list>",
    "quantity": "<quantity>",
    "serial": "<serial>",
    "destinationLocationId": "<location-guid>",
    "destinationContactId": "<contact-guid>",
    "destinationDepartmentId": "<department-guid>"
  }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers/<transfer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/destinationLocationId", "value": "<location-guid>" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers/<transfer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Nested — `/Assets/{assetId}/Transfers`

```bash
curl -X GET    "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers?tenantId=<tenant-guid>"                  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET    "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers/Count?tenantId=<tenant-guid>"            -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET    "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers/<transfer-guid>?tenantId=<tenant-guid>" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST   "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers?tenantId=<tenant-guid>"                  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" -d '{ "assetId": "<asset-guid>", "isRootTransfer": false, "destinationLocationId": "<location-guid>" }'
curl -X PUT    "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers/<transfer-guid>?tenantId=<tenant-guid>" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" -d '{ "destinationLocationId": "<location-guid>" }'
curl -X PATCH  "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers/<transfer-guid>?tenantId=<tenant-guid>" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" -d '[ { "op": "replace", "path": "/destinationContactId", "value": "<contact-guid>" } ]'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers/<transfer-guid>?tenantId=<tenant-guid>" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## PATCH (JSON Patch, RFC 6902)

Every aggregate and sub-resource in this service supports PATCH for atomic partial
updates. The request body is a **JSON array** of operations; `Content-Type:
application/json`. `op` ∈ `add | remove | replace | move | copy | test`; `path` (and
`from` for `move`/`copy`) is a JSON Pointer (leading `/`, camelCase field name). Prefer
PATCH over PUT when changing a couple of fields under concurrent edits.

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/assetCategoryId", "value": "<category-guid>" },
    { "op": "replace", "path": "/calculateDepreciation", "value": true },
    { "op": "remove",  "path": "/contactId" }
  ]'
```

PATCH is available on: **Asset**, **AssetCategory** (both `/AssetCategories/{id}` and
`/Assets/Categories/{id}`), **AssetType**, **DepreciationRecord**, **Repair**,
**ValueAmend**, **Transfer** (both top-level `/AssetTransfers/{id}` and nested
`/Assets/{assetId}/Transfers/{id}`).

---

## End-to-end workflow

```bash
# 1) Create a category and a type
CAT=$(curl -s -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "<category-name>", "description": "<category-description>" }')

TYP=$(curl -s -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "<type-name>", "description": "<type-description>" }')

# 2) Create the asset (use the category/type ids from result.id above)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "name": "<asset-name>", "assetClass": "Fixed", "assetOwner": "Business",
    "calculateDepreciation": true, "purchaseDate": "<iso-8601>", "purchasePrice": 0,
    "currencyId": "<currency-guid>", "assetCategoryId": "<category-guid>",
    "assetTypeId": "<type-guid>"
  }'

# 3) Post a depreciation record for the asset
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "assetId": "<asset-guid>", "depreciationAmount": 0, "accumulatedDepreciation": 0, "bookValue": 0, "depreciationDate": "<iso-8601>", "year": 0, "month": 0 }'

# 4) Open a repair, then PATCH it to Completed
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "assetId": "<asset-guid>", "repairStatus": "Scheduled", "scheduledDate": "<iso-8601>", "estimatedCost": 0 }'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs/<repair-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/repairStatus", "value": "Completed" } ]'

# 5) Transfer the asset to a new department
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "assetId": "<asset-guid>", "destinationDepartmentId": "<department-guid>" }'
```

---

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| **Assets** | | |
| List assets | GET | `/api/v2/AssetsService/Assets` |
| Count assets | GET | `/api/v2/AssetsService/Assets/count` |
| Get asset | GET | `/api/v2/AssetsService/Assets/{assetId}` |
| Create asset | POST | `/api/v2/AssetsService/Assets` |
| Update asset | PUT | `/api/v2/AssetsService/Assets/{assetId}` |
| Patch asset | PATCH | `/api/v2/AssetsService/Assets/{assetId}` |
| Delete asset | DELETE | `/api/v2/AssetsService/Assets/{assetId}` |
| **Asset Categories (top-level)** | | |
| List categories | GET | `/api/v2/AssetsService/AssetCategories` |
| Count categories | GET | `/api/v2/AssetsService/AssetCategories/count` |
| Get category | GET | `/api/v2/AssetsService/AssetCategories/{categoryId}` |
| Create category | POST | `/api/v2/AssetsService/AssetCategories` |
| Update category | PUT | `/api/v2/AssetsService/AssetCategories/{categoryId}` |
| Patch category | PATCH | `/api/v2/AssetsService/AssetCategories/{categoryId}` |
| Delete category | DELETE | `/api/v2/AssetsService/AssetCategories/{categoryId}` |
| **Asset Categories (alternate path)** | | |
| List categories | GET | `/api/v2/AssetsService/Assets/Categories` |
| Count categories | GET | `/api/v2/AssetsService/Assets/Categories/count` |
| Get category | GET | `/api/v2/AssetsService/Assets/Categories/{categoryId}` |
| Create category | POST | `/api/v2/AssetsService/Assets/Categories` |
| Update category | PUT | `/api/v2/AssetsService/Assets/Categories/{categoryId}` |
| Patch category | PATCH | `/api/v2/AssetsService/Assets/Categories/{categoryId}` |
| Delete category | DELETE | `/api/v2/AssetsService/Assets/Categories/{categoryId}` |
| **Asset Types** | | |
| List types | GET | `/api/v2/AssetsService/AssetTypes` |
| Count types | GET | `/api/v2/AssetsService/AssetTypes/count` |
| Get type | GET | `/api/v2/AssetsService/AssetTypes/{typeId}` |
| Create type | POST | `/api/v2/AssetsService/AssetTypes` |
| Update type | PUT | `/api/v2/AssetsService/AssetTypes/{typeId}` |
| Patch type | PATCH | `/api/v2/AssetsService/AssetTypes/{typeId}` |
| Delete type | DELETE | `/api/v2/AssetsService/AssetTypes/{typeId}` |
| **Depreciation Records (per asset)** | | |
| List records | GET | `/api/v2/AssetsService/Assets/{assetId}/DepreciationRecords` |
| Count records | GET | `/api/v2/AssetsService/Assets/{assetId}/DepreciationRecords/Count` |
| Get record | GET | `/api/v2/AssetsService/Assets/{assetId}/DepreciationRecords/{recordId}` |
| Create record | POST | `/api/v2/AssetsService/Assets/{assetId}/DepreciationRecords` |
| Update record | PUT | `/api/v2/AssetsService/Assets/{assetId}/DepreciationRecords/{recordId}` |
| Patch record | PATCH | `/api/v2/AssetsService/Assets/{assetId}/DepreciationRecords/{recordId}` |
| Delete record | DELETE | `/api/v2/AssetsService/Assets/{assetId}/DepreciationRecords/{recordId}` |
| **Repairs (per asset)** | | |
| List repairs | GET | `/api/v2/AssetsService/Assets/{assetId}/Repairs` |
| Count repairs | GET | `/api/v2/AssetsService/Assets/{assetId}/Repairs/Count` |
| Get repair | GET | `/api/v2/AssetsService/Assets/{assetId}/Repairs/{repairId}` |
| Create repair | POST | `/api/v2/AssetsService/Assets/{assetId}/Repairs` |
| Update repair | PUT | `/api/v2/AssetsService/Assets/{assetId}/Repairs/{repairId}` |
| Patch repair | PATCH | `/api/v2/AssetsService/Assets/{assetId}/Repairs/{repairId}` |
| Delete repair | DELETE | `/api/v2/AssetsService/Assets/{assetId}/Repairs/{repairId}` |
| **Value Amends (per asset)** | | |
| List amends | GET | `/api/v2/AssetsService/Assets/{assetId}/ValueAmends` |
| Count amends | GET | `/api/v2/AssetsService/Assets/{assetId}/ValueAmends/Count` |
| Get amend | GET | `/api/v2/AssetsService/Assets/{assetId}/ValueAmends/{amendId}` |
| Create amend | POST | `/api/v2/AssetsService/Assets/{assetId}/ValueAmends` |
| Update amend | PUT | `/api/v2/AssetsService/Assets/{assetId}/ValueAmends/{amendId}` |
| Patch amend | PATCH | `/api/v2/AssetsService/Assets/{assetId}/ValueAmends/{amendId}` |
| Delete amend | DELETE | `/api/v2/AssetsService/Assets/{assetId}/ValueAmends/{amendId}` |
| **Asset Transfers (top-level)** | | |
| List transfers | GET | `/api/v2/AssetsService/AssetTransfers` |
| Count transfers | GET | `/api/v2/AssetsService/AssetTransfers/Count` |
| Get transfer | GET | `/api/v2/AssetsService/AssetTransfers/{transferId}` |
| Create transfer | POST | `/api/v2/AssetsService/AssetTransfers` |
| Update transfer | PUT | `/api/v2/AssetsService/AssetTransfers/{transferId}` |
| Patch transfer | PATCH | `/api/v2/AssetsService/AssetTransfers/{transferId}` |
| Delete transfer | DELETE | `/api/v2/AssetsService/AssetTransfers/{transferId}` |
| **Transfers (per asset)** | | |
| List transfers | GET | `/api/v2/AssetsService/Assets/{assetId}/Transfers` |
| Count transfers | GET | `/api/v2/AssetsService/Assets/{assetId}/Transfers/Count` |
| Get transfer | GET | `/api/v2/AssetsService/Assets/{assetId}/Transfers/{transferId}` |
| Create transfer | POST | `/api/v2/AssetsService/Assets/{assetId}/Transfers` |
| Update transfer | PUT | `/api/v2/AssetsService/Assets/{assetId}/Transfers/{transferId}` |
| Patch transfer | PATCH | `/api/v2/AssetsService/Assets/{assetId}/Transfers/{transferId}` |
| Delete transfer | DELETE | `/api/v2/AssetsService/Assets/{assetId}/Transfers/{transferId}` |

## Critical Rules

- **Authenticate first.** Obtain a bearer token via `POST /login` (see `absuite-login`).
- **`?tenantId=<tenant-guid>` is required on every verb** — including POST/PUT/PATCH/DELETE.
  Omitting it returns `400`. `X-TenantId: <tenant-guid>` is the header equivalent.
- **Always check `isSuccess`** and read data from `result` in the envelope.
- **Enums are fixed:** `assetClass` ∈ `Fixed|Stock`, `assetOwner` ∈
  `Business|Organization|Contact|Supplier`, `repairStatus` ∈
  `Scheduled|InProgress|Completed|Cancelled`. Anything else is rejected.
- **Create categories and types first**, then reference their ids from the asset.
- **There is no search endpoint** in this service — use list (optionally with count) and
  filter client-side.
- For the CLI equivalent (no PATCH, no curl), see `absuite-assets-cli`.
