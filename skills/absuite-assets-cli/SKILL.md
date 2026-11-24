---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-assets-cli
key: fenixalliance.absuite.assets-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Assets area with the absuite CLI: 39 commands (21 read, 18
  write) under `absuite assets`, each generated from the platform's ServiceClients and checked against
  `absuite commands -o json`. For routes the CLI does not cover, use the absuite-assets REST skill.
---

# Alliance Business Suite — Assets Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-assets` REST skill documents 28 routes; 7 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-assets` REST skill.

## Commands

39 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Asset Types (`absuite assets asset-types`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite assets asset-types list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's asset-types. `GET /api/v2/AssetsService/AssetTypes` |
| `absuite assets asset-types count` | Reads |  |  | Count the workspace's asset-types. `GET /api/v2/AssetsService/AssetTypes/count` |
| `absuite assets asset-types get` | Reads | `<id>` | `--columns` | Show one of the workspace's asset-types. `GET /api/v2/AssetsService/AssetTypes/{typeId}` |
| `absuite assets asset-types create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's asset-types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AssetsService/AssetTypes` |
| `absuite assets asset-types update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's asset-types: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AssetsService/AssetTypes/{typeId}` |
| `absuite assets asset-types delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's asset-types; it asks first unless --yes. `DELETE /api/v2/AssetsService/AssetTypes/{typeId}` |

### Categories (`absuite assets categories`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite assets categories list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's categories. `GET /api/v2/AssetsService/Assets/Categories` |
| `absuite assets categories count` | Reads |  |  | Count the workspace's categories. `GET /api/v2/AssetsService/Assets/Categories/count` |
| `absuite assets categories get` | Reads | `<id>` | `--columns` | Show one of the workspace's categories. `GET /api/v2/AssetsService/Assets/Categories/{categoryId}` |
| `absuite assets categories create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's categories. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AssetsService/Assets/Categories` |
| `absuite assets categories update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's categories: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AssetsService/Assets/Categories/{categoryId}` |
| `absuite assets categories delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's categories; it asks first unless --yes. `DELETE /api/v2/AssetsService/Assets/Categories/{categoryId}` |

### Depreciation Records (`absuite assets depreciation-records`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite assets depreciation-records list` | Reads |  | `--asset-id` (required); `--top` `--skip` `--columns` | List the workspace's depreciation-records. `GET /api/v2/AssetsService/Assets/{assetId}/DepreciationRecords` |
| `absuite assets depreciation-records count` | Reads |  | `--asset-id` (required) | Count the workspace's depreciation-records. `GET /api/v2/AssetsService/Assets/{assetId}/DepreciationRecords/Count` |
| `absuite assets depreciation-records get` | Reads | `<id>` | `--asset-id` (required); `--columns` | Show one of the workspace's depreciation-records. `GET /api/v2/AssetsService/Assets/{assetId}/DepreciationRecords/{recordId}` |
| `absuite assets depreciation-records create` | Writes |  | `--asset-id` (required), `--asset-depreciation-policy-id`, `--depreciation-amount`, `--accumulated-depreciation`, `--book-value`, `--depreciation-date`, `--year`, `--month`; `--json` `--file` `--dry-run` | Create a record in the workspace's depreciation-records. Only in --json: asset-id. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AssetsService/Assets/{assetId}/DepreciationRecords` |
| `absuite assets depreciation-records update` | Writes | `<id>` | `--asset-id` (required), `--depreciation-amount`, `--accumulated-depreciation`, `--book-value`, `--depreciation-date`, `--year`, `--month`; `--json` `--file` `--dry-run` | Change one of the workspace's depreciation-records: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AssetsService/Assets/{assetId}/DepreciationRecords/{recordId}` |
| `absuite assets depreciation-records delete` | Writes | `<id>` | `--asset-id` (required); `--yes` `--dry-run` | Delete one of the workspace's depreciation-records; it asks first unless --yes. `DELETE /api/v2/AssetsService/Assets/{assetId}/DepreciationRecords/{recordId}` |

### Repairs (`absuite assets repairs`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite assets repairs list` | Reads |  | `--asset-id` (required); `--top` `--skip` `--columns` | List the workspace's repairs. `GET /api/v2/AssetsService/Assets/{assetId}/Repairs` |
| `absuite assets repairs count` | Reads |  | `--asset-id` (required) | Count the workspace's repairs. `GET /api/v2/AssetsService/Assets/{assetId}/Repairs/Count` |
| `absuite assets repairs get` | Reads | `<id>` | `--asset-id` (required); `--columns` | Show one of the workspace's repairs. `GET /api/v2/AssetsService/Assets/{assetId}/Repairs/{repairId}` |
| `absuite assets repairs create` | Writes |  | `--asset-id` (required), `--repair-status`, `--scheduled-date`, `--completion-date`, `--reported-date`, `--estimated-cost`, `--actual-cost`, `--problem-description`, `--repair-description`, `--notes`, `--asset-maintenance-team-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's repairs. Only in --json: asset-id. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AssetsService/Assets/{assetId}/Repairs` |
| `absuite assets repairs update` | Writes | `<id>` | `--asset-id` (required), `--repair-status`, `--scheduled-date`, `--completion-date`, `--estimated-cost`, `--actual-cost`, `--problem-description`, `--repair-description`, `--notes`, `--asset-maintenance-team-id`; `--json` `--file` `--dry-run` | Change one of the workspace's repairs: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AssetsService/Assets/{assetId}/Repairs/{repairId}` |
| `absuite assets repairs delete` | Writes | `<id>` | `--asset-id` (required); `--yes` `--dry-run` | Delete one of the workspace's repairs; it asks first unless --yes. `DELETE /api/v2/AssetsService/Assets/{assetId}/Repairs/{repairId}` |

### Transfers (`absuite assets transfers`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite assets transfers list` | Reads |  | `--asset-id` (required); `--top` `--skip` `--columns` | List the workspace's transfers. `GET /api/v2/AssetsService/Assets/{assetId}/Transfers` |
| `absuite assets transfers count` | Reads |  | `--asset-id` (required) | Count the workspace's transfers. `GET /api/v2/AssetsService/Assets/{assetId}/Transfers/Count` |
| `absuite assets transfers get` | Reads | `<id>` | `--asset-id` (required); `--columns` | Show one of the workspace's transfers. `GET /api/v2/AssetsService/Assets/{assetId}/Transfers/{transferId}` |

### Value Amends (`absuite assets value-amends`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite assets value-amends list` | Reads |  | `--asset-id` (required); `--top` `--skip` `--columns` | List the workspace's value-amends. `GET /api/v2/AssetsService/Assets/{assetId}/ValueAmends` |
| `absuite assets value-amends count` | Reads |  | `--asset-id` (required) | Count the workspace's value-amends. `GET /api/v2/AssetsService/Assets/{assetId}/ValueAmends/Count` |
| `absuite assets value-amends get` | Reads | `<id>` | `--asset-id` (required); `--columns` | Show one of the workspace's value-amends. `GET /api/v2/AssetsService/Assets/{assetId}/ValueAmends/{valueAmendId}` |
| `absuite assets value-amends create` | Writes |  | `--asset-id` (required), `--previous-value`, `--new-value`, `--reason`, `--amendment-date`, `--currency-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's value-amends. Only in --json: asset-id. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AssetsService/Assets/{assetId}/ValueAmends` |
| `absuite assets value-amends update` | Writes | `<id>` | `--asset-id` (required), `--new-value`, `--reason`, `--amendment-date`; `--json` `--file` `--dry-run` | Change one of the workspace's value-amends: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AssetsService/Assets/{assetId}/ValueAmends/{valueAmendId}` |
| `absuite assets value-amends delete` | Writes | `<id>` | `--asset-id` (required); `--yes` `--dry-run` | Delete one of the workspace's value-amends; it asks first unless --yes. `DELETE /api/v2/AssetsService/Assets/{assetId}/ValueAmends/{valueAmendId}` |

### Assets (`absuite assets`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite assets list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's assets. `GET /api/v2/AssetsService/Assets` |
| `absuite assets count` | Reads |  |  | Count the workspace's assets. `GET /api/v2/AssetsService/Assets/Count` |
| `absuite assets get` | Reads | `<id>` | `--columns` | Show one of the workspace's assets. `GET /api/v2/AssetsService/Assets/{assetId}` |
| `absuite assets create` | Writes |  | `--name`, `--description`, `--asset-class`, `--asset-owner`, `--is-existing-asset`, `--calculate-depreciation`, `--allow-monthly-depreciation`, `--opening-depreciation`, `--purchase-date`, `--purchase-price`, `--currency-id`, `--item-id`, `--asset-type-id`, `--asset-category-id`, `--purchase-invoice-id`, `--purchase-receipt-id`, `--asset-location-id`, `--contact-id`, `--organization-department-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's assets. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/AssetsService/Assets` |
| `absuite assets update` | Writes | `<id>` | `--name`, `--description`, `--asset-class`, `--asset-owner`, `--calculate-depreciation`, `--allow-monthly-depreciation`, `--opening-depreciation`, `--purchase-date`, `--purchase-price`, `--currency-id`, `--item-id`, `--asset-type-id`, `--asset-category-id`, `--purchase-invoice-id`, `--purchase-receipt-id`, `--asset-location-id`, `--contact-id`, `--organization-department-id`; `--json` `--file` `--dry-run` | Change one of the workspace's assets: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/AssetsService/Assets/{assetId}` |
| `absuite assets delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's assets; it asks first unless --yes. `DELETE /api/v2/AssetsService/Assets/{assetId}` |

## Example

```bash
absuite assets asset-types list --top 5 -o json --query "[].id"
absuite assets asset-types create --name <value> --description <value> --dry-run   # prints the POST, sends nothing
absuite assets asset-types create --name <value> --description <value> -o json --no-input
```
