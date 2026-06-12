---
name: absuite-social
description: >
  Manage the social network (profiles, posts, comments, reactions, attachments,
  groups, feeds, conversations, messages, notifications, and follow relationships)
  in the Alliance Business Suite (ABS) via the REST API. Covers full CRUD plus
  atomic PATCH (JSON Patch) updates and social actions (follow, message, post,
  feed). Social endpoints are scoped by `socialProfileId`, not by tenant. Requires a
  bearer token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Social (REST)

Drive the ABS social graph purely through the REST API with `curl`. This skill
covers social **profiles**, **posts** (with **comments**, **reactions**,
**attachments**), **groups**, **feeds** (with **feed posts**), **conversations**
and private **messages**, **notifications**, and **follow / unfollow**
relationships — including atomic **PATCH** (JSON Patch RFC 6902) updates.

For the CLI equivalent, see `absuite-social-cli`. For general REST conventions, see
`absuite-rest`.

## Authentication

Every call requires a bearer token.

1. **Obtain a token** — `POST $ABSUITE_HOST_URL/login` with `{"email":"...","password":"..."}`; read `accessToken` from the response.
2. **Send it** on every request: `-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"`.
3. **Base path** — `$ABSUITE_HOST_URL/api/v2/SocialService/<Resource>`.

```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"<your-email>","password":"<your-password>"}'
# -> { "accessToken": "...", ... }   export it as ABSUITE_ACCESS_TOKEN
```

## Response envelope

All responses share one envelope; always check `isSuccess` and read the payload from `result`:

```json
{ "isSuccess": true, "errorMessage": null, "correlationId": "...", "timestamp": "...", "result": <data|array|int|null> }
```

## Scoping — IMPORTANT (read before any call)

SocialService is **profile-scoped, not tenant-scoped.** The acting identity is a
**social profile**, supplied per the manifest as either a `socialProfileId` query
param or a `{socialProfileId}` path segment.

- **Do NOT add `?tenantId=` (or an `X-TenantId` header) to social endpoints** — it is
  not part of the surface and is ignored. The one exception is **SocialGroups**, where
  the manifest explicitly requires `tenantId` (see that section).
- Most reads/writes require `?socialProfileId=<social-profile-guid>` as a query param.
  Nested resources additionally take the parent id (`{socialPostId}`, `{socialFeedId}`,
  `{conversationId}`, etc.) in the **path**.
- **Profiles list and count are intentionally unscoped** (public social graph) — they
  take no `socialProfileId` and no `tenantId`.
- A few read-only nested endpoints (post attachments list/get/count, some reaction
  reads) take only the path id and **no** `socialProfileId` query — pass parameters
  exactly as each `curl` below shows.
- Optional API-version selectors `?api-version=<v>` (query) or `X-Api-Version: <v>`
  (header) are accepted on every SocialService endpoint; omit unless you need a
  specific version.

## Key concepts

- **Social Profile** — a participant in the social graph. Profiles own posts,
  conversations, follows/followers, and notifications. Listing/counting profiles is
  public (unscoped).
- **Social Post** — a profile's post. Has nested **comments**, **reactions**, and
  **attachments**.
- **Reaction** — `reaction` is an enum: `Like | Happy | HaHa | Love | Sad | Angry | Wow | Afraid`.
- **Social Group** — a tenant-scoped social group (the only social resource that
  requires `tenantId`).
- **Social Feed** — a notification feed for a profile; feeds own **feed posts**.
- **Conversation / Private Message** — direct messaging between profiles. Messages live
  under a `{conversationId}`.
- **Follow** — a directed edge from a profile to a `followedSocialProfileId`.

---

## Social Profiles

```bash
# List social profiles (unscoped / public)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count social profiles (unscoped / public)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a social profile by id
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Social Posts

```bash
# List posts for a profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count posts for a profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/Count?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a post by id
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a post
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Exciting product launch!",
    "Message": "We are thrilled to announce our new product line.",
    "SocialFeedId": "<social-feed-guid>",
    "SocialProfileId": "<social-profile-guid>"
  }'

