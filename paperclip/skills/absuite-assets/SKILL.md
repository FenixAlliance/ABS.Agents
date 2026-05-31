---
name: absuite-assets
description: >
  Manage fixed and moveable assets in the Alliance Business Suite (ABS) using the
  `absuite` CLI. Covers asset CRUD, categories, types, depreciation records,
  repairs, value amendments, and asset transfers. Requires an authenticated CLI
  session (use the `absuite-login` skill to authenticate first).
---

# Alliance Business Suite — Assets Skill

Manage assets through the `absuite` CLI's `assets` service. All operations are tenant-scoped and require authentication.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite assets list-commands`

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

## Asset CRUD

### List Assets

```bash
absuite assets list --TenantId $TENANT_ID
```

### Count Assets

```bash
absuite assets count --TenantId $TENANT_ID
```

### Get Asset by ID

```bash
absuite assets get --TenantId $TENANT_ID --AssetId <asset-guid>
```

### Create Asset

```bash
absuite assets create --TenantId $TENANT_ID --AssetCreateDto '{
  "Name": "Office Laptop - Dell XPS 15",
  "Description": "Employee workstation",
  "AssetClass": "Equipment",
  "AssetOwner": "IT Department",
  "PurchaseDate": "2026-01-15T00:00:00Z",
  "PurchasePrice": 2500.00,
  "CurrencyId": "<currency-guid>",
  "AssetCategoryId": "<category-guid>",
  "CalculateDepreciation": true,
  "IsExistingAsset": false,
  "ContactId": "<assigned-contact-guid>",
  "OrganizationDepartmentId": "<dept-guid>"
}'
```

**Key AssetCreateDto fields:**

| Field | Type | Description |
|---|---|---|
| `Name` | String | Asset name |
| `Description` | String | Asset description |
| `AssetClass` | String | Classification (e.g., Equipment, Vehicle, Furniture) |
| `AssetOwner` | String | Owner description |
| `PurchaseDate` | DateTime | Purchase date |
| `PurchasePrice` | Double | Purchase price |
| `CurrencyId` | String | Currency |
| `AssetCategoryId` | String | Link to asset category |
| `ItemId` | String | Link to catalog stock item |
| `CalculateDepreciation` | Boolean | Enable depreciation |
| `AllowMonthlyDepreciation` | Boolean | Monthly depreciation |
| `OpeningDepreciation` | Double | Initial depreciation value |
| `AssetLocationId` | String | Physical location |
| `ContactId` | String | Responsible contact |
| `OrganizationDepartmentId` | String | Department |
| `PurchaseInvoiceId` | String | Linked purchase invoice |
| `PurchaseReceiptId` | String | Linked purchase receipt |

### Update Asset

```bash
absuite assets update --TenantId $TENANT_ID --AssetId <asset-guid> --AssetUpdateDto '{
  "Name": "Office Laptop - Dell XPS 15 (Upgraded)",
  "Description": "Upgraded RAM to 32GB"
}'
```

### Delete Asset

```bash
absuite assets delete --TenantId $TENANT_ID --AssetId <asset-guid>
```

**REST API equivalents:**
```bash
# List assets
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count assets
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get asset by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create asset
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Office Laptop","assetClass":"Equipment","purchasePrice":2500.00}'

# Update asset
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Office Laptop (Upgraded)"}'

# Delete asset
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Asset Categories

```bash
# List
absuite assets list categories --TenantId $TENANT_ID

# Count
absuite assets count categories --TenantId $TENANT_ID

# Get by ID
absuite assets get category --TenantId $TENANT_ID --AssetCategoryId <category-guid>

# Create
absuite assets create category --TenantId $TENANT_ID --AssetCategoryCreateDto '{
  "Name": "IT Equipment",
  "Description": "Laptops, desktops, servers, peripherals"
}'

# Update
absuite assets update category --TenantId $TENANT_ID --AssetCategoryId <category-guid> --AssetCategoryUpdateDto '{...}'

# Delete
absuite assets delete category --TenantId $TENANT_ID --AssetCategoryId <category-guid>
```

**REST API equivalents:**
```bash
# List / Count / Get / Create / Update / Delete asset categories
# Primary nested path: /Assets/Categories
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories/count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"name":"IT Equipment"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/Categories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Alternate top-level path (same data): /AssetCategories
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories/count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"name":"IT Equipment"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Asset Types

