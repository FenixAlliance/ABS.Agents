---
name: absuite-hrms
key: paperclip/skills/absuite-hrms/SKILL.md
version: 1.0.0
description: >
  Manage human resources in the Alliance Business Suite (ABS) via the REST API.
  Covers employees, employers, employee types, job titles, salaries, payrolls,
  payroll periods, gigs, gig applications, job offers, job applicants, job
  applications, job fields, required skills, shifts, schedules, time intervals,
  leave management, training programs, performance appraisals, and position
  seats, including atomic PATCH (JSON Patch) updates. All operations are
  tenant-scoped and require a bearer token (see the absuite-login skill to
  authenticate).
---

# Alliance Business Suite: HRMS Skill (REST)

Manage human resources through the `HrmsService` REST API. Every endpoint is tenant-scoped and requires a bearer token. This skill covers all `HrmsService` resources via raw `curl`, including list / count / get / create (POST) / update (PUT) / **patch (PATCH, JSON Patch RFC 6902)** / delete.

> For the CLI equivalent, see `absuite-hrms-cli`. For general REST conventions across all ABS services, see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select`: page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource**: it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) causes silent data loss.
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902): it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

## Authentication

1. **Obtain a bearer token:**
```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$ABSUITE_USER_EMAIL'", "password": "'$ABSUITE_USER_PASSWORD'"}'
```
Extract `accessToken` from the JSON response and export it as `$ABSUITE_ACCESS_TOKEN`.

2. **Send the token on every subsequent call:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/HrmsService/<Resource>`

## Tenant scoping

Every `HrmsService` endpoint requires a tenant (the only exceptions are the anonymous `JobOffers/Public` reads, where it is optional). Pass `?tenantId=<tenant-guid>` as a query parameter on **every** verb, including POST, PUT, PATCH, and DELETE (omitting it returns `400`, "Tenant ID is required."). Equivalently you may send the `X-TenantId: <tenant-guid>` request header: the binder reads the query string first and falls back to the header. Examples below use the query param.

## Permissions

Authorization is enforced inside each use case, against the caller's enrollment in the tenant. The permission keys checked at HEAD:

| Resource | Read (list / count / get) | Create | Update (PUT, PATCH, actions) | Delete |
|---|---|---|---|---|
| Employees | `employees_read` | `employees_create` | `employees_update` | `employees_delete` |
| EmployeeTypes | `employee_types_read` | `employee_types_create` | `employee_types_update` | `employee_types_delete` |
| Employers (incl. Publish / Unpublish) | `employers_read` | `employers_create` | `employers_update` | `employers_delete` |
| Gigs (incl. Publish / Award / Complete / Cancel) | `gigs_read` | `gigs_create` | `gigs_update` | `gigs_delete` |
| GigApplications (incl. Accept) | `gig_applications_read` | `gig_applications_create` | `gig_applications_update` | `gig_applications_delete` |
| JobOffers (incl. Publish / Close / Fill) | `job_offers_read` | `job_offers_create` | `job_offers_update` | `job_offers_delete` |
| JobOffers/Public | anonymous | n/a | n/a | n/a |
| JobApplicants | `job_applicants_read` | `job_applicants_create` | `job_applicants_update` | `job_applicants_delete` |
| JobApplications (incl. Status) | `job_applications_read` | `job_applications_create` | `job_applications_update` | `job_applications_delete` |
| JobFields | `job_fields_read` | `job_fields_create` | `job_fields_update` | `job_fields_delete` |
| JobOfferFields | `job_offer_fields_read` | `job_offer_fields_create` | `job_offer_fields_update` | `job_offer_fields_delete` |
| RequiredSkills | `required_skills_read` | `required_skills_create` | `required_skills_update` | `required_skills_delete` |
| JobTitles | `job_titles_read` | `job_titles_create` | `job_titles_update` | `job_titles_delete` |
| Salaries | `salaries_read` | `salaries_create` | `salaries_update` | `salaries_delete` |
| Payrolls, PayrollPeriods | `payrolls_read` | `payrolls_create` | `payrolls_update` | `payrolls_delete` |
| Shifts | `shifts_read` | `shifts_create` | `shifts_update` | `shifts_delete` |
| Schedules | `schedules_read` | `schedules_create` | `schedules_update` | `schedules_delete` |
| TimeIntervals | `time_intervals_read` | `time_intervals_create` | `time_intervals_update` | `time_intervals_delete` |
| LeaveApplications | `leave_applications_read` | `leave_applications_create` | `leave_applications_update` | `leave_applications_delete` |
| LeaveTypes | `leave_applications_read` (list / count only, see below) | not implemented | not implemented | not implemented |
| TrainingPrograms | `training_programs_read` (list / count only, see below) | not implemented | not implemented | not implemented |
| TrainingProgramCourses, TrainingProgramEvents | tenant membership only (no permission key) | `training_programs_create` | `training_programs_update` | `training_programs_delete` |
| AppraisalWorkflows, AppraisalStages | `employee_appraisals_read` (list / count only, see below) | not implemented | not implemented | not implemented |
| EmployeeAppraisalSessions | `employee_appraisals_read` | `employee_appraisals_create` | `employee_appraisals_update` | `employee_appraisals_delete` |
| Position seats | `positions_read` | see [Position seats](#position-seats) | see [Position seats](#position-seats) | n/a |

A missing permission answers `403`.

## Response envelope

All responses share one envelope:

```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "string",
  "timestamp": "string",
  "result": "<data | array | int | null>"
}
```

Always check `isSuccess`; read the payload from `result`. List endpoints return an array in `result`; `Count` endpoints return an integer.

## Key Concepts

- **Employees / Employers** are HR *profiles*. They link back to a `contactId` (the underlying person/organization contact) and carry HR-specific data: pay (`grossPay`, `netSalary`, `payrollCurrency`), `maxWorkHoursPerDay`, a `jobTitleId`, and an `employeeTypeId`. Both profiles also expose ten generic `data` / `dataLabel` slots (`data`, `data1`…`data9` plus matching `*Label`) for custom fields. Employee, employer and job-applicant profiles are subtypes of `ContactProfile`, whose `type` is the EF discriminator: **omit `type`** in request bodies (the server ignores it on create and rejects a changed value on update).
- **Job Applicants / Job Applications / Gig Applications** are the candidate side: a job-applicant profile applies to a job offer (job application) or proposes on a gig (gig application).
- **Job Fields** are a catalog of professional fields; **Job Offer Fields** link a job offer to a job field; **Required Skills** attach a skill requirement to a job offer or employer.
- **Positions** (org-design seats) are created and edited through `TenantsService/Positions`; `HrmsService/Positions/{positionId}/...` manages who holds the seats.
- **Employee Types** classify employment (e.g. full-time, contractor) with `name` + `description`.
- **Job Titles** describe a role and its standard compensation: `title`, `description`, `grossPay`, `netSalary`, `currencyId`, and a location (`countryId` / `countryStateId` / `cityId`).
- **Salaries** are per-employee monetary records: `amount` + `currencyId` + `employeeProfileId` (all required).
- **Payrolls** group a run for a `payrollPeriodId`. **Payroll Periods** define `startDate` / `endDate` windows.
- **Gigs** are short-term / freelance assignments owned by an `employerProfileId`, with a budget range (`minBudget` / `maxBudget` / `currencyId`), location, and `remote` flag.
- **Job Offers** are open positions with skills, benefits, salary range, position count, and a `jobFieldId`.
- **Shifts / Schedules / Time Intervals** model working time. A `Schedule` is a weekly template (per-day booleans, `start` / `end`, `timezoneId`); `Shifts` and `TimeIntervals` are recurring blocks tied to a `scheduleId` and (for shifts) an `employeeProfileId`.
- **Leave Types** + **Leave Applications** handle absence requests (`justification`, `approved`, `onReview`, `leaveTypeId`, `employeeProfileId`).
- **Training Programs** contain **Courses** (linking a `courseId`) and **Events** (scheduled sessions).
- **Appraisals**: an **Appraisal Workflow** has ordered **Appraisal Stages**; an **Employee Appraisal Session** runs an employee through a workflow.

### Enum values (verbatim from spec)

Used by **Shifts** and **Training Program Events**:

- `repetitionCriteria`: `NotRepeat` | `WorkWeek` | `Day` | `Month` | `Year`
- `dayOfTheWeek`: `All` | `Sunday` | `Monday` | `Tuesday` | `Wednesday` | `Thursday` | `Friday` | `Saturday`

> Field names in request bodies are camelCase (e.g. `"contactId"`, `"grossPay"`, `"employeeProfileId"`), exactly as listed below.

---

## Employees

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees/<employee-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<contact-guid>",
    "about": "Backend engineer",
    "grossPay": 95000.00,
    "netSalary": 72000.00,
    "payrollCurrency": "USD.USA",
    "maxWorkHoursPerDay": 8,
    "jobTitleId": "<job-title-guid>",
    "employeeTypeId": "<employee-type-guid>"
  }'

