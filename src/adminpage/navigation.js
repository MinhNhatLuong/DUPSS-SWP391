// Navigation script for admin pages

document.addEventListener('DOMContentLoaded', function() {
    // Get all menu buttons
    const menuButtons = document.querySelectorAll('.menu-list button');
    
    // Add click event listeners to each menu button
    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            menuButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the button text to determine which page to navigate to
            const buttonText = this.textContent.trim();
            
            // Navigate to the appropriate page based on button text
            switch(buttonText) {
                case 'Quản lý người dùng':
                    window.location.href = 'index.html';
                    break;
                case 'Quản lý khóa học':
                    window.location.href = 'courses.html';
                    break;
                case 'Quản lý khảo sát':
                    window.location.href = 'surveys.html';
                    break;
                case 'Quản lý lịch hẹn':
                    window.location.href = 'appointments.html';
                    break;
                case 'Quản lý chương trình':
                    window.location.href = 'programs.html';
                    break;
                case 'Báo cáo & Thống kê':
                    // This page might not exist yet
                    alert('Trang Báo cáo & Thống kê đang được phát triển.');
                    break;
                default:
                    // Do nothing or show an error
                    break;
            }
        });
    });
    
    // Highlight the current page's button in the menu
    function highlightCurrentPage() {
        // Get the current page filename
        const currentPage = window.location.pathname.split('/').pop();
        
        // Find the corresponding button and make it active
        menuButtons.forEach(button => {
            const buttonText = button.textContent.trim();
            
            if (
                (currentPage === 'index.html' && buttonText === 'Quản lý người dùng') ||
                (currentPage === 'courses.html' && buttonText === 'Quản lý khóa học') ||
                (currentPage === 'surveys.html' && buttonText === 'Quản lý khảo sát') ||
                (currentPage === 'appointments.html' && buttonText === 'Quản lý lịch hẹn') ||
                (currentPage === 'programs.html' && buttonText === 'Quản lý chương trình')
            ) {
                // Remove active class from all buttons
                menuButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to this button
                button.classList.add('active');
            }
        });
    }
    
    // Call the function to highlight the current page
    highlightCurrentPage();
});