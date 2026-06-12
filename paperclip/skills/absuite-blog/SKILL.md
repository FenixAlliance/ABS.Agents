---
name: absuite-blog
description: >
  Manage blog content in the Alliance Business Suite (ABS) Content Service via the
  REST API (curl). Covers blog posts, categories, tags, comments, and authors,
  including atomic PATCH (JSON Patch) updates. Tenant scoping is per-endpoint —
  blog reads are public/optional-tenant; writes are tenant-scoped. Requires a bearer
  token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Blog (REST)

Manage the **blog subset** of the ABS **Content Service** directly over HTTP. This skill
covers blog posts, their categories, tags, comments, and authors. The Content Service also
hosts portals, web pages, web content, themes, templates, and components — those are **not**
covered here; see the `absuite-content` skill for the rest of the service.

> This is the pure-REST skill. For the same operations via the `absuite` CLI, see
> `absuite-blog-cli`. For general REST conventions (auth, envelope, tenant scoping, PATCH),
> see `absuite-rest`.

## Authentication

Obtain a bearer token, then send it on every request.

```bash
# 1. Log in
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<your-email>", "password": "<your-password>"}'
# → response contains "accessToken"; export it:
#   export ABSUITE_ACCESS_TOKEN=<accessToken>

# 2. Authenticate every subsequent call
#   -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

- **Base path:** `$ABSUITE_HOST_URL/api/v2/ContentService/<Resource>`
- **Response envelope:** every response is
  `{ "isSuccess": bool, "errorMessage": str|null, "correlationId": str, "timestamp": str, "result": <data|array|int|null> }`.
  Always check `isSuccess`; read the payload from `result`.

## Tenant scoping (read this — it varies per endpoint)

The platform binds the tenant from the `?tenantId=` query param **or** the `X-TenantId`
header interchangeably. For the blog endpoints:

- **Reads are public / optional-tenant.** `GET BlogPosts`, `GET BlogPosts/{id}`,
  `GET BlogPosts/Count`, the per-post sub-resource GETs (Categories / Comments / Tags / Replies),
  and all `BlogPostAuthors` GETs do **not** require a tenant. Omitting `tenantId` returns the
  global/public view; pass `?tenantId=<tenant-guid>` to scope to a tenant where the endpoint
  accepts it (`GET BlogPosts`, `GET BlogPosts/Count`).
- **Category and Tag collection reads are tenant-required.** `GET/Count BlogPostCategories`
  and `GET/Count BlogPostTags` require `?tenantId=<tenant-guid>`.
- **All writes are tenant-required.** Every POST / PUT / PATCH / DELETE below requires
  `?tenantId=<tenant-guid>` (a common past bug was omitting it on writes → HTTP 400). The
  `?tenantId=` query param is shown in the examples; `-H "X-TenantId: <tenant-guid>"` is the
  equivalent.

The exact requirement for each endpoint is in the **Quick Reference** table at the bottom.

## Key Concepts

- **Blog post** (`BlogPosts`) — the article aggregate. On **create** the post body content
  goes in `code` with `codeType` selecting the source language (Markdown is typical for blog
  authoring). `title` is the only required field on create.
- **`codeType`** is an enum: **`Razor | CSharp | CSHtml | Liquid | Html5 | Markdown | Markup`**.
- **Category** (`BlogPostCategories`) — taxonomy bucket. A post may reference a primary
  category via `blogPostCategoryId`, and additional categories can be related/unrelated.
- **Tag** (`BlogPostTags`) — lightweight label, related/unrelated to posts.
- **Comment** (`BlogPosts/{id}/Comments`) — reader comments; `message` is required, and a
  comment can be a reply to another (`parentCommentId`).
- **Author** (`BlogPostAuthors`) — read-only over this surface (list, get, posts-by-author,
  count); authors are not created/edited through these endpoints.
- The **create** DTO and the **update** DTO are different shapes — create is a small set of
  fields, update exposes the full editorial/SEO surface. Use the field names exactly as listed.

## Operations

### List blog posts (optional tenant)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```
Omit `?tenantId=` for the public/global list.

### Count blog posts (optional tenant)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a blog post by ID (no tenant param)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a blog post (tenant required)

Body = `BlogPostCreateDto`. Required field: `title`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with the ABS Platform",
    "description": "A practical introduction for new developers.",
    "code": "# Getting Started\n\nWelcome to the Alliance Business Suite...",
    "codeType": "Markdown",
    "markup": "",
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

### Update a blog post — full replace (tenant required)

