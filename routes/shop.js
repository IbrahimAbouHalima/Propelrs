const express = require('express');
const router = express.Router();
const Shop = require('../models/shop');
const multer = require('multer');
const path = require('path');
const { requireLogin } = require('../middleware');
const { storage } = require('../cloudinary');
const upload = multer({ storage })

router.get('/', async (req, res) => {
    try {
        const category = req.query.category || 'all';

        const shops = await Shop.find({ category: category === 'all' ? { $exists: true } : category })
            .populate('uploadedUser reviews');
        shops.forEach(shop => {
            if (shop.reviews.length > 0) {
                const totalRating = shop.reviews.reduce((sum, review) => sum + review.rating, 0);
                shop.averageRating = (totalRating / shop.reviews.length).toFixed(1);
            } else {
                shop.averageRating = "No ratings yet";
            }
        });
        res.render('shop/shop.ejs', {
            shops,
            selectedCategory: category,
            cart: req.session.cart || []
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not retrieve shops.');
        res.redirect('/');
    }
});

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

router.get('/cart', (req, res) => {
    res.render('shop/cart.ejs', { cart: req.session.cart });
});

router.post('/cart/add', async (req, res) => {
    const { itemId } = req.body;

    try {
        const item = await Shop.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        const cartItem = req.session.cart.find((i) => i.id === itemId);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            req.session.cart.push({
                id: item._id,
                name: item.itemName,
                price: item.price,
                quantity: 1,
                images: item.images,
            });
        }
        res.json(req.session.cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.post('/cart/remove', (req, res) => {
    const { index } = req.body;
    if (req.session.cart && req.session.cart[index]) {
        req.session.cart.splice(index, 1);
        return res.status(200).json({ message: 'Item removed from cart' });
    }
    res.status(404).json({ message: 'Item not found in cart' });
});

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
        res.render('./shop/shopShow.ejs', { shop, cart: req.session.cart || [] });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not retrieve shop item.');
        res.redirect('/shop');
    }
});

router.post('/checkout', (req, res) => {
    const { cartItems, total } = req.body;
    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }
    const newOrder = new Order({
        userId: req.user._id,
        items: cartItems,
        totalAmount: total,
        status: 'Pending',
    });
    newOrder.save()
        .then(order => {
            res.status(200).json({ message: 'Checkout successful', order });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Error processing order' });
        });
});

module.exports = router
