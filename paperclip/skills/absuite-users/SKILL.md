---
name: absuite-users
description: >
  Manage the current user's profile, avatar, settings, addresses, enrollments,
  tenants, social profile, cart, wallet, followers, follows, notifications, and
  user options in the Alliance Business Suite (ABS) using the `absuite` CLI.
  Requires an authenticated CLI session.
---

# Alliance Business Suite — Users Skill

Manage the current user's account through the `absuite` CLI's `users` service. Most operations apply to the currently authenticated user.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Discover commands**: `absuite users list-commands`

## REST API Authentication

All REST examples below assume a valid bearer token. To obtain one:

1. **Obtain bearer token**: `POST $ABSUITE_HOST_URL/login` with `{"email":"...","password":"..."}`
2. **Use in requests**: `-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"`
3. **Base URL**: `$ABSUITE_HOST_URL/api/v2/`

## Current User Profile

```bash
# Get my profile
absuite users get current-user

# Get my extended profile (with related data)
absuite users get current-extended-user

# Update my profile
absuite users update current-user --AccountHolderUpdateDto '{
  "FirstName": "Jane",
  "LastName": "Doe",
  "PhoneNumber": "+1-555-0199"
}'

# Patch (partial update)
absuite users patch current-user --AccountHolderPatchDto '{
  "PhoneNumber": "+1-555-0200"
}'
```

**REST API equivalent:**
```bash
# Get my profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get extended profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update profile (full)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Jane", "lastName": "Doe", ...}'

# Patch profile (partial)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1-555-0200"}'
```

## Avatar

```bash
# Get my avatar
absuite users get avatar

# Update my avatar
absuite users update avatar --Avatar @/path/to/avatar.png
```

**REST API equivalent:**
```bash
# Get avatar
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Avatar" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update avatar
curl -X POST "$ABSUITE_HOST_URL/api/v2/Me/Avatar" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: multipart/form-data" -F "file=@/path/to/avatar.png"
```

## Cart, Wallet, Social Profile

```bash
# Get my cart
absuite users get cart

# Get my wallet
absuite users get wallet

# Get my social profile
absuite users get social-profile
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Cart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Wallet" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/SocialProfile" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Tenant Memberships

```bash
# List my tenants
absuite users list tenants

# Count my tenants
absuite users count tenants
```

**REST API equivalent:**
```bash
# List tenants
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count tenants
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Tenants/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Extended tenants (with related data)
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Tenants/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Enrollments

```bash
# List my enrollments
absuite users list enrollments

# Count my enrollments
absuite users count enrollments
```

**REST API equivalent:**
```bash
# List enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get enrollment by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Enrollments/$ENROLLMENT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Extended enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Enrollments/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Invitations

```bash
# List my tenant enrollment invitations
absuite users list invitations
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Invitations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Followers & Follows

```bash
# My followers
absuite users list followers
absuite users count followers

# Who I follow
absuite users list follows
absuite users count follows
```

**REST API equivalent:**
```bash
# Followers
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Followers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Followers/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Follows
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Follows" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Follows/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Notifications

```bash
absuite users list notifications
absuite users count notifications
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Notifications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Notifications/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Addresses

