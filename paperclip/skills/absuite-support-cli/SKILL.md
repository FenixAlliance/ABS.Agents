---
name: absuite-support-cli
description: >
  Manage customer support — tickets, support requests, request attachments, ticket
  conversations, ticket priorities, ticket types, entitlements, refund/return/warranty
  requests and policies, knowledge articles, inquiry requests, and maintenance visits —
  using the `absuite` CLI. Covers these entities via list/count/search/get/create/update/
  delete commands plus ticket-conversation and request-attachment actions. Requires an
  authenticated CLI session (see absuite-login-cli). For atomic PATCH updates or raw HTTP,
  use the absuite-support (REST) skill.
---

# Alliance Business Suite — Support (CLI)

Drive the ABS `SupportService` through the `absuite` CLI's `support` service. Covers support
tickets and their conversations, support requests and their attachments, ticket priorities,
ticket types, entitlements, refund/return/warranty requests and policies, knowledge articles,
inquiry requests, and maintenance visits.

> **The CLI does not support PATCH.** For atomic partial (JSON Patch) updates, or to call the
> API over raw HTTP, use the `absuite-support` (REST) skill. For general CLI usage and shared
> conventions, see `absuite-cli`.

## Prerequisites

1. **Authenticate first:** `absuite login` (see the `absuite-login-cli` skill).
2. **Set your tenant** so you can omit `--TenantId` on every call:
   `absuite config set --tenant-id <tenant-guid>` (`$TENANT_ID` below stands for the
   configured default). You can always override per call with `--TenantId <tenant-guid>`.
   Every `support` command is tenant-scoped — `TenantId` is **required** (either configured
   as the default or passed explicitly).
3. **Discover commands:** `absuite support list-commands`, and `absuite support <command> --help`
   for the exact parameters of any command.

## Command structure

```
absuite support <verb> <entity> --Param value
```

- **Verbs:** `list`, `count`, `search`, `get`, `create`, `update`, `delete`, plus the
  service actions below (ticket conversations, request attachments).
- **JSON DTO parameters** are passed as a single-quoted JSON string, e.g.
  `--SupportTicketCreateDto '{ ... }'`, using the **same field names as the REST API**.
- **The canonical function-name form also works**, mapping 1:1 to the PowerShell SDK
  cmdlets — e.g. `absuite support Get-SupportTicketsAsync --TenantId $TENANT_ID` or
  `absuite support New-SupportTicketAsync --TenantId $TENANT_ID --SupportTicketCreateDto '{...}'`.
  SDK verb prefixes: `Get-` (list/get/count), `New-` (create), `Update-` (update/PUT),
  `Invoke-Delete…` (delete), `Invoke-Relate…` (relate). There is no `Patch` verb in the CLI.

---

## Support Tickets

```bash
# List
absuite support list tickets --TenantId $TENANT_ID

# Count
absuite support count tickets --TenantId $TENANT_ID

# Get by ID
absuite support get ticket --TenantId $TENANT_ID --SupportTicketId <ticket-guid>

# Create
absuite support create ticket --TenantId $TENANT_ID --SupportTicketCreateDto '{
  "title": "Cannot access billing portal",
  "description": "User receives a 403 when opening Billing.",
  "supportTicketStatus": "New",
  "contactId": "<contact-guid>",
  "supportTicketTypeId": "<type-guid>",
  "supportEntitlementId": "<entitlement-guid>",
  "supportPriorityId": "<priority-guid>"
}'

# Update (full replace)
absuite support update ticket --TenantId $TENANT_ID --SupportTicketId <ticket-guid> --SupportTicketUpdateDto '{
  "title": "Cannot access billing portal",
  "description": "Confirmed RBAC misconfiguration.",
  "supportTicketStatus": "OpenAndWaitingForCustomer",
  "contactId": "<contact-guid>",
  "supportTicketTypeId": "<type-guid>",
  "supportEntitlementId": "<entitlement-guid>",
  "supportPriorityId": "<priority-guid>"
}'

# Delete
absuite support delete ticket --TenantId $TENANT_ID --SupportTicketId <ticket-guid>
```

**`supportTicketStatus`** is an enum: `New | OpenAndWaitingForAgent | OpenAndWaitingForCustomer | Closed`.

