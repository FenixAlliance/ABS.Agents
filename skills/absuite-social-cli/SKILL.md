---
name: absuite-social-cli
description: >
  Manage the social network (profiles, posts, comments, reactions, attachments,
  groups, feeds, conversations, messages, notifications, and follow relationships)
  in the Alliance Business Suite (ABS) using the `absuite` CLI. Covers list/count/get/
  create/update/delete plus social actions (follow, unfollow, message, post). Social
  commands are scoped by `--SocialProfileId`, not by tenant. Requires an authenticated
  CLI session (see absuite-login-cli). For atomic PATCH updates or raw HTTP, use the
  absuite-social (REST) skill.
---

# Alliance Business Suite — Social (CLI)

Drive the ABS social graph through the `absuite` CLI's `social` service: social
**profiles**, **posts** (with **comments**, **reactions**, **attachments**),
**groups**, **feeds** (with **feed posts**), **conversations** and private
**messages**, **notifications**, and **follow / unfollow** relationships.

This skill is CLI-only. For atomic partial updates (JSON Patch / PATCH) or raw HTTP,
use the `absuite-social` (REST) skill. For general CLI usage, see `absuite-cli`.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-social` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-social` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). Every social
   command needs an authenticated session.
2. **Discover commands** — `absuite social list-commands`, then `absuite social <command> --help`
   for the exact parameters of any command.
3. **Scoping** — SocialService is **profile-scoped, not tenant-scoped.** Pass
   `--SocialProfileId <social-profile-guid>` on commands that require it. **Do NOT pass
   `--TenantId` to social commands** — the sole exception is **Social Groups**, which
   require `--TenantId` (see that section). If you set a default tenant via
   `absuite config set --tenant-id <guid>`, it is ignored by profile-scoped social
   commands.

## Command structure

```
absuite social <verb> <entity> --Param value
```

Verbs map to list / count / get / create / update / delete plus social actions. The
canonical PowerShell function-name form also works, e.g.
`absuite social Get-SocialPostsAsync --SocialProfileId <guid>`. JSON DTO parameters are
passed as a single-quoted JSON string (`--<Dto> '{...}'`) using the **same field names**
shown below. There is **no PATCH** and **no search** verb in this service.

> The command/entity names below are derived from the PowerShell SDK functions in
> `FenixAlliance.ABP.SDK.PowerShell/clients/socialService/`. If a friendly alias is not
> recognized, fall back to the function-name form shown in parentheses, and confirm
> parameter names with `--help`.

---

## Social Profiles

Listing/counting profiles is **public** (no scoping params).

```bash
# List profiles            (Get-SocialProfilesAsync)
absuite social list profiles

# Count profiles           (Invoke-CountSocialProfilesAsync)
absuite social count profiles

# Get a profile            (Get-SocialProfileAsync)
absuite social get profile --SocialProfileId <social-profile-guid>
```

## Social Posts

```bash
# List posts               (Get-SocialPostsAsync)
absuite social list posts --SocialProfileId <social-profile-guid>

# Count posts              (Get-SocialPostsCountAsync)
absuite social count posts --SocialProfileId <social-profile-guid>

# Get a post               (Get-SocialPostAsync)
absuite social get post --SocialPostId <social-post-guid> --SocialProfileId <social-profile-guid>

# Create a post            (New-SocialPostAsync)
absuite social create post --SocialProfileId <social-profile-guid> --SocialPostCreateDto '{
  "title": "Exciting product launch!",
  "message": "We are thrilled to announce our new product line.",
  "socialFeedId": "<social-feed-guid>",
  "socialProfileId": "<social-profile-guid>"
}'

# Update a post            (Update-SocialPostAsync)
absuite social update post --SocialPostId <social-post-guid> --SocialProfileId <social-profile-guid> --SocialPostUpdateDto '{
  "title": "Updated title",
  "message": "Updated message body."
}'

# Delete a post            (Invoke-DeleteSocialPostAsync)
absuite social delete post --SocialPostId <social-post-guid> --SocialProfileId <social-profile-guid>
```

> Atomic partial post edits (PATCH) are REST-only — see `absuite-social`.

### Post Comments

`Message` is required when creating a comment.

