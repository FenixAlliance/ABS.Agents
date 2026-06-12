---
name: absuite-cart-cli
description: >
  Manage shopping carts, cart records/lines, wish lists, and compare tables in the
  Alliance Business Suite (ABS) Cart Service using the `absuite` CLI. Covers reading
  ambient carts (guest/user/acting/business), adding/removing items, updating
  quantities, submitting carts, wish lists, and product comparison — via
  get/list/count/create/update/delete commands and service actions. Requires an
  authenticated CLI session (see absuite-login-cli). For atomic PATCH updates or raw
  HTTP, use the absuite-cart (REST) skill.
---

# Alliance Business Suite — Cart Skill (CLI)

Manage shopping carts through the `absuite` CLI's `cart` service. The Cart Service is
**hybrid-scoped**: most operations are anonymous, user-, or cart-id-scoped and take **no**
tenant. Only `get tenant` (business cart) requires a tenant, and `submit` accepts an
optional one. The CLI does not support PATCH (JSON Patch) — for partial atomic updates use
the `absuite-cart` REST skill.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-cart` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-cart` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general CLI
   usage and configuration, see `absuite-cli`.
2. **Tenant is mostly not needed.** Carts are resolved from the session/JWT or by a known
   cart ID. Only `get tenant` needs `--TenantId <tenant-guid>` (the business cart), and
   `submit` accepts an optional `--TenantId`. If you have set a default tenant with
   `absuite config set --tenant-id <tenant-guid>`, reference it as `$TENANT_ID`.
3. **Discover commands:**
   ```powershell
   absuite cart list-commands
   absuite cart get user --help
   ```

## Command Structure

```
absuite cart <verb> <entity> --Param value
```

- **Verbs:** `get`, `list`, `count`, `create`, `update`, `delete`, plus service actions
  (`submit`, `set`, `add-item`, `increase`, `decrease`, `clear`, `is-in-cart`, etc.).
- **Entities:** the ambient carts (`user`, `acting`, `guest`, `tenant`, `by-id`),
  `item`, `line`, `record`, `wish-list`, `wish-list-record`, `compare`.
- The canonical PowerShell function-name form also works as the command, e.g.
  `absuite cart Get-UserCart` is equivalent to `absuite cart get user`, and
  `absuite cart Submit-CartAsync --CartId <cart-guid>` to `absuite cart submit ...`.
- **JSON DTO params** are passed as a single-quoted JSON string (`--<Dto> '{...}'`) using
  the **same field names** as the REST API.

> The Cart Service has **no** top-level cart `list` / `count` / `search` / `create` /
> `delete`. You obtain a cart with one of the four `get` commands below (or by a known
> cart ID), then operate on its records, lines, wish lists, and compare table.

## Key Concepts

- **Cart** — holds records/lines plus a currency and country. Fetch an **ambient** cart
  without an ID: `guest` (anonymous), `acting` (session), `user` (signed-in user, from JWT),
  or `tenant` (a business cart, by tenant ID).
- **Record / Item / Line** — a cart's line entries, exposed as cart-scoped `item`/`line`
  views and as a flat trackable `record` surface addressed by a record ID.
- **Wish List** — a saved product list inside a cart (`Title`, `Description`, `Public`).
- **Compare table** — a per-cart set of products staged for comparison.

> Two DTOs use unusual casing the spec mandates verbatim: the currency-switch body uses
> `CartID` / `CurrencyID` (capital `ID`); the new-wish-list body uses `CartID`. Most other
> fields use `CartId` / `ItemId`.

## Getting Carts

### Get Guest Cart (anonymous — no tenant)

```powershell
absuite cart get guest
```

### Get Acting Cart (session cart — no tenant)

```powershell
absuite cart get acting
```

### Get Current User's Cart (JWT-user-scoped — no tenant)

```powershell
absuite cart get user
```

### Get Business (Tenant) Cart — requires tenant

```powershell
absuite cart get tenant --TenantId $TENANT_ID
```

### Get Cart by ID (cart-id-scoped — no tenant)

