---
name: absuite-timetracker
description: >
  Manage project time tracking in the Alliance Business Suite (ABS) using the
  `absuite` CLI or REST API. Covers time logs, approval workflows, and time
  queries by responsible contact, creator, or project. Requires an authenticated
  CLI session or a valid bearer token for REST calls.
---

# Alliance Business Suite — Time Tracker Skill

Manage time tracking through the `absuite` CLI's `timetracker` service or the `TimeTrackerService` REST API. All operations are tenant-scoped.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite timetracker list-commands`

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

## Project Time Logs

```bash
# List time logs
absuite timetracker list project-time-logs --TenantId $TENANT_ID

# Count time logs
absuite timetracker count project-time-logs --TenantId $TENANT_ID

# Get by ID
absuite timetracker get project-time-log --TenantId $TENANT_ID --ProjectTimeLogId <timelog-guid>

# Create time log
absuite timetracker create project-time-log --TenantId $TENANT_ID --ProjectTimeLogCreateDto '{
  "ProjectId": "<project-guid>",
  "ProjectTaskId": "<task-guid>",
  "Hours": 4.5,
  "Description": "Code review and refactoring",
  "Date": "2026-04-19T00:00:00Z"
}'

# Update time log
absuite timetracker update project-time-log --TenantId $TENANT_ID --ProjectTimeLogId <timelog-guid> --ProjectTimeLogUpdateDto '{...}'

# Delete time log
absuite timetracker delete project-time-log --TenantId $TENANT_ID --ProjectTimeLogId <timelog-guid>
```

**REST API equivalent:**
```bash
# List time logs
curl -X GET "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/ProjectTimeLogs" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count time logs
curl -X GET "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/ProjectTimeLogs/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/ProjectTimeLogs/<timelog-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create time log
curl -X POST "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/ProjectTimeLogs" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timeSpan": 4.5,
    "logDate": "2026-04-19T00:00:00Z",
    "comments": "Code review and refactoring",
    "projectTaskID": "<task-guid>",
    "projectPeriodID": "<period-guid>",
    "projectTimeLogRecordType": "Standard",
    "projectID": "<project-guid>"
  }'

# Update time log
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/ProjectTimeLogs/<timelog-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "logDate": "2026-04-19T00:00:00Z",
    "timeSpan": 5.0,
    "comments": "Updated description",
    "projectTaskID": "<task-guid>",
    "projectPeriodID": "<period-guid>",
    "projectTimeLogRecordType": "Standard"
  }'

# Delete time log
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/ProjectTimeLogs/<timelog-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Querying Time Logs

### By Responsible Contact

```bash
absuite timetracker list project-time-logs-by-responsible-contact --TenantId $TENANT_ID --ContactId <contact-guid>
absuite timetracker count project-time-logs-by-responsible-contact --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/ProjectTimeLogs/ByResponsibleContact?ContactId=<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### By Creator

```bash
absuite timetracker list project-time-logs-by-creator --TenantId $TENANT_ID --ContactId <contact-guid>
absuite timetracker count project-time-logs-by-creator --TenantId $TENANT_ID --ContactId <contact-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/ProjectTimeLogs/CreatedByContact?ContactId=<contact-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### By Project

```bash
absuite timetracker list project-time-logs-for-project --TenantId $TENANT_ID --ProjectId <project-guid>
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/ProjectTimeLogs/ForProject/<project-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Approval Workflow

```bash
# Request approval for a time log
absuite timetracker request-approval --TenantId $TENANT_ID --ProjectTimeLogId <timelog-guid>

# Update approval status (approve / reject)
absuite timetracker update-approval-status --TenantId $TENANT_ID --ProjectTimeLogId <timelog-guid> --ApprovalStatus "Approved"

# Update the approver assigned to a time log
absuite timetracker update-approver --TenantId $TENANT_ID --ProjectTimeLogId <timelog-guid> --ApproverId <contact-guid>
```