```bash
# List comments            (Get-SocialPostCommentsAsync)
absuite social list post-comments --SocialPostId <social-post-guid> --SocialProfileId <social-profile-guid>

# Count comments           (Get-SocialPostCommentsCountAsync)
absuite social count post-comments --SocialPostId <social-post-guid> --SocialProfileId <social-profile-guid>

# Get a comment            (Get-SocialPostCommentAsync)
absuite social get post-comment --SocialPostId <social-post-guid> --CommentId <comment-guid> --SocialProfileId <social-profile-guid>

# Create a comment         (New-SocialPostCommentAsync)
absuite social create post-comment --SocialPostId <social-post-guid> --SocialProfileId <social-profile-guid> --SocialPostCommentCreateDto '{
  "message": "Great news! Looking forward to it.",
  "parentCommentId": "<parent-comment-guid>",
  "socialProfileId": "<social-profile-guid>",
  "socialPostId": "<social-post-guid>"
}'

# Update a comment         (Update-SocialPostCommentAsync)
absuite social update post-comment --SocialPostId <social-post-guid> --CommentId <comment-guid> --SocialProfileId <social-profile-guid> --SocialPostCommentUpdateDto '{
  "message": "Edited comment text.",
  "socialPostId": "<social-post-guid>"
}'

# Delete a comment         (Invoke-DeleteSocialPostCommentAsync)
absuite social delete post-comment --SocialPostId <social-post-guid> --CommentId <comment-guid> --SocialProfileId <social-profile-guid>
```

### Post Reactions

`reaction` ∈ `Like | Happy | HaHa | Love | Sad | Angry | Wow | Afraid`.

```bash
# List reactions           (Get-SocialPostReactionsAsync)
absuite social list post-reactions --SocialPostId <social-post-guid> --SocialProfileId <social-profile-guid>

# Count reactions          (Get-SocialPostReactionsCountAsync)
absuite social count post-reactions --SocialPostId <social-post-guid> --SocialProfileId <social-profile-guid>

# Get a reaction           (Get-SocialPostReactionAsync)
absuite social get post-reaction --SocialPostId <social-post-guid> --ReactionId <reaction-guid>

# Create a reaction        (New-SocialPostReactionAsync)
absuite social create post-reaction --SocialPostId <social-post-guid> --SocialProfileId <social-profile-guid> --SocialReactionCreateDto '{
  "reaction": "Like",
  "reactionValue": "1",
  "socialProfileId": "<social-profile-guid>"
}'

# Update a reaction        (Update-SocialPostReactionAsync)
absuite social update post-reaction --SocialPostId <social-post-guid> --ReactionId <reaction-guid> --SocialProfileId <social-profile-guid> --SocialReactionUpdateDto '{
  "reaction": "Love",
  "reactionValue": "1"
}'

# Delete a reaction        (Invoke-DeleteSocialPostReactionAsync)
absuite social delete post-reaction --SocialPostId <social-post-guid> --ReactionId <reaction-guid> --SocialProfileId <social-profile-guid>
```

### Post Attachments

Attachment **list / get / count** take only `--SocialPostId`. **Create** and **delete**
also take `--SocialProfileId`.

```bash
# List attachments         (Get-SocialPostAttachmentsAsync)
absuite social list post-attachments --SocialPostId <social-post-guid>

# Count attachments        (Get-SocialPostAttachmentsCountAsync)
absuite social count post-attachments --SocialPostId <social-post-guid>

# Get an attachment        (Get-SocialPostAttachmentAsync)
absuite social get post-attachment --SocialPostId <social-post-guid> --AttachmentId <attachment-guid>

# Create an attachment     (New-SocialPostAttachmentAsync)
absuite social create post-attachment --SocialPostId <social-post-guid> --SocialProfileId <social-profile-guid> --SocialPostAttachmentCreateDto '{
  "title": "Spec sheet",
  "notes": "Technical specifications",
  "author": "<author>",
  "isFolder": false,
  "fileName": "spec.pdf",
  "abstract": "Product spec",
  "keyWords": "spec,pdf",
  "validResponse": true,
  "parentFileUploadId": "<parent-file-upload-guid>",
  "filePath": "<file-path>",
  "socialPostId": "<social-post-guid>"
}'

# Update an attachment     (Update-SocialPostAttachmentAsync)
# NOTE: update DTO uses "metadata" and "parentFileUploadID" (create uses "parentFileUploadId")
absuite social update post-attachment --SocialPostId <social-post-guid> --AttachmentId <attachment-guid> --SocialProfileId <social-profile-guid> --SocialPostAttachmentUpdateDto '{
  "title": "Spec sheet (rev 2)",
  "notes": "Updated specs",
  "metadata": "<metadata>",
  "author": "<author>",
  "isFolder": false,
  "fileName": "spec-v2.pdf",
  "abstract": "Product spec rev 2",
  "keyWords": "spec,pdf",
  "validResponse": true,
  "parentFileUploadID": "<parent-file-upload-guid>",
  "filePath": "<file-path>"
}'

# Delete an attachment     (Invoke-DeleteSocialPostAttachmentAsync)
absuite social delete post-attachment --SocialPostId <social-post-guid> --AttachmentId <attachment-guid> --SocialProfileId <social-profile-guid>
```

