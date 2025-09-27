let current = 0;
const quiz = document.getElementById("quiz");

function loadQuestion() {
  quiz.innerHTML = "";
  const q = questions[current];

  const qEl = document.createElement("div");
  qEl.className = "question";
  qEl.innerText = q.question;
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
  } else {
    button.classList.add("wrong");
  }
  setTimeout(() => {
    current++;
    if (current < questions.length) {
      loadQuestion();
    } else {
      quiz.innerHTML = "<h2>סיימת את הטריוויה! 🎉</h2>";
    }
  }, 1000);
}

loadQuestion();
