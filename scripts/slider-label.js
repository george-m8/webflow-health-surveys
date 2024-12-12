function initSliderLabel(sliderContainerSelector, optionsArray, debug = false) {
    const containers = document.querySelectorAll(sliderContainerSelector);
    containers.forEach(container => {
      const slider = container.querySelector('input[type="range"]');
      const label = container.querySelector('.slider-label');
      if (!slider || !label) {
        if (debug) console.warn("Slider or label missing in container:", container);
        return;
      }
  
      function updateLabelPosition() {
        const val = parseInt(slider.value, 10);
        label.textContent = optionsArray[val];
  
        const min = parseInt(slider.min, 10);
        const max = parseInt(slider.max, 10);
        const percent = (val - min) / (max - min);
  
        const containerWidth = container.offsetWidth;
        const labelHalfWidth = label.offsetWidth / 2;
        let labelCenterX = containerWidth * percent;
  
        // Clamp so label doesn't go beyond container edges
        labelCenterX = Math.max(labelHalfWidth, Math.min(containerWidth - labelHalfWidth, labelCenterX));
  
        label.style.left = `${labelCenterX}px`;
  
        if (debug) {
          console.log(`Value: ${val}, Percent: ${percent}, labelCenterX: ${labelCenterX}`);
        }
      }
  
      // Initialize position
      updateLabelPosition();
      slider.addEventListener('input', updateLabelPosition);
      window.addEventListener('resize', updateLabelPosition);
    });
  }