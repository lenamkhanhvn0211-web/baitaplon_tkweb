/* ==========================================================
   TRANG THỰC ĐƠN: lọc theo danh mục, tìm kiếm, thêm vào giỏ
   ========================================================== */

// ---------- Trạng thái ----------
let currentCat = "Tất cả";
let searchQuery = "";

// ---------- Phần tử HTML ----------
const grid = document.getElementById("menu-grid");
const chips = document.getElementById("chips");

// Bỏ dấu tiếng Việt và chữ hoa để tìm kiếm không phân biệt dấu
// Ví dụ: "Cà Phê Đen" -> "ca phe den"
const normalize = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();

// ---------- Hiển thị ----------

// Vẽ các nút danh mục
function renderChips() {
  const categories = ["Tất cả", ...new Set(MENU.map((m) => m.cat))];

  chips.innerHTML = categories
    .map((c) => {
      const onClass = c === currentCat ? "on" : "";
      return `<button class="chip ${onClass}" data-cat="${c}">${c}</button>`;
    })
    .join("");
}

// Vẽ danh sách món (đã lọc theo danh mục và từ khóa)
function renderMenu() {
  const list = MENU.filter((m) => {
    const matchCat = currentCat === "Tất cả" || m.cat === currentCat;
    const matchName = normalize(m.name).includes(normalize(searchQuery));
    return matchCat && matchName;
  });

  if (!list.length) {
    grid.innerHTML = '<p class="empty">Không tìm thấy món phù hợp.</p>';
    return;
  }

  grid.innerHTML = list
    .map(
      (m) => `
    <article class="card">
      <div class="thumb">${
        m.img
          ? `<img src="${m.img}" alt="${m.name}" loading="lazy">`
          : `<span aria-hidden="true">${m.name[0]}</span>`
      }</div>
      <div class="card-body">
        <strong>${m.name}</strong>
        <span>${m.cat}</span>
        <span class="price">${fmt(m.price)}</span>
        <button class="add-btn" data-id="${m.id}">Thêm vào giỏ</button>
      </div>
    </article>`
    )
    .join("");
}

// ---------- Sự kiện ----------

// Bấm nút danh mục
chips.addEventListener("click", (e) => {
  if (!e.target.dataset.cat) return;
  currentCat = e.target.dataset.cat;
  renderChips();
  renderMenu();
});

// Gõ vào ô tìm kiếm
document.getElementById("search").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderMenu();
});

// Hiệu ứng: ảnh món bay từ thẻ món vào mục "Gọi món" trên header
function flyToCart(card) {
  const thumb = card.querySelector(".thumb");
  const target = document.getElementById("cart-badge") || document.querySelector('nav a[href="order.html"]');
  if (!thumb || !target) return;

  const from = thumb.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = 70; // kích thước ảnh khi bay

  // Nhân bản ảnh món rồi cho bay (đặt cố định trên màn hình)
  const flyer = thumb.cloneNode(true);
  flyer.className = "thumb fly-img";
  flyer.style.cssText = `left:${from.left + from.width / 2 - size / 2}px;top:${from.top + from.height / 2 - size / 2}px;width:${size}px;height:${size}px;`;
  document.body.appendChild(flyer);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  // Người dùng tắt chuyển động thì bỏ qua animation
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    flyer.remove();
    return;
  }

  const anim = flyer.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(0.8)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0.3 },
    ],
    { duration: 750, easing: "cubic-bezier(.5, 0, .7, .4)" }
  );

  anim.onfinish = () => {
    flyer.remove();
    // Số trên giỏ hàng nảy lên một nhịp
    const badge = document.getElementById("cart-badge");
    if (badge) {
      badge.classList.remove("bump");
      void badge.offsetWidth; // chạy lại animation
      badge.classList.add("bump");
    }
  };
}

// Bấm "Thêm vào giỏ"
grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  addToCart(+btn.dataset.id);
  flyToCart(btn.closest(".card"));
});

// ---------- Khởi chạy ----------
renderChips();
renderMenu();