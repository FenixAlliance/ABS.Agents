---
name: absuite-catalog-cli
description: >
  Manage the product catalog in the Alliance Business Suite (ABS) using the
  `absuite` CLI. Covers stock items (products), categories, types, families,
  brands, tags, images, attachments, attributes & options, bundles, reviews,
  questions, policy relationships (tax / shipping / return / refund / warranty),
  price-rule relationships, Google categories, and merchants via list / count /
  get / create / update / delete / relate commands. Requires an authenticated CLI
  session (see absuite-login-cli). For atomic PATCH updates or raw HTTP, use the
  absuite-catalog (REST) skill.
---

# Alliance Business Suite — Catalog Skill (CLI)

Manage the product catalog through the `absuite` CLI's `catalog` service. In ABS, **Items = Catalog Items = Stock Items = Products** — the same aggregate. Catalog reads are global/public by default and scope to a tenant when you pass `--TenantId`; writes require a tenant.

> For raw HTTP, JSON-Patch (atomic partial updates), or the full field reference, use the `absuite-catalog` (REST) skill. For general CLI usage and config, see `absuite-cli`.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-catalog` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-catalog` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first**: run `absuite login` (see `absuite-login-cli`).
2. **Set your default tenant** so writes succeed: `absuite config set --tenant-id <tenant-guid>` (referenced below as `$TENANT_ID`), or pass `--TenantId <tenant-guid>` on each command.
3. **Discover commands**: `absuite catalog list-commands`, and `absuite catalog <command> --help` for the full parameter/DTO schema of any command.

## Command structure

```
absuite catalog <verb> <entity> --Param value
```

- The service token is `catalog`.
- Common verbs: **list, count, get, create, update, delete**, plus catalog-specific **relate / remove** actions and **batch / bulk-upsert / recalculate-prices**.
- The canonical PowerShell function-name form also works, e.g. `absuite catalog Get-StockItemsQuery`, `absuite catalog New-StockItem`, `absuite catalog Update-StockItem`.
- JSON DTO parameters are passed as a single-quoted JSON string, e.g. `--CatalogItemCreateDto '{ ... }'`, using the **same field names** as the REST manifest (camelCase).
- Reads accept an optional `--TenantId`; writes require it (use your configured default or pass it explicitly).

> The CLI does **not** support PATCH (JSON Patch). For atomic partial updates, use the `absuite-catalog` REST skill.

## Stock Items (Products)

```powershell
# List (omit --TenantId for the global/public catalog)
absuite catalog get stock-items-query --TenantId $TENANT_ID

# Count
absuite catalog count stock-items-by-business --TenantId $TENANT_ID

# Get by ID
absuite catalog get stock-item-by-id --ItemId <item-guid>

# Get extended (with related data)
absuite catalog get extended-stock-item-by-id --ItemId <item-guid>

# Min / Max price
absuite catalog get stock-items-odata-min-price --TenantId $TENANT_ID
absuite catalog get stock-items-odata-max-price --TenantId $TENANT_ID

# Create
absuite catalog create stock-item --TenantId $TENANT_ID --CatalogItemCreateDto '{
  "name": "<product-name>",
  "title": "<display-title>",
  "sku": "<sku>",
  "description": "<long-description>",
  "shortDescription": "<short-description>",
  "regularPrice": 49.99,
  "discountPrice": 44.99,
  "currencyId": "<currency-guid>",
  "categoryId": "<category-guid>",
  "itemTypeId": "<type-guid>",
  "brandId": "<brand-guid>",
  "inStock": true,
  "published": true,
  "taxable": true,
  "manageInventory": true,
  "currentStock": 100.0,
  "weight": 0.5,
  "selectedCategories": ["<category-guid>"],
  "selectedTags": ["<tag-guid>"],
  "selectedTaxPolicies": ["<tax-policy-guid>"]
}'

# Update (PUT-style, full DTO)
absuite catalog update stock-item --TenantId $TENANT_ID --ItemId <item-guid> --CatalogItemUpdateDto '{
  "name": "<product-name>",
  "regularPrice": 59.99,
  "onSale": true,
  "discountPrice": 49.99,
  "published": true
}'

# Delete
absuite catalog delete stock-item --TenantId $TENANT_ID --ItemId <item-guid>
```

