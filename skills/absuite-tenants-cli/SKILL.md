---
name: absuite-tenants-cli
description: >
  Manage tenant configuration in the Alliance Business Suite (ABS) using the `absuite` CLI.
  The largest service — covers tenant CRUD, departments, enrollments (standard, extended,
  employee), industries, invitations, options, positions, segments, sizes, teams, team
  records, team contact/project enrollments, territories, types, units, unit groups,
  licenses, notifications, web portals, avatars, carts, wallets, and social profiles — via
  list/count/get/create/update/delete commands and service actions. Requires an
  authenticated CLI session (see absuite-login-cli). For atomic PATCH updates or raw HTTP,
  use the absuite-tenants (REST) skill.
---

# Alliance Business Suite — Tenants Skill (CLI)

Manage tenant configuration through the `absuite` CLI's `tenants` service. This is the most
comprehensive service in the platform. Most operations are tenant-scoped and require an
authenticated session. The CLI does not support PATCH (JSON Patch) — for partial atomic
updates use the `absuite-tenants` REST skill.

## API usage essentials

> Full detail in `absuite-cli`.

- **`update` replaces the ENTIRE object** (it maps to HTTP `PUT`) — a full overwrite, not a merge. **`get` the entity first, change only what you need on the complete object, then `update` with the full body.** A partial `update` (or an incomplete `create`) blanks the omitted fields -> silent data loss.
- **No atomic partial update in the CLI.** For a safe single-field change, use the `absuite-tenants` REST skill's `PATCH` (JSON Patch), where that service exposes one.
- Use **`count <entity>`** (a dedicated operation) to size a collection. OData filtering/paging (`$filter`, `$top`, ...) is REST-only — the CLI does not expose it; use `absuite-tenants` for filtered queries or a filtered count.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general CLI
   usage and configuration, see `absuite-cli`.
2. **Set your tenant** — most tenant sub-resource commands require a tenant. Either set a
   default:
   ```powershell
   absuite config set --tenant-id <tenant-guid>
   ```
   …and reference it as `$TENANT_ID`, or pass `--TenantId <tenant-guid>` on each call.
   A few commands take **no** tenant (create tenant, root tenant, deselect, accept/decline
   invitation) — see the notes below.
3. **Discover commands:**
   ```powershell
   absuite tenants list-commands
   absuite tenants create tenant --help
   ```
4. **To stand up a brand-new tenant and initialize its portal end to end,** see
   `absuite-onboarding-cli`.

## Command Structure

```
absuite tenants <verb> <entity> --Param value
```

- **Verbs:** `list`, `count`, `get`, `create`, `update`, `delete`, plus service actions
  (`select`, `deselect`, `send`, `accept`, `decline`, `assign`, `revoke`, `validate`,
  `check`, `upsert`).
- The canonical PowerShell function-name form also works as the command, e.g.
  `absuite tenants New-TenantDepartment --TenantId <tenant-guid> --TenantDepartmentCreateDto '{...}'`
  is equivalent to `absuite tenants create department ...`. The function names map to
  PowerShell-approved verbs: create → `New-…`, get/list/count → `Get-…`, update → `Update-…`,
  delete → `Invoke-Delete…`, send invitation → `Send-TenantInvitation`, accept invitation →
  `Receive-TenantInvitation`, decline invitation → `Invoke-DeclineTenantInvitation`, select →
  `Select-TenantAsync`, deselect → `Invoke-DeSelectTenantAsync`, assign license →
  `Set-LicenseAsync`, revoke license → `Revoke-LicenseAsync`, validate feature →
  `Confirm-EnrollmentFeatureAccess`, validate permissions → `Confirm-EnrollmentPermissionsAsync`,
  upsert option → `Invoke-UpsertTenantOption`.
- **JSON DTO params** are passed as a single-quoted JSON string (`--<Dto> '{...}'`) using the
  **same PascalCase field names** as the REST API DTOs.

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

## Tenant CRUD

```powershell
# Create a tenant (NO --TenantId — there is no tenant yet)
absuite tenants create tenant --TenantCreateDto '{
  "Name": "New Venture",
  "LegalName": "New Venture Inc.",
  "Email": "info@example.com",
  "Phone": "+1-555-0100",
  "WebUrl": "https://example.com",
  "Handler": "new-venture",
  "About": "A new business venture",
  "Slogan": "Innovation first",
  "CurrencyId": "<currency-guid>",
  "CountryId": "<country-id>",
  "BusinessTypeId": "<type-guid>",
  "BusinessIndustryId": "<industry-guid>",
  "BusinessSizeId": "<size-guid>",
  "BusinessSegmentId": "<segment-guid>"
}'

# Get a tenant by ID
absuite tenants get tenant --TenantId $TENANT_ID

# Get the EXTENDED tenant profile
absuite tenants get extended-tenant --TenantId $TENANT_ID

# Update a tenant (full replace)
absuite tenants update tenant --TenantId $TENANT_ID --TenantUpdateDto '{
  "Name": "My Business",
  "LegalName": "My Business LLC",
  "Email": "admin@example.com",
  "CurrencyId": "<currency-guid>",
  "CountryId": "<country-id>",
  "LinkedInUrl": "https://www.linkedin.com/company/example",
  "SupportPhoneNumber": "+1-555-0199"
}'

# Delete a tenant
absuite tenants delete tenant --TenantId $TENANT_ID
```

`TenantCreateDto` fields: `Id`, `Timestamp`, `Name` (REQ), `LegalName`, `Email` (REQ),
`Phone`, `WebUrl`, `Handler`, `About`, `Slogan`, `CurrencyId` (REQ), `Duns`, `TaxId`,
`AvatarUrl`, `CountryId` (REQ), `StateId`, `CityId`, `LanguageId`, `TimezoneId`,
`BusinessTypeId`, `BusinessSegmentId`, `BusinessIndustryId`, `BusinessSizeId`.

