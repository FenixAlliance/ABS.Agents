---
name: absuite-storage
key: paperclip/skills/absuite-storage/SKILL.md
version: 1.0.0
description: >
  Manage file storage, uploads, downloads, and avatars in the Alliance Business Suite
  (ABS) via the REST API (StorageService). Covers file records, counts, thumbnails, raw
  downloads, blob browsing, rich-text editor uploads and editor assets, and avatars for
  social profiles, contacts, users, and tenants. PATCH is not available on this service.
  All operations require a bearer token (see the absuite-login skill to authenticate),
  except serving a published editor asset.
---

# Alliance Business Suite: Storage Skill (REST)

Drive the ABS **StorageService** purely over HTTP with `curl`. The service handles
durable file records (`Files`), low-level blob browsing (`Blobs`), a generic upload
sink (`Uploads`), rich-text editor uploads (`/api/v2/fs/radzen/...`), editor assets
(`EditorAssets`), and avatar get/update for social profiles, contacts, users, and tenants.

> For the CLI equivalent, see `absuite-storage-cli`. For general REST conventions
> across all ABS services, see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select`: page through results, don't fetch-all-and-filter. The dedicated `Files/Count` endpoint returns an integer and is **also** filterable (`?$filter=...` gives a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource**: it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) causes silent data loss.
- **`PATCH` is not exposed by this service** (see the PATCH section below).

## Authentication

All calls require a bearer token (the only exception is `GET /EditorAssets/{fileId}`, below).

1. **Obtain a token**: `POST $ABSUITE_HOST_URL/login` with a JSON body
   `{"email":"...","password":"..."}`. The response contains `accessToken`.
2. **Send it** on every request: `-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"`.
3. **Base path**: `$ABSUITE_HOST_URL/api/v2/StorageService/<Resource>` (the editor upload
   endpoints use `$ABSUITE_HOST_URL/api/v2/fs/radzen/...`).

```bash
export ABSUITE_ACCESS_TOKEN=$(
  curl -s -X POST "$ABSUITE_HOST_URL/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"<your-email>","password":"<your-password>"}' \
  | jq -r '.accessToken'
)
```

## Response envelope

JSON endpoints return the standard envelope:

```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "<guid>",
  "timestamp": "<iso-8601>",
  "result": <data|array|null>
}
```

Always check `isSuccess`; read the payload from `result`. Exceptions: `Files/{fileId}/Raw`,
`Files/{fileId}/Thumbnail`, avatar GETs and `EditorAssets/{fileId}` return **raw bytes**,
and the editor upload endpoints return a small un-enveloped JSON object (see below).

## Key concepts

- **Tenant scoping is per-endpoint**: read it from each operation below.
  - `Files/*`, `Blobs/*`, `Uploads` and `Avatars/Contacts/{contactId}` (update) accept an
    **optional** `?tenantId=<tenant-guid>`. Omit it to use the caller's own (user) scope; pass
    it to target a tenant. The header form `X-TenantId: <tenant-guid>` is equivalent.
  - The editor upload endpoints take the tenant as a **path** segment
    (`/api/v2/fs/radzen/tenants/{tenantId}/...`), or no tenant at all for the `users/...` routes.
  - `EditorAssets/resolve` takes a **required** `?tenantId=<tenant-guid>`.
  - The remaining avatar endpoints (`Avatars/{socialProfileId}`, `Avatars/Contact/{contactId}`,
    `Avatars/Tenant/{tenantId}` get **and** update, `Avatars/User`, `Avatars/User/{userId}`)
    take **no** `tenantId` query param: they are keyed by their path id (or the JWT, for
    the current-user avatar). `{tenantId}` in the Tenant-avatar paths is a **path** segment
    identifying the tenant whose avatar you want, not the tenant-scoping query param.
- **Files vs Uploads vs editor uploads**:
  - `Files` is the managed file-record resource (list/count/get/create/update/delete/download/thumbnail).
  - `Uploads` (`POST /Uploads`) is a single multipart upload sink that saves a file.
  - `/api/v2/fs/radzen/...` are the rich-text editor upload endpoints (single file, image).
