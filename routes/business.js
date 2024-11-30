const express = require('express');
const router = express.Router();
const Business = require('../models/business');
const { requireLogin } = require('../middleware');


router.post('/startBusiness', requireLogin, async (req, res) => {
    if (!req.user || req.user.accountType !== 'business') {
        return res.status(403).send('Only business accounts can create a new business.');
    }

    const { businessName, businessLogo, businessIndustry, businessDescription } = req.body;

    try {
        console.log("Form Data:", req.body);
        const newBusiness = new Business({
            businessName,
            businessLogo,
            businessIndustry,
            businessDescription,
            businessOwner: req.user._id
        });

        await newBusiness.save();
        res.redirect('/suppliers');
        req.flash('success', 'New business created!');
    } catch (error) {
        console.error("Error creating business:", error);
        res.status(500).send("There was an error creating your business.");
    }
});

module.exports = router;