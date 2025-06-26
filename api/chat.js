// api/chat.js
import fetch from 'node-fetch';

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

  // 2) Forward to OpenAI
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
  } catch (err) {
    console.error('❌ Network / fetch error:', err);
    return res.status(502).json({ error: 'Upstream request failed' });
  }

  // 3) If OpenAI returned an error status, log it and forward it
  if (!openaiRes.ok) {
    console.error('❌ OpenAI error:', data);
    return res.status(openaiRes.status).json(data);
  }

  // 4) Success—send the completion response back
  return res.status(200).json(data);
}
