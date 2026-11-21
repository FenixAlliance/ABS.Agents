---
apiVersion: abs.fenixalliance.com/v1alpha1
kind: Skill
name: absuite-misc-cli
key: fenixalliance.absuite.misc-cli
version: 1.1.0
description: >
  Drive the Alliance Business Suite (ABS) Misc area with the absuite CLI: 173 commands (87 read, 86
  write) under `absuite logistics`, `absuite sales`, `absuite shipments`, each generated from the
  platform's ServiceClients and checked against `absuite commands -o json`. For routes the CLI does
  not cover, use the absuite-misc REST skill.
---

# Alliance Business Suite — Misc Skill (CLI)

Generated from the absuite CLI at Platform 9b72a00a47 (`absuite commands -o json`). The commands, arguments and options below are the CLI's own; re-run `absuite commands -o json` before relying on one.

> **Coverage:** the `absuite-misc` REST skill documents 29 routes; 2 of them have no CLI command (a write the CLI keeps to Studio, a call that is not workspace-scoped, or a field shape it cannot take yet). Use the REST skill for those.

## Before you start

- Install: `npm install -g @fenixalliance/absuite` (a self-contained binary per platform). `absuite --version` prints the version.
- Sign in: `absuite login` (a one-time code in your browser, the default). `absuite me` shows who you are; `absuite account show` shows the profile, server and workspace.
- Workspace: `absuite account list` lists yours; `absuite account set --tenant <id|name>` saves one. `--tenant <id>` or `ABS_TENANT` picks one for a single command.
- Agents on their computer: the run token comes from `ABS_TOKEN` or `ABS_TOKEN_FILE` (one of them, never both), used only with `--url` or `ABS_URL`, and only over https:// or to a server on the same computer. The token says who the agent is; the workspace's roles decide what it may do.
- Scripts and agents: pass `--no-input` (it is also on when stdin is not a terminal, or CI or ABS_NO_TUI is set). Anything that needs input then fails with exit 2 and names the flag to pass.
- Output: `-o table|json|jsonc|tsv|yaml|none`; `--query "<JMESPath>"` filters the result before it is printed.
- `absuite commands -o json` lists every command with its options and whether it only reads. Check it before you rely on a command; `absuite <command> --help` shows one.
- Full sign-in, output, exit-code and run-token rules: the `absuite-cli` skill. Anything not listed here: the `absuite-misc` REST skill.

## Commands

173 commands, from `absuite commands -o json`. "Reads" commands never change data. Writes take field flags or `--json`/`--file` with the same fields, and `--dry-run` prints the request without sending it. Deletes ask first unless `--yes` (with `--no-input` and no `--yes`, a delete fails with exit 2).

### Airway Bills (`absuite logistics airway-bills`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite logistics airway-bills list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's airway-bills. `GET /api/v2/LogisticsService/AirwayBills` |
| `absuite logistics airway-bills count` | Reads |  |  | Count the workspace's airway-bills. `GET /api/v2/LogisticsService/AirwayBills/Count` |
| `absuite logistics airway-bills get` | Reads | `<id>` | `--columns` | Show one of the workspace's airway-bills. `GET /api/v2/LogisticsService/AirwayBills/{billId}` |
| `absuite logistics airway-bills create` | Writes |  | `--document-number`, `--airway-bill-type`, `--master-awb-number`, `--shipper-contact-id`, `--consignee-contact-id`, `--notify-party-contact-id`, `--carrier-id`, `--airline-code`, `--flight-number`, `--airport-of-departure-code`, `--airport-of-destination-code`, `--departure-date`, `--arrival-date`, `--date-issued`, `--freight-terms`, `--freight-amount`, `--freight-currency-id`, `--chargeable-weight-kg`, `--total-gross-weight-kg`, `--total-packages`, `--total-volume-m3`, `--declared-value-for-carriage`, `--declared-value-for-customs`, `--insurance-amount`, `--special-handling-codes`, `--special-instructions`, `--remarks`, `--shipment-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's airway-bills. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/AirwayBills` |
| `absuite logistics airway-bills update` | Writes | `<id>` | `--document-number`, `--airway-bill-type`, `--master-awb-number`, `--shipper-contact-id`, `--consignee-contact-id`, `--notify-party-contact-id`, `--carrier-id`, `--airline-code`, `--flight-number`, `--airport-of-departure-code`, `--airport-of-destination-code`, `--departure-date`, `--arrival-date`, `--date-issued`, `--freight-terms`, `--freight-amount`, `--freight-currency-id`, `--chargeable-weight-kg`, `--total-gross-weight-kg`, `--total-packages`, `--total-volume-m3`, `--declared-value-for-carriage`, `--declared-value-for-customs`, `--insurance-amount`, `--special-handling-codes`, `--special-instructions`, `--remarks`, `--shipment-id`; `--json` `--file` `--dry-run` | Change one of the workspace's airway-bills: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LogisticsService/AirwayBills/{billId}` |
| `absuite logistics airway-bills delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's airway-bills; it asks first unless --yes. `DELETE /api/v2/LogisticsService/AirwayBills/{billId}` |
| `absuite logistics airway-bills lines list` | Reads |  | `--bill-id` (required); `--top` `--skip` `--columns` | List the workspace's airway-bills lines. `GET /api/v2/LogisticsService/AirwayBills/{billId}/Lines` |
| `absuite logistics airway-bills lines count` | Reads |  | `--bill-id` (required) | Count the workspace's airway-bills lines. `GET /api/v2/LogisticsService/AirwayBills/{billId}/Lines/Count` |
| `absuite logistics airway-bills lines create` | Writes |  | `--bill-id` (required), `--description`, `--quantity`, `--gross-weight-kg`, `--volume-m3`, `--package-type`, `--length-cm`, `--width-cm`, `--height-cm`, `--hs-code`, `--marks-and-numbers`, `--declared-value`, `--declared-value-currency-id`, `--seal-number`, `--container-number`, `--chargeable-weight-kg`, `--iata-rate-class`, `--dangerous-goods-class`, `--un-hazmat-number`, `--wagon-number`; `--json` `--file` `--dry-run` | Create a record in the workspace's airway-bills lines. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/AirwayBills/{billId}/Lines` |
| `absuite logistics airway-bills lines delete` | Writes | `<id>` | `--bill-id` (required); `--yes` `--dry-run` | Delete one of the workspace's airway-bills lines; it asks first unless --yes. `DELETE /api/v2/LogisticsService/AirwayBills/{billId}/Lines/{lineId}` |

