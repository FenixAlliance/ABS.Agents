---
name: absuite-payments
description: >
  Manage payments, payment methods, payment modes, and payment terms in the Alliance
  Business Suite (ABS) using the `absuite` CLI or REST API. Covers payment CRUD and
  configuration of payment infrastructure. Requires an authenticated CLI session or
  a valid bearer token for REST calls.
---

# Alliance Business Suite — Payments Skill

Manage payments through the `absuite` CLI's `payments` service or via the REST API. All operations are tenant-scoped.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite payments list-commands`

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

## Payments

### List Payments

```bash
absuite payments list --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Payment by ID

```bash
absuite payments get async-v2 --TenantId $TENANT_ID --PaymentId <payment-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Create Payment

```bash
absuite payments create --TenantId $TENANT_ID --PaymentCreateDto '{
  "InvoiceId": "<invoice-guid>",
  "TotalCost": 1500.00,
  "TotalTaxes": 120.00,
  "CurrencyId": "<currency-guid>",
  "EmisorWalletId": "<sender-wallet-guid>",
  "ReceiverWalletId": "<receiver-wallet-guid>",
  "PaymentType": "CreditCard",
  "PaymentStatus": "Completed",
  "ReferenceCode": "PAY-2026-001",
  "CountryId": "USA",
  "BankId": "<bank-guid>",
  "BankAccountId": "<bank-account-guid>"
}'
```

**Key PaymentCreateDto fields:**

| Field | Type | Description |
|---|---|---|
| `InvoiceId` | String | Linked invoice |
| `OrderId` | String | Linked order |
| `TotalCost` | Double | Payment amount |
| `TotalTaxes` | Double | Tax amount |
| `CurrencyId` | String | Currency |
| `ForexRate` | Double | Exchange rate at time of payment |
| `EmisorWalletId` | String | Sender wallet |
| `ReceiverWalletId` | String | Receiver wallet |
| `PaymentType` | String | Type (e.g., CreditCard, BankTransfer, Cash) |
| `PaymentStatus` | String | Status (e.g., Pending, Completed, Failed) |
| `ReferenceCode` | String | External reference |
| `Authorization` | String | Auth code from gateway |
| `PaymentGatewayId` | String | Gateway used |
| `BankId` / `BankAccountId` | String | Bank details |
| `Closed` | Boolean | Whether payment is finalized |
| `IsExternal` | Boolean | External payment flag |

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "InvoiceId": "<invoice-guid>",
    "TotalCost": 1500.00,
    "TotalTaxes": 120.00,
    "CurrencyId": "<currency-guid>",
    "EmisorWalletId": "<sender-wallet-guid>",
    "ReceiverWalletId": "<receiver-wallet-guid>",
    "PaymentType": "CreditCard",
    "PaymentStatus": "Completed",
    "ReferenceCode": "PAY-2026-001",
    "CountryId": "USA",
    "BankId": "<bank-guid>",
    "BankAccountId": "<bank-account-guid>"
  }'
```

### Update Payment

```bash
absuite payments update --TenantId $TENANT_ID --PaymentId <payment-guid> --PaymentUpdateDto '{
  "PaymentStatus": "Completed",
  "Closed": true
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "PaymentStatus": "Completed",
    "Closed": true
  }'
```

### Delete Payment

```bash
absuite payments delete --TenantId $TENANT_ID --PaymentId <payment-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Payments

```bash
absuite payments count --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Patch Payment

Partially update a payment without sending the full resource body.

**REST API:**
```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "PaymentStatus": "Failed"
  }'
```

### Get Payment Details (Deprecated)

> **⚠️ Deprecated.** Use the standard **Get Payment by ID** endpoint instead.

**REST API:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/Payments/<payment-guid>/Details" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Payment Methods

Configuration for accepted payment methods (e.g., Visa, MasterCard, PayPal).

```bash
# List
absuite payments list methods --TenantId $TENANT_ID

# Count
absuite payments count methods --TenantId $TENANT_ID

# Get by ID
absuite payments list method-details --TenantId $TENANT_ID --PaymentMethodId <method-guid>

# Create
absuite payments create method --TenantId $TENANT_ID --PaymentMethodCreateDto '{
  "Name": "Credit Card",
  "Description": "Visa/MasterCard payments"
}'

# Update
absuite payments update method --TenantId $TENANT_ID --PaymentMethodId <method-guid> --PaymentMethodUpdateDto '{...}'

# Delete
absuite payments delete method --TenantId $TENANT_ID --PaymentMethodId <method-guid>
```

**REST API equivalents:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods/<method-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "Credit Card", "Description": "Visa/MasterCard payments"}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods/<method-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentMethods/<method-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Payment Modes

Payment delivery mechanisms (e.g., Online, In-Person, Wire Transfer).

```bash
# List
absuite payments list modes --TenantId $TENANT_ID

# Count
absuite payments count modes --TenantId $TENANT_ID

# Get by ID
absuite payments list mode-details --TenantId $TENANT_ID --PaymentModeId <mode-guid>

# Create
absuite payments create mode --TenantId $TENANT_ID --PaymentModeCreateDto '{
  "Name": "Online Payment"
}'

# Update
absuite payments update mode --TenantId $TENANT_ID --PaymentModeId <mode-guid> --PaymentModeUpdateDto '{...}'

