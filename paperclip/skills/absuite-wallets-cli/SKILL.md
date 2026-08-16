---
name: absuite-wallets-cli
description: >
  Manage wallets and their sub-resources — bank accounts, payment tokens, payments,
  withdraws, locations — plus read access to orders, invoices, quotes, refunds and
  chargebacks, using the `absuite` CLI. Covers list / count / get / create / update /
  delete. Wallets are scoped by walletId (ownership-keyed), not by tenant. Requires an
  authenticated CLI session (see absuite-login-cli). For atomic PATCH updates or raw HTTP,
  use the absuite-wallets (REST) skill.
---

# Alliance Business Suite — Wallets (CLI)

Drive the ABS **WalletsService** through the `absuite` CLI's `wallets` service. A wallet is
a financial container aggregating bank accounts, payment tokens, payments, withdraws,
locations, and read-only ledger views (orders, invoices, quotes, refunds, chargebacks).
Every command targets one wallet by `--WalletId`.

> **Scoping (read this first).** WalletsService is **cross-identity**: a wallet can be owned
> by a **user**, a **tenant**, or a **contact**. Commands are keyed by `--WalletId`, which
> already resolves ownership. **Do NOT pass `--TenantId`** — wallet commands take no tenant
> parameter, so it is ignored. Authorization comes from your logged-in session plus the
> wallet's ownership.

> For atomic partial updates (PATCH / JSON Patch) or raw HTTP, use the `absuite-wallets`
> (REST) skill — the CLI does not support patch operations. For general CLI conventions,
> see `absuite-cli`.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-wallets` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-wallets` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** — `absuite login` (see the `absuite-login-cli` skill).
2. **Discover commands** — `absuite wallets list-commands`, then `--help` on any command
   (e.g. `absuite wallets create bank-account --help`) to see its parameters.
3. **No tenant setup needed** for wallet commands — they are scoped by `--WalletId`, not by
   tenant. (`absuite config set --tenant-id <guid>` affects other services, not these.)

## Command Structure

```
absuite wallets <verb> <entity> --WalletId <wallet-guid> [--<Param> value ...]
```

- **Service name:** `wallets`.
- **Verbs:** `get`, `list`, `count`, `create`, `update`, `delete` (no `patch` — REST only).
- The canonical function-name form also works, mirroring the PowerShell SDK:
  - create → `New-Wallet<Entity>Async`
  - read   → `Get-Wallet<Entity>Async`
  - update → `Update-Wallet<Entity>Async`
  - delete → `Invoke-DeleteWallet<Entity>Async`
- **JSON DTO params** are passed as a single-quoted JSON string with the **same field
  names** as the REST API (camelCase), e.g. `--BankAccountCreateDto '{ "name": "..." }'`.
- `--WalletId` is **required** on every command. `--ApiVersion` / `--XApiVersion` are
  optional version pins; omit them normally.

## Wallet Details

```bash
# Get wallet details
absuite wallets get details --WalletId <wallet-guid>
```

## Bank Accounts

```bash
# List bank accounts
absuite wallets list bank-accounts --WalletId <wallet-guid>

# Count bank accounts
absuite wallets count bank-accounts --WalletId <wallet-guid>

# Get one bank account
absuite wallets get bank-account --WalletId <wallet-guid> --BankAccountId <bank-account-guid>

# Create a bank account
absuite wallets create bank-account --WalletId <wallet-guid> --BankAccountCreateDto '{
  "name": "Primary Business Account",
  "iban": "<iban>",
  "swift": "<swift>",
  "branchCode": "<branch-code>",
  "bankAccountNumber": "<account-number>",
  "bankId": "<bank-guid>",
  "bankProfileId": "<bank-profile-guid>",
  "walletId": "<wallet-guid>"
}'

# Update a bank account (full DTO)
absuite wallets update bank-account --WalletId <wallet-guid> --BankAccountId <bank-account-guid> --BankAccountUpdateDto '{
  "name": "Updated Account Name",
  "iban": "<iban>",
  "swift": "<swift>",
  "branchCode": "<branch-code>",
  "bankAccountNumber": "<account-number>",
  "bankId": "<bank-guid>",
  "bankProfileId": "<bank-profile-guid>",
  "walletId": "<wallet-guid>"
}'

# Delete a bank account
absuite wallets delete bank-account --WalletId <wallet-guid> --BankAccountId <bank-account-guid>
```

