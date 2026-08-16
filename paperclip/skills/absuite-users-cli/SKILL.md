---
name: absuite-users-cli
description: >
  Read and manage the current user's account in the Alliance Business Suite (ABS)
  using the `absuite` CLI. Covers the `/Me` surface — profile, extended profile,
  avatar, settings, addresses, cart, wallet, social profile, followers/follows,
  notifications, tenant memberships, enrollments, invitations, and user options
  (key-value metadata) — via get/list/count/create/update/delete commands and
  service actions. These operations are user-scoped (resolved from your session);
  they take NO tenant. Requires an authenticated CLI session (see absuite-login-cli).
  For atomic PATCH updates or raw HTTP, use the absuite-users (REST) skill.
---

# Alliance Business Suite — Users Skill (CLI)

Read and manage the **current user's** account through the `absuite` CLI's `users`
service. Every command here targets the `/Me` surface and is **user-scoped**: the acting
user is resolved from your authenticated session. These commands take **no tenant** — do
**not** pass `--TenantId`. The CLI does not support PATCH (JSON Patch); for partial atomic
updates use the `absuite-users` REST skill.

> **Scope note:** the `users` CLI surfaces the **current-user (`/Me`)** read/update
> operations and the user **Options** key-value CRUD. There is no command for an arbitrary
> user — everything applies to "me". For authentication, registration, password reset, 2FA,
> email confirmation, and token refresh, use `absuite-login-cli`. Always confirm availability
> with `absuite users list-commands`.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-users` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-users` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general CLI
   usage and configuration, see `absuite-cli`.
2. **No tenant needed** — `/Me` commands resolve the user from your session; do **not** pass
   `--TenantId`.
3. **Discover commands:**
   ```powershell
   absuite users list-commands
   absuite users Get-CurrentUserAsync --help
   ```

## Command Structure

```
absuite users <Function-Name> --Param value
```

- The `users` CLI uses the canonical PowerShell **function-name** form directly (the
  generated client does not expose short `<verb> <entity>` aliases for this service). Each
  function maps to a PowerShell-approved verb:
  - **read (single/list/count):** `Get-...` (e.g. `Get-CurrentUserAsync`) and
    `Invoke-Count...Async` for counts.
  - **create:** `New-...` (e.g. `New-UserOption`).
  - **update (PUT):** `Update-...` (e.g. `Update-CurrentUserAsync`).
  - **delete:** `Invoke-Delete...` (e.g. `Invoke-DeleteUserOption`).
  - **upsert:** `Invoke-Upsert...` (e.g. `Invoke-UpsertUserOption`).
- **JSON DTO params** are passed as a single-quoted JSON string (`--<Dto> '{...}'`) using the
  **same PascalCase field names** as the DTO model.
- Every command also accepts the optional `--ApiVersion <version>` selector. Omit it for the
  default.

## Key Concepts

- **Current user (`/Me`)** — the acting user, resolved from your session. No user-id
  parameter; every command means "me".
- **No tenant scoping** — do not pass `--TenantId`.
- **Profile** (`UserUpdateDto`) — editable fields include `FirstName`, `LastName`,
  `PublicName`, `QualifiedName`, `Birthday`, `IdProvider`, `Email`, `About`, `Status`,
  `JobTitle`, `TimezoneId`, `LanguageId`, `CurrencyId`, `CountryId`, `StateId`, `CityId`,
  the social URL fields (`GitHubUrl`, `WebsiteUrl`, `TwitterUrl`, `FacebookUrl`, `YouTubeUrl`,
  `LinkedInUrl`, `InstagramUrl`, `WebUrl`), plus two enums: `Gender`
  (**`Unknown` | `Male` | `Female` | `PreferNotToSay`**) and `Availability`
  (**`DND` | `Busy` | `Away` | `Offline` | `Available`**).
- **Settings** (`UserSettingsUpdateDto`) — `PageSize` (int), and the required `DateFormat`,
  `CurrencyFormat`, `DateTimeFormat`, and `SiteTheme` (**`System` | `Light` | `Dark`**).
- **Tenant** vs **Enrollment** — a *tenant* is an org you belong to; an *enrollment* is the
  membership record. Both have plain and `Extended` (related-data) variants.
- **Option** (`OptionCreateDto` / `OptionUpdateDto`) — a per-user key-value setting:
  `Key`, `Value`, `PortalId`, `Frozen`, `Autoload`, `Transient`, `Expiration` (int). Options
  can be scoped to a portal via `--PortalId`. Use **Upsert** for idempotent writes.

