// Dữ liệu giả cho khảo sát CRAFFT
const getCrafftData = () => {
  return {
    title: "Khảo sát CRAFFT",
    survey: {
      section: [
        {
          sectionName: "Phần A - Sàng lọc",
          questions: [
            {
              question: "Trong 12 tháng qua, bạn đã sử dụng rượu bia hay đồ uống có cồn bao nhiêu ngày?",
              options: [
                { option: "Không sử dụng", value: 0 },
                { option: "1-2 ngày", value: 1 },
                { option: "3-9 ngày", value: 2 },
                { option: "10 ngày trở lên", value: 3 }
              ]
            },
            {
              question: "Trong 12 tháng qua, bạn đã sử dụng cần sa (marijuana) bao nhiêu ngày?",
              options: [
                { option: "Không sử dụng", value: 0 },
                { option: "1-2 ngày", value: 1 },
                { option: "3-9 ngày", value: 2 },
                { option: "10 ngày trở lên", value: 3 }
              ]
            }
          ]
        },
        {
          sectionName: "Phần B - CRAFFT",
          questions: [
            {
              question: "C - Bạn có từng đi trên một CHIẾC XE do người đã sử dụng rượu bia hoặc ma túy điều khiển không?",
              options: [
                { option: "Có", value: 1 },
                { option: "Không", value: 0 }
              ]
            },
            {
              question: "R - Bạn có từng sử dụng rượu bia hoặc ma túy để GIẢI TỎA căng thẳng, cảm thấy thoải mái hơn hoặc hòa nhập với mọi người không?",
              options: [
                { option: "Có", value: 1 },
                { option: "Không", value: 0 }
              ]
            },
            {
              question: "A - Bạn có từng sử dụng rượu bia hoặc ma túy khi MỘT MÌNH không?",
              options: [
                { option: "Có", value: 1 },
                { option: "Không", value: 0 }
              ]
            },
            {
              question: "F - Bạn có từng QUÊN những việc đã làm khi sử dụng rượu bia hoặc ma túy không?",
              options: [
                { option: "Có", value: 1 },
                { option: "Không", value: 0 }
              ]
            }
          ]
        }
      ]
    },
    conditions: [
      {
        operator: "=",
        value: 0,
        message: "Không có dấu hiệu lạm dụng chất gây nghiện."
      },
      {
        operator: "<=",
        value: 1,
        message: "Nguy cơ thấp. Tiếp tục duy trì lối sống lành mạnh."
      },
      {
        operator: ">",
        value: 1,
        message: "Có dấu hiệu nguy cơ. Cần được tư vấn thêm từ chuyên gia y tế."
      },
      {
        operator: ">=",
        value: 4,
        message: "Nguy cơ cao về rối loạn sử dụng chất. Cần được đánh giá và can thiệp từ chuyên gia."
      }
    ]
  };
};

// Dữ liệu giả cho khảo sát ASSIST
const getAssistData = () => {
  return {
    title: "Khảo sát ASSIST",
    survey: {
      section: [
        {
          sectionName: "Sử dụng chất gây nghiện",
          questions: [
            {
              question: "Trong 3 tháng qua, bạn có sử dụng đồ uống có cồn với tần suất như thế nào?",
              options: [
                { option: "Không bao giờ", value: 0 },
                { option: "Một hoặc hai lần", value: 2 },
                { option: "Hàng tháng", value: 3 },
                { option: "Hàng tuần", value: 4 },
                { option: "Hàng ngày hoặc gần như hàng ngày", value: 6 }
              ]
            },
            {
              question: "Trong 3 tháng qua, bạn có sử dụng thuốc lá với tần suất như thế nào?",
              options: [
                { option: "Không bao giờ", value: 0 },
                { option: "Một hoặc hai lần", value: 2 },
                { option: "Hàng tháng", value: 3 },
                { option: "Hàng tuần", value: 4 },
                { option: "Hàng ngày hoặc gần như hàng ngày", value: 6 }
              ]
            }
          ]
        },
        {
          sectionName: "Mức độ rủi ro",
          questions: [
            {
              question: "Mức độ thèm muốn hoặc cảm thấy bắt buộc phải sử dụng rượu hoặc các chất khác của bạn là gì?",
              options: [
                { option: "Không bao giờ", value: 0 },
                { option: "Một hoặc hai lần", value: 3 },
                { option: "Hàng tháng", value: 4 },
                { option: "Hàng tuần", value: 5 },
                { option: "Hàng ngày hoặc gần như hàng ngày", value: 6 }
              ]
            },
            {
              question: "Việc sử dụng chất gây nghiện đã từng gây ra vấn đề về sức khỏe, xã hội, pháp lý hoặc tài chính cho bạn chưa?",
              options: [
                { option: "Không bao giờ", value: 0 },
                { option: "Một hoặc hai lần", value: 4 },
                { option: "Hàng tháng", value: 5 },
                { option: "Hàng tuần", value: 6 },
                { option: "Hàng ngày hoặc gần như hàng ngày", value: 7 }
              ]
            }
          ]
        }
      ]
    },
    conditions: [
      {
        operator: "<=",
        value: 3,
        message: "Nguy cơ thấp. Tiếp tục duy trì lối sống lành mạnh."
      },
      {
        operator: "<=",
        value: 10,
        message: "Nguy cơ trung bình. Nên cân nhắc giảm mức độ sử dụng."
      },
      {
        operator: "<=",
        value: 19,
        message: "Nguy cơ cao. Nên tìm kiếm sự tư vấn từ chuyên gia y tế."
      },
      {
        operator: ">",
        value: 19,
        message: "Nguy cơ rất cao. Cần được can thiệp ngay lập tức."
      }
    ]
  };
};

