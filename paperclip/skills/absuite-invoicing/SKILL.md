---
name: absuite-invoicing
description: >
  Create, read, update, patch, delete, and manage invoices in the Alliance Business
  Suite (ABS) Invoicing Service via the REST API. Covers invoices, invoice lines,
  line taxes, adjustments (discounts/surcharges), references (credit/debit notes),
  payments, calculations, aggregations, and transactional email notifications,
  including atomic PATCH (JSON Patch) updates. All operations are tenant-scoped and
  require a bearer token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Invoicing Skill (REST)

Manage invoices through the ABS Invoicing Service REST API. Every invoicing endpoint
is tenant-scoped: pass `?tenantId=<tenant-guid>` (or the equivalent `X-TenantId: <tenant-guid>`
header) on **every** request — GET, POST, PUT, PATCH, and DELETE alike.

> For the CLI equivalent see `absuite-invoicing-cli`; for general REST conventions
> (envelope, tenant scoping, JSON Patch) see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select` — page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource** — it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) causes silent data loss.
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902) — it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

## Authentication

1. **Obtain a bearer token:**
```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<your-email>", "password": "<your-password>"}'
```
Extract `accessToken` from the JSON response and export it:
```bash
export ABSUITE_ACCESS_TOKEN="<accessToken-from-response>"
```

2. **Send the token on every subsequent request:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices`

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
Always check `isSuccess`; read the payload from `result` (an object, an array, an int for `Count`, or `null`).

## Key Concepts

- **Invoice** — a formal billing document with header info (customer, currency, totals, status), line items, adjustments, and references.
- **Invoice Line** — an individual item/service billed, with quantity, pricing, and tax info.
- **Invoice Line Tax** — a tax policy applied to a specific invoice line.
- **Invoice Adjustment** — a discount or surcharge applied at the invoice level (percentage or fixed amount).
- **Invoice Reference** — a link between invoices (e.g. a credit note referencing the original invoice).
- **Invoice Payment** — payment records associated with an invoice (read-only here).
- **InvoiceType** — `PurchaseInvoice` | `SalesInvoice` | `CreditNote` | `DebitNote`.
- **DocumentType** — `Standard` | `DebitNote` | `CreditNote`.
- **InvoiceStatus** — lifecycle state: `Draft` | `Closed` | `Signed` | `Expired` | `Paid`.
- **CostCalculationMethod** — `Automatic` | `Custom`.
- **TaxCalculationMethod** — `Included` | `Excluded`.
- **AdjustmentType** (`type` on an adjustment) — `Discount` | `Surcharge`.
- **Enumeration** — invoice number/sequence (auto-generated or from an enumeration range).

> Field names in request bodies are PascalCase JSON keys (e.g. `"Title"`, `"CurrencyId"`,
> `"InvoiceType"`). Monetary amounts are split into a value field and a matching
> `…CurrencyId` field (e.g. `Total` + `TotalCurrencyId`).

## Workflow: Creating an Invoice

1. **Create the invoice header** with customer, currency, and billing info.
2. **Add invoice lines** for each billed item/service.
3. **Add line taxes** to each line (link to tax policies).
4. **(Optional)** Add adjustments (invoice-level discounts/surcharges).
5. **Calculate totals** — let the server compute taxes, discounts, and grand total.
6. **(Optional)** Add references to related invoices.
7. **Patch the status** (e.g. `Draft` → `Signed`) and **send** the invoice via transactional email.

## Invoices

### Create Invoice

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invoice - Q2 Enterprise License",
    "description": "Enterprise license and support services",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "organizationId": "<organization-guid>",
    "firstName": "<first-name>",
    "lastName": "<last-name>",
    "companyName": "<company-name>",
    "billingEmail": "<billing-email>",
    "addressLine1": "<address-line-1>",
    "postalCode": "<postal-code>",
    "countryId": "<country-guid>",
    "stateId": "<state-guid>",
    "cityId": "<city-guid>",
    "invoiceType": "SalesInvoice",
    "documentType": "Standard",
    "invoiceStatus": "Draft",
    "costCalculationMethod": "Automatic",
    "taxCalculationMethod": "Excluded",
    "paymentDue": "2026-07-15T00:00:00Z",
    "validFrom": "2026-06-12T00:00:00Z",
    "validTo": "2026-07-15T00:00:00Z",
    "notes": "Net 30 payment terms apply.",
    "orderId": "<order-guid>"
  }'
