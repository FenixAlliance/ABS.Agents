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

Manage accounting through the `absuite` CLI's `accounting` service or via the REST API. All operations are tenant-scoped and require authentication.

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

**REST API equivalent:**
```bash
# List all tax policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count tax policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get tax policy by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by fiscal authority
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/ByAuthority/<authority-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create tax policy
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Standard VAT 19%",
    "Code": "VAT-19",
    "Percentage": 19.0,
    "IsEnabled": true,
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

**REST API equivalent:**
```bash
# Update tax policy
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete tax policy
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# List tax rates
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxRates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count tax rates
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxRates/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get tax rate
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxRates/<rate-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create tax rate
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxRates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update tax rate
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxRates/<rate-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete tax rate
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxRates/<rate-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Tax Classes

```bash
absuite accounting list tax-classes --TenantId $TENANT_ID
absuite accounting count tax-classes --TenantId $TENANT_ID
absuite accounting get tax-class --TenantId $TENANT_ID --TaxClassId <class-guid>
absuite accounting create tax-class --TenantId $TENANT_ID --TaxClassCreateDto '{"Name": "Standard", "Type": "Product", "FiscalAuthorityId": "<authority-guid>"}'
absuite accounting update tax-class --TenantId $TENANT_ID --TaxClassId <class-guid> --TaxClassUpdateDto '{...}'
absuite accounting delete tax-class --TenantId $TENANT_ID --TaxClassId <class-guid>
```

**REST API equivalent:**
```bash
# List tax classes
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxClasses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count tax classes
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxClasses/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get tax class
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxClasses/<class-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create tax class
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxClasses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "Standard", "Type": "Product", "FiscalAuthorityId": "<authority-guid>"}'

# Update tax class
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxClasses/<class-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete tax class
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxClasses/<class-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# Applied tax policy records
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/AppliedTaxPolicyRecords" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/AppliedTaxPolicyRecords/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/AppliedTaxPolicyRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/AppliedTaxPolicyRecords" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/AppliedTaxPolicyRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/AppliedTaxPolicyRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Item-specific tax policy records
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/ItemTaxPolicyRecords" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/ItemTaxPolicyRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/ItemTaxPolicyRecords" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/ItemTaxPolicyRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/ItemTaxPolicyRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# List fiscal authorities
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count fiscal authorities
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get fiscal authority
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/<authority-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create fiscal authority
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "DIAN",
    "Description": "Dirección de Impuestos y Aduanas Nacionales",
    "CountryId": "COL",
    "WebUrl": "https://www.dian.gov.co"
  }'

# Update fiscal authority
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/<authority-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete fiscal authority
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/<authority-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# List fiscal years
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/FiscalYears" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count fiscal years
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/FiscalYears/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get fiscal year
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/FiscalYears/<year-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create fiscal year
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/FiscalYears" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "FY2026",
    "Description": "Fiscal Year 2026",
    "StartDate": "2026-01-01T00:00:00Z",
    "EndDate": "2026-12-31T23:59:59Z",
    "Closed": false
  }'

# Update fiscal year
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/FiscalYears/<year-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete fiscal year
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/FiscalYears/<year-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# Create fiscal period
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalPeriods" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update fiscal period
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalPeriods/<period-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete fiscal period
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalPeriods/<period-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# Create fiscal regime
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalRegimes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update fiscal regime
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalRegimes/<regime-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete fiscal regime
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalRegimes/<regime-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# Create fiscal responsibility
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilities" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete fiscal responsibility
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilities/<resp-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update fiscal responsibility
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilities/<resp-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Fiscal responsibility records
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilityRecords" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilityRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilityRecords/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Fiscal identification types
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/IdentificationTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/IdentificationTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/IdentificationTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
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

**REST API equivalent:**
```bash
# List billing profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/BillingProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count billing profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/BillingProfiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get billing profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/BillingProfiles/<profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create billing profile
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/BillingProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "BusinessName": "Acme Corporation",
    "CommercialName": "Acme Corp",
    "TaxId": "900123456-7",
    "Email": "billing@acme.com",
    "Phone": "+1-555-0100",
    "Address": "123 Main St",
    "PostalCode": "10001",
    "CountryId": "USA",
    "ContactId": "<contact-guid>",
    "FiscalAuthorityId": "<authority-guid>"
  }'

# Update billing profile
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/BillingProfiles/<profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete billing profile
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/BillingProfiles/<profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# List banks
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count banks
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get bank
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create bank
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "First National Bank", "CountryId": "USA"}'

