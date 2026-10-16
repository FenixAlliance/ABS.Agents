---
name: absuite-forex-cli
description: >
  Retrieve foreign-exchange rates and convert currency amounts in the Alliance
  Business Suite (ABS) ForexService using the `absuite` CLI. Covers latest and
  historical rate lookups (all currencies or a single currency) and currency
  exchange at latest or historical rates (v2 and v3), via get/list and exchange
  commands. ForexService is PUBLIC reference data and is NOT tenant-scoped.
  Requires an authenticated CLI session (see absuite-login-cli). For raw HTTP,
  use the absuite-forex (REST) skill.
---

# Alliance Business Suite — Forex Skill (CLI)

Retrieve currency exchange rates and convert monetary amounts through the `absuite` CLI's `forex` service. ForexService exposes **public reference data** — every command is a read, there are **no** create/update/delete commands, and the service is **not** tenant-scoped (do not pass `--TenantId`). The CLI does not support PATCH (and ForexService has no PATCH surface anyway — see `absuite-forex` REST skill for the read-only REST reference).

## API usage essentials

> Full detail in `absuite-cli`.

- This service is **read-only** (list / get / count) — no `update`/`create`.
- Use **`count <entity>`** to size a collection. OData filtering/paging is REST-only (not exposed by the CLI) — use the `absuite-forex` REST skill for filtered queries.

## Prerequisites

1. **Authenticate first** — run `absuite login` (see `absuite-login-cli`). For general CLI usage, command discovery, and configuration, see `absuite-cli`.
2. **No tenant required.** ForexService is public reference data — do **not** pass `--TenantId`; it is ignored. (You do not need to `absuite config set --tenant-id` for forex commands.)
3. **Discover commands:**
   ```powershell
   absuite forex list-commands
   absuite forex get latest-currency-rate --help
   ```

## Command Structure

```
absuite forex <verb> <entity> --Param value
absuite forex <FunctionName> --Param value
```

- **Verbs:** `get` and `list` (rate lookups) plus the `exchange` actions (currency conversion). There are **no** `create`, `update`, or `delete` verbs for this service.
- The canonical PowerShell **function-name** form also works as the command and is the most reliable. ForexService function names:
  - Exchange (convert an amount): `Invoke-ExchangeAmountAsync` (v2 latest), `Invoke-ExchangeAmountHistoricalAsync` (v2 historical), `Invoke-ExchangeAmountV3Async` (v3 latest), `Invoke-ExchangeAmountHistoricalV3Async` (v3 historical).
  - Rates (read rates): `Get-LatestCurrencyRatesModelAsync` (all latest), `Get-LatestCurrencyRateAsync` (one currency, latest), `Get-HistoricalCurrencyRatesAsync` (all historical), `Get-HistoricalCurrencyRateAsync` (one currency, historical).
- **Parameter names are case-sensitive** and use PascalCase: `--Amount`, `--SourceCurrencyId`, `--TargetCurrencyId`, `--Date`, `--CurrencyId`, `--ApiVersion`, `--XApiVersion`.
- Run `absuite forex list-commands` and `--help` to confirm the human-friendly alias spellings before relying on them; the function-name form above is transcribed from the SDK and always valid.

## Key Concepts

- **Currency identifiers** are passed via `--SourceCurrencyId` / `--TargetCurrencyId` (exchange) or `--CurrencyId` (single-currency rate). Discover valid identifiers with the Globe service (`absuite globe ...`) rather than assuming a format.
- **Latest vs Historical** — "latest" commands take no date; "historical" exchange commands require `--Date` (ISO 8601, e.g. `2026-01-15T00:00:00Z`), and historical rate commands accept an optional `--Date`.
- **v2 vs v3 exchange** — the v2 exchange returns a `Money` result (`amount` + `currency`); the v3 exchange returns an `ExchangeRate` result (`source`, `target`, `rate`, each a `Money`). Both versions take the same parameters.
- **Result payloads** — `Money` (`amount`, `currency`), `ExchangeRate` (`source`, `target`, `rate`), `ForexRatesDto` (`success`, `date`, `base`, `timestamp`, `requestTimestamp`, `rates`).
- **API version selectors** — rate commands accept optional `--ApiVersion` and `--XApiVersion`; omit them unless you need to pin a version.

## Exchange currency (conversion)

### Exchange at latest rates (v2 → Money)

Required: `--Amount`, `--SourceCurrencyId`, `--TargetCurrencyId`.

```powershell
absuite forex exchange amount --Amount 1000 --SourceCurrencyId <source-currency-id> --TargetCurrencyId <target-currency-id>
# canonical:
absuite forex Invoke-ExchangeAmountAsync --Amount 1000 --SourceCurrencyId <source-currency-id> --TargetCurrencyId <target-currency-id>
```

### Exchange at historical rates (v2 → Money)

Required: `--Amount`, `--SourceCurrencyId`, `--TargetCurrencyId`, `--Date`.

```powershell
absuite forex exchange amount-historical --Amount 1000 --SourceCurrencyId <source-currency-id> --TargetCurrencyId <target-currency-id> --Date 2026-01-15T00:00:00Z
# canonical:
absuite forex Invoke-ExchangeAmountHistoricalAsync --Amount 1000 --SourceCurrencyId <source-currency-id> --TargetCurrencyId <target-currency-id> --Date 2026-01-15T00:00:00Z
```

