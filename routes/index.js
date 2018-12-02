const express = require('express');
const rooms = require('../rooms');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', { title: 'DevAsq++', loggedUser: req.user, activeRooms: rooms });
});

module.exports = router;
