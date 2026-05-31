---
name: absuite-forex
description: >
  Perform currency exchange calculations and retrieve foreign exchange rates using
  the Alliance Business Suite (ABS) `absuite` CLI. Covers latest and historical
  rate lookups, currency amount conversions, and rate model retrieval. Requires an
  authenticated CLI session.
---

# Alliance Business Suite — Forex Skill

Perform currency exchange operations through the `absuite` CLI's `forex` service.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Discover commands**: `absuite forex list-commands`

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

## Exchange Currency

### Exchange at Latest Rates

```bash
absuite forex exchange-amount --Amount 1000 --SourceCurrencyId USD.USA --TargetCurrencyId EUR.EU
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Exchange/Latest?Amount=1000&SourceCurrencyId=USD.USA&TargetCurrencyId=EUR.EU" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

Returns a `Money` object with the converted amount and target currency.

### Exchange at Latest Rates (v3)

```bash
absuite forex exchange-amount-v3 --Amount 1000 --SourceCurrencyId USD.USA --TargetCurrencyId COP.COL
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Exchange/Latest?Amount=1000&SourceCurrencyId=USD.USA&TargetCurrencyId=COP.COL" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Exchange at Historical Rates

```bash
absuite forex exchange-amount-historical --Amount 1000 --SourceCurrencyId USD.USA --TargetCurrencyId GBP.GBR --Date 2026-01-15T00:00:00Z
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Exchange/History?Amount=1000&SourceCurrencyId=USD.USA&TargetCurrencyId=GBP.GBR&Date=2026-01-15T00:00:00Z" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Exchange at Historical Rates (v3)

```bash
absuite forex exchange-amount-historical-v3 --Amount 1000 --SourceCurrencyId USD.USA --TargetCurrencyId JPY.JPN --Date 2026-01-15T00:00:00Z
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Exchange/History?Amount=1000&SourceCurrencyId=USD.USA&TargetCurrencyId=JPY.JPN&Date=2026-01-15T00:00:00Z" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Get Rates

### Latest Rate for a Currency

```bash
absuite forex get latest-currency-rate --CurrencyId EUR.EU
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Rates/Latest/EUR.EU" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Historical Rate for a Currency

```bash
absuite forex get historical-currency-rate --CurrencyId EUR.EU --Date 2026-01-15T00:00:00Z
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Rates/History/EUR.EU" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### All Latest Currency Rates

```bash
absuite forex get latest-currency-rates-model
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Rates/Latest" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Historical Currency Rates List

```bash
absuite forex list historical-currency-rates --CurrencyId EUR.EU
```

**REST API equivalent:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Rates/History" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## Command Quick Reference

| Action | CLI Command |
|---|---|
| Convert currency (latest) | `absuite forex exchange-amount --Amount 100 --SourceCurrencyId USD.USA --TargetCurrencyId EUR.EU` |
| Convert currency (historical) | `absuite forex exchange-amount-historical --Amount 100 --SourceCurrencyId USD.USA --TargetCurrencyId EUR.EU --Date <ISO-date>` |
| Get latest rate | `absuite forex get latest-currency-rate --CurrencyId EUR.EU` |
| Get historical rate | `absuite forex get historical-currency-rate --CurrencyId EUR.EU --Date <ISO-date>` |
| Get all rates | `absuite forex get latest-currency-rates-model` |

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v2/ForexService/Rates/Latest` | All latest currency rates |
| `GET` | `/api/v2/ForexService/Rates/Latest/:currencyId` | Latest rate for a specific currency |
| `GET` | `/api/v2/ForexService/Rates/History` | All historical currency rates |
| `GET` | `/api/v2/ForexService/Rates/History/:currencyId` | Historical rate for a specific currency |
| `GET` | `/api/v2/ForexService/Exchange/Latest` | Exchange at latest rates (`Amount`, `SourceCurrencyId`, `TargetCurrencyId`) |
| `GET` | `/api/v2/ForexService/Exchange/History` | Exchange at historical rates (`Amount`, `SourceCurrencyId`, `TargetCurrencyId`, `Date`) |

## Critical Rules

- **Currency IDs follow the `CODE.COUNTRY` format** (e.g., `USD.USA`, `EUR.EU`, `COP.COL`, `GBP.GBR`).
- **Historical dates use ISO 8601 format** (e.g., `2026-01-15T00:00:00Z`).
- **Use `absuite globe list enabled-currencies`** to discover valid currency IDs.