# Update a post (PUT — full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Updated title",
    "Message": "Updated message body."
  }'

# Patch a post (PATCH — JSON Patch, see PATCH section)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/message", "value": "Edited via PATCH" }]'

# Delete a post
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Post Comments

```bash
# List comments on a post
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count comments on a post
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments/Count?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a comment by id
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments/<comment-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a comment ("Message" is required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Message": "Great news! Looking forward to it.",
    "ParentCommentId": "<parent-comment-guid>",
    "SocialProfileId": "<social-profile-guid>",
    "SocialPostId": "<social-post-guid>"
  }'

# Update a comment (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments/<comment-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Message": "Edited comment text.",
    "SocialPostId": "<social-post-guid>"
  }'

# Delete a comment
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments/<comment-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Post Reactions

`reaction` ∈ `Like | Happy | HaHa | Love | Sad | Angry | Wow | Afraid`.

```bash
# List reactions on a post
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Reactions?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count reactions on a post
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Reactions/Count?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a reaction by id (path-only; no socialProfileId query)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Reactions/<reaction-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a reaction
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Reactions?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Reaction": "Like",
    "ReactionValue": "1",
    "SocialProfileId": "<social-profile-guid>"
  }'

# Update a reaction (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Reactions/<reaction-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Reaction": "Love",
    "ReactionValue": "1"
  }'

# Delete a reaction
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Reactions/<reaction-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Post Attachments

Note: attachment **list / get / count** take only the `{socialPostId}` path id — **no**
`socialProfileId` query. **Create** and **delete** take `socialProfileId` as shown.

```bash
# List attachments on a post (path-only)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Attachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count attachments on a post (path-only)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Attachments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get an attachment by id (path-only)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Attachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create an attachment (takes socialProfileId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Attachments?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Spec sheet",
    "Notes": "Technical specifications",
    "Author": "<author>",
    "IsFolder": false,
    "FileName": "spec.pdf",
    "Abstract": "Product spec",
    "KeyWords": "spec,pdf",
    "ValidResponse": true,
    "ParentFileUploadId": "<parent-file-upload-guid>",
    "FilePath": "<file-path>",
    "SocialPostId": "<social-post-guid>"
  }'

# Update an attachment (PUT, takes socialProfileId)
# NOTE: update body uses "Metadata" and "ParentFileUploadID" (create uses "ParentFileUploadId")
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Attachments/<attachment-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Spec sheet (rev 2)",
    "Notes": "Updated specs",
    "Metadata": "<metadata>",
    "Author": "<author>",
    "IsFolder": false,
    "FileName": "spec-v2.pdf",
    "Abstract": "Product spec rev 2",
    "KeyWords": "spec,pdf",
    "ValidResponse": true,
    "ParentFileUploadID": "<parent-file-upload-guid>",
    "FilePath": "<file-path>"
  }'

# Delete an attachment (takes socialProfileId)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Attachments/<attachment-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Social Groups (tenant-scoped)

**Exception to the profile-scoping rule:** SocialGroups require `tenantId`. List/get/count
take `?tenantId=`. Create/update/patch/delete take **both** `?tenantId=` and
`?socialProfileId=`.

```bash
# List social groups (tenant-scoped)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count social groups (tenant-scoped)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a social group by id (tenant-scoped)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups/<social-group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a social group (tenantId + socialProfileId)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups?tenantId=<tenant-guid>&socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "engineering-team",
    "Title": "Engineering Team",
    "AvatarURL": "<avatar-url>",
    "SocialProfileId": "<social-profile-guid>"
  }'

# Update a social group (PUT, tenantId + socialProfileId)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups/<social-group-guid>?tenantId=<tenant-guid>&socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "engineering-team",
    "Title": "Engineering Team (renamed)",
    "AvatarURL": "<avatar-url>"
  }'

