---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-payments-cli
key: fenixalliance.absuite.payments-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Payments area with the absuite CLI: 13 commands (13 read, 0
  write) under `absuite payments`, each generated from the platform's ServiceClients and checked
  against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-payments REST
  skill.
---

# Alliance Business Suite — Payments Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-payments` REST skill documents 26 routes; 16 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-payments` REST skill.

## Commands

13 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Payment Methods (`absuite payments payment-methods`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite payments payment-methods list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's payment-methods. `GET /api/v2/PaymentsService/PaymentMethods` |
| `absuite payments payment-methods count` | Reads |  |  | Count the workspace's payment-methods. `GET /api/v2/PaymentsService/PaymentMethods/Count` |
| `absuite payments payment-methods get` | Reads | `<id>` | `--columns` | Show one of the workspace's payment-methods. `GET /api/v2/PaymentsService/PaymentMethods/{paymentMethodId}` |

### Payment Modes (`absuite payments payment-modes`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite payments payment-modes list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's payment-modes. `GET /api/v2/PaymentsService/PaymentModes` |
| `absuite payments payment-modes count` | Reads |  |  | Count the workspace's payment-modes. `GET /api/v2/PaymentsService/PaymentModes/Count` |
| `absuite payments payment-modes get` | Reads | `<id>` | `--columns` | Show one of the workspace's payment-modes. `GET /api/v2/PaymentsService/PaymentModes/{paymentModeId}` |

### Payment Provider Registrations (`absuite payments payment-provider-registrations`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite payments payment-provider-registrations list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's payment-provider-registrations. `GET /api/v2/PaymentsService/PaymentProviderRegistrations` |
| `absuite payments payment-provider-registrations count` | Reads |  |  | Count the workspace's payment-provider-registrations. `GET /api/v2/PaymentsService/PaymentProviderRegistrations/Count` |

### Payment Terms (`absuite payments payment-terms`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite payments payment-terms list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's payment-terms. `GET /api/v2/PaymentsService/PaymentTerms` |
| `absuite payments payment-terms count` | Reads |  |  | Count the workspace's payment-terms. `GET /api/v2/PaymentsService/PaymentTerms/Count` |
| `absuite payments payment-terms get` | Reads | `<id>` | `--columns` | Show one of the workspace's payment-terms. `GET /api/v2/PaymentsService/PaymentTerms/{paymentTermId}` |

### Payments (`absuite payments`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite payments list` | Reads |  | `--columns` | List the workspace's payments. `GET /api/v2/PaymentsService/Payments` |
| `absuite payments get` | Reads | `<id>` | `--columns` | Show one of the workspace's payments. `GET /api/v2/PaymentsService/Payments/{paymentId}` |

## Example

```bash
absuite payments list -o json --query "[].id"
```

## Key Concepts

- **Payment** — a money-movement record between two wallets, optionally linked to an
  invoice and/or order, with amount/tax totals, currency, gateway/bank references, and
  KYC/anti-fraud fields.
- **Payment Method** — a configured way to pay (lookup: `Name` + `Description`).
- **Payment Mode** — a configured payment delivery mechanism (lookup: `Name` +
  `Description`).
- **Payment Term** — contractual conditions (e.g. Net 30) with a credit window
  (`CreditDays`/`CreditWeeks`/`CreditMonths`/`CreditYears`), an optional `Percentage`,
  an `IsTemplate` flag, and an optional `PaymentModeId`.
- **`OnBehalfOf`** — `Self` | `Tenant` | `Individual` | `Organization`.
- **`PaymentType`** — `Paid` | `Received` | `Internal`.
- **`PaymentStatus`** (lifecycle) — `Unset` | `Accepted` | `Rejected` | `OnHold` |
  `Failed` | `Reversed` | `Retained` | `Initialized` | `Expired` | `Abandoned` |
  `Cancelled` | `AcceptedRetained`.
