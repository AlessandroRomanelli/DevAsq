function handleRoomForms() {
    const createRoom = document.getElementById('createRoom');
    createRoom.addEventListener('submit', (event) => {
        event.preventDefault();
        const roomName = event.target[1].value;
        const password = event.target[3].value;
        if (!roomName || roomName === '') alert('Invalid room name');
        doFetchRequest('POST', '/room/create', {
            'Content-Type': 'application/json',
        }, JSON.stringify({
            roomName,
            password,
        })).then((res) => {
            if (res.status === 403) {
                alert('Not logged in');
            } else if (res.status === 400) {
                alert('Room name is already taken');
            } else {
                return res.json();
            }
        }).then((room) => {
            console.log(room);
            if (room.name) {
                window.location.pathname = `/room/${room.name}`;
            }
        });
    });
    const joinRoom = document.getElementById('joinRoom');
    joinRoom.addEventListener('submit', (event) => {
        event.preventDefault();
        const roomName = event.target[1].value;
        const password = event.target[3].value;
        doFetchRequest('POST', '/room/join', {
            'Content-Type': 'application/json',
        }, JSON.stringify({
            roomName,
            password,
        })).then((res) => {
            if (res.status === 403) {
                alert('Unauthorised');
            } else if (res.status === 404) {
                alert('Room does not exist');
            } else if (res.status === 200 && roomName !== '') {
                // TODO: get the correct user
                console.log(socket);
                socket.emit('room.join', {roomName, user: JSON.parse(localStorage.user) } );
                window.location.pathname = `/room/${roomName}`;
            } else {
                alert(`Something went wrong: ${res.status}`);
            }
        });
    });
}