- **Blobs** is a low-level browse over the underlying blob store: list a folder
  (`GET /Blobs`) or fetch one blob's metadata by path (`GET /Blobs/Single?filePath=...`).
- **Uploads are multipart/form-data**: use `curl -F`, not a JSON `-d` body. The multipart
  field name for file content is `file` (Files, Uploads, editor uploads) and `Avatar` for
  avatar updates.
- **Every upload is checked and scanned**: size and type rules apply, and files are
  malware-scanned before they are served.
- **API version**: every endpoint also accepts an optional `api-version` query param
  or `x-api-version` header. Omit unless you need to pin a version.

---

## Files

### List files

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`tenantId` is optional. Returns the file records in `result`.

### Count files

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Returns an integer; accepts `$filter`.

### Get a file record

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files/<file-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a file record (multipart upload)

`POST /Files` is `multipart/form-data`. Body fields (`PayloadFileUploadCreateDto`):
`notes`, `title`, `author`, `isFolder`, `fileName`, `abstract`, `keyWords`, `validResponse`,
`parentFileUploadId`, `filePath`, `publicAccessType` (`Off` default, `Container`, `Blob`),
`purpose` (optional placement intent, e.g. `RecordAttachment`), `socialProfileId`, and `file`
(the binary content). All are optional. `parentFileUploadId`, when set, must be a folder you
own in the same scope; anything else answers not found.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/Files?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "title=Quarterly Report" \
  -F "fileName=q3-report.pdf" \
  -F "author=Finance" \
  -F "keyWords=report,finance,q3" \
  -F "isFolder=false" \
  -F "file=@/path/to/q3-report.pdf"
```

### Update a file record (PUT, multipart)

`PUT /Files/{fileId}` is `multipart/form-data`. Body fields (`PayloadFileUploadUpdateDto`):
`notes`, `metadata`, `title`, `author`, `isFolder`, `fileName`, `abstract`, `keyWords`,
`validResponse`, `parentFileUploadID`, `filePath`, `file`. (Note: create uses
`parentFileUploadId`; update uses `parentFileUploadID`: transcribe exactly as shown.) A changed
`parentFileUploadID` must name a folder you own; sending the current value or clearing it is allowed.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/StorageService/Files/<file-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "title=Quarterly Report (final)" \
  -F "notes=Approved by review board" \
  -F "metadata={\"version\":\"final\"}" \
  -F "file=@/path/to/q3-report-final.pdf"
```

### Delete a file record

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/StorageService/Files/<file-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Download raw file bytes

`GET /Files/{fileId}/Raw` returns the file content itself (not an envelope). Write it
to disk with `-o`.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files/<file-guid>/Raw?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -o downloaded_file
```

### Get a file's thumbnail

`GET /Files/{fileId}/Thumbnail` returns the thumbnail image bytes (not an envelope).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files/<file-guid>/Thumbnail?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -o thumbnail.png
```

---

## Blobs

### List blobs in a folder

`GET /Blobs` browses the underlying blob store. Query params: `tenantId`, `folderPath`,
`browseFilter`, `filePrefix`, `recurse` (bool), `maxResults` (int), `includeAttributes`
(bool), all optional.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Blobs?tenantId=<tenant-guid>&folderPath=reports&recurse=true&maxResults=50&includeAttributes=true" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a single blob by path

`GET /Blobs/Single` fetches one blob's metadata. Query params: `tenantId`, `filePath`,
both optional. (Identify the blob by `filePath`, not by an id.)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Blobs/Single?tenantId=<tenant-guid>&filePath=reports/q3-report.pdf" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Uploads (generic save)

