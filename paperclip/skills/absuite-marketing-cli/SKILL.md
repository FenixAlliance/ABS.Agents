---
name: absuite-marketing-cli
description: >
  Manage marketing records in the Alliance Business Suite (ABS) Marketing Service using
  the `absuite` CLI. Covers marketing campaigns, marketing areas, marketing lists,
  marketing leads, newsletters, email groups, email signatures, email templates, social
  media posts, social post buckets, and tracking-pixel retrieval — via
  list/count/get/create/update/delete commands. Requires an authenticated CLI session
  (see absuite-login-cli). For atomic PATCH updates or raw HTTP, use the absuite-marketing
  (REST) skill.
---

# Alliance Business Suite — Marketing Skill (CLI)

Manage marketing assets through the `absuite` CLI's `marketing` service. Every Marketing
operation is tenant-scoped and requires an authenticated session — the one exception is
the public tracking-pixel read, which takes only a `--PixelId`. The CLI does not support
PATCH (JSON Patch); for partial atomic updates use the `absuite-marketing` REST skill.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general
   CLI usage and configuration, see `absuite-cli`.
2. **Set your tenant** — every Marketing command (except the tracking pixel) requires a
   tenant. Either set a default:
   ```powershell
   absuite config set --tenant-id <tenant-guid>
   ```
   …and reference it as `$TENANT_ID`, or pass `--TenantId <tenant-guid>` on each call.
3. **Discover commands:**
   ```powershell
   absuite marketing list-commands
   absuite marketing create campaign --help
   ```

## Command Structure

```
absuite marketing <verb> <entity> --Param value
```

- **Verbs:** `list`, `count`, `search`, `get`, `create`, `update`, `delete`. There are no
  dedicated marketing service actions (no send/schedule) — campaigns, posts, etc. are
  pure CRUD.
- **Entities:** `campaign`, `marketing-area`, `marketing-list`, `marketing-lead`,
  `newsletter`, `email-group`, `email-signature`, `email-template`, `social-media-post`,
  `social-post-bucket`, `tracking-pixel`.
- **`list` is OData** — the underlying read returns an OData list. `search` is the same
  read with an OData `$filter`; there is no separate search endpoint.
- The canonical PowerShell function-name form also works as the command. The generated
  functions map to PowerShell-approved verbs:
  - create → `New-<Entity>Async` (e.g. `New-MarketingCampaignAsync`)
  - list (OData) → `Get-<Entity>ODataAsync` (e.g. `Get-MarketingCampaignODataAsync`);
    marketing areas use `Get-MarketingAreasAsync`
  - get one → `Get-<Entity>DetailsAsync` (areas: `Get-MarketingAreaByIdAsync`)
  - count → `Get-<Entity>CountAsync`
  - update → `Update-<Entity>Async`
  - delete → `Invoke-Delete<Entity>Async`
  - tracking pixel → `Get-TrackingPixelAsync`
- **JSON DTO params** are passed as a single-quoted JSON string (`--<Dto> '{...}'`) using
  the **same PascalCase field names** as the REST API.

## Key Concepts & Enumerations

- **`MarketingListType`** — `Static` | `Dynamic`.
- **`MarketingListTarget`** — `Individual` | `Organization` | `Lead`.
- **`CodeType`** (email signatures & templates) — `Razor` | `CSharp` | `CSHtml` |
  `Liquid` | `Html5` | `Markdown` | `Markup`.
- DTO field names are PascalCase (e.g. `Name`, `Title`, `CurrencyId`, `MarketingAreaId`).

## Marketing Campaigns

