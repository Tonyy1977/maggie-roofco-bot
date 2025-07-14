import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import qaData from './qaData';
import { v4 as uuidv4 } from 'uuid';

const API_BASE = '/api';


function FullChat() {

  const [activeTab, setActiveTab] = useState('home');
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

  const [loginInput, setLoginInput] = useState({ name: '', password: '' });
  const [input, setInput] = useState('');
  const [showWelcomeOptions, setShowWelcomeOptions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const sessionIdRef = useRef(null);

if (!sessionIdRef.current) {
  if (user) {
    sessionIdRef.current = `${user.name}-${user.password}`;
  } else {
    let guestId = localStorage.getItem('micah-guest-session');
    if (!guestId) {
      guestId = `guest-${uuidv4()}`;
      localStorage.setItem('micah-guest-session', guestId);
    }
    sessionIdRef.current = guestId;
  }
}

const sessionId = sessionIdRef.current;

  const userDisplayName = user?.name || 'Guest';

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
  if (activeTab === 'messages' && chatBodyRef.current) {
    const body = chatBodyRef.current;
    body.scrollTop = body.scrollHeight;
  }
}, [messages.length, activeTab]);

  useEffect(() => {
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`, {
        params: { sessionId },
      });

      console.log('📦 Fetched history:', res.data);

      // ✅ Validate response is an array before calling .map
      if (!Array.isArray(res.data)) {
        console.error('❌ Unexpected response:', res.data);
        throw new Error('Expected an array from /api/history');
      }

      const history = res.data.map((msg) => ({
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));

      setMessages(
        history.length > 0
          ? history
          : [{
              sender: 'bot',
              text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?",
            }]
      );
    } catch (err) {
      console.error('❌ Failed to load chat history:', err);
      setMessages([{
        sender: 'bot',
        text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?",
      }]);
    }
  };

  fetchHistory();
}, [sessionId]);

  const addMessage = (msg) => {
    const fullMsg = {
      ...msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, fullMsg]);
  };

  const handleSend = async (text = input) => {
  const userRaw = text.trim();
  if (!userRaw) return;
  setInput('');
  setShowWelcomeOptions(false);
  addMessage({ sender: 'user', text: userRaw });
  setIsTyping(true);

  // 🧠 Step 1: Get last 8 messages for short-term memory
 const recentContext = messages
  .filter(m => {
    // Convert message text to plain string (flatten arrays and strip tags)
    const rawText = Array.isArray(m.text)
      ? m.text.join(' ')
      : String(m.text).replace(/<[^>]*>/g, '').toLowerCase();

    // Skip any bot message that contains the contact line
    return !(m.sender === 'bot' && rawText.includes('contact me directly at (757)'));
  })
  .slice(-8)
  .map(m => `${m.sender === 'user' ? 'User' : 'Micah'}: ${
    Array.isArray(m.text) ? m.text.join(' ') : String(m.text).replace(/<[^>]*>/g, '')
  }`)
  .join('\n');

  // 🧠 Step 2: Inject conversation history into GPT system prompt
  const messagesPayload = [
    {
      role: 'system',
      content: `You are Micah, a friendly and helpful property-management expert for DDT Enterprise, a nationwide property management company. 
You speak with the polite charm of a 27-year-old from Marion, Arkansas — warm, professional, and respectful with a light Southern tone. 
Avoid referring to yourself with gendered language or personal stories. Focus on helping the customer clearly and concisely. 
Keep responses short (2–3 sentences max unless necessary). FAQs: ${JSON.stringify(qaData)}`
    },
    { role: 'user', content: userRaw }
  ];

  try {
    const res = await axios.post(`${API_BASE}/chat`, {
  model: 'gpt-4o',
  messages: messagesPayload,
  sessionId,
});

    let reply = res.data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';

    // Optional: agent reference override
    // Replace generic agent references with your number
reply = reply.replace(
  /local real estate agent|a local realtor|real estate professional|local property manager|a local market analysis|consult with.*?agent|check with.*?agent|check with.*?realtor/gi,
  'me directly at (757) 408 - 7241'
);

// Smart contact logic: only add if user's message is about properties AND we haven't already added it
const propertyIntent = /rent|price|property|schedule|tour|home|apartment|house|unit|listing|available/i.test(userRaw);
const contactLineAlreadyPresent = /757[\s\-)]*408[\s\-)]*7241/.test(reply);

if (propertyIntent && !contactLineAlreadyPresent) {
  reply += ' For more accurate info, please contact me directly at (757) 408 - 7241.';
}

    addMessage({ sender: 'bot', text: reply });

  } catch (err) {
    console.error('❌ Server error:', err);
    addMessage({ sender: 'bot', text: 'Server error, please try again.' });
  } finally {
    setIsTyping(false);
  }
};

  const handleLogin = async () => {
  const trimmedName = loginInput.name.trim();
  const trimmedPass = loginInput.password.trim();
  if (!trimmedName || !trimmedPass) return alert('Both fields required');

  const newUser = { name: trimmedName, password: trimmedPass };
  localStorage.setItem('micah-user', JSON.stringify(newUser));
  setUser(newUser);
  setActiveTab('messages');

  // ✅ Fix: These lines must be INSIDE the function
  sessionIdRef.current = `${trimmedName}-${trimmedPass}`;

  try {
    const res = await axios.get(`${API_BASE}/history`, {
      params: { sessionId: sessionIdRef.current },
    });

    const history = res.data.map((msg) => ({
      sender: msg.sender,
      text: msg.text,
      timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    setMessages(
      history.length > 0
        ? history
        : [{
            sender: 'bot',
            text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?",
          }]
    );
  } catch (err) {
    console.error('❌ Failed to load chat history after login:', err);
    setMessages([{
      sender: 'bot',
      text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?",
    }]);
  }
};

  const showMainOptions = () => setShowWelcomeOptions(true);

  return (
  <div className="chat-wrapper">
    <div className="chat-box" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Header */}
      {activeTab === 'messages' && (
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
      )}

      {/* Main scrollable area */}
      <div
  ref={chatBodyRef}
  className={`chat-body ${activeTab === 'home' ? 'home-tab-wrapper home-fade' : ''}`}
  style={{
    ...(activeTab === 'home'
      ? {
          background: 'linear-gradient(to bottom, #000428, #004e92)',
          color: 'white',
          position: 'relative',
        }
      : {}),
    flex: 1,
    overflowY: 'auto',
    paddingTop: '16px',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingBottom: activeTab === 'home' ? '80px' : '16px',
  }}
>

        {/* Home tab content */}
        {activeTab === 'home' && (
  <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <img src="/bot-avatar(2).png" alt="DDT Logo" style={{ height: '42px', objectFit: 'contain' }} />
      <div className="avatar-row" style={{ marginTop: '2px', display: 'flex', alignItems: 'center' }}>
        <img
          src="/micah-toggle.jpg"
          alt="Support"
          style={{ height: '44px', width: '44px', borderRadius: '50%', objectFit: 'cover', aspectRatio: '1 / 1', marginRight: '-4px' }}
        />
        <div className="user-initial-circle">{user?.name?.[0] || 'G'}</div>
        <button className="chat-close-btn" onClick={() => window.parent.postMessage('close-chat', '*')}>×</button>
      </div>
    </div>

    <div style={{ marginTop: '50px', marginBottom: '20px' }}>
  <h2 style={{ fontFamily: 'Cormorant Garamond', fontWeight: '600', fontSize: '24px', marginBottom: '4px' }}>
    Hello {userDisplayName.split(' ')[0]}!
  </h2>
  <p style={{ fontFamily: 'Cormorant Garamond', fontWeight: '600', fontSize: 'px', margin: 0 }}>
    How can we help?
  </p>
</div>

    <div className="welcome-card">
  {!showLoginForm ? (
    <>
      <p>
        <strong>Welcome to DDT Enterprise!</strong><br />
        You may optionally enter your <strong>name</strong> and <strong>password</strong> to resume a saved chat.
      </p>
      <div className="welcome-buttons">
        <button onClick={() => setShowLoginForm(true)}>Login</button>
        <button className="start-anon-btn" onClick={() => setActiveTab('messages')}>
          Guest
        </button>
      </div>
    </>
  ) : (
    <>
      <input
        type="text"
        placeholder="Name"
        value={loginInput.name}
        onChange={e => setLoginInput({ ...loginInput, name: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={loginInput.password}
        onChange={e => setLoginInput({ ...loginInput, password: e.target.value })}
      />
      <button className="login-btn" onClick={handleLogin}>
  Save & Continue
</button>
      <button className="start-anon-btn" onClick={() => setActiveTab('messages')}>
        Continue as Guest
      </button>
    </>
  )}
</div>

    <a
  href="https://www.thomasinspectionsva.com/"
  target="_blank"
  rel="noopener noreferrer"
  className="file-card-link"
>
  <div className="file-card">
    <img
      src="/ThomasInspection.png" // Replace with your actual icon path
      alt="Thomas Inspection Icon"
      style={{
        width: '26px',
        height: '26px',
        marginRight: '12px',
        objectFit: 'contain',
      }}
    />
    <div className="file-text">
      <div className="file-title">Thomas Inspections</div>
      <div className="file-desc">A nationwide home inspection company</div>
    </div>
  </div>
</a>
  </>
)}

        {/* Messages tab content */}
        {activeTab === 'messages' && (
          <>
            {messages.map((m, i) => {
              const isBot = m.sender === 'bot';
              return (
                <div key={i} className={`message-row ${isBot ? 'bot-row' : 'user-row'}`}>
                  {isBot && <img src="/bot-avatar.png" alt="bot-avatar" className="avatar no-blur" />}
                  <div className={`message ${isBot ? 'bot-msg' : 'user-msg'}`}>
                    <div
                      className="message-text"
                      dangerouslySetInnerHTML={{
                        __html: Array.isArray(m.text)
                          ? m.text.map(str => `<div>${str}</div>`).join('')
                          : `<div>${m.text}</div>`,
                      }}
                    />
                    <span className="timestamp">{m.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && <div className="typing-indicator">Micah is typing...</div>}
            <div ref={messagesEndRef} />

            {showWelcomeOptions && (
              <div className="welcome-options">
                {[
                  "I have a question about rent",
                  "I’d like to ask about payment options",
                  "I need help with the application process",
                  "I’d like to schedule a property tour",
                  "I have an urgent or emergency concern",
                ].map(opt => (
                  <div key={opt} className="option-box" onClick={() => handleSend(opt)}>
                    {opt}
                  </div>
                ))}
              </div>
            )}

            {!showWelcomeOptions && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <div className="option-box" onClick={showMainOptions}>Main Menu</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Chat input always pinned at bottom */}
      {activeTab === 'messages' && (
        <div className="chat-footer">
  <div className="input-wrapper">
    <input
      type="text"
      placeholder="Type your message..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
    />
    <button className="send-arrow-btn" onClick={() => handleSend()}>
      <span className="send-arrow">➤</span>
    </button>
  </div>
</div>

      )}

      {/* Tab bar */}
      <div className="tab-bar-custom">
  <div
    className={`tab-item ${activeTab === 'home' ? 'active-tab' : ''}`}
    onClick={() => setActiveTab('home')}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="black"
style={{ color: 'black' }}
      className="tab-icon"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
    <div className="tab-label" style={{ color: activeTab === 'home' ? 'black' : '#888' }}>Home</div>
  </div>

  <div
    className={`tab-item ${activeTab === 'messages' ? 'active-tab' : ''}`}
    onClick={() => setActiveTab('messages')}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="black"
style={{ color: 'black' }}
      className="tab-icon"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
      />
    </svg>
    <div className="tab-label" style={{ color: activeTab === 'messages' ? 'black' : '#888' }}>Messages</div>
  </div>
</div>

    </div>
  </div>
);
}

export default FullChat;