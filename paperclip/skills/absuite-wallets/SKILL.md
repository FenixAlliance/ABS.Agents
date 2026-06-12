---
name: absuite-wallets
description: >
  Manage wallets and their sub-resources — bank accounts, payments, payment tokens,
  locations, withdraws/withdraw-requests — plus read access to orders, invoices,
  quotes, refunds and chargebacks, via the Alliance Business Suite (ABS) REST API.
  Covers create / read / update (PUT) / delete and atomic PATCH (JSON Patch) updates.
  Wallets are scoped by walletId (ownership-keyed), not by tenant, and every call
  requires a bearer token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Wallets (REST API)

Drive the ABS **WalletsService** purely over HTTP with `curl`. A wallet is a financial
container that aggregates bank accounts, payment tokens, payments (incoming/outgoing),
withdraws, locations, and read-only ledger views (orders, invoices, quotes, refunds,
chargebacks). All endpoints hang off a single wallet identified by `{walletId}` in the
path.

> **Scoping (read this first).** WalletsService is **cross-identity**: a wallet can be
> owned by a **user**, a **tenant**, or a **contact**. Every endpoint is keyed by
> `walletId` in the URL path, which already resolves ownership. **Do NOT append
> `?tenantId=` and do NOT send an `X-TenantId` header** — no wallet endpoint in the
> manifest declares a `tenantId` parameter, so any tenant param is ignored. Authorization
> is by the bearer token plus the wallet's ownership.

> For the CLI equivalent of these operations, see `absuite-wallets-cli`. For general REST
> conventions across all ABS services, see `absuite-rest`.

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
- **Optional version params** (per manifest, every endpoint): `api-version` (query) and
  `x-api-version` (header) are both optional — omit them unless you need to pin a version.

## Key Concepts

- **walletId** — the single scoping key. Path segment `{walletId}`. Obtain it from the
  owning identity's API (e.g. a tenant's or user's wallet reference) before calling here.
- **Sub-resources** — `BankAccounts`, `Tokens` (payment tokens), `Payments`, `Withdraws`,
  `WithdrawRequests`, `Locations`. These support writes (POST/PUT/PATCH/DELETE) depending
  on the resource (see the quick reference for exactly which verbs exist).
- **Read-only ledger views** — `Orders` (+ `Orders/Extended`), `Invoices`, `Quotes`,
  `Refunds`, `Chargebacks`. These are GET-only in this service.
- **Direction splits** — `Invoices` and `Payments` each expose `Incoming` and `Outgoing`
  sub-collections (plus their `/Count`). `Incoming` = received, `Outgoing` = sent.
- **Count endpoints** — almost every collection has a sibling `/Count` returning an
  integer in `result`.
- **Payment enums** (from the spec — use these exact casings):
  - `onBehalfOf`: `Self` | `Tenant` | `Individual` | `Organization`
  - `paymentType`: `Paid` | `Received` | `Internal`
  - `paymentStatus`: `Unset` | `Accepted` | `Rejected` | `OnHold` | `Failed` | `Reversed` | `Retained` | `Initialized` | `Expired` | `Abandoned` | `Cancelled` | `AcceptedRetained`

## Wallet Details

