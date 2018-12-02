const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const PenSchema = mongoose.model('Pen');


router.post('/new', (req, res, next) => {
    console.log(req.body);
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
            console.log('Error writing to DB');
            console.log(err);
        }
        console.log(result);
    });
    res.status(201).end();
});

module.exports = router;
