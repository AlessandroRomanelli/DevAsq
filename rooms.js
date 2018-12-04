const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const config = require('./config');

require('./models');

const Pen = mongoose.model('Pen');

class Room {
    constructor(name, creatorId) {
        this.name = name;
        this.creator = creatorId;
        this.users = {};
        this.users[creatorId] = [
            new Pen({
                user: creatorId,
                title: 'private',
            }),
        ];
        this.publicPen = new Pen({
            user: creatorId,
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
        return userId in this.users;
    }

    upsertPen(userId, pen) {
        if (this.hasUser(userId)) {
            this.users[userId] = pen;
        }
    }

    removePen(userId, penName) {
        if (this.hasUser(userId)) {
            const pens = this.users[userId];
            let idx = -1;
            for (let i = 0; i < pens.length; i += 1) {
                if (pens[i].name === penName) {
                    idx = i;
                }
            }
            if (idx !== -1) pens.splice(idx, 1);
        }
    }

    join(userId) {
        const users = Object.keys(this.users);
        const pen = new Pen({
            user: userId,
            title: 'private',
        });
        for (let i = 0; i < users.length; i += 1) {
            if (users[i] === userId) return;
        }
        this.users[userId] = [pen];
    }

    remove(userId) {
        delete this.users[userId];
    }

    getUserPen(userId, title) {
        if (this.hasUser(userId)) {
            const pens = this.users[userId];
            for (let i = 0; i < pens.length; i += 1) {
                if (pens[i].title === title) return pens[i];
            }
            return new Pen({
                user: userId,
                title: 'New Pen',
            });
        }
        throw new Error('Attempting to get pen of a user not in the room');
    }

    get population() {
        return Object.keys(this.users).length;
    }
}

const roomStorage = {};

module.exports = {
    Room,
    roomStorage,
};
