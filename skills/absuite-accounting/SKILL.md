---
name: absuite-accounting
description: >
  Manage the full accounting system in the Alliance Business Suite (ABS) via the REST API.
  Covers chart of accounts, account entries (debits/credits), account groups/types/relations,
  journals and journal entries, ledgers, financial books, tax classes/policies/rates, fiscal
  authorities/years/periods/regimes/responsibilities/identification-types, billing profiles,
  banks/bank-accounts/guarantees/transactions, budgets, cost centres, commissions, receipts,
  grants, loans, shares, expense claims/types, accounting periods, and invoice enumeration
  ranges, including atomic PATCH (JSON Patch) updates. All operations are tenant-scoped and
  require a bearer token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Accounting Skill (REST)

Manage accounting through the ABS REST API under the `AccountingService`. This is the largest
ABS service (~200 endpoints across 24 controllers). Every endpoint is tenant-scoped: pass
`?tenantId=<tenant-guid>` (or the equivalent `X-TenantId: <tenant-guid>` header) on **every**
request including writes (POST/PUT/PATCH/DELETE). Omitting it on a write returns `400`.

> For the CLI equivalent see `absuite-accounting-cli`; for general REST conventions see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select` — page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource** — it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) causes silent data loss.
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902) — it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

## Authentication

1. **Obtain a bearer token:**
   ```bash
   curl -X POST "$ABSUITE_HOST_URL/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "<email>", "password": "<password>"}'
   ```
   Extract `accessToken` from the JSON response.

2. **Send it on every request:**
   ```bash
   -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
   ```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/AccountingService/<Resource>`

4. **Response envelope** — every response is wrapped:
   ```json
   { "isSuccess": true, "errorMessage": null, "correlationId": "...", "timestamp": "...", "result": <data|array|int|null> }
   ```
   Always check `isSuccess`; read the payload from `result`.

5. **Tenant scoping** — every `AccountingService` endpoint declares `tenantId(query,req)` **except**
   `GET /Accounts/ChartsOfAccounts` (no tenant param — global catalog of available charts). Pass
   `?tenantId=<tenant-guid>` everywhere else. The query param and the `X-TenantId` header are
   interchangeable; examples below use the query param.

6. **Optional params present on most endpoints:** `api-version` (query) and `x-api-version` (header).
   They are optional and omitted from the examples below for brevity.

## Key Concepts

- **Account** — a node in the chart of accounts. `accountCategory` ∈ `Assets | Equity | Revenue | Expense | Liabilities`. Hierarchical via `parentAccountId`. `group: true` marks summary accounts; `frozen: true` blocks posting.
- **Account Group / Account Type / Account Relation** — classification, typing, and inter-account links.
- **Account Entry** — a debit or credit posting. `accountingEntryType` ∈ `None | Debit | Credit`. Carries `debitAccountId` / `creditAccountId`, `amount`, `currencyId`, and optional `journalEntryId`.
- **Journal / Journal Entry** — a journal groups double-entry records (`debit` + `credit` against `debitAccountId` / `creditAccountId`); typed by **Journal Type**; filed in a **Ledger**.
- **Ledger / Ledger Type** — ledger groups journals; ledger type carries `ledgerClass` ∈ `Assets | Equity | Gains | Losses | Revenue | Expenses | Liabilities`.
- **Financial Book** — a named collection of financial records.
- **Tax Class** — `type` ∈ `Tax | Withholding`, scoped to a fiscal authority.
- **Tax Policy** — a tax rule with `percentage` and/or fixed `value`; flags `isEnabled`, `isDefault`, `withholding`, `zero`, `reduced`, `isFree`, `allowInternational`. Has nested **Applied Tax Policy Records** and **Item Tax Policy Records**.
- **Tax Rate** — `rate` / `value` with priority, compounding, thresholds, tied to a tax policy/class/authority.
- **Fiscal Authority** — a tax/regulatory body; parent of **Fiscal Years**, **Fiscal Periods**, **Fiscal Regimes**, **Fiscal Responsibilities** (+ records), **Identification Types**, and **Enumeration Ranges**.
- **Invoice Enumeration Range** — an authorized numbering range; `documentType` ∈ `Standard | DebitNote | CreditNote`.
- **Billing Profile** — tax/address identity for invoicing; `taxPayerType` ∈ `Individual | Business`.
- **Bank** — parent of **Bank Accounts** (IBAN/SWIFT), **Bank Guarantees** (`bankGuaranteeType` ∈ `Receiving | Providing`), and **Bank Transactions**.
- **Budget** — a plan tied to a fiscal year; parent of **Budget Account Entries**.
- **Cost Centre** — `costCentreType` ∈ `Service | Production`; with **Cost Centre Budgets** and **Cost Centre Groups**.
- **Commission / Payment Commission** — sales/payment commission records.
- **Receipt** — `receiptType` ∈ `PaymentReceipt | PurchaseReceipt`; `costCalculationMethod` ∈ `Automatic | Custom`; `taxCalculationMethod` ∈ `Included | Excluded`.
- **Loan** — with **Loan Types** and **Loan Applications**.
- **Share** — **Share Classes**, **Share Issuances**, **Share Transfers**, **Share Transfer Reasons**.
- **Grant**, **Expense Claim** / **Expense Type**, **Accounting Period**, **Transaction** / **Transaction Category**.

---

## Accounts (Chart of Accounts)

### List / count / root / children

```bash
# List accounts
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count accounts
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Root accounts
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Root?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Child accounts of a parent
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Children?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get / create / update / patch / delete

```bash
# Get account details
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create account (AccountCreateDto). Required: Name, CurrencyId, AccountCategory.
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Accounts Receivable",
    "Code": "1200",
    "AccountCategory": "Assets",
    "CurrencyId": "<currency-guid>",
    "AccountTypeId": "<account-type-guid>",
    "ParentAccountId": "<parent-account-guid>",
    "ContactId": "<contact-guid>",
    "Group": false,
    "Frozen": false,
    "Prefix": "12",
    "Path": "1.12"
  }'

# Update account (PUT, AccountUpdateDto). Required: Name, CurrencyId.
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name": "Trade Receivables", "CurrencyId": "<currency-guid>", "Frozen": false}'

# Patch account (JSON Patch — see PATCH section)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/frozen", "value": true}]'

# Delete account
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**AccountCreateDto / AccountUpdateDto fields:** `group` (bool), `frozen` (bool), `name` (REQ), `code`, `path`, `prefix`, `currencyId` (REQ), `contactId`, `accountTypeId`, `parentAccountId`, `accountCategory` (`Assets|Equity|Revenue|Expense|Liabilities`; REQ on create).

### Aggregate & balance actions

```bash
# Account aggregate (POST a JSON array of AccountDto; optional ?currencyId= to convert)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Aggregate?tenantId=<tenant-guid>&currencyId=<currency-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"id": "<account-guid>"}]'

# Aggregate accounts balance (GET; optional ?currencyId=)
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Aggregate/Balance?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Balance a single account
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Balance?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Balance all root accounts (cascading)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Root/Balance?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Charts of accounts

```bash
# List available charts of accounts (NO tenantId — global catalog)
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/ChartsOfAccounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Seed a chart of accounts into the tenant (SeedChartOfAccountsRequest: { "fileUrl": "..." })
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/ChartsOfAccounts/Seed?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileUrl": "<chart-of-accounts-file-url>"}'
```

## Account Entries (Debits & Credits)

Entries are nested under an account. The same `AccountingEntryCreateDto` body serves the generic
`/Entries`, `/Debits`, and `/Credits` create endpoints.

```bash
# List entries / debits / credits for an account
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Debits?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Credits?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Debit-only / credit-only entry views
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries/Debit?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries/Credit?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Counts
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Debits/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Credits/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create an entry (AccountingEntryCreateDto). Required: Description, CurrencyId.
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Description": "Client payment received",
    "Date": "2026-04-19T00:00:00Z",
    "Amount": 5000.00,
    "CurrencyId": "<currency-guid>",
    "DebitAccountId": "<bank-account-guid>",
    "CreditAccountId": "<receivables-account-guid>",
    "AccountingEntryType": "Debit",
    "JournalEntryId": "<journal-entry-guid>"
  }'

# Create explicit debit / credit (same DTO)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Debits?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Description": "Office supplies", "Date": "2026-04-19T00:00:00Z", "Amount": 250.00, "CurrencyId": "<currency-guid>"}'
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Credits?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Description": "Vendor refund", "Date": "2026-04-19T00:00:00Z", "Amount": 100.00, "CurrencyId": "<currency-guid>"}'

# Get / update / patch / delete a single entry
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries/<entry-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries/<entry-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Description": "Adjusted", "Amount": 4900.00, "CurrencyId": "<currency-guid>", "AccountingEntryType": "Debit"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries/<entry-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/amount", "value": 4900.00}]'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Entries/<entry-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**AccountingEntryCreateDto fields:** `description` (REQ), `date`, `amount` (number), `currencyId` (REQ), `debitAccountId`, `creditAccountId`, `journalEntryId`, `accountingEntryType` (`None|Debit|Credit`). **UpdateDto** drops the required flags and adds nothing else.

## Account Types

Account types live under `/Accounts/Types`.

