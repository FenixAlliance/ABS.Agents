---
name: absuite-cli
description: >
  General-purpose usage of the `absuite` CLI for interacting with the Alliance
  Business Suite (ABS) API. Covers service discovery, command discovery, calling
  API functions, passing parameters and JSON bodies, reading help and output
  schemas, OData queries, tenant scoping, and interpreting responses. Use for
  any ABS domain operation (tenants, invoices, contacts, catalog, CRM, etc.)
  after authentication. Do NOT use for login/authentication — use the
  `absuite-login` skill instead.
---

# Alliance Business Suite — CLI Usage Skill

## Purpose

Use this skill for any domain-specific ABS operation via the `absuite` CLI. This covers querying data, creating records, updating entities, and any other ABS API interaction.

For **authentication** (login, token management, identity verification), use the `absuite-login` skill instead.

---

## Prerequisites

1. **CLI installed system-wide** — `absuite` must be on `PATH`. Verify with `absuite --version`.
2. **Authenticated session** — Run `absuite login` first (see `absuite-login` skill). The CLI caches the token in `~/.absuite/config.json` and uses it automatically for all subsequent calls.
3. **Tenant context** — Most operations are tenant-scoped. Either set a default tenant (`absuite config set --tenant-id <guid>`) or pass `--TenantId <guid>` on each call.

---

## CLI Structure

```
absuite <service> <verb> <entity> [--param value ...]
absuite <service> <FunctionName> [--param value ...]
```

The CLI supports two addressing styles:

| Style | Example | Description |
|---|---|---|
| **Alias** (human-friendly) | `absuite crm list contacts` | Verb + entity shorthand |
| **Function name** (canonical) | `absuite crm Get-ContactsAsync` | Original PowerShell function name |

Both styles are interchangeable. Aliases are derived automatically from function names.

---

## Service Discovery

### List All Services

```bash
absuite services
```

### Available Services

| Service | Domain |
|---|---|
| `accounting` | Chart of accounts, journal entries, ledgers, fiscal periods |
| `assets` | Digital and physical asset management |
| `cart` | Shopping cart operations |
| `catalog` | Products, categories, product families, item groups |
| `content` | CMS content, pages, blogs, media |
| `crm` | Contacts, organizations, opportunities, pipelines |
| `deals` | Deal flow, deal stages |
| `email` | Email templates |
| `forex` | Foreign exchange rates |
| `globe` | Countries, currencies, languages, time zones |
| `hrms` | Employees, departments, job titles |
| `identity` | OAuth, WhoAmI, identity verification |
| `inventory` | Inventory tracking |
| `invoicing` | Invoices, credit notes, debit notes |
| `learning` | Courses, lessons, enrollments, quizzes |
| `locations` | Physical locations, addresses |
| `logistics` | Shipping logistics |
| `marketing` | Campaigns, email lists, social posts |
| `marketplace` | Marketplace listings |
| `orders` | Purchase orders, sales orders |
| `payments` | Payment records, payment gateways |
| `pricing` | Price lists, discount rules |
| `projects` | Project management, tasks, milestones |
| `quotes` | Quotes, quote lines |
| `sales` | Sales pipelines |
| `security` | Roles, permissions, API keys, entitlements |
| `services` | Service tickets, SLAs |
| `shipments` | Shipment tracking |
| `social` | Social profiles, posts, notifications |
| `storage` | File storage, blobs |
| `subscriptions` | Subscription plans, billing cycles |
| `support` | Support tickets, knowledge base |
| `system` | System configuration, health checks |
| `tenants` | Tenant management, enrollments, settings |
| `timetracker` | Time entries, timesheets |
| `users` | User profiles, user settings |
| `wallets` | Wallets, balances, wallet payments |

---

## Command Discovery

### List All Commands for a Service

```bash
absuite <service> list-commands
```

Example:

```bash
absuite crm list-commands
```

Output shows each command with its alias and description:

```
  list contacts               List contacts for a tenant
  count contacts              Count contacts for a tenant
  get contact                 Get a contact by ID
  create contact              Create a new contact
  update contact              Update an existing contact
  delete contact              Delete a contact
  ...
```

