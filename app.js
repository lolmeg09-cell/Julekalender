const express = require('express');
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  res.render("index");
});













app.listen(process.env.PORT, () => {
  console.log(`listening on port http://localhost:${process.env.PORT}`);
});

