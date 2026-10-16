---
name: absuite-rest
key: fenixalliance.absuite.rest
version: 1.1.0
description: >
  General-purpose usage of the Alliance Business Suite (ABS) REST API over HTTP
  (curl / any HTTP client). Covers authentication, the base URL pattern, the
  response envelope, per-endpoint tenant scoping (query param vs header vs
  user/public scope), OData list queries, and atomic PATCH (JSON Patch) updates.
  Use for any ABS domain operation (invoices, contacts, catalog, tenants, etc.)
  via direct REST. For authentication only, see absuite-login. For the `absuite`
  CLI wrapper instead of raw HTTP, see absuite-cli.
---

# Alliance Business Suite: REST API Usage Skill

Use this skill for any ABS operation over the **REST API** with a bearer token. It documents the conventions every per-service REST skill (`absuite-<domain>`) builds on. For CLI usage, see `absuite-cli`.

## Prerequisites

1. **A bearer token.** Authenticate first (see the `absuite-login` skill). In short: `POST $ABSUITE_HOST_URL/login` with `{"email","password"}` returns an `accessToken` and a `refreshToken`. When the access token expires, `POST $ABSUITE_HOST_URL/refresh` with `{"refreshToken"}` returns a new pair. Machine clients can use the client-credentials flow at `POST $ABSUITE_HOST_URL/api/v2/OAuth/Token`.
2. **The host URL** in `$ABSUITE_HOST_URL` (e.g. `https://absuite.net`, no trailing slash).

```bash
# Read credentials/host from the environment; never hard-code them.
ABSUITE_ACCESS_TOKEN=$(curl -s -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ABSUITE_USER_EMAIL\",\"password\":\"$ABSUITE_USER_PASSWORD\"}" \
  | jq -r '.accessToken')
```

Send the token on every subsequent call:

```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

To check who the token belongs to, call `GET $ABSUITE_HOST_URL/api/v2/Me` (user-scoped, no tenant).

## URL pattern

```
$ABSUITE_HOST_URL/api/v2/<ServiceName>/<Resource>[/<id>[/<sub-resource>...]]
```

Examples:
- `GET  $ABSUITE_HOST_URL/api/v2/CrmService/Contacts?tenantId=<tenant-guid>`
- `POST $ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices?tenantId=<tenant-guid>`

REST service names (PascalCase + `Service` suffix): `AccountingService`, `ActivitiesService`, `AnalyticsService`, `ApprovalsService`, `ArtifactsService`, `AssetsService`, `BlockchainsService`, `CartService`, `CatalogService`, `CommunicationsService`, `ContentService`, `CrmService`, `DealsService`, `ForexService`, `GlobeService`, `HrmsService`, `IdentityService`, `IntelligenceService`, `InventoryService`, `InvoicingService`, `LearningService`, `LicensingService`, `LocationsService`, `LogisticsService`, `ManufacturingService`, `MarketingService`, `OrdersService`, `PaymentsService`, `PricingService`, `ProjectsService`, `QuotesService`, `ReachService`, `SalesService`, `SearchService`, `SecurityService`, `ServicesService`, `ShipmentsService`, `SocialService`, `StorageService`, `StudioService`, `SubscriptionsService`, `SupportService`, `SystemService`, `TasksService`, `TenantsService`, `TrustService`, `UblService`, `UsersService`, `WalletsService`, `WorkflowsService`. Time tracking lives under `ProjectsService` (`/api/v2/ProjectsService/TimeLogs`). Identity/auth uses `/api/v2/OAuth` and `/api/v2/Me` (see above).

## Response envelope

Every `/api/v2/...` response is wrapped in a standard envelope:

```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "<guid>",
  "timestamp": "2026-06-12T12:00:00Z",
  "result": "<object | array | int | null>"
}
```

- **Always check `isSuccess`** before using `result`.
- The real payload is in `result` (a single object, an array for lists, an integer for counts, or `null` for write actions that return `EmptyEnvelope`).
- On failure, `isSuccess` is `false` and `errorMessage` describes the problem. Error envelopes may also carry `httpStatus`, `errorCode` and `validationDetails`. The HTTP status reflects the error class (400/401/403/404/409/500).
- The identity endpoints `/login` and `/refresh` are the exception: they return the token payload (`accessToken`, `refreshToken`, and so on) directly, without the envelope.

## Tenant scoping: required, optional, or not at all

ABS is multi-tenant, **but tenant is NOT always required**. Scoping is decided **per endpoint**. The platform resolves `tenantId` from the **`?tenantId=` query parameter OR the `X-TenantId` header, interchangeably** (`TenantIdBinder`). To know which applies, check the endpoint's parameters (the per-service `absuite-<domain>` skills state this for each call):

| The endpoint declares... | Meaning | What you send |
|---|---|---|
| `tenantId` **required** | Tenant-owned aggregate (most writes + most reads) | `?tenantId=<tenant-guid>` on **every** verb, incl. POST/PUT/PATCH/DELETE |
| `tenantId` **optional** (`Guid?`) | Public-with-optional-tenant (e.g. catalog/content reads) | Omit it for the global/public view; include it for the tenant-scoped view |
| **no** `tenantId` | User-scoped (`/Me`, wallets by `walletId`, social by `socialProfileId`, tenants `Current`/`Root` via JWT), host/portal-scoped (`Portals/Current\|Root\|Initialize`), or reference data and identity (Globe, Forex, `/login`) | Send **nothing** extra; a tenant param/header is ignored here |

Notes:
- **Omitting a required `tenantId` on a write is the classic cause of a 400.** Add it to creates/updates/patches/deletes, not just GETs.
- The header is spelled **`X-TenantId`** (case-insensitive). `X-Tenant-ID` (extra hyphen) is a *different* token the platform does **not** read, so prefer the unambiguous `?tenantId=` query param.
- Authoritative platform reference: `Docs.Developer/Audits/API_SURFACE_AND_TENANT_SCOPING_AUDIT.md`.

```bash
# Tenant-scoped (required): query param on a write
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"firstName":"Alice","lastName":"Smith"}'

