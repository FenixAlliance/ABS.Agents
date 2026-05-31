---
name: absuite-misc
description: >
  Covers inventory, logistics, shipments, sales, and marketplace services in ABS.
  While CLI coverage is minimal, the REST API provides comprehensive CRUD operations
  across warehouses, ports, vessels, voyages, shipments, bills of lading, and more.
  Requires an authenticated CLI session or REST bearer token.
---

# Alliance Business Suite — Miscellaneous Services Skill

These services have minimal CLI coverage but extensive REST API support. The REST API provides full CRUD operations, record counts, sub-resource management, and lifecycle actions for logistics, shipments, and sales resources. They are grouped here by service for reference.

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

### InventoryService

The InventoryService exposes a single endpoint for retrieving stock item details.

```bash
# List inventory details
absuite inventory list details --TenantId $TENANT_ID
```

**REST API — Get inventory details for a stock item:**
```bash
curl -X GET "$ABSUITE_HOST_URL/api/v2/InventoryService/Inventory/<stockItemId>/Details" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Logistics

The LogisticsService provides a comprehensive set of resources for managing supply chain, transport documents, warehousing, and freight operations. Each resource supports full CRUD plus count unless noted otherwise.

### Warehouses

```bash
absuite logistics list warehouses --TenantId $TENANT_ID
absuite logistics get warehouse --TenantId $TENANT_ID --WarehouseId <id>
absuite logistics create warehouse --TenantId $TENANT_ID --CreateWarehouseDto '{...}'
absuite logistics update warehouse --TenantId $TENANT_ID --WarehouseId <id> --UpdateWarehouseDto '{...}'
absuite logistics delete warehouse --TenantId $TENANT_ID --WarehouseId <id>
```

**REST API — Full CRUD + Count:**
```bash
# List all warehouses
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count warehouses
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get warehouse by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create warehouse
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update warehouse
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete warehouse
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/Warehouses/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Ports

```bash
# List ports
absuite logistics list ports --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all ports
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count ports
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get port by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create port
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update port
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete port
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/Ports/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Vessels

```bash
# List vessels
absuite logistics list vessels --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all vessels
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Vessels" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count vessels
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Vessels/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get vessel by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Vessels/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create vessel
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Vessels" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update vessel
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/Vessels/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete vessel
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/Vessels/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Trucks

```bash
# List trucks
absuite logistics list trucks --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all trucks
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count trucks
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get truck by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create truck
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update truck
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete truck
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API — Truck Trips (sub-resource with CRUD + Count + lifecycle actions):**
```bash
# List trips for a truck
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count trips for a truck
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get trip by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips/<tripId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create trip
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update trip
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips/<tripId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete trip
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips/<tripId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Lifecycle actions: Arrive, Cancel, Deliver, Depart, Dispatch
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips/<tripId>/Arrive" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips/<tripId>/Cancel" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips/<tripId>/Deliver" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips/<tripId>/Depart" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Trucks/<truckId>/Trips/<tripId>/Dispatch" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Truck Drivers

```bash
# List truck drivers
absuite logistics list truck-drivers --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count + Activate/Deactivate:**
```bash
# List all truck drivers
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count truck drivers
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get truck driver by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create truck driver
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update truck driver
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete truck driver
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Activate driver
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers/<id>/Activate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Deactivate driver
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/TruckDrivers/<id>/Deactivate" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Voyages

```bash
# List voyages
absuite logistics list voyages --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count + lifecycle actions:**
```bash
# List all voyages
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count voyages
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get voyage by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create voyage
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update voyage
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete voyage
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Lifecycle actions: Cancel, Complete, Start
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<id>/Cancel" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<id>/Complete" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<id>/Start" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API — Port Calls (sub-resource of Voyages, CRUD + Count):**
```bash
# List port calls for a voyage
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<voyageId>/PortCalls" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count port calls for a voyage
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<voyageId>/PortCalls/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get port call by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<voyageId>/PortCalls/<portCallId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create port call
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<voyageId>/PortCalls" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update port call
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<voyageId>/PortCalls/<portCallId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete port call
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/Voyages/<voyageId>/PortCalls/<portCallId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Proofs of Delivery

```bash
# List proofs of delivery
absuite logistics list proofs-of-delivery --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count + actions:**
```bash
# List all proofs of delivery
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count proofs of delivery
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get proof of delivery by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create proof of delivery
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update proof of delivery
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete proof of delivery
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Actions: Dispute, Reject, Sign
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/Dispute" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/Reject" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/Sign" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API — Proof of Delivery Lines (sub-resource, CRUD + Count):**
```bash
# List lines
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count lines
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/Lines/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get line by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create line
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update line
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete line
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API — Proof of Delivery → Delivery Notes (attach/detach + Count):**
```bash
# List attached delivery notes
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/DeliveryNotes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count attached delivery notes
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/DeliveryNotes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Attach a delivery note
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/DeliveryNotes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{"deliveryNoteId": "<noteId>"}'

# Detach a delivery note
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/ProofsOfDelivery/<id>/DeliveryNotes/<noteId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Delivery Notes

```bash
# List delivery notes
absuite logistics list delivery-notes --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all delivery notes
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/DeliveryNotes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count delivery notes
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/DeliveryNotes/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get delivery note by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/DeliveryNotes/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create delivery note
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/DeliveryNotes" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update delivery note
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/DeliveryNotes/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete delivery note
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/DeliveryNotes/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Supplier Profiles

