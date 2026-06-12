---
name: absuite-contacts-cli
description: >
  Manage contacts in the Alliance Business Suite (ABS) CRM Service using the `absuite`
  CLI. Covers contacts (individuals & organizations), extended views, relationship
  graphs, avatars, wallets, carts, social profiles, contact options (key-value
  metadata), transactional email, and user/tenant sync — via list/count/get/create/
  update/delete commands and service actions. Requires an authenticated CLI session
  (see absuite-login-cli). For atomic PATCH updates, raw HTTP, or the contact
  groups / profiles / relations / relation-types / sources resources, use the
  absuite-contacts (REST) skill.
---

# Alliance Business Suite — Contacts Skill (CLI)

Manage contacts through the `absuite` CLI's `crm` service. All CRM operations are
tenant-scoped and require an authenticated session. The CLI does not support PATCH
(JSON Patch) — for partial atomic updates use the `absuite-contacts` REST skill.

> **Scope note:** the generated `crm` CLI surfaces the **Contacts**, contact **Options**,
> and **Sync** operations (plus contact sub-resources: avatar, wallet, cart, social
> profiles, transactional email). The standalone Contact **Groups**, **Profiles**,
> **Relations**, **Relation Types**, and **Sources** resources — and the per-email
> address CRUD/verify operations — are **not** exposed as CLI commands; drive those
> through the `absuite-contacts` REST skill. Always confirm availability with
> `absuite crm list-commands`.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-contacts` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-contacts` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general
   CLI usage and configuration, see `absuite-cli`.
2. **Set your tenant** — every CRM command requires a tenant. Either set a default:
   ```powershell
   absuite config set --tenant-id <tenant-guid>
   ```
   …and reference it as `$TENANT_ID`, or pass `--TenantId <tenant-guid>` on each call.
3. **Discover commands:**
   ```powershell
   absuite crm list-commands
   absuite crm create contact --help
   ```

## Command Structure

```
absuite crm <verb> <entity> --Param value
```

- **Verbs:** `list`, `count`, `get`, `create`, `update`, `delete`, plus service actions
  (`send`, `preview`, the `sync-*` commands, and the upsert commands).
- **Entities:** `contact`, `extended-contact`, contact sub-resources (`contact-wallet`,
  `contact-cart`, `contact-avatar`, `contact-social-profile`, `contact-profiles`),
  `contact-option`, plus the typed individual/organization views.
- The canonical PowerShell function-name form also works as the command, e.g.
  `absuite crm New-ContactAsync --TenantId <tenant-guid> --ContactCreateDto '{...}'`
  is equivalent to `absuite crm create contact ...`. The function names map to
  PowerShell-approved verbs: create → `New-`, get/list/count → `Get-`, update → `Update-`,
  delete → `Invoke-Delete...`, patch (REST only) → `Invoke-Patch...`, send email →
  `Send-ContactEmail`, preview email → `Invoke-PreviewContactEmailTemplate`, upsert →
  `Invoke-Upsert...`, sync → `Sync-...`.
- **JSON DTO params** are passed as a single-quoted JSON string (`--<Dto> '{...}'`) using
  the **same PascalCase field names** as the DTO model.

## Key Concepts

- **Contact** — a person or organization. The `Type` field is the enum
  **`Individual` | `Organization`** (a string value, not a numeric code).
- **Extended Contact** — a contact enriched with related data (profiles, wallet, etc.).
- **Contact Option** — a key-value metadata pair attached to a contact (`Key`, `Value`,
  plus `PortalId`, `Frozen`, `Autoload`, `Transient`, `Expiration`).
- **Social Profile / Profiles** — a contact's social/web profile(s).
- **Relationship Graph** — query a contact's related individuals/organizations.
- **Sync** — pull the current user, another user, or a tenant into a tenant's contact list.

## Contacts

### List Contacts

```powershell
absuite crm list contacts --TenantId $TENANT_ID
```

### Count Contacts

```powershell
absuite crm count contacts --TenantId $TENANT_ID
```

### List Extended Contacts (with related data)

```powershell
absuite crm list extended-contacts --TenantId $TENANT_ID
```

