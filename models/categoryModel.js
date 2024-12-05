// models/categoryModel.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  superadminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the Seller model
    required: true,
  },
  categoryName: {
    type: String,
    unique: true,
    trim: true,
    maxlength: 100,
    default: "",
  },
  image: {
    type: String,
  },
  sortOrder: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
