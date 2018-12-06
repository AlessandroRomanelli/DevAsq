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


function init() {
    handleLoginForm();
    handleLogout();
    const app = new App(room, user._id);

    addTogglerListener();
    startParsing(app);

    socket.on('connect', () => {
        socket.emit('settings.bindID', { id: user._id });
        socket.emit('settings.joinRoom', { roomName: app.room.name})
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
}


function addTogglerListener() {
    const roomSettings = document.getElementById("room-settings");
    const toggler = roomSettings.querySelector(".toggler");
    toggler.onclick = ((event) => {
        roomSettings.classList.toggle("hidden");
    });

    toggler.onmouseenter = ((event) => {
        document.body.style.cursor = "pointer";
    });

    toggler.onmouseleave = ((event) => {
        document.body.style.cursor = "default";
    })
}