```powershell
# List (OData)
absuite marketing list campaign --TenantId $TENANT_ID

# Search (OData $filter)
absuite marketing search campaign --TenantId $TENANT_ID --Filter "contains(name,'Spring')"

# Count
absuite marketing count campaign --TenantId $TENANT_ID

# Get by ID
absuite marketing get campaign --TenantId $TENANT_ID --MarketingcampaignId <campaign-guid>

# Create
absuite marketing create campaign --TenantId $TENANT_ID --MarketingCampaignCreateDto '{
  "Name": "Spring Sale 2026",
  "Offer": "20% off all products",
  "Active": true,
  "ProposedStart": "2026-03-01T00:00:00Z",
  "ProposedEnd": "2026-04-30T23:59:59Z",
  "Code": "SPRING26",
  "AllocatedBudget": 10000.00,
  "ActivityCost": 0,
  "MiscCost": 0,
  "ExpectedResponsePercent": 5,
  "MarketingAreaId": "<area-guid>",
  "CurrencyId": "<currency-guid>"
}'

# Update
absuite marketing update campaign --TenantId $TENANT_ID --MarketingcampaignId <campaign-guid> --MarketingCampaignUpdateDto '{
  "Name": "Spring Sale 2026 (Extended)",
  "Active": true,
  "AllocatedBudget": 12000.00,
  "CurrencyId": "<currency-guid>"
}'

# Delete
absuite marketing delete campaign --TenantId $TENANT_ID --MarketingcampaignId <campaign-guid>
```

**`MarketingCampaignCreateDto` fields:** `Name`, `Offer`, `Active`, `ProposedStart`,
`ProposedEnd`, `ActualStart`, `ActualEnd`, `Code`, `AllocatedBudget`, `ActivityCost`,
`MiscCost`, `ExpectedResponsePercent`, `MarketingAreaId`, `CurrencyId`.

## Marketing Areas

```powershell
absuite marketing list marketing-area --TenantId $TENANT_ID
absuite marketing count marketing-area --TenantId $TENANT_ID
absuite marketing get marketing-area --TenantId $TENANT_ID --MarketingAreaId <area-guid>
absuite marketing create marketing-area --TenantId $TENANT_ID --MarketingAreaCreateDto '{
  "Name": "North America",
  "Description": "North American market region"
}'
absuite marketing update marketing-area --TenantId $TENANT_ID --MarketingAreaId <area-guid> --MarketingAreaUpdateDto '{
  "Name": "North America (NA)",
  "Description": "Updated region description"
}'
absuite marketing delete marketing-area --TenantId $TENANT_ID --MarketingAreaId <area-guid>
```

**`MarketingAreaCreateDto` fields:** `Name` (**required**), `Description`.

## Marketing Lists

```powershell
absuite marketing list marketing-list --TenantId $TENANT_ID
absuite marketing count marketing-list --TenantId $TENANT_ID
absuite marketing get marketing-list --TenantId $TENANT_ID --MarketinglistId <list-guid>
absuite marketing create marketing-list --TenantId $TENANT_ID --MarketingListCreateDto '{
  "Name": "VIP Customers",
  "Purpose": "Retention",
  "Description": "High-value customer segment",
  "Source": "CRM export",
  "Locked": false,
  "Cost": 0,
  "CurrencyId": "<currency-guid>",
  "MarketingListType": "Static",
  "MarketingListTarget": "Individual"
}'
absuite marketing update marketing-list --TenantId $TENANT_ID --MarketinglistId <list-guid> --MarketingListUpdateDto '{
  "Name": "VIP Customers",
  "Locked": true,
  "MarketingListType": "Dynamic",
  "MarketingListTarget": "Individual"
}'
absuite marketing delete marketing-list --TenantId $TENANT_ID --MarketinglistId <list-guid>
```

**`MarketingListCreateDto` fields:** `Locked`, `Name`, `Purpose`, `Description`,
`Source`, `Cost`, `ModifiedOn`, `LastUsedOn`, `CurrencyId`, `MarketingListType`
(`Static|Dynamic`), `MarketingListTarget` (`Individual|Organization|Lead`).

## Marketing Leads

