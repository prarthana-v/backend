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
  skuid: {
    type: String,
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
    min: 0,
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
  images: {
    type: [String],
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "active",
  },
  sizes: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  discount: {
    type: Number,
    default: 0,
  },
  // Additional fields as per your requirement
  color: {
    type: String,
  },
  sleeveLength: {
    type: String,
  },
  material: {
    type: String,
  },
  occasion: {
    type: String,
  },
  pattern: {
    type: String,
  },
  fit: {
    type: String,
  },
  manufacturerDetails: {
    type: String,
  },
  packerDetails: {
    type: String,
  },
  rating: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ratings",
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reviews",
    },
  ],
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