Body = `BlogPostUpdateDto` (the full editorial + SEO surface). PUT replaces the whole DTO.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with the ABS Platform",
    "slug": "getting-started-with-abs",
    "excerpt": "A practical introduction for new developers.",
    "description": "A practical introduction for new developers.",
    "content": "# Getting Started\n\nUpdated body...",
    "code": "# Getting Started\n\nUpdated body...",
    "codeType": "Markdown",
    "htmlContent": "",
    "featuredImageUrl": "https://example.com/images/hero.jpg",
    "canonicalUrl": "https://example.com/blog/getting-started-with-abs",
    "seoTitle": "Getting Started with ABS | Alliance Business Suite",
    "seoKeyWords": "ABS, getting started",
    "seoKeyPhrases": "ABS tutorial, Alliance Business Suite",
    "metaDescription": "Learn how to set up and use the ABS platform.",
    "enable": true,
    "enableComments": true,
    "displaySocialBox": true,
    "published": true,
    "allowSearchEngineIndexing": true,
    "cornerstoneContent": false,
    "blogPostCategoryId": "<category-guid>",
    "webTemplateId": "<web-template-guid>"
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

### Patch a blog post — atomic partial update (tenant required)

`Content-Type: application/json`, body = a **JSON Patch (RFC 6902) array**. See the
**PATCH** section below for the full operation set. Quick example — publish a draft and fix
its title in one atomic request:

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/title", "value": "Getting Started with ABS (2026 Edition)" },
    { "op": "replace", "path": "/published", "value": true }
  ]'
```

### Delete a blog post (tenant required)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

### Categories

#### List categories (tenant required)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Count categories (tenant required)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Get category by ID (tenant required)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Create a category (tenant required)

Body = `BlogPostCategoryCreateDto`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "engineering",
    "type": "Category",
    "title": "Engineering",
    "description": "Technical articles and engineering updates",
    "seoTitle": "Engineering Articles",
    "metaDescription": "Engineering posts from our team.",
    "seoKeyPhrases": "engineering, software",
    "canonicalUrl": "https://example.com/blog/category/engineering",
    "cornerstoneContent": false,
    "allowSerachEngines": true,
    "imageURL": "https://example.com/images/engineering.jpg",
    "image": "",
    "webPortalId": "<web-portal-guid>"
  }'
```

`BlogPostCategoryCreateDto` fields: `id`, `timestamp`, `slug`, `type`, `title`, `description`,
`seoTitle`, `metaDescription`, `cornerstoneContent`, `allowSerachEngines`, `seoKeyPhrases`,
`canonicalUrl`, `imageURL`, `image`, `webPortalId`.

> NOTE: the API spells the SEO-indexing flag **`allowSerachEngines`** (misspelled in the
> contract). Transcribe it verbatim — `allowSearchEngines` will be ignored.

#### Update a category — full replace (tenant required)

Body = `BlogPostCategoryUpdateDto`: `slug`, `type`, `title`, `description`, `seoTitle`,
`metaDescription`, `cornerstoneContent`, `allowSerachEngines`, `seoKeyPhrases`, `canonicalUrl`,
`imageURL`, `image`, `webPortalId`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "News & Updates",
    "slug": "news-updates",
    "description": "Company news and product updates"
  }'
```

#### Patch a category — atomic partial update (tenant required)

JSON Patch array.

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/title", "value": "News & Updates" } ]'
```

#### Delete a category (tenant required)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Per-post categories (relate / unrelate / list / create)

```bash
# List the categories of a post (no tenant param)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a NEW category attached to a post (tenant required; body = BlogPostCategoryCreateDto)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Categories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Engineering", "slug": "engineering" }'

# Relate an EXISTING category to a post (tenant required; no body)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Categories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unrelate a category from a post (tenant required)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Categories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

### Tags

#### List tags (tenant required)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Count tags (tenant required)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Get tag by ID (tenant required)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Create a tag (tenant required)

Body = `BlogPostTagCreateDto`: `id`, `timestamp`, `slug`, `type`, `title`, `description`,
`seoTitle`, `metaDescription`, `cornerstoneContent`, `allowSerachEngines`, `seoKeyPhrases`,
`canonicalUrl`, `imageURL`, `image`, `webPortalId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Tutorial", "slug": "tutorial", "type": "Tag" }'
```

#### Update a tag — full replace (tenant required)

Body = `BlogPostTagUpdateDto`: `slug`, `type`, `title`, `description`, `seoTitle`,
`metaDescription`, `cornerstoneContent`, `allowSerachEngines`, `seoKeyPhrases`, `canonicalUrl`,
`imageURL`, `image`, `webPortalId`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Tutorials", "slug": "tutorials" }'
```

