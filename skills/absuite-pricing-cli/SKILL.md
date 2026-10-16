---
name: absuite-pricing-cli
description: >
  Manage pricing in the Alliance Business Suite (ABS) Pricing Service using the `absuite`
  CLI. Covers price lists and their price entries, discount lists and their discount
  entries, pricing rules, rounding policies, and item price calculations — via
  list/count/get/create/update/delete commands and the price-calculation reads. Requires
  an authenticated CLI session (see absuite-login-cli). For atomic PATCH updates or raw
  HTTP, use the absuite-pricing (REST) skill.
---

# Alliance Business Suite — Pricing Skill (CLI)

Manage pricing through the `absuite` CLI's `pricing` service. The price-list, discount-list,
pricing-rule, and rounding-policy commands are tenant-scoped and require an authenticated
session; the price-calculation reads (`get price`, `get final-price`, …) are not tenant-bound.
The CLI does not support PATCH (JSON Patch) — for partial atomic updates use the
`absuite-pricing` REST skill.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-pricing` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-pricing` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general
   CLI usage and configuration, see `absuite-cli`.
2. **Set your tenant** — the price-list / discount-list / pricing-rule / rounding-policy
   commands require a tenant. Either set a default:
   ```powershell
   absuite config set --tenant-id <tenant-guid>
   ```
   …and reference it as `$TENANT_ID`, or pass `--TenantId <tenant-guid>` on each call.
   (The price-calculation reads do **not** take a tenant — see that section.)
3. **Discover commands:**
   ```powershell
   absuite pricing list-commands
   absuite pricing create price-list --help
   ```

## Command Structure

```
absuite pricing <verb> <entity> --Param value
```

- **Verbs:** `list`, `count`, `get`, `create`, `update`, `delete` (plus the price-calculation
  `get` reads). There is **no `search`** verb in the Pricing Service.
- **Entities:** `price-list`, `price-list-price` (price entry), `discount-list`,
  `discount-list-entry` (discount entry), `pricing-rule`, `rounding-policy`, and the
  calculation reads (`price`, `final-price`, `total-savings`, `total-taxes`).
- The canonical PowerShell function-name form also works as the command. The function names
  map to PowerShell-approved verbs: create → `New-`, list/count/get → `Get-`, update →
  `Update-`, delete → `Invoke-Delete…`. For example,
  `absuite pricing New-PriceListAsync --TenantId <tenant-guid> --PriceListCreateDto '{...}'`
  is equivalent to `absuite pricing create price-list ...`.
- **JSON DTO params** are passed as a single-quoted JSON string (`--<Dto> '{...}'`) using the
  **same PascalCase field names** as the REST API.

## Key Concepts

- **Price List** — a named, dated set of item prices, optionally scoped to a context, currency, and unit/unit-group.
- **Price (price-list entry / `ItemPrice`)** — the price of a single item inside a price list.
- **Discount List** — a named set of quantity-banded discounts (amount- or percentage-based).
- **Discount (discount-list entry)** — a single banded discount for an item.
- **Pricing Rule** — a free/reduce, geo-scoped, time-windowed rule carrying a `value` and/or `percentage`.
- **Rounding Policy** — a policy controlling price rounding; shares the pricing-rule shape.
- **`PriceList.Context`** — `Sales` | `Purchase` | `Cost`.
- **`DiscountList.DiscountListType`** — `Amount` | `Percentage`.
- **Percentage convention** — every `Percent` / `Percentage` field is a **whole number**, not a
  fraction: `19.5` means 19.5%, `10` means 10%. Never send `0.10` for 10%.

## Price Lists

### List Price Lists

```powershell
absuite pricing list price-lists --TenantId $TENANT_ID
```

### Count Price Lists

```powershell
absuite pricing count price-lists --TenantId $TENANT_ID
```

### Get Price List by ID

```powershell
absuite pricing get price-list --TenantId $TENANT_ID --PriceListId <price-list-guid>
```

### Create Price List

