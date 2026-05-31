---
name: absuite-subscriptions
description: >
  Manage subscriptions and subscription plans in the Alliance Business Suite (ABS)
  using the `absuite` CLI. Covers creating and managing recurring subscription plans,
  customer subscriptions, and subscription lifecycle. Requires an authenticated CLI session.
---

# Alliance Business Suite — Subscriptions Skill

Manage subscriptions through the `absuite` CLI's `subscriptions` service. All operations are tenant-scoped.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite subscriptions list-commands`

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

## Subscription Plans

Define the plans that customers can subscribe to.

```bash
# List
absuite subscriptions list plans --TenantId $TENANT_ID

# Count
absuite subscriptions count plans --TenantId $TENANT_ID

# Get by ID
absuite subscriptions get plan --TenantId $TENANT_ID --SubscriptionPlanId <plan-guid>

# Create
absuite subscriptions create plan --TenantId $TENANT_ID --SubscriptionPlanCreateDto '{
  "Name": "Professional Monthly",
  "Description": "Professional tier with all features, billed monthly",
  "Price": 49.99,
  "BillingInterval": "Monthly"
}'

# Update
absuite subscriptions update plan --TenantId $TENANT_ID --SubscriptionPlanId <plan-guid> --SubscriptionPlanUpdateDto '{...}'

# Delete
absuite subscriptions delete plan --TenantId $TENANT_ID --SubscriptionPlanId <plan-guid>
```

**REST API equivalents:**
```bash
# List subscription plans
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count subscription plans
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get subscription plan by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans/<plan-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create subscription plan
curl -X POST "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Professional Monthly","description":"Professional tier","price":49.99,"billingInterval":"Monthly"}'

# Update subscription plan
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans/<plan-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete subscription plan
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans/<plan-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Subscriptions

Manage individual customer subscriptions.

```bash
# List
absuite subscriptions list --TenantId $TENANT_ID

# Count
absuite subscriptions count --TenantId $TENANT_ID

# Get by ID
absuite subscriptions get --TenantId $TENANT_ID --SubscriptionId <sub-guid>

# Create
absuite subscriptions create --TenantId $TENANT_ID --SubscriptionCreateDto '{
  "IndividualId": "<contact-guid>",
  "SubscriptionPlanId": "<plan-guid>",
  "SubscriptionClass": "Individual"
}'

# Update
absuite subscriptions update --TenantId $TENANT_ID --SubscriptionId <sub-guid> --SubscriptionUpdateDto '{...}'

# Delete
absuite subscriptions delete --TenantId $TENANT_ID --SubscriptionId <sub-guid>
```

**Key SubscriptionCreateDto fields:**

| Field | Type | Description |
|---|---|---|
| `IndividualId` | String | Customer contact (individual) |
| `OrganizationId` | String | Customer contact (organization) |
| `SubscriptionPlanId` | String | Plan to subscribe to |
| `SubscriptionClass` | String | `Individual` or `Organization` |

**REST API equivalents:**
```bash
# List subscriptions
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count subscriptions
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get subscription by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions/<sub-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create subscription
curl -X POST "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"individualId":"<contact-guid>","subscriptionPlanId":"<plan-guid>","subscriptionClass":"Individual"}'

# Update subscription
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions/<sub-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete subscription
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions/<sub-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List plans | `absuite subscriptions list plans --TenantId <guid>` |
| Create plan | `absuite subscriptions create plan --TenantId <guid> --SubscriptionPlanCreateDto '{...}'` |
| List subscriptions | `absuite subscriptions list --TenantId <guid>` |
| Create subscription | `absuite subscriptions create --TenantId <guid> --SubscriptionCreateDto '{...}'` |
| Get subscription | `absuite subscriptions get --TenantId <guid> --SubscriptionId <guid>` |
| Count subscriptions | `absuite subscriptions count --TenantId <guid>` |

## Full Example: Set Up & Subscribe

```bash
# 1. Create a plan
absuite subscriptions create plan --SubscriptionPlanCreateDto '{
  "Name": "Starter Monthly",
  "Price": 19.99,
  "BillingInterval": "Monthly"
}'

# 2. Subscribe a customer
absuite subscriptions create --SubscriptionCreateDto '{
  "IndividualId": "<contact-guid>",
  "SubscriptionPlanId": "<plan-guid>",
  "SubscriptionClass": "Individual"
}'

# 3. Check subscriptions
absuite subscriptions list
```

**REST API equivalents:**
```bash
# 1. Create a plan
curl -X POST "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Starter Monthly","price":19.99,"billingInterval":"Monthly"}'

# 2. Subscribe a customer
curl -X POST "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"individualId":"<contact-guid>","subscriptionPlanId":"<plan-guid>","subscriptionClass":"Individual"}'

# 3. Check subscriptions
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v2/SubscriptionsService/Subscriptions` | Create a subscription |
| GET | `/api/v2/SubscriptionsService/Subscriptions` | List subscriptions |
| DELETE | `/api/v2/SubscriptionsService/Subscriptions/:subscriptionId` | Delete a subscription |
| GET | `/api/v2/SubscriptionsService/Subscriptions/:subscriptionId` | Get subscription by ID |
| PUT | `/api/v2/SubscriptionsService/Subscriptions/:subscriptionId` | Update a subscription |
| GET | `/api/v2/SubscriptionsService/Subscriptions/Count` | Count subscriptions |
| POST | `/api/v2/SubscriptionsService/SubscriptionPlans` | Create a subscription plan |
| GET | `/api/v2/SubscriptionsService/SubscriptionPlans` | List subscription plans |
| DELETE | `/api/v2/SubscriptionsService/SubscriptionPlans/:subscriptionPlanId` | Delete a subscription plan |
| GET | `/api/v2/SubscriptionsService/SubscriptionPlans/:subscriptionPlanId` | Get subscription plan by ID |
| PUT | `/api/v2/SubscriptionsService/SubscriptionPlans/:subscriptionPlanId` | Update a subscription plan |
| GET | `/api/v2/SubscriptionsService/SubscriptionPlans/Count` | Count subscription plans |

## Critical Rules

- **Authenticate first.** Always provide a tenant context.
- **Create plans first** before subscribing customers.
- **SubscriptionClass** must match the contact type — `Individual` for persons, `Organization` for companies.
