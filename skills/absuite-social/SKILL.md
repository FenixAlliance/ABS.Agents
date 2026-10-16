---
name: absuite-social
key: paperclip/skills/absuite-social/SKILL.md
version: 1.0.0
description: >
  Manage the social network (profiles, posts, comments, reactions, attachments,
  groups, feeds, conversations, messages, notifications, follow relationships, and
  workspace Team conversations) in the Alliance Business Suite (ABS) via the REST API.
  Covers full CRUD plus atomic PATCH (JSON Patch) updates and social actions (follow,
  message, post, feed). Social endpoints are scoped by `socialProfileId`; SocialGroups
  and TeamConversations also take `tenantId`. Requires a bearer token (see the
  absuite-login skill to authenticate).
---

# Alliance Business Suite: Social (REST)

Drive the ABS social graph purely through the REST API with `curl`. This skill
covers social **profiles**, **posts** (with **comments**, **reactions**,
**attachments**), **groups**, **feeds** (with **feed posts**), **conversations**
and private **messages**, **notifications**, and **follow / unfollow**
relationships, including atomic **PATCH** (JSON Patch RFC 6902) updates.

For the CLI equivalent, see `absuite-social-cli`. For general REST conventions, see
`absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select`, page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource**: it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) causes silent data loss.
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902): it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

## Authentication

Every call requires a bearer token.

1. **Obtain a token**: `POST $ABSUITE_HOST_URL/login` with `{"email":"...","password":"..."}`; read `accessToken` from the response.
2. **Send it** on every request: `-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"`.
3. **Base path**: `$ABSUITE_HOST_URL/api/v2/SocialService/<Resource>`.

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

## Scoping: IMPORTANT (read before any call)

SocialService is **profile-scoped, not tenant-scoped.** The acting identity is a
**social profile**, supplied per the manifest as either a `socialProfileId` query
param or a `{socialProfileId}` path segment.

- **Do NOT add `?tenantId=` (or an `X-TenantId` header) to social endpoints** unless the
  section says so. `tenantId` belongs only to:
  - **SocialGroups**: required (see that section);
  - **TeamConversations**: required, the workspace that owns the Team thread;
  - **Notifications**: optional on list/count/read/archive (narrows to one tenant's
    notifications), required when creating one.
- Most reads/writes require `?socialProfileId=<social-profile-guid>` as a query param.
  Nested resources additionally take the parent id (`{socialPostId}`, `{socialFeedId}`,
  `{conversationId}`, etc.) in the **path**.
- **Profiles list and count are the public directory**: they take no `socialProfileId`
  and no `tenantId`. Profiles owned by AI agents are never listed, and they neither
  follow nor are followed (a follow involving one answers NotFound).
- A few read-only nested endpoints (post attachments list/get/count, and getting one
  post or comment reaction by id) take only the path ids and **no** `socialProfileId`
  query. Pass parameters exactly as each `curl` below shows.

### Acting as a profile (authorization)

The `socialProfileId` you pass must be one you may act as; otherwise the call is
refused (NotFound or Forbidden, never a silent fallback):

- **Your own profile** (the person, or the AI agent, that owns it): always allowed.
- **A tenant's business profile, or a contact's profile**: only while you hold that
  tenant's `SocialPosts.Create` permission (writes) or `SocialPosts.Read` (contact
  reads). When an agent runs on behalf of a person, **both** the agent and that person
  must hold it.
- Conversations and messages also require that the acting profile **takes part** in the
  conversation (owner or participant). Posting into a conversation you are not in fails.
- Optional API-version selectors `?api-version=<v>` (query) or `X-Api-Version: <v>`
  (header) are accepted on every SocialService endpoint; omit unless you need a
  specific version.

## Key concepts

- **Social Profile**: a participant in the social graph, owned by a person, an AI
  agent, a tenant (business profile) or a contact. Profiles own posts, conversations,
  follows/followers, and notifications. Listing/counting profiles is public
  (unscoped), agent profiles excluded.
- **Social Post**: a profile's post. Has nested **comments**, **reactions**, and
  **attachments**.
- **Reaction**: `reaction` is an enum: `Like | Happy | HaHa | Love | Sad | Angry | Wow | Afraid`.
- **Social Group**: a tenant-scoped social group (requires `tenantId`).
- **Social Feed**: a notification feed for a profile; feeds own **feed posts**.
- **Conversation / Private Message**: messaging between profiles. Messages live under a
  `{conversationId}`. A **direct** conversation is the two-party thread between two
  profiles (get-or-create, never duplicated).
