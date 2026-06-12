---
name: absuite-hrms
description: >
  Manage human resources in the Alliance Business Suite (ABS) via the REST API.
  Covers employees, employers, employee types, job titles, salaries, payrolls,
  payroll periods, gigs, job offers, shifts, schedules, time intervals, leave
  management, training programs, and performance appraisals — including atomic
  PATCH (JSON Patch) updates. All operations are tenant-scoped and require a
  bearer token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — HRMS Skill (REST)

Manage human resources through the `HrmsService` REST API. Every endpoint is tenant-scoped and requires a bearer token. This skill covers all `HrmsService` resources via raw `curl`, including list / count / get / create (POST) / update (PUT) / **patch (PATCH, JSON Patch RFC 6902)** / delete.

> For the CLI equivalent, see `absuite-hrms-cli`. For general REST conventions across all ABS services, see `absuite-rest`.

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

Every `HrmsService` endpoint requires a tenant. Pass `?tenantId=<tenant-guid>` as a query parameter on **every** verb — including POST, PUT, PATCH, and DELETE (omitting it on writes returns `400`). Equivalently you may send the `X-TenantId: <tenant-guid>` request header; the platform reads either interchangeably. Examples below use the query param.

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

- **Employees / Employers** are HR *profiles*. They link back to a `contactId` (the underlying person/organization contact) and carry HR-specific data: pay (`grossPay`, `netSalary`, `payrollCurrency`), `maxWorkHoursPerDay`, a `jobTitleId`, and an `employeeTypeId`. Both profiles also expose ten generic `data` / `dataLabel` slots (`data`, `data1`…`data9` plus matching `*Label`) for custom fields.
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
    "type": "Internal",
    "about": "Backend engineer",
    "grossPay": 95000.00,
    "netSalary": 72000.00,
    "payrollCurrency": "USD",
    "maxWorkHoursPerDay": 8,
    "jobTitleId": "<job-title-guid>",
    "employeeTypeId": "<employee-type-guid>"
  }'

# Update (PUT — full replacement)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees/<employee-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<contact-guid>",
    "grossPay": 105000.00,
    "netSalary": 79000.00,
    "payrollCurrency": "USD",
    "jobTitleId": "<job-title-guid>",
    "employeeTypeId": "<employee-type-guid>"
  }'

# Patch (JSON Patch — partial update)
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

**Create body (`EmployeeProfileCreateDto`)**: `type`, `contactId`, `about`, `avatarUrl`, `data`…`data9` + `*Label`, `grossPay`, `netSalary`, `payrollCurrency`, `maxWorkHoursPerDay`, `jobTitleId`, `employeeTypeId`. The PUT body (`EmployeeProfileUpdateDto`) accepts the same fields minus `id`/`timestamp`. No fields are flagged required by the spec.

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
    "type": "Organization",
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
```

**Body (`EmployerProfileCreateDto` / `EmployerProfileUpdateDto`)**: `type`, `contactId`, `about`, `avatarUrl`, `data`…`data9` + `*Label`. No required fields per spec.

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
    "currencyId": "USD",
    "countryId": "<country-id>",
    "location": "Remote",
    "externalUrl": "https://example.com/gig"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/<gig-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Frontend Sprint v2", "maxBudget": 6000.00, "currencyId": "USD" }'

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
    "currencyId": "USD",
    "jobFieldId": "<job-field-id>",
    "employerProfileId": "<employer-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/<offer-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Senior .NET Developer", "maxSalaryAmount": 130000.00, "currencyId": "USD" }'

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
```

**Body (`JobOfferCreateDto` / `JobOfferUpdateDto`)**: `remote`, `expectedHireDate`, `title`, `description`, `technicalSkills`, `nonTechnicalSkills`, `certifications`, `projectExperience`, `technologies`, `benefits`, `isOfficialJobOffer`, `isRemoteJobOffer`, `isMidTimeJobOffer`, `isUndergraduateOption`, `minOverallExperienceYears`, `availiablePositionsCount`, `minSalaryAmount`, `maxSalaryAmount`, `currencyId`, `jobFieldId`, `employerProfileId`, `countryId`, `countryStateId`, `cityId`, `imageUrl`, `location`, `externalUrl`, `data`…`data9` + `*Label`.

> Note: the spec field is spelled `availiablePositionsCount` (sic) — transcribe it verbatim.

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
    "currencyId": "USD"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles/<title-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Staff Software Engineer", "grossPay": 140000.00, "currencyId": "USD" }'

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
    "currencyId": "USD",
    "employeeProfileId": "<employee-guid>"
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries/<salary-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "amount": 90000.00, "currencyId": "USD", "employeeProfileId": "<employee-guid>" }'

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

> Payroll Periods support GET / POST / PUT / DELETE / Count only — **no PATCH endpoint** in the spec.

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

> The per-day booleans are spelled `occustOnMonday`, `occustOnTuesday`, … `occustOnSunday` (sic) — transcribe verbatim.

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

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Annual Leave", "description": "Paid annual vacation days" }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Annual Leave", "description": "Updated" }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes/<type-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

