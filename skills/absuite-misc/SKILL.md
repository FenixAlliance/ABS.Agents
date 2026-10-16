---
name: absuite-misc
description: >
  Manage inventory, logistics, shipments, and sales resources via the Alliance
  Business Suite (ABS) REST API. Covers warehouses, ports, vessels, voyages,
  waybills (air/road/rail/sea), trucks, proofs of delivery, packing/pick/restock
  documents, shipments, bills of lading, shipping methods/couriers/zones/classes,
  stores, point-of-sales, loyalty programs and sales literature — including atomic
  PATCH (JSON Patch) updates. All operations are tenant-scoped and require a bearer
  token (see the absuite-login skill to authenticate).
---

# Alliance Business Suite — Misc Services (Inventory / Logistics / Shipments / Sales / Marketplace) REST Skill

This skill teaches an agent to drive five ABS services purely over REST:
**InventoryService**, **LogisticsService**, **ShipmentsService**, **SalesService**, and
**MarketplaceService**. Logistics and Shipments are large transport/document services
(waybills, proofs of delivery, bills of lading, voyages, trucks). Sales is a small POS
catalog (stores, POS terminals, loyalty programs, literature). Inventory exposes a single
read endpoint. Marketplace currently exposes no tenant-domain REST endpoints.

> For the CLI equivalent see `absuite-misc-cli`; for general REST conventions see `absuite-rest`.

## API usage essentials

> Full detail in `absuite-rest`; these rules apply across this skill's endpoints.

- **Lists & counts are OData-enabled.** `GET` collection endpoints accept `$filter`, `$top`, `$skip`, `$orderby`, `$select` — page through results, don't fetch-all-and-filter. Each dedicated `.../Count` endpoint returns an integer and is **also** filterable (`?$filter=...` -> a filtered count). OData is a REST/HTTP-layer feature (the CLI does not expose it).
- **`PUT` replaces the ENTIRE resource** — it overwrites, not merges, so any omitted field is reset to default/null. **GET the resource first, change the full object, then PUT it back**; sending a partial body to `PUT` (or an incomplete `POST` create) causes silent data loss.
- **`PATCH`, where this service exposes it, is atomic and partial** (JSON Patch / RFC 6902) — it changes only the fields you name, needs no prior GET, and won't clobber the rest. Prefer it for small edits; use `PUT` only for a deliberate full replacement.

## Authentication

Obtain a bearer token, then send it on every request:

```bash
# 1) Log in
curl -X POST "$ABSUITE_HOST_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$ABSUITE_USER_EMAIL'", "password": "'$ABSUITE_USER_PASSWORD'"}'
# -> extract accessToken from the JSON response

# 2) Send it on every call
-H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

- **Base path:** `$ABSUITE_HOST_URL/api/v2/<ServiceName>/<Resource>`.
- **Response envelope:** every response is
  `{ "isSuccess": bool, "errorMessage": str|null, "correlationId": str, "timestamp": str, "result": <data|array|int|null> }`.
  Always check `isSuccess`, then read the payload from `result`.

## Tenant scoping

Read the per-endpoint rule from the manifest, do not assume:

- **Logistics, Shipments, Sales** domain endpoints all require **`?tenantId=<tenant-guid>`**
  on **every** verb — including POST / PUT / PATCH / DELETE and the `/Count`, `/Extended`,
  and action sub-paths. Omitting it on writes returns `400`. The equivalent header is
  `X-TenantId: <tenant-guid>` (the platform binds the query param OR the header
  interchangeably); examples below use the query param.
- **InventoryService `Inventory/{stockItemId}/Details`** takes **no** `tenantId` param
  (path-scoped by the stock item) — do not add one.
- Optional everywhere: `api-version` (query) and `x-api-version` (header). Omit unless told otherwise.

## PATCH = JSON Patch (RFC 6902)

`PATCH` request bodies are a JSON **array** of operations with `Content-Type: application/json`:

```json
[
  { "op": "replace", "path": "/title", "value": "New title" },
  { "op": "add",     "path": "/remarks", "value": "Handle with care" }
]
```

`op` ∈ `add|remove|replace|move|copy|test`; `path`/`from` are JSON-Pointers (leading `/`,
camelCase field names). PATCH is for atomic partial updates — change a couple of fields
without resending the whole object (safer than PUT under concurrent edits). PATCH is
available on Logistics and Shipments aggregates and their line/entry sub-resources, and on
all four Sales aggregates. See each section for which paths support it.

Field names in `-d '{...}'` create/update bodies use **camelCase** exactly as transcribed
from the manifest below (e.g. `documentNumber`, `freightCurrencyId`, `shipperContactId`).
A handful of ShipmentsService policy fields use trailing uppercase `ID` (`currencyID`,
`countryID`, `shippingCourierID`) — transcribe those verbatim.

---

# Inventory

The **InventoryService** exposes a single read endpoint: inventory details for a stock item.
There is no list/create/update/delete and no PATCH.

```bash
# Get inventory details for a stock item (no tenantId param — path-scoped)
curl -X GET "$ABSUITE_HOST_URL/api/v2/InventoryService/Inventory/<stockItemId>/Details" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

