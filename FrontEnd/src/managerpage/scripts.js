// Initialize all charts and interactive elements for the manager dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý sự kiện click cho các liên kết trong thanh điều hướng
    document.querySelectorAll('#sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết
            
            // Xóa lớp active từ tất cả các liên kết
            document.querySelectorAll('#sidebar .nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // Thêm lớp active cho liên kết được click
            this.classList.add('active');
            
            // Lấy đường dẫn từ thuộc tính href
            const pageUrl = this.getAttribute('href');
            
            // Nếu là trang chủ (index.html), hiển thị nội dung dashboard
            if (pageUrl === 'index.html') {
                showDashboard();
                return;
            }
            
            // Tải nội dung từ trang được chọn
            loadPageContent(pageUrl);
        });
    });
    
    // Tạo container cho nội dung trang khác nếu chưa tồn tại
    if (!document.getElementById('page-content-container')) {
        const pageContentContainer = document.createElement('div');
        pageContentContainer.id = 'page-content-container';
        pageContentContainer.style.display = 'none'; // Ẩn mặc định
        document.querySelector('main').appendChild(pageContentContainer);
    }
    
    // Hiển thị dashboard mặc định khi trang được tải
    showDashboard();
    
    // Hàm hiển thị nội dung dashboard
    function showDashboard() {
        // Cập nhật tiêu đề trang
        document.querySelector('main h1').textContent = 'Dashboard';
        
        // Hiển thị tất cả các phần tử của dashboard
        const dashboardContent = document.getElementById('dashboard-content');
        if (dashboardContent) {
            dashboardContent.style.display = 'flex';
        }
        
        document.querySelectorAll('.dashboard-element').forEach(element => {
            element.style.display = 'block';
        });
        
        // Ẩn container nội dung trang khác
        const pageContentContainer = document.getElementById('page-content-container');
        if (pageContentContainer) {
            pageContentContainer.style.display = 'none';
        }
        
        // Cập nhật URL hiện tại mà không làm mới trang
        history.pushState(null, '', 'index.html');
    }
    
    // Hàm tải nội dung từ trang khác
    function loadPageContent(pageUrl) {
        // Lấy container cho nội dung trang
        const pageContentContainer = document.getElementById('page-content-container');
        
        // Hiển thị container nội dung trang
        pageContentContainer.style.display = 'block';
        
        // Ẩn tất cả các phần tử của dashboard
        const dashboardContent = document.getElementById('dashboard-content');
        if (dashboardContent) {
            dashboardContent.style.display = 'none';
        }
        
        document.querySelectorAll('.dashboard-element').forEach(element => {
            if (element.id !== 'page-content-container') {
                element.style.display = 'none';
            }
        });
        
        // Hiển thị thông báo đang tải
        pageContentContainer.innerHTML = '<div class="d-flex justify-content-center my-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Đang tải...</span></div></div>';
        
        // Sử dụng fetch API để tải nội dung từ trang khác
        fetch(pageUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Không thể tải trang. Mã lỗi: ' + response.status);
                }
                return response.text();
            })
            .then(html => {
                // Tạo một DOM parser để phân tích HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Lấy tiêu đề trang
                const pageTitle = doc.querySelector('main h1').textContent;
                document.querySelector('main h1').textContent = pageTitle;
                
                // Lấy nội dung chính từ trang đích (bỏ qua phần sidebar)
                const mainContent = doc.querySelector('main');
                
                // Loại bỏ tiêu đề và phần border-bottom vì chúng ta đã cập nhật tiêu đề
                const titleElement = mainContent.querySelector('.d-flex.justify-content-between');
                if (titleElement) {
                    mainContent.removeChild(titleElement);
                }
                
                // Cập nhật nội dung container
                pageContentContainer.innerHTML = mainContent.innerHTML;
                
                // Khởi tạo lại các script trong nội dung mới
                initializePageScripts(pageUrl);
                
                // Cập nhật URL hiện tại mà không làm mới trang
                history.pushState(null, '', pageUrl);
            })
            .catch(error => {
                console.error('Lỗi khi tải trang:', error);
                pageContentContainer.innerHTML = `<div class="alert alert-danger my-5">Không thể tải nội dung trang. Lỗi: ${error.message}</div>`;
            });
    }
     
     // Hàm khởi tạo các script cho trang đã tải
     function initializePageScripts(pageUrl) {
         // Xác định trang hiện tại dựa trên URL
         const pageName = pageUrl.split('.')[0];
         
         // Khởi tạo các script tương ứng với từng trang
         switch(pageName) {
             case 'programs':
                 initializeProgramsPage();
                 break;
             case 'courses':
                 initializeCoursesPage();
                 break;
             case 'surveys':
                 initializeSurveysPage();
                 break;
             case 'counselors':
                 initializeCounselorsPage();
                 break;
             case 'users':
                 initializeUsersPage();
                 break;
             case 'appointments':
                 initializeAppointmentsPage();
                 break;
             case 'reports':
                 initializeReportsPage();
                 break;
         }
     }
     
     // Xử lý sự kiện chọn thời gian trong dropdown
     const timeDropdownItems = document.querySelectorAll('.dropdown-menu .dropdown-item');
     const timeButton = document.querySelector('#dropdownMenuButton');
     
     if (timeDropdownItems && timeButton) {
         timeDropdownItems.forEach(item => {
             item.addEventListener('click', function(e) {
                 e.preventDefault();
                 const selectedTime = this.textContent;
                 
                 // Cập nhật nội dung nút dropdown
                 timeButton.innerHTML = `<i class="bi bi-calendar3"></i> ${selectedTime}`;
                 
                 // Demo: Cập nhật dữ liệu dashboard dựa trên thời gian đã chọn
                 updateDashboardData(selectedTime);
             });
         });
     }
     
     // Hàm demo cập nhật dữ liệu dashboard dựa trên thời gian đã chọn
     function updateDashboardData(timeRange) {
         // Dữ liệu demo cho các khoảng thời gian khác nhau
         const demoData = {
             'Hôm nay': {
                 users: 42,
                 surveys: 15,
                 courses: 8,
                 sessions: 12
             },
             'Tuần này': {
                 users: 156,
                 surveys: 87,
                 courses: 32,
                 sessions: 45
             },
             'Tháng này': {
                 users: 523,
                 surveys: 312,
                 courses: 128,
                 sessions: 203
             },
             'Quý này': {
                 users: 892,
                 surveys: 645,
                 courses: 287,
                 sessions: 412
             },
             'Năm nay': {
                 users: 1254,
                 surveys: 876,
                 courses: 432,
                 sessions: 678
             }
         };
         
         // Lấy dữ liệu tương ứng với khoảng thời gian đã chọn
         const data = demoData[timeRange] || demoData['Năm nay'];
         
         // Cập nhật các số liệu trên dashboard
         const statsElements = document.querySelectorAll('.card h2');
         if (statsElements.length >= 4) {
             statsElements[0].textContent = data.users.toLocaleString();
             statsElements[1].textContent = data.surveys.toLocaleString();
             statsElements[2].textContent = data.courses.toLocaleString();
             statsElements[3].textContent = data.sessions.toLocaleString();
         }
         
         // Hiển thị thông báo
         const alertContainer = document.querySelector('main');
         const alertElement = document.createElement('div');
         alertElement.className = 'alert alert-success alert-dismissible fade show';
         alertElement.innerHTML = `
             <strong>Đã cập nhật!</strong> Dữ liệu dashboard đã được cập nhật theo khoảng thời gian: ${timeRange}.
             <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
         `;
         
         // Thêm thông báo vào đầu main content
         if (alertContainer) {
             alertContainer.insertBefore(alertElement, alertContainer.firstChild);
             
             // Tự động ẩn thông báo sau 3 giây
             setTimeout(() => {
                 alertElement.remove();
             }, 3000);
         }
     }
    
    // User Statistics Chart
    const userChartCtx = document.getElementById('userChart').getContext('2d');
    const userChart = new Chart(userChartCtx, {
        type: 'line',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
            datasets: [{
                label: 'Người dùng mới',
                data: [65, 78, 90, 105, 112, 124, 135, 150, 180, 210, 230, 240],
                borderColor: 'rgba(13, 110, 253, 1)',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: 'rgba(13, 110, 253, 1)',
                pointBorderWidth: 2,
                pointRadius: 4
            }, {
                label: 'Người dùng hoạt động',
                data: [45, 58, 70, 85, 92, 104, 115, 130, 160, 190, 210, 220],
                borderColor: 'rgba(25, 135, 84, 1)',
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: 'rgba(25, 135, 84, 1)',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    cornerRadius: 4
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
    
    // Hàm khởi tạo trang quản lý chương trình
    function initializeProgramsPage() {
        console.log('Khởi tạo trang quản lý chương trình');
        
        // Khởi tạo các sự kiện cho nút thêm chương trình mới
        const addProgramBtn = document.getElementById('addProgramBtn');
        if (addProgramBtn) {
            addProgramBtn.addEventListener('click', function() {
                const modal = new bootstrap.Modal(document.getElementById('addProgramModal'));
                modal.show();
            });
        }
        
        // Khởi tạo các sự kiện cho form thêm chương trình
        const addProgramForm = document.getElementById('addProgramForm');
        if (addProgramForm) {
            addProgramForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // Xử lý thêm chương trình mới
                alert('Đã thêm chương trình mới thành công!');
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProgramModal'));
                modal.hide();
            });
        }
    }
    
    // Hàm khởi tạo trang quản lý khóa học
    function initializeCoursesPage() {
        console.log('Khởi tạo trang quản lý khóa học');
        
        // Khởi tạo các sự kiện cho nút thêm khóa học mới
        const addCourseBtn = document.getElementById('addCourseBtn');
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', function() {
                const modal = new bootstrap.Modal(document.getElementById('addCourseModal'));
                modal.show();
            });
        }
        
        // Khởi tạo các sự kiện cho form thêm khóa học
        const addCourseForm = document.getElementById('addCourseForm');
        if (addCourseForm) {
            addCourseForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // Xử lý thêm khóa học mới
                alert('Đã thêm khóa học mới thành công!');
                const modal = bootstrap.Modal.getInstance(document.getElementById('addCourseModal'));
                modal.hide();
            });
        }
    }
    
    // Hàm khởi tạo trang quản lý khảo sát
    function initializeSurveysPage() {
        console.log('Khởi tạo trang quản lý khảo sát');
        
        // Khởi tạo các sự kiện cho nút thêm khảo sát mới
        const addSurveyBtn = document.getElementById('addSurveyBtn');
        if (addSurveyBtn) {
            addSurveyBtn.addEventListener('click', function() {
                const modal = new bootstrap.Modal(document.getElementById('addSurveyModal'));
                modal.show();
            });
        }
    }
    
    // Hàm khởi tạo trang quản lý chuyên viên
    function initializeCounselorsPage() {
        console.log('Khởi tạo trang quản lý chuyên viên');
        
        // Khởi tạo các sự kiện cho nút thêm chuyên viên mới
        const addCounselorBtn = document.getElementById('addCounselorBtn');
        if (addCounselorBtn) {
            addCounselorBtn.addEventListener('click', function() {
                const modal = new bootstrap.Modal(document.getElementById('addCounselorModal'));
                modal.show();
            });
        }
    }
    
    // Hàm khởi tạo trang quản lý người dùng
    function initializeUsersPage() {
        console.log('Khởi tạo trang quản lý người dùng');
        
        // Khởi tạo các sự kiện cho nút thêm người dùng mới
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', function() {
                const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
                modal.show();
            });
        }
    }
    
    // Hàm khởi tạo trang quản lý lịch hẹn
    function initializeAppointmentsPage() {
        console.log('Khởi tạo trang quản lý lịch hẹn');
        
        // Khởi tạo các sự kiện cho nút thêm lịch hẹn mới
        const addAppointmentBtn = document.getElementById('addAppointmentBtn');
        if (addAppointmentBtn) {
            addAppointmentBtn.addEventListener('click', function() {
                const modal = new bootstrap.Modal(document.getElementById('addAppointmentModal'));
                modal.show();
            });
        }
    }
    
    // Hàm khởi tạo trang báo cáo
    function initializeReportsPage() {
        console.log('Khởi tạo trang báo cáo');
        
        // Khởi tạo các sự kiện cho nút xuất báo cáo
        const exportReportBtn = document.getElementById('exportReportBtn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', function() {
                alert('Đã xuất báo cáo thành công!');
            });
        }
    }

    // Hàm khởi tạo tooltips cho các nút thao tác
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Hàm khởi tạo các sự kiện cho các nút trong cột thao tác
function initializeActionButtons(pageType) {
    // Xử lý nút xem chi tiết
    document.querySelectorAll('.btn-outline-primary[title="Xem chi tiết"]').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.closest('tr').cells[0].textContent;
            const itemName = this.closest('tr').cells[1].textContent;
            showItemDetails(pageType, itemId, itemName);
        });
    });
    
    // Xử lý nút chỉnh sửa
    document.querySelectorAll('.btn-outline-success[title="Chỉnh sửa"]').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.closest('tr').cells[0].textContent;
            const itemName = this.closest('tr').cells[1].textContent;
            editItem(pageType, itemId, itemName);
        });
    });
    
    // Xử lý nút xóa
    document.querySelectorAll('.btn-outline-danger[title="Xóa"]').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.closest('tr').cells[0].textContent;
            const itemName = this.closest('tr').cells[1].textContent;
            deleteItem(pageType, itemId, itemName);
        });
    });
    
    // Xử lý nút khảo sát (nếu có)
    document.querySelectorAll('.btn-outline-info[title="Khảo sát"]').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.closest('tr').cells[0].textContent;
            const itemName = this.closest('tr').cells[1].textContent;
            manageSurveys(pageType, itemId, itemName);
        });
    });
}

