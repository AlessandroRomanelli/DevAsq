(function () {
    console.log(`
 _____      _____                _____    _____    _____
|     \\    |       \\         /  |     |  |        |     |
|      \\   |        |       |   |     |  |        |     |     |        |
|       \\  |___      \\     /    |_____|  |_____   |     |  ___|___  ___|___
|       /  |          |   |     |     |        |  |     |     |        |
|      /   |           \\ /      |     |        |  |   \\ |     |        | 
|_____/    |_____       |       |     |   _____|  |____\\|
                                                        \\
                                                         \\

    `);
    let user;
    String.prototype.splice = function (idx, rem, str) {
        return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
    };

    Array.prototype.first = function () {
        return this[0];
    };

    Array.prototype.last = function () {
        return this[this.length - 1];
    };

    // fetch
    function doFetchRequest(method, url, headers, body) {
        const methods = ['GET', 'POST', 'PUT', 'DELETE'];

        if (arguments.length !== 4) { throw new Error(); }
        if (!(methods.includes(method))) { throw new Error(); }
        if ((method === 'POST' || method === 'PUT') && body !== null && typeof body !== 'string') { throw new Error(); }
        if (method === 'GET' && body !== undefined && body !== null) { throw new Error(); }

        const parameters = { method, headers };
        if (method === 'POST' || method === 'PUT') {
            parameters.body = body;
        }
        return fetch(url, parameters);
    }

    function doJSONRequest(method, url, headers, body) {
        if (arguments.length !== 4) { throw new Error(); }
        if (headers['Content-Type'] && headers['Content-Type'] !== 'application/json') { throw new Error(); }
        if (headers.Accept && headers.Accept !== 'application/json') { throw new Error(); }

        headers.Accept = 'application/json';
        if (method === 'POST' || method === 'PUT') {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(body);
        }

        return doFetchRequest(method, url, headers, body).then(result => result.json());
    }

    // navbar
    if (!localStorage.website_theme) {
        localStorage.website_theme = 'dark';
    }

    const colorsMap = {
        style: {
            light: {
                '--primary-color': '#DE6C2F',
                '--dark-primary-color': '#bc551e',
                '--dark-primary-color2': '#904117',
                '--transparent-primary-color': 'rgba(222, 108, 47, 0.1)',
                '--transparent-primary-color2': 'rgba(222, 108, 47, 0.2)',
                '--transparent-primary-color3': 'rgba(222, 108, 47, 0.5)',
                '--transparent-primary-color4': 'rgba(222, 108, 47, 0.9)',
                '--transparent-primary-color5': 'rgba(222, 108, 47, 0.25)',
                '--transparent-warning': 'rgba(255, 255, 36, 0.8)',
                '--transparent-success': 'rgba(69, 138, 69, 0.8)',
                '--transparent-error': 'rgba(255, 36, 36, 0.8)',
                '--light-primary-color': '#ecaa87',
                '--color-background': '#dddde2',
                '--light-background': 'white',
                '--dark-background': '#dadae0',
                '--dark': '#cfcfd6',
                '--light': '#ebebee',
                '--light2': '#white',
                '--dark-slideron': '#bbc7c1',
                '--dark-slideroff': '#d4bbc1',
                '--text-color': '#4b4b40',
                '--warning': '#ffff57',
                '--success': '#57ab57',
                '--error': '#ff5757',
                '--dark-warning': '#ffff24',
                '--dark-success': '#458a45',
                '--dark-error': '#ff2424',
                '--warning-mix': '#ecec8a',
                '--success-mix': '#7bb67d',
                '--darken-light': '#cfcfd6',
                '--darken-dark': '#c1c1cb',
                '--role-color': '#b4b6ba',
                '--pen-border': 'black',
                '--switch-tab': 'gray',
                '--box-shadow-tab-hover': 'rgba(0, 0, 0, 0.4)',
            },
            dark: {
                '--primary-color': '#DE6C2F',
                '--dark-primary-color': '#bc551e',
                '--dark-primary-color2': '#904117',
                '--transparent-primary-color': 'rgba(222, 108, 47, 0.1)',
                '--transparent-primary-color2': 'rgba(222, 108, 47, 0.2)',
                '--transparent-primary-color3': 'rgba(222, 108, 47, 0.5)',
                '--transparent-primary-color4': 'rgba(222, 108, 47, 0.9)',
                '--transparent-primary-color5': 'rgba(222, 108, 47, 0.25)',
                '--transparent-warning': 'rgba(255, 255, 36, 0.8)',
                '--transparent-success': 'rgba(69, 138, 69, 0.8)',
                '--transparent-error': 'rgba(255, 36, 36, 0.8)',
                '--light-primary-color': '#ecaa87',
                '--color-background': '#1d1f20',
                '--light-background': '#4d5356',
                '--dark-background': '#1b1c1d',
                '--dark': '#111213',
                '--light': '#292c2d',
                '--light2': '#414648',
                '--dark-slideron': '#0f1d11',
                '--dark-slideroff': '#291011',
                '--text-color': 'white',
                '--warning': '#ffff57',
                '--success': '#57ab57',
                '--error': '#ff5757',
                '--dark-warning': '#ffff24',
                '--dark-success': '#458a45',
                '--dark-error': '#ff2424',
                '--warning-mix': '#a0a03c',
                '--success-mix': '#427d42',
                '--darken-light': '#111213',
                '--darken-dark': '#050505',
                '--role-color': '#b4b6ba',
                '--pen-border': 'black',
                '--switch-tab': 'gray',
                '--box-shadow-tab-hover': 'rgba(0, 0, 0, 0.4)',
            },
        },
        aceThemes: {
            dark: 'tomorrow_night',
            light: 'eclipse',
        },
    };

    function applyTheme() {
        const body = document.querySelector('body');
        const theme = localStorage.website_theme;
        Object.keys(colorsMap.style[theme]).forEach((property) => {
            body.style.setProperty(property, colorsMap.style[theme][property]);
        });
        const controls = document.querySelector('.controls');
        if (controls === null) return;
        const aceTheme = colorsMap.aceThemes[theme];
        ace.edit('htmlPen').setTheme(`ace/theme/${aceTheme}`);
        ace.edit('cssPen').setTheme(`ace/theme/${aceTheme}`);
        ace.edit('jsPen').setTheme(`ace/theme/${aceTheme}`);
    }

    function switchTheme(event) {
        const theme = localStorage.website_theme || 'dark';
        if (theme === 'dark') {
            localStorage.website_theme = 'light';
            applyTheme();
        } else {
            localStorage.website_theme = 'dark';
            applyTheme();
        }
    }

    function validateForm(formData) {
        const { formName, submitName } = formData;
        const form = document.getElementById(formName);
        const inputs = form.querySelectorAll('fieldset:not(.submit)');
        const submitButton = document.getElementById(submitName);
        let validForm = true;
        inputs.forEach((input) => {
            const valid = input.getAttribute('valid');
            if (!valid || valid === 'false') {
                validForm = false;
            }
        });
        if (validForm) {
            submitButton.removeAttribute('disabled');
        } else {
            submitButton.setAttribute('disabled', true);
        }
    }

    function updateInputField(isValid, html) {
        if (isValid) {
            html.setAttribute('valid', true);
            html.classList.add('valid');
            html.classList.remove('error');
        } else {
            html.setAttribute('valid', false);
            html.classList.add('error');
            html.classList.remove('valid');
        }
    }

    function handleError(err, html) {
        console.error(err);
        html.classList.add('error', 'shake-horizontal');
        setTimeout((html) => { html.classList.remove('error', 'shake-horizontal'); }, 1000, html);
    }

    function login(username, password) {
        const modal = document.getElementById('login-signup-modal');
        doFetchRequest('POST', '/login', {
            'Content-Type': 'application/json',
        }, JSON.stringify({
            username,
            password,
        })).then((res) => {
            if (res.status === 200) {
                return res.json();
            }
            const err = new Error('Invalid Login');
            err.data = res;
            throw err;
        }).then((userRes) => {
            if (userRes) {
                user = userRes;
                dust.render('partials/loggedUser', { loggedUser: userRes }, (err, output) => {
                    const profileNav = document.querySelector('.profile');
                    profileNav.innerHTML = output;
                    modal.classList.add('hidden');
                    handleLogout();
                });
                dust.render('partials/rooms', { loggedUser: userRes }, (err, output) => {
                    const oldExplorer = document.getElementById('room-browser').innerHTML;
                    const contentDiv = document.getElementById('content');
                    contentDiv.innerHTML = output;
                    document.getElementById('room-browser').innerHTML = oldExplorer;
                    handleRoomForms();
                    addExplorerListener();
                });
            }
        }).catch((err) => {
            console.error(err);
            const loginButton = document.getElementById('localLogin');
            handleError(err, loginButton);
        });
    }

    function addMultiListeners(events, element, fn) {
        events.split(' ').forEach(event => element.addEventListener(event, fn, false));
    }

    function handleSignupForm() {
        const passwordRegex = new RegExp('^(?=.*[A-z])(?=.*[0-9])(?=.{8,})');
        const modal = document.getElementById('login-signup-modal');
        const signupUsername = document.getElementById('signup-name');
        addMultiListeners('blur keyup change click paste', signupUsername, (event) => {
            updateInputField(event.target.value !== '', event.target.parentNode);
            validateForm({ formName: 'signupForm', submitName: 'signup-submit' });
        });
        const signupPassword = document.getElementById('signup-password');
        addMultiListeners('blur keyup change click paste', signupPassword, (event) => {
            updateInputField((passwordRegex.test(event.target.value)), event.target.parentNode);
            validateForm({ formName: 'signupForm', submitName: 'signup-submit' });
        });
        const signupPasswordConfirm = document.getElementById('signup-password-confirm');
        addMultiListeners('blur keyup change click paste', signupPasswordConfirm, (event) => {
            updateInputField(event.target.value === signupPassword.value, event.target.parentNode);
            validateForm({ formName: 'signupForm', submitName: 'signup-submit' });
        });
        const signupForm = document.getElementById('signupForm');
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = signupUsername.value;
            const password = signupPassword.value;
            doFetchRequest('POST', '/signup', {
                'Content-Type': 'application/json',
            }, JSON.stringify({
                username,
                password,
            })).then((res) => {
                if (res.status === 201) {
                    login(username, password);
                } else {
                    const err = new Error('Unable to signup');
                    err.data = res;
                    throw err;
                }
            }).catch((err) => {
                console.error(err);
                const signupButton = document.getElementById('signup-submit');
                handleError(err, signupButton);
            });
        });

        const loginButton = document.getElementById('loginButton');
        loginButton.addEventListener('click', (event) => {
            event.preventDefault();
            dust.render('partials/loginForm', {}, (err, output) => {
                if (signupForm.parentNode) {
                    signupForm.parentNode.innerHTML = output;
                    handleLoginForm();
                }
            });
        });
    }

    function handleLoginForm() {
        const passwordRegex = new RegExp('^(?=.*[A-z])(?=.*[0-9])(?=.{8,})');
        const modal = document.getElementById('login-signup-modal');
        const loginButton = document.getElementById('login');
        if (!loginButton) return;
        loginButton.onclick = (event) => {
            event.preventDefault();
            event.target.classList.toggle('active');
            modal.classList.toggle('hidden');
        };
        const githubLogin = document.getElementById('githubLogin');
        githubLogin.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.pathname = '/login/github';
        });
        const loginUsername = document.getElementById('login-name');
        const loginPassword = document.getElementById('login-password');
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = loginUsername.value;
            const password = loginPassword.value;
            login(username, password);
        });
        const signupButton = document.getElementById('signup');
        signupButton.addEventListener('click', (event) => {
            event.preventDefault();
            dust.render('partials/signupForm', {}, (err, output) => {
                if (loginForm.parentNode) {
                    loginForm.parentNode.innerHTML = output;
                    handleSignupForm();
                }
            });
        });
    }

    function handleLogout() {
        const logout = document.getElementById('logout');
        if (!logout) return;
        logout.addEventListener('click', (event) => {
            event.preventDefault();
            doFetchRequest('POST', '/logout', {}, '').then((res) => {
                if (res.status === 200) {
                    user = null;
                    if (window.location.pathname.split('/').includes('room')) {
                        window.location.pathname = '/';
                        return;
                    }
                    dust.render('partials/loggedUser', {}, (err, output) => {
                        const profileNav = document.querySelector('.profile');
                        profileNav.innerHTML = output;
                        handleLoginForm();
                    });
                    dust.render('partials/about', {}, (err, output) => {
                        const oldExplorer = document.getElementById('room-browser').innerHTML;
                        const contentDiv = document.getElementById('content');
                        contentDiv.innerHTML = output;
                        document.getElementById('room-browser').innerHTML = oldExplorer;
                        document.getElementById('room-browser-title').classList.add('hidden');
                        document.getElementById('roomTable').classList.add('hidden');
                    });
                }
            });
        });
    }

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
        initHiddenVars()
        handleRoomForms();
        handleLoginForm();
        handleLogout();
        addExplorerListener();
        initTheme()
    }

    function initHiddenVars () {
        if (serverUser) user = serverUser || null
        const script = document.getElementById('toBeDeleted')
        script.parentNode.removeChild(script)
        delete serverUser
    }

    function initTheme() {
        const theme = localStorage.website_theme || 'dark';
        applyTheme(theme);
        const themeChanger = document.querySelector('#themeChanger input');
        themeChanger.checked = theme === 'dark';
        themeChanger.addEventListener('input', event => switchTheme());
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