# Logistics

The **LogisticsService** manages supply-chain documents and assets: warehouses, ports,
vessels, voyages (with port calls), trucks (with trips), truck drivers, proofs of delivery
(with lines and attached delivery notes), delivery notes, supplier profiles, item restocks /
retain samples / packing slips / pick lists (each with entries), and four waybill families
(air / rail / road / sea, each with lines). Every aggregate supports list / count / get /
create / **PUT** / **PATCH** / delete; transport documents add lifecycle actions.

**All Logistics endpoints require `?tenantId=<tenant-guid>` on every verb.**

## Warehouses

```bash
# List
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/Count?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/<warehouseId>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create (title + address1 required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
        "title": "Central DC",
        "address1": "100 Dock Rd",
        "address2": "",
        "postalCode": "00000",
        "phone": "",
        "countryId": "<country-guid>",
        "stateId": "<state-guid>",
        "cityId": "<city-guid>",
        "isGroup": false,
        "parentWarehouseId": null
      }'

# Update (PUT — full replace)
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/<warehouseId>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Central DC (renamed)", "address1": "100 Dock Rd" }'

# Patch (atomic partial update)
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/<warehouseId>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/phone", "value": "+1-555-0100" } ]'

# Delete
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/<warehouseId>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`WarehouseCreateDto` fields: `title`(req), `address1`(req), `address2`, `address3`,
`postalCode`, `phone`, `countryId`, `stateId`, `cityId`, `isGroup`, `shipwireWarehouseId`,
`parentWarehouseId` (plus optional `id`, `timestamp`). `WarehouseUpdateDto` drops `id`/`timestamp`.

## Ports

```bash
# Create (title + address1 required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{
        "title": "Port of Example",
        "address1": "Pier 1",
        "unLocode": "XXXXX",
        "iataCode": "",
        "portType": "Seaport",
        "portAuthority": "",
        "hasCustomsFacility": true,
        "isFreeTradezone": false,
        "isActive": true,
        "longitude": 0.0,
        "latitude": 0.0,
        "countryId": "<country-guid>"
      }'
```

Other ops follow the standard pattern (`tenantId` required on all):
`GET /Ports`, `GET /Ports/Count`, `GET /Ports/<portId>`,
`PUT /Ports/<portId>`, `PATCH /Ports/<portId>`, `DELETE /Ports/<portId>`.
`PortCreateDto` adds: `company`, `email`, `address2`, `address3`, `unit`, `customCity`,
`customState`, `postalCode`, `phone`, `fax`, `countryStateId`, `cityId`, `parentPortId`.

## Vessels

Standard CRUD + count + PATCH (`tenantId` required).
`VesselCreateDto`: `name`, `imoNumber`, `mmsiNumber`, `callSign`, `flagCountryId`,
`vesselType`, `vesselStatus`, `grossTonnage`, `deadweightTonnage`, `teuCapacity`,
`lengthMeters`, `beamMeters`, `draftMeters`, `yearBuilt`, `shippingCourierId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Vessels?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "MV Example", "imoNumber": "9999999", "vesselType": "Container", "teuCapacity": 8000 }'
```

## Trucks & Truck Trips

Trucks support standard CRUD + count + PATCH. **Trips are a sub-resource of a truck**
with their own CRUD + count + PATCH **plus five lifecycle actions**.

```bash
# Truck create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "plateNumber": "ABC-123", "name": "Truck 1", "truckType": "Semi",
        "maxPayloadKg": 24000, "teuCapacity": 2, "isActive": true, "isRefrigerated": false,
        "shippingCourierId": "<courier-guid>" }'

# Trip create under a truck
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "tripNumber": "T-1001", "containerNumber": "CSQU3054383", "sealNumber": "S-77",
        "departureTime": "2026-06-12T08:00:00Z", "distanceKm": 320,
        "originPortId": "<port-guid>", "destinationPortId": "<port-guid>",
        "shipmentId": "<shipment-guid>", "billOfLadingId": "<bol-guid>" }'

# Trip lifecycle actions (POST, no body): Dispatch -> Depart -> Arrive -> Deliver ; or Cancel
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips/<tripId>/Dispatch?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# ...Depart, Arrive, Deliver, Cancel follow the identical shape.
```

Trip sub-paths: `GET|POST .../Trips`, `GET .../Trips/Count`, `GET|PUT|PATCH|DELETE .../Trips/<tripId>`,
`POST .../Trips/<tripId>/{Arrive|Cancel|Deliver|Depart|Dispatch}`.
`TruckTripCreateDto`: `tripNumber`, `containerNumber`, `sealNumber`, `departureTime`,
`arrivalTime`, `distanceKm`, `notes`, `originPortId`, `originLocationId`,
`destinationPortId`, `destinationLocationId`, `shipmentId`, `billOfLadingId`.

## Truck Drivers

Standard CRUD + count + PATCH, plus **Activate / Deactivate** actions.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers/<driverId>/Activate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers/<driverId>/Deactivate?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

`TruckDriverCreateDto`: `name`, `licenseNumber`, `licenseClass`, `phone`, `email`,
`contactId`, `shippingCourierId`, `adrCertified`, `licenseExpiryDate`,
`medicalExamExpiryDate`, `nationalIdNumber`, `notes`.

## Voyages & Port Calls

Voyages support CRUD + count + PATCH plus **Start / Complete / Cancel** lifecycle actions.
**Port Calls are a sub-resource** with CRUD + count + PATCH (no lifecycle actions).

```bash
# Voyage create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "voyageNumber": "VY-2026-01", "title": "Asia loop", "voyageDirection": "Eastbound",
        "departureDate": "2026-07-01", "arrivalDate": "2026-07-20", "vesselId": "<vessel-guid>" }'

