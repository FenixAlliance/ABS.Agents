---
name: absuite-payments-cli
description: >
  Manage payments in the Alliance Business Suite (ABS) Payments Service using the
  `absuite` CLI. Covers payments and their lifecycle (status transitions) plus the
  supporting configuration — payment methods, payment modes, and payment terms — via
  list/count/get/create/update/delete commands. Requires an authenticated CLI session
  (see absuite-login-cli). For atomic PATCH updates or raw HTTP, use the
  absuite-payments (REST) skill.
---

# Alliance Business Suite — Payments Skill (CLI)

Manage payments through the `absuite` CLI's `payments` service. All payments
operations are tenant-scoped and require an authenticated session. The CLI does not
support PATCH (JSON Patch) — for partial atomic updates (including driving a payment's
status lifecycle) use the `absuite-payments` REST skill.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-payments` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-payments` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general
   CLI usage and configuration, see `absuite-cli`.
2. **Set your tenant** — every payments command requires a tenant. Either set a default:
   ```powershell
   absuite config set --tenant-id <tenant-guid>
   ```
   …and reference it as `$TENANT_ID`, or pass `--TenantId <tenant-guid>` on each call.
3. **Discover commands:**
   ```powershell
   absuite payments list-commands
   absuite payments create payment --help
   ```

## Command Structure

```
absuite payments <verb> <entity> --Param value
```

- **Verbs:** `list`, `count`, `get`, `create`, `update`, `delete`.
- **Entities:** `payment`, `payment-method`, `payment-mode`, `payment-term`.
- The canonical PowerShell function-name form also works as the command, e.g.
  `absuite payments New-PaymentAsync --TenantId <tenant-guid> --PaymentCreateDto '{...}'`
  is equivalent to `absuite payments create payment ...`. The function names map to
  PowerShell-approved verbs: create → `New-…Async`, list → `Get-…sAsync`,
  count → `Get-…sCountAsync`, get by ID → `Get-…DetailsAsync` (and
  `Get-PaymentAsyncV2` for a payment), update → `Update-…Async`,
  delete → `Invoke-Delete…Async`.
- **JSON DTO params** are passed as a single-quoted JSON string (`--<Dto> '{...}'`)
  using the **same field names** as the REST API.

> **No search verb.** The Payments Service has no dedicated search endpoint. Use
> `list` to pull the full tenant-scoped collection and filter the results yourself.
>
> **No PATCH.** The CLI cannot apply JSON Patch. To transition a payment's
> `PaymentStatus` atomically, use the `absuite-payments` REST skill.

## Key Concepts

- **Payment** — a money-movement record between two wallets, optionally linked to an
  invoice and/or order, with amount/tax totals, currency, gateway/bank references, and
  KYC/anti-fraud fields.
- **Payment Method** — a configured way to pay (lookup: `Name` + `Description`).
- **Payment Mode** — a configured payment delivery mechanism (lookup: `Name` +
  `Description`).
- **Payment Term** — contractual conditions (e.g. Net 30) with a credit window
  (`CreditDays`/`CreditWeeks`/`CreditMonths`/`CreditYears`), an optional `Percentage`,
  an `IsTemplate` flag, and an optional `PaymentModeId`.
- **`OnBehalfOf`** — `Self` | `Tenant` | `Individual` | `Organization`.
- **`PaymentType`** — `Paid` | `Received` | `Internal`.
- **`PaymentStatus`** (lifecycle) — `Unset` | `Accepted` | `Rejected` | `OnHold` |
  `Failed` | `Reversed` | `Retained` | `Initialized` | `Expired` | `Abandoned` |
  `Cancelled` | `AcceptedRetained`.

## Payments

### List Payments

```powershell
absuite payments list payments --TenantId $TENANT_ID
```

> **Note:** the top-level **payments** collection has no `count` command (only
> `payment-methods`, `payment-modes`, and `payment-terms` support `count`). To count
> payments, run `list payments` and count the results.

### Get Payment by ID

