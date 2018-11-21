const express = require('express');
const passport = require('passport');

const router = express.Router();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config');

require('../models');

const User = mongoose.model('User');

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.send('respond with a resource');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    if (req.user) {
        res.status(200).end();
    } else {
        res.status(401).end();
    }
});

router.post('/signup', (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username }).then((user) => {
        if (!user) {
            return bcrypt.hash(password, config.SALT_ROUNDS);
        }
        throw new Error('Username already taken');
    }).then(hashedPassword => User.create({ username, password: hashedPassword })).then((user) => {
        console.log('Local user created');
        console.log(user);
        res.status(201).end();
    })
        .catch((err) => {
            console.error(err);
            res.status(403).end();
        });
});

router.get('/login/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/login/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

module.exports = router;
