const mongoose = require('mongoose');

const { Schema } = mongoose;

const tokenSchema = new Schema({
    uid: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

mongoose.model('Token', tokenSchema);

module.exports = tokenSchema;
