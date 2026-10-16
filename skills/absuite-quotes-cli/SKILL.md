---
name: absuite-quotes-cli
description: >
  Manage sales quotes in the Alliance Business Suite (ABS) Quotes Service using the
  `absuite` CLI. Covers quotes, quote lines, calculations, lifecycle actions (close,
  reopen, convert to order), and transactional email — via list/count/get/create/
  update/delete commands and service actions. Requires an authenticated CLI session
  (see absuite-login-cli). For atomic PATCH updates or raw HTTP, use the absuite-quotes
  (REST) skill.
---

# Alliance Business Suite — Quotes Skill (CLI)

Manage sales quotes through the `absuite` CLI's `quotes` service. All quote operations
are tenant-scoped and require an authenticated session. The CLI does not support PATCH
(JSON Patch) — for partial atomic updates use the `absuite-quotes` REST skill.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-quotes` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-quotes` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general
   CLI usage and configuration, see `absuite-cli`.
2. **Set your tenant** — every quotes command requires a tenant. Either set a default:
   ```powershell
   absuite config set --tenant-id <tenant-guid>
   ```
   …and reference it as `$TENANT_ID`, or pass `--TenantId <tenant-guid>` on each call.
3. **Discover commands:**
   ```powershell
   absuite quotes list-commands
   absuite quotes create quote --help
   ```

## Command Structure

```
absuite quotes <verb> <entity> --Param value
```

- **Verbs:** `list`, `count`, `get`, `create`, `update`, `delete`, plus service actions
  (`calculate`, `close`, `reopen`, `upsert`, `exists`, `send`, `preview`, and
  `create order-from`).
- **Entities:** `quote`, `quote-line`, `extended-quote`.
- The canonical PowerShell function-name form also works as the command, e.g.
  `absuite quotes New-Quote --TenantId <tenant-guid> --QuoteCreateDto '{...}'`
  is equivalent to `absuite quotes create quote ...`. The function names map to
  PowerShell-approved verbs:
  - create quote → `New-Quote`; create line → `New-QuoteLine`; create order from quote → `New-OrderFromQuote`
  - list/get/count → `Get-Quotes`, `Get-Quote`, `Get-QuotesCount`, `Get-ExtendedQuotes`, `Get-QuoteLines`, `Get-QuoteLine`, `Get-QuoteLinesCount`
  - update → `Update-Quote`, `Update-QuoteLine`
  - delete → `Invoke-DeleteQuote`, `Invoke-DeleteQuoteLine`
  - calculate → `Measure-Quote`, `Measure-QuoteLine`
  - close → `Close-Quote`; reopen → `Invoke-ReopenQuote`
  - upsert line → `Invoke-UpsertQuoteLine`; line exists → `Invoke-QuoteLineExists`
  - send email → `Send-QuoteEmail`; preview email → `Invoke-PreviewQuoteEmailTemplate`
- **JSON DTO params** are passed as a single-quoted JSON string (`--<Dto> '{...}'`) using
  the **same PascalCase field names** as the REST API.

## Key Concepts

- **QuoteStatus** — `Draft` | `New` | `Accepted` | `Declined` | `Expired`.
- **CostCalculationMethod** — `Automatic` | `Custom`.
- **TaxCalculationMethod** — `Included` | `Excluded`.
- **FreightTerms** (on a quote update) — `FOB` | `NoCharge`.
- A quote can be **closed** (finalized) and later **reopened**, and **converted to an order**.
- Monetary amounts are split into a value field and a matching `…CurrencyId` field
  (e.g. `Total` + `TotalCurrencyId`).
- The Quotes Service exposes **quotes and quote lines only** — there are no quote-line
  tax or adjustment sub-resources; line-level tax and discount/surcharge figures are
  carried inline on the quote-line body, and computed by the `calculate` actions.

## Quotes

### Create Quote

```powershell
absuite quotes create quote --TenantId $TENANT_ID --QuoteCreateDto '{
  "Title": "Quote - Website Redesign",
  "Description": "Quote for a complete website redesign project",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "OrganizationId": "<organization-guid>",
  "PriceListId": "<price-list-guid>",
  "PaymentTermId": "<payment-term-guid>",
  "CompanyName": "<company-name>",
  "BillingEmail": "<billing-email>",
  "AddressLine1": "<address-line-1>",
  "CountryId": "<country-guid>",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded",
  "QuoteStatus": "Draft",
  "EffectiveFrom": "2026-06-12T00:00:00Z",
  "EffectiveTo": "2026-07-12T00:00:00Z"
}'
```