```

**`InvoiceCreateDto` fields** (all optional unless noted; transcribed from the spec):
`id`, `timestamp`, `closed` (bool), `title`, `priceListId`, `description`, `individualId`,
`paymentTermId`, `organizationId`, `receiverTenantId`, `firstName`, `lastName`,
`companyName`, `billingEmail`, `addressLine1`, `addressLine2`, `postalCode`, `countryId`,
`stateId`, `cityId`, `forexRate` (number), `currencyId`, the monetary value/`…CurrencyId`
pairs (`totalDetail`, `totalProfit`, `totalDiscounts`, `totalSurcharges`, `totalShippingCost`,
`totalShippingTax`, `totalWithheldTax`, `totalTaxBase`, `totalTaxes`, `totalGlobalSurcharges`,
`totalGlobalDiscounts`, `total`), `costCalculationMethod` (`Automatic`|`Custom`),
`taxCalculationMethod` (`Included`|`Excluded`), `paid` (bool), `number` (int), `notes`,
`orderId`, `enumeration`, `paymentModeId`, `enumerationRangeId`, `emisorBillingProfileId`,
`receiverBillingProfileId`, `emisorWalletAccountId`, `receiverWalletAccountId`, `customerNotes`,
`invoiceType` (`PurchaseInvoice`|`SalesInvoice`|`CreditNote`|`DebitNote`),
`documentType` (`Standard`|`DebitNote`|`CreditNote`),
`invoiceStatus` (`Draft`|`Closed`|`Signed`|`Expired`|`Paid`), `paymentDue`, `validFrom`,
`validTo`, and the inline arrays `invoiceLines`, `invoiceReferences`, `invoiceAdjustments`.

### Create Invoice with Inline Lines, References, and Adjustments

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invoice - Acme",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "invoiceType": "SalesInvoice",
    "invoiceStatus": "Draft",
    "costCalculationMethod": "Automatic",
    "taxCalculationMethod": "Excluded",
    "paymentDue": "2026-07-15T00:00:00Z",
    "invoiceLines": [
      {
        "itemId": "<item-guid-1>",
        "quantity": 5,
        "currencyId": "<currency-guid>",
        "itemPriceId": "<price-guid-1>",
        "title": "Enterprise License",
        "description": "5 seats, annual"
      },
      {
        "itemId": "<item-guid-2>",
        "quantity": 1,
        "currencyId": "<currency-guid>",
        "itemPriceId": "<price-guid-2>",
        "title": "Premium Support"
      }
    ],
    "invoiceAdjustments": [
      {
        "description": "Volume discount",
        "discountPercent": 10,
        "type": "Discount",
        "currencyId": "<currency-guid>"
      }
    ],
    "invoiceReferences": [
      { "referencedInvoiceId": "<original-invoice-guid>" }
    ]
  }'
```

### List Invoices

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Invoices

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Extended Invoices (with related data)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Extended Invoices

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Extended/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Invoice by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Extended Invoice by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Invoice (PUT — full replace)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invoice - Q2 Enterprise License (revised)",
    "currencyId": "<currency-guid>",
    "invoiceStatus": "Closed",
    "notes": "Revised payment terms"
  }'
```

The `InvoiceUpdateDto` carries the same header/monetary fields as `InvoiceCreateDto`, plus
`userId`, `billingLocationId`, `shippingLocationId`, `shippingMethodId` (and, like create,
the inline `invoiceLines` / `invoiceReferences` / `invoiceAdjustments` arrays). It does **not**
carry `id`. Prefer PATCH (below) for small, partial edits.

### Patch Invoice (PATCH — JSON Patch RFC 6902)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/invoiceStatus", "value": "Signed" },
    { "op": "replace", "path": "/notes", "value": "Signed and ready to send" }
  ]'
```

### Delete Invoice

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Calculate Invoice

Recompute server-side totals after editing lines, taxes, or adjustments.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Calculate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Invoice Lines

### List Lines

```bash
# Optionally filter by item with ?itemId=<item-guid>
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Lines

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Line by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines/<invoice-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Line

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Enterprise License",
    "description": "Annual platform license, 10 seats",
    "itemId": "<item-guid>",
    "itemPriceId": "<price-guid>",
    "quantity": 10,
    "currencyId": "<currency-guid>",
    "costCalculationMethod": "Automatic",
    "taxCalculationMethod": "Excluded"
  }'
```

