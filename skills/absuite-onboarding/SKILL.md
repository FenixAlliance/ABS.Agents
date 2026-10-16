---
name: absuite-onboarding
description: >
  Onboard a user into an Alliance Business Suite (ABS) tenant over the REST API:
  authenticate, initialize the portal (which surfaces/stages the tenant invitation),
  accept the invitation, and verify enrollment. Use when an agent or user needs to
  join a tenant and initialize their portal for the first time. Encodes the correct
  Initialize-FIRST order and the domain-based auto-invitation rule. For the CLI
  version, see absuite-onboarding-cli.
---

# Alliance Business Suite — Tenant Onboarding Skill (REST)

This skill teaches the **correct order** for onboarding a user into an ABS tenant. Following the wrong order (waiting for an invitation before initializing) is a common, avoidable dead-end. For the `absuite` CLI version, see `absuite-onboarding-cli`.

## The one rule that matters: Initialize FIRST

> **Call Portal Initialize *before* looking for your invitation.** Initialize is what triggers and surfaces the invitation. If you check for invitations first, you will (correctly) find none, conclude you are "blocked," and waste effort waiting for something that only Initialize creates.

### Why (grounded in the platform)

`POST /api/v2/ContentService/Portals/Initialize` runs an anonymous-capable use case that, for an **authenticated user with a confirmed email**, performs **domain-based auto-invitation**: it stages a pending invitation to every tenant that owns a **verified business domain matching the user's email domain**, commits, then reads the pending invitations back into its response. So:

- A user `someone@acme-corp.com` whose email is confirmed is auto-invited to the tenant that owns the verified domain `acme-corp.com` — simply by calling Initialize.
- **Preconditions for auto-invite:** (1) the user's email is **confirmed**, and (2) some tenant owns a **verified business domain** equal to the user's email domain. If either is missing, no invitation is auto-created — a tenant admin must send one manually (it will then appear in `GET /api/v2/Me/Invitations`).
- Initialize is **host/user-scoped, not tenant-scoped** — it takes **no `tenantId`** and needs **no tenant header**. (Sending `X-TenantId` to it is harmless but unnecessary; do not depend on it.)

## Prerequisites

1. Authenticated session with a bearer token — see `absuite-login`. Capture `userId` from WhoAmI.
2. The user's email should be **confirmed** for domain-based auto-invite to apply.

## The flow

### Step 1 — Authenticate and verify identity

```bash
# (see absuite-login) obtain $ABSUITE_ACCESS_TOKEN, then:
curl -s "$ABSUITE_HOST_URL/api/v2/OAuth/WhoAmI" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# capture result.userId
```

### Step 2 — Initialize the portal (this surfaces the invitation)

```bash
curl -s -X POST "$ABSUITE_HOST_URL/api/v2/ContentService/Portals/Initialize" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

The response envelope's `result` is an execution context that includes your **pending invitations** (`result.invitations`), your `enrollments`, and your `tenants`. Read `result.invitations` to find the invitation to accept — capture its `id`.

### Step 3 — (Fallback) list pending invitations explicitly

If you prefer an explicit read, or to re-check after Initialize:

```bash
curl -s "$ABSUITE_HOST_URL/api/v2/Me/Invitations" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# pick the pending invitation's id
```

### Step 4 — Accept the invitation

```bash
curl -s -X POST "$ABSUITE_HOST_URL/api/v2/TenantsService/Invitations/<invitation-guid>/Accept" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# expect result.isSuccess: true
```

`invitationId` is a path parameter; there is no request body.

### Step 5 — Verify enrollment and tenant access

```bash
# You should now have an active enrollment in the tenant:
curl -s "$ABSUITE_HOST_URL/api/v2/Me/Enrollments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# And the tenant should appear in your accessible tenants:
curl -s "$ABSUITE_HOST_URL/api/v2/Me/Tenants" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Step 6 — (Optional) request elevated roles

A freshly-accepted enrollment is a **standard member** (`isRoot`/`isOwner`/`isAdmin` are `false`). Elevated roles/permissions must be granted by a **tenant admin or owner** — a new member **cannot self-elevate**. If your workflow needs more than read/standard access and you hit `403`/write-lock errors, request elevation from a tenant admin (out of band) rather than retrying.

### Step 7 — Final three-check verification

1. **Identity in tenant context** — `GET /api/v2/OAuth/WhoAmI` with `-H "X-TenantId: <tenant-guid>"` resolves your `enrollmentId`.
2. **Enrollment active** — `GET /api/v2/Me/Enrollments` lists an active enrollment for the tenant.
3. **Tenant visible** — `GET /api/v2/Me/Tenants` lists the tenant.

All three passing = onboarding complete.

## Common failure modes (and the right response)

| Symptom | Wrong response | Correct response |
|---|---|---|
| `GET /Me/Invitations` is empty **before** Initialize | Conclude you're blocked; wait for/raise a manual-invitation request | **Expected.** Call Initialize first (Step 2) — it stages and surfaces the invitation. |
| Still no invitation **after** Initialize | Retry Initialize repeatedly | Check that the email is **confirmed** and its domain matches a tenant's **verified** domain. If not, a tenant admin must send the invitation manually; then it appears in `/Me/Invitations`. |
| Initialize returns **500** with an email/rollback symptom | Blindly retry the write | Known infrastructure/email-pipeline class of error — stop and escalate per your runbook; do not loop. |
| Writes return **400 "tenant write lock"** / **403** after enrollment | Assume a platform bug and retry | You likely have a **standard member** role. Request elevated roles from a tenant admin (Step 6). |

## Endpoints used

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/login` | Authenticate (public) |
| GET | `/api/v2/OAuth/WhoAmI` | Verify identity (optionally tenant-scoped via `X-TenantId`) |
| POST | `/api/v2/ContentService/Portals/Initialize` | Initialize portal; stages + returns pending invitations (no body, no tenant) |
| GET | `/api/v2/Me/Invitations` | List pending invitations |
| POST | `/api/v2/TenantsService/Invitations/{invitationId}/Accept` | Accept an invitation (path param, no body) |
| GET | `/api/v2/Me/Enrollments` | Verify enrollment |
| GET | `/api/v2/Me/Tenants` | Verify tenant access |

## Critical rules

- **Initialize before invitation discovery.** This is the whole point of the skill.
- **Do not invent or hard-code tenant IDs, emails, or invitation IDs** — read them from WhoAmI / the Initialize response / `/Me/Invitations`.
- **Do not attach a `tenantId` to Initialize or `/Me/*`** — they are host/user-scoped.
- **Do not self-escalate roles.** Standard membership is expected on first join; elevation is granted by a tenant admin.
- **Do not loop on 500s.** Escalate infrastructure-class errors instead of burning calls.
