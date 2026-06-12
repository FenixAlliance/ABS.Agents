---
name: absuite-hrms-cli
description: >
  Manage human resources in the Alliance Business Suite (ABS) using the `absuite`
  CLI. Covers employees, employers, employee types, job titles, salaries, payrolls,
  payroll periods, gigs, job offers, shifts, schedules, time intervals, leave
  management, training programs, and performance appraisals via
  list/count/get/create/update/delete commands. Requires an authenticated CLI
  session (see absuite-login-cli). For atomic PATCH updates or raw HTTP, use the
  absuite-hrms (REST) skill.
---

# Alliance Business Suite — HRMS Skill (CLI)

Manage human resources through the `absuite` CLI's `hrms` service. Every command is tenant-scoped and requires an authenticated session. This skill covers list / count / search / get / create / update / delete plus the related actions.

> The `absuite` CLI does **not** support PATCH (JSON Patch) operations. For atomic partial updates or raw HTTP, use the `absuite-hrms` (REST) skill. For general CLI conventions across all ABS services, see `absuite-cli`.

## Prerequisites

1. **Authenticate first**: run `absuite login` (see the `absuite-login-cli` skill). Every HRMS command needs a valid session.
2. **Set your tenant**: either set a default once —
   ```bash
   absuite config set --tenant-id <tenant-guid>
   ```
   — or pass `--TenantId <tenant-guid>` on every command. Examples below use `$TENANT_ID`.
3. **Discover commands**: list everything the service exposes, then drill into one command's parameters:
   ```bash
   absuite hrms list-commands
   absuite hrms create employee --help
   ```

## Command structure

```
absuite hrms <verb> <entity> --Param value
```

- The **service token** is `hrms` (the `HrmsService` API).
- Common **verbs**: `list`, `count`, `search`, `get`, `create`, `update`, `delete`.
- The canonical **function-name form** also works and maps 1:1 to the underlying PowerShell SDK cmdlets. The SDK uses PowerShell-approved verbs, so the function names are:
  - Create → `New-<Entity>Async`
  - List → `Get-<Entity>sAsync`
  - Get by id → `Get-<Entity>ByIdAsync`
  - Count → `Get-<Entity>sCountAsync`
  - Update → `Update-<Entity>Async`
  - Delete → `Invoke-Delete<Entity>Async`

  e.g. `absuite hrms Get-EmployeesAsync --TenantId $TENANT_ID`.
- **DTO parameters take the full DTO type name** as the flag, passed as a single-quoted JSON string with the **same camelCase field names** as the API — e.g. `--EmployeeProfileCreateDto '{...}'`, `--SalaryCreateDto '{...}'`. (The create/update flag is *not* `--EmployeeCreateDto`; it is `--EmployeeProfileCreateDto`.)
- Always include `--TenantId $TENANT_ID` (or set a default with `absuite config set --tenant-id`).

> Use `--help` on any command for the authoritative parameter and DTO field list.

## Employees

```bash
# List
absuite hrms list employees --TenantId $TENANT_ID

# Count
absuite hrms count employees --TenantId $TENANT_ID

# Get by ID
absuite hrms get employee-by-id --TenantId $TENANT_ID --EmployeeId <employee-guid>

# Create  (flag: --EmployeeProfileCreateDto)
absuite hrms create employee --TenantId $TENANT_ID --EmployeeProfileCreateDto '{
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

# Update  (flag: --EmployeeProfileUpdateDto)
absuite hrms update employee --TenantId $TENANT_ID --EmployeeId <employee-guid> --EmployeeProfileUpdateDto '{
  "grossPay": 105000.00,
  "employeeTypeId": "<employee-type-guid>"
}'

# Delete
absuite hrms delete employee --TenantId $TENANT_ID --EmployeeId <employee-guid>
```

Create fields (`EmployeeProfileCreateDto`): `type`, `contactId`, `about`, `avatarUrl`, `data`…`data9` + `*Label`, `grossPay`, `netSalary`, `payrollCurrency`, `maxWorkHoursPerDay`, `jobTitleId`, `employeeTypeId`.

## Employee Types

