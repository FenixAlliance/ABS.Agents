---
name: absuite-emails-cli
description: >
  Manage email templates and dispatch transactional emails using the `absuite` CLI.
  Covers marketing email templates / groups / signatures / newsletters (the `marketing`
  service) and admin email sending & previewing to recipients, tenants, and users (the
  `system` service), via list/count/get/create/update/delete and send/preview commands.
  Requires an authenticated CLI session (see absuite-login-cli). For atomic PATCH updates
  or raw HTTP, use the absuite-emails (REST) skill. For broad marketing campaigns/lists,
  see absuite-marketing.
---

# Alliance Business Suite — Emails (CLI)

Manage **email templates** and **dispatch transactional emails** through the ABS platform using the `absuite` CLI.

Two CLI service tokens are involved:

- **`marketing`** — tenant-scoped CRUD for email **resources**: email templates, email groups, email signatures, newsletters (these live in `MarketingService`; the PowerShell SDK functions are under `clients/marketingService/`).
- **`system`** — admin **send & preview** of emails: a basic transactional email, an email to a tenant, an email to a user (these live in `SystemService`; the functions are under `clients/systemService/`).

> Contact-targeted email send/preview lives in `CrmService` and is out of scope here — see `absuite-crm-cli` (or the relevant CRM skill) to email a CRM contact.
>
> **No PATCH** and **no raw HTTP** in this skill — for atomic partial updates or curl, use the `absuite-emails` (REST) skill.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general CLI usage, see `absuite-cli`.
2. **Set the working tenant** — marketing email resources are tenant-scoped. Either set a default once:

   ```bash
   absuite config set --tenant-id <tenant-guid>
   ```

   …or pass `--TenantId <tenant-guid>` on each `marketing` command.

3. **Discover commands** — list and inspect any command's parameters:

   ```bash
   absuite marketing list-commands
   absuite system list-commands
   absuite marketing create email-template --help
   absuite system admin-send-basic-email --help
   ```

   Don't guess parameter names — use `--help` to read the exact DTO schema.

## Command structure

```bash
absuite <service> <verb> <entity> --Param value
```

- `<service>` is `marketing` or `system`.
- Verbs available: **list, count, search, get, create, update, delete** (+ service actions like send / preview). This CLI does **not** support patch.
- JSON DTO parameters are passed as a single-quoted JSON string (`--<Dto> '{...}'`) using the **same field names** as the REST API.

The canonical PowerShell **function-name** form also works as the command. The verbs map to PowerShell-approved verbs:

| CLI verb | Function prefix | Example |
|---|---|---|
| create | `New-…` | `absuite marketing New-EmailTemplateAsync` |
| get / list / count | `Get-…` | `absuite marketing Get-EmailTemplatesODataAsync` |
| update | `Update-…` | `absuite marketing Update-EmailTemplateAsync` |
| delete | `Invoke-Delete…` | `absuite marketing Invoke-DeleteEmailTemplateAsync` |
| send / preview | `Invoke-AdminSend… / Invoke-AdminPreview…` | `absuite system Invoke-AdminSendBasicEmail` |

## Email Templates (marketing)

All require `--TenantId` (or a configured default tenant).

```bash
# List email templates (OData)
absuite marketing get email-templates-o-data --TenantId <tenant-guid>

# Count email templates
absuite marketing count email-templates --TenantId <tenant-guid>

# Get a template by ID
absuite marketing get email-template-details --TenantId <tenant-guid> --EmailTemplateId <emailTemplate-guid>

# Create a template
absuite marketing create email-template --TenantId <tenant-guid> --EmailTemplateCreateDto '{
  "title": "Welcome Email",
  "description": "Sent to new users",
  "codeType": "Liquid",
  "code": "<h1>Welcome {{ name }}</h1>",
  "published": false
}'

# Update a template (full replace)
absuite marketing update email-template --TenantId <tenant-guid> --EmailTemplateId <emailTemplate-guid> --EmailTemplateUpdateDto '{
  "title": "Welcome Email",
  "name": "welcome-email",
  "htmlContent": "<h1>Welcome</h1>",
  "codeType": "Html5",
  "published": true
}'

# Delete a template
absuite marketing delete email-template --TenantId <tenant-guid> --EmailTemplateId <emailTemplate-guid>
```

**`EmailTemplateCreateDto` fields:** `id`, `timestamp`, `title` (**required**), `published`, `description`, `code`, `markup`, `featuredImageUrl`, `codeType` (`Razor|CSharp|CSHtml|Liquid|Html5|Markdown|Markup`), `marketingCampaignId`.

