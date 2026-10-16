---
name: absuite-wallets
key: paperclip/skills/absuite-wallets/SKILL.md
version: 1.0.0
description: >
  Manage wallets and their sub-resources (bank accounts, payments, payment tokens,
  locations, withdraws/withdraw-requests) plus read access to orders, invoices,
  quotes, refunds and chargebacks, via the Alliance Business Suite (ABS) REST API.
  Covers create / read / update (PUT) / delete and PATCH (JSON Patch) where exposed.
  Wallets are addressed by walletId and gated on the caller owning the wallet; only
  bank accounts, tokens and locations take an optional tenantId. Agents cannot move
  money or add payment instruments. Every call requires a bearer token (see the
  absuite-login skill to authenticate).
---

# Alliance Business Suite: Wallets (REST API)

Drive the ABS **WalletsService** purely over HTTP with `curl`. A wallet is a financial
container that aggregates bank accounts, payment tokens, payments (incoming/outgoing),
withdraws, locations, and read-only ledger views (orders, invoices, quotes, refunds,
chargebacks). All endpoints hang off a single wallet identified by `{walletId}` in the
path.

> **Scoping (read this first).** A wallet is owned by a **user** (account-holder
> wallet), a **tenant** (business wallet), or a **contact**. Every endpoint first proves
> the caller **owns** the route wallet; a wallet the caller does not own answers
> not-found, exactly like a missing one (lists and counts included). There are two
> branches:
>
> - **User branch (no tenant).** No permission check; only the caller's **own user
>   wallet** matches. Most routes have no tenant parameter at all (wallet details,
>   payments, withdraws, withdraw requests, orders, invoices, quotes, refunds,
>   chargebacks), so they always run here: a business or contact wallet is not
>   reachable through them.
> - **Tenant branch.** Only `BankAccounts`, `Tokens` and `Locations` accept an optional
>   `?tenantId=<tenant-guid>` (or `X-TenantId` header). With it, the use case checks the
>   permission in the quick reference for that tenant and the gate also matches that
>   tenant's business and contact wallets. Without it, they run on the user branch.
>
> A tenant parameter sent to any other route is not bound and has no effect. Omitting
> it never returns `400` here.

> **Agents are refused.** A non-human principal (any `PrincipalKind` other than
> `Human`, e.g. an agent) gets an authorization error ("An agent cannot move money or
> add a payment method on its own; a person must approve it.") on: withdraw request
> create, wallet payment create, payment token create/update/patch, and bank account
> create/update/patch. A person must perform these. Reads, deletes and location writes
> are not affected by this rule.

> For the CLI equivalent of these operations, see `absuite-wallets-cli`. For general REST
> conventions across all ABS services, see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select`: page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the resource**: for locations and bank accounts, omitted fields are reset, so **GET first, change the full object, then PUT it back**. Payment-token `PUT` is the exception: a `null`/omitted field keeps its stored value.
- **`PATCH` exists only on BankAccounts and Tokens**, and they behave differently (see the PATCH section): a token patch is partial, a bank-account patch is **not**.

## Authentication

Obtain a bearer token, then send it on every request.

```bash
# 1) Log in -> returns accessToken
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<user-email>", "password": "<user-password>"}'

# 2) Send the token on every subsequent call
#    -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

- **Base path:** `$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/{walletId}/...`
- **Response envelope:** every response is
  `{ "isSuccess": bool, "errorMessage": str|null, "correlationId": str, "timestamp": str, "result": <data|array|int|null> }`.
  Always check `isSuccess`; read the payload from `result` (a `Count` endpoint returns an
  integer in `result`).
- **Optional version params:** `api-version` (query) and `x-api-version` (header) are
  both optional; omit them unless you need to pin a version.

## Key Concepts

- **walletId**: the path segment `{walletId}`. Obtain it from the owning identity's API
  (e.g. a tenant's or user's wallet reference) before calling here.
- **Sub-resources**: `BankAccounts`, `Tokens` (payment tokens), `Payments`, `Withdraws`,
  `WithdrawRequests`, `Locations`. Which verbs exist depends on the resource (see the
  quick reference).
- **Read-only ledger views**: `Orders` (+ `Orders/Extended`), `Invoices`, `Quotes`,
  `Refunds`, `Chargebacks`. These are GET-only in this service.
- **Direction splits**: `Invoices` and `Payments` each expose `Incoming` and `Outgoing`
  sub-collections (plus their `/Count`). `Incoming` = received, `Outgoing` = sent.
- **Count endpoints**: almost every collection has a sibling `/Count` returning an
  integer in `result`.
- **Payment enums** (use these exact casings):
  - `onBehalfOf`: `Self` | `Tenant` | `Individual` | `Organization`
  - `paymentType`: `Paid` | `Received` | `Internal`
  - `paymentStatus`: `Unset` | `Accepted` | `Rejected` | `OnHold` | `Failed` | `Reversed` | `Retained` | `Initialized` | `Expired` | `Abandoned` | `Cancelled` | `AcceptedRetained` (server-owned: a client-created payment always starts at `Unset`)

## Wallet Details

```bash
# Get wallet details (user branch: your own user wallet only)
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Bank Accounts

Add `?tenantId=<tenant-guid>` to act on a tenant's business or contact wallet (tenant
branch, `BankAccounts.*` permissions); omit it for your own user wallet.

```bash
# List bank accounts
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count bank accounts
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get one bank account
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/$BANK_ACCOUNT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a bank account (BankAccountCreateDto). Human callers only.
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bankAccountNumber": "<account-number>",
    "bankId": "<bank-guid>",
    "iban": "<iban>",
    "swift": "<swift>",
    "branchCode": "<branch-code>"
  }'

