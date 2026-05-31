---
name: absuite-learning
description: >
  Manage learning and e-learning in the Alliance Business Suite (ABS) using the
  `absuite` CLI or REST API. Covers courses, sections, units, unit components,
  assignments, problem sets, cohorts, enrollments, certificates, forums, wikis,
  articles, handouts, files, libraries, pages, updates, grading rubrics, content
  groups, team memberships, and instructor/student profiles. Requires authentication.
---

# Alliance Business Suite — Learning Skill

Manage e-learning through the `absuite` CLI's `learning` service or the `LearningService` REST API. All operations are tenant-scoped and require authentication.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite learning list-commands`

## REST API Authentication

To call the API directly via REST instead of the CLI:

1. **Obtain a bearer token:**
```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$ABSUITE_USER_EMAIL'", "password": "'$ABSUITE_USER_PASSWORD'"}'
```
Extract the `accessToken` from the JSON response.

2. **Use the token in all subsequent requests:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **All REST endpoints use the base path:** `$ABSUITE_HOST_URL/api/v2/`

## Key Concepts

- **Course** — a top-level learning entity with sections, units, and content.
- **Section** — a grouping within a course (e.g., "Week 1", "Module 2").
- **Unit** — a lesson within a section.
- **Unit Component** — a content block within a unit (video, text, quiz).
- **Cohort** — a group of students taking a course together.
- **Enrollment** — a student's registration in a course.
- **Assignment** — graded work for students.
- **Problem Set** — practice exercises.
- **Certificate** — completion credential.

## Courses

```bash
# List
absuite learning list courses --TenantId $TENANT_ID

# Count
absuite learning count courses --TenantId $TENANT_ID

# Get by ID
absuite learning get course-by-id --TenantId $TENANT_ID --CourseId <course-guid>

# Create
absuite learning create course --TenantId $TENANT_ID --CourseCreateDto '{
  "Title": "Introduction to Cloud Computing"
}'

# Update
absuite learning update course --TenantId $TENANT_ID --CourseId <course-guid> --CourseUpdateDto '{...}'

# Delete
absuite learning delete course --TenantId $TENANT_ID --CourseId <course-guid>
```

**REST API equivalents:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/Courses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Title": "Introduction to Cloud Computing"}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Course sub-resource endpoints (REST):**
```bash
# Articles for a course (via wiki)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Articles/<wiki-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assignments for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Assignments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Assignments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Categories for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Categories/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Cohorts for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Cohorts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Cohorts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Content groups for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/ContentGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/ContentGroups/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Enrollments for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Enrollments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Files for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Files" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Files/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Forums for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Forums" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Forums/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Handouts for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Handouts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Handouts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Instructors for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Instructors" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Instructors/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Libraries for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Libraries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Libraries/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Pages for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Pages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Pages/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Problem sets for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/ProblemSets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/ProblemSets/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Sections for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Sections" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Sections/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Students for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Students" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Students/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Unit components for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/UnitComponents" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/UnitComponents/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Units for a course section
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Units/<section-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Units/<section-guid>/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Updates for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Updates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Updates/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Wikis for a course
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Wikis" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Wikis/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Course Structure: Sections → Units → Components

### Sections

```bash
absuite learning list course-sections --TenantId $TENANT_ID
absuite learning count course-sections --TenantId $TENANT_ID
absuite learning get course-sections-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning get course-section-by-id --TenantId $TENANT_ID --CourseSectionId <section-guid>
absuite learning create course-section --TenantId $TENANT_ID --CourseSectionCreateDto '{"Title": "Week 1: Fundamentals"}'
absuite learning update course-section --TenantId $TENANT_ID --CourseSectionId <section-guid> --CourseSectionUpdateDto '{...}'
absuite learning delete course-section --TenantId $TENANT_ID --CourseSectionId <section-guid>
```

**REST API equivalents:**
```bash
# List all sections
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get sections by course (sub-resource)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Sections" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections/<section-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Title": "Week 1: Fundamentals"}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections/<section-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseSections/<section-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Units