**BankAccountCreateDto fields:** `id`, `timestamp`, `name`, `iban`, `swift`, `branchCode`,
`bankAccountNumber`, `bankId`, `bankProfileId`, `walletId`.
**BankAccountUpdateDto fields:** `name`, `iban`, `swift`, `branchCode`, `bankAccountNumber`,
`bankId`, `bankProfileId`, `walletId`.

## Payment Tokens

```bash
# List tokens
absuite wallets list tokens --WalletId <wallet-guid>

# Count tokens
absuite wallets count tokens --WalletId <wallet-guid>

# Get one token
absuite wallets get token --WalletId <wallet-guid> --TokenId <token-guid>

# Create a token (mask, cardExpirationMonth, cardExpirationYear are REQUIRED)
absuite wallets create token --WalletId <wallet-guid> --PaymentTokenCreateDto '{
  "mask": "************1234",
  "tokenType": "<token-type>",
  "cardFranchise": "<franchise>",
  "cardExpirationMonth": "12",
  "cardExpirationYear": "2030",
  "validUntil": "2030-12-31T00:00:00Z",
  "paymentGatewayId": "<gateway-guid>"
}'

# Update a token
absuite wallets update token --WalletId <wallet-guid> --TokenId <token-guid> --PaymentTokenUpdateDto '{
  "cardExpirationMonth": "06",
  "cardExpirationYear": "2031",
  "status": "<status>"
}'

# Delete a token
absuite wallets delete token --WalletId <wallet-guid> --TokenId <token-guid>
```

**PaymentTokenCreateDto fields:** `id`, `timestamp`, `mask` **(REQ)**, `tokenType`,
`cardFranchise`, `cardExpirationMonth` **(REQ)**, `cardExpirationYear` **(REQ)**,
`validUntil`, `paymentGatewayId`.
**PaymentTokenUpdateDto fields:** `mask`, `tokenType`, `cardFranchise`,
`cardExpirationMonth`, `cardExpirationYear`, `status`, `validUntil`, `paymentGatewayId`.

## Payments

Payments support list, count, create, and direction-split reads. There is no get/update/
delete for an individual payment.

```bash
# List all payments
absuite wallets list payments --WalletId <wallet-guid>

# Count all payments
absuite wallets count payments --WalletId <wallet-guid>

# Incoming payments (received) + count
absuite wallets list incoming-payments --WalletId <wallet-guid>
absuite wallets count incoming-payments --WalletId <wallet-guid>

# Outgoing payments (sent) + count
absuite wallets list outgoing-payments --WalletId <wallet-guid>
absuite wallets count outgoing-payments --WalletId <wallet-guid>

# Create a payment
absuite wallets create payment --WalletId <wallet-guid> --PaymentCreateDto '{
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

**Payment enums** (exact casings from the spec):
- `onBehalfOf`: `Self` | `Tenant` | `Individual` | `Organization`
- `paymentType`: `Paid` | `Received` | `Internal`
- `paymentStatus`: `Unset` | `Accepted` | `Rejected` | `OnHold` | `Failed` | `Reversed` | `Retained` | `Initialized` | `Expired` | `Abandoned` | `Cancelled` | `AcceptedRetained`

`PaymentCreateDto` has many optional fields; the most common are shown above. Other fields
include `closed`, `data`, `dataLabel`, `data1`, `data1Label`, `response`, `authorization`,
`referenceCode`, `correlationCode`, `baseCost`, `isExternal`, `billingAddress`, `phone`,
`cellphone`, `city`, `countryId`, `locationId`, `bankId`, `accountingEntryId`,
`emisorWalletAccountId`, `receiverWalletAccountId`, and more (see the REST skill for the
full list).

## Withdraws & Withdraw Requests

```bash
# List withdraws + count
absuite wallets list withdraws --WalletId <wallet-guid>
absuite wallets count withdraws --WalletId <wallet-guid>

