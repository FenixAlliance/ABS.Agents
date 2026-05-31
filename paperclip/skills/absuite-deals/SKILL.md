---
name: absuite-deals
description: >
  Create, read, update, delete, and manage deal units (sales opportunities) in the
  Alliance Business Suite (ABS) Deals Service using the `absuite` CLI. Covers deal
  units, deal unit lines, deal unit flows (sales pipelines), flow stages, sales
  literature, and totals calculation. Requires an authenticated CLI session (use
  the `absuite-login` skill to authenticate first).
---

# Alliance Business Suite — Deals Skill

Manage deal units (sales opportunities) through the `absuite` CLI's `deals` service. All deal operations are tenant-scoped and require authentication.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant** — all deal operations require a tenant. Either set a default:
   ```bash
   absuite config set --tenant-id <tenant-guid>
   ```
   Or pass `--TenantId <guid>` on each call.
3. **Discover commands** — run `absuite deals list-commands` to see all deal commands, or use `--help` on any command for full parameter and output schemas.

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

## Command Discovery

```bash
# List all deal commands
absuite deals list-commands

# Get detailed help for any command
absuite deals create unit --help
```

## Key Concepts

- **Deal Unit** — a sales opportunity tracking a potential sale, with customer info, estimated value, and lifecycle status.
- **Deal Unit Line** — an individual product/item within a deal, with quantity, pricing, and cost breakdown.
- **Deal Unit Flow** — a sales pipeline defining the process a deal moves through (e.g., "Enterprise Sales Pipeline").
- **Deal Unit Flow Stage** — a step within a flow (e.g., "Qualification" → "Proposal" → "Negotiation" → "Closed Won").
- **Sales Literature** — supporting documents and content for the sales process.
- **DealUnitStatus** — lifecycle state: `"Open"`, `"Won"`, `"Lost"`, `"Cancelled"`, etc.
- **DealUnitForecastCategory** — pipeline weighting: `"Pipeline"`, `"BestCase"`, `"Committed"`, `"Omitted"`.
- **DealUnitPurchaseProcess** — buyer process tracking: `"Individual"`, `"Committee"`, `"Unknown"`.

## Workflow: Creating a Deal

1. **Ensure a flow exists** — deals must be assigned to a sales pipeline (flow) and stage
2. **Create the deal unit** — with customer, value estimate, and flow/stage assignment
3. **(Optional)** Add deal unit lines for specific products
4. **Calculate totals** — let the server compute accurate financial summaries
5. **Progress the deal** — update the stage as the deal advances

### Step 1 — Set Up a Sales Pipeline (if needed)

#### List Existing Flows

```bash
absuite deals list unit-flows --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Create a New Flow

```bash
absuite deals create unit-flow --TenantId $TENANT_ID --DealUnitFlowCreateDto '{
  "Name": "Enterprise Sales Pipeline",
  "Description": "Standard B2B sales process for enterprise accounts"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Sales Pipeline",
    "description": "Standard B2B sales process for enterprise accounts"
  }'
```

#### Add Stages to the Flow

```bash
absuite deals create unit-flow-stage --TenantId $TENANT_ID --DealUnitFlowId <flow-guid> --DealUnitFlowStageCreateDto '{
  "Name": "Qualification",
  "Order": 1,
  "Description": "Initial lead qualification"
}'

absuite deals create unit-flow-stage --TenantId $TENANT_ID --DealUnitFlowId <flow-guid> --DealUnitFlowStageCreateDto '{
  "Name": "Proposal",
  "Order": 2,
  "Description": "Solution proposal sent to prospect"
}'

absuite deals create unit-flow-stage --TenantId $TENANT_ID --DealUnitFlowId <flow-guid> --DealUnitFlowStageCreateDto '{
  "Name": "Negotiation",
  "Order": 3,
  "Description": "Contract and pricing negotiation"
}'

absuite deals create unit-flow-stage --TenantId $TENANT_ID --DealUnitFlowId <flow-guid> --DealUnitFlowStageCreateDto '{
  "Name": "Closed Won",
  "Order": 4,
  "Description": "Deal successfully closed"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/$FLOW_ID/Stages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Qualification",
    "order": 1,
    "description": "Initial lead qualification",
    "dealUnitFlowId": "<flow-guid>"
  }'
