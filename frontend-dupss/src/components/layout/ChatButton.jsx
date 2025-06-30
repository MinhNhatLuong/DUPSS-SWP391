import { useState, useEffect, useRef } from 'react';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        const data = await response.text();
        setMessages(prev => [...prev, { text: data, sender: 'ai' }]);
      } else {
        setMessages(prev => [...prev, { 
          text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.', 
          sender: 'ai' 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.', 
        sender: 'ai' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button 
          id="chat-button" 
          title="Trò chuyện với AI"
          className={isOpen ? 'active' : ''}
          onClick={toggleChat}
        >
          <ChatIcon />
        </button>
      )}
      
      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>Trợ lý AI của DUPSS</h3>
            <button onClick={toggleChat}><CloseIcon /></button>
          </div>
          <div className="chat-messages">
            <div className="message ai">
              <div className="message-content">
                Xin chào! Tôi là trợ lý ảo của DUPSS. Tôi có thể giúp gì cho bạn?
              </div>
            </div>
            
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.sender === 'ai' ? (
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message ai">
                <div className="message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={sendMessage} className="chat-input">
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatButton; 