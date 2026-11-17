---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-support-cli
key: fenixalliance.absuite.support-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Support area with the absuite CLI: 82 commands (48 read, 34
  write) under `absuite support`, each generated from the platform's ServiceClients and checked
  against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-support REST
  skill.
---

# Alliance Business Suite — Support Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-support` REST skill documents 31 routes; 1 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-support` REST skill.

## Commands

82 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Inquiry Requests (`absuite support inquiry-requests`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support inquiry-requests list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's inquiry-requests. `GET /api/v2/SupportService/InquiryRequests` |
| `absuite support inquiry-requests count` | Reads |  |  | Count the workspace's inquiry-requests. `GET /api/v2/SupportService/InquiryRequests/Count` |
| `absuite support inquiry-requests get` | Reads | `<id>` | `--columns` | Show one of the workspace's inquiry-requests. `GET /api/v2/SupportService/InquiryRequests/{inquiryRequestId}` |
| `absuite support inquiry-requests create` | Writes |  | `--name`, `--last-name`, `--email`, `--organization-name`, `--job-role`, `--organization-domain`, `--country-id`, `--phone`, `--message`, `--social-profile-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's inquiry-requests. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/SupportService/InquiryRequests` |
| `absuite support inquiry-requests update` | Writes | `<id>` | `--name`, `--last-name`, `--email`, `--organization-name`, `--job-role`, `--organization-domain`, `--country-id`, `--phone`, `--message`, `--social-profile-id`; `--json` `--file` `--dry-run` | Change one of the workspace's inquiry-requests: reads it, applies --json/--file and the field flags, then saves it. Never set here: type (not settable: discriminator (TPH rule)). `PUT /api/v2/SupportService/InquiryRequests/{inquiryRequestId}` |
| `absuite support inquiry-requests delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's inquiry-requests; it asks first unless --yes. `DELETE /api/v2/SupportService/InquiryRequests/{inquiryRequestId}` |

### Knowledge Articles (`absuite support knowledge-articles`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support knowledge-articles list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's knowledge-articles. `GET /api/v2/SupportService/KnowledgeArticles` |
| `absuite support knowledge-articles count` | Reads |  |  | Count the workspace's knowledge-articles. `GET /api/v2/SupportService/KnowledgeArticles/Count` |
| `absuite support knowledge-articles get` | Reads | `<id>` | `--columns` | Show one of the workspace's knowledge-articles. `GET /api/v2/SupportService/KnowledgeArticles/{knowledgeArticleId}` |
| `absuite support knowledge-articles delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's knowledge-articles; it asks first unless --yes. `DELETE /api/v2/SupportService/KnowledgeArticles/{knowledgeArticleId}` |

### Maintenance Visits (`absuite support maintenance-visits`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support maintenance-visits list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's maintenance-visits. `GET /api/v2/SupportService/MaintenanceVisits` |
| `absuite support maintenance-visits count` | Reads |  |  | Count the workspace's maintenance-visits. `GET /api/v2/SupportService/MaintenanceVisits/Count` |
| `absuite support maintenance-visits get` | Reads | `<id>` | `--columns` | Show one of the workspace's maintenance-visits. `GET /api/v2/SupportService/MaintenanceVisits/{maintenanceVisitId}` |
| `absuite support maintenance-visits create` | Writes |  | `--json` `--file` `--dry-run` | Create a record in the workspace's maintenance-visits. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SupportService/MaintenanceVisits` |
| `absuite support maintenance-visits update` | Writes | `<id>` | `--json` `--file` `--dry-run` | Change one of the workspace's maintenance-visits: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/SupportService/MaintenanceVisits/{maintenanceVisitId}` |
| `absuite support maintenance-visits delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's maintenance-visits; it asks first unless --yes. `DELETE /api/v2/SupportService/MaintenanceVisits/{maintenanceVisitId}` |

### Refund Policies (`absuite support refund-policies`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support refund-policies list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's refund-policies. `GET /api/v2/SupportService/RefundPolicies` |
| `absuite support refund-policies count` | Reads |  |  | Count the workspace's refund-policies. `GET /api/v2/SupportService/RefundPolicies/Count` |
| `absuite support refund-policies get` | Reads | `<id>` | `--columns` | Show one of the workspace's refund-policies. `GET /api/v2/SupportService/RefundPolicies/{refundPolicyId}` |

### Refund Requests (`absuite support refund-requests`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support refund-requests list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's refund-requests. `GET /api/v2/SupportService/RefundRequests` |
| `absuite support refund-requests count` | Reads |  |  | Count the workspace's refund-requests. `GET /api/v2/SupportService/RefundRequests/Count` |
| `absuite support refund-requests get` | Reads | `<id>` | `--columns` | Show one of the workspace's refund-requests. `GET /api/v2/SupportService/RefundRequests/{refundRequestId}` |

### Return Policies (`absuite support return-policies`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support return-policies list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's return-policies. `GET /api/v2/SupportService/ReturnPolicies` |
| `absuite support return-policies count` | Reads |  |  | Count the workspace's return-policies. `GET /api/v2/SupportService/ReturnPolicies/Count` |
| `absuite support return-policies get` | Reads | `<id>` | `--columns` | Show one of the workspace's return-policies. `GET /api/v2/SupportService/ReturnPolicies/{returnPolicyId}` |
| `absuite support return-policies create` | Writes |  | `--title`, `--description`, `--shipping-courier-id`, `--is-free`, `--reduce`, `--is-enabled`, `--is-default`, `--allow-international`, `--hours`, `--days`, `--weeks`, `--months`, `--years`, `--value`, `--percentage`, `--currency-id`, `--country-id`, `--country-state-id`, `--custom-state`, `--custom-city`, `--city-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's return-policies. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SupportService/ReturnPolicies` |
| `absuite support return-policies update` | Writes | `<id>` | `--title`, `--description`, `--shipping-courier-id`, `--is-free`, `--reduce`, `--is-enabled`, `--is-default`, `--allow-international`, `--hours`, `--days`, `--weeks`, `--months`, `--years`, `--value`, `--percentage`, `--currency-id`, `--country-id`, `--country-state-id`, `--custom-state`, `--custom-city`, `--city-id`; `--json` `--file` `--dry-run` | Change one of the workspace's return-policies: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/SupportService/ReturnPolicies/{returnPolicyId}` |
| `absuite support return-policies delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's return-policies; it asks first unless --yes. `DELETE /api/v2/SupportService/ReturnPolicies/{returnPolicyId}` |

### Return Requests (`absuite support return-requests`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support return-requests list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's return-requests. `GET /api/v2/SupportService/ReturnRequests` |
| `absuite support return-requests count` | Reads |  |  | Count the workspace's return-requests. `GET /api/v2/SupportService/ReturnRequests/Count` |
| `absuite support return-requests get` | Reads | `<id>` | `--columns` | Show one of the workspace's return-requests. `GET /api/v2/SupportService/ReturnRequests/{returnRequestId}` |
| `absuite support return-requests create` | Writes |  | `--title`, `--description`, `--approved`, `--approved-timestamp`, `--support-entitlement-id`, `--contact-id`, `--return-policy-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's return-requests. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SupportService/ReturnRequests` |
| `absuite support return-requests update` | Writes | `<id>` | `--title`, `--description`, `--approved`, `--approved-timestamp`, `--support-entitlement-id`, `--return-policy-id`; `--json` `--file` `--dry-run` | Change one of the workspace's return-requests: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/SupportService/ReturnRequests/{returnRequestId}` |
| `absuite support return-requests delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's return-requests; it asks first unless --yes. `DELETE /api/v2/SupportService/ReturnRequests/{returnRequestId}` |

### Support Entitlements (`absuite support support-entitlements`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support support-entitlements list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's support-entitlements. `GET /api/v2/SupportService/SupportEntitlements` |
| `absuite support support-entitlements count` | Reads |  |  | Count the workspace's support-entitlements. `GET /api/v2/SupportService/SupportEntitlements/Count` |
| `absuite support support-entitlements get` | Reads | `<id>` | `--columns` | Show one of the workspace's support-entitlements. `GET /api/v2/SupportService/SupportEntitlements/{supportEntitlementId}` |
| `absuite support support-entitlements delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's support-entitlements; it asks first unless --yes. `DELETE /api/v2/SupportService/SupportEntitlements/{supportEntitlementId}` |

### Support Request Attachments (`absuite support support-request-attachments`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support support-request-attachments list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's support-request-attachments. `GET /api/v2/SupportService/SupportRequestAttachments` |
| `absuite support support-request-attachments count` | Reads |  |  | Count the workspace's support-request-attachments. `GET /api/v2/SupportService/SupportRequestAttachments/Count` |
| `absuite support support-request-attachments get` | Reads | `<id>` | `--columns` | Show one of the workspace's support-request-attachments. `GET /api/v2/SupportService/SupportRequestAttachments/{supportRequestAttachmentId}` |
| `absuite support support-request-attachments delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's support-request-attachments; it asks first unless --yes. `DELETE /api/v2/SupportService/SupportRequestAttachments/{supportRequestAttachmentId}` |

### Support Requests (`absuite support support-requests`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support support-requests list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's support-requests. `GET /api/v2/SupportService/SupportRequests` |
| `absuite support support-requests count` | Reads |  |  | Count the workspace's support-requests. `GET /api/v2/SupportService/SupportRequests/Count` |
| `absuite support support-requests get` | Reads | `<id>` | `--columns` | Show one of the workspace's support-requests. `GET /api/v2/SupportService/SupportRequests/{supportRequestId}` |
| `absuite support support-requests create` | Writes |  | `--title`, `--description`, `--approved`, `--approved-timestamp`, `--support-entitlement-id`, `--contact-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's support-requests. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SupportService/SupportRequests` |
| `absuite support support-requests update` | Writes | `<id>` | `--title`, `--description`, `--approved`, `--approved-timestamp`, `--support-entitlement-id`; `--json` `--file` `--dry-run` | Change one of the workspace's support-requests: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/SupportService/SupportRequests/{supportRequestId}` |
| `absuite support support-requests delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's support-requests; it asks first unless --yes. `DELETE /api/v2/SupportService/SupportRequests/{supportRequestId}` |

### Support Ticket Priorities (`absuite support support-ticket-priorities`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support support-ticket-priorities list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's support-ticket-priorities. `GET /api/v2/SupportService/SupportTicketPriorities` |
| `absuite support support-ticket-priorities count` | Reads |  |  | Count the workspace's support-ticket-priorities. `GET /api/v2/SupportService/SupportTicketPriorities/Count` |
| `absuite support support-ticket-priorities get` | Reads | `<id>` | `--columns` | Show one of the workspace's support-ticket-priorities. `GET /api/v2/SupportService/SupportTicketPriorities/{supportTicketPriorityId}` |
| `absuite support support-ticket-priorities create` | Writes |  | `--title`, `--description`, `--support-entitlement-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's support-ticket-priorities. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SupportService/SupportTicketPriorities` |
| `absuite support support-ticket-priorities update` | Writes | `<id>` | `--title`, `--description`, `--support-entitlement-id`; `--json` `--file` `--dry-run` | Change one of the workspace's support-ticket-priorities: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/SupportService/SupportTicketPriorities/{supportTicketPriorityId}` |
| `absuite support support-ticket-priorities delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's support-ticket-priorities; it asks first unless --yes. `DELETE /api/v2/SupportService/SupportTicketPriorities/{supportTicketPriorityId}` |

### Support Ticket Types (`absuite support support-ticket-types`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support support-ticket-types list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's support-ticket-types. `GET /api/v2/SupportService/SupportTicketTypes` |
| `absuite support support-ticket-types count` | Reads |  |  | Count the workspace's support-ticket-types. `GET /api/v2/SupportService/SupportTicketTypes/Count` |
| `absuite support support-ticket-types get` | Reads | `<id>` | `--columns` | Show one of the workspace's support-ticket-types. `GET /api/v2/SupportService/SupportTicketTypes/{supportTicketTypeId}` |
| `absuite support support-ticket-types create` | Writes |  | `--title`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's support-ticket-types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SupportService/SupportTicketTypes` |
| `absuite support support-ticket-types update` | Writes | `<id>` | `--title`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's support-ticket-types: reads it, applies --json/--file and the field flags, then saves it. Never set here: id (set by the server); timestamp (set by the server). `PUT /api/v2/SupportService/SupportTicketTypes/{supportTicketTypeId}` |
| `absuite support support-ticket-types delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's support-ticket-types; it asks first unless --yes. `DELETE /api/v2/SupportService/SupportTicketTypes/{supportTicketTypeId}` |

### Support Tickets (`absuite support support-tickets`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support support-tickets list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's support-tickets. `GET /api/v2/SupportService/SupportTickets` |
| `absuite support support-tickets count` | Reads |  |  | Count the workspace's support-tickets. `GET /api/v2/SupportService/SupportTickets/Count` |
| `absuite support support-tickets get` | Reads | `<id>` | `--columns` | Show one of the workspace's support-tickets. `GET /api/v2/SupportService/SupportTickets/{supportTicketId}` |
| `absuite support support-tickets create` | Writes |  | `--title`, `--description`, `--support-ticket-status`, `--contact-id`, `--support-ticket-type-id`, `--support-entitlement-id`, `--support-priority-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's support-tickets. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SupportService/SupportTickets` |
| `absuite support support-tickets update` | Writes | `<id>` | `--title`, `--description`, `--support-ticket-status`, `--contact-id`, `--support-ticket-type-id`, `--support-entitlement-id`, `--support-priority-id`; `--json` `--file` `--dry-run` | Change one of the workspace's support-tickets: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/SupportService/SupportTickets/{supportTicketId}` |
| `absuite support support-tickets delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's support-tickets; it asks first unless --yes. `DELETE /api/v2/SupportService/SupportTickets/{supportTicketId}` |
| `absuite support support-tickets conversations list` | Reads |  | `--support-ticket-id` (required); `--top` `--skip` `--columns` | List the workspace's support-tickets conversations. `GET /api/v2/SupportService/SupportTickets/{supportTicketId}/Conversations` |
| `absuite support support-tickets conversations get` | Reads | `<id>` | `--support-ticket-id` (required); `--columns` | Show one of the workspace's support-tickets conversations. `GET /api/v2/SupportService/SupportTickets/{supportTicketId}/Conversations/{supportTicketConversationId}` |
| `absuite support support-tickets conversations messages list` | Reads |  | `--support-ticket-id` (required), `--support-ticket-conversation-id` (required); `--columns` | List the workspace's support-tickets conversations messages. `GET /api/v2/SupportService/SupportTickets/{supportTicketId}/Conversations/{supportTicketConversationId}/Messages` |
| `absuite support support-tickets conversations messages create` | Writes |  | `--support-ticket-id` (required), `--support-ticket-conversation-id` (required), `--title`, `--message`, `--conversation-id`, `--sender-social-profile-id`, `--receiver-social-profile-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's support-tickets conversations messages. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SupportService/SupportTickets/{supportTicketId}/Conversations/{supportTicketConversationId}/Messages` |

### Warranty Policies (`absuite support warranty-policies`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support warranty-policies list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's warranty-policies. `GET /api/v2/SupportService/WarrantyPolicies` |
| `absuite support warranty-policies count` | Reads |  |  | Count the workspace's warranty-policies. `GET /api/v2/SupportService/WarrantyPolicies/Count` |
| `absuite support warranty-policies get` | Reads | `<id>` | `--columns` | Show one of the workspace's warranty-policies. `GET /api/v2/SupportService/WarrantyPolicies/{warrantyPolicyId}` |
| `absuite support warranty-policies create` | Writes |  | `--title`, `--description`, `--is-extended-warranty`, `--is-free`, `--reduce`, `--is-enabled`, `--is-default`, `--allow-international`, `--hours`, `--days`, `--weeks`, `--months`, `--years`, `--value`, `--percentage`, `--currency-id`, `--country-id`, `--country-state-id`, `--custom-state`, `--custom-city`, `--city-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's warranty-policies. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SupportService/WarrantyPolicies` |
| `absuite support warranty-policies update` | Writes | `<id>` | `--title`, `--description`, `--is-extended-warranty`, `--is-free`, `--reduce`, `--is-enabled`, `--is-default`, `--allow-international`, `--hours`, `--days`, `--weeks`, `--months`, `--years`, `--value`, `--percentage`, `--currency-id`, `--country-id`, `--country-state-id`, `--custom-state`, `--custom-city`, `--city-id`; `--json` `--file` `--dry-run` | Change one of the workspace's warranty-policies: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/SupportService/WarrantyPolicies/{warrantyPolicyId}` |
| `absuite support warranty-policies delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's warranty-policies; it asks first unless --yes. `DELETE /api/v2/SupportService/WarrantyPolicies/{warrantyPolicyId}` |

### Warranty Requests (`absuite support warranty-requests`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite support warranty-requests list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's warranty-requests. `GET /api/v2/SupportService/WarrantyRequests` |
| `absuite support warranty-requests count` | Reads |  |  | Count the workspace's warranty-requests. `GET /api/v2/SupportService/WarrantyRequests/Count` |
| `absuite support warranty-requests get` | Reads | `<id>` | `--columns` | Show one of the workspace's warranty-requests. `GET /api/v2/SupportService/WarrantyRequests/{warrantyRequestId}` |
| `absuite support warranty-requests create` | Writes |  | `--title`, `--description`, `--approved`, `--approved-timestamp`, `--support-entitlement-id`, `--contact-id`, `--warranty-policy-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's warranty-requests. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SupportService/WarrantyRequests` |
| `absuite support warranty-requests update` | Writes | `<id>` | `--title`, `--description`, `--approved`, `--approved-timestamp`, `--support-entitlement-id`, `--warranty-policy-id`; `--json` `--file` `--dry-run` | Change one of the workspace's warranty-requests: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/SupportService/WarrantyRequests/{warrantyRequestId}` |
| `absuite support warranty-requests delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's warranty-requests; it asks first unless --yes. `DELETE /api/v2/SupportService/WarrantyRequests/{warrantyRequestId}` |

## Example

```bash
absuite support inquiry-requests list --top 5 -o json --query "[].id"
absuite support inquiry-requests create --name <value> --last-name <value> --dry-run   # prints the POST, sends nothing
absuite support inquiry-requests create --name <value> --last-name <value> -o json --no-input
```
