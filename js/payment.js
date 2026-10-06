/* ===== Dữ liệu mẫu ===== */
const MENU = [
  { id: 1,  name: "Cà phê đen",     cat: "Cà phê",  price: 25000 },
  { id: 2,  name: "Cà phê sữa",     cat: "Cà phê",  price: 29000 },
  { id: 3,  name: "Bạc xỉu",        cat: "Cà phê",  price: 32000 },
  { id: 4,  name: "Cappuccino",     cat: "Cà phê",  price: 45000 },
  { id: 5,  name: "Trà đào",        cat: "Trà",     price: 39000 },
  { id: 6,  name: "Trà vải",        cat: "Trà",     price: 39000 },
  { id: 7,  name: "Trà sen vàng",   cat: "Trà",     price: 42000 },
  { id: 8,  name: "Sinh tố bơ",     cat: "Sinh tố", price: 45000 },
  { id: 9,  name: "Sinh tố xoài",   cat: "Sinh tố", price: 42000 },
  { id: 10, name: "Bánh tiramisu",  cat: "Bánh",    price: 35000 },
  { id: 11, name: "Bánh croissant", cat: "Bánh",    price: 30000 },
  { id: 12, name: "Bánh cookie",    cat: "Bánh",    price: 20000 }
];
const SIZES = { S: { label: "Nhỏ", add: -5000 }, M: { label: "Vừa", add: 0 }, L: { label: "Lớn", add: 8000 } };
const CODES = { CAFE10: 0.1, HELLO20: 0.2 };
// Đơn mẫu để trang có sẵn dữ liệu khi mở lần đầu
const DEFAULT_ORDER = [
  { id: 2,  qty: 2, size: "M" },
  { id: 5,  qty: 1, size: "L" },
  { id: 10, qty: 1, size: "" }
];

/* ===== Hàm tiện ích ===== */
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString("vi-VN") + "đ";
const fmtAdd = n => n ? (n > 0 ? " (+" : " (-") + fmt(Math.abs(n)) + ")" : "";
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* bỏ qua nếu bị chặn */ } };
const hasSize = m => m.cat !== "Bánh";
const menuOf = id => MENU.find(m => m.id === id);

/* ===== Trạng thái ===== */
let order = load("pay-order", DEFAULT_ORDER).filter(it => menuOf(it.id));
let discount = 0;

/* ===== Tính tiền ===== */
const unit = it => menuOf(it.id).price + (it.size ? SIZES[it.size].add : 0);
const subtotal = () => order.reduce((t, it) => t + unit(it) * it.qty, 0);
const cutAmount = () => Math.round(subtotal() * discount);
const total = () => subtotal() - cutAmount();

/* ===== Hiển thị ===== */
function renderAddList() {
  $("add-item").innerHTML = MENU.map(m => `<option value="${m.id}">${m.name} - ${fmt(m.price)}</option>`).join("");
}

function render() {
  $("lines").innerHTML = order.map(it => {
    const m = menuOf(it.id);
    const sel = hasSize(m)
      ? `<select class="size-sel" data-id="${it.id}" aria-label="Chọn size ${esc(m.name)}">` +
        Object.entries(SIZES).map(([k, v]) => `<option value="${k}" ${k === it.size ? "selected" : ""}>${v.label}${fmtAdd(v.add)}</option>`).join("") +
        "</select>"
      : "-";
    return `<tr>
      <td>${esc(m.name)}</td>
      <td>${sel}</td>
      <td><span class="qty">
        <button type="button" data-act="dec" data-id="${it.id}" aria-label="Giảm số lượng">-</button>${it.qty}
        <button type="button" data-act="inc" data-id="${it.id}" aria-label="Tăng số lượng">+</button></span></td>
      <td>${fmt(unit(it) * it.qty)}</td>
      <td><button type="button" class="btn ghost" data-act="del" data-id="${it.id}">Xóa</button></td>
    </tr>`;
  }).join("") || '<tr><td colspan="5" class="empty">Chưa có món nào. Hãy chọn món ở phía trên.</td></tr>';

  $("sub").textContent = fmt(subtotal());
  $("cut").textContent = "-" + fmt(cutAmount());
  $("sum").textContent = fmt(total());
  updateChange();
  save("pay-order", order);
}

function updateChange() {
  const cash = parseInt($("cash").value.replace(/\D/g, ""), 10) || 0;
  $("change").textContent = cash >= total() && cash > 0 ? "Tiền thừa trả khách: " + fmt(cash - total()) : "";
}

/* ===== Sự kiện: chỉnh hóa đơn ===== */
$("add-btn").addEventListener("click", () => {
  const id = +$("add-item").value, m = menuOf(id);
  const found = order.find(it => it.id === id);
  if (found) found.qty++;
  else order.push({ id, qty: 1, size: hasSize(m) ? "M" : "" });
  render();
});

