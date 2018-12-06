String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

Array.prototype.first = function () {
    return this[0];
};

Array.prototype.last = function () {
    return this[this.length - 1];
};


let socket;
let app;

function init() {
    handleLoginForm();
    handleLogout();

    socket = io();


    if (room.creator === user._id) {
        app = new CreatorApp(room, user._id);
    } else {
        app = new App(room, user._id);
    }

    addTogglerListener(app);
    startParsing(app);

    socket.on('connect', () => {
        socket.emit('settings.bindID', { id: user._id });
        socket.emit('settings.joinRoom', { roomName: app.room.name });
        socket.emit('settings.notifyCreator', { roomName: app.room.name, user });
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected!', 'ok');
        socket.emit('settings.bindID', { id: user._id });
    });

    socket.on('disconnect', (reason) => {
        console.log(reason);
    });

    socket.on('pen.update', (pen) => {
        console.log(pen);
        app.updatePen(pen);
    });

    socket.on('pen.updatePreview', (pen) => {
        console.log('updating the preview');
        if (app.indexOfPen(pen) === app.currentPen) {
            app.changeAcesContent();
        }
    });

    socket.on('pen.update', (pen) => {
        console.log(pen);
        app.updatePen(pen);
    });

    socket.on('settings.userJoined', (user) => {
        console.log(user);
        if (app instanceof CreatorApp) {
            app.userConnected(user);
        }
    });

    socket.on("creator.updatePens", (data) => {
        const {id, pen} = data;
        if (app instanceof CreatorApp) {
            app.updateUsers(id, pen);
        }
    });

    socket.on("creator.switchPen", (data) => {
        const {id, newPen} = data;
        if (app instanceof CreatorApp) {
            app.updateUserCurrentPen(id, newPen);
        }
    });

    socket.on("creator.deletedPen", (data) => {
        const {id, pen} = data;
        if (app instanceof CreatorApp) {
            app.removeUserPen(id, pen);
        }
    });

    socket.on("creator.helpNeeded", (id) => {
        console.log(id);
        if (app instanceof CreatorApp) {
            app.signalHelp(id);
        }
    });
}


function addTogglerListener(app) {
    if (app instanceof CreatorApp) {
        app.addTogglerListener();
    } else {
        const roomSettings = document.getElementById('room-settings');
        roomSettings.parentNode.removeChild(roomSettings);
    }
}