```powershell
absuite marketing list marketing-lead --TenantId $TENANT_ID
absuite marketing count marketing-lead --TenantId $TENANT_ID
absuite marketing get marketing-lead --TenantId $TENANT_ID --MarketingLeadId <lead-guid>
absuite marketing create marketing-lead --TenantId $TENANT_ID --MarketingLeadCreateDto '{
  "FirstName": "<first-name>",
  "LastName": "<last-name>",
  "Email": "<lead-email>",
  "Phone": "<phone>",
  "Company": "<company>",
  "JobTitle": "<job-title>",
  "Source": "Web form",
  "Notes": "Requested a demo",
  "Score": 50
}'
absuite marketing update marketing-lead --TenantId $TENANT_ID --MarketingLeadId <lead-guid> --MarketingLeadUpdateDto '{
  "FirstName": "<first-name>",
  "LastName": "<last-name>",
  "Email": "<lead-email>",
  "Source": "Web form",
  "Status": "Qualified",
  "Score": 80
}'
absuite marketing delete marketing-lead --TenantId $TENANT_ID --MarketingLeadId <lead-guid>
```

**`MarketingLeadCreateDto` fields:** `FirstName`, `LastName`, `Email`, `Phone`,
`Company`, `JobTitle`, `Source`, `Notes`, `Score`. The **update** DTO additionally
includes a `Status` field.

## Newsletters

```powershell
absuite marketing list newsletter --TenantId $TENANT_ID
absuite marketing count newsletter --TenantId $TENANT_ID
absuite marketing get newsletter --TenantId $TENANT_ID --NewsletterId <newsletter-guid>
absuite marketing create newsletter --TenantId $TENANT_ID --NewsletterCreateDto '{
  "Name": "Monthly Digest",
  "Code": "DIGEST-2026-04",
  "Title": "Monthly Digest — April 2026"
}'
absuite marketing update newsletter --TenantId $TENANT_ID --NewsletterId <newsletter-guid> --NewsletterUpdateDto '{
  "Name": "Monthly Digest",
  "Code": "DIGEST-2026-05",
  "Title": "Monthly Digest — May 2026"
}'
absuite marketing delete newsletter --TenantId $TENANT_ID --NewsletterId <newsletter-guid>
```

**`NewsletterCreateDto` fields:** `Name`, `Code`, `Title`.

## Email Groups

```powershell
absuite marketing list email-group --TenantId $TENANT_ID
absuite marketing count email-group --TenantId $TENANT_ID
absuite marketing get email-group --TenantId $TENANT_ID --EmailgroupId <group-guid>
absuite marketing create email-group --TenantId $TENANT_ID --EmailGroupCreateDto '{
  "Name": "Newsletter Subscribers",
  "Description": "Opted-in newsletter audience",
  "Enabled": true
}'
absuite marketing update email-group --TenantId $TENANT_ID --EmailgroupId <group-guid> --EmailGroupUpdateDto '{
  "Name": "Newsletter Subscribers",
  "Description": "Updated description",
  "Enabled": false
}'
absuite marketing delete email-group --TenantId $TENANT_ID --EmailgroupId <group-guid>
```

**`EmailGroupCreateDto` fields:** `Name`, `Description`, `Enabled`.

## Email Signatures

```powershell
absuite marketing list email-signature --TenantId $TENANT_ID
absuite marketing count email-signature --TenantId $TENANT_ID
absuite marketing get email-signature --TenantId $TENANT_ID --EmailsignatureId <signature-guid>
absuite marketing create email-signature --TenantId $TENANT_ID --EmailSignatureCreateDto '{
  "Title": "Corporate Signature",
  "Published": true,
  "Description": "Default outbound signature",
  "Code": "<p>Best regards,<br/>The Team</p>",
  "Markup": "<p>Best regards,<br/>The Team</p>",
  "CodeType": "Html5"
}'
absuite marketing update email-signature --TenantId $TENANT_ID --EmailsignatureId <signature-guid> --EmailSignatureUpdateDto '{
  "Title": "Corporate Signature",
  "HtmlContent": "<p>Best regards,<br/>The Team</p>",
  "CodeType": "Html5",
  "Published": true,
  "Default": true
}'
absuite marketing delete email-signature --TenantId $TENANT_ID --EmailsignatureId <signature-guid>
```

