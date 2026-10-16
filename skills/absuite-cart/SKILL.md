---
name: absuite-cart
description: >
  Manage shopping carts, cart records/lines, wish lists, and compare tables in the
  Alliance Business Suite (ABS) Cart Service via the REST API. Covers reading ambient
  carts (guest/user/acting/business), adding/removing items, updating quantities,
  submitting carts, wish lists, and product comparison — including atomic PATCH
  (JSON Patch) updates. CartService is HYBRID-scoped: most endpoints are anonymous,
  user-, or cart-id-scoped; only a few take a tenant. Requires a bearer token
  (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Cart Skill (REST)

Manage shopping carts through the ABS Cart Service REST API. The Cart Service is
**hybrid-scoped** — read the scope per endpoint and do **not** bolt `?tenantId=` onto
anything that isn't marked tenant-scoped:

- **Anonymous / ambient** (no tenant): `GuestCart`, `ActingCart`.
- **JWT-user-scoped** (no tenant): `UserCart` — resolved from the bearer token.
- **Tenant-scoped**: `BusinessCart/{tenantId}` (tenant in the **path**, required) and
  `Carts/{cartId}/Submit` (optional `?tenantId=` query).
- **Cart-id-scoped** (no tenant): everything addressed by `{cartId}` — the cart's
  records/items, lines, wish lists, and compare table. The cart ID itself is the scope.

> For the CLI equivalent see `absuite-cart-cli`; for general REST conventions
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

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/CartService`

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
Always check `isSuccess`; read the payload from `result` (an object, an array, a boolean
for the `Contains`/`Exists`/`IsInCart` checks, or `null`).

## Key Concepts

- **Cart** — a shopping cart holding records/lines, plus a currency and country. There are
  several **ambient** carts you can fetch without knowing an ID:
  - **Guest cart** — anonymous/session cart for an unauthenticated visitor.
  - **Acting cart** — the cart the current context is acting on (session cart).
  - **User cart** — the signed-in user's cart, resolved from the JWT.
  - **Business cart** — a tenant's cart, addressed by `{tenantId}` in the path.
- **Record / Item / Line** — the cart's line entries. The Cart Service exposes them under
  three overlapping surfaces that all describe a cart's contents:
  - `Carts/{cartId}/Items` and `Carts/{cartId}/Lines` — cart-scoped views.
  - `Records` — a flat, trackable record surface (`ItemCartRecord`) addressed by `{recordId}`.
- **Wish List** — a saved list of products inside a cart (`title`, `description`, `public`),
  holding wish-list records (one per product).
- **Compare Table** — a per-cart set of products staged for side-by-side comparison.

> Field names in request bodies are the JSON keys exactly as the spec defines them.
> Note two body fields use unusual casing the spec mandates verbatim: the currency-switch
> body uses `cartID` / `currencyID` (capital `ID`), while most others use `cartId` / `itemId`.

## Carts

> There is **no** top-level `GET /Carts` list, no `/Count`, no `/Search`, no top-level
> `POST /Carts` create, and no top-level `DELETE /Carts/{cartId}` in the Cart Service.
> You obtain a cart through one of the four ambient getters below (or by a known `{cartId}`),
> then operate on its sub-resources.

### Get Guest Cart (anonymous — no tenant)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/GuestCart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Acting Cart (session cart — no tenant)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/ActingCart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Current User's Cart (JWT-user-scoped — no tenant)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/UserCart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Business (Tenant) Cart — tenant in the path

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/BusinessCart/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Cart by ID (cart-id-scoped — no tenant)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Cart (PUT — cart-id-scoped)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currencyId": "<currency-id>",
    "countryId": "<country-id>"
  }'
```

`CartUpdateRequest` fields: `currencyId`, `countryId`.

### Patch Cart (PATCH — JSON Patch RFC 6902)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/currencyId", "value": "<currency-id>" },
    { "op": "replace", "path": "/countryId", "value": "<country-id>" }
  ]'
```

### Submit Cart (Checkout) — optional tenant scoping

Converts the cart into an order for processing. Tenant is **optional** here: pass
`?tenantId=<tenant-guid>` to submit under a tenant context, or omit it.

```bash
# Without tenant context
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Submit" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Under a tenant context
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Submit?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Cart Currency & Country (cart-id-scoped)

