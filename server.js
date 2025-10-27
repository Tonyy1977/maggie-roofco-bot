//server.js 
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();
const app = express();

/* ---------------------------- CORS ---------------------------- */
const allowedOrigins = [
  "http://localhost:3000",
  "https://maggie-roofco-bot.vercel.app",
];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) cb(null, origin);
      else cb(new Error("CORS not allowed from this origin"));
    },
    credentials: true,
  })
);
app.use(express.json());

/* -------------------------- MongoDB --------------------------- */
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const chatSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    text: { type: mongoose.Schema.Types.Mixed, required: true },
    timestamp: { type: Date, default: Date.now },
    sessionId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);
const Chat = mongoose.model("Chat", chatSchema);

/* ------------------------- Debug keys ------------------------- */
console.log("🔑 Loaded OPENAI_API_KEY:", !!process.env.OPENAI_API_KEY);
console.log("🔑 Loaded TIDYCAL_API_KEY:", !!process.env.TIDYCAL_API_KEY);

/* ----------------------- Chat Endpoints ----------------------- */
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, sessionId = "guest" } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing OpenAI API key" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "gpt-4o", messages }),
    });

    const text = await response.text();
    if (!response.ok) return res.status(response.status).json({ error: `OpenAI error: ${text}` });

    const data = JSON.parse(text);
    const reply = data.choices?.[0]?.message?.content || "Sorry, something went wrong.";

    if (messages?.length) {
      const userMsg = messages[messages.length - 1];
      await Chat.create({ sender: "user", text: userMsg.content, timestamp: new Date(), sessionId });
    }
    await Chat.create({ sender: "bot", text: reply, timestamp: new Date(), sessionId });

    res.json(data);
  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/history", async (req, res) => {
  try {
    const { sessionId, messages } = req.body;
    if (!sessionId || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid payload" });
    }
    const saved = await Chat.insertMany(
      messages.map((m) => ({ sender: m.sender, text: m.text, timestamp: new Date(), sessionId }))
    );
    res.json({ success: true, saved });
  } catch (err) {
    console.error("❌ Failed to save history:", err);
    res.status(500).json({ error: "Failed to save history" });
  }
});

app.get("/api/history", async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId query param" });
    const chatHistory = await Chat.find({ sessionId }).sort({ timestamp: 1 });
    res.json(chatHistory);
  } catch (err) {
    console.error("❌ Failed to fetch chat history:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

app.get("/api/history/download", async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId query param" });
    }

    const chatHistory = await Chat.find({ sessionId }).sort({ timestamp: 1 });
    const formatted = chatHistory
      .map((msg) => {
        const timestamp = msg.timestamp ? new Date(msg.timestamp).toISOString() : "";
        const sender = (msg.sender || "unknown").toUpperCase();
        const text =
          typeof msg.text === "string" ? msg.text : JSON.stringify(msg.text, null, 2);
        return `[${timestamp}] ${sender}: ${text}`;
      })
      .join("\n\n");

    const safeSessionId = sessionId.replace(/[^a-z0-9-_]/gi, "_");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="maggie-chat-${safeSessionId || "session"}.txt"`
    );
    res.send(formatted || "No messages available for this session.");
  } catch (err) {
    console.error("❌ Failed to generate transcript:", err);
    res.status(500).json({ error: "Failed to generate transcript" });
  }
});

app.get("/api/admin/messages", async (_req, res) => {
  try {
    const allMessages = await Chat.find({}).sort({ timestamp: 1 });
    res.json(allMessages);
  } catch (err) {
    console.error("❌ Failed to fetch admin messages:", err);
    res.status(500).json({ error: "Failed to fetch admin messages" });
  }
});

/* ------------------------ Start Server ------------------------ */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
