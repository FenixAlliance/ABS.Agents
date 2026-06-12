---
name: absuite-subscriptions
description: >
  Manage subscription plans and customer subscriptions via the Alliance Business Suite
  (ABS) REST API. Covers subscription plans and subscriptions, including atomic PATCH
  (JSON Patch) updates. All operations are tenant-scoped and require a bearer token
  (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Subscriptions Skill (REST)

This skill drives the **SubscriptionsService** REST API. It manages two resources:

- **Subscription Plans** — the recurring offerings customers can subscribe to (a plan is an Item-shaped catalog record with subscription metadata such as trial/perpetual flags and expiration windows).
- **Subscriptions** — individual customer subscriptions that bind a contact (individual or organization) to a plan.

All operations are **tenant-scoped**: every endpoint in this service requires a `tenantId`. Pass it as the `?tenantId=<tenant-guid>` query parameter on **every** request (including POST/PUT/PATCH/DELETE). The `X-TenantId: <tenant-guid>` request header is an accepted equivalent.

> For the CLI equivalent, see `absuite-subscriptions-cli`. For general REST conventions (auth, envelope, paging, error handling), see `absuite-rest`.

## Authentication

1. **Obtain a bearer token:**

```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<user-email>", "password": "<user-password>"}'
```

Extract `accessToken` from the response.

2. **Send the token on every request:**

```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/SubscriptionsService/<Resource>`

4. **Response envelope** — every response is wrapped:

```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "…",
  "timestamp": "…",
  "result": { }
}
```

Always check `isSuccess`; read data from `result`.

## Key Concepts

- **Tenant scoping is mandatory.** Every SubscriptionsService endpoint declares `tenantId` as **required**. Omitting `?tenantId=` returns `400`.
- **Two resources only:** `SubscriptionPlans` and `Subscriptions`. There are no search, cancel, renew, activate, or billing-cycle endpoints in this service — lifecycle changes are done via **PUT** (full update) or **PATCH** (partial update).
- **Subscription path parameter is `subscriptionId`.** Subscription-plan path parameter is `planId` (note: not `subscriptionPlanId`).
- **`subscriptionClass`** on a subscription is the enum `Trial | Standard` — it selects the subscription tier/expiration behaviour, **not** the contact type. Bind the customer via either `individualId` (a person contact) **or** `organizationId` (an organization contact).
- **Subscription plans are catalog (Item-shaped) records.** The create/update body carries the full item field surface (sku, title, currencyId, regularPrice, etc.) plus subscription-specific fields: `recurrency`, `allowSubscriptionTrials`, `isPerpetualSubscription`, `trialSubscriptionRelativeExpirationInDays`, `standardSubscriptionRelativeExpirationInDays`, `subscriptionsCertificateId`. Most fields are optional — send only what you need.
- **JSON request keys are camelCase** (e.g. `"name"`, `"currencyId"`, `"subscriptionPlanId"`, `"subscriptionClass"`), matching the OpenAPI schema.
- **Optional version selectors:** `?api-version=<v>` query param or `x-api-version: <v>` header may be supplied on any endpoint; both are optional.

---

## Subscription Plans

Base: `$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans`

### List plans

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count plans

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a plan by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans/<plan-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a plan

Body: `SubscriptionPlanCreateDto`. All fields are optional; a minimal plan typically sets a name, a currency, a price, and the subscription metadata.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
```

Selected `SubscriptionPlanCreateDto` fields (all optional; transcribe additional item fields from the OpenAPI schema as needed):

| Field | Type | Notes |
|---|---|---|
| `name` | string | Plan name |
| `title` | string | Display title |
| `summary` / `description` / `shortDescription` | string | Copy fields |
| `sku`, `upc`, `ean`, `mpn`, `isbn`, `gtin`, `barcode` | string | Catalog identifiers |
| `currencyId` | string | Pricing currency |
| `unitId` / `unitGroupId` | string | Unit of measure |
| `regularPrice` / `finalPrice` / `discountPrice` | number | Pricing |
| `taxable` / `published` / `featured` | boolean | Catalog flags |
| `recurrency` | number | Billing recurrence value |
| `allowSubscriptionTrials` | boolean | Whether trials are offered |
| `isPerpetualSubscription` | boolean | Non-expiring subscription |
| `trialSubscriptionRelativeExpirationInDays` | integer | Trial length in days |
| `standardSubscriptionRelativeExpirationInDays` | integer | Standard term length in days |
| `subscriptionsCertificateId` | string | Linked certificate |

### Update a plan (PUT — full replace)

Body: `SubscriptionPlanUpdateDto` (same field surface as create, plus a few extra item fields).

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans/<plan-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Professional Monthly",
    "regularPrice": 54.99,
    "finalPrice": 54.99,
    "published": true,
    "allowSubscriptionTrials": false,
    "standardSubscriptionRelativeExpirationInDays": 30
  }'
```

### Patch a plan (PATCH — partial, JSON Patch)

See the **PATCH** section below.

### Delete a plan

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans/<plan-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Subscriptions

Base: `$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions`

### List subscriptions

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count subscriptions

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a subscription by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions/<sub-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a subscription

Body: `SubscriptionCreateDto`. Bind the customer with **either** `individualId` **or** `organizationId`, point at a plan with `subscriptionPlanId`, and pick the tier with `subscriptionClass`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "individualId": "<contact-guid>",
    "subscriptionPlanId": "<plan-guid>",
    "subscriptionClass": "Standard"
  }'