## Current User Profile

```powershell
# Get my profile
absuite users Get-CurrentUserAsync

# Get my extended profile (with related data)
absuite users Get-ExtendedCurrentUserAsync

# Update my profile (full replace — UserUpdateDto)
absuite users Update-CurrentUserAsync --UserUpdateDto '{
  "FirstName": "Jane",
  "LastName": "Doe",
  "PublicName": "Jane Doe",
  "JobTitle": "Product Manager",
  "Gender": "Female",
  "Availability": "Available"
}'
```

> Partial profile updates (PATCH / JSON Patch) are **not** available in the CLI — use the
> `absuite-users` REST skill for those.

## Avatar

```powershell
# Get my avatar (writes the returned file)
absuite users Get-CurrentUserAvatarAsync

# Update my avatar (file upload)
absuite users Update-AvatarAsync --Avatar /path/to/avatar.png
```

## Cart, Wallet, Social Profile

```powershell
absuite users Get-CurrentUserCartAsync
absuite users Get-CurrentUserWalletAsync          # billing profile
absuite users Get-CurrentUserSocialProfileAsync
```

## Addresses

```powershell
# List my addresses (list only — no create/update/delete on this surface)
absuite users Get-CurrentUserAddressesAsync
```

## User Settings

```powershell
# Get my settings
absuite users Get-CurrentUserSettingsAsync

# Update my settings (UserSettingsUpdateDto — DateFormat, CurrencyFormat,
# DateTimeFormat, SiteTheme are required)
absuite users Update-CurrentUserSettingsAsync --UserSettingsUpdateDto '{
  "PageSize": 25,
  "DateFormat": "yyyy-MM-dd",
  "CurrencyFormat": "#,##0.00",
  "DateTimeFormat": "yyyy-MM-dd HH:mm",
  "SiteTheme": "Dark"
}'
```

## Tenant Memberships

```powershell
# List the tenants I'm enrolled in
absuite users Get-CurrentUserTenantsAsync

# Count my tenants
absuite users Invoke-CountCurrentUserTenantsAsync

# Extended tenants (with related data)
absuite users Get-CurrentUserTenantsExtendedAsync
```

## Enrollments

```powershell
# List my enrollments
absuite users Get-CurrentUserEnrollmentsAsync

# Extended enrollments (with related data)
absuite users Get-CurrentUserEnrollmentsExtendedAsync

# Get a single enrollment by ID
absuite users Get-EnrollmentAsync --EnrollmentId <enrollment-guid>
```

## Invitations

```powershell
# List my pending tenant-enrollment invitations
absuite users Get-CurrentUserInvitationAsync
```

## Followers & Follows

```powershell
# Social profiles that follow me
absuite users Get-CurrentUserFollowersAsync
absuite users Invoke-CountCurrentUserFollowersAsync

# Social profiles I follow
absuite users Get-CurrentUserFollowsAsync
absuite users Invoke-CountCurrentUserFollowsAsync
```

## Notifications

```powershell
absuite users Get-CurrentUserNotificationsAsync
absuite users Invoke-CountCurrentUserNotificationsAsync
```

## User Options (Key-Value)

Per-user key-value settings, optionally scoped to a portal via `--PortalId <portal-guid>`.

```powershell
# List my options (optionally --PortalId <portal-guid>)
absuite users Get-UserOptions

# Count my options
absuite users Get-UserOptionsCount

# Get an option by ID
absuite users Get-UserOptionById --OptionId <option-guid>

# Get an option by key
absuite users Get-UserOptionByKey --Key "ui.theme"

# Create an option (Key is a required param; OptionCreateDto carries Key + Value)
absuite users New-UserOption --Key "ui.theme" --OptionCreateDto '{
  "Key": "ui.theme",
  "Value": "dark",
  "Autoload": true
}'

# Update an option by ID (OptionUpdateDto)
absuite users Update-UserOption --OptionId <option-guid> --OptionUpdateDto '{
  "Key": "ui.theme",
  "Value": "light"
}'

# Upsert an option by key (idempotent)
absuite users Invoke-UpsertUserOption --Key "ui.theme" --OptionUpdateDto '{
  "Value": "dark"
}'

# Delete an option by ID
absuite users Invoke-DeleteUserOption --OptionId <option-guid>
```

