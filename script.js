// אלמנטים קיימים
const examSelect = document.getElementById('examSelect');
const menu = document.getElementById('menu');
const chaptersDiv = document.getElementById('chapters');
const game = document.getElementById('game');
const summary = document.getElementById('summary');
const questionText = document.getElementById('questionText');
const optionsDiv = document.getElementById('options');
const feedback = document.getElementById('feedback');
const chapterName = document.getElementById('chapterName');
const progress = document.getElementById('progress');
const submitBtn = document.getElementById('submitBtn');
const scoreText = document.getElementById('scoreText');
const shuffleCheckbox = document.getElementById('shuffleQuestions');
const exitBtn = document.getElementById('exitBtn');
const menuBtn = document.getElementById('menuBtn');
const againBtn = document.getElementById('againBtn');
const allBtn = document.getElementById('allBtn');
const backToExamSelectBtn = document.getElementById('backToExamSelect');

// מצב משחק
let currentSet = [];
let chapterLabel = '';
let index = 0;
let score = 0;
let shuffledOptionsCache = new WeakMap();
let lastKey = '';        // זוכר איזה "מפתח" משחק שיחקנו (__ALL__, שם פרק, __MAOZ__)
let currentExam = null;  // 'raf0' / 'maoz' וכו'

// --- בחירת מבחן ---

function attachExamSelectHandlers() {
  const buttons = examSelect.querySelectorAll('button[data-exam]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const examKey = btn.getAttribute('data-exam');
      chooseExam(examKey);
    });
  });
}

function chooseExam(examKey) {
  currentExam = examKey;

  // מסתירים מסך בחירת מבחן
  examSelect.classList.add('hidden');

  if (examKey === 'raf0') {
    // מבחן רף 0: עובדים לפי פרקים (השאלות הקיימות היום)
    menu.classList.remove('hidden');
    showMenu();
  } else if (examKey === 'maoz') {
    // מבחן מעוז: בנק שאלות אחד, ללא פרקים
    if (typeof maozQuestions === 'undefined' || !Array.isArray(maozQuestions) || !maozQuestions.length) {
      alert('עדיין לא הוגדרו שאלות למבחן מעוז בקובץ questions.js');
      // חוזרים למסך בחירת מבחן
      examSelect.classList.remove('hidden');
    } else {
      startGame('__MAOZ__');
    }
  } else {
    // אם בעתיד תוסיפי מבחנים נוספים
    alert('סוג מבחן לא מוכר כרגע');
    examSelect.classList.remove('hidden');
  }
}

// --- תפריט פרקים (מבחן רף 0) ---

function showMenu() {
  chaptersDiv.innerHTML = '';
  Object.keys(questions).forEach(k => {
    const btn = document.createElement('button');
    btn.textContent = `📘 ${k}`;
    btn.onclick = () => startGame(k);
    chaptersDiv.appendChild(btn);
  });
}

function gatherAll() {
  return Object.values(questions).flat();
}

// --- התחלת משחק ---

function startGame(key) {
  lastKey = key;  // נשמור כדי ש"שחק שוב" ידע מה להפעיל

  if (key === '__ALL__') {
    // כל הפרקים של מבחן רף 0
    chapterLabel = 'כל הפרקים';
    currentSet = gatherAll();
  } else if (key === '__MAOZ__') {
    // מבחן מעוז – בנק אחד של שאלות
    chapterLabel = 'מבחן מעוז';
    currentSet = (typeof maozQuestions !== 'undefined') ? maozQuestions.slice() : [];
  } else {
    // פרק יחיד במבחן רף 0
    chapterLabel = key;
    currentSet = questions[key];
  }

  if (!currentSet || !currentSet.length) {
    alert('לא נמצאו שאלות עבור הבחירה הזו.');
    // חזרה למסך המתאים
    if (currentExam === 'raf0') {
      menu.classList.remove('hidden');
    } else {
      examSelect.classList.remove('hidden');
    }
    return;
  }

  if (shuffleCheckbox.checked && currentExam === 'raf0') {
    // ערבוב שאלות – הגיוני כרגע רק לרף 0; אם תרצי אפשר לאפשר גם למעוז
    currentSet = shuffleArray(currentSet);
  }

  index = 0;
  score = 0;
  shuffledOptionsCache = new WeakMap();

  menu.classList.add('hidden');
  summary.classList.add('hidden');
  game.classList.remove('hidden');

  renderQuestion(true);
}

// --- רינדור שאלה ---

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
    opts = shuffleArray(q.options);
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
    void box.offsetWidth;
    box.classList.add('fade-slide');
  }
}

// --- עזר ---

function getPicked() {
  return Array.from(optionsDiv.querySelectorAll('input:checked')).map(i => i.value);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every(x => b.includes(x));
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- לחיצה על בדיקת תשובה ---

submitBtn.onclick = () => {
  const q = currentSet[index];
  const picked = getPicked();
  if (!picked.length) {
    feedback.textContent = 'בחר/י תשובה';
    feedback.style.color = 'orange';
    return;
  }
  const correct = q.a;
  if (arraysEqual(picked.slice().sort(), correct.slice().sort())) {
    feedback.textContent = 'נכון ✅';
    feedback.style.color = '#34d399';
    score++;
    setTimeout(() => {
      index++;
      if (index < currentSet.length) renderQuestion();
      else endGame();
    }, 700);
  } else {
    feedback.textContent = 'לא נכון ❌ נסה/י שוב';
    feedback.style.color = '#f87171';
    optionsDiv.querySelectorAll('input').forEach(i => i.checked = false);
  }
};

// --- כפתור "סיים טריוויה" באמצע ---

exitBtn.onclick = () => {
  if (confirm('האם ברצונך לסיים את הטריוויה ולחזור לתפריט?')) {
    game.classList.add('hidden');
    summary.classList.add('hidden');
    if (currentExam === 'raf0') {
      menu.classList.remove('hidden');
    } else {
      examSelect.classList.remove('hidden');
    }
  }
};

// --- סוף משחק ---

function endGame() {
  game.classList.add('hidden');
  summary.classList.remove('hidden');
  scoreText.textContent = `ניקוד: ${score}/${currentSet.length}`;
}

// --- כפתורי סיכום/תפריט ---

againBtn.onclick = () => startGame(lastKey);

menuBtn.onclick = () => {
  summary.classList.add('hidden');
  if (currentExam === 'raf0') {
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

// הפעלה ראשונית
attachExamSelectHandlers();
