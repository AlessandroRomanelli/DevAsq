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
        console.log(document.getElementById('room_' + data.roomName));
        let roomTable = document.getElementById('roomTable');
        console.log('Room table: ', roomTable);
        let roomEntry = document.getElementById('room_' + data.roomName);
        if (roomEntry) {
            roomEntry.querySelectorAll('td')[1].innerText = data.population;
        } else {
            dust.render('partials/room', {
                name: data.roomName,
                users: data.population,
                isPassworded: data.passworded
            }, (err, html) => {
                console.log(err);
                console.log('<tr id="room_{name}" data-name="{name}">' + html + '</tr>');
                roomTable.innerHTML += '<tr id="room_{name}" data-name="{name}">' + html + '</tr>';
            });
        }
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected!', 'ok');
    });

    socket.on('disconnect', (reason) => {
        console.log(reason);
        socket.emit('homePage.leaveRoom');
    });
}());