```bash
# List / count
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get / create / update / patch / delete
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Current Asset", "Description": "Short-term assets"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Current Asset (Updated)"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/name", "value": "Current Asset (Updated)"}]'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Types/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**AccountTypeCreateDto / UpdateDto fields:** `name`, `description`.

## Account Relations

Account relations live under `/Accounts/Relations` and additionally require `?accountId=<account-guid>` (query, required) on **every** verb (it is NOT a path segment).

```bash
# List / count (note: tenantId AND accountId required)
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Relations?tenantId=<tenant-guid>&accountId=<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Relations/Count?tenantId=<tenant-guid>&accountId=<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create / update / patch / delete (accountId query param required throughout)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Relations?tenantId=<tenant-guid>&accountId=<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"AccountId": "<related-account-guid>", "Type": "<relation-type>"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Relations/<relation-guid>?tenantId=<tenant-guid>&accountId=<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"AccountId": "<related-account-guid>", "Type": "<relation-type>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Relations/<relation-guid>?tenantId=<tenant-guid>&accountId=<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/type", "value": "<relation-type>"}]'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Relations/<relation-guid>?tenantId=<tenant-guid>&accountId=<account-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**AccountRelationCreateDto / UpdateDto fields:** `accountId`, `type`.

## Account Groups

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Title": "Operating Expenses", "Description": "Day-to-day expenses", "ParentAccountGroupId": "<parent-group-guid>"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Title": "OpEx", "Description": "..."}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/title", "value": "OpEx"}]'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**AccountGroupCreateDto / UpdateDto fields:** `title`, `description`, `parentAccountGroupId`.

## Accounting Periods

`/AccountingPeriods` — list / count / get / create / update / **patch** / delete.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountingPeriods?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Q1 2026", "DateStart": "2026-01-01T00:00:00Z", "DateEnd": "2026-03-31T23:59:59Z"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/AccountingPeriods/<period-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/name", "value": "Q1 2026 (revised)"}]'
```

**AccountingPeriodCreateDto fields:** `name`, `dateStart`, `dateEnd`. **UpdateDto** same minus ids.

---

## Journals & Journal Entries

```bash
# List / count / get journals
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create journal (JournalCreateDto). Required: Name.
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "Name": "General Journal - April 2026",
    "Description": "Monthly general journal",
    "DateTime": "2026-04-01T00:00:00Z",
    "JournalTypeId": "<journal-type-guid>",
    "LedgerId": "<ledger-guid>",
    "ParentJournalId": "<parent-journal-guid>"
  }'

# Update / patch / delete journal
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "General Journal (rev)", "JournalTypeId": "<journal-type-guid>", "LedgerId": "<ledger-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/description", "value": "Closed period"}]'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**JournalCreateDto fields:** `name` (REQ), `description`, `dateTime`, `parentJournalId`, `journalTypeId`, `ledgerId`. **UpdateDto** same minus ids.

### Journal Entries (double-entry)

```bash
# List / count entries; aggregate credits / debits
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries/Aggregate/Credits?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries/Aggregate/Debits?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create journal entry (JournalEntryCreateDto). Required: Description, Date, JournalId, CurrencyId, DebitAccountId, CreditAccountId.
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "Description": "Record client payment",
    "Date": "2026-04-19T00:00:00Z",
    "Debit": 5000.00,
    "Credit": 5000.00,
    "JournalId": "<journal-guid>",
    "CurrencyId": "<currency-guid>",
    "DebitAccountId": "<cash-account-guid>",
    "CreditAccountId": "<receivables-account-guid>",
    "InvoiceCode": "<invoice-code>",
    "Opening": false,
    "Group": false,
    "ParentJournalEntryId": "<parent-entry-guid>"
  }'

# Update / patch / delete entry
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries/<entry-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Description": "Revised", "Date": "2026-04-19T00:00:00Z", "JournalId": "<journal-guid>", "CurrencyId": "<currency-guid>", "DebitAccountId": "<cash-account-guid>", "CreditAccountId": "<receivables-account-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries/<entry-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/debit", "value": 4900.00}]'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries/<entry-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**JournalEntryCreateDto fields:** `group` (bool), `opening` (bool), `description` (REQ), `date` (REQ), `debit` (number), `credit` (number), `journalId` (REQ), `currencyId` (REQ), `debitAccountId` (REQ), `creditAccountId` (REQ), `parentJournalEntryId`, `invoiceCode`.

### Journal Types

`/JournalTypes` — list / count / get / create / update / **patch** / delete. **CreateDto:** `name`. **UpdateDto:** `name`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/JournalTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Sales Journal"}'
```

---

## Ledgers & Ledger Types

```bash
# Ledgers: list / count / get / create / update / patch / delete
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Ledgers?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "General Ledger", "Description": "Primary ledger", "DateTime": "2026-01-01T00:00:00Z", "LedgerTypeId": "<ledger-type-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Ledgers/<ledger-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/name", "value": "GL"}]'

# Ledger Types: list / count / get / create / update / patch / delete
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/LedgerTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Asset Ledger", "LedgerClass": "Assets"}'
```

**CreateLedgerDto fields:** `name`, `description`, `dateTime`, `ledgerTypeId`. **UpdateLedgerDto:** `name`, `description`, `ledgerTypeId`.
**LedgerTypeCreateDto / UpdateDto:** `name` (REQ on create), `ledgerClass` (`Assets|Equity|Gains|Losses|Revenue|Expenses|Liabilities`).

---

## Financial Books

`/FinancialBooks` — list / count / get / create / update / **patch** / delete. **CreateDto:** `name` (REQ), `description`. **UpdateDto:** `name`, `description`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/FinancialBooks?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "FY2026 Book", "Description": "Records for fiscal year 2026"}'
```

---

## Tax Classes

`/TaxClasses` — list / count / get / create / update / **patch** / delete. Path id param is `{id}`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxClasses?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Standard", "Type": "Tax", "FiscalAuthorityId": "<authority-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxClasses/<class-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/type", "value": "Withholding"}]'
```

**TaxClassCreateDto / UpdateDto fields:** `name`, `type` (`Tax|Withholding`), `fiscalAuthorityId`.

## Tax Policies

`/TaxPolicies` — list / count / get / create / update / **patch** / delete; plus `ByAuthority/{authorityId}`. Path id param is `{id}`.

```bash
# List / by-authority
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/ByAuthority/<authority-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "Code": "VAT-19",
    "Title": "Standard VAT 19%",
    "Description": "Standard value-added tax",
    "Percentage": 19.0,
    "Value": 0,
    "IsEnabled": true,
    "IsDefault": false,
    "Withholding": false,
    "Zero": false,
    "Reduced": false,
    "IsFree": false,
    "AllowInternational": false,
    "CurrencyId": "<currency-guid>",
    "CountryId": "<country-guid>",
    "FiscalAuthorityId": "<authority-guid>"
  }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/isDefault", "value": true}]'
```

**TaxPolicyCreateDto / UpdateDto fields:** `code`, `title`, `description`, `isFree` (bool), `reduce` (bool), `isEnabled` (bool), `isDefault` (bool), `allowInternational` (bool), `hours`/`days`/`weeks`/`months`/`years` (int), `value` (number), `percentage` (number), `currencyId`, `countryId`, `countryStateId`, `customState`, `customCity`, `cityId`, `zero` (bool), `reduced` (bool), `withholding` (bool), `fiscalAuthorityId`.

> Note: `percentage` is a whole number (e.g. `19.0` = 19%).

### Applied Tax Policy Records (nested under a tax policy)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/AppliedTaxPolicyRecords?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/AppliedTaxPolicyRecords/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/AppliedTaxPolicyRecords?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"TaxPolicyId": "<policy-guid>", "InvoiceId": "<invoice-guid>", "ItemId": "<item-guid>", "TaxAmountInUSD": 19.0, "TaxBaseAmountInUSD": 100.0}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/AppliedTaxPolicyRecords/<record-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/taxAmountInUSD", "value": 18.5}]'
# Also: GET .../<record-guid>, PUT .../<record-guid>, DELETE .../<record-guid>
```

**AppliedTaxPolicyRecordCreateDto / UpdateDto fields:** `taxPolicyId`, `invoiceId`, `itemId`, `taxAmountInUSD` (number), `taxBaseAmountInUSD` (number).

### Item Tax Policy Records (nested under a tax policy)

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/ItemTaxPolicyRecords?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"TaxPolicyId": "<policy-guid>", "ItemPriceId": "<item-price-guid>", "ItemId": "<item-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxPolicies/<policy-guid>/ItemTaxPolicyRecords/<record-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/itemId", "value": "<item-guid>"}]'
# Also: GET (list + by-id), PUT, DELETE under the same base path.
```

**ItemTaxPolicyRecordCreateDto / UpdateDto fields:** `taxPolicyId`, `itemPriceId`, `itemId`.

## Tax Rates

`/TaxRates` — list / count / get / create / update / **patch** / delete. Path id param is `{id}`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/TaxRates?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "Name": "VAT 19%",
    "Rate": 19.0,
    "Value": 0,
    "Priority": 1,
    "Compound": false,
    "Shipping": false,
    "Withholding": false,
    "TaxPolicyId": "<policy-guid>",
    "TaxClassId": "<class-guid>",
    "FiscalAuthorityId": "<authority-guid>",
    "CountryId": "<country-guid>",
    "CurrencyId": "<currency-guid>"
  }'
