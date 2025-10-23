// api/availability.js — Outlook version
import axios from "axios";

export default async function handler(req, res) {
  const { calendarId } = req.query;

  if (!calendarId)
    return res.status(400).json({ error: "Missing calendarId" });

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

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 14); // next 2 weeks

    const graphRes = await axios.post(
      `https://graph.microsoft.com/v1.0/me/calendar/getSchedule`,
      {
        schedules: [calendarId],
        startTime: { dateTime: start.toISOString(), timeZone: "UTC" },
        endTime: { dateTime: end.toISOString(), timeZone: "UTC" },
        availabilityViewInterval: 30,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = graphRes.data.value[0];
    const freeTimes = [];

    // Translate free/busy data into a usable “available slot” array
    let prevEnd = new Date(start);
    data.scheduleItems.forEach((item) => {
      const busyStart = new Date(item.start.dateTime);
      if (prevEnd < busyStart)
        freeTimes.push({ start: prevEnd.toISOString(), end: busyStart.toISOString() });
      prevEnd = new Date(item.end.dateTime);
    });

    return res.status(200).json({ freeTimes });
  } catch (err) {
    console.error("Outlook availability error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch Outlook availability" });
  }
}
