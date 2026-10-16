---
name: absuite-orders
key: paperclip/skills/absuite-orders/SKILL.md
version: 1.0.0
description: >
  Create, read, update, patch, delete, and calculate orders and order lines in the
  Alliance Business Suite (ABS) Orders Service via the REST API. Covers direct order
  creation, cart-to-order submission, line items, totals calculation, received orders,
  transactional email, and atomic PATCH (JSON Patch) updates. Workspace operations are
  tenant-scoped and every call requires a bearer token (see the absuite-login skill to
  authenticate).
---

# Alliance Business Suite: Orders (REST)

Manage orders and order lines through the ABS **OrdersService** REST API. Workspace
order operations are tenant-scoped: pass `?tenantId=<tenant-guid>` on those requests
(read *and* write). This skill is pure REST (`curl`). For the CLI equivalent, see
`absuite-orders-cli`. For shared REST conventions (auth, envelope, tenant scoping),
see `absuite-rest`.

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
  -d '{"email": "<user-email>", "password": "<user-password>"}'
```
Extract `accessToken` from the JSON response.

2. **Send the token on every call:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/OrdersService/...`

4. **Response envelope**: every response is wrapped:
```json
{ "isSuccess": true, "errorMessage": null, "correlationId": "...", "timestamp": "...", "result": <data|array|int|null> }
```
Always check `isSuccess`; read the payload from `result`.

## Tenant scoping

All `OrdersService` endpoints require `tenantId` **except** `SubmitCart` and the
`Me/Received...` reads, which run as the authenticated user. Pass tenant as the query
param `?tenantId=<tenant-guid>` (preferred in examples). The header
`X-TenantId: <tenant-guid>` is read interchangeably by the platform. Omitting
`tenantId` on a required endpoint returns **400**.

### Permissions (checked in the workspace named by `tenantId`)

| Operation | Permission |
|---|---|
| List, count, get orders and lines; `Received` reads | `orders_read` |
| Create an order | `orders_create` |
| Update, patch, calculate an order; create, update, patch, delete, calculate a line | `orders_update` |
| Delete an order | `orders_delete` |
| Email `Send` / `Preview` | `email_send` |
| `SubmitCart`, `Me/Received` reads | none (runs as the signed-in user) |

## Key Concepts

- **Order**: a billing record with header info (customer, address, currency, totals,
  status) and zero or more line items.
- **Order number**: assigned by the server on create, read-only. `OrderDto.number` is
  the integer; `OrderDto.numberLabel` is the display form, e.g. `ORD-000123`. Legacy
  orders may have no number (empty label).
- **Order Line**: an individual item/product within an order, with its own quantity,
  pricing, policies, and tax info.
- **Calculate**: server-side recalculation of totals (taxes, discounts, surcharges,
  shipping, USD equivalents) for an order or a single line. Uses `PUT .../Calculate`.
- **Submit Cart**: converts an existing shopping cart into an order for the
  authenticated user (`POST .../SubmitCart?cartId=<cart-guid>`).
- **Received orders**: orders your workspace (or you personally) bought from another
  seller. Read-only views under `Received` and `Me/Received`.
- **Closed is final**: there is no close or reopen route for orders. Once an order has
  `closed: true`, every update, patch, delete, calculate and line change is refused
  ("Order is closed and cannot be modified.").
- **PATCH**: atomic partial update via JSON Patch (RFC 6902); safer than PUT for
  changing a couple of fields under concurrency.

### Enum values

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
    "id": "<new-order-guid>",
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

Returns **201 Created** with a `Location` header pointing at the new order, and no
order in the body. Send your own `id` (a new GUID) so you know the order's ID up front;
if you omit it the server generates one and you read it from `Location`.

**Body: `OrderCreateDto`** (all fields optional; key ones shown). Other available
fields: `id`, `timestamp`, `closed`, `priceListId`, `paymentTermId`, `forexRate`,
`forexRatesSnapshot`, `cartId`, `quoteId`, `walletId`, `parentOrderId`,
`shippingMethodId`, `billingLocationId`, `shippingLocationId`, `customerNotes`,
`quoteStatus`, `freightTerms`, `receiverTenantId`, `qualifiedIdentifier`,
`effectiveFrom`, `effectiveTo`, the `total*` amounts (`totalDetail`, `totalProfit`,
`totalDiscounts`, `totalSurcharges`, `totalShippingCost`, `totalShippingTax`,
`totalWithheldTax`, `totalTaxBase`, `totalTaxes`, `totalGlobalSurcharges`,
`totalGlobalDiscounts`, `total`), the `*InUsd` snapshots (`totalTaxesInUsd`,
`totalDiscountsInUsd`, `totalSurchargesInUsd`, `totalShippingCostInUsd`,
`totalShippingTaxInUsd`, `totalAmountInUsd`), and `orderLines` (an inline array of
`OrderLineCreateDto`). The order number is never part of the body.

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

