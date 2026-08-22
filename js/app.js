/* ============================================================
   CONFIG
   ============================================================ */

const FORECAST_HOURS =
    Array.from(
        { length: 40 },
        (_, i) => (i + 1) * 3
    );

const GEOMETRY_FILE =
    "data/static/municipalities.geojson";

const HAZARD_INFO_FILE =
    "data/hazard_info.json";

const GEFS_DIR =
    "data/gefs";

/* MeteoRisk STORMS multimodel.
   The existing five-day frontend (+003 to +120 h) is preserved.
   In the current development phase the final multimodel STORMS product
   exists for the first 24 hours at 3-hour intervals. After +024 h the
   existing GEFS products remain available until the multimodel horizon
   is extended. */
const MULTIMODEL_STORMS_FILES = {
     3: "data/multimodel/storms_f003.csv",
     6: "data/multimodel/storms_f006.csv",
     9: "data/multimodel/storms_f009.csv",
    12: "data/multimodel/storms_f012.csv",
    15: "data/multimodel/storms_f015.csv",
    18: "data/multimodel/storms_f018.csv",
    21: "data/multimodel/storms_f021.csv",
    24: "data/multimodel/storms_f024.csv"
};

let multimodelStormsCache = {};



let timelineSlots = [];
let timelineSlotIndex = 0;


/* ============================================================
   STATE
   ============================================================ */

let currentLanguage = "sr";
let currentHazard = "overall_risk";

let currentTimeIndex = 0;

let currentForecastHour =
    FORECAST_HOURS[0];

let currentModelData = null;

let geometryData = null;

let hazardInfo = null;

let geojsonLayer = null;

let selectedMunicipalityId = null;

let selectedLayer = null;

let locationMarker = null;

let playTimer = null;

let isPlaying = false;

let allForecastData = null;
let overviewFeature = null;
let overviewShowAll = false;
let overviewSelectedDate = null;

/* User-facing forecast cycle reference.
   It is derived from the multimodel reference date and normalized to 00 UTC,
   so valid times are shown as +003, +006, ... relative to that common cycle,
   regardless of the underlying GEFS lead used internally. */
let displayReferenceRun = null;


/* ============================================================
   TRANSLATIONS
   ============================================================ */

const translations = {

    sr: {

        title:
            "Интерактивни приказ метеоролошких ризика по јединицама локалне самоуправе у Републици Србији",

        model:
            "Модел: GEFS ансамбл",

        updated:
            "Последње ажурирање података",

        search:
            "Претражи општину...",

        location:
            "📍 Моја локација",

        pdf:
            "📄 Сачувај као PDF",

        share:
            "↗ Подели",

        thunder:
            "⚡ Грмљавина",

        hail:
            "🧊 Ризик од града",

        largeHail:
            "🧊 Ризик од крупног града (≥ 2 cm)",

        veryLargeHail:
            "🧊 Ризик од веома крупног града (≥ 5 cm)",

        valid:
            "Важи за",

        lead:
            "Прогностички рок",

        legend:
            "Ансамбл сигнал",

        modelParameters:
            "Параметри модела",

        instability:
            "Нестабилност (CAPE)",

        shear:
            "Смицање ветра (850–500 hPa)",

        humidity:
            "Релативна влажност (700 hPa)",

        grid:
            "Број GEFS grid тачака",

        disclaimer:
            "Експериментални независни производ заснован на јавно доступним open-data моделским подацима — није званично упозорење РХМЗ-а.",

        notFound:
            "Општина није пронађена.",

        loadError:
            "Није могуће учитати податке за овај термин.",

        locationSearching:
            "Одређујем вашу локацију...",

        locationDenied:
            "Приступ локацији није дозвољен.",

        locationUnavailable:
            "Тренутну локацију није могуће одредити.",

        locationTimeout:
            "Одређивање локације је предуго трајало.",

        municipalityLocated:
            "Пронађена општина",

        shareTitle:
            "Интерактивни приказ метеоролошких ризика",

        stormGroup:
            "⛈ ОЛУЈА",

        windGroup: "💨 ВЕТАР",
        temperatureGroup: "🌡 ТЕМПЕРАТУРА",
        maxTemperature: "🌡 Максимална температура",
        temperatureCategory: "Категорија",
        mostLikelyCategory: "Највероватнија категорија",
        warmestPeriod: "Најтоплији део дана",
        multimodelTmax: "Мултимодел Tmax",
        categoryProbability: "Вероватноћа категорије",
        impacts: "Могући утицаји",
        recommendations: "Препоруке",
        notAvailableForTime: "Није доступно за изабрани термин",
        available: "доступно",
        unavailable: "није доступно",
        windOverall: "Укупни ризик",
        wind10: "Удар ≥ 10 m/s (36 km/h)",
        wind17: "Олујни удар ≥ 17 m/s (61 km/h)",
        wind24: "Жестоки олујни удар ≥ 24 m/s (86 km/h)",
        wind28: "Оркански удар ≥ 28 m/s (101 km/h)",

        overviewTitle:
            "Преглед ризика за наредних 5 дана",

        showAllRisks:
            "Прикажи и појаве без значајног ризика",

        noSignificantSignal:
            "Нема значајног сигнала (≥10%).",

        maxSignal:
            "Максимални ансамбл сигнал",

        loadingOverview:
            "Учитавање петодневног прегледа...",

        riskNote:
            "Утицаји и препоруке односе се на случај да се прогнозирана појава реализује.",

        allFiveDays:
            "Свих 5 дана",

        selectedDay:
            "Изабрани дан",

        multimodelThunder:
            "Мултимоделска процена грмљавине",

        risk:
            "Ризик",

        confidence:
            "Поузданост",

        localSupport:
            "Локална просторна подршка",

        dominantModel:
            "Доминантни модел",

        modelSignals:
            "Сигнали модела",

        modelDisagreement:
            "Неслагање модела",

        riskLevels:
            ["без значајног ризика", "низак", "умерен", "висок", "веома висок"]
    },


    en: {

        title:
            "Interactive Weather Risk Map by Local Government Units in the Republic of Serbia",

        model:
            "Model: GEFS ensemble",

        updated:
            "Last data update",

        search:
            "Search municipality...",

        location:
            "📍 My location",

        pdf:
            "📄 Save as PDF",

        share:
            "↗ Share",

        thunder:
            "⚡ Thunderstorm",

        hail:
            "🧊 Hail risk",

        largeHail:
            "🧊 Large hail risk (≥ 2 cm)",

        veryLargeHail:
            "🧊 Very large hail risk (≥ 5 cm)",

        valid:
            "Valid",

        lead:
            "Lead time",

        legend:
            "Ensemble signal",

        modelParameters:
            "Model parameters",

        instability:
            "Instability (CAPE)",

        shear:
            "Wind shear (850–500 hPa)",

        humidity:
            "Relative humidity (700 hPa)",

        grid:
            "Number of GEFS grid points",

        disclaimer:
            "Independent experimental product based on publicly available open-data model data — not an official RHMZ warning.",

        notFound:
            "Municipality not found.",

        loadError:
            "Data for this forecast time could not be loaded.",

        locationSearching:
            "Determining your location...",

        locationDenied:
            "Location access was denied.",

        locationUnavailable:
            "Current location could not be determined.",

        locationTimeout:
            "Location request timed out.",

        municipalityLocated:
            "Municipality found",

        shareTitle:
            "Interactive Weather Risk Map",

        stormGroup:
            "⛈ STORM",

        windGroup: "💨 WIND",
        temperatureGroup: "🌡 TEMPERATURE",
        maxTemperature: "🌡 Maximum temperature",
        temperatureCategory: "Category",
        mostLikelyCategory: "Most likely category",
        warmestPeriod: "Warmest part of day",
        multimodelTmax: "Multimodel Tmax",
        categoryProbability: "Category probability",
        impacts: "Possible impacts",
        recommendations: "Recommendations",
        notAvailableForTime: "Not available for the selected time",
        available: "available",
        unavailable: "not available",
        windOverall: "Overall risk",
        wind10: "Gust ≥ 10 m/s (36 km/h)",
        wind17: "Gale gust ≥ 17 m/s (61 km/h)",
        wind24: "Severe gale gust ≥ 24 m/s (86 km/h)",
        wind28: "Hurricane-force gust ≥ 28 m/s (101 km/h)",

        overviewTitle:
            "Risk overview for the next 5 days",

        showAllRisks:
            "Show hazards without a significant risk",

        noSignificantSignal:
            "No significant signal (≥10%).",

        maxSignal:
            "Maximum ensemble signal",

        loadingOverview:
            "Loading five-day overview...",

        riskNote:
            "Impacts and recommendations apply if the forecast event occurs.",

        allFiveDays:
            "All 5 days",

        selectedDay:
            "Selected day",

        multimodelThunder:
            "Multimodel thunderstorm assessment",

        risk:
            "Risk",

        confidence:
            "Confidence",

        localSupport:
            "Local spatial support",

        dominantModel:
            "Dominant model",

        modelSignals:
            "Model signals",

        modelDisagreement:
            "Model disagreement",

        riskLevels:
            ["no significant risk", "low", "moderate", "high", "very high"]
    }

};


/* ============================================================
   MAP
   ============================================================ */

const map =
    L.map(
        "map",
        {
            zoomControl: true
        }
    )
    .setView(
        [44.0, 20.8],
        7
    );


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


/* ============================================================
   UTILITIES
   ============================================================ */

function forecastFile(hour) {

    return (
        GEFS_DIR
        + "/f"
        + String(hour).padStart(3, "0")
        + ".json"
    );
}


/* ============================================================
   REAL-TIME START POSITION
   ============================================================ */

async function initialForecastIndexFromCurrentTime() {

    let firstValidTime = null;

    try {
        const rowsByName = await loadMultimodelStormsRows(
            FORECAST_HOURS[0]
        );

        if (rowsByName && rowsByName.size > 0) {
            const firstRow = rowsByName.values().next().value;
            const validText = firstRow ? firstRow.valid_time : null;
            const parsed = validText ? new Date(validText) : null;

            if (parsed && Number.isFinite(parsed.getTime())) {
                firstValidTime = parsed;
            }
        }
    } catch (error) {
        console.warn(
            "Could not determine initial time from multimodel metadata.",
            error
        );
    }

    if (!firstValidTime) {
        try {
            const response = await fetch(
                forecastFile(FORECAST_HOURS[0]),
                { cache: "no-store" }
            );

            if (response.ok) {
                const data = await response.json();
                const parsed = data.valid_time
                    ? new Date(data.valid_time)
                    : null;

                if (parsed && Number.isFinite(parsed.getTime())) {
                    firstValidTime = parsed;
                }
            }
        } catch (error) {
            console.warn(
                "Could not determine initial time from GEFS metadata.",
                error
            );
        }
    }

    if (!firstValidTime) {
        return 0;
    }

    const now = new Date();
    const stepMs = 3 * 60 * 60 * 1000;

    const rawIndex = Math.ceil(
        (now.getTime() - firstValidTime.getTime())
        / stepMs
    );

    return Math.max(
        0,
        Math.min(
            rawIndex,
            FORECAST_HOURS.length - 1
        )
    );
}


function municipalityId(properties) {

    return String(
        properties.Municipality_DOM_ID
    );
}


function getMunicipalityData(
    properties
) {

    if (!currentModelData) {
        return null;
    }

    const id =
        municipalityId(
            properties
        );

    return (
        currentModelData
        .municipalities[id]
        || null
    );
}


function municipalityName(
    properties
) {

    if (
        currentLanguage === "sr"
    ) {

        return (
            properties.Value_sc
            || properties.Value_sl
            || properties.Value_e
            || "—"
        );
    }

    return (
        properties.Value_e
        || properties.Value_sl
        || properties.Value_sc
        || "—"
    );
}


function formatProbability(value) {

    if (
        value === null
        || value === undefined
        || !Number.isFinite(
            Number(value)
        )
    ) {
        return "—";
    }

    return (
        Number(value).toFixed(1)
        + "%"
    );
}


function formatNumber(
    value,
    decimals = 0
) {

    if (
        value === null
        || value === undefined
        || !Number.isFinite(
            Number(value)
        )
    ) {
        return "—";
    }

    return Number(value)
        .toFixed(decimals);
}


/* Convert CSV numeric text to number while preserving missing values.
   Number("") is 0 in JavaScript, which would incorrectly display a
   missing model (e.g. ICON at an unavailable valid time) as 0%. */
function optionalNumber(value) {
    if (
        value === null
        || value === undefined
        || String(value).trim() === ""
    ) {
        return null;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function translatedModelAvailability(sourceModels) {
    const text = String(sourceModels || "").trim();
    if (!text) return "—";
    return text;
}


function normalizeToUtcMidnight(dateValue) {
    const date = new Date(dateValue);

    if (!Number.isFinite(date.getTime())) {
        return null;
    }

    return new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0, 0, 0, 0
    ));
}

function displayLeadHour(validTime) {
    if (!displayReferenceRun || !validTime) {
        return currentForecastHour;
    }

    const valid = new Date(validTime);

    if (!Number.isFinite(valid.getTime())) {
        return currentForecastHour;
    }

    return Math.round(
        (valid.getTime() - displayReferenceRun.getTime())
        / (60 * 60 * 1000)
    );
}

