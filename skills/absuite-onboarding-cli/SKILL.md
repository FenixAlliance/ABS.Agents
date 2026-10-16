---
name: absuite-onboarding-cli
description: >
  Onboard a user into an Alliance Business Suite (ABS) tenant using the `absuite`
  CLI: authenticate, initialize the portal (which surfaces/stages the tenant
  invitation), accept the invitation, and verify enrollment. Use when an agent or
  user needs to join a tenant for the first time via the CLI. Encodes the correct
  Initialize-FIRST order and the domain-based auto-invitation rule. For the REST
  version, see absuite-onboarding.
---

# Alliance Business Suite — Tenant Onboarding Skill (CLI)

This skill teaches the **correct order** for onboarding a user into an ABS tenant with the **`absuite` CLI**. For the REST/HTTP version (and the full "why"), see `absuite-onboarding`.

## The one rule that matters: Initialize FIRST

> **Initialize the portal *before* looking for your invitation.** Initialize is what triggers and surfaces the invitation. Checking for invitations first will (correctly) find none — do not conclude you are "blocked."

### Why (grounded in the platform)

Portal Initialize runs an anonymous-capable use case that, for an **authenticated user with a confirmed email**, performs **domain-based auto-invitation**: it stages a pending invitation to every tenant that owns a **verified business domain matching the user's email domain**, then returns the pending invitations.

- Preconditions: the email is **confirmed** AND a tenant owns a **verified business domain** equal to the user's email domain. Otherwise no invitation is auto-created and a tenant admin must send one manually.
- Initialize is **host/user-scoped, not tenant-scoped** — it needs no tenant. (The CLI cannot attach a tenant to it, and none is required.)

## Prerequisites

1. Authenticated CLI session — see `absuite-login-cli` (`absuite login ...`, then `absuite identity Get-WhoAmIAsync`).
2. The user's email should be **confirmed** for domain-based auto-invite to apply.

## The flow

### Step 1 — Authenticate and verify identity

```bash
absuite identity Get-WhoAmIAsync
# capture result.userId
```

### Step 2 — Initialize the portal (this surfaces the invitation)

```bash
absuite content Initialize-CurrentWebPortalAsync
```

The result is an execution context that includes your pending invitations, enrollments, and tenants.

### Step 3 — List pending invitations

```bash
absuite users Get-CurrentUserInvitationAsync
# pick the pending invitation's id
```

### Step 4 — Accept the invitation

```bash
absuite tenants Receive-TenantInvitation --InvitationId <invitation-guid>
# expect result.isSuccess: true
```

(`Receive-TenantInvitation` is the CLI command for accepting an invitation; `--InvitationId` is the only required parameter. Confirm with `absuite tenants Receive-TenantInvitation --help`.)

### Step 5 — Verify enrollment and tenant access

```bash
absuite users Get-CurrentUserEnrollmentsAsync   # active enrollment in the tenant
absuite users Get-CurrentUserTenantsAsync        # tenant now accessible
```

### Step 6 — (Optional) request elevated roles

A freshly-accepted enrollment is a **standard member** (`isRoot`/`isOwner`/`isAdmin` = `false`). Elevated roles must be granted by a **tenant admin or owner** — a new member **cannot self-elevate**. If you hit `403`/write-lock errors and need more access, request elevation out of band.

### Step 7 — Final three-check verification

1. `absuite identity Get-WhoAmIAsync --TenantId <tenant-guid>` resolves your `enrollmentId`.
2. `absuite users Get-CurrentUserEnrollmentsAsync` shows an active enrollment.
3. `absuite users Get-CurrentUserTenantsAsync` lists the tenant.

## Common failure modes (and the right response)

| Symptom | Wrong response | Correct response |
|---|---|---|
| No invitations **before** Initialize | Conclude you're blocked; wait for a manual invitation | **Expected.** Run Initialize first (Step 2). |
| Still no invitation **after** Initialize | Retry Initialize repeatedly | Confirm the email is **confirmed** and its domain matches a tenant's **verified** domain; otherwise a tenant admin must send the invitation manually. |
| Initialize errors with a 500/email symptom | Blindly retry | Infrastructure/email-class error — stop and escalate per your runbook. |
| Writes return 400 "tenant write lock" / 403 after enrollment | Assume a platform bug and retry | You likely have a **standard member** role — request elevated roles from a tenant admin (Step 6). |

## CLI commands quick reference

| Action | CLI command |
|---|---|
| Verify identity | `absuite identity Get-WhoAmIAsync` |
| Initialize portal | `absuite content Initialize-CurrentWebPortalAsync` |
| List pending invitations | `absuite users Get-CurrentUserInvitationAsync` |
| Accept invitation | `absuite tenants Receive-TenantInvitation --InvitationId <guid>` |
| Verify enrollments | `absuite users Get-CurrentUserEnrollmentsAsync` |
| Verify tenants | `absuite users Get-CurrentUserTenantsAsync` |

## Critical rules

- **Initialize before invitation discovery.** This is the whole point of the skill.
- **Do not invent or hard-code tenant IDs, emails, or invitation IDs** — read them from WhoAmI / Initialize / the invitations list.
- **Do not self-escalate roles.** Standard membership is expected on first join.
- **Do not loop on 500s.** Escalate infrastructure-class errors instead.
- The `absuite` CLI does not support PATCH; onboarding does not need it. For raw HTTP control, see `absuite-onboarding`.