# Lifecycle (POST, no body)
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<voyageId>/Start?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# ...Complete, Cancel follow the identical shape.

# Port call create
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<voyageId>/PortCalls?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "sequenceNumber": 1, "portCallStatus": "Scheduled", "eta": "2026-07-03T06:00:00Z",
        "etd": "2026-07-03T18:00:00Z", "berthNumber": "B12", "portId": "<port-guid>" }'
```

`VoyageCreateDto`: `voyageNumber`, `title`, `description`, `voyageDirection`,
`departureDate`, `arrivalDate`, `vesselId`.
`VoyagePortCallCreateDto`: `sequenceNumber`, `portCallStatus`, `eta`, `etd`, `berthNumber`,
`remarks`, `portId` (the **Update** DTO additionally accepts `ata`, `atd`).

## Proofs of Delivery (+ Lines, + Delivery Notes attach/detach)

PODs support CRUD + count + PATCH, three actions (**Sign / Reject / Dispute**), a **Lines**
sub-resource (CRUD + count + PATCH), and **DeliveryNotes** attach/detach.

```bash
# Create POD
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "documentNumber": "POD-1001", "shipmentId": "<shipment-guid>",
        "recipientName": "Receiving Dept", "deliveryAddress": "100 Dock Rd",
        "deliveryDate": "2026-06-12", "overallCondition": "Good" }'

# Sign (body: signedBy, signerId) / Reject (body: reason) / Dispute (body: reason)
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<podId>/Sign?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "signedBy": "J. Receiver", "signerId": "<contact-guid>" }'
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<podId>/Reject?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "reason": "Seal broken" }'

# Add a POD line
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<podId>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "description": "Pallet A", "quantityExpected": 10, "quantityReceived": 9,
        "quantityRejected": 1, "condition": "Damaged", "hsCode": "8471.30" }'

# Attach / detach a delivery note (note ID is in the path, not the body)
curl -X POST   "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<podId>/DeliveryNotes/<noteId>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<podId>/DeliveryNotes/<noteId>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
# List/Count attached notes: GET .../DeliveryNotes  and  GET .../DeliveryNotes/Count
```

`ProofOfDeliveryCreateDto` links to any one transport doc via
`billOfLadingId`/`seawayBillId`/`airwayBillId`/`roadWaybillId`/`railWaybillId`/`truckTripId`,
plus `documentNumber`, `shipmentId`, `recipientName`, `recipientCompanyContactId`,
`deliveryAddress`, `deliveryDate`, `deliveryTime`, `overallCondition`, `remarks`. The
**Update** DTO also accepts `totalQuantityDelivered`, `totalQuantityRejected`,
`photoEvidenceUri`. POD line DTO: `description`, `quantityExpected`, `quantityReceived`,
`quantityRejected`, `condition`, `remarks`, `hsCode`.

> POD has **no top-level PATCH on the Lines collection**; PATCH is on `.../Lines/<lineId>`.

## Delivery Notes

Standard CRUD + count. **No PATCH, no actions.**
`DeliveryNoteCreateDto`: `title`, `description`, `shipmentId`, `proofOfDeliveryId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/DeliveryNotes?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "DN-1001", "shipmentId": "<shipment-guid>" }'
```

## Supplier Profiles

Standard CRUD + count + PATCH. `SupplierProfileCreateDto`: `type`, `contactId`, `about`,
`avatarUrl`, and generic `data`/`dataLabel` through `data9`/`data9Label` extension slots.

## Item Restocks, Retain Samples, Packing Slips, Pick Lists

Document aggregates with entry sub-resources. All require `tenantId`.

| Aggregate | Path | Entries sub-resource | PATCH |
|-----------|------|----------------------|-------|
| Item Restocks | `/ItemRestocks` | `/ItemRestocks/<id>/Entries` | aggregate + entry |
| Item Pick Lists | `/ItemPickLists` | `/ItemPickLists/<id>/Entries` | aggregate + entry |
| Item Packing Slips | `/ItemPackingSlips` | `/ItemPackingSlips/<id>/Entries` | aggregate + entry |
| Item Retain Samples | `/ItemRetainSamples` | — (no entries) | aggregate |

```bash
# Create a restock
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Q3 replenishment", "description": "" }'

# Add a restock entry (itemId, warehouseId, itemRestockId required)
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks/<restockId>/Entries?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "itemId": "<item-guid>", "warehouseId": "<warehouse-guid>",
        "itemRestockId": "<restockId>", "quantity": 100, "orderItemRecordId": null }'
