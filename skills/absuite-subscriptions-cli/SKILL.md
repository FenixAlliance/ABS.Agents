---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-subscriptions-cli
key: fenixalliance.absuite.subscriptions-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Subscriptions area with the absuite CLI: 6 commands (6 read,
  0 write) under `absuite subscriptions`, each generated from the platform's ServiceClients and
  checked against `absuite commands -o json`. For routes the CLI does not cover, use the
  absuite-subscriptions REST skill.
---

# Alliance Business Suite — Subscriptions Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-subscriptions` REST skill documents 7 routes; 3 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-subscriptions` REST skill.

## Commands

6 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Subscription Plans (`absuite subscriptions subscription-plans`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite subscriptions subscription-plans list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's subscription-plans. `GET /api/v2/SubscriptionsService/SubscriptionPlans` |
| `absuite subscriptions subscription-plans count` | Reads |  |  | Count the workspace's subscription-plans. `GET /api/v2/SubscriptionsService/SubscriptionPlans/Count` |
| `absuite subscriptions subscription-plans get` | Reads | `<id>` | `--columns` | Show one of the workspace's subscription-plans. `GET /api/v2/SubscriptionsService/SubscriptionPlans/{planId}` |

### Subscriptions (`absuite subscriptions`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite subscriptions list` | Reads |  | `--top` `--skip` | List the subscriptions in the workspace. |
| `absuite subscriptions count` | Reads |  |  | Count the workspace's subscriptions. `GET /api/v2/SubscriptionsService/Subscriptions/Count` |
| `absuite subscriptions get` | Reads | `<id>` |  | Show one subscription. |

## Example

```bash
absuite subscriptions list --top 5 -o json --query "[].id"
```
