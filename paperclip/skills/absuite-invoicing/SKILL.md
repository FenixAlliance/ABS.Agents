---
name: absuite-invoicing
description: >
  Create, read, update, delete, and manage invoices in the Alliance Business Suite
  (ABS) Invoicing Service using the `absuite` CLI. Covers invoices, invoice lines,
  line taxes, adjustments (discounts/surcharges), references (credit/debit notes),
  payments, calculations, aggregations, and transactional email notifications.
  Requires an authenticated CLI session (use the `absuite-login` skill to authenticate first).
---

# Alliance Business Suite — Invoicing Skill

Manage invoices through the `absuite` CLI's `invoicing` service. All invoicing operations are tenant-scoped and require authentication.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant** — all invoicing operations require a tenant. Either set a default:
   ```bash
   absuite config set --tenant-id <tenant-guid>
   ```
   Or pass `--TenantId <guid>` on each call.
3. **Discover commands** — run `absuite invoicing list-commands` to see all invoicing commands, or use `--help` on any command for full parameter and output schemas.

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
# List all invoicing commands
absuite invoicing list-commands

# Get detailed help for any command
absuite invoicing create invoice --help
```

## Key Concepts

- **Invoice** — a formal billing document with header info (customer, currency, totals, status), line items, adjustments, and references.
- **Invoice Line** — an individual item/service billed, with quantity, pricing, and tax info.
- **Invoice Line Tax** — a tax applied to a specific invoice line (linked to a tax policy).
- **Invoice Adjustment** — a discount or surcharge applied at the invoice level (percentage or fixed amount).
- **Invoice Reference** — links between invoices (e.g., a credit note referencing the original invoice).
- **Invoice Payment** — payment records associated with an invoice.
- **InvoiceType** — `"Standard"`, `"CreditNote"`, `"DebitNote"`, `"Proforma"`.
- **DocumentType** — document classification for regulatory compliance.
- **InvoiceStatus** — lifecycle state: `"Draft"`, `"Sent"`, `"Paid"`, `"Overdue"`, `"Cancelled"`, `"Void"`.
- **Enumeration** — invoice number/sequence (auto-generated or from an enumeration range).

## Workflow: Creating an Invoice

1. **Create the invoice header** with customer, currency, and billing info
2. **Add invoice lines** for each billed item/service
3. **Add line taxes** to each line (link to tax policies)
4. **(Optional)** Add adjustments (global discounts/surcharges)
5. **Calculate totals** — let the server compute taxes, discounts, and grand total
6. **(Optional)** Add references to related invoices
7. **Send the invoice** via transactional email

## CRUD Operations

### Create Invoice

```bash
absuite invoicing create invoice --TenantId $TENANT_ID --InvoiceCreateDto '{
  "Title": "Invoice - Acme Corp Q2 2026",
  "Description": "Enterprise license and support services",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "OrganizationId": "<organization-guid>",
  "FirstName": "John",
  "LastName": "Doe",
  "CompanyName": "Acme Corp",
  "BillingEmail": "billing@acme.com",
  "AddressLine1": "123 Main St",
  "PostalCode": "10001",
  "CountryId": "<country-guid>",
  "StateId": "<state-guid>",
  "CityId": "<city-guid>",
  "InvoiceType": "Standard",
  "InvoiceStatus": "Draft",
  "CostCalculationMethod": "PerLine",
  "TaxCalculationMethod": "PerLine",
  "PaymentDue": "2026-07-15T00:00:00Z",
  "ValidFrom": "2026-04-19T00:00:00Z",
  "ValidTo": "2026-07-15T00:00:00Z",
  "Notes": "Net 30 payment terms apply.",
  "OrderId": "<order-guid>"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invoice - Acme Corp Q2 2026",
    "description": "Enterprise license and support services",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "organizationId": "<organization-guid>",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "Acme Corp",
    "billingEmail": "billing@acme.com",
    "addressLine1": "123 Main St",
    "postalCode": "10001",
    "countryId": "<country-guid>",
    "stateId": "<state-guid>",
    "cityId": "<city-guid>",
    "invoiceType": "Standard",
    "invoiceStatus": "Draft",
    "costCalculationMethod": "PerLine",
    "taxCalculationMethod": "PerLine",
    "paymentDue": "2026-07-15T00:00:00Z",
    "validFrom": "2026-04-19T00:00:00Z",
    "validTo": "2026-07-15T00:00:00Z",
    "notes": "Net 30 payment terms apply.",
    "orderId": "<order-guid>"
  }'
