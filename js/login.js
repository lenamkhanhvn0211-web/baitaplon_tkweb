$(document).ready(function() {
    if (!localStorage.getItem('user_admin')) {
        var adminAccount = {
            username: 'admin',
            email: 'admin@quan-cafe.com',
            password: '123456',
            role: 'admin'
        };
        localStorage.setItem('user_admin', JSON.stringify(adminAccount));
    }

    var savedRememberUser = localStorage.getItem('remembered_user');
    if (savedRememberUser) {
        $('#username').val(savedRememberUser);
        $('#remember').prop('checked', true);
    } else {
        $('#username, #password, #email, #confirm-password').val('');
        setTimeout(function() {
            if (!$('#remember').is(':checked')) {
                $('#username, #password, #email, #confirm-password').val('');
            }
        }, 50);
    }

    $(document).on('click', '#eye, .eye', function() {
        $(this).toggleClass('open');
        $(this).children('i').toggleClass('fa-eye-slash fa-eye');
        var input = $(this).siblings('.input-wrapper').find('input');
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
                password: password,
                role: 'user'
            };

            localStorage.setItem('user_' + username, JSON.stringify(userAccount));
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
                alert('Tài khoản "' + rawUsername + '" không tồn tại!');
                return;
            }

            var savedUser = JSON.parse(savedData);
            if (savedUser.password === password) {
                if ($('#remember').is(':checked')) {
                    localStorage.setItem('remembered_user', rawUsername);
                } else {
                    localStorage.removeItem('remembered_user');
                }

                localStorage.setItem('currentUser', JSON.stringify({
                    username: savedUser.username,
                    role: savedUser.role || 'user',
                    isLoggedIn: true
                }));

                window.location.href = 'index.html';
            } else {
                alert('Mật khẩu không chính xác!');
            }
        }
    });
});
