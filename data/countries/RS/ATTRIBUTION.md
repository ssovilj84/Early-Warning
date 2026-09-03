# Serbia municipality geometry attribution

Public geometry: `../../static/municipalities_web.geojson`

Source: **Geoanalitičari**, dataset **Hipsometrijska struktura (visinske zone) opština i naselja**, published through the Portal otvorenih podataka Republike Srbije.

Dataset: https://data.gov.rs/sr/datasets/khipsometrijska-struktura-visinske-zone-opshtina-i-naselja/

Source resource: `Hypso_Struct_Mun.zip`, downloaded `2026-09-03`.

Licence: **Srpska licenca za otvorene podatke (SODL 1.0)** — https://data.gov.rs/sr/terms/

MeteoRisk modifications: used `MatBrO` as the administrative identifier basis and retained all 194 existing MeteoRisk `Municipality_DOM_ID` values. The source contains 197 polygons; three source child units were dissolved into their MeteoRisk contract parent units: `71358 Vranjska Banja` into `70432 Vranje`, `71340 Kostolac` into `70947 Požarevac`, and `80519 Novi Sad` into `80284 Novi Sad`. Existing `Value_e`, `Value_sl` and `Value_sc` values were retained for backward compatibility. Geometry was reprojected from EPSG:32634 to canonical EPSG:4326 and the public derivative was produced with topology-preserving 37 m simplification in EPSG:32634.

The resulting 194-unit geometry is derived only from the open-licensed source. Legacy Ministry of Mining and Energy geometry is not used in construction of the replacement geometry.

Source ZIP SHA-256: `1d3a2c20e12f6ddca5e3782b546216157ac8cbed338fd887435aa649596fda47`.

Canonical GeoJSON SHA-256: `33883eae309858259c83d6bbc67e8097e56064d0074a2fbcae262f3c14382aba`.

Public GeoJSON SHA-256: `8bdcd324a8fc7cd46dcd92e6513ec3980da83fb6ca6e94602a518aac2c2f4e3f`.
