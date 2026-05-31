---
name: absuite-support
description: >
  Manage customer support tickets, support requests, request attachments, ticket
  conversations, ticket priorities, ticket types, and support entitlements in the
  Alliance Business Suite (ABS) using the `absuite` CLI. Requires an authenticated
  CLI session.
---

# Alliance Business Suite — Support Skill

Manage customer support through the `absuite` CLI's `support` service. All operations are tenant-scoped.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite support list-commands`

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
  "Description": "Cannot access billing portal",
  "ContactID": "<contact-guid>",
  "SupportTicketTypeID": "<type-guid>",
  "SupportPriorityID": "<priority-guid>",
  "SupportEntitlementID": "<entitlement-guid>"
}'

# Update
absuite support update ticket --TenantId $TENANT_ID --SupportTicketId <ticket-guid> --SupportTicketUpdateDto '{...}'

# Delete
absuite support delete ticket --TenantId $TENANT_ID --SupportTicketId <ticket-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Description": "Cannot access billing portal",
    "ContactID": "<contact-guid>",
    "SupportTicketTypeID": "<type-guid>",
    "SupportPriorityID": "<priority-guid>",
    "SupportEntitlementID": "<entitlement-guid>"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Ticket Conversations

```bash
# List conversations for a ticket
absuite support list ticket-conversations --TenantId $TENANT_ID --SupportTicketId <ticket-guid>

# Get a specific conversation
absuite support get ticket-conversation --TenantId $TENANT_ID --SupportTicketId <ticket-guid> --ConversationId <conv-guid>

# Create a conversation on a ticket
absuite support relate-support-ticket-to-conversation --TenantId $TENANT_ID --SupportTicketId <ticket-guid> --ConversationCreateDto '{...}'

# List messages in a conversation
absuite support list ticket-conversation-messages --TenantId $TENANT_ID --ConversationId <conv-guid>

# Delete a conversation
absuite support delete ticket-conversation --TenantId $TENANT_ID --SupportTicketId <ticket-guid> --ConversationId <conv-guid>
```

**REST API equivalents:**

```bash
# List conversations for a ticket
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>/Conversations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a specific conversation
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>/Conversations/<conv-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a conversation on a ticket
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>/Conversations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# List messages in a conversation
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>/Conversations/<conv-guid>/Messages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Delete a conversation
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTickets/<ticket-guid>/Conversations/<conv-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Ticket Priorities

```bash
absuite support list ticket-priorities --TenantId $TENANT_ID
absuite support count ticket-priorities --TenantId $TENANT_ID
absuite support get ticket-priority --TenantId $TENANT_ID --SupportTicketPriorityId <priority-guid>
absuite support create ticket-priority --TenantId $TENANT_ID --SupportTicketPriorityCreateDto '{
  "Name": "Critical",
  "Description": "System-down or data-loss scenarios"
}'
absuite support update ticket-priority --TenantId $TENANT_ID --SupportTicketPriorityId <priority-guid> --SupportTicketPriorityUpdateDto '{...}'
absuite support delete ticket-priority --TenantId $TENANT_ID --SupportTicketPriorityId <priority-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities/<priority-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Critical",
    "Description": "System-down or data-loss scenarios"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities/<priority-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketPriorities/<priority-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Ticket Types

```bash
absuite support list ticket-types --TenantId $TENANT_ID
absuite support count ticket-types --TenantId $TENANT_ID
absuite support get ticket-type --TenantId $TENANT_ID --SupportTicketTypeId <type-guid>
absuite support create ticket-type --TenantId $TENANT_ID --SupportTicketTypeCreateDto '{
  "Name": "Bug Report",
  "Description": "Software defect or error"
}'
absuite support update ticket-type --TenantId $TENANT_ID --SupportTicketTypeId <type-guid> --SupportTicketTypeUpdateDto '{...}'
absuite support delete ticket-type --TenantId $TENANT_ID --SupportTicketTypeId <type-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Bug Report",
    "Description": "Software defect or error"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportTicketTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Support Requests

```bash
# List
absuite support list requests --TenantId $TENANT_ID

# Count
absuite support count requests --TenantId $TENANT_ID

# Get by ID
absuite support get request --TenantId $TENANT_ID --SupportRequestId <request-guid>

# Create
absuite support create request --TenantId $TENANT_ID --SupportRequestCreateDto '{
  "Description": "Need assistance with invoice reconciliation"
}'

# Update
absuite support update request --TenantId $TENANT_ID --SupportRequestId <request-guid> --SupportRequestUpdateDto '{...}'