```powershell
absuite pricing create price-list --TenantId $TENANT_ID --PriceListCreateDto '{
  "Name": "Retail Price List 2026",
  "Description": "Standard retail pricing",
  "Context": "Sales",
  "StartDate": "2026-01-01T00:00:00Z",
  "EndDate": "2026-12-31T23:59:59Z",
  "CurrencyId": "<currency-guid>",
  "UnitId": "<unit-guid>",
  "UnitGroupId": "<unit-group-guid>",
  "PartnerVisible": false,
  "UnitOfMeasureDependant": false
}'
```

**`PriceListCreateDto` fields:** `Id`, `Timestamp`, `Name` (**required**), `Description`,
`Context` (`Sales`|`Purchase`|`Cost`), `StartDate`, `EndDate`, `CurrencyId`, `UnitId`,
`UnitGroupId`, `PartnerVisible` (bool), `UnitOfMeasureDependant` (bool).

### Update Price List

```powershell
absuite pricing update price-list --TenantId $TENANT_ID --PriceListId <price-list-guid> --PriceListUpdateDto '{
  "Name": "Retail Price List 2026 (revised)",
  "Description": "Updated retail pricing",
  "Context": "Sales",
  "CurrencyId": "<currency-guid>",
  "PartnerVisible": true
}'
```

**`PriceListUpdateDto` fields:** `Name` (**required**), `Description`,
`Context` (`Sales`|`Purchase`|`Cost`), `StartDate`, `EndDate`, `CurrencyId`, `UnitId`,
`UnitGroupId`, `PartnerVisible` (bool), `UnitOfMeasureDependant` (bool).

### Delete Price List

```powershell
absuite pricing delete price-list --TenantId $TENANT_ID --PriceListId <price-list-guid>
```

## Price List Entries (Prices)

Each entry sets the price of one item within a price list.

### List Entries in a Price List

```powershell
# Optionally filter by item with --ItemId <item-guid>
absuite pricing list price-list-prices --TenantId $TENANT_ID --PriceListId <price-list-guid>
```

### Get Entry by ID

```powershell
absuite pricing get price-list-price --TenantId $TENANT_ID --PriceListId <price-list-guid> --PriceId <price-guid>
```

### Create Entry

```powershell
absuite pricing create price-list-price --TenantId $TENANT_ID --PriceListId <price-list-guid> --ItemPriceCreateDto '{
  "ItemId": "<item-guid>",
  "PriceListId": "<price-list-guid>",
  "UnitId": "<unit-guid>",
  "CurrencyId": "<currency-guid>",
  "UnitGroupId": "<unit-group-guid>",
  "DiscountListId": "<discount-list-guid>",
  "RoundingPolicyId": "<rounding-policy-guid>",
  "Price": 49.99,
  "Percent": 0
}'
```

**`ItemPriceCreateDto` fields:** `Id`, `Timestamp`, `ItemId` (**required**), `UnitId`,
`CurrencyId`, `PriceListId`, `UnitGroupId`, `DiscountListId`, `RoundingPolicyId`,
`Price` (number), `Percent` (number, whole-number percentage).

### Update Entry

```powershell
absuite pricing update price-list-price --TenantId $TENANT_ID --PriceListId <price-list-guid> --PriceId <price-guid> --ItemPriceUpdateDto '{
  "Price": 59.99,
  "ItemId": "<item-guid>",
  "CurrencyId": "<currency-guid>",
  "Percent": 0
}'
```

**`ItemPriceUpdateDto` fields:** `Price` (number), `ItemId`, `UnitId`, `Percent` (number,
whole-number percentage), `UnitGroupId`, `CurrencyId`, `DiscountListId`, `RoundingPolicyId`.

### Delete Entry

```powershell
absuite pricing delete price-list-price --TenantId $TENANT_ID --PriceListId <price-list-guid> --PriceId <price-guid>
```

## Discount Lists

### List Discount Lists

```powershell
absuite pricing list discount-lists --TenantId $TENANT_ID
```

### Count Discount Lists

```powershell
absuite pricing count discount-lists --TenantId $TENANT_ID
```

### Get Discount List by ID

```powershell
absuite pricing get discount-list --TenantId $TENANT_ID --DiscountListId <discount-list-guid>
```

### Create Discount List

