const express  = require("express"),
app            = express(),
expressSession = require("express-session"),
passport       = require("passport"),
Auth0Strategy  = require("passport-auth0")
bodyParser     = require('body-parser'),
MongoClient    = require('mongodb').MongoClient,
mongoose       = require("mongoose"),
PORT           = process.env.PORT || 4200,
authRouter     = require("./routes"),
middleware     = require("./middleware"),
connectFlash   = require("connect-flash"),
QuizUser       = require("./models/quizUser"),
loggedUser    = {};

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
app.use(express.json());
app.use(connectFlash());

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

mongoose.connect(process.env.MongoURL, {useNewUrlParser: true})

mongoose.connection.on("error", (error) => {
    console.log(error)
});

mongoose.connection.on("open", () => {
    console.log("Connected to MongoDB database.")
});

const saveUser = (user, req) => {
    user.save()
        .then((result) => loggedUser = result)
        .catch((error) => req.flash("error", error.message));
}

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    if (req.user) {
        const email = req.user["_json"]["email"];
        res.locals.currentUser = {email};
        
        QuizUser.findOne({email}).exec(function(err, foundUser)
        {
            if(err)
            {
                req.flash("error", error.message);
            }
            else if (!foundUser)
            {
                saveUser(new QuizUser({email}), req);  
            }
            else {
                loggedUser = foundUser;
            }
        });
    }
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
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

MongoClient.connect(process.env.MongoURL)
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
                    .catch((error) => req.flash("error", error.message));
            }
        );

        app.post(
            "/sum-quiz",
            middleware,
            (req, res) => {
                score = calculateScore(req.body);
                if (loggedUser) {
                    loggedUser.sumQuiz = score;
                    saveUser(loggedUser, req);
                }
                res.render(
                    "result",
                    {
                        quizType: "Sum",
                        quizScore: score,
                        user: loggedUser
                    }
                );
            }
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
                    .catch((error) => req.flash("error", error.message));
            }
        );

        app.post(
            "/minus-quiz",
            middleware,
            (req, res) => {
                const score = calculateScore(req.body);
                if (loggedUser) {
                    loggedUser.minusQuiz = score;
                    saveUser(loggedUser, req);
                }
                res.render(
                    "result",
                    {
                        quizType: "Minus",
                        quizScore: score,
                        user: loggedUser
                    }
                );
            }
        );
    })
    .catch((error) => console.log(error.message));

app.get("/", (req, res) => res.render("index"));

app.listen(PORT, () => console.log(`Listening on ${PORT}:`));