---
name: absuite-learning-cli
key: fenixalliance.absuite.learning-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Learning area with the absuite CLI: 99 commands (75 read, 24
  write) under `absuite learning`, each generated from the platform's ServiceClients and checked
  against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-learning REST
  skill.
---

# Alliance Business Suite — Learning Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-learning` REST skill documents 26 routes; 11 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-learning` REST skill.

## Commands

99 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Course Articles (`absuite learning course-articles`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite learning course-articles list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's course-articles. `GET /api/v2/LearningService/CourseArticles` |
| `absuite learning course-articles count` | Reads |  |  | Count the workspace's course-articles. `GET /api/v2/LearningService/CourseArticles/Count` |
| `absuite learning course-articles get` | Reads | `<id>` | `--columns` | Show one of the workspace's course-articles. `GET /api/v2/LearningService/CourseArticles/{articleId}` |
| `absuite learning course-articles create` | Writes |  | `--title`, `--description`, `--content`, `--course-id`, `--course-wiki-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's course-articles. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LearningService/CourseArticles` |
| `absuite learning course-articles update` | Writes | `<id>` | `--title`, `--description`, `--content`; `--json` `--file` `--dry-run` | Change one of the workspace's course-articles: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LearningService/CourseArticles/{articleId}` |
| `absuite learning course-articles delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's course-articles; it asks first unless --yes. `DELETE /api/v2/LearningService/CourseArticles/{articleId}` |

### Course Assignments (`absuite learning course-assignments`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite learning course-assignments list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's course-assignments. `GET /api/v2/LearningService/CourseAssignments` |
| `absuite learning course-assignments count` | Reads |  |  | Count the workspace's course-assignments. `GET /api/v2/LearningService/CourseAssignments/Count` |
| `absuite learning course-assignments get` | Reads | `<id>` | `--columns` | Show one of the workspace's course-assignments. `GET /api/v2/LearningService/CourseAssignments/{assignmentId}` |
| `absuite learning course-assignments create` | Writes |  | `--title`, `--description`, `--instructions`, `--points`, `--course-id`, `--course-unit-id`, `--course-cohort-id`, `--course-assignment-type-id`, `--due-date-time`, `--asign-to-all-cohorts`, `--resources`; `--json` `--file` `--dry-run` | Create a record in the workspace's course-assignments. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LearningService/CourseAssignments` |
| `absuite learning course-assignments update` | Writes | `<id>` | `--title`, `--description`, `--instructions`, `--points`, `--course-unit-id`, `--course-cohort-id`, `--course-assignment-type-id`, `--due-date-time`, `--asign-to-all-cohorts`, `--resources`; `--json` `--file` `--dry-run` | Change one of the workspace's course-assignments: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LearningService/CourseAssignments/{assignmentId}` |
| `absuite learning course-assignments delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's course-assignments; it asks first unless --yes. `DELETE /api/v2/LearningService/CourseAssignments/{assignmentId}` |

### Course Certificates (`absuite learning course-certificates`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite learning course-certificates list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's course-certificates. `GET /api/v2/LearningService/CourseCertificates` |
| `absuite learning course-certificates count` | Reads |  |  | Count the workspace's course-certificates. `GET /api/v2/LearningService/CourseCertificates/Count` |
| `absuite learning course-certificates get` | Reads | `<id>` | `--columns` | Show one of the workspace's course-certificates. `GET /api/v2/LearningService/CourseCertificates/{certificateId}` |
| `absuite learning course-certificates template list` | Reads |  | `--columns` | List the workspace's course-certificates template. `GET /api/v2/LearningService/CourseCertificates/Template` |
| `absuite learning course-certificates template count` | Reads |  |  | Count the workspace's course-certificates template. `GET /api/v2/LearningService/CourseCertificates/Template/Count` |
| `absuite learning course-certificates template get` | Reads | `<id>` | `--columns` | Show one of the workspace's course-certificates template. `GET /api/v2/LearningService/CourseCertificates/Template/{templateId}` |

### Course Enrollments (`absuite learning course-enrollments`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite learning course-enrollments list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's course-enrollments. `GET /api/v2/LearningService/CourseEnrollments` |
| `absuite learning course-enrollments count` | Reads |  |  | Count the workspace's course-enrollments. `GET /api/v2/LearningService/CourseEnrollments/Count` |
| `absuite learning course-enrollments get` | Reads | `<id>` | `--columns` | Show one of the workspace's course-enrollments. `GET /api/v2/LearningService/CourseEnrollments/{enrollmentId}` |

### Course Sections (`absuite learning course-sections`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite learning course-sections list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's course-sections. `GET /api/v2/LearningService/CourseSections` |
| `absuite learning course-sections count` | Reads |  |  | Count the workspace's course-sections. `GET /api/v2/LearningService/CourseSections/Count` |
| `absuite learning course-sections get` | Reads | `<id>` | `--columns` | Show one of the workspace's course-sections. `GET /api/v2/LearningService/CourseSections/{sectionId}` |
| `absuite learning course-sections create` | Writes |  | `--name`, `--icon`, `--description`, `--course-id`, `--release-date-time`, `--hide-from-students`; `--json` `--file` `--dry-run` | Create a record in the workspace's course-sections. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LearningService/CourseSections` |
| `absuite learning course-sections update` | Writes | `<id>` | `--name`, `--icon`, `--description`, `--release-date-time`, `--hide-from-students`; `--json` `--file` `--dry-run` | Change one of the workspace's course-sections: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LearningService/CourseSections/{sectionId}` |
| `absuite learning course-sections delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's course-sections; it asks first unless --yes. `DELETE /api/v2/LearningService/CourseSections/{sectionId}` |

### Course Team Memberships (`absuite learning course-team-memberships`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite learning course-team-memberships list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's course-team-memberships. `GET /api/v2/LearningService/CourseTeamMemberships` |
| `absuite learning course-team-memberships count` | Reads |  |  | Count the workspace's course-team-memberships. `GET /api/v2/LearningService/CourseTeamMemberships/Count` |
| `absuite learning course-team-memberships get` | Reads | `<id>` | `--columns` | Show one of the workspace's course-team-memberships. `GET /api/v2/LearningService/CourseTeamMemberships/{membershipId}` |
| `absuite learning course-team-memberships create` | Writes |  | `--course-id`, `--instructor-profile-id`, `--course-team-membership-type`; `--json` `--file` `--dry-run` | Create a record in the workspace's course-team-memberships. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LearningService/CourseTeamMemberships` |
| `absuite learning course-team-memberships update` | Writes | `<id>` | `--instructor-profile-id`, `--course-team-membership-type`; `--json` `--file` `--dry-run` | Change one of the workspace's course-team-memberships: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LearningService/CourseTeamMemberships/{membershipId}` |
| `absuite learning course-team-memberships delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's course-team-memberships; it asks first unless --yes. `DELETE /api/v2/LearningService/CourseTeamMemberships/{membershipId}` |

### Course Units (`absuite learning course-units`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite learning course-units list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's course-units. `GET /api/v2/LearningService/CourseUnits` |
| `absuite learning course-units count` | Reads |  |  | Count the workspace's course-units. `GET /api/v2/LearningService/CourseUnits/Count` |
| `absuite learning course-units get` | Reads | `<id>` | `--columns` | Show one of the workspace's course-units. `GET /api/v2/LearningService/CourseUnits/{unitId}` |
| `absuite learning course-units create` | Writes |  | `--title`, `--description`, `--content`, `--course-id`, `--course-section-id`, `--course-content-group-id`, `--release-date-time`; `--json` `--file` `--dry-run` | Create a record in the workspace's course-units. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LearningService/CourseUnits` |
| `absuite learning course-units update` | Writes | `<id>` | `--title`, `--description`, `--content`, `--course-content-group-id`, `--release-date-time`; `--json` `--file` `--dry-run` | Change one of the workspace's course-units: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LearningService/CourseUnits/{unitId}` |
| `absuite learning course-units delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's course-units; it asks first unless --yes. `DELETE /api/v2/LearningService/CourseUnits/{unitId}` |

### Courses (`absuite learning courses`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite learning courses list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's courses. `GET /api/v2/LearningService/Courses` |
| `absuite learning courses count` | Reads |  |  | Count the workspace's courses. `GET /api/v2/LearningService/Courses/Count` |
| `absuite learning courses get` | Reads | `<id>` | `--columns` | Show one of the workspace's courses. `GET /api/v2/LearningService/Courses/{courseId}` |
| `absuite learning courses create` | Writes |  | `--title`, `--description`, `--sku`, `--summary`, `--code`, `--course-category-id`, `--instructor-profile-id`, `--currency-id`, `--regular-price`, `--max-course-enrollments`, `--total-effort-in-weeks`, `--total-hours-per-week`, `--total-effort-in-hours`, `--start-date-time`, `--end-date-time`, `--inscriptions-start-date-time`, `--inscriptions-end-date-time`; `--json` `--file` `--dry-run` | Create a record in the workspace's courses. Only in --json: version. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LearningService/Courses` |
| `absuite learning courses update` | Writes | `<id>` | `--title`, `--description`, `--sku`, `--summary`, `--code`, `--course-category-id`, `--instructor-profile-id`, `--currency-id`, `--regular-price`, `--max-course-enrollments`, `--total-effort-in-weeks`, `--total-hours-per-week`, `--total-effort-in-hours`, `--start-date-time`, `--end-date-time`, `--inscriptions-start-date-time`, `--inscriptions-end-date-time`, `--published`; `--json` `--file` `--dry-run` | Change one of the workspace's courses: reads it, applies --json/--file and the field flags, then saves it. Only in --json: version. `PUT /api/v2/LearningService/Courses/{courseId}` |
| `absuite learning courses delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's courses; it asks first unless --yes. `DELETE /api/v2/LearningService/Courses/{courseId}` |
| `absuite learning courses assignments list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses assignments. `GET /api/v2/LearningService/Courses/{courseId}/Assignments` |
| `absuite learning courses categories list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses categories. `GET /api/v2/LearningService/Courses/{courseId}/Categories` |
| `absuite learning courses cohorts list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses cohorts. `GET /api/v2/LearningService/Courses/{courseId}/Cohorts` |
| `absuite learning courses content-groups list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses content-groups. `GET /api/v2/LearningService/Courses/{courseId}/ContentGroups` |
| `absuite learning courses enrollment-codes list` | Reads |  | `--course-id` (required); `--columns` | List the workspace's courses enrollment-codes. `GET /api/v2/LearningService/Courses/{courseId}/EnrollmentCodes` |
| `absuite learning courses files list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses files. `GET /api/v2/LearningService/Courses/{courseId}/Files` |
| `absuite learning courses forums list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses forums. `GET /api/v2/LearningService/Courses/{courseId}/Forums` |
| `absuite learning courses handouts list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses handouts. `GET /api/v2/LearningService/Courses/{courseId}/Handouts` |
| `absuite learning courses instructors list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses instructors. `GET /api/v2/LearningService/Courses/{courseId}/Instructors` |
| `absuite learning courses libraries list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses libraries. `GET /api/v2/LearningService/Courses/{courseId}/Libraries` |
| `absuite learning courses pages list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses pages. `GET /api/v2/LearningService/Courses/{courseId}/Pages` |
| `absuite learning courses problem-sets list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses problem-sets. `GET /api/v2/LearningService/Courses/{courseId}/ProblemSets` |
| `absuite learning courses reviews list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses reviews. `GET /api/v2/LearningService/Courses/{courseId}/Reviews` |
| `absuite learning courses sections list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses sections. `GET /api/v2/LearningService/Courses/{courseId}/Sections` |
| `absuite learning courses students list` | Reads |  | `--course-id` (required); `--columns` | List the workspace's courses students. `GET /api/v2/LearningService/Courses/{courseId}/Students` |
| `absuite learning courses tags list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses tags. `GET /api/v2/LearningService/Courses/{courseId}/Tags` |
| `absuite learning courses unit-components list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses unit-components. `GET /api/v2/LearningService/Courses/{courseId}/UnitComponents` |
| `absuite learning courses updates list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses updates. `GET /api/v2/LearningService/Courses/{courseId}/Updates` |
| `absuite learning courses wikis list` | Reads |  | `--course-id` (required); `--top` `--skip` `--columns` | List the workspace's courses wikis. `GET /api/v2/LearningService/Courses/{courseId}/Wikis` |
| `absuite learning courses articles count` | Reads |  | `--course-id` (required), `--wiki-id` (required) | Count the workspace's courses articles. `GET /api/v2/LearningService/Courses/{courseId}/Articles/{wikiId}/Count` |
| `absuite learning courses assignments count` | Reads |  | `--course-id` (required) | Count the workspace's courses assignments. `GET /api/v2/LearningService/Courses/{courseId}/Assignments/Count` |
| `absuite learning courses categories count` | Reads |  | `--course-id` (required) | Count the workspace's courses categories. `GET /api/v2/LearningService/Courses/{courseId}/Categories/Count` |
| `absuite learning courses cohorts count` | Reads |  | `--course-id` (required) | Count the workspace's courses cohorts. `GET /api/v2/LearningService/Courses/{courseId}/Cohorts/Count` |
| `absuite learning courses content-groups count` | Reads |  | `--course-id` (required) | Count the workspace's courses content-groups. `GET /api/v2/LearningService/Courses/{courseId}/ContentGroups/Count` |
| `absuite learning courses files count` | Reads |  | `--course-id` (required) | Count the workspace's courses files. `GET /api/v2/LearningService/Courses/{courseId}/Files/Count` |
| `absuite learning courses forums count` | Reads |  | `--course-id` (required) | Count the workspace's courses forums. `GET /api/v2/LearningService/Courses/{courseId}/Forums/Count` |
| `absuite learning courses handouts count` | Reads |  | `--course-id` (required) | Count the workspace's courses handouts. `GET /api/v2/LearningService/Courses/{courseId}/Handouts/Count` |
| `absuite learning courses instructors count` | Reads |  | `--course-id` (required) | Count the workspace's courses instructors. `GET /api/v2/LearningService/Courses/{courseId}/Instructors/Count` |
| `absuite learning courses libraries count` | Reads |  | `--course-id` (required) | Count the workspace's courses libraries. `GET /api/v2/LearningService/Courses/{courseId}/Libraries/Count` |
| `absuite learning courses pages count` | Reads |  | `--course-id` (required) | Count the workspace's courses pages. `GET /api/v2/LearningService/Courses/{courseId}/Pages/Count` |
| `absuite learning courses problem-sets count` | Reads |  | `--course-id` (required) | Count the workspace's courses problem-sets. `GET /api/v2/LearningService/Courses/{courseId}/ProblemSets/Count` |
| `absuite learning courses sections count` | Reads |  | `--course-id` (required) | Count the workspace's courses sections. `GET /api/v2/LearningService/Courses/{courseId}/Sections/Count` |
| `absuite learning courses students count` | Reads |  | `--course-id` (required) | Count the workspace's courses students. `GET /api/v2/LearningService/Courses/{courseId}/Students/Count` |
| `absuite learning courses unit-components count` | Reads |  | `--course-id` (required) | Count the workspace's courses unit-components. `GET /api/v2/LearningService/Courses/{courseId}/UnitComponents/Count` |
| `absuite learning courses units count` | Reads |  | `--course-id` (required), `--section-id` (required) | Count the workspace's courses units. `GET /api/v2/LearningService/Courses/{courseId}/Units/{sectionId}/Count` |
| `absuite learning courses updates count` | Reads |  | `--course-id` (required) | Count the workspace's courses updates. `GET /api/v2/LearningService/Courses/{courseId}/Updates/Count` |
| `absuite learning courses wikis count` | Reads |  | `--course-id` (required) | Count the workspace's courses wikis. `GET /api/v2/LearningService/Courses/{courseId}/Wikis/Count` |
| `absuite learning courses articles get` | Reads | `<id>` | `--course-id` (required); `--columns` | Show one of the workspace's courses articles. `GET /api/v2/LearningService/Courses/{courseId}/Articles/{wikiId}` |
| `absuite learning courses units get` | Reads | `<id>` | `--course-id` (required); `--columns` | Show one of the workspace's courses units. `GET /api/v2/LearningService/Courses/{courseId}/Units/{sectionId}` |

### Instructor Profiles (`absuite learning instructor-profiles`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite learning instructor-profiles list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's instructor-profiles. `GET /api/v2/LearningService/InstructorProfiles` |
| `absuite learning instructor-profiles count` | Reads |  |  | Count the workspace's instructor-profiles. `GET /api/v2/LearningService/InstructorProfiles/Count` |
| `absuite learning instructor-profiles get` | Reads | `<id>` | `--columns` | Show one of the workspace's instructor-profiles. `GET /api/v2/LearningService/InstructorProfiles/{instructorProfileId}` |
| `absuite learning instructor-profiles create` | Writes |  | `--authorized`, `--contact-id`, `--about`, `--avatar-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Create a record in the workspace's instructor-profiles. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/LearningService/InstructorProfiles` |
| `absuite learning instructor-profiles update` | Writes | `<id>` | `--authorized`, `--contact-id`, `--about`, `--avatar-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Change one of the workspace's instructor-profiles: reads it, applies --json/--file and the field flags, then saves it. Never set here: type (not settable: discriminator (TPH rule)). `PUT /api/v2/LearningService/InstructorProfiles/{instructorProfileId}` |
| `absuite learning instructor-profiles delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's instructor-profiles; it asks first unless --yes. `DELETE /api/v2/LearningService/InstructorProfiles/{instructorProfileId}` |

### Student Profiles (`absuite learning student-profiles`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite learning student-profiles list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's student-profiles. `GET /api/v2/LearningService/StudentProfiles` |
| `absuite learning student-profiles count` | Reads |  |  | Count the workspace's student-profiles. `GET /api/v2/LearningService/StudentProfiles/Count` |
| `absuite learning student-profiles get` | Reads | `<id>` | `--columns` | Show one of the workspace's student-profiles. `GET /api/v2/LearningService/StudentProfiles/{studentProfileId}` |
| `absuite learning student-profiles create` | Writes |  | `--contact-id`, `--about`, `--avatar-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Create a record in the workspace's student-profiles. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/LearningService/StudentProfiles` |
| `absuite learning student-profiles update` | Writes | `<id>` | `--contact-id`, `--about`, `--avatar-url`, `--data`, `--data-label`, `--data1`, `--data1-label`, `--data2`, `--data2-label`, `--data3`, `--data3-label`, `--data4`, `--data4-label`, `--data5`, `--data5-label`, `--data6`, `--data6-label`, `--data7`, `--data7-label`, `--data8`, `--data8-label`, `--data9`, `--data9-label`; `--json` `--file` `--dry-run` | Change one of the workspace's student-profiles: reads it, applies --json/--file and the field flags, then saves it. Never set here: type (not settable: discriminator (TPH rule)). `PUT /api/v2/LearningService/StudentProfiles/{studentProfileId}` |
| `absuite learning student-profiles delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's student-profiles; it asks first unless --yes. `DELETE /api/v2/LearningService/StudentProfiles/{studentProfileId}` |
| `absuite learning student-profiles average show` | Reads |  | `--student-profile-id` (required); `--columns` | Show the workspace's student-profiles average. `GET /api/v2/LearningService/StudentProfiles/{studentProfileId}/Average` |
| `absuite learning student-profiles hours-completed show` | Reads |  | `--student-profile-id` (required); `--columns` | Show the workspace's student-profiles hours-completed. `GET /api/v2/LearningService/StudentProfiles/{studentProfileId}/HoursCompleted` |
| `absuite learning student-profiles pending-tasks show` | Reads |  | `--student-profile-id` (required); `--columns` | Show the workspace's student-profiles pending-tasks. `GET /api/v2/LearningService/StudentProfiles/{studentProfileId}/PendingTasks` |

## Example

```bash
absuite learning course-articles list --top 5 -o json --query "[].id"
absuite learning course-articles create --title <value> --description <value> --dry-run   # prints the POST, sends nothing
absuite learning course-articles create --title <value> --description <value> -o json --no-input
```
