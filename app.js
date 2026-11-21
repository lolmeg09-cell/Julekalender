  const express = require("express");
  require("dotenv").config();
  const mongoose = require("mongoose");
  const nodemailer = require("nodemailer");
  const argon2 = require("argon2");
  const jwt = require("jsonwebtoken");
  const cookieParser = require("cookie-parser");
  const Winner = require("./models/Winner");  

  const Answer = require("./models/Answer");
  const Quiz = require("./models/Quiz");
  const User = require("./models/User");

  const app = express();
  app.set("view engine", "ejs");

  app.use(cookieParser());
  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
  });

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB error:", err));

  function currentDay() {
    if (process.env.FAKE_DAY) return Number(process.env.FAKE_DAY);
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Oslo",
      day: "numeric",
    }).formatToParts(new Date());

    const day = Number(parts.find((p) => p.type === "day").value);
    return day <= 24 ? day : 0;
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  function normalize(s) {
    return String(s || "")
      .toLocaleLowerCase()
      .trim()
      .replace(/[.,!?]/g, "")
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
      try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(id);
      } catch {
        res.clearCookie("token");
      }
    }
    res.locals.user = req.user;
    next();
  });

  function requireUser(req, res, next) {
    if (!req.user) return res.redirect("/logg-inn");
    next();
  }

  app.get("/", async (req, res) => {
    const today = currentDay();
    let doneLukes = [];
    if (req.user) {
      const answer = await Answer.find({ user: req.user._id })
        .select("luke")
        .lean();
      doneLukes = answer.map((a) => a.luke);
    }
    res.render("index", { today, doneLukes, opened: doneLukes.length });
  });

  app.get("/luke/:id", requireUser, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1 || id > 24) {
        return res.status(404).send("Luken finnes ikke");
      }
      if (id !== currentDay()) {
        return res.status(403).send("Denne luken kan ikke åpnes");
      }
      if (await Answer.exists({ user: req.user._id, luke: id })) {
        return res.redirect("/");
      }

      const q = await getQuestion(id);
      if (!q) return res.status(404).send("Fant ikke spørsmålet");

      const { correct_answer, ...question } = q;
      res.render("luke", {
        luke: id,
        question,
        embedUrl: q.type === "video" ? toEmbedUrl(q.video_url) : null,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("noe gikk galt");
    }
  });

  app.post("/luke/:id", requireUser, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1 || id !== currentDay()) {
        return res.status(403).send("Ikke tilgjengelig");
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
    } catch (err) {
      if (err.code === 11000) return res.redirect("/");
      console.error(err);
      res.status(500).send("Noe gikk galt");
    }
  });

  function setLoginCookie(res, user) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  function requireAdmin(req, res, next) {
    if (!req.user) return res.redirect("/logg-inn");
    if (req.user.role !== "admin") return res.status(403).send("Ingen tilgang");
    next();
  }

  app.get("/admin", requireAdmin, async  (req, res) => { 
    try {
      let luke=Number(req.query.luke);
      if (!Number.isInteger(luke) || luke < 1 || luke > 24){
        luke=currentDay() || 1;
      }

  const [total, correct, pending, participants, perLuke] = await Promise.all([
    Answer.countDocuments({luke}),
    Answer.countDocuments({luke, correct:true}),
    Answer.countDocuments({luke, reviewed:false}),
    User.countDocuments({role: "kunde"}),
    Answer.aggregate([{$group: {_id:"$luke", total: {$sum: 1} } } ] ),
  ]);

  const counts = Array(24).fill(0);
  perLuke.forEach((r) => (counts[r._id-1] = r.total));
  const max = Math.max(...counts, 1);

  res.render("admin", {luke,total,correct,pending,participants,counts,max});
    } catch(err){
      console.error(err);
      res.status(500).send("Noe gikk galt");
    }
  });

  const OPEN_STATUS = {
  riktig: { reviewed: true, correct: true },
  galt: { reviewed: true, correct: false },
  "ikke-vurdert": { reviewed: false },
};

