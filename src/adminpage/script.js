// Function to open the modal with user details
function openModal(userId) {
    const modal = document.getElementById('userModal');
    
    // Set user details based on userId
    if (userId === '001') {
        document.getElementById('modalUserAvatar').src = 'https://randomuser.me/api/portraits/men/1.jpg';
        document.getElementById('modalUserName').textContent = 'Nguyễn Văn A';
        document.getElementById('modalUserId').textContent = 'ID: 001';
        document.getElementById('modalUserRole').textContent = 'Vai trò: Thành viên';
        document.getElementById('modalUserDob').textContent = '15/05/1990';
        document.getElementById('modalUserEmail').textContent = 'nguyenvana@example.com';
        document.getElementById('modalUserPhone').textContent = '0912345678';
    } else if (userId === '002') {
        document.getElementById('modalUserAvatar').src = 'https://randomuser.me/api/portraits/women/2.jpg';
        document.getElementById('modalUserName').textContent = 'Trần Thị B';
        document.getElementById('modalUserId').textContent = 'ID: 002';
        document.getElementById('modalUserRole').textContent = 'Vai trò: Chuyên viên tư vấn';
        document.getElementById('modalUserDob').textContent = '22/08/1985';
        document.getElementById('modalUserEmail').textContent = 'tranthib@example.com';
        document.getElementById('modalUserPhone').textContent = '0923456789';
    } else if (userId === '003') {
        document.getElementById('modalUserAvatar').src = 'https://randomuser.me/api/portraits/men/3.jpg';
        document.getElementById('modalUserName').textContent = 'Lê Văn C';
        document.getElementById('modalUserId').textContent = 'ID: 003';
        document.getElementById('modalUserRole').textContent = 'Vai trò: Nhân viên';
        document.getElementById('modalUserDob').textContent = '10/12/1992';
        document.getElementById('modalUserEmail').textContent = 'levanc@example.com';
        document.getElementById('modalUserPhone').textContent = '0934567890';
    } else if (userId === '004') {
        document.getElementById('modalUserAvatar').src = 'https://randomuser.me/api/portraits/women/4.jpg';
        document.getElementById('modalUserName').textContent = 'Phạm Thị D';
        document.getElementById('modalUserId').textContent = 'ID: 004';
        document.getElementById('modalUserRole').textContent = 'Vai trò: Quản lý';
        document.getElementById('modalUserDob').textContent = '05/03/1988';
        document.getElementById('modalUserEmail').textContent = 'phamthid@example.com';
        document.getElementById('modalUserPhone').textContent = '0945678901';
    } else if (userId === '005') {
        document.getElementById('modalUserAvatar').src = 'https://randomuser.me/api/portraits/men/5.jpg';
        document.getElementById('modalUserName').textContent = 'Hoàng Văn E';
        document.getElementById('modalUserId').textContent = 'ID: 005';
        document.getElementById('modalUserRole').textContent = 'Vai trò: Thành viên';
        document.getElementById('modalUserDob').textContent = '18/07/1995';
        document.getElementById('modalUserEmail').textContent = 'hoangvane@example.com';
        document.getElementById('modalUserPhone').textContent = '0956789012';
    }
    
    // Display the modal
    modal.style.display = 'block';
}

// Function to close modal
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Function to switch tabs in user details
function openTab(tabId) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }

    // Remove active class from all tab buttons
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }

    // Show the selected tab content and mark its button as active
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Function to open the add user modal
function openAddUserModal() {
    const modal = document.getElementById('addUserModal');
    modal.style.display = 'block';
    
    // Reset form
    document.getElementById('addUserForm').reset();
}

// Function to close the add user modal
function closeAddUserModal() {
    const modal = document.getElementById('addUserModal');
    modal.style.display = 'none';
}

