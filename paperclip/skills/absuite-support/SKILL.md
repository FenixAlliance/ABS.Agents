---
name: absuite-support
description: >
  Manage customer support — tickets, support requests, request attachments, ticket
  conversations, ticket priorities, ticket types, entitlements, refund/return/warranty
  requests and policies, knowledge articles, inquiry requests, and maintenance visits —
  via the Alliance Business Suite (ABS) REST API, including atomic PATCH (JSON Patch)
  updates. All operations are tenant-scoped and require a bearer token (see the
  absuite-login skill to authenticate). For the CLI equivalent, see `absuite-support-cli`.
---

# Alliance Business Suite — Support (REST API)

Drive the ABS `SupportService` directly over HTTP with `curl`. This skill covers the full
support surface: support tickets and their conversations, support requests and their
attachments, ticket priorities, ticket types, support entitlements, refund/return/warranty
requests and policies, knowledge articles, inquiry requests, and maintenance visits — plus
**atomic PATCH (RFC 6902 JSON Patch)** for partial updates.

Every `SupportService` endpoint is tenant-scoped: `tenantId` is **required** as a query
parameter on **every** verb (GET/POST/PUT/PATCH/DELETE). For general REST conventions and
raw-HTTP guidance shared across modules, see `absuite-rest`.

## Authentication

1. **Obtain a bearer token:**
```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$ABSUITE_USER_EMAIL'", "password": "'$ABSUITE_USER_PASSWORD'"}'
```
Extract `accessToken` from the JSON response.

2. **Send the token on every subsequent request:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** all resources live under `$ABSUITE_HOST_URL/api/v2/SupportService/`.

4. **Tenant scoping:** pass `?tenantId=<tenant-guid>` on **every** call (the `X-TenantId:
   <tenant-guid>` request header is the accepted equivalent). Omitting it on writes returns
   a 400.

5. **Response envelope** — every response is wrapped:
```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "…",
  "timestamp": "…",
  "result": <data | array | int | null>
}
```
Always check `isSuccess`; read the payload from `result`.

## Key Concepts

- **Support Ticket** — a tracked customer support case. `supportTicketStatus` is an enum:
  `New | OpenAndWaitingForAgent | OpenAndWaitingForCustomer | Closed`. A ticket links to a
  contact (`contactId`), a ticket type (`supportTicketTypeId`), an entitlement
  (`supportEntitlementId`), and a priority (`supportPriorityId`).
- **Ticket Conversation** — a threaded discussion attached to a ticket. Conversations carry
  messages (read-only, paged).
- **Support Ticket Priority / Type** — tenant-defined classification lookups referenced by
  tickets.
- **Support Request** — a higher-level customer request that can spawn tickets and carry
  attachments. Links to a contact and an entitlement.
- **Support Request Attachment** — a file/folder record attached to a support request.
- **Support Entitlement** — the support plan / SLA a customer is entitled to (quantities,
  renewal, billing, trial, usage-threshold, and many free-form `data*`/`data*Label` slots).
- **Refund / Return / Warranty Request** — customer-initiated requests, each tied to a
  contact, an entitlement, and the relevant policy. Carry `approved` / `approvedTimestamp`.
- **Refund / Return / Warranty Policy** — the rules governing each request type (duration in
  hours/days/weeks/months/years, `value`/`percentage`, currency, geography, `isDefault`,
  `isEnabled`, etc.). Return and warranty policies add `shippingCourierId` /
  `isExtendedWarranty` respectively.
- **Knowledge Article** — self-service knowledge-base content (title, slug, content, SEO,
  `published`/`enable`).
- **Inquiry Request** — a general inbound inquiry/lead (name, email, organization, message).
- **Maintenance Visit** — a scheduled maintenance record.

> **Field names below are the JSON body field names from the OpenAPI spec.** Request bodies
> in this skill use those exact names. ABS accepts both PascalCase and camelCase keys; the
> spec field names are camelCase and are used verbatim here.

---

## Support Tickets

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cannot access billing portal",
    "description": "User receives a 403 when opening Billing.",
    "supportTicketStatus": "New",
    "contactId": "<contact-guid>",
    "supportTicketTypeId": "<type-guid>",
    "supportEntitlementId": "<entitlement-guid>",
    "supportPriorityId": "<priority-guid>"
  }'

