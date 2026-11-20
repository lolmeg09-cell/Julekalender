const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const argon2 = require("argon2")
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const Answer = require("./models/Answer")
const Quiz = require("./models/Quiz")
const User = require("./models/User")

const app = express();
app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB error:", err));

function currentDay() {
  if (process.env.FAKE_DAY) return Number(process.env.FAKE_DAY);
  const now = new Date();
  if (now.getMonth() !== 11) return 0;
  return Math.min(now.getDate(), 24);
}

function toEmbedUrl(url) {
  try {
    const v = new URL(url).searchParams.get("v");
    return v ? `https://www.youtube.com/embed/${v}` : null;
  } catch {
    return null;
  }
}

function setLoginCookie(res, user) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function normalize(s) {
  return String(s || "").toLocaleLowerCase().trim().replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ");
}

async function getQuestion(id) {
  const quiz = await Quiz.findById("christmas-quiz").lean();
  return quiz?.questions.find((q) => q.id === id); 
}

app.use(async (req, res, next) => {
  req.user = null;
  const token = req.cookies.token;
  if (token) {
    try{
      const{id}=jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(id);
    } catch {
      res.clearCookie("token");
    }
  }
  res.locals.user = req.user;
  next();

  
});

function requireUser(req,res, next) {
  if(!req.user) return res.redirect("/registrer");
  next();
} 

app.get("/", async (req,res) => {
  const today = currentDay();
  let doneLukes = [];
  if (req.user) {
    const answer = await Answer.find({user: req.user._id}).select("luke").lean();
    doneLukes = answer.map((a) => a.luke);
  }
  res.render("index", {today, doneLukes, opened: doneLukes.length});  
});

app.get("/luke/:id", requireUser, async (req,res) => {
  try {
    const id = Number(req.params.id);
    if(!Number.isInteger(id) || id  < 1 || id > 24) {
      return res.status(404).send("Luken finnes ikke");
    } 
    if (id > currentDay()) {
      return res.status(403).send("Denne luken kan ikke åpnes ennå");
    }
    if (await Answer.exists({user: req.user._id, luke:id })) {
      return res.redirect("/");
    }

    const q = await getQuestion(id);
    if (!q) return res.status(404).send("Fant ikke spørsmålet");

    const {correct_answer, ...question} = q;
    res.render("luke", {
      luke:id,
      question,
      embedUrl: q.type === "video" ? toEmbedUrl(q.video_url) : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("noe gikk galt");
  }
});

app.post("/luke/:id", requireUser, async (req, res) => {
  try{
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1 || id > currentDay()) {
      return res.status(403).send("Ikke tilgjenglig");
    }

    const q = await getQuestion(id);
    if (!q) return res.status(404).send("Fant ikke spørsmålet");

    const answer = (req.body.answer || "").trim();
    if (!answer) return res.status(400).send("Du må svare");

    await Answer.create({
      user: req.user._id,
      luke: id,
      answer,
      correct: normalize(answer) === normalize(q.correct_answer),
  });
  res.redirect("/");
  } catch(err) {
    if (err.code === 11000) return res.redirect("/");
    console.error(err);
    res.status(500).send("Noe gikk galt");
  }
});

function requireAdmin(req, res, next) {
  if (!req.user) return res.redirect("/logg-inn");
  if (req.user.role !== "admin") return res.status(403).send("Ingen tilgang");
  next();
}

app.get("/admin",(req, res) => {
  res.render("admin");
});

app.get("/svar",(req, res) => {
  res.render("svar");
});

app.get("/trekning",(req, res) => {
  res.render("trekning");
});

app.get("/logg-inn", (req,res) => {
  res.render("logg-inn")
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
    setLoginCookie(res, user);
    res.redirect("/");

    if (!/^[a-zA-Z0-9._%+\-]+@afk\.no$/.test(email)) {
      return res.status(400).send("Ugyldig e-postadresse");
    }

    const user = await new User({email, name}).save();

    const token = jwt.sign({id:user._id }, process.env.JWT_SECRET, {expiresIn: "30d"});
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 *1000,
    });
      

    res.redirect("/");
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).send("Denne e-posten er allerede registrert");
    }
    res.status(500).send("Noe gikk galt");
  }
});

app.post("/logg-inn", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({email});

    if (!user) return res.status(401).send("Fant ingen bruker med den e-posten");
    if (user.role === "admin") return res.status(403).send("Admin kan ikke logge inn her")

      setLoginCookie(res, user);
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).send("Noe gikk galt");
    }
});










app.listen(process.env.PORT, () => {
  console.log(`listening on port http://localhost:${process.env.PORT}`);
});

