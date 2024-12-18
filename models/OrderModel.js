const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "seller", // Reference to the Seller model
        required: true,
      },
    },
  ],
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Accepted", "Received Back", "Cancelled"],
  },
  purchaseDate: {
    type: Date,
    default: Date.now(),
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "addresses",
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