```

DTO field notes (required marked **req**):
- `ItemRestockCreateDto`: `name`, `description`. Entry: `itemId`**req**, `warehouseId`**req**, `itemRestockId`**req**, `quantity`, `orderItemRecordId`.
- `ItemPickListCreateDto`: `name`**req**, `description`, `orderId`. Entry: `itemId`**req**, `warehouseId`**req**, `itemPickListId`**req**, `quantity`, `orderItemRecordId`.
- `ItemPackingSlipCreateDto`: `instructions`, `deliveryNoteId`, `orderId`. Entry: `itemId`**req**, `itemPackingSlipId`**req**, `quantity`**req**.
- `ItemRetainSampleCreateDto`: `warehouseId`**req**, `itemId`**req**.

## Waybills (Airway / Rail / Road / Seaway) + Lines

Four parallel transport-document families. Each has CRUD + count + PATCH, a **Lines**
sub-resource (CRUD + count + PATCH), and lifecycle actions. The Lines DTO is shared across
all four (`WaybillLineCreateDto`/`WaybillLineUpdateDto`).

| Family | Base path | Path id param | Lifecycle actions |
|--------|-----------|---------------|-------------------|
| Airway Bills | `/AirwayBills` | `{billId}` | Issue, Cancel, MarkInTransit, MarkArrived, MarkDelivered |
| Rail Waybills | `/RailWaybills` | `{waybillId}` | Issue, Cancel, MarkInTransit, MarkDelivered |
| Road Waybills | `/RoadWaybills` | `{waybillId}` | Issue, Cancel, Dispute, MarkInTransit, MarkDelivered |
| Seaway Bills | `/SeawayBills` | `{billId}` | Issue, Cancel, MarkInTransit, MarkArrived, Release |

```bash
# Representative: create an airway bill
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "documentNumber": "AWB-1001", "airwayBillType": "Master",
        "masterAwbNumber": "020-12345675", "shipperContactId": "<contact-guid>",
        "consigneeContactId": "<contact-guid>", "carrierId": "<courier-guid>",
        "airlineCode": "AA", "flightNumber": "AA100",
        "airportOfDepartureCode": "JFK", "airportOfDestinationCode": "LHR",
        "freightTerms": "Prepaid", "freightAmount": 1500, "freightCurrencyId": "<currency-guid>",
        "chargeableWeightKg": 250, "totalGrossWeightKg": 240, "totalPackages": 12,
        "shipmentId": "<shipment-guid>" }'

# Add a line (shared WaybillLineCreateDto)
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<billId>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "description": "Electronics", "quantity": 12, "grossWeightKg": 240, "volumeM3": 3.2,
        "packageType": "Carton", "hsCode": "8471.30", "declaredValue": 50000,
        "declaredValueCurrencyId": "<currency-guid>", "chargeableWeightKg": 250 }'

# Lifecycle action (POST, no body) — e.g. issue then mark in transit
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<billId>/Issue?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<billId>/MarkInTransit?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Patch a waybill atomically
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<billId>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/freightTerms", "value": "Collect" } ]'
```

`WaybillLineCreateDto` fields (shared): `description`, `quantity`, `grossWeightKg`,
`volumeM3`, `packageType`, `lengthCm`, `widthCm`, `heightCm`, `hsCode`, `marksAndNumbers`,
`declaredValue`, `declaredValueCurrencyId`, `sealNumber`, `containerNumber`,
`chargeableWeightKg`, `iataRateClass`, `dangerousGoodsClass`, `unHazmatNumber`, `wagonNumber`.

Family-specific header DTO fields of note:
- **Airway** (`AirwayBillCreateDto`): `airwayBillType`, `masterAwbNumber`, `notifyPartyContactId`, `airlineCode`, `flightNumber`, `airportOfDepartureCode`, `airportOfDestinationCode`, `departureDate`, `arrivalDate`, `dateIssued`, `declaredValueForCarriage`, `declaredValueForCustoms`, `insuranceAmount`, `specialHandlingCodes`, `specialInstructions`.
- **Rail** (`RailWaybillCreateDto`): `railOperatorName`, `stationOfDeparture(/Code)`, `stationOfDestination(/Code)`, `prescribedRoute`, `wagonNumbers`, `dateOfAcceptance`, `customsFormalities` (Update adds `dateOfDelivery`).
- **Road** (`RoadWaybillCreateDto`): `roadWaybillType`, `successiveCarriers`, `truckId`, `truckDriverId`, `vehicleRegistration`, `trailerRegistration`, `placeOfTakingOver(PortId)`, `placeOfDelivery(PortId)`, `dateOfTakingOver`, `adrDangerousGoods`, `truckTripId` (Update adds `dateOfDelivery`).
- **Seaway** (`SeawayBillCreateDto`): `vesselId`, `voyageId`, `portOfLoadingId`, `portOfDischargeId`, `placeOfReceipt`, `placeOfDelivery`, `dateIssued`, `dateShipped`, `totalWeight`.
- Common to all four: `documentNumber`, `shipperContactId`, `consigneeContactId`, `carrierId`, `freightTerms`, `freightAmount`, `freightCurrencyId`, `totalGrossWeightKg`/`totalWeight`, `totalPackages`, `totalVolumeM3`, `remarks`, `shipmentId`.

---

# Shipments

The **ShipmentsService** manages shipments, shipping labels, bills of lading (with lines),
shipping methods, couriers, regions, zones, classes, and item shipping policies. Every
aggregate supports list / count / get / create / PUT / **PATCH** / delete. Only Bills of
Lading have a sub-resource (Lines). **No lifecycle actions in this service.**

**All Shipments endpoints require `?tenantId=<tenant-guid>` on every verb.**

## Shipments

```bash
# Create (shippingTerms is an enum)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "trackingCode": "TRK-1001", "isInternational": true,
        "expectedShippingDate": "2026-06-13", "expectedDeliveryDate": "2026-06-20",
        "shippingTerms": "CIF", "orderId": "<order-guid>" }'

