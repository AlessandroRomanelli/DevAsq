const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const PenSchema = mongoose.model('Pen');


router.post('/new', (req, res, next) => {
    const newPen = new PenSchema({
        user: req.user,
        html: req.body.html,
        css: req.body.css,
        js: req.body.js,
        title: req.body.title,
        dateCreated: Date.now()
    });
    newPen.save((err, result) => {
        if (err) {
        }
    });
    res.status(201).end();
});

module.exports = router;