```

#### List Stages for a Flow

```bash
absuite deals list unit-flow-stages --TenantId $TENANT_ID --DealUnitFlowId <flow-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/$FLOW_ID/Stages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Step 2 — Create a Deal Unit

```bash
absuite deals create unit --TenantId $TENANT_ID --DealUnitCreateDto '{
  "Title": "Acme Corp - Enterprise Platform Deal",
  "Description": "Annual enterprise license and support package",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "OrganizationId": "<organization-guid>",
  "FirstName": "Jane",
  "LastName": "Smith",
  "CompanyName": "Acme Corp",
  "BillingEmail": "jane@acme.com",
  "DealUnitFlowId": "<flow-guid>",
  "DealUnitFlowStageId": "<qualification-stage-guid>",
  "DealUnitStatus": "Open",
  "DealUnitForecastCategory": "Pipeline",
  "DealUnitPurchaseProcess": "Committee",
  "ExpectedCloseDate": "2026-06-30T00:00:00Z",
  "CurrentSituation": "Prospect using competitor product with expiring contract",
  "CustomerNeed": "Unified platform for CRM, invoicing, and inventory",
  "ProposedSolution": "ABS Enterprise with Premium Support",
  "CostCalculationMethod": "PerLine",
  "TaxCalculationMethod": "PerLine"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Acme Corp - Enterprise Platform Deal",
    "description": "Annual enterprise license and support package",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "organizationId": "<organization-guid>",
    "dealUnitFlowId": "<flow-guid>",
    "dealUnitFlowStageId": "<stage-guid>",
    "dealUnitStatus": "Open",
    "dealUnitForecastCategory": "Pipeline",
    "expectedCloseDate": "2026-06-30T00:00:00Z"
  }'
```

**Required fields:**
- `Title` — deal name
- `CurrencyId` — estimated deal currency
- `DealUnitFlowId` — the sales pipeline this deal belongs to
- `DealUnitFlowStageId` — current stage in the pipeline

**Recommended fields:**
- `IndividualId` or `OrganizationId` — CRM contact/organization
- `DealUnitStatus` — `"Open"`, `"Won"`, `"Lost"`, `"Cancelled"`
- `DealUnitForecastCategory` — `"Pipeline"`, `"BestCase"`, `"Committed"`, `"Omitted"`
- `ExpectedCloseDate` — forecast close date
- `CurrentSituation`, `CustomerNeed`, `ProposedSolution` — sales context fields
- `DealUnitPurchaseProcess` — `"Individual"`, `"Committee"`, `"Unknown"`

**Optional fields:**
- `PriceListId` — link to a price list
- `PaymentTermId` — payment terms
- `PartnerCreated`, `PartnerCollaboration` — partner deal flags
- `ExpiryDate` — when the deal opportunity expires
- `DealUnitLines` — inline array of line items
- Billing address fields — `AddressLine1`, `CountryId`, `StateId`, `CityId`, etc.

### Step 3 — Add Deal Unit Lines

```bash
absuite deals create get-deal-unit-lines --TenantId $TENANT_ID --DealUnitId <deal-guid> --DealUnitLineCreateDto '{
  "ItemId": "<item-guid>",
  "ItemTitle": "ABS Enterprise License",
  "ItemShortDescription": "Annual enterprise platform license",
  "Quantity": 10,
  "CurrencyId": "<currency-guid>",
  "ItemPriceId": "<price-guid>",
  "Description": "10 seats of ABS Enterprise"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "<item-guid>",
    "itemTitle": "ABS Enterprise License",
    "quantity": 10,
    "currencyId": "<currency-guid>",
    "itemPriceId": "<price-guid>",
    "dealUnitId": "<deal-guid>"
  }'
```

### Step 4 — Calculate Totals

```bash
absuite deals calculate unit --TenantId $TENANT_ID --DealUnitId <deal-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID/Calculate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Step 5 — Advance the Deal Stage

```bash
absuite deals update unit --TenantId $TENANT_ID --DealUnitId <deal-guid> --DealUnitUpdateDto '{
  "DealUnitFlowStageId": "<proposal-stage-guid>"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dealUnitFlowStageId": "<proposal-stage-guid>"}'
```

## CRUD Operations

### List Deal Units

```bash
absuite deals list units --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Extended Deal Units (with related data)

```bash
absuite deals list extended-deal-units --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Deal Units

```bash
absuite deals count units --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Deal Unit by ID