```

**Required fields:**
- `Title` — invoice title
- `CurrencyId` — billing currency

**Recommended fields:**
- `IndividualId` or `OrganizationId` — CRM contact/organization
- `BillingEmail` — recipient for invoice emails
- Billing address — `FirstName`, `LastName`, `CompanyName`, `AddressLine1`, `CountryId`, etc.
- `InvoiceType` — `"Standard"`, `"CreditNote"`, `"DebitNote"`, `"Proforma"`
- `InvoiceStatus` — initial status (`"Draft"`)
- `PaymentDue` — payment due date
- `CostCalculationMethod` / `TaxCalculationMethod` — `"PerLine"` or `"PerInvoice"`

**Optional fields:**
- `OrderId` — link to an originating order
- `Number` — explicit invoice number (auto-assigned if omitted)
- `Enumeration` — invoice numbering string
- `EnumerationRangeId` — numbering range reference
- `PaymentModeId` — preferred payment method
- `EmisorBillingProfileId`, `ReceiverBillingProfileId` — billing profile references
- `EmisorWalletAccountId`, `ReceiverWalletAccountId` — wallet accounts for payment
- `PriceListId`, `PaymentTermId` — pricing and terms
- `ValidFrom`, `ValidTo` — invoice validity dates
- `Notes` — internal notes
- `CustomerNotes` — customer-visible notes
- `DocumentType` — regulatory document classification
- `InvoiceLines` — inline array of invoice lines
- `InvoiceReferences` — inline array of invoice references
- `InvoiceAdjustments` — inline array of adjustments

### Create Invoice with Inline Lines

```bash
absuite invoicing create invoice --TenantId $TENANT_ID --InvoiceCreateDto '{
  "Title": "Invoice #1042 - Acme Corp",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "InvoiceType": "Standard",
  "InvoiceStatus": "Draft",
  "PaymentDue": "2026-07-15T00:00:00Z",
  "CostCalculationMethod": "PerLine",
  "TaxCalculationMethod": "PerLine",
  "InvoiceLines": [
    {
      "ItemId": "<item-guid-1>",
      "Quantity": 5,
      "CurrencyId": "<currency-guid>",
      "ItemPriceId": "<price-guid-1>",
      "Title": "ABS Enterprise License",
      "Description": "5 seats, annual"
    },
    {
      "ItemId": "<item-guid-2>",
      "Quantity": 1,
      "CurrencyId": "<currency-guid>",
      "ItemPriceId": "<price-guid-2>",
      "Title": "Premium Support",
      "Description": "Annual support plan"
    }
  ],
  "InvoiceAdjustments": [
    {
      "Description": "Volume discount",
      "DiscountPercent": 10,
      "Type": "Discount"
    }
  ]
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invoice #1042 - Acme Corp",
    "currencyId": "<currency-guid>",
    "individualId": "<contact-guid>",
    "invoiceType": "Standard",
    "invoiceStatus": "Draft",
    "paymentDue": "2026-07-15T00:00:00Z",
    "costCalculationMethod": "PerLine",
    "taxCalculationMethod": "PerLine",
    "invoiceLines": [
      {
        "itemId": "<item-guid-1>",
        "quantity": 5,
        "currencyId": "<currency-guid>",
        "itemPriceId": "<price-guid-1>",
        "title": "ABS Enterprise License",
        "description": "5 seats, annual"
      },
      {
        "itemId": "<item-guid-2>",
        "quantity": 1,
        "currencyId": "<currency-guid>",
        "itemPriceId": "<price-guid-2>",
        "title": "Premium Support",
        "description": "Annual support plan"
      }
    ],
    "invoiceAdjustments": [
      {
        "description": "Volume discount",
        "discountPercent": 10,
        "type": "Discount"
      }
    ]
  }'
```

### List Invoices

```bash
absuite invoicing list invoices --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Extended Invoices (with related data)

```bash
absuite invoicing list extended-invoices --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Invoices

```bash
absuite invoicing count invoices --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Extended Invoices

```bash
absuite invoicing count extended-invoices --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Extended/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Invoice by ID

```bash
absuite invoicing get invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Extended Invoice

```bash
absuite invoicing get extended-invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Invoice

```bash
absuite invoicing update invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceUpdateDto '{
  "InvoiceStatus": "Sent",
  "Notes": "Sent to client on 2026-04-19"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceStatus": "Sent",
    "notes": "Sent to client on 2026-04-19"
  }'