$("lines").addEventListener("click", e => {
  const { act, id } = e.target.dataset; if (!act) return;
  const it = order.find(x => x.id === +id);
  if (act === "inc") it.qty++;
  if (act === "dec" && --it.qty <= 0) order = order.filter(x => x !== it);
  if (act === "del") order = order.filter(x => x !== it);
  render();
});

$("lines").addEventListener("change", e => {
  if (!e.target.matches(".size-sel")) return;
  order.find(x => x.id === +e.target.dataset.id).size = e.target.value;
  render();
});

/* ===== Sự kiện: mã giảm giá ===== */
$("apply").addEventListener("click", () => {
  const code = $("code").value.trim().toUpperCase();
  discount = CODES[code] || 0;
  $("code-msg").textContent = discount ? `Đã áp dụng giảm ${discount * 100}%` : "Mã không hợp lệ.";
  $("code-msg").className = discount ? "msg-ok" : "error";
  render();
});

/* ===== Phương thức thanh toán: chỉ tiền mặt mới nhập tiền khách đưa ===== */
document.querySelectorAll('input[name="method"]').forEach(r => r.addEventListener("change", () => {
  $("cash-box").hidden = r.value !== "Tiền mặt";
  $("e-cash").textContent = "";
}));
$("cash").addEventListener("input", updateChange);

/* ===== Gửi form: kiểm tra dữ liệu ===== */
$("pay-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  const method = document.querySelector('input[name="method"]:checked');
  const cash = parseInt($("cash").value.replace(/\D/g, ""), 10) || 0;
  let ok = true;

  const check = (errId, bad, msg) => { $(errId).textContent = bad ? msg : ""; if (bad) ok = false; };
  check("e-name", name.length < 2, "Nhập họ tên (ít nhất 2 ký tự).");
  check("e-phone", !/^0\d{9}$/.test(phone), "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.");
  check("e-method", !method, "Chọn phương thức thanh toán.");
  check("e-cash", method && method.value === "Tiền mặt" && cash < total(), "Tiền khách đưa chưa đủ.");
  check("e-cart", order.length === 0, "Hóa đơn trống, hãy chọn món trước.");
  if (!ok) return;

  const bill = {
    code: "HD" + Date.now().toString().slice(-6),
    time: new Date().toLocaleString("vi-VN"),
    name, phone, method: method.value,
    items: order.map(it => ({ name: menuOf(it.id).name, size: it.size, qty: it.qty, amount: unit(it) * it.qty })),
    sub: subtotal(), cut: cutAmount(), total: total(),
    cash: method.value === "Tiền mặt" ? cash : 0
  };
  const orders = load("orders", []); orders.push(bill); save("orders", orders);
  showInvoice(bill);

  order = []; discount = 0;
  e.target.reset(); $("cash-box").hidden = true; $("code-msg").textContent = "";
  render();
});

/* ===== Hóa đơn sau khi thanh toán ===== */
function showInvoice(b) {
  $("invoice").innerHTML = `
    <p class="done">Thanh toán thành công. Cảm ơn ${esc(b.name)}!</p>
    <h2>Hóa đơn ${b.code}</h2>
    <div class="meta">
      <span>Thời gian:</span><span>${b.time}</span>
      <span>Khách hàng:</span><span>${esc(b.name)} - ${esc(b.phone)}</span>
      <span>Thanh toán:</span><span>${esc(b.method)}</span>
    </div>
    <table>
      <thead><tr><th>Món</th><th>Size</th><th>SL</th><th>Thành tiền</th></tr></thead>
      <tbody>${b.items.map(i => `<tr><td>${esc(i.name)}</td><td>${i.size ? SIZES[i.size].label : "-"}</td><td>${i.qty}</td><td>${fmt(i.amount)}</td></tr>`).join("")}</tbody>
    </table>
    <div class="total"><span>Tạm tính</span><span>${fmt(b.sub)}</span></div>
    <div class="total"><span>Giảm giá</span><span>-${fmt(b.cut)}</span></div>
    <div class="total big"><span>Tổng cộng</span><span>${fmt(b.total)}</span></div>
    ${b.cash ? `<div class="total"><span>Tiền khách đưa</span><span>${fmt(b.cash)}</span></div>
    <div class="total"><span>Tiền thừa</span><span>${fmt(b.cash - b.total)}</span></div>` : ""}
    <div class="actions">
      <button class="btn" type="button" id="print-btn">In hóa đơn</button>
      <button class="btn ghost" type="button" id="new-btn">Tạo đơn mới</button>
    </div>`;
  $("invoice").hidden = false;
  $("print-btn").addEventListener("click", () => window.print());
  $("new-btn").addEventListener("click", () => {
    order = DEFAULT_ORDER.map(it => ({ ...it }));
    $("invoice").hidden = true;
    render();
    window.scrollTo({ top: 0 });
  });
  $("invoice").scrollIntoView({ behavior: "smooth" });
}

renderAddList();
render();