# Update (PUT — full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cannot access billing portal",
    "description": "Confirmed RBAC misconfiguration.",
    "supportTicketStatus": "OpenAndWaitingForCustomer",
    "contactId": "<contact-guid>",
    "supportTicketTypeId": "<type-guid>",
    "supportEntitlementId": "<entitlement-guid>",
    "supportPriorityId": "<priority-guid>"
  }'

# Patch (PATCH — partial update, JSON Patch; see PATCH section)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/supportTicketStatus", "value": "Closed" }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Create/Update body fields** (`SupportTicketCreateDto` / `SupportTicketUpdateDto`):
`id`, `timestamp`, `title`, `description`,
`supportTicketStatus` (enum `New | OpenAndWaitingForAgent | OpenAndWaitingForCustomer | Closed`),
`contactId`, `supportTicketTypeId`, `supportEntitlementId`, `supportPriorityId`.
(`id`/`timestamp` are create-only.)

### Ticket Conversations

```bash
# List conversations for a ticket
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>/Conversations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a specific conversation
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>/Conversations/<conversation-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a conversation on a ticket
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>/Conversations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Billing access follow-up",
    "closed": false,
    "socialProfileId": "<social-profile-guid>"
  }'

# List messages in a conversation (supports paging)
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>/Conversations/<conversation-guid>/Messages?tenantId=<tenant-guid>&pageNumber=1&pageSize=25" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Delete a conversation
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>/Conversations/<conversation-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Conversation create body fields** (`SupportTicketConversationCreateDto`):
`id`, `timestamp`, `topic`, `closed`, `closedTimestamp`, `socialProfileId`.

### Ticket Priorities

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities/<priority-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Critical",
    "description": "System-down or data-loss scenarios",
    "supportEntitlementId": "<entitlement-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities/<priority-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Critical", "description": "Sev-1", "supportEntitlementId": "<entitlement-guid>" }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities/<priority-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/title", "value": "Sev-1" }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities/<priority-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Create/Update body fields** (`SupportTicketPriorityCreateDto` / `SupportTicketPriorityUpdateDto`):
`id`, `timestamp`, `title`, `description`, `supportEntitlementId`.
(`id`/`timestamp` are create-only.)

### Ticket Types

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Bug Report", "description": "Software defect or error" }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Bug Report", "description": "Reproducible software defect" }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/description", "value": "Reproducible software defect" }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Create/Update body fields** (`SupportTicketTypeCreateDto` / `SupportTicketTypeUpdateDto`):
`id`, `timestamp`, `title`, `description`.

---

## Support Requests

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title is required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invoice reconciliation help",
    "description": "Need assistance reconciling last month'\''s invoices.",
    "approved": false,
    "supportEntitlementId": "<entitlement-guid>",
    "contactId": "<contact-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invoice reconciliation help",
    "description": "Resolved with finance.",
    "approved": true,
    "approvedTimestamp": "2026-06-12T00:00:00Z",
    "supportEntitlementId": "<entitlement-guid>"
  }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/approved", "value": true }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List tickets for a request
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Tickets?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Create body fields** (`SupportRequestCreateDto`):
`id`, `timestamp`, `title` (**required**), `description`, `approved`, `approvedTimestamp`,
`supportEntitlementId`, `contactId`.
**Update body fields** (`SupportRequestUpdateDto`):
`title`, `description`, `approved`, `approvedTimestamp`, `supportEntitlementId`.
(Note: `contactId` is create-only — it is not part of the update DTO.)

### Attachments scoped to a request

```bash
# List attachments for a request
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Attachments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count attachments for a request
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Attachments/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get one attachment of a request
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Attachments/<attachment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Add (relate) an attachment to a request — body is a SupportRequestAttachmentCreateDto
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Attachments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Error log",
    "fileName": "error.log",
    "filePath": "/uploads/error.log",
    "supportRequestId": "<request-guid>"
  }'
```

### Request Attachments (top-level resource)

```bash
# List all
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments/<attachment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Error log",
    "fileName": "error.log",
    "filePath": "/uploads/error.log",
    "supportRequestId": "<request-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments/<attachment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Error log (redacted)", "validResponse": true }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments/<attachment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/validResponse", "value": true }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments/<attachment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Create body fields** (`SupportRequestAttachmentCreateDto`):
