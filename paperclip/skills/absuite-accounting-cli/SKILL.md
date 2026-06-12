---
name: absuite-accounting-cli
description: >
  Manage the Alliance Business Suite (ABS) accounting system using the `absuite` CLI.
  Covers chart of accounts, account entries, journals/ledgers, tax classes/policies/rates,
  fiscal authorities/years/periods/regimes, billing profiles, banks/bank-accounts/guarantees/
  transactions, budgets, cost centres, commissions, receipts, grants, loans, shares, and
  invoice enumeration ranges via list/count/search/get/create/update/delete commands and
  service actions. Requires an authenticated CLI session (see absuite-login-cli). For atomic
  PATCH updates or raw HTTP, use the absuite-accounting (REST) skill.
---

# Alliance Business Suite — Accounting Skill (CLI)

Drive the ABS `AccountingService` through the `absuite` CLI. The CLI service token is
**`accounting`**. Every accounting command is tenant-scoped — set or pass a tenant on each
call. For atomic partial updates (JSON Patch) or raw HTTP, switch to the `absuite-accounting`
REST skill; the CLI does **not** support patch operations.

For general CLI usage and configuration, see `absuite-cli`.

## Prerequisites

1. **Authenticate** — run `absuite login` first (see `absuite-login-cli`).
2. **Set your tenant** — accounting requires a tenant on every call. Set a default:
   ```bash
   absuite config set --tenant-id <tenant-guid>
   ```
   or pass `--TenantId <tenant-guid>` explicitly. Examples below use `$TENANT_ID`.
3. **Discover commands**:
   ```bash
   absuite accounting list-commands
   absuite accounting list-commands | grep -i account
   absuite accounting list-commands | grep -i tax
   absuite accounting <verb> <entity> --help    # full parameter + output schema
   ```

## Command structure

```
absuite accounting <verb> <entity> --Param value
```

- **Verbs:** `list`, `count`, `search`, `get`, `create`, `update`, `delete`, plus service
  actions (`balance`, `aggregate`, `seed`). **No `patch`** — use the REST skill.
- The **canonical function-name form** also works and maps 1:1 to the PowerShell SDK cmdlet:
  ```bash
  absuite accounting Get-AccountsAsync --TenantId $TENANT_ID
  absuite accounting New-AccountAsync  --TenantId $TENANT_ID --AccountCreateDto '{...}'
  ```
  The SDK names a cmdlet `<Verb>-<Noun>`: GET → `Get-…`, create → `New-…`, update →
  `Update-…`, delete → `Invoke-Delete…`, actions → `Invoke-…`. Some controllers append
  `Async` to the noun (Accounts, Journals, Ledgers, FiscalYears, Budgets, Loans, …) and some
  do not (Banking, Shares, AccountGroups, CostCentres, Commissions, TaxClasses, TaxPolicies,
  TaxRates, FiscalAuthorities, …). Confirm the exact spelling with `--help` or `list-commands`.
- **JSON DTO params** are passed as a single-quoted JSON string with the **same field names as
  the API** (e.g. `Name`, `CurrencyId`, `AccountCategory`). Required fields and enum values are
  listed per entity below.
- **Tenant** is `--TenantId`. Pagination/filter flags surface through `--help` per command.

## Key Concepts

- **Account** — `AccountCategory` ∈ `Assets | Equity | Revenue | Expense | Liabilities`; hierarchical via `ParentAccountId`; `Group`/`Frozen` flags.
- **Account Entry** — `AccountingEntryType` ∈ `None | Debit | Credit`; carries `DebitAccountId`/`CreditAccountId`, `Amount`, `CurrencyId`.
- **Journal / Journal Entry** — journal typed by Journal Type, filed in a Ledger; entries are double-entry (`Debit`+`Credit`).
- **Ledger Type** — `LedgerClass` ∈ `Assets | Equity | Gains | Losses | Revenue | Expenses | Liabilities`.
- **Tax Class** — `Type` ∈ `Tax | Withholding`. **Tax Policy** — `Percentage` is a whole number (19 = 19%). **Tax Rate** — tied to a policy/class/authority.
- **Fiscal Authority** — parent of fiscal years, periods, regimes, responsibilities, identification types, and enumeration ranges.
- **Invoice Enumeration Range** — `DocumentType` ∈ `Standard | DebitNote | CreditNote`.
- **Billing Profile** — `TaxPayerType` ∈ `Individual | Business`.
- **Bank Guarantee** — `BankGuaranteeType` ∈ `Receiving | Providing`.
- **Cost Centre** — `CostCentreType` ∈ `Service | Production`.
- **Receipt** — `ReceiptType` ∈ `PaymentReceipt | PurchaseReceipt`; `CostCalculationMethod` ∈ `Automatic | Custom`; `TaxCalculationMethod` ∈ `Included | Excluded`.

---

## Accounts (Chart of Accounts)

```bash
# List / count / root / children
absuite accounting list accounts --TenantId $TENANT_ID
absuite accounting count accounts --TenantId $TENANT_ID
absuite accounting list root-accounts --TenantId $TENANT_ID
absuite accounting list child-accounts --TenantId $TENANT_ID --AccountId <account-guid>

# Get
absuite accounting get account-details --TenantId $TENANT_ID --AccountId <account-guid>

# Create (AccountCreateDto). Required: Name, CurrencyId, AccountCategory.
absuite accounting create account --TenantId $TENANT_ID --AccountCreateDto '{
  "Name": "Accounts Receivable",
  "Code": "1200",
  "AccountCategory": "Assets",
  "CurrencyId": "<currency-guid>",
  "AccountTypeId": "<account-type-guid>",
  "ParentAccountId": "<parent-account-guid>",
  "Group": false,
  "Frozen": false
}'

# Update (AccountUpdateDto). Required: Name, CurrencyId.
absuite accounting update account --TenantId $TENANT_ID --AccountId <account-guid> --AccountUpdateDto '{
  "Name": "Trade Receivables", "CurrencyId": "<currency-guid>", "Frozen": false
}'

# Delete
absuite accounting delete account --TenantId $TENANT_ID --AccountId <account-guid>

# Actions
absuite accounting balance account --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting balance root-accounts --TenantId $TENANT_ID
absuite accounting aggregate accounts-balance --TenantId $TENANT_ID
absuite accounting aggregate accounts --TenantId $TENANT_ID --AccountDto '[{"id": "<account-guid>"}]'

# Charts of accounts (the list takes no tenant; seed takes a fileUrl)
absuite accounting list charts-of-accounts
absuite accounting seed chart-of-accounts --TenantId $TENANT_ID --SeedChartOfAccountsRequest '{"fileUrl": "<chart-of-accounts-file-url>"}'
```

Canonical cmdlets: `Get-AccountsAsync`, `Get-AccountsCountAsync`, `Get-RootAccountsAsync`,
`Get-ChildAccountsAsync`, `Get-AccountDetailsAsync`, `New-AccountAsync`, `Update-AccountAsync`,
`Invoke-DeleteAccountAsync`, `Invoke-BalanceAccountAsync`, `Invoke-BalanceRootAccountAsync`,
`Get-AccountAggregateAsync`, `Invoke-AggregateAccountsBalanceAsync`, `Get-ChartsOfAccountsAsync`,
`Invoke-SeedChartOfAccountsAsync`.

**AccountCreateDto fields:** `name` (REQ), `code`, `path`, `prefix`, `currencyId` (REQ), `contactId`, `accountTypeId`, `parentAccountId`, `accountCategory` (REQ, `Assets|Equity|Revenue|Expense|Liabilities`), `group` (bool), `frozen` (bool).

## Account Entries (debits & credits)