**Key `CatalogItemCreateDto` fields** (all optional unless your workflow needs them):

| Field | Type | Description |
|---|---|---|
| `name` / `title` | string | Product name / display title |
| `sku` / `upc` / `ean` / `gtin` / `mpn` / `isbn` / `asin` / `unspsc` | string | Product identifiers |
| `regularPrice` / `discountPrice` | number | Base / sale price |
| `currencyId` | string | Currency |
| `categoryId` / `itemTypeId` / `brandId` | string | Primary category / type / brand |
| `languageId` / `unitId` / `unitGroupId` | string | Localization / units |
| `inStock` / `published` / `taxable` / `manageInventory` | boolean | Availability / inventory flags |
| `currentStock` | number | Quantity on hand |
| `weight` / `width` / `height` / `length` | number | Dimensions |
| `featured` / `onSale` / `hot` / `trending` / `digital` / `byRequest` | boolean | Merchandising / nature flags |
| `supplierProfileId` / `supplierCode` | string | Supplier link |
| `selectedCategories` / `selectedTags` / `selectedBrands` / `selectedTypes` | string[] | Linked sub-resource IDs |
| `selectedTaxPolicies` / `selectedShipmentPolicies` / `selectedReturnPolicies` / `selectedRefundPolicies` / `selectedWarrantyPolicies` | string[] | Linked policy IDs |
| `selectedPricingRules` / `selectedGoogleCategories` / `selectedAttributesOptions` | string[] | Linked rule / taxonomy / attribute-option IDs |

### Bulk operations & price recalculation

```powershell
# Batch-toggle flags / add-remove tax policies across many items
absuite catalog batch-update-stock-items --TenantId $TENANT_ID --BatchStockItemUpdateRequest '{
  "itemIds": ["<item-guid>", "<item-guid>"],
  "published": true,
  "taxable": true,
  "addTaxPolicyIds": ["<tax-policy-guid>"],
  "removeTaxPolicyIds": ["<tax-policy-guid>"]
}'

# Bulk upsert from flat rows
absuite catalog bulk-upsert-stock-items --TenantId $TENANT_ID --BulkProduct '[
  {
    "sku": "<sku>",
    "title": "<product-name>",
    "type": "<type-name>",
    "brand": "<brand-name>",
    "currency": "<currency-code>",
    "supplier": "<supplier-name>",
    "regularPrice": 49.99,
    "currentStock": 100,
    "taxable": true,
    "inStock": true,
    "manageInventory": true
  }
]'

# Recalculate prices for a set of items (array of item IDs)
absuite catalog recalculate-stock-item-prices --TenantId $TENANT_ID --RequestBody '["<item-guid>", "<item-guid>"]'
```

### Primary image

```powershell
absuite catalog get product-primary-image --ItemId <item-guid>
absuite catalog update product-primary-image --TenantId $TENANT_ID --ItemId <item-guid>
```

## Item Categories

`ItemCategoryCreateDto` requires `title`; `ItemCategoryUpdateDto` requires `title`.

```powershell
absuite catalog count item-categories --TenantId $TENANT_ID
absuite catalog get item-categories --TenantId $TENANT_ID
absuite catalog get item-category-by-id --ItemCategoryId <category-guid>

absuite catalog create item-category --TenantId $TENANT_ID --ItemCategoryCreateDto '{
  "title": "<category-title>",
  "description": "<description>",
  "imageURL": "<image-url>",
  "parentItemCategoryId": "<parent-category-guid>"
}'

absuite catalog update item-category --TenantId $TENANT_ID --ItemCategoryId <category-guid> --ItemCategoryUpdateDto '{
  "title": "<category-title>",
  "description": "<description>",
  "isFeatured": true,
  "enableForProducts": true
}'

absuite catalog delete item-category --TenantId $TENANT_ID --ItemCategoryId <category-guid>
```

