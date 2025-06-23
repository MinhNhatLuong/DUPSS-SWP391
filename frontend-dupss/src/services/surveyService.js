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
    
    // Sắp xếp các điều kiện để đảm bảo đánh giá chính xác
    let sortedConditions = [];
    
    if (data.conditions && Array.isArray(data.conditions)) {
      // Sắp xếp theo thứ tự ưu tiên: = trước, sau đó là >=, >, <=, <
      // Trong mỗi nhóm toán tử, sắp xếp >=, > theo thứ tự giảm dần của giá trị
      // và sắp xếp <=, < theo thứ tự tăng dần của giá trị
      
      // Nhóm điều kiện theo toán tử
      const equalConditions = data.conditions.filter(c => c.operator === '=');
      const gteConditions = data.conditions.filter(c => c.operator === '>=')
        .sort((a, b) => b.value - a.value); // Sắp xếp giảm dần
      const gtConditions = data.conditions.filter(c => c.operator === '>')
        .sort((a, b) => b.value - a.value); // Sắp xếp giảm dần
      const lteConditions = data.conditions.filter(c => c.operator === '<=')
        .sort((a, b) => a.value - b.value); // Sắp xếp tăng dần
      const ltConditions = data.conditions.filter(c => c.operator === '<')
        .sort((a, b) => a.value - b.value); // Sắp xếp tăng dần
      
      // Kết hợp các nhóm điều kiện theo thứ tự ưu tiên
      sortedConditions = [
        ...equalConditions,
        ...gteConditions,
        ...gtConditions,
        ...lteConditions,
        ...ltConditions
      ];
      
      console.log('Sorted conditions:', JSON.stringify(sortedConditions, null, 2));
    } else {
      sortedConditions = data.conditions || [];
    }
    
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
      conditions: sortedConditions
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