---
name: absuite-payments
key: paperclip/skills/absuite-payments/SKILL.md
version: 1.0.0
description: >
  Create, read, update, patch, delete, and manage payments in the Alliance Business
  Suite (ABS) Payments Service via the REST API. Covers payment records (whose status
  is server-owned), the supporting configuration (payment methods, payment modes, and
  payment terms) with atomic PATCH (JSON Patch) updates, provider registrations,
  provider operation review/reconcile/refund, and public payment links and references.
  All operations are tenant-scoped and require a bearer token (see the absuite-login
  skill to authenticate).
---

# Alliance Business Suite: Payments Skill (REST)

Manage payments through the ABS Payments Service REST API. Every endpoint in this
service is tenant-scoped: pass `?tenantId=<tenant-guid>` (or the equivalent
`X-TenantId: <tenant-guid>` header) on **every** request (GET, POST, PUT, PATCH, and
DELETE alike). The tenant is a required binding on every action, so omitting it returns
`400` on reads and writes. Each action then checks a permission inside its use case
(see the quick reference); a caller without it is refused with an authorization error.

> For the CLI equivalent see `absuite-payments-cli`; for general REST conventions
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

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/PaymentsService/<Resource>`

4. **Response envelope**: every response is wrapped:
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

5. **API versioning**: the platform reads the version from the URL segment (`v2`), the
   optional `api-version` query parameter, or the optional `x-api-version` header, and
   assumes the default when none is given. Omit the optional ones unless you need to pin.

## Key Concepts

- **Payment**: a money-movement record between two wallets, optionally linked to an
  invoice and/or order. Carries amount/tax totals, currency, forex snapshot, gateway
  and bank references, anti-fraud signals, and KYC capture fields.
- **Payment Method**: a configured way to pay (lookup record: `name` + `description`).
- **Payment Mode**: a configured payment delivery mechanism (lookup record: `name`,
  `description`, and an optional `paymentMeansCode`, the UN/ECE 4461 code used on
  e-invoices, e.g. `10` cash, `30` credit transfer, `48` card).
- **Payment Term**: contractual payment conditions (e.g. Net 30), with a credit
  window (`creditDays`/`creditWeeks`/`creditMonths`/`creditYears`), an optional
  `percentage`, an `isTemplate` flag, and an optional linked `paymentModeId`.
- **`onBehalfOf`** (Payment): `Self` | `Tenant` | `Individual` | `Organization`.
- **`paymentType`** (Payment): `Paid` | `Received` | `Internal`.
- **`paymentStatus`** (Payment lifecycle, 12 values): `Unset` | `Accepted` | `Rejected` |
  `OnHold` | `Failed` | `Reversed` | `Retained` | `Initialized` | `Expired` |
  `Abandoned` | `Cancelled` | `AcceptedRetained`. **The status is server-owned**: only
  the settlement and payment-rail paths move it. A client create always starts at
  `Unset`, a `PUT` keeps the stored status whatever the body says, and a `PATCH` that
  touches `/paymentStatus` is refused. A client cannot assert `Accepted`.

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
> `PaymentMethods`, `PaymentModes`, `PaymentTerms`, `PaymentProviderRegistrations` and
> `ProviderOperations/AwaitingOutcome` expose `/Count`). The list is OData-enabled, so
> filter and page it with `$filter`/`$top`/`$skip` rather than fetching everything.

> **Card data is redacted on read.** Every payment read returns `data1` (payment-rail
> card evidence) content-redacted.

### Get Payment by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Payment Details (deprecated)

> **Deprecated.** Use **Get Payment by ID** above instead. Retained for
> compatibility only (same use case and permission).

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

Server-side checks on create (all answer `404`-style not-found, the same as a missing
record, so a foreign id is not confirmed to exist):
- `invoiceId` must be an invoice this tenant owns or that is addressed to it;
  `orderId` must be an order this tenant owns.
- `emisorWalletAccountId` (or, if absent, `emisorWalletId`) must be a wallet this
  tenant owns.
- `paymentStatus` is reset to `Unset` whatever you send.

The response is `201 Created` with an empty envelope and a `Location` header; the new
payment's id is the `id` you sent (a fresh GUID is generated when omitted).

**`PaymentCreateDto` fields** (all optional):
`id`, `timestamp`, `invoiceId`, `emisorWalletId`, `receiverWalletId`, `currencyId`,
`forexRate` (number), `totalCost` (number), `totalTaxes` (number), `closed` (bool),
`data`, `dataLabel`, `data1`, `data1Label`, `response`, `authorization`,
`referenceCode`, `correlationCode`, `lastUpdated`,
`onBehalfOf` (`Self`|`Tenant`|`Individual`|`Organization`),
`paymentType` (`Paid`|`Received`|`Internal`),
`paymentStatus` (server-owned: accepted in the body but reset to `Unset`),
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

### Update Payment (full replace, PUT)

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
    "closed": true
  }'
```