# Patch status fields atomically
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments/<shipmentId>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/shipped", "value": true },
        { "op": "replace", "path": "/shipmentTimestamp", "value": "2026-06-13T09:00:00Z" } ]'
```

`shippingTerms` enum (Incoterms): `NC|EXW|FCA|FOB|FAS|CFR|CIF|CPT|CIP|DDP|DAP|DPU`.
`ShipmentCreateDto`: `trackingCode`, `isInternational`, `expectedShippingDate`,
`expectedDeliveryDate`, `shippingTerms`, `orderId`. `ShipmentUpdateDto` adds `shipped`,
`delivered`, `shipmentTimestamp`, `deliveryTimestamp`.

## Shipping Labels

Standard CRUD + count + PATCH. `ShippingLabelCreateDto`: `trackingCode`**req**,
`expectedDelivery`, `locationId`, `shipmentId`, `shippingCourierId`.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingLabels?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "trackingCode": "TRK-1001", "shipmentId": "<shipment-guid>",
        "shippingCourierId": "<courier-guid>" }'
```

## Bills of Lading (+ Lines)

CRUD + count + PATCH on the bill, and a **Lines** sub-resource (CRUD + count + PATCH).

```bash
# Create a bill of lading
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "billOfLadingNumber": "BL-1001", "title": "Ocean BL", "billOfLadingType": "Negotiable",
        "isNegotiable": true, "isClean": true, "numberOfOriginals": 3,
        "freightPaymentType": "Prepaid", "shippingTerms": "CIF",
        "shipperContactId": "<contact-guid>", "consigneeContactId": "<contact-guid>",
        "portOfLoadingId": "<port-guid>", "portOfDischargeId": "<port-guid>",
        "shipmentId": "<shipment-guid>", "voyageId": "<voyage-guid>",
        "totalPackages": 100, "totalGrossWeightKg": 12000 }'

# Add a line
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading/<billOfLadingId>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "description": "Coffee beans", "quantity": 100, "packageType": "Bag",
        "grossWeightKg": 12000, "volumeM3": 40, "hsCode": "0901.21", "itemId": "<item-guid>" }'
```

`BillOfLadingCreateDto` notable fields: `billOfLadingNumber`, `title`, `description`,
`billOfLadingType`, `isNegotiable`, `isClean`, `numberOfOriginals`, `freightPaymentType`,
`shippingTerms`, `freightChargesDescription`, `declaredValueAmount`,
`declaredValueCurrencyId`, `vesselName`, `voyageNumber`, `shipperContactId`,
`consigneeContactId`, `notifyPartyContactId`, `shippingCourierId`, `portOfLoadingId`,
`portOfDischargeId`, `placeOfReceiptId`, `placeOfDeliveryId`, `shipmentId`, `orderId`,
`voyageId`, `marksAndNumbers`, `totalPackages`, `totalGrossWeightKg`, `totalVolumeM3`
(Update adds `expiryDate`). `BillOfLadingLineCreateDto`: `description`, `quantity`,
`packageType`, `grossWeightKg`, `volumeM3`, `marksAndNumbers`, `hsCode`, `itemId`.

## Shipping Methods / Couriers / Regions / Zones / Classes

Five flat catalogs, each CRUD + count + PATCH. Representative create bodies:

```bash
# Shipping Method (shippingClassCalculationType is an enum)
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingMethods?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Standard Ground", "description": "", "cost": 9.99, "taxable": true,
        "taxIncluded": false, "currencyId": "<currency-guid>",
        "shippingClassCalculationType": "PerOrder" }'

# Shipping Courier
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingCouriers?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Example Courier", "logoURL": "", "countryId": "<country-guid>" }'

# Shipping Region
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingRegions?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Northeast", "postalCodes": "10001,10002" }'

# Shipping Zone
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingZones?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Domestic", "default": true, "everywhere": false,
        "postalCodes": "", "countryCodes": "US" }'

# Shipping Class
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingClasses?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Fragile", "slug": "fragile" }'
```

- `ShippingMethodCreateDto`: `name`**req**, `description`, `cost`, `taxable`, `taxIncluded`, `currencyId`, `shippingClassCalculationType` enum `PerClass|PerOrder`.
- `ShippingCourierCreateDto`: `name`**req**, `logoURL`, `countryId`.
- `ShippingRegionCreateDto`: `name`**req**, `postalCodes`.
- `ShippingZoneCreateDto`: `name`**req**, `default`, `everywhere`, `postalCodes`, `countryCodes`.
- `ShippingClassCreateDto`: `name`**req**, `slug`.