```bash
# List
absuite assets list types --TenantId $TENANT_ID

# Count
absuite assets count types --TenantId $TENANT_ID

# Get by ID
absuite assets get type --TenantId $TENANT_ID --AssetTypeId <type-guid>

# Create
absuite assets create type --TenantId $TENANT_ID --AssetTypeCreateDto '{
  "Name": "Tangible Fixed Asset"
}'

# Update
absuite assets update type --TenantId $TENANT_ID --AssetTypeId <type-guid> --AssetTypeUpdateDto '{...}'

# Delete
absuite assets delete type --TenantId $TENANT_ID --AssetTypeId <type-guid>
```

**REST API equivalents:**
```bash
# List / Count / Get / Create / Update / Delete asset types
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"name":"Tangible Fixed Asset"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Depreciation Records

Track depreciation over time for an asset.

```bash
# List
absuite assets list depreciation-records --TenantId $TENANT_ID --AssetId <asset-guid>

# Count
absuite assets count depreciation-records --TenantId $TENANT_ID --AssetId <asset-guid>

# Get
absuite assets get depreciation-record --TenantId $TENANT_ID --AssetId <asset-guid> --DepreciationRecordId <record-guid>

# Create
absuite assets create depreciation-record --TenantId $TENANT_ID --AssetId <asset-guid> --DepreciationRecordCreateDto '{
  "Description": "Annual depreciation 2026",
  "Amount": 500.00,
  "Date": "2026-12-31T00:00:00Z"
}'

# Update
absuite assets update depreciation-record --TenantId $TENANT_ID --AssetId <asset-guid> --DepreciationRecordId <record-guid> --DepreciationRecordUpdateDto '{...}'

# Delete
absuite assets delete depreciation-record --TenantId $TENANT_ID --AssetId <asset-guid> --DepreciationRecordId <record-guid>
```

**REST API equivalents:**
```bash
# Depreciation records are nested under a specific asset
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"description":"Annual 2026","amount":500.00}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/DepreciationRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Repairs

Track maintenance and repair history for an asset.

```bash
# List
absuite assets list repairs --TenantId $TENANT_ID --AssetId <asset-guid>

# Count
absuite assets count repairs --TenantId $TENANT_ID --AssetId <asset-guid>

# Get
absuite assets get repair --TenantId $TENANT_ID --AssetId <asset-guid> --RepairId <repair-guid>

# Create
absuite assets create repair --TenantId $TENANT_ID --AssetId <asset-guid> --RepairCreateDto '{
  "Description": "Screen replacement",
  "Cost": 350.00,
  "Date": "2026-06-15T00:00:00Z"
}'

# Update
absuite assets update repair --TenantId $TENANT_ID --AssetId <asset-guid> --RepairId <repair-guid> --RepairUpdateDto '{...}'

# Delete
absuite assets delete repair --TenantId $TENANT_ID --AssetId <asset-guid> --RepairId <repair-guid>
```

**REST API equivalents:**
```bash
# Repairs are nested under a specific asset
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs/<repair-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"description":"Screen replacement","cost":350.00}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs/<repair-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Repairs/<repair-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Value Amendments

Record value changes (appreciation/impairment) for an asset.

```bash
# List
absuite assets list value-amends --TenantId $TENANT_ID --AssetId <asset-guid>

# Count
absuite assets count value-amends --TenantId $TENANT_ID --AssetId <asset-guid>

# Get
absuite assets get value-amend --TenantId $TENANT_ID --AssetId <asset-guid> --ValueAmendId <amend-guid>

# Create
absuite assets create value-amend --TenantId $TENANT_ID --AssetId <asset-guid> --ValueAmendCreateDto '{
  "Description": "Market revaluation",
  "Amount": -200.00,
  "Date": "2026-09-30T00:00:00Z"
}'

# Update
absuite assets update value-amend --TenantId $TENANT_ID --AssetId <asset-guid> --ValueAmendId <amend-guid> --ValueAmendUpdateDto '{...}'

# Delete
absuite assets delete value-amend --TenantId $TENANT_ID --AssetId <asset-guid> --ValueAmendId <amend-guid>
```

**REST API equivalents:**
```bash
# Value amendments are nested under a specific asset
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends/<amend-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"description":"Market revaluation","amount":-200.00}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends/<amend-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/ValueAmends/<amend-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Asset Transfers

