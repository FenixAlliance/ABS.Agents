---
name: absuite-orders-cli
description: >
  Create, read, update, delete, and calculate orders and order lines in the
  Alliance Business Suite (ABS) Orders Service using the `absuite` CLI. Covers
  direct order creation, cart-to-order submission, line items, totals calculation,
  and transactional email via list/count/get/create/update/delete commands.
  Requires an authenticated CLI session (see absuite-login-cli). For atomic PATCH
  updates or raw HTTP, use the absuite-orders (REST) skill.
---

# Alliance Business Suite — Orders (CLI)

Manage orders and order lines through the `absuite` CLI's **`orders`** service. Every
order operation (except cart submission) is tenant-scoped and requires an authenticated
session. For shared CLI conventions, see `absuite-cli`. The CLI does **not** support
PATCH — for atomic JSON-Patch partial updates use the REST skill `absuite-orders`.

## Prerequisites

1. **Authenticate first** with `absuite login` (see `absuite-login-cli`).
2. **Set your tenant** — all order commands except `submit cart` require a tenant.
   Either set a default once:
   ```
   absuite config set --tenant-id <tenant-guid>
   ```
   or pass `--TenantId <tenant-guid>` on each call.
3. **Discover commands** — list everything the service exposes and inspect any command:
   ```
   absuite orders list-commands
   absuite orders create --help
   ```

## Command structure

```
absuite orders <verb> [<entity>] --Param value
```

- Verbs available: **list, count, get, create, update, delete** plus the service
  actions **calculate**, **submit cart**, **send email**, **preview email-template**.
- The canonical function-name form also works, mirroring the PowerShell SDK cmdlets
  (e.g. `absuite orders Get-Orders`, `absuite orders New-Order`,
  `absuite orders Measure-Order`, `absuite orders Invoke-DeleteOrder`,
  `absuite orders Submit-Cart`). Calculate is `Measure-*`; delete is `Invoke-Delete*`.
- JSON DTO parameters are passed as a single-quoted JSON string with the **same field
  names** as the REST API (e.g. `--OrderCreateDto '{...}'`).

### Enum values (authoritative — from the OpenAPI spec)

- **`OrderStatus`**: `New | Processing | Accepted | Declined | Shipped | Delivered | OnHold | Failed | Fulfilled | Cancelled`
- **`QuoteStatus`** (on create): `Draft | New | Accepted | Declined | Expired`
- **`FreightTerms`**: `FOB | NoCharge`
- **`CostCalculationMethod`**: `Automatic | Custom`
- **`TaxCalculationMethod`**: `Included | Excluded`
- **`AlertType`** (email dispatch): `None | Info | Error | Warning | Success | Action | Alert`

## Orders

### List orders

```
absuite orders list --TenantId <tenant-guid>
```

### List extended orders (with related data)

```
absuite orders list extended --TenantId <tenant-guid>
```

### Count orders

```
absuite orders count --TenantId <tenant-guid>
```

### Get an order by ID

```
absuite orders get --TenantId <tenant-guid> --OrderId <order-guid>
```

### Create an order

```
absuite orders create --TenantId <tenant-guid> --OrderCreateDto '{
  "Title": "Order for a customer",
  "Description": "Q2 software licenses",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "OrganizationId": "<organization-guid>",
  "FirstName": "<first-name>",
  "LastName": "<last-name>",
  "CompanyName": "<company-name>",
  "BillingEmail": "<billing-email>",
  "AddressLine1": "<address-line-1>",
  "PostalCode": "<postal-code>",
  "CountryId": "<country-guid>",
  "StateId": "<state-guid>",
  "CityId": "<city-guid>",
  "OrderStatus": "New",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded"
}'
```

**`OrderCreateDto`** fields are all optional. Beyond those above the spec also accepts:
`PriceListId`, `PaymentTermId`, `ForexRate`, `CartId`, `QuoteId`, `WalletId`,
`ParentOrderId`, `ShippingMethodId`, `BillingLocationId`, `ShippingLocationId`,
`CustomerNotes`, `QuoteStatus`, `FreightTerms`, `ReceiverTenantId`,
`QualifiedIdentifier`, `EffectiveFrom`, `EffectiveTo`, the full `Total*` /
`Total*CurrencyId` / `Total*InUsd` set, and `OrderLines` (an inline array of order lines).

### Create an order with inline lines

