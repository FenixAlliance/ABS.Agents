---
name: absuite-learning-cli
description: >
  Manage learning and e-learning in the Alliance Business Suite (ABS) using the `absuite` CLI.
  Covers courses and their content tree (sections, units, unit components, content groups),
  assignments, problem sets, grading rubrics, cohorts, enrollments, certificates and templates,
  forums, wikis, articles, pages, updates, handouts, files, libraries, team memberships,
  instructor/student profiles, and per-user "Me" reads — via list/count/get/create/update/delete
  commands. Requires an authenticated CLI session (see absuite-login-cli). For atomic PATCH
  updates or raw HTTP, use the absuite-learning (REST) skill.
---

# Alliance Business Suite — Learning Skill (CLI)

Drive the `LearningService` through the `absuite` CLI. The CLI service token is **`learning`**. All commands run against the same API as the REST skill, but the CLI handles auth headers and the response envelope for you.

> For atomic partial updates (JSON Patch) or raw HTTP/curl, use the `absuite-learning` (REST) skill — the `absuite` CLI does not support PATCH. For general CLI conventions, see `absuite-cli`.

## Prerequisites

1. **Authenticate first**: `absuite login` (see `absuite-login-cli`).
2. **Set your default tenant** so you can omit `--TenantId` on tenant-scoped calls:
   `absuite config set --tenant-id <tenant-guid>`
   (or pass `--TenantId <tenant-guid>` explicitly on each call; examples below use `$TENANT_ID`).
3. **Discover commands**: `absuite learning list-commands`, and `absuite learning <command> --help` for the full parameter/DTO schema of any command.

## Command structure

```
absuite learning <verb> <entity> --Param value
```

Verbs available: **list, count, search, get, create, update, delete** (plus the service-specific reads listed below). The canonical PowerShell function-name form also works and is 1:1 with the API operation, e.g.:

- `absuite learning Get-CoursesAsync --TenantId $TENANT_ID`
- `absuite learning New-CourseAsync --TenantId $TENANT_ID --CourseCreateDto '{...}'`
- `absuite learning Update-CourseAsync --TenantId $TENANT_ID --CourseId <course-guid> --CourseUpdateDto '{...}'`
- `absuite learning Invoke-DeleteCourseAsync --TenantId $TENANT_ID --CourseId <course-guid>`

Notes on the underlying functions (handy when using `--help`): **create** is `New-<Entity>Async`, **delete** is `Invoke-Delete<Entity>Async`, **update** is `Update-<Entity>Async`, and list/get/count are `Get-...Async`.

### Parameters & tenant scoping

