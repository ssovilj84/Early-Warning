# North Macedonia municipality geometry attribution

Public geometry: `static/municipalities_web.geojson`

Source: **OpenStreetMap contributors**, North Macedonia extract provided by **Geofabrik GmbH**, snapshot `2026-08-31`.

Dataset: https://download.geofabrik.de/europe/macedonia.html

Licence: **Open Database License (ODbL) 1.0** - https://opendatacommons.org/licenses/odbl/1-0/

MeteoRisk modifications: selected the 80 OpenStreetMap `admin_level=7` municipalities for North Macedonia; preserved the OSM relation ID as `admin_id`; preserved the published OSM `name` as `name_local`; required OSM `name:en` for `name_en`; canonicalized geometry in EPSG:4326; and produced the public derivative with topology-preserving 37 m simplification in EPSG:3035.

The single `admin_level=6` City of Skopje boundary (`Град Скопје`, OSM relation `2439740`) is recorded for provenance and quality-control purposes only and is not treated as an 81st municipality.

The country level-2 coverage percentage is recorded for quality-control information only and is not used as an acceptance gate for the municipality dataset.

This derived database contains information from OpenStreetMap and remains subject to the attribution and share-alike requirements of ODbL 1.0.

Source PBF SHA-256: `940d37e19d0bf69ed54535607328946559744f8f814cfc423ad0788d9d7069d9`.

Canonical GeoJSON SHA-256: `7a41ac698dc6e52451403803cadfc8a180616b5c41c71be866edb9237963b327`.

Public GeoJSON SHA-256: `fbb285768bc0afe47794ec5fd2cd98ddbc2534a58be8da6535271e5bc62b941a`.