# Update a bank account (PUT, BankAccountUpdateDto). Human callers only.
curl -X PUT "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/$BANK_ACCOUNT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bankAccountNumber": "<account-number>",
    "bankId": "<bank-guid>",
    "iban": "<iban>",
    "swift": "<swift>",
    "branchCode": "<branch-code>"
  }'

# Patch a bank account (PATCH, JSON Patch; NOT partial, see PATCH section)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/$BANK_ACCOUNT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/bankAccountNumber", "value": "<account-number>" },
    { "op": "replace", "path": "/iban", "value": "<iban>" },
    { "op": "replace", "path": "/swift", "value": "<new-swift>" },
    { "op": "replace", "path": "/branchCode", "value": "<branch-code>" }
  ]'

# Delete a bank account
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/$BANK_ACCOUNT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**BankAccountCreateDto fields:** `id`, `timestamp`, `name`, `iban`, `swift`, `branchCode`,
`bankAccountNumber`, `bankId`, `bankProfileId`, `walletId`.
**BankAccountUpdateDto fields:** `name`, `iban`, `swift`, `branchCode`, `bankAccountNumber`,
`bankId`, `bankProfileId`, `walletId`.

What the server actually writes:
- **Create** uses `id`, `bankAccountNumber` (required; it also becomes the account's
  name), `bankId` (required), `iban`, `swift`, `branchCode`. The wallet is the route
  wallet. `name`, `bankProfileId` and `walletId` in the body are ignored. Ownership is
  stamped from the caller's session tenant and enrollment, which must be present.
- **Update** assigns `iban`, `swift`, `branchCode`, `bankAccountNumber` unconditionally
  (omitted = cleared) and `bankId` only when non-empty. `name`, `bankProfileId` and
  `walletId` are ignored.

## Payment Tokens

Add `?tenantId=<tenant-guid>` for a tenant's business or contact wallet (tenant branch,
`PaymentTokens.*` permissions); omit it for your own user wallet.

