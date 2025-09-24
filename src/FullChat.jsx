// FullChat.jsx (v3) — honors new working days/hours and closed-day responses
// Policy:
// - Wed 5–8pm, Sat 11–1pm, Sun 2–4pm only
// - Tours 15m, Meetings 30m
// Client behavior:
// - Parses DOW + month/day (e.g., "Thu, Sep 25"), ordinals, 24h, 'after 3', '2pm'
// - Calls /suggest with count=3 and appropriate anchors
// - Handles 403 closedDay and 404 fullyBooked uniformly with nextAvailable

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import qaData from './qaData';
import { v4 as uuidv4 } from 'uuid';

const API_BASE = '/api';

const TIDYCAL_URLS = {
  tour: 'https://tidycal.com/ddtenterpriseusa/15-minute-meeting',
  meeting: 'https://tidycal.com/ddtenterpriseusa/30-minute-meeting',
};

/* ---------- intent + parsing helpers ---------- */
function inferType(text, fallback='meeting') {
  const t = (text || '').toLowerCase();
  if (/(tour|show(ing)?|walkthrough|home tour|see the (home|house|property)|visit)/.test(t)) return 'tour';
  if (/(meet|meeting|call|chat|zoom|appointment|landlord|demetrice)/.test(t)) return 'meeting';
  return fallback;
}

function inferPreference(text) {
  const t = (text || '').toLowerCase();
  if (/\b(early )?morning\b|\bam\b|a\.m\.?/.test(t)) return 'morning';
  if (/\bafternoon\b|\bpm\b|p\.m\.?|\bnoon\b|\bevening\b|\blate afternoon\b/.test(t)) return 'afternoon';
  return '';
}

function pad2(n) { return String(n).padStart(2, '0'); }
function dateToYMD(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }

/* --- date parsing --- */
const DOWS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const DOWS_SHORT = ['sun','mon','tue','tues','wed','thu','thur','thurs','fri','sat'];
const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];
const MONTHS_SHORT = ['jan','feb','mar','apr','may','jun','jul','aug','sep','sept','oct','nov','dec'];

function parseMonthToken(t) {
  const m = t.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
  if (m) return MONTHS.indexOf(m[1].toLowerCase());
  const ms = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/i);
  if (!ms) return -1;
  const token = ms[1].toLowerCase();
  const map = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11 };
  return map[token] ?? -1;
}
function parseDowToken(t) {
  const m = t.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i);
  if (m) return DOWS.indexOf(m[1].toLowerCase());
  const ms = t.match(/\b(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)\b/i);
  if (!ms) return -1;
  const token = ms[1].toLowerCase();
  const map = { sun:0, mon:1, tue:2, tues:2, wed:3, thu:4, thur:4, thurs:4, fri:5, sat:6 };
  return map[token] ?? -1;
}
function parseOrdinalDay(t) {
  const m = t.match(/\b(\d{1,2})(st|nd|rd|th)?\b/);
  if (!m) return -1;
  const day = Number(m[1]);
  return day >= 1 && day <= 31 ? day : -1;
}

function nextOccurrenceOfDow(dowIndex, fromDate = new Date()) {
  const d = new Date(fromDate);
  const delta = (dowIndex - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + delta);
  return d;
}

