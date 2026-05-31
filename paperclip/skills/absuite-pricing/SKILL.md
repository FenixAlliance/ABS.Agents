---
name: absuite-pricing
description: >
  Manage price lists, price list entries, discount lists, discount list entries,
  pricing rules, and rounding policies in the Alliance Business Suite (ABS)
  using the `absuite` CLI. Includes price calculation and savings/tax estimation.
  Requires an authenticated CLI session.
---

# Alliance Business Suite — Pricing Skill

Manage pricing through the `absuite` CLI's `pricing` service. All operations are tenant-scoped.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite pricing list-commands`

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

## Price Lists

```bash
# List
absuite pricing list price-lists --TenantId $TENANT_ID

# Count
absuite pricing count price-lists --TenantId $TENANT_ID

# Get by ID
absuite pricing get price-list --TenantId $TENANT_ID --PriceListId <list-guid>

# Create
absuite pricing create price-list --TenantId $TENANT_ID --PriceListCreateDto '{
  "Name": "Retail Price List 2026",
  "Description": "Standard retail pricing",
  "StartDate": "2026-01-01T00:00:00Z",
  "EndDate": "2026-12-31T23:59:59Z",
  "CurrencyId": "<currency-guid>"
}'

# Update
absuite pricing update price-list --TenantId $TENANT_ID --PriceListId <list-guid> --PriceListUpdateDto '{...}'

# Delete
absuite pricing delete price-list --TenantId $TENANT_ID --PriceListId <list-guid>
```

**REST API equivalents:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<list-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Retail Price List 2026",
    "description": "Standard retail pricing",
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "currencyId": "<currency-guid>"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<list-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Price List",
    "description": "Updated description",
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "currencyId": "<currency-guid>"
  }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<list-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Price List Entries (Prices)

```bash
# List entries in a price list
absuite pricing list price-list-prices --TenantId $TENANT_ID --PriceListId <list-guid>

# Get a specific entry
absuite pricing get price-list-price --TenantId $TENANT_ID --PriceListPriceId <entry-guid>

# Create an entry (set price for an item in a price list)
absuite pricing create price-list-prices --TenantId $TENANT_ID --PriceListPriceCreateDto '{
  "PriceListId": "<list-guid>",
  "ItemId": "<item-guid>",
  "Amount": 49.99
}'

# Update
absuite pricing update price-list-price --TenantId $TENANT_ID --PriceListPriceId <entry-guid> --PriceListPriceUpdateDto '{...}'

# Delete
absuite pricing delete price-list-price --TenantId $TENANT_ID --PriceListPriceId <entry-guid>
```

**REST API equivalents:**
```bash
# List entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<list-guid>/Prices" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get entry by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<list-guid>/Prices/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create entry
curl -X POST "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<list-guid>/Prices" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "<item-guid>",
    "priceListId": "<list-guid>",
    "price": 49.99
  }'

# Update entry
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<list-guid>/Prices/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "price": 59.99 }'

# Delete entry
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PricingService/PriceLists/<list-guid>/Prices/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Discount Lists

```bash
# List
absuite pricing list discount-lists --TenantId $TENANT_ID

# Count
absuite pricing count discount-lists --TenantId $TENANT_ID

# Get by ID
absuite pricing get discount-list --TenantId $TENANT_ID --DiscountListId <list-guid>

# Create
absuite pricing create discount-list --TenantId $TENANT_ID --DiscountListCreateDto '{
  "Name": "VIP Discounts",
  "Description": "Discounts for VIP customers"
}'

# Update
absuite pricing update discount-list --TenantId $TENANT_ID --DiscountListId <list-guid> --DiscountListUpdateDto '{...}'

# Delete
absuite pricing delete discount-list --TenantId $TENANT_ID --DiscountListId <list-guid>
```

**REST API equivalents:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<list-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VIP Discounts",
    "currencyId": "<currency-guid>"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<list-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Updated Discounts", "currencyId": "<currency-guid>" }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<list-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Discount List Entries

```bash
# List entries
absuite pricing list discount-list-entries --TenantId $TENANT_ID --DiscountListId <list-guid>

# Count entries
absuite pricing count discount-list-entries --TenantId $TENANT_ID --DiscountListId <list-guid>

# Get specific entry
absuite pricing get discount-list-entry --TenantId $TENANT_ID --DiscountListEntryId <entry-guid>

