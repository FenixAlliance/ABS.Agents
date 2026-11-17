---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-contacts-cli
key: fenixalliance.absuite.contacts-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Contacts area with the absuite CLI: 58 commands (39 read, 19
  write) under `absuite crm`, each generated from the platform's ServiceClients and checked against
  `absuite commands -o json`. For routes the CLI does not cover, use the absuite-contacts REST skill.
---

# Alliance Business Suite — Contacts Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-contacts` REST skill documents 61 routes; 23 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-contacts` REST skill.

## Commands

58 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Contact Groups (`absuite crm contact-groups`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite crm contact-groups list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's contact-groups. `GET /api/v2/CrmService/ContactGroups` |
| `absuite crm contact-groups count` | Reads |  |  | Count the workspace's contact-groups. `GET /api/v2/CrmService/ContactGroups/Count` |
| `absuite crm contact-groups get` | Reads | `<id>` | `--columns` | Show one of the workspace's contact-groups. `GET /api/v2/CrmService/ContactGroups/{contactsGroupId}` |
| `absuite crm contact-groups create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's contact-groups. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CrmService/ContactGroups` |
| `absuite crm contact-groups update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's contact-groups: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CrmService/ContactGroups/{contactsGroupId}` |
| `absuite crm contact-groups delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's contact-groups; it asks first unless --yes. `DELETE /api/v2/CrmService/ContactGroups/{contactsGroupId}` |

### Contact Profiles (`absuite crm contact-profiles`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite crm contact-profiles list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's contact-profiles. `GET /api/v2/CrmService/ContactProfiles` |
| `absuite crm contact-profiles count` | Reads |  |  | Count the workspace's contact-profiles. `GET /api/v2/CrmService/ContactProfiles/Count` |
| `absuite crm contact-profiles get` | Reads | `<id>` | `--columns` | Show one of the workspace's contact-profiles. `GET /api/v2/CrmService/ContactProfiles/{profileId}` |
| `absuite crm contact-profiles partners list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's contact-profiles partners. `GET /api/v2/CrmService/ContactProfiles/Partners` |
| `absuite crm contact-profiles partners count` | Reads |  |  | Count the workspace's contact-profiles partners. `GET /api/v2/CrmService/ContactProfiles/Partners/Count` |
| `absuite crm contact-profiles patients count` | Reads |  |  | Count the workspace's contact-profiles patients. `GET /api/v2/CrmService/ContactProfiles/Patients/Count` |

### Contact Relation Types (`absuite crm contact-relation-types`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite crm contact-relation-types list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's contact-relation-types. `GET /api/v2/CrmService/ContactRelationTypes` |
| `absuite crm contact-relation-types count` | Reads |  |  | Count the workspace's contact-relation-types. `GET /api/v2/CrmService/ContactRelationTypes/Count` |
| `absuite crm contact-relation-types get` | Reads | `<id>` | `--columns` | Show one of the workspace's contact-relation-types. `GET /api/v2/CrmService/ContactRelationTypes/{contactRelationTypeId}` |
| `absuite crm contact-relation-types create` | Writes |  | `--name`, `--back-name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's contact-relation-types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CrmService/ContactRelationTypes` |
| `absuite crm contact-relation-types update` | Writes | `<id>` | `--name`, `--back-name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's contact-relation-types: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CrmService/ContactRelationTypes/{contactRelationTypeId}` |
| `absuite crm contact-relation-types delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's contact-relation-types; it asks first unless --yes. `DELETE /api/v2/CrmService/ContactRelationTypes/{contactRelationTypeId}` |

### Contact Relations (`absuite crm contact-relations`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite crm contact-relations list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's contact-relations. `GET /api/v2/CrmService/ContactRelations` |
| `absuite crm contact-relations count` | Reads |  |  | Count the workspace's contact-relations. `GET /api/v2/CrmService/ContactRelations/Count` |
| `absuite crm contact-relations get` | Reads | `<id>` | `--columns` | Show one of the workspace's contact-relations. `GET /api/v2/CrmService/ContactRelations/{contactRelationId}` |
| `absuite crm contact-relations create` | Writes |  | `--contact-id`, `--related-contact-id`, `--contact-relation-type-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's contact-relations. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CrmService/ContactRelations` |
| `absuite crm contact-relations update` | Writes | `<id>` | `--contact-id`, `--related-contact-id`, `--contact-relation-type-id`; `--json` `--file` `--dry-run` | Change one of the workspace's contact-relations: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CrmService/ContactRelations/{contactRelationId}` |
| `absuite crm contact-relations delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's contact-relations; it asks first unless --yes. `DELETE /api/v2/CrmService/ContactRelations/{contactRelationId}` |

### Contact Sources (`absuite crm contact-sources`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite crm contact-sources list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's contact-sources. `GET /api/v2/CrmService/ContactSources` |
| `absuite crm contact-sources count` | Reads |  |  | Count the workspace's contact-sources. `GET /api/v2/CrmService/ContactSources/Count` |
| `absuite crm contact-sources get` | Reads | `<id>` | `--columns` | Show one of the workspace's contact-sources. `GET /api/v2/CrmService/ContactSources/{contactSourceId}` |
| `absuite crm contact-sources create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's contact-sources. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CrmService/ContactSources` |
| `absuite crm contact-sources update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's contact-sources: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CrmService/ContactSources/{contactSourceId}` |
| `absuite crm contact-sources delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's contact-sources; it asks first unless --yes. `DELETE /api/v2/CrmService/ContactSources/{contactSourceId}` |

### Contacts (`absuite crm contacts`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite crm contacts list` | Reads |  | `--kind`; `--top` `--skip` | List the contacts in the workspace. |
| `absuite crm contacts count` | Reads |  |  | Count the workspace's contacts. `GET /api/v2/CrmService/Contacts/Count` |
| `absuite crm contacts get` | Reads | `<id>` |  | Show one contact. |
| `absuite crm contacts create` | Writes |  | `--type`, `--first-name`, `--last-name`, `--email`, `--tax-id`, `--primary-contact-id`, `--about`, `--country-id`, `--state-id`, `--city-id`, `--mobile-phone`, `--business-phone`, `--postal-code`, `--duns`, `--job-title`, `--web-url`, `--currency-id`, `--language-id`, `--timezone-id`, `--birthday`, `--street-line1`, `--street-line2`, `--git-hub-url`, `--twitch-url`, `--reddit-url`, `--tik-tok-url`, `--website-url`, `--twitter-url`, `--facebook-url`, `--you-tube-url`, `--linked-in-url`, `--instagram-url`, `--github-username`, `--instagram-username`, `--tik-tok-username`, `--stack-exchange-url`, `--stack-overflow-url`, `--parent-contact-id`, `--fax-number`; `--json` `--file` `--dry-run` | Create a record in the workspace's contacts. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CrmService/Contacts` |
| `absuite crm contacts update` | Writes | `<id>` | `--type`, `--birthday`, `--duns`, `--tax-id`, `--email`, `--first-name`, `--last-name`, `--primary-contact-id`, `--about`, `--mobile-phone`, `--business-phone`, `--job-title`, `--country-id`, `--parent-contact-id`, `--postal-code`, `--state-id`, `--city-id`, `--street-line1`, `--street-line2`, `--currency-id`, `--language-id`, `--timezone-id`, `--cover-url`, `--github-username`, `--instagram-username`, `--web-url`, `--twitch-url`, `--reddit-url`, `--git-hub-url`, `--tik-tok-url`, `--twitter-url`, `--you-tube-url`, `--facebook-url`, `--linked-in-url`, `--instagram-url`, `--tik-tok-username`, `--stack-exchange-url`, `--stack-overflow-url`, `--fax-number`; `--json` `--file` `--dry-run` | Change one of the workspace's contacts: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CrmService/Contacts/{contactId}` |
| `absuite crm contacts delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's contacts; it asks first unless --yes. `DELETE /api/v2/CrmService/Contacts/{contactId}` |
| `absuite crm contacts cart list` | Reads |  | `--contact-id` (required); `--columns` | List the workspace's contacts cart. `GET /api/v2/CrmService/Contacts/{contactId}/Cart` |
| `absuite crm contacts emails list` | Reads |  | `--contact-id` (required); `--top` `--skip` `--columns` | List the workspace's contacts emails. `GET /api/v2/CrmService/Contacts/{contactId}/Emails` |
| `absuite crm contacts individuals list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's contacts individuals. `GET /api/v2/CrmService/Contacts/Individuals` |
| `absuite crm contacts organizations list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's contacts organizations. `GET /api/v2/CrmService/Contacts/Organizations` |
| `absuite crm contacts profiles list` | Reads |  | `--contact-id` (required); `--top` `--skip` `--columns` | List the workspace's contacts profiles. `GET /api/v2/CrmService/Contacts/{contactId}/Profiles` |
| `absuite crm contacts social-profile list` | Reads |  | `--contact-id` (required); `--columns` | List the workspace's contacts social-profile. `GET /api/v2/CrmService/Contacts/{contactId}/SocialProfile` |
| `absuite crm contacts wallet list` | Reads |  | `--contact-id` (required); `--columns` | List the workspace's contacts wallet. `GET /api/v2/CrmService/Contacts/{contactId}/Wallet` |
| `absuite crm contacts emails count` | Reads |  | `--contact-id` (required) | Count the workspace's contacts emails. `GET /api/v2/CrmService/Contacts/{contactId}/Emails/Count` |
| `absuite crm contacts individuals count` | Reads |  |  | Count the workspace's contacts individuals. `GET /api/v2/CrmService/Contacts/Individuals/Count` |
| `absuite crm contacts organizations count` | Reads |  |  | Count the workspace's contacts organizations. `GET /api/v2/CrmService/Contacts/Organizations/Count` |
| `absuite crm contacts profiles count` | Reads |  | `--contact-id` (required) | Count the workspace's contacts profiles. `GET /api/v2/CrmService/Contacts/{contactId}/Profiles/Count` |
| `absuite crm contacts individuals get` | Reads | `<id>` | `--columns` | Show one of the workspace's contacts individuals. `GET /api/v2/CrmService/Contacts/Individuals/{contactId}` |
| `absuite crm contacts organizations get` | Reads | `<id>` | `--columns` | Show one of the workspace's contacts organizations. `GET /api/v2/CrmService/Contacts/Organizations/{contactId}` |
| `absuite crm contacts cart show` | Reads |  | `--contact-id` (required); `--columns` | Show the workspace's contacts cart. `GET /api/v2/CrmService/Contacts/{contactId}/Cart` |
| `absuite crm contacts social-profile show` | Reads |  | `--contact-id` (required); `--columns` | Show the workspace's contacts social-profile. `GET /api/v2/CrmService/Contacts/{contactId}/SocialProfile` |
| `absuite crm contacts wallet show` | Reads |  | `--contact-id` (required); `--columns` | Show the workspace's contacts wallet. `GET /api/v2/CrmService/Contacts/{contactId}/Wallet` |
| `absuite crm contacts profiles create` | Writes |  | `--contact-id` (required), `--about`, `--avatar-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Create a record in the workspace's contacts profiles. Only in --json: contact-id. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/CrmService/Contacts/{contactId}/Profiles` |
| `absuite crm contacts emails delete` | Writes | `<id>` | `--contact-id` (required); `--yes` `--dry-run` | Delete one of the workspace's contacts emails; it asks first unless --yes. `DELETE /api/v2/CrmService/Contacts/{contactId}/Emails/{emailId}` |
| `absuite crm contacts profiles delete` | Writes | `<id>` | `--contact-id` (required); `--yes` `--dry-run` | Delete one of the workspace's contacts profiles; it asks first unless --yes. `DELETE /api/v2/CrmService/Contacts/{contactId}/Profiles/{profileId}` |
| `absuite crm contacts individuals organizations list` | Reads |  | `--individual-id` (required); `--columns` | List the workspace's contacts individuals organizations. `GET /api/v2/CrmService/Contacts/Individuals/{individualId}/Organizations` |
| `absuite crm contacts organizations individuals list` | Reads |  | `--organization-id` (required); `--columns` | List the workspace's contacts organizations individuals. `GET /api/v2/CrmService/Contacts/Organizations/{organizationId}/Individuals` |
| `absuite crm contacts emails addresses create` | Writes |  | `--contact-id` (required), `--address`, `--label`, `--is-primary`; `--json` `--file` `--dry-run` | Create a record in the workspace's contacts emails addresses. Only in --json: contact-id. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CrmService/Contacts/{contactId}/Emails/Addresses` |

## Example

```bash
absuite crm contact-groups list --top 5 -o json --query "[].id"
absuite crm contact-groups create --name <value> --description <value> --dry-run   # prints the POST, sends nothing
absuite crm contact-groups create --name <value> --description <value> -o json --no-input
```

## Key Concepts

- **Contact** — a person or organization. The `Type` field is the enum
  **`Individual` | `Organization`** (a string value, not a numeric code).
- **Extended Contact** — a contact enriched with related data (profiles, wallet, etc.).
- **Contact Option** — a key-value metadata pair attached to a contact (`Key`, `Value`,
  plus `PortalId`, `Frozen`, `Autoload`, `Transient`, `Expiration`).
- **Social Profile / Profiles** — a contact's social/web profile(s).
- **Relationship Graph** — query a contact's related individuals/organizations.
- **Sync** — pull the current user, another user, or a tenant into a tenant's contact list.
