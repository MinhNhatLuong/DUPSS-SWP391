import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';

const CreateSurvey = () => {
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    category: '',
    questions: []
  });

  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSurvey(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenQuestionDialog = (question = null, index = -1) => {
    setCurrentQuestion(question || { 
      text: '', 
      type: 'single_choice', 
      options: [
        { text: 'Tùy chọn 1', value: 'option1' },
        { text: 'Tùy chọn 2', value: 'option2' }
      ],
      required: true
    });
    setQuestionIndex(index);
    setOpenQuestionDialog(true);
  };

  const handleCloseQuestionDialog = () => {
    setOpenQuestionDialog(false);
    setCurrentQuestion(null);
  };

  const handleSaveQuestion = () => {
    if (questionIndex === -1) {
      // Add new question
      setSurvey(prev => ({
        ...prev,
        questions: [...prev.questions, currentQuestion]
      }));
    } else {
      // Update existing question
      setSurvey(prev => {
        const updatedQuestions = [...prev.questions];
        updatedQuestions[questionIndex] = currentQuestion;
        return { ...prev, questions: updatedQuestions };
      });
    }
    handleCloseQuestionDialog();
  };

  const handleDeleteQuestion = (index) => {
    setSurvey(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions.splice(index, 1);
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => {
      const updatedOptions = [...prev.options];
      updatedOptions[index] = { ...updatedOptions[index], text: value };
      return { ...prev, options: updatedOptions };
    });
  };

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [
        ...prev.options, 
        { text: `Tùy chọn ${prev.options.length + 1}`, value: `option${prev.options.length + 1}` }
      ]
    }));
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) {
      return; // Keep at least 2 options
    }
    setCurrentQuestion(prev => {
      const updatedOptions = [...prev.options];
      updatedOptions.splice(index, 1);
      return { ...prev, options: updatedOptions };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send the data to an API
    console.log('Survey to submit:', survey);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Khảo sát đã được tạo thành công!',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tạo Khảo Sát Mới
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Tiêu đề khảo sát"
                name="title"
                value={survey.title}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={survey.category}
                  name="category"
                  label="Danh mục"
                  onChange={handleChange}
                >
                  <MenuItem value="psychology">Tâm lý học</MenuItem>
                  <MenuItem value="feedback">Phản hồi</MenuItem>
                  <MenuItem value="health">Sức khỏe</MenuItem>
                  <MenuItem value="education">Giáo dục</MenuItem>
                  <MenuItem value="career">Nghề nghiệp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại khảo sát</InputLabel>
                <Select
                  value={survey.type || 'general'}
                  name="type"
                  label="Loại khảo sát"
                  onChange={handleChange}
                >
                  <MenuItem value="general">Khảo sát chung</MenuItem>
                  <MenuItem value="assessment">Đánh giá</MenuItem>
                  <MenuItem value="quiz">Bài kiểm tra</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Mô tả khảo sát"
                name="description"
                value={survey.description}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Câu hỏi
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <List>
                    {survey.questions.length === 0 ? (
                      <ListItem>
                        <ListItemText primary="Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên." />
                      </ListItem>
                    ) : (
                      survey.questions.map((question, index) => (
                        <React.Fragment key={index}>
                          <ListItem
                            secondaryAction={
                              <Box>
                                <IconButton 
                                  edge="end" 
                                  aria-label="edit"
                                  onClick={() => handleOpenQuestionDialog(question, index)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton 
                                  edge="end" 
                                  aria-label="delete"
                                  onClick={() => handleDeleteQuestion(index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            }
                          >
                            <DragIcon sx={{ mr: 2, color: 'text.secondary' }} />
                            <ListItemText 
                              primary={`${index + 1}. ${question.text}`} 
                              secondary={`${question.type === 'single_choice' ? 'Một lựa chọn' : 
                                          question.type === 'multiple_choice' ? 'Nhiều lựa chọn' : 
                                          'Văn bản'} - ${question.options ? question.options.length : 0} tùy chọn`} 
                            />
                          </ListItem>
                          {index < survey.questions.length - 1 && <Divider />}
                        </React.Fragment>
                      ))
                    )}
                  </List>
                </CardContent>
              </Card>
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenQuestionDialog()}
              >
                Thêm câu hỏi mới
              </Button>
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={survey.questions.length === 0 || !survey.title || !survey.description}
              >
                Lưu khảo sát
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Question Dialog */}
      <Dialog open={openQuestionDialog} onClose={handleCloseQuestionDialog} maxWidth="md" fullWidth>
        <CardHeader
          title={questionIndex === -1 ? 'Thêm Câu Hỏi Mới' : 'Chỉnh Sửa Câu Hỏi'}
          sx={{ pb: 0 }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Nội dung câu hỏi"
                name="text"
                value={currentQuestion?.text || ''}
                onChange={handleQuestionChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại câu hỏi</InputLabel>
                <Select
                  value={currentQuestion?.type || 'single_choice'}
                  name="type"
                  label="Loại câu hỏi"
                  onChange={handleQuestionChange}
                >
                  <MenuItem value="single_choice">Một lựa chọn</MenuItem>
                  <MenuItem value="multiple_choice">Nhiều lựa chọn</MenuItem>
                  <MenuItem value="text">Văn bản</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Bắt buộc
                </Typography>
                <RadioGroup 
                  row 
                  name="required"
                  value={currentQuestion?.required.toString() || "true"}
                  onChange={handleQuestionChange}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Có" />
                  <FormControlLabel value="false" control={<Radio />} label="Không" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            {(currentQuestion?.type === 'single_choice' || currentQuestion?.type === 'multiple_choice') && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Tùy chọn
                </Typography>
                {currentQuestion?.options?.map((option, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                    <Grid item xs={10}>
                      <TextField
                        fullWidth
                        label={`Tùy chọn ${index + 1}`}
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        aria-label="delete option"
                        onClick={() => removeOption(index)}
                        disabled={currentQuestion.options.length <= 2}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant="text"
                  startIcon={<AddIcon />}
                  onClick={addOption}
                  sx={{ mt: 1 }}
                >
                  Thêm tùy chọn
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button onClick={handleCloseQuestionDialog} sx={{ mr: 1 }}>
            Hủy
          </Button>
          <Button 
            onClick={handleSaveQuestion} 
            variant="contained"
            disabled={!currentQuestion?.text}
          >
            Lưu
          </Button>
        </Box>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateSurvey; 