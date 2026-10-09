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

const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

const load = (key, defaultValue) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

const save = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getCart = () => load("cart", {});

const cartCount = () => {
  return Object.values(getCart()).reduce((sum, qty) => sum + qty, 0);
};

const cartTotal = () => {
  return Object.entries(getCart()).reduce((sum, [id, qty]) => {
    const item = MENU.find((m) => m.id == id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
};

function addToCart(id) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + 1;
  save("cart", cart);
  updateBadge();
}

function updateBadge() {
  const badge = document.getElementById("cart-badge");
  if (badge) badge.textContent = cartCount();
}

function renderHeader() {
  const pages = [
    ["index.html",   "Thực đơn"],
    ["order.html",   "Gọi món"],
    ["payment.html", "Thanh toán"],
    ["tables.html",  "Quản lý bàn"],
  ];

  const currentPage = location.pathname.split("/").pop() || "index.html";

  let navLinks = pages
    .map(([href, title]) => {
      const activeClass = href === currentPage ? "active" : "";
      const badge =
        href === "order.html"
          ? ' <span class="badge" id="cart-badge">0</span>'
          : "";
      return `<a href="${href}" class="${activeClass}">${title}${badge}</a>`;
    })
    .join("");

  const currentUser = load("currentUser", null);

  if (currentUser && currentUser.isLoggedIn) {
    const isAdmin = currentUser.role === "admin";
    
    navLinks += `
      <div class="user-box ${isAdmin ? 'admin-box' : ''}">
        <i class="fas ${isAdmin ? 'fa-user-shield' : 'fa-user-circle'} user-icon"></i>
        <span class="user-greeting">
          ${isAdmin ? '<span class="admin-badge">ADMIN</span>' : ''}
          Xin chào, <strong>${currentUser.username}</strong>
        </span>
        <a href="#" id="btn-logout" class="btn-logout"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
      </div>
    `;
  } else {
    const activeClass = currentPage === "login.html" ? "active" : "";
    navLinks += `<a href="login.html" class="btn-login-nav ${activeClass}">Đăng nhập</a>`;
  }

  const headerElem = document.getElementById("site-header");
  if (headerElem) {
    headerElem.innerHTML =
      '<a class="brand" href="index.html">Cà phê web</a>' +
      `<nav>${navLinks}</nav>`;
  }

  updateBadge();
}

document.addEventListener("click", function (e) {
  if (e.target && (e.target.id === "btn-logout" || e.target.closest("#btn-logout"))) {
    e.preventDefault();
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }
});

document.addEventListener("DOMContentLoaded", renderHeader);
