const mongoose = require("mongoose");

const quizUserSchema = mongoose.Schema({
    email: {
        type: String
    },
    sumQuiz: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "QuizScore"
        }
    ],
    minusQuiz: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "QuizScore"
        }
    ]
});

module.exports = mongoose.model("QuizUser", quizUserSchema);