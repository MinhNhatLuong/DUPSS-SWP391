import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Stepper, 
  Step, 
  StepLabel, 
  Divider, 
  CircularProgress
} from '@mui/material';
import SurveyQuestion from './SurveyQuestion';
import SurveyResult from './SurveyResult';
import { fetchSurveyById, submitSurveyResult } from '../../services/surveyService';

const SurveyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Lấy chi tiết khảo sát dựa vào id
    const fetchSurveyData = async () => {
      setLoading(true);
      
      try {
        const surveyData = await fetchSurveyById(id);
        setSurvey(surveyData);
      } catch (error) {
        console.error('Error fetching survey:', error);
        navigate('/surveys'); // Nếu không tìm thấy khảo sát, quay lại trang danh sách
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [id, navigate]);

  const handleAnswerChange = (questionIndex, value) => {
    const sectionName = survey.survey.section[activeSection].sectionName;
    setAnswers({
      ...answers,
      [sectionName]: {
        ...answers[sectionName],
        [questionIndex]: parseInt(value)
      }
    });
  };

  const handleNext = () => {
    const currentSection = survey.survey.section[activeSection];
    
    // Kiểm tra xem người dùng đã trả lời hết câu hỏi trong section hiện tại chưa
    const answeredAll = currentSection.questions.every((_, index) => {
      const sectionName = currentSection.sectionName;
      return answers[sectionName] && answers[sectionName][index] !== undefined;
    });
    
    if (!answeredAll) {
      alert('Vui lòng trả lời tất cả các câu hỏi');
      return;
    }
    
    if (activeSection < survey.survey.section.length - 1) {
      setActiveSection(activeSection + 1);
    } else {
      calculateResult();
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };

  const calculateResult = () => {
    // Tính tổng điểm từ tất cả các câu trả lời
    let totalScore = 0;

    Object.values(answers).forEach(sectionAnswers => {
      Object.values(sectionAnswers).forEach(value => {
        totalScore += value;
      });
    });

    // Tìm thông báo kết quả dựa trên điểm số
    let resultMessage = null;
    
    // Kiểm tra các điều kiện
    for (const condition of survey.conditions) {
      if (condition.operator === '=') {
        if (totalScore === condition.value) {
          resultMessage = condition;
          break;
        }
      } else if (condition.operator === '<=') {
        if (totalScore <= condition.value) {
          resultMessage = condition;
          break;
        }
      } else if (condition.operator === '>=') {
        if (totalScore >= condition.value) {
          resultMessage = condition;
          break;
        }
      } else if (condition.operator === '<') {
        if (totalScore < condition.value) {
          resultMessage = condition;
          break;
        }
      } else if (condition.operator === '>') {
        if (totalScore > condition.value) {
          resultMessage = condition;
          break;
        }
      }
    }

    setResult({
      score: totalScore,
      message: resultMessage ? resultMessage.message : 'Không thể xác định kết quả'
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Gửi kết quả lên server
      const response = await submitSurveyResult(id, answers, result);
      alert(response.message);
      navigate('/surveys');
    } catch (error) {
      console.error('Error submitting survey results:', error);
      alert('Đã xảy ra lỗi khi gửi kết quả. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToSurvey = () => {
    setShowResult(false);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!survey) {
    return (
      <Container>
        <Typography variant="h5">Không tìm thấy bài khảo sát</Typography>
        <Button variant="contained" onClick={() => navigate('/surveys')}>
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {survey.title}
        </Typography>

        {!showResult ? (
          <>
            <Stepper activeStep={activeSection} sx={{ my: 4 }}>
              {survey.survey.section.map((section, index) => (
                <Step key={index}>
                  <StepLabel>{section.sectionName}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ my: 3 }}>
              <Typography variant="h5" gutterBottom>
                {survey.survey.section[activeSection].sectionName}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {survey.survey.section[activeSection].questions.map((question, qIndex) => (
                <SurveyQuestion 
                  key={qIndex}
                  question={question}
                  questionIndex={qIndex}
                  value={
                    answers[survey.survey.section[activeSection].sectionName] &&
                    answers[survey.survey.section[activeSection].sectionName][qIndex]
                  }
                  onChange={handleAnswerChange}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={activeSection === 0}
              >
                Quay lại
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
              >
                {activeSection < survey.survey.section.length - 1 ? 'Tiếp theo' : 'Xem kết quả'}
              </Button>
            </Box>
          </>
        ) : (
          <SurveyResult 
            result={result}
            onSubmit={handleSubmit}
            onBack={handleBackToSurvey}
            submitting={submitting}
          />
        )}
      </Paper>
    </Container>
  );
};

// Dữ liệu giả cho khảo sát CRAFFT
const getCrafftData = () => {
  return {
    title: "CRAFFT Screening Test",
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
    title: "ASSIST Assessment",
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

export default SurveyDetail; 