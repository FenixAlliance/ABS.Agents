---
name: absuite-deals-cli
description: >
  Manage deal units (sales opportunities), deal unit lines, deal unit flows (sales
  pipelines) with their stages, and sales literature using the `absuite` CLI's `deals`
  service. Covers list / count / get / create / update / delete / calculate commands.
  Requires an authenticated CLI session (see `absuite-login-cli`). For atomic PATCH
  updates or raw HTTP, use the `absuite-deals` (REST) skill.
---

# Alliance Business Suite — Deals (CLI)

Manage **deal units** (sales opportunities) and **deal unit flows** (sales pipelines) through the `absuite` CLI's `deals` service. A deal tracks a potential sale — its customer, value, line items, and lifecycle — as it moves through the stages of a pipeline. All deal commands are tenant-scoped.

> For general CLI usage (install, login, config, output format), see `absuite-cli` and `absuite-login-cli`.
> The CLI does **not** support PATCH (partial JSON Patch updates) or raw HTTP — for those, use the `absuite-deals` (REST) skill.

## Prerequisites

1. **Authenticate first** with `absuite login` (see `absuite-login-cli`):
   ```bash
   absuite login --email <your-email>
   ```
2. **Set your tenant** — every deal command requires a tenant. Either set a default once:
   ```bash
   absuite config set --tenant-id <tenant-guid>
   ```
   …or pass `--TenantId <tenant-guid>` on each call. (The CLI auto-injects the default TenantId when set.)
3. **Discover commands** — list everything the `deals` service exposes, or get full parameter/DTO schemas for any command:
   ```bash
   absuite deals list-commands
   absuite deals create unit --help
   ```

## Command structure

```
absuite deals <verb> <entity> [--Param value ...]
```

- **Verbs available for `deals`:** `list`, `count`, `get`, `create`, `update`, `delete`, `calculate`.
  (There is no `search` verb for this service.)
- DTO parameters are passed as a single-quoted JSON string, e.g. `--DealUnitCreateDto '{ ... }'`, with **PascalCase** field names matching the schema shown by `--help`.
- The original generated function name also works in place of the `<verb> <entity>` alias, e.g. `absuite deals New-DealUnitAsync` ≡ `absuite deals create unit`.

## Key Concepts

- **Deal Unit** — a sales opportunity (customer, financial totals, pipeline assignment, lifecycle status).
- **Deal Unit Line** — a product/item line within a deal (quantity, pricing, cost/tax breakdown). In CLI commands the line entity is spelled **`unit-line`** for `calculate`, and **`unit-price`** for `get`/`update`/`delete` of a single line. List/count use **`unit-lines`**.
- **Deal Unit Flow** — a sales pipeline (entity `unit-flow` / `unit-flows`).
- **Deal Unit Flow Stage** — an ordered step in a flow (entity `unit-flow-stage` / `unit-flow-stages`).
- **Sales Literature** — supporting documents/collateral for the sales process (entity `sales-literature` / `sales-literatures`).
- **DealUnitStatus** — `Open` | `Won` | `Lost` | `Frozen`.
- **DealUnitForecastCategory** — `None` | `Pipeline` | `BestCase` | `Commited` | `Ommited` | `Won` | `Lost`.
- **DealUnitPurchaseProcess** — `None` | `Individual` | `Commitee` | `Unknown`.
- **DealUnitAmountsCalculation** — `UserProvided` | `SystemCalculated`.
- **CostCalculationMethod** — `Automatic` | `Custom`. **TaxCalculationMethod** — `Included` | `Excluded`.

> Enum spellings (`Commited`, `Ommited`, `Commitee`) are transcribed verbatim from the API schema — use them exactly.

## Workflow: Creating a Deal

1. **Ensure a flow exists** — a deal is assigned to a pipeline (flow) and a stage.
2. **Create the deal unit** — with customer, currency, and flow/stage assignment.
3. **(Optional) Add lines** for specific products.
4. **Calculate totals** — let the server compute the financial summary.
5. **Progress the deal** — advance the stage with `update`.
6. **Close** — mark the deal `Won` or `Lost`.

### Step 1 — Set up a sales pipeline (if needed)

