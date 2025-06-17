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
    let maxPossibleScore = 0;

    // Tính tổng điểm và điểm tối đa
    survey.survey.section.forEach(section => {
      section.questions.forEach(question => {
        // Tìm giá trị điểm cao nhất trong các lựa chọn
        const maxOptionScore = Math.max(...question.options.map(opt => opt.value));
        maxPossibleScore += maxOptionScore;
      });
    });

    // Tính tổng điểm người dùng đã đạt được
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
      maxScore: maxPossibleScore,
      message: resultMessage ? resultMessage.message : 'Không thể xác định kết quả',
      title: survey.title
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

export default SurveyDetail; 