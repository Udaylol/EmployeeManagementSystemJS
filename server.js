require('dotenv').config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { authenticate, signAuthToken } = require("./middlewares/auth");
const employeeRoutes = require("./routes/employeeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const Admin = require("./models/Admin");
const { connectDB } = require("./utils/utils");

const app = express();

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/managely";
const NODE_ENV = process.env.NODE_ENV || 'development';


app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

connectDB(DATABASE_URL);

app.use("/api/admins", adminRoutes);
app.use("/api/employees", employeeRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/home", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ message: "Username and password required." });
  }
  try {
    const admin = await Admin.findOne({ username });
    if (!admin || admin.password !== password) {
      return res.json({ message: "Invalid username or password." });
    }
    const token = signAuthToken({ id: admin._id, username: admin.username });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    return res.json({ message: "Login successful!" });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.json({ message: "An error occurred. Please try again." });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out" });
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
