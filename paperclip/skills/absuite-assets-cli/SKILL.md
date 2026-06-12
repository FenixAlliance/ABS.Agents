---
name: absuite-assets-cli
description: >
  Manage fixed and moveable assets using the `absuite` CLI. Covers assets, asset
  categories, asset types, depreciation records, repairs, value amendments, and asset
  transfers via list/count/get/create/update/delete commands. Requires an authenticated
  CLI session (see absuite-login-cli). For atomic PATCH updates or raw HTTP, use the
  absuite-assets (REST) skill.
---

# Alliance Business Suite — Assets (CLI)

Manage the AssetsService through the `absuite` CLI's `assets` service: assets and their
categories/types, plus per-asset depreciation records, repairs, value amendments, and
transfers. Every operation is tenant-scoped. This skill is CLI-only — for atomic partial
updates (PATCH / JSON Patch) or raw HTTP, use the `absuite-assets` (REST) skill. For
general CLI usage and configuration, see `absuite-cli`.

## Prerequisites

1. **Authenticate first:** run `absuite login` (see the `absuite-login-cli` skill).
2. **Provide a tenant** on every call — assets are tenant-scoped:
   - Set a default once: `absuite config set --tenant-id <tenant-guid>`, or
   - Pass `--TenantId <tenant-guid>` explicitly on each command (shown below).
3. **Discover commands:** `absuite assets list-commands`, and append `--help` to any
   command to see its exact parameters and DTO schema.

## Command structure

```
absuite assets <verb> <entity> --Param value
```

- Verbs: **list, count, search, get, create, update, delete** (search is not implemented
  by this service — see note below).
- The canonical PowerShell function-name form also works, e.g.
  `absuite assets Get-Assets` or `absuite assets New-Asset`. Note the SDK uses approved
  PowerShell verbs: `New-*` (create), `Update-*` (PUT update), `Get-*` (read/list/count),
  `Invoke-Delete*` (delete). The **top-level AssetTransfers** functions carry an `Async`
  suffix (e.g. `Get-AssetTransfersAsync`); the asset/category/type functions do not.
- DTO bodies are passed as a single-quoted JSON string to a `--<Dto>` parameter, using
  the **same field names** as the REST API (camelCase, e.g. `"name"`, `"assetClass"`).

> **No PATCH in the CLI.** The `absuite` CLI does not support JSON Patch. For atomic
> partial updates use the `absuite-assets` REST skill.

> **No search endpoint.** The AssetsService exposes no search operation. Use `list`
> (optionally with `count`) and filter the results yourself.

## Assets

```bash
# List
absuite assets list --TenantId <tenant-guid>

# Count
absuite assets count --TenantId <tenant-guid>

# Get by ID
absuite assets get --TenantId <tenant-guid> --AssetId <asset-guid>

# Create  (--AssetCreateDto)
absuite assets create --TenantId <tenant-guid> --AssetCreateDto '{
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

# Update (full replace, --AssetUpdateDto)
absuite assets update --TenantId <tenant-guid> --AssetId <asset-guid> --AssetUpdateDto '{
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
  "assetTypeId": "<type-guid>",
  "assetCategoryId": "<category-guid>",
  "assetLocationId": "<location-guid>",
  "contactId": "<contact-guid>",
  "organizationDepartmentId": "<department-guid>"
}'

# Delete
absuite assets delete --TenantId <tenant-guid> --AssetId <asset-guid>
```

**Enums (fixed values):** `assetClass` ∈ `Fixed | Stock`; `assetOwner` ∈
`Business | Organization | Contact | Supplier`.

**`AssetCreateDto` fields:** `id`, `timestamp`, `name`, `description`, `assetClass`,
`assetOwner`, `isExistingAsset`, `calculateDepreciation`, `allowMonthlyDepreciation`,
`openingDepreciation`, `purchaseDate`, `purchasePrice`, `currencyId`, `itemId`,
`assetTypeId`, `assetCategoryId`, `purchaseInvoiceId`, `purchaseReceiptId`,
`assetLocationId`, `contactId`, `organizationDepartmentId`. `AssetUpdateDto` is the same
list minus `id`, `timestamp`, and `isExistingAsset`.

## Asset Categories

