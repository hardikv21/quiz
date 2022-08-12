var express = require('express'),
router      = express.Router({mergeParams: true}),
User        = require('../models/user'),
passport    = require('passport');

router.get('/signup', (req, res) => res.render('signup'));

router.post('/signup', (req, res) => 
{
    const username = new User({username: req.body.username});
    const password = req.body.password;
    User.register(username, password, (err) =>
    {
        if (err)
        {
            console.log(err);
            res.redirect('back');
        }
        passport.authenticate('local')(req, res, () => res.redirect('/'));
    });
});

router.get('/login', (req, res) => res.render('login'));

router.post('/login', passport.authenticate('local', 
{
    successRedirect: '/',
    failureRedirect: '/user/login'
}), (req, res) => {});

router.get('/logout', function(req, res) 
{
    req.logout();
    res.redirect('/');
});

module.exports = router;