#### Patch a tag — atomic partial update (tenant required)

JSON Patch array.

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/title", "value": "Tutorials" } ]'
```

#### Delete a tag (tenant required)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostTags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Per-post tags (relate / unrelate / list / create)

```bash
# List the tags of a post (no tenant param)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Tags" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a NEW tag attached to a post (tenant required; body = BlogPostTagCreateDto)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Tags?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Beginner", "slug": "beginner" }'

# Relate an EXISTING tag to a post (tenant required; no body)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Tags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unrelate a tag from a post (tenant required)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Tags/<tag-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

### Comments

#### List comments for a post (no tenant param)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Comments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Create a comment on a post (tenant required)

Body = `BlogPostCommentCreateDto`. Required field: `message`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Comments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Great article! Very helpful.",
    "ownerSocialProfileId": "<social-profile-guid>",
    "socialPostId": "<social-post-guid>",
    "parentCommentId": null
  }'
```

`BlogPostCommentCreateDto` fields: `id`, `timestamp`, `message` (**required**),
`ownerSocialProfileId`, `socialPostId`, `parentCommentId`.

#### List replies for a comment (no tenant param)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Comments/<comment-guid>/Replies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Reply to a comment (tenant required)

Body = `BlogPostCommentCreateDto` (same shape as create-comment; `message` required).

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Comments/<comment-guid>/Reply?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "message": "Thanks for the feedback!" }'
```

#### Delete a comment (tenant required)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Comments/<comment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

### Authors (read-only)

#### List blog authors (optional tenant)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Get author by ID (no tenant param)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors/<author-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### List posts by author (no tenant param)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors/<author-guid>/BlogPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

#### Count posts by author (no tenant param)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostAuthors/<author-guid>/BlogPosts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## PATCH (JSON Patch, RFC 6902)

Three blog resources support `PATCH` for atomic partial updates:

- `BlogPosts/{blogPostId}`
- `BlogPostCategories/{blogPostCategoryId}`
- `BlogPostTags/{blogPostTagId}`

All require `?tenantId=<tenant-guid>`, `Content-Type: application/json`, and a request body
that is a **JSON array of operations**. Each operation is `{ "op", "path", "value" }` (and
`"from"` for `move`/`copy`):

- `op` ∈ `add | remove | replace | move | copy | test`
- `path` / `from` are JSON Pointers: leading `/`, **camelCase** field names matching the
  update DTO (e.g. `/title`, `/published`, `/seoTitle`, `/allowSerachEngines`).

Prefer PATCH over PUT when you only need to change a couple of fields — it is safer under
concurrent edits and avoids resending the full object.

```bash
# Flip a post to draft, retitle it, and set a canonical URL — atomically
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/published", "value": false },
    { "op": "replace", "path": "/title", "value": "Getting Started (Draft)" },
    { "op": "replace", "path": "/canonicalUrl", "value": "https://example.com/blog/getting-started" }
  ]'
```

## End-to-End Workflow

