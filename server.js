const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
app.use(cookieParser());

require("dotenv").config();
const connectDB = require("./config/db");
connectDB();

const cors = require("cors");
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://192.168.29.58:5173",
    "https://saaraa-trends.vercel.app",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", require("./routes/indexRoute"));
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
