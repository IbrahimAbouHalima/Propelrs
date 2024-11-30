const express = require('express');
const router = express.Router();
const Feed = require('../models/feed');
const Comment = require('../models/comments');
const { requireLogin } = require('../middleware');

const multer = require('multer');
const path = require('path');


router.post('/:id/comments', requireLogin, async (req, res) => {
    try {
        const feed = await Feed.findById(req.params.id);
        if (!feed) {
            req.flash('error', 'Feed post not found.');
            return res.redirect('/feed');
        }
        const comment = new Comment(req.body.comment); // 'comment' refers to the comment field in the form
        comment.uploadedUser = req.user._id; // Associate the comment with the logged-in user
        feed.comments.push(comment); // Push the comment to the feed's 'comments' array

        await comment.save();
        await feed.save();

        req.flash('success', 'Comment added successfully!');
        res.redirect(`/feed/${feed._id}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not add comment. Please try again.');
        res.redirect('/feed');
    }
});

router.delete('/:id/comments/:commentId', requireLogin, async (req, res) => {

});

module.exports = router;