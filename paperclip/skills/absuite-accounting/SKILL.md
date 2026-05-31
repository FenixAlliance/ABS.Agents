---
name: absuite-accounting
description: >
  Manage the full accounting system in the Alliance Business Suite (ABS) using the
  `absuite` CLI or the REST API. Covers chart of accounts, account entries (debits/credits),
  journals and journal entries, ledgers, financial books, tax policies and rates, fiscal
  authorities/years/periods/regimes, billing profiles, banks and bank accounts,
  transactions, budgets, cost centres, commissions, receipts, grants, loans, shares,
  and invoice enumeration ranges. Each section shows both CLI commands and REST API
  equivalents. Requires an authenticated CLI session (use the `absuite-login` skill)
  or a valid bearer token for REST calls.
---

# Alliance Business Suite — Accounting Skill

Manage accounting through the `absuite` CLI's `accounting` service. All operations are tenant-scoped and require authentication.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant** — all accounting operations require a tenant. Either set a default:
   ```bash
   absuite config set --tenant-id <tenant-guid>
   ```
   Or pass `--TenantId <guid>` on each call.
3. **Discover commands** — run `absuite accounting list-commands` to see all 170+ accounting commands, or use `--help` on any command for full parameter and output schemas.

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

## Command Discovery

```bash
# List all accounting commands
absuite accounting list-commands

# Filter for specific areas
absuite accounting list-commands | grep account
absuite accounting list-commands | grep journal
absuite accounting list-commands | grep tax
absuite accounting list-commands | grep bank
absuite accounting list-commands | grep fiscal

# Get detailed help for any command
absuite accounting create account --help
```

## Key Concepts

- **Account** — a node in the chart of accounts (assets, liabilities, equity, revenue, expenses). Hierarchical via `ParentAccountId`.
- **Account Group** — a classification group for organizing accounts.
- **Account Type** — categorizes accounts (e.g., Current Asset, Fixed Asset, Revenue).
- **Account Entry** — a debit or credit posting to an account, with date, amount, currency, and optional journal entry link.
- **Journal** — a chronological record of transactions, linked to a ledger and journal type.
- **Journal Entry** — a double-entry record within a journal (debit account + credit account + amount).
- **Ledger** — a collection of journals (e.g., General Ledger, Accounts Receivable Ledger).
- **Financial Book** — a collection of financial records for reporting periods.
- **Tax Policy** — defines tax rules (rate, jurisdiction, withholding, exemptions).
- **Tax Rate** — a specific percentage tied to a tax policy.
- **Fiscal Authority** — a tax/regulatory body (e.g., IRS, DIAN).
- **Fiscal Year / Period** — time ranges for financial reporting.
- **Billing Profile** — tax and address details for invoicing (linked to contacts).
- **Bank / Bank Account** — banking entities with IBAN, SWIFT, and account details.
- **Transaction** — a financial transaction with price, quantity, and category.
- **Budget** — a financial plan with account entry allocations.
- **Cost Centre** — an organizational unit for cost tracking.
- **Receipt** — a payment receipt record.

---

## Chart of Accounts

### List All Accounts

```bash
absuite accounting list accounts --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Root Accounts (top-level)

```bash
absuite accounting list root-accounts --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Root" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Child Accounts

```bash
absuite accounting list child-accounts --TenantId $TENANT_ID --AccountId <parent-account-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<parent-account-guid>/Children" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Accounts

```bash
absuite accounting count accounts --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Account Details

```bash
absuite accounting list account-details --TenantId $TENANT_ID --AccountId <account-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Account Aggregate (Balance Summary)

```bash
absuite accounting get account-aggregate --TenantId $TENANT_ID --AccountId <account-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Aggregate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# Get aggregate balance
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Aggregate/Balance" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Balance an Account

```bash
absuite accounting balance account --TenantId $TENANT_ID --AccountId <account-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Balance" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Balance a Root Account (cascading)

```bash
absuite accounting balance root-account --TenantId $TENANT_ID --AccountId <root-account-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Root/Balance" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Account

```bash
absuite accounting create account --TenantId $TENANT_ID --AccountCreateDto '{
  "Name": "Accounts Receivable",
  "Code": "1200",
  "AccountCategory": "Asset",
  "AccountTypeId": "<account-type-guid>",
  "CurrencyId": "<currency-guid>",
  "ParentAccountId": "<parent-account-guid>"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Accounts Receivable",
    "Code": "1200",
    "AccountCategory": "Asset",
    "AccountTypeId": "<account-type-guid>",
    "CurrencyId": "<currency-guid>",
    "ParentAccountId": "<parent-account-guid>"
  }'
```

**Key fields:**
- `Name` — account display name
- `Code` — account code (e.g., `"1200"`, `"3100"`)
- `AccountCategory` — `"Asset"`, `"Liability"`, `"Equity"`, `"Revenue"`, `"Expense"`
- `AccountTypeId` — link to an account type
- `CurrencyId` — default currency
- `ParentAccountId` — parent in the hierarchy (omit for root accounts)
- `Group` — `true` for group/summary accounts (can't post entries directly)
- `Prefix` — code prefix for child accounts

### Update Account

```bash
absuite accounting update account --TenantId $TENANT_ID --AccountId <account-guid> --AccountUpdateDto '{
  "Name": "Trade Receivables",
  "Frozen": false
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "Trade Receivables", "Frozen": false}'
```

### Patch Account (Partial Update)

```bash
absuite accounting patch account --TenantId $TENANT_ID --AccountId <account-guid> --Body '[
  {"op": "replace", "path": "/Name", "value": "Updated Name"}
]'
```

**REST API equivalent:**
```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json-patch+json" \
  -d '[{"op": "replace", "path": "/Name", "value": "Updated Name"}]'
```

### Delete Account

```bash
absuite accounting delete account --TenantId $TENANT_ID --AccountId <account-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Account Types

```bash
# List
absuite accounting list account-types --TenantId $TENANT_ID

# Count
absuite accounting count account-types --TenantId $TENANT_ID

# Create
absuite accounting create account-type --TenantId $TENANT_ID --AccountId <account-guid> --AccountTypeCreateDto '{
  "Name": "Current Asset",
  "Description": "Short-term assets expected to be converted to cash within one year"
}'

