const express = require('express');
const router = express.Router();
const Shop = require('../models/shop');
const Review = require('../models/reviews');
const { requireLogin } = require('../middleware');

const multer = require('multer');
const path = require('path');


router.post('/:id/reviews', requireLogin, async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            console.log("Shop not found, redirecting...");
            req.flash('error', 'Shop item not found.');
            return res.redirect('/shop');
        }
        const review = new Review(req.body.review);
        review.uploadedUser = req.user._id;
        shop.reviews.push(review);

        await review.save();
        await shop.save();

        req.flash('success', 'Review added successfully!');
        res.redirect(`/shop/${shop._id}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not add review. Please try again.');
        res.redirect(`/shop/${req.params.id}`); // Redirect back to the shop page
    }
});

router.delete('/:id/reviews/:reviewId', requireLogin, async (req, res) => {
    try {
        const { id, reviewId } = req.params;
        const shop = await Shop.findById(id);
        if (!shop) {
            req.flash('error', 'Shop item not found.');
            return res.redirect('/shop');
        }

        shop.reviews = shop.reviews.filter(review => review._id.toString() !== reviewId);
        await shop.save();

        await Review.findByIdAndDelete(reviewId);

        req.flash('success', 'Review deleted successfully!');
        res.redirect(`/shop/${id}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not delete review. Please try again.');
        res.redirect('/shop');
    }
});

module.exports = router;