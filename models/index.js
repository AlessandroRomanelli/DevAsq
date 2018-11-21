const mongoose = require('mongoose');
require('./Pen');
require('./User');

module.exports = {
    Pen: mongoose.model('Pen'),
    User: mongoose.model('User'),
};