function formatLeadHour(validTime) {
    const hour = displayLeadHour(validTime);

    return "+"
        + String(Math.max(0, hour)).padStart(3, "0")
        + " h";
}


/* ============================================================
   MULTIMODEL STORMS HELPERS
   ============================================================ */

function normalizeMunicipalityName(value) {
    return String(value ?? "")
        .trim()
        .toLocaleUpperCase("sr");
}

function parseCsvLine(line) {
    const result = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];

        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                field += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === "," && !inQuotes) {
            result.push(field);
            field = "";
        } else {
            field += ch;
        }
    }

    result.push(field);
    return result;
}

function parseCsv(text) {
    const lines = text
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");

    if (!lines.length) return [];

    const headers = parseCsvLine(lines[0]).map(h => h.trim());

    return lines.slice(1).map(line => {
        const values = parseCsvLine(line);
        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index] ?? "";
        });

        return row;
    });
}

function stormColorLevelNumber(color) {
    const levels = {
        "GREEN": 0,
        "YELLOW": 1,
        "ORANGE": 2,
        "RED": 3,
        "PURPLE": 4
    };

    return levels[String(color || "").toUpperCase()] ?? 0;
}

function stormRiskColor(color) {
    const colors = {
        "GREEN": "#a6d96a",
        "YELLOW": "#ffffbf",
        "ORANGE": "#fdae61",
        "RED": "#d7191c",
        "PURPLE": "#7b3294"
    };

    return colors[String(color || "").toUpperCase()] || "#cccccc";
}

function translatedStormRiskColor(color) {
    const sr = {
        "GREEN": "без значајног ризика",
        "YELLOW": "повишен",
        "ORANGE": "умерен",
        "RED": "висок",
        "PURPLE": "веома висок"
    };

    const en = {
        "GREEN": "no significant risk",
        "YELLOW": "elevated",
        "ORANGE": "moderate",
        "RED": "high",
        "PURPLE": "very high"
    };

    const key = String(color || "").toUpperCase();
    return (currentLanguage === "sr" ? sr : en)[key] || color || "—";
}

function translatedConfidence(level) {
    const sr = {
        "LOW": "ниска",
        "MODERATE": "умерена",
        "HIGH": "висока",
        "UNKNOWN": "непозната"
    };

    const en = {
        "LOW": "low",
        "MODERATE": "moderate",
        "HIGH": "high",
        "UNKNOWN": "unknown"
    };

    const key = String(level || "").toUpperCase();
    return (currentLanguage === "sr" ? sr : en)[key] || level || "—";
}

function translatedLocalSupport(level) {
    const sr = {
        "NONE": "нема",
        "ISOLATED": "изолована",
        "LOW": "ниска",
        "MODERATE": "умерена",
        "HIGH": "висока",
        "UNKNOWN": "непозната"
    };

    const en = {
        "NONE": "none",
        "ISOLATED": "isolated",
        "LOW": "low",
        "MODERATE": "moderate",
        "HIGH": "high",
        "UNKNOWN": "unknown"
    };

    const key = String(level || "").toUpperCase();
    return (currentLanguage === "sr" ? sr : en)[key] || level || "—";
}

function stormHazardPrefix(hazardKey) {
    return {
        thunder: "thunder",
        hail: "hail",
        large_hail: "large_hail",
        very_large_hail: "very_large_hail"
    }[hazardKey] || hazardKey;
}

async function loadMultimodelStormsRows(hour) {
    const path = MULTIMODEL_STORMS_FILES[hour];

    if (!path) return null;

    if (multimodelStormsCache[hour]) {
        return multimodelStormsCache[hour];
    }

    const response = await fetch(
        path,
        { cache: "no-store" }
    );

    if (!response.ok) {
        console.warn(
            "Multimodel STORMS file unavailable for f"
            + String(hour).padStart(3, "0")
            + ": HTTP "
            + response.status
        );
        return null;
    }

    const rows = parseCsv(await response.text());
    const byName = new Map();

    if (!displayReferenceRun && rows.length > 0) {
        const referenceText =
            rows[0].reference_run
            || rows[0].valid_time
            || "";

        displayReferenceRun =
            normalizeToUtcMidnight(referenceText);
    }

    rows.forEach(row => {
        byName.set(
            normalizeMunicipalityName(row.Value_sc),
            row
        );
    });

    multimodelStormsCache[hour] = byName;
    return byName;
}


async function baseGefForecastHourForSlot(hour) {
    const rowsByName = await loadMultimodelStormsRows(hour);

    /* No multimodel file: preserve the original GEFS five-day timeline. */
    if (!rowsByName || rowsByName.size === 0) {
        return hour;
    }

    const firstRow = rowsByName.values().next().value;
    const gefsHour = optionalNumber(
        firstRow ? firstRow.gefs_forecast_hour : null
    );

    return Number.isFinite(Number(gefsHour))
        ? Number(gefsHour)
        : hour;
}

async function applyMultimodelStormsOverlay(data, hour) {
    if (!data || !geometryData) return data;

    const rowsByName = await loadMultimodelStormsRows(hour);

    if (!rowsByName) {
        data.storms_multimodel = false;
        return data;
    }

    let matched = 0;
    let slotSourceModels = "";

    geometryData.features.forEach(feature => {
        const properties = feature.properties || {};
        const name = normalizeMunicipalityName(
            properties.Value_sc
            || properties.Value_sl
            || properties.Value_e
        );

        const row = rowsByName.get(name);
        if (!row) return;

        const id = municipalityId(properties);

        if (!data.municipalities || !data.municipalities[id]) {
            return;
        }

        const target = data.municipalities[id];
        target.storms_multimodel = true;

        /* Final multimodel signals */
        target.thunder = optionalNumber(row.thunder_signal);
        target.hail = optionalNumber(row.hail_signal);
        target.large_hail = optionalNumber(row.large_hail_signal);
        target.very_large_hail = optionalNumber(row.very_large_hail_signal);

        /* Final risk categories */
        target.thunder_risk_color = row.thunder_color || "GREY";
        target.hail_risk_color = row.hail_color || "GREY";
        target.large_hail_risk_color = row.large_hail_color || "GREY";
        target.very_large_hail_risk_color = row.very_large_hail_color || "GREY";

        /* Confidence */
        target.thunder_confidence = row.thunder_confidence || "UNKNOWN";
        target.hail_confidence = row.hail_confidence || "UNKNOWN";
        target.large_hail_confidence = row.large_hail_confidence || "UNKNOWN";
        target.very_large_hail_confidence = row.very_large_hail_confidence || "UNKNOWN";

        /* Individual model signals.
           The central 24h backend uses model-first column names:
           ecmwf_thunder / ecmwf_hail / ecmwf_large_hail etc. */
        target.thunder_ecmwf = optionalNumber(row.ecmwf_thunder);
        target.thunder_icon = optionalNumber(row.icon_thunder);
        target.thunder_gefs = optionalNumber(row.gefs_thunder);

        target.hail_ecmwf = optionalNumber(row.ecmwf_hail);
        target.hail_icon = optionalNumber(row.icon_hail);
        target.hail_gefs = optionalNumber(row.gefs_hail);

        target.large_hail_ecmwf = optionalNumber(row.ecmwf_large_hail);
        target.large_hail_icon = optionalNumber(row.icon_large_hail);
        target.large_hail_gefs = optionalNumber(row.gefs_large_hail);

        target.very_large_hail_ecmwf = optionalNumber(row.ecmwf_very_large_hail);
        target.very_large_hail_icon = optionalNumber(row.icon_very_large_hail);
        target.very_large_hail_gefs = optionalNumber(row.gefs_very_large_hail);

        /* Per-hazard agreement diagnostics */
        ["thunder", "hail", "large_hail", "very_large_hail"].forEach(prefix => {
            target[prefix + "_models_available"] =
                optionalNumber(row[prefix + "_models_available"]);

            target[prefix + "_model_spread"] =
                optionalNumber(row[prefix + "_model_spread"]);

            target[prefix + "_models_ge10"] =
                optionalNumber(row[prefix + "_models_ge10"]);

            target[prefix + "_models_ge40"] =
                optionalNumber(row[prefix + "_models_ge40"]);

            target[prefix + "_models_ge50"] =
                optionalNumber(row[prefix + "_models_ge50"]);

            target[prefix + "_dominant_model"] =
                row[prefix + "_dominant_model"] || "";

            target[prefix + "_source_models"] =
                row[prefix + "_source_models"] || "";
        });

        target.storm_overview_color =
            row.storm_overview_color || "GREY";

        target.storm_overview_confidence =
            row.storm_overview_confidence || "UNKNOWN";

        target.storm_dominant_hazard =
            row.storm_dominant_hazard || "NONE";

        /* Slot metadata from the multimodel product */
        target.storm_valid_time = row.valid_time || "";
        target.storm_reference_run = row.reference_run || "";
        target.storm_gefs_forecast_hour =
            optionalNumber(row.gefs_forecast_hour);

        if (!slotSourceModels) {
            slotSourceModels =
                row.thunder_source_models
                || row.hail_source_models
                || "";
        }

        matched += 1;
    });

    data.storms_multimodel = matched > 0;
    data.storms_multimodel_matches = matched;
    data.storms_multimodel_source =
        slotSourceModels || "ECMWF ENS | GEFS";
    data.storms_multimodel_note =
        "Developmental multimodel risk signal; not a calibrated probability.";

    return data;
}


/* ============================================================
   MAXIMUM TEMPERATURE - GEFS + ICON-EU EPS DAILY MULTIMODEL
   ============================================================ */

function localTodayKey() {
    return localDateKeyBelgrade(
        new Date().toISOString()
    );
}


function startOfLocalToday() {
    const today = localTodayKey();

    return new Date(
        today + "T00:00:00+02:00"
    );
}


function hazardAvailability() {
    return {
        storm:
            Boolean(
                currentModelData
                && currentModelData.storms_available
            ),

        wind:
            Boolean(
                currentModelData
                && currentModelData.wind_available
            ),

        temperature:
            Boolean(
                currentModelData
                && currentModelData.temperature_available
            )
    };
}


function currentHazardGroup() {
    if (
        ["thunder", "hail", "large_hail", "very_large_hail"].includes(currentHazard)
    ) {
        return "storm";
    }

    if (
        ["wind_risk_level", "wind_10", "wind_17", "wind_24", "wind_28"].includes(currentHazard)
    ) {
        return "wind";
    }

    if (currentHazard === "max_temperature") {
        return "temperature";
    }

    return "overall";
}


function currentHazardAvailable() {
    const group = currentHazardGroup();
    const available = hazardAvailability();

    if (group === "overall") {
        return (
            available.storm
            || available.wind
            || available.temperature
        );
    }

    return Boolean(available[group]);
}


function unavailableHtml(name) {
    const t = translations[currentLanguage];

    return `
        <div class="popup-title">${name}</div>
        <div class="multimodel-card">
            <div class="popup-section">
                ${t.notAvailableForTime}
            </div>
        </div>
    `;
}


function updateHazardAvailabilityLabels() {
    const t = translations[currentLanguage];
    const a = hazardAvailability();

    const status = available =>
        available
        ? ""
        : " — " + t.unavailable;

    document.getElementById("storm-group-label").textContent =
        t.stormGroup + status(a.storm);

    document.getElementById("wind-group-label").textContent =
        t.windGroup + status(a.wind);

    document.getElementById("temperature-group-label").textContent =
        t.temperatureGroup + status(a.temperature);
}


function emptyMunicipalityData() {
    const municipalities = {};

    if (!geometryData) {
        return municipalities;
    }

    geometryData.features.forEach(feature => {
        const id = municipalityId(
            feature.properties || {}
        );

        municipalities[id] = {};
    });

    return municipalities;
}


