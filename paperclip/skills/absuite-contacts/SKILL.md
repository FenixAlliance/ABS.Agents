---
name: absuite-contacts
description: >
  Create, read, update, patch, delete, and manage contacts in the Alliance Business
  Suite (ABS) CRM Service via the REST API. Covers contacts (individuals &
  organizations), extended views, relationship graphs, avatars, wallets, carts,
  social profiles, contact options (key-value metadata), contact emails, contact
  groups, contact profiles, contact relations, contact relation types, contact
  sources, and user/tenant sync — including atomic PATCH (JSON Patch) updates. All
  operations are tenant-scoped and require a bearer token (see the absuite-login
  skill to authenticate).
---

# Alliance Business Suite — Contacts Skill (REST)

Manage contacts and related CRM resources through the ABS CRM Service REST API. Almost
every CRM endpoint is tenant-scoped: pass `?tenantId=<tenant-guid>` (or the equivalent
`X-TenantId: <tenant-guid>` header) on **every** request — GET, POST, PUT, PATCH, and
DELETE alike. The only exceptions are noted inline (`POST .../Contacts` and the email
`Preview`/`Send` actions, where `tenantId` is optional or not bound).

> For the CLI equivalent see `absuite-contacts-cli`; for general REST conventions
> (envelope, tenant scoping, JSON Patch) see `absuite-rest`.

## Authentication

1. **Obtain a bearer token:**
```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<your-email>", "password": "<your-password>"}'
```
Extract `accessToken` from the JSON response and export it:
```bash
export ABSUITE_ACCESS_TOKEN="<accessToken-from-response>"
```

2. **Send the token on every subsequent request:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/CrmService/...`

4. **Response envelope** — every response is wrapped:
```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "…",
  "timestamp": "…",
  "result": { }
}
```
Always check `isSuccess`; read the payload from `result` (an object, an array, an int for `Count`, or `null`).

## Key Concepts

- **Contact** — a person or organization in the CRM. The `type` field is the enum
  **`Individual` | `Organization`** (a string value, not a numeric code).
- **Extended Contact** — a contact record enriched with related data (profiles, wallet, etc.),
  served from the `/Extended` endpoints.
- **Contact Group** — a named grouping of contacts (`ContactGroups`).
- **Contact Profile** — a profile record attached to a contact, holding a `type`, `about`,
  `avatarUrl`, and up to ten generic `data`/`dataLabel` slots (`data`, `data1`…`data9` with
  matching `…Label`). Available both as a standalone resource (`/ContactProfiles`) and nested
  under a contact (`/Contacts/{contactId}/Profiles`).
- **Contact Relation** — a typed link between two contacts (`contactId` → `relatedContactId`)
  classified by a **Contact Relation Type** (`contactRelationTypeId`).
- **Contact Relation Type** — defines a relation label and its inverse (`name`, `backName`,
  `description`).
- **Contact Source** — a named acquisition/origin channel for contacts (`name`, `description`).
- **Contact Option** — a key-value metadata pair attached to a contact (`key`, `value`, plus
  `portalId`, `frozen`, `autoload`, `transient`, `expiration`).
- **Contact Email** — an email address attached to a contact (`address`, `label`, `isPrimary`),
  individually verifiable.
- **Relationship Graph** — contacts can be queried by relationship direction:
  individual→individuals, individual→organizations, organization→individuals,
  organization→organizations.
- **Sync** — pull the current user, another user, or a tenant into a tenant's contact list.

> Field names in request bodies are camelCase JSON keys exactly as transcribed from the spec
> (e.g. `"firstName"`, `"currencyId"`, `"type"`). JSON Patch `path` pointers are camelCase
> with a leading slash (e.g. `/firstName`).

## Workflow: Creating and Enriching a Contact

1. **Create the contact** (`type`, `firstName`, `email` are required).
2. **Add email addresses** and verify them.
3. **Add contact options** (key-value metadata) and/or **contact profiles**.
4. **Relate contacts** via contact relations (typed by a relation type).
5. **Patch** individual fields atomically; **send** transactional email.

---

## Contacts

### List Contacts

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count Contacts

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Extended Contacts (with related data)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Contact by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Extended Contact by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Contact

> Note: on `POST .../Contacts`, `tenantId` is an **optional** query param (the contact is
> created under the authenticated tenant). Pass it to scope explicitly.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Individual",
    "firstName": "<first-name>",
    "lastName": "<last-name>",
    "email": "<email>",
    "jobTitle": "<job-title>",
    "mobilePhone": "<mobile-phone>",
    "businessPhone": "<business-phone>",
    "countryId": "<country-id>",
    "currencyId": "<currency-id>",
    "languageId": "<language-id>"
  }'
```