```bash
absuite learning list course-units --TenantId $TENANT_ID
absuite learning count course-units --TenantId $TENANT_ID
absuite learning get course-units-by-section --TenantId $TENANT_ID --CourseSectionId <section-guid>
absuite learning count course-units-by-section --TenantId $TENANT_ID --CourseSectionId <section-guid>
absuite learning get course-unit-by-id --TenantId $TENANT_ID --CourseUnitId <unit-guid>
absuite learning create course-unit --TenantId $TENANT_ID --CourseUnitCreateDto '{"Title": "Introduction to AWS"}'
absuite learning update course-unit --TenantId $TENANT_ID --CourseUnitId <unit-guid> --CourseUnitUpdateDto '{...}'
absuite learning delete course-unit --TenantId $TENANT_ID --CourseUnitId <unit-guid>
```

**REST API equivalents:**
```bash
# List all units
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnits" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnits/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get units by section (sub-resource via course)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Units/<section-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Units/<section-guid>/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnits/<unit-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnits" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Title": "Introduction to AWS"}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnits/<unit-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnits/<unit-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Unit Components

```bash
absuite learning list course-unit-components --TenantId $TENANT_ID
absuite learning count course-unit-components --TenantId $TENANT_ID
absuite learning get course-unit-components-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning count course-unit-components-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning get course-unit-component-by-id --TenantId $TENANT_ID --CourseUnitComponentId <component-guid>
absuite learning create course-unit-component --TenantId $TENANT_ID --CourseUnitComponentCreateDto '{...}'
absuite learning update course-unit-component --TenantId $TENANT_ID --CourseUnitComponentId <component-guid> --CourseUnitComponentUpdateDto '{...}'
absuite learning delete course-unit-component --TenantId $TENANT_ID --CourseUnitComponentId <component-guid>
```

**REST API equivalents:**
```bash
# List all unit components
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnitComponents" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnitComponents/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get unit components by course (sub-resource)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/UnitComponents" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/UnitComponents/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnitComponents/<component-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnitComponents" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnitComponents/<component-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUnitComponents/<component-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Enrollments

```bash
absuite learning list enrollments --TenantId $TENANT_ID
absuite learning count enrollments --TenantId $TENANT_ID
absuite learning get course-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>
absuite learning get course-enrollments-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning create course-enrollment --TenantId $TENANT_ID --CourseEnrollmentCreateDto '{...}'
absuite learning update course-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --CourseEnrollmentUpdateDto '{...}'
absuite learning delete course-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>

# Student-specific enrollments
absuite learning list student-course-enrollments --TenantId $TENANT_ID --StudentProfileId <student-guid>
```

**REST API equivalents:**
```bash
# List all enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments/<enrollment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get enrollments by course (sub-resource)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Enrollments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments/<enrollment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments/<enrollment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Cohorts

```bash
absuite learning list course-cohorts --TenantId $TENANT_ID
absuite learning count course-cohorts --TenantId $TENANT_ID
absuite learning get course-cohorts-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning get course-cohort-by-id --TenantId $TENANT_ID --CourseCohortId <cohort-guid>
absuite learning create course-cohort --TenantId $TENANT_ID --CourseCohortCreateDto '{...}'
absuite learning update course-cohort --TenantId $TENANT_ID --CourseCohortId <cohort-guid> --CourseCohortUpdateDto '{...}'
absuite learning delete course-cohort --TenantId $TENANT_ID --CourseCohortId <cohort-guid>
```

**REST API equivalents:**
```bash
# List all cohorts
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCohorts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCohorts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get cohorts by course (sub-resource)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Cohorts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Cohorts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCohorts/<cohort-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCohorts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCohorts/<cohort-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCohorts/<cohort-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Assignments & Problem Sets

```bash
# Assignments
absuite learning list course-assignments --TenantId $TENANT_ID
absuite learning count course-assignments --TenantId $TENANT_ID
absuite learning get course-assignments-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning get course-assignment-by-id --TenantId $TENANT_ID --CourseAssignmentId <assignment-guid>
absuite learning create course-assignment --TenantId $TENANT_ID --CourseAssignmentCreateDto '{...}'
absuite learning update course-assignment --TenantId $TENANT_ID --CourseAssignmentId <assignment-guid> --CourseAssignmentUpdateDto '{...}'
absuite learning delete course-assignment --TenantId $TENANT_ID --CourseAssignmentId <assignment-guid>

# Problem Sets
absuite learning list course-problem-sets --TenantId $TENANT_ID
absuite learning count course-problem-sets --TenantId $TENANT_ID
absuite learning get course-problem-sets-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning get course-problem-set-by-id --TenantId $TENANT_ID --CourseProblemSetId <problemset-guid>
absuite learning create course-problem-set --TenantId $TENANT_ID --CourseProblemSetCreateDto '{...}'
absuite learning update course-problem-set --TenantId $TENANT_ID --CourseProblemSetId <problemset-guid> --CourseProblemSetUpdateDto '{...}'
absuite learning delete course-problem-set --TenantId $TENANT_ID --CourseProblemSetId <problemset-guid>
```

