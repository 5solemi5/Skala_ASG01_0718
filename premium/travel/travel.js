/* 여행지 — 이미지 라이트박스 */
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCap");

function openLightbox(src, cap, alt) {
  lbImg.src = src;
  lbImg.alt = alt || "";
  lbCap.textContent = cap || "";
  lb.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lb.hidden = true;
  lbImg.src = "";
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-lightbox]").forEach((fig) => {
  fig.addEventListener("click", () => {
    const img = fig.querySelector("img");
    openLightbox(fig.dataset.lightbox, fig.dataset.caption, img ? img.alt : "");
  });
});

lb.addEventListener("click", (e) => {
  if (e.target === lb || e.target.classList.contains("lightbox__close")) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !lb.hidden) closeLightbox();
});