```bash
# List supplier profiles
absuite logistics list supplier-profiles --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all supplier profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SupplierProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count supplier profiles
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SupplierProfiles/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get supplier profile by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SupplierProfiles/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create supplier profile
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/SupplierProfiles" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update supplier profile
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/SupplierProfiles/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete supplier profile
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/SupplierProfiles/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Item Restocks

```bash
# List item restocks
absuite logistics list item-restocks --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all item restocks
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count item restocks
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get item restock by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create item restock
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update item restock
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete item restock
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API — Item Restock Entries (sub-resource, CRUD + Count):**
```bash
# List entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks/<id>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks/<id>/Entries/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get entry by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks/<id>/Entries/<entryId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create entry
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks/<id>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update entry
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks/<id>/Entries/<entryId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete entry
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRestocks/<id>/Entries/<entryId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Item Retain Samples

**REST API only — Full CRUD + Count:**
```bash
# List all item retain samples
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRetainSamples" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count item retain samples
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRetainSamples/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get item retain sample by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRetainSamples/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create item retain sample
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRetainSamples" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update item retain sample
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRetainSamples/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete item retain sample
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemRetainSamples/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Item Packing Slips

```bash
# List packing slips
absuite logistics list packing-slips --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all item packing slips
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count item packing slips
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get item packing slip by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create item packing slip
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update item packing slip
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete item packing slip
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API — Item Packing Slip Entries (sub-resource, CRUD + Count):**
```bash
# List entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips/<id>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips/<id>/Entries/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get entry by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips/<id>/Entries/<entryId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create entry
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips/<id>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update entry
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips/<id>/Entries/<entryId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete entry
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPackingSlips/<id>/Entries/<entryId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Item Pick Lists

**REST API only — Full CRUD + Count:**
```bash
# List all item pick lists
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count item pick lists
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get item pick list by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create item pick list
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update item pick list
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete item pick list
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API — Item Pick List Entries (sub-resource, CRUD + Count):**
```bash
# List entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists/<id>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count entries
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists/<id>/Entries/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get entry by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists/<id>/Entries/<entryId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create entry
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists/<id>/Entries" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update entry
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists/<id>/Entries/<entryId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete entry
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/ItemPickLists/<id>/Entries/<entryId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Airway Bills

**REST API only — Full CRUD + Count + lifecycle actions + Lines sub-resource:**
```bash
# List all airway bills
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count airway bills
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get airway bill by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create airway bill
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update airway bill
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete airway bill
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Lifecycle actions: Cancel, Issue, MarkArrived, MarkDelivered, MarkInTransit
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/Cancel" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/Issue" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/MarkArrived" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/MarkDelivered" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/MarkInTransit" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API — Airway Bill Lines (sub-resource, CRUD + Count):**
```bash
# List lines
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count lines
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/Lines/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get line by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create line
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update line
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete line
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/AirwayBills/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Rail Waybills

**REST API only — Full CRUD + Count + lifecycle actions + Lines sub-resource:**
```bash
# List all rail waybills
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count rail waybills
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get rail waybill by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create rail waybill
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update rail waybill
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete rail waybill
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Lifecycle actions: Cancel, Issue, MarkDelivered, MarkInTransit
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>/Cancel" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>/Issue" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>/MarkDelivered" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>/MarkInTransit" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API — Rail Waybill Lines (sub-resource, CRUD + Count):**
```bash
# List lines
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count lines
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>/Lines/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get line by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create line
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update line
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete line
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/RailWaybills/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Road Waybills

**REST API only — Full CRUD + Count + lifecycle actions + Lines sub-resource:**
```bash
# List all road waybills
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count road waybills
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get road waybill by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create road waybill
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update road waybill
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete road waybill
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Lifecycle actions: Cancel, Dispute, Issue, MarkDelivered, MarkInTransit
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>/Cancel" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>/Dispute" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>/Issue" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>/MarkDelivered" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>/MarkInTransit" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API — Road Waybill Lines (sub-resource, CRUD + Count):**
```bash
# List lines
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count lines
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>/Lines/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get line by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create line
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update line
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete line
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/RoadWaybills/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Seaway Bills

**REST API only — Full CRUD + Count + lifecycle actions + Lines sub-resource:**
```bash
# List all seaway bills
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count seaway bills
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get seaway bill by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create seaway bill
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update seaway bill
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete seaway bill
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Lifecycle actions: Cancel, Issue, MarkArrived, MarkInTransit, Release
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>/Cancel" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>/Issue" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>/MarkArrived" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>/MarkInTransit" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>/Release" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API — Seaway Bill Lines (sub-resource, CRUD + Count):**
```bash
# List lines
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count lines
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>/Lines/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get line by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create line
curl -X POST "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update line
curl -X PUT "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete line
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/LogisticsService/SeawayBills/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Shipments

The ShipmentsService manages shipments, labels, bills of lading, shipping methods, couriers, regions, zones, policies, and classes. All resources support full CRUD + Count via REST.

### Shipments

```bash
# List shipments
absuite shipments list --TenantId $TENANT_ID
absuite shipments get --TenantId $TENANT_ID --ShipmentId <id>
absuite shipments create --TenantId $TENANT_ID --CreateShipmentDto '{...}'
absuite shipments update --TenantId $TENANT_ID --ShipmentId <id> --UpdateShipmentDto '{...}'
absuite shipments delete --TenantId $TENANT_ID --ShipmentId <id>
```

**REST API — Full CRUD + Count:**
```bash
# List all shipments
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count shipments
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get shipment by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create shipment
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update shipment
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete shipment
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ShipmentsService/Shipments/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Shipping Labels

**REST API — Full CRUD + Count:**
```bash
# List all shipping labels
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingLabels" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count shipping labels
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingLabels/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get shipping label by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingLabels/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create shipping label
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingLabels" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update shipping label
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingLabels/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete shipping label
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingLabels/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Bills of Lading

