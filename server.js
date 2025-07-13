import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();

// ✅ Setup Express FIRST
const app = express();

// ✅ CORS must be before any route
const allowedOrigins = [
  'http://localhost:3000',
  'https://ddt-chatbot-gy6g.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin); // ✅ Use the actual origin
    } else {
      callback(new Error('CORS not allowed from this origin'));
    }
  },
  credentials: true
}));
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// ✅ Define chat schema and model
const chatSchema = new mongoose.Schema({
  sender: String,
  text: String,
  timestamp: Date,
  sessionId: String,
});
const Chat = mongoose.model('Chat', chatSchema);

// 🔐 Debug key
console.log("🔑 Loaded API Key:", process.env.VITE_OPENAI_API_KEY);

// ✅ POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, sessionId = 'guest' } = req.body;
    const apiKey = process.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OpenAI API key' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      return res.status(response.status).json({ error: `OpenAI error: ${text}` });
    }

    const data = JSON.parse(text);
    const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';

    // Save messages
    if (messages.length > 0) {
      const userMsg = messages[messages.length - 1];
      await Chat.create({
        sender: 'user',
        text: userMsg.content,
        timestamp: new Date(),
        sessionId,
      });
    }

    await Chat.create({
      sender: 'bot',
      text: reply,
      timestamp: new Date(),
      sessionId,
    });

    res.json(data);
  } catch (err) {
    console.error('❌ Server Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
app.post('/api/history', async (req, res) => {
  try {
    const { sessionId, messages } = req.body;

    if (!sessionId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const saved = await Chat.insertMany(messages.map(msg => ({
      sender: msg.sender,
      text: msg.text,
      timestamp: new Date(),
      sessionId,
    })));

    res.json({ success: true, saved });
  } catch (err) {
    console.error('❌ Failed to save history:', err);
    res.status(500).json({ error: 'Failed to save history' });
  }
});
// ✅ GET /api/history
app.get('/api/history', async (req, res) => {
  try {
    const sessionId = req.query.sessionId;
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId query param' });
    }

    const chatHistory = await Chat.find({ sessionId }).sort({ timestamp: 1 });
    res.json(chatHistory);
  } catch (err) {
    console.error('❌ Failed to fetch chat history:', err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// ✅ GET /api/admin/messages
app.get('/api/admin/messages', async (req, res) => {
  try {
    const allMessages = await Chat.find({}).sort({ timestamp: 1 });
    res.json(allMessages);
  } catch (err) {
    console.error('❌ Failed to fetch admin messages:', err);
    res.status(500).json({ error: 'Failed to fetch admin messages' });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
