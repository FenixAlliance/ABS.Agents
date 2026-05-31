---
name: absuite-social
description: >
  Manage the social network in the Alliance Business Suite (ABS) using the `absuite`
  CLI. Covers social profiles, posts, comments, reactions, attachments, groups,
  feeds, conversations, messages, notifications, and follow/unfollow relationships.
  Requires an authenticated CLI session.
---

# Alliance Business Suite — Social Skill

Manage social features through the `absuite` CLI's `social` service.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Discover commands**: `absuite social list-commands`

## REST API Authentication

All REST API calls require a bearer token.

1. **Obtain a token**: `POST $ABSUITE_HOST_URL/login` with `{"email":"...","password":"..."}`
2. **Use the token**: `-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"`
3. **Base URL**: `$ABSUITE_HOST_URL/api/v2/`

## Social Profiles

```bash
# List
absuite social list profiles

# Count
absuite social count profiles

# Get a profile
absuite social get profile --SocialProfileId <profile-guid>
```

**REST API equivalents:**

```bash
# List social profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count social profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a social profile by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Posts

```bash
# List
absuite social list posts --SocialProfileId <profile-guid>

# Count
absuite social count posts --SocialProfileId <profile-guid>

# Get by ID
absuite social get post --SocialPostId <post-guid>

# Create
absuite social create post --SocialProfileId <profile-guid> --SocialPostCreateDto '{
  "Title": "Exciting product launch!",
  "Message": "We are thrilled to announce our new product line.",
  "SocialProfileId": "<profile-guid>"
}'

# Update
absuite social update post --SocialPostId <post-guid> --SocialPostUpdateDto '{...}'

# Delete
absuite social delete post --SocialPostId <post-guid>
```

**REST API equivalents:**

```bash
# List social posts
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count social posts
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a social post by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a social post
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Exciting product launch!",
    "Message": "We are thrilled to announce our new product line.",
    "SocialProfileId": "<profile-guid>"
  }'

# Update a social post
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete a social post
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Post Comments

```bash
absuite social list post-comments --SocialPostId <post-guid>
absuite social count post-comments --SocialPostId <post-guid>
absuite social get post-comment --SocialPostCommentId <comment-guid>
absuite social create post-comment --SocialPostId <post-guid> --SocialPostCommentCreateDto '{
  "Message": "Great news! Looking forward to it."
}'
absuite social update post-comment --SocialPostCommentId <comment-guid> --SocialPostCommentUpdateDto '{...}'
absuite social delete post-comment --SocialPostCommentId <comment-guid>
```

**REST API equivalents:**

```bash
# List comments on a post
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Comments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count comments on a post
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Comments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a comment by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Comments/<comment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a comment
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Comments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Message": "Great news! Looking forward to it."
  }'

# Update a comment
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Comments/<comment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete a comment
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Comments/<comment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Post Reactions

```bash
absuite social list post-reactions --SocialPostId <post-guid>
absuite social count post-reactions --SocialPostId <post-guid>
absuite social get post-reaction --SocialPostReactionId <reaction-guid>
absuite social create post-reaction --SocialPostId <post-guid> --SocialPostReactionCreateDto '{
  "ReactionType": "Like"
}'
absuite social update post-reaction --SocialPostReactionId <reaction-guid> --SocialPostReactionUpdateDto '{...}'
absuite social delete post-reaction --SocialPostReactionId <reaction-guid>
```

**REST API equivalents:**

```bash
# List reactions on a post
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Reactions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count reactions on a post
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Reactions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a reaction by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Reactions/<reaction-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a reaction
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Reactions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ReactionType": "Like"
  }'

# Update a reaction
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Reactions/<reaction-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete a reaction
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Reactions/<reaction-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Post Attachments