// Hàm xử lý xem chi tiết
function showItemDetails(pageType, itemId, itemName) {
    console.log(`Xem chi tiết ${pageType} #${itemId}: ${itemName}`);
    
    // Tạo modal xem chi tiết
    let modalTitle = '';
    switch(pageType) {
        case 'programs': modalTitle = 'Chi tiết chương trình'; break;
        case 'courses': modalTitle = 'Chi tiết khóa học'; break;
        case 'surveys': modalTitle = 'Chi tiết khảo sát'; break;
        case 'counselors': modalTitle = 'Chi tiết chuyên viên'; break;
        case 'users': modalTitle = 'Chi tiết người dùng'; break;
        case 'appointments': modalTitle = 'Chi tiết lịch hẹn'; break;
        default: modalTitle = 'Chi tiết';
    }
    
    // Tạo modal HTML
    const modalHTML = `
    <div class="modal fade" id="viewDetailsModal" tabindex="-1" aria-labelledby="viewDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="viewDetailsModalLabel">${modalTitle}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">ID:</div>
                        <div class="col-md-8">${itemId}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Tên:</div>
                        <div class="col-md-8">${itemName}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Thông tin chi tiết:</div>
                        <div class="col-md-8">Đang tải...</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Thêm modal vào DOM nếu chưa có
    if (!document.getElementById('viewDetailsModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } else {
        document.getElementById('viewDetailsModal').outerHTML = modalHTML;
    }
    
    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('viewDetailsModal'));
    modal.show();
    
    // Trong thực tế, bạn sẽ gọi API để lấy thông tin chi tiết ở đây
    // Ví dụ: fetchItemDetails(pageType, itemId);
}

// Hàm xử lý chỉnh sửa
function editItem(pageType, itemId, itemName) {
    console.log(`Chỉnh sửa ${pageType} #${itemId}: ${itemName}`);
    
    // Tạo modal chỉnh sửa
    let modalTitle = '';
    switch(pageType) {
        case 'programs': modalTitle = 'Chỉnh sửa chương trình'; break;
        case 'courses': modalTitle = 'Chỉnh sửa khóa học'; break;
        case 'surveys': modalTitle = 'Chỉnh sửa khảo sát'; break;
        case 'counselors': modalTitle = 'Chỉnh sửa chuyên viên'; break;
        case 'users': modalTitle = 'Chỉnh sửa người dùng'; break;
        case 'appointments': modalTitle = 'Chỉnh sửa lịch hẹn'; break;
        default: modalTitle = 'Chỉnh sửa';
    }
    
    // Tạo modal HTML với form chỉnh sửa
    const modalHTML = `
    <div class="modal fade" id="editItemModal" tabindex="-1" aria-labelledby="editItemModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editItemModalLabel">${modalTitle}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="editItemForm" class="action-form">
                        <div class="mb-3">
                            <label for="itemId" class="form-label">ID</label>
                            <input type="text" class="form-control" id="itemId" value="${itemId}" readonly>
                        </div>
                        <div class="mb-3">
                            <label for="itemName" class="form-label">Tên</label>
                            <input type="text" class="form-control" id="itemName" value="${itemName}" required>
                        </div>
                        <div class="mb-3">
                            <label for="itemDescription" class="form-label">Mô tả</label>
                            <textarea class="form-control" id="itemDescription" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                    <button type="button" class="btn btn-success" id="saveEditBtn">Lưu thay đổi</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Thêm modal vào DOM nếu chưa có
    if (!document.getElementById('editItemModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } else {
        document.getElementById('editItemModal').outerHTML = modalHTML;
    }
    
    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('editItemModal'));
    modal.show();
    
    // Xử lý sự kiện lưu thay đổi
    document.getElementById('saveEditBtn').addEventListener('click', function() {
        const form = document.getElementById('editItemForm');
        if (form.checkValidity()) {
            // Xử lý lưu thay đổi
            alert(`Đã lưu thay đổi cho ${pageType} #${itemId}`);
            modal.hide();
        } else {
            form.reportValidity();
        }
    });
}

