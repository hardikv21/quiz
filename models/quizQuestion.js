const mongoose = require('mongoose');

const quizQuestionSchema = mongoose.Schema({
    question: {
        type: String
    },
    options: {
        type: [Number]
    },
    answer: {
        type: Number
    },
    type: {
        type: String
    }
});

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);