```bash
absuite accounting list account-entries --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting get account-entry --TenantId $TENANT_ID --AccountId <account-guid> --EntryId <entry-guid>
absuite accounting list account-debits --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting count account-debits --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting list account-credits --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting count account-credits --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting list debit-account-entries --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting list credit-account-entries --TenantId $TENANT_ID --AccountId <account-guid>

# Create entry / debit / credit (AccountingEntryCreateDto). Required: Description, CurrencyId.
absuite accounting create account-entry --TenantId $TENANT_ID --AccountId <account-guid> --AccountingEntryCreateDto '{
  "Description": "Client payment received",
  "Date": "2026-04-19T00:00:00Z",
  "Amount": 5000.00,
  "CurrencyId": "<currency-guid>",
  "DebitAccountId": "<bank-account-guid>",
  "CreditAccountId": "<receivables-account-guid>",
  "AccountingEntryType": "Debit"
}'
absuite accounting create account-debit  --TenantId $TENANT_ID --AccountId <account-guid> --AccountingEntryCreateDto '{"Description": "Supplies", "Amount": 250.00, "CurrencyId": "<currency-guid>"}'
absuite accounting create account-credit --TenantId $TENANT_ID --AccountId <account-guid> --AccountingEntryCreateDto '{"Description": "Refund", "Amount": 100.00, "CurrencyId": "<currency-guid>"}'

# Update / delete entry (AccountingEntryUpdateDto)
absuite accounting update account-entry --TenantId $TENANT_ID --AccountId <account-guid> --EntryId <entry-guid> --AccountingEntryUpdateDto '{"Amount": 4900.00, "CurrencyId": "<currency-guid>"}'
absuite accounting delete account-entry --TenantId $TENANT_ID --AccountId <account-guid> --EntryId <entry-guid>
```

Canonical: `Get-AccountEntriesAsync`, `Get-AccountEntryAsync`, `Get-AccountDebitsAsync`,
`Get-AccountDebitsCountAsync`, `Get-AccountCreditsAsync`, `Get-AccountCreditsCountAsync`,
`Get-DebitAccountEntriesAsync`, `Get-CreditAccountEntriesAsync`, `New-AccountEntryAsync`,
`New-AccountDebitAsync`, `New-AccountCreditAsync`, `Update-AccountEntryAsync`,
`Invoke-DeleteAccountEntryAsync`.

**AccountingEntryCreateDto fields:** `description` (REQ), `date`, `amount` (number), `currencyId` (REQ), `debitAccountId`, `creditAccountId`, `journalEntryId`, `accountingEntryType` (`None|Debit|Credit`).

## Account Types, Relations, Groups

```bash
# Types
absuite accounting list account-types --TenantId $TENANT_ID
absuite accounting count account-types --TenantId $TENANT_ID
absuite accounting get account-type --TenantId $TENANT_ID --AccountTypeId <type-guid>
absuite accounting create account-type --TenantId $TENANT_ID --AccountTypeCreateDto '{"Name": "Current Asset", "Description": "Short-term assets"}'
absuite accounting update account-type --TenantId $TENANT_ID --AccountTypeId <type-guid> --AccountTypeUpdateDto '{"Name": "Current Asset (Updated)"}'
absuite accounting delete account-type --TenantId $TENANT_ID --AccountTypeId <type-guid>

# Relations (also require --AccountId on every verb)
absuite accounting list account-relations  --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting count account-relations --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting create account-relation --TenantId $TENANT_ID --AccountId <account-guid> --AccountRelationCreateDto '{"AccountId": "<related-account-guid>", "Type": "<relation-type>"}'
absuite accounting update account-relation --TenantId $TENANT_ID --AccountRelationId <relation-guid> --AccountId <account-guid> --AccountRelationUpdateDto '{"AccountId": "<related-account-guid>", "Type": "<relation-type>"}'
absuite accounting delete account-relation --TenantId $TENANT_ID --AccountRelationId <relation-guid> --AccountId <account-guid>

# Groups
absuite accounting list account-groups --TenantId $TENANT_ID
absuite accounting count account-groups --TenantId $TENANT_ID
absuite accounting get account-group --TenantId $TENANT_ID --AccountGroupId <group-guid>
absuite accounting create account-group --TenantId $TENANT_ID --AccountGroupCreateDto '{"Title": "Operating Expenses", "Description": "Day-to-day expenses"}'
absuite accounting update account-group --TenantId $TENANT_ID --AccountGroupId <group-guid> --AccountGroupUpdateDto '{"Title": "OpEx"}'
absuite accounting delete account-group --TenantId $TENANT_ID --AccountGroupId <group-guid>
```

Canonical: `Get-AccountTypesAsync`/`-CountAsync`, `Get-AccountTypeByIdAsync`, `New-AccountTypeAsync`,
`Update-AccountTypeAsync`, `Invoke-DeleteAccountTypeAsync`; `Get-AccountRelationsAsync`/`-CountAsync`,
`New-AccountRelationAsync`, `Update-AccountRelationAsync`, `Invoke-DeleteAccountRelationAsync`;
`Get-AccountGroups`, `Get-AccountGroupsCountAsync`, `Get-AccountGroup`, `New-AccountGroup`,
`Update-AccountGroup`, `Invoke-DeleteAccountGroup`.

**AccountTypeCreateDto:** `name`, `description`. **AccountRelationCreateDto:** `accountId`, `type`. **AccountGroupCreateDto:** `title`, `description`, `parentAccountGroupId`.

## Accounting Periods

```bash
absuite accounting list accounting-periods --TenantId $TENANT_ID
absuite accounting count accounting-periods --TenantId $TENANT_ID
absuite accounting get accounting-period --TenantId $TENANT_ID --AccountingPeriodId <period-guid>
absuite accounting create accounting-period --TenantId $TENANT_ID --AccountingPeriodCreateDto '{"Name": "Q1 2026", "DateStart": "2026-01-01T00:00:00Z", "DateEnd": "2026-03-31T23:59:59Z"}'
absuite accounting update accounting-period --TenantId $TENANT_ID --AccountingPeriodId <period-guid> --AccountingPeriodUpdateDto '{"Name": "Q1 2026 (revised)"}'
absuite accounting delete accounting-period --TenantId $TENANT_ID --AccountingPeriodId <period-guid>
```

**AccountingPeriodCreateDto:** `name`, `dateStart`, `dateEnd`.

---

## Journals, Journal Entries, Journal Types

```bash
# Journals
absuite accounting list journals --TenantId $TENANT_ID
absuite accounting count journals --TenantId $TENANT_ID
absuite accounting get journal-details --TenantId $TENANT_ID --JournalId <journal-guid>
absuite accounting create journal --TenantId $TENANT_ID --JournalCreateDto '{
  "Name": "General Journal - April 2026",
  "Description": "Monthly general journal",
  "DateTime": "2026-04-01T00:00:00Z",
  "JournalTypeId": "<journal-type-guid>",
  "LedgerId": "<ledger-guid>"
}'
absuite accounting update journal --TenantId $TENANT_ID --JournalId <journal-guid> --JournalUpdateDto '{"Name": "General Journal (rev)"}'
absuite accounting delete journal --TenantId $TENANT_ID --JournalId <journal-guid>

# Journal entries (double-entry)
absuite accounting list journal-entries  --TenantId $TENANT_ID --JournalId <journal-guid>
absuite accounting count journal-entries --TenantId $TENANT_ID --JournalId <journal-guid>
absuite accounting aggregate journal-entry-credits --TenantId $TENANT_ID --JournalId <journal-guid>
absuite accounting aggregate journal-entry-debits  --TenantId $TENANT_ID --JournalId <journal-guid>
absuite accounting create journal-entry --TenantId $TENANT_ID --JournalId <journal-guid> --JournalEntryCreateDto '{
  "Description": "Record client payment",
  "Date": "2026-04-19T00:00:00Z",
  "Debit": 5000.00, "Credit": 5000.00,
  "JournalId": "<journal-guid>",
  "CurrencyId": "<currency-guid>",
  "DebitAccountId": "<cash-account-guid>",
  "CreditAccountId": "<receivables-account-guid>",
  "InvoiceCode": "<invoice-code>"
}'
absuite accounting update journal-entry --TenantId $TENANT_ID --JournalId <journal-guid> --EntryId <entry-guid> --JournalEntryUpdateDto '{"Description": "Revised", "Date": "2026-04-19T00:00:00Z", "JournalId": "<journal-guid>", "CurrencyId": "<currency-guid>", "DebitAccountId": "<cash>", "CreditAccountId": "<ar>"}'
absuite accounting delete journal-entry --TenantId $TENANT_ID --JournalId <journal-guid> --EntryId <entry-guid>

# Journal types
absuite accounting list journal-types --TenantId $TENANT_ID
absuite accounting count journal-types --TenantId $TENANT_ID
absuite accounting get journal-type-details --TenantId $TENANT_ID --JournalTypeId <type-guid>
absuite accounting create journal-type --TenantId $TENANT_ID --JournalTypeCreateDto '{"Name": "Sales Journal"}'
absuite accounting update journal-type --TenantId $TENANT_ID --JournalTypeId <type-guid> --JournalTypeUpdateDto '{"Name": "Sales"}'
absuite accounting delete journal-type --TenantId $TENANT_ID --JournalTypeId <type-guid>
```

