// models/productModel.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seller", // Reference to the Seller model
    required: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Reference to the Category model
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  images: { type: [String], required: true },
  stock: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "pending", "error"],
    default: "pending",
  },
  sizes: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // rating: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "ratings",
  //   },
  // ],
  // reviews: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "reviews",
  //   },
  // ],
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
