// api/book.js
import axios from "axios";

export default async function handler(req, res) {
  const { calendarId, name, email, start, end } = req.body;
  try {
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

    const event = {
      subject: `Booking with ${name}`,
      start: { dateTime: start, timeZone: "UTC" },
      end: { dateTime: end, timeZone: "UTC" },
      attendees: [{ emailAddress: { address: email }, type: "required" }],
    };

    await axios.post(
      `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events`,
      event,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.status(201).json({ message: "Booking confirmed" });
  } catch (err) {
    console.error("Outlook booking error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to book slot" });
  }
}
