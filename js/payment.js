/* ==========================================================
   TRANG THANH TOÁN
   - Món lấy từ giỏ hàng của trang Gọi món (chỉ xem, không sửa ở đây)
   - Size / % đá / % đường được chọn ở trang Gọi món
   - Mã giảm giá, hình thức nhận món, kiểm tra form, in hóa đơn
   ========================================================== */

// ---------- Dữ liệu ----------
const CODES = { CAFE10: 0.1, HELLO20: 0.2 };

// Phí giao hàng cố định khi chọn "Giao về nhà"
const SHIP_FEE = 5000;
const KIND_LABEL = {
  table: "Tại bàn",
  takeaway: "Mang đi",
  home: "Giao về nhà",
};

// Thông tin chuyển từ trang Quản lý bàn (hình thức nhận món, bàn, khách, địa chỉ...)
const draft = load("checkoutDraft", null);

// ---------- Trạng thái ----------
let discount = 0; // tỉ lệ giảm giá đang áp dụng (0.1 = 10%)

// ---------- Hàm tiện ích ----------
const $ = (id) => document.getElementById(id);

// Chống chèn HTML khi in dữ liệu người dùng nhập
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// (SIZES, hasOptions, lineUnit, getCart... nằm trong common.js)

// Hình thức nhận món đang chọn: "table" | "takeaway" | "home" | ""
const getKind = () => {
  const r = document.querySelector('input[name="kind"]:checked');
  return r ? r.value : "";
};

// Các dòng trong hóa đơn, lấy từ giỏ hàng (mỗi dòng có size / đá / đường riêng)
function getLines() {
  return getCart()
    .map((l) => {
      const item = MENU.find((m) => m.id == l.id);
      if (!item) return null;
      const drink = hasOptions(item);
      return {
        item,
        qty: l.qty,
        size: drink ? (SIZES[l.size] ? l.size : "M") : "",
        ice: drink ? String(l.ice ?? 100) : "",
        sugar: drink ? String(l.sugar ?? 100) : "",
        unit: lineUnit(l),
      };
    })
    .filter(Boolean);
}

// ---------- Tính tiền ----------
const subtotal = () => getLines().reduce((sum, l) => sum + l.unit * l.qty, 0);
const cutAmount = () => Math.round(subtotal() * discount);
const shipAmount = () => (getKind() === "home" ? SHIP_FEE : 0);
const total = () => subtotal() - cutAmount() + shipAmount();

// ---------- Hiển thị hóa đơn ----------
function renderSummary() {
  const lines = getLines();

  // Tiêu đề bảng (vẽ lại ở đây để luôn khớp với các cột bên dưới)
  const table = $("lines").closest("table");
  if (table && table.tHead) {
    table.tHead.innerHTML =
      "<tr><th>Món</th><th>Size</th><th>Đá</th><th>Đường</th><th>SL</th><th>Thành tiền</th></tr>";
  }

  $("lines").innerHTML =
    lines
      .map(
        (l) => `
        <tr>
          <td class="dish">${esc(l.item.name)}</td>
          <td>${l.size ? SIZES[l.size].label : "-"}</td>
          <td>${l.ice !== "" ? l.ice + "%" : "-"}</td>
          <td>${l.sugar !== "" ? l.sugar + "%" : "-"}</td>
          <td>${l.qty}</td>
          <td class="amount">${fmt(l.unit * l.qty)}</td>
        </tr>`,
      )
      .join("") ||
    '<tr><td colspan="6" class="empty">Chưa có món nào. <a href="index.html">Chọn món ở trang Thực đơn</a>, rồi chỉnh ở trang <a href="order.html">Gọi món</a>.</td></tr>';

  $("sub").textContent = fmt(subtotal());
  $("cut").textContent = "-" + fmt(cutAmount());
  $("ship").textContent = fmt(shipAmount());
  $("sum").textContent = fmt(total());
  updateChange();
  updateBadge();
}

// Tiền thừa khi thanh toán tiền mặt
function updateChange() {
  const cash = parseInt($("cash").value.replace(/\D/g, ""), 10) || 0;
  $("change").textContent =
    cash > 0 && cash >= total()
      ? "Tiền thừa trả khách: " + fmt(cash - total())
      : "";
}

