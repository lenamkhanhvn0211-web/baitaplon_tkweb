/* ==========================================================
   TRANG THANH TOÁN
   - Món lấy từ giỏ hàng của trang Gọi món (common.js)
   - Chọn size, mã giảm giá, kiểm tra form, in hóa đơn
   ========================================================== */

// ---------- Dữ liệu ----------
const SIZES = {
  S: { label: "Nhỏ", add: -5000 },
  M: { label: "Vừa", add: 0 },
  L: { label: "Lớn", add: 8000 },
};
const CODES = { CAFE10: 0.1, HELLO20: 0.2 };

// ---------- Trạng thái ----------
let discount = 0; // tỉ lệ giảm giá đang áp dụng (0.1 = 10%)

// ---------- Hàm tiện ích ----------
const $ = (id) => document.getElementById(id);

// Chống chèn HTML khi in dữ liệu người dùng nhập
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fmtAdd = (n) => (n ? (n > 0 ? " (+" : " (-") + fmt(Math.abs(n)) + ")" : "");

// Bánh không có size
const hasSize = (item) => item.cat !== "Bánh";

// Size của từng món lưu riêng: { idMón: "S" | "M" | "L" }, mặc định là Vừa
const getSizes = () => load("sizes", {});
const sizeOf = (item, sizes) => {
  if (!hasSize(item)) return "";
  return SIZES[sizes[item.id]] ? sizes[item.id] : "M";
};

const unitPrice = (item, size) => item.price + (size ? SIZES[size].add : 0);

// Các dòng trong hóa đơn, lấy từ giỏ hàng
function getLines() {
  const cart = getCart();
  const sizes = getSizes();
  return Object.keys(cart)
    .map((id) => {
      const item = MENU.find((m) => m.id == id);
      if (!item) return null;
      const size = sizeOf(item, sizes);
      return { item, qty: cart[id], size, unit: unitPrice(item, size) };
    })
    .filter(Boolean);
}

// ---------- Tính tiền ----------
const subtotal = () => getLines().reduce((sum, l) => sum + l.unit * l.qty, 0);
const cutAmount = () => Math.round(subtotal() * discount);
const total = () => subtotal() - cutAmount();

// ---------- Hiển thị hóa đơn ----------
function renderSummary() {
  const lines = getLines();

  $("lines").innerHTML =
    lines
      .map((l) => {
        const sizeCell = l.size
          ? `<select class="size-sel" data-id="${l.item.id}" aria-label="Chọn size ${esc(l.item.name)}">` +
            Object.entries(SIZES)
              .map(([k, v]) => `<option value="${k}" ${k === l.size ? "selected" : ""}>${v.label}${fmtAdd(v.add)}</option>`)
              .join("") +
            "</select>"
          : "-";
        return `
        <tr>
          <td>${esc(l.item.name)}</td>
          <td>${sizeCell}</td>
          <td><span class="qty">
            <button type="button" data-act="dec" data-id="${l.item.id}" aria-label="Giảm số lượng">-</button>${l.qty}
            <button type="button" data-act="inc" data-id="${l.item.id}" aria-label="Tăng số lượng">+</button>
          </span></td>
          <td>${fmt(l.unit * l.qty)}</td>
          <td><button type="button" class="btn ghost" data-act="del" data-id="${l.item.id}">Xóa</button></td>
        </tr>`;
      })
      .join("") ||
    '<tr><td colspan="5" class="empty">Hóa đơn trống. <a href="index.html">Chọn món ở trang Thực đơn</a>.</td></tr>';

  $("sub").textContent = fmt(subtotal());
  $("cut").textContent = "-" + fmt(cutAmount());
  $("sum").textContent = fmt(total());
  updateChange();
  updateBadge();
}

// Tiền thừa khi thanh toán tiền mặt
function updateChange() {
  const cash = parseInt($("cash").value.replace(/\D/g, ""), 10) || 0;
  $("change").textContent =
    cash > 0 && cash >= total() ? "Tiền thừa trả khách: " + fmt(cash - total()) : "";
}