**REST API equivalent:**
```bash
# Request approval (create approval record)
curl -X POST "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/TimeLogApprovals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requesterContactID": "<requester-contact-guid>",
    "approverContactID": "<approver-contact-guid>",
    "projectPeriodID": "<period-guid>",
    "comments": "Please review my time entries"
  }'

# Update approval status (approve / reject)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/TimeLogApprovals/<approval-id>/Status" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalStatus": "Approved",
    "comments": "Looks good"
  }'

# Update the approver assigned to an approval
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/TimeLogApprovals/<approval-id>/Approver" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approverContactID": "<new-approver-contact-guid>"
  }'
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List time logs | `absuite timetracker list project-time-logs --TenantId <guid>` |
| Create time log | `absuite timetracker create project-time-log --TenantId <guid> --ProjectTimeLogCreateDto '{...}'` |
| By responsible | `absuite timetracker list project-time-logs-by-responsible-contact --TenantId <guid> --ContactId <guid>` |
| By creator | `absuite timetracker list project-time-logs-by-creator --TenantId <guid> --ContactId <guid>` |
| By project | `absuite timetracker list project-time-logs-for-project --TenantId <guid> --ProjectId <guid>` |
| Request approval | `absuite timetracker request-approval --TenantId <guid> --ProjectTimeLogId <guid>` |
| Approve time log | `absuite timetracker update-approval-status --TenantId <guid> --ProjectTimeLogId <guid> --ApprovalStatus "Approved"` |

## Full Example: Log & Approve Time

```bash
# 1. Log time
absuite timetracker create project-time-log --ProjectTimeLogCreateDto '{
  "ProjectId": "<project-guid>",
  "ProjectTaskId": "<task-guid>",
  "Hours": 8,
  "Description": "Sprint development work",
  "Date": "2026-04-19T00:00:00Z"
}'

# 2. Request approval
absuite timetracker request-approval --ProjectTimeLogId <timelog-guid>

# 3. Manager approves
absuite timetracker update-approval-status --ProjectTimeLogId <timelog-guid> --ApprovalStatus "Approved"
```

**REST API equivalent:**
```bash
# 1. Log time
curl -X POST "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/ProjectTimeLogs" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timeSpan": 8,
    "logDate": "2026-04-19T00:00:00Z",
    "comments": "Sprint development work",
    "projectTaskID": "<task-guid>",
    "projectPeriodID": "<period-guid>",
    "projectTimeLogRecordType": "Standard",
    "projectID": "<project-guid>"
  }'

# 2. Request approval
curl -X POST "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/TimeLogApprovals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requesterContactID": "<requester-contact-guid>",
    "approverContactID": "<approver-contact-guid>",
    "projectPeriodID": "<period-guid>",
    "comments": "Please approve my time entries"
  }'

# 3. Manager approves
curl -X PUT "$ABSUITE_HOST_URL/api/v2/TimeTrackerService/TimeLogApprovals/<approval-id>/Status" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalStatus": "Approved",
    "comments": "Approved — great work"
  }'
```

## API Endpoints Quick Reference

All paths relative to `/api/v2/TimeTrackerService/`.

| Resource | Method | Endpoint | Description |
|---|---|---|---|
| Time Logs | `GET` | `/ProjectTimeLogs` | List all time logs |
| | `POST` | `/ProjectTimeLogs` | Create a time log |
| | `GET` | `/ProjectTimeLogs/:id` | Get time log by ID |
| | `PUT` | `/ProjectTimeLogs/:id` | Update a time log |
| | `DELETE` | `/ProjectTimeLogs/:id` | Delete a time log |
| | `GET` | `/ProjectTimeLogs/Count` | Count time logs |
| | `GET` | `/ProjectTimeLogs/ByResponsibleContact` | Time logs by responsible contact |
| | `GET` | `/ProjectTimeLogs/CreatedByContact` | Time logs by creator |
| | `GET` | `/ProjectTimeLogs/ForProject/:projectId` | Time logs for a project |
| Approvals | `POST` | `/TimeLogApprovals` | Request approval |
| | `PUT` | `/TimeLogApprovals/:id/Approver` | Update approver |
| | `PUT` | `/TimeLogApprovals/:id/Status` | Update approval status |

## Critical Rules

- **Authenticate first.** Always provide a tenant context.
- **Time logs reference projects and tasks** — create projects/tasks first (see `absuite-projects` skill).
- **Use the approval workflow** for time entries that require manager sign-off.
