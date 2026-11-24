---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-catalog-cli
key: fenixalliance.absuite.catalog-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Catalog area with the absuite CLI: 85 commands (37 read, 48
  write) under `absuite catalog`, each generated from the platform's ServiceClients and checked
  against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-catalog REST
  skill.
---

# Alliance Business Suite — Catalog Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-catalog` REST skill documents 102 routes; 52 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-catalog` REST skill.

## Commands

85 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Item Attachments (`absuite catalog item-attachments`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog item-attachments list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-attachments. `GET /api/v2/CatalogService/ItemAttachments` |
| `absuite catalog item-attachments get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-attachments. `GET /api/v2/CatalogService/ItemAttachments/{itemAttachmentId}` |
| `absuite catalog item-attachments delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-attachments; it asks first unless --yes. `DELETE /api/v2/CatalogService/ItemAttachments/{itemAttachmentId}` |

### Item Attribute Options (`absuite catalog item-attribute-options`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog item-attribute-options list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-attribute-options. `GET /api/v2/CatalogService/ItemAttributeOptions` |
| `absuite catalog item-attribute-options count` | Reads |  |  | Count the workspace's item-attribute-options. `GET /api/v2/CatalogService/ItemAttributeOptions/Count` |
| `absuite catalog item-attribute-options get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-attribute-options. `GET /api/v2/CatalogService/ItemAttributeOptions/{itemAttributeOptionId}` |
| `absuite catalog item-attribute-options create` | Writes |  | `--name`, `--description`, `--item-attribute-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-attribute-options. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CatalogService/ItemAttributeOptions` |
| `absuite catalog item-attribute-options update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's item-attribute-options: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CatalogService/ItemAttributeOptions/{itemAttributeOptionId}` |
| `absuite catalog item-attribute-options delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-attribute-options; it asks first unless --yes. `DELETE /api/v2/CatalogService/ItemAttributeOptions/{itemAttributeOptionId}` |

### Item Attributes (`absuite catalog item-attributes`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog item-attributes list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-attributes. `GET /api/v2/CatalogService/ItemAttributes` |
| `absuite catalog item-attributes count` | Reads |  |  | Count the workspace's item-attributes. `GET /api/v2/CatalogService/ItemAttributes/Count` |
| `absuite catalog item-attributes get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-attributes. `GET /api/v2/CatalogService/ItemAttributes/{itemAttributeId}` |
| `absuite catalog item-attributes create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-attributes. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CatalogService/ItemAttributes` |
| `absuite catalog item-attributes update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's item-attributes: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CatalogService/ItemAttributes/{itemAttributeId}` |
| `absuite catalog item-attributes delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-attributes; it asks first unless --yes. `DELETE /api/v2/CatalogService/ItemAttributes/{itemAttributeId}` |

### Item Brands (`absuite catalog item-brands`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog item-brands list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-brands. `GET /api/v2/CatalogService/ItemBrands` |
| `absuite catalog item-brands count` | Reads |  |  | Count the workspace's item-brands. `GET /api/v2/CatalogService/ItemBrands/Count` |
| `absuite catalog item-brands get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-brands. `GET /api/v2/CatalogService/ItemBrands/{itemBrandId}` |
| `absuite catalog item-brands create` | Writes |  | `--code`, `--name`, `--description`, `--website-url`, `--featured`, `--trending`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-brands. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CatalogService/ItemBrands` |
| `absuite catalog item-brands update` | Writes | `<id>` | `--name`, `--description`, `--website-url`, `--logo-url`, `--featured`, `--trending`; `--json` `--file` `--dry-run` | Change one of the workspace's item-brands: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CatalogService/ItemBrands/{itemBrandId}` |
| `absuite catalog item-brands delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-brands; it asks first unless --yes. `DELETE /api/v2/CatalogService/ItemBrands/{itemBrandId}` |

### Item Bundles (`absuite catalog item-bundles`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog item-bundles list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-bundles. `GET /api/v2/CatalogService/ItemBundles` |
| `absuite catalog item-bundles count` | Reads |  |  | Count the workspace's item-bundles. `GET /api/v2/CatalogService/ItemBundles/Count` |
| `absuite catalog item-bundles get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-bundles. `GET /api/v2/CatalogService/ItemBundles/{itemBundleId}` |
| `absuite catalog item-bundles create` | Writes |  | `--name`, `--code`, `--description`, `--disabled`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-bundles. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CatalogService/ItemBundles` |
| `absuite catalog item-bundles update` | Writes | `<id>` | `--name`, `--code`, `--description`, `--disabled`; `--json` `--file` `--dry-run` | Change one of the workspace's item-bundles: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CatalogService/ItemBundles/{itemBundleId}` |
| `absuite catalog item-bundles delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-bundles; it asks first unless --yes. `DELETE /api/v2/CatalogService/ItemBundles/{itemBundleId}` |

### Item Categories (`absuite catalog item-categories`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog item-categories list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-categories. `GET /api/v2/CatalogService/ItemCategories` |
| `absuite catalog item-categories count` | Reads |  |  | Count the workspace's item-categories. `GET /api/v2/CatalogService/ItemCategories/Count` |
| `absuite catalog item-categories get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-categories. `GET /api/v2/CatalogService/ItemCategories/{itemCategoryId}` |
| `absuite catalog item-categories create` | Writes |  | `--title`, `--description`, `--image-url`, `--parent-item-category-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-categories. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CatalogService/ItemCategories` |
| `absuite catalog item-categories update` | Writes | `<id>` | `--title`, `--description`, `--image-url`, `--is-featured`, `--enable-for-courses`, `--enable-for-products`, `--enable-for-licenses`, `--enable-for-services`, `--enable-for-subscriptions`, `--parent-item-category-id`; `--json` `--file` `--dry-run` | Change one of the workspace's item-categories: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CatalogService/ItemCategories/{itemCategoryId}` |
| `absuite catalog item-categories delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-categories; it asks first unless --yes. `DELETE /api/v2/CatalogService/ItemCategories/{itemCategoryId}` |

### Item Families (`absuite catalog item-families`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog item-families list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-families. `GET /api/v2/CatalogService/ItemFamilies` |
| `absuite catalog item-families count` | Reads |  |  | Count the workspace's item-families. `GET /api/v2/CatalogService/ItemFamilies/Count` |
| `absuite catalog item-families get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-families. `GET /api/v2/CatalogService/ItemFamilies/{itemFamilyId}` |
| `absuite catalog item-families create` | Writes |  | `--name`, `--code`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-families. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CatalogService/ItemFamilies` |
| `absuite catalog item-families update` | Writes | `<id>` | `--name`, `--code`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's item-families: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CatalogService/ItemFamilies/{itemFamilyId}` |
| `absuite catalog item-families delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-families; it asks first unless --yes. `DELETE /api/v2/CatalogService/ItemFamilies/{itemFamilyId}` |

### Item Images (`absuite catalog item-images`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog item-images list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-images. `GET /api/v2/CatalogService/ItemImages` |
| `absuite catalog item-images get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-images. `GET /api/v2/CatalogService/ItemImages/{itemImageId}` |
| `absuite catalog item-images delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-images; it asks first unless --yes. `DELETE /api/v2/CatalogService/ItemImages/{itemImageId}` |

### Item Questions (`absuite catalog item-questions`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog item-questions list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-questions. `GET /api/v2/CatalogService/ItemQuestions` |
| `absuite catalog item-questions get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-questions. `GET /api/v2/CatalogService/ItemQuestions/{itemQuestionId}` |
| `absuite catalog item-questions create` | Writes |  | `--title`, `--needs-revision`, `--question`, `--social-profile-id`, `--item-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-questions. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CatalogService/ItemQuestions` |
| `absuite catalog item-questions update` | Writes | `<id>` | `--title`, `--needs-revision`, `--question`; `--json` `--file` `--dry-run` | Change one of the workspace's item-questions: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CatalogService/ItemQuestions/{itemQuestionId}` |
| `absuite catalog item-questions delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-questions; it asks first unless --yes. `DELETE /api/v2/CatalogService/ItemQuestions/{itemQuestionId}` |

### Item Reviews (`absuite catalog item-reviews`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog item-reviews count` | Reads |  |  | Count the workspace's item-reviews. `GET /api/v2/CatalogService/ItemReviews/Count` |
| `absuite catalog item-reviews create` | Writes |  | `--item-id`, `--review-score`, `--review-message`, `--social-profile-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-reviews. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CatalogService/ItemReviews` |
| `absuite catalog item-reviews delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-reviews; it asks first unless --yes. `DELETE /api/v2/CatalogService/ItemReviews/{itemReviewId}` |

### Item Tags (`absuite catalog item-tags`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog item-tags list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-tags. `GET /api/v2/CatalogService/ItemTags` |
| `absuite catalog item-tags count` | Reads |  |  | Count the workspace's item-tags. `GET /api/v2/CatalogService/ItemTags/Count` |
| `absuite catalog item-tags get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-tags. `GET /api/v2/CatalogService/ItemTags/{itemTagId}` |
| `absuite catalog item-tags create` | Writes |  | `--title`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-tags. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CatalogService/ItemTags` |
| `absuite catalog item-tags update` | Writes | `<id>` | `--title`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's item-tags: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CatalogService/ItemTags/{itemTagId}` |
| `absuite catalog item-tags delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-tags; it asks first unless --yes. `DELETE /api/v2/CatalogService/ItemTags/{itemTagId}` |

### Item Types (`absuite catalog item-types`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog item-types list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-types. `GET /api/v2/CatalogService/ItemTypes` |
| `absuite catalog item-types count` | Reads |  |  | Count the workspace's item-types. `GET /api/v2/CatalogService/ItemTypes/Count` |
| `absuite catalog item-types get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-types. `GET /api/v2/CatalogService/ItemTypes/{itemTypeId}` |
| `absuite catalog item-types create` | Writes |  | `--plural-title`, `--singular-title`, `--description`, `--image-url`, `--google-category-taxonomy`, `--item-category-id`, `--item-google-category-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-types. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CatalogService/ItemTypes` |
| `absuite catalog item-types update` | Writes | `<id>` | `--plural-title`, `--singular-title`, `--description`, `--image-url`, `--google-category-taxonomy`; `--json` `--file` `--dry-run` | Change one of the workspace's item-types: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CatalogService/ItemTypes/{itemTypeId}` |
| `absuite catalog item-types delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-types; it asks first unless --yes. `DELETE /api/v2/CatalogService/ItemTypes/{itemTypeId}` |

### Items (`absuite catalog items`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite catalog items list` | Reads |  | `--top` `--skip` | List the catalog items in the workspace. |
| `absuite catalog items count` | Reads |  |  | Count the workspace's items. `GET /api/v2/CatalogService/Items/Count` |
| `absuite catalog items get` | Reads | `<id>` |  | Show one catalog item, drafts included. |
| `absuite catalog items create` | Writes |  | `--sku`, `--upc`, `--ean`, `--mpn`, `--isbn`, `--asin`, `--gtin`, `--sk-us`, `--up-cs`, `--ea-ns`, `--part`, `--name`, `--mp-ns`, `--isb-ns`, `--asi-ns`, `--gti-ns`, `--model`, `--title`, `--color`, `--unspsc`, `--unit-id`, `--series`, `--barcode`, `--unsps-cs`, `--summary`, `--brand-id`, `--pattern`, `--features`, `--material`, `--permalink`, `--brand-name`, `--variations`, `--categories`, `--language-id`, `--item-type-id`, `--category-id`, `--currency-id`, `--unit-group-id`, `--description`, `--ingredients`, `--supplier-code`, `--ships-to-rules`, `--parent-item-id`, `--purchase-note`, `--tariff-heading`, `--mozaic-cover-url`, `--youtube-video-id`, `--nutrition-facts`, `--package-content`, `--primary-image-url`, `--google-categories`, `--short-description`, `--supplier-profile-id`, `--shipping-country-id`, `--system-requirements`, `--custom-tax-description`, `--page-cover-background-url`, `--official-description-url`, `--recently-viewed-record-id`, `--primary-google-category-id`, `--supported-operating-system`, `--primary-google-category-name`, `--hot`, `--on-sale`, `--auction`, `--deleted`, `--digital`, `--pre-sale`, `--taxable`, `--in-stock`, `--trending`, `--featured`, `--low-stock`, `--published`, `--by-request`, `--on-discount`, `--is-daily-deal`, `--is-new-arrival`, `--is-weekly-deal`, `--is-best-seller`, `--is-monthly-deal`, `--has-variations`, `--is-fixed-discount`, `--manage-inventory`, `--is-dealers-choice`, `--is-official-choice`, `--valid-primary-image`, `--is-deadline-discount`, `--tax-included-in-price`, `--display-showcase-tab`, `--is-product-of-the-week`, `--is-product-of-the-month`, `--is-percentage-discount`, `--display-on-global-mozaic`, `--display-on-brands-mozaic`, `--disable-default-policies`, `--display-on-category-mozaic`, `--display-description-editor`, `--display-short-description-editor`, `--display-on-banner-marketing-rotation`, `--views-count`, `--reviews-count`, `--packaged-quantity`, `--recurrency`, `--current-stock`, `--custom-tax-value`, `--width`, `--weight`, `--length`, `--height`, `--total-tax`, `--final-price`, `--reviews-avg`, `--payment-cost`, `--regular-price`, `--discount-price`, `--discount-amount`, `--discount-percentage`, `--estimated-taxes-in-usd`, `--custom-tax-percentage`, `--estimated-profit-in-usd`, `--estimated-base-price-in-usd`, `--estimated-discounts-in-usd`, `--estimated-surcharges-in-usd`, `--estimated-payment-tax-in-usd`, `--estimated-total-price-in-usd`, `--estimated-payment-cost-in-usd`, `--estimated-deal-savings-in-usd`, `--estimated-regular-price-in-usd`, `--estimated-tax-base-price-in-usd`, `--estimated-witholding-taxes-in-usd`, `--estimated-withholding-taxes-in-usd`, `--estimated-default-shipping-tax-in-usd`, `--estimated-default-shipping-cost-in-usd`, `--auction-end`, `--release-date`, `--auction-start`, `--published-date`, `--discount-dead-line`, `--deadline-discount-due-date`, `--deadline-discount-from-date`, `--last-fixed-prices-update-date-time`; `--json` `--file` `--dry-run` | Create a record in the workspace's items. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/CatalogService/Items` |
| `absuite catalog items update` | Writes | `<id>` | `--hot`, `--sku`, `--upc`, `--ean`, `--mpn`, `--sk-us`, `--isbn`, `--up-cs`, `--ea-ns`, `--asin`, `--gtin`, `--mp-ns`, `--part`, `--name`, `--on-sale`, `--isb-ns`, `--asi-ns`, `--gti-ns`, `--width`, `--model`, `--auction`, `--title`, `--color`, `--deleted`, `--digital`, `--pre-sale`, `--taxable`, `--in-stock`, `--isbn13`, `--unspsc`, `--weight`, `--length`, `--height`, `--unit-id`, `--series`, `--featured`, `--brands`, `--trending`, `--low-stock`, `--barcode`, `--unsps-cs`, `--pattern`, `--published`, `--by-request`, `--summary`, `--brand-id`, `--views-count`, `--features`, `--material`, `--on-discount`, `--total-tax`, `--permalink`, `--brand-name`, `--reviews-count`, `--is-daily-deal`, `--language-id`, `--categories`, `--final-price`, `--item-type-id`, `--category-id`, `--currency-id`, `--reviews-avg`, `--is-new-arrival`, `--is-weekly-deal`, `--is-best-seller`, `--unit-group-id`, `--description`, `--ingredients`, `--release-date`, `--is-monthly-deal`, `--recurrency`, `--payment-cost`, `--custom-tax-value`, `--has-variations`, `--questions-count`, `--supplier-code`, `--auction-end`, `--purchase-note`, `--ships-to-rules`, `--regular-price`, `--shipping-cost`, `--parent-item-id`, `--item-type-name`, `--cart-record-id`, `--tariff-heading`, `--packaged-quantity`, `--is-fixed-discount`, `--discount-price`, `--is-dealers-choice`, `--current-stock`, `--manage-inventory`, `--auction-start`, `--nutrition-facts`, `--mozaic-cover-url`, `--package-content`, `--discount-amount`, `--youtube-video-id`, `--in-cart-quantity`, `--is-official-choice`, `--published-date`, `--primary-image-url`, `--valid-primary-image`, `--custom-tax-amount`, `--long-description`, `--compare-record-id`, `--measurement-unit`, `--short-description`, `--google-categories`, `--is-deadline-discount`, `--display-showcase-tab`, `--tax-included-in-price`, `--is-product-of-the-week`, `--supplier-profile-id`, `--shipping-country-id`, `--is-product-of-the-month`, `--system-requirements`, `--is-porcentual-discount`, `--discount-percentage`, `--discount-dead-line`, `--display-on-global-mozaic`, `--display-on-brands-mozaic`, `--custom-tax-percentage`, `--estimated-taxes-in-usd`, `--custom-tax-description`, `--disable-default-policies`, `--estimated-profit-in-usd`, `--display-on-category-mozaic`, `--official-description-url`, `--energy-efficiency-rating`, `--page-cover-background-url`, `--estimated-base-price-in-usd`, `--estimated-discounts-in-usd`, `--operating-system-supported`, `--estimated-surcharges-in-usd`, `--deadline-discount-due-date`, `--deadline-discount-from-date`, `--estimated-regular-price-in-usd`, `--estimated-tax-base-price-in-usd`, `--display-on-banner-marketing-rotation`, `--last-fixed-prices-update-date-time`, `--estimated-witholding-taxes-in-usd`, `--estimated-payment-cost-in-usd`, `--estimated-payment-tax-in-usd`, `--estimated-default-shipping-cost-in-usd`, `--estimated-default-shipping-tax-in-usd`, `--estimated-total-price-in-usd`, `--recently-viewed-record-id`, `--display-description-editor`, `--primary-google-category-id`, `--supported-operating-system`, `--estimated-deal-savings-in-usd`, `--primary-google-category-name`, `--display-short-description-editor`, `--estimated-withholding-taxes-in-usd`; `--json` `--file` `--dry-run` | Change one of the workspace's items: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/CatalogService/Items/{itemId}` |
| `absuite catalog items delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's items; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}` |
| `absuite catalog items extended show` | Reads |  | `--item-id` (required); `--columns` | Show the workspace's items extended. `GET /api/v2/CatalogService/Items/{itemId}/Extended` |
| `absuite catalog items max-price show` | Reads |  | `--columns` | Show the workspace's items max-price. `GET /api/v2/CatalogService/Items/MaxPrice` |
| `absuite catalog items min-price show` | Reads |  | `--columns` | Show the workspace's items min-price. `GET /api/v2/CatalogService/Items/MinPrice` |
| `absuite catalog items reviews create` | Writes |  | `--item-id` (required), `--review-score`, `--review-message`, `--social-profile-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's items reviews. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/CatalogService/Items/{itemId}/Reviews` |
| `absuite catalog items attachments delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items attachments; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/Attachments/{itemAttachmentId}` |
| `absuite catalog items brands delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items brands; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/Brands/{itemBrandId}` |
| `absuite catalog items categories delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items categories; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/Categories/{itemCategoryId}` |
| `absuite catalog items google-categories delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items google-categories; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/GoogleCategories/{googleCategoryId}` |
| `absuite catalog items images delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items images; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/Images/{itemImageId}` |
| `absuite catalog items questions delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items questions; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/Questions/{itemQuestionId}` |
| `absuite catalog items return-policies delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items return-policies; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/ReturnPolicies/{returnPolicyId}` |
| `absuite catalog items reviews delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items reviews; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/Reviews/{itemReviewId}` |
| `absuite catalog items shipping-policies delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items shipping-policies; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/ShippingPolicies/{shippingPolicyId}` |
| `absuite catalog items tags delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items tags; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/Tags/{itemTagId}` |
| `absuite catalog items tax-policies delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items tax-policies; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/TaxPolicies/{itemTaxPolicyId}` |
| `absuite catalog items types delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items types; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/Types/{itemTypeId}` |
| `absuite catalog items warranty-policies delete` | Writes | `<id>` | `--item-id` (required); `--yes` `--dry-run` | Delete one of the workspace's items warranty-policies; it asks first unless --yes. `DELETE /api/v2/CatalogService/Items/{itemId}/WarrantyPolicies/{warrantyPolicyId}` |

## Example

```bash
absuite catalog item-attachments list --top 5 -o json --query "[].id"
absuite catalog item-attribute-options create --name <value> --description <value> --dry-run   # prints the POST, sends nothing
absuite catalog item-attribute-options create --name <value> --description <value> -o json --no-input
```
