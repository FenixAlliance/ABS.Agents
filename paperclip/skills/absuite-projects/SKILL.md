---
name: absuite-projects
description: >
  Manage projects, project tasks, task categories, task types, project periods,
  time logs, and time-log approvals in the Alliance Business Suite (ABS) via the
  ProjectsService REST API. Covers list/count/get/create/update (PUT)/delete plus
  atomic PATCH (JSON Patch) updates and approval workflow actions. All operations
  are tenant-scoped and require a bearer token (see the absuite-login skill to
  authenticate).
---

# Alliance Business Suite — Projects Skill (REST)

Manage project management data through the `ProjectsService` REST API: projects and
their periods, tasks, task categories, task types, time logs, and time-log approvals.
Every endpoint is tenant-scoped — `tenantId` is **required** on every call, including
writes (POST/PUT/PATCH/DELETE).

For the CLI equivalent, see `absuite-projects-cli`. For the cross-domain REST
reference (envelope, tenant scoping, JSON Patch), see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select` — page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource** — it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) causes silent data loss.
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902) — it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

## Authentication

1. **Obtain a bearer token:**

```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'"$ABSUITE_USER_EMAIL"'", "password": "'"$ABSUITE_USER_PASSWORD"'"}'
```

Extract `accessToken` from the JSON response into `$ABSUITE_ACCESS_TOKEN`.

2. **Send the token on every subsequent request:**

```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/ProjectsService/...`

4. **Response envelope** — every response is wrapped:

```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "<guid>",
  "timestamp": "2026-06-12T12:00:00Z",
  "result": "<object | array | int | null>"
}
```

Always check `isSuccess`; read the payload from `result`.

## Tenant Scoping

`tenantId` is **required** on every ProjectsService endpoint (it appears as
`tenantId(query,req)` in the spec for all routes). Pass it as the `?tenantId=<tenant-guid>`
query parameter on **every** verb, including POST/PUT/PATCH/DELETE — omitting it on a
write returns 400. The header form `X-TenantId: <tenant-guid>` is the equivalent; the
query param is used in the examples below.

> Several TimeLogs / ProjectTasks / TimeLogApprovals endpoints also accept the optional
> `api-version` query parameter (or the `x-api-version` header). These are optional —
> omit them to use the default API version.

## Key Concepts

- **Project** — the top-level aggregate. Owns periods, tasks, task categories, and time
  logs. Created with `title`, `description`, optional `individualId` / `organizationId`
  (the party the project is for), and `projectStartDate` / `projectEndDate`.
- **Project Period** — a time window inside a project (e.g. a billing period or sprint),
  with `periodStartDate` / `periodEndDate`. Time-log approvals are requested per period.
- **Project Task** — a unit of work inside a project, with `title`, `description`,
  `startDate`, and `dueLine` (the due date). Tasks are addressable two ways: nested under
  a project (`/Projects/{projectId}/Tasks`) **and** at the top level (`/ProjectTasks`).
- **Task Category** — groups task types; tenant-wide or project-scoped (`title`, optional
  `projectId`).
- **Task Type** — a kind of task within a category (`title`, `taskCategoryId`,
  `displayInTimeTracker`, `requiresDescription`).
- **Time Log** — recorded effort against a task within a period (`timeSpan`, `logDate`,
  `comments`, `projectTaskId`, `projectPeriodId`).
  - `projectTimeLogRecordType` ∈ `RegularHours` | `OvertimeToPay` | `OvertimeToCompensate`.
- **Time-Log Approval** — an approval request for a project period's hours.
  - `approvalStatus` ∈ `Pending` | `Approved` | `Rejected`.

> Field names below are the **JSON body** field names exactly as the spec defines them
> (camelCase, e.g. `title`, `projectStartDate`, `dueLine`). They are sent in the request
> body; the response `result` mirrors them.

---

## Projects

### List projects

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count projects

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a project by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a project

`ProjectCreateDto` fields: `id`, `timestamp`, `title`, `description`, `individualId`,
`organizationId`, `projectStartDate`, `projectEndDate`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Website Redesign",
    "description": "Complete redesign of the company website",
    "individualId": "<contact-guid>",
    "organizationId": "<organization-guid>",
    "projectStartDate": "2026-07-01T00:00:00Z",
    "projectEndDate": "2026-12-31T00:00:00Z"
  }'
```