# Global reference data: no tenant
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Currencies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## HTTP verb to operation

| Verb | Operation | Notes |
|---|---|---|
| `GET` | list / count / search / get-by-id | Reads. `.../Count` returns an int; `.../Search` filters. |
| `POST` | create / actions | Body is the `*CreateDto` (or an action payload). |
| `PUT` | full update | Body is the `*UpdateDto`; it replaces the whole resource. |
| `PATCH` | **atomic partial update** | **JSON Patch** body (see below). |
| `DELETE` | delete | Usually no body. |

## Reads: lists, counts, and OData

**Every collection (`GET`) endpoint is OData-enabled, and so is its dedicated `Count` endpoint.** Filtering, paging, and sorting happen server-side (at the database), so never pull a whole collection and trim it client-side.

```bash
# Filtered, paged, sorted, projected list:
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices?tenantId=<tenant-guid>&\$top=20&\$skip=0&\$orderby=Timestamp%20desc&\$filter=InvoiceStatus%20eq%20'Draft'&\$select=Id,Title,Total" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Options: `$filter`, `$top`, `$skip`, `$orderby`, `$select`, `$count`. The server caps `$top` at 120 per page.

**Counting.** Most list resources have a dedicated **`.../Count`** endpoint that returns an integer in `result`. Use it instead of listing just to measure size. It is **also OData-enabled**, so a `$filter` returns a *filtered* count:

```bash
# Total count:
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Filtered count (how many Draft invoices), with no need to fetch the rows:
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Count?tenantId=<tenant-guid>&\$filter=InvoiceStatus%20eq%20'Draft'" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

> **Note:** OData options are a REST/HTTP-layer feature. They are accepted on the URL but are **not** declared in the OpenAPI spec (the controllers bind them through a `[SwaggerIgnore]` `CollectionQueryParameters<T>` parameter), so the generated SDKs and the `absuite` CLI do **not** expose them as parameters. To filter/page or take a filtered count, call REST directly.

