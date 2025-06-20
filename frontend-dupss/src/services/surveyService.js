import api from './apiService';

// API để lấy danh sách khảo sát
export const fetchSurveys = async () => {
  try {
    return await api.publicGet('/surveys/lastest');
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khảo sát:', error);
    throw error;
  }
};

// API để lấy chi tiết một khảo sát
export const fetchSurveyById = async (id) => {
  try {
    // Sử dụng api service để gọi API
    const data = await api.publicGet(`/survey/${id}`);
    
    // Log API response để debug
    console.log('API response for survey:', JSON.stringify(data, null, 2));
    
    // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc hiện tại
    const transformedData = {
      title: data.title,
      survey: {
        section: data.sections.map(section => ({
          sectionName: section.sectionName,
          questions: section.questions.map(q => ({
            question: q.questionText,
            options: q.options.map(opt => ({
              option: opt.optionText,
              value: opt.score,
              id: opt.id // Đảm bảo rằng chúng ta đang giữ lại ID của option
            }))
          }))
        }))
      },
      conditions: data.conditions
    };
    
    console.log('Transformed survey data:', JSON.stringify(transformedData, null, 2));
    
    return transformedData;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết khảo sát:', error);
    throw error;
  }
};

// API để gửi kết quả khảo sát
export const submitSurveyResult = async (surveyId, selectedOptionIds) => {
  try {
    // Đảm bảo surveyId là số nguyên
    const numericSurveyId = parseInt(surveyId);
    const payload = {
      surveyId: isNaN(numericSurveyId) ? surveyId : numericSurveyId,
      selectedOptionIds: selectedOptionIds
    };

    // Log request payload
    console.log('Request payload:', JSON.stringify(payload, null, 2));

    // Sử dụng api service để gọi API
    const response = await api.post('/survey/results', payload);

    console.log('Response:', response);

    return {
      success: true,
      message: 'Lưu khảo sát thành công'
    };
  } catch (error) {
    console.error('Lỗi khi gửi kết quả khảo sát:', error);
    throw new Error('Lưu thất bại, xin thử lại sau!');
  }
}; 