# Update (PUT, full replacement)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees/<employee-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<contact-guid>",
    "grossPay": 105000.00,
    "netSalary": 79000.00,
    "payrollCurrency": "USD.USA",
    "jobTitleId": "<job-title-guid>",
    "employeeTypeId": "<employee-type-guid>"
  }'

# Patch (JSON Patch, partial update)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees/<employee-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/grossPay", "value": 110000.00 },
    { "op": "replace", "path": "/employeeTypeId", "value": "<employee-type-guid>" }
  ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees/<employee-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Create body (`EmployeeProfileCreateDto`)**: `contactId` (or an inline `contact` object to create the contact in the same call), `about`, `avatarUrl`, `data`…`data9` + `*Label`, `grossPay`, `netSalary`, `payrollCurrency` (currency id, default `USD.USA`), `maxWorkHoursPerDay` (default 8), `jobTitleId`, `employeeTypeId`. The PUT body (`EmployeeProfileUpdateDto`) accepts the same fields except the inline `contact`. No fields are flagged required. Do not send `type` (TPH discriminator, see Key Concepts).

---

## Employee Types

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Full-Time",
    "description": "Standard full-time employment"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Full-Time", "description": "Updated description" }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/description", "value": "Revised" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`EmployeeTypeCreateDto` / `EmployeeTypeUpdateDto`)**: `name`, `description`.

---

## Employers

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers/<employer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<contact-guid>",
    "about": "Technology company",
    "avatarUrl": "https://example.com/logo.png"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers/<employer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "contactId": "<contact-guid>", "about": "Updated description" }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers/<employer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/about", "value": "New about text" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers/<employer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Publish to / withdraw from the public employer directory (no body)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers/<employer-guid>/Publish?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers/<employer-guid>/Unpublish?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`EmployerProfileCreateDto` / `EmployerProfileUpdateDto`)**: `contactId` (or an inline `contact` on create), `about`, `avatarUrl`, `data`…`data9` + `*Label`. No required fields. Do not send `type` (TPH discriminator).

---

## Gigs

Short-term or freelance work assignments.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/<gig-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Development Sprint",
    "description": "Build checkout flow components",
    "remote": true,
    "type": "Project",
    "expectedDeliveryDate": "2025-04-30",
    "employerProfileId": "<employer-guid>",
    "minBudget": 2000.00,
    "maxBudget": 5000.00,
    "currencyId": "USD.USA",
    "countryId": "<country-id>",
    "location": "Remote",
    "externalUrl": "https://example.com/gig"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/<gig-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Frontend Sprint v2", "maxBudget": 6000.00, "currencyId": "USD.USA" }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/<gig-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/maxBudget", "value": 6500.00 },
    { "op": "replace", "path": "/remote", "value": true }
  ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/<gig-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Lifecycle (no body): Publish a draft, Award a published gig, Complete an awarded gig, Cancel before completion
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/<gig-guid>/Publish?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/<gig-guid>/Award?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/<gig-guid>/Complete?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/<gig-guid>/Cancel?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`GigCreateDto` / `GigUpdateDto`)**: `remote`, `type`, `title`, `description`, `expectedDeliveryDate`, `employerProfileId`, `minBudget`, `maxBudget`, `currencyId`, `countryId`, `countryStateId`, `cityId`, `location`, `externalUrl`, `data`…`data9` + `*Label`.

