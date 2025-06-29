import React, { useState, useEffect, useRef } from 'react';
import {
  useMeeting,
  useParticipant,
  usePubSub
} from "@videosdk.live/react-sdk";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Grid,
  Stack,
  Drawer,
  TextField,
  Avatar,
  Badge,
  Tooltip,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import SendIcon from '@mui/icons-material/Send';

// Participant component for displaying a single participant
const ParticipantView = (props) => {
  const { participantId } = props;
  const {
    displayName,
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    screenShareStream,
    screenShareOn,
  } = useParticipant(participantId);
  
  const webcamRef = useRef(null);
  const screenShareRef = useRef(null);
  
  useEffect(() => {
    let mediaStream = null;
    
    if (webcamRef.current) {
      if (webcamOn && webcamStream) {
        mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);
        webcamRef.current.srcObject = mediaStream;
        webcamRef.current.play().catch(error => console.error('Error playing webcam video:', error));
      } else {
        webcamRef.current.srcObject = null;
        // Stop all tracks to properly release camera resources
        if (webcamRef.current.srcObject instanceof MediaStream) {
          webcamRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      }
    }
    
    // Cleanup function to release resources when component unmounts or dependencies change
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamOn, webcamStream]);
  
  useEffect(() => {
    let mediaStream = null;
    
    if (screenShareRef.current) {
      if (screenShareOn && screenShareStream) {
        mediaStream = new MediaStream();
        mediaStream.addTrack(screenShareStream.track);
        screenShareRef.current.srcObject = mediaStream;
        screenShareRef.current.play().catch(error => console.error('Error playing screen share video:', error));
      } else {
        screenShareRef.current.srcObject = null;
        // Stop all tracks to properly release screen share resources
        if (screenShareRef.current.srcObject instanceof MediaStream) {
          screenShareRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      }
    }
    
    // Cleanup function for screen share resources
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [screenShareOn, screenShareStream]);
  
  return (
            <Box sx={{ 
      position: 'relative', 
      height: '100%', 
      width: '100%',
      borderRadius: 1,
      overflow: 'hidden',
      bgcolor: '#1a1a1a'
    }}>
      {/* Screen share has priority over webcam */}
      {screenShareOn ? (
        <video
          ref={screenShareRef}
          autoPlay
          playsInline
          muted={isLocal}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      ) : webcamOn ? (
        <video
          ref={webcamRef}
          autoPlay
          playsInline
          muted={isLocal}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isLocal ? 'scaleX(-1)' : 'scaleX(1)'
          }}
        />
      ) : (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%',
          height: '100%',
          bgcolor: '#212936'
        }}>
          <Avatar sx={{ width: 80, height: 80, fontSize: 36, bgcolor: 'primary.main' }}>
            {displayName?.charAt(0)?.toUpperCase() || "?"}
          </Avatar>
        </Box>
      )}
      
      <Box sx={{ 
        position: 'absolute', 
        bottom: 8, 
        left: 8, 
        display: 'flex', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        px: 1,
        py: 0.5,
        borderRadius: 1
      }}>
        <Typography variant="body2" color="white" sx={{ mr: 1 }}>
          {isLocal ? "Bạn" : displayName || "Khách"}
          {screenShareOn && " (Đang chia sẻ màn hình)"}
        </Typography>
        {micOn ? (
          <MicIcon fontSize="small" sx={{ color: 'white' }} />
        ) : (
          <MicOffIcon fontSize="small" sx={{ color: 'white' }} />
        )}
      </Box>
    </Box>
  );
};

// Chat message component
const ChatMessage = ({ senderId, senderName, message, timestamp, isLocal }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isLocal ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          p: 1.5,
          bgcolor: isLocal ? 'primary.main' : 'grey.100',
          color: isLocal ? 'white' : 'text.primary',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        {!isLocal && (
          <Typography variant="caption" fontWeight="bold" display="block">
            {senderName}
          </Typography>
        )}
        <Typography variant="body2">{message}</Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </Box>
  );
};