Canonical: `Get-JournalsAsync`, `Count-JournalsAsync`, `Get-JournalDetailsAsync`,
`New-JournalAsync`, `Update-JournalAsync`, `Invoke-DeleteJournalAsync`,
`Get-JournalEntriesAsync`, `Get-JournalEntriesCountAsync`, `Invoke-AggregateJournalEntryCreditsAsync`,
`Invoke-AggregateJournalEntryDebitsAsync`, `New-JournalEntryAsync`, `Update-JournalEntryAsync`,
`Invoke-DeleteJournalEntryAsync`, `Get-JournalTypesAsync`, `New-JournalTypeAsync`,
`Update-JournalTypeAsync`, `Invoke-DeleteJournalTypeAsync`.

**JournalCreateDto:** `name` (REQ), `description`, `dateTime`, `parentJournalId`, `journalTypeId`, `ledgerId`.
**JournalEntryCreateDto required:** `description`, `date`, `journalId`, `currencyId`, `debitAccountId`, `creditAccountId`; optional `debit`, `credit`, `group`, `opening`, `parentJournalEntryId`, `invoiceCode`.
**JournalTypeCreateDto:** `name`.

---

## Ledgers & Ledger Types

```bash
absuite accounting list ledgers --TenantId $TENANT_ID
absuite accounting count ledgers --TenantId $TENANT_ID
absuite accounting get ledger-details --TenantId $TENANT_ID --LedgerId <ledger-guid>
absuite accounting create ledger --TenantId $TENANT_ID --CreateLedgerDto '{"Name": "General Ledger", "Description": "Primary ledger", "LedgerTypeId": "<ledger-type-guid>"}'
absuite accounting update ledger --TenantId $TENANT_ID --LedgerId <ledger-guid> --UpdateLedgerDto '{"Name": "GL"}'
absuite accounting delete ledger --TenantId $TENANT_ID --LedgerId <ledger-guid>

absuite accounting list ledger-types --TenantId $TENANT_ID
absuite accounting count ledger-types --TenantId $TENANT_ID
absuite accounting get ledger-type-details --TenantId $TENANT_ID --LedgerTypeId <type-guid>
absuite accounting create ledger-type --TenantId $TENANT_ID --LedgerTypeCreateDto '{"Name": "Asset Ledger", "LedgerClass": "Assets"}'
absuite accounting update ledger-type --TenantId $TENANT_ID --LedgerTypeId <type-guid> --LedgerTypeUpdateDto '{"Name": "Assets", "LedgerClass": "Assets"}'
absuite accounting delete ledger-type --TenantId $TENANT_ID --LedgerTypeId <type-guid>
```

Canonical: `Get-LedgersAsync`, `New-LedgerAsync`, `Update-LedgerAsync`, `Invoke-DeleteLedgerAsync`;
`Get-LedgerTypesAsync`, `New-LedgerTypeAsync`, `Update-LedgerTypeAsync`, `Invoke-DeleteLedgerTypeAsync`.

**CreateLedgerDto:** `name`, `description`, `dateTime`, `ledgerTypeId`.
**LedgerTypeCreateDto:** `name` (REQ), `ledgerClass` (`Assets|Equity|Gains|Losses|Revenue|Expenses|Liabilities`).

## Financial Books

```bash
absuite accounting list financial-books --TenantId $TENANT_ID
absuite accounting count financial-books --TenantId $TENANT_ID
absuite accounting get financial-book-details --TenantId $TENANT_ID --FinancialBookId <book-guid>
absuite accounting create financial-book --TenantId $TENANT_ID --FinancialBookCreateDto '{"Name": "FY2026 Book", "Description": "Records for fiscal year 2026"}'
absuite accounting update financial-book --TenantId $TENANT_ID --FinancialBookId <book-guid> --FinancialBookUpdateDto '{"Name": "FY2026"}'
absuite accounting delete financial-book --TenantId $TENANT_ID --FinancialBookId <book-guid>
```

**FinancialBookCreateDto:** `name` (REQ), `description`.

---

## Tax Classes, Policies, Rates

```bash
# Tax classes
absuite accounting list tax-classes --TenantId $TENANT_ID
absuite accounting count tax-classes --TenantId $TENANT_ID
absuite accounting get tax-class --TenantId $TENANT_ID --Id <class-guid>
absuite accounting create tax-class --TenantId $TENANT_ID --TaxClassCreateDto '{"Name": "Standard", "Type": "Tax", "FiscalAuthorityId": "<authority-guid>"}'
absuite accounting update tax-class --TenantId $TENANT_ID --Id <class-guid> --TaxClassUpdateDto '{"Name": "Standard", "Type": "Withholding"}'
absuite accounting delete tax-class --TenantId $TENANT_ID --Id <class-guid>

# Tax policies
absuite accounting list tax-policies --TenantId $TENANT_ID
absuite accounting count tax-policies --TenantId $TENANT_ID
absuite accounting get tax-policy --TenantId $TENANT_ID --Id <policy-guid>
absuite accounting get tax-policies-by-authority --TenantId $TENANT_ID --AuthorityId <authority-guid>
absuite accounting create tax-policy --TenantId $TENANT_ID --TaxPolicyCreateDto '{
  "Code": "VAT-19", "Title": "Standard VAT 19%", "Percentage": 19.0,
  "IsEnabled": true, "IsDefault": false, "Withholding": false,
  "CurrencyId": "<currency-guid>", "CountryId": "<country-guid>", "FiscalAuthorityId": "<authority-guid>"
}'
absuite accounting update tax-policy --TenantId $TENANT_ID --Id <policy-guid> --TaxPolicyUpdateDto '{"Title": "VAT", "Percentage": 19.0}'
absuite accounting delete tax-policy --TenantId $TENANT_ID --Id <policy-guid>

# Applied / item tax policy records (nested under a tax policy)
absuite accounting list applied-tax-policy-records  --TenantId $TENANT_ID --TaxPolicyId <policy-guid>
absuite accounting count applied-tax-policy-records --TenantId $TENANT_ID --TaxPolicyId <policy-guid>
absuite accounting get applied-tax-policy-record    --TenantId $TENANT_ID --TaxPolicyId <policy-guid> --AppliedTaxPolicyRecordId <record-guid>
absuite accounting create applied-tax-policy-record --TenantId $TENANT_ID --TaxPolicyId <policy-guid> --AppliedTaxPolicyRecordCreateDto '{"TaxPolicyId": "<policy-guid>", "InvoiceId": "<invoice-guid>", "ItemId": "<item-guid>"}'
absuite accounting update applied-tax-policy-record --TenantId $TENANT_ID --TaxPolicyId <policy-guid> --AppliedTaxPolicyRecordId <record-guid> --AppliedTaxPolicyRecordUpdateDto '{...}'
absuite accounting delete applied-tax-policy-record --TenantId $TENANT_ID --TaxPolicyId <policy-guid> --AppliedTaxPolicyRecordId <record-guid>
absuite accounting list item-tax-policy-records   --TenantId $TENANT_ID --TaxPolicyId <policy-guid>
absuite accounting create item-tax-policy-record  --TenantId $TENANT_ID --TaxPolicyId <policy-guid> --ItemTaxPolicyRecordCreateDto '{"TaxPolicyId": "<policy-guid>", "ItemPriceId": "<item-price-guid>", "ItemId": "<item-guid>"}'

# Tax rates
absuite accounting list tax-rates --TenantId $TENANT_ID
absuite accounting count tax-rates --TenantId $TENANT_ID
absuite accounting get tax-rate --TenantId $TENANT_ID --Id <rate-guid>
absuite accounting create tax-rate --TenantId $TENANT_ID --TaxRateCreateDto '{"Name": "VAT 19%", "Rate": 19.0, "Priority": 1, "TaxPolicyId": "<policy-guid>", "TaxClassId": "<class-guid>", "FiscalAuthorityId": "<authority-guid>", "CurrencyId": "<currency-guid>"}'
absuite accounting update tax-rate --TenantId $TENANT_ID --Id <rate-guid> --TaxRateUpdateDto '{"Name": "VAT", "Rate": 19.0}'
absuite accounting delete tax-rate --TenantId $TENANT_ID --Id <rate-guid>

# Billable line taxes (nested under a billable line)
absuite accounting list billable-line-taxes  --TenantId $TENANT_ID --BillableLineId <line-guid>
absuite accounting count billable-line-taxes --TenantId $TENANT_ID --BillableLineId <line-guid>
absuite accounting create billable-line-tax  --TenantId $TENANT_ID --BillableLineId <line-guid> --AppliedItemTaxRecordCreateDto '{"TaxPolicyId": "<policy-guid>", "InvoiceId": "<invoice-guid>", "ItemId": "<item-guid>"}'
absuite accounting update billable-line-tax  --TenantId $TENANT_ID --BillableLineId <line-guid> --TaxId <tax-guid> --AppliedItemTaxRecordUpdateDto '{...}'
absuite accounting delete billable-line-tax  --TenantId $TENANT_ID --BillableLineId <line-guid> --TaxId <tax-guid>
```

