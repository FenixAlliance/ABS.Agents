---
name: absuite-cart
description: >
  Manage shopping carts, cart lines, wish lists, and compare tables in the Alliance
  Business Suite (ABS) using the `absuite` CLI. Covers adding/removing items,
  updating quantities, submitting carts, managing wish lists, and product comparison.
  Requires an authenticated CLI session (use the `absuite-login` skill to authenticate first).
---

# Alliance Business Suite — Cart Skill

Manage shopping carts through the `absuite` CLI's `cart` service. Cart operations support guest, user, and tenant cart contexts.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite cart list-commands`

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

## Getting Carts

### Get Current User's Cart

```bash
absuite cart get user
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/UserCart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Acting Cart (Session Cart)

```bash
absuite cart get acting
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/ActingCart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Guest Cart

```bash
absuite cart get guest
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/GuestCart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Tenant's Default Cart

```bash
absuite cart get tenant --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/BusinessCart/$TENANT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Cart by ID

```bash
absuite cart get by-id --CartId <cart-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Adding Items to Cart

### Add Item by ID

```bash
absuite cart add-item-to --CartId <cart-guid> --ItemId <item-guid> --Quantity 2
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Items/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 2 }'
```

### Add Product with Tracking

```bash
absuite cart add-product-to --CartId <cart-guid> --ItemId <item-guid> --Quantity 1
```

**REST API equivalent:**
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

## Cart Lines

### List Cart Lines

```bash
absuite cart list lines --CartId <cart-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Cart Items

```bash
absuite cart list items --CartId <cart-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Items" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a Cart Line

```bash
absuite cart get line --CartId <cart-guid> --CartLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Lines/<line-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update a Cart Line

```bash
absuite cart update line --CartId <cart-guid> --CartLineId <line-guid> --CartLineUpdateDto '{...}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Lines/<line-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 3 }'
```

### Increase Cart Line Quantity

```bash
absuite cart convert-to-crease-cart-line --CartId <cart-guid> --CartLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Lines/<line-guid>/Increase" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Decrease Cart Line Quantity

```bash
absuite cart decrease-cart-line --CartId <cart-guid> --CartLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Lines/<line-guid>/Decrease" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Remove a Cart Line

```bash
absuite cart delete line --CartId <cart-guid> --CartLineId <line-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Lines/<line-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Cart Item Records

### Get Cart Record

```bash
absuite cart get item-cart-record --CartId <cart-guid> --CartRecordId <record-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Records/<record-guid>/Details" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Cart Record

```bash
absuite cart update item-cart-record --CartId <cart-guid> --CartRecordId <record-guid> --CartRecordUpdateDto '{...}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Records/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 5 }'
```

### Increase Item Quantity

```bash
absuite cart convert-to-crease-item-cart-record --CartId <cart-guid> --CartRecordId <record-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Records/<record-guid>/Increase" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Decrease Item Quantity

```bash
absuite cart decrease-item-cart-record --CartId <cart-guid> --CartRecordId <record-guid>
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Records/<record-guid>/Decrease" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Remove Item from Cart

```bash
absuite cart delete item-from --CartId <cart-guid> --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Items/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Remove Product by Record ID

```bash
absuite cart delete product-from-cart-by-record-id --CartId <cart-guid> --CartRecordId <record-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Records/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Check if Item Is in Cart

```bash
absuite cart is-item-already-in --CartId <cart-guid> --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Contains/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Cart Settings

### Get/Set Cart Country

```bash
absuite cart get country --CartId <cart-guid>
absuite cart set country --CartId <cart-guid> --CountryId USA
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Country" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Country" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "cartId": "<cart-guid>", "countryId": "USA" }'
```

### Get/Set Cart Currency

```bash
absuite cart get currency --CartId <cart-guid>
absuite cart set currency --CartId <cart-guid> --CurrencyId USD.USA
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Currency" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Currency" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "cartID": "<cart-guid>", "currencyID": "USD.USA" }'
```

### Update Cart

```bash
absuite cart update --CartId <cart-guid> --CartUpdateDto '{...}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "currencyId": "USD.USA", "countryId": "USA" }'
```

### Clear Cart

```bash
absuite cart clear --CartId <cart-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Items" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Submit Cart (Checkout)