# Delete
absuite support delete request --TenantId $TENANT_ID --SupportRequestId <request-guid>

# List tickets for a request
absuite support list request-tickets --TenantId $TENANT_ID --SupportRequestId <request-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Description": "Need assistance with invoice reconciliation"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List tickets for a request
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Tickets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Attachments for a specific request
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Attachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create attachment for a request
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Attachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Count attachments for a request
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Attachments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Request Attachments

```bash
# List all
absuite support list request-attachments --TenantId $TENANT_ID

# Count
absuite support count request-attachments --TenantId $TENANT_ID

# Get by ID
absuite support get request-attachment --TenantId $TENANT_ID --SupportRequestAttachmentId <attachment-guid>

# Get attachments for a request
absuite support get request-attachments-by-request --TenantId $TENANT_ID --SupportRequestId <request-guid>
absuite support get request-attachments-count-by-request --TenantId $TENANT_ID --SupportRequestId <request-guid>
absuite support get request-attachment-by-request --TenantId $TENANT_ID --SupportRequestId <request-guid> --SupportRequestAttachmentId <attachment-guid>

# Create
absuite support create request-attachment --TenantId $TENANT_ID --SupportRequestAttachmentCreateDto '{...}'

# Relate attachment to request
absuite support relate-support-request-to-attachment --TenantId $TENANT_ID --SupportRequestId <request-guid> --SupportRequestAttachmentId <attachment-guid>

# Update
absuite support update request-attachment --TenantId $TENANT_ID --SupportRequestAttachmentId <attachment-guid> --SupportRequestAttachmentUpdateDto '{...}'

# Delete
absuite support delete request-attachment --TenantId $TENANT_ID --SupportRequestAttachmentId <attachment-guid>
```

**REST API equivalents:**

```bash
# List all
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get attachments for a request
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Attachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get attachment count for a request
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Attachments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a specific attachment for a request
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Attachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Relate attachment to request
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequests/<request-guid>/Attachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"SupportRequestAttachmentId": "<attachment-guid>"}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportRequestAttachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Support Entitlements

Define what level of support a customer is entitled to.

```bash
# List
absuite support list entitlements --TenantId $TENANT_ID

# Count
absuite support count entitlements --TenantId $TENANT_ID

# Get by ID
absuite support get entitlement --TenantId $TENANT_ID --SupportEntitlementId <entitlement-guid>

# Create
absuite support create entitlement --TenantId $TENANT_ID --SupportEntitlementCreateDto '{
  "Name": "Premium Support",
  "Description": "24/7 support with 1-hour SLA"
}'

# Update
absuite support update entitlement --TenantId $TENANT_ID --SupportEntitlementId <entitlement-guid> --SupportEntitlementUpdateDto '{...}'

# Delete
absuite support delete entitlement --TenantId $TENANT_ID --SupportEntitlementId <entitlement-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements/<entitlement-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Premium Support",
    "Description": "24/7 support with 1-hour SLA"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements/<entitlement-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/SupportEntitlements/<entitlement-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Refund Requests

Manage customer refund requests.

```bash
# List
absuite support list refund-requests --TenantId $TENANT_ID

# Count
absuite support count refund-requests --TenantId $TENANT_ID

# Get by ID
absuite support get refund-request --TenantId $TENANT_ID --RefundRequestId <refund-request-guid>

# Create
absuite support create refund-request --TenantId $TENANT_ID --RefundRequestCreateDto '{
  "Reason": "Product arrived damaged",
  "Amount": 49.99
}'

# Update
absuite support update refund-request --TenantId $TENANT_ID --RefundRequestId <refund-request-guid> --RefundRequestUpdateDto '{...}'

# Delete
absuite support delete refund-request --TenantId $TENANT_ID --RefundRequestId <refund-request-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests/<refund-request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Reason": "Product arrived damaged",
    "Amount": 49.99
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests/<refund-request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/RefundRequests/<refund-request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Refund Policies

Define the rules governing when and how refunds are issued.

```bash
# List
absuite support list refund-policies --TenantId $TENANT_ID

# Count
absuite support count refund-policies --TenantId $TENANT_ID

# Get by ID
absuite support get refund-policy --TenantId $TENANT_ID --RefundPolicyId <refund-policy-guid>

# Create
absuite support create refund-policy --TenantId $TENANT_ID --RefundPolicyCreateDto '{
  "Name": "30-Day Full Refund",
  "Description": "Full refund within 30 days of purchase"
}'

