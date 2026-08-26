/* MeteoRisk uniform floating popup
   Presentation only: one draggable desktop popup shell for every hazard/module.
   Scientific data and risk calculations are untouched. */
(() => {
    "use strict";

    const STYLE_ID = "mr-uniform-popup-style";
    const DESKTOP_QUERY = "(min-width: 801px)";
    let dragState = null;

    function isDesktop() {
        return window.matchMedia(DESKTOP_QUERY).matches;
    }

    function installStyle() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
            .leaflet-popup.mr-uniform-popup {
                z-index: 10050 !important;
            }

            @media (min-width: 801px) {
                .leaflet-popup.mr-uniform-popup {
                    position: fixed !important;
                    left: var(--mr-popup-left, 50vw) !important;
                    top: var(--mr-popup-top, 120px) !important;
                    bottom: auto !important;
                    transform: none !important;
                    margin: 0 !important;
                    max-width: min(440px, calc(100vw - 16px)) !important;
                    pointer-events: auto !important;
                }

                .leaflet-popup.mr-uniform-popup .leaflet-popup-content-wrapper {
                    position: relative !important;
                    overflow: hidden !important;
                    padding-top: 34px !important;
                    border-radius: 12px !important;
                    box-sizing: border-box !important;
                    max-height: calc(100vh - 16px) !important;
                }

                .leaflet-popup.mr-uniform-popup .leaflet-popup-content {
                    max-height: calc(100vh - 76px) !important;
                    overflow-y: auto !important;
                    overscroll-behavior: contain;
                    margin-top: 8px !important;
                }

                .leaflet-popup.mr-uniform-popup .leaflet-popup-tip-container {
                    display: none !important;
                }

                .leaflet-popup.mr-uniform-popup .leaflet-popup-close-button {
                    position: absolute !important;
                    top: 6px !important;
                    right: 7px !important;
                    left: auto !important;
                    bottom: auto !important;
                    width: 28px !important;
                    height: 28px !important;
                    line-height: 26px !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    border-radius: 7px !important;
                    z-index: 4 !important;
                    font-size: 25px !important;
                    text-align: center !important;
                }

                .mr-popup-drag-handle {
                    position: absolute;
                    top: 6px;
                    left: 8px;
                    right: 44px;
                    height: 28px;
                    margin: 0;
                    padding: 0 8px;
                    border: 0;
                    border-radius: 7px;
                    background: transparent;
                    color: inherit;
                    opacity: 0.62;
                    cursor: grab;
                    z-index: 3;
                    font: inherit;
                    font-size: 17px;
                    line-height: 28px;
                    text-align: left;
                    touch-action: none;
                    user-select: none;
                }

                .mr-popup-drag-handle:hover {
                    opacity: 0.95;
                    background: rgba(0,0,0,0.055);
                }

                .mr-popup-drag-handle:active,
                .mr-uniform-popup.mr-uniform-dragging .mr-popup-drag-handle {
                    cursor: grabbing;
                }

                body.mr-uniform-popup-dragging {
                    user-select: none !important;
                }
            }

            .mobile-detail-header {
                position: sticky;
                top: 0;
                z-index: 6;
            }

            .mobile-detail-close,
            .overview-close {
                position: relative;
                flex: 0 0 auto;
                align-self: flex-start;
                margin-left: auto;
            }
        `;
        document.head.appendChild(style);
    }

    function clamp(popup, left, top) {
        const margin = 8;
        const rect = popup.getBoundingClientRect();
        const width = Math.min(rect.width || 420, window.innerWidth - margin * 2);
        const height = Math.min(rect.height || 320, window.innerHeight - margin * 2);

        return {
            left: Math.min(
                Math.max(margin, left),
                Math.max(margin, window.innerWidth - width - margin)
            ),
            top: Math.min(
                Math.max(margin, top),
                Math.max(margin, window.innerHeight - height - margin)
            )
        };
    }

    function setPosition(popup, left, top) {
        const next = clamp(popup, left, top);
        popup.style.setProperty("--mr-popup-left", `${next.left}px`);
        popup.style.setProperty("--mr-popup-top", `${next.top}px`);
    }

    function promote(popup) {
        if (!popup || !isDesktop()) return popup;

        const alreadyBodyChild = popup.parentElement === document.body;
        const rect = popup.getBoundingClientRect();

        if (
            typeof window.mrPromoteLeafletPopupToViewport === "function"
            && !alreadyBodyChild
        ) {
            try {
                popup = window.mrPromoteLeafletPopupToViewport(popup) || popup;
            } catch (_) {}
        }

        if (popup.parentElement !== document.body) {
            document.body.appendChild(popup);
        }

        popup.classList.add("mr-uniform-popup", "mr-viewport-popup");

        const hasPosition =
            popup.style.getPropertyValue("--mr-popup-left")
            && popup.style.getPropertyValue("--mr-popup-top");

        if (!hasPosition) {
            setPosition(
                popup,
                Number.isFinite(rect.left) ? rect.left : 20,
                Number.isFinite(rect.top) ? rect.top : 100
            );
        }

        popup.style.marginLeft = "";
        popup.style.marginTop = "";

        return popup;
    }

    function ensureHandle(popup) {
        if (!popup || !isDesktop()) return;

        popup = promote(popup);

        const wrapper = popup.querySelector(".leaflet-popup-content-wrapper");
        if (!wrapper) return;

        if (!wrapper.querySelector(".mr-popup-drag-handle")) {
            const handle = document.createElement("button");
            handle.type = "button";
            handle.className = "mr-popup-drag-handle";
            handle.setAttribute("aria-label", "Move popup");
            handle.title = "Move";
            handle.textContent = "↔";
            wrapper.insertBefore(handle, wrapper.firstChild);
        }
    }

    function decorateAll() {
        if (!isDesktop()) return;
        document.querySelectorAll(".leaflet-popup").forEach(ensureHandle);
    }

    function startDrag(event) {
        if (!isDesktop() || event.button !== 0) return;

        const handle = event.target.closest(".mr-popup-drag-handle");
        if (!handle) return;

        let popup = handle.closest(".leaflet-popup");
        if (!popup) return;

        popup = promote(popup);

        const rect = popup.getBoundingClientRect();

        dragState = {
            popup,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            left: rect.left,
            top: rect.top
        };

        popup.classList.add("mr-uniform-dragging");
        document.body.classList.add("mr-uniform-popup-dragging");

        try {
            handle.setPointerCapture(event.pointerId);
        } catch (_) {}

        event.preventDefault();
        event.stopPropagation();
    }

    function moveDrag(event) {
        if (!dragState || event.pointerId !== dragState.pointerId) return;

        setPosition(
            dragState.popup,
            dragState.left + event.clientX - dragState.startX,
            dragState.top + event.clientY - dragState.startY
        );

        event.preventDefault();
    }

    function stopDrag(event) {
        if (!dragState) return;
        if (event && event.pointerId !== dragState.pointerId) return;

        dragState.popup.classList.remove("mr-uniform-dragging");
        document.body.classList.remove("mr-uniform-popup-dragging");
        dragState = null;
    }

    function onResize() {
        if (!isDesktop()) return;

        document.querySelectorAll(".leaflet-popup.mr-uniform-popup").forEach(popup => {
            const rect = popup.getBoundingClientRect();
            setPosition(popup, rect.left, rect.top);
        });
    }

    installStyle();

    document.addEventListener("pointerdown", startDrag, true);
    document.addEventListener("pointermove", moveDrag, true);
    document.addEventListener("pointerup", stopDrag, true);
    document.addEventListener("pointercancel", stopDrag, true);
    window.addEventListener("resize", onResize);

    const observer = new MutationObserver(() => {
        window.requestAnimationFrame(decorateAll);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    if (typeof map !== "undefined" && map && typeof map.on === "function") {
        map.on("popupopen", event => {
            window.requestAnimationFrame(() => {
                const popup =
                    event?.popup?._container
                    || document.querySelector(".leaflet-popup");
                if (popup) ensureHandle(popup);
            });
        });
    }

    decorateAll();

    window.MeteoRiskUniformPopup = {
        decorateAll,
        promote
    };
})();
