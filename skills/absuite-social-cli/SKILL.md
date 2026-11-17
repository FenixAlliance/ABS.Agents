---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-social-cli
key: fenixalliance.absuite.social-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Social area with the absuite CLI: 8 commands (5 read, 3
  write) under `absuite social`, each generated from the platform's ServiceClients and checked against
  `absuite commands -o json`. For routes the CLI does not cover, use the absuite-social REST skill.
---

# Alliance Business Suite — Social Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-social` REST skill documents 58 routes; 53 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-social` REST skill.

## Commands

8 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Social Groups (`absuite social social-groups`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite social social-groups list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's social-groups. `GET /api/v2/SocialService/SocialGroups` |
| `absuite social social-groups count` | Reads |  |  | Count the workspace's social-groups. `GET /api/v2/SocialService/SocialGroups/Count` |
| `absuite social social-groups get` | Reads | `<id>` | `--columns` | Show one of the workspace's social-groups. `GET /api/v2/SocialService/SocialGroups/{socialGroupId}` |
| `absuite social social-groups create` | Writes |  | `--name`, `--title`, `--avatar-url`, `--social-profile-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's social-groups. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SocialService/SocialGroups` |
| `absuite social social-groups update` | Writes | `<id>` | `--name`, `--title`, `--avatar-url`; `--json` `--file` `--dry-run` | Change one of the workspace's social-groups: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/SocialService/SocialGroups/{socialGroupId}` |
| `absuite social social-groups delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's social-groups; it asks first unless --yes. `DELETE /api/v2/SocialService/SocialGroups/{socialGroupId}` |

### Social Profiles (`absuite social social-profiles`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite social social-profiles notifications list` | Reads |  | `--social-profile-id` (required); `--top` `--skip` `--columns` | List the workspace's social-profiles notifications. `GET /api/v2/SocialService/SocialProfiles/{socialProfileId}/Notifications` |
| `absuite social social-profiles notifications count` | Reads |  | `--social-profile-id` (required) | Count the workspace's social-profiles notifications. `GET /api/v2/SocialService/SocialProfiles/{socialProfileId}/Notifications/Count` |

## Example

```bash
absuite social social-groups list --top 5 -o json --query "[].id"
absuite social social-groups create --name <value> --title <value> --dry-run   # prints the POST, sends nothing
absuite social social-groups create --name <value> --title <value> -o json --no-input
```