Canonical: `Get-TaxClasses`, `New-TaxClass`, `Update-TaxClass`, `Invoke-DeleteTaxClass`;
`Get-TaxPolicies`, `Get-TaxPoliciesByAuthority`, `New-TaxPolicy`, `Update-TaxPolicy`,
`Invoke-DeleteTaxPolicy`; `Get-TaxRates`, `New-TaxRate`, `Update-TaxRate`, `Invoke-DeleteTaxRate`;
`Get-BillableLineTaxes`, `New-BillableLineTax`, `Update-BillableLineTax`, `Invoke-DeleteBillableLineTax`.

**TaxClassCreateDto:** `name`, `type` (`Tax|Withholding`), `fiscalAuthorityId`.
**TaxPolicyCreateDto key fields:** `code`, `title`, `description`, `percentage` (number, whole = %), `value` (number), `isEnabled`, `isDefault`, `withholding`, `zero`, `reduced`, `isFree`, `allowInternational`, `currencyId`, `countryId`, `fiscalAuthorityId` (plus `hours`/`days`/`weeks`/`months`/`years`, `countryStateId`, `customState`, `customCity`, `cityId`).
**TaxRateCreateDto key fields:** `name`, `rate` (number), `value` (number), `priority` (int), `compound`, `shipping`, `withholding`, `taxPolicyId`, `taxClassId`, `fiscalAuthorityId`, `fiscalYearId`, `countryId`, `currencyId`, `unitId`, `unitGroupId`, `um`, `singleTransactionThreshold`, `cumulativeTransactionThreshold`.

---

## Fiscal Framework

```bash
# Fiscal authorities
absuite accounting list fiscal-authorities --TenantId $TENANT_ID
absuite accounting count fiscal-authorities --TenantId $TENANT_ID
absuite accounting get fiscal-authority --TenantId $TENANT_ID --AuthorityId <authority-guid>
absuite accounting create fiscal-authority --TenantId $TENANT_ID --FiscalAuthorityCreateDto '{"Name": "<authority-name>", "Description": "<description>", "CountryId": "<country-guid>", "WebUrl": "<web-url>"}'
absuite accounting update fiscal-authority --TenantId $TENANT_ID --AuthorityId <authority-guid> --FiscalAuthorityUpdateDto '{"Name": "<authority-name>"}'
absuite accounting delete fiscal-authority --TenantId $TENANT_ID --AuthorityId <authority-guid>

# Fiscal years (standalone controller)
absuite accounting list fiscal-years --TenantId $TENANT_ID
absuite accounting count fiscal-years --TenantId $TENANT_ID
absuite accounting get fiscal-year-details --TenantId $TENANT_ID --FiscalYearId <year-guid>
absuite accounting create fiscal-year --TenantId $TENANT_ID --FiscalYearCreateDto '{"Name": "FY2026", "StartDate": "2026-01-01T00:00:00Z", "EndDate": "2026-12-31T23:59:59Z", "Closed": false, "FiscalAuthorityId": "<authority-guid>"}'
absuite accounting update fiscal-year --TenantId $TENANT_ID --FiscalYearId <year-guid> --FiscalYearUpdateDto '{"Closed": true}'
absuite accounting delete fiscal-year --TenantId $TENANT_ID --FiscalYearId <year-guid>

# Authority-scoped fiscal years (reads also require --FiscalAuthorityId)
absuite accounting list fiscal-years-by-authority --TenantId $TENANT_ID --AuthorityId <authority-guid> --FiscalAuthorityId <authority-guid>

# Fiscal periods (reads authority+year scoped; create/update/delete flat)
absuite accounting list fiscal-periods --TenantId $TENANT_ID --AuthorityId <authority-guid> --FiscalYearId <year-guid> --FiscalAuthorityId <authority-guid>
absuite accounting create fiscal-period --TenantId $TENANT_ID --FiscalPeriodCreateDto '{"Name": "January 2026", "FromDate": "2026-01-01T00:00:00Z", "ToDate": "2026-01-31T23:59:59Z", "FiscalYearId": "<year-guid>"}'
absuite accounting update fiscal-period --TenantId $TENANT_ID --FiscalPeriodId <period-guid> --FiscalPeriodUpdateDto '{"Name": "Jan 2026"}'
absuite accounting delete fiscal-period --TenantId $TENANT_ID --FiscalPeriodId <period-guid>

# Fiscal regimes
absuite accounting list fiscal-regimes --TenantId $TENANT_ID --AuthorityId <authority-guid> --FiscalAuthorityId <authority-guid>
absuite accounting create fiscal-regime --TenantId $TENANT_ID --FiscalRegimeCreateDto '{"Code": "<regime-code>", "Name": "<regime-name>", "FiscalAuthorityId": "<authority-guid>"}'
absuite accounting update fiscal-regime --TenantId $TENANT_ID --RegimeId <regime-guid> --FiscalRegimeUpdateDto '{"Name": "<regime-name>"}'
absuite accounting delete fiscal-regime --TenantId $TENANT_ID --RegimeId <regime-guid>

# Fiscal responsibilities + records
absuite accounting list fiscal-responsibilities --TenantId $TENANT_ID --AuthorityId <authority-guid> --FiscalAuthorityId <authority-guid>
absuite accounting create fiscal-responsibility --TenantId $TENANT_ID --FiscalResponsibilityCreateDto '{"Code": "<resp-code>", "Name": "<resp-name>", "FiscalAuthorityId": "<authority-guid>"}'
absuite accounting create fiscal-responsibility-record --TenantId $TENANT_ID --FiscalResponsibilityRecordCreateDto '{"FiscalResponsibilityId": "<resp-guid>", "BillingProfileId": "<profile-guid>"}'

# Fiscal identification types
absuite accounting list fiscal-identification-types --TenantId $TENANT_ID --AuthorityId <authority-guid>
absuite accounting create fiscal-identification-type --TenantId $TENANT_ID --FiscalIdentificationTypeCreateDto '{"Code": "<id-type-code>", "Name": "<id-type-name>", "FiscalAuthorityId": "<authority-guid>"}'
absuite accounting update fiscal-identification-type --TenantId $TENANT_ID --IdentificationTypeId <type-guid> --FiscalIdentificationTypeUpdateDto '{"Name": "<id-type-name>"}'
absuite accounting delete fiscal-identification-type --TenantId $TENANT_ID --IdentificationTypeId <type-guid>
```