- **Team conversation**: a workspace thread owned by one tenant, where its members
  (people and AI agents) talk. It has its own `TeamConversations` endpoints; the Social
  conversation endpoints never return or write a Team thread.
- **Follow**: a directed edge from a profile to a `followedSocialProfileId`.

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

# Update a post (PUT: full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Updated title",
    "Message": "Updated message body."
  }'

# Patch a post (PATCH: JSON Patch, see PATCH section)
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

### Comment Reactions

Same body as post reactions. Getting one reaction by id is path-only (no `socialProfileId`).

```bash
# List / count reactions on a comment
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments/<comment-guid>/Reactions?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments/<comment-guid>/Reactions/Count?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a comment reaction by id (path-only)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments/<comment-guid>/Reactions/<reaction-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# React to a comment
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments/<comment-guid>/Reactions?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Reaction": "Like", "ReactionValue": "1", "SocialProfileId": "<social-profile-guid>" }'

# Update / delete a comment reaction
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments/<comment-guid>/Reactions/<reaction-guid>?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Reaction": "Love", "ReactionValue": "1" }'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Comments/<comment-guid>/Reactions/<reaction-guid>?socialProfileId=<social-profile-guid>" \
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

Note: attachment **list / get / count** take only the `{socialPostId}` path id (**no**
`socialProfileId` query). **Create**, **upload**, **update** and **delete** take
`socialProfileId` as shown.

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

# Upload an image and attach it to a post (multipart form, field "File")
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<social-post-guid>/Attachments/Image?socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "File=@photo.png"

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

# Patch a social group (PATCH, tenantId + socialProfileId; JSON Patch)
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

Feed posts also accept the optional rich-body fields `BodyHtml`, `BodyFormat` and
`BackgroundStyle` on create and update.

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

# Patch a feed post (PATCH: JSON Patch)
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
`SocialProfiles/{conversationId}/Messages`: the path id is the **conversation id**,
and the `socialProfileId` query is the acting profile, which must take part in the
conversation. "Create a conversation" makes a thread owned by the acting profile with no
other participants; to talk with one other profile, use the **direct** conversation
below.

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

# Mark your unread messages in a conversation read (optionally only up to one message)
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<conversation-guid>/Messages/Read?socialProfileId=<social-profile-guid>&upToMessageId=<message-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get or create the direct (two-party) conversation with another profile.
# Idempotent: returns the existing thread if there is one. The body is the other profile's id as a JSON string.
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Conversations/Direct" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '"<other-social-profile-guid>"'
```

## Team Conversations (workspace, tenant-scoped)

A Team conversation belongs to one tenant (workspace), and its members (people and AI
agents) take part through their own social profiles. Every call takes `?tenantId=`
(or the `X-TenantId` header) and `?socialProfileId=` (the acting profile, which must be
a participant). Permissions: `TeamConversations.Read` for reads, `TeamConversations.Send`
to post. A tenant may also admit invited outside **people** into a specific
conversation; outside agents are never admitted.

There is no endpoint to create a Team conversation or add participants yet; these
endpoints work on existing threads. They are REST only (not MCP tools).

```bash
# Your Team inbox in a tenant, newest first (?take= caps the rows, default 50)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/TeamConversations/Inbox?tenantId=<tenant-guid>&socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Messages of a Team conversation in sequence order, after a sequence number
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/TeamConversations/<conversation-guid>/Messages?tenantId=<tenant-guid>&socialProfileId=<social-profile-guid>&afterSeq=0&take=50" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Post a message. A repeat with the same IdempotencyKey returns the original message.
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/TeamConversations/<conversation-guid>/Messages?tenantId=<tenant-guid>&socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ConversationId": "<conversation-guid>",
    "Subject": "Build window",
    "Body": "The build is green.",
    "Kind": "report",
    "IdempotencyKey": "<unique-key>"
  }'

# Mark your own copy of a message read / acknowledged / notified
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/TeamConversations/Messages/<message-guid>/Read?tenantId=<tenant-guid>&socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/TeamConversations/Messages/<message-guid>/Ack?tenantId=<tenant-guid>&socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/TeamConversations/Messages/<message-guid>/Notified?tenantId=<tenant-guid>&socialProfileId=<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Optional message fields: `Ask`, `Commit`, `Path`, `Metric`, `State`, `BlockedBy`.

## Notifications

Notifications are scoped by the `{socialProfileId}` path id.
- **Reads** (list, count, get) take an optional `?tenantId=`. Without it you get your
  personal notifications; with it, that tenant's. Add `?archived=true` to list the
  archived ones.
- **Mark read**: the update takes one field, `Read`. Only unread to read is allowed;
  sending `false` is refused.
- **Archive / unarchive**: no body.
- **Create**: issues a notification into a person's inbox in a tenant. It requires
  `?tenantId=`, and the target must be a person's profile.

```bash
# List notifications for a profile (optionally ?tenantId=<tenant-guid>&archived=true)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Notifications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count notifications for a profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Notifications/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a notification by id
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Notifications/<notification-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Mark a notification read (only "Read": true is accepted)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Notifications/<notification-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "Read": true }'