```bash
# List bills of lading
absuite shipments list bills-of-lading --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all bills of lading
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count bills of lading
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get bill of lading by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create bill of lading
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update bill of lading
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete bill of lading
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

**REST API — Bill of Lading Lines (sub-resource, CRUD + Count):**
```bash
# List lines
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count lines
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading/<id>/Lines/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get line by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create line
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading/<id>/Lines" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update line
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete line
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ShipmentsService/BillsOfLading/<id>/Lines/<lineId>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Shipping Methods

```bash
# List shipping methods
absuite shipments list methods --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all shipping methods
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingMethods" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count shipping methods
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingMethods/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get shipping method by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingMethods/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create shipping method
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingMethods" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update shipping method
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingMethods/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete shipping method
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingMethods/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Shipping Couriers

```bash
# List shipping couriers
absuite shipments list couriers --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all shipping couriers
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingCouriers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count shipping couriers
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingCouriers/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get shipping courier by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingCouriers/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create shipping courier
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingCouriers" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update shipping courier
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingCouriers/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete shipping courier
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingCouriers/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Shipping Regions

```bash
# List shipping regions
absuite shipments list regions --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all shipping regions
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingRegions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count shipping regions
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingRegions/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get shipping region by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingRegions/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create shipping region
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingRegions" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update shipping region
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingRegions/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete shipping region
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingRegions/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Shipping Zones

```bash
# List shipping zones
absuite shipments list zones --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all shipping zones
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingZones" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count shipping zones
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingZones/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get shipping zone by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingZones/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create shipping zone
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingZones" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update shipping zone
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingZones/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete shipping zone
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingZones/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Shipping Classes

```bash
# List shipping classes
absuite shipments list classes --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all shipping classes
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingClasses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count shipping classes
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingClasses/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get shipping class by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingClasses/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create shipping class
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingClasses" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update shipping class
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingClasses/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete shipping class
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ShippingClasses/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Item Shipping Policies

```bash
# List shipping policies
absuite shipments list policies --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all item shipping policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ItemShippingPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count item shipping policies
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ItemShippingPolicies/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get item shipping policy by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ItemShippingPolicies/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create item shipping policy
curl -X POST "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ItemShippingPolicies" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update item shipping policy
curl -X PUT "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ItemShippingPolicies/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete item shipping policy
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/ShipmentsService/ItemShippingPolicies/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

---

## Sales

The SalesService manages stores, point-of-sale terminals, loyalty programs, sales literature, and margins.

### Stores

```bash
# List stores and get store details
absuite sales list stores --TenantId $TENANT_ID
absuite sales get store --TenantId $TENANT_ID --StoreId <id>
```

**REST API — Full CRUD + Count:**
```bash
# List all stores
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/Stores" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count stores
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/Stores/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get store by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/Stores/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create store
curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/Stores" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update store
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SalesService/Stores/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete store
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SalesService/Stores/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Loyalty Programs

```bash
# List loyalty programs
absuite sales list loyalty-programs --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all loyalty programs
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/LoyaltyPrograms" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count loyalty programs
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/LoyaltyPrograms/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get loyalty program by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/LoyaltyPrograms/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create loyalty program
curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/LoyaltyPrograms" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update loyalty program
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SalesService/LoyaltyPrograms/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete loyalty program
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SalesService/LoyaltyPrograms/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Point of Sales

```bash
# List point of sales
absuite sales list point-of-sales --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count:**
```bash
# List all point of sales
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/PointOfSales" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count point of sales
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/PointOfSales/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get point of sale by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/PointOfSales/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create point of sale
curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/PointOfSales" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update point of sale
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SalesService/PointOfSales/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete point of sale
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SalesService/PointOfSales/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Sales Literatures

```bash
# List sales literatures
absuite sales list sales-literatures --TenantId $TENANT_ID
```

**REST API — Full CRUD + Count + Extended:**
```bash
# List all sales literatures
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/SalesLiteratures" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Count sales literatures
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/SalesLiteratures/Count" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get sales literature by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/SalesLiteratures/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Get extended sales literature (includes related data)
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/SalesLiteratures/<id>/Extended" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"

# Create sales literature
curl -X POST "$ABSUITE_HOST_URL/api/v2/SalesService/SalesLiteratures" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Update sales literature
curl -X PUT "$ABSUITE_HOST_URL/api/v2/SalesService/SalesLiteratures/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" -d '{...}'

# Delete sales literature
curl -X DELETE "$ABSUITE_HOST_URL/api/v2/SalesService/SalesLiteratures/<id>" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
```

### Margins

```bash
# Get margin details
absuite sales get quote --TenantId $TENANT_ID --QuoteId <quote-guid>
```

**REST API — Get margin details:**
```bash
# Get margin details by ID
curl -X GET "$ABSUITE_HOST_URL/api/v2/SalesService/Margins/<marginId>/Details" \
  -H "Authorization: Bearer $ABSUITE_ACCESS_TOKEN"
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
|--------|----------|-------------|
| GET | `/api/v2/InventoryService/Inventory/:stockItemId/Details` | Get inventory details for a stock item |

### LogisticsService — Warehouses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/Warehouses` | List all warehouses |
| GET | `/api/v2/LogisticsService/Warehouses/Count` | Count warehouses |
| GET | `/api/v2/LogisticsService/Warehouses/:id` | Get warehouse by ID |
| POST | `/api/v2/LogisticsService/Warehouses` | Create warehouse |
| PUT | `/api/v2/LogisticsService/Warehouses/:id` | Update warehouse |
| DELETE | `/api/v2/LogisticsService/Warehouses/:id` | Delete warehouse |

