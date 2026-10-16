---
name: absuite-pricing
description: >
  Create, read, update, patch, and delete pricing data in the Alliance Business Suite
  (ABS) Pricing Service via the REST API. Covers price lists and their price entries,
  discount lists and their discount entries, pricing rules, rounding policies, and
  item price calculations, including atomic PATCH (JSON Patch) updates. Most operations
  are tenant-scoped and require a bearer token (see the absuite-login skill); the price
  calculation reads are public/user-scoped.
---

# Alliance Business Suite — Pricing Skill (REST)

Manage pricing through the ABS Pricing Service REST API. Price lists, discount lists,
pricing rules, and rounding policies are tenant-scoped: pass `?tenantId=<tenant-guid>`
(or the equivalent `X-TenantId: <tenant-guid>` header) on **every** request — GET, POST,
PUT, PATCH, and DELETE alike. The **item price calculation** reads under `/Prices/{itemId}/…`
are an exception — they take **no tenant binding** (do not add a tenant param or header).

> For the CLI equivalent see `absuite-pricing-cli`; for general REST conventions
> (envelope, tenant scoping, JSON Patch) see `absuite-rest`.

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
  -d '{"email": "<your-email>", "password": "<your-password>"}'
```
Extract `accessToken` from the JSON response and export it:
```bash
export ABSUITE_ACCESS_TOKEN="<accessToken-from-response>"
```

2. **Send the token on every subsequent request:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/PricingService`

4. **Response envelope** — every response is wrapped:
```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "…",
  "timestamp": "…",
  "result": { }
}
```
Always check `isSuccess`; read the payload from `result` (an object, an array, an int for `Count`, or `null`).

## Key Concepts

- **Price List** — a named, dated set of item prices, optionally scoped to a context, currency, and unit/unit-group.
- **Price (price list entry / `ItemPrice`)** — the price of a single item within a price list; may reference a discount list and a rounding policy.
- **Discount List** — a named set of quantity-banded discounts, either amount- or percentage-based.
- **Discount (discount list entry)** — a single discount band (begin/end quantity → percent or value) for an item.
- **Pricing Rule** — a configurable rule (free/reduce, geo-scoped, time-windowed) carrying a `value` and/or `percentage`.
- **Rounding Policy** — a policy controlling how computed prices are rounded; shares the same shape as a pricing rule.
- **`PriceList.context`** — `Sales` | `Purchase` | `Cost`.
- **`DiscountList.discountListType`** — `Amount` | `Percentage`.
- **Percentage convention** — every `percent` / `percentage` field is a **whole number**, not a fraction.
  `19.5` means **19.5%**, `10` means **10%**. Do not send `0.195` for 19.5%.

> Field names in request bodies are PascalCase JSON keys (e.g. `"Name"`, `"CurrencyId"`,
> `"DiscountListType"`). Required fields are noted per body below; everything else is optional.

## Workflow: Building a Price List

1. **Create a price list** (name, context, currency).
2. **(Optional)** Create a discount list and a rounding policy to attach to price entries.
3. **Add price entries** to the price list (one per item), referencing the discount list / rounding policy.
4. **(Optional)** Define pricing rules (geo/time-scoped) for dynamic adjustments.
5. **Calculate** an item's price / final price / savings / taxes via the `/Prices/{itemId}/…` reads.

## Price Lists

### List Price Lists

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Price Lists

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Price List by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<price-list-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Price List

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Retail Price List 2026",
    "description": "Standard retail pricing",
    "context": "Sales",
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "currencyId": "<currency-guid>",
    "unitId": "<unit-guid>",
    "unitGroupId": "<unit-group-guid>",
    "partnerVisible": false,
    "unitOfMeasureDependant": false
  }'
```

**`PriceListCreateDto` fields:** `id`, `timestamp`, `name` (**required**), `description`,
`context` (`Sales`|`Purchase`|`Cost`), `startDate`, `endDate`, `currencyId`, `unitId`,
`unitGroupId`, `partnerVisible` (bool), `unitOfMeasureDependant` (bool).

### Update Price List (full replace, PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<price-list-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Retail Price List 2026 (revised)",
    "description": "Updated retail pricing",
    "context": "Sales",
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "currencyId": "<currency-guid>",
    "partnerVisible": true,
    "unitOfMeasureDependant": false
  }'
```

