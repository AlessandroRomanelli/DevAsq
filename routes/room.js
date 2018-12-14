const express = require('express');
const { parseHTML, doJSONRequest } = require('../utils');
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

router.use('/:roomName', (req, res, next) => {
    const { roomName } = req.params;
    if (!(roomName in roomStorage)) {
        console.error('No room was found');
        return res.status(404).end();
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

router.post('/:roomName/pen/:penId/github', (req, res) => {
    const { roomName, penId } = req.params;
    const room = roomStorage[roomName];
    const pen = room.getUserPen(req.user._id, penId);
    let penName = pen.title;
    const { githubID, githubAccessToken, githubRefreshToken } = req.user;
    if (!githubID) return res.status(403).end();
    const githubEndpoint = 'https://api.github.com';
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${githubAccessToken}`,
    };
    const repositoryName = 'DevAsqPP';
    let repoName;
    doJSONRequest('GET', `${githubEndpoint}/user/repos`, headers, null).then((repos) => {
        let repository;
        for (let i = 0; i < repos.length; i++) {
            const repo = repos[i];
            if (repo.name === repositoryName) {
                repository = repo;
                break;
            }
        }
        if (!repository) {
            const body = {
                name: repositoryName,
            };
            return doJSONRequest('POST', `${githubEndpoint}/user/repos`, headers, body).then(repo => repo);
        }
        return repository;
    }).then((repo) => {
        repoName = repo.full_name;
        const now = new Date();
        penName += `@${roomName}[${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}]`;
        return doJSONRequest('GET', `${githubEndpoint}/repos/${repoName}/contents/${penName}`, headers, null).then((data) => {
            if (data.message === 'Not Found' || data.message === 'This repository is empty.') { return []; }
            return data;
        }).then((contents) => {
            let { html } = pen;
            html = parseHTML(html);
            const htmlContent = Buffer.from(html).toString('base64');
            const cssContent = Buffer.from(pen.css).toString('base64');
            const jsContent = Buffer.from(pen.js).toString('base64');
            const fileNames = ['app.js', 'index.html', 'style.css'];
            const fileContents = [jsContent, htmlContent, cssContent];

            const publishFiles = (name, content, sha) => {
                if (!sha) {
                    return doJSONRequest('PUT', `${githubEndpoint}/repos/${repoName}/contents/${penName}/${name}`, headers, {
                        message: `${name} commit`,
                        content,
                    });
                }
                return doJSONRequest('PUT', `${githubEndpoint}/repos/${repoName}/contents/${penName}/${name}`, headers, {
                    message: `${name} commit`,
                    content,
                    sha,
                });
            };

            if (contents.length > 0) {
                return publishFiles(contents[0].name, fileContents[0], contents[0].sha)
                    .then(() => publishFiles(contents[1].name, fileContents[1], contents[1].sha))
                    .then(() => publishFiles(contents[2].name, fileContents[2], contents[2].sha));
            }
            return publishFiles(fileNames[0], fileContents[0])
                .then(() => publishFiles(fileNames[1], fileContents[1]))
                .then(() => publishFiles(fileNames[2], fileContents[2]));
        }).catch((err) => {
            console.error(err);
        });
    });
    res.status(200).json({ status: 200 });
});

module.exports = router;
