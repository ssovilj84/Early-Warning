# Bosnia and Herzegovina territorial-zone geometry attribution

Public geometry: `static/territorial_zones_web.geojson`

Source: **OpenStreetMap contributors**, Bosnia and Herzegovina extract provided by **Geofabrik GmbH**, snapshot `2026-08-31`.

Dataset: https://download.geofabrik.de/europe/bosnia-herzegovina.html

Licence: **Open Database License (ODbL) 1.0** — https://opendatacommons.org/licenses/odbl/1-0/

MeteoRisk modifications: derived 143 non-overlapping operational territorial zones from OpenStreetMap administrative relations; retained contained level-7 units, non-umbrella level-6 cities and Brcko District; excluded the MZ Buna source anomaly, umbrella Grad Sarajevo and Grad Istocno Sarajevo relations, and the out-of-country Slavonski Samac relation; preserved the OSM relation ID as `admin_id`; normalized dual-script display names to the Latin component; canonicalized geometry in EPSG:4326; and produced the public derivative with topology-preserving 37 m simplification in EPSG:3035.

The territorial zones are an operational MeteoRisk spatial division for risk visualization and do not necessarily represent an official legal classification of local self-government units in Bosnia and Herzegovina.

This derived database contains information from OpenStreetMap and remains subject to the attribution and share-alike requirements of ODbL 1.0.

Public GeoJSON SHA-256: `cdbc8fa1c0dacb5cde8e4a1d9d15d1b1c3e7b726250261f0382b9f32851e8c75`.
