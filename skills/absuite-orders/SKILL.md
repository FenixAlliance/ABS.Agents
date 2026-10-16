---
name: absuite-orders
description: >
  Create, read, update, patch, delete, and calculate orders and order lines in the
  Alliance Business Suite (ABS) Orders Service via the REST API. Covers direct order
  creation, cart-to-order submission, line items, totals calculation, transactional
  email, and atomic PATCH (JSON Patch) updates. All operations are tenant-scoped and
  require a bearer token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Orders (REST)

Manage orders and order lines through the ABS **OrdersService** REST API. Every order
operation is tenant-scoped: pass `?tenantId=<tenant-guid>` on **every** request (read
*and* write). This skill is pure REST (`curl`). For the CLI equivalent, see
`absuite-orders-cli`. For shared REST conventions (auth, envelope, tenant scoping),
see `absuite-rest`.

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
Extract `accessToken` from the JSON response.

2. **Send the token on every call:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/OrdersService/...`

4. **Response envelope** — every response is wrapped:
```json
{ "isSuccess": true, "errorMessage": null, "correlationId": "...", "timestamp": "...", "result": <data|array|int|null> }
```
Always check `isSuccess`; read the payload from `result`.

## Tenant scoping

All `OrdersService` endpoints require `tenantId` **except** `SubmitCart` (which is scoped
to the authenticated user by `cartId`). Pass tenant as the query param
`?tenantId=<tenant-guid>` (preferred in examples). The header `X-TenantId: <tenant-guid>`
is read interchangeably by the platform. Omitting `tenantId` on a required endpoint
returns **400**.

## Key Concepts

- **Order** — a billing record with header info (customer, address, currency, totals,
  status) and zero or more line items.
- **Order Line** — an individual item/product within an order, with its own quantity,
  pricing, policies, and tax info.
- **Calculate** — server-side recalculation of totals (taxes, discounts, surcharges,
  shipping, USD equivalents) for an order or a single line. Uses `PUT .../Calculate`.
- **Submit Cart** — converts an existing shopping cart into an order for the
  authenticated user (`POST .../SubmitCart?cartId=<cart-guid>`).
- **PATCH** — atomic partial update via JSON Patch (RFC 6902); safer than PUT for
  changing a couple of fields under concurrency.

### Enum values (from the OpenAPI spec — authoritative)

- **`orderStatus`**: `New | Processing | Accepted | Declined | Shipped | Delivered | OnHold | Failed | Fulfilled | Cancelled`
- **`quoteStatus`** (on create): `Draft | New | Accepted | Declined | Expired`
- **`freightTerms`**: `FOB | NoCharge`
- **`costCalculationMethod`**: `Automatic | Custom`
- **`taxCalculationMethod`**: `Included | Excluded`
- **`alertType`** (email dispatch): `None | Info | Error | Warning | Success | Action | Alert`

> Note: request bodies are accepted as camelCase JSON (e.g. `"title"`, `"currencyId"`,
> `"orderStatus"`). PascalCase keys also bind. Examples below use camelCase.

## Orders

### List orders

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List extended orders (with related data)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count orders

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get an order by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create an order

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Order for a customer",
    "description": "Q2 software licenses",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "organizationId": "<organization-guid>",
    "firstName": "<first-name>",
    "lastName": "<last-name>",
    "companyName": "<company-name>",
    "billingEmail": "<billing-email>",
    "addressLine1": "<address-line-1>",
    "postalCode": "<postal-code>",
    "countryId": "<country-guid>",
    "stateId": "<state-guid>",
    "cityId": "<city-guid>",
    "orderStatus": "New",
    "costCalculationMethod": "Automatic",
    "taxCalculationMethod": "Excluded"
  }'
```

**Body: `OrderCreateDto`** (all fields optional; key ones shown). Other available
fields per spec: `id`, `timestamp`, `closed`, `priceListId`, `paymentTermId`,
`forexRate`, `cartId`, `quoteId`, `walletId`, `parentOrderId`, `shippingMethodId`,
`billingLocationId`, `shippingLocationId`, `customerNotes`, `quoteStatus`,
`freightTerms`, `receiverTenantId`, `qualifiedIdentifier`, `effectiveFrom`,
`effectiveTo`, the full `total*` / `total*CurrencyId` / `total*InUsd` set, and
`orderLines` (an inline array of `OrderLineCreateDto`).

### Create an order with inline lines

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bundled order",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "orderStatus": "New",
    "costCalculationMethod": "Automatic",
    "taxCalculationMethod": "Excluded",
    "orderLines": [
      { "itemId": "<item-guid-1>", "itemTitle": "<item-title-1>", "quantity": 5, "currencyId": "<currency-guid>", "itemPriceId": "<price-guid-1>" },
      { "itemId": "<item-guid-2>", "itemTitle": "<item-title-2>", "quantity": 1, "currencyId": "<currency-guid>", "itemPriceId": "<price-guid-2>" }
    ]
  }'
