import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MeetingProvider, MeetingConsumer } from "@videosdk.live/react-sdk";
import { getToken, validateMeeting, createMeeting } from '../../services/videoService';
import { Box, Typography, TextField, Button, CircularProgress, Container, Paper, Stack } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

import MeetingContainer from './VideoMeetingComponents/MeetingContainer';
import JoiningScreen from './VideoMeetingComponents/JoiningScreen';

const VideoMeeting = () => {
  const { videoCallId } = useParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [webcamOn, setWebcamOn] = useState(true);
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Custom audio/video streams (optional)
  const [customAudioStream, setCustomAudioStream] = useState(null);
  const [customVideoStream, setCustomVideoStream] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const tokenResponse = await getToken();
        setToken(tokenResponse);

        // Luôn sử dụng videoCallId từ URL làm meetingId
        if (videoCallId) {
          console.log("Attempting to join meeting with ID:", videoCallId);
          setMeetingId(videoCallId);
          
          const { meetingId: validMeetingId, err } = await validateMeeting({ 
            roomId: videoCallId, 
            token: tokenResponse 
          });
          
          if (err) {
            console.error("Meeting validation error:", err);
            setError("Cuộc họp không tồn tại hoặc đã kết thúc");
          } else {
            console.log("Meeting is valid:", validMeetingId);
          }
        } else {
          console.error("No videoCallId provided in URL");
          setError("ID cuộc họp không hợp lệ");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error initializing meeting:", error);
        setError("Không thể kết nối với máy chủ hội nghị");
        setLoading(false);
      }
    };
    
    init();
  }, [videoCallId]);

  const onClickStartMeeting = async () => {
    if (!participantName.trim()) {
      setError("Vui lòng nhập tên của bạn");
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Joining meeting ${meetingId} as ${participantName}`);
      setIsMeetingStarted(true);
      setError("");
    } catch (error) {
      console.error("Error joining meeting:", error);
      setError("Không thể tham gia cuộc họp");
      setLoading(false);
    }
  };

  const handleOnMeetingLeave = useCallback(() => {
    setIsMeetingStarted(false);
    navigate('/');
  }, [navigate]);

  // Generate a stable participant ID based on user information and meeting
  const getParticipantId = () => {
    // Get user ID from localStorage if available (assuming user profile is stored there)
    const userProfile = localStorage.getItem('userProfile');
    let userId;
    
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        userId = profile.id || profile.userId || profile.email;
      } catch (e) {
        console.error("Error parsing user profile", e);
      }
    }
    
    // If we have a user ID, use it combined with the meeting ID to create a stable ID
    // Otherwise, fall back to a session-specific ID that will at least be consistent within this tab
    if (userId) {
      const participantId = `user-${userId}-meeting-${meetingId}`;
      console.log("Generated participant ID:", participantId);
      return participantId;
    } else if (!window.sessionStorage.getItem('tempParticipantId')) {
      window.sessionStorage.setItem('tempParticipantId', window.crypto.randomUUID());
    }
    
    const tempId = window.sessionStorage.getItem('tempParticipantId');
    console.log("Using temporary participant ID:", tempId);
    return tempId;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {loading && !isMeetingStarted ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Trở về trang chủ
          </Button>
        </Paper>
      ) : isMeetingStarted ? (
        <MeetingProvider
          config={{
            meetingId,
            micEnabled: micOn,
            webcamEnabled: webcamOn,
            name: participantName,
            participantId: getParticipantId(),
            customAudioStream,
            customVideoStream,
          }}
          token={token}
          joinWithoutUserInteraction={true}
        >
          <MeetingConsumer>
            {() => (
              <MeetingContainer
                onMeetingLeave={handleOnMeetingLeave}
                setIsMeetingStarted={setIsMeetingStarted}
              />
            )}
          </MeetingConsumer>
        </MeetingProvider>
      ) : (
        <JoiningScreen
          participantName={participantName}
          setParticipantName={setParticipantName}
          meetingId={meetingId}
          setMeetingId={setMeetingId}
          micOn={micOn}
          setMicOn={setMicOn}
          webcamOn={webcamOn}
          setWebcamOn={setWebcamOn}
          onClickStartMeeting={onClickStartMeeting}
          setCustomAudioStream={setCustomAudioStream}
          setCustomVideoStream={setCustomVideoStream}
        />
      )}
    </Container>
  );
};

export default VideoMeeting; 