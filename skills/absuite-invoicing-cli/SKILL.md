---
name: absuite-invoicing-cli
description: >
  Manage invoices in the Alliance Business Suite (ABS) Invoicing Service using the
  `absuite` CLI. Covers invoices, invoice lines, line taxes, adjustments
  (discounts/surcharges), references (credit/debit notes), payments, calculations,
  aggregations, and transactional email — via list/count/get/create/update/delete
  commands and service actions. Requires an authenticated CLI session (see
  absuite-login-cli). For atomic PATCH updates or raw HTTP, use the absuite-invoicing
  (REST) skill.
---

# Alliance Business Suite — Invoicing Skill (CLI)

Manage invoices through the `absuite` CLI's `invoicing` service. All invoicing
operations are tenant-scoped and require an authenticated session. The CLI does not
support PATCH (JSON Patch) — for partial atomic updates use the `absuite-invoicing`
REST skill.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-invoicing` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-invoicing` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general
   CLI usage and configuration, see `absuite-cli`.
2. **Set your tenant** — every invoicing command requires a tenant. Either set a default:
   ```powershell
   absuite config set --tenant-id <tenant-guid>
   ```
   …and reference it as `$TENANT_ID`, or pass `--TenantId <tenant-guid>` on each call.
3. **Discover commands:**
   ```powershell
   absuite invoicing list-commands
   absuite invoicing create invoice --help
   ```

## Command Structure

```
absuite invoicing <verb> <entity> --Param value
```

- **Verbs:** `list`, `count`, `search`, `get`, `create`, `update`, `delete`, plus
  service actions (`calculate`, `send`, `preview`, and the `aggregate-*` commands).
- **Entities:** `invoice`, `invoice-line`, `invoice-line-tax`, `invoice-adjustment`,
  `invoice-reference`, `invoice-payment`, `extended-invoice`.
- The canonical PowerShell function-name form also works as the command, e.g.
  `absuite invoicing New-Invoice --TenantId <tenant-guid> --InvoiceCreateDto '{...}'`
  is equivalent to `absuite invoicing create invoice ...`. The function names map to
  PowerShell-approved verbs: create → `New-`, get/list/count → `Get-`, update → `Update-`,
  delete → `Invoke-Delete...`, calculate → `Measure-`, send email → `Send-InvoiceEmail`,
  preview email → `Invoke-PreviewInvoiceEmail`, aggregate → `Invoke-AggregateInvoice...`.
- **JSON DTO params** are passed as a single-quoted JSON string (`--<Dto> '{...}'`) using
  the **same PascalCase field names** as the REST API.

## Key Concepts

- **InvoiceType** — `PurchaseInvoice` | `SalesInvoice` | `CreditNote` | `DebitNote`.
- **DocumentType** — `Standard` | `DebitNote` | `CreditNote`.
- **InvoiceStatus** — `Draft` | `Closed` | `Signed` | `Expired` | `Paid`.
- **CostCalculationMethod** — `Automatic` | `Custom`.
- **TaxCalculationMethod** — `Included` | `Excluded`.
- **Adjustment `Type`** — `Discount` | `Surcharge`.
- Monetary amounts are split into a value field and a matching `…CurrencyId` field
  (e.g. `Total` + `TotalCurrencyId`).

## Invoices

### Create Invoice

```powershell
absuite invoicing create invoice --TenantId $TENANT_ID --InvoiceCreateDto '{
  "Title": "Invoice - Q2 Enterprise License",
  "Description": "Enterprise license and support services",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "OrganizationId": "<organization-guid>",
  "CompanyName": "<company-name>",
  "BillingEmail": "<billing-email>",
  "AddressLine1": "<address-line-1>",
  "CountryId": "<country-guid>",
  "InvoiceType": "SalesInvoice",
  "DocumentType": "Standard",
  "InvoiceStatus": "Draft",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded",
  "PaymentDue": "2026-07-15T00:00:00Z",
  "Notes": "Net 30 payment terms apply.",
  "OrderId": "<order-guid>"
}'
```