**`EmailSignatureCreateDto` fields:** `Title` (**required**), `Published`, `Description`,
`Code`, `Markup`, `FeaturedImageUrl`, `CodeType`
(`Razor|CSharp|CSHtml|Liquid|Html5|Markdown|Markup`). The **update** DTO is a large
content DTO (same shape as email templates: `Title`, `Name`, `Content`, `HtmlContent`,
`CodeType`, SEO/social fields, and boolean flags like `Published`, `Default`, `Enable`).

## Email Templates

```powershell
absuite marketing list email-template --TenantId $TENANT_ID
absuite marketing count email-template --TenantId $TENANT_ID
absuite marketing get email-template --TenantId $TENANT_ID --EmailTemplateId <template-guid>
absuite marketing create email-template --TenantId $TENANT_ID --EmailTemplateCreateDto '{
  "Title": "Welcome Email",
  "Published": true,
  "Description": "Sent on signup",
  "Code": "<h1>Welcome!</h1><p>Thanks for joining.</p>",
  "Markup": "<h1>Welcome!</h1><p>Thanks for joining.</p>",
  "CodeType": "Liquid",
  "MarketingCampaignId": "<campaign-guid>"
}'
absuite marketing update email-template --TenantId $TENANT_ID --EmailTemplateId <template-guid> --EmailTemplateUpdateDto '{
  "Title": "Welcome Email",
  "HtmlContent": "<h1>Welcome!</h1><p>Thanks for joining.</p>",
  "CodeType": "Liquid",
  "Published": true,
  "MarketingCampaignId": "<campaign-guid>"
}'
absuite marketing delete email-template --TenantId $TENANT_ID --EmailTemplateId <template-guid>
```

**`EmailTemplateCreateDto` fields:** `Title` (**required**), `Published`, `Description`,
`Code`, `Markup`, `FeaturedImageUrl`, `CodeType`
(`Razor|CSharp|CSHtml|Liquid|Html5|Markdown|Markup`), `MarketingCampaignId`. The
**update** DTO is the large content DTO plus `MarketingCampaignId`.

## Social Media Posts

```powershell
absuite marketing list social-media-post --TenantId $TENANT_ID
absuite marketing count social-media-post --TenantId $TENANT_ID
absuite marketing get social-media-post --TenantId $TENANT_ID --SocialmediapostId <post-guid>
absuite marketing create social-media-post --TenantId $TENANT_ID --SocialMediaPostCreateDto '{
  "Title": "Spring Sale Announcement",
  "Content": "Get 20% off everything this spring! Use code SPRING26",
  "FeaturedImageUrl": "https://cdn.example/spring.png",
  "SocialPostBucketId": "<bucket-guid>"
}'
absuite marketing update social-media-post --TenantId $TENANT_ID --SocialmediapostId <post-guid> --SocialMediaPostUpdateDto '{
  "Title": "Spring Sale — Final Days",
  "Content": "Last chance: 20% off ends Sunday. Code SPRING26",
  "SocialPostBucketId": "<bucket-guid>"
}'
absuite marketing delete social-media-post --TenantId $TENANT_ID --SocialmediapostId <post-guid>
```

**`SocialMediaPostCreateDto` fields:** `Title`, `Content`, `FeaturedImageUrl`,
`SocialPostBucketId`.

## Social Post Buckets

```powershell
absuite marketing list social-post-bucket --TenantId $TENANT_ID
absuite marketing count social-post-bucket --TenantId $TENANT_ID
absuite marketing get social-post-bucket --TenantId $TENANT_ID --SocialpostbucketId <bucket-guid>
absuite marketing create social-post-bucket --TenantId $TENANT_ID --SocialPostBucketCreateDto '{
  "Name": "Spring Campaign Bucket"
}'
absuite marketing update social-post-bucket --TenantId $TENANT_ID --SocialpostbucketId <bucket-guid> --SocialPostBucketUpdateDto '{
  "Name": "Spring Campaign Bucket (2026)"
}'
absuite marketing delete social-post-bucket --TenantId $TENANT_ID --SocialpostbucketId <bucket-guid>
```

**`SocialPostBucketCreateDto` fields:** `Name`. **`SocialPostBucketUpdateDto`:** `Name`.

