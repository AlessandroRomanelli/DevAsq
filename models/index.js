const mongoose = require('mongoose');
require('./Pen');
require('./User');
require('./Token');

module.exports = {
    Pen: mongoose.model('Pen'),
    User: mongoose.model('User'),
    Token: mongoose.model('Token'),
};
