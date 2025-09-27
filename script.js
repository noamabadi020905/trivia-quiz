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

    // אם התשובה היא מחרוזת → שאלה עם תשובה אחת
    if (typeof q.a === "string" || (Array.isArray(q.a) && q.a.length === 1)) {
      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.onclick = () => handleSingleAnswer(opt, q, btn);
        optionsDiv.appendChild(btn);
      });
    } 
    // אם התשובה היא מערך → שאלה עם כמה תשובות
    else if (Array.isArray(q.a)) {
      q.options.forEach(opt => {
        const label = document.createElement("label");
        label.style.display = "block";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = opt;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(opt));
        optionsDiv.appendChild(label);
      });

      // כפתור אישור
      const submitBtn = document.createElement("button");
      submitBtn.textContent = "אישור";
      submitBtn.onclick = () => handleMultiAnswer(q);
      optionsDiv.appendChild(submitBtn);
    }
  }

  // טיפול בשאלות עם תשובה אחת
  function handleSingleAnswer(selected, question, button) {
    if (selected === question.a || (Array.isArray(question.a) && selected === question.a[0])) {
      button.classList.add("correct");
      Array.from(optionsDiv.children).forEach(b => b.disabled = true);
      setTimeout(nextQuestion, 800);
    } else {
      button.classList.add("wrong");
      button.disabled = true;
      if (!wrongAnswers.includes(question)) wrongAnswers.push(question);
    }
  }

  // טיפול בשאלות עם כמה תשובות
  function handleMultiAnswer(question) {
    const selected = Array.from(optionsDiv.querySelectorAll("input:checked"))
                          .map(cb => cb.value);

    const correctAnswers = question.a;

    const isCorrect = 
      selected.length === correctAnswers.length &&
      selected.every(ans => correctAnswers.includes(ans));

    if (isCorrect) {
      optionsDiv.querySelectorAll("input").forEach(cb => {
        if (correctAnswers.includes(cb.value)) {
          cb.parentElement.classList.add("correct");
        }
        cb.disabled = true;
      });
      setTimeout(nextQuestion, 1000);
    } else {
      optionsDiv.querySelectorAll("input").forEach(cb => {
        if (correctAnswers.includes(cb.value)) {
          cb.parentElement.classList.add("correct");
        } else if (cb.checked) {
          cb.parentElement.classList.add("wrong");
        }
        cb.disabled = true;
      });
      if (!wrongAnswers.includes(question)) wrongAnswers.push(question);
      setTimeout(nextQuestion, 1500);
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