```
absuite orders create --TenantId <tenant-guid> --OrderCreateDto '{
  "Title": "Bundled order",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "OrderStatus": "New",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded",
  "OrderLines": [
    { "ItemId": "<item-guid-1>", "ItemTitle": "<item-title-1>", "Quantity": 5, "CurrencyId": "<currency-guid>", "ItemPriceId": "<price-guid-1>" },
    { "ItemId": "<item-guid-2>", "ItemTitle": "<item-title-2>", "Quantity": 1, "CurrencyId": "<currency-guid>", "ItemPriceId": "<price-guid-2>" }
  ]
}'
```

### Update an order

```
absuite orders update --TenantId <tenant-guid> --OrderId <order-guid> --OrderUpdateDto '{
  "Title": "Updated order title",
  "Closed": true,
  "Description": "Fulfilled and closed.",
  "CurrencyId": "<currency-guid>",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded"
}'
```

**`OrderUpdateDto`** differs from the create DTO: it adds `UserId`, `BillingLocationId`,
`ShippingLocationId`, `ShippingMethodId`; `QuoteStatus` is a free string; and it has
**no** `OrderStatus`, `OrderLines`, `QuoteId`, `WalletId`, `ParentOrderId`,
`CustomerNotes`, `FreightTerms`, or `QualifiedIdentifier`. Changing `OrderStatus`
requires a PATCH — use the `absuite-orders` REST skill for that.

### Delete an order

```
absuite orders delete --TenantId <tenant-guid> --OrderId <order-guid>
```

### Calculate order totals

```
absuite orders calculate --TenantId <tenant-guid> --OrderId <order-guid>
```
Triggers server-side recalculation of all totals and USD equivalents. No DTO body.

## Order Lines

### List order lines

```
absuite orders list lines --TenantId <tenant-guid> --OrderId <order-guid>
```
Optional `--ItemId <item-guid>` filters lines to a single catalog item.

### Count order lines

```
absuite orders count lines --TenantId <tenant-guid> --OrderId <order-guid>
```

### Get an order line by ID

```
absuite orders get line --TenantId <tenant-guid> --OrderId <order-guid> --OrderLineId <order-line-guid>
```

### Create an order line

```
absuite orders create line --TenantId <tenant-guid> --OrderId <order-guid> --OrderLineCreateDto '{
  "ItemId": "<catalog-item-guid>",
  "ItemTitle": "<item-title>",
  "ItemShortDescription": "<short-description>",
  "Quantity": 10,
  "CurrencyId": "<currency-guid>",
  "ItemPriceId": "<price-guid>",
  "Description": "<line-description>"
}'
```

**`OrderLineCreateDto`** key fields: `ItemId`, `ItemTitle`, `ItemShortDescription`,
`ItemPrimaryImageUrl`, `Quantity`, `CurrencyId`, `ItemPriceId` or `PriceListItemId`,
`UnitId`, `UnitGroupId`, `Free`/`FreeReason`/`FreeReasonCode`, `CostCalculationMethod`,
`TaxCalculationMethod`. Policy refs: `ShippingPolicyId`, `ReturnPolicyId`,
`RefundPolicyId`, `WarrantyPolicyId`, `ShipmentPolicyId`, `ShippingLocationId`,
`LocationId`. Custom metadata: `Data` + `DataLabel`, and `Data1`–`Data9` each with a
matching `Data{N}Label`. Plus the full `Total*` / `Total*CurrencyId` / `Total*InUsd`
and `CustomGlobal*` sets, `ForexRate`, `ForexRatesSnapshot`, `QuoteItemRecordId`,
`ParentBillingItemRecordId`.

### Update an order line

```
absuite orders update line --TenantId <tenant-guid> --OrderId <order-guid> --OrderLineId <order-line-guid> --OrderLineUpdateDto '{
  "Quantity": 15,
  "Description": "Increased quantity to 15",
  "CurrencyId": "<currency-guid>",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded"
}'
```
**`OrderLineUpdateDto`** adds `UserId`; otherwise mirrors the create line DTO.

### Delete an order line

```
absuite orders delete line --TenantId <tenant-guid> --OrderId <order-guid> --OrderLineId <order-line-guid>
```

### Calculate a single line's totals

```
absuite orders calculate line --TenantId <tenant-guid> --OrderId <order-guid> --OrderLineId <order-line-guid>
```

## Cart Submission

Convert a shopping cart into an order for the authenticated user. This command is
**user-scoped — it takes only `--CartId`, no `--TenantId`**:

```
absuite orders submit cart --CartId <cart-guid>
```
Returns the created order; the cart's items become order lines automatically.

## Email Notifications

Both email commands require the caller to hold the `send_email` permission.

### Send an order email