> Leave Types support GET / POST / PUT / DELETE / Count only — **no PATCH endpoint** in the spec.

**Body (`LeaveTypeCreateDto`)**: `title` **(REQ)**, `description`. `LeaveTypeUpdateDto`: `title`, `description`.

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

> Training Programs support GET / POST / PUT / DELETE / Count only — **no PATCH endpoint** in the spec.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms/<program-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (title REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Onboarding Program", "description": "New employee onboarding and orientation" }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms/<program-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Onboarding Program", "description": "Updated" }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms/<program-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`TrainingProgramCreateDto`)**: `title` **(REQ)**, `description`. `TrainingProgramUpdateDto`: `title`, `description`.

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

> Appraisal Workflows support GET / POST / PUT / DELETE / Count only — **no PATCH endpoint** in the spec.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows/<workflow-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (name REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Annual Performance Review", "description": "Standard annual review process" }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows/<workflow-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Annual Performance Review", "description": "Updated" }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows/<workflow-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`AppraisalWorkflowCreateDto`)**: `name` **(REQ)**, `description`. `AppraisalWorkflowUpdateDto`: `name`, `description`.

---

## Appraisal Stages

> Appraisal Stages support GET / POST / PUT / DELETE / Count only — **no PATCH endpoint** in the spec.

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages/<stage-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create  (name, appraisalWorkflowId, stageOrder REQUIRED)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Self Assessment",
    "description": "Employee completes self-review",
    "appraisalWorkflowId": "<workflow-guid>",
    "stageOrder": 1
  }'

# Update (PUT)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages/<stage-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Self Assessment", "appraisalWorkflowId": "<workflow-guid>", "stageOrder": 2 }'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages/<stage-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**Body (`AppraisalStageCreateDto`)**: `name` **(REQ)**, `description`, `appraisalWorkflowId` **(REQ)**, `stageOrder` **(REQ, integer)**. `AppraisalStageUpdateDto`: `name`, `description`, `appraisalWorkflowId`, `stageOrder`.

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

## PATCH (JSON Patch RFC 6902)

PATCH bodies are a **JSON array** of operations, `Content-Type: application/json`. Each operation has `op` ∈ `add | remove | replace | move | copy | test`; `path` (and `from` for `move`/`copy`) are JSON-Pointers using a leading `/` and the camelCase field name. Use PATCH for atomic partial updates (change a couple of fields without resending the whole object — safer than PUT for concurrent edits). Remember `?tenantId=<tenant-guid>` is still required on the PATCH request.

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

**Resources that support PATCH:** Employees, EmployeeTypes, Employers, Gigs, JobOffers, JobTitles, Salaries, Payrolls, Shifts, Schedules, TimeIntervals, LeaveApplications, TrainingProgramCourses, TrainingProgramEvents, EmployeeAppraisalSessions.

**Resources WITHOUT a PATCH endpoint (use PUT instead):** PayrollPeriods, LeaveTypes, TrainingPrograms, AppraisalWorkflows, AppraisalStages.

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
  -d '{ "title": "Software Engineer", "grossPay": 95000.00, "netSalary": 72000.00, "currencyId": "USD" }'

# 3. Create the employee profile (use the type and title ids from steps 1-2)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees?tenantId=$TENANT" "${AUTH[@]}" "${JSON[@]}" \
  -d '{ "contactId": "<contact-guid>", "employeeTypeId": "<type-guid>", "jobTitleId": "<title-guid>", "grossPay": 95000.00, "payrollCurrency": "USD" }'

# 4. Record the salary (amount, currencyId, employeeProfileId all required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries?tenantId=$TENANT" "${AUTH[@]}" "${JSON[@]}" \
  -d '{ "amount": 95000.00, "currencyId": "USD", "employeeProfileId": "<employee-guid>" }'

# 5. Create an appraisal workflow, then its first stage
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows?tenantId=$TENANT" "${AUTH[@]}" "${JSON[@]}" \
  -d '{ "name": "Annual Review" }'
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages?tenantId=$TENANT" "${AUTH[@]}" "${JSON[@]}" \
  -d '{ "name": "Self Assessment", "appraisalWorkflowId": "<workflow-guid>", "stageOrder": 1 }'

# 6. Open a session for the employee on that workflow
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions?tenantId=$TENANT" "${AUTH[@]}" "${JSON[@]}" \
  -d '{ "employeeProfileId": "<employee-guid>", "appraisalWorkflowId": "<workflow-guid>", "appraisalStageId": "<stage-guid>" }'

# 7. Advance the session to the next stage with a PATCH
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions/<session-guid>?tenantId=$TENANT" "${AUTH[@]}" "${JSON[@]}" \
  -d '[ { "op": "replace", "path": "/appraisalStageId", "value": "<next-stage-guid>" } ]'
