---
name: absuite-projects
description: >
  Manage projects, project tasks, task categories, task types, project periods, and
  time logs in the Alliance Business Suite (ABS) using the `absuite` CLI or REST API.
  Requires an authenticated CLI session or a valid bearer token.
---

# Alliance Business Suite — Projects Skill

Manage projects through the `absuite` CLI's `projects` service or the `ProjectsService` REST API. All operations are tenant-scoped.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite projects list-commands`

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

## Projects

```bash
# List
absuite projects get projects-by-tenant-id --TenantId $TENANT_ID

# Count
absuite projects get projects-count-by-tenant-id --TenantId $TENANT_ID

# Get by ID
absuite projects get by-id --TenantId $TENANT_ID --ProjectId <project-guid>

# Create
absuite projects create --TenantId $TENANT_ID --ProjectCreateDto '{
  "Title": "Website Redesign",
  "Description": "Complete redesign of the company website",
  "ProjectStartDate": "2026-04-01T00:00:00Z",
  "ProjectEndDate": "2026-09-30T00:00:00Z"
}'

# Update
absuite projects update --TenantId $TENANT_ID --ProjectId <project-guid> --ProjectUpdateDto '{...}'

# Delete
absuite projects delete --TenantId $TENANT_ID --ProjectId <project-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Website Redesign",
    "Description": "Complete redesign of the company website",
    "ProjectStartDate": "2026-04-01T00:00:00Z",
    "ProjectEndDate": "2026-09-30T00:00:00Z"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Project Tasks

```bash
# List tasks for a project
absuite projects list tasks --TenantId $TENANT_ID --ProjectId <project-guid>

# Count tasks
absuite projects count tasks --TenantId $TENANT_ID --ProjectId <project-guid>

# Create task
absuite projects create task --TenantId $TENANT_ID --ProjectTaskCreateDto '{
  "Title": "Design homepage wireframe",
  "Description": "Create wireframe for new homepage layout",
  "ProjectId": "<project-guid>",
  "TaskCategoryId": "<category-guid>",
  "TaskTypeId": "<type-guid>"
}'

# Update task
absuite projects update task --TenantId $TENANT_ID --ProjectTaskId <task-guid> --ProjectTaskUpdateDto '{...}'

# Delete task
absuite projects delete task --TenantId $TENANT_ID --ProjectTaskId <task-guid>
```

**REST API equivalent:**
```bash
# List tasks for a project
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count tasks
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create task
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Design homepage wireframe",
    "Description": "Create wireframe for new homepage layout",
    "TaskCategoryId": "<category-guid>",
    "TaskTypeId": "<type-guid>"
  }'

# Update task
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks/<task-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete task
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Tasks/<task-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Task Categories

```bash
# List (tenant-wide)
absuite projects list tenant-task-categories --TenantId $TENANT_ID
absuite projects count tenant-task-categories --TenantId $TENANT_ID

# List (project-specific)
absuite projects list task-categories --TenantId $TENANT_ID --ProjectId <project-guid>
absuite projects count task-categories --TenantId $TENANT_ID --ProjectId <project-guid>

# Get by ID
absuite projects get task-category-by-id --TenantId $TENANT_ID --TaskCategoryId <category-guid>

# Create
absuite projects create task-category --TenantId $TENANT_ID --TaskCategoryCreateDto '{
  "Name": "Design",
  "Description": "Design and UX tasks"
}'

# Update
absuite projects update task-category --TenantId $TENANT_ID --TaskCategoryId <category-guid> --TaskCategoryUpdateDto '{...}'

# Delete
absuite projects delete task-category --TenantId $TENANT_ID --TaskCategoryId <category-guid>
```

**REST API equivalent:**
```bash
# List (tenant-wide / top-level)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count (tenant-wide)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List (project-specific)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/TaskCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count (project-specific)
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/TaskCategories/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Design",
    "Description": "Design and UX tasks"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories/<category-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Task Types

```bash
# Get by ID
absuite projects get task-type-by-id --TenantId $TENANT_ID --TaskTypeId <type-guid>

# List types for a category
absuite projects list task-category-task-types --TenantId $TENANT_ID --TaskCategoryId <category-guid>

# Create
absuite projects create task-type --TenantId $TENANT_ID --TaskTypeCreateDto '{
  "Name": "Bug Fix"
}'

