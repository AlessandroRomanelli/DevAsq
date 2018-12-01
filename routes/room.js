const express = require('express');
const rooms = require('../rooms');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('createRoom');
});

function Room(id, userId, name) {
    this.id = id;
    this.name = name;
    this.creator = userId;
    this.users = [userId];
    this.publicPen = null;
    this.checkers = [userId];
}

router.post('/create', (req, res) => {
    console.log(req.user);
    console.log(req.body);
    if (!req.user) return res.status(403).end();
    const roomId = Math.random().toString().slice(2);
    const { roomName } = req.body;
    if (roomId in rooms) return res.status(400).end();
    const { _id } = req.user;
    const room = new Room(roomId, _id, roomName);
    rooms[roomId] = room;
    console.log(rooms);
    return res.status(201).send(JSON.stringify({
        statusCode: res.statusCode,
        roomId,
        roomName,
    }));
});

router.get('/join/:roomid', (req, res) => res.render('pen', { title: 'DevAsq++', loggedUser: req.user }));

module.exports = router;