`PaymentUpdateDto` carries the same business fields as `PaymentCreateDto` **except**
`id` and `timestamp`. Every mapped field is assigned unconditionally, so an omitted
field is cleared. Only a payment of this tenant can be updated (another tenant's id is
not found). `paymentStatus` in the body is ignored: the stored status is kept.

> **Do not GET-then-PUT `data1`.** Reads return `data1` redacted, so writing a read
> back with `PUT` replaces the stored card evidence with the redacted text. Prefer
> PATCH (below) for edits; it never touches `data1`.

### Patch Payment (PATCH, JSON Patch RFC 6902)

Apply atomic partial updates. The body is a **JSON array** of operations; `op` is one
of `add|remove|replace|move|copy|test`; `path`/`from` are JSON-Pointers (leading `/`,
camelCase field name). The patch is applied to the stored record, so fields you do not
name are kept.

Two kinds of operation are **refused** with a validation error before anything is
applied:
- any operation whose `path` (or, for `copy`/`move`, whose `from`) reaches `/data1`;
- any operation that reaches `/paymentStatus` (the status is server-owned, see Key
  Concepts). There is no client-driven status transition.

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/closed", "value": true },
    { "op": "replace", "path": "/authorization", "value": "<gateway-auth-code>" }
  ]'

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

### Patch Payment Method (PATCH, JSON Patch)

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
    "description": "Payment captured online via gateway",
    "paymentMeansCode": "48"
  }'
```

`PaymentModeCreateDto` fields: `id`, `timestamp`, `name` (**required**, max 50),
`description` (max 500), `paymentMeansCode` (optional UN/ECE 4461 code).

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

`PaymentModeUpdateDto` fields: `name`, `description`, `paymentMeansCode`.

### Patch Payment Mode (PATCH, JSON Patch)

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

### Patch Payment Term (PATCH, JSON Patch)

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

## Payment Provider Registrations

A tenant's own (BYO) payment-provider rail, e.g. its Stripe account, with the inbound
webhook loop. All require `Payments.Manage` except list/count (`Payments.Read`). No
read model ever returns the webhook key or the signing secret.

```bash
# Provision: stores the signing secret in the tenant options store, creates + activates
# the registration, and reveals the plaintext webhook key ONCE with its inbound URL.
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentProviderRegistrations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "providerCode": "stripe",
    "externalAccountId": "<provider-account-id>",
    "webhookSigningSecret": "<signing-secret>",
    "environment": "Test"
  }'
# result: { "id", "providerCode", "status", "webhookRegistrationKey", "webhookUrl" }

# List + count (OData)
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentProviderRegistrations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentProviderRegistrations/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Rotate the webhook key (invalidates the old one; reveals the new one once)
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentProviderRegistrations/<registration-guid>/RotateKey?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update the CONTENT half only (capabilities + provider account id)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentProviderRegistrations/<registration-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "enabledCapabilities": "Collection, Refund", "externalAccountId": "<provider-account-id>" }'

# Declare the environment (narrow: the body is only this field)
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentProviderRegistrations/<registration-guid>/Environment?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "environment": "Live" }'

# Set the credential mode (narrow: the body is only this field)
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentProviderRegistrations/<registration-guid>/Credential?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "credentialMode": "TenantManaged" }'
```

- Create body (`CreateProviderWebhookRegistrationRequest`): `providerCode`,
  `externalAccountId`, `webhookSigningSecret`, `environment` (optional). A
  `credentialMode` field has no effect.
- Update body (`PaymentProviderRegistrationUpdateDto`): `enabledCapabilities` (flags:
  `None`, `Collection`, `Authorization`, `Capture`, `Refund`, `Void`, `SplitPayment`,
  `Transfer`, `Payout`, `RecipientOnboarding`, `BalanceInquiry`), `externalAccountId`.
  Environment and credential fields sent here have no effect.
- `environment`: `Test` | `Live`. `Unknown` (or omitting the field) is refused; `Live`
  is refused unless the connector is certified for Live. The change is audited against
  the authenticated caller.
- `credentialMode`: required. The tenant surface accepts only `TenantManaged`
  (`PlatformManaged` and `ExternalReference` are refused).
- Read model (`PaymentProviderRegistrationDto`): `id`, `createdAtUtc`, `lastModifiedUtc`,
  `tenantId`, `enrollmentId`, `providerCode`, `credentialSetReference`, `hasCredential`,
  `credentialMode`, `environment`, `externalAccountId`, `enabledCapabilities`, `status`
  (`Draft` | `Active` | `Disabled` | `Suspended`).
- There is no REST route to get one registration by id, or to enable, disable or
  suspend one.

## Provider Operations

The tenant's provider instructions (collections, refunds, ...) whose money outcome is
not yet established, plus the two operator actions on one instruction. A missing id and
another tenant's id answer identically.

```bash
# Outcome review queue (OData on persisted columns) + count. Permission: Payments.Read
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/ProviderOperations/AwaitingOutcome?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/ProviderOperations/AwaitingOutcome/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Ask the rail what became of one instruction. Permission: Payments.Manage
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/ProviderOperations/<provider-operation-guid>/ReconcileOutcome?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Refund one succeeded collection through its own rail. Permission: PaymentRefunds.Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/ProviderOperations/<provider-operation-guid>/Refund?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

