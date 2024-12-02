// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const sellerModel = require("../models/sellerModel");

const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(403).json({ message: "Token is required" });

  jwt.verify(token, process.env.JWT_SECRETKEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

const IsLoggedIn = async (req, res, next) => {
  try {
    // Retrieve token from the request headers or cookies
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    console.log("Token in IsLoggedIn", token);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You need to log in to access this resource for cart.",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);

    req.user = decoded;
    // console.log("Decoded JWT payload in IsLoggedIn middleware:", req.user);
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};
const IsAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.superverifiedtoken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You need to log in to super admin to access this resource.",
      });
    }
    console.log(token, "Token received for super admin");

    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    console.log(decoded, "Decoded JWT");

    const user = await userModel.findById(decoded.superadminId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Super Admin not found. Please log in again.",
      });
    }
    console.log(user);

    if (user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Attach user to the request object
    req.user = user;

    // Log to ensure next() is reached
    console.log("Admin verified. Proceeding to next middleware.");

    next(); // Proceed to addCategory handler
  } catch (error) {
    console.log(error, "Error in verifying or processing token");
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};
const thatverified = async (req, res, next) => {
  try {
    const token = req.cookies.superverifiedtoken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You need to log in to super admin to access this resource.",
      });
    }
    console.log(token, "Token received for super admin");

    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    console.log(decoded, "Decoded JWT");

    const user = await userModel.findById(decoded.superadminId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Super Admin not found. Please log in again.",
      });
    }
    console.log(user);

    if (user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Attach user to the request object
    req.user = user;

    // Log to ensure next() is reached
    console.log("Admin verified. Proceeding to next middleware.");

    next(); // Proceed to addCategory handler
  } catch (error) {
    console.log(error, "Error in verifying or processing token");
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};
const checkAuth = async () => {
  try {
    console.log(process.env.SERVER_URL);
    const response = await axios.get(
      `${process.env.SERVER_URL}/seller/check-auth`,
      {
        withCredentials: true, // Ensure cookies are sent
      }
    );
    console.log("unauthorized");
    return response.data.success; // Check if seller is authenticated
  } catch (error) {
    console.log(error);

    return false;
  }
};

const ISUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Token in User", token);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You need to log in to access this resources , hii prarthana.",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    // console.log(decoded);
    const user = await userModel.findById(decoded.id);
    // console.log(user, "IsUser");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};
const IsSeller = async (req, res, next) => {
  try {
    console.log(req.cookies);
    const token = req.cookies.sellertoken;
    console.log(token, "token in IsSeller");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You need to log in to access this resource.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    // console.log("Decoded JWT:", decoded);

    // Fetch the seller from the Seller schema using the decoded ID
    const seller = await sellerModel.findById(decoded.sellerId);
    // console.log("Seller found:", seller);

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Seller not found. Please log in again.",
      });
    }

    // Attach the seller to the request object for further use in routes
    req.seller = seller;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

// Middleware to check if the superadmin is logged in
const authenticateJWT = (req, res, next) => {
  const token =
    req.cookies.superloggedtoken || req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .send({ error: "No token provided. Please login first." });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRETKEY, (err, user) => {
    if (err) {
      return res.status(403).send({ error: "Invalid or expired token." });
    }
    // console.log(user, "super admin details");
    // If the token is valid, attach the user (superadmin info) to the request
    req.superadmin = user;
    next(); // Proceed to the next middleware or the route handler
  });
};

const authorizeSuperadmin = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .send({ success: false, message: "Please login first." });
  }
  // console.log(token);
  const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
  // console.log(decoded);
  const user = await userModel.findById(decoded.id);
  // console.log(user);

  console.log(user.role);
  if (user.role !== "superadmin") {
    return res.status(401).send({
      success: false,
      message: "You are not authorized to access super admin.",
    });
  }
  next();
};

module.exports = {
  verifyToken,
  ISUser,
  IsSeller,
  IsAdmin,
  IsLoggedIn,
  checkAuth,
  authenticateJWT,
  authorizeSuperadmin,
  thatverified,
};
