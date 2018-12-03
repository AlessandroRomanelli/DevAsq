const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const { roomStorage } = require('../rooms');

const Pen = mongoose.model('Pen');

router.get('/:roomName', (req, res) => {
    if (!req.user) return res.statu(403).end();
    const { roomName } = req.params;
    const room = roomStorage[roomName];
    const { html, css, js } = room.publicPen;
    let resHtml = html.split('</head>');
    resHtml[0] += `<style>${css}</style>`;
    resHtml = resHtml.join('</head>');
    resHtml = resHtml.split('</body>');
    resHtml[0] += `<script>${js}</script>`;
    resHtml = resHtml.join('</body>');
    console.log(resHtml);
    res.send(resHtml);
});

router.post('/:roomName', (req, res) => {
    let { roomName } = req.params;
    roomName = decodeURIComponent(roomName);
    if (!(roomName in roomStorage)) return res.status(404).end();
    if (!req.user) return res.status(403).end();
    const room = roomStorage[roomName];
    const {
        name, html, css, js,
    } = req.body;
    const pen = new Pen({
        html,
        css,
        js,
        name,
    });
    room.publicPen = pen;

    res.status(201).json(pen);
});

module.exports = router;
