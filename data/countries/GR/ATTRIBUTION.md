# Greece municipality geometry attribution

Public geometry: `static/municipalities_web.geojson`

Source: **OpenStreetMap contributors**, Greece extract provided by **Geofabrik GmbH**, snapshot `2026-08-31`.

Dataset: https://download.geofabrik.de/europe/greece.html

Licence: **Open Database License (ODbL) 1.0** - https://opendatacommons.org/licenses/odbl/1-0/

MeteoRisk modifications: selected the 332 OpenStreetMap `admin_level=7` municipalities for Greece; preserved the OSM relation ID as `admin_id`; preserved the published OSM `name` as `name_local`; required OSM `name:en` for `name_en`; canonicalized geometry in EPSG:4326; and produced the public derivative with topology-preserving 37 m simplification in EPSG:3035.

The single `admin_level=3` Mount Athos boundary (`Αυτόνομη Μοναστική Πολιτεία Αγίου Όρους`, OSM relation `2135921`) is recorded for provenance and quality-control purposes only and is not treated as a municipality.

The source contains one localized overlap between Lefkada Municipality (`5225334`) and Meganisi Municipality (`5225335`) at Sparti (`Σπάρτη`, OSM `812781`). MeteoRisk removes only the single Lefkada polygon component that is fully duplicated inside the Meganisi/Sparti geometry; Meganisi remains unchanged. The correction preserves 332 valid municipality geometries and reduces residual overlap to numerical noise.

The country level-2 coverage percentage is recorded for quality-control information only and is not used as an acceptance gate because the Greece level-2 relation includes substantial offshore territory.

This derived database contains information from OpenStreetMap and remains subject to the attribution and share-alike requirements of ODbL 1.0.

Source PBF SHA-256: `78d737f96d818d1e67055cec88d4301c0d0cc921e45e49cfeeb8cb62fd90872a`.

Canonical GeoJSON SHA-256: `d4ee1a8c47a33684899bea57d4eff43448fc391b4183a4bac81b664d359a8bff`.

Public GeoJSON SHA-256: `02c5a121c7e7abcdfdeeac7983f6a46df9d7e134c652292aec99274d277322e4`.
