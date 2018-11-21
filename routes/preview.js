const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

require('../models/Preview');
const Preview = mongoose.model('Preview');

router.get('/', (req, res, next) => {
    Preview.find({}, (err, preview) => {
        if (err){
            console.log('Error reading from the database');
            console.log(err);
        } else {
            console.log(preview);
            res.render('preview', preview[0]);
        }
    });
});

router.put('/', (req, res, next) => {
    const preview = new Preview({
        _id: new mongoose.Types.ObjectId(),
        name: 'test',
        html: req.body.html,
        css: req.body.css,
        js: req.body.js
    });
    preview.save((err, response) => {
        if (err) {
            console.log('Error writing to the database');
            console.log(err);
        } else {
            console.log(response);
            res.status(201).end();
        }
    });
});

module.exports = router;
