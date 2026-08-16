---
name: absuite-storage-cli
description: >
  Manage file storage, uploads, downloads, and avatars in the Alliance Business Suite
  (ABS) using the `absuite` CLI (storage service). Covers file records, raw downloads,
  blob browsing, RadzenEditor uploads, and avatars for social profiles, contacts,
  users, and tenants via list/get/create/update/delete commands. Requires an
  authenticated CLI session (see absuite-login-cli). For raw HTTP, use the
  absuite-storage (REST) skill.
---

# Alliance Business Suite — Storage Skill (CLI)

Drive the ABS **StorageService** through the `absuite` CLI under the `storage`
service token. The CLI wraps the same operations as the REST API: managed file
records (`Files`), low-level blob browsing (`Blobs`), the generic upload sink
(`Uploads`), inline RadzenEditor uploads, and avatar get/update.

> This skill does **not** cover PATCH or raw HTTP. StorageService has no PATCH
> endpoints at all; for file-record edits use the `update file` command (PUT under
> the hood). For raw `curl`, see the `absuite-storage` (REST) skill. For general CLI
> setup and conventions, see `absuite-cli`.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-storage` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-storage` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first**: `absuite login` (see `absuite-login-cli`). Every storage
   command needs the resulting session.
2. **Set or pass a tenant** (optional for this service — most storage endpoints accept
   an optional tenant): set a default with
   `absuite config set --tenant-id <tenant-guid>`, or pass `--TenantId <tenant-guid>`
   per command. `$TENANT_ID` below stands for your tenant GUID.
3. **Discover commands**: `absuite storage list-commands`, and `--help` on any command
   (e.g. `absuite storage create file --help`) for the full parameter list.

## Command structure

```
absuite storage <verb> <entity> --Param value
```

The canonical SDK function-name form also works, e.g.
`absuite storage Get-FilesAsync --TenantId $TENANT_ID`. Verbs available on this
service: **list, get, create, update, delete** plus the upload/download/avatar
actions below. (There is no `count` or `search` operation on StorageService.)

Parameter names are PascalCase and match the REST/SDK fields exactly:
`--TenantId`, `--FileId`, `--File`, `--Files`, `--Title`, `--FileName`, `--Author`,
`--KeyWords`, `--Notes`, `--Abstract`, `--IsFolder`, `--ValidResponse`, `--FilePath`,
`--FolderPath`, `--Recurse`, `--MaxResults`, `--Avatar`, etc.

File parameters take a path; the CLI reads the file content for the multipart upload.

---

## Files

### List files

```bash
absuite storage list files --TenantId $TENANT_ID
```

`--TenantId` is optional. Canonical: `absuite storage Get-FilesAsync`.

### Get a file record

```bash
absuite storage get file --FileId <file-guid> --TenantId $TENANT_ID
```

Canonical: `absuite storage Get-FileAsync --FileId <file-guid>`.

### Create a file record (upload)

Create accepts the file plus optional metadata. Fields: `--Id`, `--Timestamp`,
`--Notes`, `--Title`, `--Author`, `--IsFolder`, `--FileName`, `--Abstract`,
`--KeyWords`, `--ValidResponse`, `--ParentFileUploadId`, `--FilePath`, `--File`.

```bash
absuite storage create file \
  --TenantId $TENANT_ID \
  --Title "Quarterly Report" \
  --FileName "q3-report.pdf" \
  --Author "Finance" \
  --KeyWords "report,finance,q3" \
  --IsFolder false \
  --File /path/to/q3-report.pdf
```

Canonical: `absuite storage New-FileAsync ...`.

### Update a file record

Update fields: `--Notes`, `--Metadata`, `--Title`, `--Author`, `--IsFolder`,
`--FileName`, `--Abstract`, `--KeyWords`, `--ValidResponse`, `--ParentFileUploadID`,
`--FilePath`, `--File`. (Update uses `--ParentFileUploadID`; create uses
`--ParentFileUploadId` — pass exactly as shown.)

