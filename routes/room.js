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
    room.join(req.user._id);
    return res.status(200).json(room);
});

router.get('/:roomName', (req, res) => {
    const { roomName } = req.params;
    // if (!(roomName in roomStorage)) return res.status(404).end();
    if (!(roomName in roomStorage)) {
        return res.render('index', {
            title: 'DevAsq++',
            loggedUser: req.user,
            user: JSON.stringify(req.user)
        });
    }
    const room = roomStorage[req.params.roomName];
    if (!(room.hasUser(req.user._id))) return res.status(403).end();
    return res.render('pen', {
        title: 'DevAsq++', loggedUser: req.user, user: JSON.stringify(req.user), room: JSON.stringify(room),
    });
});

router.post('/:roomName/pen', (req, res) => {
    const { roomName } = req.params;
    if (!(roomName in roomStorage)) return res.status(404).end();
    const room = roomStorage[roomName];
    if (!((req.user._id) in room.users)) return res.status(404).end();
    const newPen = new Pen('New Pen', generateID(), req.user._id);
    room.users[req.user._id].push(newPen);
    return res.status(201).json(newPen);
});

router.delete('/:roomName/pen/:penId', (req, res) => {
    const { roomName, penId } = req.params;
    if (!(roomName in roomStorage)) return res.status(404).end();
    const room = roomStorage[roomName];
    if (!(req.user._id in room.users)) return res.status(404).end();
    const pens = room.users[req.user._id];
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

    if (req.user._id !== room.creator) {
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
    if (!(roomName in roomStorage)) return res.status(404).end();
    const room = roomStorage[roomName];
    if (!(req.user._id in room.users)) return res.status(404).end();
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
