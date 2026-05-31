---
name: absuite-content
description: >
  Manage web content, web pages, web portals, web templates, blog posts, blog
  categories, blog tags, blog comments, blog authors, and business domains in the
  Alliance Business Suite (ABS) using the `absuite` CLI. This is the comprehensive
  content management skill â€” for blog-only operations see the `absuite-blog` skill.
  Requires an authenticated CLI session.
---

# Alliance Business Suite â€” Content Skill

Manage all content through the `absuite` CLI's `content` service. Covers web portals, web pages, web templates, web content blocks, and the full blog system.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite content list-commands`

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

## Web Portals

### List / Get Portals

```bash
# Get current portal
absuite content get current-web-portal --TenantId $TENANT_ID

# Get root portal
absuite content get root-web-portal

# Get portal by ID
absuite content get web-portal-by-id --TenantId $TENANT_ID --WebPortalId <portal-guid>

# Search portal by domain
absuite content search-web-portal --Domain example.com
```

**REST API equivalent:**
```bash
# Get current portal
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Current" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get root portal
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Root" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get portal by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Search portal by domain
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Search?domain=example.com" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List all portals
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count portals
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Portal

```bash
absuite content create web-portal --TenantId $TENANT_ID --WebPortalCreateDto '{
  "Title": "Main Website",
  "Domain": "www.example.com",
  "Description": "Company main website",
  "BusinessID": "<tenant-guid>"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/Portals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Main Website",
    "Domain": "www.example.com",
    "Description": "Company main website",
    "BusinessID": "<tenant-guid>"
  }'
```

### Update / Patch Portal

```bash
absuite content update web-portal --TenantId $TENANT_ID --WebPortalId <portal-guid> --WebPortalUpdateDto '{
  "Title": "Updated Website Title"
}'

absuite content patch web-portal --TenantId $TENANT_ID --WebPortalId <portal-guid> --Body '[
  {"op": "replace", "path": "/Title", "value": "New Title"}
]'
```

**REST API equivalent:**
```bash
# Full update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Updated Website Title"
  }'

# Partial update (JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {"op": "replace", "path": "/Title", "value": "New Title"}
  ]'
```

### Delete Portal

```bash
absuite content delete web-portal --TenantId $TENANT_ID --WebPortalId <portal-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Portal Options & Settings

```bash
absuite content list current-web-portal-options --TenantId $TENANT_ID
absuite content list web-portal-options --TenantId $TENANT_ID --WebPortalId <portal-guid>
absuite content list web-portal-settings --TenantId $TENANT_ID --WebPortalId <portal-guid>
```

**REST API equivalent:**
```bash
# Current portal options
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Current/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Portal options by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>/Options" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Portal settings by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/<portal-guid>/Settings" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Initialize Portal

```bash
absuite content initialize-current-web-portal --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Initialize" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Business Domains

```bash
absuite content list business-domains --TenantId $TENANT_ID
absuite content count business-domains --TenantId $TENANT_ID
absuite content get business-domain-by-id --TenantId $TENANT_ID --BusinessDomainId <domain-guid>
```

**REST API equivalent:**
```bash
# List business domains
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BusinessDomains" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count business domains
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BusinessDomains/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get business domain by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BusinessDomains/<domain-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Web Pages

```bash
# List / Count
absuite content list web-pages --TenantId $TENANT_ID
absuite content count web-pages --TenantId $TENANT_ID

# Get by ID
absuite content get web-page-by-id --TenantId $TENANT_ID --WebPageId <page-guid>

# Create
absuite content create web-page --TenantId $TENANT_ID --WebPageCreateDto '{
  "Title": "About Us",
  "Description": "Company about page"
}'

# Update
absuite content update web-page --TenantId $TENANT_ID --WebPageId <page-guid> --WebPageUpdateDto '{...}'

