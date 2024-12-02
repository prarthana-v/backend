const reportSchema = new mongoose.Schema({
  reportType: { type: String, required: true }, // Type of report (e.g., 'sales', 'user-activity')
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Superadmin" }, // Superadmin who generated the report
  data: { type: Object, required: true }, // The report data
  createdAt: { type: Date, default: Date.now }, // When the report was generated
});

module.exports = mongoose.model("Report", reportSchema);
