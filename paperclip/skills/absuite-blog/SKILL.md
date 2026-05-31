---
name: absuite-blog
description: >
  Create, read, update, and delete blog posts in the Alliance Business Suite
  (ABS) Content Service using the `absuite` CLI. Covers blog posts, categories,
  tags, comments, and authors. Blog post content is written in Markdown and passed
  via the `Code` property. Requires an authenticated CLI session (use the
  `absuite-login` skill to authenticate first).
---

# Alliance Business Suite — Blog Posts Skill

Manage blog posts through the `absuite` CLI's `content` service. All blog operations are tenant-scoped and require authentication.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant** — all blog operations require a tenant. Either set a default:
   ```bash
   absuite config set --tenant-id <tenant-guid>
   ```
   Or pass `--TenantId <guid>` on each call.
3. **Discover commands** — run `absuite content list-commands` to see all content commands, or use `--help` on any command for full parameter and output schemas.

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

## Command Discovery

```bash
# List all content commands
absuite content list-commands

# Filter for blog-related commands
absuite content list-commands | grep blog

# Get detailed help for any command
absuite content create blog-post --help
```

**REST API equivalent:**
```bash
# All blog endpoints are under the ContentService base path:
# $ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts
# $ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories
# $ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags
# Use --help on CLI commands to see the full DTO schemas for request bodies.
```

## Important: Content Format

Blog post body content goes in the **`Code`** property as **Markdown**. Set `CodeType` to `"Markdown"`.

- `Code` — the Markdown source of the blog post body
- `HtmlContent` — optional pre-rendered HTML (if omitted, the platform renders from `Code`)
- `Description` — a short plain-text summary / excerpt shown in listings
- `Title` — the display title of the post

## Workflow: Creating a Blog Post

Always follow this sequence:

1. **Fetch available categories** — every blog post must belong to a category
2. **Create the blog post** — with Markdown content in `Code`, assigned to a category
3. **(Optional)** Add tags to the post
4. **(Optional)** Update SEO fields

### Step 1 — Get Available Categories

```bash
absuite content list blog-post-categories --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Response contains an array of categories.Note the `.Id` and `.Title` of the one you want:

```
.Result[]:
  .Id           — category GUID (use as BlogPostCategoryID)
  .Title        — category display name
  .Slug         — URL-friendly identifier
  .Description  — category description
```

If no suitable category exists, create one first:

```bash
absuite content create blog-post-category --TenantId $TENANT_ID --BlogPostCategoryCreateDto '{
  "Title": "Engineering",
  "Slug": "engineering",
  "Description": "Technical articles and engineering updates"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Engineering",
    "Slug": "engineering",
    "Description": "Technical articles and engineering updates"
  }'
```

### Step 2 — Create the Blog Post

```bash
absuite content create blog-post --TenantId $TENANT_ID --BlogPostCreateDto '{
  "Title": "Getting Started with the ABS Platform",
  "Description": "A practical introduction to the Alliance Business Suite for new developers.",
  "Code": "# Getting Started with the ABS Platform\n\nWelcome to the Alliance Business Suite...\n\n## Prerequisites\n\n- An ABS tenant\n- The `absuite` CLI installed\n\n## First Steps\n\nAfter logging in with `absuite login`, explore the available services:\n\n```bash\nabsuite services\n```\n\n## Next Steps\n\nCheck out the full documentation at [absuite.net](https://absuite.net).",
  "CodeType": "Markdown",
  "Published": true,
  "BlogPostCategoryID": "<category-guid>",
  "FeaturedImageUrl": "https://example.com/images/hero.jpg"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Getting Started with the ABS Platform",
    "Description": "A practical introduction to the Alliance Business Suite for new developers.",
    "Code": "# Getting Started with the ABS Platform\n\nWelcome to the Alliance Business Suite...",
    "CodeType": "Markdown",
    "Published": true,
    "BlogPostCategoryID": "<category-guid>",
    "FeaturedImageUrl": "https://example.com/images/hero.jpg"
  }'
