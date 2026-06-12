---
name: absuite-blog-cli
description: >
  Manage blog content in the Alliance Business Suite (ABS) Content Service using the
  `absuite` CLI. Covers blog posts, categories, tags, comments, and authors via
  list/count/search/get/create/update/delete commands under the `content` service.
  Requires an authenticated CLI session (see absuite-login-cli). For atomic PATCH
  updates or raw HTTP, use the absuite-blog (REST) skill.
---

# Alliance Business Suite — Blog (CLI)

Manage the **blog subset** of the ABS **Content Service** through the `absuite` CLI. Blog
commands live under the **`content`** service (the CLI token for `contentService`). This skill
covers blog posts, their categories, tags, comments, and authors. The Content Service also
hosts portals, web pages, web content, themes, templates, and components — those are **not**
covered here; use the broader content CLI commands for them.

> The `absuite` CLI does **not** support PATCH (JSON Patch) operations. For atomic partial
> updates or raw HTTP, use the `absuite-blog` (REST) skill. For CLI install, login, and global
> conventions, see `absuite-login-cli` and `absuite-cli`.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). Commands fail with
   "Not authenticated" until you do, and prompt you to re-login when the token expires.
2. **Set a default tenant** — most blog commands take `--TenantId`. Set it once so the CLI
   auto-injects it:
   ```
   absuite config set --tenant-id <tenant-guid>
   ```
   Or pass `--TenantId <tenant-guid>` on each call. When a command has a `TenantId` parameter
   and you omit it, the CLI uses the configured default. (Throughout this skill, `$TENANT_ID`
   stands for that default tenant GUID.)
3. **Discover commands** — list everything the content service exposes, or get a command's
   parameter and output schema:
   ```
   absuite content list-commands
   absuite content list-commands | findstr /i blog      # Windows
   absuite content list blog-posts --help
   ```

## Command structure

```
absuite content <verb> <entity> --Param value [--Param value ...]
```

- **Verbs** used by the blog surface: `list`, `count`, `get`, `create`, `update`, `delete`.
  (The standard `search` verb exists in the CLI but no blog endpoint exposes a search command.)
- A few blog commands are **single-token actions** with no verb — `relate-...`, `unrelate-...`,
  and `reply-to-comment`. Invoke them directly: `absuite content relate-tag-to-blog-post ...`.
- **Parameters** are PascalCase and passed as `--Param value` (kebab-case like
  `--tenant-id` is also accepted and normalized). `true`/`false` are parsed as booleans;
  numbers are coerced to the parameter's type.
- **DTO bodies** are passed as a single JSON string to the DTO parameter, e.g.
  `--BlogPostCreateDto '{ "title": "...", "code": "...", "codeType": "Markdown" }'`. The JSON
  field names are exactly the same as the REST body fields (camelCase). Run `--help` on any
  create/update command to print the full DTO schema.
- The **canonical function-name form** also works in place of the friendly alias, e.g.
  `absuite content Get-BlogPostsAsync --TenantId $TENANT_ID` is equivalent to
  `absuite content list blog-posts --TenantId $TENANT_ID`.

## Blog Posts

### List blog posts

```
absuite content list blog-posts --TenantId $TENANT_ID
```

### Count blog posts

```
absuite content count blog-posts --TenantId $TENANT_ID
```

### Get a blog post by ID

```
absuite content get blog-post-by-id --BlogPostId <blog-post-guid>
```

### Create a blog post

`title` is required. The post body goes in `code`; set `codeType` to one of
`Razor | CSharp | CSHtml | Liquid | Html5 | Markdown | Markup` (Markdown is typical).

```
absuite content create blog-post --TenantId $TENANT_ID --BlogPostCreateDto '{
  "title": "Getting Started with the ABS Platform",
  "description": "A practical introduction for new developers.",
  "code": "# Getting Started\n\nWelcome to the Alliance Business Suite...",
  "codeType": "Markdown",
  "featuredImageUrl": "https://example.com/images/hero.jpg",
  "slug": "getting-started-with-abs",
  "published": true,
  "blogPostCategoryId": "<category-guid>",
  "webTemplateId": "<web-template-guid>"
}'
```

