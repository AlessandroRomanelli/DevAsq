String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

Array.prototype.first = function () {
    return this[0];
};

Array.prototype.last = function () {
    return this[this.length - 1];
};

function addExplorerListener() {
    const table = document.getElementById('roomTable');
    if (!table) return;
    const name = document.getElementById('name-sort');
    const population = document.getElementById('pop-sort');

    name.onclick = sortName;
    population.onclick = sortPopulation;

    const listener = ((event) => {
        if (event.type === 'keydown') {
            if (event.key !== 'Enter') { return; }
        } else if (event.type === 'submit') {
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
            const button = link.parentNode;
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
