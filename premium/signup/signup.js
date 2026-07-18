/* 프리미엄 회원가입 — 실시간 검증, 강도계, 라이브 프리뷰 */
const $ = (s, r = document) => r.querySelector(s);
const form = $("#signupForm");

/* ---------- 실시간 검증 규칙 ---------- */
const rules = {
  userName: (v) => (v.trim() ? "" : "이름을 입력하세요"),
  userId: (v) => (/^[A-Za-z0-9]{4,12}$/.test(v) ? "" : "영문·숫자 4~12자로 입력하세요"),
  userPw: (v) => (v.length >= 8 ? "" : "8자 이상 입력하세요"),
  userEmail: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "올바른 이메일 형식이 아니에요"),
  userTel: (v) => (v === "" || /^010-\d{4}-\d{4}$/.test(v) ? "" : "010-0000-0000 형식으로 입력하세요"),
};
const okMsg = {
  userName: "좋아요!", userId: "사용 가능한 아이디예요", userPw: "",
  userEmail: "올바른 이메일이에요", userTel: "형식이 맞아요",
};

function validateField(name) {
  const input = form.elements[name];
  if (!input) return true;
  const err = rules[name](input.value);
  const hint = $(`[data-hint="${name}"]`);
  const touched = input.value !== "";
  input.classList.toggle("is-bad", !!err && touched);
  input.classList.toggle("is-ok", !err && touched);
  if (hint && name !== "userPw") {
    hint.textContent = err || (touched ? okMsg[name] : "");
    hint.className = "hint" + (err && touched ? " hint--bad" : okMsg[name] && !err && touched ? " hint--ok" : "");
  }
  return !err;
}

Object.keys(rules).forEach((name) => {
  const el = form.elements[name];
  el && el.addEventListener("input", () => { validateField(name); syncPreview(); });
});

/* ---------- 비밀번호 강도계 ---------- */
const pw = $("#userPw"), bar = $("#meterBar"), pwHint = $("#pwHint");
function strength(v) {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return s; // 0~4
}
pw.addEventListener("input", () => {
  const s = strength(pw.value);
  const pct = pw.value ? Math.max(12, s * 25) : 0;
  const colors = ["#e5484d", "#e5484d", "#d97706", "#16a34a", "#2dd4bf"];
  const labels = ["약함", "약함", "보통", "강함", "매우 강함"];
  bar.style.width = pct + "%";
  bar.style.background = colors[s];
  pwHint.textContent = pw.value ? `강도: ${labels[s]} (대소문자·숫자·기호 조합 권장)` : "8자 이상 입력하세요";
  pwHint.className = "hint" + (s >= 3 ? " hint--ok" : s >= 1 ? "" : " hint--bad");
});
$("#pwToggle").addEventListener("click", () => {
  pw.type = pw.type === "password" ? "text" : "password";
});

/* ---------- 관심 칩 즉시 반영 ---------- */
$("#interestChips").addEventListener("change", syncPreview);
$("#genderSeg").addEventListener("change", syncPreview);
$("#region").addEventListener("change", syncPreview);

/* ---------- 소개 글자수 ---------- */
const intro = $("#intro"), introCount = $("#introCount");
intro.addEventListener("input", () => { introCount.textContent = intro.value.length; syncPreview(); });

/* ---------- 라이브 프리뷰 ---------- */
function getInterests() {
  return [...form.querySelectorAll('input[name="interest"]:checked')].map((c) => c.value);
}
function syncPreview() {
  const name = $("#userName").value.trim();
  const id = $("#userId").value.trim();
  $("#pvName").textContent = name || "이름을 입력하세요";
  $("#pvAvatar").textContent = (name || "S").charAt(0).toUpperCase();
  $("#pvId").textContent = id ? "@" + id : "@아이디";
  $("#pvIntro").textContent = intro.value.trim() || "한 줄 소개가 여기에 표시됩니다.";
  const region = $("#region").value;
  $("#pvRegion").textContent = region ? "📍 " + region : "지역 미정";
  const gender = form.gender.value;
  $("#pvGender").textContent = gender === "선택안함" ? "비공개" : gender;
  const box = $("#pvInterests");
  box.innerHTML = "";
  getInterests().forEach((i) => {
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = "#" + i;
    box.appendChild(b);
  });
}
syncPreview();

/* ---------- 제출 ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  Object.keys(rules).forEach((n) => { if (!validateField(n)) ok = false; });
  if (form.elements.userName.value.trim() === "") ok = false;
  if (!$("#agree").checked) { UI.toast("약관에 동의해 주세요"); ok = false; }
  if (!ok) { UI.toast("입력값을 다시 확인해 주세요"); return; }

  // 결과 표 구성
  const data = {
    "이름": $("#userName").value,
    "아이디": "@" + $("#userId").value,
    "이메일": $("#userEmail").value,
    "전화번호": $("#userTel").value || "(미입력)",
    "생년월일": $("#userBirth").value || "(미입력)",
    "성별": form.gender.value,
    "지역": $("#region").value || "(미입력)",
    "관심 분야": getInterests().join(", ") || "(없음)",
    "한 줄 소개": intro.value.trim() || "(없음)",
  };
  const body = $("#resultBody");
  body.innerHTML = "";
  for (const [k, v] of Object.entries(data)) {
    const tr = document.createElement("tr");
    const th = document.createElement("th"); th.textContent = k;
    const td = document.createElement("td"); td.textContent = v;
    tr.append(th, td); body.appendChild(tr);
  }
  $("#resultOverlay").hidden = false;
  UI.toast("🎉 회원가입이 완료되었습니다!");
});

$("#resultClose").addEventListener("click", () => { $("#resultOverlay").hidden = true; });
$("#resultOverlay").addEventListener("click", (e) => { if (e.target.id === "resultOverlay") e.currentTarget.hidden = true; });