**`PriceListUpdateDto` fields:** `name` (**required**), `description`,
`context` (`Sales`|`Purchase`|`Cost`), `startDate`, `endDate`, `currencyId`, `unitId`,
`unitGroupId`, `partnerVisible` (bool), `unitOfMeasureDependant` (bool). It does not carry `id`.

### Patch Price List (PATCH — JSON Patch RFC 6902)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<price-list-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/name", "value": "Retail Price List 2026 (Q3)" },
    { "op": "replace", "path": "/partnerVisible", "value": true }
  ]'
```

### Delete Price List

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<price-list-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Price List Entries (Prices)

Each entry sets the price of one item inside a price list.

### List Entries in a Price List

```bash
# Optionally filter by item with ?itemId=<item-guid>
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<price-list-guid>/Prices?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Entry by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<price-list-guid>/Prices/<price-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Entry

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<price-list-guid>/Prices?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "<item-guid>",
    "priceListId": "<price-list-guid>",
    "unitId": "<unit-guid>",
    "currencyId": "<currency-guid>",
    "unitGroupId": "<unit-group-guid>",
    "discountListId": "<discount-list-guid>",
    "roundingPolicyId": "<rounding-policy-guid>",
    "price": 49.99,
    "percent": 0
  }'
```

**`ItemPriceCreateDto` fields:** `id`, `timestamp`, `itemId` (**required**), `unitId`,
`currencyId`, `priceListId`, `unitGroupId`, `discountListId`, `roundingPolicyId`,
`price` (number), `percent` (number, whole-number percentage).

### Update Entry (full replace, PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<price-list-guid>/Prices/<price-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 59.99,
    "itemId": "<item-guid>",
    "currencyId": "<currency-guid>",
    "percent": 0
  }'
```

**`ItemPriceUpdateDto` fields:** `price` (number), `itemId`, `unitId`, `percent` (number,
whole-number percentage), `unitGroupId`, `currencyId`, `discountListId`, `roundingPolicyId`.

### Patch Entry (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<price-list-guid>/Prices/<price-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/price", "value": 54.99 }
  ]'
```

### Delete Entry

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<price-list-guid>/Prices/<price-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Discount Lists

### List Discount Lists

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Discount Lists

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Discount List by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<discount-list-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Discount List

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VIP Discounts",
    "discountListType": "Percentage",
    "currencyId": "<currency-guid>"
  }'
```

**`DiscountListCreateDto` fields:** `id`, `timestamp`, `name`,
`discountListType` (`Amount`|`Percentage`), `currencyId`.

### Update Discount List (full replace, PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<discount-list-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VIP Discounts (revised)",
    "discountListType": "Percentage",
    "currencyId": "<currency-guid>"
  }'
```

**`DiscountListUpdateDto` fields:** `name`, `discountListType` (`Amount`|`Percentage`),
`currencyId`. It does not carry `id`.

### Patch Discount List (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<discount-list-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/discountListType", "value": "Amount" }
  ]'
```

### Delete Discount List

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<discount-list-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Discount List Entries (Discounts)

Each entry is one quantity-banded discount for an item within a discount list.

### List Entries in a Discount List

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<discount-list-guid>/Discounts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Entries in a Discount List

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<discount-list-guid>/Discounts/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Entry by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<discount-list-guid>/Discounts/<discount-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Entry

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<discount-list-guid>/Discounts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Volume discount, 10+ units",
    "beginQuantity": 10,
    "endQuantity": 99,
    "percent": 15.0,
    "value": 0,
    "itemId": "<item-guid>",
    "discountListId": "<discount-list-guid>"
  }'
```

**`DiscountCreateDto` fields:** `id`, `timestamp`, `description`, `beginQuantity` (number),
`endQuantity` (number), `percent` (number, whole-number percentage — `15.0` = 15%),
`value` (number), `itemId`, `discountListId`.

### Update Entry (full replace, PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<discount-list-guid>/Discounts/<discount-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Volume discount, 10+ units",
    "beginQuantity": 10,
    "endQuantity": 99,
    "percent": 20.0,
    "value": 0,
    "itemId": "<item-guid>",
    "discountListId": "<discount-list-guid>"
  }'
```

**`DiscountUpdateDto` fields:** `description`, `beginQuantity` (number), `endQuantity` (number),
`percent` (number, whole-number percentage), `value` (number), `itemId`, `discountListId`.