### LogisticsService — Ports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/Ports` | List all ports |
| GET | `/api/v2/LogisticsService/Ports/Count` | Count ports |
| GET | `/api/v2/LogisticsService/Ports/:id` | Get port by ID |
| POST | `/api/v2/LogisticsService/Ports` | Create port |
| PUT | `/api/v2/LogisticsService/Ports/:id` | Update port |
| DELETE | `/api/v2/LogisticsService/Ports/:id` | Delete port |

### LogisticsService — Vessels

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/Vessels` | List all vessels |
| GET | `/api/v2/LogisticsService/Vessels/Count` | Count vessels |
| GET | `/api/v2/LogisticsService/Vessels/:id` | Get vessel by ID |
| POST | `/api/v2/LogisticsService/Vessels` | Create vessel |
| PUT | `/api/v2/LogisticsService/Vessels/:id` | Update vessel |
| DELETE | `/api/v2/LogisticsService/Vessels/:id` | Delete vessel |

### LogisticsService — Trucks & Trips

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/Trucks` | List all trucks |
| GET | `/api/v2/LogisticsService/Trucks/Count` | Count trucks |
| GET | `/api/v2/LogisticsService/Trucks/:id` | Get truck by ID |
| POST | `/api/v2/LogisticsService/Trucks` | Create truck |
| PUT | `/api/v2/LogisticsService/Trucks/:id` | Update truck |
| DELETE | `/api/v2/LogisticsService/Trucks/:id` | Delete truck |
| GET | `/api/v2/LogisticsService/Trucks/:id/Trips` | List trips for a truck |
| GET | `/api/v2/LogisticsService/Trucks/:id/Trips/Count` | Count trips for a truck |
| GET | `/api/v2/LogisticsService/Trucks/:id/Trips/:tripId` | Get trip by ID |
| POST | `/api/v2/LogisticsService/Trucks/:id/Trips` | Create trip |
| PUT | `/api/v2/LogisticsService/Trucks/:id/Trips/:tripId` | Update trip |
| DELETE | `/api/v2/LogisticsService/Trucks/:id/Trips/:tripId` | Delete trip |
| POST | `/api/v2/LogisticsService/Trucks/:id/Trips/:tripId/Arrive` | Mark trip arrived |
| POST | `/api/v2/LogisticsService/Trucks/:id/Trips/:tripId/Cancel` | Cancel trip |
| POST | `/api/v2/LogisticsService/Trucks/:id/Trips/:tripId/Deliver` | Mark trip delivered |
| POST | `/api/v2/LogisticsService/Trucks/:id/Trips/:tripId/Depart` | Depart trip |
| POST | `/api/v2/LogisticsService/Trucks/:id/Trips/:tripId/Dispatch` | Dispatch trip |

### LogisticsService — Truck Drivers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/TruckDrivers` | List all truck drivers |
| GET | `/api/v2/LogisticsService/TruckDrivers/Count` | Count truck drivers |
| GET | `/api/v2/LogisticsService/TruckDrivers/:id` | Get truck driver by ID |
| POST | `/api/v2/LogisticsService/TruckDrivers` | Create truck driver |
| PUT | `/api/v2/LogisticsService/TruckDrivers/:id` | Update truck driver |
| DELETE | `/api/v2/LogisticsService/TruckDrivers/:id` | Delete truck driver |
| POST | `/api/v2/LogisticsService/TruckDrivers/:id/Activate` | Activate driver |
| POST | `/api/v2/LogisticsService/TruckDrivers/:id/Deactivate` | Deactivate driver |

### LogisticsService — Voyages & Port Calls

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/Voyages` | List all voyages |
| GET | `/api/v2/LogisticsService/Voyages/Count` | Count voyages |
| GET | `/api/v2/LogisticsService/Voyages/:id` | Get voyage by ID |
| POST | `/api/v2/LogisticsService/Voyages` | Create voyage |
| PUT | `/api/v2/LogisticsService/Voyages/:id` | Update voyage |
| DELETE | `/api/v2/LogisticsService/Voyages/:id` | Delete voyage |
| POST | `/api/v2/LogisticsService/Voyages/:id/Cancel` | Cancel voyage |
| POST | `/api/v2/LogisticsService/Voyages/:id/Complete` | Complete voyage |
| POST | `/api/v2/LogisticsService/Voyages/:id/Start` | Start voyage |
| GET | `/api/v2/LogisticsService/Voyages/:id/PortCalls` | List port calls |
| GET | `/api/v2/LogisticsService/Voyages/:id/PortCalls/Count` | Count port calls |
| GET | `/api/v2/LogisticsService/Voyages/:id/PortCalls/:pcId` | Get port call by ID |
| POST | `/api/v2/LogisticsService/Voyages/:id/PortCalls` | Create port call |
| PUT | `/api/v2/LogisticsService/Voyages/:id/PortCalls/:pcId` | Update port call |
| DELETE | `/api/v2/LogisticsService/Voyages/:id/PortCalls/:pcId` | Delete port call |

### LogisticsService — Proofs of Delivery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/ProofsOfDelivery` | List all proofs of delivery |
| GET | `/api/v2/LogisticsService/ProofsOfDelivery/Count` | Count proofs of delivery |
| GET | `/api/v2/LogisticsService/ProofsOfDelivery/:id` | Get proof by ID |
| POST | `/api/v2/LogisticsService/ProofsOfDelivery` | Create proof |
| PUT | `/api/v2/LogisticsService/ProofsOfDelivery/:id` | Update proof |
| DELETE | `/api/v2/LogisticsService/ProofsOfDelivery/:id` | Delete proof |
| POST | `/api/v2/LogisticsService/ProofsOfDelivery/:id/Dispute` | Dispute proof |
| POST | `/api/v2/LogisticsService/ProofsOfDelivery/:id/Reject` | Reject proof |
| POST | `/api/v2/LogisticsService/ProofsOfDelivery/:id/Sign` | Sign proof |
| GET | `/api/v2/LogisticsService/ProofsOfDelivery/:id/Lines` | List lines |
| GET | `/api/v2/LogisticsService/ProofsOfDelivery/:id/Lines/Count` | Count lines |
| GET | `/api/v2/LogisticsService/ProofsOfDelivery/:id/Lines/:lineId` | Get line by ID |
| POST | `/api/v2/LogisticsService/ProofsOfDelivery/:id/Lines` | Create line |
| PUT | `/api/v2/LogisticsService/ProofsOfDelivery/:id/Lines/:lineId` | Update line |
| DELETE | `/api/v2/LogisticsService/ProofsOfDelivery/:id/Lines/:lineId` | Delete line |
| GET | `/api/v2/LogisticsService/ProofsOfDelivery/:id/DeliveryNotes` | List attached notes |
| GET | `/api/v2/LogisticsService/ProofsOfDelivery/:id/DeliveryNotes/Count` | Count attached notes |
| POST | `/api/v2/LogisticsService/ProofsOfDelivery/:id/DeliveryNotes` | Attach delivery note |
| DELETE | `/api/v2/LogisticsService/ProofsOfDelivery/:id/DeliveryNotes/:noteId` | Detach delivery note |

