const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
    githubID: { type: String, required: false },
    username: { type: String, required: true },
    password: { type: String, required: true },
    registratedAt: { type: Date, default: new Date() },
    savedPens: [{ type: Schema.Types.ObjectId, ref: 'Pen' }],
});

mongoose.model('User', userSchema);

module.exports = userSchema;