**Common `InvoiceCreateDto` fields:** `Title`, `Description`, `CurrencyId`, `IndividualId`,
`OrganizationId`, `ReceiverTenantId`, `FirstName`, `LastName`, `CompanyName`, `BillingEmail`,
`AddressLine1`, `AddressLine2`, `PostalCode`, `CountryId`, `StateId`, `CityId`, `ForexRate`,
`PriceListId`, `PaymentTermId`, `Number`, `Notes`, `CustomerNotes`, `OrderId`, `Enumeration`,
`EnumerationRangeId`, `PaymentModeId`, `EmisorBillingProfileId`, `ReceiverBillingProfileId`,
`EmisorWalletAccountId`, `ReceiverWalletAccountId`, `Closed`, `Paid`, the monetary
value/`…CurrencyId` pairs (`TotalDetail`, `TotalProfit`, `TotalDiscounts`, `TotalSurcharges`,
`TotalShippingCost`, `TotalShippingTax`, `TotalWithheldTax`, `TotalTaxBase`, `TotalTaxes`,
`TotalGlobalSurcharges`, `TotalGlobalDiscounts`, `Total`), `InvoiceType`, `DocumentType`,
`InvoiceStatus`, `CostCalculationMethod`, `TaxCalculationMethod`, `PaymentDue`, `ValidFrom`,
`ValidTo`, and the inline arrays `InvoiceLines`, `InvoiceReferences`, `InvoiceAdjustments`.

### Create Invoice with Inline Lines and Adjustments

```powershell
absuite invoicing create invoice --TenantId $TENANT_ID --InvoiceCreateDto '{
  "Title": "Invoice - Acme",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "InvoiceType": "SalesInvoice",
  "InvoiceStatus": "Draft",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded",
  "InvoiceLines": [
    { "ItemId": "<item-guid-1>", "Quantity": 5, "CurrencyId": "<currency-guid>", "ItemPriceId": "<price-guid-1>", "Title": "Enterprise License" },
    { "ItemId": "<item-guid-2>", "Quantity": 1, "CurrencyId": "<currency-guid>", "ItemPriceId": "<price-guid-2>", "Title": "Premium Support" }
  ],
  "InvoiceAdjustments": [
    { "Description": "Volume discount", "DiscountPercent": 10, "Type": "Discount", "CurrencyId": "<currency-guid>" }
  ]
}'
```

### List Invoices

```powershell
absuite invoicing list invoices --TenantId $TENANT_ID
```

### Count Invoices

```powershell
absuite invoicing count invoices --TenantId $TENANT_ID
```

### List Extended Invoices (with related data)

```powershell
absuite invoicing list extended-invoices --TenantId $TENANT_ID
```

### Count Extended Invoices

```powershell
absuite invoicing count extended-invoices --TenantId $TENANT_ID
```

### Get Invoice by ID

```powershell
absuite invoicing get invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

### Get Extended Invoice by ID

```powershell
absuite invoicing get extended-invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

### Update Invoice (full replace)

```powershell
absuite invoicing update invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceUpdateDto '{
  "Title": "Invoice - Q2 Enterprise License (revised)",
  "CurrencyId": "<currency-guid>",
  "InvoiceStatus": "Closed",
  "Notes": "Revised payment terms"
}'
```

`InvoiceUpdateDto` carries the same header/monetary fields as create, plus `UserId`,
`BillingLocationId`, `ShippingLocationId`, `ShippingMethodId` (and the inline arrays). It
does not carry `Id`.

### Delete Invoice

```powershell
absuite invoicing delete invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

### Calculate Invoice

Recompute server-side totals after editing lines, taxes, or adjustments.

```powershell
absuite invoicing calculate invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

## Invoice Lines

### List Lines

```powershell
# Optionally filter by item with --ItemId <item-guid>
absuite invoicing list invoice-lines --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

### Count Lines

```powershell
absuite invoicing count invoice-lines --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

### Get Line by ID

```powershell
absuite invoicing get invoice-line --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid>
```

### Create Line

