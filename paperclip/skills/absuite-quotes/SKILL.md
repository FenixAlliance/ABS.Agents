---
name: absuite-quotes
description: >
  Manage sales quotes, quote lines, quote calculations, and quote-to-order conversion
  in the Alliance Business Suite (ABS) using the `absuite` CLI. Covers full quote
  lifecycle: create, calculate, close, reopen, convert to order, and email delivery.
  Requires an authenticated CLI session.
---

# Alliance Business Suite — Quotes Skill

Manage quotes through the `absuite` CLI's `quotes` service. All operations are tenant-scoped.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite quotes list-commands`

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

## Quotes

### List Quotes

```bash
absuite quotes list --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Extended Quotes (with related data)

```bash
absuite quotes list extended --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Quotes

```bash
absuite quotes count --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Quote by ID

```bash
absuite quotes get --TenantId $TENANT_ID --QuoteId <quote-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Quote

```bash
absuite quotes create --TenantId $TENANT_ID --QuoteCreateDto '{
  "Title": "Q-2026-042: Website Redesign",
  "Description": "Quote for complete website redesign project",
  "IndividualId": "<contact-guid>",
  "CurrencyId": "<currency-guid>",
  "PriceListId": "<price-list-guid>",
  "PaymentTermId": "<payment-term-guid>",
  "EffectiveFrom": "2026-04-19T00:00:00Z",
  "EffectiveTo": "2026-05-19T00:00:00Z",
  "FirstName": "Jane",
  "LastName": "Doe",
  "CompanyName": "Acme Corp",
  "BillingEmail": "jane.doe@acme.com",
  "CountryId": "USA"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q-2026-042: Website Redesign",
    "description": "Quote for complete website redesign project",
    "individualId": "<contact-guid>",
    "currencyId": "<currency-guid>",
    "priceListId": "<price-list-guid>",
    "paymentTermId": "<payment-term-guid>",
    "effectiveFrom": "2026-04-19T00:00:00Z",
    "effectiveTo": "2026-05-19T00:00:00Z",
    "firstName": "Jane",
    "lastName": "Doe",
    "companyName": "Acme Corp",
    "billingEmail": "jane.doe@acme.com",
    "countryId": "USA"
  }'
```

**Key QuoteCreateDto fields:**

| Field | Type | Description |
|---|---|---|
| `Title` | String | Quote title |
| `Description` | String | Description |
| `IndividualId` | String | Customer contact (individual) |
| `OrganizationId` | String | Customer contact (organization) |
| `CurrencyId` | String | Quote currency |
| `PriceListId` | String | Price list to use |
| `PaymentTermId` | String | Payment terms |
| `EffectiveFrom` / `EffectiveTo` | DateTime | Validity period |
| `DealUnitId` | String | Linked deal unit |
| `CartId` | String | Linked cart |
| `ReceiverTenantId` | String | Receiving tenant |
| `CostCalculationMethod` | String | Cost calculation method |
| `TaxCalculationMethod` | String | Tax calculation method |
| `QuoteStatus` | String | Status |

### Update Quote

```bash
absuite quotes update --TenantId $TENANT_ID --QuoteId <quote-guid> --QuoteUpdateDto '{...}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Delete Quote

```bash
absuite quotes delete --TenantId $TENANT_ID --QuoteId <quote-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Quote Lines

### List Quote Lines

```bash
absuite quotes list lines --TenantId $TENANT_ID --QuoteId <quote-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Quote Lines

```bash
absuite quotes count lines --TenantId $TENANT_ID --QuoteId <quote-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Lines/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Quote Line

```bash
absuite quotes get line --TenantId $TENANT_ID --QuoteLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Lines/$QUOTE_LINE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Quote Line

```bash
absuite quotes create line --TenantId $TENANT_ID --QuoteLineCreateDto '{
  "QuoteId": "<quote-guid>",
  "ItemId": "<item-guid>",
  "Quantity": 5,
  "UnitPrice": 200.00,
  "Description": "Design consultation hours"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quoteId": "<quote-guid>",
    "itemId": "<item-guid>",
    "quantity": 5,
    "description": "Design consultation hours"
  }'
```

### Upsert Quote Line (Create or Update)

```bash
absuite quotes upsert line --TenantId $TENANT_ID --QuoteLineUpsertDto '{
  "QuoteId": "<quote-guid>",
  "ItemId": "<item-guid>",
  "Quantity": 10
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Lines/$QUOTE_LINE_ID/Upsert" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quoteId": "<quote-guid>",
    "itemId": "<item-guid>",
    "quantity": 10
  }'
```

### Update Quote Line

```bash
absuite quotes update line --TenantId $TENANT_ID --QuoteLineId <line-guid> --QuoteLineUpdateDto '{...}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Lines/$QUOTE_LINE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Delete Quote Line

```bash
absuite quotes delete line --TenantId $TENANT_ID --QuoteLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Lines/$QUOTE_LINE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Check if Quote Line Exists

```bash
absuite quotes line-exists --TenantId $TENANT_ID --QuoteLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Lines/Exists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Calculations

### Calculate Quote Totals

```bash
absuite quotes calculate --TenantId $TENANT_ID --QuoteId <quote-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Calculate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Calculate a Single Line

```bash
absuite quotes calculate line --TenantId $TENANT_ID --QuoteLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Lines/$QUOTE_LINE_ID/Calculate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Quote Lifecycle

### Close Quote

```bash
absuite quotes close --TenantId $TENANT_ID --QuoteId <quote-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Close" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Reopen Quote

```bash
absuite quotes reopen --TenantId $TENANT_ID --QuoteId <quote-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Reopen" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Order from Quote