```powershell
absuite pricing create discount-list --TenantId $TENANT_ID --DiscountListCreateDto '{
  "Name": "VIP Discounts",
  "DiscountListType": "Percentage",
  "CurrencyId": "<currency-guid>"
}'
```

**`DiscountListCreateDto` fields:** `Id`, `Timestamp`, `Name`,
`DiscountListType` (`Amount`|`Percentage`), `CurrencyId`.

### Update Discount List

```powershell
absuite pricing update discount-list --TenantId $TENANT_ID --DiscountListId <discount-list-guid> --DiscountListUpdateDto '{
  "Name": "VIP Discounts (revised)",
  "DiscountListType": "Percentage",
  "CurrencyId": "<currency-guid>"
}'
```

**`DiscountListUpdateDto` fields:** `Name`, `DiscountListType` (`Amount`|`Percentage`),
`CurrencyId`.

### Delete Discount List

```powershell
absuite pricing delete discount-list --TenantId $TENANT_ID --DiscountListId <discount-list-guid>
```

## Discount List Entries (Discounts)

Each entry is one quantity-banded discount for an item within a discount list.

### List Entries in a Discount List

```powershell
absuite pricing list discount-list-entries --TenantId $TENANT_ID --DiscountListId <discount-list-guid>
```

### Count Entries in a Discount List

```powershell
absuite pricing count discount-list-entries --TenantId $TENANT_ID --DiscountListId <discount-list-guid>
```

### Get Entry by ID

```powershell
absuite pricing get discount-list-entry --TenantId $TENANT_ID --DiscountListId <discount-list-guid> --DiscountListEntryId <discount-guid>
```

### Create Entry

```powershell
absuite pricing create discount-list-entry --TenantId $TENANT_ID --DiscountListId <discount-list-guid> --DiscountCreateDto '{
  "Description": "Volume discount, 10+ units",
  "BeginQuantity": 10,
  "EndQuantity": 99,
  "Percent": 15.0,
  "Value": 0,
  "ItemId": "<item-guid>",
  "DiscountListId": "<discount-list-guid>"
}'
```

**`DiscountCreateDto` fields:** `Id`, `Timestamp`, `Description`, `BeginQuantity` (number),
`EndQuantity` (number), `Percent` (number, whole-number percentage — `15.0` = 15%),
`Value` (number), `ItemId`, `DiscountListId`.

### Update Entry

```powershell
absuite pricing update discount-list-entry --TenantId $TENANT_ID --DiscountListId <discount-list-guid> --DiscountListEntryId <discount-guid> --DiscountUpdateDto '{
  "Description": "Volume discount, 10+ units",
  "BeginQuantity": 10,
  "EndQuantity": 99,
  "Percent": 20.0,
  "Value": 0,
  "ItemId": "<item-guid>",
  "DiscountListId": "<discount-list-guid>"
}'
```

**`DiscountUpdateDto` fields:** `Description`, `BeginQuantity` (number), `EndQuantity` (number),
`Percent` (number, whole-number percentage), `Value` (number), `ItemId`, `DiscountListId`.

### Delete Entry

```powershell
absuite pricing delete discount-list-entry --TenantId $TENANT_ID --DiscountListId <discount-list-guid> --DiscountListEntryId <discount-guid>
```

## Pricing Rules

### List Pricing Rules

```powershell
absuite pricing list pricing-rules --TenantId $TENANT_ID
```

### Count Pricing Rules

```powershell
absuite pricing count pricing-rules --TenantId $TENANT_ID
```

### Get Pricing Rule by ID

```powershell
absuite pricing get pricing-rule --TenantId $TENANT_ID --PricingRuleId <pricing-rule-guid>
```

### Create Pricing Rule

```powershell
absuite pricing create pricing-rule --TenantId $TENANT_ID --PricingRuleCreateDto '{
  "Code": "SUMMER10",
  "Title": "Summer Sale",
  "Description": "10% off during the summer window",
  "IsFree": false,
  "Reduce": true,
  "IsEnabled": true,
  "IsDefault": false,
  "AllowInternational": true,
  "Value": 0,
  "Percentage": 10.0,
  "CurrencyId": "<currency-guid>",
  "CountryId": "<country-guid>"
}'
```