```powershell
absuite invoicing create invoice-line --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineCreateDto '{
  "Title": "Enterprise License",
  "Description": "Annual platform license, 10 seats",
  "ItemId": "<item-guid>",
  "ItemPriceId": "<price-guid>",
  "Quantity": 10,
  "CurrencyId": "<currency-guid>",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded"
}'
```

`InvoiceLineCreateDto` shares the invoice header/monetary fields and adds `Quantity`,
`ItemId`, `InvoiceId`, `ItemPriceId`.

### Update Line

```powershell
absuite invoicing update invoice-line --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid> --InvoiceLineUpdateDto '{
  "Quantity": 15,
  "Description": "Increased to 15 seats",
  "CurrencyId": "<currency-guid>"
}'
```

`InvoiceLineUpdateDto` adds `UserId`, `BillingLocationId`, `ShippingLocationId`,
`ShippingMethodId`, `Quantity`, `ItemId`, `ItemPriceId`, `InvoiceLineId`, `TaxAmountInUsd`,
`TaxBaseAmountInUsd` on top of the shared fields.

### Delete Line

```powershell
absuite invoicing delete invoice-line --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid>
```

### Calculate a Single Line

```powershell
absuite invoicing calculate invoice-line --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid>
```

## Invoice Line Taxes

Apply tax policies to individual invoice lines.

### List Taxes for a Line

```powershell
absuite invoicing list invoice-line-taxes --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid>
```

### Count Taxes for a Line

```powershell
absuite invoicing count invoice-line-taxes --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid>
```

### Add a Tax to a Line

```powershell
absuite invoicing create invoice-line-tax --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid> --InvoiceLineAppliedTaxCreateDto '{
  "TaxPolicyId": "<tax-policy-guid>",
  "InvoiceId": "<invoice-guid>"
}'
```

`InvoiceLineAppliedTaxCreateDto` fields: `Id`, `Timestamp`, `InvoiceId`, `TaxPolicyId`.

### Update a Line Tax

```powershell
absuite invoicing update invoice-line-tax --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid> --InvoiceLineTaxId <invoice-line-tax-guid> --InvoiceLineAppliedTaxUpdateDto '{
  "TaxPolicyId": "<new-tax-policy-guid>"
}'
```

`InvoiceLineAppliedTaxUpdateDto` has a single field: `TaxPolicyId`.

### Remove a Line Tax

```powershell
absuite invoicing delete invoice-line-tax --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid> --InvoiceLineTaxId <invoice-line-tax-guid>
```

## Adjustments (Discounts / Surcharges)

Invoice-level discounts or surcharges.

### List Adjustments

```powershell
absuite invoicing list invoice-adjustments --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

### Count Adjustments

```powershell
absuite invoicing count invoice-adjustments --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

### Get Adjustment by ID

```powershell
absuite invoicing get invoice-adjustment --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceAdjustmentId <invoice-adjustment-guid>
```

### Create Adjustment

```powershell
# Percentage discount
absuite invoicing create invoice-adjustment --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceAdjustmentCreateDto '{
  "Description": "Early payment discount",
  "DiscountPercent": 5,
  "Type": "Discount",
  "CurrencyId": "<currency-guid>",
  "Priority": 1,
  "Code": "EARLY5"
}'

# Fixed surcharge
absuite invoicing create invoice-adjustment --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceAdjustmentCreateDto '{
  "Description": "Rush processing fee",
  "SurchargeAmount": 150.00,
  "Type": "Surcharge",
  "CurrencyId": "<currency-guid>"
}'
```

`InvoiceAdjustmentCreateDto` fields: `Id`, `Timestamp`, `CurrencyId`, `Priority`, `Code`,
`Description`, `SurchargePercent`, `SurchargeAmount`, `DiscountPercent`, `DiscountAmount`,
`TotalSurcharge`, `TotalDiscount`, `Type` (`Discount`|`Surcharge`).

### Update Adjustment