# Delete
absuite content delete web-page --TenantId $TENANT_ID --WebPageId <page-guid>
```

**REST API equivalent:**
```bash
# List web pages
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count web pages
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get web page by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create web page
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "About Us",
    "Description": "Company about page"
  }'

# Update web page
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Updated Page Title"
  }'

# Delete web page
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Web Page Categories

```bash
absuite content list web-page-categories --TenantId $TENANT_ID
absuite content count web-page-categories --TenantId $TENANT_ID
absuite content get web-page-category-by-id --TenantId $TENANT_ID --WebPageCategoryId <category-guid>
absuite content create web-page-category --TenantId $TENANT_ID --WebPageCategoryCreateDto '{...}'
absuite content update web-page-category --TenantId $TENANT_ID --WebPageCategoryId <category-guid> --WebPageCategoryUpdateDto '{...}'
absuite content delete web-page-category --TenantId $TENANT_ID --WebPageCategoryId <category-guid>

# Relate / unrelate
absuite content relate-web-page-to-category --TenantId $TENANT_ID --WebPageId <page-guid> --WebPageCategoryId <category-guid>
absuite content unrelate-web-page-category --TenantId $TENANT_ID --WebPageId <page-guid> --WebPageCategoryId <category-guid>
absuite content get categories-by-web-page --TenantId $TENANT_ID --WebPageId <page-guid>
```

**REST API equivalent:**
```bash
# List web page categories
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count web page categories
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get web page category by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create web page category
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Tutorials"
  }'

# Update web page category
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Updated Category Name"
  }'

# Delete web page category
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create category relation for a web page
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "New Category"
  }'

# Relate existing category to web page
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Categories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unrelate category from web page
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Categories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get categories for a web page
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Web Page Tags

```bash
absuite content list web-page-tags --TenantId $TENANT_ID
absuite content count web-page-tags --TenantId $TENANT_ID
absuite content get web-page-tag-by-id --TenantId $TENANT_ID --WebPageTagId <tag-guid>
absuite content create web-page-tag --TenantId $TENANT_ID --WebPageTagCreateDto '{...}'
absuite content update web-page-tag --TenantId $TENANT_ID --WebPageTagId <tag-guid> --WebPageTagUpdateDto '{...}'
absuite content delete web-page-tag --TenantId $TENANT_ID --WebPageTagId <tag-guid>

# Relate / unrelate
absuite content relate-web-page-to-tag --TenantId $TENANT_ID --WebPageId <page-guid> --WebPageTagId <tag-guid>
absuite content unrelate-web-page-tag --TenantId $TENANT_ID --WebPageId <page-guid> --WebPageTagId <tag-guid>
absuite content get tags-by-web-page --TenantId $TENANT_ID --WebPageId <page-guid>
```

**REST API equivalent:**
```bash
# List web page tags
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count web page tags
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get web page tag by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create web page tag
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "tutorial"
  }'

# Update web page tag
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "updated-tag"
  }'

# Delete web page tag
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebPageTags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create tag relation for a web page
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Tags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "new-tag"
  }'

# Relate existing tag to web page
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Tags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unrelate tag from web page
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Tags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get tags for a web page
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebPages/<page-guid>/Tags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Web Templates

```bash
absuite content list web-templates --TenantId $TENANT_ID
absuite content count web-templates --TenantId $TENANT_ID
absuite content get web-template-by-id --TenantId $TENANT_ID --WebTemplateId <template-guid>
absuite content create web-template --TenantId $TENANT_ID --WebTemplateCreateDto '{...}'
absuite content update web-template --TenantId $TENANT_ID --WebTemplateId <template-guid> --WebTemplateUpdateDto '{...}'
absuite content delete web-template --TenantId $TENANT_ID --WebTemplateId <template-guid>
```

