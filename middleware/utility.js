const validateRegisterData = (email, password) => {
  const emailRegex = /^[a-z][a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!emailRegex.test(email)) {
    throw new Error("Email must start with a lowercase letter.");
  }
  if (!passwordRegex.test(password)) {
    throw new Error(
      "Password must be at least 8 characters long, include a number, and a special character."
    );
  }
};

module.exports = {
  validateRegisterData,
};
