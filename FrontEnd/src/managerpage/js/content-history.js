// JavaScript for Content History page
document.addEventListener('DOMContentLoaded', function() {
    // Filter functionality
    const applyFiltersBtn = document.getElementById('applyFilters');
    const contentTypeFilter = document.getElementById('contentTypeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            filterContent();
        });
    }
    
    function filterContent() {
        const contentType = contentTypeFilter.value;
        const status = statusFilter.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            let showRow = true;
            
            // Filter by content type
            if (contentType !== 'all') {
                const typeCell = row.querySelector('td:nth-child(3) .badge');
                if (typeCell && !typeCell.classList.contains(`badge-${contentType}`)) {
                    showRow = false;
                }
            }
            
            // Filter by status
            if (status !== 'all' && showRow) {
                const statusSelect = row.querySelector('.status-select');
                if (statusSelect && statusSelect.value !== status) {
                    showRow = false;
                }
            }
            
            // Filter by date range (simplified version)
            if (startDate && endDate && showRow) {
                const dateCell = row.querySelector('td:nth-child(5)');
                if (dateCell) {
                    // Convert DD/MM/YYYY to YYYY-MM-DD for comparison
                    const dateParts = dateCell.textContent.split('/');
                    const rowDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
                    
                    const startDateObj = new Date(startDate);
                    const endDateObj = new Date(endDate);
                    
                    if (rowDate < startDateObj || rowDate > endDateObj) {
                        showRow = false;
                    }
                }
            }
            
            row.style.display = showRow ? '' : 'none';
        });
        
        updateContentStats();
    }
    
    // Handle status changes
    const statusSelects = document.querySelectorAll('.status-select');
    statusSelects.forEach(select => {
        select.addEventListener('change', function() {
            // Highlight the row to indicate changes
            const row = this.closest('tr');
            row.style.backgroundColor = '#fff8e1';
            
            // Enable update button
            const updateBtn = row.querySelector('.btn-update');
            if (updateBtn) {
                updateBtn.style.color = '#e53935';
                updateBtn.setAttribute('data-changed', 'true');
            }
        });
    });
    
    // Handle update buttons
    const updateBtns = document.querySelectorAll('.btn-update');
    updateBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.getAttribute('data-changed') === 'true') {
                const row = this.closest('tr');
                const id = row.querySelector('td:first-child').textContent;
                const statusSelect = row.querySelector('.status-select');
                
                // Here you would normally send an AJAX request to update the status
                // For demo purposes, we'll just show an alert
                alert(`Cập nhật trạng thái cho ID ${id} thành ${getStatusText(statusSelect.value)}`);
                
                // Reset row styling
                row.style.backgroundColor = '';
                this.style.color = '';
                this.removeAttribute('data-changed');
            }
        });
    });
    
    // Handle edit buttons
    const editBtns = document.querySelectorAll('.btn-icon[title="Chỉnh sửa"]');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const id = row.querySelector('td:first-child').textContent;
            const type = row.querySelector('td:nth-child(3) .badge').textContent.toLowerCase();
            
            // Redirect to edit page based on content type
            if (type === 'blog') {
                window.location.href = `create-blog.html?id=${id}&edit=true`;
            } else if (type === 'khóa học') {
                window.location.href = `create-course.html?id=${id}&edit=true`;
            }
        });
    });
    
    function getStatusText(value) {
        switch(value) {
            case 'published': return 'Đã xuất bản';
            case 'pending': return 'Chờ duyệt';
            case 'draft': return 'Bản nháp';
            case 'rejected': return 'Bị từ chối';
            default: return value;
        }
    }
    
    function updateContentStats() {
        const visibleRows = document.querySelectorAll('tbody tr:not([style*="display: none"])');
        const statsElement = document.querySelector('.content-stats p');
        
        if (statsElement) {
            statsElement.textContent = `Hiển thị 1-${visibleRows.length} của 58 mục`;
        }
    }
});