`POST /Uploads` saves a single file to tenant or user storage (multipart/form-data).
Query: `tenantId` (optional). It takes the same form fields as `POST /Files`; the simplest
call provides just the file part:

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/Uploads?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/file.xlsx"
```

---

## Rich-text editor uploads

These power inline uploads from the rich-text editor. They live under
`/api/v2/fs/radzen` (not under StorageService), are `multipart/form-data` with the content in
the `file` part, and return an un-enveloped JSON object.

| Upload | Method | Path | Returns |
|---|---|---|---|
| Single file (tenant) | POST | `/api/v2/fs/radzen/tenants/{tenantId}/upload/single` | `{ "completed": true }` |
| Single file (tenant record) | POST | `/api/v2/fs/radzen/tenants/{tenantId}/{recordType}/{recordId}/upload/single` | `{ "completed": true }` |
| Image (tenant) | POST | `/api/v2/fs/radzen/tenants/{tenantId}/upload/image` | `{ "url": "..." }` |
| Image (tenant record) | POST | `/api/v2/fs/radzen/tenants/{tenantId}/{recordType}/{recordId}/upload/image` | `{ "url": "..." }` |
| Image (current user) | POST | `/api/v2/fs/radzen/users/upload/image` | `{ "url": "..." }` |
| Image (current user record) | POST | `/api/v2/fs/radzen/users/{recordType}/{recordId}/upload/image` | `{ "url": "..." }` |

Image uploads accept optional query params: `visibility` (`public` makes the image publicly
servable; anything else keeps it private), `socialProfileId`, and `purpose`. The chunked
`PUT .../upload/stream` routes exist but answer **501 Not Implemented**; do not use them.

```bash
# Upload an image for a tenant's editor, kept private
curl -X POST "$ABSUITE_HOST_URL/api/v2/fs/radzen/tenants/<tenant-guid>/upload/image" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/image.jpg"

# Upload a single file into a record's editor (for example a WebPortal)
curl -X POST "$ABSUITE_HOST_URL/api/v2/fs/radzen/tenants/<tenant-guid>/WebPortal/<portal-guid>/upload/single" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/file.pdf"
```

---

## Editor assets

### Serve an editor asset

`GET /EditorAssets/{fileId}` serves an image embedded in published content. It is the one
anonymous endpoint on this service: an asset only becomes reachable once the page that embeds
it is published.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/EditorAssets/<file-guid>" -o asset.png
```

### Resolve a file-manager selection for embedding

`POST /EditorAssets/resolve?tenantId=<tenant-guid>` (required `tenantId`) turns a file-manager
selection into its file id and a private, authenticated preview URL. It is read-only and never
changes visibility. JSON body: `recordType`, `recordId`, `target` (the file-manager selection
hash). A selection outside that record's storage, or with no catalogued file, answers 404.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/EditorAssets/resolve?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recordType":"WebPortal","recordId":"<portal-guid>","target":"<selection-hash>"}'
```

---

## Avatars

Avatars are keyed by their path id (social profile, contact, user, tenant) or by the
JWT for the current user. Get endpoints return image bytes; update endpoints are `POST`
multipart with the file in the `Avatar` part.

> Tenant scoping: only `POST /Avatars/Contacts/{contactId}` (update contact avatar)
> accepts an optional `?tenantId=<tenant-guid>`. The other avatar endpoints take no
> tenant query/header.

### Current user's avatar

```bash
# Get
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/User" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update (current user)
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/User" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "Avatar=@/path/to/avatar.png"
```

### Avatar for a specific user (by user id)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/User/<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Contact avatar

```bash
# Get
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/Contact/<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update (path is plural "Contacts"; tenantId optional)
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/Contacts/<contact-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "Avatar=@/path/to/avatar.png"
```

### Tenant avatar

`{tenantId}` here is a path segment identifying the tenant, not the tenant-scope query.

```bash
# Get
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/Tenant/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/Tenant/<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "Avatar=@/path/to/logo.png"
```

### Social profile avatar

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/<social-profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## PATCH (not available)

StorageService exposes **no PATCH / JSON Patch endpoints**. To modify a file record,
use `PUT /Files/{fileId}` (multipart), sending the full set of fields you want kept.
No other resource on this service supports partial updates.

---

## End-to-end workflow: store, inspect, update, download

```bash
# 1) Create a managed file record with content (multipart)
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/Files?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "title=Onboarding Packet" \
  -F "fileName=onboarding.pdf" \
  -F "keyWords=hr,onboarding" \
  -F "file=@/path/to/onboarding.pdf"

