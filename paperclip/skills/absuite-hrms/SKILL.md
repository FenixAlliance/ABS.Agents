---
name: absuite-hrms
description: >
  Manage human resources in the Alliance Business Suite (ABS) using the `absuite`
  CLI or REST API. Covers employees, employers, employee types, job titles, salaries,
  payrolls, gigs, job offers, shifts, schedules, leave management, time intervals,
  training programs, and appraisals. Requires authentication.
---

# Alliance Business Suite — HRMS Skill

Manage human resources through the `absuite` CLI's `hrms` service or the `HrmsService` REST API. All operations are tenant-scoped and require authentication.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant**: `absuite config set --tenant-id <tenant-guid>` or pass `--TenantId` on each call.
3. **Discover commands**: `absuite hrms list-commands`

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

## Employees

```bash
# List
absuite hrms list employees --TenantId $TENANT_ID

# Count
absuite hrms count employees --TenantId $TENANT_ID

# Get by ID
absuite hrms get employee-by-id --TenantId $TENANT_ID --EmployeeId <employee-guid>

# Create
absuite hrms create employee --TenantId $TENANT_ID --EmployeeCreateDto '{
  "ContactId": "<contact-guid>",
  "EmployerId": "<employer-guid>",
  "Title": "Software Engineer",
  "Department": "Engineering"
}'

# Update
absuite hrms update employee --TenantId $TENANT_ID --EmployeeId <employee-guid> --EmployeeUpdateDto '{...}'

# Delete
absuite hrms delete employee --TenantId $TENANT_ID --EmployeeId <employee-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees/<employee-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ContactId": "<contact-guid>",
    "EmployerId": "<employer-guid>",
    "Title": "Software Engineer",
    "Department": "Engineering"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees/<employee-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Employees/<employee-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Employee Types

```bash
# List
absuite hrms list employee-types --TenantId $TENANT_ID

# Count
absuite hrms count employee-types --TenantId $TENANT_ID

# Get by ID
absuite hrms get employee-type-by-id --TenantId $TENANT_ID --EmployeeTypeId <type-guid>

# Create
absuite hrms create employee-type --TenantId $TENANT_ID --EmployeeTypeCreateDto '{
  "Name": "Full-Time",
  "Description": "Standard full-time employment"
}'

# Update
absuite hrms update employee-type --TenantId $TENANT_ID --EmployeeTypeId <type-guid> --EmployeeTypeUpdateDto '{...}'

# Delete
absuite hrms delete employee-type --TenantId $TENANT_ID --EmployeeTypeId <type-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Full-Time",
    "Description": "Standard full-time employment"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Employers

```bash
# List
absuite hrms list employers --TenantId $TENANT_ID

# Count
absuite hrms count employers --TenantId $TENANT_ID

# Get by ID
absuite hrms get employer-by-id --TenantId $TENANT_ID --EmployerId <employer-guid>

# Create
absuite hrms create employer --TenantId $TENANT_ID --EmployerCreateDto '{
  "Name": "Acme Corporation",
  "Description": "Technology company"
}'

# Update
absuite hrms update employer --TenantId $TENANT_ID --EmployerId <employer-guid> --EmployerUpdateDto '{...}'

# Delete
absuite hrms delete employer --TenantId $TENANT_ID --EmployerId <employer-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers/<employer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Acme Corporation",
    "Description": "Technology company"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers/<employer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Employers/<employer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Gigs

Short-term or freelance work assignments.

```bash
# List
absuite hrms list gigs --TenantId $TENANT_ID

# Count
absuite hrms count gigs --TenantId $TENANT_ID

# Get by ID
absuite hrms get gig-by-id --TenantId $TENANT_ID --GigId <gig-guid>

# Create
absuite hrms create gig --TenantId $TENANT_ID --GigCreateDto '{
  "Title": "Frontend Development Sprint",
  "Description": "Build checkout flow components"
}'

# Update
absuite hrms update gig --TenantId $TENANT_ID --GigId <gig-guid> --GigUpdateDto '{...}'

# Delete
absuite hrms delete gig --TenantId $TENANT_ID --GigId <gig-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/<gig-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Frontend Development Sprint",
    "Description": "Build checkout flow components"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/<gig-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Gigs/<gig-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Job Offers

