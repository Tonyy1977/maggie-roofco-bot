// pages/api/history.js
import dbConnect from '../../lib/dbConnect.js';
import Message from '../../models/messages.js';  // 👈 exact match with filename

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { sessionId, sender, text } = req.body;
    console.log("💾 Saving message:", { sessionId, sender, text });

    try {
      const msg = await Message.create({ sessionId, sender, text, timestamp: new Date() });
      return res.status(200).json({ success: true, data: msg });
    } catch (err) {
      console.error('❌ Error saving message:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'GET') {
    const { sessionId } = req.query;
    console.log("📥 Loading history for:", sessionId);

    try {
      const filter = {};
      if (sessionId && sessionId !== 'null') filter.sessionId = sessionId;

      const messages = await Message.find(filter).sort({ createdAt: 1 });
      return res.status(200).json(messages);
    } catch (err) {
      console.error('❌ Error fetching history:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
