document.addEventListener('DOMContentLoaded', () => {
    const debug = false;
    if (debug) console.log("[slider-label.js] DOMContentLoaded - Initializing initSliderLabel");

    function initSliderLabel(sliderContainerSelector, getOptionsCallback, debug = false) {
        if (debug) console.log("[initSliderLabel] Called with selector:", sliderContainerSelector);

        const updateLabelForSlider = (slider, label, optionsArray) => {
            if (!slider || !label) {
                if (debug) console.error("[updateLabelForSlider] Missing slider or label.");
                return;
            }

            const val = parseInt(slider.value, 10);
            label.textContent = optionsArray[val]?.label || "Error";

            const min = parseInt(slider.min, 10);
            const max = parseInt(slider.max, 10);
            const percent = (val - min) / (max - min);

            const container = slider.parentElement;
            if (!container) {
                if (debug) console.error("[updateLabelForSlider] Slider has no parent container.");
                return;
            }

            const containerWidth = container.offsetWidth;
            const labelHalfWidth = label.offsetWidth / 2;
            let labelCenterX = containerWidth * percent;

            // Clamp label position
            labelCenterX = Math.max(labelHalfWidth, Math.min(containerWidth - labelHalfWidth, labelCenterX));
            label.style.left = `${labelCenterX}px`;

            if (debug) {
                console.log(`[updateLabelForSlider] Value: ${val}, Options:`, optionsArray,
                            `Percent: ${percent}, labelCenterX: ${labelCenterX}`);
            }
        };

        const initializeSlider = (container) => {
            if (debug) console.log("[initializeSlider] Initializing slider in container:", container);

            const slider = container.querySelector('input[type="range"]');
            const label = container.querySelector('.slider-label');

            if (!slider) {
                if (debug) console.warn("[initializeSlider] No slider found in container:", container);
                return;
            }
            if (!label) {
                if (debug) console.warn("[initializeSlider] No label found in container:", container);
                return;
            }

            const optionsArray = getOptionsCallback(container);
            if (!optionsArray || !optionsArray.length) {
                console.error("[initializeSlider] No options found or empty options array for container:", container);
                return;
            }

            const updateLabel = () => updateLabelForSlider(slider, label, optionsArray);

            // Clean up old listeners if any
            slider.removeEventListener('input', updateLabel);
            window.removeEventListener('resize', updateLabel);

            // Add listeners
            slider.addEventListener('input', updateLabel);
            window.addEventListener('resize', updateLabel);

            // Initial update
            updateLabel();
            if (debug) console.log("[initializeSlider] Slider initialized successfully:", container);
        };

        // Initialize existing containers
        const containers = document.querySelectorAll(sliderContainerSelector);
        if (debug) console.log("[initSliderLabel] Found", containers.length, "existing containers.");
        containers.forEach(initializeSlider);

        // Observe for future sliders
        const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.matches(sliderContainerSelector)) {
                        if (debug) console.log("[MutationObserver] New slider-container detected:", node);
                        initializeSlider(node);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        if (debug) console.log("[initSliderLabel] Observer initialized for:", sliderContainerSelector);
    }

    // Call initSliderLabel with the correct selector and callback
    // Ensure that your showQuestion sets sliderContainer.dataset.options = JSON.stringify(question.options)
    initSliderLabel('.slider-container', (container) => {
        const options = container.dataset.options ? JSON.parse(container.dataset.options) : [];
        if (debug) console.log("[getOptionsCallback] Options for container:", container, options);
        return options;
    }, debug);
});