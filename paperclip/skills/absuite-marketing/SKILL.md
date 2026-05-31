---
name: absuite-marketing
description: >
  Manage marketing campaigns, email groups, email signatures, email templates,
  marketing lists, newsletters, social media posts, and social post buckets in the
  Alliance Business Suite (ABS) using the `absuite` CLI. Includes tracking pixel
  retrieval. Requires an authenticated CLI session.
---

# Alliance Business Suite — Marketing Skill

Manage marketing through the `absuite` CLI's `marketing` service. All operations are tenant-scoped.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite marketing list-commands`

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

## Campaigns

```bash
# List (OData)
absuite marketing get campaign-o-data --TenantId $TENANT_ID

# Count
absuite marketing count campaigns --TenantId $TENANT_ID

# Get details by ID
absuite marketing list campaign-details --TenantId $TENANT_ID --MarketingCampaignId <campaign-guid>

# Create
absuite marketing create campaign --TenantId $TENANT_ID --MarketingCampaignCreateDto '{
  "Name": "Spring Sale 2026",
  "Offer": "20% off all products",
  "Active": true,
  "ProposedStart": "2026-03-01T00:00:00Z",
  "ProposedEnd": "2026-04-30T23:59:59Z",
  "AllocatedBudget": 10000.00,
  "CurrencyId": "<currency-guid>",
  "Code": "SPRING26"
}'

# Update
absuite marketing update campaign --TenantId $TENANT_ID --MarketingCampaignId <campaign-guid> --MarketingCampaignUpdateDto '{...}'

# Delete
absuite marketing delete campaign --TenantId $TENANT_ID --MarketingCampaignId <campaign-guid>
```

REST API equivalent:

```bash
# List (OData)
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get details by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns/<campaign-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Spring Sale 2026",
    "Offer": "20% off all products",
    "Active": true,
    "ProposedStart": "2026-03-01T00:00:00Z",
    "ProposedEnd": "2026-04-30T23:59:59Z",
    "AllocatedBudget": 10000.00,
    "CurrencyId": "<currency-guid>",
    "Code": "SPRING26"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns/<campaign-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingCampaigns/<campaign-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Key MarketingCampaignCreateDto fields:**

| Field | Type | Description |
|---|---|---|
| `Name` | String | Campaign name |
| `Offer` | String | Campaign offer text |
| `Code` | String | Promo code |
| `Active` | Boolean | Whether campaign is active |
| `ProposedStart` / `ProposedEnd` | DateTime | Planned dates |
| `ActualStart` / `ActualEnd` | DateTime | Actual execution dates |
| `AllocatedBudget` | Double | Budget |
| `ActivityCost` / `MiscCost` | Double | Cost tracking |
| `ExpectedResponsePercent` | Double | Expected response rate |
| `CurrencyId` | String | Budget currency |

## Marketing Areas

```bash
absuite marketing get marketing-areas-o-data --TenantId $TENANT_ID
absuite marketing count marketing-areas --TenantId $TENANT_ID
absuite marketing list marketing-area-details --TenantId $TENANT_ID --MarketingAreaId <area-guid>
absuite marketing create marketing-area --TenantId $TENANT_ID --MarketingAreaAreaCreateDto '{
  "Name": "North America",
  "Description": "North American market region"
}'
absuite marketing update marketing-area --TenantId $TENANT_ID --MarketingAreaId <area-guid> --MarketingAreaUpdateDto '{...}'
absuite marketing delete marketing-area --TenantId $TENANT_ID --MarketingAreaId <area-guid>
```

REST API equivalent:

```bash
# List (OData)
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get details by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas/<area-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "North America",
    "Description": "North American market region"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas/<area-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingAreas/<area-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Marketing Lists

