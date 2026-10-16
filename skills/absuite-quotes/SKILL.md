---
name: absuite-quotes
key: paperclip/skills/absuite-quotes/SKILL.md
version: 1.0.0
description: >
  Create, read, update, patch, delete, and manage sales quotes in the Alliance
  Business Suite (ABS) Quotes Service via the REST API. Covers quotes, quote lines,
  calculations, lifecycle actions (close, reopen, convert to order, place an order as
  the receiver), received quotes, and transactional email, including atomic PATCH
  (JSON Patch) updates. Workspace operations are tenant-scoped and every call requires
  a bearer token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite: Quotes Skill (REST)

Manage sales quotes through the ABS Quotes Service REST API. Workspace Quotes endpoints
are tenant-scoped: pass `?tenantId=<tenant-guid>` (or the equivalent `X-TenantId: <tenant-guid>`
header) on those requests: GET, POST, PUT, PATCH, and DELETE alike. The only exceptions
are the `Me/...` routes, which run as the signed-in user.

> For the CLI equivalent see `absuite-quotes-cli`; for general REST conventions
> (envelope, tenant scoping, JSON Patch) see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select`: page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource**: it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) causes silent data loss.
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902): it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

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

4. **Response envelope**: every response is wrapped:
```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "...",
  "timestamp": "...",
  "result": { }
}
```
Always check `isSuccess`; read the payload from `result` (an object, an array, an int for `Count`, a bool for `Exists`, or `null`).

## Permissions (checked in the workspace named by `tenantId`)

| Operation | Permission |
|---|---|
| List, count, get quotes and lines; line `Exists`; `Received` reads | `quotes_read` |
| Create a quote; create a quote line | `quotes_create` |
| Update, patch, calculate, close, reopen a quote; create an order from your own quote (`/Orders`); update, patch, upsert, calculate a line | `quotes_update` |
| Delete a quote; delete a quote line | `quotes_delete` |
| `PlaceOrder` (as the receiving workspace) | `orders_create` |
| Email `Send` / `Preview` | `email_send` |
| `Me/Received` reads, `Me/{quoteId}/PlaceOrder` | none (runs as the signed-in user) |

## Key Concepts

- **Quote**: a sales proposal document with header info (customer, currency, totals, status), line items, and a validity window (`effectiveFrom` / `effectiveTo`). If you do not set `effectiveTo`, the quote is valid for about 30 days from creation.
- **Quote Line**: an individual item/service quoted, with quantity, pricing, and tax info.
- **Extended Quote**: a quote read with related data eagerly loaded (`/Extended`).
- **QuoteStatus**: lifecycle state: `Draft` | `New` | `Accepted` | `Declined` | `Expired`. New quotes default to `Draft`.
- **CostCalculationMethod**: `Automatic` | `Custom`.
- **TaxCalculationMethod**: `Included` | `Excluded`.
- **FreightTerms** (on a quote update): `FOB` | `NoCharge`.
- **`closed` / Close / Reopen**: a closed quote can no longer be modified, converted to an order, or ordered by its receiver. `closed` is a boolean header field, and there are dedicated `/Close` and `/Reopen` action endpoints. Reopening a quote that is not closed changes nothing; a reopened `Expired` quote whose validity window is still running goes back to `New`.
- **Convert to order** (issuer side): `POST /{quoteId}/Orders` turns your own quote into an order. The quote must be `Accepted` and not closed.
- **Place an order** (receiver side): the workspace or person that *received* a quote accepts it and places an order with `POST /{quoteId}/PlaceOrder` (or `Me/{quoteId}/PlaceOrder`). It is idempotent: a repeat call returns the same order id. It refuses a closed, expired, or already declined quote.
- **Received quotes**: quotes issued to your workspace (or to you personally) by a seller. Read-only views under `Received` and `Me/Received`.
- **Order numbers**: an order created from a quote gets a server-assigned number, shown on the order as `numberLabel` (e.g. `ORD-000123`); see `absuite-orders`.

> Request bodies use camelCase JSON keys (e.g. `"title"`, `"currencyId"`,
> `"quoteStatus"`); PascalCase keys also bind. Monetary amounts on update DTOs are split
> into a value field and a matching `...CurrencyId` field (e.g. `total` + `totalCurrencyId`).
>
> **Note:** the Quotes Service exposes **quotes and quote lines only**. There are no
> quote-line tax or adjustment sub-resources on this service: line-level tax and
> discount/surcharge fields are carried inline on the quote-line body (e.g.
> `totalTaxes`, `totalDiscounts`, `totalSurcharges`, `customGlobalDiscountsAmount`,
> `customGlobalSurchargesAmount`). Server-side computation is driven by the `/Calculate`
> actions.

## Workflow: Creating a Quote

1. **Create the quote header** with customer, currency, billing info, and validity window.
2. **Add quote lines** for each quoted item/service (or pass them inline at create time).
3. **Calculate totals**: let the server compute taxes, discounts, and grand total.
4. **Patch the status** (e.g. `Draft` -> `New` -> `Accepted`) and **send** the quote via transactional email.
5. **Convert the accepted quote to an order**, then **close** it if you want it locked (convert first: a closed quote cannot be converted).

## Quotes

### Create Quote

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "<new-quote-guid>",
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

Returns **201 Created** with a `Location` header pointing at the new quote. Send your
own `id` (a new GUID) so you know the quote's ID up front; if you omit it the server
generates one and you read it from `Location`.

**`QuoteCreateDto` fields** (all optional unless noted):
`id`, `timestamp`, `closed` (bool), `title`, `priceListId`, `description`, `individualId`,
`paymentTermId`, `organizationId`, `receiverTenantId`, `firstName`, `lastName`, `companyName`,
`billingEmail`, `addressLine1`, `addressLine2`, `postalCode`, `countryId`, `stateId`, `cityId`,
`forexRate` (number), `forexRatesSnapshot`, `currencyId`, the monetary amounts (`totalDetail`,
`totalProfit`, `totalDiscounts`, `totalSurcharges`, `totalShippingCost`, `totalShippingTax`,
`totalWithheldTax`, `totalTaxBase`, `totalTaxes`, `totalGlobalSurcharges`,
`totalGlobalDiscounts`, `total`), `costCalculationMethod` (`Automatic`|`Custom`),
`taxCalculationMethod` (`Included`|`Excluded`), `cartId`, `dealUnitId`,
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

### Update Quote (PUT, full replace)

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

The `QuoteUpdateDto` carries the same header/monetary fields as `QuoteCreateDto` (each
amount with its `...CurrencyId`), plus `userId`, `billingLocationId`, `shippingLocationId`,
`shippingMethodId`, `freightTerms` (`FOB`|`NoCharge`), and the `custom*Amount` overrides
(`customTaxAmount`, `customTotalAmount`, `customDetailAmount`, `customProfitAmount`,
`customDiscountsAmount`, `customSurchargesAmount`, `customShippingCostAmount`,
`customShippingTaxAmount`, `customWithholdingTaxAmount`). It does **not** carry `id`,
`timestamp`, `dealUnitId`, or the inline `quoteLines` array. Prefer PATCH (below) for
small, partial edits. A closed quote refuses updates.

### Patch Quote (PATCH, JSON Patch RFC 6902)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/quoteStatus", "value": "Accepted" },
    { "op": "replace", "path": "/description", "value": "Customer accepted; ready to convert" }
  ]'
```

