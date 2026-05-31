---
name: absuite-wallets
description: >
  Manage wallets, wallet orders, invoices (incoming/outgoing), payments
  (incoming/outgoing), and wallet locations in the Alliance Business Suite (ABS)
  using the `absuite` CLI. Requires an authenticated CLI session.
---

# Alliance Business Suite — Wallets Skill

Manage wallets through the `absuite` CLI's `wallets` service. All operations are tenant-scoped.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite wallets list-commands`

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

## Wallet Details

```bash
# Get wallet details
absuite wallets get details --TenantId $TENANT_ID --WalletId <wallet-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Orders

```bash
# List orders in wallet
absuite wallets list orders --TenantId $TENANT_ID --WalletId <wallet-guid>

# List extended orders (with related data)
absuite wallets list extended-orders --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count orders
absuite wallets count orders --TenantId $TENANT_ID --WalletId <wallet-guid>
```

**REST API equivalent:**
```bash
# List orders
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Orders" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List extended orders
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Orders/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count orders
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Orders/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## All Invoices

```bash
# List all invoices (incoming + outgoing)
absuite wallets list invoices --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count all invoices
absuite wallets count invoices --TenantId $TENANT_ID --WalletId <wallet-guid>
```

**REST API equivalent:**
```bash
# List all invoices
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Invoices" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count all invoices
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Invoices/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Invoices

### Incoming Invoices (received)

```bash
# List
absuite wallets list incoming-invoices --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count
absuite wallets count incoming-invoices --TenantId $TENANT_ID --WalletId <wallet-guid>
```

**REST API equivalent:**
```bash
# List incoming invoices
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Invoices/Incoming" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count incoming invoices
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Invoices/Incoming/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Outgoing Invoices (sent)

```bash
# List
absuite wallets list outgoing-invoices --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count
absuite wallets count outgoing-invoices --TenantId $TENANT_ID --WalletId <wallet-guid>
```

**REST API equivalent:**
```bash
# List outgoing invoices
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Invoices/Outgoing" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count outgoing invoices
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Invoices/Outgoing/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Payments

### Incoming Payments (received)

```bash
# List
absuite wallets list incoming-payments --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count
absuite wallets count incoming-payments --TenantId $TENANT_ID --WalletId <wallet-guid>
```

**REST API equivalent:**
```bash
# List incoming payments
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments/Incoming" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count incoming payments
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments/Incoming/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Outgoing Payments (sent)

```bash
# List
absuite wallets list outgoing-payments --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count
absuite wallets count outgoing-payments --TenantId $TENANT_ID --WalletId <wallet-guid>
```

**REST API equivalent:**
```bash
# List outgoing payments
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments/Outgoing" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count outgoing payments
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments/Outgoing/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## All Payments

```bash
# List all payments
absuite wallets list payments --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count all payments
absuite wallets count payments --TenantId $TENANT_ID --WalletId <wallet-guid>
```

**REST API equivalent:**
```bash
# List all payments
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count all payments
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create payment
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Payments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "<invoice-guid>",
    "emisorWalletId": "<emisor-wallet-guid>",
    "receiverWalletId": "<receiver-wallet-guid>",
    "currencyId": "<currency-guid>",
    "totalCost": 1500.00,
    "paymentType": "CreditCard",
    "paymentStatus": "Pending"
  }'
```

## Wallet Locations

```bash
# List
absuite wallets list locations --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count
absuite wallets count locations --TenantId $TENANT_ID --WalletId <wallet-guid>

# Get by ID
absuite wallets get location --TenantId $TENANT_ID --WalletLocationId <location-guid>

# Create
absuite wallets create location --TenantId $TENANT_ID --WalletLocationCreateDto '{
  "WalletId": "<wallet-guid>",
  "Name": "Main Office",
  "Address": "123 Business Ave"
}'

# Update
absuite wallets update location --TenantId $TENANT_ID --WalletLocationId <location-guid> --WalletLocationUpdateDto '{...}'

# Delete
absuite wallets delete location --TenantId $TENANT_ID --WalletLocationId <location-guid>
```

**REST API equivalent:**
```bash
# List locations
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Locations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count locations
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Locations/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get location by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Locations/$LOCATION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create location
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Locations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Main Office",
    "email": "office@company.com",
    "address1": "123 Business Ave",
    "countryId": "<country-guid>",
    "stateId": "<state-guid>",
    "cityId": "<city-guid>",
    "postalCode": "10001"
  }'