### Update a project (full replace, PUT)

`ProjectUpdateDto` fields: `title`, `description`, `individualId`, `organizationId`,
`projectStartDate`, `projectEndDate`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Website Redesign (Phase 2)",
    "description": "Phase 2 of the company website redesign",
    "projectEndDate": "2027-03-31T00:00:00Z"
  }'
```

### Patch a project (atomic, PATCH — JSON Patch RFC 6902)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/title", "value": "Website Redesign (Renamed)" },
    { "op": "replace", "path": "/projectEndDate", "value": "2027-03-31T00:00:00Z" }
  ]'
```

### Delete a project

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Project Periods

Periods are nested under a project.

### List periods for a project

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Periods?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a period

`ProjectPeriodCreateDto` fields: `id`, `timestamp`, `periodStartDate`, `periodEndDate`,
`projectId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Periods?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "periodStartDate": "2026-07-01T00:00:00Z",
    "periodEndDate": "2026-07-14T00:00:00Z",
    "projectId": "<project-guid>"
  }'
```

### Update a period (PUT)

`ProjectPeriodUpdateDto` fields: `periodStartDate`, `periodEndDate`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Periods/<period-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "periodStartDate": "2026-07-01T00:00:00Z",
    "periodEndDate": "2026-07-21T00:00:00Z"
  }'
```

### Patch a period (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Periods/<period-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/periodEndDate", "value": "2026-07-21T00:00:00Z" }
  ]'
```

### Delete a period

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Periods/<period-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Project Tasks (nested under a project)

### List tasks for a project

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count tasks for a project

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a task under a project

`ProjectTaskCreateDto` fields: `id`, `timestamp`, `title`, `description`, `startDate`,
`dueLine`, `projectId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design homepage wireframe",
    "description": "Create wireframe for new homepage layout",
    "startDate": "2026-07-02T00:00:00Z",
    "dueLine": "2026-07-09T00:00:00Z",
    "projectId": "<project-guid>"
  }'
```

### Update a task (PUT)

`ProjectTaskUpdateDto` fields: `title`, `description`, `startDate`, `dueLine`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks/<task-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design homepage wireframe (revised)",
    "description": "Revised wireframe with new header",
    "dueLine": "2026-07-12T00:00:00Z"
  }'
```

### Patch a task (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks/<task-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/dueLine", "value": "2026-07-12T00:00:00Z" }
  ]'
```

### Delete a task

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks/<task-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List a project's task categories

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/TaskCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count a project's task categories

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/TaskCategories/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List a project's time logs

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/TimeLogs?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count a project's time logs

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/TimeLogs/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Project Tasks (top-level collection)

The same task records are also exposed at the top level under `/ProjectTasks`, addressed
by `projectTaskId` only (no `projectId` in the path). These endpoints accept the optional
`api-version` query param / `x-api-version` header.

### List all project tasks (tenant-wide)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/ProjectTasks?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count all project tasks

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/ProjectTasks/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a project task by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/ProjectTasks/<task-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a project task (top-level)

`ProjectTaskCreateDto` fields: `id`, `timestamp`, `title`, `description`, `startDate`,
`dueLine`, `projectId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/ProjectTasks?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement contact form",
    "description": "Wire up the new contact form to the API",
    "startDate": "2026-07-03T00:00:00Z",
    "dueLine": "2026-07-10T00:00:00Z",
    "projectId": "<project-guid>"
  }'
```

### Update a project task (PUT)

`ProjectTaskUpdateDto` fields: `title`, `description`, `startDate`, `dueLine`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/ProjectTasks/<task-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement contact form (revised)",
    "dueLine": "2026-07-14T00:00:00Z"
  }'
```

### Patch a project task (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ProjectsService/ProjectTasks/<task-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/title", "value": "Implement contact form v2" }
  ]'
```

### Delete a project task

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ProjectsService/ProjectTasks/<task-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Task Categories

### List task categories (tenant-wide)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count task categories (tenant-wide)

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a task category by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a task category

`TaskCategoryCreateDto` fields: `id`, `timestamp`, `title`, `projectId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design",
    "projectId": "<project-guid>"
  }'
```

### Update a task category (PUT)

