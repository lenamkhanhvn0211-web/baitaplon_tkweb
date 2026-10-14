/* ==========================================================
   TRANG GỌI MÓN: xem giỏ hàng, chọn size / % đá / % đường
   cho TỪNG DÒNG, tăng / giảm / xóa món
   Cạnh ô % đá có hình cốc đá, cạnh ô % đường có hình hũ đường,
   kèm 2 mũi tên tăng / giảm và animation mỗi lần chỉnh.
   (SIZES, LEVELS, getCart, saveCart... nằm trong common.js)
   ========================================================== */

const box = document.getElementById("cart-box");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Mức đá / đường đã hiển thị gần nhất của từng dòng,
// để sau khi vẽ lại bảng biết đang tăng hay giảm mà chạy animation
const shown = new Map();

// Mũi tên vừa bấm, để trả focus lại (bàn phím) sau khi vẽ lại bảng
let pendingFocus = null;

// ---------- Hình cốc đá / hũ đường ----------

// 6 viên đá xếp 3 hàng từ đáy cốc lên
const ICE_CUBES = [
  [10, 26], [17.5, 26],
  [9.5, 18.5], [17, 18.5],
  [12, 11.5], [18.5, 11.5],
];

const ARROW_UP = '<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>';
const ARROW_DOWN = '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';

// Số viên đá hiển thị (0..6) theo % đá
function iceCount(level, max) {
  if (level <= 0 || max <= 0) return 0;
  return Math.max(1, Math.round((level / max) * ICE_CUBES.length));
}

// Độ cao đống đường (0..1) theo % đường
function sugarHeight(level, max) {
  if (level <= 0 || max <= 0) return 0;
  return Math.max(0.2, level / max);
}

// Cốc đá, có sẵn `count` viên đá
function iceSvg(count) {
  const cubes = ICE_CUBES.map(
    ([x, y], i) =>
      `<g class="ice-cube${i < count ? " is-on" : ""}">` +
      `<rect x="${x}" y="${y}" width="7" height="7" rx="1.6"/>` +
      `<path d="M${x + 1.6} ${y + 2.6} l2.2 -1.1"/></g>`
  ).join("");
  return (
    '<svg viewBox="0 0 34 38" aria-hidden="true">' +
    '<path class="ice-glass" d="M6 8 H28 L25 35 H9 Z"/>' +
    '<path class="ice-liquid" d="M7.4 11 H26.6 L24.2 33.8 H9.8 Z"/>' +
    '<path class="ice-straw" d="M23 2 L18.5 30"/>' +
    cubes +
    '<ellipse class="ice-ripple" cx="17" cy="11" rx="8" ry="1.6"/>' +
    "</svg>"
  );
}

// Hũ đường, đống đường cao `lv` (0..1)
function sugarSvg(lv) {
  const grains = [12, 17, 22, 15, 20]
    .map((x) => `<circle class="sg-grain" cx="${x}" cy="13" r="1.3"/>`)
    .join("");
  return (
    '<svg viewBox="0 0 34 38" aria-hidden="true">' +
    `<g class="sg-pile" style="--lv:${lv}">` +
    '<path d="M8 22 C9 14 13 9 17 9 C21 9 25 14 26 22 Z"/>' +
    '<circle cx="14" cy="17" r="1"/><circle cx="19" cy="14" r="1"/>' +
    '<circle cx="21" cy="19" r="1"/><circle cx="16" cy="20" r="0.9"/>' +
    "</g>" +
    '<path class="sg-bowl" d="M5 22 H29 C29 31 24 36 17 36 C10 36 5 31 5 22 Z"/>' +
    `<g class="sg-grains">${grains}</g>` +
    "</svg>"
  );
}

// Vị trí của mức hiện tại trong LEVELS (không khớp thì lấy mức gần nhất)
function levelIndex(current) {
  const cur = Number(current);
  let idx = LEVELS.indexOf(cur);
  if (idx < 0) {
    idx = LEVELS.reduce(
      (best, l, i) => (Math.abs(l - cur) < Math.abs(LEVELS[best] - cur) ? i : best),
      0
    );
  }
  return idx;
}