```powershell
absuite invoicing update invoice-adjustment --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceAdjustmentId <invoice-adjustment-guid> --InvoiceAdjustmentUpdateDto '{
  "DiscountPercent": 8,
  "Description": "Loyalty discount increased",
  "Type": "Discount",
  "CurrencyId": "<currency-guid>"
}'
```

`InvoiceAdjustmentUpdateDto` fields: `CurrencyId`, `Priority`, `Code`, `Description`,
`SurchargePercent`, `SurchargeAmount`, `DiscountPercent`, `DiscountAmount`, `TotalSurcharge`,
`TotalDiscount`, `Type`.

### Delete Adjustment

```powershell
absuite invoicing delete invoice-adjustment --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceAdjustmentId <invoice-adjustment-guid>
```

## Invoice References

Link invoices together (e.g. a credit note → the original invoice).

### List References

```powershell
absuite invoicing list invoice-references --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

### Count References

```powershell
absuite invoicing count invoice-references --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

### Get Reference by ID

```powershell
absuite invoicing get invoice-reference --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceReferenceId <invoice-reference-guid>
```

### Create Reference

```powershell
absuite invoicing create invoice-reference --TenantId $TENANT_ID --InvoiceId <credit-note-guid> --InvoiceReferenceCreateDto '{
  "ReferencedInvoiceId": "<original-invoice-guid>"
}'
```

`InvoiceReferenceCreateDto` fields: `Id`, `Timestamp`, `ReferencedInvoiceId`.

### Update Reference

```powershell
absuite invoicing update invoice-reference --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceReferenceId <invoice-reference-guid> --InvoiceReferenceUpdateDto '{
  "ReferencedInvoiceId": "<different-invoice-guid>"
}'
```

`InvoiceReferenceUpdateDto` has a single field: `ReferencedInvoiceId`.

### Delete Reference

```powershell
absuite invoicing delete invoice-reference --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceReferenceId <invoice-reference-guid>
```

## Payments (read-only)

### List Payments for an Invoice

```powershell
absuite invoicing list invoice-payments --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

### Count Payments

```powershell
absuite invoicing count invoice-payments --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

## Aggregations

Aggregate financial figures across a set of invoices. The request body (`RequestBody`) is a
**JSON array of invoice GUIDs**; pass an optional `--CurrencyId <currency-guid>` to convert
the result into that currency.

```powershell
# Aggregate totals
absuite invoicing aggregate-invoice-totals --TenantId $TENANT_ID --RequestBody '["<invoice-guid-1>", "<invoice-guid-2>"]' --CurrencyId <currency-guid>

# Aggregate taxes
absuite invoicing aggregate-invoice-taxes --TenantId $TENANT_ID --RequestBody '["<invoice-guid-1>", "<invoice-guid-2>"]'

# Aggregate tax bases
absuite invoicing aggregate-invoice-tax-bases --TenantId $TENANT_ID --RequestBody '["<invoice-guid-1>", "<invoice-guid-2>"]'

# Aggregate discounts
absuite invoicing aggregate-invoice-discounts --TenantId $TENANT_ID --RequestBody '["<invoice-guid-1>", "<invoice-guid-2>"]'

# Aggregate global surcharges
absuite invoicing aggregate-invoice-global-surcharges --TenantId $TENANT_ID --RequestBody '["<invoice-guid-1>", "<invoice-guid-2>"]'
```

## Email Notifications

### Preview Invoice Email

Renders the email without sending. Same body as Send (an `EmailDispatchRequest`).

```powershell
absuite invoicing preview invoice-email --TenantId $TENANT_ID --InvoiceId <invoice-guid> --EmailDispatchRequest '{
  "Title": "Your invoice",
  "Message": "Please find your invoice below.",
  "Culture": "en-US",
  "UiCulture": "en-US",
  "Recipients": ["<billing-email>"]
}'
```

### Send Invoice Email

