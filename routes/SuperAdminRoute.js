const express = require("express");
const {
  registerSuperadminHandler,
  loginSuperadminHandler,
  verifySecretKey,
  verifySuperAdmin,
  getAllUsers,
  getAllSellers,
} = require("../controller/SuperAdminCt/SuperAdminController");
const {
  authenticateJWT,
  authorizeSuperadmin,
  Isadmin,
  IsAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Register Superadmin Route
router.post("/register", registerSuperadminHandler);
router.post("/login", loginSuperadminHandler);
router.post("/verify-secret-key", authenticateJWT, verifySecretKey);
router.get("/check-superadmin", authorizeSuperadmin, verifySuperAdmin);
router.get("/check-auth", IsAdmin, verifySuperAdmin);
router.get("/users", IsAdmin, getAllUsers);
router.get("/sellers", IsAdmin, getAllSellers);

module.exports = router;
