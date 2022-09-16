const express = require("express"),
router        = express.Router(),
middleware     = require("../middleware"),
QuizQuestion   = require("../models/quizQuestion");

require("dotenv").config();

router.get(
    "/sum-quiz",
    middleware,
    (req, res) => {
        QuizQuestion.find({type: "sum"}).exec((error, questions) => {
            if (error) {
                req.flash("error", error.message);
            }
            else {
                res.render(
                    "quiz",
                    {
                        questions: questions,
                        quizType: "sum"
                    }
                );
            }
        })
    }
);

router.get(
    "/minus-quiz",
    middleware,
    (req, res) => {
        QuizQuestion.find({type: "minus"}).exec((error, questions) => {
            if (error) {
                req.flash("error", error.message);
            }
            else {
                res.render(
                    "quiz",
                    {
                        questions: questions,
                        quizType: "minus"
                    }
                );
            }
        })
    }
);

module.exports = router;