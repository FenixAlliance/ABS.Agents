---
name: absuite-content-cli
description: >
  Manage web content in the Alliance Business Suite (ABS) using the `absuite` CLI —
  web portals, web pages, web-page categories/tags, web content blocks, web templates,
  website themes, web components, menu contexts, localization strings, business domains,
  and the full blog system (posts, authors, categories, tags, comments). Covers list/
  count/search/get/create/update/delete plus service actions. Requires an authenticated
  CLI session (see absuite-login-cli). For atomic PATCH updates or raw HTTP, use the
  absuite-content (REST) skill.
---

# Alliance Business Suite — Content Skill (CLI)

Drive the ABS **ContentService** through the `absuite` CLI's `content` service. This is the
comprehensive content surface: web portals (and their settings/options/domain bindings),
web pages, web-page categories/tags, web content blocks, web templates, website themes,
web components, menu contexts, localization strings, business domains, and the full blog
system. For a blog-only subset, see `absuite-blog`.

- For raw REST/curl, JSON Patch (PATCH), and the full DTO field reference, use the
  `absuite-content` skill. **The CLI does not support PATCH** — use `update` (PUT) instead.
- For CLI session setup and conventions, see `absuite-cli` and `absuite-login-cli`.

## Prerequisites

1. **Authenticate first**: `absuite login` (see `absuite-login-cli`).
2. **Set your tenant** once: `absuite config set --tenant-id <tenant-guid>` (referenced below
   as `$TENANT_ID`), or pass `--TenantId <tenant-guid>` on each call.
3. **Discover commands**: `absuite content list-commands`, and `--help` on any command for its
   full parameter/DTO schema.

## Command structure

```
absuite content <verb> <entity> --Param value
```

Verbs: **list, count, search, get, create, update, delete** (plus service actions such as
`initialize`, `verify`, `bind`/`unbind`, `relate`/`unrelate`, `reply`). The canonical
function-name form also works, e.g.:

```
absuite content Get-PortalsAsync --TenantId $TENANT_ID
absuite content Initialize-CurrentWebPortalAsync
absuite content New-WebPageAsync --TenantId $TENANT_ID --WebPageCreateDto '{...}'
```

DTO parameters are passed as a single-quoted JSON string whose field names match the API DTOs
(PascalCase), e.g. `--WebPageCreateDto '{"Title":"About Us","CodeType":"Html5"}'`.

## Tenant scoping (per-command)

- **Tenant required** — pass `--TenantId $TENANT_ID` on portal list/create/update/delete +
  settings/domain-bindings, all business-domain commands, web pages create/update/delete +
  relations, web-page categories/tags, web contents, web components, web templates, website
  themes, menu contexts, localization strings, blog categories/tags, and all blog
  write/relation/comment commands.
- **Tenant optional** — `list blog-posts` / `count blog-posts` / `list blog-authors`: omit
  `--TenantId` for the global view, pass it to scope to a tenant.
- **No tenant** — portal `get current-web-portal`, `get root-web-portal`, `search-web-portal`,
  `initialize-current-web-portal`; `get web-portal-by-id` and its options/settings reads;
  `get blog-post-by-id` and the blog sub-reads (`get categories-for-blog-post`,
  `get tags-for-blog-post`, `get comments-for-blog-post`, `get replies-for-comment`, author
  reads); `get categories-by-web-page` / `get tags-by-web-page`; and `update-themes`. These
  ignore `--TenantId`.

---

## Web Portals

```bash
# List / Count (tenant required)
absuite content list web-portals --TenantId $TENANT_ID
absuite content count portals --TenantId $TENANT_ID

# Current / Root / Search / by ID (NO tenant)
absuite content get current-web-portal
absuite content get current-web-portal-options
absuite content get root-web-portal
absuite content search-web-portal --Domain www.example.com
absuite content get web-portal-by-id --PortalId <portal-guid>

# Initialize the current portal (onboarding flow — see absuite-onboarding)
absuite content initialize-current-web-portal

# Create
absuite content create web-portal --TenantId $TENANT_ID --WebPortalCreateDto '{
  "Title": "Main Website",
  "Domain": "www.example.com",
  "Description": "Company main website",
  "Root": false,
  "Disabled": false,
  "WebsiteThemeId": "<theme-guid>",
  "BusinessDomainId": "<domain-guid>",
  "BusinessPortalApplicationId": "<app-guid>"
}'

# Update (PUT — full object; no CLI PATCH, use REST for partial updates)
absuite content update web-portal --TenantId $TENANT_ID --PortalId <portal-guid> --WebPortalUpdateDto '{
  "Title": "Updated Website Title",
  "Domain": "www.example.com",
  "Disabled": false,
  "WebsiteThemeId": "<theme-guid>"
}'

# Delete
absuite content delete web-portal --TenantId $TENANT_ID --PortalId <portal-guid>
```

**WebPortalCreateDto / UpdateDto fields:** `Title`, `Domain`, `Description`, `Root` (bool),
`Disabled` (bool), `WebsiteThemeId`, `BusinessDomainId`, `BusinessPortalApplicationId`.