```

### Update an order (PUT — full replace)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated order title",
    "closed": true,
    "description": "Fulfilled and closed.",
    "currencyId": "<currency-guid>",
    "costCalculationMethod": "Automatic",
    "taxCalculationMethod": "Excluded"
  }'
```

**Body: `OrderUpdateDto`.** Note it differs from the create DTO: it adds `userId`,
`billingLocationId`, `shippingLocationId`, `shippingMethodId`; `quoteStatus` is a free
string here; and it has **no** `orderStatus`, `orderLines`, `quoteId`, `walletId`,
`parentOrderId`, `customerNotes`, `freightTerms`, or `qualifiedIdentifier`. To change
`orderStatus`, use PATCH (below).

### Patch an order (PATCH — JSON Patch, RFC 6902)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/orderStatus", "value": "Processing" },
    { "op": "replace", "path": "/title", "value": "New title" }
  ]'
```

See the **PATCH** section below for the full operation set.

### Delete an order

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Calculate order totals

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Calculate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```
No request body. Recalculates `totalDetail`, `totalTaxes`, `totalDiscounts`,
`totalSurcharges`, `totalShippingCost`, `totalShippingTax`, `totalWithheldTax`,
`totalGlobalDiscounts`, `totalGlobalSurcharges`, `total`, and the USD equivalents.

## Order Lines

### List order lines

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```
Optional `&itemId=<item-guid>` filters lines to a single catalog item.

### Count order lines

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Lines/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get an order line by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Lines/<order-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create an order line

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "<catalog-item-guid>",
    "itemTitle": "<item-title>",
    "itemShortDescription": "<short-description>",
    "quantity": 10,
    "currencyId": "<currency-guid>",
    "itemPriceId": "<price-guid>",
    "description": "<line-description>"
  }'
```

**Body: `OrderLineCreateDto`.** Key fields: `itemId`, `itemTitle`,
`itemShortDescription`, `itemPrimaryImageUrl`, `quantity`, `currencyId`, `itemPriceId`
or `priceListItemId`, `unitId`, `unitGroupId`, `free`/`freeReason`/`freeReasonCode`,
`costCalculationMethod`, `taxCalculationMethod`. Policy refs: `shippingPolicyId`,
`returnPolicyId`, `refundPolicyId`, `warrantyPolicyId`, `shipmentPolicyId`,
`shippingLocationId`, `locationId`. Custom metadata: `data` + `dataLabel`, and
`data1`–`data9` each with a matching `data{N}Label`. Plus the full `total*`,
`total*CurrencyId`, `total*InUsd`, and `customGlobal*` sets, `forexRate`,
`forexRatesSnapshot`, `quoteItemRecordId`, `parentBillingItemRecordId`, `orderId`.

### Update an order line (PUT — full replace)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Lines/<order-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 15,
    "description": "Increased quantity to 15",
    "currencyId": "<currency-guid>",
    "costCalculationMethod": "Automatic",
    "taxCalculationMethod": "Excluded"
  }'
```
**Body: `OrderLineUpdateDto`** (adds `userId`; otherwise mirrors the create line DTO).

### Patch an order line (PATCH — JSON Patch, RFC 6902)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Lines/<order-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/quantity", "value": 20 }
  ]'
```

### Delete an order line

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Lines/<order-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Calculate a single line's totals

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Lines/<order-line-guid>/Calculate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```
No request body.

## Cart Submission

Convert a shopping cart into an order for the authenticated user. **No `tenantId`** —
this endpoint is user-scoped and takes `cartId` as a **query parameter** (no request body):

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/SubmitCart?cartId=<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```
Returns the created order (`OrderDto`) in `result`; the cart's items become order lines.

## Email Notifications

Both email endpoints require the caller to hold the `send_email` permission.

### Send an order email

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Emails/Send?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your order confirmation",
    "message": "Thank you for your order.",
    "culture": "en-US",
    "uiCulture": "en-US",
    "recipients": ["<recipient-email>"]
  }'
```

**Body: `EmailDispatchRequest`.** Required: `title`, `message`, `culture`, `uiCulture`,
`recipients` (array). Optional: `buttonLink`, `buttonText`, `alertMessage`, `alertType`
(`None|Info|Error|Warning|Success|Action|Alert`), `contactIds`, `tenantIds`, `userIds`,
`templateUrl`, `emailTemplateId`.

### Preview an order email template

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Emails/Preview?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your order confirmation",
    "message": "Thank you for your order.",
    "culture": "en-US",
    "uiCulture": "en-US",
    "recipients": ["<recipient-email>"]
  }'
```
Same `EmailDispatchRequest` body; returns the rendered HTML preview instead of sending.