## Item Types

Types use `singularTitle` / `pluralTitle` (**not** `name`). `ItemTypeCreateDto` requires `itemCategoryId`; `ItemTypeUpdateDto` requires `singularTitle`.

```powershell
absuite catalog count item-types --TenantId $TENANT_ID
absuite catalog get item-types --TenantId $TENANT_ID
absuite catalog get item-type-by-id --ItemTypeID <type-guid>

absuite catalog create item-type --TenantId $TENANT_ID --ItemTypeCreateDto '{
  "singularTitle": "<singular-title>",
  "pluralTitle": "<plural-title>",
  "description": "<description>",
  "itemCategoryId": "<category-guid>",
  "itemGoogleCategoryId": "<google-category-guid>"
}'

absuite catalog update item-type --TenantId $TENANT_ID --ItemTypeID <type-guid> --ItemTypeUpdateDto '{
  "singularTitle": "<singular-title>",
  "pluralTitle": "<plural-title>",
  "description": "<description>"
}'

absuite catalog delete item-type --TenantId $TENANT_ID --ItemTypeID <type-guid>
```

> Note: the type-by-ID parameter is spelled `--ItemTypeID`.

## Item Families

`ItemFamilyCreateDto` / `ItemFamilyUpdateDto` require `name`.

```powershell
absuite catalog count item-families --TenantId $TENANT_ID
absuite catalog get item-families --TenantId $TENANT_ID
absuite catalog get item-family-by-id --ItemFamilyId <family-guid>
absuite catalog create item-family --TenantId $TENANT_ID --ItemFamilyCreateDto '{ "name": "<family-name>", "code": "<code>", "description": "<description>" }'
absuite catalog update item-family --TenantId $TENANT_ID --ItemFamilyId <family-guid> --ItemFamilyUpdateDto '{ "name": "<family-name>", "code": "<code>", "description": "<description>" }'
absuite catalog delete item-family --TenantId $TENANT_ID --ItemFamilyId <family-guid>
```

## Item Brands

`ItemBrandCreateDto` / `ItemBrandUpdateDto` require `name`. (No `count` command for brands.)

```powershell
absuite catalog get item-brands --TenantId $TENANT_ID
absuite catalog get item-brand-by-id --ItemBrandId <brand-guid>
absuite catalog create item-brand --TenantId $TENANT_ID --ItemBrandCreateDto '{ "name": "<brand-name>", "code": "<code>", "description": "<description>", "websiteURL": "<url>" }'
absuite catalog update item-brand --TenantId $TENANT_ID --ItemBrandId <brand-guid> --ItemBrandUpdateDto '{ "name": "<brand-name>", "description": "<description>", "logoURL": "<logo-url>", "featured": true }'
absuite catalog delete item-brand --TenantId $TENANT_ID --ItemBrandId <brand-guid>
```

## Item Tags

Tags use `title` (**not** `name`). `ItemTagCreateDto` / `ItemTagUpdateDto` require `title`. (No standalone `count` command for tags — count tags on an item via `count stock-item-tags-by-item-id`.)

```powershell
absuite catalog get item-tags --TenantId $TENANT_ID
absuite catalog get item-tag-by-id --ItemTagId <tag-guid>
absuite catalog create item-tag --TenantId $TENANT_ID --ItemTagCreateDto '{ "title": "<tag-title>", "description": "<description>" }'
absuite catalog update item-tag --TenantId $TENANT_ID --ItemTagId <tag-guid> --ItemTagUpdateDto '{ "title": "<tag-title>", "description": "<description>" }'
absuite catalog delete item-tag --TenantId $TENANT_ID --ItemTagId <tag-guid>
```

## Item Images

`ItemImageCreateDto` requires `fileName`; `ItemImageUpdateDto` requires `itemId`, `mD5Hash`, `fileUploadURL`, `fileName`, `contentType`. (No `count` command.)