### Item Restocks (`absuite logistics item-restocks`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite logistics item-restocks list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-restocks. `GET /api/v2/LogisticsService/ItemRestocks` |
| `absuite logistics item-restocks count` | Reads |  |  | Count the workspace's item-restocks. `GET /api/v2/LogisticsService/ItemRestocks/Count` |
| `absuite logistics item-restocks get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-restocks. `GET /api/v2/LogisticsService/ItemRestocks/{restockId}` |
| `absuite logistics item-restocks create` | Writes |  | `--name`, `--description`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-restocks. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/ItemRestocks` |
| `absuite logistics item-restocks update` | Writes | `<id>` | `--name`, `--description`; `--json` `--file` `--dry-run` | Change one of the workspace's item-restocks: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LogisticsService/ItemRestocks/{restockId}` |
| `absuite logistics item-restocks delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-restocks; it asks first unless --yes. `DELETE /api/v2/LogisticsService/ItemRestocks/{restockId}` |
| `absuite logistics item-restocks entries list` | Reads |  | `--item-restock-id` (required); `--top` `--skip` `--columns` | List the workspace's item-restocks entries. `GET /api/v2/LogisticsService/ItemRestocks/{itemRestockId}/Entries` |
| `absuite logistics item-restocks entries count` | Reads |  | `--item-restock-id` (required) | Count the workspace's item-restocks entries. `GET /api/v2/LogisticsService/ItemRestocks/{itemRestockId}/Entries/Count` |
| `absuite logistics item-restocks entries get` | Reads | `<id>` | `--item-restock-id` (required); `--columns` | Show one of the workspace's item-restocks entries. `GET /api/v2/LogisticsService/ItemRestocks/{itemRestockId}/Entries/{entryId}` |
| `absuite logistics item-restocks entries create` | Writes |  | `--item-restock-id` (required), `--item-id`, `--warehouse-id`, `--quantity`, `--order-item-record-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-restocks entries. Only in --json: item-restock-id. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/ItemRestocks/{itemRestockId}/Entries` |
| `absuite logistics item-restocks entries update` | Writes | `<id>` | `--item-restock-id` (required), `--item-id`, `--warehouse-id`, `--quantity`, `--order-item-record-id`; `--json` `--file` `--dry-run` | Change one of the workspace's item-restocks entries: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LogisticsService/ItemRestocks/{itemRestockId}/Entries/{entryId}` |
| `absuite logistics item-restocks entries delete` | Writes | `<id>` | `--item-restock-id` (required); `--yes` `--dry-run` | Delete one of the workspace's item-restocks entries; it asks first unless --yes. `DELETE /api/v2/LogisticsService/ItemRestocks/{itemRestockId}/Entries/{entryId}` |