`BlogPostCreateDto` fields: `id`, `timestamp`, `title` (**required**), `published`,
`description`, `code`, `markup`, `featuredImageUrl`, `codeType` (enum above), `slug`,
`blogPostCategoryId`, `webTemplateId`.

### Update a blog post

`update` replaces the full editorial/SEO DTO. Send the fields you want to set.

```
absuite content update blog-post --TenantId $TENANT_ID --BlogPostId <blog-post-guid> --BlogPostUpdateDto '{
  "title": "Getting Started with the ABS Platform",
  "slug": "getting-started-with-abs",
  "description": "A practical introduction for new developers.",
  "code": "# Getting Started\n\nUpdated body...",
  "codeType": "Markdown",
  "seoTitle": "Getting Started with ABS | Alliance Business Suite",
  "metaDescription": "Learn how to set up and use the ABS platform.",
  "seoKeyPhrases": "ABS tutorial, Alliance Business Suite",
  "canonicalUrl": "https://example.com/blog/getting-started-with-abs",
  "allowSearchEngineIndexing": true,
  "enableComments": true,
  "displaySocialBox": true,
  "published": true
}'
```

`BlogPostUpdateDto` fields (all optional on the wire): `order`, `slug`, `name`, `title`,
`excerpt`, `password`, `description`, `highlightImage`, `canonicalUrl`, `seoTitle`,
`seoKeyWords`, `seoKeyPhrases`, `metaDescription`, `twitterImage`, `twitterTitle`,
`twitterDescription`, `facebookImage`, `facebookTitle`, `facebookDescription`,
`featuredImageUrl`, `content`, `code`, `namespace`, `typeName`, `generatedCode`,
`compilationPath`, `htmlContent`, `codeType` (enum above), `cSharpContent`, `razorContent`,
`cssContent`, `jsContent`, `cssFiles`, `jsFiles`, `razorGeneratedCode`, `cSharpGeneratedCode`,
`precompiledLogicSize`, `precompiledLogicSizeLong`, `precompiledViewSize`,
`precompiledViewSizeLong`, `precompiledLogicViewSize`, `template`, `default`, `enable`,
`enableComments`, `displaySocialBox`, `published`, `inTrashCan`, `systemLocked`,
`allowPingbacks`, `allowTrackbacks`, `cornerstoneContent`, `isEssentialContent`,
`allowSearchEngineIndexing`, `blogPostCategoryId`, `webTemplateId`.

> Unpublish (move to draft): `update blog-post` with `--BlogPostUpdateDto '{ "published": false }'`.

### Delete a blog post

```
absuite content delete blog-post --TenantId $TENANT_ID --BlogPostId <blog-post-guid>
```

## Categories

### List categories

```
absuite content list blog-post-categories --TenantId $TENANT_ID
```

### Count categories

```
absuite content count blog-post-categories --TenantId $TENANT_ID
```

### Get a category by ID

```
absuite content get blog-post-category-by-id --TenantId $TENANT_ID --BlogPostCategoryId <category-guid>
```

### Create a category

```
absuite content create blog-post-category --TenantId $TENANT_ID --BlogPostCategoryCreateDto '{
  "title": "Engineering",
  "slug": "engineering",
  "type": "Category",
  "description": "Technical articles and engineering updates",
  "seoTitle": "Engineering Articles",
  "metaDescription": "Engineering posts from our team.",
  "allowSerachEngines": true,
  "webPortalId": "<web-portal-guid>"
}'
```

`BlogPostCategoryCreateDto` fields: `id`, `timestamp`, `slug`, `type`, `title`, `description`,
`seoTitle`, `metaDescription`, `cornerstoneContent`, `allowSerachEngines`, `seoKeyPhrases`,
`canonicalUrl`, `imageURL`, `image`, `webPortalId`.