```bash
absuite deals get unit --TenantId $TENANT_ID --DealUnitId <deal-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Extended Deal Unit

```bash
absuite deals get extended-deal-unit --TenantId $TENANT_ID --DealUnitId <deal-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Deal Unit

```bash
absuite deals update unit --TenantId $TENANT_ID --DealUnitId <deal-guid> --DealUnitUpdateDto '{
  "Title": "Acme Corp - Enterprise Deal (Revised)",
  "DealUnitStatus": "Won",
  "WonDate": "2026-05-15T00:00:00Z",
  "Closed": true,
  "Ordered": true
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Acme Corp - Enterprise Deal (Revised)",
    "dealUnitStatus": "Won",
    "wonDate": "2026-05-15T00:00:00Z",
    "closed": true,
    "ordered": true
  }'
```

### Delete Deal Unit

```bash
absuite deals delete unit --TenantId $TENANT_ID --DealUnitId <deal-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Deal Unit Lines

### List Lines

```bash
absuite deals list unit-lines --TenantId $TENANT_ID --DealUnitId <deal-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Lines

```bash
absuite deals count unit-lines --TenantId $TENANT_ID --DealUnitId <deal-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID/Lines/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Line by ID

```bash
absuite deals get unit-price --TenantId $TENANT_ID --DealUnitId <deal-guid> --DealUnitLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID/Lines/$DEAL_UNIT_LINE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Line

```bash
absuite deals update unit-price --TenantId $TENANT_ID --DealUnitId <deal-guid> --DealUnitLineId <line-guid> --DealUnitLineUpdateDto '{
  "Quantity": 15,
  "Description": "Increased to 15 seats"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID/Lines/$DEAL_UNIT_LINE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 15,
    "description": "Increased to 15 seats"
  }'
```

### Delete Line

```bash
absuite deals delete unit-price --TenantId $TENANT_ID --DealUnitId <deal-guid> --DealUnitLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID/Lines/$DEAL_UNIT_LINE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Calculate a Single Line

```bash
absuite deals calculate unit-line --TenantId $TENANT_ID --DealUnitId <deal-guid> --DealUnitLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID/Lines/$DEAL_UNIT_LINE_ID/Calculate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Deal Unit Flows (Sales Pipelines)

### List Flows

```bash
absuite deals list unit-flows --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Flow by ID

```bash
absuite deals get unit-flow --TenantId $TENANT_ID --DealUnitFlowId <flow-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/$FLOW_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Flow

```bash
absuite deals update unit-flow --TenantId $TENANT_ID --DealUnitFlowId <flow-guid> --DealUnitFlowUpdateDto '{
  "Name": "Enterprise Sales Pipeline (v2)",
  "Description": "Updated pipeline with revised stages"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/$FLOW_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Sales Pipeline (v2)",
    "description": "Updated pipeline with revised stages"
  }'
```

### Delete Flow

```bash
absuite deals delete unit-flow --TenantId $TENANT_ID --DealUnitFlowId <flow-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/$FLOW_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Flows

```bash
absuite deals count unit-flows --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Flow Stages

### List Stages for a Flow

```bash
absuite deals list unit-flow-stages --TenantId $TENANT_ID --DealUnitFlowId <flow-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/$FLOW_ID/Stages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Stage by ID

```bash
absuite deals get unit-flow-stage --TenantId $TENANT_ID --DealUnitFlowStageId <stage-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/$FLOW_ID/Stages/$STAGE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Stage

```bash
absuite deals update unit-flow-stage --TenantId $TENANT_ID --DealUnitFlowStageId <stage-guid> --DealUnitFlowStageUpdateDto '{
  "Name": "Final Review",
  "Order": 5,
  "Description": "Executive approval before closing"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/$FLOW_ID/Stages/$STAGE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Final Review",
    "order": 5,
    "description": "Executive approval before closing"
  }'
```

### Delete Stage

```bash
absuite deals delete unit-flow-stage --TenantId $TENANT_ID --DealUnitFlowStageId <stage-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/$FLOW_ID/Stages/$STAGE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Stages

```bash
absuite deals count unit-flow-stages --TenantId $TENANT_ID --DealUnitFlowId <flow-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnitFlows/$FLOW_ID/Stages/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Sales Literature

Supporting documents and collateral for the sales process.

### List Sales Literature