Canonical: `Get-FiscalAuthorities`, `New-FiscalAuthority`, `Update-FiscalAuthority`,
`Invoke-DeleteFiscalAuthority`; `Get-FiscalYearsAsync` / `Get-FiscalYears` (authority),
`New-FiscalYearAsync` / `New-FiscalYear`, `Update-FiscalYearAsync` / `Update-FiscalYear`,
`Invoke-DeleteFiscalYearAsync` / `Invoke-DeleteFiscalYear`; `Get-FiscalPeriods`, `New-FiscalPeriod`,
`Update-FiscalPeriod`, `Invoke-DeleteFiscalPeriod`; `Get-FiscalRegimes`, `New-FiscalRegime`,
`Update-FiscalRegime`, `Invoke-DeleteFiscalRegime`; `Get-FiscalResponsibilities`,
`New-FiscalResponsibility`, `New-FiscalResponsibilityRecord`; `Get-FiscalIdentificationTypes`,
`New-FiscalIdentificationType`, `Update-FiscalIdentificationType`, `Invoke-DeleteFiscalIdentificationType`.

**FiscalAuthorityCreateDto:** `name`, `description`, `countryId`, `logoUrl`, `webUrl`.
**FiscalYearCreateDto:** `name`, `description`, `closed` (bool), `endDate`, `startDate`, `fiscalAuthorityId`.
**FiscalPeriodCreateDto:** `name`, `fromDate`, `toDate`, `fiscalYearId`.
**FiscalRegime/Responsibility/IdentificationType CreateDto:** `code`, `name`, `fiscalAuthorityId`.
**FiscalResponsibilityRecordCreateDto:** `fiscalResponsibilityId`, `billingProfileId`.

## Invoice Enumeration Ranges

```bash
# Standalone controller
absuite accounting list invoice-enumeration-ranges --TenantId $TENANT_ID
absuite accounting get invoice-enumeration-range-details --TenantId $TENANT_ID --RangeId <range-guid>
absuite accounting create invoice-enumeration-range --TenantId $TENANT_ID --InvoiceEnumerationRangeCreateDto '{
  "Prefix": "FE", "NumerationFrom": 1, "NumerationTo": 5000,
  "ValidFrom": "2026-01-01T00:00:00Z", "ValidTo": "2027-01-01T00:00:00Z",
  "FiscalAuthorityId": "<authority-guid>", "DocumentType": "Standard"
}'
absuite accounting update invoice-enumeration-range --TenantId $TENANT_ID --RangeId <range-guid> --InvoiceEnumerationRangeUpdateDto '{"CurrentNumeration": 42}'
absuite accounting delete invoice-enumeration-range --TenantId $TENANT_ID --RangeId <range-guid>

# Authority-scoped reads / writes (FiscalEnumerationRanges)
absuite accounting list authority-enumeration-ranges --TenantId $TENANT_ID --AuthorityId <authority-guid> --FiscalAuthorityId <authority-guid>
absuite accounting create authority-enumeration-range --TenantId $TENANT_ID --InvoiceEnumerationRangeCreateDto '{...}'
absuite accounting delete authority-enumeration-range --TenantId $TENANT_ID --EnumerationRangeId <range-guid>
```

**InvoiceEnumerationRangeCreateDto:** `prefix`, `suffix`, `identifier`, `qualifiedName`, `currentNumeration` (int), `numerationFrom` (int), `numerationTo` (int), `validFrom` (REQ), `validTo` (REQ), `fiscalAuthorityId`, `documentType` (`Standard|DebitNote|CreditNote`).

---

## Billing Profiles & Bank Profiles

```bash
absuite accounting list billing-profiles --TenantId $TENANT_ID
absuite accounting count billing-profiles --TenantId $TENANT_ID
absuite accounting get billing-profile-by-id --TenantId $TENANT_ID --BillingProfileId <profile-guid>
absuite accounting create billing-profile --TenantId $TENANT_ID --BillingProfileCreateDto '{
  "BusinessName": "<business-name>", "CommercialName": "<commercial-name>", "TaxId": "<tax-id>",
  "Email": "<billing-email>", "Phone": "<phone>", "Address": "<address>", "PostalCode": "<postal-code>",
  "TaxPayerType": "Business", "CountryId": "<country-guid>", "StateId": "<state-guid>", "CityId": "<city-guid>",
  "FiscalIdentificationTypeId": "<id-type-guid>", "FiscalAuthorityId": "<authority-guid>", "FiscalRegimeId": "<regime-guid>"
}'
absuite accounting update billing-profile --TenantId $TENANT_ID --BillingProfileId <profile-guid> --BillingProfileUpdateDto '{"Email": "<billing-email>"}'
absuite accounting delete billing-profile --TenantId $TENANT_ID --BillingProfileId <profile-guid>

# Bank profiles (read-only)
absuite accounting list bank-profiles --TenantId $TENANT_ID
absuite accounting count bank-profiles --TenantId $TENANT_ID
```

**BillingProfileCreateDto required:** `taxId`, `phone`, `email`, `address`, `postalCode`, `businessName`, `commercialName`, `countryId`, `stateId`, `cityId`, `fiscalIdentificationTypeId`, `fiscalAuthorityId`, `fiscalRegimeId`. **Optional:** `contactId`, `address1`, `address2`, `ticker`, `duns`, `isPublicCompany`, `isFactaCustomer`, `taxPayerType` (`Individual|Business`).

---

## Banking

Bank accounts, guarantees, and transactions are **nested under a bank** — pass `--BankId` on every one of their verbs.

```bash
# Banks
absuite accounting list banks --TenantId $TENANT_ID
absuite accounting count banks --TenantId $TENANT_ID
absuite accounting get bank --TenantId $TENANT_ID --BankId <bank-guid>
absuite accounting create bank --TenantId $TENANT_ID --BankCreateDto '{"Name": "<bank-name>", "Image": "<logo-url>", "CountryId": "<country-guid>"}'
absuite accounting update bank --TenantId $TENANT_ID --BankId <bank-guid> --BankUpdateDto '{"Name": "<bank-name>"}'
absuite accounting delete bank --TenantId $TENANT_ID --BankId <bank-guid>

# Bank accounts (nested; sub-resource id param is --AccountId)
absuite accounting list bank-accounts --TenantId $TENANT_ID --BankId <bank-guid>
absuite accounting count bank-accounts --TenantId $TENANT_ID --BankId <bank-guid>
absuite accounting get bank-account --TenantId $TENANT_ID --BankId <bank-guid> --AccountId <account-guid>
absuite accounting create bank-account --TenantId $TENANT_ID --BankId <bank-guid> --BankAccountCreateDto '{"Name": "Operating Account", "Iban": "<iban>", "Swift": "<swift>", "BankAccountNumber": "<account-number>", "BankId": "<bank-guid>"}'
absuite accounting update bank-account --TenantId $TENANT_ID --BankId <bank-guid> --AccountId <account-guid> --BankAccountUpdateDto '{"Name": "Main Operating Account"}'
absuite accounting delete bank-account --TenantId $TENANT_ID --BankId <bank-guid> --AccountId <account-guid>

# Bank guarantees (nested; sub-resource id param is --GuaranteeId)
absuite accounting list bank-guarantees --TenantId $TENANT_ID --BankId <bank-guid>
absuite accounting create bank-guarantee --TenantId $TENANT_ID --BankId <bank-guid> --BankGuaranteeCreateDto '{"BeneficiaryName": "<beneficiary>", "GuaranteeNumber": "<number>", "BankGuaranteeType": "Receiving", "ValidityInDays": 90, "CurrencyId": "<currency-guid>", "BankAccountId": "<bank-account-guid>"}'
absuite accounting update bank-guarantee --TenantId $TENANT_ID --BankId <bank-guid> --GuaranteeId <guarantee-guid> --BankGuaranteeUpdateDto '{...}'
absuite accounting delete bank-guarantee --TenantId $TENANT_ID --BankId <bank-guid> --GuaranteeId <guarantee-guid>

# Bank transactions (nested; sub-resource id param is --TransactionId)
absuite accounting list bank-transactions --TenantId $TENANT_ID --BankId <bank-guid>
absuite accounting create bank-transaction --TenantId $TENANT_ID --BankId <bank-guid> --BankTransactionCreateDto '{"Description": "<description>", "Price": 100.0, "Quantity": 1, "CurrencyId": "<currency-guid>", "TransactionCategoryId": "<category-guid>", "BankAccountId": "<bank-account-guid>"}'
absuite accounting update bank-transaction --TenantId $TENANT_ID --BankId <bank-guid> --TransactionId <txn-guid> --BankTransactionUpdateDto '{...}'
absuite accounting delete bank-transaction --TenantId $TENANT_ID --BankId <bank-guid> --TransactionId <txn-guid>
```