function parseDateYMD(raw, baseDate = new Date()) {
  const t = (raw || '').toLowerCase();

  if (/\btoday\b/.test(t)) return dateToYMD(baseDate);
  if (/\btomorrow\b/.test(t)) { const d = new Date(baseDate); d.setDate(d.getDate() + 1); return dateToYMD(d); }

  // ISO
  const mIso = t.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (mIso) {
    const y = Number(mIso[1]), m = Number(mIso[2]), d = Number(mIso[3]);
    const dt = new Date(baseDate); dt.setFullYear(y, m - 1, d); return dateToYMD(dt);
  }

  // US mm/dd[/yyyy]?
  const mUs = t.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(20\d{2}))?\b/);
  if (mUs) {
    const y = Number(mUs[3] || baseDate.getFullYear());
    const m = Number(mUs[1]), d = Number(mUs[2]);
    const dt = new Date(baseDate); dt.setFullYear(y, m - 1, d); return dateToYMD(dt);
  }

  // Month + day
  const mi = parseMonthToken(t);
  if (mi !== -1) {
    const day = parseOrdinalDay(t);
    if (day !== -1) {
      const y = baseDate.getFullYear();
      const dt = new Date(baseDate); dt.setFullYear(y, mi, day);
      // If that date already passed this year, push to next year
      if (dt < new Date(dateToYMD(baseDate))) dt.setFullYear(y + 1);
      return dateToYMD(dt);
    }
  }

  // DOW + day-of-month (e.g., Thu 25)
  const di = parseDowToken(t);
  const day = parseOrdinalDay(t);
  if (di !== -1 && day !== -1) {
    const probe = new Date(baseDate);
    for (let i = 0; i < 60; i++) {
      const cand = new Date(probe); cand.setDate(probe.getDate() + i);
      if (cand.getDay() === di && cand.getDate() === day) return dateToYMD(cand);
    }
  }

  // DOW only
  if (di !== -1) return dateToYMD(nextOccurrenceOfDow(di, baseDate));

  // Day-of-month only
  if (day !== -1) {
    const dt = new Date(baseDate); dt.setDate(day);
    if (dt < new Date(dateToYMD(baseDate))) dt.setMonth(dt.getMonth() + 1);
    return dateToYMD(dt);
  }

  return '';
}