`TenantUpdateDto` fields: `Name` (REQ), `LegalName`, `Email` (REQ), `Phone`, `WebUrl`,
`About`, `Slogan`, `Handler`, `CurrencyId` (REQ), `Duns`, `TaxId`, `AvatarUrl`,
`TwitterUsername`, `FacebookUrl`, `TwitterUrl`, `GitHubUrl`, `LinkedInUrl`, `InstagramUrl`,
`YouTubeUrl`, `WhatsAppNumber`, `SupportPhoneNumber`, `CountryId` (REQ), `TimezoneId`,
`LanguageId`, `StateId`, `CityId`.

## Current / Root / Select / Deselect

```powershell
# Current default tenant (requires --TenantId — returns that tenant's profile)
absuite tenants get current-tenant --TenantId $TENANT_ID

# Root tenant of the platform (NO --TenantId)
absuite tenants get root-tenant

# Select a tenant as the user's default
absuite tenants select tenant --TenantId $TENANT_ID

# Deselect the user's default tenant (NO --TenantId)
absuite tenants deselect tenant
```

## Tenant-Level Resources

```powershell
# Avatar (read) / Cart / Wallet / Social profile / Users / Web portals / Licenses
absuite tenants get avatar --TenantId $TENANT_ID
absuite tenants get cart --TenantId $TENANT_ID
absuite tenants get wallet --TenantId $TENANT_ID
absuite tenants get social-profile --TenantId $TENANT_ID
absuite tenants list users --TenantId $TENANT_ID
absuite tenants list web-portals --TenantId $TENANT_ID
absuite tenants list licenses --TenantId $TENANT_ID

# Notifications (list + count only)
absuite tenants list notifications --TenantId $TENANT_ID
absuite tenants count notifications --TenantId $TENANT_ID
```

> The avatar **update** is a multipart file upload — use the `absuite-tenants` REST skill for
> that (`POST /Tenants/{tenantId}/Avatar`).

## Enrollments

```powershell
# Flat enrollments
absuite tenants list enrollments --TenantId $TENANT_ID
absuite tenants count enrollments --TenantId $TENANT_ID
absuite tenants list extended-enrollments --TenantId $TENANT_ID
absuite tenants count extended-enrollments --TenantId $TENANT_ID

# Get by ID (this read also requires --UserId)
absuite tenants get enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --UserId <user-guid>

# Create / update / delete
absuite tenants create enrollment --TenantId $TENANT_ID --TenantEnrollmentCreateDto '{
  "UserId": "<user-guid>"
}'
absuite tenants update enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --TenantEnrollmentUpdateDto '{
  "IsAdmin": true,
  "IsDisabled": false
}'
absuite tenants delete enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>

# Tenant-scoped enrollment reads (resolved from the tenant path on the API)
absuite tenants list tenant-enrollments --TenantId $TENANT_ID
absuite tenants get tenant-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>
absuite tenants get extended-tenant-enrollment --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>
```

`TenantEnrollmentCreateDto`: `Id`, `Timestamp`, `UserId`.
`TenantEnrollmentUpdateDto`: `IsAdmin`, `IsDisabled`.

### Enrollment features, licenses & permissions

```powershell
# Features accessible to an enrollment
absuite tenants list enrollment-features --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>

# Validate access to a specific feature (optional --Feature)
absuite tenants validate enrollment-feature-access --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --Feature <feature-key>

# Enrollment licenses
absuite tenants list enrollment-licenses --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>
absuite tenants get enrollment-license --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --LicenseId <license-guid>
absuite tenants assign enrollment-license --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --LicenseId <license-guid>
absuite tenants revoke enrollment-license --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --LicenseId <license-guid>

# Enrollment permissions
absuite tenants list enrollment-permissions --TenantId $TENANT_ID --EnrollmentId <enrollment-guid>
absuite tenants validate enrollment-permissions --TenantId $TENANT_ID --EnrollmentId <enrollment-guid> --Roles <role> --Permissions <permission>
```

## Employee Enrollments

```powershell
absuite tenants list employee-enrollments --TenantId $TENANT_ID
absuite tenants count employee-enrollments --TenantId $TENANT_ID
absuite tenants get employee-enrollment --TenantId $TENANT_ID --TenantEmployeeEnrollmentId <ee-guid>
absuite tenants create employee-enrollment --TenantId $TENANT_ID --TenantTeamEmployeeEnrollmentCreateDto '{
  "BusinessTeamId": "<team-guid>",
  "EmployeeProfileId": "<employee-profile-guid>"
}'
absuite tenants update employee-enrollment --TenantId $TENANT_ID --TenantEmployeeEnrollmentId <ee-guid> --TenantTeamEmployeeEnrollmentUpdateDto '{
  "BusinessTeamId": "<team-guid>",
  "EmployeeProfileId": "<employee-profile-guid>"
}'
absuite tenants delete employee-enrollment --TenantId $TENANT_ID --TenantEmployeeEnrollmentId <ee-guid>
```

`TenantTeamEmployeeEnrollmentCreateDto`: `Id`, `Timestamp`, `BusinessTeamId` (REQ),
`EmployeeProfileId` (REQ). Update DTO: `BusinessTeamId`, `EmployeeProfileId`.

## Invitations