// ---------- Sự kiện: mã giảm giá ----------
$("apply").addEventListener("click", () => {
  const code = $("code").value.trim().toUpperCase();
  discount = CODES[code] || 0;
  $("code-msg").textContent = discount
    ? `Đã áp dụng giảm ${discount * 100}%`
    : "Mã không hợp lệ.";
  $("code-msg").className = discount ? "msg-ok" : "error";
  renderSummary();
});

// ---------- Hình thức nhận món ----------
// Lấy danh sách bàn từ trang Quản lý bàn (cùng khóa "tables" trong localStorage)
function renderTableOptions() {
  const tables = load(
    "tables",
    Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      seats: i % 3 === 0 ? 2 : 4,
      busy: false,
    })),
  );
  const status = (b) =>
    b === "booked" ? "đã đặt trước" : b === true ? "đang phục vụ" : "trống";
  $("table-sel").innerHTML =
    '<option value="">-- Chọn bàn --</option>' +
    tables
      .map(
        (t) =>
          `<option value="${t.id}">Bàn ${t.id} (${t.seats} chỗ) - ${status(t.busy)}</option>`,
      )
      .join("");
}

document.querySelectorAll('input[name="kind"]').forEach((radio) =>
  radio.addEventListener("change", () => {
    const kind = getKind();
    $("table-box").hidden = kind !== "table";
    $("addr-box").hidden = kind !== "home";
    $("e-kind").textContent = "";
    $("e-table").textContent = "";
    $("e-address").textContent = "";
    renderSummary(); // cập nhật phí ship
  }),
);

// ---------- Sự kiện: phương thức thanh toán ----------
// Chỉ tiền mặt mới cần nhập tiền khách đưa
document.querySelectorAll('input[name="method"]').forEach((radio) =>
  radio.addEventListener("change", () => {
    $("cash-box").hidden = radio.value !== "Tiền mặt";
    $("e-cash").textContent = "";
  }),
);
$("cash").addEventListener("input", updateChange);

// ---------- Sự kiện: gửi form ----------
$("pay-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  const method = document.querySelector('input[name="method"]:checked');
  const cash = parseInt($("cash").value.replace(/\D/g, ""), 10) || 0;
  const kind = getKind();
  const tableId = $("table-sel").value;
  const address = $("address").value.trim();
  let ok = true;

  // Hiện lỗi cạnh ô nhập nếu dữ liệu sai
  const check = (errId, isBad, message) => {
    $(errId).textContent = isBad ? message : "";
    if (isBad) ok = false;
  };
  check("e-name", name.length < 2, "Nhập họ tên (ít nhất 2 ký tự).");
  check(
    "e-phone",
    !/^0\d{9}$/.test(phone),
    "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.",
  );
  check("e-kind", !kind, "Chọn hình thức nhận món.");
  check("e-table", kind === "table" && !tableId, "Hãy chọn bàn.");
  check(
    "e-address",
    kind === "home" && address.length < 5,
    "Nhập địa chỉ giao hàng (ít nhất 5 ký tự).",
  );
  check("e-method", !method, "Chọn phương thức thanh toán.");
  check(
    "e-cash",
    method && method.value === "Tiền mặt" && cash < total(),
    "Tiền khách đưa chưa đủ.",
  );
  check(
    "e-cart",
    getLines().length === 0,
    "Chưa có món nào, hãy gọi món trước.",
  );
  if (!ok) return;

  // Tạo hóa đơn và lưu vào localStorage
  const bill = {
    code: "HD" + Date.now().toString().slice(-6),
    time: new Date().toLocaleString("vi-VN"),
    name,
    phone,
    type: kind, // "table" | "takeaway" | "home"
    table: kind === "table" ? Number(tableId) : undefined,
    address: kind === "home" ? address : undefined,
    method: method.value,
    items: getLines().map((l) => ({
      name: l.item.name,
      size: l.size,
      ice: l.ice,
      sugar: l.sugar,
      qty: l.qty,
      amount: l.unit * l.qty,
    })),
    sub: subtotal(),
    cut: cutAmount(),
    ship: shipAmount(),
    total: total(),
    cash: method.value === "Tiền mặt" ? cash : 0,
    when: draft && draft.when ? draft.when : undefined,
    note: draft && draft.note ? draft.note : undefined,
  };
  save("orders", [...load("orders", []), bill]);

  // Thanh toán tại bàn: bàn chuyển sang "Đang phục vụ" (nhân viên trả bàn thủ công ở trang Quản lý bàn)
  if (kind === "table") {
    const ts = load(
      "tables",
      Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        seats: i % 3 === 0 ? 2 : 4,
        busy: false,
      })),
    );
    const t = ts.find((x) => x.id == tableId);
    if (t) {
      if (t.busy !== true) {
        t.busy = true;
        save("tableTimes", { ...load("tableTimes", {}), [t.id]: Date.now() }); // ghi giờ bắt đầu phục vụ
      }
      save("tables", ts);
    }
    const bk = load("bookings", {});
    delete bk[tableId];
    save("bookings", bk);
  }
  localStorage.removeItem("checkoutDraft");

  // Xóa giỏ hàng sau khi thanh toán
  saveCart([]);
  discount = 0;
  updateBadge();

  showInvoice(bill);
  e.target.reset();
  $("cash-box").hidden = true;
  $("table-box").hidden = true;
  $("addr-box").hidden = true;
  $("code").value = "";
  $("code-msg").textContent = "";
  renderSummary();
});

