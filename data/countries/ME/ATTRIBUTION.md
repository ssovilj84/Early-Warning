# Montenegro municipality geometry attribution

Public geometry: `static/municipalities_web.geojson`

Source: **OpenStreetMap contributors**, Montenegro extract provided by **Geofabrik GmbH**, snapshot `2026-08-31`.

Dataset: https://download.geofabrik.de/europe/montenegro.html

Licence: **Open Database License (ODbL) 1.0** - https://opendatacommons.org/licenses/odbl/1-0/

MeteoRisk modifications: selected the 25 OpenStreetMap `admin_level=6` local-government units for Montenegro; preserved the OSM relation ID as `admin_id`; preserved the published OSM `name` as `name_local`; required OSM `name:en` for `name_en`; canonicalized geometry in EPSG:4326; and produced the public derivative with topology-preserving 37 m simplification in EPSG:3035.

The country level-2 coverage percentage is recorded for quality-control information only and is not used as an acceptance gate for the municipality dataset.

This derived database contains information from OpenStreetMap and remains subject to the attribution and share-alike requirements of ODbL 1.0.

Public GeoJSON SHA-256: `c0015e6be676dfcc5c9c09e9973824b7ebb6792e055592a104d8a27519715fd3`.