### Update an order (PUT, full replace)

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

> Setting `closed: true` is final: there is no reopen route, and the closed order can no
> longer be updated, patched, deleted, calculated or have its lines changed.

**Body: `OrderUpdateDto`.** Note it differs from the create DTO: it adds `userId` and
the `total*CurrencyId` pair for each `total*` amount; `quoteStatus` is a free string
here; and it has **no** `id`, `timestamp`, `orderStatus`, `orderLines`, `quoteId`,
`walletId`, `parentOrderId`, `customerNotes`, `freightTerms`, or `qualifiedIdentifier`.
`orderStatus` is therefore set on create only: neither PUT nor PATCH can change it.

### Patch an order (PATCH, JSON Patch, RFC 6902)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/title", "value": "New title" },
    { "op": "replace", "path": "/description", "value": "Ships next week" }
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
`data1` to `data9` each with a matching `data{N}Label`. Plus the `total*` and
`total*InUsd` sets, `customGlobalSurchargesAmount` and `customGlobalDiscountsAmount`
(each with a `...CurrencyId`), `forexRate`, `forexRatesSnapshot`, `quoteItemRecordId`,
`parentBillingItemRecordId`, `orderId`.

### Update an order line (PUT, full replace)

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
**Body: `OrderLineUpdateDto`** (mirrors the create line DTO, adds `userId`,
`billingLocationId`, `shippingMethodId` and the `total*CurrencyId` pairs; it has no
`id` and no `orderId`).

### Patch an order line (PATCH, JSON Patch, RFC 6902)

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

Convert a shopping cart into an order for the authenticated user. **No `tenantId`**:
this endpoint is user-scoped (no workspace permission is checked) and takes `cartId`
as a **query parameter** (no request body):

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/SubmitCart?cartId=<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```
Returns the created order (`OrderDto`, including `number` and `numberLabel`) in
`result`; the cart's items become order lines.

> To submit a workspace cart under a tenant, use the Cart service instead:
> `POST /api/v2/CartService/Carts/{cartId}/Submit?tenantId=<tenant-guid>`, which requires
> `carts_create` in that workspace.

## Received Orders

Orders your workspace or you personally received (bought from a seller). Read-only.

```bash
# Orders the workspace received (orders_read in that workspace)
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/Received?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Orders you personally received (no tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/Me/Received" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Each branch also has `/Count`, `/{orderId}` and `/{orderId}/Lines` (see the quick
reference). An order you did not receive answers **404**.

## Email Notifications

Both email endpoints require the caller to hold the `email_send` permission in the
workspace named by `tenantId`.

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
Same `EmailDispatchRequest` body; returns the rendered HTML preview (not an envelope)
instead of sending.

## PATCH (JSON Patch, RFC 6902)

PATCH is supported on the **order** (`PATCH /Orders/{orderId}`) and the **order line**
(`PATCH /Orders/{orderId}/Lines/{orderLineId}`). The request body is a JSON **array** of
operations with `Content-Type: application/json`:

```json
[
  { "op": "replace", "path": "/title", "value": "Priority order" },
  { "op": "replace", "path": "/billingEmail", "value": "billing@example.com" },
  { "op": "remove", "path": "/description" }
]
```

- `op` is one of `add | remove | replace | move | copy | test`.
- `path` / `from` are JSON Pointers (leading `/`, camelCase field name, e.g.
  `/title`, `/quantity`).
- Paths must name a field of the update DTO (`OrderUpdateDto` for an order,
  `OrderLineUpdateDto` for a line). `orderStatus`, `customerNotes` and the other
  create-only fields are not patchable; a patch naming them fails.
- Use PATCH for atomic partial edits (change one or two fields without resending the
  whole object; safer than PUT under concurrent edits). A `replace` on `/closed` with
  `true` closes the order for good.

## End-to-End Workflow