**Create/Update DTO fields:** `title`, `description`, `supportTicketStatus`, `contactId`,
`supportTicketTypeId`, `supportEntitlementId`, `supportPriorityId` (create also accepts
`id`/`timestamp`).

### Ticket Conversations

```bash
# List conversations for a ticket
absuite support get ticket-conversations --TenantId $TENANT_ID --SupportTicketId <ticket-guid>

# Get a specific conversation
absuite support get ticket-conversation --TenantId $TENANT_ID --SupportTicketId <ticket-guid> --SupportTicketConversationId <conversation-guid>

# List messages in a conversation (paged)
absuite support get ticket-conversation-messages --TenantId $TENANT_ID --SupportTicketId <ticket-guid> --SupportTicketConversationId <conversation-guid> --PageNumber 1 --PageSize 25

# Create (relate) a conversation on a ticket
absuite support relate-support-ticket-to-conversation --TenantId $TENANT_ID --SupportTicketId <ticket-guid> --SupportTicketConversationCreateDto '{
  "topic": "Billing access follow-up",
  "closed": false,
  "socialProfileId": "<social-profile-guid>"
}'

# Delete a conversation
absuite support delete ticket-conversation --TenantId $TENANT_ID --SupportTicketId <ticket-guid> --SupportTicketConversationId <conversation-guid>
```

**Conversation create DTO fields** (`SupportTicketConversationCreateDto`):
`id`, `timestamp`, `topic`, `closed`, `closedTimestamp`, `socialProfileId`.

### Ticket Priorities

```bash
absuite support list ticket-priorities --TenantId $TENANT_ID
absuite support count ticket-priorities --TenantId $TENANT_ID
absuite support get ticket-priority --TenantId $TENANT_ID --SupportTicketPriorityId <priority-guid>

absuite support create ticket-priority --TenantId $TENANT_ID --SupportTicketPriorityCreateDto '{
  "title": "Critical",
  "description": "System-down or data-loss scenarios",
  "supportEntitlementId": "<entitlement-guid>"
}'

absuite support update ticket-priority --TenantId $TENANT_ID --SupportTicketPriorityId <priority-guid> --SupportTicketPriorityUpdateDto '{
  "title": "Sev-1",
  "description": "Highest urgency"
}'

absuite support delete ticket-priority --TenantId $TENANT_ID --SupportTicketPriorityId <priority-guid>
```

**Create/Update DTO fields:** `title`, `description`, `supportEntitlementId` (create also
accepts `id`/`timestamp`).

### Ticket Types

```bash
absuite support list ticket-types --TenantId $TENANT_ID
absuite support count ticket-types --TenantId $TENANT_ID
absuite support get ticket-type --TenantId $TENANT_ID --SupportTicketTypeId <type-guid>

absuite support create ticket-type --TenantId $TENANT_ID --SupportTicketTypeCreateDto '{
  "title": "Bug Report",
  "description": "Software defect or error"
}'

absuite support update ticket-type --TenantId $TENANT_ID --SupportTicketTypeId <type-guid> --SupportTicketTypeUpdateDto '{
  "title": "Bug Report",
  "description": "Reproducible software defect"
}'

absuite support delete ticket-type --TenantId $TENANT_ID --SupportTicketTypeId <type-guid>
```

**Create/Update DTO fields:** `id`, `timestamp`, `title`, `description`.

---

## Support Requests

```bash
absuite support list requests --TenantId $TENANT_ID
absuite support count requests --TenantId $TENANT_ID
absuite support get request --TenantId $TENANT_ID --SupportRequestId <request-guid>

# Create  (title is required)
absuite support create request --TenantId $TENANT_ID --SupportRequestCreateDto '{
  "title": "Invoice reconciliation help",
  "description": "Need assistance reconciling last month'\''s invoices.",
  "approved": false,
  "supportEntitlementId": "<entitlement-guid>",
  "contactId": "<contact-guid>"
}'

# Update
absuite support update request --TenantId $TENANT_ID --SupportRequestId <request-guid> --SupportRequestUpdateDto '{
  "title": "Invoice reconciliation help",
  "description": "Resolved with finance.",
  "approved": true,
  "approvedTimestamp": "2026-06-12T00:00:00Z",
  "supportEntitlementId": "<entitlement-guid>"
}'

# Delete
absuite support delete request --TenantId $TENANT_ID --SupportRequestId <request-guid>

# List tickets for a request
absuite support get request-tickets --TenantId $TENANT_ID --SupportRequestId <request-guid>
```

