module.exports.requireLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login'); // Redirect to the login page if not logged in
    }
    next(); // Proceed if the user is authenticated
};