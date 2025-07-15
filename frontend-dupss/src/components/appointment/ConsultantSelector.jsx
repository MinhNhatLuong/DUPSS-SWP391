import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  Avatar,
  CircularProgress,
  TextField,
  InputAdornment,
  Divider,
  Chip
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format, addDays, subDays, isValid, isSameDay, isAfter, isBefore, parse } from 'date-fns';
import { API_URL } from '../../services/config';

const ConsultantSelector = ({ onSlotSelect }) => {
  const [consultants, setConsultants] = useState([]);
  const [consultantDates, setConsultantDates] = useState({});
  const [slotsMap, setSlotsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch consultants when component mounts
  useEffect(() => {
    fetchConsultants();
  }, []);

  // Initialize dates and fetch slots when consultants are loaded
  useEffect(() => {
    if (consultants.length > 0) {
      // Check if current time is past 5:00 PM
      const now = new Date();
      const isPastFivePM = now.getHours() >= 17;
      
      // If it's past 5:00 PM, use tomorrow's date as default
      const defaultDate = isPastFivePM ? addDays(now, 1) : now;
      const formattedDefaultDate = format(defaultDate, 'dd/MM/yyyy');
      
      // Initialize dates for all consultants
      const initialDates = {};
      consultants.forEach(consultant => {
        initialDates[consultant.id] = formattedDefaultDate;
      });
      setConsultantDates(initialDates);
      
      // Initial fetch of slots for all consultants
      const consultantIds = consultants.map(c => c.id);
      fetchSlotsForConsultants(consultantIds, initialDates);
    }
  }, [consultants]);

  const fetchConsultants = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/public/consultants/available`);
      setConsultants(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching consultants:', err);
      setError('Không thể tải danh sách tư vấn viên. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSlotsForConsultants = async (consultantIds, dateMap) => {
    const newSlotsMap = { ...slotsMap };
    
    for (const consultantId of consultantIds) {
      try {
        const date = dateMap[consultantId];
        // URL encode the date parameter
        const encodedDate = encodeURIComponent(date);
        const response = await axios.get(`${API_URL}/public/slots/consultant/${consultantId}?date=${encodedDate}`);
        newSlotsMap[consultantId] = response.data || [];
      } catch (err) {
        console.error(`Error fetching slots for consultant ${consultantId}:`, err);
        newSlotsMap[consultantId] = [];
      }
    }
    
    setSlotsMap(newSlotsMap);
  };

  const handleDateChange = (consultantId, e) => {
    const newDate = e.target.value;
    // Validate and format date
    try {
      const dateObj = new Date(newDate);
      if (isValid(dateObj)) {
        const formattedDate = format(dateObj, 'dd/MM/yyyy');
        
        // Update only the specific consultant's date
        setConsultantDates(prev => {
          const updated = { 
            ...prev, 
            [consultantId]: formattedDate 
          };
          
          // Fetch slots for this consultant with the new date
          fetchSlotsForConsultants([consultantId], updated);
          
          return updated;
        });
      }
    } catch (err) {
      console.error('Invalid date format:', err);
    }
  };

  const handlePreviousDay = (consultantId) => {
    try {
      // Parse the current date for this consultant
      const currentDate = consultantDates[consultantId];
      const [day, month, year] = currentDate.split('/').map(Number);
      const dateObj = new Date(year, month - 1, day); // month is 0-indexed in JS Date
      
      // Get today's date (without time)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if current date is already today or before today
      if (!isAfter(dateObj, today)) {
        return; // Do nothing if current date is today or earlier
      }
      
      // Subtract one day
      const previousDay = subDays(dateObj, 1);
      
      // Format back to dd/MM/yyyy
      const formattedDate = format(previousDay, 'dd/MM/yyyy');
      
      // Update only this consultant's date
      setConsultantDates(prev => {
        const updated = { 
          ...prev, 
          [consultantId]: formattedDate 
        };
        
        // Fetch slots for this consultant with the new date
        fetchSlotsForConsultants([consultantId], updated);
        
        return updated;
      });
    } catch (err) {
      console.error('Error calculating previous day:', err);
    }
  };

  const handleNextDay = (consultantId) => {
    try {
      // Parse the current date for this consultant
      const currentDate = consultantDates[consultantId];
      const [day, month, year] = currentDate.split('/').map(Number);
      const dateObj = new Date(year, month - 1, day); // month is 0-indexed in JS Date
      
      // Add one day
      const nextDay = addDays(dateObj, 1);
      
      // Format back to dd/MM/yyyy
      const formattedDate = format(nextDay, 'dd/MM/yyyy');
      
      // Update only this consultant's date
      setConsultantDates(prev => {
        const updated = { 
          ...prev, 
          [consultantId]: formattedDate 
        };
        
        // Fetch slots for this consultant with the new date
        fetchSlotsForConsultants([consultantId], updated);
        
        return updated;
      });
    } catch (err) {
      console.error('Error calculating next day:', err);
    }
  };

  // Function to check if date is today or earlier
  const isPreviousButtonDisabled = (consultantId) => {
    try {
      if (!consultantDates[consultantId]) return false;
      
      const currentDate = consultantDates[consultantId];
      const [day, month, year] = currentDate.split('/').map(Number);
      const dateObj = new Date(year, month - 1, day);
      
      const now = new Date();
      // Check if current time is past 5:00 PM
      const isPastFivePM = now.getHours() >= 17;
      
      // Set minimum allowed date based on time
      let minAllowedDate;
      if (isPastFivePM) {
        // If it's past 5:00 PM, minimum allowed date is tomorrow
        minAllowedDate = addDays(new Date(), 1);
      } else {
        // Otherwise, minimum allowed date is today
        minAllowedDate = new Date();
      }
      
      // Reset hours to ensure clean date comparison
      minAllowedDate.setHours(0, 0, 0, 0);
      
      // Return true (disabled) if date is minimum allowed date or earlier
      return !isAfter(dateObj, minAllowedDate);
    } catch (err) {
      console.error('Error checking date:', err);
      return false;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          onClick={fetchConsultants} 
          sx={{ mt: 2 }}
        >
          Thử lại
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ mb: 4, width: '100%' }}>      
      <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
        {consultants.map((consultant) => (
          <Grid item xs={12} md={12} key={consultant.id} sx={{ width: '100%', p: '12px' }}>
            <Card sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              width: '100%'
            }}>
              {/* Left side - Consultant Info */}
              <Box sx={{ 
                width: { xs: '100%', md: '40%' }, 
                display: 'flex', 
                flexDirection: 'column',
                p: 2,
                bgcolor: '#f5f7f9',
                borderRight: { xs: 'none', md: '1px solid #e0e0e0' },
                borderBottom: { xs: '1px solid #e0e0e0', md: 'none' },
                overflowY: 'auto',
                height: { xs: 'auto', md: '400px' }
              }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={consultant.avatar} 
                    alt={consultant.consultantName}
                    sx={{ width: 120, height: 120, mb: 2 }}
                  />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600, textAlign: 'center', color: '#0056b3' }}>
                    {consultant.consultantName}
                  </Typography>
                </Box>
                <Typography variant="body2" color="#000000" sx={{textAlign: 'justify'}}>
                  {consultant.bio}
                </Typography>
              </Box>
              
              {/* Right side - Availability */}
              <Box sx={{ 
                width: { xs: '100%', md: '60%' }, 
                display: 'flex', 
                flexDirection: 'column',
                p: 2
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 2,
                  borderBottom: '1px solid #e0e0e0',
                  pb: 1
                }}>
                  <Button 
                    size="small" 
                    onClick={() => handlePreviousDay(consultant.id)}
                    sx={{ minWidth: 'auto', px: 1 }}
                    disabled={isPreviousButtonDisabled(consultant.id)}
                  >
                    &lt;
                  </Button>
                  
                  <TextField
                    type="date"
                    value={consultantDates[consultant.id] ? 
                      format(new Date(consultantDates[consultant.id].split('/').reverse().join('-')), 'yyyy-MM-dd') : 
                      format(new Date(), 'yyyy-MM-dd')
                    }
                    onChange={(e) => handleDateChange(consultant.id, e)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      inputProps: {
                        min: format(new Date(), 'yyyy-MM-dd') // Prevent selecting past dates
                      }
                    }}
                    sx={{ width: '180px' }}
                  />
                  
                  <Button 
                    size="small" 
                    onClick={() => handleNextDay(consultant.id)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    &gt;
                  </Button>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom sx={{fontWeight: 600}}>
                  Các khung giờ sẵn có:
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1, 
                  mt: 1,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {slotsMap[consultant.id] && slotsMap[consultant.id].length > 0 ? (
                    slotsMap[consultant.id].map((slot) => (
                      <Button
                        key={slot.id}
                        variant="outlined"
                        size="small"
                        onClick={() => onSlotSelect(slot)}
                        startIcon={<AccessTimeIcon />}
                        sx={{ 
                          borderRadius: '20px',
                          px: 2,
                          py: 0.5,
                          mb: 1,
                          borderColor: '#3f8dda',
                          color: '#1976d2',
                          '&:hover': {
                            bgcolor: '#e8f3ff',
                            borderColor: '#1976d2'
                          }
                        }}
                      >
                        {slot.startTime} - {slot.endTime}
                      </Button>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center', py: 2 }}>
                      Không có lịch trống vào ngày này
                    </Typography>
                  )}
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ConsultantSelector;