```bash
absuite users list addresses
absuite users count addresses
absuite users get address --AddressId <address-guid>
absuite users create address --AddressCreateDto '{
  "Line1": "123 Main St",
  "City": "Portland",
  "State": "OR",
  "PostalCode": "97201",
  "CountryId": "USA"
}'
absuite users update address --AddressId <address-guid> --AddressUpdateDto '{...}'
absuite users delete address --AddressId <address-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Addresses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## User Settings

```bash
absuite users get settings
absuite users update settings --UserSettingsUpdateDto '{...}'
```

**REST API equivalent:**
```bash
# Get settings
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Settings" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update settings
curl -X PUT "$ABSUITE_HOST_URL/api/v2/Me/Settings" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
```

## User Options (Key-Value)

```bash
absuite users list options
absuite users count options
absuite users get option-by-id --OptionId <option-guid>
absuite users get option-by-key --Key "ui.theme"
absuite users create option --UserOptionCreateDto '{
  "Key": "ui.theme",
  "Value": "dark"
}'
absuite users update option --OptionId <option-guid> --UserOptionUpdateDto '{
  "Value": "light"
}'
absuite users upsert option --Key "ui.theme" --UserOptionUpdateDto '{"Value": "dark"}'
absuite users delete option --OptionId <option-guid>
```

**REST API equivalent:**
```bash
# List / Count / Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Options/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Options/$OPTION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by key
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Options/Key/ui.theme" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create / Update / Delete
curl -X POST "$ABSUITE_HOST_URL/api/v2/Me/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"key": "ui.theme", "value": "dark"}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/Me/Options/$OPTION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"value": "light"}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/Me/Options/$OPTION_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Upsert by key
curl -X PUT "$ABSUITE_HOST_URL/api/v2/Me/Options/Upsert/ui.theme" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"value": "dark"}'
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| Get my profile | `absuite users get current-user` |
| Update my profile | `absuite users update current-user --AccountHolderUpdateDto '{...}'` |
| Get my avatar | `absuite users get avatar` |
| Update avatar | `absuite users update avatar --Avatar @/path/to/avatar.png` |
| My tenants | `absuite users list tenants` |
| My enrollments | `absuite users list enrollments` |
| My followers | `absuite users list followers` |
| My notifications | `absuite users list notifications` |
| My addresses | `absuite users list addresses` |
| My settings | `absuite users get settings` |
| Upsert option | `absuite users upsert option --Key <key> --UserOptionUpdateDto '{...}'` |

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/Me` | Get current user profile |
| PUT | `/api/v2/Me` | Update profile (full) |
| PATCH | `/api/v2/Me` | Patch profile (partial) |
| GET | `/api/v2/Me/Extended` | Get extended profile |
| GET | `/api/v2/Me/Avatar` | Get avatar |
| POST | `/api/v2/Me/Avatar` | Update avatar |
| GET | `/api/v2/Me/Cart` | Get cart |
| GET | `/api/v2/Me/Wallet` | Get wallet |
| GET | `/api/v2/Me/SocialProfile` | Get social profile |
| GET | `/api/v2/Me/Addresses` | List addresses |
| GET | `/api/v2/Me/Tenants` | List my tenants |
| GET | `/api/v2/Me/Tenants/Count` | Count my tenants |
| GET | `/api/v2/Me/Tenants/Extended` | Extended tenant list |
| GET | `/api/v2/Me/Enrollments` | List enrollments |
| GET | `/api/v2/Me/Enrollments/:id` | Get enrollment by ID |
| GET | `/api/v2/Me/Enrollments/Extended` | Extended enrollments |
| GET | `/api/v2/Me/Invitations` | List invitations |
| GET | `/api/v2/Me/Followers` | List followers |
| GET | `/api/v2/Me/Followers/Count` | Count followers |
| GET | `/api/v2/Me/Follows` | List follows |
| GET | `/api/v2/Me/Follows/Count` | Count follows |
| GET | `/api/v2/Me/Notifications` | List notifications |
| GET | `/api/v2/Me/Notifications/Count` | Count notifications |
| GET | `/api/v2/Me/Settings` | Get user settings |
| PUT | `/api/v2/Me/Settings` | Update settings |
| POST | `/api/v2/Me/Options` | Create option |
| GET | `/api/v2/Me/Options` | List options |
| GET | `/api/v2/Me/Options/Count` | Count options |
| GET | `/api/v2/Me/Options/:optionId` | Get option by ID |
| PUT | `/api/v2/Me/Options/:optionId` | Update option |
| DELETE | `/api/v2/Me/Options/:optionId` | Delete option |
| GET | `/api/v2/Me/Options/Key/:key` | Get option by key |
| PUT | `/api/v2/Me/Options/Upsert/:key` | Upsert option by key |

## Critical Rules

- **Authenticate first.**
- **User service is self-scoped** — all operations apply to the current user (not arbitrary users; use `system` service for admin user management).
- **Use `upsert option`** for idempotent key-value preference updates.
