const mongoose = require('mongoose');

const quizUserSchema = mongoose.Schema({
    email: {
        type: String
    },
    sumQuiz: {
        type: Number,
        default: 0
    },
    minusQuiz: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('QuizUser', quizUserSchema);