# Update bank
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete bank
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# List bank accounts
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>/Accounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count bank accounts
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>/Accounts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get bank account
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>/Accounts/<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create bank account
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>/Accounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Operating Account",
    "BankAccountNumber": "1234567890",
    "Iban": "US12345678901234567890",
    "Swift": "FNBKUS44",
    "CurrencyId": "<currency-guid>"
  }'

# Update bank account
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>/Accounts/<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete bank account
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>/Accounts/<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# List bank transactions
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Transactions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count bank transactions
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Transactions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get bank transaction
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Transactions/<txn-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create bank transaction
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Transactions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update bank transaction
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Transactions/<txn-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete bank transaction
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Transactions/<txn-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# List bank guarantees
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Guarantees" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count bank guarantees
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Guarantees/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get bank guarantee
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Guarantees/<guarantee-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create bank guarantee
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Guarantees" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update bank guarantee
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Guarantees/<guarantee-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete bank guarantee
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Guarantees/<guarantee-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# List transactions
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Transactions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count transactions
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Transactions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get transaction
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Transactions/<txn-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create transaction
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Transactions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Description": "Software license sale",
    "Price": 500.00,
    "Quantity": 10,
    "CurrencyId": "<currency-guid>",
    "TransactionCategoryId": "<category-guid>"
  }'

# Update transaction
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Transactions/<txn-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete transaction
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Transactions/<txn-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List transaction categories
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TransactionCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count transaction categories
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TransactionCategories/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get transaction category
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TransactionCategories/<cat-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create transaction category
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/TransactionCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update transaction category
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/TransactionCategories/<cat-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete transaction category
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/TransactionCategories/<cat-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# List budgets
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count budgets
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get budget
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/<budget-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create budget
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update budget
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/<budget-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete budget
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/<budget-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Budget account entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/<budget-guid>/AccountEntries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/<budget-guid>/AccountEntries/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/<budget-guid>/AccountEntries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/<budget-guid>/AccountEntries/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/<budget-guid>/AccountEntries/<entry-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# List cost centres
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count cost centres
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get cost centre
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/<cc-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create cost centre
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update cost centre
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/<cc-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete cost centre
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/<cc-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Cost centre groups
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/Groups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/Groups/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/Groups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/Groups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/Groups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/Groups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Cost centre budgets
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/Budgets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/Budgets/<budget-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/Budgets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/Budgets/<budget-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/Budgets/<budget-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# Commissions
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Commissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Commissions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Commissions/<commission-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Commissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Commissions/<commission-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Commissions/<commission-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Payment commissions
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/PaymentCommissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/PaymentCommissions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/PaymentCommissions/<pc-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/PaymentCommissions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/PaymentCommissions/<pc-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/PaymentCommissions/<pc-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Receipts
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Receipts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Receipts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Receipts/<receipt-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Receipts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Receipts/<receipt-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Receipts/<receipt-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Expense Claims

```bash
absuite accounting list expense-claims --TenantId $TENANT_ID
absuite accounting count expense-claims --TenantId $TENANT_ID
absuite accounting get expense-claim --TenantId $TENANT_ID --ExpenseClaimId <claim-guid>
absuite accounting create expense-claim --TenantId $TENANT_ID --ExpenseClaimCreateDto '{
  "Title": "Q2 Travel Expenses",
  "Description": "Business travel April–June",
  "CurrencyId": "<currency-guid>",
  "ContactId": "<contact-guid>"
}'
absuite accounting update expense-claim --TenantId $TENANT_ID --ExpenseClaimId <claim-guid> --ExpenseClaimUpdateDto '{...}'
absuite accounting delete expense-claim --TenantId $TENANT_ID --ExpenseClaimId <claim-guid>
```

**REST API equivalent:**
```bash
# List expense claims
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseClaims" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count expense claims
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseClaims/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get expense claim
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseClaims/<claim-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create expense claim
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseClaims" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update expense claim
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseClaims/<claim-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete expense claim
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseClaims/<claim-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Expense Types

```bash
absuite accounting list expense-types --TenantId $TENANT_ID
absuite accounting count expense-types --TenantId $TENANT_ID
absuite accounting get expense-type --TenantId $TENANT_ID --ExpenseTypeId <type-guid>
absuite accounting create expense-type --TenantId $TENANT_ID --ExpenseTypeCreateDto '{"Name": "Travel", "Description": "Business travel expenses"}'
absuite accounting update expense-type --TenantId $TENANT_ID --ExpenseTypeId <type-guid> --ExpenseTypeUpdateDto '{...}'
absuite accounting delete expense-type --TenantId $TENANT_ID --ExpenseTypeId <type-guid>
```

**REST API equivalent:**
```bash
# List expense types
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count expense types
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseTypes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get expense type
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create expense type
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update expense type
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete expense type
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Billable Line Taxes