# Create a withdraw request (verb is create withdraw -> POSTs to Withdraws)
absuite wallets create withdraw --WalletId <wallet-guid> --WalletWithdrawRequestCreateDto '{
  "requestedWithdrawAmount": 5000.00,
  "currencyId": "<currency-guid>",
  "bankAccountId": "<bank-account-guid>"
}'

# List withdraw requests + count (read-only)
absuite wallets list withdraw-requests --WalletId <wallet-guid>
absuite wallets count withdraw-requests --WalletId <wallet-guid>
```

**WalletWithdrawRequestCreateDto fields:** `id`, `timestamp`, `requestedWithdrawAmount`,
`currencyId`, `bankAccountId`.
Note: `create withdraw` is the only write here; `withdraw-requests` is list/count only.

## Locations

```bash
# List locations + count
absuite wallets list locations --WalletId <wallet-guid>
absuite wallets count locations --WalletId <wallet-guid>

# Get one location
absuite wallets get location --WalletId <wallet-guid> --LocationId <location-guid>

# Create a location
absuite wallets create location --WalletId <wallet-guid> --LocationCreateDto '{
  "title": "Main Office",
  "email": "<email>",
  "phone": "<phone>",
  "address1": "<address-line-1>",
  "cityId": "<city-guid>",
  "stateId": "<state-guid>",
  "countryId": "<country-guid>",
  "postalCode": "<postal-code>",
  "isRoutable": true,
  "isDefaultSenderAddress": false
}'

# Update a location (full DTO)
absuite wallets update location --WalletId <wallet-guid> --LocationId <location-guid> --LocationUpdateDto '{
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
absuite wallets delete location --WalletId <wallet-guid> --LocationId <location-guid>
```

**LocationCreateDto fields:** `id`, `timestamp`, `title`, `email`, `phone`, `fax`,
`address1`, `address2`, `address3`, `unit`, `cityId`, `stateId`, `postalCode`, `countryId`,
`longitude`, `latitude`, `isRoutable`, `isGlobalPrimary`, `isCountryPrimary`,
`canGenerateLabels`, `isDefaultSenderAddress`, `isDefaultReturnAddress`,
`isDefaultSuppingLocation`.
**LocationUpdateDto fields:** same as create **minus** `id` and `timestamp`.

## Read-Only Ledger Views

All list/count only.

```bash
# Orders
absuite wallets list orders --WalletId <wallet-guid>
absuite wallets count orders --WalletId <wallet-guid>
absuite wallets list extended-orders --WalletId <wallet-guid>

# Invoices (all + Incoming / Outgoing)
absuite wallets list invoices --WalletId <wallet-guid>
absuite wallets count invoices --WalletId <wallet-guid>
absuite wallets list incoming-invoices --WalletId <wallet-guid>
absuite wallets count incoming-invoices --WalletId <wallet-guid>
absuite wallets list outgoing-invoices --WalletId <wallet-guid>
absuite wallets count outgoing-invoices --WalletId <wallet-guid>

# Quotes
absuite wallets list quotes --WalletId <wallet-guid>
absuite wallets count quotes --WalletId <wallet-guid>

# Refunds
absuite wallets list refunds --WalletId <wallet-guid>
absuite wallets count refunds --WalletId <wallet-guid>

