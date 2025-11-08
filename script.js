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
    // מבחן "שטוח" – בלי פרקים (כמו מעוז / מבחן סף)
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

    // תמיד מערבבים את סדר השאלות גם בפרקים
    currentSet = shuffleArray(currentSet);
  } else {
    // mode = 'flat'
    chapterLabel = currentExam.title;
    currentSet = (currentExam.questions || []).slice();
    // תמיד מערבבים את השאלות
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

  const isOrder = q.type === 'order';

  if (isOrder) {
    // ======= שאלה מסוג "סדר נכון" עם בחירה 1..N לכל משפט =======
    const list = document.createElement('div');
    list.id = 'orderList';
    list.className = 'order-list';

    const baseItems = (q.options && q.options.length ? q.options : q.a).slice();
    const shuffledItems = shuffleArray(baseItems);
    const n = baseItems.length;

    shuffledItems.forEach(text => {
      const row = document.createElement('div');
      row.className = 'order-row';
      row.dataset.value = text; // נשמור את המשפט לבדיקת הסדר

      const labelSpan = document.createElement('span');
      labelSpan.className = 'order-text';
      labelSpan.textContent = text;

      const select = document.createElement('select');
      select.className = 'order-select';

      // אפשרות ריקה בהתחלה
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = 'בחר/י מקום';
      select.appendChild(emptyOpt);

      // אופציות 1..N
      for (let i = 1; i <= n; i++) {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = String(i);
        select.appendChild(opt);
      }

      row.appendChild(labelSpan);
      row.appendChild(select);
      list.appendChild(row);
    });

    optionsDiv.appendChild(list);
  } else {
    // ======= שאלת ברירה רגילה (תשובה אחת / מרובות) =======
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
  }

  if (!first) {
    const box = document.getElementById('questionBox');
    box.classList.remove('fade-slide');
    void box.offsetWidth;
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

// השוואה ללא סדר – לשאלות רב־ברירה (כמה תשובות נכונות)
function arraysEqual(a, b) {
  return a.length === b.length && a.every(x => b.includes(x));
}

// השוואה עם סדר – לשאלות type: 'order'
function arraysEqualOrdered(a, b) {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

// === האזנת לחיצה על "בדוק תשובה" וכו' ===
function attachGeneralHandlers() {
  submitBtn.onclick = () => {
    const q = currentSet[index];

    // ===== שאלה מסוג "סדר נכון" =====
    if (q.type === 'order') {
      const list = document.getElementById('orderList');
      if (!list) {
        feedback.textContent = 'אירעה שגיאה בהצגת השאלה.';
        feedback.style.color = '#f87171';
        return;
      }

      const rows = Array.from(list.querySelectorAll('.order-row'));
      const n = rows.length;

      // קריאת הבחירות
      const rankToValue = {};
      const usedRanks = new Set();
      let missing = false;
      let duplicate = false;

      rows.forEach(row => {
        const value = row.dataset.value;
        const select = row.querySelector('select');
        const rankStr = select.value;
        const rank = parseInt(rankStr, 10);

        if (!rankStr) {
          missing = true;
          return;
        }
        if (usedRanks.has(rank)) {
          duplicate = true;
        }
        usedRanks.add(rank);
        rankToValue[rank] = value;
      });

      if (missing) {
        feedback.textContent = 'מלא/י מספר לכל משפט לפני בדיקה.';
        feedback.style.color = 'orange';
        return;
      }
      if (duplicate || usedRanks.size !== n) {
        feedback.textContent = 'לכל משפט חייב להיות מספר ייחודי (אין כפילויות).';
        feedback.style.color = 'orange';
        return;
      }

      // בניית הסדר כפי שהמשתמש בחר: 1..N
      const userOrder = [];
      for (let i = 1; i <= n; i++) {
        userOrder.push(rankToValue[i]);
      }

      const correctOrder = Array.isArray(q.a) ? q.a : [q.a];

      if (arraysEqualOrdered(userOrder, correctOrder)) {
        feedback.textContent = 'מעולה! כל המשפטים בסדר הנכון ✅';
        feedback.style.color = '#34d399';
        score++;
        setTimeout(() => {
          index++;
          if (index < currentSet.length) {
            renderQuestion();
          } else {
            endGame();
          }
        }, 900);
      } else {
        feedback.textContent = 'עדיין לא בדיוק, נסה/י לשנות את המספרים 😉';
        feedback.style.color = '#f97316';
      }

      return; // חשוב: לא להמשיך ללוגיקה של שאלת ברירה
    }

    // ===== מפה והלאה – שאלות רגילות (ברירה) =====
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