const SORTS = {
  nyest: { createdAt: -1 },
  eldst: { createdAt: 1 },
  riktig: { reviewed: -1, correct: -1, createdAt: -1 }, 
  galt: { reviewed: -1, correct: 1, createdAt: -1 },    
  ikke: { reviewed: 1, createdAt: -1 },                 
  luke: { luke: 1, createdAt: -1 },
};

 app.get("/svar", requireAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById("christmas-quiz").lean();
    const openQs = new Map(
      (quiz?.questions || [])
        .filter((q) => q.type === "open")
        .map((q) => [q.id, q])
    );
    const openLukes = [...openQs.keys()];

    const luke = Number(req.query.luke);
    const status = req.query.status in OPEN_STATUS ? req.query.status : "";
    const sort = req.query.sort in SORTS ? req.query.sort : "nyest";
    const search = (req.query.q || "").trim();

    // kun åpne spørsmål (hvor brukeren skriver selv)
    const filter = { luke: openQs.has(luke) ? luke : { $in: openLukes } };
    if (status) Object.assign(filter, OPEN_STATUS[status]);

    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const users = await User.find({ $or: [{ name: rx }, { email: rx }] })
        .select("_id")
        .lean();
      filter.$or = [{ user: { $in: users.map((u) => u._id) } }, { answer: rx }];
    }

    const answers = await Answer.find(filter)
      .populate("user", "name email")
      .sort(SORTS[sort])
      .lean();

    const rows = answers.map((a) => ({
      ...a,
      fasit: openQs.get(a.luke)?.correct_answer ?? "",
      status: !a.reviewed ? "ikke-vurdert" : a.correct ? "riktig" : "galt",
    }));

    res.render("svar", {
      rows,
      openLukes,
      filters: { luke: openQs.has(luke) ? luke : "", status, sort, q: search },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Noe gikk galt");
  }
});

app.post("/svar/:id/vurder", requireAdmin, async (req, res) => {
  try {
    const { verdict } = req.body; // "riktig" | "galt"
    if (!["riktig", "galt"].includes(verdict)) {
      return res.status(400).send("Ugyldig verdi");
    }
    await Answer.findByIdAndUpdate(req.params.id, {
      correct: verdict === "riktig",
      reviewed: true,
    });
    res.redirect(req.get("referer") || "/svar"); // beholder filter og sortering
  } catch (err) {
    console.error(err);
    res.status(500).send("Noe gikk galt");
  }
});

function validLuke(n) {
  return Number.isInteger(n) && n >= 1 && n <= 24;
}

app.get("/trekning", requireAdmin, async (req, res) => {
  try {
    let luke = Number(req.query.luke);
    if (!validLuke(luke)) luke = currentDay() || 1;

    const [winner, eligible, allWinners] = await Promise.all([
      Winner.findOne({ luke })
        .populate("user", "name email")
        .populate("answer", "answer")
        .lean(),
      Answer.countDocuments({ luke, correct: true }),
      Winner.find().select("luke").lean(),
    ]);

    res.render("trekning", {
      luke,
      winner,
      eligible,
      drawn: allWinners.map((w) => w.luke),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Noe gikk galt");
  }
});

app.post("/trekning/:luke", requireAdmin, async (req, res) => {
  try {
    const luke = Number(req.params.luke);
    if (!validLuke(luke)) return res.status(400).send("Ugyldig luke");

    // Trekk kun hvis luken ikke allerede har en vinner
    if (!(await Winner.exists({ luke }))) {
      const [pick] = await Answer.aggregate([
        { $match: { luke, correct: true } },
        { $sample: { size: 1 } },
      ]);
      if (!pick) return res.status(400).send("Ingen riktige svar å trekke blant");

      await Winner.create({ luke, user: pick.user, answer: pick._id });
    }
    res.redirect(`/trekning?luke=${luke}`);
  } catch (err) {
    // To som trykker samtidig: unik indeks stopper den andre
    if (err.code === 11000) return res.redirect(`/trekning?luke=${req.params.luke}`);
    console.error(err);
    res.status(500).send("Noe gikk galt");
  }
});

  app.get("/logg-inn",  (req, res) => {
    res.render("logg-inn");
  });

  app.get("/sporsmal", requireAdmin, (req, res) => {
    res.render("sporsmal");
  });

  app.get("/registrer", (req, res) => {
    res.render("registrer");
  });

  app.post("/logg-ut", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
  });

  app.post("/registrer", async (req, res) => {
    try {
      const name = (req.body.name || "").trim();
      const email = (req.body.email || "").trim().toLowerCase();

      if (!/^[a-zA-Z0-9._%+\-]+@afk\.no$/.test(email)) {
        return res.status(400).send("Ugyldig e-postadresse");
      }

      const user = await new User({ email, name }).save();

      setLoginCookie(res, user);
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
      const user = await User.findOne({ email });

      if (!user)
        return res.status(401).send("Fant ingen bruker med den e-posten");
      if (user.role === "admin")
        return res.status(403).send("Admin kan ikke logge inn her");

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




