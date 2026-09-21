import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import api from '../services/api';
import './AIChatbot.css';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Initial message exactly as requested
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am created by MR.Alok to make your experience smoother and I am just suggesting you songs. What kind of vibe are you looking for?' }
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { prompt: userMessage });
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Oops, I couldn't connect right now. Try again later!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chatbot-wrapper">
      {isOpen ? (
        <div className="chat-window">
          <div className="chat-header">
            <div>
              <span className="chat-title">AI Assistant</span>
              <span className="chat-subtitle">by MR.Alok</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-bubble ${msg.sender}`}>
                {/* Use white-space pre-wrap so the numbered list renders properly */}
                <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.text}</p>
              </div>
            ))}
            {loading && <div className="message-bubble ai typing">Thinking...</div>}
          </div>

          <form onSubmit={handleSend} className="chat-input-area">
            <input 
              type="text" 
              placeholder="e.g. I want romantic songs..." 
              value={input} 
              onChange={e => setInput(e.target.value)} 
            />
            <button type="submit" disabled={!input.trim()}><Send size={18} /></button>
          </form>
        </div>
      ) : (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default AIChatbot;