## Social Groups (tenant-scoped — the exception)

**Social Groups require `--TenantId`.** List/get/count take `--TenantId`. Create/update/
delete take **both** `--TenantId` and `--SocialProfileId`.

```bash
# List groups              (Get-SocialGroupsAsync)
absuite social list groups --TenantId <tenant-guid>

# Count groups             (Invoke-CountSocialGroupsAsync)
absuite social count groups --TenantId <tenant-guid>

# Get a group              (Get-SocialGroupByIdAsync)
absuite social get group-by-id --SocialGroupId <social-group-guid> --TenantId <tenant-guid>

# Create a group           (New-SocialGroupAsync)
absuite social create group --TenantId <tenant-guid> --SocialProfileId <social-profile-guid> --SocialGroupCreateDto '{
  "name": "engineering-team",
  "title": "Engineering Team",
  "avatarURL": "<avatar-url>",
  "socialProfileId": "<social-profile-guid>"
}'

# Update a group           (Update-SocialGroupAsync)
absuite social update group --SocialGroupId <social-group-guid> --TenantId <tenant-guid> --SocialProfileId <social-profile-guid> --SocialGroupUpdateDto '{
  "name": "engineering-team",
  "title": "Engineering Team (renamed)",
  "avatarURL": "<avatar-url>"
}'

# Delete a group           (Invoke-DeleteSocialGroupAsync)
absuite social delete group --SocialGroupId <social-group-guid> --TenantId <tenant-guid> --SocialProfileId <social-profile-guid>
```

> Atomic partial group edits (PATCH) are REST-only — see `absuite-social`.

## Social Feeds

Feeds are read-only at the feed level; create/update/delete **feed posts** under a feed.
All feed commands take `--SocialProfileId` (no tenantId).

```bash
# List feeds               (Get-FeedNotifications)
absuite social list feeds --SocialProfileId <social-profile-guid>

# Count feeds              (Get-NotificationsCountAsync)
absuite social count feeds --SocialProfileId <social-profile-guid>

# Get a feed               (Get-NotificationAsync)
absuite social get feed --SocialFeedId <social-feed-guid> --SocialProfileId <social-profile-guid>
```

### Feed Posts

```bash
# List feed posts          (Get-FeedPostsAsync)
absuite social list feed-posts --SocialFeedId <social-feed-guid> --SocialProfileId <social-profile-guid>

# Count feed posts         (Get-FeedPostsCountAsync)
absuite social count feed-posts --SocialFeedId <social-feed-guid> --SocialProfileId <social-profile-guid>

# Get a feed post          (Get-FeedPostAsync)
absuite social get feed-post --SocialFeedId <social-feed-guid> --FeedPostId <feed-post-guid> --SocialProfileId <social-profile-guid>

# Create a feed post       (New-FeedPostAsync)
absuite social create feed-post --SocialFeedId <social-feed-guid> --SocialProfileId <social-profile-guid> --SocialFeedPostCreateDto '{
  "title": "Status Update",
  "message": "Working on something exciting!",
  "socialFeedId": "<social-feed-guid>",
  "socialProfileId": "<social-profile-guid>"
}'

# Update a feed post       (Update-FeedPostAsync)
absuite social update feed-post --SocialFeedId <social-feed-guid> --FeedPostId <feed-post-guid> --SocialProfileId <social-profile-guid> --SocialFeedPostUpdateDto '{
  "title": "Status Update (edited)",
  "message": "Shipped it!"
}'

# Delete a feed post       (Invoke-DeleteFeedPostAsync)
absuite social delete feed-post --SocialFeedId <social-feed-guid> --FeedPostId <feed-post-guid> --SocialProfileId <social-profile-guid>
```

