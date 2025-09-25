// pages/api/chat.js
import dbConnect from '../../lib/dbConnect.js';
import Message from '../../models/Message.js';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false, // Required if manually parsing body
  },
};

async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
  reject(new Error('Invalid JSON'));
}
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  let body, sessionId;
  try {
    body = await parseJsonBody(req);
    sessionId = body.sessionId || 'guest';
    delete body.sessionId;
  } catch (err) {
    console.error('❌ JSON parse error:', err.message);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  console.log('📨 Received body:', JSON.stringify(body));

  if (!body.model || !Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({
      error: 'Payload must include a `model` string and a non-empty `messages` array'
    });
  }

  let openaiRes, data;
  try {
    openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    data = await openaiRes.json();

    const userMsg = body.messages[body.messages.length - 1];
    const botMsg = data.choices?.[0]?.message?.content;

    if (!botMsg) {
      console.warn('⚠️ OpenAI response missing message content:', data);
    }

    // 🧠 Classify the user message
    let topics = [];
    if (userMsg?.content) {
      try {
        const classifyRes = await axios.post(`${process.env.BASE_URL || 'http://localhost:3000'}/api/classify`, {
          text: userMsg.content
        });
        const topic = classifyRes.data.topic;
        if (topic) topics = [topic];
      } catch (err) {
  console.error('⚠️ GPT classification failed:', err.message);
}

      await Message.create({ sessionId, sender: 'user', text: userMsg.content, topics }); // ✅ Save with topics
    }

    if (botMsg) {
      await Message.create({ sessionId, sender: 'bot', text: botMsg });
    }

  } catch (err) {
  console.error('❌ Network / fetch error:', err);
  return res.status(502).json({ error: 'Upstream request failed', details: err.message });
}

  if (!openaiRes.ok) {
    console.error('❌ OpenAI error:', data);
    return res.status(openaiRes.status).json({
      error: 'OpenAI response failed',
      details: data,
    });
  }

  return res.status(200).json(data);
}
