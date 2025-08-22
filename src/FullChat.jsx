import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import qaData from './qaData';
import { v4 as uuidv4 } from 'uuid';

const API_BASE = '/api';

export default function FullChat() {
  // --- STATE ---
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('micah-user');
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.name && parsed?.password) return parsed;
    } catch {}
    return null; // guest by default
  });
  const [input, setInput] = useState('');
  const [showWelcomeOptions, setShowWelcomeOptions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [menuStep, setMenuStep] = useState(0); // 0 = top-level, 1 = Home submenu

  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  const sessionIdRef = useRef(null);

  // --- SESSION ID (guest-safe) ---
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

  // --- EFFECTS ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE}/history`, { params: { sessionId } });
        if (!Array.isArray(res.data)) throw new Error('Expected an array from /api/history');

        const history = res.data.map((msg) => {
          let fixedText = String(msg.text).replace(
            /local real estate agent|a local realtor|real estate professional|local property manager|a local market analysis|consult with.*?agent|check with.*?agent|check with.*?realtor/gi,
            'DDT Enterprise'
          );
          return {
            sender: msg.sender,
            text: fixedText,
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        });

        setMessages(
          history.length > 0
            ? history
            : [{ sender: 'bot', text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?" }]
        );
      } catch (err) {
        console.error('❌ Failed to load chat history:', err);
        setMessages([{ sender: 'bot', text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?" }]);
      }
    };
    fetchHistory();
  }, [sessionId]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages.length]);

  // --- HELPERS ---
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

    // Optional topic classification
    try {
      const classifyRes = await axios.post(`${API_BASE}/classify`, { text: userRaw });
      const topic = classifyRes.data.topic;
      await axios.post(`${API_BASE}/tag-topic`, { sessionId, sender: 'user', text: userRaw, topic });
    } catch (err) {
      console.warn('❌ Topic classification failed:', err?.message || err);
    }

    setIsTyping(true);

    // Short-term context (skip contact line spam)
    const recentContext = messages
      .filter((m) => {
        const rawText = Array.isArray(m.text) ? m.text.join(' ') : String(m.text).replace(/<[^>]*>/g, '').toLowerCase();
        return !(m.sender === 'bot' && rawText.includes('contact me directly at (757)'));
      })
      .slice(-8)
      .map((m) => `${m.sender === 'user' ? 'User' : 'Micah'}: ${Array.isArray(m.text) ? m.text.join(' ') : String(m.text).replace(/<[^>]*>/g, '')}`)
      .join('\n');

    const messagesPayload = [
      {
        role: 'system',
        content: `You are Micah, a friendly and helpful property-management expert for DDT Enterprise, a nationwide property management company.
You speak with the polite charm of a 27-year-old from Marion, Arkansas — warm, professional, and respectful with a light Southern tone.
Avoid referring to yourself with gendered language or personal stories. Focus on helping the customer clearly and concisely.
Keep responses short (2–3 sentences max unless necessary). FAQs: ${JSON.stringify(qaData)}`,
      },
      { role: 'user', content: userRaw },
    ];

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        model: 'gpt-4o',
        messages: messagesPayload,
        sessionId,
      });

      let reply = res.data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';

      // Replace generic agent references with your number
      reply = reply.replace(
        /local real estate agent|a local realtor|real estate professional|local property manager|a local market analysis|consult with.*?agent|check with.*?agent|check with.*?realtor/gi,
        'me directly at (757) 408 - 7241'
      );

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

  return (
    <div className="chat-wrapper">
      <div className="chat-box" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
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

        {/* Messages area */}
        <div ref={chatBodyRef} className="chat-body" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
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
                        ? m.text.map((str) => `<div>${str}</div>`).join('')
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
          {!showWelcomeOptions && (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
    <div
      className="option-box"
      onClick={() => {
        setMenuStep(0);              // reset to top-level
        setShowWelcomeOptions(true); // re-open the menu
      }}
    >
      Main Menu
    </div>
  </div>
)}

          {/* Tiered welcome options */}
          {/* Tiered welcome options */}
{showWelcomeOptions && (
  <div className="welcome-options">
    {menuStep === 0 && (
      <>
        <div className="option-box" onClick={() => setMenuStep(1)}>
          General Housing Help
        </div>

        <div
          className="option-box"
          onClick={() => {
            // Rule-based reply (no GPT call)
            addMessage({ sender: 'user', text: 'Thomas Inspection' });
            addMessage({
              sender: 'bot',
              text:
                'Thomas Inspections is a nationwide home inspection company. Learn more at <a href="https://www.thomasinspectionsva.com/" target="_blank" rel="noopener noreferrer">Visit Thomas Inspections</a>',
            });
            setShowWelcomeOptions(false);
          }}
        >
          Thomas Inspection
        </div>

        <div
          className="option-box"
          onClick={() => {
            setShowWelcomeOptions(false);
            handleSend('Rental Availability'); // ← goes through qaData / GPT
          }}
        >
          Rental Availability
        </div>
      </>
    )}

    {menuStep === 1 && (
      <>
        {[
          'I have a question about rent',
          'I’d like to ask about payment options',
          'I need help with the application process',
          'I’d like to schedule a property tour',
          'I have an urgent or emergency concern',
        ].map((opt) => (
          <div key={opt} className="option-box" onClick={() => handleSend(opt)}>
            {opt}
          </div>
        ))}
        <div className="option-box" onClick={() => setMenuStep(0)}>⬅ Back</div>
      </>
    )}
  </div>
)}
        </div>

        {/* Footer input */}
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
      </div>
    </div>
  );
}
