---
name: absuite-storage
description: >
  Manage file storage, uploads, downloads, and avatars in the Alliance Business Suite
  (ABS) via the REST API (StorageService). Covers file records, raw downloads, blob
  browsing, RadzenEditor uploads, and avatars for social profiles, contacts, users,
  and tenants. PATCH is not available on this service. All operations require a bearer
  token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Storage Skill (REST)

Drive the ABS **StorageService** purely over HTTP with `curl`. The service handles
durable file records (`Files`), low-level blob browsing (`Blobs`), inline editor
uploads (`RadzenEditor/Uploads`), a generic upload sink (`Uploads`), and avatar
get/update for social profiles, contacts, users, and tenants.

> For the CLI equivalent, see `absuite-storage-cli`. For general REST conventions
> across all ABS services, see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select` — page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource** — it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) causes silent data loss.
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902) — it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

## Authentication

All calls require a bearer token.

1. **Obtain a token** — `POST $ABSUITE_HOST_URL/login` with a JSON body
   `{"email":"...","password":"..."}`. The response contains `accessToken`.
2. **Send it** on every request: `-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"`.
3. **Base path** — `$ABSUITE_HOST_URL/api/v2/StorageService/<Resource>`.

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

Always check `isSuccess`; read the payload from `result`. Note that some upload
endpoints (RadzenEditor `Single`/`Multiple`/`Image`/`Specific`/`{id}`) return an
empty body, and `Files/{fileId}/Raw` returns the **raw file bytes**, not an envelope.

## Key concepts

- **Tenant scoping is per-endpoint** — read it from each operation below.
  - `Files/*`, `Blobs/*`, `Uploads`, all `RadzenEditor/Uploads/*`, and
    `Avatars/Contacts/{contactId}` (update) accept an **optional** `?tenantId=<tenant-guid>`.
    Omit it to use the caller's default scope; pass it to target a specific tenant.
    The header form `X-TenantId: <tenant-guid>` is equivalent.
  - The remaining avatar endpoints (`Avatars/{socialProfileId}`, `Avatars/Contact/{contactId}`,
    `Avatars/Tenant/{tenantId}` get **and** update, `Avatars/User`, `Avatars/User/{userId}`)
    take **no** `tenantId` query param — they are keyed by their path id (or the JWT, for
    the current-user avatar). Do not add a tenant query/header to these; it is ignored.
    Note: `{tenantId}` in the Tenant-avatar paths is a **path** segment identifying the
    tenant whose avatar you want — not the tenant-scoping query param.
- **Files vs Uploads vs RadzenEditor**:
  - `Files` is the managed file-record resource (list/get/create/update/delete/download).
  - `Uploads` (`POST /Uploads`) is a single multipart upload sink that saves a file.
  - `RadzenEditor/Uploads/*` are the inline rich-text-editor upload endpoints
    (single, multiple, image, specific, and by resource id).
- **Blobs** is a low-level browse over the underlying blob store: list a folder
  (`GET /Blobs`) or fetch one blob's metadata by path (`GET /Blobs/Single?filePath=...`).
- **Uploads are multipart/form-data** — use `curl -F`, not a JSON `-d` body. The
  multipart field name for file content on `Files`/`Uploads` create is `file`; for
  RadzenEditor single/image/specific it is `File`; for multiple/by-id it is `Files`
  (repeat the flag per file); for avatar updates it is `Avatar`.
- **API version** — every endpoint also accepts an optional `api-version` query param
  or `x-api-version` header. Omit unless you need to pin a version.
- **PATCH is not available** on StorageService — there are no JSON Patch endpoints.
  Use `PUT /Files/{fileId}` to update a file record.

---

## Files

### List files

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`tenantId` is optional. Returns the file records in `result`.

### Get a file record

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files/<file-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a file record (multipart upload)

`POST /Files` is `multipart/form-data`. Body fields (`PayloadFileUploadCreateDto`):
`id`, `timestamp`, `notes`, `title`, `author`, `isFolder`, `fileName`, `abstract`,
`keyWords`, `validResponse`, `parentFileUploadId`, `filePath`, `file`. The binary
content goes in the `file` part; all are optional.

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
`parentFileUploadId`; update uses `parentFileUploadID` — transcribe exactly as shown.)

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

---

## Blobs

### List blobs in a folder

`GET /Blobs` browses the underlying blob store. Query params: `tenantId`, `folderPath`,
`browseFilter`, `filePrefix`, `recurse` (bool), `maxResults` (int), `includeAttributes`
(bool) — all optional.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Blobs?tenantId=<tenant-guid>&folderPath=reports&recurse=true&maxResults=50&includeAttributes=true" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a single blob by path

`GET /Blobs/Single` fetches one blob's metadata. Query params: `tenantId`, `filePath`
— both optional. (Identify the blob by `filePath`, not by an id.)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Blobs/Single?tenantId=<tenant-guid>&filePath=reports/q3-report.pdf" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Uploads (generic save)

