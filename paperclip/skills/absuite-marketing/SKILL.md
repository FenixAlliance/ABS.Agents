---
name: absuite-marketing
description: >
  Create, read, update, patch, and delete marketing records in the Alliance Business
  Suite (ABS) Marketing Service via the REST API. Covers marketing campaigns, marketing
  areas, marketing lists, marketing leads, newsletters, email groups, email signatures,
  email templates, social media posts, social post buckets, and tracking-pixel
  retrieval, including atomic PATCH (JSON Patch) updates. All operations are tenant-scoped
  (except the public tracking pixel) and require a bearer token (see the absuite-login
  skill to authenticate).
---

# Alliance Business Suite — Marketing Skill (REST)

Manage marketing assets through the ABS Marketing Service REST API. Every Marketing
Service endpoint is tenant-scoped: pass `?tenantId=<tenant-guid>` (or the equivalent
`X-TenantId: <tenant-guid>` header) on **every** request — GET, POST, PUT, PATCH, and
DELETE alike. The single exception is the public **tracking pixel** read, which takes
no tenant.

> For the CLI equivalent see `absuite-marketing-cli`; for general REST conventions
> (envelope, tenant scoping, JSON Patch) see `absuite-rest`.

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

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/MarketingService/<Resource>`

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
Always check `isSuccess`; read the payload from `result` (an object, an array, an int
for `Count`, or `null`).

5. **Tenant scoping** — every Marketing Service operation here requires
`?tenantId=<tenant-guid>` on the query string (the platform also accepts the
`X-TenantId: <tenant-guid>` header equivalently). The only endpoint with **no** tenant
param is `GET /TrackingPixels/{pixelId}` — do not add a tenant to it.

## Key Concepts

- **Marketing Campaign** — a planned promotional effort with an offer, budget, costs,
  proposed/actual date windows, an expected-response rate, and an optional marketing
  area and budget currency.
- **Marketing Area** — a named market region/segment used to scope campaigns.
- **Marketing List** — a static or dynamic audience list targeting individuals,
  organizations, or leads, with purpose/source/cost metadata.
- **Marketing Lead** — a prospective contact (name, email, phone, company, job title,
  source, score, status).
- **Newsletter** — a named, titled, coded newsletter publication.
- **Email Group** — a named, optionally-described group used to organize email
  recipients (enabled/disabled).
- **Email Signature** / **Email Template** — content assets with a title, body content,
  markup, and a `codeType` rendering mode; templates can be tied to a campaign.
- **Social Media Post** — a titled post with content and an optional featured image,
  filed into a social post bucket.
- **Social Post Bucket** — a named container that groups social media posts.
- **Tracking Pixel** — a public read returning a pixel by its `pixelId` (no tenant).

### Enumerations (authoritative — from the OpenAPI spec)

- **`marketingListType`** — `Static` | `Dynamic`.
- **`marketingListTarget`** — `Individual` | `Organization` | `Lead`.
- **`codeType`** (email signatures & templates) — `Razor` | `CSharp` | `CSHtml` |
  `Liquid` | `Html5` | `Markdown` | `Markup`.

### Field-name conventions

Request bodies use **PascalCase** keys (e.g. `"Name"`, `"Title"`, `"CurrencyId"`,
`"MarketingAreaId"`). JSON-Patch `path` pointers use **camelCase** (e.g. `/name`,
`/active`, `/allocatedBudget`) — these mirror the response/DTO property names.

## Marketing Campaigns

```bash
# List (OData) — supports $filter/$top/$orderby query options
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Search — OData $filter (this is how "search" is expressed; no separate search endpoint)
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns?tenantId=<tenant-guid>&\$filter=contains(name,'Spring')&\$top=25" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns/<campaign-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Spring Sale 2026",
    "Offer": "20% off all products",
    "Active": true,
    "ProposedStart": "2026-03-01T00:00:00Z",
    "ProposedEnd": "2026-04-30T23:59:59Z",
    "ActualStart": null,
    "ActualEnd": null,
    "Code": "SPRING26",
    "AllocatedBudget": 10000.00,
    "ActivityCost": 0,
    "MiscCost": 0,
    "ExpectedResponsePercent": 5,
    "MarketingAreaId": "<area-guid>",
    "CurrencyId": "<currency-guid>"
  }'