### Patch Entry (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<discount-list-guid>/Discounts/<discount-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/percent", "value": 20.0 }
  ]'
```

### Delete Entry

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<discount-list-guid>/Discounts/<discount-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Pricing Rules

> Pricing-rule endpoints also accept optional API-version params: `?api-version=<v>` (query)
> or the `x-api-version: <v>` header. They are optional — omit them unless you need a
> specific version.

### List Pricing Rules

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Pricing Rules

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Pricing Rule by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules/<pricing-rule-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Pricing Rule

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUMMER10",
    "title": "Summer Sale",
    "description": "10% off during the summer window",
    "isFree": false,
    "reduce": true,
    "isEnabled": true,
    "isDefault": false,
    "allowInternational": true,
    "value": 0,
    "percentage": 10.0,
    "currencyId": "<currency-guid>",
    "countryId": "<country-guid>"
  }'
```

**`PricingRuleCreateDto` fields:** `id`, `timestamp`, `code`, `title`, `description`,
`isFree` (bool), `reduce` (bool), `isEnabled` (bool), `isDefault` (bool),
`allowInternational` (bool), `hours` (int), `days` (int), `weeks` (int), `months` (int),
`years` (int), `value` (number), `percentage` (number, whole-number percentage — `10.0` = 10%),
`currencyId`, `countryId`, `countryStateId`, `customState`, `customCity`, `cityId`.

### Update Pricing Rule (full replace, PUT)

> **Note the unusual route:** update is `PUT /PricingRules/Update` and the rule id is a
> **query** param (`?pricingRuleId=<guid>`), not a path segment. Both `tenantId` and
> `pricingRuleId` are required query params.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules/Update?tenantId=<tenant-guid>&pricingRuleId=<pricing-rule-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Sale (extended)",
    "description": "Extended summer discount",
    "isEnabled": true,
    "reduce": true,
    "value": 0,
    "percentage": 15.0,
    "currencyId": "<currency-guid>"
  }'
```

**`PricingRuleUpdateDto` fields:** `title`, `description`, `isFree` (bool), `reduce` (bool),
`isEnabled` (bool), `isDefault` (bool), `allowInternational` (bool), `hours` (int),
`days` (int), `weeks` (int), `months` (int), `years` (int), `value` (number),
`percentage` (number, whole-number percentage), `currencyId`, `countryId`, `countryStateId`,
`customState`, `customCity`, `cityId`. It does not carry `code` or `id`.

### Patch Pricing Rule (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules/<pricing-rule-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/isEnabled", "value": false },
    { "op": "replace", "path": "/percentage", "value": 12.5 }
  ]'
```

### Delete Pricing Rule

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules/<pricing-rule-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Rounding Policies

> Rounding-policy endpoints also accept the optional `?api-version=<v>` query param or the
> `x-api-version: <v>` header.

### List Rounding Policies

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Rounding Policies

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Rounding Policy by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies/<rounding-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Rounding Policy

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "ROUND-CENT",
    "title": "Round to nearest cent",
    "description": "Standard rounding policy",
    "isEnabled": true,
    "isDefault": false,
    "value": 0,
    "percentage": 0
  }'
```

**`RoundingPolicyCreateDto` fields:** `id`, `timestamp`, `code`, `title`, `description`,
`isFree` (bool), `reduce` (bool), `isEnabled` (bool), `isDefault` (bool),
`allowInternational` (bool), `hours` (int), `days` (int), `weeks` (int), `months` (int),
`years` (int), `value` (number), `percentage` (number, whole-number percentage),
`currencyId`, `countryId`, `countryStateId`, `customState`, `customCity`, `cityId`.

### Update Rounding Policy (full replace, PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies/<rounding-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "ROUND-CENT",
    "title": "Round to nearest cent (revised)",
    "description": "Revised rounding policy",
    "isEnabled": true,
    "value": 0,
    "percentage": 0
  }'
```

**`RoundingPolicyUpdateDto` fields:** `code`, `title`, `description`, `isFree` (bool),
`reduce` (bool), `isEnabled` (bool), `isDefault` (bool), `allowInternational` (bool),
`hours` (int), `days` (int), `weeks` (int), `months` (int), `years` (int), `value` (number),
`percentage` (number, whole-number percentage), `currencyId`, `countryId`, `countryStateId`,
`customState`, `customCity`, `cityId`. (Unlike the pricing-rule update, this update **does**
carry `code`; it does not carry `id`.)