```bash
# Get wallet details
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Bank Accounts

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

# Create a bank account (BankAccountCreateDto)
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Primary Business Account",
    "iban": "<iban>",
    "swift": "<swift>",
    "branchCode": "<branch-code>",
    "bankAccountNumber": "<account-number>",
    "bankId": "<bank-guid>",
    "bankProfileId": "<bank-profile-guid>",
    "walletId": "'"$WALLET_ID"'"
  }'

# Update a bank account (PUT, full BankAccountUpdateDto)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/$BANK_ACCOUNT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Account Name",
    "iban": "<iban>",
    "swift": "<swift>",
    "branchCode": "<branch-code>",
    "bankAccountNumber": "<account-number>",
    "bankId": "<bank-guid>",
    "bankProfileId": "<bank-profile-guid>",
    "walletId": "'"$WALLET_ID"'"
  }'

# Patch a bank account (PATCH, JSON Patch — see PATCH section)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/$BANK_ACCOUNT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/name", "value": "Renamed Account" } ]'

# Delete a bank account
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/$BANK_ACCOUNT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**BankAccountCreateDto fields:** `id`, `timestamp`, `name`, `iban`, `swift`, `branchCode`,
`bankAccountNumber`, `bankId`, `bankProfileId`, `walletId`.
**BankAccountUpdateDto fields:** `name`, `iban`, `swift`, `branchCode`, `bankAccountNumber`,
`bankId`, `bankProfileId`, `walletId`.

## Payment Tokens

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

# Create a token (PaymentTokenCreateDto — mask, cardExpirationMonth, cardExpirationYear are REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mask": "************1234",
    "tokenType": "<token-type>",
    "cardFranchise": "<franchise>",
    "cardExpirationMonth": "12",
    "cardExpirationYear": "2030",
    "validUntil": "2030-12-31T00:00:00Z",
    "paymentGatewayId": "<gateway-guid>"
  }'

# Update a token (PUT, PaymentTokenUpdateDto)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens/$TOKEN_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mask": "************1234",
    "tokenType": "<token-type>",
    "cardFranchise": "<franchise>",
    "cardExpirationMonth": "06",
    "cardExpirationYear": "2031",
    "status": "<status>",
    "validUntil": "2031-06-30T00:00:00Z",
    "paymentGatewayId": "<gateway-guid>"
  }'

# Patch a token (PATCH, JSON Patch — see PATCH section)
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

**PaymentTokenCreateDto fields:** `id`, `timestamp`, `mask` **(REQ)**, `tokenType`,
`cardFranchise`, `cardExpirationMonth` **(REQ)**, `cardExpirationYear` **(REQ)**,
`validUntil`, `paymentGatewayId`.
**PaymentTokenUpdateDto fields:** `mask`, `tokenType`, `cardFranchise`,
`cardExpirationMonth`, `cardExpirationYear`, `status`, `validUntil`, `paymentGatewayId`.

## Payments

`Payments` supports list, count, create, and direction-split reads (Incoming / Outgoing,
each with its own Count). There is no per-payment GET/PUT/PATCH/DELETE in this service.

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

# Create a payment (PaymentCreateDto — enums per Key Concepts)
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "<invoice-guid>",
    "emisorWalletId": "<emisor-wallet-guid>",
    "receiverWalletId": "<receiver-wallet-guid>",
    "currencyId": "<currency-guid>",
    "forexRate": 1.0,
    "totalCost": 1500.00,
    "totalTaxes": 0.00,
    "onBehalfOf": "Self",
    "paymentType": "Paid",
    "paymentStatus": "Initialized",
    "orderId": "<order-guid>",
    "paymentGatewayId": "<gateway-guid>",
    "bankAccountId": "<bank-account-guid>",
    "paymentTokenId": "<token-guid>"
  }'
```

**PaymentCreateDto** is wide; the most commonly used fields are shown above. Full field set
(all optional unless noted): `id`, `timestamp`, `invoiceId`, `emisorWalletId`,
`receiverWalletId`, `currencyId`, `forexRate`, `totalCost`, `totalTaxes`, `closed`, `data`,
`dataLabel`, `data1`, `data1Label`, `response`, `authorization`, `referenceCode`,
`correlationCode`, `lastUpdated`, `onBehalfOf` (enum), `paymentType` (enum),
`paymentStatus` (enum), `baseCost`, `signature`, `signatureMismatch`, `isExternal`,
`markedForRevision`, `forexRatesSnapshot`, `officialId`, `officialIdExpeditionDate`,
`fiscalIdentificationTypeId`, `billingAddress`, `phone`, `cellphone`, `department`, `city`,
`countryId`, `locationId`, `entitlementId`, `antiFraudScore`, `callRecordURL`, `called`,
`verified`, `payerPictureTimestamp`, `payerPicture`, `identificationPictureTimestamp`,
`identificationPicture`, `identificationBackPicture`, `identificationBackPictureTimestamp`,
`ipLookupId`, `orderId`, `accountingEntryId`, `paymentGatewayId`, `bankAccountId`, `bankId`,
`paymentTokenId`, `emisorWalletAccountId`, `receiverWalletAccountId`.

## Withdraws & Withdraw Requests