# Update (PUT — full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns/<campaign-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Spring Sale 2026 (Extended)",
    "Offer": "25% off all products",
    "Active": true,
    "ProposedStart": "2026-03-01T00:00:00Z",
    "ProposedEnd": "2026-05-15T23:59:59Z",
    "Code": "SPRING26",
    "AllocatedBudget": 12000.00,
    "ExpectedResponsePercent": 6,
    "MarketingAreaId": "<area-guid>",
    "CurrencyId": "<currency-guid>"
  }'

# Patch (PATCH — JSON Patch, partial update)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns/<campaign-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/active", "value": false },
    { "op": "replace", "path": "/actualEnd", "value": "2026-05-01T00:00:00Z" }
  ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns/<campaign-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**`MarketingCampaignCreateDto` fields:** `Id`, `Timestamp`, `Name`, `Offer`, `Active`
(boolean), `ProposedStart`, `ProposedEnd`, `ActualStart`, `ActualEnd` (date-times),
`Code`, `AllocatedBudget`, `ActivityCost`, `MiscCost`, `ExpectedResponsePercent`
(numbers), `MarketingAreaId`, `CurrencyId`.
**`MarketingCampaignUpdateDto`** has the same fields minus `Id`/`Timestamp`.

## Marketing Areas

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas/<area-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "North America",
    "Description": "North American market region"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas/<area-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "North America (NA)",
    "Description": "Updated region description"
  }'

# Patch (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas/<area-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/description", "value": "Revised description" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas/<area-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**`MarketingAreaCreateDto` fields:** `Id`, `Timestamp`, `Name` (**required**),
`Description`. **`MarketingAreaUpdateDto`:** `Name`, `Description`.

## Marketing Lists

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists/<list-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists/<list-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "VIP Customers",
    "Purpose": "Retention",
    "Description": "Refreshed segment",
    "Source": "CRM export",
    "Locked": true,
    "MarketingListType": "Dynamic",
    "MarketingListTarget": "Individual"
  }'

# Patch (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists/<list-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/marketingListType", "value": "Dynamic" },
    { "op": "replace", "path": "/locked", "value": true }
  ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists/<list-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**`MarketingListCreateDto` fields:** `Id`, `Timestamp`, `Locked` (boolean), `Name`,
`Purpose`, `Description`, `Source`, `Cost` (number), `ModifiedOn`, `LastUsedOn`
(date-times), `CurrencyId`, `MarketingListType` (`Static|Dynamic`), `MarketingListTarget`
(`Individual|Organization|Lead`). **`MarketingListUpdateDto`** is the same minus
`Id`/`Timestamp`.

## Marketing Leads

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads/<lead-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads/<lead-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "FirstName": "<first-name>",
    "LastName": "<last-name>",
    "Email": "<lead-email>",
    "Phone": "<phone>",
    "Company": "<company>",
    "JobTitle": "<job-title>",
    "Source": "Web form",
    "Status": "Qualified",
    "Notes": "Demo completed",
    "Score": 80
  }'

# Patch (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads/<lead-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/status", "value": "Qualified" },
    { "op": "replace", "path": "/score", "value": 80 }
  ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads/<lead-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**`MarketingLeadCreateDto` fields:** `Id`, `Timestamp`, `FirstName`, `LastName`,
`Email`, `Phone`, `Company`, `JobTitle`, `Source`, `Notes`, `Score` (integer).
**`MarketingLeadUpdateDto`** adds a `Status` field and drops `Id`/`Timestamp`:
`FirstName`, `LastName`, `Email`, `Phone`, `Company`, `JobTitle`, `Source`, `Status`,
`Notes`, `Score`.

