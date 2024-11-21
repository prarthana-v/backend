const express = require("express");
const {
  registerUser,
  loginUser,
  getAuth,
  sendVerificationEmail,
  verifyOtp,
  resetPassword,
  logout,
  getProfile,
  alluser,
  updateUser,
  getuser,
  getadmin,
} = require("../controller/authController");
const { ISUser, IsLoggedIn, Isadmin } = require("../middleware/authMiddleware");
const routes = express.Router();

routes.post("/register", registerUser);
routes.post("/login", loginUser);
routes.get("/check-auth", ISUser, getAuth);
routes.post("/request-reset", sendVerificationEmail);
routes.get("/verify-otp", verifyOtp);
routes.post("/reset-password", resetPassword);
routes.post("/logout", logout);
routes.get("/profile", ISUser, getProfile);
routes.get("/allusers", alluser);
routes.get("/getuser", IsLoggedIn, getuser);
routes.post("/update-user", IsLoggedIn, updateUser);
routes.post("/check-admin", Isadmin, getadmin);

module.exports = routes;
