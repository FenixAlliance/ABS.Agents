---
name: absuite-misc-cli
description: >
  Manage inventory, logistics, shipments, and sales resources using the `absuite` CLI.
  Covers warehouses, ports, vessels, voyages, waybills, trucks, proofs of delivery,
  shipments, bills of lading, shipping methods/couriers/zones/classes, stores,
  point-of-sales, loyalty programs and sales literature via list/count/get/create/
  update/delete commands plus lifecycle actions. Requires an authenticated CLI session
  (see absuite-login-cli). For atomic PATCH updates or raw HTTP, use the absuite-misc
  (REST) skill.
---

# Alliance Business Suite — Misc Services CLI Skill (Inventory / Logistics / Shipments / Sales / Marketplace)

This skill drives five ABS services through the `absuite` CLI: **inventory**, **logistics**,
**shipments**, **sales**, and **marketplace**. Coverage is uneven — Logistics, Shipments and
Sales have rich command sets; Inventory has a single read command; Marketplace has none. The
CLI does **not** support PATCH (JSON Patch) — for atomic partial updates use the REST skill
`absuite-misc`.

## Prerequisites

1. **Authenticate first:** `absuite login` (see `absuite-login-cli`).
2. **Set your default tenant** so you can omit `--TenantId` on each call:
   ```
   absuite config set --tenant-id <tenant-guid>
   ```
   or pass `--TenantId <tenant-guid>` explicitly. (Examples below use `$TENANT_ID`.)
   All Logistics / Shipments / Sales commands are tenant-scoped and require it.
3. **Discover commands** for any service:
   ```
   absuite logistics list-commands
   absuite logistics get warehouse --help
   ```
   See general CLI conventions in `absuite-cli`.

## Command structure

Two equivalent forms work:

- **Friendly:** `absuite <service> <verb> <entity> --Param value`
  (verbs: `list`, `count`, `search`, `get`, `create`, `update`, `delete`, plus service actions).
- **Canonical function name** (matches the SDK 1:1): `absuite <service> <Verb>-<Entity>Async --Param value`
  e.g. `absuite logistics Get-WarehousesAsync`, `absuite sales New-StoreAsync`.

Service tokens: `inventory`, `logistics`, `shipments`, `sales`, `marketplace`.

JSON DTO parameters are passed as a single-quoted JSON string with the **same camelCase field
names** as the REST DTOs (e.g. `--CreateWarehouseDto '{"title":"...","address1":"..."}'`).
The CLI has **no patch verb** — use `update` (full replace) or the REST skill for partial edits.

---

# inventory

The **inventory** service exposes a single read command (no list/create/update/delete):

```
absuite inventory get inventory-details --StockItemId <stockItemId>
```

Canonical form: `absuite inventory Get-InventoryDetailsAsync --StockItemId <stockItemId>`.
This command is **not** tenant-scoped (it is keyed by the stock item).

---

# logistics

Full command coverage. Every command is tenant-scoped (`--TenantId`). Verbs: list, count, get,
create, update, delete, plus per-resource lifecycle actions. The CLI exposes one function per
manifest operation; representative commands shown below.

## Warehouses, Ports, Vessels, Supplier Profiles (flat CRUD)

```
absuite logistics list warehouses --TenantId $TENANT_ID
absuite logistics count warehouses --TenantId $TENANT_ID
absuite logistics get warehouse --TenantId $TENANT_ID --WarehouseId <id>
absuite logistics create warehouse --TenantId $TENANT_ID \
  --CreateWarehouseDto '{"title":"Central DC","address1":"100 Dock Rd","isGroup":false}'
absuite logistics update warehouse --TenantId $TENANT_ID --WarehouseId <id> \
  --UpdateWarehouseDto '{"title":"Central DC (renamed)","address1":"100 Dock Rd"}'
absuite logistics delete warehouse --TenantId $TENANT_ID --WarehouseId <id>
```

