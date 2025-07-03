import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Container,
  Stack,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

const JoiningScreen = ({
  participantName,
  setParticipantName,
  meetingId,
  micOn,
  setMicOn,
  webcamOn,
  setWebcamOn,
  onClickStartMeeting,
  setCustomAudioStream,
  setCustomVideoStream
}) => {
  const [cameraDevices, setCameraDevices] = useState([]);
  const [microphoneDevices, setMicrophoneDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMicrophone, setSelectedMicrophone] = useState('');
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [nameError, setNameError] = useState('');
  
  const videoRef = useRef(null);
  const localVideoStream = useRef(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        setIsLoadingDevices(true);
        // Get permission to access camera and mic
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        // Get list of devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const cameras = devices.filter(device => device.kind === 'videoinput');
        const microphones = devices.filter(device => device.kind === 'audioinput');
        
        setCameraDevices(cameras);
        setMicrophoneDevices(microphones);
        
        // Set default selections
        if (cameras.length > 0) setSelectedCamera(cameras[0].deviceId);
        if (microphones.length > 0) setSelectedMicrophone(microphones[0].deviceId);
        
        setIsLoadingDevices(false);
        
        // Initialize video stream
        if (webcamOn) {
          initializeVideoStream(cameras[0]?.deviceId);
        }
      } catch (error) {
        console.error('Error getting media devices:', error);
        setIsLoadingDevices(false);
      }
    };
    
    getDevices();
    
    return () => {
      // Clean up
      if (localVideoStream.current) {
        localVideoStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Update video stream when webcam state changes
    if (webcamOn) {
      initializeVideoStream(selectedCamera);
    } else {
      if (localVideoStream.current) {
        localVideoStream.current.getTracks().forEach(track => track.stop());
        localVideoStream.current = null;
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    }
  }, [webcamOn, selectedCamera]);

  const initializeVideoStream = async (deviceId) => {
    try {
      // Stop any existing stream
      if (localVideoStream.current) {
        localVideoStream.current.getTracks().forEach(track => track.stop());
      }
      
      // Create new stream
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localVideoStream.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Update the custom video stream
      setCustomVideoStream(stream);
      
    } catch (error) {
      console.error('Error initializing video stream:', error);
      setWebcamOn(false);
    }
  };

  const toggleMic = async () => {
    if (micOn) {
      setMicOn(false);
      if (localVideoStream.current) {
        const audioTracks = localVideoStream.current.getAudioTracks();
        audioTracks.forEach(track => track.stop());
      }
    } else {
      try {
        const constraints = {
          audio: selectedMicrophone ? { deviceId: { exact: selectedMicrophone } } : true
        };
        
        const audioStream = await navigator.mediaDevices.getUserMedia(constraints);
        setCustomAudioStream(audioStream);
        setMicOn(true);
      } catch (error) {
        console.error('Error toggling microphone:', error);
      }
    }
  };

  const toggleWebcam = () => {
    setWebcamOn(!webcamOn);
  };

  const handleCameraChange = (event) => {
    setSelectedCamera(event.target.value);
    if (webcamOn) {
      initializeVideoStream(event.target.value);
    }
  };

  const handleMicrophoneChange = async (event) => {
    setSelectedMicrophone(event.target.value);
    if (micOn) {
      try {
        const constraints = {
          audio: { deviceId: { exact: event.target.value } }
        };
        
        const audioStream = await navigator.mediaDevices.getUserMedia(constraints);
        setCustomAudioStream(audioStream);
      } catch (error) {
        console.error('Error changing microphone:', error);
      }
    }
  };

  const handleNameChange = (e) => {
    setParticipantName(e.target.value);
    if (e.target.value.trim()) {
      setNameError('');
    }
  };

  const handleJoinMeeting = () => {
    if (!participantName.trim()) {
      setNameError('Vui lòng nhập tên của bạn');
      return;
    }
    onClickStartMeeting();
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={4} 
        sx={
          {
            fontWeight: 600, 
            color: '#0056b3'
          }}>
          Chuẩn bị vào buổi tư vấn
        </Typography>
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
          <Box sx={{ width: { xs: '100%', md: '60%' }, height: 300, backgroundColor: '#f0f0f0', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            {webcamOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                width: '100%',
                height: '100%',
                backgroundColor: '#212936'
              }}>
                <VideocamOffIcon sx={{ fontSize: 48, color: '#ffffff', mb: 2 }} />
                <Typography color="#ffffff">Camera đã tắt</Typography>
              </Box>
            )}
          </Box>
          
          <Stack spacing={3} sx={{ width: { xs: '100%', md: '40%' } }}>
            <TextField
              fullWidth
              label="Tên của bạn"
              variant="outlined"
              value={participantName}
              onChange={handleNameChange}
              error={!!nameError}
              helperText={nameError}
              required
              placeholder="Nhập tên hiển thị"
            />
            
            <FormControl fullWidth disabled={isLoadingDevices}>
              <InputLabel>Camera</InputLabel>
              <Select
                value={selectedCamera}
                onChange={handleCameraChange}
                label="Camera"
              >
                {cameraDevices.map((device) => (
                  <MenuItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.substring(0, 5)}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth disabled={isLoadingDevices}>
              <InputLabel>Microphone</InputLabel>
              <Select
                value={selectedMicrophone}
                onChange={handleMicrophoneChange}
                label="Microphone"
              >
                {microphoneDevices.map((device) => (
                  <MenuItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Mic ${device.deviceId.substring(0, 5)}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Stack direction="row" spacing={2} justifyContent="center">
              <IconButton 
                onClick={toggleMic} 
                sx={{ 
                  backgroundColor: micOn ? 'primary.main' : 'error.main', 
                  color: 'white',
                  '&:hover': { backgroundColor: micOn ? 'primary.dark' : 'error.dark' } 
                }}
              >
                {micOn ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
              
              <IconButton 
                onClick={toggleWebcam} 
                sx={{ 
                  backgroundColor: webcamOn ? 'primary.main' : 'error.main', 
                  color: 'white',
                  '&:hover': { backgroundColor: webcamOn ? 'primary.dark' : 'error.dark' } 
                }}
              >
                {webcamOn ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleJoinMeeting}
            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
          >
            Vào buổi tư vấn
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default JoiningScreen; 