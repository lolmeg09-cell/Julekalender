const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    user: {type:mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    luke: {type: Number, required: true, min:1, max:24},
    answer: {type: String, required:true, trim:true},
    correct: {type: Boolean, default:false},
    reviewed: {type: Boolean, default:false},
    },
    {timestamps:true}
);

answerSchema.index({user: 1, luke:1}, {unique: true});

module.exports = mongoose.model("Answer", answerSchema);

