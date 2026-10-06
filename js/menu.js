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
        <button class="btn" data-id="${m.id}">Thêm vào giỏ</button>
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

// Bấm "Thêm vào giỏ"
grid.addEventListener("click", (e) => {
  if (e.target.dataset.id) addToCart(+e.target.dataset.id);
});

// ---------- Khởi chạy ----------
renderChips();
renderMenu();
