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
            // console.log(preview);
            const element = preview[preview.length-1];
            const html = `
            <html>
                <head> <style> ${element.css} </style> </head>
                <body>
                    ${element.html}
                    <script> ${element.js} </script>
                </body>
            </html>
            `;
            res.send(html);
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
            res.status(201).json(response).end();
        }
    });
});

module.exports = router;
