This project aims to create highly customisable surveys that will be imported to a Webflow site using their custom HTML blocks.

Currently working on ASRS survey for ADHD.


Notes:
- [x] Finish ASRS survey
- [x] Deploy via Netlify
- [x] Publish to Webflow site
- [x] The label logic is currently a bit messy and not well written:
    - [x] It SHOULD pull the labels from the json file for each question so that it can work for different surveys where the labels vary question to question
    - [x] Should move the inline code from html into the slider-style.js file.
    - [x] Have found that this code breaks after first question...
    - For Aq10 with different labels we are having issues, currently just the first question has wrong labels, rest are fine
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