```powershell
absuite catalog get item-images --TenantId $TENANT_ID
absuite catalog get item-image-by-id --ItemImageId <image-guid>
absuite catalog create item-image --TenantId $TENANT_ID --ItemImageCreateDto '{
  "itemId": "<item-guid>",
  "fileName": "<file-name>",
  "fileUploadURL": "<upload-url>",
  "title": "<title>",
  "contentType": "image/jpeg"
}'
absuite catalog update item-image --TenantId $TENANT_ID --ItemImageId <image-guid> --ItemImageUpdateDto '{
  "itemId": "<item-guid>",
  "mD5Hash": "<md5>",
  "fileUploadURL": "<upload-url>",
  "fileName": "<file-name>",
  "contentType": "image/jpeg"
}'
absuite catalog delete item-image --TenantId $TENANT_ID --ItemImageId <image-guid>
```

## Item Attachments

No required fields. (No `count` command.)

```powershell
absuite catalog get item-attachments --TenantId $TENANT_ID
absuite catalog get item-attachment-by-id --ItemAttachmentId <attachment-guid>
absuite catalog create item-attachment --TenantId $TENANT_ID --ItemAttachmentCreateDto '{ "title": "<title>", "fileName": "<file-name>", "filePath": "<file-path>", "itemId": "<item-guid>" }'
absuite catalog update item-attachment --TenantId $TENANT_ID --ItemAttachmentId <attachment-guid> --ItemAttachmentUpdateDto '{ "title": "<title>", "fileName": "<file-name>", "filePath": "<file-path>" }'
absuite catalog delete item-attachment --TenantId $TENANT_ID --ItemAttachmentId <attachment-guid>
```

## Item Attributes

`ItemAttributeCreateDto` / `ItemAttributeUpdateDto` require `name`.

```powershell
absuite catalog count item-attributes --TenantId $TENANT_ID
absuite catalog get item-attributes --TenantId $TENANT_ID
absuite catalog get item-attribute-by-id --ItemAttributeId <attr-guid>
absuite catalog create item-attribute --TenantId $TENANT_ID --ItemAttributeCreateDto '{ "name": "<attribute-name>", "description": "<description>" }'
absuite catalog update item-attribute --TenantId $TENANT_ID --ItemAttributeId <attr-guid> --ItemAttributeUpdateDto '{ "name": "<attribute-name>", "description": "<description>" }'
absuite catalog delete item-attribute --TenantId $TENANT_ID --ItemAttributeId <attr-guid>
```

## Item Attribute Options

`ItemAttributeOptionCreateDto` requires `name` and `itemAttributeId`; `ItemAttributeOptionUpdateDto` requires `name`.

```powershell
absuite catalog get item-attribute-options-count --TenantId $TENANT_ID
absuite catalog get item-attribute-options --TenantId $TENANT_ID
absuite catalog get item-attribute-option-by-id --ItemAttributeOptionId <option-guid>
absuite catalog create item-attribute-option --TenantId $TENANT_ID --ItemAttributeOptionCreateDto '{ "name": "<option-name>", "description": "<description>", "itemAttributeId": "<attr-guid>" }'
absuite catalog update item-attribute-option --TenantId $TENANT_ID --ItemAttributeOptionId <option-guid> --ItemAttributeOptionUpdateDto '{ "name": "<option-name>", "description": "<description>" }'
absuite catalog delete item-attribute-option --TenantId $TENANT_ID --ItemAttributeOptionId <option-guid>
```

## Item Bundles

`ItemBundleCreateDto` / `ItemBundleUpdateDto` require `name`.

```powershell
absuite catalog count item-bundles --TenantId $TENANT_ID
absuite catalog get item-bundles --TenantId $TENANT_ID
absuite catalog get item-bundle-by-id --ItemBundleId <bundle-guid>
absuite catalog create item-bundle --TenantId $TENANT_ID --ItemBundleCreateDto '{ "name": "<bundle-name>", "code": "<code>", "description": "<description>", "disabled": false }'
absuite catalog update item-bundle --TenantId $TENANT_ID --ItemBundleId <bundle-guid> --ItemBundleUpdateDto '{ "name": "<bundle-name>", "code": "<code>", "description": "<description>", "disabled": false }'
absuite catalog delete item-bundle --TenantId $TENANT_ID --ItemBundleId <bundle-guid>
```

