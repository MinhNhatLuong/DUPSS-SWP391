// Fake data for appointments
const appointments = [
    {
        id: 'A001',
        user: 'Nguyễn Văn A',
        consultant: 'Trần Thị B',
        date: '15/06/2023',
        time: '09:00 - 10:00',
        topic: 'Tư vấn cá nhân',
        status: 'Đã lên lịch',
        description: 'Buổi tư vấn cá nhân về các biện pháp phòng ngừa sử dụng ma túy trong môi trường học đường. Người dùng muốn tìm hiểu cách nhận biết và từ chối khi bị dụ dỗ sử dụng ma túy.'
    },
    {
        id: 'A002',
        user: 'Lê Văn C',
        consultant: 'Phạm Thị D',
        date: '16/06/2023',
        time: '14:00 - 15:00',
        topic: 'Tư vấn nhóm',
        status: 'Đã hoàn thành',
        description: 'Buổi tư vấn nhóm cho các học sinh lớp 11A1 về tác hại của ma túy và cách phòng ngừa. Buổi tư vấn đã diễn ra thành công với sự tham gia tích cực của học sinh.'
    },
    {
        id: 'A003',
        user: 'Hoàng Văn E',
        consultant: 'Ngô Thị F',
        date: '17/06/2023',
        time: '10:30 - 11:30',
        topic: 'Tư vấn gia đình',
        status: 'Đã lên lịch',
        description: 'Buổi tư vấn cho gia đình có con em đang trong độ tuổi vị thành niên. Gia đình muốn tìm hiểu cách nhận biết dấu hiệu con em sử dụng ma túy và cách can thiệp kịp thời.'
    },
    {
        id: 'A004',
        user: 'Vũ Thị G',
        consultant: 'Đặng Văn H',
        date: '18/06/2023',
        time: '15:30 - 16:30',
        topic: 'Tư vấn cá nhân',
        status: 'Đã hủy',
        description: 'Buổi tư vấn cá nhân về cách phòng ngừa tái nghiện. Người dùng đã hủy lịch hẹn vì lý do cá nhân.'
    },
    {
        id: 'A005',
        user: 'Trịnh Văn I',
        consultant: 'Lý Thị K',
        date: '19/06/2023',
        time: '13:00 - 14:00',
        topic: 'Tư vấn nhóm',
        status: 'Đã lên lịch',
        description: 'Buổi tư vấn nhóm cho các giáo viên về cách nhận biết học sinh có nguy cơ sử dụng ma túy và cách can thiệp, hỗ trợ kịp thời.'
    }
];

// Appointment Modal Functions
function openAppointmentModal(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    // Update modal content with appointment details
    document.getElementById('modalAppointmentId').textContent = `ID: ${appointment.id}`;
    document.getElementById('modalAppointmentUser').textContent = appointment.user;
    document.getElementById('modalAppointmentConsultant').textContent = appointment.consultant;
    document.getElementById('modalAppointmentDate').textContent = appointment.date;
    document.getElementById('modalAppointmentTime').textContent = appointment.time;
    document.getElementById('modalAppointmentTopic').textContent = appointment.topic;
    document.getElementById('modalAppointmentStatus').textContent = appointment.status;
    document.getElementById('modalAppointmentDescription').textContent = appointment.description;

    // Show the modal
    document.getElementById('appointmentModal').style.display = 'block';

    // Set the first tab as active by default
    openAppointmentTab(null, 'appointmentNotes');
}

function closeAppointmentModal() {
    document.getElementById('appointmentModal').style.display = 'none';
}

// Add Appointment Modal Functions
function openAddAppointmentModal() {
    document.getElementById('addAppointmentForm').reset();
    document.getElementById('addAppointmentModal').style.display = 'block';
}

function closeAddAppointmentModal() {
    document.getElementById('addAppointmentModal').style.display = 'none';
}