**Create DTO fields** (`SupportRequestCreateDto`): `id`, `timestamp`, `title` (**required**),
`description`, `approved`, `approvedTimestamp`, `supportEntitlementId`, `contactId`.
**Update DTO fields** (`SupportRequestUpdateDto`): `title`, `description`, `approved`,
`approvedTimestamp`, `supportEntitlementId` (note: no `contactId` on update).

### Attachments scoped to a request

```bash
# List attachments for a request
absuite support get request-attachments-by-request --TenantId $TENANT_ID --SupportRequestId <request-guid>

# Count attachments for a request
absuite support get request-attachments-count-by-request --TenantId $TENANT_ID --SupportRequestId <request-guid>

# Get one attachment of a request  (note: --AttachmentId, not --SupportRequestAttachmentId)
absuite support get request-attachment-by-request --TenantId $TENANT_ID --SupportRequestId <request-guid> --AttachmentId <attachment-guid>

# Add (relate) an attachment to a request — body is a SupportRequestAttachmentCreateDto
absuite support relate-support-request-to-attachment --TenantId $TENANT_ID --SupportRequestId <request-guid> --SupportRequestAttachmentCreateDto '{
  "title": "Error log",
  "fileName": "error.log",
  "filePath": "/uploads/error.log",
  "supportRequestId": "<request-guid>"
}'
```

### Request Attachments (top-level resource)

```bash
absuite support list request-attachments --TenantId $TENANT_ID
absuite support count request-attachments --TenantId $TENANT_ID
absuite support get request-attachment --TenantId $TENANT_ID --SupportRequestAttachmentId <attachment-guid>

absuite support create request-attachment --TenantId $TENANT_ID --SupportRequestAttachmentCreateDto '{
  "title": "Error log",
  "fileName": "error.log",
  "filePath": "/uploads/error.log",
  "supportRequestId": "<request-guid>"
}'

absuite support update request-attachment --TenantId $TENANT_ID --SupportRequestAttachmentId <attachment-guid> --SupportRequestAttachmentUpdateDto '{
  "title": "Error log (redacted)",
  "validResponse": true
}'

absuite support delete request-attachment --TenantId $TENANT_ID --SupportRequestAttachmentId <attachment-guid>
```

**Create DTO fields** (`SupportRequestAttachmentCreateDto`): `id`, `timestamp`, `notes`,
`title`, `author`, `isFolder`, `fileName`, `abstract`, `keyWords`, `validResponse`,
`parentFileUploadId`, `filePath`, `metadata`, `supportRequestId`.
**Update DTO fields** (`SupportRequestAttachmentUpdateDto`): `notes`, `metadata`, `title`,
`author`, `isFolder`, `fileName`, `abstract`, `keyWords`, `validResponse`,
`parentFileUploadID`, `filePath`, `contentType`, `fileLength`.

---

## Support Entitlements

```bash
absuite support list entitlements --TenantId $TENANT_ID
absuite support count entitlements --TenantId $TENANT_ID
absuite support get entitlement --TenantId $TENANT_ID --SupportEntitlementId <entitlement-guid>

absuite support create entitlement --TenantId $TENANT_ID --SupportEntitlementCreateDto '{
  "title": "Premium Support",
  "description": "24/7 support with 1-hour SLA",
  "startDateTime": "2026-01-01T00:00:00Z",
  "endDateTime": "2026-12-31T23:59:59Z",
  "quantity": 1,
  "enableAutomaticRenew": true,
  "freeTrialInDays": 14,
  "individualId": "<individual-guid>"
}'

absuite support update entitlement --TenantId $TENANT_ID --SupportEntitlementId <entitlement-guid> --SupportEntitlementUpdateDto '{
  "title": "Premium Support",
  "description": "Upgraded to 30-minute SLA",
  "enableAutomaticRenew": true
}'

absuite support delete entitlement --TenantId $TENANT_ID --SupportEntitlementId <entitlement-guid>
```