### Exchange at latest rates (v3 → ExchangeRate)

Required: `--Amount`, `--SourceCurrencyId`, `--TargetCurrencyId`.

```powershell
absuite forex Invoke-ExchangeAmountV3Async --Amount 1000 --SourceCurrencyId <source-currency-id> --TargetCurrencyId <target-currency-id>
```

### Exchange at historical rates (v3 → ExchangeRate)

Required: `--Amount`, `--SourceCurrencyId`, `--TargetCurrencyId`, `--Date`.

```powershell
absuite forex Invoke-ExchangeAmountHistoricalV3Async --Amount 1000 --SourceCurrencyId <source-currency-id> --TargetCurrencyId <target-currency-id> --Date 2026-01-15T00:00:00Z
```

## Get rates

### Latest rates for all currencies (→ ForexRatesDto)

Optional: `--ApiVersion`, `--XApiVersion`.

```powershell
absuite forex get latest-currency-rates-model
# canonical:
absuite forex Get-LatestCurrencyRatesModelAsync
```

### Latest rate for a single currency (→ ExchangeRate)

Required: `--CurrencyId`. Optional: `--ApiVersion`, `--XApiVersion`.

```powershell
absuite forex get latest-currency-rate --CurrencyId <currency-id>
# canonical:
absuite forex Get-LatestCurrencyRateAsync --CurrencyId <currency-id>
```

### Historical rates for all currencies (→ ForexRatesDto)

Optional: `--Date`, `--ApiVersion`, `--XApiVersion`.

```powershell
absuite forex get historical-currency-rates --Date 2026-01-15T00:00:00Z
# canonical:
absuite forex Get-HistoricalCurrencyRatesAsync --Date 2026-01-15T00:00:00Z
```

### Historical rate for a single currency (→ ExchangeRate)

Required: `--CurrencyId`. Optional: `--Date`, `--ApiVersion`, `--XApiVersion`.

```powershell
absuite forex get historical-currency-rate --CurrencyId <currency-id> --Date 2026-01-15T00:00:00Z
# canonical:
absuite forex Get-HistoricalCurrencyRateAsync --CurrencyId <currency-id> --Date 2026-01-15T00:00:00Z
```

## Workflow example

```powershell
# 1. (Discovery) find valid currency identifiers via the Globe service.
absuite globe list-commands

# 2. Read the latest rate for a single currency.
absuite forex get latest-currency-rate --CurrencyId <currency-id>

# 3. Convert an amount at the latest rate (v2 -> Money).
absuite forex exchange amount --Amount 1000 --SourceCurrencyId <source-currency-id> --TargetCurrencyId <target-currency-id>

# 4. Convert the same amount as of a historical date (v3 -> ExchangeRate incl. the rate used).
absuite forex Invoke-ExchangeAmountHistoricalV3Async --Amount 1000 --SourceCurrencyId <source-currency-id> --TargetCurrencyId <target-currency-id> --Date 2026-01-15T00:00:00Z
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| Exchange amount at latest rates (v2 → Money) | `absuite forex Invoke-ExchangeAmountAsync --Amount 1000 --SourceCurrencyId <src> --TargetCurrencyId <tgt>` |
| Exchange amount at historical rates (v2 → Money) | `absuite forex Invoke-ExchangeAmountHistoricalAsync --Amount 1000 --SourceCurrencyId <src> --TargetCurrencyId <tgt> --Date <iso-date>` |
| Exchange amount at latest rates (v3 → ExchangeRate) | `absuite forex Invoke-ExchangeAmountV3Async --Amount 1000 --SourceCurrencyId <src> --TargetCurrencyId <tgt>` |
| Exchange amount at historical rates (v3 → ExchangeRate) | `absuite forex Invoke-ExchangeAmountHistoricalV3Async --Amount 1000 --SourceCurrencyId <src> --TargetCurrencyId <tgt> --Date <iso-date>` |
| Get latest currency rates (all) | `absuite forex Get-LatestCurrencyRatesModelAsync` |
| Get latest rate for a currency | `absuite forex Get-LatestCurrencyRateAsync --CurrencyId <currency-id>` |
| Get historical currency rates (all) | `absuite forex Get-HistoricalCurrencyRatesAsync --Date <iso-date>` |
| Get historical rate for a currency | `absuite forex Get-HistoricalCurrencyRateAsync --CurrencyId <currency-id> --Date <iso-date>` |

## Critical Rules

- **No tenant.** ForexService is public reference data — do not pass `--TenantId`; it is ignored.
- **No PATCH, no create/update/delete.** This is a read-only service. The `absuite` CLI has no `patch` verb anyway; for raw HTTP see the `absuite-forex` REST skill.
- **`--Date` is required for historical exchange, optional for historical rates.** The two historical *exchange* commands require `--Date`; the two historical *rate* commands accept an optional `--Date`.
- **Confirm alias spellings with `--help`.** Use `absuite forex list-commands` and `--help` to verify the human-friendly verb/entity aliases; the canonical function-name form (e.g. `Invoke-ExchangeAmountAsync`) is always valid.
- **Parameter names are case-sensitive PascalCase** — `--Amount`, `--SourceCurrencyId`, `--TargetCurrencyId`, `--Date`, `--CurrencyId`.
- **Parse the envelope** — check `isSuccess`, then read `result`.