Paths must name a field of `QuoteUpdateDto` (camelCase JSON Pointer).

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

Requires `quotes_update`. After closing, the quote cannot be modified, converted, or ordered until reopened.

### Reopen Quote

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Reopen?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Requires `quotes_update`.

### Create Order from Quote (issuer)

Converts your own quote into an order. Requires `quotes_update`. The quote must be `Accepted` (patch `/quoteStatus` first) and not closed.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Orders?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Place Order from a Received Quote (receiver)

The receiver of a quote accepts it and places an order. Returns the order id in
`result`. Idempotent: a repeat call returns the same order. Refuses a closed, expired,
or declined quote; a quote you did not receive answers **404**.

```bash
# As the receiving workspace (orders_create in that workspace)
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/PlaceOrder?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# As the personal receiver (no tenantId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/Me/<quote-guid>/PlaceOrder" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Received Quotes

Quotes your workspace or you personally received from a seller. Read-only.

```bash
# Quotes the workspace received (quotes_read in that workspace)
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/Received?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Quotes you personally received (no tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/Me/Received" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Each branch also has `/Count`, `/{quoteId}` and `/{quoteId}/Lines` (see the quick reference).

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

Check by quote-line ID or by item ID. Pass at least one of the two query params;
sending neither returns **400**.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines/Exists?tenantId=<tenant-guid>&quoteLineId=<quote-line-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# ...or by item:
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
`freeReason`, `freeReasonCode`, the `data`/`dataLabel` to `data9`/`data9Label` custom slots,
`itemPriceId`, `priceListItemId`, `unitId`, `unitGroupId`, `forexRatesSnapshot`, the
`...InUsd` snapshot totals (e.g. `totalBaseAmountInUsd`, `totalProfitInUsd`,
`totalDetailAmountInUsd`, `totalTaxBaseInUsd`, `totalDiscountsInUsd`, `totalTaxesInUsd`,
`totalWithheldTaxesInUsd`, `totalShippingCostInUsd`, `totalShippingTaxesInUsd`,
`totalWarrantyCostInUsd`, `totalReturnCostInUsd`, `totalRefundCostInUsd`,
`totalSurchargesInUsd`, `totalAmountInUsd`, `totalGlobalDiscountsInUsd`,
`totalGlobalSurchargesInUsd`), `customGlobalSurchargesAmount` (+`...CurrencyId`),
`customGlobalDiscountsAmount` (+`...CurrencyId`), `returnPolicyId`, `refundPolicyId`,
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
`billingLocationId`, `shippingMethodId` and the `...CurrencyId` amount pairs. It does
**not** carry `id` or `quoteId`.

### Patch Line (PATCH, JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines/<quote-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/quantity", "value": 6 }
  ]'