```bash
# List
absuite hrms list job-offers --TenantId $TENANT_ID

# Count
absuite hrms count job-offers --TenantId $TENANT_ID

# Get by ID
absuite hrms get job-offer-by-id --TenantId $TENANT_ID --JobOfferId <offer-guid>

# Create
absuite hrms create job-offer --TenantId $TENANT_ID --JobOfferCreateDto '{
  "Title": "Senior .NET Developer",
  "Description": "Remote position, full-time"
}'

# Update
absuite hrms update job-offer --TenantId $TENANT_ID --JobOfferId <offer-guid> --JobOfferUpdateDto '{...}'

# Delete
absuite hrms delete job-offer --TenantId $TENANT_ID --JobOfferId <offer-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/<offer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Senior .NET Developer",
    "Description": "Remote position, full-time"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/<offer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/JobOffers/<offer-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Compensation

### Job Titles

```bash
# List
absuite hrms list job-titles --TenantId $TENANT_ID

# Count
absuite hrms count job-titles --TenantId $TENANT_ID

# Get by ID
absuite hrms get job-title-by-id --TenantId $TENANT_ID --JobTitleId <title-guid>

# Create
absuite hrms create job-title --TenantId $TENANT_ID --JobTitleCreateDto '{
  "Name": "Senior Software Engineer",
  "Description": "Senior-level engineering role"
}'

# Update
absuite hrms update job-title --TenantId $TENANT_ID --JobTitleId <title-guid> --JobTitleUpdateDto '{...}'

# Delete
absuite hrms delete job-title --TenantId $TENANT_ID --JobTitleId <title-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles/<title-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Senior Software Engineer",
    "Description": "Senior-level engineering role"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles/<title-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/JobTitles/<title-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Salaries

```bash
# List
absuite hrms list salaries --TenantId $TENANT_ID

# Count
absuite hrms count salaries --TenantId $TENANT_ID

# Get by ID
absuite hrms get salary-by-id --TenantId $TENANT_ID --SalaryId <salary-guid>

# Create
absuite hrms create salary --TenantId $TENANT_ID --SalaryCreateDto '{
  "EmployeeId": "<employee-guid>",
  "Amount": 85000.00,
  "CurrencyId": "USD"
}'

# Update
absuite hrms update salary --TenantId $TENANT_ID --SalaryId <salary-guid> --SalaryUpdateDto '{...}'

# Delete
absuite hrms delete salary --TenantId $TENANT_ID --SalaryId <salary-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries/<salary-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "EmployeeId": "<employee-guid>",
    "Amount": 85000.00,
    "CurrencyId": "USD"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries/<salary-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Salaries/<salary-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Payrolls & Payroll Periods

### Payrolls

```bash
# List
absuite hrms list payrolls --TenantId $TENANT_ID

# Count
absuite hrms count payrolls --TenantId $TENANT_ID

# Get by ID
absuite hrms get payroll-by-id --TenantId $TENANT_ID --PayrollId <payroll-guid>

# Create
absuite hrms create payroll --TenantId $TENANT_ID --PayrollCreateDto '{
  "Name": "January 2025 Payroll",
  "Description": "Monthly payroll run"
}'

# Update
absuite hrms update payroll --TenantId $TENANT_ID --PayrollId <payroll-guid> --PayrollUpdateDto '{...}'

# Delete
absuite hrms delete payroll --TenantId $TENANT_ID --PayrollId <payroll-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls/<payroll-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "January 2025 Payroll",
    "Description": "Monthly payroll run"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls/<payroll-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Payrolls/<payroll-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Payroll Periods

```bash
# List
absuite hrms list payroll-periods --TenantId $TENANT_ID

# Count
absuite hrms count payroll-periods --TenantId $TENANT_ID

# Get by ID
absuite hrms get payroll-period-by-id --TenantId $TENANT_ID --PayrollPeriodId <period-guid>

# Create
absuite hrms create payroll-period --TenantId $TENANT_ID --PayrollPeriodCreateDto '{
  "PayrollId": "<payroll-guid>",
  "StartDate": "2025-01-01",
  "EndDate": "2025-01-31"
}'

# Update
absuite hrms update payroll-period --TenantId $TENANT_ID --PayrollPeriodId <period-guid> --PayrollPeriodUpdateDto '{...}'

# Delete
absuite hrms delete payroll-period --TenantId $TENANT_ID --PayrollPeriodId <period-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/PayrollPeriods" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/PayrollPeriods/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/PayrollPeriods/<period-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/PayrollPeriods" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "PayrollId": "<payroll-guid>",
    "StartDate": "2025-01-01",
    "EndDate": "2025-01-31"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/PayrollPeriods/<period-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/PayrollPeriods/<period-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Shifts & Schedules

### Shifts

```bash
# List
absuite hrms list shifts --TenantId $TENANT_ID