## PATCH (JSON Patch, RFC 6902)

PATCH is supported on the **order** (`PATCH /Orders/{orderId}`) and the **order line**
(`PATCH /Orders/{orderId}/Lines/{orderLineId}`). The request body is a JSON **array** of
operations with `Content-Type: application/json`:

```json
[
  { "op": "replace", "path": "/orderStatus", "value": "Fulfilled" },
  { "op": "replace", "path": "/closed", "value": true },
  { "op": "add", "path": "/customerNotes", "value": "Priority handling" },
  { "op": "remove", "path": "/description" }
]
```

- `op` ∈ `add | remove | replace | move | copy | test`.
- `path` / `from` are JSON Pointers (leading `/`, camelCase field name, e.g.
  `/orderStatus`, `/quantity`).
- Use PATCH for atomic partial edits (change one or two fields without resending the
  whole object — safer than PUT under concurrent edits). Lifecycle transitions
  (e.g. setting `orderStatus` to `Processing`, `Shipped`, `Delivered`, `Fulfilled`,
  `Cancelled`) are done with a `replace` on `/orderStatus`.

## End-to-End Workflow

```bash
# 0. Authenticate (capture accessToken into $ABSUITE_ACCESS_TOKEN)
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<user-email>", "password": "<user-password>"}'

# 1. Create the order header  ->  capture result.id as <order-guid>
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Enterprise license order", "currencyId": "<currency-guid>", "individualId": "<contact-guid>", "orderStatus": "New", "costCalculationMethod": "Automatic", "taxCalculationMethod": "Excluded" }'

# 2. Add line items
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "itemId": "<item-guid>", "itemTitle": "<item-title>", "quantity": 5, "currencyId": "<currency-guid>", "itemPriceId": "<price-guid>" }'

# 3. Recalculate totals
curl -X PUT "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Calculate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 4. Advance the lifecycle atomically (PATCH the status)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/orderStatus", "value": "Processing" } ]'

# 5. Send the confirmation email
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Emails/Send?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Order confirmation", "message": "Your order has been received.", "culture": "en-US", "uiCulture": "en-US", "recipients": ["<recipient-email>"] }'

# 6. Verify
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| List orders | GET | `/api/v2/OrdersService/Orders` |
| Count orders | GET | `/api/v2/OrdersService/Orders/Count` |
| Extended orders | GET | `/api/v2/OrdersService/Orders/Extended` |
| Get order | GET | `/api/v2/OrdersService/Orders/{orderId}` |
| Create order | POST | `/api/v2/OrdersService/Orders` |
| Update order (PUT) | PUT | `/api/v2/OrdersService/Orders/{orderId}` |
| Patch order (JSON Patch) | PATCH | `/api/v2/OrdersService/Orders/{orderId}` |
| Delete order | DELETE | `/api/v2/OrdersService/Orders/{orderId}` |
| Calculate order | PUT | `/api/v2/OrdersService/Orders/{orderId}/Calculate` |
| Submit cart | POST | `/api/v2/OrdersService/Orders/SubmitCart` |
| List lines | GET | `/api/v2/OrdersService/Orders/{orderId}/Lines` |
| Count lines | GET | `/api/v2/OrdersService/Orders/{orderId}/Lines/Count` |
| Get line | GET | `/api/v2/OrdersService/Orders/{orderId}/Lines/{orderLineId}` |
| Create line | POST | `/api/v2/OrdersService/Orders/{orderId}/Lines` |
| Update line (PUT) | PUT | `/api/v2/OrdersService/Orders/{orderId}/Lines/{orderLineId}` |
| Patch line (JSON Patch) | PATCH | `/api/v2/OrdersService/Orders/{orderId}/Lines/{orderLineId}` |
| Delete line | DELETE | `/api/v2/OrdersService/Orders/{orderId}/Lines/{orderLineId}` |
| Calculate line | PUT | `/api/v2/OrdersService/Orders/{orderId}/Lines/{orderLineId}/Calculate` |
| Send email | POST | `/api/v2/OrdersService/Orders/{orderId}/Emails/Send` |
| Preview email | POST | `/api/v2/OrdersService/Orders/{orderId}/Emails/Preview` |

> `SubmitCart` is the only endpoint here **without** `tenantId`; it takes `?cartId=` and
> is user-scoped. Every other verb requires `?tenantId=<tenant-guid>`.
>
> For the CLI equivalent of these operations (no PATCH, no curl), see `absuite-orders-cli`.