# Update
absuite accounting update account-type --TenantId $TENANT_ID --AccountTypeId <type-guid> --AccountTypeUpdateDto '{
  "Name": "Current Asset (Updated)"
}'

# Delete
absuite accounting delete account-type --TenantId $TENANT_ID --AccountTypeId <type-guid>
```

**REST API equivalent:**
```bash
# List types
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count types
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get type by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create type
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "Current Asset", "Description": "Short-term assets expected to be converted to cash within one year"}'

# Update type
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "Current Asset (Updated)"}'

# Delete type
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Account Groups

```bash
# List
absuite accounting list account-groups --TenantId $TENANT_ID

# Count
absuite accounting count account-groups --TenantId $TENANT_ID

# Get by ID
absuite accounting get account-group --TenantId $TENANT_ID --AccountGroupId <group-guid>

# Create
absuite accounting create account-group --TenantId $TENANT_ID --AccountGroupCreateDto '{
  "Title": "Operating Expenses",
  "Description": "Day-to-day business expenses"
}'

# Update
absuite accounting update account-group --TenantId $TENANT_ID --AccountGroupId <group-guid> --AccountGroupUpdateDto '{
  "Title": "OpEx"
}'

# Delete
absuite accounting delete account-group --TenantId $TENANT_ID --AccountGroupId <group-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Title": "Operating Expenses", "Description": "Day-to-day business expenses"}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Title": "OpEx"}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Account Entries (Debits & Credits)

### Create an Account Entry

```bash
absuite accounting create account-entry --TenantId $TENANT_ID --AccountId <account-guid> --AccountingEntryCreateDto '{
  "Description": "Client payment received",
  "Date": "2026-04-19T00:00:00Z",
  "Amount": 5000.00,
  "CurrencyId": "<currency-guid>",
  "DebitAccountId": "<bank-account-guid>",
  "CreditAccountId": "<receivables-account-guid>",
  "AccountingEntryType": "Debit"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Description": "Client payment received",
    "Date": "2026-04-19T00:00:00Z",
    "Amount": 5000.00,
    "CurrencyId": "<currency-guid>",
    "DebitAccountId": "<bank-account-guid>",
    "CreditAccountId": "<receivables-account-guid>",
    "AccountingEntryType": "Debit"
  }'
```

**Key fields:**
- `Amount` — entry amount
- `Date` — posting date
- `CurrencyId` — currency
- `DebitAccountId` — account to debit
- `CreditAccountId` — account to credit
- `AccountingEntryType` — `"Debit"` or `"Credit"`
- `JournalEntryId` — optional link to a journal entry

### List / Get / Update / Delete Entries

```bash
absuite accounting list account-entries --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting get account-entry --TenantId $TENANT_ID --AccountId <account-guid> --AccountEntryId <entry-guid>
absuite accounting update account-entry --TenantId $TENANT_ID --AccountId <account-guid> --AccountEntryId <entry-guid> --AccountingEntryUpdateDto '{...}'
absuite accounting delete account-entry --TenantId $TENANT_ID --AccountId <account-guid> --AccountEntryId <entry-guid>
```

**REST API equivalent:**
```bash
# List entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get entry
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update entry
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete entry
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Debit / Credit Specific Views

```bash
# List debits for an account
absuite accounting list account-debits --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting count account-debits --TenantId $TENANT_ID --AccountId <account-guid>

# List credits for an account
absuite accounting list account-credits --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting count account-credits --TenantId $TENANT_ID --AccountId <account-guid>

# List debit entries
absuite accounting list debit-account-entries --TenantId $TENANT_ID --AccountId <account-guid>

# List credit entries
absuite accounting list credit-account-entries --TenantId $TENANT_ID --AccountId <account-guid>

# Create explicit debit
absuite accounting create account-debit --TenantId $TENANT_ID --AccountId <account-guid> --AccountingEntryCreateDto '{
  "Description": "Office supplies purchase",
  "Date": "2026-04-19T00:00:00Z",
  "Amount": 250.00,
  "CurrencyId": "<currency-guid>"
}'

# Create explicit credit
absuite accounting create account-credit --TenantId $TENANT_ID --AccountId <account-guid> --AccountingEntryCreateDto '{
  "Description": "Vendor refund received",
  "Date": "2026-04-19T00:00:00Z",
  "Amount": 100.00,
  "CurrencyId": "<currency-guid>"
}'
```

**REST API equivalent:**
```bash
# List debits for an account
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Debits" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count debits
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Debits/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List credits for an account
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Credits" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count credits
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Credits/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List debit entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries/Debit" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List credit entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries/Credit" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create debit
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Debits" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Description": "Office supplies purchase", "Date": "2026-04-19T00:00:00Z", "Amount": 250.00, "CurrencyId": "<currency-guid>"}'

# Create credit
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Credits" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Description": "Vendor refund received", "Date": "2026-04-19T00:00:00Z", "Amount": 100.00, "CurrencyId": "<currency-guid>"}'
```

### Account Relations

```bash
absuite accounting list account-relations --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting count account-relations --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting create account-relation --TenantId $TENANT_ID --AccountId <account-guid> --AccountRelationCreateDto '{...}'
absuite accounting update account-relation --TenantId $TENANT_ID --AccountRelationId <relation-guid> --AccountRelationUpdateDto '{...}'
absuite accounting delete account-relation --TenantId $TENANT_ID --AccountRelationId <relation-guid>
```

