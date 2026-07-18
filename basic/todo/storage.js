// storage.js — 데이터(상태)를 책임지는 모듈

const KEY = 'skala.todos';

// 저장된 배열 불러오기 (없으면 빈 배열)
export function loadTodos() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('저장 데이터 파싱 실패:', e.message);
    return [];
  }
}

// 배열 전체 저장
export function saveTodos(todos) {
  localStorage.setItem(KEY, JSON.stringify(todos));
}

export function createTodo(text) {
  return { id: Date.now() + Math.floor(Math.random() * 1000), text, done: false };
}

export async function fetchQuote() {
  const fallback = '작은 실천이 큰 변화를 만듭니다. 오늘도 화이팅! 💪';
  try {
    const response = await fetch('quotes.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const list = await response.json();
    if (!Array.isArray(list) || list.length === 0) throw new Error('빈 데이터');
    return list[Math.floor(Math.random() * list.length)];
  } catch (error) {
    console.warn('오늘의 한마디 로드 실패 → 기본 문구:', error.message);
    return fallback;
  }
}