**REST API equivalent:**
```bash
# List web templates
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count web templates
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get web template by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates/<template-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create web template
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Landing Page Template",
    "Source": "<html>...</html>"
  }'

# Update web template
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates/<template-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Updated Template",
    "Source": "<html>...</html>"
  }'

# Delete web template
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebTemplates/<template-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Web Content Blocks

```bash
absuite content list web-contents --TenantId $TENANT_ID
absuite content count web-contents --TenantId $TENANT_ID
absuite content get web-content-by-id --TenantId $TENANT_ID --WebContentId <content-guid>
absuite content create web --TenantId $TENANT_ID --WebContentCreateDto '{...}'
absuite content update web --TenantId $TENANT_ID --WebContentId <content-guid> --WebContentUpdateDto '{...}'
absuite content delete web --TenantId $TENANT_ID --WebContentId <content-guid>
```

**REST API equivalent:**
```bash
# List web contents
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count web contents
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get web content by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents/<content-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create web content
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Hero Section",
    "Content": "<div>...</div>"
  }'

# Update web content
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents/<content-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Updated Hero Section",
    "Content": "<div>...</div>"
  }'

# Delete web content
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebContents/<content-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Website Themes

```bash
absuite content list website-themes --TenantId $TENANT_ID
absuite content count website-themes --TenantId $TENANT_ID
absuite content get website-theme-by-id --TenantId $TENANT_ID --WebsiteThemeId <theme-guid>
absuite content create website-theme --TenantId $TENANT_ID --WebsiteThemeCreateDto '{
  "Name": "Dark Theme"
}'
absuite content update website-theme --TenantId $TENANT_ID --WebsiteThemeId <theme-guid> --WebsiteThemeUpdateDto '{
  "Name": "Updated Theme"
}'
absuite content delete website-theme --TenantId $TENANT_ID --WebsiteThemeId <theme-guid>
```

**REST API equivalent:**
```bash
# List website themes
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count website themes
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get website theme by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes/<theme-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create website theme
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Dark Theme"
  }'

# Update website theme
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes/<theme-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Updated Theme"
  }'

# Delete website theme
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/WebsiteThemes/<theme-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update base themes
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/Themes/Update" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Blog Posts

```bash
# List / Count
absuite content list blog-posts --TenantId $TENANT_ID
absuite content count blog-posts --TenantId $TENANT_ID

# Get by ID
absuite content get blog-post-by-id --TenantId $TENANT_ID --BlogPostId <post-guid>

# Create
absuite content create blog-post --TenantId $TENANT_ID --BlogPostCreateDto '{
  "Title": "Getting Started with ABS",
  "Excerpt": "A quick guide to the Alliance Business Suite",
  "Code": "# Welcome\n\nThis is your first post.",
  "Slug": "getting-started-with-abs"
}'

# Update
absuite content update blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostUpdateDto '{...}'

# Delete
absuite content delete blog-post --TenantId $TENANT_ID --BlogPostId <post-guid>
```

**REST API equivalent:**
```bash
# List blog posts
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count blog posts
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get blog post by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create blog post
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Getting Started with ABS",
    "Excerpt": "A quick guide to the Alliance Business Suite",
    "Code": "# Welcome\n\nThis is your first post.",
    "Slug": "getting-started-with-abs"
  }'

# Update blog post
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Updated Title"
  }'

# Delete blog post
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Blog Authors

```bash
absuite content list blog-authors --TenantId $TENANT_ID
absuite content get blog-author-by-id --TenantId $TENANT_ID --BlogAuthorId <author-guid>
absuite content count blog-posts-by-author --TenantId $TENANT_ID --BlogAuthorId <author-guid>
absuite content get blog-posts-by-author --TenantId $TENANT_ID --BlogAuthorId <author-guid>
```

