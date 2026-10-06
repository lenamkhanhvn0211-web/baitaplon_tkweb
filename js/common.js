/* ==========================================================
   JS DÙNG CHUNG: dữ liệu thực đơn, giỏ hàng, header
   ========================================================== */

// ---------- Dữ liệu thực đơn ----------
const MENU = [
  { id: 1,  name: "Cà phê đen",     cat: "Cà phê",  price: 25000, img: "images/ca-phe-den.jpg" },
  { id: 2,  name: "Cà phê sữa",     cat: "Cà phê",  price: 29000, img: "images/ca-phe-sua.jpg" },
  { id: 3,  name: "Bạc xỉu",        cat: "Cà phê",  price: 32000, img: "images/bac-xiu.jpg" },
  { id: 4,  name: "Cappuccino",     cat: "Cà phê",  price: 45000, img: "images/cappuccino.jpg" },
  { id: 5,  name: "Trà đào",        cat: "Trà",     price: 39000, img: "images/tra-dao.jpg" },
  { id: 6,  name: "Trà vải",        cat: "Trà",     price: 39000, img: "images/tra-vai.jpg" },
  { id: 7,  name: "Trà sen vàng",   cat: "Trà",     price: 42000, img: "images/tra-sen-vang.jpg" },
  { id: 8,  name: "Sinh tố bơ",     cat: "Sinh tố", price: 45000, img: "images/sinh-to-bo.jpg" },
  { id: 9,  name: "Sinh tố xoài",   cat: "Sinh tố", price: 42000, img: "images/sinh-to-xoai.jpg" },
  { id: 10, name: "Bánh tiramisu",  cat: "Bánh",    price: 35000, img: "images/banh-tiramisu.jpg" },
  { id: 11, name: "Bánh croissant", cat: "Bánh",    price: 30000, img: "images/banh-croissant.jpg" },
  { id: 12, name: "Bánh cookie",    cat: "Bánh",    price: 20000, img: "images/banh-cookie.jpg" },
];

// ---------- Hàm tiện ích ----------

// Định dạng tiền: 25000 -> "25.000đ"
const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

// Đọc dữ liệu từ localStorage (nếu lỗi hoặc chưa có thì trả về giá trị mặc định)
const load = (key, defaultValue) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// Lưu dữ liệu vào localStorage
const save = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ---------- Giỏ hàng ----------
// Giỏ hàng có dạng { idMón: soLượng }, ví dụ { "1": 2, "5": 1 }

const getCart = () => load("cart", {});

// Tổng số lượng món trong giỏ
const cartCount = () => {
  return Object.values(getCart()).reduce((sum, qty) => sum + qty, 0);
};

// Tổng tiền của giỏ hàng
const cartTotal = () => {
  return Object.entries(getCart()).reduce((sum, [id, qty]) => {
    const item = MENU.find((m) => m.id == id);
    return sum + item.price * qty;
  }, 0);
};

// Thêm 1 món vào giỏ
function addToCart(id) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + 1;
  save("cart", cart);
  updateBadge();
}

// Cập nhật số hiển thị trên biểu tượng giỏ hàng ở header
function updateBadge() {
  const badge = document.getElementById("cart-badge");
  if (badge) badge.textContent = cartCount();
}

// ---------- Header ----------
function renderHeader() {
  const pages = [
    ["index.html",   "Thực đơn"],
    ["order.html",   "Gọi món"],
    ["payment.html", "Thanh toán"],
    ["tables.html",  "Quản lý bàn"],
    ["login.html",   "Đăng nhập"],
  ];

  // Tên file của trang hiện tại, dùng để đánh dấu mục đang chọn
  const currentPage = location.pathname.split("/").pop() || "index.html";

  const navLinks = pages
    .map(([href, title]) => {
      const activeClass = href === currentPage ? "active" : "";
      const badge =
        href === "order.html"
          ? ' <span class="badge" id="cart-badge">0</span>'
          : "";
      return `<a href="${href}" class="${activeClass}">${title}${badge}</a>`;
    })
    .join("");

  document.getElementById("site-header").innerHTML =
    '<a class="brand" href="index.html">Quán Cà Phê Góc Phố</a>' +
    `<nav>${navLinks}</nav>`;

  updateBadge();
}

document.addEventListener("DOMContentLoaded", renderHeader);
