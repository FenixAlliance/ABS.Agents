---
name: absuite-globe
description: >
  Look up global reference data — countries, states, cities, currencies, languages,
  timezones, calling codes, and top-level domains — via the Alliance Business Suite (ABS)
  REST API. This is PUBLIC, read-only reference data: endpoints are NOT tenant-scoped and
  take no tenantId. Send a bearer token for consistency (see the absuite-login skill).
---

# Alliance Business Suite — Globe Skill (REST)

`GlobeService` exposes the platform's **global reference data**: the canonical lists of
countries (and their states, cities, currencies, languages, timezones, calling codes, and
top-level domains), plus standalone currency, language, and timezone catalogs. This data is
**public and read-only** — there are no create / update / delete operations, and **no PATCH
endpoint exists** on this service. Use it to resolve foreign-key lookups when populating
other entities (e.g. an address's country/state/city, an invoice's currency, a user's
language or timezone).

> For the CLI equivalent, see `absuite-globe-cli`. For general REST conventions (auth,
> envelope, error handling), see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`.

- This service is **read-only** (no create/update/delete), so there are no `PUT`/`PATCH` data-loss concerns.
- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select`; each dedicated `.../Count` endpoint returns an integer and is also filterable. OData is a REST/HTTP-layer feature (the CLI does not expose it).

## Authentication

`GlobeService` is public reference data and is not tenant-scoped, but the platform's standard
is to send a bearer token on every API call. Obtain one once and reuse it:

```bash
# 1. Obtain a bearer token
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<your-email>", "password": "<your-password>"}'
# -> response contains "accessToken"

# 2. Send it on every subsequent request
#   -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

- **Base path:** `$ABSUITE_HOST_URL/api/v2/GlobeService/<Resource>`
- **No tenant scoping.** Do **not** add `?tenantId=` or an `X-TenantId` header to these
  endpoints — they are global/public and any tenant value is ignored.
- **Response envelope:** every call returns
  `{ "isSuccess": bool, "errorMessage": str|null, "correlationId": str, "timestamp": str, "result": <data|array|int|null> }`.
  Always check `isSuccess`, then read the payload from `result`.
- **Optional API-version params** are accepted on every endpoint: `?api-version=<v>` (query)
  or the `x-api-version: <v>` header. Both are optional; omit them unless you need to pin a
  version.

## Key Concepts

- **Identifiers are opaque.** Every path id (`{countryId}`, `{countryStateId}`,
  `{currencyId}`, `{languageId}`, `{timeZoneId}`) is the record's internal `Id` string. The
  platform matches these against the entity's primary key, **not** against ISO codes. To get a
  valid id, first **list** or **search** the resource and read the `Id` field from `result`,
  then use that value in the path.
- **ISO codes are response fields, not path keys.** `CountryDto` exposes `Iso3` and `Iso2`;
  `CountryLanguageDto` exposes `Iso6391` and `Iso6392`; `CurrencyDto` exposes `Code` and
  `Symbol`. Use these to recognise a record, but pass the record's `Id` (not the ISO code) in
  the URL.
- **Sub-resources hang off a country.** States, cities, calling codes, currencies, timezones,
  and top-level domains are all reachable under `Countries/{countryId}/...`. Cities are nested
  one level deeper, under a state: `Countries/{countryId}/States/{countryStateId}/Cities`.
- **`Count` endpoints** return an integer (in `result`) rather than a list — useful for
  paging without pulling the full collection.
- **Search** is name-based and country-only: `Countries/Search?countryName=<term>`.
- **OData** pagination/filtering query options are accepted on the list and count endpoints
  (e.g. `$top`, `$skip`, `$filter`, `$orderby`).

## Countries

```bash
# List all countries
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count countries
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Search countries by name (required query param: countryName)
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/Search?countryName=United" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a single country by its id
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### States / Provinces

```bash
# List states for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/States" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count states for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/States/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a single state by its id (within a country)
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/States/<state-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Cities (within a state)

```bash
# List cities for a state
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/States/<state-id>/Cities" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count cities for a state
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/States/<state-id>/Cities/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Country-related lookups

```bash
# Calling codes for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/CallingCodes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count calling codes for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/CallingCodes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Enabled currencies for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/Currencies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Timezones for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/Timezones" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count timezones for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/Timezones/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Top-level domains for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/TopLevelDomains" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count top-level domains for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/TopLevelDomains/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Currencies

```bash
# List all enabled currencies
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Currencies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count currencies
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Currencies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a single currency by its id
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Currencies/<currency-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`CurrencyDto` fields: `Id`, `Timestamp`, `Code`, `Name`, `Symbol`, `Country` (nested
`CountryDto`). Match on `Code` (e.g. the ISO 4217 alphabetic code) but pass `Id` in the path.

## Languages

