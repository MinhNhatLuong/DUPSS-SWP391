// API để lấy danh sách khảo sát
export const fetchSurveys = async () => {
  try {
    // Gọi API thực tế
    const response = await fetch('http://localhost:8080/api/public/surveys/lastest');
    
    if (!response.ok) {
      throw new Error('Không thể tải danh sách khảo sát');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khảo sát:', error);
    throw error;
  }
};

// API để lấy chi tiết một khảo sát
export const fetchSurveyById = async (id) => {
  try {
    // Gọi API thực tế
    const response = await fetch(`http://localhost:8080/api/public/survey/${id}`);
    
    if (!response.ok) {
      throw new Error('Không thể tải chi tiết khảo sát');
    }
    
    const data = await response.json();
    
    // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc hiện tại
    return {
      title: data.title,
      survey: {
        section: data.sections.map(section => ({
          sectionName: section.sectionName,
          questions: section.questions.map(q => ({
            question: q.questionText,
            options: q.options.map(opt => ({
              option: opt.optionText,
              value: opt.score
            }))
          }))
        }))
      },
      conditions: data.conditions
    };
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết khảo sát:', error);
    throw error;
  }
};

// API giả để gửi kết quả khảo sát
export const submitSurveyResult = async (surveyId, answers, result) => {
  // Giả lập độ trễ API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Submitting to API:', { surveyId, answers, result });
  
  // Giả lập thành công
  return {
    success: true,
    message: 'Đã gửi kết quả khảo sát thành công!'
  };
}; 