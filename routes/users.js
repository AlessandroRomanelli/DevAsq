const express = require('express');
const passport = require('passport');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.send('respond with a resource');
});

router.post('/login', (req, res) => {
    res.redirect('back');
});

router.get('/login/github', passport.authenticate('github2', { scope: ['user:email'] }));

router.get('/login/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
    // Successful authentication, redirect home.
        res.redirect('/');
    });

module.exports = router;