`id`, `timestamp`, `notes`, `title`, `author`, `isFolder`, `fileName`, `abstract`,
`keyWords`, `validResponse`, `parentFileUploadId`, `filePath`, `metadata`, `supportRequestId`.
**Update body fields** (`SupportRequestAttachmentUpdateDto`):
`notes`, `metadata`, `title`, `author`, `isFolder`, `fileName`, `abstract`, `keyWords`,
`validResponse`, `parentFileUploadID`, `filePath`, `contentType`, `fileLength`.
(Spec note: update uses `parentFileUploadID` while create uses `parentFileUploadId`;
update adds `contentType`/`fileLength` and has no `supportRequestId`.)

---

## Support Entitlements

Define the support plan / SLA a customer is entitled to.

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements/<entitlement-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Support",
    "description": "24/7 support with 1-hour SLA",
    "startDateTime": "2026-01-01T00:00:00Z",
    "endDateTime": "2026-12-31T23:59:59Z",
    "quantity": 1,
    "enableAutomaticRenew": true,
    "freeTrialInDays": 14,
    "individualId": "<individual-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements/<entitlement-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Premium Support", "description": "Upgraded to 30-minute SLA", "enableAutomaticRenew": true }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements/<entitlement-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/enableAutomaticRenew", "value": false }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements/<entitlement-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body fields** (`SupportEntitlementCreateDto` / `SupportEntitlementUpdateDto`):
`title`, `description`, `startDateTime` (create-only), `endDateTime`, `nextInvoiceDateTime`,
`code`, `signature`, `quantity`, `repetitions`, `chargeAttempts`, `freeTrialInDays`,
`gracePeriodInDays`, `customRenewalPeriod`, `enableAutomaticRenew`, `enableProRateBilling`,
`enableUsageThreshold`, `enableAutomaticDisable`, `enableAutomaticPayments`, `usageThreshold`,
`data` … `data9` and `dataLabel` … `data9Label` (ten free-form value/label slot pairs),
`individualId`, `organizationId`, `receiverTenantId`, `paymentTokenId`, `walletAccountId`,
`securityCertificateId`. (Create-only extras: `id`, `timestamp`, `startDateTime`.)

---

## Refund Requests

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests/<refund-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title is required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Damaged on arrival",
    "description": "Product arrived damaged; requesting full refund.",
    "supportEntitlementId": "<entitlement-guid>",
    "contactId": "<contact-guid>",
    "refundPolicyId": "<refund-policy-guid>",
    "paymentId": "<payment-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests/<refund-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Damaged on arrival", "approved": true, "approvedTimestamp": "2026-06-12T00:00:00Z", "refundPolicyId": "<refund-policy-guid>", "paymentId": "<payment-guid>" }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests/<refund-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/approved", "value": true }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests/<refund-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Create body fields** (`RefundRequestCreateDto`):
`id`, `timestamp`, `title` (**required**), `description`, `approved`, `approvedTimestamp`,
`supportEntitlementId`, `contactId`, `refundPolicyId`, `paymentId`.
**Update body fields** (`RefundRequestUpdateDto`):
`title`, `description`, `approved`, `approvedTimestamp`, `supportEntitlementId`,
`refundPolicyId`, `paymentId`. (`contactId` is create-only.)

## Refund Policies

```bash
curl "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies/<refund-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title is required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "30-Day Full Refund",
    "description": "Full refund within 30 days of purchase.",
    "isFree": true,
    "isEnabled": true,
    "isDefault": true,
    "days": 30,
    "percentage": 100,
    "currencyId": "<currency-id>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies/<refund-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "30-Day Full Refund", "days": 30, "percentage": 100, "isEnabled": true }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies/<refund-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/isEnabled", "value": false }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies/<refund-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body fields** (`ItemRefundPolicyCreateDto` / `ItemRefundPolicyUpdateDto`):
`title` (**required** on create), `description`, `isFree`, `reduce`, `isEnabled`, `isDefault`,
`allowInternational`, `hours`, `days`, `weeks`, `months`, `years`, `value`, `percentage`,
`currencyId`, `countryId`, `countryStateId`, `customState`, `customCity`, `cityId`.
(Create-only extras: `id`, `timestamp`.)

---

## Return Requests

```bash
curl "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests/<return-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title is required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Wrong item shipped",
    "description": "Received item B instead of item A.",
    "supportEntitlementId": "<entitlement-guid>",
    "contactId": "<contact-guid>",
    "returnPolicyId": "<return-policy-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests/<return-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Wrong item shipped", "approved": true, "approvedTimestamp": "2026-06-12T00:00:00Z", "returnPolicyId": "<return-policy-guid>" }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests/<return-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/approved", "value": true }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests/<return-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Create body fields** (`ReturnRequestCreateDto`):
