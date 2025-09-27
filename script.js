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

  // Map part keys to CSS classes for buttons
  const partClasses = {
    "1 - 3": "part-btn-1",
    "4 - 5": "part-btn-2",
    "6 - 7": "part-btn-3",
    "רפואה": "part-btn-4",
    "נשק": "part-btn-5",
    "המנון": "part-btn-4",
    "תחקיר": "part-btn-5",
    "מפת ארץ ישראל": "part-btn-2"
  };

  function startQuiz(partKey) {
    menuDiv.style.display = "none";
    quizDiv.style.display = "block";
    summaryDiv.style.display = "none";

    wrongAnswers = [];
    currentIndex = 0;

    // תקן במקרה של "כל החלקים"
    if (partKey === "all") {
      quizQuestions = [];
      for (let key in questions) {
        const partQs = questions[key];
        quizQuestions.push(partQs[Math.floor(Math.random() * partQs.length)]);
      }
    } else {
      quizQuestions = questions[partKey];
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

      // קבלת שם החלק של השאלה
      const partKey = getPartKeyByQuestion(q);
      if (partKey && partClasses[partKey]) {
        btn.classList.add(partClasses[partKey]);
      }

      btn.onclick = () => handleAnswer(opt, q, btn);
      optionsDiv.appendChild(btn);
    });
  }

  function handleAnswer(selected, question, button) {
    if (selected === question.a) {
      button.classList.add("correct");
      optionsDiv.querySelectorAll("button").forEach(btn => btn.disabled = true);
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
    quizDiv.style.display = "none";
    summaryDiv.style.display = "block";

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
    menuDiv.style.display = "block";
    summaryDiv.style.display = "none";
    quizDiv.style.display = "none";
  };

  // Helper to find part key for a question
  function getPartKeyByQuestion(question) {
    for (let key in questions) {
      if (questions[key].includes(question)) return key;
    }
    return null;
  }

  // Generate buttons for each part dynamically
  for (let key in questions) {
    const btn = document.createElement("button");
    btn.textContent = `חלק: ${key.trim()}`;
    const className = partClasses[key.trim()] || "";
    if (className) btn.classList.add(className);

    // שימוש ב-trim כדי למנוע רווחים בשמות המפתחות
    btn.onclick = () => startQuiz(key.trim());
    partsButtonsDiv.appendChild(btn);
  }

  allPartsBtn.classList.add("part-btn-all");
  allPartsBtn.onclick = () => startQuiz("all");
});