```bash
absuite cart submit --CartId <cart-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Submit" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

This converts the cart into an order for processing.

## Wish Lists

### Create a Wish List

```bash
absuite cart create wish-list --CartId <cart-guid> --WishListCreateDto '{
  "Name": "Birthday Ideas"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Birthday Ideas", "cartID": "<cart-guid>" }'
```

### Get Wish Lists

```bash
absuite cart get wish-list --CartId <cart-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Wish List Details

```bash
absuite cart list wish-list-details --CartId <cart-guid> --WishListId <wishlist-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Add Item to Wish List

```bash
absuite cart add-item-to-wish-list --CartId <cart-guid> --WishListId <wishlist-guid> --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>/Records" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "wishListId": "<wishlist-guid>", "itemId": "<item-guid>" }'
```

### Add Product to Wish List

```bash
absuite cart add-product-to-wish-list --CartId <cart-guid> --WishListId <wishlist-guid> --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/WishLists/Records" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "wishListId": "<wishlist-guid>", "itemId": "<item-guid>" }'
```

### Get Wish List Items

```bash
absuite cart list wish-list-items --CartId <cart-guid> --WishListId <wishlist-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>/Records" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Wish List Item

```bash
absuite cart get wish-list-item --CartId <cart-guid> --WishListId <wishlist-guid> --WishListItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>/Records/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Wish List

```bash
absuite cart update item-to-wish-list --CartId <cart-guid> --WishListId <wishlist-guid> --WishListUpdateDto '{...}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Updated List", "description": "New description" }'
```

### Check if Item Is in Any Wish List

```bash
absuite cart is-item-in-wish-lists --CartId <cart-guid> --ItemId <item-guid>
absuite cart is-product-in-wish-lists --CartId <cart-guid> --ItemId <item-guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/Contains/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/WishLists/Contains" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Check Wish List Exists

```bash
absuite cart wish-list-exists --CartId <cart-guid> --WishListId <wishlist-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>/Exists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Delete Wish List

```bash
absuite cart delete wish-list --CartId <cart-guid> --WishListId <wishlist-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Delete Wish List Record

```bash
absuite cart delete wish-list-record --CartId <cart-guid> --WishListId <wishlist-guid> --WishListItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/WishLists/<wishlist-guid>/Records/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Compare Table

### Add Item to Compare Table

```bash
absuite cart add-item-to-compare-table --CartId <cart-guid> --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Compare/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Compare Records

```bash
absuite cart list compare-records --CartId <cart-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Compare" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Compare Record

```bash
absuite cart get compare-record --CartId <cart-guid> --CompareRecordId <record-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Compare/<record-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Check if Item Is in Compare Table

```bash
absuite cart is-item-in-compare-table --CartId <cart-guid> --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Compare/Contains/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Remove Item from Compare Table

```bash
absuite cart delete item-from-compare-table --CartId <cart-guid> --ItemId <item-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Compare/<item-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Calculate Cart

Calculate cart totals (subtotal, taxes, shipping, discounts) without submitting.

```bash
absuite cart calculate --CartId <cart-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Calculate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Checkout Cart

Initiate the checkout flow for a cart.

```bash
absuite cart checkout --CartId <cart-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>/Checkout" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Create and Delete Carts

### Create a New Cart

```bash
absuite cart create --CartCreateDto '{
  "currencyId": "USD.USA",
  "countryId": "USA"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CartService/Carts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "currencyId": "USD.USA", "countryId": "USA" }'
```

### Delete a Cart

