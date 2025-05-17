document.addEventListener('DOMContentLoaded', function() {
    // Fake data for courses
    const courses = [
        {
            id: 'C001',
            name: 'Nhận thức về tác hại của ma túy',
            thumbnail: 'https://via.placeholder.com/40x40',
            instructor: 'Nguyễn Văn A',
            duration: '8 tuần',
            students: 45,
            startDate: '01/06/2023',
            description: 'Khóa học cung cấp kiến thức cơ bản về các loại ma túy, tác hại và hậu quả của việc sử dụng ma túy đối với sức khỏe, tinh thần và xã hội.',
        },
        {
            id: 'C002',
            name: 'Kỹ năng từ chối ma túy',
            thumbnail: 'https://via.placeholder.com/40x40',
            instructor: 'Trần Thị B',
            duration: '6 tuần',
            students: 38,
            startDate: '15/06/2023',
            description: 'Khóa học trang bị các kỹ năng từ chối, đối phó với áp lực từ bạn bè và xây dựng lòng tự trọng để phòng ngừa sử dụng ma túy.',
        },
        {
            id: 'C003',
            name: 'Phòng ngừa tái nghiện',
            thumbnail: 'https://via.placeholder.com/40x40',
            instructor: 'Lê Văn C',
            duration: '12 tuần',
            students: 25,
            startDate: '10/05/2023',
            description: 'Khóa học dành cho những người đã từng sử dụng ma túy, giúp họ xây dựng chiến lược phòng ngừa tái nghiện và tái hòa nhập cộng đồng.',
        },
        {
            id: 'C004',
            name: 'Hỗ trợ tâm lý cho người nghiện',
            thumbnail: 'https://via.placeholder.com/40x40',
            instructor: 'Phạm Thị D',
            duration: '10 tuần',
            students: 32,
            startDate: '20/05/2023',
            description: 'Khóa học cung cấp kiến thức và kỹ năng hỗ trợ tâm lý cho người nghiện ma túy, giúp họ vượt qua các thách thức tâm lý trong quá trình cai nghiện.',
        },
        {
            id: 'C005',
            name: 'Giáo dục phòng ngừa cho thanh thiếu niên',
            thumbnail: 'https://via.placeholder.com/40x40',
            instructor: 'Hoàng Văn E',
            duration: '8 tuần',
            students: 50,
            startDate: '05/06/2023',
            description: 'Khóa học thiết kế đặc biệt cho thanh thiếu niên, tập trung vào giáo dục phòng ngừa sử dụng ma túy thông qua các hoạt động tương tác và học tập trải nghiệm.',
        }
    ];

    // Course details modal functions
    function openCourseModal(courseId) {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            document.getElementById('modalCourseThumbnail').src = course.thumbnail;
            document.getElementById('modalCourseName').textContent = course.name;
            document.getElementById('modalCourseId').textContent = `ID: ${course.id}`;
            document.getElementById('modalCourseInstructor').textContent = `Giảng viên: ${course.instructor}`;
            document.getElementById('modalCourseDuration').textContent = course.duration;
            document.getElementById('modalCourseStudents').textContent = course.students;
            document.getElementById('modalCourseStartDate').textContent = course.startDate;
            document.getElementById('modalCourseDescription').textContent = course.description;
            
            document.getElementById('courseModal').style.display = 'block';
        }
    }

    function closeCourseModal() {
        document.getElementById('courseModal').style.display = 'none';
    }

    // Tab functions for course details
    function openCourseTab(evt, tabName) {
        const tabcontent = document.getElementsByClassName('tabcontent');
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = 'none';
        }

        const tablinks = document.getElementsByClassName('tablinks');
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(' active', '');
        }

        document.getElementById(tabName).style.display = 'block';
        evt.currentTarget.className += ' active';
    }

    // Add course modal functions
    function openAddCourseModal() {
        document.getElementById('addCourseModal').style.display = 'block';
    }

    function closeAddCourseModal() {
        document.getElementById('addCourseModal').style.display = 'none';
        document.getElementById('addCourseForm').reset();
    }

    // Edit course modal functions
    function openEditCourseModal(courseId) {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            document.getElementById('editCourseId').value = course.id;
            document.getElementById('editCourseName').value = course.name;
            document.getElementById('editCourseInstructor').value = course.instructor;
            document.getElementById('editCourseDuration').value = course.duration;
            
            // Convert date format from DD/MM/YYYY to YYYY-MM-DD for input[type="date"]
            const dateParts = course.startDate.split('/');
            const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            document.getElementById('editCourseStartDate').value = formattedDate;
            
            document.getElementById('editCourseImagePreview').src = course.thumbnail;
            document.getElementById('editCourseDescription').value = course.description;
            
            document.getElementById('editCourseModal').style.display = 'block';
        }
    }

    function closeEditCourseModal() {
        document.getElementById('editCourseModal').style.display = 'none';
    }

    // Delete course modal functions
    let courseToDelete = null;

    function confirmDeleteCourse(courseId) {
        courseToDelete = courseId;
        document.getElementById('deleteCourseModal').style.display = 'block';
    }

    function closeDeleteCourseModal() {
        document.getElementById('deleteCourseModal').style.display = 'none';
        courseToDelete = null;
    }

    function deleteCourse() {
        if (courseToDelete) {
            // In a real application, you would send a request to the server to delete the course
            // For this demo, we'll just remove the row from the table
            const courseRow = document.querySelector(`tr[data-course-id="${courseToDelete}"]`);
            if (courseRow) {
                courseRow.remove();
            } else {
                // If we can't find the row by data attribute, try finding it by the first cell containing the ID
                const rows = document.querySelectorAll('tbody tr');
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].cells[0].textContent === courseToDelete) {
                        rows[i].remove();
                        break;
                    }
                }
            }
            
            alert(`Khóa học ${courseToDelete} đã được xóa thành công!`);
            closeDeleteCourseModal();
        }
    }

    // Form submission handlers
    document.getElementById('addCourseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        // In a real application, you would send the form data to the server
        // For this demo, we'll just show an alert
        alert('Khóa học mới đã được thêm thành công!');
        closeAddCourseModal();
    });

    document.getElementById('editCourseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        // In a real application, you would send the form data to the server
        // For this demo, we'll just show an alert
        const courseId = document.getElementById('editCourseId').value;
        alert(`Khóa học ${courseId} đã được cập nhật thành công!`);
        closeEditCourseModal();
    });

    // Expose functions to global scope for HTML onclick attributes
    window.openCourseModal = openCourseModal;
    window.closeCourseModal = closeCourseModal;
    window.openCourseTab = openCourseTab;
    window.openAddCourseModal = openAddCourseModal;
    window.closeAddCourseModal = closeAddCourseModal;
    window.openEditCourseModal = openEditCourseModal;
    window.closeEditCourseModal = closeEditCourseModal;
    window.confirmDeleteCourse = confirmDeleteCourse;
    window.closeDeleteCourseModal = closeDeleteCourseModal;
    window.deleteCourse = deleteCourse;
});