**DTO fields** (`SupportEntitlementCreateDto` / `SupportEntitlementUpdateDto`): `title`,
`description`, `startDateTime` (create-only), `endDateTime`, `nextInvoiceDateTime`, `code`,
`signature`, `quantity`, `repetitions`, `chargeAttempts`, `freeTrialInDays`,
`gracePeriodInDays`, `customRenewalPeriod`, `enableAutomaticRenew`, `enableProRateBilling`,
`enableUsageThreshold`, `enableAutomaticDisable`, `enableAutomaticPayments`, `usageThreshold`,
`data` … `data9` and `dataLabel` … `data9Label` (ten free-form value/label slot pairs),
`individualId`, `organizationId`, `receiverTenantId`, `paymentTokenId`, `walletAccountId`,
`securityCertificateId`. (Create also accepts `id`/`timestamp`.)

---

## Refund Requests

```bash
absuite support list refund-requests --TenantId $TENANT_ID
absuite support count refund-requests --TenantId $TENANT_ID
absuite support get refund-request --TenantId $TENANT_ID --RefundRequestId <refund-request-guid>

# Create  (title is required)
absuite support create refund-request --TenantId $TENANT_ID --RefundRequestCreateDto '{
  "title": "Damaged on arrival",
  "description": "Product arrived damaged; requesting full refund.",
  "supportEntitlementId": "<entitlement-guid>",
  "contactId": "<contact-guid>",
  "refundPolicyId": "<refund-policy-guid>",
  "paymentId": "<payment-guid>"
}'

absuite support update refund-request --TenantId $TENANT_ID --RefundRequestId <refund-request-guid> --RefundRequestUpdateDto '{
  "title": "Damaged on arrival",
  "approved": true,
  "approvedTimestamp": "2026-06-12T00:00:00Z",
  "refundPolicyId": "<refund-policy-guid>",
  "paymentId": "<payment-guid>"
}'

absuite support delete refund-request --TenantId $TENANT_ID --RefundRequestId <refund-request-guid>
```

**Create DTO fields** (`RefundRequestCreateDto`): `id`, `timestamp`, `title` (**required**),
`description`, `approved`, `approvedTimestamp`, `supportEntitlementId`, `contactId`,
`refundPolicyId`, `paymentId`.
**Update DTO fields** (`RefundRequestUpdateDto`): `title`, `description`, `approved`,
`approvedTimestamp`, `supportEntitlementId`, `refundPolicyId`, `paymentId` (no `contactId`).

## Refund Policies

```bash
absuite support list refund-policies --TenantId $TENANT_ID
absuite support count refund-policies --TenantId $TENANT_ID
absuite support get refund-policy --TenantId $TENANT_ID --RefundPolicyId <refund-policy-guid>

# Create  (title is required)
absuite support create refund-policy --TenantId $TENANT_ID --ItemRefundPolicyCreateDto '{
  "title": "30-Day Full Refund",
  "description": "Full refund within 30 days of purchase.",
  "isFree": true,
  "isEnabled": true,
  "isDefault": true,
  "days": 30,
  "percentage": 100,
  "currencyId": "<currency-id>"
}'

absuite support update refund-policy --TenantId $TENANT_ID --RefundPolicyId <refund-policy-guid> --ItemRefundPolicyUpdateDto '{
  "title": "30-Day Full Refund",
  "days": 30,
  "percentage": 100,
  "isEnabled": true
}'

absuite support delete refund-policy --TenantId $TENANT_ID --RefundPolicyId <refund-policy-guid>
```

**DTO fields** (`ItemRefundPolicyCreateDto` / `ItemRefundPolicyUpdateDto`): `title`
(**required** on create), `description`, `isFree`, `reduce`, `isEnabled`, `isDefault`,
`allowInternational`, `hours`, `days`, `weeks`, `months`, `years`, `value`, `percentage`,
`currencyId`, `countryId`, `countryStateId`, `customState`, `customCity`, `cityId`.
(Create also accepts `id`/`timestamp`.)

---

## Return Requests

