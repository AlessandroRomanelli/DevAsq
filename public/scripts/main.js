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
    handleRoomForms();
    const socket = io();

    socket.on('connect', () => {
        console.log("connected to the server");
    });

    socket.on('event', (data) => {
        socket.emit('event', data);
    })

    socket.on('reconnect', (attemptNumber) => {
        console.log("Socket reconnected!", "ok");
    });

    socket.on('disconnect', (reason) => {
        console.log(reason);
    });

}