### LogisticsService — Delivery Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/DeliveryNotes` | List all delivery notes |
| GET | `/api/v2/LogisticsService/DeliveryNotes/Count` | Count delivery notes |
| GET | `/api/v2/LogisticsService/DeliveryNotes/:id` | Get delivery note by ID |
| POST | `/api/v2/LogisticsService/DeliveryNotes` | Create delivery note |
| PUT | `/api/v2/LogisticsService/DeliveryNotes/:id` | Update delivery note |
| DELETE | `/api/v2/LogisticsService/DeliveryNotes/:id` | Delete delivery note |

### LogisticsService — Supplier Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/SupplierProfiles` | List all supplier profiles |
| GET | `/api/v2/LogisticsService/SupplierProfiles/Count` | Count supplier profiles |
| GET | `/api/v2/LogisticsService/SupplierProfiles/:id` | Get supplier profile by ID |
| POST | `/api/v2/LogisticsService/SupplierProfiles` | Create supplier profile |
| PUT | `/api/v2/LogisticsService/SupplierProfiles/:id` | Update supplier profile |
| DELETE | `/api/v2/LogisticsService/SupplierProfiles/:id` | Delete supplier profile |

### LogisticsService — Item Restocks & Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/ItemRestocks` | List all item restocks |
| GET | `/api/v2/LogisticsService/ItemRestocks/Count` | Count item restocks |
| GET | `/api/v2/LogisticsService/ItemRestocks/:id` | Get item restock by ID |
| POST | `/api/v2/LogisticsService/ItemRestocks` | Create item restock |
| PUT | `/api/v2/LogisticsService/ItemRestocks/:id` | Update item restock |
| DELETE | `/api/v2/LogisticsService/ItemRestocks/:id` | Delete item restock |
| GET | `/api/v2/LogisticsService/ItemRestocks/:id/Entries` | List entries |
| GET | `/api/v2/LogisticsService/ItemRestocks/:id/Entries/Count` | Count entries |
| GET | `/api/v2/LogisticsService/ItemRestocks/:id/Entries/:entryId` | Get entry by ID |
| POST | `/api/v2/LogisticsService/ItemRestocks/:id/Entries` | Create entry |
| PUT | `/api/v2/LogisticsService/ItemRestocks/:id/Entries/:entryId` | Update entry |
| DELETE | `/api/v2/LogisticsService/ItemRestocks/:id/Entries/:entryId` | Delete entry |

### LogisticsService — Item Retain Samples

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/ItemRetainSamples` | List all retain samples |
| GET | `/api/v2/LogisticsService/ItemRetainSamples/Count` | Count retain samples |
| GET | `/api/v2/LogisticsService/ItemRetainSamples/:id` | Get retain sample by ID |
| POST | `/api/v2/LogisticsService/ItemRetainSamples` | Create retain sample |
| PUT | `/api/v2/LogisticsService/ItemRetainSamples/:id` | Update retain sample |
| DELETE | `/api/v2/LogisticsService/ItemRetainSamples/:id` | Delete retain sample |

### LogisticsService — Item Packing Slips & Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/ItemPackingSlips` | List all packing slips |
| GET | `/api/v2/LogisticsService/ItemPackingSlips/Count` | Count packing slips |
| GET | `/api/v2/LogisticsService/ItemPackingSlips/:id` | Get packing slip by ID |
| POST | `/api/v2/LogisticsService/ItemPackingSlips` | Create packing slip |
| PUT | `/api/v2/LogisticsService/ItemPackingSlips/:id` | Update packing slip |
| DELETE | `/api/v2/LogisticsService/ItemPackingSlips/:id` | Delete packing slip |
| GET | `/api/v2/LogisticsService/ItemPackingSlips/:id/Entries` | List entries |
| GET | `/api/v2/LogisticsService/ItemPackingSlips/:id/Entries/Count` | Count entries |
| GET | `/api/v2/LogisticsService/ItemPackingSlips/:id/Entries/:entryId` | Get entry by ID |
| POST | `/api/v2/LogisticsService/ItemPackingSlips/:id/Entries` | Create entry |
| PUT | `/api/v2/LogisticsService/ItemPackingSlips/:id/Entries/:entryId` | Update entry |
| DELETE | `/api/v2/LogisticsService/ItemPackingSlips/:id/Entries/:entryId` | Delete entry |

