---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-hrms-cli
key: fenixalliance.absuite.hrms-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Hrms area with the absuite CLI: 150 commands (81 read, 69
  write) under `absuite hrms`, each generated from the platform's ServiceClients and checked against
  `absuite commands -o json`. For routes the CLI does not cover, use the absuite-hrms REST skill.
---

# Alliance Business Suite — Hrms Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-hrms` REST skill documents 50 routes; 2 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-hrms` REST skill.

## Commands

150 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Appraisal Stages (`absuite hrms appraisal-stages`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms appraisal-stages list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's appraisal-stages. `GET /api/v2/HrmsService/AppraisalStages` |
| `absuite hrms appraisal-stages count` | Reads |  |  | Count the workspace's appraisal-stages. `GET /api/v2/HrmsService/AppraisalStages/Count` |
| `absuite hrms appraisal-stages get` | Reads | `<id>` | `--columns` | Show one of the workspace's appraisal-stages. `GET /api/v2/HrmsService/AppraisalStages/{stageId}` |
| `absuite hrms appraisal-stages create` | Writes |  | `--name`, `--description`, `--appraisal-workflow-id`, `--stage-order`; `--json` `--file` `--dry-run` | Create a record in the workspace's appraisal-stages. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/AppraisalStages` |
| `absuite hrms appraisal-stages update` | Writes | `<id>` | `--name`, `--description`, `--appraisal-workflow-id`, `--stage-order`; `--json` `--file` `--dry-run` | Change one of the workspace's appraisal-stages: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/AppraisalStages/{stageId}` |
| `absuite hrms appraisal-stages delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's appraisal-stages; it asks first unless --yes. `DELETE /api/v2/HrmsService/AppraisalStages/{stageId}` |

### Appraisal Workflows (`absuite hrms appraisal-workflows`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms appraisal-workflows list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's appraisal-workflows. `GET /api/v2/HrmsService/AppraisalWorkflows` |
| `absuite hrms appraisal-workflows count` | Reads |  |  | Count the workspace's appraisal-workflows. `GET /api/v2/HrmsService/AppraisalWorkflows/Count` |
| `absuite hrms appraisal-workflows get` | Reads | `<id>` | `--columns` | Show one of the workspace's appraisal-workflows. `GET /api/v2/HrmsService/AppraisalWorkflows/{workflowId}` |
| `absuite hrms appraisal-workflows create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's appraisal-workflows. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/AppraisalWorkflows` |
| `absuite hrms appraisal-workflows update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's appraisal-workflows: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/AppraisalWorkflows/{workflowId}` |
| `absuite hrms appraisal-workflows delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's appraisal-workflows; it asks first unless --yes. `DELETE /api/v2/HrmsService/AppraisalWorkflows/{workflowId}` |

### Employee Appraisal Sessions (`absuite hrms employee-appraisal-sessions`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms employee-appraisal-sessions list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's employee-appraisal-sessions. `GET /api/v2/HrmsService/EmployeeAppraisalSessions` |
| `absuite hrms employee-appraisal-sessions count` | Reads |  |  | Count the workspace's employee-appraisal-sessions. `GET /api/v2/HrmsService/EmployeeAppraisalSessions/Count` |
| `absuite hrms employee-appraisal-sessions get` | Reads | `<id>` | `--columns` | Show one of the workspace's employee-appraisal-sessions. `GET /api/v2/HrmsService/EmployeeAppraisalSessions/{sessionId}` |
| `absuite hrms employee-appraisal-sessions create` | Writes |  | `--employee-profile-id`, `--appraisal-workflow-id`, `--appraisal-stage-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's employee-appraisal-sessions. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/EmployeeAppraisalSessions` |
| `absuite hrms employee-appraisal-sessions update` | Writes | `<id>` | `--employee-profile-id`, `--appraisal-workflow-id`, `--appraisal-stage-id`; `--json` `--file` `--dry-run` | Change one of the workspace's employee-appraisal-sessions: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/EmployeeAppraisalSessions/{sessionId}` |
| `absuite hrms employee-appraisal-sessions delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's employee-appraisal-sessions; it asks first unless --yes. `DELETE /api/v2/HrmsService/EmployeeAppraisalSessions/{sessionId}` |

### Employee Types (`absuite hrms employee-types`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms employee-types list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's employee-types. `GET /api/v2/HrmsService/EmployeeTypes` |
| `absuite hrms employee-types count` | Reads |  |  | Count the workspace's employee-types. `GET /api/v2/HrmsService/EmployeeTypes/Count` |
| `absuite hrms employee-types get` | Reads | `<id>` | `--columns` | Show one of the workspace's employee-types. `GET /api/v2/HrmsService/EmployeeTypes/{employeeTypeId}` |
| `absuite hrms employee-types create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's employee-types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/EmployeeTypes` |
| `absuite hrms employee-types update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's employee-types: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/EmployeeTypes/{employeeTypeId}` |
| `absuite hrms employee-types delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's employee-types; it asks first unless --yes. `DELETE /api/v2/HrmsService/EmployeeTypes/{employeeTypeId}` |

### Employees (`absuite hrms employees`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms employees list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's employees. `GET /api/v2/HrmsService/Employees` |
| `absuite hrms employees count` | Reads |  |  | Count the workspace's employees. `GET /api/v2/HrmsService/Employees/Count` |
| `absuite hrms employees get` | Reads | `<id>` | `--columns` | Show one of the workspace's employees. `GET /api/v2/HrmsService/Employees/{employeeId}` |
| `absuite hrms employees create` | Writes |  | `--gross-pay`, `--net-salary`, `--payroll-currency`, `--max-work-hours-per-day`, `--job-title-id`, `--employee-type-id`, `--contact-id`, `--about`, `--avatar-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Create a record in the workspace's employees. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/Employees` |
| `absuite hrms employees update` | Writes | `<id>` | `--gross-pay`, `--net-salary`, `--payroll-currency`, `--max-work-hours-per-day`, `--job-title-id`, `--employee-type-id`, `--contact-id`, `--about`, `--avatar-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Change one of the workspace's employees: reads it, applies --json/--file and the field flags, then saves it. Never set here: type (not settable: discriminator (TPH rule)). `PUT /api/v2/HrmsService/Employees/{employeeId}` |
| `absuite hrms employees delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's employees; it asks first unless --yes. `DELETE /api/v2/HrmsService/Employees/{employeeId}` |

### Employers (`absuite hrms employers`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms employers list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's employers. `GET /api/v2/HrmsService/Employers` |
| `absuite hrms employers count` | Reads |  |  | Count the workspace's employers. `GET /api/v2/HrmsService/Employers/Count` |
| `absuite hrms employers get` | Reads | `<id>` | `--columns` | Show one of the workspace's employers. `GET /api/v2/HrmsService/Employers/{employerId}` |
| `absuite hrms employers create` | Writes |  | `--contact-id`, `--about`, `--avatar-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Create a record in the workspace's employers. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/Employers` |
| `absuite hrms employers update` | Writes | `<id>` | `--contact-id`, `--about`, `--avatar-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Change one of the workspace's employers: reads it, applies --json/--file and the field flags, then saves it. Never set here: type (not settable: discriminator (TPH rule)). `PUT /api/v2/HrmsService/Employers/{employerId}` |
| `absuite hrms employers delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's employers; it asks first unless --yes. `DELETE /api/v2/HrmsService/Employers/{employerId}` |

### Gig Applications (`absuite hrms gig-applications`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms gig-applications list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's gig-applications. `GET /api/v2/HrmsService/GigApplications` |
| `absuite hrms gig-applications count` | Reads |  |  | Count the workspace's gig-applications. `GET /api/v2/HrmsService/GigApplications/Count` |
| `absuite hrms gig-applications get` | Reads | `<id>` | `--columns` | Show one of the workspace's gig-applications. `GET /api/v2/HrmsService/GigApplications/{gigApplicationId}` |

### Gigs (`absuite hrms gigs`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms gigs list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's gigs. `GET /api/v2/HrmsService/Gigs` |
| `absuite hrms gigs count` | Reads |  |  | Count the workspace's gigs. `GET /api/v2/HrmsService/Gigs/Count` |
| `absuite hrms gigs get` | Reads | `<id>` | `--columns` | Show one of the workspace's gigs. `GET /api/v2/HrmsService/Gigs/{gigId}` |
| `absuite hrms gigs create` | Writes |  | `--remote`, `--title`, `--description`, `--expected-delivery-date`, `--employer-profile-id`, `--min-budget`, `--max-budget`, `--currency-id`, `--country-id`, `--country-state-id`, `--city-id`, `--location`, `--external-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Create a record in the workspace's gigs. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/Gigs` |
| `absuite hrms gigs update` | Writes | `<id>` | `--remote`, `--title`, `--description`, `--expected-delivery-date`, `--employer-profile-id`, `--min-budget`, `--max-budget`, `--currency-id`, `--country-id`, `--country-state-id`, `--city-id`, `--location`, `--external-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Change one of the workspace's gigs: reads it, applies --json/--file and the field flags, then saves it. Never set here: type (not settable: discriminator (TPH rule)). `PUT /api/v2/HrmsService/Gigs/{gigId}` |
| `absuite hrms gigs delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's gigs; it asks first unless --yes. `DELETE /api/v2/HrmsService/Gigs/{gigId}` |

### Job Applicants (`absuite hrms job-applicants`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms job-applicants list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's job-applicants. `GET /api/v2/HrmsService/JobApplicants` |
| `absuite hrms job-applicants count` | Reads |  |  | Count the workspace's job-applicants. `GET /api/v2/HrmsService/JobApplicants/Count` |
| `absuite hrms job-applicants get` | Reads | `<id>` | `--columns` | Show one of the workspace's job-applicants. `GET /api/v2/HrmsService/JobApplicants/{jobApplicantId}` |
| `absuite hrms job-applicants create` | Writes |  | `--available-for-hire`, `--career-level`, `--experience-in-years`, `--current-salary`, `--min-salary-expectation`, `--max-salary-expectation`, `--currency-id`, `--contact-id`, `--about`, `--avatar-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Create a record in the workspace's job-applicants. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/JobApplicants` |
| `absuite hrms job-applicants update` | Writes | `<id>` | `--available-for-hire`, `--career-level`, `--experience-in-years`, `--current-salary`, `--min-salary-expectation`, `--max-salary-expectation`, `--currency-id`, `--contact-id`, `--about`, `--avatar-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Change one of the workspace's job-applicants: reads it, applies --json/--file and the field flags, then saves it. Never set here: type (not settable: discriminator (TPH rule)). `PUT /api/v2/HrmsService/JobApplicants/{jobApplicantId}` |
| `absuite hrms job-applicants delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's job-applicants; it asks first unless --yes. `DELETE /api/v2/HrmsService/JobApplicants/{jobApplicantId}` |

### Job Applications (`absuite hrms job-applications`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms job-applications list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's job-applications. `GET /api/v2/HrmsService/JobApplications` |
| `absuite hrms job-applications count` | Reads |  |  | Count the workspace's job-applications. `GET /api/v2/HrmsService/JobApplications/Count` |
| `absuite hrms job-applications get` | Reads | `<id>` | `--columns` | Show one of the workspace's job-applications. `GET /api/v2/HrmsService/JobApplications/{jobApplicationId}` |

### Job Fields (`absuite hrms job-fields`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms job-fields list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's job-fields. `GET /api/v2/HrmsService/JobFields` |
| `absuite hrms job-fields count` | Reads |  |  | Count the workspace's job-fields. `GET /api/v2/HrmsService/JobFields/Count` |
| `absuite hrms job-fields get` | Reads | `<id>` | `--columns` | Show one of the workspace's job-fields. `GET /api/v2/HrmsService/JobFields/{jobFieldId}` |
| `absuite hrms job-fields create` | Writes |  | `--name`, `--image-url`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's job-fields. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/JobFields` |
| `absuite hrms job-fields update` | Writes | `<id>` | `--name`, `--image-url`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's job-fields: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/JobFields/{jobFieldId}` |
| `absuite hrms job-fields delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's job-fields; it asks first unless --yes. `DELETE /api/v2/HrmsService/JobFields/{jobFieldId}` |

### Job Offer Fields (`absuite hrms job-offer-fields`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms job-offer-fields list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's job-offer-fields. `GET /api/v2/HrmsService/JobOfferFields` |
| `absuite hrms job-offer-fields count` | Reads |  |  | Count the workspace's job-offer-fields. `GET /api/v2/HrmsService/JobOfferFields/Count` |
| `absuite hrms job-offer-fields get` | Reads | `<id>` | `--columns` | Show one of the workspace's job-offer-fields. `GET /api/v2/HrmsService/JobOfferFields/{jobOfferFieldId}` |
| `absuite hrms job-offer-fields create` | Writes |  | `--job-field-id`, `--job-offer-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's job-offer-fields. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/JobOfferFields` |
| `absuite hrms job-offer-fields update` | Writes | `<id>` | `--job-field-id`, `--job-offer-id`; `--json` `--file` `--dry-run` | Change one of the workspace's job-offer-fields: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/JobOfferFields/{jobOfferFieldId}` |
| `absuite hrms job-offer-fields delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's job-offer-fields; it asks first unless --yes. `DELETE /api/v2/HrmsService/JobOfferFields/{jobOfferFieldId}` |

### Job Offers (`absuite hrms job-offers`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms job-offers list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's job-offers. `GET /api/v2/HrmsService/JobOffers` |
| `absuite hrms job-offers count` | Reads |  |  | Count the workspace's job-offers. `GET /api/v2/HrmsService/JobOffers/Count` |
| `absuite hrms job-offers get` | Reads | `<id>` | `--columns` | Show one of the workspace's job-offers. `GET /api/v2/HrmsService/JobOffers/{jobOfferId}` |
| `absuite hrms job-offers create` | Writes |  | `--remote`, `--expected-hire-date`, `--title`, `--description`, `--technical-skills`, `--non-technical-skills`, `--certifications`, `--project-experience`, `--technologies`, `--benefits`, `--is-official-job-offer`, `--is-remote-job-offer`, `--is-mid-time-job-offer`, `--is-undergraduate-option`, `--min-overall-experience-years`, `--availiable-positions-count`, `--min-salary-amount`, `--max-salary-amount`, `--currency-id`, `--job-field-id`, `--employer-profile-id`, `--country-id`, `--country-state-id`, `--city-id`, `--image-url`, `--location`, `--external-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Create a record in the workspace's job-offers. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/JobOffers` |
| `absuite hrms job-offers update` | Writes | `<id>` | `--remote`, `--expected-hire-date`, `--title`, `--description`, `--technical-skills`, `--non-technical-skills`, `--certifications`, `--project-experience`, `--technologies`, `--benefits`, `--is-official-job-offer`, `--is-remote-job-offer`, `--is-mid-time-job-offer`, `--is-undergraduate-option`, `--min-overall-experience-years`, `--availiable-positions-count`, `--min-salary-amount`, `--max-salary-amount`, `--currency-id`, `--job-field-id`, `--employer-profile-id`, `--country-id`, `--country-state-id`, `--city-id`, `--image-url`, `--location`, `--external-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Change one of the workspace's job-offers: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/JobOffers/{jobOfferId}` |
| `absuite hrms job-offers delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's job-offers; it asks first unless --yes. `DELETE /api/v2/HrmsService/JobOffers/{jobOfferId}` |
| `absuite hrms job-offers public list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's job-offers public. `GET /api/v2/HrmsService/JobOffers/Public` |
| `absuite hrms job-offers public count` | Reads |  |  | Count the workspace's job-offers public. `GET /api/v2/HrmsService/JobOffers/Public/Count` |
| `absuite hrms job-offers public get` | Reads | `<id>` | `--columns` | Show one of the workspace's job-offers public. `GET /api/v2/HrmsService/JobOffers/Public/{jobOfferId}` |

### Job Titles (`absuite hrms job-titles`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms job-titles list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's job-titles. `GET /api/v2/HrmsService/JobTitles` |
| `absuite hrms job-titles count` | Reads |  |  | Count the workspace's job-titles. `GET /api/v2/HrmsService/JobTitles/Count` |
| `absuite hrms job-titles get` | Reads | `<id>` | `--columns` | Show one of the workspace's job-titles. `GET /api/v2/HrmsService/JobTitles/{jobTitleId}` |
| `absuite hrms job-titles create` | Writes |  | `--title`, `--description`, `--gross-pay`, `--net-salary`, `--currency-id`, `--country-id`, `--country-state-id`, `--city-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's job-titles. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/JobTitles` |
| `absuite hrms job-titles update` | Writes | `<id>` | `--title`, `--description`, `--gross-pay`, `--net-salary`, `--currency-id`, `--country-id`, `--country-state-id`, `--city-id`; `--json` `--file` `--dry-run` | Change one of the workspace's job-titles: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/JobTitles/{jobTitleId}` |
| `absuite hrms job-titles delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's job-titles; it asks first unless --yes. `DELETE /api/v2/HrmsService/JobTitles/{jobTitleId}` |

### Leave Applications (`absuite hrms leave-applications`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms leave-applications list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's leave-applications. `GET /api/v2/HrmsService/LeaveApplications` |
| `absuite hrms leave-applications count` | Reads |  |  | Count the workspace's leave-applications. `GET /api/v2/HrmsService/LeaveApplications/Count` |
| `absuite hrms leave-applications get` | Reads | `<id>` | `--columns` | Show one of the workspace's leave-applications. `GET /api/v2/HrmsService/LeaveApplications/{leaveApplicationId}` |

### Leave Types (`absuite hrms leave-types`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms leave-types list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's leave-types. `GET /api/v2/HrmsService/LeaveTypes` |
| `absuite hrms leave-types count` | Reads |  |  | Count the workspace's leave-types. `GET /api/v2/HrmsService/LeaveTypes/Count` |
| `absuite hrms leave-types get` | Reads | `<id>` | `--columns` | Show one of the workspace's leave-types. `GET /api/v2/HrmsService/LeaveTypes/{leaveTypeId}` |
| `absuite hrms leave-types create` | Writes |  | `--title`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's leave-types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/LeaveTypes` |
| `absuite hrms leave-types update` | Writes | `<id>` | `--title`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's leave-types: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/LeaveTypes/{leaveTypeId}` |
| `absuite hrms leave-types delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's leave-types; it asks first unless --yes. `DELETE /api/v2/HrmsService/LeaveTypes/{leaveTypeId}` |

### Payroll Periods (`absuite hrms payroll-periods`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms payroll-periods list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's payroll-periods. `GET /api/v2/HrmsService/PayrollPeriods` |
| `absuite hrms payroll-periods count` | Reads |  |  | Count the workspace's payroll-periods. `GET /api/v2/HrmsService/PayrollPeriods/Count` |
| `absuite hrms payroll-periods get` | Reads | `<id>` | `--columns` | Show one of the workspace's payroll-periods. `GET /api/v2/HrmsService/PayrollPeriods/{periodId}` |
| `absuite hrms payroll-periods create` | Writes |  | `--title`, `--description`, `--start-date`, `--end-date`; `--json` `--file` `--dry-run` | Create a record in the workspace's payroll-periods. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/PayrollPeriods` |
| `absuite hrms payroll-periods update` | Writes | `<id>` | `--title`, `--description`, `--start-date`, `--end-date`; `--json` `--file` `--dry-run` | Change one of the workspace's payroll-periods: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/PayrollPeriods/{periodId}` |
| `absuite hrms payroll-periods delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's payroll-periods; it asks first unless --yes. `DELETE /api/v2/HrmsService/PayrollPeriods/{periodId}` |

### Payrolls (`absuite hrms payrolls`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms payrolls list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's payrolls. `GET /api/v2/HrmsService/Payrolls` |
| `absuite hrms payrolls count` | Reads |  |  | Count the workspace's payrolls. `GET /api/v2/HrmsService/Payrolls/Count` |
| `absuite hrms payrolls get` | Reads | `<id>` | `--columns` | Show one of the workspace's payrolls. `GET /api/v2/HrmsService/Payrolls/{payrollId}` |
| `absuite hrms payrolls create` | Writes |  | `--payroll-period-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's payrolls. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/Payrolls` |
| `absuite hrms payrolls update` | Writes | `<id>` | `--payroll-period-id`; `--json` `--file` `--dry-run` | Change one of the workspace's payrolls: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/Payrolls/{payrollId}` |
| `absuite hrms payrolls delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's payrolls; it asks first unless --yes. `DELETE /api/v2/HrmsService/Payrolls/{payrollId}` |

### Required Skills (`absuite hrms required-skills`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms required-skills list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's required-skills. `GET /api/v2/HrmsService/RequiredSkills` |
| `absuite hrms required-skills count` | Reads |  |  | Count the workspace's required-skills. `GET /api/v2/HrmsService/RequiredSkills/Count` |
| `absuite hrms required-skills get` | Reads | `<id>` | `--columns` | Show one of the workspace's required-skills. `GET /api/v2/HrmsService/RequiredSkills/{requiredSkillId}` |
| `absuite hrms required-skills create` | Writes |  | `--skill-id`, `--job-offer-id`, `--employer-profile-id`, `--experience-in-years`, `--priority`, `--required-skill-record-type`; `--json` `--file` `--dry-run` | Create a record in the workspace's required-skills. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/RequiredSkills` |
| `absuite hrms required-skills update` | Writes | `<id>` | `--skill-id`, `--job-offer-id`, `--employer-profile-id`, `--experience-in-years`, `--priority`, `--required-skill-record-type`; `--json` `--file` `--dry-run` | Change one of the workspace's required-skills: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/RequiredSkills/{requiredSkillId}` |
| `absuite hrms required-skills delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's required-skills; it asks first unless --yes. `DELETE /api/v2/HrmsService/RequiredSkills/{requiredSkillId}` |

### Salaries (`absuite hrms salaries`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms salaries list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's salaries. `GET /api/v2/HrmsService/Salaries` |
| `absuite hrms salaries count` | Reads |  |  | Count the workspace's salaries. `GET /api/v2/HrmsService/Salaries/Count` |
| `absuite hrms salaries get` | Reads | `<id>` | `--columns` | Show one of the workspace's salaries. `GET /api/v2/HrmsService/Salaries/{salaryId}` |
| `absuite hrms salaries create` | Writes |  | `--amount`, `--currency-id`, `--employee-profile-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's salaries. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/Salaries` |
| `absuite hrms salaries update` | Writes | `<id>` | `--amount`, `--currency-id`, `--employee-profile-id`; `--json` `--file` `--dry-run` | Change one of the workspace's salaries: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/Salaries/{salaryId}` |
| `absuite hrms salaries delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's salaries; it asks first unless --yes. `DELETE /api/v2/HrmsService/Salaries/{salaryId}` |

### Schedules (`absuite hrms schedules`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms schedules list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's schedules. `GET /api/v2/HrmsService/Schedules` |
| `absuite hrms schedules count` | Reads |  |  | Count the workspace's schedules. `GET /api/v2/HrmsService/Schedules/Count` |
| `absuite hrms schedules get` | Reads | `<id>` | `--columns` | Show one of the workspace's schedules. `GET /api/v2/HrmsService/Schedules/{scheduleId}` |
| `absuite hrms schedules create` | Writes |  | `--name`, `--description`, `--disabled`, `--sunday`, `--monday`, `--tuesday`, `--wednesday`, `--thursday`, `--friday`, `--saturday`, `--unique-interval`, `--is24x7-interval`, `--start`, `--end`, `--timezone-id`, `--fiscal-year-id`, `--holiday-schedule-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's schedules. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/Schedules` |
| `absuite hrms schedules update` | Writes | `<id>` | `--name`, `--description`, `--disabled`, `--sunday`, `--monday`, `--tuesday`, `--wednesday`, `--thursday`, `--friday`, `--saturday`, `--unique-interval`, `--is24x7-interval`, `--start`, `--end`, `--timezone-id`, `--fiscal-year-id`, `--holiday-schedule-id`; `--json` `--file` `--dry-run` | Change one of the workspace's schedules: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/Schedules/{scheduleId}` |
| `absuite hrms schedules delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's schedules; it asks first unless --yes. `DELETE /api/v2/HrmsService/Schedules/{scheduleId}` |

### Shifts (`absuite hrms shifts`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms shifts list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's shifts. `GET /api/v2/HrmsService/Shifts` |
| `absuite hrms shifts count` | Reads |  |  | Count the workspace's shifts. `GET /api/v2/HrmsService/Shifts/Count` |
| `absuite hrms shifts get` | Reads | `<id>` | `--columns` | Show one of the workspace's shifts. `GET /api/v2/HrmsService/Shifts/{shiftId}` |
| `absuite hrms shifts create` | Writes |  | `--title`, `--description`, `--start`, `--end`, `--is-break`, `--occust-on-monday`, `--occust-on-tuesday`, `--occust-on-wednesday`, `--occust-on-thursday`, `--occust-on-friday`, `--occust-on-saturday`, `--occust-on-sunday`, `--repeat-every`, `--repetition-criteria`, `--recurrence-start`, `--recurrence-end`, `--day-of-the-week`, `--schedule-id`, `--parent-time-interval-id`, `--employee-profile-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's shifts. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/Shifts` |
| `absuite hrms shifts update` | Writes | `<id>` | `--title`, `--description`, `--start`, `--end`, `--is-break`, `--occust-on-monday`, `--occust-on-tuesday`, `--occust-on-wednesday`, `--occust-on-thursday`, `--occust-on-friday`, `--occust-on-saturday`, `--occust-on-sunday`, `--repeat-every`, `--repetition-criteria`, `--recurrence-start`, `--recurrence-end`, `--day-of-the-week`, `--schedule-id`, `--parent-time-interval-id`, `--employee-profile-id`; `--json` `--file` `--dry-run` | Change one of the workspace's shifts: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/Shifts/{shiftId}` |
| `absuite hrms shifts delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's shifts; it asks first unless --yes. `DELETE /api/v2/HrmsService/Shifts/{shiftId}` |

### Time Intervals (`absuite hrms time-intervals`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms time-intervals list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's time-intervals. `GET /api/v2/HrmsService/TimeIntervals` |
| `absuite hrms time-intervals count` | Reads |  |  | Count the workspace's time-intervals. `GET /api/v2/HrmsService/TimeIntervals/Count` |
| `absuite hrms time-intervals get` | Reads | `<id>` | `--columns` | Show one of the workspace's time-intervals. `GET /api/v2/HrmsService/TimeIntervals/{timeIntervalId}` |
| `absuite hrms time-intervals create` | Writes |  | `--title`, `--description`, `--is-break`, `--occust-on-monday`, `--occust-on-tuesday`, `--occust-on-wednesday`, `--occust-on-thursday`, `--occust-on-friday`, `--occust-on-saturday`, `--occust-on-sunday`, `--start`, `--end`, `--repeat-every`, `--schedule-id`, `--parent-time-interval-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's time-intervals. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/TimeIntervals` |
| `absuite hrms time-intervals update` | Writes | `<id>` | `--title`, `--description`, `--is-break`, `--occust-on-monday`, `--occust-on-tuesday`, `--occust-on-wednesday`, `--occust-on-thursday`, `--occust-on-friday`, `--occust-on-saturday`, `--occust-on-sunday`, `--start`, `--end`, `--repeat-every`, `--parent-time-interval-id`; `--json` `--file` `--dry-run` | Change one of the workspace's time-intervals: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/TimeIntervals/{timeIntervalId}` |
| `absuite hrms time-intervals delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's time-intervals; it asks first unless --yes. `DELETE /api/v2/HrmsService/TimeIntervals/{timeIntervalId}` |

### Training Program Courses (`absuite hrms training-program-courses`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms training-program-courses list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's training-program-courses. `GET /api/v2/HrmsService/TrainingProgramCourses` |
| `absuite hrms training-program-courses count` | Reads |  |  | Count the workspace's training-program-courses. `GET /api/v2/HrmsService/TrainingProgramCourses/Count` |
| `absuite hrms training-program-courses get` | Reads | `<id>` | `--columns` | Show one of the workspace's training-program-courses. `GET /api/v2/HrmsService/TrainingProgramCourses/{courseId}` |
| `absuite hrms training-program-courses create` | Writes |  | `--training-program-id`, `--course-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's training-program-courses. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/TrainingProgramCourses` |
| `absuite hrms training-program-courses update` | Writes | `<id>` | `--training-program-id`, `--course-id`; `--json` `--file` `--dry-run` | Change one of the workspace's training-program-courses: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/TrainingProgramCourses/{courseId}` |
| `absuite hrms training-program-courses delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's training-program-courses; it asks first unless --yes. `DELETE /api/v2/HrmsService/TrainingProgramCourses/{courseId}` |

### Training Program Events (`absuite hrms training-program-events`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms training-program-events list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's training-program-events. `GET /api/v2/HrmsService/TrainingProgramEvents` |
| `absuite hrms training-program-events count` | Reads |  |  | Count the workspace's training-program-events. `GET /api/v2/HrmsService/TrainingProgramEvents/Count` |
| `absuite hrms training-program-events get` | Reads | `<id>` | `--columns` | Show one of the workspace's training-program-events. `GET /api/v2/HrmsService/TrainingProgramEvents/{eventId}` |
| `absuite hrms training-program-events create` | Writes |  | `--title`, `--description`, `--start`, `--end`, `--is-break`, `--occust-on-monday`, `--occust-on-tuesday`, `--occust-on-wednesday`, `--occust-on-thursday`, `--occust-on-friday`, `--occust-on-saturday`, `--occust-on-sunday`, `--repeat-every`, `--repetition-criteria`, `--recurrence-start`, `--recurrence-end`, `--day-of-the-week`, `--schedule-id`, `--parent-time-interval-id`, `--training-program-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's training-program-events. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/TrainingProgramEvents` |
| `absuite hrms training-program-events update` | Writes | `<id>` | `--title`, `--description`, `--start`, `--end`, `--is-break`, `--occust-on-monday`, `--occust-on-tuesday`, `--occust-on-wednesday`, `--occust-on-thursday`, `--occust-on-friday`, `--occust-on-saturday`, `--occust-on-sunday`, `--repeat-every`, `--repetition-criteria`, `--recurrence-start`, `--recurrence-end`, `--day-of-the-week`, `--schedule-id`, `--parent-time-interval-id`, `--training-program-id`; `--json` `--file` `--dry-run` | Change one of the workspace's training-program-events: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/TrainingProgramEvents/{eventId}` |
| `absuite hrms training-program-events delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's training-program-events; it asks first unless --yes. `DELETE /api/v2/HrmsService/TrainingProgramEvents/{eventId}` |

### Training Programs (`absuite hrms training-programs`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite hrms training-programs list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's training-programs. `GET /api/v2/HrmsService/TrainingPrograms` |
| `absuite hrms training-programs count` | Reads |  |  | Count the workspace's training-programs. `GET /api/v2/HrmsService/TrainingPrograms/Count` |
| `absuite hrms training-programs get` | Reads | `<id>` | `--columns` | Show one of the workspace's training-programs. `GET /api/v2/HrmsService/TrainingPrograms/{programId}` |
| `absuite hrms training-programs create` | Writes |  | `--title`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's training-programs. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/HrmsService/TrainingPrograms` |
| `absuite hrms training-programs update` | Writes | `<id>` | `--title`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's training-programs: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/HrmsService/TrainingPrograms/{programId}` |
| `absuite hrms training-programs delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's training-programs; it asks first unless --yes. `DELETE /api/v2/HrmsService/TrainingPrograms/{programId}` |

## Example

```bash
absuite hrms appraisal-stages list --top 5 -o json --query "[].id"
absuite hrms appraisal-stages create --name <value> --description <value> --dry-run   # prints the POST, sends nothing
absuite hrms appraisal-stages create --name <value> --description <value> -o json --no-input
```