Same shape for `ports` (`--PortId`, `--CreatePortDto`/`--UpdatePortDto`), `vessels`
(`--VesselId`, `--CreateVesselDto`/`--UpdateVesselDto`), and `supplier-profiles`
(`--SupplierProfileId`, `--CreateSupplierProfileDto`/`--UpdateSupplierProfileDto`).
Required create fields: warehouse `title`+`address1`; port `title`+`address1`.

## Trucks & Trips

Trucks are flat CRUD; trips are a sub-resource of a truck with their own CRUD plus five
lifecycle actions (no patch, no single-trip get).

```
absuite logistics list trucks --TenantId $TENANT_ID
absuite logistics get truck --TenantId $TENANT_ID --TruckId <id>
absuite logistics create truck --TenantId $TENANT_ID \
  --CreateTruckDto '{"plateNumber":"ABC-123","name":"Truck 1","truckType":"Semi","isActive":true}'
absuite logistics update truck --TenantId $TENANT_ID --TruckId <id> --UpdateTruckDto '{...}'
absuite logistics delete truck --TenantId $TENANT_ID --TruckId <id>

# Trips
absuite logistics list truck-trips --TenantId $TENANT_ID --TruckId <id>
absuite logistics count truck-trips --TenantId $TENANT_ID --TruckId <id>
absuite logistics create truck-trip --TenantId $TENANT_ID --TruckId <id> \
  --CreateTruckTripDto '{"tripNumber":"T-1001","departureTime":"2026-06-12T08:00:00Z"}'
absuite logistics update truck-trip --TenantId $TENANT_ID --TruckId <id> --TripId <tripId> --UpdateTruckTripDto '{...}'
absuite logistics delete truck-trip --TenantId $TENANT_ID --TruckId <id> --TripId <tripId>

# Trip lifecycle actions (Dispatch -> Depart -> Arrive -> Deliver ; or Cancel)
absuite logistics dispatch truck-trip --TenantId $TENANT_ID --TruckId <id> --TripId <tripId>
absuite logistics depart   truck-trip --TenantId $TENANT_ID --TruckId <id> --TripId <tripId>
absuite logistics arrive   truck-trip --TenantId $TENANT_ID --TruckId <id> --TripId <tripId>
absuite logistics deliver  truck-trip --TenantId $TENANT_ID --TruckId <id> --TripId <tripId>
absuite logistics cancel   truck-trip --TenantId $TENANT_ID --TruckId <id> --TripId <tripId>
```

## Truck Drivers

Flat CRUD plus **activate / deactivate**:

```
absuite logistics list truck-drivers --TenantId $TENANT_ID
absuite logistics create truck-driver --TenantId $TENANT_ID \
  --CreateTruckDriverDto '{"name":"A. Driver","licenseNumber":"D-100"}'
absuite logistics activate   truck-driver --TenantId $TENANT_ID --DriverId <id>
absuite logistics deactivate truck-driver --TenantId $TENANT_ID --DriverId <id>
```

## Voyages & Port Calls

Voyages: CRUD plus **start / complete / cancel**. Port calls: CRUD sub-resource.

```
absuite logistics list voyages --TenantId $TENANT_ID
absuite logistics create voyage --TenantId $TENANT_ID \
  --CreateVoyageDto '{"voyageNumber":"VY-2026-01","vesselId":"<vessel-guid>"}'
absuite logistics start    voyage --TenantId $TENANT_ID --VoyageId <id>
absuite logistics complete voyage --TenantId $TENANT_ID --VoyageId <id>
absuite logistics cancel   voyage --TenantId $TENANT_ID --VoyageId <id>

absuite logistics list voyage-port-calls --TenantId $TENANT_ID --VoyageId <id>
absuite logistics create voyage-port-call --TenantId $TENANT_ID --VoyageId <id> \
  --CreateVoyagePortCallDto '{"sequenceNumber":1,"portId":"<port-guid>"}'
absuite logistics delete voyage-port-call --TenantId $TENANT_ID --VoyageId <id> --PortCallId <pcId>
```

