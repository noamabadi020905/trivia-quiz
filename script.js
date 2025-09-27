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

  // --- פונקציית shuffle ---
  function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // --- התחלת המשחק לפי פרק ---
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

  // --- הצגת שאלה ---
  function showQuestion() {
    const q = quizQuestions[currentIndex];
    questionText.textContent = q.q;
    optionsDiv.innerHTML = "";

    const multiAnswer = Array.isArray(q.a) && q.a.length > 1;

    q.options.forEach(opt => {
      const label = document.createElement("label");
      label.style.display = "block";

      const input = document.createElement("input");
      input.type = multiAnswer ? "checkbox" : "radio";
      input.name = "answer";
      input.value = opt;

      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      optionsDiv.appendChild(label);
    });

    if (!multiAnswer) {
      // שאלות רגילות - בודקות בלחיצה
      Array.from(optionsDiv.querySelectorAll("input")).forEach(input => {
        input.onclick = () => handleSingleAnswer(input.value, q);
      });
    } else {
      // שאלות עם checkbox - כפתור בדיקה
      const checkBtn = document.createElement("button");
      checkBtn.textContent = "בדוק תשובות";
      checkBtn.onclick = () => checkMultiAnswer(q);
      optionsDiv.appendChild(checkBtn);
    }
  }

  // --- טיפול בשאלה עם תשובה אחת ---
  function handleSingleAnswer(selected, question) {
    if (selected === question.a) {
      markSingleAnswer(selected, "correct");
      setTimeout(nextQuestion, 800);
    } else {
      markSingleAnswer(selected, "wrong");
      if (!wrongAnswers.includes(question)) wrongAnswers.push(question);
    }
  }

  function markSingleAnswer(selected, status) {
    const inputs = optionsDiv.querySelectorAll("input");
    inputs.forEach(input => {
      if (input.value === selected) {
        input.parentElement.classList.add(status);
      }
      input.disabled = true;
    });
  }

  // --- טיפול בשאלות מרובות תשובות ---
  function checkMultiAnswer(question) {
    const inputs = Array.from(optionsDiv.querySelectorAll("input:checked"));
    const selected = inputs.map(i => i.value);

    const labels = optionsDiv.querySelectorAll("label");
    labels.forEach(label => {
      const val = label.querySelector("input").value;
      if (question.a.includes(val)) {
        label.style.color = "green"; // נכון
      } else if (selected.includes(val) && !question.a.includes(val)) {
        label.style.color = "red"; // טעות
      } else {
        label.style.color = "inherit"; // לא נבחר
      }
    });

    if (arraysEqual(selected, question.a)) {
      setTimeout(nextQuestion, 1000);
    } else {
      alert("טעית או חסר משהו, נסה שוב!");
    }
  }

  // --- מעבר לשאלה הבאה ---
  function nextQuestion() {
    currentIndex++;
    if (currentIndex >= quizQuestions.length) {
      showSummary();
    } else {
      showQuestion();
    }
  }

  // --- סיום המשחק ---
  function showSummary() {
    quizDiv.classList.add("hidden");
    summaryDiv.classList.remove("hidden");

    if (wrongAnswers.length === 0) {
      wrongAnswersDiv.innerHTML = "<p>כל התשובות נכונות! כל הכבוד 🎉</p>";
    } else {
      let html = "<h3>שאלות שבהן טעית:</h3><ul>";
      wrongAnswers.forEach(q => {
        html += `<li>${q.q} - תשובה נכונה: ${Array.isArray(q.a) ? q.a.join(", ") : q.a}</li>`;
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

  // --- עזרה להשוואת מערכים ---
  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every(val => b.includes(val));
  }

  // --- יצירת כפתורי פרקים ---
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