async function buildTimelineSlots() {
    const forecasts = await loadAllForecasts();
    const now = new Date();

    /*
       Timeline represents TIME, not product availability.

       1. Start at the first 3-hour UTC boundary that is not in the past.
       2. Continue without gaps in 3-hour steps.
       3. End at the latest future horizon covered by ANY product.
       4. Each hazard independently reports AVAILABLE / NOT AVAILABLE
          for every timeline slot.
    */

    const stepMs = 3 * 60 * 60 * 1000;

    const firstMs =
        Math.ceil(now.getTime() / stepMs)
        * stepMs;

    const forecastByTime = new Map();

    let latestForecastMs = firstMs;

    forecasts.forEach((data, index) => {
        const valid = new Date(data.valid_time);

        if (!Number.isFinite(valid.getTime())) {
            return;
        }

        const ms = valid.getTime();

        forecastByTime.set(
            ms,
            index
        );

        if (ms >= now.getTime()) {
            latestForecastMs = Math.max(
                latestForecastMs,
                ms
            );
        }
    });

    /*
       Daily temperature products may extend beyond the last 3-hour model
       product. Keep the continuous 3-hour axis through the whole last
       available local temperature day.
    */
    const allTemperatureDays =
        await loadTemperatureDailyRows();

    const todayKey =
        localTodayKey();

    const futureTemperatureDates =
        Array.from(
            allTemperatureDays.keys()
        )
        .filter(dateKey => dateKey >= todayKey)
        .sort();

    const lastTemperatureDate =
        futureTemperatureDates.length
        ? futureTemperatureDates[
            futureTemperatureDates.length - 1
        ]
        : null;

    const slots = [];

    /*
       Hard safety cap: 10 days. Normally the loop stops much earlier.
    */
    const maxIterations =
        10 * 24 / 3;

    for (
        let i = 0, ms = firstMs;
        i <= maxIterations;
        i += 1, ms += stepMs
    ) {
        const date = new Date(ms);
        const localDate =
            localDateKeyBelgrade(
                date.toISOString()
            );

        const withinForecast =
            ms <= latestForecastMs;

        const withinTemperature =
            Boolean(
                lastTemperatureDate
                && localDate <= lastTemperatureDate
            );

        if (
            !withinForecast
            && !withinTemperature
        ) {
            break;
        }

        const forecastIndex =
            forecastByTime.has(ms)
            ? forecastByTime.get(ms)
            : null;

        slots.push({
            kind:
                forecastIndex !== null
                ? "forecast"
                : "timeline_only",

            valid_time:
                date.toISOString(),

            data_index:
                forecastIndex
        });
    }

    timelineSlots = slots;

    const slider =
        document.getElementById(
            "time-slider"
        );

    slider.min = 0;
    slider.max =
        Math.max(
            0,
            timelineSlots.length - 1
        );
    slider.step = 1;
    slider.value = 0;

    return timelineSlots;
}


async function showTimelineSlot(index) {
    if (!timelineSlots.length) {
        return;
    }

    timelineSlotIndex =
        Math.max(
            0,
            Math.min(
                index,
                timelineSlots.length - 1
            )
        );

    const slot =
        timelineSlots[timelineSlotIndex];

    let data;

    if (
        slot.kind === "forecast"
        && allForecastData
        && allForecastData[slot.data_index]
    ) {
        data = structuredClone(
            allForecastData[slot.data_index]
        );

        data.wind_available = true;

        data.storms_available =
            Boolean(
                data.storms_multimodel
                && data.storms_multimodel_matches > 0
            );

        data.temperature_available =
            Boolean(
                data.temperature_multimodel
                && data.temperature_multimodel_matches > 0
            );

    } else {
        /*
           No sub-daily model product exists at this exact time.
           Keep the time slot, mark storm/wind unavailable, and attach the
           daily Tmax product when its local calendar date is available.
        */
        data = {
            valid_time: slot.valid_time,
            model_run: null,
            municipalities:
                emptyMunicipalityData(),
            storms_multimodel: false,
            storms_available: false,
            wind_available: false,
            temperature_multimodel: false,
            temperature_available: false
        };

        await applyTemperatureOverlay(
            data
        );

        data.temperature_available =
            Boolean(
                data.temperature_multimodel
                && data.temperature_multimodel_matches > 0
            );
    }

    /* Never interpret missing storm data as the older GEFS storm signal.
       The final storm product is available only where the multimodel
       STORMS file exists for the selected valid time. */
    if (!data.storms_available) {
        data.storms_multimodel = false;
    }

    currentModelData = data;

    document.getElementById("time-slider").value =
        timelineSlotIndex;

    updateTimelineLabels();
    updateHeader();
    updateHazardAvailabilityLabels();
    updateLegend();
    redrawMap();
    restoreSelectedMunicipality();
    updateTimeButtons();

    if (
        selectedLayer
        && isMobileView()
        && document.getElementById("mobile-detail-panel").classList.contains("open")
    ) {
        openMobileDetail(
            selectedLayer.feature.properties
        );
    }
}




function hazardModelSignalsHtml(data, hazardKey) {
    const prefix = stormHazardPrefix(hazardKey);
    const ecmwf = data[prefix + "_ecmwf"];
    const icon = data[prefix + "_icon"];
    const gefs = data[prefix + "_gefs"];

    if (
        !Number.isFinite(Number(ecmwf))
        && !Number.isFinite(Number(icon))
        && !Number.isFinite(Number(gefs))
    ) {
        return "";
    }

    const t = translations[currentLanguage];

    return `
        <div class="popup-section">${t.modelSignals}</div>
        <div class="multimodel-model-grid">
            <div><span>ECMWF ENS</span><b>${formatProbability(ecmwf)}</b></div>
            <div><span>ICON-EU EPS</span><b>${formatProbability(icon)}</b></div>
            <div><span>GEFS</span><b>${formatProbability(gefs)}</b></div>
        </div>
    `;
}

function multimodelStormDetailHtml(data, hazardKey) {
    if (!data || !data.storms_multimodel) return "";

    const t = translations[currentLanguage];
    const prefix = stormHazardPrefix(hazardKey);
    const signal = data[hazardKey];
    const riskColor = data[prefix + "_risk_color"];
    const confidence = data[prefix + "_confidence"];
    const dominantModel = data[prefix + "_dominant_model"];
    const sourceModels = data[prefix + "_source_models"];
    const modelsAvailable = data[prefix + "_models_available"];
    const modelSpread = data[prefix + "_model_spread"];

    const dominantModelRow =
        dominantModel
        ? `
            <div class="popup-row">
                ${t.dominantModel}:
                <b>${dominantModel}</b>
            </div>
        `
        : "";

    const availabilityRow =
        Number.isFinite(Number(modelsAvailable))
        ? `
            <div class="popup-row">
                ${currentLanguage === "sr" ? "Доступни модели" : "Models available"}:
                <b>${Number(modelsAvailable).toFixed(0)}/3</b>
            </div>
        `
        : "";

    const sourceModelsRow =
        sourceModels
        ? `
            <div class="popup-row">
                ${currentLanguage === "sr" ? "Модели у процени" : "Models used"}:
                <b>${translatedModelAvailability(sourceModels)}</b>
            </div>
        `
        : "";

    const spreadRow =
        Number.isFinite(Number(modelSpread))
        ? `
            <div class="popup-row">
                ${currentLanguage === "sr" ? "Распон сигнала модела" : "Model signal spread"}:
                <b>${formatProbability(modelSpread)}</b>
            </div>
        `
        : "";

    return `
        <div class="multimodel-card">
            <div class="popup-section">
                ${currentLanguage === "sr"
                    ? "Мултимоделска процена"
                    : "Multimodel assessment"}
            </div>

            <div class="popup-row">
                ${currentLanguage === "sr" ? "Мултимоделски сигнал" : "Multimodel signal"}:
                <b>${formatProbability(signal)}</b>
            </div>

            <div class="popup-row">
                ${t.risk}:
                <b>${translatedStormRiskColor(riskColor)}</b>
            </div>

            <div class="popup-row">
                ${t.confidence}:
                <b>${translatedConfidence(confidence)}</b>
            </div>

            ${availabilityRow}
            ${sourceModelsRow}
            ${dominantModelRow}
            ${spreadRow}
            ${hazardModelSignalsHtml(data, hazardKey)}

            <div class="popup-note">
                ${currentLanguage === "sr"
                    ? "Приказана вредност је развојни мултимоделски сигнал ризика, а не калибрисана вероватноћа. Недоступан модел се не третира као 0%. Ниво ризика и поузданост су одвојене информације."
                    : "The displayed value is a developmental multimodel risk signal, not a calibrated probability. An unavailable model is not treated as 0%. Risk level and confidence are separate information."}
            </div>
        </div>
    `;
}


/* ============================================================
   HAZARD INFO
   ============================================================ */

function hazardInfoFor(hazardKey) {

    if (!hazardInfo) {
        return null;
    }

    const hazard = hazardInfo[hazardKey];

    if (!hazard) {
        return null;
    }

    return hazard[currentLanguage] || null;
}


function currentHazardInfo() {
    return hazardInfoFor(currentHazard);
}


function hazardInfoHtmlForHazard(
    hazardKey,
    data
) {

    const info = hazardInfoFor(hazardKey);
    const t = translations[currentLanguage];

    if (!info || !data) {
        return "";
    }

    const probability = Number(data[hazardKey]);

    /* Storm hazards are significant from 10% upward. */
    if (!Number.isFinite(probability) || probability < 10) {
        return "";
    }

    const impacts = Array.isArray(info.impacts) ? info.impacts : [];
    const recommendations = Array.isArray(info.recommendations) ? info.recommendations : [];

    if (!impacts.length && !recommendations.length) {
        return "";
    }

    return `
        <div class="popup-risk-box">
            ${impacts.length ? `
                <div class="popup-section">${info.impact_title}</div>
                <ul>${impacts.map(item => `<li>${item}</li>`).join("")}</ul>
            ` : ""}

            ${recommendations.length ? `
                <div class="popup-section">${info.recommendation_title}</div>
                <ul>${recommendations.map(item => `<li>${item}</li>`).join("")}</ul>
            ` : ""}

            <div class="popup-note">${t.riskNote}</div>
        </div>
    `;
}


function hazardInfoHtml(data) {
    return hazardInfoHtmlForHazard(currentHazard, data);
}


function stormHazardLabel(hazardKey) {
    const t = translations[currentLanguage];

    const labels = {
        thunder: t.thunder,
        hail: t.hail,
        large_hail: t.largeHail,
        very_large_hail: t.veryLargeHail
    };

    return labels[hazardKey] || hazardKey;
}


function windThresholdForYellow(hazardKey) {
    const thresholds = {
        wind_10: 20,
        wind_17: 10,
        wind_24: 5,
        wind_28: 5
    };

    return thresholds[hazardKey] ?? Infinity;
}