# Patch a social group (PATCH, tenantId + socialProfileId — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups/<social-group-guid>?tenantId=<tenant-guid>&socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/title", "value": "Engineering Team (renamed)" }]'

# Delete a social group (tenantId + socialProfileId)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups/<social-group-guid>?tenantId=<tenant-guid>&socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Social Feeds

Feeds are read-only at the feed level; you create/patch/delete **feed posts** under a
feed. All feed endpoints take `?socialProfileId=` (no tenantId).

```bash
# List social feeds for a profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count social feeds for a profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/Count?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a social feed by id
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<social-feed-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Feed Posts

```bash
# List posts in a feed
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<social-feed-guid>/Posts?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count posts in a feed
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<social-feed-guid>/Posts/Count?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a feed post by id
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<social-feed-guid>/Posts/<feed-post-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a feed post
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<social-feed-guid>/Posts?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Status Update",
    "Message": "Working on something exciting!",
    "SocialFeedId": "<social-feed-guid>",
    "SocialProfileId": "<social-profile-guid>"
  }'

# Update a feed post (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<social-feed-guid>/Posts/<feed-post-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Status Update (edited)",
    "Message": "Shipped it!"
  }'

# Patch a feed post (PATCH — JSON Patch)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<social-feed-guid>/Posts/<feed-post-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/title", "value": "Status Update (edited)" }]'

# Delete a feed post
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<social-feed-guid>/Posts/<feed-post-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Conversations & Private Messages

Conversations live under a profile; messages live under a `{conversationId}`. All take
`?socialProfileId=` (no tenantId). Note the messages path segment is
`SocialProfiles/{conversationId}/Messages` — the path id is the **conversation id**,
and the `socialProfileId` query is the acting profile.

```bash
# List conversations for a profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Conversations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count conversations for a profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Conversations/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a conversation
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Conversations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Subject": "Project kickoff",
    "SocialProfileId": "<social-profile-guid>"
  }'

# List messages in a conversation
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<conversation-guid>/Messages?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count messages in a conversation
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<conversation-guid>/Messages/Count?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a message
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<conversation-guid>/Messages?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Re: Project kickoff",
    "Message": "Hello! How are you?",
    "ConversationId": "<conversation-guid>",
    "SenderSocialProfileId": "<sender-social-profile-guid>",
    "ReceiverSocialProfileId": "<receiver-social-profile-guid>"
  }'

# Update a message (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<conversation-guid>/Messages/<message-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Re: Project kickoff (edited)",
    "Message": "Hello again!"
  }'

# Delete a message
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<conversation-guid>/Messages/<message-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Notifications

Notifications are read-only, scoped by the `{socialProfileId}` path id (no tenantId).

```bash
# List notifications for a profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Notifications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count notifications for a profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Notifications/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a notification by id
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Notifications/<notification-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Follow / Unfollow

Both the acting profile (`{socialProfileId}`) and target
(`{followedSocialProfileId}`) are **path** ids. No tenantId, no request body on
follow/unfollow.

```bash
# Follow a profile
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Follows/<followed-social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Check whether a follow exists
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Follows/<followed-social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unfollow a profile
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Follows/<followed-social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List the profiles this profile follows (follow edges)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Follows" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count follows
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Follows/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List followed profiles (resolved profile objects)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Follows/Profiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count followed profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Follows/Profiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List followers (follower edges)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Followers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count followers
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Followers/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List follower profiles (resolved profile objects)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Followers/Profiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count follower profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Followers/Profiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## PATCH (JSON Patch RFC 6902)

PATCH bodies are a JSON **array** of operations with `Content-Type: application/json`.
`op` ∈ `add | remove | replace | move | copy | test`; `path`/`from` are JSON-Pointer
(leading `/`, camelCase field name). Use PATCH for atomic partial updates without
resending the whole object.

**Three SocialService resources support PATCH:**

1. **Social Post** — `PATCH /api/v2/SocialService/SocialPosts/{socialPostId}?socialProfileId=<guid>`
2. **Social Group** — `PATCH /api/v2/SocialService/SocialGroups/{socialGroupId}?tenantId=<guid>&socialProfileId=<guid>`
3. **Feed Post** — `PATCH /api/v2/SocialService/SocialFeeds/{socialFeedId}/Posts/{feedPostId}?socialProfileId=<guid>`

Example — atomically edit a post's title and message:

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/title", "value": "Revised headline" },
    { "op": "replace", "path": "/message", "value": "Revised body copy." }
  ]'
```

