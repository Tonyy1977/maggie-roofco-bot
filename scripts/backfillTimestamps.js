// scripts/backfillTimestamps.js
import mongoose from "mongoose";
import Message from "../models/message.js";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/chatbot"; // adjust if needed

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all messages missing createdAt
    const messages = await Message.find({ createdAt: { $exists: false } });

    console.log(`Found ${messages.length} messages missing createdAt...`);

    for (const msg of messages) {
      // Use old timestamp if available, fallback to ObjectId time
      const fallbackDate = msg.timestamp || msg._id.getTimestamp();

      msg.createdAt = fallbackDate;
      msg.updatedAt = fallbackDate;
      await msg.save();
    }

    console.log("🎉 Backfill complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during backfill:", err);
    process.exit(1);
  }
})();