```bash
# List tokens
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count tokens
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get one token
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens/$TOKEN_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a token (PaymentTokenCreateDto; cardExpirationMonth and cardExpirationYear are
# REQUIRED). Human callers only.
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tokenType": "<token-type>",
    "cardFranchise": "<franchise>",
    "cardExpirationMonth": "12",
    "cardExpirationYear": "2030",
    "validUntil": "2030-12-31T00:00:00Z",
    "paymentGatewayId": "<gateway-guid>"
  }'

# Update a token (PUT, PaymentTokenUpdateDto; null/omitted fields keep their value).
# Human callers only.
curl -X PUT "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens/$TOKEN_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cardExpirationMonth": "06",
    "cardExpirationYear": "2031",
    "status": "<status>",
    "validUntil": "2031-06-30T00:00:00Z"
  }'

# Patch a token (PATCH, JSON Patch, partial). Human callers only.
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens/$TOKEN_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/cardExpirationMonth", "value": "06" },
    { "op": "replace", "path": "/cardExpirationYear", "value": "2031" }
  ]'

# Delete a token
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens/$TOKEN_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**PaymentTokenCreateDto fields:** `id`, `timestamp`, `mask`, `tokenType`,
`cardFranchise`, `cardExpirationMonth` **(REQ)**, `cardExpirationYear` **(REQ)**,
`validUntil` (defaults to five years from now), `paymentGatewayId`.
**PaymentTokenUpdateDto fields:** `mask`, `tokenType`, `cardFranchise`,
`cardExpirationMonth`, `cardExpirationYear`, `status`, `validUntil`, `paymentGatewayId`.
`mask` is **never taken from the caller** (create or update): it stays in the DTO for
compatibility and is ignored, so a card number can never be stored through it.

## Payments

`Payments` supports list, count, create, and direction-split reads (Incoming / Outgoing,
each with its own Count). There is no per-payment GET/PUT/PATCH/DELETE in this service
(use `absuite-payments` for tenant payment records). These routes take no tenant, so
they run on the user branch (your own user wallet).

```bash
# List all payments
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count all payments
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Incoming payments (received) + count
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments/Incoming" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments/Incoming/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Outgoing payments (sent) + count
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments/Outgoing" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments/Outgoing/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Pay FROM this wallet (PaymentCreateDto). Human callers only.
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "<invoice-guid>",
    "receiverWalletId": "<receiver-wallet-guid>",
    "currencyId": "<currency-guid>",
    "forexRate": 1.0,
    "totalCost": 1500.00,
    "totalTaxes": 0.00,
    "onBehalfOf": "Self",
    "paymentType": "Paid",
    "paymentGatewayId": "<gateway-guid>",
    "paymentTokenId": "<token-guid>"
  }'
```

Server-side rules on wallet payment create:
- The payment is always made **from the route wallet**: the emisor is set to
  `{walletId}`. Sending a different `emisorWalletId` or `emisorWalletAccountId` is
  refused with a validation error.
- `invoiceId` must be an invoice addressed to you as account holder, and `orderId` an
  order you own; otherwise not-found.
- `paymentStatus` is reset to `Unset` whatever you send.

**PaymentCreateDto** is wide; the most commonly used fields are shown above. Full field set
(all optional unless noted): `id`, `timestamp`, `invoiceId`, `emisorWalletId`,
`receiverWalletId`, `currencyId`, `forexRate`, `totalCost`, `totalTaxes`, `closed`, `data`,
`dataLabel`, `data1`, `data1Label`, `response`, `authorization`, `referenceCode`,
`correlationCode`, `lastUpdated`, `onBehalfOf` (enum), `paymentType` (enum),
`paymentStatus` (enum, reset to `Unset`), `baseCost`, `signature`, `signatureMismatch`,
`isExternal`, `markedForRevision`, `forexRatesSnapshot`, `officialId`,
`officialIdExpeditionDate`, `fiscalIdentificationTypeId`, `billingAddress`, `phone`,
`cellphone`, `department`, `city`, `countryId`, `locationId`, `entitlementId`,
`antiFraudScore`, `callRecordURL`, `called`, `verified`, `payerPictureTimestamp`,
`payerPicture`, `identificationPictureTimestamp`, `identificationPicture`,
`identificationBackPicture`, `identificationBackPictureTimestamp`, `ipLookupId`, `orderId`,
`accountingEntryId`, `paymentGatewayId`, `bankAccountId`, `bankId`, `paymentTokenId`,
`emisorWalletAccountId`, `receiverWalletAccountId`. Payment reads return `data1`
redacted.

## Withdraws & Withdraw Requests

These routes take no tenant (user branch).

```bash
# List withdraws + count
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Withdraws" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Withdraws/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a withdraw request (WalletWithdrawRequestCreateDto), POSTed to /Withdraws.
# Human callers only.
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Withdraws" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requestedWithdrawAmount": 5000.00,
    "currencyId": "<currency-guid>",
    "bankAccountId": "<bank-account-guid>"
  }'

# List withdraw requests + count
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/WithdrawRequests" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/WithdrawRequests/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**WalletWithdrawRequestCreateDto fields:** `id` (optional, generated when omitted),
`timestamp`, `requestedWithdrawAmount`, `currencyId`, `bankAccountId`.
Note: creating a withdraw request is a `POST` to `.../Withdraws` (not
`.../WithdrawRequests`); `WithdrawRequests` is read-only (list + count). A new request
starts `Pending`; the wallet must be one you own (otherwise not-found).

