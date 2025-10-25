
const menu=document.getElementById('menu');
const chaptersDiv=document.getElementById('chapters');
const game=document.getElementById('game');
const summary=document.getElementById('summary');
const questionText=document.getElementById('questionText');
const optionsDiv=document.getElementById('options');
const feedback=document.getElementById('feedback');
const chapterName=document.getElementById('chapterName');
const progress=document.getElementById('progress');
const submitBtn=document.getElementById('submitBtn');
const scoreText=document.getElementById('scoreText');
const shuffleCheckbox=document.getElementById('shuffleQuestions');
const exitBtn=document.getElementById('exitBtn');

let currentSet=[],chapter='',index=0,score=0;
let shuffledOptionsCache=new WeakMap();

function showMenu(){
  chaptersDiv.innerHTML='';
  Object.keys(questions).forEach(k=>{
    const btn=document.createElement('button');
    btn.textContent=`📘 ${k}`;
    btn.onclick=()=>startGame(k);
    chaptersDiv.appendChild(btn);
  });
}

function gatherAll(){return Object.values(questions).flat();}

function startGame(k){
  chapter=k==='__ALL__'?'כל הפרקים':k;
  currentSet=k==='__ALL__'?gatherAll():questions[k];
  if(shuffleCheckbox.checked){currentSet=shuffleArray(currentSet);} // ערבוב שאלות אם נבחר
  index=0;score=0;shuffledOptionsCache=new WeakMap();
  menu.classList.add('hidden');summary.classList.add('hidden');game.classList.remove('hidden');
  renderQuestion(true);
}

function renderQuestion(first=false){
  feedback.textContent='';
  const q=currentSet[index];
  chapterName.textContent=chapter;
  progress.textContent=`שאלה ${index+1} מתוך ${currentSet.length}`;
  questionText.textContent=q.q;
  optionsDiv.innerHTML='';
  const multi=Array.isArray(q.a)&&q.a.length>1;
  let opts=shuffledOptionsCache.get(q);
  if(!opts){opts=shuffleArray(q.options);shuffledOptionsCache.set(q,opts);}  
  opts.forEach(opt=>{
    const label=document.createElement('label');
    const input=document.createElement('input');
    input.type=multi?'checkbox':'radio';
    input.name='option';
    input.value=opt;
    label.appendChild(input);
    label.appendChild(document.createTextNode(opt));
    optionsDiv.appendChild(label);
  });
  if(!first){const box=document.getElementById('questionBox');box.classList.remove('fade-slide');void box.offsetWidth;box.classList.add('fade-slide');}
}

function getPicked(){return Array.from(optionsDiv.querySelectorAll('input:checked')).map(i=>i.value);}
function arraysEqual(a,b){return a.length===b.length&&a.every(x=>b.includes(x));}
function shuffleArray(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

submitBtn.onclick=()=>{
  const q=currentSet[index];
  const picked=getPicked();
  if(!picked.length){feedback.textContent='בחר/י תשובה';feedback.style.color='orange';return;}
  const correct=q.a;
  if(arraysEqual(picked.slice().sort(),correct.slice().sort())){
    feedback.textContent='נכון ✅';feedback.style.color='#34d399';score++;
    setTimeout(()=>{index++;if(index<currentSet.length)renderQuestion();else endGame();},700);
  } else {feedback.textContent='לא נכון ❌ נסה/י שוב';feedback.style.color='#f87171';optionsDiv.querySelectorAll('input').forEach(i=>i.checked=false);}
}

// כפתור סיום טריוויה באמצע
exitBtn.onclick=()=>{
  if(confirm('האם ברצונך לסיים את הטריוויה ולחזור לתפריט הראשי?')){
    game.classList.add('hidden');
    summary.classList.add('hidden');
    menu.classList.remove('hidden');
  }
};

function endGame(){game.classList.add('hidden');summary.classList.remove('hidden');scoreText.textContent=`ניקוד: ${score}/${currentSet.length}`;}

document.getElementById('againBtn').onclick=()=>startGame(chapter);
document.getElementById('menuBtn').onclick=()=>{summary.classList.add('hidden');menu.classList.remove('hidden');};
document.getElementById('allBtn').onclick=()=>startGame('__ALL__');

showMenu();
