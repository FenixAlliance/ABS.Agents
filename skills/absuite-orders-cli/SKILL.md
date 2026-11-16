---
name: absuite-orders-cli
key: fenixalliance.absuite.orders-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Orders area with the absuite CLI: 16 commands (11 read, 5
  write) under `absuite orders`, each generated from the platform's ServiceClients and checked against
  `absuite commands -o json`. For routes the CLI does not cover, use the absuite-orders REST skill.
---

# Alliance Business Suite — Orders Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-orders` REST skill documents 22 routes; 11 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-orders` REST skill.

## Commands

16 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Extended (`absuite orders extended`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite orders extended list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's extended. `GET /api/v2/OrdersService/Orders/Extended` |

### Lines (`absuite orders lines`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite orders lines list` | Reads |  | `--order-id` (required); `--top` `--skip` `--columns` | List the workspace's lines. `GET /api/v2/OrdersService/Orders/{orderId}/Lines` |
| `absuite orders lines count` | Reads |  | `--order-id` (required) | Count the workspace's lines. `GET /api/v2/OrdersService/Orders/{orderId}/Lines/Count` |
| `absuite orders lines show` | Reads |  | `--order-id` (required); `--columns` | Show the workspace's lines. `GET /api/v2/OrdersService/Orders/{orderId}/Lines` |
| `absuite orders lines create` | Writes |  | `--order-id` (required), `--item-id`, `--unit-id`, `--currency-id`, `--price-list-id`, `--unit-group-id`, `--discount-list-id`, `--rounding-policy-id`, `--price`, `--percent`; `--json` `--file` `--dry-run` | Create a record in the workspace's lines. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/OrdersService/Orders/{orderId}/Lines` |
| `absuite orders lines delete` | Writes | `<id>` | `--order-id` (required); `--yes` `--dry-run` | Delete one of the workspace's lines; it asks first unless --yes. `DELETE /api/v2/OrdersService/Orders/{orderId}/Lines/{orderLineId}` |

### Received (`absuite orders received`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite orders received list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's received. `GET /api/v2/OrdersService/Orders/Received` |
| `absuite orders received count` | Reads |  |  | Count the workspace's received. `GET /api/v2/OrdersService/Orders/Received/Count` |
| `absuite orders received get` | Reads | `<id>` | `--columns` | Show one of the workspace's received. `GET /api/v2/OrdersService/Orders/Received/{orderId}` |
| `absuite orders received lines list` | Reads |  | `--order-id` (required); `--top` `--skip` `--columns` | List the workspace's received lines. `GET /api/v2/OrdersService/Orders/Received/{orderId}/Lines` |

### Orders (`absuite orders`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite orders list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's orders. `GET /api/v2/OrdersService/Orders` |
| `absuite orders count` | Reads |  |  | Count the workspace's orders. `GET /api/v2/OrdersService/Orders/Count` |
| `absuite orders get` | Reads | `<id>` | `--columns` | Show one of the workspace's orders. `GET /api/v2/OrdersService/Orders/{orderId}` |
| `absuite orders create` | Writes |  | `--cart-id`, `--quote-id`, `--wallet-id`, `--parent-order-id`, `--shipping-method-id`, `--billing-location-id`, `--customer-notes`, `--order-status`, `--quote-status`, `--freight-terms`, `--shipping-location-id`, `--qualified-identifier`, `--total-taxes-in-usd`, `--total-discounts-in-usd`, `--total-surcharges-in-usd`, `--total-shipping-cost-in-usd`, `--total-shipping-tax-in-usd`, `--total-amount-in-usd`, `--effective-to`, `--effective-from`, `--closed`, `--title`, `--price-list-id`, `--description`, `--individual-id`, `--payment-term-id`, `--organization-id`, `--receiver-tenant-id`, `--first-name`, `--last-name`, `--company-name`, `--billing-email`, `--address-line1`, `--address-line2`, `--postal-code`, `--country-id`, `--state-id`, `--city-id`, `--forex-rate`, `--currency-id`, `--total-detail`, `--total-detail-currency-id`, `--total-profit`, `--total-profit-currency-id`, `--total-discounts`, `--total-discounts-currency-id`, `--total-surcharges`, `--total-surcharges-currency-id`, `--total-shipping-cost`, `--total-shipping-cost-currency-id`, `--total-shipping-tax`, `--total-shipping-tax-currency-id`, `--total-withheld-tax`, `--total-withheld-tax-currency-id`, `--total-tax-base`, `--total-tax-base-currency-id`, `--total-taxes`, `--total-taxes-currency-id`, `--total-global-surcharges`, `--total-global-surcharges-currency-id`, `--total-global-discounts`, `--total-global-discounts-currency-id`, `--total`, `--total-currency-id`, `--cost-calculation-method`, `--tax-calculation-method`; `--json` `--file` `--dry-run` | Create a record in the workspace's orders. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/OrdersService/Orders` |
| `absuite orders update` | Writes | `<id>` | `--cart-id`, `--total-amount-in-usd`, `--total-taxes-in-usd`, `--quote-status`, `--effective-to`, `--effective-from`, `--closed`, `--title`, `--price-list-id`, `--description`, `--individual-id`, `--payment-term-id`, `--organization-id`, `--receiver-tenant-id`, `--first-name`, `--last-name`, `--company-name`, `--billing-email`, `--address-line1`, `--address-line2`, `--postal-code`, `--country-id`, `--state-id`, `--city-id`, `--billing-location-id`, `--shipping-location-id`, `--shipping-method-id`, `--forex-rate`, `--currency-id`, `--total-detail`, `--total-detail-currency-id`, `--total-profit`, `--total-profit-currency-id`, `--total-discounts`, `--total-discounts-currency-id`, `--total-surcharges`, `--total-surcharges-currency-id`, `--total-shipping-tax`, `--total-shipping-tax-currency-id`, `--total-shipping-cost`, `--total-shipping-cost-currency-id`, `--total-global-discounts`, `--total-global-discounts-currency-id`, `--total-global-surcharges`, `--total-global-surcharges-currency-id`, `--total-withheld-tax`, `--total-withheld-tax-currency-id`, `--total-tax-base`, `--total-tax-base-currency-id`, `--total-taxes`, `--total-taxes-currency-id`, `--total`, `--total-currency-id`, `--cost-calculation-method`, `--tax-calculation-method`; `--json` `--file` `--dry-run` | Change one of the workspace's orders: reads it, applies --json/--file and the field flags, then saves it. Never set here: user-id (set by the server). `PUT /api/v2/OrdersService/Orders/{orderId}` |
| `absuite orders delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's orders; it asks first unless --yes. `DELETE /api/v2/OrdersService/Orders/{orderId}` |

## Example

```bash
absuite orders extended list --top 5 -o json --query "[].id"
absuite orders create --cart-id <value> --quote-id <value> --dry-run   # prints the POST, sends nothing
absuite orders create --cart-id <value> --quote-id <value> -o json --no-input
```
