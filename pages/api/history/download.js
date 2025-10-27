import mongoose from "mongoose";

// ✅ Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

const chatSchema = new mongoose.Schema(
  {
    sender: String,
    text: mongoose.Schema.Types.Mixed,
    sessionId: String,
    userType: String,
    questionMatched: String,
    topics: Array,
  },
  { timestamps: true }
);

// ✅ Force the correct collection
const Chat =
  mongoose.models.Chat || mongoose.model("Chat", chatSchema, "messages");

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

    if (!chatHistory || chatHistory.length === 0) {
      return res
        .status(200)
        .send("No messages available for this session.");
    }

    // 🕒 Timezone setup
    const tz = "America/New_York";
    const formatTime = (date) =>
      new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: tz,
      });

    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: tz,
      });

    // 🧾 Build the transcript
    const startedAt = chatHistory[0].timestamp || chatHistory[0].createdAt;
    const exportedAt = new Date();

    let transcript = "";
    transcript += `Conversation with Maggie\n`;
    transcript += `Started on ${formatDate(startedAt)} at ${formatTime(
      startedAt
    )} Eastern Time (US & Canada) time EDT (GMT-0400)\n\n`;
    transcript += `---\n\n`;

    chatHistory.forEach((msg) => {
      const time = formatTime(msg.timestamp || msg.createdAt);
      const isBot = msg.sender === "bot";
      const name = isBot ? "MBot" : "User";
      const text =
        typeof msg.text === "string"
          ? msg.text
          : JSON.stringify(msg.text, null, 2);
      transcript += `${time} | ${name}: ${text}\n\n`;
    });

    transcript += `---\n`;
    transcript += `Exported from The Roofing Company on ${formatDate(
      exportedAt
    )} at ${formatTime(
      exportedAt
    )} Eastern Time (US & Canada) time EDT (GMT-0400)\n`;

    // 🗂️ Prepare download
    const safeSessionId = sessionId.replace(/[^a-z0-9-_]/gi, "_");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="maggie-chat-${safeSessionId}.txt"`
    );
    res.status(200).send(transcript);
  } catch (err) {
    console.error("❌ Failed to generate transcript:", err);
    res.status(500).json({ error: "Failed to generate transcript" });
  }
}
