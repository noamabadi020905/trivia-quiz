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

  function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function startQuiz(partKey) {
    menuDiv.classList.add("hidden");
    quizDiv.classList.remove("hidden");
    summaryDiv.classList.add("hidden");

    wrongAnswers = [];
    currentIndex = 0;

    if (partKey === "all") {
      quizQuestions = [];
      for (let key in questions) {
        quizQuestions = quizQuestions.concat(questions[key]);
      }
      quizQuestions = shuffleArray(quizQuestions);
    } else {
      quizQuestions = shuffleArray(questions[partKey]);
    }

    showQuestion();
  }

  function showQuestion() {
    const q = quizQuestions[currentIndex];
    questionText.textContent = q.q;
    optionsDiv.innerHTML = "";

    const multiAnswer = q.a.length > 1;

    if (!multiAnswer) {
      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.onclick = () => handleSingleAnswer(opt, q, btn);
        optionsDiv.appendChild(btn);
      });
    } else {
      q.options.forEach(opt => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = opt;
        label.appendChild(input);
        label.appendChild(document.createTextNode(opt));
        optionsDiv.appendChild(label);
      });
      const checkBtn = document.createElement("button");
      checkBtn.textContent = "בדוק תשובות";
      checkBtn.onclick = () => checkMultiAnswer(q);
      optionsDiv.appendChild(checkBtn);
    }
  }

  function handleSingleAnswer(selected, question, button) {
    if (question.a.includes(selected)) {
      button.classList.add("correct");
      Array.from(optionsDiv.children).forEach(b => b.disabled = true);
      setTimeout(nextQuestion, 800);
    } else {
      button.classList.add("wrong");
      button.disabled = true;
      if (!wrongAnswers.includes(question)) wrongAnswers.push(question);
    }
  }

  function checkMultiAnswer(question) {
    const inputs = Array.from(optionsDiv.querySelectorAll("input:checked"));
    const selected = inputs.map(i => i.value);

    const labels = optionsDiv.querySelectorAll("label");
    labels.forEach(label => {
      const val = label.querySelector("input").value;
      if (question.a.includes(val)) label.style.color = "green";
      else if (selected.includes(val)) label.style.color = "red";
      else label.style.color = "inherit";
    });

    if (arraysEqual(selected, question.a)) {
      setTimeout(nextQuestion, 1000);
    } else {
      alert("טעית או חסר משהו, נסה שוב!");
    }
  }

  function nextQuestion() {
    currentIndex++;
    if (currentIndex >= quizQuestions.length) showSummary();
    else showQuestion();
  }

  function showSummary() {
    quizDiv.classList.add("hidden");
    summaryDiv.classList.remove("hidden");

    if (wrongAnswers.length === 0) {
      wrongAnswersDiv.innerHTML = "<p>כל התשובות נכונות! כל הכבוד 🎉</p>";
    } else {
      let html = "<h3>שאלות שבהן טעית:</h3><ul>";
      wrongAnswers.forEach(q => {
        html += `<li>${q.q} - תשובה נכונה: ${q.a.join(", ")}</li>`;
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

  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every(val => b.includes(val));
  }

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