### Get Contact by ID

```powershell
absuite crm get contact --TenantId $TENANT_ID --ContactId <contact-guid>
```

### Get Extended Contact by ID

```powershell
absuite crm get extended-contact --TenantId $TENANT_ID --ContactId <contact-guid>
```

### Create Contact

```powershell
absuite crm create contact --TenantId $TENANT_ID --ContactCreateDto '{
  "Type": "Individual",
  "FirstName": "<first-name>",
  "LastName": "<last-name>",
  "Email": "<email>",
  "JobTitle": "<job-title>",
  "MobilePhone": "<mobile-phone>",
  "CountryId": "<country-id>",
  "CurrencyId": "<currency-id>"
}'
```

**`ContactCreateDto` fields** (`Type`, `FirstName`, `Email` are **required**):
`Id`, `Timestamp`, `Type` (`Individual`|`Organization`), `FirstName`, `LastName`, `Email`,
`TaxId`, `PrimaryContactId`, `About`, `CountryId`, `StateId`, `CityId`, `MobilePhone`,
`BusinessPhone`, `PostalCode`, `Duns`, `JobTitle`, `WebUrl`, `CurrencyId`, `LanguageId`,
`TimezoneId`, `Birthday`, `StreetLine1`, `StreetLine2`, `GitHubUrl`, `TwitchUrl`, `RedditUrl`,
`TikTokUrl`, `WebsiteUrl`, `TwitterUrl`, `FacebookUrl`, `YouTubeUrl`, `LinkedInUrl`,
`InstagramUrl`, `GithubUsername`, `InstagramUsername`, `TikTokUsername`, `StackExchangeUrl`,
`StackOverflowUrl`, `ParentContactId`, `FaxNumber`.

> Run `absuite crm create contact --help` for the exact, current parameter and DTO schema.

### Update Contact (full replace)

```powershell
absuite crm update contact --TenantId $TENANT_ID --ContactId <contact-guid> --ContactUpdateDto '{
  "Type": "Individual",
  "FirstName": "<first-name>",
  "LastName": "<last-name>",
  "Email": "<email>",
  "JobTitle": "<new-job-title>"
}'
```

**`ContactUpdateDto` fields** (`Type`, `FirstName`, `Email` **required**):
`Type`, `Birthday`, `Duns`, `TaxId`, `Email`, `FirstName`, `LastName`, `PrimaryContactId`,
`About`, `MobilePhone`, `BusinessPhone`, `JobTitle`, `CountryId`, `ParentContactId`,
`PostalCode`, `StateId`, `CityId`, `StreetLine1`, `StreetLine2`, `CurrencyId`, `LanguageId`,
`TimezoneId`, `CoverUrl`, `GithubUsername`, `InstagramUsername`, `WebUrl`, `TwitchUrl`,
`RedditUrl`, `GitHubUrl`, `TikTokUrl`, `TwitterUrl`, `YouTubeUrl`, `FacebookUrl`,
`LinkedInUrl`, `InstagramUrl`, `TikTokUsername`, `StackExchangeUrl`, `StackOverflowUrl`,
`FaxNumber`.

### Delete Contact

```powershell
absuite crm delete contact --TenantId $TENANT_ID --ContactId <contact-guid>
```

> For partial atomic updates (JSON Patch), use the `absuite-contacts` REST skill — the CLI
> does not support patch.

## Contacts by Type

### Individuals

```powershell
absuite crm list business-owned-individuals --TenantId $TENANT_ID
absuite crm count business-owned-individuals --TenantId $TENANT_ID
absuite crm list extended-business-owned-individuals --TenantId $TENANT_ID
absuite crm get business-owned-individual --TenantId $TENANT_ID --ContactId <contact-guid>
```

### Organizations

```powershell
absuite crm list business-owned-organizations --TenantId $TENANT_ID
absuite crm count business-owned-organizations --TenantId $TENANT_ID
absuite crm list extended-business-owned-organizations --TenantId $TENANT_ID
absuite crm get business-owned-organization --TenantId $TENANT_ID --ContactId <contact-guid>
```