### LogisticsService — Item Pick Lists & Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/ItemPickLists` | List all pick lists |
| GET | `/api/v2/LogisticsService/ItemPickLists/Count` | Count pick lists |
| GET | `/api/v2/LogisticsService/ItemPickLists/:id` | Get pick list by ID |
| POST | `/api/v2/LogisticsService/ItemPickLists` | Create pick list |
| PUT | `/api/v2/LogisticsService/ItemPickLists/:id` | Update pick list |
| DELETE | `/api/v2/LogisticsService/ItemPickLists/:id` | Delete pick list |
| GET | `/api/v2/LogisticsService/ItemPickLists/:id/Entries` | List entries |
| GET | `/api/v2/LogisticsService/ItemPickLists/:id/Entries/Count` | Count entries |
| GET | `/api/v2/LogisticsService/ItemPickLists/:id/Entries/:entryId` | Get entry by ID |
| POST | `/api/v2/LogisticsService/ItemPickLists/:id/Entries` | Create entry |
| PUT | `/api/v2/LogisticsService/ItemPickLists/:id/Entries/:entryId` | Update entry |
| DELETE | `/api/v2/LogisticsService/ItemPickLists/:id/Entries/:entryId` | Delete entry |

### LogisticsService — Airway Bills & Lines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/AirwayBills` | List all airway bills |
| GET | `/api/v2/LogisticsService/AirwayBills/Count` | Count airway bills |
| GET | `/api/v2/LogisticsService/AirwayBills/:id` | Get airway bill by ID |
| POST | `/api/v2/LogisticsService/AirwayBills` | Create airway bill |
| PUT | `/api/v2/LogisticsService/AirwayBills/:id` | Update airway bill |
| DELETE | `/api/v2/LogisticsService/AirwayBills/:id` | Delete airway bill |
| POST | `/api/v2/LogisticsService/AirwayBills/:id/Cancel` | Cancel airway bill |
| POST | `/api/v2/LogisticsService/AirwayBills/:id/Issue` | Issue airway bill |
| POST | `/api/v2/LogisticsService/AirwayBills/:id/MarkArrived` | Mark arrived |
| POST | `/api/v2/LogisticsService/AirwayBills/:id/MarkDelivered` | Mark delivered |
| POST | `/api/v2/LogisticsService/AirwayBills/:id/MarkInTransit` | Mark in transit |
| GET | `/api/v2/LogisticsService/AirwayBills/:id/Lines` | List lines |
| GET | `/api/v2/LogisticsService/AirwayBills/:id/Lines/Count` | Count lines |
| GET | `/api/v2/LogisticsService/AirwayBills/:id/Lines/:lineId` | Get line by ID |
| POST | `/api/v2/LogisticsService/AirwayBills/:id/Lines` | Create line |
| PUT | `/api/v2/LogisticsService/AirwayBills/:id/Lines/:lineId` | Update line |
| DELETE | `/api/v2/LogisticsService/AirwayBills/:id/Lines/:lineId` | Delete line |

### LogisticsService — Rail Waybills & Lines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/RailWaybills` | List all rail waybills |
| GET | `/api/v2/LogisticsService/RailWaybills/Count` | Count rail waybills |
| GET | `/api/v2/LogisticsService/RailWaybills/:id` | Get rail waybill by ID |
| POST | `/api/v2/LogisticsService/RailWaybills` | Create rail waybill |
| PUT | `/api/v2/LogisticsService/RailWaybills/:id` | Update rail waybill |
| DELETE | `/api/v2/LogisticsService/RailWaybills/:id` | Delete rail waybill |
| POST | `/api/v2/LogisticsService/RailWaybills/:id/Cancel` | Cancel rail waybill |
| POST | `/api/v2/LogisticsService/RailWaybills/:id/Issue` | Issue rail waybill |
| POST | `/api/v2/LogisticsService/RailWaybills/:id/MarkDelivered` | Mark delivered |
| POST | `/api/v2/LogisticsService/RailWaybills/:id/MarkInTransit` | Mark in transit |
| GET | `/api/v2/LogisticsService/RailWaybills/:id/Lines` | List lines |
| GET | `/api/v2/LogisticsService/RailWaybills/:id/Lines/Count` | Count lines |
| GET | `/api/v2/LogisticsService/RailWaybills/:id/Lines/:lineId` | Get line by ID |
| POST | `/api/v2/LogisticsService/RailWaybills/:id/Lines` | Create line |
| PUT | `/api/v2/LogisticsService/RailWaybills/:id/Lines/:lineId` | Update line |
| DELETE | `/api/v2/LogisticsService/RailWaybills/:id/Lines/:lineId` | Delete line |

### LogisticsService — Road Waybills & Lines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/RoadWaybills` | List all road waybills |
| GET | `/api/v2/LogisticsService/RoadWaybills/Count` | Count road waybills |
| GET | `/api/v2/LogisticsService/RoadWaybills/:id` | Get road waybill by ID |
| POST | `/api/v2/LogisticsService/RoadWaybills` | Create road waybill |
| PUT | `/api/v2/LogisticsService/RoadWaybills/:id` | Update road waybill |
| DELETE | `/api/v2/LogisticsService/RoadWaybills/:id` | Delete road waybill |
| POST | `/api/v2/LogisticsService/RoadWaybills/:id/Cancel` | Cancel road waybill |
| POST | `/api/v2/LogisticsService/RoadWaybills/:id/Dispute` | Dispute road waybill |
| POST | `/api/v2/LogisticsService/RoadWaybills/:id/Issue` | Issue road waybill |
| POST | `/api/v2/LogisticsService/RoadWaybills/:id/MarkDelivered` | Mark delivered |
| POST | `/api/v2/LogisticsService/RoadWaybills/:id/MarkInTransit` | Mark in transit |
| GET | `/api/v2/LogisticsService/RoadWaybills/:id/Lines` | List lines |
| GET | `/api/v2/LogisticsService/RoadWaybills/:id/Lines/Count` | Count lines |
| GET | `/api/v2/LogisticsService/RoadWaybills/:id/Lines/:lineId` | Get line by ID |
| POST | `/api/v2/LogisticsService/RoadWaybills/:id/Lines` | Create line |
| PUT | `/api/v2/LogisticsService/RoadWaybills/:id/Lines/:lineId` | Update line |
| DELETE | `/api/v2/LogisticsService/RoadWaybills/:id/Lines/:lineId` | Delete line |

