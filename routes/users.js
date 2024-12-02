const express = require('express');
const router = express.Router();
const passport = require('passport')
const User = require('../models/user')
const Chat = require('../models/chat');
const { requireLogin } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

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

router.post('/signup', upload.single('profilePicture'), async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        if (req.file) {
            user.profilePicture = [{
                url: req.file.path,
                filename: req.file.filename
            }];
        }
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Propelrs!');
            res.redirect('/feed');
        });
    } catch (e) {
        console.error(e);
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
    res.render('users/profile.ejs', { currentUser: req.user });

})

router.post('/profile', requireLogin, upload.single('profilePicture'), async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/profile');
        }
        const profilePicture = {
            url: req.file.path,
            filename: req.file.filename,
        };
        user.profilePicture = [profilePicture];
        await user.save();
        req.flash('success', 'Profile picture updated successfully!');
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong, try again.');
        res.redirect('/profile');
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const userProfile = await User.findById(req.params.id);
        if (!userProfile) {
            req.flash('error', 'User not found.');
            return res.redirect('/feed');
        }

        const currentUser = req.user;
        // Fetch the chat between the logged-in user and the profile user
        const chat = await Chat.findOne({
            participants: { $all: [currentUser._id, userProfile._id] }
        }).populate('messages.sender', 'username');  // Optional: populate sender info

        const chatMessages = chat ? chat.messages : [];

        res.render('users/show', { user: userProfile, currentUser, chatMessages });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong.');
        res.redirect('/feed');
    }
});



module.exports = router