**`ContactCreateDto` fields** (`type`, `firstName`, `email` are **required**; transcribed from the spec):
`id`, `timestamp`, `type` (`Individual`|`Organization`), `firstName`, `lastName`, `email`,
`taxId`, `primaryContactId`, `about`, `countryId`, `stateId`, `cityId`, `mobilePhone`,
`businessPhone`, `postalCode`, `duns`, `jobTitle`, `webUrl`, `currencyId`, `languageId`,
`timezoneId`, `birthday`, `streetLine1`, `streetLine2`, `gitHubUrl`, `twitchUrl`, `redditUrl`,
`tikTokUrl`, `websiteUrl`, `twitterUrl`, `facebookUrl`, `youTubeUrl`, `linkedInUrl`,
`instagramUrl`, `githubUsername`, `instagramUsername`, `tikTokUsername`, `stackExchangeUrl`,
`stackOverflowUrl`, `parentContactId`, `faxNumber`.

### Update Contact (PUT — full replace)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Individual",
    "firstName": "<first-name>",
    "lastName": "<last-name>",
    "email": "<email>",
    "jobTitle": "<job-title>"
  }'
```

**`ContactUpdateDto` fields** (`type`, `firstName`, `email` **required**):
`type` (`Individual`|`Organization`), `birthday`, `duns`, `taxId`, `email`, `firstName`,
`lastName`, `primaryContactId`, `about`, `mobilePhone`, `businessPhone`, `jobTitle`,
`countryId`, `parentContactId`, `postalCode`, `stateId`, `cityId`, `streetLine1`,
`streetLine2`, `currencyId`, `languageId`, `timezoneId`, `coverUrl`, `githubUsername`,
`instagramUsername`, `webUrl`, `twitchUrl`, `redditUrl`, `gitHubUrl`, `tikTokUrl`,
`twitterUrl`, `youTubeUrl`, `facebookUrl`, `linkedInUrl`, `instagramUrl`, `tikTokUsername`,
`stackExchangeUrl`, `stackOverflowUrl`, `faxNumber`. (Note: `ContactUpdateDto` carries
`coverUrl` but not `webUrl`-as-`websiteUrl`; it does not carry `id`.)

### Patch Contact (PATCH — JSON Patch RFC 6902)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/jobTitle", "value": "<new-job-title>" },
    { "op": "replace", "path": "/mobilePhone", "value": "<new-mobile-phone>" }
  ]'
```

### Delete Contact

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Upsert a User onto a Tenant's Contact List

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals/Upsert?tenantId=<tenant-guid>&relatedUserId=<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Upsert a Tenant onto Another Tenant's Contact List

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations/Upsert?tenantId=<tenant-guid>&relatedTenantId=<related-tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contacts by Type — Individuals

### List / Count / Extended Individuals

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Individual by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals/<contact-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Individual's Related Contacts

```bash
# Related individuals
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals/<contact-guid>/Individuals?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Related organizations
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Individuals/<contact-guid>/Organizations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contacts by Type — Organizations

### List / Count / Extended Organizations

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Organization by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations/<contact-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Organization's Related Contacts

```bash
# Related individuals
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations/<contact-guid>/Individuals?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Related organizations
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/Organizations/<contact-guid>/Organizations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contact Sub-Resources (Wallet, Cart, Avatar, Social Profile)

```bash
# Wallet
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Wallet?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Cart
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Cart?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Social profile
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/SocialProfile?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Avatar

```bash
# Get avatar
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Avatar?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update avatar (multipart upload; tenantId is optional on this endpoint)
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Avatar?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/avatar.png"
```

## Contact Emails

### List / Count Emails for a Contact

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Add an Email Address to a Contact

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails/Addresses?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<contact-guid>",
    "address": "<email-address>",
    "label": "<label>",
    "isPrimary": true
  }'
```