### LogisticsService — Seaway Bills & Lines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/LogisticsService/SeawayBills` | List all seaway bills |
| GET | `/api/v2/LogisticsService/SeawayBills/Count` | Count seaway bills |
| GET | `/api/v2/LogisticsService/SeawayBills/:id` | Get seaway bill by ID |
| POST | `/api/v2/LogisticsService/SeawayBills` | Create seaway bill |
| PUT | `/api/v2/LogisticsService/SeawayBills/:id` | Update seaway bill |
| DELETE | `/api/v2/LogisticsService/SeawayBills/:id` | Delete seaway bill |
| POST | `/api/v2/LogisticsService/SeawayBills/:id/Cancel` | Cancel seaway bill |
| POST | `/api/v2/LogisticsService/SeawayBills/:id/Issue` | Issue seaway bill |
| POST | `/api/v2/LogisticsService/SeawayBills/:id/MarkArrived` | Mark arrived |
| POST | `/api/v2/LogisticsService/SeawayBills/:id/MarkInTransit` | Mark in transit |
| POST | `/api/v2/LogisticsService/SeawayBills/:id/Release` | Release seaway bill |
| GET | `/api/v2/LogisticsService/SeawayBills/:id/Lines` | List lines |
| GET | `/api/v2/LogisticsService/SeawayBills/:id/Lines/Count` | Count lines |
| GET | `/api/v2/LogisticsService/SeawayBills/:id/Lines/:lineId` | Get line by ID |
| POST | `/api/v2/LogisticsService/SeawayBills/:id/Lines` | Create line |
| PUT | `/api/v2/LogisticsService/SeawayBills/:id/Lines/:lineId` | Update line |
| DELETE | `/api/v2/LogisticsService/SeawayBills/:id/Lines/:lineId` | Delete line |

### ShipmentsService — Shipments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/ShipmentsService/Shipments` | List all shipments |
| GET | `/api/v2/ShipmentsService/Shipments/Count` | Count shipments |
| GET | `/api/v2/ShipmentsService/Shipments/:id` | Get shipment by ID |
| POST | `/api/v2/ShipmentsService/Shipments` | Create shipment |
| PUT | `/api/v2/ShipmentsService/Shipments/:id` | Update shipment |
| DELETE | `/api/v2/ShipmentsService/Shipments/:id` | Delete shipment |

### ShipmentsService — Shipping Labels

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/ShipmentsService/ShippingLabels` | List all shipping labels |
| GET | `/api/v2/ShipmentsService/ShippingLabels/Count` | Count shipping labels |
| GET | `/api/v2/ShipmentsService/ShippingLabels/:id` | Get shipping label by ID |
| POST | `/api/v2/ShipmentsService/ShippingLabels` | Create shipping label |
| PUT | `/api/v2/ShipmentsService/ShippingLabels/:id` | Update shipping label |
| DELETE | `/api/v2/ShipmentsService/ShippingLabels/:id` | Delete shipping label |

### ShipmentsService — Bills of Lading & Lines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/ShipmentsService/BillsOfLading` | List all bills of lading |
| GET | `/api/v2/ShipmentsService/BillsOfLading/Count` | Count bills of lading |
| GET | `/api/v2/ShipmentsService/BillsOfLading/:id` | Get bill of lading by ID |
| POST | `/api/v2/ShipmentsService/BillsOfLading` | Create bill of lading |
| PUT | `/api/v2/ShipmentsService/BillsOfLading/:id` | Update bill of lading |
| DELETE | `/api/v2/ShipmentsService/BillsOfLading/:id` | Delete bill of lading |
| GET | `/api/v2/ShipmentsService/BillsOfLading/:id/Lines` | List lines |
| GET | `/api/v2/ShipmentsService/BillsOfLading/:id/Lines/Count` | Count lines |
| GET | `/api/v2/ShipmentsService/BillsOfLading/:id/Lines/:lineId` | Get line by ID |
| POST | `/api/v2/ShipmentsService/BillsOfLading/:id/Lines` | Create line |
| PUT | `/api/v2/ShipmentsService/BillsOfLading/:id/Lines/:lineId` | Update line |
| DELETE | `/api/v2/ShipmentsService/BillsOfLading/:id/Lines/:lineId` | Delete line |

### ShipmentsService — Shipping Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/ShipmentsService/ShippingMethods` | List all shipping methods |
| GET | `/api/v2/ShipmentsService/ShippingMethods/Count` | Count shipping methods |
| GET | `/api/v2/ShipmentsService/ShippingMethods/:id` | Get shipping method by ID |
| POST | `/api/v2/ShipmentsService/ShippingMethods` | Create shipping method |
| PUT | `/api/v2/ShipmentsService/ShippingMethods/:id` | Update shipping method |
| DELETE | `/api/v2/ShipmentsService/ShippingMethods/:id` | Delete shipping method |