```bash
absuite hrms list employee-types --TenantId $TENANT_ID
absuite hrms count employee-types --TenantId $TENANT_ID
absuite hrms get employee-type-by-id --TenantId $TENANT_ID --EmployeeTypeId <type-guid>

absuite hrms create employee-type --TenantId $TENANT_ID --EmployeeTypeCreateDto '{
  "name": "Full-Time",
  "description": "Standard full-time employment"
}'

absuite hrms update employee-type --TenantId $TENANT_ID --EmployeeTypeId <type-guid> --EmployeeTypeUpdateDto '{
  "description": "Updated description"
}'

absuite hrms delete employee-type --TenantId $TENANT_ID --EmployeeTypeId <type-guid>
```

Fields (`EmployeeTypeCreateDto` / `EmployeeTypeUpdateDto`): `name`, `description`.

## Employers

```bash
absuite hrms list employers --TenantId $TENANT_ID
absuite hrms count employers --TenantId $TENANT_ID
absuite hrms get employer-by-id --TenantId $TENANT_ID --EmployerId <employer-guid>

absuite hrms create employer --TenantId $TENANT_ID --EmployerProfileCreateDto '{
  "contactId": "<contact-guid>",
  "type": "Organization",
  "about": "Technology company",
  "avatarUrl": "https://example.com/logo.png"
}'

absuite hrms update employer --TenantId $TENANT_ID --EmployerId <employer-guid> --EmployerProfileUpdateDto '{
  "about": "Updated description"
}'

absuite hrms delete employer --TenantId $TENANT_ID --EmployerId <employer-guid>
```

Fields (`EmployerProfileCreateDto` / `EmployerProfileUpdateDto`): `type`, `contactId`, `about`, `avatarUrl`, `data`…`data9` + `*Label`.

## Gigs

Short-term or freelance work assignments.

```bash
absuite hrms list gigs --TenantId $TENANT_ID
absuite hrms count gigs --TenantId $TENANT_ID
absuite hrms get gig-by-id --TenantId $TENANT_ID --GigId <gig-guid>

absuite hrms create gig --TenantId $TENANT_ID --GigCreateDto '{
  "title": "Frontend Development Sprint",
  "description": "Build checkout flow components",
  "remote": true,
  "type": "Project",
  "expectedDeliveryDate": "2025-04-30",
  "employerProfileId": "<employer-guid>",
  "minBudget": 2000.00,
  "maxBudget": 5000.00,
  "currencyId": "USD",
  "location": "Remote"
}'

absuite hrms update gig --TenantId $TENANT_ID --GigId <gig-guid> --GigUpdateDto '{
  "maxBudget": 6000.00,
  "currencyId": "USD"
}'

absuite hrms delete gig --TenantId $TENANT_ID --GigId <gig-guid>
```

Fields (`GigCreateDto` / `GigUpdateDto`): `remote`, `type`, `title`, `description`, `expectedDeliveryDate`, `employerProfileId`, `minBudget`, `maxBudget`, `currencyId`, `countryId`, `countryStateId`, `cityId`, `location`, `externalUrl`, `data`…`data9` + `*Label`.

## Job Offers

```bash
absuite hrms list job-offers --TenantId $TENANT_ID
absuite hrms count job-offers --TenantId $TENANT_ID
absuite hrms get job-offer-by-id --TenantId $TENANT_ID --JobOfferId <offer-guid>

absuite hrms create job-offer --TenantId $TENANT_ID --JobOfferCreateDto '{
  "title": "Senior .NET Developer",
  "description": "Remote position, full-time",
  "remote": true,
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

absuite hrms update job-offer --TenantId $TENANT_ID --JobOfferId <offer-guid> --JobOfferUpdateDto '{
  "maxSalaryAmount": 130000.00,
  "currencyId": "USD"
}'

absuite hrms delete job-offer --TenantId $TENANT_ID --JobOfferId <offer-guid>
```

Fields (`JobOfferCreateDto` / `JobOfferUpdateDto`): `remote`, `expectedHireDate`, `title`, `description`, `technicalSkills`, `nonTechnicalSkills`, `certifications`, `projectExperience`, `technologies`, `benefits`, `isOfficialJobOffer`, `isRemoteJobOffer`, `isMidTimeJobOffer`, `isUndergraduateOption`, `minOverallExperienceYears`, `availiablePositionsCount` (sic), `minSalaryAmount`, `maxSalaryAmount`, `currencyId`, `jobFieldId`, `employerProfileId`, `countryId`, `countryStateId`, `cityId`, `imageUrl`, `location`, `externalUrl`, `data`…`data9` + `*Label`.

## Compensation

### Job Titles