### Portal options, settings, domain bindings

```bash
# Options / settings (by-id reads ignore tenant)
absuite content get web-portal-options --PortalId <portal-guid>
absuite content get web-portal-settings --PortalId <portal-guid>

# Update settings (tenant required) — body is a PortalSettings object
absuite content update web-portal-settings --TenantId $TENANT_ID --PortalId <portal-guid> --PortalSettings '{
  "Enable": true,
  "PortalID": "<portal-guid>",
  "TenantID": "<tenant-guid>",
  "HomePageID": "<page-guid>",
  "BlogPageID": "<page-guid>",
  "StorePageID": "<page-guid>",
  "BaseEndpoint": "https://api.example.com",
  "StoreRoutePrefix": "store"
}'

# Domain bindings
absuite content get web-portal-domain-bindings --TenantId $TENANT_ID --PortalId <portal-guid>
absuite content bind-web-portal-domain --TenantId $TENANT_ID --PortalId <portal-guid> --BusinessDomainId <domain-guid>
absuite content unbind-web-portal-domain --TenantId $TENANT_ID --PortalId <portal-guid> --BusinessDomainId <domain-guid>
```

---

## Business Domains

```bash
absuite content list business-domains --TenantId $TENANT_ID
absuite content count business-domains --TenantId $TENANT_ID
absuite content get business-domain-by-id --TenantId $TENANT_ID --BusinessDomainId <domain-guid>

# Register (Domain is REQUIRED)
absuite content create business-domain --TenantId $TENANT_ID --BusinessDomainCreateDto '{ "Domain": "shop.example.com" }'

# Update
absuite content update business-domain --TenantId $TENANT_ID --BusinessDomainId <domain-guid> --BusinessDomainUpdateDto '{ "Domain": "store.example.com" }'

# Verify (DNS/ownership check)
absuite content verify-business-domain --TenantId $TENANT_ID --BusinessDomainId <domain-guid>

# Delete
absuite content delete business-domain --TenantId $TENANT_ID --BusinessDomainId <domain-guid>
```

**BusinessDomainCreateDto:** `Domain` (REQUIRED). **UpdateDto:** `Domain`.

---

## Web Pages

```bash
absuite content list web-pages --TenantId $TENANT_ID
absuite content count web-pages --TenantId $TENANT_ID
absuite content get web-page-by-id --TenantId $TENANT_ID --WebPageId <page-guid>

# Create (Title is REQUIRED)
absuite content create web-page --TenantId $TENANT_ID --WebPageCreateDto '{
  "Title": "About Us",
  "Description": "Company about page",
  "Published": true,
  "Code": "<h1>About Us</h1>",
  "CodeType": "Html5",
  "Slug": "about-us",
  "WebTemplateId": "<template-guid>",
  "ParentWebContentId": "<content-guid>"
}'

# Update (PUT)
absuite content update web-page --TenantId $TENANT_ID --WebPageId <page-guid> --WebPageUpdateDto '{
  "Title": "About Our Company",
  "Slug": "about-us",
  "HtmlContent": "<h1>About Our Company</h1>",
  "CodeType": "Html5",
  "Published": true,
  "IsHomePage": false
}'

# Delete
absuite content delete web-page --TenantId $TENANT_ID --WebPageId <page-guid>
```

**WebPageCreateDto fields:** `Title` (REQUIRED), `Published` (bool), `Description`, `Code`,
`Markup`, `FeaturedImageUrl`, `CodeType` (enum), `Slug`, `WebTemplateId`, `ParentWebContentId`.
**WebPageUpdateDto** is a large optional-field DTO (SEO/social/content/compilation fields plus
`Published`, `Enable`, `Default`, `Template`, and the `Is*Page` flags such as `IsHomePage`,
`IsStorePage`, `IsBlogPage`, `IsCartPage`, `IsCheckoutPage`, `IsAccountPage`, `IsContactPage`,
`IsWishListsPage`, `IsPrivacyPolicyPage`, `IsTermsOfServicePage`). Use `--help` for the full list.

### Web page ↔ category / tag relations

```bash
# Read a page's categories / tags (NO tenant)
absuite content get categories-by-web-page --WebPageId <page-guid>
absuite content get tags-by-web-page --WebPageId <page-guid>

# Create AND relate a NEW category/tag to a page (body DTO)
absuite content create web-page-category-relation --TenantId $TENANT_ID --WebPageId <page-guid> --WebPageCategoryCreateDto '{ "Title": "Tutorials", "Slug": "tutorials" }'
absuite content create web-page-tag-relation --TenantId $TENANT_ID --WebPageId <page-guid> --WebPageTagCreateDto '{ "Title": "dotnet", "Slug": "dotnet" }'

# Relate / unrelate an EXISTING category/tag
absuite content relate-web-page-to-category --TenantId $TENANT_ID --WebPageId <page-guid> --CategoryId <category-guid>
absuite content unrelate-web-page-category --TenantId $TENANT_ID --WebPageId <page-guid> --CategoryId <category-guid>
absuite content relate-web-page-to-tag --TenantId $TENANT_ID --WebPageId <page-guid> --TagId <tag-guid>
absuite content unrelate-web-page-tag --TenantId $TENANT_ID --WebPageId <page-guid> --TagId <tag-guid>
```