**REST API equivalent:**
```bash
# List relations
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Relations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count relations
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Relations/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create relation
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Relations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update relation
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Relations/<relation-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete relation
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Relations/<relation-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Charts of Accounts & Seeding

**REST API only:**
```bash
# List charts of accounts
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/ChartsOfAccounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Seed a chart of accounts
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/ChartsOfAccounts/Seed" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Journals & Journal Entries

### Create a Journal

```bash
absuite accounting create journal --TenantId $TENANT_ID --JournalCreateDto '{
  "Name": "General Journal - April 2026",
  "Description": "Monthly general journal entries",
  "DateTime": "2026-04-01T00:00:00Z",
  "JournalTypeID": "<journal-type-guid>",
  "LedgerID": "<ledger-guid>"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "General Journal - April 2026",
    "Description": "Monthly general journal entries",
    "DateTime": "2026-04-01T00:00:00Z",
    "JournalTypeID": "<journal-type-guid>",
    "LedgerID": "<ledger-guid>"
  }'
```

### List / Get / Update / Delete Journals

```bash
absuite accounting list journals --TenantId $TENANT_ID
absuite accounting count journals --TenantId $TENANT_ID
absuite accounting list journal-details --TenantId $TENANT_ID --JournalId <journal-guid>
absuite accounting update journal --TenantId $TENANT_ID --JournalId <journal-guid> --JournalUpdateDto '{...}'
absuite accounting delete journal --TenantId $TENANT_ID --JournalId <journal-guid>
```

**REST API equivalent:**
```bash
# List journals
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count journals
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get journal details
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update journal
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete journal
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a Journal Entry (Double-Entry)

```bash
absuite accounting create journal-entry --TenantId $TENANT_ID --JournalId <journal-guid> --JournalEntryCreateDto '{
  "Description": "Record client payment",
  "Date": "2026-04-19T00:00:00Z",
  "Debit": 5000.00,
  "Credit": 5000.00,
  "CurrencyId": "<currency-guid>",
  "DebitAccountId": "<cash-account-guid>",
  "CreditAccountId": "<receivables-account-guid>",
  "InvoiceCode": "INV-1042"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Description": "Record client payment",
    "Date": "2026-04-19T00:00:00Z",
    "Debit": 5000.00,
    "Credit": 5000.00,
    "CurrencyId": "<currency-guid>",
    "DebitAccountId": "<cash-account-guid>",
    "CreditAccountId": "<receivables-account-guid>",
    "InvoiceCode": "INV-1042"
  }'
```

**Key fields:**
- `Date` — entry date (required)
- `Debit` / `Credit` — amounts (must balance for double-entry)
- `DebitAccountId` / `CreditAccountId` — the two sides of the entry
- `InvoiceCode` — optional cross-reference to an invoice
- `Opening` — `true` for opening balance entries
- `Group` — `true` for summary entries

### List / Get / Update / Delete Journal Entries

```bash
absuite accounting list journal-entries --TenantId $TENANT_ID --JournalId <journal-guid>
absuite accounting count journal-entries --TenantId $TENANT_ID --JournalId <journal-guid>
absuite accounting update journal-entry --TenantId $TENANT_ID --JournalId <journal-guid> --JournalEntryId <entry-guid> --JournalEntryUpdateDto '{...}'
absuite accounting delete journal-entry --TenantId $TENANT_ID --JournalId <journal-guid> --JournalEntryId <entry-guid>
```

**REST API equivalent:**
```bash
# List journal entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count journal entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Aggregate credits
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries/Aggregate/Credits" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Aggregate debits
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries/Aggregate/Debits" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update journal entry
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete journal entry
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Journal Types

```bash
absuite accounting list journal-types --TenantId $TENANT_ID
absuite accounting count journal-types --TenantId $TENANT_ID
absuite accounting list journal-type-details --TenantId $TENANT_ID --JournalTypeId <type-guid>
absuite accounting create journal-type --TenantId $TENANT_ID --JournalTypeCreateDto '{"Name": "Sales Journal", "Description": "Revenue entries"}'
absuite accounting update journal-type --TenantId $TENANT_ID --JournalTypeId <type-guid> --JournalTypeUpdateDto '{...}'
absuite accounting delete journal-type --TenantId $TENANT_ID --JournalTypeId <type-guid>
```

**REST API equivalent:**
```bash
# List journal types
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/JournalTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count journal types
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/JournalTypes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get journal type
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/JournalTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create journal type
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/JournalTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "Sales Journal", "Description": "Revenue entries"}'

# Update journal type
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/JournalTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete journal type
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/JournalTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Ledgers

```bash
# List
absuite accounting list ledgers --TenantId $TENANT_ID
absuite accounting count ledgers --TenantId $TENANT_ID

# Get details
absuite accounting list ledger-details --TenantId $TENANT_ID --LedgerId <ledger-guid>

# Create
absuite accounting create ledger --TenantId $TENANT_ID --CreateLedgerDto '{
  "Name": "General Ledger",
  "Description": "Primary ledger for all business transactions",
  "LedgerTypeId": "<ledger-type-guid>"
}'

# Update
absuite accounting update ledger --TenantId $TENANT_ID --LedgerId <ledger-guid> --UpdateLedgerDto '{...}'

# Delete
absuite accounting delete ledger --TenantId $TENANT_ID --LedgerId <ledger-guid>
```

**REST API equivalent:**
```bash
# List ledgers
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Ledgers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count ledgers
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Ledgers/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get ledger details
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Ledgers/<ledger-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create ledger
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Ledgers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "General Ledger", "Description": "Primary ledger for all business transactions", "LedgerTypeId": "<ledger-type-guid>"}'

# Update ledger
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Ledgers/<ledger-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete ledger
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Ledgers/<ledger-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Ledger Types

