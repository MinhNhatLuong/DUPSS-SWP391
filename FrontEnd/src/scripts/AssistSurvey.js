// Xử lý khảo sát ASSIST
document.addEventListener('DOMContentLoaded', function() {
    // Các phần của khảo sát
    const substanceSection = document.getElementById('substance-section');
    const assistQuestions = document.getElementById('assist-questions');
    const surveyResults = document.getElementById('survey-results');
    
    // Các nút điều hướng
    const substanceNextBtn = document.getElementById('substance-next');
    const prevQuestionBtn = document.getElementById('prev-question');
    const nextQuestionBtn = document.getElementById('next-question');
    const submitSurveyBtn = document.getElementById('submit-survey');
    
    // Các câu hỏi ASSIST
    const questions = document.querySelectorAll('.question-item');
    let currentQuestionIndex = 0;
    
    // Thanh tiến trình
    const progressBar = document.getElementById('survey-progress');
    const currentQuestionSpan = document.getElementById('current-question');
    const totalQuestionsSpan = document.getElementById('total-questions');
    
    // Kết quả
    const substanceScoresElement = document.getElementById('substance-scores');
    const resultMessageElement = document.getElementById('result-message');
    const recommendationsElement = document.getElementById('recommendations');
    
    // Danh sách các chất gây nghiện và tên hiển thị
    const substances = [
        { id: 'tobacco', name: 'Thuốc lá, thuốc lá điện tử' },
        { id: 'alcohol', name: 'Đồ uống có cồn' },
        { id: 'cannabis', name: 'Cần sa' },
        { id: 'cocaine', name: 'Cocaine' },
        { id: 'amphetamine', name: 'Amphetamine' },
        { id: 'hallucinogens', name: 'Chất gây ảo giác' },
        { id: 'sedatives', name: 'Thuốc an thần hoặc thuốc ngủ' },
        { id: 'inhalants', name: 'Chất gây ảo giác (ketamine, PCP...)' },
        { id: 'opioids', name: 'Opioids' }
    ];
    
    // Điểm số cho mỗi câu trả lời
    const scoreValues = {
        'never': 0,
        'once-twice': 2,
        'monthly': 3,
        'weekly': 4,
        'daily': 6
    };
    
    // Mức độ rủi ro dựa trên điểm số
    const riskLevels = {
        'alcohol': { low: 10, moderate: 26 },
        'other': { low: 3, moderate: 26 }
    };
    
    // Xử lý nút "Tiếp tục" ở phần sàng lọc ban đầu
    substanceNextBtn.addEventListener('click', function() {
        // Kiểm tra xem có chất gây nghiện nào được chọn không
        const selectedSubstances = [];
        
        substances.forEach(substance => {
            if (document.querySelector(`input[name="${substance.id}"]:checked`).value === 'yes') {
                selectedSubstances.push(substance);
            }
        });
        
        // Nếu không có chất gây nghiện nào được chọn, hiển thị kết quả ngay
        if (selectedSubstances.length === 0) {
            showResults([]);
            return;
        }
        
        // Tạo bảng tần suất cho các câu hỏi
        createFrequencyTables(selectedSubstances);
        
        // Chuyển sang phần câu hỏi ASSIST
        substanceSection.style.display = 'none';
        assistQuestions.style.display = 'block';
        showQuestion(0);
    });
    
    // Tạo bảng tần suất cho các câu hỏi
    function createFrequencyTables(selectedSubstances) {
        const frequencyTbody = document.getElementById('frequency-tbody');
        const cravingTbody = document.getElementById('craving-tbody');
        const problemsTbody = document.getElementById('problems-tbody');
        const failedTbody = document.getElementById('failed-tbody');
        const concernTbody = document.getElementById('concern-tbody');
        const controlTbody = document.getElementById('control-tbody');
        
        // Xóa nội dung cũ
        frequencyTbody.innerHTML = '';
        cravingTbody.innerHTML = '';
        problemsTbody.innerHTML = '';
        failedTbody.innerHTML = '';
        concernTbody.innerHTML = '';
        controlTbody.innerHTML = '';
        
        // Tạo hàng cho mỗi chất gây nghiện
        selectedSubstances.forEach(substance => {
            // Câu hỏi 1: Tần suất sử dụng
            const frequencyRow = createFrequencyRow(substance, 'q1');
            frequencyTbody.appendChild(frequencyRow);
            
            // Câu hỏi 2: Thèm muốn
            const cravingRow = createFrequencyRow(substance, 'q2');
            cravingTbody.appendChild(cravingRow);
            
            // Câu hỏi 3: Vấn đề sức khỏe, xã hội, pháp luật, tài chính
            const problemsRow = createFrequencyRow(substance, 'q3');
            problemsTbody.appendChild(problemsRow);
            
            // Câu hỏi 4: Không thể thực hiện trách nhiệm
            const failedRow = createFrequencyRow(substance, 'q4');
            failedTbody.appendChild(failedRow);
            
            // Câu hỏi 5: Lo lắng từ người khác
            const concernRow = createFrequencyRow(substance, 'q5');
            concernTbody.appendChild(concernRow);
            
            // Câu hỏi 6: Cố gắng kiểm soát, cắt giảm, ngừng sử dụng
            const controlRow = createFrequencyRow(substance, 'q6');
            controlTbody.appendChild(controlRow);
        });
    }
    
    // Tạo hàng cho bảng tần suất
    function createFrequencyRow(substance, questionPrefix) {
        const tr = document.createElement('tr');
        
        // Tên chất gây nghiện
        const tdName = document.createElement('td');
        tdName.textContent = substance.name;
        tr.appendChild(tdName);
        
        // Các tùy chọn tần suất
        const frequencies = ['never', 'once-twice', 'monthly', 'weekly', 'daily'];
        const labels = ['Không bao giờ', '1-2 lần', 'Hàng tháng', 'Hàng tuần', 'Hàng ngày/Gần như hàng ngày'];
        
        frequencies.forEach((freq, index) => {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `${questionPrefix}_${substance.id}`;
            input.value = freq;
            if (index === 0) input.checked = true;
            td.appendChild(input);
            tr.appendChild(td);
        });
        
        return tr;
    }
    
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
        progressBar.style.width = `${(index + 1) * (100 / questions.length)}%`;
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
        // Tính điểm ASSIST cho từng chất gây nghiện
        const scores = calculateScores();
        
        // Hiển thị kết quả
        showResults(scores);
    });
    
    // Tính điểm ASSIST cho từng chất gây nghiện
    function calculateScores() {
        const scores = [];
        
        substances.forEach(substance => {
            // Kiểm tra xem chất gây nghiện này có được chọn không
            if (document.querySelector(`input[name="${substance.id}"]:checked`).value === 'yes') {
                let score = 0;
                
                // Tính điểm cho câu hỏi 1-6
                for (let i = 1; i <= 6; i++) {
                    const selectedOption = document.querySelector(`input[name="q${i}_${substance.id}"]:checked`).value;
                    score += scoreValues[selectedOption];
                }
                
                // Thêm điểm cho câu hỏi 7 (tiêm chích)
                const injectionValue = document.querySelector('input[name="injection"]:checked').value;
                let injectionScore = 0;
                
                if (injectionValue === 'past') {
                    injectionScore = 2;
                } else if (injectionValue === 'recent') {
                    injectionScore = 4;
                }
                
                // Chỉ áp dụng điểm tiêm chích cho các chất có thể tiêm chích
                const injectableSubstances = ['cocaine', 'amphetamine', 'opioids'];
                if (injectableSubstances.includes(substance.id)) {
                    score += injectionScore;
                }
                
                // Xác định mức độ rủi ro
                let riskLevel;
                const thresholds = substance.id === 'alcohol' ? riskLevels.alcohol : riskLevels.other;
                
                if (score < thresholds.low) {
                    riskLevel = 'low';
                } else if (score < thresholds.moderate) {
                    riskLevel = 'moderate';
                } else {
                    riskLevel = 'high';
                }
                
                scores.push({
                    id: substance.id,
                    name: substance.name,
                    score: score,
                    riskLevel: riskLevel
                });
            }
        });
        
        return scores;
    }
    
    // Hiển thị kết quả khảo sát
    function showResults(scores) {
        // Ẩn các phần khảo sát
        substanceSection.style.display = 'none';
        assistQuestions.style.display = 'none';
        
        // Hiển thị phần kết quả
        surveyResults.style.display = 'block';
        
        // Nếu không có chất gây nghiện nào được chọn hoặc tất cả đều có nguy cơ thấp
        if (scores.length === 0) {
            substanceScoresElement.innerHTML = '<p>Bạn không báo cáo việc sử dụng bất kỳ chất gây nghiện nào.</p>';
            resultMessageElement.innerHTML = '<p><strong>Không có nguy cơ:</strong> Dựa trên câu trả lời của bạn, hiện tại bạn không có dấu hiệu sử dụng chất gây nghiện có vấn đề.</p>';
            resultMessageElement.className = 'result-message low-risk';
            recommendationsElement.innerHTML = '<p>Tiếp tục duy trì lối sống lành mạnh và tránh sử dụng các chất gây nghiện.</p><p>Tìm hiểu thêm về tác hại của các chất gây nghiện để phòng ngừa trong tương lai.</p>';
            return;
        }
        
        // Hiển thị điểm số cho từng chất gây nghiện
        let scoresHTML = '';
        let highestRiskLevel = 'low';
        
        scores.forEach(item => {
            // Cập nhật mức độ rủi ro cao nhất
            if (item.riskLevel === 'high' || (item.riskLevel === 'moderate' && highestRiskLevel === 'low')) {
                highestRiskLevel = item.riskLevel;
            }
            
            // Tạo HTML cho mỗi chất gây nghiện
            scoresHTML += `
                <div class="substance-score-item">
                    <h4>${item.name} <span class="risk-level ${item.riskLevel}">${getRiskLevelText(item.riskLevel)}</span></h4>
                    <div class="score-value ${item.riskLevel}-risk">${item.score}</div>
                    <span class="score-label">${getScoreLabel(item.score, item.id)}</span>
                </div>
            `;
        });
        
        substanceScoresElement.innerHTML = scoresHTML;
        
        // Đánh giá kết quả và hiển thị thông báo phù hợp
        let resultMessage = '';
        let recommendations = '';
        
        if (highestRiskLevel === 'low') {
            resultMessage = '<p><strong>Nguy cơ thấp:</strong> Dựa trên câu trả lời của bạn, hiện tại bạn có nguy cơ thấp gặp vấn đề liên quan đến việc sử dụng chất gây nghiện.</p>';
            recommendations = '<p>Tiếp tục theo dõi thói quen sử dụng chất gây nghiện của bạn.</p><p>Tìm hiểu thêm về tác hại của các chất gây nghiện đối với sức khỏe.</p><p>Cân nhắc giảm tần suất hoặc lượng sử dụng nếu có thể.</p>';
        } else if (highestRiskLevel === 'moderate') {
            resultMessage = '<p><strong>Nguy cơ trung bình:</strong> Bạn có một số dấu hiệu đáng lo ngại về việc sử dụng chất gây nghiện có vấn đề.</p>';
            recommendations = '<p>Nên tham khảo ý kiến của chuyên gia y tế để được đánh giá chi tiết hơn.</p><p>Xem xét các chiến lược để giảm hoặc ngừng sử dụng chất gây nghiện.</p><p>Tìm hiểu về các nguồn lực hỗ trợ trong cộng đồng.</p>';
        } else {
            resultMessage = '<p><strong>Nguy cơ cao:</strong> Bạn có nhiều dấu hiệu cho thấy việc sử dụng chất gây nghiện đang gây ra vấn đề nghiêm trọng.</p>';
            recommendations = '<p>Khuyến nghị mạnh mẽ bạn nên gặp chuyên gia y tế hoặc tư vấn viên về lạm dụng chất gây nghiện càng sớm càng tốt.</p><p>Tìm kiếm sự hỗ trợ từ gia đình và bạn bè.</p><p>Xem xét các chương trình điều trị chuyên nghiệp.</p>';
        }
        
        // Cập nhật nội dung kết quả
        resultMessageElement.innerHTML = resultMessage;
        resultMessageElement.className = 'result-message ' + highestRiskLevel + '-risk';
        recommendationsElement.innerHTML = recommendations;
    }
    
    // Lấy nhãn mức độ rủi ro
    function getRiskLevelText(level) {
        switch (level) {
            case 'low': return 'Thấp';
            case 'moderate': return 'Trung bình';
            case 'high': return 'Cao';
            default: return '';
        }
    }
    
    // Lấy nhãn cho điểm số
    function getScoreLabel(score, substanceId) {
        const thresholds = substanceId === 'alcohol' ? riskLevels.alcohol : riskLevels.other;
        
        if (score < thresholds.low) {
            return 'Nguy cơ thấp';
        } else if (score < thresholds.moderate) {
            return 'Nguy cơ trung bình';
        } else {
            return 'Nguy cơ cao';
        }
    }
});