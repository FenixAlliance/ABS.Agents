---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-cart-cli
key: fenixalliance.absuite.cart-cli
version: 1.1.0
description: >
  How the Cart area relates to the absuite CLI: the CLI has no cart commands today, so this skill says
  what the CLI does cover and points to the absuite-cart skill for the rest.
---

# Alliance Business Suite — Cart Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Not in the CLI:** The CLI has no cart commands yet: CartServiceClient's calls are not workspace-scoped, and this CLI's generic commands take exactly one workspace (TenantId). Use the `absuite-cart` REST skill for this area.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-cart` REST skill.

## Key Concepts

- **Cart** — holds records/lines plus a currency and country. Fetch an **ambient** cart
  without an ID: `guest` (anonymous), `acting` (session), `user` (signed-in user, from JWT),
  or `tenant` (a business cart, by tenant ID).
- **Record / Item / Line** — a cart's line entries, exposed as cart-scoped `item`/`line`
  views and as a flat trackable `record` surface addressed by a record ID.
- **Wish List** — a saved product list inside a cart (`Title`, `Description`, `Public`).
- **Compare table** — a per-cart set of products staged for comparison.

> Two DTOs use unusual casing the spec mandates verbatim: the currency-switch body uses
> `CartID` / `CurrencyID` (capital `ID`); the new-wish-list body uses `CartID`. Most other
> fields use `CartId` / `ItemId`.