// Function to open the edit user modal
function openEditUserModal(userId) {
    const modal = document.getElementById('editUserModal');
    document.getElementById('editUserId').value = userId;
    
    // Populate form with user data based on userId
    if (userId === '001') {
        document.getElementById('currentAvatar').src = 'https://randomuser.me/api/portraits/men/1.jpg';
        document.getElementById('editUserName').value = 'Nguyễn Văn A';
        document.getElementById('editUserRole').value = 'Thành viên';
        document.getElementById('editUserDob').value = '1990-05-15'; // Format for date input
        document.getElementById('editUserEmail').value = 'nguyenvana@example.com';
        document.getElementById('editUserPhone').value = '0912345678';
    } else if (userId === '002') {
        document.getElementById('currentAvatar').src = 'https://randomuser.me/api/portraits/women/2.jpg';
        document.getElementById('editUserName').value = 'Trần Thị B';
        document.getElementById('editUserRole').value = 'Chuyên viên tư vấn';
        document.getElementById('editUserDob').value = '1985-08-22';
        document.getElementById('editUserEmail').value = 'tranthib@example.com';
        document.getElementById('editUserPhone').value = '0923456789';
    } else if (userId === '003') {
        document.getElementById('currentAvatar').src = 'https://randomuser.me/api/portraits/men/3.jpg';
        document.getElementById('editUserName').value = 'Lê Văn C';
        document.getElementById('editUserRole').value = 'Nhân viên';
        document.getElementById('editUserDob').value = '1992-12-10';
        document.getElementById('editUserEmail').value = 'levanc@example.com';
        document.getElementById('editUserPhone').value = '0934567890';
    } else if (userId === '004') {
        document.getElementById('currentAvatar').src = 'https://randomuser.me/api/portraits/women/4.jpg';
        document.getElementById('editUserName').value = 'Phạm Thị D';
        document.getElementById('editUserRole').value = 'Quản lý';
        document.getElementById('editUserDob').value = '1988-03-05';
        document.getElementById('editUserEmail').value = 'phamthid@example.com';
        document.getElementById('editUserPhone').value = '0945678901';
    } else if (userId === '005') {
        document.getElementById('currentAvatar').src = 'https://randomuser.me/api/portraits/men/5.jpg';
        document.getElementById('editUserName').value = 'Hoàng Văn E';
        document.getElementById('editUserRole').value = 'Thành viên';
        document.getElementById('editUserDob').value = '1995-07-18';
        document.getElementById('editUserEmail').value = 'hoangvane@example.com';
        document.getElementById('editUserPhone').value = '0956789012';
    }
    
    modal.style.display = 'block';
}

// Function to close the edit user modal
function closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    modal.style.display = 'none';
}

// Function to confirm delete
function confirmDelete(userId) {
    const modal = document.getElementById('deleteConfirmModal');
    document.getElementById('deleteUserId').value = userId;
    modal.style.display = 'block';
}

// Function to close delete confirmation modal
function closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'none';
}

// Function to delete user
function deleteUser() {
    const userId = document.getElementById('deleteUserId').value;
    
    // In a real application, this would make an API call to delete the user
    // For this demo, we'll just remove the row from the table
    const userRow = document.querySelector(`tr[data-id="${userId}"]`) || 
                    document.querySelector(`tbody tr:nth-child(${parseInt(userId.slice(-1))})`); // Fallback
    
    if (userRow) {
        userRow.remove();
        alert(`Người dùng có ID ${userId} đã được xóa thành công!`);
    }
    
    closeDeleteConfirmModal();
}

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Close modals when clicking outside
    window.onclick = function(event) {
        const userModal = document.getElementById('userModal');
        const addUserModal = document.getElementById('addUserModal');
        const editUserModal = document.getElementById('editUserModal');
        const deleteConfirmModal = document.getElementById('deleteConfirmModal');
        
        if (event.target === userModal) {
            closeModal();
        } else if (event.target === addUserModal) {
            closeAddUserModal();
        } else if (event.target === editUserModal) {
            closeEditUserModal();
        } else if (event.target === deleteConfirmModal) {
            closeDeleteConfirmModal();
        }
    };

    // Role filter functionality
    const roleButtons = document.querySelectorAll('.role-list button');
    roleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            roleButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // In a real application, you would filter the user table based on the selected role
            // For this example, we'll just update the header
            const roleName = this.textContent;
            document.querySelector('.header h1').textContent = 
                roleName === 'Tất cả người dùng' ? 'Quản lý người dùng' : `Quản lý ${roleName}`;
        });
    });
    
    // Form submissions
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, this would make an API call to add the user
            // For this demo, we'll just show an alert
            alert('Người dùng mới đã được thêm thành công!');
            closeAddUserModal();
        });
    }
    
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userId = document.getElementById('editUserId').value;
            
            // In a real application, this would make an API call to update the user
            // For this demo, we'll just show an alert
            alert(`Thông tin người dùng có ID ${userId} đã được cập nhật thành công!`);
            closeEditUserModal();
        });
    }
});