Canonical: `Get-Banks`/`-Count`, `Get-Bank`, `New-Bank`, `Update-Bank`, `Invoke-DeleteBank`;
`Get-BankAccounts`, `Get-BankAccount`, `New-BankAccount`, `Update-BankAccount`, `Invoke-DeleteBankAccount`;
`Get-BankGuarantees`, `New-BankGuarantee`, `Update-BankGuarantee`, `Invoke-DeleteBankGuarantee`;
`Get-BankTransactions`, `New-BankTransaction`, `Update-BankTransaction`, `Invoke-DeleteBankTransaction`.

**BankCreateDto:** `name`, `image`, `countryId`. **BankAccountCreateDto:** `name`, `iban`, `swift`, `branchCode`, `bankAccountNumber`, `bankId`, `bankProfileId`, `walletId`. **BankGuaranteeCreateDto key fields:** `beneficiaryName`, `guaranteeNumber`, `bankGuaranteeType` (`Receiving|Providing`), `validityInDays` (int), `margin`, `charges`, `startDate`, `endDate`, `currencyId`, `bankAccountId`, `bankProfileId`, `contactId`, `projectId`, `orderId`, `fixedDepositNumber`, `guaranteeConditions`. **BankTransactionCreateDto key fields:** `description`, `price`, `quantity`, `currencyId`, `transactionCategoryId`, `bankAccountId`, `bankProfileId`, `externalDescription`, `basisQuantity`, `basisAmount`, `percent`, `unitId`, `unitGroupId`.

---

## Budgets, Cost Centres, Commissions

```bash
# Budgets + budget account entries
absuite accounting list budgets --TenantId $TENANT_ID
absuite accounting count budgets --TenantId $TENANT_ID
absuite accounting get budget-details --TenantId $TENANT_ID --BudgetId <budget-guid>
absuite accounting create budget --TenantId $TENANT_ID --BudgetCreateDto '{"Name": "FY2026 Budget", "FiscalYearId": "<year-guid>"}'
absuite accounting update budget --TenantId $TENANT_ID --BudgetId <budget-guid> --BudgetUpdateDto '{"Name": "FY2026 Budget (rev)"}'
absuite accounting delete budget --TenantId $TENANT_ID --BudgetId <budget-guid>
absuite accounting list budget-account-entries --TenantId $TENANT_ID --BudgetId <budget-guid>
absuite accounting create budget-account-entry --TenantId $TENANT_ID --BudgetId <budget-guid> --BudgetAccountEntryCreateDto '{"Description": "Marketing allocation", "Amount": 10000.0, "CurrencyId": "<currency-guid>", "AccountingEntryType": "Debit", "BudgetId": "<budget-guid>"}'
absuite accounting update budget-account-entry --TenantId $TENANT_ID --BudgetId <budget-guid> --EntryId <entry-guid> --BudgetAccountEntryUpdateDto '{"Amount": 12000.0}'
absuite accounting delete budget-account-entry --TenantId $TENANT_ID --BudgetId <budget-guid> --EntryId <entry-guid>

# Cost centres + budgets + groups
absuite accounting list cost-centres --TenantId $TENANT_ID
absuite accounting count cost-centres --TenantId $TENANT_ID
absuite accounting get cost-centre --TenantId $TENANT_ID --CostCentreId <cost-centre-guid>
absuite accounting create cost-centre --TenantId $TENANT_ID --CostCentreCreateDto '{"Name": "Production Floor", "Disabled": false, "CostCentreType": "Production", "CostCentresGroupId": "<group-guid>"}'
absuite accounting update cost-centre --TenantId $TENANT_ID --CostCentreId <cost-centre-guid> --CostCentreUpdateDto '{"Disabled": true}'
absuite accounting delete cost-centre --TenantId $TENANT_ID --CostCentreId <cost-centre-guid>
absuite accounting list cost-centre-budgets --TenantId $TENANT_ID
absuite accounting create cost-centre-budget --TenantId $TENANT_ID --CostCentreBudgetCreateDto '{"Name": "FY2026 CC Budget", "FiscalYearId": "<year-guid>", "CostCentreId": "<cost-centre-guid>"}'
absuite accounting list cost-centre-groups --TenantId $TENANT_ID
absuite accounting count cost-centre-groups --TenantId $TENANT_ID
absuite accounting create cost-centre-group --TenantId $TENANT_ID --CostCentreGroupCreateDto '{"Name": "Manufacturing", "Disabled": false}'

# Commissions + payment commissions
absuite accounting list commissions --TenantId $TENANT_ID
absuite accounting count commissions --TenantId $TENANT_ID
absuite accounting get commission --TenantId $TENANT_ID --CommissionId <commission-guid>
absuite accounting create commission --TenantId $TENANT_ID --CommissionCreateDto '{"Title": "Sales commission", "BaseAmount": 1000.0, "AddedPercent": 5.0, "EmisorContactId": "<contact-guid>", "ReceiverContactId": "<contact-guid>"}'
absuite accounting update commission --TenantId $TENANT_ID --CommissionId <commission-guid> --CommissionUpdateDto '{"AddedPercent": 7.5}'
absuite accounting delete commission --TenantId $TENANT_ID --CommissionId <commission-guid>
absuite accounting list payment-commissions --TenantId $TENANT_ID
absuite accounting create payment-commission --TenantId $TENANT_ID --PaymentCommissionCreateDto '{"PaymentId": "<payment-guid>"}'
```

Canonical: `Get-BudgetsAsync`, `New-BudgetAsync`, `Update-BudgetAsync`, `Invoke-DeleteBudgetAsync`,
`Get-BudgetAccountEntriesCollectionAsync`, `New-BudgetAccountEntryAsync`, `Update-BudgetAccountEntryAsync`,
`Invoke-DeleteBudgetAccountEntryAsync`; `Get-CostCentres`, `New-CostCentre`, `Update-CostCentre`,
`Invoke-DeleteCostCentre`, `Get-CostCentreBudgets`, `New-CostCentreBudget`, `Get-CostCentreGroups`,
`New-CostCentreGroup`; `Get-CommissionsAsync`, `New-CommissionAsync`, `Update-CommissionAsync`,
`Invoke-DeleteCommissionAsync`, `Get-PaymentCommissionsAsync`, `New-PaymentCommissionAsync`.

**BudgetCreateDto:** `name`, `fiscalYearId`. **BudgetAccountEntryCreateDto required:** `description`, `currencyId`. **CostCentreCreateDto:** `name`, `disabled`, `description`, `costCentreType` (`Service|Production`), `costCentresGroupId`, `parentCostCentreId`. **CostCentreBudgetCreateDto:** `name`, `fiscalYearId`, `costCentreId`. **CostCentreGroupCreateDto:** `name`, `description`, `disabled`, `parentCostCentresGroupId`. **CommissionCreateDto key fields:** `title`, `description`, `baseAmount`, `addedPercent`, `addedAmount`, `taxComission`, `salaryId`, `emisorWalletAccountId`, `receiverWalletAccountId`, `emisorContactId`, `receiverContactId`. **PaymentCommissionCreateDto:** `paymentId`.

---

## Receipts, Grants, Loans, Shares, Transactions, Expenses

