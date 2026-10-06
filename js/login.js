/* ==========================================================
   TRANG ĐĂNG NHẬP
   ========================================================== */

// Tài khoản thử (chỉ dùng demo, không an toàn cho thực tế)
const ACCOUNTS = {
  admin: "123456",
  nhanvien: "cafe2026",
};

const MIN_PASSWORD_LENGTH = 6;

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value;

  // Kiểm tra dữ liệu nhập
  const userValid = username !== "";
  const passValid = password.length >= MIN_PASSWORD_LENGTH;

  document.getElementById("e-user").textContent = userValid
    ? ""
    : "Nhập tên đăng nhập.";
  document.getElementById("e-pass").textContent = passValid
    ? ""
    : `Mật khẩu có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;

  if (!userValid || !passValid) return;

  // Kiểm tra tài khoản
  if (ACCOUNTS[username] === password) {
    save("user", username);
    location.href = "tables.html";
  } else {
    document.getElementById("e-login").textContent =
      "Sai tên đăng nhập hoặc mật khẩu.";
  }
});
