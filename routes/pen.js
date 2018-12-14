const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const PenSchema = mongoose.model('Pen');

const { parseBase64, doJSONRequest } = require('../utils');

router.use('/', (req, res, next) => {
    if (!req.user) return res.status(403).end();
    delete req.user.password;
    next();
});

router.get('/github', (req, res, next) => {
    const { username, githubID, githubAccessToken } = req.user;
    if (!githubID) return res.status(403).end();
    const githubEndpoint = 'https://api.github.com';
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${githubAccessToken}`,
    };

    doJSONRequest('GET', `${githubEndpoint}/repos/${username}/DevAsqPP/contents`, headers, null).then((folders) => {
        let count = 0;
        const storedPens = {};
        function done() {
            count += 1;
            if (count === folders.length * 3) {
                res.json(storedPens);
            }
        }
        folders.forEach((folder) => {
            doJSONRequest('GET', `${githubEndpoint}/repos/${username}/DevAsqPP/contents/${folder.path}`, headers, null).then((files) => {
                storedPens[folder.name] = {};
                files.forEach((file) => {
                    doJSONRequest('GET', `${githubEndpoint}/repos/${username}/DevAsqPP/contents/${file.path}`, headers, null).then((data) => {
                        storedPens[folder.name][file.name] = parseBase64(data.content);
                        done(storedPens);
                    });
                });
            });
        });
    });
});

router.post('/new', (req, res, next) => {
    console.log(req.body);
    const newPen = new PenSchema({
        user: req.user,
        html: req.body.html,
        css: req.body.css,
        js: req.body.js,
        title: req.body.title,
        dateCreated: Date.now(),
    });
    newPen.save((err, result) => {
        if (err) {
            console.log('Error writing to DB');
            console.log(err);
        }
        console.log(result);
    });
    res.status(201).end();
});

module.exports = router;
