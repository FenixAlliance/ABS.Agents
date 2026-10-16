---
name: absuite-catalog
description: >
  Manage the product catalog in the Alliance Business Suite (ABS) via the REST API.
  Covers stock items (products), categories, types, families, brands, tags, images,
  attachments, attributes & options, bundles, reviews, questions, policy
  relationships (tax / shipping / return / refund / warranty), price-rule
  relationships, Google categories, and merchants — including atomic PATCH (JSON
  Patch) updates. Catalog reads are public by default and scope to a tenant when a
  tenantId is supplied; writes require a tenantId and a bearer token (see the
  absuite-login skill to authenticate).
---

# Alliance Business Suite — Catalog Skill (REST)

Manage the product catalog through the `CatalogService` REST API. In ABS, **Items = Catalog Items = Stock Items = Products** — they are the same aggregate. Most catalog **read** endpoints are public/global (tenant is **optional** — omit it for the global/public catalog, supply it to scope to a tenant), while every **write** endpoint **requires** a tenant.

> For the CLI equivalent see `absuite-catalog-cli`; for general REST conventions see `absuite-rest`.

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

Extract `accessToken` from the JSON response and export it:

```bash
export ABSUITE_ACCESS_TOKEN="<access-token>"
```

2. **Send the token on every request:**

```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/CatalogService/<Resource>`

4. **Response envelope** — every response is wrapped:

```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "<id>",
  "timestamp": "<iso-8601>",
  "result": { }
}
```

Always check `isSuccess`; read the payload from `result`.

## Tenant scoping

Tenant binding is **per endpoint** — follow each operation below:

- **Reads** (`GET`) on the primary catalog resources accept `tenantId` as **optional**. Omit it to query the global/public catalog; add `?tenantId=<tenant-guid>` to scope to a tenant.
- **Writes** (`POST` / `PUT` / `PATCH` / `DELETE`) **require** `?tenantId=<tenant-guid>`. Omitting it on a write returns `400`.
- A few read groups are **not** tenant-scoped at all — `ItemGoogleCategories` (all reads), `Merchants` (all), and several `Items/{itemId}/...` sub-resource reads take **no** tenantId. Do not add one where it is not listed.
- The platform binds tenant from `?tenantId=` **or** the `X-TenantId` request header interchangeably; examples below prefer the query param.

## Key Concepts

- **Stock Item (Product)** — the central aggregate (`CatalogItemCreateDto` / `CatalogItemUpdateDto`). Carries identifiers (`sku`, `upc`, `ean`, `gtin`, `mpn`, `isbn`, `asin`, `unspsc`), pricing (`regularPrice`, `discountPrice`, `currencyId`), inventory (`currentStock`, `manageInventory`, `inStock`), and merchandising flags (`featured`, `onSale`, `hot`, `published`, `taxable`).
- **Taxonomy** — `ItemCategories` (hierarchical, `parentItemCategoryId`), `ItemTypes` (linked to a category via `itemCategoryId`), `ItemFamilies`, `ItemBrands`, `ItemTags`, and `ItemGoogleCategories` (read-only Google product taxonomy).
- **Attributes** — `ItemAttributes` (e.g. "Color") own `ItemAttributeOptions` (e.g. "Red") via `itemAttributeId`.
- **Media & docs** — `ItemImages`, `ItemAttachments`.
- **Engagement** — `ItemReviews` (`reviewScore`, `reviewMessage`), `ItemQuestions` (`question`, `needsRevision`).
- **Bundles** — `ItemBundles` group items.
- **Policy relationships** — items are related to tax / shipping / return / refund / warranty policies, and to price rules. These relationships live both under `/Items/{itemId}/...` paths and as standalone `Item<Kind>Policies` query-scoped resources.
- **Merchants** — read-only merchant directory.
- **Selected* arrays** — on create/update, link sub-resources in one shot via `selectedCategories`, `selectedTags`, `selectedBrands`, `selectedTypes`, `selectedTaxPolicies`, `selectedShipmentPolicies`, `selectedReturnPolicies`, `selectedRefundPolicies`, `selectedWarrantyPolicies`, `selectedPricingRules`, `selectedGoogleCategories`, `selectedAttributesOptions`, `selectedSellingMarginPolicies`, `selectedPricingPolicies` (all `array<string>` of IDs).

---

## Stock Items (Products)

### List stock items

`tenantId` optional — omit for the global/public catalog, supply to scope.

```bash
# Global / public catalog
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Scoped to a tenant
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count stock items

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Min / Max price (`tenantId` optional)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/MinPrice?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/MaxPrice?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get stock item by ID (no tenantId param)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get extended stock item (with related data; no tenantId param)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create stock item — `CatalogItemCreateDto` (tenantId required)

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
    "languageId": "<language-guid>",
    "unitId": "<unit-guid>",
    "inStock": true,
    "published": true,
    "taxable": true,
    "manageInventory": true,
    "currentStock": 100.0,
    "weight": 0.5,
    "width": 10.0,
    "height": 5.0,
    "length": 8.0,
    "featured": false,
    "onSale": false,
    "selectedCategories": ["<category-guid>"],
    "selectedTags": ["<tag-guid>"],
    "selectedTaxPolicies": ["<tax-policy-guid>"]
  }'
```

**Key `CatalogItemCreateDto` fields** (full list in the manifest — all optional unless noted):

