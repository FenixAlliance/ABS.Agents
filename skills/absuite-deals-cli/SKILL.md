---
name: absuite-deals-cli
key: fenixalliance.absuite.deals-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Deals area with the absuite CLI: 29 commands (16 read, 13
  write) under `absuite deals`, `absuite sales`, each generated from the platform's ServiceClients and
  checked against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-deals
  REST skill.
---

# Alliance Business Suite — Deals Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-deals` REST skill documents 18 routes; 4 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-deals` REST skill.

## Commands

29 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Deal Unit Flows (`absuite deals deal-unit-flows`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite deals deal-unit-flows list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's deal-unit-flows. `GET /api/v2/DealsService/DealUnitFlows` |
| `absuite deals deal-unit-flows count` | Reads |  |  | Count the workspace's deal-unit-flows. `GET /api/v2/DealsService/DealUnitFlows/Count` |
| `absuite deals deal-unit-flows get` | Reads | `<id>` | `--columns` | Show one of the workspace's deal-unit-flows. `GET /api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}` |
| `absuite deals deal-unit-flows create` | Writes |  | `--name`, `--description`, `--parent-business-process-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's deal-unit-flows. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/DealsService/DealUnitFlows` |
| `absuite deals deal-unit-flows update` | Writes | `<id>` | `--name`, `--description`, `--parent-business-process-id`; `--json` `--file` `--dry-run` | Change one of the workspace's deal-unit-flows: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}` |
| `absuite deals deal-unit-flows delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's deal-unit-flows; it asks first unless --yes. `DELETE /api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}` |
| `absuite deals deal-unit-flows stages list` | Reads |  | `--deal-unit-flow-id` (required); `--top` `--skip` `--columns` | List the workspace's deal-unit-flows stages. `GET /api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages` |
| `absuite deals deal-unit-flows stages count` | Reads |  | `--deal-unit-flow-id` (required) | Count the workspace's deal-unit-flows stages. `GET /api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages/Count` |
| `absuite deals deal-unit-flows stages get` | Reads | `<id>` | `--deal-unit-flow-id` (required); `--columns` | Show one of the workspace's deal-unit-flows stages. `GET /api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages/{dealUnitFlowStageId}` |
| `absuite deals deal-unit-flows stages create` | Writes |  | `--deal-unit-flow-id` (required), `--order`, `--name`, `--description`, `--parent-business-process-stage-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's deal-unit-flows stages. Only in --json: deal-unit-flow-id. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages` |
| `absuite deals deal-unit-flows stages update` | Writes | `<id>` | `--deal-unit-flow-id` (required), `--order`, `--name`, `--description`, `--parent-business-process-stage-id`; `--json` `--file` `--dry-run` | Change one of the workspace's deal-unit-flows stages: reads it, applies --json/--file and the field flags, then saves it. Only in --json: deal-unit-flow-id. `PUT /api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages/{dealUnitFlowStageId}` |
| `absuite deals deal-unit-flows stages delete` | Writes | `<id>` | `--deal-unit-flow-id` (required); `--yes` `--dry-run` | Delete one of the workspace's deal-unit-flows stages; it asks first unless --yes. `DELETE /api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages/{dealUnitFlowStageId}` |