# Delete
absuite payments delete mode --TenantId $TENANT_ID --PaymentModeId <mode-guid>
```

**REST API equivalents:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes/<mode-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "Online Payment"}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes/<mode-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentModes/<mode-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Payment Terms

Contractual payment conditions (e.g., Net 30, Net 60, COD).

```bash
# List
absuite payments list terms --TenantId $TENANT_ID

# Count
absuite payments count terms --TenantId $TENANT_ID

# Get by ID
absuite payments list term-details --TenantId $TENANT_ID --PaymentTermId <term-guid>

# Create
absuite payments create term --TenantId $TENANT_ID --PaymentTermCreateDto '{
  "Name": "Net 30",
  "Description": "Payment due within 30 days"
}'

# Update
absuite payments update term --TenantId $TENANT_ID --PaymentTermId <term-guid> --PaymentTermUpdateDto '{...}'

# Delete
absuite payments delete term --TenantId $TENANT_ID --PaymentTermId <term-guid>
```

**REST API equivalents:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms/<term-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "Net 30", "Description": "Payment due within 30 days"}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms/<term-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/PaymentsService/PaymentTerms/<term-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command | REST Endpoint |
|---|---|---|
| List payments | `absuite payments list --TenantId <guid>` | `GET /api/v2/PaymentsService/Payments` |
| Get payment | `absuite payments get async-v2 --TenantId <guid> --PaymentId <guid>` | `GET /api/v2/PaymentsService/Payments/:paymentId` |
| Create payment | `absuite payments create --TenantId <guid> --PaymentCreateDto '{...}'` | `POST /api/v2/PaymentsService/Payments` |
| Update payment | `absuite payments update --TenantId <guid> --PaymentId <guid> --PaymentUpdateDto '{...}'` | `PUT /api/v2/PaymentsService/Payments/:paymentId` |
| Delete payment | `absuite payments delete --TenantId <guid> --PaymentId <guid>` | `DELETE /api/v2/PaymentsService/Payments/:paymentId` |
| Count payments | `absuite payments count --TenantId <guid>` | `GET /api/v2/PaymentsService/Payments/Count` |
| List methods | `absuite payments list methods --TenantId <guid>` | `GET /api/v2/PaymentsService/PaymentMethods` |
| List modes | `absuite payments list modes --TenantId <guid>` | `GET /api/v2/PaymentsService/PaymentModes` |
| List terms | `absuite payments list terms --TenantId <guid>` | `GET /api/v2/PaymentsService/PaymentTerms` |

## API Endpoints Quick Reference

All endpoints are relative to `$ABSUITE_HOST_URL`.

### Payments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v2/PaymentsService/Payments` | List payments |
| `POST` | `/api/v2/PaymentsService/Payments` | Create payment |
| `GET` | `/api/v2/PaymentsService/Payments/Count` | Count payments |
| `GET` | `/api/v2/PaymentsService/Payments/:paymentId` | Get payment by ID |
| `PUT` | `/api/v2/PaymentsService/Payments/:paymentId` | Update payment (full) |
| `PATCH` | `/api/v2/PaymentsService/Payments/:paymentId` | Patch payment (partial) |
| `DELETE` | `/api/v2/PaymentsService/Payments/:paymentId` | Delete payment |
| `GET` | `/api/v2/PaymentsService/Payments/:paymentId/Details` | Get payment details *(deprecated)* |

### Payment Methods

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v2/PaymentsService/PaymentMethods` | List payment methods |
| `POST` | `/api/v2/PaymentsService/PaymentMethods` | Create payment method |
| `GET` | `/api/v2/PaymentsService/PaymentMethods/Count` | Count payment methods |
| `GET` | `/api/v2/PaymentsService/PaymentMethods/:paymentMethodId` | Get payment method by ID |
| `PUT` | `/api/v2/PaymentsService/PaymentMethods/:paymentMethodId` | Update payment method |
| `DELETE` | `/api/v2/PaymentsService/PaymentMethods/:paymentMethodId` | Delete payment method |

### Payment Modes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v2/PaymentsService/PaymentModes` | List payment modes |
| `POST` | `/api/v2/PaymentsService/PaymentModes` | Create payment mode |
| `GET` | `/api/v2/PaymentsService/PaymentModes/Count` | Count payment modes |
| `GET` | `/api/v2/PaymentsService/PaymentModes/:paymentModeId` | Get payment mode by ID |
| `PUT` | `/api/v2/PaymentsService/PaymentModes/:paymentModeId` | Update payment mode |
| `DELETE` | `/api/v2/PaymentsService/PaymentModes/:paymentModeId` | Delete payment mode |

### Payment Terms

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v2/PaymentsService/PaymentTerms` | List payment terms |
| `POST` | `/api/v2/PaymentsService/PaymentTerms` | Create payment term |
| `GET` | `/api/v2/PaymentsService/PaymentTerms/Count` | Count payment terms |
| `GET` | `/api/v2/PaymentsService/PaymentTerms/:paymentTermId` | Get payment term by ID |
| `PUT` | `/api/v2/PaymentsService/PaymentTerms/:paymentTermId` | Update payment term |
| `DELETE` | `/api/v2/PaymentsService/PaymentTerms/:paymentTermId` | Delete payment term |

## Critical Rules

- **Authenticate first.** Always provide a tenant context.
- **Set up methods, modes, and terms** before creating payments.
- **Link payments to invoices/orders** via `InvoiceId`/`OrderId`.
- **Use `--help`** on any command for full DTO schemas.
