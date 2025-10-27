import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import qaData from "./qaData";
import { v4 as uuidv4 } from "uuid";
import BookingWidget from "./BookingWidget";
import ReactMarkdown from "react-markdown";

const API_BASE = "/api";
const BOT_NAME = "Maggie";

export default function FullChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showWelcomeOptions, setShowWelcomeOptions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [menuStep, setMenuStep] = useState(0);
  const chatBodyRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

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
      const stored = localStorage.getItem("maggie-user");
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed?.name && parsed?.email) id = `${parsed.name}-${parsed.email}`;
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
    return id;
  };

  // ✅ Load chat history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) return;
      try {
        const res = await axios.get(`${API_BASE}/history`, {
          params: { sessionId },
        });
        const history = Array.isArray(res.data) ? res.data : [];

        setMessages(
          history.length > 0
            ? history.map((msg) => {
                const rawTs = msg.timestamp || msg.createdAt;
                const date = rawTs ? new Date(rawTs) : null;
                const timestamp = date && !Number.isNaN(date.getTime())
                  ? date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--";
                return {
                  sender: msg.sender,
                  text: String(msg.text),
                  type: "text",
                  timestamp,
                };
              })
            : [
                {
                  sender: "bot",
                  text: "Hey there, I'm Maggie, your assistant at The Roofing Company. What can I do for you today?",
                  type: "text",
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ]
        );
      } catch (err) {
        console.error("❌ Error loading chat history:", err);
        setMessages([
          {
            sender: "bot",
            text: "Hey there, I’m Maggie, your assistant at The Roofing Company. What can I do for you today?",
            type: "text",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
        setIsHeaderMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addMessage = (msg) => {
    const full = {
      ...msg,
      type: msg.type || "text",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, full]);
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

      const sid = ensureSessionId();

      const res = await axios.post(`${API_BASE}/chat`, {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
You are Maggie, a friendly and helpful assistant for The Roofing Company. 
Keep responses clear, polite, and under 3 sentences unless necessary.
FAQs: ${JSON.stringify(qaData)}
            `,
          },
          { role: "user", content: userRaw },
        ],
        sessionId: sid,
      });

      let reply = res.data?.choices?.[0]?.message?.content || "";
      if (reply) {
        addMessage({ sender: "bot", text: reply });
      } else {
        addMessage({ sender: "bot", text: "Sorry, something went wrong." });
      }
    } catch (err) {
      console.error("❌ Chat error:", err);
      addMessage({ sender: "bot", text: "Server error, please try again." });
    } finally {
      setIsTyping(false);
      setShowWelcomeOptions(true);
    }
  };

  const handleDownloadTranscript = async () => {
  try {
    const sid = ensureSessionId();

    const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://maggie-roofco-bot.vercel.app"
    : "http://localhost:4000";

    const response = await fetch(
      `${BASE_URL}/api/history/download?sessionId=${encodeURIComponent(sid)}`
    );

    if (!response.ok) {
      console.error("❌ Failed to download transcript:", response.statusText);
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `maggie-chat-${sid}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("❌ Error downloading transcript:", error);
  } finally {
    setIsHeaderMenuOpen(false);
  }
};

  return (
    <div className="micah-chat">
      <div className="chat-wrapper">
        <div
          className="chat-box"
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* Header */}
          <div className="chat-header no-blur">
            <div className="header-left">
              <img
                src="/Maggie.png"
                alt="Maggie Avatar"
                className="header-avatar no-blur square-avatar"
              />
              <div className="header-info">
                <span className="bot-name">Maggie</span>
                <span className="ai-badge">AI</span>
              </div>
            </div>
            <div className="header-actions" ref={headerMenuRef}>
              <button
                className="header-icon-btn"
                type="button"
                onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isHeaderMenuOpen}
                aria-label="Chat options"
              >
                ⋮
              </button>
              {isHeaderMenuOpen && (
                <div className="header-menu" role="menu">
                  <button type="button" onClick={handleDownloadTranscript} role="menuitem">
                    Download transcript
                  </button>
                </div>
              )}
              <button
                className="close-btn"
                onClick={() => window.parent.postMessage("close-chat", "*")}
                type="button"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatBodyRef}
            className="chat-body"
            style={{ flex: 1, overflowY: "auto", padding: "16px" }}
          >
            {messages.map((m, i) => {
              const isBot = m.sender === "bot";
              return (
                <div
                  key={i}
                  className={`message-row ${isBot ? "bot-row" : "user-row"}`}
                >
                  {isBot && (
                    <img
                      src="/Maggie.png"
                      alt="bot-avatar"
                      className="avatar no-blur"
                    />
                  )}
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

                    {/* ✅ Timestamp fixed */}
                    <span className="timestamp">{m.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="typing-indicator">Maggie is typing...</div>
            )}
            <div ref={messagesEndRef} />

            {/* Welcome Options */}
            {showWelcomeOptions && (
              <div className="welcome-options">
                {menuStep === 0 && (
                  <>
                    <div
                      className="option-box"
                      onClick={() => setMenuStep(1)}
                    >
                      General Help
                    </div>
                  </>
                )}
                {menuStep === 1 && (
                  <>
                    {[
                      "I'd like to ask about payment options",
                      "I'd like to schedule an appointment",
                      "I have an urgent or emergency concern",
                    ].map((opt) => (
                      <div
                        key={opt}
                        className="option-box"
                        onClick={() => handleSend(opt)}
                      >
                        {opt}
                      </div>
                    ))}
                    <div
                      className="option-box"
                      onClick={() => setMenuStep(0)}
                    >
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
              <button
                className="send-arrow-btn"
                onClick={() => handleSend()}
              >
                <span className="send-arrow">➤</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
