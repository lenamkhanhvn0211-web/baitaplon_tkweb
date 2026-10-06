/* ==========================================================
   TRANG GỌI MÓN: xem giỏ hàng, tăng / giảm / xóa món
   ========================================================== */

const box = document.getElementById("cart-box");

// ---------- Hiển thị ----------

// Tạo 1 dòng trong bảng giỏ hàng
function cartRow(id, qty) {
  const item = MENU.find((m) => m.id == id);

  return `
    <tr>
      <td>${item.name}</td>
      <td>${fmt(item.price)}</td>
      <td>
        <span class="qty">
          <button data-act="dec" data-id="${id}" aria-label="Giảm">-</button>
          ${qty}
          <button data-act="inc" data-id="${id}" aria-label="Tăng">+</button>
        </span>
      </td>
      <td>${fmt(item.price * qty)}</td>
      <td><button class="btn ghost" data-act="del" data-id="${id}">Xóa</button></td>
    </tr>`;
}

function renderCart() {
  const cart = getCart();
  const ids = Object.keys(cart);

  // Giỏ hàng trống
  if (!ids.length) {
    box.innerHTML =
      '<p class="empty">Giỏ hàng trống. <a href="index.html">Chọn món ở trang Thực đơn</a>.</p>';
    updateBadge();
    return;
  }

  const rows = ids.map((id) => cartRow(id, cart[id])).join("");

  box.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Món</th>
          <th>Đơn giá</th>
          <th>Số lượng</th>
          <th>Thành tiền</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="total">
      <span>Tổng cộng</span>
      <span>${fmt(cartTotal())}</span>
    </div>

    <p style="margin-top:16px">
      <a class="btn" href="payment.html" style="text-decoration:none;display:inline-block">Đến thanh toán</a>
    </p>`;

  updateBadge();
}

// ---------- Sự kiện ----------

// Bấm các nút +, -, Xóa trong giỏ hàng
box.addEventListener("click", (e) => {
  const { act, id } = e.target.dataset;
  if (!act) return;

  const cart = getCart();

  if (act === "inc") {
    cart[id]++;
  } else if (act === "dec") {
    cart[id]--;
    if (cart[id] <= 0) delete cart[id]; // giảm về 0 thì bỏ món
  } else if (act === "del") {
    delete cart[id];
  }

  save("cart", cart);
  renderCart();
});

// ---------- Khởi chạy ----------
renderCart();