**`ContactEmailCreateDto` fields:** `id`, `timestamp`, `contactId`, `address`, `label`, `isPrimary` (bool).

### Update an Email Address (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails/<email-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "<email-address>",
    "label": "<label>",
    "isPrimary": false
  }'
```

**`ContactEmailUpdateDto` fields:** `address`, `label`, `isPrimary` (bool).

### Patch an Email Address (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails/<email-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/isPrimary", "value": true }
  ]'
```

### Verify an Email Address

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails/<email-guid>/Verify?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Delete an Email Address

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails/<email-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Send / Preview Transactional Email

> Note: these two actions take `contactId` (path) but do **not** bind `tenantId`.

```bash
# Send
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<subject>",
    "message": "<body>",
    "culture": "en-US",
    "uiCulture": "en-US",
    "recipients": ["<recipient-email>"]
  }'

# Preview (renders without sending; same body)
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails/Preview" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<subject>",
    "message": "<body>",
    "culture": "en-US",
    "uiCulture": "en-US",
    "recipients": ["<recipient-email>"]
  }'
```

**`EmailDispatchRequest` fields** (`title`, `message`, `culture`, `uiCulture`, `recipients` are **required**):
`title`, `message`, `buttonLink`, `buttonText`, `alertMessage`,
`alertType` (`None`|`Info`|`Error`|`Warning`|`Success`|`Action`|`Alert`),
`culture`, `uiCulture`, `recipients` (array of emails), `contactIds` (array), `tenantIds`
(array), `userIds` (array), `templateUrl`, `emailTemplateId`.

## Contact Profiles (nested under a Contact)

### List / Count a Contact's Profiles

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Profiles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Profiles/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a Contact Profile (nested)

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Profiles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<contact-guid>",
    "type": "<profile-type>",
    "about": "<about>",
    "avatarUrl": "<avatar-url>",
    "data": "<value>",
    "dataLabel": "<label>"
  }'
```

**`ContactProfileCreateDto` fields:** `id`, `timestamp`, `type`, `contactId`, `about`,
`avatarUrl`, and ten generic slots `data` + `dataLabel`, `data1` + `data1Label`, …,
`data9` + `data9Label`.

### Update a Contact Profile (nested, PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Profiles/<profile-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "<profile-type>",
    "about": "<about>",
    "data": "<value>",
    "dataLabel": "<label>"
  }'
```

**`ContactProfileUpdateDto` fields:** `type`, `contactId`, `about`, `avatarUrl`, and the ten
`data`/`dataLabel` slots (`data`…`data9`).

### Delete a Contact Profile (nested)

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Profiles/<profile-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contact Options (Key-Value Metadata)

Store arbitrary metadata on contacts. An option carries `key`, `value`, optional `portalId`,
and the flags `frozen`, `autoload`, `transient`, plus an integer `expiration`.

### List / Count Options

```bash
# Optionally scope to a portal with &portalId=<portal-guid>
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get Option by ID / by Key

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/<option-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/Key/<key>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create Option

> `key` is also a **required query param** on create.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options?tenantId=<tenant-guid>&key=<key>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "<key>",
    "value": "<value>",
    "frozen": false,
    "autoload": false,
    "transient": false
  }'
```

**`OptionCreateDto` fields** (`key`, `value` **required**): `id`, `timestamp`, `key`, `value`,
`portalId`, `frozen` (bool), `autoload` (bool), `transient` (bool), `expiration` (int).

### Update Option (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/<option-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "<key>",
    "value": "<new-value>"
  }'
```

**`OptionUpdateDto` fields:** `key`, `value`, `portalId`, `frozen` (bool), `autoload` (bool),
`transient` (bool), `expiration` (int).

### Upsert Option by Key (create or update)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/Upsert/<key>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "<key>",
    "value": "<value>"
  }'
```

### Patch Option by ID / by Key (PATCH — JSON Patch)