```bash
# List existing flows
absuite deals list unit-flows --TenantId <tenant-guid>

# Create a flow
absuite deals create unit-flow --TenantId <tenant-guid> --DealUnitFlowCreateDto '{
  "Name": "Enterprise Sales Pipeline",
  "Description": "Standard B2B sales process for enterprise accounts"
}'

# Add stages (note: DealUnitFlowId is required on stage commands)
absuite deals create unit-flow-stage --TenantId <tenant-guid> --DealUnitFlowStageCreateDto '{
  "Name": "Qualification",
  "Order": 1,
  "Description": "Initial lead qualification",
  "DealUnitFlowId": "<flow-guid>"
}'

# List stages for the flow
absuite deals list unit-flow-stages --TenantId <tenant-guid> --DealUnitFlowId <flow-guid>
```

### Step 2 — Create a deal unit

```bash
absuite deals create unit --TenantId <tenant-guid> --DealUnitCreateDto '{
  "Title": "Acme Corp - Enterprise Platform Deal",
  "Description": "Annual enterprise license and support package",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "OrganizationId": "<organization-guid>",
  "CompanyName": "Acme Corp",
  "BillingEmail": "<billing-email>",
  "DealUnitFlowId": "<flow-guid>",
  "DealUnitFlowStageId": "<qualification-stage-guid>",
  "DealUnitStatus": "Open",
  "DealUnitForecastCategory": "Pipeline",
  "DealUnitPurchaseProcess": "Commitee",
  "DealUnitAmountsCalculation": "SystemCalculated",
  "ExpectedCloseDate": "2026-06-30T00:00:00Z",
  "CurrentSituation": "Prospect using a competitor product with an expiring contract",
  "CustomerNeed": "Unified platform for CRM, invoicing, and inventory",
  "ProposedSolution": "ABS Enterprise with Premium Support",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded"
}'
```

**`DealUnitCreateDto` highlights** (run `absuite deals create unit --help` for the full schema): `Title`, `Description`, `CurrencyId`, `IndividualId`, `OrganizationId`, `FirstName`, `LastName`, `CompanyName`, `BillingEmail`, `PriceListId`, `PaymentTermId`, `ReceiverTenantId`, `DealUnitFlowId`, `DealUnitFlowStageId`, `DealUnitStatus`, `DealUnitForecastCategory`, `DealUnitPurchaseProcess`, `DealUnitAmountsCalculation`, `ExpectedCloseDate`, `ExpiryDate`, `WonDate`, `LostDate`, `CurrentSituation`, `CustomerNeed`, `ProposedSolution`, `CostCalculationMethod`, `TaxCalculationMethod`, `Closed`, `PartnerCreated`, `PartnerCollaboration`, billing-address fields, the `Total*`/`Total*CurrencyId` money pairs, and `DealUnitLines` (inline array).

### Step 3 — Add deal unit lines

```bash
absuite deals create get-deal-unit-lines --TenantId <tenant-guid> --DealUnitId <deal-unit-guid> --DealUnitLineCreateDto '{
  "ItemId": "<item-guid>",
  "ItemTitle": "ABS Enterprise License",
  "ItemShortDescription": "Annual enterprise platform license",
  "Description": "10 seats of ABS Enterprise",
  "Quantity": 10,
  "CurrencyId": "<currency-guid>",
  "ItemPriceId": "<item-price-guid>"
}'
```

> The create-line command alias is `create get-deal-unit-lines` (the generated function is `New-GetDealUnitLinesAsync`). It takes `--DealUnitId` plus `--DealUnitLineCreateDto`.

### Step 4 — Calculate totals

```bash
absuite deals calculate unit --TenantId <tenant-guid> --DealUnitId <deal-unit-guid>
```

### Step 5 — Advance the deal stage

```bash
absuite deals update unit --TenantId <tenant-guid> --DealUnitId <deal-unit-guid> --DealUnitUpdateDto '{
  "DealUnitFlowStageId": "<proposal-stage-guid>"
}'
```

---

## Deal Units