// Giả lập danh sách các khảo sát
const fakeSurveys = [
  {
    id: 'crafft',
    surveyTitle: 'Khảo sát CRAFFT',
    description: `
      <h3>Khảo sát CRAFFT là gì?</h3>
      <p>CRAFFT là một công cụ sàng lọc ngắn gọn, được thiết kế đặc biệt cho thanh thiếu niên và người trẻ (dưới 21 tuổi) để đánh giá việc sử dụng rượu, cần sa và các chất gây nghiện khác.</p>
      <p>Tên CRAFFT là từ viết tắt của các từ khóa chính trong bộ câu hỏi: Car (xe), Relax (thư giãn), Alone (một mình), Forget (quên), Friends (bạn bè), và Trouble (rắc rối).</p>
      
      <h3>Phù hợp cho ai?</h3>
      <ul style="list-style-type: none; padding-left: 0;">
        <li style="margin-bottom: 8px;">✓ Thanh thiếu niên và người trẻ từ 12-21 tuổi</li>
        <li style="margin-bottom: 8px;">✓ Học sinh, sinh viên trong môi trường giáo dục</li>
        <li style="margin-bottom: 8px;">✓ Những người muốn tự đánh giá nguy cơ liên quan đến việc sử dụng chất gây nghiện</li>
      </ul>
      
      <h3>Lợi ích của khảo sát</h3>
      <ul style="list-style-type: none; padding-left: 0;">
        <li style="margin-bottom: 8px;">✓ Phát hiện sớm các vấn đề tiềm ẩn liên quan đến sử dụng chất gây nghiện</li>
        <li style="margin-bottom: 8px;">✓ Đánh giá mức độ rủi ro và nhu cầu can thiệp</li>
        <li style="margin-bottom: 8px;">✓ Tạo cơ hội để thảo luận về các hành vi rủi ro với chuyên gia y tế</li>
      </ul>
    `,
    surveyImage: 'https://cdn.britannica.com/05/213705-050-4331A79A/drug-concept-drug-abuse-addition-heroin-injection-doping-opium-epidemic.jpg'
  },
  {
    id: 'assist',
    surveyTitle: 'Khảo sát ASSIST',
    description: `
      <h3>Khảo sát ASSIST là gì?</h3>
      <p>ASSIST (Alcohol, Smoking and Substance Involvement Screening Test) là công cụ sàng lọc được phát triển bởi Tổ chức Y tế Thế giới (WHO) để phát hiện và can thiệp sớm đối với việc sử dụng và các vấn đề liên quan đến rượu, thuốc lá và các chất ma túy khác.</p>
      <p>Khảo sát này đánh giá mức độ sử dụng và các vấn đề liên quan đến nhiều loại chất gây nghiện khác nhau, bao gồm rượu, thuốc lá, cần sa, cocaine, amphetamine, thuốc an thần, hallucinogens, ma túy đá và các chất khác.</p>
      
      <h3>Phù hợp cho ai?</h3>
      <ul style="list-style-type: none; padding-left: 0;">
        <li style="margin-bottom: 8px;">✓ Thanh thiếu niên và người trưởng thành ở mọi lứa tuổi</li>
        <li style="margin-bottom: 8px;">✓ Những người đang được tư vấn hoặc điều trị y tế</li>
        <li style="margin-bottom: 8px;">✓ Những người muốn đánh giá mức độ tiêu thụ chất gây nghiện của họ</li>
      </ul>
      
      <h3>Lợi ích của khảo sát</h3>
      <ul style="list-style-type: none; padding-left: 0;">
        <li style="margin-bottom: 8px;">✓ Đánh giá chi tiết mức độ sử dụng nhiều loại chất gây nghiện</li>
        <li style="margin-bottom: 8px;">✓ Xác định mức độ rủi ro theo từng loại chất</li>
        <li style="margin-bottom: 8px;">✓ Cung cấp hướng dẫn can thiệp phù hợp với mức độ rủi ro</li>
      </ul>
    `,
    surveyImage: 'https://c.files.bbci.co.uk/43c5/live/b71ad530-5b13-11ef-8f0f-0577398c3339.jpg'
  }
];

// API giả để lấy danh sách khảo sát
export const fetchSurveys = async () => {
  // Giả lập độ trễ API
  await new Promise(resolve => setTimeout(resolve, 500));
  return fakeSurveys;
};

// API giả để lấy chi tiết một khảo sát
export const fetchSurveyById = async (id) => {
  // Giả lập độ trễ API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (id === 'crafft') {
    return getCrafftData();
  } else if (id === 'assist') {
    return getAssistData();
  }
  
  throw new Error('Không tìm thấy khảo sát');
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