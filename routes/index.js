const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', { title: 'DevAsq++', loggedUser: req.user, user: JSON.stringify(req.user) });
});

module.exports = router;