```

**Required fields:**
- `Title` — blog post title
- `Code` — the Markdown content body
- `CodeType` — set to `"Markdown"`
- `BlogPostCategoryID` — GUID of an existing category (from Step 1)

**Recommended fields:**
- `Description` — short excerpt for listings and meta description
- `Published` — `true` to make visible, `false` for draft
- `FeaturedImageUrl` — hero image URL

### Step 3 (Optional) — Add Tags

First check available tags:

```bash
absuite content list blog-post-tags --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Create a new tag for the post:

```bash
absuite content create tag-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostTagCreateDto '{
  "Title": "Getting Started",
  "Slug": "getting-started"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Getting Started",
    "Slug": "getting-started"
  }'
```

Or relate an existing tag:

```bash
absuite content post relate-tag-to-blog --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostTagId <tag-guid>
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Step 4 (Optional) — Update SEO Fields

```bash
absuite content update blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostUpdateDto '{
  "SeoTitle": "Getting Started with ABS | Alliance Business Suite",
  "MetaDescription": "Learn how to set up and use the Alliance Business Suite platform.",
  "SeoKeyPhrases": "ABS, Alliance Business Suite, getting started, tutorial",
  "CanonicalUrl": "https://example.com/blog/getting-started-abs",
  "AllowSearchEngineIndexing": true,
  "Slug": "getting-started-with-abs"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "SeoTitle": "Getting Started with ABS | Alliance Business Suite",
    "MetaDescription": "Learn how to set up and use the Alliance Business Suite platform.",
    "SeoKeyPhrases": "ABS, Alliance Business Suite, getting started, tutorial",
    "CanonicalUrl": "https://example.com/blog/getting-started-abs",
    "AllowSearchEngineIndexing": true,
    "Slug": "getting-started-with-abs"
  }'
```

## CRUD Operations

### List Blog Posts

```bash
absuite content list blog-posts --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Blog Posts

```bash
absuite content count blog-posts --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Blog Post by ID

```bash
absuite content get blog-post-by-id --BlogPostId <post-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Blog Post

Update the Markdown content, title, or any other fields:

```bash
absuite content update blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostUpdateDto '{
  "Title": "Updated Title",
  "Code": "# Updated Title\n\nNew Markdown content goes here...",
  "CodeType": "Markdown",
  "Published": true
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Updated Title",
    "Code": "# Updated Title\n\nNew Markdown content goes here...",
    "CodeType": "Markdown",
    "Published": true
  }'
```

### Unpublish (Draft) a Blog Post

```bash
absuite content update blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostUpdateDto '{
  "Published": false
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Published": false}'
```

### Delete Blog Post

```bash
absuite content delete blog-post --TenantId $TENANT_ID --BlogPostId <post-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Categories

### List Categories

```bash
absuite content list blog-post-categories --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Category

```bash
absuite content create blog-post-category --TenantId $TENANT_ID --BlogPostCategoryCreateDto '{
  "Title": "Product Updates",
  "Slug": "product-updates",
  "Description": "Latest product news and feature announcements"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Product Updates",
    "Slug": "product-updates",
    "Description": "Latest product news and feature announcements"
  }'
```

### Get Category by ID

```bash
absuite content get blog-post-category-by-id --BlogPostCategoryId <category-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update Category

```bash
absuite content update blog-post-category --TenantId $TENANT_ID --BlogPostCategoryId <category-guid> --BlogPostCategoryUpdateDto '{
  "Title": "News & Updates",
  "Description": "Company news and product updates"
}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "News & Updates",
    "Description": "Company news and product updates"
  }'
```

### Delete Category

```bash
absuite content delete blog-post-category --TenantId $TENANT_ID --BlogPostCategoryId <category-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Categories for a Specific Post

```bash
absuite content get categories-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Relate / Unrelate Category to Post

```bash
# Add a category
absuite content post relate-category-to-blog --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostCategoryId <category-guid>