```bash
absuite accounting list ledger-types --TenantId $TENANT_ID
absuite accounting count ledger-types --TenantId $TENANT_ID
absuite accounting list ledger-type-details --TenantId $TENANT_ID --LedgerTypeId <type-guid>
absuite accounting create ledger-type --TenantId $TENANT_ID --CreateLedgerTypeDto '{"Name": "General", "Description": "General purpose ledger"}'
absuite accounting update ledger-type --TenantId $TENANT_ID --LedgerTypeId <type-guid> --UpdateLedgerTypeDto '{...}'
absuite accounting delete ledger-type --TenantId $TENANT_ID --LedgerTypeId <type-guid>
```

**REST API equivalent:**
```bash
# List ledger types
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/LedgerTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count ledger types
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/LedgerTypes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get ledger type
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/LedgerTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create ledger type
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/LedgerTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "General", "Description": "General purpose ledger"}'

# Update ledger type
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/LedgerTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete ledger type
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/LedgerTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Financial Books

```bash
absuite accounting list financial-books --TenantId $TENANT_ID
absuite accounting count financial-books --TenantId $TENANT_ID
absuite accounting list financial-book-details --TenantId $TENANT_ID --FinancialBookId <book-guid>
absuite accounting create financial-book --TenantId $TENANT_ID --FinancialBookCreateDto '{"Name": "FY2026 Book", "Description": "Financial records for fiscal year 2026"}'
absuite accounting update financial-book --TenantId $TENANT_ID --FinancialBookId <book-guid> --FinancialBookUpdateDto '{...}'
absuite accounting delete financial-book --TenantId $TENANT_ID --FinancialBookId <book-guid>
```

**REST API equivalent:**
```bash
# List financial books
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/FinancialBooks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count financial books
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/FinancialBooks/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get financial book
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/FinancialBooks/<book-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create financial book
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/FinancialBooks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "FY2026 Book", "Description": "Financial records for fiscal year 2026"}'

# Update financial book
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/FinancialBooks/<book-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete financial book
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/FinancialBooks/<book-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Tax Policies & Rates

### Tax Policies

```bash
# List all
absuite accounting list tax-policies --TenantId $TENANT_ID

# Get by ID
absuite accounting get tax-policy --TenantId $TENANT_ID --TaxPolicyId <policy-guid>

# Get by fiscal authority
absuite accounting get tax-policies-by-authority --TenantId $TENANT_ID --FiscalAuthorityId <authority-guid>

# Create
absuite accounting create tax-policy --TenantId $TENANT_ID --TaxPolicyCreateDto '{
  "Title": "Standard VAT 19%",
  "Code": "VAT-19",
  "Description": "Standard value-added tax",
  "Percentage": 19.0,
  "IsEnabled": true,
  "IsDefault": false,
  "Withholding": false,
  "FiscalAuthorityId": "<authority-guid>",
  "CountryId": "<country-guid>",
  "CurrencyId": "<currency-guid>"
}'
```

**Key fields:**
- `Title`, `Code` — identification
- `Percentage` — tax rate percentage
- `Value` — fixed tax amount (alternative to percentage)
- `IsEnabled`, `IsDefault` — status flags
- `Withholding` — `true` for withholding taxes
- `Zero` — `true` for zero-rated taxes
- `Reduced` — `true` for reduced-rate taxes
- `IsFree` — `true` for tax-exempt policies
- `FiscalAuthorityId`, `CountryId` — jurisdiction

```bash
# Update
absuite accounting update tax-policy --TenantId $TENANT_ID --TaxPolicyId <policy-guid> --TaxPolicyUpdateDto '{...}'

# Delete
absuite accounting delete tax-policy --TenantId $TENANT_ID --TaxPolicyId <policy-guid>
```

### Tax Rates

```bash
absuite accounting list tax-rates --TenantId $TENANT_ID
absuite accounting count tax-rates --TenantId $TENANT_ID
absuite accounting get tax-rate --TenantId $TENANT_ID --TaxRateId <rate-guid>
absuite accounting create tax-rate --TenantId $TENANT_ID --TaxRateCreateDto '{...}'
absuite accounting update tax-rate --TenantId $TENANT_ID --TaxRateId <rate-guid> --TaxRateUpdateDto '{...}'
absuite accounting delete tax-rate --TenantId $TENANT_ID --TaxRateId <rate-guid>
```

### Applied Tax Policy Records & Item Tax Policy Records

```bash
# Applied tax policy records (on entities)
absuite accounting list applied-tax-policy-records --TenantId $TENANT_ID
absuite accounting count applied-tax-policy-records --TenantId $TENANT_ID
absuite accounting get applied-tax-policy-record --TenantId $TENANT_ID --AppliedTaxPolicyRecordId <record-guid>
absuite accounting create applied-tax-policy-record --TenantId $TENANT_ID --AppliedTaxPolicyRecordCreateDto '{...}'
absuite accounting update applied-tax-policy-record --TenantId $TENANT_ID --AppliedTaxPolicyRecordId <record-guid> --AppliedTaxPolicyRecordUpdateDto '{...}'
absuite accounting delete applied-tax-policy-record --TenantId $TENANT_ID --AppliedTaxPolicyRecordId <record-guid>

# Item-specific tax policy records
absuite accounting list item-tax-policy-records --TenantId $TENANT_ID
absuite accounting get item-tax-policy-record --TenantId $TENANT_ID --ItemTaxPolicyRecordId <record-guid>
absuite accounting create item-tax-policy-record --TenantId $TENANT_ID --ItemTaxPolicyRecordCreateDto '{...}'
absuite accounting update item-tax-policy-record --TenantId $TENANT_ID --ItemTaxPolicyRecordId <record-guid> --ItemTaxPolicyRecordUpdateDto '{...}'
absuite accounting delete item-tax-policy-record --TenantId $TENANT_ID --ItemTaxPolicyRecordId <record-guid>
```

---

## Fiscal Framework

### Fiscal Authorities