## Item Reviews

`list item-reviews` filters by `--ItemId` (required). Create requires `--TenantId`. `ItemReviewUpdateDto` carries `reviewScore`, `reviewMessage`.

```powershell
absuite catalog get item-reviews --ItemId <item-guid>
absuite catalog get item-review-by-id --ItemReviewId <review-guid>
absuite catalog create item-review --TenantId $TENANT_ID --ItemReviewCreateDto '{ "itemId": "<item-guid>", "reviewScore": 5, "reviewMessage": "<message>" }'
absuite catalog update item-review --TenantId $TENANT_ID --ItemReviewId <review-guid> --ItemReviewUpdateDto '{ "reviewScore": 4, "reviewMessage": "<message>" }'
absuite catalog delete item-review --TenantId $TENANT_ID --ItemReviewId <review-guid>
```

## Item Questions

`ItemQuestionCreateDto` requires `title`, `needsRevision`, `question`, `itemId`; `ItemQuestionUpdateDto` requires `needsRevision`.

```powershell
absuite catalog get item-questions --TenantId $TENANT_ID
absuite catalog get item-question-by-id --ItemQuestionId <question-guid>
absuite catalog create item-question --TenantId $TENANT_ID --ItemQuestionCreateDto '{ "title": "<title>", "needsRevision": true, "question": "<question>", "itemId": "<item-guid>" }'
absuite catalog update item-question --TenantId $TENANT_ID --ItemQuestionId <question-guid> --ItemQuestionUpdateDto '{ "title": "<title>", "needsRevision": false, "question": "<question>" }'
absuite catalog delete item-question --TenantId $TENANT_ID --ItemQuestionId <question-guid>
```

## Stock-item sub-resources (relate / list / remove)

Link existing entities to a stock item. Listing the related set and getting a single link take no tenant; relate / remove generally require `--TenantId` (a few take none — pass it from your configured default when unsure).

### Brands

```powershell
absuite catalog get stock-item-brands-by-item-id --ItemId <item-guid>
absuite catalog relate-brand-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemBrandId <brand-guid>
absuite catalog remove-brand-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemBrandId <brand-guid>
```

### Categories

```powershell
absuite catalog get stock-item-categories-by-item-id --ItemId <item-guid>
absuite catalog relate-category-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemCategoryId <category-guid>
absuite catalog remove-category-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemCategoryId <category-guid>
```

### Types

```powershell
absuite catalog get stock-item-types-by-item-id --TenantId $TENANT_ID --ItemId <item-guid>
absuite catalog relate-type-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemTypeId <type-guid>
absuite catalog remove-type-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemTypeId <type-guid>
```

### Tags (count is item-scoped)

```powershell
absuite catalog get stock-item-tags-by-item-id --TenantId $TENANT_ID --ItemId <item-guid>
absuite catalog count stock-item-tags-by-item-id --TenantId $TENANT_ID --ItemId <item-guid>
absuite catalog relate-tag-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemTagId <tag-guid>
absuite catalog remove-tag-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemTagId <tag-guid>
```

### Images

```powershell
absuite catalog get stock-item-images-by-item-id --ItemId <item-guid>
absuite catalog relate-image-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemImageId <image-guid>
absuite catalog remove-image-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemImageId <image-guid>
```

### Attachments

```powershell
absuite catalog get stock-item-attachments-by-item-id --ItemId <item-guid>
absuite catalog relate-attachment-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemAttachmentId <attachment-guid> --ItemAttachmentCreateDto '{ "title": "<title>", "fileName": "<file-name>", "filePath": "<file-path>" }'
absuite catalog remove-attachment-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemAttachmentId <attachment-guid>
```