# Update location
curl -X PUT "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Locations/$LOCATION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Office Name"
  }'

# Delete location
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Locations/$LOCATION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Bank Accounts

```bash
# List bank accounts
absuite wallets list bank-accounts --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count bank accounts
absuite wallets count bank-accounts --TenantId $TENANT_ID --WalletId <wallet-guid>

# Get bank account by ID
absuite wallets get bank-account --TenantId $TENANT_ID --WalletId <wallet-guid> --BankAccountId <bank-account-guid>

# Create bank account
absuite wallets create bank-account --TenantId $TENANT_ID --WalletId <wallet-guid> --BankAccountCreateDto '{
  "name": "Primary Business Account",
  "iban": "US00BANK0123456789",
  "swift": "BANKUS33",
  "bankAccountNumber": "0123456789",
  "bankId": "<bank-guid>"
}'

# Update bank account
absuite wallets update bank-account --TenantId $TENANT_ID --WalletId <wallet-guid> --BankAccountId <bank-account-guid> --BankAccountUpdateDto '{
  "name": "Updated Account Name"
}'

# Delete bank account
absuite wallets delete bank-account --TenantId $TENANT_ID --WalletId <wallet-guid> --BankAccountId <bank-account-guid>
```

**REST API equivalent:**
```bash
# List bank accounts
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count bank accounts
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get bank account by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/$BANK_ACCOUNT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create bank account
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Primary Business Account",
    "iban": "US00BANK0123456789",
    "swift": "BANKUS33",
    "bankAccountNumber": "0123456789",
    "bankId": "<bank-guid>"
  }'

# Update bank account
curl -X PUT "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/$BANK_ACCOUNT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Account Name"
  }'

# Delete bank account
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/BankAccounts/$BANK_ACCOUNT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Chargebacks

```bash
# List chargebacks
absuite wallets list chargebacks --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count chargebacks
absuite wallets count chargebacks --TenantId $TENANT_ID --WalletId <wallet-guid>
```

**REST API equivalent:**
```bash
# List chargebacks
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Chargebacks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count chargebacks
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Chargebacks/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Quotes

```bash
# List quotes
absuite wallets list quotes --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count quotes
absuite wallets count quotes --TenantId $TENANT_ID --WalletId <wallet-guid>
```

**REST API equivalent:**
```bash
# List quotes
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Quotes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count quotes
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Quotes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Refunds

```bash
# List refunds
absuite wallets list refunds --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count refunds
absuite wallets count refunds --TenantId $TENANT_ID --WalletId <wallet-guid>
```

**REST API equivalent:**
```bash
# List refunds
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Refunds" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count refunds
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Refunds/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Payment Tokens

```bash
# List tokens
absuite wallets list tokens --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count tokens
absuite wallets count tokens --TenantId $TENANT_ID --WalletId <wallet-guid>

# Get token by ID
absuite wallets get token --TenantId $TENANT_ID --WalletId <wallet-guid> --TokenId <token-guid>

# Create token
absuite wallets create token --TenantId $TENANT_ID --WalletId <wallet-guid> --TokenCreateDto '{
  "mask": "****1234",
  "tokenType": "CreditCard",
  "cardFranchise": "Visa",
  "cardExpirationMonth": "12",
  "cardExpirationYear": "2028",
  "paymentGatewayId": "<gateway-guid>"
}'

# Update token
absuite wallets update token --TenantId $TENANT_ID --WalletId <wallet-guid> --TokenId <token-guid> --TokenUpdateDto '{
  "cardExpirationMonth": "06",
  "cardExpirationYear": "2029"
}'

# Delete token
absuite wallets delete token --TenantId $TENANT_ID --WalletId <wallet-guid> --TokenId <token-guid>
```

**REST API equivalent:**
```bash
# List tokens
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count tokens
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get token by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens/$TOKEN_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create token
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mask": "****1234",
    "tokenType": "CreditCard",
    "cardFranchise": "Visa",
    "cardExpirationMonth": "12",
    "cardExpirationYear": "2028",
    "paymentGatewayId": "<gateway-guid>"
  }'

# Update token
curl -X PUT "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens/$TOKEN_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cardExpirationMonth": "06",
    "cardExpirationYear": "2029"
  }'

# Delete token
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Tokens/$TOKEN_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Withdraw Requests

```bash
# List withdraw requests
absuite wallets list withdraw-requests --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count withdraw requests
absuite wallets count withdraw-requests --TenantId $TENANT_ID --WalletId <wallet-guid>
```

**REST API equivalent:**
```bash
# List withdraw requests
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/WithdrawRequests" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count withdraw requests
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/WithdrawRequests/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Withdraws

