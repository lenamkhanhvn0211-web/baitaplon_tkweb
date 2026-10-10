/* ==========================================================
   TRANG ĐĂNG NHẬP
   - Đăng nhập bằng tài khoản mẫu (khách hàng, admin, nhân viên)
   - Admin xem được các đơn hàng: tại bàn / mang đi / giao về nhà
   ========================================================== */

// Tài khoản thử (chỉ dùng demo, không an toàn cho thực tế)
// role: "customer" = khách hàng, "admin" = quản trị, "staff" = nhân viên
const ACCOUNTS = {
  khach:    { password: "khach123", name: "Nguyễn Vãn A", role: "customer" },
  admin:    { password: "123456",   name: "Quản trị viên",   role: "admin" },
  nhanvien: { password: "cafe2026", name: "Nhân viên",       role: "staff" },
};

const ROLE_LABEL = { customer: "Khách hàng", admin: "Quản trị viên", staff: "Nhân viên" };
const SIZE_LABEL = { S: "Nhỏ", M: "Vừa", L: "Lớn" };
const MIN_PASSWORD_LENGTH = 6;

// Các nút đi nhanh theo từng loại tài khoản
const ROLE_LINKS = {
  customer: [["index.html", "Xem thực đơn"], ["order.html", "Gọi món"]],
  staff:    [["tables.html", "Quản lý bàn"], ["payment.html", "Thanh toán"]],
  admin:    [["tables.html", "Quản lý bàn"], ["payment.html", "Thanh toán"]],
};

const $ = (id) => document.getElementById(id);

// Bộ lọc đơn hàng đang chọn: "all" | "table" | "takeaway" | "home"
let orderFilter = "all";

// ---------- Đơn hàng ----------

// Đơn hàng được lưu trong localStorage ("orders").
// Mỗi đơn có:
//   - Đặt tại bàn:  { type: "table", table: 5 }
//   - Mang đi:      { type: "takeaway" }
//   - Giao về nhà:  { type: "home",  address: "12 Lê Lợi, Q1" }
function orderKind(order) {
  const type = String(order.type || "").toLowerCase();
  if (type === "takeaway") return "takeaway";
  if (type === "table" || order.table) return "table";
  if (type === "home" || order.address) return "home";
  return "unknown";
}

// Tóm tắt các món trong đơn, ví dụ "2 x Cà phê sữa (Lớn), 1 x Bánh cookie"
function itemsText(order) {
  const items = order.items;
  if (Array.isArray(items)) {
    return items
      .map((i) => `${i.qty} x ${i.name}${i.size ? " (" + (SIZE_LABEL[i.size] || i.size) + ")" : ""}`)
      .join(", ");
  }
  if (items && typeof items === "object") {
    // Dạng giỏ hàng cũ: { idMón: soLượng }
    return Object.entries(items)
      .map(([id, qty]) => {
        const m = MENU.find((x) => x.id == id);
        return `${qty} x ${m ? m.name : "Món #" + id}`;
      })
      .join(", ");
  }
  return "-";
}

function kindCell(order) {
  const kind = orderKind(order);
  if (kind === "table") {
    return `<span class="kind table">Tại bàn ${escapeHtml(order.table || "?")}</span>`;
  }
  if (kind === "takeaway") {
    return '<span class="kind takeaway">Mang đi</span>';
  }
  if (kind === "home") {
    const addr = order.address ? `<span class="sub-line">${escapeHtml(order.address)}</span>` : "";
    return `<span class="kind home">Giao về nhà</span>${addr}`;
  }
  return '<span class="kind unknown">Chưa ghi hình thức</span>';
}

function renderOrders() {
  // Đơn mới nhất lên đầu
  const all = load("orders", []).slice().reverse();
  const count = (kind) => all.filter((o) => orderKind(o) === kind).length;
  const revenue = all.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  $("order-stats").innerHTML = `
    <div class="stat-box"><span>Tại bàn</span><strong>${count("table")} đơn</strong></div>
    <div class="stat-box"><span>Mang đi</span><strong>${count("takeaway")} đơn</strong></div>
    <div class="stat-box"><span>Giao về nhà</span><strong>${count("home")} đơn</strong></div>
    <div class="stat-box"><span>Tổng doanh thu</span><strong>${fmt(revenue)}</strong></div>`;

  const filters = [["all", "Tất cả"], ["table", "Tại bàn"], ["takeaway", "Mang đi"], ["home", "Giao về nhà"]];
  $("order-filter").innerHTML = filters
    .map(([key, label]) => `<button type="button" class="filter-btn ${key === orderFilter ? "on" : ""}" data-filter="${key}" aria-pressed="${key === orderFilter}">${label}</button>`)
    .join("");

  const list = all.filter((o) => orderFilter === "all" || orderKind(o) === orderFilter);

  $("order-rows").innerHTML = list.length
    ? list
        .map((o) => `
      <tr>
        <td>${escapeHtml(o.code || "-")}<span class="sub-line">${escapeHtml(o.time || "")}</span></td>
        <td>${escapeHtml(o.name || "-")}<span class="sub-line">${escapeHtml(o.phone || "")}</span></td>
        <td>${kindCell(o)}</td>
        <td>${escapeHtml(itemsText(o))}</td>
        <td>${fmt(Number(o.total) || 0)}</td>
        <td>${escapeHtml(o.method || "-")}</td>
      </tr>`)
        .join("")
    : '<tr><td colspan="6" class="empty">Chưa có đơn hàng nào.</td></tr>';
}

// ---------- Hiển thị theo trạng thái đăng nhập ----------
function render() {
  const user = currentUser();

  $("login-form").hidden = !!user;
  $("account").hidden = !user;
  $("page-title").textContent = user ? "Tài khoản" : "Đăng nhập";
  document.title = (user ? "Tài khoản" : "Đăng nhập") + " - Cà Phê Web";
  if (!user) return;

  $("who").textContent = user.name;
  $("role").textContent = ROLE_LABEL[user.role] || user.role;
  $("account-links").innerHTML = (ROLE_LINKS[user.role] || [])
    .map(([href, label]) => `<a class="btn ghost btn-link" href="${href}">${label}</a>`)
    .join("");

  // Chỉ admin mới thấy danh sách đơn hàng
  $("orders-panel").hidden = user.role !== "admin";
  if (user.role === "admin") renderOrders();
}

// ---------- Sự kiện ----------

// Bấm nút lọc đơn hàng
$("order-filter").addEventListener("click", (e) => {
  if (!e.target.dataset.filter) return;
  orderFilter = e.target.dataset.filter;
  renderOrders();
});

// Gửi form đăng nhập
$("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const username = $("user").value.trim();
  const password = $("pass").value;

  // Kiểm tra dữ liệu nhập
  const userValid = username !== "";
  const passValid = password.length >= MIN_PASSWORD_LENGTH;

  $("e-user").textContent = userValid ? "" : "Nhập tên đăng nhập.";
  $("e-pass").textContent = passValid ? "" : `Mật khẩu có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
  $("e-login").textContent = "";
  if (!userValid || !passValid) return;

  // Kiểm tra tài khoản
  const account = Object.hasOwn(ACCOUNTS, username) ? ACCOUNTS[username] : null;
  if (!account || account.password !== password) {
    $("e-login").textContent = "Sai tên đăng nhập hoặc mật khẩu.";
    return;
  }

  // Đăng nhập thành công: lưu lại rồi vẽ lại trang và header
  save("user", username);
  save("userInfo", { username, name: account.name, role: account.role });
  e.target.reset();
  renderHeader();
  render();
});

// ---------- Khởi chạy ----------
render();