## Proofs of Delivery (+ Lines, + Delivery Notes)

CRUD plus **sign / reject / dispute**, a Lines sub-resource (CRUD), and delivery-note
attach/detach.

```
absuite logistics list proofs-of-delivery --TenantId $TENANT_ID
absuite logistics create proof-of-delivery --TenantId $TENANT_ID \
  --CreateProofOfDeliveryDto '{"documentNumber":"POD-1001","shipmentId":"<shipment-guid>"}'
absuite logistics sign    proof-of-delivery --TenantId $TENANT_ID --PodId <id> --SignProofOfDeliveryRequest '{"signedBy":"J. Receiver"}'
absuite logistics reject  proof-of-delivery --TenantId $TENANT_ID --PodId <id> --RejectProofOfDeliveryRequest '{"reason":"Seal broken"}'
absuite logistics dispute proof-of-delivery --TenantId $TENANT_ID --PodId <id> --DisputeProofOfDeliveryRequest '{"reason":"..."}'

# POD lines
absuite logistics list proof-of-delivery-lines --TenantId $TENANT_ID --PodId <id>
absuite logistics create proof-of-delivery-line --TenantId $TENANT_ID --PodId <id> \
  --CreateProofOfDeliveryLineDto '{"description":"Pallet A","quantityExpected":10,"quantityReceived":9}'
absuite logistics delete proof-of-delivery-line --TenantId $TENANT_ID --PodId <id> --LineId <lineId>

# Attach / detach delivery notes (noteId in the command, not a body)
absuite logistics attach proof-of-delivery-note --TenantId $TENANT_ID --PodId <id> --NoteId <noteId>
absuite logistics detach proof-of-delivery-note --TenantId $TENANT_ID --PodId <id> --NoteId <noteId>
```

## Delivery Notes

Flat CRUD (no actions):

```
absuite logistics list delivery-notes --TenantId $TENANT_ID
absuite logistics create delivery-note --TenantId $TENANT_ID \
  --CreateDeliveryNoteDto '{"title":"DN-1001","shipmentId":"<shipment-guid>"}'
```

## Item Restocks / Pick Lists / Packing Slips / Retain Samples (+ Entries)

CRUD aggregates; restocks/pick-lists/packing-slips also have an Entries sub-resource:

```
absuite logistics list item-restocks --TenantId $TENANT_ID
absuite logistics create item-restock --TenantId $TENANT_ID \
  --CreateItemRestockDto '{"name":"Q3 replenishment"}'
absuite logistics list item-restock-entries --TenantId $TENANT_ID --RestockId <id>
absuite logistics create item-restock-entry --TenantId $TENANT_ID --RestockId <id> \
  --CreateItemRestockEntryDto '{"itemId":"<item-guid>","warehouseId":"<wh-guid>","itemRestockId":"<id>","quantity":100}'
```

Swap `item-restocks`→`item-pick-lists`/`item-packing-slips` (each with `...-entries`), or
`item-retain-samples` (no entries; create requires `warehouseId`+`itemId`).

## Waybills (Airway / Rail / Road / Seaway) + Lines

Four parallel families, each CRUD + Lines sub-resource + lifecycle actions:

```
# Airway bills (representative)
absuite logistics list airway-bills --TenantId $TENANT_ID
absuite logistics create airway-bill --TenantId $TENANT_ID \
  --CreateAirwayBillDto '{"documentNumber":"AWB-1001","shipperContactId":"<c>","consigneeContactId":"<c>"}'
absuite logistics get airway-bill --TenantId $TENANT_ID --BillId <id>
absuite logistics update airway-bill --TenantId $TENANT_ID --BillId <id> --UpdateAirwayBillDto '{...}'
absuite logistics delete airway-bill --TenantId $TENANT_ID --BillId <id>

# Lines (shared waybill-line DTO)
absuite logistics list airway-bill-lines --TenantId $TENANT_ID --BillId <id>
absuite logistics create airway-bill-line --TenantId $TENANT_ID --BillId <id> \
  --CreateWaybillLineDto '{"description":"Electronics","quantity":12,"grossWeightKg":240}'

# Lifecycle actions
absuite logistics issue          airway-bill --TenantId $TENANT_ID --BillId <id>
absuite logistics mark-in-transit airway-bill --TenantId $TENANT_ID --BillId <id>
absuite logistics mark-arrived    airway-bill --TenantId $TENANT_ID --BillId <id>
absuite logistics mark-delivered  airway-bill --TenantId $TENANT_ID --BillId <id>
absuite logistics cancel          airway-bill --TenantId $TENANT_ID --BillId <id>
```

