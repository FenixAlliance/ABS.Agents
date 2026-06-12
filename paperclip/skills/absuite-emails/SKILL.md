---
name: absuite-emails
description: >
  Manage email templates and dispatch transactional emails via the Alliance Business Suite
  (ABS) REST API. Covers marketing email templates / groups / signatures / newsletters
  (MarketingService), and admin email sending & previewing to recipients, tenants, and users
  (SystemService) — including atomic PATCH (JSON Patch) updates of email resources. All
  operations are tenant-scoped (per endpoint) and require a bearer token (see the
  absuite-login skill to authenticate). For the CLI equivalent, see `absuite-emails-cli`;
  for raw HTTP helpers see `absuite-rest`; for broad marketing campaigns/lists see
  `absuite-marketing`.
---

# Alliance Business Suite — Emails (REST)

Manage **email templates** (the reusable content/markup that drives branded mail) and **dispatch transactional emails** (basic, tenant, and user) through the ABS platform over the REST API.

This skill spans two services:

- **MarketingService** — CRUD + PATCH for tenant-scoped email **resources**: `EmailTemplates`, `EmailGroups`, `EmailSignatures`, `Newsletters`.
- **SystemService** — admin **sending & previewing** of emails: a basic transactional email (`/Emails/SendBasic`, `/Emails/Preview`), an email to a tenant (`/Tenants/{tenantId}/Emails/Send|Preview`), and an email to a user (`/Users/{userId}/Emails/Send|Preview`).

> Contact-targeted email send/preview lives in **CrmService**, which is out of scope here — see the `absuite-crm` skill if you need to email a CRM contact directly.

## Authentication

1. **Obtain a bearer token:**

```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<user-email>", "password": "<user-password>"}'
```

Extract `accessToken` from the JSON response and export it:

```bash
export ABSUITE_ACCESS_TOKEN="<accessToken-from-response>"
```

2. **Send the token on every request:**

```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/<ServiceName>/<Resource>` — here `<ServiceName>` is `MarketingService` or `SystemService`.

4. **Response envelope** — every call returns:

```json
{ "isSuccess": true, "errorMessage": null, "correlationId": "...", "timestamp": "...", "result": <data|array|int|null> }
```

Always check `isSuccess`; read the payload from `result`.

## Tenant scoping (read carefully — it differs per endpoint)

The platform binds the tenant from the `?tenantId=` **query param** OR the `X-TenantId` **request header** interchangeably.

- **MarketingService** email resources (`EmailTemplates`, `EmailGroups`, `EmailSignatures`, `Newsletters`): **`tenantId` is REQUIRED** on every verb (GET/POST/PUT/PATCH/DELETE). Pass `?tenantId=<tenant-guid>` (or header `X-TenantId: <tenant-guid>`).
- **SystemService** sending/previewing:
  - `/Emails/SendBasic` and `/Emails/Preview` take **no `tenantId`** parameter — do not add one.
  - `/Tenants/{tenantId}/Emails/Send|Preview` carries the tenant in the **path** (`{tenantId}`), not the query.
  - `/Users/{userId}/Emails/Send|Preview` carries the **user** in the path; no `tenantId`.

> An optional API version selector exists on all of these: `?api-version=<v>` (query) or `x-api-version: <v>` (header). Omit unless you need a specific version.

## Key Concepts

### Email template content model (MarketingService)

