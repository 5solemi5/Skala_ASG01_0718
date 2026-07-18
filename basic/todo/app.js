// app.js — 화면(뷰)을 책임지는 모듈
import { loadTodos, saveTodos, createTodo, fetchQuote } from './storage.js';

// ----- 상태: 배열(todos) → render() 흐름 -----
let todos = loadTodos();
let filter = 'all'; // all | active | done

const form    = document.getElementById('addForm');
const input   = document.getElementById('todoInput');
const list    = document.getElementById('list');
const empty   = document.getElementById('empty');
const summary = document.getElementById('summary');
const quoteEl = document.getElementById('quote');

function visibleTodos() {
  if (filter === 'active') return todos.filter(t => !t.done);
  if (filter === 'done')   return todos.filter(t => t.done);
  return todos;
}

function render() {
  const items = visibleTodos();
  list.innerHTML = '';

  items.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo' + (todo.done ? ' done' : '');
    li.dataset.id = todo.id; // 이벤트 위임에서 사용
    li.innerHTML = `
      <label class="check">
        <input type="checkbox" ${todo.done ? 'checked' : ''} data-action="toggle">
        <span class="text"></span>
      </label>
      <button class="del" data-action="delete" aria-label="삭제">✕</button>
    `;
    li.querySelector('.text').textContent = todo.text;
    list.appendChild(li);
  });

  empty.style.display = items.length ? 'none' : 'block';

  // 하단 요약: 전체 · 완료 개수
  const doneCount = todos.filter(t => t.done).length;
  summary.textContent = `전체 ${todos.length} · 완료 ${doneCount}`;
}

// 상태 변경 후 저장 + 렌더
function commit() {
  saveTodos(todos);
  render();
}

// ----- 추가: 버튼 submit + Enter 모두 form submit 으로 처리 -----
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return; // 빈 값 방지
  todos.push(createTodo(text));
  input.value = '';
  input.focus();
  commit();
});

list.addEventListener('click', (e) => {
  const action = e.target.dataset.action;
  if (!action) return;
  const li = e.target.closest('.todo'); // 클릭 지점에서 가장 가까운 항목
  if (!li) return;
  const id = Number(li.dataset.id);

  if (action === 'toggle') {
    const t = todos.find(t => t.id === id);
    if (t) t.done = !t.done; // 완료 토글
    commit();
  } else if (action === 'delete') {
    todos = todos.filter(t => t.id !== id); // 삭제
    commit();
  }
});

// ----- 필터 버튼 -----
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter.active')?.classList.remove('active');
    btn.classList.add('active');
    filter = btn.dataset.filter;
    render();
  });
});

// ----- 완료 항목 비우기 -----
document.getElementById('clearDone').addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  commit();
});

async function loadQuote() {
  const text = await fetchQuote();
  quoteEl.textContent = '“' + text + '”';
}
loadQuote();

// ----- 최초 렌더 -----
render();