Categories back two SDK function families that operate on the same data. The
**top-level** family (`Get-AssetCategories` / `New-AssetCategory` / etc.) maps to the
`category` entity; the alternate `Get-AssetAssetCategories` / `New-AssetAssetCategory`
family maps to the nested `/Assets/Categories` path. Use the top-level form below.

```bash
# List
absuite assets list category --TenantId <tenant-guid>

# Count
absuite assets count category --TenantId <tenant-guid>

# Get by ID
absuite assets get category --TenantId <tenant-guid> --CategoryId <category-guid>

# Create  (--AssetCategoryCreateDto: id, timestamp, name, description)
absuite assets create category --TenantId <tenant-guid> --AssetCategoryCreateDto '{
  "name": "<category-name>",
  "description": "<category-description>"
}'

# Update  (--AssetCategoryUpdateDto: name, description)
absuite assets update category --TenantId <tenant-guid> --CategoryId <category-guid> --AssetCategoryUpdateDto '{
  "name": "<category-name>",
  "description": "<category-description>"
}'

# Delete
absuite assets delete category --TenantId <tenant-guid> --CategoryId <category-guid>
```

## Asset Types

```bash
# List
absuite assets list type --TenantId <tenant-guid>

# Count
absuite assets count type --TenantId <tenant-guid>

# Get by ID
absuite assets get type --TenantId <tenant-guid> --TypeId <type-guid>

# Create  (--AssetTypeCreateDto: id, timestamp, name, description)
absuite assets create type --TenantId <tenant-guid> --AssetTypeCreateDto '{
  "name": "<type-name>",
  "description": "<type-description>"
}'

# Update  (--AssetTypeUpdateDto: name, description)
absuite assets update type --TenantId <tenant-guid> --TypeId <type-guid> --AssetTypeUpdateDto '{
  "name": "<type-name>",
  "description": "<type-description>"
}'

# Delete
absuite assets delete type --TenantId <tenant-guid> --TypeId <type-guid>
```

## Depreciation Records (per asset)

All depreciation commands require both `--TenantId` and the parent `--AssetId`.

```bash
# List
absuite assets list depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid>

# Count
absuite assets count depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid>

# Get by ID  (record key param: --RecordId)
absuite assets get depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid> --RecordId <record-guid>

# Create  (--AssetDepreciationRecordCreateDto)
absuite assets create depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid> --AssetDepreciationRecordCreateDto '{
  "assetId": "<asset-guid>",
  "assetDepreciationPolicyId": "<policy-guid>",
  "depreciationAmount": 0,
  "accumulatedDepreciation": 0,
  "bookValue": 0,
  "depreciationDate": "<iso-8601>",
  "year": 0,
  "month": 0
}'

# Update  (--AssetDepreciationRecordUpdateDto: depreciationAmount, accumulatedDepreciation, bookValue, depreciationDate, year, month)
absuite assets update depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid> --RecordId <record-guid> --AssetDepreciationRecordUpdateDto '{
  "depreciationAmount": 0,
  "accumulatedDepreciation": 0,
  "bookValue": 0,
  "depreciationDate": "<iso-8601>",
  "year": 0,
  "month": 0
}'

# Delete
absuite assets delete depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid> --RecordId <record-guid>
```

## Repairs (per asset)

```bash
# List
absuite assets list repair --TenantId <tenant-guid> --AssetId <asset-guid>

# Count
absuite assets count repair --TenantId <tenant-guid> --AssetId <asset-guid>

# Get by ID  (repair key param: --RepairId)
absuite assets get repair --TenantId <tenant-guid> --AssetId <asset-guid> --RepairId <repair-guid>

# Create  (--AssetRepairCreateDto)
absuite assets create repair --TenantId <tenant-guid> --AssetId <asset-guid> --AssetRepairCreateDto '{
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

# Update  (--AssetRepairUpdateDto: repairStatus, scheduledDate, completionDate, estimatedCost, actualCost, problemDescription, repairDescription, notes, assetMaintenanceTeamId)
absuite assets update repair --TenantId <tenant-guid> --AssetId <asset-guid> --RepairId <repair-guid> --AssetRepairUpdateDto '{
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

# Delete
absuite assets delete repair --TenantId <tenant-guid> --AssetId <asset-guid> --RepairId <repair-guid>
```