```bash
# List withdraws + count
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Withdraws" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Withdraws/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a withdraw request (WalletWithdrawRequestCreateDto) — POSTed to /Withdraws
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

**WalletWithdrawRequestCreateDto fields:** `id`, `timestamp`, `requestedWithdrawAmount`,
`currencyId`, `bankAccountId`.
Note: creating a withdraw is a `POST` to `.../Withdraws` (not `.../WithdrawRequests`);
`WithdrawRequests` is read-only (list + count).

## Locations

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

# Update a location (PUT, LocationUpdateDto)
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
`isDefaultSuppingLocation`.
**LocationUpdateDto fields:** same as create **minus** `id` and `timestamp`.
Note: `Locations` does **not** expose a PATCH endpoint — use PUT for updates.

## Read-Only Ledger Views

These collections are GET-only. Each has a sibling `/Count`.

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

Only **two** sub-resources support PATCH in WalletsService:

- `PATCH /api/v2/WalletsService/Wallets/{walletId}/BankAccounts/{bankAccountId}`
- `PATCH /api/v2/WalletsService/Wallets/{walletId}/Tokens/{tokenId}`

The request body is a JSON **array** of operations (`Content-Type: application/json`).
Each op has `op` ∈ `add|remove|replace|move|copy|test`, a JSON-Pointer `path` (leading `/`,
camelCase field), and (for add/replace) a `value`. Use PATCH for atomic partial updates so
you don't have to resend the whole DTO.

```bash
# Patch a bank account — rename and change the SWIFT in one atomic call
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/$BANK_ACCOUNT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/name", "value": "Treasury Operating Account" },
    { "op": "replace", "path": "/swift", "value": "<new-swift>" }
  ]'

# Patch a payment token — bump the expiry without resending mask/franchise
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

Set up a wallet's payment instruments and record an incoming payment, then tidy up with a
PATCH:

```bash
WALLET_ID="<wallet-guid>"

# 1) Create a bank account for the wallet
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Treasury", "bankAccountNumber": "<account-number>", "bankId": "<bank-guid>", "walletId": "'"$WALLET_ID"'" }'

# 2) Store a payment token (mask + expiry are required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "mask": "************4242", "cardExpirationMonth": "12", "cardExpirationYear": "2030", "paymentGatewayId": "<gateway-guid>" }'

# 3) Record an incoming payment against an invoice
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "invoiceId": "<invoice-guid>", "receiverWalletId": "'"$WALLET_ID"'", "currencyId": "<currency-guid>", "totalCost": 1500.00, "onBehalfOf": "Self", "paymentType": "Received", "paymentStatus": "Accepted" }'

# 4) Verify it landed in incoming
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments/Incoming/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 5) Atomically rename the bank account (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/$BANK_ACCOUNT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/name", "value": "Treasury Operating Account" } ]'
```

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| Get wallet details | GET | `/api/v2/WalletsService/Wallets/{walletId}` |
| List bank accounts | GET | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts` |
| Count bank accounts | GET | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts/Count` |
| Get bank account | GET | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts/{bankAccountId}` |
| Create bank account | POST | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts` |
| Update bank account | PUT | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts/{bankAccountId}` |
| **Patch bank account** | **PATCH** | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts/{bankAccountId}` |
| Delete bank account | DELETE | `/api/v2/WalletsService/Wallets/{walletId}/BankAccounts/{bankAccountId}` |
| List tokens | GET | `/api/v2/WalletsService/Wallets/{walletId}/Tokens` |
| Count tokens | GET | `/api/v2/WalletsService/Wallets/{walletId}/Tokens/Count` |
| Get token | GET | `/api/v2/WalletsService/Wallets/{walletId}/Tokens/{tokenId}` |
| Create token | POST | `/api/v2/WalletsService/Wallets/{walletId}/Tokens` |
| Update token | PUT | `/api/v2/WalletsService/Wallets/{walletId}/Tokens/{tokenId}` |
| **Patch token** | **PATCH** | `/api/v2/WalletsService/Wallets/{walletId}/Tokens/{tokenId}` |
| Delete token | DELETE | `/api/v2/WalletsService/Wallets/{walletId}/Tokens/{tokenId}` |
| List payments | GET | `/api/v2/WalletsService/Wallets/{walletId}/Payments` |
| Count payments | GET | `/api/v2/WalletsService/Wallets/{walletId}/Payments/Count` |
| Create payment | POST | `/api/v2/WalletsService/Wallets/{walletId}/Payments` |
| Incoming payments | GET | `/api/v2/WalletsService/Wallets/{walletId}/Payments/Incoming` |
| Count incoming payments | GET | `/api/v2/WalletsService/Wallets/{walletId}/Payments/Incoming/Count` |
| Outgoing payments | GET | `/api/v2/WalletsService/Wallets/{walletId}/Payments/Outgoing` |
| Count outgoing payments | GET | `/api/v2/WalletsService/Wallets/{walletId}/Payments/Outgoing/Count` |
| List withdraws | GET | `/api/v2/WalletsService/Wallets/{walletId}/Withdraws` |
| Count withdraws | GET | `/api/v2/WalletsService/Wallets/{walletId}/Withdraws/Count` |
| Create withdraw (request) | POST | `/api/v2/WalletsService/Wallets/{walletId}/Withdraws` |
| List withdraw requests | GET | `/api/v2/WalletsService/Wallets/{walletId}/WithdrawRequests` |
| Count withdraw requests | GET | `/api/v2/WalletsService/Wallets/{walletId}/WithdrawRequests/Count` |
| List locations | GET | `/api/v2/WalletsService/Wallets/{walletId}/Locations` |
| Count locations | GET | `/api/v2/WalletsService/Wallets/{walletId}/Locations/Count` |
| Get location | GET | `/api/v2/WalletsService/Wallets/{walletId}/Locations/{locationId}` |
| Create location | POST | `/api/v2/WalletsService/Wallets/{walletId}/Locations` |
| Update location | PUT | `/api/v2/WalletsService/Wallets/{walletId}/Locations/{locationId}` |
| Delete location | DELETE | `/api/v2/WalletsService/Wallets/{walletId}/Locations/{locationId}` |
| List orders | GET | `/api/v2/WalletsService/Wallets/{walletId}/Orders` |
| Count orders | GET | `/api/v2/WalletsService/Wallets/{walletId}/Orders/Count` |
| Extended orders | GET | `/api/v2/WalletsService/Wallets/{walletId}/Orders/Extended` |
| List invoices | GET | `/api/v2/WalletsService/Wallets/{walletId}/Invoices` |
| Count invoices | GET | `/api/v2/WalletsService/Wallets/{walletId}/Invoices/Count` |
| Incoming invoices | GET | `/api/v2/WalletsService/Wallets/{walletId}/Invoices/Incoming` |
| Count incoming invoices | GET | `/api/v2/WalletsService/Wallets/{walletId}/Invoices/Incoming/Count` |
| Outgoing invoices | GET | `/api/v2/WalletsService/Wallets/{walletId}/Invoices/Outgoing` |
| Count outgoing invoices | GET | `/api/v2/WalletsService/Wallets/{walletId}/Invoices/Outgoing/Count` |
| List quotes | GET | `/api/v2/WalletsService/Wallets/{walletId}/Quotes` |
| Count quotes | GET | `/api/v2/WalletsService/Wallets/{walletId}/Quotes/Count` |
| List refunds | GET | `/api/v2/WalletsService/Wallets/{walletId}/Refunds` |
| Count refunds | GET | `/api/v2/WalletsService/Wallets/{walletId}/Refunds/Count` |
| List chargebacks | GET | `/api/v2/WalletsService/Wallets/{walletId}/Chargebacks` |
| Count chargebacks | GET | `/api/v2/WalletsService/Wallets/{walletId}/Chargebacks/Count` |

## Critical Rules

- **Authenticate first** — every call carries `Authorization: Bearer $ABSUITE_ACCESS_TOKEN`.
- **Scope by `walletId` only** — no `?tenantId=` and no `X-TenantId` header on any wallet
  endpoint; ownership is resolved from the wallet itself (cross-identity: user / tenant /
  contact).
- **WalletId is required** for every operation — obtain it from the owning identity before
  calling here.
- **Invoices and payments split by direction** — `Incoming` = received, `Outgoing` = sent.
- **PATCH exists only on BankAccounts and Tokens** — Locations use PUT; Payments and the
  read-only views have no PATCH.
- **Creating a withdraw is `POST .../Withdraws`** — `WithdrawRequests` is read-only.