An **EmailTemplate** is a content aggregate (it shares the rich content/SEO shape used across the platform's content engine). On **create** (`EmailTemplateCreateDto`) the meaningful fields are a small set; on **update** (`EmailTemplateUpdateDto`) the full content surface is writable.

`EmailTemplateCreateDto` fields (POST body):

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | No | Server-assigned if omitted |
| `timestamp` | string | No | |
| `title` | string | **Yes** | Template title |
| `published` | boolean | No | |
| `description` | string | No | |
| `code` | string | No | Source/markup code |
| `markup` | string | No | |
| `featuredImageUrl` | string | No | |
| `codeType` | enum | No | `Razor` \| `CSharp` \| `CSHtml` \| `Liquid` \| `Html5` \| `Markdown` \| `Markup` |
| `marketingCampaignId` | string | No | Links the template to a campaign |

`EmailTemplateUpdateDto` (PUT body) additionally exposes the full content surface, including: `order`, `slug`, `name`, `excerpt`, `password`, `highlightImage`, `canonicalUrl`, `seoTitle`, `seoKeyWords`, `seoKeyPhrases`, `metaDescription`, `twitterImage/Title/Description`, `facebookImage/Title/Description`, `content`, `code`, `namespace`, `typeName`, `generatedCode`, `compilationPath`, `htmlContent`, `codeType`, `cSharpContent`, `razorContent`, `cssContent`, `jsContent`, `cssFiles`, `jsFiles`, `razorGeneratedCode`, `cSharpGeneratedCode`, the `precompiled*Size` integers, and the booleans `template`, `default`, `enable`, `enableComments`, `displaySocialBox`, `published`, `inTrashCan`, `systemLocked`, `allowPingbacks`, `allowTrackbacks`, `cornerstoneContent`, `isEssentialContent`, `allowSearchEngineIndexing`, plus `marketingCampaignId`.

`EmailSignatureCreateDto` / `EmailSignatureUpdateDto` follow the **same content shape** as templates (signature create requires `title`; same `codeType` enum). `EmailGroupCreateDto`/`UpdateDto` are simple: `name`, `description`, `enabled` (create also accepts `id`, `timestamp`). `NewsletterCreateDto`/`UpdateDto`: `code`, `title`, `name` (create also accepts `id`, `timestamp`).

### Email dispatch model (SystemService)

Sending and previewing share a dispatch body. Two named shapes appear in the spec — they carry the **same fields**:

- `ObjectEmailDispatchRequest` — used by `/Emails/SendBasic` and `/Emails/Preview` (it also carries a free-form `payload`).
- `EmailDispatchRequest` — used by `/Tenants/{tenantId}/Emails/*` and `/Users/{userId}/Emails/*`.

**Dispatch body fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | **Yes** | Email subject / heading |
| `message` | string | **Yes** | Main body text |
| `buttonLink` | string | No | CTA button target URL |
| `buttonText` | string | No | CTA button label |
| `alertMessage` | string | No | Alert/banner text |
| `alertType` | enum | No | `None` \| `Info` \| `Error` \| `Warning` \| `Success` \| `Action` \| `Alert` |
| `culture` | string | **Yes** | Content language (e.g. `en`, `es`) |
| `uiCulture` | string | **Yes** | UI-chrome language |
| `recipients` | string[] | **Yes** | Direct email addresses |
| `contactIds` | string[] | No | ABS Contact IDs — platform resolves their emails |
| `tenantIds` | string[] | No | ABS Tenant IDs — platform resolves their emails |
| `userIds` | string[] | No | ABS User IDs — platform resolves their emails |
| `templateUrl` | string | No | Custom template URL |
| `emailTemplateId` | string | No | ID of a saved MarketingService email template |
| `payload` | object | No | Free-form data (`ObjectEmailDispatchRequest` only) |

> `alertType` is an **enum string** (`Info`, `Warning`, …) per the spec — send the name, not a numeric index.

Recipients can be combined: direct `recipients` plus any of `contactIds` / `tenantIds` / `userIds` (the platform resolves IDs to addresses).

## Operations — Email Templates (MarketingService)

`tenantId` is **required** on all of these.

### List email templates (OData)

```bash
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

OData query options apply, e.g. `&$top=20&$filter=published eq true`.

### Count email templates

```bash
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get an email template by ID

```bash
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<emailTemplate-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create an email template

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome Email",
    "description": "Sent to new users",
    "codeType": "Liquid",
    "code": "<h1>Welcome {{ name }}</h1>",
    "published": false
  }'
```

### Update an email template (PUT — full replace)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<emailTemplate-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome Email",
    "name": "welcome-email",
    "htmlContent": "<h1>Welcome</h1>",
    "codeType": "Html5",
    "published": true
  }'
```

### Patch an email template (PATCH — see PATCH section)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<emailTemplate-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/published", "value": true } ]'
```

### Delete an email template

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<emailTemplate-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Operations — Email Groups (MarketingService)

Recipient grouping. `tenantId` required.

```bash
# List
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/<emailgroup-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Monthly Subscribers", "description": "Opted-in monthly list", "enabled": true }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/<emailgroup-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Monthly Subscribers", "description": "Updated description", "enabled": false }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/<emailgroup-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Operations — Email Signatures (MarketingService)

Same content shape as templates; create requires `title`. `tenantId` required.

```bash
# List
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/<emailsignature-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Default Signature", "codeType": "Html5", "code": "<p>Best regards</p>", "published": true }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/<emailsignature-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Default Signature", "htmlContent": "<p>Best regards, The Team</p>", "codeType": "Html5" }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/<emailsignature-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Operations — Newsletters (MarketingService)

