---
name: absuite-accounting-cli
key: fenixalliance.absuite.accounting-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Accounting area with the absuite CLI: 224 commands (127
  read, 97 write) under `absuite accounting`, each generated from the platform's ServiceClients and
  checked against `absuite commands -o json`. For routes the CLI does not cover, use the
  absuite-accounting REST skill.
---

# Alliance Business Suite — Accounting Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-accounting` REST skill documents 61 routes; 17 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-accounting` REST skill.

## Commands

224 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Account Groups (`absuite accounting account-groups`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting account-groups list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's account-groups. `GET /api/v2/AccountingService/AccountGroups` |
| `absuite accounting account-groups count` | Reads |  |  | Count the workspace's account-groups. `GET /api/v2/AccountingService/AccountGroups/Count` |
| `absuite accounting account-groups get` | Reads | `<id>` | `--columns` | Show one of the workspace's account-groups. `GET /api/v2/AccountingService/AccountGroups/{accountGroupId}` |
| `absuite accounting account-groups create` | Writes |  | `--title`, `--description`, `--parent-account-group-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's account-groups. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/AccountGroups` |
| `absuite accounting account-groups update` | Writes | `<id>` | `--title`, `--description`, `--parent-account-group-id`; `--json` `--file` `--dry-run` | Change one of the workspace's account-groups: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/AccountGroups/{accountGroupId}` |
| `absuite accounting account-groups delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's account-groups; it asks first unless --yes. `DELETE /api/v2/AccountingService/AccountGroups/{accountGroupId}` |

### Accounting Periods (`absuite accounting accounting-periods`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting accounting-periods list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's accounting-periods. `GET /api/v2/AccountingService/AccountingPeriods` |
| `absuite accounting accounting-periods count` | Reads |  |  | Count the workspace's accounting-periods. `GET /api/v2/AccountingService/AccountingPeriods/Count` |
| `absuite accounting accounting-periods get` | Reads | `<id>` | `--columns` | Show one of the workspace's accounting-periods. `GET /api/v2/AccountingService/AccountingPeriods/{accountingPeriodId}` |
| `absuite accounting accounting-periods create` | Writes |  | `--name`, `--date-start`, `--date-end`; `--json` `--file` `--dry-run` | Create a record in the workspace's accounting-periods. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/AccountingPeriods` |
| `absuite accounting accounting-periods update` | Writes | `<id>` | `--name`, `--date-start`, `--date-end`; `--json` `--file` `--dry-run` | Change one of the workspace's accounting-periods: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/AccountingPeriods/{accountingPeriodId}` |
| `absuite accounting accounting-periods delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's accounting-periods; it asks first unless --yes. `DELETE /api/v2/AccountingService/AccountingPeriods/{accountingPeriodId}` |

### Accounts (`absuite accounting accounts`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting accounts list` | Reads |  | `--top` `--skip` | List the accounts in the workspace. |
| `absuite accounting accounts count` | Reads |  |  | Count the workspace's accounts. `GET /api/v2/AccountingService/Accounts/Count` |
| `absuite accounting accounts get` | Reads | `<id>` |  | Show one account. |
| `absuite accounting accounts create` | Writes |  | `--group`, `--frozen`, `--name`, `--code`, `--path`, `--prefix`, `--currency-id`, `--contact-id`, `--account-type-id`, `--parent-account-id`, `--account-category`, `--is-contra`, `--is-monetary`, `--income-statement-sub-type`; `--json` `--file` `--dry-run` | Create a record in the workspace's accounts. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Accounts` |
| `absuite accounting accounts update` | Writes | `<id>` | `--group`, `--frozen`, `--name`, `--code`, `--path`, `--prefix`, `--currency-id`, `--contact-id`, `--account-type-id`, `--parent-account-id`, `--account-category`, `--is-contra`, `--is-monetary`, `--income-statement-sub-type`; `--json` `--file` `--dry-run` | Change one of the workspace's accounts: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Accounts/{accountId}` |
| `absuite accounting accounts delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's accounts; it asks first unless --yes. `DELETE /api/v2/AccountingService/Accounts/{accountId}` |
| `absuite accounting accounts children list` | Reads |  | `--account-id` (required); `--columns` | List the workspace's accounts children. `GET /api/v2/AccountingService/Accounts/{accountId}/Children` |
| `absuite accounting accounts credits list` | Reads |  | `--account-id` (required); `--top` `--skip` `--columns` | List the workspace's accounts credits. `GET /api/v2/AccountingService/Accounts/{accountId}/Credits` |
| `absuite accounting accounts debits list` | Reads |  | `--account-id` (required); `--top` `--skip` `--columns` | List the workspace's accounts debits. `GET /api/v2/AccountingService/Accounts/{accountId}/Debits` |
| `absuite accounting accounts entries list` | Reads |  | `--account-id` (required); `--columns` | List the workspace's accounts entries. `GET /api/v2/AccountingService/Accounts/{accountId}/Entries` |
| `absuite accounting accounts root list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's accounts root. `GET /api/v2/AccountingService/Accounts/Root` |
| `absuite accounting accounts types list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's accounts types. `GET /api/v2/AccountingService/Accounts/Types` |
| `absuite accounting accounts credits count` | Reads |  | `--account-id` (required) | Count the workspace's accounts credits. `GET /api/v2/AccountingService/Accounts/{accountId}/Credits/Count` |
| `absuite accounting accounts debits count` | Reads |  | `--account-id` (required) | Count the workspace's accounts debits. `GET /api/v2/AccountingService/Accounts/{accountId}/Debits/Count` |
| `absuite accounting accounts entries count` | Reads |  | `--account-id` (required) | Count the workspace's accounts entries. `GET /api/v2/AccountingService/Accounts/{accountId}/Entries/Count` |
| `absuite accounting accounts types count` | Reads |  |  | Count the workspace's accounts types. `GET /api/v2/AccountingService/Accounts/Types/Count` |
| `absuite accounting accounts types get` | Reads | `<id>` | `--columns` | Show one of the workspace's accounts types. `GET /api/v2/AccountingService/Accounts/Types/{accountTypeId}` |
| `absuite accounting accounts types create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's accounts types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Accounts/Types` |
| `absuite accounting accounts types update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's accounts types: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Accounts/Types/{accountTypeId}` |
| `absuite accounting accounts types delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's accounts types; it asks first unless --yes. `DELETE /api/v2/AccountingService/Accounts/Types/{accountTypeId}` |
| `absuite accounting accounts entries credit list` | Reads |  | `--account-id` (required); `--columns` | List the workspace's accounts entries credit. `GET /api/v2/AccountingService/Accounts/{accountId}/Entries/Credit` |
| `absuite accounting accounts entries debit list` | Reads |  | `--account-id` (required); `--columns` | List the workspace's accounts entries debit. `GET /api/v2/AccountingService/Accounts/{accountId}/Entries/Debit` |
| `absuite accounting accounts aggregate balance show` | Reads |  | `--currency-id` (required); `--columns` | Show the workspace's accounts aggregate balance. `GET /api/v2/AccountingService/Accounts/Aggregate/Balance` |

### Bank Profiles (`absuite accounting bank-profiles`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting bank-profiles list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's bank-profiles. `GET /api/v2/AccountingService/BankProfiles` |
| `absuite accounting bank-profiles count` | Reads |  |  | Count the workspace's bank-profiles. `GET /api/v2/AccountingService/BankProfiles/Count` |

### Banking (`absuite accounting banking`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting banking list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's banking. `GET /api/v2/AccountingService/Banking` |
| `absuite accounting banking count` | Reads |  |  | Count the workspace's banking. `GET /api/v2/AccountingService/Banking/Count` |
| `absuite accounting banking get` | Reads | `<id>` | `--columns` | Show one of the workspace's banking. `GET /api/v2/AccountingService/Banking/{bankId}` |
| `absuite accounting banking create` | Writes |  | `--name`, `--image`, `--country-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's banking. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Banking` |
| `absuite accounting banking update` | Writes | `<id>` | `--name`, `--image`, `--country-id`; `--json` `--file` `--dry-run` | Change one of the workspace's banking: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Banking/{bankId}` |
| `absuite accounting banking delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's banking; it asks first unless --yes. `DELETE /api/v2/AccountingService/Banking/{bankId}` |
| `absuite accounting banking accounts list` | Reads |  | `--bank-id` (required); `--top` `--skip` `--columns` | List the workspace's banking accounts. `GET /api/v2/AccountingService/Banking/{bankId}/Accounts` |
| `absuite accounting banking guarantees list` | Reads |  | `--bank-id` (required); `--top` `--skip` `--columns` | List the workspace's banking guarantees. `GET /api/v2/AccountingService/Banking/{bankId}/Guarantees` |
| `absuite accounting banking transactions list` | Reads |  | `--bank-id` (required); `--top` `--skip` `--columns` | List the workspace's banking transactions. `GET /api/v2/AccountingService/Banking/{bankId}/Transactions` |
| `absuite accounting banking accounts count` | Reads |  | `--bank-id` (required) | Count the workspace's banking accounts. `GET /api/v2/AccountingService/Banking/{bankId}/Accounts/Count` |
| `absuite accounting banking guarantees count` | Reads |  | `--bank-id` (required) | Count the workspace's banking guarantees. `GET /api/v2/AccountingService/Banking/{bankId}/Guarantees/Count` |
| `absuite accounting banking transactions count` | Reads |  | `--bank-id` (required) | Count the workspace's banking transactions. `GET /api/v2/AccountingService/Banking/{bankId}/Transactions/Count` |
| `absuite accounting banking accounts get` | Reads | `<id>` | `--bank-id` (required); `--columns` | Show one of the workspace's banking accounts. `GET /api/v2/AccountingService/Banking/{bankId}/Accounts/{accountId}` |
| `absuite accounting banking guarantees get` | Reads | `<id>` | `--bank-id` (required); `--columns` | Show one of the workspace's banking guarantees. `GET /api/v2/AccountingService/Banking/{bankId}/Guarantees/{guaranteeId}` |
| `absuite accounting banking transactions get` | Reads | `<id>` | `--bank-id` (required); `--columns` | Show one of the workspace's banking transactions. `GET /api/v2/AccountingService/Banking/{bankId}/Transactions/{transactionId}` |
| `absuite accounting banking guarantees create` | Writes |  | `--bank-id` (required), `--margin`, `--charges`, `--beneficiary-name`, `--guarantee-number`, `--guarantee-conditions`, `--fixed-deposit-number`, `--start-date`, `--end-date`, `--validity-in-days`, `--bank-guarantee-type`, `--contact-id`, `--project-id`, `--order-id`, `--bank-profile-id`, `--bank-account-id`, `--currency-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's banking guarantees. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Banking/{bankId}/Guarantees` |
| `absuite accounting banking transactions create` | Writes |  | `--bank-id` (required), `--bank-profile-id`, `--bank-account-id`, `--description`, `--price`, `--quantity`, `--external-description`, `--basis-quantity`, `--basis-amount`, `--percent`, `--unit-group-id`, `--unit-id`, `--transaction-category-id`, `--currency-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's banking transactions. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Banking/{bankId}/Transactions` |
| `absuite accounting banking guarantees update` | Writes | `<id>` | `--bank-id` (required), `--margin`, `--charges`, `--beneficiary-name`, `--guarantee-number`, `--guarantee-conditions`, `--fixed-deposit-number`, `--start-date`, `--end-date`, `--validity-in-days`, `--bank-guarantee-type`, `--contact-id`, `--project-id`, `--order-id`, `--bank-profile-id`, `--bank-account-id`, `--currency-id`; `--json` `--file` `--dry-run` | Change one of the workspace's banking guarantees: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Banking/{bankId}/Guarantees/{guaranteeId}` |
| `absuite accounting banking transactions update` | Writes | `<id>` | `--bank-id` (required), `--bank-profile-id`, `--bank-account-id`, `--description`, `--price`, `--quantity`, `--external-description`, `--basis-quantity`, `--basis-amount`, `--percent`, `--unit-group-id`, `--unit-id`, `--transaction-category-id`, `--currency-id`; `--json` `--file` `--dry-run` | Change one of the workspace's banking transactions: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Banking/{bankId}/Transactions/{transactionId}` |
| `absuite accounting banking accounts delete` | Writes | `<id>` | `--bank-id` (required); `--yes` `--dry-run` | Delete one of the workspace's banking accounts; it asks first unless --yes. `DELETE /api/v2/AccountingService/Banking/{bankId}/Accounts/{accountId}` |
| `absuite accounting banking guarantees delete` | Writes | `<id>` | `--bank-id` (required); `--yes` `--dry-run` | Delete one of the workspace's banking guarantees; it asks first unless --yes. `DELETE /api/v2/AccountingService/Banking/{bankId}/Guarantees/{guaranteeId}` |
| `absuite accounting banking transactions delete` | Writes | `<id>` | `--bank-id` (required); `--yes` `--dry-run` | Delete one of the workspace's banking transactions; it asks first unless --yes. `DELETE /api/v2/AccountingService/Banking/{bankId}/Transactions/{transactionId}` |

### Billing Profiles (`absuite accounting billing-profiles`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting billing-profiles list` | Reads |  | `--columns` | List the workspace's billing-profiles. `GET /api/v2/AccountingService/BillingProfiles` |
| `absuite accounting billing-profiles count` | Reads |  |  | Count the workspace's billing-profiles. `GET /api/v2/AccountingService/BillingProfiles/Count` |
| `absuite accounting billing-profiles get` | Reads | `<id>` | `--columns` | Show one of the workspace's billing-profiles. `GET /api/v2/AccountingService/BillingProfiles/{billingProfileId}` |
| `absuite accounting billing-profiles create` | Writes |  | `--contact-id`, `--tax-id`, `--phone`, `--email`, `--address`, `--address1`, `--address2`, `--postal-code`, `--business-name`, `--commercial-name`, `--verification-digit`, `--economic-activity-code`, `--economic-activity-scheme`, `--is-primary`, `--establishment-code`, `--ticker`, `--duns`, `--is-public-company`, `--is-facta-customer`, `--tax-payer-type`, `--country-id`, `--state-id`, `--city-id`, `--fiscal-identification-type-id`, `--fiscal-authority-id`, `--fiscal-regime-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's billing-profiles. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/BillingProfiles` |
| `absuite accounting billing-profiles update` | Writes | `<id>` | `--contact-id`, `--tax-id`, `--phone`, `--email`, `--address`, `--address1`, `--address2`, `--postal-code`, `--business-name`, `--commercial-name`, `--verification-digit`, `--economic-activity-code`, `--economic-activity-scheme`, `--is-primary`, `--establishment-code`, `--ticker`, `--duns`, `--is-public-company`, `--is-facta-customer`, `--tax-payer-type`, `--country-id`, `--state-id`, `--city-id`, `--fiscal-identification-type-id`, `--fiscal-authority-id`, `--fiscal-regime-id`; `--json` `--file` `--dry-run` | Change one of the workspace's billing-profiles: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/BillingProfiles/{billingProfileId}` |
| `absuite accounting billing-profiles delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's billing-profiles; it asks first unless --yes. `DELETE /api/v2/AccountingService/BillingProfiles/{billingProfileId}` |

### Budgets (`absuite accounting budgets`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting budgets list` | Reads |  | `--columns` | List the workspace's budgets. `GET /api/v2/AccountingService/Budgets` |
| `absuite accounting budgets count` | Reads |  |  | Count the workspace's budgets. `GET /api/v2/AccountingService/Budgets/Count` |
| `absuite accounting budgets get` | Reads | `<id>` | `--columns` | Show one of the workspace's budgets. `GET /api/v2/AccountingService/Budgets/{budgetId}` |
| `absuite accounting budgets create` | Writes |  | `--name`, `--fiscal-year-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's budgets. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Budgets` |
| `absuite accounting budgets update` | Writes | `<id>` | `--name`, `--fiscal-year-id`; `--json` `--file` `--dry-run` | Change one of the workspace's budgets: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Budgets/{budgetId}` |
| `absuite accounting budgets delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's budgets; it asks first unless --yes. `DELETE /api/v2/AccountingService/Budgets/{budgetId}` |
| `absuite accounting budgets account-entries list` | Reads |  | `--budget-id` (required); `--top` `--skip` `--columns` | List the workspace's budgets account-entries. `GET /api/v2/AccountingService/Budgets/{budgetId}/AccountEntries` |
| `absuite accounting budgets account-entries create` | Writes |  | `--budget-id` (required), `--description`, `--planned-amount`, `--currency-id`, `--debit-account-id`, `--credit-account-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's budgets account-entries. Only in --json: budget-id. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Budgets/{budgetId}/AccountEntries` |
| `absuite accounting budgets account-entries delete` | Writes | `<id>` | `--budget-id` (required); `--yes` `--dry-run` | Delete one of the workspace's budgets account-entries; it asks first unless --yes. `DELETE /api/v2/AccountingService/Budgets/{budgetId}/AccountEntries/{entryId}` |

### Cost Centres (`absuite accounting cost-centres`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting cost-centres list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's cost-centres. `GET /api/v2/AccountingService/CostCentres` |
| `absuite accounting cost-centres count` | Reads |  |  | Count the workspace's cost-centres. `GET /api/v2/AccountingService/CostCentres/Count` |
| `absuite accounting cost-centres get` | Reads | `<id>` | `--columns` | Show one of the workspace's cost-centres. `GET /api/v2/AccountingService/CostCentres/{costCentreId}` |
| `absuite accounting cost-centres create` | Writes |  | `--name`, `--disabled`, `--description`, `--cost-centre-type`, `--cost-centres-group-id`, `--parent-cost-centre-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's cost-centres. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/CostCentres` |
| `absuite accounting cost-centres update` | Writes | `<id>` | `--name`, `--disabled`, `--description`, `--cost-centre-type`, `--cost-centres-group-id`, `--parent-cost-centre-id`; `--json` `--file` `--dry-run` | Change one of the workspace's cost-centres: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/CostCentres/{costCentreId}` |
| `absuite accounting cost-centres delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's cost-centres; it asks first unless --yes. `DELETE /api/v2/AccountingService/CostCentres/{costCentreId}` |
| `absuite accounting cost-centres cost-centre-groups list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's cost-centres cost-centre-groups. `GET /api/v2/AccountingService/CostCentres/CostCentreGroups` |
| `absuite accounting cost-centres cost-centre-groups count` | Reads |  |  | Count the workspace's cost-centres cost-centre-groups. `GET /api/v2/AccountingService/CostCentres/CostCentreGroups/Count` |
| `absuite accounting cost-centres cost-centre-groups get` | Reads | `<id>` | `--columns` | Show one of the workspace's cost-centres cost-centre-groups. `GET /api/v2/AccountingService/CostCentres/CostCentreGroups/{groupId}` |
| `absuite accounting cost-centres cost-centre-groups create` | Writes |  | `--name`, `--description`, `--disabled`, `--parent-cost-centres-group-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's cost-centres cost-centre-groups. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/CostCentres/CostCentreGroups` |
| `absuite accounting cost-centres cost-centre-groups update` | Writes | `<id>` | `--name`, `--description`, `--disabled`, `--parent-cost-centres-group-id`; `--json` `--file` `--dry-run` | Change one of the workspace's cost-centres cost-centre-groups: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/CostCentres/CostCentreGroups/{groupId}` |
| `absuite accounting cost-centres cost-centre-groups delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's cost-centres cost-centre-groups; it asks first unless --yes. `DELETE /api/v2/AccountingService/CostCentres/CostCentreGroups/{groupId}` |

### Expense Claims (`absuite accounting expense-claims`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting expense-claims list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's expense-claims. `GET /api/v2/AccountingService/ExpenseClaims` |
| `absuite accounting expense-claims count` | Reads |  |  | Count the workspace's expense-claims. `GET /api/v2/AccountingService/ExpenseClaims/Count` |
| `absuite accounting expense-claims get` | Reads | `<id>` | `--columns` | Show one of the workspace's expense-claims. `GET /api/v2/AccountingService/ExpenseClaims/{expenseClaimId}` |
| `absuite accounting expense-claims create` | Writes |  | `--expense-type-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's expense-claims. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/ExpenseClaims` |
| `absuite accounting expense-claims update` | Writes | `<id>` | `--expense-type-id`; `--json` `--file` `--dry-run` | Change one of the workspace's expense-claims: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/ExpenseClaims/{expenseClaimId}` |
| `absuite accounting expense-claims delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's expense-claims; it asks first unless --yes. `DELETE /api/v2/AccountingService/ExpenseClaims/{expenseClaimId}` |

### Expense Types (`absuite accounting expense-types`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting expense-types list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's expense-types. `GET /api/v2/AccountingService/ExpenseTypes` |
| `absuite accounting expense-types count` | Reads |  |  | Count the workspace's expense-types. `GET /api/v2/AccountingService/ExpenseTypes/Count` |
| `absuite accounting expense-types get` | Reads | `<id>` | `--columns` | Show one of the workspace's expense-types. `GET /api/v2/AccountingService/ExpenseTypes/{expenseTypeId}` |
| `absuite accounting expense-types create` | Writes |  | `--name`, `--enabled`; `--json` `--file` `--dry-run` | Create a record in the workspace's expense-types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/ExpenseTypes` |
| `absuite accounting expense-types update` | Writes | `<id>` | `--name`, `--enabled`; `--json` `--file` `--dry-run` | Change one of the workspace's expense-types: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/ExpenseTypes/{expenseTypeId}` |
| `absuite accounting expense-types delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's expense-types; it asks first unless --yes. `DELETE /api/v2/AccountingService/ExpenseTypes/{expenseTypeId}` |

### Financial Books (`absuite accounting financial-books`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting financial-books list` | Reads |  | `--columns` | List the workspace's financial-books. `GET /api/v2/AccountingService/FinancialBooks` |
| `absuite accounting financial-books count` | Reads |  |  | Count the workspace's financial-books. `GET /api/v2/AccountingService/FinancialBooks/Count` |
| `absuite accounting financial-books get` | Reads | `<id>` | `--columns` | Show one of the workspace's financial-books. `GET /api/v2/AccountingService/FinancialBooks/{financialBookId}` |
| `absuite accounting financial-books create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's financial-books. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/FinancialBooks` |
| `absuite accounting financial-books update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's financial-books: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/FinancialBooks/{financialBookId}` |
| `absuite accounting financial-books delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's financial-books; it asks first unless --yes. `DELETE /api/v2/AccountingService/FinancialBooks/{financialBookId}` |

### Fiscal Years (`absuite accounting fiscal-years`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting fiscal-years list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's fiscal-years. `GET /api/v2/AccountingService/FiscalYears` |
| `absuite accounting fiscal-years count` | Reads |  |  | Count the workspace's fiscal-years. `GET /api/v2/AccountingService/FiscalYears/Count` |
| `absuite accounting fiscal-years get` | Reads | `<id>` | `--columns` | Show one of the workspace's fiscal-years. `GET /api/v2/AccountingService/FiscalYears/{fiscalYearId}` |
| `absuite accounting fiscal-years create` | Writes |  | `--name`, `--description`, `--closed`, `--end-date`, `--start-date`, `--fiscal-authority-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's fiscal-years. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/FiscalYears` |
| `absuite accounting fiscal-years update` | Writes | `<id>` | `--name`, `--description`, `--closed`, `--end-date`, `--start-date`, `--fiscal-authority-id`; `--json` `--file` `--dry-run` | Change one of the workspace's fiscal-years: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/FiscalYears/{fiscalYearId}` |
| `absuite accounting fiscal-years delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's fiscal-years; it asks first unless --yes. `DELETE /api/v2/AccountingService/FiscalYears/{fiscalYearId}` |

### Fiscals (`absuite accounting fiscals`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting fiscals authorities list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's fiscals authorities. `GET /api/v2/AccountingService/Fiscals/Authorities` |
| `absuite accounting fiscals authorities count` | Reads |  |  | Count the workspace's fiscals authorities. `GET /api/v2/AccountingService/Fiscals/Authorities/Count` |
| `absuite accounting fiscals authorities get` | Reads | `<id>` | `--columns` | Show one of the workspace's fiscals authorities. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}` |
| `absuite accounting fiscals authorities create` | Writes |  | `--name`, `--description`, `--country-id`, `--logo-url`, `--web-url`; `--json` `--file` `--dry-run` | Create a record in the workspace's fiscals authorities. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Fiscals/Authorities` |
| `absuite accounting fiscals authorities update` | Writes | `<id>` | `--name`, `--description`, `--country-id`, `--logo-url`, `--web-url`; `--json` `--file` `--dry-run` | Change one of the workspace's fiscals authorities: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Fiscals/Authorities/{authorityId}` |
| `absuite accounting fiscals authorities delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's fiscals authorities; it asks first unless --yes. `DELETE /api/v2/AccountingService/Fiscals/Authorities/{authorityId}` |
| `absuite accounting fiscals authorities fiscal-years list` | Reads |  | `--authority-id` (required); `--top` `--skip` `--columns` | List the workspace's fiscals authorities fiscal-years. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/FiscalYears` |
| `absuite accounting fiscals authorities fiscal-years count` | Reads |  | `--authority-id` (required) | Count the workspace's fiscals authorities fiscal-years. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/FiscalYears/Count` |
| `absuite accounting fiscals authorities enumeration-ranges get` | Reads | `<id>` | `--authority-id` (required); `--columns` | Show one of the workspace's fiscals authorities enumeration-ranges. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/EnumerationRanges/{enumerationRangeId}` |
| `absuite accounting fiscals authorities fiscal-regimes get` | Reads | `<id>` | `--authority-id` (required); `--columns` | Show one of the workspace's fiscals authorities fiscal-regimes. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/FiscalRegimes/{regimeId}` |
| `absuite accounting fiscals authorities fiscal-responsibilities get` | Reads | `<id>` | `--authority-id` (required); `--columns` | Show one of the workspace's fiscals authorities fiscal-responsibilities. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/FiscalResponsibilities/{fiscalResponsibilityId}` |
| `absuite accounting fiscals authorities fiscal-years get` | Reads | `<id>` | `--authority-id` (required); `--columns` | Show one of the workspace's fiscals authorities fiscal-years. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/FiscalYears/{fiscalYearId}` |
| `absuite accounting fiscals authorities identification-types get` | Reads | `<id>` | `--authority-id` (required); `--columns` | Show one of the workspace's fiscals authorities identification-types. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/IdentificationTypes/{identificationTypeId}` |
| `absuite accounting fiscals fiscal-periods current show` | Reads |  | `--columns` | Show the workspace's fiscals fiscal-periods current. `GET /api/v2/AccountingService/Fiscals/FiscalPeriods/Current` |
| `absuite accounting fiscals authorities fiscal-periods create` | Writes |  | `--name`, `--from-date`, `--to-date`, `--fiscal-year-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's fiscals authorities fiscal-periods. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Fiscals/Authorities/FiscalPeriods` |
| `absuite accounting fiscals authorities fiscal-regimes create` | Writes |  | `--code`, `--name`, `--fiscal-authority-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's fiscals authorities fiscal-regimes. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Fiscals/Authorities/FiscalRegimes` |
| `absuite accounting fiscals authorities fiscal-responsibilities create` | Writes |  | `--code`, `--name`, `--fiscal-authority-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's fiscals authorities fiscal-responsibilities. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilities` |
| `absuite accounting fiscals authorities fiscal-responsibility-records create` | Writes |  | `--fiscal-responsibility-id`, `--billing-profile-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's fiscals authorities fiscal-responsibility-records. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilityRecords` |
| `absuite accounting fiscals authorities fiscal-years create` | Writes |  | `--name`, `--description`, `--closed`, `--end-date`, `--start-date`, `--fiscal-authority-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's fiscals authorities fiscal-years. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Fiscals/Authorities/FiscalYears` |
| `absuite accounting fiscals authorities identification-types create` | Writes |  | `--code`, `--name`, `--fiscal-authority-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's fiscals authorities identification-types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Fiscals/Authorities/IdentificationTypes` |
| `absuite accounting fiscals authorities fiscal-periods delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's fiscals authorities fiscal-periods; it asks first unless --yes. `DELETE /api/v2/AccountingService/Fiscals/Authorities/FiscalPeriods/{fiscalPeriodId}` |
| `absuite accounting fiscals authorities fiscal-regimes delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's fiscals authorities fiscal-regimes; it asks first unless --yes. `DELETE /api/v2/AccountingService/Fiscals/Authorities/FiscalRegimes/{regimeId}` |
| `absuite accounting fiscals authorities fiscal-responsibilities delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's fiscals authorities fiscal-responsibilities; it asks first unless --yes. `DELETE /api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilities/{fiscalResponsibilityId}` |
| `absuite accounting fiscals authorities fiscal-responsibility-records delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's fiscals authorities fiscal-responsibility-records; it asks first unless --yes. `DELETE /api/v2/AccountingService/Fiscals/Authorities/FiscalResponsibilityRecords/{recordId}` |
| `absuite accounting fiscals authorities fiscal-years delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's fiscals authorities fiscal-years; it asks first unless --yes. `DELETE /api/v2/AccountingService/Fiscals/Authorities/FiscalYears/{fiscalYearId}` |
| `absuite accounting fiscals authorities identification-types delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's fiscals authorities identification-types; it asks first unless --yes. `DELETE /api/v2/AccountingService/Fiscals/Authorities/IdentificationTypes/{identificationTypeId}` |
| `absuite accounting fiscals authorities fiscal-responsibilities fiscal-responsibility-records list` | Reads |  | `--authority-id` (required), `--fiscal-responsibility-id` (required); `--top` `--skip` `--columns` | List the workspace's fiscals authorities fiscal-responsibilities fiscal-responsibility-records. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/FiscalResponsibilities/{fiscalResponsibilityId}/FiscalResponsibilityRecords` |
| `absuite accounting fiscals authorities fiscal-years fiscal-periods list` | Reads |  | `--authority-id` (required), `--fiscal-year-id` (required); `--top` `--skip` `--columns` | List the workspace's fiscals authorities fiscal-years fiscal-periods. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/FiscalYears/{fiscalYearId}/FiscalPeriods` |
| `absuite accounting fiscals authorities fiscal-responsibilities fiscal-responsibility-records count` | Reads |  | `--authority-id` (required), `--fiscal-responsibility-id` (required) | Count the workspace's fiscals authorities fiscal-responsibilities fiscal-responsibility-records. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/FiscalResponsibilities/{fiscalResponsibilityId}/FiscalResponsibilityRecords/Count` |
| `absuite accounting fiscals authorities fiscal-years fiscal-periods count` | Reads |  | `--authority-id` (required), `--fiscal-year-id` (required) | Count the workspace's fiscals authorities fiscal-years fiscal-periods. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/FiscalYears/{fiscalYearId}/FiscalPeriods/Count` |
| `absuite accounting fiscals authorities fiscal-responsibilities fiscal-responsibility-records get` | Reads | `<id>` | `--authority-id` (required), `--fiscal-responsibility-id` (required); `--columns` | Show one of the workspace's fiscals authorities fiscal-responsibilities fiscal-responsibility-records. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/FiscalResponsibilities/{fiscalResponsibilityId}/FiscalResponsibilityRecords/{recordId}` |
| `absuite accounting fiscals authorities fiscal-years fiscal-periods get` | Reads | `<id>` | `--authority-id` (required), `--fiscal-year-id` (required); `--columns` | Show one of the workspace's fiscals authorities fiscal-years fiscal-periods. `GET /api/v2/AccountingService/Fiscals/Authorities/{authorityId}/FiscalYears/{fiscalYearId}/FiscalPeriods/{fiscalPeriodId}` |

### Invoice Enumeration Ranges (`absuite accounting invoice-enumeration-ranges`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting invoice-enumeration-ranges list` | Reads |  | `--columns` | List the workspace's invoice-enumeration-ranges. `GET /api/v2/AccountingService/InvoiceEnumerationRanges` |
| `absuite accounting invoice-enumeration-ranges get` | Reads | `<id>` | `--columns` | Show one of the workspace's invoice-enumeration-ranges. `GET /api/v2/AccountingService/InvoiceEnumerationRanges/{invoiceEnumerationRangeId}` |

### Journal Types (`absuite accounting journal-types`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting journal-types list` | Reads |  | `--columns` | List the workspace's journal-types. `GET /api/v2/AccountingService/JournalTypes` |
| `absuite accounting journal-types get` | Reads | `<id>` | `--columns` | Show one of the workspace's journal-types. `GET /api/v2/AccountingService/JournalTypes/{journalTypeId}` |
| `absuite accounting journal-types create` | Writes |  | `--name`; `--json` `--file` `--dry-run` | Create a record in the workspace's journal-types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/JournalTypes` |
| `absuite accounting journal-types update` | Writes | `<id>` | `--name`; `--json` `--file` `--dry-run` | Change one of the workspace's journal-types: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/JournalTypes/{journalTypeId}` |
| `absuite accounting journal-types delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's journal-types; it asks first unless --yes. `DELETE /api/v2/AccountingService/JournalTypes/{journalTypeId}` |

### Journals (`absuite accounting journals`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting journals list` | Reads |  | `--columns` | List the workspace's journals. `GET /api/v2/AccountingService/Journals` |
| `absuite accounting journals count` | Reads |  |  | Count the workspace's journals. `GET /api/v2/AccountingService/Journals/Count` |
| `absuite accounting journals get` | Reads | `<id>` | `--columns` | Show one of the workspace's journals. `GET /api/v2/AccountingService/Journals/{journalId}` |
| `absuite accounting journals create` | Writes |  | `--name`, `--description`, `--date-time`, `--parent-journal-id`, `--journal-type-id`, `--ledger-id`, `--financial-book-id`, `--code`; `--json` `--file` `--dry-run` | Create a record in the workspace's journals. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Journals` |
| `absuite accounting journals update` | Writes | `<id>` | `--name`, `--description`, `--date-time`, `--parent-journal-id`, `--journal-type-id`, `--ledger-id`; `--json` `--file` `--dry-run` | Change one of the workspace's journals: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Journals/{journalId}` |
| `absuite accounting journals delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's journals; it asks first unless --yes. `DELETE /api/v2/AccountingService/Journals/{journalId}` |
| `absuite accounting journals entries list` | Reads |  | `--journal-id` (required); `--top` `--skip` `--columns` | List the workspace's journals entries. `GET /api/v2/AccountingService/Journals/{journalId}/Entries` |
| `absuite accounting journals entries count` | Reads |  | `--journal-id` (required) | Count the workspace's journals entries. `GET /api/v2/AccountingService/Journals/{journalId}/Entries/Count` |
| `absuite accounting journals entries get` | Reads | `<id>` | `--journal-id` (required); `--columns` | Show one of the workspace's journals entries. `GET /api/v2/AccountingService/Journals/{journalId}/Entries/{entryId}` |
| `absuite accounting journals entries aggregate credits show` | Reads |  | `--journal-id` (required), `--currency-id` (required); `--columns` | Show the workspace's journals entries aggregate credits. `GET /api/v2/AccountingService/Journals/{journalId}/Entries/Aggregate/Credits` |
| `absuite accounting journals entries aggregate debits show` | Reads |  | `--journal-id` (required), `--currency-id` (required); `--columns` | Show the workspace's journals entries aggregate debits. `GET /api/v2/AccountingService/Journals/{journalId}/Entries/Aggregate/Debits` |

### Ledger Types (`absuite accounting ledger-types`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting ledger-types list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's ledger-types. `GET /api/v2/AccountingService/LedgerTypes` |
| `absuite accounting ledger-types count` | Reads |  |  | Count the workspace's ledger-types. `GET /api/v2/AccountingService/LedgerTypes/Count` |
| `absuite accounting ledger-types get` | Reads | `<id>` | `--columns` | Show one of the workspace's ledger-types. `GET /api/v2/AccountingService/LedgerTypes/{ledgerTypeId}` |
| `absuite accounting ledger-types create` | Writes |  | `--name`, `--ledger-class`; `--json` `--file` `--dry-run` | Create a record in the workspace's ledger-types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/LedgerTypes` |
| `absuite accounting ledger-types update` | Writes | `<id>` | `--name`, `--ledger-class`; `--json` `--file` `--dry-run` | Change one of the workspace's ledger-types: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/LedgerTypes/{ledgerTypeId}` |
| `absuite accounting ledger-types delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's ledger-types; it asks first unless --yes. `DELETE /api/v2/AccountingService/LedgerTypes/{ledgerTypeId}` |

### Ledgers (`absuite accounting ledgers`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting ledgers list` | Reads |  | `--columns` | List the workspace's ledgers. `GET /api/v2/AccountingService/Ledgers` |
| `absuite accounting ledgers count` | Reads |  |  | Count the workspace's ledgers. `GET /api/v2/AccountingService/Ledgers/Count` |
| `absuite accounting ledgers get` | Reads | `<id>` | `--columns` | Show one of the workspace's ledgers. `GET /api/v2/AccountingService/Ledgers/{ledgerId}` |
| `absuite accounting ledgers delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's ledgers; it asks first unless --yes. `DELETE /api/v2/AccountingService/Ledgers/{ledgerId}` |

### Loans (`absuite accounting loans`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting loans list` | Reads |  | `--columns` | List the workspace's loans. `GET /api/v2/AccountingService/Loans` |
| `absuite accounting loans count` | Reads |  |  | Count the workspace's loans. `GET /api/v2/AccountingService/Loans/Count` |
| `absuite accounting loans get` | Reads | `<id>` | `--columns` | Show one of the workspace's loans. `GET /api/v2/AccountingService/Loans/{loanId}` |
| `absuite accounting loans create` | Writes |  | `--loan-timestamp`, `--payment-deadline`, `--value`, `--interest-rate`, `--is-compund-interest-rate`, `--loan-type-id`, `--currency-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's loans. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Loans` |
| `absuite accounting loans update` | Writes | `<id>` | `--loan-timestamp`, `--payment-deadline`, `--value`, `--interest-rate`, `--is-compund-interest-rate`, `--loan-type-id`, `--currency-id`; `--json` `--file` `--dry-run` | Change one of the workspace's loans: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Loans/{loanId}` |
| `absuite accounting loans delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's loans; it asks first unless --yes. `DELETE /api/v2/AccountingService/Loans/{loanId}` |
| `absuite accounting loans types list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's loans types. `GET /api/v2/AccountingService/Loans/Types` |
| `absuite accounting loans types count` | Reads |  |  | Count the workspace's loans types. `GET /api/v2/AccountingService/Loans/Types/Count` |
| `absuite accounting loans types get` | Reads | `<id>` | `--columns` | Show one of the workspace's loans types. `GET /api/v2/AccountingService/Loans/Types/{loanTypeId}` |
| `absuite accounting loans types create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's loans types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Loans/Types` |
| `absuite accounting loans types update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's loans types: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Loans/Types/{loanTypeId}` |
| `absuite accounting loans types delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's loans types; it asks first unless --yes. `DELETE /api/v2/AccountingService/Loans/Types/{loanTypeId}` |

### Receipts (`absuite accounting receipts`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting receipts list` | Reads |  | `--columns` | List the workspace's receipts. `GET /api/v2/AccountingService/Receipts` |
| `absuite accounting receipts get` | Reads | `<id>` | `--columns` | Show one of the workspace's receipts. `GET /api/v2/AccountingService/Receipts/{receiptId}` |
| `absuite accounting receipts create` | Writes |  | `--payment-id`, `--total-amount`, `--total-amount-in-usd`, `--contact-id`, `--receipt-type`, `--order-id`, `--invoice-id`, `--closed`, `--title`, `--price-list-id`, `--description`, `--individual-id`, `--payment-term-id`, `--organization-id`, `--receiver-tenant-id`, `--first-name`, `--last-name`, `--company-name`, `--billing-email`, `--address-line1`, `--address-line2`, `--postal-code`, `--country-id`, `--state-id`, `--city-id`, `--forex-rate`, `--currency-id`, `--total-detail`, `--total-detail-currency-id`, `--total-profit`, `--total-profit-currency-id`, `--total-discounts`, `--total-discounts-currency-id`, `--total-surcharges`, `--total-surcharges-currency-id`, `--total-shipping-cost`, `--total-shipping-cost-currency-id`, `--total-shipping-tax`, `--total-shipping-tax-currency-id`, `--total-withheld-tax`, `--total-withheld-tax-currency-id`, `--total-tax-base`, `--total-tax-base-currency-id`, `--total-taxes`, `--total-taxes-currency-id`, `--total-global-surcharges`, `--total-global-surcharges-currency-id`, `--total-global-discounts`, `--total-global-discounts-currency-id`, `--total`, `--total-currency-id`, `--cost-calculation-method`, `--tax-calculation-method`; `--json` `--file` `--dry-run` | Create a record in the workspace's receipts. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Receipts` |
| `absuite accounting receipts update` | Writes | `<id>` | `--payment-id`, `--forex-rate`, `--total-amount`, `--total-amount-in-usd`, `--closed`, `--currency-id`, `--contact-id`, `--order-id`, `--invoice-id`; `--json` `--file` `--dry-run` | Change one of the workspace's receipts: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Receipts/{receiptId}` |
| `absuite accounting receipts delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's receipts; it asks first unless --yes. `DELETE /api/v2/AccountingService/Receipts/{receiptId}` |

### Shares (`absuite accounting shares`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting shares classes list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's shares classes. `GET /api/v2/AccountingService/Shares/Classes` |
| `absuite accounting shares issuances list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's shares issuances. `GET /api/v2/AccountingService/Shares/Issuances` |
| `absuite accounting shares transfer-reasons list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's shares transfer-reasons. `GET /api/v2/AccountingService/Shares/TransferReasons` |
| `absuite accounting shares transfers list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's shares transfers. `GET /api/v2/AccountingService/Shares/Transfers` |
| `absuite accounting shares classes count` | Reads |  |  | Count the workspace's shares classes. `GET /api/v2/AccountingService/Shares/Classes/Count` |
| `absuite accounting shares issuances count` | Reads |  |  | Count the workspace's shares issuances. `GET /api/v2/AccountingService/Shares/Issuances/Count` |
| `absuite accounting shares transfer-reasons count` | Reads |  |  | Count the workspace's shares transfer-reasons. `GET /api/v2/AccountingService/Shares/TransferReasons/Count` |
| `absuite accounting shares transfers count` | Reads |  |  | Count the workspace's shares transfers. `GET /api/v2/AccountingService/Shares/Transfers/Count` |
| `absuite accounting shares classes get` | Reads | `<id>` | `--columns` | Show one of the workspace's shares classes. `GET /api/v2/AccountingService/Shares/Classes/{shareClassId}` |
| `absuite accounting shares issuances get` | Reads | `<id>` | `--columns` | Show one of the workspace's shares issuances. `GET /api/v2/AccountingService/Shares/Issuances/{issuanceId}` |
| `absuite accounting shares transfer-reasons get` | Reads | `<id>` | `--columns` | Show one of the workspace's shares transfer-reasons. `GET /api/v2/AccountingService/Shares/TransferReasons/{reasonId}` |
| `absuite accounting shares transfers get` | Reads | `<id>` | `--columns` | Show one of the workspace's shares transfers. `GET /api/v2/AccountingService/Shares/Transfers/{transferId}` |
| `absuite accounting shares classes create` | Writes |  | `--name`, `--value`, `--description`, `--forex-rates`, `--currency-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's shares classes. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Shares/Classes` |
| `absuite accounting shares issuances create` | Writes |  | `--unit-price`, `--quantity`, `--currency-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's shares issuances. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/Shares/Issuances` |
| `absuite accounting shares classes update` | Writes | `<id>` | `--name`, `--value`, `--description`, `--forex-rates`, `--currency-id`; `--json` `--file` `--dry-run` | Change one of the workspace's shares classes: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Shares/Classes/{shareClassId}` |
| `absuite accounting shares issuances update` | Writes | `<id>` | `--unit-price`, `--quantity`, `--currency-id`; `--json` `--file` `--dry-run` | Change one of the workspace's shares issuances: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/Shares/Issuances/{issuanceId}` |
| `absuite accounting shares classes delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's shares classes; it asks first unless --yes. `DELETE /api/v2/AccountingService/Shares/Classes/{shareClassId}` |
| `absuite accounting shares issuances delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's shares issuances; it asks first unless --yes. `DELETE /api/v2/AccountingService/Shares/Issuances/{issuanceId}` |
| `absuite accounting shares issuances sum show` | Reads |  |  | Show the workspace's shares issuances sum. `GET /api/v2/AccountingService/Shares/Issuances/Sum` |

### Tax Classes (`absuite accounting tax-classes`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting tax-classes list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's tax-classes. `GET /api/v2/AccountingService/TaxClasses` |
| `absuite accounting tax-classes count` | Reads |  |  | Count the workspace's tax-classes. `GET /api/v2/AccountingService/TaxClasses/Count` |
| `absuite accounting tax-classes get` | Reads | `<id>` | `--columns` | Show one of the workspace's tax-classes. `GET /api/v2/AccountingService/TaxClasses/{taxClassId}` |
| `absuite accounting tax-classes create` | Writes |  | `--name`, `--fiscal-authority-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's tax-classes. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/TaxClasses` |
| `absuite accounting tax-classes update` | Writes | `<id>` | `--name`, `--fiscal-authority-id`; `--json` `--file` `--dry-run` | Change one of the workspace's tax-classes: reads it, applies --json/--file and the field flags, then saves it. Never set here: type (not settable: discriminator (TPH rule)). `PUT /api/v2/AccountingService/TaxClasses/{taxClassId}` |
| `absuite accounting tax-classes delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's tax-classes; it asks first unless --yes. `DELETE /api/v2/AccountingService/TaxClasses/{taxClassId}` |

### Tax Policies (`absuite accounting tax-policies`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting tax-policies list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's tax-policies. `GET /api/v2/AccountingService/TaxPolicies` |
| `absuite accounting tax-policies count` | Reads |  |  | Count the workspace's tax-policies. `GET /api/v2/AccountingService/TaxPolicies/Count` |
| `absuite accounting tax-policies get` | Reads | `<id>` | `--columns` | Show one of the workspace's tax-policies. `GET /api/v2/AccountingService/TaxPolicies/{taxPolicyId}` |
| `absuite accounting tax-policies create` | Writes |  | `--code`, `--title`, `--description`, `--is-free`, `--reduce`, `--is-enabled`, `--is-default`, `--allow-international`, `--hours`, `--days`, `--weeks`, `--months`, `--years`, `--value`, `--percentage`, `--currency-id`, `--country-id`, `--country-state-id`, `--custom-state`, `--custom-city`, `--city-id`, `--zero`, `--reduced`, `--withholding`, `--tax-scheme-code`, `--tax-category-code`, `--fiscal-authority-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's tax-policies. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/TaxPolicies` |
| `absuite accounting tax-policies update` | Writes | `<id>` | `--code`, `--title`, `--description`, `--is-free`, `--reduce`, `--is-enabled`, `--is-default`, `--allow-international`, `--hours`, `--days`, `--weeks`, `--months`, `--years`, `--value`, `--percentage`, `--currency-id`, `--country-id`, `--country-state-id`, `--custom-state`, `--custom-city`, `--city-id`, `--zero`, `--reduced`, `--withholding`, `--tax-scheme-code`, `--tax-category-code`, `--fiscal-authority-id`; `--json` `--file` `--dry-run` | Change one of the workspace's tax-policies: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/TaxPolicies/{taxPolicyId}` |
| `absuite accounting tax-policies delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's tax-policies; it asks first unless --yes. `DELETE /api/v2/AccountingService/TaxPolicies/{taxPolicyId}` |

### Tax Rates (`absuite accounting tax-rates`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite accounting tax-rates list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's tax-rates. `GET /api/v2/AccountingService/TaxRates` |
| `absuite accounting tax-rates count` | Reads |  |  | Count the workspace's tax-rates. `GET /api/v2/AccountingService/TaxRates/Count` |
| `absuite accounting tax-rates get` | Reads | `<id>` | `--columns` | Show one of the workspace's tax-rates. `GET /api/v2/AccountingService/TaxRates/{taxRateId}` |
| `absuite accounting tax-rates create` | Writes |  | `--name`, `--rate`, `--value`, `--um`, `--unit-id`, `--unit-group-id`, `--priority`, `--compound`, `--shipping`, `--withholding`, `--single-transaction-threshold`, `--cumulative-transaction-threshold`, `--fiscal-authority-id`, `--fiscal-year-id`, `--country-id`, `--tax-class-id`, `--currency-id`, `--tax-policy-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's tax-rates. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AccountingService/TaxRates` |
| `absuite accounting tax-rates update` | Writes | `<id>` | `--name`, `--rate`, `--value`, `--um`, `--unit-id`, `--unit-group-id`, `--priority`, `--compound`, `--shipping`, `--withholding`, `--single-transaction-threshold`, `--cumulative-transaction-threshold`, `--fiscal-authority-id`, `--fiscal-year-id`, `--country-id`, `--tax-class-id`, `--currency-id`, `--tax-policy-id`; `--json` `--file` `--dry-run` | Change one of the workspace's tax-rates: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AccountingService/TaxRates/{taxRateId}` |
| `absuite accounting tax-rates delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's tax-rates; it asks first unless --yes. `DELETE /api/v2/AccountingService/TaxRates/{taxRateId}` |

## Example

```bash
absuite accounting account-groups list --top 5 -o json --query "[].id"
absuite accounting account-groups create --title <value> --description <value> --dry-run   # prints the POST, sends nothing
absuite accounting account-groups create --title <value> --description <value> -o json --no-input
```

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
