# Skills

These are the official Alliance Business Suite (ABS) skills, published by Fenix Alliance in the `fenixalliance.*` namespace. A skill documents one ABS service for an agent: its routes, the tenant and permission rules, the request and response fields, and worked examples. A skill grants nothing: an agent may do only what its workspace grants it.

Each skill is a folder with one `SKILL.md`. Its frontmatter carries `name`, `key`, `version` and `description`.

- `key` is the skill's identity: `fenixalliance.absuite.<area>` for the REST skill and `fenixalliance.absuite.<area>-cli` for its CLI twin. A key never changes once published.
- The retired `paperclip/skills/<name>/SKILL.md` keys (used before 2026-10-16) are reserved: no skill, from this repository or any other source, may take one, because it would inherit existing installs and their trust.
- `version` is semantic. Raise the minor version for any change to routes, rules or fields, and the patch version for wording.
- REST skills drive the API over HTTP. The CLI twins drive the `absuite` command line. They wait for the new ABS CLI, built on the platform's service clients, and are revalidated once its commands exist.

## Governance

Every skill has an owning lane: the team that owns the ABS service the skill documents. A change to a skill is reviewed by its owner against the platform source before it merges, and this table records the last review. After any change, regenerate the index (`pwsh .abs/generate-index.ps1`, then `-Verify`) and commit both together.

| Key | Version | Owner | Last review |
|---|---|---|---|
| `fenixalliance.absuite.accounting` | 1.1.0 | Accounting Engine | Accounting Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.accounting-cli` | 1.0.0 | Accounting Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.assets` | 1.1.0 | Docs & Provenance | Docs & Provenance validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.assets-cli` | 1.0.0 | Docs & Provenance | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.blog` | 1.1.0 | CMS Engine | CMS Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.blog-cli` | 1.0.0 | CMS Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.cart` | 1.1.0 | Marketplace Engine | Marketplace Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.cart-cli` | 1.0.0 | Marketplace Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.catalog` | 1.1.0 | Marketplace Engine | Marketplace Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.catalog-cli` | 1.0.0 | Marketplace Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.cli` | 1.0.0 | Docs & Provenance | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.contacts` | 1.1.0 | CRM Engine | CRM Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.contacts-cli` | 1.0.0 | CRM Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.content` | 1.1.0 | CMS Engine | CMS Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.content-cli` | 1.0.0 | CMS Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.deals` | 1.1.0 | Sales Engine | Sales Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.deals-cli` | 1.0.0 | Sales Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.emails` | 1.1.0 | Reach Engine | Reach Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.emails-cli` | 1.0.0 | Reach Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.forex` | 1.1.0 | Accounting Engine | Accounting Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.forex-cli` | 1.0.0 | Accounting Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.globe` | 1.1.0 | Accounting Engine | Accounting Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.globe-cli` | 1.0.0 | Accounting Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.hrms` | 1.1.0 | HR Engine | HR Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.hrms-cli` | 1.0.0 | HR Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.identity` | 1.1.0 | Identity Engine | Identity Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.identity-cli` | 1.0.0 | Identity Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.invoicing` | 1.1.0 | Billing Engine | Billing Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.invoicing-cli` | 1.0.0 | Billing Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.learning` | 1.1.0 | LMS Engine | LMS Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.learning-cli` | 1.0.0 | LMS Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.locations` | 1.1.0 | Sales Engine | Sales Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.locations-cli` | 1.0.0 | Sales Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.login` | 1.1.0 | Identity Engine | Identity Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.login-cli` | 1.0.0 | Identity Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.marketing` | 1.1.0 | Reach Engine | Reach Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.marketing-cli` | 1.0.0 | Reach Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.misc` | 1.1.0 | Sales Engine | Sales Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.misc-cli` | 1.0.0 | Sales Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.onboarding` | 1.1.0 | Identity Engine | Identity Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.onboarding-cli` | 1.0.0 | Identity Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.orders` | 1.1.0 | Sales Engine | Sales Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.orders-cli` | 1.0.0 | Sales Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.payments` | 1.1.0 | Payments Engine | Payments Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.payments-cli` | 1.0.0 | Payments Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.pricing` | 1.1.0 | Billing Engine | Billing Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.pricing-cli` | 1.0.0 | Billing Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.projects` | 1.1.0 | Docs & Provenance | Docs & Provenance validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.projects-cli` | 1.0.0 | Docs & Provenance | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.quotes` | 1.1.0 | Sales Engine | Sales Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.quotes-cli` | 1.0.0 | Sales Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.rest` | 1.1.0 | Docs & Provenance | Docs & Provenance validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.security` | 1.1.0 | Security Engine | Security Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.security-cli` | 1.0.0 | Security Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.social` | 1.1.0 | Social Engine | Social Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.social-cli` | 1.0.0 | Social Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.storage` | 1.1.0 | Storage | Storage validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.storage-cli` | 1.0.0 | Storage | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.subscriptions` | 1.1.0 | Licensing Lane | Licensing Lane validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.subscriptions-cli` | 1.0.0 | Licensing Lane | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.support` | 1.1.0 | Comms Engine | Comms Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.support-cli` | 1.0.0 | Comms Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.system` | 1.1.0 | Modular Engine | Modular Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.system-cli` | 1.0.0 | Modular Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.tenants` | 1.1.0 | Identity Engine | Identity Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.tenants-cli` | 1.0.0 | Identity Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.users` | 1.1.0 | Identity Engine | Identity Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.users-cli` | 1.0.0 | Identity Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.absuite.wallets` | 1.1.0 | Payments Engine | Payments Engine validation against Platform HEAD 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
| `fenixalliance.absuite.wallets-cli` | 1.0.0 | Payments Engine | Not yet reviewed: waits for the new ABS CLI (built on ServiceClients) |
| `fenixalliance.content.blog-authoring` | 1.0.1 | CMS Engine | CMS Engine validation 2026-10-16 (FenixAlliance.ABS.Agents 177dd7c) |