### Deal Units (`absuite deals deal-units`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite deals deal-units list` | Reads |  | `--columns` | List the workspace's deal-units. `GET /api/v2/DealsService/DealUnits` |
| `absuite deals deal-units count` | Reads |  |  | Count the workspace's deal-units. `GET /api/v2/DealsService/DealUnits/Count` |
| `absuite deals deal-units get` | Reads | `<id>` | `--columns` | Show one of the workspace's deal-units. `GET /api/v2/DealsService/DealUnits/{dealUnitId}` |
| `absuite deals deal-units create` | Writes |  | `--deal-unit-flow-id`, `--deal-unit-flow-stage-id`, `--partner-created`, `--partner-collaboration`, `--proposed-solution`, `--current-situation`, `--customer-need`, `--won-date`, `--lost-date`, `--expiry-date`, `--delivered-date`, `--closed-timestamp`, `--expected-close-date`, `--deal-unit-status`, `--deal-unit-purchase-process`, `--deal-unit-forecast-category`, `--deal-unit-amounts-calculation`, `--closed`, `--title`, `--price-list-id`, `--description`, `--individual-id`, `--payment-term-id`, `--organization-id`, `--receiver-tenant-id`, `--first-name`, `--last-name`, `--company-name`, `--billing-email`, `--address-line1`, `--address-line2`, `--postal-code`, `--country-id`, `--state-id`, `--city-id`, `--forex-rate`, `--currency-id`, `--total-detail`, `--total-detail-currency-id`, `--total-profit`, `--total-profit-currency-id`, `--total-discounts`, `--total-discounts-currency-id`, `--total-surcharges`, `--total-surcharges-currency-id`, `--total-shipping-cost`, `--total-shipping-cost-currency-id`, `--total-shipping-tax`, `--total-shipping-tax-currency-id`, `--total-withheld-tax`, `--total-withheld-tax-currency-id`, `--total-tax-base`, `--total-tax-base-currency-id`, `--total-taxes`, `--total-taxes-currency-id`, `--total-global-surcharges`, `--total-global-surcharges-currency-id`, `--total-global-discounts`, `--total-global-discounts-currency-id`, `--total`, `--total-currency-id`, `--cost-calculation-method`, `--tax-calculation-method`; `--json` `--file` `--dry-run` | Create a record in the workspace's deal-units. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/DealsService/DealUnits` |
| `absuite deals deal-units update` | Writes | `<id>` | `--ordered`, `--cart-id`, `--deal-unit-feed-id`, `--deal-unit-flow-id`, `--deal-unit-flow-stage-id`, `--partner-created`, `--partner-collaboration`, `--proposed-solution`, `--current-situation`, `--customer-need`, `--won-date`, `--lost-date`, `--expiry-date`, `--delivered-date`, `--closed-timestamp`, `--expected-close-date`, `--deal-unit-status`, `--deal-unit-purchase-process`, `--deal-unit-forecast-category`, `--deal-unit-amounts-calculation`, `--closed`, `--title`, `--price-list-id`, `--description`, `--individual-id`, `--payment-term-id`, `--organization-id`, `--receiver-tenant-id`, `--first-name`, `--last-name`, `--company-name`, `--billing-email`, `--address-line1`, `--address-line2`, `--postal-code`, `--country-id`, `--state-id`, `--city-id`, `--billing-location-id`, `--shipping-location-id`, `--shipping-method-id`, `--forex-rate`, `--currency-id`, `--total-detail`, `--total-detail-currency-id`, `--total-profit`, `--total-profit-currency-id`, `--total-discounts`, `--total-discounts-currency-id`, `--total-surcharges`, `--total-surcharges-currency-id`, `--total-shipping-tax`, `--total-shipping-tax-currency-id`, `--total-shipping-cost`, `--total-shipping-cost-currency-id`, `--total-global-discounts`, `--total-global-discounts-currency-id`, `--total-global-surcharges`, `--total-global-surcharges-currency-id`, `--total-withheld-tax`, `--total-withheld-tax-currency-id`, `--total-tax-base`, `--total-tax-base-currency-id`, `--total-taxes`, `--total-taxes-currency-id`, `--total`, `--total-currency-id`, `--cost-calculation-method`, `--tax-calculation-method`; `--json` `--file` `--dry-run` | Change one of the workspace's deal-units: reads it, applies --json/--file and the field flags, then saves it. Never set here: user-id (set by the server). `PUT /api/v2/DealsService/DealUnits/{dealUnitId}` |
| `absuite deals deal-units delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's deal-units; it asks first unless --yes. `DELETE /api/v2/DealsService/DealUnits/{dealUnitId}` |
| `absuite deals deal-units extended list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's deal-units extended. `GET /api/v2/DealsService/DealUnits/Extended` |
| `absuite deals deal-units lines list` | Reads |  | `--deal-unit-id` (required); `--columns` | List the workspace's deal-units lines. `GET /api/v2/DealsService/DealUnits/{dealUnitId}/Lines` |
| `absuite deals deal-units lines count` | Reads |  | `--deal-unit-id` (required) | Count the workspace's deal-units lines. `GET /api/v2/DealsService/DealUnits/{dealUnitId}/Lines/Count` |
| `absuite deals deal-units lines get` | Reads | `<id>` | `--deal-unit-id` (required); `--columns` | Show one of the workspace's deal-units lines. `GET /api/v2/DealsService/DealUnits/{dealUnitId}/Lines/{dealUnitLineId}` |
| `absuite deals deal-units lines show` | Reads |  | `--deal-unit-id` (required); `--columns` | Show the workspace's deal-units lines. `GET /api/v2/DealsService/DealUnits/{dealUnitId}/Lines` |
| `absuite deals deal-units lines create` | Writes |  | `--deal-unit-id` (required), `--item-id`, `--unit-id`, `--currency-id`, `--price-list-id`, `--unit-group-id`, `--discount-list-id`, `--rounding-policy-id`, `--price`, `--percent`; `--json` `--file` `--dry-run` | Create a record in the workspace's deal-units lines. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/DealsService/DealUnits/{dealUnitId}/Lines` |
| `absuite deals deal-units lines delete` | Writes | `<id>` | `--deal-unit-id` (required); `--yes` `--dry-run` | Delete one of the workspace's deal-units lines; it asks first unless --yes. `DELETE /api/v2/DealsService/DealUnits/{dealUnitId}/Lines/{dealUnitLineId}` |