### Item Retain Samples (`absuite logistics item-retain-samples`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite logistics item-retain-samples list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-retain-samples. `GET /api/v2/LogisticsService/ItemRetainSamples` |
| `absuite logistics item-retain-samples count` | Reads |  |  | Count the workspace's item-retain-samples. `GET /api/v2/LogisticsService/ItemRetainSamples/Count` |
| `absuite logistics item-retain-samples get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-retain-samples. `GET /api/v2/LogisticsService/ItemRetainSamples/{sampleId}` |
| `absuite logistics item-retain-samples create` | Writes |  | `--warehouse-id`, `--item-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-retain-samples. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/ItemRetainSamples` |
| `absuite logistics item-retain-samples update` | Writes | `<id>` | `--warehouse-id`, `--item-id`; `--json` `--file` `--dry-run` | Change one of the workspace's item-retain-samples: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LogisticsService/ItemRetainSamples/{sampleId}` |
| `absuite logistics item-retain-samples delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-retain-samples; it asks first unless --yes. `DELETE /api/v2/LogisticsService/ItemRetainSamples/{sampleId}` |

### Ports (`absuite logistics ports`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite logistics ports list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's ports. `GET /api/v2/LogisticsService/Ports` |
| `absuite logistics ports count` | Reads |  |  | Count the workspace's ports. `GET /api/v2/LogisticsService/Ports/Count` |
| `absuite logistics ports get` | Reads | `<id>` | `--columns` | Show one of the workspace's ports. `GET /api/v2/LogisticsService/Ports/{portId}` |
| `absuite logistics ports create` | Writes |  | `--title`, `--company`, `--email`, `--address1`, `--address2`, `--address3`, `--unit`, `--custom-city`, `--custom-state`, `--postal-code`, `--phone`, `--fax`, `--longitude`, `--latitude`, `--country-id`, `--country-state-id`, `--city-id`, `--un-locode`, `--iata-code`, `--port-type`, `--port-authority`, `--has-customs-facility`, `--is-free-tradezone`, `--is-active`, `--parent-port-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's ports. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/Ports` |
| `absuite logistics ports update` | Writes | `<id>` | `--title`, `--company`, `--email`, `--address1`, `--address2`, `--address3`, `--unit`, `--custom-city`, `--custom-state`, `--postal-code`, `--phone`, `--fax`, `--longitude`, `--latitude`, `--country-id`, `--country-state-id`, `--city-id`, `--un-locode`, `--iata-code`, `--port-type`, `--port-authority`, `--has-customs-facility`, `--is-free-tradezone`, `--is-active`, `--parent-port-id`; `--json` `--file` `--dry-run` | Change one of the workspace's ports: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LogisticsService/Ports/{portId}` |
| `absuite logistics ports delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's ports; it asks first unless --yes. `DELETE /api/v2/LogisticsService/Ports/{portId}` |

### Proofs Of Delivery (`absuite logistics proofs-of-delivery`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite logistics proofs-of-delivery list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's proofs-of-delivery. `GET /api/v2/LogisticsService/ProofsOfDelivery` |
| `absuite logistics proofs-of-delivery count` | Reads |  |  | Count the workspace's proofs-of-delivery. `GET /api/v2/LogisticsService/ProofsOfDelivery/Count` |
| `absuite logistics proofs-of-delivery get` | Reads | `<id>` | `--columns` | Show one of the workspace's proofs-of-delivery. `GET /api/v2/LogisticsService/ProofsOfDelivery/{podId}` |
| `absuite logistics proofs-of-delivery create` | Writes |  | `--document-number`, `--shipment-id`, `--bill-of-lading-id`, `--seaway-bill-id`, `--airway-bill-id`, `--road-waybill-id`, `--rail-waybill-id`, `--truck-trip-id`, `--recipient-name`, `--recipient-company-contact-id`, `--delivery-address`, `--delivery-date`, `--delivery-time`, `--overall-condition`, `--remarks`; `--json` `--file` `--dry-run` | Create a record in the workspace's proofs-of-delivery. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/ProofsOfDelivery` |
| `absuite logistics proofs-of-delivery update` | Writes | `<id>` | `--document-number`, `--shipment-id`, `--bill-of-lading-id`, `--seaway-bill-id`, `--airway-bill-id`, `--road-waybill-id`, `--rail-waybill-id`, `--truck-trip-id`, `--recipient-name`, `--recipient-company-contact-id`, `--delivery-address`, `--delivery-date`, `--delivery-time`, `--overall-condition`, `--total-quantity-delivered`, `--total-quantity-rejected`, `--remarks`, `--photo-evidence-uri`; `--json` `--file` `--dry-run` | Change one of the workspace's proofs-of-delivery: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LogisticsService/ProofsOfDelivery/{podId}` |
| `absuite logistics proofs-of-delivery delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's proofs-of-delivery; it asks first unless --yes. `DELETE /api/v2/LogisticsService/ProofsOfDelivery/{podId}` |
| `absuite logistics proofs-of-delivery delivery-notes list` | Reads |  | `--pod-id` (required); `--columns` | List the workspace's proofs-of-delivery delivery-notes. `GET /api/v2/LogisticsService/ProofsOfDelivery/{podId}/DeliveryNotes` |
| `absuite logistics proofs-of-delivery lines list` | Reads |  | `--pod-id` (required); `--top` `--skip` `--columns` | List the workspace's proofs-of-delivery lines. `GET /api/v2/LogisticsService/ProofsOfDelivery/{podId}/Lines` |
| `absuite logistics proofs-of-delivery delivery-notes count` | Reads |  | `--pod-id` (required) | Count the workspace's proofs-of-delivery delivery-notes. `GET /api/v2/LogisticsService/ProofsOfDelivery/{podId}/DeliveryNotes/Count` |
| `absuite logistics proofs-of-delivery lines count` | Reads |  | `--pod-id` (required) | Count the workspace's proofs-of-delivery lines. `GET /api/v2/LogisticsService/ProofsOfDelivery/{podId}/Lines/Count` |
| `absuite logistics proofs-of-delivery lines create` | Writes |  | `--pod-id` (required), `--description`, `--quantity-expected`, `--quantity-received`, `--quantity-rejected`, `--condition`, `--remarks`, `--hs-code`; `--json` `--file` `--dry-run` | Create a record in the workspace's proofs-of-delivery lines. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/ProofsOfDelivery/{podId}/Lines` |
| `absuite logistics proofs-of-delivery delivery-notes delete` | Writes | `<id>` | `--pod-id` (required); `--yes` `--dry-run` | Delete one of the workspace's proofs-of-delivery delivery-notes; it asks first unless --yes. `DELETE /api/v2/LogisticsService/ProofsOfDelivery/{podId}/DeliveryNotes/{noteId}` |
| `absuite logistics proofs-of-delivery lines delete` | Writes | `<id>` | `--pod-id` (required); `--yes` `--dry-run` | Delete one of the workspace's proofs-of-delivery lines; it asks first unless --yes. `DELETE /api/v2/LogisticsService/ProofsOfDelivery/{podId}/Lines/{lineId}` |

### Seaway Bills (`absuite logistics seaway-bills`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite logistics seaway-bills list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's seaway-bills. `GET /api/v2/LogisticsService/SeawayBills` |
| `absuite logistics seaway-bills count` | Reads |  |  | Count the workspace's seaway-bills. `GET /api/v2/LogisticsService/SeawayBills/Count` |
| `absuite logistics seaway-bills get` | Reads | `<id>` | `--columns` | Show one of the workspace's seaway-bills. `GET /api/v2/LogisticsService/SeawayBills/{billId}` |
| `absuite logistics seaway-bills create` | Writes |  | `--document-number`, `--shipper-contact-id`, `--consignee-contact-id`, `--notify-party-contact-id`, `--carrier-id`, `--vessel-id`, `--voyage-id`, `--port-of-loading-id`, `--port-of-discharge-id`, `--place-of-receipt`, `--place-of-delivery`, `--date-issued`, `--date-shipped`, `--freight-terms`, `--freight-amount`, `--freight-currency-id`, `--total-weight`, `--total-packages`, `--special-instructions`, `--remarks`, `--shipment-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's seaway-bills. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/SeawayBills` |
| `absuite logistics seaway-bills update` | Writes | `<id>` | `--document-number`, `--shipper-contact-id`, `--consignee-contact-id`, `--notify-party-contact-id`, `--carrier-id`, `--vessel-id`, `--voyage-id`, `--port-of-loading-id`, `--port-of-discharge-id`, `--place-of-receipt`, `--place-of-delivery`, `--date-issued`, `--date-shipped`, `--freight-terms`, `--freight-amount`, `--freight-currency-id`, `--total-weight`, `--total-packages`, `--special-instructions`, `--remarks`, `--shipment-id`; `--json` `--file` `--dry-run` | Change one of the workspace's seaway-bills: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LogisticsService/SeawayBills/{billId}` |
| `absuite logistics seaway-bills delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's seaway-bills; it asks first unless --yes. `DELETE /api/v2/LogisticsService/SeawayBills/{billId}` |
| `absuite logistics seaway-bills lines list` | Reads |  | `--bill-id` (required); `--top` `--skip` `--columns` | List the workspace's seaway-bills lines. `GET /api/v2/LogisticsService/SeawayBills/{billId}/Lines` |
| `absuite logistics seaway-bills lines count` | Reads |  | `--bill-id` (required) | Count the workspace's seaway-bills lines. `GET /api/v2/LogisticsService/SeawayBills/{billId}/Lines/Count` |
| `absuite logistics seaway-bills lines create` | Writes |  | `--bill-id` (required), `--description`, `--quantity`, `--gross-weight-kg`, `--volume-m3`, `--package-type`, `--length-cm`, `--width-cm`, `--height-cm`, `--hs-code`, `--marks-and-numbers`, `--declared-value`, `--declared-value-currency-id`, `--seal-number`, `--container-number`, `--chargeable-weight-kg`, `--iata-rate-class`, `--dangerous-goods-class`, `--un-hazmat-number`, `--wagon-number`; `--json` `--file` `--dry-run` | Create a record in the workspace's seaway-bills lines. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/SeawayBills/{billId}/Lines` |
| `absuite logistics seaway-bills lines delete` | Writes | `<id>` | `--bill-id` (required); `--yes` `--dry-run` | Delete one of the workspace's seaway-bills lines; it asks first unless --yes. `DELETE /api/v2/LogisticsService/SeawayBills/{billId}/Lines/{lineId}` |