function overallPopupHazardsHtml(data) {

    const availability = hazardAvailability();
    const availabilityText = `
        <div class="multimodel-card">
            <div class="popup-section">
                ${currentLanguage === "sr" ? "Доступност производа" : "Product availability"}
            </div>
            <div class="popup-row">
                ${translations[currentLanguage].stormGroup}:
                <b>${availability.storm
                    ? translations[currentLanguage].available
                    : translations[currentLanguage].unavailable}</b>
            </div>
            <div class="popup-row">
                ${translations[currentLanguage].windGroup}:
                <b>${availability.wind
                    ? translations[currentLanguage].available
                    : translations[currentLanguage].unavailable}</b>
            </div>
            <div class="popup-row">
                ${translations[currentLanguage].temperatureGroup}:
                <b>${availability.temperature
                    ? translations[currentLanguage].available
                    : translations[currentLanguage].unavailable}</b>
            </div>
        </div>
    `;


    const t = translations[currentLanguage];
    const stormKeys = ["thunder", "hail", "large_hail", "very_large_hail"];
    const windKeys = ["wind_10", "wind_17", "wind_24", "wind_28"];

    let html = "";
    let significantCount = 0;

    /* --------------------------------------------------------
       STORM: show ONLY yellow-or-higher parameters (>=10%).
       Each significant storm parameter gets its own impacts
       and recommendations from hazard_info.json.
       -------------------------------------------------------- */

    stormKeys.forEach(hazardKey => {
        const probability = Number(data[hazardKey]);

        if (data.storms_multimodel) {
            const prefix = stormHazardPrefix(hazardKey);
            const riskColor = data[prefix + "_risk_color"];

            if (stormColorLevelNumber(riskColor) < 1) {
                return;
            }

            significantCount += 1;

            html += `
                <div class="popup-section">${stormHazardLabel(hazardKey)}</div>
                <div class="popup-row">
                    ${currentLanguage === "sr" ? "Мултимоделски сигнал" : "Multimodel signal"}:
                    <b>${formatProbability(probability)}</b>
                </div>
                <div class="popup-row">${t.risk}: <b>${translatedStormRiskColor(riskColor)}</b></div>
                <div class="popup-row">${t.confidence}: <b>${translatedConfidence(data[prefix + "_confidence"])}</b></div>
                ${hazardModelSignalsHtml(data, hazardKey)}
                ${hazardInfoHtmlForHazard(hazardKey, data)}
            `;
            return;
        }

        if (!Number.isFinite(probability) || probability < 10) {
            return;
        }

        significantCount += 1;

        html += `
            <div class="popup-section">${stormHazardLabel(hazardKey)}</div>
            <div class="popup-row">
                ${currentLanguage === "sr" ? "Ансамбл сигнал" : "Ensemble signal"}:
                <b>${formatProbability(probability)}</b>
            </div>
            ${hazardInfoHtmlForHazard(hazardKey, data)}
        `;
    });

    /* --------------------------------------------------------
       MAXIMUM TEMPERATURE: one daily severity category.
       Show only yellow-or-higher in the combined popup.
       -------------------------------------------------------- */

    if (
        data.temperature_multimodel
        &&
        stormColorLevelNumber(
            data.temperature_color
        ) >= 1
    ) {
        significantCount += 1;

        html += `
            <div class="popup-section">
                ${t.maxTemperature}
            </div>

            <div class="popup-row">
                ${t.multimodelTmax}:
                <b>${formatNumber(data.max_temperature, 1)} °C</b>
            </div>

            <div class="popup-row">
                ${t.temperatureCategory}:
                <b>${translatedTemperatureCategory(data)}</b>
            </div>

            <div class="popup-row">
                ${t.categoryProbability}:
                <b>${formatProbability(data.temperature_category_probability)}</b>
            </div>

            <div class="popup-row">
                ${t.warmestPeriod}:
                <b>${data.temperature_warmest_period || "—"}</b>
            </div>
        `;
    }


    /* --------------------------------------------------------
       WIND: show the group only when final wind risk is yellow
       or higher. Inside it, show only wind thresholds that have
       reached their own yellow probability threshold.
       -------------------------------------------------------- */

    const windLevel = String(data.wind_risk_level || "green").toLowerCase();

    if (windLevel !== "green") {
        significantCount += 1;

        const windLabels = {
            wind_10: t.wind10,
            wind_17: t.wind17,
            wind_24: t.wind24,
            wind_28: t.wind28
        };

        let windRows = "";

        windKeys.forEach(hazardKey => {
            const probability = Number(data[hazardKey]);
            const threshold = windThresholdForYellow(hazardKey);

            if (!Number.isFinite(probability) || probability < threshold) {
                return;
            }

            windRows += `
                <div class="popup-row">
                    ${windLabels[hazardKey]}:
                    <b>${formatProbability(probability)}</b>
                </div>
            `;
        });

        const riskNamesSr = {
            yellow: "низак",
            orange: "умерен",
            red: "висок"
        };

        const riskNamesEn = {
            yellow: "low",
            orange: "moderate",
            red: "high"
        };

        html += `
            <div class="popup-section">${t.windGroup}</div>

            <div class="popup-row">
                ${currentLanguage === "sr" ? "Ниво ризика" : "Risk level"}:
                <b>${currentLanguage === "sr" ? (riskNamesSr[windLevel] || windLevel) : (riskNamesEn[windLevel] || windLevel)}</b>
            </div>

            ${windRows}

            <div class="popup-row">
                ${currentLanguage === "sr" ? "Очекивани удари" : "Expected gusts"}:
                <b>${formatNumber(data.gust_median,1)}–${formatNumber(data.gust_p90,1)} m/s (${formatNumber(Number(data.gust_median)*3.6,0)}–${formatNumber(Number(data.gust_p90)*3.6,0)} km/h)</b>
            </div>

            <div class="popup-row">
                ${currentLanguage === "sr" ? "Ветар" : "Wind"}:
                <b>${formatNumber(data.wind_speed,1)} m/s, ${data.wind_direction_text ?? "—"} (${formatNumber(data.wind_direction,0)}°)</b>
            </div>

            <div class="popup-risk-box">
                <div class="popup-section">${currentLanguage === "sr" ? "Утицаји" : "Impacts"}</div>
                <div>${currentLanguage === "sr" ? (data.wind_impacts_sr ?? "—") : (data.wind_impacts_en ?? data.wind_impacts_sr ?? "—")}</div>

                <div class="popup-section">${currentLanguage === "sr" ? "Препоруке" : "Recommendations"}</div>
                <div>${currentLanguage === "sr" ? (data.wind_recommendations_sr ?? "—") : (data.wind_recommendations_en ?? data.wind_recommendations_sr ?? "—")}</div>

                <div class="popup-note">${t.riskNote}</div>
            </div>
        `;
    }

    if (significantCount === 0) {
        return `
            <div class="overview-muted">
                ${currentLanguage === "sr"
                    ? "Нема параметара са значајним ризиком у овом 3-часовном термину."
                    : "No parameters with significant risk in this 3-hour period."}
            </div>
        `;
    }

    return availabilityText + html;
}


/* ============================================================
   DATE FORMAT
   ============================================================ */

function formatValidTime(
    isoString
) {

    if (!isoString) {
        return "—";
    }

    const date =
        new Date(
            isoString
        );

    if (
        currentLanguage === "sr"
    ) {

        return (
            date.toLocaleDateString(
                "sr-RS",
                {
                    timeZone: "UTC",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            )
            +
            " "
            +
            String(
                date.getUTCHours()
            ).padStart(2, "0")
            +
            " UTC"
        );
    }

    return (
        date.toLocaleString(
            "en-GB",
            {
                timeZone: "UTC",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }
        )
        +
        " UTC"
    );
}


/* ============================================================
   COLORS
   ============================================================ */

function getProbabilityColor(
    value
) {

    if (
        value === null
        || value === undefined
        || isNaN(value)
    ) {
        return "#cccccc";
    }

    if (value >= 50) {
        return "#7b3294";
    }

    if (value >= 30) {
        return "#d7191c";
    }

    if (value >= 20) {
        return "#fdae61";
    }

    if (value >= 10) {
        return "#ffffbf";
    }

    return "#a6d96a";
}


/* ============================================================
   STYLE
   ============================================================ */

function stormRiskLevel(data) {
    if (!data || !currentModelData?.storms_available) return 0;

    if (data.storms_multimodel && data.storm_overview_color) {
        return stormColorLevelNumber(data.storm_overview_color);
    }

    let strongest = 0;

    ["thunder", "hail", "large_hail", "very_large_hail"].forEach(key => {
        const value = Number(data[key]);
        if (!Number.isFinite(value)) return;
        const level =
            value >= 50 ? 4 :
            value >= 30 ? 3 :
            value >= 20 ? 2 :
            value >= 10 ? 1 : 0;
        strongest = Math.max(strongest, level);
    });

    return strongest;
}

function windRiskLevel(data) {
    if (!data || !currentModelData?.wind_available) return 0;
    const levels = {green:0, yellow:1, orange:2, red:3, purple:4};
    return levels[String(data.wind_risk_level || "green").toLowerCase()] ?? 0;
}

function temperatureRiskLevel(data) {
    if (
        !data
        || !currentModelData?.temperature_available
        || !data.temperature_multimodel
    ) return 0;

    return stormColorLevelNumber(
        data.temperature_color
    );
}


function overallRiskLevel(data) {
    return Math.max(
        stormRiskLevel(data),
        windRiskLevel(data),
        temperatureRiskLevel(data)
    );
}

function overallRiskColor(level) {
    return ["#a6d96a", "#ffffbf", "#fdae61", "#d7191c", "#7b3294"][level] || "#a6d96a";
}

function styleFeature(
    feature
) {

    const data =
        getMunicipalityData(
            feature.properties
        );

    const value = data ? data[currentHazard] : null;

    let fillColor;

    const available =
        hazardAvailability();

    const group =
        currentHazardGroup();

    if (
        group !== "overall"
        && !available[group]
    ) {
        fillColor = "#c7c7c7";

    } else if (currentHazard === "overall_risk") {
        fillColor =
            (
                available.storm
                || available.wind
                || available.temperature
            )
            ? (
                data
                ? overallRiskColor(overallRiskLevel(data))
                : "#cccccc"
            )
            : "#c7c7c7";
    } else if (currentHazard === "wind_risk_level") {
        const windRiskColors = {green:"#a6d96a", yellow:"#ffffbf", orange:"#fdae61", red:"#d7191c"};
        fillColor = windRiskColors[String(value || "green").toLowerCase()] || "#cccccc";
    } else if (["wind_10","wind_17","wind_24","wind_28"].includes(currentHazard)) {
        const thresholds = {
            wind_10:[20,50,80], wind_17:[10,30,60], wind_24:[5,15,30], wind_28:[5,10,20]
        }[currentHazard];
        const n = Number(value);
        fillColor = !Number.isFinite(n) ? "#cccccc" : n >= thresholds[2] ? "#d7191c" : n >= thresholds[1] ? "#fdae61" : n >= thresholds[0] ? "#ffffbf" : "#a6d96a";
    } else if (
        currentHazard === "max_temperature"
        && data
        && data.temperature_multimodel
    ) {
        fillColor = stormRiskColor(
            data.temperature_color
        );
    } else if (
        ["thunder", "hail", "large_hail", "very_large_hail"].includes(currentHazard)
        && data
        && data.storms_multimodel
    ) {
        const prefix = stormHazardPrefix(currentHazard);
        fillColor = stormRiskColor(
            data[prefix + "_risk_color"]
        );
    } else {
        fillColor = getProbabilityColor(value);
    }

    return {

        fillColor: fillColor,

        weight: 1,

        opacity: 1,

        color: "#555",

        fillOpacity:
            data ? 0.72 : 0.25
    };
}


/* ============================================================
   POPUP
   ============================================================ */

function popupContent(
    properties
) {

    const t = translations[currentLanguage];
    const data = getMunicipalityData(properties);
    const name = municipalityName(properties);

    if (!data) {
        return `
            <div class="popup-title">${name}</div>
            <div>${t.loadError}</div>
        `;
    }

    if (
        currentHazard !== "overall_risk"
        && !currentHazardAvailable()
    ) {
        return unavailableHtml(name);
    }

    /* ========================================================
       CENTRAL / OVERALL MAP
       Only yellow-or-higher hazards are shown.
       ======================================================== */

    if (currentHazard === "overall_risk") {
        return `
            <div class="popup-title">${name}</div>

            <div class="popup-valid">
                ${t.valid}: ${formatValidTime(currentModelData.valid_time)}
                <br>
                ${t.lead}: ${formatLeadHour(currentModelData.valid_time)}
            </div>

            ${overallPopupHazardsHtml(data)}
        `;
    }

    /* ========================================================
       DETAIL MODE - WIND
       ======================================================== */

    if (["wind_risk_level", "wind_10", "wind_17", "wind_24", "wind_28"].includes(currentHazard)) {

        const windRows = currentHazard === "wind_risk_level"
            ? `
                <div class="popup-row">${t.wind10}: <b>${formatProbability(data.wind_10)}</b></div>
                <div class="popup-row">${t.wind17}: <b>${formatProbability(data.wind_17)}</b></div>
                <div class="popup-row">${t.wind24}: <b>${formatProbability(data.wind_24)}</b></div>
                <div class="popup-row">${t.wind28}: <b>${formatProbability(data.wind_28)}</b></div>
            `
            : `
                <div class="popup-row">
                    ${currentHazard === "wind_10" ? t.wind10 : currentHazard === "wind_17" ? t.wind17 : currentHazard === "wind_24" ? t.wind24 : t.wind28}:
                    <b>${formatProbability(data[currentHazard])}</b>
                </div>
            `;

        return `
            <div class="popup-title">${name}</div>

            <div class="popup-valid">
                ${t.valid}: ${formatValidTime(currentModelData.valid_time)}
                <br>
                ${t.lead}: ${formatLeadHour(currentModelData.valid_time)}
            </div>

            <div class="popup-section">${t.windGroup}</div>
            ${windRows}

            <div class="popup-row">
                ${currentLanguage === "sr" ? "Очекивани удари" : "Expected gusts"}:
                <b>${formatNumber(data.gust_median,1)}–${formatNumber(data.gust_p90,1)} m/s (${formatNumber(Number(data.gust_median)*3.6,0)}–${formatNumber(Number(data.gust_p90)*3.6,0)} km/h)</b>
            </div>

            <div class="popup-row">
                ${currentLanguage === "sr" ? "Ветар" : "Wind"}:
                <b>${formatNumber(data.wind_speed,1)} m/s, ${data.wind_direction_text ?? "—"} (${formatNumber(data.wind_direction,0)}°)</b>
            </div>

            ${data.wind_risk_level && data.wind_risk_level !== "green" ? `
                <div class="popup-risk-box">
                    <div class="popup-section">${currentLanguage === "sr" ? "Утицаји" : "Impacts"}</div>
                    <div>${currentLanguage === "sr" ? (data.wind_impacts_sr ?? "—") : (data.wind_impacts_en ?? data.wind_impacts_sr ?? "—")}</div>
                    <div class="popup-section">${currentLanguage === "sr" ? "Препоруке" : "Recommendations"}</div>
                    <div>${currentLanguage === "sr" ? (data.wind_recommendations_sr ?? "—") : (data.wind_recommendations_en ?? data.wind_recommendations_sr ?? "—")}</div>
                    <div class="popup-note">${t.riskNote}</div>
                </div>
            ` : ""}
        `;
    }

    /* ========================================================
       DETAIL MODE - MULTIMODEL STORMS
       ======================================================== */

    if (currentHazard === "max_temperature") {

        return `
            <div class="popup-title">${name}</div>

            <div class="popup-valid">
                ${currentLanguage === "sr" ? "Дневна прогноза" : "Daily forecast"}:
                ${data.temperature_date || "—"}
            </div>

            ${temperatureDetailHtml(data)}
        `;
    }


    if (
        ["thunder", "hail", "large_hail", "very_large_hail"].includes(currentHazard)
        && data.storms_multimodel
    ) {
        return `
            <div class="popup-title">${name}</div>

            <div class="popup-valid">
                ${t.valid}: ${formatValidTime(currentModelData.valid_time)}
                <br>
                ${t.lead}: ${formatLeadHour(currentModelData.valid_time)}
            </div>

            <div class="popup-section">${stormHazardLabel(currentHazard)}</div>

            ${multimodelStormDetailHtml(data, currentHazard)}

            ${hazardInfoHtmlForHazard(currentHazard, data)}
        `;
    }

    /* ========================================================
       DETAIL MODE - STORM PARAMETER
       ======================================================== */

    const hazardLabels = {
        thunder: t.thunder,
        hail: t.hail,
        large_hail: t.largeHail,
        very_large_hail: t.veryLargeHail
    };

    return `
        <div class="popup-title">${name}</div>

        <div class="popup-valid">
            ${t.valid}: ${formatValidTime(currentModelData.valid_time)}
            <br>
            ${t.lead}: ${formatLeadHour(currentModelData.valid_time)}
        </div>

        <div class="popup-section">${hazardLabels[currentHazard] || currentHazard}</div>

        <div class="popup-row">
            ${currentLanguage === "sr" ? "Ансамбл сигнал" : "Ensemble signal"}:
            <b>${formatProbability(data[currentHazard])}</b>
        </div>

        <div class="popup-section">${t.modelParameters}</div>

        <div class="popup-row">${t.instability}: <b>${formatNumber(data.cape,0)} J/kg</b></div>
        <div class="popup-row">${t.shear}: <b>${formatNumber(data.shear,1)} m/s</b></div>
        <div class="popup-row">${t.humidity}: <b>${formatNumber(data.rh700,0)}%</b></div>
        <div class="popup-row">${t.grid}: <b>${data.grid_points ?? "—"}</b></div>

        ${hazardInfoHtmlForHazard(currentHazard, data)}
    `;
}


/* ============================================================
   MOBILE DETAIL PANEL
   ============================================================ */

function isMobileView() {
    return window.matchMedia("(max-width: 800px)").matches;
}

function openMobileDetail(properties) {
    if (!isMobileView()) return false;

    const panel = document.getElementById("mobile-detail-panel");
    const heading = document.getElementById("mobile-detail-heading");
    const body = document.getElementById("mobile-detail-body");

    heading.textContent = municipalityName(properties);
    body.innerHTML = popupContent(properties);

    /* The panel header already contains the municipality name. */
    const duplicateTitle = body.querySelector(".popup-title");
    if (duplicateTitle) duplicateTitle.remove();

    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("mobile-detail-open");
    panel.scrollTop = 0;
    map.closePopup();
    return true;
}

function closeMobileDetail() {
    const panel = document.getElementById("mobile-detail-panel");
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mobile-detail-open");
}

document.getElementById("mobile-detail-close").addEventListener("click", closeMobileDetail);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeMobileDetail();
        closeOverview();
    }
});

