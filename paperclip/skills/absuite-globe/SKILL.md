---
name: absuite-globe
description: >
  Look up countries, states, cities, currencies, languages, timezones, calling codes,
  and top-level domains using the Alliance Business Suite (ABS) `absuite` CLI.
  This is a reference data service — all data is read-only. Requires an authenticated
  CLI session.
---

# Alliance Business Suite — Globe Skill

Query global reference data through the `absuite` CLI's `globe` service. This service provides countries, currencies, languages, timezones, and related lookup data.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Discover commands**: `absuite globe list-commands`

## REST API Authentication

To call the API directly via REST instead of the CLI:

1. **Obtain a bearer token:**
```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$ABSUITE_USER_EMAIL'", "password": "'$ABSUITE_USER_PASSWORD'"}'
```
Extract the `accessToken` from the JSON response.

2. **Use the token in all subsequent requests:**
```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **All REST endpoints use the base path:** `$ABSUITE_HOST_URL/api/v2/`

## Countries

```bash
# List all countries
absuite globe list all-countries

# Count countries
absuite globe count countries

# Get country by ID (ISO 3166 alpha-3, e.g., USA, COL, GBR)
absuite globe get country-by-id --CountryId USA

# Search countries by name
absuite globe search-countries-by-name --Name "United"
```

**REST API equivalent:**
```bash
# List all countries
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count countries
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get country by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/USA" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Search countries by name
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/Search?Name=United" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Country States/Provinces

```bash
absuite globe list country-states --CountryId USA
absuite globe get country-state-by-id --CountryStateId <state-guid>
```

**REST API equivalent:**
```bash
# List states for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/USA/States" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count states for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/USA/States/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get state by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/USA/States/<state-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Cities in a State

```bash
absuite globe get cities-by-country-state-id --CountryStateId <state-guid>
```

**REST API equivalent:**
```bash
# List cities in a state
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<countryId>/States/<state-guid>/Cities" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count cities in a state
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/<countryId>/States/<state-guid>/Cities/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Country-Specific Data

```bash
# Calling codes (e.g., +1 for USA)
absuite globe get calling-codes-by-country-id --CountryId USA

# Top-level domains (e.g., .us)
absuite globe get top-level-domains-by-country-id --CountryId USA

# Timezones for a country
absuite globe get time-zones-by-country-id --CountryId USA

# Currencies enabled for a country
absuite globe get enabled-currencies-by-country-id --CountryId USA
```

**REST API equivalent:**
```bash
# Calling codes for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/USA/CallingCodes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count calling codes for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/USA/CallingCodes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Top-level domains for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/USA/TopLevelDomains" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count top-level domains for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/USA/TopLevelDomains/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Timezones for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/USA/Timezones" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count timezones for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/USA/Timezones/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Currencies enabled for a country
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Countries/USA/Currencies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Currencies

```bash
# List all enabled currencies
absuite globe list enabled-currencies

# Count currencies
absuite globe count currencies

# Get currency by ID (format: CODE.COUNTRY, e.g., USD.USA)
absuite globe get currency-by-id --CurrencyId USD.USA
```

**REST API equivalent:**
```bash
# List all currencies
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Currencies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count currencies
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Currencies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get currency by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Currencies/USD.USA" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Languages

```bash
# List all languages
absuite globe list languages

# Count languages
absuite globe count languages

# Get language by ID
absuite globe get language-by-id --LanguageId <language-guid>
```

**REST API equivalent:**
```bash
# List all languages
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Languages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count languages
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Languages/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get language by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Languages/<language-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Timezones

```bash
# List all timezones
absuite globe list time-zones

# Count timezones
absuite globe count timezones

# Get timezone by ID
absuite globe get time-zone-by-id --TimezoneId <timezone-guid>
```

**REST API equivalent:**
```bash
# List all timezones
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Timezones" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count timezones
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Timezones/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get timezone by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/GlobeService/Timezones/<timezone-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| List countries | `absuite globe list all-countries` |
| Search countries | `absuite globe search-countries-by-name --Name "Colombia"` |
| Get country | `absuite globe get country-by-id --CountryId COL` |
| List states | `absuite globe list country-states --CountryId COL` |
| Get cities | `absuite globe get cities-by-country-state-id --CountryStateId <guid>` |
| List currencies | `absuite globe list enabled-currencies` |
| Get currency | `absuite globe get currency-by-id --CurrencyId COP.COL` |
| List languages | `absuite globe list languages` |
| List timezones | `absuite globe list time-zones` |

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v2/GlobeService/Countries` | List all countries |
| GET | `/api/v2/GlobeService/Countries/:countryId` | Get country by ID |
| GET | `/api/v2/GlobeService/Countries/Count` | Count countries |
| GET | `/api/v2/GlobeService/Countries/Search` | Search countries by name |
| GET | `/api/v2/GlobeService/Countries/:countryId/States` | List states for a country |
| GET | `/api/v2/GlobeService/Countries/:countryId/States/:countryStateId` | Get state by ID |
| GET | `/api/v2/GlobeService/Countries/:countryId/States/Count` | Count states for a country |
| GET | `/api/v2/GlobeService/Countries/:countryId/States/:countryStateId/Cities` | List cities in a state |
| GET | `/api/v2/GlobeService/Countries/:countryId/States/:countryStateId/Cities/Count` | Count cities in a state |
| GET | `/api/v2/GlobeService/Countries/:countryId/CallingCodes` | List calling codes for a country |
| GET | `/api/v2/GlobeService/Countries/:countryId/CallingCodes/Count` | Count calling codes for a country |
| GET | `/api/v2/GlobeService/Countries/:countryId/Currencies` | List currencies for a country |
| GET | `/api/v2/GlobeService/Countries/:countryId/Timezones` | List timezones for a country |
| GET | `/api/v2/GlobeService/Countries/:countryId/Timezones/Count` | Count timezones for a country |
| GET | `/api/v2/GlobeService/Countries/:countryId/TopLevelDomains` | List top-level domains for a country |
| GET | `/api/v2/GlobeService/Countries/:countryId/TopLevelDomains/Count` | Count top-level domains for a country |
| GET | `/api/v2/GlobeService/Currencies` | List all currencies |
| GET | `/api/v2/GlobeService/Currencies/:currencyId` | Get currency by ID |
| GET | `/api/v2/GlobeService/Currencies/Count` | Count currencies |
| GET | `/api/v2/GlobeService/Languages` | List all languages |
| GET | `/api/v2/GlobeService/Languages/:languageId` | Get language by ID |
| GET | `/api/v2/GlobeService/Languages/Count` | Count languages |
| GET | `/api/v2/GlobeService/Timezones` | List all timezones |
| GET | `/api/v2/GlobeService/Timezones/:timeZoneId` | Get timezone by ID |
| GET | `/api/v2/GlobeService/Timezones/Count` | Count timezones |

## Critical Rules

- **This is a read-only service.** No create/update/delete operations.
- **Country IDs use ISO 3166 alpha-3 codes** (e.g., `USA`, `COL`, `GBR`, `DEU`).
- **Currency IDs use `CODE.COUNTRY` format** (e.g., `USD.USA`, `EUR.EU`, `COP.COL`).
- **Use this service for foreign key lookups** when creating entities that reference countries, currencies, languages, or timezones.
