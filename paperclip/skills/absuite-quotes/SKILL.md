---
name: absuite-quotes
description: >
  Create, read, update, patch, delete, and manage sales quotes in the Alliance
  Business Suite (ABS) Quotes Service via the REST API. Covers quotes, quote lines,
  calculations, lifecycle actions (close, reopen, convert to order), and transactional
  email, including atomic PATCH (JSON Patch) updates. All operations are tenant-scoped
  and require a bearer token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Quotes Skill (REST)

Manage sales quotes through the ABS Quotes Service REST API. Every Quotes endpoint
is tenant-scoped: pass `?tenantId=<tenant-guid>` (or the equivalent `X-TenantId: <tenant-guid>`
header) on **every** request — GET, POST, PUT, PATCH, and DELETE alike.

> For the CLI equivalent see `absuite-quotes-cli`; for general REST conventions
> (envelope, tenant scoping, JSON Patch) see `absuite-rest`.

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

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes`

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
Always check `isSuccess`; read the payload from `result` (an object, an array, an int for `Count`, a bool for `Exists`, or `null`).

## Key Concepts

- **Quote** — a sales proposal document with header info (customer, currency, totals, status), line items, and a validity window.
- **Quote Line** — an individual item/service quoted, with quantity, pricing, and tax info.
- **Extended Quote** — a quote read with related data eagerly loaded (`/Extended`).
- **QuoteStatus** — lifecycle state: `Draft` | `New` | `Accepted` | `Declined` | `Expired`.
- **CostCalculationMethod** — `Automatic` | `Custom`.
- **TaxCalculationMethod** — `Included` | `Excluded`.
- **FreightTerms** (on a quote update) — `FOB` | `NoCharge`.
- **`Closed` / Close / Reopen** — a quote can be closed (finalized) and later reopened; `closed` is a boolean header field, and there are dedicated `/Close` and `/Reopen` action endpoints.
- **Convert to order** — a quote can be turned into an order via `/Orders`.

> Field names in request bodies are PascalCase JSON keys (e.g. `"Title"`, `"CurrencyId"`,
> `"QuoteStatus"`). Monetary amounts are split into a value field and a matching
> `…CurrencyId` field (e.g. `Total` + `TotalCurrencyId`).
>
> **Note:** the Quotes Service exposes **quotes and quote lines only**. There are no
> quote-line tax or adjustment sub-resources on this service — line-level tax and
> discount/surcharge fields are carried inline on the quote-line body (e.g.
> `totalTaxes`, `totalDiscounts`, `totalSurcharges`, `customGlobalDiscountsAmount`,
> `customGlobalSurchargesAmount`). Server-side computation is driven by the `/Calculate`
> actions.

## Workflow: Creating a Quote

1. **Create the quote header** with customer, currency, billing info, and validity window.
2. **Add quote lines** for each quoted item/service (or pass them inline at create time).
3. **Calculate totals** — let the server compute taxes, discounts, and grand total.
4. **Patch the status** (e.g. `Draft` → `New` → `Accepted`) and **send** the quote via transactional email.
5. **Close** the accepted quote and **convert it to an order**.

## Quotes

### Create Quote

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quote - Website Redesign",
    "description": "Quote for a complete website redesign project",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "organizationId": "<organization-guid>",
    "priceListId": "<price-list-guid>",
    "paymentTermId": "<payment-term-guid>",
    "firstName": "<first-name>",
    "lastName": "<last-name>",
    "companyName": "<company-name>",
    "billingEmail": "<billing-email>",
    "addressLine1": "<address-line-1>",
    "postalCode": "<postal-code>",
    "countryId": "<country-guid>",
    "stateId": "<state-guid>",
    "cityId": "<city-guid>",
    "costCalculationMethod": "Automatic",
    "taxCalculationMethod": "Excluded",
    "quoteStatus": "Draft",
    "effectiveFrom": "2026-06-12T00:00:00Z",
    "effectiveTo": "2026-07-12T00:00:00Z"
  }'
```

**`QuoteCreateDto` fields** (all optional unless noted; transcribed from the spec):
`id`, `timestamp`, `closed` (bool), `title`, `priceListId`, `description`, `individualId`,
`paymentTermId`, `organizationId`, `firstName`, `lastName`, `companyName`, `billingEmail`,
`addressLine1`, `addressLine2`, `postalCode`, `countryId`, `stateId`, `cityId`,
`forexRate` (number), `currencyId`, the monetary value/`…CurrencyId` pairs (`totalDetail`,
`totalProfit`, `totalDiscounts`, `totalSurcharges`, `totalShippingCost`, `totalShippingTax`,
`totalWithheldTax`, `totalTaxBase`, `totalTaxes`, `totalGlobalSurcharges`,
`totalGlobalDiscounts`, `total`), `costCalculationMethod` (`Automatic`|`Custom`),
`taxCalculationMethod` (`Included`|`Excluded`), `cartId`, `dealUnitId`, `receiverTenantId`,
`effectiveTo`, `effectiveFrom`, `quoteStatus` (`Draft`|`New`|`Accepted`|`Declined`|`Expired`),
and the inline array `quoteLines`.