### Get Cart Country

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Country" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Set Cart Country (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Country" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "<cart-guid>",
    "countryId": "<country-id>"
  }'
```

`CountrySwitchRequest` fields: `cartId`, `countryId`.

### Get Cart Currency

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Currency" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Set Cart Currency (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Currency" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cartID": "<cart-guid>",
    "currencyID": "<currency-id>"
  }'
```

`CurrencySwitchRequest` fields: `cartID`, `currencyID` (note the capital `ID` — spec-verbatim).

## Cart Items (cart-id-scoped)

The `Items` surface lists a cart's lines and adds/removes/adjusts entries by `{itemId}`.

### List Cart Items

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Items" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Add Item to Cart

`quantity` is an optional query param (defaults to 1 server-side). No request body.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Items/<item-guid>?quantity=2" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Item in Cart (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Items/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 3 }'
```

`ItemCartRecordUpdateDto` field: `quantity` (number).

### Increase Item Quantity (PUT)

Body is an `ItemCartRecordUpdateDto` (`quantity` = the amount to increase by).

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Items/<item-guid>/Increase" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 1 }'
```

### Decrease Item Quantity (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Items/<item-guid>/Decrease" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 1 }'
```

### Remove Item from Cart (DELETE)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Items/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Clear All Items from Cart (DELETE)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Items" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Check if an Item Is Already in the Cart

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Contains/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Cart Lines (cart-id-scoped)

The `Lines` surface addresses a cart's entries by `{lineId}`.

### List Cart Lines

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a Cart Line by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Lines/<line-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update a Cart Line (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Lines/<line-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 3 }'
```

`ItemCartRecordUpdateDto` field: `quantity` (number).

### Increase Cart Line Quantity (PUT)

`quantity` is an optional query param (the amount to increase by). No request body.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Lines/<line-guid>/Increase?quantity=1" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Decrease Cart Line Quantity (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Lines/<line-guid>/Decrease?quantity=1" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Remove a Cart Line (DELETE)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Lines/<line-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Records (trackable cart records — cart-id-scoped)

The `Records` surface is a flat view of cart records (`ItemCartRecord`), addressed by
`{recordId}`, with a tracked create path and convenience query-param helpers.

### Get All Items in a Cart

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Records/<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Add a Product to a Cart with Tracking (POST)

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Records" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "<cart-guid>",
    "productId": "<item-guid>",
    "quantity": 1
  }'
```

`ItemCartRecordCreateDto` fields: `id`, `timestamp`, `cartId`, `productId`, `quantity` (number).

### Add an Item to a Cart (query-param helper, POST)

All inputs are optional query params; no request body.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Records/AddItem?cartId=<cart-guid>&itemId=<item-guid>&quantity=1" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a Cart Record by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Records/<record-guid>/Details" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update a Cart Record (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Records/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 5 }'
```

`ItemCartRecordUpdateDto` field: `quantity` (number).

### Patch a Cart Record (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CartService/Records/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/quantity", "value": 5 }
  ]'
```

### Increase Cart Record Quantity (PUT)

`quantity` is an optional query param. No request body.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Records/<record-guid>/Increase?quantity=1" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Decrease Cart Record Quantity (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Records/<record-guid>/Decrease?quantity=1" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Remove a Product from a Cart by Record ID (DELETE)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Records/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Remove a Product from a Cart by Params (DELETE)

`cartId` and `productId` are optional query params.

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Records?cartId=<cart-guid>&productId=<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Clear All Items from a Cart (query-param helper, POST)

`cartID` is a **required** query param (note the capital `ID` — spec-verbatim).

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Records/ClearCart?cartID=<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Check if an Item Is in a Cart (query-param helper)

`itemID` and `cartID` are **required** query params (capital `ID` — spec-verbatim).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Records/IsInCart?itemID=<item-guid>&cartID=<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Wish Lists

Wish lists exist under two surfaces: nested under a cart (`Carts/{cartId}/WishLists/...`)
and a flat surface (`WishLists/...`). Both are cart-id-scoped (no tenant).

### Cart-nested wish lists

#### List Wish Lists in a Cart

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Create a Wish List (POST)

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Birthday Ideas",
    "description": "Gifts to consider",
    "cartID": "<cart-guid>",
    "public": false
  }'
```