`InvoiceLineCreateDto` shares the invoice header/monetary fields and adds `quantity` (int),
`itemId`, `invoiceId`, `itemPriceId`.

### Update Line (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines/<invoice-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 15,
    "description": "Increased to 15 seats",
    "currencyId": "<currency-guid>"
  }'
```

`InvoiceLineUpdateDto` adds `userId`, `billingLocationId`, `shippingLocationId`,
`shippingMethodId`, `quantity`, `itemId`, `itemPriceId`, `invoiceLineId`,
`taxAmountInUsd`, `taxBaseAmountInUsd` on top of the shared header/monetary fields.

### Patch Line (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines/<invoice-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/quantity", "value": 12 }
  ]'
```

### Delete Line

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines/<invoice-line-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Calculate Line

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines/<invoice-line-guid>/Calculate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Invoice Line Taxes

Apply tax policies to individual invoice lines.

### List Taxes for a Line

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines/<invoice-line-guid>/Taxes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Taxes for a Line

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines/<invoice-line-guid>/Taxes/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Add a Tax to a Line

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines/<invoice-line-guid>/Taxes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taxPolicyId": "<tax-policy-guid>",
    "invoiceId": "<invoice-guid>"
  }'
```

`InvoiceLineAppliedTaxCreateDto` fields: `id`, `timestamp`, `invoiceId`, `taxPolicyId`.

### Update a Line Tax (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines/<invoice-line-guid>/Taxes/<invoice-line-tax-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taxPolicyId": "<new-tax-policy-guid>"
  }'
```

`InvoiceLineAppliedTaxUpdateDto` has a single field: `taxPolicyId`.

### Patch a Line Tax (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines/<invoice-line-guid>/Taxes/<invoice-line-tax-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/taxPolicyId", "value": "<new-tax-policy-guid>" }
  ]'
```

### Delete a Line Tax

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Lines/<invoice-line-guid>/Taxes/<invoice-line-tax-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Adjustments (Discounts / Surcharges)

Invoice-level discounts or surcharges.

### List Adjustments

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Adjustments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Adjustments

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Adjustments/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Adjustment by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Adjustments/<invoice-adjustment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Adjustment

```bash
# Percentage discount
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Adjustments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Early payment discount",
    "discountPercent": 5,
    "type": "Discount",
    "currencyId": "<currency-guid>",
    "priority": 1,
    "code": "EARLY5"
  }'

# Fixed surcharge
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Adjustments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Rush processing fee",
    "surchargeAmount": 150.00,
    "type": "Surcharge",
    "currencyId": "<currency-guid>"
  }'
```

`InvoiceAdjustmentCreateDto` fields: `id`, `timestamp`, `currencyId`, `priority` (int),
`code`, `description`, `surchargePercent`, `surchargeAmount`, `discountPercent`,
`discountAmount`, `totalSurcharge`, `totalDiscount`, `type` (`Discount`|`Surcharge`).

### Update Adjustment (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Adjustments/<invoice-adjustment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discountPercent": 8,
    "description": "Loyalty discount increased",
    "type": "Discount",
    "currencyId": "<currency-guid>"
  }'
```

`InvoiceAdjustmentUpdateDto` fields: `currencyId`, `priority`, `code`, `description`,
`surchargePercent`, `surchargeAmount`, `discountPercent`, `discountAmount`,
`totalSurcharge`, `totalDiscount`, `type` (`Discount`|`Surcharge`).

### Patch Adjustment (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Adjustments/<invoice-adjustment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/discountPercent", "value": 8 }
  ]'
```

### Delete Adjustment

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Adjustments/<invoice-adjustment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Invoice References

Link invoices together (e.g. a credit note → the original invoice).

### List References

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/References?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count References

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/References/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Reference by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/References/<invoice-reference-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Reference

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<credit-note-guid>/References?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "referencedInvoiceId": "<original-invoice-guid>"
  }'
```

`InvoiceReferenceCreateDto` fields: `id`, `timestamp`, `referencedInvoiceId`.

### Update Reference (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/References/<invoice-reference-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "referencedInvoiceId": "<different-invoice-guid>"
  }'
```

`InvoiceReferenceUpdateDto` has a single field: `referencedInvoiceId`.

### Patch Reference (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/References/<invoice-reference-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/referencedInvoiceId", "value": "<different-invoice-guid>" }
  ]'
```