**Enum:** `repairStatus` ∈ `Scheduled | InProgress | Completed | Cancelled`.

## Value Amendments (per asset)

```bash
# List
absuite assets list value-amend --TenantId <tenant-guid> --AssetId <asset-guid>

# Count
absuite assets count value-amend --TenantId <tenant-guid> --AssetId <asset-guid>

# Get by ID  (amend key param: --AmendId)
absuite assets get value-amend --TenantId <tenant-guid> --AssetId <asset-guid> --AmendId <amend-guid>

# Create  (--AssetValueAmendCreateDto)
absuite assets create value-amend --TenantId <tenant-guid> --AssetId <asset-guid> --AssetValueAmendCreateDto '{
  "assetId": "<asset-guid>",
  "previousValue": 0,
  "newValue": 0,
  "reason": "<reason>",
  "amendmentDate": "<iso-8601>",
  "currencyId": "<currency-guid>"
}'

# Update  (--AssetValueAmendUpdateDto: newValue, reason, amendmentDate)
absuite assets update value-amend --TenantId <tenant-guid> --AssetId <asset-guid> --AmendId <amend-guid> --AssetValueAmendUpdateDto '{
  "newValue": 0,
  "reason": "<reason>",
  "amendmentDate": "<iso-8601>"
}'

# Delete
absuite assets delete value-amend --TenantId <tenant-guid> --AssetId <asset-guid> --AmendId <amend-guid>
```

## Asset Transfers

Transfers come in two flavours: **top-level** (across all assets) and **per-asset**
(nested). They share the same create/update DTOs.

### Top-level transfers

```bash
# List
absuite assets list transfer --TenantId <tenant-guid>

# Count
absuite assets count transfer --TenantId <tenant-guid>

# Get by ID  (transfer key param: --TransferId)
absuite assets get transfer --TenantId <tenant-guid> --TransferId <transfer-guid>

# Create  (--AssetTransferCreateDto)
absuite assets create transfer --TenantId <tenant-guid> --AssetTransferCreateDto '{
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

# Update  (--AssetTransferUpdateDto: serialList, quantity, serial, destinationLocationId, destinationContactId, destinationDepartmentId)
absuite assets update transfer --TenantId <tenant-guid> --TransferId <transfer-guid> --AssetTransferUpdateDto '{
  "serialList": "<serial-list>",
  "quantity": "<quantity>",
  "serial": "<serial>",
  "destinationLocationId": "<location-guid>",
  "destinationContactId": "<contact-guid>",
  "destinationDepartmentId": "<department-guid>"
}'

# Delete
absuite assets delete transfer --TenantId <tenant-guid> --TransferId <transfer-guid>
```

### Per-asset transfers

Use the asset-transfer entity with the parent `--AssetId`. The SDK exposes these as
`Get-AssetTransfers` / `New-AssetTransfer` / `Update-AssetTransfer` /
`Invoke-DeleteAssetTransfer` (no `Async` suffix), distinct from the top-level
`*AssetTransferAsync` functions.

```bash
# List for one asset
absuite assets list asset-transfer --TenantId <tenant-guid> --AssetId <asset-guid>

# Count for one asset
absuite assets count asset-transfer --TenantId <tenant-guid> --AssetId <asset-guid>

# Get by ID
absuite assets get asset-transfer --TenantId <tenant-guid> --AssetId <asset-guid> --TransferId <transfer-guid>

# Create
absuite assets create asset-transfer --TenantId <tenant-guid> --AssetId <asset-guid> --AssetTransferCreateDto '{
  "assetId": "<asset-guid>",
  "isRootTransfer": false,
  "destinationLocationId": "<location-guid>"
}'

# Update
absuite assets update asset-transfer --TenantId <tenant-guid> --AssetId <asset-guid> --TransferId <transfer-guid> --AssetTransferUpdateDto '{
  "destinationLocationId": "<location-guid>"
}'

# Delete
absuite assets delete asset-transfer --TenantId <tenant-guid> --AssetId <asset-guid> --TransferId <transfer-guid>
```

## End-to-end workflow

