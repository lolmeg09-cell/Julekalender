const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ["admin", "kunde"], default: "kunde", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);