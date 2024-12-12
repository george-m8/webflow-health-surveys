document.addEventListener('DOMContentLoaded', initSurvey);

let currentQuestionIndex = 0;
let userAnswers = []; // Stores numeric values chosen for each question

// Set this to true to enable debug logs
const debug = true;

async function initSurvey() {
  const container = document.getElementById('survey-container');

  // Fetch the survey configuration
  const response = await fetch('config/asrs.json');
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
  
  // Navigation button
  const nextBtn = document.createElement('button');
  nextBtn.id = 'nextBtn';
  nextBtn.textContent = 'Next';
  nextBtn.addEventListener('click', () => handleNext(config));
  container.appendChild(nextBtn);

  // Result section
  const resultDiv = document.createElement('div');
  resultDiv.id = 'result';
  resultDiv.className = 'result';
  resultDiv.style.display = 'none';
  container.appendChild(resultDiv);

  showQuestion(config, currentQuestionIndex);
}

function showQuestion(config, index) {
    if (debug) console.log(`Showing question at index ${index}`);
    
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = ''; // Clear existing content
  
    const question = config.questions[index];
    if (!question) {
      if (debug) console.error("No question found at index", index);
      return;
    }
  
    // Create the label and append it directly to the questionContainer
    const label = document.createElement('label');
    label.textContent = question.text;
    questionContainer.appendChild(label);
  
    // Create a slider container div
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
  
    // Create the option label and append to sliderContainer
    const optionLabel = document.createElement('div');
    optionLabel.className = 'slider-label';
    optionLabel.textContent = question.options[0].label;
    sliderContainer.appendChild(optionLabel);
  
    // Create the slider and append to sliderContainer
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = question.options.length - 1;
    slider.step = 1;
    slider.value = 0; // default to first option
    sliderContainer.appendChild(slider);
  
    // Append sliderContainer to questionContainer
    questionContainer.appendChild(sliderContainer);
  
    slider.addEventListener('input', () => {
      const val = parseInt(slider.value, 10);
      optionLabel.textContent = question.options[val].label;
    });
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

  if (debug) {
    console.log(`Answer recorded for Q${currentQuestionIndex}:`, chosenOptionValue);
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

function showResults(config) {
    // Hide the question container
    const questionContainer = document.getElementById('question-container');
    if (questionContainer) {
      questionContainer.style.display = 'none';
    }
  
    // Hide the Next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.style.display = 'none';
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