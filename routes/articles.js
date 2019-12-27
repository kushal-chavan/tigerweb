const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const User = require('../models/user');

// ADD Article
router.get('/add', ensureAuthenticated ,(req, res) => {
    res.render('addarticle', {
        title:'Add New Article',
    });
});

// ADD POST
router.post('/add', (req, res) => {
    req.checkBody('title', 'Title is required').notEmpty();
   // req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // IF ERROR
    let errors = req.validationErrors();

    if(errors){
        res.render('addarticle', {
            errors: errors,
            title : 'Add New Article'
        });
    } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save((err) => {
        if(err){
            console.log(err);
            return;
        } else {
            req.flash('success', 'Post has Added Successfully');
            res.redirect('/blog/articles/view');
        }
    });
    }   
});

router.get('/view', (req, res) => {
    Article.find({}, (err, articles) => {
        if(err){
            console.log(err);
        } else {
            res.render('blog', {
                title:'Tigerweb Open Blog',
                articles: articles
            });
        }
    });
});

router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.author, (err, user) => {
            res.render('article', {
                title: 'Article',
                article: article,
                author: user.name
            });
        });
    });
});

// EDIT ARTICLE GET
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id){
            req.flash('danger', 'Not Authorized');
            res.redirect('/blog/articles/view');
        } else {
            res.render('edit_article', {
                title: 'Edit Article',
                article: article
            });
        }
    });
});

// EDIT ARTICLE POST
router.post('/edit/:id', (req, res) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    let query = {_id:req.params.id}

    Article.update(query, article, (err) => {
        if(err){
            console.log(err);
            return;
        } else {
            res.redirect('/blog/articles/view');
        }
    });
});

// DELETE ARTICLE
router.delete('/:id', (req, res) => {
    if(!req.user._id){
        res.status(500).send();
    }
    let query = {_id:req.params.id}

    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id){
            res.status(500).send();
        } else {
            Article.remove(query, (err) => {
                if(err){
                    console.log('something went worng'+err);
                }
                res.send('Success');
            });
        }
    });

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