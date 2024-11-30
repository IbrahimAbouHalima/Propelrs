require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const { requireLogin } = require('./middleware.js'); //delete later


const userRoutes = require('./routes/users');
const shopRoutes = require('./routes/shop.js');
const reviewRoutes = require('./routes/reviews.js')
const feedRoutes = require('./routes/feed.js');
const commentRoutes = require('./routes/comments.js');
const startBusiness = require('./routes/business.js')

const User = require('./models/user')

const app = express();
app.engine('ejs', ejsMate)

app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))
app.use('/public/images/', express.static('./public/images'));
app.use('/public/feedImages', express.static('./public/feedImages'));
app.use('/public/shopImages', express.static('./public/shopImages'));

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const dbUrl = process.env.DB_URL;
const secret = process.env.SECRET

const MongoDBStore = require('connect-mongo');

mongoose.connect(dbUrl,)
    .then(() => {
        console.log("Database connected");
    })
    .catch(err => {
        console.error("Database connection error:", err);
    });

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})
store.on('error', function (error) {
    console.error('MongoDBStore error:', error);
});


const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,  // Helps prevent cross-site scripting (XSS)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};


app.use(session(sessionConfig));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_flash = req.flash('success'); // For success messages
    res.locals.error_flash = req.flash('error'); // For error messages
    res.locals.currentUser = req.user; // To access current user
    next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;  // req.user is set by Passport when a user is logged in
    next();
});

// Configure Passport to use the LocalStrategy for User authentication
passport.use(new LocalStrategy(User.authenticate()));

// Passport serialization and deserialization (necessary for session support)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Define storage for the images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (req.url.startsWith('/feed')) {
            cb(null, './public/feedImages'); // Destination for feed images
        } else if (req.url.startsWith('/shop')) {
            cb(null, './public/shopImages'); // Destination for shop images
        } else {
            cb(new Error('Invalid route'), './public/defaultImages'); // Handle invalid routes
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Filename format
    }
});

const upload = multer({ storage: storage });

app.use('/', userRoutes);
app.use('/feed', feedRoutes);
app.use('/feed', commentRoutes);
app.use('/shop', shopRoutes);
app.use('/shop', reviewRoutes);
app.use('/', startBusiness);

app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.get('/index', (req, res) => {
    res.render('index.ejs')
})

app.get('/startBusiness', (req, res) => {
    res.render('startBusiness.ejs')
})

app.get('/suppliers', (req, res) => {
    res.render('suppliers.ejs')
})

app.post('/upgrade-account', async (req, res) => {
    try {
        if (req.user.accountType === 'business') {
            return res.status(400).send("Your account is already a business account.");
        }

        await User.findByIdAndUpdate(req.user._id, { accountType: 'business' });
        req.flash('success', 'Your account has been switched to a business account');
        res.redirect('/startBusiness');
    } catch (error) {
        console.error("Error updating account type:", error);
        res.status(500).send("Error updating account type.");
    }
});

app.get('/jobs', (req, res) => {
    res.render('jobs.ejs')
})

app.get('/about', (req, res) => {
    res.render('about.ejs')
})


app.get('/marketing', (req, res) => {
    res.render('marketing.ejs')
})

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Serving on port ${port}`);
});