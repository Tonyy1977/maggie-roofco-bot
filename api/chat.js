// api/chat.js
import fetch from 'node-fetch';
import dbConnect from '../../lib/dbConnect.js';
import Message from '../../models/Message.js';

/**
 * Read and parse the raw request body as JSON.
 */
async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => data += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (err) {
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

  // 1) Parse the incoming JSON body
  let body;
  try {
    body = await parseJsonBody(req);
  } catch (err) {
    console.error('❌ JSON parse error:', err.message);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // Log the body so we can inspect it in Vercel logs
  console.log('📨 Received body:', JSON.stringify(body));

  // 2) Validate payload shape
  if (
    !body.model ||
    !Array.isArray(body.messages) ||
    body.messages.length === 0
  ) {
    return res.status(400).json({
      error: 'Payload must include a `model` string and a non-empty `messages` array'
    });
  }

  // 3) Forward to OpenAI
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
    try {
  const userMsg = body.messages[body.messages.length - 1];

  await Message.create({ sessionId: body.sessionId || 'guest', sender: 'user', text: userMsg.content });
  await Message.create({ sessionId: body.sessionId || 'guest', sender: 'bot', text: data.choices[0].message.content });
} catch (err) {
  console.error('⚠️ Failed to save chat:', err);
}
  } catch (err) {
    console.error('❌ Network / fetch error:', err);
    return res.status(502).json({ error: 'Upstream request failed' });
  }

  // 4) If OpenAI returned an error, log it and forward
  if (!openaiRes.ok) {
    console.error('❌ OpenAI error:', data);
    return res.status(openaiRes.status).json(data);
  }

  // 5) Success—send the completion response back
  return res.status(200).json(data);
}