**REST API equivalents:**
```bash
# Assignments — List
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assignments — Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assignments by course (sub-resource)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Assignments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Assignments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assignments — Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignments/<assignment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Assignments — Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Assignments — Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignments/<assignment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Assignments — Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignments/<assignment-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Problem Sets — List
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseProblemSets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Problem Sets — Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseProblemSets/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Problem sets by course (sub-resource)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/ProblemSets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/ProblemSets/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Problem Sets — Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseProblemSets/<problemset-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Problem Sets — Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseProblemSets" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Problem Sets — Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseProblemSets/<problemset-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Problem Sets — Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseProblemSets/<problemset-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Course Assignment Types

```bash
absuite learning list course-assignment-types --TenantId $TENANT_ID
absuite learning count course-assignment-types --TenantId $TENANT_ID
absuite learning get course-assignment-type-by-id --TenantId $TENANT_ID --CourseAssignmentTypeId <guid>
absuite learning create course-assignment-type --TenantId $TENANT_ID --CourseAssignmentTypeCreateDto '{...}'
absuite learning update course-assignment-type --TenantId $TENANT_ID --CourseAssignmentTypeId <guid> --CourseAssignmentTypeUpdateDto '{...}'
absuite learning delete course-assignment-type --TenantId $TENANT_ID --CourseAssignmentTypeId <guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignmentTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignmentTypes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignmentTypes/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignmentTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignmentTypes/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignmentTypes/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Course Assignment Components

```bash
absuite learning list course-assignment-components --TenantId $TENANT_ID
absuite learning count course-assignment-components --TenantId $TENANT_ID
absuite learning get course-assignment-component-by-id --TenantId $TENANT_ID --CourseAssignmentComponentId <guid>
absuite learning create course-assignment-component --TenantId $TENANT_ID --CourseAssignmentComponentCreateDto '{...}'
absuite learning update course-assignment-component --TenantId $TENANT_ID --CourseAssignmentComponentId <guid> --CourseAssignmentComponentUpdateDto '{...}'
absuite learning delete course-assignment-component --TenantId $TENANT_ID --CourseAssignmentComponentId <guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignmentComponents" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignmentComponents/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignmentComponents/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignmentComponents" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignmentComponents/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseAssignmentComponents/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Course Grading Rubrics

```bash
absuite learning list course-grading-rubrics --TenantId $TENANT_ID
absuite learning count course-grading-rubrics --TenantId $TENANT_ID
absuite learning get course-grading-rubric-by-id --TenantId $TENANT_ID --CourseGradingRubricId <guid>
absuite learning create course-grading-rubric --TenantId $TENANT_ID --CourseGradingRubricCreateDto '{...}'
absuite learning update course-grading-rubric --TenantId $TENANT_ID --CourseGradingRubricId <guid> --CourseGradingRubricUpdateDto '{...}'
absuite learning delete course-grading-rubric --TenantId $TENANT_ID --CourseGradingRubricId <guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseGradingRubrics" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseGradingRubrics/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseGradingRubrics/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseGradingRubrics" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseGradingRubrics/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseGradingRubrics/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Certificates & Templates

```bash
absuite learning list course-certificates --TenantId $TENANT_ID
absuite learning count course-certificates --TenantId $TENANT_ID
absuite learning get course-certificate --TenantId $TENANT_ID --CourseCertificateId <cert-guid>
absuite learning create course-certificate --TenantId $TENANT_ID --CourseCertificateCreateDto '{...}'
absuite learning update course-certificate --TenantId $TENANT_ID --CourseCertificateId <cert-guid> --CourseCertificateUpdateDto '{...}'
absuite learning delete course-certificate --TenantId $TENANT_ID --CourseCertificateId <cert-guid>

# Certificate templates
absuite learning list course-certificate-templates --TenantId $TENANT_ID
absuite learning get course-certificate-template --TenantId $TENANT_ID --CertificateTemplateId <template-guid>
absuite learning create course-certificate-template --TenantId $TENANT_ID --CertificateTemplateCreateDto '{...}'
absuite learning delete course-certificate-template --TenantId $TENANT_ID --CertificateTemplateId <template-guid>
```