## Item Shipping Policies

CRUD + count + PATCH. Several fields use trailing uppercase `ID` — transcribe verbatim.

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ItemShippingPolicies?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Free over $50", "type": "Threshold", "code": "FREE50",
        "isExpressShipmentPolicy": false, "isFree": true, "isEnabled": true,
        "isDefault": false, "allowInternational": false, "days": 5,
        "value": 0, "percentage": 0, "currencyID": "<currency-guid>",
        "shippingCourierID": "<courier-guid>" }'
```

`ItemShippingPolicyCreateDto` required fields: `title`, `type`, `code`, `currencyID`,
`shippingCourierID`. Optional: `description`, `isExpressShipmentPolicy`, `isFree`, `reduce`,
`isEnabled`, `isDefault`, `allowInternational`, `hours`, `days`, `weeks`, `months`, `years`,
`value`, `percentage`, `countryID`, `countryStateID`, `customState`, `customCity`, `cityID`.

---

# Sales

The **SalesService** manages stores, point-of-sale terminals, loyalty programs, sales
literature, and exposes a read-only margin lookup. The four collection aggregates support
list / count / get / create / PUT / **PATCH** / delete. **No lifecycle actions.**

**All Sales collection endpoints require `?tenantId=<tenant-guid>` on every verb.** The
`Margins/<marginId>/Details` lookup takes **no** `tenantId` param.

## Stores

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/Stores?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Flagship Store", "eCommerce": true, "currencyId": "<currency-guid>" }'

curl -X PATCH "$ABSUITE_HOST_URL/api/v2/SalesService/Stores/<storeId>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/eCommerce", "value": false } ]'
```

`StoreCreateDto`: `name`**req**, `eCommerce`, `currencyId`.

## Point of Sales

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/PointOfSales?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Register 1", "code": "POS-1", "description": "",
        "priceListId": "<pricelist-guid>", "locationId": "<location-guid>" }'
```

`PointOfSaleCreateDto`: `title`**req**, `code`, `description`, `priceListId`, `locationId`.

## Loyalty Programs

```bash
curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/LoyaltyPrograms?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Gold Tier", "description": "", "priceListId": "<pricelist-guid>" }'
```

`LoyaltyProgramCreateDto`: `title`**req**, `description`, `priceListId`.

## Sales Literatures

CRUD + count + PATCH, plus a collection-level **Extended** read
(`GET /SalesLiteratures/Extended`, returns literatures with related data; tenantId required).
There is **no** per-id `/Extended` endpoint.

```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/SalesLiteratures/Extended?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/SalesLiteratures?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Product Brochure", "content": "...", "description": "",
        "expirationDate": "2026-12-31", "salesLiteratureTypeId": "<type-guid>" }'
```

`SalesLiteratureCreateDto`: `title`, `content`, `description`, `modifiedDate`,
`expirationDate`, `salesLiteratureTypeId`.

## Margins (read-only)

```bash
# Get margin details (no tenantId param)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/Margins/<marginId>/Details" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

# Marketplace

The **MarketplaceService** currently exposes **no tenant-domain REST endpoints** — its
OpenAPI surface contains only shared host endpoints (login/register/health and the AI
Completions helper), which are not part of this skill. There is nothing to create, list,
or update here yet; re-check the manifest when the service gains resources.

---

# End-to-end workflow (create → add lines → issue → patch)

A typical outbound-air shipment, using only verified endpoints (tenantId required throughout):

```bash
# 1) Create a shipment
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "trackingCode": "TRK-2001", "isInternational": true, "shippingTerms": "CIF",
        "orderId": "<order-guid>" }'   # -> result.id = <shipment-guid>

# 2) Create the airway bill for that shipment
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "documentNumber": "AWB-2001", "shipperContactId": "<contact-guid>",
        "consigneeContactId": "<contact-guid>", "carrierId": "<courier-guid>",
        "shipmentId": "<shipment-guid>" }'   # -> result.id = <billId>

# 3) Add a line
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<billId>/Lines?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{ "description": "Electronics", "quantity": 12, "grossWeightKg": 240, "hsCode": "8471.30" }'

# 4) Issue, then mark in transit
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<billId>/Issue?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<billId>/MarkInTransit?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# 5) Patch the shipment's status atomically when it ships
curl -X PATCH "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments/<shipment-guid>?tenantId=<tenant-guid>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '[ { "op": "replace", "path": "/shipped", "value": true } ]'
```

---

# API Endpoints Quick Reference

`:id`/`:lineId`/`:entryId`/`:tripId` etc. are path params. Unless noted, all
LogisticsService / ShipmentsService / SalesService paths require `?tenantId=<tenant-guid>`.

## InventoryService

| Action | Method | Path |
|--------|--------|------|
| Get stock-item inventory details (no tenantId) | GET | `/api/v2/InventoryService/Inventory/:stockItemId/Details` |

## LogisticsService — Warehouses

