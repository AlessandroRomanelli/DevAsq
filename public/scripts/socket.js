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

    console.log(currentSort);

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

    console.log(currentSort);
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
        console.log('Main page socket connected');
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
        console.log('Updating room browser counters');
        console.log(data);
        const roomBrowserTitle = document.getElementById('room-browser-title');
        const roomTable = document.getElementById('roomTable');
        if (!roomTable) return;
        const roomBody = roomTable.childNodes[0];
        console.log(roomBody);

        const roomEntry = document.getElementById(`room_${data.roomName}`);

        if (user) {
            roomBrowserTitle.classList.remove('hidden');
            roomTable.classList.remove('hidden');
        }

        if (roomEntry) {
            roomEntry.querySelectorAll('td')[1].innerText = data.population;
            if (currentSort === 'populationUp' || currentSort === 'populationDown') {
                insertInSorted();
            }
        } else {
            console.log(roomTable);
            dust.render('partials/room', {
                name: data.roomName,
                users: data.population || '0',
            }, (err, out) => {
                console.log(out);
                roomBody.innerHTML += out;
                insertInSorted();
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

    socket.on('room.accessResponse', (data) => {
        console.log('response received from the server', data);
        const { response, roomName, userID } = data;
        if (`${user._id}` !== `${userID}`) {
            return;
        }
        if (response === 'true') {
            window.location.pathname = `/room/${roomName}`;
        } else {
            handleError({ data: 'You are banned' }, 'joinRoomButton');
        }
    });
}());
