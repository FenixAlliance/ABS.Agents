---
name: absuite-emails
description: >
  Send emails through the Alliance Business Suite (ABS) using the `absuite` CLI.
  Covers sending basic/generic emails, contact emails, tenant emails, user emails,
  billing emails (orders, invoices, quotes), and previewing email templates.
  Requires an authenticated CLI session (use the `absuite-login` skill first).
  Do NOT use for managing email templates, groups, or signatures as CRM resources —
  this skill is for dispatching and previewing emails.
---

# Alliance Business Suite — Email Sending Skill

Send transactional and notification emails through the ABS platform using the `absuite` CLI.

## Architecture: Templates vs. Sending

The email system has two layers:

1. **Email Template Renderer** — renders email templates into HTML (stateless, no authentication needed). Accessible under `/Email/` routes on the ABS host.
2. **Email Sending Endpoints** — orchestrate the complete pipeline: resolve recipients, render the template, and dispatch via SMTP. These are CLI commands under the `system` service.

**As an agent, you primarily use the sending commands.** The template renderer is used internally by the platform.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Resolve your tenant** — email operations are tenant-aware. Either set a default:
   ```bash
   absuite config set --tenant-id <tenant-guid>
   ```
   Or pass `--TenantId` on each call.

### Discover Your Tenants

```bash
absuite tenants list tenants
```

**REST API equivalent:**

```bash
curl -s "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Pick the tenant matching your organization.

## REST API Authentication

To call the API directly via REST instead of the CLI:

1. **Obtain a bearer token:**
```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$ABSUITE_USER_EMAIL'", "password": "'$ABSUITE_USER_PASSWORD'"}'
```
Extract the `accessToken` from the JSON response.

2. **Use the token in all subsequent requests:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **All REST endpoints use the base path:** `$ABSUITE_HOST_URL/api/v2/`

## Approval Requirement

**Sending any email through the Alliance Business Suite requires board approval before dispatch.**

Before calling any email-sending command, you MUST:

1. **Draft the email** — prepare the full `ObjectEmailDispatchRequest` payload.
2. **Request approval** — create an approval request through Paperclip with the email details, including the recipient list, subject, and message body.
3. **Wait for approval** — do NOT send the email until approval is granted. If denied, do not send.
4. **Send only after approval** — once approved, proceed with the CLI command.

This applies to all sending commands. Template previews do NOT require approval.

## Agent Identity Signing

All emails sent by an agent must be signed. After login, fetch your profile:

```bash
absuite users Get-MeAsync
```

**REST API equivalent:**

```bash
curl -s "$ABSUITE_HOST_URL/api/v2/SystemService/Users/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Extract `firstName` and `lastName` from the response `result`. Append a signature line to every email message body:

```
— Sent by {firstName} {lastName}
```

## Command Discovery

```bash
# List all email-related system commands
absuite system list-commands

# Get help for a specific command
absuite system admin-send-basic-email --help
```

**REST API equivalent:** Browse the interactive API documentation at `$ABSUITE_HOST_URL/swagger` for all available endpoints and request schemas.

## Sending Emails

### Send a Basic Email

Send a generic transactional email to one or more recipients.

**Access**: Global administrators only (`business_owner` role).

First, check the schema:

```bash
absuite system admin-send-basic-email --help
```

**REST API equivalent:** View the request schema at `$ABSUITE_HOST_URL/swagger` under the **SystemService** → **Emails** section.

Then send:

```bash
absuite system admin-send-basic-email --ObjectEmailDispatchRequest '{
  "title": "Your Weekly Report is Ready",
  "message": "Your weekly activity report has been generated and is ready for review.\n\n— Sent by Agent Name",
  "buttonText": "View Report",
  "buttonLink": "https://app.example.com/reports/weekly",
  "alertMessage": "This report expires in 7 days.",
  "alertType": "3",
  "culture": "en",
  "uiCulture": "en",
  "recipients": ["alice@example.com", "bob@example.com"]
}'
```

**REST API equivalent:**

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Emails/SendBasic" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Weekly Report is Ready",
    "message": "Your weekly activity report has been generated and is ready for review.\n\n— Sent by Agent Name",
    "buttonText": "View Report",
    "buttonLink": "https://app.example.com/reports/weekly",
    "alertMessage": "This report expires in 7 days.",
    "alertType": "3",
    "culture": "en",
    "uiCulture": "en",
    "recipients": ["alice@example.com", "bob@example.com"]
  }'