The `EmailTemplateUpdateDto` exposes the full content surface (e.g. `name`, `slug`, `excerpt`, `htmlContent`, `cSharpContent`, `razorContent`, `cssContent`, `jsContent`, SEO/social fields, the `precompiled*Size` integers, and content flags like `template`, `default`, `enable`, `published`, `allowSearchEngineIndexing`). Run `absuite marketing update email-template --help` for the complete list.

## Email Groups (marketing)

Recipient grouping. `--TenantId` required.

```bash
# List
absuite marketing get email-groups-o-data --TenantId <tenant-guid>

# Count
absuite marketing count email-groups --TenantId <tenant-guid>

# Get by ID
absuite marketing get email-group-details --TenantId <tenant-guid> --EmailgroupId <emailgroup-guid>

# Create
absuite marketing create email-group --TenantId <tenant-guid> --EmailGroupCreateDto '{
  "name": "Monthly Subscribers",
  "description": "Opted-in monthly list",
  "enabled": true
}'

# Update
absuite marketing update email-group --TenantId <tenant-guid> --EmailgroupId <emailgroup-guid> --EmailGroupUpdateDto '{
  "name": "Monthly Subscribers",
  "description": "Updated description",
  "enabled": false
}'

# Delete
absuite marketing delete email-group --TenantId <tenant-guid> --EmailgroupId <emailgroup-guid>
```

**`EmailGroupCreateDto`:** `id`, `timestamp`, `name`, `description`, `enabled`. **`EmailGroupUpdateDto`:** `name`, `description`, `enabled`.

## Email Signatures (marketing)

Same content shape as templates; create requires `title`. `--TenantId` required.

```bash
# List
absuite marketing get email-signatures-o-data --TenantId <tenant-guid>

# Count
absuite marketing count email-signatures --TenantId <tenant-guid>

# Get by ID
absuite marketing get email-signature-details --TenantId <tenant-guid> --EmailsignatureId <emailsignature-guid>

# Create
absuite marketing create email-signature --TenantId <tenant-guid> --EmailSignatureCreateDto '{
  "title": "Default Signature",
  "codeType": "Html5",
  "code": "<p>Best regards</p>",
  "published": true
}'

# Update
absuite marketing update email-signature --TenantId <tenant-guid> --EmailsignatureId <emailsignature-guid> --EmailSignatureUpdateDto '{
  "title": "Default Signature",
  "htmlContent": "<p>Best regards, The Team</p>",
  "codeType": "Html5"
}'

# Delete
absuite marketing delete email-signature --TenantId <tenant-guid> --EmailsignatureId <emailsignature-guid>
```

**`EmailSignatureCreateDto`:** `id`, `timestamp`, `title` (**required**), `published`, `description`, `code`, `markup`, `featuredImageUrl`, `codeType`. The `EmailSignatureUpdateDto` mirrors the template update surface — use `--help` for the full list.

## Newsletters (marketing)

`--TenantId` required.

```bash
# List
absuite marketing get newsletter-o-data --TenantId <tenant-guid>

# Count
absuite marketing count newsletters --TenantId <tenant-guid>

# Get by ID
absuite marketing get newsletter-details --TenantId <tenant-guid> --NewsletterId <newsletter-guid>

# Create
absuite marketing create newsletter --TenantId <tenant-guid> --NewsletterCreateDto '{
  "name": "April Newsletter",
  "title": "What is new in April",
  "code": "newsletter-april"
}'

# Update
absuite marketing update newsletter --TenantId <tenant-guid> --NewsletterId <newsletter-guid> --NewsletterUpdateDto '{
  "name": "April Newsletter",
  "title": "Updated title",
  "code": "newsletter-april"
}'

# Delete
absuite marketing delete newsletter --TenantId <tenant-guid> --NewsletterId <newsletter-guid>
```

**`NewsletterCreateDto`:** `id`, `timestamp`, `name`, `code`, `title`. **`NewsletterUpdateDto`:** `code`, `title`, `name`.

## Sending & Previewing emails (system)

> These are admin operations — restricted to global administrators (e.g. `business_owner`).

