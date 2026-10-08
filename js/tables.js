const TABLE_COUNT = 12;

function createDefaultTables() {
  return Array.from({ length: TABLE_COUNT }, (_, i) => ({
    id: i + 1,
    seats: i % 3 === 0 ? 2 : 4,
    busy: false,
  }));
}

let tables = load("tables", createDefaultTables());

const wrap = document.getElementById("tables");

function renderTables() {
  wrap.innerHTML = tables
    .map((t) => {
      let statusClass = "";
      let statusText = "Trống";

      if (t.busy === "booked") {
        statusClass = "booked";
        statusText = "Đã đặt trước";
      } else if (t.busy === true) {
        statusClass = "busy";
        statusText = "Đang phục vụ";
      }

      return `
        <button class="table-btn ${statusClass}" data-id="${t.id}" aria-pressed="${t.busy}">
          <strong>Bàn ${t.id}</strong>
          <small>${t.seats} chỗ</small>
          <small>${statusText}</small>
        </button>
      `;
    })
    .join("");

  const busyCount = tables.filter((t) => t.busy === true).length;
  const bookedCount = tables.filter((t) => t.busy === "booked").length;
  const freeCount = tables.length - busyCount - bookedCount;

  document.getElementById("stat").textContent =
    `Đang phục vụ: ${busyCount} | Đã đặt trước: ${bookedCount} | Trống: ${freeCount}`;
}

wrap.addEventListener("click", (e) => {
  const button = e.target.closest("[data-id]");
  if (!button) return;

  const table = tables.find((t) => t.id == button.dataset.id);

  if (table.busy === false) {
    table.busy = true;
  } else if (table.busy === true) {
    table.busy = "booked";
  } else {
    table.busy = false;
  }

  save("tables", tables);
  renderTables();
});

document.getElementById("reset").addEventListener("click", () => {
  tables.forEach((t) => (t.busy = false));
  save("tables", tables);
  renderTables();
});

renderTables();
