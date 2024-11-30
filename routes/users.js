const express = require('express');
const router = express.Router();
const passport = require('passport')
const User = require('../models/user')
const { requireLogin } = require('../middleware');


router.get('/login', (req, res) => {
    res.render('users/login.ejs')

})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/feed',
    failureRedirect: '/login',
    failureFlash: true,
}), (req, res) => {
    res.redirect('/feed');  // Redirect to the shop after successful login
});

router.get('/signup', (req, res) => {
    res.render('users/signup.ejs')
})

router.post('/signup', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Propelrs!');
            res.redirect('/feed');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
});

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return (err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/');
    });
})

router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

router.get('/profile', requireLogin, (req, res) => {
    res.render('users/profile.ejs')

})

module.exports = router