**`PricingRuleCreateDto` fields:** `Id`, `Timestamp`, `Code`, `Title`, `Description`,
`IsFree` (bool), `Reduce` (bool), `IsEnabled` (bool), `IsDefault` (bool),
`AllowInternational` (bool), `Hours` (int), `Days` (int), `Weeks` (int), `Months` (int),
`Years` (int), `Value` (number), `Percentage` (number, whole-number percentage — `10.0` = 10%),
`CurrencyId`, `CountryId`, `CountryStateId`, `CustomState`, `CustomCity`, `CityId`.

### Update Pricing Rule

> The rule id is passed as `--PricingRuleId` (it maps to a **query** param on the underlying
> `PUT /PricingRules/Update` route, not a path segment — but at the CLI it is just another
> `--Param`).

```powershell
absuite pricing update pricing-rule --TenantId $TENANT_ID --PricingRuleId <pricing-rule-guid> --PricingRuleUpdateDto '{
  "Title": "Summer Sale (extended)",
  "Description": "Extended summer discount",
  "IsEnabled": true,
  "Reduce": true,
  "Value": 0,
  "Percentage": 15.0,
  "CurrencyId": "<currency-guid>"
}'
```

**`PricingRuleUpdateDto` fields:** `Title`, `Description`, `IsFree` (bool), `Reduce` (bool),
`IsEnabled` (bool), `IsDefault` (bool), `AllowInternational` (bool), `Hours` (int),
`Days` (int), `Weeks` (int), `Months` (int), `Years` (int), `Value` (number),
`Percentage` (number, whole-number percentage), `CurrencyId`, `CountryId`, `CountryStateId`,
`CustomState`, `CustomCity`, `CityId`. (Unlike create, it does not carry `Code`.)

### Delete Pricing Rule

```powershell
absuite pricing delete pricing-rule --TenantId $TENANT_ID --PricingRuleId <pricing-rule-guid>
```

## Rounding Policies

### List Rounding Policies

```powershell
absuite pricing list rounding-policies --TenantId $TENANT_ID
```

### Count Rounding Policies

```powershell
absuite pricing count rounding-policies --TenantId $TENANT_ID
```

### Get Rounding Policy by ID

```powershell
absuite pricing get rounding-policy --TenantId $TENANT_ID --RoundingPolicyId <rounding-policy-guid>
```

### Create Rounding Policy

```powershell
absuite pricing create rounding-policy --TenantId $TENANT_ID --RoundingPolicyCreateDto '{
  "Code": "ROUND-CENT",
  "Title": "Round to nearest cent",
  "Description": "Standard rounding policy",
  "IsEnabled": true,
  "IsDefault": false,
  "Value": 0,
  "Percentage": 0
}'
```

**`RoundingPolicyCreateDto` fields:** `Id`, `Timestamp`, `Code`, `Title`, `Description`,
`IsFree` (bool), `Reduce` (bool), `IsEnabled` (bool), `IsDefault` (bool),
`AllowInternational` (bool), `Hours` (int), `Days` (int), `Weeks` (int), `Months` (int),
`Years` (int), `Value` (number), `Percentage` (number, whole-number percentage),
`CurrencyId`, `CountryId`, `CountryStateId`, `CustomState`, `CustomCity`, `CityId`.

### Update Rounding Policy

```powershell
absuite pricing update rounding-policy --TenantId $TENANT_ID --RoundingPolicyId <rounding-policy-guid> --RoundingPolicyUpdateDto '{
  "Code": "ROUND-CENT",
  "Title": "Round to nearest cent (revised)",
  "Description": "Revised rounding policy",
  "IsEnabled": true,
  "Value": 0,
  "Percentage": 0
}'
```

**`RoundingPolicyUpdateDto` fields:** `Code`, `Title`, `Description`, `IsFree` (bool),
`Reduce` (bool), `IsEnabled` (bool), `IsDefault` (bool), `AllowInternational` (bool),
`Hours` (int), `Days` (int), `Weeks` (int), `Months` (int), `Years` (int), `Value` (number),
`Percentage` (number, whole-number percentage), `CurrencyId`, `CountryId`, `CountryStateId`,
`CustomState`, `CustomCity`, `CityId`. (Unlike the pricing-rule update, this one **does**
carry `Code`.)