| Field | Type | Description |
|---|---|---|
| `name` | string | Product name |
| `title` | string | Display title |
| `sku` / `upc` / `ean` / `gtin` / `mpn` / `isbn` / `asin` / `unspsc` | string | Product identifiers |
| `regularPrice` | number | Base price |
| `discountPrice` | number | Sale price |
| `currencyId` | string | Currency |
| `categoryId` | string | Primary category |
| `itemTypeId` | string | Item type |
| `brandId` | string | Brand |
| `languageId` / `unitId` / `unitGroupId` | string | Localization / units |
| `inStock` / `published` / `taxable` | boolean | Availability flags |
| `manageInventory` | boolean | Track stock levels |
| `currentStock` | number | Quantity on hand |
| `weight` / `width` / `height` / `length` | number | Dimensions |
| `primaryImageUrl` | string | Main product image URL |
| `featured` / `onSale` / `hot` / `trending` | boolean | Merchandising flags |
| `digital` / `byRequest` / `preSale` / `auction` | boolean | Item nature flags |
| `supplierProfileId` / `supplierCode` | string | Supplier link |
| `selectedCategories` / `selectedTags` / `selectedBrands` / `selectedTypes` | array&lt;string&gt; | Linked sub-resource IDs |
| `selectedTaxPolicies` / `selectedShipmentPolicies` / `selectedReturnPolicies` / `selectedRefundPolicies` / `selectedWarrantyPolicies` | array&lt;string&gt; | Linked policy IDs |
| `selectedPricingRules` / `selectedGoogleCategories` / `selectedAttributesOptions` | array&lt;string&gt; | Linked rule / taxonomy / attribute-option IDs |

### Update stock item (PUT) — `CatalogItemUpdateDto` (tenantId required)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<product-name>",
    "regularPrice": 59.99,
    "onSale": true,
    "discountPrice": 49.99,
    "published": true
  }'
```

### Patch stock item (PATCH, JSON Patch) — tenantId required

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/regularPrice", "value": 59.99 },
    { "op": "replace", "path": "/onSale", "value": true },
    { "op": "replace", "path": "/published", "value": true }
  ]'
```

See the [PATCH (JSON Patch) section](#patch-json-patch) for details.

### Delete stock item (tenantId required)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Batch update stock items — `BatchStockItemUpdateRequest` (tenantId required)

Bulk-toggle flags and add/remove tax policies across many items.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/Batch?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemIds": ["<item-guid>", "<item-guid>"],
    "published": true,
    "taxable": true,
    "addTaxPolicyIds": ["<tax-policy-guid>"],
    "removeTaxPolicyIds": ["<tax-policy-guid>"]
  }'
```

### Bulk upsert stock items — array of `BulkProduct` (tenantId required)

Import/upsert products from flat rows (string-keyed brand / currency / supplier etc., resolved server-side).

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/BulkUpsert?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "sku": "<sku>",
      "title": "<product-name>",
      "type": "<type-name>",
      "brand": "<brand-name>",
      "currency": "<currency-code>",
      "supplier": "<supplier-name>",
      "supplierCode": "<supplier-code>",
      "googleCategory": "<google-category>",
      "shippingCountry": "<country>",
      "regularPrice": 49.99,
      "discountPercentage": 10,
      "currentStock": 100,
      "taxable": true,
      "inStock": true,
      "manageInventory": true
    }
  ]'
```

### Recalculate prices — array of item IDs (tenantId required)

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/RecalculatePrices?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '["<item-guid>", "<item-guid>"]'
```

### Primary image (sub-resource)

```bash
# Get primary image (no tenantId param)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Images/Primary" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Set primary image (tenantId optional)
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Images/Primary?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Item Categories

`ItemCategoryCreateDto` requires `title`; reads take `tenantId` optional, writes required.

```bash
# List (tenantId optional)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count (tenantId optional)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID (tenantId optional)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (tenantId required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<category-title>",
    "description": "<description>",
    "imageURL": "<image-url>",
    "parentItemCategoryId": "<parent-category-guid>"
  }'

# Update (PUT, tenantId required)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<category-title>",
    "description": "<description>",
    "isFeatured": true,
    "enableForProducts": true,
    "enableForServices": false
  }'

# Patch (tenantId required)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/title", "value": "<new-title>" } ]'

# Delete (tenantId required)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`ItemCategoryUpdateDto` adds `isFeatured`, `enableForCourses`, `enableForProducts`, `enableForLicenses`, `enableForServices`, `enableForSubscriptions` (all boolean).

---

## Item Types

`ItemTypeCreateDto` requires `itemCategoryId`; `ItemTypeUpdateDto` requires `singularTitle`. (Types use `singularTitle` / `pluralTitle`, **not** `name`.)

```bash
# List (tenantId optional)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count (tenantId optional)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID (tenantId optional)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (tenantId required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "singularTitle": "<singular-title>",
    "pluralTitle": "<plural-title>",
    "description": "<description>",
    "itemCategoryId": "<category-guid>",
    "itemGoogleCategoryId": "<google-category-guid>",
    "googleCategoryTaxonomy": "<taxonomy-path>"
  }'

# Update (PUT, tenantId required) — singularTitle required
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "singularTitle": "<singular-title>", "pluralTitle": "<plural-title>", "description": "<description>" }'

# Patch (tenantId required)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/singularTitle", "value": "<new-title>" } ]'

# Delete (tenantId required)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

> Note: the type-by-ID path parameter is spelled `itemTypeID` in the manifest.

---

## Item Families

`ItemFamilyCreateDto` / `ItemFamilyUpdateDto` require `name`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies/<family-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<family-name>", "code": "<code>", "description": "<description>" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies/<family-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<family-name>", "code": "<code>", "description": "<description>" }'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies/<family-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/name", "value": "<new-name>" } ]'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies/<family-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Item Brands

