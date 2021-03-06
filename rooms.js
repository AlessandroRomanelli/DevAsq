const bcrypt = require('bcrypt');
// const mongoose = require('mongoose');
const config = require('./config');

require('./models');

// const Pen = mongoose.model('Pen');

class Map {
    constructor() {
        this.userToSocket = {};
        this.socketToUser = {};
    }

    registerUser(userId, socketId) {
        const sockets = Object.keys(this.socketToUser);
        for (let i = 0; i < sockets.length; i++) {
            const socket = sockets[i];
            const user = this.socketToUser[socket];
            if (user === userId) {
                delete this.socketToUser[socket];
            }
        }
        this.userToSocket[userId] = socketId;
        this.socketToUser[socketId] = userId;
        console.log(`Registered ${userId}:${socketId}`);
        console.log(this.userToSocket);
        console.log(this.socketToUser);
    }

    unregisterUser(socketId) {
        const users = Object.keys(this.userToSocket);
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const socket = this.userToSocket[user];
            if (socket === socketId) {
                delete this.userToSocket[user];
            }
        }
        const sockets = Object.keys(this.socketToUser);
        for (let i = 0; i < sockets.length; i++) {
            const socket = sockets[i];
            if (socket === socketId) {
                delete this.socketToUser[socket];
            }
        }
        console.log(`Removed socket: ${socketId}`);
    }

    getSocket(userId) {
        return this.userToSocket[userId];
    }

    getUser(socketId) {
        return this.socketToUser[socketId];
    }
}

const connectionMap = new Map();

const UIDs = [];

function generateID() {
    const id = Math.random().toString(36).substring(2, 16);
    if (UIDs.includes(id)) {
        return generateID();
    }
    UIDs.push(id);
    return id;
}

function Pen(title, userId, penID) {
    this.id = penID || generateID();
    this.html = '';
    this.css = '';
    this.js = '';
    this.title = title;
    this.user = userId;
    this.link = null;
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
    connectionMap,
    generateID,
};
