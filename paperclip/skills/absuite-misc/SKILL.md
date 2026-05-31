---
name: absuite-misc
description: >
  Minimal ABS CLI services with limited commands: marketplace, inventory, logistics,
  shipments, and sales. These services currently have very few functions but are
  documented here for completeness. Requires an authenticated CLI session.
---

# Alliance Business Suite — Miscellaneous Services Skill

These services have minimal CLI coverage. They are grouped here for reference.

## Prerequisites

1. **Authenticate first** using `absuite login` (see the `absuite-login` skill).
2. **Set your tenant** where applicable.

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

---

## Inventory

```bash
# List inventory details
absuite inventory list details --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InventoryService/Inventory/<stockItemId>/Details" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Logistics

The LogisticsService provides a comprehensive set of resources for managing supply chain, transport documents, and warehousing.

### Warehouses

```bash
absuite logistics list warehouses --TenantId $TENANT_ID
absuite logistics get warehouse --TenantId $TENANT_ID --WarehouseId <id>
absuite logistics create warehouse --TenantId $TENANT_ID --CreateWarehouseDto '{...}'
absuite logistics update warehouse --TenantId $TENANT_ID --WarehouseId <id> --UpdateWarehouseDto '{...}'
absuite logistics delete warehouse --TenantId $TENANT_ID --WarehouseId <id>
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Ports

```bash
absuite logistics list ports --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Vessels

```bash
absuite logistics list vessels --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Vessels" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Vessels/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Vessels" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/Vessels/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/Vessels/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Trucks & Truck Drivers

```bash
absuite logistics list trucks --TenantId $TENANT_ID
absuite logistics list truck-drivers --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
# Trucks
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Truck Trips (sub-resource of Trucks)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
# Trip actions: /Arrive, /Cancel, /Deliver, /Depart, /Dispatch
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips/<tripId>/Dispatch" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Truck Drivers
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
# Driver actions: /Activate, /Deactivate
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers/<id>/Activate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Voyages & Port Calls

```bash
absuite logistics list voyages --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
# Voyage actions: /Start, /Cancel, /Complete
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<id>/Start" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Port Calls (sub-resource of Voyages)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<voyageId>/PortCalls" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<voyageId>/PortCalls" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
```

### Proofs of Delivery

```bash
absuite logistics list proofs-of-delivery --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
# Actions: /Sign, /Reject, /Dispute
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/Sign" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Lines & Delivery Notes (sub-resources)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/DeliveryNotes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Delivery Notes

```bash
absuite logistics list delivery-notes --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/DeliveryNotes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/DeliveryNotes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/DeliveryNotes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/DeliveryNotes/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/DeliveryNotes/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Supplier Profiles

```bash
absuite logistics list supplier-profiles --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SupplierProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SupplierProfiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/SupplierProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/SupplierProfiles/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/SupplierProfiles/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Item Packing Slips & Item Restocks

```bash
absuite logistics list packing-slips --TenantId $TENANT_ID
absuite logistics list item-restocks --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
# Item Packing Slips
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips/<id>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Item Restocks
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks/<id>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Item Retain Samples & Item Pick Lists

**REST API only:**
```bash
# Item Retain Samples
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRetainSamples" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRetainSamples" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Item Pick Lists
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists/<id>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Airway Bills

**REST API only:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
# Actions: /Cancel, /Issue, /MarkArrived, /MarkDelivered, /MarkInTransit
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/Issue" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Lines (sub-resource)
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
```

### Rail Waybills

**REST API only:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
# Actions: /Cancel, /Issue, /MarkDelivered, /MarkInTransit
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Road Waybills

**REST API only:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
# Actions: /Cancel, /Dispute, /Issue, /MarkDelivered, /MarkInTransit
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Seaway Bills

**REST API only:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
# Actions: /Cancel, /Issue, /MarkArrived, /MarkInTransit, /Release
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Shipments

The ShipmentsService manages shipments, labels, bills of lading, shipping methods, couriers, regions, zones, policies, and classes.

### Shipments & Labels

```bash
absuite shipments list --TenantId $TENANT_ID
absuite shipments get --TenantId $TENANT_ID --ShipmentId <id>
absuite shipments create --TenantId $TENANT_ID --CreateShipmentDto '{...}'
absuite shipments update --TenantId $TENANT_ID --ShipmentId <id> --UpdateShipmentDto '{...}'
absuite shipments delete --TenantId $TENANT_ID --ShipmentId <id>
```

**REST API equivalents:**
```bash
# Shipments
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Shipping Labels
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingLabels" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingLabels" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
```

### Bills of Lading

```bash
absuite shipments list bills-of-lading --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
# Lines sub-resource
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Shipping Configuration

```bash
absuite shipments list methods --TenantId $TENANT_ID
absuite shipments list couriers --TenantId $TENANT_ID
absuite shipments list regions --TenantId $TENANT_ID
absuite shipments list zones --TenantId $TENANT_ID
absuite shipments list classes --TenantId $TENANT_ID
absuite shipments list policies --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
# Shipping Methods, Couriers, Regions, Zones, Classes, Policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingMethods" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingCouriers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingRegions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingZones" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingClasses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ItemShippingPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Sales

The SalesService manages stores, point-of-sale terminals, loyalty programs, sales literature, and margins.

```bash
absuite sales list stores --TenantId $TENANT_ID
absuite sales get store --TenantId $TENANT_ID --StoreId <id>
absuite sales list loyalty-programs --TenantId $TENANT_ID
absuite sales list point-of-sales --TenantId $TENANT_ID
absuite sales list sales-literatures --TenantId $TENANT_ID
absuite sales list margins --TenantId $TENANT_ID
```

**REST API equivalents:**
```bash
# Stores
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/Stores" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/Stores/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/Stores" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Loyalty Programs
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/LoyaltyPrograms" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/LoyaltyPrograms" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Point of Sales
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/PointOfSales" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/PointOfSales" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Sales Literatures
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/SalesLiteratures" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/SalesLiteratures" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Margins
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/Margins" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/Margins" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'
```

---

## Marketplace

The marketplace service currently has **no commands available** via the CLI.

```bash
# Check for updates
absuite marketplace list-commands
```

---

## API Endpoints Quick Reference

### InventoryService

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v2/InventoryService/Inventory/:stockItemId/Details` | Get inventory details |

