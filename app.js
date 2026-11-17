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

app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});


app.get("/",(req, res) => {
  res.render("index");
});

app.get("/admin",(req, res) => {
  res.render("admin");
});

app.get("/svar",(req, res) => {
  res.render("svar");
});

app.get("/trekning",(req, res) => {
  res.render("trekning");
});

app.get("/sporsmal",(req, res) => {
  res.render("sporsmal");
});

















app.listen(process.env.PORT, () => {
  console.log(`listening on port http://localhost:${process.env.PORT}`);
});