`id`, `timestamp`, `title` (**required**), `description`, `approved`, `approvedTimestamp`,
`supportEntitlementId`, `contactId`, `returnPolicyId`.
**Update body fields** (`ReturnRequestUpdateDto`):
`title`, `description`, `approved`, `approvedTimestamp`, `supportEntitlementId`,
`returnPolicyId`. (`contactId` is create-only.)

## Return Policies

```bash
curl "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies/<return-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title is required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Standard Return Policy",
    "description": "Returns accepted within 14 days, original packaging required.",
    "days": 14,
    "isEnabled": true,
    "shippingCourierId": "<courier-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies/<return-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Standard Return Policy", "days": 14, "isEnabled": true }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies/<return-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/days", "value": 30 }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies/<return-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body fields** (`ItemReturnPolicyCreateDto` / `ItemReturnPolicyUpdateDto`):
`title` (**required** on create), `description`, `shippingCourierId`, `isFree`, `reduce`,
`isEnabled`, `isDefault`, `allowInternational`, `hours`, `days`, `weeks`, `months`, `years`,
`value`, `percentage`, `currencyId`, `countryId`, `countryStateId`, `customState`,
`customCity`, `cityId`. (Create-only extras: `id`, `timestamp`.)

---

## Warranty Requests

```bash
curl "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests/<warranty-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title is required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Device stopped charging",
    "description": "Unit stopped charging after 3 months.",
    "supportEntitlementId": "<entitlement-guid>",
    "contactId": "<contact-guid>",
    "warrantyPolicyId": "<warranty-policy-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests/<warranty-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Device stopped charging", "approved": true, "approvedTimestamp": "2026-06-12T00:00:00Z", "warrantyPolicyId": "<warranty-policy-guid>" }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests/<warranty-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/approved", "value": true }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests/<warranty-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Create body fields** (`WarrantyRequestCreateDto`):
`id`, `timestamp`, `title` (**required**), `description`, `approved`, `approvedTimestamp`,
`supportEntitlementId`, `contactId`, `warrantyPolicyId`.
**Update body fields** (`WarrantyRequestUpdateDto`):
`title`, `description`, `approved`, `approvedTimestamp`, `supportEntitlementId`,
`warrantyPolicyId`. (`contactId` is create-only.)

## Warranty Policies

```bash
curl "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies/<warranty-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title is required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "1-Year Limited Warranty",
    "description": "Covers manufacturer defects for 12 months from purchase.",
    "isExtendedWarranty": false,
    "months": 12,
    "isEnabled": true
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies/<warranty-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "1-Year Limited Warranty", "months": 12, "isEnabled": true }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies/<warranty-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/months", "value": 24 }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies/<warranty-policy-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body fields** (`ItemWarrantyPolicyCreateDto` / `ItemWarrantyPolicyUpdateDto`):
`title` (**required** on create), `description`, `isExtendedWarranty`, `isFree`, `reduce`,
`isEnabled`, `isDefault`, `allowInternational`, `hours`, `days`, `weeks`, `months`, `years`,
`value`, `percentage`, `currencyId`, `countryId`, `countryStateId`, `customState`,
`customCity`, `cityId`. (Create-only extras: `id`, `timestamp`.)

---

## Knowledge Articles

```bash
curl "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles/<article-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title is required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to reset your password",
    "slug": "reset-password",
    "excerpt": "Steps to reset your account password.",
    "content": "Navigate to Settings > Security > Reset Password...",
    "published": true,
    "enable": true
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles/<article-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "How to reset your password", "content": "Updated steps...", "published": true }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles/<article-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/published", "value": false }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles/<article-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body fields** (`KnowledgeArticleCreateDto` / `KnowledgeArticleUpdateDto`):
`title` (**required** on create), `slug`, `excerpt`, `description`, `content`,
`highlightImage`, `seoTitle`, `seoKeyWords`, `metaDescription`, `published`, `enable`.
(Create-only extras: `id`, `timestamp`.)

