## Description
This project aims to create highly customisable surveys that will be imported to a website, specifically site builders where custom code blocks must be used for this type of functionality.

The site can be self-hosted. But is available at [https://health-surveys.netlify.app](https://health-surveys.netlify.app).

## Demos
- [ASRS Demo](https://health-surveys.netlify.app/?survey=asrs)
- [AQ-10 Demo](https://health-surveys.netlify.app/?survey=aq10)
- [ERQ Demo](https://health-surveys.netlify.app/?survey=erq)
- [TAS-DIF Demo](https://health-surveys.netlify.app/?survey=tasdif)

## Embed Example:
``` html
<!-- Main styles file -->
<link rel="stylesheet" href="https://health-surveys.netlify.app/styles/styles.css"> 
<!-- CSS for slider label-->
<link rel="stylesheet" href="https://health-surveys.netlify.app/styles/slider-styles.css"> 
<!-- Optionally include animation CSS -->
<link rel="stylesheet" href="https://health-surveys.netlify.app/styles/styles-animation.css"> 
<div class="container" id="health-surveys-container">
  <div id="survey-container">
    <!-- Form will be dynamically injected here -->
  </div>
</div>
<!-- Main JS for surveys -->
<script src="https://health-surveys.netlify.app/scripts/main.js"></script> 
<!-- JS for moving slider label -->
<script src="https://health-surveys.netlify.app/scripts/slider-label.js"></script> 
<script>
    // Select a specific survey using the global survey variable
	window.survey = 'tasdif';
    // If not used, survey can be selected via URL query. Example: ?survey=tasdif
    // If no other survey is selected, the default ASRS survey will be loaded
</script>
```

## Notes/To Do:
- [x] Finish ASRS survey
- [x] Deploy via Netlify
- [x] Publish to Webflow site
- [x] The label logic is currently a bit messy and not well written:
    - [x] It SHOULD pull the labels from the json file for each question so that it can work for different surveys where the labels vary question to question
    - [x] Should move the inline code from html into the slider-style.js file.
    - [x] Have found that this code breaks after first question...
    - [x] For AQ10 with different labels we are having issues, currently just the first question has wrong labels, rest are fine
        - [x] work on simplifying code
        - [x] labels should always pull from json, no point in default vals - they will be wrong.
- [x] Add AQ-10 surey
- [x] Redo ERQ survey using this project
- [x] Redo TAS-DIF
- [ ] Add animations to the project
    - [x] Animate "back" button reveal
    - [ ] Animate "back" button hide
    - [ ] Animate question fade in
    - [ ] Animate question fade out
    - [ ] Animate results reveal
    - [x] Animate slider label movement to smooth out
- [ ] Would be nice to have the resource URLs shown in results all be grouped together in one list at bottom
    - [ ] I would need to consider what would be done with duplicate URLs although not sure we have any cases currently that would cause issue.