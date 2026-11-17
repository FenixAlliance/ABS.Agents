---
name: absuite-pricing-cli
key: fenixalliance.absuite.pricing-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Pricing area with the absuite CLI: 35 commands (18 read, 17
  write) under `absuite pricing`, each generated from the platform's ServiceClients and checked
  against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-pricing REST
  skill.
---

# Alliance Business Suite — Pricing Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-pricing` REST skill documents 25 routes; 7 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-pricing` REST skill.

## Commands

35 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Discount Lists (`absuite pricing discount-lists`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite pricing discount-lists list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's discount-lists. `GET /api/v2/PricingService/DiscountLists` |
| `absuite pricing discount-lists count` | Reads |  |  | Count the workspace's discount-lists. `GET /api/v2/PricingService/DiscountLists/Count` |
| `absuite pricing discount-lists get` | Reads | `<id>` | `--columns` | Show one of the workspace's discount-lists. `GET /api/v2/PricingService/DiscountLists/{discountListId}` |
| `absuite pricing discount-lists create` | Writes |  | `--name`, `--discount-list-type`, `--currency-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's discount-lists. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/PricingService/DiscountLists` |
| `absuite pricing discount-lists update` | Writes | `<id>` | `--name`, `--discount-list-type`, `--currency-id`; `--json` `--file` `--dry-run` | Change one of the workspace's discount-lists: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/PricingService/DiscountLists/{discountListId}` |
| `absuite pricing discount-lists delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's discount-lists; it asks first unless --yes. `DELETE /api/v2/PricingService/DiscountLists/{discountListId}` |
| `absuite pricing discount-lists discounts list` | Reads |  | `--discount-list-id` (required); `--top` `--skip` `--columns` | List the workspace's discount-lists discounts. `GET /api/v2/PricingService/DiscountLists/{discountListId}/Discounts` |
| `absuite pricing discount-lists discounts count` | Reads |  | `--discount-list-id` (required) | Count the workspace's discount-lists discounts. `GET /api/v2/PricingService/DiscountLists/{discountListId}/Discounts/Count` |
| `absuite pricing discount-lists discounts get` | Reads | `<id>` | `--discount-list-id` (required); `--columns` | Show one of the workspace's discount-lists discounts. `GET /api/v2/PricingService/DiscountLists/{discountListId}/Discounts/{discountId}` |
| `absuite pricing discount-lists discounts create` | Writes |  | `--discount-list-id` (required), `--description`, `--begin-quantity`, `--end-quantity`, `--percent`, `--value`, `--item-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's discount-lists discounts. Only in --json: discount-list-id. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/PricingService/DiscountLists/{discountListId}/Discounts` |
| `absuite pricing discount-lists discounts update` | Writes | `<id>` | `--discount-list-id` (required), `--description`, `--begin-quantity`, `--end-quantity`, `--percent`, `--value`, `--item-id`; `--json` `--file` `--dry-run` | Change one of the workspace's discount-lists discounts: reads it, applies --json/--file and the field flags, then saves it. Only in --json: discount-list-id. `PUT /api/v2/PricingService/DiscountLists/{discountListId}/Discounts/{discountId}` |
| `absuite pricing discount-lists discounts delete` | Writes | `<id>` | `--discount-list-id` (required); `--yes` `--dry-run` | Delete one of the workspace's discount-lists discounts; it asks first unless --yes. `DELETE /api/v2/PricingService/DiscountLists/{discountListId}/Discounts/{discountId}` |

### Price Lists (`absuite pricing price-lists`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite pricing price-lists list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's price-lists. `GET /api/v2/PricingService/PriceLists` |
| `absuite pricing price-lists count` | Reads |  |  | Count the workspace's price-lists. `GET /api/v2/PricingService/PriceLists/Count` |
| `absuite pricing price-lists get` | Reads | `<id>` | `--columns` | Show one of the workspace's price-lists. `GET /api/v2/PricingService/PriceLists/{priceListId}` |
| `absuite pricing price-lists create` | Writes |  | `--name`, `--description`, `--context`, `--start-date`, `--end-date`, `--currency-id`, `--unit-id`, `--unit-group-id`, `--partner-visible`, `--unit-of-measure-dependant`; `--json` `--file` `--dry-run` | Create a record in the workspace's price-lists. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/PricingService/PriceLists` |
| `absuite pricing price-lists update` | Writes | `<id>` | `--name`, `--description`, `--context`, `--start-date`, `--end-date`, `--currency-id`, `--unit-id`, `--unit-group-id`, `--partner-visible`, `--unit-of-measure-dependant`; `--json` `--file` `--dry-run` | Change one of the workspace's price-lists: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/PricingService/PriceLists/{priceListId}` |
| `absuite pricing price-lists delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's price-lists; it asks first unless --yes. `DELETE /api/v2/PricingService/PriceLists/{priceListId}` |
| `absuite pricing price-lists prices list` | Reads |  | `--price-list-id` (required); `--columns` | List the workspace's price-lists prices. `GET /api/v2/PricingService/PriceLists/{priceListId}/Prices` |
| `absuite pricing price-lists prices count` | Reads |  | `--price-list-id` (required) | Count the workspace's price-lists prices. `GET /api/v2/PricingService/PriceLists/{priceListId}/Prices/Count` |
| `absuite pricing price-lists prices get` | Reads | `<id>` | `--price-list-id` (required); `--columns` | Show one of the workspace's price-lists prices. `GET /api/v2/PricingService/PriceLists/{priceListId}/Prices/{priceId}` |
| `absuite pricing price-lists prices create` | Writes |  | `--price-list-id` (required), `--item-id`, `--unit-id`, `--currency-id`, `--unit-group-id`, `--discount-list-id`, `--rounding-policy-id`, `--price`, `--percent`; `--json` `--file` `--dry-run` | Create a record in the workspace's price-lists prices. Only in --json: price-list-id. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/PricingService/PriceLists/{priceListId}/Prices` |
| `absuite pricing price-lists prices update` | Writes | `<id>` | `--price-list-id` (required), `--price`, `--item-id`, `--unit-id`, `--percent`, `--unit-group-id`, `--currency-id`, `--discount-list-id`, `--rounding-policy-id`; `--json` `--file` `--dry-run` | Change one of the workspace's price-lists prices: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/PricingService/PriceLists/{priceListId}/Prices/{priceId}` |
| `absuite pricing price-lists prices delete` | Writes | `<id>` | `--price-list-id` (required); `--yes` `--dry-run` | Delete one of the workspace's price-lists prices; it asks first unless --yes. `DELETE /api/v2/PricingService/PriceLists/{priceListId}/Prices/{priceId}` |

### Pricing Rules (`absuite pricing pricing-rules`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite pricing pricing-rules list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's pricing-rules. `GET /api/v2/PricingService/PricingRules` |
| `absuite pricing pricing-rules count` | Reads |  |  | Count the workspace's pricing-rules. `GET /api/v2/PricingService/PricingRules/Count` |
| `absuite pricing pricing-rules get` | Reads | `<id>` | `--columns` | Show one of the workspace's pricing-rules. `GET /api/v2/PricingService/PricingRules/{pricingRuleId}` |
| `absuite pricing pricing-rules create` | Writes |  | `--code`, `--title`, `--description`, `--is-free`, `--reduce`, `--is-enabled`, `--is-default`, `--allow-international`, `--hours`, `--days`, `--weeks`, `--months`, `--years`, `--value`, `--percentage`, `--currency-id`, `--country-id`, `--country-state-id`, `--custom-state`, `--custom-city`, `--city-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's pricing-rules. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/PricingService/PricingRules` |
| `absuite pricing pricing-rules delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's pricing-rules; it asks first unless --yes. `DELETE /api/v2/PricingService/PricingRules/{pricingRuleId}` |

### Rounding Policies (`absuite pricing rounding-policies`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite pricing rounding-policies list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's rounding-policies. `GET /api/v2/PricingService/RoundingPolicies` |
| `absuite pricing rounding-policies count` | Reads |  |  | Count the workspace's rounding-policies. `GET /api/v2/PricingService/RoundingPolicies/Count` |
| `absuite pricing rounding-policies get` | Reads | `<id>` | `--columns` | Show one of the workspace's rounding-policies. `GET /api/v2/PricingService/RoundingPolicies/{roundingPolicyId}` |
| `absuite pricing rounding-policies create` | Writes |  | `--code`, `--title`, `--description`, `--is-free`, `--reduce`, `--is-enabled`, `--is-default`, `--allow-international`, `--hours`, `--days`, `--weeks`, `--months`, `--years`, `--value`, `--percentage`, `--currency-id`, `--country-id`, `--country-state-id`, `--custom-state`, `--custom-city`, `--city-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's rounding-policies. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/PricingService/RoundingPolicies` |
| `absuite pricing rounding-policies update` | Writes | `<id>` | `--code`, `--title`, `--description`, `--is-free`, `--reduce`, `--is-enabled`, `--is-default`, `--allow-international`, `--hours`, `--days`, `--weeks`, `--months`, `--years`, `--value`, `--percentage`, `--currency-id`, `--country-id`, `--country-state-id`, `--custom-state`, `--custom-city`, `--city-id`; `--json` `--file` `--dry-run` | Change one of the workspace's rounding-policies: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/PricingService/RoundingPolicies/{roundingPolicyId}` |
| `absuite pricing rounding-policies delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's rounding-policies; it asks first unless --yes. `DELETE /api/v2/PricingService/RoundingPolicies/{roundingPolicyId}` |

## Example

```bash
absuite pricing discount-lists list --top 5 -o json --query "[].id"
absuite pricing discount-lists create --name <value> --discount-list-type <value> --dry-run   # prints the POST, sends nothing
absuite pricing discount-lists create --name <value> --discount-list-type <value> -o json --no-input
```

## Key Concepts

- **Price List** — a named, dated set of item prices, optionally scoped to a context, currency, and unit/unit-group.
- **Price (price-list entry / `ItemPrice`)** — the price of a single item inside a price list.
- **Discount List** — a named set of quantity-banded discounts (amount- or percentage-based).
- **Discount (discount-list entry)** — a single banded discount for an item.
- **Pricing Rule** — a free/reduce, geo-scoped, time-windowed rule carrying a `value` and/or `percentage`.
- **Rounding Policy** — a policy controlling price rounding; shares the pricing-rule shape.
- **`PriceList.Context`** — `Sales` | `Purchase` | `Cost`.
- **`DiscountList.DiscountListType`** — `Amount` | `Percentage`.
- **Percentage convention** — every `Percent` / `Percentage` field is a **whole number**, not a
  fraction: `19.5` means 19.5%, `10` means 10%. Never send `0.10` for 10%.

## Notes

- **No PATCH.** The `absuite` CLI does not support JSON Patch. For atomic partial updates, use
  the `absuite-pricing` REST skill; otherwise use `update` (full PUT replace).
- **No `search`.** The Pricing Service exposes no search endpoint — use `list` (optionally with
  the entity's parent id) and filter client-side.
- **Create parents before children.** Create a price list before its price entries, and a
  discount list before its discount entries; entries reference the parent list id.
