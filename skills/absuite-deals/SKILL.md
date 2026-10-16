---
name: absuite-deals
key: paperclip/skills/absuite-deals/SKILL.md
version: 1.0.0
description: >
  Create, read, update, delete, calculate, close, and partially patch deal units (sales
  opportunities), deal unit lines, and deal unit flows (sales pipelines) with their
  stages, via the Alliance Business Suite (ABS) Deals REST API (DealsService). Covers
  list / count / get / create / update (PUT) / atomic PATCH (JSON Patch, RFC 6902) /
  delete / calculate / close operations. All operations are tenant-scoped and require a bearer
  token (see the `absuite-login` skill to authenticate first).
---

# Alliance Business Suite: Deals (REST API)

Manage **deal units** (sales opportunities) and **deal unit flows** (sales pipelines) through the ABS Deals Service REST API (`DealsService`). A deal tracks a potential sale (its customer, value, line items, and lifecycle) as it moves through the stages of a sales pipeline. Every endpoint is tenant-scoped and requires authentication.

> For the **CLI equivalent** of these operations, see the `absuite-deals-cli` skill.
> For general REST conventions (auth, envelope, tenant scoping, PATCH), see the `absuite-rest` skill.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select`: page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource**: it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` causes silent data loss. (One exception: an omitted `currencyId` on a deal unit PUT keeps the deal's current currency; an explicit blank is refused.)
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902): it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

## Authentication

1. **Obtain a bearer token** (see `absuite-login` for details):

```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<your-email>", "password": "<your-password>"}'
```

Extract `accessToken` from the response and export it:

```bash
export ABSUITE_ACCESS_TOKEN="<accessToken>"
```

2. **Send the token on every request:**

```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/DealsService/...`

4. **Response envelope**: every response is wrapped:

```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "…",
  "timestamp": "…",
  "result": { /* data | array | int | null */ }
}
```

Always check `isSuccess`; read the payload from `result`.

## Tenant scoping (required)

**Every** DealsService endpoint requires a tenant. Pass it as the `?tenantId=<tenant-guid>` query parameter on **all** verbs: `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` (omitting it returns `400`). The platform also accepts the equivalent `X-TenantId: <tenant-guid>` request header instead of the query param; the examples below use the query param for clarity.

## Permissions

The caller must be enrolled in the tenant and hold the matching deal-unit permission. Deal units, lines, flows, and flow stages all share the same permission set:

| Operation | Permission |
|---|---|
| List, count, get (incl. Extended) | `deal_units_read` |
| Create (deal unit, line, flow, stage) | `deal_units_create` |
| Update (PUT), PATCH, Calculate, Close | `deal_units_update` |
| Delete | `deal_units_delete` |

## Key Concepts

- **Deal Unit**: a sales opportunity tracking a potential sale, with customer info, financial totals, a pipeline assignment, and a lifecycle status.
- **Deal Unit Line**: an individual product/item within a deal, with quantity, pricing, and a full cost/tax breakdown.
- **Deal Unit Flow**: a sales pipeline defining the process a deal moves through (e.g., "Enterprise Sales Pipeline").
- **Deal Unit Flow Stage**: an ordered step within a flow (e.g., "Qualification" → "Proposal" → "Negotiation" → "Closed Won").
- **DealUnitStatus**: lifecycle state: `Open` | `Won` | `Lost` | `Frozen`.
- **DealUnitForecastCategory**: pipeline weighting: `None` | `Pipeline` | `BestCase` | `Commited` | `Ommited` | `Won` | `Lost`.
- **DealUnitPurchaseProcess**: buyer process tracking: `None` | `Individual` | `Commitee` | `Unknown`.
- **DealUnitAmountsCalculation**: `UserProvided` | `SystemCalculated`.
- **CostCalculationMethod**: `Automatic` | `Custom`.
- **TaxCalculationMethod**: `Included` | `Excluded`.

> Enum values above are transcribed verbatim from the API spec (note the spellings `Commited`, `Ommited`, `Commitee`; they are intentional, not typos to "correct").

## Workflow: Creating a Deal

1. **Ensure a flow exists**: a deal is assigned to a sales pipeline (flow) and a stage.
2. **Create the deal unit**: with currency (required), customer, and flow/stage assignment.
3. **(Optional) Add deal unit lines** for specific products.
4. **Calculate totals**: let the server compute accurate financial summaries.
5. **Progress the deal**: advance the stage (PUT or PATCH) as the deal moves forward.
6. **Close**: call the Close endpoint with `won=true` or `won=false`.

---

## Deal Units