`tenantId` required.

```bash
# List
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/<newsletter-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "April Newsletter", "title": "What is new in April", "code": "newsletter-april" }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/<newsletter-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "April Newsletter", "title": "Updated title", "code": "newsletter-april" }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/<newsletter-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Operations — Sending & Previewing (SystemService)

> These admin endpoints are restricted to global administrators (e.g. `business_owner`).

### Preview a basic email (no send)

No `tenantId` parameter. Returns the rendered email.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Weekly Report is Ready",
    "message": "Your weekly activity report has been generated.",
    "buttonText": "View Report",
    "buttonLink": "https://app.example.com/reports/weekly",
    "culture": "en",
    "uiCulture": "en",
    "recipients": ["preview@example.com"]
  }'
```

### Send a basic transactional email

No `tenantId` parameter.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Emails/SendBasic" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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

Tenant in the path.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Important Update",
    "message": "Your organization settings have been updated.",
    "culture": "en",
    "uiCulture": "en",
    "recipients": []
  }'
```

### Send a tenant email

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/<tenant-guid>/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Account Notification",
    "message": "Your account has been updated.",
    "culture": "en",
    "uiCulture": "en",
    "recipients": []
  }'
```

### Send a user email

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users/<user-guid>/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Account Notification",
    "message": "Your account has been updated.",
    "culture": "en",
    "uiCulture": "en",
    "recipients": [],
    "userIds": ["<user-guid>"]
  }'
```

## PATCH (JSON Patch — RFC 6902)

PATCH performs an **atomic partial update** — safer than PUT for concurrent edits because you send only the operations you want. The body is a JSON **array** of operations with `Content-Type: application/json`. Each op has `op` ∈ `add|remove|replace|move|copy|test`, a JSON-Pointer `path` (leading `/`, camelCase field), and (for `add`/`replace`) a `value`.

Within this domain, PATCH is available on the four **MarketingService** email resources:

- `PATCH /api/v2/MarketingService/EmailTemplates/{emailTemplateId}`
- `PATCH /api/v2/MarketingService/EmailGroups/{emailgroupId}`
- `PATCH /api/v2/MarketingService/EmailSignatures/{emailsignatureId}`
- `PATCH /api/v2/MarketingService/Newsletters/{newsletterId}`

> The SystemService send/preview endpoints are POST actions and do **not** support PATCH.

Example — publish a template and update two fields atomically:

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<emailTemplate-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/title", "value": "Welcome Email (v2)" },
    { "op": "replace", "path": "/published", "value": true }
  ]'
```

Example — disable an email group:

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/<emailgroup-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/enabled", "value": false } ]'
```

## End-to-end workflow

Create a template, publish it via PATCH, then send a basic email referencing it.

```bash
# 1. Create an email template (capture the returned result.id as <emailTemplate-guid>)
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Welcome Email", "codeType": "Liquid", "code": "<h1>Welcome {{ name }}</h1>" }'

# 2. Publish it atomically with PATCH
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<emailTemplate-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/published", "value": true } ]'

# 3. Preview a basic email that uses the template
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome aboard",
    "message": "Thanks for joining.",
    "culture": "en",
    "uiCulture": "en",
    "recipients": ["new-user@example.com"],
    "emailTemplateId": "<emailTemplate-guid>"
  }'

# 4. Send it
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Emails/SendBasic" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome aboard",
    "message": "Thanks for joining.",
    "culture": "en",
    "uiCulture": "en",
    "recipients": ["new-user@example.com"],
    "emailTemplateId": "<emailTemplate-guid>"
  }'
