import { API_URL } from './config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// In a production app, you would load this from environment variable
const VIDEOSDK_TOKEN = import.meta.env.VITE_VIDEOSDK_TOKEN;

/**
 * Gets the VideoSDK token
 */
export const getToken = async () => {
  return VIDEOSDK_TOKEN;
};

/**
 * Creates a new meeting room
 * @param {Object} options - Options for creating a meeting
 * @param {string} options.token - VideoSDK token
 * @returns {Promise<{meetingId: string|null, err: string|null}>} The meeting ID and error if any
 */
export const createMeeting = async ({ token }) => {
  const url = `${API_BASE_URL}/v2/rooms`;
  const options = {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (data.roomId) {
      return { meetingId: data.roomId, err: null };
    } else {
      return { meetingId: null, err: data.error || "Could not create meeting" };
    }
  } catch (error) {
    console.error("Error creating meeting:", error);
    return { meetingId: null, err: error.message || "Network error" };
  }
};

/**
 * Validates if a meeting room exists
 * @param {Object} options - Options for validating a meeting
 * @param {string} options.roomId - ID of the room to validate
 * @param {string} options.token - VideoSDK token
 * @returns {Promise<{meetingId: string|null, err: string|null}>} The meeting ID and error if any
 */
export const validateMeeting = async ({ roomId, token }) => {
  const url = `${API_BASE_URL}/v2/rooms/validate/${roomId}`;
  
  const options = {
    method: "GET",
    headers: { Authorization: token, "Content-Type": "application/json" },
  };

  try {
    const response = await fetch(url, options);
    
    if (response.status === 400) {
      const data = await response.text();
      return { meetingId: null, err: data };
    }
    
    const data = await response.json();
    
    if (data.roomId) {
      return { meetingId: data.roomId, err: null };
    } else {
      return { meetingId: null, err: data.error || "Invalid meeting" };
    }
  } catch (error) {
    console.error("Error validating meeting:", error);
    return { meetingId: null, err: error.message || "Network error" };
  }
};

/**
 * Stores meeting info in the database via backend API
 * @param {Object} meetingData - Data about the meeting to store
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const saveMeetingInfo = async (meetingData) => {
  try {
    const response = await fetch(`${API_URL}/appointments/video-meeting`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meetingData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Could not save meeting info');
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error saving meeting info:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}; 