```powershell
absuite cart get by-id --CartId <cart-guid>
```

## Updating & Submitting a Cart

### Update Cart

```powershell
absuite cart update --CartId <cart-guid> --CartUpdateRequest '{
  "CurrencyId": "<currency-id>",
  "CountryId": "<country-id>"
}'
```

`CartUpdateRequest` fields: `CurrencyId`, `CountryId`.

### Submit Cart (Checkout)

Converts the cart into an order. Tenant is optional — pass `--TenantId` to submit under a
tenant context, or omit it.

```powershell
# Without tenant context
absuite cart submit --CartId <cart-guid>

# Under a tenant context
absuite cart submit --CartId <cart-guid> --TenantId $TENANT_ID
```

## Cart Currency & Country

### Get Cart Country

```powershell
absuite cart get country --CartId <cart-guid>
```

### Set Cart Country

```powershell
absuite cart set country --CartId <cart-guid> --CountrySwitchRequest '{
  "CartId": "<cart-guid>",
  "CountryId": "<country-id>"
}'
```

`CountrySwitchRequest` fields: `CartId`, `CountryId`.

### Get Cart Currency

```powershell
absuite cart get currency --CartId <cart-guid>
```

### Set Cart Currency

```powershell
absuite cart set currency --CartId <cart-guid> --CurrencySwitchRequest '{
  "CartID": "<cart-guid>",
  "CurrencyID": "<currency-id>"
}'
```

`CurrencySwitchRequest` fields: `CartID`, `CurrencyID` (capital `ID` — spec-verbatim).

## Cart Items

### List Cart Items

```powershell
absuite cart list items --CartId <cart-guid>
```

### Add Item to Cart

`--Quantity` is optional (defaults to 1).

```powershell
absuite cart add-item --CartId <cart-guid> --ItemId <item-guid> --Quantity 2
```

### Update Item in Cart

```powershell
absuite cart update item --CartId <cart-guid> --ItemId <item-guid> --ItemCartRecordUpdateDto '{ "Quantity": 3 }'
```

`ItemCartRecordUpdateDto` field: `Quantity`.

### Increase Item Quantity

Body is an `ItemCartRecordUpdateDto` whose `Quantity` is the amount to increase by.

```powershell
absuite cart increase item --CartId <cart-guid> --ItemId <item-guid> --ItemCartRecordUpdateDto '{ "Quantity": 1 }'
```

### Decrease Item Quantity

```powershell
absuite cart decrease item --CartId <cart-guid> --ItemId <item-guid> --ItemCartRecordUpdateDto '{ "Quantity": 1 }'
```

### Remove Item from Cart

```powershell
absuite cart delete item --CartId <cart-guid> --ItemId <item-guid>
```

### Clear All Items from Cart

```powershell
absuite cart clear --CartId <cart-guid>
```

### Check if an Item Is Already in the Cart

```powershell
absuite cart is-in-cart --CartId <cart-guid> --ItemId <item-guid>
```

## Cart Lines

### List Cart Lines

```powershell
absuite cart list lines --CartId <cart-guid>
```

### Get a Cart Line by ID

```powershell
absuite cart get line --CartId <cart-guid> --LineId <line-guid>
```

### Update a Cart Line

```powershell
absuite cart update line --CartId <cart-guid> --LineId <line-guid> --ItemCartRecordUpdateDto '{ "Quantity": 3 }'
```

`ItemCartRecordUpdateDto` field: `Quantity`.

### Increase Cart Line Quantity

`--Quantity` is the (optional) amount to increase by.

```powershell
absuite cart increase line --CartId <cart-guid> --LineId <line-guid> --Quantity 1
```

### Decrease Cart Line Quantity

```powershell
absuite cart decrease line --CartId <cart-guid> --LineId <line-guid> --Quantity 1
```

### Remove a Cart Line

```powershell
absuite cart delete line --CartId <cart-guid> --LineId <line-guid>
```

## Records (trackable cart records)

The flat `record` surface lists a cart's records, adds a tracked product, and adjusts a
record by ID.

