const express = require('express');
const bcrypt = require('bcrypt');
const config = require('../config');

const rooms = require('../rooms');

const router = express.Router();

router.use('/', (req, res, next) => {
    if (!req.user) return res.status(403).end();
    next();
});

function Room(roomName, userId) {
    this.name = roomName;
    this.creator = userId;
    this.users = [userId];
    this.publicPen = null;
    this.checkers = [userId];
    this.isPassworded = false;
}

router.post('/create', (req, res) => {
    const { roomName, password } = req.body;
    const { _id } = req.user;
    if (roomName in rooms) return res.status(400).end();
    const room = new Room(roomName, _id);
    if (password) {
        return bcrypt.hash(password, config.SALT_ROUNDS).then((hash) => {
            room.password = hash;
            room.isPassworded = true;
            rooms[roomName] = room;
            console.log(rooms);
            res.status(201).send(JSON.stringify({
                statusCode: res.statusCode,
                room,
            }));
        });
    }
    rooms[roomName] = room;
    console.log(rooms);
    return res.status(201).send(JSON.stringify({
        room,
    }));
});

router.post('/join', (req, res) => {
    console.log(req.body);
    const { roomName, password } = req.body;
    if (!(roomName in rooms)) return res.status(404).end();
    const roomData = rooms[roomName];
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

router.get('/:roomName', (req, res) => {
    if (!(req.params.roomName in rooms)) return res.status(404).end();
    const room = rooms[req.params.roomName];
    if (!(room.users.includes(req.user._id))) return res.status(403).end();
    return res.render('pen', { title: 'DevAsq++', loggedUser: req.user, room });
});

module.exports = router;
