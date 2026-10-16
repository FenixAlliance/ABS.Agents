---
name: absuite-content
description: >
  Manage web content in the Alliance Business Suite (ABS) via the REST API — web
  portals, web pages, web-page categories/tags, web content blocks, web templates,
  website themes, web components, menu contexts, localization strings, business
  domains, and the full blog system (posts, authors, categories, tags, comments).
  Includes atomic PATCH (JSON Patch RFC 6902) updates. Most operations are
  tenant-scoped and require a bearer token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Content Skill (REST)

Drive the ABS **ContentService** directly over HTTP with `curl`. This skill is the
comprehensive content surface: web portals and their settings/options/domain bindings,
web pages (with categories and tags), web-page categories/tags, web content blocks,
web templates, website themes, web components, menu contexts, localization strings,
business domains, and the complete blog system (posts, authors, categories, tags,
comments). For a blog-only subset use the separate `absuite-blog` skill.

- For the CLI equivalent, see `absuite-content-cli`.
- For generic REST conventions (envelope, auth, paging), see `absuite-rest`.
- The portal **Initialize** / onboarding flow is documented in `absuite-onboarding` — it
  is referenced here but not duplicated.

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
  -d '{"email": "<user-email>", "password": "<user-password>"}'
```
Extract `accessToken` from the JSON response.

2. **Send it on every call:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/ContentService/<Resource>`

4. **Response envelope** — every response is wrapped:
```json
{ "isSuccess": true, "errorMessage": null, "correlationId": "...", "timestamp": "...", "result": <data|array|int|null> }
```
Always check `isSuccess`; read the payload from `result`.

## Tenant scoping (read carefully — it is per-endpoint)

ABS binds the tenant from the `?tenantId=<tenant-guid>` query param **or** the
`X-TenantId: <tenant-guid>` header (interchangeable). The rules below come straight
from the ContentService manifest:

- **Tenant REQUIRED** (`tenantId(query,req)`) — pass `?tenantId=<tenant-guid>` on **every**
  verb, including POST/PUT/PATCH/DELETE. Omitting it on a write returns 400. This applies
  to: Portals list/create/update/patch/delete + settings/domain-bindings, BusinessDomains
  (all), WebPages create/update/patch/delete + relations, WebPageCategories, WebPageTags,
  WebContents, WebComponents, WebTemplates, WebsiteThemes, MenuContexts, LocalizationStrings,
  BlogPostCategories, BlogPostTags, and all blog write/relation/comment operations.
- **Tenant OPTIONAL** (`tenantId(query,opt)`) — omit for the global/public view, pass to scope
  to a tenant. This applies to: `GET /BlogPosts` (list) and `GET /BlogPosts/Count`.
- **No tenantId param** — do **NOT** add a tenant param or header; it is ignored. This applies to:
  - `GET /Portals/Current`, `GET /Portals/Current/Options`, `GET /Portals/Root`,
    `GET /Portals/Search`, `POST /Portals/Initialize` (host/portal-scoped).
  - `GET /Portals/{portalId}`, `GET /Portals/{portalId}/Options`, `GET /Portals/{portalId}/Settings`
    (resolved by portal id).
  - `GET /BlogPosts/{blogPostId}` and the blog sub-reads
    (`/BlogPostAuthors`, `.../Categories`, `.../Tags`, `.../Comments`, `.../Replies`),
    and `GET /WebPages/{webPageId}/Categories`, `GET /WebPages/{webPageId}/Tags`.
  - `GET /Themes/Update`.

> Note the header is `X-TenantId` (no second hyphen). `X-Tenant-ID` is **not** read by the platform.

---

## Web Portals

```bash
# List portals (tenant required)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count portals
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get portal by ID (NO tenantId — resolved by portal id)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a portal
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/Portals?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Main Website",
    "Domain": "www.example.com",
    "Description": "Company main website",
    "Root": false,
    "Disabled": false,
    "WebsiteThemeId": "<theme-guid>",
    "BusinessDomainId": "<domain-guid>",
    "BusinessPortalApplicationId": "<app-guid>"
  }'

# Update a portal (PUT — full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Updated Website Title",
    "Domain": "www.example.com",
    "Description": "Updated description",
    "Root": false,
    "Disabled": false,
    "WebsiteThemeId": "<theme-guid>",
    "BusinessDomainId": "<domain-guid>",
    "BusinessPortalApplicationId": "<app-guid>"
  }'

# Patch a portal (PARTIAL — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ {"op": "replace", "path": "/title", "value": "New Title"} ]'

# Delete a portal
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**WebPortalCreateDto / WebPortalUpdateDto fields:** `Title`, `Domain`, `Description`,
`Root` (bool), `Disabled` (bool), `WebsiteThemeId`, `BusinessDomainId`,
`BusinessPortalApplicationId`. (Create also accepts `Id`, `Timestamp`.)

### Current / Root / Search / Initialize portals (host-scoped — NO tenantId)

```bash
# Current portal (resolved from the request host)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Current" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Current portal options
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Current/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Root portal
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Root" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Search a portal by its domain (domain query param is REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Search?domain=www.example.com" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Initialize the current portal (onboarding flow — see absuite-onboarding)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Initialize" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Portal options & settings

