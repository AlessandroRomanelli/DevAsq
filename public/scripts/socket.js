let socket;

(function() {
    socket = io();

    socket.on('connect', () => {
        console.log(socket);
        socket.emit('settings.bindID', { user: localStorage.user });
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected!', 'ok');
        socket.emit('settings.bindID', { user: localStorage.user });
    });

    socket.on('disconnect', (reason) => {
        console.log(reason);
    });
}());