Transfer assets between locations, departments, or owners.

```bash
# List
absuite assets list transfers --TenantId $TENANT_ID

# Count
absuite assets count transfers --TenantId $TENANT_ID

# Get
absuite assets get transfer --TenantId $TENANT_ID --AssetTransferId <transfer-guid>

# Create
absuite assets create transfer --TenantId $TENANT_ID --AssetTransferCreateDto '{
  "AssetId": "<asset-guid>",
  "Description": "Transfer to marketing department"
}'

# Update
absuite assets update transfer --TenantId $TENANT_ID --AssetTransferId <transfer-guid> --AssetTransferUpdateDto '{...}'

# Delete
absuite assets delete transfer --TenantId $TENANT_ID --AssetTransferId <transfer-guid>
```

**REST API equivalents:**
```bash
# Asset transfers (top-level, not nested)
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers/<transfer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"assetId":"<asset-guid>","description":"Transfer to marketing"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers/<transfer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/AssetTransfers/<transfer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Transfers nested under a specific asset (full CRUD)
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers/<transfer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"description":"Transfer to marketing"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers/<transfer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AssetsService/Assets/<asset-guid>/Transfers/<transfer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List assets | `absuite assets list --TenantId <guid>` |
| Count assets | `absuite assets count --TenantId <guid>` |
| Get asset | `absuite assets get --TenantId <guid> --AssetId <guid>` |
| Create asset | `absuite assets create --TenantId <guid> --AssetCreateDto '{...}'` |
| Update asset | `absuite assets update --TenantId <guid> --AssetId <guid> --AssetUpdateDto '{...}'` |
| Delete asset | `absuite assets delete --TenantId <guid> --AssetId <guid>` |
| List categories | `absuite assets list categories --TenantId <guid>` |
| List types | `absuite assets list types --TenantId <guid>` |
| List depreciation | `absuite assets list depreciation-records --TenantId <guid> --AssetId <guid>` |
| List repairs | `absuite assets list repairs --TenantId <guid> --AssetId <guid>` |
| List value amends | `absuite assets list value-amends --TenantId <guid> --AssetId <guid>` |
| List transfers | `absuite assets list transfers --TenantId <guid>` |

## API Endpoints Quick Reference

54 endpoints total across the AssetsService.

| Method | Endpoint | Description |
|---|---|---|
| **Assets** | | |
| POST | `/api/v2/AssetsService/Assets` | Create an asset |
| GET | `/api/v2/AssetsService/Assets` | List assets |
| DELETE | `/api/v2/AssetsService/Assets/:assetId` | Delete an asset |
| GET | `/api/v2/AssetsService/Assets/:assetId` | Get asset by ID |
| PUT | `/api/v2/AssetsService/Assets/:assetId` | Update an asset |
| GET | `/api/v2/AssetsService/Assets/count` | Count assets |
| **Assets/Categories** | | |
| POST | `/api/v2/AssetsService/Assets/Categories` | Create a category |
| GET | `/api/v2/AssetsService/Assets/Categories` | List categories |
| DELETE | `/api/v2/AssetsService/Assets/Categories/:categoryId` | Delete a category |
| GET | `/api/v2/AssetsService/Assets/Categories/:categoryId` | Get category by ID |
| PUT | `/api/v2/AssetsService/Assets/Categories/:categoryId` | Update a category |
| GET | `/api/v2/AssetsService/Assets/Categories/count` | Count categories |
| **AssetCategories (alternate path)** | | |
| POST | `/api/v2/AssetsService/AssetCategories` | Create a category |
| GET | `/api/v2/AssetsService/AssetCategories` | List categories |
| DELETE | `/api/v2/AssetsService/AssetCategories/:categoryId` | Delete a category |
| GET | `/api/v2/AssetsService/AssetCategories/:categoryId` | Get category by ID |
| PUT | `/api/v2/AssetsService/AssetCategories/:categoryId` | Update a category |
| GET | `/api/v2/AssetsService/AssetCategories/count` | Count categories |
| **AssetTypes** | | |
| POST | `/api/v2/AssetsService/AssetTypes` | Create a type |
| GET | `/api/v2/AssetsService/AssetTypes` | List types |
| DELETE | `/api/v2/AssetsService/AssetTypes/:typeId` | Delete a type |
| GET | `/api/v2/AssetsService/AssetTypes/:typeId` | Get type by ID |
| PUT | `/api/v2/AssetsService/AssetTypes/:typeId` | Update a type |
| GET | `/api/v2/AssetsService/AssetTypes/count` | Count types |
| **AssetTransfers (top-level)** | | |
| POST | `/api/v2/AssetsService/AssetTransfers` | Create a transfer |
| GET | `/api/v2/AssetsService/AssetTransfers` | List transfers |
| DELETE | `/api/v2/AssetsService/AssetTransfers/:transferId` | Delete a transfer |
| GET | `/api/v2/AssetsService/AssetTransfers/:transferId` | Get transfer by ID |
| PUT | `/api/v2/AssetsService/AssetTransfers/:transferId` | Update a transfer |
| GET | `/api/v2/AssetsService/AssetTransfers/Count` | Count transfers |
| **DepreciationRecords (per asset)** | | |
| POST | `/api/v2/AssetsService/Assets/:assetId/DepreciationRecords` | Create depreciation record |
| GET | `/api/v2/AssetsService/Assets/:assetId/DepreciationRecords` | List depreciation records |
| DELETE | `/api/v2/AssetsService/Assets/:assetId/DepreciationRecords/:recordId` | Delete depreciation record |
| GET | `/api/v2/AssetsService/Assets/:assetId/DepreciationRecords/:recordId` | Get depreciation record |
| PUT | `/api/v2/AssetsService/Assets/:assetId/DepreciationRecords/:recordId` | Update depreciation record |
| GET | `/api/v2/AssetsService/Assets/:assetId/DepreciationRecords/Count` | Count depreciation records |
| **Repairs (per asset)** | | |
| POST | `/api/v2/AssetsService/Assets/:assetId/Repairs` | Create repair |
| GET | `/api/v2/AssetsService/Assets/:assetId/Repairs` | List repairs |
| DELETE | `/api/v2/AssetsService/Assets/:assetId/Repairs/:repairId` | Delete repair |
| GET | `/api/v2/AssetsService/Assets/:assetId/Repairs/:repairId` | Get repair by ID |
| PUT | `/api/v2/AssetsService/Assets/:assetId/Repairs/:repairId` | Update repair |
| GET | `/api/v2/AssetsService/Assets/:assetId/Repairs/Count` | Count repairs |
| **Transfers (per asset)** | | |
| POST | `/api/v2/AssetsService/Assets/:assetId/Transfers` | Create transfer for asset |
| GET | `/api/v2/AssetsService/Assets/:assetId/Transfers` | List transfers for asset |
| DELETE | `/api/v2/AssetsService/Assets/:assetId/Transfers/:transferId` | Delete transfer for asset |
| GET | `/api/v2/AssetsService/Assets/:assetId/Transfers/:transferId` | Get transfer for asset |
| PUT | `/api/v2/AssetsService/Assets/:assetId/Transfers/:transferId` | Update transfer for asset |
| GET | `/api/v2/AssetsService/Assets/:assetId/Transfers/Count` | Count transfers for asset |
| **ValueAmends (per asset)** | | |
| POST | `/api/v2/AssetsService/Assets/:assetId/ValueAmends` | Create value amendment |
| GET | `/api/v2/AssetsService/Assets/:assetId/ValueAmends` | List value amendments |
| DELETE | `/api/v2/AssetsService/Assets/:assetId/ValueAmends/:amendId` | Delete value amendment |
| GET | `/api/v2/AssetsService/Assets/:assetId/ValueAmends/:amendId` | Get value amendment |
| PUT | `/api/v2/AssetsService/Assets/:assetId/ValueAmends/:amendId` | Update value amendment |
| GET | `/api/v2/AssetsService/Assets/:assetId/ValueAmends/Count` | Count value amendments |

## Critical Rules

- **Authenticate first.** Use `absuite login` before any asset operation.
- **Always provide a tenant context.** Set a default or pass `--TenantId` on each call.
- **Use `--help` before unfamiliar commands.** It shows exact parameter names and DTO schemas.
- **Set up categories and types first** before creating assets that reference them.
- **Save the asset `id` after creation.** Needed for depreciation, repairs, value amends, and transfers.