```bash
# By option ID
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/<option-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/value", "value": "<new-value>" }
  ]'

# By key
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/Key/<key>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/value", "value": "<new-value>" }
  ]'
```

### Delete Option

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/<option-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Contact Groups

### List / Count

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactGroups?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactGroups/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/ContactGroups?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<group-name>",
    "description": "<description>"
  }'
```

**`ContactsGroupCreateDto` fields** (`name` **required**): `id`, `timestamp`, `name`, `description`.

### Update (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/ContactGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<group-name>",
    "description": "<description>"
  }'
```

**`ContactsGroupUpdateDto` fields** (`name` **required**): `name`, `description`.

### Patch (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CrmService/ContactGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/name", "value": "<new-name>" }
  ]'
```

### Delete

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CrmService/ContactGroups/<group-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contact Profiles (standalone resource)

### List / Count

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles/<profile-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<contact-guid>",
    "type": "<profile-type>",
    "about": "<about>",
    "data": "<value>",
    "dataLabel": "<label>"
  }'
```

**`ContactProfileCreateDto` fields:** `id`, `timestamp`, `type`, `contactId`, `about`,
`avatarUrl`, and the ten `data`/`dataLabel` slots (`data`…`data9`).

### Update (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles/<profile-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "<profile-type>",
    "about": "<about>",
    "data": "<value>",
    "dataLabel": "<label>"
  }'
```

**`ContactProfileUpdateDto` fields:** `type`, `contactId`, `about`, `avatarUrl`, and the ten
`data`/`dataLabel` slots (`data`…`data9`).

### Patch (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles/<profile-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/about", "value": "<new-about>" }
  ]'
```

### Delete

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CrmService/ContactProfiles/<profile-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contact Relations

A typed link between two contacts: `contactId` → `relatedContactId`, classified by
`contactRelationTypeId`.

### List / Count

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelations/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelations/<relation-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<contact-guid>",
    "relatedContactId": "<related-contact-guid>",
    "contactRelationTypeId": "<relation-type-guid>"
  }'
```

**`ContactRelationCreateDto` fields:** `id`, `timestamp`, `contactId`, `relatedContactId`, `contactRelationTypeId`.

### Update (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelations/<relation-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<contact-guid>",
    "relatedContactId": "<related-contact-guid>",
    "contactRelationTypeId": "<relation-type-guid>"
  }'
```

**`ContactRelationUpdateDto` fields:** `contactId`, `relatedContactId`, `contactRelationTypeId`.

### Patch (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelations/<relation-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/contactRelationTypeId", "value": "<new-relation-type-guid>" }
  ]'
```

### Delete

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelations/<relation-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contact Relation Types

### List / Count

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelationTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelationTypes/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelationTypes/<relation-type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelationTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<relation-name>",
    "backName": "<inverse-relation-name>",
    "description": "<description>"
  }'
```

**`ContactRelationTypeCreateDto` fields** (`name` **required**): `id`, `timestamp`, `name`, `backName`, `description`.

### Update (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelationTypes/<relation-type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<relation-name>",
    "backName": "<inverse-relation-name>",
    "description": "<description>"
  }'
```

**`ContactRelationTypeUpdateDto` fields** (`name` **required**): `name`, `backName`, `description`.

### Patch (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelationTypes/<relation-type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/backName", "value": "<new-inverse-name>" }
  ]'
```

### Delete

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelationTypes/<relation-type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Contact Sources

### List / Count

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactSources?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactSources/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/ContactSources/<source-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/ContactSources?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<source-name>",
    "description": "<description>"
  }'
```

**`ContactSourceCreateDto` fields** (`name` **required**): `id`, `timestamp`, `name`, `description`.

### Update (PUT)

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/ContactSources/<source-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<source-name>",
    "description": "<description>"
  }'
```

**`ContactSourceUpdateDto` fields** (`name` **required**): `name`, `description`.

### Patch (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CrmService/ContactSources/<source-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/description", "value": "<new-description>" }
  ]'
