---
name: absuite-cli
key: fenixalliance.absuite.cli
version: 1.1.0
description: >
  The absuite command line for the Alliance Business Suite (ABS): install, sign in, pick a workspace,
  find commands, shape output with -o and JMESPath --query, read exit codes, and run as an agent with
  a run token. Start here; each area has its own absuite-<area>-cli skill.
---

# Alliance Business Suite — absuite CLI

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json` and `absuite --help`). Re-run `absuite commands -o json` before relying on a command.

## Install

`npm install -g @fenixalliance/absuite` installs a self-contained binary for your platform. `absuite --version` prints its version; `absuite --help` lists the commands.

## Shape of a command

`absuite <service> <resource> <verb> [arguments] [options]`, for example `absuite crm contacts list --top 10`. The service is the API's own `api/v2/<X>Service` name, so the CLI never invents a name the API does not have. Verbs: `list`, `count`, `get`, `show`, `create`, `update`, `delete`, and a few named ones.

- `absuite commands -o json` lists every command (1717 in this build) with its arguments, options and whether it only reads. Agents should read it rather than guess.
- `absuite <command> --help` shows one command. `absuite interactive` starts a session with Tab completion and history (a terminal only; `--plain` for screen readers). `absuite completion <bash|pwsh|zsh>` prints a shell completion script.
- Writes take field flags or `--json '{...}'` / `--file <path>` with the same fields (flags win). `--dry-run` prints the request and sends nothing. `update` reads the record, applies your fields, then saves it whole. `delete` asks first unless `--yes`.
- The CLI has no PATCH. Bulk, destructive and identity-bending operations, secrets, tokens, settings, and the Security, System, Trust and Licensing services are left out on purpose; use Studio or the REST skills for those.

## Services

| Service | Commands |
|---|---|
| `absuite accounting` | 237 |
| `absuite activities` | 16 |
| `absuite analytics` | 7 |
| `absuite approvals` | 3 |
| `absuite assets` | 39 |
| `absuite blockchains` | 10 |
| `absuite catalog` | 85 |
| `absuite cloud` | 3 |
| `absuite communications` | 13 |
| `absuite content` | 74 |
| `absuite crm` | 58 |
| `absuite deals` | 25 |
| `absuite hrms` | 152 |
| `absuite intelligence` | 37 |
| `absuite invoicing` | 37 |
| `absuite learning` | 198 |
| `absuite locations` | 6 |
| `absuite logistics` | 151 |
| `absuite manufacturing` | 24 |
| `absuite marketing` | 76 |
| `absuite orders` | 17 |
| `absuite payments` | 18 |
| `absuite pricing` | 35 |
| `absuite projects` | 8 |
| `absuite quotes` | 18 |
| `absuite reach` | 2 |
| `absuite sales` | 22 |
| `absuite search` | 1 |
| `absuite services` | 36 |
| `absuite shipments` | 60 |
| `absuite social` | 26 |
| `absuite storage` | 4 |
| `absuite subscriptions` | 9 |
| `absuite support` | 82 |
| `absuite tasks` | 9 |
| `absuite tenants` | 74 |
| `absuite wallets` | 6 |
| `absuite workflows` | 21 |

## Sign-in, workspace and settings

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite login` | Writes |  | `--device`, `--with-password`, `--email`, `--password-stdin`, `--timeout` | Sign in to the ABS server. |
| `absuite logout` | Writes |  | `--all` | Sign out: revoke the session on the server and remove it from this computer. |
| `absuite me` | Reads |  |  | Show who you are signed in as. |
| `absuite account show` | Reads |  |  | Show the profile, the server, who you are signed in as and the workspace you act in. |
| `absuite account list` | Reads |  |  | List the workspaces (tenants) you can use on this server. |
| `absuite account set` | Writes |  |  | Act in this workspace from now on (saved in the profile): absuite account set --tenant <id\|name>. |
| `absuite account use` | Writes | `<workspace>` |  | Act in this workspace from now on (same as absuite account set --tenant). |
| `absuite account clear` | Writes |  |  | Forget the profile's saved workspace. |
| `absuite tenants list` | Reads |  |  | List the workspaces (tenants) you can use (same as absuite account list). |
| `absuite tenants use` | Writes | `<workspace>` |  | Act in this workspace from now on (same as absuite account set --tenant). |
| `absuite config get` | Reads | `<key>` |  | Show one setting of the profile. |
| `absuite config set` | Writes | `<key>` `<value>` |  | Change one setting of the profile (creates the profile if it is new). |
| `absuite config unset` | Writes | `<key>` |  | Clear one setting of the profile. |
| `absuite config list` | Reads |  |  | Show the profile's settings and where they come from. |
| `absuite config profiles` | Reads |  |  | List the profiles: server host, workspace, and whether this computer holds a sign-in. |
| `absuite config use` | Writes | `<profile>` |  | Make this profile the current one. |
| `absuite config delete` | Writes | `<profile>` |  | Remove a profile. Refused while it holds a sign-in (run absuite logout first). |
| `absuite interactive` | Writes |  | `--plain` | Start an interactive session: run absuite commands one after another, with Tab completion of commands, options and record ids, history, and inline help. Needs a terminal: it does not start under CI, ABS_NO_TUI, --no-input, redirected input or output, or a non-human output format. --plain (or ABS_TUI_PLAIN=1) gives a plain mode for screen readers: no redraws, no colors. NO_COLOR turns colors off. |
| `absuite completion` | Reads | `<shell>` |  | Print the shell completion script for pwsh, bash or zsh. It asks absuite for suggestions as you type. Record ids are completed only when ABS_COMPLETE_IDS=1 is set, and never workspaces. |
| `absuite commands` | Reads |  |  | List every command, with its options and whether it only reads (-o json for scripts and agents). |