---

## Job Offers

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/<offer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior .NET Developer",
    "description": "Remote position, full-time",
    "remote": true,
    "expectedHireDate": "2025-05-01",
    "technicalSkills": "C#, EF Core, Blazor",
    "isOfficialJobOffer": true,
    "isRemoteJobOffer": true,
    "minOverallExperienceYears": 5,
    "availiablePositionsCount": 2,
    "minSalaryAmount": 90000.00,
    "maxSalaryAmount": 120000.00,
    "currencyId": "USD.USA",
    "jobFieldId": "<job-field-id>",
    "employerProfileId": "<employer-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/<offer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Senior .NET Developer", "maxSalaryAmount": 130000.00, "currencyId": "USD.USA" }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/<offer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/availiablePositionsCount", "value": 3 },
    { "op": "replace", "path": "/maxSalaryAmount", "value": 130000.00 }
  ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/<offer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Lifecycle (no body): Publish to the public Talent Portal, Close without a hire, Fill (converted to a hire)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/<offer-guid>/Publish?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/<offer-guid>/Close?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/<offer-guid>/Fill?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Public board (anonymous, no token; tenantId optional and narrows to one tenant)
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/Public"
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/Public/Count?tenantId=<tenant-guid>"
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/Public/<offer-guid>"
```

**Body (`JobOfferCreateDto` / `JobOfferUpdateDto`)**: `remote`, `expectedHireDate`, `title`, `description`, `technicalSkills`, `nonTechnicalSkills`, `certifications`, `projectExperience`, `technologies`, `benefits`, `isOfficialJobOffer`, `isRemoteJobOffer`, `isMidTimeJobOffer`, `isUndergraduateOption`, `minOverallExperienceYears`, `availiablePositionsCount`, `minSalaryAmount`, `maxSalaryAmount`, `currencyId`, `jobFieldId`, `employerProfileId`, `countryId`, `countryStateId`, `cityId`, `imageUrl`, `location`, `externalUrl`, `data`…`data9` + `*Label`.

> Note: the spec field is spelled `availiablePositionsCount` (sic): transcribe it verbatim.

---

## Job Titles

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles/<title-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Software Engineer",
    "description": "Senior-level engineering role",
    "grossPay": 120000.00,
    "netSalary": 90000.00,
    "currencyId": "USD.USA"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles/<title-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Staff Software Engineer", "grossPay": 140000.00, "currencyId": "USD.USA" }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles/<title-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/grossPay", "value": 140000.00 } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles/<title-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`JobTitleCreateDto` / `JobTitleUpdateDto`)**: `title`, `description`, `grossPay`, `netSalary`, `currencyId`, `countryId`, `countryStateId`, `cityId`.

---

## Salaries

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries/<salary-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (amount, currencyId, employeeProfileId all REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 85000.00,
    "currencyId": "USD.USA",
    "employeeProfileId": "<employee-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries/<salary-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "amount": 90000.00, "currencyId": "USD.USA", "employeeProfileId": "<employee-guid>" }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries/<salary-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/amount", "value": 90000.00 } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries/<salary-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`SalaryCreateDto`)**: `amount` **(REQ)**, `currencyId` **(REQ)**, `employeeProfileId` **(REQ)**. `SalaryUpdateDto` has the same three fields (none flagged required on update).

---

## Payrolls

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls/<payroll-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (payrollPeriodId REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "payrollPeriodId": "<period-guid>" }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls/<payroll-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "payrollPeriodId": "<period-guid>" }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls/<payroll-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/payrollPeriodId", "value": "<period-guid>" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls/<payroll-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`PayrollCreateDto`)**: `payrollPeriodId` **(REQ)**. `PayrollUpdateDto`: `payrollPeriodId`.

---

## Payroll Periods

> Payroll Periods support GET / POST / PUT / DELETE / Count only, **no PATCH endpoint** in the spec.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/PayrollPeriods?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/PayrollPeriods/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/PayrollPeriods/<period-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title, startDate, endDate REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/PayrollPeriods?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "January 2025",
    "description": "Monthly payroll window",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/PayrollPeriods/<period-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "January 2025", "startDate": "2025-01-01", "endDate": "2025-01-31" }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/PayrollPeriods/<period-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`PayrollPeriodCreateDto`)**: `title` **(REQ)**, `description`, `startDate` **(REQ)**, `endDate` **(REQ)**. `PayrollPeriodUpdateDto`: `title`, `description`, `startDate`, `endDate`.

---

## Shifts

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts/<shift-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title, start, end, employeeProfileId REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Shift",
    "description": "Standard morning block",
    "start": "2025-02-01T08:00:00Z",
    "end": "2025-02-01T16:00:00Z",
    "isBreak": false,
    "repeatEvery": 1,
    "repetitionCriteria": "WorkWeek",
    "dayOfTheWeek": "All",
    "scheduleId": "<schedule-guid>",
    "employeeProfileId": "<employee-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts/<shift-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Morning Shift", "start": "2025-02-01T07:00:00Z", "end": "2025-02-01T15:00:00Z" }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts/<shift-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/repetitionCriteria", "value": "Day" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts/<shift-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`ShiftCreateDto`)**: `title` **(REQ)**, `description`, `start` **(REQ)**, `end` **(REQ)**, `isBreak`, `occustOnMonday`…`occustOnSunday`, `repeatEvery`, `repetitionCriteria` (enum), `recurrenceStart`, `recurrenceEnd`, `dayOfTheWeek` (enum), `scheduleId`, `parentTimeIntervalId`, `employeeProfileId` **(REQ)**. `ShiftUpdateDto` mirrors these minus `id`/`timestamp` (none flagged required).

> The per-day booleans are spelled `occustOnMonday`, `occustOnTuesday`, … `occustOnSunday` (sic): transcribe verbatim.

---

## Schedules

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules/<schedule-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (name REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Standard Week",
    "description": "Mon-Fri 9 to 5",
    "monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true,
    "saturday": false, "sunday": false,
    "start": "09:00",
    "end": "17:00",
    "timezoneId": "<timezone-id>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules/<schedule-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Standard Week", "saturday": true }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules/<schedule-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/disabled", "value": true } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules/<schedule-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`ScheduleCreateDto` / `ScheduleUpdateDto`)**: `name` **(REQ on create)**, `description`, `disabled`, `sunday`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `uniqueInterval`, `is24x7Interval`, `start`, `end`, `timezoneId`, `fiscalYearId`, `holidayScheduleId`.

---

## Time Intervals

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals/<interval-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title, scheduleId REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lunch Break",
    "description": "Midday break",
    "isBreak": true,
    "start": "12:00",
    "end": "13:00",
    "repeatEvery": 1,
    "scheduleId": "<schedule-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals/<interval-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Lunch Break", "start": "12:30", "end": "13:30" }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals/<interval-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/isBreak", "value": true } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals/<interval-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`TimeIntervalCreateDto`)**: `title` **(REQ)**, `description`, `isBreak`, `occustOnMonday`…`occustOnSunday`, `start`, `end`, `repeatEvery`, `scheduleId` **(REQ)**, `parentTimeIntervalId`. `TimeIntervalUpdateDto`: same fields **without** `scheduleId` (update body has no `scheduleId`).

---

## Leave Types

> **Read-only at HEAD.** `LeaveTypesController` declares `GET /LeaveTypes/{leaveTypeId}`, `POST`, `PUT /{leaveTypeId}` and `DELETE /{leaveTypeId}`, but only the list and count use cases are implemented; the other routes have no handler registered and fail with a server error. Use the list instead of get-by-id. There is no PATCH route.

```bash
# List  (requires leave_applications_read)
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Record shape (`LeaveTypeDto`)**: `id`, `tenantId`, `title`, `description`. `LeaveTypeCreateDto` / `LeaveTypeUpdateDto` (`title`, `description`) exist in the SDK for the unimplemented write routes.

