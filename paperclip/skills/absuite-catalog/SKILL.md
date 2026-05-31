---
name: absuite-catalog
description: >
  Manage the product catalog in the Alliance Business Suite (ABS) using the
  `absuite` CLI. Covers stock items (products), categories, types, brands, tags,
  images, attachments, reviews, questions, pricing rules, attribute options, and
  policy relationships (tax, shipping, return, refund, warranty). Includes Google
  category mapping. Requires an authenticated CLI session.
---

# Alliance Business Suite — Catalog Skill

Manage the product catalog through the `absuite` CLI's `catalog` service. All operations are tenant-scoped and require authentication.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite catalog list-commands`

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

## Stock Items (Products)

### List Stock Items

```bash
absuite catalog get stock-items-query --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Stock Items

```bash
absuite catalog count stock-items-by-business --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Stock Item by ID

```bash
absuite catalog get stock-item-by-id --TenantId $TENANT_ID --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Extended Stock Item (with related data)

```bash
absuite catalog get extended-stock-item-by-id --TenantId $TENANT_ID --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Stock Item

```bash
absuite catalog create stock-item --TenantId $TENANT_ID --CatalogItemCreateDto '{
  "Name": "Premium Widget",
  "Title": "Premium Widget - Professional Grade",
  "Sku": "WDG-PRO-001",
  "Description": "High-quality professional widget",
  "ShortDescription": "Pro-grade widget",
  "RegularPrice": 49.99,
  "CurrencyId": "<currency-guid>",
  "CategoryId": "<category-guid>",
  "ItemTypeId": "<type-guid>",
  "BrandId": "<brand-guid>",
  "InStock": true,
  "Published": true,
  "Taxable": true,
  "ManageInventory": true,
  "CurrentStock": 100.0,
  "Weight": 0.5,
  "SelectedCategories": ["<cat-guid-1>", "<cat-guid-2>"],
  "SelectedTags": ["<tag-guid-1>"],
  "SelectedTaxPolicies": ["<tax-policy-guid>"]
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Widget",
    "title": "Premium Widget - Professional Grade",
    "sku": "WDG-PRO-001",
    "description": "High-quality professional widget",
    "shortDescription": "Pro-grade widget",
    "regularPrice": 49.99,
    "currencyId": "<currency-guid>",
    "categoryId": "<category-guid>",
    "itemTypeId": "<type-guid>",
    "brandId": "<brand-guid>",
    "inStock": "true",
    "published": "true",
    "taxable": "true",
    "manageInventory": "true",
    "currentStock": 100.0,
    "weight": 0.5
  }'
```

**Key CatalogItemCreateDto fields:**

| Field | Type | Description |
|---|---|---|
| `Name` | String | Product name |
| `Title` | String | Display title |
| `Sku` / `Upc` / `Ean` | String | Product identifiers |
| `RegularPrice` | Double | Base price |
| `DiscountPrice` | Double | Sale price |
| `CurrencyId` | String | Currency |
| `CategoryId` | String | Primary category |
| `ItemTypeId` | String | Product type |
| `BrandId` | String | Brand |
| `InStock` / `Published` | Boolean | Availability flags |
| `Taxable` | Boolean | Subject to tax |
| `ManageInventory` | Boolean | Track stock levels |
| `CurrentStock` | Double | Quantity on hand |
| `Weight` / `Width` / `Height` / `Length` | Double | Dimensions |
| `PrimaryImageUrl` | String | Main product image URL |
| `Featured` / `OnSale` / `Hot` | Boolean | Merchandising flags |
| `SelectedCategories` | String[] | Linked category IDs |
| `SelectedTags` | String[] | Linked tag IDs |
| `SelectedTaxPolicies` | String[] | Linked tax policy IDs |

### Update Stock Item

```bash
absuite catalog update stock-item --TenantId $TENANT_ID --ItemId <item-guid> --CatalogItemUpdateDto '{
  "RegularPrice": 59.99,
  "OnSale": true,
  "DiscountPrice": 44.99
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "regularPrice": 59.99, "onSale": "true", "discountPrice": 44.99 }'
```

### Delete Stock Item

