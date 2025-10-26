// pages/api/chat.js
import dbConnect from "../../lib/dbConnect.js";
import Message from "../../models/messages.js";
import axios from "axios";

export const config = {
  api: {
    bodyParser: false, // We manually parse JSON body
  },
};

async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

// ✅ Normalizes any Date or string into proper ISO
function normalizeMessage(doc) {
  if (!doc) return null;
  const fixDate = (v) => {
    if (!v) return null;
    if (typeof v === "string") return new Date(v).toISOString();
    if (typeof v === "object" && v.$date) return new Date(v.$date).toISOString();
    return new Date(v).toISOString();
  };
  return {
    ...doc,
    createdAt: fixDate(doc.createdAt || Date.now()),
    updatedAt: fixDate(doc.updatedAt || Date.now()),
    timestamp: fixDate(doc.createdAt || Date.now()),
  };
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  let body, sessionId;
  try {
    body = await parseJsonBody(req);
    sessionId = body.sessionId || "guest";
    delete body.sessionId;
  } catch (err) {
    console.error("❌ JSON parse error:", err.message);
    return res.status(400).json({ error: "Invalid JSON" });
  }

  console.log("📨 Chat payload received:", JSON.stringify(body));

  if (!body.model || !Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({
      error: "Payload must include a `model` string and a non-empty `messages` array",
    });
  }

  let openaiRes, data;
  try {
    // 1️⃣ Extract the last user message
    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const lastUser =
      [...incoming].reverse().find((m) => m.role === "user") ||
      incoming[incoming.length - 1];
    const userContent = lastUser?.content ?? "";

    // 2️⃣ Classify + save user message
    let topics = [];
    if (userContent) {
      try {
        const classifyRes = await axios.post(
          `${process.env.BASE_URL || "http://localhost:3000"}/api/classify`,
          { text: userContent }
        );
        const topic = classifyRes.data.topic;
        if (topic) topics = [topic];
      } catch (err) {
        console.error("⚠️ Classification failed:", err.message);
      }

      await Message.create({
        sessionId,
        sender: "user",
        text: userContent,
        topics,
      });
    }

    // 3️⃣ Get updated history
    const historyDocs = await Message.find({ sessionId })
      .sort({ createdAt: 1 })
      .lean();

    const historyMessages = historyDocs.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    // 4️⃣ Send conversation directly to OpenAI (no system prompt)
    openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: body.model,
        messages: historyMessages,
      }),
    });

    data = await openaiRes.json();
    let botMsg = data.choices?.[0]?.message?.content || "";

    // 5️⃣ Attempt to normalize booking JSON if any
    if (botMsg) {
      try {
        const match = botMsg.match(/\{[^}]+\}/);
        if (match) {
          const bookingObj = JSON.parse(match[0]);
          const d = new Date(bookingObj.date);
          const currentYear = new Date().getFullYear();
          if (d.getFullYear() !== currentYear) {
            d.setFullYear(currentYear);
            bookingObj.date = d.toISOString().slice(0, 10);
            console.log("🔧 Normalized booking date:", bookingObj.date);
          }
          botMsg = JSON.stringify(bookingObj);
        }
      } catch {
        // Ignore if message is not JSON
      }
    }

    // 6️⃣ Save bot reply
    if (botMsg) {
      await Message.create({
        sessionId,
        sender: "bot",
        text: botMsg,
      });
    }
  } catch (err) {
    console.error("❌ Network / fetch error:", err);
    return res.status(502).json({
      error: "Upstream request failed",
      details: err.message,
    });
  }

  if (!openaiRes.ok) {
    console.error("❌ OpenAI error:", data);
    return res.status(openaiRes.status).json({
      error: "OpenAI response failed",
      details: data,
    });
  }

  // ✅ Attach clean timestamp
  try {
    if (Array.isArray(data.choices)) {
      data.timestamp = new Date().toISOString();
    }
  } catch (e) {
    console.warn("⚠️ Timestamp normalization skipped:", e);
  }

  return res.status(200).json(data);
}