```bash
absuite marketing get list-o-data --TenantId $TENANT_ID
absuite marketing count lists --TenantId $TENANT_ID
absuite marketing list list-details --TenantId $TENANT_ID --MarketingListId <list-guid>
absuite marketing create list --TenantId $TENANT_ID --MarketingListCreateDto '{
  "Name": "VIP Customers",
  "Description": "High-value customer segment"
}'
absuite marketing update list --TenantId $TENANT_ID --MarketingListId <list-guid> --MarketingListUpdateDto '{...}'
absuite marketing delete list --TenantId $TENANT_ID --MarketingListId <list-guid>
```

REST API equivalent:

```bash
# List (OData)
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get details by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists/<list-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "VIP Customers",
    "Description": "High-value customer segment"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists/<list-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLists/<list-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Marketing Leads

```bash
absuite marketing get marketing-leads-o-data --TenantId $TENANT_ID
absuite marketing count marketing-leads --TenantId $TENANT_ID
absuite marketing list marketing-lead-details --TenantId $TENANT_ID --MarketingLeadId <lead-guid>
absuite marketing create marketing-lead --TenantId $TENANT_ID --MarketingLeadCreateDto '{
  "FirstName": "Jane",
  "LastName": "Doe",
  "Email": "jane@example.com",
  "Company": "Acme Corp"
}'
absuite marketing update marketing-lead --TenantId $TENANT_ID --MarketingLeadId <lead-guid> --MarketingLeadUpdateDto '{...}'
absuite marketing delete marketing-lead --TenantId $TENANT_ID --MarketingLeadId <lead-guid>
```

REST API equivalent:

```bash
# List (OData)
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get details by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads/<lead-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "FirstName": "Jane",
    "LastName": "Doe",
    "Email": "jane@example.com",
    "Company": "Acme Corp"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads/<lead-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/MarketingLeads/<lead-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Email Groups

```bash
absuite marketing get email-groups-o-data --TenantId $TENANT_ID
absuite marketing count email-groups --TenantId $TENANT_ID
absuite marketing list email-group-details --TenantId $TENANT_ID --EmailGroupId <group-guid>
absuite marketing create email-group --TenantId $TENANT_ID --EmailGroupCreateDto '{
  "Name": "Newsletter Subscribers"
}'
absuite marketing update email-group --TenantId $TENANT_ID --EmailGroupId <group-guid> --EmailGroupUpdateDto '{...}'
absuite marketing delete email-group --TenantId $TENANT_ID --EmailGroupId <group-guid>
```

REST API equivalent:

```bash
# List (OData)
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get details by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Newsletter Subscribers"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailGroups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Email Signatures

```bash
absuite marketing get email-signatures-o-data --TenantId $TENANT_ID
absuite marketing count email-signatures --TenantId $TENANT_ID
absuite marketing list email-signature-details --TenantId $TENANT_ID --EmailSignatureId <sig-guid>
absuite marketing create email-signature --TenantId $TENANT_ID --EmailSignatureCreateDto '{
  "Name": "Corporate Signature",
  "Content": "<p>Best regards,<br/>Acme Corp</p>"
}'
absuite marketing update email-signature --TenantId $TENANT_ID --EmailSignatureId <sig-guid> --EmailSignatureUpdateDto '{...}'
absuite marketing delete email-signature --TenantId $TENANT_ID --EmailSignatureId <sig-guid>
```

REST API equivalent:

```bash
# List (OData)
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get details by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/<sig-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Corporate Signature",
    "Content": "<p>Best regards,<br/>Acme Corp</p>"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/<sig-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailSignatures/<sig-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Email Templates

```bash
absuite marketing get email-templates-o-data --TenantId $TENANT_ID
absuite marketing count email-templates --TenantId $TENANT_ID
absuite marketing list email-template-details --TenantId $TENANT_ID --EmailTemplateId <template-guid>
absuite marketing create email-template --TenantId $TENANT_ID --EmailTemplateCreateDto '{
  "Name": "Welcome Email",
  "Subject": "Welcome to {{CompanyName}}",
  "Body": "<h1>Welcome!</h1><p>Thank you for joining.</p>"
}'
absuite marketing update email-template --TenantId $TENANT_ID --EmailTemplateId <template-guid> --EmailTemplateUpdateDto '{...}'
absuite marketing delete email-template --TenantId $TENANT_ID --EmailTemplateId <template-guid>
```

