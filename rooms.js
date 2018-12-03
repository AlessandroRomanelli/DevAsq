const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const config = require('./config');

require('./models');

const Pen = mongoose.model('Pen');

function UserPen(userId) {
    this.id = userId;
    this.pens = [new Pen({
        user: userId,
        title: 'private',
    })];
}


class Room {
    constructor(name, creator) {
        this.name = name;
        this.creator = creator;
        this.users = [new UserPen(creator)];
        this.publicPen = new Pen({
            user: creator,
            title: 'public',
        });
        this.checkers = [];
        this.isPassworded = false;
    }

    lock(password, callback) {
        this.isPassworded = true;
        bcrypt.hash(password, config.SALT_ROUNDS).then((hash) => {
            this.password = hash;
            callback();
        });
    }

    authorize(password, callback) {
        bcrypt.compare(password, this.password).then((validPassword) => {
            callback(validPassword);
        });
    }

    unlockRoom() {
        this.isPassworded = false;
        this.password = '';
    }

    hasUser(userId) {
        for (let i = 0; i < this.users.length; i += 1) {
            if (this.users[i].id === userId) return true;
        }
        return false;
    }

    addPen(userId, pen) {
        this.users.forEach((user) => {
            if (user.id === userId) {
                user.pens.push(pen);
            }
        });
    }

    join(userId) {
        if (this.users.indexOf(userId) === -1) {
            this.users.push(new UserPen(userId));
        }
    }

    leave(userId) {
        const index = this.users.indexOf(userId);
        if (index > 0) this.users.splice(index, 1);
    }
}

const roomStorage = {};

module.exports = {
    Room,
    roomStorage,
};
