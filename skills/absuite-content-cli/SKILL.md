---
name: absuite-content-cli
key: fenixalliance.absuite.content-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Content area with the absuite CLI: 74 commands (43 read, 31
  write) under `absuite content`, each generated from the platform's ServiceClients and checked
  against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-content REST
  skill.
---

# Alliance Business Suite — Content Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-content` REST skill documents 71 routes; 27 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-content` REST skill.

## Commands

74 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

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

### Business Domains (`absuite content business-domains`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content business-domains list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's business-domains. `GET /api/v2/ContentService/BusinessDomains` |
| `absuite content business-domains count` | Reads |  |  | Count the workspace's business-domains. `GET /api/v2/ContentService/BusinessDomains/Count` |
| `absuite content business-domains get` | Reads | `<id>` | `--columns` | Show one of the workspace's business-domains. `GET /api/v2/ContentService/BusinessDomains/{businessDomainId}` |

### Localization Strings (`absuite content localization-strings`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content localization-strings list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's localization-strings. `GET /api/v2/ContentService/LocalizationStrings` |
| `absuite content localization-strings count` | Reads |  |  | Count the workspace's localization-strings. `GET /api/v2/ContentService/LocalizationStrings/Count` |
| `absuite content localization-strings get` | Reads | `<id>` | `--columns` | Show one of the workspace's localization-strings. `GET /api/v2/ContentService/LocalizationStrings/{localizationStringId}` |
| `absuite content localization-strings create` | Writes |  | `--base`, `--comments`, `--country-language-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's localization-strings. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ContentService/LocalizationStrings` |
| `absuite content localization-strings update` | Writes | `<id>` | `--base`, `--comments`, `--country-language-id`; `--json` `--file` `--dry-run` | Change one of the workspace's localization-strings: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/ContentService/LocalizationStrings/{localizationStringId}` |
| `absuite content localization-strings delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's localization-strings; it asks first unless --yes. `DELETE /api/v2/ContentService/LocalizationStrings/{localizationStringId}` |

### Menu Contexts (`absuite content menu-contexts`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content menu-contexts list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's menu-contexts. `GET /api/v2/ContentService/MenuContexts` |
| `absuite content menu-contexts count` | Reads |  |  | Count the workspace's menu-contexts. `GET /api/v2/ContentService/MenuContexts/Count` |
| `absuite content menu-contexts get` | Reads | `<id>` | `--columns` | Show one of the workspace's menu-contexts. `GET /api/v2/ContentService/MenuContexts/{menuContextId}` |
| `absuite content menu-contexts create` | Writes |  | `--name`, `--category`, `--component`, `--enable`, `--studio-menu`, `--custom-css`, `--custom-js`, `--custom-html`, `--logged-in-only`, `--background-image`, `--web-portal-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's menu-contexts. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ContentService/MenuContexts` |
| `absuite content menu-contexts update` | Writes | `<id>` | `--name`, `--category`, `--component`, `--enable`, `--studio-menu`, `--custom-css`, `--custom-js`, `--custom-html`, `--logged-in-only`, `--background-image`, `--web-portal-id`; `--json` `--file` `--dry-run` | Change one of the workspace's menu-contexts: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/ContentService/MenuContexts/{menuContextId}` |
| `absuite content menu-contexts delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's menu-contexts; it asks first unless --yes. `DELETE /api/v2/ContentService/MenuContexts/{menuContextId}` |

### Portals (`absuite content portals`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content portals list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's portals. `GET /api/v2/ContentService/Portals` |
| `absuite content portals count` | Reads |  |  | Count the workspace's portals. `GET /api/v2/ContentService/Portals/Count` |
| `absuite content portals get` | Reads | `<id>` | `--columns` | Show one of the workspace's portals. `GET /api/v2/ContentService/Portals/{portalId}` |
| `absuite content portals create` | Writes |  | `--root`, `--title`, `--domain`, `--disabled`, `--description`, `--website-theme-id`, `--business-domain-id`, `--business-portal-application-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's portals. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ContentService/Portals` |
| `absuite content portals update` | Writes | `<id>` | `--root`, `--title`, `--domain`, `--disabled`, `--description`, `--website-theme-id`, `--business-domain-id`, `--business-portal-application-id`; `--json` `--file` `--dry-run` | Change one of the workspace's portals: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/ContentService/Portals/{portalId}` |
| `absuite content portals delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's portals; it asks first unless --yes. `DELETE /api/v2/ContentService/Portals/{portalId}` |
| `absuite content portals domain-bindings list` | Reads |  | `--portal-id` (required); `--columns` | List the workspace's portals domain-bindings. `GET /api/v2/ContentService/Portals/{portalId}/DomainBindings` |

### Web Components (`absuite content web-components`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content web-components list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's web-components. `GET /api/v2/ContentService/WebComponents` |
| `absuite content web-components count` | Reads |  |  | Count the workspace's web-components. `GET /api/v2/ContentService/WebComponents/Count` |
| `absuite content web-components get` | Reads | `<id>` | `--columns` | Show one of the workspace's web-components. `GET /api/v2/ContentService/WebComponents/{webComponentId}` |
| `absuite content web-components create` | Writes |  | `--name`, `--web-portal-id`, `--title`, `--description`, `--code`, `--html-content`, `--css-content`, `--js-content`, `--code-type`, `--published`, `--enable`, `--featured-image-url`; `--json` `--file` `--dry-run` | Create a record in the workspace's web-components. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ContentService/WebComponents` |
| `absuite content web-components update` | Writes | `<id>` | `--name`, `--title`, `--description`, `--code`, `--html-content`, `--css-content`, `--js-content`, `--code-type`, `--published`, `--enable`, `--featured-image-url`; `--json` `--file` `--dry-run` | Change one of the workspace's web-components: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/ContentService/WebComponents/{webComponentId}` |
| `absuite content web-components delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's web-components; it asks first unless --yes. `DELETE /api/v2/ContentService/WebComponents/{webComponentId}` |

### Web Contents (`absuite content web-contents`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content web-contents list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's web-contents. `GET /api/v2/ContentService/WebContents` |
| `absuite content web-contents count` | Reads |  |  | Count the workspace's web-contents. `GET /api/v2/ContentService/WebContents/Count` |
| `absuite content web-contents get` | Reads | `<id>` | `--columns` | Show one of the workspace's web-contents. `GET /api/v2/ContentService/WebContents/{webContentId}` |
| `absuite content web-contents create` | Writes |  | `--title`, `--published`, `--description`, `--code`, `--markup`, `--featured-image-url`, `--code-type`; `--json` `--file` `--dry-run` | Create a record in the workspace's web-contents. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ContentService/WebContents` |
| `absuite content web-contents delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's web-contents; it asks first unless --yes. `DELETE /api/v2/ContentService/WebContents/{webContentId}` |

### Web Page Categories (`absuite content web-page-categories`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content web-page-categories list` | Reads |  | `--columns` | List the workspace's web-page-categories. `GET /api/v2/ContentService/WebPageCategories/List/{tenantId}` |
| `absuite content web-page-categories count` | Reads |  |  | Count the workspace's web-page-categories. `GET /api/v2/ContentService/WebPageCategories/Count` |
| `absuite content web-page-categories get` | Reads | `<id>` | `--columns` | Show one of the workspace's web-page-categories. `GET /api/v2/ContentService/WebPageCategories/{webPageCategoryId}` |
| `absuite content web-page-categories delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's web-page-categories; it asks first unless --yes. `DELETE /api/v2/ContentService/WebPageCategories/{webPageCategoryId}` |

### Web Page Tags (`absuite content web-page-tags`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content web-page-tags list` | Reads |  | `--columns` | List the workspace's web-page-tags. `GET /api/v2/ContentService/WebPageTags` |
| `absuite content web-page-tags count` | Reads |  |  | Count the workspace's web-page-tags. `GET /api/v2/ContentService/WebPageTags/Count` |
| `absuite content web-page-tags get` | Reads | `<id>` | `--columns` | Show one of the workspace's web-page-tags. `GET /api/v2/ContentService/WebPageTags/{webPageTagId}` |
| `absuite content web-page-tags delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's web-page-tags; it asks first unless --yes. `DELETE /api/v2/ContentService/WebPageTags/{webPageTagId}` |

### Web Pages (`absuite content web-pages`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content web-pages list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's web-pages. `GET /api/v2/ContentService/WebPages` |
| `absuite content web-pages count` | Reads |  |  | Count the workspace's web-pages. `GET /api/v2/ContentService/WebPages/Count` |
| `absuite content web-pages get` | Reads | `<id>` | `--columns` | Show one of the workspace's web-pages. `GET /api/v2/ContentService/WebPages/{pageId}` |
| `absuite content web-pages create` | Writes |  | `--slug`, `--web-portal-id`, `--web-template-id`, `--parent-web-content-id`, `--title`, `--published`, `--description`, `--code`, `--markup`, `--featured-image-url`, `--code-type`; `--json` `--file` `--dry-run` | Create a record in the workspace's web-pages. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ContentService/WebPages` |
| `absuite content web-pages delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's web-pages; it asks first unless --yes. `DELETE /api/v2/ContentService/WebPages/{pageId}` |
| `absuite content web-pages categories delete` | Writes | `<id>` | `--web-page-id` (required); `--yes` `--dry-run` | Delete one of the workspace's web-pages categories; it asks first unless --yes. `DELETE /api/v2/ContentService/WebPages/{webPageId}/Categories/{categoryId}` |
| `absuite content web-pages tags delete` | Writes | `<id>` | `--web-page-id` (required); `--yes` `--dry-run` | Delete one of the workspace's web-pages tags; it asks first unless --yes. `DELETE /api/v2/ContentService/WebPages/{webPageId}/Tags/{tagId}` |

### Web Templates (`absuite content web-templates`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content web-templates list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's web-templates. `GET /api/v2/ContentService/WebTemplates` |
| `absuite content web-templates count` | Reads |  |  | Count the workspace's web-templates. `GET /api/v2/ContentService/WebTemplates/Count` |
| `absuite content web-templates get` | Reads | `<id>` | `--columns` | Show one of the workspace's web-templates. `GET /api/v2/ContentService/WebTemplates/{webTemplateId}` |
| `absuite content web-templates create` | Writes |  | `--slug`, `--name`, `--title`, `--description`, `--content`, `--html-content`, `--css-content`, `--js-content`, `--razor-content`, `--highlight-image`, `--order`; `--json` `--file` `--dry-run` | Create a record in the workspace's web-templates. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ContentService/WebTemplates` |
| `absuite content web-templates update` | Writes | `<id>` | `--slug`, `--name`, `--title`, `--description`, `--content`, `--html-content`, `--css-content`, `--js-content`, `--razor-content`, `--highlight-image`, `--order`; `--json` `--file` `--dry-run` | Change one of the workspace's web-templates: reads it, applies --json/--file and the field flags, then saves it. Never set here: id (set by the server); timestamp (set by the server). `PUT /api/v2/ContentService/WebTemplates/{webTemplateId}` |
| `absuite content web-templates delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's web-templates; it asks first unless --yes. `DELETE /api/v2/ContentService/WebTemplates/{webTemplateId}` |

### Website Themes (`absuite content website-themes`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite content website-themes list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's website-themes. `GET /api/v2/ContentService/WebsiteThemes` |
| `absuite content website-themes count` | Reads |  |  | Count the workspace's website-themes. `GET /api/v2/ContentService/WebsiteThemes/Count` |
| `absuite content website-themes get` | Reads | `<id>` | `--columns` | Show one of the workspace's website-themes. `GET /api/v2/ContentService/WebsiteThemes/{themeId}` |
| `absuite content website-themes create` | Writes |  | `--name`, `--description`, `--author-name`, `--author-url`, `--tags`, `--enable`; `--json` `--file` `--dry-run` | Create a record in the workspace's website-themes. Only in --json: version. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ContentService/WebsiteThemes` |
| `absuite content website-themes update` | Writes | `<id>` | `--name`, `--description`, `--author-name`, `--author-url`, `--tags`, `--enable`; `--json` `--file` `--dry-run` | Change one of the workspace's website-themes: reads it, applies --json/--file and the field flags, then saves it. Only in --json: version. `PUT /api/v2/ContentService/WebsiteThemes/{themeId}` |
| `absuite content website-themes delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's website-themes; it asks first unless --yes. `DELETE /api/v2/ContentService/WebsiteThemes/{themeId}` |

## Example

```bash
absuite content blog-post-categories list -o json --query "[].id"
absuite content localization-strings create --base <value> --comments <value> --dry-run   # prints the POST, sends nothing
absuite content localization-strings create --base <value> --comments <value> -o json --no-input
```

## Enums

- **CodeType** (used by WebPages, WebContents, WebComponents, BlogPosts):
  `Razor | CSharp | CSHtml | Liquid | Html5 | Markdown | Markup`.