---

## Leave Applications

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (leaveTypeId, employeeProfileId REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "justification": "Family vacation",
    "approved": false,
    "onReview": true,
    "leaveTypeId": "<type-guid>",
    "employeeProfileId": "<employee-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "justification": "Family vacation", "approved": true, "onReview": false }'

# Patch  (approve in place)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/approved", "value": true },
    { "op": "replace", "path": "/onReview", "value": false }
  ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications/<application-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`LeaveApplicationCreateDto`)**: `justification`, `approved`, `onReview`, `leaveTypeId` **(REQ)**, `employeeProfileId` **(REQ)**. `LeaveApplicationUpdateDto`: `justification`, `approved`, `onReview`, `leaveTypeId`, `employeeProfileId`.

---

## Training Programs

> **Read-only at HEAD.** `TrainingProgramsController` declares `GET /TrainingPrograms/{programId}`, `POST`, `PUT /{programId}` and `DELETE /{programId}`, but only the list and count use cases are implemented; the other routes have no handler registered and fail with a server error. There is no PATCH route. Courses and events of a program are fully writable (next two sections).

```bash
# List  (requires training_programs_read)
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Record shape (`TrainingProgramDto`)**: `id`, `tenantId`, `title`, `description`. `TrainingProgramCreateDto` / `TrainingProgramUpdateDto` (`title`, `description`) exist in the SDK for the unimplemented write routes.

---

## Training Program Courses

Links a course to a training program.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses/<course-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (trainingProgramId, courseId REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "trainingProgramId": "<program-guid>", "courseId": "<course-guid>" }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses/<course-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "trainingProgramId": "<program-guid>", "courseId": "<course-guid>" }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses/<course-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/courseId", "value": "<course-guid>" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses/<course-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

> The path parameter for get/update/patch/delete is `{courseId}` (the join-record id).

**Body (`TrainingProgramCourseCreateDto`)**: `trainingProgramId` **(REQ)**, `courseId` **(REQ)**. `TrainingProgramCourseUpdateDto`: `trainingProgramId`, `courseId`.

---

## Training Program Events

Scheduled sessions within a training program.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents/<event-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title, start, end, trainingProgramId REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q1 Training Session",
    "description": "Quarterly skills workshop",
    "start": "2025-03-15T09:00:00Z",
    "end": "2025-03-15T12:00:00Z",
    "repetitionCriteria": "Month",
    "dayOfTheWeek": "Saturday",
    "trainingProgramId": "<program-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents/<event-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Q1 Training Session", "start": "2025-03-15T10:00:00Z", "end": "2025-03-15T13:00:00Z" }'

# Patch
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents/<event-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/dayOfTheWeek", "value": "Friday" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents/<event-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`TrainingProgramEventCreateDto`)**: `title` **(REQ)**, `description`, `start` **(REQ)**, `end` **(REQ)**, `isBreak`, `occustOnMonday`…`occustOnSunday`, `repeatEvery`, `repetitionCriteria` (enum), `recurrenceStart`, `recurrenceEnd`, `dayOfTheWeek` (enum), `scheduleId`, `parentTimeIntervalId`, `trainingProgramId` **(REQ)**. `TrainingProgramEventUpdateDto` mirrors these (none flagged required).

---

## Appraisal Workflows

> **Read-only at HEAD.** `AppraisalWorkflowsController` declares `GET /AppraisalWorkflows/{workflowId}`, `POST`, `PUT /{workflowId}` and `DELETE /{workflowId}`, but only the list and count use cases are implemented; the other routes have no handler registered and fail with a server error. There is no PATCH route.

```bash
# List  (requires employee_appraisals_read)
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Record shape (`AppraisalWorkflowDto`)**: `id`, `tenantId`, `name`, `description`. `AppraisalWorkflowCreateDto` / `AppraisalWorkflowUpdateDto` (`name`, `description`) exist in the SDK for the unimplemented write routes.

