---
name: absuite-subscriptions-cli
description: >
  Manage subscription plans and customer subscriptions using the `absuite` CLI.
  Covers subscription plans and subscriptions via list/count/get/create/update/delete
  commands. Requires an authenticated CLI session (see absuite-login-cli). For atomic
  PATCH updates or raw HTTP, use the absuite-subscriptions (REST) skill.
---

# Alliance Business Suite — Subscriptions Skill (CLI)

Manage subscriptions through the `absuite` CLI's `subscriptions` service. The service exposes two resources — **subscription plans** (recurring offerings) and **subscriptions** (a customer bound to a plan). All operations are **tenant-scoped**.

> The `absuite` CLI does not support PATCH (partial / JSON Patch) updates. For atomic partial updates or raw HTTP, use the `absuite-subscriptions` (REST) skill. For login and session setup, see `absuite-login-cli`. For general CLI conventions, see `absuite-cli`.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-subscriptions` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-subscriptions` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first:** `absuite login` (see `absuite-login-cli`).
2. **Set your tenant** once, or pass it per call:
   - `absuite config set --tenant-id <tenant-guid>` (then commands use `$TENANT_ID` implicitly), **or**
   - pass `--TenantId <tenant-guid>` on every command.
   - `tenantId` is **required** for every subscriptions command.
3. **Discover commands:**
   - `absuite subscriptions list-commands`
   - `absuite subscriptions <verb> <entity> --help`

## Command Structure

```
absuite subscriptions <verb> <entity> --Param value
```

- **Service token:** `subscriptions`
- **Verbs:** `list`, `count`, `get`, `create`, `update`, `delete`
- **Entities:** `plan` / `plans` (subscription plans), `subscription` / `subscriptions` (subscriptions)
- The canonical SDK function-name form also works, e.g. `absuite subscriptions Get-SubscriptionsAsync`, `absuite subscriptions New-SubscriptionPlanAsync`.
- JSON DTO parameters are passed as a single-quoted JSON string whose field names match the API schema (camelCase or PascalCase both bind).

Optional on any command: `--ApiVersion <v>` and `--XApiVersion <v>`.

---

## Subscription Plans

Define the plans that customers can subscribe to. A plan is an Item-shaped catalog record; most fields are optional, plus subscription-specific metadata (`Recurrency`, `AllowSubscriptionTrials`, `IsPerpetualSubscription`, trial/standard expiration days, `SubscriptionsCertificateId`).

```bash
# List
absuite subscriptions list plans --TenantId $TENANT_ID

# Count
absuite subscriptions count plans --TenantId $TENANT_ID

# Get by ID (note: the plan path/param is PlanId)
absuite subscriptions get plan --TenantId $TENANT_ID --PlanId <plan-guid>

# Create
absuite subscriptions create plan --TenantId $TENANT_ID --SubscriptionPlanCreateDto '{
  "name": "Professional Monthly",
  "title": "Professional Monthly",
  "summary": "Professional tier billed monthly",
  "description": "Full feature access, recurring monthly.",
  "currencyId": "<currency-guid>",
  "regularPrice": 49.99,
  "finalPrice": 49.99,
  "taxable": true,
  "published": true,
  "recurrency": 1,
  "allowSubscriptionTrials": true,
  "isPerpetualSubscription": false,
  "trialSubscriptionRelativeExpirationInDays": 14,
  "standardSubscriptionRelativeExpirationInDays": 30,
  "subscriptionsCertificateId": "<certificate-guid>"
}'

# Update (full replace; SubscriptionPlanUpdateDto)
absuite subscriptions update plan --TenantId $TENANT_ID --PlanId <plan-guid> --SubscriptionPlanUpdateDto '{
  "name": "Professional Monthly",
  "regularPrice": 54.99,
  "finalPrice": 54.99,
  "published": true,
  "allowSubscriptionTrials": false,
  "standardSubscriptionRelativeExpirationInDays": 30
}'

# Delete
absuite subscriptions delete plan --TenantId $TENANT_ID --PlanId <plan-guid>
```

**Selected `SubscriptionPlanCreateDto` fields** (all optional; many additional catalog/item fields are available — discover them with `--help`):

| Field | Type | Description |
|---|---|---|
| `name` / `title` | String | Plan name / display title |
| `summary` / `description` / `shortDescription` | String | Copy fields |
| `currencyId` | String | Pricing currency |
| `regularPrice` / `finalPrice` / `discountPrice` | Number | Pricing |
| `taxable` / `published` / `featured` | Boolean | Catalog flags |
| `recurrency` | Number | Billing recurrence value |
| `allowSubscriptionTrials` | Boolean | Whether trials are offered |
| `isPerpetualSubscription` | Boolean | Non-expiring subscription |
| `trialSubscriptionRelativeExpirationInDays` | Integer | Trial length in days |
| `standardSubscriptionRelativeExpirationInDays` | Integer | Standard term length in days |
| `subscriptionsCertificateId` | String | Linked certificate |