// Edit Appointment Modal Functions
function openEditAppointmentModal(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    // Populate form with appointment data
    document.getElementById('editAppointmentId').value = appointment.id;
    
    // Set select options for user
    const userSelect = document.getElementById('editAppointmentUser');
    for (let i = 0; i < userSelect.options.length; i++) {
        if (userSelect.options[i].text === appointment.user) {
            userSelect.selectedIndex = i;
            break;
        }
    }
    
    // Set select options for consultant
    const consultantSelect = document.getElementById('editAppointmentConsultant');
    for (let i = 0; i < consultantSelect.options.length; i++) {
        if (consultantSelect.options[i].text === appointment.consultant) {
            consultantSelect.selectedIndex = i;
            break;
        }
    }
    
    // Parse date from DD/MM/YYYY to YYYY-MM-DD for date input
    const dateParts = appointment.date.split('/');
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    document.getElementById('editAppointmentDate').value = formattedDate;
    
    // Parse time range
    const timeParts = appointment.time.split(' - ');
    document.getElementById('editAppointmentTimeStart').value = timeParts[0];
    document.getElementById('editAppointmentTimeEnd').value = timeParts[1];
    
    // Set select options for topic
    const topicSelect = document.getElementById('editAppointmentTopic');
    let topicValue = '';
    switch (appointment.topic) {
        case 'Tư vấn cá nhân': topicValue = 'personal'; break;
        case 'Tư vấn nhóm': topicValue = 'group'; break;
        case 'Tư vấn gia đình': topicValue = 'family'; break;
        case 'Tư vấn giáo dục': topicValue = 'education'; break;
        default: topicValue = 'other';
    }
    for (let i = 0; i < topicSelect.options.length; i++) {
        if (topicSelect.options[i].value === topicValue) {
            topicSelect.selectedIndex = i;
            break;
        }
    }
    
    // Set select options for status
    const statusSelect = document.getElementById('editAppointmentStatus');
    let statusValue = '';
    switch (appointment.status) {
        case 'Đã lên lịch': statusValue = 'scheduled'; break;
        case 'Đã hoàn thành': statusValue = 'completed'; break;
        case 'Đã hủy': statusValue = 'cancelled'; break;
    }
    for (let i = 0; i < statusSelect.options.length; i++) {
        if (statusSelect.options[i].value === statusValue) {
            statusSelect.selectedIndex = i;
            break;
        }
    }
    
    document.getElementById('editAppointmentDescription').value = appointment.description;

    // Show the modal
    document.getElementById('editAppointmentModal').style.display = 'block';
}

function closeEditAppointmentModal() {
    document.getElementById('editAppointmentModal').style.display = 'none';
}

// Delete Appointment Modal Functions
let appointmentToDelete = null;

function confirmDeleteAppointment(appointmentId) {
    appointmentToDelete = appointmentId;
    document.getElementById('deleteAppointmentModal').style.display = 'block';
}

function closeDeleteAppointmentModal() {
    document.getElementById('deleteAppointmentModal').style.display = 'none';
    appointmentToDelete = null;
}

function deleteAppointment() {
    if (appointmentToDelete) {
        // In a real application, you would send a request to delete the appointment
        // For this demo, we'll just remove the row from the table
        const appointmentRow = document.querySelector(`tr td:first-child:contains('${appointmentToDelete}')`).parentNode;
        if (appointmentRow) {
            appointmentRow.remove();
        }
        
        // Close the modal
        closeDeleteAppointmentModal();
        
        // Show success message
        alert(`Lịch hẹn ${appointmentToDelete} đã được xóa thành công!`);
    }
}

// Tab functionality for appointment details
function openAppointmentTab(evt, tabName) {
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
document.getElementById('addAppointmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // In a real application, you would send the form data to create a new appointment
    // For this demo, we'll just show a success message
    alert('Lịch hẹn mới đã được tạo thành công!');
    
    // Close the modal
    closeAddAppointmentModal();
});

document.getElementById('editAppointmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const appointmentId = document.getElementById('editAppointmentId').value;
    
    // In a real application, you would send the form data to update the appointment
    // For this demo, we'll just show a success message
    alert(`Lịch hẹn ${appointmentId} đã được cập nhật thành công!`);
    
    // Close the modal
    closeEditAppointmentModal();
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