```bash
absuite support list return-requests --TenantId $TENANT_ID
absuite support count return-requests --TenantId $TENANT_ID
absuite support get return-request --TenantId $TENANT_ID --ReturnRequestId <return-request-guid>

# Create  (title is required)
absuite support create return-request --TenantId $TENANT_ID --ReturnRequestCreateDto '{
  "title": "Wrong item shipped",
  "description": "Received item B instead of item A.",
  "supportEntitlementId": "<entitlement-guid>",
  "contactId": "<contact-guid>",
  "returnPolicyId": "<return-policy-guid>"
}'

absuite support update return-request --TenantId $TENANT_ID --ReturnRequestId <return-request-guid> --ReturnRequestUpdateDto '{
  "title": "Wrong item shipped",
  "approved": true,
  "approvedTimestamp": "2026-06-12T00:00:00Z",
  "returnPolicyId": "<return-policy-guid>"
}'

absuite support delete return-request --TenantId $TENANT_ID --ReturnRequestId <return-request-guid>
```

**Create DTO fields** (`ReturnRequestCreateDto`): `id`, `timestamp`, `title` (**required**),
`description`, `approved`, `approvedTimestamp`, `supportEntitlementId`, `contactId`,
`returnPolicyId`.
**Update DTO fields** (`ReturnRequestUpdateDto`): `title`, `description`, `approved`,
`approvedTimestamp`, `supportEntitlementId`, `returnPolicyId` (no `contactId`).

## Return Policies

```bash
absuite support list return-policies --TenantId $TENANT_ID
absuite support count return-policies --TenantId $TENANT_ID
absuite support get return-policy --TenantId $TENANT_ID --ReturnPolicyId <return-policy-guid>

# Create  (title is required)
absuite support create return-policy --TenantId $TENANT_ID --ItemReturnPolicyCreateDto '{
  "title": "Standard Return Policy",
  "description": "Returns accepted within 14 days, original packaging required.",
  "days": 14,
  "isEnabled": true,
  "shippingCourierId": "<courier-guid>"
}'

absuite support update return-policy --TenantId $TENANT_ID --ReturnPolicyId <return-policy-guid> --ItemReturnPolicyUpdateDto '{
  "title": "Standard Return Policy",
  "days": 14,
  "isEnabled": true
}'

absuite support delete return-policy --TenantId $TENANT_ID --ReturnPolicyId <return-policy-guid>
```

**DTO fields** (`ItemReturnPolicyCreateDto` / `ItemReturnPolicyUpdateDto`): `title`
(**required** on create), `description`, `shippingCourierId`, `isFree`, `reduce`, `isEnabled`,
`isDefault`, `allowInternational`, `hours`, `days`, `weeks`, `months`, `years`, `value`,
`percentage`, `currencyId`, `countryId`, `countryStateId`, `customState`, `customCity`,
`cityId`. (Create also accepts `id`/`timestamp`.)

---

## Warranty Requests

```bash
absuite support list warranty-requests --TenantId $TENANT_ID
absuite support count warranty-requests --TenantId $TENANT_ID
absuite support get warranty-request --TenantId $TENANT_ID --WarrantyRequestId <warranty-request-guid>

# Create  (title is required)
absuite support create warranty-request --TenantId $TENANT_ID --WarrantyRequestCreateDto '{
  "title": "Device stopped charging",
  "description": "Unit stopped charging after 3 months.",
  "supportEntitlementId": "<entitlement-guid>",
  "contactId": "<contact-guid>",
  "warrantyPolicyId": "<warranty-policy-guid>"
}'

absuite support update warranty-request --TenantId $TENANT_ID --WarrantyRequestId <warranty-request-guid> --WarrantyRequestUpdateDto '{
  "title": "Device stopped charging",
  "approved": true,
  "approvedTimestamp": "2026-06-12T00:00:00Z",
  "warrantyPolicyId": "<warranty-policy-guid>"
}'

absuite support delete warranty-request --TenantId $TENANT_ID --WarrantyRequestId <warranty-request-guid>
```

**Create DTO fields** (`WarrantyRequestCreateDto`): `id`, `timestamp`, `title` (**required**),
`description`, `approved`, `approvedTimestamp`, `supportEntitlementId`, `contactId`,
`warrantyPolicyId`.
**Update DTO fields** (`WarrantyRequestUpdateDto`): `title`, `description`, `approved`,
`approvedTimestamp`, `supportEntitlementId`, `warrantyPolicyId` (no `contactId`).

