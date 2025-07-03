import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();

app.use(cors({
  origin: 'https://ddt-chatbot-gy6g.vercel.app',  // ✅ allow your frontend
  credentials: true
}));


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

// ✅ Setup Express
const app = express();
app.use(express.json());

// 🔐 Log loaded key (for debug)
console.log("🔑 Loaded API Key:", process.env.VITE_OPENAI_API_KEY);

// ✅ Chat handler: receive, talk to GPT, and log both user + bot messages
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, sessionId = 'guest' } = req.body;
    const apiKey = process.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY is missing.');
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
    console.log("🔁 Raw OpenAI response:", text);

    if (!response.ok) {
      return res.status(response.status).json({ error: `OpenAI error: ${text}` });
    }

    const data = JSON.parse(text);
    const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';

    // Save user message
    if (messages.length > 0) {
      const userMsg = messages[messages.length - 1];
      await Chat.create({
        sender: 'user',
        text: userMsg.content,
        timestamp: new Date(),
        sessionId,
      });
    }

    // Save bot message
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

// ✅ History handler
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
// ✅ Admin messages handler
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
app.listen(4000, () => {
  console.log('✅ Server listening on http://localhost:4000');
});