```bash
absuite hrms list job-titles --TenantId $TENANT_ID
absuite hrms count job-titles --TenantId $TENANT_ID
absuite hrms get job-title-by-id --TenantId $TENANT_ID --JobTitleId <title-guid>

absuite hrms create job-title --TenantId $TENANT_ID --JobTitleCreateDto '{
  "title": "Senior Software Engineer",
  "description": "Senior-level engineering role",
  "grossPay": 120000.00,
  "netSalary": 90000.00,
  "currencyId": "USD"
}'

absuite hrms update job-title --TenantId $TENANT_ID --JobTitleId <title-guid> --JobTitleUpdateDto '{
  "grossPay": 140000.00,
  "currencyId": "USD"
}'

absuite hrms delete job-title --TenantId $TENANT_ID --JobTitleId <title-guid>
```

Fields (`JobTitleCreateDto` / `JobTitleUpdateDto`): `title`, `description`, `grossPay`, `netSalary`, `currencyId`, `countryId`, `countryStateId`, `cityId`.

### Salaries

```bash
absuite hrms list salaries --TenantId $TENANT_ID
absuite hrms count salaries --TenantId $TENANT_ID
absuite hrms get salary-by-id --TenantId $TENANT_ID --SalaryId <salary-guid>

# Create  (amount, currencyId, employeeProfileId all required)
absuite hrms create salary --TenantId $TENANT_ID --SalaryCreateDto '{
  "amount": 85000.00,
  "currencyId": "USD",
  "employeeProfileId": "<employee-guid>"
}'

absuite hrms update salary --TenantId $TENANT_ID --SalaryId <salary-guid> --SalaryUpdateDto '{
  "amount": 90000.00,
  "currencyId": "USD",
  "employeeProfileId": "<employee-guid>"
}'

absuite hrms delete salary --TenantId $TENANT_ID --SalaryId <salary-guid>
```

Fields (`SalaryCreateDto`): `amount` (required), `currencyId` (required), `employeeProfileId` (required). `SalaryUpdateDto`: same three fields.

## Payrolls & Payroll Periods

### Payrolls

```bash
absuite hrms list payrolls --TenantId $TENANT_ID
absuite hrms count payrolls --TenantId $TENANT_ID
absuite hrms get payroll-by-id --TenantId $TENANT_ID --PayrollId <payroll-guid>

# Create  (payrollPeriodId required)
absuite hrms create payroll --TenantId $TENANT_ID --PayrollCreateDto '{
  "payrollPeriodId": "<period-guid>"
}'

absuite hrms update payroll --TenantId $TENANT_ID --PayrollId <payroll-guid> --PayrollUpdateDto '{
  "payrollPeriodId": "<period-guid>"
}'

absuite hrms delete payroll --TenantId $TENANT_ID --PayrollId <payroll-guid>
```

Fields (`PayrollCreateDto`): `payrollPeriodId` (required). `PayrollUpdateDto`: `payrollPeriodId`.

### Payroll Periods

The delete/get/update path parameter is `--PeriodId`.

```bash
absuite hrms list payroll-periods --TenantId $TENANT_ID
absuite hrms count payroll-periods --TenantId $TENANT_ID
absuite hrms get payroll-period-by-id --TenantId $TENANT_ID --PeriodId <period-guid>

# Create  (title, startDate, endDate required)
absuite hrms create payroll-period --TenantId $TENANT_ID --PayrollPeriodCreateDto '{
  "title": "January 2025",
  "description": "Monthly payroll window",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}'

absuite hrms update payroll-period --TenantId $TENANT_ID --PeriodId <period-guid> --PayrollPeriodUpdateDto '{
  "title": "January 2025",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}'

absuite hrms delete payroll-period --TenantId $TENANT_ID --PeriodId <period-guid>
```

Fields (`PayrollPeriodCreateDto`): `title` (required), `description`, `startDate` (required), `endDate` (required). `PayrollPeriodUpdateDto`: `title`, `description`, `startDate`, `endDate`.

## Shifts & Schedules

### Shifts

