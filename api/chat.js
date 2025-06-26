// api/chat.js
import fetch from 'node-fetch';

async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  let body;
  try {
    body = await getRequestBody(req);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await openaiRes.json();
    return res.status(openaiRes.status).json(data);
  } catch (e) {
    console.error('Proxy error:', e);
    return res.status(500).json({ error: 'Proxy error' });
  }
}