```

**TaxRateCreateDto / UpdateDto fields:** `name`, `rate` (number), `value` (number), `um`, `unitId`, `unitGroupId`, `priority` (int), `compound` (bool), `shipping` (bool), `withholding` (bool), `singleTransactionThreshold` (number), `cumulativeTransactionThreshold` (number), `fiscalAuthorityId`, `fiscalYearId`, `countryId`, `taxClassId`, `currencyId`, `taxPolicyId`.

## Billable Line Taxes (nested under a billable line)

`/BillableLines/{billableLineId}/Taxes` — list / count / create / update / **patch** / delete (no list-item GET).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/BillableLines/<billable-line-guid>/Taxes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/BillableLines/<billable-line-guid>/Taxes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"TaxPolicyId": "<policy-guid>", "InvoiceId": "<invoice-guid>", "ItemId": "<item-guid>", "TaxAmountInUSD": 19.0, "TaxBaseAmountInUSD": 100.0, "BillingItemRecordId": "<billing-item-record-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/BillableLines/<billable-line-guid>/Taxes/<tax-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/taxAmountInUSD", "value": 18.5}]'
```

**AppliedItemTaxRecordCreateDto / UpdateDto fields:** `taxPolicyId`, `invoiceId`, `itemId`, `taxAmountInUSD` (number), `taxBaseAmountInUSD` (number), `billingItemRecordId`.

---

## Fiscal Framework

### Fiscal Authorities

`/Fiscals/Authorities` — list / count / get / create / update / **patch** / delete.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "<authority-name>", "Description": "<description>", "CountryId": "<country-guid>", "LogoUrl": "<logo-url>", "WebUrl": "<web-url>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/<authority-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/webUrl", "value": "<web-url>"}]'
```

**FiscalAuthorityCreateDto / UpdateDto fields:** `name`, `description`, `countryId`, `logoUrl`, `webUrl`.

### Fiscal Years

Two access paths exist. The standalone `/FiscalYears` controller is the simplest:

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/FiscalYears?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/FiscalYears/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/FiscalYears/<year-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/FiscalYears?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "FY2026", "Description": "Fiscal Year 2026", "StartDate": "2026-01-01T00:00:00Z", "EndDate": "2026-12-31T23:59:59Z", "Closed": false, "FiscalAuthorityId": "<authority-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/FiscalYears/<year-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/closed", "value": true}]'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/AccountingService/FiscalYears/<year-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Authority-scoped reads + write paths (`FiscalAuthorityYears` controller):

```bash
# Reads scoped to an authority (note: also requires ?fiscalAuthorityId= query on the list)
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/<authority-guid>/FiscalYears?tenantId=<tenant-guid>&fiscalAuthorityId=<authority-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/<authority-guid>/FiscalYears/<year-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/<authority-guid>/FiscalYears/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Create / patch / update / delete (flat write paths under Fiscals/Authorities/FiscalYears)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalYears?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "FY2026", "StartDate": "2026-01-01T00:00:00Z", "EndDate": "2026-12-31T23:59:59Z", "Closed": false, "FiscalAuthorityId": "<authority-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalYears/<year-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/closed", "value": true}]'
```

**FiscalYearCreateDto / UpdateDto fields:** `name`, `description`, `closed` (bool), `endDate`, `startDate`, `fiscalAuthorityId`.

### Fiscal Periods

Reads are authority+year scoped; writes are flat under `Fiscals/Authorities/FiscalPeriods`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/<authority-guid>/FiscalYears/<year-guid>/FiscalPeriods?tenantId=<tenant-guid>&fiscalAuthorityId=<authority-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalPeriods?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "January 2026", "FromDate": "2026-01-01T00:00:00Z", "ToDate": "2026-01-31T23:59:59Z", "FiscalYearId": "<year-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalPeriods/<period-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/name", "value": "Jan 2026"}]'
```

**FiscalPeriodCreateDto / UpdateDto fields:** `name`, `fromDate`, `toDate`, `fiscalYearId`.

### Fiscal Regimes

Reads authority-scoped; writes flat under `Fiscals/Authorities/FiscalRegimes`. **CreateDto:** `code`, `name`, `fiscalAuthorityId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalRegimes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Code": "<regime-code>", "Name": "<regime-name>", "FiscalAuthorityId": "<authority-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalRegimes/<regime-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/name", "value": "<regime-name>"}]'
```

### Fiscal Responsibilities & Responsibility Records

```bash
# Responsibilities (reads authority-scoped; writes flat). CreateDto: code, name, fiscalAuthorityId
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilities?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Code": "<resp-code>", "Name": "<resp-name>", "FiscalAuthorityId": "<authority-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilities/<resp-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/name", "value": "<resp-name>"}]'

# Responsibility records (assign a responsibility to a billing profile). CreateDto: fiscalResponsibilityId, billingProfileId
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilityRecords?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"FiscalResponsibilityId": "<resp-guid>", "BillingProfileId": "<profile-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilityRecords/<record-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/billingProfileId", "value": "<profile-guid>"}]'
```

Responsibility records are **read** under the full nested path
`Fiscals/Authorities/{fiscalAuthorityId}/FiscalResponsibilities/{fiscalResponsibilityId}/FiscalResponsibilityRecords[/{id}|/Count]`.

### Fiscal Identification Types

Reads authority-scoped; writes flat. **CreateDto:** `code`, `name`, `fiscalAuthorityId`. **No PATCH** for identification types.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/IdentificationTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Code": "<id-type-code>", "Name": "<id-type-name>", "FiscalAuthorityId": "<authority-guid>"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/IdentificationTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Code": "<id-type-code>", "Name": "<id-type-name>", "FiscalAuthorityId": "<authority-guid>"}'
```

### Invoice Enumeration Ranges (under a fiscal authority)

Reads authority-scoped; writes flat under `Fiscals/Authorities/EnumerationRanges`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/<authority-guid>/EnumerationRanges?tenantId=<tenant-guid>&fiscalAuthorityId=<authority-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/EnumerationRanges?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "Prefix": "FE",
    "Suffix": "",
    "Identifier": "<dian-identifier>",
    "CurrentNumeration": 1,
    "NumerationFrom": 1,
    "NumerationTo": 5000,
    "ValidFrom": "2026-01-01T00:00:00Z",
    "ValidTo": "2027-01-01T00:00:00Z",
    "FiscalAuthorityId": "<authority-guid>",
    "DocumentType": "Standard"
  }'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Fiscals/Authorities/EnumerationRanges/<range-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/currentNumeration", "value": 42}]'
```

**InvoiceEnumerationRangeCreateDto / UpdateDto fields:** `prefix`, `suffix`, `identifier`, `qualifiedName`, `currentNumeration` (int), `numerationFrom` (int), `numerationTo` (int), `validFrom` (REQ on create), `validTo` (REQ on create), `fiscalAuthorityId`, `documentType` (`Standard|DebitNote|CreditNote`).

---

## Invoice Enumeration Ranges (standalone controller)

A separate flat `/InvoiceEnumerationRanges` controller mirrors the same DTO. Path id param is `{rangeId}`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/InvoiceEnumerationRanges?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/InvoiceEnumerationRanges?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Prefix": "FE", "NumerationFrom": 1, "NumerationTo": 5000, "ValidFrom": "2026-01-01T00:00:00Z", "ValidTo": "2027-01-01T00:00:00Z", "FiscalAuthorityId": "<authority-guid>", "DocumentType": "Standard"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/InvoiceEnumerationRanges/<range-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/validTo", "value": "2027-06-30T00:00:00Z"}]'
# Also: GET .../<rangeId>, PUT .../<rangeId>, DELETE .../<rangeId>
```

---

## Billing Profiles

`/BillingProfiles` — list / count / get / create / update / **patch** / delete.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/BillingProfiles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "BusinessName": "<business-name>",
    "CommercialName": "<commercial-name>",
    "TaxId": "<tax-id>",
    "Email": "<billing-email>",
    "Phone": "<phone>",
    "Address": "<address>",
    "PostalCode": "<postal-code>",
    "TaxPayerType": "Business",
    "ContactId": "<contact-guid>",
    "CountryId": "<country-guid>",
    "StateId": "<state-guid>",
    "CityId": "<city-guid>",
    "FiscalIdentificationTypeId": "<id-type-guid>",
    "FiscalAuthorityId": "<authority-guid>",
    "FiscalRegimeId": "<regime-guid>"
  }'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/BillingProfiles/<profile-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/email", "value": "<billing-email>"}]'
```

**BillingProfileCreateDto required fields:** `taxId`, `phone`, `email`, `address`, `postalCode`, `businessName`, `commercialName`, `countryId`, `stateId`, `cityId`, `fiscalIdentificationTypeId`, `fiscalAuthorityId`, `fiscalRegimeId`. **Optional:** `contactId`, `address1`, `address2`, `ticker`, `duns`, `isPublicCompany` (bool), `isFactaCustomer` (bool), `taxPayerType` (`Individual|Business`). **UpdateDto** carries the same fields with no required flags.

### Bank Profiles (read-only)

`/BankProfiles` — list and count only.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/BankProfiles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/BankProfiles/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Banking

### Banks

`/Banking` — list / count / get / create / update / **patch** / delete. **CreateDto:** `name`, `image`, `countryId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "<bank-name>", "Image": "<logo-url>", "CountryId": "<country-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/name", "value": "<bank-name>"}]'
```

### Bank Accounts (nested under a bank)

