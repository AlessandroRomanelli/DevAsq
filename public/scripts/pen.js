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
        if (app instanceof CreatorApp) {
            app.userConnected(user);
        }
    });

    socket.on('settings.userLeft', (user) => {
        if (app instanceof CreatorApp) {
            app.userDisconnected(user);
        }
    });

    socket.on('creator.updatePens', (data) => {
        const {
            id, pen, rows, difference, positions,
        } = data;
        if (app instanceof CreatorApp) {
            app.updateUsers(id, pen, positions, difference, rows);
        }
    });

    socket.on('creator.switchPen', (data) => {
        const { id, newPen } = data;
        if (app instanceof CreatorApp) {
            app.updateUserCurrentPen(id, newPen);
        }
    });

    socket.on('creator.deletedPen', (data) => {
        const { id, pen } = data;
        if (app instanceof CreatorApp) {
            app.removeUserPen(id, pen);
        }
    });

    socket.on('creator.helpNeeded', (id) => {
        console.log(id);
        if (app instanceof CreatorApp) {
            app.signalHelp(id);
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

    socket.on('pen.resolveHelp', () => {
        console.log('Creator resolved help');
        app.resolveHelp();
    });
}


function handleModals() {
    const modals = document.querySelectorAll('.modal');
    console.log(modals);
    for (let i = 0; i < modals.length; i++) {
        const modal = modals[i];
        modal.addEventListener('click', (event) => {
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