The dispatch body fields are identical across send/preview:

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | **Yes** | Subject / heading |
| `message` | string | **Yes** | Body text |
| `buttonLink` | string | No | CTA URL |
| `buttonText` | string | No | CTA label |
| `alertMessage` | string | No | Alert/banner text |
| `alertType` | enum | No | `None|Info|Error|Warning|Success|Action|Alert` (send the name) |
| `culture` | string | **Yes** | Content language (`en`, `es`, …) |
| `uiCulture` | string | **Yes** | UI-chrome language |
| `recipients` | string[] | **Yes** | Direct addresses (may be `[]` if using ID fields) |
| `contactIds` | string[] | No | ABS Contact IDs |
| `tenantIds` | string[] | No | ABS Tenant IDs |
| `userIds` | string[] | No | ABS User IDs |
| `templateUrl` | string | No | Custom template URL |
| `emailTemplateId` | string | No | Saved marketing template ID |
| `payload` | object | No | Free-form data (basic send/preview only) |

> The **basic** send/preview commands take `--ObjectEmailDispatchRequest`. The **tenant** and **user** commands take `--EmailDispatchRequest`. The fields are the same; only the parameter name differs.

### Preview a basic email (no send)

No tenant parameter.

```bash
absuite system admin-preview-basic-email-template --ObjectEmailDispatchRequest '{
  "title": "Your Weekly Report is Ready",
  "message": "Your weekly activity report has been generated.",
  "buttonText": "View Report",
  "buttonLink": "https://app.example.com/reports/weekly",
  "culture": "en",
  "uiCulture": "en",
  "recipients": ["preview@example.com"]
}'
```

### Send a basic email

```bash
absuite system admin-send-basic-email --ObjectEmailDispatchRequest '{
  "title": "Your Weekly Report is Ready",
  "message": "Your weekly activity report has been generated and is ready for review.",
  "buttonText": "View Report",
  "buttonLink": "https://app.example.com/reports/weekly",
  "alertMessage": "This report expires in 7 days.",
  "alertType": "Warning",
  "culture": "en",
  "uiCulture": "en",
  "recipients": ["recipient-a@example.com", "recipient-b@example.com"]
}'
```

### Preview a tenant email

Tenant id passed via `--TenantId`.

```bash
absuite system admin-preview-tenant-email --TenantId <tenant-guid> --EmailDispatchRequest '{
  "title": "Important Update",
  "message": "Your organization settings have been updated.",
  "culture": "en",
  "uiCulture": "en",
  "recipients": []
}'
```

### Send a tenant email

```bash
absuite system admin-send-tenant-email --TenantId <tenant-guid> --EmailDispatchRequest '{
  "title": "Important Update",
  "message": "Your organization settings have been updated.",
  "alertType": "Info",
  "culture": "en",
  "uiCulture": "en",
  "recipients": [],
  "tenantIds": ["<tenant-guid>"]
}'
```

### Preview a user email

```bash
absuite system admin-preview-user-email-template --UserId <user-guid> --EmailDispatchRequest '{
  "title": "Account Notification",
  "message": "Your account has been updated.",
  "culture": "en",
  "uiCulture": "en",
  "recipients": []
}'
```

### Send a user email

```bash
absuite system admin-send-user-email --UserId <user-guid> --EmailDispatchRequest '{
  "title": "Account Notification",
  "message": "Your account has been updated.",
  "culture": "en",
  "uiCulture": "en",
  "recipients": [],
  "userIds": ["<user-guid>"]
}'
```

## End-to-end example

Create a template, then preview and send a basic email referencing it.

```bash
# Assumes an authenticated session and a configured default tenant (or pass --TenantId)

# 1. Create the template (note the returned id)
absuite marketing create email-template --TenantId <tenant-guid> --EmailTemplateCreateDto '{
  "title": "Welcome Email",
  "codeType": "Liquid",
  "code": "<h1>Welcome {{ name }}</h1>"
}'

# 2. Preview a basic email that uses it
absuite system admin-preview-basic-email-template --ObjectEmailDispatchRequest '{
  "title": "Welcome aboard",
  "message": "Thanks for joining.",
  "culture": "en",
  "uiCulture": "en",
  "recipients": ["new-user@example.com"],
  "emailTemplateId": "<emailTemplate-guid>"
}'

# 3. Send it
absuite system admin-send-basic-email --ObjectEmailDispatchRequest '{
  "title": "Welcome aboard",
  "message": "Thanks for joining.",
  "culture": "en",
  "uiCulture": "en",
  "recipients": ["new-user@example.com"],
  "emailTemplateId": "<emailTemplate-guid>"
}'
```

## Critical Rules

