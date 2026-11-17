---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-tenants-cli
key: fenixalliance.absuite.tenants-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Tenants area with the absuite CLI: 54 commands (0 read, 54
  write) under `absuite tenants`, each generated from the platform's ServiceClients and checked
  against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-tenants REST
  skill.
---

# Alliance Business Suite — Tenants Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-tenants` REST skill documents 92 routes; 54 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-tenants` REST skill.

## Commands

54 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Departments (`absuite tenants departments`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants departments list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's departments. `GET /api/v2/TenantsService/Departments` |
| `absuite tenants departments count` | Writes |  |  | Count the workspace's departments. `GET /api/v2/TenantsService/Departments/Count` |
| `absuite tenants departments create` | Writes |  | `--name`, `--description`, `--disabled`, `--organization-profile-id`, `--parent-department-id`, `--external-reference`; `--json` `--file` `--dry-run` | Create a record in the workspace's departments. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/TenantsService/Departments` |

### Employee Enrollments (`absuite tenants employee-enrollments`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants employee-enrollments list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's employee-enrollments. `GET /api/v2/TenantsService/EmployeeEnrollments` |
| `absuite tenants employee-enrollments count` | Writes |  |  | Count the workspace's employee-enrollments. `GET /api/v2/TenantsService/EmployeeEnrollments/Count` |

### Enrollments (`absuite tenants enrollments`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants enrollments extended list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's enrollments extended. `GET /api/v2/TenantsService/Enrollments/Extended` |
| `absuite tenants enrollments permissions list` | Writes |  | `--enrollment-id` (required) | List the workspace's enrollments permissions. `GET /api/v2/TenantsService/Tenants/{tenantId}/Enrollments/{enrollmentId}/Permissions` |
| `absuite tenants enrollments extended count` | Writes |  |  | Count the workspace's enrollments extended. `GET /api/v2/TenantsService/Enrollments/Extended/Count` |
| `absuite tenants enrollments extended show` | Writes |  | `--enrollment-id` (required); `--columns` | Show the workspace's enrollments extended. `GET /api/v2/TenantsService/Tenants/{tenantId}/Enrollments/{enrollmentId}/Extended` |

### Extended (`absuite tenants extended`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants extended show` | Writes |  | `--columns` | Show the workspace's extended. `GET /api/v2/TenantsService/Tenants/{tenantId}/Extended` |

### Industries (`absuite tenants industries`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants industries list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's industries. `GET /api/v2/TenantsService/Industries` |
| `absuite tenants industries count` | Writes |  |  | Count the workspace's industries. `GET /api/v2/TenantsService/Industries/Count` |
| `absuite tenants industries create` | Writes |  | `--name`, `--parent-business-industry-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's industries. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/TenantsService/Industries` |

### Invitations (`absuite tenants invitations`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants invitations list` | Writes |  | `--columns` | List the workspace's invitations. `GET /api/v2/TenantsService/Tenants/{tenantId}/Invitations` |
| `absuite tenants invitations count` | Writes |  |  | Count the workspace's invitations. `GET /api/v2/TenantsService/Invitations/Count` |

### Notifications (`absuite tenants notifications`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants notifications list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's notifications. `GET /api/v2/TenantsService/Tenants/{tenantId}/Notifications` |
| `absuite tenants notifications count` | Writes |  |  | Count the workspace's notifications. `GET /api/v2/TenantsService/Tenants/{tenantId}/Notifications/Count` |

### Positions (`absuite tenants positions`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants positions list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's positions. `GET /api/v2/TenantsService/Positions` |
| `absuite tenants positions count` | Writes |  |  | Count the workspace's positions. `GET /api/v2/TenantsService/Positions/Count` |
| `absuite tenants positions create` | Writes |  | `--title`, `--description`, `--department-id`, `--capacity`, `--reports-to-position-id`, `--job-role-id`, `--responsibilities`, `--external-reference`; `--json` `--file` `--dry-run` | Create a record in the workspace's positions. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/TenantsService/Positions` |
| `absuite tenants positions by-enrollment get` | Writes | `<id>` | `--columns` | Show one of the workspace's positions by-enrollment. `GET /api/v2/TenantsService/Positions/ByEnrollment/{enrollmentId}` |

### Segments (`absuite tenants segments`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants segments list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's segments. `GET /api/v2/TenantsService/Segments` |
| `absuite tenants segments count` | Writes |  |  | Count the workspace's segments. `GET /api/v2/TenantsService/Segments/Count` |
| `absuite tenants segments create` | Writes |  | `--min-employees`, `--max-employees`; `--json` `--file` `--dry-run` | Create a record in the workspace's segments. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/TenantsService/Segments` |

### Sizes (`absuite tenants sizes`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants sizes list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's sizes. `GET /api/v2/TenantsService/Sizes` |
| `absuite tenants sizes count` | Writes |  |  | Count the workspace's sizes. `GET /api/v2/TenantsService/Sizes/Count` |
| `absuite tenants sizes create` | Writes |  | `--employee-low-range-value`, `--employee-high-range-value`; `--json` `--file` `--dry-run` | Create a record in the workspace's sizes. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/TenantsService/Sizes` |

### Team Contact Enrollments (`absuite tenants team-contact-enrollments`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants team-contact-enrollments list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's team-contact-enrollments. `GET /api/v2/TenantsService/TeamContactEnrollments` |
| `absuite tenants team-contact-enrollments count` | Writes |  |  | Count the workspace's team-contact-enrollments. `GET /api/v2/TenantsService/TeamContactEnrollments/Count` |

### Team Project Enrollments (`absuite tenants team-project-enrollments`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants team-project-enrollments list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's team-project-enrollments. `GET /api/v2/TenantsService/TeamProjectEnrollments` |
| `absuite tenants team-project-enrollments count` | Writes |  |  | Count the workspace's team-project-enrollments. `GET /api/v2/TenantsService/TeamProjectEnrollments/Count` |

### Team Records (`absuite tenants team-records`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants team-records list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's team-records. `GET /api/v2/TenantsService/TeamRecords` |
| `absuite tenants team-records count` | Writes |  |  | Count the workspace's team-records. `GET /api/v2/TenantsService/TeamRecords/Count` |
| `absuite tenants team-records create` | Writes |  | `--business-team-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's team-records. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/TenantsService/TeamRecords` |

### Teams (`absuite tenants teams`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants teams list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's teams. `GET /api/v2/TenantsService/Teams` |
| `absuite tenants teams count` | Writes |  |  | Count the workspace's teams. `GET /api/v2/TenantsService/Teams/Count` |
| `absuite tenants teams create` | Writes |  | `--name`, `--description`, `--avatar-url`, `--is-public`, `--business-unit-id`, `--organization-profile-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's teams. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/TenantsService/Teams` |
| `absuite tenants teams members list` | Writes |  | `--team-id` (required); `--top` `--skip` `--columns` | List the workspace's teams members. `GET /api/v2/TenantsService/Teams/{teamId}/Members` |
| `absuite tenants teams members count` | Writes |  | `--team-id` (required) | Count the workspace's teams members. `GET /api/v2/TenantsService/Teams/{teamId}/Members/Count` |
| `absuite tenants teams by-member get` | Writes | `<id>` | `--columns` | Show one of the workspace's teams by-member. `GET /api/v2/TenantsService/Teams/ByMember/{enrollmentId}` |
| `absuite tenants teams card show` | Writes |  | `--team-id` (required); `--columns` | Show the workspace's teams card. `GET /api/v2/TenantsService/Teams/{teamId}/Card` |

### Territories (`absuite tenants territories`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants territories list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's territories. `GET /api/v2/TenantsService/Territories` |
| `absuite tenants territories count` | Writes |  |  | Count the workspace's territories. `GET /api/v2/TenantsService/Territories/Count` |
| `absuite tenants territories create` | Writes |  | `--name`, `--description`, `--parent-territory-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's territories. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/TenantsService/Territories` |

### Types (`absuite tenants types`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants types list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's types. `GET /api/v2/TenantsService/Types` |
| `absuite tenants types count` | Writes |  |  | Count the workspace's types. `GET /api/v2/TenantsService/Types/Count` |
| `absuite tenants types create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/TenantsService/Types` |

### Unit Groups (`absuite tenants unit-groups`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants unit-groups list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's unit-groups. `GET /api/v2/TenantsService/UnitGroups` |
| `absuite tenants unit-groups count` | Writes |  |  | Count the workspace's unit-groups. `GET /api/v2/TenantsService/UnitGroups/Count` |
| `absuite tenants unit-groups create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's unit-groups. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/TenantsService/UnitGroups` |

### Units (`absuite tenants units`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants units list` | Writes |  | `--top` `--skip` `--columns` | List the workspace's units. `GET /api/v2/TenantsService/Units` |
| `absuite tenants units count` | Writes |  |  | Count the workspace's units. `GET /api/v2/TenantsService/Units/Count` |
| `absuite tenants units create` | Writes |  | `--name`, `--description`, `--disabled`, `--country-id`, `--organization-profile-id`, `--parent-business-unit-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's units. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/TenantsService/Units` |

### Tenants (`absuite tenants`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite tenants show` | Writes |  | `--columns` | Show the workspace's tenants. `GET /api/v2/TenantsService/Tenants/{tenantId}` |

## Example

```bash
absuite tenants departments list --top 5 -o json --query "[].id"
absuite tenants departments create --name <value> --description <value> --dry-run   # prints the POST, sends nothing
absuite tenants departments create --name <value> --description <value> -o json --no-input
```

## Key Concepts

- **Tenant** — the multi-tenant business aggregate. Required create fields: `Name`, `Email`,
  `CurrencyId`, `CountryId`.
- **Enrollment** — how a *user* joins a tenant (`UserId` on create; `IsAdmin`/`IsDisabled` on
  update). "Extended" variants return related data.
- **EmployeeEnrollment** — links an employee profile to a team (`BusinessTeamId` +
  `EmployeeProfileId`, both required).
- **Invitation** — invite a user by `UserEmail` (the only required field). Lifecycle: send →
  accept / decline; revoke = delete.
- **Option** — tenant key/value config (`Key` + `Value` required), optional `PortalId`, flags
  `Frozen` / `Autoload` / `Transient`, and `Expiration`.
- **Taxonomy** — `Industries`, `Segments` (`MinEmployees`/`MaxEmployees`), `Sizes`
  (`EmployeeLowRangeValue`/`EmployeeHighRangeValue`), `Types` classify the tenant.
- **Org structure** — `Departments`, `Positions`, `Teams`, `Territories`, `Units`,
  `UnitGroups`; several support a `Parent…Id` for hierarchy.