## Locations

Add `?tenantId=<tenant-guid>` for a tenant's business or contact wallet (tenant branch,
`Locations.*` permissions); omit it for your own user wallet.

```bash
# List locations + count
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Locations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Locations/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get one location
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Locations/$LOCATION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a location (LocationCreateDto)
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Locations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Main Office",
    "email": "<email>",
    "phone": "<phone>",
    "address1": "<address-line-1>",
    "cityId": "<city-guid>",
    "stateId": "<state-guid>",
    "countryId": "<country-guid>",
    "postalCode": "<postal-code>",
    "longitude": 0,
    "latitude": 0,
    "isRoutable": true,
    "isDefaultSenderAddress": false
  }'

# Update a location (PUT, full LocationUpdateDto; title and address1 are required)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Locations/$LOCATION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Office Name",
    "email": "<email>",
    "phone": "<phone>",
    "address1": "<address-line-1>",
    "cityId": "<city-guid>",
    "stateId": "<state-guid>",
    "countryId": "<country-guid>",
    "postalCode": "<postal-code>"
  }'

# Delete a location
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Locations/$LOCATION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**LocationCreateDto fields:** `id`, `timestamp`, `title`, `email`, `phone`, `fax`,
`address1`, `address2`, `address3`, `unit`, `cityId`, `stateId`, `postalCode`, `countryId`,
`longitude`, `latitude`, `isRoutable`, `isGlobalPrimary`, `isCountryPrimary`,
`canGenerateLabels`, `isDefaultSenderAddress`, `isDefaultReturnAddress`,
`isDefaultSuppingLocation` (sic).
**LocationUpdateDto fields:** same as create **minus** `id` and `timestamp`. Every field
is assigned on update, so an omitted one is cleared.
Note: `Locations` does **not** expose a PATCH endpoint; use PUT for updates.

## Read-Only Ledger Views

These collections are GET-only, take no tenant (user branch: your own user wallet), and
each has a sibling `/Count`.

```bash
# Orders
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Orders" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Orders/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Extended orders (with related data)
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Orders/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Invoices (all + count, and Incoming / Outgoing splits with their counts)
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Invoices" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Invoices/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Invoices/Incoming" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Invoices/Incoming/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Invoices/Outgoing" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Invoices/Outgoing/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Quotes
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Quotes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Quotes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Refunds
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Refunds" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Refunds/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Chargebacks
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Chargebacks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Chargebacks/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## PATCH (JSON Patch, RFC 6902)

Only **two** sub-resources support PATCH in WalletsService, and both are human-only:

- `PATCH /api/v2/WalletsService/Wallets/{walletId}/Tokens/{tokenId}`: **partial**. The
  patch fills an empty update DTO and every field left `null` keeps its stored value.
- `PATCH /api/v2/WalletsService/Wallets/{walletId}/BankAccounts/{bankAccountId}`:
  **not partial**. The patch fills an empty update DTO that is then applied like a PUT,
  so `iban`, `swift`, `branchCode` and `bankAccountNumber` not named in the patch are
  **cleared**. Always send all four (as in the Bank Accounts example), or use PUT.

The request body is a JSON **array** of operations (`Content-Type: application/json`).
Each op has `op` (one of `add|remove|replace|move|copy|test`), a JSON-Pointer `path`
(leading `/`, camelCase field), and (for add/replace) a `value`.

```bash
# Patch a payment token: bump the expiry without resending the rest
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens/$TOKEN_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/cardExpirationMonth", "value": "06" },
    { "op": "replace", "path": "/cardExpirationYear", "value": "2031" }
  ]'
```

`Locations` updates use PUT only (no PATCH endpoint exists). Payments and the read-only
ledger views have no PATCH.

## End-to-End Workflow

As a person, on your own user wallet: add payment instruments, pay an invoice addressed
to you from the wallet, then confirm it:

