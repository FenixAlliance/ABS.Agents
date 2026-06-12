---
name: absuite-forex
description: >
  Retrieve foreign-exchange rates and perform currency conversions via the
  Alliance Business Suite (ABS) REST API. Covers latest and historical rate
  lookups (all currencies or a single currency) and currency-amount exchange at
  latest or historical rates, on both the v2 and v3 endpoints. ForexService is
  PUBLIC reference data — operations are NOT tenant-scoped. A bearer token is
  still recommended (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Forex Skill (REST)

Retrieve currency exchange rates and convert monetary amounts through the `ForexService` REST API. ForexService exposes **public reference data** (exchange rates and currency conversion). Every operation is a `GET`; there are **no** create/update/delete operations and **no** tenant scoping — do not pass `tenantId` or an `X-TenantId` header to these endpoints (it is ignored).

> For the CLI equivalent see `absuite-forex-cli`; for general REST conventions (envelope, auth, scoping) see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`.

- This service is **read-only** (no create/update/delete), so there are no `PUT`/`PATCH` data-loss concerns.
- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select`; each dedicated `.../Count` endpoint returns an integer and is also filterable. OData is a REST/HTTP-layer feature (the CLI does not expose it).

## Authentication

ForexService is public, but supply a bearer token if your host requires one for any authenticated routing.

1. **Obtain a bearer token:**

```bash
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<user-email>", "password": "<user-password>"}'
```

Extract `accessToken` from the JSON response and export it:

```bash
export ABSUITE_ACCESS_TOKEN="<access-token>"
```

2. **Send the token on requests (optional for this public service):**

```bash
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

3. **Base path:** `$ABSUITE_HOST_URL/api/v2/ForexService/<Resource>` (and `$ABSUITE_HOST_URL/api/v3/ForexService/<Resource>` for the v3 Exchange endpoints).

4. **Response envelope** — every response is wrapped:

```json
{
  "isSuccess": true,
  "errorMessage": null,
  "correlationId": "<id>",
  "timestamp": "<iso-8601>",
  "result": { }
}
```

Always check `isSuccess`; read the payload from `result`.

## Tenant scoping

**None.** ForexService is public reference data. The manifest lists **no `tenantId` parameter** on any ForexService endpoint — these are public, like Globe and login/health. Do **not** add `?tenantId=` or an `X-TenantId` header; it is ignored.

## Key Concepts

- **Currency IDs** are passed verbatim as the `sourceCurrencyId` / `targetCurrencyId` query values and as the `{currencyId}` path segment for single-currency rate lookups. Use the Globe service (`GlobeService` / `absuite globe`) to discover valid currency identifiers; do not assume a format.
- **Latest vs Historical** — "Latest" endpoints use the most recent available rates and take no date. "Historical" endpoints require a `date` (Exchange) or accept an optional `date` (Rates) to select the rate snapshot. Dates are ISO 8601 (e.g. `2026-01-15T00:00:00Z`).
- **v2 vs v3 Exchange** — `Exchange/Latest` and `Exchange/History` exist under both `/api/v2/...` and `/api/v3/...` with identical query parameters. The v2 responses return a `Money` payload (converted amount + currency); the v3 responses return an `ExchangeRate` payload (source `Money`, target `Money`, and rate `Money`). The Rates endpoints exist on `/api/v2/...` only.
- **`ExchangeRate` payload** — `source` (`Money`), `target` (`Money`), `rate` (`Money`).
- **`Money` payload** — `amount` (number) and `currency` (a `CurrencyId`).
- **`ForexRatesDto` payload** (rate-set responses) — `success` (bool), `date` (string), `base` (string), `timestamp` (int64), `requestTimestamp` (datetime), `rates` (map of currency → rate).
- **API version selectors** — the Rates endpoints accept an optional `api-version` query parameter and an optional `x-api-version` request header. Both are optional; omit them unless you need to pin a version.

## PATCH availability

**PATCH is not available for ForexService.** This service is read-only public reference data — the manifest defines only `GET` operations, with no `POST`, `PUT`, `DELETE`, or `PATCH`. There is no JSON-Patch surface here. (PATCH, where it exists in ABS, is a REST-only capability documented in the relevant domain's REST skill.)

## Operations

All operations are `GET`. The `Authorization` header is shown but optional for this public service.

### Exchange currency at latest rates (v2)

Convert an amount from one currency to another using the latest available rates. Returns a `Money` payload (`result.amount`, `result.currency`).

Query params: `amount` (required, number), `sourceCurrencyId` (required), `targetCurrencyId` (required).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Exchange/Latest?amount=1000&sourceCurrencyId=<source-currency-id>&targetCurrencyId=<target-currency-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Exchange currency at historical rates (v2)

Convert an amount using rates from a specific date. Returns a `Money` payload.

Query params: `amount` (required), `sourceCurrencyId` (required), `targetCurrencyId` (required), `date` (required, ISO 8601).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Exchange/History?amount=1000&sourceCurrencyId=<source-currency-id>&targetCurrencyId=<target-currency-id>&date=2026-01-15T00:00:00Z" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Exchange currency at latest rates (v3)

Same inputs as the v2 latest exchange, but returns an `ExchangeRate` payload (`result.source`, `result.target`, `result.rate`).

Query params: `amount` (required), `sourceCurrencyId` (required), `targetCurrencyId` (required).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v3/ForexService/Exchange/Latest?amount=1000&sourceCurrencyId=<source-currency-id>&targetCurrencyId=<target-currency-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Exchange currency at historical rates (v3)

Same inputs as the v2 historical exchange, but returns an `ExchangeRate` payload.

Query params: `amount` (required), `sourceCurrencyId` (required), `targetCurrencyId` (required), `date` (required, ISO 8601).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v3/ForexService/Exchange/History?amount=1000&sourceCurrencyId=<source-currency-id>&targetCurrencyId=<target-currency-id>&date=2026-01-15T00:00:00Z" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get latest currency rates (all currencies)

Returns the full latest rate set as a `ForexRatesDto` payload.

Query params: `api-version` (optional), `x-api-version` (optional header).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Rates/Latest" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get latest rate for a single currency

Returns an `ExchangeRate` payload for one currency.

Path param: `currencyId` (required). Query params: `api-version` (optional), `x-api-version` (optional header).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Rates/Latest/<currency-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get historical currency rates (all currencies)

Returns a `ForexRatesDto` payload for a given date.

Query params: `date` (optional, ISO 8601), `api-version` (optional), `x-api-version` (optional header).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Rates/History?date=2026-01-15T00:00:00Z" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Get historical rate for a single currency

Returns an `ExchangeRate` payload for one currency on a given date.

Path param: `currencyId` (required). Query params: `date` (optional, ISO 8601), `api-version` (optional), `x-api-version` (optional header).

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Rates/History/<currency-id>?date=2026-01-15T00:00:00Z" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## End-to-end workflow

Discover a currency, read the latest rate, then convert an amount — using only verified endpoints.

```bash
# 1. (Discovery) find valid currency identifiers via the Globe service.
#    See the absuite-globe / absuite-globe-cli skills.

# 2. Read the latest rate for a single currency.
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Rates/Latest/<currency-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 3. Convert an amount at the latest rate (v2 -> Money).
curl -X GET "$ABSUITE_HOST_URL/api/v2/ForexService/Exchange/Latest?amount=1000&sourceCurrencyId=<source-currency-id>&targetCurrencyId=<target-currency-id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 4. Convert the same amount as of a historical date (v3 -> ExchangeRate with the rate used).
curl -X GET "$ABSUITE_HOST_URL/api/v3/ForexService/Exchange/History?amount=1000&sourceCurrencyId=<source-currency-id>&targetCurrencyId=<target-currency-id>&date=2026-01-15T00:00:00Z" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

## API Endpoints Quick Reference

| Action | Method | Path |
|---|---|---|
| Exchange amount at latest rates (v2 → Money) | `GET` | `/api/v2/ForexService/Exchange/Latest` |
| Exchange amount at historical rates (v2 → Money) | `GET` | `/api/v2/ForexService/Exchange/History` |
| Exchange amount at latest rates (v3 → ExchangeRate) | `GET` | `/api/v3/ForexService/Exchange/Latest` |
| Exchange amount at historical rates (v3 → ExchangeRate) | `GET` | `/api/v3/ForexService/Exchange/History` |
| Get latest currency rates (all) | `GET` | `/api/v2/ForexService/Rates/Latest` |
| Get latest rate for a currency | `GET` | `/api/v2/ForexService/Rates/Latest/{currencyId}` |
| Get historical currency rates (all) | `GET` | `/api/v2/ForexService/Rates/History` |
| Get historical rate for a currency | `GET` | `/api/v2/ForexService/Rates/History/{currencyId}` |

> No PATCH/POST/PUT/DELETE rows: ForexService is read-only public reference data.

## Critical Rules

- **Public, untenanted.** Never attach `tenantId` or an `X-TenantId` header to ForexService calls — the manifest defines no tenant parameter and it is ignored.
- **Exchange `date` is required for History; Rates `date` is optional.** The two `Exchange/History` endpoints (v2 and v3) require `date`; the two `Rates/History` endpoints treat `date` as optional.
- **v2 Exchange returns `Money`; v3 Exchange returns `ExchangeRate`.** Pick the version by the payload shape you need.
- **Discover currency IDs via the Globe service** rather than hard-coding any format.
- **Always parse the envelope** — check `isSuccess`, then read `result`.
