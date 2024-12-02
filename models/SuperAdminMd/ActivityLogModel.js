const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // Action performed (e.g., 'APPROVED_SELLER')
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Superadmin",
    required: true,
  }, // Who performed the action
  targetType: { type: String, required: true }, // What was affected (e.g., 'Seller', 'Product')
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the affected entity
  timestamp: { type: Date, default: Date.now }, // Time of the action
  metadata: { type: Object, default: {} }, // Additional details (e.g., reason for approval/rejection)
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