```bash
# 1) Create a category and a type
absuite assets create category --TenantId <tenant-guid> --AssetCategoryCreateDto '{ "name": "<category-name>", "description": "<category-description>" }'
absuite assets create type     --TenantId <tenant-guid> --AssetTypeCreateDto     '{ "name": "<type-name>", "description": "<type-description>" }'

# 2) Create the asset referencing the new category/type ids
absuite assets create --TenantId <tenant-guid> --AssetCreateDto '{ "name": "<asset-name>", "assetClass": "Fixed", "assetOwner": "Business", "calculateDepreciation": true, "purchaseDate": "<iso-8601>", "purchasePrice": 0, "currencyId": "<currency-guid>", "assetCategoryId": "<category-guid>", "assetTypeId": "<type-guid>" }'

# 3) Post a depreciation record
absuite assets create depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid> --AssetDepreciationRecordCreateDto '{ "assetId": "<asset-guid>", "depreciationAmount": 0, "accumulatedDepreciation": 0, "bookValue": 0, "depreciationDate": "<iso-8601>", "year": 0, "month": 0 }'

# 4) Open a repair, then update it to Completed (CLI has no PATCH — use update or the REST skill)
absuite assets create repair --TenantId <tenant-guid> --AssetId <asset-guid> --AssetRepairCreateDto '{ "assetId": "<asset-guid>", "repairStatus": "Scheduled", "scheduledDate": "<iso-8601>", "estimatedCost": 0 }'
absuite assets update repair --TenantId <tenant-guid> --AssetId <asset-guid> --RepairId <repair-guid> --AssetRepairUpdateDto '{ "repairStatus": "Completed", "completionDate": "<iso-8601>", "actualCost": 0 }'

# 5) Transfer the asset to a new department
absuite assets create transfer --TenantId <tenant-guid> --AssetTransferCreateDto '{ "assetId": "<asset-guid>", "destinationDepartmentId": "<department-guid>" }'
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| **Assets** | |
| List assets | `absuite assets list --TenantId <tenant-guid>` |
| Count assets | `absuite assets count --TenantId <tenant-guid>` |
| Get asset | `absuite assets get --TenantId <tenant-guid> --AssetId <asset-guid>` |
| Create asset | `absuite assets create --TenantId <tenant-guid> --AssetCreateDto '{...}'` |
| Update asset | `absuite assets update --TenantId <tenant-guid> --AssetId <asset-guid> --AssetUpdateDto '{...}'` |
| Delete asset | `absuite assets delete --TenantId <tenant-guid> --AssetId <asset-guid>` |
| **Categories** | |
| List categories | `absuite assets list category --TenantId <tenant-guid>` |
| Count categories | `absuite assets count category --TenantId <tenant-guid>` |
| Get category | `absuite assets get category --TenantId <tenant-guid> --CategoryId <category-guid>` |
| Create category | `absuite assets create category --TenantId <tenant-guid> --AssetCategoryCreateDto '{...}'` |
| Update category | `absuite assets update category --TenantId <tenant-guid> --CategoryId <category-guid> --AssetCategoryUpdateDto '{...}'` |
| Delete category | `absuite assets delete category --TenantId <tenant-guid> --CategoryId <category-guid>` |
| **Types** | |
| List types | `absuite assets list type --TenantId <tenant-guid>` |
| Count types | `absuite assets count type --TenantId <tenant-guid>` |
| Get type | `absuite assets get type --TenantId <tenant-guid> --TypeId <type-guid>` |
| Create type | `absuite assets create type --TenantId <tenant-guid> --AssetTypeCreateDto '{...}'` |
| Update type | `absuite assets update type --TenantId <tenant-guid> --TypeId <type-guid> --AssetTypeUpdateDto '{...}'` |
| Delete type | `absuite assets delete type --TenantId <tenant-guid> --TypeId <type-guid>` |
| **Depreciation Records** | |
| List records | `absuite assets list depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid>` |
| Count records | `absuite assets count depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid>` |
| Get record | `absuite assets get depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid> --RecordId <record-guid>` |
| Create record | `absuite assets create depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid> --AssetDepreciationRecordCreateDto '{...}'` |
| Update record | `absuite assets update depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid> --RecordId <record-guid> --AssetDepreciationRecordUpdateDto '{...}'` |
| Delete record | `absuite assets delete depreciation-record --TenantId <tenant-guid> --AssetId <asset-guid> --RecordId <record-guid>` |
| **Repairs** | |
| List repairs | `absuite assets list repair --TenantId <tenant-guid> --AssetId <asset-guid>` |
| Count repairs | `absuite assets count repair --TenantId <tenant-guid> --AssetId <asset-guid>` |
| Get repair | `absuite assets get repair --TenantId <tenant-guid> --AssetId <asset-guid> --RepairId <repair-guid>` |
| Create repair | `absuite assets create repair --TenantId <tenant-guid> --AssetId <asset-guid> --AssetRepairCreateDto '{...}'` |
| Update repair | `absuite assets update repair --TenantId <tenant-guid> --AssetId <asset-guid> --RepairId <repair-guid> --AssetRepairUpdateDto '{...}'` |
| Delete repair | `absuite assets delete repair --TenantId <tenant-guid> --AssetId <asset-guid> --RepairId <repair-guid>` |
| **Value Amends** | |
| List amends | `absuite assets list value-amend --TenantId <tenant-guid> --AssetId <asset-guid>` |
| Count amends | `absuite assets count value-amend --TenantId <tenant-guid> --AssetId <asset-guid>` |
| Get amend | `absuite assets get value-amend --TenantId <tenant-guid> --AssetId <asset-guid> --AmendId <amend-guid>` |
| Create amend | `absuite assets create value-amend --TenantId <tenant-guid> --AssetId <asset-guid> --AssetValueAmendCreateDto '{...}'` |
| Update amend | `absuite assets update value-amend --TenantId <tenant-guid> --AssetId <asset-guid> --AmendId <amend-guid> --AssetValueAmendUpdateDto '{...}'` |
| Delete amend | `absuite assets delete value-amend --TenantId <tenant-guid> --AssetId <asset-guid> --AmendId <amend-guid>` |
| **Transfers (top-level)** | |
| List transfers | `absuite assets list transfer --TenantId <tenant-guid>` |
| Count transfers | `absuite assets count transfer --TenantId <tenant-guid>` |
| Get transfer | `absuite assets get transfer --TenantId <tenant-guid> --TransferId <transfer-guid>` |
| Create transfer | `absuite assets create transfer --TenantId <tenant-guid> --AssetTransferCreateDto '{...}'` |
| Update transfer | `absuite assets update transfer --TenantId <tenant-guid> --TransferId <transfer-guid> --AssetTransferUpdateDto '{...}'` |
| Delete transfer | `absuite assets delete transfer --TenantId <tenant-guid> --TransferId <transfer-guid>` |
| **Transfers (per asset)** | |
| List transfers | `absuite assets list asset-transfer --TenantId <tenant-guid> --AssetId <asset-guid>` |
| Count transfers | `absuite assets count asset-transfer --TenantId <tenant-guid> --AssetId <asset-guid>` |
| Get transfer | `absuite assets get asset-transfer --TenantId <tenant-guid> --AssetId <asset-guid> --TransferId <transfer-guid>` |
| Create transfer | `absuite assets create asset-transfer --TenantId <tenant-guid> --AssetId <asset-guid> --AssetTransferCreateDto '{...}'` |
| Update transfer | `absuite assets update asset-transfer --TenantId <tenant-guid> --AssetId <asset-guid> --TransferId <transfer-guid> --AssetTransferUpdateDto '{...}'` |
| Delete transfer | `absuite assets delete asset-transfer --TenantId <tenant-guid> --AssetId <asset-guid> --TransferId <transfer-guid>` |

## Critical Rules

- **Authenticate first** with `absuite login` (see `absuite-login-cli`).
- **Always provide a tenant** — set a default with `absuite config set --tenant-id <guid>`
  or pass `--TenantId <tenant-guid>` on every call.
- **Use `--help`** on any unfamiliar command to confirm exact parameter and DTO names.
- **Enums are fixed:** `assetClass` ∈ `Fixed|Stock`, `assetOwner` ∈
  `Business|Organization|Contact|Supplier`, `repairStatus` ∈
  `Scheduled|InProgress|Completed|Cancelled`.
- **Create categories and types first**, then reference their ids from the asset.
- **No PATCH and no search** in the CLI — for atomic partial updates use the
  `absuite-assets` REST skill; for filtering, `list` then filter client-side.
- **Save the asset id** after create — it is required for depreciation records, repairs,
  value amends, and per-asset transfers.
