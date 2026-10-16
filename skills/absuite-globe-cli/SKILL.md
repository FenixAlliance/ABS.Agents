---
name: absuite-globe-cli
description: >
  Look up global reference data — countries, states, cities, currencies, languages, and
  timezones — using the `absuite` CLI's `globe` service. This is PUBLIC, read-only reference
  data, so only list/get-style commands exist (no create/update/delete). Requires an
  authenticated CLI session (see absuite-login-cli). For raw HTTP, use the absuite-globe
  (REST) skill.
---

# Alliance Business Suite — Globe Skill (CLI)

Query the platform's **global reference data** through the `absuite` CLI's `globe` service:
countries (and their states, cities, currencies, languages, timezones, calling codes, and
top-level domains), plus standalone currency, language, and timezone catalogs. This data is
**public and read-only** — the only commands are list / count / get / search lookups. There
are **no create, update, or delete commands, and no PATCH** on this service.

> For general CLI setup (login, config, command discovery), see `absuite-login-cli` and
> `absuite-cli`. For raw HTTP / curl, see the REST skill `absuite-globe`.

## API usage essentials

> Full detail in `absuite-cli`.

- This service is **read-only** (list / get / count) — no `update`/`create`.
- Use **`count <entity>`** to size a collection. OData filtering/paging is REST-only (not exposed by the CLI) — use the `absuite-globe` REST skill for filtered queries.

## Prerequisites

1. **Authenticate first:** `absuite login` (see `absuite-login-cli`).
2. **No tenant needed.** `GlobeService` is public global reference data and is **not
   tenant-scoped** — you do **not** need `absuite config set --tenant-id <guid>` or a
   `--TenantId` argument for any `globe` command. Any tenant value is ignored.
3. **Discover commands:** `absuite globe list-commands`, and `absuite globe <command> --help`
   for the parameters of a specific command.

## Command structure

```
absuite globe <verb> <entity> --Param value
```

The canonical PowerShell function-name form also works, e.g.
`absuite globe Get-AllCountries` or `absuite globe Get-CurrencyByIdAsync --CurrencyId <id>`.
Because this service is read-only, the available verbs are limited to **list / count / get /
search** — there is no create/update/delete/patch.

### Identifiers are opaque ids

Every id parameter (`--CountryId`, `--CountryStateId`, `--CurrencyId`, `--LanguageId`,
`--TimeZoneId`) is the record's internal `Id` string, matched against the primary key — **not**
an ISO code. To get a valid id, first **list** or **search** the resource and read the `Id`
field, then pass that value. ISO/code fields (`Iso3`, `Iso2`, `Code`, `Iso6391`, `Iso6392`)
appear in the output to help you pick the right record, but are not what the id parameters
expect.

## Countries

```bash
# List all countries
absuite globe Get-AllCountries

# Count countries
absuite globe Invoke-CountCountries

# Search countries by name (required: --CountryName)
absuite globe Search-CountriesByNameAsync --CountryName "United"

# Get a single country by its id
absuite globe Get-CountryById --CountryId <country-id>
```

### States / Provinces

```bash
# List states for a country
absuite globe Get-CountryStatesAsync --CountryId <country-id>

# Count states for a country
absuite globe Invoke-CountCountryStatesAsync --CountryId <country-id>

# Get a single state by its id (within a country)
absuite globe Get-CountryStateByIdAsync --CountryStateId <state-id> --CountryId <country-id>
```

### Cities (within a state)

```bash
# List cities for a state
absuite globe Get-CitiesByCountryStateIdAsync --CountryStateId <state-id> --CountryId <country-id>

# Count cities for a state
absuite globe Invoke-CountCitiesByStateAsync --CountryStateId <state-id> --CountryId <country-id>
```

### Country-related lookups

```bash
# Calling codes for a country
absuite globe Get-CallingCodesByCountryIdAsync --CountryId <country-id>
absuite globe Invoke-CountCallingCodesByCountryAsync --CountryId <country-id>

# Enabled currencies for a country
absuite globe Get-EnabledCurrenciesByCountryIdAsync --CountryId <country-id>

# Timezones for a country
absuite globe Get-TimeZonesByCountryIdAsync --CountryId <country-id>
absuite globe Invoke-CountTimezonesByCountryAsync --CountryId <country-id>

# Top-level domains for a country
absuite globe Get-TopLevelDomainsByCountryIdAsync --CountryId <country-id>
absuite globe Invoke-CountTopLevelDomainsByCountryAsync --CountryId <country-id>
```

## Currencies

```bash
# List all enabled currencies
absuite globe Get-EnabledCurrenciesAsync

# Count currencies
absuite globe Invoke-CountCurrenciesAsync

# Get a single currency by its id
absuite globe Get-CurrencyByIdAsync --CurrencyId <currency-id>
```

Currency records expose `Code`, `Name`, `Symbol`, and a nested `Country`. Match on `Code`,
but pass the record's `Id` to `--CurrencyId`.

