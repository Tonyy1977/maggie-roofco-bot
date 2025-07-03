// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: mongoose.Schema.Types.Mixed, required: true }, // handles string or array
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Message || mongoose.model('Message', messageSchema);