# Count
absuite hrms count shifts --TenantId $TENANT_ID

# Get by ID
absuite hrms get shift-by-id --TenantId $TENANT_ID --ShiftId <shift-guid>

# Create
absuite hrms create shift --TenantId $TENANT_ID --ShiftCreateDto '{
  "Name": "Morning Shift",
  "StartTime": "08:00",
  "EndTime": "16:00"
}'

# Update
absuite hrms update shift --TenantId $TENANT_ID --ShiftId <shift-guid> --ShiftUpdateDto '{...}'

# Delete
absuite hrms delete shift --TenantId $TENANT_ID --ShiftId <shift-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts/<shift-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Morning Shift",
    "StartTime": "08:00",
    "EndTime": "16:00"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts/<shift-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Shifts/<shift-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Schedules

```bash
# List
absuite hrms list schedules --TenantId $TENANT_ID

# Count
absuite hrms count schedules --TenantId $TENANT_ID

# Get by ID
absuite hrms get schedule-by-id --TenantId $TENANT_ID --ScheduleId <schedule-guid>

# Create
absuite hrms create schedule --TenantId $TENANT_ID --ScheduleCreateDto '{
  "EmployeeId": "<employee-guid>",
  "ShiftId": "<shift-guid>",
  "Date": "2025-02-01"
}'

# Update
absuite hrms update schedule --TenantId $TENANT_ID --ScheduleId <schedule-guid> --ScheduleUpdateDto '{...}'

# Delete
absuite hrms delete schedule --TenantId $TENANT_ID --ScheduleId <schedule-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules/<schedule-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "EmployeeId": "<employee-guid>",
    "ShiftId": "<shift-guid>",
    "Date": "2025-02-01"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules/<schedule-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/Schedules/<schedule-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Leave Management

### Leave Types

```bash
# List
absuite hrms list leave-types --TenantId $TENANT_ID

# Count
absuite hrms count leave-types --TenantId $TENANT_ID

# Get by ID
absuite hrms get leave-type-by-id --TenantId $TENANT_ID --LeaveTypeId <type-guid>

# Create
absuite hrms create leave-type --TenantId $TENANT_ID --LeaveTypeCreateDto '{
  "Name": "Annual Leave",
  "Description": "Paid annual vacation days"
}'

# Update
absuite hrms update leave-type --TenantId $TENANT_ID --LeaveTypeId <type-guid> --LeaveTypeUpdateDto '{...}'

# Delete
absuite hrms delete leave-type --TenantId $TENANT_ID --LeaveTypeId <type-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Annual Leave",
    "Description": "Paid annual vacation days"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveTypes/<type-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Leave Applications

```bash
# List
absuite hrms list leave-applications --TenantId $TENANT_ID

# Count
absuite hrms count leave-applications --TenantId $TENANT_ID

# Get by ID
absuite hrms get leave-application-by-id --TenantId $TENANT_ID --LeaveApplicationId <application-guid>

# Create
absuite hrms create leave-application --TenantId $TENANT_ID --LeaveApplicationCreateDto '{
  "EmployeeId": "<employee-guid>",
  "LeaveTypeId": "<type-guid>",
  "StartDate": "2025-03-01",
  "EndDate": "2025-03-05"
}'

# Update
absuite hrms update leave-application --TenantId $TENANT_ID --LeaveApplicationId <application-guid> --LeaveApplicationUpdateDto '{...}'

# Delete
absuite hrms delete leave-application --TenantId $TENANT_ID --LeaveApplicationId <application-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications/<application-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "EmployeeId": "<employee-guid>",
    "LeaveTypeId": "<type-guid>",
    "StartDate": "2025-03-01",
    "EndDate": "2025-03-05"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications/<application-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/LeaveApplications/<application-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Time Intervals

```bash
# List
absuite hrms list time-intervals --TenantId $TENANT_ID