# Remove a category
absuite content post unrelate-category-from-blog --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostCategoryId <category-guid>
```

**REST API equivalent:**
```bash
# Add a category to a post
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Categories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Remove a category from a post
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Categories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Tags

### List Tags

```bash
absuite content list blog-post-tags --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Tag (Global)

```bash
absuite content create blog-post-tag --TenantId $TENANT_ID --BlogPostTagCreateDto '{
  "Title": "Tutorial",
  "Slug": "tutorial"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Tutorial",
    "Slug": "tutorial"
  }'
```

### Create Tag for a Specific Post

```bash
absuite content create tag-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostTagCreateDto '{
  "Title": "Beginner",
  "Slug": "beginner"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Beginner",
    "Slug": "beginner"
  }'
```

### Get Tags for a Specific Post

```bash
absuite content get tags-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Relate / Unrelate Tag to Post

```bash
# Add a tag
absuite content post relate-tag-to-blog --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostTagId <tag-guid>

# Remove a tag
absuite content post unrelate-tag-from-blog --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostTagId <tag-guid>
```

**REST API equivalent:**
```bash
# Add a tag to a post
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Remove a tag from a post
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Tags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Delete Tag

```bash
absuite content delete blog-post-tag --TenantId $TENANT_ID --BlogPostTagId <tag-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/<tag-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Comments

### Get Comments for a Post

```bash
absuite content get comments-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Comment on a Post

```bash
absuite content create comment-for-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostCommentCreateDto '{
  "Content": "Great article! Very helpful."
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Content": "Great article! Very helpful."}'
```

### Reply to a Comment

```bash
absuite content reply-to-comment --TenantId $TENANT_ID --BlogPostCommentId <comment-guid> --BlogPostCommentReplyDto '{
  "Content": "Thanks for the feedback!"
}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments/<comment-guid>/Reply" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Content": "Thanks for the feedback!"}'
```

### Delete Comment

```bash
absuite content delete comment-from-blog-post --TenantId $TENANT_ID --BlogPostId <post-guid> --BlogPostCommentId <comment-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<post-guid>/Comments/<comment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Authors

### List Blog Authors

```bash
absuite content list blog-authors --TenantId $TENANT_ID
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Author by ID

```bash
absuite content get blog-author-by-id --BlogAuthorId <author-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors/<author-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Posts by Author

```bash
absuite content get blog-posts-by-author --TenantId $TENANT_ID --BlogAuthorId <author-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors/<author-guid>/BlogPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Posts by Author

```bash
absuite content count blog-posts-by-author --TenantId $TENANT_ID --BlogAuthorId <author-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors/<author-guid>/BlogPosts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Markdown Content Guidelines

When writing blog post content for the `Code` field:

1. **Use standard Markdown** — headings, lists, links, images, code blocks, emphasis, blockquotes
2. **Escape JSON strings** — newlines must be `\n`, quotes must be `\"` inside the JSON DTO
3. **Keep it readable** — for long posts, build the Markdown string in a variable first:

```bash
# Build content in a variable, then pass it
$CONTENT="# My Blog Post\n\nIntro paragraph.\n\n## Section One\n\nDetails here.\n\n## Section Two\n\n- Point A\n- Point B\n- Point C\n\n## Conclusion\n\nWrapping up."

absuite content create blog-post --TenantId $TENANT_ID --BlogPostCreateDto "{
  \"Title\": \"My Blog Post\",
  \"Description\": \"A brief summary of the post.\",
  \"Code\": \"$CONTENT\",
  \"CodeType\": \"Markdown\",
  \"Published\": true,
  \"BlogPostCategoryID\": \"<category-guid>\"
}"
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "My Blog Post",
    "Description": "A brief summary of the post.",
    "Code": "# My Blog Post\n\nIntro paragraph.\n\n## Section One\n\nDetails here.\n\n## Section Two\n\n- Point A\n- Point B\n- Point C\n\n## Conclusion\n\nWrapping up.",
    "CodeType": "Markdown",
    "Published": true,
    "BlogPostCategoryID": "<category-guid>"
  }'
```

