const express = require('express');
const bcrypt = require('bcrypt');
const config = require('../config');

const rooms = require('../rooms');

const router = express.Router();

router.use('/', (req, res, next) => {
    if (!req.user) return res.status(403).end();
    next();
});

function Room(id, userId, name, password) {
    this.id = id;
    this.name = name;
    this.creator = userId;
    this.users = [userId];
    this.publicPen = null;
    this.checkers = [userId];
    this.isPassworded = false;
}

router.post('/create', (req, res) => {
    console.log(req.body);
    let roomId = Math.random().toString().slice(2);
    const { roomName, password } = req.body;
    while (roomId in rooms) {
        roomId = Math.random().toString().slice(2);
    }
    const { _id } = req.user;
    const room = new Room(roomId, _id, roomName);
    if (password) {
        return bcrypt.hash(password, config.SALT_ROUNDS).then((hash) => {
            room.password = hash;
            room.isPassworded = true;
            rooms[roomId] = room;
            console.log('Within promise');
            console.log(rooms);
            res.status(201).send(JSON.stringify({
                statusCode: res.statusCode,
                room,
            }));
        });
    }
    rooms[roomId] = room;
    console.log(rooms);
    return res.status(201).send(JSON.stringify({
        statusCode: res.statusCode,
        room,
    }));
});

router.post('/join', (req, res) => {
    const { roomId, password } = req.body;
    if (!(roomId in rooms)) return res.status(404).end();
    const roomData = rooms[roomId];
    if (roomData.isPassworded) {
        if (!password) return res.status(403).end();
        return bcrypt.compare(password, roomData.password).then((validPassword) => {
            if (validPassword) {
                console.log(roomData);
                return res.status(200).end();
            }
            res.status(403).end();
        });
    }
    if (!(req.user._id in roomData.users)) roomData.users.push(req.user._id);
    console.log(roomData);
    return res.status(200).end();
});

router.get('/:roomId', (req, res) => {
    if (!(req.params.roomId in rooms)) return res.status(404).end();
    const room = rooms[req.params.roomId];
    if (!(room.users.includes(req.user._id))) return res.status(403).end();
    return res.render('pen', { title: 'DevAsq++', loggedUser: req.user, room });
});

module.exports = router;