```
absuite orders send email --TenantId <tenant-guid> --OrderId <order-guid> --EmailDispatchRequest '{
  "Title": "Your order confirmation",
  "Message": "Thank you for your order.",
  "Culture": "en-US",
  "UiCulture": "en-US",
  "Recipients": ["<recipient-email>"]
}'
```

**`EmailDispatchRequest`** required fields: `Title`, `Message`, `Culture`, `UiCulture`,
`Recipients` (array). Optional: `ButtonLink`, `ButtonText`, `AlertMessage`, `AlertType`
(`None|Info|Error|Warning|Success|Action|Alert`), `ContactIds`, `TenantIds`, `UserIds`,
`TemplateUrl`, `EmailTemplateId`.

### Preview an order email template

```
absuite orders preview email-template --TenantId <tenant-guid> --OrderId <order-guid> --EmailDispatchRequest '{
  "Title": "Your order confirmation",
  "Message": "Thank you for your order.",
  "Culture": "en-US",
  "UiCulture": "en-US",
  "Recipients": ["<recipient-email>"]
}'
```
Same `EmailDispatchRequest` body; returns the rendered preview instead of sending.

## End-to-End Workflow

```
# 1. Authenticate
absuite login --email <user-email>

# 2. Set the default tenant
absuite config set --tenant-id <tenant-guid>

# 3. Create the order header (note the returned order ID)
absuite orders create --OrderCreateDto '{
  "Title": "Enterprise license order",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "OrderStatus": "New",
  "CostCalculationMethod": "Automatic",
  "TaxCalculationMethod": "Excluded"
}'

# 4. Add line items
absuite orders create line --OrderId <order-guid> --OrderLineCreateDto '{
  "ItemId": "<item-guid>",
  "ItemTitle": "<item-title>",
  "Quantity": 5,
  "CurrencyId": "<currency-guid>",
  "ItemPriceId": "<price-guid>"
}'

# 5. Recalculate totals
absuite orders calculate --OrderId <order-guid>

# 6. Send the confirmation email
absuite orders send email --OrderId <order-guid> --EmailDispatchRequest '{
  "Title": "Order confirmation",
  "Message": "Your order has been received and is being processed.",
  "Culture": "en-US",
  "UiCulture": "en-US",
  "Recipients": ["<recipient-email>"]
}'

# 7. Verify
absuite orders get --OrderId <order-guid>
```

> To change an order's `OrderStatus` (lifecycle transitions like Processing, Shipped,
> Delivered, Fulfilled, Cancelled), use a PATCH via the REST skill `absuite-orders` —
> the CLI's `update` (PUT) DTO does not include `OrderStatus`.

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List orders | `absuite orders list --TenantId <guid>` |
| Count orders | `absuite orders count --TenantId <guid>` |
| Extended orders | `absuite orders list extended --TenantId <guid>` |
| Get order | `absuite orders get --TenantId <guid> --OrderId <guid>` |
| Create order | `absuite orders create --TenantId <guid> --OrderCreateDto '{...}'` |
| Update order | `absuite orders update --TenantId <guid> --OrderId <guid> --OrderUpdateDto '{...}'` |
| Delete order | `absuite orders delete --TenantId <guid> --OrderId <guid>` |
| Calculate order | `absuite orders calculate --TenantId <guid> --OrderId <guid>` |
| Submit cart | `absuite orders submit cart --CartId <guid>` |
| List lines | `absuite orders list lines --TenantId <guid> --OrderId <guid>` |
| Count lines | `absuite orders count lines --TenantId <guid> --OrderId <guid>` |
| Get line | `absuite orders get line --TenantId <guid> --OrderId <guid> --OrderLineId <guid>` |
| Create line | `absuite orders create line --TenantId <guid> --OrderId <guid> --OrderLineCreateDto '{...}'` |
| Update line | `absuite orders update line --TenantId <guid> --OrderId <guid> --OrderLineId <guid> --OrderLineUpdateDto '{...}'` |
| Delete line | `absuite orders delete line --TenantId <guid> --OrderId <guid> --OrderLineId <guid>` |
| Calculate line | `absuite orders calculate line --TenantId <guid> --OrderId <guid> --OrderLineId <guid>` |
| Send email | `absuite orders send email --TenantId <guid> --OrderId <guid> --EmailDispatchRequest '{...}'` |
| Preview email | `absuite orders preview email-template --TenantId <guid> --OrderId <guid> --EmailDispatchRequest '{...}'` |

> `submit cart` is the only command **without** `--TenantId` (it is user-scoped and takes
> only `--CartId`). For atomic partial updates (JSON Patch / lifecycle status changes),
> use the REST skill `absuite-orders`. The `absuite` CLI does not support PATCH.
