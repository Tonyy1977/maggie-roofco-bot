import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import qaData from './qaData';
import { v4 as uuidv4 } from 'uuid';

const API_BASE = 'https://micah-admin.onrender.com';
function FullChat() {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('micah-user');
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.name && parsed?.password) return parsed;
    } catch {
      return null;
    }
    return null;
  });
  const [awaitingLogin, setAwaitingLogin] = useState(() => {
    const stored = localStorage.getItem('micah-user');
    try {
      const parsed = JSON.parse(stored);
      return !(parsed?.name && parsed?.password);
    } catch {
      return true;
    }
  });
  const [loginInput, setLoginInput] = useState({ name: '', password: '' });
  const sessionId = user ? `${user.name}-${user.password}` : 'guest';
  const [input, setInput] = useState('');
  const [showWelcomeOptions, setShowWelcomeOptions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${API_BASE}/api/history`, {
  params: { sessionId },
});

        const history = res.data.map((msg) => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        setMessages(history.length > 0 ? history : [{
          sender: 'bot',
          text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?",
        }]);
      } catch (err) {
        console.error('❌ Failed to load chat history:', err);
        setMessages([{
          sender: 'bot',
          text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?",
        }]);
      }
    };
    fetchHistory();
  }, [user]);

  const addMessage = (msg) => {
    const fullMsg = {
      ...msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, fullMsg]);
    axios.post(`${API_BASE}/api/history`, {
  sessionId,
  ...msg,
    })
    .catch(err => console.error('❌ Failed to save message to DB:', err));
  };

  const handleSend = async (text = input) => {
    const userRaw = text.trim();
    if (!userRaw) return;
    setInput('');
    setShowWelcomeOptions(false);
    addMessage({ sender: 'user', text: userRaw });
    setIsTyping(true);
    const messagesPayload = [
      {
        role: 'system',
        content: `You are Micah, a friendly and helpful property-management expert for DDT Enterprise, a nationwide property management company. Speak like a warm, professional Caucasian woman from Marion, Arkansas — with a light Southern charm and polite hospitality, but keep it professional and easy to understand for all customers. Be clear, concise, and helpful. Keep answers short — no more than 2–3 sentences unless necessary. FAQs: ${JSON.stringify(qaData)}`
      },
      { role: 'user', content: userRaw }
    ];
    try {
      const res = await axios.post(`${API_BASE}/api/chat`, {
  messages: messagesPayload,
  sessionId,
});
      const reply = res.data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
      addMessage({ sender: 'bot', text: reply });
    } catch (err) {
      console.error('❌ Server error:', err);
      addMessage({ sender: 'bot', text: 'Server error, please try again.' });
    } finally {
      setIsTyping(false);
    }
  };

  const showMainOptions = () => setShowWelcomeOptions(true);

  return (
    <>
      {showPopup && (
        <div className="popup-message-row">
          <img src="/bot-avatar.png" alt="avatar" className="popup-avatar" />
          <div className="popup-message-bubble">
            Hi, I'm Micah, DDT's virtual assistant. How can I help you today?
          </div>
        </div>
      )}

      <div className="chat-wrapper" style={{ bottom: '0px' }}>
        <div className="chat-box">
          <div className="chat-header no-blur">
            <div className="header-left">
              <img src="/micah-header.png" alt="Micah Avatar" className="header-avatar no-blur square-avatar" />
              <div className="header-info">
                <span className="bot-name">Micah</span>
                <span className="ai-badge">AI</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => window.parent.postMessage('close-chat', '*')}>×</button>
          </div>

          <div className="chat-content-card">
            <div className="chat-body">
              {awaitingLogin && (
                <div className="message-row bot-row">
                  <img src="/bot-avatar.png" alt="bot-avatar" className="avatar no-blur" />
                  <div className="message bot-msg">
                    <div className="message-text">
                      <div>Would you like to save this conversation or resume a previous one?</div>
                      <div>Please enter your <b>name</b> and <b>password</b> below:</div>
                      <input type="text" placeholder="Name" value={loginInput.name} onChange={e => setLoginInput({ ...loginInput, name: e.target.value })} style={{ width: '100%', marginTop: '8px' }} />
                      <input type="password" placeholder="Password" value={loginInput.password} onChange={e => setLoginInput({ ...loginInput, password: e.target.value })} style={{ width: '100%', marginTop: '8px' }} />
                      <button className="option-box" style={{ marginTop: '10px' }} onClick={() => {
                        const trimmedName = loginInput.name.trim();
                        const trimmedPass = loginInput.password.trim();
                        if (!trimmedName || !trimmedPass) return alert('Both fields required');
                        const newUser = { name: trimmedName, password: trimmedPass };
                        localStorage.setItem('micah-user', JSON.stringify(newUser));
                        setUser(newUser);
                        setAwaitingLogin(false);
                      }}>Save & Continue</button>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`message-row ${m.sender}-row`}>
                  {m.sender === 'bot' && <img src="/bot-avatar.png" alt="bot-avatar" className="avatar no-blur" />}
                  <div className={`message ${m.sender}-msg`} style={{ fontFamily: m.sender === 'bot' ? "'Cormorant Garamond', serif" : "'Times New Roman', serif" }}>
                    <div className="message-text" dangerouslySetInnerHTML={{
                      __html: Array.isArray(m.text)
                        ? m.text.map(str => `<div>${str}</div>`).join('')
                        : `<div>${m.text}</div>`
                    }}></div>
                    <span className="timestamp">{m.timestamp}</span>
                  </div>
                </div>
              ))}

              {isTyping && <div className="typing-indicator">Micah is typing...</div>}
              <div ref={messagesEndRef} />

              {showWelcomeOptions && (
                <div className="welcome-options">
                  {["I have a question about rent", "I’d like to ask about payment options", "I need help with the application process", "I’d like to schedule a property tour", "I have an urgent or emergency concern", "Thomas Inspections"].map((opt) => (
                    <div key={opt} className="option-box" onClick={() => handleSend(opt)}>{opt}</div>
                  ))}
                </div>
              )}

              {!showWelcomeOptions && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <div className="option-box" onClick={showMainOptions}>Other</div>
                </div>
              )}
            </div>

            <div className="chat-footer">
              <input type="text" placeholder="Type your message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <button onClick={() => handleSend()}>➤</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FullChat;
