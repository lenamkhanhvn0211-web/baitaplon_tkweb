/* ==========================================================
   TRANG MENU: băng chuyền khuyến mãi
   (dùng MENU, fmt từ common.js)
   ========================================================== */

// ---------- 3 món khuyến mãi (đổi tại đây) ----------
// id: mã món trong MENU | off: % giảm | note: dòng mô tả ngắn
const PROMOS = [
  { id: 7,  off: 20, note: "Vị mặn nhẹ, béo mịn, ly cà phê được gọi nhiều nhất." },
  { id: 14, off: 15, note: "Trà đào thanh mát, giải nhiệt cho buổi chiều." },
  { id: 26, off: 10, note: "Sinh tố bơ sánh mịn, xay mới mỗi ly." },
];

const track = document.getElementById("promo-track");
const dotsEl = document.getElementById("promo-dots");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Khuyến mãi ----------
// Giá sau giảm, làm tròn đến nghìn đồng
const promoPrice = (price, off) => Math.round((price * (100 - off)) / 100 / 1000) * 1000;

const promoItems = PROMOS.map((p) => ({ ...p, item: MENU.find((m) => m.id === p.id) })).filter((p) => p.item);

track.innerHTML = promoItems
  .map(
    ({ item, off, note }, i) => `
    <article class="promo-slide" aria-roledescription="slide" aria-label="${i + 1} / ${promoItems.length}">
      <div class="promo-img">${
        item.img ? `<img src="${item.img}" alt="${item.name}">` : `<span aria-hidden="true">${item.name[0]}</span>`
      }</div>
      <div class="promo-body">
        <span class="promo-badge">Giảm ${off}%</span>
        <h2>${item.name}</h2>
        <p>${note}</p>
        <div class="promo-prices">
          <span class="promo-new">${fmt(promoPrice(item.price, off))}</span>
          <span class="promo-old">${fmt(item.price)}</span>
        </div>
      </div>
    </article>`
  )
  .join("");

dotsEl.innerHTML = promoItems
  .map((_, i) => `<button type="button" data-i="${i}" aria-label="Xem khuyến mãi ${i + 1}"></button>`)
  .join("");

const slideCount = promoItems.length;
const step = () => track.clientWidth + 16; // độ rộng 1 slide + khoảng cách
const current = () => Math.round(track.scrollLeft / step());

function goTo(i) {
  const n = (i + slideCount) % slideCount;
  track.scrollTo({ left: n * step(), behavior: reduceMotion ? "auto" : "smooth" });
}

function updateDots() {
  const c = current();
  [...dotsEl.children].forEach((d, i) => {
    d.classList.toggle("on", i === c);
    d.setAttribute("aria-current", i === c ? "true" : "false");
  });
}

track.addEventListener("scroll", updateDots, { passive: true });
dotsEl.addEventListener("click", (e) => {
  if (e.target.dataset.i) goTo(+e.target.dataset.i);
});
document.getElementById("promo-prev").addEventListener("click", () => goTo(current() - 1));
document.getElementById("promo-next").addEventListener("click", () => goTo(current() + 1));
track.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") goTo(current() - 1);
  if (e.key === "ArrowRight") goTo(current() + 1);
});

// Tự chuyển sau 5 giây; dừng khi rê chuột / đang focus, hoặc khi người dùng tắt chuyển động
if (!reduceMotion && slideCount > 1) {
  let paused = false;
  const promo = track.parentElement;
  ["mouseenter", "focusin", "touchstart"].forEach((ev) => promo.addEventListener(ev, () => (paused = true), { passive: true }));
  ["mouseleave", "focusout"].forEach((ev) => promo.addEventListener(ev, () => (paused = false)));
  setInterval(() => {
    if (!paused && !document.hidden) goTo(current() + 1);
  }, 5000);
}
updateDots();

// Ảnh lỗi hoặc thiếu file: thay bằng chữ cái đầu của tên món
document.addEventListener(
  "error",
  (e) => {
    const img = e.target;
    if (img.tagName !== "IMG") return;
    const row = img.closest(".promo-slide");
    if (!row) return;
    const name = (row.querySelector("h2") || {}).textContent || "?";
    img.replaceWith(Object.assign(document.createElement("span"), { textContent: name.trim()[0] }));
  },
  true
);