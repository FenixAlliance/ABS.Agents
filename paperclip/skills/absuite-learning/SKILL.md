---
name: absuite-learning
description: >
  Manage learning and e-learning in the Alliance Business Suite (ABS) via the REST API.
  Covers courses and their full content tree (sections, units, unit components, content
  groups), assignments, problem sets, grading rubrics, cohorts, enrollments, certificates
  and templates, forums, wikis, articles, pages, updates, handouts, files, libraries, team
  memberships, instructor/student profiles, and per-user "Me" reads — including atomic PATCH
  (JSON Patch) updates. Tenant scoping is per-endpoint and most operations require a bearer
  token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Learning Skill (REST)

Manage e-learning through the `LearningService` REST API. Most operations are tenant-scoped and require authentication. A subset of reads (get-by-id and course sub-resource listings) are public / optional-tenant, and the `Me/*` endpoints are strictly user-scoped (no tenant). **Tenant scoping is enforced per-endpoint — read each curl example's `?tenantId=` usage; do not blanket-add it.**

> For the CLI equivalent of these operations, see `absuite-learning-cli`. For general REST conventions (auth, envelope, tenant scoping, JSON Patch), see `absuite-rest`.

## Authentication

1. **Obtain a bearer token:**
```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<user-email>", "password": "<user-password>"}'
```
Extract `accessToken` from the response.