```bash
# Receipts
absuite accounting list receipts --TenantId $TENANT_ID
absuite accounting count receipts --TenantId $TENANT_ID
absuite accounting get receipt-details --TenantId $TENANT_ID --ReceiptId <receipt-guid>
absuite accounting create receipt --TenantId $TENANT_ID --ReceiptCreateDto '{"Title": "Receipt #1", "ReceiptType": "PaymentReceipt", "CostCalculationMethod": "Automatic", "TaxCalculationMethod": "Included", "CurrencyId": "<currency-guid>", "ContactId": "<contact-guid>", "Total": 5000.0, "Closed": false}'
absuite accounting update receipt --TenantId $TENANT_ID --ReceiptId <receipt-guid> --ReceiptUpdateDto '{"Closed": true}'
absuite accounting delete receipt --TenantId $TENANT_ID --ReceiptId <receipt-guid>

# Grants
absuite accounting list grants --TenantId $TENANT_ID
absuite accounting count grants --TenantId $TENANT_ID
absuite accounting get grant-details --TenantId $TENANT_ID --GrantId <grant-guid>
absuite accounting create grant --TenantId $TENANT_ID --GrantCreateDto '{}'
absuite accounting update grant --TenantId $TENANT_ID --GrantId <grant-guid> --GrantUpdateDto '{}'
absuite accounting delete grant --TenantId $TENANT_ID --GrantId <grant-guid>

# Loans + loan types + applications
absuite accounting list loans --TenantId $TENANT_ID
absuite accounting count loans --TenantId $TENANT_ID
absuite accounting get loan-details --TenantId $TENANT_ID --LoanId <loan-guid>
absuite accounting create loan --TenantId $TENANT_ID --LoanCreateDto '{"Value": 10000.0, "InterestRate": 5.0, "IsCompundInterestRate": false, "LoanTypeId": "<loan-type-guid>", "CurrencyId": "<currency-guid>"}'
absuite accounting update loan --TenantId $TENANT_ID --LoanId <loan-guid> --LoanUpdateDto '{"InterestRate": 4.5}'
absuite accounting delete loan --TenantId $TENANT_ID --LoanId <loan-guid>
absuite accounting list loan-types --TenantId $TENANT_ID
absuite accounting create loan-type --TenantId $TENANT_ID --LoanTypeCreateDto '{"Name": "Working Capital", "Description": "..."}'
absuite accounting list loan-applications --TenantId $TENANT_ID
absuite accounting create loan-application --TenantId $TENANT_ID --LoanApplicationCreateDto '{}'

# Shares (Classes / Issuances / Transfers / TransferReasons)
absuite accounting list share-classes --TenantId $TENANT_ID
absuite accounting create share-class --TenantId $TENANT_ID --ShareClassCreateDto '{"Name": "Common", "Value": true, "CurrencyId": "<currency-guid>"}'
absuite accounting list share-issuances --TenantId $TENANT_ID
absuite accounting create share-issuance --TenantId $TENANT_ID --ShareIssuanceCreateDto '{"UnitPrice": 10, "Quantity": 1000, "CurrencyId": "<currency-guid>"}'
absuite accounting list share-transfers --TenantId $TENANT_ID
absuite accounting create share-transfer --TenantId $TENANT_ID --ShareTransferCreateDto '{"Description": "Founder transfer", "Value": 5000.0, "NewShareHolderId": "<shareholder-guid>", "FormerShareHolderId": "<shareholder-guid>", "ShareTransferReasonId": "<reason-guid>"}'
absuite accounting list share-transfer-reasons --TenantId $TENANT_ID
absuite accounting create share-transfer-reason --TenantId $TENANT_ID --ShareTransferReasonCreateDto '{"Name": "Sale", "Description": "..."}'

# Transactions + categories
absuite accounting list transactions --TenantId $TENANT_ID
absuite accounting count transactions --TenantId $TENANT_ID
absuite accounting get transaction --TenantId $TENANT_ID --TransactionId <transaction-guid>
absuite accounting create transaction --TenantId $TENANT_ID --TransactionCreateDto '{"Description": "Service fee", "Price": 250.0, "Quantity": 1, "CurrencyId": "<currency-guid>", "TransactionCategoryId": "<category-guid>"}'
absuite accounting update transaction --TenantId $TENANT_ID --TransactionId <transaction-guid> --TransactionUpdateDto '{"Price": 300.0}'
absuite accounting delete transaction --TenantId $TENANT_ID --TransactionId <transaction-guid>
absuite accounting list transaction-categories --TenantId $TENANT_ID
absuite accounting create transaction-category --TenantId $TENANT_ID --TransactionCategoryCreateDto '{"Name": "Services", "Description": "..."}'

# Expense claims + types
absuite accounting list expense-types --TenantId $TENANT_ID
absuite accounting create expense-type --TenantId $TENANT_ID --ExpenseTypeCreateDto '{"Name": "Travel", "Enabled": true}'
absuite accounting list expense-claims --TenantId $TENANT_ID
absuite accounting create expense-claim --TenantId $TENANT_ID --ExpenseClaimCreateDto '{"ExpenseTypeId": "<expense-type-guid>"}'
```

Canonical: `Get-ReceiptsAsync`, `New-ReceiptAsync`, `Update-ReceiptAsync`, `Invoke-DeleteReceiptAsync`;
`Get-GrantsAsync`, `New-GrantAsync`, `Update-GrantAsync`, `Invoke-DeleteGrantAsync`;
`Get-LoansAsync`, `New-LoanAsync`, `Update-LoanAsync`, `Invoke-DeleteLoanAsync`, `Get-LoanTypesAsync`,
`New-LoanTypeAsync`, `Get-LoanApplicationsAsync`, `New-LoanApplicationAsync`; `Get-ShareClasses`,
`New-ShareClass`, `Get-ShareIssuances`, `New-ShareIssuance`, `Get-ShareTransfers`, `New-ShareTransfer`,
`Get-ShareTransferReasons`, `New-ShareTransferReason`; `Get-Transactions`, `New-Transaction`,
`Update-Transaction`, `Invoke-DeleteTransaction`, `Get-TransactionCategories`, `New-TransactionCategory`;
`Get-ExpenseTypes`, `New-ExpenseType`, `Get-ExpenseClaims`, `New-ExpenseClaim`.

**ReceiptCreateDto enums:** `receiptType` (`PaymentReceipt|PurchaseReceipt`), `costCalculationMethod` (`Automatic|Custom`), `taxCalculationMethod` (`Included|Excluded`). **LoanCreateDto:** `value`, `interestRate`, `isCompundInterestRate`, `loanTimestamp`, `paymentDeadline`, `loanTypeId`, `currencyId`. **LoanTypeCreateDto:** `name` (REQ), `description`. **ShareClassCreateDto:** `name`, `value` (bool), `description`, `forexRates`, `currencyId`. **ShareIssuanceCreateDto:** `unitPrice` (int), `quantity` (int), `currencyId`. **ShareTransferCreateDto:** `description`, `value`, `newShareHolderId`, `formerShareHolderId`, `shareTransferReasonId`. **TransactionCreateDto:** `description`, `price`, `quantity`, `currencyId`, `transactionCategoryId`, `externalDescription`, `basisQuantity`, `basisAmount`, `percent`, `unitId`, `unitGroupId`. **ExpenseTypeCreateDto:** `name`, `enabled`. **ExpenseClaimCreateDto:** `expenseTypeId`.

---

## End-to-end workflow

```bash
# 1. Seed a chart of accounts
absuite accounting seed chart-of-accounts --TenantId $TENANT_ID --SeedChartOfAccountsRequest '{"fileUrl": "<chart-of-accounts-file-url>"}'

# 2. Create ledger type, ledger, journal type, journal
absuite accounting create ledger-type  --TenantId $TENANT_ID --LedgerTypeCreateDto '{"Name": "Asset Ledger", "LedgerClass": "Assets"}'
absuite accounting create ledger       --TenantId $TENANT_ID --CreateLedgerDto '{"Name": "General Ledger", "LedgerTypeId": "<ledger-type-guid>"}'
absuite accounting create journal-type --TenantId $TENANT_ID --JournalTypeCreateDto '{"Name": "Sales Journal"}'
absuite accounting create journal      --TenantId $TENANT_ID --JournalCreateDto '{"Name": "April 2026", "JournalTypeId": "<journal-type-guid>", "LedgerId": "<ledger-guid>"}'

# 3. Post a balanced journal entry
absuite accounting create journal-entry --TenantId $TENANT_ID --JournalId <journal-guid> --JournalEntryCreateDto '{"Description": "Client payment", "Date": "2026-04-19T00:00:00Z", "Debit": 5000, "Credit": 5000, "JournalId": "<journal-guid>", "CurrencyId": "<currency-guid>", "DebitAccountId": "<cash-acct>", "CreditAccountId": "<ar-acct>"}'

# 4. Balance accounts and aggregate
absuite accounting balance account --TenantId $TENANT_ID --AccountId <account-guid>
absuite accounting aggregate accounts-balance --TenantId $TENANT_ID
```