REST API equivalent:

```bash
# List (OData)
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get details by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<template-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Welcome Email",
    "Subject": "Welcome to {{CompanyName}}",
    "Body": "<h1>Welcome!</h1><p>Thank you for joining.</p>"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<template-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/EmailTemplates/<template-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Newsletters

```bash
absuite marketing get newsletter-o-data --TenantId $TENANT_ID
absuite marketing count newsletters --TenantId $TENANT_ID
absuite marketing list newsletter-details --TenantId $TENANT_ID --NewsletterId <newsletter-guid>
absuite marketing create newsletter --TenantId $TENANT_ID --NewsletterCreateDto '{
  "Name": "Monthly Digest - April 2026"
}'
absuite marketing update newsletter --TenantId $TENANT_ID --NewsletterId <newsletter-guid> --NewsletterUpdateDto '{...}'
absuite marketing delete newsletter --TenantId $TENANT_ID --NewsletterId <newsletter-guid>
```

REST API equivalent:

```bash
# List (OData)
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get details by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/<newsletter-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Monthly Digest - April 2026"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/<newsletter-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/Newsletters/<newsletter-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Social Media Posts

```bash
absuite marketing get social-media-posts-o-data --TenantId $TENANT_ID
absuite marketing count social-media-posts --TenantId $TENANT_ID
absuite marketing list social-media-post-details --TenantId $TENANT_ID --SocialMediaPostId <post-guid>
absuite marketing create social-media-post --TenantId $TENANT_ID --SocialMediaPostCreateDto '{
  "Title": "Spring Sale Announcement",
  "Content": "Get 20% off everything this spring! Use code SPRING26"
}'
absuite marketing update social-media-post --TenantId $TENANT_ID --SocialMediaPostId <post-guid> --SocialMediaPostUpdateDto '{...}'
absuite marketing delete social-media-post --TenantId $TENANT_ID --SocialMediaPostId <post-guid>
```

REST API equivalent:

```bash
# List (OData)
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get details by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Spring Sale Announcement",
    "Content": "Get 20% off everything this spring! Use code SPRING26"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialMediaPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Social Post Buckets

Organize social media posts into scheduled buckets.

```bash
absuite marketing get social-post-buckets-o-data --TenantId $TENANT_ID
absuite marketing count social-post-buckets --TenantId $TENANT_ID
absuite marketing list social-post-bucket-details --TenantId $TENANT_ID --SocialPostBucketId <bucket-guid>
absuite marketing create social-post-bucket --TenantId $TENANT_ID --SocialPostBucketCreateDto '{...}'
absuite marketing update social-post-bucket --TenantId $TENANT_ID --SocialPostBucketId <bucket-guid> --SocialPostBucketUpdateDto '{...}'
absuite marketing delete social-post-bucket --TenantId $TENANT_ID --SocialPostBucketId <bucket-guid>
```

REST API equivalent:

```bash
# List (OData)
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get details by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets/<bucket-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets/<bucket-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/MarketingService/SocialPostBuckets/<bucket-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Tracking Pixel

```bash
absuite marketing get tracking-pixel --TenantId $TENANT_ID
```