---

## Subscriptions

Manage individual customer subscriptions. Bind the customer via **either** `individualId` (person) **or** `organizationId` (company), reference a plan with `subscriptionPlanId`, and pick the tier with `subscriptionClass`.

```bash
# List
absuite subscriptions list --TenantId $TENANT_ID

# Count
absuite subscriptions count --TenantId $TENANT_ID

# Get by ID
absuite subscriptions get --TenantId $TENANT_ID --SubscriptionId <sub-guid>

# Create
absuite subscriptions create --TenantId $TENANT_ID --SubscriptionCreateDto '{
  "individualId": "<contact-guid>",
  "subscriptionPlanId": "<plan-guid>",
  "subscriptionClass": "Standard"
}'

# Update (full replace; SubscriptionUpdateDto)
absuite subscriptions update --TenantId $TENANT_ID --SubscriptionId <sub-guid> --SubscriptionUpdateDto '{
  "individualId": "<contact-guid>",
  "subscriptionPlanId": "<plan-guid>",
  "subscriptionClass": "Standard"
}'

# Delete
absuite subscriptions delete --TenantId $TENANT_ID --SubscriptionId <sub-guid>
```

**`SubscriptionCreateDto` / `SubscriptionUpdateDto` fields:**

| Field | Type | Description |
|---|---|---|
| `id` | String | Optional client-supplied ID |
| `timestamp` | String | Optional |
| `individualId` | String | Person contact (individual customer) |
| `organizationId` | String | Organization contact (company customer) |
| `subscriptionPlanId` | String | Plan to subscribe to |
| `subscriptionClass` | String (enum) | `Trial` or `Standard` |

---

## Full Example: Set Up & Subscribe

```bash
# 1. Create a plan
absuite subscriptions create plan --TenantId $TENANT_ID --SubscriptionPlanCreateDto '{
  "name": "Starter Monthly",
  "currencyId": "<currency-guid>",
  "regularPrice": 19.99,
  "finalPrice": 19.99,
  "recurrency": 1,
  "allowSubscriptionTrials": true,
  "trialSubscriptionRelativeExpirationInDays": 14,
  "standardSubscriptionRelativeExpirationInDays": 30
}'

# 2. Subscribe a customer (Standard tier)
absuite subscriptions create --TenantId $TENANT_ID --SubscriptionCreateDto '{
  "individualId": "<contact-guid>",
  "subscriptionPlanId": "<plan-guid>",
  "subscriptionClass": "Standard"
}'

# 3. Check subscriptions
absuite subscriptions list --TenantId $TENANT_ID
```

---

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List plans | `absuite subscriptions list plans --TenantId <guid>` |
| Count plans | `absuite subscriptions count plans --TenantId <guid>` |
| Get plan | `absuite subscriptions get plan --TenantId <guid> --PlanId <guid>` |
| Create plan | `absuite subscriptions create plan --TenantId <guid> --SubscriptionPlanCreateDto '{...}'` |
| Update plan | `absuite subscriptions update plan --TenantId <guid> --PlanId <guid> --SubscriptionPlanUpdateDto '{...}'` |
| Delete plan | `absuite subscriptions delete plan --TenantId <guid> --PlanId <guid>` |
| List subscriptions | `absuite subscriptions list --TenantId <guid>` |
| Count subscriptions | `absuite subscriptions count --TenantId <guid>` |
| Get subscription | `absuite subscriptions get --TenantId <guid> --SubscriptionId <guid>` |
| Create subscription | `absuite subscriptions create --TenantId <guid> --SubscriptionCreateDto '{...}'` |
| Update subscription | `absuite subscriptions update --TenantId <guid> --SubscriptionId <guid> --SubscriptionUpdateDto '{...}'` |
| Delete subscription | `absuite subscriptions delete --TenantId <guid> --SubscriptionId <guid>` |

## Critical Rules

- **Authenticate first** (`absuite login`) and always provide a tenant (`--TenantId` or `absuite config set --tenant-id`).
- **The plan path parameter is `--PlanId`** (not `--SubscriptionPlanId`); the subscription path parameter is `--SubscriptionId`.
- **Create plans before subscribing customers** — a subscription must reference an existing `subscriptionPlanId`.
- **`subscriptionClass` is `Trial` or `Standard`** (the tier) — bind the customer with `individualId` (person) or `organizationId` (company).
- **No PATCH via CLI.** For atomic partial updates, use the `absuite-subscriptions` (REST) skill. `update` here performs a full PUT replacement.
- **No cancel/renew/search/billing-cycle commands exist** — model those state changes as `update`.