### Relationship Graph

```powershell
# Individual's related individuals / organizations
absuite crm list individual-related-individuals --TenantId $TENANT_ID --ContactId <contact-guid>
absuite crm list individual-related-organizations --TenantId $TENANT_ID --ContactId <contact-guid>

# Organization's related individuals / organizations
absuite crm list organization-related-individuals --TenantId $TENANT_ID --ContactId <contact-guid>
absuite crm list organization-related-organizations --TenantId $TENANT_ID --ContactId <contact-guid>
```

## Contact Sub-Resources

```powershell
# Wallet
absuite crm get contact-wallet --TenantId $TENANT_ID --ContactId <contact-guid>

# Cart
absuite crm get contact-cart --TenantId $TENANT_ID --ContactId <contact-guid>

# Social profile (primary)
absuite crm get contact-social-profile --TenantId $TENANT_ID --ContactId <contact-guid>

# Social profiles (list)
absuite crm get contact-profiles --TenantId $TENANT_ID --ContactId <contact-guid>

# Avatar (get)
absuite crm get contact-avatar --TenantId $TENANT_ID --ContactId <contact-guid>

# Avatar (update — pass the image via --Avatar; TenantId is optional on this command)
absuite crm update contact-avatar --ContactId <contact-guid> --Avatar @/path/to/avatar.png
```

## Contact Options (Key-Value Metadata)

An option carries `Key`, `Value`, optional `PortalId`, and the flags `Frozen`, `Autoload`,
`Transient`, plus an integer `Expiration`.

### List / Count Options

```powershell
# Optionally scope to a portal with --PortalId <portal-guid>
absuite crm get contact-options --TenantId $TENANT_ID --ContactId <contact-guid>
absuite crm get contact-options-count --TenantId $TENANT_ID --ContactId <contact-guid>
```

### Get Option by ID / by Key

```powershell
absuite crm get contact-option-by-id --TenantId $TENANT_ID --ContactId <contact-guid> --OptionId <option-guid>
absuite crm get contact-option-by-key --TenantId $TENANT_ID --ContactId <contact-guid> --Key <key>
```

### Create Option

> `--Key <key>` is also a **required parameter** on create (in addition to the DTO).

```powershell
absuite crm create contact-option --TenantId $TENANT_ID --ContactId <contact-guid> --Key <key> --OptionCreateDto '{
  "Key": "<key>",
  "Value": "<value>",
  "Frozen": false,
  "Autoload": false,
  "Transient": false
}'
```

**`OptionCreateDto` fields** (`Key`, `Value` **required**): `Id`, `Timestamp`, `Key`, `Value`,
`PortalId`, `Frozen` (bool), `Autoload` (bool), `Transient` (bool), `Expiration` (int).

### Update Option

```powershell
absuite crm update contact-option --TenantId $TENANT_ID --ContactId <contact-guid> --OptionId <option-guid> --OptionUpdateDto '{
  "Key": "<key>",
  "Value": "<new-value>"
}'
```

**`OptionUpdateDto` fields:** `Key`, `Value`, `PortalId`, `Frozen` (bool), `Autoload` (bool),
`Transient` (bool), `Expiration` (int).

### Upsert Option by Key (create or update)

```powershell
absuite crm upsert contact-option --TenantId $TENANT_ID --ContactId <contact-guid> --Key <key> --OptionUpdateDto '{
  "Key": "<key>",
  "Value": "<value>"
}'
```

### Delete Option

```powershell
absuite crm delete contact-option --TenantId $TENANT_ID --ContactId <contact-guid> --OptionId <option-guid>
```

## Transactional Email

### Send Email to a Contact

> The `send`/`preview` email commands take `--ContactId` but do **not** bind a tenant.

```powershell
absuite crm send contact-email --ContactId <contact-guid> --EmailDispatchRequest '{
  "Title": "<subject>",
  "Message": "<body>",
  "Culture": "en-US",
  "UiCulture": "en-US",
  "Recipients": ["<recipient-email>"]
}'
```

### Preview Contact Email (renders without sending)

