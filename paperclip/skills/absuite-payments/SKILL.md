---
name: absuite-payments
description: >
  Create, read, update, patch, delete, and manage payments in the Alliance Business
  Suite (ABS) Payments Service via the REST API. Covers payments and their lifecycle
  (status transitions), plus the supporting configuration — payment methods, payment
  modes, and payment terms — including atomic PATCH (JSON Patch) updates. All
  operations are tenant-scoped and require a bearer token (see the absuite-login skill
  to authenticate).
---

# Alliance Business Suite — Payments Skill (REST)

Manage payments through the ABS Payments Service REST API. Every endpoint in this
service is tenant-scoped: pass `?tenantId=<tenant-guid>` (or the equivalent
`X-TenantId: <tenant-guid>` header) on **every** request — GET, POST, PUT, PATCH, and
DELETE alike. Omitting it on a write returns `400`.

> For the CLI equivalent see `absuite-payments-cli`; for general REST conventions
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

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/PaymentsService/<Resource>`

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
Always check `isSuccess`; read the payload from `result` (an object, an array, an int
for `Count`, or `null`).

5. **API versioning (config resources only)** — the `PaymentMethods`, `PaymentModes`,
   and `PaymentTerms` resources accept an optional `api-version` query parameter or
   `x-api-version` request header. Both are optional; omit them to use the default
   version. The `Payments` resource does not take a version parameter.

## Key Concepts

- **Payment** — a money-movement record between two wallets, optionally linked to an
  invoice and/or order. Carries amount/tax totals, currency, forex snapshot, gateway
  and bank references, anti-fraud signals, and KYC capture fields.
- **Payment Method** — a configured way to pay (lookup record: `name` + `description`).
- **Payment Mode** — a configured payment delivery mechanism (lookup record:
  `name` + `description`).
- **Payment Term** — contractual payment conditions (e.g. Net 30), with a credit
  window (`creditDays`/`creditWeeks`/`creditMonths`/`creditYears`), an optional
  `percentage`, an `isTemplate` flag, and an optional linked `paymentModeId`.
- **`onBehalfOf`** (Payment) — `Self` | `Tenant` | `Individual` | `Organization`.
- **`paymentType`** (Payment) — `Paid` | `Received` | `Internal`.
- **`paymentStatus`** (Payment lifecycle) — `Unset` | `Accepted` | `Rejected` |
  `OnHold` | `Failed` | `Reversed` | `Retained` | `Initialized` | `Expired` |
  `Abandoned` | `Cancelled` | `AcceptedRetained`.

> Field names in request bodies are JSON keys transcribed verbatim from the OpenAPI
> spec (camelCase, e.g. `"totalCost"`, `"currencyId"`, `"paymentStatus"`). Monetary
> totals (`totalCost`, `totalTaxes`, `baseCost`) are plain numbers paired with a
> `currencyId`.

## Payments

### List Payments

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

> **Note:** the top-level **Payments** collection has **no** `Count` endpoint (only
> `PaymentMethods`, `PaymentModes`, and `PaymentTerms` expose `/Count`). To count
> payments, retrieve `List Payments` and count client-side.

> **Note on "search":** the Payments Service exposes no dedicated search endpoint.
> Retrieve the full tenant-scoped collection with `List Payments` and filter
> client-side.

### Get Payment by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Payment Details (deprecated)

> **⚠️ Deprecated.** Use **Get Payment by ID** above instead. Retained for
> compatibility only.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>/Details?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Payment

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "<invoice-guid>",
    "orderId": "<order-guid>",
    "emisorWalletId": "<sender-wallet-guid>",
    "receiverWalletId": "<receiver-wallet-guid>",
    "currencyId": "<currency-guid>",
    "forexRate": 1.0,
    "totalCost": 1500.00,
    "totalTaxes": 120.00,
    "baseCost": 1380.00,
    "onBehalfOf": "Tenant",
    "paymentType": "Received",
    "paymentStatus": "Initialized",
    "referenceCode": "<reference-code>",
    "correlationCode": "<correlation-code>",
    "authorization": "<gateway-auth-code>",
    "paymentGatewayId": "<gateway-guid>",
    "bankId": "<bank-guid>",
    "bankAccountId": "<bank-account-guid>",
    "countryId": "<country-guid>",
    "closed": false,
    "isExternal": false
  }'
```