```powershell
absuite invoicing send invoice-email --TenantId $TENANT_ID --InvoiceId <invoice-guid> --EmailDispatchRequest '{
  "Title": "Your invoice",
  "Message": "Please find your invoice below. Payment is due by 2026-07-15.",
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

## Recipe: Issue a Credit Note

```powershell
# 1. Create a credit note referencing the original invoice (inline reference)
absuite invoicing create invoice --TenantId $TENANT_ID --InvoiceCreateDto '{
  "Title": "Credit Note for original invoice",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "InvoiceType": "CreditNote",
  "DocumentType": "CreditNote",
  "InvoiceStatus": "Draft",
  "InvoiceReferences": [ { "ReferencedInvoiceId": "<original-invoice-guid>" } ]
}'

# 2. Add a credit line (negative quantity)
absuite invoicing create invoice-line --TenantId $TENANT_ID --InvoiceId <credit-note-guid> --InvoiceLineCreateDto '{
  "Title": "License (Credit)", "ItemId": "<item-guid>", "Quantity": -2, "CurrencyId": "<currency-guid>", "ItemPriceId": "<price-guid>"
}'

# 3. Calculate
absuite invoicing calculate invoice --TenantId $TENANT_ID --InvoiceId <credit-note-guid>
```

## End-to-End Workflow

```powershell
# 1. Create the invoice header (note the returned invoice ID)
absuite invoicing create invoice --TenantId $TENANT_ID --InvoiceCreateDto '{
  "Title": "Invoice - Q2 Enterprise License",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "BillingEmail": "<billing-email>",
  "InvoiceType": "SalesInvoice",
  "InvoiceStatus": "Draft",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded",
  "PaymentDue": "2026-07-15T00:00:00Z"
}'

# 2. Add a line
absuite invoicing create invoice-line --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineCreateDto '{
  "Title": "Enterprise License", "ItemId": "<item-guid>", "Quantity": 10, "CurrencyId": "<currency-guid>", "ItemPriceId": "<price-guid>"
}'

# 3. Apply a tax to the line
absuite invoicing create invoice-line-tax --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid> --InvoiceLineAppliedTaxCreateDto '{
  "TaxPolicyId": "<tax-policy-guid>", "InvoiceId": "<invoice-guid>"
}'

# 4. Add an invoice-level discount
absuite invoicing create invoice-adjustment --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceAdjustmentCreateDto '{
  "Description": "Volume discount", "DiscountPercent": 10, "Type": "Discount", "CurrencyId": "<currency-guid>"
}'

# 5. Calculate totals
absuite invoicing calculate invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid>

# 6. Update status to Signed
absuite invoicing update invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceUpdateDto '{ "InvoiceStatus": "Signed" }'

# 7. Send the invoice email
absuite invoicing send invoice-email --TenantId $TENANT_ID --InvoiceId <invoice-guid> --EmailDispatchRequest '{
  "Title": "Your invoice", "Message": "Please find your invoice below.", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<billing-email>"]
}'