> NOTE: the SEO flag is spelled **`allowSerachEngines`** (misspelled in the API). Use it
> verbatim — `allowSearchEngines` is ignored.

### Update a category

```
absuite content update blog-post-category --TenantId $TENANT_ID --BlogPostCategoryId <category-guid> --BlogPostCategoryUpdateDto '{
  "title": "News & Updates",
  "slug": "news-updates",
  "description": "Company news and product updates"
}'
```

`BlogPostCategoryUpdateDto` fields: `slug`, `type`, `title`, `description`, `seoTitle`,
`metaDescription`, `cornerstoneContent`, `allowSerachEngines`, `seoKeyPhrases`, `canonicalUrl`,
`imageURL`, `image`, `webPortalId`.

### Delete a category

```
absuite content delete blog-post-category --TenantId $TENANT_ID --BlogPostCategoryId <category-guid>
```

### Per-post categories

```
# List the categories of a post
absuite content get categories-for-blog-post --BlogPostId <blog-post-guid>

# Create a NEW category attached to a post (body = BlogPostCategoryCreateDto)
absuite content create category-for-blog-post --TenantId $TENANT_ID --BlogPostId <blog-post-guid> --BlogPostCategoryCreateDto '{
  "title": "Engineering", "slug": "engineering"
}'

# Relate an EXISTING category to a post (no verb; no body)
absuite content relate-category-to-blog-post --TenantId $TENANT_ID --BlogPostId <blog-post-guid> --CategoryId <category-guid>

# Unrelate a category from a post
absuite content unrelate-category-from-blog-post --TenantId $TENANT_ID --BlogPostId <blog-post-guid> --CategoryId <category-guid>
```

## Tags

### List tags

```
absuite content list blog-post-tags --TenantId $TENANT_ID
```

### Count tags

```
absuite content count blog-post-tags --TenantId $TENANT_ID
```

### Get a tag by ID

```
absuite content get blog-post-tag-by-id --TenantId $TENANT_ID --BlogPostTagId <tag-guid>
```

### Create a tag

```
absuite content create blog-post-tag --TenantId $TENANT_ID --BlogPostTagCreateDto '{
  "title": "Tutorial",
  "slug": "tutorial",
  "type": "Tag"
}'
```

`BlogPostTagCreateDto` fields: `id`, `timestamp`, `slug`, `type`, `title`, `description`,
`seoTitle`, `metaDescription`, `cornerstoneContent`, `allowSerachEngines`, `seoKeyPhrases`,
`canonicalUrl`, `imageURL`, `image`, `webPortalId`.

### Update a tag

```
absuite content update blog-post-tag --TenantId $TENANT_ID --BlogPostTagId <tag-guid> --BlogPostTagUpdateDto '{
  "title": "Tutorials",
  "slug": "tutorials"
}'
```

`BlogPostTagUpdateDto` fields: `slug`, `type`, `title`, `description`, `seoTitle`,
`metaDescription`, `cornerstoneContent`, `allowSerachEngines`, `seoKeyPhrases`, `canonicalUrl`,
`imageURL`, `image`, `webPortalId`.

### Delete a tag

```
absuite content delete blog-post-tag --TenantId $TENANT_ID --BlogPostTagId <tag-guid>
```

### Per-post tags

```
# List the tags of a post
absuite content get tags-for-blog-post --BlogPostId <blog-post-guid>

# Create a NEW tag attached to a post (body = BlogPostTagCreateDto)
absuite content create tag-for-blog-post --TenantId $TENANT_ID --BlogPostId <blog-post-guid> --BlogPostTagCreateDto '{
  "title": "Beginner", "slug": "beginner"
}'

# Relate an EXISTING tag to a post (no verb; no body)
absuite content relate-tag-to-blog-post --TenantId $TENANT_ID --BlogPostId <blog-post-guid> --TagId <tag-guid>

# Unrelate a tag from a post
absuite content unrelate-tag-from-blog-post --TenantId $TENANT_ID --BlogPostId <blog-post-guid> --TagId <tag-guid>
```