/* ============================================================
   FEATURE EVENTS
   ============================================================ */

function highlightFeature(
    event
) {

    event.target.setStyle(
        {
            weight: 3,
            color: "#222",
            fillOpacity: 0.85
        }
    );

    event.target.bringToFront();
}


function resetHighlight(
    event
) {

    if (
        geojsonLayer
    ) {

        geojsonLayer.resetStyle(
            event.target
        );
    }
}


function onEachFeature(
    feature,
    layer
) {

    layer.bindPopup(
        popupContent(
            feature.properties
        ),
        {
            maxWidth: 420
        }
    );


    layer.on(
        {

            mouseover:
                highlightFeature,

            mouseout:
                resetHighlight,

            click:
                function() {

                    selectedLayer =
                        this;

                    selectedMunicipalityId =
                        municipalityId(
                            feature.properties
                        );

                    if (openMobileDetail(feature.properties)) {
                        return;
                    }

                    this.setPopupContent(
                        popupContent(
                            feature.properties
                        )
                    );
                }
        }
    );
}


/* ============================================================
   LOAD MODEL DATA
   ============================================================ */

async function loadForecast(
    timeIndex
) {

    const t =
        translations[
            currentLanguage
        ];

    timeIndex =
        Math.max(
            0,
            Math.min(
                timeIndex,
                FORECAST_HOURS.length - 1
            )
        );

    const hour =
        FORECAST_HOURS[
            timeIndex
        ];

    document
        .querySelector(
            ".timeline-panel"
        )
        .classList.add(
            "loading-time"
        );

    try {

        const baseGefHour =
            await baseGefForecastHourForSlot(
                hour
            );

        const response =
            await fetch(
                forecastFile(
                    baseGefHour
                ),
                {
                    cache:
                        "no-store"
                }
            );

        if (
            !response.ok
        ) {

            throw new Error(
                "HTTP "
                +
                response.status
            );
        }

        const data =
            await response.json();

        await applyMultimodelStormsOverlay(
            data,
            hour
        );

        await applyTemperatureOverlay(
            data
        );

        currentModelData =
            data;

        currentTimeIndex =
            timeIndex;

        currentForecastHour =
            hour;

        document
            .getElementById(
                "time-slider"
            )
            .value =
                timeIndex;

        updateTimelineLabels();

        updateHeader();

        updateLegend();

        redrawMap();

        restoreSelectedMunicipality();

        if (selectedLayer && isMobileView() && document.getElementById("mobile-detail-panel").classList.contains("open")) {
            openMobileDetail(selectedLayer.feature.properties);
        }

        updateTimeButtons();

    }

    catch (error) {

        console.error(
            error
        );

        showStatus(
            t.loadError,
            5000
        );
    }

    finally {

        document
            .querySelector(
                ".timeline-panel"
            )
            .classList.remove(
                "loading-time"
            );
    }
}


/* ============================================================
   REDRAW
   ============================================================ */

function redrawMap() {

    if (
        !geojsonLayer
    ) {
        return;
    }

    geojsonLayer.setStyle(
        styleFeature
    );

    geojsonLayer.eachLayer(
        layer => {

            if (
                layer.feature
                &&
                layer.feature.properties
            ) {

                layer.setPopupContent(
                    popupContent(
                        layer.feature.properties
                    )
                );
            }
        }
    );
}


/* ============================================================
   RESTORE SELECTED MUNICIPALITY
   ============================================================ */

function restoreSelectedMunicipality() {

    if (
        !selectedMunicipalityId
        ||
        !geojsonLayer
    ) {
        return;
    }

    geojsonLayer.eachLayer(
        layer => {

            const id =
                municipalityId(
                    layer.feature.properties
                );

            if (
                id ===
                selectedMunicipalityId
            ) {

                selectedLayer =
                    layer;

                layer.setPopupContent(
                    popupContent(
                        layer.feature.properties
                    )
                );

                if (
                    layer.isPopupOpen()
                ) {

                    layer.openPopup();
                }
            }
        }
    );
}


/* ============================================================
   INITIALIZE DATA
   ============================================================ */

async function initializeData() {

    try {

        /* ----------------------------------------------------
           HAZARD INFO
           ---------------------------------------------------- */

        const hazardResponse =
            await fetch(
                HAZARD_INFO_FILE,
                {
                    cache:
                        "no-store"
                }
            );

        if (
            !hazardResponse.ok
        ) {

            throw new Error(
                "Hazard info HTTP "
                +
                hazardResponse.status
            );
        }

        hazardInfo =
            await hazardResponse.json();


        /* ----------------------------------------------------
           GEOMETRY
           ---------------------------------------------------- */

        const response =
            await fetch(
                GEOMETRY_FILE
            );

        if (
            !response.ok
        ) {

            throw new Error(
                "Geometry HTTP "
                +
                response.status
            );
        }

        geometryData =
            await response.json();


        /* ----------------------------------------------------
           AVAILABILITY-AWARE TIMELINE
           ---------------------------------------------------- */

        await loadAllForecasts();

        await buildTimelineSlots();

        if (!timelineSlots.length) {
            throw new Error(
                "No current or future forecast products are available."
            );
        }

        await showTimelineSlot(0);


        /* ----------------------------------------------------
           MAP LAYER
           ---------------------------------------------------- */

        geojsonLayer =
            L.geoJSON(
                geometryData,
                {
                    style:
                        styleFeature,

                    onEachFeature:
                        onEachFeature
                }
            )
            .addTo(
                map
            );


        map.fitBounds(
            geojsonLayer.getBounds(),
            {
                padding:
                    [15,15]
            }
        );


        redrawMap();

    }

    catch (error) {

        console.error(
            error
        );

        showStatus(
            currentLanguage === "sr"
            ? "Грешка при учитавању података."
            : "Error loading data.",
            8000
        );
    }
}


/* ============================================================
   TIMELINE LABELS
   ============================================================ */

function updateTimelineLabels() {

    if (!currentModelData) {
        return;
    }

    const t =
        translations[currentLanguage];

    document.getElementById(
        "valid-time-label"
    ).textContent =
        formatValidTime(
            currentModelData.valid_time
        );

    document.getElementById(
        "lead-time-label"
    ).textContent =
        currentLanguage === "sr"
        ? "Континуирана временска линија · недоступни производи су означени"
        : "Continuous timeline · unavailable products are marked";
}


/* ============================================================
   TIMELINE CONTROLS
   ============================================================ */

function updateTimeButtons() {

    document.getElementById(
        "previous-time"
    ).disabled =
        timelineSlotIndex === 0;

    document.getElementById(
        "next-time"
    ).disabled =
        timelineSlotIndex ===
        timelineSlots.length - 1;
}


document.getElementById(
    "previous-time"
).addEventListener(
    "click",
    () => {
        stopPlay();
        showTimelineSlot(
            timelineSlotIndex - 1
        );
    }
);


document.getElementById(
    "next-time"
).addEventListener(
    "click",
    () => {
        stopPlay();
        showTimelineSlot(
            timelineSlotIndex + 1
        );
    }
);


document.getElementById(
    "time-slider"
).addEventListener(
    "input",
    event => {
        stopPlay();

        showTimelineSlot(
            Number(
                event.target.value
            )
        );
    }
);


/* ============================================================
   PLAY / PAUSE
   ============================================================ */

document
    .getElementById(
        "play-time"
    )
    .addEventListener(
        "click",
        () => {

            if (
                isPlaying
            ) {

                stopPlay();

            } else {

                startPlay();
            }
        }
    );


function startPlay() {

    if (
        isPlaying
    ) {
        return;
    }

    isPlaying =
        true;

    document
        .getElementById(
            "play-time"
        )
        .textContent =
            "⏸";

    playTimer =
        setInterval(
            () => {

                let next =
                    timelineSlotIndex + 1;

                if (
                    next >=
                    timelineSlots.length
                ) {
                    next = 0;
                }

                showTimelineSlot(
                    next
                );

            },
            1300
        );
}


function stopPlay() {

    isPlaying =
        false;

    document
        .getElementById(
            "play-time"
        )
        .textContent =
            "▶";

    if (
        playTimer
    ) {

        clearInterval(
            playTimer
        );

        playTimer =
            null;
    }
}


/* ============================================================
   HAZARD CHANGE
   ============================================================ */

document
    .querySelectorAll(
        ".layer-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function() {

                    currentHazard =
                        this.dataset.layer;

                    document
                        .querySelectorAll(
                            ".layer-button"
                        )
                        .forEach(
                            btn =>
                                btn.classList.remove(
                                    "active"
                                )
                        );

                    this.classList.add(
                        "active"
                    );

                    updateHazardAvailabilityLabels();
                    redrawMap();
                    updateLegend();

                    if (selectedLayer) {
                        const properties = selectedLayer.feature.properties;

                        if (isMobileView() && document.getElementById("mobile-detail-panel").classList.contains("open")) {
                            openMobileDetail(properties);
                        } else {
                            selectedLayer.setPopupContent(popupContent(properties));
                            selectedLayer.openPopup();
                        }
                    }
                }
            );
        }
    );


/* ============================================================
   STORM GROUP
   ============================================================ */

const stormGroupButton =
    document.getElementById("storm-group-button");

const stormSubcontrols =
    document.getElementById("storm-subcontrols");

function setOverallRiskView() {
    currentHazard = "overall_risk";
    document.querySelectorAll(".layer-button").forEach(btn => btn.classList.remove("active"));
    redrawMap();
    updateLegend();

    if (selectedLayer) {
        const properties = selectedLayer.feature.properties;
        if (isMobileView() && document.getElementById("mobile-detail-panel").classList.contains("open")) {
            openMobileDetail(properties);
        } else {
            selectedLayer.setPopupContent(popupContent(properties));
        }
    }
}

function openHazardGroup(group) {
    const stormOpen = group === "storm";
    const windOpen = group === "wind";
    const temperatureOpen = group === "temperature";

    stormSubcontrols.classList.toggle("open", stormOpen);
    stormGroupButton.classList.toggle("open", stormOpen);

    windSubcontrols.classList.toggle("open", windOpen);
    windGroupButton.classList.toggle("open", windOpen);

    temperatureSubcontrols.classList.toggle("open", temperatureOpen);
    temperatureGroupButton.classList.toggle("open", temperatureOpen);

    // Opening a group is navigation only. Until a sub-parameter is chosen,
    // keep the central map on the combined strongest-risk view.
    setOverallRiskView();
    updateHazardAvailabilityLabels();
}

stormGroupButton.addEventListener(
    "click",
    () => {
        if (stormSubcontrols.classList.contains("open")) {
            stormSubcontrols.classList.remove("open");
            stormGroupButton.classList.remove("open");
            setOverallRiskView();
        } else {
            openHazardGroup("storm");
        }
    }
);