**REST API equivalents:**
```bash
# Certificates — List
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Certificates — Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Certificates — Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/<cert-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Certificates — Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Certificates — Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/<cert-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Certificates — Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/<cert-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Certificate Templates — List
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/Template" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Certificate Templates — Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/Template/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Certificate Templates — Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/Template/<template-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Certificate Templates — Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/Template" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Certificate Templates — Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/Template/<template-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Certificate Templates — Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCertificates/Template/<template-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Course Content: Categories, Forums, Wikis, Articles, Pages, Updates

```bash
# Categories
absuite learning list course-categories --TenantId $TENANT_ID
absuite learning get course-categories-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning create course-category --TenantId $TENANT_ID --CourseCategoryCreateDto '{...}'

# Forums
absuite learning list course-forums --TenantId $TENANT_ID
absuite learning get course-forums-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning create course-forum --TenantId $TENANT_ID --CourseForumCreateDto '{...}'

# Wikis
absuite learning get course-wikis --TenantId $TENANT_ID
absuite learning get course-wikis-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning create course-wiki --TenantId $TENANT_ID --CourseWikiCreateDto '{...}'

# Articles (within wikis)
absuite learning list course-articles --TenantId $TENANT_ID
absuite learning get course-articles-by-course-wiki --TenantId $TENANT_ID --CourseWikiId <wiki-guid>
absuite learning create course-article --TenantId $TENANT_ID --CourseArticleCreateDto '{...}'

# Pages
absuite learning list course-pages --TenantId $TENANT_ID
absuite learning get course-pages-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning create course-page --TenantId $TENANT_ID --CoursePageCreateDto '{...}'

# Updates / Announcements
absuite learning list course-updates --TenantId $TENANT_ID
absuite learning get course-updates-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning create course-update --TenantId $TENANT_ID --CourseUpdateCreateDto '{...}'
```

**REST API equivalents:**
```bash
# Categories — List
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCategories/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Categories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Forums
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseForums" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseForums/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Forums" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseForums/<forum-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseForums" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseForums/<forum-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseForums/<forum-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Wikis
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseWikis" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseWikis/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Wikis" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseWikis/<wiki-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseWikis" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseWikis/<wiki-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseWikis/<wiki-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Articles
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseArticles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseArticles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Articles/<wiki-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseArticles/<article-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseArticles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseArticles/<article-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseArticles/<article-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Pages
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CoursePages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CoursePages/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Pages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CoursePages/<page-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CoursePages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CoursePages/<page-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CoursePages/<page-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Updates / Announcements
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUpdates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUpdates/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Updates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUpdates/<update-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUpdates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUpdates/<update-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseUpdates/<update-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Course Content Groups

```bash
absuite learning list course-content-groups --TenantId $TENANT_ID
absuite learning count course-content-groups --TenantId $TENANT_ID
absuite learning get course-content-group-by-id --TenantId $TENANT_ID --CourseContentGroupId <guid>
absuite learning create course-content-group --TenantId $TENANT_ID --CourseContentGroupCreateDto '{...}'
absuite learning update course-content-group --TenantId $TENANT_ID --CourseContentGroupId <guid> --CourseContentGroupUpdateDto '{...}'
absuite learning delete course-content-group --TenantId $TENANT_ID --CourseContentGroupId <guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseContentGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseContentGroups/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Content groups by course (sub-resource)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/ContentGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/ContentGroups/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseContentGroups/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseContentGroups" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseContentGroups/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseContentGroups/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Course Resources: Files, Handouts, Libraries

```bash
# Files
absuite learning list course-files --TenantId $TENANT_ID
absuite learning get course-files-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning create course-file --TenantId $TENANT_ID --CourseFileCreateDto '{...}'

# Handouts
absuite learning list course-handouts --TenantId $TENANT_ID
absuite learning get course-handouts-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning create course-handout --TenantId $TENANT_ID --CourseHandoutCreateDto '{...}'

# Libraries
absuite learning list course-libraries --TenantId $TENANT_ID
absuite learning get course-libraries-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning create course-library --TenantId $TENANT_ID --CourseLibraryCreateDto '{...}'
```

**REST API equivalents:**
```bash
# Files
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseFiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseFiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Files" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseFiles/<file-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseFiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseFiles/<file-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseFiles/<file-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Handouts
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseHandouts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseHandouts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Handouts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseHandouts/<handout-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseHandouts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseHandouts/<handout-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseHandouts/<handout-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Libraries
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseLibraries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseLibraries/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Libraries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseLibraries/<library-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseLibraries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseLibraries/<library-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseLibraries/<library-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Instructor & Student Profiles

