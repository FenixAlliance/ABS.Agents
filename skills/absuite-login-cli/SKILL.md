---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-login-cli
key: fenixalliance.absuite.login-cli
version: 1.1.0
description: >
  Sign in to the Alliance Business Suite (ABS) with the absuite CLI: device-code login (the default),
  password login for a server on this computer, run tokens for agents, the workspace choice, sign-out,
  and the exit codes a script acts on.
---

# Alliance Business Suite — Sign-in Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json` and `absuite --help`). Re-run `absuite commands -o json` before relying on a command.

## Install

`npm install -g @fenixalliance/absuite` installs a self-contained binary for your platform. `absuite --version` prints its version; `absuite --help` lists the commands.

## Sign in

- `absuite login --url https://<server>` opens a one-time code sign-in in your browser (`--device`, the default). `--timeout <seconds>` stops waiting (1 to 3600).
- `--with-password` signs in with email and password, on servers that allow it; prefer the device flow. `--email` names the account; `--password-stdin` reads the password from standard input, for scripts, and only for a server on this computer (localhost).
- The session is kept in the OS-protected credential store, never in plain text; without one, the command ends with exit 4. Sessions are per profile; `--profile <name>` or `ABS_PROFILE` picks the profile.
- Then `absuite me` shows who you are, and `absuite account show` the profile, server and workspace.

## Choose the workspace

Every service command acts in one workspace (tenant). `absuite account list` lists yours; `absuite account set --tenant <id|name>` (or `absuite tenants use <id|name>`) saves one in the profile; `absuite account clear` forgets it. `--tenant <id>` or `ABS_TENANT` overrides it for one command.

## Commands

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

## Sign out

`absuite logout` revokes the session on the server and removes it from this computer; `--all` does so for every profile and server.

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