## Comments

### List comments for a post

```
absuite content get comments-for-blog-post --BlogPostId <blog-post-guid>
```

### Create a comment on a post

`message` is required.

```
absuite content create comment-for-blog-post --TenantId $TENANT_ID --BlogPostId <blog-post-guid> --BlogPostCommentCreateDto '{
  "message": "Great article! Very helpful.",
  "ownerSocialProfileId": "<social-profile-guid>"
}'
```

`BlogPostCommentCreateDto` fields: `id`, `timestamp`, `message` (**required**),
`ownerSocialProfileId`, `socialPostId`, `parentCommentId`.

### List replies for a comment

```
absuite content get replies-for-comment --BlogPostId <blog-post-guid> --CommentId <comment-guid>
```

### Reply to a comment

Single-token action; body = `BlogPostCommentCreateDto` (`message` required).

```
absuite content reply-to-comment --TenantId $TENANT_ID --BlogPostId <blog-post-guid> --CommentId <comment-guid> --BlogPostCommentCreateDto '{
  "message": "Thanks for the feedback!"
}'
```

### Delete a comment

```
absuite content delete comment-from-blog-post --TenantId $TENANT_ID --BlogPostId <blog-post-guid> --CommentId <comment-guid>
```

## Authors (read-only)

### List blog authors

```
absuite content list blog-authors --TenantId $TENANT_ID
```

### Get an author by ID

```
absuite content get blog-author-by-id --AuthorId <author-guid>
```

### List posts by author

```
absuite content get blog-posts-by-author --AuthorId <author-guid>
```

### Count posts by author

```
absuite content count blog-posts-by-author --AuthorId <author-guid>
```

## End-to-End Workflow