```bash
absuite catalog delete stock-item --TenantId $TENANT_ID --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Price Range

```bash
absuite catalog get stock-items-odata-min-price --TenantId $TENANT_ID
absuite catalog get stock-items-odata-max-price --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/MinPrice" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/MaxPrice" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Item Categories

```bash
# List
absuite catalog list item-categories --TenantId $TENANT_ID

# Count
absuite catalog count item-categories --TenantId $TENANT_ID

# Get
absuite catalog get item-category-by-id --TenantId $TENANT_ID --ItemCategoryId <category-guid>

# Create
absuite catalog create item-category --TenantId $TENANT_ID --ItemCategoryCreateDto '{
  "Name": "Electronics",
  "Description": "Electronic devices and accessories"
}'

# Update
absuite catalog update item-category --TenantId $TENANT_ID --ItemCategoryId <category-guid> --ItemCategoryUpdateDto '{...}'

# Delete
absuite catalog delete item-category --TenantId $TENANT_ID --ItemCategoryId <category-guid>
```

**REST API equivalents:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Electronics", "description": "Electronic devices and accessories" }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Updated Category", "description": "Updated description" }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Relate/Unrelate Category to Stock Item

```bash
absuite catalog relate-category-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemCategoryId <category-guid>
absuite catalog delete category-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemCategoryId <category-guid>

# View categories for an item
absuite catalog get stock-item-categories-by-item-id --TenantId $TENANT_ID --ItemId <item-guid>
```

**REST API equivalents:**
```bash
# Relate
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Categories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unrelate
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Categories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List categories for item
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Item Types

```bash
absuite catalog list item-types --TenantId $TENANT_ID
absuite catalog count item-types --TenantId $TENANT_ID
absuite catalog get item-type-by-id --TenantId $TENANT_ID --ItemTypeId <type-guid>
absuite catalog create item-type --TenantId $TENANT_ID --ItemTypeCreateDto '{"Name": "Physical Product"}'
absuite catalog update item-type --TenantId $TENANT_ID --ItemTypeId <type-guid> --ItemTypeUpdateDto '{...}'
absuite catalog delete item-type --TenantId $TENANT_ID --ItemTypeId <type-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "singularTitle": "Physical Product", "description": "Tangible goods" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "singularTitle": "Updated Type" }'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Item Brands

```bash
absuite catalog list item-brands --TenantId $TENANT_ID
absuite catalog get item-brand-by-id --TenantId $TENANT_ID --ItemBrandId <brand-guid>
absuite catalog create item-brand --TenantId $TENANT_ID --ItemBrandCreateDto '{"Name": "Acme"}'
absuite catalog update item-brand --TenantId $TENANT_ID --ItemBrandId <brand-guid> --ItemBrandUpdateDto '{...}'
absuite catalog delete item-brand --TenantId $TENANT_ID --ItemBrandId <brand-guid>

# Relate/unrelate
absuite catalog relate-brand-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemBrandId <brand-guid>
absuite catalog delete brand-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemBrandId <brand-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBrands" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBrands/<brand-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBrands" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Acme", "description": "Acme brand" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBrands/<brand-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Updated Brand" }'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBrands/<brand-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Relate/unrelate brand to stock item
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Brands/<brand-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Brands/<brand-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Item Tags

```bash
absuite catalog list item-tags --TenantId $TENANT_ID
absuite catalog get item-tag-by-id --TenantId $TENANT_ID --ItemTagId <tag-guid>
absuite catalog create item-tag --TenantId $TENANT_ID --ItemTagCreateDto '{"Name": "Best Seller"}'
absuite catalog update item-tag --TenantId $TENANT_ID --ItemTagId <tag-guid> --ItemTagUpdateDto '{...}'
absuite catalog delete item-tag --TenantId $TENANT_ID --ItemTagId <tag-guid>

# Relate/unrelate
absuite catalog relate-tag-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemTagId <tag-guid>
absuite catalog delete tag-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemTagId <tag-guid>

# Count tags for an item
absuite catalog count stock-item-tags-by-item-id --TenantId $TENANT_ID --ItemId <item-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Best Seller", "description": "Top selling product" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Updated Tag" }'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemTags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Relate/unrelate/count tags on stock item
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Tags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Tags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Tags/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Item Images