```

### Upsert Line (PUT, create or update)

Create-or-update a line in one call. The `QuoteLineUpsertDto` adds `id` and `quoteId`
on top of the update fields.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes/<quote-guid>/Lines/<quote-line-guid>/Upsert?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "<quote-line-guid>",
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

Both email endpoints require the caller to hold the `email_send` permission in the
workspace named by `tenantId`.

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
- `title`: email subject line *(required)*
- `message`: email body text *(required)*
- `culture` / `uiCulture`: email locale, e.g. `en-US` *(both required)*
- `recipients`: array of email addresses *(required)*
- `contactIds`: array of CRM contact GUIDs (sends to their email)
- `tenantIds`: array of tenant GUIDs
- `userIds`: array of user GUIDs
- `buttonLink`, `buttonText`: optional CTA button
- `alertMessage`: optional alert banner text
- `alertType`: `None` | `Info` | `Error` | `Warning` | `Success` | `Action` | `Alert`
- `templateUrl`: override the template by URL
- `emailTemplateId`: use a specific email template

## End-to-End Workflow

```bash
TENANT="<tenant-guid>"
BASE="$ABSUITE_HOST_URL/api/v2/QuotesService/Quotes"

# 1. Create the quote header with your own id (<quote-guid>); the response is 201
curl -X POST "$BASE?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "id": "<quote-guid>",
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

# 2. Add a line (send your own "id" too if you need the line id later)
curl -X POST "$BASE/<quote-guid>/Lines?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Design consultation", "itemId": "<item-guid>", "quantity": 5, "currencyId": "<currency-guid>", "itemPriceId": "<price-guid>" }'

# 3. Calculate totals
curl -X PUT "$BASE/<quote-guid>/Calculate?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 4. Patch the status to New (sent to customer)
curl -X PATCH "$BASE/<quote-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/quoteStatus", "value": "New" } ]'

# 5. Send the quote email (email_send)
curl -X POST "$BASE/<quote-guid>/Emails/Send?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Your quote", "message": "Please review the attached quote.", "culture": "en-US", "uiCulture": "en-US", "recipients": ["<billing-email>"] }'

