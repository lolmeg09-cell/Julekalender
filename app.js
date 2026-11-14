const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const argon2 = require("argon2")
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI);

app.get("/",(req, res) => {
  res.render("index");
});













app.listen(process.env.PORT, () => {
  console.log(`listening on port http://localhost:${process.env.PORT}`);
});

