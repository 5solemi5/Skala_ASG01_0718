/* 프리미엄 스토어 — 검색·필터·정렬·장바구니 */
const PRODUCTS = [
  { id: 1, name: "무선 헤드폰", cat: "audio", catLabel: "오디오", price: 129000, rating: 4.8, pop: 95, badge: "신상", emoji: "🎧", c1: "#ffd1dc", c2: "#ff8fab" },
  { id: 2, name: "스마트 워치", cat: "wearable", catLabel: "웨어러블", price: 215000, rating: 4.6, pop: 88, badge: "베스트", emoji: "⌚", c1: "#c1f0dc", c2: "#57c99a" },
  { id: 3, name: "미러리스 카메라", cat: "camera", catLabel: "카메라", price: 689000, rating: 4.9, pop: 76, badge: "할인", emoji: "📷", c1: "#d7e3ff", c2: "#7aa2ff" },
  { id: 4, name: "기계식 키보드", cat: "pc", catLabel: "PC 주변기기", price: 98000, rating: 4.7, pop: 82, badge: "신상", emoji: "⌨️", c1: "#ffe8c2", c2: "#ffb347" },
  { id: 5, name: "게이밍 마우스", cat: "pc", catLabel: "PC 주변기기", price: 54000, rating: 4.5, pop: 79, badge: "인기", emoji: "🖱️", c1: "#e7d6ff", c2: "#b48bff" },
  { id: 6, name: "블루투스 스피커", cat: "audio", catLabel: "오디오", price: 76000, rating: 4.4, pop: 71, badge: "베스트", emoji: "🔊", c1: "#cdeffd", c2: "#5bc0eb" },
  { id: 7, name: "피트니스 밴드", cat: "wearable", catLabel: "웨어러블", price: 43000, rating: 4.3, pop: 64, badge: "가성비", emoji: "📿", c1: "#d1f7e8", c2: "#34d399" },
  { id: 8, name: "액션캠", cat: "camera", catLabel: "카메라", price: 312000, rating: 4.6, pop: 69, badge: "신상", emoji: "🎥", c1: "#ffd6e8", c2: "#f472b6" },
  { id: 9, name: "노이즈캔슬 이어폰", cat: "audio", catLabel: "오디오", price: 189000, rating: 4.8, pop: 91, badge: "베스트", emoji: "🎵", c1: "#e0e7ff", c2: "#818cf8" },
];

const state = { q: "", cat: "all", sort: "popular", cart: 0 };
const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const resultCount = document.getElementById("resultCount");
const cartCount = document.getElementById("cartCount");
const won = (n) => "₩" + n.toLocaleString("ko-KR");

function apply() {
  let list = PRODUCTS.filter((p) => {
    const matchCat = state.cat === "all" || p.cat === state.cat;
    const matchQ = p.name.toLowerCase().includes(state.q.toLowerCase());
    return matchCat && matchQ;
  });
  const sorters = {
    popular: (a, b) => b.pop - a.pop,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name, "ko"),
  };
  list.sort(sorters[state.sort]);
  render(list);
}

function render(list) {
  grid.innerHTML = "";
  empty.hidden = list.length > 0;
  resultCount.textContent = `총 ${list.length}개 상품`;
  list.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "product";
    card.style.animationDelay = i * 0.04 + "s";
    card.style.setProperty("--c1", p.c1);
    card.style.setProperty("--c2", p.c2);
    card.innerHTML = `
      <div class="product__thumb"><span class="product__badge">${p.badge}</span>${p.emoji}</div>
      <div class="product__body">
        <span class="product__cat">${p.catLabel}</span>
        <span class="product__name"></span>
        <span class="product__rating">★ ${p.rating.toFixed(1)}</span>
        <div class="product__foot">
          <span class="product__price">${won(p.price)}</span>
          <button class="add-btn" data-id="${p.id}">담기</button>
        </div>
      </div>`;
    card.querySelector(".product__name").textContent = p.name;
    grid.appendChild(card);
  });
}

/* 이벤트 위임: 담기 버튼 */
grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  const p = PRODUCTS.find((x) => x.id === Number(btn.dataset.id));
  state.cart++;
  cartCount.textContent = state.cart;
  cartCount.classList.add("show");
  cartCount.classList.remove("pop");
  void cartCount.offsetWidth; // reflow → 애니메이션 재시작
  cartCount.classList.add("pop");
  UI.toast(`🛒 '${p.name}' 담았어요`);
});

/* 검색 */
document.getElementById("search").addEventListener("input", (e) => { state.q = e.target.value; apply(); });

/* 카테고리 필터 */
document.getElementById("catChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll("#catChips .chip").forEach((c) => c.classList.remove("is-active"));
  chip.classList.add("is-active");
  state.cat = chip.dataset.cat;
  apply();
});

/* 정렬 */
document.getElementById("sort").addEventListener("change", (e) => { state.sort = e.target.value; apply(); });

/* 장바구니 아이콘 클릭 */
document.getElementById("cartBtn").addEventListener("click", () => {
  UI.toast(state.cart ? `장바구니에 ${state.cart}개 담겨 있어요` : "장바구니가 비어 있어요");
});

apply();
