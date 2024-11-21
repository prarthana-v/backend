const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seller", // Reference to the Seller model
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    // description: {
    //   type: String,
    //   trim: true,
    //   maxlength: 500,
    // },
    // image: {
    //   type: String,
    //   required: true,
    // },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strictPopulate: false }
);

const Subcategory = mongoose.model("subcategory", subcategorySchema);
module.exports = Subcategory;