```powershell
absuite crm preview contact-email-template --ContactId <contact-guid> --EmailDispatchRequest '{
  "Title": "<subject>",
  "Message": "<body>",
  "Culture": "en-US",
  "UiCulture": "en-US",
  "Recipients": ["<recipient-email>"]
}'
```

**`EmailDispatchRequest` fields** (`Title`, `Message`, `Culture`, `UiCulture`, `Recipients` are **required**):
`Title`, `Message`, `ButtonLink`, `ButtonText`, `AlertMessage`,
`AlertType` (`None`|`Info`|`Error`|`Warning`|`Success`|`Action`|`Alert`),
`Culture`, `UiCulture`, `Recipients` (array of emails), `ContactIds` (array), `TenantIds`
(array), `UserIds` (array), `TemplateUrl`, `EmailTemplateId`.

## Upsert into a Contact List

```powershell
# Upsert a user onto a tenant's contact list
absuite crm upsert user-onto-another-tenant-contact-list --TenantId $TENANT_ID --RelatedUserId <user-guid>

# Upsert a tenant onto another tenant's contact list
absuite crm upsert tenant-onto-another-tenant-contact-list --TenantId $TENANT_ID --RelatedTenantId <related-tenant-guid>
```

## Sync Operations

Synchronize the current user, another user, or a tenant into a tenant's contact list. Each
requires `--TenantId` (the target tenant).

```powershell
# Sync the current user into the current tenant's contact list
absuite crm sync-current-holder-to-current-tenant-crm --TenantId $TENANT_ID

# Sync the current user into a (target) tenant's contact list
absuite crm sync-current-holder-to-tenant-crm --TenantId $TENANT_ID

# Sync a specific user into a tenant's contact list
absuite crm sync-holder-to-tenant-crm --TenantId $TENANT_ID --RelatedUserId <user-guid>

# Sync a tenant into another tenant's contact list
absuite crm sync-tenant-to-tenant-crm --TenantId $TENANT_ID --RelatedTenantId <related-tenant-guid>
```

## End-to-End Workflow

