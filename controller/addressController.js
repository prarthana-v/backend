const Address = require("../models/AddressModel");
const userModel = require("../models/userModel");

// // Add Address
const addAddress = async (req, res) => {
  try {
    const user = req.user;
    console.log(req.user);
    const {
      addressline1,
      addressline2,
      city,
      state,
      zipCode,
      country,
      mobile,
    } = req.body;

    const newAddress = new Address({
      addressline1,
      addressline2,
      city,
      state,
      zipCode,
      country,
      user: req.user._id,
      mobile,
    });

    let savedAddress = await newAddress.save();

    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { $push: { address: savedAddress._id } },
      { new: true }
    );
    console.log(updatedUser);

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while adding address",
    });
  }
};

// // Edit Address
const editAddress = async (req, res) => {
  try {
    const addressId = req.body._id;
    console.log(req.body);

    const {
      addressline1,
      addressline2,
      city,
      state,
      zipCode,
      country,
      mobile,
    } = req.body;

    const address = await Address.findByIdAndUpdate(
      addressId,
      {
        addressline1,
        addressline2,
        city,
        state,
        zipCode,
        country,
        mobile,
      },
      { new: true }
    );
    console.log(address);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating address",
    });
  }
};

// // Delete Address
const deleteAddress = async (req, res) => {
  try {
    const addressId = req.body.addressId;
    const address = await Address.findByIdAndDelete(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting address",
    });
  }
};

// // Get Addresses by User ID
const getAddressesByUserId = async (req, res) => {
  try {
    const userId = req.user._id;

    // Populate the user's addresses
    const user = await userModel.findById(userId).populate("address");
    console.log(user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if addresses are populated
    if (!user.address || !user.address.length) {
      return res.status(404).json({
        success: false,
        message: "No addresses found for the user",
      });
    }

    return res.status(200).json({
      success: true,
      username: user.username,
      addresses: user.address, // Populated addresses
    });
  } catch (error) {
    console.log(error, "Server error while fetching addresses");
    return res.status(500).json({
      success: false,
      message: "Server error while fetching addresses",
    });
  }
};

module.exports = {
  addAddress,
  editAddress,
  deleteAddress,
  getAddressesByUserId,
};