- ID and DTO parameters are PascalCase, matching the entity: `--CourseId`, `--CourseSectionId`, `--CourseCreateDto`, etc.
- JSON DTOs are passed as a single-quoted JSON string with camelCase field names, exactly as in the API (`--CourseCreateDto '{"title":"...","description":"..."}'`).
- **Tenant scoping is per-command** (the CLI passes `--TenantId` through to the API's `tenantId`):
  - Top-level **list/count/create/update/delete** require `--TenantId` (or a configured default tenant).
  - Most **get-by-id** and **by-course** read commands do **not** need a tenant; pass it only where noted (Enrollments, Certificates, Profiles, Templates).
  - **`Me/*` read commands take NO tenant** — they resolve from your logged-in session.

## Courses

```bash
absuite learning list courses --TenantId $TENANT_ID
absuite learning count courses --TenantId $TENANT_ID
# Get by ID (tenant optional)
absuite learning get course-by-id --CourseId <course-guid>
# Create — title + description are REQUIRED
absuite learning create course --TenantId $TENANT_ID --CourseCreateDto '{
  "title": "Introduction to Cloud Computing",
  "description": "A beginner-friendly overview of cloud platforms.",
  "sku": "CLD-101",
  "code": "CLD101",
  "currencyId": "<currency-guid>",
  "regularPrice": 199.00,
  "maxCourseEnrollments": 100
}'
# Update — adds "published"
absuite learning update course --TenantId $TENANT_ID --CourseId <course-guid> --CourseUpdateDto '{
  "title": "Introduction to Cloud Computing (2026)",
  "description": "Updated for 2026.",
  "published": true
}'
absuite learning delete course --TenantId $TENANT_ID --CourseId <course-guid>
```

### Course sub-resource reads

Each lists a course's related entities; most need no tenant. Counterpart `count …-by-course` commands exist for each.

```bash
absuite learning get course-sections-by-course --CourseId <course-guid>
absuite learning get course-units-by-section --CourseId <course-guid> --SectionId <section-guid>
absuite learning get course-unit-components-by-course --CourseId <course-guid>
absuite learning get course-content-groups-by-course --CourseId <course-guid>
absuite learning get course-assignments-by-course --CourseId <course-guid>
absuite learning get course-problem-sets-by-course --CourseId <course-guid>
absuite learning get course-categories-by-course --CourseId <course-guid>
absuite learning get course-cohorts-by-course --CourseId <course-guid>
absuite learning get course-forums-by-course --CourseId <course-guid>
absuite learning get course-wikis-by-course --CourseId <course-guid>
absuite learning get course-articles-by-course-wiki --CourseId <course-guid> --WikiId <wiki-guid>
absuite learning get course-updates-by-course --CourseId <course-guid>
absuite learning get course-handouts-by-course --CourseId <course-guid>
absuite learning get course-files-by-course --CourseId <course-guid>
absuite learning get course-libraries-by-course --CourseId <course-guid>
absuite learning get course-pages-by-course --CourseId <course-guid>
absuite learning get instructor-profiles-by-course --CourseId <course-guid>
absuite learning get student-profiles-by-course --CourseId <course-guid>
# Enrollments by course — tenant REQUIRED here
absuite learning get course-enrollments-by-course --TenantId $TENANT_ID --CourseId <course-guid>
```

## Course content tree

All families share the same shape: **list / count / get / create / update / delete**. Only the entity name, ID param, and DTO differ.

### Sections

```bash
absuite learning list course-sections --TenantId $TENANT_ID
absuite learning count course-sections --TenantId $TENANT_ID
absuite learning get course-section-by-id --CourseSectionId <section-guid>
# Create — name + courseId REQUIRED
absuite learning create course-section --TenantId $TENANT_ID --CourseSectionCreateDto '{
  "name": "Week 1: Fundamentals",
  "courseId": "<course-guid>",
  "hideFromStudents": false
}'
absuite learning update course-section --TenantId $TENANT_ID --CourseSectionId <section-guid> --CourseSectionUpdateDto '{"name":"Week 1 (Revised)"}'
absuite learning delete course-section --TenantId $TENANT_ID --CourseSectionId <section-guid>
```

### Units

ID param `--CourseUnitId`. Create DTO `--CourseUnitCreateDto`: `title` REQ, `courseId` REQ, `courseSectionId` REQ, plus `description`, `content`, `courseContentGroupId`, `releaseDateTime`.

```bash
absuite learning list course-units --TenantId $TENANT_ID
absuite learning get course-unit-by-id --CourseUnitId <unit-guid>
absuite learning create course-unit --TenantId $TENANT_ID --CourseUnitCreateDto '{
  "title": "Introduction to AWS",
  "courseId": "<course-guid>",
  "courseSectionId": "<section-guid>"
}'
absuite learning update course-unit --TenantId $TENANT_ID --CourseUnitId <unit-guid> --CourseUnitUpdateDto '{...}'
absuite learning delete course-unit --TenantId $TENANT_ID --CourseUnitId <unit-guid>
```

### Unit Components

ID param `--CourseUnitComponentId`. Create DTO `--CourseUnitComponentCreateDto`: `title` REQ, `courseId` REQ, plus `description`, `content`, `order`, `courseUnitId`.

### Content Groups

ID param `--CourseContentGroupId`. Create DTO `--CourseContentGroupCreateDto`: `name` REQ, `courseId` REQ.

## Cohorts & Enrollments

### Cohorts

ID param `--CourseCohortId`. Create DTO `--CourseCohortCreateDto`: `name` REQ, `courseId` REQ, plus `startDateTime`, `endDateTime`, `expectedStartDateTime`, `expectedEndDateTime`.

```bash
absuite learning list course-cohorts --TenantId $TENANT_ID
absuite learning get course-cohort-by-id --CourseCohortId <cohort-guid>
absuite learning create course-cohort --TenantId $TENANT_ID --CourseCohortCreateDto '{"name":"Spring 2026","courseId":"<course-guid>"}'
```

### Enrollments

ID param `--CourseEnrollmentId`. **Get-by-id requires `--TenantId`.** Create DTO fields all optional: `courseId`, `courseCohortId`, `studentProfileId`, `courseCompletionCertificateId`.

```bash
absuite learning list enrollments --TenantId $TENANT_ID
absuite learning count enrollments --TenantId $TENANT_ID
absuite learning get course-enrollment --TenantId $TENANT_ID --CourseEnrollmentId <enrollment-guid>
absuite learning create course-enrollment --TenantId $TENANT_ID --CourseEnrollmentCreateDto '{
  "courseId": "<course-guid>",
  "studentProfileId": "<student-guid>"
}'
absuite learning update course-enrollment --TenantId $TENANT_ID --CourseEnrollmentId <enrollment-guid> --CourseEnrollmentUpdateDto '{"courseCohortId":"<cohort-guid>"}'
absuite learning delete course-enrollment --TenantId $TENANT_ID --CourseEnrollmentId <enrollment-guid>
# Enrollments for a specific student (tenant REQUIRED)
absuite learning get student-course-enrollments --TenantId $TENANT_ID --StudentProfileId <student-guid>
```

## Assignments, Types, Components & Problem Sets

### Assignments

ID param `--CourseAssignmentId`. Create DTO `--CourseAssignmentCreateDto`: `title` REQ, `courseId` REQ, plus `description`, `instructions`, `points`, `courseUnitId`, `courseCohortId`, `courseAssignmentTypeId`, `dueDateTime`, `asignToAllCohorts` (note spelling), `resources`.

```bash
absuite learning list course-assignments --TenantId $TENANT_ID
absuite learning get course-assignment-by-id --CourseAssignmentId <assignment-guid>
absuite learning create course-assignment --TenantId $TENANT_ID --CourseAssignmentCreateDto '{
  "title": "Lab 1",
  "courseId": "<course-guid>",
  "points": 100,
  "asignToAllCohorts": true
}'
```

### Assignment Types

ID param `--CourseAssignmentTypeId`. Create DTO `--CourseAssignmentTypeCreateDto`: `name` REQ, `courseId` REQ, plus `abbreviation`, `weight`, `quantity`, `excluded`.

### Assignment Components

ID param `--CourseAssignmentComponentId`. Create DTO `--CourseAssignmentComponentCreateDto`: `title` REQ, `courseAssignmentId` REQ, `courseId` REQ, plus `description`, `content`, `order`.

### Problem Sets

ID param `--CourseProblemSetId`. Create DTO `--CourseProblemSetCreateDto`: `title` REQ, `courseId` REQ, plus `description`, `overallScore`, `courseUnitId`, `courseGradingRubricId`, `releaseDateTime`.

### Grading Rubrics

ID param `--CourseGradingRubricId`. Create DTO `--CourseGradingRubricCreateDto`: `title` REQ, `courseId` REQ, plus `description`, `enablePoints`.

## Certificates & Templates

### Certificates

ID param `--CourseCertificateId`. **Get-by-id requires `--TenantId`.** Create DTO `--CourseCompletionCertificateCreateDto`: `studentProfileId` REQ, `courseEnrollmentId` REQ, plus `courseCompletionCertificateTemplateId`, `courseId`.

```bash
absuite learning list course-certificates --TenantId $TENANT_ID
absuite learning get course-certificate --TenantId $TENANT_ID --CourseCertificateId <cert-guid>
absuite learning create course-certificate --TenantId $TENANT_ID --CourseCompletionCertificateCreateDto '{
  "studentProfileId": "<student-guid>",
  "courseEnrollmentId": "<enrollment-guid>"
}'
absuite learning delete course-certificate --TenantId $TENANT_ID --CourseCertificateId <cert-guid>
```

### Certificate Templates

ID param `--CourseCertificateTemplateId`. **All template commands (incl. get-by-id) require `--TenantId`.** Create DTO `--CourseCertificateTemplateCreateDto`: `courseId` REQ, plus `webPortalId`, `websiteThemeId`, `socialProfileId`, `parentWebContentId`, `parentWebContentVersionId`.

```bash
absuite learning list course-certificate-templates --TenantId $TENANT_ID
absuite learning get course-certificate-template --TenantId $TENANT_ID --CourseCertificateTemplateId <template-guid>
absuite learning create course-certificate-template --TenantId $TENANT_ID --CourseCertificateTemplateCreateDto '{"courseId":"<course-guid>","webPortalId":"<portal-guid>"}'
absuite learning delete course-certificate-template --TenantId $TENANT_ID --CourseCertificateTemplateId <template-guid>
```

## Course content & resources

Standard family shape (list/count/get/create/update/delete). Entity, ID param, and create-DTO REQ fields:

| Family | Entity (verb target) | ID param | Create DTO — REQ fields in **bold** |
|---|---|---|---|
| Categories | `course-category` | `--CourseCategoryId` | **title**, description, imageURL, isFeatured |
| Forums | `course-forum` | `--CourseForumId` | **title**, description, **courseId** |
| Wikis | `course-wiki` | `--CourseWikiId` | **title**, description, **courseId**, courseUnitId, releaseDateTime |
| Articles | `course-article` | `--CourseArticleId` | **title**, description, content, **courseId**, **courseWikiId** |
| Pages | `course-page` | `--CoursePageId` | **title**, description, content, slug, **courseId** |
| Updates | `course-update` | `--CourseUpdateId` | **title**, description, content, **courseId** (DTO `--CourseNewsCreateDto`) |
| Handouts | `course-handout` | `--CourseHandoutId` | **name**, description, content, url, releaseDateTime, **courseId**, courseUnitId |
| Files | `course-file` | `--CourseFileId` | **title**, **fileName**, **fileUploadURL**, contentType, fileLength, **courseId** |
| Libraries | `course-library` | `--CourseLibraryId` | **title**, description, **courseId**, courseUnitId, releaseDateTime |

```bash
# Example (Articles — courseWikiId is required)
absuite learning list course-articles --TenantId $TENANT_ID
absuite learning get course-article-by-id --CourseArticleId <article-guid>
absuite learning create course-article --TenantId $TENANT_ID --CourseArticleCreateDto '{
  "title": "What is IaaS?",
  "content": "...",
  "courseId": "<course-guid>",
  "courseWikiId": "<wiki-guid>"
}'
```

> The Updates resource takes `--CourseNewsCreateDto` / `--CourseNewsUpdateDto` despite the `course-update` verb target. Categories has no `courseId` in its create body.

## Team Memberships

ID param `--CourseTeamMembershipId`. Create DTO `--CourseTeamMembershipCreateDto`: `courseId` REQ, `instructorProfileId` REQ, `courseTeamMembershipType` (`Admin` | `Staff`).

```bash
absuite learning list course-team-memberships --TenantId $TENANT_ID
absuite learning create course-team-membership --TenantId $TENANT_ID --CourseTeamMembershipCreateDto '{
  "courseId": "<course-guid>",
  "instructorProfileId": "<instructor-guid>",
  "courseTeamMembershipType": "Staff"
}'
```

## Instructor & Student Profiles

Both share fields: `type`, `contactId`, `about`, `avatarUrl`, and `data`/`dataLabel` + `data1`…`data9`/`data1Label`…`data9Label`. Instructor profiles also have `authorized` (boolean). **For both, list/count/get-by-id/create/update/delete all require `--TenantId`.**

### Instructors

ID param `--InstructorProfileId`. Create DTO `--InstructorProfileCreateDto`.

```bash
absuite learning list instructor-profiles --TenantId $TENANT_ID
absuite learning count instructor-profiles --TenantId $TENANT_ID
absuite learning get instructor-profile --TenantId $TENANT_ID --InstructorProfileId <instructor-guid>
absuite learning create instructor-profile --TenantId $TENANT_ID --InstructorProfileCreateDto '{
  "contactId": "<contact-guid>",
  "about": "Cloud architect and instructor.",
  "authorized": true
}'
```

### Students

ID param `--StudentProfileId`. Create DTO `--StudentProfileCreateDto`. Plus two per-student stat reads (tenant REQUIRED):

```bash
absuite learning list student-profiles --TenantId $TENANT_ID
absuite learning get student-profile --TenantId $TENANT_ID --StudentProfileId <student-guid>
absuite learning get student-average --TenantId $TENANT_ID --StudentProfileId <student-guid>
absuite learning get student-hours-completed --TenantId $TENANT_ID --StudentProfileId <student-guid>
```

## My Learning (Me) — user-scoped, NO tenant

Read-only commands resolved from your logged-in session. **Do not pass `--TenantId`.**

```bash
absuite learning get my-average-score
absuite learning get my-certificates
absuite learning count my-certificates
absuite learning get my-courses              # courses I'm enrolled in as a student
absuite learning count my-courses
absuite learning get my-enrollments
absuite learning count my-enrollments
absuite learning get my-hours-completed
absuite learning get my-instructor-courses
absuite learning count my-instructor-courses
absuite learning get my-instructor-profiles
absuite learning count my-instructor-profiles
absuite learning get my-pending-tasks
absuite learning get my-student-profiles
absuite learning count my-student-profiles
```

> Verb/entity aliases vary slightly by CLI build. If a `<verb> <entity>` form is not recognized, run `absuite learning list-commands` or use the canonical function name (e.g. `absuite learning Get-MyStudentCoursesAsync`).

## End-to-end workflow

```bash
# 1. Create a course (title + description REQUIRED)
absuite learning create course --TenantId $TENANT_ID --CourseCreateDto '{"title":"DevOps 101","description":"CI/CD fundamentals"}'
# 2. Add a section (name + courseId REQUIRED)
absuite learning create course-section --TenantId $TENANT_ID --CourseSectionCreateDto '{"name":"Module 1","courseId":"<course-guid>"}'
# 3. Add a unit (title + courseId + courseSectionId REQUIRED)
absuite learning create course-unit --TenantId $TENANT_ID --CourseUnitCreateDto '{"title":"Pipelines","courseId":"<course-guid>","courseSectionId":"<section-guid>"}'
# 4. Enroll a student
absuite learning create course-enrollment --TenantId $TENANT_ID --CourseEnrollmentCreateDto '{"courseId":"<course-guid>","studentProfileId":"<student-guid>"}'
# 5. Publish the course (whole-object update; CLI has no PATCH)
absuite learning update course --TenantId $TENANT_ID --CourseId <course-guid> --CourseUpdateDto '{"title":"DevOps 101","description":"CI/CD fundamentals","published":true}'
```

> The CLI has no PATCH. To change a couple of fields, fetch the entity, merge your changes, and send the full object via `update` — or use the `absuite-learning` (REST) skill for an atomic JSON Patch.

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List courses | `absuite learning list courses --TenantId <guid>` |
| Count courses | `absuite learning count courses --TenantId <guid>` |
| Get course | `absuite learning get course-by-id --CourseId <guid>` |
| Create course | `absuite learning create course --TenantId <guid> --CourseCreateDto '{...}'` |
| Update course | `absuite learning update course --TenantId <guid> --CourseId <guid> --CourseUpdateDto '{...}'` |
| Delete course | `absuite learning delete course --TenantId <guid> --CourseId <guid>` |
| List sections | `absuite learning list course-sections --TenantId <guid>` |
| Create section | `absuite learning create course-section --TenantId <guid> --CourseSectionCreateDto '{...}'` |
| List units | `absuite learning list course-units --TenantId <guid>` |
| Create unit | `absuite learning create course-unit --TenantId <guid> --CourseUnitCreateDto '{...}'` |
| List unit components | `absuite learning list course-unit-components --TenantId <guid>` |
| Create unit component | `absuite learning create course-unit-component --TenantId <guid> --CourseUnitComponentCreateDto '{...}'` |
| List content groups | `absuite learning list course-content-groups --TenantId <guid>` |
| List cohorts | `absuite learning list course-cohorts --TenantId <guid>` |
| Create cohort | `absuite learning create course-cohort --TenantId <guid> --CourseCohortCreateDto '{...}'` |
| List enrollments | `absuite learning list enrollments --TenantId <guid>` |
| Get enrollment | `absuite learning get course-enrollment --TenantId <guid> --CourseEnrollmentId <guid>` |
| Create enrollment | `absuite learning create course-enrollment --TenantId <guid> --CourseEnrollmentCreateDto '{...}'` |
| Enrollments by student | `absuite learning get student-course-enrollments --TenantId <guid> --StudentProfileId <guid>` |
| List assignments | `absuite learning list course-assignments --TenantId <guid>` |
| Create assignment | `absuite learning create course-assignment --TenantId <guid> --CourseAssignmentCreateDto '{...}'` |
| List assignment types | `absuite learning list course-assignment-types --TenantId <guid>` |
| List assignment components | `absuite learning list course-assignment-components --TenantId <guid>` |
| List problem sets | `absuite learning list course-problem-sets --TenantId <guid>` |
| Create problem set | `absuite learning create course-problem-set --TenantId <guid> --CourseProblemSetCreateDto '{...}'` |
| List grading rubrics | `absuite learning list course-grading-rubrics --TenantId <guid>` |
| List certificates | `absuite learning list course-certificates --TenantId <guid>` |
| Create certificate | `absuite learning create course-certificate --TenantId <guid> --CourseCompletionCertificateCreateDto '{...}'` |
| List certificate templates | `absuite learning list course-certificate-templates --TenantId <guid>` |
| Create certificate template | `absuite learning create course-certificate-template --TenantId <guid> --CourseCertificateTemplateCreateDto '{...}'` |
| List categories | `absuite learning list course-categories --TenantId <guid>` |
| List forums | `absuite learning list course-forums --TenantId <guid>` |
| List wikis | `absuite learning list course-wikis --TenantId <guid>` |
| List articles | `absuite learning list course-articles --TenantId <guid>` |
| List pages | `absuite learning list course-pages --TenantId <guid>` |
| List updates | `absuite learning list course-updates --TenantId <guid>` |
| List handouts | `absuite learning list course-handouts --TenantId <guid>` |
| List files | `absuite learning list course-files --TenantId <guid>` |
| List libraries | `absuite learning list course-libraries --TenantId <guid>` |
| List team memberships | `absuite learning list course-team-memberships --TenantId <guid>` |
| List instructor profiles | `absuite learning list instructor-profiles --TenantId <guid>` |
| List student profiles | `absuite learning list student-profiles --TenantId <guid>` |
| Student average | `absuite learning get student-average --TenantId <guid> --StudentProfileId <guid>` |
| Student hours completed | `absuite learning get student-hours-completed --TenantId <guid> --StudentProfileId <guid>` |
| My enrolled courses | `absuite learning get my-courses` |
| My enrollments | `absuite learning get my-enrollments` |
| My certificates | `absuite learning get my-certificates` |
| My average score | `absuite learning get my-average-score` |
| My instructor courses | `absuite learning get my-instructor-courses` |
| My pending tasks | `absuite learning get my-pending-tasks` |

## Critical Rules

- **Authenticate first** with `absuite login` (see `absuite-login-cli`).
- **Tenant scoping is per-command.** Top-level list/count/create/update/delete need `--TenantId` (or a configured default); most get-by-id and by-course reads do not; Enrollments/Certificates/Templates/Profiles get-by-id do; `Me/*` commands take none.
- **Course hierarchy**: Course → Section → Unit → Unit Component. Create in order; Units need both `courseId` and `courseSectionId`; Articles need `courseWikiId`.
- **No PATCH in the CLI.** Use full-object `update`, or the `absuite-learning` REST skill for atomic JSON Patch.
- **DTO field names are camelCase** exactly as in the API (`imageURL`, `fileUploadURL`, `asignToAllCohorts`).
- **Use `--help`** on any command for its full DTO schema: `absuite learning create course --help`.
