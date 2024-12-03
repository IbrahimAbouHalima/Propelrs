const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const Business = require('../models/business');

router.get('/', async (req, res) => {
    const jobs = await Job.find({}).populate('company');
    res.render('jobs/jobs.ejs', { jobs, currentUser: req.user });
});

router.get('/addjob', async (req, res) => {
    if (!req.user) return res.redirect('/login');
    const businesses = await Business.find({ businessOwner: req.user._id });
    res.render('jobs/addJob', { businesses });
});

router.post('/addjob', async (req, res) => {
    const { title, department, businessId, date, salaryRange } = req.body;

    const business = await Business.findOne({ _id: businessId, businessOwner: req.user._id });
    if (!business) return res.status(403).send('You are not authorized to add jobs for this business.');

    await Job.create({
        title,
        department,
        company: business._id,
        date,
        salaryRange,
    });

    res.redirect('/jobs');
});

module.exports = router;