## Tracking Pixel

A **public** read fetched by pixel ID — **no** tenant. Pass only `--PixelId`.

```powershell
absuite marketing get tracking-pixel --PixelId <pixel-id>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List campaigns | `absuite marketing list campaign --TenantId <guid>` |
| Count campaigns | `absuite marketing count campaign --TenantId <guid>` |
| Get campaign | `absuite marketing get campaign --TenantId <guid> --MarketingcampaignId <guid>` |
| Create campaign | `absuite marketing create campaign --TenantId <guid> --MarketingCampaignCreateDto '{...}'` |
| Update campaign | `absuite marketing update campaign --TenantId <guid> --MarketingcampaignId <guid> --MarketingCampaignUpdateDto '{...}'` |
| Delete campaign | `absuite marketing delete campaign --TenantId <guid> --MarketingcampaignId <guid>` |
| List areas | `absuite marketing list marketing-area --TenantId <guid>` |
| Count areas | `absuite marketing count marketing-area --TenantId <guid>` |
| Get area | `absuite marketing get marketing-area --TenantId <guid> --MarketingAreaId <guid>` |
| Create area | `absuite marketing create marketing-area --TenantId <guid> --MarketingAreaCreateDto '{...}'` |
| Update area | `absuite marketing update marketing-area --TenantId <guid> --MarketingAreaId <guid> --MarketingAreaUpdateDto '{...}'` |
| Delete area | `absuite marketing delete marketing-area --TenantId <guid> --MarketingAreaId <guid>` |
| List lists | `absuite marketing list marketing-list --TenantId <guid>` |
| Count lists | `absuite marketing count marketing-list --TenantId <guid>` |
| Get list | `absuite marketing get marketing-list --TenantId <guid> --MarketinglistId <guid>` |
| Create list | `absuite marketing create marketing-list --TenantId <guid> --MarketingListCreateDto '{...}'` |
| Update list | `absuite marketing update marketing-list --TenantId <guid> --MarketinglistId <guid> --MarketingListUpdateDto '{...}'` |
| Delete list | `absuite marketing delete marketing-list --TenantId <guid> --MarketinglistId <guid>` |
| List leads | `absuite marketing list marketing-lead --TenantId <guid>` |
| Count leads | `absuite marketing count marketing-lead --TenantId <guid>` |
| Get lead | `absuite marketing get marketing-lead --TenantId <guid> --MarketingLeadId <guid>` |
| Create lead | `absuite marketing create marketing-lead --TenantId <guid> --MarketingLeadCreateDto '{...}'` |
| Update lead | `absuite marketing update marketing-lead --TenantId <guid> --MarketingLeadId <guid> --MarketingLeadUpdateDto '{...}'` |
| Delete lead | `absuite marketing delete marketing-lead --TenantId <guid> --MarketingLeadId <guid>` |
| List newsletters | `absuite marketing list newsletter --TenantId <guid>` |
| Count newsletters | `absuite marketing count newsletter --TenantId <guid>` |
| Get newsletter | `absuite marketing get newsletter --TenantId <guid> --NewsletterId <guid>` |
| Create newsletter | `absuite marketing create newsletter --TenantId <guid> --NewsletterCreateDto '{...}'` |
| Update newsletter | `absuite marketing update newsletter --TenantId <guid> --NewsletterId <guid> --NewsletterUpdateDto '{...}'` |
| Delete newsletter | `absuite marketing delete newsletter --TenantId <guid> --NewsletterId <guid>` |
| List email groups | `absuite marketing list email-group --TenantId <guid>` |
| Count email groups | `absuite marketing count email-group --TenantId <guid>` |
| Get email group | `absuite marketing get email-group --TenantId <guid> --EmailgroupId <guid>` |
| Create email group | `absuite marketing create email-group --TenantId <guid> --EmailGroupCreateDto '{...}'` |
| Update email group | `absuite marketing update email-group --TenantId <guid> --EmailgroupId <guid> --EmailGroupUpdateDto '{...}'` |
| Delete email group | `absuite marketing delete email-group --TenantId <guid> --EmailgroupId <guid>` |
| List email signatures | `absuite marketing list email-signature --TenantId <guid>` |
| Count email signatures | `absuite marketing count email-signature --TenantId <guid>` |
| Get email signature | `absuite marketing get email-signature --TenantId <guid> --EmailsignatureId <guid>` |
| Create email signature | `absuite marketing create email-signature --TenantId <guid> --EmailSignatureCreateDto '{...}'` |
| Update email signature | `absuite marketing update email-signature --TenantId <guid> --EmailsignatureId <guid> --EmailSignatureUpdateDto '{...}'` |
| Delete email signature | `absuite marketing delete email-signature --TenantId <guid> --EmailsignatureId <guid>` |
| List email templates | `absuite marketing list email-template --TenantId <guid>` |
| Count email templates | `absuite marketing count email-template --TenantId <guid>` |
| Get email template | `absuite marketing get email-template --TenantId <guid> --EmailTemplateId <guid>` |
| Create email template | `absuite marketing create email-template --TenantId <guid> --EmailTemplateCreateDto '{...}'` |
| Update email template | `absuite marketing update email-template --TenantId <guid> --EmailTemplateId <guid> --EmailTemplateUpdateDto '{...}'` |
| Delete email template | `absuite marketing delete email-template --TenantId <guid> --EmailTemplateId <guid>` |
| List social posts | `absuite marketing list social-media-post --TenantId <guid>` |
| Count social posts | `absuite marketing count social-media-post --TenantId <guid>` |
| Get social post | `absuite marketing get social-media-post --TenantId <guid> --SocialmediapostId <guid>` |
| Create social post | `absuite marketing create social-media-post --TenantId <guid> --SocialMediaPostCreateDto '{...}'` |
| Update social post | `absuite marketing update social-media-post --TenantId <guid> --SocialmediapostId <guid> --SocialMediaPostUpdateDto '{...}'` |
| Delete social post | `absuite marketing delete social-media-post --TenantId <guid> --SocialmediapostId <guid>` |
| List social buckets | `absuite marketing list social-post-bucket --TenantId <guid>` |
| Count social buckets | `absuite marketing count social-post-bucket --TenantId <guid>` |
| Get social bucket | `absuite marketing get social-post-bucket --TenantId <guid> --SocialpostbucketId <guid>` |
| Create social bucket | `absuite marketing create social-post-bucket --TenantId <guid> --SocialPostBucketCreateDto '{...}'` |
| Update social bucket | `absuite marketing update social-post-bucket --TenantId <guid> --SocialpostbucketId <guid> --SocialPostBucketUpdateDto '{...}'` |
| Delete social bucket | `absuite marketing delete social-post-bucket --TenantId <guid> --SocialpostbucketId <guid>` |
| Get tracking pixel (public, no tenant) | `absuite marketing get tracking-pixel --PixelId <pixel-id>` |

## Critical Rules

- **Authenticate first** (`absuite login`), then run marketing commands.
- **Provide a tenant on every command** — `--TenantId <guid>` (or a configured default
  `$TENANT_ID`). The only exception is `get tracking-pixel`, which takes `--PixelId` and
  **no** tenant.
- **Mind the path-id parameter casing** — some are mid-word lowercased to match the API:
  `--MarketingcampaignId`, `--MarketinglistId`, `--EmailgroupId`, `--EmailsignatureId`,
  `--SocialmediapostId`, `--SocialpostbucketId`; while others are camelCased:
  `--MarketingAreaId`, `--MarketingLeadId`, `--EmailTemplateId`, `--NewsletterId`. When
  in doubt, run `absuite marketing <verb> <entity> --help`.
- **`list` is OData; `search` = `list` with an OData `$filter`** — there is no separate
  search endpoint.
- **No PATCH in the CLI.** For atomic partial (JSON Patch) updates, use the
  `absuite-marketing` REST skill.
- **DTO JSON** uses PascalCase field names matching the REST API; pass it as a single
  argument (`--<Dto> '{...}'`).