```bash
absuite social list post-attachments --SocialPostId <post-guid>
absuite social count post-attachments --SocialPostId <post-guid>
absuite social get post-attachment --SocialPostAttachmentId <attachment-guid>
absuite social create post-attachment --SocialPostId <post-guid> --SocialPostAttachmentCreateDto '{...}'
absuite social update post-attachment --SocialPostAttachmentId <attachment-guid> --SocialPostAttachmentUpdateDto '{...}'
absuite social delete post-attachment --SocialPostAttachmentId <attachment-guid>
```

**REST API equivalents:**

```bash
# List attachments on a post
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Attachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count attachments on a post
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Attachments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get an attachment by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Attachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create an attachment
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Attachments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update an attachment
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Attachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete an attachment
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialPosts/<post-guid>/Attachments/<attachment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Groups

```bash
absuite social list groups
absuite social count groups
absuite social get group-by-id --SocialGroupId <group-guid>
absuite social create group --SocialGroupCreateDto '{
  "Name": "Engineering Team",
  "Description": "Internal engineering discussions"
}'
absuite social update group --SocialGroupId <group-guid> --SocialGroupUpdateDto '{...}'
absuite social delete group --SocialGroupId <group-guid>
```

**REST API equivalents:**

```bash
# List social groups
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count social groups
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a social group by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a social group
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Engineering Team",
    "Description": "Internal engineering discussions"
  }'

# Update a social group
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete a social group
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialGroups/<group-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Social Feeds

```bash
# List feeds
absuite social list feeds

# Get feed by ID
absuite social get feed --SocialFeedId <feed-guid>

# Count feeds
absuite social count feeds
```

**REST API equivalent:**

```bash
# List social feeds
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a social feed by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<feed-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count social feeds
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Social Feed Posts

```bash
# Feed posts
absuite social list feed-posts --SocialProfileId <profile-guid>
absuite social count feed-posts --SocialProfileId <profile-guid>
absuite social get feed-post --FeedPostId <feed-post-guid>
absuite social create feed-post --SocialFeedPostCreateDto '{
  "Title": "Status Update",
  "Message": "Working on something exciting!"
}'
absuite social update feed-post --FeedPostId <feed-post-guid> --SocialFeedPostUpdateDto '{...}'
absuite social delete feed-post --FeedPostId <feed-post-guid>

# Feed notifications
absuite social list feed-notifications
absuite social get notification --NotificationId <notification-guid>
```

**REST API equivalent:**

```bash
# List feed posts
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<feed-guid>/Posts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count feed posts
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<feed-guid>/Posts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a feed post by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<feed-guid>/Posts/<feed-post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a feed post
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<feed-guid>/Posts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Status Update",
    "Message": "Working on something exciting!"
  }'

# Update a feed post
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<feed-guid>/Posts/<feed-post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete a feed post
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialFeeds/<feed-guid>/Posts/<feed-post-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Conversations & Messages

```bash
# Conversations
absuite social list conversations
absuite social count conversations
absuite social create conversation --SocialConversationCreateDto '{...}'

# Messages
absuite social list messages --ConversationId <conversation-guid>
absuite social count messages --ConversationId <conversation-guid>
absuite social create message --ConversationId <conversation-guid> --SocialMessageCreateDto '{
  "Content": "Hello! How are you?"
}'
absuite social update message --MessageId <message-guid> --SocialMessageUpdateDto '{...}'
absuite social delete message --MessageId <message-guid>
```

**REST API equivalents:**

```bash
# Create a conversation
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Conversations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# List conversations
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Conversations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count conversations
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Conversations/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create a message
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<conversation-guid>/Messages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Content": "Hello! How are you?"
  }'

# List messages in a conversation
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<conversation-guid>/Messages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count messages in a conversation
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<conversation-guid>/Messages/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update a message
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<conversation-guid>/Messages/<message-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete a message
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<conversation-guid>/Messages/<message-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Notifications

```bash
absuite social list notifications
absuite social count notifications
absuite social get notification --NotificationId <notification-guid>
```

**REST API equivalents:**

```bash
# List notifications
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Notifications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count notifications
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Notifications/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a notification by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Notifications/<notification-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Follow / Unfollow

