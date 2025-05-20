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
    
    // Xử lý form đăng nhập
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Lấy giá trị từ form
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Hiển thị thông báo đăng nhập thành công (chỉ cho mục đích demo)
            alert('Đăng nhập thành công với email: ' + email);
            
            // Trong thực tế, bạn sẽ gửi dữ liệu đến server để xác thực
            // Đây chỉ là mô phỏng giao diện
            console.log('Đăng nhập với:', { email, password, remember });
        });
    }
    
    // Xử lý đăng nhập bằng Google
    const googleBtn = document.querySelector('.google-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            // Mô phỏng đăng nhập bằng Google
            alert('Đăng nhập bằng Google (Chức năng mô phỏng)');
        });
    }
    
    // Xử lý đăng nhập bằng Facebook
    const facebookBtn = document.querySelector('.facebook-btn');
    
    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            // Mô phỏng đăng nhập bằng Facebook
            alert('Đăng nhập bằng Facebook (Chức năng mô phỏng)');
        });
    }
});