---
name: absuite-projects-cli
description: >
  Manage projects, project periods, project tasks, task categories, and task types in
  the Alliance Business Suite (ABS) Projects Service using the `absuite` CLI. Covers
  list/count/get/create/update (PUT)/delete commands plus the project-scoped task and
  time-log reads. Requires an authenticated CLI session (see absuite-login-cli). For
  atomic PATCH updates, raw HTTP, or the top-level ProjectTasks / TimeLogs /
  TimeLogApprovals endpoints, use the absuite-projects (REST) skill.
---

# Alliance Business Suite — Projects Skill (CLI)

Manage project management data through the `absuite` CLI's `projects` service. Every
projects command is tenant-scoped and requires an authenticated session. The CLI does
**not** support PATCH (JSON Patch) — for atomic partial updates, fetch the entity, modify
it, and `update` (full PUT), or use the `absuite-projects` REST skill.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-projects` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-projects` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general CLI
   usage and configuration, see `absuite-cli`.
2. **Set your tenant** — every projects command requires a tenant. Either set a default:
   ```powershell
   absuite config set --tenant-id <tenant-guid>
   ```
   …and reference it as `$TENANT_ID`, or pass `--TenantId <tenant-guid>` on each call.
3. **Discover commands:**
   ```powershell
   absuite projects list-commands
   absuite projects create project --help
   ```

## Command Structure

```
absuite projects <verb> <entity> --Param value
absuite projects <FunctionName> --Param value
```

- **Verbs:** `list`, `count`, `get`, `create`, `update`, `delete`.
- **Entities:** `project`, `project-period`, `project-task`, `task-category`, `task-type`
  (confirm exact alias spellings with `absuite projects list-commands`).
- The canonical PowerShell **function-name** form also works as the command. The function
  names map to PowerShell-approved verbs:
  - create → `New-` (e.g. `New-ProjectAsync`, `New-ProjectPeriodAsync`, `New-ProjectTaskAsync`,
    `New-TaskCategoryAsync`, `New-TaskTypeAsync`)
  - list / count / get → `Get-` (e.g. `Get-ProjectsByTenantIdAsync`,
    `Get-ProjectsCountByTenantIdAsync`, `Get-ProjectByIdAsync`)
  - count (some) → `Invoke-Count...` (e.g. `Invoke-CountTenantTaskCategoriesAsync`)
  - update → `Update-` (e.g. `Update-ProjectAsync`, `Update-TaskTypeAsync`)
  - delete → `Invoke-Delete...` (e.g. `Invoke-DeleteProjectAsync`, `Invoke-DeleteTaskTypeAsync`)
- **JSON DTO params** are passed as a single-quoted JSON string (`--<Dto> '{...}'`) using
  the **same field names** as the REST API (e.g. `title`, `description`, `projectStartDate`,
  `dueLine`, `taskCategoryId`).

> **No `patch` verb.** The `absuite` CLI does not support PATCH (atomic JSON Patch). For a
> partial update, either fetch + modify + `update` (full PUT), or use the `absuite-projects`
> REST skill (PATCH is REST-only).

## Key Concepts

- **Project** — top-level aggregate. Created with `title`, `description`, optional
  `individualId` / `organizationId`, and `projectStartDate` / `projectEndDate`.
- **Project Period** — a time window inside a project (`periodStartDate` / `periodEndDate`).
- **Project Task** — work item inside a project (`title`, `description`, `startDate`,
  `dueLine`). Managed under a project via the CLI.
- **Task Category** — groups task types; tenant-wide or project-scoped (`title`, optional
  `projectId`).
- **Task Type** — a kind of task in a category (`title`, `taskCategoryId`,
  `displayInTimeTracker`, `requiresDescription`).
- **Time Log** — recorded effort; the CLI can **read** a project's time logs. Time-log
  creation/update and time-log approvals are REST-only (see `absuite-projects`).

## Projects

### List projects

```powershell
absuite projects list projects --TenantId $TENANT_ID
```

### Count projects

```powershell
absuite projects count projects --TenantId $TENANT_ID
```

### Get a project by ID

```powershell
absuite projects get project --TenantId $TENANT_ID --ProjectId <project-guid>
```

### Create a project

