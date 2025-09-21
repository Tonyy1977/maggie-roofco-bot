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
    return null;
  });
  const [input, setInput] = useState('');
  const [showWelcomeOptions, setShowWelcomeOptions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [menuStep, setMenuStep] = useState(0);
  const [bookingOptions, setBookingOptions] = useState(null);

  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  const sessionIdRef = useRef(null);

  // --- SESSION ID ---
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

      let lastBookingType = null;
      let lastBookingMarker = null;

      const processMessage = (msg) => {
        let cleanText = String(msg.text).replace(
          /local real estate agent|a local realtor|real estate professional|local property manager|a local market analysis|consult with.*?agent|check with.*?agent|check with.*?realtor/gi,
          'DDT Enterprise'
        );

        const bookingReplies = [
          "__BOOKING_TOUR_NEW__",
          "__BOOKING_TOUR_AVAIL__",
          "__BOOKING_TOUR_RESCHEDULE__",
          "__BOOKING_MEETING_NEW__",
          "__BOOKING_MEETING_RESCHEDULE__"
        ];

        const marker = bookingReplies.find(m => cleanText.includes(m));
        if (marker) {
          lastBookingType = marker.includes("MEETING") ? "meeting" : "tour";
          lastBookingMarker = marker;

          return [{
            sender: "bot",
            type: "text",
            text:
              marker === "__BOOKING_TOUR_NEW__"
                ? "Perfect! We’d love to give you a tour. Would you like me to schedule it for you, or would you prefer to book it yourself?"
                : marker === "__BOOKING_TOUR_AVAIL__"
                ? "Tours are available throughout the week. I can check Demetrice’s calendar and show you available times. Would you like me to do that?"
                : marker === "__BOOKING_TOUR_RESCHEDULE__"
                ? "No worries — life happens! Let’s get you rescheduled. Do you want me to handle it, or would you prefer to pick a new time yourself?"
                : marker === "__BOOKING_MEETING_NEW__"
                ? "Got it! I can help you set up a 30-minute meeting. Would you like me to handle the scheduling, or would you prefer to book it yourself?"
                : "No problem — we can reschedule your meeting. Would you like me to take care of it, or would you like to choose a new time yourself?",
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }];
        }

        // Normal message
        return [{
          sender: msg.sender,
          text: cleanText,
          type: msg.type || "text",
          options: msg.options || [],
          bookingType: msg.bookingType || null,
          slots: msg.slots || [],
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }];
      };

      const history = res.data.flatMap(processMessage);

      // Set normal chat messages
      setMessages(
        history.length > 0
          ? history
          : [{ sender: 'bot', text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?" }]
      );

      // If last message was a booking marker → restore floating options
      if (lastBookingMarker) {
        setBookingOptions({
          bookingType: lastBookingType,
          options: [
            { label: "Book with Micah", type: "micah" },
            { label: "Book Myself", type: "self" }
          ]
        });
      }
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
      type: msg.type || "text",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, fullMsg]);
  };

  // --- BOOKING HANDLERS ---
  const handleBookingChoice = (choice, bookingType) => {
    if (choice === "self") {
      const link =
        bookingType === "tour"
          ? "https://tidycal.com/ddtenterpriseusa/15-minute-meeting"
          : "https://tidycal.com/ddtenterpriseusa/30-minute-meeting";

      addMessage({
        sender: "bot",
        type: "text",
        text: `No problem! You can book directly here: <a href="${link}" target="_blank" rel="noopener noreferrer">Schedule Now</a>`,
      });
    } else {
      axios
        .get(`${API_BASE}/tidycal/availability`, { params: { type: bookingType } })
        .then((res) => {
          addMessage({
            sender: "bot",
            type: "time-slots",
            bookingType,
            slots: res.data.slots || ["10:00 AM", "1:30 PM", "4:00 PM"],
          });
        })
        .catch(() => {
          addMessage({
            sender: "bot",
            type: "text",
            text: "❌ Sorry, I couldn’t fetch availability. Please use the direct link instead.",
          });
        });
    }
  };

  const handleTimeSelection = (slot, bookingType) => {
    axios
      .post(`${API_BASE}/tidycal/book`, { slot, type: bookingType })
      .then(() => {
        addMessage({
          sender: "bot",
          type: "text",
          text: `✅ Your ${bookingType} is confirmed for ${slot}. A confirmation email will be sent to you.`,
        });
      })
      .catch(() => {
        addMessage({
          sender: "bot",
          type: "text",
          text: "❌ Sorry, I couldn’t complete the booking. Please use the direct link instead.",
        });
      });
  };

  // --- SEND HANDLER ---
  const handleSend = async (text = input) => {
    const userRaw = text.trim();
    if (!userRaw) return;
    setInput('');
    setShowWelcomeOptions(false);
    addMessage({ sender: 'user', text: userRaw });

    try {
      const classifyRes = await axios.post(`${API_BASE}/classify`, { text: userRaw });
      const topic = classifyRes.data.topic;
      await axios.post(`${API_BASE}/tag-topic`, { sessionId, sender: 'user', text: userRaw, topic });
    } catch (err) {
      console.warn('❌ Topic classification failed:', err?.message || err);
    }

    setIsTyping(true);

    const messagesPayload = [
      {
        role: 'system',
        content: `You are Micah... FAQs: ${JSON.stringify(qaData)}`,
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

      reply = reply.replace(
        /local real estate agent|a local realtor|real estate professional|local property manager|a local market analysis|consult with.*?agent|check with.*?agent|check with.*?realtor/gi,
        'me directly at (757) 408 - 7241'
      );

      const bookingReplies = [
        "__BOOKING_TOUR_NEW__",
        "__BOOKING_TOUR_AVAIL__",
        "__BOOKING_TOUR_RESCHEDULE__",
        "__BOOKING_MEETING_NEW__",
        "__BOOKING_MEETING_RESCHEDULE__"
      ];

      const marker = bookingReplies.find(m => reply.includes(m));
      if (marker) {
        let bookingType = marker.includes("MEETING") ? "meeting" : "tour";

        addMessage({
          sender: "bot",
          type: "text",
          text:
            marker === "__BOOKING_TOUR_NEW__"
              ? "Perfect! We’d love to give you a tour. Would you like me to schedule it for you, or would you prefer to book it yourself?"
              : marker === "__BOOKING_TOUR_AVAIL__"
              ? "Tours are available throughout the week. I can check Demetrice’s calendar and show you available times. Would you like me to do that?"
              : marker === "__BOOKING_TOUR_RESCHEDULE__"
              ? "No worries — life happens! Let’s get you rescheduled. Do you want me to handle it, or would you prefer to pick a new time yourself?"
              : marker === "__BOOKING_MEETING_NEW__"
              ? "Got it! I can help you set up a 30-minute meeting. Would you like me to handle the scheduling, or would you prefer to book it yourself?"
              : "No problem — we can reschedule your meeting. Would you like me to take care of it, or would you like to choose a new time yourself?",
        });

        setBookingOptions({
  bookingType,
  options: [
    { label: "Book with Micah", type: "micah" },
    { label: "Book Myself", type: "self" }
  ]
});

        setIsTyping(false);
        return;
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

        {/* Messages */}
        <div ref={chatBodyRef} className="chat-body" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {messages.map((m, i) => {
  const isBot = m.sender === 'bot';
  return (
    <div key={i} className={`message-row ${isBot ? 'bot-row' : 'user-row'}`}>
      {isBot && <img src="/bot-avatar.png" alt="bot-avatar" className="avatar no-blur" />}
      <div className={`message ${isBot ? 'bot-msg' : 'user-msg'}`}>
        {m.type === "text" && (
          <div
            className="message-text"
            dangerouslySetInnerHTML={{
              __html: Array.isArray(m.text)
                ? m.text.map((str) => `<div>${str}</div>`).join('')
                : `<div>${m.text}</div>`,
            }}
          />
        )}
        <span className="timestamp">{m.timestamp}</span>
      </div>

      {m.type === "time-slots" && (
        <div className="time-slots">
          {m.slots.map((slot, idx) => (
            <div
              key={idx}
              className="option-box"
              onClick={() => handleTimeSelection(slot, m.bookingType)}
            >
              {slot}
            </div>
          ))}
        </div>
      )}
    </div>
  );
})}

{/* Render booking options once, like welcome-options */}
{bookingOptions && (
  <div className="booking-options">
    {bookingOptions.options.map((opt, idx) => (
      <div
        key={idx}
        className="option-box"
        onClick={() => {
          handleBookingChoice(opt.type, bookingOptions.bookingType);
          setBookingOptions(null); // hide buttons after click
        }}
      >
        {opt.label}
      </div>
    ))}
  </div>
)}


          {isTyping && <div className="typing-indicator">Micah is typing...</div>}
          <div ref={messagesEndRef} />

          {!showWelcomeOptions && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <div
                className="option-box"
                onClick={() => {
                  setMenuStep(0);
                  setShowWelcomeOptions(true);
                }}
              >
                Main Menu
              </div>
            </div>
          )}

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
                      handleSend('Rental Availability');
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

        {/* Footer */}
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