```bash
absuite accounting list fiscal-authorities --TenantId $TENANT_ID
absuite accounting count fiscal-authorities --TenantId $TENANT_ID
absuite accounting get fiscal-authority --TenantId $TENANT_ID --FiscalAuthorityId <authority-guid>

absuite accounting create fiscal-authority --TenantId $TENANT_ID --FiscalAuthorityCreateDto '{
  "Name": "DIAN",
  "Description": "Dirección de Impuestos y Aduanas Nacionales",
  "CountryId": "COL",
  "WebUrl": "https://www.dian.gov.co"
}'

absuite accounting update fiscal-authority --TenantId $TENANT_ID --FiscalAuthorityId <authority-guid> --FiscalAuthorityUpdateDto '{...}'
absuite accounting delete fiscal-authority --TenantId $TENANT_ID --FiscalAuthorityId <authority-guid>
```

### Fiscal Years

```bash
absuite accounting list fiscal-years --TenantId $TENANT_ID
absuite accounting count fiscal-years --TenantId $TENANT_ID
absuite accounting get fiscal-year --TenantId $TENANT_ID --FiscalYearId <year-guid>
absuite accounting list fiscal-year-details --TenantId $TENANT_ID --FiscalYearId <year-guid>

absuite accounting create fiscal-year --TenantId $TENANT_ID --FiscalYearCreateDto '{
  "Name": "FY2026",
  "Description": "Fiscal Year 2026",
  "StartDate": "2026-01-01T00:00:00Z",
  "EndDate": "2026-12-31T23:59:59Z",
  "Closed": false
}'

absuite accounting update fiscal-year --TenantId $TENANT_ID --FiscalYearId <year-guid> --FiscalYearUpdateDto '{...}'
absuite accounting delete fiscal-year --TenantId $TENANT_ID --FiscalYearId <year-guid>
```

### Fiscal Periods

```bash
absuite accounting list fiscal-periods --TenantId $TENANT_ID --FiscalYearId <year-guid>
absuite accounting count fiscal-periods --TenantId $TENANT_ID --FiscalYearId <year-guid>
absuite accounting get fiscal-period --TenantId $TENANT_ID --FiscalPeriodId <period-guid>
absuite accounting create fiscal-period --TenantId $TENANT_ID --FiscalPeriodCreateDto '{...}'
absuite accounting update fiscal-period --TenantId $TENANT_ID --FiscalPeriodId <period-guid> --FiscalPeriodUpdateDto '{...}'
absuite accounting delete fiscal-period --TenantId $TENANT_ID --FiscalPeriodId <period-guid>
```

### Fiscal Regimes

```bash
absuite accounting list fiscal-regimes --TenantId $TENANT_ID --FiscalAuthorityId <authority-guid>
absuite accounting count fiscal-regimes --TenantId $TENANT_ID
absuite accounting get fiscal-regime --TenantId $TENANT_ID --FiscalRegimeId <regime-guid>
absuite accounting create fiscal-regime --TenantId $TENANT_ID --FiscalRegimeCreateDto '{...}'
absuite accounting update fiscal-regime --TenantId $TENANT_ID --FiscalRegimeId <regime-guid> --FiscalRegimeUpdateDto '{...}'
absuite accounting delete fiscal-regime --TenantId $TENANT_ID --FiscalRegimeId <regime-guid>
```

### Fiscal Responsibilities & Identification Types

```bash
# Responsibilities
absuite accounting list fiscal-responsibilities --TenantId $TENANT_ID --FiscalAuthorityId <authority-guid>
absuite accounting count fiscal-responsibilities --TenantId $TENANT_ID
absuite accounting get fiscal-responsibility --TenantId $TENANT_ID --FiscalResponsibilityId <resp-guid>
absuite accounting create fiscal-responsibility --TenantId $TENANT_ID --FiscalResponsibilityCreateDto '{...}'

# Responsibility records (assigned to entities)
absuite accounting list fiscal-responsibility-records --TenantId $TENANT_ID
absuite accounting count fiscal-responsibility-records --TenantId $TENANT_ID
absuite accounting get fiscal-responsibility-record --TenantId $TENANT_ID --FiscalResponsibilityRecordId <record-guid>
absuite accounting create fiscal-responsibility-record --TenantId $TENANT_ID --FiscalResponsibilityRecordCreateDto '{...}'

# Identification types (e.g., NIT, RUT, EIN)
absuite accounting list fiscal-identification-types --TenantId $TENANT_ID --FiscalAuthorityId <authority-guid>
absuite accounting count fiscal-identification-types --TenantId $TENANT_ID
absuite accounting get fiscal-identification-type --TenantId $TENANT_ID --FiscalIdentificationTypeId <type-guid>
absuite accounting create fiscal-identification-type --TenantId $TENANT_ID --FiscalIdentificationTypeCreateDto '{...}'
```

---

## Billing Profiles

```bash
# List
absuite accounting list billing-profiles --TenantId $TENANT_ID
absuite accounting count billing-profiles --TenantId $TENANT_ID

# Get by ID
absuite accounting get billing-profile-by-id --TenantId $TENANT_ID --BillingProfileId <profile-guid>

# Create
absuite accounting create billing-profile --TenantId $TENANT_ID --BillingProfileCreateDto '{
  "BusinessName": "Acme Corporation",
  "CommercialName": "Acme Corp",
  "TaxId": "900123456-7",
  "Email": "billing@acme.com",
  "Phone": "+1-555-0100",
  "Address": "123 Main St",
  "PostalCode": "10001",
  "CountryId": "USA",
  "StateId": "<state-guid>",
  "CityId": "<city-guid>",
  "ContactId": "<contact-guid>",
  "FiscalAuthorityId": "<authority-guid>",
  "FiscalIdentificationTypeId": "<id-type-guid>",
  "FiscalRegimeId": "<regime-guid>"
}'

# Update
absuite accounting update billing-profile --TenantId $TENANT_ID --BillingProfileId <profile-guid> --BillingProfileUpdateDto '{...}'

# Delete
absuite accounting delete billing-profile --TenantId $TENANT_ID --BillingProfileId <profile-guid>
```