### Delete Reference

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/References/<invoice-reference-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Payments (read-only)

### List Payments for an Invoice

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Payments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Payments

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Payments/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Aggregations

Aggregate financial figures across a set of invoices. Each is a `POST` whose body is a
**JSON array of invoice GUIDs**; an optional `?currencyId=<currency-guid>` converts the
result into that currency.

```bash
# Aggregate totals
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/TotalsAggregate?tenantId=<tenant-guid>&currencyId=<currency-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '["<invoice-guid-1>", "<invoice-guid-2>"]'

# Aggregate taxes
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/TaxesAggregate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '["<invoice-guid-1>", "<invoice-guid-2>"]'

# Aggregate tax bases
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/TaxBasesAggregate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '["<invoice-guid-1>", "<invoice-guid-2>"]'

# Aggregate discounts
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/DiscountsAggregate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '["<invoice-guid-1>", "<invoice-guid-2>"]'

# Aggregate global surcharges
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/GlobalSurchargesAggregate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '["<invoice-guid-1>", "<invoice-guid-2>"]'
```

## Email Notifications

### Preview Invoice Email

Renders the email without sending. Same body as Send (an `EmailDispatchRequest`).

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Emails/Preview?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your invoice",
    "message": "Please find your invoice below.",
    "culture": "en-US",
    "uiCulture": "en-US",
    "recipients": ["<billing-email>"]
  }'
```

### Send Invoice Email

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<invoice-guid>/Emails/Send?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your invoice",
    "message": "Please find your invoice below. Payment is due by 2026-07-15.",
    "culture": "en-US",
    "uiCulture": "en-US",
    "recipients": ["<billing-email>"]
  }'
```

**`EmailDispatchRequest` fields** (`title`, `message`, `culture`, `uiCulture`, `recipients` are **required**):
- `title` — email subject line *(required)*
- `message` — email body text *(required)*
- `culture` / `uiCulture` — email locale, e.g. `en-US` *(both required)*
- `recipients` — array of email addresses *(required)*
- `contactIds` — array of CRM contact GUIDs (sends to their email)
- `tenantIds` — array of tenant GUIDs
- `userIds` — array of user GUIDs
- `buttonLink`, `buttonText` — optional CTA button
- `alertMessage` — optional alert banner text
- `alertType` — `None` | `Info` | `Error` | `Warning` | `Success` | `Action` | `Alert`
- `templateUrl` — override the template by URL
- `emailTemplateId` — use a specific email template

## Recipe: Issue a Credit Note

```bash
# 1. Create a credit note that references the original invoice (inline reference)
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Credit Note for original invoice",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "invoiceType": "CreditNote",
    "documentType": "CreditNote",
    "invoiceStatus": "Draft",
    "invoiceReferences": [ { "referencedInvoiceId": "<original-invoice-guid>" } ]
  }'
# Note the returned credit-note ID.

# 2. Add a credit line (negative quantity)
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<credit-note-guid>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "License (Credit)", "itemId": "<item-guid>", "quantity": -2, "currencyId": "<currency-guid>", "itemPriceId": "<price-guid>" }'

# 3. Calculate
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/<credit-note-guid>/Calculate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## End-to-End Workflow

```bash
TENANT="<tenant-guid>"
BASE="$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices"

# 1. Create the invoice header
curl -X POST "$BASE?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "title": "Invoice - Q2 Enterprise License",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "billingEmail": "<billing-email>",
    "invoiceType": "SalesInvoice",
    "invoiceStatus": "Draft",
    "costCalculationMethod": "Automatic",
    "taxCalculationMethod": "Excluded",
    "paymentDue": "2026-07-15T00:00:00Z"
  }'
# -> capture result.id as INVOICE

# 2. Add a line
curl -X POST "$BASE/<invoice-guid>/Lines?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Enterprise License", "itemId": "<item-guid>", "quantity": 10, "currencyId": "<currency-guid>", "itemPriceId": "<price-guid>" }'
# -> capture result.id as LINE

# 3. Apply a tax to the line
curl -X POST "$BASE/<invoice-guid>/Lines/<invoice-line-guid>/Taxes?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "taxPolicyId": "<tax-policy-guid>", "invoiceId": "<invoice-guid>" }'

# 4. Add an invoice-level discount
curl -X POST "$BASE/<invoice-guid>/Adjustments?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "description": "Volume discount", "discountPercent": 10, "type": "Discount", "currencyId": "<currency-guid>" }'

