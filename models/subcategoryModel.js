const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
  superadminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the Seller model
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subcategoryName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100,
  },
  image: {
    type: String,
    required: true,
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

const Subcategory = mongoose.model("Subcategory", subcategorySchema);
module.exports = Subcategory;