```bash
absuite deals list sales-literatures --TenantId $TENANT_ID
```

> **Note:** Sales literature endpoints are managed through the `absuite` CLI. REST API endpoints for sales literature are not currently available in the public API.

### List Extended Sales Literature

```bash
absuite deals list extended-sales-literatures --TenantId $TENANT_ID
```

> **Note:** Sales literature endpoints are managed through the `absuite` CLI. REST API endpoints for sales literature are not currently available in the public API.

### Create Sales Literature

```bash
absuite deals create sales-literature --TenantId $TENANT_ID --SalesLiteratureCreateDto '{
  "Title": "ABS Enterprise Platform Overview",
  "Description": "Executive summary of platform capabilities",
  "Content": "The Alliance Business Suite provides a unified platform for CRM, invoicing, inventory, and more..."
}'
```

> **Note:** Sales literature endpoints are managed through the `absuite` CLI. REST API endpoints for sales literature are not currently available in the public API.

### Get by ID

```bash
absuite deals get sales-literature --TenantId $TENANT_ID --SalesLiteratureId <literature-guid>
```

> **Note:** Sales literature endpoints are managed through the `absuite` CLI. REST API endpoints for sales literature are not currently available in the public API.

### Update

```bash
absuite deals update sales-literature --TenantId $TENANT_ID --SalesLiteratureId <literature-guid> --SalesLiteratureUpdateDto '{
  "Title": "ABS Enterprise Platform Overview (Updated)",
  "Content": "Updated content..."
}'
```

> **Note:** Sales literature endpoints are managed through the `absuite` CLI. REST API endpoints for sales literature are not currently available in the public API.

### Delete

```bash
absuite deals delete sales-literature --TenantId $TENANT_ID --SalesLiteratureId <literature-guid>
```

> **Note:** Sales literature endpoints are managed through the `absuite` CLI. REST API endpoints for sales literature are not currently available in the public API.

### Count

```bash
absuite deals count sales-literatures --TenantId $TENANT_ID
```

> **Note:** Sales literature endpoints are managed through the `absuite` CLI. REST API endpoints for sales literature are not currently available in the public API.

## Deal Lifecycle Management

### Mark Deal as Won

```bash
absuite deals update unit --TenantId $TENANT_ID --DealUnitId <deal-guid> --DealUnitUpdateDto '{
  "DealUnitStatus": "Won",
  "WonDate": "2026-05-15T00:00:00Z",
  "Closed": true,
  "DealUnitForecastCategory": "Committed"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dealUnitStatus": "Won",
    "wonDate": "2026-05-15T00:00:00Z",
    "closed": true,
    "dealUnitForecastCategory": "Committed"
  }'
```

### Mark Deal as Lost

```bash
absuite deals update unit --TenantId $TENANT_ID --DealUnitId <deal-guid> --DealUnitUpdateDto '{
  "DealUnitStatus": "Lost",
  "LostDate": "2026-05-15T00:00:00Z",
  "Closed": true
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/DealsService/DealUnits/$DEAL_UNIT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dealUnitStatus": "Lost",
    "lostDate": "2026-05-15T00:00:00Z",
    "closed": true
  }'
```

### Convert Won Deal to Order

After a deal is won, create an order referencing the deal's data. Use the `absuite-orders` skill to create the order, copying the customer info and line items from the deal.

## Full Example: End-to-End Deal Pipeline