### Get Detailed Help for a Command

```bash
absuite <service> <command> --help
```

Example:

```bash
absuite crm list contacts --help
```

The `--help` output includes:

- **Usage** — both alias and canonical function name
- **Description** — what the command does
- **Parameters** — all parameters with types and whether they are required
- **Object schemas** — for any parameter that accepts a complex DTO (shows all properties with types)
- **Returns** — the output envelope type and its properties, plus the inner DTO schema if applicable
- **Common options** — `--ReturnType` and `--WithHttpInfo`

---

## Calling API Functions

### Basic Syntax

```bash
absuite <service> <verb> <entity> --ParamName value
```

### Passing Simple Parameters

```bash
absuite crm get contact --TenantId my-tenant-guid --ContactId abc-123
```

### Passing JSON Object Parameters

For parameters that accept a DTO (shown as `<SomeCreateDto>` in help), pass a JSON string:

```bash
absuite crm create contact --TenantId my-tenant-guid --ContactCreateDto '{"firstName":"John","lastName":"Doe","email":"john@example.com"}'
```

### Using the Canonical Function Name

```bash
absuite crm Get-ContactsAsync --TenantId my-tenant-guid
```

---

## Tenant Scoping

Most ABS operations are tenant-scoped. There are two ways to provide the tenant context:

### Option 1: Default Tenant (Recommended for Agents)

Set once, used for all subsequent calls:

```bash
absuite config set --tenant-id <tenant-guid>
```

Then call without `--TenantId`:

```bash
absuite crm list contacts
```

### Option 2: Per-Call Tenant

Pass explicitly on each call:

```bash
absuite crm list contacts --TenantId <tenant-guid>
```

### Discovering Available Tenants

```bash
absuite tenants list tenants
```

---

## Understanding Responses

### Envelope Pattern

All ABS API responses follow the envelope pattern:

```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "<guid>",
  "timestamp": "2026-04-18T12:00:00Z",
  "activityId": "<guid>",
  "result": <actual-data>
}
```

- `isSuccess` — whether the operation succeeded
- `errorMessage` — error details if `isSuccess` is `false`
- `result` — the actual payload (a single object, an array, a count, or null)

### List Responses

For list operations, `result` is an array:

```json
{
  "isSuccess": true,
  "result": [
    { "id": "...", "firstName": "John", ... },
    { "id": "...", "firstName": "Jane", ... }
  ]
}
```

### Count Responses

For count operations, `result` is an integer:

```json
{
  "isSuccess": true,
  "result": 42
}
```

### Error Responses

```json
{
  "isSuccess": false,
  "errorMessage": "The requested resource was not found.",
  "result": null
}
```

---

## Common Verb Patterns

The CLI uses consistent verb patterns across all services:

| Alias Verb | HTTP Method | Meaning |
|---|---|---|
| `list` | GET | Retrieve a collection |
| `count` | GET | Get the count of a collection |
| `get` | GET | Retrieve a single entity by ID |
| `create` | POST | Create a new entity |
| `update` | PUT | Full update of an entity |
| `delete` | DELETE | Remove an entity |

---

## Advanced Options

### Return Type Override

Force a specific MIME type for the response:

```bash
absuite crm list contacts --TenantId <guid> --ReturnType application/xml
```

### Full HTTP Response

Get the full response including status code and headers:

```bash
absuite crm list contacts --TenantId <guid> --WithHttpInfo
```

---

## Workflow Example: Full CRUD Cycle

```bash
# 1. Discover commands
absuite crm list-commands

# 2. Check parameter schema
absuite crm create contact --help

# 3. Create a contact
absuite crm create contact --TenantId $TENANT_ID --ContactCreateDto '{"firstName":"Alice","lastName":"Smith","email":"alice@example.com"}'

# 4. List contacts to find the new one
absuite crm list contacts --TenantId $TENANT_ID

# 5. Get a specific contact
absuite crm get contact --TenantId $TENANT_ID --ContactId <contact-guid>

# 6. Update the contact
absuite crm update contact --TenantId $TENANT_ID --ContactId <contact-guid> --ContactUpdateDto '{"firstName":"Alice","lastName":"Johnson"}'

# 7. Delete the contact
absuite crm delete contact --TenantId $TENANT_ID --ContactId <contact-guid>
```