Posts/feed-post patchable fields: `/title`, `/message`. Group patchable fields:
`/name`, `/title`, `/avatarURL`.

---

## End-to-end workflow

Publish a post, react and comment on it, then atomically tweak its wording — using only
verified endpoints.

```bash
# 0) Authenticate (once) and export ABSUITE_ACCESS_TOKEN
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"<your-email>","password":"<your-password>"}'

# 1) Find a profile to act as (unscoped list)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 2) Create a post as that profile
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Title": "Launch day", "Message": "It is live!", "SocialProfileId": "<social-profile-guid>" }'
#   -> result.id = <social-post-guid>

# 3) React to it
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Reactions?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Reaction": "Love", "SocialProfileId": "<social-profile-guid>" }'

# 4) Comment on it
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Message": "Congrats team!", "SocialProfileId": "<social-profile-guid>", "SocialPostId": "<social-post-guid>" }'

# 5) Atomically fix a typo in the post
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/message", "value": "It is live! 🎉" }]'
```

---

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| List profiles | GET | `/api/v2/SocialService/SocialProfiles` |
| Count profiles | GET | `/api/v2/SocialService/SocialProfiles/Count` |
| Get profile | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}` |
| List posts | GET | `/api/v2/SocialService/SocialPosts` |
| Count posts | GET | `/api/v2/SocialService/SocialPosts/Count` |
| Get post | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}` |
| Create post | POST | `/api/v2/SocialService/SocialPosts` |
| Update post | PUT | `/api/v2/SocialService/SocialPosts/{socialPostId}` |
| **Patch post** | **PATCH** | `/api/v2/SocialService/SocialPosts/{socialPostId}` |
| Delete post | DELETE | `/api/v2/SocialService/SocialPosts/{socialPostId}` |
| List comments | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}/Comments` |
| Count comments | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}/Comments/Count` |
| Get comment | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}/Comments/{commentId}` |
| Create comment | POST | `/api/v2/SocialService/SocialPosts/{socialPostId}/Comments` |
| Update comment | PUT | `/api/v2/SocialService/SocialPosts/{socialPostId}/Comments/{commentId}` |
| Delete comment | DELETE | `/api/v2/SocialService/SocialPosts/{socialPostId}/Comments/{commentId}` |
| List reactions | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}/Reactions` |
| Count reactions | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}/Reactions/Count` |
| Get reaction | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}/Reactions/{reactionId}` |
| Create reaction | POST | `/api/v2/SocialService/SocialPosts/{socialPostId}/Reactions` |
| Update reaction | PUT | `/api/v2/SocialService/SocialPosts/{socialPostId}/Reactions/{reactionId}` |
| Delete reaction | DELETE | `/api/v2/SocialService/SocialPosts/{socialPostId}/Reactions/{reactionId}` |
| List attachments | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}/Attachments` |
| Count attachments | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}/Attachments/Count` |
| Get attachment | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}/Attachments/{attachmentId}` |
| Create attachment | POST | `/api/v2/SocialService/SocialPosts/{socialPostId}/Attachments` |
| Update attachment | PUT | `/api/v2/SocialService/SocialPosts/{socialPostId}/Attachments/{attachmentId}` |
| Delete attachment | DELETE | `/api/v2/SocialService/SocialPosts/{socialPostId}/Attachments/{attachmentId}` |
| List groups | GET | `/api/v2/SocialService/SocialGroups` |
| Count groups | GET | `/api/v2/SocialService/SocialGroups/Count` |
| Get group | GET | `/api/v2/SocialService/SocialGroups/{socialGroupId}` |
| Create group | POST | `/api/v2/SocialService/SocialGroups` |
| Update group | PUT | `/api/v2/SocialService/SocialGroups/{socialGroupId}` |
| **Patch group** | **PATCH** | `/api/v2/SocialService/SocialGroups/{socialGroupId}` |
| Delete group | DELETE | `/api/v2/SocialService/SocialGroups/{socialGroupId}` |
| List feeds | GET | `/api/v2/SocialService/SocialFeeds` |
| Count feeds | GET | `/api/v2/SocialService/SocialFeeds/Count` |
| Get feed | GET | `/api/v2/SocialService/SocialFeeds/{socialFeedId}` |
| List feed posts | GET | `/api/v2/SocialService/SocialFeeds/{socialFeedId}/Posts` |
| Count feed posts | GET | `/api/v2/SocialService/SocialFeeds/{socialFeedId}/Posts/Count` |
| Get feed post | GET | `/api/v2/SocialService/SocialFeeds/{socialFeedId}/Posts/{feedPostId}` |
| Create feed post | POST | `/api/v2/SocialService/SocialFeeds/{socialFeedId}/Posts` |
| Update feed post | PUT | `/api/v2/SocialService/SocialFeeds/{socialFeedId}/Posts/{feedPostId}` |
| **Patch feed post** | **PATCH** | `/api/v2/SocialService/SocialFeeds/{socialFeedId}/Posts/{feedPostId}` |
| Delete feed post | DELETE | `/api/v2/SocialService/SocialFeeds/{socialFeedId}/Posts/{feedPostId}` |
| List conversations | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Conversations` |
| Count conversations | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Conversations/Count` |
| Create conversation | POST | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Conversations` |
| List messages | GET | `/api/v2/SocialService/SocialProfiles/{conversationId}/Messages` |
| Count messages | GET | `/api/v2/SocialService/SocialProfiles/{conversationId}/Messages/Count` |
| Create message | POST | `/api/v2/SocialService/SocialProfiles/{conversationId}/Messages` |
| Update message | PUT | `/api/v2/SocialService/SocialProfiles/{conversationId}/Messages/{messageId}` |
| Delete message | DELETE | `/api/v2/SocialService/SocialProfiles/{conversationId}/Messages/{messageId}` |
| List notifications | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Notifications` |
| Count notifications | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Notifications/Count` |
| Get notification | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Notifications/{notificationId}` |
| Follow | POST | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Follows/{followedSocialProfileId}` |
| Follow exists | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Follows/{followedSocialProfileId}` |
| Unfollow | DELETE | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Follows/{followedSocialProfileId}` |
| List follows | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Follows` |
| Count follows | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Follows/Count` |
| List followed profiles | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Follows/Profiles` |
| Count followed profiles | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Follows/Profiles/Count` |
| List followers | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Followers` |
| Count followers | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Followers/Count` |
| List follower profiles | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Followers/Profiles` |
| Count follower profiles | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Followers/Profiles/Count` |

## Critical rules

- **Authenticate first** (`POST /login` → bearer token).
- **Social is profile-scoped, not tenant-scoped.** Pass `socialProfileId` exactly as each
  endpoint requires (query or path). **Do NOT add `?tenantId=` to social endpoints** —
  the sole exception is **SocialGroups**, which requires `tenantId`.
- **Profiles list/count are public** (no scoping params).
- **PATCH is JSON Patch** (array of ops) and exists only for **posts**, **groups**, and
  **feed posts**.
- There is **no search** endpoint in SocialService — use the list endpoints.