### LogisticsService

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v2/LogisticsService/Warehouses` | List warehouses |
| POST | `/api/v2/LogisticsService/Warehouses` | Create warehouse |
| GET | `/api/v2/LogisticsService/Ports` | List ports |
| POST | `/api/v2/LogisticsService/Ports` | Create port |
| GET | `/api/v2/LogisticsService/Vessels` | List vessels |
| POST | `/api/v2/LogisticsService/Vessels` | Create vessel |
| GET | `/api/v2/LogisticsService/Trucks` | List trucks |
| POST | `/api/v2/LogisticsService/Trucks` | Create truck |
| GET | `/api/v2/LogisticsService/Trucks/:id/Trips` | List truck trips |
| POST | `/api/v2/LogisticsService/Trucks/:id/Trips/:tripId/Dispatch` | Dispatch trip |
| GET | `/api/v2/LogisticsService/TruckDrivers` | List truck drivers |
| POST | `/api/v2/LogisticsService/TruckDrivers/:id/Activate` | Activate driver |
| GET | `/api/v2/LogisticsService/Voyages` | List voyages |
| POST | `/api/v2/LogisticsService/Voyages/:id/Start` | Start voyage |
| GET | `/api/v2/LogisticsService/Voyages/:id/PortCalls` | List port calls |
| GET | `/api/v2/LogisticsService/ProofsOfDelivery` | List proofs of delivery |
| POST | `/api/v2/LogisticsService/ProofsOfDelivery/:id/Sign` | Sign proof |
| GET | `/api/v2/LogisticsService/DeliveryNotes` | List delivery notes |
| GET | `/api/v2/LogisticsService/SupplierProfiles` | List supplier profiles |
| GET | `/api/v2/LogisticsService/ItemPackingSlips` | List packing slips |
| GET | `/api/v2/LogisticsService/ItemRestocks` | List item restocks |
| GET | `/api/v2/LogisticsService/ItemRetainSamples` | List retain samples |
| GET | `/api/v2/LogisticsService/ItemPickLists` | List pick lists |
| GET | `/api/v2/LogisticsService/AirwayBills` | List airway bills |
| POST | `/api/v2/LogisticsService/AirwayBills/:id/Issue` | Issue airway bill |
| GET | `/api/v2/LogisticsService/RailWaybills` | List rail waybills |
| POST | `/api/v2/LogisticsService/RailWaybills/:id/Issue` | Issue rail waybill |
| GET | `/api/v2/LogisticsService/RoadWaybills` | List road waybills |
| POST | `/api/v2/LogisticsService/RoadWaybills/:id/Issue` | Issue road waybill |
| GET | `/api/v2/LogisticsService/SeawayBills` | List seaway bills |
| POST | `/api/v2/LogisticsService/SeawayBills/:id/Issue` | Issue seaway bill |

### ShipmentsService

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v2/ShipmentsService/Shipments` | List shipments |
| POST | `/api/v2/ShipmentsService/Shipments` | Create shipment |
| GET | `/api/v2/ShipmentsService/ShippingLabels` | List shipping labels |
| POST | `/api/v2/ShipmentsService/ShippingLabels` | Create shipping label |
| GET | `/api/v2/ShipmentsService/BillsOfLading` | List bills of lading |
| POST | `/api/v2/ShipmentsService/BillsOfLading` | Create bill of lading |
| GET | `/api/v2/ShipmentsService/ShippingMethods` | List shipping methods |
| GET | `/api/v2/ShipmentsService/ShippingCouriers` | List shipping couriers |
| GET | `/api/v2/ShipmentsService/ShippingRegions` | List shipping regions |
| GET | `/api/v2/ShipmentsService/ShippingZones` | List shipping zones |
| GET | `/api/v2/ShipmentsService/ShippingClasses` | List shipping classes |
| GET | `/api/v2/ShipmentsService/ItemShippingPolicies` | List shipping policies |

### SalesService

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v2/SalesService/Stores` | List stores |
| POST | `/api/v2/SalesService/Stores` | Create store |
| GET | `/api/v2/SalesService/LoyaltyPrograms` | List loyalty programs |
| POST | `/api/v2/SalesService/LoyaltyPrograms` | Create loyalty program |
| GET | `/api/v2/SalesService/PointOfSales` | List point of sales |
| POST | `/api/v2/SalesService/PointOfSales` | Create point of sale |
| GET | `/api/v2/SalesService/SalesLiteratures` | List sales literatures |
| POST | `/api/v2/SalesService/SalesLiteratures` | Create sales literature |
| GET | `/api/v2/SalesService/Margins` | List margins |
| POST | `/api/v2/SalesService/Margins` | Create margin |

## Critical Rules

- These services have limited CLI coverage — check `list-commands` periodically for new additions.
- Use the REST API for resources not yet available through the CLI.
- Use dedicated services for full functionality (e.g., `absuite quotes` for quote management, `absuite catalog` for product catalog).