`/Banking/{bankId}/Accounts` — list / count / get / create / update / **patch** / delete. The sub-resource id path param is `{accountId}`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>/Accounts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>/Accounts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Operating Account", "Iban": "<iban>", "Swift": "<swift>", "BranchCode": "<branch-code>", "BankAccountNumber": "<account-number>", "BankId": "<bank-guid>", "BankProfileId": "<bank-profile-guid>", "WalletId": "<wallet-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>/Accounts/<account-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/name", "value": "Main Operating Account"}]'
```

**BankAccountCreateDto / UpdateDto fields:** `name`, `iban`, `swift`, `branchCode`, `bankAccountNumber`, `bankId`, `bankProfileId`, `walletId`.

### Bank Guarantees (nested under a bank)

`/Banking/{bankId}/Guarantees` — list / count / get / create / update / **patch** / delete. Sub-resource id path param is `{guaranteeId}`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>/Guarantees?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"BeneficiaryName": "<beneficiary>", "GuaranteeNumber": "<number>", "BankGuaranteeType": "Receiving", "Margin": 0, "Charges": 0, "ValidityInDays": 90, "CurrencyId": "<currency-guid>", "BankAccountId": "<bank-account-guid>"}'
```

**BankGuaranteeCreateDto / UpdateDto fields:** `margin` (number), `charges` (number), `beneficiaryName`, `guaranteeNumber`, `guaranteeConditions`, `fixedDepositNumber` (number), `startDate`, `endDate`, `validityInDays` (int), `bankGuaranteeType` (`Receiving|Providing`), `contactId`, `projectId`, `orderId`, `bankProfileId`, `bankAccountId`, `currencyId`.

### Bank Transactions (nested under a bank)

`/Banking/{bankId}/Transactions` — list / count / get / create / update / **patch** / delete. Sub-resource id path param is `{transactionId}`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Banking/<bank-guid>/Transactions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Description": "<description>", "Price": 100.0, "Quantity": 1, "CurrencyId": "<currency-guid>", "TransactionCategoryId": "<category-guid>", "BankProfileId": "<bank-profile-guid>", "BankAccountId": "<bank-account-guid>"}'
```

**BankTransactionCreateDto / UpdateDto fields:** `description`, `price` (number), `quantity` (number), `externalDescription`, `basisQuantity` (number), `basisAmount` (number), `percent` (number), `unitGroupId`, `unitId`, `transactionCategoryId`, `currencyId`, `bankProfileId`, `bankAccountId`.

---

## Budgets & Budget Account Entries

`/Budgets` — list / count / get / create / update / **patch** / delete; entries nested under `/Budgets/{budgetId}/AccountEntries`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "FY2026 Budget", "FiscalYearId": "<year-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/<budget-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/name", "value": "FY2026 Budget (rev)"}]'

# Budget account entries (CreateDto required: Description, CurrencyId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/<budget-guid>/AccountEntries?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/<budget-guid>/AccountEntries?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Description": "Marketing allocation", "Date": "2026-01-01T00:00:00Z", "Amount": 10000.0, "CurrencyId": "<currency-guid>", "AccountingEntryType": "Debit", "BudgetId": "<budget-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Budgets/<budget-guid>/AccountEntries/<entry-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/amount", "value": 12000.0}]'
```

**BudgetCreateDto / UpdateDto:** `name`, `fiscalYearId`.
**BudgetAccountEntryCreateDto:** `description` (REQ), `date`, `amount` (number), `currencyId` (REQ), `debitAccountId`, `creditAccountId`, `journalEntryId`, `accountingEntryType` (`None|Debit|Credit`), `budgetId`.

---

## Cost Centres

`/CostCentres` — list / count / get / create / update / **patch** / delete; plus **Cost Centre Budgets** and **Cost Centre Groups** sub-collections.

```bash
# Cost centre (CreateDto: name, disabled, description, costCentreType, costCentresGroupId, parentCostCentreId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Production Floor", "Description": "...", "Disabled": false, "CostCentreType": "Production", "CostCentresGroupId": "<group-guid>", "ParentCostCentreId": "<parent-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/<cost-centre-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/disabled", "value": true}]'

# Cost centre budgets (CreateDto: name, fiscalYearId, costCentreId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/CostCentreBudgets?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "FY2026 CC Budget", "FiscalYearId": "<year-guid>", "CostCentreId": "<cost-centre-guid>"}'

# Cost centre groups (CreateDto: name, description, disabled, parentCostCentresGroupId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/CostCentres/CostCentreGroups?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Manufacturing", "Description": "...", "Disabled": false}'
```

**CostCentreType** ∈ `Service | Production`. Cost centre budgets and groups each support list / count / get / create / update / **patch** / delete (budgets path id param `{budgetId}`, groups `{groupId}`).

---

## Commissions

`/Commissions/Commissions` and `/Commissions/PaymentCommissions` — each list / count / get / create / update / **patch** / delete.

```bash
# Commission (CreateDto fields below)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Commissions/Commissions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Title": "Sales commission", "BaseAmount": 1000.0, "AddedPercent": 5.0, "AddedAmount": 0, "TaxComission": 0, "EmisorContactId": "<contact-guid>", "ReceiverContactId": "<contact-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Commissions/Commissions/<commission-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/addedPercent", "value": 7.5}]'

# Payment commission (adds paymentId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Commissions/PaymentCommissions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"PaymentId": "<payment-guid>"}'
```

**CommissionCreateDto / UpdateDto fields:** `title`, `description`, `baseAmount` (number), `addedPercent` (number), `addedAmount` (number), `taxComission` (number), `salaryId`, `emisorWalletAccountId`, `receiverWalletAccountId`, `emisorContactId`, `receiverContactId`. **PaymentCommissionCreateDto** is just `paymentId`; **PaymentCommissionUpdateDto** carries the commission fields plus `paymentId`.

---

## Receipts

`/Receipts` — list / count / get / create / update / **patch** / delete. (No `api-version`/`x-api-version` params on this controller — only `tenantId`.)

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Receipts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "Title": "Receipt #1",
    "ReceiptType": "PaymentReceipt",
    "CostCalculationMethod": "Automatic",
    "TaxCalculationMethod": "Included",
    "CurrencyId": "<currency-guid>",
    "ContactId": "<contact-guid>",
    "OrderId": "<order-guid>",
    "InvoiceId": "<invoice-guid>",
    "Total": 5000.0,
    "Closed": false
  }'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Receipts/<receipt-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/closed", "value": true}]'
```

**ReceiptType** ∈ `PaymentReceipt | PurchaseReceipt`; **CostCalculationMethod** ∈ `Automatic | Custom`; **TaxCalculationMethod** ∈ `Included | Excluded`. The CreateDto is large (totals/currency breakdown per the manifest); **ReceiptUpdateDto** is a small subset: `paymentId`, `forexRate` (number), `totalAmount` (number), `totalAmountInUsd` (number), `closed` (bool), `currencyId`, `contactId`, `orderId`, `invoiceId`.

---

## Grants

`/Grants` — list / count / get / create / update / **patch** / delete. The Grant create/update DTOs carry no documented business fields beyond `id`/`timestamp`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Grants?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Grants/<grant-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/<field>", "value": "<value>"}]'
```

---

## Loans

`/Loans` — list / count / get / create / update / **patch** / delete; plus **Loan Applications** (`/Loans/Applications`) and **Loan Types** (`/Loans/Types`).

```bash
# Loan (CreateDto fields below)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Value": 10000.0, "InterestRate": 5.0, "IsCompundInterestRate": false, "LoanTimestamp": "2026-01-01T00:00:00Z", "PaymentDeadline": "2027-01-01T00:00:00Z", "LoanTypeId": "<loan-type-guid>", "CurrencyId": "<currency-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/<loan-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/interestRate", "value": 4.5}]'

# Loan type (CreateDto: name (REQ), description)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Types?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Working Capital", "Description": "..."}'

# Loan application (CreateDto carries no documented business fields)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Loans/Applications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{}'
```

**LoanCreateDto / UpdateDto fields:** `loanTimestamp`, `paymentDeadline`, `value` (number), `interestRate` (number), `isCompundInterestRate` (bool), `loanTypeId`, `currencyId`. Loans, loan types, and loan applications each support **patch**.

---

## Shares

Under `/Shares` with four sub-resources: **Classes**, **Issuances**, **Transfers**, **TransferReasons**. Each supports list / count / get / create / update / **patch** / delete.

```bash
# Share class (CreateDto: name, value (bool), description, forexRates, currencyId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Classes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Common", "Value": true, "Description": "...", "CurrencyId": "<currency-guid>"}'

# Share issuance (CreateDto: unitPrice (int), quantity (int), currencyId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Issuances?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"UnitPrice": 10, "Quantity": 1000, "CurrencyId": "<currency-guid>"}'

# Share transfer (CreateDto: description, value (number), newShareHolderId, formerShareHolderId, shareTransferReasonId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Transfers?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Description": "Founder transfer", "Value": 5000.0, "NewShareHolderId": "<shareholder-guid>", "FormerShareHolderId": "<shareholder-guid>", "ShareTransferReasonId": "<reason-guid>"}'

# Share transfer reason (CreateDto: name, description)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/TransferReasons?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Sale", "Description": "..."}'

# Patch example (any sub-resource)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Shares/Classes/<class-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/name", "value": "Preferred"}]'
```

Path id params: classes `{shareClassId}`, issuances `{issuanceId}`, transfers `{transferId}`, transfer reasons `{reasonId}`.

---

## Transactions & Transaction Categories

