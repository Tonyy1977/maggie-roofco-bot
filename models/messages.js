// models/messages.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    sender: { type: String, enum: ["user", "bot"], required: true },
    text: { type: mongoose.Schema.Types.Mixed, required: true },
    userType: { type: String, enum: ["guest", "registered"], default: "guest" },
    questionMatched: { type: String, default: "" },
    topics: { type: [String], default: [] },
  },
  {
    timestamps: true, // ✅ Automatically adds createdAt and updatedAt
  }
);

// ✅ Add index for faster queries
MessageSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema, "messages");