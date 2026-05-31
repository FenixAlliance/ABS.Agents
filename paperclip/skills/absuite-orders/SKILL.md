---
name: absuite-orders
description: >
  Create, read, update, delete, and calculate orders and order lines in the
  Alliance Business Suite (ABS) Orders Service using the `absuite` CLI. Covers
  direct order creation, cart-to-order submission, line items, totals calculation,
  and transactional email notifications. Requires an authenticated CLI session
  (use the `absuite-login` skill to authenticate first).
---

# Alliance Business Suite — Orders Skill

Manage orders through the `absuite` CLI's `orders` service. All order operations are tenant-scoped and require authentication.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant** — all order operations require a tenant. Either set a default:
   ```bash
   absuite config set --tenant-id <tenant-guid>
   ```
   Or pass `--TenantId <guid>` on each call.
3. **Discover commands** — run `absuite orders list-commands` to see all order commands, or use `--help` on any command for full parameter and output schemas.

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
# List all order commands
absuite orders list-commands

# Get detailed help for any command
absuite orders create --help
```

## Key Concepts

- **Order** — a billing record with header info (customer, currency, totals, status) and one or more line items.
- **Order Line** — an individual item/product within an order, with its own quantity, pricing, and tax info.
- **Calculate** — triggers server-side recalculation of totals for an order or order line (taxes, discounts, surcharges, shipping).
- **Submit Cart** — converts an existing shopping cart into a finalized order.
- **OrderStatus** — tracks order lifecycle (e.g., `"Open"`, `"Closed"`, `"Cancelled"`).

## Workflow: Creating an Order

### Option A — Direct Order Creation

1. **Create the order header** with customer and currency info
2. **Add order lines** for each item
3. **Calculate totals** to let the server compute taxes, discounts, and grand total
4. **Verify** the order

### Option B — Cart Submission

Submit an existing cart (populated via the `cart` service) to create an order automatically:

```bash
absuite orders submit cart --CartId <cart-guid>
```

This returns the created `OrderDto` with all lines transferred from the cart.

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/SubmitCart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cartId": "<cart-guid>"}'
```

## CRUD Operations

### Create Order

```bash
absuite orders create --TenantId $TENANT_ID --OrderCreateDto '{
  "Title": "Order for Acme Corp",
  "Description": "Q2 2026 software licenses",
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
  "OrderStatus": "Open",
  "CostCalculationMethod": "PerLine",
  "TaxCalculationMethod": "PerLine"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Order for Acme Corp",
    "description": "Q2 2026 software licenses",
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
    "orderStatus": "Open",
    "costCalculationMethod": "PerLine",
    "taxCalculationMethod": "PerLine"
  }'
```

**Required fields:**
- `Title` — order title/description
- `CurrencyId` — GUID of the billing currency

**Recommended fields:**
- `IndividualId` or `OrganizationId` — link to a CRM contact or organization
- `BillingEmail` — for sending invoice/order emails
- Billing address fields — `FirstName`, `LastName`, `AddressLine1`, `CountryId`, etc.
- `OrderStatus` — initial status (e.g., `"Open"`)
- `CostCalculationMethod` / `TaxCalculationMethod` — `"PerLine"` or `"PerOrder"`

**Optional fields:**
- `PriceListId` — link to a price list for automatic pricing
- `PaymentTermId` — payment terms
- `QuoteId` — link to a quote this order originated from
- `CartId` — link to a cart
- `WalletId` — wallet for payment
- `ShippingMethodId`, `ShippingLocationId`, `BillingLocationId` — shipping/billing locations
- `FreightTerms` — freight terms
- `CustomerNotes` — customer-visible notes
- `EffectiveFrom`, `EffectiveTo` — validity window
- `OrderLines` — inline array of order lines (alternative to adding lines separately)

### Create Order with Inline Lines

You can embed order lines directly in the create call:

```bash
absuite orders create --TenantId $TENANT_ID --OrderCreateDto '{
  "Title": "Bundled Order",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "OrderStatus": "Open",
  "CostCalculationMethod": "PerLine",
  "TaxCalculationMethod": "PerLine",
  "OrderLines": [
    {
      "ItemId": "<item-guid-1>",
      "ItemTitle": "ABS Enterprise License",
      "Quantity": 5,
      "CurrencyId": "<currency-guid>",
      "ItemPriceId": "<price-guid-1>"
    },
    {
      "ItemId": "<item-guid-2>",
      "ItemTitle": "Premium Support (Annual)",
      "Quantity": 1,
      "CurrencyId": "<currency-guid>",
      "ItemPriceId": "<price-guid-2>"
    }
  ]
}'
```