4. **Images** — use full URLs in Markdown image syntax: `![Alt text](https://example.com/image.jpg)`
5. **Code blocks** — use triple backticks with language hints:

````
```csharp
var client = new AbsClient();
await client.LoginAsync();
```
````

## Full Example: End-to-End Blog Post Creation

```bash
# 1. Authenticate
absuite login --email author@company.com

# 2. Set tenant
absuite config set --tenant-id 00000000-0000-0000-0000-000000000000

# 3. List categories to pick one
absuite content list blog-post-categories

# 4. Create the post (using a category ID from step 3)
absuite content create blog-post --BlogPostCreateDto '{
  "Title": "Announcing ABS CLI v1.0",
  "Description": "We are excited to announce the general availability of the ABS CLI.",
  "Code": "# Announcing ABS CLI v1.0\n\nToday we are releasing the **Alliance Business Suite CLI** to the public.\n\n## What is it?\n\nA single command-line tool that wraps all 37 ABS API services into 1700+ human-friendly commands.\n\n## Install\n\n```bash\nnpm install -g @fenixalliance/abs-cli\n```\n\n## Get Started\n\n```bash\nabsuite login --email you@example.com\nabsuite services\nabsuite crm list contacts\n```\n\n## Learn More\n\nVisit [absuite.net](https://absuite.net) for full documentation.",
  "CodeType": "Markdown",
  "Published": true,
  "BlogPostCategoryID": "<category-guid-from-step-3>",
  "FeaturedImageUrl": "https://cdn.example.com/blog/abs-cli-hero.png"
}'

# 5. Note the returned post ID, then add tags
absuite content create tag-for-blog-post --BlogPostId <returned-post-id> --BlogPostTagCreateDto '{
  "Title": "CLI",
  "Slug": "cli"
}'

absuite content create tag-for-blog-post --BlogPostId <returned-post-id> --BlogPostTagCreateDto '{
  "Title": "Release",
  "Slug": "release"
}'

# 6. Update SEO
absuite content update blog-post --BlogPostId <returned-post-id> --BlogPostUpdateDto '{
  "SeoTitle": "ABS CLI v1.0 Released | Alliance Business Suite",
  "MetaDescription": "Install the ABS CLI with npm and manage your entire business suite from the terminal.",
  "SeoKeyPhrases": "ABS CLI, Alliance Business Suite, command line, npm",
  "Slug": "announcing-abs-cli-v1",
  "AllowSearchEngineIndexing": true,
  "EnableComments": true,
  "DisplaySocialBox": true
}'

# 7. Verify
absuite content get blog-post-by-id --BlogPostId <returned-post-id>
```

