document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị/ẩn mật khẩu
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('#password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Thay đổi biểu tượng
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Hiển thị/ẩn xác nhận mật khẩu
    const toggleConfirmPassword = document.querySelector('.toggle-confirm-password');
    const confirmPasswordInput = document.querySelector('#confirm-password');
    
    if (toggleConfirmPassword && confirmPasswordInput) {
        toggleConfirmPassword.addEventListener('click', function() {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            
            // Thay đổi biểu tượng
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Xử lý form đăng ký
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Lấy giá trị từ form
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const birthdate = document.getElementById('birthdate').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;
            
            // Kiểm tra mật khẩu khớp nhau
            if (password !== confirmPassword) {
                alert('Mật khẩu và xác nhận mật khẩu không khớp!');
                return;
            }
            
            // Kiểm tra đồng ý điều khoản
            if (!terms) {
                alert('Bạn cần đồng ý với điều khoản sử dụng và chính sách bảo mật!');
                return;
            }
            
            // Hiển thị thông báo đăng ký thành công (chỉ cho mục đích demo)
            alert('Đăng ký thành công với email: ' + email);
            
            // Trong thực tế, bạn sẽ gửi dữ liệu đến server để xử lý
            // Đây chỉ là mô phỏng giao diện
            console.log('Đăng ký với:', { fullname, email, birthdate, phone, password, terms });
        });
    }
    
    // Xử lý đăng ký bằng Google
    const googleBtn = document.querySelector('.google-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            // Mô phỏng đăng ký bằng Google
            alert('Đăng ký bằng Google (Chức năng mô phỏng)');
        });
    }
    
    // Xử lý đăng ký bằng Facebook
    const facebookBtn = document.querySelector('.facebook-btn');
    
    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            // Mô phỏng đăng ký bằng Facebook
            alert('Đăng ký bằng Facebook (Chức năng mô phỏng)');
        });
    }
});