```bash
# Instructors
absuite learning list instructor-profiles --TenantId $TENANT_ID
absuite learning count instructor-profiles --TenantId $TENANT_ID
absuite learning get instructor-profiles-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning create instructor-profiles --TenantId $TENANT_ID --InstructorProfileCreateDto '{...}'

# Students
absuite learning list student-profiles --TenantId $TENANT_ID
absuite learning count student-profiles --TenantId $TENANT_ID
absuite learning get student-profiles-by-course --TenantId $TENANT_ID --CourseId <course-guid>
absuite learning create student-profiles --TenantId $TENANT_ID --StudentProfileCreateDto '{...}'
```

**REST API equivalents:**
```bash
# Instructors — List
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/InstructorProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Instructors — Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/InstructorProfiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Instructors by course (sub-resource)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Instructors" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Instructors/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Instructors — Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/InstructorProfiles/<instructor-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Instructors — Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/InstructorProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Instructors — Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/InstructorProfiles/<instructor-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Instructors — Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/InstructorProfiles/<instructor-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Students — List
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/StudentProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Students — Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/StudentProfiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Students by course (sub-resource)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Students" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Courses/<course-guid>/Students/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Students — Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/StudentProfiles/<student-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Students — Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/StudentProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Students — Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/StudentProfiles/<student-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Students — Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/StudentProfiles/<student-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Student Profile Stats & Enrollment Lookup

```bash
# Average score for a student
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/StudentProfiles/<student-guid>/Average" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Hours completed by a student
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/StudentProfiles/<student-guid>/HoursCompleted" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Enrollments by student (sub-resource)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseEnrollments/Student/<student-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Course Team Memberships

```bash
absuite learning list course-team-memberships --TenantId $TENANT_ID
absuite learning count course-team-memberships --TenantId $TENANT_ID
absuite learning get course-team-membership-by-id --TenantId $TENANT_ID --CourseTeamMembershipId <guid>
absuite learning create course-team-membership --TenantId $TENANT_ID --CourseTeamMembershipCreateDto '{...}'
absuite learning update course-team-membership --TenantId $TENANT_ID --CourseTeamMembershipId <guid> --CourseTeamMembershipUpdateDto '{...}'
absuite learning delete course-team-membership --TenantId $TENANT_ID --CourseTeamMembershipId <guid>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseTeamMemberships" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseTeamMemberships/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/CourseTeamMemberships/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/LearningService/CourseTeamMemberships" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X PUT "$ABSUITE_HOST_URL/api/v2/LearningService/CourseTeamMemberships/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LearningService/CourseTeamMemberships/<guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## My Learning (Me)

Read-only endpoints for the currently authenticated user's learning data.

```bash
# Average score
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/AverageScore" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# My certificates
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/Certificates" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/Certificates/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# My courses
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/Courses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/Courses/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# My enrollments
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/Enrollments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Hours completed
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/HoursCompleted" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Courses where I'm an instructor
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/InstructorCourses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/InstructorCourses/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# My instructor profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/InstructorProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/InstructorProfiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Pending tasks
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/PendingTasks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# My student profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/StudentProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LearningService/Me/StudentProfiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List courses | `absuite learning list courses --TenantId <guid>` |
| Create course | `absuite learning create course --TenantId <guid> --CourseCreateDto '{...}'` |
| List sections | `absuite learning list course-sections --TenantId <guid>` |
| Create section | `absuite learning create course-section --TenantId <guid> --CourseSectionCreateDto '{...}'` |
| List units | `absuite learning list course-units --TenantId <guid>` |
| Create unit | `absuite learning create course-unit --TenantId <guid> --CourseUnitCreateDto '{...}'` |
| List unit components | `absuite learning list course-unit-components --TenantId <guid>` |
| Create unit component | `absuite learning create course-unit-component --TenantId <guid> --CourseUnitComponentCreateDto '{...}'` |
| List enrollments | `absuite learning list enrollments --TenantId <guid>` |
| Create enrollment | `absuite learning create course-enrollment --TenantId <guid> --CourseEnrollmentCreateDto '{...}'` |
| List cohorts | `absuite learning list course-cohorts --TenantId <guid>` |
| Create cohort | `absuite learning create course-cohort --TenantId <guid> --CourseCohortCreateDto '{...}'` |
| List assignments | `absuite learning list course-assignments --TenantId <guid>` |
| Create assignment | `absuite learning create course-assignment --TenantId <guid> --CourseAssignmentCreateDto '{...}'` |
| List problem sets | `absuite learning list course-problem-sets --TenantId <guid>` |
| Create problem set | `absuite learning create course-problem-set --TenantId <guid> --CourseProblemSetCreateDto '{...}'` |
| List certificates | `absuite learning list course-certificates --TenantId <guid>` |
| Create certificate | `absuite learning create course-certificate --TenantId <guid> --CourseCertificateCreateDto '{...}'` |
| List categories | `absuite learning list course-categories --TenantId <guid>` |
| List forums | `absuite learning list course-forums --TenantId <guid>` |
| List wikis | `absuite learning list course-wikis --TenantId <guid>` |
| List content groups | `absuite learning list course-content-groups --TenantId <guid>` |
| List team memberships | `absuite learning list course-team-memberships --TenantId <guid>` |
| List files | `absuite learning list course-files --TenantId <guid>` |
| List instructor profiles | `absuite learning list instructor-profiles --TenantId <guid>` |
| List student profiles | `absuite learning list student-profiles --TenantId <guid>` |