## Newsletters

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/<newsletter-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Monthly Digest",
    "Code": "DIGEST-2026-04",
    "Title": "Monthly Digest — April 2026"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/<newsletter-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Monthly Digest",
    "Code": "DIGEST-2026-05",
    "Title": "Monthly Digest — May 2026"
  }'

# Patch (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/<newsletter-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/title", "value": "Monthly Digest — May 2026" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/<newsletter-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**`NewsletterCreateDto` fields:** `Id`, `Timestamp`, `Name`, `Code`, `Title`.
**`NewsletterUpdateDto`:** `Code`, `Title`, `Name`.

## Email Groups

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Newsletter Subscribers",
    "Description": "Opted-in newsletter audience",
    "Enabled": true
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Newsletter Subscribers",
    "Description": "Updated description",
    "Enabled": false
  }'

# Patch (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/enabled", "value": false } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**`EmailGroupCreateDto` fields:** `Id`, `Timestamp`, `Name`, `Description`, `Enabled`
(boolean). **`EmailGroupUpdateDto`:** `Name`, `Description`, `Enabled`.

## Email Signatures

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/<signature-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Corporate Signature",
    "Published": true,
    "Description": "Default outbound signature",
    "Code": "<p>Best regards,<br/>The Team</p>",
    "Markup": "<p>Best regards,<br/>The Team</p>",
    "FeaturedImageUrl": "https://cdn.example/sig.png",
    "CodeType": "Html5"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/<signature-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Corporate Signature",
    "HtmlContent": "<p>Best regards,<br/>The Team</p>",
    "CodeType": "Html5",
    "Published": true,
    "Default": true
  }'

# Patch (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/<signature-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/published", "value": true },
    { "op": "replace", "path": "/codeType", "value": "Liquid" }
  ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/<signature-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**`EmailSignatureCreateDto` fields:** `Id`, `Timestamp`, `Title` (**required**),
`Published` (boolean), `Description`, `Code`, `Markup`, `FeaturedImageUrl`, `CodeType`
(`Razor|CSharp|CSHtml|Liquid|Html5|Markdown|Markup`). **`EmailSignatureUpdateDto`** is a
large content DTO (the same shape as email templates) — its notable fields include
`Order`, `Slug`, `Name`, `Title`, `Excerpt`, `Description`, `CanonicalUrl`, SEO fields
(`SeoTitle`, `SeoKeyWords`, `SeoKeyPhrases`, `MetaDescription`), social-card fields
(`TwitterImage/Title/Description`, `FacebookImage/Title/Description`),
`FeaturedImageUrl`, `Content`, `Code`, `HtmlContent`, `CodeType`, `CSharpContent`,
`RazorContent`, `CssContent`, `JsContent`, and boolean flags such as `Template`,
`Default`, `Enable`, `Published`, `InTrashCan`, `SystemLocked`. Use PATCH for small edits
rather than resending the full body.

## Email Templates

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<template-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Welcome Email",
    "Published": true,
    "Description": "Sent on signup",
    "Code": "<h1>Welcome!</h1><p>Thanks for joining.</p>",
    "Markup": "<h1>Welcome!</h1><p>Thanks for joining.</p>",
    "FeaturedImageUrl": "https://cdn.example/welcome.png",
    "CodeType": "Liquid",
    "MarketingCampaignId": "<campaign-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<template-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Welcome Email",
    "HtmlContent": "<h1>Welcome!</h1><p>Thanks for joining.</p>",
    "CodeType": "Liquid",
    "Published": true,
    "MarketingCampaignId": "<campaign-guid>"
  }'

# Patch (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<template-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/published", "value": true },
    { "op": "replace", "path": "/marketingCampaignId", "value": "<campaign-guid>" }
  ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<template-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**`EmailTemplateCreateDto` fields:** `Id`, `Timestamp`, `Title` (**required**),