# 5. Calculate totals
curl -X PUT "$BASE/<invoice-guid>/Calculate?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 6. Patch the status to Signed
curl -X PATCH "$BASE/<invoice-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/invoiceStatus", "value": "Signed" } ]'

# 7. Send the invoice email
curl -X POST "$BASE/<invoice-guid>/Emails/Send?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Your invoice", "message": "Please find your invoice below.", "culture": "en-US", "uiCulture": "en-US", "recipients": ["<billing-email>"] }'

# 8. Verify
curl -X GET "$BASE/<invoice-guid>?tenantId=$TENANT" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

All paths require `?tenantId=<tenant-guid>` (or the `X-TenantId` header).

| Action | Method | Path |
|---|---|---|
| List invoices | GET | `/api/v2/InvoicingService/Invoices` |
| Count invoices | GET | `/api/v2/InvoicingService/Invoices/Count` |
| List extended invoices | GET | `/api/v2/InvoicingService/Invoices/Extended` |
| Count extended invoices | GET | `/api/v2/InvoicingService/Invoices/Extended/Count` |
| Create invoice | POST | `/api/v2/InvoicingService/Invoices` |
| Get invoice | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}` |
| Get extended invoice | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/Extended` |
| Update invoice | PUT | `/api/v2/InvoicingService/Invoices/{invoiceId}` |
| Patch invoice | PATCH | `/api/v2/InvoicingService/Invoices/{invoiceId}` |
| Delete invoice | DELETE | `/api/v2/InvoicingService/Invoices/{invoiceId}` |
| Calculate invoice | PUT | `/api/v2/InvoicingService/Invoices/{invoiceId}/Calculate` |
| List lines | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines` |
| Count lines | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines/Count` |
| Create line | POST | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines` |
| Get line | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}` |
| Update line | PUT | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}` |
| Patch line | PATCH | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}` |
| Delete line | DELETE | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}` |
| Calculate line | PUT | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Calculate` |
| List line taxes | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Taxes` |
| Count line taxes | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Taxes/Count` |
| Create line tax | POST | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Taxes` |
| Update line tax | PUT | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Taxes/{invoiceLineTaxId}` |
| Patch line tax | PATCH | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Taxes/{invoiceLineTaxId}` |
| Delete line tax | DELETE | `/api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Taxes/{invoiceLineTaxId}` |
| List adjustments | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments` |
| Count adjustments | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments/Count` |
| Create adjustment | POST | `/api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments` |
| Get adjustment | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments/{invoiceAdjustmentId}` |
| Update adjustment | PUT | `/api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments/{invoiceAdjustmentId}` |
| Patch adjustment | PATCH | `/api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments/{invoiceAdjustmentId}` |
| Delete adjustment | DELETE | `/api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments/{invoiceAdjustmentId}` |
| List references | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/References` |
| Count references | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/References/Count` |
| Create reference | POST | `/api/v2/InvoicingService/Invoices/{invoiceId}/References` |
| Get reference | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/References/{invoiceReferenceId}` |
| Update reference | PUT | `/api/v2/InvoicingService/Invoices/{invoiceId}/References/{invoiceReferenceId}` |
| Patch reference | PATCH | `/api/v2/InvoicingService/Invoices/{invoiceId}/References/{invoiceReferenceId}` |
| Delete reference | DELETE | `/api/v2/InvoicingService/Invoices/{invoiceId}/References/{invoiceReferenceId}` |
| List payments | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/Payments` |
| Count payments | GET | `/api/v2/InvoicingService/Invoices/{invoiceId}/Payments/Count` |
| Preview email | POST | `/api/v2/InvoicingService/Invoices/{invoiceId}/Emails/Preview` |
| Send email | POST | `/api/v2/InvoicingService/Invoices/{invoiceId}/Emails/Send` |
| Aggregate totals | POST | `/api/v2/InvoicingService/Invoices/TotalsAggregate` |
| Aggregate taxes | POST | `/api/v2/InvoicingService/Invoices/TaxesAggregate` |
| Aggregate tax bases | POST | `/api/v2/InvoicingService/Invoices/TaxBasesAggregate` |
| Aggregate discounts | POST | `/api/v2/InvoicingService/Invoices/DiscountsAggregate` |
| Aggregate global surcharges | POST | `/api/v2/InvoicingService/Invoices/GlobalSurchargesAggregate` |