```bash
absuite catalog list item-images --TenantId $TENANT_ID
absuite catalog get item-image-by-id --TenantId $TENANT_ID --ItemImageId <image-guid>
absuite catalog create item-image --TenantId $TENANT_ID --ItemImageCreateDto '{...}'
absuite catalog update item-image --TenantId $TENANT_ID --ItemImageId <image-guid> --ItemImageUpdateDto '{...}'
absuite catalog delete item-image --TenantId $TENANT_ID --ItemImageId <image-guid>

# Relate to stock item
absuite catalog relate-image-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemImageId <image-guid>
absuite catalog delete image-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemImageId <image-guid>

# Primary image
absuite catalog get product-primary-image --TenantId $TENANT_ID --ItemId <item-guid>
absuite catalog update product-primary-image --TenantId $TENANT_ID --ItemId <item-guid> --PrimaryImageUpdateDto '{...}'
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Images" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Images/<image-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Images/<image-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Primary image
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Images/Primary" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Images/Primary" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Item Attachments

```bash
absuite catalog list item-attachments --TenantId $TENANT_ID
absuite catalog get item-attachment-by-id --TenantId $TENANT_ID --ItemAttachmentId <attachment-guid>
absuite catalog create item-attachment --TenantId $TENANT_ID --ItemAttachmentCreateDto '{...}'
absuite catalog update item-attachment --TenantId $TENANT_ID --ItemAttachmentId <attachment-guid> --ItemAttachmentUpdateDto '{...}'
absuite catalog delete item-attachment --TenantId $TENANT_ID --ItemAttachmentId <attachment-guid>

# Relate to stock item
absuite catalog relate-attachment-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemAttachmentId <attachment-guid>
absuite catalog delete attachment-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemAttachmentId <attachment-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Manual", "fileName": "manual.pdf", "filePath": "/uploads/manual.pdf" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Updated Manual" }'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Relate/unrelate on stock item
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Attachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Attachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Item Attributes & Options

```bash
absuite catalog list item-attributes --TenantId $TENANT_ID
absuite catalog count item-attributes --TenantId $TENANT_ID
absuite catalog get item-attribute-by-id --TenantId $TENANT_ID --ItemAttributeId <attr-guid>
absuite catalog create item-attribute --TenantId $TENANT_ID --ItemAttributeCreateDto '{"Name": "Color"}'
absuite catalog update item-attribute --TenantId $TENANT_ID --ItemAttributeId <attr-guid> --ItemAttributeUpdateDto '{...}'
absuite catalog delete item-attribute --TenantId $TENANT_ID --ItemAttributeId <attr-guid>

# Attribute options on stock items
absuite catalog get stock-item-attribute-options-by-item-id --TenantId $TENANT_ID --ItemId <item-guid>
absuite catalog relate-attribute-option-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --AttributeOptionId <option-guid>
absuite catalog delete attribute-option-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --AttributeOptionId <option-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes/<attr-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Color", "description": "Product color" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes/<attr-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Updated Attribute" }'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributes/<attr-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Attribute options on stock items
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/AttributeOptions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/AttributeOptions/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/AttributeOptions/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Item Attribute Options

```bash
absuite catalog list item-attribute-options --TenantId $TENANT_ID
absuite catalog count item-attribute-options --TenantId $TENANT_ID
absuite catalog get item-attribute-option-by-id --TenantId $TENANT_ID --ItemAttributeOptionId <option-guid>
absuite catalog create item-attribute-option --TenantId $TENANT_ID --ItemAttributeOptionCreateDto '{"Name": "Red", "ItemAttributeId": "<attr-guid>"}'
absuite catalog update item-attribute-option --TenantId $TENANT_ID --ItemAttributeOptionId <option-guid> --ItemAttributeOptionUpdateDto '{...}'
absuite catalog delete item-attribute-option --TenantId $TENANT_ID --ItemAttributeOptionId <option-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Red", "itemAttributeId": "<attr-guid>" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Updated Option" }'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemAttributeOptions/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Reviews & Questions