---

## REST API Alternative

Every operation available through the CLI has a corresponding REST API endpoint. If you prefer or need to use HTTP directly:

1. **Authenticate** via `POST $ABSUITE_HOST_URL/login` to obtain a bearer token.
2. **Use the base path** `$ABSUITE_HOST_URL/api/v2/{ServiceName}/{Resource}` for all calls.
3. **Pass the token** via `-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"` on every request.

### CLI Service → REST API Mapping

| CLI Service | REST Service Prefix | Example Endpoint |
|---|---|---|
| `absuite accounting` | AccountingService | `/api/v2/AccountingService/JournalEntries` |
| `absuite assets` | AssetsService | `/api/v2/AssetsService/Assets` |
| `absuite billing` | BillingService | `/api/v2/BillingService/Invoices` |
| `absuite catalog` | CatalogService | `/api/v2/CatalogService/Items` |
| `absuite contacts` | ContactsService | `/api/v2/ContactsService/Contacts` |
| `absuite content` | ContentService | `/api/v2/ContentService/Posts` |
| `absuite crm` | CRMService | `/api/v2/CRMService/Leads` |
| `absuite education` | EducationService | `/api/v2/EducationService/Courses` |
| `absuite forex` | ForexService | `/api/v2/ForexService/CurrencyPairRates` |
| `absuite globe` | GlobeService | `/api/v2/GlobeService/Countries` |
| `absuite hr` | HRService | `/api/v2/HRService/Employees` |
| `absuite inventory` | InventoryService | `/api/v2/InventoryService/Inventory/:stockItemId/Details` |
| `absuite locations` | LocationsService | `/api/v2/LocationsService/Countries` |
| `absuite logistics` | LogisticsService | `/api/v2/LogisticsService/Warehouses` |
| `absuite marketplace` | MarketplaceService | `/api/v2/MarketplaceService/Listings` |
| `absuite orders` | OrdersService | `/api/v2/OrdersService/Orders` |
| `absuite pricing` | PricingService | `/api/v2/PricingService/PriceLists` |
| `absuite quotes` | QuotesService | `/api/v2/QuotesService/Quotes` |
| `absuite sales` | SalesService | `/api/v2/SalesService/Stores` |
| `absuite shipments` | ShipmentsService | `/api/v2/ShipmentsService/Shipments` |
| `absuite subscriptions` | SubscriptionsService | `/api/v2/SubscriptionsService/SubscriptionPlans` |
| `absuite support` | SupportService | `/api/v2/SupportService/SupportTickets` |
| `absuite system` | SystemService | `/api/v2/SystemService/Health` |
| `absuite wallets` | WalletsService | `/api/v2/WalletsService/Wallets` |

For full endpoint listings per service, see the corresponding skill documentation (e.g., `absuite-globe`, `absuite-support`, `absuite-assets`, etc.).

---

## Critical Rules

- **Always authenticate first.** Use the `absuite-login` skill if no valid session exists.
- **Always check `--help` before calling unfamiliar commands.** It shows exact parameter names, types, required fields, and the output schema.
- **Use `list-commands` for discovery.** Don't guess command names — discover them.
- **Respect tenant scoping.** Most operations require `--TenantId` or a configured default tenant.
- **Parse the envelope.** The actual data is inside the `result` field. Always check `isSuccess` before using `result`.
- **Parameter names are case-sensitive.** Use the exact casing shown in `--help` (e.g., `--TenantId`, not `--tenantid`).
- **JSON string parameters must be valid JSON.** For DTO parameters, ensure the JSON matches the schema shown in `--help`.
- **The CLI handles authentication automatically.** Tokens are cached — you do not need to pass bearer tokens or auth headers.