---

## Inquiry Requests

```bash
curl "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests/<inquiry-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (name, email, message are required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Sales",
    "name": "<first-name>",
    "lastName": "<last-name>",
    "email": "<email>",
    "organizationName": "<org-name>",
    "message": "We would like details on volume licensing.",
    "countryId": "<country-id>",
    "phone": "<phone>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests/<inquiry-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "type": "Sales", "message": "Updated: requesting an enterprise quote." }'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests/<inquiry-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/type", "value": "Partnership" }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests/<inquiry-request-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Create body fields** (`InquiryRequestCreateDto`):
`id`, `timestamp`, `type`, `name` (**required**), `lastName`, `email` (**required**),
`organizationName`, `jobRole`, `organizationDomain`, `countryId`, `phone`,
`message` (**required**), `socialProfileId`.
**Update body fields** (`InquiryRequestUpdateDto`):
`type`, `name`, `lastName`, `email`, `organizationName`, `jobRole`, `organizationDomain`,
`countryId`, `phone`, `message`, `socialProfileId`.

---

## Maintenance Visits

```bash
curl "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits/<visit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "id": "<visit-guid>", "timestamp": "2026-06-12T10:00:00Z" }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits/<visit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Patch (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits/<visit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/timestamp", "value": "2026-07-01T10:00:00Z" }]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits/<visit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

> **Spec note:** the OpenAPI spec exposes only `id` and `timestamp` on
> `MaintenanceVisitCreateDto`, and `MaintenanceVisitUpdateDto` has **no documented body
> fields**. Send only fields confirmed by the spec; do not invent a `description` or
> `scheduledDate` field (the old skill showed those — they are not in the spec).

---

## PATCH (JSON Patch, RFC 6902)

Every primary `SupportService` aggregate supports `PATCH` for **atomic partial updates** —
safer than `PUT` under concurrent edits because you send only the fields you intend to change.

- **Content-Type:** `application/json`
- **Body:** a JSON **array** of operations. Each op has `op`, `path`, and (for most ops)
  `value`. `op` ∈ `add | remove | replace | move | copy | test`. `path`/`from` are
  JSON-Pointer strings (leading `/`, camelCase field names).
- **Tenant:** `?tenantId=<tenant-guid>` is still required on the PATCH request.

Example — close a ticket and re-point its priority in one atomic request:
```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/supportTicketStatus", "value": "Closed" },
    { "op": "replace", "path": "/supportPriorityId", "value": "<priority-guid>" }
  ]'
```

**Resources that support PATCH** (path `…/{resource}/{id}`):
SupportTickets, SupportRequests, SupportRequestAttachments, SupportEntitlements,
SupportTicketPriorities, SupportTicketTypes, RefundRequests, RefundPolicies,
ReturnRequests, ReturnPolicies, WarrantyRequests, WarrantyPolicies, KnowledgeArticles,
InquiryRequests, MaintenanceVisits.

> Sub-resources (ticket conversations, conversation messages, and the per-request
> attachment relations) do **not** expose PATCH. Use their POST/GET/DELETE endpoints.

---

## End-to-End Workflow

Stand up the classification lookups and an entitlement, open a ticket, discuss it, then close
it atomically — all with verified endpoints:

```bash
# 1. Create a ticket type
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Bug Report", "description": "Software defect" }'

# 2. Create a priority
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "High", "description": "Major impact" }'

# 3. Create an entitlement
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Premium Support", "description": "24/7, 1-hour SLA", "quantity": 1 }'

# 4. Open a ticket referencing them
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "title": "Login fails with 403",
    "description": "User cannot reach the billing portal.",
    "supportTicketStatus": "New",
    "contactId": "<contact-guid>",
    "supportTicketTypeId": "<type-guid>",
    "supportEntitlementId": "<entitlement-guid>",
    "supportPriorityId": "<priority-guid>"
  }'

# 5. Start a conversation on the ticket
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>/Conversations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "topic": "Troubleshooting 403", "closed": false }'

# 6. Read the conversation messages (paged)
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>/Conversations/<conversation-guid>/Messages?tenantId=<tenant-guid>&pageNumber=1&pageSize=25" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 7. Close the ticket atomically (PATCH)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/supportTicketStatus", "value": "Closed" }]'
```