```bash
absuite hrms list shifts --TenantId $TENANT_ID
absuite hrms count shifts --TenantId $TENANT_ID
absuite hrms get shift-by-id --TenantId $TENANT_ID --ShiftId <shift-guid>

# Create  (title, start, end, employeeProfileId required)
absuite hrms create shift --TenantId $TENANT_ID --ShiftCreateDto '{
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

absuite hrms update shift --TenantId $TENANT_ID --ShiftId <shift-guid> --ShiftUpdateDto '{
  "start": "2025-02-01T07:00:00Z",
  "end": "2025-02-01T15:00:00Z"
}'

absuite hrms delete shift --TenantId $TENANT_ID --ShiftId <shift-guid>
```

Fields (`ShiftCreateDto`): `title` (required), `description`, `start` (required), `end` (required), `isBreak`, `occustOnMonday`…`occustOnSunday` (sic), `repeatEvery`, `repetitionCriteria`, `recurrenceStart`, `recurrenceEnd`, `dayOfTheWeek`, `scheduleId`, `parentTimeIntervalId`, `employeeProfileId` (required).

- `repetitionCriteria` enum: `NotRepeat` | `WorkWeek` | `Day` | `Month` | `Year`
- `dayOfTheWeek` enum: `All` | `Sunday` | `Monday` | `Tuesday` | `Wednesday` | `Thursday` | `Friday` | `Saturday`

### Schedules

```bash
absuite hrms list schedules --TenantId $TENANT_ID
absuite hrms count schedules --TenantId $TENANT_ID
absuite hrms get schedule-by-id --TenantId $TENANT_ID --ScheduleId <schedule-guid>

# Create  (name required)
absuite hrms create schedule --TenantId $TENANT_ID --ScheduleCreateDto '{
  "name": "Standard Week",
  "description": "Mon-Fri 9 to 5",
  "monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true,
  "saturday": false, "sunday": false,
  "start": "09:00",
  "end": "17:00",
  "timezoneId": "<timezone-id>"
}'

absuite hrms update schedule --TenantId $TENANT_ID --ScheduleId <schedule-guid> --ScheduleUpdateDto '{
  "saturday": true
}'

absuite hrms delete schedule --TenantId $TENANT_ID --ScheduleId <schedule-guid>
```

Fields (`ScheduleCreateDto` / `ScheduleUpdateDto`): `name` (required on create), `description`, `disabled`, `sunday`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `uniqueInterval`, `is24x7Interval`, `start`, `end`, `timezoneId`, `fiscalYearId`, `holidayScheduleId`.

## Time Intervals

```bash
absuite hrms list time-intervals --TenantId $TENANT_ID
absuite hrms count time-intervals --TenantId $TENANT_ID
absuite hrms get time-interval-by-id --TenantId $TENANT_ID --TimeIntervalId <interval-guid>

# Create  (title, scheduleId required)
absuite hrms create time-interval --TenantId $TENANT_ID --TimeIntervalCreateDto '{
  "title": "Lunch Break",
  "description": "Midday break",
  "isBreak": true,
  "start": "12:00",
  "end": "13:00",
  "repeatEvery": 1,
  "scheduleId": "<schedule-guid>"
}'

absuite hrms update time-interval --TenantId $TENANT_ID --TimeIntervalId <interval-guid> --TimeIntervalUpdateDto '{
  "start": "12:30",
  "end": "13:30"
}'

absuite hrms delete time-interval --TenantId $TENANT_ID --TimeIntervalId <interval-guid>
```

Fields (`TimeIntervalCreateDto`): `title` (required), `description`, `isBreak`, `occustOnMonday`…`occustOnSunday` (sic), `start`, `end`, `repeatEvery`, `scheduleId` (required), `parentTimeIntervalId`. `TimeIntervalUpdateDto`: same fields **without** `scheduleId`.

## Leave Management

### Leave Types

```bash
absuite hrms list leave-types --TenantId $TENANT_ID
absuite hrms count leave-types --TenantId $TENANT_ID
absuite hrms get leave-type-by-id --TenantId $TENANT_ID --LeaveTypeId <type-guid>

# Create  (title required)
absuite hrms create leave-type --TenantId $TENANT_ID --LeaveTypeCreateDto '{
  "title": "Annual Leave",
  "description": "Paid annual vacation days"
}'

absuite hrms update leave-type --TenantId $TENANT_ID --LeaveTypeId <type-guid> --LeaveTypeUpdateDto '{
  "description": "Updated"
}'

absuite hrms delete leave-type --TenantId $TENANT_ID --LeaveTypeId <type-guid>
```

Fields (`LeaveTypeCreateDto`): `title` (required), `description`. `LeaveTypeUpdateDto`: `title`, `description`.