`ItemBrandCreateDto` / `ItemBrandUpdateDto` require `name`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBrands" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBrands/<brand-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBrands?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<brand-name>", "code": "<code>", "description": "<description>", "websiteURL": "<url>", "featured": false, "trending": false }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBrands/<brand-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<brand-name>", "description": "<description>", "websiteURL": "<url>", "logoURL": "<logo-url>", "featured": false, "trending": false }'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBrands/<brand-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/featured", "value": true } ]'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBrands/<brand-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

> Note: `ItemBrands` has **no** standalone `Count` endpoint.

---

## Item Tags

`ItemTagCreateDto` / `ItemTagUpdateDto` require `title` (tags use `title`, **not** `name`).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTags?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "<tag-title>", "description": "<description>" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "<tag-title>", "description": "<description>" }'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/title", "value": "<new-title>" } ]'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

> Note: `ItemTags` has **no** standalone `Count` endpoint — to count tags on an item use `/Items/{itemId}/Tags/Count`.

---

## Item Images

`ItemImageCreateDto` requires `fileName`; `ItemImageUpdateDto` requires `itemId`, `mD5Hash`, `fileUploadURL`, `fileName`, `contentType`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemImages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemImages/<image-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemImages?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "<item-guid>",
    "fileName": "<file-name>",
    "fileUploadURL": "<upload-url>",
    "title": "<title>",
    "contentType": "image/jpeg",
    "isItemMozaicBG": false
  }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemImages/<image-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "<item-guid>",
    "mD5Hash": "<md5>",
    "fileUploadURL": "<upload-url>",
    "fileName": "<file-name>",
    "contentType": "image/jpeg"
  }'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemImages/<image-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/title", "value": "<new-title>" } ]'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemImages/<image-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Item Attachments

`ItemAttachmentCreateDto` / `ItemAttachmentUpdateDto` have no required fields beyond what you choose to set.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttachments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "<title>", "fileName": "<file-name>", "filePath": "<file-path>", "itemId": "<item-guid>" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttachments/<attachment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "<title>", "fileName": "<file-name>", "filePath": "<file-path>" }'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttachments/<attachment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/title", "value": "<new-title>" } ]'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttachments/<attachment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

> Note: `ItemAttachments` has **no** standalone `Count` endpoint.

---

## Item Attributes

`ItemAttributeCreateDto` / `ItemAttributeUpdateDto` require `name`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes/<attr-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<attribute-name>", "description": "<description>" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes/<attr-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<attribute-name>", "description": "<description>" }'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes/<attr-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/name", "value": "<new-name>" } ]'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes/<attr-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Item Attribute Options

`ItemAttributeOptionCreateDto` requires `name` and `itemAttributeId`; `ItemAttributeOptionUpdateDto` requires `name`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<option-name>", "description": "<description>", "itemAttributeId": "<attr-guid>" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions/<option-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<option-name>", "description": "<description>" }'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions/<option-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/name", "value": "<new-name>" } ]'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions/<option-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Item Bundles

`ItemBundleCreateDto` / `ItemBundleUpdateDto` require `name`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles/<bundle-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<bundle-name>", "code": "<code>", "description": "<description>", "disabled": false }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles/<bundle-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "<bundle-name>", "code": "<code>", "description": "<description>", "disabled": false }'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles/<bundle-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/disabled", "value": true } ]'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles/<bundle-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Item Reviews

List reviews requires `itemId` (query, required); create requires `tenantId`. `ItemReviewUpdateDto` carries `reviewScore`, `reviewMessage`.

```bash
# List reviews for an item (itemId required, no tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemReviews?itemId=<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID (tenantId optional)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemReviews/<review-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (tenantId required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemReviews?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "itemId": "<item-guid>", "reviewScore": 5, "reviewMessage": "<message>" }'

# Update (PUT, tenantId required)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemReviews/<review-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "reviewScore": 4, "reviewMessage": "<message>" }'

# Patch (tenantId required)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemReviews/<review-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/reviewScore", "value": 4 } ]'

# Delete (tenantId required)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemReviews/<review-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Item Questions

`ItemQuestionCreateDto` requires `title`, `needsRevision`, `question`, `itemId`; `ItemQuestionUpdateDto` requires `needsRevision`.

```bash
# List (tenantId optional)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemQuestions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID (tenantId optional)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemQuestions/<question-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (tenantId required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemQuestions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "<title>", "needsRevision": true, "question": "<question>", "itemId": "<item-guid>" }'

# Update (PUT, tenantId required) — needsRevision required
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemQuestions/<question-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "<title>", "needsRevision": false, "question": "<question>" }'

# Patch (tenantId required)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemQuestions/<question-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/needsRevision", "value": false } ]'

# Delete (tenantId required)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemQuestions/<question-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Stock-item sub-resources (relate / list / get / remove)

Each of these collections hangs off `/Items/{itemId}/...`. **List** and **get-by-ID** of a sub-resource take **no** tenantId param; **relate** (`POST`) and **remove** (`DELETE`) require `tenantId` (a few exceptions noted below).

### Brands

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Brands" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Brands/<brand-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Brands/<brand-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Brands/<brand-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Categories

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Categories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Categories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Categories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Types (relate existing item types to an item)