`Published` (boolean), `Description`, `Code`, `Markup`, `FeaturedImageUrl`, `CodeType`
(`Razor|CSharp|CSHtml|Liquid|Html5|Markdown|Markup`), `MarketingCampaignId`.
**`EmailTemplateUpdateDto`** is the same large content DTO as email signatures plus a
`MarketingCampaignId` field (notable fields: `Order`, `Slug`, `Name`, `Title`,
`Excerpt`, `Description`, SEO/social fields, `Content`, `Code`, `HtmlContent`,
`CodeType`, `CSharpContent`, `RazorContent`, `CssContent`, `JsContent`, and boolean
flags `Template`, `Default`, `Enable`, `Published`, `InTrashCan`, `SystemLocked`).

## Social Media Posts

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts/<post-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Spring Sale Announcement",
    "Content": "Get 20% off everything this spring! Use code SPRING26",
    "FeaturedImageUrl": "https://cdn.example/spring.png",
    "SocialPostBucketId": "<bucket-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts/<post-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Spring Sale — Final Days",
    "Content": "Last chance: 20% off ends Sunday. Code SPRING26",
    "FeaturedImageUrl": "https://cdn.example/spring-final.png",
    "SocialPostBucketId": "<bucket-guid>"
  }'

# Patch (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts/<post-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/socialPostBucketId", "value": "<bucket-guid>" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts/<post-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**`SocialMediaPostCreateDto` fields:** `Id`, `Timestamp`, `Title`, `Content`,
`FeaturedImageUrl`, `SocialPostBucketId`. **`SocialMediaPostUpdateDto`:** `Title`,
`Content`, `FeaturedImageUrl`, `SocialPostBucketId`.

## Social Post Buckets

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets/<bucket-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Spring Campaign Bucket"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets/<bucket-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Spring Campaign Bucket (2026)"
  }'

# Patch (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets/<bucket-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/name", "value": "Spring Campaign Bucket (2026)" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets/<bucket-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**`SocialPostBucketCreateDto` fields:** `Id`, `Timestamp`, `Name`.
**`SocialPostBucketUpdateDto`:** `Name`.

## Tracking Pixel

A **public** read — fetched by `pixelId` with **no** tenant param. Do not append
`?tenantId=`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/TrackingPixels/<pixel-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## PATCH (JSON Patch, RFC 6902)

PATCH performs an **atomic partial update**: send only the fields you want to change as a
JSON **array** of operations, rather than resending the whole object (safer than PUT for
concurrent edits). `Content-Type: application/json`, and `?tenantId=<tenant-guid>` is
still required on the request.

- Operations: `op` ∈ `add | remove | replace | move | copy | test`.
- `path` / `from` are JSON-Pointers: a leading `/` then the **camelCase** field name
  (e.g. `/active`, `/allocatedBudget`, `/marketingListType`).

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns/<campaign-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/active", "value": false },
    { "op": "replace", "path": "/expectedResponsePercent", "value": 7.5 }
  ]'
```

**PATCH is available on every Marketing Service aggregate:** Marketing Campaigns,
Marketing Areas, Marketing Lists, Marketing Leads, Newsletters, Email Groups, Email
Signatures, Email Templates, Social Media Posts, and Social Post Buckets. (The tracking
pixel is read-only and has no PATCH.)

## End-to-End Workflow

A campaign with a targeted list, a campaign-linked email template, and a scheduled
social post:

```bash
# 1) Create a marketing area
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "Name": "North America", "Description": "NA region" }'
# → result.id = <area-guid>

# 2) Create the campaign (referencing the area)
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "Name": "Spring Sale 2026", "Offer": "20% off", "Active": true,
        "Code": "SPRING26", "AllocatedBudget": 10000, "MarketingAreaId": "<area-guid>",
        "CurrencyId": "<currency-guid>" }'
# → result.id = <campaign-guid>

# 3) Create a target list
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "Name": "Spring VIPs", "MarketingListType": "Static", "MarketingListTarget": "Individual" }'

# 4) Create a campaign-linked email template
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "Title": "Spring Sale Email", "Published": true, "CodeType": "Liquid",
        "MarketingCampaignId": "<campaign-guid>" }'

# 5) Create a social bucket, then a post in it
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "Name": "Spring Campaign Bucket" }'
# → result.id = <bucket-guid>
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "Title": "Spring Sale!", "Content": "20% off — code SPRING26", "SocialPostBucketId": "<bucket-guid>" }'

