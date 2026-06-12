---
name: absuite-users
description: >
  Read and manage the current user's account in the Alliance Business Suite (ABS)
  via the REST API. Covers the `/api/v2/Me` surface — profile, extended profile,
  avatar, settings, addresses, cart, wallet, social profile, followers/follows,
  notifications, tenant memberships, enrollments, invitations, and user options
  (key-value metadata) — including atomic PATCH (JSON Patch) updates. These endpoints
  are USER-scoped (resolved from the bearer token); they take NO tenantId. Requires
  a bearer token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Users Skill (REST)

Read and manage the **current user's** account through the ABS REST API. Every endpoint
in this skill lives under `/api/v2/Me/...` and is **user-scoped**: the acting user is
resolved from the bearer token (JWT). These endpoints take **no `tenantId`** — do **not**
add `?tenantId=` or an `X-TenantId` header; it is ignored. Operations apply to the
currently authenticated user, never to an arbitrary user.

> For the CLI equivalent see `absuite-users-cli`; for general REST conventions
> (envelope, JSON Patch, headers) see `absuite-rest`; for authentication, registration,
> password reset, 2FA, email confirmation, and token refresh see `absuite-login`.

## Authentication

1. **Obtain a bearer token:**
```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<your-email>", "password": "<your-password>"}'
```
Extract `accessToken` from the response and export it:
```bash
export ABSUITE_ACCESS_TOKEN="<accessToken-from-response>"
```

2. **Send the token on every subsequent request:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/Me/...`

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
Always check `isSuccess`; read the payload from `result` (an object, an array, an int for
`Count`, or `null` for write operations that return an empty envelope).

5. **Optional API-version selector** — every endpoint accepts an optional `?api-version=`
   query param (or an `x-api-version` request header). Omit it to use the default version.

## Key Concepts

- **Me** — the currently authenticated user, resolved from the bearer token. There is no
  user-id path segment; `/api/v2/Me` always means "the caller".
- **No tenant scoping** — these endpoints are user-scoped, not tenant-scoped. Passing a
  `tenantId` has no effect. (The tenant memberships an endpoint reports are derived from the
  user's enrollments, not from a request parameter.)
- **Profile** (`UserUpdateDto`) — the editable user profile. The two enum fields are
  `gender`: **`Unknown` | `Male` | `Female` | `PreferNotToSay`** and
  `availability`: **`DND` | `Busy` | `Away` | `Offline` | `Available`** (string values).
- **Extended profile** (`/Me/Extended`) — the profile enriched with related data.
- **Settings** (`UserSettingsUpdateDto`) — display preferences. `siteTheme` is the enum
  **`System` | `Light` | `Dark`**. `dateFormat`, `currencyFormat`, `dateTimeFormat`, and
  `siteTheme` are **required** on update; `pageSize` is an integer.
- **Tenant** vs **Enrollment** — a *tenant* is an organization the user belongs to; an
  *enrollment* (`TenantEnrollment`) is the membership record linking the user to a tenant.
  Both have plain and `/Extended` (related-data) variants.
- **Invitation** — a pending tenant-enrollment invitation addressed to the user.
- **Option** (`OptionCreateDto` / `OptionUpdateDto`) — a per-user key-value setting.
  Fields: `key` (req on create), `value` (req on create), `portalId`, `frozen`, `autoload`,
  `transient`, `expiration` (integer). Options can be scoped to a portal via the optional
  `portalId` query param / body field. Use **Upsert by key** for idempotent writes.
- **Social graph** — `Followers` (who follows me) and `Follows` (who I follow), each with a
  `/Count`.

## Current User Profile

```bash
# Get my profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get my extended profile (with related data)
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update my profile (full replace — PUT, UserUpdateDto)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qualifiedName": "jane.doe",
    "firstName": "Jane",
    "lastName": "Doe",
    "publicName": "Jane Doe",
    "birthday": "1990-01-01T00:00:00Z",
    "gender": "Female",
    "email": "<your-email>",
    "about": "Product manager.",
    "status": "Working remotely",
    "jobTitle": "Product Manager",
    "timezoneId": "<timezone-id>",
    "languageId": "<language-id>",
    "currencyId": "<currency-id>",
    "countryId": "<country-id>",
    "stateId": "<state-id>",
    "cityId": "<city-id>",
    "gitHubUrl": "https://github.com/example",
    "websiteUrl": "https://example.com",
    "twitterUrl": "https://x.com/example",
    "facebookUrl": "https://facebook.com/example",
    "youTubeUrl": "https://youtube.com/@example",
    "linkedInUrl": "https://linkedin.com/in/example",
    "instagramUrl": "https://instagram.com/example",
    "webUrl": "https://example.com",
    "availability": "Available"
  }'