### List All Items in a Cart

```powershell
absuite cart list records --CartId <cart-guid>
```

### Add a Product to a Cart with Tracking

```powershell
absuite cart create record --ItemCartRecordCreateDto '{
  "CartId": "<cart-guid>",
  "ProductId": "<item-guid>",
  "Quantity": 1
}'
```

`ItemCartRecordCreateDto` fields: `Id`, `Timestamp`, `CartId`, `ProductId`, `Quantity`.

### Add an Item to a Cart (helper)

```powershell
absuite cart add-item-record --CartId <cart-guid> --ItemId <item-guid> --Quantity 1
```

### Get a Cart Record by ID

```powershell
absuite cart get record --RecordId <record-guid>
```

### Update a Cart Record

```powershell
absuite cart update record --RecordId <record-guid> --ItemCartRecordUpdateDto '{ "Quantity": 5 }'
```

`ItemCartRecordUpdateDto` field: `Quantity`.

### Increase Cart Record Quantity

`--Quantity` is the (optional) amount to increase by.

```powershell
absuite cart increase record --RecordId <record-guid> --Quantity 1
```

### Decrease Cart Record Quantity

```powershell
absuite cart decrease record --RecordId <record-guid> --Quantity 1
```

### Remove a Product by Record ID

```powershell
absuite cart delete record --RecordId <record-guid>
```

### Remove a Product by Params

```powershell
absuite cart delete-record-by-params --CartId <cart-guid> --ProductId <item-guid>
```

### Clear a Cart (helper)

`--CartID` is required (capital `ID` — spec-verbatim).

```powershell
absuite cart clear-cart --CartID <cart-guid>
```

### Check if an Item Is in a Cart (helper)

`--ItemID` and `--CartID` are required (capital `ID` — spec-verbatim).

```powershell
absuite cart is-item-in-cart --ItemID <item-guid> --CartID <cart-guid>
```

## Wish Lists

Wish lists exist as cart-nested commands and a flat surface. Both are cart-id-scoped
(no tenant).

### Cart-nested wish lists

#### List Wish Lists in a Cart

```powershell
absuite cart list wish-lists --CartId <cart-guid>
```

#### Create a Wish List

```powershell
absuite cart create wish-list --CartId <cart-guid> --NewWishListRequest '{
  "Title": "Birthday Ideas",
  "Description": "Gifts to consider",
  "CartID": "<cart-guid>",
  "Public": false
}'
```

`NewWishListRequest` fields: `Title`, `Description`, `CartID`, `Public`.

#### Get a Wish List by ID

```powershell
absuite cart get wish-list --CartId <cart-guid> --WishListId <wishlist-guid>
```

#### Update a Wish List

```powershell
absuite cart update wish-list --CartId <cart-guid> --WishListId <wishlist-guid> --WishListUpdateDto '{
  "Title": "Updated List",
  "Description": "New description",
  "Public": true
}'
```

`WishListUpdateDto` fields: `Title` (**required**), `Description`, `Public`.

#### Delete a Wish List

```powershell
absuite cart delete wish-list --CartId <cart-guid> --WishListId <wishlist-guid>
```

#### Check if a Wish List Exists

```powershell
absuite cart wish-list-exists --CartId <cart-guid> --WishListId <wishlist-guid>
```

#### List Records in a Wish List

```powershell
absuite cart list wish-list-records --CartId <cart-guid> --WishListId <wishlist-guid>
```

#### Add a Record to a Wish List

```powershell
absuite cart create wish-list-record --CartId <cart-guid> --WishListId <wishlist-guid> --ProductToWishListRequest '{
  "WishListId": "<wishlist-guid>",
  "ItemId": "<item-guid>"
}'
```

`ProductToWishListRequest` fields: `WishListId`, `ItemId`.

#### Get a Record in a Wish List

```powershell
absuite cart get wish-list-record --CartId <cart-guid> --WishListId <wishlist-guid> --RecordId <record-guid>
```

#### Remove a Record from a Wish List