```bash
# Options by portal ID (NO tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Settings by portal ID (NO tenantId on GET)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>/Settings" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update settings (tenant required) — body is a PortalSettings object
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>/Settings?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Enable": true,
    "PortalID": "<portal-guid>",
    "Scopes": "...",
    "TenantID": "<tenant-guid>",
    "HomePageID": "<page-guid>",
    "BlogPageID": "<page-guid>",
    "StorePageID": "<page-guid>",
    "BaseEndpoint": "https://api.example.com",
    "StoreRoutePrefix": "store",
    "PublicKey": "...",
    "PrivateKey": "...",
    "AuthToken": "...",
    "AuthTokenType": "Bearer",
    "AuthTokenExpiration": 3600
  }'
```

**PortalSettings fields:** `Enable` (bool), `PortalID`, `Scopes`, `TenantID`, `HomePageID`,
`BlogPageID`, `StorePageID`, `BaseEndpoint`, `StoreRoutePrefix`, `PublicKey`, `PrivateKey`,
`AuthToken`, `AuthTokenType`, `AuthTokenExpiration` (int), `Options` (PortalOptions object).

### Portal domain bindings

```bash
# Get a portal's bound domains
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>/DomainBindings?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Bind a domain to a portal
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>/DomainBindings/<domain-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unbind a domain from a portal
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>/DomainBindings/<domain-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Business Domains

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BusinessDomains?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BusinessDomains/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BusinessDomains/<domain-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Register a business domain (Domain is REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BusinessDomains?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Domain": "shop.example.com" }'

# Update a business domain
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BusinessDomains/<domain-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Domain": "store.example.com" }'

# Verify a business domain (DNS/ownership check)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BusinessDomains/<domain-guid>/Verify?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Delete a business domain
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BusinessDomains/<domain-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**BusinessDomainCreateDto:** `Domain` (REQUIRED) (+ `Id`, `Timestamp`). **UpdateDto:** `Domain`.

---

## Web Pages

```bash
# List / Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a web page (Title is REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "About Us",
    "Description": "Company about page",
    "Published": true,
    "Code": "<h1>About Us</h1>",
    "Markup": "",
    "FeaturedImageUrl": "https://cdn.example.com/about.png",
    "CodeType": "Html5",
    "Slug": "about-us",
    "WebTemplateId": "<template-guid>",
    "ParentWebContentId": "<content-guid>"
  }'

# Update a web page (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "About Our Company",
    "Slug": "about-us",
    "HtmlContent": "<h1>About Our Company</h1>",
    "CodeType": "Html5",
    "Published": true,
    "IsHomePage": false
  }'

# Patch a web page (JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ {"op": "replace", "path": "/published", "value": true} ]'

# Delete a web page
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**WebPageCreateDto fields:** `Title` (REQUIRED), `Published` (bool), `Description`, `Code`,
`Markup`, `FeaturedImageUrl`, `CodeType` (enum, see below), `Slug`, `WebTemplateId`,
`ParentWebContentId` (+ `Id`, `Timestamp`).

**WebPageUpdateDto fields** (large; all optional): `Order` (int), `Slug`, `Name`, `Title`,
`Excerpt`, `Password`, `Description`, `HighlightImage`, `CanonicalUrl`, `SeoTitle`,
`SeoKeyWords`, `SeoKeyPhrases`, `MetaDescription`, `TwitterImage`, `TwitterTitle`,
`TwitterDescription`, `FacebookImage`, `FacebookTitle`, `FacebookDescription`,
`FeaturedImageUrl`, `Content`, `Code`, `Namespace`, `TypeName`, `GeneratedCode`,
`CompilationPath`, `HtmlContent`, `CodeType`, `CSharpContent`, `RazorContent`, `CssContent`,
`JsContent`, `CssFiles`, `JsFiles`, `RazorGeneratedCode`, `CSharpGeneratedCode`,
`PrecompiledLogicSize` (int), `PrecompiledLogicSizeLong` (int), `PrecompiledViewSize` (int),
`PrecompiledViewSizeLong` (int), `PrecompiledLogicViewSize` (int), `Template` (bool),
`Default` (bool), `Enable` (bool), `EnableComments` (bool), `DisplaySocialBox` (bool),
`Published` (bool), `InTrashCan` (bool), `SystemLocked` (bool), `AllowPingbacks` (bool),
`AllowTrackbacks` (bool), `CornerstoneContent` (bool), `IsEssentialContent` (bool),
`AllowSearchEngineIndexing` (bool), `WebTemplateId`, `ParentWebContentId`, `IsHomePage` (bool),
`IsStorePage` (bool), `IsCartPage` (bool), `IsBlogPage` (bool), `IsAccountPage` (bool),
`IsCheckoutPage` (bool), `IsWishListsPage` (bool), `IsContactPage` (bool),
`IsPrivacyPolicyPage` (bool), `IsTermsOfServicePage` (bool).

