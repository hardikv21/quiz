const express  = require("express"),
app            = express(),
path           = require("path"),
expressSession = require("express-session"),
passport       = require("passport"),
Auth0Strategy  = require("passport-auth0")
bodyParser     = require('body-parser'),
MongoClient    = require('mongodb').MongoClient,
mongoURL       = "mongodb+srv://hardik:hardik21@atlascluster.p8emwjg.mongodb.net/?retryWrites=true&w=majority",
PORT           = process.env.PORT || 4200,
authRouter     = require("./routes"),
middleware     = require("./middleware");

require("dotenv").config();

const session = {
    secret: process.env.SESSION_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false
};

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressSession(session));

const strategy = new Auth0Strategy(
    {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL: process.env.AUTH0_CALLBACK_URL
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
        return done(null, profile);
    }
);

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});
  
passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    if (req.user) {
        res.locals.currentUser = req.user["_json"]["email"];
    }
    next();
});

app.use("/", authRouter);

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
        
        app.get(
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

        app.post(
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

        app.get(
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

        app.post(
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

app.get("/", (req, res) => res.render("index"));

app.listen(PORT, () => console.log(`Listening on ${PORT}:`));