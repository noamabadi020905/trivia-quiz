let current = 0;
let correctCount = 0;
let wrongCount = 0;

const quiz = document.getElementById("quiz");
const progressBar = document.getElementById("progress-bar");

function updateProgress() {
  const percent = ((current) / questions.length) * 100;
  progressBar.style.width = percent + "%";
}

function loadQuestion() {
  quiz.innerHTML = "";
  const q = questions[current];

  updateProgress();

  const qEl = document.createElement("div");
  qEl.className = "question";
  qEl.innerText = `שאלה ${current + 1} מתוך ${questions.length}: ${q.question}`;
  quiz.appendChild(qEl);

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerText = option;
    btn.onclick = () => checkAnswer(btn, q.answer);
    quiz.appendChild(btn);
  });
}

function checkAnswer(button, correct) {
  if (button.innerText === correct) {
    button.classList.add("correct");
    correctCount++;
    setTimeout(() => {
      current++;
      if (current < questions.length) {
        loadQuestion();
      } else {
        updateProgress(); // 100% בסוף
        showSummary();
      }
    }, 800);
  } else {
    button.classList.add("wrong");
    wrongCount++;
    // אפשר לבחור שוב (לא מחליפים שאלה)
  }
}

function showSummary() {
  quiz.innerHTML = `
    <div class="summary">
      <h2>סיימת את הטריוויה! 🎉</h2>
      <p>✅ תשובות נכונות: ${correctCount}</p>
      <p>❌ תשובות שגויות: ${wrongCount}</p>
    </div>
  `;
}

loadQuestion();