```
# 0. Authenticate and set the default tenant
absuite login
absuite config set --tenant-id <tenant-guid>

# 1. Find or create a category
absuite content list blog-post-categories
absuite content create blog-post-category --BlogPostCategoryCreateDto '{
  "title": "Product Updates", "slug": "product-updates", "description": "Release notes and announcements"
}'
# → note the returned result.id as <category-guid>

# 2. Create the post (title required; Markdown body in code)
absuite content create blog-post --BlogPostCreateDto '{
  "title": "Announcing ABS v2",
  "description": "What is new in this release.",
  "code": "# Announcing ABS v2\n\nToday we are releasing...",
  "codeType": "Markdown",
  "published": false,
  "blogPostCategoryId": "<category-guid>",
  "slug": "announcing-abs-v2"
}'
# → note the returned result.id as <blog-post-guid>

# 3. Add a tag bound to the post
absuite content create tag-for-blog-post --BlogPostId <blog-post-guid> --BlogPostTagCreateDto '{
  "title": "Release", "slug": "release"
}'

# 4. Update SEO and publish (full-DTO update — CLI has no PATCH; use absuite-blog REST for atomic patches)
absuite content update blog-post --BlogPostId <blog-post-guid> --BlogPostUpdateDto '{
  "seoTitle": "Announcing ABS v2 | Alliance Business Suite",
  "metaDescription": "Read the ABS v2 release notes.",
  "allowSearchEngineIndexing": true,
  "published": true
}'

# 5. Verify
absuite content get blog-post-by-id --BlogPostId <blog-post-guid>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List blog posts | `absuite content list blog-posts --TenantId $TENANT_ID` |
| Count blog posts | `absuite content count blog-posts --TenantId $TENANT_ID` |
| Get blog post by ID | `absuite content get blog-post-by-id --BlogPostId <id>` |
| Create blog post | `absuite content create blog-post --TenantId $TENANT_ID --BlogPostCreateDto '{...}'` |
| Update blog post | `absuite content update blog-post --TenantId $TENANT_ID --BlogPostId <id> --BlogPostUpdateDto '{...}'` |
| Delete blog post | `absuite content delete blog-post --TenantId $TENANT_ID --BlogPostId <id>` |
| List post categories | `absuite content get categories-for-blog-post --BlogPostId <id>` |
| Create category on post | `absuite content create category-for-blog-post --TenantId $TENANT_ID --BlogPostId <id> --BlogPostCategoryCreateDto '{...}'` |
| Relate category to post | `absuite content relate-category-to-blog-post --TenantId $TENANT_ID --BlogPostId <id> --CategoryId <id>` |
| Unrelate category from post | `absuite content unrelate-category-from-blog-post --TenantId $TENANT_ID --BlogPostId <id> --CategoryId <id>` |
| List post comments | `absuite content get comments-for-blog-post --BlogPostId <id>` |
| Create comment on post | `absuite content create comment-for-blog-post --TenantId $TENANT_ID --BlogPostId <id> --BlogPostCommentCreateDto '{...}'` |
| Delete comment | `absuite content delete comment-from-blog-post --TenantId $TENANT_ID --BlogPostId <id> --CommentId <id>` |
| List comment replies | `absuite content get replies-for-comment --BlogPostId <id> --CommentId <id>` |
| Reply to comment | `absuite content reply-to-comment --TenantId $TENANT_ID --BlogPostId <id> --CommentId <id> --BlogPostCommentCreateDto '{...}'` |
| List post tags | `absuite content get tags-for-blog-post --BlogPostId <id>` |
| Create tag on post | `absuite content create tag-for-blog-post --TenantId $TENANT_ID --BlogPostId <id> --BlogPostTagCreateDto '{...}'` |
| Relate tag to post | `absuite content relate-tag-to-blog-post --TenantId $TENANT_ID --BlogPostId <id> --TagId <id>` |
| Unrelate tag from post | `absuite content unrelate-tag-from-blog-post --TenantId $TENANT_ID --BlogPostId <id> --TagId <id>` |
| List categories | `absuite content list blog-post-categories --TenantId $TENANT_ID` |
| Count categories | `absuite content count blog-post-categories --TenantId $TENANT_ID` |
| Get category by ID | `absuite content get blog-post-category-by-id --TenantId $TENANT_ID --BlogPostCategoryId <id>` |
| Create category | `absuite content create blog-post-category --TenantId $TENANT_ID --BlogPostCategoryCreateDto '{...}'` |
| Update category | `absuite content update blog-post-category --TenantId $TENANT_ID --BlogPostCategoryId <id> --BlogPostCategoryUpdateDto '{...}'` |
| Delete category | `absuite content delete blog-post-category --TenantId $TENANT_ID --BlogPostCategoryId <id>` |
| List tags | `absuite content list blog-post-tags --TenantId $TENANT_ID` |
| Count tags | `absuite content count blog-post-tags --TenantId $TENANT_ID` |
| Get tag by ID | `absuite content get blog-post-tag-by-id --TenantId $TENANT_ID --BlogPostTagId <id>` |
| Create tag | `absuite content create blog-post-tag --TenantId $TENANT_ID --BlogPostTagCreateDto '{...}'` |
| Update tag | `absuite content update blog-post-tag --TenantId $TENANT_ID --BlogPostTagId <id> --BlogPostTagUpdateDto '{...}'` |
| Delete tag | `absuite content delete blog-post-tag --TenantId $TENANT_ID --BlogPostTagId <id>` |
| List blog authors | `absuite content list blog-authors --TenantId $TENANT_ID` |
| Get author by ID | `absuite content get blog-author-by-id --AuthorId <id>` |
| List posts by author | `absuite content get blog-posts-by-author --AuthorId <id>` |
| Count posts by author | `absuite content count blog-posts-by-author --AuthorId <id>` |

---

For atomic PATCH (JSON Patch) updates or raw HTTP, see the `absuite-blog` (REST) skill. For
CLI install, login, and global options, see `absuite-login-cli` and `absuite-cli`.