# Create entry
absuite pricing create discount-list-entry --TenantId $TENANT_ID --DiscountListEntryCreateDto '{
  "DiscountListId": "<list-guid>",
  "ItemId": "<item-guid>",
  "DiscountPercentage": 15.0
}'

# Update entry
absuite pricing update discount-list-entry --TenantId $TENANT_ID --DiscountListEntryId <entry-guid> --DiscountListEntryUpdateDto '{...}'

# Delete entry
absuite pricing delete discount-list-entry --TenantId $TENANT_ID --DiscountListEntryId <entry-guid>
```

**REST API equivalents:**
```bash
# List entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<list-guid>/Discounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<list-guid>/Discounts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get entry by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<list-guid>/Discounts/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create entry
curl -X POST "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<list-guid>/Discounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "VIP discount",
    "percent": 15.0,
    "discountListId": "<list-guid>"
  }'

# Update entry
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<list-guid>/Discounts/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "percent": 20.0, "discountListId": "<list-guid>" }'

# Delete entry
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PricingService/DiscountLists/<list-guid>/Discounts/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Pricing Rules

```bash
# List
absuite pricing list pricing-rules --TenantId $TENANT_ID

# Count
absuite pricing count pricing-rules --TenantId $TENANT_ID

# Get by ID
absuite pricing get pricing-rule --TenantId $TENANT_ID --PricingRuleId <rule-guid>

# Create
absuite pricing create pricing-rule --TenantId $TENANT_ID --PricingRuleCreateDto '{...}'

# Update
absuite pricing update pricing-rule --TenantId $TENANT_ID --PricingRuleId <rule-guid> --PricingRuleUpdateDto '{...}'

# Delete
absuite pricing delete pricing-rule --TenantId $TENANT_ID --PricingRuleId <rule-guid>
```

**REST API equivalents:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules/<rule-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Seasonal Rule",
    "description": "Summer sale pricing rule",
    "isEnabled": "true",
    "percentage": 10.0
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules/Update" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Updated Rule", "percentage": 15.0 }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PricingService/PricingRules/<rule-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Rounding Policies

```bash
# List
absuite pricing list rounding-policies --TenantId $TENANT_ID

# Count
absuite pricing count rounding-policies --TenantId $TENANT_ID

# Get by ID
absuite pricing get rounding-policy --TenantId $TENANT_ID --RoundingPolicyId <policy-guid>

# Create
absuite pricing create rounding-policy --TenantId $TENANT_ID --RoundingPolicyCreateDto '{
  "title": "Round to nearest cent",
  "description": "Standard rounding policy"
}'

# Update
absuite pricing update rounding-policy --TenantId $TENANT_ID --RoundingPolicyId <policy-guid> --RoundingPolicyUpdateDto '{...}'

# Delete
absuite pricing delete rounding-policy --TenantId $TENANT_ID --RoundingPolicyId <policy-guid>
```

**REST API equivalents:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Round to nearest cent",
    "description": "Standard rounding policy",
    "isEnabled": "true"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Updated policy", "description": "Revised rounding" }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PricingService/RoundingPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Price Calculation

### Get Calculated Price for an Item

```bash
absuite pricing get price --TenantId $TENANT_ID --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/Prices/<item-guid>/Price" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Final Price (after discounts and taxes)

```bash
absuite pricing get final-price --TenantId $TENANT_ID --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/Prices/<item-guid>/FinalPrice" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Total Savings (in USD)

```bash
absuite pricing get total-savings-in-usd --TenantId $TENANT_ID --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/Prices/<item-guid>/TotalSavings" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Total Taxes (in USD)

```bash
absuite pricing get total-taxes-in-usd --TenantId $TENANT_ID --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PricingService/Prices/<item-guid>/TotalTaxes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List price lists | `absuite pricing list price-lists --TenantId <guid>` |
| Create price list | `absuite pricing create price-list --TenantId <guid> --PriceListCreateDto '{...}'` |
| Set item price | `absuite pricing create price-list-prices --TenantId <guid> --PriceListPriceCreateDto '{...}'` |
| List discount lists | `absuite pricing list discount-lists --TenantId <guid>` |
| Create discount | `absuite pricing create discount-list-entry --TenantId <guid> --DiscountListEntryCreateDto '{...}'` |
| List pricing rules | `absuite pricing list pricing-rules --TenantId <guid>` |
| List rounding policies | `absuite pricing list rounding-policies --TenantId <guid>` |
| Get final price | `absuite pricing get final-price --TenantId <guid> --ItemId <guid>` |
| Get total taxes | `absuite pricing get total-taxes-in-usd --TenantId <guid> --ItemId <guid>` |