### Leave Applications

```bash
absuite hrms list leave-applications --TenantId $TENANT_ID
absuite hrms count leave-applications --TenantId $TENANT_ID
absuite hrms get leave-application-by-id --TenantId $TENANT_ID --LeaveApplicationId <application-guid>

# Create  (leaveTypeId, employeeProfileId required)
absuite hrms create leave-application --TenantId $TENANT_ID --LeaveApplicationCreateDto '{
  "justification": "Family vacation",
  "approved": false,
  "onReview": true,
  "leaveTypeId": "<type-guid>",
  "employeeProfileId": "<employee-guid>"
}'

absuite hrms update leave-application --TenantId $TENANT_ID --LeaveApplicationId <application-guid> --LeaveApplicationUpdateDto '{
  "approved": true,
  "onReview": false
}'

absuite hrms delete leave-application --TenantId $TENANT_ID --LeaveApplicationId <application-guid>
```

Fields (`LeaveApplicationCreateDto`): `justification`, `approved`, `onReview`, `leaveTypeId` (required), `employeeProfileId` (required). `LeaveApplicationUpdateDto`: `justification`, `approved`, `onReview`, `leaveTypeId`, `employeeProfileId`.

## Training Programs

### Training Programs

```bash
absuite hrms list training-programs --TenantId $TENANT_ID
absuite hrms count training-programs --TenantId $TENANT_ID
absuite hrms get training-program-by-id --TenantId $TENANT_ID --ProgramId <program-guid>

# Create  (title required)
absuite hrms create training-program --TenantId $TENANT_ID --TrainingProgramCreateDto '{
  "title": "Onboarding Program",
  "description": "New employee onboarding and orientation"
}'

absuite hrms update training-program --TenantId $TENANT_ID --ProgramId <program-guid> --TrainingProgramUpdateDto '{
  "description": "Updated"
}'

absuite hrms delete training-program --TenantId $TENANT_ID --ProgramId <program-guid>
```

Fields (`TrainingProgramCreateDto`): `title` (required), `description`. `TrainingProgramUpdateDto`: `title`, `description`. Path parameter is `--ProgramId`.

### Training Program Courses

Links a course to a program. The get/update/delete path parameter is `--CourseId` (the join-record id).

```bash
absuite hrms list training-program-courses --TenantId $TENANT_ID
absuite hrms count training-program-courses --TenantId $TENANT_ID
absuite hrms get training-program-course-by-id --TenantId $TENANT_ID --CourseId <course-guid>

# Create  (trainingProgramId, courseId required)
absuite hrms create training-program-course --TenantId $TENANT_ID --TrainingProgramCourseCreateDto '{
  "trainingProgramId": "<program-guid>",
  "courseId": "<course-guid>"
}'

absuite hrms update training-program-course --TenantId $TENANT_ID --CourseId <course-guid> --TrainingProgramCourseUpdateDto '{
  "courseId": "<course-guid>"
}'

absuite hrms delete training-program-course --TenantId $TENANT_ID --CourseId <course-guid>
```

Fields (`TrainingProgramCourseCreateDto`): `trainingProgramId` (required), `courseId` (required). `TrainingProgramCourseUpdateDto`: `trainingProgramId`, `courseId`.

### Training Program Events

The get/update/delete path parameter is `--EventId`.

```bash
absuite hrms list training-program-events --TenantId $TENANT_ID
absuite hrms count training-program-events --TenantId $TENANT_ID
absuite hrms get training-program-event-by-id --TenantId $TENANT_ID --EventId <event-guid>

# Create  (title, start, end, trainingProgramId required)
absuite hrms create training-program-event --TenantId $TENANT_ID --TrainingProgramEventCreateDto '{
  "title": "Q1 Training Session",
  "description": "Quarterly skills workshop",
  "start": "2025-03-15T09:00:00Z",
  "end": "2025-03-15T12:00:00Z",
  "repetitionCriteria": "Month",
  "dayOfTheWeek": "Saturday",
  "trainingProgramId": "<program-guid>"
}'

absuite hrms update training-program-event --TenantId $TENANT_ID --EventId <event-guid> --TrainingProgramEventUpdateDto '{
  "start": "2025-03-15T10:00:00Z",
  "end": "2025-03-15T13:00:00Z"
}'

absuite hrms delete training-program-event --TenantId $TENANT_ID --EventId <event-guid>
```