### Truck Drivers (`absuite logistics truck-drivers`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite logistics truck-drivers list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's truck-drivers. `GET /api/v2/LogisticsService/TruckDrivers` |
| `absuite logistics truck-drivers count` | Reads |  |  | Count the workspace's truck-drivers. `GET /api/v2/LogisticsService/TruckDrivers/Count` |
| `absuite logistics truck-drivers get` | Reads | `<id>` | `--columns` | Show one of the workspace's truck-drivers. `GET /api/v2/LogisticsService/TruckDrivers/{driverId}` |
| `absuite logistics truck-drivers create` | Writes |  | `--name`, `--license-number`, `--license-class`, `--phone`, `--email`, `--contact-id`, `--shipping-courier-id`, `--adr-certified`, `--license-expiry-date`, `--medical-exam-expiry-date`, `--national-id-number`, `--notes`; `--json` `--file` `--dry-run` | Create a record in the workspace's truck-drivers. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/TruckDrivers` |
| `absuite logistics truck-drivers update` | Writes | `<id>` | `--name`, `--license-number`, `--license-class`, `--phone`, `--email`, `--contact-id`, `--shipping-courier-id`, `--adr-certified`, `--license-expiry-date`, `--medical-exam-expiry-date`, `--national-id-number`, `--notes`; `--json` `--file` `--dry-run` | Change one of the workspace's truck-drivers: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LogisticsService/TruckDrivers/{driverId}` |
| `absuite logistics truck-drivers delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's truck-drivers; it asks first unless --yes. `DELETE /api/v2/LogisticsService/TruckDrivers/{driverId}` |

### Trucks (`absuite logistics trucks`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite logistics trucks list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's trucks. `GET /api/v2/LogisticsService/Trucks` |
| `absuite logistics trucks count` | Reads |  |  | Count the workspace's trucks. `GET /api/v2/LogisticsService/Trucks/Count` |
| `absuite logistics trucks get` | Reads | `<id>` | `--columns` | Show one of the workspace's trucks. `GET /api/v2/LogisticsService/Trucks/{truckId}` |
| `absuite logistics trucks create` | Writes |  | `--plate-number`, `--name`, `--truck-type`, `--max-payload-kg`, `--teu-capacity`, `--driver-name`, `--driver-phone`, `--driver-license-number`, `--is-active`, `--is-refrigerated`, `--shipping-courier-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's trucks. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/Trucks` |
| `absuite logistics trucks update` | Writes | `<id>` | `--plate-number`, `--name`, `--truck-type`, `--max-payload-kg`, `--teu-capacity`, `--driver-name`, `--driver-phone`, `--driver-license-number`, `--is-active`, `--is-refrigerated`, `--shipping-courier-id`; `--json` `--file` `--dry-run` | Change one of the workspace's trucks: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LogisticsService/Trucks/{truckId}` |
| `absuite logistics trucks delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's trucks; it asks first unless --yes. `DELETE /api/v2/LogisticsService/Trucks/{truckId}` |
| `absuite logistics trucks trips list` | Reads |  | `--truck-id` (required); `--top` `--skip` `--columns` | List the workspace's trucks trips. `GET /api/v2/LogisticsService/Trucks/{truckId}/Trips` |
| `absuite logistics trucks trips count` | Reads |  | `--truck-id` (required) | Count the workspace's trucks trips. `GET /api/v2/LogisticsService/Trucks/{truckId}/Trips/Count` |
| `absuite logistics trucks trips create` | Writes |  | `--truck-id` (required), `--trip-number`, `--container-number`, `--seal-number`, `--departure-time`, `--arrival-time`, `--distance-km`, `--notes`, `--origin-port-id`, `--origin-location-id`, `--destination-port-id`, `--destination-location-id`, `--shipment-id`, `--bill-of-lading-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's trucks trips. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/Trucks/{truckId}/Trips` |
| `absuite logistics trucks trips delete` | Writes | `<id>` | `--truck-id` (required); `--yes` `--dry-run` | Delete one of the workspace's trucks trips; it asks first unless --yes. `DELETE /api/v2/LogisticsService/Trucks/{truckId}/Trips/{tripId}` |