# Count
absuite hrms count time-intervals --TenantId $TENANT_ID

# Get by ID
absuite hrms get time-interval-by-id --TenantId $TENANT_ID --TimeIntervalId <interval-guid>

# Create
absuite hrms create time-interval --TenantId $TENANT_ID --TimeIntervalCreateDto '{
  "EmployeeId": "<employee-guid>",
  "StartTime": "2025-02-01T09:00:00Z",
  "EndTime": "2025-02-01T17:00:00Z"
}'

# Update
absuite hrms update time-interval --TenantId $TENANT_ID --TimeIntervalId <interval-guid> --TimeIntervalUpdateDto '{...}'

# Delete
absuite hrms delete time-interval --TenantId $TENANT_ID --TimeIntervalId <interval-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals/<interval-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "EmployeeId": "<employee-guid>",
    "StartTime": "2025-02-01T09:00:00Z",
    "EndTime": "2025-02-01T17:00:00Z"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals/<interval-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/TimeIntervals/<interval-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Training Programs

### Training Programs

```bash
# List
absuite hrms list training-programs --TenantId $TENANT_ID

# Count
absuite hrms count training-programs --TenantId $TENANT_ID

# Get by ID
absuite hrms get training-program-by-id --TenantId $TENANT_ID --TrainingProgramId <program-guid>

# Create
absuite hrms create training-program --TenantId $TENANT_ID --TrainingProgramCreateDto '{
  "Name": "Onboarding Program",
  "Description": "New employee onboarding and orientation"
}'

# Update
absuite hrms update training-program --TenantId $TENANT_ID --TrainingProgramId <program-guid> --TrainingProgramUpdateDto '{...}'

# Delete
absuite hrms delete training-program --TenantId $TENANT_ID --TrainingProgramId <program-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms/<program-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Onboarding Program",
    "Description": "New employee onboarding and orientation"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms/<program-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingPrograms/<program-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Training Program Courses

```bash
# List
absuite hrms list training-program-courses --TenantId $TENANT_ID

# Count
absuite hrms count training-program-courses --TenantId $TENANT_ID

# Get by ID
absuite hrms get training-program-course-by-id --TenantId $TENANT_ID --TrainingProgramCourseId <course-guid>

# Create
absuite hrms create training-program-course --TenantId $TENANT_ID --TrainingProgramCourseCreateDto '{
  "TrainingProgramId": "<program-guid>",
  "Name": "Company Policies",
  "Description": "Overview of company policies and procedures"
}'

# Update
absuite hrms update training-program-course --TenantId $TENANT_ID --TrainingProgramCourseId <course-guid> --TrainingProgramCourseUpdateDto '{...}'

# Delete
absuite hrms delete training-program-course --TenantId $TENANT_ID --TrainingProgramCourseId <course-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses/<course-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "TrainingProgramId": "<program-guid>",
    "Name": "Company Policies",
    "Description": "Overview of company policies and procedures"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses/<course-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramCourses/<course-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Training Program Events

```bash
# List
absuite hrms list training-program-events --TenantId $TENANT_ID

# Count
absuite hrms count training-program-events --TenantId $TENANT_ID

# Get by ID
absuite hrms get training-program-event-by-id --TenantId $TENANT_ID --TrainingProgramEventId <event-guid>

# Create
absuite hrms create training-program-event --TenantId $TENANT_ID --TrainingProgramEventCreateDto '{
  "TrainingProgramId": "<program-guid>",
  "Name": "Q1 Training Session",
  "Date": "2025-03-15"
}'

# Update
absuite hrms update training-program-event --TenantId $TENANT_ID --TrainingProgramEventId <event-guid> --TrainingProgramEventUpdateDto '{...}'

# Delete
absuite hrms delete training-program-event --TenantId $TENANT_ID --TrainingProgramEventId <event-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents/<event-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "TrainingProgramId": "<program-guid>",
    "Name": "Q1 Training Session",
    "Date": "2025-03-15"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents/<event-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/TrainingProgramEvents/<event-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Performance Appraisals

### Appraisal Workflows

```bash
# List
absuite hrms list appraisal-workflows --TenantId $TENANT_ID

