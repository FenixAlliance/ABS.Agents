---
name: absuite-storage
description: >
  Manage file storage, uploads, downloads, and avatars in the Alliance Business Suite
  (ABS) using the `absuite` CLI. Covers single/multiple file uploads, blob storage,
  and avatar management for contacts, users, and tenants. Requires an authenticated
  CLI session.
---

# Alliance Business Suite — Storage Skill

Manage file storage through the `absuite` CLI's `storage` service.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Discover commands**: `absuite storage list-commands`

## REST API Authentication

All REST API calls require a bearer token.

1. **Obtain a token**: `POST $ABSUITE_HOST_URL/login` with `{"email":"...","password":"..."}`
2. **Use the token**: `-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"`
3. **Base URL**: `$ABSUITE_HOST_URL/api/v2/`

## File Operations

### Upload a Single File

```bash
absuite storage single --File @/path/to/file.pdf
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/RadzenEditor/Uploads/Single" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/file.pdf"
```

### Upload Multiple Files

```bash
absuite storage multiple --Files @/path/to/file1.pdf --Files @/path/to/file2.png
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/RadzenEditor/Uploads/Multiple" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.png"
```

### Upload an Image

```bash
absuite storage image --File @/path/to/image.jpg
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/RadzenEditor/Uploads/Image" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

### Upload a Specific File

```bash
absuite storage specific --File @/path/to/file.docx
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/RadzenEditor/Uploads/Specific" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/file.docx"
```

### Save (Upload) a File

```bash
absuite storage save-file --File @/path/to/file.xlsx
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/Uploads" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/file.xlsx"
```

### Create File Record

```bash
absuite storage create file --FileCreateDto '{...}'
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/Files" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Get File

```bash
absuite storage get file --FileId <file-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files/$FILE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Update File

```bash
absuite storage update file --FileId <file-guid> --FileUpdateDto '{...}'
```

**REST API equivalent:**
```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/StorageService/Files/$FILE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Delete File

```bash
absuite storage delete file --FileId <file-guid>
```

**REST API equivalent:**
```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/StorageService/Files/$FILE_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List Files

```bash
absuite storage list files
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Download a File

```bash
absuite storage download-file --FileId <file-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Files/$FILE_ID/Raw" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -o downloaded_file
```

## Blob Storage

```bash
# List blobs
absuite storage list blobs

# Get blob by ID
absuite storage get blob --BlobId <blob-guid>

# Submit files by ID
absuite storage submit- --FileIds <file-guid>
```

**REST API equivalents:**
```bash
# List blobs
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Blobs" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get single blob
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Blobs/Single?blobId=<blob-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Avatars

### Current User Avatar

```bash
# Get
absuite storage get current-user-avatar

# Update
absuite storage update user-avatar --Avatar @/path/to/avatar.png
```

**REST API equivalents:**
```bash
# Get current user avatar
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/User" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update current user avatar
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/User" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/avatar.png"
```

### User Avatar (by User ID)

```bash
absuite storage get user-avatar --UserId <user-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/User/<user-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Contact Avatar

```bash
# Get
absuite storage get contact-avatar --ContactId <contact-guid>

# Update
absuite storage update contact-avatar --ContactId <contact-guid> --Avatar @/path/to/avatar.png
```

**REST API equivalents:**
```bash
# Get contact avatar
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/Contact/<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update contact avatar
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/Contacts/<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/avatar.png"
```

### Tenant Avatar

```bash
# Get
absuite storage get tenant-avatar --TenantId $TENANT_ID

# Update
absuite storage update tenant-avatar --TenantId $TENANT_ID --Avatar @/path/to/logo.png
```

**REST API equivalents:**
```bash
# Get tenant avatar
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/Tenant/$TENANT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Update tenant avatar
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/Tenant/$TENANT_ID" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/logo.png"
```

### Social Profile Avatar

```bash
absuite storage get avatar --SocialProfileId <profile-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/StorageService/Avatars/<profile-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Editor Upload by ID

```bash
absuite storage upload --Id <id> --File @/path/to/file.pdf
```

**REST API equivalent:**
```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/StorageService/RadzenEditor/Uploads/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -F "file=@/path/to/file.pdf"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| Upload file | `absuite storage single --File @/path/to/file` |
| Upload image | `absuite storage image --File @/path/to/image.jpg` |
| Upload multiple | `absuite storage multiple --Files @/path/to/a --Files @/path/to/b` |
| Download file | `absuite storage download-file --FileId <guid>` |
| List files | `absuite storage list files` |
| Get user avatar | `absuite storage get current-user-avatar` |
| Update user avatar | `absuite storage update user-avatar --Avatar @/path/to/avatar.png` |
| Get contact avatar | `absuite storage get contact-avatar --ContactId <guid>` |
| Get tenant avatar | `absuite storage get tenant-avatar --TenantId <guid>` |

## Critical Rules

- **Authenticate first.**
- **File paths use `@` prefix** for file uploads (e.g., `@/path/to/file.pdf`).
- **Use `--help`** on any command for full parameter details.
- **REST uploads use multipart form** with `-F "file=@/path/to/file"` instead of JSON body.

## API Endpoints Quick Reference

| Action | Method | Endpoint |
|---|---|---|
| Upload file | POST | `/api/v2/StorageService/Uploads` |
| Upload single file | POST | `/api/v2/StorageService/RadzenEditor/Uploads/Single` |
| Upload multiple files | POST | `/api/v2/StorageService/RadzenEditor/Uploads/Multiple` |
| Upload image | POST | `/api/v2/StorageService/RadzenEditor/Uploads/Image` |
| Upload specific file | POST | `/api/v2/StorageService/RadzenEditor/Uploads/Specific` |
| Upload by ID | POST | `/api/v2/StorageService/RadzenEditor/Uploads/:id` |
| Create file record | POST | `/api/v2/StorageService/Files` |
| List files | GET | `/api/v2/StorageService/Files` |
| Get file | GET | `/api/v2/StorageService/Files/:fileId` |
| Update file | PUT | `/api/v2/StorageService/Files/:fileId` |
| Delete file | DELETE | `/api/v2/StorageService/Files/:fileId` |
| Download file | GET | `/api/v2/StorageService/Files/:fileId/Raw` |
| Get social profile avatar | GET | `/api/v2/StorageService/Avatars/:socialProfileId` |
| Get contact avatar | GET | `/api/v2/StorageService/Avatars/Contact/:contactId` |
| Update contact avatar | POST | `/api/v2/StorageService/Avatars/Contacts/:contactId` |
| Get tenant avatar | GET | `/api/v2/StorageService/Avatars/Tenant/:tenantId` |
| Update tenant avatar | POST | `/api/v2/StorageService/Avatars/Tenant/:tenantId` |
| Get current user avatar | GET | `/api/v2/StorageService/Avatars/User` |
| Update current user avatar | POST | `/api/v2/StorageService/Avatars/User` |
| Get user avatar | GET | `/api/v2/StorageService/Avatars/User/:userId` |
| List blobs | GET | `/api/v2/StorageService/Blobs` |
| Get blob | GET | `/api/v2/StorageService/Blobs/Single` |