---

## Appraisal Stages

> **Read-only at HEAD.** `AppraisalStagesController` declares `GET /AppraisalStages/{stageId}`, `POST`, `PUT /{stageId}` and `DELETE /{stageId}`, but only the list and count use cases are implemented; the other routes have no handler registered and fail with a server error. There is no PATCH route.

```bash
# List  (requires employee_appraisals_read)
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Record shape (`AppraisalStageDto`)**: `id`, `tenantId`, `name`, `description`, `appraisalWorkflowId`, `stageOrder` (integer). `AppraisalStageCreateDto` / `AppraisalStageUpdateDto` carry the same four input fields for the unimplemented write routes.

---

## Employee Appraisal Sessions

Runs an employee through an appraisal workflow.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions/<session-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (employeeProfileId, appraisalWorkflowId REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeProfileId": "<employee-guid>",
    "appraisalWorkflowId": "<workflow-guid>",
    "appraisalStageId": "<stage-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions/<session-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "employeeProfileId": "<employee-guid>", "appraisalWorkflowId": "<workflow-guid>", "appraisalStageId": "<stage-guid>" }'

# Patch  (advance to next stage)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions/<session-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/appraisalStageId", "value": "<stage-guid>" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions/<session-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`EmployeeAppraisalSessionCreateDto`)**: `employeeProfileId` **(REQ)**, `appraisalWorkflowId` **(REQ)**, `appraisalStageId`. `EmployeeAppraisalSessionUpdateDto`: `employeeProfileId`, `appraisalWorkflowId`, `appraisalStageId`.

---

## Job Fields, Job Offer Fields, Required Skills

Catalog and link resources around job offers. All three expose the same seven routes: `GET /<Resource>`, `GET /<Resource>/Count`, `GET /<Resource>/{id}`, `POST /<Resource>`, `PUT /<Resource>/{id}`, `PATCH /<Resource>/{id}`, `DELETE /<Resource>/{id}`, where the id segment is `{jobFieldId}`, `{jobOfferFieldId}` or `{requiredSkillId}`.

```bash
# Create a job field (catalog entry)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobFields?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Software Engineering", "description": "Engineering roles", "imageUrl": "https://example.com/se.png" }'

# Link a job offer to a job field
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOfferFields?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "jobOfferId": "<offer-guid>", "jobFieldId": "<job-field-guid>" }'

# Require a skill on a job offer
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/RequiredSkills?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "skillId": "<skill-id>", "jobOfferId": "<offer-guid>", "experienceInYears": 3, "priority": 1.0, "requiredSkillRecordType": "MustHave" }'
```

**Bodies**: `JobFieldCreateDto` / `JobFieldUpdateDto`: `name`, `description`, `imageUrl`. `JobOfferFieldRecordCreateDto` / `JobOfferFieldRecordUpdateDto`: `jobOfferId`, `jobFieldId`. `RequiredSkillRecordCreateDto` / `RequiredSkillRecordUpdateDto`: `skillId`, `jobOfferId`, `employerProfileId`, `experienceInYears` (integer), `priority` (decimal), `requiredSkillRecordType` (`MustHave` | `Optional`, default `Optional`).

---

## Job Applicants

Candidate profiles (a `ContactProfile` subtype, so **omit `type`**). Routes: `GET /JobApplicants`, `GET /JobApplicants/Count`, `GET /JobApplicants/{jobApplicantId}`, `POST /JobApplicants`, `PUT /JobApplicants/{jobApplicantId}`, `PATCH /JobApplicants/{jobApplicantId}`, `DELETE /JobApplicants/{jobApplicantId}`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobApplicants?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<contact-guid>",
    "availableForHire": true,
    "careerLevel": "Senior",
    "experienceInYears": 7,
    "minSalaryExpectation": 90000.00,
    "maxSalaryExpectation": 120000.00,
    "currencyId": "USD.USA"
  }'
```

**Body (`JobApplicantProfileCreateDto` / `JobApplicantProfileUpdateDto`)**: the shared profile fields (`contactId`, `about`, `avatarUrl`, `data`…`data9` + `*Label`; inline `contact` on create only) plus `availableForHire`, `careerLevel` (`Junior` | `Intermediate` | `MidLevel` | `Executive` | `Senior`), `experienceInYears`, `currentSalary`, `minSalaryExpectation`, `maxSalaryExpectation`, `currencyId`.

---

## Job Applications

A job applicant's application to a job offer. Routes: `GET /JobApplications`, `GET /JobApplications/Count`, `GET /JobApplications/{jobApplicationId}`, `POST /JobApplications`, `PUT /JobApplications/{jobApplicationId}`, `PATCH /JobApplications/{jobApplicationId}`, `DELETE /JobApplications/{jobApplicationId}`, plus `POST /JobApplications/{jobApplicationId}/Status?status=<status>`.

```bash
# Apply
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobApplications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "jobOfferId": "<offer-guid>", "jobApplicantProfileId": "<applicant-guid>", "salaryExpectation": 100000.00, "currencyId": "USD.USA" }'

# Move through the funnel (status is a QUERY parameter, no body; terminal statuses are immutable)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobApplications/<application-guid>/Status?tenantId=<tenant-guid>&status=Interviewing" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`JobOfferApplicationCreateDto`)**: `start`, `end`, `salaryExpectation`, `currencyId`, `curriculumId`, `curriculumCoverId`, `jobOfferId`, `partnerProfileId`, `jobApplicantProfileId`. `JobOfferApplicationUpdateDto`: the same minus `jobOfferId` and `jobApplicantProfileId`. `status`: `Submitted` | `UnderReview` | `Interviewing` | `Offered` | `Hired` | `Rejected` | `Withdrawn`.

---

## Gig Applications

A job applicant's proposal on a gig. Routes: `GET /GigApplications`, `GET /GigApplications/Count`, `GET /GigApplications/{gigApplicationId}`, `POST /GigApplications`, `PUT /GigApplications/{gigApplicationId}`, `PATCH /GigApplications/{gigApplicationId}`, `DELETE /GigApplications/{gigApplicationId}`, plus `POST /GigApplications/{gigApplicationId}/Accept`.

```bash
# Propose
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/GigApplications?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "gigId": "<gig-guid>", "jobApplicantProfileId": "<applicant-guid>", "proposal": "Two-week delivery", "cost": 4500.00, "currencyId": "USD.USA" }'