### Web page ↔ category / tag relations

```bash
# Get a page's categories (NO tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create AND relate a new category to a page (body is WebPageCategoryCreateDto)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Categories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "Tutorials", "Slug": "tutorials" }'

# Relate an EXISTING category to a page
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Categories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unrelate a category from a page
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Categories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a page's tags (NO tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Tags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create AND relate a new tag to a page (body is WebPageTagCreateDto)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Tags?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "dotnet", "Slug": "dotnet" }'

# Relate an EXISTING tag to a page
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Tags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unrelate a tag from a page
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Tags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Web Page Categories

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Tutorials",
    "Slug": "tutorials",
    "Description": "How-to articles",
    "SeoTitle": "Tutorials",
    "MetaDescription": "...",
    "CornerstoneContent": false,
    "AllowSerachEngines": true,
    "SeoKeyPhrases": "...",
    "CanonicalUrl": "https://example.com/tutorials",
    "ImageURL": "https://cdn.example.com/cat.png",
    "WebPortalId": "<portal-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "Guides", "Slug": "guides" }'

# Patch (JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ {"op": "replace", "path": "/title", "value": "Guides"} ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**WebPageCategoryCreateDto fields:** `Slug`, `Title`, `Description`, `SeoTitle`,
`MetaDescription`, `CornerstoneContent` (bool), `AllowSerachEngines` (bool — note spelling),
`SeoKeyPhrases`, `CanonicalUrl`, `ImageURL`, `Image`, `WebPortalId` (+ `Id`, `Timestamp`).
**UpdateDto** is the same minus `WebPortalId`/`Id`/`Timestamp`.

---

## Web Page Tags

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "dotnet", "Slug": "dotnet", "WebPortalId": "<portal-guid>" }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "dotnet-core", "Slug": "dotnet-core" }'

# Patch (JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ {"op": "replace", "path": "/title", "value": "dotnet-core"} ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**WebPageTagCreateDto fields:** same shape as WebPageCategoryCreateDto (`Slug`, `Title`,
`Description`, `SeoTitle`, `MetaDescription`, `CornerstoneContent`, `AllowSerachEngines`,
`SeoKeyPhrases`, `CanonicalUrl`, `ImageURL`, `Image`, `WebPortalId`, `Id`, `Timestamp`).
**UpdateDto** drops `WebPortalId`/`Id`/`Timestamp`.

---

## Web Content Blocks

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents/<content-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (Title is REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Hero Section",
    "Published": true,
    "Description": "Landing hero block",
    "Code": "<div class=\"hero\">...</div>",
    "Markup": "",
    "FeaturedImageUrl": "https://cdn.example.com/hero.png",
    "CodeType": "Html5"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents/<content-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "Updated Hero", "HtmlContent": "<div>...</div>", "CodeType": "Html5", "Published": true }'

# Patch (JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents/<content-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ {"op": "replace", "path": "/published", "value": false} ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents/<content-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**WebContentCreateDto:** `Title` (REQUIRED), `Published` (bool), `Description`, `Code`,
`Markup`, `FeaturedImageUrl`, `CodeType` (+ `Id`, `Timestamp`). **WebContentUpdateDto** has
the same large field set as WebPageUpdateDto (minus the `Is*Page` flags and
`WebTemplateId`/`ParentWebContentId`).

---

## Web Templates

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates/<template-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Slug": "landing",
    "Name": "Landing Page Template",
    "Title": "Landing",
    "Description": "Marketing landing layout",
    "Content": "",
    "HtmlContent": "<html>...</html>",
    "CssContent": "...",
    "JsContent": "...",
    "RazorContent": "",
    "HighlightImage": "https://cdn.example.com/tpl.png",
    "Order": 0
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates/<template-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Name": "Updated Template", "HtmlContent": "<html>...</html>", "Order": 1 }'

# Patch (JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates/<template-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ {"op": "replace", "path": "/order", "value": 2} ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates/<template-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**WebTemplateCreateDto / UpdateDto fields:** `Slug`, `Name`, `Title`, `Description`,
`Content`, `HtmlContent`, `CssContent`, `JsContent`, `RazorContent`, `HighlightImage`,
`Order` (int) (+ `Id`, `Timestamp`).

---

## Website Themes

```bash
# List (supports OData via oDataQueryOptions)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes/<theme-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (Name is REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Dark Theme",
    "Description": "Dark mode theme",
    "AuthorName": "ACME",
    "AuthorUrl": "https://acme.example.com",
    "Version": "1.0.0",
    "Tags": "dark,modern",
    "Enable": true
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes/<theme-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Name": "Dark Theme v2", "Version": "2.0.0", "Enable": true }'