```powershell
absuite cart delete wish-list-record --CartId <cart-guid> --WishListId <wishlist-guid> --RecordId <record-guid>
```

#### Check if an Item Is in Any of the Cart's Wish Lists

```powershell
absuite cart is-item-in-wish-lists --CartId <cart-guid> --ItemId <item-guid>
```

### Flat wish-list surface

#### Create a Wish List (flat)

```powershell
absuite cart create-wish-list --NewWishListRequest '{
  "Title": "Birthday Ideas",
  "Description": "Gifts to consider",
  "CartID": "<cart-guid>",
  "Public": false
}'
```

#### Get Wish Lists for a Cart (flat)

```powershell
absuite cart get-wish-list --CartId <cart-guid>
```

#### Get Wish List Details (flat)

```powershell
absuite cart get wish-list-details --WishListId <wishlist-guid>
```

#### Update a Wish List (flat)

```powershell
absuite cart update-wish-list --WishListId <wishlist-guid> --WishListUpdateDto '{
  "Title": "Updated List",
  "Description": "New description",
  "Public": true
}'
```

#### Delete a Wish List (flat)

```powershell
absuite cart delete-wish-list --WishListId <wishlist-guid>
```

#### List Wish List Item Records (flat)

```powershell
absuite cart get wish-list-records --WishListId <wishlist-guid>
```

#### Add a Product to a Wish List (flat)

```powershell
absuite cart add-product-to-wish-list --ProductToWishListRequest '{
  "WishListId": "<wishlist-guid>",
  "ItemId": "<item-guid>"
}'
```

#### Delete a Wish List Record (flat)

```powershell
absuite cart delete-wish-list-record --RecordId <record-guid>
```

#### Check if a Product Is in Any Wish List (flat)

```powershell
absuite cart is-product-in-wish-lists --CartId <cart-guid> --ProductId <item-guid>
```

#### Check if a Wish List Exists (flat)

```powershell
absuite cart wish-list-exists-flat --WishListId <wishlist-guid>
```

## Compare Table

Compare tables exist as cart-nested commands and a flat surface. Both are cart-id-scoped
(no tenant).

### Cart-nested compare table

#### List Items in the Compare Table

```powershell
absuite cart list compare --CartId <cart-guid>
```

#### Add an Item to the Compare Table

```powershell
absuite cart add-to-compare --CartId <cart-guid> --ItemId <item-guid>
```

#### Get an Item from the Compare Table

```powershell
absuite cart get compare --CartId <cart-guid> --ItemId <item-guid>
```

#### Remove an Item from the Compare Table

```powershell
absuite cart delete compare --CartId <cart-guid> --ItemId <item-guid>
```

#### Check if an Item Is in the Compare Table

```powershell
absuite cart is-item-in-compare --CartId <cart-guid> --ItemId <item-guid>
```

### Flat compare surface

#### Add an Item to the Compare Table (flat)

```powershell
absuite cart add-to-compare-flat --AddProductToCompareRequest '{
  "CartId": "<cart-guid>",
  "ItemId": "<item-guid>"
}'
```

`AddProductToCompareRequest` fields: `CartId`, `ItemId`.

#### List Items to Compare in a Cart (flat)

```powershell
absuite cart get-compare-records --CartId <cart-guid>
```

#### Get Compare Record Details (flat)

```powershell
absuite cart get compare-details --RecordId <record-guid>
```

#### Remove an Item from the Compare Table by Record ID (flat)

```powershell
absuite cart delete-compare-record --RecordId <record-guid>
```

## End-to-End Workflow