**`PaymentCreateDto` fields** (all optional; transcribed verbatim from the spec):
`id`, `timestamp`, `invoiceId`, `emisorWalletId`, `receiverWalletId`, `currencyId`,
`forexRate` (number), `totalCost` (number), `totalTaxes` (number), `closed` (bool),
`data`, `dataLabel`, `data1`, `data1Label`, `response`, `authorization`,
`referenceCode`, `correlationCode`, `lastUpdated`,
`onBehalfOf` (`Self`|`Tenant`|`Individual`|`Organization`),
`paymentType` (`Paid`|`Received`|`Internal`),
`paymentStatus` (`Unset`|`Accepted`|`Rejected`|`OnHold`|`Failed`|`Reversed`|`Retained`|`Initialized`|`Expired`|`Abandoned`|`Cancelled`|`AcceptedRetained`),
`baseCost` (number), `signature`, `signatureMismatch` (bool), `isExternal` (bool),
`markedForRevision` (bool), `forexRatesSnapshot`, `officialId`,
`officialIdExpeditionDate`, `fiscalIdentificationTypeId`, `billingAddress`, `phone`,
`cellphone`, `department`, `city`, `countryId`, `locationId`, `entitlementId`,
`antiFraudScore` (number), `callRecordURL`, `called` (bool), `verified` (bool),
`payerPictureTimestamp`, `payerPicture`, `identificationPictureTimestamp`,
`identificationPicture`, `identificationBackPicture`,
`identificationBackPictureTimestamp`, `ipLookupId`, `orderId`, `accountingEntryId`,
`paymentGatewayId`, `bankAccountId`, `bankId`, `paymentTokenId`,
`emisorWalletAccountId`, `receiverWalletAccountId`.

### Update Payment (full replace — PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "<invoice-guid>",
    "currencyId": "<currency-guid>",
    "totalCost": 1500.00,
    "totalTaxes": 120.00,
    "paymentType": "Received",
    "paymentStatus": "Accepted",
    "closed": true
  }'
```

`PaymentUpdateDto` carries the same business fields as `PaymentCreateDto` **except**
`id` and `timestamp` (which are not part of the update body). Prefer PATCH (below) for
small, partial edits.

### Patch Payment (PATCH — JSON Patch RFC 6902)

Apply atomic partial updates. The body is a **JSON array** of operations; `op` ∈
`add|remove|replace|move|copy|test`; `path`/`from` are JSON-Pointers (leading `/`,
camelCase field name). This is the safest way to drive a single field — e.g. a
lifecycle status transition — without resending the whole record.

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/paymentStatus", "value": "Accepted" },
    { "op": "replace", "path": "/closed", "value": true },
    { "op": "replace", "path": "/authorization", "value": "<gateway-auth-code>" }
  ]'
```

Other useful payment transitions follow the same shape — replace `/paymentStatus`
with any valid value (`OnHold`, `Rejected`, `Reversed`, `Cancelled`, `Failed`,
`Expired`, `Retained`, `AcceptedRetained`, …):

```bash
# Put a payment on hold
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/paymentStatus", "value": "OnHold" } ]'

# Flag for revision
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/markedForRevision", "value": true } ]'
```

### Delete Payment

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Payment Methods

Lookup records for accepted payment methods. Each carries a `name` (required on
create) and a `description`.

### List Payment Methods

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Payment Methods

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Payment Method by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods/<payment-method-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Payment Method

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Credit Card",
    "description": "Visa / MasterCard payments"
  }'
```

`PaymentMethodCreateDto` fields: `id`, `timestamp`, `name` (**required**),
`description`.

### Update Payment Method (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods/<payment-method-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Credit Card",
    "description": "Visa / MasterCard / Amex"
  }'
```

`PaymentMethodUpdateDto` fields: `name`, `description`.

