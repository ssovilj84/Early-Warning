/* MeteoRisk UI Polish - expert details + signature helper
   Presentation only. No hazard/risk/timeline calculations are changed. */
(() => {
    "use strict";

    const SR_EXPERT = "🔬 Стручни детаљи";
    const EN_EXPERT = "🔬 Expert details";

    const TECH_MARKERS = [
        "параметри модела",
        "model parameters",
        "сигнали модела",
        "model signals",
        "поузданост",
        "confidence",
        "неслагање модела",
        "model disagreement",
        "доминантни модел",
        "dominant model",
        "локална просторна подршка",
        "local spatial support",
        "gefs",
        "icon",
        "ecmwf",
        "cams",
        "cape",
        "shear",
        "смицање",
        "grid",
        "p90",
        "median",
        "медијана",
        "source_domain",
        "изворни aqi",
        "source domain",
        "минерална прашина",
        "dust"
    ];

    const OVERALL_TECH_MARKERS = [
        "доступност производа",
        "product availability"
    ];

    function currentExpertLabel() {
        const active = document.querySelector(".lang-button.active");
        const lang = active?.dataset?.lang || "sr";
        return lang === "en" ? EN_EXPERT : SR_EXPERT;
    }

    function normalizedText(element) {
        return String(element?.textContent || "")
            .toLocaleLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function looksTechnical(card) {
        const text = normalizedText(card);
        return TECH_MARKERS.some(marker => text.includes(marker));
    }

    function looksOverallTechnical(card) {
        const text = normalizedText(card);
        return OVERALL_TECH_MARKERS.some(marker => text.includes(marker));
    }

    function makeDetails(label) {
        const details = document.createElement("details");
        details.className = "mr-expert-details";

        const summary = document.createElement("summary");
        summary.className = "mr-expert-summary";
        summary.textContent = label;

        const body = document.createElement("div");
        body.className = "mr-expert-body";

        details.appendChild(summary);
        details.appendChild(body);

        return { details, body };
    }

    function decoratePopup(popupContent) {
        if (!popupContent || popupContent.dataset.mrExpertDecorated === "1") {
            return;
        }

        const cards = Array.from(
            popupContent.querySelectorAll(".multimodel-card")
        );

        if (!cards.length) {
            return;
        }

        let candidates = cards.filter(looksTechnical);

        if (!candidates.length) {
            candidates = cards.filter(looksOverallTechnical);
        }

        if (!candidates.length) {
            return;
        }

        const first = candidates[0];
        const parent = first.parentNode;

        if (!parent) {
            return;
        }

        const { details, body } = makeDetails(currentExpertLabel());

        parent.insertBefore(details, first);

        candidates.forEach(card => {
            body.appendChild(card);
        });

        popupContent.dataset.mrExpertDecorated = "1";
    }

    function refreshExpertLabels() {
        document.querySelectorAll(".mr-expert-summary").forEach(summary => {
            summary.textContent = currentExpertLabel();
        });
    }

    function scan() {
        document.querySelectorAll(".leaflet-popup-content").forEach(
            decoratePopup
        );
        refreshExpertLabels();
    }

    const observer = new MutationObserver(() => {
        window.requestAnimationFrame(scan);
    });

    function start() {
        scan();

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        document.addEventListener("click", event => {
            if (event.target.closest(".lang-button")) {
                window.setTimeout(refreshExpertLabels, 0);
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
