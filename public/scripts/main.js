String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

Array.prototype.first = function () {
    return this[0];
};

Array.prototype.last = function () {
    return this[this.length - 1];
};

function init() {
    handleRoomForms();
    handleLoginForm();
    handleLogout();

    addExplorerListener();
}

function addExplorerListener() {
    const row = document.getElementById('roomTable').querySelector('tr');
    // const name = row.querySelector('th');
    // const population = row.querySelectorAll('th')[1];
    const name = document.getElementById('name-sort');
    const population = document.getElementById('pop-sort');

    // name.ondblclick = sortName;
    // population.ondblclick = sortPopulation;
    name.onclick = sortName;
    population.onclick = sortPopulation;


    const links = document.querySelectorAll('#roomTable a');
    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const roomName = link.parentNode.parentNode.dataset.name;
            const password = link.parentNode.parentNode.querySelector('input').value;
            doFetchRequest('POST', '/room/join', {
                'Content-Type': 'application/json',
            }, JSON.stringify({
                roomName,
                password,
            }))
                .then((res) => {
                    if (res.status === 200 && roomName !== '') {
                        window.location.pathname = `/room/${roomName}`;
                    } else {
                        let err;
                        if (res.status === 403) {
                            err = new Error('Unauthorised');
                        } else if (res.status === 404) {
                            err = new Error('Room does not exist');
                        } else {
                            err = new Error('Something went wrong');
                        }
                        err.data = res;
                        throw err;
                    }
                }).catch((err) => {
                    console.error(err);
                    // TODO: Implement error handling
                    handleError();
                });
        });
    });
}
