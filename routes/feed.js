const express = require('express');
const router = express.Router();
const Feed = require('../models/feed');
const multer = require('multer');
const path = require('path');
const { requireLogin } = require('../middleware');
const { storage } = require('../cloudinary');
const upload = multer({ storage })


router.get('/', async (req, res) => {
    try {
        const feeds = await Feed.find()
            .populate('uploadedUser')
            .populate({
                path: 'comments',
                populate: {
                    path: 'uploadedUser',
                    model: 'User',
                },
            })
            .sort({ createdAt: -1 });

        res.render('feed/feed.ejs', { feeds, currentUser: req.user });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not retrieve feed items.');
        res.redirect('/');
    }
});

router.post('/', requireLogin, upload.single('images'), async (req, res) => {
    try {
        const { itemName, price, description, tags } = req.body;
        const newFeed = new Feed({
            itemName,
            uploadedUser: req.user._id,
            price,
            description,
            tags: tags ? tags.split(',') : [],
            images: [{
                url: req.file.path,
                filename: req.file.filename,
            }],
        });
        await newFeed.save();
        req.flash('success', 'Post created successfully!');
        res.redirect('/feed');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong, try again.');
        res.redirect('/feed');
    }
});

router.get('/newPost', requireLogin, (req, res) => {
    res.render('feed/newPost.ejs')
})


router.get('/:id', async (req, res) => {
    try {
        const feed = await Feed.findById(req.params.id).populate('uploadedUser').populate({
            path: 'comments',
            populate: {
                path: 'uploadedUser',
                model: 'User'
            }
        });
        if (!feed) {
            req.flash('error', 'Feed item not found.');
            return res.redirect('/feed');
        }
        res.render('feed/show.ejs', { feed });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not retrieve the feed item.');
        res.redirect('/feed');
    }
});

router.get('/:id/edit', requireLogin, async (req, res) => {
    res.render('feed/show.ejs')
})

router.post('/:id/like', requireLogin, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id; // Get the current user ID
        const feed = await Feed.findById(id);

        if (!feed) {
            return res.status(404).json({ error: 'Post not found.' });
        }

        // Check if the user has already liked the post
        const userIndex = feed.likedBy.indexOf(userId);

        if (userIndex === -1) {
            // If not liked, add the user to likedBy and increment likes
            feed.likedBy.push(userId);
            feed.likes += 1;
        } else {
            // If already liked, remove the user from likedBy and decrement likes
            feed.likedBy.splice(userIndex, 1);
            feed.likes -= 1;
        }

        await feed.save();

        res.json({
            success: true,
            likes: feed.likes,
            liked: userIndex === -1 // Whether the post is now liked
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not toggle like status.' });
    }
});

module.exports = router