```

`SubscriptionCreateDto` fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Optional client-supplied ID |
| `timestamp` | string | Optional |
| `individualId` | string | Person contact (use for an individual customer) |
| `organizationId` | string | Organization contact (use for a company customer) |
| `subscriptionPlanId` | string | Plan being subscribed to |
| `subscriptionClass` | enum | `Trial` or `Standard` |

### Update a subscription (PUT — full replace)

Body: `SubscriptionUpdateDto` (same fields as create).

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions/<sub-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "individualId": "<contact-guid>",
    "subscriptionPlanId": "<plan-guid>",
    "subscriptionClass": "Standard"
  }'
```

### Patch a subscription (PATCH — partial, JSON Patch)

See the **PATCH** section below.

### Delete a subscription

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions/<sub-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## PATCH (JSON Patch, RFC 6902)

Both `SubscriptionPlans/{planId}` and `Subscriptions/{subscriptionId}` support **PATCH** for atomic partial updates — change a couple of fields without resending the whole object. The request body is a **JSON array** of operations.

- `Content-Type: application/json`
- `op` ∈ `add | remove | replace | move | copy | test`
- `path` / `from` are JSON-Pointer (leading `/`, camelCase field name)
- `?tenantId=<tenant-guid>` is still required

### Patch a subscription plan

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans/<plan-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/regularPrice", "value": 59.99 },
    { "op": "replace", "path": "/finalPrice", "value": 59.99 },
    { "op": "replace", "path": "/published", "value": true }
  ]'
```

### Patch a subscription

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions/<sub-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/subscriptionClass", "value": "Standard" },
    { "op": "replace", "path": "/subscriptionPlanId", "value": "<plan-guid>" }
  ]'
```

Use PATCH (rather than PUT) when only a few fields change — it is safer for concurrent edits because it does not overwrite untouched fields.

---

## End-to-End Workflow

```bash
# 1. Create a plan
curl -X POST "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/SubscriptionPlans?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Starter Monthly",
    "currencyId": "<currency-guid>",
    "regularPrice": 19.99,
    "finalPrice": 19.99,
    "recurrency": 1,
    "allowSubscriptionTrials": true,
    "trialSubscriptionRelativeExpirationInDays": 14,
    "standardSubscriptionRelativeExpirationInDays": 30
  }'
# -> note the plan id from result

# 2. Subscribe a customer to the plan (Standard tier)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "individualId": "<contact-guid>",
    "subscriptionPlanId": "<plan-guid>",
    "subscriptionClass": "Standard"
  }'
# -> note the subscription id from result

# 3. Atomically switch the subscription to a different plan via PATCH
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions/<sub-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/subscriptionPlanId", "value": "<other-plan-guid>" } ]'

# 4. Verify
curl -X GET "$ABSUITE_HOST_URL/api/v2/SubscriptionsService/Subscriptions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## API Endpoints Quick Reference

All paths are under `$ABSUITE_HOST_URL`. Every endpoint requires `?tenantId=<tenant-guid>` (or `X-TenantId` header). `?api-version` / `x-api-version` are optional.

| Action | Method | Path |
|---|---|---|
| List subscription plans | GET | `/api/v2/SubscriptionsService/SubscriptionPlans` |
| Count subscription plans | GET | `/api/v2/SubscriptionsService/SubscriptionPlans/Count` |
| Get subscription plan by ID | GET | `/api/v2/SubscriptionsService/SubscriptionPlans/{planId}` |
| Create subscription plan | POST | `/api/v2/SubscriptionsService/SubscriptionPlans` |
| Update subscription plan (PUT) | PUT | `/api/v2/SubscriptionsService/SubscriptionPlans/{planId}` |
| Patch subscription plan (JSON Patch) | PATCH | `/api/v2/SubscriptionsService/SubscriptionPlans/{planId}` |
| Delete subscription plan | DELETE | `/api/v2/SubscriptionsService/SubscriptionPlans/{planId}` |
| List subscriptions | GET | `/api/v2/SubscriptionsService/Subscriptions` |
| Count subscriptions | GET | `/api/v2/SubscriptionsService/Subscriptions/Count` |
| Get subscription by ID | GET | `/api/v2/SubscriptionsService/Subscriptions/{subscriptionId}` |
| Create subscription | POST | `/api/v2/SubscriptionsService/Subscriptions` |
| Update subscription (PUT) | PUT | `/api/v2/SubscriptionsService/Subscriptions/{subscriptionId}` |
| Patch subscription (JSON Patch) | PATCH | `/api/v2/SubscriptionsService/Subscriptions/{subscriptionId}` |
| Delete subscription | DELETE | `/api/v2/SubscriptionsService/Subscriptions/{subscriptionId}` |

## Critical Rules

- **Always pass `?tenantId=<tenant-guid>`** on every call (GET/POST/PUT/PATCH/DELETE) — omitting it returns `400`.
- **Create plans before subscriptions** — a subscription must reference an existing `subscriptionPlanId`.
- **`subscriptionClass` is `Trial` or `Standard`** — it is the tier, not the contact type. Bind the customer via `individualId` (person) **or** `organizationId` (company).
- **Use PATCH for partial edits**, PUT for full replacement.
- **No cancel/renew/search/billing-cycle endpoints exist** in this service — model those state changes as PUT/PATCH updates.