### Vessels (`absuite logistics vessels`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite logistics vessels list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's vessels. `GET /api/v2/LogisticsService/Vessels` |
| `absuite logistics vessels count` | Reads |  |  | Count the workspace's vessels. `GET /api/v2/LogisticsService/Vessels/Count` |
| `absuite logistics vessels get` | Reads | `<id>` | `--columns` | Show one of the workspace's vessels. `GET /api/v2/LogisticsService/Vessels/{vesselId}` |
| `absuite logistics vessels create` | Writes |  | `--name`, `--imo-number`, `--mmsi-number`, `--call-sign`, `--flag-country-id`, `--vessel-type`, `--vessel-status`, `--gross-tonnage`, `--deadweight-tonnage`, `--teu-capacity`, `--length-meters`, `--beam-meters`, `--draft-meters`, `--year-built`, `--shipping-courier-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's vessels. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/Vessels` |
| `absuite logistics vessels update` | Writes | `<id>` | `--name`, `--imo-number`, `--mmsi-number`, `--call-sign`, `--flag-country-id`, `--vessel-type`, `--vessel-status`, `--gross-tonnage`, `--deadweight-tonnage`, `--teu-capacity`, `--length-meters`, `--beam-meters`, `--draft-meters`, `--year-built`, `--shipping-courier-id`; `--json` `--file` `--dry-run` | Change one of the workspace's vessels: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LogisticsService/Vessels/{vesselId}` |
| `absuite logistics vessels delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's vessels; it asks first unless --yes. `DELETE /api/v2/LogisticsService/Vessels/{vesselId}` |

### Voyages (`absuite logistics voyages`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite logistics voyages list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's voyages. `GET /api/v2/LogisticsService/Voyages` |
| `absuite logistics voyages count` | Reads |  |  | Count the workspace's voyages. `GET /api/v2/LogisticsService/Voyages/Count` |
| `absuite logistics voyages get` | Reads | `<id>` | `--columns` | Show one of the workspace's voyages. `GET /api/v2/LogisticsService/Voyages/{voyageId}` |
| `absuite logistics voyages create` | Writes |  | `--voyage-number`, `--title`, `--description`, `--voyage-direction`, `--departure-date`, `--arrival-date`, `--vessel-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's voyages. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/Voyages` |
| `absuite logistics voyages update` | Writes | `<id>` | `--voyage-number`, `--title`, `--description`, `--voyage-direction`, `--departure-date`, `--arrival-date`, `--vessel-id`; `--json` `--file` `--dry-run` | Change one of the workspace's voyages: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LogisticsService/Voyages/{voyageId}` |
| `absuite logistics voyages delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's voyages; it asks first unless --yes. `DELETE /api/v2/LogisticsService/Voyages/{voyageId}` |
| `absuite logistics voyages port-calls list` | Reads |  | `--voyage-id` (required); `--top` `--skip` `--columns` | List the workspace's voyages port-calls. `GET /api/v2/LogisticsService/Voyages/{voyageId}/PortCalls` |
| `absuite logistics voyages port-calls count` | Reads |  | `--voyage-id` (required) | Count the workspace's voyages port-calls. `GET /api/v2/LogisticsService/Voyages/{voyageId}/PortCalls/Count` |
| `absuite logistics voyages port-calls create` | Writes |  | `--voyage-id` (required), `--sequence-number`, `--port-call-status`, `--eta`, `--etd`, `--berth-number`, `--remarks`, `--port-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's voyages port-calls. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/Voyages/{voyageId}/PortCalls` |
| `absuite logistics voyages port-calls delete` | Writes | `<id>` | `--voyage-id` (required); `--yes` `--dry-run` | Delete one of the workspace's voyages port-calls; it asks first unless --yes. `DELETE /api/v2/LogisticsService/Voyages/{voyageId}/PortCalls/{portCallId}` |

### Warehouses (`absuite logistics warehouses`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite logistics warehouses list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's warehouses. `GET /api/v2/LogisticsService/Warehouses` |
| `absuite logistics warehouses count` | Reads |  |  | Count the workspace's warehouses. `GET /api/v2/LogisticsService/Warehouses/Count` |
| `absuite logistics warehouses get` | Reads | `<id>` | `--columns` | Show one of the workspace's warehouses. `GET /api/v2/LogisticsService/Warehouses/{warehouseId}` |
| `absuite logistics warehouses create` | Writes |  | `--title`, `--address1`, `--address2`, `--address3`, `--postal-code`, `--phone`, `--country-id`, `--state-id`, `--city-id`, `--is-group`, `--shipwire-warehouse-id`, `--parent-warehouse-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's warehouses. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/LogisticsService/Warehouses` |
| `absuite logistics warehouses update` | Writes | `<id>` | `--title`, `--address1`, `--address2`, `--address3`, `--postal-code`, `--phone`, `--country-id`, `--state-id`, `--city-id`, `--is-group`, `--shipwire-warehouse-id`, `--parent-warehouse-id`; `--json` `--file` `--dry-run` | Change one of the workspace's warehouses: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/LogisticsService/Warehouses/{warehouseId}` |
| `absuite logistics warehouses delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's warehouses; it asks first unless --yes. `DELETE /api/v2/LogisticsService/Warehouses/{warehouseId}` |

### Loyalty Programs (`absuite sales loyalty-programs`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite sales loyalty-programs list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's loyalty-programs. `GET /api/v2/SalesService/LoyaltyPrograms` |
| `absuite sales loyalty-programs count` | Reads |  |  | Count the workspace's loyalty-programs. `GET /api/v2/SalesService/LoyaltyPrograms/Count` |
| `absuite sales loyalty-programs get` | Reads | `<id>` | `--columns` | Show one of the workspace's loyalty-programs. `GET /api/v2/SalesService/LoyaltyPrograms/{loyaltyProgramId}` |
| `absuite sales loyalty-programs create` | Writes |  | `--title`, `--description`, `--price-list-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's loyalty-programs. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SalesService/LoyaltyPrograms` |
| `absuite sales loyalty-programs update` | Writes | `<id>` | `--title`, `--description`, `--price-list-id`; `--json` `--file` `--dry-run` | Change one of the workspace's loyalty-programs: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/SalesService/LoyaltyPrograms/{loyaltyProgramId}` |
| `absuite sales loyalty-programs delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's loyalty-programs; it asks first unless --yes. `DELETE /api/v2/SalesService/LoyaltyPrograms/{loyaltyProgramId}` |

### Point Of Sales (`absuite sales point-of-sales`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite sales point-of-sales list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's point-of-sales. `GET /api/v2/SalesService/PointOfSales` |
| `absuite sales point-of-sales count` | Reads |  |  | Count the workspace's point-of-sales. `GET /api/v2/SalesService/PointOfSales/Count` |
| `absuite sales point-of-sales get` | Reads | `<id>` | `--columns` | Show one of the workspace's point-of-sales. `GET /api/v2/SalesService/PointOfSales/{pointOfSaleId}` |
| `absuite sales point-of-sales create` | Writes |  | `--title`, `--code`, `--description`, `--price-list-id`, `--location-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's point-of-sales. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SalesService/PointOfSales` |
| `absuite sales point-of-sales update` | Writes | `<id>` | `--code`, `--title`, `--description`, `--price-list-id`, `--location-id`; `--json` `--file` `--dry-run` | Change one of the workspace's point-of-sales: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/SalesService/PointOfSales/{pointOfSaleId}` |
| `absuite sales point-of-sales delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's point-of-sales; it asks first unless --yes. `DELETE /api/v2/SalesService/PointOfSales/{pointOfSaleId}` |

### Sales Literatures (`absuite sales sales-literatures`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite sales sales-literatures list` | Reads |  | `--columns` | List the workspace's sales-literatures. `GET /api/v2/SalesService/SalesLiteratures` |
| `absuite sales sales-literatures create` | Writes |  | `--sales-literature-id` (required), `--title`, `--content`, `--description`, `--modified-date`, `--expiration-date`, `--sales-literature-type-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's sales-literatures. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SalesService/SalesLiteratures` |
| `absuite sales sales-literatures delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's sales-literatures; it asks first unless --yes. `DELETE /api/v2/SalesService/SalesLiteratures/{salesLiteratureId}` |
| `absuite sales sales-literatures extended list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's sales-literatures extended. `GET /api/v2/SalesService/SalesLiteratures/Extended` |