REST API equivalent:

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/MarketingService/TrackingPixels/<pixel-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List campaigns | `absuite marketing get campaign-o-data --TenantId <guid>` |
| Create campaign | `absuite marketing create campaign --TenantId <guid> --MarketingCampaignCreateDto '{...}'` |
| List marketing areas | `absuite marketing get marketing-areas-o-data --TenantId <guid>` |
| Create marketing area | `absuite marketing create marketing-area --TenantId <guid> --MarketingAreaAreaCreateDto '{...}'` |
| List marketing lists | `absuite marketing get list-o-data --TenantId <guid>` |
| Create marketing list | `absuite marketing create list --TenantId <guid> --MarketingListCreateDto '{...}'` |
| List marketing leads | `absuite marketing get marketing-leads-o-data --TenantId <guid>` |
| Create marketing lead | `absuite marketing create marketing-lead --TenantId <guid> --MarketingLeadCreateDto '{...}'` |
| List email templates | `absuite marketing get email-templates-o-data --TenantId <guid>` |
| Create email template | `absuite marketing create email-template --TenantId <guid> --EmailTemplateCreateDto '{...}'` |
| List email groups | `absuite marketing get email-groups-o-data --TenantId <guid>` |
| Create email group | `absuite marketing create email-group --TenantId <guid> --EmailGroupCreateDto '{...}'` |
| List email signatures | `absuite marketing get email-signatures-o-data --TenantId <guid>` |
| Create email signature | `absuite marketing create email-signature --TenantId <guid> --EmailSignatureCreateDto '{...}'` |
| List newsletters | `absuite marketing get newsletter-o-data --TenantId <guid>` |
| Create newsletter | `absuite marketing create newsletter --TenantId <guid> --NewsletterCreateDto '{...}'` |
| List social media posts | `absuite marketing get social-media-posts-o-data --TenantId <guid>` |
| Create social media post | `absuite marketing create social-media-post --TenantId <guid> --SocialMediaPostCreateDto '{...}'` |
| List social post buckets | `absuite marketing get social-post-buckets-o-data --TenantId <guid>` |
| Create social post bucket | `absuite marketing create social-post-bucket --TenantId <guid> --SocialPostBucketCreateDto '{...}'` |
| Get tracking pixel | `absuite marketing get tracking-pixel --TenantId <guid>` |

## Critical Rules

- **Authenticate first.** Always provide a tenant context.
- **List commands use OData** (e.g., `get campaign-o-data`), while detail views use `list *-details`.
- **Use `--help`** on any command for full DTO schemas.

## API Endpoints Quick Reference