# Count
absuite hrms count appraisal-workflows --TenantId $TENANT_ID

# Get by ID
absuite hrms get appraisal-workflow-by-id --TenantId $TENANT_ID --AppraisalWorkflowId <workflow-guid>

# Create
absuite hrms create appraisal-workflow --TenantId $TENANT_ID --AppraisalWorkflowCreateDto '{
  "Name": "Annual Performance Review",
  "Description": "Standard annual review process"
}'

# Update
absuite hrms update appraisal-workflow --TenantId $TENANT_ID --AppraisalWorkflowId <workflow-guid> --AppraisalWorkflowUpdateDto '{...}'

# Delete
absuite hrms delete appraisal-workflow --TenantId $TENANT_ID --AppraisalWorkflowId <workflow-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows/<workflow-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Annual Performance Review",
    "Description": "Standard annual review process"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows/<workflow-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalWorkflows/<workflow-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Appraisal Stages

```bash
# List
absuite hrms list appraisal-stages --TenantId $TENANT_ID

# Count
absuite hrms count appraisal-stages --TenantId $TENANT_ID

# Get by ID
absuite hrms get appraisal-stage-by-id --TenantId $TENANT_ID --AppraisalStageId <stage-guid>

# Create
absuite hrms create appraisal-stage --TenantId $TENANT_ID --AppraisalStageCreateDto '{
  "AppraisalWorkflowId": "<workflow-guid>",
  "Name": "Self Assessment",
  "Order": 1
}'

# Update
absuite hrms update appraisal-stage --TenantId $TENANT_ID --AppraisalStageId <stage-guid> --AppraisalStageUpdateDto '{...}'

# Delete
absuite hrms delete appraisal-stage --TenantId $TENANT_ID --AppraisalStageId <stage-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages/<stage-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "AppraisalWorkflowId": "<workflow-guid>",
    "Name": "Self Assessment",
    "Order": 1
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages/<stage-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/AppraisalStages/<stage-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Employee Appraisal Sessions

```bash
# List
absuite hrms list employee-appraisal-sessions --TenantId $TENANT_ID

# Count
absuite hrms count employee-appraisal-sessions --TenantId $TENANT_ID

# Get by ID
absuite hrms get employee-appraisal-session-by-id --TenantId $TENANT_ID --EmployeeAppraisalSessionId <session-guid>

# Create
absuite hrms create employee-appraisal-session --TenantId $TENANT_ID --EmployeeAppraisalSessionCreateDto '{
  "EmployeeId": "<employee-guid>",
  "AppraisalWorkflowId": "<workflow-guid>",
  "StartDate": "2025-01-15"
}'

# Update
absuite hrms update employee-appraisal-session --TenantId $TENANT_ID --EmployeeAppraisalSessionId <session-guid> --EmployeeAppraisalSessionUpdateDto '{...}'

# Delete
absuite hrms delete employee-appraisal-session --TenantId $TENANT_ID --EmployeeAppraisalSessionId <session-guid>
```

**REST API equivalent:**
```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions/<session-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create
curl -X POST "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "EmployeeId": "<employee-guid>",
    "AppraisalWorkflowId": "<workflow-guid>",
    "StartDate": "2025-01-15"
  }'

