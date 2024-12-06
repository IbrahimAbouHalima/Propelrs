const express = require('express');
const router = express.Router();
const Issue = require('../models/issue');
const { isAdmin } = require('../middleware');

router.get('/report', (req, res) => {
    if (!req.user) return res.redirect('/login');
    res.render('issues/reportIssue');
});

router.post('/report', async (req, res) => {
    const { title, description } = req.body;

    if (!req.user) return res.redirect('/login');

    try {
        await Issue.create({
            title,
            description,
            reportedBy: req.user._id,
        });
        req.flash('success', 'report has been sent, thank you!');
        res.redirect('/feed')
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to report the issue.');
    }
});

router.get('/', isAdmin, async (req, res) => {
    if (!req.user) return res.redirect('/login');
    const issues = await Issue.find({}).populate('reportedBy', 'username');
    res.render('issues/listedIssues', { issues });
});

module.exports = router;