No separate REST — same POST endpoint, just include `orderLines` array in body.

### List Orders

```bash
absuite orders list --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Extended Orders (with related data)

```bash
absuite orders list extended --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Orders

```bash
absuite orders count --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Order by ID

```bash
absuite orders get --TenantId $TENANT_ID --OrderId <order-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Order

```bash
absuite orders update --TenantId $TENANT_ID --OrderId <order-guid> --OrderUpdateDto '{
  "Title": "Updated Order Title",
  "OrderStatus": "Closed",
  "Closed": true,
  "Description": "Fulfilled and closed."
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Order Title",
    "orderStatus": "Closed",
    "closed": true,
    "description": "Fulfilled and closed."
  }'
```

### Delete Order

```bash
absuite orders delete --TenantId $TENANT_ID --OrderId <order-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Order Lines

### Add a Line to an Order

```bash
absuite orders create line --TenantId $TENANT_ID --OrderId <order-guid> --OrderLineCreateDto '{
  "ItemId": "<catalog-item-guid>",
  "ItemTitle": "ABS Enterprise License",
  "ItemShortDescription": "Annual enterprise license",
  "Quantity": 10,
  "CurrencyId": "<currency-guid>",
  "ItemPriceId": "<price-guid>",
  "Description": "10x enterprise seats"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "<catalog-item-guid>",
    "itemTitle": "ABS Enterprise License",
    "itemShortDescription": "Annual enterprise license",
    "quantity": 10,
    "currencyId": "<currency-guid>",
    "itemPriceId": "<price-guid>",
    "description": "10x enterprise seats"
  }'
```

**Key line fields:**
- `ItemId` — catalog item reference
- `ItemTitle` — display name
- `Quantity` — number of units
- `CurrencyId` — line currency
- `ItemPriceId` or `PriceListItemId` — pricing reference
- `UnitId`, `UnitGroupId` — unit of measure
- `TaxCalculationMethod`, `CostCalculationMethod` — per-line overrides
- Custom data fields: `Data1`–`Data9` with matching `DataLabel` fields for arbitrary metadata

### List Order Lines

```bash
absuite orders list lines --TenantId $TENANT_ID --OrderId <order-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Order Lines

```bash
absuite orders count lines --TenantId $TENANT_ID --OrderId <order-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID/Lines/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Order Line by ID

```bash
absuite orders get line --TenantId $TENANT_ID --OrderId <order-guid> --OrderLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID/Lines/$ORDER_LINE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Order Line

```bash
absuite orders update line --TenantId $TENANT_ID --OrderId <order-guid> --OrderLineId <line-guid> --OrderLineUpdateDto '{
  "Quantity": 15,
  "Description": "Increased to 15 seats"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID/Lines/$ORDER_LINE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 15,
    "description": "Increased to 15 seats"
  }'
```

### Delete Order Line

```bash
absuite orders delete line --TenantId $TENANT_ID --OrderId <order-guid> --OrderLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID/Lines/$ORDER_LINE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Calculations

Always recalculate after adding/modifying lines so the server computes accurate totals.

### Calculate Order Totals

```bash
absuite orders calculate --TenantId $TENANT_ID --OrderId <order-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID/Calculate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

This recalculates: `TotalDetail`, `TotalTaxes`, `TotalDiscounts`, `TotalSurcharges`, `TotalShippingCost`, `TotalShippingTax`, `TotalWithheldTax`, `TotalGlobalDiscounts`, `TotalGlobalSurcharges`, `Total`, and all USD equivalents.

### Calculate a Single Line

```bash
absuite orders calculate line --TenantId $TENANT_ID --OrderId <order-guid> --OrderLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID/Lines/$ORDER_LINE_ID/Calculate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Cart Submission

Convert a shopping cart into an order:

```bash
absuite orders submit cart --CartId <cart-guid>
```

Returns the created `OrderDto`. The cart's items become order lines automatically.

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/SubmitCart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cartId": "<cart-guid>"}'
```