| Action | Method | Path |
|--------|--------|------|
| List | GET | `/api/v2/LogisticsService/Warehouses` |
| Count | GET | `/api/v2/LogisticsService/Warehouses/Count` |
| Get | GET | `/api/v2/LogisticsService/Warehouses/:id` |
| Create | POST | `/api/v2/LogisticsService/Warehouses` |
| Update | PUT | `/api/v2/LogisticsService/Warehouses/:id` |
| Patch | PATCH | `/api/v2/LogisticsService/Warehouses/:id` |
| Delete | DELETE | `/api/v2/LogisticsService/Warehouses/:id` |

## LogisticsService — Ports / Vessels / Supplier Profiles (identical CRUD shape)

| Action | Method | Path (Ports shown; swap `Ports`→`Vessels`/`SupplierProfiles`) |
|--------|--------|------|
| List | GET | `/api/v2/LogisticsService/Ports` |
| Count | GET | `/api/v2/LogisticsService/Ports/Count` |
| Get | GET | `/api/v2/LogisticsService/Ports/:id` |
| Create | POST | `/api/v2/LogisticsService/Ports` |
| Update | PUT | `/api/v2/LogisticsService/Ports/:id` |
| Patch | PATCH | `/api/v2/LogisticsService/Ports/:id` |
| Delete | DELETE | `/api/v2/LogisticsService/Ports/:id` |

## LogisticsService — Trucks & Trips

| Action | Method | Path |
|--------|--------|------|
| List / Count / Get / Create / Update / Patch / Delete | (CRUD) | `/api/v2/LogisticsService/Trucks[/Count|/:id]` |
| List trips | GET | `/api/v2/LogisticsService/Trucks/:truckId/Trips` |
| Count trips | GET | `/api/v2/LogisticsService/Trucks/:truckId/Trips/Count` |
| Create trip | POST | `/api/v2/LogisticsService/Trucks/:truckId/Trips` |
| Update trip | PUT | `/api/v2/LogisticsService/Trucks/:truckId/Trips/:tripId` |
| Patch trip | PATCH | `/api/v2/LogisticsService/Trucks/:truckId/Trips/:tripId` |
| Delete trip | DELETE | `/api/v2/LogisticsService/Trucks/:truckId/Trips/:tripId` |
| Trip action | POST | `/api/v2/LogisticsService/Trucks/:truckId/Trips/:tripId/{Arrive\|Cancel\|Deliver\|Depart\|Dispatch}` |

> Note: Trucks has **no `GET /Trips/:tripId`** single-trip read in the manifest.

## LogisticsService — Truck Drivers

| Action | Method | Path |
|--------|--------|------|
| CRUD + Count | (CRUD) | `/api/v2/LogisticsService/TruckDrivers[/Count|/:id]` (+ PATCH `/:id`) |
| Activate | POST | `/api/v2/LogisticsService/TruckDrivers/:id/Activate` |
| Deactivate | POST | `/api/v2/LogisticsService/TruckDrivers/:id/Deactivate` |

## LogisticsService — Voyages & Port Calls

| Action | Method | Path |
|--------|--------|------|
| CRUD + Count + Patch | (CRUD) | `/api/v2/LogisticsService/Voyages[/Count|/:id]` |
| Lifecycle | POST | `/api/v2/LogisticsService/Voyages/:id/{Start\|Complete\|Cancel}` |
| Port calls CRUD + Count + Patch | (CRUD) | `/api/v2/LogisticsService/Voyages/:id/PortCalls[/Count|/:portCallId]` |

## LogisticsService — Proofs of Delivery

| Action | Method | Path |
|--------|--------|------|
| CRUD + Count + Patch | (CRUD) | `/api/v2/LogisticsService/ProofsOfDelivery[/Count|/:id]` |
| Sign / Reject / Dispute | POST | `/api/v2/LogisticsService/ProofsOfDelivery/:id/{Sign\|Reject\|Dispute}` |
| Lines CRUD + Count + Patch | (CRUD) | `/api/v2/LogisticsService/ProofsOfDelivery/:id/Lines[/Count|/:lineId]` |
| List / Count delivery notes | GET | `/api/v2/LogisticsService/ProofsOfDelivery/:id/DeliveryNotes[/Count]` |
| Attach delivery note | POST | `/api/v2/LogisticsService/ProofsOfDelivery/:id/DeliveryNotes/:noteId` |
| Detach delivery note | DELETE | `/api/v2/LogisticsService/ProofsOfDelivery/:id/DeliveryNotes/:noteId` |

## LogisticsService — Delivery Notes

| Action | Method | Path |
|--------|--------|------|
| List / Count / Get / Create / Update / Delete (no PATCH) | (CRUD) | `/api/v2/LogisticsService/DeliveryNotes[/Count|/:id]` |

## LogisticsService — Item Restocks / Pick Lists / Packing Slips (with Entries)

| Action | Method | Path (Restocks shown) |
|--------|--------|------|
| CRUD + Count + Patch | (CRUD) | `/api/v2/LogisticsService/ItemRestocks[/Count|/:id]` |
| Entries CRUD + Count + Patch | (CRUD) | `/api/v2/LogisticsService/ItemRestocks/:id/Entries[/Count|/:entryId]` |