# Update
curl -X PUT "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions/<session-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/HrmsService/EmployeeAppraisalSessions/<session-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List employees | `absuite hrms list employees --TenantId <guid>` |
| Create employee | `absuite hrms create employee --TenantId <guid> --EmployeeCreateDto '{...}'` |
| List employee types | `absuite hrms list employee-types --TenantId <guid>` |
| Create employee type | `absuite hrms create employee-type --TenantId <guid> --EmployeeTypeCreateDto '{...}'` |
| List employers | `absuite hrms list employers --TenantId <guid>` |
| Create employer | `absuite hrms create employer --TenantId <guid> --EmployerCreateDto '{...}'` |
| List gigs | `absuite hrms list gigs --TenantId <guid>` |
| Create gig | `absuite hrms create gig --TenantId <guid> --GigCreateDto '{...}'` |
| List job offers | `absuite hrms list job-offers --TenantId <guid>` |
| Create job offer | `absuite hrms create job-offer --TenantId <guid> --JobOfferCreateDto '{...}'` |
| List job titles | `absuite hrms list job-titles --TenantId <guid>` |
| Create job title | `absuite hrms create job-title --TenantId <guid> --JobTitleCreateDto '{...}'` |
| List salaries | `absuite hrms list salaries --TenantId <guid>` |
| Create salary | `absuite hrms create salary --TenantId <guid> --SalaryCreateDto '{...}'` |
| List payrolls | `absuite hrms list payrolls --TenantId <guid>` |
| Create payroll | `absuite hrms create payroll --TenantId <guid> --PayrollCreateDto '{...}'` |
| List payroll periods | `absuite hrms list payroll-periods --TenantId <guid>` |
| Create payroll period | `absuite hrms create payroll-period --TenantId <guid> --PayrollPeriodCreateDto '{...}'` |
| List shifts | `absuite hrms list shifts --TenantId <guid>` |
| Create shift | `absuite hrms create shift --TenantId <guid> --ShiftCreateDto '{...}'` |
| List schedules | `absuite hrms list schedules --TenantId <guid>` |
| Create schedule | `absuite hrms create schedule --TenantId <guid> --ScheduleCreateDto '{...}'` |
| List leave types | `absuite hrms list leave-types --TenantId <guid>` |
| Create leave type | `absuite hrms create leave-type --TenantId <guid> --LeaveTypeCreateDto '{...}'` |
| List leave applications | `absuite hrms list leave-applications --TenantId <guid>` |
| Create leave application | `absuite hrms create leave-application --TenantId <guid> --LeaveApplicationCreateDto '{...}'` |
| List time intervals | `absuite hrms list time-intervals --TenantId <guid>` |
| Create time interval | `absuite hrms create time-interval --TenantId <guid> --TimeIntervalCreateDto '{...}'` |
| List training programs | `absuite hrms list training-programs --TenantId <guid>` |
| Create training program | `absuite hrms create training-program --TenantId <guid> --TrainingProgramCreateDto '{...}'` |
| List training courses | `absuite hrms list training-program-courses --TenantId <guid>` |
| Create training course | `absuite hrms create training-program-course --TenantId <guid> --TrainingProgramCourseCreateDto '{...}'` |
| List training events | `absuite hrms list training-program-events --TenantId <guid>` |
| Create training event | `absuite hrms create training-program-event --TenantId <guid> --TrainingProgramEventCreateDto '{...}'` |
| List appraisal workflows | `absuite hrms list appraisal-workflows --TenantId <guid>` |
| Create appraisal workflow | `absuite hrms create appraisal-workflow --TenantId <guid> --AppraisalWorkflowCreateDto '{...}'` |
| List appraisal stages | `absuite hrms list appraisal-stages --TenantId <guid>` |
| Create appraisal stage | `absuite hrms create appraisal-stage --TenantId <guid> --AppraisalStageCreateDto '{...}'` |
| List appraisal sessions | `absuite hrms list employee-appraisal-sessions --TenantId <guid>` |
| Create appraisal session | `absuite hrms create employee-appraisal-session --TenantId <guid> --EmployeeAppraisalSessionCreateDto '{...}'` |

## API Endpoints Quick Reference

All paths are relative to `/api/v2/HrmsService/`.

