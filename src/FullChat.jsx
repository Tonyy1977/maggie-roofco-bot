import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import qaData from "./qaData";
import { v4 as uuidv4 } from "uuid";

const API_BASE = "/api";

export default function FullChat() {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [input, setInput] = useState("");
  const [showWelcomeOptions, setShowWelcomeOptions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [menuStep, setMenuStep] = useState(0);
  const [pendingBooking, setPendingBooking] = useState(null); // ✅ track booking waiting for name/email

  const chatBodyRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(null);

  // ✅ Load user from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("micah-user");
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.name && parsed?.email) {
          setUser(parsed);
        }
      } catch {}
    }
  }, []);

  // ✅ Generate sessionId (user or guest)
  useEffect(() => {
    if (!sessionIdRef.current) {
      if (user) {
        sessionIdRef.current = `${user.name}-${user.email}`;
      } else if (typeof window !== "undefined") {
        let guestId = localStorage.getItem("micah-guest-session");
        if (!guestId) {
          guestId = `guest-${uuidv4()}`;
          localStorage.setItem("micah-guest-session", guestId);
        }
        sessionIdRef.current = guestId;
      }
    }
  }, [user]);
  const sessionId = sessionIdRef.current;

  // ✅ Load history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE}/history`, { params: { sessionId } });
        const history = Array.isArray(res.data) ? res.data : [];
        setMessages(
          history.length > 0
            ? history.map((msg) => ({
                sender: msg.sender,
                text: String(msg.text),
                type: "text",
                timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }))
            : [
                {
                  sender: "bot",
                  text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?",
                  type: "text",
                },
              ]
        );
      } catch {
        setMessages([
          {
            sender: "bot",
            text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?",
            type: "text",
          },
        ]);
      }
    };
    fetchHistory();
  }, [sessionId]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages.length]);

  const addMessage = (msg) => {
    const full = {
      ...msg,
      type: msg.type || "text",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((p) => [...p, full]);
  };

  /* ---------- GPT + Suggest + Book flow ---------- */
  const handleSend = async (text = input) => {
    const userRaw = (text || "").trim();
    if (!userRaw) return;
    setInput("");
    setShowWelcomeOptions(false);
    addMessage({ sender: "user", text: userRaw });

    // ✅ Handle pending booking (waiting for name/email)
    if (pendingBooking) {
      const parts = userRaw.split(/[,|]/).map((s) => s.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        const email = parts[1];

        try {
          const bookRes = await axios.post(`${API_BASE}/tidycal/book`, {
            ...pendingBooking,
            name,
            email,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });

          if (bookRes.status === 201) {
            addMessage({
              sender: "bot",
              text: `Great! I’ve booked your ${pendingBooking.type} for ${pendingBooking.date} at ${pendingBooking.time}. ✅ A confirmation email has been sent.`,
            });
          } else {
            addMessage({ sender: "bot", text: "Something went wrong. Please try again later." });
          }
        } catch (err) {
          console.error("Booking error:", err);
          addMessage({ sender: "bot", text: "I couldn’t connect to TidyCal right now. Please try again later." });
        }

        setPendingBooking(null);
      } else {
        addMessage({
          sender: "bot",
          text: "Please provide both your name and email, separated by a comma. Example: John Doe, john@example.com",
        });
      }
      return; // stop here
    }

    try {
      setIsTyping(true);

      const systemPrompt = `
You are Micah, a friendly and helpful 28-year-old woman from Marion, Arkansas. 
You are the virtual assistant for DDT Enterprise, a nationwide property management company. 
You speak with light Southern charm and polite hospitality, but keep it professional and easy to understand. 
Be clear, concise, and helpful. Keep answers short — 2–3 sentences unless necessary.

📅 Scheduling Rules:
- Appointments are only available:
  - Wednesday: 5–8 PM
  - Saturday: 11 AM–1 PM
  - Sunday: 2–4 PM
- Tours = 15 minutes, Meetings = 30 minutes
- Never suggest outside these windows.
- If the user provides a valid day and time, confirm once and finalize. 
- If a booking is requested, output ONLY valid JSON (no code blocks, no text). 
  Example: {"type":"meeting","date":"2025-09-28","time":"15:00"}

🛡️ Boundaries:
- Only answer property management and scheduling questions.
- If off-topic, politely reply: 
  “I can only help with property management and scheduling. Can I check available times for you?”

✅ Behavior:
- Map “meet Demetrice” → meeting.  
- Map “tour/showing/visit” → tour.  
- Interpret times naturally: “after lunch,” “evening,” etc.
- When confirming, also return structured JSON like:
  {"type":"tour","date":"2025-09-24","time":"18:30"}

FAQs: ${JSON.stringify(qaData)}
      `;

      const messagesPayload = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userRaw },
      ];

      const res = await axios.post(`${API_BASE}/chat`, {
        model: "gpt-4o",
        messages: messagesPayload,
        sessionId,
      });

      let reply = res.data?.choices?.[0]?.message?.content || "";
      let bookingObj = null;

      try {
        const match = reply.match(/\{[^}]+\}/);
        if (match) {
          bookingObj = JSON.parse(match[0]);
        }
      } catch (e) {
        bookingObj = null;
      }

      if (bookingObj?.date && bookingObj?.time && bookingObj?.type) {
        if (!user?.name || !user?.email) {
          addMessage({
            sender: "bot",
            text: "To confirm your booking, please provide your name and email.",
          });
          setPendingBooking(bookingObj);
          return;
        }

        try {
          const suggestRes = await axios.get(`${API_BASE}/tidycal/suggest`, {
            params: {
              type: bookingObj.type,
              date: bookingObj.date,
              after: bookingObj.time,
              count: 3,
            },
          });

          const primary = suggestRes.data?.options?.[0];
          if (!primary) {
            addMessage({ sender: "bot", text: "Sorry, no slots available. Try another day." });
            return;
          }

          const bookRes = await axios.post(`${API_BASE}/tidycal/book`, {
            type: bookingObj.type,
            date: bookingObj.date,
            time: bookingObj.time,
            name: user?.name || "Guest User",
            email: user?.email || "guest@example.com",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });

          if (bookRes.status === 201) {
            addMessage({
              sender: "bot",
              text: `Great! I’ve booked your ${bookingObj.type} for ${primary.human}. ✅ A confirmation email has been sent.`,
            });
          } else {
            addMessage({ sender: "bot", text: "I tried booking, but something went wrong. Please try again later." });
          }
          return;
        } catch (err) {
          console.error("Booking error:", err);
          addMessage({ sender: "bot", text: "I couldn’t connect to Schedule right now. Please try again later." });
          return;
        }
      }

      if (reply) {
        addMessage({ sender: "bot", text: reply });
      } else {
        addMessage({ sender: "bot", text: "Sorry, something went wrong." });
      }
    } catch {
      addMessage({ sender: "bot", text: "Server error, please try again." });
    } finally {
      setIsTyping(false);
      setShowWelcomeOptions(true);
    }
  };

  return (
    <div className="micah-chat">
      <div className="chat-wrapper">
        <div className="chat-box" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <div className="chat-header no-blur">
            <div className="header-left">
              <img src="/micah-header.png" alt="Micah Avatar" className="header-avatar no-blur square-avatar" />
              <div className="header-info">
                <span className="bot-name">Micah</span>
                <span className="ai-badge">AI</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => window.parent.postMessage("close-chat", "*")}>×</button>
          </div>

          {/* Messages */}
          <div ref={chatBodyRef} className="chat-body" style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {messages.map((m, i) => {
              const isBot = m.sender === "bot";
              return (
                <div key={i} className={`message-row ${isBot ? "bot-row" : "user-row"}`}>
                  {isBot && <img src="/bot-avatar.png" alt="bot-avatar" className="avatar no-blur" />}
                  <div className={`message ${isBot ? "bot-msg" : "user-msg"}`}>
                    {m.type === "text" && (
                      <div
                        className="message-text"
                        dangerouslySetInnerHTML={{
                          __html: Array.isArray(m.text)
                            ? m.text.map((str) => `<div>${str}</div>`).join("")
                            : `<div>${m.text}</div>`,
                        }}
                      />
                    )}
                    <span className="timestamp">{m.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && <div className="typing-indicator">Micah is typing...</div>}

            <div ref={messagesEndRef} />

            {!showWelcomeOptions && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
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
                        addMessage({ sender: "user", text: "Thomas Inspection" });
                        addMessage({
                          sender: "bot",
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
                        handleSend("Rental Availability");
                      }}
                    >
                      Rental Availability
                    </div>
                  </>
                )}
                {menuStep === 1 && (
                  <>
                    {[
                      "I have a question about rent",
                      "I’d like to ask about payment options",
                      "I need help with the application process",
                      "I’d like to schedule a property tour",
                      "I have an urgent or emergency concern",
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
          </div> {/* closes chat-body */}

          {/* Footer */}
          <div className="chat-footer">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button className="send-arrow-btn" onClick={() => handleSend()}>
                <span className="send-arrow">➤</span>
              </button>
            </div>
          </div>
        </div> {/* closes chat-box */}
      </div>   {/* closes chat-wrapper */}
    </div>
  );
}