# Update
absuite support update refund-policy --TenantId $TENANT_ID --RefundPolicyId <refund-policy-guid> --RefundPolicyUpdateDto '{...}'

# Delete
absuite support delete refund-policy --TenantId $TENANT_ID --RefundPolicyId <refund-policy-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies/<refund-policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "30-Day Full Refund",
    "Description": "Full refund within 30 days of purchase"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies/<refund-policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/RefundPolicies/<refund-policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Knowledge Articles

Manage self-service knowledge base articles for customer support.

```bash
# List
absuite support list knowledge-articles --TenantId $TENANT_ID

# Count
absuite support count knowledge-articles --TenantId $TENANT_ID

# Get by ID
absuite support get knowledge-article --TenantId $TENANT_ID --KnowledgeArticleId <article-guid>

# Create
absuite support create knowledge-article --TenantId $TENANT_ID --KnowledgeArticleCreateDto '{
  "Title": "How to reset your password",
  "Content": "Navigate to Settings > Security > Reset Password..."
}'

# Update
absuite support update knowledge-article --TenantId $TENANT_ID --KnowledgeArticleId <article-guid> --KnowledgeArticleUpdateDto '{...}'

# Delete
absuite support delete knowledge-article --TenantId $TENANT_ID --KnowledgeArticleId <article-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles/<article-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "How to reset your password",
    "Content": "Navigate to Settings > Security > Reset Password..."
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles/<article-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/KnowledgeArticles/<article-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Warranty Requests

Manage warranty claim requests from customers.

```bash
# List
absuite support list warranty-requests --TenantId $TENANT_ID

# Count
absuite support count warranty-requests --TenantId $TENANT_ID

# Get by ID
absuite support get warranty-request --TenantId $TENANT_ID --WarrantyRequestId <warranty-request-guid>

# Create
absuite support create warranty-request --TenantId $TENANT_ID --WarrantyRequestCreateDto '{
  "Description": "Device stopped charging after 3 months"
}'

# Update
absuite support update warranty-request --TenantId $TENANT_ID --WarrantyRequestId <warranty-request-guid> --WarrantyRequestUpdateDto '{...}'

# Delete
absuite support delete warranty-request --TenantId $TENANT_ID --WarrantyRequestId <warranty-request-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests/<warranty-request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Description": "Device stopped charging after 3 months"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests/<warranty-request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyRequests/<warranty-request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Warranty Policies

Define the warranty terms and conditions for products or services.

```bash
# List
absuite support list warranty-policies --TenantId $TENANT_ID

# Count
absuite support count warranty-policies --TenantId $TENANT_ID

# Get by ID
absuite support get warranty-policy --TenantId $TENANT_ID --WarrantyPolicyId <warranty-policy-guid>

# Create
absuite support create warranty-policy --TenantId $TENANT_ID --WarrantyPolicyCreateDto '{
  "Name": "1-Year Limited Warranty",
  "Description": "Covers manufacturer defects for 12 months from purchase"
}'

# Update
absuite support update warranty-policy --TenantId $TENANT_ID --WarrantyPolicyId <warranty-policy-guid> --WarrantyPolicyUpdateDto '{...}'

# Delete
absuite support delete warranty-policy --TenantId $TENANT_ID --WarrantyPolicyId <warranty-policy-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies/<warranty-policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "1-Year Limited Warranty",
    "Description": "Covers manufacturer defects for 12 months from purchase"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies/<warranty-policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/WarrantyPolicies/<warranty-policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Return Requests

Manage product return requests from customers.

```bash
# List
absuite support list return-requests --TenantId $TENANT_ID

# Count
absuite support count return-requests --TenantId $TENANT_ID

# Get by ID
absuite support get return-request --TenantId $TENANT_ID --ReturnRequestId <return-request-guid>

# Create
absuite support create return-request --TenantId $TENANT_ID --ReturnRequestCreateDto '{
  "Reason": "Wrong item shipped"
}'

# Update
absuite support update return-request --TenantId $TENANT_ID --ReturnRequestId <return-request-guid> --ReturnRequestUpdateDto '{...}'

# Delete
absuite support delete return-request --TenantId $TENANT_ID --ReturnRequestId <return-request-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests/<return-request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Reason": "Wrong item shipped"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests/<return-request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnRequests/<return-request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Return Policies

Define the rules governing product returns.