```

Full editable field list for `UserUpdateDto` (all optional on PUT): `qualifiedName`,
`birthday`, `firstName`, `lastName`, `publicName`, `idProvider`, `gender`, `email`,
`about`, `status`, `jobTitle`, `timezoneId`, `languageId`, `currencyId`, `countryId`,
`stateId`, `cityId`, `gitHubUrl`, `websiteUrl`, `twitterUrl`, `facebookUrl`, `youTubeUrl`,
`linkedInUrl`, `instagramUrl`, `webUrl`, `availability`.

### Patch my profile (partial — PATCH, JSON Patch)

`PATCH /api/v2/Me` takes a **JSON Patch** array (RFC 6902), not a partial DTO. Use it to
change a few fields without resending the whole profile (see the [PATCH](#patch-json-patch)
section below):

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/jobTitle", "value": "Senior Product Manager" },
    { "op": "replace", "path": "/availability", "value": "Busy" }
  ]'
```

## Avatar

```bash
# Get my avatar (binary image stream)
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Avatar" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" --output avatar.png

# Update my avatar (multipart upload)
curl -X POST "$ABSUITE_HOST_URL/api/v2/Me/Avatar" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "avatar=@/path/to/avatar.png"
```

> Avatar upload is `multipart/form-data`. The generated client names the file part
> `avatar`; if the upload is rejected, retry with the part named `file`.

## Cart, Wallet, Social Profile

```bash
# Get my cart
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Cart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get my wallet (billing profile)
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Wallet" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get my social profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/SocialProfile" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Addresses

```bash
# List my addresses
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Addresses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

> Only the list (`GET /api/v2/Me/Addresses`) exists on this surface. There is no
> count / get-by-id / create / update / delete for addresses here.

## User Settings

```bash
# Get my settings
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Settings" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update my settings (PUT, UserSettingsUpdateDto — dateFormat, currencyFormat,
# dateTimeFormat, siteTheme are required)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/Me/Settings" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pageSize": 25,
    "dateFormat": "yyyy-MM-dd",
    "currencyFormat": "#,##0.00",
    "dateTimeFormat": "yyyy-MM-dd HH:mm",
    "siteTheme": "Dark"
  }'
```

## Tenant Memberships

```bash
# List the tenants I'm enrolled in
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count my tenants
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Tenants/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Extended tenants (with related data)
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Tenants/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Enrollments

```bash
# List my enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Extended enrollments (with related data)
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Enrollments/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a single enrollment by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Enrollments/<enrollment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Invitations

```bash
# List my pending tenant-enrollment invitations
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Invitations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Followers & Follows

```bash
# Social profiles that follow me
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Followers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Followers/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Social profiles I follow
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Follows" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Follows/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Notifications

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Notifications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Notifications/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## User Options (Key-Value)

Per-user key-value settings, optionally scoped to a portal via `?portalId=<portal-guid>`.

```bash
# List my options (optionally ?portalId=<portal-guid>)
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count my options
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Options/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get an option by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get an option by key (optionally ?portalId=<portal-guid>)
curl -X GET "$ABSUITE_HOST_URL/api/v2/Me/Options/Key/ui.theme" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create an option — key is a REQUIRED query param; body is OptionCreateDto
# (key and value are required body fields)
curl -X POST "$ABSUITE_HOST_URL/api/v2/Me/Options?key=ui.theme" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "ui.theme",
    "value": "dark",
    "portalId": "<portal-guid>",
    "frozen": false,
    "autoload": true,
    "transient": false,
    "expiration": 0
  }'

# Update an option by ID (PUT, OptionUpdateDto)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/Me/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "key": "ui.theme", "value": "light", "autoload": true }'

# Upsert an option by key (PUT, OptionUpdateDto — key is a path segment)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/Me/Options/Upsert/ui.theme" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "value": "dark" }'

# Patch an option by ID (PATCH, JSON Patch — see PATCH section)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/Me/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/value", "value": "light" } ]'

# Delete an option by ID
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/Me/Options/<option-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`OptionCreateDto` fields: `id`, `timestamp`, `key` (REQ), `value` (REQ), `portalId`,
`frozen`, `autoload`, `transient`, `expiration` (int).
`OptionUpdateDto` fields: `key`, `value`, `portalId`, `frozen`, `autoload`, `transient`,
`expiration` (int).

## PATCH (JSON Patch)

Two endpoints accept partial atomic updates via **JSON Patch (RFC 6902)**:

| Resource | Endpoint |
|---|---|
| Current user's profile | `PATCH /api/v2/Me` |
| A user option | `PATCH /api/v2/Me/Options/{optionId}` |

The request body is a JSON **array** of operations, `Content-Type: application/json`.
`op` ∈ `add | remove | replace | move | copy | test`; `path`/`from` are JSON-Pointer
(leading `/`, camelCase field names matching the DTO). Example on the profile:

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/status", "value": "On vacation" },
    { "op": "replace", "path": "/availability", "value": "Away" }
  ]'
```

