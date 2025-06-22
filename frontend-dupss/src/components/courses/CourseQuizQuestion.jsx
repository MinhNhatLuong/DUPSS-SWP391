import React from 'react';
import { Box, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const CourseQuizQuestion = ({ question, questionIndex, value, onChange }) => {
  return (
    <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #eaeaea' }}>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" sx={{ mb: 1 }}>
          <Typography variant="h6">
            {questionIndex + 1}. {question.questionText}
          </Typography>
        </FormLabel>
        <RadioGroup
          value={value?.toString() || ''}
          onChange={(e) => onChange(questionIndex, e.target.value)}
        >
          {question.options.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id.toString()}
              control={<Radio />}
              label={option.optionText}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default CourseQuizQuestion; 