```bash
absuite quotes create order-from --TenantId $TENANT_ID --QuoteId <quote-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Orders" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Email

### Preview Email Template

```bash
absuite quotes preview email-template --TenantId $TENANT_ID --QuoteId <quote-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Send Quote Email

```bash
absuite quotes send email --TenantId $TENANT_ID --QuoteId <quote-guid> --EmailDispatchRequest '{
  "title": "Your Quote from Acme Corp",
  "message": "Please find your quote attached.",
  "culture": "en-US"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/$QUOTE_ID/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Quote from Acme Corp",
    "message": "Please find your quote attached.",
    "culture": "en-US"
  }'
```

## Submit Cart

### Submit Cart as Quote

```bash
absuite quotes submit-cart --TenantId $TENANT_ID --CartSubmitDto '{
  "CartId": "<cart-guid>"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/SubmitCart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "<cart-guid>"
  }'
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List quotes | `absuite quotes list --TenantId <guid>` |
| Create quote | `absuite quotes create --TenantId <guid> --QuoteCreateDto '{...}'` |
| Add line | `absuite quotes create line --TenantId <guid> --QuoteLineCreateDto '{...}'` |
| Calculate | `absuite quotes calculate --TenantId <guid> --QuoteId <guid>` |
| Close | `absuite quotes close --TenantId <guid> --QuoteId <guid>` |
| Reopen | `absuite quotes reopen --TenantId <guid> --QuoteId <guid>` |
| Convert to order | `absuite quotes create order-from --TenantId <guid> --QuoteId <guid>` |
| Send email | `absuite quotes send email --TenantId <guid> --QuoteId <guid> --EmailDispatchRequest '{...}'` |

## Full Example: Quote-to-Order Flow

```bash
# 1. Create a quote
absuite quotes create --QuoteCreateDto '{
  "Title": "Q-2026-042",
  "IndividualId": "<contact-guid>",
  "CurrencyId": "<currency-guid>",
  "EffectiveFrom": "2026-04-19T00:00:00Z",
  "EffectiveTo": "2026-05-19T00:00:00Z"
}'

# 2. Add lines
absuite quotes create line --QuoteLineCreateDto '{
  "QuoteId": "<quote-guid>",
  "ItemId": "<item-guid>",
  "Quantity": 5,
  "UnitPrice": 200.00
}'

# 3. Calculate totals
absuite quotes calculate --QuoteId <quote-guid>

# 4. Send to customer
absuite quotes send email --QuoteId <quote-guid> --EmailDispatchRequest '{
  "title": "Your Quote",
  "message": "Please review the attached quote."
}'

# 5. Close and convert to order
absuite quotes close --QuoteId <quote-guid>
absuite quotes create order-from --QuoteId <quote-guid>
```

## Critical Rules

- **Authenticate first.** Always provide a tenant context.
- **Calculate after adding/modifying lines** to update totals.
- **Close before converting to order** — use the lifecycle commands in order.
- **Use `upsert line`** when you want to create-or-update a line in one call.

## API Endpoints Quick Reference

| Action | REST Endpoint |
|---|---|
| Create quote | `POST /api/v2/QuotesService/Quotes` |
| List quotes | `GET /api/v2/QuotesService/Quotes` |
| Count quotes | `GET /api/v2/QuotesService/Quotes/Count` |
| List extended quotes | `GET /api/v2/QuotesService/Quotes/Extended` |
| Count extended quotes | `GET /api/v2/QuotesService/Quotes/Extended/Count` |
| Get quote | `GET /api/v2/QuotesService/Quotes/:quoteId` |
| Update quote | `PUT /api/v2/QuotesService/Quotes/:quoteId` |
| Delete quote | `DELETE /api/v2/QuotesService/Quotes/:quoteId` |
| Calculate quote | `PUT /api/v2/QuotesService/Quotes/:quoteId/Calculate` |
| Close quote | `PUT /api/v2/QuotesService/Quotes/:quoteId/Close` |
| Reopen quote | `PUT /api/v2/QuotesService/Quotes/:quoteId/Reopen` |
| Create order from quote | `POST /api/v2/QuotesService/Quotes/:quoteId/Orders` |
| Create line | `POST /api/v2/QuotesService/Quotes/:quoteId/Lines` |
| List lines | `GET /api/v2/QuotesService/Quotes/:quoteId/Lines` |
| Count lines | `GET /api/v2/QuotesService/Quotes/:quoteId/Lines/Count` |
| Check line exists | `GET /api/v2/QuotesService/Quotes/:quoteId/Lines/Exists` |
| Get line | `GET /api/v2/QuotesService/Quotes/:quoteId/Lines/:quoteLineId` |
| Update line | `PUT /api/v2/QuotesService/Quotes/:quoteId/Lines/:quoteLineId` |
| Delete line | `DELETE /api/v2/QuotesService/Quotes/:quoteId/Lines/:quoteLineId` |
| Calculate line | `PUT /api/v2/QuotesService/Quotes/:quoteId/Lines/:quoteLineId/Calculate` |
| Upsert line | `PUT /api/v2/QuotesService/Quotes/:quoteId/Lines/:quoteLineId/Upsert` |
| Preview email | `POST /api/v2/QuotesService/Quotes/:quoteId/Emails/Preview` |
| Send email | `POST /api/v2/QuotesService/Quotes/:quoteId/Emails/Send` |
| Submit cart | `POST /api/v2/QuotesService/Quotes/SubmitCart` |