```bash
# List withdraws
absuite wallets list withdraws --TenantId $TENANT_ID --WalletId <wallet-guid>

# Count withdraws
absuite wallets count withdraws --TenantId $TENANT_ID --WalletId <wallet-guid>

# Create withdraw
absuite wallets create withdraw --TenantId $TENANT_ID --WalletId <wallet-guid> --WithdrawCreateDto '{
  "requestedWithdrawAmount": 5000.00,
  "currencyId": "<currency-guid>",
  "bankAccountId": "<bank-account-guid>"
}'
```

**REST API equivalent:**
```bash
# List withdraws
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Withdraws" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count withdraws
curl -X GET "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Withdraws/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create withdraw
curl -X POST "$ABSUITE_HOST_URL/api/v2/WalletsService/Wallets/$WALLET_ID/Withdraws" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requestedWithdrawAmount": 5000.00,
    "currencyId": "<currency-guid>",
    "bankAccountId": "<bank-account-guid>"
  }'
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| Wallet details | `absuite wallets get details --TenantId <guid> --WalletId <guid>` |
| List orders | `absuite wallets list orders --TenantId <guid> --WalletId <guid>` |
| List all invoices | `absuite wallets list invoices --TenantId <guid> --WalletId <guid>` |
| Incoming invoices | `absuite wallets list incoming-invoices --TenantId <guid> --WalletId <guid>` |
| Outgoing invoices | `absuite wallets list outgoing-invoices --TenantId <guid> --WalletId <guid>` |
| List all payments | `absuite wallets list payments --TenantId <guid> --WalletId <guid>` |
| Incoming payments | `absuite wallets list incoming-payments --TenantId <guid> --WalletId <guid>` |
| Outgoing payments | `absuite wallets list outgoing-payments --TenantId <guid> --WalletId <guid>` |
| List locations | `absuite wallets list locations --TenantId <guid> --WalletId <guid>` |
| Create location | `absuite wallets create location --TenantId <guid> --WalletLocationCreateDto '{...}'` |
| List bank accounts | `absuite wallets list bank-accounts --TenantId <guid> --WalletId <guid>` |
| Create bank account | `absuite wallets create bank-account --TenantId <guid> --WalletId <guid> --BankAccountCreateDto '{...}'` |
| List chargebacks | `absuite wallets list chargebacks --TenantId <guid> --WalletId <guid>` |
| List quotes | `absuite wallets list quotes --TenantId <guid> --WalletId <guid>` |
| List refunds | `absuite wallets list refunds --TenantId <guid> --WalletId <guid>` |
| List tokens | `absuite wallets list tokens --TenantId <guid> --WalletId <guid>` |
| Create token | `absuite wallets create token --TenantId <guid> --WalletId <guid> --TokenCreateDto '{...}'` |
| List withdraw requests | `absuite wallets list withdraw-requests --TenantId <guid> --WalletId <guid>` |
| List withdraws | `absuite wallets list withdraws --TenantId <guid> --WalletId <guid>` |
| Create withdraw | `absuite wallets create withdraw --TenantId <guid> --WalletId <guid> --WithdrawCreateDto '{...}'` |

## API Endpoints Quick Reference

| Action | REST Endpoint |
|---|---|
| Get wallet details | `GET /api/v2/WalletsService/Wallets/:walletId` |
| List orders | `GET /api/v2/WalletsService/Wallets/:walletId/Orders` |
| Count orders | `GET /api/v2/WalletsService/Wallets/:walletId/Orders/Count` |
| Extended orders | `GET /api/v2/WalletsService/Wallets/:walletId/Orders/Extended` |
| List all invoices | `GET /api/v2/WalletsService/Wallets/:walletId/Invoices` |
| Count all invoices | `GET /api/v2/WalletsService/Wallets/:walletId/Invoices/Count` |
| Incoming invoices | `GET /api/v2/WalletsService/Wallets/:walletId/Invoices/Incoming` |
| Count incoming invoices | `GET /api/v2/WalletsService/Wallets/:walletId/Invoices/Incoming/Count` |
| Outgoing invoices | `GET /api/v2/WalletsService/Wallets/:walletId/Invoices/Outgoing` |
| Count outgoing invoices | `GET /api/v2/WalletsService/Wallets/:walletId/Invoices/Outgoing/Count` |
| Create payment | `POST /api/v2/WalletsService/Wallets/:walletId/Payments` |
| List all payments | `GET /api/v2/WalletsService/Wallets/:walletId/Payments` |
| Count all payments | `GET /api/v2/WalletsService/Wallets/:walletId/Payments/Count` |
| Incoming payments | `GET /api/v2/WalletsService/Wallets/:walletId/Payments/Incoming` |
| Count incoming payments | `GET /api/v2/WalletsService/Wallets/:walletId/Payments/Incoming/Count` |
| Outgoing payments | `GET /api/v2/WalletsService/Wallets/:walletId/Payments/Outgoing` |
| Count outgoing payments | `GET /api/v2/WalletsService/Wallets/:walletId/Payments/Outgoing/Count` |
| Create bank account | `POST /api/v2/WalletsService/Wallets/:walletId/BankAccounts` |
| List bank accounts | `GET /api/v2/WalletsService/Wallets/:walletId/BankAccounts` |
| Get bank account | `GET /api/v2/WalletsService/Wallets/:walletId/BankAccounts/:bankAccountId` |
| Update bank account | `PUT /api/v2/WalletsService/Wallets/:walletId/BankAccounts/:bankAccountId` |
| Delete bank account | `DELETE /api/v2/WalletsService/Wallets/:walletId/BankAccounts/:bankAccountId` |
| Count bank accounts | `GET /api/v2/WalletsService/Wallets/:walletId/BankAccounts/Count` |
| List chargebacks | `GET /api/v2/WalletsService/Wallets/:walletId/Chargebacks` |
| Count chargebacks | `GET /api/v2/WalletsService/Wallets/:walletId/Chargebacks/Count` |
| Create location | `POST /api/v2/WalletsService/Wallets/:walletId/Locations` |
| List locations | `GET /api/v2/WalletsService/Wallets/:walletId/Locations` |
| Get location | `GET /api/v2/WalletsService/Wallets/:walletId/Locations/:locationId` |
| Update location | `PUT /api/v2/WalletsService/Wallets/:walletId/Locations/:locationId` |
| Delete location | `DELETE /api/v2/WalletsService/Wallets/:walletId/Locations/:locationId` |
| Count locations | `GET /api/v2/WalletsService/Wallets/:walletId/Locations/Count` |
| List quotes | `GET /api/v2/WalletsService/Wallets/:walletId/Quotes` |
| Count quotes | `GET /api/v2/WalletsService/Wallets/:walletId/Quotes/Count` |
| List refunds | `GET /api/v2/WalletsService/Wallets/:walletId/Refunds` |
| Count refunds | `GET /api/v2/WalletsService/Wallets/:walletId/Refunds/Count` |
| Create token | `POST /api/v2/WalletsService/Wallets/:walletId/Tokens` |
| List tokens | `GET /api/v2/WalletsService/Wallets/:walletId/Tokens` |
| Get token | `GET /api/v2/WalletsService/Wallets/:walletId/Tokens/:tokenId` |
| Update token | `PUT /api/v2/WalletsService/Wallets/:walletId/Tokens/:tokenId` |
| Delete token | `DELETE /api/v2/WalletsService/Wallets/:walletId/Tokens/:tokenId` |
| Count tokens | `GET /api/v2/WalletsService/Wallets/:walletId/Tokens/Count` |
| List withdraw requests | `GET /api/v2/WalletsService/Wallets/:walletId/WithdrawRequests` |
| Count withdraw requests | `GET /api/v2/WalletsService/Wallets/:walletId/WithdrawRequests/Count` |
| Create withdraw | `POST /api/v2/WalletsService/Wallets/:walletId/Withdraws` |
| List withdraws | `GET /api/v2/WalletsService/Wallets/:walletId/Withdraws` |
| Count withdraws | `GET /api/v2/WalletsService/Wallets/:walletId/Withdraws/Count` |

## Critical Rules

- **Authenticate first.** Always provide a tenant context.
- **WalletId is required** for most queries — get it from `absuite tenants get wallet` or `absuite users get wallet`.
- **Invoices and payments are split by direction** — use `incoming-*` for received, `outgoing-*` for sent.
