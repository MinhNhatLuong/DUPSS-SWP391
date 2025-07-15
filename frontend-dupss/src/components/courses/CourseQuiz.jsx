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
  CircularProgress,
  Alert
} from '@mui/material';
import api from '../../services/authService';
import { isAuthenticated, getUserData } from '../../services/authService';
import { showSuccessAlert, showErrorAlert } from '../common/AlertNotification';
import CourseQuizQuestion from './CourseQuizQuestion';
import CourseQuizResult from './CourseQuizResult';

const CourseQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Get course quiz data based on id
    const fetchCourseData = async () => {
      setLoading(true);
      
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          navigate('/login', { 
            state: { 
              message: 'Vui lòng đăng nhập để làm bài kiểm tra khóa học.',
              redirectTo: `/courses/${id}/quiz`
            }
          });
          return;
        }

        const response = await api.get(`/courses/detail/${id}`);
        console.log('Course data response:', response.data);
        console.log('Quiz structure:', response.data.quiz);
        setCourseData(response.data);
      } catch (error) {
        console.error('Error fetching course quiz data:', error);
        navigate(`/courses/${id}`, { 
          state: {
            showAlert: true,
            alertMessage: 'Có lỗi xảy ra khi tải bài kiểm tra. Vui lòng thử lại sau!',
            alertSeverity: 'error'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, navigate]);

  const handleAnswerChange = (questionIndex, optionId) => {
    const sectionName = courseData.quiz.sections[activeSection].sectionName;
    setAnswers({
      ...answers,
      [sectionName]: {
        ...answers[sectionName],
        [questionIndex]: parseInt(optionId)
      }
    });
  };

  const handleNext = () => {
    const currentSection = courseData.quiz.sections[activeSection];
    
    // Check if user has answered all questions in the current section
    const answeredAll = currentSection.questions.every((_, index) => {
      const sectionName = currentSection.sectionName;
      return answers[sectionName] && answers[sectionName][index] !== undefined;
    });
    
    if (!answeredAll) {
      showErrorAlert('Vui lòng trả lời tất cả các câu hỏi');
      return;
    }
    
    if (activeSection < courseData.quiz.sections.length - 1) {
      setActiveSection(activeSection + 1);
      // Scroll to top after changing section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Nếu đây là section cuối cùng, gửi kết quả ngay lập tức thay vì chỉ hiển thị showResult
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      // Scroll to top after going back to previous section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Extract selected option IDs from answers
  const extractSelectedOptionIds = () => {
    const selectedOptionIds = [];
    
    // Log toàn bộ câu trả lời để debug
    console.log('All answers:', answers);
    
    Object.entries(answers).forEach(([sectionName, sectionAnswers]) => {
      const sectionIndex = courseData.quiz.sections.findIndex(s => s.sectionName === sectionName);
      
      if (sectionIndex !== -1) {
        const section = courseData.quiz.sections[sectionIndex];
        
        Object.entries(sectionAnswers).forEach(([questionIndex, selectedOptionId]) => {
          const qIndex = parseInt(questionIndex);
          
          // Kiểm tra xem có câu hỏi tương ứng không
          if (section.questions[qIndex]) {
            // Tìm option tương ứng với ID được chọn
            const question = section.questions[qIndex];
            const selectedOption = question.options.find(opt => opt.id === parseInt(selectedOptionId));
            
            if (selectedOption) {
              console.log(`Found option: ${selectedOption.id} for question ${qIndex}`);
              selectedOptionIds.push(selectedOption.id);
            } else {
              console.log(`Option with ID ${selectedOptionId} not found, using as is`);
              selectedOptionIds.push(parseInt(selectedOptionId));
            }
          }
        });
      }
    });
    
    console.log('Extracted option IDs:', selectedOptionIds);
    return selectedOptionIds;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        navigate('/login', { 
          state: { 
            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
            redirectTo: `/courses/${id}/quiz`
          }
        });
        return;
      }
      
      // Extract selected option IDs
      const selectedOptionIds = extractSelectedOptionIds();
      
      // Kiểm tra và tìm surveyId từ nhiều vị trí có thể có
      let surveyId = null;
      
      if (courseData.quiz) {
        // Log toàn bộ cấu trúc quiz để debug
        console.log('Full quiz object:', courseData.quiz);
        
        // Thử các vị trí khác nhau có thể chứa ID
        if (courseData.quiz.id !== null && courseData.quiz.id !== undefined) {
          surveyId = courseData.quiz.id;
        } else if (courseData.quiz.surveyId) {
          surveyId = courseData.quiz.surveyId;
        } else if (courseData.quizId) {
          surveyId = courseData.quizId;
        } else {
          // Nếu không tìm thấy ID rõ ràng, thử dùng ID của khóa học
          surveyId = parseInt(id);
        }
      }
      
      console.log('Determined Quiz ID:', surveyId);
      
      if (surveyId === null) {
        console.error('Quiz ID is null');
        showErrorAlert('Không thể xác định ID bài kiểm tra. Vui lòng thử lại sau!');
        return;
      }
      
      // Debug log
      console.log('Submitting quiz with data:', {
        surveyId: surveyId,
        selectedOptionIds: selectedOptionIds
      });
      
      // Tạo payload theo đúng định dạng API yêu cầu - chính xác theo yêu cầu ban đầu
      const payload = {
        selectedOptionIds: selectedOptionIds
      };
      
      // Thêm surveyId nếu có
      if (surveyId !== null) {
        payload.surveyId = surveyId;
      }
      
      console.log('Final payload:', payload);
      
      // Submit the quiz result
      // URL API theo đúng mô tả ban đầu
      const apiUrl = `/courses/${id}/quiz/submit`;
      console.log('API URL:', apiUrl);
      
      const response = await api.post(apiUrl, payload);
      
      // Debug log
      console.log('Quiz submission response:', response.data);
      
      // Set result from response
      setResult(response.data);
      
      // Show result after submission
      setShowResult(true);
      
      // Scroll to top after showing results
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Show success notification
      showSuccessAlert('Đã nộp bài kiểm tra thành công');
    } catch (error) {
      console.error('Error submitting quiz results:', error);
      
      // Check if this is an unauthorized error
      if (error.response && error.response.status === 401) {
        showErrorAlert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login', { 
          state: { 
            redirectTo: `/courses/${id}/quiz`
          }
        });
      } else {
        // Show detailed error information
        console.error('Error details:', error.response?.data || error.message);
        
        // Show general error notification
        showErrorAlert('Nộp bài thất bại, xin thử lại sau!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    navigate(`/courses/${id}/quiz`);
    window.location.reload();
  };

  const handleGetCertificate = () => {
    // Lấy userId từ token JWT thông qua hàm getUserData
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const userInfo = getUserData() || {};
    
    console.log('User data from localStorage:', userData);
    console.log('User info from JWT:', userInfo);
    
    const userId = userInfo.id || userData.id;
    
    if (!userId) {
      showErrorAlert('Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại!');
      return;
    }
    
    console.log('Final User ID for certificate:', userId);
    
    // Chuyển hướng đến trang chứng chỉ với định dạng đường dẫn đúng
    navigate(`/courses/${id}/cert/${userId}`);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!courseData || !courseData.quiz) {
    return (
      <Container>
        <Typography variant="h5">Không tìm thấy bài kiểm tra cho khóa học này</Typography>
        <Button variant="contained" onClick={() => navigate(`/courses/${id}`)}>
          Quay lại khóa học
        </Button>
      </Container>
    );
  }

  // Get the required score from conditions
  const getRequiredScore = () => {
    if (courseData.quiz.conditions && courseData.quiz.conditions.length > 0) {
      const condition = courseData.quiz.conditions.find(c => c.operator === '>=');
      return condition ? condition.value : null;
    }
    return null;
  };

  const requiredScore = getRequiredScore();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{fontWeight: 'bold', color: '#0056b3'}}>
          {courseData.quiz.title || `Bài kiểm tra khóa học: ${courseData.title}`}
        </Typography>

        {requiredScore && !showResult && !result && (
          <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body1">
              Hoàn thành bài kiểm tra với số câu đúng từ {requiredScore} trở lên, bạn sẽ hoàn thành khóa học
            </Typography>
          </Alert>
        )}

        {!showResult && !result ? (
          <>
            <Stepper activeStep={activeSection} sx={{ my: 4 }}>
              {courseData.quiz.sections.map((section, index) => (
                <Step key={index}>
                  <StepLabel>{section.sectionName}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ my: 3 }}>
              <Typography variant="h5" gutterBottom>
                {courseData.quiz.sections[activeSection].sectionName}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {courseData.quiz.sections[activeSection].questions.map((question, qIndex) => (
                <CourseQuizQuestion 
                  key={qIndex}
                  question={question}
                  questionIndex={qIndex}
                  value={
                    answers[courseData.quiz.sections[activeSection].sectionName] &&
                    answers[courseData.quiz.sections[activeSection].sectionName][qIndex]
                  }
                  onChange={handleAnswerChange}
                />
              ))}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              flexDirection: 'row', 
              mt: 4, 
              gap: 2,
              width: '100%' 
            }}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={activeSection === 0}
                sx={{fontWeight: 600, flex: 1}}
              >
                QUAY LẠI
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{fontWeight: 600, flex: 1}}
              >
                {activeSection < courseData.quiz.sections.length - 1 ? 'TIẾP THEO' : 'XEM KẾT QUẢ'}
              </Button>
            </Box>
          </>
        ) : (
          <CourseQuizResult 
            result={result || {}} 
            onSubmit={handleSubmit}
            onRetake={handleRetake}
            onGetCertificate={handleGetCertificate}
            submitting={submitting}
            courseId={id}
            quiz={courseData.quiz}
            answers={answers}
          />
        )}
      </Paper>
    </Container>
  );
};

export default CourseQuiz; 