# Accept the proposal (no body; cannot be accepted twice)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/GigApplications/<gig-application-guid>/Accept?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`GigApplicationCreateDto`)**: `proposal`, `cost`, `currencyId`, `curriculumId`, `curriculumCoverId`, `gigId`, `jobApplicantProfileId`. `GigApplicationUpdateDto`: `proposal`, `cost`, `currencyId`, `curriculumId`, `curriculumCoverId`.

---

## Position seats

Who holds a position. The position itself (title, department, job role, capacity) is created, read, updated and deleted through `TenantsService/Positions`; the routes below, under `api/v2/HrmsService/Positions`, manage its seats. **A seat grants its holder no permissions.** Staffing needs `positions_assign`, which is NOT implied by `positions_manage` or `positions_update`. Write routes answer `409` with codes such as `positions.revision_stale`, `positions.no_free_seat` and `positions.already_seated`; pass the `revision` you last read as the matching `expected*Revision` field to guard concurrent edits.

| Verb + path | Purpose | Permission |
|---|---|---|
| `GET /Positions/{positionId}/Assignments` | List the position's assignments (active and ended) | `positions_read` |
| `GET /Positions/{positionId}/Assignments/Count` | Count them | `positions_read` |
| `POST /Positions/{positionId}/Assignments` | Fill a seat (Assign) | `positions_assign` |
| `POST /Positions/{positionId}/Assignments/{assignmentId}/End` | Vacate a seat (kept as history, nothing revoked) | `positions_assign` |
| `POST /Positions/{targetPositionId}/Assignments/Reassign` | Move a member's seat to another position in one commit | `positions_assign` |
| `POST /Positions/Assignments/ReassignToNewPosition` | Create a position in a department and move the member into it | `positions_create` + `positions_assign` |
| `POST /Positions/{targetPositionId}/Assignments/AssignWithCapacity` | Raise capacity and seat the member (optionally a move) | `positions_update` + `positions_assign` |
| `PUT /Positions/{positionId}/Assignments/{assignmentId}/Primary` | Make the seat its holder's primary seat | `positions_assign` |
| `PUT /Positions/{positionId}/Capacity` | Change the number of seats (at least 1, never below the filled seats) | `positions_update` |
| `PUT /Positions/{positionId}/Department` | Move the position to another enabled department | `positions_update` |

```bash
# Assign a seat
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Positions/<position-guid>/Assignments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "occupantEnrollmentId": "<enrollment-guid>", "acting": false }'

# End it (no body)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Positions/<position-guid>/Assignments/<assignment-guid>/End?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Reassign to another position (undo: the same call with from and target swapped)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Positions/<target-position-guid>/Assignments/Reassign?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "memberEnrollmentId": "<enrollment-guid>", "fromPositionId": "<from-position-guid>", "fromAssignmentId": "<assignment-guid>", "expectedFromRevision": 4, "expectedTargetRevision": 2 }'

# Change capacity
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Positions/<position-guid>/Capacity?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "capacity": 3 }'
```

**Bodies**:
- `PositionAssignmentCreateDto` (Assign): `occupantEnrollmentId`, `acting`. Answers `PositionAssignmentResultDto`: `assignmentId`, `positionId`, `revision`, plus the holder's `primaryAssignmentId`, `primaryPositionId`, `primaryPositionRevision`.
- `PositionAssignmentReassignDto` (Reassign): `memberEnrollmentId`, `fromPositionId`, `fromAssignmentId`, `acting`, `expectedFromRevision`, `expectedTargetRevision`.
- `PositionAssignmentReassignToNewDto` (ReassignToNewPosition): `memberEnrollmentId`, `fromPositionId`, `fromAssignmentId`, `acting`, `expectedFromRevision`, `title`, `departmentId`, `capacity`, `jobRoleId`, `description`, `reportsToPositionId`.
- `PositionAssignWithCapacityDto` (AssignWithCapacity): `memberEnrollmentId`, `acting`, `newCapacity` (above the current value), `expectedTargetRevision`, and for a move `fromPositionId`, `fromAssignmentId`, `expectedFromRevision`.
- `PositionPrimarySeatDto` (Primary, optional body): `expectedRevision`, `memberEnrollmentId`.
- `PositionCapacityUpdateDto` (Capacity): `capacity`. `PositionDepartmentUpdateDto` (Department): `departmentId`, `expectedRevision`.
- Assignment record (`BusinessPositionAssignmentDto`): `id`, `positionId`, `tenantId`, `occupantEnrollmentId`, `from`, `until`, `acting`, `isPrimary`, `enrollmentId`.

---

## PATCH (JSON Patch RFC 6902)

PATCH bodies are a **JSON array** of operations, `Content-Type: application/json`. Each operation has `op` ∈ `add | remove | replace | move | copy | test`; `path` (and `from` for `move`/`copy`) are JSON-Pointers using a leading `/` and the camelCase field name. Use PATCH for atomic partial updates (change a couple of fields without resending the whole object; safer than PUT for concurrent edits). Remember `?tenantId=<tenant-guid>` is still required on the PATCH request.

```bash
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees/<employee-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "op": "replace", "path": "/grossPay", "value": 110000.00 },
    { "op": "replace", "path": "/jobTitleId", "value": "<job-title-guid>" },
    { "op": "remove",  "path": "/avatarUrl" }
  ]'
```

**Resources that support PATCH:** Employees, EmployeeTypes, Employers, Gigs, GigApplications, JobOffers, JobApplicants, JobApplications, JobFields, JobOfferFields, RequiredSkills, JobTitles, Salaries, Payrolls, Shifts, Schedules, TimeIntervals, LeaveApplications, TrainingProgramCourses, TrainingProgramEvents, EmployeeAppraisalSessions.