`OptionCreateDto` fields: `Id`, `Timestamp`, `Key`, `Value`, `PortalId`, `Frozen`,
`Autoload`, `Transient`, `Expiration` (int). `OptionUpdateDto` fields: `Key`, `Value`,
`PortalId`, `Frozen`, `Autoload`, `Transient`, `Expiration` (int).

## End-to-End Workflow

```powershell
# 1. Authenticate (see absuite-login-cli)
absuite login

# 2. Read who I am and which tenants I belong to
absuite users Get-CurrentUserAsync
absuite users Get-CurrentUserTenantsAsync

# 3. Update a couple of profile fields
absuite users Update-CurrentUserAsync --UserUpdateDto '{ "JobTitle": "Director", "Availability": "Busy" }'

# 4. Set my UI theme as a durable preference (idempotent upsert)
absuite users Invoke-UpsertUserOption --Key "ui.theme" --OptionUpdateDto '{ "Value": "dark" }'

# 5. Apply matching display settings
absuite users Update-CurrentUserSettingsAsync --UserSettingsUpdateDto '{ "PageSize": 25, "DateFormat": "yyyy-MM-dd", "CurrencyFormat": "#,##0.00", "DateTimeFormat": "yyyy-MM-dd HH:mm", "SiteTheme": "Dark" }'
```

## CLI Commands Quick Reference

| Action | CLI command |
|--------|-------------|
| Get current user | `absuite users Get-CurrentUserAsync` |
| Get extended profile | `absuite users Get-ExtendedCurrentUserAsync` |
| Update current user | `absuite users Update-CurrentUserAsync --UserUpdateDto '{...}'` |
| Get avatar | `absuite users Get-CurrentUserAvatarAsync` |
| Update avatar | `absuite users Update-AvatarAsync --Avatar /path/to/avatar.png` |
| Get cart | `absuite users Get-CurrentUserCartAsync` |
| Get wallet | `absuite users Get-CurrentUserWalletAsync` |
| Get social profile | `absuite users Get-CurrentUserSocialProfileAsync` |
| List addresses | `absuite users Get-CurrentUserAddressesAsync` |
| Get settings | `absuite users Get-CurrentUserSettingsAsync` |
| Update settings | `absuite users Update-CurrentUserSettingsAsync --UserSettingsUpdateDto '{...}'` |
| List my tenants | `absuite users Get-CurrentUserTenantsAsync` |
| Count my tenants | `absuite users Invoke-CountCurrentUserTenantsAsync` |
| List my tenants (extended) | `absuite users Get-CurrentUserTenantsExtendedAsync` |
| List my enrollments | `absuite users Get-CurrentUserEnrollmentsAsync` |
| List my enrollments (extended) | `absuite users Get-CurrentUserEnrollmentsExtendedAsync` |
| Get enrollment by ID | `absuite users Get-EnrollmentAsync --EnrollmentId <enrollment-guid>` |
| List my invitations | `absuite users Get-CurrentUserInvitationAsync` |
| List followers | `absuite users Get-CurrentUserFollowersAsync` |
| Count followers | `absuite users Invoke-CountCurrentUserFollowersAsync` |
| List follows | `absuite users Get-CurrentUserFollowsAsync` |
| Count follows | `absuite users Invoke-CountCurrentUserFollowsAsync` |
| List notifications | `absuite users Get-CurrentUserNotificationsAsync` |
| Count notifications | `absuite users Invoke-CountCurrentUserNotificationsAsync` |
| List options | `absuite users Get-UserOptions` |
| Count options | `absuite users Get-UserOptionsCount` |
| Create option | `absuite users New-UserOption --Key <key> --OptionCreateDto '{...}'` |
| Get option by ID | `absuite users Get-UserOptionById --OptionId <option-guid>` |
| Get option by key | `absuite users Get-UserOptionByKey --Key <key>` |
| Update option | `absuite users Update-UserOption --OptionId <option-guid> --OptionUpdateDto '{...}'` |
| Upsert option by key | `absuite users Invoke-UpsertUserOption --Key <key> --OptionUpdateDto '{...}'` |
| Delete option | `absuite users Invoke-DeleteUserOption --OptionId <option-guid>` |

## Critical Rules

- **Authenticate first** with `absuite login` (see `absuite-login-cli`).
- **No tenant.** `/Me` commands are user-scoped — do not pass `--TenantId`.
- **All operations apply to the current user**, never to an arbitrary user.
- **No PATCH in the CLI.** For partial atomic (JSON Patch) updates of the profile or an
  option, use the `absuite-users` REST skill.
- **Use `Invoke-UpsertUserOption`** for idempotent key-value preference writes.
