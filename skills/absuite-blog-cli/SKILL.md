---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-blog-cli
key: fenixalliance.absuite.blog-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Blog area with the absuite CLI: 14 commands (9 read, 5
  write) under `absuite content`, each generated from the platform's ServiceClients and checked
  against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-blog REST
  skill.
---

# Alliance Business Suite — Blog Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-blog` REST skill documents 25 routes; 16 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-blog` REST skill.

## Commands

14 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Blog Post Categories (`absuite content blog-post-categories`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content blog-post-categories list` | Reads |  | `--columns` | List the workspace's blog-post-categories. `GET /api/v2/ContentService/BlogPostCategories/List/{tenantId}` |
| `absuite content blog-post-categories count` | Reads |  |  | Count the workspace's blog-post-categories. `GET /api/v2/ContentService/BlogPostCategories/Count` |
| `absuite content blog-post-categories get` | Reads | `<id>` | `--columns` | Show one of the workspace's blog-post-categories. `GET /api/v2/ContentService/BlogPostCategories/{blogPostCategoryId}` |
| `absuite content blog-post-categories delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's blog-post-categories; it asks first unless --yes. `DELETE /api/v2/ContentService/BlogPostCategories/{blogPostCategoryId}` |

### Blog Post Tags (`absuite content blog-post-tags`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content blog-post-tags list` | Reads |  | `--columns` | List the workspace's blog-post-tags. `GET /api/v2/ContentService/BlogPostTags/List/{tenantId}` |
| `absuite content blog-post-tags count` | Reads |  |  | Count the workspace's blog-post-tags. `GET /api/v2/ContentService/BlogPostTags/Count` |
| `absuite content blog-post-tags get` | Reads | `<id>` | `--columns` | Show one of the workspace's blog-post-tags. `GET /api/v2/ContentService/BlogPostTags/{blogPostTagId}` |
| `absuite content blog-post-tags delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's blog-post-tags; it asks first unless --yes. `DELETE /api/v2/ContentService/BlogPostTags/{blogPostTagId}` |

### Blog Posts (`absuite content blog-posts`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content blog-posts list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's blog-posts. `GET /api/v2/ContentService/BlogPosts` |
| `absuite content blog-posts count` | Reads |  |  | Count the workspace's blog-posts. `GET /api/v2/ContentService/BlogPosts/Count` |
| `absuite content blog-posts get` | Reads | `<id>` | `--columns` | Show one of the workspace's blog-posts. `GET /api/v2/ContentService/BlogPosts/{blogPostId}` |
| `absuite content blog-posts delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's blog-posts; it asks first unless --yes. `DELETE /api/v2/ContentService/BlogPosts/{blogPostId}` |
| `absuite content blog-posts categories delete` | Writes | `<id>` | `--blog-post-id` (required); `--yes` `--dry-run` | Delete one of the workspace's blog-posts categories; it asks first unless --yes. `DELETE /api/v2/ContentService/BlogPosts/{blogPostId}/Categories/{categoryId}` |
| `absuite content blog-posts tags delete` | Writes | `<id>` | `--blog-post-id` (required); `--yes` `--dry-run` | Delete one of the workspace's blog-posts tags; it asks first unless --yes. `DELETE /api/v2/ContentService/BlogPosts/{blogPostId}/Tags/{tagId}` |

## Example

```bash
absuite content blog-post-categories list -o json --query "[].id"
```
