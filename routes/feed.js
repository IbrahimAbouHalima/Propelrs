const express = require('express');
const router = express.Router();
const Feed = require('../models/feed');
const multer = require('multer');
const path = require('path');
const { requireLogin } = require('../middleware');
const { storage } = require('../cloudinary');
const upload = multer({ storage })


/*
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/feedImages'); // Set the destination where images will be stored
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Set a unique name for the file
    }
});
*/


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
        res.render('feed/feed.ejs', { feeds });
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

module.exports = router