2. **Send the token on every call:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/LearningService/`

4. **Response envelope:** every response is `{ "isSuccess": bool, "errorMessage": str|null, "correlationId": str, "timestamp": str, "result": <data|array|int|null> }`. Always check `isSuccess`; read the payload from `result`.

## Tenant scoping rules (per-endpoint)

- **Tenant required** — all list/count/create/update/patch/delete on the top-level resources (Courses, CourseSections, CourseEnrollments, etc.). Pass `?tenantId=<tenant-guid>` on **every verb**, including POST/PUT/PATCH/DELETE. The header form `X-TenantId: <tenant-guid>` is equivalent.
- **Tenant optional** — `GET /Courses/{courseId}` (get a single course): omitting `tenantId` returns the public/global view; pass it to scope to a tenant.
- **No tenant param (public / optional read)** — most **get-by-id** endpoints (e.g. `GET /CourseSections/{sectionId}`) and the **course sub-resource listings** (`GET /Courses/{courseId}/Sections`, `/Units/{sectionId}`, `/Assignments`, …) take no `tenantId`. Do not add one; it is ignored.
- **User-scoped** — the entire `Me/*` controller is resolved from the JWT. **Never** add `tenantId` or `X-TenantId` to `Me/*` calls.
- Exceptions worth noting: `GET /Courses/{courseId}/Enrollments` **requires** `tenantId` (unlike the other course sub-resources). `CourseCertificates` and `StudentProfiles` get-by-id **require** `tenantId` (unlike most other get-by-id endpoints). Follow the per-call examples below.

## Key Concepts

- **Course** — top-level learning entity; carries pricing (`currencyId` + `regularPrice`), effort metrics, enrollment window, and a `published` flag (settable via update/patch).
- **Section → Unit → Unit Component** — the course content tree. A Section groups Units; a Unit holds Unit Components (content blocks). Create them in that order.
- **Content Group** — an optional grouping a Unit can belong to (`courseContentGroupId`).
- **Cohort** — a group of students moving through a course together (`startDateTime`/`endDateTime`).
- **Enrollment** — a student's registration in a course (links `studentProfileId`, optional `courseCohortId`).
- **Assignment / Assignment Type / Assignment Component** — graded work, its weighting category, and its sub-parts.
- **Problem Set** — practice exercises, optionally tied to a grading rubric.
- **Grading Rubric** — scoring scheme (`enablePoints`).
- **Certificate / Certificate Template** — completion credential and its reusable template.
- **Forum / Wiki / Article / Page / Update / Handout / File / Library** — course content & resources. Articles live under a Wiki (`courseWikiId`).
- **Team Membership** — instructor membership on a course; `courseTeamMembershipType` is `Admin` or `Staff`.
- **Instructor Profile / Student Profile** — the learning identities of a contact (`contactId`).

## Courses

```bash
# List courses (tenant REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count (tenant REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID (tenant OPTIONAL — omit for public view, pass to scope)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (tenant REQUIRED). title + description are REQUIRED.
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/Courses?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Cloud Computing",
    "description": "A beginner-friendly overview of cloud platforms.",
    "sku": "CLD-101",
    "summary": "Cloud fundamentals",
    "code": "CLD101",
    "version": "1.0",
    "courseCategoryId": "<category-guid>",
    "instructorProfileId": "<instructor-guid>",
    "currencyId": "<currency-guid>",
    "regularPrice": 199.00,
    "maxCourseEnrollments": 100,
    "totalEffortInWeeks": 6,
    "totalHoursPerWeek": 4,
    "totalEffortInHours": 24,
    "startDateTime": "2026-01-15T00:00:00Z",
    "endDateTime": "2026-02-26T00:00:00Z",
    "inscriptionsStartDateTime": "2025-12-01T00:00:00Z",
    "inscriptionsEndDateTime": "2026-01-14T00:00:00Z"
  }'

# Update (PUT — full replace, tenant REQUIRED). Adds "published".
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Cloud Computing (2026)",
    "description": "Updated for 2026.",
    "regularPrice": 249.00,
    "published": true
  }'

# Patch (PATCH — atomic partial update, tenant REQUIRED). See PATCH section below.
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/published", "value": true }]'

# Delete (tenant REQUIRED)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Course sub-resource reads

These list a course's related entities. **Except where noted, they take NO `tenantId`.** Each has a matching `/Count` variant.

```bash
# Sections, Units, Unit Components, Content Groups
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Sections" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Sections/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Units within a given section of a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Units/<section-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Units/<section-guid>/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/UnitComponents" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/ContentGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assignments, Problem Sets, Categories, Cohorts, Forums, Wikis, Updates
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Assignments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/ProblemSets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Cohorts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Forums" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Wikis" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Updates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Articles for a course wiki
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Articles/<wiki-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Resources: Files, Handouts, Libraries, Pages
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Files" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Handouts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Libraries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Pages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# People: Instructors, Students
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Instructors" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Students" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Enrollments for a course — NOTE: tenant REQUIRED here (exception)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Enrollments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

> Every sub-resource read above also has a `/Count` sibling (e.g. `…/Assignments/Count`, `…/Articles/<wiki-guid>/Count`). The Enrollments sub-resource has **no** dedicated Count endpoint.

## Course content tree

The CRUD families below all follow the same shape: **list / count (tenant REQUIRED)**, **get-by-id (no tenant)**, **create / update / patch / delete (tenant REQUIRED)**. Only the path segment, ID param, and body fields differ. One representative family is shown in full; the rest list their create-body fields and any non-obvious rules.

### Course Sections

```bash
# List / Count (tenant REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID (NO tenant)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections/<section-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (tenant REQUIRED). name + courseId are REQUIRED.
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Week 1: Fundamentals",
    "icon": "book",
    "description": "Foundational material",
    "courseId": "<course-guid>",
    "releaseDateTime": "2026-01-15T00:00:00Z",
    "hideFromStudents": false
  }'

# Update (PUT, tenant REQUIRED)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections/<section-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Week 1: Fundamentals (Revised)", "hideFromStudents": false }'

# Patch (PATCH, tenant REQUIRED)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections/<section-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/hideFromStudents", "value": true }]'

# Delete (tenant REQUIRED)
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections/<section-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Course Units

Path: `CourseUnits` · ID param `unitId`. Create body (`CourseUnitCreateDto`): `title` REQ, `description`, `content`, `courseId` REQ, `courseSectionId` REQ, `courseContentGroupId`, `releaseDateTime`. Update body drops `courseId`/`courseSectionId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnits?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to AWS",
    "description": "Getting started",
    "content": "...",
    "courseId": "<course-guid>",
    "courseSectionId": "<section-guid>",
    "releaseDateTime": "2026-01-16T00:00:00Z"
  }'
```

### Course Unit Components

Path: `CourseUnitComponents` · ID param `componentId`. Create body (`CourseUnitComponentCreateDto`): `title` REQ, `description`, `content`, `order` (int), `courseId` REQ, `courseUnitId`.

### Course Content Groups

Path: `CourseContentGroups` · ID param `groupId`. Create body (`CourseContentGroupCreateDto`): `name` REQ, `courseId` REQ.

## Cohorts & Enrollments

### Cohorts

Path: `CourseCohorts` · ID param `cohortId`. Create body (`CourseCohortCreateDto`): `name` REQ, `courseId` REQ, `startDateTime`, `endDateTime`, `expectedStartDateTime`, `expectedEndDateTime`.

### Enrollments

Path: `CourseEnrollments` · ID param `courseEnrollmentId`. **Note: get-by-id here REQUIRES `tenantId`.**

```bash
# List / Count (tenant REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID (tenant REQUIRED — exception)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (tenant REQUIRED). All body fields optional in the DTO.
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "<course-guid>",
    "courseCohortId": "<cohort-guid>",
    "studentProfileId": "<student-guid>"
  }'

# Update (PUT, tenant REQUIRED). Update body: courseCohortId, courseCompletionCertificateId.
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "courseCohortId": "<cohort-guid>" }'

# Patch / Delete (tenant REQUIRED)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{ "op": "replace", "path": "/courseCohortId", "value": "<cohort-guid>" }]'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments/<enrollment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Enrollments for a specific student (tenant REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments/Student/<student-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Assignments, Types, Components & Problem Sets

### Assignments

Path: `CourseAssignments` · ID param `assignmentId`. Create body (`CourseAssignmentCreateDto`): `title` REQ, `description`, `instructions`, `points` (number), `courseId` REQ, `courseUnitId`, `courseCohortId`, `courseAssignmentTypeId`, `dueDateTime`, `asignToAllCohorts` (boolean — spelled exactly as `asignToAllCohorts`), `resources`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lab 1: Provision a VM",
    "instructions": "Provision and document a VM.",
    "points": 100,
    "courseId": "<course-guid>",
    "courseAssignmentTypeId": "<assignment-type-guid>",
    "dueDateTime": "2026-01-22T23:59:00Z",
    "asignToAllCohorts": true
  }'
```

### Assignment Types

Path: `CourseAssignmentTypes` · ID param `assignmentTypeId`. Create body (`CourseAssignmentTypeCreateDto`): `name` REQ, `abbreviation`, `weight` (number), `quantity` (int), `excluded` (int), `courseId` REQ.

### Assignment Components

Path: `CourseAssignmentComponents` · ID param `componentId`. Create body (`CourseAssignmentComponentCreateDto`): `title` REQ, `description`, `content`, `order` (int), `courseAssignmentId` REQ, `courseId` REQ.

### Problem Sets

Path: `CourseProblemSets` · ID param `problemSetId`. Create body (`CourseProblemSetCreateDto`): `title` REQ, `description`, `overallScore` (number), `courseId` REQ, `courseUnitId`, `courseGradingRubricId`, `releaseDateTime`.

### Grading Rubrics

Path: `CourseGradingRubrics` · ID param `rubricId`. Create body (`CourseGradingRubricCreateDto`): `title` REQ, `description`, `enablePoints` (boolean), `courseId` REQ.

## Certificates & Templates

### Certificates

Path: `CourseCertificates` · ID param `courseCertificateId`. **Get-by-id REQUIRES `tenantId`.** Create body (`CourseCompletionCertificateCreateDto`): `studentProfileId` REQ, `courseEnrollmentId` REQ, `courseCompletionCertificateTemplateId`, `courseId`. Update body (`CourseCompletionCertificateUpdateDto`): same fields without REQ.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/<cert-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentProfileId": "<student-guid>",
    "courseEnrollmentId": "<enrollment-guid>",
    "courseCompletionCertificateTemplateId": "<template-guid>",
    "courseId": "<course-guid>"
  }'
```

### Certificate Templates

Sub-path under certificates: `CourseCertificates/Template` · ID param `courseCertificateTemplateId`. **All operations (incl. get-by-id) REQUIRE `tenantId`.** Create body (`CourseCertificateTemplateCreateDto`): `courseId` REQ, `webPortalId`, `websiteThemeId`, `socialProfileId`, `parentWebContentId`, `parentWebContentVersionId`. Update body drops `courseId`.

```bash
# List / Count / Get / Create / Update / Patch / Delete (all tenant REQUIRED)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/Template?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/Template/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/Template/<template-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/Template?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "courseId": "<course-guid>", "webPortalId": "<portal-guid>" }'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/Template/<template-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Course content & resources

These all follow the standard family shape (list/count tenant-REQUIRED, get-by-id no-tenant, create/update/patch/delete tenant-REQUIRED). Paths, ID params, and create bodies:

| Family | Path | ID param | Create body (`*CreateDto`) — REQ fields in **bold** |
|---|---|---|---|
| Categories | `CourseCategories` | `categoryId` | **title**, description, imageURL, isFeatured (bool) |
| Forums | `CourseForums` | `forumId` | **title**, description, **courseId** |
| Wikis | `CourseWikis` | `wikiId` | **title**, description, **courseId**, courseUnitId, releaseDateTime |
| Articles | `CourseArticles` | `articleId` | **title**, description, content, **courseId**, **courseWikiId** |
| Pages | `CoursePages` | `pageId` | **title**, description, content, slug, **courseId** |
| Updates | `CourseUpdates` | `updateId` | **title**, description, content, **courseId** (body type `CourseNewsCreateDto`) |
| Handouts | `CourseHandouts` | `handoutId` | **name**, description, content, url, releaseDateTime, **courseId**, courseUnitId |
| Files | `CourseFiles` | `fileId` | **title**, **fileName**, **fileUploadURL**, contentType, fileLength (int), **courseId** |
| Libraries | `CourseLibraries` | `libraryId` | **title**, description, **courseId**, courseUnitId, releaseDateTime |

> Categories has no `courseId` in its create body (it is a tenant-wide taxonomy; associate via the course). The Updates resource uses `CourseNewsCreateDto`/`CourseNewsUpdateDto` despite the `CourseUpdates` path.

Representative create (Articles — note `courseWikiId` is required):

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseArticles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "What is IaaS?",
    "description": "Infrastructure as a Service explained",
    "content": "...",
    "courseId": "<course-guid>",
    "courseWikiId": "<wiki-guid>"
  }'
```

## Team Memberships

Path: `CourseTeamMemberships` · ID param `membershipId`. Create body (`CourseTeamMembershipCreateDto`): `courseId` REQ, `instructorProfileId` REQ, `courseTeamMembershipType` (enum `Admin` | `Staff`).

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseTeamMemberships?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "<course-guid>",
    "instructorProfileId": "<instructor-guid>",
    "courseTeamMembershipType": "Staff"
  }'
```

## Instructor & Student Profiles

Both profiles share the same field shape: `type`, `contactId`, `about`, `avatarUrl`, and generic `data`/`dataLabel` plus `data1`…`data9` / `data1Label`…`data9Label`. Instructor create/update additionally has `authorized` (boolean). No fields are marked REQ on either create DTO.

### Instructor Profiles

Path: `InstructorProfiles` · ID param `instructorProfileId`. **List/count/get-by-id/create/update/patch/delete ALL require `tenantId`** (get-by-id is tenant-required here).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/InstructorProfiles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/InstructorProfiles/<instructor-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/InstructorProfiles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Lead",
    "contactId": "<contact-guid>",
    "about": "Cloud architect and instructor.",
    "avatarUrl": "https://example.com/avatar.png",
    "authorized": true
  }'
```

### Student Profiles

Path: `StudentProfiles` · ID param `studentProfileId`. **List/count/get-by-id/create/update/patch/delete ALL require `tenantId`.** Plus two per-student stat reads (tenant REQUIRED):

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/StudentProfiles/<student-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Average score for a student
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/StudentProfiles/<student-guid>/Average?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Hours completed by a student
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/StudentProfiles/<student-guid>/HoursCompleted?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## My Learning (Me) — user-scoped, NO tenant

Read-only endpoints resolved entirely from the authenticated user's JWT. **Do NOT pass `tenantId` or `X-TenantId` — it is ignored.**

```bash
# My average score across courses
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/AverageScore" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# My completion certificates (+ /Count)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/Certificates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# My enrolled courses as a student (+ /Count)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/Courses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# My course enrollments (+ /Count)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# My completed hours
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/HoursCompleted" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# Courses where I am an instructor (+ /Count)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/InstructorCourses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# My instructor profiles (+ /Count)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/InstructorProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# My pending task count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/PendingTasks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# My student profiles (+ /Count)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/StudentProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## PATCH (JSON Patch, RFC 6902)

PATCH is supported on every top-level aggregate and most sub-resources (Courses, CourseSections, CourseUnits, CourseUnitComponents, CourseContentGroups, CourseCohorts, CourseEnrollments, CourseAssignments, CourseAssignmentTypes, CourseAssignmentComponents, CourseProblemSets, CourseGradingRubrics, CourseCertificates, CourseCertificates/Template, CourseCategories, CourseForums, CourseWikis, CourseArticles, CoursePages, CourseUpdates, CourseHandouts, CourseFiles, CourseLibraries, CourseTeamMemberships, InstructorProfiles, StudentProfiles).

- Body is a JSON **array** of operations; `Content-Type: application/json`.
- `op` ∈ `add | remove | replace | move | copy | test`. `path` / `from` are JSON-Pointer (leading `/`, camelCase field names matching the update DTO).
- Tenant scoping for PATCH follows the same rule as the resource's writes: **`tenantId` is REQUIRED** on every PATCH in this service.

```bash
# Publish a course and bump its price in one atomic call
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/published", "value": true },
    { "op": "replace", "path": "/regularPrice", "value": 249.00 }
  ]'
```

> `Me/*` endpoints are read-only and do **not** support PATCH.

## End-to-end workflow

```bash
T="<tenant-guid>"

# 1. Create a course (title + description REQUIRED)
curl -s -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/Courses?tenantId=$T" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"DevOps 101","description":"CI/CD fundamentals"}'
# -> read result.id => <course-guid>

# 2. Add a section (name + courseId REQUIRED)
curl -s -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections?tenantId=$T" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Module 1","courseId":"<course-guid>"}'
# -> <section-guid>

# 3. Add a unit (title + courseId + courseSectionId REQUIRED)
curl -s -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnits?tenantId=$T" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Pipelines","courseId":"<course-guid>","courseSectionId":"<section-guid>"}'

# 4. Enroll a student
curl -s -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments?tenantId=$T" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"courseId":"<course-guid>","studentProfileId":"<student-guid>"}'

# 5. Publish the course (atomic PATCH)
curl -s -X PATCH "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>?tenantId=$T" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[{"op":"replace","path":"/published","value":true}]'
```

## API Endpoints Quick Reference

All paths relative to `/api/v2/LearningService/`. **T** = `tenantId` required · **opt** = optional · **—** = no tenant param.

### Standard CRUD families

| Resource | List | Get by ID | Create | Update (PUT) | Patch | Delete | Count |
|---|---|---|---|---|---|---|---|
| Courses | `GET /Courses` (T) | `GET /Courses/:id` (opt) | `POST /Courses` (T) | `PUT /Courses/:id` (T) | `PATCH /Courses/:id` (T) | `DELETE /Courses/:id` (T) | `GET /Courses/Count` (T) |
| CourseSections | `GET /CourseSections` (T) | `GET /CourseSections/:id` (—) | `POST /CourseSections` (T) | `PUT /CourseSections/:id` (T) | `PATCH /CourseSections/:id` (T) | `DELETE /CourseSections/:id` (T) | `GET /CourseSections/Count` (T) |
| CourseUnits | `GET /CourseUnits` (T) | `GET /CourseUnits/:id` (—) | `POST /CourseUnits` (T) | `PUT /CourseUnits/:id` (T) | `PATCH /CourseUnits/:id` (T) | `DELETE /CourseUnits/:id` (T) | `GET /CourseUnits/Count` (T) |
| CourseUnitComponents | `GET /CourseUnitComponents` (T) | `GET /CourseUnitComponents/:id` (—) | `POST /CourseUnitComponents` (T) | `PUT /CourseUnitComponents/:id` (T) | `PATCH /CourseUnitComponents/:id` (T) | `DELETE /CourseUnitComponents/:id` (T) | `GET /CourseUnitComponents/Count` (T) |
| CourseContentGroups | `GET /CourseContentGroups` (T) | `GET /CourseContentGroups/:id` (—) | `POST /CourseContentGroups` (T) | `PUT /CourseContentGroups/:id` (T) | `PATCH /CourseContentGroups/:id` (T) | `DELETE /CourseContentGroups/:id` (T) | `GET /CourseContentGroups/Count` (T) |
| CourseCohorts | `GET /CourseCohorts` (T) | `GET /CourseCohorts/:id` (—) | `POST /CourseCohorts` (T) | `PUT /CourseCohorts/:id` (T) | `PATCH /CourseCohorts/:id` (T) | `DELETE /CourseCohorts/:id` (T) | `GET /CourseCohorts/Count` (T) |
| CourseEnrollments | `GET /CourseEnrollments` (T) | `GET /CourseEnrollments/:id` (T) | `POST /CourseEnrollments` (T) | `PUT /CourseEnrollments/:id` (T) | `PATCH /CourseEnrollments/:id` (T) | `DELETE /CourseEnrollments/:id` (T) | `GET /CourseEnrollments/Count` (T) |
| CourseAssignments | `GET /CourseAssignments` (T) | `GET /CourseAssignments/:id` (—) | `POST /CourseAssignments` (T) | `PUT /CourseAssignments/:id` (T) | `PATCH /CourseAssignments/:id` (T) | `DELETE /CourseAssignments/:id` (T) | `GET /CourseAssignments/Count` (T) |
| CourseAssignmentTypes | `GET /CourseAssignmentTypes` (T) | `GET /CourseAssignmentTypes/:id` (—) | `POST /CourseAssignmentTypes` (T) | `PUT /CourseAssignmentTypes/:id` (T) | `PATCH /CourseAssignmentTypes/:id` (T) | `DELETE /CourseAssignmentTypes/:id` (T) | `GET /CourseAssignmentTypes/Count` (T) |
| CourseAssignmentComponents | `GET /CourseAssignmentComponents` (T) | `GET /CourseAssignmentComponents/:id` (—) | `POST /CourseAssignmentComponents` (T) | `PUT /CourseAssignmentComponents/:id` (T) | `PATCH /CourseAssignmentComponents/:id` (T) | `DELETE /CourseAssignmentComponents/:id` (T) | `GET /CourseAssignmentComponents/Count` (T) |
| CourseProblemSets | `GET /CourseProblemSets` (T) | `GET /CourseProblemSets/:id` (—) | `POST /CourseProblemSets` (T) | `PUT /CourseProblemSets/:id` (T) | `PATCH /CourseProblemSets/:id` (T) | `DELETE /CourseProblemSets/:id` (T) | `GET /CourseProblemSets/Count` (T) |
| CourseGradingRubrics | `GET /CourseGradingRubrics` (T) | `GET /CourseGradingRubrics/:id` (—) | `POST /CourseGradingRubrics` (T) | `PUT /CourseGradingRubrics/:id` (T) | `PATCH /CourseGradingRubrics/:id` (T) | `DELETE /CourseGradingRubrics/:id` (T) | `GET /CourseGradingRubrics/Count` (T) |
| CourseCertificates | `GET /CourseCertificates` (T) | `GET /CourseCertificates/:id` (T) | `POST /CourseCertificates` (T) | `PUT /CourseCertificates/:id` (T) | `PATCH /CourseCertificates/:id` (T) | `DELETE /CourseCertificates/:id` (T) | `GET /CourseCertificates/Count` (T) |
| Certificate Templates | `GET /CourseCertificates/Template` (T) | `GET /CourseCertificates/Template/:id` (T) | `POST /CourseCertificates/Template` (T) | `PUT /CourseCertificates/Template/:id` (T) | `PATCH /CourseCertificates/Template/:id` (T) | `DELETE /CourseCertificates/Template/:id` (T) | `GET /CourseCertificates/Template/Count` (T) |
| CourseCategories | `GET /CourseCategories` (T) | `GET /CourseCategories/:id` (—) | `POST /CourseCategories` (T) | `PUT /CourseCategories/:id` (T) | `PATCH /CourseCategories/:id` (T) | `DELETE /CourseCategories/:id` (T) | `GET /CourseCategories/Count` (T) |
| CourseForums | `GET /CourseForums` (T) | `GET /CourseForums/:id` (—) | `POST /CourseForums` (T) | `PUT /CourseForums/:id` (T) | `PATCH /CourseForums/:id` (T) | `DELETE /CourseForums/:id` (T) | `GET /CourseForums/Count` (T) |
| CourseWikis | `GET /CourseWikis` (T) | `GET /CourseWikis/:id` (—) | `POST /CourseWikis` (T) | `PUT /CourseWikis/:id` (T) | `PATCH /CourseWikis/:id` (T) | `DELETE /CourseWikis/:id` (T) | `GET /CourseWikis/Count` (T) |
| CourseArticles | `GET /CourseArticles` (T) | `GET /CourseArticles/:id` (—) | `POST /CourseArticles` (T) | `PUT /CourseArticles/:id` (T) | `PATCH /CourseArticles/:id` (T) | `DELETE /CourseArticles/:id` (T) | `GET /CourseArticles/Count` (T) |
| CoursePages | `GET /CoursePages` (T) | `GET /CoursePages/:id` (—) | `POST /CoursePages` (T) | `PUT /CoursePages/:id` (T) | `PATCH /CoursePages/:id` (T) | `DELETE /CoursePages/:id` (T) | `GET /CoursePages/Count` (T) |
| CourseUpdates | `GET /CourseUpdates` (T) | `GET /CourseUpdates/:id` (—) | `POST /CourseUpdates` (T) | `PUT /CourseUpdates/:id` (T) | `PATCH /CourseUpdates/:id` (T) | `DELETE /CourseUpdates/:id` (T) | `GET /CourseUpdates/Count` (T) |
| CourseHandouts | `GET /CourseHandouts` (T) | `GET /CourseHandouts/:id` (—) | `POST /CourseHandouts` (T) | `PUT /CourseHandouts/:id` (T) | `PATCH /CourseHandouts/:id` (T) | `DELETE /CourseHandouts/:id` (T) | `GET /CourseHandouts/Count` (T) |
| CourseFiles | `GET /CourseFiles` (T) | `GET /CourseFiles/:id` (—) | `POST /CourseFiles` (T) | `PUT /CourseFiles/:id` (T) | `PATCH /CourseFiles/:id` (T) | `DELETE /CourseFiles/:id` (T) | `GET /CourseFiles/Count` (T) |
| CourseLibraries | `GET /CourseLibraries` (T) | `GET /CourseLibraries/:id` (—) | `POST /CourseLibraries` (T) | `PUT /CourseLibraries/:id` (T) | `PATCH /CourseLibraries/:id` (T) | `DELETE /CourseLibraries/:id` (T) | `GET /CourseLibraries/Count` (T) |
| CourseTeamMemberships | `GET /CourseTeamMemberships` (T) | `GET /CourseTeamMemberships/:id` (—) | `POST /CourseTeamMemberships` (T) | `PUT /CourseTeamMemberships/:id` (T) | `PATCH /CourseTeamMemberships/:id` (T) | `DELETE /CourseTeamMemberships/:id` (T) | `GET /CourseTeamMemberships/Count` (T) |
| InstructorProfiles | `GET /InstructorProfiles` (T) | `GET /InstructorProfiles/:id` (T) | `POST /InstructorProfiles` (T) | `PUT /InstructorProfiles/:id` (T) | `PATCH /InstructorProfiles/:id` (T) | `DELETE /InstructorProfiles/:id` (T) | `GET /InstructorProfiles/Count` (T) |
| StudentProfiles | `GET /StudentProfiles` (T) | `GET /StudentProfiles/:id` (T) | `POST /StudentProfiles` (T) | `PUT /StudentProfiles/:id` (T) | `PATCH /StudentProfiles/:id` (T) | `DELETE /StudentProfiles/:id` (T) | `GET /StudentProfiles/Count` (T) |

### Course sub-resource reads (no tenant unless noted)

| Action | Method | Path |
|---|---|---|
| Sections by course | GET | `/Courses/:courseId/Sections` (+ `/Count`) |
| Units by section | GET | `/Courses/:courseId/Units/:sectionId` (+ `/Count`) |
| Unit components by course | GET | `/Courses/:courseId/UnitComponents` (+ `/Count`) |
| Content groups by course | GET | `/Courses/:courseId/ContentGroups` (+ `/Count`) |
| Assignments by course | GET | `/Courses/:courseId/Assignments` (+ `/Count`) |
| Problem sets by course | GET | `/Courses/:courseId/ProblemSets` (+ `/Count`) |
| Categories by course | GET | `/Courses/:courseId/Categories` (+ `/Count`) |
| Cohorts by course | GET | `/Courses/:courseId/Cohorts` (+ `/Count`) |
| Enrollments by course (**T required**) | GET | `/Courses/:courseId/Enrollments` |
| Forums by course | GET | `/Courses/:courseId/Forums` (+ `/Count`) |
| Wikis by course | GET | `/Courses/:courseId/Wikis` (+ `/Count`) |
| Articles by course wiki | GET | `/Courses/:courseId/Articles/:wikiId` (+ `/Count`) |
| Updates by course | GET | `/Courses/:courseId/Updates` (+ `/Count`) |
| Handouts by course | GET | `/Courses/:courseId/Handouts` (+ `/Count`) |
| Files by course | GET | `/Courses/:courseId/Files` (+ `/Count`) |
| Libraries by course | GET | `/Courses/:courseId/Libraries` (+ `/Count`) |
| Pages by course | GET | `/Courses/:courseId/Pages` (+ `/Count`) |
| Instructors by course | GET | `/Courses/:courseId/Instructors` (+ `/Count`) |
| Students by course | GET | `/Courses/:courseId/Students` (+ `/Count`) |

### Other reads & stats

| Action | Method | Path | Tenant |
|---|---|---|---|
| Enrollments by student | GET | `/CourseEnrollments/Student/:studentProfileId` | T |
| Student average score | GET | `/StudentProfiles/:studentProfileId/Average` | T |
| Student hours completed | GET | `/StudentProfiles/:studentProfileId/HoursCompleted` | T |

### Me/* (user-scoped — NEVER pass tenant)

| Action | Method | Path |
|---|---|---|
| My average score | GET | `/Me/AverageScore` |
| My certificates | GET | `/Me/Certificates` (+ `/Count`) |
| My enrolled courses | GET | `/Me/Courses` (+ `/Count`) |
| My enrollments | GET | `/Me/Enrollments` (+ `/Count`) |
| My hours completed | GET | `/Me/HoursCompleted` |
| My instructor courses | GET | `/Me/InstructorCourses` (+ `/Count`) |
| My instructor profiles | GET | `/Me/InstructorProfiles` (+ `/Count`) |
| My pending task count | GET | `/Me/PendingTasks` |
| My student profiles | GET | `/Me/StudentProfiles` (+ `/Count`) |

## Critical Rules

- **Authenticate first** and send `Authorization: Bearer …` on every call.
- **Tenant scoping is per-endpoint.** Top-level writes/lists require `?tenantId=`; most get-by-id and course sub-resource reads take none; `Me/*` never takes one. Honor the (T)/(opt)/(—) flags above.
- **Course hierarchy**: Course → Section → Unit → Unit Component. Create in order; Units need both `courseId` and `courseSectionId`.
- **Articles require `courseWikiId`**; create the Wiki first.
- **Body field names are camelCase** exactly as in the manifest (e.g. `imageURL`, `fileUploadURL`, `asignToAllCohorts` — note the original spelling).
- **PATCH** is REST-only here (JSON Patch array). For the CLI, use PUT-style `update` instead — see `absuite-learning-cli`.
- **REST base path**: `$ABSUITE_HOST_URL/api/v2/LearningService/`.
