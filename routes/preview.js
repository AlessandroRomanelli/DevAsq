const express = require('express');
const mongoose = require('mongoose');
const esprima = require('esprima');
const escodegen = require('escodegen');


const router = express.Router();

const { roomStorage, Pen } = require('../rooms');

const loops = ['ForStatement', 'WhileStatement', 'DoWhileStatement'];

function random(used) {
    const random = Math.random()
        .toString(36)
        .substring(2, 16);
    if (used && used.includes(random)) {
        return random(used);
    }
    used.push(random);
    return random;
}

function traverseTree(tree, used) {
    if (!tree) {
        return;
    }
    used = used || [];

    let array = (tree.expression && tree.expression.arguments) || [];
    array = (tree.consequent && tree.consequent.body) || array;
    array = (tree.body && tree.body.body || tree.body) || array;
    for (let i = 0; i < array.length; i++) {
        if (loops.includes(array[i].type)) {
            const name = `esprimaCounter${random(used)}`;
            array.splice(i++, 0, esprima.parse(`let ${name} = 0`).body[0]);
            const body = array[i].body.body;
            const incrementer = `${name} += 1`;
            const loopBreaker = `if (${name} >= 4096) {throw new Error('Infinite loop detected')}`;
            body.unshift(esprima.parse(incrementer).body[0]);
            body.unshift(esprima.parse(loopBreaker).body[0]);
        }
        traverseTree(array[i], used);
    }
}


router.get('/:roomName', (req, res) => {
    if (!req.user) return res.status(403).end();
    const { userID, penID } = req.query;
    const { roomName } = req.params;
    if (!(roomName in roomStorage)) return res.status(404).end();
    const room = roomStorage[roomName];
    // if (userID && (`${req.user._id}` !== `${room.creator}` && `${req.user._id}` !== `${userID}`)) return res.status(403).end();
    const user = userID || req.user._id;
    const pen = room.getUserPen(user, penID);
    const { html, css, js } = (penID) ? pen : room.publicPen;

    const tree = esprima.parseScript(js);
    traverseTree(tree);
    const finalJs = escodegen.generate(tree);

    let resHtml = html.split('</head>');
    resHtml[0] += `<style>${css}</style>`;
    resHtml = resHtml.join('</head>');
    resHtml = resHtml.split('</body>');
    resHtml[0] += `<script>${finalJs}</script>`;
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
