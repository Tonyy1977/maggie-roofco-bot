// pages/api/outlook/types.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    // --- 1. Get token ---
    const tokenRes = await axios.post(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      })
    );
    const token = tokenRes.data.access_token;

    // --- 2. Use a concrete user mailbox, not /me ---
    const userEmail = process.env.OUTLOOK_USER_EMAIL;
    if (!userEmail) {
      return res.status(400).json({ error: "Missing OUTLOOK_USER_EMAIL env var" });
    }

    const resp = await axios.get(
      `https://graph.microsoft.com/v1.0/users/${userEmail}/calendars`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const calendars = (resp.data.value || []).map((c) => ({
      id: c.id,
      name: c.name,
      owner: c.owner?.address || userEmail,
    }));

    return res.status(200).json(calendars);
  } catch (err) {
    console.error("❌ Outlook calendars error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch Outlook calendars" });
  }
}