### ShipmentsService — Shipping Couriers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/ShipmentsService/ShippingCouriers` | List all shipping couriers |
| GET | `/api/v2/ShipmentsService/ShippingCouriers/Count` | Count shipping couriers |
| GET | `/api/v2/ShipmentsService/ShippingCouriers/:id` | Get shipping courier by ID |
| POST | `/api/v2/ShipmentsService/ShippingCouriers` | Create shipping courier |
| PUT | `/api/v2/ShipmentsService/ShippingCouriers/:id` | Update shipping courier |
| DELETE | `/api/v2/ShipmentsService/ShippingCouriers/:id` | Delete shipping courier |

### ShipmentsService — Shipping Regions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/ShipmentsService/ShippingRegions` | List all shipping regions |
| GET | `/api/v2/ShipmentsService/ShippingRegions/Count` | Count shipping regions |
| GET | `/api/v2/ShipmentsService/ShippingRegions/:id` | Get shipping region by ID |
| POST | `/api/v2/ShipmentsService/ShippingRegions` | Create shipping region |
| PUT | `/api/v2/ShipmentsService/ShippingRegions/:id` | Update shipping region |
| DELETE | `/api/v2/ShipmentsService/ShippingRegions/:id` | Delete shipping region |

### ShipmentsService — Shipping Zones

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/ShipmentsService/ShippingZones` | List all shipping zones |
| GET | `/api/v2/ShipmentsService/ShippingZones/Count` | Count shipping zones |
| GET | `/api/v2/ShipmentsService/ShippingZones/:id` | Get shipping zone by ID |
| POST | `/api/v2/ShipmentsService/ShippingZones` | Create shipping zone |
| PUT | `/api/v2/ShipmentsService/ShippingZones/:id` | Update shipping zone |
| DELETE | `/api/v2/ShipmentsService/ShippingZones/:id` | Delete shipping zone |

### ShipmentsService — Shipping Classes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/ShipmentsService/ShippingClasses` | List all shipping classes |
| GET | `/api/v2/ShipmentsService/ShippingClasses/Count` | Count shipping classes |
| GET | `/api/v2/ShipmentsService/ShippingClasses/:id` | Get shipping class by ID |
| POST | `/api/v2/ShipmentsService/ShippingClasses` | Create shipping class |
| PUT | `/api/v2/ShipmentsService/ShippingClasses/:id` | Update shipping class |
| DELETE | `/api/v2/ShipmentsService/ShippingClasses/:id` | Delete shipping class |

### ShipmentsService — Item Shipping Policies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/ShipmentsService/ItemShippingPolicies` | List all shipping policies |
| GET | `/api/v2/ShipmentsService/ItemShippingPolicies/Count` | Count shipping policies |
| GET | `/api/v2/ShipmentsService/ItemShippingPolicies/:id` | Get shipping policy by ID |
| POST | `/api/v2/ShipmentsService/ItemShippingPolicies` | Create shipping policy |
| PUT | `/api/v2/ShipmentsService/ItemShippingPolicies/:id` | Update shipping policy |
| DELETE | `/api/v2/ShipmentsService/ItemShippingPolicies/:id` | Delete shipping policy |

### SalesService — Stores

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/SalesService/Stores` | List all stores |
| GET | `/api/v2/SalesService/Stores/Count` | Count stores |
| GET | `/api/v2/SalesService/Stores/:id` | Get store by ID |
| POST | `/api/v2/SalesService/Stores` | Create store |
| PUT | `/api/v2/SalesService/Stores/:id` | Update store |
| DELETE | `/api/v2/SalesService/Stores/:id` | Delete store |

### SalesService — Loyalty Programs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/SalesService/LoyaltyPrograms` | List all loyalty programs |
| GET | `/api/v2/SalesService/LoyaltyPrograms/Count` | Count loyalty programs |
| GET | `/api/v2/SalesService/LoyaltyPrograms/:id` | Get loyalty program by ID |
| POST | `/api/v2/SalesService/LoyaltyPrograms` | Create loyalty program |
| PUT | `/api/v2/SalesService/LoyaltyPrograms/:id` | Update loyalty program |
| DELETE | `/api/v2/SalesService/LoyaltyPrograms/:id` | Delete loyalty program |

### SalesService — Point of Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/SalesService/PointOfSales` | List all point of sales |
| GET | `/api/v2/SalesService/PointOfSales/Count` | Count point of sales |
| GET | `/api/v2/SalesService/PointOfSales/:id` | Get point of sale by ID |
| POST | `/api/v2/SalesService/PointOfSales` | Create point of sale |
| PUT | `/api/v2/SalesService/PointOfSales/:id` | Update point of sale |
| DELETE | `/api/v2/SalesService/PointOfSales/:id` | Delete point of sale |

### SalesService — Sales Literatures

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/SalesService/SalesLiteratures` | List all sales literatures |
| GET | `/api/v2/SalesService/SalesLiteratures/Count` | Count sales literatures |
| GET | `/api/v2/SalesService/SalesLiteratures/:id` | Get sales literature by ID |
| GET | `/api/v2/SalesService/SalesLiteratures/:id/Extended` | Get extended sales literature |
| POST | `/api/v2/SalesService/SalesLiteratures` | Create sales literature |
| PUT | `/api/v2/SalesService/SalesLiteratures/:id` | Update sales literature |
| DELETE | `/api/v2/SalesService/SalesLiteratures/:id` | Delete sales literature |

### SalesService — Margins

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/SalesService/Margins/:marginId/Details` | Get margin details |

## Critical Rules

- These services have limited CLI coverage — check `list-commands` periodically for new additions.
- Use the REST API for resources not yet available through the CLI.
- Use dedicated services for full functionality (e.g., `absuite quotes` for quote management, `absuite catalog` for product catalog).
- All REST endpoints require a valid bearer token (see [REST API Authentication](#rest-api-authentication)).
- All list endpoints support OData query parameters (`$filter`, `$orderby`, `$top`, `$skip`) for filtering and pagination.