Family / id-param / actions:

| Family | entity token | id param | actions |
|--------|--------------|----------|---------|
| Airway Bills | `airway-bill` | `--BillId` | issue, cancel, mark-in-transit, mark-arrived, mark-delivered |
| Rail Waybills | `rail-waybill` | `--WaybillId` | issue, cancel, mark-in-transit, mark-delivered |
| Road Waybills | `road-waybill` | `--WaybillId` | issue, cancel, dispute, mark-in-transit, mark-delivered |
| Seaway Bills | `seaway-bill` | `--BillId` | issue, cancel, mark-in-transit, mark-arrived, release |

---

# shipments

Full command coverage; every command is tenant-scoped (`--TenantId`). Verbs: list, count, get,
create, update, delete. **No lifecycle actions** in this service. Only Bills of Lading have a
Lines sub-resource.

```
# Shipments (shippingTerms is an Incoterms enum: NC|EXW|FCA|FOB|FAS|CFR|CIF|CPT|CIP|DDP|DAP|DPU)
absuite shipments list shipments --TenantId $TENANT_ID
absuite shipments get shipment --TenantId $TENANT_ID --ShipmentId <id>
absuite shipments create shipment --TenantId $TENANT_ID \
  --CreateShipmentDto '{"trackingCode":"TRK-1001","isInternational":true,"shippingTerms":"CIF"}'
absuite shipments update shipment --TenantId $TENANT_ID --ShipmentId <id> --UpdateShipmentDto '{...}'
absuite shipments delete shipment --TenantId $TENANT_ID --ShipmentId <id>

# Shipping labels
absuite shipments create shipping-label --TenantId $TENANT_ID \
  --CreateShippingLabelDto '{"trackingCode":"TRK-1001","shipmentId":"<shipment-guid>"}'

# Bills of lading + lines
absuite shipments list bills-of-lading --TenantId $TENANT_ID
absuite shipments create bill-of-lading --TenantId $TENANT_ID \
  --CreateBillOfLadingDto '{"billOfLadingNumber":"BL-1001","title":"Ocean BL"}'
absuite shipments list bill-of-lading-lines --TenantId $TENANT_ID --BillOfLadingId <id>
absuite shipments create bill-of-lading-line --TenantId $TENANT_ID --BillOfLadingId <id> \
  --CreateBillOfLadingLineDto '{"description":"Coffee beans","quantity":100,"itemId":"<item-guid>"}'

# Flat catalogs (CRUD + count): methods, couriers, regions, zones, classes, item shipping policies
absuite shipments list shipping-methods --TenantId $TENANT_ID
absuite shipments create shipping-method --TenantId $TENANT_ID \
  --CreateShippingMethodDto '{"name":"Standard Ground","cost":9.99,"shippingClassCalculationType":"PerOrder"}'
absuite shipments create shipping-courier --TenantId $TENANT_ID --CreateShippingCourierDto '{"name":"Example Courier"}'
absuite shipments create shipping-region  --TenantId $TENANT_ID --CreateShippingRegionDto '{"name":"Northeast"}'
absuite shipments create shipping-zone    --TenantId $TENANT_ID --CreateShippingZoneDto '{"name":"Domestic","default":true}'
absuite shipments create shipping-class   --TenantId $TENANT_ID --CreateShippingClassDto '{"name":"Fragile","slug":"fragile"}'
absuite shipments create item-shipping-policy --TenantId $TENANT_ID \
  --CreateItemShippingPolicyDto '{"title":"Free over $50","type":"Threshold","code":"FREE50","currencyID":"<c>","shippingCourierID":"<c>"}'
```

