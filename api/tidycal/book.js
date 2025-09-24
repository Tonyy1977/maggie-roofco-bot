// api/tidycal/book.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { bookingTypeId, date, time, name, email, timezone } = req.body;

    // Combine date + time into ISO UTC
    const starts_at = new Date(`${date}T${time}:00`).toISOString();

    const response = await axios.post(
      `https://tidycal.com/api/booking-types/${bookingTypeId}/bookings`,
      {
        starts_at,
        name,
        email,
        timezone: timezone || "America/New_York",
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
    console.error("TidyCal booking error:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Booking failed",
      details: error.response?.data || error.message,
    });
  }
}