```bash
# 0. Authenticate → export ABSUITE_ACCESS_TOKEN (see Authentication)

# 1. Find or create a category (tenant required)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPostCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Product Updates", "slug": "product-updates", "description": "Release notes and announcements" }'
# → note result.id as <category-guid>

# 2. Create the post (title required; Markdown body in code)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Announcing ABS v2",
    "description": "What is new in this release.",
    "code": "# Announcing ABS v2\n\nToday we are releasing...",
    "codeType": "Markdown",
    "published": false,
    "blogPostCategoryId": "<category-guid>",
    "slug": "announcing-abs-v2"
  }'
# → note result.id as <blog-post-guid>

# 3. Add a tag to the post (creates a new tag bound to the post)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>/Tags?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Release", "slug": "release" }'

# 4. Patch SEO fields and publish — atomically
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/seoTitle", "value": "Announcing ABS v2 | Alliance Business Suite" },
    { "op": "replace", "path": "/metaDescription", "value": "Read the ABS v2 release notes." },
    { "op": "replace", "path": "/allowSearchEngineIndexing", "value": true },
    { "op": "replace", "path": "/published", "value": true }
  ]'

# 5. Verify
curl -X GET "$ABSUITE_HOST_URL/api/v2/ContentService/BlogPosts/<blog-post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

`tenant` column: **req** = `?tenantId=` required · **opt** = optional (omit for public/global)
· **—** = no tenant param.

| Action | Method | Path | Tenant |
|---|---|---|---|
| List blog posts | GET | `/api/v2/ContentService/BlogPosts` | opt |
| Count blog posts | GET | `/api/v2/ContentService/BlogPosts/Count` | opt |
| Get blog post by ID | GET | `/api/v2/ContentService/BlogPosts/{blogPostId}` | — |
| Create blog post | POST | `/api/v2/ContentService/BlogPosts` | req |
| Update blog post | PUT | `/api/v2/ContentService/BlogPosts/{blogPostId}` | req |
| Patch blog post | PATCH | `/api/v2/ContentService/BlogPosts/{blogPostId}` | req |
| Delete blog post | DELETE | `/api/v2/ContentService/BlogPosts/{blogPostId}` | req |
| List post categories | GET | `/api/v2/ContentService/BlogPosts/{blogPostId}/Categories` | — |
| Create category on post | POST | `/api/v2/ContentService/BlogPosts/{blogPostId}/Categories` | req |
| Relate category to post | POST | `/api/v2/ContentService/BlogPosts/{blogPostId}/Categories/{categoryId}` | req |
| Unrelate category from post | DELETE | `/api/v2/ContentService/BlogPosts/{blogPostId}/Categories/{categoryId}` | req |
| List post comments | GET | `/api/v2/ContentService/BlogPosts/{blogPostId}/Comments` | — |
| Create comment on post | POST | `/api/v2/ContentService/BlogPosts/{blogPostId}/Comments` | req |
| Delete comment | DELETE | `/api/v2/ContentService/BlogPosts/{blogPostId}/Comments/{commentId}` | req |
| List comment replies | GET | `/api/v2/ContentService/BlogPosts/{blogPostId}/Comments/{commentId}/Replies` | — |
| Reply to comment | POST | `/api/v2/ContentService/BlogPosts/{blogPostId}/Comments/{commentId}/Reply` | req |
| List post tags | GET | `/api/v2/ContentService/BlogPosts/{blogPostId}/Tags` | — |
| Create tag on post | POST | `/api/v2/ContentService/BlogPosts/{blogPostId}/Tags` | req |
| Relate tag to post | POST | `/api/v2/ContentService/BlogPosts/{blogPostId}/Tags/{tagId}` | req |
| Unrelate tag from post | DELETE | `/api/v2/ContentService/BlogPosts/{blogPostId}/Tags/{tagId}` | req |
| List categories | GET | `/api/v2/ContentService/BlogPostCategories` | req |
| Count categories | GET | `/api/v2/ContentService/BlogPostCategories/Count` | req |
| Get category by ID | GET | `/api/v2/ContentService/BlogPostCategories/{blogPostCategoryId}` | req |
| Create category | POST | `/api/v2/ContentService/BlogPostCategories` | req |
| Update category | PUT | `/api/v2/ContentService/BlogPostCategories/{blogPostCategoryId}` | req |
| Patch category | PATCH | `/api/v2/ContentService/BlogPostCategories/{blogPostCategoryId}` | req |
| Delete category | DELETE | `/api/v2/ContentService/BlogPostCategories/{blogPostCategoryId}` | req |
| List tags | GET | `/api/v2/ContentService/BlogPostTags` | req |
| Count tags | GET | `/api/v2/ContentService/BlogPostTags/Count` | req |
| Get tag by ID | GET | `/api/v2/ContentService/BlogPostTags/{blogPostTagId}` | req |
| Create tag | POST | `/api/v2/ContentService/BlogPostTags` | req |
| Update tag | PUT | `/api/v2/ContentService/BlogPostTags/{blogPostTagId}` | req |
| Patch tag | PATCH | `/api/v2/ContentService/BlogPostTags/{blogPostTagId}` | req |
| Delete tag | DELETE | `/api/v2/ContentService/BlogPostTags/{blogPostTagId}` | req |
| List blog authors | GET | `/api/v2/ContentService/BlogPostAuthors` | opt |
| Get author by ID | GET | `/api/v2/ContentService/BlogPostAuthors/{authorId}` | — |
| List posts by author | GET | `/api/v2/ContentService/BlogPostAuthors/{authorId}/BlogPosts` | — |
| Count posts by author | GET | `/api/v2/ContentService/BlogPostAuthors/{authorId}/BlogPosts/Count` | — |

> All endpoints also accept the optional `api-version` (query) / `x-api-version` (header)
> parameters; omit them to use the default `v2` surface.

---

For the CLI equivalent of these operations, see `absuite-blog-cli`. For other Content Service
resources (portals, web pages, web content, themes, templates, components), see `absuite-content`.
For shared REST conventions, see `absuite-rest`.