```bash
# List
absuite support list return-policies --TenantId $TENANT_ID

# Count
absuite support count return-policies --TenantId $TENANT_ID

# Get by ID
absuite support get return-policy --TenantId $TENANT_ID --ReturnPolicyId <return-policy-guid>

# Create
absuite support create return-policy --TenantId $TENANT_ID --ReturnPolicyCreateDto '{
  "Name": "Standard Return Policy",
  "Description": "Returns accepted within 14 days, original packaging required"
}'

# Update
absuite support update return-policy --TenantId $TENANT_ID --ReturnPolicyId <return-policy-guid> --ReturnPolicyUpdateDto '{...}'

# Delete
absuite support delete return-policy --TenantId $TENANT_ID --ReturnPolicyId <return-policy-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies/<return-policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Standard Return Policy",
    "Description": "Returns accepted within 14 days, original packaging required"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies/<return-policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/ReturnPolicies/<return-policy-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Inquiry Requests

Manage general inquiry requests from customers.

```bash
# List
absuite support list inquiry-requests --TenantId $TENANT_ID

# Count
absuite support count inquiry-requests --TenantId $TENANT_ID

# Get by ID
absuite support get inquiry-request --TenantId $TENANT_ID --InquiryRequestId <inquiry-request-guid>

# Create
absuite support create inquiry-request --TenantId $TENANT_ID --InquiryRequestCreateDto '{
  "Subject": "Pricing for enterprise plan",
  "Description": "We would like details on volume licensing"
}'

# Update
absuite support update inquiry-request --TenantId $TENANT_ID --InquiryRequestId <inquiry-request-guid> --InquiryRequestUpdateDto '{...}'

# Delete
absuite support delete inquiry-request --TenantId $TENANT_ID --InquiryRequestId <inquiry-request-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests/<inquiry-request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Subject": "Pricing for enterprise plan",
    "Description": "We would like details on volume licensing"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests/<inquiry-request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/InquiryRequests/<inquiry-request-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Maintenance Visits

Schedule and manage on-site or remote maintenance visits.

```bash
# List
absuite support list maintenance-visits --TenantId $TENANT_ID

# Count
absuite support count maintenance-visits --TenantId $TENANT_ID

# Get by ID
absuite support get maintenance-visit --TenantId $TENANT_ID --MaintenanceVisitId <visit-guid>

# Create
absuite support create maintenance-visit --TenantId $TENANT_ID --MaintenanceVisitCreateDto '{
  "Description": "Quarterly server maintenance",
  "ScheduledDate": "2025-03-15T10:00:00Z"
}'

# Update
absuite support update maintenance-visit --TenantId $TENANT_ID --MaintenanceVisitId <visit-guid> --MaintenanceVisitUpdateDto '{...}'

# Delete
absuite support delete maintenance-visit --TenantId $TENANT_ID --MaintenanceVisitId <visit-guid>
```

**REST API equivalents:**

