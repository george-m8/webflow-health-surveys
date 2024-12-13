function initSliderLabel(sliderContainerSelector, getOptionsCallback, debug = false) {
    const updateLabelForSlider = (slider, label, optionsArray) => {
      const val = parseInt(slider.value, 10);
      label.textContent = optionsArray[val]?.label || "Unknown";
  
      const min = parseInt(slider.min, 10);
      const max = parseInt(slider.max, 10);
      const percent = (val - min) / (max - min);
  
      const containerWidth = slider.parentElement.offsetWidth;
      const labelHalfWidth = label.offsetWidth / 2;
      let labelCenterX = containerWidth * percent;
  
      // Clamp so label doesn't go beyond container edges
      labelCenterX = Math.max(labelHalfWidth, Math.min(containerWidth - labelHalfWidth, labelCenterX));
  
      label.style.left = `${labelCenterX}px`;
  
      if (debug) {
        console.log(`Value: ${val}, Options:`, optionsArray, `Percent: ${percent}, labelCenterX: ${labelCenterX}`);
      }
    };
  
    const initializeSlider = (container) => {
      const slider = container.querySelector('input[type="range"]');
      const label = container.querySelector('.slider-label');
  
      if (!slider || !label) {
        if (debug) console.warn("Slider or label missing in container:", container);
        return;
      }
  
      const optionsArray = getOptionsCallback(container);
  
      const updateLabel = () => updateLabelForSlider(slider, label, optionsArray);
  
      // Remove existing listeners to avoid duplicates
      slider.removeEventListener('input', updateLabel);
      window.removeEventListener('resize', updateLabel);
  
      // Attach listeners
      slider.addEventListener('input', updateLabel);
      window.addEventListener('resize', updateLabel);
  
      // Initialize position
      updateLabel();
    };
  
    // Initialize for existing containers
    const containers = document.querySelectorAll(sliderContainerSelector);
    containers.forEach(initializeSlider);
  
    // Observe for dynamically added containers
    const observer = new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.matches && node.matches(sliderContainerSelector)) {
            console.log("New slider-container detected:", node);
            initializeSlider(node);
          }
        });
      });
    });
  
    observer.observe(document.body, { childList: true, subtree: true });
  
    if (debug) console.log("Observer initialized for:", sliderContainerSelector);
  }