### Sales Literatures (`absuite sales sales-literatures`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite sales sales-literatures list` | Reads |  | `--columns` | List the workspace's sales-literatures. `GET /api/v2/SalesService/SalesLiteratures` |
| `absuite sales sales-literatures create` | Writes |  | `--sales-literature-id` (required), `--title`, `--content`, `--description`, `--modified-date`, `--expiration-date`, `--sales-literature-type-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's sales-literatures. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SalesService/SalesLiteratures` |
| `absuite sales sales-literatures delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's sales-literatures; it asks first unless --yes. `DELETE /api/v2/SalesService/SalesLiteratures/{salesLiteratureId}` |
| `absuite sales sales-literatures extended list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's sales-literatures extended. `GET /api/v2/SalesService/SalesLiteratures/Extended` |

## Example

```bash
absuite deals deal-unit-flows list --top 5 -o json --query "[].id"
absuite deals deal-unit-flows create --name <value> --description <value> --dry-run   # prints the POST, sends nothing
absuite deals deal-unit-flows create --name <value> --description <value> -o json --no-input
```

## Key Concepts

- **Deal Unit** — a sales opportunity (customer, financial totals, pipeline assignment, lifecycle status).
- **Deal Unit Line** — a product/item line within a deal (quantity, pricing, cost/tax breakdown). In CLI commands the line entity is spelled **`unit-line`** for `calculate`, and **`unit-price`** for `get`/`update`/`delete` of a single line. List/count use **`unit-lines`**.
- **Deal Unit Flow** — a sales pipeline (entity `unit-flow` / `unit-flows`).
- **Deal Unit Flow Stage** — an ordered step in a flow (entity `unit-flow-stage` / `unit-flow-stages`).
- **Sales Literature** — supporting documents/collateral for the sales process (entity `sales-literature` / `sales-literatures`).
- **DealUnitStatus** — `Open` | `Won` | `Lost` | `Frozen`.
- **DealUnitForecastCategory** — `None` | `Pipeline` | `BestCase` | `Commited` | `Ommited` | `Won` | `Lost`.
- **DealUnitPurchaseProcess** — `None` | `Individual` | `Commitee` | `Unknown`.
- **DealUnitAmountsCalculation** — `UserProvided` | `SystemCalculated`.
- **CostCalculationMethod** — `Automatic` | `Custom`. **TaxCalculationMethod** — `Included` | `Excluded`.

> Enum spellings (`Commited`, `Ommited`, `Commitee`) are transcribed verbatim from the API schema — use them exactly.