- **Authenticate first** with `absuite login` (see `absuite-login-cli`).
- **`marketing` commands need a tenant** — set a default with `absuite config set --tenant-id <guid>` or pass `--TenantId <guid>`. `system` basic send/preview take no tenant; tenant/user commands pass the id via `--TenantId` / `--UserId`.
- **Basic vs tenant/user dispatch param differs:** `--ObjectEmailDispatchRequest` for basic; `--EmailDispatchRequest` for tenant/user.
- **`alertType` is an enum string** (`None|Info|Error|Warning|Success|Action|Alert`).
- **`title`, `message`, `culture`, `uiCulture`, `recipients` are required** on dispatch bodies (`recipients` may be `[]` when targeting only id fields).
- **Send/preview are admin operations** (global-administrator role).
- **Use `--help`** on any command to confirm parameter and DTO field names — don't guess.
- **No patch here.** For atomic partial updates (JSON Patch), use the `absuite-emails` REST skill.
- **For broad marketing campaigns/lists** (campaigns, lists, leads, social posts), use `absuite-marketing`.
- **Never hard-code real GUIDs, emails, names, or tokens.** Resolve them dynamically.

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List email templates | `absuite marketing get email-templates-o-data --TenantId <guid>` |
| Count email templates | `absuite marketing count email-templates --TenantId <guid>` |
| Get email template | `absuite marketing get email-template-details --TenantId <guid> --EmailTemplateId <guid>` |
| Create email template | `absuite marketing create email-template --TenantId <guid> --EmailTemplateCreateDto '{...}'` |
| Update email template | `absuite marketing update email-template --TenantId <guid> --EmailTemplateId <guid> --EmailTemplateUpdateDto '{...}'` |
| Delete email template | `absuite marketing delete email-template --TenantId <guid> --EmailTemplateId <guid>` |
| List email groups | `absuite marketing get email-groups-o-data --TenantId <guid>` |
| Count email groups | `absuite marketing count email-groups --TenantId <guid>` |
| Get email group | `absuite marketing get email-group-details --TenantId <guid> --EmailgroupId <guid>` |
| Create email group | `absuite marketing create email-group --TenantId <guid> --EmailGroupCreateDto '{...}'` |
| Update email group | `absuite marketing update email-group --TenantId <guid> --EmailgroupId <guid> --EmailGroupUpdateDto '{...}'` |
| Delete email group | `absuite marketing delete email-group --TenantId <guid> --EmailgroupId <guid>` |
| List email signatures | `absuite marketing get email-signatures-o-data --TenantId <guid>` |
| Count email signatures | `absuite marketing count email-signatures --TenantId <guid>` |
| Get email signature | `absuite marketing get email-signature-details --TenantId <guid> --EmailsignatureId <guid>` |
| Create email signature | `absuite marketing create email-signature --TenantId <guid> --EmailSignatureCreateDto '{...}'` |
| Update email signature | `absuite marketing update email-signature --TenantId <guid> --EmailsignatureId <guid> --EmailSignatureUpdateDto '{...}'` |
| Delete email signature | `absuite marketing delete email-signature --TenantId <guid> --EmailsignatureId <guid>` |
| List newsletters | `absuite marketing get newsletter-o-data --TenantId <guid>` |
| Count newsletters | `absuite marketing count newsletters --TenantId <guid>` |
| Get newsletter | `absuite marketing get newsletter-details --TenantId <guid> --NewsletterId <guid>` |
| Create newsletter | `absuite marketing create newsletter --TenantId <guid> --NewsletterCreateDto '{...}'` |
| Update newsletter | `absuite marketing update newsletter --TenantId <guid> --NewsletterId <guid> --NewsletterUpdateDto '{...}'` |
| Delete newsletter | `absuite marketing delete newsletter --TenantId <guid> --NewsletterId <guid>` |
| Preview basic email | `absuite system admin-preview-basic-email-template --ObjectEmailDispatchRequest '{...}'` |
| Send basic email | `absuite system admin-send-basic-email --ObjectEmailDispatchRequest '{...}'` |
| Preview tenant email | `absuite system admin-preview-tenant-email --TenantId <guid> --EmailDispatchRequest '{...}'` |
| Send tenant email | `absuite system admin-send-tenant-email --TenantId <guid> --EmailDispatchRequest '{...}'` |
| Preview user email | `absuite system admin-preview-user-email-template --UserId <guid> --EmailDispatchRequest '{...}'` |
| Send user email | `absuite system admin-send-user-email --UserId <guid> --EmailDispatchRequest '{...}'` |