> Atomic partial feed-post edits (PATCH) are REST-only — see `absuite-social`.

## Conversations & Private Messages

Conversations live under a profile; messages live under a `--ConversationId`. All take
`--SocialProfileId` (no tenantId).

```bash
# List conversations       (Get-ConversationsAsync)
absuite social list conversations --SocialProfileId <social-profile-guid>

# Count conversations      (Invoke-CountConversationsAsync)
absuite social count conversations --SocialProfileId <social-profile-guid>

# Create a conversation    (New-ConversationAsync)
absuite social create conversation --SocialProfileId <social-profile-guid> --ConversationCreateDto '{
  "subject": "Project kickoff",
  "socialProfileId": "<social-profile-guid>"
}'

# List messages            (Get-MessagesAsync)
absuite social list messages --ConversationId <conversation-guid> --SocialProfileId <social-profile-guid>

# Count messages           (Invoke-CountMessagesAsync)
absuite social count messages --ConversationId <conversation-guid> --SocialProfileId <social-profile-guid>

# Create a message         (New-MessageAsync)
absuite social create message --ConversationId <conversation-guid> --SocialProfileId <social-profile-guid> --PrivateMessageCreateDto '{
  "title": "Re: Project kickoff",
  "message": "Hello! How are you?",
  "conversationId": "<conversation-guid>",
  "senderSocialProfileId": "<sender-social-profile-guid>",
  "receiverSocialProfileId": "<receiver-social-profile-guid>"
}'

# Update a message         (Update-MessageAsync)
absuite social update message --ConversationId <conversation-guid> --MessageId <message-guid> --SocialProfileId <social-profile-guid> --PrivateMessageUpdateDto '{
  "title": "Re: Project kickoff (edited)",
  "message": "Hello again!"
}'

# Delete a message         (Invoke-DeleteMessageAsync)
absuite social delete message --ConversationId <conversation-guid> --MessageId <message-guid> --SocialProfileId <social-profile-guid>
```

## Notifications

Read-only, scoped by `--SocialProfileId` (no tenantId).

```bash
# List notifications       (Get-NotificationsAsync)
absuite social list notifications --SocialProfileId <social-profile-guid>

# Count notifications      (Invoke-CountNotificationsAsync)
absuite social count notifications --SocialProfileId <social-profile-guid>

# Get a notification       (Get-NotificationByIdAsync)
absuite social get notification --SocialProfileId <social-profile-guid> --NotificationId <notification-guid>
```

## Follow / Unfollow

Both the acting profile (`--SocialProfileId`) and target
(`--FollowedSocialProfileId`) are ids. No tenantId, no DTO body on follow/unfollow.

```bash
# Follow a profile         (Trace-Async)
absuite social follow --SocialProfileId <social-profile-guid> --FollowedSocialProfileId <followed-social-profile-guid>

# Check whether a follow exists  (Trace-ExistsAsync)
absuite social follow-exists --SocialProfileId <social-profile-guid> --FollowedSocialProfileId <followed-social-profile-guid>

# Unfollow a profile       (Invoke-UnfollowAsync)
absuite social unfollow --SocialProfileId <social-profile-guid> --FollowedSocialProfileId <followed-social-profile-guid>

# List follows             (Get-FollowsAsync)
absuite social list follows --SocialProfileId <social-profile-guid>

# Count follows            (Invoke-CountFollowsAsync)
absuite social count follows --SocialProfileId <social-profile-guid>

# List followed profiles   (Get-FollowedProfilesAsync)
absuite social list followed-profiles --SocialProfileId <social-profile-guid>

# Count followed profiles  (Invoke-CountFollowedProfilesAsync)
absuite social count followed-profiles --SocialProfileId <social-profile-guid>

# List followers           (Get-FollowersAsync)
absuite social list followers --SocialProfileId <social-profile-guid>

# Count followers          (Invoke-CountFollowersAsync)
absuite social count followers --SocialProfileId <social-profile-guid>

# List follower profiles   (Get-FollowerProfilesAsync)
absuite social list follower-profiles --SocialProfileId <social-profile-guid>

# Count follower profiles  (Invoke-CountFollowerProfilesAsync)
absuite social count follower-profiles --SocialProfileId <social-profile-guid>
```

---

## End-to-end example