## Languages

```bash
# List all languages
absuite globe Get-LanguagesAsync

# Count languages
absuite globe Invoke-CountLanguagesAsync

# Get a single language by its id
absuite globe Get-LanguageByIdAsync --LanguageId <language-id>
```

Language records expose `Iso6391`, `Iso6392`, `Enabled`, `Name`, and `LanguageNativeName`.
Match on the ISO fields, but pass the record's `Id` to `--LanguageId`.

## Timezones

```bash
# List all timezones
absuite globe Get-TimeZonesAsync

# Count timezones
absuite globe Invoke-CountTimezonesAsync

# Get a single timezone by its id
absuite globe Get-TimeZoneByIdAsync --TimeZoneId <timezone-id>
```

Timezone records expose `Name`, `UtcOffset`, and a read-only `DisplayName`.

> **Parameter casing:** the timezone get-by-id parameter is `--TimeZoneId` (capital `Z`).

## End-to-end workflow: resolve an address's geography

Discover ids, then use them:

```bash
# 1. Find the country, read result[].Id (match on Name / Iso3 / Iso2)
absuite globe Search-CountriesByNameAsync --CountryName "Colombia"
#   -> <country-id>

# 2. List that country's states, read the matching state's Id
absuite globe Get-CountryStatesAsync --CountryId <country-id>
#   -> <state-id>

# 3. List that state's cities, read the matching city's Id
absuite globe Get-CitiesByCountryStateIdAsync --CountryStateId <state-id> --CountryId <country-id>
#   -> <city-id>

# 4. (Optional) resolve the country's enabled currency
absuite globe Get-EnabledCurrenciesByCountryIdAsync --CountryId <country-id>
```

## CLI Commands Quick Reference

| Action | CLI command |
|---|---|
| List all countries | `absuite globe Get-AllCountries` |
| Count countries | `absuite globe Invoke-CountCountries` |
| Search countries by name | `absuite globe Search-CountriesByNameAsync --CountryName "<term>"` |
| Get country by id | `absuite globe Get-CountryById --CountryId <country-id>` |
| List states for a country | `absuite globe Get-CountryStatesAsync --CountryId <country-id>` |
| Count states for a country | `absuite globe Invoke-CountCountryStatesAsync --CountryId <country-id>` |
| Get state by id | `absuite globe Get-CountryStateByIdAsync --CountryStateId <state-id> --CountryId <country-id>` |
| List cities for a state | `absuite globe Get-CitiesByCountryStateIdAsync --CountryStateId <state-id> --CountryId <country-id>` |
| Count cities for a state | `absuite globe Invoke-CountCitiesByStateAsync --CountryStateId <state-id> --CountryId <country-id>` |
| List calling codes for a country | `absuite globe Get-CallingCodesByCountryIdAsync --CountryId <country-id>` |
| Count calling codes for a country | `absuite globe Invoke-CountCallingCodesByCountryAsync --CountryId <country-id>` |
| List enabled currencies for a country | `absuite globe Get-EnabledCurrenciesByCountryIdAsync --CountryId <country-id>` |
| List timezones for a country | `absuite globe Get-TimeZonesByCountryIdAsync --CountryId <country-id>` |
| Count timezones for a country | `absuite globe Invoke-CountTimezonesByCountryAsync --CountryId <country-id>` |
| List top-level domains for a country | `absuite globe Get-TopLevelDomainsByCountryIdAsync --CountryId <country-id>` |
| Count top-level domains for a country | `absuite globe Invoke-CountTopLevelDomainsByCountryAsync --CountryId <country-id>` |
| List all currencies | `absuite globe Get-EnabledCurrenciesAsync` |
| Count currencies | `absuite globe Invoke-CountCurrenciesAsync` |
| Get currency by id | `absuite globe Get-CurrencyByIdAsync --CurrencyId <currency-id>` |
| List all languages | `absuite globe Get-LanguagesAsync` |
| Count languages | `absuite globe Invoke-CountLanguagesAsync` |
| Get language by id | `absuite globe Get-LanguageByIdAsync --LanguageId <language-id>` |
| List all timezones | `absuite globe Get-TimeZonesAsync` |
| Count timezones | `absuite globe Invoke-CountTimezonesAsync` |
| Get timezone by id | `absuite globe Get-TimeZoneByIdAsync --TimeZoneId <timezone-id>` |

## Critical Rules

- **Read-only & public.** No create/update/delete commands, and **no PATCH** — `GlobeService`
  is reference data. For mutations you are on the wrong service.
- **No tenant scoping.** Never pass `--TenantId` (or set a default tenant) for `globe`
  commands; it is ignored.
- **Id parameters take opaque `Id` values**, not ISO codes. Discover the `Id` via a
  list/search command first; ISO/code fields are only for recognising the right record.
- **Search is country-only and requires `--CountryName`.**
- **For raw HTTP / curl, use the `absuite-globe` (REST) skill** — the `absuite` CLI does not
  support patch operations.