`Types` list / get / relate / remove all require `tenantId`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Types?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Types/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Types/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Types/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Tags (list / get / relate / remove + count all require `tenantId`)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Tags?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Tags/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Tags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Tags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Tags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Images

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Images" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Images/<image-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Images/<image-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Images/<image-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Attachments

The relate `POST` accepts an `ItemAttachmentCreateDto` body; relate/remove require `tenantId`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Attachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Attachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Attachments/<attachment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "<title>", "fileName": "<file-name>", "filePath": "<file-path>", "itemId": "<item-guid>" }'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Attachments/<attachment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Attribute Options (relate/remove take **no** tenantId)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/AttributeOptions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/AttributeOptions/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/AttributeOptions/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/AttributeOptions/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Google Categories

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/GoogleCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/GoogleCategories/<google-category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/GoogleCategories/<google-category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/GoogleCategories/<google-category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Price Rules (item-scoped relate/get/remove take **no** tenantId)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/PriceRules" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/PriceRules/<price-rule-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/PriceRules/<price-rule-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/PriceRules/<price-rule-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Questions (sub-resource — relate `POST` takes `ItemQuestionRecordCreateDto`)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Questions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Questions/<question-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Questions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "<title>", "needsRevision": true, "question": "<question>" }'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Questions/<question-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Reviews (sub-resource — relate `POST` takes `ItemReviewRecordCreateDto`)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Reviews" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Reviews/<review-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Reviews?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "reviewScore": 5, "reviewMessage": "<message>" }'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Reviews/<review-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Policy sub-resources (Tax / Shipping / Return / Refund / Warranty)

The same shape applies to each policy kind. **List** and **get-by-ID** take **no** tenantId; **relate** (`POST`) and **remove** (`DELETE`) require `tenantId`. Replace `TaxPolicies`/`itemTaxPolicyId` with the matching segment for each kind:

| Kind | Collection segment | Item-link path param |
|---|---|---|
| Tax | `TaxPolicies` | `itemTaxPolicyId` |
| Shipping | `ShippingPolicies` | `itemShippingPolicyId` |
| Return | `ReturnPolicies` | `itemReturnPolicyId` |
| Refund | `RefundPolicies` | `itemRefundPolicyId` |
| Warranty | `WarrantyPolicies` | `itemWarrantyPolicyId` |

```bash
# List item's tax policies (no tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/TaxPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Get one (no tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/TaxPolicies/<item-tax-policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Relate (tenantId required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/TaxPolicies/<item-tax-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Remove (tenantId required)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/TaxPolicies/<item-tax-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Standalone policy-relationship resources

In addition to the item-scoped paths above, each policy kind has a top-level resource where **relate** and **remove** pass `itemId` and the policy ID as **query parameters** (not path segments). Reads take `tenantId` and `itemId` as optional filters; writes require `tenantId`, `itemId`, and the policy ID.

Resources: `ItemTaxPolicies`, `ItemShippingPolicies`, `ItemReturnPolicies`, `ItemRefundPolicies`, `ItemWarrantyPolicies`.

```bash
# List (filter by tenantId and/or itemId — both optional)
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTaxPolicies?tenantId=<tenant-guid>&itemId=<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTaxPolicies/Count?tenantId=<tenant-guid>&itemId=<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get the link record by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTaxPolicies/<item-tax-policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Relate item -> tax policy (tenantId, itemId, taxPolicyId all required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTaxPolicies?tenantId=<tenant-guid>&itemId=<item-guid>&taxPolicyId=<tax-policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Remove
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTaxPolicies/<item-tax-policy-guid>?tenantId=<tenant-guid>&itemId=<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

The relate query-param name differs per kind: `taxPolicyId`, `shippingPolicyId`, `returnPolicyId`, `refundPolicyId`, `warrantyPolicyId`.

---

## Google Categories (read-only taxonomy — no tenantId)

All `ItemGoogleCategories` reads are public (no tenantId). Only the `tree` map operation (`POST`) is a tenant-scoped write.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# All
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/All" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Root / primary
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/Primary" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Tree
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/tree" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# By ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/<google-category-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Children
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/<google-category-id>/Children" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Map the tree (tenantId required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/tree?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Merchants (read-only — no tenantId)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Merchants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Merchants/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Merchants/<merchant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## PATCH (JSON Patch)

PATCH endpoints accept a JSON **array** of [RFC 6902](https://datatracker.ietf.org/doc/html/rfc6902) operations and **require** `?tenantId=<tenant-guid>`. Use PATCH for atomic partial updates — change a couple of fields without resending the whole object (safer than PUT under concurrent edits).

- `op` ∈ `add` | `remove` | `replace` | `move` | `copy` | `test`
- `path` / `from` are JSON Pointers (leading `/`, camelCase field name)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/regularPrice", "value": 79.99 },
    { "op": "replace", "path": "/discountPrice", "value": 69.99 },
    { "op": "replace", "path": "/onSale", "value": true },
    { "op": "test",    "path": "/published",   "value": true }
  ]'
```

**Sub-resources that also support PATCH:** `ItemAttachments`, `ItemAttributeOptions`, `ItemAttributes`, `ItemBrands`, `ItemBundles`, `ItemCategories`, `ItemFamilies`, `ItemImages`, `ItemQuestions`, `ItemReviews`, `ItemTags`, `ItemTypes`, and `Items` itself. (Standalone policy-link resources, Google categories, and merchants do **not** expose PATCH.)

---

## End-to-end workflow

Build a sellable product from scratch (all writes carry `?tenantId=<tenant-guid>`):

```bash
TENANT="<tenant-guid>"

# 1. Create a category
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "<category-title>" }'
# -> capture result.id as CATEGORY_ID

