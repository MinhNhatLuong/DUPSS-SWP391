// Fake data for programs
const programs = [
    {
        id: 'P001',
        name: 'Chương trình phòng ngừa ma túy học đường',
        type: 'Giáo dục',
        startDate: '01/07/2023',
        endDate: '30/09/2023',
        participants: 250,
        status: 'Đang diễn ra',
        description: 'Chương trình giáo dục toàn diện về phòng ngừa ma túy trong môi trường học đường, bao gồm các hoạt động tập huấn, hội thảo, và tư vấn cho học sinh, giáo viên và phụ huynh. Mục tiêu là nâng cao nhận thức và kỹ năng phòng ngừa sử dụng ma túy cho học sinh.'
    },
    {
        id: 'P002',
        name: 'Hội thảo nhận thức về tác hại của ma túy',
        type: 'Hội thảo',
        startDate: '15/07/2023',
        endDate: '16/07/2023',
        participants: 120,
        status: 'Đã hoàn thành',
        description: 'Hội thảo hai ngày với sự tham gia của các chuyên gia y tế, tâm lý và cảnh sát phòng chống ma túy. Hội thảo cung cấp thông tin chi tiết về các loại ma túy phổ biến, tác hại và cách nhận biết dấu hiệu sử dụng ma túy.'
    },
    {
        id: 'P003',
        name: 'Chiến dịch truyền thông "Nói không với ma túy"',
        type: 'Truyền thông',
        startDate: '01/08/2023',
        endDate: '31/08/2023',
        participants: 500,
        status: 'Đang diễn ra',
        description: 'Chiến dịch truyền thông đa kênh bao gồm poster, video, bài viết và các hoạt động tương tác trên mạng xã hội. Mục tiêu là lan tỏa thông điệp phòng chống ma túy đến đông đảo thanh thiếu niên và cộng đồng.'
    },
    {
        id: 'P004',
        name: 'Tập huấn kỹ năng tư vấn phòng chống ma túy',
        type: 'Đào tạo',
        startDate: '10/09/2023',
        endDate: '15/09/2023',
        participants: 80,
        status: 'Sắp diễn ra',
        description: 'Khóa tập huấn chuyên sâu dành cho các chuyên viên tư vấn, giáo viên và cán bộ làm công tác phòng chống ma túy. Nội dung bao gồm kỹ năng tư vấn, hỗ trợ tâm lý và can thiệp sớm cho người có nguy cơ sử dụng ma túy.'
    },
    {
        id: 'P005',
        name: 'Chương trình hỗ trợ cai nghiện',
        type: 'Hỗ trợ',
        startDate: '01/10/2023',
        endDate: '31/12/2023',
        participants: 45,
        status: 'Sắp diễn ra',
        description: 'Chương trình hỗ trợ toàn diện cho người cai nghiện ma túy, bao gồm tư vấn tâm lý, hỗ trợ y tế, đào tạo kỹ năng sống và hỗ trợ tái hòa nhập cộng đồng. Chương trình được thực hiện với sự phối hợp của các chuyên gia y tế, tâm lý và công tác xã hội.'
    }
];

// Program Modal Functions
function openProgramModal(programId) {
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    // Update modal content with program details
    document.getElementById('modalProgramName').textContent = program.name;
    document.getElementById('modalProgramId').textContent = `ID: ${program.id}`;
    document.getElementById('modalProgramType').textContent = program.type;
    document.getElementById('modalProgramStartDate').textContent = program.startDate;
    document.getElementById('modalProgramEndDate').textContent = program.endDate;
    document.getElementById('modalProgramParticipants').textContent = program.participants;
    document.getElementById('modalProgramStatus').textContent = program.status;
    document.getElementById('modalProgramDescription').textContent = program.description;

    // Show the modal
    document.getElementById('programModal').style.display = 'block';

    // Set the first tab as active by default
    openProgramTab(null, 'programActivities');
}

function closeProgramModal() {
    document.getElementById('programModal').style.display = 'none';
}

// Add Program Modal Functions
function openAddProgramModal() {
    document.getElementById('addProgramForm').reset();
    document.getElementById('addProgramModal').style.display = 'block';
}

function closeAddProgramModal() {
    document.getElementById('addProgramModal').style.display = 'none';
}

