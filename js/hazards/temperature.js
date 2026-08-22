/* ============================================================
   METEORISK HAZARD MODULE: MAXIMUM TEMPERATURE
   ============================================================

   Temperature-specific block:
   - data files/cache
   - daily data loading
   - municipality overlay
   - category translation
   - impacts/recommendations
   - popup detail renderer

   Future hazards should be separate files in js/hazards/.
   ============================================================ */

const TEMPERATURE_FILES = [
    "data/temperature/temperature_day0.csv",
    "data/temperature/temperature_day1.csv",
    "data/temperature/temperature_day2.csv",
    "data/temperature/temperature_day3.csv",
    "data/temperature/temperature_day4.csv"
];

let temperatureDailyCache = null;

function localDateKeyBelgrade(isoString) {
    if (!isoString) return null;

    const date = new Date(isoString);
    if (!Number.isFinite(date.getTime())) return null;

    const parts = new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: "Europe/Belgrade",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).formatToParts(date);

    const values = {};
    parts.forEach(part => {
        if (part.type !== "literal") {
            values[part.type] = part.value;
        }
    });

    return `${values.year}-${values.month}-${values.day}`;
}

async function loadTemperatureDailyRows() {
    if (temperatureDailyCache) {
        return temperatureDailyCache;
    }

    const byDate = new Map();

    for (const path of TEMPERATURE_FILES) {
        try {
            const response = await fetch(
                path,
                { cache: "no-store" }
            );

            if (!response.ok) {
                console.warn(
                    "Temperature file unavailable:",
                    path,
                    response.status
                );
                continue;
            }

            const rows = parseCsv(
                await response.text()
            );

            rows.forEach(row => {
                const dateKey = String(row.date || "").trim();
                if (!dateKey) return;

                if (!byDate.has(dateKey)) {
                    byDate.set(dateKey, new Map());
                }

                byDate.get(dateKey).set(
                    normalizeMunicipalityName(row.Value_sc),
                    row
                );
            });

        } catch (error) {
            console.warn(
                "Temperature file load error:",
                path,
                error
            );
        }
    }

    temperatureDailyCache = byDate;
    return byDate;
}

async function applyTemperatureOverlay(data) {
    if (!data || !geometryData) return data;

    const dateKey = localDateKeyBelgrade(
        data.valid_time
    );

    if (!dateKey) {
        data.temperature_multimodel = false;
        return data;
    }

    const allDays =
        await loadTemperatureDailyRows();

    const rowsByName =
        allDays.get(dateKey);

    if (!rowsByName) {
        data.temperature_multimodel = false;
        return data;
    }

    let matched = 0;

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

        target.temperature_multimodel = true;
        target.max_temperature = optionalNumber(row.multimodel_tmax);
        target.temperature_color = row.temperature_color || "GREEN";
        target.temperature_category_sr = row.temperature_category_sr || "";
        target.temperature_category_key = row.dominant_category || "";

        target.temperature_category_probability =
            optionalNumber(row.dominant_category_probability);

        target.temperature_p_below_30 =
            optionalNumber(row.p_below_30);

        target.temperature_p_30_35 =
            optionalNumber(row.p_30_35);

        target.temperature_p_35_38 =
            optionalNumber(row.p_35_38);

        target.temperature_p_38_40 =
            optionalNumber(row.p_38_40);

        target.temperature_p_ge_40 =
            optionalNumber(row.p_ge_40);

        target.temperature_gefs_tmax =
            optionalNumber(row.gefs_tmax);

        target.temperature_icon_tmax =
            optionalNumber(row.icon_tmax);

        target.temperature_warmest_period =
            row.warmest_period_local || "—";

        target.temperature_date =
            row.date || dateKey;

        target.temperature_model_run =
            row.model_run || "";

        matched += 1;
    });

    data.temperature_multimodel = matched > 0;
    data.temperature_multimodel_matches = matched;

    return data;
}

function translatedTemperatureCategory(data) {
    const key = String(
        data.temperature_category_key || ""
    );

    const sr = {
        below_30: "Уобичајена температура",
        "30_35": "Тропски дан",
        "35_38": "Врео дан",
        "38_40": "Веома врео дан",
        ge_40: "Екстремно врео дан"
    };

    const en = {
        below_30: "Usual temperature",
        "30_35": "Tropical day",
        "35_38": "Hot day",
        "38_40": "Very hot day",
        ge_40: "Extremely hot day"
    };

    return (
        currentLanguage === "sr"
        ? sr[key]
        : en[key]
    )
    || data.temperature_category_sr
    || "—";
}