### Stores (`absuite sales stores`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite sales stores list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's stores. `GET /api/v2/SalesService/Stores` |
| `absuite sales stores count` | Reads |  |  | Count the workspace's stores. `GET /api/v2/SalesService/Stores/Count` |
| `absuite sales stores get` | Reads | `<id>` | `--columns` | Show one of the workspace's stores. `GET /api/v2/SalesService/Stores/{storeId}` |
| `absuite sales stores create` | Writes |  | `--name`, `--e-commerce`, `--currency-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's stores. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/SalesService/Stores` |
| `absuite sales stores update` | Writes | `<id>` | `--name`, `--e-commerce`, `--currency-id`; `--json` `--file` `--dry-run` | Change one of the workspace's stores: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/SalesService/Stores/{storeId}` |
| `absuite sales stores delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's stores; it asks first unless --yes. `DELETE /api/v2/SalesService/Stores/{storeId}` |

### Bills Of Lading (`absuite shipments bills-of-lading`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite shipments bills-of-lading list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's bills-of-lading. `GET /api/v2/ShipmentsService/BillsOfLading` |
| `absuite shipments bills-of-lading count` | Reads |  |  | Count the workspace's bills-of-lading. `GET /api/v2/ShipmentsService/BillsOfLading/Count` |
| `absuite shipments bills-of-lading get` | Reads | `<id>` | `--columns` | Show one of the workspace's bills-of-lading. `GET /api/v2/ShipmentsService/BillsOfLading/{billOfLadingId}` |
| `absuite shipments bills-of-lading create` | Writes |  | `--bill-of-lading-number`, `--title`, `--description`, `--bill-of-lading-type`, `--is-negotiable`, `--is-clean`, `--number-of-originals`, `--freight-payment-type`, `--shipping-terms`, `--freight-charges-description`, `--declared-value-amount`, `--declared-value-currency-id`, `--vessel-name`, `--voyage-number`, `--shipper-contact-id`, `--consignee-contact-id`, `--notify-party-contact-id`, `--shipping-courier-id`, `--port-of-loading-id`, `--port-of-discharge-id`, `--place-of-receipt-id`, `--place-of-delivery-id`, `--shipment-id`, `--order-id`, `--voyage-id`, `--marks-and-numbers`, `--total-packages`, `--total-gross-weight-kg`, `--total-volume-m3`; `--json` `--file` `--dry-run` | Create a record in the workspace's bills-of-lading. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ShipmentsService/BillsOfLading` |
| `absuite shipments bills-of-lading update` | Writes | `<id>` | `--bill-of-lading-number`, `--title`, `--description`, `--bill-of-lading-type`, `--is-negotiable`, `--is-clean`, `--number-of-originals`, `--freight-payment-type`, `--shipping-terms`, `--freight-charges-description`, `--declared-value-amount`, `--declared-value-currency-id`, `--expiry-date`, `--vessel-name`, `--voyage-number`, `--shipper-contact-id`, `--consignee-contact-id`, `--notify-party-contact-id`, `--shipping-courier-id`, `--port-of-loading-id`, `--port-of-discharge-id`, `--place-of-receipt-id`, `--place-of-delivery-id`, `--shipment-id`, `--order-id`, `--voyage-id`, `--marks-and-numbers`, `--total-packages`, `--total-gross-weight-kg`, `--total-volume-m3`; `--json` `--file` `--dry-run` | Change one of the workspace's bills-of-lading: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/ShipmentsService/BillsOfLading/{billOfLadingId}` |
| `absuite shipments bills-of-lading delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's bills-of-lading; it asks first unless --yes. `DELETE /api/v2/ShipmentsService/BillsOfLading/{billOfLadingId}` |
| `absuite shipments bills-of-lading lines list` | Reads |  | `--bill-of-lading-id` (required); `--top` `--skip` `--columns` | List the workspace's bills-of-lading lines. `GET /api/v2/ShipmentsService/BillsOfLading/{billOfLadingId}/Lines` |
| `absuite shipments bills-of-lading lines count` | Reads |  | `--bill-of-lading-id` (required) | Count the workspace's bills-of-lading lines. `GET /api/v2/ShipmentsService/BillsOfLading/{billOfLadingId}/Lines/Count` |
| `absuite shipments bills-of-lading lines get` | Reads | `<id>` | `--bill-of-lading-id` (required); `--columns` | Show one of the workspace's bills-of-lading lines. `GET /api/v2/ShipmentsService/BillsOfLading/{billOfLadingId}/Lines/{lineId}` |
| `absuite shipments bills-of-lading lines create` | Writes |  | `--bill-of-lading-id` (required), `--description`, `--quantity`, `--package-type`, `--gross-weight-kg`, `--volume-m3`, `--marks-and-numbers`, `--hs-code`, `--item-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's bills-of-lading lines. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ShipmentsService/BillsOfLading/{billOfLadingId}/Lines` |
| `absuite shipments bills-of-lading lines update` | Writes | `<id>` | `--bill-of-lading-id` (required), `--description`, `--quantity`, `--package-type`, `--gross-weight-kg`, `--volume-m3`, `--marks-and-numbers`, `--hs-code`, `--item-id`; `--json` `--file` `--dry-run` | Change one of the workspace's bills-of-lading lines: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/ShipmentsService/BillsOfLading/{billOfLadingId}/Lines/{lineId}` |
| `absuite shipments bills-of-lading lines delete` | Writes | `<id>` | `--bill-of-lading-id` (required); `--yes` `--dry-run` | Delete one of the workspace's bills-of-lading lines; it asks first unless --yes. `DELETE /api/v2/ShipmentsService/BillsOfLading/{billOfLadingId}/Lines/{lineId}` |