# Patch (JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes/<theme-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ {"op": "replace", "path": "/enable", "value": false} ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes/<theme-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update base web content themes (utility — NO tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Themes/Update" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**WebsiteThemeCreateDto / UpdateDto fields:** `Name` (REQUIRED on create), `Description`,
`AuthorName`, `AuthorUrl`, `Version`, `Tags`, `Enable` (bool) (+ `Id`, `Timestamp` on create).
The theme path id parameter is `{id}`.

---

## Web Components

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebComponents?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebComponents/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebComponents/<component-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (Name is REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebComponents?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "PricingCard",
    "Title": "Pricing Card",
    "Description": "Reusable pricing block",
    "Code": "",
    "HtmlContent": "<div class=\"card\">...</div>",
    "CssContent": "...",
    "JsContent": "...",
    "CodeType": "Html5",
    "Published": true,
    "Enable": true,
    "FeaturedImageUrl": "https://cdn.example.com/comp.png"
  }'

# Update (PUT — note: no PATCH for web components)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebComponents/<component-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Name": "PricingCard", "Title": "Updated Pricing Card", "Enable": true }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebComponents/<component-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**WebComponentCreateDto / UpdateDto fields:** `Name` (REQUIRED on create), `Title`,
`Description`, `Code`, `HtmlContent`, `CssContent`, `JsContent`, `CodeType` (enum),
`Published` (bool), `Enable` (bool), `FeaturedImageUrl` (+ `Id`, `Timestamp` on create).

---

## Menu Contexts

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/MenuContexts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/MenuContexts/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/MenuContexts/<menu-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (Name is REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/MenuContexts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "MainNav",
    "Category": "Header",
    "Component": "TopMenu",
    "Enable": true,
    "StudioMenu": false,
    "CustomCss": "",
    "CustomJs": "",
    "CustomHtml": "",
    "LoggedInOnly": "false",
    "BackgroundImage": "",
    "WebPortalId": "<portal-guid>"
  }'

# Update (PUT — no PATCH for menu contexts)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/MenuContexts/<menu-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Name": "MainNav", "Enable": false }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/MenuContexts/<menu-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**MenuContextCreateDto / UpdateDto fields:** `Name` (REQUIRED on create), `Category`,
`Component`, `Enable` (bool), `StudioMenu` (bool), `CustomCss`, `CustomJs`, `CustomHtml`,
`LoggedInOnly` (string), `BackgroundImage`, `WebPortalId` (+ `Id`, `Timestamp` on create).

---