`TaskCategoryUpdateDto` fields: `title`, `projectId`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design & UX",
    "projectId": "<project-guid>"
  }'
```

### Patch a task category (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/title", "value": "Design & UX" }
  ]'
```

### Delete a task category

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories/<category-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List task types for a category

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories/<category-guid>/Types?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Task Types

> Task Types have no list-all or count endpoint in the spec — discover types for a
> category via `GET /TaskCategories/<category-guid>/Types` (above).

### Get a task type by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a task type

`TaskTypeCreateDto` fields: `id`, `timestamp`, `title`, `taskCategoryId`,
`displayInTimeTracker`, `requiresDescription`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug Fix",
    "taskCategoryId": "<category-guid>",
    "displayInTimeTracker": true,
    "requiresDescription": true
  }'
```

### Update a task type (PUT)

`TaskTypeUpdateDto` fields: `title`, `taskCategoryId`, `displayInTimeTracker`,
`requiresDescription`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug Fix (Critical)",
    "taskCategoryId": "<category-guid>",
    "displayInTimeTracker": true,
    "requiresDescription": true
  }'
```

### Patch a task type (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/displayInTimeTracker", "value": false }
  ]'
```

### Delete a task type

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Time Logs

Time logs are read/created at the top level. Reads are scoped by `projectPeriodId`,
`contactId`, or `projectId` depending on the endpoint. These endpoints accept the optional
`api-version` query param / `x-api-version` header.

### List time logs for a period

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogs?tenantId=<tenant-guid>&projectPeriodId=<period-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Count time logs for a period

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogs/Count?tenantId=<tenant-guid>&projectPeriodId=<period-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List time logs for a project

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogs/ForProject/<project-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List time logs by responsible contact

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogs/ByResponsibleContact?tenantId=<tenant-guid>&contactId=<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### List time logs created by a contact

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogs/CreatedByContact?tenantId=<tenant-guid>&contactId=<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get a time log by ID

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogs/<time-log-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Create a time log

`ProjectTimeLogCreateDto` fields: `id`, `timestamp`, `timeSpan`, `logDate`, `comments`,
`projectTaskId` (**required**), `projectPeriodId` (**required**), `projectTimeLogRecordType`
(`RegularHours` | `OvertimeToPay` | `OvertimeToCompensate`), `projectId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogs?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timeSpan": "02:30:00",
    "logDate": "2026-07-03T00:00:00Z",
    "comments": "Wireframe iteration",
    "projectTaskId": "<task-guid>",
    "projectPeriodId": "<period-guid>",
    "projectTimeLogRecordType": "RegularHours",
    "projectId": "<project-guid>"
  }'
```

### Update a time log (PUT)

`ProjectTimeLogUpdateDto` fields: `logDate`, `timeSpan`, `comments`, `projectTaskId`,
`projectPeriodId`, `projectTimeLogRecordType`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogs/<time-log-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "logDate": "2026-07-03T00:00:00Z",
    "timeSpan": "03:00:00",
    "comments": "Wireframe iteration (extended)",
    "projectTaskId": "<task-guid>",
    "projectPeriodId": "<period-guid>",
    "projectTimeLogRecordType": "OvertimeToPay"
  }'
```

### Patch a time log (PATCH — JSON Patch)

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogs/<time-log-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/projectTimeLogRecordType", "value": "OvertimeToPay" }
  ]'
```

### Delete a time log

```bash
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogs/<time-log-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Time-Log Approvals

Request and process approval of a project period's hours. These endpoints accept the
optional `api-version` query param / `x-api-version` header.

### Request hours approval

`ProjectHoursApprovalCreateDto` fields: `id`, `timestamp`, `requesterContactId`,
`approverContactId`, `projectPeriodId`, `comments`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogApprovals?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requesterContactId": "<contact-guid>",
    "approverContactId": "<contact-guid>",
    "projectPeriodId": "<period-guid>",
    "comments": "Please approve the hours for this period."
  }'
```

### Update the approver (PUT)

`ProjectHoursApprovalApproverUpdateDto` field: `approverContactId`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogApprovals/<approval-guid>/Approver?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approverContactId": "<contact-guid>"
  }'
```

### Update the approval status (PUT)

`ProjectHoursApprovalStatusUpdateDto` fields: `approvalStatus`
(`Pending` | `Approved` | `Rejected`), `comments`.