```bash
absuite accounting list billable-line-taxes --TenantId $TENANT_ID
absuite accounting count billable-line-taxes --TenantId $TENANT_ID
absuite accounting get billable-line-tax --TenantId $TENANT_ID --BillableLineTaxId <tax-guid>
absuite accounting create billable-line-tax --TenantId $TENANT_ID --BillableLineTaxCreateDto '{...}'
absuite accounting update billable-line-tax --TenantId $TENANT_ID --BillableLineTaxId <tax-guid> --BillableLineTaxUpdateDto '{...}'
absuite accounting delete billable-line-tax --TenantId $TENANT_ID --BillableLineTaxId <tax-guid>
```

**REST API equivalent:**
```bash
# List billable line taxes
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/BillableLineTaxes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count billable line taxes
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/BillableLineTaxes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get billable line tax
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/BillableLineTaxes/<tax-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create billable line tax
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/BillableLineTaxes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update billable line tax
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/BillableLineTaxes/<tax-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete billable line tax
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/BillableLineTaxes/<tax-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# Grants
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Grants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Grants/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Grants/<grant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Grants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Grants/<grant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Grants/<grant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Loans
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/<loan-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/<loan-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/<loan-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Loan applications
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Applications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Applications/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Applications/<app-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Applications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Applications/<app-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Applications/<app-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Loan Types

```bash
absuite accounting list loan-types --TenantId $TENANT_ID
absuite accounting count loan-types --TenantId $TENANT_ID
absuite accounting get loan-type --TenantId $TENANT_ID --LoanTypeId <type-guid>
absuite accounting create loan-type --TenantId $TENANT_ID --LoanTypeCreateDto '{"Name": "Term Loan", "Description": "Fixed-term business loan"}'
absuite accounting update loan-type --TenantId $TENANT_ID --LoanTypeId <type-guid> --LoanTypeUpdateDto '{...}'
absuite accounting delete loan-type --TenantId $TENANT_ID --LoanTypeId <type-guid>
```

**REST API equivalent:**
```bash
# List loan types
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Types" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count loan types
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Types/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get loan type
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Types/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create loan type
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Types" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update loan type
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Types/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete loan type
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Types/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Bank Profiles

```bash
absuite accounting list bank-profiles --TenantId $TENANT_ID
absuite accounting count bank-profiles --TenantId $TENANT_ID
absuite accounting get bank-profile --TenantId $TENANT_ID --BankProfileId <profile-guid>
absuite accounting create bank-profile --TenantId $TENANT_ID --BankProfileCreateDto '{...}'
absuite accounting update bank-profile --TenantId $TENANT_ID --BankProfileId <profile-guid> --BankProfileUpdateDto '{...}'
absuite accounting delete bank-profile --TenantId $TENANT_ID --BankProfileId <profile-guid>
```

**REST API equivalent:**
```bash
# List bank profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Profiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count bank profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Profiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get bank profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Profiles/<profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create bank profile
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Profiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update bank profile
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Profiles/<profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete bank profile
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/Profiles/<profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# Share classes
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Classes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Classes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Classes/<class-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Classes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Classes/<class-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Classes/<class-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Share issuances
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Issuances" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Issuances/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Issuances/<issuance-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Issuances" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Issuances/<issuance-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Issuances/<issuance-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Share transfers
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Transfers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Transfers/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Transfers/<transfer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Transfers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Transfers/<transfer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Transfers/<transfer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Share transfer reasons
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/TransferReasons" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/TransferReasons/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/TransferReasons/<reason-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/TransferReasons" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/TransferReasons/<reason-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/TransferReasons/<reason-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# List invoice enumeration ranges
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/InvoiceEnumerationRanges" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count invoice enumeration ranges
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/InvoiceEnumerationRanges/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get invoice enumeration range
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/InvoiceEnumerationRanges/<range-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create invoice enumeration range
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/InvoiceEnumerationRanges" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update invoice enumeration range
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/InvoiceEnumerationRanges/<range-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete invoice enumeration range
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/InvoiceEnumerationRanges/<range-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

**REST API equivalent:**
```bash
# List accounting periods
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Periods" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count accounting periods
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Periods/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get accounting period
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Periods/<period-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create accounting period
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Periods" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update accounting period
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Periods/<period-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete accounting period
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Periods/<period-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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

