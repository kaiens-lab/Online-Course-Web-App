const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");
const mongoURI = process.env.MONGO_URI;

// 連結 MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由掛載
app.use("/api/user", authRoute);
app.use(
  "/api/course",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

// 全域性 404 錯誤處理器（應該放在最後）
app.use((req, res) => {
  res.status(404).send("路徑未找到");
});

// 啟動伺服器
app.listen(8080, () => {
  console.log("後端伺服器在聆聽 port 8080...");
});
