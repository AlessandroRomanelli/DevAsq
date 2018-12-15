const express = require('express');
const {
    Room, Pen, roomStorage, UIDs,
} = require('../rooms');

const router = express.Router();

function generateID() {
    const id = Math.random().toString(36).substring(2, 16);
    if (UIDs.includes(id)) {
        return generateID();
    }
    UIDs.push(id);
    return id;
}

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
    if (room.isPassworded) {
        if (!password) return res.status(403).end();
        room.authorize(password, (validPassword) => {
            if (!validPassword) {
                return res.status(403).end();
            }
            return res.status(201).json(room);
        });
    }
    room.join(req.user._id);
    return res.status(200).json(room);
});

router.use('/:roomName', (req, res, next) => {
    const { roomName } = req.params;
    if (!(roomName in roomStorage)) {
        console.error('No room was found');
        return res.status(404).redirect('/');
    }
    const room = roomStorage[roomName];
    const userId = req.user._id;
    if (!(room.hasUser(userId))) {
        console.error('No user was found for this room');
        return res.status(403).end();
    }
    next();
});

router.get('/:roomName', (req, res) => {
    const { roomName } = req.params;
    const room = roomStorage[roomName];
    return res.render('pen', {
        title: 'DevAsq++', loggedUser: req.user, user: JSON.stringify(req.user), room: JSON.stringify(room),
    });
});

router.post('/:roomName/pen', (req, res) => {
    const { roomName } = req.params;
    const room = roomStorage[roomName];
    const userId = req.user._id;
    const newPen = new Pen('New Pen', generateID(), userId);
    room.users[userId].push(newPen);
    return res.status(201).json(newPen);
});

router.delete('/:roomName/pen/:penId', (req, res) => {
    const { roomName, penId } = req.params;
    const room = roomStorage[roomName];
    const userId = req.user._id;
    const pens = room.users[userId];
    let idx = -1;
    for (let i = 0; i < pens.length; i += 1) {
        if (pens[i].id === penId) {
            idx = i;
            break;
        }
    }
    if (idx === -1) {
        res.status(404).end();
        return;
    }

    const pen = pens.splice(idx, 1);

    if (userId !== room.creator) {
        const creatorPens = room.users[room.creator];
        for (let i = 0; i < creatorPens.length; i++) {
            if (creatorPens[i].link && creatorPens[i].link.penID === penId) {
                creatorPens.splice(i--, 1);
            }
        }
    }

    res.status(204).json(pen);
});

router.put('/:roomName/pen/:penId', (req, res) => {
    const { roomName, penId } = req.params;
    const { name } = req.body;
    const room = roomStorage[roomName];
    const pens = room.users[req.user._id];
    let pen;
    for (let i = 0; i < pens.length; i += 1) {
        if (pens[i].id === penId) {
            pens[i].title = name;
            pen = pens[i];
            break;
        }
    }

    if (!pen) {
        res.status(404).end();
        return;
    }

    const creatorPens = room.users[room.creator];
    for (let i = 0; i < creatorPens.length; i++) {
        if (creatorPens[i].link && creatorPens[i].link.penID === pen.id) {
            creatorPens[i].title = `${req.user.username} - ${name}`;
        }
    }

    res.status(200).json(pen);
});

module.exports = router;