---

## Web Page Categories

```bash
absuite content list web-page-categories --TenantId $TENANT_ID
absuite content count web-page-categories --TenantId $TENANT_ID
absuite content get web-page-category-by-id --TenantId $TENANT_ID --WebPageCategoryId <category-guid>

absuite content create web-page-category --TenantId $TENANT_ID --WebPageCategoryCreateDto '{
  "Title": "Tutorials",
  "Slug": "tutorials",
  "Description": "How-to articles",
  "AllowSerachEngines": true,
  "WebPortalId": "<portal-guid>"
}'

absuite content update web-page-category --TenantId $TENANT_ID --WebPageCategoryId <category-guid> --WebPageCategoryUpdateDto '{ "Title": "Guides", "Slug": "guides" }'
absuite content delete web-page-category --TenantId $TENANT_ID --WebPageCategoryId <category-guid>
```

**WebPageCategoryCreateDto fields:** `Slug`, `Title`, `Description`, `SeoTitle`,
`MetaDescription`, `CornerstoneContent` (bool), `AllowSerachEngines` (bool — note spelling),
`SeoKeyPhrases`, `CanonicalUrl`, `ImageURL`, `Image`, `WebPortalId`.

---

## Web Page Tags

```bash
absuite content list web-page-tags --TenantId $TENANT_ID
absuite content count web-page-tags --TenantId $TENANT_ID
absuite content get web-page-tag-by-id --TenantId $TENANT_ID --WebPageTagId <tag-guid>

absuite content create web-page-tag --TenantId $TENANT_ID --WebPageTagCreateDto '{ "Title": "dotnet", "Slug": "dotnet", "WebPortalId": "<portal-guid>" }'
absuite content update web-page-tag --TenantId $TENANT_ID --WebPageTagId <tag-guid> --WebPageTagUpdateDto '{ "Title": "dotnet-core", "Slug": "dotnet-core" }'
absuite content delete web-page-tag --TenantId $TENANT_ID --WebPageTagId <tag-guid>
```

**WebPageTagCreateDto fields:** same shape as WebPageCategoryCreateDto.

---

## Web Content Blocks

```bash
absuite content list web-contents --TenantId $TENANT_ID
absuite content count web-contents --TenantId $TENANT_ID
absuite content get web-content-by-id --TenantId $TENANT_ID --WebContentId <content-guid>

# Create (Title is REQUIRED)
absuite content create web-content --TenantId $TENANT_ID --WebContentCreateDto '{
  "Title": "Hero Section",
  "Published": true,
  "Description": "Landing hero block",
  "Code": "<div class=\"hero\">...</div>",
  "CodeType": "Html5"
}'

# Update (PUT)
absuite content update web-content --TenantId $TENANT_ID --WebContentId <content-guid> --WebContentUpdateDto '{
  "Title": "Updated Hero",
  "HtmlContent": "<div>...</div>",
  "CodeType": "Html5",
  "Published": true
}'

# Delete
absuite content delete web-content --TenantId $TENANT_ID --WebContentId <content-guid>
```

**WebContentCreateDto:** `Title` (REQUIRED), `Published` (bool), `Description`, `Code`,
`Markup`, `FeaturedImageUrl`, `CodeType` (enum). **WebContentUpdateDto** is the large
optional-field DTO (same content/SEO/social fields as web pages).

---

## Web Templates

```bash
absuite content list web-templates --TenantId $TENANT_ID
absuite content count web-templates --TenantId $TENANT_ID
absuite content get web-template-by-id --TenantId $TENANT_ID --WebTemplateId <template-guid>

absuite content create web-template --TenantId $TENANT_ID --WebTemplateCreateDto '{
  "Slug": "landing",
  "Name": "Landing Page Template",
  "Title": "Landing",
  "HtmlContent": "<html>...</html>",
  "CssContent": "...",
  "JsContent": "...",
  "Order": 0
}'

absuite content update web-template --TenantId $TENANT_ID --WebTemplateId <template-guid> --WebTemplateUpdateDto '{ "Name": "Updated Template", "Order": 1 }'
absuite content delete web-template --TenantId $TENANT_ID --WebTemplateId <template-guid>
```

**WebTemplateCreateDto / UpdateDto fields:** `Slug`, `Name`, `Title`, `Description`, `Content`,
`HtmlContent`, `CssContent`, `JsContent`, `RazorContent`, `HighlightImage`, `Order` (int).

---

## Website Themes