// Chat panel component
const ChatPanel = ({ messages, sendMessage }) => {
  const [messageText, setMessageText] = useState("");
  const messageContainerRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      p: 2
    }}>
      <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
        Nhắn tin
      </Typography>
      
      <Box 
        ref={messageContainerRef}
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          px: 1,
          mb: 2
        }}
      >
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Chưa có tin nhắn nào.
          </Typography>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.timestamp}
              senderId={msg.senderId}
              senderName={msg.senderName}
              message={msg.message}
              timestamp={msg.timestamp}
              isLocal={msg.isLocal}
            />
          ))
        )}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Nhập tin nhắn..."
          size="small"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ backgroundColor: 'white' }}
        />
        <IconButton 
          color="primary" 
          onClick={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

// Participants panel component
const ParticipantsPanel = ({ participants }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
        Người tham gia ({participants.length})
      </Typography>
      
      <Stack spacing={1}>
        {participants.map((participant) => (
          <Paper 
            key={participant.id} 
            variant="outlined" 
            sx={{ 
              p: 1.5, 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                {participant.displayName?.charAt(0).toUpperCase() || "?"}
              </Avatar>
              <Typography>
                {participant.displayName} {participant.isLocal && "(Bạn)"}
              </Typography>
            </Box>
            
            <Box>
              {participant.micOn ? (
                <MicIcon fontSize="small" color="primary" />
              ) : (
                <MicOffIcon fontSize="small" color="error" />
              )}
              {' '}
              {participant.webcamOn ? (
                <VideocamIcon fontSize="small" color="primary" />
              ) : (
                <VideocamOffIcon fontSize="small" color="error" />
              )}
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

// Main meeting container
const MeetingContainer = ({ onMeetingLeave }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activeSidebar, setActiveSidebar] = useState(null); // 'chat' | 'participants' | null
  
  const { 
    localParticipant,
    participants,
    meetingId,
    leave,
    toggleMic,
    toggleWebcam: sdkToggleWebcam,
    toggleScreenShare,
    startScreenShare,
    stopScreenShare,
    localMicOn,
    localWebcamOn,
    localScreenShareOn
  } = useMeeting({
    onParticipantJoined: participantJoined,
    onParticipantLeft: participantLeft,
    onMeetingJoined: meetingJoined,
    onMeetingLeft: meetingLeft
  });
  
  // Custom toggleWebcam with proper resource management
  const toggleWebcam = async () => {
    try {
      // If turning off webcam, ensure we properly clean up
      if (localWebcamOn) {
        // First stop any active webcam tracks from our side
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getVideoTracks().forEach(track => {
            track.stop();
          });
        }
      }
      // Then use SDK's toggle
      sdkToggleWebcam();
    } catch (err) {
      console.error("Error toggling webcam:", err);
      // If there was an error in our cleanup, still try the SDK toggle
      sdkToggleWebcam();
    }
  };
  
  function participantJoined(participant) {
    console.log(`Participant joined: ${participant.id} (${participant.displayName})`);
    console.log(`Current participants: ${participants.size + 1}`); // +1 for local participant
    console.log("All participants:", [...participants.keys()].map(id => ({
      id,
      name: participants.get(id).displayName
    })));
  }
  
  function participantLeft(participant) {
    console.log(`Participant left: ${participant.id} (${participant.displayName})`);
    console.log(`Remaining participants: ${participants.size}`);
  }
  
  function meetingJoined() {
    console.log(`Meeting joined successfully! Meeting ID: ${meetingId}`);
    console.log(`Local participant: ${localParticipant?.id} (${localParticipant?.displayName})`);
  }
  
  function meetingLeft() {
    console.log("Meeting left.");
    onMeetingLeave();
  }
  
  const { publish: publishChat, messages: pubsubMessages } = usePubSub("CHAT");

  useEffect(() => {
    if (pubsubMessages) {
      const newMessages = pubsubMessages.map((msg) => ({
        senderId: msg.senderId,
        senderName: msg.senderName,
        message: msg.message,
        timestamp: msg.timestamp,
        isLocal: msg.senderId === localParticipant?.id
      }));
      
      setChatMessages(newMessages);
      
      // Update unread count if chat is not open
      if (activeSidebar !== 'chat' && newMessages.length > 0) {
        const lastMessage = newMessages[newMessages.length - 1];
        if (!lastMessage.isLocal) {
          setUnreadMessages(prev => prev + 1);
        }
      }
    }
  }, [pubsubMessages, localParticipant, activeSidebar]);

  const sendChatMessage = (message) => {
    publishChat({
      message,
      senderName: localParticipant?.displayName || "You",
      timestamp: Date.now()
    });
  };

  const handleToggleSidebar = (sidebar) => {
    if (activeSidebar === sidebar) {
      setActiveSidebar(null);
    } else {
      setActiveSidebar(sidebar);
      
      // Reset unread count when opening chat
      if (sidebar === 'chat') {
        setUnreadMessages(0);
      }
    }
  };

  // Format participant list for the panel with duplicates removed
  const participantList = (() => {
    // Start with local participant
    const list = localParticipant ? [{
      id: localParticipant.id,
      displayName: localParticipant.displayName || "Bạn",
      isLocal: true,
      micOn: localMicOn,
      webcamOn: localWebcamOn
    }] : [];
    
    // Set to track participant names we've already added
    const addedNames = new Set([localParticipant?.displayName]);
    
    // Add remote participants only if they don't have the same name as local participant
    Array.from(participants.values()).forEach((p) => {
      if (!addedNames.has(p.displayName)) {
        addedNames.add(p.displayName);
        list.push({
          id: p.id,
          displayName: p.displayName,
          isLocal: false,
          micOn: p.micOn,
          webcamOn: p.webcamOn
        });
      }
    });
    
    return list;
  })();
  
  // Log participants for debugging
  useEffect(() => {
    console.log("Filtered participant list:", participantList);
    console.log("Raw participants in meeting:", participants.size + 1);
  }, [participants.size]);

  // Get all participant IDs for the grid with duplicates removed
  const allParticipants = (() => {
    // Start with local participant
    const participantIds = localParticipant ? [localParticipant.id] : [];
    
    // Track names we've already included to avoid duplicates
    const includedNames = new Set([localParticipant?.displayName]);
    
    // Add remote participants if they don't have the same name as ones we've already added
    Array.from(participants.entries()).forEach(([id, participant]) => {
      if (!includedNames.has(participant.displayName)) {
        includedNames.add(participant.displayName);
        participantIds.push(id);
      }
    });
    
    return participantIds;
  })();

  return (
    <Box sx={{ 
      height: 'calc(100vh - 150px)', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f5f5f5',
      overflow: 'hidden' // Ngăn thanh cuộn ngang
    }}>
      {/* Main content area with video grid */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          p: 0.5, // Giảm padding để tối đa không gian
          display: 'flex',
          position: 'relative',
          overflow: 'hidden', // Ngăn thanh cuộn ngang
          maxWidth: '100%'
        }}
      >
        {/* Video grid */}
        <Box sx={{ 
          flexGrow: 1, 
          position: 'relative',
          overflow: 'hidden', // Ngăn thanh cuộn ngang
          ...(activeSidebar ? { width: 'calc(100% - 320px)' } : { width: '100%' }),
          maxWidth: activeSidebar ? 'calc(100% - 320px)' : '100%'
        }}>
                        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0 }}>
            {(() => {
              // Limit to max 9 participants, if more than 9 the last one will show count
              const maxDisplayed = 9;
              const displayParticipants = allParticipants.slice(0, Math.min(maxDisplayed, allParticipants.length));
              const remainingCount = allParticipants.length > maxDisplayed ? allParticipants.length - maxDisplayed + 1 : 0;
              
              if (remainingCount > 0) {
                // Replace last participant with indicator for remaining participants
                displayParticipants[maxDisplayed - 1] = 'remaining';
              }
              
              // Determine the layout based on participant count
              let rows = 1;
              if (displayParticipants.length >= 4 && displayParticipants.length <= 6) rows = 2;
              if (displayParticipants.length >= 7) rows = 3;
              
              // Create the row containers with appropriate heights
              const rowElements = [];
              for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
                // Calculate how many participants in this row
                let participantsInThisRow;
                if (rows === 1) {
                  participantsInThisRow = displayParticipants.length;
                } else if (rows === 2) {
                  if (rowIndex === 0) {
                    // First row with 1, 2, or 3 participants depending on total
                    if (displayParticipants.length === 4) participantsInThisRow = 1;
                    else if (displayParticipants.length === 5) participantsInThisRow = 2;
                    else participantsInThisRow = 3;
                  } else {
                    // Second row with the remaining participants
                    participantsInThisRow = displayParticipants.length - (displayParticipants.length === 4 ? 1 : displayParticipants.length === 5 ? 2 : 3);
                  }
                } else {
                  // 3 rows case (7-9 participants)
                  if (rowIndex === 0) {
                    // First row: 1, 2, or 3 participants
                    if (displayParticipants.length === 7) participantsInThisRow = 1;
                    else if (displayParticipants.length === 8) participantsInThisRow = 2;
                    else participantsInThisRow = 3;
                  } else if (rowIndex === 1) {
                    // Second row: 3 participants
                    participantsInThisRow = 3;
                  } else {
                    // Third row: remaining participants
                    participantsInThisRow = displayParticipants.length - (displayParticipants.length === 7 ? 4 : displayParticipants.length === 8 ? 5 : 6);
                  }
                }
                
                // Calculate the starting index for this row
                let startIdx = 0;
                if (rowIndex === 1) {
                  if (rows === 2) {
                    startIdx = displayParticipants.length === 4 ? 1 : displayParticipants.length === 5 ? 2 : 3;
                  } else {
                    startIdx = displayParticipants.length === 7 ? 1 : displayParticipants.length === 8 ? 2 : 3;
                  }
                } else if (rowIndex === 2) {
                  startIdx = displayParticipants.length === 7 ? 4 : displayParticipants.length === 8 ? 5 : 6;
                }
                
                // Create the participants for this row
                const colElements = [];
                for (let i = 0; i < participantsInThisRow; i++) {
                  const participantIdx = startIdx + i;
                  const participantId = displayParticipants[participantIdx];
                  
                  colElements.push(
                    <Box 
                      key={participantId === 'remaining' ? 'remaining' : participantId} 
                      sx={{ 
                        flex: 1,
                        height: '100%',
                        width: `${100 / participantsInThisRow}%`,
                        // Giảm padding để các ô sát nhau hơn
                        padding: 0.25
                      }}
                    >
                      {participantId === 'remaining' ? (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          height: '100%',
                          width: '100%',
                          bgcolor: '#212936',
                          borderRadius: 1,
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.5rem'
                        }}>
                          +{remainingCount} người khác
                        </Box>
                      ) : (
                        <ParticipantView participantId={participantId} />
                      )}
                    </Box>
                  );
                }
                
                // Add the row to our layout
                rowElements.push(
                  <Box 
                    key={`row-${rowIndex}`} 
                    sx={{ 
                      display: 'flex', 
                      flex: 1,
                      width: '100%',
                      height: `${100 / rows}%`
                    }}
                  >
                    {colElements}
                  </Box>
                );
              }
              
              return rowElements;
            })()}
          </Box>
        </Box>
        
        {/* Sidebar drawer */}
        <Drawer
          variant="persistent"
          anchor="right"
          open={!!activeSidebar}
          PaperProps={{
            sx: {
              width: 320,
              position: 'relative',
              border: 'none',
              boxShadow: 'none',
              height: '100%',
              bgcolor: '#f8f9fa',
            }
          }}
        >
          {activeSidebar === 'chat' && (
            <ChatPanel messages={chatMessages} sendMessage={sendChatMessage} />
          )}
          
          {activeSidebar === 'participants' && (
            <ParticipantsPanel participants={participantList} />
          )}
        </Drawer>
      </Box>
      
      {/* Bottom control bar */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 2,
          zIndex: 1,
          width: '100%',
          boxSizing: 'border-box' // Đảm bảo padding không làm tăng chiều rộng
        }}
      >
        <Tooltip title={localMicOn ? "Tắt microphone" : "Bật microphone"}>
          <IconButton 
            onClick={toggleMic}
            sx={{ 
              p: 1.5,
              bgcolor: localMicOn ? 'primary.main' : 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: localMicOn ? 'primary.dark' : 'error.dark',
              }
            }}
          >
            {localMicOn ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title={localWebcamOn ? "Tắt camera" : "Bật camera"}>
          <IconButton
            onClick={toggleWebcam}
            sx={{ 
              p: 1.5,
              bgcolor: localWebcamOn ? 'primary.main' : 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: localWebcamOn ? 'primary.dark' : 'error.dark',
              }
            }}
          >
            {localWebcamOn ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title={localScreenShareOn ? "Dừng chia sẻ màn hình" : "Chia sẻ màn hình"}>
          <IconButton
            onClick={toggleScreenShare}
            sx={{ 
              p: 1.5,
              bgcolor: localScreenShareOn ? 'warning.main' : 'grey.700',
              color: 'white',
              '&:hover': {
                bgcolor: localScreenShareOn ? 'warning.dark' : 'grey.900',
              }
            }}
          >
            {localScreenShareOn ? <StopScreenShareIcon /> : <ScreenShareIcon />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Chat">
          <IconButton
            onClick={() => handleToggleSidebar('chat')}
            sx={{ 
              p: 1.5,
              bgcolor: activeSidebar === 'chat' ? 'primary.main' : 'grey.700',
              color: 'white',
              '&:hover': {
                bgcolor: activeSidebar === 'chat' ? 'primary.dark' : 'grey.900',
              }
            }}
          >
            <Badge badgeContent={unreadMessages} color="error">
              <ChatIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Người tham gia">
          <IconButton
            onClick={() => handleToggleSidebar('participants')}
            sx={{ 
              p: 1.5,
              bgcolor: activeSidebar === 'participants' ? 'primary.main' : 'grey.700',
              color: 'white',
              '&:hover': {
                bgcolor: activeSidebar === 'participants' ? 'primary.dark' : 'grey.900',
              }
            }}
          >
            <PeopleIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Kết thúc cuộc họp">
          <IconButton
            onClick={leave}
            sx={{ 
              p: 1.5,
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'error.dark',
              }
            }}
          >
            <CallEndIcon />
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  );
};

export default MeetingContainer; 