`NewWishListRequest` fields: `title`, `description`, `cartID`, `public` (boolean).

#### Get a Wish List by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Update a Wish List (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated List",
    "description": "New description",
    "public": true
  }'
```

`WishListUpdateDto` fields: `title` (**required**), `description`, `public` (boolean).

#### Delete a Wish List (DELETE)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Check if a Wish List Exists

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>/Exists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### List Records in a Wish List

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>/Records" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Add a Record to a Wish List (POST)

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>/Records" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "wishListId": "<wishlist-guid>",
    "itemId": "<item-guid>"
  }'
```

`ProductToWishListRequest` fields: `wishListId`, `itemId`.

#### Get a Record in a Wish List

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>/Records/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Remove a Record from a Wish List (DELETE)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>/Records/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Check if an Item Is in Any of the Cart's Wish Lists

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/Contains/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Flat wish-list surface

#### Create a Wish List (POST)

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/WishLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Birthday Ideas",
    "description": "Gifts to consider",
    "cartID": "<cart-guid>",
    "public": false
  }'
```

`NewWishListRequest` fields: `title`, `description`, `cartID`, `public` (boolean).

#### Get Wish Lists for a Cart

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/WishLists/<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Get Wish List Details

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/WishLists/<wishlist-guid>/Details" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Update a Wish List (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/WishLists/<wishlist-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated List",
    "description": "New description",
    "public": true
  }'
```

`WishListUpdateDto` fields: `title` (**required**), `description`, `public` (boolean).

#### Patch a Wish List (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CartService/WishLists/<wishlist-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/title", "value": "Updated List" },
    { "op": "replace", "path": "/public", "value": true }
  ]'
```

#### Delete a Wish List (DELETE)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/WishLists/<wishlist-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### List Wish List Item Records

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/WishLists/<wishlist-guid>/Records" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Add a Product to a Wish List (POST)

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/WishLists/Records" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "wishListId": "<wishlist-guid>",
    "itemId": "<item-guid>"
  }'
```

`ProductToWishListRequest` fields: `wishListId`, `itemId`.

#### Delete a Wish List Record (DELETE)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/WishLists/Records/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Check if a Product Is in Any Wish List

`cartId` and `productId` are optional query params.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/WishLists/Contains?cartId=<cart-guid>&productId=<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Check if a Wish List Exists

`wishListId` is an optional query param.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/WishLists/Exists?wishListId=<wishlist-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Compare Table

Compare tables exist under two surfaces: nested under a cart
(`Carts/{cartId}/Compare/...`) and a flat surface (`Compare/...`). Both are cart-id-scoped
(no tenant).

### Cart-nested compare table

#### List Items in the Compare Table

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Compare" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Add an Item to the Compare Table (POST)

No request body — the item is addressed by `{itemId}` in the path.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Compare/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Get an Item from the Compare Table

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Compare/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Remove an Item from the Compare Table (DELETE)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Compare/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Check if an Item Is in the Compare Table

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Compare/Contains/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Flat compare surface

#### Add an Item to the Compare Table (POST)

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Compare" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "<cart-guid>",
    "itemId": "<item-guid>"
  }'
```

`AddProductToCompareRequest` fields: `cartId`, `itemId`.

#### List Items to Compare in a Cart

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Compare/<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Get Compare Record Details

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Compare/<record-guid>/Details" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Remove an Item from the Compare Table by Record ID (DELETE)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Compare/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## End-to-End Workflow

```bash
BASE="$ABSUITE_HOST_URL/api/v2/CartService"

# 1. Get the signed-in user's cart (note result.id as the cart ID)
curl -X GET "$BASE/Carts/UserCart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 2. Set the cart's currency
curl -X PUT "$BASE/Carts/<cart-guid>/Currency" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "cartID": "<cart-guid>", "currencyID": "<currency-id>" }'

# 3. Add an item (quantity via query param)
curl -X POST "$BASE/Carts/<cart-guid>/Items/<item-guid>?quantity=2" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 4. Confirm it's in the cart
curl -X GET "$BASE/Carts/<cart-guid>/Contains/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 5. Bump the quantity up by one
curl -X PUT "$BASE/Carts/<cart-guid>/Items/<item-guid>/Increase" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "quantity": 1 }'