```bash
absuite cart delete --CartId <cart-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CartService/Carts/<cart-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| Get user cart | `absuite cart get user` |
| Get tenant cart | `absuite cart get tenant --TenantId <guid>` |
| Add item | `absuite cart add-item-to --CartId <guid> --ItemId <guid> --Quantity 1` |
| List lines | `absuite cart list lines --CartId <guid>` |
| Remove line | `absuite cart delete line --CartId <guid> --CartLineId <guid>` |
| Clear cart | `absuite cart clear --CartId <guid>` |
| Submit cart | `absuite cart submit --CartId <guid>` |
| Set currency | `absuite cart set currency --CartId <guid> --CurrencyId USD.USA` |
| Create wish list | `absuite cart create wish-list --CartId <guid> --WishListCreateDto '{...}'` |
| Add to compare | `absuite cart add-item-to-compare-table --CartId <guid> --ItemId <guid>` |
| Calculate cart | `absuite cart calculate --CartId <guid>` |
| Checkout cart | `absuite cart checkout --CartId <guid>` |
| Create cart | `absuite cart create --CartCreateDto '{...}'` |
| Delete cart | `absuite cart delete --CartId <guid>` |

## Critical Rules

- **Authenticate first.** Use `absuite login` before any cart operation.
- **Get the cart first.** Use `get user`, `get tenant`, or `get by-id` to obtain the cart ID.
- **Use `submit` to checkout.** This converts the cart into an order.
- **Check item existence** before adding to avoid duplicates with `is-item-already-in`.

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v2/CartService/Carts/UserCart` | Get current user's cart |
| GET | `/api/v2/CartService/Carts/ActingCart` | Get acting/session cart |
| GET | `/api/v2/CartService/Carts/GuestCart` | Get guest cart |
| GET | `/api/v2/CartService/Carts/BusinessCart/:tenantId` | Get tenant cart |
| GET | `/api/v2/CartService/Carts/:cartId` | Get cart by ID |
| PUT | `/api/v2/CartService/Carts/:cartId` | Update cart |
| POST | `/api/v2/CartService/Carts` | Create a new cart |
| DELETE | `/api/v2/CartService/Carts/:cartId` | Delete a cart |
| POST | `/api/v2/CartService/Carts/:cartId/Calculate` | Calculate cart totals |
| POST | `/api/v2/CartService/Carts/:cartId/Checkout` | Initiate checkout |
| POST | `/api/v2/CartService/Carts/:cartId/Submit` | Submit cart (checkout) |
| GET | `/api/v2/CartService/Carts/:cartId/Items` | List cart items |
| DELETE | `/api/v2/CartService/Carts/:cartId/Items` | Clear cart |
| POST | `/api/v2/CartService/Carts/:cartId/Items/:itemId` | Add item to cart |
| PUT | `/api/v2/CartService/Carts/:cartId/Items/:itemId` | Update item in cart |
| DELETE | `/api/v2/CartService/Carts/:cartId/Items/:itemId` | Remove item from cart |
| PUT | `/api/v2/CartService/Carts/:cartId/Items/:itemId/Increase` | Increase item qty |
| PUT | `/api/v2/CartService/Carts/:cartId/Items/:itemId/Decrease` | Decrease item qty |
| GET | `/api/v2/CartService/Carts/:cartId/Lines` | List cart lines |
| GET | `/api/v2/CartService/Carts/:cartId/Lines/:lineId` | Get cart line |
| PUT | `/api/v2/CartService/Carts/:cartId/Lines/:lineId` | Update cart line |
| DELETE | `/api/v2/CartService/Carts/:cartId/Lines/:lineId` | Remove cart line |
| PUT | `/api/v2/CartService/Carts/:cartId/Lines/:lineId/Increase` | Increase line qty |
| PUT | `/api/v2/CartService/Carts/:cartId/Lines/:lineId/Decrease` | Decrease line qty |
| GET | `/api/v2/CartService/Carts/:cartId/Country` | Get cart country |
| PUT | `/api/v2/CartService/Carts/:cartId/Country` | Set cart country |
| GET | `/api/v2/CartService/Carts/:cartId/Currency` | Get cart currency |
| PUT | `/api/v2/CartService/Carts/:cartId/Currency` | Set cart currency |
| GET | `/api/v2/CartService/Carts/:cartId/Contains/:itemId` | Check item in cart |
| POST | `/api/v2/CartService/Records` | Add product with tracking |
| GET | `/api/v2/CartService/Records/:cartId` | Get cart records |
| PUT | `/api/v2/CartService/Records/:recordId` | Update cart record |
| DELETE | `/api/v2/CartService/Records/:recordId` | Delete cart record |
| GET | `/api/v2/CartService/Records/:recordId/Details` | Get record details |
| PUT | `/api/v2/CartService/Records/:recordId/Increase` | Increase record qty |
| PUT | `/api/v2/CartService/Records/:recordId/Decrease` | Decrease record qty |
| GET | `/api/v2/CartService/Records/IsInCart` | Check item in cart |
| POST | `/api/v2/CartService/Records/AddItem` | Add item |
| POST | `/api/v2/CartService/Records/ClearCart` | Clear cart |
| POST | `/api/v2/CartService/Carts/:cartId/WishLists` | Create wish list |
| GET | `/api/v2/CartService/Carts/:cartId/WishLists` | List wish lists |
| GET | `/api/v2/CartService/Carts/:cartId/WishLists/:wishListId` | Get wish list |
| PUT | `/api/v2/CartService/Carts/:cartId/WishLists/:wishListId` | Update wish list |
| DELETE | `/api/v2/CartService/Carts/:cartId/WishLists/:wishListId` | Delete wish list |
| HEAD | `/api/v2/CartService/Carts/:cartId/WishLists/:wishListId/Exists` | Check wish list exists |
| POST | `/api/v2/CartService/Carts/:cartId/WishLists/:wishListId/Records` | Add to wish list |
| GET | `/api/v2/CartService/Carts/:cartId/WishLists/:wishListId/Records` | List wish list items |
| GET | `/api/v2/CartService/Carts/:cartId/WishLists/:wishListId/Records/:recordId` | Get wish list item |
| DELETE | `/api/v2/CartService/Carts/:cartId/WishLists/:wishListId/Records/:recordId` | Remove wish list item |
| GET | `/api/v2/CartService/Carts/:cartId/WishLists/Contains/:itemId` | Item in wish lists? |
| GET | `/api/v2/CartService/Carts/:cartId/Compare` | List compare items |
| POST | `/api/v2/CartService/Carts/:cartId/Compare/:itemId` | Add to compare |
| GET | `/api/v2/CartService/Carts/:cartId/Compare/:itemId` | Get compare item |
| DELETE | `/api/v2/CartService/Carts/:cartId/Compare/:itemId` | Remove from compare |
| GET | `/api/v2/CartService/Carts/:cartId/Compare/Contains/:itemId` | Item in compare? |
| POST | `/api/v2/CartService/WishLists` | Create wish list (alt) |
| GET | `/api/v2/CartService/WishLists/:cartId` | Get wish lists (alt) |
| PUT | `/api/v2/CartService/WishLists/:wishListId` | Update wish list (alt) |
| DELETE | `/api/v2/CartService/WishLists/:wishListId` | Delete wish list (alt) |
| POST | `/api/v2/CartService/WishLists/Records` | Add to wish list (alt) |
| DELETE | `/api/v2/CartService/WishLists/Records/:recordId` | Remove record (alt) |
| GET | `/api/v2/CartService/WishLists/Contains` | Product in wish lists? |
| GET | `/api/v2/CartService/WishLists/Exists` | Wish list exists? |
| POST | `/api/v2/CartService/Compare` | Add to compare (alt) |
| GET | `/api/v2/CartService/Compare/:cartId` | List compare (alt) |
| DELETE | `/api/v2/CartService/Compare/:recordId` | Remove compare (alt) |
| GET | `/api/v2/CartService/Compare/:recordId/Details` | Compare details (alt) |