## Critical Rules

- **Authenticate first.** Always provide a tenant context.
- **Create price lists before price entries.** Entries reference a price list ID.
- **Create discount lists before discount entries.**
- **Price calculations are dynamic** — they apply active price lists, discount lists, and tax policies.

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v2/PricingService/PriceLists` | Create price list |
| GET | `/api/v2/PricingService/PriceLists` | List price lists |
| GET | `/api/v2/PricingService/PriceLists/Count` | Count price lists |
| GET | `/api/v2/PricingService/PriceLists/:priceListId` | Get price list by ID |
| PUT | `/api/v2/PricingService/PriceLists/:priceListId` | Update price list |
| DELETE | `/api/v2/PricingService/PriceLists/:priceListId` | Delete price list |
| POST | `/api/v2/PricingService/PriceLists/:priceListId/Prices` | Create price entry |
| GET | `/api/v2/PricingService/PriceLists/:priceListId/Prices` | List price entries |
| GET | `/api/v2/PricingService/PriceLists/:priceListId/Prices/:priceId` | Get price entry |
| PUT | `/api/v2/PricingService/PriceLists/:priceListId/Prices/:priceId` | Update price entry |
| DELETE | `/api/v2/PricingService/PriceLists/:priceListId/Prices/:priceId` | Delete price entry |
| POST | `/api/v2/PricingService/DiscountLists` | Create discount list |
| GET | `/api/v2/PricingService/DiscountLists` | List discount lists |
| GET | `/api/v2/PricingService/DiscountLists/Count` | Count discount lists |
| GET | `/api/v2/PricingService/DiscountLists/:discountListId` | Get discount list |
| PUT | `/api/v2/PricingService/DiscountLists/:discountListId` | Update discount list |
| DELETE | `/api/v2/PricingService/DiscountLists/:discountListId` | Delete discount list |
| POST | `/api/v2/PricingService/DiscountLists/:discountListId/Discounts` | Create discount entry |
| GET | `/api/v2/PricingService/DiscountLists/:discountListId/Discounts` | List discount entries |
| GET | `/api/v2/PricingService/DiscountLists/:discountListId/Discounts/Count` | Count discount entries |
| GET | `/api/v2/PricingService/DiscountLists/:discountListId/Discounts/:entryId` | Get discount entry |
| PUT | `/api/v2/PricingService/DiscountLists/:discountListId/Discounts/:entryId` | Update discount entry |
| DELETE | `/api/v2/PricingService/DiscountLists/:discountListId/Discounts/:entryId` | Delete discount entry |
| POST | `/api/v2/PricingService/PricingRules` | Create pricing rule |
| GET | `/api/v2/PricingService/PricingRules` | List pricing rules |
| GET | `/api/v2/PricingService/PricingRules/Count` | Count pricing rules |
| GET | `/api/v2/PricingService/PricingRules/:pricingRuleId` | Get pricing rule |
| PUT | `/api/v2/PricingService/PricingRules/Update` | Update pricing rule |
| DELETE | `/api/v2/PricingService/PricingRules/:pricingRuleId` | Delete pricing rule |
| POST | `/api/v2/PricingService/RoundingPolicies` | Create rounding policy |
| GET | `/api/v2/PricingService/RoundingPolicies` | List rounding policies |
| GET | `/api/v2/PricingService/RoundingPolicies/Count` | Count rounding policies |
| GET | `/api/v2/PricingService/RoundingPolicies/:roundingPolicyId` | Get rounding policy |
| PUT | `/api/v2/PricingService/RoundingPolicies/:roundingPolicyId` | Update rounding policy |
| DELETE | `/api/v2/PricingService/RoundingPolicies/:roundingPolicyId` | Delete rounding policy |
| GET | `/api/v2/PricingService/Prices/:itemId/Price` | Get calculated price |
| GET | `/api/v2/PricingService/Prices/:itemId/FinalPrice` | Get final price |
| GET | `/api/v2/PricingService/Prices/:itemId/TotalSavings` | Get total savings |
| GET | `/api/v2/PricingService/Prices/:itemId/TotalTaxes` | Get total taxes |
