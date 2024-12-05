const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  superadminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
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
  createdAt: { type: Date, default: Date.now },
});

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