```powershell
absuite payments get payment --TenantId $TENANT_ID --PaymentId <payment-guid>
```

### Create Payment

```powershell
absuite payments create payment --TenantId $TENANT_ID --PaymentCreateDto '{
  "InvoiceId": "<invoice-guid>",
  "OrderId": "<order-guid>",
  "EmisorWalletId": "<sender-wallet-guid>",
  "ReceiverWalletId": "<receiver-wallet-guid>",
  "CurrencyId": "<currency-guid>",
  "ForexRate": 1.0,
  "TotalCost": 1500.00,
  "TotalTaxes": 120.00,
  "BaseCost": 1380.00,
  "OnBehalfOf": "Tenant",
  "PaymentType": "Received",
  "PaymentStatus": "Initialized",
  "ReferenceCode": "<reference-code>",
  "CorrelationCode": "<correlation-code>",
  "Authorization": "<gateway-auth-code>",
  "PaymentGatewayId": "<gateway-guid>",
  "BankId": "<bank-guid>",
  "BankAccountId": "<bank-account-guid>",
  "CountryId": "<country-guid>",
  "Closed": false,
  "IsExternal": false
}'
```

**`PaymentCreateDto` fields** (all optional; same names as the REST API):
`Id`, `Timestamp`, `InvoiceId`, `EmisorWalletId`, `ReceiverWalletId`, `CurrencyId`,
`ForexRate`, `TotalCost`, `TotalTaxes`, `Closed`, `Data`, `DataLabel`, `Data1`,
`Data1Label`, `Response`, `Authorization`, `ReferenceCode`, `CorrelationCode`,
`LastUpdated`, `OnBehalfOf` (`Self`|`Tenant`|`Individual`|`Organization`),
`PaymentType` (`Paid`|`Received`|`Internal`),
`PaymentStatus` (`Unset`|`Accepted`|`Rejected`|`OnHold`|`Failed`|`Reversed`|`Retained`|`Initialized`|`Expired`|`Abandoned`|`Cancelled`|`AcceptedRetained`),
`BaseCost`, `Signature`, `SignatureMismatch`, `IsExternal`, `MarkedForRevision`,
`ForexRatesSnapshot`, `OfficialId`, `OfficialIdExpeditionDate`,
`FiscalIdentificationTypeId`, `BillingAddress`, `Phone`, `Cellphone`, `Department`,
`City`, `CountryId`, `LocationId`, `EntitlementId`, `AntiFraudScore`, `CallRecordURL`,
`Called`, `Verified`, `PayerPictureTimestamp`, `PayerPicture`,
`IdentificationPictureTimestamp`, `IdentificationPicture`, `IdentificationBackPicture`,
`IdentificationBackPictureTimestamp`, `IpLookupId`, `OrderId`, `AccountingEntryId`,
`PaymentGatewayId`, `BankAccountId`, `BankId`, `PaymentTokenId`,
`EmisorWalletAccountId`, `ReceiverWalletAccountId`.

### Update Payment (full replace)

```powershell
absuite payments update payment --TenantId $TENANT_ID --PaymentId <payment-guid> --PaymentUpdateDto '{
  "InvoiceId": "<invoice-guid>",
  "CurrencyId": "<currency-guid>",
  "TotalCost": 1500.00,
  "TotalTaxes": 120.00,
  "PaymentType": "Received",
  "PaymentStatus": "Accepted",
  "Closed": true
}'
```

`PaymentUpdateDto` carries the same business fields as `PaymentCreateDto` **except**
`Id` and `Timestamp`. (The CLI replaces the whole record; to change a single field
atomically — e.g. only `PaymentStatus` — use the PATCH endpoint via the
`absuite-payments` REST skill.)

### Delete Payment

```powershell
absuite payments delete payment --TenantId $TENANT_ID --PaymentId <payment-guid>
```

## Payment Methods

Lookup records for accepted payment methods. `Name` is required on create.

