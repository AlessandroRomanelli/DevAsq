const express = require('express');
const rooms = require('../rooms');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('createRoom');
});

function Room(id, userId) {
    this.id = id;
    this.userId = userId;
}

router.post('/create', (req, res) => {
    console.log(req.user);
    console.log(req.body);
    if (!req.user) return res.status(403).end();
    const { roomId } = req.body;
    const { _id } = req.user;
    const room = new Room(roomId, _id);
    rooms[roomId] = room;
    console.log(rooms);
    return res.status(201).end();
});

router.get('/join/:roomid', (req, res) => {
    const roomId = req.params.roomid;
    if (req.params.roomid in rooms) {
        res.status(400).end();
    }
    if (req.accepts('application/json')) {
        res.json(roomId);
    }
    res.end();
});

module.exports = router;
