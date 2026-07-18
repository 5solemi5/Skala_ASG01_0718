// storage.js — 데이터(상태) 모듈
// 할 일 = { id, text, done }, 전체 = 배열. localStorage 에 JSON 으로 영속화.
const KEY = "skala.focus.todos";

export function loadTodos() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn("불러오기 실패:", e.message);
    return [];
  }
}

export function saveTodos(todos) {
  localStorage.setItem(KEY, JSON.stringify(todos));
}

export function createTodo(text) {
  return { id: Date.now() + Math.floor(Math.random() * 1000), text, done: false };
}

// 오늘의 한마디: async/await + fetch + try/catch (실패 시 기본 문구)
export async function fetchQuote() {
  const fallback = "작은 실천이 큰 변화를 만듭니다. 오늘도 화이팅! 💪";
  try {
    const res = await fetch("quotes.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const list = await res.json();
    if (!Array.isArray(list) || !list.length) throw new Error("빈 데이터");
    return list[Math.floor(Math.random() * list.length)];
  } catch (err) {
    console.warn("명언 로드 실패 → 기본 문구:", err.message);
    return fallback;
  }
}
