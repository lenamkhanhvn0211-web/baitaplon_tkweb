/* ==========================================================
   TRANG THANH TOÁN: hóa đơn, mã giảm giá, xác nhận thanh toán
   ========================================================== */

// Mã giảm giá: tên mã -> tỉ lệ giảm
const CODES = {
  CAFE10: 0.1,
  HELLO20: 0.2,
};

let discount = 0; // tỉ lệ giảm hiện tại (0 = không giảm)

// Viết tắt để lấy phần tử theo id
const $ = (id) => document.getElementById(id);

// ---------- Hiển thị hóa đơn ----------
function renderSummary() {
  const cart = getCart();
  const subtotal = cartTotal();
  const cut = Math.round(subtotal * discount);

  const rows = Object.keys(cart)
    .map((id) => {
      const item = MENU.find((m) => m.id == id);
      return `
        <tr>
          <td>${item.name} x ${cart[id]}</td>
          <td>${fmt(item.price * cart[id])}</td>
        </tr>`;
    })
    .join("");

  $("lines").innerHTML =
    rows ||
    '<tr><td colspan="2" class="empty">Chưa có món nào trong giỏ.</td></tr>';

  $("sub").textContent = fmt(subtotal);
  $("cut").textContent = "-" + fmt(cut);
  $("sum").textContent = fmt(subtotal - cut);
}

// ---------- Áp dụng mã giảm giá ----------
$("apply").addEventListener("click", () => {
  const code = $("code").value.trim().toUpperCase();
  discount = CODES[code] || 0;

  if (discount) {
    $("code-msg").textContent = `Đã áp dụng giảm ${discount * 100}%`;
    $("code-msg").className = "msg-ok";
  } else {
    $("code-msg").textContent = "Mã không hợp lệ.";
    $("code-msg").className = "error";
  }

  renderSummary();
});

// ---------- Xác nhận thanh toán ----------
$("pay-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  const method = document.querySelector('input[name="method"]:checked');

  // Kiểm tra dữ liệu nhập và hiện thông báo lỗi
  $("e-name").textContent =
    name.length < 2 ? "Nhập họ tên (ít nhất 2 ký tự)." : "";
  $("e-phone").textContent = /^0\d{9}$/.test(phone)
    ? ""
    : "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.";
  $("e-method").textContent = method ? "" : "Chọn phương thức thanh toán.";
  $("e-cart").textContent = cartTotal()
    ? ""
    : "Giỏ hàng trống, hãy chọn món trước.";

  // Còn lỗi thì dừng lại
  const hasError = document.querySelectorAll(".error:not(:empty)").length > 0;
  if (hasError) return;

  // Lưu đơn hàng
  const orders = load("orders", []);
  orders.push({
    time: new Date().toISOString(),
    name,
    phone,
    method: method.value,
    items: getCart(),
    total: cartTotal() * (1 - discount),
  });
  save("orders", orders);

  // Làm trống giỏ hàng và cập nhật giao diện
  save("cart", {});
  updateBadge();
  renderSummary();

  $("done").textContent = `Thanh toán thành công. Cảm ơn ${name}!`;
  e.target.reset();
});

// ---------- Khởi chạy ----------
renderSummary();