const windGroupButton = document.getElementById("wind-group-button");
const windSubcontrols = document.getElementById("wind-subcontrols");

windGroupButton.addEventListener(
    "click",
    () => {
        if (windSubcontrols.classList.contains("open")) {
            windSubcontrols.classList.remove("open");
            windGroupButton.classList.remove("open");
            setOverallRiskView();
        } else {
            openHazardGroup("wind");
        }
    }
);


const temperatureGroupButton =
    document.getElementById("temperature-group-button");

const temperatureSubcontrols =
    document.getElementById("temperature-subcontrols");

temperatureGroupButton.addEventListener(
    "click",
    () => {
        if (temperatureSubcontrols.classList.contains("open")) {
            temperatureSubcontrols.classList.remove("open");
            temperatureGroupButton.classList.remove("open");
            setOverallRiskView();
        } else {
            openHazardGroup("temperature");
        }
    }
);


/* ============================================================
   FIVE-DAY MUNICIPALITY OVERVIEW
   ============================================================ */

async function loadAllForecasts() {

    if (allForecastData) {
        return allForecastData;
    }

    const responses = await Promise.all(
        FORECAST_HOURS.map(
            async hour => {

                const baseGefHour =
                    await baseGefForecastHourForSlot(
                        hour
                    );

                const response = await fetch(
                    forecastFile(baseGefHour),
                    { cache: "no-store" }
                );

                if (!response.ok) {
                    throw new Error(
                        "Forecast HTTP "
                        + response.status
                        + " for f"
                        + String(hour).padStart(3, "0")
                    );
                }

                const data = await response.json();

                await applyMultimodelStormsOverlay(
                    data,
                    hour
                );

                await applyTemperatureOverlay(
                    data
                );

                data.wind_available = true;

                data.storms_available =
                    Boolean(
                        data.storms_multimodel
                        && data.storms_multimodel_matches > 0
                    );

                data.temperature_available =
                    Boolean(
                        data.temperature_multimodel
                        && data.temperature_multimodel_matches > 0
                    );

                return data;
            }
        )
    );

    allForecastData = responses;
    return responses;
}


function formatOverviewMoment(isoString) {

    const date = new Date(isoString);

    if (currentLanguage === "sr") {
        return (
            String(date.getUTCDate()).padStart(2, "0")
            + "."
            + String(date.getUTCMonth() + 1).padStart(2, "0")
            + "."
            + date.getUTCFullYear()
            + ". "
            + String(date.getUTCHours()).padStart(2, "0")
            + " UTC"
        );
    }

    return date.toLocaleString(
        "en-GB",
        {
            timeZone: "UTC",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }
    ) + " UTC";
}


