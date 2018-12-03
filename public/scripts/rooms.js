function handleRoomForms() {
    const createRoom = document.getElementById('createRoom');
    createRoom.addEventListener('submit', (event) => {
        event.preventDefault();
        const roomName = event.target[0].value;
        const password = event.target[1].value;
        doFetchRequest('POST', '/room/create', {
            'Content-Type': 'application/json',
        }, JSON.stringify({
            roomName,
            password,
        })).then((res) => {
            if (res.status === 403) {
                alert('Not logged in');
            } else if (res.status === 400) {
                alert('Room already exists');
            } else {
                return res.json();
            }
        }).then((data) => {
            console.log(data);
            if (data.room.id) window.location.pathname = `/room/${data.room.id}`;
        });
    });
    const joinRoom = document.getElementById('joinRoom');
    joinRoom.addEventListener('submit', (event) => {
        event.preventDefault();
        const roomId = event.target[1].value;
        const password = event.target[3].value;
        doFetchRequest('POST', '/room/join', {
            'Content-Type': 'application/json',
        }, JSON.stringify({
            roomId,
            password,
        })).then((res) => {
            if (res.status === 403) {
                alert('Unauthorised');
            } else if (res.status === 404) {
                alert('Room does not exist');
            } else {
                window.location.pathname = `/room/${roomId}`;
            }
        });
    });
}