## Warranty Policies

```bash
absuite support list warranty-policies --TenantId $TENANT_ID
absuite support count warranty-policies --TenantId $TENANT_ID
absuite support get warranty-policy --TenantId $TENANT_ID --WarrantyPolicyId <warranty-policy-guid>

# Create  (title is required)
absuite support create warranty-policy --TenantId $TENANT_ID --ItemWarrantyPolicyCreateDto '{
  "title": "1-Year Limited Warranty",
  "description": "Covers manufacturer defects for 12 months from purchase.",
  "isExtendedWarranty": false,
  "months": 12,
  "isEnabled": true
}'

absuite support update warranty-policy --TenantId $TENANT_ID --WarrantyPolicyId <warranty-policy-guid> --ItemWarrantyPolicyUpdateDto '{
  "title": "1-Year Limited Warranty",
  "months": 12,
  "isEnabled": true
}'

absuite support delete warranty-policy --TenantId $TENANT_ID --WarrantyPolicyId <warranty-policy-guid>
```

**DTO fields** (`ItemWarrantyPolicyCreateDto` / `ItemWarrantyPolicyUpdateDto`): `title`
(**required** on create), `description`, `isExtendedWarranty`, `isFree`, `reduce`,
`isEnabled`, `isDefault`, `allowInternational`, `hours`, `days`, `weeks`, `months`, `years`,
`value`, `percentage`, `currencyId`, `countryId`, `countryStateId`, `customState`,
`customCity`, `cityId`. (Create also accepts `id`/`timestamp`.)

---

## Knowledge Articles

```bash
absuite support list knowledge-articles --TenantId $TENANT_ID
absuite support count knowledge-articles --TenantId $TENANT_ID
absuite support get knowledge-article --TenantId $TENANT_ID --KnowledgeArticleId <article-guid>

# Create  (title is required)
absuite support create knowledge-article --TenantId $TENANT_ID --KnowledgeArticleCreateDto '{
  "title": "How to reset your password",
  "slug": "reset-password",
  "excerpt": "Steps to reset your account password.",
  "content": "Navigate to Settings > Security > Reset Password...",
  "published": true,
  "enable": true
}'

absuite support update knowledge-article --TenantId $TENANT_ID --KnowledgeArticleId <article-guid> --KnowledgeArticleUpdateDto '{
  "title": "How to reset your password",
  "content": "Updated steps...",
  "published": true
}'

absuite support delete knowledge-article --TenantId $TENANT_ID --KnowledgeArticleId <article-guid>
```

**DTO fields** (`KnowledgeArticleCreateDto` / `KnowledgeArticleUpdateDto`): `title`
(**required** on create), `slug`, `excerpt`, `description`, `content`, `highlightImage`,
`seoTitle`, `seoKeyWords`, `metaDescription`, `published`, `enable`. (Create also accepts
`id`/`timestamp`.)

---

## Inquiry Requests

```bash
absuite support list inquiry-requests --TenantId $TENANT_ID
absuite support count inquiry-requests --TenantId $TENANT_ID
absuite support get inquiry-request --TenantId $TENANT_ID --InquiryRequestId <inquiry-request-guid>

# Create  (name, email, message are required)
absuite support create inquiry-request --TenantId $TENANT_ID --InquiryRequestCreateDto '{
  "type": "Sales",
  "name": "<first-name>",
  "lastName": "<last-name>",
  "email": "<email>",
  "organizationName": "<org-name>",
  "message": "We would like details on volume licensing.",
  "countryId": "<country-id>",
  "phone": "<phone>"
}'

absuite support update inquiry-request --TenantId $TENANT_ID --InquiryRequestId <inquiry-request-guid> --InquiryRequestUpdateDto '{
  "type": "Sales",
  "message": "Updated: requesting an enterprise quote."
}'

absuite support delete inquiry-request --TenantId $TENANT_ID --InquiryRequestId <inquiry-request-guid>
```