```bash
absuite content list website-themes --TenantId $TENANT_ID
absuite content count website-themes --TenantId $TENANT_ID
absuite content get website-theme-by-id --TenantId $TENANT_ID --Id <theme-guid>

# Create (Name is REQUIRED)
absuite content create website-theme --TenantId $TENANT_ID --WebsiteThemeCreateDto '{
  "Name": "Dark Theme",
  "Description": "Dark mode theme",
  "AuthorName": "ACME",
  "Version": "1.0.0",
  "Tags": "dark,modern",
  "Enable": true
}'

# Update (PUT)
absuite content update website-theme --TenantId $TENANT_ID --Id <theme-guid> --WebsiteThemeUpdateDto '{ "Name": "Dark Theme v2", "Version": "2.0.0", "Enable": true }'

# Delete
absuite content delete website-theme --TenantId $TENANT_ID --Id <theme-guid>

# Update base web content themes (utility — NO tenant)
absuite content update-themes
```

**WebsiteThemeCreateDto / UpdateDto fields:** `Name` (REQUIRED on create), `Description`,
`AuthorName`, `AuthorUrl`, `Version`, `Tags`, `Enable` (bool). The theme id parameter is `--Id`.

---

## Web Components

```bash
absuite content list web-components --TenantId $TENANT_ID
absuite content count web-components --TenantId $TENANT_ID
absuite content get web-component-by-id --TenantId $TENANT_ID --WebComponentId <component-guid>

# Create (Name is REQUIRED)
absuite content create web-component --TenantId $TENANT_ID --WebComponentCreateDto '{
  "Name": "PricingCard",
  "Title": "Pricing Card",
  "HtmlContent": "<div class=\"card\">...</div>",
  "CodeType": "Html5",
  "Published": true,
  "Enable": true
}'

# Update (PUT)
absuite content update web-component --TenantId $TENANT_ID --WebComponentId <component-guid> --WebComponentUpdateDto '{ "Name": "PricingCard", "Title": "Updated Pricing Card", "Enable": true }'

# Delete
absuite content delete web-component --TenantId $TENANT_ID --WebComponentId <component-guid>
```

**WebComponentCreateDto / UpdateDto fields:** `Name` (REQUIRED on create), `Title`,
`Description`, `Code`, `HtmlContent`, `CssContent`, `JsContent`, `CodeType` (enum),
`Published` (bool), `Enable` (bool), `FeaturedImageUrl`.

---

## Menu Contexts

```bash
absuite content list menu-contexts --TenantId $TENANT_ID
absuite content count menu-contexts --TenantId $TENANT_ID
absuite content get menu-context-by-id --TenantId $TENANT_ID --MenuContextId <menu-guid>

# Create (Name is REQUIRED)
absuite content create menu-context --TenantId $TENANT_ID --MenuContextCreateDto '{
  "Name": "MainNav",
  "Category": "Header",
  "Component": "TopMenu",
  "Enable": true,
  "StudioMenu": false,
  "WebPortalId": "<portal-guid>"
}'

# Update (PUT)
absuite content update menu-context --TenantId $TENANT_ID --MenuContextId <menu-guid> --MenuContextUpdateDto '{ "Name": "MainNav", "Enable": false }'

# Delete
absuite content delete menu-context --TenantId $TENANT_ID --MenuContextId <menu-guid>
```

**MenuContextCreateDto / UpdateDto fields:** `Name` (REQUIRED on create), `Category`,
`Component`, `Enable` (bool), `StudioMenu` (bool), `CustomCss`, `CustomJs`, `CustomHtml`,
`LoggedInOnly` (string), `BackgroundImage`, `WebPortalId`.

---

## Localization Strings

```bash
absuite content list localization-strings --TenantId $TENANT_ID
absuite content count localization-strings --TenantId $TENANT_ID
absuite content get localization-string-by-id --TenantId $TENANT_ID --LocalizationStringId <string-guid>

# Create (Base is REQUIRED)
absuite content create localization-string --TenantId $TENANT_ID --LocalizationStringCreateDto '{
  "Base": "welcome.title",
  "Comments": "Home hero heading",
  "CountryLanguageId": "<lang-guid>"
}'

# Update (PUT)
absuite content update localization-string --TenantId $TENANT_ID --LocalizationStringId <string-guid> --LocalizationStringUpdateDto '{ "Base": "welcome.heading", "CountryLanguageId": "<lang-guid>" }'

# Delete
absuite content delete localization-string --TenantId $TENANT_ID --LocalizationStringId <string-guid>
```

**LocalizationStringCreateDto / UpdateDto fields:** `Base` (REQUIRED on create), `Comments`,
`CountryLanguageId`.

---

## Blog Posts

```bash
# List / Count (tenant OPTIONAL — omit for global, pass to scope)
absuite content list blog-posts --TenantId $TENANT_ID
absuite content count blog-posts --TenantId $TENANT_ID

# Get by ID (NO tenant)
absuite content get blog-post-by-id --BlogPostId <post-guid>

# Create (Title is REQUIRED, tenant required)
absuite content create blog-post --TenantId $TENANT_ID --BlogPostCreateDto '{
  "Title": "Getting Started with ABS",
  "Published": false,
  "Description": "A quick guide to the Alliance Business Suite",
  "Code": "# Welcome\n\nThis is your first post.",
  "CodeType": "Markdown",
  "Slug": "getting-started-with-abs",
  "BlogPostCategoryId": "<category-guid>",
  "WebTemplateId": "<template-guid>"
}'

# Update (PUT)
absuite content update blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostUpdateDto '{
  "Title": "Getting Started with ABS (v2)",
  "Slug": "getting-started-with-abs",
  "Published": true
}'

# Delete
absuite content delete blog-post --TenantId $TENANT_ID --BlogPostId <post-guid>
```

