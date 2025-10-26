import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    sender: { type: String, enum: ["user", "bot"], required: true },
    text: { type: mongoose.Schema.Types.Mixed, required: true },
    userType: { type: String, enum: ["guest", "registered"], default: "guest" },
    questionMatched: { type: String, default: "" },
    topics: { type: [String], default: [] },
  },
  {
    timestamps: true, // createdAt & updatedAt auto added
  }
);

export default mongoose.models.Message ||
  mongoose.model("Message", messageSchema, "messages");
