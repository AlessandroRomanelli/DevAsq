const express = require('express');
const { Room, roomStorage } = require('../rooms');

const router = express.Router();

router.use('/', (req, res, next) => {
    if (!req.user) return res.status(403).end();
    delete req.user.password;
    next();
});

router.post('/create', (req, res) => {
    const { roomName, password } = req.body;
    const { _id } = req.user;
    if (roomName in roomStorage) return res.status(400).end();
    const room = new Room(roomName, _id);
    if (password) {
        room.lock(password, () => {
            console.log(room);
            roomStorage[roomName] = room;
            res.status(201).json(room);
        });
    } else {
        roomStorage[roomName] = room;
        res.status(201).json(room);
    }
});

router.post('/join', (req, res) => {
    const { roomName, password } = req.body;
    if (!(roomName in roomStorage)) return res.status(404).end();
    const room = roomStorage[roomName];
    console.log(room);
    if (room.isPassworded) {
        if (!password) return res.status(403).end();
        room.authorize(password, (validPassword) => {
            if (!validPassword) {
                return res.status(403).end();
            }
            console.log(room);
            return res.status(201).json(room);
        });
    }
    console.log(req.user);
    room.join(req.user._id);
    console.log(room);
    return res.status(200).json(room);
});

router.get('/:roomName', (req, res) => {
    const { roomName } = req.params;
    if (!(roomName in roomStorage)) return res.status(404).end();
    const room = roomStorage[req.params.roomName];
    console.log(room);
    if (!(room.hasUser(req.user._id))) return res.status(403).end();
    return res.render('pen', { title: 'DevAsq++', loggedUser: req.user, room });
});

module.exports = router;