```bash
# Reviews
absuite catalog list item-reviews --TenantId $TENANT_ID
absuite catalog get item-review-by-id --TenantId $TENANT_ID --ItemReviewId <review-guid>
absuite catalog create item-review --TenantId $TENANT_ID --ItemReviewCreateDto '{...}'
absuite catalog relate-review-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemReviewId <review-guid>
absuite catalog get stock-item-reviews-by-item-id --TenantId $TENANT_ID --ItemId <item-guid>

# Questions
absuite catalog list item-questions --TenantId $TENANT_ID
absuite catalog get item-question-by-id --TenantId $TENANT_ID --ItemQuestionId <question-guid>
absuite catalog create item-question --TenantId $TENANT_ID --ItemQuestionCreateDto '{...}'
absuite catalog relate-question-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --ItemQuestionId <question-guid>
```

**REST API equivalents:**
```bash
# Reviews
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemReviews" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemReviews/<review-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemReviews" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "reviewScore": 5, "reviewMessage": "Great product!" }'

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Reviews" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Reviews" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "reviewScore": 5, "reviewMessage": "Excellent!" }'

# Questions
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemQuestions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemQuestions/<question-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemQuestions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Question", "question": "Is this waterproof?" }'

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/Questions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Pricing Rules

```bash
absuite catalog list pricing-rules --TenantId $TENANT_ID
absuite catalog get pricing-rule-by-id --TenantId $TENANT_ID --PricingRuleId <rule-guid>
absuite catalog create pricing-rule --TenantId $TENANT_ID --PricingRuleCreateDto '{...}'
absuite catalog update pricing-rule --TenantId $TENANT_ID --PricingRuleId <rule-guid> --PricingRuleUpdateDto '{...}'
absuite catalog delete pricing-rule --TenantId $TENANT_ID --PricingRuleId <rule-guid>

# Relate to stock item
absuite catalog relate-price-rule-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --PricingRuleId <rule-guid>
absuite catalog delete price-rule-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --PricingRuleId <rule-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/PriceRules" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/PriceRules/<rule-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/PriceRules/<rule-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Policy Relationships

Attach policies to items or stock items:

```bash
# Tax policies
absuite catalog relate-item-to-tax-policy --TenantId $TENANT_ID --ItemId <item-guid> --TaxPolicyId <policy-guid>
absuite catalog delete tax-policy-from-item --TenantId $TENANT_ID --ItemId <item-guid> --TaxPolicyId <policy-guid>
absuite catalog get stock-item-tax-policies-by-item-id --TenantId $TENANT_ID --ItemId <item-guid>

# Shipping policies
absuite catalog relate-item-to-shipping-policy --TenantId $TENANT_ID --ItemId <item-guid> --ShippingPolicyId <policy-guid>
absuite catalog delete shipping-policy-from-item --TenantId $TENANT_ID --ItemId <item-guid> --ShippingPolicyId <policy-guid>

# Return policies
absuite catalog relate-item-to-return-policy --TenantId $TENANT_ID --ItemId <item-guid> --ReturnPolicyId <policy-guid>
absuite catalog delete return-policy-from-item --TenantId $TENANT_ID --ItemId <item-guid> --ReturnPolicyId <policy-guid>

# Refund policies
absuite catalog relate-item-to-refund-policy --TenantId $TENANT_ID --ItemId <item-guid> --RefundPolicyId <policy-guid>
absuite catalog delete refund-policy-from-item --TenantId $TENANT_ID --ItemId <item-guid> --RefundPolicyId <policy-guid>

# Warranty policies
absuite catalog relate-item-to-warranty-policy --TenantId $TENANT_ID --ItemId <item-guid> --WarrantyPolicyId <policy-guid>
absuite catalog delete warranty-policy-from-item --TenantId $TENANT_ID --ItemId <item-guid> --WarrantyPolicyId <policy-guid>
```

**REST API equivalents:**
```bash
# Tax policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/TaxPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/TaxPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/TaxPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Shipping policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/ShippingPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/ShippingPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/ShippingPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Return policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/ReturnPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/ReturnPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/ReturnPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Refund policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/RefundPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/RefundPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/RefundPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Warranty policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/WarrantyPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/WarrantyPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/WarrantyPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Google Categories

```bash
absuite catalog list item-google-categories --TenantId $TENANT_ID
absuite catalog list root-item-google-categories --TenantId $TENANT_ID
absuite catalog list all-item-google-categories --TenantId $TENANT_ID
absuite catalog get item-google-category-by-id --TenantId $TENANT_ID --GoogleCategoryId <gcat-guid>
absuite catalog get children-item-google-categories-by-id --TenantId $TENANT_ID --GoogleCategoryId <gcat-guid>
absuite catalog get item-google-categories-tree --TenantId $TENANT_ID
absuite catalog map-item-google-categories-tree --TenantId $TENANT_ID

