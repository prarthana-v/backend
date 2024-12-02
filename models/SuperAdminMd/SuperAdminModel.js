const mongoose = require("mongoose");

const superadminSchema = new mongoose.Schema({
  superadminId: { type: String, unique: true, required: true }, // Unique ID
  username: { type: String, unique: true, required: true }, // Login username
  email: { type: String, unique: true, required: true }, // Email for login
  password: { type: String, required: true }, // Hashed password
  role: { type: String, default: "superadmin" }, // Role identifier
  permissions: { type: [String], default: ["all"] }, // Access control permissions
  lastLogin: { type: Date, default: null }, // Last login timestamp
  createdAt: { type: Date, default: Date.now }, // Account creation timestamp
  updatedAt: { type: Date, default: Date.now }, // Last update timestamp
});

module.exports = mongoose.model("Superadmin", superadminSchema);
