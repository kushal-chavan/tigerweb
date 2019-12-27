const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// MODEL
const User = require('../models/user');
const Domain = require('../models/domain');

// REGISTER
router.get('/register', (req, res) => {
    if(!req.user){
        res.render('register', {
            title:'Register'
        })
    } else {
        res.redirect('/dashboard');
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
    req.checkBody('password', 'Password must be of minimum 6 characters').isLength({min: 6});
    req.checkBody('password2', 'Password do not match').equals(req.body.password);
    // // IF ALREADY EXIST IN DATABASE
    // req.checkBody('email', 'Email already exists').custom(email => {
    //     User.findOne({email: email}).exec(function(user,err) {
    //         if (!user) {
    //             return true;
    //         }
    //         else{
    //             return false;
    //         }
    //     })
    // });
    // req.checkBody('username', 'Username already exists').custom(username => {
    //     User.findOne({username: username}).exec(function(user) {
    //         if (!user) {
    //             return true;
    //         }
    //         else{
    //             return false;
    //         }
    //     })
    // });
    // req.checkBody('phone', 'Phone number already exists').custom(phone => {
    //     User.findOne({phone: phone}).exec(function(user) {
    //         if (!user) {
    //             return true;
    //         }
    //         else{
    //             return false;
    //         }
    //     })
    // });

    let errors = req.validationErrors();

    if(errors){
        res.render('register', {
            errors:errors
        });
    } else {
        let newUser = new User({
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
                        res.redirect('/users/login');
                    }
                });
            });
        });
    }
});



// LOGIN
router.get('/login', (req, res) => {
    if(!req.user){
        res.render('login', {
            title:'Login'
        });
    } else {
        res.redirect('/users/dashboard');
    }
    
});

// Login Process
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect:'/users/dashboard',
        failureRedirect:'/users/login',
        failFlash: true
    })(req, res, next);
});

// Forget Password
router.get('/forgot-password', (req, res) => {
    res.render('forgot_password', {
        title:'Forgot Password'
    });
});

// Change Password
router.get('/changepassword', ensureAuthenticated, (req, res) => {
    res.render('changepassword', {
        title:'Change Password'
    });
});

// Reset Password
router.post('/forgot-password', (req, res, next) => {
    async.waterfall([
        (done) => {
        crypto.randomBytes(20, (err, buf) => {
          const token = buf.toString('hex');
          done(err, token);
        });
      },
        (token, done) => {
            User.findOne({ email: req.body.email }, (err, user) => {
            if (!user) {
                req.flash('danger', 'No account with that email address exists.');
                return res.redirect('/users/forgot-password');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save((err) => {
            done(err, token, user);
          });
        });
      },
        (token, user, done) => {
            const smtpTransport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'tigerwebapps@gmail.com',
                pass: 'kushal@diano@100'
          }
        });
        const mailOptions = {
          to: user.email,
          from: '"Tigerweb Account" <tigerwebapps@gmail.com>',
          subject: 'Instructions for changing your Tigerweb Account password',
          text: 'Hello '+ user.name +
            '\n\nWe received a request to reset the password on your Tigerweb account.\n\n' +
            'To reset your password please follow the link below:\n\n' +
            'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
            'This link is valid for one hour\n\n'+
            'If you did not initiate this password reset request, you can ignore this email and your password will remain unchanged.\n\n' +
            'Thanks!\n'+
            'Tigerweb'
        };
        smtpTransport.sendMail(mailOptions, (err) => {
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], (err) => {
        if (err) return next(err);
        res.redirect('/users/forgot-password');
    });

});

// Reset Password
router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
        req.flash('danger', 'Password reset token is invalid or has expired.');
        return res.redirect('/users/forgot-password');
        }
        res.render('reset_password', {
            user: req.user
        });
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
      (done) => {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('danger', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }

          if(req.body.password === req.body.confirm){
                user.setPassword = req.body.password
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
    
                user.save(function(err) {
                    req.logIn(user, function(err) {
                    done(err, user);
                    });
                });
          } else {
              req.flash('danger', 'Password do not match');
              return res.redirect('back');
          }
        });
      },
    (user, done) => {
    const smtpTransport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'tigerwebapps@gmail.com',
            pass: 'kushal@diano@100'
        }
    });

    const mailOptions = {
        to: user.email,
        from: '"Tigerweb Account" <tigerwebapps@gmail.com>',
        subject: 'Your password has been changed',
        text: 'Hello ' + user.username +
        '\n\nThis is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
    };
    smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
    });
    }

], function(err) {
    res.redirect('/users/login');
});

});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});


// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', {
        title:'Dashboard'
    });
});

// Dashboard-Profile
router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', {
        title:'Profile'
    });
});


// Customers-invoice
router.get('/invoice', ensureAuthenticated, (req, res) => {
    res.render('customer/invoice', {
        title:'My Invoice'
    });
});

// ADD Customers-invoice
router.get('/invoice/add', (req, res) => {
    res.render('add_invoice');
});

// DOMAIN ROUTES
// Customers-domain
router.get('/domain', ensureAuthenticated, (req, res) => {
    Domain.find({}, (err, domain) => {
        if(err){
            console.log(err);
        } else {
            res.render('customer/domain', {
                title:'My Domains',
                domain:domain
            });
        }
    });
});


// Customers-service
router.get('/myservices', ensureAuthenticated, (req, res) => {
    res.render('customer/service', {
        title:'My Services'
    });
});



router.post('/domain/add', (req, res) => {
    req.checkBody('domain', 'Domain Name is required').notEmpty();
    req.checkBody('phone', 'Phone Number is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('user_id', 'User id is required').notEmpty();
    req.checkBody('created', 'Created Date is required').notEmpty();
    req.checkBody('expire', 'Expire Date is required').notEmpty();
    req.checkBody('status', 'Status is required').notEmpty();

    // IF ERROR
    let errors = req.validationErrors();

    if(errors){
        res.render('../add_domain', {
            errors: errors,
            title : 'Add Domain'
        });
    } else {
    let domain = new Domain();
    domain.domain = req.body.domain;
    domain.phone = req.body.phone;
    domain.email = req.body.email;
    domain.user_id = req.body.user_id;
    domain.created = req.body.created;
    domain.expire = req.body.expire;
    domain.status = req.body.status;

    domain.save((err) => {
        if(err){
            console.log(err);
            return;
        } else {
            req.flash('success', 'Domain name has Added Successfully');
            res.redirect('/users/domain');
        }
    });
    }   
});

// Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}


// END ROUTE
module.exports = router;