```bash
# List
curl "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits/<visit-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Description": "Quarterly server maintenance",
    "ScheduledDate": "2025-03-15T10:00:00Z"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits/<visit-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SupportService/MaintenanceVisits/<visit-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List tickets | `absuite support list tickets --TenantId <guid>` |
| Create ticket | `absuite support create ticket --TenantId <guid> --SupportTicketCreateDto '{...}'` |
| List conversations | `absuite support list ticket-conversations --TenantId <guid> --SupportTicketId <guid>` |
| List requests | `absuite support list requests --TenantId <guid>` |
| Create request | `absuite support create request --TenantId <guid> --SupportRequestCreateDto '{...}'` |
| List priorities | `absuite support list ticket-priorities --TenantId <guid>` |
| List types | `absuite support list ticket-types --TenantId <guid>` |
| List entitlements | `absuite support list entitlements --TenantId <guid>` |

## API Endpoints Quick Reference

All endpoints are relative to `$ABSUITE_HOST_URL/api/v2/SupportService/`.

| Resource | POST | GET (list) | GET (by ID) | PUT | DELETE | GET Count |
|---|---|---|---|---|---|---|
| SupportTickets | `POST /SupportTickets` | `GET /SupportTickets` | `GET /SupportTickets/:id` | `PUT /SupportTickets/:id` | `DELETE /SupportTickets/:id` | `GET /SupportTickets/Count` |
| Ticket Conversations | `POST /SupportTickets/:id/Conversations` | `GET /SupportTickets/:id/Conversations` | `GET /SupportTickets/:id/Conversations/:convId` | — | `DELETE /SupportTickets/:id/Conversations/:convId` | — |
| Conversation Messages | — | `GET /SupportTickets/:id/Conversations/:convId/Messages` | — | — | — | — |
| SupportTicketPriorities | `POST /SupportTicketPriorities` | `GET /SupportTicketPriorities` | `GET /SupportTicketPriorities/:id` | `PUT /SupportTicketPriorities/:id` | `DELETE /SupportTicketPriorities/:id` | `GET /SupportTicketPriorities/Count` |
| SupportTicketTypes | `POST /SupportTicketTypes` | `GET /SupportTicketTypes` | `GET /SupportTicketTypes/:id` | `PUT /SupportTicketTypes/:id` | `DELETE /SupportTicketTypes/:id` | `GET /SupportTicketTypes/Count` |
| SupportRequests | `POST /SupportRequests` | `GET /SupportRequests` | `GET /SupportRequests/:id` | `PUT /SupportRequests/:id` | `DELETE /SupportRequests/:id` | `GET /SupportRequests/Count` |
| Request Attachments | `POST /SupportRequestAttachments` | `GET /SupportRequestAttachments` | `GET /SupportRequestAttachments/:id` | `PUT /SupportRequestAttachments/:id` | `DELETE /SupportRequestAttachments/:id` | `GET /SupportRequestAttachments/Count` |
| Request → Attachments | `POST /SupportRequests/:id/Attachments` | `GET /SupportRequests/:id/Attachments` | `GET /SupportRequests/:id/Attachments/:attId` | — | — | `GET /SupportRequests/:id/Attachments/Count` |
| Request → Tickets | — | `GET /SupportRequests/:id/Tickets` | — | — | — | — |
| SupportEntitlements | `POST /SupportEntitlements` | `GET /SupportEntitlements` | `GET /SupportEntitlements/:id` | `PUT /SupportEntitlements/:id` | `DELETE /SupportEntitlements/:id` | `GET /SupportEntitlements/Count` |
| RefundRequests | `POST /RefundRequests` | `GET /RefundRequests` | `GET /RefundRequests/:id` | `PUT /RefundRequests/:id` | `DELETE /RefundRequests/:id` | `GET /RefundRequests/Count` |
| RefundPolicies | `POST /RefundPolicies` | `GET /RefundPolicies` | `GET /RefundPolicies/:id` | `PUT /RefundPolicies/:id` | `DELETE /RefundPolicies/:id` | `GET /RefundPolicies/Count` |
| ReturnRequests | `POST /ReturnRequests` | `GET /ReturnRequests` | `GET /ReturnRequests/:id` | `PUT /ReturnRequests/:id` | `DELETE /ReturnRequests/:id` | `GET /ReturnRequests/Count` |
| ReturnPolicies | `POST /ReturnPolicies` | `GET /ReturnPolicies` | `GET /ReturnPolicies/:id` | `PUT /ReturnPolicies/:id` | `DELETE /ReturnPolicies/:id` | `GET /ReturnPolicies/Count` |
| WarrantyRequests | `POST /WarrantyRequests` | `GET /WarrantyRequests` | `GET /WarrantyRequests/:id` | `PUT /WarrantyRequests/:id` | `DELETE /WarrantyRequests/:id` | `GET /WarrantyRequests/Count` |
| WarrantyPolicies | `POST /WarrantyPolicies` | `GET /WarrantyPolicies` | `GET /WarrantyPolicies/:id` | `PUT /WarrantyPolicies/:id` | `DELETE /WarrantyPolicies/:id` | `GET /WarrantyPolicies/Count` |
| KnowledgeArticles | `POST /KnowledgeArticles` | `GET /KnowledgeArticles` | `GET /KnowledgeArticles/:id` | `PUT /KnowledgeArticles/:id` | `DELETE /KnowledgeArticles/:id` | `GET /KnowledgeArticles/Count` |
| InquiryRequests | `POST /InquiryRequests` | `GET /InquiryRequests` | `GET /InquiryRequests/:id` | `PUT /InquiryRequests/:id` | `DELETE /InquiryRequests/:id` | `GET /InquiryRequests/Count` |
| MaintenanceVisits | `POST /MaintenanceVisits` | `GET /MaintenanceVisits` | `GET /MaintenanceVisits/:id` | `PUT /MaintenanceVisits/:id` | `DELETE /MaintenanceVisits/:id` | `GET /MaintenanceVisits/Count` |

## Critical Rules

- **Authenticate first.** Always provide a tenant context.
- **Set up priorities, types, and entitlements first** before creating tickets.
- **Use conversations on tickets** for threaded discussion with customers.
- **REST and CLI are interchangeable.** Every CLI command maps to a REST endpoint under `/api/v2/SupportService/`.
