import React from 'react';
import { Box, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const SurveyQuestion = ({ question, questionIndex, value, onChange }) => {
  return (
    <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #eaeaea' }}>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" sx={{ mb: 1 }}>
          <Typography variant="h6">
            {questionIndex + 1}. {question.question}
          </Typography>
        </FormLabel>
        <RadioGroup
          value={value?.toString() || ''}
          onChange={(e) => onChange(questionIndex, e.target.value)}
        >
          {question.options.map((option, optionIndex) => (
            <FormControlLabel
              key={optionIndex}
              value={option.value.toString()}
              control={<Radio />}
              label={option.option}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default SurveyQuestion; 