# Update
absuite projects update task-type --TenantId $TENANT_ID --TaskTypeId <type-guid> --TaskTypeUpdateDto '{...}'

# Delete
absuite projects delete task-type --TenantId $TENANT_ID --TaskTypeId <type-guid>
```

**REST API equivalent:**
```bash
# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# List types for a category
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskCategories/<category-guid>/Types" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Bug Fix"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ProjectsService/TaskTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Project Periods

```bash
# List
absuite projects list periods --TenantId $TENANT_ID --ProjectId <project-guid>

# Create
absuite projects create period --TenantId $TENANT_ID --ProjectPeriodCreateDto '{
  "Name": "Sprint 1",
  "StartDate": "2026-04-01T00:00:00Z",
  "EndDate": "2026-04-14T00:00:00Z"
}'

# Update
absuite projects update period --TenantId $TENANT_ID --ProjectPeriodId <period-guid> --ProjectPeriodUpdateDto '{...}'

# Delete
absuite projects delete period --TenantId $TENANT_ID --ProjectPeriodId <period-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Periods" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Periods" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Sprint 1",
    "StartDate": "2026-04-01T00:00:00Z",
    "EndDate": "2026-04-14T00:00:00Z"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Periods/<period-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/Periods/<period-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Time Logs

```bash
# List time logs for a project
absuite projects list time-logs --TenantId $TENANT_ID --ProjectId <project-guid>

# Count
absuite projects count time-logs --TenantId $TENANT_ID --ProjectId <project-guid>
```

**REST API equivalent:**
```bash
# List time logs for a project
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/TimeLogs" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/ProjectsService/Projects/<project-guid>/TimeLogs/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

For detailed time tracking operations, see the `absuite-timetracker` skill.

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List projects | `absuite projects get projects-by-tenant-id --TenantId <guid>` |
| Create project | `absuite projects create --TenantId <guid> --ProjectCreateDto '{...}'` |
| List tasks | `absuite projects list tasks --TenantId <guid> --ProjectId <guid>` |
| Create task | `absuite projects create task --TenantId <guid> --ProjectTaskCreateDto '{...}'` |
| List categories | `absuite projects list tenant-task-categories --TenantId <guid>` |
| List periods | `absuite projects list periods --TenantId <guid> --ProjectId <guid>` |
| List time logs | `absuite projects list time-logs --TenantId <guid> --ProjectId <guid>` |

## API Endpoints Quick Reference

All paths relative to `/api/v2/ProjectsService/`:

| Resource | List | Get by ID | Create | Update | Delete | Count |
|---|---|---|---|---|---|---|
| Projects | `GET /Projects` | `GET /Projects/:id` | `POST /Projects` | `PUT /Projects/:id` | `DELETE /Projects/:id` | `GET /Projects/Count` |
| Project Periods | `GET /Projects/:id/Periods` | — | `POST /Projects/:id/Periods` | `PUT /Projects/:id/Periods/:periodId` | `DELETE /Projects/:id/Periods/:periodId` | — |
| Project Tasks | `GET /Projects/:id/Tasks` | — | `POST /Projects/:id/Tasks` | `PUT /Projects/:id/Tasks/:taskId` | `DELETE /Projects/:id/Tasks/:taskId` | `GET /Projects/:id/Tasks/Count` |
| Project Task Categories | `GET /Projects/:id/TaskCategories` | — | — | — | — | `GET /Projects/:id/TaskCategories/Count` |
| Project Time Logs | `GET /Projects/:id/TimeLogs` | — | — | — | — | `GET /Projects/:id/TimeLogs/Count` |
| Task Categories | `GET /TaskCategories` | `GET /TaskCategories/:id` | `POST /TaskCategories` | `PUT /TaskCategories/:id` | `DELETE /TaskCategories/:id` | `GET /TaskCategories/Count` |
| Task Types | — | `GET /TaskTypes/:id` | `POST /TaskTypes` | `PUT /TaskTypes/:id` | `DELETE /TaskTypes/:id` | — |

## Critical Rules

- **Authenticate first.** Always provide a tenant context.
- **Create task categories and types first** before referencing them in tasks.
- **Use the `timetracker` service** for detailed time log CRUD and approval workflows.