### Patch Payment Method (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods/<payment-method-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/description", "value": "Visa / MasterCard / Amex" } ]'
```

### Delete Payment Method

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods/<payment-method-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Payment Modes

Lookup records for payment delivery mechanisms. Each carries a `name` (required on
create) and a `description`.

### List Payment Modes

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Payment Modes

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Payment Mode by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes/<payment-mode-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Payment Mode

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Online Payment",
    "description": "Payment captured online via gateway"
  }'
```

`PaymentModeCreateDto` fields: `id`, `timestamp`, `name` (**required**),
`description`.

### Update Payment Mode (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes/<payment-mode-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Online Payment",
    "description": "Captured online (card / wallet)"
  }'
```

`PaymentModeUpdateDto` fields: `name`, `description`.

### Patch Payment Mode (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes/<payment-mode-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/name", "value": "Online Payment" } ]'
```

### Delete Payment Mode

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes/<payment-mode-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Payment Terms

Contractual payment conditions (e.g. Net 30). A term defines a credit window plus an
optional discount `percentage`, an `isTemplate` flag, and an optional linked
`paymentModeId`.

### List Payment Terms

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Payment Terms

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Payment Term by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms/<payment-term-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Payment Term

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Net 30",
    "description": "Payment due within 30 days",
    "isTemplate": false,
    "percentage": 0,
    "creditDays": 30,
    "creditWeeks": 0,
    "creditMonths": 0,
    "creditYears": 0,
    "paymentModeId": "<payment-mode-guid>"
  }'
```

`PaymentTermCreateDto` fields: `id`, `timestamp`, `name` (**required**),
`description`, `isTemplate` (bool), `percentage` (number), `creditDays` (number),
`creditWeeks` (number), `creditMonths` (number), `creditYears` (number),
`paymentModeId`.

### Update Payment Term (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms/<payment-term-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Net 60",
    "description": "Payment due within 60 days",
    "creditDays": 60
  }'
```

`PaymentTermUpdateDto` fields: `name`, `description`, `isTemplate` (bool),
`percentage` (number), `creditDays` (number), `creditWeeks` (number),
`creditMonths` (number), `creditYears` (number), `paymentModeId`.

### Patch Payment Term (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms/<payment-term-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/creditDays", "value": 60 } ]'
```

### Delete Payment Term

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms/<payment-term-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## PATCH (JSON Patch) Notes

Every primary aggregate in this service supports PATCH via JSON Patch (RFC 6902):
`Payments`, `PaymentMethods`, `PaymentModes`, and `PaymentTerms` (each at
`PATCH .../<Resource>/<id>`). The request body is always a **JSON array** of
operations:

```json
[
  { "op": "replace", "path": "/<camelCaseField>", "value": <new-value> }
]
```

Use it for atomic, low-conflict edits — most importantly to drive a payment's
`paymentStatus` lifecycle transition (`Initialized` → `Accepted` / `OnHold` /
`Rejected` / `Reversed` / `Cancelled` …) without resending the full payment.

## End-to-End Workflow

```bash
TENANT="<tenant-guid>"

# 1. (one-time setup) Create a payment method, mode, and term
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Credit Card", "description": "Visa / MasterCard" }'

curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Online Payment" }'

curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Net 30", "creditDays": 30 }'

# 2. Create a payment (note the returned id), linked to an invoice
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "<invoice-guid>",
    "currencyId": "<currency-guid>",
    "totalCost": 1500.00,
    "totalTaxes": 120.00,
    "emisorWalletId": "<sender-wallet-guid>",
    "receiverWalletId": "<receiver-wallet-guid>",
    "paymentType": "Received",
    "paymentStatus": "Initialized",
    "referenceCode": "<reference-code>"
  }'

# 3. Transition status to Accepted and close it (atomic PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/paymentStatus", "value": "Accepted" },
    { "op": "replace", "path": "/closed", "value": true }
  ]'

# 4. Verify
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

All paths are relative to `$ABSUITE_HOST_URL`. Every endpoint requires
`?tenantId=<tenant-guid>` (or the `X-TenantId` header).

