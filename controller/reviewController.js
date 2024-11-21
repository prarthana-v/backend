const Review = require("../models/ReviewModel");

const createReview = async (req, res) => {
  try {
    const userId = req.user.id;

    const review = createReview(req.body, userId);
    return res.status(201).send({
      success: true,
      message: "Review created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error creating review",
    });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const review = await getAllReviews(userId);
    return res.status(201).send({
      success: true,
      message: "get all Review created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error creating review",
    });
  }
};

module.exports = {
  createReview,
};
