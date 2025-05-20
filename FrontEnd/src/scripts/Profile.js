// JavaScript for Profile Page

document.addEventListener('DOMContentLoaded', function() {
    // Modal functionality
    const modal = document.getElementById('editProfileModal');
    const editBtn = document.querySelector('.edit-profile-btn');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const saveBtn = document.querySelector('.save-btn');
    const profileForm = document.getElementById('edit-profile-form');
    
    // Open modal when edit button is clicked
    editBtn.addEventListener('click', function() {
        modal.style.display = 'block';
    });
    
    // Close modal when X is clicked
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when Cancel is clicked
    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle form submission
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const birthdate = document.getElementById('birthdate').value;
        const phone = document.getElementById('phone').value;
        
        // Update profile information (in a real app, this would be an API call)
        updateProfileInfo(fullname, email, birthdate, phone);
        
        // Close modal
        modal.style.display = 'none';
        
        // Show success message
        showNotification('Thông tin đã được cập nhật thành công!');
    });
    
    // Function to update profile information on the page
    function updateProfileInfo(fullname, email, birthdate, phone) {
        // Format birthdate for display
        const date = new Date(birthdate);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        
        // Update the profile fields
        const profileFields = document.querySelectorAll('.profile-field p');
        profileFields[0].textContent = fullname;
        profileFields[1].textContent = email;
        profileFields[2].textContent = formattedDate;
        profileFields[3].textContent = phone;
    }
    
    // Function to show notification
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #27ae60;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            transform: translateY(100px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            z-index: 1000;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
});