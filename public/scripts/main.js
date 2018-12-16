(function () {
    String.prototype.splice = function (idx, rem, str) {
        return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
    };

    Array.prototype.first = function () {
        return this[0];
    };

    Array.prototype.last = function () {
        return this[this.length - 1];
    };

    // main

    function addExplorerListener() {
        const table = document.getElementById('roomTable');
        if (!table) return;
        const name = document.getElementById('name-sort');
        const population = document.getElementById('pop-sort');

        try {
            if (user) {
                if (table.querySelectorAll('tr').length > 1) {
                    document.getElementById('room-browser-title').classList.remove('hidden');
                    table.classList.remove('hidden');
                }
            }
        } catch (e) {

        }

        name.onclick = sortName;
        population.onclick = sortPopulation;
        const listener = ((event) => {
            if (event.target.tagName === 'INPUT') {
                if (event.key !== 'Enter') { return; }
            } else {
                event.preventDefault();
            }

            const roomName = event.target.parentNode.parentNode.dataset.name;
            const password = event.target.parentNode.parentNode.querySelector('input').value;
            doFetchRequest('POST', '/room/join', {
                'Content-Type': 'application/json',
            }, JSON.stringify({
                roomName,
                password,
            })).then((res) => {
                if (res.status === 200 && roomName !== '') {
                    socket.emit('room.isAllowed', { roomName, userID: user._id });
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
                const button = event.target.parentNode.parentNode.querySelector('a').parentNode;
                handleError(err, button);
            });
        });
        const rows = document.querySelectorAll('#roomTable tr');
        if (rows.length <= 1) { return; }
        for (let i = 1; i < rows.length; i++) {
            const pswInput = rows[i].querySelector('input');
            const link = rows[i].querySelector('a');
            pswInput.addEventListener('keydown', listener);
            link.addEventListener('click', listener);
        }
    }

    function init() {
        handleRoomForms();
        handleLoginForm();
        handleLogout();
        addExplorerListener();
    }


    // socket
    let socket;
    let currentSort = 'nameDown';

    function sortName() {
        const roomTable = document.getElementById('roomTable').childNodes[0];
        if (!roomTable) return;
        let entries = Array.prototype.slice.call(roomTable.childNodes);
        const headers = entries.splice(0, 1);


        entries.sort((first, second) => {
            const firstText = first.firstChild.innerText.toLowerCase();
            const secondText = second.firstChild.innerText.toLowerCase();
            if (currentSort === 'nameUp') {
                return (firstText < secondText) ? -1 : 1;
            }
            return (firstText > secondText) ? -1 : 1;
        });

        entries = headers.concat(entries);


        let result = '<tbody>';
        entries.forEach((entry) => {
            let id = '';
            let dataName = '';
            if (entry.id) {
                id = `id="${entry.id}"`;
            }
            if (entry.dataset && entry.dataset.name) {
                dataName = `data-name="${entry.dataset.name}"`;
            }
            result += `<tr ${id} ${dataName}>${entry.innerHTML}</tr>`;
        });
        result += '</tbody>';

        roomTable.innerHTML = result;
        const pop = document.getElementById('pop-sort');
        const name = document.getElementById('name-sort');
        pop.classList.remove('active');
        pop.classList.remove('inverse');
        name.classList.add('active');

        if (currentSort === 'nameUp') {
            currentSort = 'nameDown';
            name.classList.remove('inverse');
        } else {
            currentSort = 'nameUp';
            name.classList.add('inverse');
        }

        addExplorerListener();
    }

    function sortPopulation() {
        const roomTable = document.getElementById('roomTable').childNodes[0];
        if (!roomTable) return;
        let entries = Array.prototype.slice.call(roomTable.childNodes);
        const headers = entries.splice(0, 1);

        entries.sort((first, second) => {
            const firstText = first.childNodes[1].innerText;
            const secondText = second.childNodes[1].innerText;
            const firstTextName = first.firstChild.innerText.toLowerCase();
            const secondTextName = second.firstChild.innerText.toLowerCase();

            if (firstText === secondText) {
                return (firstTextName < secondTextName) ? -1 : 1;
            }

            if (currentSort === 'populationUp') {
                return (firstText < secondText) ? -1 : 1;
            }

            return (firstText > secondText) ? -1 : 1;
        });

        entries = headers.concat(entries);

        let result = '<tbody>';
        entries.forEach((entry) => {
            let id = '';
            let dataName = '';
            if (entry.id) {
                id = `id="${entry.id}"`;
            }
            if (entry.dataset.name) {
                dataName = `data-name="${entry.dataset.name}"`;
            }
            result += `<tr ${id} ${dataName}>${entry.innerHTML}</tr>`;
        });
        result += '</tbody>';

        roomTable.innerHTML = result;
        const pop = document.getElementById('pop-sort');
        const name = document.getElementById('name-sort');
        name.classList.remove('active');
        name.classList.remove('inverse');
        pop.classList.add('active');

        if (currentSort === 'populationUp') {
            currentSort = 'populationDown';
            pop.classList.remove('inverse');
        } else {
            currentSort = 'populationUp';
            pop.classList.add('inverse');
        }

        addExplorerListener();
    }

    function insertInSorted() {
        switch (currentSort) {
        case 'nameUp':
            currentSort = 'nameDown';
            sortName();
            break;
        case 'nameDown':
            currentSort = 'nameUp';
            sortName();
            break;
        case 'populationUp':
            currentSort = 'populationDown';
            sortPopulation();
            break;
        case 'populationDown':
            currentSort = 'populationUp';
            sortPopulation();
            break;
        default:
            break;
        }
    }

    (function () {
        socket = io();

        socket.on('connect', () => {
            socket.emit('homePage.joinRoom');
        });

        socket.on('homePage.roomDelete', (data) => {
            const roomBrowserTitle = document.getElementById('room-browser-title');
            const roomTable = document.getElementById('roomTable');
            if (!roomTable) return;
            const roomEntry = document.getElementById(`room_${data.roomName}`);
            roomEntry.parentNode.removeChild(roomEntry);
            if (roomTable.childNodes.length === 1) {
                roomBrowserTitle.classList.add('hidden');
                roomTable.classList.add('hidden');
            }
        });

        socket.on('homePage.updateRoomCounter', (data) => {
            const roomBrowserTitle = document.getElementById('room-browser-title');
            const roomTable = document.getElementById('roomTable');
            if (!roomTable) return;
            const roomBody = roomTable.childNodes[0];

            const roomEntry = document.getElementById(`room_${data.roomName}`);

            try {
                if (user) {
                    roomBrowserTitle.classList.remove('hidden');
                    roomTable.classList.remove('hidden');
                }
            } catch (e) {

            }

            if (roomEntry) {
                roomEntry.querySelectorAll('td')[1].innerText = data.population;
                if (currentSort === 'populationUp' || currentSort === 'populationDown') {
                    insertInSorted();
                }
            } else {
                dust.render('partials/room', {
                    name: data.roomName,
                    users: data.population || '0',
                }, (err, out) => {
                    roomBody.innerHTML += out;
                    insertInSorted();
                });
            }
        });

        socket.on('reconnect', (attemptNumber) => {
        });

        socket.on('disconnect', (reason) => {
            socket.emit('homePage.leaveRoom');
        });

        socket.on('room.accessResponse', (data) => {
            const { response, roomName, userID } = data;
            try {
                if (`${user._id}` !== `${userID}`) {
                    return;
                }
            } catch (e) {
                return;
            }
            if (response === 'true') {
                window.location.pathname = `/room/${roomName}`;
            } else {
                handleError({ data: 'You are banned' }, 'joinRoomButton');
            }
        });
    }());


    // rooms
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
                    socket.emit('room.isAllowed', { roomName, userID: user._id });
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
    init();
}());