### Attribute Options

```powershell
absuite catalog get stock-item-attribute-options-by-item-id --ItemId <item-guid>
absuite catalog relate-attribute-option-to-stock-item --ItemId <item-guid> --ItemAttributeOptionId <option-guid>
absuite catalog remove-attribute-option-from-stock-item --ItemId <item-guid> --ItemAttributeOptionId <option-guid>
```

### Google Categories

```powershell
absuite catalog get stock-item-google-categories-by-item-id --ItemId <item-guid>
absuite catalog relate-google-category-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemGoogleCategoryId <google-category-guid>
absuite catalog remove-google-category-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemGoogleCategoryId <google-category-guid>
```

### Price Rules

```powershell
absuite catalog get stock-item-price-rules-by-item-id --ItemId <item-guid>
absuite catalog relate-price-rule-to-stock-item --ItemId <item-guid> --ItemPriceRuleId <price-rule-guid>
absuite catalog remove-price-rule-from-stock-item --ItemId <item-guid> --ItemPriceRuleId <price-rule-guid>
```

### Questions / Reviews (create against an item)

```powershell
absuite catalog get stock-item-questions-by-item-id --ItemId <item-guid>
absuite catalog relate-question-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemQuestionRecordCreateDto '{ "title": "<title>", "needsRevision": true, "question": "<question>" }'
absuite catalog remove-question-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemQuestionId <question-guid>

absuite catalog get stock-item-reviews-by-item-id --ItemId <item-guid>
absuite catalog relate-review-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemReviewRecordCreateDto '{ "reviewScore": 5, "reviewMessage": "<message>" }'
absuite catalog remove-review-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemReviewId <review-guid>
```

### Policy relationships (Tax / Shipping / Return / Refund / Warranty)

Each policy kind exposes the item-scoped relate/get/remove plus a standalone link resource that takes `--ItemId` and the policy ID as parameters. List / get / count the link records, then relate or remove:

```powershell
# Tax
absuite catalog get stock-item-tax-policies-by-item-id --ItemId <item-guid>
absuite catalog relate-item-to-tax-policy --TenantId $TENANT_ID --ItemId <item-guid> --TaxPolicyId <tax-policy-guid>
absuite catalog remove-tax-policy-from-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemTaxPolicyId <item-tax-policy-guid>
absuite catalog get item-tax-policies --TenantId $TENANT_ID --ItemId <item-guid>
absuite catalog count item-tax-policies --TenantId $TENANT_ID --ItemId <item-guid>

# Shipping
absuite catalog get stock-item-shipping-policies-by-item-id --ItemId <item-guid>
absuite catalog relate-item-to-shipping-policy --TenantId $TENANT_ID --ItemId <item-guid> --ShippingPolicyId <shipping-policy-guid>
absuite catalog remove-shipping-policy-from-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemShippingPolicyId <item-shipping-policy-guid>
absuite catalog get item-shipping-policies --TenantId $TENANT_ID --ItemId <item-guid>
absuite catalog count item-shipping-policies --TenantId $TENANT_ID --ItemId <item-guid>

# Return
absuite catalog get stock-item-return-policies-by-item-id --ItemId <item-guid>
absuite catalog relate-item-to-return-policy --TenantId $TENANT_ID --ItemId <item-guid> --ReturnPolicyId <return-policy-guid>
absuite catalog remove-return-policy-from-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemReturnPolicyId <item-return-policy-guid>
absuite catalog get item-return-policies --TenantId $TENANT_ID --ItemId <item-guid>
absuite catalog count item-return-policies --TenantId $TENANT_ID --ItemId <item-guid>

# Refund
absuite catalog get stock-item-refund-policies-by-item-id --ItemId <item-guid>
absuite catalog relate-item-to-refund-policy --TenantId $TENANT_ID --ItemId <item-guid> --RefundPolicyId <refund-policy-guid>
absuite catalog remove-refund-policy-from-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemRefundPolicyId <item-refund-policy-guid>
absuite catalog get item-refund-policies --TenantId $TENANT_ID --ItemId <item-guid>
absuite catalog count item-refund-policies --TenantId $TENANT_ID --ItemId <item-guid>

# Warranty
absuite catalog get stock-item-warranty-policies-by-item-id --ItemId <item-guid>
absuite catalog relate-item-to-warranty-policy --TenantId $TENANT_ID --ItemId <item-guid> --WarrantyPolicyId <warranty-policy-guid>
absuite catalog remove-warranty-policy-from-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemWarrantyPolicyId <item-warranty-policy-guid>
absuite catalog get item-warranty-policies --TenantId $TENANT_ID --ItemId <item-guid>
absuite catalog count item-warranty-policies --TenantId $TENANT_ID --ItemId <item-guid>
```

