const express = require('express');
const { Room, roomStorage } = require('../rooms');

const router = express.Router();

function mapToArray(map) {
    let result = [];

    if (Object.keys(map).length > 0) {
        for (key in map) {
            const room = {
                name: map[key].name,
                users: Object.keys(map[key].users).length-1,
                isPassworded: map[key].isPassworded?"true":"false"
            }
            result.push(room);
        }
    }
    return result;
}


/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', { title: 'DevAsq++', loggedUser: req.user, activeRooms: mapToArray(roomStorage) });
});

module.exports = router;
