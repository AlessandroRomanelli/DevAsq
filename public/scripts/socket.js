let socket;
let currentSort = 'nameUp';

function sortName() {
    const roomTable = document.getElementById('roomTable');
    let entries = Array.prototype.slice.call(roomTable.childNodes);
    const headers = entries.splice(0, 1);

    entries.sort((first, second) => {
        const firstText = first.firstChild.firstChild.innerText;
        const secondText = second.firstChild.firstChild.innerText;
        if (currentSort === 'nameUp') {
            return (firstText < secondText) ? -1 : 1;
        }
        return (firstText > secondText) ? -1 : 1;
    });

    entries = headers.concat(entries);

    console.log(currentSort);

    let result = '';
    entries.forEach((entry) => {
        result += entry.innerHTML;
    });

    roomTable.innerHTML = result;

    if (currentSort === 'nameUp') {
        currentSort = 'nameDown';
    } else {
        currentSort = 'nameUp';
    }

    addExplorerListener();
}

function sortPopulation() {
    const roomTable = document.getElementById('roomTable');
    let entries = Array.prototype.slice.call(roomTable.childNodes);
    const headers = entries.splice(0, 1);

    entries.sort((first, second) => {
        const firstText = first.firstChild.childNodes[1].innerText;
        const secondText = second.firstChild.childNodes[1].innerText;
        if (currentSort === 'populationUp') {
            return (firstText < secondText) ? -1 : 1;
        }
        return (firstText > secondText) ? -1 : 1;
    });

    entries = headers.concat(entries);

    let result = '';
    entries.forEach((entry) => {
        result += entry.innerHTML;
    });

    console.log(currentSort);
    roomTable.innerHTML = result;

    if (currentSort === 'populationUp') {
        currentSort = 'populationDown';
    } else {
        currentSort = 'populationUp';
    }

    addExplorerListener();
}

function insertInSorted() {
    const previousValue = currentSort;
    if (currentSort === 'nameUp' || currentSort === 'nameDown') {
        sortName();
    } else {
        sortPopulation();
    }
    currentSort = previousValue;
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
        const roomEntry = document.getElementById(`room_${data.roomName}`);

        roomBrowserTitle.classList.remove('hidden');
        roomTable.classList.remove('hidden');

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
                const row = document.createElement('tr');
                roomTable.appendChild(row);
                row.outerHTML = out;
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
}());