`ProjectCreateDto` fields: `id`, `timestamp`, `title`, `description`, `individualId`,
`organizationId`, `projectStartDate`, `projectEndDate`.

```powershell
absuite projects create project --TenantId $TENANT_ID --ProjectCreateDto '{
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

```powershell
absuite projects update project --TenantId $TENANT_ID --ProjectId <project-guid> --ProjectUpdateDto '{
  "title": "Website Redesign (Phase 2)",
  "description": "Phase 2 of the redesign",
  "projectEndDate": "2027-03-31T00:00:00Z"
}'
```

### Delete a project

```powershell
absuite projects delete project --TenantId $TENANT_ID --ProjectId <project-guid>
```

## Project Periods

Periods are managed under a project (the project's GUID is passed as `--ProjectId`).

### List periods for a project

```powershell
absuite projects list project-periods --TenantId $TENANT_ID --ProjectId <project-guid>
```

### Create a period

`ProjectPeriodCreateDto` fields: `id`, `timestamp`, `periodStartDate`, `periodEndDate`,
`projectId`.

```powershell
absuite projects create project-period --TenantId $TENANT_ID --ProjectId <project-guid> --ProjectPeriodCreateDto '{
  "periodStartDate": "2026-07-01T00:00:00Z",
  "periodEndDate": "2026-07-14T00:00:00Z",
  "projectId": "<project-guid>"
}'
```

### Update a period (PUT)

`ProjectPeriodUpdateDto` fields: `periodStartDate`, `periodEndDate`.

```powershell
absuite projects update project-period --TenantId $TENANT_ID --ProjectId <project-guid> --ProjectPeriodId <period-guid> --ProjectPeriodUpdateDto '{
  "periodStartDate": "2026-07-01T00:00:00Z",
  "periodEndDate": "2026-07-21T00:00:00Z"
}'
```

### Delete a period

```powershell
absuite projects delete project-period --TenantId $TENANT_ID --ProjectId <project-guid> --ProjectPeriodId <period-guid>
```

## Project Tasks

Tasks are managed under a project (`--ProjectId` plus `--ProjectTaskId` for a specific task).

### List tasks for a project

```powershell
absuite projects list project-tasks --TenantId $TENANT_ID --ProjectId <project-guid>
```

### Count tasks for a project

```powershell
absuite projects count project-tasks --TenantId $TENANT_ID --ProjectId <project-guid>
```

### Create a task

`ProjectTaskCreateDto` fields: `id`, `timestamp`, `title`, `description`, `startDate`,
`dueLine`, `projectId`.

```powershell
absuite projects create project-task --TenantId $TENANT_ID --ProjectId <project-guid> --ProjectTaskCreateDto '{
  "title": "Design homepage wireframe",
  "description": "Create wireframe for the new homepage layout",
  "startDate": "2026-07-02T00:00:00Z",
  "dueLine": "2026-07-09T00:00:00Z",
  "projectId": "<project-guid>"
}'
```

### Update a task (PUT)

`ProjectTaskUpdateDto` fields: `title`, `description`, `startDate`, `dueLine`.

```powershell
absuite projects update project-task --TenantId $TENANT_ID --ProjectId <project-guid> --ProjectTaskId <task-guid> --ProjectTaskUpdateDto '{
  "title": "Design homepage wireframe (revised)",
  "dueLine": "2026-07-12T00:00:00Z"
}'
```

### Delete a task

```powershell
absuite projects delete project-task --TenantId $TENANT_ID --ProjectId <project-guid> --ProjectTaskId <task-guid>
```

### List a project's task categories (read)

```powershell
absuite projects list project-task-categories --TenantId $TENANT_ID --ProjectId <project-guid>
```

### Count a project's task categories (read)

```powershell
absuite projects count project-task-categories --TenantId $TENANT_ID --ProjectId <project-guid>
```

### List a project's time logs (read)

```powershell
absuite projects list project-time-logs --TenantId $TENANT_ID --ProjectId <project-guid>
```

### Count a project's time logs (read)

```powershell
absuite projects count project-time-logs --TenantId $TENANT_ID --ProjectId <project-guid>
```

> Time-log **creation/update/delete** and **time-log approvals** are not exposed by the CLI
> projects service — use the `absuite-projects` REST skill for those.

## Task Categories

### List task categories (tenant-wide)

```powershell
absuite projects list task-categories --TenantId $TENANT_ID
```

### Count task categories (tenant-wide)

```powershell
absuite projects count task-categories --TenantId $TENANT_ID
```

### Get a task category by ID

```powershell
absuite projects get task-category --TenantId $TENANT_ID --TaskCategoryId <category-guid>
```

### Create a task category

`TaskCategoryCreateDto` fields: `id`, `timestamp`, `title`, `projectId`.

```powershell
absuite projects create task-category --TenantId $TENANT_ID --TaskCategoryCreateDto '{
  "title": "Design",
  "projectId": "<project-guid>"
}'
```

### Update a task category (PUT)

`TaskCategoryUpdateDto` fields: `title`, `projectId`.

```powershell
absuite projects update task-category --TenantId $TENANT_ID --TaskCategoryId <category-guid> --TaskCategoryUpdateDto '{
  "title": "Design & UX",
  "projectId": "<project-guid>"
}'
```

### Delete a task category

```powershell
absuite projects delete task-category --TenantId $TENANT_ID --TaskCategoryId <category-guid>
```

### List task types for a category

```powershell
absuite projects list task-category-task-types --TenantId $TENANT_ID --TaskCategoryId <category-guid>
```

## Task Types

> Task types have no list-all / count command — discover types for a category via
> `list task-category-task-types` (above).

### Get a task type by ID

```powershell
absuite projects get task-type --TenantId $TENANT_ID --TaskTypeId <type-guid>
```

### Create a task type

`TaskTypeCreateDto` fields: `id`, `timestamp`, `title`, `taskCategoryId`,
`displayInTimeTracker`, `requiresDescription`.

```powershell
absuite projects create task-type --TenantId $TENANT_ID --TaskTypeCreateDto '{
  "title": "Bug Fix",
  "taskCategoryId": "<category-guid>",
  "displayInTimeTracker": true,
  "requiresDescription": true
}'
```

### Update a task type (PUT)

`TaskTypeUpdateDto` fields: `title`, `taskCategoryId`, `displayInTimeTracker`,
`requiresDescription`.

```powershell
absuite projects update task-type --TenantId $TENANT_ID --TaskTypeId <type-guid> --TaskTypeUpdateDto '{
  "title": "Bug Fix (Critical)",
  "taskCategoryId": "<category-guid>",
  "displayInTimeTracker": true,
  "requiresDescription": true
}'
```

### Delete a task type

```powershell
absuite projects delete task-type --TenantId $TENANT_ID --TaskTypeId <type-guid>
```

## End-to-End Workflow

```powershell
# 1. Create a project (note the returned project ID)
absuite projects create project --TenantId $TENANT_ID --ProjectCreateDto '{
  "title": "Website Redesign", "description": "Company website overhaul",
  "projectStartDate": "2026-07-01T00:00:00Z", "projectEndDate": "2026-12-31T00:00:00Z"
}'