- Neither POST takes a body. `ReconcileOutcome` returns `providerOperationId`,
  `operationKind`, `providerCode`, `certainty`, `availability`, `disposition`.
  `Refund` returns `providerOperationId`, `refundedProviderOperationId`,
  `providerResourceId`, `canonicalStatus`, `certainty`, `message`.
- `certainty`: `Unknown` | `KnownNoEffect` | `KnownSucceeded` | `KnownFailed`.
  `availability`: `Unknown` | `Unavailable` | `Available` | `AlreadyEstablished`.
  `Unknown` + `Available` means asking again can help; `Unknown` + `Unavailable` means
  no automatic process will resolve it and a person must reconcile it against the
  provider's own record.
- A refund is **single-shot**: the intent is committed before the rail is contacted, so
  a repeat is refused with a conflict. Never retry a lost refund answer; reconcile it.

## Public Payment Links and References

Payer-facing handles for one of the tenant's own obligations. Both require
`Payments.Manage`; the obligation must belong to the acting tenant.

```bash
# Issue an anonymous payment link; the plaintext token is revealed ONCE
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PublicPaymentLinks?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "obligationType": "Invoice", "obligationId": "<invoice-guid>", "expiresAt": "2026-12-31T00:00:00Z" }'
# result: { "id", "obligationType", "obligationId", "tenantId", "token", "relativeUrl", "expiresAt" }

# Issue (or return) the printable public payment reference (idempotent)
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PublicPaymentReferences?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "obligationType": "Invoice", "obligationId": "<invoice-guid>" }'
# result: { "id", "tenantId", "obligationType", "obligationId", "reference", "displayReference", "state", "mintedAt" }
```

`obligationType` is currently only `Invoice`. `expiresAt` is optional. Reference
`state`: `Unminted` | `Active` | `Revoked` | `Rotated`.

## PATCH (JSON Patch) Notes

`Payments`, `PaymentMethods`, `PaymentModes`, and `PaymentTerms` support PATCH via JSON
Patch (RFC 6902) at `PATCH .../<Resource>/<id>`. The request body is always a **JSON
array** of operations:

```json
[
  { "op": "replace", "path": "/<camelCaseField>", "value": <new-value> }
]
```

Use it for atomic, low-conflict edits. On `Payments`, operations reaching
`/paymentStatus` or `/data1` are refused (see Patch Payment).

## End-to-End Workflow