### Create Quote with Inline Lines

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quote - Acme",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "costCalculationMethod": "Automatic",
    "taxCalculationMethod": "Excluded",
    "quoteStatus": "Draft",
    "quoteLines": [
      {
        "itemId": "<item-guid-1>",
        "quantity": 5,
        "currencyId": "<currency-guid>",
        "itemPriceId": "<price-guid-1>",
        "title": "Design consultation"
      },
      {
        "itemId": "<item-guid-2>",
        "quantity": 1,
        "currencyId": "<currency-guid>",
        "itemPriceId": "<price-guid-2>",
        "title": "Premium hosting"
      }
    ]
  }'
```

### List Quotes

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Quotes

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Extended Quotes (with related data)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Quote by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Quote (PUT — full replace)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quote - Website Redesign (revised)",
    "currencyId": "<currency-guid>",
    "quoteStatus": "New",
    "description": "Revised scope and pricing"
  }'
```

The `QuoteUpdateDto` carries the same header/monetary fields as `QuoteCreateDto`, plus
`userId`, `billingLocationId`, `shippingLocationId`, `shippingMethodId`,
`freightTerms` (`FOB`|`NoCharge`), and the `custom*Amount` overrides (`customTaxAmount`,
`customTotalAmount`, `customDetailAmount`, `customProfitAmount`, `customDiscountsAmount`,
`customSurchargesAmount`, `customShippingCostAmount`, `customShippingTaxAmount`,
`customWithholdingTaxAmount`). It does **not** carry `id`, `dealUnitId`, or the inline
`quoteLines` array. Prefer PATCH (below) for small, partial edits.

### Patch Quote (PATCH — JSON Patch RFC 6902)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/quoteStatus", "value": "Accepted" },
    { "op": "replace", "path": "/description", "value": "Customer accepted; ready to convert" }
  ]'
```

### Delete Quote

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Calculate Quote

Recompute server-side totals after editing lines.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Calculate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Quote Lifecycle Actions

### Close Quote

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Close?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Reopen Quote

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Reopen?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Order from Quote

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Orders?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Quote Lines

### List Lines

```bash
# Optionally filter by item with ?itemId=<item-guid>
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Lines

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Check if a Line Exists

Check by quote-line ID or by item ID (both optional query params).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines/Exists?tenantId=<tenant-guid>&quoteLineId=<quote-line-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# …or by item:
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines/Exists?tenantId=<tenant-guid>&itemId=<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Line by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines/<quote-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Line

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design consultation",
    "description": "Design consultation hours",
    "itemId": "<item-guid>",
    "itemPriceId": "<price-guid>",
    "quantity": 5,
    "currencyId": "<currency-guid>",
    "costCalculationMethod": "Automatic",
    "taxCalculationMethod": "Excluded"
  }'
```

**`QuoteLineCreateDto` fields** share the quote header/monetary fields and add the
item/quantity/line-level fields: `itemId`, `itemTitle`, `itemShortDescription`,
`itemPrimaryImageUrl`, `shippingPolicyId`, `quantity` (number), `free` (bool),
`freeReason`, `freeReasonCode`, the `data`/`dataLabel` … `data9`/`data9Label` custom slots,
`itemPriceId`, `priceListItemId`, `unitId`, `unitGroupId`, `forexRatesSnapshot`, the
`…InUsd` snapshot totals (e.g. `totalBaseAmountInUsd`, `totalProfitInUsd`,
`totalDetailAmountInUsd`, `totalTaxBaseInUsd`, `totalDiscountsInUsd`, `totalTaxesInUsd`,
`totalWithheldTaxesInUsd`, `totalShippingCostInUsd`, `totalShippingTaxesInUsd`,
`totalWarrantyCostInUsd`, `totalReturnCostInUsd`, `totalRefundCostInUsd`,
`totalSurchargesInUsd`, `totalAmountInUsd`, `totalGlobalDiscountsInUsd`,
`totalGlobalSurchargesInUsd`), `customGlobalSurchargesAmount`(+`…CurrencyId`),
`customGlobalDiscountsAmount`(+`…CurrencyId`), `returnPolicyId`, `refundPolicyId`,
`warrantyPolicyId`, `shipmentPolicyId`, `shippingLocationId`, `locationId`,
`quoteItemRecordId`, `parentBillingItemRecordId`, and `quoteId`.

### Update Line (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines/<quote-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 8,
    "description": "Increased to 8 hours",
    "currencyId": "<currency-guid>"
  }'
```

`QuoteLineUpdateDto` carries the same line fields as create plus `userId`,
`billingLocationId`, `shippingMethodId`. It does **not** carry `id`.

### Patch Line (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines/<quote-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/quantity", "value": 6 }
  ]'
```

### Upsert Line (PUT — create or update)

Create-or-update a line in one call. The `QuoteLineUpsertDto` adds `id` and `quoteId`
on top of the update fields.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines/<quote-line-guid>/Upsert?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quoteId": "<quote-guid>",
    "itemId": "<item-guid>",
    "quantity": 10,
    "currencyId": "<currency-guid>"
  }'
```

