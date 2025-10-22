// src/BookingWidget.jsx — Outlook version
import React, { useState, useEffect } from "react";
import axios from "axios";
import { DateTime } from "luxon";

export default function BookingWidget({ bookingTypeId, bookingTypeName, addMessage }) {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("select"); // select | details | done

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await axios.get("/api/outlook/availability", {
          params: { calendarId: bookingTypeId },
        });
        setSlots(res.data.freeTimes || []);
      } catch (err) {
        console.error("Error fetching Outlook availability:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [bookingTypeId]);

  if (loading) return <p>Loading Outlook calendar...</p>;

  if (step === "select")
    return (
      <div className="booking-widget">
        <p>
          Available times for <strong>{bookingTypeName}</strong>:
        </p>
        {slots.length === 0 && <p>No available slots in the next 2 weeks.</p>}
        {slots.map((slot) => {
          const start = DateTime.fromISO(slot.start, { zone: "utc" }).setZone("America/New_York");
          const end = DateTime.fromISO(slot.end, { zone: "utc" }).setZone("America/New_York");
          const label = `${start.toFormat("EEE MMM d, h:mm a")} – ${end.toFormat("h:mm a")}`;
          return (
            <button
              key={slot.start}
              className={`time-slot ${selectedSlot === slot ? "selected" : ""}`}
              onClick={() => {
                setSelectedSlot(slot);
                setStep("details");
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    );

  if (step === "details" && selectedSlot)
    return (
      <div className="details-form">
        <p>
          You selected{" "}
          <strong>
            {DateTime.fromISO(selectedSlot.start, { zone: "utc" })
              .setZone("America/New_York")
              .toFormat("EEE MMM d, h:mm a")}
          </strong>
          {" "}for {bookingTypeName}.
        </p>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={async () => {
            try {
              await axios.post("/api/outlook/booking", {
                calendarId: bookingTypeId,
                name,
                email,
                start: selectedSlot.start,
                end: selectedSlot.end,
              });

              // Chat confirmation
              if (addMessage) {
                const startTime = DateTime.fromISO(selectedSlot.start, { zone: "utc" })
                  .setZone("America/New_York")
                  .toFormat("EEE MMM d, h:mm a");
                addMessage({
                  sender: "bot",
                  type: "text",
                  text: `✅ Your ${bookingTypeName} has been scheduled for ${startTime} (New York time). A confirmation has been added to our Outlook calendar.`,
                });
              }

              setStep("done");
            } catch (err) {
              console.error("Outlook booking failed:", err);
              if (addMessage) {
                addMessage({
                  sender: "bot",
                  type: "text",
                  text: "⚠️ Sorry, something went wrong while booking through Outlook. Please try again.",
                });
              }
            }
          }}
        >
          Confirm Booking
        </button>
        <button onClick={() => setStep("select")}>Back</button>
      </div>
    );

  if (step === "done") return <p>✅ Booking complete.</p>;

  return null;
}