```

### ObjectEmailDispatchRequest Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Email subject line |
| `message` | string | Yes | Main email body text |
| `buttonText` | string | No | CTA button label |
| `buttonLink` | string (URL) | No | CTA button target URL |
| `alertMessage` | string | No | Alert/warning banner text |
| `alertType` | string | No | Alert style: `0`=None, `1`=Info, `2`=Error, `3`=Warning, `4`=Success, `5`=Action, `6`=Alert |
| `culture` | string | Yes | ISO language code for content (e.g., `en`, `es`) |
| `uiCulture` | string | Yes | ISO language code for UI chrome |
| `recipients` | string[] | Yes | List of email addresses |
| `contactIds` | string[] | No | ABS Contact IDs — platform resolves their emails |
| `tenantIds` | string[] | No | ABS Tenant IDs — platform resolves their emails |
| `userIds` | string[] | No | ABS User IDs — platform resolves their emails |
| `templateUrl` | string (URL) | No | Custom template URL |
| `emailTemplateId` | string | No | ID of a saved marketing email template |

### Recipient Resolution

You can target recipients in multiple ways — they can be combined:

- **`recipients`** — direct email addresses
- **`contactIds`** — ABS Contact GUIDs
- **`tenantIds`** — ABS Tenant GUIDs
- **`userIds`** — ABS User GUIDs

### Alert Types

| Value | Name | Use case |
|---|---|---|
| `0` | None | No alert banner |
| `1` | Info | Informational notice |
| `2` | Error | Error notification |
| `3` | Warning | Warning/caution |
| `4` | Success | Success confirmation |
| `5` | Action | Action required |
| `6` | Alert | General alert |

### Send Email to a Tenant

```bash
absuite system admin-send-tenant-email --TenantId $TENANT_ID --ObjectEmailDispatchRequest '{
  "title": "Important Update",
  "message": "Your organization settings have been updated.\n\n— Sent by Agent Name",
  "culture": "en",
  "uiCulture": "en",
  "recipients": []
}'
```

**REST API equivalent:**

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/$TENANT_ID/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Important Update",
    "message": "Your organization settings have been updated.\n\n— Sent by Agent Name",
    "culture": "en",
    "uiCulture": "en",
    "recipients": []
  }'
```

### Send Email to a User

```bash
absuite system admin-send-user-email --UserId $USER_ID --ObjectEmailDispatchRequest '{
  "title": "Account Notification",
  "message": "Your account has been updated.\n\n— Sent by Agent Name",
  "culture": "en",
  "uiCulture": "en",
  "recipients": []
}'
```

**REST API equivalent:**

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users/$USER_ID/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Account Notification",
    "message": "Your account has been updated.\n\n— Sent by Agent Name",
    "culture": "en",
    "uiCulture": "en",
    "recipients": []
  }'
```

### Send Email to a Contact (via CRM Service)

```bash
absuite crm send contact-email --TenantId $TENANT_ID --ContactId $CONTACT_ID --EmailDispatchRequest '{
  "title": "Hello from ABS",
  "message": "We have an update for you.\n\n— Sent by Agent Name",
  "culture": "en",
  "uiCulture": "en"
}'
```

**REST API equivalent:**

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/$CONTACT_ID/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello from ABS",
    "message": "We have an update for you.\n\n— Sent by Agent Name",
    "culture": "en",
    "uiCulture": "en"
  }'
```

## Previewing Emails

Preview what a rendered email will look like without sending it.

### Preview Basic Email

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

**REST API equivalent:**

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

Returns rendered HTML.

### Preview Tenant Email

```bash
absuite system admin-preview-tenant-email --TenantId $TENANT_ID
```

**REST API equivalent:**

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Tenants/$TENANT_ID/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Preview User Email

```bash
absuite system admin-preview-user-email-template --UserId $USER_ID
```

**REST API equivalent:**

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Users/$USER_ID/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Preview Contact Email (via CRM Service)

```bash
absuite crm preview contact-email-template --TenantId $TENANT_ID --ContactId $CONTACT_ID
```

**REST API equivalent:**

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/$CONTACT_ID/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Managing Email Resources (Marketing Service)

The `marketing` service provides CRUD commands for email resources. All are tenant-scoped.

### Email Templates

```bash
# List templates
absuite marketing get email-templates-o-data --TenantId $TENANT_ID

# Count templates
absuite marketing count email-templates --TenantId $TENANT_ID

# Get template by ID
absuite marketing list email-template-details --TenantId $TENANT_ID --EmailTemplateId $TEMPLATE_ID

# Create template
absuite marketing create email-template --TenantId $TENANT_ID --EmailTemplateCreateDto '{...}'

# Update template
absuite marketing update email-template --TenantId $TENANT_ID --EmailTemplateId $TEMPLATE_ID --EmailTemplateUpdateDto '{...}'

# Delete template
absuite marketing delete email-template --TenantId $TENANT_ID --EmailTemplateId $TEMPLATE_ID
```

**REST API equivalents:**