# 6) Close the campaign with a PATCH when it ends
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns/<campaign-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/active", "value": false },
        { "op": "replace", "path": "/actualEnd", "value": "2026-05-01T00:00:00Z" } ]'
```

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| List campaigns | GET | `/api/v2/MarketingService/MarketingCampaigns` |
| Count campaigns | GET | `/api/v2/MarketingService/MarketingCampaigns/Count` |
| Get campaign | GET | `/api/v2/MarketingService/MarketingCampaigns/{marketingcampaignId}` |
| Create campaign | POST | `/api/v2/MarketingService/MarketingCampaigns` |
| Update campaign | PUT | `/api/v2/MarketingService/MarketingCampaigns/{marketingcampaignId}` |
| Patch campaign | PATCH | `/api/v2/MarketingService/MarketingCampaigns/{marketingcampaignId}` |
| Delete campaign | DELETE | `/api/v2/MarketingService/MarketingCampaigns/{marketingcampaignId}` |
| List areas | GET | `/api/v2/MarketingService/MarketingAreas` |
| Count areas | GET | `/api/v2/MarketingService/MarketingAreas/Count` |
| Get area | GET | `/api/v2/MarketingService/MarketingAreas/{marketingAreaId}` |
| Create area | POST | `/api/v2/MarketingService/MarketingAreas` |
| Update area | PUT | `/api/v2/MarketingService/MarketingAreas/{marketingAreaId}` |
| Patch area | PATCH | `/api/v2/MarketingService/MarketingAreas/{marketingAreaId}` |
| Delete area | DELETE | `/api/v2/MarketingService/MarketingAreas/{marketingAreaId}` |
| List lists | GET | `/api/v2/MarketingService/MarketingLists` |
| Count lists | GET | `/api/v2/MarketingService/MarketingLists/Count` |
| Get list | GET | `/api/v2/MarketingService/MarketingLists/{marketinglistId}` |
| Create list | POST | `/api/v2/MarketingService/MarketingLists` |
| Update list | PUT | `/api/v2/MarketingService/MarketingLists/{marketinglistId}` |
| Patch list | PATCH | `/api/v2/MarketingService/MarketingLists/{marketinglistId}` |
| Delete list | DELETE | `/api/v2/MarketingService/MarketingLists/{marketinglistId}` |
| List leads | GET | `/api/v2/MarketingService/MarketingLeads` |
| Count leads | GET | `/api/v2/MarketingService/MarketingLeads/Count` |
| Get lead | GET | `/api/v2/MarketingService/MarketingLeads/{marketingLeadId}` |
| Create lead | POST | `/api/v2/MarketingService/MarketingLeads` |
| Update lead | PUT | `/api/v2/MarketingService/MarketingLeads/{marketingLeadId}` |
| Patch lead | PATCH | `/api/v2/MarketingService/MarketingLeads/{marketingLeadId}` |
| Delete lead | DELETE | `/api/v2/MarketingService/MarketingLeads/{marketingLeadId}` |
| List newsletters | GET | `/api/v2/MarketingService/Newsletters` |
| Count newsletters | GET | `/api/v2/MarketingService/Newsletters/Count` |
| Get newsletter | GET | `/api/v2/MarketingService/Newsletters/{newsletterId}` |
| Create newsletter | POST | `/api/v2/MarketingService/Newsletters` |
| Update newsletter | PUT | `/api/v2/MarketingService/Newsletters/{newsletterId}` |
| Patch newsletter | PATCH | `/api/v2/MarketingService/Newsletters/{newsletterId}` |
| Delete newsletter | DELETE | `/api/v2/MarketingService/Newsletters/{newsletterId}` |
| List email groups | GET | `/api/v2/MarketingService/EmailGroups` |
| Count email groups | GET | `/api/v2/MarketingService/EmailGroups/Count` |
| Get email group | GET | `/api/v2/MarketingService/EmailGroups/{emailgroupId}` |
| Create email group | POST | `/api/v2/MarketingService/EmailGroups` |
| Update email group | PUT | `/api/v2/MarketingService/EmailGroups/{emailgroupId}` |
| Patch email group | PATCH | `/api/v2/MarketingService/EmailGroups/{emailgroupId}` |
| Delete email group | DELETE | `/api/v2/MarketingService/EmailGroups/{emailgroupId}` |
| List email signatures | GET | `/api/v2/MarketingService/EmailSignatures` |
| Count email signatures | GET | `/api/v2/MarketingService/EmailSignatures/Count` |
| Get email signature | GET | `/api/v2/MarketingService/EmailSignatures/{emailsignatureId}` |
| Create email signature | POST | `/api/v2/MarketingService/EmailSignatures` |
| Update email signature | PUT | `/api/v2/MarketingService/EmailSignatures/{emailsignatureId}` |
| Patch email signature | PATCH | `/api/v2/MarketingService/EmailSignatures/{emailsignatureId}` |
| Delete email signature | DELETE | `/api/v2/MarketingService/EmailSignatures/{emailsignatureId}` |
| List email templates | GET | `/api/v2/MarketingService/EmailTemplates` |
| Count email templates | GET | `/api/v2/MarketingService/EmailTemplates/Count` |
| Get email template | GET | `/api/v2/MarketingService/EmailTemplates/{emailTemplateId}` |
| Create email template | POST | `/api/v2/MarketingService/EmailTemplates` |
| Update email template | PUT | `/api/v2/MarketingService/EmailTemplates/{emailTemplateId}` |
| Patch email template | PATCH | `/api/v2/MarketingService/EmailTemplates/{emailTemplateId}` |
| Delete email template | DELETE | `/api/v2/MarketingService/EmailTemplates/{emailTemplateId}` |
| List social posts | GET | `/api/v2/MarketingService/SocialMediaPosts` |
| Count social posts | GET | `/api/v2/MarketingService/SocialMediaPosts/Count` |
| Get social post | GET | `/api/v2/MarketingService/SocialMediaPosts/{socialmediapostId}` |
| Create social post | POST | `/api/v2/MarketingService/SocialMediaPosts` |
| Update social post | PUT | `/api/v2/MarketingService/SocialMediaPosts/{socialmediapostId}` |
| Patch social post | PATCH | `/api/v2/MarketingService/SocialMediaPosts/{socialmediapostId}` |
| Delete social post | DELETE | `/api/v2/MarketingService/SocialMediaPosts/{socialmediapostId}` |
| List social buckets | GET | `/api/v2/MarketingService/SocialPostBuckets` |
| Count social buckets | GET | `/api/v2/MarketingService/SocialPostBuckets/Count` |
| Get social bucket | GET | `/api/v2/MarketingService/SocialPostBuckets/{socialpostbucketId}` |
| Create social bucket | POST | `/api/v2/MarketingService/SocialPostBuckets` |
| Update social bucket | PUT | `/api/v2/MarketingService/SocialPostBuckets/{socialpostbucketId}` |
| Patch social bucket | PATCH | `/api/v2/MarketingService/SocialPostBuckets/{socialpostbucketId}` |
| Delete social bucket | DELETE | `/api/v2/MarketingService/SocialPostBuckets/{socialpostbucketId}` |
| Get tracking pixel (public, no tenant) | GET | `/api/v2/MarketingService/TrackingPixels/{pixelId}` |

## Critical Rules

- **Authenticate first**, then send `Authorization: Bearer …` on every call.
- **Pass `?tenantId=<tenant-guid>` on every Marketing Service request** — including
  POST, PUT, PATCH, and DELETE. Omitting it on writes returns `400`. The only exception
  is `GET /TrackingPixels/{pixelId}` (public, no tenant).
- **List = OData.** The list endpoints accept OData query options (`$filter`, `$top`,
  `$orderby`, …); there is no separate "search" endpoint — express search via `$filter`.
- **PATCH bodies are JSON-Patch arrays** with camelCase `path` pointers; PUT bodies are
  full PascalCase objects.
- Always check `isSuccess` and read data from `result`.