---

## API Endpoints Quick Reference

All paths are relative to `$ABSUITE_HOST_URL/api/v2/SupportService/`. `tenantId` is a
**required** query param on every operation (omitted from the table for brevity).

### Support Tickets and sub-resources

| Action | Method | Path |
|---|---|---|
| List tickets | GET | `/SupportTickets` |
| Count tickets | GET | `/SupportTickets/Count` |
| Get ticket | GET | `/SupportTickets/{supportTicketId}` |
| Create ticket | POST | `/SupportTickets` |
| Update ticket | PUT | `/SupportTickets/{supportTicketId}` |
| Patch ticket | PATCH | `/SupportTickets/{supportTicketId}` |
| Delete ticket | DELETE | `/SupportTickets/{supportTicketId}` |
| List conversations | GET | `/SupportTickets/{supportTicketId}/Conversations` |
| Get conversation | GET | `/SupportTickets/{supportTicketId}/Conversations/{supportTicketConversationId}` |
| Create conversation | POST | `/SupportTickets/{supportTicketId}/Conversations` |
| Delete conversation | DELETE | `/SupportTickets/{supportTicketId}/Conversations/{supportTicketConversationId}` |
| List conversation messages | GET | `/SupportTickets/{supportTicketId}/Conversations/{supportTicketConversationId}/Messages` (`pageNumber`, `pageSize` optional) |

### Support Ticket Priorities / Types

| Action | Method | Path |
|---|---|---|
| List priorities | GET | `/SupportTicketPriorities` |
| Count priorities | GET | `/SupportTicketPriorities/Count` |
| Get priority | GET | `/SupportTicketPriorities/{supportTicketPriorityId}` |
| Create priority | POST | `/SupportTicketPriorities` |
| Update priority | PUT | `/SupportTicketPriorities/{supportTicketPriorityId}` |
| Patch priority | PATCH | `/SupportTicketPriorities/{supportTicketPriorityId}` |
| Delete priority | DELETE | `/SupportTicketPriorities/{supportTicketPriorityId}` |
| List types | GET | `/SupportTicketTypes` |
| Count types | GET | `/SupportTicketTypes/Count` |
| Get type | GET | `/SupportTicketTypes/{supportTicketTypeId}` |
| Create type | POST | `/SupportTicketTypes` |
| Update type | PUT | `/SupportTicketTypes/{supportTicketTypeId}` |
| Patch type | PATCH | `/SupportTicketTypes/{supportTicketTypeId}` |
| Delete type | DELETE | `/SupportTicketTypes/{supportTicketTypeId}` |

### Support Requests and Attachments

| Action | Method | Path |
|---|---|---|
| List requests | GET | `/SupportRequests` |
| Count requests | GET | `/SupportRequests/Count` |
| Get request | GET | `/SupportRequests/{supportRequestId}` |
| Create request | POST | `/SupportRequests` |
| Update request | PUT | `/SupportRequests/{supportRequestId}` |
| Patch request | PATCH | `/SupportRequests/{supportRequestId}` |
| Delete request | DELETE | `/SupportRequests/{supportRequestId}` |
| List request tickets | GET | `/SupportRequests/{supportRequestId}/Tickets` |
| List request attachments | GET | `/SupportRequests/{supportRequestId}/Attachments` |
| Count request attachments | GET | `/SupportRequests/{supportRequestId}/Attachments/Count` |
| Get one request attachment | GET | `/SupportRequests/{supportRequestId}/Attachments/{attachmentId}` |
| Add attachment to request | POST | `/SupportRequests/{supportRequestId}/Attachments` |
| List all attachments | GET | `/SupportRequestAttachments` |
| Count attachments | GET | `/SupportRequestAttachments/Count` |
| Get attachment | GET | `/SupportRequestAttachments/{supportRequestAttachmentId}` |
| Create attachment | POST | `/SupportRequestAttachments` |
| Update attachment | PUT | `/SupportRequestAttachments/{supportRequestAttachmentId}` |
| Patch attachment | PATCH | `/SupportRequestAttachments/{supportRequestAttachmentId}` |
| Delete attachment | DELETE | `/SupportRequestAttachments/{supportRequestAttachmentId}` |

