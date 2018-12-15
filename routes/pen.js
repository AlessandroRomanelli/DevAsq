const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const PenSchema = mongoose.model('Pen');
const User = mongoose.model('User');

const { Pen, generateID } = require('../rooms');
const { parseHTML, parseBase64, doJSONRequest } = require('../utils');

const githubEndpoint = 'https://api.github.com';

router.use('/', (req, res, next) => {
    if (!req.user) return res.status(403).json({ status: 403, message: 'Unauthorized' });
    delete req.user.password;
    return next();
});


router.use('/github', (req, res, next) => {
    const { githubID } = req.user;
    if (!githubID) return res.status(403).json({ status: 403, message: 'Unauthorized' });
    return next();
});

router.get('/github', (req, res) => {
    const { username, githubAccessToken } = req.user;
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${githubAccessToken}`,
    };
    console.log(req.user);
    doJSONRequest('GET', `${githubEndpoint}/repos/${username}/DevAsqPP/contents`, headers, null).then((data) => {
        if (data.message) throw new Error(data.message);
        const folders = [];
        data.forEach((folder) => {
            folders.push({ title: folder.name });
        });
        res.status(200).json({
            folders,
        });
    }).catch((err) => {
        console.error(err);
        res.status(404).json({ status: 404 });
    });
});

router.get('/github/:dirName', (req, res) => {
    const { dirName } = req.params;
    const { _id, username, githubAccessToken } = req.user;
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${githubAccessToken}`,
    };
    console.log(req.user);
    console.log(`${githubEndpoint}/repos/${username}/DevAsqPP/contents/${dirName}`);
    doJSONRequest('GET', `${githubEndpoint}/repos/${username}/DevAsqPP/contents/${dirName}`, headers, null).then((response) => {
        if (response.message) throw new Error(response.message);
        const pen = new Pen(dirName, _id);
        let count = 0;
        function done() {
            count += 1;
            if (count === 3) {
                res.status(200).json({ status: 200, pen });
            }
        }
        doJSONRequest('GET', `${githubEndpoint}/repos/${username}/DevAsqPP/contents/${dirName}/app.js`, headers, null).then((data) => {
            pen.js = parseBase64(data.content);
            done();
        });
        doJSONRequest('GET', `${githubEndpoint}/repos/${username}/DevAsqPP/contents/${dirName}/index.html`, headers, null).then((data) => {
            pen.html = parseBase64(data.content);
            done();
        });
        doJSONRequest('GET', `${githubEndpoint}/repos/${username}/DevAsqPP/contents/${dirName}/style.css`, headers, null).then((data) => {
            pen.css = parseBase64(data.content);
            done();
        });
    }).catch((err) => {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Something went wrong' });
    });
});

router.delete('/github/:dirName', (req, res) => {
    const { dirName } = req.params;
    const { username, githubAccessToken } = req.user;
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${githubAccessToken}`,
    };
    doJSONRequest('GET', `${githubEndpoint}/repos/${username}/DevAsqPP/contents/${dirName}`, headers, null).then((response) => {
        if (response.message) throw new Error(response.message);
        console.log(response);
        let count = 0;
        function deleteContents() {
            if (count === response.length) return res.status(200).json({ status: 200 });
            const { name, sha } = response[count];
            return doJSONRequest('DELETE', `${githubEndpoint}/repos/${username}/DevAsqPP/contents/${dirName}/${name}`, headers, {
                message: `Deleting ${name}`,
                sha,
            }).then((data) => {
                console.log(data);
                count += 1;
                deleteContents();
            }).catch((err) => {
                console.error(err);
                res.status(500).json({ status: 500 });
            });
        }

        deleteContents();
    });
    // doJSONRequest('DELETE', `${githubEndpoint}/repos/${username}/DevAsqPP/contents/${dirName}`);
});

router.post('/github', (req, res) => {
    const { roomName, pen } = req.body;
    let penName = pen.title;
    const { githubAccessToken, githubRefreshToken } = req.user;
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${githubAccessToken}`,
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
            let { html, css, js } = pen;
            html = parseHTML(html);
            const htmlContent = Buffer.from(html).toString('base64');
            const cssContent = Buffer.from(css).toString('base64');
            const jsContent = Buffer.from(js).toString('base64');
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
        }).then((data) => {
            if (!data.message) return res.status(201).json({ status: 201 });
            res.status(400).json({ status: 400 });
        })
            .catch((err) => {
                console.error(err);
            });
    });
});

router.post('/new', (req, res) => {
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
        }
    });
    res.status(201).end();
});

router.get('/all', (req, res) => {
    console.log(req.user);
    const { savedPens } = req.user;
    const pens = [];
    function done() {
        if (pens.length === savedPens.length) {
            return res.status(200).json({ status: 200, savedPens: pens });
        }
    }
    savedPens.forEach((penId) => {
        PenSchema.findById(penId, '_id title').then((pen) => {
            console.log(pen);
            pens.push(pen);
            done();
        }).catch((err) => {
            console.error(err);
            res.status(500).json({ status: 500, message: err.message });
        });
    });
    done();
});

router.get('/:penId', (req, res) => {
    const { penId } = req.params;
    PenSchema.findById(penId).then((pen) => {
        pen = JSON.parse(JSON.stringify(pen));
        pen.id = generateID();
        if (pen && pen !== null) return res.status(200).json({ status: 200, pen });
        return res.status(404).json({ status: 404, message: 'Not found' });
    });
});

router.delete('/:penId', (req, res) => {
    const { penId } = req.params;
    PenSchema.findByIdAndDelete(penId).then((pen) => {
        console.log('Pen deleted');
        const { savedPens } = req.user;
        const index = savedPens.indexOf(penId);
        savedPens.splice(index, 1);
        User.findByIdAndUpdate(req.user._id, { savedPens }).then((user) => {
            if (pen !== null) return res.status(200).json({ status: 200 });
            return res.status(404).json({ status: 404, message: 'Not found' });
        });
    });
});

router.post('/save', (req, res) => {
    const { pen, roomName } = req.body;
    if (pen.html === '' && pen.css === '' && pen.js === '') {
        return res.status(400).json({ status: 400, message: 'Invalid pen' });
    }
    const now = new Date();
    let { title, _id } = pen;
    title += `@${roomName}[${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}]`;
    const html = pen.html || '';
    const css = pen.css || '';
    const js = pen.js || '';
    PenSchema.create({
        user: req.user._id, html, css, js, title,
    }).then((dbPen) => {
        console.log(dbPen);
        const { savedPens } = req.user;
        savedPens.push(dbPen._id);
        return User.findByIdAndUpdate(req.user._id, { savedPens }, { new: true }).then((user) => {
            res.status(200).json({ status: 200, savedPens });
        });
    }).catch((err) => {
        console.error(err);
        res.status(500).json({ status: 500, message: err.message });
    });
});

module.exports = router;