**Create DTO fields** (`InquiryRequestCreateDto`): `id`, `timestamp`, `type`, `name`
(**required**), `lastName`, `email` (**required**), `organizationName`, `jobRole`,
`organizationDomain`, `countryId`, `phone`, `message` (**required**), `socialProfileId`.
**Update DTO fields** (`InquiryRequestUpdateDto`): `type`, `name`, `lastName`, `email`,
`organizationName`, `jobRole`, `organizationDomain`, `countryId`, `phone`, `message`,
`socialProfileId`.

---

## Maintenance Visits

```bash
absuite support list maintenance-visits --TenantId $TENANT_ID
absuite support count maintenance-visits --TenantId $TENANT_ID
absuite support get maintenance-visit --TenantId $TENANT_ID --MaintenanceVisitId <visit-guid>

# Create  (spec exposes only id/timestamp on the create DTO)
absuite support create maintenance-visit --TenantId $TENANT_ID --MaintenanceVisitCreateDto '{
  "id": "<visit-guid>",
  "timestamp": "2026-06-12T10:00:00Z"
}'

# Update  (spec lists no documented update body fields)
absuite support update maintenance-visit --TenantId $TENANT_ID --MaintenanceVisitId <visit-guid> --MaintenanceVisitUpdateDto '{}'

absuite support delete maintenance-visit --TenantId $TENANT_ID --MaintenanceVisitId <visit-guid>
```

> **Note:** the maintenance-visit DTOs are minimal in the spec — create accepts only `id` and
> `timestamp`, and update has no documented fields. Do not invent `description` or
> `scheduledDate` parameters; confirm available params with `absuite support create
> maintenance-visit --help`.

---

## Search

Where a resource supports a `search` verb, pass a query string with `--Query` (confirm the
exact parameter with `--help`):

```bash
absuite support search tickets --TenantId $TENANT_ID --Query "billing portal"
```

If a given entity does not expose `search`, list it and filter client-side, or narrow by ID
via the relational getters (e.g. `get request-tickets`).

---

## CLI Commands Quick Reference

`$TENANT_ID` is the configured default tenant; pass `--TenantId <guid>` to override. Every
command requires a tenant.

