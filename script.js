document.addEventListener("DOMContentLoaded", () => {
  const menuDiv = document.getElementById("menu");
  const partsButtonsDiv = document.getElementById("parts-buttons");
  const allPartsBtn = document.getElementById("all-parts-btn");
  const quizDiv = document.getElementById("quiz");
  const questionText = document.getElementById("question-text");
  const optionsDiv = document.getElementById("options");
  const summaryDiv = document.getElementById("summary");
  const wrongAnswersDiv = document.getElementById("wrong-answers");
  const playAgainBtn = document.getElementById("play-again-btn");

  let quizQuestions = [];
  let currentIndex = 0;
  let wrongAnswers = [];

  function startQuiz(partKey) {
    menuDiv.classList.add("hidden");
    quizDiv.classList.remove("hidden");
    summaryDiv.classList.add("hidden");

    wrongAnswers = [];
    currentIndex = 0;

    if (partKey === "all") {
      quizQuestions = [];
      for (let key in questions) {
        const partQs = questions[key];
        quizQuestions.push(partQs[Math.floor(Math.random() * partQs.length)]);
      }
    } else {
      quizQuestions = [...questions[partKey]];
    }

    showQuestion();
  }

  function showQuestion() {
    const q = quizQuestions[currentIndex];
    questionText.textContent = q.q;
    optionsDiv.innerHTML = "";

    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => handleAnswer(opt, q, btn);
      optionsDiv.appendChild(btn);
    });
  }

  function handleAnswer(selected, question, button) {
    if (selected === question.a) {
      button.classList.add("correct");
      Array.from(optionsDiv.children).forEach(b => b.disabled = true);
      setTimeout(nextQuestion, 800);
    } else {
      button.classList.add("wrong");
      button.disabled = true;
      if (!wrongAnswers.includes(question)) wrongAnswers.push(question);
    }
  }

  function nextQuestion() {
    currentIndex++;
    if (currentIndex >= quizQuestions.length) {
      showSummary();
    } else {
      showQuestion();
    }
  }

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

  playAgainBtn.onclick = () => {
    menuDiv.classList.remove("hidden");
    summaryDiv.classList.add("hidden");
    quizDiv.classList.add("hidden");
  };

  // Generate part buttons
  const partColors = ["part-btn-1","part-btn-2","part-btn-3","part-btn-4","part-btn-5"];
  let colorIndex = 0;
  for (let key in questions) {
    const btn = document.createElement("button");
    btn.textContent = `חלק: ${key}`;
    btn.classList.add(partColors[colorIndex % partColors.length]);
    btn.onclick = () => startQuiz(key);
    partsButtonsDiv.appendChild(btn);
    colorIndex++;
  }

  allPartsBtn.onclick = () => startQuiz("all");
});