```

### Delete Invoice

```bash
absuite invoicing delete invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Invoice Lines

### Add a Line

```bash
absuite invoicing create invoice-line --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineCreateDto '{
  "Title": "ABS Enterprise License",
  "Description": "Annual platform license, 10 seats",
  "ItemId": "<item-guid>",
  "ItemPriceId": "<price-guid>",
  "Quantity": 10,
  "CurrencyId": "<currency-guid>",
  "CostCalculationMethod": "PerLine",
  "TaxCalculationMethod": "PerLine"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ABS Enterprise License",
    "description": "Annual platform license, 10 seats",
    "itemId": "<item-guid>",
    "itemPriceId": "<price-guid>",
    "quantity": 10,
    "currencyId": "<currency-guid>",
    "costCalculationMethod": "PerLine",
    "taxCalculationMethod": "PerLine"
  }'
```

### List Lines

```bash
absuite invoicing list invoice-lines --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Lines

```bash
absuite invoicing count invoice-lines --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Lines/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Line by ID

```bash
absuite invoicing get invoice-line --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Lines/$INVOICE_LINE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Line

```bash
absuite invoicing update invoice-line --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <line-guid> --InvoiceLineUpdateDto '{
  "Quantity": 15,
  "Description": "Increased to 15 seats"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Lines/$INVOICE_LINE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 15,
    "description": "Increased to 15 seats"
  }'
```

### Delete Line

```bash
absuite invoicing delete invoice-line --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Lines/$INVOICE_LINE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Invoice Line Taxes

Apply tax policies to individual invoice lines.

### Add Tax to a Line

```bash
absuite invoicing create invoice-line-tax --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <line-guid> --InvoiceLineAppliedTaxCreateDto '{
  "TaxPolicyId": "<tax-policy-guid>",
  "InvoiceId": "<invoice-guid>"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Lines/$INVOICE_LINE_ID/Taxes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taxPolicyId": "<tax-policy-guid>",
    "invoiceId": "<invoice-guid>"
  }'
```

### List Taxes for a Line

```bash
absuite invoicing list invoice-line-taxes --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Lines/$INVOICE_LINE_ID/Taxes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Taxes for a Line

```bash
absuite invoicing count invoice-line-taxes --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Lines/$INVOICE_LINE_ID/Taxes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update a Line Tax

```bash
absuite invoicing update invoice-line-tax --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <line-guid> --InvoiceLineAppliedTaxId <tax-guid> --InvoiceLineAppliedTaxUpdateDto '{
  "TaxPolicyId": "<new-tax-policy-guid>"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Lines/$INVOICE_LINE_ID/Taxes/$TAX_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taxPolicyId": "<new-tax-policy-guid>"
  }'
```

### Remove a Line Tax

```bash
absuite invoicing delete invoice-line-tax --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <line-guid> --InvoiceLineAppliedTaxId <tax-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Lines/$INVOICE_LINE_ID/Taxes/$TAX_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Adjustments (Discounts / Surcharges)

Apply invoice-level discounts or surcharges.

### Create Adjustment

```bash
# Percentage discount
absuite invoicing create invoice-adjustment --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceAdjustmentCreateDto '{
  "Description": "Early payment discount",
  "DiscountPercent": 5,
  "Type": "Discount",
  "CurrencyId": "<currency-guid>"
}'

# Fixed surcharge
absuite invoicing create invoice-adjustment --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceAdjustmentCreateDto '{
  "Description": "Rush processing fee",
  "SurchargeAmount": 150.00,
  "Type": "Surcharge",
  "CurrencyId": "<currency-guid>"
}'
```

**REST API equivalent:**
```bash
# Percentage discount
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Adjustments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Early payment discount",
    "discountPercent": 5,
    "type": "Discount",
    "currencyId": "<currency-guid>"
  }'

# Fixed surcharge
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Adjustments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Rush processing fee",
    "surchargeAmount": 150.00,
    "type": "Surcharge",
    "currencyId": "<currency-guid>"
  }'
```

### List Adjustments

```bash
absuite invoicing list invoice-adjustments --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Adjustments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Adjustments

```bash
absuite invoicing count invoice-adjustments --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Adjustments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Adjustment by ID

```bash
absuite invoicing get invoice-adjustment --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceAdjustmentId <adjustment-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Adjustments/$ADJUSTMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Adjustment

