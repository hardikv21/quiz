const express  = require("express"),
router         = express.Router(),
path           = require("path"),
expressSession = require("express-session"),
passport       = require("passport"),
Auth0Strategy  = require("passport-auth0")
bodyParser     = require('body-parser'),
MongoClient    = require('mongodb').MongoClient,
mongoURL       = "mongodb+srv://hardik:hardik21@atlascluster.p8emwjg.mongodb.net/?retryWrites=true&w=majority",
middleware     = require("./middleware");

const filterQuestions = (questions, filterType) => {
    return questions.filter((question) => question.type === filterType);
};

const calculateScore = (response) => {
    let quizScore = 0; 
    for (const property in response) {
        if (eval(property) == response[property]) {
            quizScore += 10;
        }
    }
    return quizScore;
}

MongoClient.connect(mongoURL)
    .then((response) => {
        const quizDB = response.db("quiz");
        
        router.get(
            "/sum-quiz",
            middleware,
            (req, res) => {
                quizDB.collection("question").find().toArray()
                    .then((response) =>
                        res.render(
                            "quiz",
                            {
                                questions: filterQuestions(response, "sum"),
                                quizType: "sum"
                            }
                        )
                    )
                    .catch((error) => console.log(error));
            }
        );

        router.post(
            "/sum-quiz",
            middleware,
            (req, res) => (
                res.render(
                    "result",
                    {
                        quizType: "Sum",
                        quizScore: calculateScore(req.body)
                    }
                )
            )
        );

        router.get(
            "/minus-quiz",
            middleware,
            (req, res) => {
                quizDB.collection("question").find().toArray()
                    .then((response) =>
                        res.render(
                            "quiz",
                            {
                                questions: filterQuestions(response, "minus"),
                                quizType: "minus"
                            }
                        )
                    )
                    .catch((error) => console.log(error));
            }
        );

        router.post(
            "/minus-quiz",
            middleware,
            (req, res) => {
                res.render(
                    "result",
                    {
                        quizType: "Minus",
                        quizScore: calculateScore(req.body)
                    }
                )
            }
        );
    })
    .catch((error) => console.log(error));

router.get("/", (req, res) => res.render("index"));

module.exports = router;