```bash
# List
absuite deals list units --TenantId <tenant-guid>

# List extended (with related data)
absuite deals list extended-deal-units --TenantId <tenant-guid>

# Count
absuite deals count units --TenantId <tenant-guid>

# Get by ID
absuite deals get unit --TenantId <tenant-guid> --DealUnitId <deal-unit-guid>

# Get extended by ID
absuite deals get extended-deal-unit --TenantId <tenant-guid> --DealUnitId <deal-unit-guid>

# Update (full editable shape; use the DealUnitUpdateDto schema)
absuite deals update unit --TenantId <tenant-guid> --DealUnitId <deal-unit-guid> --DealUnitUpdateDto '{
  "Title": "Acme Corp - Enterprise Deal (Revised)",
  "DealUnitStatus": "Won",
  "WonDate": "2026-05-15T00:00:00Z",
  "Closed": true,
  "Ordered": true
}'

# Calculate server-computed totals
absuite deals calculate unit --TenantId <tenant-guid> --DealUnitId <deal-unit-guid>

# Delete
absuite deals delete unit --TenantId <tenant-guid> --DealUnitId <deal-unit-guid>
```

## Deal Unit Lines

```bash
# List lines for a deal
absuite deals list unit-lines --TenantId <tenant-guid> --DealUnitId <deal-unit-guid>

# Count lines
absuite deals count unit-lines --TenantId <tenant-guid> --DealUnitId <deal-unit-guid>

# Get a single line by ID
absuite deals get unit-price --TenantId <tenant-guid> --DealUnitId <deal-unit-guid> --DealUnitLineId <line-guid>

# Update a line
absuite deals update unit-price --TenantId <tenant-guid> --DealUnitId <deal-unit-guid> --DealUnitLineId <line-guid> --DealUnitLineUpdateDto '{
  "Quantity": 15,
  "Description": "Increased to 15 seats"
}'

# Calculate a single line
absuite deals calculate unit-line --TenantId <tenant-guid> --DealUnitId <deal-unit-guid> --DealUnitLineId <line-guid>

# Delete a line
absuite deals delete unit-price --TenantId <tenant-guid> --DealUnitId <deal-unit-guid> --DealUnitLineId <line-guid>
```

> Note the entity spellings: single-line `get`/`update`/`delete` use **`unit-price`**, single-line `calculate` uses **`unit-line`**, and list/count use **`unit-lines`**. All take `--DealUnitId`; single-line ones also take `--DealUnitLineId`.

## Deal Unit Flows (Sales Pipelines)

```bash
# List flows
absuite deals list unit-flows --TenantId <tenant-guid>

# Count flows
absuite deals count unit-flows --TenantId <tenant-guid>

# Get a flow by ID
absuite deals get unit-flow --TenantId <tenant-guid> --DealUnitFlowId <flow-guid>

# Create a flow
absuite deals create unit-flow --TenantId <tenant-guid> --DealUnitFlowCreateDto '{
  "Name": "Enterprise Sales Pipeline",
  "Description": "Standard B2B sales process",
  "ParentBusinessProcessId": "<business-process-guid>"
}'

# Update a flow
absuite deals update unit-flow --TenantId <tenant-guid> --DealUnitFlowId <flow-guid> --DealUnitFlowUpdateDto '{
  "Name": "Enterprise Sales Pipeline (v2)",
  "Description": "Updated pipeline with revised stages"
}'

# Delete a flow
absuite deals delete unit-flow --TenantId <tenant-guid> --DealUnitFlowId <flow-guid>
```

## Flow Stages

Stage commands always require `--DealUnitFlowId`; single-stage commands also require `--DealUnitFlowStageId`.

```bash
# List stages for a flow
absuite deals list unit-flow-stages --TenantId <tenant-guid> --DealUnitFlowId <flow-guid>

# Count stages for a flow
absuite deals count unit-flow-stages --TenantId <tenant-guid> --DealUnitFlowId <flow-guid>

# Get a stage by ID
absuite deals get unit-flow-stage --TenantId <tenant-guid> --DealUnitFlowId <flow-guid> --DealUnitFlowStageId <stage-guid>

# Create a stage
absuite deals create unit-flow-stage --TenantId <tenant-guid> --DealUnitFlowStageCreateDto '{
  "Name": "Qualification",
  "Order": 1,
  "Description": "Initial lead qualification",
  "DealUnitFlowId": "<flow-guid>"
}'

# Update a stage
absuite deals update unit-flow-stage --TenantId <tenant-guid> --DealUnitFlowId <flow-guid> --DealUnitFlowStageId <stage-guid> --DealUnitFlowStageUpdateDto '{
  "Name": "Final Review",
  "Order": 5,
  "Description": "Executive approval before closing",
  "DealUnitFlowId": "<flow-guid>"
}'

# Delete a stage
absuite deals delete unit-flow-stage --TenantId <tenant-guid> --DealUnitFlowId <flow-guid> --DealUnitFlowStageId <stage-guid>
```