> `shippingClassCalculationType` enum: `PerClass|PerOrder`. ItemShippingPolicy create
> requires `title`, `type`, `code`, `currencyID`, `shippingCourierID` (note uppercase `ID`).
> Entity id params: `--ShipmentId`, `--LabelId`, `--BillOfLadingId`/`--LineId`, `--MethodId`,
> `--CourierId`, `--RegionId`, `--ZoneId`, `--ClassId`, `--PolicyId`.

---

# sales

Full command coverage for the four collection aggregates; every command is tenant-scoped.
Verbs: list, count, get, create, update, delete. **No lifecycle actions.** Margins is a
read-only lookup (not tenant-scoped).

```
# Stores
absuite sales list stores --TenantId $TENANT_ID
absuite sales get store --TenantId $TENANT_ID --StoreId <id>
absuite sales create store --TenantId $TENANT_ID \
  --CreateStoreDto '{"name":"Flagship Store","eCommerce":true,"currencyId":"<currency-guid>"}'
absuite sales update store --TenantId $TENANT_ID --StoreId <id> --UpdateStoreDto '{...}'
absuite sales delete store --TenantId $TENANT_ID --StoreId <id>

# Point of sales
absuite sales create point-of-sale --TenantId $TENANT_ID \
  --CreatePointOfSaleDto '{"title":"Register 1","code":"POS-1"}'

# Loyalty programs
absuite sales create loyalty-program --TenantId $TENANT_ID \
  --CreateLoyaltyProgramDto '{"title":"Gold Tier"}'

# Sales literatures (+ extended list)
absuite sales list sales-literatures --TenantId $TENANT_ID
absuite sales list extended-sales-literatures --TenantId $TENANT_ID
absuite sales create sales-literature --TenantId $TENANT_ID \
  --CreateSalesLiteratureDto '{"title":"Product Brochure","content":"..."}'

# Margins (read-only; no --TenantId)
absuite sales get margin-details --MarginId <marginId>
```

Required create fields: store `name`; point-of-sale `title`; loyalty-program `title`.
Entity id params: `--StoreId`, `--PointOfSaleId`, `--LoyaltyProgramId`, `--SalesLiteratureId`.

---

# marketplace

The **marketplace** service has **no domain commands** in the CLI (its API surface currently
exposes only shared host endpoints). There is nothing to list/create/update here yet.

```
# Confirm — returns no domain commands today
absuite marketplace list-commands
```

Re-check `list-commands` periodically; new marketplace commands will appear here when the
service gains resources.

---

# CLI Commands Quick Reference

(Use `$TENANT_ID` or `--TenantId <guid>`; inventory `get` and sales `get margin-details` are not tenant-scoped.)

## inventory

| Action | CLI command |
|--------|-------------|
| Get inventory details | `absuite inventory get inventory-details --StockItemId <id>` |

## logistics