// Hình + 2 mũi tên cạnh ô chọn. Hình được vẽ ở mức CŨ,
// animation (playAnimations) sẽ chạy sang mức MỚI sau khi bảng vẽ xong
function stepper(field, uid, current, dishName) {
  const isIce = field === "ice";
  const name = isIce ? "đá" : "đường";
  const key = field + ":" + uid;
  const max = Math.max(...LEVELS);
  const cur = Number(current);
  const prev = shown.has(key) ? shown.get(key) : cur;
  shown.set(key, cur);

  const from = isIce ? iceCount(prev, max) : sugarHeight(prev, max);
  const to = isIce ? iceCount(cur, max) : sugarHeight(cur, max);
  const start = reduceMotion ? to : from;
  const animate = !reduceMotion && prev !== cur;
  const idx = levelIndex(cur);

  const arrow = (dir, disabled) =>
    `<button type="button" class="opt-arrow" data-act="${dir}" data-field="${field}" data-uid="${uid}" ` +
    `aria-label="${dir === "up" ? "Tăng" : "Giảm"} ${name} ${dishName}"${disabled ? " disabled" : ""}>` +
    `${dir === "up" ? ARROW_UP : ARROW_DOWN}</button>`;

  return (
    '<span class="opt-stepper">' +
    `<span class="opt-icon" data-field="${field}" data-from="${from}" data-to="${to}"` +
    `${animate ? ' data-animate="1"' : ""} title="${name}: ${cur}%">` +
    `${isIce ? iceSvg(start) : sugarSvg(start)}</span>` +
    '<span class="opt-arrows">' +
    arrow("up", idx >= LEVELS.length - 1) +
    arrow("down", idx <= 0) +
    "</span></span>"
  );
}

// ---------- Animation ----------

function later(fn, ms) {
  setTimeout(fn, ms);
}

// Thêm đá: viên mới rơi xuống lần lượt. Bớt đá: viên trên cùng tan trước
function animateIce(icon, from, to) {
  const cubes = icon.querySelectorAll(".ice-cube");

  if (to > from) {
    for (let i = from; i < to; i++) {
      const c = cubes[i];
      const delay = (i - from) * 90;
      c.classList.add("is-on", "dropping");
      c.style.animationDelay = delay + "ms";
      later(() => {
        c.classList.remove("dropping");
        c.style.animationDelay = "";
      }, 700 + delay);
    }
  } else if (to < from) {
    for (let i = from - 1, n = 0; i >= to; i--, n++) {
      const c = cubes[i];
      const delay = n * 90;
      c.classList.add("melting");
      c.style.animationDelay = delay + "ms";
      later(() => {
        c.classList.remove("is-on", "melting");
        c.style.animationDelay = "";
      }, 700 + delay);
    }
  }

  // Gợn sóng trên mặt nước
  const ripple = icon.querySelector(".ice-ripple");
  ripple.classList.add("go");
  later(() => ripple.classList.remove("go"), 700);
}

// Thêm đường: hạt đường rơi vào, đống đường dâng lên. Bớt đường: hạt bay đi, đống xẹp xuống
function animateSugar(icon, from, to) {
  const pile = icon.querySelector(".sg-pile");
  const grains = icon.querySelector(".sg-grains");
  const cls = to > from ? "falling" : "blowing";

  void pile.getBoundingClientRect(); // chốt mức cũ rồi mới đổi để có hiệu ứng chuyển
  pile.style.setProperty("--lv", to);

  grains.classList.add(cls);
  later(() => grains.classList.remove(cls), 900);
}

// Cả hình nảy / lắc nhẹ mỗi lần bấm
function bump(icon, field) {
  const cls = field === "sugar" ? "bump-sugar" : "bump";
  icon.classList.remove("bump", "bump-sugar");
  void icon.offsetWidth; // khởi động lại animation
  icon.classList.add(cls);
  later(() => icon.classList.remove(cls), 600);
}

// Chạy animation cho các hình vừa đổi mức, rồi trả focus cho mũi tên vừa bấm
function afterRender() {
  box.querySelectorAll(".opt-icon[data-animate]").forEach((icon) => {
    const { field } = icon.dataset;
    const from = Number(icon.dataset.from);
    const to = Number(icon.dataset.to);
    if (field === "ice") animateIce(icon, from, to);
    else animateSugar(icon, from, to);
    bump(icon, field);
  });

  if (pendingFocus) {
    const { uid, field, act } = pendingFocus;
    pendingFocus = null;
    const arrows = Array.from(box.querySelectorAll(".opt-arrow")).filter(
      (b) => b.dataset.uid === uid && b.dataset.field === field
    );
    // Mũi tên vừa bấm bị mờ (đã tới mức cuối) thì focus mũi tên còn lại
    const target = arrows.find((b) => b.dataset.act === act && !b.disabled) || arrows.find((b) => !b.disabled);
    if (target) target.focus({ preventScroll: true });
  }
}

// ---------- Hiển thị ----------

