const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema(
  {
    luke: { type: Number, required: true, min: 1, max: 24, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answer: { type: mongoose.Schema.Types.ObjectId, ref: "Answer", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Winner", winnerSchema);