import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import qaData from './qaData';

function App() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
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

  const addMessage = (msg) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
  };

  const handleSend = async (text = input) => {
    const userRaw = text.trim();
    if (!userRaw) return;

    setInput('');
    setShowWelcomeOptions(false);
    addMessage({ sender: 'user', text: userRaw });
    setIsTyping(true);

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    try {
      const messagesPayload = [
        {
          role: 'system',
          content: `You are Micah, a friendly and helpful property-management expert for DDT Enterprise, a nationwide property management company. 
Speak like a warm, professional Caucasian woman from Marion, Arkansas — with a light Southern charm and polite hospitality, 
but keep it professional and easy to understand for all customers. Be clear, concise, and helpful. Keep answers short — 
no more than 2–3 sentences unless necessary. FAQs: ${JSON.stringify(qaData)}`
        },
        { role: 'user', content: userRaw }
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messagesPayload,
        }),
      });

      const text = await res.text();
      let js;

      try {
        js = JSON.parse(text);
      } catch {
        console.error('❌ Failed to parse OpenAI response:', text);
        addMessage({ sender: 'bot', text: 'Server returned invalid response. Try again.' });
        return;
      }

      if (!res.ok) {
        addMessage({
          sender: 'bot',
          text: `Error: ${js.error?.message || 'Unknown error'}`,
        });
      } else {
        const reply = js.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
        addMessage({ sender: 'bot', text: reply });
      }

    } catch (err) {
      console.error('❌ Network error:', err);
      addMessage({ sender: 'bot', text: 'Network error contacting GPT.' });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Popup greeting */}
      {showPopup && (
        <div className="popup-message-row">
          <img
            src="/bot-avatar.png"
            alt="avatar"
            className="popup-avatar"
          />
          <div className="popup-message-bubble">
            Hi, I'm Micah, DDT's virtual assistant. How can I help you today?
          </div>
        </div>
      )}

      {/* Avatar toggle */}
      {!isOpen && (
        <div className="avatar-toggle" onClick={() => setIsOpen(true)}>
          <img
            src="/micah-toggle.jpg"
            alt="Micah avatar toggle"
          />
        </div>
      )}

      {isOpen && (
        <div className="chat-wrapper" style={{ bottom: '82px' }}>
          <div className="chat-box">

            {/* Header */}
            <div className="chat-header no-blur">
              <div className="header-left">
                <img
                  src="/micah-header.png"
                  alt="Micah Avatar"
                  className="header-avatar no-blur square-avatar"
                />
                <div className="header-info">
                  <span className="bot-name">Micah</span>
                  <span className="ai-badge">AI</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
            </div>

            {/* Chat content */}
            <div className="chat-content-card">
              <div className="chat-body">
                {messages.map((m, i) => (
                  <div key={i} className={`message-row ${m.sender}-row`}>
                    {m.sender === 'bot' && (
                      <img
                        src="/bot-avatar.png"
                        alt="bot-avatar"
                        className="avatar no-blur"
                      />
                    )}
                    <div
                      className={`message ${m.sender}-msg`}
                      style={{
                        fontFamily: m.sender === 'bot'
                          ? "'Cormorant Garamond', serif"
                          : "'Times New Roman', serif"
                      }}
                    >
                      <div
                        className="message-text"
                        dangerouslySetInnerHTML={{
                          __html: Array.isArray(m.text)
                            ? m.text.map(str => `<div>${str}</div>`).join('')
                            : `<div>${m.text}</div>`
                        }}
                      ></div>
                      <span className="timestamp">{m.timestamp}</span>
                    </div>
                  </div>
                ))}

                {isTyping && <div className="typing-indicator">Micah is typing...</div>}
                <div ref={messagesEndRef} />
                {showWelcomeOptions && (
                  <div className="welcome-options">
                    {['I have a question about rent', 'I’d like to ask about payment options', 'I need help with the application process', 'I’d like to schedule a property tour', 'I have an urgent or emergency concern', 'Thomas Inspections'].map((opt) => (
                      <div key={opt} className="option-box" onClick={() => handleSend(opt)}>{opt}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="chat-footer">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button onClick={() => handleSend()}>➤</button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default App;