## API Endpoints Quick Reference

All paths relative to `/api/v2/LearningService/`.

| Resource | List | Get by ID | Create | Update | Delete | Count |
|---|---|---|---|---|---|---|
| Courses | `GET /Courses` | `GET /Courses/:id` | `POST /Courses` | `PUT /Courses/:id` | `DELETE /Courses/:id` | `GET /Courses/Count` |
| CourseSections | `GET /CourseSections` | `GET /CourseSections/:id` | `POST /CourseSections` | `PUT /CourseSections/:id` | `DELETE /CourseSections/:id` | `GET /CourseSections/Count` |
| CourseUnits | `GET /CourseUnits` | `GET /CourseUnits/:id` | `POST /CourseUnits` | `PUT /CourseUnits/:id` | `DELETE /CourseUnits/:id` | `GET /CourseUnits/Count` |
| CourseUnitComponents | `GET /CourseUnitComponents` | `GET /CourseUnitComponents/:id` | `POST /CourseUnitComponents` | `PUT /CourseUnitComponents/:id` | `DELETE /CourseUnitComponents/:id` | `GET /CourseUnitComponents/Count` |
| CourseEnrollments | `GET /CourseEnrollments` | `GET /CourseEnrollments/:id` | `POST /CourseEnrollments` | `PUT /CourseEnrollments/:id` | `DELETE /CourseEnrollments/:id` | `GET /CourseEnrollments/Count` |
| CourseCohorts | `GET /CourseCohorts` | `GET /CourseCohorts/:id` | `POST /CourseCohorts` | `PUT /CourseCohorts/:id` | `DELETE /CourseCohorts/:id` | `GET /CourseCohorts/Count` |
| CourseAssignments | `GET /CourseAssignments` | `GET /CourseAssignments/:id` | `POST /CourseAssignments` | `PUT /CourseAssignments/:id` | `DELETE /CourseAssignments/:id` | `GET /CourseAssignments/Count` |
| CourseAssignmentTypes | `GET /CourseAssignmentTypes` | `GET /CourseAssignmentTypes/:id` | `POST /CourseAssignmentTypes` | `PUT /CourseAssignmentTypes/:id` | `DELETE /CourseAssignmentTypes/:id` | `GET /CourseAssignmentTypes/Count` |
| CourseAssignmentComponents | `GET /CourseAssignmentComponents` | `GET /CourseAssignmentComponents/:id` | `POST /CourseAssignmentComponents` | `PUT /CourseAssignmentComponents/:id` | `DELETE /CourseAssignmentComponents/:id` | `GET /CourseAssignmentComponents/Count` |
| CourseProblemSets | `GET /CourseProblemSets` | `GET /CourseProblemSets/:id` | `POST /CourseProblemSets` | `PUT /CourseProblemSets/:id` | `DELETE /CourseProblemSets/:id` | `GET /CourseProblemSets/Count` |
| CourseCertificates | `GET /CourseCertificates` | `GET /CourseCertificates/:id` | `POST /CourseCertificates` | `PUT /CourseCertificates/:id` | `DELETE /CourseCertificates/:id` | `GET /CourseCertificates/Count` |
| Certificate Templates | `GET /CourseCertificates/Template` | `GET /CourseCertificates/Template/:id` | `POST /CourseCertificates/Template` | `PUT /CourseCertificates/Template/:id` | `DELETE /CourseCertificates/Template/:id` | `GET /CourseCertificates/Template/Count` |
| CourseCategories | `GET /CourseCategories` | `GET /CourseCategories/:id` | `POST /CourseCategories` | `PUT /CourseCategories/:id` | `DELETE /CourseCategories/:id` | `GET /CourseCategories/Count` |
| CourseForums | `GET /CourseForums` | `GET /CourseForums/:id` | `POST /CourseForums` | `PUT /CourseForums/:id` | `DELETE /CourseForums/:id` | `GET /CourseForums/Count` |
| CourseWikis | `GET /CourseWikis` | `GET /CourseWikis/:id` | `POST /CourseWikis` | `PUT /CourseWikis/:id` | `DELETE /CourseWikis/:id` | `GET /CourseWikis/Count` |
| CourseArticles | `GET /CourseArticles` | `GET /CourseArticles/:id` | `POST /CourseArticles` | `PUT /CourseArticles/:id` | `DELETE /CourseArticles/:id` | `GET /CourseArticles/Count` |
| CoursePages | `GET /CoursePages` | `GET /CoursePages/:id` | `POST /CoursePages` | `PUT /CoursePages/:id` | `DELETE /CoursePages/:id` | `GET /CoursePages/Count` |
| CourseUpdates | `GET /CourseUpdates` | `GET /CourseUpdates/:id` | `POST /CourseUpdates` | `PUT /CourseUpdates/:id` | `DELETE /CourseUpdates/:id` | `GET /CourseUpdates/Count` |
| CourseFiles | `GET /CourseFiles` | `GET /CourseFiles/:id` | `POST /CourseFiles` | `PUT /CourseFiles/:id` | `DELETE /CourseFiles/:id` | `GET /CourseFiles/Count` |
| CourseHandouts | `GET /CourseHandouts` | `GET /CourseHandouts/:id` | `POST /CourseHandouts` | `PUT /CourseHandouts/:id` | `DELETE /CourseHandouts/:id` | `GET /CourseHandouts/Count` |
| CourseLibraries | `GET /CourseLibraries` | `GET /CourseLibraries/:id` | `POST /CourseLibraries` | `PUT /CourseLibraries/:id` | `DELETE /CourseLibraries/:id` | `GET /CourseLibraries/Count` |
| CourseContentGroups | `GET /CourseContentGroups` | `GET /CourseContentGroups/:id` | `POST /CourseContentGroups` | `PUT /CourseContentGroups/:id` | `DELETE /CourseContentGroups/:id` | `GET /CourseContentGroups/Count` |
| CourseTeamMemberships | `GET /CourseTeamMemberships` | `GET /CourseTeamMemberships/:id` | `POST /CourseTeamMemberships` | `PUT /CourseTeamMemberships/:id` | `DELETE /CourseTeamMemberships/:id` | `GET /CourseTeamMemberships/Count` |
| CourseGradingRubrics | `GET /CourseGradingRubrics` | `GET /CourseGradingRubrics/:id` | `POST /CourseGradingRubrics` | `PUT /CourseGradingRubrics/:id` | `DELETE /CourseGradingRubrics/:id` | `GET /CourseGradingRubrics/Count` |
| InstructorProfiles | `GET /InstructorProfiles` | `GET /InstructorProfiles/:id` | `POST /InstructorProfiles` | `PUT /InstructorProfiles/:id` | `DELETE /InstructorProfiles/:id` | `GET /InstructorProfiles/Count` |
| StudentProfiles | `GET /StudentProfiles` | `GET /StudentProfiles/:id` | `POST /StudentProfiles` | `PUT /StudentProfiles/:id` | `DELETE /StudentProfiles/:id` | `GET /StudentProfiles/Count` |

## Critical Rules

- **Authenticate first.** Use `absuite login` (CLI) or obtain a bearer token (REST) before any learning operation.
- **Always provide a tenant context.**
- **Course hierarchy**: Course → Section → Unit → Unit Component. Create in order.
- **Use `--help`** on any CLI command for full DTO schemas.
- **REST base path**: `$ABSUITE_HOST_URL/api/v2/LearningService/`