## Updating safely: PUT replaces the whole object; PATCH patches it

**`PUT` is a full replacement, not a merge.** The server overwrites the entire resource with the body you send, so **any field you omit is reset to its default/null**. A "quick update" that sends only the changed fields will silently wipe everything else, which is a common and costly data-loss bug.

The safe `PUT` pattern is **read-modify-write**: GET the current resource, change only what you need on the *complete* object, then PUT the whole thing back.

```bash
# 1) GET the current resource
CURRENT=$(curl -s "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" | jq '.result')
# 2) modify only what you need on the FULL object
UPDATED=$(echo "$CURRENT" | jq '.customerNotes = "Approved by finance."')
# 3) PUT the COMPLETE object back
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d "$UPDATED"
```

The same applies to **`POST` (create)**: send the complete `*CreateDto`; fields left out are created empty.

**Prefer `PATCH` for small changes.** A JSON Patch touches only the fields you name, needs no prior GET, can't clobber the rest of the object, and behaves better under concurrent edits. It is both safer and cheaper than a read-modify-write `PUT`. Use `PUT` only when you deliberately want to replace the whole object.

## PATCH: atomic partial updates (JSON Patch, RFC 6902)

Many resources now expose `PATCH` for **atomic** field-level edits: change one or two fields without resending (and risking clobbering) the whole object. This is safer than `PUT` under concurrent edits.

- **Body is a JSON array of operations**, not a partial DTO.
- `Content-Type: application/json`.
- `tenantId` is still required (query param) where the resource is tenant-owned.

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/invoiceStatus", "value": "Signed" },
    { "op": "replace", "path": "/customerNotes", "value": "Approved by finance." }
  ]'
```

Operation shape: `{ "op": "<add|remove|replace|move|copy|test>", "path": "/<camelCaseField>", "value": <new-value>, "from": "/<source>" }`. `path`/`from` are JSON Pointers (leading `/`). `from` is only used by `move`/`copy`.

> **CLI note:** the `absuite` CLI does **not** support PATCH yet. JSON Patch is REST-only. For partial edits via the CLI, fetch, modify, then `update` (PUT).

## Error handling

| Status | Meaning | Typical cause |
|---|---|---|
| 400 | Bad request | Missing required `tenantId`, malformed body/JSON Patch, invalid enum value |
| 401 | Unauthorized | Missing/expired bearer token; refresh or re-authenticate |
| 403 | Forbidden | Authenticated but lacking the role/permission in that tenant |
| 404 | Not found | Wrong id, or resource not in this tenant's scope |
| 409 | Conflict | Concurrency / duplicate / state conflict |
| 500 | Server error | Platform/infra issue; do not silently retry writes, investigate |

## Critical rules

- **Never hard-code credentials, tokens, or host.** Read `ABSUITE_USER_EMAIL`, `ABSUITE_USER_PASSWORD`, `ABSUITE_HOST_URL` from the environment.
- **Always parse the envelope:** check `isSuccess`, then read `result`.
- **Match field casing and enum values to the spec.** JSON bodies use camelCase property names (`"currencyId"`, `"invoiceStatus"`), the same casing the API returns; the server matches property names case-insensitively on input. Enum values are exact strings from the endpoint's schema (e.g. `"Draft"`, `"Signed"`); do not guess.
- **Apply tenant scoping per endpoint** (required vs optional vs none, as documented per call). Add `?tenantId=` to tenant-scoped writes, not just reads.
- **`PUT` replaces the ENTIRE resource, so never send a partial body to `PUT` (or `POST`).** GET first, modify the full object, then PUT; or use `PATCH` (JSON Patch) for a safe partial edit. A partial `PUT` blanks the omitted fields and loses data.
- **Filter and count server-side.** Use OData (`$filter`/`$top`/`$skip`/`$orderby`/`$select`) on list endpoints and the dedicated, filterable `.../Count` endpoints; don't pull whole collections to filter or count in the client.
- **Idempotency:** GET/PUT/DELETE are idempotent; POST is not. Do not blindly retry a failed POST without checking whether it partially applied.