```

### Delete

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/CrmService/ContactSources/<source-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Sync Operations

Synchronize the current user, another user, or a tenant into a tenant's contact list. Each
requires `?tenantId=<tenant-guid>` (the target tenant).

```bash
# Sync the current user into the current tenant's contact list
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Sync?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Sync the current user into a (target) tenant's contact list
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Sync/Me?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Sync a specific user into a tenant's contact list
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Sync/User?tenantId=<tenant-guid>&relatedUserId=<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Sync a tenant into another tenant's contact list
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Sync/Tenant?tenantId=<tenant-guid>&relatedTenantId=<related-tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## PATCH (JSON Patch RFC 6902)

PATCH endpoints take a JSON **array** of operations (`Content-Type: application/json`). Use
them for atomic partial edits — safer than PUT when only a couple of fields change.
`op` ∈ `add | remove | replace | move | copy | test`; `path`/`from` are JSON-Pointer with a
leading slash and camelCase field names (e.g. `/firstName`, `/value`, `/name`).

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/jobTitle", "value": "<new-job-title>" },
    { "op": "add", "path": "/about", "value": "<bio>" }
  ]'
```

**Resources that support PATCH:** Contacts (`/Contacts/{contactId}`), contact emails
(`/Contacts/{contactId}/Emails/{emailId}`), contact options
(`/Contacts/{contactId}/Options/{optionId}` and `…/Options/Key/{key}`), Contact Groups,
Contact Profiles (standalone), Contact Relations, Contact Relation Types, and Contact Sources.

> The nested contact-profile sub-resource (`/Contacts/{contactId}/Profiles/{profileId}`) is
> PUT/DELETE only — it has **no** PATCH. Use the standalone `/ContactProfiles/{id}` PATCH
> instead.

## End-to-End Workflow

```bash
# 1. Create an individual contact (note the returned contact ID in result)
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "type": "Individual", "firstName": "<first-name>", "email": "<email>", "jobTitle": "<job-title>" }'

# 2. Add an email address
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails/Addresses?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "address": "<email>", "label": "Work", "isPrimary": true }'

# 3. Set metadata via upsert option by key
curl -X PUT "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Options/Upsert/<key>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "key": "<key>", "value": "<value>" }'

# 4. Relate the contact to another contact
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/ContactRelations?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "contactId": "<contact-guid>", "relatedContactId": "<related-contact-guid>", "contactRelationTypeId": "<relation-type-guid>" }'

# 5. Patch a single field
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/jobTitle", "value": "<new-job-title>" } ]'

# 6. Send a transactional email
curl -X POST "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Emails/Send" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "<subject>", "message": "<body>", "culture": "en-US", "uiCulture": "en-US", "recipients": ["<email>"] }'