PUT replaces the whole object; PATCH changes only the listed paths — safer under concurrent
edits.

## End-to-End Workflow

```bash
# 1. Authenticate
TOKEN=$(curl -s -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"<your-email>","password":"<your-password>"}' | jq -r '.accessToken')
export ABSUITE_ACCESS_TOKEN="$TOKEN"

# 2. Read who I am and which tenants I belong to
curl -s -X GET "$ABSUITE_HOST_URL/api/v2/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -s -X GET "$ABSUITE_HOST_URL/api/v2/Me/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 3. Patch a couple of profile fields (atomic)
curl -s -X PATCH "$ABSUITE_HOST_URL/api/v2/Me" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/jobTitle", "value": "Director" } ]'

# 4. Set my UI theme as a durable preference (upsert by key)
curl -s -X PUT "$ABSUITE_HOST_URL/api/v2/Me/Options/Upsert/ui.theme" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "value": "dark" }'

# 5. Apply matching display settings
curl -s -X PUT "$ABSUITE_HOST_URL/api/v2/Me/Settings" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "pageSize": 25, "dateFormat": "yyyy-MM-dd", "currencyFormat": "#,##0.00", "dateTimeFormat": "yyyy-MM-dd HH:mm", "siteTheme": "Dark" }'
```

## API Endpoints Quick Reference

| Action | Method | Path |
|--------|--------|------|
| Get current user | GET | `/api/v2/Me` |
| Update current user (full) | PUT | `/api/v2/Me` |
| Patch current user (JSON Patch) | PATCH | `/api/v2/Me` |
| Get extended profile | GET | `/api/v2/Me/Extended` |
| Get avatar | GET | `/api/v2/Me/Avatar` |
| Update avatar | POST | `/api/v2/Me/Avatar` |
| Get cart | GET | `/api/v2/Me/Cart` |
| Get wallet (billing profile) | GET | `/api/v2/Me/Wallet` |
| Get social profile | GET | `/api/v2/Me/SocialProfile` |
| List addresses | GET | `/api/v2/Me/Addresses` |
| Get settings | GET | `/api/v2/Me/Settings` |
| Update settings | PUT | `/api/v2/Me/Settings` |
| List my tenants | GET | `/api/v2/Me/Tenants` |
| Count my tenants | GET | `/api/v2/Me/Tenants/Count` |
| List my tenants (extended) | GET | `/api/v2/Me/Tenants/Extended` |
| List my enrollments | GET | `/api/v2/Me/Enrollments` |
| List my enrollments (extended) | GET | `/api/v2/Me/Enrollments/Extended` |
| Get enrollment by ID | GET | `/api/v2/Me/Enrollments/{enrollmentId}` |
| List my invitations | GET | `/api/v2/Me/Invitations` |
| List followers | GET | `/api/v2/Me/Followers` |
| Count followers | GET | `/api/v2/Me/Followers/Count` |
| List follows | GET | `/api/v2/Me/Follows` |
| Count follows | GET | `/api/v2/Me/Follows/Count` |
| List notifications | GET | `/api/v2/Me/Notifications` |
| Count notifications | GET | `/api/v2/Me/Notifications/Count` |
| List options | GET | `/api/v2/Me/Options` |
| Count options | GET | `/api/v2/Me/Options/Count` |
| Create option | POST | `/api/v2/Me/Options` |
| Get option by ID | GET | `/api/v2/Me/Options/{optionId}` |
| Update option | PUT | `/api/v2/Me/Options/{optionId}` |
| Patch option (JSON Patch) | PATCH | `/api/v2/Me/Options/{optionId}` |
| Delete option | DELETE | `/api/v2/Me/Options/{optionId}` |
| Get option by key | GET | `/api/v2/Me/Options/Key/{key}` |
| Upsert option by key | PUT | `/api/v2/Me/Options/Upsert/{key}` |

## Critical Rules

- **Authenticate first** (see `absuite-login`). Send `Authorization: Bearer …` on every call.
- **No tenant scoping.** These `/Me/*` endpoints resolve the user from the JWT — do **not**
  add `?tenantId=` or `X-TenantId`; it is ignored.
- **All operations apply to the current user**, never to an arbitrary user. There is no
  user-id path segment here; for admin user management use the platform's admin/system
  surface, not this skill.
- **PUT replaces, PATCH amends.** PATCH bodies are JSON Patch arrays (RFC 6902), not partial
  DTOs; only `/api/v2/Me` and `/api/v2/Me/Options/{optionId}` support PATCH.
- **Option create requires `key` both as a query param (`?key=`) and as a body field**, and
  `value` is required in the body. Use **Upsert by key** for idempotent preference writes.
