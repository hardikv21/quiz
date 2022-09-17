const express     = require("express"),
router            = express.Router(),
middleware        = require("../middleware"),
QuizQuestion      = require("../models/quizQuestion"),
QuizUser          = require("../models/quizUser"),
QuizScore         = require("../models/quizScore");

router.get(
    "/history",
    middleware,
    (req, res) => {
        QuizUser.findOne({email: res.locals.currentUser.email}).populate("sumQuiz").populate("minusQuiz").exec((error, foundUser) => {
            if(error)
            {
                req.flash("error", error.message);
                res.redirect("/");
            }
            else {
                res.render("history", {user: foundUser});
            }
        });
    }
);

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

const updateUser = (req, res, score, quizType) => {
    QuizUser.findOne({email: res.locals.currentUser.email}).exec((error, foundUser) => {
        if(error)
        {
            req.flash("error", error.message);
        }
        else {
            const newScore = new QuizScore({score});
            newScore.save()
                .then()
                .catch((err) => req.flash("error", err.message));
            if (quizType === "sum") {
                foundUser.sumQuiz.unshift(newScore);
            }
            else {
                foundUser.minusQuiz.unshift(newScore);
            }
            console.log(foundUser);
            res.locals.currentUser = foundUser;
            foundUser.save()
                .then()
                .catch((err) => req.flash("error", err.message));
        }
    });
};

const calculateScore = (response) => {
    let quizScore = 0; 
    for (const property in response) {
        if (eval(property) == response[property]) {
            quizScore += 10;
        }
    }
    return quizScore;
};

router.post(
    "/sum-quiz",
    middleware,
    (req, res) => {
        score = calculateScore(req.body);
        updateUser(req, res, score, "sum");
        res.render(
            "result",
            {
                quizType: "Sum",
                quizScore: score
            }
        );
    }
);

router.post(
    "/minus-quiz",
    middleware,
    (req, res) => {
        const score = calculateScore(req.body);
        updateUser(req, res, score, "minus");
        res.render(
            "result",
            {
                quizType: "Minus",
                quizScore: score
            }
        );
    }
);

module.exports = router;