**REST API equivalent:**
```bash
# 1. Authenticate — obtain a bearer token
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"author@company.com","password":"..."}'
# Save the returned token as $ABSUITE_ACCESS_TOKEN

# 2. List categories to pick one
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 3. Create the post (using a category ID from step 2)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Announcing ABS CLI v1.0",
    "Description": "We are excited to announce the general availability of the ABS CLI.",
    "Code": "# Announcing ABS CLI v1.0\n\nToday we are releasing the **Alliance Business Suite CLI** to the public...",
    "CodeType": "Markdown",
    "Published": true,
    "BlogPostCategoryID": "<category-guid-from-step-2>",
    "FeaturedImageUrl": "https://cdn.example.com/blog/abs-cli-hero.png"
  }'
# Save the returned post ID as <returned-post-id>

# 4. Add tags
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<returned-post-id>/Tags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Title": "CLI", "Slug": "cli"}'

curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<returned-post-id>/Tags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Title": "Release", "Slug": "release"}'

# 5. Update SEO
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<returned-post-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "SeoTitle": "ABS CLI v1.0 Released | Alliance Business Suite",
    "MetaDescription": "Install the ABS CLI with npm and manage your entire business suite from the terminal.",
    "SeoKeyPhrases": "ABS CLI, Alliance Business Suite, command line, npm",
    "Slug": "announcing-abs-cli-v1",
    "AllowSearchEngineIndexing": true,
    "EnableComments": true,
    "DisplaySocialBox": true
  }'

# 6. Verify
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<returned-post-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

| Resource | Method | Endpoint |
|---|---|---|
| Blog Posts | GET | `/api/v2/ContentService/BlogPosts` |
| Blog Posts | POST | `/api/v2/ContentService/BlogPosts` |
| Blog Post by ID | GET | `/api/v2/ContentService/BlogPosts/:blogPostId` |
| Blog Post by ID | PUT | `/api/v2/ContentService/BlogPosts/:blogPostId` |
| Blog Post by ID | DELETE | `/api/v2/ContentService/BlogPosts/:blogPostId` |
| Blog Post Categories | GET | `/api/v2/ContentService/BlogPosts/:blogPostId/Categories` |
| Relate Category | POST | `/api/v2/ContentService/BlogPosts/:blogPostId/Categories/:categoryId` |
| Unrelate Category | DELETE | `/api/v2/ContentService/BlogPosts/:blogPostId/Categories/:categoryId` |
| Blog Post Comments | GET | `/api/v2/ContentService/BlogPosts/:blogPostId/Comments` |
| Create Comment | POST | `/api/v2/ContentService/BlogPosts/:blogPostId/Comments` |
| Delete Comment | DELETE | `/api/v2/ContentService/BlogPosts/:blogPostId/Comments/:commentId` |
| Comment Replies | GET | `/api/v2/ContentService/BlogPosts/:blogPostId/Comments/:commentId/Replies` |
| Reply to Comment | POST | `/api/v2/ContentService/BlogPosts/:blogPostId/Comments/:commentId/Reply` |
| Blog Post Tags | GET | `/api/v2/ContentService/BlogPosts/:blogPostId/Tags` |
| Relate Tag | POST | `/api/v2/ContentService/BlogPosts/:blogPostId/Tags/:tagId` |
| Unrelate Tag | DELETE | `/api/v2/ContentService/BlogPosts/:blogPostId/Tags/:tagId` |
| Blog Posts Count | GET | `/api/v2/ContentService/BlogPosts/Count` |
| Blog Post Categories (all) | GET | `/api/v2/ContentService/BlogPostCategories` |
| Blog Post Categories (all) | POST | `/api/v2/ContentService/BlogPostCategories` |
| Blog Post Category by ID | GET | `/api/v2/ContentService/BlogPostCategories/:blogPostCategoryId` |
| Blog Post Category by ID | PUT | `/api/v2/ContentService/BlogPostCategories/:blogPostCategoryId` |
| Blog Post Category by ID | DELETE | `/api/v2/ContentService/BlogPostCategories/:blogPostCategoryId` |
| Blog Post Categories Count | GET | `/api/v2/ContentService/BlogPostCategories/Count` |
| Blog Post Tags (all) | GET | `/api/v2/ContentService/BlogPostTags` |
| Blog Post Tags (all) | POST | `/api/v2/ContentService/BlogPostTags` |
| Blog Post Tag by ID | GET | `/api/v2/ContentService/BlogPostTags/:blogPostTagId` |
| Blog Post Tag by ID | PUT | `/api/v2/ContentService/BlogPostTags/:blogPostTagId` |
| Blog Post Tag by ID | DELETE | `/api/v2/ContentService/BlogPostTags/:blogPostTagId` |
| Blog Post Tags Count | GET | `/api/v2/ContentService/BlogPostTags/Count` |
| Blog Post Authors | GET | `/api/v2/ContentService/BlogPostAuthors` |
| Blog Post Author by ID | GET | `/api/v2/ContentService/BlogPostAuthors/:authorId` |
| Posts by Author | GET | `/api/v2/ContentService/BlogPostAuthors/:authorId/BlogPosts` |
| Posts by Author Count | GET | `/api/v2/ContentService/BlogPostAuthors/:authorId/BlogPosts/Count` |