### Item Shipping Policies (`absuite shipments item-shipping-policies`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite shipments item-shipping-policies list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's item-shipping-policies. `GET /api/v2/ShipmentsService/ItemShippingPolicies` |
| `absuite shipments item-shipping-policies count` | Reads |  |  | Count the workspace's item-shipping-policies. `GET /api/v2/ShipmentsService/ItemShippingPolicies/Count` |
| `absuite shipments item-shipping-policies get` | Reads | `<id>` | `--columns` | Show one of the workspace's item-shipping-policies. `GET /api/v2/ShipmentsService/ItemShippingPolicies/{policyId}` |
| `absuite shipments item-shipping-policies create` | Writes |  | `--title`, `--description`, `--code`, `--is-express-shipment-policy`, `--is-free`, `--reduce`, `--is-enabled`, `--is-default`, `--allow-international`, `--hours`, `--days`, `--weeks`, `--months`, `--years`, `--value`, `--percentage`, `--currency-id`, `--country-id`, `--country-state-id`, `--custom-state`, `--custom-city`, `--city-id`, `--shipping-courier-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's item-shipping-policies. Never set here: type (not settable: discriminator (TPH rule)); id (set by the server); timestamp (set by the server). `POST /api/v2/ShipmentsService/ItemShippingPolicies` |
| `absuite shipments item-shipping-policies update` | Writes | `<id>` | `--title`, `--description`, `--code`, `--is-express-shipment-policy`, `--is-free`, `--reduce`, `--is-enabled`, `--is-default`, `--allow-international`, `--hours`, `--days`, `--weeks`, `--months`, `--years`, `--value`, `--percentage`, `--currency-id`, `--country-id`, `--country-state-id`, `--custom-state`, `--custom-city`, `--city-id`, `--shipping-courier-id`; `--json` `--file` `--dry-run` | Change one of the workspace's item-shipping-policies: reads it, applies --json/--file and the field flags, then saves it. Never set here: type (not settable: discriminator (TPH rule)). `PUT /api/v2/ShipmentsService/ItemShippingPolicies/{policyId}` |
| `absuite shipments item-shipping-policies delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's item-shipping-policies; it asks first unless --yes. `DELETE /api/v2/ShipmentsService/ItemShippingPolicies/{policyId}` |

