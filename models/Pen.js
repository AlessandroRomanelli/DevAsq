const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = require('./User').schema;

const PenSchema = new Schema({
    user: { type: UserSchema, required: true },
    html: { type: String, default: '', required: true },
    css: { type: String, default: '', required: true },
    js: { type: String, default: '', required: true },
    title: { type: String, default: '', required: true },
    dateCreated: { type: Date, default: new Date() },
});

mongoose.model('Pens', PenSchema);

module.exports = PenSchema;
