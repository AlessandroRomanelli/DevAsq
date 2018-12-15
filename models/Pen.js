const mongoose = require('mongoose');

const { Schema } = mongoose;

const PenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    html: { type: String, default: '' },
    css: { type: String, default: '' },
    js: { type: String, default: '' },
    title: { type: String, default: '', required: true },
    dateCreated: { type: Date, default: new Date() },
});

mongoose.model('Pen', PenSchema);

module.exports = PenSchema;