// ---------- Sự kiện: chỉnh hóa đơn ----------
$("lines").addEventListener("click", (e) => {
  const { act, id } = e.target.dataset;
  if (!act) return;

  const cart = getCart();
  if (act === "inc") cart[id]++;
  if (act === "dec" && --cart[id] <= 0) delete cart[id];
  if (act === "del") delete cart[id];

  save("cart", cart);
  renderSummary();
});

$("lines").addEventListener("change", (e) => {
  if (!e.target.matches(".size-sel")) return;
  const sizes = getSizes();
  sizes[e.target.dataset.id] = e.target.value;
  save("sizes", sizes);
  renderSummary();
});

// ---------- Sự kiện: mã giảm giá ----------
$("apply").addEventListener("click", () => {
  const code = $("code").value.trim().toUpperCase();
  discount = CODES[code] || 0;
  $("code-msg").textContent = discount ? `Đã áp dụng giảm ${discount * 100}%` : "Mã không hợp lệ.";
  $("code-msg").className = discount ? "msg-ok" : "error";
  renderSummary();
});

// ---------- Sự kiện: phương thức thanh toán ----------
// Chỉ tiền mặt mới cần nhập tiền khách đưa
document.querySelectorAll('input[name="method"]').forEach((radio) =>
  radio.addEventListener("change", () => {
    $("cash-box").hidden = radio.value !== "Tiền mặt";
    $("e-cash").textContent = "";
  })
);
$("cash").addEventListener("input", updateChange);

// ---------- Sự kiện: gửi form ----------
$("pay-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  const method = document.querySelector('input[name="method"]:checked');
  const cash = parseInt($("cash").value.replace(/\D/g, ""), 10) || 0;
  let ok = true;

  // Hiện lỗi cạnh ô nhập nếu dữ liệu sai
  const check = (errId, isBad, message) => {
    $(errId).textContent = isBad ? message : "";
    if (isBad) ok = false;
  };
  check("e-name", name.length < 2, "Nhập họ tên (ít nhất 2 ký tự).");
  check("e-phone", !/^0\d{9}$/.test(phone), "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.");
  check("e-method", !method, "Chọn phương thức thanh toán.");
  check("e-cash", method && method.value === "Tiền mặt" && cash < total(), "Tiền khách đưa chưa đủ.");
  check("e-cart", getLines().length === 0, "Hóa đơn trống, hãy chọn món trước.");
  if (!ok) return;

  // Tạo hóa đơn và lưu vào localStorage
  const bill = {
    code: "HD" + Date.now().toString().slice(-6),
    time: new Date().toLocaleString("vi-VN"),
    name,
    phone,
    method: method.value,
    items: getLines().map((l) => ({ name: l.item.name, size: l.size, qty: l.qty, amount: l.unit * l.qty })),
    sub: subtotal(),
    cut: cutAmount(),
    total: total(),
    cash: method.value === "Tiền mặt" ? cash : 0,
  };
  save("orders", [...load("orders", []), bill]);

  // Xóa giỏ hàng sau khi thanh toán
  save("cart", {});
  save("sizes", {});
  discount = 0;
  updateBadge();

  showInvoice(bill);
  e.target.reset();
  $("cash-box").hidden = true;
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
      <span>Thanh toán:</span><span>${esc(b.method)}</span>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Món</th><th>Size</th><th>SL</th><th>Thành tiền</th></tr></thead>
      <tbody>${b.items
        .map((i) => `<tr><td>${esc(i.name)}</td><td>${i.size ? SIZES[i.size].label : "-"}</td><td>${i.qty}</td><td>${fmt(i.amount)}</td></tr>`)
        .join("")}</tbody>
    </table></div>
    <div class="total"><span>Tạm tính</span><span>${fmt(b.sub)}</span></div>
    <div class="total"><span>Giảm giá</span><span>-${fmt(b.cut)}</span></div>
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
renderSummary();