### Patch Rounding Policy (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies/<rounding-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/isDefault", "value": true }
  ]'
```

### Delete Rounding Policy

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies/<rounding-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Price Calculation (item reads — no tenant binding)

These endpoints compute prices for a single item and are **not tenant-scoped** — do not pass
`?tenantId=` or `X-TenantId`. `currencyId` is optional (defaults server-side, e.g. `USD.USA`).
The optional `?api-version=<v>` query param / `x-api-version: <v>` header are accepted here too.

### Get Calculated Price for an Item

Considers a price list, discount list, quantity, and currency (all optional query params).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/Prices/<item-guid>/Price?priceListId=<price-list-guid>&discountsListId=<discount-list-guid>&quantity=1&currencyId=<currency-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Query params: `priceListId` (opt), `discountsListId` (opt — note the spelling), `quantity` (opt),
`currencyId` (opt).

### Get Final Price (after discounts and taxes)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/Prices/<item-guid>/FinalPrice?currencyId=<currency-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Total Savings

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/Prices/<item-guid>/TotalSavings?currencyId=<currency-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Total Taxes

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/Prices/<item-guid>/TotalTaxes?currencyId=<currency-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## End-to-End Workflow

```bash
BASE="$ABSUITE_HOST_URL/api/v2/PricingService"
TENANT="<tenant-guid>"

# 1. Create a price list (note the returned id)
curl -X POST "$BASE/PriceLists?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Retail 2026", "context": "Sales", "currencyId": "<currency-guid>" }'

# 2. Create a discount list
curl -X POST "$BASE/DiscountLists?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Volume Discounts", "discountListType": "Percentage", "currencyId": "<currency-guid>" }'

# 3. Add a banded discount (whole-number percent)
curl -X POST "$BASE/DiscountLists/<discount-list-guid>/Discounts?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "description": "10+ units", "beginQuantity": 10, "endQuantity": 99, "percent": 15.0, "itemId": "<item-guid>", "discountListId": "<discount-list-guid>" }'

# 4. Add a price entry to the price list, linking the discount list
curl -X POST "$BASE/PriceLists/<price-list-guid>/Prices?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "itemId": "<item-guid>", "priceListId": "<price-list-guid>", "currencyId": "<currency-guid>", "discountListId": "<discount-list-guid>", "price": 49.99 }'

# 5. Patch the price entry to a new price
curl -X PATCH "$BASE/PriceLists/<price-list-guid>/Prices/<price-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/price", "value": 44.99 } ]'

# 6. Calculate the item price for quantity 12 (NO tenantId on /Prices reads)
curl -X GET "$BASE/Prices/<item-guid>/Price?priceListId=<price-list-guid>&discountsListId=<discount-list-guid>&quantity=12" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## PATCH (JSON Patch) Notes

