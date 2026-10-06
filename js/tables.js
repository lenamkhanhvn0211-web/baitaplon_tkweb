/* ==========================================================
   TRANG QUẢN LÝ BÀN: bấm vào bàn để đổi Trống <-> Có khách
   ========================================================== */

const TABLE_COUNT = 12;

// Tạo danh sách bàn mặc định: bàn 1, 4, 7, 10 có 2 chỗ, còn lại 4 chỗ
function createDefaultTables() {
  return Array.from({ length: TABLE_COUNT }, (_, i) => ({
    id: i + 1,
    seats: i % 3 === 0 ? 2 : 4,
    busy: false,
  }));
}

// Lấy từ localStorage, nếu chưa có thì dùng danh sách mặc định
let tables = load("tables", createDefaultTables());

const wrap = document.getElementById("tables");

// ---------- Hiển thị ----------
function renderTables() {
  wrap.innerHTML = tables
    .map(
      (t) => `
    <button class="table-btn ${t.busy ? "busy" : ""}" data-id="${t.id}" aria-pressed="${t.busy}">
      <strong>Bàn ${t.id}</strong>
      <small>${t.seats} chỗ</small>
      <small>${t.busy ? "Có khách" : "Trống"}</small>
    </button>`
    )
    .join("");

  const busyCount = tables.filter((t) => t.busy).length;
  document.getElementById("stat").textContent =
    `Có khách: ${busyCount} | Trống: ${tables.length - busyCount}`;
}

// ---------- Sự kiện ----------

// Bấm vào bàn: đổi trạng thái
wrap.addEventListener("click", (e) => {
  const button = e.target.closest("[data-id]");
  if (!button) return;

  const table = tables.find((t) => t.id == button.dataset.id);
  table.busy = !table.busy;

  save("tables", tables);
  renderTables();
});

// Bấm "Đặt lại tất cả bàn": đưa mọi bàn về trạng thái trống
document.getElementById("reset").addEventListener("click", () => {
  tables.forEach((t) => (t.busy = false));
  save("tables", tables);
  renderTables();
});

// ---------- Khởi chạy ----------
renderTables();