# 2. Create a task category for the project
absuite projects create task-category --TenantId $TENANT_ID --TaskCategoryCreateDto '{
  "title": "Design", "projectId": "<project-guid>"
}'

# 3. Create a task type in that category
absuite projects create task-type --TenantId $TENANT_ID --TaskTypeCreateDto '{
  "title": "Wireframe", "taskCategoryId": "<category-guid>",
  "displayInTimeTracker": true, "requiresDescription": false
}'

# 4. Create a project period
absuite projects create project-period --TenantId $TENANT_ID --ProjectId <project-guid> --ProjectPeriodCreateDto '{
  "periodStartDate": "2026-07-01T00:00:00Z", "periodEndDate": "2026-07-14T00:00:00Z", "projectId": "<project-guid>"
}'

# 5. Create a task under the project
absuite projects create project-task --TenantId $TENANT_ID --ProjectId <project-guid> --ProjectTaskCreateDto '{
  "title": "Homepage wireframe", "description": "Design the homepage",
  "startDate": "2026-07-02T00:00:00Z", "dueLine": "2026-07-09T00:00:00Z", "projectId": "<project-guid>"
}'

# 6. Update the task's due date (full PUT — CLI has no PATCH)
absuite projects update project-task --TenantId $TENANT_ID --ProjectId <project-guid> --ProjectTaskId <task-guid> --ProjectTaskUpdateDto '{
  "title": "Homepage wireframe", "dueLine": "2026-07-12T00:00:00Z"
}'