# Chargebacks
absuite wallets list chargebacks --WalletId <wallet-guid>
absuite wallets count chargebacks --WalletId <wallet-guid>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| Get wallet details | `absuite wallets get details --WalletId <guid>` |
| List bank accounts | `absuite wallets list bank-accounts --WalletId <guid>` |
| Count bank accounts | `absuite wallets count bank-accounts --WalletId <guid>` |
| Get bank account | `absuite wallets get bank-account --WalletId <guid> --BankAccountId <guid>` |
| Create bank account | `absuite wallets create bank-account --WalletId <guid> --BankAccountCreateDto '{...}'` |
| Update bank account | `absuite wallets update bank-account --WalletId <guid> --BankAccountId <guid> --BankAccountUpdateDto '{...}'` |
| Delete bank account | `absuite wallets delete bank-account --WalletId <guid> --BankAccountId <guid>` |
| List tokens | `absuite wallets list tokens --WalletId <guid>` |
| Count tokens | `absuite wallets count tokens --WalletId <guid>` |
| Get token | `absuite wallets get token --WalletId <guid> --TokenId <guid>` |
| Create token | `absuite wallets create token --WalletId <guid> --PaymentTokenCreateDto '{...}'` |
| Update token | `absuite wallets update token --WalletId <guid> --TokenId <guid> --PaymentTokenUpdateDto '{...}'` |
| Delete token | `absuite wallets delete token --WalletId <guid> --TokenId <guid>` |
| List payments | `absuite wallets list payments --WalletId <guid>` |
| Count payments | `absuite wallets count payments --WalletId <guid>` |
| Create payment | `absuite wallets create payment --WalletId <guid> --PaymentCreateDto '{...}'` |
| Incoming payments | `absuite wallets list incoming-payments --WalletId <guid>` |
| Count incoming payments | `absuite wallets count incoming-payments --WalletId <guid>` |
| Outgoing payments | `absuite wallets list outgoing-payments --WalletId <guid>` |
| Count outgoing payments | `absuite wallets count outgoing-payments --WalletId <guid>` |
| List withdraws | `absuite wallets list withdraws --WalletId <guid>` |
| Count withdraws | `absuite wallets count withdraws --WalletId <guid>` |
| Create withdraw | `absuite wallets create withdraw --WalletId <guid> --WalletWithdrawRequestCreateDto '{...}'` |
| List withdraw requests | `absuite wallets list withdraw-requests --WalletId <guid>` |
| Count withdraw requests | `absuite wallets count withdraw-requests --WalletId <guid>` |
| List locations | `absuite wallets list locations --WalletId <guid>` |
| Count locations | `absuite wallets count locations --WalletId <guid>` |
| Get location | `absuite wallets get location --WalletId <guid> --LocationId <guid>` |
| Create location | `absuite wallets create location --WalletId <guid> --LocationCreateDto '{...}'` |
| Update location | `absuite wallets update location --WalletId <guid> --LocationId <guid> --LocationUpdateDto '{...}'` |
| Delete location | `absuite wallets delete location --WalletId <guid> --LocationId <guid>` |
| List orders | `absuite wallets list orders --WalletId <guid>` |
| Count orders | `absuite wallets count orders --WalletId <guid>` |
| Extended orders | `absuite wallets list extended-orders --WalletId <guid>` |
| List invoices | `absuite wallets list invoices --WalletId <guid>` |
| Count invoices | `absuite wallets count invoices --WalletId <guid>` |
| Incoming invoices | `absuite wallets list incoming-invoices --WalletId <guid>` |
| Count incoming invoices | `absuite wallets count incoming-invoices --WalletId <guid>` |
| Outgoing invoices | `absuite wallets list outgoing-invoices --WalletId <guid>` |
| Count outgoing invoices | `absuite wallets count outgoing-invoices --WalletId <guid>` |
| List quotes | `absuite wallets list quotes --WalletId <guid>` |
| Count quotes | `absuite wallets count quotes --WalletId <guid>` |
| List refunds | `absuite wallets list refunds --WalletId <guid>` |
| Count refunds | `absuite wallets count refunds --WalletId <guid>` |
| List chargebacks | `absuite wallets list chargebacks --WalletId <guid>` |
| Count chargebacks | `absuite wallets count chargebacks --WalletId <guid>` |

## Critical Rules

- **Authenticate first** — `absuite login` before any wallet command.
- **Scope by `--WalletId` only** — no `--TenantId` on wallet commands (cross-identity:
  user / tenant / contact ownership is resolved from the wallet itself).
- **WalletId is required** on every command.
- **Invoices and payments split by direction** — use `incoming-*` for received,
  `outgoing-*` for sent.
- **No PATCH in the CLI** — for atomic partial updates use PUT-style `update` (full DTO) or
  the `absuite-wallets` REST skill's PATCH (JSON Patch on BankAccounts and Tokens).
- **Creating a withdraw is `create withdraw`** — `withdraw-requests` is list/count only.