## API Endpoints Quick Reference

All endpoints are prefixed with `$ABSUITE_HOST_URL/api/v2/AccountingService/`.

| Resource Group | Method | Endpoint | Description |
|---|---|---|---|
| **Accounts** | GET | `Accounts` | List all accounts |
| | GET | `Accounts/Count` | Count accounts |
| | GET | `Accounts/{id}` | Get account by ID |
| | GET | `Accounts/{id}/Aggregate` | Get account aggregate/balance |
| | POST | `Accounts` | Create account |
| | PUT | `Accounts/{id}` | Update account |
| | DELETE | `Accounts/{id}` | Delete account |
| | PATCH | `Accounts/{id}` | Patch account |
| | POST | `Accounts/{id}/Balance` | Balance an account |
| | GET | `Accounts/{id}/Children` | List child accounts |
| | POST | `Accounts/{id}/Credits` | Create account credit |
| | GET | `Accounts/{id}/Credits` | List account credits |
| | GET | `Accounts/{id}/Credits/Count` | Count account credits |
| | POST | `Accounts/{id}/Debits` | Create account debit |
| | GET | `Accounts/{id}/Debits` | List account debits |
| | GET | `Accounts/{id}/Debits/Count` | Count account debits |
| | POST | `Accounts/Aggregate` | Aggregate accounts |
| | GET | `Accounts/Aggregate/Balance` | Aggregate accounts balance |
| | GET | `Accounts/Root` | List root accounts |
| | POST | `Accounts/Root/Balance` | Balance root accounts |
| **Account Types** | GET | `Accounts/Types` | List account types |
| | GET | `Accounts/Types/Count` | Count account types |
| | GET | `Accounts/Types/{typeId}` | Get account type |
| | POST | `Accounts/Types` | Create account type |
| | PUT | `Accounts/Types/{typeId}` | Update account type |
| | DELETE | `Accounts/Types/{typeId}` | Delete account type |
| **Account Groups** | GET | `AccountGroups` | List account groups |
| | GET | `AccountGroups/Count` | Count account groups |
| | GET | `AccountGroups/{groupId}` | Get account group |
| | POST | `AccountGroups` | Create account group |
| | PUT | `AccountGroups/{groupId}` | Update account group |
| | DELETE | `AccountGroups/{groupId}` | Delete account group |
| **Account Entries** | GET | `Accounts/{id}/Entries` | List account entries |
| | GET | `Accounts/{id}/Entries/{entryId}` | Get account entry |
| | POST | `Accounts/{id}/Entries` | Create account entry |
| | PUT | `Accounts/{id}/Entries/{entryId}` | Update account entry |
| | DELETE | `Accounts/{id}/Entries/{entryId}` | Delete account entry |
| | GET | `Accounts/{id}/Entries/Credit` | List credit entries |
| | GET | `Accounts/{id}/Entries/Debit` | List debit entries |
| **Account Relations** | GET | `Accounts/Relations` | List account relations |
| | GET | `Accounts/Relations/Count` | Count account relations |
| | POST | `Accounts/Relations` | Create account relation |
| | PUT | `Accounts/Relations/{relId}` | Update account relation |
| | DELETE | `Accounts/Relations/{relId}` | Delete account relation |
| **Charts of Accounts** | GET | `Accounts/ChartsOfAccounts` | List charts of accounts |
| | POST | `Accounts/ChartsOfAccounts/Seed` | Seed chart of accounts from template |
| **Journals** | GET | `Journals` | List journals |
| | GET | `Journals/Count` | Count journals |
| | GET | `Journals/{id}` | Get journal |
| | POST | `Journals` | Create journal |
| | PUT | `Journals/{id}` | Update journal |
| | DELETE | `Journals/{id}` | Delete journal |
| **Journal Entries** | GET | `Journals/{id}/Entries` | List journal entries |
| | GET | `Journals/{id}/Entries/Count` | Count journal entries |
| | GET | `Journals/{id}/Entries/{entryId}` | Get journal entry |
| | POST | `Journals/{id}/Entries` | Create journal entry |
| | PUT | `Journals/{id}/Entries/{entryId}` | Update journal entry |
| | DELETE | `Journals/{id}/Entries/{entryId}` | Delete journal entry |
| **Journal Types** | GET | `Journals/Types` | List journal types |
| | GET | `Journals/Types/Count` | Count journal types |
| | GET | `Journals/Types/{typeId}` | Get journal type |
| | POST | `Journals/Types` | Create journal type |
| | PUT | `Journals/Types/{typeId}` | Update journal type |
| | DELETE | `Journals/Types/{typeId}` | Delete journal type |
| **Ledgers** | GET | `Ledgers` | List ledgers |
| | GET | `Ledgers/Count` | Count ledgers |
| | GET | `Ledgers/{id}` | Get ledger |
| | POST | `Ledgers` | Create ledger |
| | PUT | `Ledgers/{id}` | Update ledger |
| | DELETE | `Ledgers/{id}` | Delete ledger |
| **Ledger Types** | GET | `Ledgers/Types` | List ledger types |
| | GET | `Ledgers/Types/Count` | Count ledger types |
| | GET | `Ledgers/Types/{typeId}` | Get ledger type |
| | POST | `Ledgers/Types` | Create ledger type |
| | PUT | `Ledgers/Types/{typeId}` | Update ledger type |
| | DELETE | `Ledgers/Types/{typeId}` | Delete ledger type |
| **Financial Books** | GET | `FinancialBooks` | List financial books |
| | GET | `FinancialBooks/Count` | Count financial books |
| | GET | `FinancialBooks/{id}` | Get financial book |
| | POST | `FinancialBooks` | Create financial book |
| | PUT | `FinancialBooks/{id}` | Update financial book |
| | DELETE | `FinancialBooks/{id}` | Delete financial book |
| **Tax Policies** | GET | `TaxPolicies` | List tax policies |
| | GET | `TaxPolicies/Count` | Count tax policies |
| | GET | `TaxPolicies/{id}` | Get tax policy |
| | POST | `TaxPolicies` | Create tax policy |
| | PUT | `TaxPolicies/{id}` | Update tax policy |
| | DELETE | `TaxPolicies/{id}` | Delete tax policy |
| **Tax Rates** | GET | `TaxPolicies/{id}/TaxRates` | List tax rates |
| | GET | `TaxPolicies/{id}/TaxRates/Count` | Count tax rates |
| | GET | `TaxPolicies/{id}/TaxRates/{rateId}` | Get tax rate |
| | POST | `TaxPolicies/{id}/TaxRates` | Create tax rate |
| | PUT | `TaxPolicies/{id}/TaxRates/{rateId}` | Update tax rate |
| | DELETE | `TaxPolicies/{id}/TaxRates/{rateId}` | Delete tax rate |
| **Tax Classes** | GET | `TaxPolicies/{id}/TaxClasses` | List tax classes |
| | GET | `TaxPolicies/{id}/TaxClasses/Count` | Count tax classes |
| | GET | `TaxPolicies/{id}/TaxClasses/{classId}` | Get tax class |
| | POST | `TaxPolicies/{id}/TaxClasses` | Create tax class |
| | PUT | `TaxPolicies/{id}/TaxClasses/{classId}` | Update tax class |
| | DELETE | `TaxPolicies/{id}/TaxClasses/{classId}` | Delete tax class |
| **Applied Tax Records** | GET | `TaxPolicies/{id}/AppliedTaxPolicyRecords` | List applied tax records |
| | GET | `TaxPolicies/{id}/AppliedTaxPolicyRecords/Count` | Count applied tax records |
| | GET | `TaxPolicies/{id}/AppliedTaxPolicyRecords/{recId}` | Get applied tax record |
| | POST | `TaxPolicies/{id}/AppliedTaxPolicyRecords` | Create applied tax record |
| | PUT | `TaxPolicies/{id}/AppliedTaxPolicyRecords/{recId}` | Update applied tax record |
| | DELETE | `TaxPolicies/{id}/AppliedTaxPolicyRecords/{recId}` | Delete applied tax record |
| **Item Tax Records** | GET | `TaxPolicies/{id}/ItemTaxPolicyRecords` | List item tax records |
| | GET | `TaxPolicies/{id}/ItemTaxPolicyRecords/{recId}` | Get item tax record |
| | POST | `TaxPolicies/{id}/ItemTaxPolicyRecords` | Create item tax record |
| | PUT | `TaxPolicies/{id}/ItemTaxPolicyRecords/{recId}` | Update item tax record |
| | DELETE | `TaxPolicies/{id}/ItemTaxPolicyRecords/{recId}` | Delete item tax record |
| **Fiscal Authorities** | GET | `Fiscals/Authorities` | List fiscal authorities |
| | GET | `Fiscals/Authorities/Count` | Count fiscal authorities |
| | GET | `Fiscals/Authorities/{id}` | Get fiscal authority |
| | POST | `Fiscals/Authorities` | Create fiscal authority |
| | PUT | `Fiscals/Authorities/{id}` | Update fiscal authority |
| | DELETE | `Fiscals/Authorities/{id}` | Delete fiscal authority |
| **Fiscal Years** | GET | `FiscalYears` | List fiscal years |
| | GET | `FiscalYears/Count` | Count fiscal years |
| | GET | `FiscalYears/{id}` | Get fiscal year |
| | POST | `FiscalYears` | Create fiscal year |
| | PUT | `FiscalYears/{id}` | Update fiscal year |
| | DELETE | `FiscalYears/{id}` | Delete fiscal year |
| **Fiscal Periods** | POST | `Fiscals/Authorities/FiscalPeriods` | Create fiscal period |
| | PUT | `Fiscals/Authorities/FiscalPeriods/{id}` | Update fiscal period |
| | DELETE | `Fiscals/Authorities/FiscalPeriods/{id}` | Delete fiscal period |
| **Fiscal Regimes** | POST | `Fiscals/Authorities/FiscalRegimes` | Create fiscal regime |
| | PUT | `Fiscals/Authorities/FiscalRegimes/{id}` | Update fiscal regime |
| | DELETE | `Fiscals/Authorities/FiscalRegimes/{id}` | Delete fiscal regime |
| **Fiscal Responsibilities** | POST | `Fiscals/Authorities/FiscalResponsibilities` | Create fiscal responsibility |
| | PUT | `Fiscals/Authorities/FiscalResponsibilities/{id}` | Update fiscal responsibility |
| | DELETE | `Fiscals/Authorities/FiscalResponsibilities/{id}` | Delete fiscal responsibility |
| **Fiscal Resp. Records** | POST | `Fiscals/Authorities/FiscalResponsibilityRecords` | Create responsibility record |
| | PUT | `Fiscals/Authorities/FiscalResponsibilityRecords/{id}` | Update responsibility record |
| | DELETE | `Fiscals/Authorities/FiscalResponsibilityRecords/{id}` | Delete responsibility record |
| **Fiscal ID Types** | POST | `Fiscals/Authorities/IdentificationTypes` | Create identification type |
| | PUT | `Fiscals/Authorities/IdentificationTypes/{id}` | Update identification type |
| | DELETE | `Fiscals/Authorities/IdentificationTypes/{id}` | Delete identification type |
| **Billing Profiles** | GET | `BillingProfiles` | List billing profiles |
| | GET | `BillingProfiles/Count` | Count billing profiles |
| | GET | `BillingProfiles/{id}` | Get billing profile |
| | POST | `BillingProfiles` | Create billing profile |
| | PUT | `BillingProfiles/{id}` | Update billing profile |
| | DELETE | `BillingProfiles/{id}` | Delete billing profile |
| **Banks** | GET | `Banking` | List banks |
| | GET | `Banking/Count` | Count banks |
| | GET | `Banking/{id}` | Get bank |
| | POST | `Banking` | Create bank |
| | PUT | `Banking/{id}` | Update bank |
| | DELETE | `Banking/{id}` | Delete bank |
| **Bank Accounts** | GET | `Banking/{bankId}/Accounts` | List bank accounts |
| | GET | `Banking/{bankId}/Accounts/Count` | Count bank accounts |
| | GET | `Banking/{bankId}/Accounts/{id}` | Get bank account |
| | POST | `Banking/{bankId}/Accounts` | Create bank account |
| | PUT | `Banking/{bankId}/Accounts/{id}` | Update bank account |
| | DELETE | `Banking/{bankId}/Accounts/{id}` | Delete bank account |
| **Bank Transactions** | GET | `Banking/Transactions` | List bank transactions |
| | GET | `Banking/Transactions/Count` | Count bank transactions |
| | GET | `Banking/Transactions/{id}` | Get bank transaction |
| | POST | `Banking/Transactions` | Create bank transaction |
| | PUT | `Banking/Transactions/{id}` | Update bank transaction |
| | DELETE | `Banking/Transactions/{id}` | Delete bank transaction |
| **Bank Guarantees** | GET | `Banking/Guarantees` | List bank guarantees |
| | GET | `Banking/Guarantees/Count` | Count bank guarantees |
| | GET | `Banking/Guarantees/{id}` | Get bank guarantee |
| | POST | `Banking/Guarantees` | Create bank guarantee |
| | PUT | `Banking/Guarantees/{id}` | Update bank guarantee |
| | DELETE | `Banking/Guarantees/{id}` | Delete bank guarantee |
| **Bank Profiles** | GET | `Banking/Profiles` | List bank profiles |
| | GET | `Banking/Profiles/Count` | Count bank profiles |
| | GET | `Banking/Profiles/{id}` | Get bank profile |
| | POST | `Banking/Profiles` | Create bank profile |
| | PUT | `Banking/Profiles/{id}` | Update bank profile |
| | DELETE | `Banking/Profiles/{id}` | Delete bank profile |
| **Transactions** | GET | `Transactions` | List transactions |
| | GET | `Transactions/Count` | Count transactions |
| | GET | `Transactions/{id}` | Get transaction |
| | POST | `Transactions` | Create transaction |
| | PUT | `Transactions/{id}` | Update transaction |
| | DELETE | `Transactions/{id}` | Delete transaction |
| **Transaction Categories** | GET | `TransactionCategories` | List categories |
| | GET | `TransactionCategories/Count` | Count categories |
| | GET | `TransactionCategories/{id}` | Get category |
| | POST | `TransactionCategories` | Create category |
| | PUT | `TransactionCategories/{id}` | Update category |
| | DELETE | `TransactionCategories/{id}` | Delete category |
| **Budgets** | GET | `Budgets` | List budgets |
| | GET | `Budgets/{id}` | Get budget |
| | POST | `Budgets` | Create budget |
| | PUT | `Budgets/{id}` | Update budget |
| | DELETE | `Budgets/{id}` | Delete budget |
| **Budget Account Entries** | GET | `Budgets/{id}/AccountEntries` | List budget entries |
| | GET | `Budgets/{id}/AccountEntries/{entryId}` | Get budget entry |
| | POST | `Budgets/{id}/AccountEntries` | Create budget entry |
| | PUT | `Budgets/{id}/AccountEntries/{entryId}` | Update budget entry |
| | DELETE | `Budgets/{id}/AccountEntries/{entryId}` | Delete budget entry |
| **Cost Centres** | GET | `CostCentres` | List cost centres |
| | GET | `CostCentres/Count` | Count cost centres |
| | GET | `CostCentres/{id}` | Get cost centre |
| | POST | `CostCentres` | Create cost centre |
| | PUT | `CostCentres/{id}` | Update cost centre |
| | DELETE | `CostCentres/{id}` | Delete cost centre |
| **Cost Centre Groups** | GET | `CostCentres/Groups` | List cost centre groups |
| | GET | `CostCentres/Groups/Count` | Count groups |
| | GET | `CostCentres/Groups/{id}` | Get group |
| | POST | `CostCentres/Groups` | Create group |
| **Cost Centre Budgets** | GET | `CostCentres/Budgets` | List cost centre budgets |
| | GET | `CostCentres/Budgets/{id}` | Get cost centre budget |
| | POST | `CostCentres/Budgets` | Create cost centre budget |
| **Commissions** | GET | `Commissions` | List commissions |
| | GET | `Commissions/Count` | Count commissions |
| | GET | `Commissions/{id}` | Get commission |
| | POST | `Commissions` | Create commission |
| | PUT | `Commissions/{id}` | Update commission |
| | DELETE | `Commissions/{id}` | Delete commission |
| **Payment Commissions** | GET | `PaymentCommissions` | List payment commissions |
| | GET | `PaymentCommissions/Count` | Count payment commissions |
| | GET | `PaymentCommissions/{id}` | Get payment commission |
| | POST | `PaymentCommissions` | Create payment commission |
| **Receipts** | GET | `Receipts` | List receipts |
| | GET | `Receipts/Count` | Count receipts |
| | GET | `Receipts/{id}` | Get receipt |
| | POST | `Receipts` | Create receipt |
| | PUT | `Receipts/{id}` | Update receipt |
| | DELETE | `Receipts/{id}` | Delete receipt |
| **Grants** | GET | `Grants` | List grants |
| | GET | `Grants/Count` | Count grants |
| | GET | `Grants/{id}` | Get grant |
| | POST | `Grants` | Create grant |
| | PUT | `Grants/{id}` | Update grant |
| | DELETE | `Grants/{id}` | Delete grant |
| **Loans** | GET | `Loans` | List loans |
| | GET | `Loans/Count` | Count loans |
| | GET | `Loans/{id}` | Get loan |
| | POST | `Loans` | Create loan |
| | PUT | `Loans/{id}` | Update loan |
| | DELETE | `Loans/{id}` | Delete loan |
| **Loan Applications** | GET | `Loans/Applications` | List loan applications |
| | GET | `Loans/Applications/Count` | Count loan applications |
| | GET | `Loans/Applications/{id}` | Get loan application |
| | POST | `Loans/Applications` | Create loan application |
| | PUT | `Loans/Applications/{id}` | Update loan application |
| | DELETE | `Loans/Applications/{id}` | Delete loan application |
| **Loan Types** | GET | `Loans/Types` | List loan types |
| | GET | `Loans/Types/Count` | Count loan types |
| | GET | `Loans/Types/{id}` | Get loan type |
| | POST | `Loans/Types` | Create loan type |
| | PUT | `Loans/Types/{id}` | Update loan type |
| | DELETE | `Loans/Types/{id}` | Delete loan type |
| **Share Classes** | GET | `Shares/Classes` | List share classes |
| | GET | `Shares/Classes/Count` | Count share classes |
| | GET | `Shares/Classes/{id}` | Get share class |
| | POST | `Shares/Classes` | Create share class |
| | PUT | `Shares/Classes/{id}` | Update share class |
| | DELETE | `Shares/Classes/{id}` | Delete share class |
| **Share Issuances** | GET | `Shares/Issuances` | List share issuances |
| | GET | `Shares/Issuances/Count` | Count share issuances |
| | GET | `Shares/Issuances/{id}` | Get share issuance |
| | POST | `Shares/Issuances` | Create share issuance |
| **Share Transfers** | GET | `Shares/Transfers` | List share transfers |
| | GET | `Shares/Transfers/Count` | Count share transfers |
| | GET | `Shares/Transfers/{id}` | Get share transfer |
| | POST | `Shares/Transfers` | Create share transfer |
| **Share Transfer Reasons** | GET | `Shares/TransferReasons` | List transfer reasons |
| | GET | `Shares/TransferReasons/Count` | Count transfer reasons |
| | GET | `Shares/TransferReasons/{id}` | Get transfer reason |
| | POST | `Shares/TransferReasons` | Create transfer reason |
| **Invoice Enum. Ranges** | GET | `InvoiceEnumerationRanges` | List ranges |
| | GET | `InvoiceEnumerationRanges/Count` | Count ranges |
| | GET | `InvoiceEnumerationRanges/{id}` | Get range |
| | POST | `InvoiceEnumerationRanges` | Create range |
| | PUT | `InvoiceEnumerationRanges/{id}` | Update range |
| | DELETE | `InvoiceEnumerationRanges/{id}` | Delete range |
| **Accounting Periods** | GET | `Periods` | List periods |
| | GET | `Periods/Count` | Count periods |
| | GET | `Periods/{id}` | Get period |
| | POST | `Periods` | Create period |
| | PUT | `Periods/{id}` | Update period |
| | DELETE | `Periods/{id}` | Delete period |
| **Expense Claims** | GET | `ExpenseClaims` | List expense claims |
| | GET | `ExpenseClaims/Count` | Count expense claims |
| | GET | `ExpenseClaims/{id}` | Get expense claim |
| | POST | `ExpenseClaims` | Create expense claim |
| | PUT | `ExpenseClaims/{id}` | Update expense claim |
| | DELETE | `ExpenseClaims/{id}` | Delete expense claim |
| **Expense Types** | GET | `ExpenseTypes` | List expense types |
| | GET | `ExpenseTypes/Count` | Count expense types |
| | GET | `ExpenseTypes/{id}` | Get expense type |
| | POST | `ExpenseTypes` | Create expense type |
| | PUT | `ExpenseTypes/{id}` | Update expense type |
| | DELETE | `ExpenseTypes/{id}` | Delete expense type |
| **Billable Line Taxes** | GET | `BillableLines/{lineId}/Taxes` | List taxes for a billable line |
| | GET | `BillableLines/{lineId}/Taxes/Count` | Count taxes for a billable line |
| | POST | `BillableLines/{lineId}/Taxes` | Create tax on billable line |
| | PUT | `BillableLines/{lineId}/Taxes/{taxId}` | Update billable line tax |
| | DELETE | `BillableLines/{lineId}/Taxes/{taxId}` | Delete billable line tax |

---

## Critical Rules

- **Authenticate first.** Use `absuite login` before any accounting operation, or include a valid bearer token for REST API calls.
- **Always provide a tenant context.** Set a default with `absuite config set --tenant-id` or pass `--TenantId` on each CLI call. REST API calls are tenant-scoped via the bearer token.
- **Use `--help` before unfamiliar commands.** The accounting service has 170+ commands with varied DTOs.
- **Double-entry principle** — journal entries must balance (Debit = Credit).
- **Set up fiscal framework first** — create fiscal authority → fiscal year → tax policies before posting entries.
- **Create chart of accounts before entries** — you need account IDs to create entries and journal entries.
