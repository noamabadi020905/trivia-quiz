// === רישום מבחנים גלובלי ===
window.EXAMS = window.EXAMS || [];

/**
 * כל קובץ מבחן קורא לפונקציה הזו עם אובייקט:
 * {
 *   id: 'raf0',
 *   title: 'מבחן רף 0',
 *   mode: 'chapters' | 'flat',
 *   questionsByChapter: {...}  // אם mode=chapters
 *   questions: [...]           // אם mode=flat
 * }
 */
function registerExam(examDef) {
  window.EXAMS.push(examDef);
}

// === משתני מצב ===
let currentExam = null;      // אובייקט המבחן הנוכחי
let currentSet = [];         // מערך השאלות למשחק הנוכחי
let chapterLabel = '';       // כותרת עליונה (פרק / שם מבחן)
let index = 0;
let score = 0;
let lastKey = null;          // לזכור על איזה פרק / מצב שיחקנו ("__ALL__", שם פרק, "__EXAM__")
let shuffledOptionsCache = new WeakMap();

// === DOM elements ===
let examSelect, examButtons, menu, examTitleEl, chaptersDiv, game, summary;
let questionText, optionsDiv, feedback, chapterName, progress;
let submitBtn, scoreText, shuffleCheckbox, exitBtn, menuBtn, againBtn, allBtn, backToExamSelectBtn;

// === אתחול אחרי טעינת ה־DOM והקבצים ===
window.addEventListener('DOMContentLoaded', () => {
  examSelect = document.getElementById('examSelect');
  examButtons = document.getElementById('examButtons');
  menu = document.getElementById('menu');
  examTitleEl = document.getElementById('examTitle');
  chaptersDiv = document.getElementById('chapters');
  game = document.getElementById('game');
  summary = document.getElementById('summary');
  questionText = document.getElementById('questionText');
  optionsDiv = document.getElementById('options');
  feedback = document.getElementById('feedback');
  chapterName = document.getElementById('chapterName');
  progress = document.getElementById('progress');
  submitBtn = document.getElementById('submitBtn');
  scoreText = document.getElementById('scoreText');
  shuffleCheckbox = document.getElementById('shuffleQuestions');
  exitBtn = document.getElementById('exitBtn');
  menuBtn = document.getElementById('menuBtn');
  againBtn = document.getElementById('againBtn');
  allBtn = document.getElementById('allBtn');
  backToExamSelectBtn = document.getElementById('backToExamSelect');

  buildExamSelectScreen();
  attachGeneralHandlers();
});

// === בניית מסך בחירת מבחן ===
function buildExamSelectScreen() {
  examButtons.innerHTML = '';

  if (!window.EXAMS.length) {
    const p = document.createElement('p');
    p.textContent = 'לא נטענו מבחנים. ודאי שקיימים קבצים בתיקיית exams ונקראו ב-index.html.';
    examButtons.appendChild(p);
    return;
  }

  window.EXAMS.forEach(exam => {
    const btn = document.createElement('button');
    btn.textContent = exam.title;
    btn.dataset.examId = exam.id;
    btn.onclick = () => chooseExam(exam.id);
    examButtons.appendChild(btn);
  });
}

// === בחירת מבחן ===
function chooseExam(examId) {
  currentExam = window.EXAMS.find(e => e.id === examId);
  if (!currentExam) {
    alert('לא נמצא מבחן עם מזהה כזה');
    return;
  }

  // איפוס תצוגה
  summary.classList.add('hidden');
  game.classList.add('hidden');
  menu.classList.add('hidden');

  if (currentExam.mode === 'chapters') {
    // מבחן שמחולק לפרקים (כמו רף 0)
    examTitleEl.textContent = currentExam.title;
    examSelect.classList.add('hidden');
    showChaptersMenu();
  } else {
    // מבחן "שטוח" – בלי פרקים (כמו מעוז)
    examSelect.classList.add('hidden');
    startGame('__EXAM__');
  }
}

// === תפריט פרקים למבחני mode="chapters" ===
function showChaptersMenu() {
  chaptersDiv.innerHTML = '';

  const qByChap = currentExam.questionsByChapter || {};
  const chapterNames = Object.keys(qByChap);

  if (!chapterNames.length) {
    alert('למבחן זה לא הוגדרו פרקים');
    examSelect.classList.remove('hidden');
    return;
  }

  chapterNames.forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = `📘 ${name}`;
    btn.onclick = () => startGame(name);
    chaptersDiv.appendChild(btn);
  });

  menu.classList.remove('hidden');
}

// === איסוף כל הפרקים יחד ===
function gatherAllChapters() {
  const qByChap = currentExam.questionsByChapter || {};
  return Object.values(qByChap).flat();
}