```powershell
# List / count issued invitations
absuite tenants list invitations --TenantId $TENANT_ID
absuite tenants count invitations --TenantId $TENANT_ID

# Send (only UserEmail is required)
absuite tenants send invitation --TenantId $TENANT_ID --TenantInvitationCreateDto '{
  "UserEmail": "newmember@example.com"
}'

# Get / delete (revoke)
absuite tenants get invitation --TenantId $TENANT_ID --InvitationId <invitation-guid>
absuite tenants delete invitation --TenantId $TENANT_ID --InvitationId <invitation-guid>

# Accept / decline — NO --TenantId (scoped by InvitationId, acts as the current user)
absuite tenants accept invitation --InvitationId <invitation-guid>
absuite tenants decline invitation --InvitationId <invitation-guid>
```

> The accept command maps to the SDK function `Receive-TenantInvitation --InvitationId <guid>`;
> decline maps to `Invoke-DeclineTenantInvitation --InvitationId <guid>`.

### Invitation status filters (tenant-scoped reads)

```powershell
absuite tenants list tenant-invitations --TenantId $TENANT_ID
absuite tenants list pending-invitations --TenantId $TENANT_ID
absuite tenants list redeemed-invitations --TenantId $TENANT_ID
absuite tenants list revoked-invitations --TenantId $TENANT_ID
```

`TenantInvitationCreateDto`: `Id`, `Timestamp`, `UserEmail` (REQ).

## Options (key/value configuration)

```powershell
absuite tenants list options --TenantId $TENANT_ID
absuite tenants count options --TenantId $TENANT_ID
absuite tenants get option --TenantId $TENANT_ID --OptionId <option-guid>
absuite tenants get option-by-key --TenantId $TENANT_ID --Key "feature.new-ui-enabled"

# Create (the API requires Key both as --Key and in the body)
absuite tenants create option --TenantId $TENANT_ID --Key "feature.new-ui-enabled" --OptionCreateDto '{
  "Key": "feature.new-ui-enabled",
  "Value": "true",
  "Autoload": true
}'

# Update by ID
absuite tenants update option --TenantId $TENANT_ID --OptionId <option-guid> --OptionUpdateDto '{
  "Key": "feature.new-ui-enabled",
  "Value": "false"
}'

# Upsert by key (idempotent create-or-update)
absuite tenants upsert option --TenantId $TENANT_ID --Key "feature.new-ui-enabled" --OptionUpdateDto '{
  "Value": "false"
}'

# Delete by ID
absuite tenants delete option --TenantId $TENANT_ID --OptionId <option-guid>
```

`OptionCreateDto`: `Id`, `Timestamp`, `Key` (REQ), `Value` (REQ), `PortalId`, `Frozen`,
`Autoload`, `Transient`, `Expiration`. `OptionUpdateDto` is the same minus `Id`/`Timestamp`.

## Departments

```powershell
absuite tenants list departments --TenantId $TENANT_ID
absuite tenants count departments --TenantId $TENANT_ID
absuite tenants get department --TenantId $TENANT_ID --TenantDepartmentId <department-guid>
absuite tenants create department --TenantId $TENANT_ID --TenantDepartmentCreateDto '{
  "Name": "Engineering",
  "Description": "Software engineering department",
  "Disabled": false,
  "ParentDepartmentId": "<parent-guid>"
}'
absuite tenants update department --TenantId $TENANT_ID --TenantDepartmentId <department-guid> --TenantDepartmentUpdateDto '{
  "Name": "Platform Engineering",
  "Description": "Platform team",
  "Disabled": false
}'
absuite tenants delete department --TenantId $TENANT_ID --TenantDepartmentId <department-guid>
```

`TenantDepartmentCreateDto`: `Id`, `Timestamp`, `Name`, `Description`, `Disabled`,
`OrganizationProfileId`, `ParentDepartmentId`. Update DTO drops `Id`/`Timestamp`.

## Positions

```powershell
absuite tenants list positions --TenantId $TENANT_ID
absuite tenants count positions --TenantId $TENANT_ID
absuite tenants get position --TenantId $TENANT_ID --TenantPositionId <position-guid>
absuite tenants create position --TenantId $TENANT_ID --TenantPositionCreateDto '{
  "Title": "Senior Engineer",
  "Description": "Senior software engineering role",
  "Type": "<position-type>"
}'
absuite tenants update position --TenantId $TENANT_ID --TenantPositionId <position-guid> --TenantPositionUpdateDto '{
  "Title": "Staff Engineer",
  "Description": "Staff role"
}'
absuite tenants delete position --TenantId $TENANT_ID --TenantPositionId <position-guid>
```

`TenantPositionCreateDto`: `Id`, `Timestamp`, `Title`, `Description`, `Type`. Update DTO:
`Title`, `Description`, `Type`.

## Teams

```powershell
absuite tenants list teams --TenantId $TENANT_ID
absuite tenants count teams --TenantId $TENANT_ID
absuite tenants get team --TenantId $TENANT_ID --TenantTeamId <team-guid>
absuite tenants create team --TenantId $TENANT_ID --TenantTeamCreateDto '{
  "Name": "Platform Team",
  "Description": "Platform engineering team",
  "IsPublic": false,
  "BusinessUnitId": "<unit-guid>"
}'
absuite tenants update team --TenantId $TENANT_ID --TenantTeamId <team-guid> --TenantTeamUpdateDto '{
  "Name": "Platform Team",
  "Description": "Updated",
  "IsPublic": true
}'
absuite tenants delete team --TenantId $TENANT_ID --TenantTeamId <team-guid>
```

`TenantTeamCreateDto`: `Id`, `Timestamp`, `Name`, `Description`, `AvatarUrl`, `IsPublic`,
`BusinessUnitId`, `OrganizationProfileId`. Update DTO drops `Id`/`Timestamp`.

### Team records, contact enrollments, project enrollments