**Common `QuoteCreateDto` fields:** `Title`, `Description`, `CurrencyId`, `IndividualId`,
`OrganizationId`, `ReceiverTenantId`, `PriceListId`, `PaymentTermId`, `FirstName`, `LastName`,
`CompanyName`, `BillingEmail`, `AddressLine1`, `AddressLine2`, `PostalCode`, `CountryId`,
`StateId`, `CityId`, `ForexRate`, `CartId`, `DealUnitId`, `EffectiveFrom`, `EffectiveTo`,
the monetary value/`…CurrencyId` pairs (`TotalDetail`, `TotalProfit`, `TotalDiscounts`,
`TotalSurcharges`, `TotalShippingCost`, `TotalShippingTax`, `TotalWithheldTax`, `TotalTaxBase`,
`TotalTaxes`, `TotalGlobalSurcharges`, `TotalGlobalDiscounts`, `Total`), `CostCalculationMethod`,
`TaxCalculationMethod`, `QuoteStatus`, `Closed`, and the inline array `QuoteLines`.

### Create Quote with Inline Lines

```powershell
absuite quotes create quote --TenantId $TENANT_ID --QuoteCreateDto '{
  "Title": "Quote - Acme",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded",
  "QuoteStatus": "Draft",
  "QuoteLines": [
    { "ItemId": "<item-guid-1>", "Quantity": 5, "CurrencyId": "<currency-guid>", "ItemPriceId": "<price-guid-1>", "Title": "Design consultation" },
    { "ItemId": "<item-guid-2>", "Quantity": 1, "CurrencyId": "<currency-guid>", "ItemPriceId": "<price-guid-2>", "Title": "Premium hosting" }
  ]
}'
```

### List Quotes

```powershell
absuite quotes list quotes --TenantId $TENANT_ID
```

### Count Quotes

```powershell
absuite quotes count quotes --TenantId $TENANT_ID
```

### List Extended Quotes (with related data)

```powershell
absuite quotes list extended-quotes --TenantId $TENANT_ID
```

### Get Quote by ID

```powershell
absuite quotes get quote --TenantId $TENANT_ID --QuoteId <quote-guid>
```

### Update Quote (full replace)

```powershell
absuite quotes update quote --TenantId $TENANT_ID --QuoteId <quote-guid> --QuoteUpdateDto '{
  "Title": "Quote - Website Redesign (revised)",
  "CurrencyId": "<currency-guid>",
  "QuoteStatus": "New",
  "Description": "Revised scope and pricing"
}'
```

`QuoteUpdateDto` carries the same header/monetary fields as create, plus `UserId`,
`BillingLocationId`, `ShippingLocationId`, `ShippingMethodId`, `FreightTerms`
(`FOB`|`NoCharge`), and the `Custom*Amount` overrides (`CustomTaxAmount`, `CustomTotalAmount`,
`CustomDetailAmount`, `CustomProfitAmount`, `CustomDiscountsAmount`, `CustomSurchargesAmount`,
`CustomShippingCostAmount`, `CustomShippingTaxAmount`, `CustomWithholdingTaxAmount`). It does
not carry `Id`, `DealUnitId`, or the inline `QuoteLines` array.

### Delete Quote

```powershell
absuite quotes delete quote --TenantId $TENANT_ID --QuoteId <quote-guid>
```

### Calculate Quote

Recompute server-side totals after editing lines.

```powershell
absuite quotes calculate quote --TenantId $TENANT_ID --QuoteId <quote-guid>
```

## Quote Lifecycle Actions

### Close Quote

```powershell
absuite quotes close quote --TenantId $TENANT_ID --QuoteId <quote-guid>
```

### Reopen Quote

```powershell
absuite quotes reopen quote --TenantId $TENANT_ID --QuoteId <quote-guid>
```

### Create Order from Quote

```powershell
absuite quotes create order-from --TenantId $TENANT_ID --QuoteId <quote-guid>
```

## Quote Lines

### List Lines

```powershell
# Optionally filter by item with --ItemId <item-guid>
absuite quotes list quote-lines --TenantId $TENANT_ID --QuoteId <quote-guid>
```

### Count Lines

```powershell
absuite quotes count quote-lines --TenantId $TENANT_ID --QuoteId <quote-guid>
```

### Check if a Line Exists

Check by quote-line ID or by item ID (pass one of `--QuoteLineId` / `--ItemId`).

