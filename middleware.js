const Feed = require('./models/feed');

module.exports.requireLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }
    next();
};

module.exports.checkPostOwnership = async (req, res, next) => {
    try {
        const feed = await Feed.findById(req.params.id);
        if (!feed) {
            req.flash('error', 'Post not found.');
            return res.redirect('/feed');
        }
        console.log(`Checking ownership: ${feed.uploadedUser} vs ${req.user._id}`);
        if (!feed.uploadedUser.equals(req.user._id)) {
            req.flash('error', 'You do not have permission to edit or delete this post.');
            return res.redirect('/feed');
        }
        next();
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong while checking post ownership.');
        res.redirect('/feed');
    }
};

module.exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.accountType === 'admin') {
        return next();
    }
    res.status(403).send('Access denied.');
};