```bash
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogApprovals/<approval-guid>/Status?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalStatus": "Approved",
    "comments": "Hours look correct."
  }'
```

---

## PATCH (JSON Patch RFC 6902)

PATCH endpoints take a JSON **array** of operations (`Content-Type: application/json`).
Each operation has an `op` (`add` | `remove` | `replace` | `move` | `copy` | `test`), a
`path` (JSON Pointer with a leading `/` and the camelCase field name), and — for
`add`/`replace`/`test` — a `value`. Use PATCH for atomic partial updates (change a couple
of fields without resending the whole object — safer than PUT for concurrent edits).

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/title", "value": "Renamed Project" },
    { "op": "replace", "path": "/description", "value": "Updated scope" }
  ]'
```

**Resources that support PATCH** (all share the same JSON-Patch array shape, camelCase
field paths matching their Update DTO):

- `PATCH /Projects/{projectId}`
- `PATCH /Projects/{projectId}/Periods/{projectPeriodId}`
- `PATCH /Projects/{projectId}/Tasks/{projectTaskId}`
- `PATCH /ProjectTasks/{projectTaskId}`
- `PATCH /TaskCategories/{taskCategoryId}`
- `PATCH /TaskTypes/{taskTypeId}`
- `PATCH /TimeLogs/{timeLogId}`

> Time-Log Approvals do **not** support PATCH — the approver and status are changed via
> the dedicated `PUT .../Approver` and `PUT .../Status` endpoints above.

---

## End-to-End Workflow

```bash
# 1. Create a project (capture the returned project ID)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Website Redesign", "description": "Company website overhaul", "projectStartDate": "2026-07-01T00:00:00Z", "projectEndDate": "2026-12-31T00:00:00Z" }'

# 2. Create a task category for the project
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Design", "projectId": "<project-guid>" }'

# 3. Create a task type in that category
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Wireframe", "taskCategoryId": "<category-guid>", "displayInTimeTracker": true, "requiresDescription": false }'

# 4. Create a project period
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Periods?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "periodStartDate": "2026-07-01T00:00:00Z", "periodEndDate": "2026-07-14T00:00:00Z", "projectId": "<project-guid>" }'

# 5. Create a task under the project
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Homepage wireframe", "description": "Design the homepage", "startDate": "2026-07-02T00:00:00Z", "dueLine": "2026-07-09T00:00:00Z", "projectId": "<project-guid>" }'

# 6. Log time against the task within the period
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogs?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "timeSpan": "02:30:00", "logDate": "2026-07-03T00:00:00Z", "comments": "Wireframe iteration", "projectTaskId": "<task-guid>", "projectPeriodId": "<period-guid>", "projectTimeLogRecordType": "RegularHours", "projectId": "<project-guid>" }'

# 7. Patch the task's due date (atomic)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks/<task-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/dueLine", "value": "2026-07-12T00:00:00Z" } ]'

# 8. Request approval of the period's hours
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogApprovals?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "requesterContactId": "<contact-guid>", "approverContactId": "<contact-guid>", "projectPeriodId": "<period-guid>", "comments": "Please approve." }'

