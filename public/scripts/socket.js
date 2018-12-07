let socket;

(function() {
    socket = io();

    socket.on('connect', () => {
        console.log('Main page socket connected');
        socket.emit('homePage.joinRoom');
    });

    socket.on('homepage.updateRoomCounter', (data) => {
        console.log('Updating room browser counters');
        console.log(data);
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected!', 'ok');
    });

    socket.on('disconnect', (reason) => {
        console.log(reason);
        socket.emit('homePage.leaveRoom');
    });
}());
