const express = require("express"),
router        = express.Router(),
passport      = require("passport"),
querystring   = require("querystring");

require("dotenv").config();

router.get(
    "/login",
    passport.authenticate("auth0", {
        scope: "openid email profile"
    }),
    (req, res) => {
        req.flash("success", "Successfully login!!");
        res.redirect("/");
    }
);

router.get(
    "/callback",
    (req, res, next) => {
    passport.authenticate("auth0", (err, user, info) => {
        if (err) {
            req.flash("error", err.message);
            return next(err);
        }
        if (!user) {
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                req.flash("error", err.message);
                return next(err);
            }
            const returnTo = req.session.returnTo;
            delete req.session.returnTo;
            req.flash("success", "Successfully login!!");
            res.redirect(returnTo || "/");
        });
    })(req, res, next);
});

router.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) {
            req.flash("error", err.message);
            return next(err);
        }
        let returnTo = req.protocol + "://" + req.hostname;
        const port = req.connection.localPort;
    
        if (port !== undefined && port !== 80 && port !== 443) {
            returnTo = process.env.NODE_ENV === "production"
                ? `${returnTo}/`
                : `${returnTo}:${port}/`;
        }
    
        const logoutURL = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
    
        const searchString = querystring.stringify({
            client_id: process.env.AUTH0_CLIENT_ID,
            returnTo: returnTo
        });
        logoutURL.search = searchString;
        
        req.flash("success", "Successfully logout!!");
        res.redirect(logoutURL);
      });
});

module.exports = router;