// === התחלת משחק ===
function startGame(key) {
  lastKey = key;
  shuffledOptionsCache = new WeakMap();

  if (!currentExam) {
    alert('לא נבחר מבחן');
    examSelect.classList.remove('hidden');
    return;
  }

  if (currentExam.mode === 'chapters') {
    if (key === '__ALL__') {
      chapterLabel = `${currentExam.title} - כל הפרקים`;
      currentSet = gatherAllChapters();
    } else {
      chapterLabel = key;
      const qByChap = currentExam.questionsByChapter || {};
      currentSet = qByChap[key] || [];
    }

    if (shuffleCheckbox.checked) {
      currentSet = shuffleArray(currentSet);
    }
  } else {
    // mode = 'flat'
    chapterLabel = currentExam.title;
    currentSet = (currentExam.questions || []).slice();
    // במבחנים "שטוחים" אפשר תמיד לשאפל
    currentSet = shuffleArray(currentSet);
  }

  if (!currentSet.length) {
    alert('לא נמצאו שאלות למבחן/פרק הזה');
    if (currentExam.mode === 'chapters') {
      menu.classList.remove('hidden');
    } else {
      examSelect.classList.remove('hidden');
    }
    return;
  }

  index = 0;
  score = 0;

  // מעבר למסך משחק
  menu.classList.add('hidden');
  summary.classList.add('hidden');
  game.classList.remove('hidden');

  renderQuestion(true);
}

// === רינדור שאלה ===
function renderQuestion(first = false) {
  feedback.textContent = '';
  const q = currentSet[index];

  chapterName.textContent = chapterLabel;
  progress.textContent = `שאלה ${index + 1} מתוך ${currentSet.length}`;
  questionText.textContent = q.q;
  optionsDiv.innerHTML = '';

  const multi = Array.isArray(q.a) && q.a.length > 1;

  let opts = shuffledOptionsCache.get(q);
  if (!opts) {
    opts = shuffleArray(q.options || []);
    shuffledOptionsCache.set(q, opts);
  }

  opts.forEach(opt => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = multi ? 'checkbox' : 'radio';
    input.name = 'option';
    input.value = opt;
    label.appendChild(input);
    label.appendChild(document.createTextNode(opt));
    optionsDiv.appendChild(label);
  });

  if (!first) {
    const box = document.getElementById('questionBox');
    box.classList.remove('fade-slide');
    void box.offsetWidth; // טריק לרענון האנימציה
    box.classList.add('fade-slide');
  }
}

// === עזר ===
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPicked() {
  return Array.from(optionsDiv.querySelectorAll('input:checked')).map(i => i.value);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every(x => b.includes(x));
}

// === האזנת לחיצה על "בדוק תשובה" וכו' ===
function attachGeneralHandlers() {
  submitBtn.onclick = () => {
    const q = currentSet[index];
    const picked = getPicked();

    if (!picked.length) {
      feedback.textContent = 'בחר/י תשובה';
      feedback.style.color = 'orange';
      return;
    }

    const correct = Array.isArray(q.a) ? q.a : [q.a];

    if (arraysEqual(picked.slice().sort(), correct.slice().sort())) {
      feedback.textContent = 'נכון ✅';
      feedback.style.color = '#34d399';
      score++;
      setTimeout(() => {
        index++;
        if (index < currentSet.length) {
          renderQuestion();
        } else {
          endGame();
        }
      }, 700);
    } else {
      feedback.textContent = 'לא נכון ❌ נסה/י שוב';
      feedback.style.color = '#f87171';
      optionsDiv.querySelectorAll('input').forEach(i => i.checked = false);
    }
  };

  exitBtn.onclick = () => {
    if (confirm('האם ברצונך לסיים את הטריוויה ולחזור לתפריט?')) {
      game.classList.add('hidden');
      summary.classList.add('hidden');
      if (currentExam && currentExam.mode === 'chapters') {
        menu.classList.remove('hidden');
      } else {
        examSelect.classList.remove('hidden');
      }
    }
  };

  againBtn.onclick = () => {
    // משחק שוב על אותו מבחן/פרק
    startGame(lastKey);
  };

  menuBtn.onclick = () => {
    summary.classList.add('hidden');
    if (currentExam && currentExam.mode === 'chapters') {
      menu.classList.remove('hidden');
    } else {
      examSelect.classList.remove('hidden');
    }
  };

  allBtn.onclick = () => startGame('__ALL__');

  backToExamSelectBtn.onclick = () => {
    menu.classList.add('hidden');
    examSelect.classList.remove('hidden');
  };
}

// === סוף משחק ===
function endGame() {
  game.classList.add('hidden');
  summary.classList.remove('hidden');
  scoreText.textContent = `ניקוד: ${score}/${currentSet.length}`;
}