```powershell
# Team records
absuite tenants list team-records --TenantId $TENANT_ID
absuite tenants count team-records --TenantId $TENANT_ID
absuite tenants get team-record --TenantId $TENANT_ID --TenantTeamRecordId <record-guid>
absuite tenants create team-record --TenantId $TENANT_ID --TenantTeamRecordCreateDto '{
  "BusinessTeamId": "<team-guid>"
}'
absuite tenants update team-record --TenantId $TENANT_ID --TenantTeamRecordId <record-guid> --TenantTeamRecordUpdateDto '{
  "BusinessTeamId": "<team-guid>"
}'
absuite tenants delete team-record --TenantId $TENANT_ID --TenantTeamRecordId <record-guid>

# Team contact enrollments
absuite tenants list team-contact-enrollments --TenantId $TENANT_ID
absuite tenants count team-contact-enrollments --TenantId $TENANT_ID
absuite tenants get team-contact-enrollment --TenantId $TENANT_ID --TenantTeamContactEnrollmentId <tce-guid>
absuite tenants create team-contact-enrollment --TenantId $TENANT_ID --TenantTeamContactEnrollmentCreateDto '{
  "BusinessTeamId": "<team-guid>",
  "ContactId": "<contact-guid>"
}'
absuite tenants update team-contact-enrollment --TenantId $TENANT_ID --TenantTeamContactEnrollmentId <tce-guid> --TenantTeamContactEnrollmentUpdateDto '{
  "BusinessTeamId": "<team-guid>",
  "ContactId": "<contact-guid>"
}'
absuite tenants delete team-contact-enrollment --TenantId $TENANT_ID --TenantTeamContactEnrollmentId <tce-guid>

# Team project enrollments
absuite tenants list team-project-enrollments --TenantId $TENANT_ID
absuite tenants count team-project-enrollments --TenantId $TENANT_ID
absuite tenants get team-project-enrollment --TenantId $TENANT_ID --TenantTeamProjectEnrollmentId <tpe-guid>
absuite tenants create team-project-enrollment --TenantId $TENANT_ID --TenantTeamProjectEnrollmentCreateDto '{
  "BusinessTeamId": "<team-guid>",
  "ProjectId": "<project-guid>"
}'
absuite tenants update team-project-enrollment --TenantId $TENANT_ID --TenantTeamProjectEnrollmentId <tpe-guid> --TenantTeamProjectEnrollmentUpdateDto '{
  "BusinessTeamId": "<team-guid>",
  "ProjectId": "<project-guid>"
}'
absuite tenants delete team-project-enrollment --TenantId $TENANT_ID --TenantTeamProjectEnrollmentId <tpe-guid>
```

`TenantTeamRecordCreateDto`: `Id`, `Timestamp`, `BusinessTeamId` (REQ); update: `BusinessTeamId`.
`TenantTeamContactEnrollmentCreateDto`: `Id`, `Timestamp`, `BusinessTeamId` (REQ),
`ContactId` (REQ); update: `BusinessTeamId`, `ContactId`.
`TenantTeamProjectEnrollmentCreateDto`: `Id`, `Timestamp`, `BusinessTeamId` (REQ),
`ProjectId` (REQ); update: `BusinessTeamId`, `ProjectId`.

## Territories

```powershell
absuite tenants list territories --TenantId $TENANT_ID
absuite tenants count territories --TenantId $TENANT_ID
absuite tenants get territory --TenantId $TENANT_ID --TenantTerritoryId <territory-guid>
absuite tenants create territory --TenantId $TENANT_ID --TenantTerritoryCreateDto '{
  "Name": "North America",
  "Description": "North American sales territory",
  "ParentTerritoryId": "<parent-guid>"
}'
absuite tenants update territory --TenantId $TENANT_ID --TenantTerritoryId <territory-guid> --TenantTerritoryUpdateDto '{
  "Name": "EMEA",
  "Description": "Europe/MEA"
}'
absuite tenants delete territory --TenantId $TENANT_ID --TenantTerritoryId <territory-guid>
```

`TenantTerritoryCreateDto`: `Id`, `Timestamp`, `Name`, `Description`, `ParentTerritoryId`.
Update DTO drops `Id`/`Timestamp`.

## Taxonomy: Industries, Segments, Sizes, Types

```powershell
# Industries
absuite tenants list industries --TenantId $TENANT_ID
absuite tenants count industries --TenantId $TENANT_ID
absuite tenants get industry --TenantId $TENANT_ID --TenantIndustryId <industry-guid>
absuite tenants create industry --TenantId $TENANT_ID --TenantIndustryCreateDto '{
  "Name": "Software",
  "ParentBusinessIndustryId": "<parent-guid>"
}'
absuite tenants update industry --TenantId $TENANT_ID --TenantIndustryId <industry-guid> --TenantIndustryUpdateDto '{ "Name": "SaaS" }'
absuite tenants delete industry --TenantId $TENANT_ID --TenantIndustryId <industry-guid>

# Segments (employee-count band)
absuite tenants create segment --TenantId $TENANT_ID --TenantSegmentCreateDto '{
  "MinEmployees": 50,
  "MaxEmployees": 250
}'

# Sizes (employee range)
absuite tenants create size --TenantId $TENANT_ID --TenantSizeCreateDto '{
  "EmployeeLowRangeValue": 1,
  "EmployeeHighRangeValue": 50
}'

# Types
absuite tenants create type --TenantId $TENANT_ID --TenantTypeCreateDto '{
  "Name": "LLC",
  "Description": "Limited liability company"
}'
```

All four expose `list / count / get / create / update / delete`. Id params:
`--TenantIndustryId`, `--TenantSegmentId`, `--TenantSizeId`, `--TenantTypeId`. DTO fields:

- `TenantIndustryCreateDto`: `Id`, `Timestamp`, `Name`, `ParentBusinessIndustryId`
  (update: `Name`, `ParentBusinessIndustryId`).
- `TenantSegmentCreateDto`: `Id`, `Timestamp`, `MinEmployees`, `MaxEmployees`
  (update: `MinEmployees`, `MaxEmployees`).
- `TenantSizeCreateDto`: `Id`, `Timestamp`, `EmployeeLowRangeValue`, `EmployeeHighRangeValue`
  (update: same two).
- `TenantTypeCreateDto`: `Id`, `Timestamp`, `Name`, `Description`
  (update: `Name`, `Description`).

## Units & Unit Groups

```powershell
# Flat tenant units
absuite tenants list units --TenantId $TENANT_ID
absuite tenants count units --TenantId $TENANT_ID
absuite tenants get unit --TenantId $TENANT_ID --TenantUnitId <unit-guid>
absuite tenants create unit --TenantId $TENANT_ID --TenantUnitCreateDto '{
  "Name": "Kilogram",
  "Description": "Mass unit",
  "Disabled": false,
  "CountryId": "<country-id>"
}'
absuite tenants update unit --TenantId $TENANT_ID --TenantUnitId <unit-guid> --TenantUnitUpdateDto '{
  "Name": "Kilogram",
  "Disabled": false
}'
absuite tenants delete unit --TenantId $TENANT_ID --TenantUnitId <unit-guid>

# Unit groups
absuite tenants list unit-groups --TenantId $TENANT_ID
absuite tenants count unit-groups --TenantId $TENANT_ID
absuite tenants get unit-group --TenantId $TENANT_ID --UnitGroupId <group-guid>
absuite tenants create unit-group --TenantId $TENANT_ID --UnitGroupCreateDto '{
  "Name": "Mass",
  "Description": "Units of mass"
}'
absuite tenants update unit-group --TenantId $TENANT_ID --UnitGroupId <group-guid> --UnitGroupUpdateDto '{
  "Name": "Mass",
  "Description": "SI mass units"
}'
absuite tenants delete unit-group --TenantId $TENANT_ID --UnitGroupId <group-guid>

# Units WITHIN a unit group
absuite tenants list group-units --TenantId $TENANT_ID --UnitGroupId <group-guid>
absuite tenants count group-units --TenantId $TENANT_ID --UnitGroupId <group-guid>
absuite tenants get group-unit --TenantId $TENANT_ID --UnitGroupId <group-guid> --UnitId <unit-guid>
absuite tenants create group-unit --TenantId $TENANT_ID --UnitGroupId <group-guid> --UnitCreateDto '{
  "Name": "Gram",
  "BaseUnitAmount": 0.001,
  "BaseUnitId": "<base-unit-guid>"
}'
absuite tenants update group-unit --TenantId $TENANT_ID --UnitGroupId <group-guid> --UnitId <unit-guid> --UnitUpdateDto '{
  "Name": "Gram",
  "BaseUnitAmount": 0.001,
  "BaseUnitId": "<base-unit-guid>"
}'
absuite tenants delete group-unit --TenantId $TENANT_ID --UnitGroupId <group-guid> --UnitId <unit-guid>
```

DTO fields:
- `TenantUnitCreateDto` (flat): `Id`, `Timestamp`, `Name`, `Description`, `Disabled`,
  `CountryId`, `OrganizationProfileId`, `ParentBusinessUnitId` (update drops `Id`/`Timestamp`).
- `UnitGroupCreateDto`: `Id`, `Timestamp`, `Name` (REQ), `Description`
  (update: `Name`, `Description`).
- `UnitCreateDto` (in-group): `Id`, `Timestamp`, `Name` (REQ), `BaseUnitAmount`, `BaseUnitId`
  (update: `Name`, `BaseUnitAmount`, `BaseUnitId`).

## End-to-End Workflow: stand up a tenant's org structure