# 9. Approve the hours
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/TimeLogApprovals/<approval-guid>/Status?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "approvalStatus": "Approved", "comments": "Approved." }'
```

---

## API Endpoints Quick Reference

All paths are relative to `$ABSUITE_HOST_URL/api/v2/ProjectsService/`. Every call requires
`?tenantId=<tenant-guid>`.

| Action | Method | Path |
|---|---|---|
| List projects | GET | `/Projects` |
| Count projects | GET | `/Projects/Count` |
| Get project | GET | `/Projects/{projectId}` |
| Create project | POST | `/Projects` |
| Update project | PUT | `/Projects/{projectId}` |
| Patch project | PATCH | `/Projects/{projectId}` |
| Delete project | DELETE | `/Projects/{projectId}` |
| List periods | GET | `/Projects/{projectId}/Periods` |
| Create period | POST | `/Projects/{projectId}/Periods` |
| Update period | PUT | `/Projects/{projectId}/Periods/{projectPeriodId}` |
| Patch period | PATCH | `/Projects/{projectId}/Periods/{projectPeriodId}` |
| Delete period | DELETE | `/Projects/{projectId}/Periods/{projectPeriodId}` |
| List project tasks (nested) | GET | `/Projects/{projectId}/Tasks` |
| Count project tasks (nested) | GET | `/Projects/{projectId}/Tasks/Count` |
| Create project task (nested) | POST | `/Projects/{projectId}/Tasks` |
| Update project task (nested) | PUT | `/Projects/{projectId}/Tasks/{projectTaskId}` |
| Patch project task (nested) | PATCH | `/Projects/{projectId}/Tasks/{projectTaskId}` |
| Delete project task (nested) | DELETE | `/Projects/{projectId}/Tasks/{projectTaskId}` |
| List project task categories | GET | `/Projects/{projectId}/TaskCategories` |
| Count project task categories | GET | `/Projects/{projectId}/TaskCategories/Count` |
| List project time logs | GET | `/Projects/{projectId}/TimeLogs` |
| Count project time logs | GET | `/Projects/{projectId}/TimeLogs/Count` |
| List project tasks (top-level) | GET | `/ProjectTasks` |
| Count project tasks (top-level) | GET | `/ProjectTasks/Count` |
| Get project task (top-level) | GET | `/ProjectTasks/{projectTaskId}` |
| Create project task (top-level) | POST | `/ProjectTasks` |
| Update project task (top-level) | PUT | `/ProjectTasks/{projectTaskId}` |
| Patch project task (top-level) | PATCH | `/ProjectTasks/{projectTaskId}` |
| Delete project task (top-level) | DELETE | `/ProjectTasks/{projectTaskId}` |
| List task categories | GET | `/TaskCategories` |
| Count task categories | GET | `/TaskCategories/Count` |
| Get task category | GET | `/TaskCategories/{taskCategoryId}` |
| Create task category | POST | `/TaskCategories` |
| Update task category | PUT | `/TaskCategories/{taskCategoryId}` |
| Patch task category | PATCH | `/TaskCategories/{taskCategoryId}` |
| Delete task category | DELETE | `/TaskCategories/{taskCategoryId}` |
| List task types for a category | GET | `/TaskCategories/{taskCategoryId}/Types` |
| Get task type | GET | `/TaskTypes/{taskTypeId}` |
| Create task type | POST | `/TaskTypes` |
| Update task type | PUT | `/TaskTypes/{taskTypeId}` |
| Patch task type | PATCH | `/TaskTypes/{taskTypeId}` |
| Delete task type | DELETE | `/TaskTypes/{taskTypeId}` |
| List time logs (by period) | GET | `/TimeLogs` *(requires `projectPeriodId`)* |
| Count time logs (by period) | GET | `/TimeLogs/Count` *(requires `projectPeriodId`)* |
| List time logs for a project | GET | `/TimeLogs/ForProject/{projectId}` |
| List time logs by responsible contact | GET | `/TimeLogs/ByResponsibleContact` *(requires `contactId`)* |
| List time logs created by a contact | GET | `/TimeLogs/CreatedByContact` *(requires `contactId`)* |
| Get time log | GET | `/TimeLogs/{timeLogId}` |
| Create time log | POST | `/TimeLogs` |
| Update time log | PUT | `/TimeLogs/{timeLogId}` |
| Patch time log | PATCH | `/TimeLogs/{timeLogId}` |
| Delete time log | DELETE | `/TimeLogs/{timeLogId}` |
| Request hours approval | POST | `/TimeLogApprovals` |
| Update approval approver | PUT | `/TimeLogApprovals/{approvalId}/Approver` |
| Update approval status | PUT | `/TimeLogApprovals/{approvalId}/Status` |

## Critical Rules

- **Authenticate first** and send `Authorization: Bearer $ABSUITE_ACCESS_TOKEN` on every call.
- **`tenantId` is required on every endpoint** (query `?tenantId=` or header `X-TenantId:`),
  including POST/PUT/PATCH/DELETE — omitting it on a write returns 400.
- **Check `isSuccess`** and read the payload from `result`.
- **Create task categories and types before referencing them** from tasks and time logs.
- **PATCH bodies are JSON arrays** of operations, not objects.
- For the CLI equivalent, see `absuite-projects-cli`. For the cross-domain REST reference,
  see `absuite-rest`.
</content>
</invoke>