```bash
WALLET_ID="<wallet-guid>"

# 1) Create a bank account for the wallet
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "bankAccountNumber": "<account-number>", "bankId": "<bank-guid>", "iban": "<iban>", "swift": "<swift>", "branchCode": "<branch-code>" }'

# 2) Store a payment token (expiry month and year are required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "cardExpirationMonth": "12", "cardExpirationYear": "2030", "paymentGatewayId": "<gateway-guid>" }'

# 3) Pay an invoice FROM this wallet (status starts at Unset; settlement moves it)
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "invoiceId": "<invoice-guid>", "receiverWalletId": "<receiver-wallet-guid>", "currencyId": "<currency-guid>", "totalCost": 1500.00, "onBehalfOf": "Self", "paymentType": "Paid", "paymentTokenId": "<token-guid>" }'

# 4) Verify it landed in outgoing
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments/Outgoing/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

Scope column: **User** = no tenant parameter, user branch only (your own user wallet, no
permission check). **User / Tenant** = optional `tenantId`; the permission applies on the
tenant branch only. **Human** marks the actions an agent is refused.

| Action | Method | Path | Scope | Permission (tenant branch) |
|---|---|---|---|---|
| Get wallet details | GET | `/api/v2/WalletsService/Wallets/{walletId}` | User | |
| List bank accounts | GET | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts` | User / Tenant | `BankAccounts.Read` |
| Count bank accounts | GET | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts/Count` | User / Tenant | `BankAccounts.Read` |
| Get bank account | GET | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts/{bankAccountId}` | User / Tenant | `BankAccounts.Read` |
| Create bank account (Human) | POST | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts` | User / Tenant | `BankAccounts.Create` |
| Update bank account (Human) | PUT | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts/{bankAccountId}` | User / Tenant | `BankAccounts.Update` |
| Patch bank account (Human) | PATCH | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts/{bankAccountId}` | User / Tenant | `BankAccounts.Update` |
| Delete bank account | DELETE | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts/{bankAccountId}` | User / Tenant | `BankAccounts.Delete` |
| List tokens | GET | `/api/v2/WalletsService/Wallets/{walletId}/Tokens` | User / Tenant | `PaymentTokens.Read` |
| Count tokens | GET | `/api/v2/WalletsService/Wallets/{walletId}/Tokens/Count` | User / Tenant | `PaymentTokens.Read` |
| Get token | GET | `/api/v2/WalletsService/Wallets/{walletId}/Tokens/{tokenId}` | User / Tenant | `PaymentTokens.Read` |
| Create token (Human) | POST | `/api/v2/WalletsService/Wallets/{walletId}/Tokens` | User / Tenant | `PaymentTokens.Create` |
| Update token (Human) | PUT | `/api/v2/WalletsService/Wallets/{walletId}/Tokens/{tokenId}` | User / Tenant | `PaymentTokens.Update` |
| Patch token (Human) | PATCH | `/api/v2/WalletsService/Wallets/{walletId}/Tokens/{tokenId}` | User / Tenant | `PaymentTokens.Update` |
| Delete token | DELETE | `/api/v2/WalletsService/Wallets/{walletId}/Tokens/{tokenId}` | User / Tenant | `PaymentTokens.Delete` |
| List payments | GET | `/api/v2/WalletsService/Wallets/{walletId}/Payments` | User | |
| Count payments | GET | `/api/v2/WalletsService/Wallets/{walletId}/Payments/Count` | User | |
| Create payment (Human) | POST | `/api/v2/WalletsService/Wallets/{walletId}/Payments` | User | |
| Incoming payments | GET | `/api/v2/WalletsService/Wallets/{walletId}/Payments/Incoming` | User | |
| Count incoming payments | GET | `/api/v2/WalletsService/Wallets/{walletId}/Payments/Incoming/Count` | User | |
| Outgoing payments | GET | `/api/v2/WalletsService/Wallets/{walletId}/Payments/Outgoing` | User | |
| Count outgoing payments | GET | `/api/v2/WalletsService/Wallets/{walletId}/Payments/Outgoing/Count` | User | |
| List withdraws | GET | `/api/v2/WalletsService/Wallets/{walletId}/Withdraws` | User | |
| Count withdraws | GET | `/api/v2/WalletsService/Wallets/{walletId}/Withdraws/Count` | User | |
| Create withdraw request (Human) | POST | `/api/v2/WalletsService/Wallets/{walletId}/Withdraws` | User | |
| List withdraw requests | GET | `/api/v2/WalletsService/Wallets/{walletId}/WithdrawRequests` | User | |
| Count withdraw requests | GET | `/api/v2/WalletsService/Wallets/{walletId}/WithdrawRequests/Count` | User | |
| List locations | GET | `/api/v2/WalletsService/Wallets/{walletId}/Locations` | User / Tenant | `Locations.Read` |
| Count locations | GET | `/api/v2/WalletsService/Wallets/{walletId}/Locations/Count` | User / Tenant | `Locations.Read` |
| Get location | GET | `/api/v2/WalletsService/Wallets/{walletId}/Locations/{locationId}` | User / Tenant | `Locations.Read` |
| Create location | POST | `/api/v2/WalletsService/Wallets/{walletId}/Locations` | User / Tenant | `Locations.Create` |
| Update location | PUT | `/api/v2/WalletsService/Wallets/{walletId}/Locations/{locationId}` | User / Tenant | `Locations.Update` |
| Delete location | DELETE | `/api/v2/WalletsService/Wallets/{walletId}/Locations/{locationId}` | User / Tenant | `Locations.Delete` |
| List orders | GET | `/api/v2/WalletsService/Wallets/{walletId}/Orders` | User | |
| Count orders | GET | `/api/v2/WalletsService/Wallets/{walletId}/Orders/Count` | User | |
| Extended orders | GET | `/api/v2/WalletsService/Wallets/{walletId}/Orders/Extended` | User | |
| List invoices | GET | `/api/v2/WalletsService/Wallets/{walletId}/Invoices` | User | |
| Count invoices | GET | `/api/v2/WalletsService/Wallets/{walletId}/Invoices/Count` | User | |
| Incoming invoices | GET | `/api/v2/WalletsService/Wallets/{walletId}/Invoices/Incoming` | User | |
| Count incoming invoices | GET | `/api/v2/WalletsService/Wallets/{walletId}/Invoices/Incoming/Count` | User | |
| Outgoing invoices | GET | `/api/v2/WalletsService/Wallets/{walletId}/Invoices/Outgoing` | User | |
| Count outgoing invoices | GET | `/api/v2/WalletsService/Wallets/{walletId}/Invoices/Outgoing/Count` | User | |
| List quotes | GET | `/api/v2/WalletsService/Wallets/{walletId}/Quotes` | User | |
| Count quotes | GET | `/api/v2/WalletsService/Wallets/{walletId}/Quotes/Count` | User | |
| List refunds | GET | `/api/v2/WalletsService/Wallets/{walletId}/Refunds` | User | |
| Count refunds | GET | `/api/v2/WalletsService/Wallets/{walletId}/Refunds/Count` | User | |
| List chargebacks | GET | `/api/v2/WalletsService/Wallets/{walletId}/Chargebacks` | User | |
| Count chargebacks | GET | `/api/v2/WalletsService/Wallets/{walletId}/Chargebacks/Count` | User | |
| My Ether balance | GET | `/api/v2/WalletsService/Me/Ethereum/Balance` | User | |