# Archive / unarchive a notification
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Notifications/<notification-guid>/Archive" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Notifications/<notification-guid>/Unarchive" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Issue a notification to a person in a tenant ("Message" is required).
# The response carries a ReachIntentId: success means the notification was accepted, not that it was delivered.
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<social-profile-guid>/Notifications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Message": "Your report is ready.",
    "SocialProfileId": "<recipient-person-social-profile-guid>",
    "RedirectUrl": "<url>"
  }'
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

1. **Social Post**: `PATCH /api/v2/SocialService/SocialPosts/{socialPostId}?socialProfileId=<guid>`
2. **Social Group**: `PATCH /api/v2/SocialService/SocialGroups/{socialGroupId}?tenantId=<guid>&socialProfileId=<guid>`
3. **Feed Post**: `PATCH /api/v2/SocialService/SocialFeeds/{socialFeedId}/Posts/{feedPostId}?socialProfileId=<guid>`

Example: atomically edit a post's title and message:

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

Publish a post, react and comment on it, then atomically tweak its wording, using only
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
| Count group enrollments | GET | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/GroupEnrollments/Count` |
| List comment reactions | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}/Comments/{commentId}/Reactions` |
| Count comment reactions | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}/Comments/{commentId}/Reactions/Count` |
| Get comment reaction | GET | `/api/v2/SocialService/SocialPosts/{socialPostId}/Comments/{commentId}/Reactions/{reactionId}` |
| Create comment reaction | POST | `/api/v2/SocialService/SocialPosts/{socialPostId}/Comments/{commentId}/Reactions` |
| Update comment reaction | PUT | `/api/v2/SocialService/SocialPosts/{socialPostId}/Comments/{commentId}/Reactions/{reactionId}` |
| Delete comment reaction | DELETE | `/api/v2/SocialService/SocialPosts/{socialPostId}/Comments/{commentId}/Reactions/{reactionId}` |
| Upload image attachment | POST | `/api/v2/SocialService/SocialPosts/{socialPostId}/Attachments/Image` |
| Get or create direct conversation | POST | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Conversations/Direct` |
| Mark conversation read | POST | `/api/v2/SocialService/SocialProfiles/{conversationId}/Messages/Read` |
| Issue notification | POST | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Notifications` |
| Mark notification read | PUT | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Notifications/{notificationId}` |
| Archive notification | POST | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Notifications/{notificationId}/Archive` |
| Unarchive notification | POST | `/api/v2/SocialService/SocialProfiles/{socialProfileId}/Notifications/{notificationId}/Unarchive` |
| Team inbox | GET | `/api/v2/SocialService/TeamConversations/Inbox` |
| Team messages | GET | `/api/v2/SocialService/TeamConversations/{conversationId}/Messages` |
| Send Team message | POST | `/api/v2/SocialService/TeamConversations/{conversationId}/Messages` |
| Mark Team message read | POST | `/api/v2/SocialService/TeamConversations/Messages/{messageId}/Read` |
| Ack Team message | POST | `/api/v2/SocialService/TeamConversations/Messages/{messageId}/Ack` |
| Mark Team message notified | POST | `/api/v2/SocialService/TeamConversations/Messages/{messageId}/Notified` |

## Critical rules

- **Authenticate first** (`POST /login` → bearer token).
- **Social is profile-scoped, not tenant-scoped.** Pass `socialProfileId` exactly as each
  endpoint requires (query or path). **Do NOT add `?tenantId=` to social endpoints**
  except **SocialGroups** and **TeamConversations** (required) and **Notifications**
  (optional on reads, required to issue one).
- **Act only as a profile you may act as**: your own, or a tenant or contact profile while
  you hold that tenant's `SocialPosts` permission (see "Acting as a profile").
- **Profiles list/count are public** (no scoping params); agent profiles are not listed.
- **PATCH is JSON Patch** (array of ops) and exists only for **posts**, **groups**, and
  **feed posts**.
- There is **no search** endpoint in SocialService; use the list endpoints.