Publish a post, react and comment on it (CLI-only; for an atomic edit use the REST skill).

```bash
# 0) Authenticate
absuite login

# 1) Find a profile to act as (public list)
absuite social list profiles

# 2) Create a post
absuite social create post --SocialProfileId <social-profile-guid> --SocialPostCreateDto '{
  "title": "Launch day", "message": "It is live!", "socialProfileId": "<social-profile-guid>"
}'

# 3) React to it
absuite social create post-reaction --SocialPostId <social-post-guid> --SocialProfileId <social-profile-guid> --SocialReactionCreateDto '{
  "reaction": "Love", "socialProfileId": "<social-profile-guid>"
}'

# 4) Comment on it
absuite social create post-comment --SocialPostId <social-post-guid> --SocialProfileId <social-profile-guid> --SocialPostCommentCreateDto '{
  "message": "Congrats team!", "socialProfileId": "<social-profile-guid>", "socialPostId": "<social-post-guid>"
}'
```

---

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List profiles | `absuite social list profiles` |
| Count profiles | `absuite social count profiles` |
| Get profile | `absuite social get profile --SocialProfileId <guid>` |
| List posts | `absuite social list posts --SocialProfileId <guid>` |
| Count posts | `absuite social count posts --SocialProfileId <guid>` |
| Get post | `absuite social get post --SocialPostId <guid> --SocialProfileId <guid>` |
| Create post | `absuite social create post --SocialProfileId <guid> --SocialPostCreateDto '{...}'` |
| Update post | `absuite social update post --SocialPostId <guid> --SocialProfileId <guid> --SocialPostUpdateDto '{...}'` |
| Delete post | `absuite social delete post --SocialPostId <guid> --SocialProfileId <guid>` |
| List comments | `absuite social list post-comments --SocialPostId <guid> --SocialProfileId <guid>` |
| Count comments | `absuite social count post-comments --SocialPostId <guid> --SocialProfileId <guid>` |
| Get comment | `absuite social get post-comment --SocialPostId <guid> --CommentId <guid> --SocialProfileId <guid>` |
| Create comment | `absuite social create post-comment --SocialPostId <guid> --SocialProfileId <guid> --SocialPostCommentCreateDto '{...}'` |
| Update comment | `absuite social update post-comment --SocialPostId <guid> --CommentId <guid> --SocialProfileId <guid> --SocialPostCommentUpdateDto '{...}'` |
| Delete comment | `absuite social delete post-comment --SocialPostId <guid> --CommentId <guid> --SocialProfileId <guid>` |
| List reactions | `absuite social list post-reactions --SocialPostId <guid> --SocialProfileId <guid>` |
| Count reactions | `absuite social count post-reactions --SocialPostId <guid> --SocialProfileId <guid>` |
| Get reaction | `absuite social get post-reaction --SocialPostId <guid> --ReactionId <guid>` |
| Create reaction | `absuite social create post-reaction --SocialPostId <guid> --SocialProfileId <guid> --SocialReactionCreateDto '{...}'` |
| Update reaction | `absuite social update post-reaction --SocialPostId <guid> --ReactionId <guid> --SocialProfileId <guid> --SocialReactionUpdateDto '{...}'` |
| Delete reaction | `absuite social delete post-reaction --SocialPostId <guid> --ReactionId <guid> --SocialProfileId <guid>` |
| List attachments | `absuite social list post-attachments --SocialPostId <guid>` |
| Count attachments | `absuite social count post-attachments --SocialPostId <guid>` |
| Get attachment | `absuite social get post-attachment --SocialPostId <guid> --AttachmentId <guid>` |
| Create attachment | `absuite social create post-attachment --SocialPostId <guid> --SocialProfileId <guid> --SocialPostAttachmentCreateDto '{...}'` |
| Update attachment | `absuite social update post-attachment --SocialPostId <guid> --AttachmentId <guid> --SocialProfileId <guid> --SocialPostAttachmentUpdateDto '{...}'` |
| Delete attachment | `absuite social delete post-attachment --SocialPostId <guid> --AttachmentId <guid> --SocialProfileId <guid>` |
| List groups | `absuite social list groups --TenantId <guid>` |
| Count groups | `absuite social count groups --TenantId <guid>` |
| Get group | `absuite social get group-by-id --SocialGroupId <guid> --TenantId <guid>` |
| Create group | `absuite social create group --TenantId <guid> --SocialProfileId <guid> --SocialGroupCreateDto '{...}'` |
| Update group | `absuite social update group --SocialGroupId <guid> --TenantId <guid> --SocialProfileId <guid> --SocialGroupUpdateDto '{...}'` |
| Delete group | `absuite social delete group --SocialGroupId <guid> --TenantId <guid> --SocialProfileId <guid>` |
| List feeds | `absuite social list feeds --SocialProfileId <guid>` |
| Count feeds | `absuite social count feeds --SocialProfileId <guid>` |
| Get feed | `absuite social get feed --SocialFeedId <guid> --SocialProfileId <guid>` |
| List feed posts | `absuite social list feed-posts --SocialFeedId <guid> --SocialProfileId <guid>` |
| Count feed posts | `absuite social count feed-posts --SocialFeedId <guid> --SocialProfileId <guid>` |
| Get feed post | `absuite social get feed-post --SocialFeedId <guid> --FeedPostId <guid> --SocialProfileId <guid>` |
| Create feed post | `absuite social create feed-post --SocialFeedId <guid> --SocialProfileId <guid> --SocialFeedPostCreateDto '{...}'` |
| Update feed post | `absuite social update feed-post --SocialFeedId <guid> --FeedPostId <guid> --SocialProfileId <guid> --SocialFeedPostUpdateDto '{...}'` |
| Delete feed post | `absuite social delete feed-post --SocialFeedId <guid> --FeedPostId <guid> --SocialProfileId <guid>` |
| List conversations | `absuite social list conversations --SocialProfileId <guid>` |
| Count conversations | `absuite social count conversations --SocialProfileId <guid>` |
| Create conversation | `absuite social create conversation --SocialProfileId <guid> --ConversationCreateDto '{...}'` |
| List messages | `absuite social list messages --ConversationId <guid> --SocialProfileId <guid>` |
| Count messages | `absuite social count messages --ConversationId <guid> --SocialProfileId <guid>` |
| Create message | `absuite social create message --ConversationId <guid> --SocialProfileId <guid> --PrivateMessageCreateDto '{...}'` |
| Update message | `absuite social update message --ConversationId <guid> --MessageId <guid> --SocialProfileId <guid> --PrivateMessageUpdateDto '{...}'` |
| Delete message | `absuite social delete message --ConversationId <guid> --MessageId <guid> --SocialProfileId <guid>` |
| List notifications | `absuite social list notifications --SocialProfileId <guid>` |
| Count notifications | `absuite social count notifications --SocialProfileId <guid>` |
| Get notification | `absuite social get notification --SocialProfileId <guid> --NotificationId <guid>` |
| Follow | `absuite social follow --SocialProfileId <guid> --FollowedSocialProfileId <guid>` |
| Follow exists | `absuite social follow-exists --SocialProfileId <guid> --FollowedSocialProfileId <guid>` |
| Unfollow | `absuite social unfollow --SocialProfileId <guid> --FollowedSocialProfileId <guid>` |
| List follows | `absuite social list follows --SocialProfileId <guid>` |
| Count follows | `absuite social count follows --SocialProfileId <guid>` |
| List followed profiles | `absuite social list followed-profiles --SocialProfileId <guid>` |
| Count followed profiles | `absuite social count followed-profiles --SocialProfileId <guid>` |
| List followers | `absuite social list followers --SocialProfileId <guid>` |
| Count followers | `absuite social count followers --SocialProfileId <guid>` |
| List follower profiles | `absuite social list follower-profiles --SocialProfileId <guid>` |
| Count follower profiles | `absuite social count follower-profiles --SocialProfileId <guid>` |

## Critical rules

- **Authenticate first** (`absuite login`; see `absuite-login-cli`).
- **Social is profile-scoped, not tenant-scoped.** Pass `--SocialProfileId` where required.
  **Do NOT pass `--TenantId` to social commands** — the sole exception is **Social
  Groups**, which require `--TenantId`.
- **Profiles list/count are public** (no scoping params).
- **No PATCH and no raw HTTP here** — for atomic JSON Patch updates use the
  `absuite-social` (REST) skill. There is also **no search** verb in this service.
- If a friendly verb/entity alias is not recognized, use the function-name form shown in
  parentheses (e.g. `absuite social Get-SocialPostsAsync ...`) and confirm parameters with
  `--help`.
