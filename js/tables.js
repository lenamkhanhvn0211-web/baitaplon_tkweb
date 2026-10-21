const TABLE_COUNT = 12;

const POS = {
  1: [19.1, 19.3],
  2: [28.3, 19.4],
  3: [43.0, 22.9],
  4: [45.0, 52.7],
  5: [55.8, 22.7],
  6: [73.1, 80],
  7: [24.9, 81.9],
  8: [34.9, 82.8],
  9: [45.4, 83.1],
  10: [57.9, 81.9],
  11: [74.8, 34.5],
  12: [87.7, 72.5],
};

const KIND_TITLE = {
  table: "Tại bàn",
  takeaway: "Mang đi",
  home: "Giao về nhà",
};
const WHEN_LABEL = {
  table: "Giờ khách đến",
  takeaway: "Giờ lấy món",
  home: "Giờ giao hàng",
};

const $ = (id) => document.getElementById(id);

function createDefaultTables() {
  return Array.from({ length: TABLE_COUNT }, (_, i) => ({
    id: i + 1,
    seats: i % 3 === 0 ? 2 : 4,
    busy: false,
  }));
}

let tables = load("tables", createDefaultTables());
let bookings = load("bookings", {});
let times = load("tableTimes", {});

const role = (currentUser() || {}).role;
const isStaff = role === "admin" || role === "staff";

const statusOf = (t) =>
  t.busy === "booked" ? "booked" : t.busy === true ? "busy" : "free";
const STATUS_TEXT = {
  free: "Trống",
  busy: "Đang phục vụ",
  booked: "Đã đặt trước",
};
const fmtDate = (d) => d.split("-").reverse().join("/");
const saveAll = () => {
  save("tables", tables);
  save("bookings", bookings);
  save("tableTimes", times);
};

function setState(t, state) {
  if (t.busy === state) return;
  t.busy = state;
  times[t.id] = Date.now();
  if (state !== "booked") delete bookings[t.id];
}

function fmtElapsed(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n) => String(n).padStart(2, "0");
  const h = Math.floor(s / 3600);
  return (h ? h + ":" : "") + p(Math.floor((s % 3600) / 60)) + ":" + p(s % 60);
}

function tick() {
  document.querySelectorAll("[data-since]").forEach((el) => {
    el.textContent = "⏱ " + fmtElapsed(Date.now() - Number(el.dataset.since));
  });
}
setInterval(tick, 1000);

function renderTables() {
  $("tables").innerHTML = tables
    .filter((t) => POS[t.id])
    .map((t) => {
      const st = statusOf(t);
      const bk = bookings[t.id];
      const text =
        st === "booked" && bk
          ? "Đặt " + bk.time
          : st === "busy" && times[t.id]
            ? `<span class="timer" data-since="${times[t.id]}"></span>`
            : STATUS_TEXT[st];
      const [x, y] = POS[t.id];
      return `<button class="hot ${st}" style="left:${x}%;top:${y}%" data-id="${t.id}" aria-label="Bàn ${t.id}, ${t.seats} chỗ, ${STATUS_TEXT[st]}">
        <strong>Bàn ${t.id}</strong><small>${t.seats} chỗ · ${text}</small></button>`;
    })
    .join("");

  const busy = tables.filter((t) => t.busy === true).length;
  const booked = tables.filter((t) => t.busy === "booked").length;
  $("stat").textContent =
    `Đang phục vụ: ${busy} | Đã đặt trước: ${booked} | Trống: ${tables.length - busy - booked}`;
  tick();
}

// ---------- Hộp đặt lịch ----------
const dlg = $("book");
let ui = { mode: "table", id: null };
let f = {}; // dữ liệu đang nhập