function formatOverviewInterval(startIso, endIso) {

    const start = new Date(startIso);
    const end = new Date(endIso);

    const sameDay =
        start.getUTCFullYear() === end.getUTCFullYear()
        && start.getUTCMonth() === end.getUTCMonth()
        && start.getUTCDate() === end.getUTCDate();

    if (startIso === endIso) {
        return formatOverviewMoment(startIso);
    }

    if (currentLanguage === "sr" && sameDay) {
        return (
            String(start.getUTCDate()).padStart(2, "0")
            + "."
            + String(start.getUTCMonth() + 1).padStart(2, "0")
            + "."
            + start.getUTCFullYear()
            + ". "
            + String(start.getUTCHours()).padStart(2, "0")
            + "–"
            + String(end.getUTCHours()).padStart(2, "0")
            + " UTC"
        );
    }

    if (currentLanguage === "en" && sameDay) {
        return (
            start.toLocaleDateString(
                "en-GB",
                {
                    timeZone: "UTC",
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            )
            + " "
            + String(start.getUTCHours()).padStart(2, "0")
            + "–"
            + String(end.getUTCHours()).padStart(2, "0")
            + " UTC"
        );
    }

    return (
        formatOverviewMoment(startIso)
        + " – "
        + formatOverviewMoment(endIso)
    );
}


function buildRiskWindows(forecasts, municipalityID, hazardKey) {

    const significant = [];
    let maxProbability = 0;

    forecasts.forEach(
        forecast => {

            const municipality =
                forecast.municipalities[municipalityID];

            if (!municipality) {
                return;
            }

            const probability =
                Number(municipality[hazardKey]);

            if (!Number.isFinite(probability)) {
                return;
            }

            maxProbability = Math.max(
                maxProbability,
                probability
            );

            if (probability >= 10) {
                significant.push({
                    valid_time: forecast.valid_time,
                    probability: probability
                });
            }
        }
    );

    if (significant.length === 0) {
        return {
            maxProbability,
            windows: []
        };
    }

    const windows = [];
    let current = {
        start: significant[0].valid_time,
        end: significant[0].valid_time,
        maxProbability: significant[0].probability
    };

    for (let i = 1; i < significant.length; i++) {

        const previousTime =
            new Date(significant[i - 1].valid_time).getTime();

        const currentTime =
            new Date(significant[i].valid_time).getTime();

        const consecutive =
            currentTime - previousTime === 3 * 60 * 60 * 1000;

        if (consecutive) {
            current.end = significant[i].valid_time;
            current.maxProbability = Math.max(
                current.maxProbability,
                significant[i].probability
            );
        } else {
            windows.push(current);
            current = {
                start: significant[i].valid_time,
                end: significant[i].valid_time,
                maxProbability: significant[i].probability
            };
        }
    }

    windows.push(current);

    return {
        maxProbability,
        windows
    };
}


function overviewRiskName(key) {

    const t = translations[currentLanguage];

    const names = {
        thunder: t.thunder.replace("⚡ ", ""),
        hail: t.hail.replace("🧊 ", ""),
        large_hail: t.largeHail.replace("🧊 ", ""),
        very_large_hail: t.veryLargeHail.replace("🧊 ", ""),
        wind_10: t.wind10, wind_17: t.wind17, wind_24: t.wind24, wind_28: t.wind28
    };

    return names[key];
}


function overviewDateKey(isoString) {
    const d = new Date(isoString);
    return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
}

function overviewDayRisk(forecasts, municipalityID, dateKey) {
    // Return the strongest daily risk category across ALL hazards.
    // 0 green, 1 yellow, 2 orange, 3 red, 4 purple.
    let strongest = 0;
    const stormKeys = ["thunder", "hail", "large_hail", "very_large_hail"];
    const windLevel = {green:0, yellow:1, orange:2, red:3, purple:4};

    forecasts.forEach(forecast => {
        if (localDateKeyBelgrade(forecast.valid_time) !== dateKey) return;
        const municipality = forecast.municipalities[municipalityID];
        if (!municipality) return;

        stormKeys.forEach(key => {
            if (municipality.storms_multimodel) {
                const prefix = stormHazardPrefix(key);
                strongest = Math.max(
                    strongest,
                    stormColorLevelNumber(
                        municipality[prefix + "_risk_color"]
                    )
                );
                return;
            }

            const value = Number(municipality[key]);
            if (!Number.isFinite(value)) return;
            const level = value >= 50 ? 4 : value >= 30 ? 3 : value >= 20 ? 2 : value >= 10 ? 1 : 0;
            strongest = Math.max(strongest, level);
        });

        const w = String(municipality.wind_risk_level || "green").toLowerCase();
        strongest = Math.max(strongest, windLevel[w] ?? 0);

        if (municipality.temperature_multimodel) {
            strongest = Math.max(
                strongest,
                stormColorLevelNumber(
                    municipality.temperature_color
                )
            );
        }
    });

    return strongest;
}

function overviewRiskClass(level) {
    return ["risk-green", "risk-yellow", "risk-orange", "risk-red", "risk-purple"][level] || "risk-green";
}

function monthCalendarHtml(year, month, activeDates, forecasts, municipalityID) {
    const locale = currentLanguage === "sr" ? "sr-RS" : "en-GB";
    const monthTitle = new Date(Date.UTC(year, month, 1)).toLocaleDateString(locale, {timeZone:"UTC", month:"long", year:"numeric"});
    const weekdays = currentLanguage === "sr" ? ["ПОН","УТО","СРЕ","ЧЕТ","ПЕТ","СУБ","НЕД"] : ["MON","TUE","WED","THU","FRI","SAT","SUN"];
    const first = new Date(Date.UTC(year, month, 1));
    const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const offset = (first.getUTCDay() + 6) % 7;
    let cells = weekdays.map(day => `<div class="overview-weekday">${day}</div>`).join("");
    for (let i = 0; i < offset; i++) cells += '<div class="overview-day empty"></div>';
    for (let day = 1; day <= days; day++) {
        const key = year + "-" + String(month + 1).padStart(2,"0") + "-" + String(day).padStart(2,"0");
        if (activeDates.has(key)) {
            const riskClass = overviewRiskClass(overviewDayRisk(forecasts, municipalityID, key));
            const selected = overviewSelectedDate === key ? " selected" : "";
            cells += `<button type="button" class="overview-day ${riskClass}${selected}" data-overview-date="${key}">${day}</button>`;
        } else {
            cells += `<div class="overview-day inactive">${day}</div>`;
        }
    }
    return `<div class="overview-calendar"><div class="overview-calendar-title">${monthTitle}</div><div class="overview-calendar-grid">${cells}</div></div>`;
}

function overviewCalendarsHtml(forecasts, municipalityID) {
    const activeDates = new Set(
        forecasts.map(
            f => localDateKeyBelgrade(f.valid_time)
        )
    );

    const firstForecastDate = new Date(
        forecasts[0].valid_time
    );
    const y1 = firstForecastDate.getUTCFullYear();
    const m1 = firstForecastDate.getUTCMonth();
    const second = new Date(Date.UTC(y1, m1 + 1, 1));
    const t = translations[currentLanguage];
    const legendClasses = ["risk-green", "risk-yellow", "risk-orange", "risk-red", "risk-purple"];
    const legend = t.riskLevels.map((label, i) => `<span><i class="overview-calendar-dot ${legendClasses[i]}" style="border-color:${["#78b943","#d9cf35","#ed8d35","#d7191c","#7b3294"][i]}"></i>${label}</span>`).join("");
    return `<div class="overview-calendars">${monthCalendarHtml(y1,m1,activeDates,forecasts,municipalityID)}${monthCalendarHtml(second.getUTCFullYear(),second.getUTCMonth(),activeDates,forecasts,municipalityID)}</div><div class="overview-calendar-legend">${legend}</div>`;
}

function formatOverviewDateKey(dateKey) {
    const [y,m,d] = dateKey.split("-");
    return currentLanguage === "sr" ? `${d}.${m}.${y}.` : `${d}/${m}/${y}`;
}


function temperatureOverviewGroupHtml(
    forecasts,
    municipalityID
) {
    const t = translations[currentLanguage];

    const byDate = new Map();

    forecasts.forEach(forecast => {
        const dateKey =
            localDateKeyBelgrade(
                forecast.valid_time
            );

        const municipality =
            forecast.municipalities[
                municipalityID
            ];

        if (
            !dateKey
            || !municipality
            || !municipality.temperature_multimodel
        ) {
            return;
        }

        /* One daily Tmax product per local calendar date. */
        if (!byDate.has(dateKey)) {
            byDate.set(
                dateKey,
                municipality
            );
        }
    });

    const dates =
        Array.from(
            byDate.keys()
        )
        .sort()
        .filter(dateKey =>
            !overviewSelectedDate
            || dateKey === overviewSelectedDate
        );

    if (!dates.length) {
        return `
            <div class="overview-group">
                <div class="overview-group-title">
                    ${t.temperatureGroup}
                </div>
                <div class="overview-risk">
                    <div class="overview-muted">
                        ${t.notAvailableForTime || (currentLanguage === "sr"
                            ? "Није доступно за изабрани термин"
                            : "Not available for the selected time")}
                    </div>
                </div>
            </div>
        `;
    }

    let items = "";

    dates.forEach(dateKey => {
        const data =
            byDate.get(dateKey);

        const category =
            translatedTemperatureCategory(
                data
            );

        const impact =
            typeof temperatureImpactRecommendation === "function"
            ? temperatureImpactRecommendation(data)
            : null;

        items += `
            <div class="overview-risk">
                <div class="overview-risk-name">
                    ${t.maxTemperature}
                </div>

                <div class="overview-period">
                    <b>${formatOverviewDateKey(dateKey)}</b>
                    — ${formatNumber(data.max_temperature, 1)} °C
                    — <b>${category}</b>
                </div>

                <div class="overview-period">
                    ${t.categoryProbability}:
                    <b>${formatProbability(
                        data.temperature_category_probability
                    )}</b>
                </div>

                <div class="overview-period">
                    ${t.warmestPeriod}:
                    <b>${data.temperature_warmest_period || "—"}</b>
                </div>

                ${
                    overviewSelectedDate
                    && impact
                    ? `
                        <div class="overview-muted" style="margin-top:7px;">
                            <b>${t.impacts}:</b>
                            ${impact.impact}
                        </div>
                        <div class="overview-muted" style="margin-top:5px;">
                            <b>${t.recommendations}:</b>
                            ${impact.recommendation}
                        </div>
                    `
                    : ""
                }
            </div>
        `;
    });

    return `
        <div class="overview-group">
            <div class="overview-group-title">
                ${t.temperatureGroup}
            </div>
            ${items}
        </div>
    `;
}



function windRiskLevelNumber(level) {
    const levels = {
        green: 0,
        yellow: 1,
        orange: 2,
        red: 3,
        purple: 4
    };

    return levels[
        String(level || "green").toLowerCase()
    ] ?? 0;
}


function windOverviewImpactHtml(
    forecasts,
    municipalityID
) {
    if (!overviewSelectedDate) {
        return "";
    }

    const t = translations[currentLanguage];

    let strongestData = null;
    let strongestLevel = -1;

    forecasts.forEach(forecast => {
        if (
            localDateKeyBelgrade(
                forecast.valid_time
            ) !== overviewSelectedDate
        ) {
            return;
        }

        const municipality =
            forecast.municipalities[
                municipalityID
            ];

        if (!municipality) {
            return;
        }

        const level =
            windRiskLevelNumber(
                municipality.wind_risk_level
            );

        if (level > strongestLevel) {
            strongestLevel = level;
            strongestData = municipality;
        }
    });

    if (
        !strongestData
        || strongestLevel <= 0
    ) {
        return "";
    }

    const impacts =
        currentLanguage === "sr"
        ? (strongestData.wind_impacts_sr || "—")
        : (
            strongestData.wind_impacts_en
            || strongestData.wind_impacts_sr
            || "—"
        );

    const recommendations =
        currentLanguage === "sr"
        ? (strongestData.wind_recommendations_sr || "—")
        : (
            strongestData.wind_recommendations_en
            || strongestData.wind_recommendations_sr
            || "—"
        );

    return `
        <div class="overview-risk">
            <div class="overview-muted" style="margin-top:7px;">
                <b>${t.impacts}:</b>
                ${impacts}
            </div>

            <div class="overview-muted" style="margin-top:5px;">
                <b>${t.recommendations}:</b>
                ${recommendations}
            </div>
        </div>
    `;
}


/* UI CONTRACT FOR HAZARD MODULES:
   Every hazard should provide, where applicable:
   - availability state
   - risk/category
   - value/probability
   - valid period
   - impacts
   - recommendations
   The search/calendar overview and map popup should use the same fields.
*/

function renderOverview(forecasts, feature) {

    const t = translations[currentLanguage];
    const municipalityID = municipalityId(feature.properties);
    const displayedForecasts = overviewSelectedDate
        ? forecasts.filter(
            forecast =>
                localDateKeyBelgrade(
                    forecast.valid_time
                ) === overviewSelectedDate
        )
        : forecasts;

    function buildGroupHtml(title, hazardKeys) {
        let items = "";

        hazardKeys.forEach(hazardKey => {
            const result = buildRiskWindows(displayedForecasts, municipalityID, hazardKey);

            if (result.windows.length === 0 && !overviewShowAll) return;

            let periodsHtml;
            if (result.windows.length > 0) {
                periodsHtml = result.windows.map(window => `
                    <div class="overview-period">
                        ${formatOverviewInterval(window.start, window.end)}
                        — <b>${formatProbability(window.maxProbability)}</b>
                    </div>
                `).join("");
            } else {
                periodsHtml = `
                    <div class="overview-muted">
                        ${t.noSignificantSignal}
                        ${t.maxSignal}: ${formatProbability(result.maxProbability)}
                    </div>
                `;
            }

            items += `
                <div class="overview-risk">
                    <div class="overview-risk-name">${overviewRiskName(hazardKey)}</div>
                    ${periodsHtml}
                </div>
            `;
        });

        // Hide the whole hazard group when nothing significant exists,
        // unless the user explicitly asks to show insignificant hazards.
        if (!items) return "";
        return `<div class="overview-group"><div class="overview-group-title">${title}</div>${items}</div>`;
    }

    const stormHtml = buildGroupHtml(
        t.stormGroup,
        ["thunder","hail","large_hail","very_large_hail"]
    );

    const windBaseHtml = buildGroupHtml(
        t.windGroup,
        ["wind_10","wind_17","wind_24","wind_28"]
    );

    const windHtml =
        windBaseHtml
        ? windBaseHtml.replace(
            "</div>",
            windOverviewImpactHtml(
                forecasts,
                municipalityID
            ) + "</div>"
        )
        : "";

    const temperatureHtml =
        temperatureOverviewGroupHtml(
            forecasts,
            municipalityID
        );

    const groupsHtml =
        stormHtml
        + windHtml
        + temperatureHtml
        || `
            <div class="overview-risk">
                <div class="overview-muted">
                    ${t.noSignificantSignal}
                </div>
            </div>
        `;

    document.getElementById("overview-title").textContent = municipalityName(feature.properties);
    document.getElementById("overview-subtitle").textContent = t.overviewTitle;

    document.getElementById("overview-body").innerHTML = `
        ${overviewCalendarsHtml(forecasts, municipalityID)}
        <div class="overview-calendar-actions">
            <button type="button" id="overview-all-days" class="overview-all-days">${t.allFiveDays}</button>
            <div class="overview-day-heading">${overviewSelectedDate ? t.selectedDay + ": " + formatOverviewDateKey(overviewSelectedDate) : t.overviewTitle}</div>
        </div>
        <div class="overview-toolbar">
            <label><input type="checkbox" id="overview-show-all" ${overviewShowAll ? "checked" : ""}> ${t.showAllRisks}</label>
        </div>
        ${groupsHtml}
    `;

    document.querySelectorAll("[data-overview-date]").forEach(button => {
        button.addEventListener("click", () => {
            overviewSelectedDate = button.dataset.overviewDate;
            const forecastsOfDay = forecasts.filter(
                forecast =>
                    localDateKeyBelgrade(
                        forecast.valid_time
                    ) === overviewSelectedDate
            );

            if (forecastsOfDay.length > 0) {
                const now = new Date();

                const targetForecast =
                    forecastsOfDay.find(
                        forecast =>
                            new Date(forecast.valid_time) >= now
                    )
                    || forecastsOfDay[0];

                const targetTime =
                    new Date(targetForecast.valid_time).getTime();

                const targetIndex =
                    forecasts.findIndex(
                        forecast =>
                            new Date(forecast.valid_time).getTime()
                            === targetTime
                    );

                if (targetIndex >= 0) {
                    stopPlay();
                    loadForecast(targetIndex);
                }
            }
            renderOverview(forecasts, feature);
        });
    });

    document.getElementById("overview-all-days").addEventListener("click", () => {
        overviewSelectedDate = null;
        renderOverview(forecasts, feature);
    });

    document.getElementById("overview-show-all").addEventListener("change", event => {
        overviewShowAll = event.target.checked;
        renderOverview(forecasts, feature);
    });
}


async function openFiveDayOverview(feature) {

    overviewFeature = feature;

    overviewSelectedDate =
        currentModelData && currentModelData.valid_time
        ? localDateKeyBelgrade(
            currentModelData.valid_time
        )
        : null;

    const panel = document.getElementById("overview-panel");
    const body = document.getElementById("overview-body");
    const t = translations[currentLanguage];

    document.getElementById("overview-title").textContent =
        municipalityName(feature.properties);

    document.getElementById("overview-subtitle").textContent =
        t.overviewTitle;

    body.innerHTML = `
        <div class="overview-muted">
            ${t.loadingOverview}
        </div>
    `;

    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");

    try {
        const forecasts = await loadAllForecasts();
        renderOverview(forecasts, feature);
    } catch (error) {
        console.error(error);
        body.innerHTML = `
            <div class="overview-muted">
                ${t.loadError}
            </div>
        `;
    }
}


function closeOverview() {
    const panel = document.getElementById("overview-panel");
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
}


document
    .getElementById("overview-close")
    .addEventListener(
        "click",
        closeOverview
    );

/* ============================================================
   SEARCH NORMALIZATION
   ============================================================ */

function transliterateCyrillic(
    text
) {

    const chars = {

        "а":"a","б":"b","в":"v",
        "г":"g","д":"d","ђ":"dj",
        "е":"e","ж":"z","з":"z",
        "и":"i","ј":"j","к":"k",
        "л":"l","љ":"lj","м":"m",
        "н":"n","њ":"nj","о":"o",
        "п":"p","р":"r","с":"s",
        "т":"t","ћ":"c","у":"u",
        "ф":"f","х":"h","ц":"c",
        "ч":"c","џ":"dz","ш":"s"

    };

    return text
        .toLowerCase()
        .split("")
        .map(
            c =>
                chars[c] ?? c
        )
        .join("");
}


function normalizeSearch(
    text
) {

    if (
        !text
    ) {
        return "";
    }

    let value =
        transliterateCyrillic(
            text
        );

    value =
        value
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /đ/g,
            "dj"
        )
        .replace(
            /č|ć/g,
            "c"
        )
        .replace(
            /š/g,
            "s"
        )
        .replace(
            /ž/g,
            "z"
        )
        .replace(
            /-grad/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

    return value;
}


/* ============================================================
   SEARCH
   ============================================================ */

const searchInput =
    document.getElementById(
        "municipality-search"
    );

const searchResults =
    document.getElementById(
        "search-results"
    );


function findMunicipalities(
    query
) {

    if (
        !geometryData
    ) {
        return [];
    }

    const q =
        normalizeSearch(
            query
        );

    if (
        !q
    ) {
        return [];
    }

    const exact = [];
    const starts = [];
    const contains = [];

    geometryData.features
        .forEach(
            feature => {

                const p =
                    feature.properties;

                const names =
                    [
                        p.Value_sc,
                        p.Value_sl,
                        p.Value_e
                    ]
                    .filter(
                        Boolean
                    )
                    .map(
                        normalizeSearch
                    );

                if (
                    names.some(
                        n =>
                            n === q
                    )
                ) {

                    exact.push(
                        feature
                    );

                } else if (
                    names.some(
                        n =>
                            n.startsWith(q)
                    )
                ) {

                    starts.push(
                        feature
                    );

                } else if (
                    names.some(
                        n =>
                            n.includes(q)
                    )
                ) {

                    contains.push(
                        feature
                    );
                }
            }
        );

    return [
        ...exact,
        ...starts,
        ...contains
    ];
}


function showSearchResults() {

    const matches =
        findMunicipalities(
            searchInput.value
        )
        .slice(
            0,
            10
        );

    searchResults.innerHTML =
        "";

    if (
        !searchInput.value.trim()
        ||
        matches.length === 0
    ) {

        searchResults.style.display =
            "none";

        return;
    }

    matches.forEach(
        feature => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "search-result";

            item.textContent =
                municipalityName(
                    feature.properties
                );

            item.addEventListener(
                "click",
                () => {

                    searchResults.style.display =
                        "none";

                    searchInput.value =
                        municipalityName(
                            feature.properties
                        );

                    openMunicipality(
                        feature,
                        true
                    );
                }
            );

            searchResults.appendChild(
                item
            );
        }
    );

    searchResults.style.display =
        "block";
}


function performSearch() {

    const matches =
        findMunicipalities(
            searchInput.value
        );

    if (
        matches.length === 0
    ) {

        showStatus(
            translations[
                currentLanguage
            ].notFound
        );

        return;
    }

    searchResults.style.display =
        "none";

    openMunicipality(
        matches[0],
        true
    );
}


function openMunicipality(
    feature,
    showOverview = false
) {

    const id =
        municipalityId(
            feature.properties
        );

    selectedMunicipalityId =
        id;

    if (
        !geojsonLayer
    ) {
        return;
    }

    geojsonLayer.eachLayer(
        layer => {

            if (
                municipalityId(
                    layer.feature.properties
                )
                === id
            ) {

                selectedLayer =
                    layer;

                searchInput.value =
                    municipalityName(
                        layer.feature.properties
                    );

                map.fitBounds(
                    layer.getBounds(),
                    {
                        padding:
                            [40,40],

                        maxZoom:
                            11
                    }
                );

                /* Keep the searched municipality clearly visible on the map. */
                layer.setStyle({
                    weight: 4,
                    color: "#111",
                    fillOpacity: 0.88
                });
                layer.bringToFront();

                if (showOverview) {
                    map.closePopup();
                    openFiveDayOverview(layer.feature);
                    return;
                }

                if (openMobileDetail(layer.feature.properties)) {
                    return;
                }

                layer.setPopupContent(
                    popupContent(
                        layer.feature.properties
                    )
                );

                layer.openPopup();
            }
        }
    );
}


searchInput.addEventListener(
    "input",
    showSearchResults
);


searchInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            performSearch();
        }
    }
);


document
    .getElementById(
        "search-button"
    )
    .addEventListener(
        "click",
        performSearch
    );


/* ============================================================
   GEOLOCATION
   ============================================================ */

document
    .getElementById(
        "location-button"
    )
    .addEventListener(
        "click",
        locateUser
    );