## Sales Literature

Supporting documents and collateral for the sales process.

```bash
# List
absuite deals list sales-literatures --TenantId <tenant-guid>

# List extended
absuite deals list extended-sales-literatures --TenantId <tenant-guid>

# Count
absuite deals count sales-literatures --TenantId <tenant-guid>

# Get by ID
absuite deals get sales-literature --TenantId <tenant-guid> --SalesLiteratureId <literature-guid>

# Create
absuite deals create sales-literature --TenantId <tenant-guid> --SalesLiteratureCreateDto '{
  "Title": "ABS Enterprise Platform Overview",
  "Content": "The Alliance Business Suite provides a unified platform for CRM, invoicing, inventory, and more...",
  "Description": "Executive summary of platform capabilities",
  "ExpirationDate": "2027-01-01T00:00:00Z",
  "SalesLiteratureTypeId": "<literature-type-guid>"
}'

# Update
absuite deals update sales-literature --TenantId <tenant-guid> --SalesLiteratureId <literature-guid> --SalesLiteratureUpdateDto '{
  "Title": "ABS Enterprise Platform Overview (Updated)",
  "Content": "Updated content..."
}'

# Delete
absuite deals delete sales-literature --TenantId <tenant-guid> --SalesLiteratureId <literature-guid>
```

**`SalesLiteratureCreateDto` fields:** `Title`, `Content`, `Description`, `ModifiedDate`, `ExpirationDate`, `SalesLiteratureTypeId` (plus `Id`, `Timestamp`, `TenantId`, `EnrollmentId`, generally server-managed). **`SalesLiteratureUpdateDto`** drops `Id`/`Timestamp`. Run `absuite deals create sales-literature --help` for the live schema.

> Sales literature is exposed by the CLI only — there is **no** sales-literature REST endpoint, so it has no counterpart in the `absuite-deals` (REST) skill.

---

## Deal Lifecycle Management

```bash
# Mark a deal as Won
absuite deals update unit --TenantId <tenant-guid> --DealUnitId <deal-unit-guid> --DealUnitUpdateDto '{
  "DealUnitStatus": "Won",
  "WonDate": "2026-05-15T00:00:00Z",
  "Closed": true,
  "DealUnitForecastCategory": "Won"
}'

# Mark a deal as Lost
absuite deals update unit --TenantId <tenant-guid> --DealUnitId <deal-unit-guid> --DealUnitUpdateDto '{
  "DealUnitStatus": "Lost",
  "LostDate": "2026-05-15T00:00:00Z",
  "Closed": true
}'
```

After a deal is `Won`, create an order referencing its customer and line items using the `absuite-orders-cli` skill.

---

## Full Example: End-to-End Deal Pipeline

```bash
# 1. Authenticate
absuite login --email <your-email>

# 2. Set the default tenant
absuite config set --tenant-id <tenant-guid>

# 3. List existing pipelines (or create one)
absuite deals list unit-flows

# 4. Create a flow + a stage
absuite deals create unit-flow --DealUnitFlowCreateDto '{ "Name": "Enterprise Sales Pipeline" }'
absuite deals create unit-flow-stage --DealUnitFlowStageCreateDto '{ "Name": "Qualification", "Order": 1, "DealUnitFlowId": "<flow-guid>" }'

# 5. Create a deal unit
absuite deals create unit --DealUnitCreateDto '{
  "Title": "Acme Corp - Enterprise Deal",
  "CurrencyId": "<currency-guid>",
  "CompanyName": "Acme Corp",
  "BillingEmail": "<billing-email>",
  "DealUnitFlowId": "<flow-guid>",
  "DealUnitFlowStageId": "<qualification-stage-guid>",
  "DealUnitStatus": "Open",
  "DealUnitForecastCategory": "Pipeline",
  "ExpectedCloseDate": "2026-06-30T00:00:00Z"
}'
# → note the returned deal unit id

# 6. Add a line item
absuite deals create get-deal-unit-lines --DealUnitId <deal-unit-guid> --DealUnitLineCreateDto '{
  "ItemId": "<item-guid>",
  "ItemTitle": "ABS Enterprise License",
  "Quantity": 10,
  "CurrencyId": "<currency-guid>",
  "ItemPriceId": "<item-price-guid>"
}'

# 7. Calculate totals
absuite deals calculate unit --DealUnitId <deal-unit-guid>

# 8. Advance to the proposal stage
absuite deals update unit --DealUnitId <deal-unit-guid> --DealUnitUpdateDto '{ "DealUnitFlowStageId": "<proposal-stage-guid>" }'

# 9. After negotiation — mark as Won
absuite deals update unit --DealUnitId <deal-unit-guid> --DealUnitUpdateDto '{
  "DealUnitStatus": "Won",
  "WonDate": "2026-06-15T00:00:00Z",
  "DealUnitFlowStageId": "<closed-won-stage-guid>",
  "DealUnitForecastCategory": "Won",
  "Closed": true,
  "Ordered": true
}'

# 10. Verify
absuite deals get unit --DealUnitId <deal-unit-guid>
```

