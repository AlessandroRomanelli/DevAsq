const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const { roomStorage, Pen } = require('../rooms');

router.get('/:roomName', (req, res) => {
    if (!req.user) return res.status(403).end();
    const { penID } = req.query;
    const { roomName } = req.params;
    const room = roomStorage[roomName];
    const pen = room.getUserPen(req.user._id, penID);
    console.log(pen);
    const { html, css, js } = (penID) ? pen : room.publicPen;
    let resHtml = html.split('</head>');
    resHtml[0] += `<style>${css}</style>`;
    resHtml = resHtml.join('</head>');
    resHtml = resHtml.split('</body>');
    resHtml[0] += `<script>${js}</script>`;
    resHtml = resHtml.join('</body>');
    res.send(resHtml);
});

router.post('/:roomName', (req, res) => {
    let { roomName } = req.params;
    roomName = decodeURIComponent(roomName);
    if (!(roomName in roomStorage)) return res.status(404).end();
    if (!req.user) return res.status(403).end();
    const room = roomStorage[roomName];
    const {
        penID, name, html, css, js,
    } = req.body;
    const pens = room.users[req.user._id].slice(0);
    pens.push(room.publicPen);
    let foundPen;
    console.log(pens);
    pens.forEach((pen) => {
        if (pen.id === penID) {
            pen.name = name;
            pen.html = html;
            pen.css = css;
            pen.js = js;
            foundPen = pen;
        }
    });
    console.log(foundPen);
    res.status(201).json(foundPen);
});

module.exports = router;
