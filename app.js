require('dotenv').config();
const express = require('express'); //the following are the imported technologies required to run the code
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');

const userRoutes = require('./routes/users');
const shopRoutes = require('./routes/shop.js');
const reviewRoutes = require('./routes/reviews.js');
const feedRoutes = require('./routes/feed.js');
const commentRoutes = require('./routes/comments.js');
const startBusiness = require('./routes/business.js');
const jobRoutes = require('./routes/jobs.js');
const issueRoutes = require('./routes/issues.js');

const User = require('./models/user');

const app = express();

app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/images/', express.static('./public/images'));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const dbUrl = process.env.DB_URL;
const secret = process.env.SECRET;

const MongoDBStore = require('connect-mongo');

mongoose.connect(dbUrl)
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
});
store.on('error', function (error) {
    console.error('MongoDBStore error:', error);
});

const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_flash = req.flash('success');
    res.locals.error_flash = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

app.use(passport.initialize()); //passport is used for storing users details and hashing the password
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.defaultUserImg = 'https://res.cloudinary.com/djp8iklzi/image/upload/v1733059211/Propelrs/stmqni1huylwmtrivcks.jpg';
    next();
});

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});


app.use('/', userRoutes);
app.use('/feed', feedRoutes);
app.use('/feed', commentRoutes);
app.use('/shop', shopRoutes);
app.use('/shop', reviewRoutes);
app.use('/jobs', jobRoutes);
app.use('/', startBusiness);
app.use('/issues', issueRoutes);


app.get('/', (req, res) => {
    res.render('home.ejs');
});

app.get('/index', (req, res) => {
    res.render('index.ejs');
});

app.get('/startBusiness', (req, res) => {
    res.render('startBusiness.ejs');
});

app.get('/suppliers', (req, res) => {
    res.render('suppliers.ejs');
});

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


app.get('/about', (req, res) => {
    res.render('about.ejs');
});

app.get('/marketing', (req, res) => {
    res.render('marketing.ejs');
});

app.get('/terms', (req, res) => {
    res.render('terms.ejs');
});

require('./socket')(app);

const port = 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Serving on port ${port}`);
});
