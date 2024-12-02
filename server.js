const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
app.use(cookieParser());

require("dotenv").config();
const connectDB = require("./config/db");
connectDB();

const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, // This allows cookies to be sent
};
app.use(cors(corsOptions));
///https://saaraa-trends.vercel.app
app.use(express.json()); // This will parse JSON body

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.use("/", require("./routes/indexRoute"));
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