```bash
absuite invoicing update invoice-adjustment --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceAdjustmentId <adjustment-guid> --InvoiceAdjustmentUpdateDto '{
  "DiscountPercent": 8,
  "Description": "Loyalty discount increased"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Adjustments/$ADJUSTMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discountPercent": 8,
    "description": "Loyalty discount increased"
  }'
```

### Delete Adjustment

```bash
absuite invoicing delete invoice-adjustment --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceAdjustmentId <adjustment-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Adjustments/$ADJUSTMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Invoice References

Link invoices together (e.g., credit note → original invoice).

### Create Reference

```bash
absuite invoicing create invoice-reference --TenantId $TENANT_ID --InvoiceId <credit-note-guid> --InvoiceReferenceCreateDto '{
  "ReferencedInvoiceId": "<original-invoice-guid>"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/References" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "referencedInvoiceId": "<original-invoice-guid>"
  }'
```

### List References

```bash
absuite invoicing list invoice-references --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/References" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count References

```bash
absuite invoicing count invoice-references --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/References/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Reference by ID

```bash
absuite invoicing get invoice-reference --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceReferenceId <reference-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/References/$REFERENCE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Reference

```bash
absuite invoicing update invoice-reference --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceReferenceId <reference-guid> --InvoiceReferenceUpdateDto '{
  "ReferencedInvoiceId": "<different-invoice-guid>"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/References/$REFERENCE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "referencedInvoiceId": "<different-invoice-guid>"
  }'
```

### Delete Reference

```bash
absuite invoicing delete invoice-reference --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceReferenceId <reference-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/References/$REFERENCE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Payments

### List Payments for an Invoice

```bash
absuite invoicing list invoice-payments --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Payments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Payments

```bash
absuite invoicing count invoice-payments --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Payments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Calculations

Always recalculate after adding/modifying lines, taxes, or adjustments.

### Calculate Full Invoice

```bash
absuite invoicing calculate invoice --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Calculate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Calculate a Single Line

```bash
absuite invoicing calculate invoice-line --TenantId $TENANT_ID --InvoiceId <invoice-guid> --InvoiceLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Lines/$INVOICE_LINE_ID/Calculate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Aggregations

Get aggregated financial summaries across all invoices.

```bash
# Aggregate totals
absuite invoicing aggregate-invoice-totals --TenantId $TENANT_ID

# Aggregate taxes
absuite invoicing aggregate-invoice-taxes --TenantId $TENANT_ID

# Aggregate tax bases
absuite invoicing aggregate-invoice-tax-bases --TenantId $TENANT_ID

# Aggregate discounts
absuite invoicing aggregate-invoice-discounts --TenantId $TENANT_ID

# Aggregate global surcharges
absuite invoicing aggregate-invoice-global-surcharges --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
# Aggregate totals
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Aggregate/Totals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Aggregate taxes
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Aggregate/Taxes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Aggregate tax bases
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Aggregate/TaxBases" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Aggregate discounts
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Aggregate/Discounts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Aggregate global surcharges
curl -X GET "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/Aggregate/GlobalSurcharges" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Email Notifications

### Preview Invoice Email

```bash
absuite invoicing preview invoice-email --TenantId $TENANT_ID --InvoiceId <invoice-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Send Invoice Email

```bash
absuite invoicing send invoice-email --TenantId $TENANT_ID --InvoiceId <invoice-guid> --EmailDispatchRequest '{
  "Title": "Invoice #1042 - Acme Corp",
  "Message": "Please find your invoice attached. Payment is due by July 15, 2026.",
  "Recipients": ["billing@acme.com"],
  "Culture": "en-US"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/InvoicingService/Invoices/$INVOICE_ID/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invoice #1042 - Acme Corp",
    "message": "Please find your invoice attached. Payment is due by July 15, 2026.",
    "recipients": ["billing@acme.com"],
    "culture": "en-US"
  }'
```

**EmailDispatchRequest fields:**
- `Title` — email subject line
- `Message` — email body text
- `Recipients` — array of email addresses
- `ContactIds` — array of CRM contact GUIDs (sends to their email)
- `TenantIds` — array of tenant GUIDs
- `UserIds` — array of user GUIDs
- `Culture` / `UiCulture` — email locale
- `EmailTemplateId` — use a specific email template
- `ButtonLink`, `ButtonText` — optional CTA button
- `AlertMessage`, `AlertType` — optional alert banner

## Creating a Credit Note

```bash
# 1. Create a credit note invoice referencing the original
absuite invoicing create invoice --TenantId $TENANT_ID --InvoiceCreateDto '{
  "Title": "Credit Note for Invoice #1042",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "InvoiceType": "CreditNote",
  "InvoiceStatus": "Draft",
  "InvoiceReferences": [
    { "ReferencedInvoiceId": "<original-invoice-guid>" }
  ]
}'

