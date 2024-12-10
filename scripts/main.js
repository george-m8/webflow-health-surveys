document.addEventListener('DOMContentLoaded', initSurvey);

async function initSurvey() {
  const container = document.getElementById('survey-container');
  
  // Fetch the survey configuration
  const response = await fetch('config/asrs.json');
  const config = await response.json();
  
  // Render the title and description
  const titleElem = document.createElement('h1');
  titleElem.textContent = config.title;
  container.appendChild(titleElem);

  const descElem = document.createElement('p');
  descElem.textContent = config.description;
  container.appendChild(descElem);

  // Render the form
  const formElem = document.createElement('form');
  formElem.id = 'survey-form';

  config.questions.forEach((q, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';

    const label = document.createElement('label');
    label.textContent = q.text;
    label.setAttribute('for', 'q' + index);

    const select = document.createElement('select');
    select.name = 'q' + index;
    q.options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      select.appendChild(option);
    });

    questionDiv.appendChild(label);
    questionDiv.appendChild(select);
    formElem.appendChild(questionDiv);
  });

  const submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.textContent = 'Calculate Score';
  submitBtn.addEventListener('click', () => calculateScore(config));
  
  formElem.appendChild(submitBtn);
  container.appendChild(formElem);

  // Result section
  const resultDiv = document.createElement('div');
  resultDiv.id = 'result';
  resultDiv.className = 'result';
  resultDiv.style.display = 'none';
  container.appendChild(resultDiv);
}

function calculateScore(config) {
  const form = document.getElementById('survey-form');
  const selects = form.querySelectorAll('select');
  
  let totalScore = 0;
  selects.forEach(s => {
    totalScore += parseInt(s.value, 10);
  });
  
  // Determine band
  const band = config.scoringBands.find(b => totalScore >= b.min && totalScore <= b.max);
  
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';
  
  const scoreElem = document.createElement('p');
  scoreElem.textContent = `Your Score: ${totalScore}`;
  resultDiv.appendChild(scoreElem);

  if (band) {
    const messageElem = document.createElement('p');
    messageElem.textContent = band.message;
    resultDiv.appendChild(messageElem);

    if (band.resources && band.resources.length > 0) {
      const resList = document.createElement('ul');
      band.resources.forEach(resource => {
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

  resultDiv.style.display = 'block';
}