Fields (`TrainingProgramEventCreateDto`): `title` (required), `description`, `start` (required), `end` (required), `isBreak`, `occustOnMonday`…`occustOnSunday` (sic), `repeatEvery`, `repetitionCriteria`, `recurrenceStart`, `recurrenceEnd`, `dayOfTheWeek`, `scheduleId`, `parentTimeIntervalId`, `trainingProgramId` (required). Same enums as Shifts.

## Performance Appraisals

### Appraisal Workflows

The get/update/delete path parameter is `--WorkflowId`.

```bash
absuite hrms list appraisal-workflows --TenantId $TENANT_ID
absuite hrms count appraisal-workflows --TenantId $TENANT_ID
absuite hrms get appraisal-workflow-by-id --TenantId $TENANT_ID --WorkflowId <workflow-guid>

# Create  (name required)
absuite hrms create appraisal-workflow --TenantId $TENANT_ID --AppraisalWorkflowCreateDto '{
  "name": "Annual Performance Review",
  "description": "Standard annual review process"
}'

absuite hrms update appraisal-workflow --TenantId $TENANT_ID --WorkflowId <workflow-guid> --AppraisalWorkflowUpdateDto '{
  "description": "Updated"
}'

absuite hrms delete appraisal-workflow --TenantId $TENANT_ID --WorkflowId <workflow-guid>
```

Fields (`AppraisalWorkflowCreateDto`): `name` (required), `description`. `AppraisalWorkflowUpdateDto`: `name`, `description`.

### Appraisal Stages

The get/update/delete path parameter is `--StageId`.

```bash
absuite hrms list appraisal-stages --TenantId $TENANT_ID
absuite hrms count appraisal-stages --TenantId $TENANT_ID
absuite hrms get appraisal-stage-by-id --TenantId $TENANT_ID --StageId <stage-guid>

# Create  (name, appraisalWorkflowId, stageOrder required)
absuite hrms create appraisal-stage --TenantId $TENANT_ID --AppraisalStageCreateDto '{
  "name": "Self Assessment",
  "description": "Employee completes self-review",
  "appraisalWorkflowId": "<workflow-guid>",
  "stageOrder": 1
}'

absuite hrms update appraisal-stage --TenantId $TENANT_ID --StageId <stage-guid> --AppraisalStageUpdateDto '{
  "stageOrder": 2
}'

absuite hrms delete appraisal-stage --TenantId $TENANT_ID --StageId <stage-guid>
```

Fields (`AppraisalStageCreateDto`): `name` (required), `description`, `appraisalWorkflowId` (required), `stageOrder` (required, integer). `AppraisalStageUpdateDto`: `name`, `description`, `appraisalWorkflowId`, `stageOrder`.

### Employee Appraisal Sessions

The get/update/delete path parameter is `--SessionId`.

```bash
absuite hrms list employee-appraisal-sessions --TenantId $TENANT_ID
absuite hrms count employee-appraisal-sessions --TenantId $TENANT_ID
absuite hrms get employee-appraisal-session-by-id --TenantId $TENANT_ID --SessionId <session-guid>

# Create  (employeeProfileId, appraisalWorkflowId required)
absuite hrms create employee-appraisal-session --TenantId $TENANT_ID --EmployeeAppraisalSessionCreateDto '{
  "employeeProfileId": "<employee-guid>",
  "appraisalWorkflowId": "<workflow-guid>",
  "appraisalStageId": "<stage-guid>"
}'

absuite hrms update employee-appraisal-session --TenantId $TENANT_ID --SessionId <session-guid> --EmployeeAppraisalSessionUpdateDto '{
  "appraisalStageId": "<stage-guid>"
}'

absuite hrms delete employee-appraisal-session --TenantId $TENANT_ID --SessionId <session-guid>
```

Fields (`EmployeeAppraisalSessionCreateDto`): `employeeProfileId` (required), `appraisalWorkflowId` (required), `appraisalStageId`. `EmployeeAppraisalSessionUpdateDto`: `employeeProfileId`, `appraisalWorkflowId`, `appraisalStageId`.

## Example workflow: onboard an employee and run an appraisal

