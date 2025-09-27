const partsButtonsDiv = document.getElementById("parts-buttons");
const allPartsBtn = document.getElementById("all-parts-btn");
const menuDiv = document.getElementById("menu");
const quizDiv = document.getElementById("quiz");
const questionText = document.getElementById("question-text");
const optionsDiv = document.getElementById("options");
const retryBtn = document.getElementById("retry-btn");
const summaryDiv = document.getElementById("summary");
const wrongAnswersDiv = document.getElementById("wrong-answers");
const playAgainBtn = document.getElementById("play-again-btn");

let quizQuestions = [];
let currentIndex = 0;
let wrongAnswers = [];

function startQuiz(part) {
  menuDiv.classList.add("hidden");
  quizDiv.classList.remove("hidden");
  wrongAnswers = [];
  currentIndex = 0;

  if (part === "all") {
    quizQuestions = [];
    for (let key in questions) {
      const partQs = questions[key];
      quizQuestions.push(partQs[Math.floor(Math.random() * partQs.length)]);
    }
  } else {
    quizQuestions = questions[part];
  }

  showQuestion();
}

function showQuestion() {
  retryBtn.classList.add("hidden");
  const q = quizQuestions[currentIndex];
  questionText.textContent = q.q;
  optionsDiv.innerHTML = "";
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(opt);
    optionsDiv.appendChild(btn);
  });
}

function handleAnswer(selected) {
  const q = quizQuestions[currentIndex];
  const buttons = optionsDiv.querySelectorAll("button");

  buttons.forEach(btn => btn.disabled = true);

  if (selected === q.a) {
    buttons.forEach(btn => {
      if (btn.textContent === selected) btn.classList.add("correct");
    });
    setTimeout(nextQuestion, 1000);
  } else {
    buttons.forEach(btn => {
      if (btn.textContent === selected) btn.classList.add("wrong");
    });
    retryBtn.classList.remove("hidden");
  }
}

function nextQuestion() {
  const q = quizQuestions[currentIndex];
  if (retryBtn.style.display !== "none") {
    wrongAnswers.push(q);
  }
  currentIndex++;
  if (currentIndex >= quizQuestions.length) {
    showSummary();
  } else {
    showQuestion();
  }
}

retryBtn.onclick = () => {
  retryBtn.classList.add("hidden");
  const buttons = optionsDiv.querySelectorAll("button");
  buttons.forEach(btn => btn.disabled = false);
  buttons.forEach(btn => btn.classList.remove("wrong"));
};

function showSummary() {
  quizDiv.classList.add("hidden");
  summaryDiv.classList.remove("hidden");

  if (wrongAnswers.length === 0) {
    wrongAnswersDiv.innerHTML = "<p>כל התשובות נכונות! כל הכבוד 🎉</p>";
  } else {
    let html = "<h3>שאלות שבהן טעית:</h3><ul>";
    wrongAnswers.forEach(q => {
      html += `<li>${q.q} - תשובה נכונה: ${q.a}</li>`;
    });
    html += "</ul>";
    wrongAnswersDiv.innerHTML = html;
  }
}

playAgainBtn.onclick = () => location.reload();

// Generate buttons for parts
for (let key in questions) {
  const btn = document.createElement("button");
  btn.textContent = `חלק: ${key.replace("part_", "")}`;
  btn.onclick = () => startQuiz(key);
  partsButtonsDiv.appendChild(btn);
}

allPartsBtn.onclick = () => startQuiz("all");