---

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List deal units | `absuite deals list units` |
| List extended deal units | `absuite deals list extended-deal-units` |
| Count deal units | `absuite deals count units` |
| Get deal unit | `absuite deals get unit --DealUnitId <id>` |
| Get extended deal unit | `absuite deals get extended-deal-unit --DealUnitId <id>` |
| Create deal unit | `absuite deals create unit --DealUnitCreateDto '{…}'` |
| Update deal unit | `absuite deals update unit --DealUnitId <id> --DealUnitUpdateDto '{…}'` |
| Calculate deal unit | `absuite deals calculate unit --DealUnitId <id>` |
| Delete deal unit | `absuite deals delete unit --DealUnitId <id>` |
| List lines | `absuite deals list unit-lines --DealUnitId <id>` |
| Count lines | `absuite deals count unit-lines --DealUnitId <id>` |
| Get line | `absuite deals get unit-price --DealUnitId <id> --DealUnitLineId <id>` |
| Create line | `absuite deals create get-deal-unit-lines --DealUnitId <id> --DealUnitLineCreateDto '{…}'` |
| Update line | `absuite deals update unit-price --DealUnitId <id> --DealUnitLineId <id> --DealUnitLineUpdateDto '{…}'` |
| Calculate line | `absuite deals calculate unit-line --DealUnitId <id> --DealUnitLineId <id>` |
| Delete line | `absuite deals delete unit-price --DealUnitId <id> --DealUnitLineId <id>` |
| List flows | `absuite deals list unit-flows` |
| Count flows | `absuite deals count unit-flows` |
| Get flow | `absuite deals get unit-flow --DealUnitFlowId <id>` |
| Create flow | `absuite deals create unit-flow --DealUnitFlowCreateDto '{…}'` |
| Update flow | `absuite deals update unit-flow --DealUnitFlowId <id> --DealUnitFlowUpdateDto '{…}'` |
| Delete flow | `absuite deals delete unit-flow --DealUnitFlowId <id>` |
| List flow stages | `absuite deals list unit-flow-stages --DealUnitFlowId <id>` |
| Count flow stages | `absuite deals count unit-flow-stages --DealUnitFlowId <id>` |
| Get flow stage | `absuite deals get unit-flow-stage --DealUnitFlowId <id> --DealUnitFlowStageId <id>` |
| Create flow stage | `absuite deals create unit-flow-stage --DealUnitFlowStageCreateDto '{…}'` |
| Update flow stage | `absuite deals update unit-flow-stage --DealUnitFlowId <id> --DealUnitFlowStageId <id> --DealUnitFlowStageUpdateDto '{…}'` |
| Delete flow stage | `absuite deals delete unit-flow-stage --DealUnitFlowId <id> --DealUnitFlowStageId <id>` |
| List sales literature | `absuite deals list sales-literatures` |
| List extended sales literature | `absuite deals list extended-sales-literatures` |
| Count sales literature | `absuite deals count sales-literatures` |
| Get sales literature | `absuite deals get sales-literature --SalesLiteratureId <id>` |
| Create sales literature | `absuite deals create sales-literature --SalesLiteratureCreateDto '{…}'` |
| Update sales literature | `absuite deals update sales-literature --SalesLiteratureId <id> --SalesLiteratureUpdateDto '{…}'` |
| Delete sales literature | `absuite deals delete sales-literature --SalesLiteratureId <id>` |

> Pass `--TenantId <tenant-guid>` on every command (or set a default tenant with `absuite config set --tenant-id <guid>`). The CLI has **no PATCH** support — for atomic partial updates, use the `absuite-deals` (REST) skill.
