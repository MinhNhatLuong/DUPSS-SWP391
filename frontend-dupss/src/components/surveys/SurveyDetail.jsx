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
import { isAuthenticated } from '../../services/authService';
import { showSuccessAlert, showErrorAlert } from '../../components/common/AlertNotification';

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
    // Get survey details based on id
    const fetchSurveyData = async () => {
      setLoading(true);
      
      try {
        const surveyData = await fetchSurveyById(id);
        setSurvey(surveyData);
      } catch (error) {
        console.error('Error fetching survey:', error);
        navigate('/surveys'); // If survey not found, return to listing page
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
    
    // Check if user has answered all questions in the current section
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
      // Scroll to top after changing section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      calculateResult();
      setShowResult(true);
      // Scroll to top after showing results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      // Scroll to top after going back to previous section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const calculateResult = () => {
    // Calculate total score from all answers
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Calculate total score and maximum possible score
    survey.survey.section.forEach(section => {
      section.questions.forEach(question => {
        // Find the highest score value from the options
        const maxOptionScore = Math.max(...question.options.map(opt => opt.value));
        maxPossibleScore += maxOptionScore;
      });
    });

    // Calculate total score achieved by the user
    Object.values(answers).forEach(sectionAnswers => {
      Object.values(sectionAnswers).forEach(value => {
        totalScore += value;
      });
    });

    // Find result message based on score
    let resultMessage = null;
    
    // Check conditions
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
      // Check if user is authenticated
      if (!isAuthenticated()) {
        // Save current location to return after login
        sessionStorage.setItem('redirectAfterLogin', `/surveys/${id}`);
        navigate('/login');
        return;
      }
      
      // Extract selected option IDs
      const selectedOptionIds = [];
      
      // Log survey structure for debugging
      console.log('Survey structure:', JSON.stringify(survey, null, 2));
      console.log('User answers:', JSON.stringify(answers, null, 2));
      
      // SIMPLIFIED APPROACH: Collect option IDs directly from answers
      let foundOptionIds = false;
      
      // Process answers to find selected options
      Object.entries(answers).forEach(([sectionName, sectionAnswers]) => {
        const sectionIndex = survey.survey.section.findIndex(s => s.sectionName === sectionName);
        
        if (sectionIndex !== -1) {
          Object.entries(sectionAnswers).forEach(([questionIndex, selectedValue]) => {
            const qIndex = parseInt(questionIndex);
            const question = survey.survey.section[sectionIndex].questions[qIndex];
            
            if (question) {
              // Find the option with matching value
              const option = question.options.find(opt => opt.value === parseInt(selectedValue));
              
              if (option) {
                if (option.id) {
                  // If option has ID, use it
                  console.log(`Found option with ID: ${option.id}`);
                  selectedOptionIds.push(option.id);
                  foundOptionIds = true;
                } else {
                  // If option doesn't have ID, we need to generate a fallback ID
                  // This might be needed if the API response structure is different
                  console.log('Option does not have ID, using index-based approach');
                  
                  // Find the option index
                  const optionIndex = question.options.findIndex(o => o.value === parseInt(selectedValue));
                  
                  if (optionIndex !== -1) {
                    // Create a map of all answers with their indices for API
                    console.log(`Using option index: ${optionIndex} for section ${sectionIndex}, question ${qIndex}`);
                    
                    // Store option information for fallback approach
                    selectedOptionIds.push({
                      sectionIndex: sectionIndex,
                      questionIndex: qIndex,
                      optionIndex: optionIndex
                    });
                  }
                }
              } else {
                console.log(`No option found with value ${selectedValue} in question:`, question);
              }
            }
          });
        }
      });
      
      console.log('Final selectedOptionIds:', selectedOptionIds);
      
      // If no option IDs were found, throw error
      if (selectedOptionIds.length === 0) {
        console.error('Failed to extract option IDs from the survey responses.');
        throw new Error('Lưu thất bại, không thể xác định các lựa chọn.');
      }
      
      // If we have object-style option IDs (fallback approach), convert to appropriate format
      if (!foundOptionIds) {
        console.log('Using fallback approach for option IDs');
        // This format depends on what your API expects when IDs are not available
        // You might need to adjust this based on your backend requirements
      }
      
      // Submit the survey result
      await submitSurveyResult(id, selectedOptionIds);
      
      // Show success notification
      showSuccessAlert('Lưu khảo sát thành công');
      
      // Navigate back to surveys page
      navigate('/surveys');
    } catch (error) {
      console.error('Error submitting survey results:', error);
      
      // Check if this is an unauthorized error
      if (error.response && error.response.status === 401) {
        // Save current location to return after login
        sessionStorage.setItem('redirectAfterLogin', `/surveys/${id}`);
        showErrorAlert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Redirect to login
        navigate('/login');
      } else {
        // Show general error notification
        showErrorAlert('Lưu thất bại, xin thử lại sau!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToSurvey = () => {
    setShowResult(false);
    // Scroll to top after going back to survey
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{fontWeight: 'bold', color: '#0056b3'}}>
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
                sx={{fontWeight: 600}}
              >
                Quay lại
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{fontWeight: 600}}
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