function temperatureImpactRecommendation(data) {
    const key = String(data.temperature_category_key || "");

    const sr = {
        below_30: ["Без значајнијег утицаја високе температуре.", "Уобичајене дневне активности."],
        "30_35": ["Повећана топлотна нелагодност, нарочито код осетљивих група и при дужем боравку на сунцу.", "Редовно уносити течност и смањити дуже излагање сунцу и напор у најтоплијем делу дана."],
        "35_38": ["Изражено топлотно оптерећење; већи ризик од исцрпљености при раду и физичкој активности на отвореном.", "Ограничити напорне активности на отвореном, правити чешће паузе, боравити у хладу или расхлађеном простору и редовно уносити течност."],
        "38_40": ["Високо топлотно оптерећење и повећан ризик од здравствених тегоба при дужем излагању и физичком напору.", "Избегавати напор и дуже излагање у најтоплијем делу дана; активности планирати за раније јутарње или вечерње сате и посебно обратити пажњу на осетљиве групе."],
        ge_40: ["Екстремна врућина са веома високим топлотним оптерећењем, нарочито за старије, децу, хроничне болеснике и особе које раде на отвореном.", "Избегавати физички напор и дуже излагање топлоти, обезбедити често расхлађивање и унос течности и активности на отвореном свести на неопходни минимум."]
    };

    const en = {
        below_30: ["No significant high-temperature impact.", "Normal daily activities."],
        "30_35": ["Increased heat discomfort, especially for vulnerable groups and during prolonged sun exposure.", "Drink fluids regularly and reduce prolonged sun exposure and strenuous activity during the hottest part of the day."],
        "35_38": ["Marked heat load with increased risk of exhaustion during outdoor work and physical activity.", "Limit strenuous outdoor activity, take more frequent breaks, stay in shade or cooled spaces and drink fluids regularly."],
        "38_40": ["High heat load and increased risk of heat-related health problems during prolonged exposure and physical exertion.", "Avoid strenuous activity and prolonged exposure during the hottest part of the day; schedule activities for early morning or evening and pay special attention to vulnerable groups."],
        ge_40: ["Extreme heat with very high heat load, particularly for older people, children, people with chronic illness and outdoor workers.", "Avoid physical exertion and prolonged heat exposure, cool down frequently, drink fluids regularly and keep outdoor activity to the necessary minimum."]
    };

    const item = (currentLanguage === "sr" ? sr : en)[key] || ["—", "—"];

    return {
        impact: item[0],
        recommendation: item[1]
    };
}

function temperatureDetailHtml(data) {
    const t = translations[currentLanguage];

    if (!data || !data.temperature_multimodel) {
        return `
            <div class="popup-note">
                ${currentLanguage === "sr"
                    ? "Мултимоделска прогноза максималне температуре није доступна за овај дан."
                    : "Multimodel maximum-temperature forecast is unavailable for this day."}
            </div>
        `;
    }

    return `
        <div class="multimodel-card">

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

            <div class="popup-section">${t.impacts}</div>
            <div class="popup-note">${temperatureImpactRecommendation(data).impact}</div>

            <div class="popup-section">${t.recommendations}</div>
            <div class="popup-note">${temperatureImpactRecommendation(data).recommendation}</div>

            <div class="popup-section">
                ${currentLanguage === "sr"
                    ? "Модели"
                    : "Models"}
            </div>

            <div class="multimodel-model-grid">
                <div>
                    <span>GEFS</span>
                    <b>${formatNumber(data.temperature_gefs_tmax, 1)} °C</b>
                </div>
                <div>
                    <span>ICON-EU EPS</span>
                    <b>${formatNumber(data.temperature_icon_tmax, 1)} °C</b>
                </div>
                <div>
                    <span>${currentLanguage === "sr" ? "Мултимодел" : "Multimodel"}</span>
                    <b>${formatNumber(data.max_temperature, 1)} °C</b>
                </div>
            </div>

            <div class="popup-section">
                ${currentLanguage === "sr"
                    ? "Расподела категорија"
                    : "Category distribution"}
            </div>

            <div class="popup-row">&lt;30 °C: <b>${formatProbability(data.temperature_p_below_30)}</b></div>
            <div class="popup-row">30–35 °C: <b>${formatProbability(data.temperature_p_30_35)}</b></div>
            <div class="popup-row">35–38 °C: <b>${formatProbability(data.temperature_p_35_38)}</b></div>
            <div class="popup-row">38–40 °C: <b>${formatProbability(data.temperature_p_38_40)}</b></div>
            <div class="popup-row">≥40 °C: <b>${formatProbability(data.temperature_p_ge_40)}</b></div>

            <div class="popup-note">
                ${currentLanguage === "sr"
                    ? "Дневни развојни мултимоделски производ: GEFS и ICON-EU EPS имају једнаку тежину 50:50. Категоријске вероватноће још нису калибрисане."
                    : "Daily developmental multimodel product: GEFS and ICON-EU EPS have equal 50:50 weight. Category probabilities are not yet calibrated."}
            </div>
        </div>
    `;
}
