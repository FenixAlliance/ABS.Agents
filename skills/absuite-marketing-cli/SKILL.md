---
name: absuite-marketing-cli
key: fenixalliance.absuite.marketing-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Marketing area with the absuite CLI: 56 commands (30 read,
  26 write) under `absuite marketing`, each generated from the platform's ServiceClients and checked
  against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-marketing
  REST skill.
---

# Alliance Business Suite — Marketing Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-marketing` REST skill documents 33 routes; 3 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-marketing` REST skill.

## Commands

56 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

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

### Marketing Areas (`absuite marketing marketing-areas`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite marketing marketing-areas list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's marketing-areas. `GET /api/v2/MarketingService/MarketingAreas` |
| `absuite marketing marketing-areas count` | Reads |  |  | Count the workspace's marketing-areas. `GET /api/v2/MarketingService/MarketingAreas/Count` |
| `absuite marketing marketing-areas get` | Reads | `<id>` | `--columns` | Show one of the workspace's marketing-areas. `GET /api/v2/MarketingService/MarketingAreas/{marketingAreaId}` |
| `absuite marketing marketing-areas create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's marketing-areas. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/MarketingService/MarketingAreas` |
| `absuite marketing marketing-areas update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's marketing-areas: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/MarketingService/MarketingAreas/{marketingAreaId}` |
| `absuite marketing marketing-areas delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's marketing-areas; it asks first unless --yes. `DELETE /api/v2/MarketingService/MarketingAreas/{marketingAreaId}` |

### Marketing Campaigns (`absuite marketing marketing-campaigns`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite marketing marketing-campaigns list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's marketing-campaigns. `GET /api/v2/MarketingService/MarketingCampaigns` |
| `absuite marketing marketing-campaigns count` | Reads |  |  | Count the workspace's marketing-campaigns. `GET /api/v2/MarketingService/MarketingCampaigns/Count` |
| `absuite marketing marketing-campaigns get` | Reads | `<id>` | `--columns` | Show one of the workspace's marketing-campaigns. `GET /api/v2/MarketingService/MarketingCampaigns/{marketingcampaignId}` |
| `absuite marketing marketing-campaigns create` | Writes |  | `--name`, `--offer`, `--active`, `--proposed-start`, `--proposed-end`, `--actual-start`, `--actual-end`, `--code`, `--allocated-budget`, `--activity-cost`, `--misc-cost`, `--expected-response-percent`, `--marketing-area-id`, `--currency-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's marketing-campaigns. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/MarketingService/MarketingCampaigns` |
| `absuite marketing marketing-campaigns update` | Writes | `<id>` | `--name`, `--offer`, `--active`, `--proposed-start`, `--proposed-end`, `--actual-start`, `--actual-end`, `--code`, `--allocated-budget`, `--activity-cost`, `--misc-cost`, `--expected-response-percent`, `--marketing-area-id`, `--currency-id`; `--json` `--file` `--dry-run` | Change one of the workspace's marketing-campaigns: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/MarketingService/MarketingCampaigns/{marketingcampaignId}` |
| `absuite marketing marketing-campaigns delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's marketing-campaigns; it asks first unless --yes. `DELETE /api/v2/MarketingService/MarketingCampaigns/{marketingcampaignId}` |

### Marketing Leads (`absuite marketing marketing-leads`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite marketing marketing-leads list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's marketing-leads. `GET /api/v2/MarketingService/MarketingLeads` |
| `absuite marketing marketing-leads count` | Reads |  |  | Count the workspace's marketing-leads. `GET /api/v2/MarketingService/MarketingLeads/Count` |
| `absuite marketing marketing-leads get` | Reads | `<id>` | `--columns` | Show one of the workspace's marketing-leads. `GET /api/v2/MarketingService/MarketingLeads/{marketingLeadId}` |
| `absuite marketing marketing-leads create` | Writes |  | `--first-name`, `--last-name`, `--email`, `--phone`, `--company`, `--job-title`, `--source`, `--notes`, `--score`; `--json` `--file` `--dry-run` | Create a record in the workspace's marketing-leads. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/MarketingService/MarketingLeads` |
| `absuite marketing marketing-leads update` | Writes | `<id>` | `--first-name`, `--last-name`, `--email`, `--phone`, `--company`, `--job-title`, `--source`, `--status`, `--notes`, `--score`; `--json` `--file` `--dry-run` | Change one of the workspace's marketing-leads: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/MarketingService/MarketingLeads/{marketingLeadId}` |
| `absuite marketing marketing-leads delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's marketing-leads; it asks first unless --yes. `DELETE /api/v2/MarketingService/MarketingLeads/{marketingLeadId}` |

### Marketing Lists (`absuite marketing marketing-lists`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite marketing marketing-lists list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's marketing-lists. `GET /api/v2/MarketingService/MarketingLists` |
| `absuite marketing marketing-lists count` | Reads |  |  | Count the workspace's marketing-lists. `GET /api/v2/MarketingService/MarketingLists/Count` |
| `absuite marketing marketing-lists get` | Reads | `<id>` | `--columns` | Show one of the workspace's marketing-lists. `GET /api/v2/MarketingService/MarketingLists/{marketingListId}` |
| `absuite marketing marketing-lists create` | Writes |  | `--locked`, `--name`, `--purpose`, `--description`, `--source`, `--cost`, `--modified-on`, `--last-used-on`, `--currency-id`, `--marketing-list-type`, `--marketing-list-target`; `--json` `--file` `--dry-run` | Create a record in the workspace's marketing-lists. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/MarketingService/MarketingLists` |
| `absuite marketing marketing-lists update` | Writes | `<id>` | `--locked`, `--name`, `--purpose`, `--description`, `--source`, `--cost`, `--modified-on`, `--last-used-on`, `--currency-id`, `--marketing-list-type`, `--marketing-list-target`; `--json` `--file` `--dry-run` | Change one of the workspace's marketing-lists: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/MarketingService/MarketingLists/{marketingListId}` |
| `absuite marketing marketing-lists delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's marketing-lists; it asks first unless --yes. `DELETE /api/v2/MarketingService/MarketingLists/{marketingListId}` |

### Newsletters (`absuite marketing newsletters`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite marketing newsletters list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's newsletters. `GET /api/v2/MarketingService/Newsletters` |
| `absuite marketing newsletters count` | Reads |  |  | Count the workspace's newsletters. `GET /api/v2/MarketingService/Newsletters/Count` |
| `absuite marketing newsletters get` | Reads | `<id>` | `--columns` | Show one of the workspace's newsletters. `GET /api/v2/MarketingService/Newsletters/{newsletterId}` |
| `absuite marketing newsletters create` | Writes |  | `--name`, `--code`, `--title`; `--json` `--file` `--dry-run` | Create a record in the workspace's newsletters. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/MarketingService/Newsletters` |
| `absuite marketing newsletters update` | Writes | `<id>` | `--code`, `--title`, `--name`; `--json` `--file` `--dry-run` | Change one of the workspace's newsletters: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/MarketingService/Newsletters/{newsletterId}` |
| `absuite marketing newsletters delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's newsletters; it asks first unless --yes. `DELETE /api/v2/MarketingService/Newsletters/{newsletterId}` |

### Social Media Posts (`absuite marketing social-media-posts`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite marketing social-media-posts list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's social-media-posts. `GET /api/v2/MarketingService/SocialMediaPosts` |
| `absuite marketing social-media-posts count` | Reads |  |  | Count the workspace's social-media-posts. `GET /api/v2/MarketingService/SocialMediaPosts/Count` |
| `absuite marketing social-media-posts get` | Reads | `<id>` | `--columns` | Show one of the workspace's social-media-posts. `GET /api/v2/MarketingService/SocialMediaPosts/{socialMediaPostId}` |
| `absuite marketing social-media-posts create` | Writes |  | `--title`, `--content`, `--featured-image-url`, `--social-post-bucket-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's social-media-posts. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/MarketingService/SocialMediaPosts` |
| `absuite marketing social-media-posts update` | Writes | `<id>` | `--title`, `--content`, `--featured-image-url`, `--social-post-bucket-id`; `--json` `--file` `--dry-run` | Change one of the workspace's social-media-posts: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/MarketingService/SocialMediaPosts/{socialMediaPostId}` |
| `absuite marketing social-media-posts delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's social-media-posts; it asks first unless --yes. `DELETE /api/v2/MarketingService/SocialMediaPosts/{socialMediaPostId}` |

### Social Post Buckets (`absuite marketing social-post-buckets`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite marketing social-post-buckets list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's social-post-buckets. `GET /api/v2/MarketingService/SocialPostBuckets` |
| `absuite marketing social-post-buckets count` | Reads |  |  | Count the workspace's social-post-buckets. `GET /api/v2/MarketingService/SocialPostBuckets/Count` |
| `absuite marketing social-post-buckets get` | Reads | `<id>` | `--columns` | Show one of the workspace's social-post-buckets. `GET /api/v2/MarketingService/SocialPostBuckets/{socialPostBucketId}` |
| `absuite marketing social-post-buckets create` | Writes |  | `--name`; `--json` `--file` `--dry-run` | Create a record in the workspace's social-post-buckets. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/MarketingService/SocialPostBuckets` |
| `absuite marketing social-post-buckets update` | Writes | `<id>` | `--name`; `--json` `--file` `--dry-run` | Change one of the workspace's social-post-buckets: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/MarketingService/SocialPostBuckets/{socialPostBucketId}` |
| `absuite marketing social-post-buckets delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's social-post-buckets; it asks first unless --yes. `DELETE /api/v2/MarketingService/SocialPostBuckets/{socialPostBucketId}` |

## Example

```bash
absuite marketing email-groups list --top 5 -o json --query "[].id"
absuite marketing email-groups create --name <value> --description <value> --dry-run   # prints the POST, sends nothing
absuite marketing email-groups create --name <value> --description <value> -o json --no-input
```

## Key Concepts & Enumerations

- **`MarketingListType`** — `Static` | `Dynamic`.
- **`MarketingListTarget`** — `Individual` | `Organization` | `Lead`.
- **`CodeType`** (email signatures & templates) — `Razor` | `CSharp` | `CSHtml` |
  `Liquid` | `Html5` | `Markdown` | `Markup`.
- DTO field names are PascalCase (e.g. `Name`, `Title`, `CurrencyId`, `MarketingAreaId`).
