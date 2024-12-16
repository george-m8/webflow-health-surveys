document.addEventListener('DOMContentLoaded', initSurvey);

let currentQuestionIndex = 0;
let userAnswers = []; // Stores numeric values chosen for each question
let userSelectedIndices = []; // Stores the chosen slider index per question

// Set this to true to enable debug logs
const debug = false;

function getSurveyFile() {
    if (typeof window.survey !== 'undefined' && window.survey) {
        if (debug) console.log("[getSurveyFile] Using global survey:", window.survey);
        return `config/${window.survey}.json`;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const survey = urlParams.get('survey') || 'asrs'; // Default to 'asrs.json' if no parameter
    return `config/${survey}.json`;
}

async function initSurvey() {
    const container = document.getElementById('survey-container');

    // Define the base URLs
    const localBaseUrl = ''; // Local files are directly accessible, no need for a base URL
    const netlifyBaseUrl = 'https://health-surveys.netlify.app/';

    // Check if the script is running locally
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.hostname === '[::]' || 
                    window.location.hostname === '[::1]';

    // Determine the base URL and JSON file
    const baseUrl = isLocal ? localBaseUrl : netlifyBaseUrl;
    const jsonFile = getSurveyFile(); // Determine the JSON file to use
    const jsonUrl = `${baseUrl}${jsonFile}`;

    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${response.status}`);
        }
        const config = await response.json();

        if (debug) {
            console.log("Survey config loaded:", config);
            console.log("Number of questions:", config.questions.length);
        }

        // Render the title and description
        const titleElem = document.createElement('h1');
        titleElem.textContent = config.title;
        container.appendChild(titleElem);

        const descElem = document.createElement('p');
        descElem.textContent = config.description;
        container.appendChild(descElem);

        // Container for the question/slider
        const questionContainer = document.createElement('div');
        questionContainer.id = 'question-container';
        container.appendChild(questionContainer);

        // Navigation buttons
        const navContainer = document.createElement('div');
        navContainer.className = 'navigation-container';

        const backBtn = document.createElement('button');
        backBtn.id = 'backBtn';
        backBtn.textContent = 'Back';
        backBtn.style.display = 'none'; // Hidden for the first question
        backBtn.addEventListener('click', () => handleBack(config));
        navContainer.appendChild(backBtn);

        const nextBtn = document.createElement('button');
        nextBtn.id = 'nextBtn';
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => handleNext(config));
        navContainer.appendChild(nextBtn);

        container.appendChild(navContainer);

        // Create and append the result section here
        const resultDiv = document.createElement('div');
        resultDiv.id = 'result';
        resultDiv.className = 'result';
        resultDiv.style.display = 'none';
        container.appendChild(resultDiv);

        showQuestion(config, currentQuestionIndex);
    } catch (error) {
        console.error("Error initializing survey:", error);
        const errorElem = document.createElement('p');
        errorElem.textContent = "Failed to load the survey. Please try again later.";
        container.appendChild(errorElem);
    }
}

function showQuestion(config, index) {
    if (debug) console.log(`[showQuestion] Showing question at index ${index}`);

    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = ''; // Clear existing content

    const question = config.questions[index];
    if (!question) {
        if (debug) console.error("[showQuestion] No question found at index", index);
        return;
    }

    const previouslySelectedIndex = userSelectedIndices[index] !== undefined ? userSelectedIndices[index] : 0;
    const labelElem = document.createElement('label');
    labelElem.textContent = question.text;
    questionContainer.appendChild(labelElem);

    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    sliderContainer.dataset.options = JSON.stringify(question.options);

    const optionLabel = document.createElement('div');
    optionLabel.className = 'slider-label';
    optionLabel.textContent = question.options[previouslySelectedIndex]?.label || "Error";
    sliderContainer.appendChild(optionLabel);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = question.options.length - 1;
    slider.step = 1;
    slider.value = previouslySelectedIndex;
    slider.className = 'my-slider';
    sliderContainer.appendChild(slider);

    questionContainer.appendChild(sliderContainer);

    // Back button logic if any
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.style.display = index === 0 ? 'none' : 'inline-block';
    }

    if (debug) console.log("[showQuestion] Question rendered. The observer in slider-label.js should handle initialization.");
}

function handleNext(config) {
  const question = config.questions[currentQuestionIndex];
  if (!question) {
    if (debug) console.error("No question at currentQuestionIndex:", currentQuestionIndex);
    return;
  }

  const questionContainer = document.getElementById('question-container');
  const slider = questionContainer.querySelector('input[type="range"]');

  if (!slider) {
    if (debug) console.error("Slider not found at currentQuestionIndex:", currentQuestionIndex);
    return;
  }
  
  // Record the chosen value for this question
  const chosenIndex = parseInt(slider.value, 10);
  if (chosenIndex < 0 || chosenIndex >= question.options.length) {
    if (debug) console.error("Chosen index out of range:", chosenIndex);
    return;
  }

  const chosenOptionValue = question.options[chosenIndex].value;
  userAnswers[currentQuestionIndex] = chosenOptionValue;
  userSelectedIndices[currentQuestionIndex] = chosenIndex;

  if (debug) {
    console.log(`Answer recorded for Q${currentQuestionIndex}:`, chosenOptionValue, `(Index: ${chosenIndex})`);
  }

  // Move to the next question
  currentQuestionIndex++;

  if (currentQuestionIndex < config.questions.length) {
    // Show next question
    showQuestion(config, currentQuestionIndex);
  } else {
    // All questions answered, calculate results
    if (debug) console.log("All questions answered, showing results...");
    showResults(config);
  }
}

function handleBack(config) {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion(config, currentQuestionIndex);
  }
}

function showResults(config) {
    // Hide the question container
    const questionContainer = document.getElementById('question-container');
    if (questionContainer) {
      questionContainer.style.display = 'none';
    }
  
    // Hide the Next and Back buttons
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.style.display = 'none';
    }
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.style.display = 'none';
    }
  
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    resultDiv.style.display = 'block';
  
    const scoresByPart = {};
    config.questions.forEach((q, idx) => {
      if (!scoresByPart[q.part]) {
        scoresByPart[q.part] = 0;
      }
      const val = parseInt(userAnswers[idx], 10);
      scoresByPart[q.part] += isNaN(val) ? 0 : val;
    });
  
    if (debug) {
      console.log("Scores by part:", scoresByPart);
      console.log("partsInfo from config:", config.partsInfo);
    }
  
    for (const part in scoresByPart) {
      const partScore = scoresByPart[part];
      const partData = config.partsInfo[part];
  
      if (!partData) {
        if (debug) console.error(`No partsInfo found for part '${part}'`);
        continue;
      }
  
      // Display score as partScore/maxScore if maxScore exists, otherwise just partScore
      const scoreDisplay = partData.maxScore !== undefined 
        ? `${partScore}/${partData.maxScore}` 
        : partScore;
  
      const partTitle = document.createElement('h2');
      partTitle.textContent = `${partData.title}: ${scoreDisplay}`;
      resultDiv.appendChild(partTitle);
  
      const interpretation = partData.interpretation;
      if (interpretation.threshold !== undefined) {
        const meetsThreshold = partScore >= interpretation.threshold;
        const message = document.createElement('p');
        message.textContent = meetsThreshold ? 
          interpretation.positiveMessage : 
          interpretation.negativeMessage;
        resultDiv.appendChild(message);
  
        // Show appropriate resources based on threshold result
        const resources = meetsThreshold ? interpretation.positiveResources : interpretation.negativeResources;
        if (resources && resources.length > 0) {
          const resourceTitle = document.createElement('h3');
          resourceTitle.textContent = "What's next?";
          resultDiv.appendChild(resourceTitle);
  
          const resList = document.createElement('ul');
          resources.forEach(resource => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = resource.url;
            link.textContent = resource.text;
            link.target = '_blank';
            li.appendChild(link);
            resList.appendChild(li);
          });
          resultDiv.appendChild(resList);
        }
      } else {
        // No threshold, just show a note and resources if any
        if (interpretation.note) {
          const note = document.createElement('p');
          note.textContent = interpretation.note;
          resultDiv.appendChild(note);
        }
  
        if (interpretation.resources && interpretation.resources.length > 0) {
          const resourceTitle = document.createElement('h3');
          resourceTitle.textContent = "What's next?";
          resultDiv.appendChild(resourceTitle);
  
          const resList = document.createElement('ul');
          interpretation.resources.forEach(resource => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = resource.url;
            link.textContent = resource.text;
            link.target = '_blank';
            li.appendChild(link);
            resList.appendChild(li);
          });
          resultDiv.appendChild(resList);
        }
      }
    }
}