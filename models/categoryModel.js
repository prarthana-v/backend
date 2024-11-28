// models/categoryModel.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seller", // Reference to the Seller model
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100,
    default: "",
  },
  // description: {
  //   type: String,
  //   trim: true,
  //   maxlength: 500,
  // },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
