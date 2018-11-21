const express = require('express');
const passport = require('passport');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.send('respond with a resource');
});

router.get('/login', (req, res) => {
    res.send('Should login here');
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

router.get('/login/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/login/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
    // Successful authentication, redirect home.
        res.redirect('/');
    });

module.exports = router;
