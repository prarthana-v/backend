const express = require("express");
const {
  registerUser,
  loginUser,
  getAuth,
  sendVerificationEmail,
  verifyOtp,
  resetPassword,
  getProfile,
  alluser,
  updateUser,
  getuser,
  getadmin,
  logout,
} = require("../controller/authController");
const {
  ISUser,
  IsLoggedIn,
  Isadmin,
  IsAdmin,
} = require("../middleware/authMiddleware");
const routes = express.Router();

routes.post("/register", registerUser);
routes.post("/login", loginUser);
routes.get("/check-auth", ISUser, getAuth);
routes.post("/forgotpassword", sendVerificationEmail);
routes.post("/verify-otp", verifyOtp);
routes.post("/reset-password", resetPassword);
routes.get("/profile", ISUser, getProfile);
routes.get("/allusers", alluser);
routes.get("/getuser", IsLoggedIn, getuser);
routes.post("/update-user", IsLoggedIn, updateUser);
routes.post("/check-admin", IsAdmin, getadmin);
routes.post("/logout", logout);

module.exports = routes;