# 2. Add lines reflecting the credited items
absuite invoicing create invoice-line --TenantId $TENANT_ID --InvoiceId <credit-note-guid> --InvoiceLineCreateDto '{
  "Title": "ABS Enterprise License (Credit)",
  "ItemId": "<item-guid>",
  "Quantity": -2,
  "CurrencyId": "<currency-guid>",
  "ItemPriceId": "<price-guid>"
}'

# 3. Calculate
absuite invoicing calculate invoice --InvoiceId <credit-note-guid>

# 4. Send
absuite invoicing send invoice-email --InvoiceId <credit-note-guid> --EmailDispatchRequest '{
  "Title": "Credit Note for Invoice #1042",
  "Message": "A credit note has been issued for your account.",
  "Recipients": ["billing@acme.com"]
}'
```

## Full Example: End-to-End Invoice Creation

```bash
# 1. Authenticate
absuite login --email billing@company.com

# 2. Set tenant
absuite config set --tenant-id 00000000-0000-0000-0000-000000000000

# 3. Create the invoice
absuite invoicing create invoice --InvoiceCreateDto '{
  "Title": "Invoice #1042 - Acme Corp",
  "Description": "Q2 2026 Enterprise License",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "CompanyName": "Acme Corp",
  "BillingEmail": "billing@acme.com",
  "FirstName": "John",
  "LastName": "Doe",
  "InvoiceType": "Standard",
  "InvoiceStatus": "Draft",
  "PaymentDue": "2026-07-15T00:00:00Z",
  "CostCalculationMethod": "PerLine",
  "TaxCalculationMethod": "PerLine",
  "OrderId": "<order-guid>"
}'
# Note the returned invoice ID

# 4. Add line items
absuite invoicing create invoice-line --InvoiceId <invoice-id> --InvoiceLineCreateDto '{
  "Title": "ABS Enterprise License",
  "ItemId": "<item-guid>",
  "Quantity": 10,
  "CurrencyId": "<currency-guid>",
  "ItemPriceId": "<price-guid>"
}'

absuite invoicing create invoice-line --InvoiceId <invoice-id> --InvoiceLineCreateDto '{
  "Title": "Premium Support (Annual)",
  "ItemId": "<support-item-guid>",
  "Quantity": 1,
  "CurrencyId": "<currency-guid>",
  "ItemPriceId": "<support-price-guid>"
}'

# 5. Apply taxes to each line
absuite invoicing create invoice-line-tax --InvoiceId <invoice-id> --InvoiceLineId <line-1-guid> --InvoiceLineAppliedTaxCreateDto '{
  "TaxPolicyId": "<vat-policy-guid>",
  "InvoiceId": "<invoice-id>"
}'

# 6. Add a volume discount
absuite invoicing create invoice-adjustment --InvoiceId <invoice-id> --InvoiceAdjustmentCreateDto '{
  "Description": "Volume discount (10+ seats)",
  "DiscountPercent": 10,
  "Type": "Discount",
  "CurrencyId": "<currency-guid>"
}'

# 7. Calculate totals
absuite invoicing calculate invoice --InvoiceId <invoice-id>

# 8. Update status to Sent
absuite invoicing update invoice --InvoiceId <invoice-id> --InvoiceUpdateDto '{
  "InvoiceStatus": "Sent"
}'

# 9. Send invoice email
absuite invoicing send invoice-email --InvoiceId <invoice-id> --EmailDispatchRequest '{
  "Title": "Invoice #1042 - Acme Corp",
  "Message": "Please find your invoice below. Payment due: July 15, 2026.",
  "Recipients": ["billing@acme.com"],
  "Culture": "en-US"
}'