```bash
TENANT="<tenant-guid>"

# 1. (one-time setup) Create a payment method, mode, and term
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Credit Card", "description": "Visa / MasterCard" }'

curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Online Payment", "paymentMeansCode": "48" }'

curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Net 30", "creditDays": 30 }'

# 2. Record a payment against one of this tenant's invoices. Send your own id so you
#    know it; the status starts at Unset and only settlement/rail paths move it.
PAYMENT_ID="<new-guid>"
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "id": "'"$PAYMENT_ID"'",
    "invoiceId": "<invoice-guid>",
    "currencyId": "<currency-guid>",
    "totalCost": 1500.00,
    "totalTaxes": 120.00,
    "receiverWalletId": "<receiver-wallet-guid>",
    "paymentType": "Received",
    "referenceCode": "<reference-code>"
  }'

# 3. Close it and record the gateway authorization (atomic PATCH, no status change)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/$PAYMENT_ID?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/closed", "value": true },
    { "op": "replace", "path": "/authorization", "value": "<gateway-auth-code>" }
  ]'

# 4. Verify
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/$PAYMENT_ID?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

All paths are relative to `$ABSUITE_HOST_URL`. Every endpoint requires
`?tenantId=<tenant-guid>` (or the `X-TenantId` header) and runs tenant-scoped. The
Permission column is the `Permissions.*` constant the use case enforces.

### Payments

| Action | Method | Path | Permission |
|---|---|---|---|
| List payments | `GET` | `/api/v2/PaymentsService/Payments` | `Payments.Read` |
| Get payment by ID | `GET` | `/api/v2/PaymentsService/Payments/{paymentId}` | `Payments.Read` |
| Get payment details *(deprecated)* | `GET` | `/api/v2/PaymentsService/Payments/{paymentId}/Details` | `Payments.Read` |
| Create payment | `POST` | `/api/v2/PaymentsService/Payments` | `Payments.Create` |
| Update payment (full) | `PUT` | `/api/v2/PaymentsService/Payments/{paymentId}` | `Payments.Update` |
| Patch payment (JSON Patch) | `PATCH` | `/api/v2/PaymentsService/Payments/{paymentId}` | `Payments.Update` |
| Delete payment | `DELETE` | `/api/v2/PaymentsService/Payments/{paymentId}` | `Payments.Delete` |

### Payment Methods, Modes, and Terms

The three lookup resources share one shape: replace `{Resource}` with `PaymentMethods`,
`PaymentModes`, or `PaymentTerms` and `{id}` with its id.

| Action | Method | Path | Permission |
|---|---|---|---|
| List | `GET` | `/api/v2/PaymentsService/{Resource}` | `Payments.Read` |
| Count | `GET` | `/api/v2/PaymentsService/{Resource}/Count` | `Payments.Read` |
| Get by ID | `GET` | `/api/v2/PaymentsService/{Resource}/{id}` | `Payments.Read` |
| Create | `POST` | `/api/v2/PaymentsService/{Resource}` | `Payments.Create` |
| Update (full) | `PUT` | `/api/v2/PaymentsService/{Resource}/{id}` | `Payments.Update` |
| Patch (JSON Patch) | `PATCH` | `/api/v2/PaymentsService/{Resource}/{id}` | `Payments.Update` |
| Delete | `DELETE` | `/api/v2/PaymentsService/{Resource}/{id}` | `Payments.Delete` |

### Provider Registrations, Provider Operations, Public Handles

| Action | Method | Path | Permission |
|---|---|---|---|
| Provision registration | `POST` | `/api/v2/PaymentsService/PaymentProviderRegistrations` | `Payments.Manage` |
| List registrations | `GET` | `/api/v2/PaymentsService/PaymentProviderRegistrations` | `Payments.Read` |
| Count registrations | `GET` | `/api/v2/PaymentsService/PaymentProviderRegistrations/Count` | `Payments.Read` |
| Rotate webhook key | `POST` | `/api/v2/PaymentsService/PaymentProviderRegistrations/{registrationId}/RotateKey` | `Payments.Manage` |
| Update registration content | `PUT` | `/api/v2/PaymentsService/PaymentProviderRegistrations/{registrationId}` | `Payments.Manage` |
| Declare environment | `POST` | `/api/v2/PaymentsService/PaymentProviderRegistrations/{registrationId}/Environment` | `Payments.Manage` |
| Set credential mode | `POST` | `/api/v2/PaymentsService/PaymentProviderRegistrations/{registrationId}/Credential` | `Payments.Manage` |
| Outcome review queue | `GET` | `/api/v2/PaymentsService/ProviderOperations/AwaitingOutcome` | `Payments.Read` |
| Count outcome queue | `GET` | `/api/v2/PaymentsService/ProviderOperations/AwaitingOutcome/Count` | `Payments.Read` |
| Reconcile one outcome | `POST` | `/api/v2/PaymentsService/ProviderOperations/{providerOperationId}/ReconcileOutcome` | `Payments.Manage` |
| Refund one collection | `POST` | `/api/v2/PaymentsService/ProviderOperations/{providerOperationId}/Refund` | `PaymentRefunds.Create` |
| Issue public payment link | `POST` | `/api/v2/PaymentsService/PublicPaymentLinks` | `Payments.Manage` |
| Issue public payment reference | `POST` | `/api/v2/PaymentsService/PublicPaymentReferences` | `Payments.Manage` |

## Critical Rules

- **Authenticate first**, then pass `?tenantId=<tenant-guid>` (or `X-TenantId`) on
  **every** call; omitting it returns `400`.
- **Take enum values and field names from this skill.** In particular: `paymentType`
  is `Paid|Received|Internal` and `paymentStatus` is one of the 12 values listed under
  Key Concepts; neither is a free-text or card-brand string.
- **Payment status is server-owned.** Do not try to drive a lifecycle transition from
  the client: create resets it to `Unset`, `PUT` keeps the stored value, and a `PATCH`
  on `/paymentStatus` is refused.
- **Never PATCH `/data1`, and never write a read-back `data1` with PUT** (reads are
  redacted).
- **The invoice, order and emisor wallet named on a payment must be this tenant's**;
  otherwise the create answers not-found.
- **Set up methods, modes, and terms** (lookups) before referencing them from
  payments and invoices.
- **Webhook keys and payment-link tokens are shown once.** Store them at reveal time;
  rotate a lost webhook key, and issue a new link for a lost token.
- **A refund is single-shot.** On a lost answer, reconcile; never resend.
- The CLI cannot PATCH; for that use this REST skill.
