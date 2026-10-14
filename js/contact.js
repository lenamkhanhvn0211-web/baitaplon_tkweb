/* ==========================================================
   NÚT LIÊN HỆ NỔI: Messenger + Gọi điện
   Chỉ cần thêm css/contact.css và js/contact.js vào trang nào
   muốn hiện hai nút này.
   ========================================================== */

// ĐỔI HAI DÒNG NÀY CHO ĐÚNG THÔNG TIN QUÁN
const MESSENGER_URL = "https://m.me/TEN_FANPAGE_CUA_QUAN"; // m.me/ + username hoặc ID của fanpage
const PHONE_NUMBER = "0900000000";                          // số điện thoại quán

(function () {
  const box = document.createElement("div");
  box.className = "contact-fab";
  box.innerHTML = `
    <a class="fab-messenger" href="${MESSENGER_URL}" target="_blank" rel="noopener"
       data-label="Nhắn tin Messenger" aria-label="Nhắn tin qua Messenger">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.43 3.14 7.17.16.14.26.35.27.57l.05 1.78c.02.57.6.94 1.12.71l1.98-.87c.17-.07.35-.09.52-.05.91.25 1.87.38 2.92.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2Zm6 7.46-2.94 4.66a1.5 1.5 0 0 1-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.94-4.66a1.5 1.5 0 0 1 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63Z"/>
      </svg>
    </a>
    <a class="fab-phone" href="tel:${PHONE_NUMBER}"
       data-label="Gọi ${PHONE_NUMBER}" aria-label="Gọi điện cho quán">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"/>
      </svg>
    </a>`;
  document.body.appendChild(box);
})();