Settings: `--profile`, `--url` and `--tenant` on any command, or `ABS_PROFILE`, `ABS_URL`, `ABS_TENANT`, `ABS_OUTPUT`. `absuite config list` shows each setting and where it comes from. No secret is ever stored in the settings.

## Output and queries

- `-o table` (the default; `human` also works), `json`, `jsonc`, `tsv`, `yaml` or `none`. `ABS_OUTPUT` sets the default.
- `--query "<JMESPath>"` is applied to the result before it is printed, in every format: `absuite crm contacts list -o json --query "[].name"`. A bad expression is a usage error (exit 2).
- `--columns a,b,c` picks the fields of the human table. `--only-show-errors` hides warnings and notices; `--verbose` says what the command runs with; `--debug` traces each HTTP call (method, address without its query, status, time; never headers, tokens or bodies).
- Errors always print on standard error, whatever `-o` or `--only-show-errors` say. With `-o json` or `-o jsonc` they are one JSON document: `{"error":{"message","code","correlation","validation","exitCode"}}`. The API's error code and correlation id are always shown; quote them to support.

## Exit codes

Scripts can rely on these: a number never changes meaning.

| Code | Meaning |
|---|---|
| 0 | Done. |
| 1 | The API refused or failed the request for a reason no narrower code describes (a validation error, a feature that is off, an unexpected failure). |
| 2 | A bad flag, argument, `--query` expression or configuration value; or input was needed under `--no-input`. |
| 3 | Not signed in, or the session expired and could not be refreshed. |
| 4 | No OS-protected credential store on this computer, so the session could not be kept (it is never kept in plain text). |
| 5 | The record does not exist in this workspace. |
| 6 | Signed in, but not allowed to do this (403). |
| 7 | The server failed (5xx). |
| 8 | The server could not be reached, or did not answer in time. |

## Agents: run tokens

An agent on its own computer uses its run token instead of `absuite login`:

- Set `ABS_TOKEN` (the token) or `ABS_TOKEN_FILE` (an absolute path to a file holding only the token; read fresh on every command, so rotation needs no restart). Set one, never both: both is a usage error.
- The token is used only with `--url` or `ABS_URL`; otherwise the CLI says it is ignored. It is never sent over plain http:// except to a server on the same computer (localhost, 127.0.0.1 or ::1).
- The token says who the agent is; the workspace's roles decide what it may do (CEO ruling, 2026-11-10). A read passes the run-token check; the workspace's roles still decide what it can see. A write meets the same permission checks as a person's, and a governed capability goes to Approvals, whose answer is returned as-is.
- Refusals a run token can meet, with the API code shown in the error: `trust.agent_api.unbound_run` (the token names no run or workspace), `trust.agent_api.unpermissioned_write` (a write whose use case names no permission and no role, the one write roles cannot govern), `trust.agent_api.gate_unavailable` (the check could not decide, so it refused). They end with exit 6 or 1. `trust.agent_api.unclassified_write` is no longer returned; older audit rows may still show it.
- Always pass `--no-input` and `-o json`, and act on the exit code, not on the text.