```

---

## API Endpoints Quick Reference

All paths are relative to `$ABSUITE_HOST_URL/api/v2/HrmsService/` and require `?tenantId=<tenant-guid>` on every verb.

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
| PayrollPeriods | `GET /PayrollPeriods` | `GET /PayrollPeriods/Count` | `GET /PayrollPeriods/{periodId}` | `POST /PayrollPeriods` | `PUT /PayrollPeriods/{periodId}` | — | `DELETE /PayrollPeriods/{periodId}` |
| Shifts | `GET /Shifts` | `GET /Shifts/Count` | `GET /Shifts/{shiftId}` | `POST /Shifts` | `PUT /Shifts/{shiftId}` | `PATCH /Shifts/{shiftId}` | `DELETE /Shifts/{shiftId}` |
| Schedules | `GET /Schedules` | `GET /Schedules/Count` | `GET /Schedules/{scheduleId}` | `POST /Schedules` | `PUT /Schedules/{scheduleId}` | `PATCH /Schedules/{scheduleId}` | `DELETE /Schedules/{scheduleId}` |
| TimeIntervals | `GET /TimeIntervals` | `GET /TimeIntervals/Count` | `GET /TimeIntervals/{timeIntervalId}` | `POST /TimeIntervals` | `PUT /TimeIntervals/{timeIntervalId}` | `PATCH /TimeIntervals/{timeIntervalId}` | `DELETE /TimeIntervals/{timeIntervalId}` |
| LeaveTypes | `GET /LeaveTypes` | `GET /LeaveTypes/Count` | `GET /LeaveTypes/{leaveTypeId}` | `POST /LeaveTypes` | `PUT /LeaveTypes/{leaveTypeId}` | — | `DELETE /LeaveTypes/{leaveTypeId}` |
| LeaveApplications | `GET /LeaveApplications` | `GET /LeaveApplications/Count` | `GET /LeaveApplications/{leaveApplicationId}` | `POST /LeaveApplications` | `PUT /LeaveApplications/{leaveApplicationId}` | `PATCH /LeaveApplications/{leaveApplicationId}` | `DELETE /LeaveApplications/{leaveApplicationId}` |
| TrainingPrograms | `GET /TrainingPrograms` | `GET /TrainingPrograms/Count` | `GET /TrainingPrograms/{programId}` | `POST /TrainingPrograms` | `PUT /TrainingPrograms/{programId}` | — | `DELETE /TrainingPrograms/{programId}` |
| TrainingProgramCourses | `GET /TrainingProgramCourses` | `GET /TrainingProgramCourses/Count` | `GET /TrainingProgramCourses/{courseId}` | `POST /TrainingProgramCourses` | `PUT /TrainingProgramCourses/{courseId}` | `PATCH /TrainingProgramCourses/{courseId}` | `DELETE /TrainingProgramCourses/{courseId}` |
| TrainingProgramEvents | `GET /TrainingProgramEvents` | `GET /TrainingProgramEvents/Count` | `GET /TrainingProgramEvents/{eventId}` | `POST /TrainingProgramEvents` | `PUT /TrainingProgramEvents/{eventId}` | `PATCH /TrainingProgramEvents/{eventId}` | `DELETE /TrainingProgramEvents/{eventId}` |
| AppraisalWorkflows | `GET /AppraisalWorkflows` | `GET /AppraisalWorkflows/Count` | `GET /AppraisalWorkflows/{workflowId}` | `POST /AppraisalWorkflows` | `PUT /AppraisalWorkflows/{workflowId}` | — | `DELETE /AppraisalWorkflows/{workflowId}` |
| AppraisalStages | `GET /AppraisalStages` | `GET /AppraisalStages/Count` | `GET /AppraisalStages/{stageId}` | `POST /AppraisalStages` | `PUT /AppraisalStages/{stageId}` | — | `DELETE /AppraisalStages/{stageId}` |
| EmployeeAppraisalSessions | `GET /EmployeeAppraisalSessions` | `GET /EmployeeAppraisalSessions/Count` | `GET /EmployeeAppraisalSessions/{sessionId}` | `POST /EmployeeAppraisalSessions` | `PUT /EmployeeAppraisalSessions/{sessionId}` | `PATCH /EmployeeAppraisalSessions/{sessionId}` | `DELETE /EmployeeAppraisalSessions/{sessionId}` |

## Critical Rules

- **Authenticate first.** Obtain a bearer token via `POST /login` (see `absuite-login`) before any HRMS call.
- **Always pass `?tenantId=<tenant-guid>`** on every verb, including writes — omitting it on POST/PUT/PATCH/DELETE returns `400`.
- **Create dependencies first**: an `Employer` before gigs/job-offers that reference it; an `EmployeeType` / `JobTitle` before the employees that reference them; an `AppraisalWorkflow` before its stages and sessions; a `Schedule` before its time intervals.
- **Check `isSuccess`** in the response envelope and read data from `result`.
- **PATCH bodies are JSON arrays** of `{op,path,value}` operations — not objects.