# 7. Verify
curl -X GET "$ABSUITE_HOST_URL/api/v2/CrmService/Contacts/<contact-guid>/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| List contacts | GET | `/api/v2/CrmService/Contacts` |
| Count contacts | GET | `/api/v2/CrmService/Contacts/Count` |
| List extended contacts | GET | `/api/v2/CrmService/Contacts/Extended` |
| Create contact | POST | `/api/v2/CrmService/Contacts` |
| Get contact | GET | `/api/v2/CrmService/Contacts/{contactId}` |
| Get extended contact | GET | `/api/v2/CrmService/Contacts/{contactId}/Extended` |
| Update contact | PUT | `/api/v2/CrmService/Contacts/{contactId}` |
| Patch contact | PATCH | `/api/v2/CrmService/Contacts/{contactId}` |
| Delete contact | DELETE | `/api/v2/CrmService/Contacts/{contactId}` |
| Upsert user as contact | POST | `/api/v2/CrmService/Contacts/Individuals/Upsert` |
| Upsert tenant as contact | POST | `/api/v2/CrmService/Contacts/Organizations/Upsert` |
| List individuals | GET | `/api/v2/CrmService/Contacts/Individuals` |
| Count individuals | GET | `/api/v2/CrmService/Contacts/Individuals/Count` |
| List extended individuals | GET | `/api/v2/CrmService/Contacts/Individuals/Extended` |
| Get individual | GET | `/api/v2/CrmService/Contacts/Individuals/{contactId}` |
| Individual → individuals | GET | `/api/v2/CrmService/Contacts/Individuals/{contactId}/Individuals` |
| Individual → organizations | GET | `/api/v2/CrmService/Contacts/Individuals/{contactId}/Organizations` |
| List organizations | GET | `/api/v2/CrmService/Contacts/Organizations` |
| Count organizations | GET | `/api/v2/CrmService/Contacts/Organizations/Count` |
| List extended organizations | GET | `/api/v2/CrmService/Contacts/Organizations/Extended` |
| Get organization | GET | `/api/v2/CrmService/Contacts/Organizations/{contactId}` |
| Organization → individuals | GET | `/api/v2/CrmService/Contacts/Organizations/{contactId}/Individuals` |
| Organization → organizations | GET | `/api/v2/CrmService/Contacts/Organizations/{contactId}/Organizations` |
| Get contact wallet | GET | `/api/v2/CrmService/Contacts/{contactId}/Wallet` |
| Get contact cart | GET | `/api/v2/CrmService/Contacts/{contactId}/Cart` |
| Get social profile | GET | `/api/v2/CrmService/Contacts/{contactId}/SocialProfile` |
| Get avatar | GET | `/api/v2/CrmService/Contacts/{contactId}/Avatar` |
| Update avatar | POST | `/api/v2/CrmService/Contacts/{contactId}/Avatar` |
| List contact emails | GET | `/api/v2/CrmService/Contacts/{contactId}/Emails` |
| Count contact emails | GET | `/api/v2/CrmService/Contacts/{contactId}/Emails/Count` |
| Add contact email | POST | `/api/v2/CrmService/Contacts/{contactId}/Emails/Addresses` |
| Get/Update contact email | PUT | `/api/v2/CrmService/Contacts/{contactId}/Emails/{emailId}` |
| Patch contact email | PATCH | `/api/v2/CrmService/Contacts/{contactId}/Emails/{emailId}` |
| Delete contact email | DELETE | `/api/v2/CrmService/Contacts/{contactId}/Emails/{emailId}` |
| Verify contact email | POST | `/api/v2/CrmService/Contacts/{contactId}/Emails/{emailId}/Verify` |
| Send contact email | POST | `/api/v2/CrmService/Contacts/{contactId}/Emails/Send` |
| Preview contact email | POST | `/api/v2/CrmService/Contacts/{contactId}/Emails/Preview` |
| List contact profiles (nested) | GET | `/api/v2/CrmService/Contacts/{contactId}/Profiles` |
| Count contact profiles (nested) | GET | `/api/v2/CrmService/Contacts/{contactId}/Profiles/Count` |
| Create contact profile (nested) | POST | `/api/v2/CrmService/Contacts/{contactId}/Profiles` |
| Update contact profile (nested) | PUT | `/api/v2/CrmService/Contacts/{contactId}/Profiles/{profileId}` |
| Delete contact profile (nested) | DELETE | `/api/v2/CrmService/Contacts/{contactId}/Profiles/{profileId}` |
| List contact options | GET | `/api/v2/CrmService/Contacts/{contactId}/Options` |
| Count contact options | GET | `/api/v2/CrmService/Contacts/{contactId}/Options/Count` |
| Create contact option | POST | `/api/v2/CrmService/Contacts/{contactId}/Options` |
| Get option by ID | GET | `/api/v2/CrmService/Contacts/{contactId}/Options/{optionId}` |
| Update option | PUT | `/api/v2/CrmService/Contacts/{contactId}/Options/{optionId}` |
| Patch option | PATCH | `/api/v2/CrmService/Contacts/{contactId}/Options/{optionId}` |
| Delete option | DELETE | `/api/v2/CrmService/Contacts/{contactId}/Options/{optionId}` |
| Get option by key | GET | `/api/v2/CrmService/Contacts/{contactId}/Options/Key/{key}` |
| Patch option by key | PATCH | `/api/v2/CrmService/Contacts/{contactId}/Options/Key/{key}` |
| Upsert option by key | PUT | `/api/v2/CrmService/Contacts/{contactId}/Options/Upsert/{key}` |
| List contact groups | GET | `/api/v2/CrmService/ContactGroups` |
| Count contact groups | GET | `/api/v2/CrmService/ContactGroups/Count` |
| Create contact group | POST | `/api/v2/CrmService/ContactGroups` |
| Get contact group | GET | `/api/v2/CrmService/ContactGroups/{id}` |
| Update contact group | PUT | `/api/v2/CrmService/ContactGroups/{id}` |
| Patch contact group | PATCH | `/api/v2/CrmService/ContactGroups/{id}` |
| Delete contact group | DELETE | `/api/v2/CrmService/ContactGroups/{id}` |
| List contact profiles | GET | `/api/v2/CrmService/ContactProfiles` |
| Count contact profiles | GET | `/api/v2/CrmService/ContactProfiles/Count` |
| Create contact profile | POST | `/api/v2/CrmService/ContactProfiles` |
| Get contact profile | GET | `/api/v2/CrmService/ContactProfiles/{id}` |
| Update contact profile | PUT | `/api/v2/CrmService/ContactProfiles/{id}` |
| Patch contact profile | PATCH | `/api/v2/CrmService/ContactProfiles/{id}` |
| Delete contact profile | DELETE | `/api/v2/CrmService/ContactProfiles/{id}` |
| List contact relations | GET | `/api/v2/CrmService/ContactRelations` |
| Count contact relations | GET | `/api/v2/CrmService/ContactRelations/Count` |
| Create contact relation | POST | `/api/v2/CrmService/ContactRelations` |
| Get contact relation | GET | `/api/v2/CrmService/ContactRelations/{id}` |
| Update contact relation | PUT | `/api/v2/CrmService/ContactRelations/{id}` |
| Patch contact relation | PATCH | `/api/v2/CrmService/ContactRelations/{id}` |
| Delete contact relation | DELETE | `/api/v2/CrmService/ContactRelations/{id}` |
| List relation types | GET | `/api/v2/CrmService/ContactRelationTypes` |
| Count relation types | GET | `/api/v2/CrmService/ContactRelationTypes/Count` |
| Create relation type | POST | `/api/v2/CrmService/ContactRelationTypes` |
| Get relation type | GET | `/api/v2/CrmService/ContactRelationTypes/{id}` |
| Update relation type | PUT | `/api/v2/CrmService/ContactRelationTypes/{id}` |
| Patch relation type | PATCH | `/api/v2/CrmService/ContactRelationTypes/{id}` |
| Delete relation type | DELETE | `/api/v2/CrmService/ContactRelationTypes/{id}` |
| List contact sources | GET | `/api/v2/CrmService/ContactSources` |
| Count contact sources | GET | `/api/v2/CrmService/ContactSources/Count` |
| Create contact source | POST | `/api/v2/CrmService/ContactSources` |
| Get contact source | GET | `/api/v2/CrmService/ContactSources/{id}` |
| Update contact source | PUT | `/api/v2/CrmService/ContactSources/{id}` |
| Patch contact source | PATCH | `/api/v2/CrmService/ContactSources/{id}` |
| Delete contact source | DELETE | `/api/v2/CrmService/ContactSources/{id}` |
| Sync current user → current tenant | POST | `/api/v2/CrmService/Sync` |
| Sync current user → tenant | POST | `/api/v2/CrmService/Sync/Me` |
| Sync user → tenant | POST | `/api/v2/CrmService/Sync/User` |
| Sync tenant → tenant | POST | `/api/v2/CrmService/Sync/Tenant` |

## Critical Rules

- **Pass `?tenantId=<tenant-guid>` on every request** (GET, POST, PUT, PATCH, DELETE). The
  only relaxations: `POST .../Contacts` and `POST .../Contacts/{contactId}/Avatar` treat
  `tenantId` as optional, and the email `Send`/`Preview` actions do not bind it. The
  `X-TenantId: <tenant-guid>` header is an accepted equivalent.
- **`type` is `Individual` or `Organization`** — a string enum, never a numeric code.
- **`type`, `firstName`, and `email` are required** to create or update a contact.
- **Check `isSuccess`** in the envelope; read data from `result`.
- **Prefer PATCH for partial edits** over PUT to avoid clobbering unsent fields.
- **Never hard-code real GUIDs, emails, or credentials** — use placeholders and values from
  API responses.
- For the CLI equivalent (no PATCH, no curl), see `absuite-contacts-cli`.
