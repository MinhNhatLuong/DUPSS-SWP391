// JavaScript for Course Detail Page

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is enrolled (this would normally be checked from a database)
    const isEnrolled = false; // Set to true to test the enrolled state
    
    const enrollButton = document.getElementById('enrollButton');
    const continueButton = document.getElementById('continueButton');
    
    // Show the appropriate button based on enrollment status
    if (isEnrolled) {
        enrollButton.style.display = 'none';
        continueButton.style.display = 'block';
    } else {
        enrollButton.style.display = 'block';
        continueButton.style.display = 'none';
    }
    
    // Enroll button click handler
    enrollButton.addEventListener('click', function() {
        // This would normally send a request to the server to enroll the user
        // For demo purposes, we'll just switch the buttons
        enrollButton.style.display = 'none';
        continueButton.style.display = 'block';
        
        // Show success message
        showNotification('Bạn đã đăng ký khóa học thành công!');
    });
    
    // Continue button click handler
    continueButton.addEventListener('click', function() {
        // This would normally redirect to the course content/learning page
        showNotification('Đang chuyển đến nội dung khóa học...');
        // Simulate redirect after 1.5 seconds
        setTimeout(function() {
            // window.location.href = 'course-content.html'; // Uncomment when the page exists
            alert('Chức năng này sẽ được triển khai trong tương lai.');
        }, 1500);
    });
    
    // Expand/collapse curriculum sections
    const sectionHeaders = document.querySelectorAll('.section-header');
    
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            if (content.style.display === 'none') {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    });
});

// Function to show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Add styles
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#3498db';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    // Show notification with animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}