PATCH bodies are a JSON **array** of RFC 6902 operations (`op` ∈
`add|remove|replace|move|copy|test`; `path`/`from` are JSON-Pointer, leading `/`, camelCase
field). PATCH is supported on these aggregates: **PriceList**, **PriceList Price (entry)**,
**DiscountList**, **DiscountList Discount (entry)**, **PricingRule**, and **RoundingPolicy**.
There is **no** PATCH for the `/Prices/{itemId}/…` calculation reads (they are GET-only).
For the CLI (which has no PATCH support), use `update` (PUT) instead — see `absuite-pricing-cli`.

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| List price lists | GET | `/api/v2/PricingService/PriceLists` |
| Count price lists | GET | `/api/v2/PricingService/PriceLists/Count` |
| Get price list | GET | `/api/v2/PricingService/PriceLists/{priceListId}` |
| Create price list | POST | `/api/v2/PricingService/PriceLists` |
| Update price list | PUT | `/api/v2/PricingService/PriceLists/{priceListId}` |
| Patch price list | PATCH | `/api/v2/PricingService/PriceLists/{priceListId}` |
| Delete price list | DELETE | `/api/v2/PricingService/PriceLists/{priceListId}` |
| List price entries | GET | `/api/v2/PricingService/PriceLists/{priceListId}/Prices` |
| Get price entry | GET | `/api/v2/PricingService/PriceLists/{priceListId}/Prices/{priceId}` |
| Create price entry | POST | `/api/v2/PricingService/PriceLists/{priceListId}/Prices` |
| Update price entry | PUT | `/api/v2/PricingService/PriceLists/{priceListId}/Prices/{priceId}` |
| Patch price entry | PATCH | `/api/v2/PricingService/PriceLists/{priceListId}/Prices/{priceId}` |
| Delete price entry | DELETE | `/api/v2/PricingService/PriceLists/{priceListId}/Prices/{priceId}` |
| List discount lists | GET | `/api/v2/PricingService/DiscountLists` |
| Count discount lists | GET | `/api/v2/PricingService/DiscountLists/Count` |
| Get discount list | GET | `/api/v2/PricingService/DiscountLists/{discountListId}` |
| Create discount list | POST | `/api/v2/PricingService/DiscountLists` |
| Update discount list | PUT | `/api/v2/PricingService/DiscountLists/{discountListId}` |
| Patch discount list | PATCH | `/api/v2/PricingService/DiscountLists/{discountListId}` |
| Delete discount list | DELETE | `/api/v2/PricingService/DiscountLists/{discountListId}` |
| List discount entries | GET | `/api/v2/PricingService/DiscountLists/{discountListId}/Discounts` |
| Count discount entries | GET | `/api/v2/PricingService/DiscountLists/{discountListId}/Discounts/Count` |
| Get discount entry | GET | `/api/v2/PricingService/DiscountLists/{discountListId}/Discounts/{discountListEntryId}` |
| Create discount entry | POST | `/api/v2/PricingService/DiscountLists/{discountListId}/Discounts` |
| Update discount entry | PUT | `/api/v2/PricingService/DiscountLists/{discountListId}/Discounts/{discountListEntryId}` |
| Patch discount entry | PATCH | `/api/v2/PricingService/DiscountLists/{discountListId}/Discounts/{discountListEntryId}` |
| Delete discount entry | DELETE | `/api/v2/PricingService/DiscountLists/{discountListId}/Discounts/{discountListEntryId}` |
| List pricing rules | GET | `/api/v2/PricingService/PricingRules` |
| Count pricing rules | GET | `/api/v2/PricingService/PricingRules/Count` |
| Get pricing rule | GET | `/api/v2/PricingService/PricingRules/{pricingRuleId}` |
| Create pricing rule | POST | `/api/v2/PricingService/PricingRules` |
| Update pricing rule | PUT | `/api/v2/PricingService/PricingRules/Update?pricingRuleId={pricingRuleId}` |
| Patch pricing rule | PATCH | `/api/v2/PricingService/PricingRules/{pricingRuleId}` |
| Delete pricing rule | DELETE | `/api/v2/PricingService/PricingRules/{pricingRuleId}` |
| List rounding policies | GET | `/api/v2/PricingService/RoundingPolicies` |
| Count rounding policies | GET | `/api/v2/PricingService/RoundingPolicies/Count` |
| Get rounding policy | GET | `/api/v2/PricingService/RoundingPolicies/{roundingPolicyId}` |
| Create rounding policy | POST | `/api/v2/PricingService/RoundingPolicies` |
| Update rounding policy | PUT | `/api/v2/PricingService/RoundingPolicies/{roundingPolicyId}` |
| Patch rounding policy | PATCH | `/api/v2/PricingService/RoundingPolicies/{roundingPolicyId}` |
| Delete rounding policy | DELETE | `/api/v2/PricingService/RoundingPolicies/{roundingPolicyId}` |
| Get calculated price | GET | `/api/v2/PricingService/Prices/{itemId}/Price` |
| Get final price | GET | `/api/v2/PricingService/Prices/{itemId}/FinalPrice` |
| Get total savings | GET | `/api/v2/PricingService/Prices/{itemId}/TotalSavings` |
| Get total taxes | GET | `/api/v2/PricingService/Prices/{itemId}/TotalTaxes` |

> Tenant scoping: every PriceLists / DiscountLists / PricingRules / RoundingPolicies endpoint
> requires `?tenantId=<tenant-guid>` (or `X-TenantId` header) on all verbs. The four
> `/Prices/{itemId}/…` calculation reads take **no** tenant binding.
