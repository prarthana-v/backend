const express = require("express");
const {
  registerSeller,
  loginSeller,
  sendOtp,
  verifyOtp,
  resetPassword,
  logout,
} = require("../controller/sellerController");
const { checkAuth, IsSeller } = require("../middleware/authMiddleware");
const { getAuth } = require("../controller/authController");
const routes = express.Router();

routes.post("/signup", registerSeller);
routes.post("/login", loginSeller);
routes.post("/forgot-password", sendOtp);
routes.post("/verify-otp", verifyOtp);
routes.post("/reset-password", resetPassword);
routes.post("/logout", logout);
routes.get("/check-auth", IsSeller, getAuth);
module.exports = routes;