```powershell
absuite quotes exists quote-line --TenantId $TENANT_ID --QuoteId <quote-guid> --QuoteLineId <quote-line-guid>
# …or by item:
absuite quotes exists quote-line --TenantId $TENANT_ID --QuoteId <quote-guid> --ItemId <item-guid>
```

### Get Line by ID

```powershell
absuite quotes get quote-line --TenantId $TENANT_ID --QuoteId <quote-guid> --QuoteLineId <quote-line-guid>
```

### Create Line

```powershell
absuite quotes create quote-line --TenantId $TENANT_ID --QuoteId <quote-guid> --QuoteLineCreateDto '{
  "Title": "Design consultation",
  "Description": "Design consultation hours",
  "ItemId": "<item-guid>",
  "ItemPriceId": "<price-guid>",
  "Quantity": 5,
  "CurrencyId": "<currency-guid>",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded"
}'
```

`QuoteLineCreateDto` shares the quote header/monetary fields and adds the item/quantity
line fields: `ItemId`, `ItemTitle`, `ItemShortDescription`, `ItemPrimaryImageUrl`,
`ShippingPolicyId`, `Quantity`, `Free`, `FreeReason`, `FreeReasonCode`, the `Data`/`DataLabel`
… `Data9`/`Data9Label` custom slots, `ItemPriceId`, `PriceListItemId`, `UnitId`, `UnitGroupId`,
`ForexRatesSnapshot`, the `…InUsd` snapshot totals, `CustomGlobalSurchargesAmount`(+`…CurrencyId`),
`CustomGlobalDiscountsAmount`(+`…CurrencyId`), `ReturnPolicyId`, `RefundPolicyId`,
`WarrantyPolicyId`, `ShipmentPolicyId`, `ShippingLocationId`, `LocationId`, `QuoteItemRecordId`,
`ParentBillingItemRecordId`, and `QuoteId`.

### Update Line

```powershell
absuite quotes update quote-line --TenantId $TENANT_ID --QuoteId <quote-guid> --QuoteLineId <quote-line-guid> --QuoteLineUpdateDto '{
  "Quantity": 8,
  "Description": "Increased to 8 hours",
  "CurrencyId": "<currency-guid>"
}'
```

`QuoteLineUpdateDto` carries the same line fields as create plus `UserId`,
`BillingLocationId`, `ShippingMethodId`. It does not carry `Id`.

### Upsert Line (create or update)

Create-or-update a line in one call. `QuoteLineUpsertDto` adds `Id` and `QuoteId` on top
of the update fields.

```powershell
absuite quotes upsert quote-line --TenantId $TENANT_ID --QuoteId <quote-guid> --QuoteLineId <quote-line-guid> --QuoteLineUpsertDto '{
  "QuoteId": "<quote-guid>",
  "ItemId": "<item-guid>",
  "Quantity": 10,
  "CurrencyId": "<currency-guid>"
}'
```

### Delete Line

```powershell
absuite quotes delete quote-line --TenantId $TENANT_ID --QuoteId <quote-guid> --QuoteLineId <quote-line-guid>
```

### Calculate a Single Line

```powershell
absuite quotes calculate quote-line --TenantId $TENANT_ID --QuoteId <quote-guid> --QuoteLineId <quote-line-guid>
```

## Email Notifications

### Preview Quote Email

Renders the email without sending. Same body as Send (an `EmailDispatchRequest`).

```powershell
absuite quotes preview quote-email --TenantId $TENANT_ID --QuoteId <quote-guid> --EmailDispatchRequest '{
  "Title": "Your quote",
  "Message": "Please review the attached quote.",
  "Culture": "en-US",
  "UiCulture": "en-US",
  "Recipients": ["<billing-email>"]
}'
```

### Send Quote Email

```powershell
absuite quotes send quote-email --TenantId $TENANT_ID --QuoteId <quote-guid> --EmailDispatchRequest '{
  "Title": "Your quote",
  "Message": "Please review the attached quote. It is valid until 2026-07-12.",
  "Culture": "en-US",
  "UiCulture": "en-US",
  "Recipients": ["<billing-email>"]
}'
```

