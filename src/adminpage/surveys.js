// Fake data for surveys
const surveys = [
    {
        id: 'S001',
        name: 'Đánh giá nhận thức về ma túy',
        type: 'Trắc nghiệm',
        date: '10/05/2023',
        questions: 15,
        participants: 120,
        status: 'Đang hoạt động',
        description: 'Khảo sát này nhằm đánh giá mức độ nhận thức của người dùng về các loại ma túy, tác hại và hậu quả của việc sử dụng ma túy. Kết quả sẽ được sử dụng để phát triển các chương trình giáo dục phù hợp.'
    },
    {
        id: 'S002',
        name: 'Khảo sát về tác động của ma túy',
        type: 'Tự luận',
        date: '15/05/2023',
        questions: 10,
        participants: 85,
        status: 'Đang hoạt động',
        description: 'Khảo sát này tập trung vào việc thu thập thông tin về tác động của ma túy đối với cuộc sống của người sử dụng và người xung quanh. Các câu hỏi mở giúp người tham gia chia sẻ trải nghiệm và quan điểm cá nhân.'
    },
    {
        id: 'S003',
        name: 'Đánh giá hiệu quả chương trình phòng ngừa',
        type: 'Hỗn hợp',
        date: '20/05/2023',
        questions: 20,
        participants: 65,
        status: 'Đang hoạt động',
        description: 'Khảo sát này đánh giá hiệu quả của các chương trình phòng ngừa ma túy hiện tại, thu thập phản hồi từ người tham gia về nội dung, phương pháp truyền đạt và tác động của chương trình.'
    },
    {
        id: 'S004',
        name: 'Khảo sát về nhu cầu tư vấn',
        type: 'Trắc nghiệm',
        date: '25/05/2023',
        questions: 12,
        participants: 95,
        status: 'Đã kết thúc',
        description: 'Khảo sát này thu thập thông tin về nhu cầu tư vấn của người dùng liên quan đến vấn đề ma túy, bao gồm loại hình tư vấn, thời gian, phương thức và các chủ đề quan tâm.'
    },
    {
        id: 'S005',
        name: 'Đánh giá mức độ hài lòng về khóa học',
        type: 'Hỗn hợp',
        date: '01/06/2023',
        questions: 15,
        participants: 50,
        status: 'Bản nháp',
        description: 'Khảo sát này đánh giá mức độ hài lòng của người tham gia đối với các khóa học phòng ngừa ma túy, thu thập phản hồi về nội dung, giảng viên, tài liệu và cơ sở vật chất.'
    }
];

// Survey Modal Functions
function openSurveyModal(surveyId) {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;

    // Update modal content with survey details
    document.getElementById('modalSurveyName').textContent = survey.name;
    document.getElementById('modalSurveyId').textContent = `ID: ${survey.id}`;
    document.getElementById('modalSurveyType').textContent = `Loại: ${survey.type}`;
    document.getElementById('modalSurveyDate').textContent = survey.date;
    document.getElementById('modalSurveyQuestions').textContent = survey.questions;
    document.getElementById('modalSurveyParticipants').textContent = survey.participants;
    document.getElementById('modalSurveyStatus').textContent = survey.status;
    document.getElementById('modalSurveyDescription').textContent = survey.description;

    // Show the modal
    document.getElementById('surveyModal').style.display = 'block';

    // Set the first tab as active by default
    openSurveyTab(null, 'surveyQuestions');
}

function closeSurveyModal() {
    document.getElementById('surveyModal').style.display = 'none';
}

// Add Survey Modal Functions
function openAddSurveyModal() {
    document.getElementById('addSurveyForm').reset();
    document.getElementById('addSurveyModal').style.display = 'block';
}

function closeAddSurveyModal() {
    document.getElementById('addSurveyModal').style.display = 'none';
}

// Edit Survey Modal Functions
function openEditSurveyModal(surveyId) {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;

    // Populate form with survey data
    document.getElementById('editSurveyId').value = survey.id;
    document.getElementById('editSurveyName').value = survey.name;
    
    // Set select options based on survey type
    const typeSelect = document.getElementById('editSurveyType');
    for (let i = 0; i < typeSelect.options.length; i++) {
        if (typeSelect.options[i].text === survey.type) {
            typeSelect.selectedIndex = i;
            break;
        }
    }
    
    // Set select options based on survey status
    const statusSelect = document.getElementById('editSurveyStatus');
    for (let i = 0; i < statusSelect.options.length; i++) {
        if (statusSelect.options[i].text === survey.status) {
            statusSelect.selectedIndex = i;
            break;
        }
    }
    
    document.getElementById('editSurveyDescription').value = survey.description;

    // Show the modal
    document.getElementById('editSurveyModal').style.display = 'block';
}

function closeEditSurveyModal() {
    document.getElementById('editSurveyModal').style.display = 'none';
}

// Delete Survey Modal Functions
let surveyToDelete = null;

function confirmDeleteSurvey(surveyId) {
    surveyToDelete = surveyId;
    document.getElementById('deleteSurveyModal').style.display = 'block';
}

function closeDeleteSurveyModal() {
    document.getElementById('deleteSurveyModal').style.display = 'none';
    surveyToDelete = null;
}

function deleteSurvey() {
    if (surveyToDelete) {
        // In a real application, you would send a request to delete the survey
        // For this demo, we'll just remove the row from the table
        const surveyRow = document.querySelector(`tr td:first-child:contains('${surveyToDelete}')`).parentNode;
        if (surveyRow) {
            surveyRow.remove();
        }
        
        // Close the modal
        closeDeleteSurveyModal();
        
        // Show success message
        alert(`Khảo sát ${surveyToDelete} đã được xóa thành công!`);
    }
}

// Tab functionality for survey details
function openSurveyTab(evt, tabName) {
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
document.getElementById('addSurveyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // In a real application, you would send the form data to create a new survey
    // For this demo, we'll just show a success message
    alert('Khảo sát mới đã được tạo thành công!');
    
    // Close the modal
    closeAddSurveyModal();
});

document.getElementById('editSurveyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const surveyId = document.getElementById('editSurveyId').value;
    
    // In a real application, you would send the form data to update the survey
    // For this demo, we'll just show a success message
    alert(`Khảo sát ${surveyId} đã được cập nhật thành công!`);
    
    // Close the modal
    closeEditSurveyModal();
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