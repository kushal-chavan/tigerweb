const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');

const app = express();
const Article = require('./models/article');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Connect to database
mongoose.connect(config.database, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

// On Connect
mongoose.connection.on('connected', () => {
  console.log('Connected to database '+config.database );
});

// If error on connect
mongoose.connection.on('error', (err) => {
    console.log('Database error '+err);
});

// PUG TEMPLATE ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')

// SET PUBLIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
    secret: 'kayboard cat',
    resave: true,
    saveUninitialized: true
    //cookie:{ secure: true }
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: (params, msg, value) => {
        const namespace = params.split('.')
        , root          = namespace.shift()
        , formParam     = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// ROUTES
app.get('/', (req, res) => {
    res.render('index', {
        title:'Tigerweb',
    });
});

// ROUTE FILES
let articles = require('./routes/articles');
let users = require('./routes/users');
let pages = require('./routes/pages');
let admin = require('./routes/admin');
app.use('/blog/articles', articles);
app.use('/users', users);
app.use('/', pages);
app.use('/control', admin);

// START SERVER AT localhost:4000
app.listen(4000, () => {
    console.log('Server started at post 4000');
});