```bash
# List all languages
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Languages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count languages
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Languages/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a single language by its id
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Languages/<language-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`CountryLanguageDto` fields: `Id`, `Timestamp`, `Iso6391`, `Iso6392`, `Enabled`, `Name`,
`LanguageNativeName`. Match on `Iso6391`/`Iso6392` but pass `Id` in the path.

## Timezones

```bash
# List all timezones
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Timezones" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count timezones
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Timezones/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get a single timezone by its id
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Timezones/<timezone-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`TimezoneDto` fields: `Id`, `Timestamp`, `Name`, `UtcOffset`, `DisplayName` (read-only).

> **Note on the path segment:** the resource path is `/Timezones`, but the single-record id
> path parameter is `{timeZoneId}` (camelCase with a capital `Z`). The full route is
> `/api/v2/GlobeService/Timezones/{timeZoneId}`.

## PATCH (not available)

`GlobeService` is read-only global reference data. **It exposes no PATCH (JSON Patch)
endpoint** — there is nothing to partially update. The manifest contains zero PATCH (and zero
POST/PUT/DELETE) operations for this service. If you need to mutate data, you are on the wrong
service.

## End-to-end workflow: resolve an address's geography

Reference data is consumed by **discovering ids**, then using them. To resolve "Bogotá,
Cundinamarca, Colombia" into the ids another entity (e.g. an address) needs:

```bash
# 1. Find the country and read its Id from result[].Id (match on Name / Iso3 / Iso2)
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/Search?countryName=Colombia" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
#   -> result[0].Id  ==> <country-id>

# 2. List that country's states and read the matching state's Id
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/States" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
#   -> result[].Id  ==> <state-id>

# 3. List that state's cities and read the matching city's Id
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/States/<state-id>/Cities" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
#   -> result[].Id  ==> <city-id>

# 4. (Optional) resolve the country's enabled currency for the new record
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<country-id>/Currencies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
#   -> result[].Id / result[].Code
```

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| List all countries | GET | `/api/v2/GlobeService/Countries` |
| Count countries | GET | `/api/v2/GlobeService/Countries/Count` |
| Search countries by name | GET | `/api/v2/GlobeService/Countries/Search?countryName=<term>` |
| Get country by id | GET | `/api/v2/GlobeService/Countries/{countryId}` |
| List states for a country | GET | `/api/v2/GlobeService/Countries/{countryId}/States` |
| Count states for a country | GET | `/api/v2/GlobeService/Countries/{countryId}/States/Count` |
| Get state by id | GET | `/api/v2/GlobeService/Countries/{countryId}/States/{countryStateId}` |
| List cities for a state | GET | `/api/v2/GlobeService/Countries/{countryId}/States/{countryStateId}/Cities` |
| Count cities for a state | GET | `/api/v2/GlobeService/Countries/{countryId}/States/{countryStateId}/Cities/Count` |
| List calling codes for a country | GET | `/api/v2/GlobeService/Countries/{countryId}/CallingCodes` |
| Count calling codes for a country | GET | `/api/v2/GlobeService/Countries/{countryId}/CallingCodes/Count` |
| List enabled currencies for a country | GET | `/api/v2/GlobeService/Countries/{countryId}/Currencies` |
| List timezones for a country | GET | `/api/v2/GlobeService/Countries/{countryId}/Timezones` |
| Count timezones for a country | GET | `/api/v2/GlobeService/Countries/{countryId}/Timezones/Count` |
| List top-level domains for a country | GET | `/api/v2/GlobeService/Countries/{countryId}/TopLevelDomains` |
| Count top-level domains for a country | GET | `/api/v2/GlobeService/Countries/{countryId}/TopLevelDomains/Count` |
| List all currencies | GET | `/api/v2/GlobeService/Currencies` |
| Count currencies | GET | `/api/v2/GlobeService/Currencies/Count` |
| Get currency by id | GET | `/api/v2/GlobeService/Currencies/{currencyId}` |
| List all languages | GET | `/api/v2/GlobeService/Languages` |
| Count languages | GET | `/api/v2/GlobeService/Languages/Count` |
| Get language by id | GET | `/api/v2/GlobeService/Languages/{languageId}` |
| List all timezones | GET | `/api/v2/GlobeService/Timezones` |
| Count timezones | GET | `/api/v2/GlobeService/Timezones/Count` |
| Get timezone by id | GET | `/api/v2/GlobeService/Timezones/{timeZoneId}` |

## Critical Rules

- **Read-only & public.** No create / update / delete / **PATCH** on this service, and **no
  tenant scoping** — never attach `?tenantId=` or an `X-TenantId` header.
- **Path ids are opaque `Id` values**, matched against the record's primary key — not ISO
  codes. Discover the `Id` via list/search first; ISO/code fields (`Iso3`, `Iso2`, `Code`,
  `Iso6391`, `Iso6392`) are for matching the right record, not for the URL.
- **Search is country-only and requires `countryName`** as the query param.
- **`Count` endpoints return an integer** in `result`; list endpoints accept OData query
  options (`$top`, `$skip`, `$filter`, `$orderby`).
- **The timezone single-record path parameter is `{timeZoneId}`** (capital `Z`).