| Action | CLI command |
|--------|-------------|
| List / count / get / create / update / delete (per resource) | `absuite logistics <verb> <entity> --TenantId $TENANT_ID [--<Id> <id>] [--<Dto> '{...}']` |
| Warehouses | `... warehouse(s)` `--WarehouseId` `--CreateWarehouseDto`/`--UpdateWarehouseDto` |
| Ports / Vessels / Supplier Profiles | `... port(s)`/`vessel(s)`/`supplier-profile(s)` + matching `--<Entity>Id`/DTO |
| Trucks | `... truck(s)` `--TruckId` |
| Truck Trips | `... truck-trip(s) --TruckId <id> [--TripId <tripId>]` |
| Truck Trip actions | `absuite logistics {dispatch\|depart\|arrive\|deliver\|cancel} truck-trip --TruckId <id> --TripId <tripId>` |
| Truck Drivers | `... truck-driver(s) --DriverId` (+ `activate`/`deactivate`) |
| Voyages | `... voyage(s) --VoyageId` (+ `start`/`complete`/`cancel`) |
| Voyage Port Calls | `... voyage-port-call(s) --VoyageId <id> [--PortCallId <pcId>]` |
| Proofs of Delivery | `... proof(s)-of-delivery --PodId` (+ `sign`/`reject`/`dispute`) |
| POD Lines | `... proof-of-delivery-line(s) --PodId <id> [--LineId <lineId>]` |
| POD Delivery Notes | `absuite logistics {attach\|detach} proof-of-delivery-note --PodId <id> --NoteId <noteId>` |
| Delivery Notes | `... delivery-note(s) --DeliveryNoteId` |
| Item Restocks / Pick Lists / Packing Slips (+ entries) | `... item-restock(s)`/`item-pick-list(s)`/`item-packing-slip(s)` and `...-entries` |
| Item Retain Samples | `... item-retain-sample(s) --RetainSampleId` |
| Airway / Rail / Road / Seaway bills (+ lines) | `... airway-bill`/`rail-waybill`/`road-waybill`/`seaway-bill` (+ `...-line(s)`) |
| Waybill actions | `absuite logistics {issue\|cancel\|mark-in-transit\|mark-arrived\|mark-delivered\|dispute\|release} <waybill-entity> --BillId/--WaybillId <id>` |

## shipments

| Action | CLI command |
|--------|-------------|
| Shipments | `absuite shipments <verb> shipment(s) --TenantId $TENANT_ID [--ShipmentId <id>]` |
| Shipping Labels | `... shipping-label(s) --LabelId` |
| Bills of Lading (+ lines) | `... bill(s)-of-lading --BillOfLadingId` ; `... bill-of-lading-line(s) --BillOfLadingId <id> [--LineId <lineId>]` |
| Shipping Methods / Couriers / Regions / Zones / Classes | `... shipping-method(s)`/`courier(s)`/`region(s)`/`zone(s)`/`class(es)` + matching `--<Entity>Id` |
| Item Shipping Policies | `... item-shipping-policy(ies) --PolicyId` |

## sales

| Action | CLI command |
|--------|-------------|
| Stores | `absuite sales <verb> store(s) --TenantId $TENANT_ID [--StoreId <id>]` |
| Point of Sales | `... point-of-sale(s) --PointOfSaleId` |
| Loyalty Programs | `... loyalty-program(s) --LoyaltyProgramId` |
| Sales Literatures (+ extended list) | `... sales-literature(s) --SalesLiteratureId` ; `... list extended-sales-literatures` |
| Margin details (no tenant) | `absuite sales get margin-details --MarginId <id>` |

## marketplace

| Action | CLI command |
|--------|-------------|
| (none) | No domain commands; run `absuite marketplace list-commands` to re-check |

---

## Critical rules

- Authenticate with `absuite login` first (`absuite-login-cli`); set the default tenant via
  `absuite config set --tenant-id <guid>` or pass `--TenantId <guid>` on each call.
- Logistics / Shipments / Sales commands are tenant-scoped. Inventory `get inventory-details`
  and Sales `get margin-details` are **not** — do not pass `--TenantId` to them.
- The CLI has **no PATCH**. For atomic partial updates (JSON Patch) or raw HTTP, use the
  REST skill `absuite-misc`.
- Pass DTO bodies as single-quoted JSON with the same camelCase field names as the REST DTOs
  (ItemShippingPolicy uses uppercase `currencyID`/`shippingCourierID`).
- When unsure of a verb/entity/parameter spelling, run `absuite <service> list-commands` and
  `absuite <service> <verb> <entity> --help` rather than guessing.
- See `absuite-cli` for general CLI conventions.
