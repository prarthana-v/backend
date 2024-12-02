const notificationSchema = new mongoose.Schema({
  recipientType: { type: String, enum: ["seller", "customer"], required: true }, // Recipient category
  recipientId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the recipient
  message: { type: String, required: true }, // Notification content
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  }, // Delivery status
  timestamp: { type: Date, default: Date.now }, // When the notification was sent
});

module.exports = mongoose.model("Notification", notificationSchema);