# 2) List files to find the new record's id (read result[].id)
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 3) Update its metadata (PUT, multipart; send every field you want to keep)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/StorageService/Files/<file-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "title=Onboarding Packet (2026)" \
  -F "fileName=onboarding.pdf" \
  -F "keyWords=hr,onboarding" \
  -F "notes=Updated for the 2026 cohort"

# 4) Download the raw bytes
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files/<file-guid>/Raw?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -o onboarding.pdf

# 5) Delete it when done
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/StorageService/Files/<file-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| List files | GET | `/api/v2/StorageService/Files` |
| Count files | GET | `/api/v2/StorageService/Files/Count` |
| Get file record | GET | `/api/v2/StorageService/Files/{fileId}` |
| Create file record (multipart) | POST | `/api/v2/StorageService/Files` |
| Update file record (multipart) | PUT | `/api/v2/StorageService/Files/{fileId}` |
| Delete file record | DELETE | `/api/v2/StorageService/Files/{fileId}` |
| Download raw file bytes | GET | `/api/v2/StorageService/Files/{fileId}/Raw` |
| Get file thumbnail | GET | `/api/v2/StorageService/Files/{fileId}/Thumbnail` |
| List blobs in a folder | GET | `/api/v2/StorageService/Blobs` |
| Get single blob by path | GET | `/api/v2/StorageService/Blobs/Single` |
| Save (upload) a file | POST | `/api/v2/StorageService/Uploads` |
| Editor: upload single file | POST | `/api/v2/fs/radzen/tenants/{tenantId}[/{recordType}/{recordId}]/upload/single` |
| Editor: upload image (tenant) | POST | `/api/v2/fs/radzen/tenants/{tenantId}[/{recordType}/{recordId}]/upload/image` |
| Editor: upload image (current user) | POST | `/api/v2/fs/radzen/users[/{recordType}/{recordId}]/upload/image` |
| Serve editor asset (anonymous) | GET | `/api/v2/StorageService/EditorAssets/{fileId}` |
| Resolve editor asset selection | POST | `/api/v2/StorageService/EditorAssets/resolve` |
| Get current user's avatar | GET | `/api/v2/StorageService/Avatars/User` |
| Update current user's avatar | POST | `/api/v2/StorageService/Avatars/User` |
| Get user avatar (by id) | GET | `/api/v2/StorageService/Avatars/User/{userId}` |
| Get contact avatar | GET | `/api/v2/StorageService/Avatars/Contact/{contactId}` |
| Update contact avatar | POST | `/api/v2/StorageService/Avatars/Contacts/{contactId}` |
| Get tenant avatar | GET | `/api/v2/StorageService/Avatars/Tenant/{tenantId}` |
| Update tenant avatar | POST | `/api/v2/StorageService/Avatars/Tenant/{tenantId}` |
| Get social profile avatar | GET | `/api/v2/StorageService/Avatars/{socialProfileId}` |
| PATCH (any resource) | n/a | Not available on StorageService |

## Critical rules

- **Authenticate first** and send `Authorization: Bearer $ABSUITE_ACCESS_TOKEN` on
  every call (only `GET /EditorAssets/{fileId}` is anonymous).
- **Uploads are multipart**: use `-F`, never a JSON `-d` body. Field names matter:
  `file` (Files, Uploads, editor uploads) and `Avatar` (avatar updates).
- **`Files/{fileId}/Raw`, `Files/{fileId}/Thumbnail`, avatar GETs and editor assets return
  bytes**, not an envelope: capture with `-o`.
- **Tenant scoping**: optional `tenantId` (query or `X-TenantId` header) on Files, Blobs,
  Uploads and the contact-avatar update; a path segment on the editor uploads; required on
  `EditorAssets/resolve`. The other avatar endpoints ignore a tenant query/header.
- **Folders are ownership-checked**: a parent folder must be one you own in the same scope.
- **No PATCH** on this service. Use `PUT /Files/{fileId}` for file-record edits.