### Entitlements, Requests, Policies, KB, Inquiries, Visits

| Resource | List | Count | Get | Create | Update | Patch | Delete |
|---|---|---|---|---|---|---|---|
| SupportEntitlements | `GET /SupportEntitlements` | `GET /SupportEntitlements/Count` | `GET /SupportEntitlements/{id}` | `POST /SupportEntitlements` | `PUT /SupportEntitlements/{id}` | `PATCH /SupportEntitlements/{id}` | `DELETE /SupportEntitlements/{id}` |
| RefundRequests | `GET /RefundRequests` | `GET /RefundRequests/Count` | `GET /RefundRequests/{id}` | `POST /RefundRequests` | `PUT /RefundRequests/{id}` | `PATCH /RefundRequests/{id}` | `DELETE /RefundRequests/{id}` |
| RefundPolicies | `GET /RefundPolicies` | `GET /RefundPolicies/Count` | `GET /RefundPolicies/{id}` | `POST /RefundPolicies` | `PUT /RefundPolicies/{id}` | `PATCH /RefundPolicies/{id}` | `DELETE /RefundPolicies/{id}` |
| ReturnRequests | `GET /ReturnRequests` | `GET /ReturnRequests/Count` | `GET /ReturnRequests/{id}` | `POST /ReturnRequests` | `PUT /ReturnRequests/{id}` | `PATCH /ReturnRequests/{id}` | `DELETE /ReturnRequests/{id}` |
| ReturnPolicies | `GET /ReturnPolicies` | `GET /ReturnPolicies/Count` | `GET /ReturnPolicies/{id}` | `POST /ReturnPolicies` | `PUT /ReturnPolicies/{id}` | `PATCH /ReturnPolicies/{id}` | `DELETE /ReturnPolicies/{id}` |
| WarrantyRequests | `GET /WarrantyRequests` | `GET /WarrantyRequests/Count` | `GET /WarrantyRequests/{id}` | `POST /WarrantyRequests` | `PUT /WarrantyRequests/{id}` | `PATCH /WarrantyRequests/{id}` | `DELETE /WarrantyRequests/{id}` |
| WarrantyPolicies | `GET /WarrantyPolicies` | `GET /WarrantyPolicies/Count` | `GET /WarrantyPolicies/{id}` | `POST /WarrantyPolicies` | `PUT /WarrantyPolicies/{id}` | `PATCH /WarrantyPolicies/{id}` | `DELETE /WarrantyPolicies/{id}` |
| KnowledgeArticles | `GET /KnowledgeArticles` | `GET /KnowledgeArticles/Count` | `GET /KnowledgeArticles/{id}` | `POST /KnowledgeArticles` | `PUT /KnowledgeArticles/{id}` | `PATCH /KnowledgeArticles/{id}` | `DELETE /KnowledgeArticles/{id}` |
| InquiryRequests | `GET /InquiryRequests` | `GET /InquiryRequests/Count` | `GET /InquiryRequests/{id}` | `POST /InquiryRequests` | `PUT /InquiryRequests/{id}` | `PATCH /InquiryRequests/{id}` | `DELETE /InquiryRequests/{id}` |
| MaintenanceVisits | `GET /MaintenanceVisits` | `GET /MaintenanceVisits/Count` | `GET /MaintenanceVisits/{id}` | `POST /MaintenanceVisits` | `PUT /MaintenanceVisits/{id}` | `PATCH /MaintenanceVisits/{id}` | `DELETE /MaintenanceVisits/{id}` |

---

## Critical Rules

- **Authenticate first**, then send `Authorization: Bearer …` on every call.
- **`tenantId` is required on every request** (GET/POST/PUT/PATCH/DELETE). Omitting it on a
  write returns 400. The `X-TenantId` header is the accepted equivalent.
- **Set up priorities, types, and entitlements first**, then create tickets that reference them.
- **Use ticket conversations** for threaded discussion; messages are read-only and paged.
- **Prefer PATCH for status flips and single-field edits** to avoid clobbering concurrent
  changes a full PUT would overwrite.
- **For the CLI equivalent, see `absuite-support-cli`.** For shared raw-HTTP conventions, see
  `absuite-rest`.