`Me/Ethereum/Balance` takes no wallet id: it reads the caller's own wallet and returns
`address`, `balanceInEther`, `testNet` (never key material).

## Critical Rules

- **Authenticate first**: every call carries `Authorization: Bearer $ABSUITE_ACCESS_TOKEN`.
- **You must own the route wallet.** A wallet you do not own answers not-found (never
  an empty list), the same as a missing id.
- **Know the branch.** Only `BankAccounts`, `Tokens` and `Locations` accept an optional
  `tenantId` (query or `X-TenantId`), which switches them to the tenant branch with a
  permission check. Every other route ignores a tenant and only reaches your own user
  wallet.
- **Agents cannot move money or add payment instruments.** Withdraw request create,
  wallet payment create, token create/update/patch and bank account create/update/patch
  return an authorization error for any non-human principal. A person must do them.
- **Wallet payments are always FROM the route wallet**; a different emisor is refused,
  and the payment status always starts at `Unset`.
- **Invoices and payments split by direction**: `Incoming` = received, `Outgoing` = sent.
- **PATCH exists only on BankAccounts and Tokens.** A bank-account PATCH clears the
  four account fields it does not name; a token PATCH is partial. Locations use PUT;
  Payments and the read-only views have no PATCH.
- **A token's `mask` is never stored from the request**, and a bank account's `name`,
  `bankProfileId` and `walletId` are ignored.
- **Creating a withdraw request is `POST .../Withdraws`**; `WithdrawRequests` is
  read-only.
