---
name: absuite-emails-cli
key: fenixalliance.absuite.emails-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Emails area with the absuite CLI: 20 commands (12 read, 8
  write) under `absuite marketing`, each generated from the platform's ServiceClients and checked
  against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-emails REST
  skill.
---

# Alliance Business Suite — Emails Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-emails` REST skill documents 21 routes; 9 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-emails` REST skill.

## Commands

20 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Email Groups (`absuite marketing email-groups`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite marketing email-groups list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's email-groups. `GET /api/v2/MarketingService/EmailGroups` |
| `absuite marketing email-groups count` | Reads |  |  | Count the workspace's email-groups. `GET /api/v2/MarketingService/EmailGroups/Count` |
| `absuite marketing email-groups get` | Reads | `<id>` | `--columns` | Show one of the workspace's email-groups. `GET /api/v2/MarketingService/EmailGroups/{emailGroupId}` |
| `absuite marketing email-groups create` | Writes |  | `--name`, `--description`, `--enabled`; `--json` `--file` `--dry-run` | Create a record in the workspace's email-groups. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/MarketingService/EmailGroups` |
| `absuite marketing email-groups update` | Writes | `<id>` | `--name`, `--description`, `--enabled`; `--json` `--file` `--dry-run` | Change one of the workspace's email-groups: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/MarketingService/EmailGroups/{emailGroupId}` |
| `absuite marketing email-groups delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's email-groups; it asks first unless --yes. `DELETE /api/v2/MarketingService/EmailGroups/{emailGroupId}` |

### Email Signatures (`absuite marketing email-signatures`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite marketing email-signatures list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's email-signatures. `GET /api/v2/MarketingService/EmailSignatures` |
| `absuite marketing email-signatures count` | Reads |  |  | Count the workspace's email-signatures. `GET /api/v2/MarketingService/EmailSignatures/Count` |
| `absuite marketing email-signatures get` | Reads | `<id>` | `--columns` | Show one of the workspace's email-signatures. `GET /api/v2/MarketingService/EmailSignatures/{emailsSignatureId}` |

### Email Templates (`absuite marketing email-templates`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite marketing email-templates list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's email-templates. `GET /api/v2/MarketingService/EmailTemplates` |
| `absuite marketing email-templates count` | Reads |  |  | Count the workspace's email-templates. `GET /api/v2/MarketingService/EmailTemplates/Count` |
| `absuite marketing email-templates get` | Reads | `<id>` | `--columns` | Show one of the workspace's email-templates. `GET /api/v2/MarketingService/EmailTemplates/{emailTemplateId}` |
| `absuite marketing email-templates create` | Writes |  | `--marketing-campaign-id`, `--title`, `--published`, `--description`, `--code`, `--markup`, `--featured-image-url`, `--code-type`; `--json` `--file` `--dry-run` | Create a record in the workspace's email-templates. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/MarketingService/EmailTemplates` |
| `absuite marketing email-templates delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's email-templates; it asks first unless --yes. `DELETE /api/v2/MarketingService/EmailTemplates/{emailTemplateId}` |

### Newsletters (`absuite marketing newsletters`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite marketing newsletters list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's newsletters. `GET /api/v2/MarketingService/Newsletters` |
| `absuite marketing newsletters count` | Reads |  |  | Count the workspace's newsletters. `GET /api/v2/MarketingService/Newsletters/Count` |
| `absuite marketing newsletters get` | Reads | `<id>` | `--columns` | Show one of the workspace's newsletters. `GET /api/v2/MarketingService/Newsletters/{newsletterId}` |
| `absuite marketing newsletters create` | Writes |  | `--name`, `--code`, `--title`; `--json` `--file` `--dry-run` | Create a record in the workspace's newsletters. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/MarketingService/Newsletters` |
| `absuite marketing newsletters update` | Writes | `<id>` | `--code`, `--title`, `--name`; `--json` `--file` `--dry-run` | Change one of the workspace's newsletters: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/MarketingService/Newsletters/{newsletterId}` |
| `absuite marketing newsletters delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's newsletters; it asks first unless --yes. `DELETE /api/v2/MarketingService/Newsletters/{newsletterId}` |

## Example

```bash
absuite marketing email-groups list --top 5 -o json --query "[].id"
absuite marketing email-groups create --name <value> --description <value> --dry-run   # prints the POST, sends nothing
absuite marketing email-groups create --name <value> --description <value> -o json --no-input
```