```bash
# 1. Authenticate
absuite login --email sales@company.com

# 2. Set tenant
absuite config set --tenant-id 00000000-0000-0000-0000-000000000000

# 3. List existing pipelines (or create one)
absuite deals list unit-flows

# 4. Get stages for the pipeline
absuite deals list unit-flow-stages --DealUnitFlowId <flow-guid>

# 5. Create a deal unit
absuite deals create unit --DealUnitCreateDto '{
  "Title": "Acme Corp - Enterprise Deal",
  "Description": "Annual platform license + support",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "CompanyName": "Acme Corp",
  "BillingEmail": "procurement@acme.com",
  "DealUnitFlowId": "<flow-guid>",
  "DealUnitFlowStageId": "<qualification-stage-guid>",
  "DealUnitStatus": "Open",
  "DealUnitForecastCategory": "Pipeline",
  "ExpectedCloseDate": "2026-06-30T00:00:00Z",
  "CustomerNeed": "Replace legacy ERP",
  "ProposedSolution": "ABS Enterprise Suite"
}'
# Note the returned deal unit ID

# 6. Add line items
absuite deals create get-deal-unit-lines --DealUnitId <deal-id> --DealUnitLineCreateDto '{
  "ItemId": "<item-guid>",
  "ItemTitle": "ABS Enterprise License",
  "Quantity": 10,
  "CurrencyId": "<currency-guid>",
  "ItemPriceId": "<price-guid>"
}'

# 7. Calculate totals
absuite deals calculate unit --DealUnitId <deal-id>

# 8. Advance to Proposal stage
absuite deals update unit --DealUnitId <deal-id> --DealUnitUpdateDto '{
  "DealUnitFlowStageId": "<proposal-stage-guid>"
}'

# 9. After negotiation — mark as Won
absuite deals update unit --DealUnitId <deal-id> --DealUnitUpdateDto '{
  "DealUnitStatus": "Won",
  "WonDate": "2026-06-15T00:00:00Z",
  "DealUnitFlowStageId": "<closed-won-stage-guid>",
  "DealUnitForecastCategory": "Committed",
  "Closed": true,
  "Ordered": true
}'

# 10. Verify
absuite deals get unit --DealUnitId <deal-id>
```

## API Endpoints Quick Reference

| Action | REST Endpoint |
|---|---|
| Create deal unit | `POST /api/v2/DealsService/DealUnits` |
| List deal units | `GET /api/v2/DealsService/DealUnits` |
| Count deal units | `GET /api/v2/DealsService/DealUnits/Count` |
| Extended deal units | `GET /api/v2/DealsService/DealUnits/Extended` |
| Get deal unit | `GET /api/v2/DealsService/DealUnits/:dealUnitId` |
| Get extended deal unit | `GET /api/v2/DealsService/DealUnits/:dealUnitId/Extended` |
| Update deal unit | `PUT /api/v2/DealsService/DealUnits/:dealUnitId` |
| Delete deal unit | `DELETE /api/v2/DealsService/DealUnits/:dealUnitId` |
| Calculate deal unit | `PUT /api/v2/DealsService/DealUnits/:dealUnitId/Calculate` |
| Create line | `POST /api/v2/DealsService/DealUnits/:dealUnitId/Lines` |
| List lines | `GET /api/v2/DealsService/DealUnits/:dealUnitId/Lines` |
| Count lines | `GET /api/v2/DealsService/DealUnits/:dealUnitId/Lines/Count` |
| Get line | `GET /api/v2/DealsService/DealUnits/:dealUnitId/Lines/:dealUnitLineId` |
| Update line | `PUT /api/v2/DealsService/DealUnits/:dealUnitId/Lines/:dealUnitLineId` |
| Delete line | `DELETE /api/v2/DealsService/DealUnits/:dealUnitId/Lines/:dealUnitLineId` |
| Calculate line | `PUT /api/v2/DealsService/DealUnits/:dealUnitId/Lines/:dealUnitLineId/Calculate` |
| Create flow | `POST /api/v2/DealsService/DealUnitFlows` |
| List flows | `GET /api/v2/DealsService/DealUnitFlows` |
| Count flows | `GET /api/v2/DealsService/DealUnitFlows/Count` |
| Get flow | `GET /api/v2/DealsService/DealUnitFlows/:dealUnitFlowId` |
| Update flow | `PUT /api/v2/DealsService/DealUnitFlows/:dealUnitFlowId` |
| Delete flow | `DELETE /api/v2/DealsService/DealUnitFlows/:dealUnitFlowId` |
| Create stage | `POST /api/v2/DealsService/DealUnitFlows/:dealUnitFlowId/Stages` |
| List stages | `GET /api/v2/DealsService/DealUnitFlows/:dealUnitFlowId/Stages` |
| Count stages | `GET /api/v2/DealsService/DealUnitFlows/:dealUnitFlowId/Stages/Count` |
| Get stage | `GET /api/v2/DealsService/DealUnitFlows/:dealUnitFlowId/Stages/:dealUnitFlowStageId` |
| Update stage | `PUT /api/v2/DealsService/DealUnitFlows/:dealUnitFlowId/Stages/:dealUnitFlowStageId` |
| Delete stage | `DELETE /api/v2/DealsService/DealUnitFlows/:dealUnitFlowId/Stages/:dealUnitFlowStageId` |
