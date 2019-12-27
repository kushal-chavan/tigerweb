const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// MODEL
const AdminUser = require('../models/admin_user');
const Domain = require('../models/domain');
const Invoice = require('../models/invoice');

// LOGIN
router.get('/login', (req, res) => {
    if(!req.user){
        res.render('adminpanel/login', {
            title:'Login'
        });
    } else {
        res.redirect('/panel');
    }
    
});

// Login Process
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect:'/control/panel',
        failureRedirect:'/control/login',
        failFlash: true
    })(req, res, next);
});

// REGISTER
router.get('/register', (req, res) => {
    if(!req.user){
        res.render('adminpanel/register', {
            title:'Register'
        })
    } else {
        res.redirect('/users/dashboard');
    }
    ;
});

router.post('/register', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('name', 'Name is Required').notEmpty();
    req.checkBody('phone', 'Phone Number is Required').notEmpty();
    req.checkBody('email', 'Email is Required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is Required').notEmpty();
    req.checkBody('password', 'Password is Required').notEmpty();
    req.checkBody('password2', 'Password do not match').equals(req.body.password);

    let errors = req.validationErrors();

    if(errors){
        res.render('adminpanel/register', {
            errors:errors
        });
    } else {
        let newUser = new AdminUser({
            name: name,
            phone: phone,
            email: email,
            username: username,
            password: password
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err){
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save((err) => {
                    if(err){
                        console.log(err);
                    } else {
                        req.flash('success', 'You are Registered and Can Log in');
                        res.redirect('/control/login');
                    }
                });
            });
        });
    }
});

// CONTROL PANEL
router.get('/panel', ensureAuthenticatedadmin,(req, res) => {
    res.render('adminpanel/index', {
        title:'Control Panel',
    });
});

// Add Domain
router.get('/domain/add', (req, res) => {
    res.render('add_domain', {
        title:'Add Domain'
    });
    
});

// ADD Customers-invoice
router.get('/invoice/add', ensureAuthenticatedadmin, (req, res) => {
    res.render('add_invoice');
});


// Access Control
function ensureAuthenticatedadmin(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'No Such Place');
        res.redirect('/');
    }
}

// END ROUTE
module.exports = router;