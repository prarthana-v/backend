const categoryModel = require("../models/categoryModel");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const addCategory = async (req, res) => {
  try {
    const superadminId = req.user._id;
    console.log(superadminId, "spspsp");

    const { categoryName } = req.body;
    console.log("Category Name:", req.body);

    if (!categoryName || categoryName.trim() === "") {
      return res.status(400).send({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await categoryModel.findOne({
      categoryName: categoryName.trim(),
    });

    const image = req.file ? req.file.path : "";
    console.log(image, "image");

    if (existingCategory) {
      return res.status(400).send({
        success: false,
        message: "Category name already exists",
      });
    }
    // Find the last category created to get the highest sortOrder
    const lastCategory = await categoryModel.findOne().sort({ sortOrder: -1 }); // Sort in descending order to get the last created category

    // Assign the next sortOrder (lastCategory.sortOrder + 1)
    const sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 0; // If there are no categories, start from 0

    let category = new categoryModel({
      superadminId,
      categoryName: categoryName.trim(),
      image,
      sortOrder,
    });
    console.log(category, "category");

    category = await category.save();

    if (!category) {
      return res.status(400).send({
        success: false,
        message: "Category not created",
      });
    }

    res.status(201).send({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error(error); // Log error to console
    res.status(500).send({
      success: false,
      message: "Server error, please try again later.",
    });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find().sort({ sortOrder: 1 });
    if (!categories) {
      return res.status(400).send({
        success: false,
        message: "Category not found",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Category found",
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getPublicIdFromUrl = (url) => {
  const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    console.log(req.body, req.query, req.params);

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "category not found" });
    }

    // image delete from cloudinary
    if (category.image) {
      const publicId = getPublicIdFromUrl(category.image);
      console.log(publicId, category.image);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary deletion result:", result);
      } else {
        console.log(
          "Could not extract publicId from image URL:",
          category.image
        );
      }
    }

    await categoryModel.findByIdAndDelete(categoryId);
    res
      .status(200)
      .json({ success: true, message: "category deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const updatedCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { categoryName, categoryImage } = req.body;
    console.log(req.params, req.body, req.file);

    // Find the existing category
    const category = await categoryModel.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    let imageUrl = category.image; // Default image is the current image URL

    // If a new image is uploaded, handle the image deletion and update
    if (req.file) {
      const newImageUrl = req.file.path; // Assuming multer stores the image URL in req.file.path

      // If the new image URL is different from the old one, delete the old image from Cloudinary
      if (imageUrl !== newImageUrl) {
        const publicId = getPublicIdFromUrl(imageUrl); // Get the public ID of the old image
        if (publicId) {
          // Delete the old image from Cloudinary
          await cloudinary.uploader.destroy(publicId);
          console.log("Old image deleted:", publicId);
        }

        imageUrl = newImageUrl; // Update to the new image URL
      }
    }

    // Update category fields
    if (categoryName) {
      category.categoryName = categoryName;
    }
    category.image = imageUrl; // Update the image URL field

    // Save the updated category
    const updatedCategory = await category.save();

    // Return the updated category data in the response
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Controller function to reorder categories
const reorderCategories = async (req, res) => {
  try {
    const { categoryIds } = req.body; // Expecting an array of category IDs in new order
    console.log(categoryIds);
    // Ensure categoryIds array is not empty
    if (!categoryIds || categoryIds.length === 0) {
      return res.status(400).json({ message: "Category IDs are required." });
    }

    // Validate that all category IDs exist in the database
    const categories = await categoryModel.find({ _id: { $in: categoryIds } });

    if (categories.length !== categoryIds.length) {
      return res.status(404).json({ message: "Some categories not found." });
    }

    // Reorder categories: Update each category's 'order' field based on its position in the array
    for (let i = 0; i < categoryIds.length; i++) {
      await categoryModel.findByIdAndUpdate(categoryIds[i], {
        sortOrder: i + 1, // Update sortOrder based on new position
      });
    }

    // Fetch updated categories, sorted by 'order'
    const updatedCategories = await categoryModel.find().sort({ sortOrder: 1 });
    console.log(updatedCategories, "updatedcategories");

    res.status(200).json({ success: true, categories: updatedCategories });
  } catch (error) {
    console.error("Error while reordering categories:", error);
    res
      .status(500)
      .json({ message: "Server error while reordering categories." });
  }
};

module.exports = {
  addCategory,
  getCategories,
  deleteCategory,
  updatedCategory,
  getCategoryById,
  reorderCategories,
};
