// pages/api/history.js
import dbConnect from "../../lib/dbConnect.js";
import Message from "../../models/messages.js";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const { sessionId } = req.query;
    console.log("📥 Loading history for:", sessionId);

    try {
      // ✅ Sort by createdAt (Mongoose timestamp field)
      const messages = await Message.find({ sessionId })
        .sort({ createdAt: 1 })
        .lean();

      // ✅ Map to frontend format with proper timestamp
      const formatted = messages.map((msg) => ({
        sender: msg.sender,
        text: msg.text,
        topics: msg.topics || [],
        timestamp: msg.createdAt, // ✅ Use actual Mongoose timestamp
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      }));

      res.status(200).json(formatted);
    } catch (err) {
      console.error("❌ Error fetching history:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  } else if (req.method === "POST") {
    const { sessionId, sender, text } = req.body;
    try {
      // ✅ Create message - Mongoose handles timestamps
      const msg = await Message.create({
        sessionId,
        sender,
        text,
      });

      res.status(200).json({
        success: true,
        data: {
          ...msg.toObject(),
          timestamp: msg.createdAt, // ✅ Include timestamp in response
        },
      });
    } catch (err) {
      console.error("❌ Error saving message:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(405).json({ success: false, error: "Method not allowed" });
  }
}