```bash
absuite storage update file \
  --FileId <file-guid> \
  --TenantId $TENANT_ID \
  --Title "Quarterly Report (final)" \
  --Notes "Approved by review board" \
  --File /path/to/q3-report-final.pdf
```

Canonical: `absuite storage Update-FileAsync --FileId <file-guid> ...`.

### Delete a file record

```bash
absuite storage delete file --FileId <file-guid> --TenantId $TENANT_ID
```

Canonical: `absuite storage Invoke-DeleteFileAsync --FileId <file-guid>`.

### Download raw file bytes

```bash
absuite storage download-file --FileId <file-guid> --TenantId $TENANT_ID
```

Canonical: `absuite storage Invoke-DownloadFileAsync --FileId <file-guid>`.

---

## Blobs

### List blobs in a folder

Optional filters: `--FolderPath`, `--BrowseFilter`, `--FilePrefix`, `--Recurse`
(bool), `--MaxResults` (int), `--IncludeAttributes` (bool), `--TenantId`.

```bash
absuite storage list blobs \
  --TenantId $TENANT_ID \
  --FolderPath "reports" \
  --Recurse true \
  --MaxResults 50 \
  --IncludeAttributes true
```

Canonical: `absuite storage Get-BlobsAsync ...`.

### Get a single blob by path

Identify the blob by `--FilePath` (not by an id). `--TenantId` and `--FilePath` are
both optional.

```bash
absuite storage get blob --TenantId $TENANT_ID --FilePath "reports/q3-report.pdf"
```

Canonical: `absuite storage Get-BlobAsync --FilePath "reports/q3-report.pdf"`.

---

## Uploads (generic save)

Save a single file to tenant or user storage. The simplest call supplies just the
file; optional metadata fields (`--Title`, `--Notes`, `--Author`, `--FileName`,
`--KeyWords`, `--IsFolder`, `--FilePath`, etc.) are also accepted.

```bash
absuite storage save-file --TenantId $TENANT_ID --File /path/to/file.xlsx
```

Canonical: `absuite storage Save-FileAsync --File /path/to/file.xlsx`.

---

## RadzenEditor uploads

Inline editor uploads. All accept an optional `--TenantId`.

```bash
# Single file (param: --File)
absuite storage single --TenantId $TENANT_ID --File /path/to/file.pdf

# Image (param: --File)
absuite storage image --TenantId $TENANT_ID --File /path/to/image.jpg

# Specific file (param: --File)
absuite storage specific --TenantId $TENANT_ID --File /path/to/file.docx

# Multiple files (param: --Files, repeatable)
absuite storage multiple --TenantId $TENANT_ID --Files /path/to/a.pdf --Files /path/to/b.png

# Upload files by resource id (--Id is the integer resource id; --Files repeatable)
absuite storage submit --Id <id> --TenantId $TENANT_ID --Files /path/to/file.pdf
```

Canonical forms: `Invoke-Single`, `Invoke-Image`, `Invoke-Specific`,
`Invoke-Multiple`, and `Submit-` (the by-id upload). For example:
`absuite storage Invoke-Multiple --Files /path/to/a.pdf --Files /path/to/b.png`.

---

## Avatars

Avatars are keyed by their path id (social profile, contact, user, tenant) or the
session (current user). Update commands take the image via `--Avatar`. Only the
contact-avatar update accepts `--TenantId`; the others ignore it.

```bash
# Current user's avatar
absuite storage get current-user-avatar
absuite storage update user-avatar --Avatar /path/to/avatar.png

# Avatar for a specific user (by id)
absuite storage get user-avatar --UserId <user-guid>

# Contact avatar (--TenantId accepted on update)
absuite storage get contact-avatar --ContactId <contact-guid>
absuite storage update contact-avatar --ContactId <contact-guid> --TenantId $TENANT_ID --Avatar /path/to/avatar.png

# Tenant avatar (TenantId here is the path id of the target tenant)
absuite storage get tenant-avatar --TenantId <tenant-guid>
absuite storage update tenant-avatar --TenantId <tenant-guid> --Avatar /path/to/logo.png

# Social profile avatar
absuite storage get avatar --SocialProfileId <social-profile-guid>
```