---

## Banking

### Banks

```bash
absuite accounting list banks --TenantId $TENANT_ID
absuite accounting count banks --TenantId $TENANT_ID
absuite accounting get bank --TenantId $TENANT_ID --BankId <bank-guid>

absuite accounting create bank --TenantId $TENANT_ID --BankCreateDto '{
  "Name": "First National Bank",
  "CountryId": "USA"
}'

absuite accounting update bank --TenantId $TENANT_ID --BankId <bank-guid> --BankUpdateDto '{...}'
absuite accounting delete bank --TenantId $TENANT_ID --BankId <bank-guid>
```

### Bank Accounts

```bash
absuite accounting list bank-accounts --TenantId $TENANT_ID
absuite accounting count bank-accounts --TenantId $TENANT_ID
absuite accounting get bank-account --TenantId $TENANT_ID --BankAccountId <account-guid>

absuite accounting create bank-account --TenantId $TENANT_ID --BankId <bank-guid> --BankAccountCreateDto '{
  "Name": "Operating Account",
  "BankAccountNumber": "1234567890",
  "Iban": "US12345678901234567890",
  "Swift": "FNBKUS44",
  "CurrencyId": "<currency-guid>",
  "AccountTypeId": "<account-type-guid>",
  "BankId": "<bank-guid>"
}'

absuite accounting update bank-account --TenantId $TENANT_ID --BankAccountId <account-guid> --BankAccountUpdateDto '{...}'
absuite accounting delete bank-account --TenantId $TENANT_ID --BankAccountId <account-guid>
```

### Bank Transactions

```bash
absuite accounting list bank-transactions --TenantId $TENANT_ID
absuite accounting count bank-transactions --TenantId $TENANT_ID
absuite accounting get bank-transaction --TenantId $TENANT_ID --BankTransactionId <txn-guid>
absuite accounting create bank-transaction --TenantId $TENANT_ID --BankTransactionCreateDto '{...}'
absuite accounting update bank-transaction --TenantId $TENANT_ID --BankTransactionId <txn-guid> --BankTransactionUpdateDto '{...}'
absuite accounting delete bank-transaction --TenantId $TENANT_ID --BankTransactionId <txn-guid>
```

### Bank Guarantees

```bash
absuite accounting list bank-guarantees --TenantId $TENANT_ID
absuite accounting count bank-guarantees --TenantId $TENANT_ID
absuite accounting get bank-guarantee --TenantId $TENANT_ID --BankGuaranteeId <guarantee-guid>
absuite accounting create bank-guarantee --TenantId $TENANT_ID --BankGuaranteeCreateDto '{...}'
absuite accounting update bank-guarantee --TenantId $TENANT_ID --BankGuaranteeId <guarantee-guid> --BankGuaranteeUpdateDto '{...}'
absuite accounting delete bank-guarantee --TenantId $TENANT_ID --BankGuaranteeId <guarantee-guid>
```

---

## Transactions & Categories

```bash
# Transactions
absuite accounting list transactions --TenantId $TENANT_ID
absuite accounting count transactions --TenantId $TENANT_ID
absuite accounting get transaction --TenantId $TENANT_ID --TransactionId <txn-guid>

absuite accounting create transaction --TenantId $TENANT_ID --TransactionCreateDto '{
  "Description": "Software license sale",
  "Price": 500.00,
  "Quantity": 10,
  "CurrencyId": "<currency-guid>",
  "TransactionCategoryId": "<category-guid>"
}'

absuite accounting update transaction --TenantId $TENANT_ID --TransactionId <txn-guid> --TransactionUpdateDto '{...}'
absuite accounting delete transaction --TenantId $TENANT_ID --TransactionId <txn-guid>

# Transaction categories
absuite accounting list transaction-categories --TenantId $TENANT_ID
absuite accounting count transaction-categories --TenantId $TENANT_ID
absuite accounting get transaction-category --TenantId $TENANT_ID --TransactionCategoryId <cat-guid>
absuite accounting create transaction-category --TenantId $TENANT_ID --TransactionCategoryCreateDto '{...}'
absuite accounting update transaction-category --TenantId $TENANT_ID --TransactionCategoryId <cat-guid> --TransactionCategoryUpdateDto '{...}'
absuite accounting delete transaction-category --TenantId $TENANT_ID --TransactionCategoryId <cat-guid>
```

---

## Budgets & Cost Centres

### Budgets

```bash
absuite accounting list budgets --TenantId $TENANT_ID
absuite accounting list budget-details --TenantId $TENANT_ID --BudgetId <budget-guid>
absuite accounting create budget --TenantId $TENANT_ID --BudgetCreateDto '{...}'
absuite accounting update budget --TenantId $TENANT_ID --BudgetId <budget-guid> --BudgetUpdateDto '{...}'
absuite accounting delete budget --TenantId $TENANT_ID --BudgetId <budget-guid>

# Budget account entries
absuite accounting get budget-account-entries-collection --TenantId $TENANT_ID --BudgetId <budget-guid>
absuite accounting get budget-account-entry --TenantId $TENANT_ID --BudgetAccountEntryId <entry-guid>
absuite accounting create budget-account-entry --TenantId $TENANT_ID --BudgetAccountEntryCreateDto '{...}'
absuite accounting update budget-account-entry --TenantId $TENANT_ID --BudgetAccountEntryId <entry-guid> --BudgetAccountEntryUpdateDto '{...}'
absuite accounting delete budget-account-entry --TenantId $TENANT_ID --BudgetAccountEntryId <entry-guid>
```

### Cost Centres