```powershell
# List
absuite payments list payment-methods --TenantId $TENANT_ID

# Count
absuite payments count payment-methods --TenantId $TENANT_ID

# Get by ID
absuite payments get payment-method --TenantId $TENANT_ID --PaymentMethodId <payment-method-guid>

# Create
absuite payments create payment-method --TenantId $TENANT_ID --PaymentMethodCreateDto '{
  "Name": "Credit Card",
  "Description": "Visa / MasterCard payments"
}'

# Update (full replace)
absuite payments update payment-method --TenantId $TENANT_ID --PaymentMethodId <payment-method-guid> --PaymentMethodUpdateDto '{
  "Name": "Credit Card",
  "Description": "Visa / MasterCard / Amex"
}'

# Delete
absuite payments delete payment-method --TenantId $TENANT_ID --PaymentMethodId <payment-method-guid>
```

- `PaymentMethodCreateDto` fields: `Id`, `Timestamp`, `Name` (**required**), `Description`.
- `PaymentMethodUpdateDto` fields: `Name`, `Description`.

## Payment Modes

Lookup records for payment delivery mechanisms. `Name` is required on create.

```powershell
# List
absuite payments list payment-modes --TenantId $TENANT_ID

# Count
absuite payments count payment-modes --TenantId $TENANT_ID

# Get by ID
absuite payments get payment-mode --TenantId $TENANT_ID --PaymentModeId <payment-mode-guid>

# Create
absuite payments create payment-mode --TenantId $TENANT_ID --PaymentModeCreateDto '{
  "Name": "Online Payment",
  "Description": "Payment captured online via gateway"
}'

# Update (full replace)
absuite payments update payment-mode --TenantId $TENANT_ID --PaymentModeId <payment-mode-guid> --PaymentModeUpdateDto '{
  "Name": "Online Payment",
  "Description": "Captured online (card / wallet)"
}'

# Delete
absuite payments delete payment-mode --TenantId $TENANT_ID --PaymentModeId <payment-mode-guid>
```

- `PaymentModeCreateDto` fields: `Id`, `Timestamp`, `Name` (**required**), `Description`.
- `PaymentModeUpdateDto` fields: `Name`, `Description`.

## Payment Terms

Contractual payment conditions (e.g. Net 30) with a credit window and an optional
discount percentage. `Name` is required on create.

```powershell
# List
absuite payments list payment-terms --TenantId $TENANT_ID

# Count
absuite payments count payment-terms --TenantId $TENANT_ID

# Get by ID
absuite payments get payment-term --TenantId $TENANT_ID --PaymentTermId <payment-term-guid>

# Create
absuite payments create payment-term --TenantId $TENANT_ID --PaymentTermCreateDto '{
  "Name": "Net 30",
  "Description": "Payment due within 30 days",
  "IsTemplate": false,
  "Percentage": 0,
  "CreditDays": 30,
  "CreditWeeks": 0,
  "CreditMonths": 0,
  "CreditYears": 0,
  "PaymentModeId": "<payment-mode-guid>"
}'

# Update (full replace)
absuite payments update payment-term --TenantId $TENANT_ID --PaymentTermId <payment-term-guid> --PaymentTermUpdateDto '{
  "Name": "Net 60",
  "Description": "Payment due within 60 days",
  "CreditDays": 60
}'

# Delete
absuite payments delete payment-term --TenantId $TENANT_ID --PaymentTermId <payment-term-guid>
```

- `PaymentTermCreateDto` fields: `Id`, `Timestamp`, `Name` (**required**),
  `Description`, `IsTemplate`, `Percentage`, `CreditDays`, `CreditWeeks`,
  `CreditMonths`, `CreditYears`, `PaymentModeId`.
- `PaymentTermUpdateDto` fields: `Name`, `Description`, `IsTemplate`, `Percentage`,
  `CreditDays`, `CreditWeeks`, `CreditMonths`, `CreditYears`, `PaymentModeId`.

## End-to-End Workflow

