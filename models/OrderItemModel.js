// OrderItem schema file (for reference and embedding within Order schema)
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Reference to the Product model
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true, // Total = price * quantity
  },
});

const orderItem = mongoose.model("OrderItems", orderItemSchema);
module.exports = orderItem;