// Ô chọn % đá hoặc % đường, kèm hình + mũi tên chỉnh
function levelSelect(field, uid, current, label, dishName) {
  return (
    `<select class="opt-sel" data-field="${field}" data-uid="${uid}" aria-label="${label}">` +
    LEVELS.map((l) => `<option value="${l}" ${l === Number(current) ? "selected" : ""}>${l}%</option>`).join("") +
    "</select>" +
    stepper(field, uid, current, dishName)
  );
}

// Tạo 1 dòng trong bảng giỏ hàng
function cartRow(line) {
  const item = MENU.find((m) => m.id == line.id);
  if (!item) return { amount: 0, html: "" };

  const drink = hasOptions(item);
  const size = SIZES[line.size] ? line.size : "M";
  const unit = lineUnit(line);

  const sizeCell = drink
    ? `<select class="opt-sel" data-field="size" data-uid="${line.uid}" aria-label="Chọn size ${item.name}">` +
      Object.entries(SIZES)
        .map(([k, v]) => `<option value="${k}" ${k === size ? "selected" : ""}>${v.label}${fmtAdd(v.add)}</option>`)
        .join("") +
      "</select>"
    : "-";

  const iceCell = drink ? levelSelect("ice", line.uid, line.ice, "Chọn % đá " + item.name, item.name) : "-";
  const sugarCell = drink ? levelSelect("sugar", line.uid, line.sugar, "Chọn % đường " + item.name, item.name) : "-";

  return {
    amount: unit * line.qty,
    html: `
    <tr>
      <td>${item.name}</td>
      <td>${sizeCell}</td>
      <td${drink ? ' class="has-stepper"' : ""}>${iceCell}</td>
      <td${drink ? ' class="has-stepper"' : ""}>${sugarCell}</td>
      <td>${fmt(unit)}</td>
      <td>
        <span class="qty">
          <button data-act="dec" data-uid="${line.uid}" aria-label="Giảm">-</button>
          ${line.qty}
          <button data-act="inc" data-uid="${line.uid}" aria-label="Tăng">+</button>
        </span>
      </td>
      <td>${fmt(unit * line.qty)}</td>
      <td><button class="btn ghost" data-act="del" data-uid="${line.uid}">Xóa</button></td>
    </tr>`,
  };
}

function renderCart() {
  const cart = getCart();

  // Giỏ hàng trống
  if (!cart.length) {
    box.innerHTML =
      '<p class="empty">Giỏ hàng trống. <a href="index.html">Chọn món ở trang Thực đơn</a>.</p>';
    updateBadge();
    return;
  }

  const rows = cart.map(cartRow);
  const sum = rows.reduce((s, r) => s + r.amount, 0);

  box.innerHTML = `
    <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Món</th>
          <th>Size</th>
          <th>Đá</th>
          <th>Đường</th>
          <th>Đơn giá</th>
          <th>Số lượng</th>
          <th>Thành tiền</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows.map((r) => r.html).join("")}</tbody>
    </table>
    </div>

    <div class="total">
      <span>Tổng cộng</span>
      <span>${fmt(sum)}</span>
    </div>

    <p style="margin-top:16px">
      <a class="btn" href="payment.html" style="text-decoration:none;display:inline-block">Đến thanh toán</a>
    </p>`;

  updateBadge();
  afterRender();
}

// ---------- Sự kiện ----------

// Bấm các nút +, -, Xóa, mũi tên đá / đường: chỉ tác động lên đúng dòng đó
box.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn || btn.disabled) return;

  const { act, uid, field } = btn.dataset;

  let cart = getCart();
  const line = cart.find((l) => l.uid === uid);
  if (!line) return;

  if (act === "inc") {
    line.qty++;
  } else if (act === "dec") {
    line.qty--; // giảm về 0 thì bỏ dòng
  } else if (act === "del") {
    line.qty = 0;
  } else if (act === "up" || act === "down") {
    // Mũi tên: nhảy sang mức kế tiếp / liền trước trong LEVELS
    const next = levelIndex(line[field]) + (act === "up" ? 1 : -1);
    if (next < 0 || next >= LEVELS.length) return;
    line[field] = LEVELS[next];
    pendingFocus = { uid, field, act };
  } else {
    return;
  }

  cart = cart.filter((l) => l.qty > 0);
  saveCart(cart);
  renderCart();
});

// Chọn size / % đá / % đường của từng dòng
box.addEventListener("change", (e) => {
  const sel = e.target.closest("select[data-field]");
  if (!sel) return;

  const cart = getCart();
  const line = cart.find((l) => l.uid === sel.dataset.uid);
  if (!line) return;

  const { field } = sel.dataset;
  line[field] = field === "size" ? sel.value : Number(sel.value);

  saveCart(cart);
  renderCart();
});

// ---------- Khởi chạy ----------
renderCart();