```bash
# List templates
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count templates
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get template by ID
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/$TEMPLATE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create template
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update template
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/$TEMPLATE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete template
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/$TEMPLATE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Email Groups (Recipient Lists)

```bash
# List groups
absuite marketing get email-groups-o-data --TenantId $TENANT_ID

# Count groups
absuite marketing count email-groups --TenantId $TENANT_ID

# Get group by ID
absuite marketing list email-group-details --TenantId $TENANT_ID --EmailGroupId $GROUP_ID

# Create group
absuite marketing create email-group --TenantId $TENANT_ID --EmailGroupCreateDto '{...}'

# Update group
absuite marketing update email-group --TenantId $TENANT_ID --EmailGroupId $GROUP_ID --EmailGroupUpdateDto '{...}'

# Delete group
absuite marketing delete email-group --TenantId $TENANT_ID --EmailGroupId $GROUP_ID
```

**REST API equivalents:**

```bash
# List groups
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count groups
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get group by ID
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/$GROUP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create group
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update group
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/$GROUP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete group
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/$GROUP_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Email Signatures

```bash
# List signatures
absuite marketing get email-signatures-o-data --TenantId $TENANT_ID

# Count signatures
absuite marketing count email-signatures --TenantId $TENANT_ID

# Get signature by ID
absuite marketing list email-signature-details --TenantId $TENANT_ID --EmailSignatureId $SIG_ID

# Create signature
absuite marketing create email-signature --TenantId $TENANT_ID --EmailSignatureCreateDto '{...}'

# Update signature
absuite marketing update email-signature --TenantId $TENANT_ID --EmailSignatureId $SIG_ID --EmailSignatureUpdateDto '{...}'

# Delete signature
absuite marketing delete email-signature --TenantId $TENANT_ID --EmailSignatureId $SIG_ID
```

**REST API equivalents:**

```bash
# List signatures
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count signatures
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get signature by ID
curl -s "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/$SIG_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create signature
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update signature
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/$SIG_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete signature
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/$SIG_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Use `absuite marketing <command> --help` to see the full DTO schemas for create/update operations.

## Direct Template Rendering (Advanced)

If you need to render template HTML directly (without sending), the template renderer is available at `$ABSUITE_HOST_URL/Email/`. This is for debugging or custom flows — agents normally use the sending commands above.

### Template Categories

| Category | Base Path | Examples |
|---|---|---|
| Basic | `/Email/Basic/` | Action, Alert, Error, Info, Success, Warning |
| Account | `/Email/Account/` | Welcome, NewUser, Credentials, VerifyAccount, ChangePasswordRequest |
| Billing | `/Email/Billing/` | NewInvoice, InvoiceReady, InvoicePaid, NewOrder, NewPayment, NewQuote |
| Support | `/Email/Support/` | NewInquiry, NewTicket, TicketStatusChanged |
| Tenants | `/Email/Tenants/` | Tenant-specific templates |
| Marketing | `/Email/Marketing/` | Marketing campaign templates |
| Approvals | `/Email/Approvals/` | Approval workflow templates |
| Legal | `/Email/Legal/` | Legal notice templates |
| Security | `/Email/Security/` | Security alert templates |

Template localization is controlled via query parameters: `?culture=es&ui-culture=es`.

## Command Quick Reference

| Action | CLI Command |
|---|---|
| Send basic email | `absuite system admin-send-basic-email --ObjectEmailDispatchRequest '{...}'` |
| Send to tenant | `absuite system admin-send-tenant-email --TenantId <guid> --ObjectEmailDispatchRequest '{...}'` |
| Send to user | `absuite system admin-send-user-email --UserId <guid> --ObjectEmailDispatchRequest '{...}'` |
| Send to contact | `absuite crm send contact-email --TenantId <guid> --ContactId <guid> --EmailDispatchRequest '{...}'` |
| Preview basic | `absuite system admin-preview-basic-email-template --ObjectEmailDispatchRequest '{...}'` |
| Preview contact | `absuite crm preview contact-email-template --TenantId <guid> --ContactId <guid>` |
| List templates | `absuite marketing get email-templates-o-data --TenantId <guid>` |
| Create template | `absuite marketing create email-template --TenantId <guid> --EmailTemplateCreateDto '{...}'` |

## Critical Rules

- **Board approval is REQUIRED before sending any email.** Draft, request approval through Paperclip, and only send after approval. Previews are exempt.
- **Sign every email with your ABS user name.** Fetch your name from `absuite users Get-MeAsync` and append `— Sent by {name}` to the message body.
- **Authenticate first.** Use `absuite login` before any email operation.
- **System email commands require `business_owner` role.** The send and preview commands are restricted to global administrators.
- **Marketing Service commands require `--TenantId`.** Templates, groups, and signatures are tenant-scoped.
- **Use `recipients` for direct addresses, ID fields for platform-resolved addresses.** Combine `recipients`, `contactIds`, `userIds`, and `tenantIds` as needed.
- **Never hard-code credentials, tokens, or tenant IDs.** Resolve dynamically.
- **Localization is per-request.** Always set `culture` and `uiCulture` to match the recipient's language.
- **Use `--help` on any command for full schemas.** Don't guess parameter names — discover them.

## Example: Send Email to Contacts and Direct Recipients

```bash
# Assumes authenticated session and $TENANT_ID set