```bash
absuite accounting list cost-centres --TenantId $TENANT_ID
absuite accounting count cost-centres --TenantId $TENANT_ID
absuite accounting get cost-centre --TenantId $TENANT_ID --CostCentreId <cc-guid>
absuite accounting create cost-centre --TenantId $TENANT_ID --CostCentreCreateDto '{...}'
absuite accounting update cost-centre --TenantId $TENANT_ID --CostCentreId <cc-guid> --CostCentreUpdateDto '{...}'
absuite accounting delete cost-centre --TenantId $TENANT_ID --CostCentreId <cc-guid>

# Cost centre groups
absuite accounting list cost-centre-groups --TenantId $TENANT_ID
absuite accounting count cost-centre-groups --TenantId $TENANT_ID
absuite accounting get cost-centre-group --TenantId $TENANT_ID --CostCentreGroupId <group-guid>
absuite accounting create cost-centre-group --TenantId $TENANT_ID --CostCentreGroupCreateDto '{...}'

# Cost centre budgets
absuite accounting list cost-centre-budgets --TenantId $TENANT_ID
absuite accounting get cost-centre-budget --TenantId $TENANT_ID --CostCentreBudgetId <budget-guid>
absuite accounting create cost-centre-budget --TenantId $TENANT_ID --CostCentreBudgetCreateDto '{...}'
```

---

## Commissions & Receipts

```bash
# Commissions
absuite accounting list commissions --TenantId $TENANT_ID
absuite accounting count commissions --TenantId $TENANT_ID
absuite accounting get commission --TenantId $TENANT_ID --CommissionId <commission-guid>
absuite accounting create commission --TenantId $TENANT_ID --CommissionCreateDto '{...}'
absuite accounting update commission --TenantId $TENANT_ID --CommissionId <commission-guid> --CommissionUpdateDto '{...}'
absuite accounting delete commission --TenantId $TENANT_ID --CommissionId <commission-guid>

# Payment commissions
absuite accounting list payment-commissions --TenantId $TENANT_ID
absuite accounting count payment-commissions --TenantId $TENANT_ID
absuite accounting get payment-commission --TenantId $TENANT_ID --PaymentCommissionId <pc-guid>
absuite accounting create payment-commission --TenantId $TENANT_ID --PaymentCommissionCreateDto '{...}'

# Receipts
absuite accounting list receipts --TenantId $TENANT_ID
absuite accounting count receipts --TenantId $TENANT_ID
absuite accounting list receipt-details --TenantId $TENANT_ID --ReceiptId <receipt-guid>
absuite accounting create receipt --TenantId $TENANT_ID --ReceiptCreateDto '{...}'
absuite accounting update receipt --TenantId $TENANT_ID --ReceiptId <receipt-guid> --ReceiptUpdateDto '{...}'
absuite accounting delete receipt --TenantId $TENANT_ID --ReceiptId <receipt-guid>
```

---

## Grants & Loans

```bash
# Grants
absuite accounting list grants --TenantId $TENANT_ID
absuite accounting count grants --TenantId $TENANT_ID
absuite accounting list grant-details --TenantId $TENANT_ID --GrantId <grant-guid>
absuite accounting create grant --TenantId $TENANT_ID --GrantCreateDto '{...}'
absuite accounting update grant --TenantId $TENANT_ID --GrantId <grant-guid> --GrantUpdateDto '{...}'
absuite accounting delete grant --TenantId $TENANT_ID --GrantId <grant-guid>

# Loans
absuite accounting list loans --TenantId $TENANT_ID
absuite accounting count loans --TenantId $TENANT_ID
absuite accounting list loan-details --TenantId $TENANT_ID --LoanId <loan-guid>
absuite accounting create loan --TenantId $TENANT_ID --LoanCreateDto '{...}'
absuite accounting update loan --TenantId $TENANT_ID --LoanId <loan-guid> --LoanUpdateDto '{...}'
absuite accounting delete loan --TenantId $TENANT_ID --LoanId <loan-guid>

# Loan applications
absuite accounting list loan-applications --TenantId $TENANT_ID
absuite accounting count loan-applications --TenantId $TENANT_ID
absuite accounting list loan-application-details --TenantId $TENANT_ID --LoanApplicationId <app-guid>
absuite accounting create loan-application --TenantId $TENANT_ID --LoanApplicationCreateDto '{...}'
absuite accounting update loan-application --TenantId $TENANT_ID --LoanApplicationId <app-guid> --LoanApplicationUpdateDto '{...}'
absuite accounting delete loan-application --TenantId $TENANT_ID --LoanApplicationId <app-guid>
```

---

## Shares

```bash
# Share classes
absuite accounting list share-classes --TenantId $TENANT_ID
absuite accounting count share-classes --TenantId $TENANT_ID
absuite accounting get share-class --TenantId $TENANT_ID --ShareClassId <class-guid>
absuite accounting create share-class --TenantId $TENANT_ID --ShareClassCreateDto '{...}'
absuite accounting update share-class --TenantId $TENANT_ID --ShareClassId <class-guid> --ShareClassUpdateDto '{...}'
absuite accounting delete share-class --TenantId $TENANT_ID --ShareClassId <class-guid>

# Share issuances
absuite accounting list share-issuances --TenantId $TENANT_ID
absuite accounting count share-issuances --TenantId $TENANT_ID
absuite accounting get share-issuance --TenantId $TENANT_ID --ShareIssuanceId <issuance-guid>
absuite accounting create share-issuance --TenantId $TENANT_ID --ShareIssuanceCreateDto '{...}'

# Share transfers
absuite accounting list share-transfers --TenantId $TENANT_ID
absuite accounting count share-transfers --TenantId $TENANT_ID
absuite accounting get share-transfer --TenantId $TENANT_ID --ShareTransferId <transfer-guid>
absuite accounting create share-transfer --TenantId $TENANT_ID --ShareTransferCreateDto '{...}'

# Share transfer reasons
absuite accounting list share-transfer-reasons --TenantId $TENANT_ID
absuite accounting count share-transfer-reasons --TenantId $TENANT_ID
absuite accounting get share-transfer-reason --TenantId $TENANT_ID --ShareTransferReasonId <reason-guid>
absuite accounting create share-transfer-reason --TenantId $TENANT_ID --ShareTransferReasonCreateDto '{...}'
```

