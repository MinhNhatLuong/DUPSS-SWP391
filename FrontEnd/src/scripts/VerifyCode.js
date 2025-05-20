document.addEventListener('DOMContentLoaded', function() {
    const verifyCodeForm = document.getElementById('verify-code-form');
    const pinInputs = document.querySelectorAll('.pin-input');
    const resendCodeBtn = document.getElementById('resend-code-btn');
    const countdownTimer = document.getElementById('countdown-timer');
    
    // Xử lý nhập mã PIN
    if (pinInputs.length > 0) {
        // Tự động focus vào ô đầu tiên
        pinInputs[0].focus();
        
        // Xử lý nhập mã PIN và tự động chuyển focus
        pinInputs.forEach((input, index) => {
            input.addEventListener('keyup', function(e) {
                // Nếu nhập số, chuyển focus sang ô tiếp theo
                if (e.key >= '0' && e.key <= '9') {
                    input.value = e.key;
                    if (index < pinInputs.length - 1) {
                        pinInputs[index + 1].focus();
                    }
                }
                // Xử lý phím Backspace
                else if (e.key === 'Backspace') {
                    input.value = '';
                    if (index > 0) {
                        pinInputs[index - 1].focus();
                    }
                }
            });
            
            // Xử lý paste mã PIN
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const pasteData = e.clipboardData.getData('text').trim();
                
                // Nếu dữ liệu paste có đúng độ dài của mã PIN
                if (pasteData.length === pinInputs.length && /^\d+$/.test(pasteData)) {
                    pinInputs.forEach((input, i) => {
                        input.value = pasteData[i];
                    });
                }
            });
        });
    }
    
    // Xử lý đếm ngược thời gian gửi lại mã
    let countdown = 60;
    let countdownInterval;
    
    function startCountdown() {
        resendCodeBtn.style.pointerEvents = 'none';
        resendCodeBtn.style.opacity = '0.5';
        
        countdownInterval = setInterval(function() {
            countdown--;
            countdownTimer.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                resendCodeBtn.style.pointerEvents = 'auto';
                resendCodeBtn.style.opacity = '1';
                countdown = 60;
            }
        }, 1000);
    }
    
    // Bắt đầu đếm ngược khi trang được tải
    startCountdown();
    
    // Xử lý sự kiện gửi lại mã
    if (resendCodeBtn) {
        resendCodeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Giả lập gửi lại mã
            console.log('Đã gửi lại mã xác thực');
            
            // Đặt lại đếm ngược
            clearInterval(countdownInterval);
            countdown = 60;
            countdownTimer.textContent = countdown;
            startCountdown();
        });
    }
    
    // Cho phép form submit bình thường để chuyển về trang chủ
    // Không cần kiểm tra mã PIN, chỉ cần đảm bảo các ô đã được nhập
    if (verifyCodeForm) {
        verifyCodeForm.addEventListener('submit', function(e) {
            // Kiểm tra xem tất cả các ô đã được nhập chưa
            let isComplete = true;
            
            pinInputs.forEach(input => {
                if (input.value === '') {
                    isComplete = false;
                }
            });
            
            if (!isComplete) {
                e.preventDefault(); // Ngăn form submit nếu chưa nhập đủ
                alert('Vui lòng nhập đầy đủ mã PIN');
            }
            // Nếu đã nhập đủ, form sẽ tự động submit và chuyển đến index.html
        });
    }
});