**Resources WITHOUT a PATCH endpoint:** PayrollPeriods (use PUT instead), plus LeaveTypes, TrainingPrograms, AppraisalWorkflows and AppraisalStages (read-only at HEAD, see their sections).

---

## End-to-end workflow: onboard an employee and run an appraisal

```bash
TENANT="<tenant-guid>"
AUTH=(-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN")
JSON=(-H "Content-Type: application/json")

# 1. Create an employee type
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes?tenantId=$TENANT" "${AUTH[@]}" "${JSON[@]}" \
  -d '{ "name": "Full-Time", "description": "Standard full-time" }'

# 2. Create a job title with standard comp
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles?tenantId=$TENANT" "${AUTH[@]}" "${JSON[@]}" \
  -d '{ "title": "Software Engineer", "grossPay": 95000.00, "netSalary": 72000.00, "currencyId": "USD.USA" }'

# 3. Create the employee profile (use the type and title ids from steps 1-2)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees?tenantId=$TENANT" "${AUTH[@]}" "${JSON[@]}" \
  -d '{ "contactId": "<contact-guid>", "employeeTypeId": "<type-guid>", "jobTitleId": "<title-guid>", "grossPay": 95000.00, "payrollCurrency": "USD.USA" }'

# 4. Record the salary (amount, currencyId, employeeProfileId all required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries?tenantId=$TENANT" "${AUTH[@]}" "${JSON[@]}" \
  -d '{ "amount": 95000.00, "currencyId": "USD.USA", "employeeProfileId": "<employee-guid>" }'

# 5. Pick an existing appraisal workflow and its stages (workflows and stages are read-only over REST at HEAD)
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows?tenantId=$TENANT" "${AUTH[@]}"
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages?tenantId=$TENANT" "${AUTH[@]}"

# 6. Open a session for the employee on that workflow
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions?tenantId=$TENANT" "${AUTH[@]}" "${JSON[@]}" \
  -d '{ "employeeProfileId": "<employee-guid>", "appraisalWorkflowId": "<workflow-guid>", "appraisalStageId": "<stage-guid>" }'

# 7. Advance the session to the next stage with a PATCH
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions/<session-guid>?tenantId=$TENANT" "${AUTH[@]}" "${JSON[@]}" \
  -d '[ { "op": "replace", "path": "/appraisalStageId", "value": "<next-stage-guid>" } ]'
```

---

## API Endpoints Quick Reference

All paths are relative to `$ABSUITE_HOST_URL/api/v2/HrmsService/` and require `?tenantId=<tenant-guid>` on every verb. `(n/i)` marks a route that is declared but has no use case implemented at HEAD (it fails with a server error); `-` means no such route.

