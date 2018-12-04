const express = require('express');
const { Room, roomStorage } = require('../rooms');

const router = express.Router();

function mapToArray(map) {
    let result = [];
    for (key in map) {
        result.push(map[key]);
        if (result[result.length - 1].users) {
            result[result.length - 1].users = Object.keys(map[key].users).length;
        }
    }
    return result;
}


/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', { title: 'DevAsq++', loggedUser: req.user, activeRooms: mapToArray(roomStorage) });
});

module.exports = router;
