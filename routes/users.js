const express = require('express');
const passport = require('passport');

const router = express.Router();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const eventBus = require('../pubsub');

const config = require('../config');
const { storeToken } = require('../utils');


require('../models');

const User = mongoose.model('User');

router.post('/logout', (req, res) => {
    res.clearCookie('remember_me');
    req.logout();
    res.status(200).end();
});

router.post('/login', passport.authenticate('local'), (req, res, next) => {
    if (!req.user) { return res.status(401).end(); }
    storeToken(req.user._id, (err, token) => {
        if (err) { return next(err); }
        res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 1 Week max age
        return next();
    });
}, (req, res) => {
    res.status(200).json(req.user);
});

router.post('/signup', (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username }).then((user) => {
        if (user == null) {
            return bcrypt.hash(password, config.SALT_ROUNDS);
        }
        throw new Error('Username already taken');
    }).then(hashedPassword => User.create({ username, password: hashedPassword })).then((user) => {
        res.status(201).end();
    })
        .catch((err) => {
            console.error(err);
            res.status(403).end();
        });
});

router.get('/login/github', passport.authenticate('github', { scope: ['user', 'repo'] }));

router.get('/login/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

module.exports = router;