`/Transactions` — list / count / get / create / update / **patch** / delete; categories under `/Transactions/Categories`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Transactions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Description": "Service fee", "Price": 250.0, "Quantity": 1, "CurrencyId": "<currency-guid>", "TransactionCategoryId": "<category-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Transactions/<transaction-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/price", "value": 300.0}]'

# Transaction category (CreateDto: name, description)
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Transactions/Categories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Services", "Description": "..."}'
```

**TransactionCreateDto / UpdateDto fields:** `description`, `price` (number), `quantity` (number), `externalDescription`, `basisQuantity` (number), `basisAmount` (number), `percent` (number), `unitGroupId`, `unitId`, `transactionCategoryId`, `currencyId`.

---

## Expense Claims & Expense Types

`/ExpenseClaims` and `/ExpenseTypes` — each list / count / get / create / update / **patch** / delete.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Name": "Travel", "Enabled": true}'
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseClaims?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"ExpenseTypeId": "<expense-type-guid>"}'
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/ExpenseClaims/<claim-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op": "replace", "path": "/expenseTypeId", "value": "<expense-type-guid>"}]'
```

**ExpenseClaimCreateDto / UpdateDto:** `expenseTypeId`. **ExpenseTypeCreateDto / UpdateDto:** `name`, `enabled` (bool).

---

## PATCH (JSON Patch — RFC 6902)

Every PATCH endpoint takes a JSON **array** of operations with `Content-Type: application/json`.
The `tenantId` query param (and any path/query ids) are still required on the URL.

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/name", "value": "Trade Receivables" },
    { "op": "replace", "path": "/frozen", "value": true },
    { "op": "add", "path": "/code", "value": "1201" }
  ]'