// ---------- Hóa đơn sau khi thanh toán ----------
function showInvoice(b) {
  $("invoice").innerHTML = `
    <p class="done">Thanh toán thành công. Cảm ơn ${esc(b.name)}!</p>
    <h2>Hóa đơn ${b.code}</h2>
    <div class="meta">
      <span>Thời gian:</span><span>${b.time}</span>
      <span>Khách hàng:</span><span>${esc(b.name)} - ${esc(b.phone)}</span>
      <span>Nhận món:</span><span>${KIND_LABEL[b.type] || "-"}${b.table ? " - Bàn " + b.table : ""}${b.address ? " - " + esc(b.address) : ""}</span>
      ${b.when ? `<span>Hẹn lúc:</span><span>${esc(b.when)}</span>` : ""}
      <span>Thanh toán:</span><span>${esc(b.method)}</span>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Món</th><th>Size</th><th>Đá</th><th>Đường</th><th>SL</th><th>Thành tiền</th></tr></thead>
      <tbody>${b.items
        .map(
          (i) =>
            `<tr><td>${esc(i.name)}</td><td>${i.size ? SIZES[i.size].label : "-"}</td><td>${i.ice ? i.ice + "%" : "-"}</td><td>${i.sugar ? i.sugar + "%" : "-"}</td><td>${i.qty}</td><td>${fmt(i.amount)}</td></tr>`,
        )
        .join("")}</tbody>
    </table></div>
    <div class="total"><span>Tạm tính</span><span>${fmt(b.sub)}</span></div>
    <div class="total"><span>Giảm giá</span><span>-${fmt(b.cut)}</span></div>
    ${b.ship ? `<div class="total"><span>Phí giao hàng</span><span>${fmt(b.ship)}</span></div>` : ""}
    <div class="total big"><span>Tổng cộng</span><span>${fmt(b.total)}</span></div>
    ${
      b.cash
        ? `<div class="total"><span>Tiền khách đưa</span><span>${fmt(b.cash)}</span></div>
           <div class="total"><span>Tiền thừa</span><span>${fmt(b.cash - b.total)}</span></div>`
        : ""
    }
    <div class="actions">
      <button class="btn" type="button" id="print-btn">In hóa đơn</button>
      <a class="btn ghost" href="index.html" style="text-decoration:none">Gọi món tiếp</a>
    </div>`;

  $("invoice").hidden = false;
  $("print-btn").addEventListener("click", () => window.print());
  $("invoice").scrollIntoView({ behavior: "smooth" });
}

// ---------- Khởi chạy ----------
// Điền sẵn từ trang Quản lý bàn
function applyDraft() {
  if (!draft) return;
  if (draft.name) $("name").value = draft.name;
  if (draft.phone) $("phone").value = draft.phone;
  const radio = document.querySelector(
    `input[name="kind"][value="${draft.kind}"]`,
  );
  if (radio) {
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true })); // hiện ô chọn bàn / địa chỉ, tính phí ship
  }
  if (draft.table) $("table-sel").value = String(draft.table);
  if (draft.address) $("address").value = draft.address;
}

renderTableOptions();
applyDraft();
renderSummary();