# 2. Create a type under that category
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "singularTitle": "<type>", "pluralTitle": "<types>", "itemCategoryId": "<category-guid>" }'
# -> capture result.id as TYPE_ID

# 3. Create a brand
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBrands?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "<brand-name>" }'
# -> capture result.id as BRAND_ID

# 4. Create the stock item, linking category/type/brand inline
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "name": "<product-name>",
    "title": "<display-title>",
    "regularPrice": 49.99,
    "currencyId": "<currency-guid>",
    "categoryId": "<category-guid>",
    "itemTypeId": "<type-guid>",
    "brandId": "<brand-guid>",
    "inStock": true,
    "published": false,
    "manageInventory": true,
    "currentStock": 100.0
  }'
# -> capture result.id as ITEM_ID

# 5. Attach an image and a tax policy via sub-resource relates
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Images/<image-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/TaxPolicies/<item-tax-policy-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 6. Recalculate prices
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/RecalculatePrices?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '["<item-guid>"]'

# 7. Publish atomically with PATCH
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/published", "value": true } ]'
```

---

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| List stock items | GET | `/api/v2/CatalogService/Items` |
| Count stock items | GET | `/api/v2/CatalogService/Items/Count` |
| Min price | GET | `/api/v2/CatalogService/Items/MinPrice` |
| Max price | GET | `/api/v2/CatalogService/Items/MaxPrice` |
| Get stock item | GET | `/api/v2/CatalogService/Items/{itemId}` |
| Get extended stock item | GET | `/api/v2/CatalogService/Items/{itemId}/Extended` |
| Create stock item | POST | `/api/v2/CatalogService/Items` |
| Update stock item | PUT | `/api/v2/CatalogService/Items/{itemId}` |
| Patch stock item | PATCH | `/api/v2/CatalogService/Items/{itemId}` |
| Delete stock item | DELETE | `/api/v2/CatalogService/Items/{itemId}` |
| Batch update items | POST | `/api/v2/CatalogService/Items/Batch` |
| Bulk upsert items | POST | `/api/v2/CatalogService/Items/BulkUpsert` |
| Recalculate prices | POST | `/api/v2/CatalogService/Items/RecalculatePrices` |
| Get primary image | GET | `/api/v2/CatalogService/Items/{itemId}/Images/Primary` |
| Set primary image | POST | `/api/v2/CatalogService/Items/{itemId}/Images/Primary` |
| List item brands | GET | `/api/v2/CatalogService/Items/{itemId}/Brands` |
| Get item brand | GET | `/api/v2/CatalogService/Items/{itemId}/Brands/{itemBrandId}` |
| Relate brand | POST | `/api/v2/CatalogService/Items/{itemId}/Brands/{itemBrandId}` |
| Remove brand | DELETE | `/api/v2/CatalogService/Items/{itemId}/Brands/{itemBrandId}` |
| List item categories | GET | `/api/v2/CatalogService/Items/{itemId}/Categories` |
| Get item category | GET | `/api/v2/CatalogService/Items/{itemId}/Categories/{itemCategoryId}` |
| Relate category | POST | `/api/v2/CatalogService/Items/{itemId}/Categories/{itemCategoryId}` |
| Remove category | DELETE | `/api/v2/CatalogService/Items/{itemId}/Categories/{itemCategoryId}` |
| List item types | GET | `/api/v2/CatalogService/Items/{itemId}/Types` |
| Get item type | GET | `/api/v2/CatalogService/Items/{itemId}/Types/{itemTypeId}` |
| Relate type | POST | `/api/v2/CatalogService/Items/{itemId}/Types/{itemTypeId}` |
| Remove type | DELETE | `/api/v2/CatalogService/Items/{itemId}/Types/{itemTypeId}` |
| List item tags | GET | `/api/v2/CatalogService/Items/{itemId}/Tags` |
| Count item tags | GET | `/api/v2/CatalogService/Items/{itemId}/Tags/Count` |
| Get item tag | GET | `/api/v2/CatalogService/Items/{itemId}/Tags/{itemTagId}` |
| Relate tag | POST | `/api/v2/CatalogService/Items/{itemId}/Tags/{itemTagId}` |
| Remove tag | DELETE | `/api/v2/CatalogService/Items/{itemId}/Tags/{itemTagId}` |
| List item images | GET | `/api/v2/CatalogService/Items/{itemId}/Images` |
| Get item image | GET | `/api/v2/CatalogService/Items/{itemId}/Images/{itemImageId}` |
| Relate image | POST | `/api/v2/CatalogService/Items/{itemId}/Images/{itemImageId}` |
| Remove image | DELETE | `/api/v2/CatalogService/Items/{itemId}/Images/{itemImageId}` |
| List item attachments | GET | `/api/v2/CatalogService/Items/{itemId}/Attachments` |
| Get item attachment | GET | `/api/v2/CatalogService/Items/{itemId}/Attachments/{itemAttachmentId}` |
| Relate attachment | POST | `/api/v2/CatalogService/Items/{itemId}/Attachments/{itemAttachmentId}` |
| Remove attachment | DELETE | `/api/v2/CatalogService/Items/{itemId}/Attachments/{itemAttachmentId}` |
| List item attribute options | GET | `/api/v2/CatalogService/Items/{itemId}/AttributeOptions` |
| Get item attribute option | GET | `/api/v2/CatalogService/Items/{itemId}/AttributeOptions/{itemAttributeOptionId}` |
| Relate attribute option | POST | `/api/v2/CatalogService/Items/{itemId}/AttributeOptions/{itemAttributeOptionId}` |
| Remove attribute option | DELETE | `/api/v2/CatalogService/Items/{itemId}/AttributeOptions/{itemAttributeOptionId}` |
| List item Google categories | GET | `/api/v2/CatalogService/Items/{itemId}/GoogleCategories` |
| Get item Google category | GET | `/api/v2/CatalogService/Items/{itemId}/GoogleCategories/{itemGoogleCategoryId}` |
| Relate Google category | POST | `/api/v2/CatalogService/Items/{itemId}/GoogleCategories/{itemGoogleCategoryId}` |
| Remove Google category | DELETE | `/api/v2/CatalogService/Items/{itemId}/GoogleCategories/{itemGoogleCategoryId}` |
| List item price rules | GET | `/api/v2/CatalogService/Items/{itemId}/PriceRules` |
| Get item price rule | GET | `/api/v2/CatalogService/Items/{itemId}/PriceRules/{itemPriceRuleId}` |
| Relate price rule | POST | `/api/v2/CatalogService/Items/{itemId}/PriceRules/{itemPriceRuleId}` |
| Remove price rule | DELETE | `/api/v2/CatalogService/Items/{itemId}/PriceRules/{itemPriceRuleId}` |
| List item questions | GET | `/api/v2/CatalogService/Items/{itemId}/Questions` |
| Get item question | GET | `/api/v2/CatalogService/Items/{itemId}/Questions/{itemQuestionId}` |
| Create question for item | POST | `/api/v2/CatalogService/Items/{itemId}/Questions` |
| Remove question | DELETE | `/api/v2/CatalogService/Items/{itemId}/Questions/{itemQuestionId}` |
| List item reviews | GET | `/api/v2/CatalogService/Items/{itemId}/Reviews` |
| Get item review | GET | `/api/v2/CatalogService/Items/{itemId}/Reviews/{itemReviewId}` |
| Create review for item | POST | `/api/v2/CatalogService/Items/{itemId}/Reviews` |
| Remove review | DELETE | `/api/v2/CatalogService/Items/{itemId}/Reviews/{itemReviewId}` |
| List item tax policies | GET | `/api/v2/CatalogService/Items/{itemId}/TaxPolicies` |
| Get item tax policy | GET | `/api/v2/CatalogService/Items/{itemId}/TaxPolicies/{itemTaxPolicyId}` |
| Relate tax policy | POST | `/api/v2/CatalogService/Items/{itemId}/TaxPolicies/{itemTaxPolicyId}` |
| Remove tax policy | DELETE | `/api/v2/CatalogService/Items/{itemId}/TaxPolicies/{itemTaxPolicyId}` |
| List item shipping policies | GET | `/api/v2/CatalogService/Items/{itemId}/ShippingPolicies` |
| Get item shipping policy | GET | `/api/v2/CatalogService/Items/{itemId}/ShippingPolicies/{itemShippingPolicyId}` |
| Relate shipping policy | POST | `/api/v2/CatalogService/Items/{itemId}/ShippingPolicies/{itemShippingPolicyId}` |
| Remove shipping policy | DELETE | `/api/v2/CatalogService/Items/{itemId}/ShippingPolicies/{itemShippingPolicyId}` |
| List item return policies | GET | `/api/v2/CatalogService/Items/{itemId}/ReturnPolicies` |
| Get item return policy | GET | `/api/v2/CatalogService/Items/{itemId}/ReturnPolicies/{itemReturnPolicyId}` |
| Relate return policy | POST | `/api/v2/CatalogService/Items/{itemId}/ReturnPolicies/{itemReturnPolicyId}` |
| Remove return policy | DELETE | `/api/v2/CatalogService/Items/{itemId}/ReturnPolicies/{itemReturnPolicyId}` |
| List item refund policies | GET | `/api/v2/CatalogService/Items/{itemId}/RefundPolicies` |
| Get item refund policy | GET | `/api/v2/CatalogService/Items/{itemId}/RefundPolicies/{itemRefundPolicyId}` |
| Relate refund policy | POST | `/api/v2/CatalogService/Items/{itemId}/RefundPolicies/{itemRefundPolicyId}` |
| Remove refund policy | DELETE | `/api/v2/CatalogService/Items/{itemId}/RefundPolicies/{itemRefundPolicyId}` |
| List item warranty policies | GET | `/api/v2/CatalogService/Items/{itemId}/WarrantyPolicies` |
| Get item warranty policy | GET | `/api/v2/CatalogService/Items/{itemId}/WarrantyPolicies/{itemWarrantyPolicyId}` |
| Relate warranty policy | POST | `/api/v2/CatalogService/Items/{itemId}/WarrantyPolicies/{itemWarrantyPolicyId}` |
| Remove warranty policy | DELETE | `/api/v2/CatalogService/Items/{itemId}/WarrantyPolicies/{itemWarrantyPolicyId}` |
| List categories | GET | `/api/v2/CatalogService/ItemCategories` |
| Count categories | GET | `/api/v2/CatalogService/ItemCategories/Count` |
| Get category | GET | `/api/v2/CatalogService/ItemCategories/{itemCategoryId}` |
| Create category | POST | `/api/v2/CatalogService/ItemCategories` |
| Update category | PUT | `/api/v2/CatalogService/ItemCategories/{itemCategoryId}` |
| Patch category | PATCH | `/api/v2/CatalogService/ItemCategories/{itemCategoryId}` |
| Delete category | DELETE | `/api/v2/CatalogService/ItemCategories/{itemCategoryId}` |
| List types | GET | `/api/v2/CatalogService/ItemTypes` |
| Count types | GET | `/api/v2/CatalogService/ItemTypes/Count` |
| Get type | GET | `/api/v2/CatalogService/ItemTypes/{itemTypeID}` |
| Create type | POST | `/api/v2/CatalogService/ItemTypes` |
| Update type | PUT | `/api/v2/CatalogService/ItemTypes/{itemTypeID}` |
| Patch type | PATCH | `/api/v2/CatalogService/ItemTypes/{itemTypeID}` |
| Delete type | DELETE | `/api/v2/CatalogService/ItemTypes/{itemTypeID}` |
| List families | GET | `/api/v2/CatalogService/ItemFamilies` |
| Count families | GET | `/api/v2/CatalogService/ItemFamilies/Count` |
| Get family | GET | `/api/v2/CatalogService/ItemFamilies/{itemFamilyId}` |
| Create family | POST | `/api/v2/CatalogService/ItemFamilies` |
| Update family | PUT | `/api/v2/CatalogService/ItemFamilies/{itemFamilyId}` |
| Patch family | PATCH | `/api/v2/CatalogService/ItemFamilies/{itemFamilyId}` |
| Delete family | DELETE | `/api/v2/CatalogService/ItemFamilies/{itemFamilyId}` |
| List brands | GET | `/api/v2/CatalogService/ItemBrands` |
| Get brand | GET | `/api/v2/CatalogService/ItemBrands/{itemBrandId}` |
| Create brand | POST | `/api/v2/CatalogService/ItemBrands` |
| Update brand | PUT | `/api/v2/CatalogService/ItemBrands/{itemBrandId}` |
| Patch brand | PATCH | `/api/v2/CatalogService/ItemBrands/{itemBrandId}` |
| Delete brand | DELETE | `/api/v2/CatalogService/ItemBrands/{itemBrandId}` |
| List tags | GET | `/api/v2/CatalogService/ItemTags` |
| Get tag | GET | `/api/v2/CatalogService/ItemTags/{itemTagId}` |
| Create tag | POST | `/api/v2/CatalogService/ItemTags` |
| Update tag | PUT | `/api/v2/CatalogService/ItemTags/{itemTagId}` |
| Patch tag | PATCH | `/api/v2/CatalogService/ItemTags/{itemTagId}` |
| Delete tag | DELETE | `/api/v2/CatalogService/ItemTags/{itemTagId}` |
| List images | GET | `/api/v2/CatalogService/ItemImages` |
| Get image | GET | `/api/v2/CatalogService/ItemImages/{itemImageId}` |
| Create image | POST | `/api/v2/CatalogService/ItemImages` |
| Update image | PUT | `/api/v2/CatalogService/ItemImages/{itemImageId}` |
| Patch image | PATCH | `/api/v2/CatalogService/ItemImages/{itemImageId}` |
| Delete image | DELETE | `/api/v2/CatalogService/ItemImages/{itemImageId}` |
| List attachments | GET | `/api/v2/CatalogService/ItemAttachments` |
| Get attachment | GET | `/api/v2/CatalogService/ItemAttachments/{itemAttachmentId}` |
| Create attachment | POST | `/api/v2/CatalogService/ItemAttachments` |
| Update attachment | PUT | `/api/v2/CatalogService/ItemAttachments/{itemAttachmentId}` |
| Patch attachment | PATCH | `/api/v2/CatalogService/ItemAttachments/{itemAttachmentId}` |
| Delete attachment | DELETE | `/api/v2/CatalogService/ItemAttachments/{itemAttachmentId}` |
| List attributes | GET | `/api/v2/CatalogService/ItemAttributes` |
| Count attributes | GET | `/api/v2/CatalogService/ItemAttributes/Count` |
| Get attribute | GET | `/api/v2/CatalogService/ItemAttributes/{itemAttributeId}` |
| Create attribute | POST | `/api/v2/CatalogService/ItemAttributes` |
| Update attribute | PUT | `/api/v2/CatalogService/ItemAttributes/{itemAttributeId}` |
| Patch attribute | PATCH | `/api/v2/CatalogService/ItemAttributes/{itemAttributeId}` |
| Delete attribute | DELETE | `/api/v2/CatalogService/ItemAttributes/{itemAttributeId}` |
| List attribute options | GET | `/api/v2/CatalogService/ItemAttributeOptions` |
| Count attribute options | GET | `/api/v2/CatalogService/ItemAttributeOptions/Count` |
| Get attribute option | GET | `/api/v2/CatalogService/ItemAttributeOptions/{itemAttributeOptionId}` |
| Create attribute option | POST | `/api/v2/CatalogService/ItemAttributeOptions` |
| Update attribute option | PUT | `/api/v2/CatalogService/ItemAttributeOptions/{itemAttributeOptionId}` |
| Patch attribute option | PATCH | `/api/v2/CatalogService/ItemAttributeOptions/{itemAttributeOptionId}` |
| Delete attribute option | DELETE | `/api/v2/CatalogService/ItemAttributeOptions/{itemAttributeOptionId}` |
| List bundles | GET | `/api/v2/CatalogService/ItemBundles` |
| Count bundles | GET | `/api/v2/CatalogService/ItemBundles/Count` |
| Get bundle | GET | `/api/v2/CatalogService/ItemBundles/{itemBundleId}` |
| Create bundle | POST | `/api/v2/CatalogService/ItemBundles` |
| Update bundle | PUT | `/api/v2/CatalogService/ItemBundles/{itemBundleId}` |
| Patch bundle | PATCH | `/api/v2/CatalogService/ItemBundles/{itemBundleId}` |
| Delete bundle | DELETE | `/api/v2/CatalogService/ItemBundles/{itemBundleId}` |
| List reviews (by itemId) | GET | `/api/v2/CatalogService/ItemReviews` |
| Get review | GET | `/api/v2/CatalogService/ItemReviews/{itemReviewId}` |
| Create review | POST | `/api/v2/CatalogService/ItemReviews` |
| Update review | PUT | `/api/v2/CatalogService/ItemReviews/{itemReviewId}` |
| Patch review | PATCH | `/api/v2/CatalogService/ItemReviews/{itemReviewId}` |
| Delete review | DELETE | `/api/v2/CatalogService/ItemReviews/{itemReviewId}` |
| List questions | GET | `/api/v2/CatalogService/ItemQuestions` |
| Get question | GET | `/api/v2/CatalogService/ItemQuestions/{itemQuestionId}` |
| Create question | POST | `/api/v2/CatalogService/ItemQuestions` |
| Update question | PUT | `/api/v2/CatalogService/ItemQuestions/{itemQuestionId}` |
| Patch question | PATCH | `/api/v2/CatalogService/ItemQuestions/{itemQuestionId}` |
| Delete question | DELETE | `/api/v2/CatalogService/ItemQuestions/{itemQuestionId}` |
| List item-tax-policy links | GET | `/api/v2/CatalogService/ItemTaxPolicies` |
| Count item-tax-policy links | GET | `/api/v2/CatalogService/ItemTaxPolicies/Count` |
| Get item-tax-policy link | GET | `/api/v2/CatalogService/ItemTaxPolicies/{itemTaxPolicyId}` |
| Relate item -> tax policy | POST | `/api/v2/CatalogService/ItemTaxPolicies` |
| Remove item -> tax policy | DELETE | `/api/v2/CatalogService/ItemTaxPolicies/{itemTaxPolicyId}` |
| List item-shipping-policy links | GET | `/api/v2/CatalogService/ItemShippingPolicies` |
| Count item-shipping-policy links | GET | `/api/v2/CatalogService/ItemShippingPolicies/Count` |
| Get item-shipping-policy link | GET | `/api/v2/CatalogService/ItemShippingPolicies/{itemShippingPolicyId}` |
| Relate item -> shipping policy | POST | `/api/v2/CatalogService/ItemShippingPolicies` |
| Remove item -> shipping policy | DELETE | `/api/v2/CatalogService/ItemShippingPolicies/{itemShippingPolicyId}` |
| List item-return-policy links | GET | `/api/v2/CatalogService/ItemReturnPolicies` |
| Count item-return-policy links | GET | `/api/v2/CatalogService/ItemReturnPolicies/Count` |
| Get item-return-policy link | GET | `/api/v2/CatalogService/ItemReturnPolicies/{itemReturnPolicyId}` |
| Relate item -> return policy | POST | `/api/v2/CatalogService/ItemReturnPolicies` |
| Remove item -> return policy | DELETE | `/api/v2/CatalogService/ItemReturnPolicies/{itemReturnPolicyId}` |
| List item-refund-policy links | GET | `/api/v2/CatalogService/ItemRefundPolicies` |
| Count item-refund-policy links | GET | `/api/v2/CatalogService/ItemRefundPolicies/Count` |
| Get item-refund-policy link | GET | `/api/v2/CatalogService/ItemRefundPolicies/{itemRefundPolicyId}` |
| Relate item -> refund policy | POST | `/api/v2/CatalogService/ItemRefundPolicies` |
| Remove item -> refund policy | DELETE | `/api/v2/CatalogService/ItemRefundPolicies/{itemRefundPolicyId}` |
| List item-warranty-policy links | GET | `/api/v2/CatalogService/ItemWarrantyPolicies` |
| Count item-warranty-policy links | GET | `/api/v2/CatalogService/ItemWarrantyPolicies/Count` |
| Get item-warranty-policy link | GET | `/api/v2/CatalogService/ItemWarrantyPolicies/{itemWarrantyPolicyId}` |
| Relate item -> warranty policy | POST | `/api/v2/CatalogService/ItemWarrantyPolicies` |
| Remove item -> warranty policy | DELETE | `/api/v2/CatalogService/ItemWarrantyPolicies/{itemWarrantyPolicyId}` |
| List Google categories | GET | `/api/v2/CatalogService/ItemGoogleCategories` |
| All Google categories | GET | `/api/v2/CatalogService/ItemGoogleCategories/All` |
| Root Google categories | GET | `/api/v2/CatalogService/ItemGoogleCategories/Primary` |
| Count Google categories | GET | `/api/v2/CatalogService/ItemGoogleCategories/Count` |
| Google category tree | GET | `/api/v2/CatalogService/ItemGoogleCategories/tree` |
| Map Google category tree | POST | `/api/v2/CatalogService/ItemGoogleCategories/tree` |
| Get Google category | GET | `/api/v2/CatalogService/ItemGoogleCategories/{itemCategoryId}` |
| Google category children | GET | `/api/v2/CatalogService/ItemGoogleCategories/{itemCategoryId}/Children` |
| List merchants | GET | `/api/v2/CatalogService/Merchants` |
| Count merchants | GET | `/api/v2/CatalogService/Merchants/Count` |
| Get merchant | GET | `/api/v2/CatalogService/Merchants/{merchantId}` |