```

- `op` ∈ `add | remove | replace | move | copy | test`.
- `path` / `from` are JSON-Pointers (leading `/`, **camelCase** field names matching the entity, e.g. `/accountCategory`, `/isDefault`).
- Use PATCH for atomic partial updates (change a couple of fields without re-sending the whole object — safer than PUT under concurrency).

**Aggregates/sub-resources that support PATCH:** Accounts, Account Entries, Account Types, Account Relations, Account Groups, Accounting Periods, Journals, Journal Entries, Journal Types, Ledgers, Ledger Types, Financial Books, Tax Classes, Tax Policies, Applied Tax Policy Records, Item Tax Policy Records, Tax Rates, Billable Line Taxes, Fiscal Authorities, Fiscal Authority Years (`.../FiscalYears/{id}`), Fiscal Years (standalone), Fiscal Periods, Fiscal Regimes, Fiscal Responsibilities, Fiscal Responsibility Records, Enumeration Ranges (both controllers), Billing Profiles, Banks, Bank Accounts, Bank Guarantees, Bank Transactions, Budgets, Budget Account Entries, Cost Centres, Cost Centre Budgets, Cost Centre Groups, Commissions, Payment Commissions, Receipts, Grants, Loans, Loan Applications, Loan Types, Shares (Classes/Issuances/Transfers/TransferReasons), Transactions, Transaction Categories, Expense Claims, Expense Types.

**No PATCH:** Fiscal Identification Types; Bank Profiles (read-only); Charts of Accounts (catalog/seed only); all `*/Count` and aggregate/balance reads.

---

## End-to-end workflow (verified endpoints)

```bash
TENANT="tenant-guid"; H=(-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json")

# 1. Seed a chart of accounts into the tenant
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/ChartsOfAccounts/Seed?tenantId=$TENANT" "${H[@]}" \
  -d '{"fileUrl": "<chart-of-accounts-file-url>"}'

# 2. Create a ledger type, ledger, journal type, journal
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/LedgerTypes?tenantId=$TENANT" "${H[@]}" \
  -d '{"Name": "Asset Ledger", "LedgerClass": "Assets"}'
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Ledgers?tenantId=$TENANT" "${H[@]}" \
  -d '{"Name": "General Ledger", "LedgerTypeId": "<ledger-type-guid>"}'
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/JournalTypes?tenantId=$TENANT" "${H[@]}" \
  -d '{"Name": "Sales Journal"}'
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals?tenantId=$TENANT" "${H[@]}" \
  -d '{"Name": "April 2026", "JournalTypeId": "<journal-type-guid>", "LedgerId": "<ledger-guid>"}'

# 3. Post a balanced journal entry
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Journals/<journal-guid>/Entries?tenantId=$TENANT" "${H[@]}" \
  -d '{"Description": "Client payment", "Date": "2026-04-19T00:00:00Z", "Debit": 5000, "Credit": 5000, "JournalId": "<journal-guid>", "CurrencyId": "<currency-guid>", "DebitAccountId": "<cash-acct>", "CreditAccountId": "<ar-acct>"}'

# 4. Balance the affected accounts, then patch a flag atomically
curl -X POST "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>/Balance?tenantId=$TENANT" "${H[@]}"
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/<account-guid>?tenantId=$TENANT" "${H[@]}" \
  -d '[{"op": "replace", "path": "/frozen", "value": true}]'

# 5. Aggregate balance across accounts
curl -X GET "$ABSUITE_HOST_URL/api/v2/AccountingService/Accounts/Aggregate/Balance?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## API Endpoints Quick Reference

All paths are prefixed with `$ABSUITE_HOST_URL/api/v2/AccountingService`. Every endpoint takes
`?tenantId=<tenant-guid>` except `GET /Accounts/ChartsOfAccounts`.

### Accounts & chart of accounts

| Action | Method | Path |
|---|---|---|
| List accounts | GET | `/Accounts` |
| Create account | POST | `/Accounts` |
| Count accounts | GET | `/Accounts/Count` |
| Root accounts | GET | `/Accounts/Root` |
| Balance root accounts | POST | `/Accounts/Root/Balance` |
| Get account | GET | `/Accounts/{accountId}` |
| Update account | PUT | `/Accounts/{accountId}` |
| Patch account | PATCH | `/Accounts/{accountId}` |
| Delete account | DELETE | `/Accounts/{accountId}` |
| Balance account | POST | `/Accounts/{accountId}/Balance` |
| Child accounts | GET | `/Accounts/{accountId}/Children` |
| Account aggregate | POST | `/Accounts/Aggregate` |
| Aggregate balance | GET | `/Accounts/Aggregate/Balance` |
| List charts of accounts | GET | `/Accounts/ChartsOfAccounts` (no tenantId) |
| Seed chart of accounts | POST | `/Accounts/ChartsOfAccounts/Seed` |

### Account entries / debits / credits

| Action | Method | Path |
|---|---|---|
| List entries | GET | `/Accounts/{accountId}/Entries` |
| Create entry | POST | `/Accounts/{accountId}/Entries` |
| Get entry | GET | `/Accounts/{accountId}/Entries/{entryId}` |
| Update entry | PUT | `/Accounts/{accountId}/Entries/{entryId}` |
| Patch entry | PATCH | `/Accounts/{accountId}/Entries/{entryId}` |
| Delete entry | DELETE | `/Accounts/{accountId}/Entries/{entryId}` |
| Debit-only entries | GET | `/Accounts/{accountId}/Entries/Debit` |
| Credit-only entries | GET | `/Accounts/{accountId}/Entries/Credit` |
| List debits | GET | `/Accounts/{accountId}/Debits` |
| Create debit | POST | `/Accounts/{accountId}/Debits` |
| Count debits | GET | `/Accounts/{accountId}/Debits/Count` |
| List credits | GET | `/Accounts/{accountId}/Credits` |
| Create credit | POST | `/Accounts/{accountId}/Credits` |
| Count credits | GET | `/Accounts/{accountId}/Credits/Count` |

### Account types / relations / groups

| Action | Method | Path |
|---|---|---|
| List account types | GET | `/Accounts/Types` |
| Create account type | POST | `/Accounts/Types` |
| Count account types | GET | `/Accounts/Types/Count` |
| Get account type | GET | `/Accounts/Types/{accountTypeId}` |
| Update account type | PUT | `/Accounts/Types/{accountTypeId}` |
| Patch account type | PATCH | `/Accounts/Types/{accountTypeId}` |
| Delete account type | DELETE | `/Accounts/Types/{accountTypeId}` |
| List relations (req `accountId`) | GET | `/Accounts/Relations` |
| Create relation (req `accountId`) | POST | `/Accounts/Relations` |
| Count relations (req `accountId`) | GET | `/Accounts/Relations/Count` |
| Update relation (req `accountId`) | PUT | `/Accounts/Relations/{accountRelationId}` |
| Patch relation (req `accountId`) | PATCH | `/Accounts/Relations/{accountRelationId}` |
| Delete relation (req `accountId`) | DELETE | `/Accounts/Relations/{accountRelationId}` |
| List account groups | GET | `/AccountGroups` |
| Create account group | POST | `/AccountGroups` |
| Count account groups | GET | `/AccountGroups/Count` |
| Get account group | GET | `/AccountGroups/{accountGroupId}` |
| Update account group | PUT | `/AccountGroups/{accountGroupId}` |
| Patch account group | PATCH | `/AccountGroups/{accountGroupId}` |
| Delete account group | DELETE | `/AccountGroups/{accountGroupId}` |

### Accounting periods

| Action | Method | Path |
|---|---|---|
| List | GET | `/AccountingPeriods` |
| Create | POST | `/AccountingPeriods` |
| Count | GET | `/AccountingPeriods/Count` |
| Get | GET | `/AccountingPeriods/{accountingPeriodId}` |
| Update | PUT | `/AccountingPeriods/{accountingPeriodId}` |
| Patch | PATCH | `/AccountingPeriods/{accountingPeriodId}` |
| Delete | DELETE | `/AccountingPeriods/{accountingPeriodId}` |

### Journals, journal entries, journal types

| Action | Method | Path |
|---|---|---|
| List journals | GET | `/Journals` |
| Create journal | POST | `/Journals` |
| Count journals | GET | `/Journals/Count` |
| Get journal | GET | `/Journals/{journalId}` |
| Update journal | PUT | `/Journals/{journalId}` |
| Patch journal | PATCH | `/Journals/{journalId}` |
| Delete journal | DELETE | `/Journals/{journalId}` |
| List entries | GET | `/Journals/{journalId}/Entries` |
| Create entry | POST | `/Journals/{journalId}/Entries` |
| Count entries | GET | `/Journals/{journalId}/Entries/Count` |
| Aggregate credits | GET | `/Journals/{journalId}/Entries/Aggregate/Credits` |
| Aggregate debits | GET | `/Journals/{journalId}/Entries/Aggregate/Debits` |
| Update entry | PUT | `/Journals/{journalId}/Entries/{entryId}` |
| Patch entry | PATCH | `/Journals/{journalId}/Entries/{entryId}` |
| Delete entry | DELETE | `/Journals/{journalId}/Entries/{entryId}` |
| List journal types | GET | `/JournalTypes` |
| Create journal type | POST | `/JournalTypes` |
| Count journal types | GET | `/JournalTypes/Count` |
| Get journal type | GET | `/JournalTypes/{journalTypeId}` |
| Update journal type | PUT | `/JournalTypes/{journalTypeId}` |
| Patch journal type | PATCH | `/JournalTypes/{journalTypeId}` |
| Delete journal type | DELETE | `/JournalTypes/{journalTypeId}` |

### Ledgers & ledger types

| Action | Method | Path |
|---|---|---|
| List ledgers | GET | `/Ledgers` |
| Create ledger | POST | `/Ledgers` |
| Count ledgers | GET | `/Ledgers/Count` |
| Get ledger | GET | `/Ledgers/{ledgerId}` |
| Update ledger | PUT | `/Ledgers/{ledgerId}` |
| Patch ledger | PATCH | `/Ledgers/{ledgerId}` |
| Delete ledger | DELETE | `/Ledgers/{ledgerId}` |
| List ledger types | GET | `/LedgerTypes` |
| Create ledger type | POST | `/LedgerTypes` |
| Count ledger types | GET | `/LedgerTypes/Count` |
| Get ledger type | GET | `/LedgerTypes/{ledgerTypeId}` |
| Update ledger type | PUT | `/LedgerTypes/{ledgerTypeId}` |
| Patch ledger type | PATCH | `/LedgerTypes/{ledgerTypeId}` |
| Delete ledger type | DELETE | `/LedgerTypes/{ledgerTypeId}` |

### Financial books

| Action | Method | Path |
|---|---|---|
| List | GET | `/FinancialBooks` |
| Create | POST | `/FinancialBooks` |
| Count | GET | `/FinancialBooks/Count` |
| Get | GET | `/FinancialBooks/{financialBookId}` |
| Update | PUT | `/FinancialBooks/{financialBookId}` |
| Patch | PATCH | `/FinancialBooks/{financialBookId}` |
| Delete | DELETE | `/FinancialBooks/{financialBookId}` |

### Tax classes / policies / rates / billable line taxes

| Action | Method | Path |
|---|---|---|
| List tax classes | GET | `/TaxClasses` |
| Create tax class | POST | `/TaxClasses` |
| Count tax classes | GET | `/TaxClasses/Count` |
| Get tax class | GET | `/TaxClasses/{id}` |
| Update tax class | PUT | `/TaxClasses/{id}` |
| Patch tax class | PATCH | `/TaxClasses/{id}` |
| Delete tax class | DELETE | `/TaxClasses/{id}` |
| List tax policies | GET | `/TaxPolicies` |
| Create tax policy | POST | `/TaxPolicies` |
| Count tax policies | GET | `/TaxPolicies/Count` |
| Tax policies by authority | GET | `/TaxPolicies/ByAuthority/{authorityId}` |
| Get tax policy | GET | `/TaxPolicies/{id}` |
| Update tax policy | PUT | `/TaxPolicies/{id}` |
| Patch tax policy | PATCH | `/TaxPolicies/{id}` |
| Delete tax policy | DELETE | `/TaxPolicies/{id}` |
| List applied tax policy records | GET | `/TaxPolicies/{taxPolicyId}/AppliedTaxPolicyRecords` |
| Create applied tax policy record | POST | `/TaxPolicies/{taxPolicyId}/AppliedTaxPolicyRecords` |
| Count applied tax policy records | GET | `/TaxPolicies/{taxPolicyId}/AppliedTaxPolicyRecords/Count` |
| Get applied tax policy record | GET | `/TaxPolicies/{taxPolicyId}/AppliedTaxPolicyRecords/{appliedTaxPolicyRecordId}` |
| Update applied tax policy record | PUT | `/TaxPolicies/{taxPolicyId}/AppliedTaxPolicyRecords/{appliedTaxPolicyRecordId}` |
| Patch applied tax policy record | PATCH | `/TaxPolicies/{taxPolicyId}/AppliedTaxPolicyRecords/{appliedTaxPolicyRecordId}` |
| Delete applied tax policy record | DELETE | `/TaxPolicies/{taxPolicyId}/AppliedTaxPolicyRecords/{appliedTaxPolicyRecordId}` |
| List item tax policy records | GET | `/TaxPolicies/{taxPolicyId}/ItemTaxPolicyRecords` |
| Create item tax policy record | POST | `/TaxPolicies/{taxPolicyId}/ItemTaxPolicyRecords` |
| Get item tax policy record | GET | `/TaxPolicies/{taxPolicyId}/ItemTaxPolicyRecords/{itemTaxPolicyRecordId}` |
| Update item tax policy record | PUT | `/TaxPolicies/{taxPolicyId}/ItemTaxPolicyRecords/{itemTaxPolicyRecordId}` |
| Patch item tax policy record | PATCH | `/TaxPolicies/{taxPolicyId}/ItemTaxPolicyRecords/{itemTaxPolicyRecordId}` |
| Delete item tax policy record | DELETE | `/TaxPolicies/{taxPolicyId}/ItemTaxPolicyRecords/{itemTaxPolicyRecordId}` |
| List tax rates | GET | `/TaxRates` |
| Create tax rate | POST | `/TaxRates` |
| Count tax rates | GET | `/TaxRates/Count` |
| Get tax rate | GET | `/TaxRates/{id}` |
| Update tax rate | PUT | `/TaxRates/{id}` |
| Patch tax rate | PATCH | `/TaxRates/{id}` |
| Delete tax rate | DELETE | `/TaxRates/{id}` |
| List billable line taxes | GET | `/BillableLines/{billableLineId}/Taxes` |
| Create billable line tax | POST | `/BillableLines/{billableLineId}/Taxes` |
| Count billable line taxes | GET | `/BillableLines/{billableLineId}/Taxes/Count` |
| Update billable line tax | PUT | `/BillableLines/{billableLineId}/Taxes/{taxId}` |
| Patch billable line tax | PATCH | `/BillableLines/{billableLineId}/Taxes/{taxId}` |
| Delete billable line tax | DELETE | `/BillableLines/{billableLineId}/Taxes/{taxId}` |

### Fiscal framework

| Action | Method | Path |
|---|---|---|
| List fiscal authorities | GET | `/Fiscals/Authorities` |
| Create fiscal authority | POST | `/Fiscals/Authorities` |
| Count fiscal authorities | GET | `/Fiscals/Authorities/Count` |
| Get fiscal authority | GET | `/Fiscals/Authorities/{authorityId}` |
| Update fiscal authority | PUT | `/Fiscals/Authorities/{authorityId}` |
| Patch fiscal authority | PATCH | `/Fiscals/Authorities/{authorityId}` |
| Delete fiscal authority | DELETE | `/Fiscals/Authorities/{authorityId}` |
| List authority fiscal years (req `fiscalAuthorityId`) | GET | `/Fiscals/Authorities/{authorityId}/FiscalYears` |
| Get authority fiscal year | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/FiscalYears/{fiscalYearId}` |
| Count authority fiscal years | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/FiscalYears/Count` |
| Create fiscal year | POST | `/Fiscals/Authorities/FiscalYears` |
| Patch fiscal year (authority) | PATCH | `/Fiscals/Authorities/FiscalYears/{fiscalYearId}` |
| Update fiscal year (authority) | PUT | `/Fiscals/Authorities/FiscalYears/{fiscalYearId}` |
| Delete fiscal year (authority) | DELETE | `/Fiscals/Authorities/FiscalYears/{fiscalYearId}` |
| List fiscal years (standalone) | GET | `/FiscalYears` |
| Create fiscal year (standalone) | POST | `/FiscalYears` |
| Count fiscal years (standalone) | GET | `/FiscalYears/Count` |
| Get fiscal year (standalone) | GET | `/FiscalYears/{fiscalYearId}` |
| Update fiscal year (standalone) | PUT | `/FiscalYears/{fiscalYearId}` |
| Patch fiscal year (standalone) | PATCH | `/FiscalYears/{fiscalYearId}` |
| Delete fiscal year (standalone) | DELETE | `/FiscalYears/{fiscalYearId}` |
| List fiscal periods (req `fiscalAuthorityId`) | GET | `/Fiscals/Authorities/{authorityId}/FiscalYears/{fiscalYearId}/FiscalPeriods` |
| Get fiscal period | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/FiscalYears/{fiscalYearId}/FiscalPeriods/{fiscalPeriodId}` |
| Count fiscal periods | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/FiscalYears/{fiscalYearId}/FiscalPeriods/Count` |
| Create fiscal period | POST | `/Fiscals/Authorities/FiscalPeriods` |
| Patch fiscal period | PATCH | `/Fiscals/Authorities/FiscalPeriods/{fiscalPeriodId}` |
| Update fiscal period | PUT | `/Fiscals/Authorities/FiscalPeriods/{fiscalPeriodId}` |
| Delete fiscal period | DELETE | `/Fiscals/Authorities/FiscalPeriods/{fiscalPeriodId}` |
| List fiscal regimes (req `fiscalAuthorityId`) | GET | `/Fiscals/Authorities/{authorityId}/FiscalRegimes` |
| Get fiscal regime | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/FiscalRegimes/{regimeId}` |
| Count fiscal regimes | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/FiscalRegimes/Count` |
| Create fiscal regime | POST | `/Fiscals/Authorities/FiscalRegimes` |
| Patch fiscal regime | PATCH | `/Fiscals/Authorities/FiscalRegimes/{regimeId}` |
| Update fiscal regime | PUT | `/Fiscals/Authorities/FiscalRegimes/{regimeId}` |
| Delete fiscal regime | DELETE | `/Fiscals/Authorities/FiscalRegimes/{regimeId}` |
| List fiscal responsibilities (req `fiscalAuthorityId`) | GET | `/Fiscals/Authorities/{authorityId}/FiscalResponsibilities` |
| Get fiscal responsibility | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/FiscalResponsibilities/{fiscalResponsibilityId}` |
| Count fiscal responsibilities | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/FiscalResponsibilities/Count` |
| Create fiscal responsibility | POST | `/Fiscals/Authorities/FiscalResponsibilities` |
| Patch fiscal responsibility | PATCH | `/Fiscals/Authorities/FiscalResponsibilities/{fiscalResponsibilityId}` |
| Update fiscal responsibility | PUT | `/Fiscals/Authorities/FiscalResponsibilities/{fiscalResponsibilityId}` |
| Delete fiscal responsibility | DELETE | `/Fiscals/Authorities/FiscalResponsibilities/{fiscalResponsibilityId}` |
| List responsibility records | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/FiscalResponsibilities/{fiscalResponsibilityId}/FiscalResponsibilityRecords` |
| Get responsibility record | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/FiscalResponsibilities/{fiscalResponsibilityId}/FiscalResponsibilityRecords/{fiscalResponsibilityRecordId}` |
| Count responsibility records | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/FiscalResponsibilities/{fiscalResponsibilityId}/FiscalResponsibilityRecords/Count` |
| Create responsibility record | POST | `/Fiscals/Authorities/FiscalResponsibilityRecords` |
| Patch responsibility record | PATCH | `/Fiscals/Authorities/FiscalResponsibilityRecords/{fiscalResponsibilityRecordId}` |
| Update responsibility record | PUT | `/Fiscals/Authorities/FiscalResponsibilityRecords/{fiscalResponsibilityRecordId}` |
| Delete responsibility record | DELETE | `/Fiscals/Authorities/FiscalResponsibilityRecords/{fiscalResponsibilityRecordId}` |
| List identification types | GET | `/Fiscals/Authorities/{authorityId}/IdentificationTypes` |
| Count identification types | GET | `/Fiscals/Authorities/{authorityId}/IdentificationTypes/Count` |
| Get identification type | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/IdentificationTypes/{identificationTypeId}` |
| Create identification type | POST | `/Fiscals/Authorities/IdentificationTypes` |
| Update identification type | PUT | `/Fiscals/Authorities/IdentificationTypes/{identificationTypeId}` |
| Delete identification type | DELETE | `/Fiscals/Authorities/IdentificationTypes/{identificationTypeId}` |
| List authority enumeration ranges (req `fiscalAuthorityId`) | GET | `/Fiscals/Authorities/{authorityId}/EnumerationRanges` |
| Get authority enumeration range | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/EnumerationRanges/{enumerationRangeId}` |
| Count authority enumeration ranges | GET | `/Fiscals/Authorities/{fiscalAuthorityId}/EnumerationRanges/Count` |
| Create authority enumeration range | POST | `/Fiscals/Authorities/EnumerationRanges` |
| Patch authority enumeration range | PATCH | `/Fiscals/Authorities/EnumerationRanges/{enumerationRangeId}` |
| Update authority enumeration range | PUT | `/Fiscals/Authorities/EnumerationRanges/{enumerationRangeId}` |
| Delete authority enumeration range | DELETE | `/Fiscals/Authorities/EnumerationRanges/{enumerationRangeId}` |

### Invoice enumeration ranges (standalone)

| Action | Method | Path |
|---|---|---|
| List | GET | `/InvoiceEnumerationRanges` |
| Create | POST | `/InvoiceEnumerationRanges` |
| Get | GET | `/InvoiceEnumerationRanges/{rangeId}` |
| Update | PUT | `/InvoiceEnumerationRanges/{rangeId}` |
| Patch | PATCH | `/InvoiceEnumerationRanges/{rangeId}` |
| Delete | DELETE | `/InvoiceEnumerationRanges/{rangeId}` |

### Billing profiles & bank profiles

| Action | Method | Path |
|---|---|---|
| List billing profiles | GET | `/BillingProfiles` |
| Create billing profile | POST | `/BillingProfiles` |
| Count billing profiles | GET | `/BillingProfiles/Count` |
| Get billing profile | GET | `/BillingProfiles/{billingProfileId}` |
| Update billing profile | PUT | `/BillingProfiles/{billingProfileId}` |
| Patch billing profile | PATCH | `/BillingProfiles/{billingProfileId}` |
| Delete billing profile | DELETE | `/BillingProfiles/{billingProfileId}` |
| List bank profiles | GET | `/BankProfiles` |
| Count bank profiles | GET | `/BankProfiles/Count` |

### Banking

| Action | Method | Path |
|---|---|---|
| List banks | GET | `/Banking` |
| Create bank | POST | `/Banking` |
| Count banks | GET | `/Banking/Count` |
| Get bank | GET | `/Banking/{bankId}` |
| Update bank | PUT | `/Banking/{bankId}` |
| Patch bank | PATCH | `/Banking/{bankId}` |
| Delete bank | DELETE | `/Banking/{bankId}` |
| List bank accounts | GET | `/Banking/{bankId}/Accounts` |
| Create bank account | POST | `/Banking/{bankId}/Accounts` |
| Count bank accounts | GET | `/Banking/{bankId}/Accounts/Count` |
| Get bank account | GET | `/Banking/{bankId}/Accounts/{accountId}` |
| Update bank account | PUT | `/Banking/{bankId}/Accounts/{accountId}` |
| Patch bank account | PATCH | `/Banking/{bankId}/Accounts/{accountId}` |
| Delete bank account | DELETE | `/Banking/{bankId}/Accounts/{accountId}` |
| List bank guarantees | GET | `/Banking/{bankId}/Guarantees` |
| Create bank guarantee | POST | `/Banking/{bankId}/Guarantees` |
| Count bank guarantees | GET | `/Banking/{bankId}/Guarantees/Count` |
| Get bank guarantee | GET | `/Banking/{bankId}/Guarantees/{guaranteeId}` |
| Update bank guarantee | PUT | `/Banking/{bankId}/Guarantees/{guaranteeId}` |
| Patch bank guarantee | PATCH | `/Banking/{bankId}/Guarantees/{guaranteeId}` |
| Delete bank guarantee | DELETE | `/Banking/{bankId}/Guarantees/{guaranteeId}` |
| List bank transactions | GET | `/Banking/{bankId}/Transactions` |
| Create bank transaction | POST | `/Banking/{bankId}/Transactions` |
| Count bank transactions | GET | `/Banking/{bankId}/Transactions/Count` |
| Get bank transaction | GET | `/Banking/{bankId}/Transactions/{transactionId}` |
| Update bank transaction | PUT | `/Banking/{bankId}/Transactions/{transactionId}` |
| Patch bank transaction | PATCH | `/Banking/{bankId}/Transactions/{transactionId}` |
| Delete bank transaction | DELETE | `/Banking/{bankId}/Transactions/{transactionId}` |

### Budgets

| Action | Method | Path |
|---|---|---|
| List budgets | GET | `/Budgets` |
| Create budget | POST | `/Budgets` |
| Count budgets | GET | `/Budgets/Count` |
| Get budget | GET | `/Budgets/{budgetId}` |
| Update budget | PUT | `/Budgets/{budgetId}` |
| Patch budget | PATCH | `/Budgets/{budgetId}` |
| Delete budget | DELETE | `/Budgets/{budgetId}` |
| List budget account entries | GET | `/Budgets/{budgetId}/AccountEntries` |
| Create budget account entry | POST | `/Budgets/{budgetId}/AccountEntries` |
| Get budget account entry | GET | `/Budgets/{budgetId}/AccountEntries/{entryId}` |
| Update budget account entry | PUT | `/Budgets/{budgetId}/AccountEntries/{entryId}` |
| Patch budget account entry | PATCH | `/Budgets/{budgetId}/AccountEntries/{entryId}` |
| Delete budget account entry | DELETE | `/Budgets/{budgetId}/AccountEntries/{entryId}` |

### Cost centres

| Action | Method | Path |
|---|---|---|
| List cost centres | GET | `/CostCentres` |
| Create cost centre | POST | `/CostCentres` |
| Count cost centres | GET | `/CostCentres/Count` |
| Get cost centre | GET | `/CostCentres/{costCentreId}` |
| Update cost centre | PUT | `/CostCentres/{costCentreId}` |
| Patch cost centre | PATCH | `/CostCentres/{costCentreId}` |
| Delete cost centre | DELETE | `/CostCentres/{costCentreId}` |
| List cost centre budgets | GET | `/CostCentres/CostCentreBudgets` |
| Create cost centre budget | POST | `/CostCentres/CostCentreBudgets` |
| Get cost centre budget | GET | `/CostCentres/CostCentreBudgets/{budgetId}` |
| Update cost centre budget | PUT | `/CostCentres/CostCentreBudgets/{budgetId}` |
| Patch cost centre budget | PATCH | `/CostCentres/CostCentreBudgets/{budgetId}` |
| Delete cost centre budget | DELETE | `/CostCentres/CostCentreBudgets/{budgetId}` |
| List cost centre groups | GET | `/CostCentres/CostCentreGroups` |
| Create cost centre group | POST | `/CostCentres/CostCentreGroups` |
| Count cost centre groups | GET | `/CostCentres/CostCentreGroups/Count` |
| Get cost centre group | GET | `/CostCentres/CostCentreGroups/{groupId}` |
| Update cost centre group | PUT | `/CostCentres/CostCentreGroups/{groupId}` |
| Patch cost centre group | PATCH | `/CostCentres/CostCentreGroups/{groupId}` |
| Delete cost centre group | DELETE | `/CostCentres/CostCentreGroups/{groupId}` |

### Commissions

| Action | Method | Path |
|---|---|---|
| List commissions | GET | `/Commissions/Commissions` |
| Create commission | POST | `/Commissions/Commissions` |
| Count commissions | GET | `/Commissions/Commissions/Count` |
| Get commission | GET | `/Commissions/Commissions/{commissionId}` |
| Update commission | PUT | `/Commissions/Commissions/{commissionId}` |
| Patch commission | PATCH | `/Commissions/Commissions/{commissionId}` |
| Delete commission | DELETE | `/Commissions/Commissions/{commissionId}` |
| List payment commissions | GET | `/Commissions/PaymentCommissions` |
| Create payment commission | POST | `/Commissions/PaymentCommissions` |
| Count payment commissions | GET | `/Commissions/PaymentCommissions/Count` |
| Get payment commission | GET | `/Commissions/PaymentCommissions/{paymentCommissionId}` |
| Update payment commission | PUT | `/Commissions/PaymentCommissions/{paymentCommissionId}` |
| Patch payment commission | PATCH | `/Commissions/PaymentCommissions/{paymentCommissionId}` |
| Delete payment commission | DELETE | `/Commissions/PaymentCommissions/{paymentCommissionId}` |

### Receipts, grants

| Action | Method | Path |
|---|---|---|
| List receipts | GET | `/Receipts` |
| Create receipt | POST | `/Receipts` |
| Count receipts | GET | `/Receipts/Count` |
| Get receipt | GET | `/Receipts/{receiptId}` |
| Update receipt | PUT | `/Receipts/{receiptId}` |
| Patch receipt | PATCH | `/Receipts/{receiptId}` |
| Delete receipt | DELETE | `/Receipts/{receiptId}` |
| List grants | GET | `/Grants` |
| Create grant | POST | `/Grants` |
| Count grants | GET | `/Grants/Count` |
| Get grant | GET | `/Grants/{grantId}` |
| Update grant | PUT | `/Grants/{grantId}` |
| Patch grant | PATCH | `/Grants/{grantId}` |
| Delete grant | DELETE | `/Grants/{grantId}` |

### Loans

| Action | Method | Path |
|---|---|---|
| List loans | GET | `/Loans` |
| Create loan | POST | `/Loans` |
| Count loans | GET | `/Loans/Count` |
| Get loan | GET | `/Loans/{loanId}` |
| Update loan | PUT | `/Loans/{loanId}` |
| Patch loan | PATCH | `/Loans/{loanId}` |
| Delete loan | DELETE | `/Loans/{loanId}` |
| List loan applications | GET | `/Loans/Applications` |
| Create loan application | POST | `/Loans/Applications` |
| Count loan applications | GET | `/Loans/Applications/Count` |
| Get loan application | GET | `/Loans/Applications/{applicationId}` |
| Update loan application | PUT | `/Loans/Applications/{applicationId}` |
| Patch loan application | PATCH | `/Loans/Applications/{applicationId}` |
| Delete loan application | DELETE | `/Loans/Applications/{applicationId}` |
| List loan types | GET | `/Loans/Types` |
| Create loan type | POST | `/Loans/Types` |
| Count loan types | GET | `/Loans/Types/Count` |
| Get loan type | GET | `/Loans/Types/{loanTypeId}` |
| Update loan type | PUT | `/Loans/Types/{loanTypeId}` |
| Patch loan type | PATCH | `/Loans/Types/{loanTypeId}` |
| Delete loan type | DELETE | `/Loans/Types/{loanTypeId}` |

### Shares

| Action | Method | Path |
|---|---|---|
| List share classes | GET | `/Shares/Classes` |
| Create share class | POST | `/Shares/Classes` |
| Count share classes | GET | `/Shares/Classes/Count` |
| Get share class | GET | `/Shares/Classes/{shareClassId}` |
| Update share class | PUT | `/Shares/Classes/{shareClassId}` |
| Patch share class | PATCH | `/Shares/Classes/{shareClassId}` |
| Delete share class | DELETE | `/Shares/Classes/{shareClassId}` |
| List share issuances | GET | `/Shares/Issuances` |
| Create share issuance | POST | `/Shares/Issuances` |
| Count share issuances | GET | `/Shares/Issuances/Count` |
| Get share issuance | GET | `/Shares/Issuances/{issuanceId}` |
| Update share issuance | PUT | `/Shares/Issuances/{issuanceId}` |
| Patch share issuance | PATCH | `/Shares/Issuances/{issuanceId}` |
| Delete share issuance | DELETE | `/Shares/Issuances/{issuanceId}` |
| List share transfers | GET | `/Shares/Transfers` |
| Create share transfer | POST | `/Shares/Transfers` |
| Count share transfers | GET | `/Shares/Transfers/Count` |
| Get share transfer | GET | `/Shares/Transfers/{transferId}` |
| Update share transfer | PUT | `/Shares/Transfers/{transferId}` |
| Patch share transfer | PATCH | `/Shares/Transfers/{transferId}` |
| Delete share transfer | DELETE | `/Shares/Transfers/{transferId}` |
| List share transfer reasons | GET | `/Shares/TransferReasons` |
| Create share transfer reason | POST | `/Shares/TransferReasons` |
| Count share transfer reasons | GET | `/Shares/TransferReasons/Count` |
| Get share transfer reason | GET | `/Shares/TransferReasons/{reasonId}` |
| Update share transfer reason | PUT | `/Shares/TransferReasons/{reasonId}` |
| Patch share transfer reason | PATCH | `/Shares/TransferReasons/{reasonId}` |
| Delete share transfer reason | DELETE | `/Shares/TransferReasons/{reasonId}` |

### Transactions, expense claims & types

| Action | Method | Path |
|---|---|---|
| List transactions | GET | `/Transactions` |
| Create transaction | POST | `/Transactions` |
| Count transactions | GET | `/Transactions/Count` |
| Get transaction | GET | `/Transactions/{transactionId}` |
| Update transaction | PUT | `/Transactions/{transactionId}` |
| Patch transaction | PATCH | `/Transactions/{transactionId}` |
| Delete transaction | DELETE | `/Transactions/{transactionId}` |
| List transaction categories | GET | `/Transactions/Categories` |
| Create transaction category | POST | `/Transactions/Categories` |
| Count transaction categories | GET | `/Transactions/Categories/Count` |
| Get transaction category | GET | `/Transactions/Categories/{categoryId}` |
| Update transaction category | PUT | `/Transactions/Categories/{categoryId}` |
| Patch transaction category | PATCH | `/Transactions/Categories/{categoryId}` |
| Delete transaction category | DELETE | `/Transactions/Categories/{categoryId}` |
| List expense claims | GET | `/ExpenseClaims` |
| Create expense claim | POST | `/ExpenseClaims` |
| Count expense claims | GET | `/ExpenseClaims/Count` |
| Get expense claim | GET | `/ExpenseClaims/{expenseClaimId}` |
| Update expense claim | PUT | `/ExpenseClaims/{expenseClaimId}` |
| Patch expense claim | PATCH | `/ExpenseClaims/{expenseClaimId}` |
| Delete expense claim | DELETE | `/ExpenseClaims/{expenseClaimId}` |
| List expense types | GET | `/ExpenseTypes` |
| Create expense type | POST | `/ExpenseTypes` |
| Count expense types | GET | `/ExpenseTypes/Count` |
| Get expense type | GET | `/ExpenseTypes/{expenseTypeId}` |
| Update expense type | PUT | `/ExpenseTypes/{expenseTypeId}` |
| Patch expense type | PATCH | `/ExpenseTypes/{expenseTypeId}` |
| Delete expense type | DELETE | `/ExpenseTypes/{expenseTypeId}` |