```powershell
# 1. Create the tenant (no --TenantId; note the returned tenant id)
absuite tenants create tenant --TenantCreateDto '{
  "Name": "Acme Co", "Email": "ops@example.com", "CurrencyId": "<currency-guid>", "CountryId": "<country-id>"
}'

# 2. Select it as the active tenant
absuite tenants select tenant --TenantId <tenant-guid>

# 3. Create a department
absuite tenants create department --TenantId <tenant-guid> --TenantDepartmentCreateDto '{ "Name": "Engineering" }'

# 4. Create a team
absuite tenants create team --TenantId <tenant-guid> --TenantTeamCreateDto '{ "Name": "Platform Team", "IsPublic": false }'

# 5. Invite a member
absuite tenants send invitation --TenantId <tenant-guid> --TenantInvitationCreateDto '{ "UserEmail": "newmember@example.com" }'

# 6. The invited user accepts (NO --TenantId)
absuite tenants accept invitation --InvitationId <invitation-guid>

# 7. Set a tenant option (idempotent upsert by key)
absuite tenants upsert option --TenantId <tenant-guid> --Key "feature.new-ui-enabled" --OptionUpdateDto '{ "Value": "true" }'

# 8. Verify the tenant
absuite tenants get extended-tenant --TenantId <tenant-guid>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| Create tenant | `absuite tenants create tenant --TenantCreateDto '{...}'` |
| Get tenant | `absuite tenants get tenant --TenantId <tenant-guid>` |
| Get extended tenant | `absuite tenants get extended-tenant --TenantId <tenant-guid>` |
| Update tenant | `absuite tenants update tenant --TenantId <tenant-guid> --TenantUpdateDto '{...}'` |
| Delete tenant | `absuite tenants delete tenant --TenantId <tenant-guid>` |
| Get current tenant | `absuite tenants get current-tenant --TenantId <tenant-guid>` |
| Get root tenant | `absuite tenants get root-tenant` |
| Select tenant | `absuite tenants select tenant --TenantId <tenant-guid>` |
| Deselect tenant | `absuite tenants deselect tenant` |
| Get avatar | `absuite tenants get avatar --TenantId <tenant-guid>` |
| Get cart | `absuite tenants get cart --TenantId <tenant-guid>` |
| Get wallet | `absuite tenants get wallet --TenantId <tenant-guid>` |
| Get social profile | `absuite tenants get social-profile --TenantId <tenant-guid>` |
| List users | `absuite tenants list users --TenantId <tenant-guid>` |
| List web portals | `absuite tenants list web-portals --TenantId <tenant-guid>` |
| List tenant licenses | `absuite tenants list licenses --TenantId <tenant-guid>` |
| List notifications | `absuite tenants list notifications --TenantId <tenant-guid>` |
| Count notifications | `absuite tenants count notifications --TenantId <tenant-guid>` |
| List enrollments | `absuite tenants list enrollments --TenantId <tenant-guid>` |
| Count enrollments | `absuite tenants count enrollments --TenantId <tenant-guid>` |
| List extended enrollments | `absuite tenants list extended-enrollments --TenantId <tenant-guid>` |
| Count extended enrollments | `absuite tenants count extended-enrollments --TenantId <tenant-guid>` |
| Get enrollment | `absuite tenants get enrollment --TenantId <tenant-guid> --EnrollmentId <enrollment-guid> --UserId <user-guid>` |
| Create enrollment | `absuite tenants create enrollment --TenantId <tenant-guid> --TenantEnrollmentCreateDto '{...}'` |
| Update enrollment | `absuite tenants update enrollment --TenantId <tenant-guid> --EnrollmentId <enrollment-guid> --TenantEnrollmentUpdateDto '{...}'` |
| Delete enrollment | `absuite tenants delete enrollment --TenantId <tenant-guid> --EnrollmentId <enrollment-guid>` |
| List enrollment features | `absuite tenants list enrollment-features --TenantId <tenant-guid> --EnrollmentId <enrollment-guid>` |
| Validate feature access | `absuite tenants validate enrollment-feature-access --TenantId <tenant-guid> --EnrollmentId <enrollment-guid> --Feature <feature-key>` |
| List enrollment licenses | `absuite tenants list enrollment-licenses --TenantId <tenant-guid> --EnrollmentId <enrollment-guid>` |
| Get enrollment license | `absuite tenants get enrollment-license --TenantId <tenant-guid> --EnrollmentId <enrollment-guid> --LicenseId <license-guid>` |
| Assign license | `absuite tenants assign enrollment-license --TenantId <tenant-guid> --EnrollmentId <enrollment-guid> --LicenseId <license-guid>` |
| Revoke license | `absuite tenants revoke enrollment-license --TenantId <tenant-guid> --EnrollmentId <enrollment-guid> --LicenseId <license-guid>` |
| List enrollment permissions | `absuite tenants list enrollment-permissions --TenantId <tenant-guid> --EnrollmentId <enrollment-guid>` |
| Validate permissions | `absuite tenants validate enrollment-permissions --TenantId <tenant-guid> --EnrollmentId <enrollment-guid>` |
| List employee enrollments | `absuite tenants list employee-enrollments --TenantId <tenant-guid>` |
| Count employee enrollments | `absuite tenants count employee-enrollments --TenantId <tenant-guid>` |
| Get employee enrollment | `absuite tenants get employee-enrollment --TenantId <tenant-guid> --TenantEmployeeEnrollmentId <ee-guid>` |
| Create employee enrollment | `absuite tenants create employee-enrollment --TenantId <tenant-guid> --TenantTeamEmployeeEnrollmentCreateDto '{...}'` |
| Update employee enrollment | `absuite tenants update employee-enrollment --TenantId <tenant-guid> --TenantEmployeeEnrollmentId <ee-guid> --TenantTeamEmployeeEnrollmentUpdateDto '{...}'` |
| Delete employee enrollment | `absuite tenants delete employee-enrollment --TenantId <tenant-guid> --TenantEmployeeEnrollmentId <ee-guid>` |
| List invitations | `absuite tenants list invitations --TenantId <tenant-guid>` |
| Count invitations | `absuite tenants count invitations --TenantId <tenant-guid>` |
| Send invitation | `absuite tenants send invitation --TenantId <tenant-guid> --TenantInvitationCreateDto '{...}'` |
| Get invitation | `absuite tenants get invitation --TenantId <tenant-guid> --InvitationId <invitation-guid>` |
| Delete (revoke) invitation | `absuite tenants delete invitation --TenantId <tenant-guid> --InvitationId <invitation-guid>` |
| Accept invitation | `absuite tenants accept invitation --InvitationId <invitation-guid>` |
| Decline invitation | `absuite tenants decline invitation --InvitationId <invitation-guid>` |
| List pending invitations | `absuite tenants list pending-invitations --TenantId <tenant-guid>` |
| List redeemed invitations | `absuite tenants list redeemed-invitations --TenantId <tenant-guid>` |
| List revoked invitations | `absuite tenants list revoked-invitations --TenantId <tenant-guid>` |
| List options | `absuite tenants list options --TenantId <tenant-guid>` |
| Count options | `absuite tenants count options --TenantId <tenant-guid>` |
| Get option | `absuite tenants get option --TenantId <tenant-guid> --OptionId <option-guid>` |
| Get option by key | `absuite tenants get option-by-key --TenantId <tenant-guid> --Key <key>` |
| Create option | `absuite tenants create option --TenantId <tenant-guid> --Key <key> --OptionCreateDto '{...}'` |
| Update option | `absuite tenants update option --TenantId <tenant-guid> --OptionId <option-guid> --OptionUpdateDto '{...}'` |
| Upsert option | `absuite tenants upsert option --TenantId <tenant-guid> --Key <key> --OptionUpdateDto '{...}'` |
| Delete option | `absuite tenants delete option --TenantId <tenant-guid> --OptionId <option-guid>` |
| List departments | `absuite tenants list departments --TenantId <tenant-guid>` |
| Count departments | `absuite tenants count departments --TenantId <tenant-guid>` |
| Get department | `absuite tenants get department --TenantId <tenant-guid> --TenantDepartmentId <department-guid>` |
| Create department | `absuite tenants create department --TenantId <tenant-guid> --TenantDepartmentCreateDto '{...}'` |
| Update department | `absuite tenants update department --TenantId <tenant-guid> --TenantDepartmentId <department-guid> --TenantDepartmentUpdateDto '{...}'` |
| Delete department | `absuite tenants delete department --TenantId <tenant-guid> --TenantDepartmentId <department-guid>` |
| List positions | `absuite tenants list positions --TenantId <tenant-guid>` |
| Count positions | `absuite tenants count positions --TenantId <tenant-guid>` |
| Get position | `absuite tenants get position --TenantId <tenant-guid> --TenantPositionId <position-guid>` |
| Create position | `absuite tenants create position --TenantId <tenant-guid> --TenantPositionCreateDto '{...}'` |
| Update position | `absuite tenants update position --TenantId <tenant-guid> --TenantPositionId <position-guid> --TenantPositionUpdateDto '{...}'` |
| Delete position | `absuite tenants delete position --TenantId <tenant-guid> --TenantPositionId <position-guid>` |
| List teams | `absuite tenants list teams --TenantId <tenant-guid>` |
| Count teams | `absuite tenants count teams --TenantId <tenant-guid>` |
| Get team | `absuite tenants get team --TenantId <tenant-guid> --TenantTeamId <team-guid>` |
| Create team | `absuite tenants create team --TenantId <tenant-guid> --TenantTeamCreateDto '{...}'` |
| Update team | `absuite tenants update team --TenantId <tenant-guid> --TenantTeamId <team-guid> --TenantTeamUpdateDto '{...}'` |
| Delete team | `absuite tenants delete team --TenantId <tenant-guid> --TenantTeamId <team-guid>` |
| List team records | `absuite tenants list team-records --TenantId <tenant-guid>` |
| Count team records | `absuite tenants count team-records --TenantId <tenant-guid>` |
| Get team record | `absuite tenants get team-record --TenantId <tenant-guid> --TenantTeamRecordId <record-guid>` |
| Create team record | `absuite tenants create team-record --TenantId <tenant-guid> --TenantTeamRecordCreateDto '{...}'` |
| Update team record | `absuite tenants update team-record --TenantId <tenant-guid> --TenantTeamRecordId <record-guid> --TenantTeamRecordUpdateDto '{...}'` |
| Delete team record | `absuite tenants delete team-record --TenantId <tenant-guid> --TenantTeamRecordId <record-guid>` |
| List team contact enrollments | `absuite tenants list team-contact-enrollments --TenantId <tenant-guid>` |
| Count team contact enrollments | `absuite tenants count team-contact-enrollments --TenantId <tenant-guid>` |
| Get team contact enrollment | `absuite tenants get team-contact-enrollment --TenantId <tenant-guid> --TenantTeamContactEnrollmentId <tce-guid>` |
| Create team contact enrollment | `absuite tenants create team-contact-enrollment --TenantId <tenant-guid> --TenantTeamContactEnrollmentCreateDto '{...}'` |
| Update team contact enrollment | `absuite tenants update team-contact-enrollment --TenantId <tenant-guid> --TenantTeamContactEnrollmentId <tce-guid> --TenantTeamContactEnrollmentUpdateDto '{...}'` |
| Delete team contact enrollment | `absuite tenants delete team-contact-enrollment --TenantId <tenant-guid> --TenantTeamContactEnrollmentId <tce-guid>` |
| List team project enrollments | `absuite tenants list team-project-enrollments --TenantId <tenant-guid>` |
| Count team project enrollments | `absuite tenants count team-project-enrollments --TenantId <tenant-guid>` |
| Get team project enrollment | `absuite tenants get team-project-enrollment --TenantId <tenant-guid> --TenantTeamProjectEnrollmentId <tpe-guid>` |
| Create team project enrollment | `absuite tenants create team-project-enrollment --TenantId <tenant-guid> --TenantTeamProjectEnrollmentCreateDto '{...}'` |
| Update team project enrollment | `absuite tenants update team-project-enrollment --TenantId <tenant-guid> --TenantTeamProjectEnrollmentId <tpe-guid> --TenantTeamProjectEnrollmentUpdateDto '{...}'` |
| Delete team project enrollment | `absuite tenants delete team-project-enrollment --TenantId <tenant-guid> --TenantTeamProjectEnrollmentId <tpe-guid>` |
| List territories | `absuite tenants list territories --TenantId <tenant-guid>` |
| Count territories | `absuite tenants count territories --TenantId <tenant-guid>` |
| Get territory | `absuite tenants get territory --TenantId <tenant-guid> --TenantTerritoryId <territory-guid>` |
| Create territory | `absuite tenants create territory --TenantId <tenant-guid> --TenantTerritoryCreateDto '{...}'` |
| Update territory | `absuite tenants update territory --TenantId <tenant-guid> --TenantTerritoryId <territory-guid> --TenantTerritoryUpdateDto '{...}'` |
| Delete territory | `absuite tenants delete territory --TenantId <tenant-guid> --TenantTerritoryId <territory-guid>` |
| List industries | `absuite tenants list industries --TenantId <tenant-guid>` |
| Count industries | `absuite tenants count industries --TenantId <tenant-guid>` |
| Get industry | `absuite tenants get industry --TenantId <tenant-guid> --TenantIndustryId <industry-guid>` |
| Create industry | `absuite tenants create industry --TenantId <tenant-guid> --TenantIndustryCreateDto '{...}'` |
| Update industry | `absuite tenants update industry --TenantId <tenant-guid> --TenantIndustryId <industry-guid> --TenantIndustryUpdateDto '{...}'` |
| Delete industry | `absuite tenants delete industry --TenantId <tenant-guid> --TenantIndustryId <industry-guid>` |
| List segments | `absuite tenants list segments --TenantId <tenant-guid>` |
| Count segments | `absuite tenants count segments --TenantId <tenant-guid>` |
| Get segment | `absuite tenants get segment --TenantId <tenant-guid> --TenantSegmentId <segment-guid>` |
| Create segment | `absuite tenants create segment --TenantId <tenant-guid> --TenantSegmentCreateDto '{...}'` |
| Update segment | `absuite tenants update segment --TenantId <tenant-guid> --TenantSegmentId <segment-guid> --TenantSegmentUpdateDto '{...}'` |
| Delete segment | `absuite tenants delete segment --TenantId <tenant-guid> --TenantSegmentId <segment-guid>` |
| List sizes | `absuite tenants list sizes --TenantId <tenant-guid>` |
| Count sizes | `absuite tenants count sizes --TenantId <tenant-guid>` |
| Get size | `absuite tenants get size --TenantId <tenant-guid> --TenantSizeId <size-guid>` |
| Create size | `absuite tenants create size --TenantId <tenant-guid> --TenantSizeCreateDto '{...}'` |
| Update size | `absuite tenants update size --TenantId <tenant-guid> --TenantSizeId <size-guid> --TenantSizeUpdateDto '{...}'` |
| Delete size | `absuite tenants delete size --TenantId <tenant-guid> --TenantSizeId <size-guid>` |
| List types | `absuite tenants list types --TenantId <tenant-guid>` |
| Count types | `absuite tenants count types --TenantId <tenant-guid>` |
| Get type | `absuite tenants get type --TenantId <tenant-guid> --TenantTypeId <type-guid>` |
| Create type | `absuite tenants create type --TenantId <tenant-guid> --TenantTypeCreateDto '{...}'` |
| Update type | `absuite tenants update type --TenantId <tenant-guid> --TenantTypeId <type-guid> --TenantTypeUpdateDto '{...}'` |
| Delete type | `absuite tenants delete type --TenantId <tenant-guid> --TenantTypeId <type-guid>` |
| List units | `absuite tenants list units --TenantId <tenant-guid>` |
| Count units | `absuite tenants count units --TenantId <tenant-guid>` |
| Get unit | `absuite tenants get unit --TenantId <tenant-guid> --TenantUnitId <unit-guid>` |
| Create unit | `absuite tenants create unit --TenantId <tenant-guid> --TenantUnitCreateDto '{...}'` |
| Update unit | `absuite tenants update unit --TenantId <tenant-guid> --TenantUnitId <unit-guid> --TenantUnitUpdateDto '{...}'` |
| Delete unit | `absuite tenants delete unit --TenantId <tenant-guid> --TenantUnitId <unit-guid>` |
| List unit groups | `absuite tenants list unit-groups --TenantId <tenant-guid>` |
| Count unit groups | `absuite tenants count unit-groups --TenantId <tenant-guid>` |
| Get unit group | `absuite tenants get unit-group --TenantId <tenant-guid> --UnitGroupId <group-guid>` |
| Create unit group | `absuite tenants create unit-group --TenantId <tenant-guid> --UnitGroupCreateDto '{...}'` |
| Update unit group | `absuite tenants update unit-group --TenantId <tenant-guid> --UnitGroupId <group-guid> --UnitGroupUpdateDto '{...}'` |
| Delete unit group | `absuite tenants delete unit-group --TenantId <tenant-guid> --UnitGroupId <group-guid>` |
| List units in group | `absuite tenants list group-units --TenantId <tenant-guid> --UnitGroupId <group-guid>` |
| Count units in group | `absuite tenants count group-units --TenantId <tenant-guid> --UnitGroupId <group-guid>` |
| Get unit in group | `absuite tenants get group-unit --TenantId <tenant-guid> --UnitGroupId <group-guid> --UnitId <unit-guid>` |
| Create unit in group | `absuite tenants create group-unit --TenantId <tenant-guid> --UnitGroupId <group-guid> --UnitCreateDto '{...}'` |
| Update unit in group | `absuite tenants update group-unit --TenantId <tenant-guid> --UnitGroupId <group-guid> --UnitId <unit-guid> --UnitUpdateDto '{...}'` |
| Delete unit in group | `absuite tenants delete group-unit --TenantId <tenant-guid> --UnitGroupId <group-guid> --UnitId <unit-guid>` |

> Every tenant-scoped command also accepts `--TenantId <tenant-guid>` (omit it if you set a
> default with `absuite config set --tenant-id <tenant-guid>`). The commands that take **no**
> tenant: `create tenant`, `get root-tenant`, `deselect tenant`, `accept invitation`,
> `decline invitation`.
>
> The `absuite` CLI does not support PATCH. For atomic partial (JSON Patch) updates or raw
> HTTP, use the `absuite-tenants` REST skill.