### List deal units

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List extended deal units (with related data)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count deal units

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a deal unit by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get an extended deal unit by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a deal unit

Body is a `DealUnitCreateDto`. Field names are camelCase. `currencyId` is **required** (a create without it is refused; there is no USD default).

**What create actually stores today:** `id` (optional, client-supplied), `title`, `description`, `currencyId`, `individualId`, `organizationId`, `priceListId`, `dealUnitFlowId`, `dealUnitFlowStageId`, and `dealUnitLines`. Every other `DealUnitCreateDto` field is accepted by the schema but **not persisted on create**; set status, forecast, dates, customer-narrative and billing fields afterwards with PUT or PATCH. A new deal starts `Open`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Acme Corp - Enterprise Platform Deal",
    "description": "Annual enterprise license and support package",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "organizationId": "<organization-guid>",
    "priceListId": "<price-list-guid>",
    "dealUnitFlowId": "<flow-guid>",
    "dealUnitFlowStageId": "<qualification-stage-guid>"
  }'
```

**`DealUnitCreateDto` schema fields:** `id`, `timestamp`, `title`, `description`, `currencyId`, `individualId`, `organizationId`, `firstName`, `lastName`, `companyName`, `billingEmail`, `priceListId`, `paymentTermId`, `receiverTenantId`, `dealUnitFlowId`, `dealUnitFlowStageId`, `dealUnitStatus`, `dealUnitForecastCategory`, `dealUnitPurchaseProcess`, `dealUnitAmountsCalculation`, `expectedCloseDate`, `expiryDate`, `wonDate`, `lostDate`, `deliveredDate`, `closedTimestamp`, `currentSituation`, `customerNeed`, `proposedSolution`, `costCalculationMethod`, `taxCalculationMethod`, `forexRate`, `forexRatesSnapshot`, `closed`, `partnerCreated`, `partnerCollaboration`, billing-address fields (`addressLine1`, `addressLine2`, `postalCode`, `countryId`, `stateId`, `cityId`), the `total*` money fields, and `dealUnitLines` (an inline array of `DealUnitLineCreateDto`; a line without its own `currencyId` takes the deal's).

### Update a deal unit (full replace: PUT)

Body is a `DealUnitUpdateDto`. PUT carries the full editable shape (the create fields except `id`, `timestamp` and `dealUnitLines`, plus `userId`, `billingLocationId`, `shippingLocationId`, `shippingMethodId`, `ordered`, `cartId`, `dealUnitFeedId`, and the `total*CurrencyId` currency for each `total*` amount). Use PUT to replace; use **PATCH** (below) to change a couple of fields atomically.

> `closed` and `ordered` are not written by PUT or PATCH. To close a deal, use the [Close endpoint](#close-a-deal-unit-won-or-lost).

```bash
# Body abbreviated: send the full object you fetched with GET, with your changes applied.
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Acme Corp - Enterprise Deal (Revised)",
    "currencyId": "<currency-guid>",
    "dealUnitFlowId": "<flow-guid>",
    "dealUnitFlowStageId": "<proposal-stage-guid>",
    "dealUnitForecastCategory": "BestCase",
    "expectedCloseDate": "2026-06-30T00:00:00Z"
  }'
```

### Patch a deal unit (atomic partial update: PATCH)

Body is a **JSON Patch array** (RFC 6902) applied to `DealUnitUpdateDto`. See the [PATCH section](#patch-json-patch) below.

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/dealUnitFlowStageId", "value": "<proposal-stage-guid>" },
    { "op": "replace", "path": "/dealUnitForecastCategory", "value": "BestCase" }
  ]'
```

### Calculate a deal unit (server-computed totals)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Calculate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Close a deal unit (Won or Lost)

`won` is a **required** query parameter: `true` closes the deal as `Won` (sets `wonDate`), `false` closes it as `Lost` (sets `lostDate`). The server sets `closed` and `closedTimestamp` and raises the deal-closed event. Closing an already-closed deal is refused.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Close?tenantId=<tenant-guid>&won=true" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Delete a deal unit

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Deal Unit Lines

Lines are nested under a deal unit: `/DealUnits/{dealUnitId}/Lines`.

### List lines

`itemId` is an optional query filter.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# filtered by item
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Lines?tenantId=<tenant-guid>&itemId=<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count lines

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Lines/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a line by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Lines/<deal-unit-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a line