---

## Invoice Enumeration Ranges

```bash
absuite accounting list invoice-enumeration-ranges --TenantId $TENANT_ID
absuite accounting count invoice-enumeration-ranges --TenantId $TENANT_ID
absuite accounting get invoice-enumeration-range --TenantId $TENANT_ID --InvoiceEnumerationRangeId <range-guid>
absuite accounting list invoice-enumeration-range-details --TenantId $TENANT_ID --InvoiceEnumerationRangeId <range-guid>
absuite accounting create invoice-enumeration-range --TenantId $TENANT_ID --InvoiceEnumerationRangeCreateDto '{...}'
absuite accounting update invoice-enumeration-range --TenantId $TENANT_ID --InvoiceEnumerationRangeId <range-guid> --InvoiceEnumerationRangeUpdateDto '{...}'
absuite accounting delete invoice-enumeration-range --TenantId $TENANT_ID --InvoiceEnumerationRangeId <range-guid>
```

---

## Accounting Periods

```bash
absuite accounting list periods --TenantId $TENANT_ID
absuite accounting count periods --TenantId $TENANT_ID
absuite accounting get period --TenantId $TENANT_ID --PeriodId <period-guid>
absuite accounting create period --TenantId $TENANT_ID --PeriodCreateDto '{...}'
absuite accounting update period --TenantId $TENANT_ID --PeriodId <period-guid> --PeriodUpdateDto '{...}'
absuite accounting delete period --TenantId $TENANT_ID --PeriodId <period-guid>
```

---

## Full Example: Setting Up Accounting from Scratch

```bash
# 1. Authenticate
absuite login --email accountant@company.com

# 2. Set tenant
absuite config set --tenant-id 00000000-0000-0000-0000-000000000000

# 3. Create a fiscal authority
absuite accounting create fiscal-authority --FiscalAuthorityCreateDto '{
  "Name": "IRS",
  "Description": "Internal Revenue Service",
  "CountryId": "USA",
  "WebUrl": "https://www.irs.gov"
}'

# 4. Create a fiscal year
absuite accounting create fiscal-year --FiscalYearCreateDto '{
  "Name": "FY2026",
  "StartDate": "2026-01-01T00:00:00Z",
  "EndDate": "2026-12-31T23:59:59Z"
}'

# 5. Create a tax policy
absuite accounting create tax-policy --TaxPolicyCreateDto '{
  "Title": "Sales Tax 8%",
  "Code": "ST-8",
  "Percentage": 8.0,
  "IsEnabled": true,
  "FiscalAuthorityId": "<authority-guid>",
  "CountryId": "USA",
  "CurrencyId": "<currency-guid>"
}'

# 6. Create a ledger type + ledger
absuite accounting create ledger-type --CreateLedgerTypeDto '{"Name": "General"}'
absuite accounting create ledger --CreateLedgerDto '{
  "Name": "General Ledger",
  "LedgerTypeId": "<ledger-type-guid>"
}'

# 7. Create account types
absuite accounting create account-type --AccountId <placeholder> --AccountTypeCreateDto '{"Name": "Current Asset"}'
absuite accounting create account-type --AccountId <placeholder> --AccountTypeCreateDto '{"Name": "Revenue"}'

# 8. Create chart of accounts
absuite accounting create account --AccountCreateDto '{
  "Name": "Cash",
  "Code": "1000",
  "AccountCategory": "Asset",
  "AccountTypeId": "<current-asset-type-guid>",
  "CurrencyId": "<currency-guid>"
}'

absuite accounting create account --AccountCreateDto '{
  "Name": "Accounts Receivable",
  "Code": "1200",
  "AccountCategory": "Asset",
  "AccountTypeId": "<current-asset-type-guid>",
  "CurrencyId": "<currency-guid>"
}'

absuite accounting create account --AccountCreateDto '{
  "Name": "Sales Revenue",
  "Code": "4000",
  "AccountCategory": "Revenue",
  "AccountTypeId": "<revenue-type-guid>",
  "CurrencyId": "<currency-guid>"
}'

# 9. Create a journal
absuite accounting create journal --JournalCreateDto '{
  "Name": "April 2026",
  "DateTime": "2026-04-01T00:00:00Z",
  "LedgerID": "<ledger-guid>"
}'

# 10. Record a sale (journal entry)
absuite accounting create journal-entry --JournalId <journal-guid> --JournalEntryCreateDto '{
  "Description": "Client payment for Invoice #1042",
  "Date": "2026-04-19T00:00:00Z",
  "Debit": 5000.00,
  "Credit": 5000.00,
  "CurrencyId": "<currency-guid>",
  "DebitAccountId": "<cash-account-guid>",
  "CreditAccountId": "<receivables-account-guid>",
  "InvoiceCode": "INV-1042"
}'

# 11. Create a billing profile
absuite accounting create billing-profile --BillingProfileCreateDto '{
  "BusinessName": "My Company LLC",
  "TaxId": "12-3456789",
  "Email": "billing@mycompany.com",
  "Address": "456 Business Ave",
  "CountryId": "USA",
  "FiscalAuthorityId": "<authority-guid>"
}'

# 12. Verify balances
absuite accounting balance account --AccountId <cash-account-guid>
absuite accounting get account-aggregate --AccountId <cash-account-guid>
```

## Critical Rules

- **Authenticate first.** Use `absuite login` before any accounting operation.
- **Always provide a tenant context.** Set a default with `absuite config set --tenant-id` or pass `--TenantId` on each call.
- **Use `--help` before unfamiliar commands.** The accounting service has 170+ commands with varied DTOs.
- **Double-entry principle** — journal entries must balance (Debit = Credit).
- **Set up fiscal framework first** — create fiscal authority → fiscal year → tax policies before posting entries.
- **Create chart of accounts before entries** — you need account IDs to create entries and journal entries.