### Delete Line

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines/<quote-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Calculate Line

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines/<quote-line-guid>/Calculate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Email Notifications

### Preview Quote Email

Renders the email without sending. Same body as Send (an `EmailDispatchRequest`).

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Emails/Preview?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your quote",
    "message": "Please review the attached quote.",
    "culture": "en-US",
    "uiCulture": "en-US",
    "recipients": ["<billing-email>"]
  }'
```

### Send Quote Email

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Emails/Send?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your quote",
    "message": "Please review the attached quote. It is valid until 2026-07-12.",
    "culture": "en-US",
    "uiCulture": "en-US",
    "recipients": ["<billing-email>"]
  }'
```

**`EmailDispatchRequest` fields** (`title`, `message`, `culture`, `uiCulture`, `recipients` are **required**):
- `title` — email subject line *(required)*
- `message` — email body text *(required)*
- `culture` / `uiCulture` — email locale, e.g. `en-US` *(both required)*
- `recipients` — array of email addresses *(required)*
- `contactIds` — array of CRM contact GUIDs (sends to their email)
- `tenantIds` — array of tenant GUIDs
- `userIds` — array of user GUIDs
- `buttonLink`, `buttonText` — optional CTA button
- `alertMessage` — optional alert banner text
- `alertType` — `None` | `Info` | `Error` | `Warning` | `Success` | `Action` | `Alert`
- `templateUrl` — override the template by URL
- `emailTemplateId` — use a specific email template

## End-to-End Workflow

```bash
TENANT="<tenant-guid>"
BASE="$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes"

# 1. Create the quote header
curl -X POST "$BASE?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "title": "Quote - Website Redesign",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "billingEmail": "<billing-email>",
    "costCalculationMethod": "Automatic",
    "taxCalculationMethod": "Excluded",
    "quoteStatus": "Draft",
    "effectiveFrom": "2026-06-12T00:00:00Z",
    "effectiveTo": "2026-07-12T00:00:00Z"
  }'
# -> capture result.id as QUOTE

# 2. Add a line
curl -X POST "$BASE/<quote-guid>/Lines?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Design consultation", "itemId": "<item-guid>", "quantity": 5, "currencyId": "<currency-guid>", "itemPriceId": "<price-guid>" }'
# -> capture result.id as LINE

# 3. Calculate totals
curl -X PUT "$BASE/<quote-guid>/Calculate?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 4. Patch the status to New (sent to customer)
curl -X PATCH "$BASE/<quote-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/quoteStatus", "value": "New" } ]'

# 5. Send the quote email
curl -X POST "$BASE/<quote-guid>/Emails/Send?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Your quote", "message": "Please review the attached quote.", "culture": "en-US", "uiCulture": "en-US", "recipients": ["<billing-email>"] }'

# 6. Customer accepts -> patch status, close, and convert to an order
curl -X PATCH "$BASE/<quote-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/quoteStatus", "value": "Accepted" } ]'

curl -X PUT "$BASE/<quote-guid>/Close?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$BASE/<quote-guid>/Orders?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 7. Verify
curl -X GET "$BASE/<quote-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

All paths require `?tenantId=<tenant-guid>` (or the `X-TenantId` header).

| Action | Method | Path |
|---|---|---|
| List quotes | GET | `/api/v2/QuotesService/Quotes` |
| Count quotes | GET | `/api/v2/QuotesService/Quotes/Count` |
| List extended quotes | GET | `/api/v2/QuotesService/Quotes/Extended` |
| Create quote | POST | `/api/v2/QuotesService/Quotes` |
| Get quote | GET | `/api/v2/QuotesService/Quotes/{quoteId}` |
| Update quote | PUT | `/api/v2/QuotesService/Quotes/{quoteId}` |
| Patch quote | PATCH | `/api/v2/QuotesService/Quotes/{quoteId}` |
| Delete quote | DELETE | `/api/v2/QuotesService/Quotes/{quoteId}` |
| Calculate quote | PUT | `/api/v2/QuotesService/Quotes/{quoteId}/Calculate` |
| Close quote | PUT | `/api/v2/QuotesService/Quotes/{quoteId}/Close` |
| Reopen quote | PUT | `/api/v2/QuotesService/Quotes/{quoteId}/Reopen` |
| Create order from quote | POST | `/api/v2/QuotesService/Quotes/{quoteId}/Orders` |
| List lines | GET | `/api/v2/QuotesService/Quotes/{quoteId}/Lines` |
| Count lines | GET | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/Count` |
| Check line exists | GET | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/Exists` |
| Create line | POST | `/api/v2/QuotesService/Quotes/{quoteId}/Lines` |
| Get line | GET | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}` |
| Update line | PUT | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}` |
| Patch line | PATCH | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}` |
| Upsert line | PUT | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}/Upsert` |
| Delete line | DELETE | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}` |
| Calculate line | PUT | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}/Calculate` |
| Preview email | POST | `/api/v2/QuotesService/Quotes/{quoteId}/Emails/Preview` |
| Send email | POST | `/api/v2/QuotesService/Quotes/{quoteId}/Emails/Send` |