# 6. Review the cart's lines
curl -X GET "$BASE/Carts/<cart-guid>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 7. Submit the cart (optionally under a tenant context)
curl -X POST "$BASE/Carts/<cart-guid>/Submit" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

Scope column: **none** = anonymous/ambient; **user** = JWT-user-scoped; **cartId** =
scoped by the `{cartId}`/`{recordId}` path or `cartId`/`cartID` param (no tenant);
**tenant** = takes a tenant. Do **not** add `?tenantId=` to any row not marked *tenant*.

| Action | Method | Path | Scope |
|---|---|---|---|
| Get guest cart | GET | `/api/v2/CartService/Carts/GuestCart` | none |
| Get acting cart | GET | `/api/v2/CartService/Carts/ActingCart` | none |
| Get user cart | GET | `/api/v2/CartService/Carts/UserCart` | user |
| Get business (tenant) cart | GET | `/api/v2/CartService/Carts/BusinessCart/{tenantId}` | tenant (path) |
| Get cart by ID | GET | `/api/v2/CartService/Carts/{cartId}` | cartId |
| Update cart | PUT | `/api/v2/CartService/Carts/{cartId}` | cartId |
| Patch cart | PATCH | `/api/v2/CartService/Carts/{cartId}` | cartId |
| Submit cart | POST | `/api/v2/CartService/Carts/{cartId}/Submit` | tenant (optional query) |
| Get cart country | GET | `/api/v2/CartService/Carts/{cartId}/Country` | cartId |
| Set cart country | PUT | `/api/v2/CartService/Carts/{cartId}/Country` | cartId |
| Get cart currency | GET | `/api/v2/CartService/Carts/{cartId}/Currency` | cartId |
| Set cart currency | PUT | `/api/v2/CartService/Carts/{cartId}/Currency` | cartId |
| List cart items | GET | `/api/v2/CartService/Carts/{cartId}/Items` | cartId |
| Clear cart items | DELETE | `/api/v2/CartService/Carts/{cartId}/Items` | cartId |
| Add item to cart | POST | `/api/v2/CartService/Carts/{cartId}/Items/{itemId}` | cartId |
| Update item in cart | PUT | `/api/v2/CartService/Carts/{cartId}/Items/{itemId}` | cartId |
| Remove item from cart | DELETE | `/api/v2/CartService/Carts/{cartId}/Items/{itemId}` | cartId |
| Increase item quantity | PUT | `/api/v2/CartService/Carts/{cartId}/Items/{itemId}/Increase` | cartId |
| Decrease item quantity | PUT | `/api/v2/CartService/Carts/{cartId}/Items/{itemId}/Decrease` | cartId |
| Check item in cart | GET | `/api/v2/CartService/Carts/{cartId}/Contains/{itemId}` | cartId |
| List cart lines | GET | `/api/v2/CartService/Carts/{cartId}/Lines` | cartId |
| Get cart line | GET | `/api/v2/CartService/Carts/{cartId}/Lines/{lineId}` | cartId |
| Update cart line | PUT | `/api/v2/CartService/Carts/{cartId}/Lines/{lineId}` | cartId |
| Remove cart line | DELETE | `/api/v2/CartService/Carts/{cartId}/Lines/{lineId}` | cartId |
| Increase cart line quantity | PUT | `/api/v2/CartService/Carts/{cartId}/Lines/{lineId}/Increase` | cartId |
| Decrease cart line quantity | PUT | `/api/v2/CartService/Carts/{cartId}/Lines/{lineId}/Decrease` | cartId |
| Get items in a cart | GET | `/api/v2/CartService/Records/{cartId}` | cartId |
| Add product with tracking | POST | `/api/v2/CartService/Records` | cartId |
| Add item (helper) | POST | `/api/v2/CartService/Records/AddItem` | cartId |
| Get record details | GET | `/api/v2/CartService/Records/{recordId}/Details` | cartId |
| Update cart record | PUT | `/api/v2/CartService/Records/{recordId}` | cartId |
| Patch cart record | PATCH | `/api/v2/CartService/Records/{recordId}` | cartId |
| Increase record quantity | PUT | `/api/v2/CartService/Records/{recordId}/Increase` | cartId |
| Decrease record quantity | PUT | `/api/v2/CartService/Records/{recordId}/Decrease` | cartId |
| Remove product by record ID | DELETE | `/api/v2/CartService/Records/{recordId}` | cartId |
| Remove product by params | DELETE | `/api/v2/CartService/Records` | cartId |
| Clear cart (helper) | POST | `/api/v2/CartService/Records/ClearCart` | cartId |
| Check item in cart (helper) | GET | `/api/v2/CartService/Records/IsInCart` | cartId |
| List wish lists in cart | GET | `/api/v2/CartService/Carts/{cartId}/WishLists` | cartId |
| Create wish list (nested) | POST | `/api/v2/CartService/Carts/{cartId}/WishLists` | cartId |
| Get wish list (nested) | GET | `/api/v2/CartService/Carts/{cartId}/WishLists/{wishListId}` | cartId |
| Update wish list (nested) | PUT | `/api/v2/CartService/Carts/{cartId}/WishLists/{wishListId}` | cartId |
| Delete wish list (nested) | DELETE | `/api/v2/CartService/Carts/{cartId}/WishLists/{wishListId}` | cartId |
| Wish list exists (nested) | GET | `/api/v2/CartService/Carts/{cartId}/WishLists/{wishListId}/Exists` | cartId |
| List wish list records (nested) | GET | `/api/v2/CartService/Carts/{cartId}/WishLists/{wishListId}/Records` | cartId |
| Add record to wish list (nested) | POST | `/api/v2/CartService/Carts/{cartId}/WishLists/{wishListId}/Records` | cartId |
| Get wish list record (nested) | GET | `/api/v2/CartService/Carts/{cartId}/WishLists/{wishListId}/Records/{recordId}` | cartId |
| Remove wish list record (nested) | DELETE | `/api/v2/CartService/Carts/{cartId}/WishLists/{wishListId}/Records/{recordId}` | cartId |
| Item in cart wish lists? (nested) | GET | `/api/v2/CartService/Carts/{cartId}/WishLists/Contains/{itemId}` | cartId |
| Create wish list (flat) | POST | `/api/v2/CartService/WishLists` | cartId |
| Get wish lists for cart (flat) | GET | `/api/v2/CartService/WishLists/{cartId}` | cartId |
| Get wish list details (flat) | GET | `/api/v2/CartService/WishLists/{wishListId}/Details` | cartId |
| Update wish list (flat) | PUT | `/api/v2/CartService/WishLists/{wishListId}` | cartId |
| Patch wish list (flat) | PATCH | `/api/v2/CartService/WishLists/{wishListId}` | cartId |
| Delete wish list (flat) | DELETE | `/api/v2/CartService/WishLists/{wishListId}` | cartId |
| List wish list records (flat) | GET | `/api/v2/CartService/WishLists/{wishListId}/Records` | cartId |
| Add product to wish list (flat) | POST | `/api/v2/CartService/WishLists/Records` | cartId |
| Delete wish list record (flat) | DELETE | `/api/v2/CartService/WishLists/Records/{recordId}` | cartId |
| Product in wish lists? (flat) | GET | `/api/v2/CartService/WishLists/Contains` | cartId |
| Wish list exists? (flat) | GET | `/api/v2/CartService/WishLists/Exists` | cartId |
| List compare items (nested) | GET | `/api/v2/CartService/Carts/{cartId}/Compare` | cartId |
| Add item to compare (nested) | POST | `/api/v2/CartService/Carts/{cartId}/Compare/{itemId}` | cartId |
| Get compare item (nested) | GET | `/api/v2/CartService/Carts/{cartId}/Compare/{itemId}` | cartId |
| Remove from compare (nested) | DELETE | `/api/v2/CartService/Carts/{cartId}/Compare/{itemId}` | cartId |
| Item in compare? (nested) | GET | `/api/v2/CartService/Carts/{cartId}/Compare/Contains/{itemId}` | cartId |
| Add item to compare (flat) | POST | `/api/v2/CartService/Compare` | cartId |
| List compare items (flat) | GET | `/api/v2/CartService/Compare/{cartId}` | cartId |
| Get compare record details (flat) | GET | `/api/v2/CartService/Compare/{recordId}/Details` | cartId |
| Remove from compare by record ID (flat) | DELETE | `/api/v2/CartService/Compare/{recordId}` | cartId |
