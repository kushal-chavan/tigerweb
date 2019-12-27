const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.get('/about', (req, res) => {
    res.render('pages/about', {
        title:'About us',
    });
});

router.get('/services', (req, res) => {
    res.render('pages/services', {
        title:'Services',
    });
});

router.get('/contact', (req, res) => {
    res.render('pages/contact', {
        title:'Contact us',
    });
});

// Mail Contact
router.post('/contact/send', (req, res) => {
    const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>
       <li>Name: ${req.body.name}</li>
       <li>Company: ${req.body.company}</li>
       <li>Phone No: ${req.body.phone}</li>
       <li>Email: ${req.body.email}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
    `;

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'tigerwebapps@gmail.com', // generated ethereal user
            pass: 'kushal@diano@100' // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Tigerweb Mailer" <tigerwebapps@gmail.com>', // sender address
        to: 'tigerwebco@gmail.com', // list of receivers
        subject: 'Tigerweb | New Contact Request', // Subject line
        text: 'Hello From Tigerweb', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        req.flash('success', 'Contact Request Has Been Sent');
        res.redirect('/pages/contact');
    });
});

// END ROUTE
module.exports = router;