### Payments

| Action | Method | Path |
|---|---|---|
| List payments | `GET` | `/api/v2/PaymentsService/Payments` |
| Get payment by ID | `GET` | `/api/v2/PaymentsService/Payments/{paymentId}` |
| Get payment details *(deprecated)* | `GET` | `/api/v2/PaymentsService/Payments/{paymentId}/Details` |
| Create payment | `POST` | `/api/v2/PaymentsService/Payments` |
| Update payment (full) | `PUT` | `/api/v2/PaymentsService/Payments/{paymentId}` |
| Patch payment (JSON Patch) | `PATCH` | `/api/v2/PaymentsService/Payments/{paymentId}` |
| Delete payment | `DELETE` | `/api/v2/PaymentsService/Payments/{paymentId}` |

### Payment Methods

| Action | Method | Path |
|---|---|---|
| List payment methods | `GET` | `/api/v2/PaymentsService/PaymentMethods` |
| Count payment methods | `GET` | `/api/v2/PaymentsService/PaymentMethods/Count` |
| Get payment method by ID | `GET` | `/api/v2/PaymentsService/PaymentMethods/{paymentMethodId}` |
| Create payment method | `POST` | `/api/v2/PaymentsService/PaymentMethods` |
| Update payment method (full) | `PUT` | `/api/v2/PaymentsService/PaymentMethods/{paymentMethodId}` |
| Patch payment method (JSON Patch) | `PATCH` | `/api/v2/PaymentsService/PaymentMethods/{paymentMethodId}` |
| Delete payment method | `DELETE` | `/api/v2/PaymentsService/PaymentMethods/{paymentMethodId}` |

### Payment Modes

| Action | Method | Path |
|---|---|---|
| List payment modes | `GET` | `/api/v2/PaymentsService/PaymentModes` |
| Count payment modes | `GET` | `/api/v2/PaymentsService/PaymentModes/Count` |
| Get payment mode by ID | `GET` | `/api/v2/PaymentsService/PaymentModes/{paymentModeId}` |
| Create payment mode | `POST` | `/api/v2/PaymentsService/PaymentModes` |
| Update payment mode (full) | `PUT` | `/api/v2/PaymentsService/PaymentModes/{paymentModeId}` |
| Patch payment mode (JSON Patch) | `PATCH` | `/api/v2/PaymentsService/PaymentModes/{paymentModeId}` |
| Delete payment mode | `DELETE` | `/api/v2/PaymentsService/PaymentModes/{paymentModeId}` |

### Payment Terms

| Action | Method | Path |
|---|---|---|
| List payment terms | `GET` | `/api/v2/PaymentsService/PaymentTerms` |
| Count payment terms | `GET` | `/api/v2/PaymentsService/PaymentTerms/Count` |
| Get payment term by ID | `GET` | `/api/v2/PaymentsService/PaymentTerms/{paymentTermId}` |
| Create payment term | `POST` | `/api/v2/PaymentsService/PaymentTerms` |
| Update payment term (full) | `PUT` | `/api/v2/PaymentsService/PaymentTerms/{paymentTermId}` |
| Patch payment term (JSON Patch) | `PATCH` | `/api/v2/PaymentsService/PaymentTerms/{paymentTermId}` |
| Delete payment term | `DELETE` | `/api/v2/PaymentsService/PaymentTerms/{paymentTermId}` |

## Critical Rules

- **Authenticate first**, then pass `?tenantId=<tenant-guid>` on **every** call,
  including POST/PUT/PATCH/DELETE — omitting it on a write returns `400`.
- **Take enum values and field names from this skill** (transcribed from the OpenAPI
  spec). In particular: `paymentType` is `Paid|Received|Internal` and `paymentStatus`
  is one of the 13 lifecycle values listed under Key Concepts — neither is a
  free-text or card-brand string.
- **Set up methods, modes, and terms** (lookups) before referencing them from
  payments and invoices.
- **Use PATCH for status transitions** — send a JSON-Patch array, not a partial
  object. The CLI cannot PATCH; for that use this REST skill.