## Localization Strings

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/LocalizationStrings?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/LocalizationStrings/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/LocalizationStrings/<string-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (Base is REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/LocalizationStrings?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Base": "welcome.title", "Comments": "Home hero heading", "CountryLanguageId": "<lang-guid>" }'

# Update (PUT — no PATCH for localization strings)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/LocalizationStrings/<string-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Base": "welcome.heading", "CountryLanguageId": "<lang-guid>" }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/LocalizationStrings/<string-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**LocalizationStringCreateDto / UpdateDto fields:** `Base` (REQUIRED on create), `Comments`,
`CountryLanguageId` (+ `Id`, `Timestamp` on create).

---

## Blog Posts

```bash
# List (tenant OPTIONAL — omit for global view, pass to scope)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count (tenant OPTIONAL)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID (NO tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (Title is REQUIRED, tenant required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Getting Started with ABS",
    "Published": false,
    "Description": "A quick guide to the Alliance Business Suite",
    "Code": "# Welcome\n\nThis is your first post.",
    "Markup": "",
    "FeaturedImageUrl": "https://cdn.example.com/post.png",
    "CodeType": "Markdown",
    "Slug": "getting-started-with-abs",
    "BlogPostCategoryId": "<category-guid>",
    "WebTemplateId": "<template-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "Getting Started with ABS (v2)", "Slug": "getting-started-with-abs", "Published": true }'

# Patch (JSON Patch — e.g. publish)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ {"op": "replace", "path": "/published", "value": true} ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**BlogPostCreateDto fields:** `Title` (REQUIRED), `Published` (bool), `Description`, `Code`,
`Markup`, `FeaturedImageUrl`, `CodeType` (enum), `Slug`, `BlogPostCategoryId`, `WebTemplateId`
(+ `Id`, `Timestamp`). **BlogPostUpdateDto** has the same large field set as WebPageUpdateDto
plus `BlogPostCategoryId` and `WebTemplateId` (no `Is*Page`/`ParentWebContentId` fields).

### Blog post ↔ category / tag / comment operations

```bash
# Categories of a post (NO tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create AND relate a new category to a post (body is BlogPostCategoryCreateDto)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Categories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "Technology", "Slug": "technology" }'

# Relate an EXISTING category to a post
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Categories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unrelate a category from a post
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Categories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Tags of a post (NO tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create AND relate a new tag to a post (body is BlogPostTagCreateDto)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "dotnet", "Slug": "dotnet" }'

# Relate an EXISTING tag to a post
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unrelate a tag from a post
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Comments of a post (NO tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a comment on a post (Message is REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Message": "Great post!", "OwnerSocialProfileId": "<social-guid>", "ParentCommentId": null }'

# Reply to a comment (Message is REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments/<comment-guid>/Reply?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Message": "Thanks for the feedback!" }'

# Replies for a comment (NO tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments/<comment-guid>/Replies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Delete a comment
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments/<comment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**BlogPostCommentCreateDto fields:** `Message` (REQUIRED), `OwnerSocialProfileId`,
`SocialPostId`, `ParentCommentId` (+ `Id`, `Timestamp`).

---

## Blog Post Authors (read-only)

```bash
# List authors (tenant OPTIONAL)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get author by ID (NO tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors/<author-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Posts by author (NO tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors/<author-guid>/BlogPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count posts by author (NO tenantId)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors/<author-guid>/BlogPosts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Blog Post Categories

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Technology",
    "Slug": "technology",
    "Type": "category",
    "Description": "Tech articles",
    "SeoTitle": "Technology",
    "MetaDescription": "...",
    "CornerstoneContent": false,
    "AllowSerachEngines": true,
    "SeoKeyPhrases": "...",
    "CanonicalUrl": "https://example.com/blog/technology",
    "ImageURL": "https://cdn.example.com/tech.png",
    "WebPortalId": "<portal-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "Tech & Engineering", "Slug": "tech-engineering" }'

# Patch (JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ {"op": "replace", "path": "/title", "value": "Tech & Engineering"} ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**BlogPostCategoryCreateDto fields:** `Slug`, `Type`, `Title`, `Description`, `SeoTitle`,
`MetaDescription`, `CornerstoneContent` (bool), `AllowSerachEngines` (bool), `SeoKeyPhrases`,
`CanonicalUrl`, `ImageURL`, `Image`, `WebPortalId` (+ `Id`, `Timestamp`). **UpdateDto** drops
`WebPortalId`/`Id`/`Timestamp`.

---

## Blog Post Tags

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "dotnet", "Slug": "dotnet", "Type": "tag", "WebPortalId": "<portal-guid>" }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "dotnet-10", "Slug": "dotnet-10" }'

# Patch (JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ {"op": "replace", "path": "/title", "value": "dotnet-10"} ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**BlogPostTagCreateDto fields:** `Slug`, `Type`, `Title`, `Description`, `SeoTitle`,
`MetaDescription`, `CornerstoneContent` (bool), `AllowSerachEngines` (bool), `SeoKeyPhrases`,
`CanonicalUrl`, `ImageURL`, `Image`, `WebPortalId` (+ `Id`, `Timestamp`). **UpdateDto** drops
`WebPortalId`/`Id`/`Timestamp`.

---

## Enums

- **CodeType** (used by WebPages, WebContents, WebComponents, BlogPosts):
  `Razor | CSharp | CSHtml | Liquid | Html5 | Markdown | Markup`.

## PATCH (JSON Patch RFC 6902)

PATCH bodies are a JSON **array** of operations with `Content-Type: application/json`.
`op` ∈ `add | remove | replace | move | copy | test`; `path`/`from` are JSON-Pointers with
a leading `/` and a **camelCase** field name (matching the serialized JSON, e.g. `/title`,
`/published`, `/enable`, `/order`). Always include `?tenantId=<tenant-guid>` on PATCH.

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {"op": "replace", "path": "/title", "value": "About Our Company"},
    {"op": "replace", "path": "/published", "value": true},
    {"op": "replace", "path": "/isHomePage", "value": false}
  ]'
```

**Resources that support PATCH:** Portals, WebPages, WebPageCategories, WebPageTags,
WebContents, WebTemplates, WebsiteThemes, BlogPosts, BlogPostCategories, BlogPostTags.
**No PATCH** on: WebComponents, MenuContexts, LocalizationStrings, BusinessDomains, Portal
Settings (use PUT for those).

## End-to-end workflow: publish a web page

```bash
HOST="$ABSUITE_HOST_URL/api/v2/ContentService"
AUTH="-H Authorization:\ Bearer\ $ABSUITE_ACCESS_TOKEN"
T="tenantId=<tenant-guid>"

# 1. Create the page (draft)
curl -X POST "$HOST/WebPages?$T" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Title":"Pricing","Slug":"pricing","CodeType":"Html5","Published":false}'
# -> capture result.id (the new <page-guid>)

# 2. Create + relate a category in one step
curl -X POST "$HOST/WebPages/<page-guid>/Categories?$T" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"Title":"Marketing","Slug":"marketing"}'

# 3. Patch it live (atomic publish)
curl -X PATCH "$HOST/WebPages/<page-guid>?$T" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op":"replace","path":"/published","value":true}]'

# 4. Verify
curl -X GET "$HOST/WebPages/<page-guid>?$T" -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| List portals | GET | `/api/v2/ContentService/Portals` |
| Count portals | GET | `/api/v2/ContentService/Portals/Count` |
| Create portal | POST | `/api/v2/ContentService/Portals` |
| Get portal by ID | GET | `/api/v2/ContentService/Portals/{portalId}` |
| Update portal | PUT | `/api/v2/ContentService/Portals/{portalId}` |
| Patch portal | PATCH | `/api/v2/ContentService/Portals/{portalId}` |
| Delete portal | DELETE | `/api/v2/ContentService/Portals/{portalId}` |
| Current portal | GET | `/api/v2/ContentService/Portals/Current` |
| Current portal options | GET | `/api/v2/ContentService/Portals/Current/Options` |
| Root portal | GET | `/api/v2/ContentService/Portals/Root` |
| Search portal by domain | GET | `/api/v2/ContentService/Portals/Search` |
| Initialize current portal | POST | `/api/v2/ContentService/Portals/Initialize` |
| Portal options | GET | `/api/v2/ContentService/Portals/{portalId}/Options` |
| Portal settings | GET | `/api/v2/ContentService/Portals/{portalId}/Settings` |
| Update portal settings | PUT | `/api/v2/ContentService/Portals/{portalId}/Settings` |
| Portal domain bindings | GET | `/api/v2/ContentService/Portals/{portalId}/DomainBindings` |
| Bind portal domain | POST | `/api/v2/ContentService/Portals/{portalId}/DomainBindings/{businessDomainId}` |
| Unbind portal domain | DELETE | `/api/v2/ContentService/Portals/{portalId}/DomainBindings/{businessDomainId}` |
| List business domains | GET | `/api/v2/ContentService/BusinessDomains` |
| Count business domains | GET | `/api/v2/ContentService/BusinessDomains/Count` |
| Register business domain | POST | `/api/v2/ContentService/BusinessDomains` |
| Get business domain by ID | GET | `/api/v2/ContentService/BusinessDomains/{businessDomainId}` |
| Update business domain | PUT | `/api/v2/ContentService/BusinessDomains/{businessDomainId}` |
| Verify business domain | POST | `/api/v2/ContentService/BusinessDomains/{businessDomainId}/Verify` |
| Delete business domain | DELETE | `/api/v2/ContentService/BusinessDomains/{businessDomainId}` |
| List web pages | GET | `/api/v2/ContentService/WebPages` |
| Count web pages | GET | `/api/v2/ContentService/WebPages/Count` |
| Create web page | POST | `/api/v2/ContentService/WebPages` |
| Get web page by ID | GET | `/api/v2/ContentService/WebPages/{webPageId}` |
| Update web page | PUT | `/api/v2/ContentService/WebPages/{webPageId}` |
| Patch web page | PATCH | `/api/v2/ContentService/WebPages/{webPageId}` |
| Delete web page | DELETE | `/api/v2/ContentService/WebPages/{webPageId}` |
| Get web page categories | GET | `/api/v2/ContentService/WebPages/{webPageId}/Categories` |
| Create+relate web page category | POST | `/api/v2/ContentService/WebPages/{webPageId}/Categories` |
| Relate web page to category | POST | `/api/v2/ContentService/WebPages/{webPageId}/Categories/{categoryId}` |
| Unrelate web page category | DELETE | `/api/v2/ContentService/WebPages/{webPageId}/Categories/{categoryId}` |
| Get web page tags | GET | `/api/v2/ContentService/WebPages/{webPageId}/Tags` |
| Create+relate web page tag | POST | `/api/v2/ContentService/WebPages/{webPageId}/Tags` |
| Relate web page to tag | POST | `/api/v2/ContentService/WebPages/{webPageId}/Tags/{tagId}` |
| Unrelate web page tag | DELETE | `/api/v2/ContentService/WebPages/{webPageId}/Tags/{tagId}` |
| List web page categories | GET | `/api/v2/ContentService/WebPageCategories` |
| Count web page categories | GET | `/api/v2/ContentService/WebPageCategories/Count` |
| Create web page category | POST | `/api/v2/ContentService/WebPageCategories` |
| Get web page category by ID | GET | `/api/v2/ContentService/WebPageCategories/{webPageCategoryId}` |
| Update web page category | PUT | `/api/v2/ContentService/WebPageCategories/{webPageCategoryId}` |
| Patch web page category | PATCH | `/api/v2/ContentService/WebPageCategories/{webPageCategoryId}` |
| Delete web page category | DELETE | `/api/v2/ContentService/WebPageCategories/{webPageCategoryId}` |
| List web page tags | GET | `/api/v2/ContentService/WebPageTags` |
| Count web page tags | GET | `/api/v2/ContentService/WebPageTags/Count` |
| Create web page tag | POST | `/api/v2/ContentService/WebPageTags` |
| Get web page tag by ID | GET | `/api/v2/ContentService/WebPageTags/{webPageTagId}` |
| Update web page tag | PUT | `/api/v2/ContentService/WebPageTags/{webPageTagId}` |
| Patch web page tag | PATCH | `/api/v2/ContentService/WebPageTags/{webPageTagId}` |
| Delete web page tag | DELETE | `/api/v2/ContentService/WebPageTags/{webPageTagId}` |
| List web contents | GET | `/api/v2/ContentService/WebContents` |
| Count web contents | GET | `/api/v2/ContentService/WebContents/Count` |
| Create web content | POST | `/api/v2/ContentService/WebContents` |
| Get web content by ID | GET | `/api/v2/ContentService/WebContents/{webContentId}` |
| Update web content | PUT | `/api/v2/ContentService/WebContents/{webContentId}` |
| Patch web content | PATCH | `/api/v2/ContentService/WebContents/{webContentId}` |
| Delete web content | DELETE | `/api/v2/ContentService/WebContents/{webContentId}` |
| List web templates | GET | `/api/v2/ContentService/WebTemplates` |
| Count web templates | GET | `/api/v2/ContentService/WebTemplates/Count` |
| Create web template | POST | `/api/v2/ContentService/WebTemplates` |
| Get web template by ID | GET | `/api/v2/ContentService/WebTemplates/{webTemplateId}` |
| Update web template | PUT | `/api/v2/ContentService/WebTemplates/{webTemplateId}` |
| Patch web template | PATCH | `/api/v2/ContentService/WebTemplates/{webTemplateId}` |
| Delete web template | DELETE | `/api/v2/ContentService/WebTemplates/{webTemplateId}` |
| List website themes | GET | `/api/v2/ContentService/WebsiteThemes` |
| Count website themes | GET | `/api/v2/ContentService/WebsiteThemes/Count` |
| Create website theme | POST | `/api/v2/ContentService/WebsiteThemes` |
| Get website theme by ID | GET | `/api/v2/ContentService/WebsiteThemes/{id}` |
| Update website theme | PUT | `/api/v2/ContentService/WebsiteThemes/{id}` |
| Patch website theme | PATCH | `/api/v2/ContentService/WebsiteThemes/{id}` |
| Delete website theme | DELETE | `/api/v2/ContentService/WebsiteThemes/{id}` |
| Update base themes | GET | `/api/v2/ContentService/Themes/Update` |
| List web components | GET | `/api/v2/ContentService/WebComponents` |
| Count web components | GET | `/api/v2/ContentService/WebComponents/Count` |
| Create web component | POST | `/api/v2/ContentService/WebComponents` |
| Get web component by ID | GET | `/api/v2/ContentService/WebComponents/{webComponentId}` |
| Update web component | PUT | `/api/v2/ContentService/WebComponents/{webComponentId}` |
| Delete web component | DELETE | `/api/v2/ContentService/WebComponents/{webComponentId}` |
| List menu contexts | GET | `/api/v2/ContentService/MenuContexts` |
| Count menu contexts | GET | `/api/v2/ContentService/MenuContexts/Count` |
| Create menu context | POST | `/api/v2/ContentService/MenuContexts` |
| Get menu context by ID | GET | `/api/v2/ContentService/MenuContexts/{menuContextId}` |
| Update menu context | PUT | `/api/v2/ContentService/MenuContexts/{menuContextId}` |
| Delete menu context | DELETE | `/api/v2/ContentService/MenuContexts/{menuContextId}` |
| List localization strings | GET | `/api/v2/ContentService/LocalizationStrings` |
| Count localization strings | GET | `/api/v2/ContentService/LocalizationStrings/Count` |
| Create localization string | POST | `/api/v2/ContentService/LocalizationStrings` |
| Get localization string by ID | GET | `/api/v2/ContentService/LocalizationStrings/{localizationStringId}` |
| Update localization string | PUT | `/api/v2/ContentService/LocalizationStrings/{localizationStringId}` |
| Delete localization string | DELETE | `/api/v2/ContentService/LocalizationStrings/{localizationStringId}` |
| List blog posts | GET | `/api/v2/ContentService/BlogPosts` |
| Count blog posts | GET | `/api/v2/ContentService/BlogPosts/Count` |
| Create blog post | POST | `/api/v2/ContentService/BlogPosts` |
| Get blog post by ID | GET | `/api/v2/ContentService/BlogPosts/{blogPostId}` |
| Update blog post | PUT | `/api/v2/ContentService/BlogPosts/{blogPostId}` |
| Patch blog post | PATCH | `/api/v2/ContentService/BlogPosts/{blogPostId}` |
| Delete blog post | DELETE | `/api/v2/ContentService/BlogPosts/{blogPostId}` |
| Get categories for blog post | GET | `/api/v2/ContentService/BlogPosts/{blogPostId}/Categories` |
| Create+relate category for blog post | POST | `/api/v2/ContentService/BlogPosts/{blogPostId}/Categories` |
| Relate category to blog post | POST | `/api/v2/ContentService/BlogPosts/{blogPostId}/Categories/{categoryId}` |
| Unrelate category from blog post | DELETE | `/api/v2/ContentService/BlogPosts/{blogPostId}/Categories/{categoryId}` |
| Get tags for blog post | GET | `/api/v2/ContentService/BlogPosts/{blogPostId}/Tags` |
| Create+relate tag for blog post | POST | `/api/v2/ContentService/BlogPosts/{blogPostId}/Tags` |
| Relate tag to blog post | POST | `/api/v2/ContentService/BlogPosts/{blogPostId}/Tags/{tagId}` |
| Unrelate tag from blog post | DELETE | `/api/v2/ContentService/BlogPosts/{blogPostId}/Tags/{tagId}` |
| Get comments for blog post | GET | `/api/v2/ContentService/BlogPosts/{blogPostId}/Comments` |
| Create comment for blog post | POST | `/api/v2/ContentService/BlogPosts/{blogPostId}/Comments` |
| Reply to comment | POST | `/api/v2/ContentService/BlogPosts/{blogPostId}/Comments/{commentId}/Reply` |
| Get replies for comment | GET | `/api/v2/ContentService/BlogPosts/{blogPostId}/Comments/{commentId}/Replies` |
| Delete comment from blog post | DELETE | `/api/v2/ContentService/BlogPosts/{blogPostId}/Comments/{commentId}` |
| List blog post authors | GET | `/api/v2/ContentService/BlogPostAuthors` |
| Get blog author by ID | GET | `/api/v2/ContentService/BlogPostAuthors/{authorId}` |
| Posts by author | GET | `/api/v2/ContentService/BlogPostAuthors/{authorId}/BlogPosts` |
| Count posts by author | GET | `/api/v2/ContentService/BlogPostAuthors/{authorId}/BlogPosts/Count` |
| List blog post categories | GET | `/api/v2/ContentService/BlogPostCategories` |
| Count blog post categories | GET | `/api/v2/ContentService/BlogPostCategories/Count` |
| Create blog post category | POST | `/api/v2/ContentService/BlogPostCategories` |
| Get blog post category by ID | GET | `/api/v2/ContentService/BlogPostCategories/{blogPostCategoryId}` |
| Update blog post category | PUT | `/api/v2/ContentService/BlogPostCategories/{blogPostCategoryId}` |
| Patch blog post category | PATCH | `/api/v2/ContentService/BlogPostCategories/{blogPostCategoryId}` |
| Delete blog post category | DELETE | `/api/v2/ContentService/BlogPostCategories/{blogPostCategoryId}` |
| List blog post tags | GET | `/api/v2/ContentService/BlogPostTags` |
| Count blog post tags | GET | `/api/v2/ContentService/BlogPostTags/Count` |
| Create blog post tag | POST | `/api/v2/ContentService/BlogPostTags` |
| Get blog post tag by ID | GET | `/api/v2/ContentService/BlogPostTags/{blogPostTagId}` |
| Update blog post tag | PUT | `/api/v2/ContentService/BlogPostTags/{blogPostTagId}` |
| Patch blog post tag | PATCH | `/api/v2/ContentService/BlogPostTags/{blogPostTagId}` |
| Delete blog post tag | DELETE | `/api/v2/ContentService/BlogPostTags/{blogPostTagId}` |

## Critical Rules

- **Authenticate first.** Send `Authorization: Bearer $ABSUITE_ACCESS_TOKEN` on every call.
- **Tenant scoping is per-endpoint** — pass `?tenantId=<tenant-guid>` only where the manifest
  marks it required/optional; never add it to Portals `Current`/`Root`/`Search`/`Initialize`,
  the by-id portal reads, the blog sub-reads, or `Themes/Update`.
- **PATCH bodies are JSON Patch arrays** with camelCase JSON-Pointer paths.
- **Blog/web body text** goes in `Code` (source) or `HtmlContent`/`RazorContent`/etc. depending
  on `CodeType`.
- **Note the field spelling `AllowSerachEngines`** (the API uses this exact spelling).
- **Create-and-relate** (`POST .../Categories` with a body) creates a new taxonomy term and
  links it; **relate-existing** (`POST .../Categories/{categoryId}`) links an existing one.