## Email Notifications

### Send Order Email

```bash
absuite orders send email --TenantId $TENANT_ID --OrderId <order-guid> --EmailDispatchRequest '{
  "Title": "Your Order Confirmation",
  "Message": "Thank you for your order. Please find the details below.",
  "Recipients": ["customer@example.com"],
  "Culture": "en-US"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Order Confirmation",
    "message": "Thank you for your order. Please find the details below.",
    "recipients": ["customer@example.com"],
    "culture": "en-US"
  }'
```

### Preview Order Email

```bash
absuite orders preview email-template --TenantId $TENANT_ID --OrderId <order-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/OrdersService/Orders/$ORDER_ID/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Full Example: End-to-End Order Creation

```bash
# 1. Authenticate
absuite login --email sales@company.com

# 2. Set tenant
absuite config set --tenant-id 00000000-0000-0000-0000-000000000000

# 3. Create the order
absuite orders create --OrderCreateDto '{
  "Title": "Enterprise License Order - Acme Corp",
  "CurrencyId": "<currency-guid>",
  "IndividualId": "<contact-guid>",
  "CompanyName": "Acme Corp",
  "BillingEmail": "billing@acme.com",
  "FirstName": "John",
  "LastName": "Doe",
  "OrderStatus": "Open",
  "CostCalculationMethod": "PerLine",
  "TaxCalculationMethod": "PerLine"
}'
# Note the returned order ID

# 4. Add line items
absuite orders create line --OrderId <order-id> --OrderLineCreateDto '{
  "ItemId": "<item-guid>",
  "ItemTitle": "ABS Enterprise License",
  "Quantity": 5,
  "CurrencyId": "<currency-guid>",
  "ItemPriceId": "<price-guid>"
}'

absuite orders create line --OrderId <order-id> --OrderLineCreateDto '{
  "ItemId": "<support-item-guid>",
  "ItemTitle": "Premium Support (Annual)",
  "Quantity": 1,
  "CurrencyId": "<currency-guid>",
  "ItemPriceId": "<support-price-guid>"
}'

# 5. Recalculate totals
absuite orders calculate --OrderId <order-id>

# 6. Send confirmation email
absuite orders send email --OrderId <order-id> --EmailDispatchRequest '{
  "Title": "Order Confirmation - Acme Corp",
  "Message": "Your order has been received and is being processed.",
  "Recipients": ["billing@acme.com"],
  "Culture": "en-US"
}'

# 7. Verify
absuite orders get --OrderId <order-id>
```

## API Endpoints Quick Reference

| Action | REST Endpoint |
|---|---|
| Create order | `POST /api/v2/OrdersService/Orders` |
| List orders | `GET /api/v2/OrdersService/Orders` |
| Count orders | `GET /api/v2/OrdersService/Orders/Count` |
| Extended orders | `GET /api/v2/OrdersService/Orders/Extended` |
| Get order | `GET /api/v2/OrdersService/Orders/:orderId` |
| Update order | `PUT /api/v2/OrdersService/Orders/:orderId` |
| Delete order | `DELETE /api/v2/OrdersService/Orders/:orderId` |
| Calculate order | `PUT /api/v2/OrdersService/Orders/:orderId/Calculate` |
| Submit cart | `POST /api/v2/OrdersService/Orders/SubmitCart` |
| Create line | `POST /api/v2/OrdersService/Orders/:orderId/Lines` |
| List lines | `GET /api/v2/OrdersService/Orders/:orderId/Lines` |
| Count lines | `GET /api/v2/OrdersService/Orders/:orderId/Lines/Count` |
| Get line | `GET /api/v2/OrdersService/Orders/:orderId/Lines/:orderLineId` |
| Update line | `PUT /api/v2/OrdersService/Orders/:orderId/Lines/:orderLineId` |
| Delete line | `DELETE /api/v2/OrdersService/Orders/:orderId/Lines/:orderLineId` |
| Calculate line | `PUT /api/v2/OrdersService/Orders/:orderId/Lines/:orderLineId/Calculate` |
| Preview email | `POST /api/v2/OrdersService/Orders/:orderId/Emails/Preview` |
| Send email | `POST /api/v2/OrdersService/Orders/:orderId/Emails/Send` |