```

## Critical Rules

- **Authenticate first.** Obtain a bearer token from `POST /login` and send `Authorization: Bearer …` on every call.
- **Tenant scoping is per-endpoint.** MarketingService email resources require `?tenantId=` on every verb (incl. POST/PUT/PATCH/DELETE). SystemService `/Emails/SendBasic|Preview` take no tenant; tenant/user email endpoints carry the id in the path.
- **`alertType` is an enum string** (`None|Info|Error|Warning|Success|Action|Alert`) — send the name, not a number.
- **`recipients` is required** on dispatch bodies (it may be an empty array when you target only `contactIds`/`tenantIds`/`userIds`).
- **`title` and `message` are required** on every dispatch; `culture` and `uiCulture` are required — set them to the recipient's language.
- **PATCH bodies are JSON arrays** of RFC 6902 operations, only on the four MarketingService resources.
- **Send/preview are admin operations** (global-administrator role).
- **Never hard-code real GUIDs, emails, names, or tokens.** Resolve them dynamically.
- **For broad marketing campaigns/lists** (MarketingCampaigns, MarketingLists, MarketingLeads, etc.), use the `absuite-marketing` skill rather than this one.
- **For the CLI equivalent of everything here, see `absuite-emails-cli`.** For generic HTTP helpers, see `absuite-rest`.

## API Endpoints Quick Reference

| Action | Method | Path | Service |
|---|---|---|---|
| List email templates | GET | `/api/v2/MarketingService/EmailTemplates` | MarketingService |
| Count email templates | GET | `/api/v2/MarketingService/EmailTemplates/Count` | MarketingService |
| Get email template | GET | `/api/v2/MarketingService/EmailTemplates/{emailTemplateId}` | MarketingService |
| Create email template | POST | `/api/v2/MarketingService/EmailTemplates` | MarketingService |
| Update email template | PUT | `/api/v2/MarketingService/EmailTemplates/{emailTemplateId}` | MarketingService |
| **Patch email template** | **PATCH** | `/api/v2/MarketingService/EmailTemplates/{emailTemplateId}` | MarketingService |
| Delete email template | DELETE | `/api/v2/MarketingService/EmailTemplates/{emailTemplateId}` | MarketingService |
| List email groups | GET | `/api/v2/MarketingService/EmailGroups` | MarketingService |
| Count email groups | GET | `/api/v2/MarketingService/EmailGroups/Count` | MarketingService |
| Get email group | GET | `/api/v2/MarketingService/EmailGroups/{emailgroupId}` | MarketingService |
| Create email group | POST | `/api/v2/MarketingService/EmailGroups` | MarketingService |
| Update email group | PUT | `/api/v2/MarketingService/EmailGroups/{emailgroupId}` | MarketingService |
| **Patch email group** | **PATCH** | `/api/v2/MarketingService/EmailGroups/{emailgroupId}` | MarketingService |
| Delete email group | DELETE | `/api/v2/MarketingService/EmailGroups/{emailgroupId}` | MarketingService |
| List email signatures | GET | `/api/v2/MarketingService/EmailSignatures` | MarketingService |
| Count email signatures | GET | `/api/v2/MarketingService/EmailSignatures/Count` | MarketingService |
| Get email signature | GET | `/api/v2/MarketingService/EmailSignatures/{emailsignatureId}` | MarketingService |
| Create email signature | POST | `/api/v2/MarketingService/EmailSignatures` | MarketingService |
| Update email signature | PUT | `/api/v2/MarketingService/EmailSignatures/{emailsignatureId}` | MarketingService |
| **Patch email signature** | **PATCH** | `/api/v2/MarketingService/EmailSignatures/{emailsignatureId}` | MarketingService |
| Delete email signature | DELETE | `/api/v2/MarketingService/EmailSignatures/{emailsignatureId}` | MarketingService |
| List newsletters | GET | `/api/v2/MarketingService/Newsletters` | MarketingService |
| Count newsletters | GET | `/api/v2/MarketingService/Newsletters/Count` | MarketingService |
| Get newsletter | GET | `/api/v2/MarketingService/Newsletters/{newsletterId}` | MarketingService |
| Create newsletter | POST | `/api/v2/MarketingService/Newsletters` | MarketingService |
| Update newsletter | PUT | `/api/v2/MarketingService/Newsletters/{newsletterId}` | MarketingService |
| **Patch newsletter** | **PATCH** | `/api/v2/MarketingService/Newsletters/{newsletterId}` | MarketingService |
| Delete newsletter | DELETE | `/api/v2/MarketingService/Newsletters/{newsletterId}` | MarketingService |
| Preview basic email | POST | `/api/v2/SystemService/Emails/Preview` | SystemService |
| Send basic email | POST | `/api/v2/SystemService/Emails/SendBasic` | SystemService |
| Preview tenant email | POST | `/api/v2/SystemService/Tenants/{tenantId}/Emails/Preview` | SystemService |
| Send tenant email | POST | `/api/v2/SystemService/Tenants/{tenantId}/Emails/Send` | SystemService |
| Preview user email | POST | `/api/v2/SystemService/Users/{userId}/Emails/Preview` | SystemService |
| Send user email | POST | `/api/v2/SystemService/Users/{userId}/Emails/Send` | SystemService |