Swap `ItemRestocks`→`ItemPickLists` or `ItemPackingSlips` (same shape).

## LogisticsService — Item Retain Samples

| Action | Method | Path |
|--------|--------|------|
| CRUD + Count + Patch (no entries) | (CRUD) | `/api/v2/LogisticsService/ItemRetainSamples[/Count|/:id]` |

## LogisticsService — Waybills (Airway / Rail / Road / Seaway) + Lines

| Action | Method | Path (`AirwayBills`/`:billId` shown) |
|--------|--------|------|
| CRUD + Count + Patch | (CRUD) | `/api/v2/LogisticsService/AirwayBills[/Count|/:billId]` |
| Lines CRUD + Count + Patch | (CRUD) | `/api/v2/LogisticsService/AirwayBills/:billId/Lines[/Count|/:lineId]` |
| Airway actions | POST | `.../AirwayBills/:billId/{Issue\|Cancel\|MarkInTransit\|MarkArrived\|MarkDelivered}` |
| Rail actions | POST | `.../RailWaybills/:waybillId/{Issue\|Cancel\|MarkInTransit\|MarkDelivered}` |
| Road actions | POST | `.../RoadWaybills/:waybillId/{Issue\|Cancel\|Dispute\|MarkInTransit\|MarkDelivered}` |
| Seaway actions | POST | `.../SeawayBills/:billId/{Issue\|Cancel\|MarkInTransit\|MarkArrived\|Release}` |

> Rail/Road use `:waybillId`, Airway/Seaway use `:billId`. Lines paths and DTO are identical across all four families.

## ShipmentsService

| Action | Method | Path |
|--------|--------|------|
| Shipments CRUD + Count + Patch | (CRUD) | `/api/v2/ShipmentsService/Shipments[/Count|/:id]` |
| Shipping Labels CRUD + Count + Patch | (CRUD) | `/api/v2/ShipmentsService/ShippingLabels[/Count|/:id]` |
| Bills of Lading CRUD + Count + Patch | (CRUD) | `/api/v2/ShipmentsService/BillsOfLading[/Count|/:id]` |
| BoL Lines CRUD + Count + Patch | (CRUD) | `/api/v2/ShipmentsService/BillsOfLading/:id/Lines[/Count|/:lineId]` |
| Shipping Methods CRUD + Count + Patch | (CRUD) | `/api/v2/ShipmentsService/ShippingMethods[/Count|/:id]` |
| Shipping Couriers CRUD + Count + Patch | (CRUD) | `/api/v2/ShipmentsService/ShippingCouriers[/Count|/:id]` |
| Shipping Regions CRUD + Count + Patch | (CRUD) | `/api/v2/ShipmentsService/ShippingRegions[/Count|/:id]` |
| Shipping Zones CRUD + Count + Patch | (CRUD) | `/api/v2/ShipmentsService/ShippingZones[/Count|/:id]` |
| Shipping Classes CRUD + Count + Patch | (CRUD) | `/api/v2/ShipmentsService/ShippingClasses[/Count|/:id]` |
| Item Shipping Policies CRUD + Count + Patch | (CRUD) | `/api/v2/ShipmentsService/ItemShippingPolicies[/Count|/:id]` |

Where `(CRUD)` = GET (list), GET `/Count`, GET `/:id`, POST, PUT `/:id`, PATCH `/:id`, DELETE `/:id`.

## SalesService

| Action | Method | Path |
|--------|--------|------|
| Stores CRUD + Count + Patch | (CRUD) | `/api/v2/SalesService/Stores[/Count|/:id]` |
| Point of Sales CRUD + Count + Patch | (CRUD) | `/api/v2/SalesService/PointOfSales[/Count|/:id]` |
| Loyalty Programs CRUD + Count + Patch | (CRUD) | `/api/v2/SalesService/LoyaltyPrograms[/Count|/:id]` |
| Sales Literatures CRUD + Count + Patch | (CRUD) | `/api/v2/SalesService/SalesLiteratures[/Count|/:id]` |
| Sales Literatures (extended list) | GET | `/api/v2/SalesService/SalesLiteratures/Extended` |
| Margin details (no tenantId) | GET | `/api/v2/SalesService/Margins/:marginId/Details` |

## MarketplaceService

No tenant-domain REST endpoints currently exposed.

---

## Critical rules

- Always check `isSuccess` and read data from `result`.
- Send `?tenantId=<tenant-guid>` on **every** Logistics / Shipments / Sales call (incl. writes,
  `/Count`, `/Extended`, actions). Do **not** send it to `Inventory/.../Details` or
  `Margins/.../Details`.
- PATCH bodies are JSON-Patch arrays (`[{op,path,value}]`); PUT bodies are full DTO objects.
- Create/Update body keys are camelCase as transcribed — except ItemShippingPolicies, which
  use `currencyID`/`countryID`/`countryStateID`/`cityID`/`shippingCourierID` (uppercase `ID`).
- `shippingTerms` (Shipments) and `shippingClassCalculationType` (Shipping Methods) are enums —
  use only the listed values.
- For the CLI equivalent see `absuite-misc-cli`; for general REST conventions see `absuite-rest`.