# 7. Verify
absuite projects get project --TenantId $TENANT_ID --ProjectId <project-guid>
absuite projects list project-tasks --TenantId $TENANT_ID --ProjectId <project-guid>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List projects | `absuite projects list projects` |
| Count projects | `absuite projects count projects` |
| Get project | `absuite projects get project --ProjectId <project-guid>` |
| Create project | `absuite projects create project --ProjectCreateDto '{...}'` |
| Update project | `absuite projects update project --ProjectId <project-guid> --ProjectUpdateDto '{...}'` |
| Delete project | `absuite projects delete project --ProjectId <project-guid>` |
| List periods | `absuite projects list project-periods --ProjectId <project-guid>` |
| Create period | `absuite projects create project-period --ProjectId <project-guid> --ProjectPeriodCreateDto '{...}'` |
| Update period | `absuite projects update project-period --ProjectId <project-guid> --ProjectPeriodId <period-guid> --ProjectPeriodUpdateDto '{...}'` |
| Delete period | `absuite projects delete project-period --ProjectId <project-guid> --ProjectPeriodId <period-guid>` |
| List project tasks | `absuite projects list project-tasks --ProjectId <project-guid>` |
| Count project tasks | `absuite projects count project-tasks --ProjectId <project-guid>` |
| Create task | `absuite projects create project-task --ProjectId <project-guid> --ProjectTaskCreateDto '{...}'` |
| Update task | `absuite projects update project-task --ProjectId <project-guid> --ProjectTaskId <task-guid> --ProjectTaskUpdateDto '{...}'` |
| Delete task | `absuite projects delete project-task --ProjectId <project-guid> --ProjectTaskId <task-guid>` |
| List project task categories | `absuite projects list project-task-categories --ProjectId <project-guid>` |
| Count project task categories | `absuite projects count project-task-categories --ProjectId <project-guid>` |
| List project time logs | `absuite projects list project-time-logs --ProjectId <project-guid>` |
| Count project time logs | `absuite projects count project-time-logs --ProjectId <project-guid>` |
| List task categories | `absuite projects list task-categories` |
| Count task categories | `absuite projects count task-categories` |
| Get task category | `absuite projects get task-category --TaskCategoryId <category-guid>` |
| Create task category | `absuite projects create task-category --TaskCategoryCreateDto '{...}'` |
| Update task category | `absuite projects update task-category --TaskCategoryId <category-guid> --TaskCategoryUpdateDto '{...}'` |
| Delete task category | `absuite projects delete task-category --TaskCategoryId <category-guid>` |
| List task types for a category | `absuite projects list task-category-task-types --TaskCategoryId <category-guid>` |
| Get task type | `absuite projects get task-type --TaskTypeId <type-guid>` |
| Create task type | `absuite projects create task-type --TaskTypeCreateDto '{...}'` |
| Update task type | `absuite projects update task-type --TaskTypeId <type-guid> --TaskTypeUpdateDto '{...}'` |
| Delete task type | `absuite projects delete task-type --TaskTypeId <type-guid>` |

> Every command also accepts `--TenantId <tenant-guid>` (omit it if you set a default tenant
> with `absuite config set --tenant-id <tenant-guid>`). Alias spellings (e.g. `project-task`
> vs `task`) may vary — always confirm with `absuite projects list-commands` and
> `absuite projects <command> --help`.

## Critical Rules

- **Authenticate first.** Run `absuite login` (see `absuite-login-cli`); the CLI manages the
  token automatically.
- **Always provide a tenant** — set a default or pass `--TenantId` on every command.
- **Parameter names are case-sensitive** — use exact casing (`--TenantId`, `--ProjectId`).
- **Create task categories and types before referencing them** from tasks.
- **Parse the envelope** — read data from `result`, check `isSuccess`.
- **No PATCH in the CLI.** For atomic partial updates, raw HTTP, or the top-level
  `ProjectTasks` / `TimeLogs` / `TimeLogApprovals` endpoints, use the `absuite-projects`
  REST skill.
</content>
