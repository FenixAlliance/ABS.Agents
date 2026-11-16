---
name: absuite-quotes-cli
key: fenixalliance.absuite.quotes-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Quotes area with the absuite CLI: 18 commands (13 read, 5
  write) under `absuite quotes`, each generated from the platform's ServiceClients and checked against
  `absuite commands -o json`. For routes the CLI does not cover, use the absuite-quotes REST skill.
---

# Alliance Business Suite — Quotes Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-quotes` REST skill documents 27 routes; 15 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-quotes` REST skill.

## Commands

18 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Extended (`absuite quotes extended`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite quotes extended list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's extended. `GET /api/v2/QuotesService/Quotes/Extended` |

### Lines (`absuite quotes lines`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite quotes lines list` | Reads |  | `--quote-id` (required); `--columns` | List the workspace's lines. `GET /api/v2/QuotesService/Quotes/{quoteId}/Lines` |
| `absuite quotes lines count` | Reads |  | `--quote-id` (required) | Count the workspace's lines. `GET /api/v2/QuotesService/Quotes/{quoteId}/Lines/Count` |
| `absuite quotes lines get` | Reads | `<id>` | `--quote-id` (required); `--columns` | Show one of the workspace's lines. `GET /api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}` |
| `absuite quotes lines show` | Reads |  | `--quote-id` (required); `--columns` | Show the workspace's lines. `GET /api/v2/QuotesService/Quotes/{quoteId}/Lines` |
| `absuite quotes lines create` | Writes |  | `--quote-id` (required), `--item-id`, `--unit-id`, `--currency-id`, `--price-list-id`, `--unit-group-id`, `--discount-list-id`, `--rounding-policy-id`, `--price`, `--percent`; `--json` `--file` `--dry-run` | Create a record in the workspace's lines. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/QuotesService/Quotes/{quoteId}/Lines` |
| `absuite quotes lines delete` | Writes | `<id>` | `--quote-id` (required); `--yes` `--dry-run` | Delete one of the workspace's lines; it asks first unless --yes. `DELETE /api/v2/QuotesService/Quotes/{quoteId}/Lines/{quoteLineId}` |
| `absuite quotes lines exists show` | Reads |  | `--quote-id` (required), `--quote-line-id` (required) | Show the workspace's lines exists. `GET /api/v2/QuotesService/Quotes/{quoteId}/Lines/Exists` |

### Received (`absuite quotes received`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite quotes received list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's received. `GET /api/v2/QuotesService/Quotes/Received` |
| `absuite quotes received count` | Reads |  |  | Count the workspace's received. `GET /api/v2/QuotesService/Quotes/Received/Count` |
| `absuite quotes received get` | Reads | `<id>` | `--columns` | Show one of the workspace's received. `GET /api/v2/QuotesService/Quotes/Received/{quoteId}` |
| `absuite quotes received lines list` | Reads |  | `--quote-id` (required); `--top` `--skip` `--columns` | List the workspace's received lines. `GET /api/v2/QuotesService/Quotes/Received/{quoteId}/Lines` |

### Quotes (`absuite quotes`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite quotes list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's quotes. `GET /api/v2/QuotesService/Quotes` |
| `absuite quotes count` | Reads |  |  | Count the workspace's quotes. `GET /api/v2/QuotesService/Quotes/Count` |
| `absuite quotes get` | Reads | `<id>` | `--columns` | Show one of the workspace's quotes. `GET /api/v2/QuotesService/Quotes/{quoteId}` |
| `absuite quotes create` | Writes |  | `--cart-id`, `--deal-unit-id`, `--effective-to`, `--effective-from`, `--quote-status`, `--closed`, `--title`, `--price-list-id`, `--description`, `--individual-id`, `--payment-term-id`, `--organization-id`, `--receiver-tenant-id`, `--first-name`, `--last-name`, `--company-name`, `--billing-email`, `--address-line1`, `--address-line2`, `--postal-code`, `--country-id`, `--state-id`, `--city-id`, `--forex-rate`, `--currency-id`, `--total-detail`, `--total-detail-currency-id`, `--total-profit`, `--total-profit-currency-id`, `--total-discounts`, `--total-discounts-currency-id`, `--total-surcharges`, `--total-surcharges-currency-id`, `--total-shipping-cost`, `--total-shipping-cost-currency-id`, `--total-shipping-tax`, `--total-shipping-tax-currency-id`, `--total-withheld-tax`, `--total-withheld-tax-currency-id`, `--total-tax-base`, `--total-tax-base-currency-id`, `--total-taxes`, `--total-taxes-currency-id`, `--total-global-surcharges`, `--total-global-surcharges-currency-id`, `--total-global-discounts`, `--total-global-discounts-currency-id`, `--total`, `--total-currency-id`, `--cost-calculation-method`, `--tax-calculation-method`; `--json` `--file` `--dry-run` | Create a record in the workspace's quotes. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/QuotesService/Quotes` |
| `absuite quotes update` | Writes | `<id>` | `--cart-id`, `--quote-status`, `--freight-terms`, `--effective-to`, `--effective-from`, `--custom-tax-amount`, `--custom-total-amount`, `--custom-detail-amount`, `--custom-profit-amount`, `--custom-discounts-amount`, `--custom-surcharges-amount`, `--custom-shipping-cost-amount`, `--custom-shipping-tax-amount`, `--custom-withholding-tax-amount`, `--closed`, `--title`, `--price-list-id`, `--description`, `--individual-id`, `--payment-term-id`, `--organization-id`, `--receiver-tenant-id`, `--first-name`, `--last-name`, `--company-name`, `--billing-email`, `--address-line1`, `--address-line2`, `--postal-code`, `--country-id`, `--state-id`, `--city-id`, `--billing-location-id`, `--shipping-location-id`, `--shipping-method-id`, `--forex-rate`, `--currency-id`, `--total-detail`, `--total-detail-currency-id`, `--total-profit`, `--total-profit-currency-id`, `--total-discounts`, `--total-discounts-currency-id`, `--total-surcharges`, `--total-surcharges-currency-id`, `--total-shipping-tax`, `--total-shipping-tax-currency-id`, `--total-shipping-cost`, `--total-shipping-cost-currency-id`, `--total-global-discounts`, `--total-global-discounts-currency-id`, `--total-global-surcharges`, `--total-global-surcharges-currency-id`, `--total-withheld-tax`, `--total-withheld-tax-currency-id`, `--total-tax-base`, `--total-tax-base-currency-id`, `--total-taxes`, `--total-taxes-currency-id`, `--total`, `--total-currency-id`, `--cost-calculation-method`, `--tax-calculation-method`; `--json` `--file` `--dry-run` | Change one of the workspace's quotes: reads it, applies --json/--file and the field flags, then saves it. Never set here: user-id (set by the server). `PUT /api/v2/QuotesService/Quotes/{quoteId}` |
| `absuite quotes delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's quotes; it asks first unless --yes. `DELETE /api/v2/QuotesService/Quotes/{quoteId}` |

## Example

```bash
absuite quotes extended list --top 5 -o json --query "[].id"
absuite quotes create --cart-id <value> --deal-unit-id <value> --dry-run   # prints the POST, sends nothing
absuite quotes create --cart-id <value> --deal-unit-id <value> -o json --no-input
```

## Key Concepts

- **QuoteStatus** — `Draft` | `New` | `Accepted` | `Declined` | `Expired`.
- **CostCalculationMethod** — `Automatic` | `Custom`.
- **TaxCalculationMethod** — `Included` | `Excluded`.
- **FreightTerms** (on a quote update) — `FOB` | `NoCharge`.
- A quote can be **closed** (finalized) and later **reopened**, and **converted to an order**.
- Monetary amounts are split into a value field and a matching `…CurrencyId` field
  (e.g. `Total` + `TotalCurrencyId`).
- The Quotes Service exposes **quotes and quote lines only** — there are no quote-line
  tax or adjustment sub-resources; line-level tax and discount/surcharge figures are
  carried inline on the quote-line body, and computed by the `calculate` actions.
