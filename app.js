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
quizRouter     = require("./routes/quiz"),
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
app.use("/", quizRouter);

const calculateScore = (response) => {
    let quizScore = 0; 
    for (const property in response) {
        if (eval(property) == response[property]) {
            quizScore += 10;
        }
    }
    return quizScore;
}

// MongoClient.connect(process.env.MongoURL)
//     .then((response) => {
//         const quizDB = response.db("quiz");

//         app.get("/create-question", middleware, (req, res) => {
//             const questions = [
//                 {
//                     question: '1+1',
//                     options: [ 1, 2, 0 ],
//                     answer: 2,
//                     type: 'sum'
//                 },
//                 {
//                     question: '2+1',
//                     options: [ 1, 2, 3 ],
//                     answer: 3,
//                     type: 'sum'
//                 },
//                 {
//                     question: '2+3',
//                     options: [ 2, 5, 7 ],
//                     answer: 5,
//                     type: 'sum'
//                 },
//                 {
//                     question: '2+2',
//                     options: [ 4, 5, 6 ],
//                     answer: 4,
//                     type: 'sum'
//                 },
//                 {
//                     question: '3+1',
//                     options: [ 2, 3, 4 ],
//                     answer: 4,
//                     type: 'sum'
//                 },
//                 {
//                     question: '3+4',
//                     options: [ 5, 6, 7 ],
//                     answer: 7,
//                     type: 'sum'
//                 },
//                 {
//                     question: '4+4',
//                     options: [ 9, 8, 4 ],
//                     answer: 8,
//                     type: 'sum'
//                 },
//                 {
//                     question: '5+2',
//                     options: [ 4, 7, 8 ],
//                     answer: 7,
//                     type: 'sum'
//                 },
//                 {
//                     question: '5+6',
//                     options: [ 10, 11, 2 ],
//                     answer: 11,
//                     type: 'sum'
//                 },
//                 {
//                     question: '8+8',
//                     options: [ 34, 12, 16 ],
//                     answer: 16,
//                     type: 'sum'
//                 },
//                 {
//                     question: '3-1',
//                     options: [ 2, 3, 4 ],
//                     answer: 2,
//                     type: 'minus'
//                 },
//                 {
//                     question: '2-2',
//                     options: [ 2, 1, 0 ],
//                     answer: 0,
//                     type: 'minus'
//                 },
//                 {
//                     question: '7-1',
//                     options: [ 6, 3, 5 ],
//                     answer: 6,
//                     type: 'minus'
//                 },
//                 {
//                     question: '16-7',
//                     options: [ 5, 9, 8 ],
//                     answer: 9,
//                     type: 'minus'
//                 },
//                 {
//                     question: '5-1',
//                     options: [ 2, 3, 4 ],
//                     answer: 4,
//                     type: 'minus'
//                 },
//                 {
//                     question: '9-7',
//                     options: [ 2, 3, 4 ],
//                     answer: 2,
//                     type: 'minus'
//                 },
//                 {
//                     question: '10-2',
//                     options: [ 6, 8, 4 ],
//                     answer: 8,
//                     type: 'minus'
//                 },
//                 {
//                     question: '20-10',
//                     options: [ 9, 3, 10 ],
//                     answer: 10,
//                     type: 'minus'
//                 },
//                 {
//                     question: '19-8',
//                     options: [ 12, 11, 14 ],
//                     answer: 11,
//                     type: 'minus'
//                 },
//                 {
//                     question: '12-8',
//                     options: [ 2, 3, 4 ],
//                     answer: 4,
//                     type: 'minus'
//                 }
//             ];
//             questions.forEach((question) => {
//                 const temp = new QuizQuestion(question);
//                 temp.save()
//                     .then((result) => loggedUser = result)
//                     .catch((error) => req.flash("error", error.message));    
//             });
//         });
//     })
//     .catch((error) => console.log(error.message));

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

app.get("/", (req, res) => res.render("index"));

app.listen(PORT, () => console.log(`Listening on ${PORT}:`));