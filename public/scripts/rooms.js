function handleRoomForms() {
    const createRoom = document.getElementById('createRoom');
    const createRoomButton = document.getElementById('createRoomButton');
    if (!createRoom || !createRoomButton) return;

    const createRoomFields = createRoom.querySelectorAll('input');

    const createRoomListener = ((event) => {
        if (event.type === 'keydown') {
            if (event.key !== 'Enter') { return; }
        } else if (event.type === 'submit') {
            event.preventDefault();
        }
        const roomName = createRoom.querySelector('input[name="roomName"]').value;
        const password = createRoom.querySelector('input[name="password"]').value;
        if (!roomName || roomName === '') {
            const err = new Error('No room name specified');
            console.error(err);
            const button = document.getElementById('createRoomButton');
            handleError(err, button);
        }
        doFetchRequest('POST', '/room/create', {
            'Content-Type': 'application/json',
        }, JSON.stringify({
            roomName,
            password,
        }))
            .then((res) => {
                let err;
                if (res.status === 201) {
                    return res.json();
                }
                if (res.status === 400) {
                    err = new Error('A room with the same name already exists!');
                } else if (res.status === 403) {
                    err = new Error('User is not authorised to do this');
                }
                err.data = res;
                throw err;
            })
            .then((room) => {
                if (room.name) window.location.pathname = `/room/${room.name}`;
            })
            .catch((err) => {
                console.error(err);
                const button = document.getElementById('createRoomButton');
                handleError(err, button);
            });
    });

    createRoomButton.addEventListener('click', createRoomListener);
    createRoomFields[0].addEventListener('keydown', createRoomListener);
    createRoomFields[1].addEventListener('keydown', createRoomListener);

    const joinRoom = document.getElementById('joinRoom');
    const joinRoomButton = document.getElementById('joinRoomButton');

    const joinRoomFields = joinRoom.querySelectorAll('input');

    const joinRoomListener = ((event) => {
        if (event.type === 'keydown') {
            if (event.key !== 'Enter') { return; }
        } else if (event.type === 'submit') {
            event.preventDefault();
        }
        const roomName = joinRoom.querySelector('input[name="roomName"]').value;
        const password = joinRoom.querySelector('input[name="password"]').value;
        doFetchRequest('POST', '/room/join', {
            'Content-Type': 'application/json',
        }, JSON.stringify({
            roomName,
            password,
        })).then((res) => {
            if (res.status === 200 && roomName !== '') {
                socket.emit('room.isAllowed', {roomName, userID: user._id});
                return;
            }
            let err;
            if (res.status === 403) {
                err = new Error('User was not authorised to enter room');
            } else if (res.status === 404) {
                err = new Error('Room does not exist');
            } else {
                err = new Error(`Something went wrong: ${res.status}`);
            }
            err.data = res;
            throw err;
        }).catch((err) => {
            console.error(err);
            const button = document.getElementById('joinRoomButton');
            handleError(err, button);
        });
    });

    joinRoomButton.addEventListener('click', joinRoomListener);
    joinRoomFields[0].addEventListener('keydown', joinRoomListener);
    joinRoomFields[1].addEventListener('keydown', joinRoomListener);
}