**REST API equivalent:**
```bash
# List blog post authors
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get blog post author by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors/<author-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get blog posts by author
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors/<author-guid>/BlogPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count blog posts by author
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors/<author-guid>/BlogPosts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Blog Categories

```bash
absuite content list blog-post-categories --TenantId $TENANT_ID
absuite content count blog-post-categories --TenantId $TENANT_ID
absuite content get blog-post-category-by-id --TenantId $TENANT_ID --BlogPostCategoryId <category-guid>
absuite content create blog-post-category --TenantId $TENANT_ID --BlogPostCategoryCreateDto '{...}'
absuite content update blog-post-category --TenantId $TENANT_ID --BlogPostCategoryId <category-guid> --BlogPostCategoryUpdateDto '{...}'
absuite content delete blog-post-category --TenantId $TENANT_ID --BlogPostCategoryId <category-guid>

# Relate/unrelate category to a blog post
absuite content create category-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostCategoryCreateDto '{...}'
absuite content post relate-category-to-blog --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostCategoryId <category-guid>
absuite content post unrelate-category-from-blog --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostCategoryId <category-guid>
absuite content get categories-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid>
```

**REST API equivalent:**
```bash
# List blog post categories
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count blog post categories
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get blog post category by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create blog post category
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Technology"
  }'

# Update blog post category
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Updated Category"
  }'

# Delete blog post category
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create category for a blog post
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "New Category"
  }'

# Relate existing category to blog post
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Categories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unrelate category from blog post
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Categories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get categories for a blog post
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Blog Tags

```bash
absuite content list blog-post-tags --TenantId $TENANT_ID
absuite content count blog-post-tags --TenantId $TENANT_ID
absuite content get blog-post-tag-by-id --TenantId $TENANT_ID --BlogPostTagId <tag-guid>
absuite content create blog-post-tag --TenantId $TENANT_ID --BlogPostTagCreateDto '{...}'
absuite content update blog-post-tag --TenantId $TENANT_ID --BlogPostTagId <tag-guid> --BlogPostTagUpdateDto '{...}'
absuite content delete blog-post-tag --TenantId $TENANT_ID --BlogPostTagId <tag-guid>

# Relate/unrelate tag to a blog post
absuite content create tag-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostTagCreateDto '{...}'
absuite content post relate-tag-to-blog --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostTagId <tag-guid>
absuite content post unrelate-tag-from-blog --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostTagId <tag-guid>
absuite content get tags-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid>
```

**REST API equivalent:**
```bash
# List blog post tags
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count blog post tags
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get blog post tag by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create blog post tag
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "dotnet"
  }'

# Update blog post tag
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "updated-tag"
  }'

# Delete blog post tag
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create tag for a blog post
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "new-tag"
  }'

# Relate existing tag to blog post
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unrelate tag from blog post
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get tags for a blog post
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Blog Comments

```bash
absuite content create comment-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostCommentCreateDto '{...}'
absuite content get comments-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid>
absuite content reply-to-comment --TenantId $TENANT_ID --BlogPostId <post-guid> --CommentId <comment-guid> --BlogPostCommentCreateDto '{...}'
absuite content get replies-for-comment --TenantId $TENANT_ID --CommentId <comment-guid>
absuite content delete comment-from-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --CommentId <comment-guid>
```

**REST API equivalent:**
```bash
# Create comment on a blog post
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Content": "Great post!"
  }'

# Get comments for a blog post
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Reply to a comment
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments/<comment-guid>/Reply" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Content": "Thanks for the feedback!"
  }'

# Get replies for a comment
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments/<comment-guid>/Replies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Delete a comment
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments/<comment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Currency Rates (Utility)

```bash
absuite content get latest-currency-rates-model --TenantId $TENANT_ID
```

## Critical Rules

- **Authenticate first.**
- **Always provide a tenant context.**
- **Blog content goes in the `Code` field** as Markdown.
- **Use `post relate-*` / `post unrelate-*`** to link/unlink existing categories and tags to blog posts.
- **Use `create category-for-blog-post` / `create tag-for-blog-post`** to create AND link in one step.
- **Use `--help`** on any command for full DTO schemas.

## API Endpoints Quick Reference