**BlogPostCreateDto fields:** `Title` (REQUIRED), `Published` (bool), `Description`, `Code`,
`Markup`, `FeaturedImageUrl`, `CodeType` (enum), `Slug`, `BlogPostCategoryId`, `WebTemplateId`.
**BlogPostUpdateDto** is the large optional-field DTO (content/SEO/social/compilation fields)
plus `BlogPostCategoryId` and `WebTemplateId`.

### Blog post ↔ category / tag / comment operations

```bash
# Categories / tags / comments of a post (reads — NO tenant)
absuite content get categories-for-blog-post --BlogPostId <post-guid>
absuite content get tags-for-blog-post --BlogPostId <post-guid>
absuite content get comments-for-blog-post --BlogPostId <post-guid>
absuite content get replies-for-comment --BlogPostId <post-guid> --CommentId <comment-guid>

# Create AND relate a NEW category/tag to a post
absuite content create category-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostCategoryCreateDto '{ "Title": "Technology", "Slug": "technology" }'
absuite content create tag-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostTagCreateDto '{ "Title": "dotnet", "Slug": "dotnet" }'

# Relate / unrelate an EXISTING category/tag
absuite content relate-category-to-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --CategoryId <category-guid>
absuite content unrelate-category-from-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --CategoryId <category-guid>
absuite content relate-tag-to-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --TagId <tag-guid>
absuite content unrelate-tag-from-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --TagId <tag-guid>

# Comments (Message is REQUIRED)
absuite content create comment-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostCommentCreateDto '{ "Message": "Great post!", "OwnerSocialProfileId": "<social-guid>" }'
absuite content reply-to-comment --TenantId $TENANT_ID --BlogPostId <post-guid> --CommentId <comment-guid> --BlogPostCommentCreateDto '{ "Message": "Thanks for the feedback!" }'
absuite content delete comment-from-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --CommentId <comment-guid>
```

**BlogPostCommentCreateDto fields:** `Message` (REQUIRED), `OwnerSocialProfileId`,
`SocialPostId`, `ParentCommentId`.

---

## Blog Post Authors (read-only)

```bash
# List authors (tenant OPTIONAL)
absuite content list blog-authors --TenantId $TENANT_ID

# Get author / posts / count (NO tenant — resolved by author id)
absuite content get blog-author-by-id --AuthorId <author-guid>
absuite content get blog-posts-by-author --AuthorId <author-guid>
absuite content count blog-posts-by-author --AuthorId <author-guid>
```

---

## Blog Post Categories

```bash
absuite content list blog-post-categories --TenantId $TENANT_ID
absuite content count blog-post-categories --TenantId $TENANT_ID
absuite content get blog-post-category-by-id --TenantId $TENANT_ID --BlogPostCategoryId <category-guid>

absuite content create blog-post-category --TenantId $TENANT_ID --BlogPostCategoryCreateDto '{
  "Title": "Technology",
  "Slug": "technology",
  "Type": "category",
  "AllowSerachEngines": true,
  "WebPortalId": "<portal-guid>"
}'

absuite content update blog-post-category --TenantId $TENANT_ID --BlogPostCategoryId <category-guid> --BlogPostCategoryUpdateDto '{ "Title": "Tech & Engineering", "Slug": "tech-engineering" }'
absuite content delete blog-post-category --TenantId $TENANT_ID --BlogPostCategoryId <category-guid>
```

**BlogPostCategoryCreateDto fields:** `Slug`, `Type`, `Title`, `Description`, `SeoTitle`,
`MetaDescription`, `CornerstoneContent` (bool), `AllowSerachEngines` (bool), `SeoKeyPhrases`,
`CanonicalUrl`, `ImageURL`, `Image`, `WebPortalId`.

---

## Blog Post Tags

```bash
absuite content list blog-post-tags --TenantId $TENANT_ID
absuite content count blog-post-tags --TenantId $TENANT_ID
absuite content get blog-post-tag-by-id --TenantId $TENANT_ID --BlogPostTagId <tag-guid>

absuite content create blog-post-tag --TenantId $TENANT_ID --BlogPostTagCreateDto '{ "Title": "dotnet", "Slug": "dotnet", "Type": "tag", "WebPortalId": "<portal-guid>" }'
absuite content update blog-post-tag --TenantId $TENANT_ID --BlogPostTagId <tag-guid> --BlogPostTagUpdateDto '{ "Title": "dotnet-10", "Slug": "dotnet-10" }'
absuite content delete blog-post-tag --TenantId $TENANT_ID --BlogPostTagId <tag-guid>
```

**BlogPostTagCreateDto fields:** same shape as BlogPostCategoryCreateDto.

---

## Enums