## Google Categories (read-only taxonomy)

All reads are public; only `map-item-google-categories-tree` is a tenant-scoped write.

```powershell
absuite catalog get item-google-categories
absuite catalog get all-item-google-categories
absuite catalog get root-item-google-categories
absuite catalog get item-google-categories-count
absuite catalog get item-google-categories-tree
absuite catalog get item-google-category-by-id --ItemCategoryId <google-category-id>
absuite catalog get children-item-google-categories-by-id --ItemCategoryId <google-category-id>
absuite catalog map-item-google-categories-tree --TenantId $TENANT_ID
```

> Note: the Google-category-by-ID / children commands take `--ItemCategoryId`, not a separate Google-category parameter.

## Merchants (read-only)

```powershell
absuite catalog get merchants
absuite catalog get merchants-count
absuite catalog get merchant-by-id --MerchantId <merchant-guid>
```

## Critical Rules

- **Authenticate first.** Run `absuite login` before any catalog command.
- **Writes need a tenant.** Set `$TENANT_ID` via `absuite config set --tenant-id <guid>` or pass `--TenantId` on every create / update / delete / relate / remove.
- **Create taxonomy first.** Make categories, types, and brands before creating stock items that reference them.
- **Use `relate-*` commands** to link existing categories, tags, images, and policies to stock items; the `selected*` arrays on `CatalogItemCreateDto` link them inline at creation.
- **Types use `singularTitle`/`pluralTitle`; categories and tags use `title`.**
- **Use `--help`** on any command for the full DTO schema.

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List stock items | `absuite catalog get stock-items-query` |
| Count stock items | `absuite catalog count stock-items-by-business` |
| Get stock item | `absuite catalog get stock-item-by-id --ItemId <id>` |
| Get extended stock item | `absuite catalog get extended-stock-item-by-id --ItemId <id>` |
| Min / Max price | `absuite catalog get stock-items-odata-min-price` / `... max-price` |
| Create stock item | `absuite catalog create stock-item --CatalogItemCreateDto '{...}'` |
| Update stock item | `absuite catalog update stock-item --ItemId <id> --CatalogItemUpdateDto '{...}'` |
| Delete stock item | `absuite catalog delete stock-item --ItemId <id>` |
| Batch update items | `absuite catalog batch-update-stock-items --BatchStockItemUpdateRequest '{...}'` |
| Bulk upsert items | `absuite catalog bulk-upsert-stock-items --BulkProduct '[...]'` |
| Recalculate prices | `absuite catalog recalculate-stock-item-prices --RequestBody '[...]'` |
| Get / set primary image | `absuite catalog get product-primary-image --ItemId <id>` / `update product-primary-image` |
| List / count categories | `absuite catalog get item-categories` / `count item-categories` |
| Get / create / update / delete category | `absuite catalog get|create|update|delete item-category[-by-id]` |
| List / count types | `absuite catalog get item-types` / `count item-types` |
| Get / create / update / delete type | `absuite catalog get|create|update|delete item-type[-by-id] --ItemTypeID <id>` |
| List / count families | `absuite catalog get item-families` / `count item-families` |
| Get / create / update / delete family | `absuite catalog get|create|update|delete item-family[-by-id]` |
| List brands | `absuite catalog get item-brands` |
| Get / create / update / delete brand | `absuite catalog get|create|update|delete item-brand[-by-id]` |
| List tags | `absuite catalog get item-tags` |
| Get / create / update / delete tag | `absuite catalog get|create|update|delete item-tag[-by-id]` |
| List images | `absuite catalog get item-images` |
| Get / create / update / delete image | `absuite catalog get|create|update|delete item-image[-by-id]` |
| List attachments | `absuite catalog get item-attachments` |
| Get / create / update / delete attachment | `absuite catalog get|create|update|delete item-attachment[-by-id]` |
| List / count attributes | `absuite catalog get item-attributes` / `count item-attributes` |
| Get / create / update / delete attribute | `absuite catalog get|create|update|delete item-attribute[-by-id]` |
| List / count attribute options | `absuite catalog get item-attribute-options` / `get item-attribute-options-count` |
| Get / create / update / delete attribute option | `absuite catalog get|create|update|delete item-attribute-option[-by-id]` |
| List / count bundles | `absuite catalog get item-bundles` / `count item-bundles` |
| Get / create / update / delete bundle | `absuite catalog get|create|update|delete item-bundle[-by-id]` |
| List reviews (by item) | `absuite catalog get item-reviews --ItemId <id>` |
| Get / create / update / delete review | `absuite catalog get|create|update|delete item-review[-by-id]` |
| List questions | `absuite catalog get item-questions` |
| Get / create / update / delete question | `absuite catalog get|create|update|delete item-question[-by-id]` |
| Relate / remove brand on item | `absuite catalog relate-brand-to-stock-item` / `remove-brand-from-stock-item` |
| Relate / remove category on item | `absuite catalog relate-category-to-stock-item` / `remove-category-from-stock-item` |
| Relate / remove type on item | `absuite catalog relate-type-to-stock-item` / `remove-type-from-stock-item` |
| Relate / remove tag on item | `absuite catalog relate-tag-to-stock-item` / `remove-tag-from-stock-item` |
| Relate / remove image on item | `absuite catalog relate-image-to-stock-item` / `remove-image-from-stock-item` |
| Relate / remove attachment on item | `absuite catalog relate-attachment-to-stock-item` / `remove-attachment-from-stock-item` |
| Relate / remove attribute option on item | `absuite catalog relate-attribute-option-to-stock-item` / `remove-attribute-option-from-stock-item` |
| Relate / remove Google category on item | `absuite catalog relate-google-category-to-stock-item` / `remove-google-category-from-stock-item` |
| Relate / remove price rule on item | `absuite catalog relate-price-rule-to-stock-item` / `remove-price-rule-from-stock-item` |
| Relate / remove question on item | `absuite catalog relate-question-to-stock-item` / `remove-question-from-stock-item` |
| Relate / remove review on item | `absuite catalog relate-review-to-stock-item` / `remove-review-from-stock-item` |
| Relate / remove tax policy | `absuite catalog relate-item-to-tax-policy` / `remove-tax-policy-from-item` |
| Relate / remove shipping policy | `absuite catalog relate-item-to-shipping-policy` / `remove-shipping-policy-from-item` |
| Relate / remove return policy | `absuite catalog relate-item-to-return-policy` / `remove-return-policy-from-item` |
| Relate / remove refund policy | `absuite catalog relate-item-to-refund-policy` / `remove-refund-policy-from-item` |
| Relate / remove warranty policy | `absuite catalog relate-item-to-warranty-policy` / `remove-warranty-policy-from-item` |
| List / count policy links | `absuite catalog get item-<kind>-policies` / `count item-<kind>-policies` |
| Google categories (read) | `absuite catalog get item-google-categories` / `all-...` / `root-...` / `...-tree` / `...-count` |
| Map Google category tree | `absuite catalog map-item-google-categories-tree` |
| List / count merchants | `absuite catalog get merchants` / `get merchants-count` |
| Get merchant | `absuite catalog get merchant-by-id --MerchantId <id>` |