| Resource | Method | Endpoint |
|---|---|---|
| Portals | GET | `/api/v2/ContentService/Portals` |
| Portals | POST | `/api/v2/ContentService/Portals` |
| Portal by ID | GET | `/api/v2/ContentService/Portals/:portalId` |
| Portal by ID | PUT | `/api/v2/ContentService/Portals/:portalId` |
| Portal by ID | PATCH | `/api/v2/ContentService/Portals/:portalId` |
| Portal by ID | DELETE | `/api/v2/ContentService/Portals/:portalId` |
| Portal Options | GET | `/api/v2/ContentService/Portals/:portalId/Options` |
| Portal Settings | GET | `/api/v2/ContentService/Portals/:portalId/Settings` |
| Portal Count | GET | `/api/v2/ContentService/Portals/Count` |
| Current Portal | GET | `/api/v2/ContentService/Portals/Current` |
| Current Portal Options | GET | `/api/v2/ContentService/Portals/Current/Options` |
| Initialize Portal | POST | `/api/v2/ContentService/Portals/Initialize` |
| Root Portal | GET | `/api/v2/ContentService/Portals/Root` |
| Search Portal | GET | `/api/v2/ContentService/Portals/Search` |
| Business Domains | GET | `/api/v2/ContentService/BusinessDomains` |
| Business Domain by ID | GET | `/api/v2/ContentService/BusinessDomains/:businessDomainId` |
| Business Domains Count | GET | `/api/v2/ContentService/BusinessDomains/Count` |
| Web Pages | GET | `/api/v2/ContentService/WebPages` |
| Web Pages | POST | `/api/v2/ContentService/WebPages` |
| Web Page by ID | GET | `/api/v2/ContentService/WebPages/:webPageId` |
| Web Page by ID | PUT | `/api/v2/ContentService/WebPages/:webPageId` |
| Web Page by ID | DELETE | `/api/v2/ContentService/WebPages/:webPageId` |
| Web Page Categories | GET | `/api/v2/ContentService/WebPages/:webPageId/Categories` |
| Web Page Tags | GET | `/api/v2/ContentService/WebPages/:webPageId/Tags` |
| Web Pages Count | GET | `/api/v2/ContentService/WebPages/Count` |
| Web Page Categories | GET | `/api/v2/ContentService/WebPageCategories` |
| Web Page Categories | POST | `/api/v2/ContentService/WebPageCategories` |
| Web Page Category by ID | GET | `/api/v2/ContentService/WebPageCategories/:webPageCategoryId` |
| Web Page Category by ID | PUT | `/api/v2/ContentService/WebPageCategories/:webPageCategoryId` |
| Web Page Category by ID | DELETE | `/api/v2/ContentService/WebPageCategories/:webPageCategoryId` |
| Web Page Categories Count | GET | `/api/v2/ContentService/WebPageCategories/Count` |
| Web Page Tags | GET | `/api/v2/ContentService/WebPageTags` |
| Web Page Tags | POST | `/api/v2/ContentService/WebPageTags` |
| Web Page Tag by ID | GET | `/api/v2/ContentService/WebPageTags/:webPageTagId` |
| Web Page Tag by ID | PUT | `/api/v2/ContentService/WebPageTags/:webPageTagId` |
| Web Page Tag by ID | DELETE | `/api/v2/ContentService/WebPageTags/:webPageTagId` |
| Web Page Tags Count | GET | `/api/v2/ContentService/WebPageTags/Count` |
| Web Templates | GET | `/api/v2/ContentService/WebTemplates` |
| Web Templates | POST | `/api/v2/ContentService/WebTemplates` |
| Web Template by ID | GET | `/api/v2/ContentService/WebTemplates/:webTemplateId` |
| Web Template by ID | PUT | `/api/v2/ContentService/WebTemplates/:webTemplateId` |
| Web Template by ID | DELETE | `/api/v2/ContentService/WebTemplates/:webTemplateId` |
| Web Templates Count | GET | `/api/v2/ContentService/WebTemplates/Count` |
| Web Contents | GET | `/api/v2/ContentService/WebContents` |
| Web Contents | POST | `/api/v2/ContentService/WebContents` |
| Web Content by ID | GET | `/api/v2/ContentService/WebContents/:webContentId` |
| Web Content by ID | PUT | `/api/v2/ContentService/WebContents/:webContentId` |
| Web Content by ID | DELETE | `/api/v2/ContentService/WebContents/:webContentId` |
| Web Contents Count | GET | `/api/v2/ContentService/WebContents/Count` |
| Website Themes | GET | `/api/v2/ContentService/WebsiteThemes` |
| Website Themes | POST | `/api/v2/ContentService/WebsiteThemes` |
| Website Theme by ID | GET | `/api/v2/ContentService/WebsiteThemes/:id` |
| Website Theme by ID | PUT | `/api/v2/ContentService/WebsiteThemes/:id` |
| Website Theme by ID | DELETE | `/api/v2/ContentService/WebsiteThemes/:id` |
| Website Themes Count | GET | `/api/v2/ContentService/WebsiteThemes/Count` |
| Blog Posts | GET | `/api/v2/ContentService/BlogPosts` |
| Blog Posts | POST | `/api/v2/ContentService/BlogPosts` |
| Blog Post by ID | GET | `/api/v2/ContentService/BlogPosts/:blogPostId` |
| Blog Post by ID | PUT | `/api/v2/ContentService/BlogPosts/:blogPostId` |
| Blog Post by ID | DELETE | `/api/v2/ContentService/BlogPosts/:blogPostId` |
| Blog Post Categories | GET | `/api/v2/ContentService/BlogPosts/:blogPostId/Categories` |
| Blog Post Comments | GET | `/api/v2/ContentService/BlogPosts/:blogPostId/Comments` |
| Blog Post Tags | GET | `/api/v2/ContentService/BlogPosts/:blogPostId/Tags` |
| Blog Posts Count | GET | `/api/v2/ContentService/BlogPosts/Count` |
| Blog Post Categories | GET | `/api/v2/ContentService/BlogPostCategories` |
| Blog Post Categories | POST | `/api/v2/ContentService/BlogPostCategories` |
| Blog Post Category by ID | GET | `/api/v2/ContentService/BlogPostCategories/:blogPostCategoryId` |
| Blog Post Category by ID | PUT | `/api/v2/ContentService/BlogPostCategories/:blogPostCategoryId` |
| Blog Post Category by ID | DELETE | `/api/v2/ContentService/BlogPostCategories/:blogPostCategoryId` |
| Blog Post Categories Count | GET | `/api/v2/ContentService/BlogPostCategories/Count` |
| Blog Post Tags | GET | `/api/v2/ContentService/BlogPostTags` |
| Blog Post Tags | POST | `/api/v2/ContentService/BlogPostTags` |
| Blog Post Tag by ID | GET | `/api/v2/ContentService/BlogPostTags/:blogPostTagId` |
| Blog Post Tag by ID | PUT | `/api/v2/ContentService/BlogPostTags/:blogPostTagId` |
| Blog Post Tag by ID | DELETE | `/api/v2/ContentService/BlogPostTags/:blogPostTagId` |
| Blog Post Tags Count | GET | `/api/v2/ContentService/BlogPostTags/Count` |
| Blog Post Authors | GET | `/api/v2/ContentService/BlogPostAuthors` |
| Blog Post Author by ID | GET | `/api/v2/ContentService/BlogPostAuthors/:authorId` |
| Posts by Author | GET | `/api/v2/ContentService/BlogPostAuthors/:authorId/BlogPosts` |
| Posts by Author Count | GET | `/api/v2/ContentService/BlogPostAuthors/:authorId/BlogPosts/Count` |
| Update Themes | GET | `/api/v2/ContentService/Themes/Update` |