```powershell
# 1. Create an individual contact (note the returned contact ID in result)
absuite crm create contact --TenantId $TENANT_ID --ContactCreateDto '{
  "Type": "Individual", "FirstName": "<first-name>", "Email": "<email>", "JobTitle": "<job-title>"
}'

# 2. Set metadata via upsert option by key
absuite crm upsert contact-option --TenantId $TENANT_ID --ContactId <contact-guid> --Key <key> --OptionUpdateDto '{
  "Key": "<key>", "Value": "<value>"
}'

# 3. Inspect relationships
absuite crm list individual-related-organizations --TenantId $TENANT_ID --ContactId <contact-guid>

# 4. Send a welcome email
absuite crm send contact-email --ContactId <contact-guid> --EmailDispatchRequest '{
  "Title": "<subject>", "Message": "<body>", "Culture": "en-US", "UiCulture": "en-US", "Recipients": ["<email>"]
}'

# 5. Verify (extended view)
absuite crm get extended-contact --TenantId $TENANT_ID --ContactId <contact-guid>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List contacts | `absuite crm list contacts` |
| Count contacts | `absuite crm count contacts` |
| List extended contacts | `absuite crm list extended-contacts` |
| Create contact | `absuite crm create contact --ContactCreateDto '{...}'` |
| Get contact | `absuite crm get contact --ContactId <contact-guid>` |
| Get extended contact | `absuite crm get extended-contact --ContactId <contact-guid>` |
| Update contact | `absuite crm update contact --ContactId <contact-guid> --ContactUpdateDto '{...}'` |
| Delete contact | `absuite crm delete contact --ContactId <contact-guid>` |
| List individuals | `absuite crm list business-owned-individuals` |
| Count individuals | `absuite crm count business-owned-individuals` |
| List extended individuals | `absuite crm list extended-business-owned-individuals` |
| Get individual | `absuite crm get business-owned-individual --ContactId <contact-guid>` |
| List organizations | `absuite crm list business-owned-organizations` |
| Count organizations | `absuite crm count business-owned-organizations` |
| List extended organizations | `absuite crm list extended-business-owned-organizations` |
| Get organization | `absuite crm get business-owned-organization --ContactId <contact-guid>` |
| Individual → individuals | `absuite crm list individual-related-individuals --ContactId <contact-guid>` |
| Individual → organizations | `absuite crm list individual-related-organizations --ContactId <contact-guid>` |
| Organization → individuals | `absuite crm list organization-related-individuals --ContactId <contact-guid>` |
| Organization → organizations | `absuite crm list organization-related-organizations --ContactId <contact-guid>` |
| Get contact wallet | `absuite crm get contact-wallet --ContactId <contact-guid>` |
| Get contact cart | `absuite crm get contact-cart --ContactId <contact-guid>` |
| Get social profile | `absuite crm get contact-social-profile --ContactId <contact-guid>` |
| List social profiles | `absuite crm get contact-profiles --ContactId <contact-guid>` |
| Get avatar | `absuite crm get contact-avatar --ContactId <contact-guid>` |
| Update avatar | `absuite crm update contact-avatar --ContactId <contact-guid> --Avatar @<path>` |
| List options | `absuite crm get contact-options --ContactId <contact-guid>` |
| Count options | `absuite crm get contact-options-count --ContactId <contact-guid>` |
| Get option by ID | `absuite crm get contact-option-by-id --ContactId <contact-guid> --OptionId <option-guid>` |
| Get option by key | `absuite crm get contact-option-by-key --ContactId <contact-guid> --Key <key>` |
| Create option | `absuite crm create contact-option --ContactId <contact-guid> --Key <key> --OptionCreateDto '{...}'` |
| Update option | `absuite crm update contact-option --ContactId <contact-guid> --OptionId <option-guid> --OptionUpdateDto '{...}'` |
| Upsert option | `absuite crm upsert contact-option --ContactId <contact-guid> --Key <key> --OptionUpdateDto '{...}'` |
| Delete option | `absuite crm delete contact-option --ContactId <contact-guid> --OptionId <option-guid>` |
| Send email | `absuite crm send contact-email --ContactId <contact-guid> --EmailDispatchRequest '{...}'` |
| Preview email | `absuite crm preview contact-email-template --ContactId <contact-guid> --EmailDispatchRequest '{...}'` |
| Upsert user as contact | `absuite crm upsert user-onto-another-tenant-contact-list --RelatedUserId <user-guid>` |
| Upsert tenant as contact | `absuite crm upsert tenant-onto-another-tenant-contact-list --RelatedTenantId <related-tenant-guid>` |
| Sync current user → current tenant | `absuite crm sync-current-holder-to-current-tenant-crm` |
| Sync current user → tenant | `absuite crm sync-current-holder-to-tenant-crm` |
| Sync user → tenant | `absuite crm sync-holder-to-tenant-crm --RelatedUserId <user-guid>` |
| Sync tenant → tenant | `absuite crm sync-tenant-to-tenant-crm --RelatedTenantId <related-tenant-guid>` |

> Every tenant-scoped command also accepts `--TenantId <tenant-guid>` (omit it if you set a
> default tenant with `absuite config set --tenant-id <tenant-guid>`).

## Critical Rules

- **Authenticate first** with `absuite login` (see `absuite-login-cli`).
- **Provide a tenant context** — set a default with `absuite config set --tenant-id` or pass
  `--TenantId` on each tenant-scoped call.
- **`Type` is `Individual` or `Organization`** — a string enum, never a numeric code.
- **`Type`, `FirstName`, and `Email` are required** to create or update a contact.
- **Use `--help` before unfamiliar commands** — it shows exact parameter names, DTO schemas,
  and return types; use `absuite crm list-commands` for discovery.
- **Save the contact ID after creation** — the response `result` includes the new ID.
- **No PATCH in the CLI.** For atomic partial updates (JSON Patch), and for the Contact
  Groups / Profiles / Relations / Relation Types / Sources resources and per-email-address
  operations, use the `absuite-contacts` (REST) skill.
- **Never hard-code real GUIDs, emails, or credentials** — use placeholders and values from
  command output.
