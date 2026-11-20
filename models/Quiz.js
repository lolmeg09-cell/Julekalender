const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    _id: String,
    questions: [
      {
      id: Number,
      type: String,
      question: String,
      options: [String],
      video_url: String,
      correct_answer: String,
    },
    ],
},
{collection: "quizzes", timestamps: true}
);

module.exports = mongoose.model("Quiz", quizSchema);

