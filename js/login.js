$(document).ready(function() {
    $('#username, #password, #email, #confirm-password').val('');
    $(document).on('click', '#eye, .eye', function() {
        $(this).toggleClass('open');
        $(this).children('i').toggleClass('fa-eye-slash fa-eye');
        var input = $(this).siblings('input');
        if ($(this).hasClass('open')) {
            input.attr('type', 'text');
        } else {
            input.attr('type', 'password');
        }
    });
    $('#form-login').submit(function(e) {
        e.preventDefault();
        var isRegisterPage = $('#email').length > 0;
        if (isRegisterPage) {
            var rawUsername = $('#username').val().trim();
            var username = rawUsername.toLowerCase();
            var email = $('#email').val().trim();
            var password = $('#password').val();
            var confirmPassword = $('#confirm-password').val();
            if (rawUsername === '' || email === '' || password === '' || confirmPassword === '') {
                alert('Vui lòng điền đầy đủ tất cả thông tin!');
                return;
            }
            if (password !== confirmPassword) {
                alert('Mật khẩu xác nhận không trùng khớp!');
                return;
            }
            var userAccount = {
                username: rawUsername,
                email: email,
                password: password
            };
            localStorage.setItem('user_' + username, JSON.stringify(userAccount));
            alert('Đăng ký tài khoản thành công! Hãy đăng nhập ngay.');
            window.location.href = 'login.html';
        } else {
            var rawUsername = $('#username').val().trim();
            var username = rawUsername.toLowerCase();
            var password = $('#password').val();
            if (rawUsername === '' || password === '') {
                alert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
                return;
            }
            var savedData = localStorage.getItem('user_' + username);
            if (!savedData) {
                alert('Tài khoản "' + rawUsername + '" không tồn tại! Vui lòng đăng ký trước.');
                return;
            }
            var savedUser = JSON.parse(savedData);
            if (savedUser.password === password) {
                alert('Đăng nhập thành công!\nXin chào ' + savedUser.username);
                $('#username, #password').val('');
            } else {
                alert('Mật khẩu không chính xác!');
            }
        }
    });
});
