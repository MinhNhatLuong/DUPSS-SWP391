import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Collapse,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const CourseQuizResult = ({ 
  result, 
  onSubmit, 
  onRetake, 
  onGetCertificate, 
  submitting = false, 
  courseId,
  quiz,
  answers
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Determine if the quiz was passed based on the message
  const isPassed = result.message && result.message.includes('Chúc Mừng');
  
  // Get color based on result
  const getResultColor = () => {
    return isPassed ? '#4caf50' : '#f44336';
  };

  // Get background color based on result
  const getResultBgColor = () => {
    return isPassed ? 'rgba(200, 230, 201, 0.8)' : 'rgba(255, 205, 210, 0.8)';
  };

  // Get border color based on result
  const getResultBorderColor = () => {
    return isPassed ? '#4caf50' : '#f44336';
  };

  // Toggle answers collapse
  const handleToggleAnswers = () => {
    setExpanded(!expanded);
  };

  // Check if an option is correct (score = 1)
  const isCorrectOption = (option) => {
    return option.score === 1;
  };

  // Check if an option was selected by the user
  const isSelectedOption = (sectionName, questionIndex, optionId) => {
    return answers[sectionName] && 
           answers[sectionName][questionIndex] === optionId;
  };

  return (
    <Box sx={{ mt: 4 }}>
      {!result.totalScore && !result.score ? (
        // Show submit button if no result yet
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            size="large"
            sx={{fontWeight: 600}}
          >
            {submitting ? 'Đang gửi...' : 'Xem kết quả'}
          </Button>
        </Box>
      ) : (
        // Show result
        <>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              mb: 5 
            }}
          >
            <Box 
              sx={{ 
                width: 150, 
                height: 150, 
                borderRadius: '50%', 
                bgcolor: 'rgba(232, 244, 253, 0.8)', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#0071bc' 
                }}
              >
                {result.score}/{result.totalScore}
              </Typography>
            </Box>
          </Box>
          
          <Box 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              bgcolor: getResultBgColor(), 
              borderLeft: `8px solid ${getResultBorderColor()}`,
              mb: 4
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                color: getResultColor(),
                mb: 1
              }}
            >
              {result.message}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Thời gian nộp bài: {result.submittedAt}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            {isPassed ? (
              <Button
                variant="contained"
                color="success"
                onClick={onGetCertificate}
                size="large"
                sx={{fontWeight: 600}}
              >
                Nhận chứng chỉ
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={onRetake}
                size="large"
                sx={{fontWeight: 600}}
              >
                Làm lại bài
              </Button>
            )}
          </Box>

          {/* Answers Collapse */}
          <Box sx={{ mt: 4, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Box 
              sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: expanded ? '1px solid #e0e0e0' : 'none',
                cursor: 'pointer',
                bgcolor: '#f5f5f5'
              }}
              onClick={handleToggleAnswers}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Đáp án bài làm
              </Typography>
              <IconButton>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expanded}>
              <Box sx={{ p: 2 }}>
                {quiz.sections.map((section, sectionIndex) => (
                  <Box key={sectionIndex} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {section.sectionName}
                    </Typography>
                    <List>
                      {section.questions.map((question, questionIndex) => (
                        <ListItem 
                          key={questionIndex} 
                          sx={{ 
                            flexDirection: 'column', 
                            alignItems: 'flex-start',
                            mb: 2,
                            pb: 2,
                            borderBottom: '1px solid #eaeaea'
                          }}
                        >
                          <ListItemText 
                            primary={`${questionIndex + 1}. ${question.questionText}`}
                            primaryTypographyProps={{ fontWeight: 600 }}
                          />
                          <List sx={{ width: '100%' }}>
                            {question.options.map((option) => {
                              const isSelected = isSelectedOption(section.sectionName, questionIndex, option.id);
                              const isCorrect = isCorrectOption(option);
                              
                              // Determine if this option should be highlighted
                              let showHighlight = false;
                              let highlightColor = '';
                              
                              if (isPassed) {
                                // If passed, show all correct/incorrect answers
                                showHighlight = isCorrect || isSelected;
                                highlightColor = isCorrect ? '#4caf50' : '#f44336';
                              } else {
                                // If failed, only show the selected answer's correctness
                                showHighlight = isSelected;
                                highlightColor = isCorrect ? '#4caf50' : '#f44336';
                              }
                              
                              return (
                                <ListItem 
                                  key={option.id}
                                  sx={{ 
                                    py: 0.5,
                                    bgcolor: showHighlight ? `${highlightColor}20` : 'transparent',
                                    borderLeft: showHighlight ? `4px solid ${highlightColor}` : 'none',
                                    borderRadius: 1
                                  }}
                                >
                                  <ListItemText 
                                    primary={option.optionText}
                                    sx={{
                                      color: showHighlight ? highlightColor : 'inherit',
                                      fontWeight: isSelected ? 600 : 400
                                    }}
                                  />
                                </ListItem>
                              );
                            })}
                          </List>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CourseQuizResult; 