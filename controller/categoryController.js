const categoryModel = require("../models/categoryModel");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary");

const addCategory = async (req, res) => {
  try {
    const superadminId = req.user._id;
    console.log(superadminId);

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

    let category = new categoryModel({
      superadminId,
      categoryName: categoryName.trim(),
      image,
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
    const categories = await categoryModel.find({});
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
  // Extract the part of the URL after '/upload/' and before the file extension
  const parts = url.split("/");
  const publicIdWithExtension = parts
    .slice(parts.indexOf("upload") + 1)
    .join("/");
  const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ""); // Remove file extension
  return publicId;
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
    const { id, categoryName, categoryImage } = req.body;
    console.log(req.params, req.body);

    const category = await categoryModel.findById(categoryId);
    console.log(category);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (categoryImage && categoryImage !== category.image) {
      // Delete the old image from Cloudinary
      const publicId = getPublicIdFromUrl(category.image);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Old image deletion result:", result);
      } else {
        console.log(
          "Could not extract publicId from old image URL:",
          category.image
        );
      }
      // Update the category image to the new URL
      category.image = categoryImage;
    }

    // Update other fields
    if (categoryName) category.name = categoryName;

    // Save the updated category
    const updatedCategory = await category.save();

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
module.exports = {
  addCategory,
  getCategories,
  deleteCategory,
  updatedCategory,
  getCategoryById,
};