# 6. Customer accepts -> patch status, convert to an order, then close (convert BEFORE closing)
curl -X PATCH "$BASE/<quote-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/quoteStatus", "value": "Accepted" } ]'

curl -X POST "$BASE/<quote-guid>/Orders?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X PUT "$BASE/<quote-guid>/Close?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 7. Verify
curl -X GET "$BASE/<quote-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

All paths require `?tenantId=<tenant-guid>` (or the `X-TenantId` header) except the
`Me/...` routes, which run as the signed-in user.

| Action | Method | Path | Permission |
|---|---|---|---|
| List quotes | GET | `/api/v2/QuotesService/Quotes` | `quotes_read` |
| Count quotes | GET | `/api/v2/QuotesService/Quotes/Count` | `quotes_read` |
| List extended quotes | GET | `/api/v2/QuotesService/Quotes/Extended` | `quotes_read` |
| Create quote | POST | `/api/v2/QuotesService/Quotes` | `quotes_create` |
| Get quote | GET | `/api/v2/QuotesService/Quotes/{quoteId}` | `quotes_read` |
| Update quote | PUT | `/api/v2/QuotesService/Quotes/{quoteId}` | `quotes_update` |
| Patch quote | PATCH | `/api/v2/QuotesService/Quotes/{quoteId}` | `quotes_update` |
| Delete quote | DELETE | `/api/v2/QuotesService/Quotes/{quoteId}` | `quotes_delete` |
| Calculate quote | PUT | `/api/v2/QuotesService/Quotes/{quoteId}/Calculate` | `quotes_update` |
| Close quote | PUT | `/api/v2/QuotesService/Quotes/{quoteId}/Close` | `quotes_update` |
| Reopen quote | PUT | `/api/v2/QuotesService/Quotes/{quoteId}/Reopen` | `quotes_update` |
| Create order from quote | POST | `/api/v2/QuotesService/Quotes/{quoteId}/Orders` | `quotes_update` |
| Place order (receiving workspace) | POST | `/api/v2/QuotesService/Quotes/{quoteId}/PlaceOrder` | `orders_create` |
| Place order (personal receiver) | POST | `/api/v2/QuotesService/Quotes/Me/{quoteId}/PlaceOrder` | none (user) |
| Received quotes | GET | `/api/v2/QuotesService/Quotes/Received` | `quotes_read` |
| Count received | GET | `/api/v2/QuotesService/Quotes/Received/Count` | `quotes_read` |
| Get received quote | GET | `/api/v2/QuotesService/Quotes/Received/{quoteId}` | `quotes_read` |
| Received quote lines | GET | `/api/v2/QuotesService/Quotes/Received/{quoteId}/Lines` | `quotes_read` |
| My received quotes | GET | `/api/v2/QuotesService/Quotes/Me/Received` | none (user) |
| Count my received | GET | `/api/v2/QuotesService/Quotes/Me/Received/Count` | none (user) |
| Get my received quote | GET | `/api/v2/QuotesService/Quotes/Me/Received/{quoteId}` | none (user) |
| My received quote lines | GET | `/api/v2/QuotesService/Quotes/Me/Received/{quoteId}/Lines` | none (user) |
| List lines | GET | `/api/v2/QuotesService/Quotes/{quoteId}/Lines` | `quotes_read` |
| Count lines | GET | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/Count` | `quotes_read` |
| Check line exists | GET | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/Exists` | `quotes_read` |
| Create line | POST | `/api/v2/QuotesService/Quotes/{quoteId}/Lines` | `quotes_create` |
| Get line | GET | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}` | `quotes_read` |
| Update line | PUT | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}` | `quotes_update` |
| Patch line | PATCH | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}` | `quotes_update` |
| Upsert line | PUT | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}/Upsert` | `quotes_update` |
| Delete line | DELETE | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}` | `quotes_delete` |
| Calculate line | PUT | `/api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}/Calculate` | `quotes_update` |
| Preview email | POST | `/api/v2/QuotesService/Quotes/{quoteId}/Emails/Preview` | `email_send` |
| Send email | POST | `/api/v2/QuotesService/Quotes/{quoteId}/Emails/Send` | `email_send` |