- **CodeType** (used by WebPages, WebContents, WebComponents, BlogPosts):
  `Razor | CSharp | CSHtml | Liquid | Html5 | Markdown | Markup`.

## Critical Rules

- **Authenticate first** (`absuite login`).
- **Tenant scoping is per-command** — pass `--TenantId $TENANT_ID` where required/optional;
  never on portal `current`/`root`/`search`/`initialize`, by-id portal reads, blog sub-reads,
  or `update-themes`.
- **No PATCH in the CLI.** Use `update` (PUT, full object) for changes; for atomic partial
  updates, switch to the `absuite-content` (REST) skill.
- **Create-and-relate vs relate-existing:** `create category-for-blog-post` /
  `create web-page-category-relation` (with a DTO) creates a new taxonomy term and links it;
  `relate-category-to-blog-post` / `relate-web-page-to-category` (with an id) links an existing one.
- **Note the field spelling `AllowSerachEngines`** (the API uses this exact spelling).
- **Use `--help`** on any command for its full DTO schema and parameter names.

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List portals | `absuite content list web-portals --TenantId $TENANT_ID` |
| Count portals | `absuite content count portals --TenantId $TENANT_ID` |
| Create portal | `absuite content create web-portal --TenantId $TENANT_ID --WebPortalCreateDto '{...}'` |
| Get portal by ID | `absuite content get web-portal-by-id --PortalId <portal-guid>` |
| Update portal | `absuite content update web-portal --TenantId $TENANT_ID --PortalId <portal-guid> --WebPortalUpdateDto '{...}'` |
| Delete portal | `absuite content delete web-portal --TenantId $TENANT_ID --PortalId <portal-guid>` |
| Current portal | `absuite content get current-web-portal` |
| Current portal options | `absuite content get current-web-portal-options` |
| Root portal | `absuite content get root-web-portal` |
| Search portal by domain | `absuite content search-web-portal --Domain <domain>` |
| Initialize current portal | `absuite content initialize-current-web-portal` |
| Portal options | `absuite content get web-portal-options --PortalId <portal-guid>` |
| Portal settings | `absuite content get web-portal-settings --PortalId <portal-guid>` |
| Update portal settings | `absuite content update web-portal-settings --TenantId $TENANT_ID --PortalId <portal-guid> --PortalSettings '{...}'` |
| Portal domain bindings | `absuite content get web-portal-domain-bindings --TenantId $TENANT_ID --PortalId <portal-guid>` |
| Bind portal domain | `absuite content bind-web-portal-domain --TenantId $TENANT_ID --PortalId <portal-guid> --BusinessDomainId <domain-guid>` |
| Unbind portal domain | `absuite content unbind-web-portal-domain --TenantId $TENANT_ID --PortalId <portal-guid> --BusinessDomainId <domain-guid>` |
| List business domains | `absuite content list business-domains --TenantId $TENANT_ID` |
| Count business domains | `absuite content count business-domains --TenantId $TENANT_ID` |
| Register business domain | `absuite content create business-domain --TenantId $TENANT_ID --BusinessDomainCreateDto '{...}'` |
| Get business domain by ID | `absuite content get business-domain-by-id --TenantId $TENANT_ID --BusinessDomainId <domain-guid>` |
| Update business domain | `absuite content update business-domain --TenantId $TENANT_ID --BusinessDomainId <domain-guid> --BusinessDomainUpdateDto '{...}'` |
| Verify business domain | `absuite content verify-business-domain --TenantId $TENANT_ID --BusinessDomainId <domain-guid>` |
| Delete business domain | `absuite content delete business-domain --TenantId $TENANT_ID --BusinessDomainId <domain-guid>` |
| List web pages | `absuite content list web-pages --TenantId $TENANT_ID` |
| Count web pages | `absuite content count web-pages --TenantId $TENANT_ID` |
| Create web page | `absuite content create web-page --TenantId $TENANT_ID --WebPageCreateDto '{...}'` |
| Get web page by ID | `absuite content get web-page-by-id --TenantId $TENANT_ID --WebPageId <page-guid>` |
| Update web page | `absuite content update web-page --TenantId $TENANT_ID --WebPageId <page-guid> --WebPageUpdateDto '{...}'` |
| Delete web page | `absuite content delete web-page --TenantId $TENANT_ID --WebPageId <page-guid>` |
| Get categories by web page | `absuite content get categories-by-web-page --WebPageId <page-guid>` |
| Get tags by web page | `absuite content get tags-by-web-page --WebPageId <page-guid>` |
| Create+relate web page category | `absuite content create web-page-category-relation --TenantId $TENANT_ID --WebPageId <page-guid> --WebPageCategoryCreateDto '{...}'` |
| Relate web page to category | `absuite content relate-web-page-to-category --TenantId $TENANT_ID --WebPageId <page-guid> --CategoryId <category-guid>` |
| Unrelate web page category | `absuite content unrelate-web-page-category --TenantId $TENANT_ID --WebPageId <page-guid> --CategoryId <category-guid>` |
| Create+relate web page tag | `absuite content create web-page-tag-relation --TenantId $TENANT_ID --WebPageId <page-guid> --WebPageTagCreateDto '{...}'` |
| Relate web page to tag | `absuite content relate-web-page-to-tag --TenantId $TENANT_ID --WebPageId <page-guid> --TagId <tag-guid>` |
| Unrelate web page tag | `absuite content unrelate-web-page-tag --TenantId $TENANT_ID --WebPageId <page-guid> --TagId <tag-guid>` |
| List web page categories | `absuite content list web-page-categories --TenantId $TENANT_ID` |
| Count web page categories | `absuite content count web-page-categories --TenantId $TENANT_ID` |
| Create web page category | `absuite content create web-page-category --TenantId $TENANT_ID --WebPageCategoryCreateDto '{...}'` |
| Get web page category by ID | `absuite content get web-page-category-by-id --TenantId $TENANT_ID --WebPageCategoryId <category-guid>` |
| Update web page category | `absuite content update web-page-category --TenantId $TENANT_ID --WebPageCategoryId <category-guid> --WebPageCategoryUpdateDto '{...}'` |
| Delete web page category | `absuite content delete web-page-category --TenantId $TENANT_ID --WebPageCategoryId <category-guid>` |
| List web page tags | `absuite content list web-page-tags --TenantId $TENANT_ID` |
| Count web page tags | `absuite content count web-page-tags --TenantId $TENANT_ID` |
| Create web page tag | `absuite content create web-page-tag --TenantId $TENANT_ID --WebPageTagCreateDto '{...}'` |
| Get web page tag by ID | `absuite content get web-page-tag-by-id --TenantId $TENANT_ID --WebPageTagId <tag-guid>` |
| Update web page tag | `absuite content update web-page-tag --TenantId $TENANT_ID --WebPageTagId <tag-guid> --WebPageTagUpdateDto '{...}'` |
| Delete web page tag | `absuite content delete web-page-tag --TenantId $TENANT_ID --WebPageTagId <tag-guid>` |
| List web contents | `absuite content list web-contents --TenantId $TENANT_ID` |
| Count web contents | `absuite content count web-contents --TenantId $TENANT_ID` |
| Create web content | `absuite content create web-content --TenantId $TENANT_ID --WebContentCreateDto '{...}'` |
| Get web content by ID | `absuite content get web-content-by-id --TenantId $TENANT_ID --WebContentId <content-guid>` |
| Update web content | `absuite content update web-content --TenantId $TENANT_ID --WebContentId <content-guid> --WebContentUpdateDto '{...}'` |
| Delete web content | `absuite content delete web-content --TenantId $TENANT_ID --WebContentId <content-guid>` |
| List web templates | `absuite content list web-templates --TenantId $TENANT_ID` |
| Count web templates | `absuite content count web-templates --TenantId $TENANT_ID` |
| Create web template | `absuite content create web-template --TenantId $TENANT_ID --WebTemplateCreateDto '{...}'` |
| Get web template by ID | `absuite content get web-template-by-id --TenantId $TENANT_ID --WebTemplateId <template-guid>` |
| Update web template | `absuite content update web-template --TenantId $TENANT_ID --WebTemplateId <template-guid> --WebTemplateUpdateDto '{...}'` |
| Delete web template | `absuite content delete web-template --TenantId $TENANT_ID --WebTemplateId <template-guid>` |
| List website themes | `absuite content list website-themes --TenantId $TENANT_ID` |
| Count website themes | `absuite content count website-themes --TenantId $TENANT_ID` |
| Create website theme | `absuite content create website-theme --TenantId $TENANT_ID --WebsiteThemeCreateDto '{...}'` |
| Get website theme by ID | `absuite content get website-theme-by-id --TenantId $TENANT_ID --Id <theme-guid>` |
| Update website theme | `absuite content update website-theme --TenantId $TENANT_ID --Id <theme-guid> --WebsiteThemeUpdateDto '{...}'` |
| Delete website theme | `absuite content delete website-theme --TenantId $TENANT_ID --Id <theme-guid>` |
| Update base themes | `absuite content update-themes` |
| List web components | `absuite content list web-components --TenantId $TENANT_ID` |
| Count web components | `absuite content count web-components --TenantId $TENANT_ID` |
| Create web component | `absuite content create web-component --TenantId $TENANT_ID --WebComponentCreateDto '{...}'` |
| Get web component by ID | `absuite content get web-component-by-id --TenantId $TENANT_ID --WebComponentId <component-guid>` |
| Update web component | `absuite content update web-component --TenantId $TENANT_ID --WebComponentId <component-guid> --WebComponentUpdateDto '{...}'` |
| Delete web component | `absuite content delete web-component --TenantId $TENANT_ID --WebComponentId <component-guid>` |
| List menu contexts | `absuite content list menu-contexts --TenantId $TENANT_ID` |
| Count menu contexts | `absuite content count menu-contexts --TenantId $TENANT_ID` |
| Create menu context | `absuite content create menu-context --TenantId $TENANT_ID --MenuContextCreateDto '{...}'` |
| Get menu context by ID | `absuite content get menu-context-by-id --TenantId $TENANT_ID --MenuContextId <menu-guid>` |
| Update menu context | `absuite content update menu-context --TenantId $TENANT_ID --MenuContextId <menu-guid> --MenuContextUpdateDto '{...}'` |
| Delete menu context | `absuite content delete menu-context --TenantId $TENANT_ID --MenuContextId <menu-guid>` |
| List localization strings | `absuite content list localization-strings --TenantId $TENANT_ID` |
| Count localization strings | `absuite content count localization-strings --TenantId $TENANT_ID` |
| Create localization string | `absuite content create localization-string --TenantId $TENANT_ID --LocalizationStringCreateDto '{...}'` |
| Get localization string by ID | `absuite content get localization-string-by-id --TenantId $TENANT_ID --LocalizationStringId <string-guid>` |
| Update localization string | `absuite content update localization-string --TenantId $TENANT_ID --LocalizationStringId <string-guid> --LocalizationStringUpdateDto '{...}'` |
| Delete localization string | `absuite content delete localization-string --TenantId $TENANT_ID --LocalizationStringId <string-guid>` |
| List blog posts | `absuite content list blog-posts --TenantId $TENANT_ID` |
| Count blog posts | `absuite content count blog-posts --TenantId $TENANT_ID` |
| Create blog post | `absuite content create blog-post --TenantId $TENANT_ID --BlogPostCreateDto '{...}'` |
| Get blog post by ID | `absuite content get blog-post-by-id --BlogPostId <post-guid>` |
| Update blog post | `absuite content update blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostUpdateDto '{...}'` |
| Delete blog post | `absuite content delete blog-post --TenantId $TENANT_ID --BlogPostId <post-guid>` |
| Get categories for blog post | `absuite content get categories-for-blog-post --BlogPostId <post-guid>` |
| Create+relate category for blog post | `absuite content create category-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostCategoryCreateDto '{...}'` |
| Relate category to blog post | `absuite content relate-category-to-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --CategoryId <category-guid>` |
| Unrelate category from blog post | `absuite content unrelate-category-from-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --CategoryId <category-guid>` |
| Get tags for blog post | `absuite content get tags-for-blog-post --BlogPostId <post-guid>` |
| Create+relate tag for blog post | `absuite content create tag-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostTagCreateDto '{...}'` |
| Relate tag to blog post | `absuite content relate-tag-to-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --TagId <tag-guid>` |
| Unrelate tag from blog post | `absuite content unrelate-tag-from-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --TagId <tag-guid>` |
| Get comments for blog post | `absuite content get comments-for-blog-post --BlogPostId <post-guid>` |
| Create comment for blog post | `absuite content create comment-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostCommentCreateDto '{...}'` |
| Reply to comment | `absuite content reply-to-comment --TenantId $TENANT_ID --BlogPostId <post-guid> --CommentId <comment-guid> --BlogPostCommentCreateDto '{...}'` |
| Get replies for comment | `absuite content get replies-for-comment --BlogPostId <post-guid> --CommentId <comment-guid>` |
| Delete comment from blog post | `absuite content delete comment-from-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --CommentId <comment-guid>` |
| List blog authors | `absuite content list blog-authors --TenantId $TENANT_ID` |
| Get blog author by ID | `absuite content get blog-author-by-id --AuthorId <author-guid>` |
| Posts by author | `absuite content get blog-posts-by-author --AuthorId <author-guid>` |
| Count posts by author | `absuite content count blog-posts-by-author --AuthorId <author-guid>` |
| List blog post categories | `absuite content list blog-post-categories --TenantId $TENANT_ID` |
| Count blog post categories | `absuite content count blog-post-categories --TenantId $TENANT_ID` |
| Create blog post category | `absuite content create blog-post-category --TenantId $TENANT_ID --BlogPostCategoryCreateDto '{...}'` |
| Get blog post category by ID | `absuite content get blog-post-category-by-id --TenantId $TENANT_ID --BlogPostCategoryId <category-guid>` |
| Update blog post category | `absuite content update blog-post-category --TenantId $TENANT_ID --BlogPostCategoryId <category-guid> --BlogPostCategoryUpdateDto '{...}'` |
| Delete blog post category | `absuite content delete blog-post-category --TenantId $TENANT_ID --BlogPostCategoryId <category-guid>` |
| List blog post tags | `absuite content list blog-post-tags --TenantId $TENANT_ID` |
| Count blog post tags | `absuite content count blog-post-tags --TenantId $TENANT_ID` |
| Create blog post tag | `absuite content create blog-post-tag --TenantId $TENANT_ID --BlogPostTagCreateDto '{...}'` |
| Get blog post tag by ID | `absuite content get blog-post-tag-by-id --TenantId $TENANT_ID --BlogPostTagId <tag-guid>` |
| Update blog post tag | `absuite content update blog-post-tag --TenantId $TENANT_ID --BlogPostTagId <tag-guid> --BlogPostTagUpdateDto '{...}'` |
| Delete blog post tag | `absuite content delete blog-post-tag --TenantId $TENANT_ID --BlogPostTagId <tag-guid>` |
