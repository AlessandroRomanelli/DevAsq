const mongoose = require('mongoose');

const { Schema } = mongoose;

const PenSchema = require('./Pen').schema;

const userSchema = new Schema({
    githubID: { type: String, required: false },
    username: { type: String, required: true },
    password: { type: String, required: true },
    registratedAt: { type: Date, default: new Date() },
    savedPens: { type: [PenSchema], default: [] },
});

mongoose.model('Users', userSchema);

module.exports = userSchema;
