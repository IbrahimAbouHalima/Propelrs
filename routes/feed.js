const express = require('express');
const router = express.Router();
const Feed = require('../models/feed');
const multer = require('multer');
const path = require('path');
const { requireLogin } = require('../middleware');
const { checkPostOwnership } = require('../middleware');
const { storage } = require('../cloudinary');
const upload = multer({ storage })
const cloudinary = require('cloudinary').v2;

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
    try {
        const feed = await Feed.findById(req.params.id);
        if (!feed) {
            req.flash('error', 'Post not found.');
            return res.redirect('/feed');
        }
        if (!feed.uploadedUser.equals(req.user._id)) {
            req.flash('error', 'You do not have permission to edit this post.');
            return res.redirect('/feed');
        }
        res.render('feed/showEdit.ejs', { feed });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not retrieve the post for editing.');
        res.redirect('/feed');
    }
});

router.put('/:id', requireLogin, checkPostOwnership, async (req, res) => {
    try {
        const { itemName, price, description, tags } = req.body;
        const feed = await Feed.findById(req.params.id);
        if (!feed) {
            req.flash('error', 'Post not found.');
            return res.redirect('/feed');
        }
        if (!feed.uploadedUser.equals(req.user._id)) {
            req.flash('error', 'You do not have permission to update this post.');
            return res.redirect('/feed');
        }
        feed.itemName = itemName || feed.itemName;
        feed.price = price || feed.price;
        feed.description = description || feed.description;
        feed.tags = tags ? tags.split(',').map(tag => tag.trim()) : feed.tags;
        await feed.save();
        req.flash('success', 'Post updated successfully.');
        res.redirect(`/feed/${feed._id}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not update the post.');
        res.redirect('/feed');
    }
});

router.post('/:id/like', requireLogin, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const feed = await Feed.findById(id);
        if (!feed) {
            return res.status(404).json({ error: 'Post not found.' });
        }
        const userIndex = feed.likedBy.indexOf(userId);
        if (userIndex === -1) {
            feed.likedBy.push(userId);
            feed.likes += 1;
        } else {
            feed.likedBy.splice(userIndex, 1);
            feed.likes -= 1;
        }
        await feed.save();
        res.json({
            success: true,
            likes: feed.likes,
            liked: userIndex === -1
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not toggle like status.' });
    }
});

router.delete('/:id', requireLogin, checkPostOwnership, async (req, res) => {
    try {
        const feed = await Feed.findById(req.params.id);
        if (!feed) {
            req.flash('error', 'Post not found.');
            return res.redirect('/feed');
        }
        if (!feed.uploadedUser.equals(req.user._id)) {
            req.flash('error', 'You do not have permission to delete this post.');
            return res.redirect('/feed');
        }
        for (let image of feed.images) {
            await cloudinary.uploader.destroy(image.filename);
        }
        await feed.deleteOne({ _id: feed._id });
        req.flash('success', 'Post deleted.');
        res.redirect('/feed');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not delete the post.');
        res.redirect('/feed');
    }
});

module.exports = router