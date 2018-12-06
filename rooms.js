const bcrypt = require('bcrypt');
// const mongoose = require('mongoose');
const config = require('./config');

require('./models');

// const Pen = mongoose.model('Pen');

class Map {
    constructor() {
        this.data = {};
    }

    get(idKey) {
        return this.data[idKey];
    }

    put(idKey, idValue) {
        const keys = Object.keys(this.data);
        for (let i = 0; i < keys.length; i += 1) {
            if (idValue === this.data[keys[i]]) {
                delete this.data[keys[i]];
            }
        }
        this.data[idKey] = idValue;
    }

    containsKey(idKey) {
        return Object.keys(this.data).includes(idKey);
    }

    containsValue(idValue) {
        return Object.values(this.data).includes(idValue);
    }
}

const userToSocket = new Map();

const socketToUser = new Map();

const UIDs = [];

function generateID() {
    const id = Math.random().toString(36).substring(2, 16);
    if (UIDs.includes(id)) {
        return generateID();
    }
    UIDs.push(id);
    return id;
}

function Pen(title, userId) {
    this.id = generateID();
    this.html = '';
    this.css = '';
    this.js = '';
    this.title = title;
    this.user = userId;
}

class Room {
    constructor(name, creatorId) {
        this.name = name;
        this.creator = creatorId;
        this.users = {};
        this.users[creatorId] = [
            new Pen('Private', creatorId),
        ];
        this.publicPen = new Pen('Public', creatorId);
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
        const pen = new Pen('Private', userId);
        for (let i = 0; i < users.length; i += 1) {
            if (users[i] === userId) return;
        }
        this.users[userId] = [pen];
    }

    remove(userId) {
        delete this.users[userId];
    }

    getUserPen(userId, penID) {
        if (this.hasUser(userId)) {
            const pens = this.users[userId].slice(0);
            pens.push(this.publicPen);
            for (let i = 0; i < pens.length; i += 1) {
                if (pens[i].id === penID) return pens[i];
            }
            return new Pen('New Pen', userId);
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
    Pen,
    roomStorage,
    UIDs,
    userToSocket,
    socketToUser,
};
