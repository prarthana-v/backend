const { validateRegisterData } = require("../../middleware/utility");
const {
  registerSuperadmin,
  loginSuperadmin,
} = require("../../services/SuperAdminService");
const jwt = require("jsonwebtoken");

const registerSuperadminHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body, "request body");
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).send({ error: "All fields are required." });
    }

    let response = validateRegisterData(email, password);
    if (response) {
      return res
        .status(400)
        .send({ error: "email or password are not strong enough" });
    }

    // Register superadmin
    const superadmin = await registerSuperadmin({ username, email, password });
    console.log(superadmin, "superadmin response");
    return res.status(201).send({
      message: "Superadmin registered successfully.",
      data: {
        superadminId: superadmin.superadminId,
        username: superadmin.username,
        email: superadmin.email,
        role: superadmin.role,
      },
    });
  } catch (error) {
    console.error(error, "error register in super admin");
    return res.status(500).send({ success: false, message: error.message });
  }
};

const loginSuperadminHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .send({ success: false, error: "Email and password are required." });
    }

    // Call the service to perform login
    const token = await loginSuperadmin(email, password);
    console.log(token, "oii token avo");
    // Set the token in the cookie
    // res.clearCookie("supertoken");
    res.cookie("superloggedtoken", token, {
      httpOnly: false,
      secure: false,
      maxAge: 10 * 60 * 1000, //10 mins
      sameSite: "Strict",
    });

    // Return the success response with the token
    return res.status(200).send({
      message: "Login successful , Enter Secret key to proceed further.",
      superloggedtoken: token,
    });
  } catch (error) {
    console.log(error, "error in login super admin");
    return res.status(500).send({ success: false, message: error.message });
  }
};

// Verify the static secret key provided by the superadmin
const verifySecretKey = async (req, res) => {
  try {
    const { secretKey } = req.body;
    const superadmin = req.superadmin;
    console.log(superadmin, "record");
    // Ensure the secret key is provided
    if (!secretKey) {
      return res
        .status(400)
        .send({ success: false, message: "Secret key is required." });
    }

    // Compare the provided secret key with the predefined one
    if (secretKey != process.env.SUPERADMIN_SECRET_KEY) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid secret key." });
    }

    console.log(req.cookies);
    // Secret key is correct, clear the JWT token cookie
    res.clearCookie("superloggedtoken"); // This will clear the JWT token from the cookie

    // Secret key is correct, return a success message and JWT token
    const newToken = jwt.sign(
      {
        superadminId: superadmin.id,
        email: superadmin.email,
        role: superadmin.role,
      },
      process.env.JWT_SECRETKEY,
      { expiresIn: "1d" } // Set expiration for the token
    );

    res.cookie("superverifiedtoken", newToken, {
      httpOnly: false,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 1 day (in milliseconds)
      sameSite: "Lax",
    });

    return res.status(200).send({
      success: true,
      message: "Secret key verified successfully. Access granted.",
      superverifiedtoken: newToken,
      superadmin,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal server error." });
  }
};

const verifySuperAdmin = async (req, res) => {
  try {
    res.status(200).send({
      success: true,
      message: "Super Admin verified successfully",
    });
  } catch (error) {
    console.log(error, "super admin not verified");
    res.status(500).send({
      success: false,
      message: "role not super admin",
      error,
    });
  }
};

module.exports = {
  registerSuperadminHandler,
  loginSuperadminHandler,
  verifySecretKey,
  verifySuperAdmin,
};
