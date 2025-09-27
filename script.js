const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('next');
const quizDiv = document.getElementById('quiz');
const resultDiv = document.getElementById('result');
const scoreEl = document.getElementById('score');
const wrongTbody = document.querySelector('#wrong-answers tbody');
const playAgainBtn = document.getElementById('play-again');

let current = 0;
let score = 0;
let wrongAnswers = [];

function updateProgress() {
  const percent = ((current) / questions.length) * 100;
  document.getElementById('progress-bar').style.width = percent + '%';
}

function loadQuestion() {
  updateProgress();
  nextBtn.disabled = true;
  const q = questions[current];
  questionEl.textContent = q.question;
  answersEl.innerHTML = '';

  q.answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.textContent = ans;
    btn.className = 'normal';
    btn.addEventListener('click', () => selectAnswer(btn, i));
    answersEl.appendChild(btn);
  });
}

nextBtn.addEventListener('click', () => {
  current++;
  if (current < questions.length) {
    loadQuestion();
  } else {
    // complete progress bar
    document.getElementById('progress-bar').style.width = '100%';
    showResult();
  }
});

playAgainBtn.addEventListener('click', () => {
  current = 0;
  score = 0;
  wrongAnswers = [];
  quizDiv.style.display = 'block';
  resultDiv.style.display = 'none';
  document.getElementById('progress-bar').style.width = '0%';
  loadQuestion();
});

function selectAnswer(button, index) {
  const q = questions[current];
  const allBtns = answersEl.querySelectorAll('button');

  allBtns.forEach(btn => btn.disabled = true);

  if (index === q.correct) {
    button.className = 'correct';
    score++;
  } else {
    button.className = 'wrong';
    allBtns[q.correct].className = 'correct';
    wrongAnswers.push({
      question: q.question,
      yourAnswer: q.answers[index],
      correctAnswer: q.answers[q.correct]
    });
  }

  nextBtn.disabled = false;
}



function showResult() {
  quizDiv.style.display = 'none';
  resultDiv.style.display = 'block';

  // Animate score
  const scoreEl = document.getElementById('score');
  let displayedScore = 0;
  const totalScore = score;
  const interval = setInterval(() => {
    if (displayedScore >= totalScore) {
      clearInterval(interval);
    } else {
      displayedScore++;
      scoreEl.textContent = `נכונות: ${displayedScore} מתוך ${questions.length}`;
    }
  }, 200 / totalScore); // adjust speed
  

  // Fill wrong answers table
  const tbody = document.querySelector('#wrong-answers tbody');
  tbody.innerHTML = '';
  wrongAnswers.forEach(w => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${w.question}</td><td>${w.your}</td><td>${w.correct}</td>`;
    tbody.appendChild(tr);
  });
}



// initialize
loadQuestion();