| Resource | List | Count | Get by ID | Create | Update (PUT) | Patch (PATCH) | Delete |
|---|---|---|---|---|---|---|---|
| Employees | `GET /Employees` | `GET /Employees/Count` | `GET /Employees/{employeeId}` | `POST /Employees` | `PUT /Employees/{employeeId}` | `PATCH /Employees/{employeeId}` | `DELETE /Employees/{employeeId}` |
| EmployeeTypes | `GET /EmployeeTypes` | `GET /EmployeeTypes/Count` | `GET /EmployeeTypes/{employeeTypeId}` | `POST /EmployeeTypes` | `PUT /EmployeeTypes/{employeeTypeId}` | `PATCH /EmployeeTypes/{employeeTypeId}` | `DELETE /EmployeeTypes/{employeeTypeId}` |
| Employers | `GET /Employers` | `GET /Employers/Count` | `GET /Employers/{employerId}` | `POST /Employers` | `PUT /Employers/{employerId}` | `PATCH /Employers/{employerId}` | `DELETE /Employers/{employerId}` |
| Gigs | `GET /Gigs` | `GET /Gigs/Count` | `GET /Gigs/{gigId}` | `POST /Gigs` | `PUT /Gigs/{gigId}` | `PATCH /Gigs/{gigId}` | `DELETE /Gigs/{gigId}` |
| JobOffers | `GET /JobOffers` | `GET /JobOffers/Count` | `GET /JobOffers/{jobOfferId}` | `POST /JobOffers` | `PUT /JobOffers/{jobOfferId}` | `PATCH /JobOffers/{jobOfferId}` | `DELETE /JobOffers/{jobOfferId}` |
| JobTitles | `GET /JobTitles` | `GET /JobTitles/Count` | `GET /JobTitles/{jobTitleId}` | `POST /JobTitles` | `PUT /JobTitles/{jobTitleId}` | `PATCH /JobTitles/{jobTitleId}` | `DELETE /JobTitles/{jobTitleId}` |
| Salaries | `GET /Salaries` | `GET /Salaries/Count` | `GET /Salaries/{salaryId}` | `POST /Salaries` | `PUT /Salaries/{salaryId}` | `PATCH /Salaries/{salaryId}` | `DELETE /Salaries/{salaryId}` |
| Payrolls | `GET /Payrolls` | `GET /Payrolls/Count` | `GET /Payrolls/{payrollId}` | `POST /Payrolls` | `PUT /Payrolls/{payrollId}` | `PATCH /Payrolls/{payrollId}` | `DELETE /Payrolls/{payrollId}` |
| PayrollPeriods | `GET /PayrollPeriods` | `GET /PayrollPeriods/Count` | `GET /PayrollPeriods/{periodId}` | `POST /PayrollPeriods` | `PUT /PayrollPeriods/{periodId}` | - | `DELETE /PayrollPeriods/{periodId}` |
| Shifts | `GET /Shifts` | `GET /Shifts/Count` | `GET /Shifts/{shiftId}` | `POST /Shifts` | `PUT /Shifts/{shiftId}` | `PATCH /Shifts/{shiftId}` | `DELETE /Shifts/{shiftId}` |
| Schedules | `GET /Schedules` | `GET /Schedules/Count` | `GET /Schedules/{scheduleId}` | `POST /Schedules` | `PUT /Schedules/{scheduleId}` | `PATCH /Schedules/{scheduleId}` | `DELETE /Schedules/{scheduleId}` |
| TimeIntervals | `GET /TimeIntervals` | `GET /TimeIntervals/Count` | `GET /TimeIntervals/{timeIntervalId}` | `POST /TimeIntervals` | `PUT /TimeIntervals/{timeIntervalId}` | `PATCH /TimeIntervals/{timeIntervalId}` | `DELETE /TimeIntervals/{timeIntervalId}` |
| LeaveTypes | `GET /LeaveTypes` | `GET /LeaveTypes/Count` | `GET /LeaveTypes/{leaveTypeId}` (n/i) | `POST /LeaveTypes` (n/i) | `PUT /LeaveTypes/{leaveTypeId}` (n/i) | - | `DELETE /LeaveTypes/{leaveTypeId}` (n/i) |
| LeaveApplications | `GET /LeaveApplications` | `GET /LeaveApplications/Count` | `GET /LeaveApplications/{leaveApplicationId}` | `POST /LeaveApplications` | `PUT /LeaveApplications/{leaveApplicationId}` | `PATCH /LeaveApplications/{leaveApplicationId}` | `DELETE /LeaveApplications/{leaveApplicationId}` |
| TrainingPrograms | `GET /TrainingPrograms` | `GET /TrainingPrograms/Count` | `GET /TrainingPrograms/{programId}` (n/i) | `POST /TrainingPrograms` (n/i) | `PUT /TrainingPrograms/{programId}` (n/i) | - | `DELETE /TrainingPrograms/{programId}` (n/i) |
| TrainingProgramCourses | `GET /TrainingProgramCourses` | `GET /TrainingProgramCourses/Count` | `GET /TrainingProgramCourses/{courseId}` | `POST /TrainingProgramCourses` | `PUT /TrainingProgramCourses/{courseId}` | `PATCH /TrainingProgramCourses/{courseId}` | `DELETE /TrainingProgramCourses/{courseId}` |
| TrainingProgramEvents | `GET /TrainingProgramEvents` | `GET /TrainingProgramEvents/Count` | `GET /TrainingProgramEvents/{eventId}` | `POST /TrainingProgramEvents` | `PUT /TrainingProgramEvents/{eventId}` | `PATCH /TrainingProgramEvents/{eventId}` | `DELETE /TrainingProgramEvents/{eventId}` |
| AppraisalWorkflows | `GET /AppraisalWorkflows` | `GET /AppraisalWorkflows/Count` | `GET /AppraisalWorkflows/{workflowId}` (n/i) | `POST /AppraisalWorkflows` (n/i) | `PUT /AppraisalWorkflows/{workflowId}` (n/i) | - | `DELETE /AppraisalWorkflows/{workflowId}` (n/i) |
| AppraisalStages | `GET /AppraisalStages` | `GET /AppraisalStages/Count` | `GET /AppraisalStages/{stageId}` (n/i) | `POST /AppraisalStages` (n/i) | `PUT /AppraisalStages/{stageId}` (n/i) | - | `DELETE /AppraisalStages/{stageId}` (n/i) |
| EmployeeAppraisalSessions | `GET /EmployeeAppraisalSessions` | `GET /EmployeeAppraisalSessions/Count` | `GET /EmployeeAppraisalSessions/{sessionId}` | `POST /EmployeeAppraisalSessions` | `PUT /EmployeeAppraisalSessions/{sessionId}` | `PATCH /EmployeeAppraisalSessions/{sessionId}` | `DELETE /EmployeeAppraisalSessions/{sessionId}` |

**Additional routes (same CRUD shape, all with PATCH):** `GigApplications/{gigApplicationId}`, `JobApplicants/{jobApplicantId}`, `JobApplications/{jobApplicationId}`, `JobFields/{jobFieldId}`, `JobOfferFields/{jobOfferFieldId}`, `RequiredSkills/{requiredSkillId}`, each with list, `Count`, get, POST, PUT, PATCH and DELETE.

**Action routes (POST, no body):** `Employers/{employerId}/Publish`, `Employers/{employerId}/Unpublish`, `Gigs/{gigId}/Publish`, `Gigs/{gigId}/Award`, `Gigs/{gigId}/Complete`, `Gigs/{gigId}/Cancel`, `GigApplications/{gigApplicationId}/Accept`, `JobOffers/{jobOfferId}/Publish`, `JobOffers/{jobOfferId}/Close`, `JobOffers/{jobOfferId}/Fill`, `JobApplications/{jobApplicationId}/Status?status=<status>`.

**Anonymous reads:** `GET JobOffers/Public`, `GET JobOffers/Public/Count`, `GET JobOffers/Public/{jobOfferId}` (tenantId optional).

**Position seats:** see the [Position seats](#position-seats) table (`Positions/{positionId}/Assignments`, `.../Count`, `.../{assignmentId}/End`, `.../{assignmentId}/Primary`, `Positions/{targetPositionId}/Assignments/Reassign`, `Positions/{targetPositionId}/Assignments/AssignWithCapacity`, `Positions/Assignments/ReassignToNewPosition`, `Positions/{positionId}/Capacity`, `Positions/{positionId}/Department`).

## Critical Rules

- **Authenticate first.** Obtain a bearer token via `POST /login` (see `absuite-login`) before any HRMS call.
- **Always pass the tenant** (`?tenantId=<tenant-guid>` or the `X-TenantId` header) on every verb, including writes; omitting it returns `400`.
- **Hold the right permission** (see [Permissions](#permissions)); seat staffing needs `positions_assign` specifically.
- **Never send `type`** on employee, employer or job-applicant profiles: it is the EF discriminator.
- **Create dependencies first**: an `Employer` before gigs/job-offers that reference it; an `EmployeeType` / `JobTitle` before the employees that reference them; a job applicant before its job or gig applications; a `Schedule` before its time intervals. Appraisal workflows and stages, leave types and training programs cannot be created over REST at HEAD: use existing records.
- **Check `isSuccess`** in the response envelope and read data from `result`.
- **PATCH bodies are JSON arrays** of `{op,path,value}` operations, not objects.
