const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const registerUser = async (req, res) => {
  try {
    const { username, password, phone, confirmPassword, email } = req.body;
    // Check if all fields are provided
    if (!username || !phone || !password || !confirmPassword || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }
    console.log(req.body);

    const userExists = await userModel.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Check if passwords match  email karu ke nai
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      username,
      email,
      phone,
      password: hashedPassword,
    });
    await newUser.save();

    return res.status(200).send({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    // console.log(isMatch);

    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    // Generate access token
    // console.log(user);
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRETKEY,
      { expiresIn: "3h" }
    );

    res.cookie("token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
      maxAge: 3 * 60 * 60 * 1000,
    });
    console.log("Cookie set:", req.cookies.token);

    return res
      .status(200)
      .send({ success: true, message: "Login successful", token, user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "saaraatrends@gmail.com",
    pass: "zutm uoao flhj gzse",
  },
});

// Send Verification Email
const sendVerificationEmail = async (req, res) => {
  try {
    const email = req.body.email;
    console.log(req.body.email);
    const user = await userModel.findOne({ email });

    if (!user) {
      console.log("user not found");
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);

    // Generate a JWT token for password reset
    const resetToken = jwt.sign(
      { id: user._id, otp },
      process.env.JWT_SECRETKEY,
      { expiresIn: "15m" } // Token valid for 15 minutes
    );

    // Store token in HTTP-only cookie
    res.cookie("resetToken", resetToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 3 * 60 * 60 * 1000, // 15 minutes
    });

    const mailOptions = {
      from: "saaraatrends@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).send({
          success: false,
          message: `${error},Error sending verification email`,
        });
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).send({
          success: true,
          message: "Verification email sent. Please check your email.",
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const { resetToken } = req.cookies;
    console.log(resetToken);

    if (!resetToken) return res.status(401).send({ message: "Unauthorized" });

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRETKEY);

    if (decoded.otp !== otp) {
      return res.status(400).send({ message: "Invalid OTP" });
    }

    return res.status(200).send({ message: "OTP verified" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.cookies; // Get the token from the cookie
    const { newPassword, confirmPassword } = req.body;

    if (newPassword != confirmPassword) {
      res.status(400).send({
        message: "passwords do not match",
      });
    }

    if (!resetToken) return res.status(401).send({ message: "Unauthorized" });

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRETKEY);

    const user = await userModel.findById(decoded.id);
    console.log(decoded);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Clear the reset token cookie after successful password reset
    res.clearCookie("resetToken");

    res
      .status(200)
      .send({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error,
    });
  }
};

// const logout = async (req, res) => {
//   const token = req.cookies.accessToken; // Use the correct name here
//   console.log("aaa", token);

//   if (!token) {
//     return res.status(400).json({
//       success: false,
//       message: "No token found",
//     });
//   }

//   // Clear the access token cookie
//   res.clearCookie("accessToken");
//   res.status(200).json({
//     success: true,
//     message: "User logged out in successfully",
//   });
// };

const getProfile = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    // console.log("Token from cookies:", token); // This should log the token if it's set correctly
    if (!token) return res.status(401).send("Unauthorized");

    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY); // Use the same secret key
    const user = await userModel.findById(decoded.id).select("-password");
    console.log(user);

    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error,
    });
  }
};
const getuser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    res.status(200).send({ success: true, user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, message: "Failed to get user details" });
  }
};
const getAuth = async (req, res) => {
  console.log(req.user);
  let seller = req.seller;
  try {
    res.status(200).json({
      success: true,
      message: "User is authenticated",
      seller,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to retrieve orders",
    });
  }
};
const getadmin = async (req, res) => {
  try {
    res.send({
      success: true,
      message: "Welcome to the admin dashboard",
      user: req.user,
    });
  } catch (error) {
    console.log(error);
  }
};

const alluser = async (req, res) => {
  try {
    const user = await Usermodel.find({});
    if (!user) {
      return res.status(404).send({ success: false, message: "No user found" });
    }
    res.status(200).send({
      success: true,
      message: "All user found",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { mobileNumber, username, email } = req.body;
    console.log(req.body);

    // Validate input
    if (!mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required.",
      });
    }

    // Find the user by mobileNumber
    const user = await Usermodel.findOne({ mobileNumber });
    console.log(user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update the user fields if they are provided
    if (username) user.username = username;
    if (email) user.email = email;

    // Save the updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAuth,
  sendVerificationEmail,
  verifyOtp,
  resetPassword,
  getProfile,
  getadmin,
  getuser,
  alluser,
  updateUser,
};
