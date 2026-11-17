---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-projects-cli
key: fenixalliance.absuite.projects-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Projects area with the absuite CLI: 7 commands (7 read, 0
  write) under `absuite projects`, each generated from the platform's ServiceClients and checked
  against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-projects REST
  skill.
---

# Alliance Business Suite — Projects Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-projects` REST skill documents 14 routes; 8 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-projects` REST skill.

## Commands

7 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Project Tasks (`absuite projects project-tasks`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite projects project-tasks list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's project-tasks. `GET /api/v2/ProjectsService/ProjectTasks` |
| `absuite projects project-tasks count` | Reads |  |  | Count the workspace's project-tasks. `GET /api/v2/ProjectsService/ProjectTasks/Count` |
| `absuite projects project-tasks get` | Reads | `<id>` | `--columns` | Show one of the workspace's project-tasks. `GET /api/v2/ProjectsService/ProjectTasks/{projectTaskId}` |

### Task Categories (`absuite projects task-categories`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite projects task-categories count` | Reads |  |  | Count the workspace's task-categories. `GET /api/v2/ProjectsService/TaskCategories/Count` |

### Time Logs (`absuite projects time-logs`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite projects time-logs count` | Reads |  | `--project-period-id` (required) | Count the workspace's time-logs. `GET /api/v2/ProjectsService/TimeLogs/Count` |

### Projects (`absuite projects`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite projects list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's projects. `GET /api/v2/ProjectsService/Projects` |
| `absuite projects count` | Reads |  |  | Count the workspace's projects. `GET /api/v2/ProjectsService/Projects/Count` |

## Example

```bash
absuite projects list --top 5 -o json --query "[].id"
```

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
