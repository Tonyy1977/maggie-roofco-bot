// pages/api/history/download.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const chatSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    text: { type: mongoose.Schema.Types.Mixed, required: true },
    timestamp: { type: Date, default: Date.now },
    sessionId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema, "messages");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!MONGODB_URI) {
      return res.status(500).json({ error: "Missing MONGODB_URI" });
    }

    await mongoose.connect(MONGODB_URI);

    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId query param" });
    }

    const chatHistory = await Chat.find({ sessionId }).sort({ timestamp: 1 });

    const formatted = chatHistory
      .map((msg) => {
        const ts = msg.timestamp ? new Date(msg.timestamp).toISOString() : "";
        const sender = (msg.sender || "unknown").toUpperCase();
        const text =
          typeof msg.text === "string" ? msg.text : JSON.stringify(msg.text, null, 2);
        return `[${ts}] ${sender}: ${text}`;
      })
      .join("\n\n");

    const safeSessionId = sessionId.replace(/[^a-z0-9-_]/gi, "_");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="maggie-chat-${safeSessionId || "session"}.txt"`
    );
    res.status(200).send(formatted || "No messages available for this session.");
  } catch (err) {
    console.error("❌ Failed to generate transcript:", err);
    res.status(500).json({ error: "Failed to generate transcript" });
  }
}
