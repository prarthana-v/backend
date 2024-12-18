const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  addressline1: {
    type: String,
    required: true,
  },
  addressline2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
});

const Address = mongoose.model("addresses", AddressSchema);
module.exports = Address;
