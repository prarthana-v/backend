const UserModel = require("../models/userModel");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const registerSuperadmin = async (data) => {
  const { username, email, password } = data;

  // Check if superadmin already exists
  const existingSuperadmin = await Superadmin.findOne({ email });
  if (existingSuperadmin) {
    console.log("superadmin already exists.");
    throw new Error("Superadmin with this email already exists.");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create superadmin
  const superadmin = new Superadmin({
    superadminId: uuidv4(),
    username,
    email,
    password: hashedPassword,
  });

  return await superadmin.save();
};

const loginSuperadmin = async (email, password) => {
  // Check if superadmin exists
  const superadmin = await UserModel.findOne({ email });
  console.log(superadmin, "record-2");
  if (!superadmin) {
    throw new Error("Superadmin not found.");
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, superadmin.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password.");
  }

  // Generate JWT
  const token = jwt.sign(
    {
      id: superadmin._id,
      email: superadmin.email,
      role: superadmin.role,
    },
    process.env.JWT_SECRETKEY, // Secret key
    { expiresIn: "10m" } // Token expiration time
  );
  return token;
};

module.exports = { registerSuperadmin, loginSuperadmin };