function locateUser() {

    const t =
        translations[
            currentLanguage
        ];

    if (
        !navigator.geolocation
    ) {

        showStatus(
            t.locationUnavailable
        );

        return;
    }

    showStatus(
        t.locationSearching,
        3000
    );

    navigator.geolocation
        .getCurrentPosition(

            position => {

                const lat =
                    position.coords.latitude;

                const lon =
                    position.coords.longitude;

                if (
                    locationMarker
                ) {

                    map.removeLayer(
                        locationMarker
                    );
                }

                locationMarker =
                    L.marker(
                        [lat,lon]
                    )
                    .addTo(
                        map
                    );

                const point =
                    turf.point(
                        [lon,lat]
                    );

                let found =
                    null;

                for (
                    const feature
                    of geometryData.features
                ) {

                    if (
                        turf.booleanPointInPolygon(
                            point,
                            feature
                        )
                    ) {

                        found =
                            feature;

                        break;
                    }
                }

                if (
                    found
                ) {

                    openMunicipality(
                        found
                    );

                    showStatus(
                        t.municipalityLocated
                        +
                        ": "
                        +
                        municipalityName(
                            found.properties
                        )
                    );

                } else {

                    map.setView(
                        [lat,lon],
                        10
                    );
                }
            },


            error => {

                if (
                    error.code === 1
                ) {

                    showStatus(
                        t.locationDenied
                    );

                } else if (
                    error.code === 2
                ) {

                    showStatus(
                        t.locationUnavailable
                    );

                } else {

                    showStatus(
                        t.locationTimeout
                    );
                }
            },


            {
                enableHighAccuracy:
                    false,

                timeout:
                    15000,

                maximumAge:
                    300000
            }
        );
}


/* ============================================================
   PDF
   ============================================================ */

document
    .getElementById(
        "pdf-button"
    )
    .addEventListener(
        "click",
        () => {

            window.print();
        }
    );


/* ============================================================
   SHARE
   ============================================================ */

const sharePanel =
    document.getElementById(
        "share-panel"
    );


function shareData() {

    const t =
        translations[
            currentLanguage
        ];

    let text =
        t.title;

    if (
        currentModelData
    ) {

        text +=
            "\n"
            +
            formatValidTime(
                currentModelData.valid_time
            );
    }

    if (
        selectedLayer
    ) {

        const properties =
            selectedLayer
            .feature
            .properties;

        const data =
            getMunicipalityData(
                properties
            );

        if (
            data
        ) {

            text +=
                "\n"
                +
                municipalityName(
                    properties
                )
                +
                ": "
                +
                formatProbability(
                    data[
                        currentHazard
                    ]
                );
        }
    }

    return {

        title:
            t.shareTitle,

        text:
            text,

        url:
            window.location.href
    };
}


async function nativeShare() {

    try {

        await navigator.share(
            shareData()
        );

    } catch (error) {

        if (
            error.name !==
            "AbortError"
        ) {

            sharePanel.style.display =
                "block";
        }
    }
}


document
    .getElementById(
        "share-button"
    )
    .addEventListener(
        "click",
        () => {

            if (
                navigator.share
            ) {

                nativeShare();

            } else {

                sharePanel.style.display =
                    sharePanel.style.display
                    === "block"
                    ? "none"
                    : "block";
            }
        }
    );


document
    .getElementById(
        "share-native"
    )
    .addEventListener(
        "click",
        nativeShare
    );


document
    .getElementById(
        "share-whatsapp"
    )
    .addEventListener(
        "click",
        () => {

            const d =
                shareData();

            window.open(
                "https://wa.me/?text="
                +
                encodeURIComponent(
                    d.text
                    +
                    "\n"
                    +
                    d.url
                ),
                "_blank"
            );
        }
    );


document
    .getElementById(
        "share-viber"
    )
    .addEventListener(
        "click",
        () => {

            const d =
                shareData();

            window.location.href =
                "viber://forward?text="
                +
                encodeURIComponent(
                    d.text
                    +
                    "\n"
                    +
                    d.url
                );
        }
    );


document
    .getElementById(
        "share-telegram"
    )
    .addEventListener(
        "click",
        () => {

            const d =
                shareData();

            window.open(
                "https://t.me/share/url?url="
                +
                encodeURIComponent(
                    d.url
                )
                +
                "&text="
                +
                encodeURIComponent(
                    d.text
                ),
                "_blank"
            );
        }
    );


document
    .getElementById(
        "share-email"
    )
    .addEventListener(
        "click",
        () => {

            const d =
                shareData();

            window.location.href =
                "mailto:?subject="
                +
                encodeURIComponent(
                    d.title
                )
                +
                "&body="
                +
                encodeURIComponent(
                    d.text
                    +
                    "\n\n"
                    +
                    d.url
                );
        }
    );


/* ============================================================
   HEADER
   ============================================================ */

function updateHeader() {

    const t =
        translations[
            currentLanguage
        ];

    document
        .getElementById(
            "main-title"
        )
        .textContent =
            t.title;

    document
        .getElementById(
            "subtitle"
        )
        .textContent =
            (
                currentModelData
                && currentModelData.storms_multimodel
            )
            ? (
                currentLanguage === "sr"
                ? "Олује: ECMWF ENS + GEFS, уз ICON-EU EPS када је доступан · Tmax: GEFS + ICON-EU EPS · Остали ризици: постојећи производи"
                : "Storms: ECMWF ENS + GEFS, with ICON-EU EPS where available · Tmax: GEFS + ICON-EU EPS · Other risks: existing products"
            )
            : t.model;

    if (
        currentModelData
    ) {

        document
            .getElementById(
                "update-info"
            )
            .textContent =
                t.updated
                +
                ": "
                +
                formatValidTime(
                    (
                        currentHazardGroup() === "temperature"
                        && currentModelData.temperature_model_run
                    )
                    ? currentModelData.temperature_model_run
                    : (
                        displayReferenceRun
                        || currentModelData.model_run
                        || currentModelData.valid_time
                    )
                );
    }
}


/* ============================================================
   LANGUAGE
   ============================================================ */

function updateLanguage() {

    const t =
        translations[
            currentLanguage
        ];

    document.documentElement.lang =
        currentLanguage;

    searchInput.placeholder =
        t.search;

    document
        .getElementById(
            "location-button"
        )
        .textContent =
            t.location;

    document
        .getElementById(
            "pdf-button"
        )
        .textContent =
            t.pdf;

    document
        .getElementById(
            "share-button"
        )
        .textContent =
            t.share;

    document
        .getElementById(
            "storm-group-label"
        )
        .textContent =
            t.stormGroup;

    document.getElementById("wind-group-label").textContent = t.windGroup;
    document.getElementById("temperature-group-label").textContent = t.temperatureGroup;
    document.getElementById("btn-max-temperature").textContent = t.maxTemperature;
    document.getElementById("btn-wind-risk").textContent = t.windOverall;
    document.getElementById("btn-wind-10").textContent = t.wind10;
    document.getElementById("btn-wind-17").textContent = t.wind17;
    document.getElementById("btn-wind-24").textContent = t.wind24;
    document.getElementById("btn-wind-28").textContent = t.wind28;

    document
        .getElementById(
            "btn-thunder"
        )
        .textContent =
            t.thunder;

    document
        .getElementById(
            "btn-hail"
        )
        .textContent =
            t.hail;

    document
        .getElementById(
            "btn-large-hail"
        )
        .textContent =
            t.largeHail;

    document
        .getElementById(
            "btn-very-large-hail"
        )
        .textContent =
            t.veryLargeHail;

    document
        .getElementById(
            "disclaimer"
        )
        .textContent =
            t.disclaimer;

    document.title =
        t.title;

    updateHeader();

    updateTimelineLabels();

    updateHazardAvailabilityLabels();

    updateLegend();

    redrawMap();

    if (
        overviewFeature
        && document.getElementById("overview-panel").classList.contains("open")
        && allForecastData
    ) {
        renderOverview(allForecastData, overviewFeature);
    }

    if (
        selectedLayer
        && isMobileView()
        && document.getElementById("mobile-detail-panel").classList.contains("open")
    ) {
        openMobileDetail(
            selectedLayer.feature.properties
        );
    }

    if (
        selectedLayer
        && !document.getElementById("overview-panel").classList.contains("open")
    ) {

        selectedLayer
            .setPopupContent(
                popupContent(
                    selectedLayer
                    .feature
                    .properties
                )
            );

        selectedLayer
            .openPopup();
    }
}


document
    .querySelectorAll(
        ".lang-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function() {

                    currentLanguage =
                        this.dataset.lang;

                    document
                        .querySelectorAll(
                            ".lang-button"
                        )
                        .forEach(
                            btn =>
                                btn.classList.remove(
                                    "active"
                                )
                        );

                    this.classList.add(
                        "active"
                    );

                    updateLanguage();
                }
            );
        }
    );


/* ============================================================
   LEGEND
   ============================================================ */

const legend =
    L.control(
        {
            position:
                "bottomright"
        }
    );


legend.onAdd =
function() {

    const div =
        L.DomUtil.create(
            "div",
            "legend"
        );

    div.id =
        "map-legend";

    updateLegend(
        div
    );

    return div;
};


function updateLegend(
    div = null
) {

    const element =
        div
        ||
        document.getElementById(
            "map-legend"
        );

    if (!element) {
        return;
    }

    const t = translations[currentLanguage];

    if (currentHazard === "max_temperature") {
        const labels = currentLanguage === "sr"
            ? [
                "<30 °C — уобичајена температура",
                "30–35 °C — тропски дан",
                "35–38 °C — врео дан",
                "38–40 °C — веома врео дан",
                "≥40 °C — екстремно врео дан"
            ]
            : [
                "<30 °C — usual temperature",
                "30–35 °C — tropical day",
                "35–38 °C — hot day",
                "38–40 °C — very hot day",
                "≥40 °C — extremely hot day"
            ];

        const colors = [
            "#a6d96a",
            "#ffffbf",
            "#fdae61",
            "#d7191c",
            "#7b3294"
        ];

        element.innerHTML = `
            <div class="legend-title">
                ${translations[currentLanguage].maxTemperature}
            </div>
            ${labels.map((label, i) => `
                <div class="legend-row">
                    <span class="legend-box" style="background:${colors[i]}"></span>
                    ${label}
                </div>
            `).join("")}
        `;
        return;
    }


    if (
        ["thunder", "hail", "large_hail", "very_large_hail"].includes(currentHazard)
        && currentModelData
        && currentModelData.storms_multimodel
    ) {
        const labels = currentLanguage === "sr"
            ? ["без значајног ризика", "повишен", "умерен", "висок", "веома висок"]
            : ["no significant risk", "elevated", "moderate", "high", "very high"];

        const colors = [
            "#a6d96a",
            "#ffffbf",
            "#fdae61",
            "#d7191c",
            "#7b3294"
        ];

        element.innerHTML = `
            <div class="legend-title">
                ${currentLanguage === "sr"
                    ? "Мултимоделски ниво ризика"
                    : "Multimodel risk level"}
            </div>
            ${labels.map((label, i) => `
                <div class="legend-row">
                    <span class="legend-box" style="background:${colors[i]}"></span>
                    ${label}
                </div>
            `).join("")}
        `;
        return;
    }

    if (currentHazard === "overall_risk" || currentHazard === "wind_risk_level") {
        const labels = currentLanguage === "sr"
            ? ["без значајног ризика", "низак", "умерен", "висок", "веома висок"]
            : ["no significant risk", "low", "moderate", "high", "very high"];
        const colors = ["#a6d96a", "#ffffbf", "#fdae61", "#d7191c", "#7b3294"];
        const count = currentHazard === "wind_risk_level" ? 4 : 5;
        element.innerHTML = `
            <div class="legend-title">${currentLanguage === "sr" ? "Ниво ризика" : "Risk level"}</div>
            ${labels.slice(0, count).map((label, i) => `
                <div class="legend-row"><span class="legend-box" style="background:${colors[i]}"></span>${label}</div>
            `).join("")}
        `;
        return;
    }

    element.innerHTML = `
        <div class="legend-title">${t.legend}</div>
        <div class="legend-row"><span class="legend-box" style="background:#a6d96a"></span>&lt; 10%</div>
        <div class="legend-row"><span class="legend-box" style="background:#ffffbf"></span>10–20%</div>
        <div class="legend-row"><span class="legend-box" style="background:#fdae61"></span>20–30%</div>
        <div class="legend-row"><span class="legend-box" style="background:#d7191c"></span>30–50%</div>
        <div class="legend-row"><span class="legend-box" style="background:#7b3294"></span>≥ 50%</div>
    `;
}


legend.addTo(
    map
);


/* ============================================================
   STATUS
   ============================================================ */

let statusTimeout =
    null;


function showStatus(
    message,
    duration = 4000
) {

    const element =
        document.getElementById(
            "status-message"
        );

    if (
        statusTimeout
    ) {

        clearTimeout(
            statusTimeout
        );
    }

    element.textContent =
        message;

    element.style.display =
        "block";

    statusTimeout =
        setTimeout(
            () => {

                element.style.display =
                    "none";

            },
            duration
        );
}


window.addEventListener("resize", () => {
    if (!isMobileView()) {
        closeMobileDetail();
    }
});

/* ============================================================
   START
   ============================================================ */

updateLanguage();

updateTimeButtons();

initializeData();