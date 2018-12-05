const express = require('express');
const mongoose = require('mongoose');
const esprima = require('esprima');
const escodegen = require('escodegen');


const router = express.Router();

const { roomStorage, Pen } = require('../rooms');

const loops = ["ForStatement", "WhileStatement", "DoWhileStatement"];


function traverseTree(tree, used) {
    function random() {
        const random = Math.random().toString(36).substring(2, 16);
        if (used && used.includes(random)) {
            return random();
        } else {
            used.push(random);
            return random;
        }
    }

    if (!tree) {
        return;
    }
    if (!used) {
        used = [];
    }

    if (tree.body) {
        for (let i = 0; i < tree.body.length; i++) {
            if (loops.includes(tree.body[i].type)) {
                const name = `esprimaCounter${random()}`;
                tree.body.splice(i, 0, esprima.parse(`let ${name} = 0`).body[0]);
                i++;
                console.log("Label", tree.body[i]);
                tree.body[i].body.body.push(esprima.parse(`${name} += 1`).body[0]);
                tree.body[i].body.body.push(esprima.parse(`if (${name} >= 10) {throw new Error('loop')}`).body[0]);
                // console.log(tree.body[i].body.body[1]);
                // console.log(esprima.parse("break"));
                // console.log(esprima.parse("throw new Error('loop')"));
                // tree.body[i].body.body[1].consequent.body.push(esprima.parse(`break`));
                // tree.body[i].body.body.unshift(esprima.parse(`if (${name} >= 10) { break }`))
            }
            traverseTree(tree.body[i], used);
        }
    }

    // const array = tree.body || tree.consequent.body || [];
    // for (let i = 0; i < array.length; i++) {
    //     if (loops.includes(array[i].type)) {
    //         const id = "esprimaCounter" + random();
    //         const declaration = esprima.parseScript(`let ${id} = 0;`);
    //         const breaker = esprima.parseScript(`${id}++; if (${id} >= 32768) return; `);
    //         array.splice(i, 0, declaration);
    //         i++;
    //         array[i].body.splice(0, 0, breaker);
    //     }
    //     traverseTree(array[i], used);
    // }


    // if (loops.includes(tree.type)) {
    //     console.log(tree)
    // } else {
    //     const array = tree.body || tree.consequent.body || [];
    //     for (let i = 0; i < array.length; i++) {
    //         traverseTree(array[i]);
    //     }
    // }
}


router.get('/:roomName', (req, res) => {
    if (!req.user) return res.status(403).end();
    const { penID } = req.query;
    const { roomName } = req.params;
    if (!(roomName in roomStorage)) return res.status(404).end();
    const room = roomStorage[roomName];
    const pen = room.getUserPen(req.user._id, penID);
    const { html, css, js } = (penID) ? pen : room.publicPen;

    const tree = esprima.parseScript(js);
    traverseTree(tree);
    console.log(tree);
    const finalJs = escodegen.generate(tree);

    console.log("FINAL", finalJs);

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
