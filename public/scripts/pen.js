String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

Array.prototype.first = function () {
    return this[0];
};

Array.prototype.last = function () {
    return this[this.length - 1];
};


function init() {
    handleLoginForm();
    handleLogout();
    const app = new App(room, user._id);


    startParsing(app);

    const socket = io();

    socket.on('connect', () => {
        socket.emit('settings.bindID', { id: user._id });
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected!', 'ok');
    });

    socket.on('disconnect', (reason) => {
        console.log(reason);
    });
}