// Edit Program Modal Functions
function openEditProgramModal(programId) {
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    // Populate form with program data
    document.getElementById('editProgramId').value = program.id;
    document.getElementById('editProgramName').value = program.name;
    
    // Set select options based on program type
    const typeSelect = document.getElementById('editProgramType');
    let typeValue = '';
    switch (program.type) {
        case 'Giáo dục': typeValue = 'education'; break;
        case 'Hội thảo': typeValue = 'workshop'; break;
        case 'Truyền thông': typeValue = 'communication'; break;
        case 'Đào tạo': typeValue = 'training'; break;
        case 'Hỗ trợ': typeValue = 'support'; break;
    }
    for (let i = 0; i < typeSelect.options.length; i++) {
        if (typeSelect.options[i].value === typeValue) {
            typeSelect.selectedIndex = i;
            break;
        }
    }
    
    // Parse date from DD/MM/YYYY to YYYY-MM-DD for date input
    const startDateParts = program.startDate.split('/');
    const formattedStartDate = `${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}`;
    document.getElementById('editProgramStartDate').value = formattedStartDate;
    
    const endDateParts = program.endDate.split('/');
    const formattedEndDate = `${endDateParts[2]}-${endDateParts[1]}-${endDateParts[0]}`;
    document.getElementById('editProgramEndDate').value = formattedEndDate;
    
    // Set select options based on program status
    const statusSelect = document.getElementById('editProgramStatus');
    let statusValue = '';
    switch (program.status) {
        case 'Đang diễn ra': statusValue = 'active'; break;
        case 'Sắp diễn ra': statusValue = 'upcoming'; break;
        case 'Đã hoàn thành': statusValue = 'completed'; break;
        case 'Đã hủy': statusValue = 'cancelled'; break;
    }
    for (let i = 0; i < statusSelect.options.length; i++) {
        if (statusSelect.options[i].value === statusValue) {
            statusSelect.selectedIndex = i;
            break;
        }
    }
    
    document.getElementById('editProgramDescription').value = program.description;

    // Show the modal
    document.getElementById('editProgramModal').style.display = 'block';
}

function closeEditProgramModal() {
    document.getElementById('editProgramModal').style.display = 'none';
}

// Delete Program Modal Functions
let programToDelete = null;

function confirmDeleteProgram(programId) {
    programToDelete = programId;
    document.getElementById('deleteProgramModal').style.display = 'block';
}

function closeDeleteProgramModal() {
    document.getElementById('deleteProgramModal').style.display = 'none';
    programToDelete = null;
}

function deleteProgram() {
    if (programToDelete) {
        // In a real application, you would send a request to delete the program
        // For this demo, we'll just remove the row from the table
        const programRow = document.querySelector(`tr td:first-child:contains('${programToDelete}')`).parentNode;
        if (programRow) {
            programRow.remove();
        }
        
        // Close the modal
        closeDeleteProgramModal();
        
        // Show success message
        alert(`Chương trình ${programToDelete} đã được xóa thành công!`);
    }
}

// Tab functionality for program details
function openProgramTab(evt, tabName) {
    // Hide all tabcontent elements
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }

    // Remove the "active" class from all tablinks
    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    // Show the current tab and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = 'block';
    if (evt) {
        evt.currentTarget.className += ' active';
    } else {
        // If no event (initial load), set the first tab as active
        document.querySelector('.tablinks').className += ' active';
    }
}

// Form submission handlers
document.getElementById('addProgramForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // In a real application, you would send the form data to create a new program
    // For this demo, we'll just show a success message
    alert('Chương trình mới đã được tạo thành công!');
    
    // Close the modal
    closeAddProgramModal();
});

document.getElementById('editProgramForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const programId = document.getElementById('editProgramId').value;
    
    // In a real application, you would send the form data to update the program
    // For this demo, we'll just show a success message
    alert(`Chương trình ${programId} đã được cập nhật thành công!`);
    
    // Close the modal
    closeEditProgramModal();
});

// Helper function for querySelector to find elements containing text
Element.prototype.contains = function(text) {
    return this.textContent.includes(text);
};

// Initialize event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Close modals when clicking outside of them
    window.onclick = function(event) {
        const modals = document.getElementsByClassName('modal');
        for (let i = 0; i < modals.length; i++) {
            if (event.target === modals[i]) {
                modals[i].style.display = 'none';
            }
        }
    };
});