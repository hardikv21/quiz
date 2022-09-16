const mongoose = require("mongoose");

const scoreSchema = mongoose.Schema({
    score: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("QuizScore", scoreSchema);