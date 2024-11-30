const express = require('express');
const router = express.Router();
const Shop = require('../models/shop');
const multer = require('multer');
const path = require('path');
const { requireLogin } = require('../middleware');
const { storage, cloudinary } = require('../cloudinary');

/*
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/shopImages'); // Set the destination where images will be stored
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Set a unique name for the file
    }
});
*/

const upload = multer({ storage });

router.get('/', async (req, res) => {
    try {
        const { category } = req.query; // Get the category from query parameters
        let filter = {};

        // If a category is specified, filter by category; otherwise, show all
        if (category && category !== 'all') {
            filter = { category }; // Only show items of the selected category
        }

        // Retrieve the items based on the filter (category)
        const shops = await Shop.find(filter).populate('uploadedUser');
        res.render('./shop/shop.ejs', { shops, selectedCategory: category || 'all' });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not retrieve feed items.');
        res.redirect('/'); // Redirect to an appropriate page if there is an error
    }
})

router.post('/', requireLogin, upload.single('images'), async (req, res) => {
    try {
        const { itemName, price, description, tags, category } = req.body;
        const newItem = new Shop({
            itemName,
            uploadedUser: req.user._id,
            price,
            description,
            tags: tags.split(","),
            category,
            images: [{
                url: req.file.path,
                filename: req.file.filename,
            }]
        });
        await newItem.save();
        req.flash('success', 'Item added successfully!');
        res.redirect('/shop');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong, try again.');
        res.redirect('/feed');
    }
});

router.get('/newItem', requireLogin, (req, res) => {
    res.render('./shop/newShopItem.ejs')
})

router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('uploadedUser').populate({
            path: 'reviews',
            populate: {
                path: 'uploadedUser',
                model: 'User'
            }
        });
        if (!shop) {
            req.flash('error', 'Shop item not found.');
            return res.redirect('/shop');
        }
        res.render('./shop/shopShow.ejs', { shop });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not retrieve shop item.');
        res.redirect('/shop');
    }
});


module.exports = router