```powershell
# 1. Get the signed-in user's cart (note the returned cart ID)
absuite cart get user

# 2. Set the cart's currency
absuite cart set currency --CartId <cart-guid> --CurrencySwitchRequest '{
  "CartID": "<cart-guid>", "CurrencyID": "<currency-id>"
}'

# 3. Add an item
absuite cart add-item --CartId <cart-guid> --ItemId <item-guid> --Quantity 2

# 4. Confirm it's in the cart
absuite cart is-in-cart --CartId <cart-guid> --ItemId <item-guid>

# 5. Bump the quantity up by one
absuite cart increase item --CartId <cart-guid> --ItemId <item-guid> --ItemCartRecordUpdateDto '{ "Quantity": 1 }'

# 6. Review the cart's lines
absuite cart list lines --CartId <cart-guid>

# 7. Submit the cart (optionally under a tenant context)
absuite cart submit --CartId <cart-guid>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| Get guest cart | `absuite cart get guest` |
| Get acting cart | `absuite cart get acting` |
| Get user cart | `absuite cart get user` |
| Get business (tenant) cart | `absuite cart get tenant --TenantId <tenant-guid>` |
| Get cart by ID | `absuite cart get by-id --CartId <cart-guid>` |
| Update cart | `absuite cart update --CartId <cart-guid> --CartUpdateRequest '{...}'` |
| Submit cart | `absuite cart submit --CartId <cart-guid>` |
| Get cart country | `absuite cart get country --CartId <cart-guid>` |
| Set cart country | `absuite cart set country --CartId <cart-guid> --CountrySwitchRequest '{...}'` |
| Get cart currency | `absuite cart get currency --CartId <cart-guid>` |
| Set cart currency | `absuite cart set currency --CartId <cart-guid> --CurrencySwitchRequest '{...}'` |
| List cart items | `absuite cart list items --CartId <cart-guid>` |
| Add item to cart | `absuite cart add-item --CartId <cart-guid> --ItemId <item-guid> --Quantity 1` |
| Update item in cart | `absuite cart update item --CartId <cart-guid> --ItemId <item-guid> --ItemCartRecordUpdateDto '{...}'` |
| Increase item quantity | `absuite cart increase item --CartId <cart-guid> --ItemId <item-guid> --ItemCartRecordUpdateDto '{...}'` |
| Decrease item quantity | `absuite cart decrease item --CartId <cart-guid> --ItemId <item-guid> --ItemCartRecordUpdateDto '{...}'` |
| Remove item from cart | `absuite cart delete item --CartId <cart-guid> --ItemId <item-guid>` |
| Clear cart | `absuite cart clear --CartId <cart-guid>` |
| Check item in cart | `absuite cart is-in-cart --CartId <cart-guid> --ItemId <item-guid>` |
| List cart lines | `absuite cart list lines --CartId <cart-guid>` |
| Get cart line | `absuite cart get line --CartId <cart-guid> --LineId <line-guid>` |
| Update cart line | `absuite cart update line --CartId <cart-guid> --LineId <line-guid> --ItemCartRecordUpdateDto '{...}'` |
| Increase cart line quantity | `absuite cart increase line --CartId <cart-guid> --LineId <line-guid> --Quantity 1` |
| Decrease cart line quantity | `absuite cart decrease line --CartId <cart-guid> --LineId <line-guid> --Quantity 1` |
| Remove cart line | `absuite cart delete line --CartId <cart-guid> --LineId <line-guid>` |
| List records in a cart | `absuite cart list records --CartId <cart-guid>` |
| Add product with tracking | `absuite cart create record --ItemCartRecordCreateDto '{...}'` |
| Add item (helper) | `absuite cart add-item-record --CartId <cart-guid> --ItemId <item-guid> --Quantity 1` |
| Get cart record | `absuite cart get record --RecordId <record-guid>` |
| Update cart record | `absuite cart update record --RecordId <record-guid> --ItemCartRecordUpdateDto '{...}'` |
| Increase record quantity | `absuite cart increase record --RecordId <record-guid> --Quantity 1` |
| Decrease record quantity | `absuite cart decrease record --RecordId <record-guid> --Quantity 1` |
| Remove product by record ID | `absuite cart delete record --RecordId <record-guid>` |
| Remove product by params | `absuite cart delete-record-by-params --CartId <cart-guid> --ProductId <item-guid>` |
| Clear cart (helper) | `absuite cart clear-cart --CartID <cart-guid>` |
| Check item in cart (helper) | `absuite cart is-item-in-cart --ItemID <item-guid> --CartID <cart-guid>` |
| List wish lists in cart | `absuite cart list wish-lists --CartId <cart-guid>` |
| Create wish list (nested) | `absuite cart create wish-list --CartId <cart-guid> --NewWishListRequest '{...}'` |
| Get wish list (nested) | `absuite cart get wish-list --CartId <cart-guid> --WishListId <wishlist-guid>` |
| Update wish list (nested) | `absuite cart update wish-list --CartId <cart-guid> --WishListId <wishlist-guid> --WishListUpdateDto '{...}'` |
| Delete wish list (nested) | `absuite cart delete wish-list --CartId <cart-guid> --WishListId <wishlist-guid>` |
| Wish list exists (nested) | `absuite cart wish-list-exists --CartId <cart-guid> --WishListId <wishlist-guid>` |
| List wish list records (nested) | `absuite cart list wish-list-records --CartId <cart-guid> --WishListId <wishlist-guid>` |
| Add record to wish list (nested) | `absuite cart create wish-list-record --CartId <cart-guid> --WishListId <wishlist-guid> --ProductToWishListRequest '{...}'` |
| Get wish list record (nested) | `absuite cart get wish-list-record --CartId <cart-guid> --WishListId <wishlist-guid> --RecordId <record-guid>` |
| Remove wish list record (nested) | `absuite cart delete wish-list-record --CartId <cart-guid> --WishListId <wishlist-guid> --RecordId <record-guid>` |
| Item in cart wish lists? (nested) | `absuite cart is-item-in-wish-lists --CartId <cart-guid> --ItemId <item-guid>` |
| Create wish list (flat) | `absuite cart create-wish-list --NewWishListRequest '{...}'` |
| Get wish lists for cart (flat) | `absuite cart get-wish-list --CartId <cart-guid>` |
| Get wish list details (flat) | `absuite cart get wish-list-details --WishListId <wishlist-guid>` |
| Update wish list (flat) | `absuite cart update-wish-list --WishListId <wishlist-guid> --WishListUpdateDto '{...}'` |
| Delete wish list (flat) | `absuite cart delete-wish-list --WishListId <wishlist-guid>` |
| List wish list records (flat) | `absuite cart get wish-list-records --WishListId <wishlist-guid>` |
| Add product to wish list (flat) | `absuite cart add-product-to-wish-list --ProductToWishListRequest '{...}'` |
| Delete wish list record (flat) | `absuite cart delete-wish-list-record --RecordId <record-guid>` |
| Product in wish lists? (flat) | `absuite cart is-product-in-wish-lists --CartId <cart-guid> --ProductId <item-guid>` |
| Wish list exists? (flat) | `absuite cart wish-list-exists-flat --WishListId <wishlist-guid>` |
| List compare items (nested) | `absuite cart list compare --CartId <cart-guid>` |
| Add to compare (nested) | `absuite cart add-to-compare --CartId <cart-guid> --ItemId <item-guid>` |
| Get compare item (nested) | `absuite cart get compare --CartId <cart-guid> --ItemId <item-guid>` |
| Remove from compare (nested) | `absuite cart delete compare --CartId <cart-guid> --ItemId <item-guid>` |
| Item in compare? (nested) | `absuite cart is-item-in-compare --CartId <cart-guid> --ItemId <item-guid>` |
| Add to compare (flat) | `absuite cart add-to-compare-flat --AddProductToCompareRequest '{...}'` |
| List compare items (flat) | `absuite cart get-compare-records --CartId <cart-guid>` |
| Get compare record details (flat) | `absuite cart get compare-details --RecordId <record-guid>` |
| Remove from compare by record ID (flat) | `absuite cart delete-compare-record --RecordId <record-guid>` |

> Most cart commands take **no** tenant. Only `get tenant` requires `--TenantId`, and
> `submit` accepts an optional one. The CLI has no PATCH — use the `absuite-cart` REST skill
> for atomic JSON-Patch updates.