```bash
# 0. Authenticate (capture accessToken into $ABSUITE_ACCESS_TOKEN)
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<user-email>", "password": "<user-password>"}'

# 1. Create the order header with your own id (<order-guid>); the response is 201 with no body
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "id": "<order-guid>", "title": "Enterprise license order", "currencyId": "<currency-guid>", "individualId": "<contact-guid>", "orderStatus": "New", "costCalculationMethod": "Automatic", "taxCalculationMethod": "Excluded" }'

# 2. Add line items
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "itemId": "<item-guid>", "itemTitle": "<item-title>", "quantity": 5, "currencyId": "<currency-guid>", "itemPriceId": "<price-guid>" }'

# 3. Recalculate totals
curl -X PUT "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Calculate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 4. Adjust a header field atomically (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/description", "value": "Confirmed with the customer" } ]'

# 5. Send the confirmation email (email_send)
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>/Emails/Send?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Order confirmation", "message": "Your order has been received.", "culture": "en-US", "uiCulture": "en-US", "recipients": ["<recipient-email>"] }'

# 6. Verify (result.numberLabel shows the order number, e.g. ORD-000123)
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/<order-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

| Action | Method | Path | Permission |
|---|---|---|---|
| List orders | GET | `/api/v2/OrdersService/Orders` | `orders_read` |
| Count orders | GET | `/api/v2/OrdersService/Orders/Count` | `orders_read` |
| Extended orders | GET | `/api/v2/OrdersService/Orders/Extended` | `orders_read` |
| Get order | GET | `/api/v2/OrdersService/Orders/{orderId}` | `orders_read` |
| Create order | POST | `/api/v2/OrdersService/Orders` | `orders_create` |
| Update order (PUT) | PUT | `/api/v2/OrdersService/Orders/{orderId}` | `orders_update` |
| Patch order (JSON Patch) | PATCH | `/api/v2/OrdersService/Orders/{orderId}` | `orders_update` |
| Delete order | DELETE | `/api/v2/OrdersService/Orders/{orderId}` | `orders_delete` |
| Calculate order | PUT | `/api/v2/OrdersService/Orders/{orderId}/Calculate` | `orders_update` |
| Submit cart | POST | `/api/v2/OrdersService/Orders/SubmitCart` | none (user) |
| List lines | GET | `/api/v2/OrdersService/Orders/{orderId}/Lines` | `orders_read` |
| Count lines | GET | `/api/v2/OrdersService/Orders/{orderId}/Lines/Count` | `orders_read` |
| Get line | GET | `/api/v2/OrdersService/Orders/{orderId}/Lines/{orderLineId}` | `orders_read` |
| Create line | POST | `/api/v2/OrdersService/Orders/{orderId}/Lines` | `orders_update` |
| Update line (PUT) | PUT | `/api/v2/OrdersService/Orders/{orderId}/Lines/{orderLineId}` | `orders_update` |
| Patch line (JSON Patch) | PATCH | `/api/v2/OrdersService/Orders/{orderId}/Lines/{orderLineId}` | `orders_update` |
| Delete line | DELETE | `/api/v2/OrdersService/Orders/{orderId}/Lines/{orderLineId}` | `orders_update` |
| Calculate line | PUT | `/api/v2/OrdersService/Orders/{orderId}/Lines/{orderLineId}/Calculate` | `orders_update` |
| Received orders | GET | `/api/v2/OrdersService/Orders/Received` | `orders_read` |
| Count received | GET | `/api/v2/OrdersService/Orders/Received/Count` | `orders_read` |
| Get received order | GET | `/api/v2/OrdersService/Orders/Received/{orderId}` | `orders_read` |
| Received order lines | GET | `/api/v2/OrdersService/Orders/Received/{orderId}/Lines` | `orders_read` |
| My received orders | GET | `/api/v2/OrdersService/Orders/Me/Received` | none (user) |
| Count my received | GET | `/api/v2/OrdersService/Orders/Me/Received/Count` | none (user) |
| Get my received order | GET | `/api/v2/OrdersService/Orders/Me/Received/{orderId}` | none (user) |
| My received order lines | GET | `/api/v2/OrdersService/Orders/Me/Received/{orderId}/Lines` | none (user) |
| Send email | POST | `/api/v2/OrdersService/Orders/{orderId}/Emails/Send` | `email_send` |
| Preview email | POST | `/api/v2/OrdersService/Orders/{orderId}/Emails/Preview` | `email_send` |

> `SubmitCart` and the `Me/Received...` reads are the only endpoints here **without**
> `tenantId`; they run as the signed-in user (`SubmitCart` takes `?cartId=`). Every other
> verb requires `?tenantId=<tenant-guid>`. There is no close or reopen route for orders.
>
> For the CLI equivalent of these operations (no PATCH, no curl), see `absuite-orders-cli`.
