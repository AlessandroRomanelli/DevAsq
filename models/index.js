const mongoose = require('mongoose');
require('./Pen');
require('./User');

module.exports = {
    Pens: mongoose.model('Pens'),
    Users: mongoose.model('Users'),
};
