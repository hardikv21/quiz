const express  = require("express"),
app            = express(),
expressSession = require("express-session"),
passport       = require("passport"),
Auth0Strategy  = require("passport-auth0")
bodyParser     = require('body-parser'),
mongoose       = require("mongoose"),
PORT           = process.env.PORT || 4200,
authRouter     = require("./routes"),
quizRouter     = require("./routes/quiz"),
middleware     = require("./middleware"),
connectFlash   = require("connect-flash"),
QuizUser       = require("./models/quizUser");

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
    (accessToken, refreshToken, extraParams, profile, done) => done(null, profile)
);

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => done(null, user));  
passport.deserializeUser((user, done) => done(null, user));

mongoose.connect(process.env.MongoURL, { useNewUrlParser: true })
mongoose.connection.on("error", (error) => console.log(error));
mongoose.connection.on("open", () => console.log("Connected to MongoDB database."));

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    if (req.user) {
        const email = req.user["_json"]["email"];
        res.locals.currentUser = {email};
        QuizUser.findOne({email}).exec((error, foundUser) => {
            if(error)
            {
                req.flash("error", error.message);
            }
            else if (!foundUser)
            {
                const user = new QuizUser({email});
                user.save()
                    .then()
                    .catch((err) => req.flash("error", err.message)); 
            }
            else {
                res.locals.currentUser = foundUser;
            }
        });
    }
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", authRouter);
app.use("/", quizRouter);
app.get("/", (req, res) => res.render("index"));

app.listen(PORT, () => console.log(`Listening on ${PORT}:`));