/* --- time parsing --- */
function parseTimeOfDay(text) {
  const t = (text || '').toLowerCase();
  if (/\bnoon\b|midday/.test(t)) return { clock: '12:00', kind: 'at' };
  if (/\bmidnight\b/.test(t)) return { clock: '00:00', kind: 'at' };
  if (/\bearly morning\b/.test(t)) return { clock: '09:00', kind: 'at' };
  if (/\blate morning\b/.test(t)) return { clock: '11:00', kind: 'at' };
  if (/\bearly afternoon\b/.test(t)) return { clock: '13:00', kind: 'at' };
  if (/\bmid[- ]afternoon\b/.test(t)) return { clock: '15:00', kind: 'at' };
  if (/\blate afternoon\b/.test(t)) return { clock: '16:30', kind: 'at' };
  if (/\bevening\b/.test(t)) return { clock: '17:00', kind: 'at' };

  const mAfter = t.match(/\bafter\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (mAfter) {
    let h = Number(mAfter[1]); const m = Number(mAfter[2] || 0); const ap = mAfter[3];
    if (ap === 'pm' && h !== 12) h += 12; if (ap === 'am' && h === 12) h = 0;
    return { clock: `${pad2(h)}:${pad2(m)}`, kind: 'after' };
  }
  const mAt = t.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (mAt) {
    let h = Number(mAt[1]); const m = Number(mAt[2] || 0); const ap = mAt[3];
    if (ap === 'pm' && h !== 12) h += 12; if (ap === 'am' && h === 12) h = 0;
    return { clock: `${pad2(h)}:${pad2(m)}`, kind: 'at' };
  }
  const m24 = t.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (m24) return { clock: `${pad2(Number(m24[1]))}:${pad2(Number(m24[2]))}`, kind: 'at' };
  const mHourOnly = t.match(/\b(?:at\s+)?(\d{1,2})\b/);
  if (mHourOnly && /(am|pm|morning|afternoon|evening)/.test(t)) {
    let h = Number(mHourOnly[1]);
    if (/pm|afternoon|evening/.test(t) && h < 12) h += 12;
    if (/am|morning/.test(t) && h === 12) h = 0;
    return { clock: `${pad2(h)}:00`, kind: 'at' };
  }
  return { clock: '', kind: '' };
}

function isoFromDateClock(dateYMD, clock) {
  if (!dateYMD || !clock) return '';
  const [y, m, d] = dateYMD.split('-').map(Number);
  const [hh, mm] = clock.split(':').map(Number);
  const dt = new Date(); dt.setFullYear(y, m - 1, d); dt.setHours(hh, mm, 0, 0);
  return dt.toISOString();
}

const laterIntentRe = /\b(later( than that)?|next( one)?|after that|any later|too early|go later|push (it|this) back|later works|another time|what's next|try later)\b/i;

export default function FullChat() {
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

  const chatBodyRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(null);
  const [lastPick, setLastPick] = useState(null); // { type, preference, dateYMD, startISO }

  // session id
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

  // load history + lastPick
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
                timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }))
            : [{ sender: 'bot', text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?", type: 'text' }]
        );
      } catch {
        setMessages([{ sender: 'bot', text: "Hi, I'm Micah, DDT's virtual assistant. How can I help you today?", type: 'text' }]);
      }
      const saved = localStorage.getItem(`micah-last-pick-${sessionId}`);
      if (saved) { try { setLastPick(JSON.parse(saved)); } catch {} }
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
      type: msg.type || 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((p) => [...p, full]);
  };

  const persistLastPick = (obj) => {
    setLastPick(obj);
    try { localStorage.setItem(`micah-last-pick-${sessionId}`, JSON.stringify(obj)); } catch {}
  };

  /* ---------- direct booking path ---------- */
  async function trySchedulingDirect(userRaw, opts = {}) {
    const baseDate = new Date();
    const detectedDateYMD = parseDateYMD(userRaw, baseDate) || dateToYMD(baseDate);
    const detectedPref = inferPreference(userRaw);
    const detectedType = inferType(userRaw, opts.fallbackType || lastPick?.type || 'meeting');

    // parse specific times → 'after' anchor
    const { clock } = parseTimeOfDay(userRaw);
    const afterISO = clock ? isoFromDateClock(detectedDateYMD, clock) : '';

    // Neutral anchor for vague "morning/afternoon"
    const neutralClock = detectedPref === 'morning' ? '09:00' : detectedPref === 'afternoon' ? '14:00' : '';
    const neutralISO = (!afterISO && neutralClock) ? isoFromDateClock(detectedDateYMD, neutralClock) : '';

    const params = {
      type: detectedType,
      preference: detectedPref,
      date: detectedDateYMD,
      count: 3,
      strategy: afterISO ? 'nearest' : 'first',
    };
    if (afterISO) params.after = afterISO; else if (neutralISO) params.after = neutralISO;

    try {
      const { data } = await axios.get(`${API_BASE}/tidycal/suggest`, { params });
      const primary = data?.options?.[0] || { human: data?.human, start: data?.start };
      const others = (data?.options || []).slice(1);

      let html = `Ok—here's what I can do for a <b>${detectedType}</b>` +
                (detectedPref ? ` in the <b>${detectedPref}</b>` : '') +
                ` on <b>${detectedDateYMD}</b>:<br/><br/>` +
                `<b>${primary?.human || 'the next available time'}</b> — ` +
                `<a href="${data.bookingUrl}" target="_blank" rel="noopener noreferrer">Confirm on TidyCal</a>`;

      if (others.length) {
        html += `<br/><br/>Other times I can do: ` +
                others.map(o => `<span class="chip">${o.human}</span>`).join(' • ') +
                `<br/><i>(Reply "later" to see the next one.)</i>`;
      }

      addMessage({ sender: 'bot', type: 'text', text: html });
      persistLastPick({ type: detectedType, preference: detectedPref, dateYMD: detectedDateYMD, startISO: primary?.start || data?.start });
      return true;
    } catch (err) {
      const status = err?.response?.status;
      const payload = err?.response?.data || {};
      const next = payload?.nextAvailable;

      if (status === 403 && payload?.closedDay) {
        // Closed day with policy and next suggestion
        let html = `We’re closed for bookings on <b>${payload.dateYMD}</b>. ${payload.policy || ''}`;
        if (next?.dateYMD && Array.isArray(next?.options) && next.options.length) {
          const primary = next.options[0];
          const others = next.options.slice(1);
          html += `<br/><br/>Next available is <b>${primary.human}</b> on <b>${next.dateYMD}</b> — ` +
                  `<a href="${payload.bookingUrl}" target="_blank" rel="noopener noreferrer">Confirm on TidyCal</a>`;
          if (others.length) html += `<br/><br/>Other times that day: ` + others.map(o => `<span class="chip">${o.human}</span>`).join(' • ');
          addMessage({ sender: 'bot', type: 'text', text: html });
          persistLastPick({ type: detectedType, preference: detectedPref, dateYMD: next.dateYMD, startISO: primary.start });
          return true;
        }
        addMessage({ sender: 'bot', type: 'text', text: html });
        return false;
      }

      if (status === 404 && payload?.fullyBooked) {
        let html = `Sorry—<b>${payload.dateYMD}</b> is fully booked for a <b>${detectedType}</b>.`;
        if (next?.dateYMD && Array.isArray(next?.options) && next.options.length) {
          const primary = next.options[0];
          const others = next.options.slice(1);
          html += `<br/><br/>Next available is <b>${primary.human}</b> on <b>${next.dateYMD}</b> — ` +
                  `<a href="${payload.bookingUrl}" target="_blank" rel="noopener noreferrer">Confirm on TidyCal</a>`;
          if (others.length) html += `<br/><br/>Other times that day: ` + others.map(o => `<span class="chip">${o.human}</span>`).join(' • ');
          addMessage({ sender: 'bot', type: 'text', text: html });
          persistLastPick({ type: detectedType, preference: detectedPref, dateYMD: next.dateYMD, startISO: primary.start });
          return true;
        }
        addMessage({ sender: 'bot', type: 'text', text: html + ' Want me to check another day?' });
        return false;
      }

      // network or unknown error fallback
      const link = TIDYCAL_URLS[detectedType];
      addMessage({
        sender: 'bot',
        type: 'text',
        text: `I couldn’t verify schedule just now. You can still pick a time here: <a href="${link}" target="_blank" rel="noopener noreferrer">Schedule on TidyCal</a>`,
      });
      return false;
    }
  }

  /* ---------- main send handler ---------- */
  const handleSend = async (text = input) => {
    const userRaw = (text || '').trim();
    if (!userRaw) return;
    setInput('');
    setShowWelcomeOptions(false);
    addMessage({ sender: 'user', text: userRaw });

    // "later than that" chain
    if (laterIntentRe.test(userRaw) && lastPick) {
      try {
        const { data } = await axios.get(`${API_BASE}/tidycal/suggest`, {
          params: {
            type: lastPick.type,
            preference: lastPick.preference,
            date: lastPick.dateYMD,
            after: lastPick.startISO,
            count: 1,
          },
        });
        const human = data?.human || data?.options?.[0]?.human;
        const start = data?.start || data?.options?.[0]?.start;
        addMessage({
          sender: "bot",
          type: "text",
          text: `Next available after that is <b>${human}</b>. ` +
                `You can confirm it here: <a href="${data.bookingUrl}" target="_blank" rel="noopener noreferrer">Confirm on TidyCal</a>`,
        });
        persistLastPick({ ...lastPick, startISO: start });
        return;
      } catch (err) {
        const payload = err?.response?.data || {};
        const next = payload?.nextAvailable;
        if ((payload?.closedDay || payload?.fullyBooked) && next?.dateYMD && Array.isArray(next?.options) && next.options.length) {
          const primary = next.options[0];
          addMessage({
            sender: 'bot',
            type: 'text',
            text: `No later times that day. Next available is <b>${primary.human}</b> on <b>${next.dateYMD}</b>. ` +
                  `Confirm here: <a href="${payload.bookingUrl}" target="_blank" rel="noopener noreferrer">TidyCal</a>`,
          });
          persistLastPick({ ...lastPick, dateYMD: next.dateYMD, startISO: primary.start });
          return;
        }
        addMessage({ sender: 'bot', type: 'text', text: `No later times available. Want me to look another day?` });
        return;
      }
    }

    // scheduling intent (date/time keywords trigger too)
    const hasDateToken = !!parseDateYMD(userRaw);
    const hasTimeToken = !!parseTimeOfDay(userRaw).clock;
    const looksLikeScheduling =
  hasDateToken || hasTimeToken ||
  /(tour|meeting|appointment)/i.test(userRaw);

    if (looksLikeScheduling) {
      const fallbackType = lastPick?.type || 'meeting';
      await trySchedulingDirect(userRaw, { fallbackType });
      return;
    }

    // fallback → GPT
    try {
      setIsTyping(true);
      const messagesPayload = [
        { role: 'system', content: `You are Micah. Keep answers concise and helpful. FAQs: ${JSON.stringify(qaData)}` },
        { role: 'user', content: userRaw },
      ];

      const res = await axios.post(`${API_BASE}/chat`, {
        model: 'gpt-4o',
        messages: messagesPayload,
        sessionId,
      });

      let reply = res.data?.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
      addMessage({ sender: 'bot', text: reply });
    } catch {
      addMessage({ sender: 'bot', text: 'Server error, please try again.' });
    } finally {
      setIsTyping(false);
      setShowWelcomeOptions(true);
    }
  };

  return (
  <div className="micah-chat">
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
        </div> {/* closes chat-body */}

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

      </div> {/* closes chat-box */}
    </div>   {/* closes chat-wrapper */}
  </div>     
);
}