absuite system admin-send-basic-email --ObjectEmailDispatchRequest '{
  "title": "Monthly Newsletter: April 2026",
  "message": "Here is your monthly update with the latest news, product updates, and upcoming events.\n\n— Sent by Agent Name",
  "buttonText": "Read Full Newsletter",
  "buttonLink": "https://app.example.com/newsletter/april-2026",
  "alertMessage": "You are receiving this because you are subscribed to our monthly updates.",
  "alertType": "1",
  "culture": "en",
  "uiCulture": "en",
  "recipients": ["external-partner@example.com"],
  "contactIds": ["contact-guid-1", "contact-guid-2"],
  "userIds": ["user-guid-1"]
}'
```

**REST API equivalent:**

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SystemService/Emails/SendBasic" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Monthly Newsletter: April 2026",
    "message": "Here is your monthly update with the latest news, product updates, and upcoming events.\n\n— Sent by Agent Name",
    "buttonText": "Read Full Newsletter",
    "buttonLink": "https://app.example.com/newsletter/april-2026",
    "alertMessage": "You are receiving this because you are subscribed to our monthly updates.",
    "alertType": "1",
    "culture": "en",
    "uiCulture": "en",
    "recipients": ["external-partner@example.com"],
    "contactIds": ["contact-guid-1", "contact-guid-2"],
    "userIds": ["user-guid-1"]
  }'
```

## API Endpoints Quick Reference

| Resource | Method | Endpoint |
|---|---|---|
| Send Basic Email | POST | `/api/v2/SystemService/Emails/SendBasic` |
| Preview Basic Email | POST | `/api/v2/SystemService/Emails/Preview` |
| Send Tenant Email | POST | `/api/v2/SystemService/Tenants/:tenantId/Emails/Send` |
| Preview Tenant Email | POST | `/api/v2/SystemService/Tenants/:tenantId/Emails/Preview` |
| Send User Email | POST | `/api/v2/SystemService/Users/:userId/Emails/Send` |
| Preview User Email | POST | `/api/v2/SystemService/Users/:userId/Emails/Preview` |
| Send Contact Email | POST | `/api/v2/CrmService/Contacts/:contactId/Emails/Send` |
| Preview Contact Email | POST | `/api/v2/CrmService/Contacts/:contactId/Emails/Preview` |
| Email Templates | GET | `/api/v2/MarketingService/EmailTemplates` |
| Email Templates | POST | `/api/v2/MarketingService/EmailTemplates` |
| Email Template by ID | GET | `/api/v2/MarketingService/EmailTemplates/:emailTemplateId` |
| Email Template by ID | PUT | `/api/v2/MarketingService/EmailTemplates/:emailTemplateId` |
| Email Template by ID | DELETE | `/api/v2/MarketingService/EmailTemplates/:emailTemplateId` |
| Email Templates Count | GET | `/api/v2/MarketingService/EmailTemplates/Count` |
| Email Groups | GET | `/api/v2/MarketingService/EmailGroups` |
| Email Groups | POST | `/api/v2/MarketingService/EmailGroups` |
| Email Group by ID | GET | `/api/v2/MarketingService/EmailGroups/:emailgroupId` |
| Email Group by ID | PUT | `/api/v2/MarketingService/EmailGroups/:emailgroupId` |
| Email Group by ID | DELETE | `/api/v2/MarketingService/EmailGroups/:emailgroupId` |
| Email Groups Count | GET | `/api/v2/MarketingService/EmailGroups/Count` |
| Email Signatures | GET | `/api/v2/MarketingService/EmailSignatures` |
| Email Signatures | POST | `/api/v2/MarketingService/EmailSignatures` |
| Email Signature by ID | GET | `/api/v2/MarketingService/EmailSignatures/:emailsignatureId` |
| Email Signature by ID | PUT | `/api/v2/MarketingService/EmailSignatures/:emailsignatureId` |
| Email Signature by ID | DELETE | `/api/v2/MarketingService/EmailSignatures/:emailsignatureId` |
| Email Signatures Count | GET | `/api/v2/MarketingService/EmailSignatures/Count` |