```powershell
# 1. (one-time setup) Create a payment method, mode, and term
absuite payments create payment-method --TenantId $TENANT_ID --PaymentMethodCreateDto '{ "Name": "Credit Card", "Description": "Visa / MasterCard" }'
absuite payments create payment-mode   --TenantId $TENANT_ID --PaymentModeCreateDto   '{ "Name": "Online Payment" }'
absuite payments create payment-term   --TenantId $TENANT_ID --PaymentTermCreateDto   '{ "Name": "Net 30", "CreditDays": 30 }'

# 2. Create a payment (note the returned id), linked to an invoice
absuite payments create payment --TenantId $TENANT_ID --PaymentCreateDto '{
  "InvoiceId": "<invoice-guid>",
  "CurrencyId": "<currency-guid>",
  "TotalCost": 1500.00,
  "TotalTaxes": 120.00,
  "EmisorWalletId": "<sender-wallet-guid>",
  "ReceiverWalletId": "<receiver-wallet-guid>",
  "PaymentType": "Received",
  "PaymentStatus": "Initialized",
  "ReferenceCode": "<reference-code>"
}'

# 3. Mark the payment Accepted and closed (full replace — the CLI has no PATCH;
#    for a single-field atomic status transition use the absuite-payments REST skill)
absuite payments update payment --TenantId $TENANT_ID --PaymentId <payment-guid> --PaymentUpdateDto '{
  "InvoiceId": "<invoice-guid>",
  "CurrencyId": "<currency-guid>",
  "TotalCost": 1500.00,
  "TotalTaxes": 120.00,
  "PaymentType": "Received",
  "PaymentStatus": "Accepted",
  "Closed": true
}'

# 4. Verify
absuite payments get payment --TenantId $TENANT_ID --PaymentId <payment-guid>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List payments | `absuite payments list payments` |
| Get payment | `absuite payments get payment --PaymentId <payment-guid>` |
| Create payment | `absuite payments create payment --PaymentCreateDto '{...}'` |
| Update payment | `absuite payments update payment --PaymentId <payment-guid> --PaymentUpdateDto '{...}'` |
| Delete payment | `absuite payments delete payment --PaymentId <payment-guid>` |
| List payment methods | `absuite payments list payment-methods` |
| Count payment methods | `absuite payments count payment-methods` |
| Get payment method | `absuite payments get payment-method --PaymentMethodId <payment-method-guid>` |
| Create payment method | `absuite payments create payment-method --PaymentMethodCreateDto '{...}'` |
| Update payment method | `absuite payments update payment-method --PaymentMethodId <payment-method-guid> --PaymentMethodUpdateDto '{...}'` |
| Delete payment method | `absuite payments delete payment-method --PaymentMethodId <payment-method-guid>` |
| List payment modes | `absuite payments list payment-modes` |
| Count payment modes | `absuite payments count payment-modes` |
| Get payment mode | `absuite payments get payment-mode --PaymentModeId <payment-mode-guid>` |
| Create payment mode | `absuite payments create payment-mode --PaymentModeCreateDto '{...}'` |
| Update payment mode | `absuite payments update payment-mode --PaymentModeId <payment-mode-guid> --PaymentModeUpdateDto '{...}'` |
| Delete payment mode | `absuite payments delete payment-mode --PaymentModeId <payment-mode-guid>` |
| List payment terms | `absuite payments list payment-terms` |
| Count payment terms | `absuite payments count payment-terms` |
| Get payment term | `absuite payments get payment-term --PaymentTermId <payment-term-guid>` |
| Create payment term | `absuite payments create payment-term --PaymentTermCreateDto '{...}'` |
| Update payment term | `absuite payments update payment-term --PaymentTermId <payment-term-guid> --PaymentTermUpdateDto '{...}'` |
| Delete payment term | `absuite payments delete payment-term --PaymentTermId <payment-term-guid>` |

> Every command also accepts `--TenantId <tenant-guid>` (omit it if you set a default
> tenant with `absuite config set --tenant-id <tenant-guid>`). For atomic PATCH
> (JSON Patch) updates or raw HTTP, use the `absuite-payments` REST skill.