function resetForm() {
  const d = new Date(Date.now() + 30 * 60000);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
  const pad = (n) => String(n).padStart(2, "0");
  f = {
    name: "",
    phone: "",
    address: "",
    note: "",
    guests: 2,
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function openBook(mode, id = null) {
  ui = { mode, id };
  resetForm();
  drawBook();
  dlg.showModal();
}

const field = (label, key, type = "text", extra = "") =>
  `<div class="field"><label for="bk-${key}">${label}</label>
   <input id="bk-${key}" data-f="${key}" type="${type}" value="${escapeHtml(f[key])}" ${extra}></div>`;

function drawBook() {
  const t = ui.mode === "table" ? tables.find((x) => x.id == ui.id) : null;
  const st = t ? statusOf(t) : "free";
  const bk = t ? bookings[t.id] : null;
  $("book-title").textContent = t
    ? `Bàn ${t.id} (${t.seats} chỗ)`
    : "Đặt lịch " + KIND_TITLE[ui.mode].toLowerCase();

  let html = `<div class="seg">${Object.entries(KIND_TITLE)
    .map(
      ([k, v]) =>
        `<button type="button" data-mode="${k}" class="${k === ui.mode ? "on" : ""}">${v}</button>`,
    )
    .join("")}</div>`;

  if (ui.mode === "table") {
    html += `<div class="field"><label for="bk-table">Chọn bàn</label><select id="bk-table">
      <option value="">-- Chọn bàn --</option>${tables
        .map(
          (x) =>
            `<option value="${x.id}" ${x.id == ui.id ? "selected" : ""}>Bàn ${x.id} (${x.seats} chỗ) - ${STATUS_TEXT[statusOf(x)]}</option>`,
        )
        .join("")}</select></div>`;
  }

  if (t && isStaff) {
    html += `<div class="field"><label>Trạng thái bàn (thủ công)</label><div class="seg">${[
      ["free", "Trống"],
      ["busy", "Đang phục vụ"],
      ["booked", "Đã đặt bàn"],
    ]
      .map(
        ([k, v]) =>
          `<button type="button" data-set="${k}" class="${k === st ? "on" : ""}">${v}</button>`,
      )
      .join("")}</div></div>`;
  }

  if (ui.mode === "table" && !t) {
    html += '<p class="book-note">Chọn bàn để tiếp tục.</p>';
  } else if (st === "booked") {
    html += `<div class="info-card booked"><strong>Bàn đã được đặt trước</strong><dl>
      ${isStaff ? `<dt>Khách</dt><dd>${escapeHtml(bk?.name || "-")} - ${escapeHtml(bk?.phone || "-")}</dd>` : ""}
      <dt>Lúc</dt><dd>${bk ? bk.time + " " + fmtDate(bk.date) : "-"}</dd>
      <dt>Số khách</dt><dd>${bk?.guests || "-"}</dd>
      ${isStaff ? `<dt>Ghi chú</dt><dd>${escapeHtml(bk?.note || "-")}</dd>` : ""}</dl></div>
      <div class="book-actions">
        <button class="btn accent" data-act="pay">Khách đến: gọi món & thanh toán</button>
        ${isStaff ? '<button class="btn ghost" data-act="open">Khách đến (chỉ mở bàn)</button><button class="btn danger" data-act="free">Hủy đặt bàn</button>' : ""}</div>`;
  } else if (st === "busy") {
    html += `<div class="info-card busy"><strong>Bàn đang phục vụ</strong>${
      times[t.id]
        ? `<dl><dt>Bắt đầu</dt><dd>${new Date(times[t.id]).toLocaleString("vi-VN")}</dd>
           <dt>Đã phục vụ</dt><dd class="live" data-since="${times[t.id]}"></dd></dl>`
        : ""
    }</div>
      <div class="book-actions">
        <button class="btn accent" data-act="pay">Gọi món & thanh toán</button>
        ${isStaff ? '<button class="btn danger" data-act="free">Trả bàn (trống)</button>' : ""}</div>`;
  } else {
    html += `${field("Họ tên khách", "name", "text", 'autocomplete="name"')}
      ${field("Số điện thoại", "phone", "tel", 'autocomplete="tel" inputmode="numeric"')}
      <div class="row2">
        ${field("Ngày", "date", "date", 'min="' + f.date + '"')}
        ${field(WHEN_LABEL[ui.mode], "time", "time")}
      </div>
      ${ui.mode === "table" ? field("Số khách (tối đa " + t.seats + ")", "guests", "number", `min="1" max="${t.seats}"`) : ""}
      ${ui.mode === "home" ? field("Địa chỉ giao hàng", "address", "text", 'autocomplete="street-address"') : ""}
      <div class="field"><label for="bk-note">Ghi chú</label>
        <textarea id="bk-note" data-f="note" rows="2">${escapeHtml(f.note)}</textarea></div>
      <span class="error" id="bk-err"></span>
      <div class="book-actions">
        ${ui.mode === "table" ? '<button class="btn" data-act="book">Đặt bàn trước</button>' : ""}
        <button class="btn accent" data-act="pay">Gọi món & thanh toán</button></div>
      <p class="book-note">${
        ui.mode === "table"
          ? "“Đặt bàn trước” giữ bàn (màu cam). “Gọi món & thanh toán” mở bàn và chuyển thông tin sang trang Thanh toán; thanh toán xong bàn tự trống."
          : "Thông tin được chuyển sang trang Thanh toán (hình thức " +
            KIND_TITLE[ui.mode].toLowerCase() +
            ")."
      }</p>`;
  }
  $("book-body").innerHTML = html;
  tick();
}

function validate(strict) {
  const t = tables.find((x) => x.id == ui.id);
  if (ui.mode === "table" && !t) return "Hãy chọn bàn.";
  if (strict && f.name.trim().length < 2)
    return "Nhập họ tên (ít nhất 2 ký tự).";
  if ((strict || f.phone) && !/^0\d{9}$/.test(f.phone.trim()))
    return "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.";
  if (strict && (!f.date || !f.time)) return "Chọn ngày và giờ.";
  if (ui.mode === "table" && strict && !(f.guests >= 1 && f.guests <= t.seats))
    return `Số khách từ 1 đến ${t.seats}.`;
  if (ui.mode === "home" && f.address.trim().length < 5)
    return "Nhập địa chỉ giao hàng (ít nhất 5 ký tự).";
  return "";
}

function showErr(msg) {
  const el = $("bk-err");
  if (el) el.textContent = msg;
}

function goPay() {
  const err = validate(false);
  if (err) return showErr(err);

  let info = {
    name: f.name.trim(),
    phone: f.phone.trim(),
    address: f.address.trim(),
    note: f.note.trim(),
    when: f.date && f.time ? `${f.time} ${fmtDate(f.date)}` : "",
  };

  if (ui.mode === "table") {
    const t = tables.find((x) => x.id == ui.id);
    const bk = bookings[t.id];
    if (bk)
      info = {
        ...info,
        name: bk.name,
        phone: bk.phone,
        note: bk.note || "",
        when: `${bk.time} ${fmtDate(bk.date)}`,
      };
    setState(t, true);
    saveAll();
  }

  save("checkoutDraft", {
    kind: ui.mode,
    table: ui.mode === "table" ? Number(ui.id) : undefined,
    ...info,
  });

  location.href = getCart().length ? "payment.html" : "index.html";
}

dlg.addEventListener("click", (e) => {
  const mode = e.target.closest("[data-mode]");
  if (mode) {
    ui.mode = mode.dataset.mode;
    drawBook();
    return;
  }

  const t = tables.find((x) => x.id == ui.id);

  const set = e.target.closest("[data-set]");
  if (set) {
    if (!isStaff || !t) return;
    setState(t, { free: false, busy: true, booked: "booked" }[set.dataset.set]);
    saveAll();
    renderTables();
    drawBook();
    return;
  }

  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  if (!isStaff && (btn.dataset.act === "open" || btn.dataset.act === "free"))
    return;

  switch (btn.dataset.act) {
    case "close":
      dlg.close();
      break;
    case "book": {
      const err = validate(true);
      if (err) return showErr(err);
      bookings[t.id] = {
        name: f.name.trim(),
        phone: f.phone.trim(),
        date: f.date,
        time: f.time,
        guests: Number(f.guests),
        note: f.note.trim(),
      };
      setState(t, "booked");
      saveAll();
      renderTables();
      dlg.close();
      break;
    }
    case "open":
      setState(t, true);
      saveAll();
      renderTables();
      dlg.close();
      break;
    case "free":
      setState(t, false);
      saveAll();
      renderTables();
      dlg.close();
      break;
    case "pay":
      goPay();
      break;
  }
});

// Gõ vào ô nào thì lưu vào `f` (không vẽ lại để không mất con trỏ)
dlg.addEventListener("input", (e) => {
  if (e.target.id === "bk-table") {
    ui.id = Number(e.target.value) || null;
    drawBook();
  } else if (e.target.dataset.f) {
    f[e.target.dataset.f] = e.target.value;
  }
});

// Bấm ra ngoài hộp thì đóng
dlg.addEventListener("mousedown", (e) => {
  if (e.target === dlg) dlg.close();
});

$("tables").addEventListener("click", (e) => {
  const b = e.target.closest("[data-id]");
  if (b) openBook("table", Number(b.dataset.id));
});
$("new-takeaway").addEventListener("click", () => openBook("takeaway"));
$("new-home").addEventListener("click", () => openBook("home"));

$("reset").addEventListener("click", () => {
  tables.forEach((t) => (t.busy = false));
  bookings = {};
  times = {};
  saveAll();
  renderTables();
});

renderTables();

if (!isStaff) $("reset").style.display = "none";

window.addEventListener("storage", (e) => {
  if (!["tables", "bookings", "tableTimes"].includes(e.key)) return;
  tables = load("tables", tables);
  bookings = load("bookings", {});
  times = load("tableTimes", {});
  renderTables();
  if (dlg.open) drawBook();
});
