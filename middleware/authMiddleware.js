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
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You need to log in to access this resource.",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    console.log(decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};
const Isadmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You need to log in to access this resource.",
      });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY_JWT);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Attach user to the request object
    req.user = user;

    // Continue to the next middleware or route
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};
const checkAuth = async () => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/seller/check-auth`,
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
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You need to log in to access this resource.",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    const user = await userModel.findById(decoded.id);
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
    const token = req.cookies.token;
    console.log(token, "token");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You need to log in to access this resource.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    // console.log(decoded);

    // Fetch the seller from the Seller schema using the decoded ID
    const seller = await sellerModel.findById(decoded.sellerId);
    console.log("seller", seller);

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
module.exports = {
  verifyToken,
  ISUser,
  IsSeller,
  Isadmin,
  IsLoggedIn,
  checkAuth,
};
