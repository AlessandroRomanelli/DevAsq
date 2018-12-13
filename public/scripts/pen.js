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
    } else {
        app = new App(room, user._id);
    }

    addTogglerListener(app);
    startParsing(app);

    socket.on('connect', () => {
        console.log('Room page socket connected');
        socket.emit('settings.bindID', { id: user._id });

        console.log(app.room);

        socket.emit('settings.joinRoom', {
            roomName: app.room.name,
            // population: Object.keys(app.room.users).length-1,
            // passworded: app.room.isPassworded
        });

        socket.emit('settings.notifyCreator', { roomName: app.room.name, user });
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected!', 'ok');
        socket.emit('settings.bindID', { id: user._id });
    });

    socket.on('disconnect', (reason) => {
        console.log(reason);
        socket.emit('settings.leaveRoom');
    });

    socket.on('pen.update', (data) => {
        console.log(data);
        app.updatePen(data.pen, data.positions, data.difference, data.rows);
    });

    socket.on('pen.updatePreview', (data) => {
        console.log('updating the preview');
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
        console.log(id);
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
        console.log('creator received request to enter', data);
        const { userID } = data;
        if (app instanceof CreatorApp) {
            let response = 'true';
            if (app.users[userID]) {
                response = `${app.users[userID].state !== 'banned'}`;
            }
            console.log('sending request to enter');
            socket.emit('room.accessResponse', {
                userID,
                response,
                roomName: app.room.name,
            });
        }
    });

    socket.on('pen.resolveHelp', (data) => {
        console.log('Creator resolved help');
        app.resolveHelp(data && data.id);
    });

    socket.on('assistant.promotion', (data) => {
        const { users } = data;
        delete users[app.userID];
        console.log(users);
        if (app instanceof App) {
            socket.emit('assistant.beingPromoted', {roomName: app.room.name});
            console.log("You have been promoted!");
            app.receivePromotion(users);
        }
    });

    socket.on('assistant.degradation', () => {
        if (app instanceof App) {
            socket.emit('assistant.beingDegraded', {roomName: app.room.name});
            console.log("You have been degraded!")
        }
    })
}


function handleModals() {
    const modals = document.querySelectorAll('.modal');
    console.log(modals);
    for (let i = 0; i < modals.length; i++) {
        const modal = modals[i];
        modal.addEventListener('click', (event) => {
            console.log(event.target);
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
