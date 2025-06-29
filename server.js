import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
console.log("🔑 Loaded API Key:", process.env.OPENAI_API_KEY);

const app = express();
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    // 🛑 Add fail-safe if key is missing
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
console.log("📦 Status:", response.status);
console.log("📄 Headers:", response.headers.raw());

if (!response.ok) {
  return res.status(response.status).json({ error: `OpenAI error: ${text}` });
}

try {
  const data = JSON.parse(text);
  res.json(data);
} catch (jsonErr) {
  console.error('❌ OpenAI returned invalid JSON:', text);
  res.status(500).json({ error: 'OpenAI returned non-JSON response' });
}
  } catch (err) {
    console.error('❌ Server Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(3000, () => {
  console.log('✅ Server listening on http://localhost:3000');
});
