const sellerModel = require("../models/sellerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer"); // For sending emails
const crypto = require("crypto");

const registerSeller = async (req, res) => {
  try {
    const { username, phone, email, password, confirmPassword } = req.body;

    // Validation (simple checks)
    if (!username || !phone || !email || !password || !confirmPassword) {
      return res.status(400).send({ message: "Please fill all fields" });
    }

    // password don not match
    if (password !== confirmPassword) {
      return res
        .status(400)
        .send({ message: "password and confirm passwords do not match" });
    }

    // Check if seller already exists
    const existingSeller = await sellerModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingSeller) {
      return res.status(400).send({ message: "Seller already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new seller
    const newSeller = new sellerModel({
      username,
      phone,
      email,
      password: hashedPassword,
    });

    // Save to the database
    await newSeller.save();

    res.status(200).send({
      success: true,
      message: "Seller registered successfully",
      seller: {
        id: newSeller._id,
        username: newSeller.username,
        phone: newSeller.phone,
        email: newSeller.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "server error",
    });
  }
};

const loginSeller = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Validation
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }
    // Find seller by email or phone
    const seller = await sellerModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (!seller) {
      return res.status(400).send({ message: "Seller not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Invalid Password" });
    }

    // Generate JWT token
    const payload = {
      sellerId: seller._id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRETKEY, {
      expiresIn: "1h",
    });

    // Send the token as a cookie
    res.cookie("sellertoken", token, {
      httpOnly: false, // Ensure false for local development; true in production
      secure: false, // Set true if using HTTPS in production
      sameSite: "Lax", // Change to "None" with secure: true for cross-site nakar Lax
      maxAge: 3600000, // 1 hour
    });
    console.log("Cookie set:", req.cookies.sellertoken); // Debugging

    res.status(200).send({
      success: true,
      message: "Seller logedIn successfully",
      token,
      seller: {
        id: seller._id,
        name: seller.username,
        phone: seller.phone,
        email: seller.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "server error",
    });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    // Find seller by email or phone
    const seller = await sellerModel.findOne({ email });
    if (!seller) {
      return res.status(404).send({ message: "Seller not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(otp);
    const otpExpires = Date.now() + 3600000; // OTP expires in 1 hour

    // Create a JWT with the mobile number, OTP, and expiration time
    const token = jwt.sign(
      { email, otp, otpExpires },
      process.env.JWT_SECRETKEY,
      { expiresIn: "30m" }
    );
    console.log("Generated Token:", token);

    // Set the token as a cookie
    res.cookie("verifytoken", token, {
      httpOnly: true,
      secure: true, // Set to 'true' in production
      sameSite: "None", // Adjust as necessary
      maxAge: 3600000, // 1 hour
    });

    // Send response (include OTP in response for testing; remove in production)
    res.status(200).send({ success: true, message: "OTP sent.", otp, token });

    // Set up email options with OTP
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use your email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: seller.email,
      from: process.env.EMAIL_USER,
      subject: "Your Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 min.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email error:", error);
        return res.status(500).send({ message: "Error sending OTP email" });
      }

      return res.status(200).send({ message: "OTP sent to email" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "server error",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const token = req.cookies.verifytoken;

    if (!token) {
      return res
        .status(401)
        .send({ success: false, message: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);

    // Check if OTP is correct and not expired
    if (decoded.otp === otp && decoded.otpExpires > Date.now()) {
      return res
        .status(200)
        .send({ success: true, message: "OTP verified successfully" });
    } else {
      return res
        .status(400)
        .send({ success: false, message: "Invalid or expired OTP" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const resetToken = req.cookies.verifytoken;

  if (!resetToken) {
    return res
      .status(401)
      .send({ success: false, message: "Unauthorized request" });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res
      .status(400)
      .send({ success: false, message: "Passwords do not match" });
  }

  try {
    // Decode reset token to get user ID
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRETKEY);
    const userId = decoded.userId;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    await sellerModel.findByIdAndUpdate(userId, { password: hashedPassword });

    // Clear reset token cookie after success
    res.clearCookie("resetToken");
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in password reset:", error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

const logout = (req, res) => {
  try {
    console.log("Cookies:", req.cookies, "sellerlogout"); // For cookies
    // Clear the cookie containing the token
    res.clearCookie("token", { httpOnly: true, secure: true });
    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error in logout:", error.message); // Log the error for debugging
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  registerSeller,
  loginSeller,
  sendOtp,
  verifyOtp,
  resetPassword,
  logout,
};
