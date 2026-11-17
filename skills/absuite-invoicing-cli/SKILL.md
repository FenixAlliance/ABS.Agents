---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-invoicing-cli
key: fenixalliance.absuite.invoicing-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Invoicing area with the absuite CLI: 37 commands (21 read,
  16 write) under `absuite invoicing`, each generated from the platform's ServiceClients and checked
  against `absuite commands -o json`. For routes the CLI does not cover, use the absuite-invoicing
  REST skill.
---

# Alliance Business Suite — Invoicing Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-invoicing` REST skill documents 33 routes; 13 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-invoicing` REST skill.

## Commands

37 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Invoices (`absuite invoicing invoices`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite invoicing invoices list` | Reads |  | `--top` `--skip` | List the invoices in the workspace. |
| `absuite invoicing invoices count` | Reads |  |  | Count the workspace's invoices. `GET /api/v2/InvoicingService/Invoices/Count` |
| `absuite invoicing invoices get` | Reads | `<id>` |  | Show one invoice. |
| `absuite invoicing invoices create` | Writes |  | `--paid`, `--number`, `--notes`, `--order-id`, `--enumeration`, `--payment-mode-id`, `--enumeration-range-id`, `--emisor-billing-profile-id`, `--receiver-billing-profile-id`, `--emisor-wallet-account-id`, `--receiver-wallet-account-id`, `--customer-notes`, `--invoice-type`, `--document-type`, `--invoice-status`, `--payment-due`, `--valid-from`, `--valid-to`, `--closed`, `--title`, `--price-list-id`, `--description`, `--individual-id`, `--payment-term-id`, `--organization-id`, `--receiver-tenant-id`, `--first-name`, `--last-name`, `--company-name`, `--billing-email`, `--address-line1`, `--address-line2`, `--postal-code`, `--country-id`, `--state-id`, `--city-id`, `--forex-rate`, `--currency-id`, `--total-detail`, `--total-detail-currency-id`, `--total-profit`, `--total-profit-currency-id`, `--total-discounts`, `--total-discounts-currency-id`, `--total-surcharges`, `--total-surcharges-currency-id`, `--total-shipping-cost`, `--total-shipping-cost-currency-id`, `--total-shipping-tax`, `--total-shipping-tax-currency-id`, `--total-withheld-tax`, `--total-withheld-tax-currency-id`, `--total-tax-base`, `--total-tax-base-currency-id`, `--total-taxes`, `--total-taxes-currency-id`, `--total-global-surcharges`, `--total-global-surcharges-currency-id`, `--total-global-discounts`, `--total-global-discounts-currency-id`, `--total`, `--total-currency-id`, `--cost-calculation-method`, `--tax-calculation-method`; `--json` `--file` `--dry-run` | Create a record in the workspace's invoices. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/InvoicingService/Invoices` |
| `absuite invoicing invoices update` | Writes | `<id>` | `--paid`, `--number`, `--notes`, `--order-id`, `--enumeration`, `--payment-mode-id`, `--enumeration-range-id`, `--emisor-billing-profile-id`, `--receiver-billing-profile-id`, `--emisor-wallet-account-id`, `--receiver-wallet-account-id`, `--customer-notes`, `--invoice-type`, `--document-type`, `--invoice-status`, `--payment-due`, `--valid-from`, `--valid-to`, `--closed`, `--title`, `--price-list-id`, `--description`, `--individual-id`, `--payment-term-id`, `--organization-id`, `--receiver-tenant-id`, `--first-name`, `--last-name`, `--company-name`, `--billing-email`, `--address-line1`, `--address-line2`, `--postal-code`, `--country-id`, `--state-id`, `--city-id`, `--billing-location-id`, `--shipping-location-id`, `--shipping-method-id`, `--forex-rate`, `--currency-id`, `--total-detail`, `--total-detail-currency-id`, `--total-profit`, `--total-profit-currency-id`, `--total-discounts`, `--total-discounts-currency-id`, `--total-surcharges`, `--total-surcharges-currency-id`, `--total-shipping-tax`, `--total-shipping-tax-currency-id`, `--total-shipping-cost`, `--total-shipping-cost-currency-id`, `--total-global-discounts`, `--total-global-discounts-currency-id`, `--total-global-surcharges`, `--total-global-surcharges-currency-id`, `--total-withheld-tax`, `--total-withheld-tax-currency-id`, `--total-tax-base`, `--total-tax-base-currency-id`, `--total-taxes`, `--total-taxes-currency-id`, `--total`, `--total-currency-id`, `--cost-calculation-method`, `--tax-calculation-method`; `--json` `--file` `--dry-run` | Change one of the workspace's invoices: reads it, applies --json/--file and the field flags, then saves it. Never set here: user-id (set by the server). `PUT /api/v2/InvoicingService/Invoices/{invoiceId}` |
| `absuite invoicing invoices delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's invoices; it asks first unless --yes. `DELETE /api/v2/InvoicingService/Invoices/{invoiceId}` |
| `absuite invoicing invoices adjustments list` | Reads |  | `--invoice-id` (required); `--top` `--skip` `--columns` | List the workspace's invoices adjustments. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments` |
| `absuite invoicing invoices extended list` | Reads |  | `--columns` | List the workspace's invoices extended. `GET /api/v2/InvoicingService/Invoices/Extended` |
| `absuite invoicing invoices lines list` | Reads |  | `--invoice-id` (required); `--top` `--skip` `--columns` | List the workspace's invoices lines. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/Lines` |
| `absuite invoicing invoices references list` | Reads |  | `--invoice-id` (required); `--top` `--skip` `--columns` | List the workspace's invoices references. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/References` |
| `absuite invoicing invoices adjustments count` | Reads |  | `--invoice-id` (required) | Count the workspace's invoices adjustments. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments/Count` |
| `absuite invoicing invoices lines count` | Reads |  | `--invoice-id` (required) | Count the workspace's invoices lines. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/Lines/Count` |
| `absuite invoicing invoices references count` | Reads |  | `--invoice-id` (required) | Count the workspace's invoices references. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/References/Count` |
| `absuite invoicing invoices adjustments get` | Reads | `<id>` | `--invoice-id` (required); `--columns` | Show one of the workspace's invoices adjustments. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments/{adjustmentId}` |
| `absuite invoicing invoices lines get` | Reads | `<id>` | `--invoice-id` (required); `--columns` | Show one of the workspace's invoices lines. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}` |
| `absuite invoicing invoices references get` | Reads | `<id>` | `--invoice-id` (required); `--columns` | Show one of the workspace's invoices references. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/References/{invoiceReferenceId}` |
| `absuite invoicing invoices creditable-amount show` | Reads |  | `--invoice-id` (required); `--columns` | Show the workspace's invoices creditable-amount. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/CreditableAmount` |
| `absuite invoicing invoices extended show` | Reads |  | `--invoice-id` (required); `--columns` | Show the workspace's invoices extended. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/Extended` |
| `absuite invoicing invoices lines show` | Reads |  | `--invoice-id` (required); `--columns` | Show the workspace's invoices lines. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/Lines` |
| `absuite invoicing invoices adjustments create` | Writes |  | `--invoice-id` (required), `--currency-id`, `--priority`, `--code`, `--description`, `--surcharge-percent`, `--surcharge-amount`, `--discount-percent`, `--discount-amount`, `--total-surcharge`, `--total-discount`; `--json` `--file` `--dry-run` | Create a record in the workspace's invoices adjustments. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments` |
| `absuite invoicing invoices credit-notes create` | Writes |  | `--invoice-id` (required), `--amount`, `--reason`, `--reason-description`; `--json` `--file` `--dry-run` | Create a record in the workspace's invoices credit-notes. `POST /api/v2/InvoicingService/Invoices/{invoiceId}/CreditNotes` |
| `absuite invoicing invoices debit-notes create` | Writes |  | `--invoice-id` (required), `--amount`, `--reason`, `--reason-description`; `--json` `--file` `--dry-run` | Create a record in the workspace's invoices debit-notes. `POST /api/v2/InvoicingService/Invoices/{invoiceId}/DebitNotes` |
| `absuite invoicing invoices lines create` | Writes |  | `--invoice-id` (required), `--item-id`, `--unit-id`, `--currency-id`, `--price-list-id`, `--unit-group-id`, `--discount-list-id`, `--rounding-policy-id`, `--price`, `--percent`; `--json` `--file` `--dry-run` | Create a record in the workspace's invoices lines. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/InvoicingService/Invoices/{invoiceId}/Lines` |
| `absuite invoicing invoices references create` | Writes |  | `--invoice-id` (required), `--referenced-invoice-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's invoices references. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/InvoicingService/Invoices/{invoiceId}/References` |
| `absuite invoicing invoices adjustments update` | Writes | `<id>` | `--invoice-id` (required), `--currency-id`, `--priority`, `--code`, `--description`, `--surcharge-percent`, `--surcharge-amount`, `--discount-percent`, `--discount-amount`, `--total-surcharge`, `--total-discount`; `--json` `--file` `--dry-run` | Change one of the workspace's invoices adjustments: reads it, applies --json/--file and the field flags, then saves it. Never set here: type (not settable: discriminator (TPH rule)). `PUT /api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments/{adjustmentId}` |
| `absuite invoicing invoices references update` | Writes | `<id>` | `--invoice-id` (required), `--referenced-invoice-id`; `--json` `--file` `--dry-run` | Change one of the workspace's invoices references: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/InvoicingService/Invoices/{invoiceId}/References/{invoiceReferenceId}` |
| `absuite invoicing invoices adjustments delete` | Writes | `<id>` | `--invoice-id` (required); `--yes` `--dry-run` | Delete one of the workspace's invoices adjustments; it asks first unless --yes. `DELETE /api/v2/InvoicingService/Invoices/{invoiceId}/Adjustments/{adjustmentId}` |
| `absuite invoicing invoices lines delete` | Writes | `<id>` | `--invoice-id` (required); `--yes` `--dry-run` | Delete one of the workspace's invoices lines; it asks first unless --yes. `DELETE /api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}` |
| `absuite invoicing invoices references delete` | Writes | `<id>` | `--invoice-id` (required); `--yes` `--dry-run` | Delete one of the workspace's invoices references; it asks first unless --yes. `DELETE /api/v2/InvoicingService/Invoices/{invoiceId}/References/{invoiceReferenceId}` |
| `absuite invoicing invoices lines taxes list` | Reads |  | `--invoice-id` (required), `--invoice-line-id` (required); `--top` `--skip` `--columns` | List the workspace's invoices lines taxes. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Taxes` |
| `absuite invoicing invoices lines taxes count` | Reads |  | `--invoice-id` (required), `--invoice-line-id` (required) | Count the workspace's invoices lines taxes. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Taxes/Count` |
| `absuite invoicing invoices lines taxes get` | Reads | `<id>` | `--invoice-id` (required), `--invoice-line-id` (required); `--columns` | Show one of the workspace's invoices lines taxes. `GET /api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Taxes/{invoiceLineTaxId}` |
| `absuite invoicing invoices purchase-invoices sum show` | Reads |  | `--columns` | Show the workspace's invoices purchase-invoices sum. `GET /api/v2/InvoicingService/Invoices/PurchaseInvoices/Sum` |
| `absuite invoicing invoices sales-invoices sum show` | Reads |  | `--columns` | Show the workspace's invoices sales-invoices sum. `GET /api/v2/InvoicingService/Invoices/SalesInvoices/Sum` |
| `absuite invoicing invoices lines taxes create` | Writes |  | `--invoice-id` (required), `--invoice-line-id` (required), `--tax-policy-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's invoices lines taxes. Only in --json: invoice-id. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Taxes` |
| `absuite invoicing invoices lines taxes update` | Writes | `<id>` | `--invoice-id` (required), `--invoice-line-id` (required), `--tax-policy-id`; `--json` `--file` `--dry-run` | Change one of the workspace's invoices lines taxes: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Taxes/{invoiceLineTaxId}` |
| `absuite invoicing invoices lines taxes delete` | Writes | `<id>` | `--invoice-id` (required), `--invoice-line-id` (required); `--yes` `--dry-run` | Delete one of the workspace's invoices lines taxes; it asks first unless --yes. `DELETE /api/v2/InvoicingService/Invoices/{invoiceId}/Lines/{invoiceLineId}/Taxes/{invoiceLineTaxId}` |

## Example

```bash
absuite invoicing invoices extended list -o json --query "[].id"
absuite invoicing invoices create --paid <value> --number <value> --dry-run   # prints the POST, sends nothing
absuite invoicing invoices create --paid <value> --number <value> -o json --no-input
```

## Key Concepts

- **InvoiceType** — `PurchaseInvoice` | `SalesInvoice` | `CreditNote` | `DebitNote`.
- **DocumentType** — `Standard` | `DebitNote` | `CreditNote`.
- **InvoiceStatus** — `Draft` | `Closed` | `Signed` | `Expired` | `Paid`.
- **CostCalculationMethod** — `Automatic` | `Custom`.
- **TaxCalculationMethod** — `Included` | `Excluded`.
- **Adjustment `Type`** — `Discount` | `Surcharge`.
- Monetary amounts are split into a value field and a matching `…CurrencyId` field
  (e.g. `Total` + `TotalCurrencyId`).