// Hàm xử lý xóa
function deleteItem(pageType, itemId, itemName) {
    console.log(`Xóa ${pageType} #${itemId}: ${itemName}`);
    
    if (confirm(`Bạn có chắc chắn muốn xóa ${pageType} #${itemId}: ${itemName}?`)) {
        // Xử lý xóa
        alert(`Đã xóa ${pageType} #${itemId}: ${itemName}`);
        
        // Trong thực tế, bạn sẽ gọi API để xóa và sau đó xóa hàng khỏi bảng
        // Ví dụ: deleteItemFromAPI(pageType, itemId).then(() => removeRowFromTable(itemId));
        
        // Demo: Xóa hàng khỏi bảng
        const row = document.querySelector(`tr td:first-child:contains(${itemId})`).closest('tr');
        if (row) {
            row.remove();
        }
    }
}

// Hàm xử lý quản lý khảo sát
function manageSurveys(pageType, itemId, itemName) {
    console.log(`Quản lý khảo sát cho ${pageType} #${itemId}: ${itemName}`);
    
    // Tạo modal quản lý khảo sát
    const modalHTML = `
    <div class="modal fade" id="manageSurveysModal" tabindex="-1" aria-labelledby="manageSurveysModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="manageSurveysModalLabel">Quản lý khảo sát cho ${itemName}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex justify-content-between mb-3">
                        <h6>Danh sách khảo sát</h6>
                        <button class="btn btn-sm btn-primary"><i class="bi bi-plus-circle me-1"></i> Thêm khảo sát</button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên khảo sát</th>
                                    <th>Loại</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Khảo sát đánh giá trước chương trình</td>
                                    <td>ASSIST</td>
                                    <td><span class="badge bg-success">Đang hoạt động</span></td>
                                    <td>
                                        <div class="btn-group">
                                            <button type="button" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></button>
                                            <button type="button" class="btn btn-sm btn-outline-success"><i class="bi bi-pencil"></i></button>
                                            <button type="button" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>Khảo sát đánh giá sau chương trình</td>
                                    <td>CRAFFT</td>
                                    <td><span class="badge bg-warning">Chưa kích hoạt</span></td>
                                    <td>
                                        <div class="btn-group">
                                            <button type="button" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></button>
                                            <button type="button" class="btn btn-sm btn-outline-success"><i class="bi bi-pencil"></i></button>
                                            <button type="button" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Thêm modal vào DOM nếu chưa có
    if (!document.getElementById('manageSurveysModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } else {
        document.getElementById('manageSurveysModal').outerHTML = modalHTML;
    }
    
    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('manageSurveysModal'));
    modal.show();
}

// Age Distribution Chart
const ageChartCtx = document.getElementById('ageChart').getContext('2d');
const ageChart = new Chart(ageChartCtx, {
    type: 'doughnut',
    data: {
        labels: ['Học sinh', 'Sinh viên', 'Phụ huynh', 'Giáo viên', 'Khác'],
        datasets: [{
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
                'rgba(13, 110, 253, 0.8)',
                'rgba(25, 135, 84, 0.8)',
                'rgba(13, 202, 240, 0.8)',
                'rgba(255, 193, 7, 0.8)',
                'rgba(108, 117, 125, 0.8)'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: {
                        size: 11
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: 10,
                cornerRadius: 4,
                callbacks: {
                    label: function(context) {
                        return context.label + ': ' + context.raw + '%';
                    }
                }
            }
        },
        cutout: '65%'
    }
});

    // ASSIST Survey Results Chart
    const assistChartCtx = document.getElementById('assistChart').getContext('2d');
    const assistChart = new Chart(assistChartCtx, {
        type: 'bar',
        data: {
            labels: ['Nguy cơ thấp', 'Nguy cơ trung bình', 'Nguy cơ cao'],
            datasets: [{
                label: 'Số lượng người dùng',
                data: [450, 120, 30],
                backgroundColor: [
                    'rgba(25, 135, 84, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(25, 135, 84, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    cornerRadius: 4
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });

    // CRAFFT Survey Results Chart
    const crafftChartCtx = document.getElementById('crafftChart').getContext('2d');
    const crafftChart = new Chart(crafftChartCtx, {
        type: 'bar',
        data: {
            labels: ['0 điểm', '1 điểm', '2+ điểm'],
            datasets: [{
                label: 'Số lượng người dùng',
                data: [380, 150, 70],
                backgroundColor: [
                    'rgba(25, 135, 84, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(25, 135, 84, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    cornerRadius: 4
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });

    // Add event listeners for sidebar navigation
    const navLinks = document.querySelectorAll('#sidebar .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            // Update main content based on clicked link (would be implemented with actual pages)
            const targetSection = this.getAttribute('href').substring(1);
            document.querySelector('main h1').textContent = targetSection.charAt(0).toUpperCase() + targetSection.slice(1);
        });
    });

    // Initialize tooltips and popovers if using Bootstrap components
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});