```bash
# 1. Create an employee type and a job title
absuite hrms create employee-type --TenantId $TENANT_ID --EmployeeTypeCreateDto '{ "name": "Full-Time" }'
absuite hrms create job-title --TenantId $TENANT_ID --JobTitleCreateDto '{ "title": "Software Engineer", "grossPay": 95000.00, "netSalary": 72000.00, "currencyId": "USD" }'

# 2. Create the employee profile (use the ids from step 1)
absuite hrms create employee --TenantId $TENANT_ID --EmployeeProfileCreateDto '{ "contactId": "<contact-guid>", "employeeTypeId": "<type-guid>", "jobTitleId": "<title-guid>", "grossPay": 95000.00, "payrollCurrency": "USD" }'

# 3. Record the salary
absuite hrms create salary --TenantId $TENANT_ID --SalaryCreateDto '{ "amount": 95000.00, "currencyId": "USD", "employeeProfileId": "<employee-guid>" }'

# 4. Create an appraisal workflow, its first stage, and a session
absuite hrms create appraisal-workflow --TenantId $TENANT_ID --AppraisalWorkflowCreateDto '{ "name": "Annual Review" }'
absuite hrms create appraisal-stage --TenantId $TENANT_ID --AppraisalStageCreateDto '{ "name": "Self Assessment", "appraisalWorkflowId": "<workflow-guid>", "stageOrder": 1 }'
absuite hrms create employee-appraisal-session --TenantId $TENANT_ID --EmployeeAppraisalSessionCreateDto '{ "employeeProfileId": "<employee-guid>", "appraisalWorkflowId": "<workflow-guid>", "appraisalStageId": "<stage-guid>" }'

# 5. Advance the session to the next stage (CLI update = full PUT; for an atomic single-field change use the REST PATCH in absuite-hrms)
absuite hrms update employee-appraisal-session --TenantId $TENANT_ID --SessionId <session-guid> --EmployeeAppraisalSessionUpdateDto '{ "employeeProfileId": "<employee-guid>", "appraisalWorkflowId": "<workflow-guid>", "appraisalStageId": "<next-stage-guid>" }'
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List employees | `absuite hrms list employees --TenantId <guid>` |
| Count employees | `absuite hrms count employees --TenantId <guid>` |
| Get employee | `absuite hrms get employee-by-id --TenantId <guid> --EmployeeId <guid>` |
| Create employee | `absuite hrms create employee --TenantId <guid> --EmployeeProfileCreateDto '{...}'` |
| Update employee | `absuite hrms update employee --TenantId <guid> --EmployeeId <guid> --EmployeeProfileUpdateDto '{...}'` |
| Delete employee | `absuite hrms delete employee --TenantId <guid> --EmployeeId <guid>` |
| List employee types | `absuite hrms list employee-types --TenantId <guid>` |
| Create employee type | `absuite hrms create employee-type --TenantId <guid> --EmployeeTypeCreateDto '{...}'` |
| List employers | `absuite hrms list employers --TenantId <guid>` |
| Create employer | `absuite hrms create employer --TenantId <guid> --EmployerProfileCreateDto '{...}'` |
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
| List time intervals | `absuite hrms list time-intervals --TenantId <guid>` |
| Create time interval | `absuite hrms create time-interval --TenantId <guid> --TimeIntervalCreateDto '{...}'` |
| List leave types | `absuite hrms list leave-types --TenantId <guid>` |
| Create leave type | `absuite hrms create leave-type --TenantId <guid> --LeaveTypeCreateDto '{...}'` |
| List leave applications | `absuite hrms list leave-applications --TenantId <guid>` |
| Create leave application | `absuite hrms create leave-application --TenantId <guid> --LeaveApplicationCreateDto '{...}'` |
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

## Critical Rules

- **Authenticate first.** Run `absuite login` (see `absuite-login-cli`) before any HRMS command.
- **Always provide a tenant.** Pass `--TenantId <guid>` or set a default with `absuite config set --tenant-id <guid>`.
- **DTO flags use the full DTO type name** (e.g. `--EmployeeProfileCreateDto`, `--SalaryCreateDto`) and take a single-quoted JSON string whose field names match the API (camelCase).
- **Create dependencies first**: an `Employer` before gigs/job-offers; an `EmployeeType` / `JobTitle` before employees; an `AppraisalWorkflow` before its stages and sessions; a `Schedule` before its time intervals.
- **No PATCH in the CLI.** For atomic single-field updates use the REST PATCH endpoints documented in `absuite-hrms`.
- **Use `--help`** on any command for the authoritative DTO schema and parameter list.