`POST /Uploads` saves a single file to tenant or user storage (multipart/form-data).
Query: `tenantId` (optional). The simplest call provides just the file part:

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/Uploads?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/file.xlsx"
```

Additional optional form fields exist for metadata (e.g. `title`, `notes`, `author`,
`fileName`, `keyWords`, `isFolder`, `filePath`, `parentFileUploadId`, `timestamp`).
Provide only what you need.

---

## RadzenEditor uploads

These power inline uploads from the rich-text editor. All are `POST`,
`multipart/form-data`, and accept an optional `?tenantId=<tenant-guid>`. Most return
an empty body (the URL/result is consumed by the editor).

### Upload a single file

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/RadzenEditor/Uploads/Single?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "File=@/path/to/file.pdf"
```

### Upload an image

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/RadzenEditor/Uploads/Image?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "File=@/path/to/image.jpg"
```

### Upload a specific file

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/RadzenEditor/Uploads/Specific?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "File=@/path/to/file.docx"
```

### Upload multiple files

The file part is `Files`; repeat the flag once per file.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/RadzenEditor/Uploads/Multiple?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "Files=@/path/to/file1.pdf" \
  -F "Files=@/path/to/file2.png"
```

### Upload files by resource id

`POST /RadzenEditor/Uploads/{id}` attaches files to a specific resource id (path param).
Query: `tenantId` (optional). File part is `Files` (repeatable).

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/RadzenEditor/Uploads/<id>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "Files=@/path/to/file.pdf"
```

---

## Avatars

Avatars are keyed by their path id (social profile, contact, user, tenant) or by the
JWT for the current user. Get endpoints return image bytes / an envelope; update
endpoints are `POST` multipart with the file in the `Avatar` part.

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
use `PUT /Files/{fileId}` (multipart) with the fields you want to change. No other
resource on this service supports partial updates.

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

# 2) List files to find the new record's id (read result[].* )
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 3) Update its metadata (PUT, multipart)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/StorageService/Files/<file-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "title=Onboarding Packet (2026)" \
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
| Get file record | GET | `/api/v2/StorageService/Files/{fileId}` |
| Create file record (multipart) | POST | `/api/v2/StorageService/Files` |
| Update file record (multipart) | PUT | `/api/v2/StorageService/Files/{fileId}` |
| Delete file record | DELETE | `/api/v2/StorageService/Files/{fileId}` |
| Download raw file bytes | GET | `/api/v2/StorageService/Files/{fileId}/Raw` |
| List blobs in a folder | GET | `/api/v2/StorageService/Blobs` |
| Get single blob by path | GET | `/api/v2/StorageService/Blobs/Single` |
| Save (upload) a file | POST | `/api/v2/StorageService/Uploads` |
| Editor: upload single file | POST | `/api/v2/StorageService/RadzenEditor/Uploads/Single` |
| Editor: upload image | POST | `/api/v2/StorageService/RadzenEditor/Uploads/Image` |
| Editor: upload specific file | POST | `/api/v2/StorageService/RadzenEditor/Uploads/Specific` |
| Editor: upload multiple files | POST | `/api/v2/StorageService/RadzenEditor/Uploads/Multiple` |
| Editor: upload files by id | POST | `/api/v2/StorageService/RadzenEditor/Uploads/{id}` |
| Get current user's avatar | GET | `/api/v2/StorageService/Avatars/User` |
| Update current user's avatar | POST | `/api/v2/StorageService/Avatars/User` |
| Get user avatar (by id) | GET | `/api/v2/StorageService/Avatars/User/{userId}` |
| Get contact avatar | GET | `/api/v2/StorageService/Avatars/Contact/{contactId}` |
| Update contact avatar | POST | `/api/v2/StorageService/Avatars/Contacts/{contactId}` |
| Get tenant avatar | GET | `/api/v2/StorageService/Avatars/Tenant/{tenantId}` |
| Update tenant avatar | POST | `/api/v2/StorageService/Avatars/Tenant/{tenantId}` |
| Get social profile avatar | GET | `/api/v2/StorageService/Avatars/{socialProfileId}` |
| PATCH (any resource) | — | Not available on StorageService |

## Critical rules

- **Authenticate first** and send `Authorization: Bearer $ABSUITE_ACCESS_TOKEN` on
  every call.
- **Uploads are multipart** — use `-F`, never a JSON `-d` body. Field names matter:
  `file` (Files/Uploads), `File` (RadzenEditor single/image/specific), `Files`
  (RadzenEditor multiple / by-id, repeated), `Avatar` (avatar updates).
- **`Files/{fileId}/Raw` and avatar GETs return bytes**, not an envelope — capture
  with `-o`.
- **Tenant scoping is optional only where the manifest lists `tenantId(query,opt)`**
  (Files, Blobs, Uploads, RadzenEditor, and contact-avatar update). The other avatar
  endpoints ignore a tenant query/header.
- **No PATCH** on this service. Use `PUT /Files/{fileId}` for file-record edits.