### Shipping Classes (`absuite shipments shipping-classes`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite shipments shipping-classes list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's shipping-classes. `GET /api/v2/ShipmentsService/ShippingClasses` |
| `absuite shipments shipping-classes count` | Reads |  |  | Count the workspace's shipping-classes. `GET /api/v2/ShipmentsService/ShippingClasses/Count` |
| `absuite shipments shipping-classes get` | Reads | `<id>` | `--columns` | Show one of the workspace's shipping-classes. `GET /api/v2/ShipmentsService/ShippingClasses/{classId}` |
| `absuite shipments shipping-classes create` | Writes |  | `--name`, `--slug`; `--json` `--file` `--dry-run` | Create a record in the workspace's shipping-classes. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ShipmentsService/ShippingClasses` |
| `absuite shipments shipping-classes update` | Writes | `<id>` | `--name`, `--slug`; `--json` `--file` `--dry-run` | Change one of the workspace's shipping-classes: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/ShipmentsService/ShippingClasses/{classId}` |
| `absuite shipments shipping-classes delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's shipping-classes; it asks first unless --yes. `DELETE /api/v2/ShipmentsService/ShippingClasses/{classId}` |

### Shipping Couriers (`absuite shipments shipping-couriers`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite shipments shipping-couriers list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's shipping-couriers. `GET /api/v2/ShipmentsService/ShippingCouriers` |
| `absuite shipments shipping-couriers count` | Reads |  |  | Count the workspace's shipping-couriers. `GET /api/v2/ShipmentsService/ShippingCouriers/Count` |
| `absuite shipments shipping-couriers get` | Reads | `<id>` | `--columns` | Show one of the workspace's shipping-couriers. `GET /api/v2/ShipmentsService/ShippingCouriers/{courierId}` |
| `absuite shipments shipping-couriers create` | Writes |  | `--name`, `--logo-url`, `--country-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's shipping-couriers. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ShipmentsService/ShippingCouriers` |
| `absuite shipments shipping-couriers update` | Writes | `<id>` | `--name`, `--logo-url`, `--country-id`; `--json` `--file` `--dry-run` | Change one of the workspace's shipping-couriers: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/ShipmentsService/ShippingCouriers/{courierId}` |
| `absuite shipments shipping-couriers delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's shipping-couriers; it asks first unless --yes. `DELETE /api/v2/ShipmentsService/ShippingCouriers/{courierId}` |

### Shipping Labels (`absuite shipments shipping-labels`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite shipments shipping-labels list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's shipping-labels. `GET /api/v2/ShipmentsService/ShippingLabels` |
| `absuite shipments shipping-labels count` | Reads |  |  | Count the workspace's shipping-labels. `GET /api/v2/ShipmentsService/ShippingLabels/Count` |
| `absuite shipments shipping-labels get` | Reads | `<id>` | `--columns` | Show one of the workspace's shipping-labels. `GET /api/v2/ShipmentsService/ShippingLabels/{labelId}` |
| `absuite shipments shipping-labels create` | Writes |  | `--tracking-code`, `--expected-delivery`, `--location-id`, `--shipment-id`, `--shipping-courier-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's shipping-labels. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ShipmentsService/ShippingLabels` |
| `absuite shipments shipping-labels update` | Writes | `<id>` | `--tracking-code`, `--expected-delivery`, `--location-id`, `--shipment-id`, `--shipping-courier-id`; `--json` `--file` `--dry-run` | Change one of the workspace's shipping-labels: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/ShipmentsService/ShippingLabels/{labelId}` |
| `absuite shipments shipping-labels delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's shipping-labels; it asks first unless --yes. `DELETE /api/v2/ShipmentsService/ShippingLabels/{labelId}` |

### Shipping Methods (`absuite shipments shipping-methods`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite shipments shipping-methods list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's shipping-methods. `GET /api/v2/ShipmentsService/ShippingMethods` |
| `absuite shipments shipping-methods count` | Reads |  |  | Count the workspace's shipping-methods. `GET /api/v2/ShipmentsService/ShippingMethods/Count` |
| `absuite shipments shipping-methods get` | Reads | `<id>` | `--columns` | Show one of the workspace's shipping-methods. `GET /api/v2/ShipmentsService/ShippingMethods/{methodId}` |
| `absuite shipments shipping-methods create` | Writes |  | `--name`, `--description`, `--cost`, `--taxable`, `--tax-included`, `--currency-id`, `--shipping-class-calculation-type`; `--json` `--file` `--dry-run` | Create a record in the workspace's shipping-methods. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ShipmentsService/ShippingMethods` |
| `absuite shipments shipping-methods update` | Writes | `<id>` | `--name`, `--description`, `--cost`, `--taxable`, `--tax-included`, `--currency-id`, `--shipping-class-calculation-type`; `--json` `--file` `--dry-run` | Change one of the workspace's shipping-methods: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/ShipmentsService/ShippingMethods/{methodId}` |
| `absuite shipments shipping-methods delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's shipping-methods; it asks first unless --yes. `DELETE /api/v2/ShipmentsService/ShippingMethods/{methodId}` |

### Shipping Regions (`absuite shipments shipping-regions`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite shipments shipping-regions list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's shipping-regions. `GET /api/v2/ShipmentsService/ShippingRegions` |
| `absuite shipments shipping-regions count` | Reads |  |  | Count the workspace's shipping-regions. `GET /api/v2/ShipmentsService/ShippingRegions/Count` |
| `absuite shipments shipping-regions get` | Reads | `<id>` | `--columns` | Show one of the workspace's shipping-regions. `GET /api/v2/ShipmentsService/ShippingRegions/{regionId}` |
| `absuite shipments shipping-regions create` | Writes |  | `--name`, `--postal-codes`; `--json` `--file` `--dry-run` | Create a record in the workspace's shipping-regions. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ShipmentsService/ShippingRegions` |
| `absuite shipments shipping-regions update` | Writes | `<id>` | `--name`, `--postal-codes`; `--json` `--file` `--dry-run` | Change one of the workspace's shipping-regions: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/ShipmentsService/ShippingRegions/{regionId}` |
| `absuite shipments shipping-regions delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's shipping-regions; it asks first unless --yes. `DELETE /api/v2/ShipmentsService/ShippingRegions/{regionId}` |

### Shipping Zones (`absuite shipments shipping-zones`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite shipments shipping-zones list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's shipping-zones. `GET /api/v2/ShipmentsService/ShippingZones` |
| `absuite shipments shipping-zones count` | Reads |  |  | Count the workspace's shipping-zones. `GET /api/v2/ShipmentsService/ShippingZones/Count` |
| `absuite shipments shipping-zones get` | Reads | `<id>` | `--columns` | Show one of the workspace's shipping-zones. `GET /api/v2/ShipmentsService/ShippingZones/{zoneId}` |
| `absuite shipments shipping-zones create` | Writes |  | `--name`, `--default`, `--everywhere`, `--postal-codes`, `--country-codes`; `--json` `--file` `--dry-run` | Create a record in the workspace's shipping-zones. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ShipmentsService/ShippingZones` |
| `absuite shipments shipping-zones update` | Writes | `<id>` | `--name`, `--default`, `--everywhere`, `--postal-codes`, `--country-codes`; `--json` `--file` `--dry-run` | Change one of the workspace's shipping-zones: reads it, applies --json/--file and the field flags, then saves it. `PUT /api/v2/ShipmentsService/ShippingZones/{zoneId}` |
| `absuite shipments shipping-zones delete` | Writes | `<id>` | `--yes` `--dry-run` | Delete one of the workspace's shipping-zones; it asks first unless --yes. `DELETE /api/v2/ShipmentsService/ShippingZones/{zoneId}` |

### Shipments (`absuite shipments`)

| Command | Kind | Arguments | Options | What it does |
|---|---|---|---|---|
| `absuite shipments list` | Reads |  | `--top` `--skip` `--columns` | List the workspace's shipments. `GET /api/v2/ShipmentsService/Shipments` |
| `absuite shipments create` | Writes |  | `--tracking-code`, `--is-international`, `--expected-shipping-date`, `--expected-delivery-date`, `--shipping-terms`, `--order-id`; `--json` `--file` `--dry-run` | Create a record in the workspace's shipments. Never set here: id (set by the server); timestamp (set by the server). `POST /api/v2/ShipmentsService/Shipments` |

## Example

```bash
absuite logistics airway-bills list --top 5 -o json --query "[].id"
absuite logistics airway-bills create --document-number <value> --airway-bill-type <value> --dry-run   # prints the POST, sends nothing
absuite logistics airway-bills create --document-number <value> --airway-bill-type <value> -o json --no-input
```