### Delete Rounding Policy

```powershell
absuite pricing delete rounding-policy --TenantId $TENANT_ID --RoundingPolicyId <rounding-policy-guid>
```

## Price Calculation (item reads — no tenant)

These reads compute prices for a single item and are **not tenant-scoped** — do not pass
`--TenantId`. `--CurrencyId` is optional (defaults server-side, e.g. `USD.USA`).

### Get Calculated Price for an Item

Considers a price list, discount list, quantity, and currency (all optional).

```powershell
absuite pricing get price --ItemId <item-guid> --PriceListId <price-list-guid> --DiscountsListId <discount-list-guid> --Quantity 1 --CurrencyId <currency-id>
```

Optional params: `--PriceListId`, `--DiscountsListId` (note the spelling), `--Quantity`,
`--CurrencyId`.

### Get Final Price (after discounts and taxes)

```powershell
absuite pricing get final-price --ItemId <item-guid> --CurrencyId <currency-id>
```

### Get Total Savings

```powershell
absuite pricing get total-savings --ItemId <item-guid> --CurrencyId <currency-id>
```

### Get Total Taxes

```powershell
absuite pricing get total-taxes --ItemId <item-guid> --CurrencyId <currency-id>
```

## End-to-End Workflow

```powershell
# 1. Create a price list (note the returned id)
absuite pricing create price-list --TenantId $TENANT_ID --PriceListCreateDto '{
  "Name": "Retail 2026", "Context": "Sales", "CurrencyId": "<currency-guid>"
}'

# 2. Create a discount list
absuite pricing create discount-list --TenantId $TENANT_ID --DiscountListCreateDto '{
  "Name": "Volume Discounts", "DiscountListType": "Percentage", "CurrencyId": "<currency-guid>"
}'

# 3. Add a banded discount (whole-number percent)
absuite pricing create discount-list-entry --TenantId $TENANT_ID --DiscountListId <discount-list-guid> --DiscountCreateDto '{
  "Description": "10+ units", "BeginQuantity": 10, "EndQuantity": 99, "Percent": 15.0, "ItemId": "<item-guid>", "DiscountListId": "<discount-list-guid>"
}'

# 4. Add a price entry to the price list, linking the discount list
absuite pricing create price-list-price --TenantId $TENANT_ID --PriceListId <price-list-guid> --ItemPriceCreateDto '{
  "ItemId": "<item-guid>", "PriceListId": "<price-list-guid>", "CurrencyId": "<currency-guid>", "DiscountListId": "<discount-list-guid>", "Price": 49.99
}'

# 5. Update the price entry (full replace — the CLI has no PATCH)
absuite pricing update price-list-price --TenantId $TENANT_ID --PriceListId <price-list-guid> --PriceId <price-guid> --ItemPriceUpdateDto '{
  "Price": 44.99, "ItemId": "<item-guid>", "CurrencyId": "<currency-guid>"
}'

# 6. Calculate the item price for quantity 12 (NO --TenantId on calculation reads)
absuite pricing get price --ItemId <item-guid> --PriceListId <price-list-guid> --DiscountsListId <discount-list-guid> --Quantity 12
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List price lists | `absuite pricing list price-lists` |
| Count price lists | `absuite pricing count price-lists` |
| Get price list | `absuite pricing get price-list --PriceListId <price-list-guid>` |
| Create price list | `absuite pricing create price-list --PriceListCreateDto '{...}'` |
| Update price list | `absuite pricing update price-list --PriceListId <price-list-guid> --PriceListUpdateDto '{...}'` |
| Delete price list | `absuite pricing delete price-list --PriceListId <price-list-guid>` |
| List price entries | `absuite pricing list price-list-prices --PriceListId <price-list-guid>` |
| Get price entry | `absuite pricing get price-list-price --PriceListId <price-list-guid> --PriceId <price-guid>` |
| Create price entry | `absuite pricing create price-list-price --PriceListId <price-list-guid> --ItemPriceCreateDto '{...}'` |
| Update price entry | `absuite pricing update price-list-price --PriceListId <price-list-guid> --PriceId <price-guid> --ItemPriceUpdateDto '{...}'` |
| Delete price entry | `absuite pricing delete price-list-price --PriceListId <price-list-guid> --PriceId <price-guid>` |
| List discount lists | `absuite pricing list discount-lists` |
| Count discount lists | `absuite pricing count discount-lists` |
| Get discount list | `absuite pricing get discount-list --DiscountListId <discount-list-guid>` |
| Create discount list | `absuite pricing create discount-list --DiscountListCreateDto '{...}'` |
| Update discount list | `absuite pricing update discount-list --DiscountListId <discount-list-guid> --DiscountListUpdateDto '{...}'` |
| Delete discount list | `absuite pricing delete discount-list --DiscountListId <discount-list-guid>` |
| List discount entries | `absuite pricing list discount-list-entries --DiscountListId <discount-list-guid>` |
| Count discount entries | `absuite pricing count discount-list-entries --DiscountListId <discount-list-guid>` |
| Get discount entry | `absuite pricing get discount-list-entry --DiscountListId <discount-list-guid> --DiscountListEntryId <discount-guid>` |
| Create discount entry | `absuite pricing create discount-list-entry --DiscountListId <discount-list-guid> --DiscountCreateDto '{...}'` |
| Update discount entry | `absuite pricing update discount-list-entry --DiscountListId <discount-list-guid> --DiscountListEntryId <discount-guid> --DiscountUpdateDto '{...}'` |
| Delete discount entry | `absuite pricing delete discount-list-entry --DiscountListId <discount-list-guid> --DiscountListEntryId <discount-guid>` |
| List pricing rules | `absuite pricing list pricing-rules` |
| Count pricing rules | `absuite pricing count pricing-rules` |
| Get pricing rule | `absuite pricing get pricing-rule --PricingRuleId <pricing-rule-guid>` |
| Create pricing rule | `absuite pricing create pricing-rule --PricingRuleCreateDto '{...}'` |
| Update pricing rule | `absuite pricing update pricing-rule --PricingRuleId <pricing-rule-guid> --PricingRuleUpdateDto '{...}'` |
| Delete pricing rule | `absuite pricing delete pricing-rule --PricingRuleId <pricing-rule-guid>` |
| List rounding policies | `absuite pricing list rounding-policies` |
| Count rounding policies | `absuite pricing count rounding-policies` |
| Get rounding policy | `absuite pricing get rounding-policy --RoundingPolicyId <rounding-policy-guid>` |
| Create rounding policy | `absuite pricing create rounding-policy --RoundingPolicyCreateDto '{...}'` |
| Update rounding policy | `absuite pricing update rounding-policy --RoundingPolicyId <rounding-policy-guid> --RoundingPolicyUpdateDto '{...}'` |
| Delete rounding policy | `absuite pricing delete rounding-policy --RoundingPolicyId <rounding-policy-guid>` |
| Get calculated price | `absuite pricing get price --ItemId <item-guid>` |
| Get final price | `absuite pricing get final-price --ItemId <item-guid>` |
| Get total savings | `absuite pricing get total-savings --ItemId <item-guid>` |
| Get total taxes | `absuite pricing get total-taxes --ItemId <item-guid>` |

> Every price-list / discount-list / pricing-rule / rounding-policy command also accepts
> `--TenantId <tenant-guid>` (omit it if you set a default tenant with
> `absuite config set --tenant-id <tenant-guid>`). The four price-calculation reads
> (`get price`, `get final-price`, `get total-savings`, `get total-taxes`) take **no** tenant.

## Notes

- **No PATCH.** The `absuite` CLI does not support JSON Patch. For atomic partial updates, use
  the `absuite-pricing` REST skill; otherwise use `update` (full PUT replace).
- **No `search`.** The Pricing Service exposes no search endpoint — use `list` (optionally with
  the entity's parent id) and filter client-side.
- **Create parents before children.** Create a price list before its price entries, and a
  discount list before its discount entries; entries reference the parent list id.