---

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List accounts | `absuite accounting list accounts` |
| Count accounts | `absuite accounting count accounts` |
| List root accounts | `absuite accounting list root-accounts` |
| List child accounts | `absuite accounting list child-accounts --AccountId <id>` |
| Get account | `absuite accounting get account-details --AccountId <id>` |
| Create account | `absuite accounting create account --AccountCreateDto '{...}'` |
| Update account | `absuite accounting update account --AccountId <id> --AccountUpdateDto '{...}'` |
| Delete account | `absuite accounting delete account --AccountId <id>` |
| Balance account | `absuite accounting balance account --AccountId <id>` |
| Balance root accounts | `absuite accounting balance root-accounts` |
| Aggregate accounts balance | `absuite accounting aggregate accounts-balance` |
| List charts of accounts | `absuite accounting list charts-of-accounts` |
| Seed chart of accounts | `absuite accounting seed chart-of-accounts --SeedChartOfAccountsRequest '{...}'` |
| List account entries | `absuite accounting list account-entries --AccountId <id>` |
| Get account entry | `absuite accounting get account-entry --AccountId <id> --EntryId <id>` |
| Create account entry | `absuite accounting create account-entry --AccountId <id> --AccountingEntryCreateDto '{...}'` |
| Create debit / credit | `absuite accounting create account-debit \| account-credit --AccountId <id> --AccountingEntryCreateDto '{...}'` |
| Update account entry | `absuite accounting update account-entry --AccountId <id> --EntryId <id> --AccountingEntryUpdateDto '{...}'` |
| Delete account entry | `absuite accounting delete account-entry --AccountId <id> --EntryId <id>` |
| List / create account types | `absuite accounting list \| create account-type[s] ...` |
| List / create account relations | `absuite accounting list \| create account-relation[s] --AccountId <id> ...` |
| List / create account groups | `absuite accounting list \| create account-group[s] ...` |
| List / create accounting periods | `absuite accounting list \| create accounting-period[s] ...` |
| List journals | `absuite accounting list journals` |
| Get journal | `absuite accounting get journal-details --JournalId <id>` |
| Create journal | `absuite accounting create journal --JournalCreateDto '{...}'` |
| Update / delete journal | `absuite accounting update \| delete journal --JournalId <id> ...` |
| List / create journal entries | `absuite accounting list \| create journal-entr[y\|ies] --JournalId <id> ...` |
| Aggregate journal entry credits/debits | `absuite accounting aggregate journal-entry-credits \| journal-entry-debits --JournalId <id>` |
| List / create journal types | `absuite accounting list \| create journal-type[s] ...` |
| List / create ledgers | `absuite accounting list \| create ledger[s] ...` |
| List / create ledger types | `absuite accounting list \| create ledger-type[s] ...` |
| List / create financial books | `absuite accounting list \| create financial-book[s] ...` |
| List / create tax classes | `absuite accounting list \| create tax-class[es] --Id <id> ...` |
| List / create tax policies | `absuite accounting list \| create tax-polic[y\|ies] --Id <id> ...` |
| Tax policies by authority | `absuite accounting get tax-policies-by-authority --AuthorityId <id>` |
| List / create applied tax policy records | `absuite accounting list \| create applied-tax-policy-record[s] --TaxPolicyId <id> ...` |
| List / create item tax policy records | `absuite accounting list \| create item-tax-policy-record[s] --TaxPolicyId <id> ...` |
| List / create tax rates | `absuite accounting list \| create tax-rate[s] --Id <id> ...` |
| List / create billable line taxes | `absuite accounting list \| create billable-line-tax[es] --BillableLineId <id> ...` |
| List / create fiscal authorities | `absuite accounting list \| create fiscal-authorit[y\|ies] --AuthorityId <id> ...` |
| List / create fiscal years | `absuite accounting list \| create fiscal-year[s] --FiscalYearId <id> ...` |
| List / create fiscal periods | `absuite accounting list \| create fiscal-period[s] ...` |
| List / create fiscal regimes | `absuite accounting list \| create fiscal-regime[s] --RegimeId <id> ...` |
| List / create fiscal responsibilities | `absuite accounting list \| create fiscal-responsibilit[y\|ies] ...` |
| Create fiscal responsibility record | `absuite accounting create fiscal-responsibility-record --FiscalResponsibilityRecordCreateDto '{...}'` |
| List / create fiscal identification types | `absuite accounting list \| create fiscal-identification-type[s] --IdentificationTypeId <id> ...` |
| List / create invoice enumeration ranges | `absuite accounting list \| create invoice-enumeration-range[s] --RangeId <id> ...` |
| List / create billing profiles | `absuite accounting list \| create billing-profile[s] --BillingProfileId <id> ...` |
| List / count bank profiles | `absuite accounting list \| count bank-profiles` |
| List / create banks | `absuite accounting list \| create bank[s] --BankId <id> ...` |
| List / create bank accounts | `absuite accounting list \| create bank-account[s] --BankId <id> --AccountId <id> ...` |
| List / create bank guarantees | `absuite accounting list \| create bank-guarantee[s] --BankId <id> --GuaranteeId <id> ...` |
| List / create bank transactions | `absuite accounting list \| create bank-transaction[s] --BankId <id> --TransactionId <id> ...` |
| List / create budgets | `absuite accounting list \| create budget[s] --BudgetId <id> ...` |
| List / create budget account entries | `absuite accounting list \| create budget-account-entr[y\|ies] --BudgetId <id> --EntryId <id> ...` |
| List / create cost centres | `absuite accounting list \| create cost-centre[s] --CostCentreId <id> ...` |
| List / create cost centre budgets | `absuite accounting list \| create cost-centre-budget[s] --BudgetId <id> ...` |
| List / create cost centre groups | `absuite accounting list \| create cost-centre-group[s] --GroupId <id> ...` |
| List / create commissions | `absuite accounting list \| create commission[s] --CommissionId <id> ...` |
| List / create payment commissions | `absuite accounting list \| create payment-commission[s] --PaymentCommissionId <id> ...` |
| List / create receipts | `absuite accounting list \| create receipt[s] --ReceiptId <id> ...` |
| List / create grants | `absuite accounting list \| create grant[s] --GrantId <id> ...` |
| List / create loans | `absuite accounting list \| create loan[s] --LoanId <id> ...` |
| List / create loan types | `absuite accounting list \| create loan-type[s] --LoanTypeId <id> ...` |
| List / create loan applications | `absuite accounting list \| create loan-application[s] --ApplicationId <id> ...` |
| List / create share classes | `absuite accounting list \| create share-class[es] --ShareClassId <id> ...` |
| List / create share issuances | `absuite accounting list \| create share-issuance[s] --IssuanceId <id> ...` |
| List / create share transfers | `absuite accounting list \| create share-transfer[s] --TransferId <id> ...` |
| List / create share transfer reasons | `absuite accounting list \| create share-transfer-reason[s] --ReasonId <id> ...` |
| List / create transactions | `absuite accounting list \| create transaction[s] --TransactionId <id> ...` |
| List / create transaction categories | `absuite accounting list \| create transaction-categor[y\|ies] --CategoryId <id> ...` |
| List / create expense claims | `absuite accounting list \| create expense-claim[s] --ExpenseClaimId <id> ...` |
| List / create expense types | `absuite accounting list \| create expense-type[s] --ExpenseTypeId <id> ...` |

> The exact verb/entity tokens and parameter aliases are confirmed by `absuite accounting
> list-commands` and `absuite accounting <verb> <entity> --help`. When in doubt, use the
> canonical `<Verb>-<Noun>` cmdlet form shown in each section above. For PATCH/partial updates,
> use the `absuite-accounting` REST skill.
