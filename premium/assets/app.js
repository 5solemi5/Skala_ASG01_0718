/* =========================================================
   공유 스크립트 — 테마 토글, 토스트, 스크롤 리빌, 액티브 내비
   모든 페이지에서 <script src=".../assets/app.js"></script> 로 로드
   전역 window.UI 로 헬퍼 노출
   ========================================================= */
(function () {
  const root = document.documentElement;
  const KEY = "skala.theme";

  /* ---- 테마 ---- */
  function applyTheme(mode) {
    root.setAttribute("data-theme", mode);
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      b.textContent = mode === "dark" ? "☀️" : "🌙";
      b.setAttribute("aria-label", mode === "dark" ? "라이트 모드" : "다크 모드");
    });
  }
  function initTheme() {
    const saved = localStorage.getItem(KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }
  function toggleTheme() {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem(KEY, next);
    applyTheme(next);
  }

  /* ---- 토스트 ---- */
  function ensureHost() {
    let host = document.querySelector(".toast-host");
    if (!host) {
      host = document.createElement("div");
      host.className = "toast-host";
      document.body.appendChild(host);
    }
    return host;
  }
  function toast(message, ms = 2600) {
    const host = ensureHost();
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="toast__accent"></span>';
    const span = document.createElement("span");
    span.textContent = message;
    el.appendChild(span);
    host.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-out");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, ms);
  }

  /* ---- 스크롤 리빌 ---- */
  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((i) => io.observe(i));
  }

  /* ---- 스크롤 스파이 (앵커 내비 active) ---- */
  function initScrollSpy() {
    const links = [...document.querySelectorAll("[data-spy] a[href^='#']")];
    if (!links.length) return;
    const map = new Map();
    links.forEach((l) => {
      const el = document.querySelector(l.getAttribute("href"));
      if (el) map.set(el, l);
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links.forEach((l) => l.classList.remove("is-active"));
            map.get(e.target)?.classList.add("is-active");
          }
        });
      },
      { threshold: 0.5 }
    );
    map.forEach((_, el) => io.observe(el));
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-theme-toggle]")) toggleTheme();
  });

  window.UI = { toast, toggleTheme };

  initTheme();
  document.addEventListener("DOMContentLoaded", () => {
    initReveal();
    initScrollSpy();
  });
})();
