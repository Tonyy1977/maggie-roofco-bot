import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import qaData from "./qaData";
import { v4 as uuidv4 } from "uuid";
import BookingWidget from "./BookingWidget";
import ReactMarkdown from "react-markdown";

const API_BASE = "/api";
const BOT_NAME = "Brian";

export default function FullChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showWelcomeOptions, setShowWelcomeOptions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [menuStep, setMenuStep] = useState(0);
  const chatBodyRef = useRef(null);
  const messagesEndRef = useRef(null);
  //const [bookingTypes, setBookingTypes] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  // ✅ Fetch booking types (Outlook)
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        //const res = await axios.get("/api/outlook/types");
        //setBookingTypes(res.data || []);
      } catch (err) {
        console.error("Error fetching booking types:", err);
      }
    };
    fetchTypes();
  }, []);

  // ✅ Session handling
  useEffect(() => {
    if (typeof window === "undefined" || sessionId) return;
    let id = null;
    try {
  const stored = localStorage.getItem("maggie-user");
  const parsed = stored ? JSON.parse(stored) : null;
  if (parsed?.name && parsed?.email) {
    id = `${parsed.name}-${parsed.email}`;
  }
} catch (e) {
  console.error("JSON parse error:", e);
}
if (!id) {
  let guestId = localStorage.getItem("maggie-guest-session");
  if (!guestId) {
    guestId = `guest-${uuidv4()}`;
    localStorage.setItem("maggie-guest-session", guestId);
  }
  id = guestId;
}
setSessionId(id);
  }, [sessionId]);

  const ensureSessionId = () => {
    if (sessionId) return sessionId;
    if (typeof window === "undefined") return "guest";
    let id = null;
    try {
      const stored = localStorage.getItem("brian-user");
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed?.name && parsed?.email) id = `${parsed.name}-${parsed.email}`;
    } catch (e) {
      console.error("JSON parse error:", e);
    }
    if (!id) {
      let guestId = localStorage.getItem("brian-guest-session");
      if (!guestId) {
        guestId = `guest-${uuidv4()}`;
        localStorage.setItem("brian-guest-session", guestId);
      }
      id = guestId;
    }
    setSessionId(id);
    return id;
  };

  // ✅ Load history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE}/history`, {
          params: { sessionId },
        });
        const history = Array.isArray(res.data) ? res.data : [];
        setMessages(
          history.length > 0
            ? history.map((msg) => ({
                sender: msg.sender,
                text: String(msg.text),
                type: "text",
                timestamp: msg.createdAt,
              }))
            : [
                {
                  sender: "bot",
                  text: "Hey there, I’m Maggie, your assistant at The Roofing Company. What can I do for you today?",
                  type: "text",
                },
              ]
        );
      } catch {
        setMessages([
          {
            sender: "bot",
            text: "Hey there, I’m Maggie, your assistant at The Roofing Company. What can I do for you today?",
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
      timestamp: new Date().toISOString(),
    };
    setMessages((p) => [...p, full]);
    setMenuStep(0);
  };

  const handleSend = async (text = input) => {
    const userRaw = (text || "").trim();
    if (!userRaw) return;
    setInput("");
    setShowWelcomeOptions(false);
    addMessage({ sender: "user", text: userRaw });

    try {
      setIsTyping(true);

      const systemPrompt = `
You are Maggie, a friendly and helpful 28-year-old woman from Marion, Arkansas. 
You are the virtual assistant for The Roofing Company, here to help customers with roofing questions and services.
You speak with light Southern charm and polite hospitality, but keep it professional and easy to understand. 
Be clear, concise, and helpful. Keep answers short 2–3 sentences unless necessary.

📅 Scheduling Rules:
- When user asks to schedule, show available appointment types.
- Do not list times or suggest slots manually; always show the booking widget.

FAQs: ${JSON.stringify(qaData)}
      `;

      const sid = ensureSessionId();

      const res = await axios.post(`${API_BASE}/chat`, {
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userRaw },
        ],
        sessionId: sid,
      });

      let reply = res.data?.choices?.[0]?.message?.content || "";

      // ✅ Detect scheduling intent
      //if (
        //userRaw.toLowerCase().includes("schedule") ||
        //userRaw.toLowerCase().includes("appointment") ||
        //userRaw.toLowerCase().includes("book")
      //) {
        //addMessage({
          //sender: "bot",
          //type: "text",
          //text: "What type of appointment are you looking for?",
        //});

        //addMessage({
          //sender: "bot",
          //type: "booking-types",
          //options: bookingTypes,
        //});
        //return;
      //}

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
              <img src="/Maggie.png" alt="Micah Avatar" className="header-avatar no-blur square-avatar" />
              <div className="header-info">
                <span className="bot-name">Maggie</span>
                <span className="ai-badge">AI</span>
              </div>
            </div>
            <button
              className="close-btn"
              onClick={() => window.parent.postMessage("close-chat", "*")}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div ref={chatBodyRef} className="chat-body" style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {messages.map((m, i) => {
              const isBot = m.sender === "bot";
              return (
                <div key={i} className={`message-row ${isBot ? "bot-row" : "user-row"}`}>
                  {isBot && <img src="/Maggie.png" alt="bot-avatar" className="avatar no-blur" />}
                  <div className={`message ${isBot ? "bot-msg" : "user-msg"}`}>
                    {m.type === "text" && (
                      <div className="message-text">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                    )}

                    {m.type === "booking-types" && (
                      <div className="booking-type-list">
                        {m.options.map((bt) => (
                          <button
                            key={bt.id}
                            className="option-box"
                            onClick={() => {
                              addMessage({ sender: "user", text: bt.title });
                              addMessage({
                                sender: "bot",
                                type: "calendar",
                                bookingTypeId: bt.id,
                                bookingTypeName: bt.title,
                              });
                            }}
                          >
                            {bt.title}
                          </button>
                        ))}
                      </div>
                    )}

                    {m.type === "calendar" && (
                      <BookingWidget
                        bookingTypeId={m.bookingTypeId}
                        bookingTypeName={m.bookingTypeName}
                        addMessage={addMessage}
                      />
                    )}

                    {/* ✅ Fixed Timestamp */}
                    <span className="timestamp">
                      {(() => {
                        try {
                          if (!m.timestamp) return "—";
                          let dateObj = null;
                          const t = m.timestamp;

                          if (typeof t === "object" && t.$date) {
                            dateObj = new Date(t.$date);
                          } else if (typeof t === "number") {
                            dateObj = new Date(t);
                          } else if (typeof t === "string") {
                            const trimmed = t.trim().replace(/^"|"$/g, "");
                            if (/^\d+$/.test(trimmed)) {
                              dateObj = new Date(parseInt(trimmed));
                            } else {
                              const parsed = Date.parse(trimmed);
                              if (!isNaN(parsed)) dateObj = new Date(parsed);
                            }
                          }

                          return dateObj && !isNaN(dateObj.getTime())
                            ? dateObj.toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "—";
                        } catch {
                          return "—";
                        }
                      })()}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && <div className="typing-indicator">Maggie is typing...</div>}
            <div ref={messagesEndRef} />

            {/* Welcome Options */}
            {showWelcomeOptions && (
              <div className="welcome-options">
                {menuStep === 0 && (
                  <>
                    <div className="option-box" onClick={() => setMenuStep(1)}>
                      General Help
                    </div>
                  </>
                )}
                {menuStep === 1 && (
                  <>
                    {[
                      "I’d like to ask about payment options",
                      "I’d like to schedule an appointment",
                      "I have an urgent or emergency concern",
                    ].map((opt) => (
                      <div key={opt} className="option-box" onClick={() => handleSend(opt)}>
                        {opt}
                      </div>
                    ))}
                    <div className="option-box" onClick={() => setMenuStep(0)}>
                      ⬅ Back
                    </div>
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
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button className="send-arrow-btn" onClick={() => handleSend()}>
                <span className="send-arrow">➤</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
