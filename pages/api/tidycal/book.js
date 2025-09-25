import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, date, time, name, email, timezone } = req.body;

    if (!type || !date || !time || !name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Combine date + time into ISO UTC
    const starts_at = new Date(`${date}T${time}:00`).toISOString();

    // ✅ Fetch booking types from TidyCal to get real IDs
    const bookingTypesRes = await axios.get("https://tidycal.com/api/booking-types", {
      headers: { Authorization: `Bearer ${process.env.TIDYCAL_API_KEY}` },
    });

    const bookingTypes = bookingTypesRes.data?.data || [];
    if (!bookingTypes.length) {
      return res.status(500).json({ error: "No booking types found in TidyCal" });
    }

    // ✅ Match booking type by title (e.g. "15 Minute Meeting", "30 Minute Meeting")
    let matchTitle = type === "tour" ? "15 Minute Meeting" : "30 Minute Meeting";
    const bookingType = bookingTypes.find(bt => bt.title.includes(matchTitle));

    if (!bookingType) {
      return res.status(422).json({ error: `No matching booking type for ${type}` });
    }

    // ✅ Create booking
    const response = await axios.post(
  `https://tidycal.com/api/booking-types/${bookingType.id}/bookings`,
  {
    starts_at,
    name,
    email,
    timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone, // ✅ default
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.TIDYCAL_API_KEY}`,
      "Content-Type": "application/json",
    },
  }
);

    return res.status(201).json(response.data);

  } catch (error) {
  const status = error.response?.status || 500;
  if (status === 409) {
    return res.status(409).json({
      error: "Timeslot unavailable",
      details: error.response?.data || "The requested time is already booked."
    });
  }
  return res.status(status).json({
    error: "Booking failed",
    details: error.response?.data || error.message,
  });
}
}