Canonical forms: `Get-CurrentUserAvatar`, `Update-UserAvatar`, `Get-UserAvatar`,
`Get-ContactAvatar`, `Update-ContactAvatar`, `Get-TenantAvatar`, `Update-TenantAvatar`,
`Get-Avatar` (social profile).

---

## End-to-end workflow

```bash
# 1) Create a managed file record with content
absuite storage create file \
  --TenantId $TENANT_ID \
  --Title "Onboarding Packet" \
  --FileName "onboarding.pdf" \
  --KeyWords "hr,onboarding" \
  --File /path/to/onboarding.pdf

# 2) List files to find the new record's id
absuite storage list files --TenantId $TENANT_ID

# 3) Update its metadata
absuite storage update file \
  --FileId <file-guid> \
  --TenantId $TENANT_ID \
  --Title "Onboarding Packet (2026)" \
  --Notes "Updated for the 2026 cohort"

# 4) Download the raw bytes
absuite storage download-file --FileId <file-guid> --TenantId $TENANT_ID

# 5) Delete it when done
absuite storage delete file --FileId <file-guid> --TenantId $TENANT_ID
```

---

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List files | `absuite storage list files --TenantId $TENANT_ID` |
| Get file record | `absuite storage get file --FileId <file-guid>` |
| Create file record | `absuite storage create file --Title "..." --FileName "..." --File /path/to/file` |
| Update file record | `absuite storage update file --FileId <file-guid> --Title "..." --File /path/to/file` |
| Delete file record | `absuite storage delete file --FileId <file-guid>` |
| Download raw file bytes | `absuite storage download-file --FileId <file-guid>` |
| List blobs | `absuite storage list blobs --FolderPath "..." --Recurse true` |
| Get single blob | `absuite storage get blob --FilePath "..."` |
| Save (upload) a file | `absuite storage save-file --File /path/to/file` |
| Editor: upload single | `absuite storage single --File /path/to/file` |
| Editor: upload image | `absuite storage image --File /path/to/image.jpg` |
| Editor: upload specific | `absuite storage specific --File /path/to/file` |
| Editor: upload multiple | `absuite storage multiple --Files /path/to/a --Files /path/to/b` |
| Editor: upload by id | `absuite storage submit --Id <id> --Files /path/to/file` |
| Get current user avatar | `absuite storage get current-user-avatar` |
| Update current user avatar | `absuite storage update user-avatar --Avatar /path/to/avatar.png` |
| Get user avatar (by id) | `absuite storage get user-avatar --UserId <user-guid>` |
| Get contact avatar | `absuite storage get contact-avatar --ContactId <contact-guid>` |
| Update contact avatar | `absuite storage update contact-avatar --ContactId <contact-guid> --Avatar /path/to/avatar.png` |
| Get tenant avatar | `absuite storage get tenant-avatar --TenantId <tenant-guid>` |
| Update tenant avatar | `absuite storage update tenant-avatar --TenantId <tenant-guid> --Avatar /path/to/logo.png` |
| Get social profile avatar | `absuite storage get avatar --SocialProfileId <social-profile-guid>` |

## Critical rules

- **Authenticate first** with `absuite login` (see `absuite-login-cli`).
- **File parameters take a filesystem path** (e.g. `--File /path/to/file.pdf`); the CLI
  handles the multipart upload. Use `--Files` (repeatable) for multi-file uploads,
  `--Avatar` for avatar updates.
- **`--TenantId` is optional** on the storage commands that support it (files, blobs,
  uploads, RadzenEditor, contact-avatar update). The user/tenant/social-profile avatar
  commands ignore a tenant argument — `--TenantId` on `get/update tenant-avatar` is the
  **target tenant's id** (path id), not a scope filter.
- **No PATCH and no `count`/`search`** on this service. Edit file records with
  `update file`. For raw HTTP, use the `absuite-storage` (REST) skill.
- **Use `--help`** on any command for the authoritative parameter list.
