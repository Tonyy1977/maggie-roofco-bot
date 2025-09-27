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
  const [pendingBooking, setPendingBooking] = useState(null);

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
      } catch (e) {
  console.error("JSON parse error:", e);
}
    }
  }, []);

  // ✅ Generate sessionId (user or guest)
  // ✅ Keep sessionId in state so effects re-run when it's ready
const [sessionId, setSessionId] = useState(null);

// Initialize a stable sessionId immediately on mount (prefer stored user; else guest)
useEffect(() => {
  if (typeof window === "undefined" || sessionId) return;

  let id = null;
  try {
    const stored = localStorage.getItem("micah-user");
    const parsed = stored ? JSON.parse(stored) : null;
    if (parsed?.name && parsed?.email) {
      id = `${parsed.name}-${parsed.email}`;
    }
  } catch (e) {
    console.error("JSON parse error:", e);
  }

  if (!id) {
    let guestId = localStorage.getItem("micah-guest-session");
    if (!guestId) {
      guestId = `guest-${uuidv4()}`;
      localStorage.setItem("micah-guest-session", guestId);
    }
    id = guestId;
  }

  setSessionId(id);
}, [sessionId]);

// Helper to guarantee an ID exists even if user types instantly
const ensureSessionId = () => {
  if (sessionId) return sessionId;
  if (typeof window === "undefined") return "guest";

  let id = null;
  try {
    const stored = localStorage.getItem("micah-user");
    const parsed = stored ? JSON.parse(stored) : null;
    if (parsed?.name && parsed?.email) id = `${parsed.name}-${parsed.email}`;
  } catch {}

  if (!id) {
    let guestId = localStorage.getItem("micah-guest-session");
    if (!guestId) {
      guestId = `guest-${uuidv4()}`;
      localStorage.setItem("micah-guest-session", guestId);
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
        const res = await axios.get(`${API_BASE}/history`, { params: { sessionId } });
        const history = Array.isArray(res.data) ? res.data : [];
        setMessages(
  history.length > 0
    ? history.map((msg) => {
        let displayText = String(msg.text);

        // ✅ Detect booking JSON and format it
        try {
          const obj = JSON.parse(displayText);
          if (obj?.date && obj?.time && obj?.type) {
            const dt = new Date(`${obj.date}T${obj.time}:00`);
            displayText = `📅 ${obj.type} scheduled for ${dt.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}`;
          }
        } catch (e) {
  console.error("JSON parse error:", e);
}

        return {
          sender: msg.sender,
          text: displayText,
          type: "text",
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      })
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
    // ✅ Handle pending booking (waiting for name/email)
if (pendingBooking) {
  const parts = userRaw.split(/[,|]/).map((s) => s.trim());

  // Check if user actually gave name + email
  const looksLikeEmail = parts.length >= 2 && /\S+@\S+\.\S+/.test(parts[1]);

  if (looksLikeEmail) {
    const name = parts[0];
    const email = parts[1];

    try {
      const bookRes = await axios.post(`${API_BASE}/tidycal/book`, {
        type: pendingBooking.type,
        date: pendingBooking.date,
        time: pendingBooking.time,
        name,
        email,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      if (bookRes.status === 201) {
        addMessage({
          sender: "bot",
          text: `Booked your ${pendingBooking.type} for ${pendingBooking.date} at ${pendingBooking.time}. A confirmation email has been sent.`,
        });
      } else if (bookRes.status === 409) {
        addMessage({ sender: "bot", text: "Sorry, that timeslot is no longer available. Please choose another time." });
      } else {
        addMessage({ sender: "bot", text: "⚠️ Something went wrong. Please try again later." });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        addMessage({ sender: "bot", text: "That timeslot is already booked. Please try a different one." });
      } else {
        console.error("Booking error:", err);
        addMessage({ sender: "bot", text: "I couldn’t connect to Calendar right now. Please try again later." });
      }
    }

    setPendingBooking(null); // ✅ Clear after success or fail
    return;
  } else {
    // User typed something else → cancel booking flow and continue normally
    setPendingBooking(null);
    // continue to GPT handling instead of forcing email request
  }
}

    try {
      setIsTyping(true);

      const systemPrompt = `
You are Micah, a friendly and helpful 28-year-old woman from Marion, Arkansas. 
You are the virtual assistant for DDT Enterprise, a nationwide property management company. 
You speak with light Southern charm and polite hospitality, but keep it professional and easy to understand. 
Be clear, concise, and helpful. Keep answers short — 2–3 sentences unless necessary.

MEMORY & CONTEXT (SESSION-SCOPED):
- Treat the conversation as continuous for this session ID. Reuse details already provided instead of re-asking.
- If the user gave some but not all booking details, ask ONLY for the missing pieces.

📅 Scheduling Rules:
- Users may request any day or time. Do not enforce scheduling windows yourself.
- Always output the user’s requested booking as JSON with {type, date, time}, using the exact date/time they said.
- The backend API will validate whether the request is inside scheduling windows, closed, or fully booked.
- Tours = 15 minutes, Meetings = 30 minutes.
- When interpreting user requests with a day-of-week (e.g., “Saturday”), always assume the soonest upcoming date that matches, not a date next year.

- If the user provides only a vague reference (e.g., “this week,” “Wednesday evening,” “after 3”), politely ask them for the specific date and time?.
- If the user already provides a clear date (e.g., “Wednesday, October 2” or “2025-09-28”), accept it and continue without asking again.
- Never correct or shift the date yourself — trust the backend validation.
- If a booking is requested, output ONLY valid JSON (no code blocks, no text). 
  Example: {"type":"meeting","date":"2025-09-28","time":"15:00"}
- If date and type are already known, and the user later gives only the time (or vice versa), combine them into one booking JSON instead of re-asking.


OFF‑TOPIC HANDLING (SOFTER):
- If a question is outside property management (e.g., investing), give ONE short, safe, high‑level sentence to be helpful, then pivot back with a relevant option (e.g., “If you’d like, I can schedule a meeting to discuss our services.”).
- Only refuse outright if the topic is unsafe/inappropriate.

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

      // ✅ Always include the full system prompt and a guaranteed sessionId
const sid = ensureSessionId();

const res = await axios.post(`${API_BASE}/chat`, {
  model: "gpt-4o",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userRaw }
  ],
  sessionId: sid,
});


      let reply = res.data?.choices?.[0]?.message?.content || "";
      let bookingObj = null;

      try {
        const match = reply.match(/\{[^}]+\}/);
        if (match) {
          bookingObj = JSON.parse(match[0]);
          reply = ""; // ✅ prevent raw JSON from rendering
        }
      } catch (e) {
  console.error("Booking JSON parse failed:", e);
  bookingObj = null;
}

        if (bookingObj?.date && bookingObj?.time && bookingObj?.type) {
  try {
    // ✅ Step 1: Check slot availability first
    let primary = null;
try {
  const suggestRes = await axios.get(`${API_BASE}/tidycal/suggest`, {
    params: {
      type: bookingObj.type,
      date: bookingObj.date,
      after: bookingObj.time,
      count: 1,
    },
  });
  primary = suggestRes.data?.options?.[0];
} catch (err) {
  if (err.response?.status === 404) {
    addMessage({
      sender: "bot",
      text: "That day is fully booked. Please choose another date. Here’s the next available slot: " +
        (err.response.data?.nextAvailable?.options?.[0]?.human || "none found"),
    });
    return;
  }
  if (err.response?.status === 403) {
    addMessage({
      sender: "bot",
      text: "We don’t schedule on that day. " + (err.response.data?.policy || ""),
    });
    return;
  }
  console.error("Suggest error:", err);
  addMessage({ sender: "bot", text: "⚠️ Couldn’t check schedule right now. Please try again later." });
  return;
}

if (!primary) {
  addMessage({ sender: "bot", text: "Sorry, no slots available. Try another day." });
  return;
}

    // ✅ Step 2: If user info missing, ask for it
    if (!user?.name || !user?.email) {
      addMessage({
        sender: "bot",
        text: `The slot ${primary.human} is available! Please provide your name and email to confirm.`,
      });
      setPendingBooking({
  type: bookingObj.type,
  date: primary.date,
  time: primary.time,
});
      return;
    }

    // ✅ Step 3: If user info exists, book immediately
    const bookRes = await axios.post(`${API_BASE}/tidycal/book`, {
      type: bookingObj.type,
      date: bookingObj.date,
      time: bookingObj.time,
      name: user.name,
      email: user.email,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    if (bookRes.status === 201) {
      addMessage({
        sender: "bot",
        text: `Booked your ${bookingObj.type} for ${primary.human}. A confirmation email has been sent.`,
      });
    } else if (bookRes.status === 409) {
      addMessage({ sender: "bot", text: "That timeslot is no longer available. Please pick another time." });
    } else {
      addMessage({ sender: "bot", text: "I tried booking, but something went wrong. Please try again later." });
    }
    return;
  } catch (err) {
    console.error("Booking error:", err);
    addMessage({ sender: "bot", text: "⚠️ Couldn’t check schedule. Try again later." });
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
