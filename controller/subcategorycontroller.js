const SubcategoryModel = require("../models/subcategoryModel");
const categoryModel = require("../models/categoryModel");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary");

const getPublicIdFromUrl = (url) => {
  const regex = /\/([a-zA-Z0-9_-]+)(?=\.\w{3,4}$)/;
  const match = url.match(regex);
  return match ? match[0].substring(1) : null; // Remove leading '/' from publicId
};

const addSubcategory = async (req, res) => {
  try {
    const superadminId = req.user._id;
    const { categoryId, subcategoryName } = req.body;
    console.log(req.superadmin, req.body, req.file, "a");

    // Ensure both categoryId and name are provided
    if (!categoryId || !subcategoryName) {
      return res.status(400).send({ message: "All fields are required." });
    }

    // Check if the category exists
    const category = await categoryModel.findById(categoryId);
    console.log(category, "cat");
    if (!category) {
      return res.status(400).json({ message: "Category not found." });
    }

    // Check if the subcategory already exists
    const existingSubcategory = await SubcategoryModel.findOne({
      subcategoryName,
    });
    if (existingSubcategory) {
      return res.status(400).send({
        success: false,
        message: "Subcategory already exists",
      });
    }

    const subcategoryImage = req.file ? req.file.path : "";
    console.log(subcategoryImage, "subcategoryImage");

    // Find the last subcategory created for the given category
    const lastSubcategory = await SubcategoryModel.find({ categoryId })
      .sort({ sortOrder: -1 }) // Sort in descending order to get the last subcategory created
      .limit(1); // Limit to 1 to only fetch the last subcategory

    // Assign the next sortOrder (lastSubcategory.sortOrder + 1)
    const sortOrder =
      lastSubcategory.length > 0 ? lastSubcategory[0].sortOrder + 1 : 0; // If no subcategories exist, start from 0

    // Create the new subcategory, including the categoryId
    const subcategory = await SubcategoryModel.create({
      superadminId,
      categoryId, // Make sure to pass the categoryId here
      subcategoryName,
      image: subcategoryImage,
      sortOrder,
    });
    console.log(subcategory, "subcategory");
    // Populate the categoryId field with the corresponding category details
    const populatedSubcategory = await subcategory.populate(
      "categoryId",
      "categoryName image"
    );

    // Return the populated subcategory
    res.status(201).json({
      message: "Subcategory created successfully.",
      subcategory: populatedSubcategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Get All Subcategories
const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await SubcategoryModel.find()
      .populate("superadminId", "username email") // Populate seller details if needed
      .populate("categoryId", "categoryName image"); // Populate category details

    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subcategory exists
    const subcategory = await SubcategoryModel.findById(id);
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found." });
    }

    // If the subcategory has an image, delete it from Cloudinary
    if (subcategory.image) {
      const publicId = getPublicIdFromUrl(subcategory.image);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Old image deleted:", result);
      } else {
        console.log(
          "Could not extract publicId from image URL:",
          subcategory.image
        );
      }
    }

    // Delete the subcategory from the database
    await SubcategoryModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Subcategory deleted successfully." });
  } catch (error) {
    console.error("Error in deleteSubcategory:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params; // Get the subcategory ID from the route params
    const { categoryId, subcategoryName } = req.body;
    const superadminId = req.user._id;

    console.log(req.body, req.file, req.params, "update-subcategory request");

    // Ensure that subcategory ID is valid
    if (!id) {
      return res.status(400).json({ message: "Subcategory ID is required." });
    }

    // Check if the subcategory exists
    const subcategory = await SubcategoryModel.findById(id);
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found." });
    }

    // Check if the categoryId exists (if provided)
    if (categoryId) {
      const category = await categoryModel.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: "Category not found." });
      }
    }

    // Check for duplicate subcategory name (if updated)
    if (subcategoryName && subcategoryName !== subcategory.subcategoryName) {
      const duplicateSubcategory = await SubcategoryModel.findOne({
        subcategoryName,
      });
      if (duplicateSubcategory) {
        return res.status(400).json({
          success: false,
          message: "Subcategory with this name already exists.",
        });
      }
    }

    // Prepare updated fields
    const updatedFields = {
      ...(categoryId && { categoryId }), // Update categoryId if provided
      ...(subcategoryName && { subcategoryName }), // Update subcategoryName if provided
      ...(superadminId && { superadminId }), // Ensure the same superadmin ID
    };

    // If a new image is uploaded, handle image update and deletion
    if (req.file) {
      const newImageUrl = req.file.path;

      // If the subcategory already has an image, delete the old one from Cloudinary
      if (subcategory.image) {
        const publicId = getPublicIdFromUrl(subcategory.image);
        if (publicId) {
          const result = await cloudinary.uploader.destroy(publicId);
          console.log("Old image deleted:", result);
        }
      }

      // Update the subcategory image to the new one
      updatedFields.image = newImageUrl;
    } else {
      // If no new image is provided, retain the old image URL
      updatedFields.image = subcategory.image || ""; // Keep the old image if no new one is uploaded
    }

    // Update the subcategory
    const updatedSubcategory = await SubcategoryModel.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true } // Return the updated document
    ).populate("categoryId", "categoryName image");

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully.",
      subcategory: updatedSubcategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Controller function to reorder subcategories
const reorderSubcategories = async (req, res) => {
  try {
    const { subcategoryIds } = req.body; // Expecting an array of subcategory IDs in new order
    console.log(subcategoryIds);

    // Ensure subcategoryIds array is not empty
    if (!subcategoryIds || subcategoryIds.length === 0) {
      return res.status(400).json({ message: "Subcategory IDs are required." });
    }

    // Validate that all subcategory IDs exist in the database
    const subcategories = await SubcategoryModel.find({
      _id: { $in: subcategoryIds },
    });

    if (subcategories.length !== subcategoryIds.length) {
      return res.status(404).json({ message: "Some subcategories not found." });
    }

    // Reorder subcategories: Update each subcategory's 'sortOrder' based on its position in the array
    for (let i = 0; i < subcategoryIds.length; i++) {
      await SubcategoryModel.findByIdAndUpdate(subcategoryIds[i], {
        sortOrder: i + 1, // Update sortOrder based on new position
      });
    }

    // Fetch updated subcategories, sorted by 'sortOrder'
    const updatedSubcategories = await SubcategoryModel.find().sort({
      sortOrder: 1,
    });
    console.log(updatedSubcategories, "updatedSubcategories");

    res
      .status(200)
      .json({ success: true, subcategories: updatedSubcategories });
  } catch (error) {
    console.error("Error while reordering subcategories:", error);
    res
      .status(500)
      .json({ message: "Server error while reordering subcategories." });
  }
};

module.exports = {
  addSubcategory,
  getAllSubcategories,
  deleteSubcategory,
  updateSubcategory,
  reorderSubcategories,
};
