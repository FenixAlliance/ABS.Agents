# Agents gallery

This folder holds the agent templates a workspace can install from the ABS gallery. Each template is one folder with one `AGENT.md` manifest. The templates are generic: they describe a job, not a company. An installed agent reads its company's context (mission, products, policies, people, currency, fiscal calendar) from the workspace's own records, and never assumes it.

## Format

An `AGENT.md` starts with YAML frontmatter, followed by the agent's instructions in Markdown:

```yaml
---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Agent
key: fenixalliance.executive.cfo
version: 1.0.0
name: Chief Financial Officer
description: >-
  One to three lines on what the agent does for a workspace.
skills:
  - key: paperclip/skills/absuite-accounting/SKILL.md
    version: ">=1.0.0 <2.0.0"
---
```

- `key` is the agent's identity in the gallery, and it never changes once published. Installs, updates and uninstalls follow the key, not the folder.
- `version` is semantic. Raise the patch for wording, the minor for new behaviour, and the major for anything an installed agent's owner must review.
- `skills` lists the gallery skills the agent may use, each with a version range. A template may list only skills that exist in [`../skills`](../skills). The agent acts only through those skills and the capabilities they expose.
- The body has at least `## Role` and `## Operating rules`. See [`fenixalliance.content.blog-author`](fenixalliance.content.blog-author/AGENT.md) for a complete example.

## Key naming

- **Position templates** use `fenixalliance.<area>.<position>`, for example `fenixalliance.executive.cfo`, `fenixalliance.engineering.devops-lead` or `fenixalliance.support.support-manager`. A position template describes a job as a whole: its accountabilities, judgment and quality bar, plus the skills that job needs.
- **Role agents** (coming) use `fenixalliance.role.<role>`, for example `fenixalliance.role.support-manager` or `fenixalliance.role.accountant`. There is one per assignable system role, and installing one grants that role. A position template does not grant a role: what it may do is bounded by its skills and by the permissions the workspace gives its agent.
- The folder name equals the key. Lower case, words joined by hyphens, no GUIDs.

## How install works

1. ABS reads the gallery index (`../.abs/gallery-index.json`) from the configured source. The default source is this repository.
2. A workspace administrator picks a template. ABS validates the manifest at a pinned commit, then installs it into the workspace with its pinned provenance, in one commit.
3. Update re-reads the manifest at a new pinned commit and reconciles the installed agent in place. Uninstall deletes the installed agent and its provenance, and revokes the direct grants on the agent's execution principal.
4. Everything the agent does runs through governed capabilities. Writes that need approval wait for a person; "awaiting approval" is a success, never a reason to retry.

## Changing a template

1. Edit the `AGENT.md`, and raise its `version`.
2. Regenerate the index: `pwsh .abs/generate-index.ps1`, then `pwsh .abs/generate-index.ps1 -Verify`. Never hand-edit the index.
3. Check that the index diff shows no key change you did not intend.
4. Commit the manifest and the index together.

This repository is public. Templates carry no company facts, no names of people, and no secrets.
