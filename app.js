const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const argon2 = require("argon2")
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();

app.set("view engine", "ejs");


const User = require("./models/User")

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



app.get("/registrer", (req, res) => {
  res.render("registrer");
});

app.post("/registrer", async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();

    if (!/^[a-zA-Z0-9._%+\-]+@afk\.no$/.test(email)) {
      return res.status(400).send("Ugyldig e-postadresse");
    }

    await new User({ email, name }).save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).send("Denne e-posten er allerede registrert");
    }
    res.status(500).send("Noe gikk galt");
  }
});



















app.listen(process.env.PORT, () => {
  console.log(`listening on port http://localhost:${process.env.PORT}`);
});

