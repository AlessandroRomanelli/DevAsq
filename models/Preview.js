const mongoose = require('mongoose');

const Preview = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: String}, // required should be true
    name: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now },
    html: { type: String},
    css: { type: String },
    js: { type: String }
});

exports.Preview = Preview;

mongoose.model('Preview', Preview);

module.exports = { 'Preview': mongoose.model('Preview', Preview)};