**`EmailDispatchRequest` fields** (`Title`, `Message`, `Culture`, `UiCulture`, `Recipients` are **required**):
`Title`, `Message`, `Culture`, `UiCulture`, `Recipients` (array of emails), `ContactIds`
(array of contact GUIDs), `TenantIds` (array), `UserIds` (array), `ButtonLink`, `ButtonText`,
`AlertMessage`, `AlertType` (`None`|`Info`|`Error`|`Warning`|`Success`|`Action`|`Alert`),
`TemplateUrl`, `EmailTemplateId`.

## End-to-End Workflow

```powershell
# 1. Create the quote header (note the returned quote ID)
absuite quotes create quote --TenantId $TENANT_ID --QuoteCreateDto '{
  "Title": "Quote - Website Redesign",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "BillingEmail": "<billing-email>",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded",
  "QuoteStatus": "Draft",
  "EffectiveFrom": "2026-06-12T00:00:00Z",
  "EffectiveTo": "2026-07-12T00:00:00Z"
}'

# 2. Add a line
absuite quotes create quote-line --TenantId $TENANT_ID --QuoteId <quote-guid> --QuoteLineCreateDto '{
  "Title": "Design consultation", "ItemId": "<item-guid>", "Quantity": 5, "CurrencyId": "<currency-guid>", "ItemPriceId": "<price-guid>"
}'

# 3. Calculate totals
absuite quotes calculate quote --TenantId $TENANT_ID --QuoteId <quote-guid>

# 4. Send to the customer
absuite quotes send quote-email --TenantId $TENANT_ID --QuoteId <quote-guid> --EmailDispatchRequest '{
  "Title": "Your quote", "Message": "Please review the attached quote.", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<billing-email>"]
}'

# 5. Mark accepted, close, and convert to an order
absuite quotes update quote --TenantId $TENANT_ID --QuoteId <quote-guid> --QuoteUpdateDto '{ "QuoteStatus": "Accepted" }'
absuite quotes close quote --TenantId $TENANT_ID --QuoteId <quote-guid>
absuite quotes create order-from --TenantId $TENANT_ID --QuoteId <quote-guid>

# 6. Verify
absuite quotes get quote --TenantId $TENANT_ID --QuoteId <quote-guid>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List quotes | `absuite quotes list quotes` |
| Count quotes | `absuite quotes count quotes` |
| List extended quotes | `absuite quotes list extended-quotes` |
| Create quote | `absuite quotes create quote --QuoteCreateDto '{...}'` |
| Get quote | `absuite quotes get quote --QuoteId <quote-guid>` |
| Update quote | `absuite quotes update quote --QuoteId <quote-guid> --QuoteUpdateDto '{...}'` |
| Delete quote | `absuite quotes delete quote --QuoteId <quote-guid>` |
| Calculate quote | `absuite quotes calculate quote --QuoteId <quote-guid>` |
| Close quote | `absuite quotes close quote --QuoteId <quote-guid>` |
| Reopen quote | `absuite quotes reopen quote --QuoteId <quote-guid>` |
| Create order from quote | `absuite quotes create order-from --QuoteId <quote-guid>` |
| List lines | `absuite quotes list quote-lines --QuoteId <quote-guid>` |
| Count lines | `absuite quotes count quote-lines --QuoteId <quote-guid>` |
| Check line exists | `absuite quotes exists quote-line --QuoteId <quote-guid> --QuoteLineId <quote-line-guid>` |
| Create line | `absuite quotes create quote-line --QuoteId <quote-guid> --QuoteLineCreateDto '{...}'` |
| Get line | `absuite quotes get quote-line --QuoteId <quote-guid> --QuoteLineId <quote-line-guid>` |
| Update line | `absuite quotes update quote-line --QuoteId <quote-guid> --QuoteLineId <quote-line-guid> --QuoteLineUpdateDto '{...}'` |
| Upsert line | `absuite quotes upsert quote-line --QuoteId <quote-guid> --QuoteLineId <quote-line-guid> --QuoteLineUpsertDto '{...}'` |
| Delete line | `absuite quotes delete quote-line --QuoteId <quote-guid> --QuoteLineId <quote-line-guid>` |
| Calculate line | `absuite quotes calculate quote-line --QuoteId <quote-guid> --QuoteLineId <quote-line-guid>` |
| Preview email | `absuite quotes preview quote-email --QuoteId <quote-guid> --EmailDispatchRequest '{...}'` |
| Send email | `absuite quotes send quote-email --QuoteId <quote-guid> --EmailDispatchRequest '{...}'` |

> Every command also accepts `--TenantId <tenant-guid>` (omit it if you set a default tenant
> with `absuite config set --tenant-id <tenant-guid>`).
