String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

Array.prototype.first = function () {
    return this[0];
};

Array.prototype.last = function () {
    return this[this.length - 1];
};

let app;

let socket;

function init() {
    handleLoginForm();
    handleLogout();
    handleModals();

    socket = io();

    if (room.creator === user._id) {
        app = new CreatorApp(room, user._id);
        window.onbeforeunload = function() {
            return 'If you leave the room will be deleted!';
        };
    } else {
        app = new App(room, user._id);
    }

    addTogglerListener(app);
    startParsing(app);

    socket.on('connect', () => {
        socket.emit('settings.bindID', { id: user._id });


        socket.emit('settings.joinRoom', {
            roomName: app.room.name,
            // population: Object.keys(app.room.users).length-1,
            // passworded: app.room.isPassworded
        });

        socket.emit('settings.notifyCreator', { roomName: app.room.name, user });
    });

    socket.on('reconnect', (attemptNumber) => {
        socket.emit('settings.bindID', { id: user._id });
    });

    socket.on('disconnect', (reason) => {
        socket.emit('settings.leaveRoom');
    });

    socket.on('pen.update', (data) => {
        app.updatePen(data.pen, data.positions, data.difference, data.rows);
    });

    socket.on('pen.updatePreview', (data) => {
        if (app.indexOfPen(data.pen) === app.currentPen) {
            app.changeAcesContent(data.positions, true);
        } else if (app.indexOfPenInLinked(data.pen) === app.currentPen) {
            app.changeAcesContent(data.positions, true);
        } else if (app.indexOfLinkedInPens(data.pen) === app.currentPen) {
            app.changeAcesContent(data.positions, true);
        }
    });

    socket.on('pen.sharedCreated', (penID) => {
        document.getElementById(penID).classList.add('shared');
    });

    socket.on('pen.sharedDeleted', (penID) => {
        document.getElementById(penID).classList.remove('shared');
    });

    socket.on('settings.userJoined', (user) => {
        if (app instanceof CreatorApp || app.role === 'moderator') {
            app.userConnected(user);
        }
    });

    socket.on('settings.userLeft', (user) => {
        if (app instanceof CreatorApp || app.role === 'moderator') {
            app.userDisconnected(user);
        }
    });

    socket.on('creator.updatePens', (data) => {
        const {
            id, pen, rows, difference, positions,
        } = data;
        if (app instanceof CreatorApp || app.role === 'moderator') {
            app.updateUsers(id, pen, positions, difference, rows);
        }
        if (app.role === 'moderator') {
            socket.emit('moderator.updatePensOnServer', {
                id: app.userID,
                pens: app.pens,
                roomName: app.room.name
            })
        }
    });

    socket.on('creator.switchPen', (data) => {
        const { id, newPen } = data;
        if (app instanceof CreatorApp || app.role === 'moderator') {
            app.updateUserCurrentPen(id, newPen);
        }
    });

    socket.on('creator.deletedPen', (data) => {
        const { id, pen } = data;
        if (app instanceof CreatorApp || app.role === 'moderator') {
            app.removeUserPen(id, pen);
        }
    });

    socket.on('creator.helpNeeded', (id) => {
        if (app instanceof CreatorApp || app.role === 'moderator') {
            app.signalHelp(id);
            app.updateRoomSettings();
        }
    });

    socket.on('creator.sendRoomInformation', () => {
        if (app instanceof CreatorApp) {
            socket.emit('homePage.updatePopulation', {
                roomName: app.room.name,
                population: `${Object.values(app.countActive()).length}`,
            });
        }
    });

    socket.on('room.delete', () => {
        window.location.pathname = '/';
    });

    socket.on('room.isAllowed', (data) => {
        const { userID } = data;
        if (app instanceof CreatorApp) {
            let response = 'true';
            if (app.users[userID]) {
                response = `${app.users[userID].state !== 'banned'}`;
            }
            socket.emit('room.accessResponse', {
                userID,
                response,
                roomName: app.room.name,
            });
        }
    });

    socket.on('pen.resolveHelp', (data) => {
        app.resolveHelp(data && data.id);
    });

    socket.on('assistant.promotion', (data) => {
        const { users, assistants } = data;
        // delete users[app.userID];
        for (let i = 0; i < assistants.length; i++) {
            delete users[assistants[i]];
        }
        if (app instanceof App) {
            socket.emit('assistant.beingPromoted', {roomName: app.room.name});
            app.receivePromotion(users);
        }
    });

    socket.on('moderator.removeUser', (data) => {
        const userID = data.userID;
        delete app.users[userID];
        document.getElementById(userID).outerHTML = "";
    });

    socket.on('moderator.addUser', (data) => {
        if (app instanceof CreatorApp || app.role === 'moderator') {
            const { userID, information } = data;
            app.users[userID] = information;
            app.updateUI();
        }
    });

    socket.on('assistant.degradation', () => {
        if (app instanceof App) {
            socket.emit('assistant.beingDegraded', {roomName: app.room.name});
            app.receiveDegradation()
        }
    });

    socket.on('creator.isLinked', (data) => {
        const { pen, userID, ownerID } = data;
        socket.emit('moderator.isLinked', {result: `${app.isLinked(pen)}`, userID, pen, ownerID});
    });

    socket.on('moderator.linkResponse', (data) => {
        const { result, pen, ownerID } = data;
        if (result === 'false') {
            app.loadRemotePen(pen, ownerID);
        }
    });

    socket.on('moderators.linkedPenChanged', (data) => {
        const pen = data.pen;
        app.updateContentLinkedPen(pen);
    });

    socket.on('creator.moderatorEstablishedLink', (data) => {
        const { pen, id } = data;
        if (app instanceof CreatorApp) {
            const userPens = app.users[id].pens;
            for (let i = 0; i < userPens.length; i++) {
                if (`${userPens[i].id}` === `${pen.id}`) {
                    userPens[i].link = pen.link;
                }
            }
        }
    });

    socket.on('preview.error', (error) => {
        const modal = document.getElementById('modal-error');
        const p = modal.querySelector('p');
        p.innerHTML = error;
        modal.classList.remove('hidden');
        setTimeout(() => {
            p.innerHTML = "Error";
            modal.classList.add('hidden');
        }, 1500);
    })
}


function handleModals() {
    const modals = document.querySelectorAll('.modal');
    for (let i = 0; i < modals.length; i++) {
        const modal = modals[i];
        modal.addEventListener('click', (event) => {
            if (!event.target) { return; }
            if (!event.target.classList) { return; }
            if (!event.target.classList.contains('modal')) { return; }
            event.target.classList.add('hidden');
        });
    }
}

function addTogglerListener(app) {
    if (app instanceof CreatorApp) {
        app.addTogglerListener();
    } else {
        const roomSettings = document.getElementById('room-settings');
        roomSettings.parentNode.removeChild(roomSettings);
    }
}
