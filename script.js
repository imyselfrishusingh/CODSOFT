const LS_KEY = 'local_quizzes_v1';

function load() { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
function save(data){ localStorage.setItem(LS_KEY, JSON.stringify(data)); renderList(); }

function newQuestionBlock(){ 
  const div = document.createElement('div'); div.className='h-q';
  div.innerHTML = `
    <input class="q-text" placeholder="Question text" />
    <div class="opts"></div>
    <button class="btn add-opt">Add option</button>
    <button class="btn remove-q">Remove question</button>
  `;
  div.querySelector('.add-opt').onclick = () => {
    const opts = div.querySelector('.opts');
    const idx = opts.children.length;
    const opt = document.createElement('div'); opt.className='opt';
    opt.innerHTML = `<input class="opt-text" placeholder="Option ${idx+1}" /> <label>Correct <input type="radio" name="correct-${Date.now()}" class="opt-correct" /></label> <button class="btn remove-opt">X</button>`;
    opt.querySelector('.remove-opt').onclick = () => opt.remove();
    opts.appendChild(opt);
  };
  div.querySelector('.remove-q').onclick = () => div.remove();
  // add two options by default
  div.querySelector('.add-opt').click();
  div.querySelector('.add-opt').click();
  return div;
}

function renderList(){
  const list = load();
  const el = document.getElementById('quizzes-list'); el.innerHTML = '';
  if(list.length===0){ el.textContent = 'No quizzes yet.'; return; }
  list.forEach((q, idx) => {
    const d = document.createElement('div'); d.className='card';
    d.innerHTML = `<strong>${q.title}</strong><p>${q.questions.length} questions</p>`;
    const play = document.createElement('button'); play.className='btn'; play.textContent='Play';
    play.onclick = () => startQuiz(idx);
    const del = document.createElement('button'); del.className='btn'; del.textContent='Delete';
    del.onclick = () => { if(confirm('Delete quiz?')) { list.splice(idx,1); save(list); } };
    d.appendChild(play); d.appendChild(del);
    el.appendChild(d);
  });
}

function startQuiz(index){
  const list = load(); const quiz = list[index];
  document.getElementById('create').style.display='none';
  document.getElementById('list').style.display='none';
  const play = document.getElementById('play'); play.style.display='block';
  document.getElementById('play-title').textContent = quiz.title;
  const form = document.getElementById('play-form'); form.innerHTML = '';
  quiz.questions.forEach((q, qi) => {
    const div = document.createElement('div'); div.className='h-q';
    div.innerHTML = `<p><strong>${qi+1}. ${q.q}</strong></p>`;
    q.options.forEach((opt, oi) => {
      const id = `q${qi}_o${oi}`;
      const label = document.createElement('label'); label.className='opt';
      label.innerHTML = `<input type="radio" name="ans${qi}" value="${oi}" /> ${opt}`;
      div.appendChild(label);
    });
    form.appendChild(div);
  });
  const sub = document.createElement('button'); sub.className='btn primary'; sub.textContent='Submit';
  sub.type='button';
  sub.onclick = () => {
    const answers = quiz.questions.map((_,i) => {
      const v = form.querySelector(`input[name="ans${i}"]:checked`);
      return v ? Number(v.value) : null;
    });
    let score=0;
    const results = quiz.questions.map((qq,i)=> {
      const ok = answers[i] === qq.correct;
      if(ok) score++;
      return {ok, correct: qq.correct, sel: answers[i]};
    });
    alert(`Score: ${score} / ${quiz.questions.length}`);
    // simple results show
  };
  form.appendChild(sub);
  document.getElementById('back').onclick = () => {
    document.getElementById('create').style.display='block';
    document.getElementById('list').style.display='block';
    play.style.display='none';
  };
}

window.addEventListener('DOMContentLoaded', () => {
  renderList();
  const qArea = document.getElementById('questions-area');
  document.getElementById('add-q').onclick = () => qArea.appendChild(newQuestionBlock());
  document.getElementById('save-quiz').onclick = () => {
    const title = document.getElementById('quiz-title').value.trim();
    if(!title){ alert('Add title'); return; }
    const qBlocks = Array.from(qArea.children);
    if(qBlocks.length===0){ alert('Add a question'); return; }
    const questions = qBlocks.map(block => {
      const qText = block.querySelector('.q-text').value.trim();
      const opts = Array.from(block.querySelectorAll('.opt-text')).map(o=>o.value.trim()).filter(Boolean);
      const radios = Array.from(block.querySelectorAll('.opt-correct'));
      let correct = null;
      radios.forEach((r, ri) => { if(r.checked) correct = ri; });
      return { q: qText, options: opts, correct };
    });
    // validate
    for(const qq of questions){ if(!qq.q || qq.options.length<2 || qq.correct===null){ alert('Every question needs text, ≥2 options and a correct option'); return; } }
    const all = load(); all.push({ title, questions }); save(all);
    // reset
    document.getElementById('quiz-title').value=''; qArea.innerHTML=''; renderList();
  };
});