# Relate to stock item
absuite catalog relate-google-category-to-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --GoogleCategoryId <gcat-guid>
absuite catalog delete google-category-from-stock-item --TenantId $TENANT_ID --ItemId <item-guid> --GoogleCategoryId <gcat-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/Primary" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/All" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/<gcat-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/<gcat-guid>/Children" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/tree" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemGoogleCategories/tree" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Relate/unrelate to stock item
curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/GoogleCategories/<gcat-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/Items/<item-guid>/GoogleCategories/<gcat-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Merchants

```bash
absuite catalog list merchants --TenantId $TENANT_ID
absuite catalog count merchants --TenantId $TENANT_ID
absuite catalog get merchant-by-id --TenantId $TENANT_ID --MerchantId <merchant-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Merchants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Merchants/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/Merchants/<merchant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Item Bundles

Bundles group multiple items together.

```bash
absuite catalog list item-bundles --TenantId $TENANT_ID
absuite catalog count item-bundles --TenantId $TENANT_ID
absuite catalog get item-bundle-by-id --TenantId $TENANT_ID --ItemBundleId <bundle-guid>
absuite catalog create item-bundle --TenantId $TENANT_ID --ItemBundleCreateDto '{"Name": "Starter Pack"}'
absuite catalog update item-bundle --TenantId $TENANT_ID --ItemBundleId <bundle-guid> --ItemBundleUpdateDto '{...}'
absuite catalog delete item-bundle --TenantId $TENANT_ID --ItemBundleId <bundle-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles/<bundle-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Starter Pack", "description": "Bundle of essentials" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles/<bundle-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Updated Bundle" }'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemBundles/<bundle-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Item Families

Families group related item types.

```bash
absuite catalog list item-families --TenantId $TENANT_ID
absuite catalog count item-families --TenantId $TENANT_ID
absuite catalog get item-family-by-id --TenantId $TENANT_ID --ItemFamilyId <family-guid>
absuite catalog create item-family --TenantId $TENANT_ID --ItemFamilyCreateDto '{"Name": "Outdoor Gear"}'
absuite catalog update item-family --TenantId $TENANT_ID --ItemFamilyId <family-guid> --ItemFamilyUpdateDto '{...}'
absuite catalog delete item-family --TenantId $TENANT_ID --ItemFamilyId <family-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies/<family-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Outdoor Gear", "description": "Outdoor equipment family" }'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies/<family-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Updated Family" }'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemFamilies/<family-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Item Policy Resources

Standalone policy relationship resources available through the API:

**REST API endpoints:**
```bash
# Warranty Policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemWarrantyPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemWarrantyPolicies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Refund Policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemRefundPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemRefundPolicies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Shipping Policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemShippingPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/CatalogService/ItemShippingPolicies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Critical Rules

