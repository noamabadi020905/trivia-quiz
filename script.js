let currentQuestion = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let wrongDetails = []; // שאלות שענו עליהן לא נכון

const app = document.getElementById("app");

function showQuestion() {
  const q = questions[currentQuestion];
  app.innerHTML = `
    <h1>${q.question}</h1>
    ${q.answers
      .map(
        (answer, i) =>
          `<button class="normal" onclick="checkAnswer(${i})">${answer}</button>`
      )
      .join("")}
    <p>שאלה ${currentQuestion + 1} מתוך ${questions.length}</p>
  `;
}

function checkAnswer(i) {
  const q = questions[currentQuestion];
  const buttons = document.querySelectorAll("button");

  if (i === q.correct) {
    buttons[i].classList.remove("normal");
    buttons[i].classList.add("correct");
    correctAnswers++;
    setTimeout(nextQuestion, 800);
  } else {
    buttons[i].classList.remove("normal");
    buttons[i].classList.add("wrong");
    wrongAnswers++;

    if (!wrongDetails.find(w => w.index === currentQuestion)) {
      wrongDetails.push({
        index: currentQuestion,
        question: q.question,
        correctAnswer: q.answers[q.correct]
      });
    }
  }
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  let tableHtml = "";
  if (wrongDetails.length > 0) {
    tableHtml = `
      <h2>טעויות:</h2>
      <table>
        <tr><th>שאלה</th><th>תשובה נכונה</th></tr>
        ${wrongDetails
          .map(
            w =>
              `<tr><td>${w.question}</td><td>${w.correctAnswer}</td></tr>`
          )
          .join("")}
      </table>
    `;
  }

  app.innerHTML = `
    <h1>המשחק הסתיים 🎉</h1>
    <p class="result">✅ נכונות: ${correctAnswers}</p>
    <p class="result">❌ שגויות: ${wrongAnswers}</p>
    ${tableHtml}
    <button class="normal" onclick="restartGame()">שחק שוב</button>
  `;
}

function restartGame() {
  currentQuestion = 0;
  correctAnswers = 0;
  wrongAnswers = 0;
  wrongDetails = [];
  showQuestion();
}

showQuestion();
