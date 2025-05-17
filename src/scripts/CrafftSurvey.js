// Xử lý khảo sát CRAFFT
document.addEventListener('DOMContentLoaded', function() {
    // Các phần của khảo sát
    const screeningSection = document.getElementById('screening-section');
    const crafftQuestions = document.getElementById('crafft-questions');
    const surveyResults = document.getElementById('survey-results');
    
    // Các nút điều hướng
    const screeningNextBtn = document.getElementById('screening-next');
    const prevQuestionBtn = document.getElementById('prev-question');
    const nextQuestionBtn = document.getElementById('next-question');
    const submitSurveyBtn = document.getElementById('submit-survey');
    
    // Các câu hỏi CRAFFT
    const questions = document.querySelectorAll('.question-item');
    let currentQuestionIndex = 0;
    
    // Thanh tiến trình
    const progressBar = document.getElementById('survey-progress');
    const currentQuestionSpan = document.getElementById('current-question');
    
    // Kết quả
    const crafftScoreElement = document.getElementById('crafft-score');
    const resultMessageElement = document.getElementById('result-message');
    const recommendationsElement = document.getElementById('recommendations');
    
    // Xử lý nút "Tiếp tục" ở phần sàng lọc ban đầu
    screeningNextBtn.addEventListener('click', function() {
        // Kiểm tra xem có sử dụng chất gây nghiện nào không
        const alcoholUsed = document.querySelector('input[name="alcohol"]:checked').value === 'yes';
        const marijuanaUsed = document.querySelector('input[name="marijuana"]:checked').value === 'yes';
        const otherDrugsUsed = document.querySelector('input[name="other_drugs"]:checked').value === 'yes';
        
        // Nếu không sử dụng chất gây nghiện nào, hiển thị kết quả ngay
        if (!alcoholUsed && !marijuanaUsed && !otherDrugsUsed) {
            showResults(0);
            return;
        }
        
        // Nếu có sử dụng, chuyển sang phần câu hỏi CRAFFT
        screeningSection.style.display = 'none';
        crafftQuestions.style.display = 'block';
        showQuestion(0);
    });
    
    // Hiển thị câu hỏi theo chỉ số
    function showQuestion(index) {
        // Ẩn tất cả câu hỏi
        questions.forEach(question => {
            question.style.display = 'none';
        });
        
        // Hiển thị câu hỏi hiện tại
        questions[index].style.display = 'block';
        currentQuestionIndex = index;
        
        // Cập nhật thanh tiến trình
        progressBar.style.width = `${(index + 1) * 16.66}%`;
        currentQuestionSpan.textContent = index + 1;
        
        // Hiển thị/ẩn các nút điều hướng phù hợp
        prevQuestionBtn.style.display = index === 0 ? 'none' : 'block';
        nextQuestionBtn.style.display = index === questions.length - 1 ? 'none' : 'block';
        submitSurveyBtn.style.display = index === questions.length - 1 ? 'block' : 'none';
    }
    
    // Xử lý nút câu hỏi trước
    prevQuestionBtn.addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            showQuestion(currentQuestionIndex - 1);
        }
    });
    
    // Xử lý nút câu hỏi tiếp theo
    nextQuestionBtn.addEventListener('click', function() {
        if (currentQuestionIndex < questions.length - 1) {
            showQuestion(currentQuestionIndex + 1);
        }
    });
    
    // Xử lý nút gửi khảo sát
    submitSurveyBtn.addEventListener('click', function() {
        // Tính điểm CRAFFT
        let score = 0;
        
        // Đếm số câu trả lời "Có"
        for (let i = 1; i <= 6; i++) {
            const answer = document.querySelector(`input[name="q${i}"]:checked`).value;
            if (answer === 'yes') {
                score++;
            }
        }
        
        // Hiển thị kết quả
        showResults(score);
    });
    
    // Hiển thị kết quả khảo sát
    function showResults(score) {
        // Ẩn các phần khảo sát
        screeningSection.style.display = 'none';
        crafftQuestions.style.display = 'none';
        
        // Hiển thị phần kết quả
        surveyResults.style.display = 'block';
        
        // Cập nhật điểm số
        crafftScoreElement.textContent = score;
        
        // Đánh giá kết quả và hiển thị thông báo phù hợp
        let resultMessage = '';
        let recommendations = '';
        let riskClass = '';
        
        if (score === 0) {
            resultMessage = '<p><strong>Không có nguy cơ:</strong> Dựa trên câu trả lời của bạn, hiện tại bạn không có dấu hiệu sử dụng chất gây nghiện có vấn đề.</p>';
            recommendations = '<p>Tiếp tục duy trì lối sống lành mạnh và tránh sử dụng các chất gây nghiện.</p><p>Tìm hiểu thêm về tác hại của các chất gây nghiện để phòng ngừa trong tương lai.</p>';
            riskClass = 'low-risk';
        } else if (score === 1) {
            resultMessage = '<p><strong>Nguy cơ thấp:</strong> Bạn có một số dấu hiệu nhỏ liên quan đến việc sử dụng chất gây nghiện.</p>';
            recommendations = '<p>Theo dõi thói quen sử dụng chất gây nghiện của bạn.</p><p>Cân nhắc giảm tần suất hoặc lượng sử dụng.</p><p>Tìm hiểu thêm về tác hại của các chất gây nghiện đối với sức khỏe.</p>';
            riskClass = 'low-risk';
        } else if (score >= 2 && score <= 3) {
            resultMessage = '<p><strong>Nguy cơ trung bình:</strong> Bạn có một số dấu hiệu đáng lo ngại về việc sử dụng chất gây nghiện có vấn đề.</p>';
            recommendations = '<p>Nên tham khảo ý kiến của chuyên gia y tế để được đánh giá chi tiết hơn.</p><p>Xem xét các chiến lược để giảm hoặc ngừng sử dụng chất gây nghiện.</p><p>Tìm hiểu về các nguồn lực hỗ trợ trong cộng đồng.</p>';
            riskClass = 'medium-risk';
        } else {
            resultMessage = '<p><strong>Nguy cơ cao:</strong> Bạn có nhiều dấu hiệu cho thấy việc sử dụng chất gây nghiện đang gây ra vấn đề nghiêm trọng.</p>';
            recommendations = '<p>Khuyến nghị mạnh mẽ bạn nên gặp chuyên gia y tế hoặc tư vấn viên về lạm dụng chất gây nghiện càng sớm càng tốt.</p><p>Tìm kiếm sự hỗ trợ từ gia đình và bạn bè.</p><p>Xem xét các chương trình điều trị chuyên nghiệp.</p>';
            riskClass = 'high-risk';
        }
        
        // Cập nhật nội dung kết quả
        resultMessageElement.innerHTML = resultMessage;
        resultMessageElement.className = 'result-message ' + riskClass;
        recommendationsElement.innerHTML = recommendations;
    }
});