# 8. Verify
absuite invoicing get invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List invoices | `absuite invoicing list invoices` |
| Count invoices | `absuite invoicing count invoices` |
| List extended invoices | `absuite invoicing list extended-invoices` |
| Count extended invoices | `absuite invoicing count extended-invoices` |
| Create invoice | `absuite invoicing create invoice --InvoiceCreateDto '{...}'` |
| Get invoice | `absuite invoicing get invoice --InvoiceId <invoice-guid>` |
| Get extended invoice | `absuite invoicing get extended-invoice --InvoiceId <invoice-guid>` |
| Update invoice | `absuite invoicing update invoice --InvoiceId <invoice-guid> --InvoiceUpdateDto '{...}'` |
| Delete invoice | `absuite invoicing delete invoice --InvoiceId <invoice-guid>` |
| Calculate invoice | `absuite invoicing calculate invoice --InvoiceId <invoice-guid>` |
| List lines | `absuite invoicing list invoice-lines --InvoiceId <invoice-guid>` |
| Count lines | `absuite invoicing count invoice-lines --InvoiceId <invoice-guid>` |
| Create line | `absuite invoicing create invoice-line --InvoiceId <invoice-guid> --InvoiceLineCreateDto '{...}'` |
| Get line | `absuite invoicing get invoice-line --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid>` |
| Update line | `absuite invoicing update invoice-line --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid> --InvoiceLineUpdateDto '{...}'` |
| Delete line | `absuite invoicing delete invoice-line --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid>` |
| Calculate line | `absuite invoicing calculate invoice-line --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid>` |
| List line taxes | `absuite invoicing list invoice-line-taxes --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid>` |
| Count line taxes | `absuite invoicing count invoice-line-taxes --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid>` |
| Create line tax | `absuite invoicing create invoice-line-tax --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid> --InvoiceLineAppliedTaxCreateDto '{...}'` |
| Update line tax | `absuite invoicing update invoice-line-tax --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid> --InvoiceLineTaxId <invoice-line-tax-guid> --InvoiceLineAppliedTaxUpdateDto '{...}'` |
| Delete line tax | `absuite invoicing delete invoice-line-tax --InvoiceId <invoice-guid> --InvoiceLineId <invoice-line-guid> --InvoiceLineTaxId <invoice-line-tax-guid>` |
| List adjustments | `absuite invoicing list invoice-adjustments --InvoiceId <invoice-guid>` |
| Count adjustments | `absuite invoicing count invoice-adjustments --InvoiceId <invoice-guid>` |
| Create adjustment | `absuite invoicing create invoice-adjustment --InvoiceId <invoice-guid> --InvoiceAdjustmentCreateDto '{...}'` |
| Get adjustment | `absuite invoicing get invoice-adjustment --InvoiceId <invoice-guid> --InvoiceAdjustmentId <invoice-adjustment-guid>` |
| Update adjustment | `absuite invoicing update invoice-adjustment --InvoiceId <invoice-guid> --InvoiceAdjustmentId <invoice-adjustment-guid> --InvoiceAdjustmentUpdateDto '{...}'` |
| Delete adjustment | `absuite invoicing delete invoice-adjustment --InvoiceId <invoice-guid> --InvoiceAdjustmentId <invoice-adjustment-guid>` |
| List references | `absuite invoicing list invoice-references --InvoiceId <invoice-guid>` |
| Count references | `absuite invoicing count invoice-references --InvoiceId <invoice-guid>` |
| Create reference | `absuite invoicing create invoice-reference --InvoiceId <invoice-guid> --InvoiceReferenceCreateDto '{...}'` |
| Get reference | `absuite invoicing get invoice-reference --InvoiceId <invoice-guid> --InvoiceReferenceId <invoice-reference-guid>` |
| Update reference | `absuite invoicing update invoice-reference --InvoiceId <invoice-guid> --InvoiceReferenceId <invoice-reference-guid> --InvoiceReferenceUpdateDto '{...}'` |
| Delete reference | `absuite invoicing delete invoice-reference --InvoiceId <invoice-guid> --InvoiceReferenceId <invoice-reference-guid>` |
| List payments | `absuite invoicing list invoice-payments --InvoiceId <invoice-guid>` |
| Count payments | `absuite invoicing count invoice-payments --InvoiceId <invoice-guid>` |
| Preview email | `absuite invoicing preview invoice-email --InvoiceId <invoice-guid> --EmailDispatchRequest '{...}'` |
| Send email | `absuite invoicing send invoice-email --InvoiceId <invoice-guid> --EmailDispatchRequest '{...}'` |
| Aggregate totals | `absuite invoicing aggregate-invoice-totals --RequestBody '[...]'` |
| Aggregate taxes | `absuite invoicing aggregate-invoice-taxes --RequestBody '[...]'` |
| Aggregate tax bases | `absuite invoicing aggregate-invoice-tax-bases --RequestBody '[...]'` |
| Aggregate discounts | `absuite invoicing aggregate-invoice-discounts --RequestBody '[...]'` |
| Aggregate global surcharges | `absuite invoicing aggregate-invoice-global-surcharges --RequestBody '[...]'` |

> Every command also accepts `--TenantId <tenant-guid>` (omit it if you set a default tenant
> with `absuite config set --tenant-id <tenant-guid>`).