Body is a `DealUnitLineCreateDto`. The response `result` is the deal's updated line list.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "<item-guid>",
    "itemTitle": "ABS Enterprise License",
    "itemShortDescription": "Annual enterprise platform license",
    "description": "10 seats of ABS Enterprise",
    "quantity": 10,
    "currencyId": "<currency-guid>",
    "itemPriceId": "<item-price-guid>",
    "priceListItemId": "<price-list-item-guid>",
    "unitId": "<unit-guid>",
    "unitGroupId": "<unit-group-guid>",
    "free": false
  }'
```

**Useful `DealUnitLineCreateDto` fields:** `itemId`, `itemTitle`, `itemShortDescription`, `itemPrimaryImageUrl`, `description`, `quantity`, `currencyId`, `itemPriceId`, `priceListItemId`, `unitId`, `unitGroupId`, `free`, `freeReason`, `freeReasonCode`, the `data`/`dataLabel` … `data9`/`data9Label` custom-attribute pairs, policy ids (`shippingPolicyId`, `returnPolicyId`, `refundPolicyId`, `warrantyPolicyId`, `shipmentPolicyId`), `shippingLocationId`, `locationId`, the `total*` money fields and their `*InUsd` snapshots, `customGlobalDiscountsAmount` / `customGlobalSurchargesAmount` (with their `*CurrencyId`), `costCalculationMethod`, `taxCalculationMethod`, `quoteItemRecordId`, `parentBillingItemRecordId`, `dealUnitId`.

### Update a line (PUT)

Body is a `DealUnitLineUpdateDto` (full replace: GET the line first, change it, PUT the whole object). The response `result` is the updated line.

```bash
# Body abbreviated: send the full line object you fetched with GET, with your changes applied.
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Lines/<deal-unit-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 15,
    "description": "Increased to 15 seats"
  }'
```

### Patch a line (PATCH)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Lines/<deal-unit-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/quantity", "value": 15 }
  ]'
```

> There is no working per-line Calculate endpoint. To recompute line totals, calculate the whole deal unit with `PUT /DealUnits/{dealUnitId}/Calculate`.

### Delete a line

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Lines/<deal-unit-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Deal Unit Flows (Sales Pipelines)

### List flows

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count flows

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a flow by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/<flow-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a flow

Body is a `DealUnitFlowCreateDto`: fields `id`, `timestamp`, `name`, `description`, `parentBusinessProcessId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Sales Pipeline",
    "description": "Standard B2B sales process for enterprise accounts",
    "parentBusinessProcessId": "<business-process-guid>"
  }'
```

### Update a flow (PUT)

Body is a `DealUnitFlowUpdateDto`: fields `name`, `description`, `parentBusinessProcessId`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/<flow-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Sales Pipeline (v2)",
    "description": "Updated pipeline with revised stages",
    "parentBusinessProcessId": "<business-process-guid>"
  }'
```

### Patch a flow (PATCH)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/<flow-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/name", "value": "Enterprise Sales Pipeline (v2)" }
  ]'
```

### Delete a flow

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/<flow-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Flow Stages

Stages are nested under a flow: `/DealUnitFlows/{dealUnitFlowId}/Stages`. Every stage operation requires the flow id (in the path) and, for single-stage operations, the stage id.

### List stages for a flow

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/<flow-guid>/Stages?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count stages for a flow

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/<flow-guid>/Stages/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a stage by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/<flow-guid>/Stages/<stage-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a stage

Body is a `DealUnitFlowStageCreateDto`: fields `id`, `timestamp`, `order`, `name`, `dealUnitFlowId`, `description`, `parentBusinessProcessStageId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/<flow-guid>/Stages?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Qualification",
    "order": 1,
    "description": "Initial lead qualification",
    "dealUnitFlowId": "<flow-guid>"
  }'
```

### Update a stage (PUT)

Body is a `DealUnitFlowStageUpdateDto`: fields `order`, `name`, `description`, `dealUnitFlowId`, `parentBusinessProcessStageId`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/<flow-guid>/Stages/<stage-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Final Review",
    "order": 5,
    "description": "Executive approval before closing",
    "dealUnitFlowId": "<flow-guid>"
  }'
```

### Patch a stage (PATCH)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/<flow-guid>/Stages/<stage-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/order", "value": 5 }
  ]'
```

### Delete a stage

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/<flow-guid>/Stages/<stage-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## PATCH (JSON Patch)

PATCH endpoints accept a **JSON Patch document** (RFC 6902): a JSON **array** of operations, with `Content-Type: application/json`. Use PATCH for atomic partial updates: change a couple of fields without resending the whole object (safer than PUT for concurrent edits). Each patch is applied to the resource's `*UpdateDto`, so only update-DTO fields are patchable.

