// app.js — 화면(뷰) 모듈. 상태 배열 → render() 흐름.
import { loadTodos, saveTodos, createTodo, fetchQuote } from "./storage.js";

let todos = loadTodos();
let filter = "all";

const $ = (s) => document.querySelector(s);
const form = $("#addForm");
const input = $("#todoInput");
const list = $("#list");
const empty = $("#empty");
const ringFg = $("#ringFg");
const ringPct = $("#ringPct");
const ringSub = $("#ringSub");
const sumTotal = $("#sumTotal");
const sumActive = $("#sumActive");
const sumDone = $("#sumDone");
const CIRC = 2 * Math.PI * 52; // 진행률 링 둘레

function visible() {
  if (filter === "active") return todos.filter((t) => !t.done);
  if (filter === "done") return todos.filter((t) => t.done);
  return todos;
}

function updateRing() {
  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  ringFg.style.strokeDashoffset = CIRC * (1 - pct / 100);
  ringPct.textContent = pct + "%";
  ringSub.textContent = `${done} / ${total}`;
  // 하단 요약(전체·진행중·완료 개수)
  sumTotal.textContent = total;
  sumActive.textContent = total - done;
  sumDone.textContent = done;
}

function render() {
  const items = visible();
  list.innerHTML = "";
  empty.hidden = items.length > 0;

  items.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo" + (todo.done ? " done" : "");
    li.dataset.id = todo.id;
    li.innerHTML = `
      <label class="tk">
        <input type="checkbox" ${todo.done ? "checked" : ""} data-action="toggle">
        <span class="tk__box"></span>
      </label>
      <span class="todo__text" data-action="edit" title="더블클릭하여 편집"></span>
      <button class="todo__del" data-action="delete" aria-label="삭제">✕</button>`;
    li.querySelector(".todo__text").textContent = todo.text;
    list.appendChild(li);
  });
  updateRing();
}

function commit() {
  saveTodos(todos);
  render();
}

/* 추가: 버튼/Enter (빈값 방지) */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.unshift(createTodo(text));
  input.value = "";
  input.focus();
  commit();
});

/* 이벤트 위임: 토글 / 삭제 */
list.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  const li = e.target.closest(".todo");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (action === "toggle") {
    const t = todos.find((t) => t.id === id);
    if (t) t.done = !t.done;
    commit();
  } else if (action === "delete") {
    li.classList.add("is-removing");
    li.addEventListener("animationend", () => {
      todos = todos.filter((t) => t.id !== id);
      commit();
    }, { once: true });
  }
});

/* 인라인 편집: 더블클릭 */
list.addEventListener("dblclick", (e) => {
  const span = e.target.closest(".todo__text");
  if (!span) return;
  const li = span.closest(".todo");
  const id = Number(li.dataset.id);
  const todo = todos.find((t) => t.id === id);
  const edit = document.createElement("input");
  edit.className = "todo__edit";
  edit.value = todo.text;
  span.replaceWith(edit);
  edit.focus();
  edit.setSelectionRange(edit.value.length, edit.value.length);

  const finish = (save) => {
    if (save) {
      const v = edit.value.trim();
      if (v) todo.text = v;
    }
    commit();
  };
  edit.addEventListener("blur", () => finish(true));
  edit.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") finish(true);
    if (ev.key === "Escape") finish(false);
  });
});

/* 필터 */
$("#filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll("#filters .chip").forEach((c) => c.classList.remove("is-active"));
  chip.classList.add("is-active");
  filter = chip.dataset.filter;
  render();
});

/* 완료 비우기 */
$("#clearDone").addEventListener("click", () => {
  const before = todos.length;
  todos = todos.filter((t) => !t.done);
  if (todos.length !== before) window.UI?.toast?.("완료 항목을 비웠어요");
  commit();
});

/* 오늘의 한마디 */
(async () => {
  const text = await fetchQuote();
  $("#quote").textContent = "“" + text + "”";
})();

render();
