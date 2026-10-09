/* ==========================================================
   JS DÙNG CHUNG: dữ liệu thực đơn, giỏ hàng, header
   ========================================================== */

// ---------- Dữ liệu thực đơn ----------
const MENU = [
  // ===== Cà phê =====
  { id: 1,  name: "Cà phê đen",         cat: "Cà phê",  price: 25000, img: "images/ca-phe-den.jpg" },
  { id: 2,  name: "Cà phê sữa",         cat: "Cà phê",  price: 29000, img: "images/ca-phe-sua.jpg" },
  { id: 3,  name: "Bạc xỉu",            cat: "Cà phê",  price: 32000, img: "images/bac-xiu.jpg" },
  { id: 4,  name: "Cappuccino",         cat: "Cà phê",  price: 45000, img: "images/cappuccino.jpg" },
  { id: 5,  name: "Cà phê trứng",       cat: "Cà phê",  price: 40000 },
  { id: 6,  name: "Cà phê cốt dừa",     cat: "Cà phê",  price: 40000 },
  { id: 7,  name: "Cà phê muối",        cat: "Cà phê",  price: 35000 },
  { id: 8,  name: "Cold Brew",          cat: "Cà phê",  price: 40000 },
  // mới thêm
  { id: 9,  name: "Espresso",           cat: "Cà phê",  price: 30000 },
  { id: 10, name: "Americano",          cat: "Cà phê",  price: 35000 },
  { id: 11, name: "Latte",              cat: "Cà phê",  price: 45000 },
  { id: 12, name: "Caramel Macchiato",  cat: "Cà phê",  price: 49000 },
  { id: 13, name: "Mocha",              cat: "Cà phê",  price: 49000 },

  // ===== Trà =====
  { id: 14, name: "Trà đào",            cat: "Trà",     price: 39000, img: "images/tra-dao.jpg" },
  { id: 15, name: "Trà vải",            cat: "Trà",     price: 39000, img: "images/tra-vai.jpg" },
  { id: 16, name: "Trà sen vàng",       cat: "Trà",     price: 42000, img: "images/tra-sen-vang.jpg" },
  { id: 17, name: "Matcha đá xay",      cat: "Trà",     price: 40000 },
  { id: 18, name: "Trà đào cam xả",     cat: "Trà",     price: 35000 },
  { id: 19, name: "Trà xoài",           cat: "Trà",     price: 30000 },
  { id: 20, name: "Trà chanh",          cat: "Trà",     price: 25000 },
  // mới thêm
  { id: 21, name: "Trà ổi hồng", cat: "Trà", price: 39000 },
  { id: 22, name: "Trà dâu tằm", cat: "Trà", price: 39000 },
  { id: 23, name: "Trà oolong sữa", cat: "Trà", price: 35000 },
  { id: 24, name: "Trà hoa cúc mật ong", cat: "Trà", price: 32000 },
  { id: 25, name: "Trà gừng mật ong", cat: "Trà", price: 30000 },
  { id: 26, name: "Trà nhiệt đới", cat: "Trà", price: 42000 },

  // ===== Sinh tố =====
  { id: 27, name: "Sinh tố bơ",         cat: "Sinh tố", price: 45000, img: "images/sinh-to-bo.jpg" },
  { id: 28, name: "Sinh tố xoài",       cat: "Sinh tố", price: 42000, img: "images/sinh-to-xoai.jpg" },
  { id: 29, name: "Sinh tố mãng cầu",   cat: "Sinh tố", price: 45000 },
  { id: 30, name: "Sinh tố chuối",      cat: "Sinh tố", price: 35000 },
  { id: 31, name: "Sinh tố bơ xoài",    cat: "Sinh tố", price: 50000 },
  { id: 32, name: "Sinh tố dâu chuối",  cat: "Sinh tố", price: 45000 },
  { id: 33, name: "Sinh tố đu đủ",      cat: "Sinh tố", price: 45000 },
  // mới thêm
  { id: 34, name: "Sinh tố dâu", cat: "Sinh tố", price: 42000 },
  { id: 35, name: "Sinh tố sapoche", cat: "Sinh tố", price: 42000 },
  { id: 36, name: "Sinh tố dưa hấu", cat: "Sinh tố", price: 35000 },
  { id: 37, name: "Sinh tố kiwi", cat: "Sinh tố", price: 45000 },
  { id: 38, name: "Sinh tố cam", cat: "Sinh tố", price: 40000 },
  { id: 39, name: "Sinh tố dứa", cat: "Sinh tố", price: 38000 },

  // ===== Bánh =====
  { id: 40, name: "Bánh tiramisu",      cat: "Bánh",    price: 35000, img: "images/banh-tiramisu.jpg" },
  { id: 41, name: "Bánh croissant",     cat: "Bánh",    price: 30000, img: "images/banh-croissant.jpg" },
  { id: 42, name: "Bánh cookie",        cat: "Bánh",    price: 20000, img: "images/banh-cookie.jpg" },
  // mới thêm
  { id: 43, name: "Bông lan trứng muối", cat: "Bánh",   price: 35000 },
  { id: 44, name: "Bánh flan",          cat: "Bánh",    price: 20000 },
  { id: 45, name: "Bánh su kem",        cat: "Bánh",    price: 25000 },
  { id: 46, name: "Red velvet",         cat: "Bánh",    price: 40000 },
  { id: 47, name: "Cheesecake",         cat: "Bánh",    price: 42000 },
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