```bash
# Follow a profile
absuite social trace- --SocialProfileId <profile-to-follow-guid>

# Unfollow
absuite social unfollow --SocialProfileId <profile-guid>

# Check if following
absuite social trace-exists --SocialProfileId <profile-guid>

# List follows / followers
absuite social list follows
absuite social count follows
absuite social list followers
absuite social count followers

# List followed/follower profiles
absuite social list followed-profiles
absuite social count followed-profiles
absuite social list follower-profiles
absuite social count follower-profiles
```

**REST API equivalents:**

```bash
# Follow a profile
curl -X POST "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Follows/<followed-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Check if following
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Follows/<followed-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unfollow a profile
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Follows/<followed-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List follows
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Follows" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count follows
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Follows/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List followed profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Follows/Profiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count followed profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Follows/Profiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List followers
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Followers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count followers
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Followers/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List follower profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Followers/Profiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count follower profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/SocialService/SocialProfiles/<profile-guid>/Followers/Profiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List profiles | `absuite social list profiles` |
| Create post | `absuite social create post --SocialProfileId <guid> --SocialPostCreateDto '{...}'` |
| Comment on post | `absuite social create post-comment --SocialPostId <guid> --SocialPostCommentCreateDto '{...}'` |
| React to post | `absuite social create post-reaction --SocialPostId <guid> --SocialPostReactionCreateDto '{...}'` |
| Follow profile | `absuite social trace- --SocialProfileId <guid>` |
| Unfollow | `absuite social unfollow --SocialProfileId <guid>` |
| List conversations | `absuite social list conversations` |
| Send message | `absuite social create message --ConversationId <guid> --SocialMessageCreateDto '{...}'` |
| List notifications | `absuite social list notifications` |

## Critical Rules

- **Authenticate first.**
- **Social profiles are user-scoped**, not tenant-scoped.
- **Follow command is `trace-`** (the CLI alias for the follow operation).

## API Endpoints Quick Reference

| Resource | Method | Endpoint |
|---|---|---|
| Social Profiles | `GET` | `/api/v2/SocialService/SocialProfiles` |
| Social Profiles | `GET` | `/api/v2/SocialService/SocialProfiles/{id}` |
| Social Profiles | `GET` | `/api/v2/SocialService/SocialProfiles/Count` |
| Posts | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Posts` |
| Posts | `POST` | `/api/v2/SocialService/SocialProfiles/{profileId}/Posts` |
| Posts | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Posts/{postId}` |
| Posts | `PUT` | `/api/v2/SocialService/SocialProfiles/{profileId}/Posts/{postId}` |
| Posts | `DELETE` | `/api/v2/SocialService/SocialProfiles/{profileId}/Posts/{postId}` |
| Posts | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Posts/Count` |
| Post Comments | `GET` | `/api/v2/SocialService/SocialPosts/{postId}/Comments` |
| Post Comments | `POST` | `/api/v2/SocialService/SocialPosts/{postId}/Comments` |
| Post Comments | `GET` | `/api/v2/SocialService/SocialPosts/{postId}/Comments/{commentId}` |
| Post Comments | `PUT` | `/api/v2/SocialService/SocialPosts/{postId}/Comments/{commentId}` |
| Post Comments | `DELETE` | `/api/v2/SocialService/SocialPosts/{postId}/Comments/{commentId}` |
| Post Comments | `GET` | `/api/v2/SocialService/SocialPosts/{postId}/Comments/Count` |
| Post Reactions | `GET` | `/api/v2/SocialService/SocialPosts/{postId}/Reactions` |
| Post Reactions | `POST` | `/api/v2/SocialService/SocialPosts/{postId}/Reactions` |
| Post Reactions | `GET` | `/api/v2/SocialService/SocialPosts/{postId}/Reactions/{reactionId}` |
| Post Reactions | `PUT` | `/api/v2/SocialService/SocialPosts/{postId}/Reactions/{reactionId}` |
| Post Reactions | `DELETE` | `/api/v2/SocialService/SocialPosts/{postId}/Reactions/{reactionId}` |
| Post Reactions | `GET` | `/api/v2/SocialService/SocialPosts/{postId}/Reactions/Count` |
| Post Attachments | `GET` | `/api/v2/SocialService/SocialPosts/{postId}/Attachments` |
| Post Attachments | `POST` | `/api/v2/SocialService/SocialPosts/{postId}/Attachments` |
| Post Attachments | `GET` | `/api/v2/SocialService/SocialPosts/{postId}/Attachments/{attachmentId}` |
| Post Attachments | `PUT` | `/api/v2/SocialService/SocialPosts/{postId}/Attachments/{attachmentId}` |
| Post Attachments | `DELETE` | `/api/v2/SocialService/SocialPosts/{postId}/Attachments/{attachmentId}` |
| Post Attachments | `GET` | `/api/v2/SocialService/SocialPosts/{postId}/Attachments/Count` |
| Groups | `GET` | `/api/v2/SocialService/SocialGroups` |
| Groups | `POST` | `/api/v2/SocialService/SocialGroups` |
| Groups | `GET` | `/api/v2/SocialService/SocialGroups/{groupId}` |
| Groups | `PUT` | `/api/v2/SocialService/SocialGroups/{groupId}` |
| Groups | `DELETE` | `/api/v2/SocialService/SocialGroups/{groupId}` |
| Groups | `GET` | `/api/v2/SocialService/SocialGroups/Count` |
| Social Feeds | `GET` | `/api/v2/SocialService/SocialFeeds` |
| Social Feeds | `GET` | `/api/v2/SocialService/SocialFeeds/{feedId}` |
| Social Feeds | `GET` | `/api/v2/SocialService/SocialFeeds/Count` |
| Feed Posts | `GET` | `/api/v2/SocialService/SocialFeeds/{feedId}/Posts` |
| Feed Posts | `POST` | `/api/v2/SocialService/SocialFeeds/{feedId}/Posts` |
| Feed Posts | `GET` | `/api/v2/SocialService/SocialFeeds/{feedId}/Posts/{postId}` |
| Feed Posts | `PUT` | `/api/v2/SocialService/SocialFeeds/{feedId}/Posts/{postId}` |
| Feed Posts | `DELETE` | `/api/v2/SocialService/SocialFeeds/{feedId}/Posts/{postId}` |
| Feed Posts | `GET` | `/api/v2/SocialService/SocialFeeds/{feedId}/Posts/Count` |
| Conversations | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Conversations` |
| Conversations | `POST` | `/api/v2/SocialService/SocialProfiles/{profileId}/Conversations` |
| Conversations | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Conversations/Count` |
| Messages | `GET` | `/api/v2/SocialService/SocialProfiles/{conversationId}/Messages` |
| Messages | `POST` | `/api/v2/SocialService/SocialProfiles/{conversationId}/Messages` |
| Messages | `GET` | `/api/v2/SocialService/SocialProfiles/{conversationId}/Messages/{messageId}` |
| Messages | `PUT` | `/api/v2/SocialService/SocialProfiles/{conversationId}/Messages/{messageId}` |
| Messages | `DELETE` | `/api/v2/SocialService/SocialProfiles/{conversationId}/Messages/{messageId}` |
| Messages | `GET` | `/api/v2/SocialService/SocialProfiles/{conversationId}/Messages/Count` |
| Notifications | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Notifications` |
| Notifications | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Notifications/{notificationId}` |
| Notifications | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Notifications/Count` |
| Follows | `POST` | `/api/v2/SocialService/SocialProfiles/{profileId}/Follows/{targetId}` |
| Follows | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Follows/{targetId}` |
| Follows | `DELETE` | `/api/v2/SocialService/SocialProfiles/{profileId}/Follows/{targetId}` |
| Follows | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Follows` |
| Follows | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Follows/Count` |
| Followers | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Followers` |
| Followers | `GET` | `/api/v2/SocialService/SocialProfiles/{profileId}/Followers/Count` |