- `op` ∈ `add` | `remove` | `replace` | `move` | `copy` | `test`
- `path` / `from` are JSON-Pointer strings (leading `/`, camelCase field name).

Example against a deal unit (advance the stage and re-categorize, atomically):

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/dealUnitFlowStageId", "value": "<proposal-stage-guid>" },
    { "op": "replace", "path": "/dealUnitForecastCategory", "value": "BestCase" },
    { "op": "replace", "path": "/dealUnitStatus", "value": "Open" }
  ]'
```

**Four resources support PATCH** in DealsService:

| Resource | PATCH path |
|---|---|
| Deal unit | `PATCH /api/v2/DealsService/DealUnits/{dealUnitId}` |
| Deal unit line | `PATCH /api/v2/DealsService/DealUnits/{dealUnitId}/Lines/{dealUnitLineId}` |
| Flow | `PATCH /api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}` |
| Flow stage | `PATCH /api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages/{dealUnitFlowStageId}` |

---

## Deal Lifecycle Management

### Mark a deal as Won

Use the Close endpoint. It sets `dealUnitStatus` to `Won`, `wonDate`, `closed` and `closedTimestamp` in one step and raises the deal-closed event:

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Close?tenantId=<tenant-guid>&won=true" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Optionally align the forecast category afterwards (PATCH):

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/dealUnitForecastCategory", "value": "Won" }
  ]'
```

> Do not "close" a deal by writing `dealUnitStatus` / `closed` through PUT or PATCH: `closed` is not persisted that way, and no deal-closed event is raised.

### Mark a deal as Lost

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/<deal-unit-guid>/Close?tenantId=<tenant-guid>&won=false" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Convert a won deal to an order

After a deal is `Won`, create an order referencing the deal's customer and line items. Use the `absuite-orders` (REST) skill to create the order.

---

## Full Example: End-to-End Deal Pipeline

```bash
HOST="$ABSUITE_HOST_URL"
TOK="Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
T="<tenant-guid>"

# 1. List existing pipelines (or create one)
curl -s -X GET "$HOST/api/v2/DealsService/DealUnitFlows?tenantId=$T" -H "$TOK"

# 2. Create a flow
curl -s -X POST "$HOST/api/v2/DealsService/DealUnitFlows?tenantId=$T" -H "$TOK" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Enterprise Sales Pipeline", "description": "B2B enterprise process" }'
# → list flows (step 1) to get the new flow id as <flow-guid>

# 3. Add a stage
curl -s -X POST "$HOST/api/v2/DealsService/DealUnitFlows/<flow-guid>/Stages?tenantId=$T" -H "$TOK" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Qualification", "order": 1, "dealUnitFlowId": "<flow-guid>" }'
# → list the flow's stages to get <qualification-stage-guid>

# 4. Create a deal unit on that flow + stage (currencyId is required)
curl -s -X POST "$HOST/api/v2/DealsService/DealUnits?tenantId=$T" -H "$TOK" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Acme Corp - Enterprise Deal",
    "currencyId": "<currency-guid>",
    "organizationId": "<organization-guid>",
    "dealUnitFlowId": "<flow-guid>",
    "dealUnitFlowStageId": "<qualification-stage-guid>"
  }'
# → list deal units to get <deal-unit-guid> (or supply your own "id" in the create body)

# 5. Set forecast and expected close date (PATCH)
curl -s -X PATCH "$HOST/api/v2/DealsService/DealUnits/<deal-unit-guid>?tenantId=$T" -H "$TOK" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/dealUnitForecastCategory", "value": "Pipeline" }, { "op": "replace", "path": "/expectedCloseDate", "value": "2026-06-30T00:00:00Z" } ]'

# 6. Add a line item
curl -s -X POST "$HOST/api/v2/DealsService/DealUnits/<deal-unit-guid>/Lines?tenantId=$T" -H "$TOK" \
  -H "Content-Type: application/json" \
  -d '{ "itemId": "<item-guid>", "itemTitle": "ABS Enterprise License", "quantity": 10, "currencyId": "<currency-guid>", "itemPriceId": "<item-price-guid>" }'

# 7. Calculate totals
curl -s -X PUT "$HOST/api/v2/DealsService/DealUnits/<deal-unit-guid>/Calculate?tenantId=$T" -H "$TOK"

# 8. Advance to the proposal stage (atomic PATCH)
curl -s -X PATCH "$HOST/api/v2/DealsService/DealUnits/<deal-unit-guid>?tenantId=$T" -H "$TOK" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/dealUnitFlowStageId", "value": "<proposal-stage-guid>" } ]'

# 9. Close as Won
curl -s -X PUT "$HOST/api/v2/DealsService/DealUnits/<deal-unit-guid>/Close?tenantId=$T&won=true" -H "$TOK"

# 10. Verify
curl -s -X GET "$HOST/api/v2/DealsService/DealUnits/<deal-unit-guid>?tenantId=$T" -H "$TOK"
```