| Resource | Method | Endpoint |
|---|---|---|
| Marketing Campaigns | GET | `/api/v2/MarketingService/MarketingCampaigns` |
| Marketing Campaigns | POST | `/api/v2/MarketingService/MarketingCampaigns` |
| Campaign by ID | GET | `/api/v2/MarketingService/MarketingCampaigns/:marketingcampaignId` |
| Campaign by ID | PUT | `/api/v2/MarketingService/MarketingCampaigns/:marketingcampaignId` |
| Campaign by ID | DELETE | `/api/v2/MarketingService/MarketingCampaigns/:marketingcampaignId` |
| Campaigns Count | GET | `/api/v2/MarketingService/MarketingCampaigns/Count` |
| Marketing Areas | GET | `/api/v2/MarketingService/MarketingAreas` |
| Marketing Areas | POST | `/api/v2/MarketingService/MarketingAreas` |
| Area by ID | GET | `/api/v2/MarketingService/MarketingAreas/:marketingAreaId` |
| Area by ID | PUT | `/api/v2/MarketingService/MarketingAreas/:marketingAreaId` |
| Area by ID | DELETE | `/api/v2/MarketingService/MarketingAreas/:marketingAreaId` |
| Areas Count | GET | `/api/v2/MarketingService/MarketingAreas/Count` |
| Marketing Lists | GET | `/api/v2/MarketingService/MarketingLists` |
| Marketing Lists | POST | `/api/v2/MarketingService/MarketingLists` |
| List by ID | GET | `/api/v2/MarketingService/MarketingLists/:marketinglistId` |
| List by ID | PUT | `/api/v2/MarketingService/MarketingLists/:marketinglistId` |
| List by ID | DELETE | `/api/v2/MarketingService/MarketingLists/:marketinglistId` |
| Lists Count | GET | `/api/v2/MarketingService/MarketingLists/Count` |
| Marketing Leads | GET | `/api/v2/MarketingService/MarketingLeads` |
| Marketing Leads | POST | `/api/v2/MarketingService/MarketingLeads` |
| Lead by ID | GET | `/api/v2/MarketingService/MarketingLeads/:marketingLeadId` |
| Lead by ID | PUT | `/api/v2/MarketingService/MarketingLeads/:marketingLeadId` |
| Lead by ID | DELETE | `/api/v2/MarketingService/MarketingLeads/:marketingLeadId` |
| Leads Count | GET | `/api/v2/MarketingService/MarketingLeads/Count` |
| Email Signatures | GET | `/api/v2/MarketingService/EmailSignatures` |
| Email Signatures | POST | `/api/v2/MarketingService/EmailSignatures` |
| Signature by ID | GET | `/api/v2/MarketingService/EmailSignatures/:emailsignatureId` |
| Signature by ID | PUT | `/api/v2/MarketingService/EmailSignatures/:emailsignatureId` |
| Signature by ID | DELETE | `/api/v2/MarketingService/EmailSignatures/:emailsignatureId` |
| Signatures Count | GET | `/api/v2/MarketingService/EmailSignatures/Count` |
| Email Templates | GET | `/api/v2/MarketingService/EmailTemplates` |
| Email Templates | POST | `/api/v2/MarketingService/EmailTemplates` |
| Template by ID | GET | `/api/v2/MarketingService/EmailTemplates/:emailTemplateId` |
| Template by ID | PUT | `/api/v2/MarketingService/EmailTemplates/:emailTemplateId` |
| Template by ID | DELETE | `/api/v2/MarketingService/EmailTemplates/:emailTemplateId` |
| Templates Count | GET | `/api/v2/MarketingService/EmailTemplates/Count` |
| Email Groups | GET | `/api/v2/MarketingService/EmailGroups` |
| Email Groups | POST | `/api/v2/MarketingService/EmailGroups` |
| Group by ID | GET | `/api/v2/MarketingService/EmailGroups/:emailgroupId` |
| Group by ID | PUT | `/api/v2/MarketingService/EmailGroups/:emailgroupId` |
| Group by ID | DELETE | `/api/v2/MarketingService/EmailGroups/:emailgroupId` |
| Groups Count | GET | `/api/v2/MarketingService/EmailGroups/Count` |
| Social Media Posts | GET | `/api/v2/MarketingService/SocialMediaPosts` |
| Social Media Posts | POST | `/api/v2/MarketingService/SocialMediaPosts` |
| Social Media Post by ID | GET | `/api/v2/MarketingService/SocialMediaPosts/:socialmediapostId` |
| Social Media Post by ID | PUT | `/api/v2/MarketingService/SocialMediaPosts/:socialmediapostId` |
| Social Media Post by ID | DELETE | `/api/v2/MarketingService/SocialMediaPosts/:socialmediapostId` |
| Social Media Posts Count | GET | `/api/v2/MarketingService/SocialMediaPosts/Count` |
| Newsletters | GET | `/api/v2/MarketingService/Newsletters` |
| Newsletters | POST | `/api/v2/MarketingService/Newsletters` |
| Newsletter by ID | GET | `/api/v2/MarketingService/Newsletters/:newsletterId` |
| Newsletter by ID | PUT | `/api/v2/MarketingService/Newsletters/:newsletterId` |
| Newsletter by ID | DELETE | `/api/v2/MarketingService/Newsletters/:newsletterId` |
| Newsletters Count | GET | `/api/v2/MarketingService/Newsletters/Count` |
| Social Post Buckets | GET | `/api/v2/MarketingService/SocialPostBuckets` |
| Social Post Buckets | POST | `/api/v2/MarketingService/SocialPostBuckets` |
| Bucket by ID | GET | `/api/v2/MarketingService/SocialPostBuckets/:socialpostbucketId` |
| Bucket by ID | PUT | `/api/v2/MarketingService/SocialPostBuckets/:socialpostbucketId` |
| Bucket by ID | DELETE | `/api/v2/MarketingService/SocialPostBuckets/:socialpostbucketId` |
| Buckets Count | GET | `/api/v2/MarketingService/SocialPostBuckets/Count` |
| Tracking Pixel | GET | `/api/v2/MarketingService/TrackingPixels/:pixelId` |
