// api/tidycal.js
import fetch from "node-fetch";

const EVENT_SLUGS = {
  tour: "15-minute-meeting",
  meeting: "30-minute-meeting",
  long: "60-minute-meeting",
};

export default async function handler(req, res) {
  const apiKey = process.env.TIDYCAL_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing TIDYCAL_API_KEY");
    return res.status(500).json({ error: "Missing TidyCal API key" });
  }

  // ---------------- GET Availability ----------------
  if (req.method === "GET") {
    try {
      const { type } = req.query;
      if (!type) return res.status(400).json({ error: "Missing type parameter" });

      const slug = EVENT_SLUGS[type];
      if (!slug) return res.status(400).json({ error: "Invalid booking type" });

      // Step 1: get booking types
      const typesResponse = await fetch("https://tidycal.com/api/booking-types", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const typesData = await typesResponse.json();
      const bookingTypes = typesData?.data || [];

      // Step 2: find by slug
      const match = bookingTypes.find((bt) => bt.url_slug === slug);
      if (!match) {
        console.error(`❌ No booking type found for slug=${slug}`);
        return res.status(404).json({ error: "Booking type not found" });
      }

      // Step 3: fetch availability
      const availResponse = await fetch(
        `https://tidycal.com/api/booking-types/${match.id}/available-timeslots`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      const contentType = availResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await availResponse.text();
        console.error("❌ Unexpected response from TidyCal:", text.slice(0, 200));
        return res.status(500).json({ error: "TidyCal did not return JSON" });
      }

      const availData = await availResponse.json();
      return res.status(200).json({ slots: availData?.data || [] });
    } catch (err) {
      console.error("❌ TidyCal availability error:", err);
      return res.status(500).json({ error: "Failed to fetch availability" });
    }
  }

  // ---------------- POST Booking ----------------
  if (req.method === "POST") {
    try {
      const { slot, type } = req.body;
      if (!slot || !type) {
        return res.status(400).json({ error: "Missing slot or type" });
      }

      const slug = EVENT_SLUGS[type];
      if (!slug) return res.status(400).json({ error: "Invalid booking type" });

      // Step 1: get booking types
      const typesResponse = await fetch("https://tidycal.com/api/booking-types", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const typesData = await typesResponse.json();
      const bookingTypes = typesData?.data || [];

      const match = bookingTypes.find((bt) => bt.url_slug === slug);
      if (!match) {
        console.error(`❌ No booking type found for slug=${slug}`);
        return res.status(404).json({ error: "Booking type not found" });
      }

      // Step 2: create booking
      const response = await fetch("https://tidycal.com/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_type_id: match.id,
          starts_at: slot, // must be ISO datetime
        }),
      });

      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      console.error("❌ TidyCal booking error:", err);
      return res.status(500).json({ error: "Failed to create booking" });
    }
  }

  // ---------------- Method Not Allowed ----------------
  return res.status(405).json({ error: "Method not allowed" });
}