---

## API Endpoints Quick Reference

All paths are tenant-scoped: append `?tenantId=<tenant-guid>` (or send the `X-TenantId` header) on **every** verb.

| Action | Method | Path | Permission |
|---|---|---|---|
| List deal units | GET | `/api/v2/DealsService/DealUnits` | `deal_units_read` |
| List extended deal units | GET | `/api/v2/DealsService/DealUnits/Extended` | `deal_units_read` |
| Count deal units | GET | `/api/v2/DealsService/DealUnits/Count` | `deal_units_read` |
| Get deal unit | GET | `/api/v2/DealsService/DealUnits/{dealUnitId}` | `deal_units_read` |
| Get extended deal unit | GET | `/api/v2/DealsService/DealUnits/{dealUnitId}/Extended` | `deal_units_read` |
| Create deal unit | POST | `/api/v2/DealsService/DealUnits` | `deal_units_create` |
| Update deal unit | PUT | `/api/v2/DealsService/DealUnits/{dealUnitId}` | `deal_units_update` |
| Patch deal unit | PATCH | `/api/v2/DealsService/DealUnits/{dealUnitId}` | `deal_units_update` |
| Calculate deal unit | PUT | `/api/v2/DealsService/DealUnits/{dealUnitId}/Calculate` | `deal_units_update` |
| Close deal unit | PUT | `/api/v2/DealsService/DealUnits/{dealUnitId}/Close?won=true\|false` | `deal_units_update` |
| Delete deal unit | DELETE | `/api/v2/DealsService/DealUnits/{dealUnitId}` | `deal_units_delete` |
| List lines | GET | `/api/v2/DealsService/DealUnits/{dealUnitId}/Lines` | `deal_units_read` |
| Count lines | GET | `/api/v2/DealsService/DealUnits/{dealUnitId}/Lines/Count` | `deal_units_read` |
| Get line | GET | `/api/v2/DealsService/DealUnits/{dealUnitId}/Lines/{dealUnitLineId}` | `deal_units_read` |
| Create line | POST | `/api/v2/DealsService/DealUnits/{dealUnitId}/Lines` | `deal_units_create` |
| Update line | PUT | `/api/v2/DealsService/DealUnits/{dealUnitId}/Lines/{dealUnitLineId}` | `deal_units_update` |
| Patch line | PATCH | `/api/v2/DealsService/DealUnits/{dealUnitId}/Lines/{dealUnitLineId}` | `deal_units_update` |
| Delete line | DELETE | `/api/v2/DealsService/DealUnits/{dealUnitId}/Lines/{dealUnitLineId}` | `deal_units_delete` |
| List flows | GET | `/api/v2/DealsService/DealUnitFlows` | `deal_units_read` |
| Count flows | GET | `/api/v2/DealsService/DealUnitFlows/Count` | `deal_units_read` |
| Get flow | GET | `/api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}` | `deal_units_read` |
| Create flow | POST | `/api/v2/DealsService/DealUnitFlows` | `deal_units_create` |
| Update flow | PUT | `/api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}` | `deal_units_update` |
| Patch flow | PATCH | `/api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}` | `deal_units_update` |
| Delete flow | DELETE | `/api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}` | `deal_units_delete` |
| List flow stages | GET | `/api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages` | `deal_units_read` |
| Count flow stages | GET | `/api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages/Count` | `deal_units_read` |
| Get flow stage | GET | `/api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages/{dealUnitFlowStageId}` | `deal_units_read` |
| Create flow stage | POST | `/api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages` | `deal_units_create` |
| Update flow stage | PUT | `/api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages/{dealUnitFlowStageId}` | `deal_units_update` |
| Patch flow stage | PATCH | `/api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages/{dealUnitFlowStageId}` | `deal_units_update` |
| Delete flow stage | DELETE | `/api/v2/DealsService/DealUnitFlows/{dealUnitFlowId}/Stages/{dealUnitFlowStageId}` | `deal_units_delete` |

> **Note:** Sales literature is **not** part of DealsService. Its REST endpoints live under `SalesService` (`/api/v2/SalesService/SalesLiteratures`); see the `absuite-misc` skill, or the `absuite-deals-cli` skill for the CLI `sales-literature` commands.
