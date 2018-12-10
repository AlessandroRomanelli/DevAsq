let socket;
let currentSort = "nameUp";

function sortName() {
    const roomTable = document.getElementById("roomTable");
    let entries = Array.prototype.slice.call(roomTable.childNodes);
    const headers = entries.splice(0, 1);

    entries.sort((first, second) => {
        const firstText = first.firstChild.firstChild.innerText;
        const secondText = second.firstChild.firstChild.innerText;
        if (currentSort === "nameUp") {
            return (firstText < secondText) ? -1 : 1;
        } else {
            return (firstText > secondText) ? -1 : 1;
        }
    });

    entries = headers.concat(entries);

    console.log(currentSort);

    let result = "";
    entries.forEach((entry) => {
        result += `<tbody>${entry.innerHTML}</tbody>`;
    });

    roomTable.innerHTML = result;

    if (currentSort === "nameUp") {
        currentSort = "nameDown";
    } else {
        currentSort = "nameUp";
    }

    addExplorerListener();
}

function sortPopulation() {
    const roomTable = document.getElementById("roomTable");
    let entries = Array.prototype.slice.call(roomTable.childNodes);
    const headers = entries.splice(0, 1);

    entries.sort((first, second) => {
        const firstText = first.firstChild.childNodes[1].innerText;
        const secondText = second.firstChild.childNodes[1].innerText;
        if (currentSort === "populationUp") {
            return (firstText < secondText) ? -1 : 1;
        } else {
            return (firstText > secondText) ? -1 : 1;
        }
    });

    entries = headers.concat(entries);

    let result = "";
    entries.forEach((entry) => {
        result += `<tbody>${entry.innerHTML}</tbody>`;
    });

    console.log(currentSort);
    roomTable.innerHTML = result;

    if (currentSort === "populationUp") {
        currentSort = "populationDown";
    } else {
        currentSort = "populationUp";
    }

    addExplorerListener();
}

function insertInSorted() {
    const previousValue = currentSort;
    if (currentSort === "nameUp" || currentSort === "nameDown") {
        sortName();
    } else {
        sortPopulation();
    }
    currentSort = previousValue;
}

(function() {
    socket = io();

    socket.on('connect', () => {
        console.log('Main page socket connected');
        socket.emit('homePage.joinRoom');
    });

    socket.on('homePage.roomDelete', (data) => {
        const roomBrowserTitle = document.getElementById('room-browser-title');
        const roomTable = document.getElementById('roomTable');
        const roomEntry = document.getElementById(`room_${data.roomName}`).parentNode;
        roomTable.removeChild(roomEntry);
        if (roomTable.childNodes.length === 1) {
            roomBrowserTitle.classList.add("hidden");
            roomTable.classList.add("hidden");
        }
    });

    socket.on('homePage.updateRoomCounter', (data) => {
        console.log('Updating room browser counters');
        console.log(data);
        const roomBrowserTitle = document.getElementById('room-browser-title');
        const roomTable = document.getElementById('roomTable');
        const roomEntry = document.getElementById(`room_${data.roomName}`);

        roomBrowserTitle.classList.remove("hidden");
        roomTable.classList.remove("hidden");

        if (roomEntry) {
            roomEntry.querySelectorAll('td')[1].innerText = data.population;
            if (currentSort === "populationUp" || currentSort === "populationDown") {
                insertInSorted();
            }
        } else {
            dust.render('partials/room', {
                name: data.roomName,
                users: data.population || "0"
            }, (err, out) => {
                const row = document.createElement("tr");
                roomTable.appendChild(row);
                row.outerHTML = out;
                insertInSorted();
            })
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

// <!--<script>-->
// <!--let links = document.querySelectorAll("#roomTable a");-->
// <!--if (links.length > 0) {-->
// <!--console.log(links);-->
// <!--links.forEach((link) => {-->
// <!--link.addEventListener('click', (event) => {-->
// <!--event.preventDefault();-->
// <!--const roomName = link.parentNode.parentNode.dataset.name;-->
// <!--const password = link.parentNode.parentNode.querySelector("input").value;-->
// <!--doFetchRequest('POST', '/room/join', {-->
// <!--'Content-Type': 'application/json',-->
// <!--}, JSON.stringify({-->
// <!--roomName,-->
// <!--password,-->
// <!--}))-->
// <!--.then((res) => {-->
// <!--console.log(res);-->
// <!--if (res.status === 403) {-->
// <!--alert('Unauthorised');-->
// <!--} else if (res.status === 404) {-->
// <!--alert('Room does not exist');-->
// <!--} else if (res.status === 200 && roomName !== '') {-->
// <!--window.location.pathname = '/room/' + roomName;-->
// <!--} else {-->
// <!--alert('Something went wrong: ' + res.status);-->
// <!--}-->
// <!--});-->
// <!--});-->
// <!--});-->
// <!--}-->
// <!--</script>-->