| Resource | List | Get by ID | Create | Update | Delete | Count |
|---|---|---|---|---|---|---|
| Employees | `GET /Employees` | `GET /Employees/:id` | `POST /Employees` | `PUT /Employees/:id` | `DELETE /Employees/:id` | `GET /Employees/Count` |
| EmployeeTypes | `GET /EmployeeTypes` | `GET /EmployeeTypes/:id` | `POST /EmployeeTypes` | `PUT /EmployeeTypes/:id` | `DELETE /EmployeeTypes/:id` | `GET /EmployeeTypes/Count` |
| Employers | `GET /Employers` | `GET /Employers/:id` | `POST /Employers` | `PUT /Employers/:id` | `DELETE /Employers/:id` | `GET /Employers/Count` |
| Gigs | `GET /Gigs` | `GET /Gigs/:id` | `POST /Gigs` | `PUT /Gigs/:id` | `DELETE /Gigs/:id` | `GET /Gigs/Count` |
| JobOffers | `GET /JobOffers` | `GET /JobOffers/:id` | `POST /JobOffers` | `PUT /JobOffers/:id` | `DELETE /JobOffers/:id` | `GET /JobOffers/Count` |
| JobTitles | `GET /JobTitles` | `GET /JobTitles/:id` | `POST /JobTitles` | `PUT /JobTitles/:id` | `DELETE /JobTitles/:id` | `GET /JobTitles/Count` |
| Salaries | `GET /Salaries` | `GET /Salaries/:id` | `POST /Salaries` | `PUT /Salaries/:id` | `DELETE /Salaries/:id` | `GET /Salaries/Count` |
| Payrolls | `GET /Payrolls` | `GET /Payrolls/:id` | `POST /Payrolls` | `PUT /Payrolls/:id` | `DELETE /Payrolls/:id` | `GET /Payrolls/Count` |
| PayrollPeriods | `GET /PayrollPeriods` | `GET /PayrollPeriods/:id` | `POST /PayrollPeriods` | `PUT /PayrollPeriods/:id` | `DELETE /PayrollPeriods/:id` | `GET /PayrollPeriods/Count` |
| Shifts | `GET /Shifts` | `GET /Shifts/:id` | `POST /Shifts` | `PUT /Shifts/:id` | `DELETE /Shifts/:id` | `GET /Shifts/Count` |
| Schedules | `GET /Schedules` | `GET /Schedules/:id` | `POST /Schedules` | `PUT /Schedules/:id` | `DELETE /Schedules/:id` | `GET /Schedules/Count` |
| LeaveTypes | `GET /LeaveTypes` | `GET /LeaveTypes/:id` | `POST /LeaveTypes` | `PUT /LeaveTypes/:id` | `DELETE /LeaveTypes/:id` | `GET /LeaveTypes/Count` |
| LeaveApplications | `GET /LeaveApplications` | `GET /LeaveApplications/:id` | `POST /LeaveApplications` | `PUT /LeaveApplications/:id` | `DELETE /LeaveApplications/:id` | `GET /LeaveApplications/Count` |
| TimeIntervals | `GET /TimeIntervals` | `GET /TimeIntervals/:id` | `POST /TimeIntervals` | `PUT /TimeIntervals/:id` | `DELETE /TimeIntervals/:id` | `GET /TimeIntervals/Count` |
| TrainingPrograms | `GET /TrainingPrograms` | `GET /TrainingPrograms/:id` | `POST /TrainingPrograms` | `PUT /TrainingPrograms/:id` | `DELETE /TrainingPrograms/:id` | `GET /TrainingPrograms/Count` |
| TrainingProgramCourses | `GET /TrainingProgramCourses` | `GET /TrainingProgramCourses/:id` | `POST /TrainingProgramCourses` | `PUT /TrainingProgramCourses/:id` | `DELETE /TrainingProgramCourses/:id` | `GET /TrainingProgramCourses/Count` |
| TrainingProgramEvents | `GET /TrainingProgramEvents` | `GET /TrainingProgramEvents/:id` | `POST /TrainingProgramEvents` | `PUT /TrainingProgramEvents/:id` | `DELETE /TrainingProgramEvents/:id` | `GET /TrainingProgramEvents/Count` |
| AppraisalWorkflows | `GET /AppraisalWorkflows` | `GET /AppraisalWorkflows/:id` | `POST /AppraisalWorkflows` | `PUT /AppraisalWorkflows/:id` | `DELETE /AppraisalWorkflows/:id` | `GET /AppraisalWorkflows/Count` |
| AppraisalStages | `GET /AppraisalStages` | `GET /AppraisalStages/:id` | `POST /AppraisalStages` | `PUT /AppraisalStages/:id` | `DELETE /AppraisalStages/:id` | `GET /AppraisalStages/Count` |
| EmployeeAppraisalSessions | `GET /EmployeeAppraisalSessions` | `GET /EmployeeAppraisalSessions/:id` | `POST /EmployeeAppraisalSessions` | `PUT /EmployeeAppraisalSessions/:id` | `DELETE /EmployeeAppraisalSessions/:id` | `GET /EmployeeAppraisalSessions/Count` |

## Critical Rules

- **Authenticate first.** Use `absuite login` before any HRMS operation.
- **Always provide a tenant context.**
- **Create employers first** before creating employees that reference them.
- **Use `--help`** on any command for full DTO schemas.