# 10. Verify
absuite invoicing get invoice --InvoiceId <invoice-id>
```

## API Endpoints Quick Reference

| Action | REST Endpoint |
|---|---|
| Create invoice | `POST /api/v2/InvoicingService/Invoices` |
| List invoices | `GET /api/v2/InvoicingService/Invoices` |
| Count invoices | `GET /api/v2/InvoicingService/Invoices/Count` |
| List extended invoices | `GET /api/v2/InvoicingService/Invoices/Extended` |
| Count extended invoices | `GET /api/v2/InvoicingService/Invoices/Extended/Count` |
| Get invoice | `GET /api/v2/InvoicingService/Invoices/:invoiceId` |
| Get extended invoice | `GET /api/v2/InvoicingService/Invoices/:invoiceId/Extended` |
| Update invoice | `PUT /api/v2/InvoicingService/Invoices/:invoiceId` |
| Delete invoice | `DELETE /api/v2/InvoicingService/Invoices/:invoiceId` |
| Calculate invoice | `PUT /api/v2/InvoicingService/Invoices/:invoiceId/Calculate` |
| Create line | `POST /api/v2/InvoicingService/Invoices/:invoiceId/Lines` |
| List lines | `GET /api/v2/InvoicingService/Invoices/:invoiceId/Lines` |
| Count lines | `GET /api/v2/InvoicingService/Invoices/:invoiceId/Lines/Count` |
| Get line | `GET /api/v2/InvoicingService/Invoices/:invoiceId/Lines/:invoiceLineId` |
| Update line | `PUT /api/v2/InvoicingService/Invoices/:invoiceId/Lines/:invoiceLineId` |
| Delete line | `DELETE /api/v2/InvoicingService/Invoices/:invoiceId/Lines/:invoiceLineId` |
| Calculate line | `PUT /api/v2/InvoicingService/Invoices/:invoiceId/Lines/:invoiceLineId/Calculate` |
| Create line tax | `POST /api/v2/InvoicingService/Invoices/:invoiceId/Lines/:invoiceLineId/Taxes` |
| List line taxes | `GET /api/v2/InvoicingService/Invoices/:invoiceId/Lines/:invoiceLineId/Taxes` |
| Count line taxes | `GET /api/v2/InvoicingService/Invoices/:invoiceId/Lines/:invoiceLineId/Taxes/Count` |
| Update line tax | `PUT /api/v2/InvoicingService/Invoices/:invoiceId/Lines/:invoiceLineId/Taxes/:invoiceLineTaxId` |
| Delete line tax | `DELETE /api/v2/InvoicingService/Invoices/:invoiceId/Lines/:invoiceLineId/Taxes/:invoiceLineTaxId` |
| Create adjustment | `POST /api/v2/InvoicingService/Invoices/:invoiceId/Adjustments` |
| List adjustments | `GET /api/v2/InvoicingService/Invoices/:invoiceId/Adjustments` |
| Count adjustments | `GET /api/v2/InvoicingService/Invoices/:invoiceId/Adjustments/Count` |
| Get adjustment | `GET /api/v2/InvoicingService/Invoices/:invoiceId/Adjustments/:invoiceAdjustmentId` |
| Update adjustment | `PUT /api/v2/InvoicingService/Invoices/:invoiceId/Adjustments/:invoiceAdjustmentId` |
| Delete adjustment | `DELETE /api/v2/InvoicingService/Invoices/:invoiceId/Adjustments/:invoiceAdjustmentId` |
| Create reference | `POST /api/v2/InvoicingService/Invoices/:invoiceId/References` |
| List references | `GET /api/v2/InvoicingService/Invoices/:invoiceId/References` |
| Count references | `GET /api/v2/InvoicingService/Invoices/:invoiceId/References/Count` |
| Get reference | `GET /api/v2/InvoicingService/Invoices/:invoiceId/References/:invoiceReferenceId` |
| Update reference | `PUT /api/v2/InvoicingService/Invoices/:invoiceId/References/:invoiceReferenceId` |
| Delete reference | `DELETE /api/v2/InvoicingService/Invoices/:invoiceId/References/:invoiceReferenceId` |
| List payments | `GET /api/v2/InvoicingService/Invoices/:invoiceId/Payments` |
| Count payments | `GET /api/v2/InvoicingService/Invoices/:invoiceId/Payments/Count` |
| Preview email | `POST /api/v2/InvoicingService/Invoices/:invoiceId/Emails/Preview` |
| Send email | `POST /api/v2/InvoicingService/Invoices/:invoiceId/Emails/Send` |
| Aggregate totals | `GET /api/v2/InvoicingService/Invoices/Aggregate/Totals` |
| Aggregate taxes | `GET /api/v2/InvoicingService/Invoices/Aggregate/Taxes` |
| Aggregate tax bases | `GET /api/v2/InvoicingService/Invoices/Aggregate/TaxBases` |
| Aggregate discounts | `GET /api/v2/InvoicingService/Invoices/Aggregate/Discounts` |
| Aggregate surcharges | `GET /api/v2/InvoicingService/Invoices/Aggregate/GlobalSurcharges` |
