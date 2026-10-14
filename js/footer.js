/* ==========================================================
   CHÂN TRANG: giới thiệu, thực đơn, liên hệ, mạng xã hội
   Chỉ cần thêm css/footer.css và js/footer.js vào trang nào
   muốn hiện chân trang.
   ========================================================== */

// ĐỔI CÁC THÔNG TIN NÀY CHO ĐÚNG VỚI QUÁN
const SHOP_INFO = {
  name: "Cà Phê Web",
  slogan: "Một góc nhỏ để ngồi xuống, uống ly cà phê ngon và trò chuyện thật lâu.",
  address: "Số 3 phố Cầu Giấy, Phường Láng, Quận Đống Đa, TP. Hà Nội",
  hours: "Mỗi ngày 7:00 - 22:00",
  phone: "0900000000",
  email: "capheweb@gmail.com",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  youtube: "https://youtube.com",
  tiktok: "https://tiktok.com",
};

(function () {
  const year = new Date().getFullYear();
  const s = SHOP_INFO;

  // Danh mục lấy từ MENU để tự cập nhật khi thêm danh mục mới
  const cats = [...new Set(MENU.map((m) => m.cat))];
  const catLinks = cats
    .map((c) => `<li><a href="index.html">${c}</a></li>`)
    .join("");

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <strong>${s.name}</strong>
        <p>${s.slogan}</p>
      </div>

      <div>
        <h3>Về quán</h3>
        <ul>
          <li><a href="index.html">Thực đơn</a></li>
          <li><a href="order.html">Gọi món</a></li>
          <li><a href="payment.html">Thanh toán</a></li>
          <li><a href="login.html">Tài khoản</a></li>
        </ul>
      </div>

      <div>
        <h3>Thực đơn</h3>
        <ul>${catLinks}</ul>
      </div>

      <div>
        <h3>Liên hệ</h3>
        <ul class="footer-contact">
          <li>${s.address}</li>
          <li>${s.hours}<small>Mở cửa cả cuối tuần và ngày lễ</small></li>
          <li><a href="tel:${s.phone}">${s.phone}</a></li>
          <li><a href="mailto:${s.email}">${s.email}</a></li>
        </ul>
      </div>

      <div>
        <h3>Theo dõi chúng tôi</h3>
        <div class="footer-social">
          <a href="${s.facebook}" target="_blank" rel="noopener" aria-label="Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path class="solid" d="M14 8h2V5h-2.5A3.5 3.5 0 0 0 10 8.5V11H8v3h2v6h3v-6h2.5l.5-3h-3V8.5c0-.3.2-.5.5-.5Z"/></svg>
          </a>
          <a href="${s.instagram}" target="_blank" rel="noopener" aria-label="Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="solid" cx="17" cy="7" r="1.1"/></svg>
          </a>
          <a href="${s.youtube}" target="_blank" rel="noopener" aria-label="YouTube">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path class="solid" d="M10 9.5v5l4.5-2.5-4.5-2.5Z"/></svg>
          </a>
          <a href="${s.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 3.5v10.2a3.8 3.8 0 1 1-3.8-3.8"/><path d="M14.5 3.5c.4 2.4 1.9 4 4.5 4.2"/></svg>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© ${year} ${s.name}. Đã đăng ký bản quyền.</span>
      <span>Giá đã bao gồm VAT. Giao hàng nội thành, phí cố định 5.000đ.</span>
    </div>`;

  document.body.appendChild(footer);
})();