document.addEventListener('DOMContentLoaded', function() {
    const appointmentForm = document.getElementById('appointment-form');
    const dateInput = document.getElementById('appointment-date');
    const timeInput = document.getElementById('appointment-time');
    
    // Set minimum date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;
    
    dateInput.setAttribute('min', formattedToday);
    
    // Form validation
    appointmentForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const date = dateInput.value;
        const time = timeInput.value;
        
        // Basic validation
        if (!fullname) {
            showError('Vui lòng nhập họ và tên của bạn');
            return;
        }
        
        if (!validateEmail(email)) {
            showError('Vui lòng nhập địa chỉ email hợp lệ');
            return;
        }
        
        if (!date) {
            showError('Vui lòng chọn ngày hẹn');
            return;
        }
        
        if (!time) {
            showError('Vui lòng chọn giờ hẹn');
            return;
        }
        
        // Check if appointment time is in the past
        const appointmentDateTime = new Date(`${date}T${time}`);
        if (appointmentDateTime < new Date()) {
            showError('Thời gian hẹn không thể là thời gian trong quá khứ');
            return;
        }
        
        // If all validations pass, show success message
        showSuccess();
        
        // In a real application, you would submit the form data to the server here
        // For now, we'll just reset the form after a delay
        setTimeout(() => {
            appointmentForm.reset();
        }, 3000);
    });
    
    // Email validation function
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    
    // Show error message
    function showError(message) {
        // Remove any existing alerts
        removeAlerts();
        
        // Create error alert
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-error';
        errorAlert.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        `;
        
        // Insert alert before the form
        appointmentForm.parentNode.insertBefore(errorAlert, appointmentForm);
        
        // Add close button functionality
        errorAlert.querySelector('.close-btn').addEventListener('click', function() {
            errorAlert.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorAlert.parentNode) {
                errorAlert.remove();
            }
        }, 5000);
    }
    
    // Show success message
    function showSuccess() {
        // Remove any existing alerts
        removeAlerts();
        
        // Create success alert
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success';
        successAlert.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Đặt lịch hẹn thành công! Chúng tôi sẽ gửi xác nhận qua email của bạn.</span>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        `;
        
        // Insert alert before the form
        appointmentForm.parentNode.insertBefore(successAlert, appointmentForm);
        
        // Add close button functionality
        successAlert.querySelector('.close-btn').addEventListener('click', function() {
            successAlert.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (successAlert.parentNode) {
                successAlert.remove();
            }
        }, 5000);
    }
    
    // Remove all alerts
    function removeAlerts() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => alert.remove());
    }
    
    // Add CSS for alerts
    const style = document.createElement('style');
    style.textContent = `
        .alert {
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }
        
        .alert i {
            margin-right: 10px;
            font-size: 1.2rem;
        }
        
        .alert-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .alert-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert .close-btn {
            margin-left: auto;
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
});