- **Authenticate first.** Use `absuite login` before any catalog operation.
- **Always provide a tenant context.**
- **Create categories, types, and brands first** before creating stock items.
- **Use `relate-*` commands** to link entities (categories, tags, policies) to stock items.
- **Use `--help`** on any command for full DTO schemas.

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v2/CatalogService/Items` | Create stock item |
| GET | `/api/v2/CatalogService/Items` | List stock items |
| GET | `/api/v2/CatalogService/Items/Count` | Count stock items |
| GET | `/api/v2/CatalogService/Items/MinPrice` | Get min price |
| GET | `/api/v2/CatalogService/Items/MaxPrice` | Get max price |
| GET | `/api/v2/CatalogService/Items/:itemId` | Get stock item |
| PUT | `/api/v2/CatalogService/Items/:itemId` | Update stock item |
| DELETE | `/api/v2/CatalogService/Items/:itemId` | Delete stock item |
| GET | `/api/v2/CatalogService/Items/:itemId/Extended` | Get extended item |
| GET | `/api/v2/CatalogService/Items/:itemId/Attachments` | Item attachments |
| GET | `/api/v2/CatalogService/Items/:itemId/AttributeOptions` | Item attribute options |
| GET | `/api/v2/CatalogService/Items/:itemId/Brands` | Item brands |
| GET | `/api/v2/CatalogService/Items/:itemId/Categories` | Item categories |
| GET | `/api/v2/CatalogService/Items/:itemId/GoogleCategories` | Item Google categories |
| GET | `/api/v2/CatalogService/Items/:itemId/Images` | Item images |
| GET | `/api/v2/CatalogService/Items/:itemId/Images/Primary` | Primary image |
| GET | `/api/v2/CatalogService/Items/:itemId/PriceRules` | Item price rules |
| GET | `/api/v2/CatalogService/Items/:itemId/Questions` | Item questions |
| GET | `/api/v2/CatalogService/Items/:itemId/RefundPolicies` | Item refund policies |
| GET | `/api/v2/CatalogService/Items/:itemId/ReturnPolicies` | Item return policies |
| GET | `/api/v2/CatalogService/Items/:itemId/Reviews` | Item reviews |
| GET | `/api/v2/CatalogService/Items/:itemId/ShippingPolicies` | Item shipping policies |
| GET | `/api/v2/CatalogService/Items/:itemId/Tags` | Item tags |
| GET | `/api/v2/CatalogService/Items/:itemId/Tags/Count` | Count item tags |
| GET | `/api/v2/CatalogService/Items/:itemId/TaxPolicies` | Item tax policies |
| GET | `/api/v2/CatalogService/Items/:itemId/Types` | Item types |
| GET | `/api/v2/CatalogService/Items/:itemId/WarrantyPolicies` | Item warranty policies |
| POST | `/api/v2/CatalogService/ItemCategories` | Create category |
| GET | `/api/v2/CatalogService/ItemCategories` | List categories |
| GET | `/api/v2/CatalogService/ItemCategories/Count` | Count categories |
| GET | `/api/v2/CatalogService/ItemCategories/:id` | Get category |
| PUT | `/api/v2/CatalogService/ItemCategories/:id` | Update category |
| DELETE | `/api/v2/CatalogService/ItemCategories/:id` | Delete category |
| POST | `/api/v2/CatalogService/ItemTypes` | Create type |
| GET | `/api/v2/CatalogService/ItemTypes` | List types |
| GET | `/api/v2/CatalogService/ItemTypes/Count` | Count types |
| GET | `/api/v2/CatalogService/ItemTypes/:id` | Get type |
| PUT | `/api/v2/CatalogService/ItemTypes/:id` | Update type |
| DELETE | `/api/v2/CatalogService/ItemTypes/:id` | Delete type |
| POST | `/api/v2/CatalogService/ItemBrands` | Create brand |
| GET | `/api/v2/CatalogService/ItemBrands` | List brands |
| GET | `/api/v2/CatalogService/ItemBrands/:id` | Get brand |
| PUT | `/api/v2/CatalogService/ItemBrands/:id` | Update brand |
| DELETE | `/api/v2/CatalogService/ItemBrands/:id` | Delete brand |
| POST | `/api/v2/CatalogService/ItemTags` | Create tag |
| GET | `/api/v2/CatalogService/ItemTags` | List tags |
| GET | `/api/v2/CatalogService/ItemTags/:id` | Get tag |
| PUT | `/api/v2/CatalogService/ItemTags/:id` | Update tag |
| DELETE | `/api/v2/CatalogService/ItemTags/:id` | Delete tag |
| POST | `/api/v2/CatalogService/ItemAttributes` | Create attribute |
| GET | `/api/v2/CatalogService/ItemAttributes` | List attributes |
| GET | `/api/v2/CatalogService/ItemAttributes/Count` | Count attributes |
| GET | `/api/v2/CatalogService/ItemAttributes/:id` | Get attribute |
| PUT | `/api/v2/CatalogService/ItemAttributes/:id` | Update attribute |
| DELETE | `/api/v2/CatalogService/ItemAttributes/:id` | Delete attribute |
| POST | `/api/v2/CatalogService/ItemAttributeOptions` | Create attribute option |
| GET | `/api/v2/CatalogService/ItemAttributeOptions` | List attribute options |
| GET | `/api/v2/CatalogService/ItemAttributeOptions/Count` | Count attribute options |
| GET | `/api/v2/CatalogService/ItemAttributeOptions/:id` | Get attribute option |
| PUT | `/api/v2/CatalogService/ItemAttributeOptions/:id` | Update attribute option |
| DELETE | `/api/v2/CatalogService/ItemAttributeOptions/:id` | Delete attribute option |
| POST | `/api/v2/CatalogService/ItemQuestions` | Create question |
| GET | `/api/v2/CatalogService/ItemQuestions` | List questions |
| GET | `/api/v2/CatalogService/ItemQuestions/:id` | Get question |
| PUT | `/api/v2/CatalogService/ItemQuestions/:id` | Update question |
| DELETE | `/api/v2/CatalogService/ItemQuestions/:id` | Delete question |
| POST | `/api/v2/CatalogService/ItemReviews` | Create review |
| GET | `/api/v2/CatalogService/ItemReviews` | List reviews |
| GET | `/api/v2/CatalogService/ItemReviews/:id` | Get review |
| PUT | `/api/v2/CatalogService/ItemReviews/:id` | Update review |
| DELETE | `/api/v2/CatalogService/ItemReviews/:id` | Delete review |
| POST | `/api/v2/CatalogService/ItemAttachments` | Create attachment |
| GET | `/api/v2/CatalogService/ItemAttachments` | List attachments |
| GET | `/api/v2/CatalogService/ItemAttachments/:id` | Get attachment |
| PUT | `/api/v2/CatalogService/ItemAttachments/:id` | Update attachment |
| DELETE | `/api/v2/CatalogService/ItemAttachments/:id` | Delete attachment |
| POST | `/api/v2/CatalogService/ItemBundles` | Create bundle |
| GET | `/api/v2/CatalogService/ItemBundles` | List bundles |
| GET | `/api/v2/CatalogService/ItemBundles/Count` | Count bundles |
| GET | `/api/v2/CatalogService/ItemBundles/:id` | Get bundle |
| PUT | `/api/v2/CatalogService/ItemBundles/:id` | Update bundle |
| DELETE | `/api/v2/CatalogService/ItemBundles/:id` | Delete bundle |
| POST | `/api/v2/CatalogService/ItemFamilies` | Create family |
| GET | `/api/v2/CatalogService/ItemFamilies` | List families |
| GET | `/api/v2/CatalogService/ItemFamilies/Count` | Count families |
| GET | `/api/v2/CatalogService/ItemFamilies/:id` | Get family |
| PUT | `/api/v2/CatalogService/ItemFamilies/:id` | Update family |
| DELETE | `/api/v2/CatalogService/ItemFamilies/:id` | Delete family |
| GET | `/api/v2/CatalogService/ItemGoogleCategories` | List Google categories |
| GET | `/api/v2/CatalogService/ItemGoogleCategories/All` | All Google categories |
| GET | `/api/v2/CatalogService/ItemGoogleCategories/Primary` | Root categories |
| GET | `/api/v2/CatalogService/ItemGoogleCategories/Count` | Count categories |
| GET | `/api/v2/CatalogService/ItemGoogleCategories/tree` | Category tree |
| POST | `/api/v2/CatalogService/ItemGoogleCategories/tree` | Map category tree |
| GET | `/api/v2/CatalogService/ItemGoogleCategories/:id` | Get Google category |
| GET | `/api/v2/CatalogService/ItemGoogleCategories/:id/Children` | Child categories |
| GET | `/api/v2/CatalogService/Merchants` | List merchants |
| GET | `/api/v2/CatalogService/Merchants/Count` | Count merchants |
| GET | `/api/v2/CatalogService/Merchants/:id` | Get merchant |
| GET | `/api/v2/CatalogService/ItemWarrantyPolicies` | List warranty policies |
| GET | `/api/v2/CatalogService/ItemWarrantyPolicies/Count` | Count warranty policies |
| GET | `/api/v2/CatalogService/ItemRefundPolicies` | List refund policies |
| GET | `/api/v2/CatalogService/ItemRefundPolicies/Count` | Count refund policies |
| GET | `/api/v2/CatalogService/ItemShippingPolicies` | List shipping policies |
| GET | `/api/v2/CatalogService/ItemShippingPolicies/Count` | Count shipping policies |