| Action | CLI command |
|---|---|
| List tickets | `absuite support list tickets --TenantId $TENANT_ID` |
| Count tickets | `absuite support count tickets --TenantId $TENANT_ID` |
| Get ticket | `absuite support get ticket --TenantId $TENANT_ID --SupportTicketId <guid>` |
| Create ticket | `absuite support create ticket --TenantId $TENANT_ID --SupportTicketCreateDto '{...}'` |
| Update ticket | `absuite support update ticket --TenantId $TENANT_ID --SupportTicketId <guid> --SupportTicketUpdateDto '{...}'` |
| Delete ticket | `absuite support delete ticket --TenantId $TENANT_ID --SupportTicketId <guid>` |
| List ticket conversations | `absuite support get ticket-conversations --TenantId $TENANT_ID --SupportTicketId <guid>` |
| Get ticket conversation | `absuite support get ticket-conversation --TenantId $TENANT_ID --SupportTicketId <guid> --SupportTicketConversationId <guid>` |
| List conversation messages | `absuite support get ticket-conversation-messages --TenantId $TENANT_ID --SupportTicketId <guid> --SupportTicketConversationId <guid> --PageNumber 1 --PageSize 25` |
| Create ticket conversation | `absuite support relate-support-ticket-to-conversation --TenantId $TENANT_ID --SupportTicketId <guid> --SupportTicketConversationCreateDto '{...}'` |
| Delete ticket conversation | `absuite support delete ticket-conversation --TenantId $TENANT_ID --SupportTicketId <guid> --SupportTicketConversationId <guid>` |
| List/Count/Get/Create/Update/Delete priorities | `absuite support <verb> ticket-priority(ies) --TenantId $TENANT_ID [--SupportTicketPriorityId <guid>] [--SupportTicketPriorityCreateDto/UpdateDto '{...}']` |
| List/Count/Get/Create/Update/Delete types | `absuite support <verb> ticket-type(s) --TenantId $TENANT_ID [--SupportTicketTypeId <guid>] [--SupportTicketTypeCreateDto/UpdateDto '{...}']` |
| List requests | `absuite support list requests --TenantId $TENANT_ID` |
| Get/Create/Update/Delete request | `absuite support <verb> request --TenantId $TENANT_ID [--SupportRequestId <guid>] [--SupportRequestCreateDto/UpdateDto '{...}']` |
| List tickets for a request | `absuite support get request-tickets --TenantId $TENANT_ID --SupportRequestId <guid>` |
| List/Count attachments for a request | `absuite support get request-attachments(-count)-by-request --TenantId $TENANT_ID --SupportRequestId <guid>` |
| Get one attachment of a request | `absuite support get request-attachment-by-request --TenantId $TENANT_ID --SupportRequestId <guid> --AttachmentId <guid>` |
| Add attachment to a request | `absuite support relate-support-request-to-attachment --TenantId $TENANT_ID --SupportRequestId <guid> --SupportRequestAttachmentCreateDto '{...}'` |
| List/Count/Get/Create/Update/Delete attachments | `absuite support <verb> request-attachment(s) --TenantId $TENANT_ID [--SupportRequestAttachmentId <guid>] [--SupportRequestAttachmentCreateDto/UpdateDto '{...}']` |
| List/Count/Get/Create/Update/Delete entitlements | `absuite support <verb> entitlement(s) --TenantId $TENANT_ID [--SupportEntitlementId <guid>] [--SupportEntitlementCreateDto/UpdateDto '{...}']` |
| List/Count/Get/Create/Update/Delete refund requests | `absuite support <verb> refund-request(s) --TenantId $TENANT_ID [--RefundRequestId <guid>] [--RefundRequestCreateDto/UpdateDto '{...}']` |
| List/Count/Get/Create/Update/Delete refund policies | `absuite support <verb> refund-polic(y/ies) --TenantId $TENANT_ID [--RefundPolicyId <guid>] [--ItemRefundPolicyCreateDto/UpdateDto '{...}']` |
| List/Count/Get/Create/Update/Delete return requests | `absuite support <verb> return-request(s) --TenantId $TENANT_ID [--ReturnRequestId <guid>] [--ReturnRequestCreateDto/UpdateDto '{...}']` |
| List/Count/Get/Create/Update/Delete return policies | `absuite support <verb> return-polic(y/ies) --TenantId $TENANT_ID [--ReturnPolicyId <guid>] [--ItemReturnPolicyCreateDto/UpdateDto '{...}']` |
| List/Count/Get/Create/Update/Delete warranty requests | `absuite support <verb> warranty-request(s) --TenantId $TENANT_ID [--WarrantyRequestId <guid>] [--WarrantyRequestCreateDto/UpdateDto '{...}']` |
| List/Count/Get/Create/Update/Delete warranty policies | `absuite support <verb> warranty-polic(y/ies) --TenantId $TENANT_ID [--WarrantyPolicyId <guid>] [--ItemWarrantyPolicyCreateDto/UpdateDto '{...}']` |
| List/Count/Get/Create/Update/Delete knowledge articles | `absuite support <verb> knowledge-article(s) --TenantId $TENANT_ID [--KnowledgeArticleId <guid>] [--KnowledgeArticleCreateDto/UpdateDto '{...}']` |
| List/Count/Get/Create/Update/Delete inquiry requests | `absuite support <verb> inquiry-request(s) --TenantId $TENANT_ID [--InquiryRequestId <guid>] [--InquiryRequestCreateDto/UpdateDto '{...}']` |
| List/Count/Get/Create/Update/Delete maintenance visits | `absuite support <verb> maintenance-visit(s) --TenantId $TENANT_ID [--MaintenanceVisitId <guid>] [--MaintenanceVisitCreateDto/UpdateDto '{...}']` |

---

## Critical Rules

- **Authenticate first** (`absuite login`) and ensure a tenant is set (config default or
  `--TenantId`). Every `support` command is tenant-scoped.
- **Set up priorities, types, and entitlements first**, then create tickets that reference them.
- **Pass DTO params as single-quoted JSON** using the REST field names shown above.
- **No PATCH here.** For atomic partial updates (JSON Patch / RFC 6902) or raw HTTP, use the
  `absuite-support` (REST) skill.
- **When unsure of a verb/entity alias or parameter name**, run `absuite support list-commands`
  and `absuite support <command> --help` rather than guessing.
- For shared CLI conventions and authentication, see `absuite-cli` and `absuite-login-cli`.
