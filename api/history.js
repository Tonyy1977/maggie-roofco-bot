// pages/api/history.js
import dbConnect from '../../lib/dbConnect';
import Message from '../../models/Message';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { sessionId, sender, text } = req.body;

    try {
      const msg = await Message.create({ sessionId, sender, text });
      res.status(200).json({ success: true, data: msg });
    } catch (err) {
      console.error('❌ Error saving message:', err);
      res.status(500).json({ success: false, error: 'Failed to save message' });
    }
  }

  else if (req.method === 'GET') {
    const { sessionId } = req.query;

    try {
      const messages = await Message.find({ sessionId }).sort({ timestamp: 1 });
      res.status(200).json(messages);
    } catch (err) {
      console.error('❌ Error fetching history:', err);
      res.status(500).json({ success: false, error: 'Failed to load messages' });
    }
  }

  else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
