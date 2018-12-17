(function () {
    let user;
    let room;
    String.prototype.splice = function (idx, rem, str) {
        return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
    };

    Array.prototype.first = function () {
        return this[0];
    };

    Array.prototype.last = function () {
        return this[this.length - 1];
    };

    let app;
    let socket;
    let dragging = false;

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

    function initHiddenVars() {
        if (serverUser) user = serverUser || null;
        if (serverRoom) room = serverRoom || null;
        const script = document.getElementById('toBeDeleted');
        script.parentNode.removeChild(script);
        delete serverUser
        delete serverRoom
    }

    function init() {
        initHiddenVars();
        document.querySelector('body').style.position = 'fixed';
        handleLoginForm();
        handleLogout();
        handleModals();
        handleDragBar();

        socket = io();

        if (room.creator === user._id) {
            app = new CreatorApp(room, user._id);
            window.onbeforeunload = function () {
                return 'If you leave the room will be deleted!';
            };
        } else {
            app = new App(room, user._id);
        }

        addTogglerListener(app);
        startParsing(app);

        socket.on('connect', () => {
            socket.emit('settings.bindID', { id: user._id });


            socket.emit('settings.joinRoom', {
                roomName: app.room.name,
            // population: Object.keys(app.room.users).length-1,
            // passworded: app.room.isPassworded
            });

            socket.emit('settings.notifyCreator', { roomName: app.room.name, user });
        });

        socket.on('reconnect', (attemptNumber) => {
            socket.emit('settings.bindID', { id: user._id });
        });

        socket.on('disconnect', (reason) => {
            socket.emit('settings.leaveRoom');
        });

        socket.on('pen.update', (data) => {
            app.updatePen(data.pen, data.positions, data.difference, data.rows);
        });

        socket.on('pen.updatePreview', (data) => {
            if (app.indexOfPen(data.pen) === app.currentPen) {
                app.changeAcesContent(data.positions, true);
            } else if (app.indexOfPenInLinked(data.pen) === app.currentPen) {
                app.changeAcesContent(data.positions, true);
            } else if (app.indexOfLinkedInPens(data.pen) === app.currentPen) {
                app.changeAcesContent(data.positions, true);
            }
        });

        socket.on('pen.sharedCreated', (penID) => {
            document.getElementById(penID).classList.add('shared');
        });

        socket.on('pen.sharedDeleted', (penID) => {
            document.getElementById(penID).classList.remove('shared');
        });

        socket.on('settings.userJoined', (user) => {
            if (app instanceof CreatorApp || app.role === 'moderator') {
                app.userConnected(user);
            }
        });

        socket.on('settings.userLeft', (user) => {
            if (app instanceof CreatorApp || app.role === 'moderator') {
                app.userDisconnected(user);
            }
        });

        socket.on('creator.updatePens', (data) => {
            const {
                id, pen, rows, difference, positions,
            } = data;
            if (app instanceof CreatorApp || app.role === 'moderator') {
                app.updateUsers(id, pen, positions, difference, rows);
            }
            if (app.role === 'moderator') {
                socket.emit('moderator.updatePensOnServer', {
                    id: app.userID,
                    pens: app.pens,
                    roomName: app.room.name,
                });
            }
        });

        socket.on('creator.switchPen', (data) => {
            const { id, newPen } = data;
            if (app instanceof CreatorApp || app.role === 'moderator') {
                app.updateUserCurrentPen(id, newPen);
            }
        });

        socket.on('creator.deletedPen', (data) => {
            const { id, pen } = data;
            if (app instanceof CreatorApp || app.role === 'moderator') {
                app.removeUserPen(id, pen);
            }
        });

        socket.on('creator.helpNeeded', (id) => {
            if (app instanceof CreatorApp || app.role === 'moderator') {
                app.signalHelp(id);
                app.updateRoomSettings();
            }
        });

        socket.on('creator.sendRoomInformation', () => {
            if (app instanceof CreatorApp) {
                socket.emit('homePage.updatePopulation', {
                    roomName: app.room.name,
                    population: `${Object.values(app.countActive()).length}`,
                });
            }
        });

        socket.on('room.delete', () => {
            window.location.pathname = '/';
        });

        socket.on('room.isAllowed', (data) => {
            const { userID } = data;
            if (app instanceof CreatorApp) {
                let response = 'true';
                if (app.users[userID]) {
                    console.log(app.users[userID]);
                    response = `${app.users[userID].state !== 'banned'}`;
                }
                socket.emit('room.accessResponse', {
                    userID,
                    response,
                    roomName: app.room.name,
                });
            }
        });

        socket.on('pen.resolveHelp', (data) => {
            app.resolveHelp(data && data.id);
        });

        socket.on('assistant.promotion', (data) => {
            const { users, assistants } = data;
            // delete users[app.userID];
            for (let i = 0; i < assistants.length; i++) {
                delete users[assistants[i]];
            }
            if (app instanceof App) {
                socket.emit('assistant.beingPromoted', { roomName: app.room.name });
                app.receivePromotion(users);
            }
        });

        socket.on('moderator.removeUser', (data) => {
            const userID = data.userID;
            delete app.users[userID];
            document.getElementById(userID).outerHTML = '';
            for (let i = app.pens.length - 1; i >= 0; i--) {
                const pen = app.pens[i];
                if (pen.link && `${pen.link.userID}` === `${userID}`) {
                    app.deletePen(i);
                }
            }
        });

        socket.on('moderator.addUser', (data) => {
            if (app instanceof CreatorApp || app.role === 'moderator') {
                const { userID, information } = data;
                app.users[userID] = information;
                app.updateUI();
            }
        });

        socket.on('assistant.degradation', () => {
            if (app instanceof App) {
                socket.emit('assistant.beingDegraded', { roomName: app.room.name });
                app.receiveDegradation();
            }
        });

        socket.on('creator.isLinked', (data) => {
            const { pen, userID, ownerID } = data;
            socket.emit('moderator.isLinked', {
                result: `${app.isLinked(pen)}`, userID, pen, ownerID,
            });
        });

        socket.on('moderator.linkResponse', (data) => {
            const { result, pen, ownerID } = data;
            if (result === 'false') {
                app.loadRemotePen(pen, ownerID);
            }
        });

        socket.on('moderators.linkedPenChanged', (data) => {
            const pen = data.pen;
            app.updateContentLinkedPen(pen);
        });

        socket.on('creator.moderatorEstablishedLink', (data) => {
            const { pen, id } = data;
            if (app instanceof CreatorApp) {
                const userPens = app.users[id].pens;
                for (let i = 0; i < userPens.length; i++) {
                    if (`${userPens[i].id}` === `${pen.id}`) {
                        userPens[i].link = pen.link;
                    }
                }
            }
        });

        socket.on('user.ban', (data) => {
            app.users[data.userID].state = 'banned';
        });

        socket.on('preview.error', (error) => {
            const modal = document.getElementById('modal-error');
            const p = modal.querySelector('p');
            p.innerHTML = error;
            modal.classList.remove('hidden');
            setTimeout(() => {
                p.innerHTML = 'Error';
                modal.classList.add('hidden');
            }, 1500);
        });
        fitty('.room .name');
        initTheme();

        setTimeout(() => removeRoomLoader(), 2500);
    }

    function initTheme() {
        const theme = localStorage.website_theme || 'dark';
        applyTheme(theme);
        const themeChanger = document.querySelector('#themeChanger input');
        themeChanger.checked = theme === 'dark';
        themeChanger.addEventListener('input', event => switchTheme());
    }

    function removeRoomLoader() {
        const loader = document.getElementById('page-loader');
        loader.classList.add('closing');
        setTimeout(() => {
            loader.parentNode.removeChild(loader);
            document.querySelector('body').style.position = 'relative';
        }, 700);
    }


    function handleModals() {
        const modals = document.querySelectorAll('.modal');
        for (let i = 0; i < modals.length; i++) {
            const modal = modals[i];
            modal.addEventListener('click', (event) => {
                if (!event.target) { return; }
                if (!event.target.classList) { return; }
                if (!event.target.classList.contains('modal')) { return; }
                event.target.classList.add('hidden');
            });
        }
    }

    function addTogglerListener(app) {
        if (app instanceof CreatorApp) {
            app.addTogglerListener();
        } else {
            const roomSettings = document.getElementById('room-settings');
            roomSettings.parentNode.removeChild(roomSettings);
        }
    }

    function handleDragBar() {
        const dragBar = document.getElementById('dragbar');
        const pens = document.getElementById('pens');
        const controls = pens.querySelector('.controls');
        const preview = pens.querySelector('.preview');
        const iframe = document.querySelector('iframe');
        dragBar.addEventListener('mousedown', (event) => {
            event.preventDefault();
            dragging = true;
            preview.style.pointerEvents = 'none';
        });
        pens.addEventListener('mouseup', (event) => {
            event.preventDefault();
            dragging = false;
            preview.style.pointerEvents = null;
        });
        document.addEventListener('mousemove', (event) => {
            event.preventDefault();
            if (dragging) {
                if (dragBar.classList.contains('topLayout')) {
                    const oldHeight = controls.clientHeight;
                    const newHeight = event.y - pens.offsetTop;
                    const deltaHeight = newHeight - oldHeight;
                    if (oldHeight + deltaHeight >= 230 && oldHeight + deltaHeight <= 600) {
                        controls.style.height = `${oldHeight + deltaHeight}px`;
                        preview.style.height = `${preview.clientHeight - deltaHeight}px`;
                    }
                } else if (dragBar.classList.contains('sideLayout')) {
                    let oldWidth;
                    let newWidth;
                    let deltaWidth;
                    if (preview.style.flexDirection === 'row-reverse') {
                        oldWidth = preview.clientWidth;
                        newWidth = event.x;
                        deltaWidth = newWidth - oldWidth;
                        if (oldWidth + deltaWidth <= pens.clientWidth - 235 && oldWidth + deltaWidth >= pens.clientWidth - 605) {
                            controls.style.width = `${controls.clientWidth - deltaWidth}px`;
                            preview.style.width = `${oldWidth + deltaWidth}px`;
                        }
                    } else if ((preview.style.flexDirection === 'row')) {
                        oldWidth = controls.clientWidth;
                        newWidth = event.x;
                        deltaWidth = newWidth - oldWidth;
                        if (oldWidth + deltaWidth >= 230 && oldWidth + deltaWidth <= 600) {
                            controls.style.width = `${oldWidth + deltaWidth}px`;
                            preview.style.width = `${preview.clientWidth - deltaWidth}px`;
                        }
                    }
                    iframe.style.width = `calc(100vw - ${controls.style.width})`;
                }
            }
        });
        window.onresize = (event) => {
            const newWidth = event.target.innerWidth;
            const pens = document.getElementById('pens');
            const controls = pens.querySelector('.controls');
            const preview = pens.querySelector('.preview');
            if (pens.classList.contains('rightLayout') || pens.classList.contains('leftLayout')) {
                preview.style.width = `${newWidth - controls.clientWidth}px`;
            }
        };
    }


    // app
    class Pen {
        constructor(title, id, html, css, js, link) {
            this.id = id;
            this.title = title;
            this.html = html || '';
            this.css = css || '';
            this.js = js || '';
            this.link = link || null;
        }

        static createFromPen(pen) {
            return new Pen(pen.title, pen.id, pen.html, pen.css, pen.js, pen.link);
        }
    }


    class App {
        constructor(room, id, role) {
            this.role = role || 'student';
            this.room = room;
            this.userID = id;
            this.currentPen = 0;
            this.publicPen = Pen.createFromPen(room.publicPen);
            this.pens = [this.publicPen];
            this.createTabForPen(this.publicPen);
            for (let i = 0; i < room.users[id].length; i++) {
                let pen = room.users[id][i];
                this.createTabForPen(pen);
                pen = Pen.createFromPen(pen);
                this.pens.push(pen);
                socket.emit('creator.broadcastPen', { roomName: room.name, id, pen });
            }
            this.setupTabsHandlers();
            this.setupRoomInfo();
            this.switchPen(0);
        }

        createImportedPen(importPen) {
            const pen = Pen.createFromPen(importPen);
            this.pens.push(pen);
            this.createTabForPen(pen);
            this.setupTabsHandlers();
            this.switchPen(this.pens.length - 1);
            socket.emit('creator.broadcastPen', {
                roomName: this.room.name,
                id: this.userID,
                pen,
                toSave: 'true',
            });
            socket.emit('creator.switchPen', {
                roomName: this.room.name,
                id: this.userID,
                newPen: this.pens[this.pens.length - 1],
            });
        }

        switchPen(index) {
            const tabs = document.getElementById('tabs').childNodes;
            tabs[this.currentPen].classList.remove('active');
            tabs[index].classList.add('active');
            this.currentPen = index;

            socket.emit('creator.switchPen', {
                roomName: this.room.name,
                id: this.userID,
                newPen: this.getCurrentPen(),
            });

            this.changeAcesContent();

            if (this.userID === this.room.creator) {
                const sharePublic = document.getElementById('share-public');
                if (!sharePublic) { return; }
                // sharePublic.querySelector('.info').innerHTML = this.getCurrentPen().title;
                if (this.currentPen === 0) {
                    sharePublic.classList.add('hidden');
                } else {
                    sharePublic.classList.remove('hidden');
                }
            }

            if (this.role !== 'student') {
                for (const user in this.users) {
                    const select = document.getElementById(user).querySelector('select');
                    const selected = select.selectedOptions[0].id;
                    this.checkDiff(user, selected);
                }
            }
        }

        setPositions(positions) {
            const htmlAce = ace.edit('htmlPen');
            const cssAce = ace.edit('cssPen');
            const jsAce = ace.edit('jsPen');
            if (positions) {
                htmlAce.navigateTo(positions.html.row, positions.html.column);
                cssAce.navigateTo(positions.css.row, positions.css.column);
                jsAce.navigateTo(positions.js.row, positions.js.column);
            } else {
                htmlAce.navigateFileEnd();
                cssAce.navigateFileEnd();
                jsAce.navigateFileEnd();
            }
        }

        adjustPositions(positions, oldPositions, difference, rows) {
            const htmlAce = ace.edit('htmlPen');
            const cssAce = ace.edit('cssPen');
            const jsAce = ace.edit('jsPen');
            const aces = { html: htmlAce, css: cssAce, js: jsAce };
            if (positions) {
                for (const key in aces) {
                    if (rows === 0 && positions[key].row < oldPositions[key].row) {
                        htmlAce.navigateTo(oldPositions[key].row, oldPositions[key].column);
                    } else if (rows === 0 && positions[key].row === oldPositions[key].row) {
                        if (positions[key].column + difference <= oldPositions[key].column) {
                            aces[key].navigateTo(oldPositions[key].row, oldPositions[key].column + difference);
                        } else {
                            aces[key].navigateTo(oldPositions[key].row, oldPositions[key].column);
                        }
                    } else if (positions[key].row - rows < oldPositions[key].row) {
                        aces[key].navigateTo(oldPositions[key].row + rows, oldPositions[key].column);
                    } else if (positions[key].row - rows === oldPositions[key].row) {
                        let previousLineLength;
                        try {
                            previousLineLength = aces[key].getValue().split('\n')[positions[key].row - rows].length;
                        } catch (e) {
                            previousLineLength = 0;
                        }
                        if (previousLineLength > oldPositions[key].column) {
                            if (rows < 0) {
                                aces[key].navigateTo(oldPositions[key].row + rows, oldPositions[key].column + positions[key].column);
                            } else {
                                aces[key].navigateTo(oldPositions[key].row, oldPositions[key].column);
                            }
                        } else {
                            aces[key].navigateTo(oldPositions[key].row + rows, oldPositions[key].column - previousLineLength);
                        }
                    } else {
                        aces[key].navigateTo(oldPositions[key].row, oldPositions[key].column);
                    }
                }
            } else {
                htmlAce.navigateFileEnd();
                cssAce.navigateFileEnd();
                jsAce.navigateFileEnd();
            }
        }


        changeAcesContent(positions, fromSocket) {
            const htmlAce = ace.edit('htmlPen');
            const cssAce = ace.edit('cssPen');
            const jsAce = ace.edit('jsPen');
            const pen = this.getCurrentPen();
            const oldPositions = {
                html: htmlAce.getCursorPosition(),
                css: cssAce.getCursorPosition(),
                js: jsAce.getCursorPosition(),
            };
            htmlAce.setValue(pen.html);
            cssAce.setValue(pen.css);
            jsAce.setValue(pen.js);
            this.setPositions(this.currentPen === 0 ? positions : oldPositions);
            const iFrame = document.getElementById('iFrame');

            iFrame.src = `/preview/${this.room.name}?penID=${this.getCurrentPen().id}`;
            const tab = document.getElementById('tabs').childNodes[this.currentPen];

            if (fromSocket && this.currentPen !== 0) {
                tab.classList.remove('locked');
            }

            const permission = (this.room.creator === this.userID || this.currentPen !== 0) && !tab.classList.contains('locked');
            htmlAce.setReadOnly(!permission);
            cssAce.setReadOnly(!permission);
            jsAce.setReadOnly(!permission);
        }

        getCurrentPen() {
            return this.pens[this.currentPen];
        }

        createTabForPen(pen) {
            dust.render('partials/tab', { pen }, (err, out) => {
                let li = document.createElement('li');
                const nodes = document.getElementById('tabs');
                nodes.insertBefore(li, nodes.childNodes[nodes.childNodes.length - 1]);
                li.outerHTML = out;
                if (pen.title === 'Public') {
                    li = nodes.childNodes[nodes.childNodes.length - 2];
                    li.classList.toggle('active');
                    if (this.userID !== this.room.creator) {
                        li.classList.toggle('locked');
                    }
                    li.removeChild(li.lastChild);
                }
            });
        }

        createPen(callback) {
            const tabs = document.getElementById('tabs');
            const activeTabs = tabs.childNodes.length;
            if (activeTabs < 7 || this.room.creator === this.userID) {
                doJSONRequest('POST', `/room/${this.room.name}/pen`, {}, {})
                    .then((res) => {
                        const pen = new Pen(res.title, res.id);
                        this.pens.push(pen);
                        socket.emit('creator.broadcastPen', {
                            roomName: this.room.name,
                            id: this.userID,
                            pen,
                        });
                        this.createTabForPen(res);
                        this.setupTabsHandlers();
                        this.switchPen(this.pens.length - 1);
                        if (callback && typeof callback === 'function') {
                            callback();
                        }
                    });
            }
            if (activeTabs === 6 && this.room.creator !== this.userID) {
                tabs.lastChild.className = 'switchTab hidden';
            }
        }

        countLines(value) {
            return value.split('\n').length;
        }

        updateCurrentEditor(mode, value) {
            if (this.currentPen === 0 && this.userID !== this.room.creator) {
                return;
            }
            const htmlAce = ace.edit('htmlPen');
            const cssAce = ace.edit('cssPen');
            const jsAce = ace.edit('jsPen');

            if (this.userID === this.room.creator) {
                const tab = document.getElementById('tabs').childNodes[this.currentPen];
                if (!tab.classList.contains('locked')) {
                    htmlAce.setReadOnly(false);
                    cssAce.setReadOnly(false);
                    jsAce.setReadOnly(false);
                }
            }

            const pen = this.getCurrentPen();
            let userPen;
            if (pen.link && this.userID === this.room.creator) {
                const userPens = this.users[pen.link.userID].pens;
                const index = this.indexOfLinkedInPens(pen, userPens);
                if (index !== -1) {
                    userPen = userPens[index];
                }
            }
            let differenceLength;
            let differenceRows = this.countLines(value);

            switch (mode) {
            case 'html':
                if (htmlAce.getReadOnly()) {
                    return;
                }
                differenceLength = value.length - pen.html.length;
                differenceRows -= this.countLines(pen.html);
                pen.html = value;
                if (userPen) { userPen.html = value; }
                break;
            case 'css':
                if (cssAce.getReadOnly()) {
                    return;
                }
                differenceLength = value.length - pen.css.length;
                differenceRows -= this.countLines(pen.css);
                pen.css = value;
                if (userPen) { userPen.css = value; }
                break;
            case 'javascript':
                if (jsAce.getReadOnly()) {
                    return;
                }
                differenceLength = value.length - pen.js.length;
                differenceRows -= this.countLines(pen.js);
                pen.js = value;
                if (userPen) { userPen.js = value; }
                break;
            default:
                break;
            }

            const html = htmlAce.getCursorPosition();
            const css = cssAce.getCursorPosition();
            const js = jsAce.getCursorPosition();
            const positions = { html, css, js };
            socket.emit('pen.change', {
                pen,
                roomName: this.room.name,
                positions,
                difference: differenceLength,
                rows: differenceRows,
            });

            if (pen.link) {
                this.updateContentLinkedPen(pen);
                if (this.role !== 'student') {
                // send to moderators
                    socket.emit('moderators.linkedPenChanged', {
                        roomName: this.room.name,
                        pen,
                    });
                }
                if (this.role === 'moderator') {
                // send to creator
                    socket.emit('creator.linkedPenChanged', {
                        roomName: this.room.name,
                        pen,
                    });
                }
            }
        }

        updateContentLinkedPen(pen) {
            if (!this.users) { return; }
            for (const user in this.users) {
                const userPens = this.users[user].pens;
                for (let i = 0; i < userPens.length; i++) {
                    if (userPens[i].id === pen.id || (pen.link && pen.link.penID === userPens[i].id)) {
                        userPens[i].html = pen.html;
                        userPens[i].css = pen.css;
                        userPens[i].js = pen.js;
                    }
                }
                const select = document.getElementById(user).querySelector('select');
                const selected = select.selectedOptions[0].id;
                const index = this.findIDInUserPen(selected, userPens);
                if (index !== -1) {
                    this.checkDiff(user, userPens[index].id);
                }
            }
        }

        changeViewContent(positions, difference, rows) {
            const pen = this.getCurrentPen();
            const htmlAce = ace.edit('htmlPen');
            const cssAce = ace.edit('cssPen');
            const jsAce = ace.edit('jsPen');

            const oldPositions = {
                html: htmlAce.getCursorPosition(),
                css: cssAce.getCursorPosition(),
                js: jsAce.getCursorPosition(),
            };

            htmlAce.setValue(pen.html);
            cssAce.setValue(pen.css);
            jsAce.setValue(pen.js);
            if (this.currentPen === 0) {
                this.setPositions(positions);
            } else {
                this.adjustPositions(positions, oldPositions, difference, rows);
                this.collaboratorIsWriting();
            }
        }

        collaboratorIsWriting() {
            const tab = document.getElementById('tabs').childNodes[this.currentPen];
            tab.classList.add('locked');
            const htmlAce = ace.edit('htmlPen');
            const cssAce = ace.edit('cssPen');
            const jsAce = ace.edit('jsPen');
            htmlAce.setReadOnly(true);
            cssAce.setReadOnly(true);
            jsAce.setReadOnly(true);
        }

        updatePen(pen, positions, difference, rows) {
            let index = -1;
            for (let i = 0; i < this.pens.length; i++) {
                if (this.pens[i].id === pen.id) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                return;
            }
            this.pens[index].html = pen.html;
            this.pens[index].css = pen.css;
            this.pens[index].js = pen.js;
            if (index === this.currentPen) {
                this.changeViewContent(positions, difference, rows);
            }
        }


        changePenName(name, index, callback) {
            if (index === 0 || index >= this.pens.length) {
                return;
            }

            const penID = this.pens[index].id;
            doJSONRequest('PUT', `/room/${this.room.name}/pen/${penID}`, {}, { name })
                .then((res) => {
                    this.pens[index] = new Pen(res.title, res.id, res.html, res.css, res.js);
                    socket.emit('creator.broadcastPen', {
                        roomName: this.room.name,
                        id: this.userID,
                        pen: this.pens[index],
                    });
                    socket.emit('creator.switchPen', {
                        roomName: this.room.name,
                        id: this.userID,
                        newPen: this.pens[index],
                    });
                    // if (this.userID === this.room.creator) {
                    //     const sharePublic = document.getElementById('share-public');
                    //     sharePublic.querySelector('.info').innerHTML = this.getCurrentPen().title;
                    // }
                    if (callback) {
                        callback();
                    }
                });
        }

        deletePen(index) {
            if (index === 0 || index >= this.pens.length) {
                return;
            }

            const penID = this.pens[index].id;
            doFetchRequest('DELETE', `/room/${this.room.name}/pen/${penID}`, {}, {})
                .then((res) => {
                    socket.emit('creator.deletedPen', {
                        roomName: this.room.name,
                        id: this.userID,
                        pen: this.pens[index],
                    });

                    if (this.pens[index].link) {
                        let count = 0;
                        for (let i = 0; i < this.pens.length; i++) {
                            if (!this.pens[i].link || i === index) {
                                continue;
                            }
                            if (this.pens[i].link.penID === this.pens[index].link.penID) {
                                count++;
                            }
                        }
                        if (count === 0) {
                            socket.emit('pen.sharedDeleted', this.pens[index].link);
                        }
                    }

                    this.pens.splice(index, 1);
                    if (index === this.currentPen) {
                        this.switchPen(index - 1);
                    }
                    const tabs = document.getElementById('tabs');
                    tabs.removeChild(tabs.childNodes[index]);
                    tabs.lastChild.className = 'switchTab';
                    this.setupTabsHandlers();
                });
        }

        askForHelp() {
            socket.emit('creator.helpNeeded', {
                roomName: this.room.name,
                id: this.userID,
            });
        }

        resolveHelp(id) {
            if (this.role === 'student') {
                const raiseHand = document.getElementById('raise-hand');
                raiseHand.classList.remove('asking-help');
            } else {
                this.signalHelp(id);
            }
        }

        setupTabsHandlers() {
            const tabBar = document.getElementById('tabs');
            const tabs = tabBar.childNodes;
            const plusTab = tabBar.lastChild;

            for (let i = 0; i < tabs.length - 1; i++) {
                tabs[i].onclick = ((event) => {
                    event.preventDefault();
                    this.switchPen(i);
                });

                if (i === 0) {
                    continue;
                }
                const span = tabs[i].querySelector('span');
                const deleteBtn = tabs[i].querySelector('button');

                span.ondblclick = null;
                span.onkeydown = null;
                span.onblur = null;
                if (this.role === 'student' || !(this.pens[i].link)) {
                    span.ondblclick = ((event) => {
                        event.target.contentEditable = true;
                        event.target.focus();
                    });

                    span.onkeydown = ((event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            event.target.blur();
                        }
                    });

                    span.onblur = ((event) => {
                        event.target.contentEditable = false;
                        if (event.target.innerHTML === 'Public') {
                            event.target.innerHTML = 'MyPublic';
                        }
                        this.changePenName(event.target.innerHTML, i);
                    });
                }

                deleteBtn.onclick = ((event) => {
                    event.preventDefault();
                    this.deletePen(i);
                });
            }

            plusTab.onclick = this.createPen.bind(this);
        }

        setupRoomInfo() {
            if (this.role === 'creator') {
                this.setupRoomInfoCreator();
            } else {
                this.setupRoomInfoStudent();
            }
        }

        setupRoomInfoStudent() {
            const participants = document.getElementById('participants');
            const roomName = document.getElementById('room-name');
            const raiseHand = document.getElementById('raise-hand');
            const sharePublic = document.getElementById('share-public');
            participants.parentNode.parentNode.removeChild(participants.parentNode);
            roomName.innerHTML = this.room.name;
            raiseHand.onclick = (() => {
                raiseHand.classList.toggle('asking-help');
                this.askForHelp();
            });
            sharePublic.parentNode.removeChild(sharePublic);
            this.setupStorageOptions();
            this.setUpLayout();
        }

        setupStorageOptions() {
            const importButton = document.getElementById('import');
            const exportButton = document.getElementById('export');
            const storageModal = document.getElementById('storage-modal');
            const storageModalContent = storageModal.querySelector('.content');

            const handleDustProduction = (err, output) => {
                storageModalContent.innerHTML = output;
                storageModal.classList.remove('hidden');
            };

            const getGithubOptions = (() => {
                const githubOptions = [];
                return doJSONRequest('GET', '/pen/github', {}, null).then((data) => {
                    const { folders } = data;
                    if (data.status === 404 || (folders && folders.length === 0)) {
                        return githubOptions;
                    }
                    folders.forEach((folder) => {
                        githubOptions.push(folder);
                    });
                    return githubOptions;
                });
            });

            const convertHTML = (html) => {
                const lines = html.split('\n');
                const styleRegex = new RegExp('style.css');
                const jsRegex = new RegExp('app.js');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const matches = styleRegex.test(line) || jsRegex.test(line);
                    if (matches) {
                        lines.splice(i, 1);
                    }
                }
                return lines.join('\n');
            };

            const assignTemporaryClass = (htmlNode, className) => {
                htmlNode.classList.add(className);
                setTimeout(() => {
                    htmlNode.classList.remove(className);
                }, 2000);
            };

            const saveToDatabase = () => doJSONRequest('POST', '/pen/save', {}, {
                pen: this.getCurrentPen(),
                roomName: this.room.name,
            });

            exportButton.onclick = (event) => {
                if (user.githubID) {
                    dust.render('partials/storageExport', {}, (err, output) => {
                        handleDustProduction(err, output);
                        const buttons = storageModalContent.querySelectorAll('button');
                        const activate = (event) => {
                            event.target.classList.add('warning');
                            event.target.parentNode.classList.add('inUse');
                        };
                        const deactivate = (event) => {
                            event.target.classList.remove('warning');
                            event.target.parentNode.classList.remove('inUse');
                        };
                        buttons[0].onclick = (event) => {
                            activate(event);
                            const pen = this.pens[this.currentPen];
                            if (pen.html === '' && pen.css === '' && pen.js === '') {
                                deactivate(event);
                                return handleError(new Error('Cannot save an empty pen to GitHub'), event.target);
                            }
                            return doJSONRequest('POST', '/pen/github', {}, {
                                roomName: this.room.name,
                                pen: this.getCurrentPen(),
                            }).then((res) => {
                                deactivate(event);
                                const className = (res.status === 201) ? 'success' : 'error';
                                assignTemporaryClass(event.target, className);
                                setTimeout(() => storageModal.classList.add('hidden'), 1000);
                            });
                        };
                        buttons[1].onclick = (event) => {
                            activate(event);
                            saveToDatabase().then((res) => {
                                deactivate(event);
                                if (res.status === 400) return handleError(new Error(res.message), event.target);
                                const className = (res.status === 200) ? 'success' : 'error';
                                assignTemporaryClass(event.target, className);
                                setTimeout(() => storageModal.classList.add('hidden'), 1000);
                            });
                        };
                    });
                } else {
                    if (event.target.disabled) return;
                    event.target.disabled = true;
                    event.target.classList.add('warning');
                    const pen = this.getCurrentPen();
                    if (pen.html === '' && pen.css === '' && pen.js === '') {
                        event.target.classList.remove('warning');
                        event.target.disabled = false;
                        return handleError(new Error('Cannot save an empty pen to GitHub'), event.target);
                    }
                    saveToDatabase().then((res) => {
                        const className = (res.status === 200) ? 'success' : 'error';
                        event.target.classList.remove('warning');
                        assignTemporaryClass(event.target, className);
                        event.target.disabled = false;
                    });
                }
            };

            const handleImportOptions = () => {
                const options = document.getElementById('import-options');
                if (!options) return;
                const locals = storageModalContent.querySelector('.locals').childNodes;
                const githubs = storageModalContent.querySelector('.githubs').childNodes;
                locals.forEach((local) => {
                    const deleteButton = local.querySelector('button');
                    deleteButton.onclick = handleLocalDeletion;
                    local.onclick = handleLocalImport;
                });
                githubs.forEach((github) => {
                    const deleteButton = github.querySelector('button');
                    deleteButton.onclick = handleGithubDeletion;
                    github.onclick = handleGithubImport;
                });
            };

            const handleLocalDeletion = (event) => {
                const entry = event.target.parentNode;
                const { id } = entry.dataset;
                event.preventDefault();
                if (entry.classList.contains('beingDeleted')) return;
                entry.classList.add('beingDeleted');
                doJSONRequest('DELETE', `/pen/${id}`, {}, null).then((res) => {
                    if (res.status === 200) {
                        const local = entry.parentNode;
                        entry.parentNode.removeChild(entry);
                        const localsCount = local.childNodes.length;
                        const githubCount = local.nextSibling.childNodes.length;
                        if (localsCount + githubCount === 0) storageModal.classList.add('hidden');
                    } else {
                        handleError(new Error(res.message), event.target);
                    }
                    entry.classList.remove('beingDeleted');
                });
            };

            const handleGithubDeletion = (event) => {
                const entry = event.target.parentNode;
                const { name } = entry.dataset;
                event.preventDefault();
                if (entry.classList.contains('beingDeleted')) return;
                entry.classList.add('beingDeleted', 'loading');
                doJSONRequest('DELETE', `/pen/github/${name}`, {}, null).then((res) => {
                    if (res.status === 200) {
                        const github = entry.parentNode;
                        entry.parentNode.removeChild(entry);
                        const githubCount = github.childNodes.length;
                        const localsCount = github.previousSibling.childNodes.length;
                        if (localsCount + githubCount === 0) storageModal.classList.add('hidden');
                    } else {
                        handleError(new Error(res.message), event.target);
                    }
                    entry.classList.remove('beingDeleted', 'loading');
                });
            };

            const handleLocalImport = (event) => {
                if (!event.target.classList.contains('option')
                || event.target.classList.contains('beingDeleted')) return;
                const { id } = event.target.dataset;
                event.target.classList.add('loading');
                doJSONRequest('GET', `/pen/${id}`, {}, null).then((res) => {
                    const { status, pen } = res;
                    if (status !== 200) handleError(new Error('Failed to import local pen'), event.target);
                    this.createImportedPen(pen);
                    event.target.classList.remove('loading');
                    storageModal.classList.add('hidden');
                });
            };

            const handleGithubImport = (event) => {
                if (!event.target.classList.contains('option')
                || event.target.classList.contains('beingDeleted')) return;
                const { name } = event.target.dataset;
                event.target.classList.add('loading');
                doJSONRequest('GET', `/pen/github/${name}`, {}, null).then((res) => {
                    const { status, pen } = res;
                    if (status !== 200) handleError(new Error('Failed to import GitHub pen'), event.target);
                    pen.html = convertHTML(pen.html);
                    this.createImportedPen(pen);
                    event.target.classList.remove('loading');
                    storageModal.classList.add('hidden');
                });
            };

            importButton.onclick = (event) => {
                if (event.target.disabled) return;
                event.target.disabled = true;
                doJSONRequest('GET', '/pen/all', {}, null).then((data) => {
                    const { savedPens, status } = data;
                    if (status !== 200) throw new Error(data.message);
                    let options = savedPens.length > 0;
                    if (user.githubID) {
                        getGithubOptions().then((githubPens) => {
                            options = githubPens.length + savedPens.length > 0;
                            dust.render('partials/storageImport', { options, locals: savedPens, githubs: githubPens }, (err, output) => {
                                handleDustProduction(err, output);
                                handleImportOptions();
                                event.target.disabled = false;
                            });
                        });
                    } else {
                        dust.render('partials/storageImport', { options, locals: savedPens }, (err, output) => {
                            handleDustProduction(err, output);
                            handleImportOptions();
                            event.target.disabled = false;
                        });
                    }
                }).catch((err) => {
                    console.error(err);
                    event.target.disabled = false;
                });
            };
        }

        setUpLayout() {
            const leftLayout = document.getElementById('leftLayout');
            const centerLayout = document.getElementById('centerLayout');
            const rightLayout = document.getElementById('rightLayout');
            const pens = document.getElementById('pens');

            function updateActive(element) {
                const buttons = element.parentNode.childNodes;
                for (let i = 0; i < buttons.length; i++) {
                    const button = buttons[i];
                    if (button.classList) button.classList.remove('active');
                }
                element.classList.add('active');
            }

            const dragBar = document.getElementById('dragbar');
            const controls = pens.querySelector('.controls');
            const preview = pens.querySelector('.preview');
            const iframe = document.querySelector('iframe');

            leftLayout.addEventListener('click', (event) => {
                updateActive(event.target);
                pens.classList.add('leftLayout');
                pens.classList.remove('centerLayout');
                pens.classList.remove('rightLayout');
                dragBar.classList.remove('topLayout');
                dragBar.classList.add('sideLayout');
                controls.style.height = null;
                preview.style.height = null;
                preview.style.flexDirection = 'row';
                iframe.style.width = `calc(100vw - ${controls.style.width})`;
            });
            centerLayout.addEventListener('click', (event) => {
                updateActive(event.target);
                pens.classList.remove('leftLayout');
                pens.classList.add('centerLayout');
                pens.classList.remove('rightLayout');
                dragBar.classList.add('topLayout');
                dragBar.classList.remove('sideLayout');
                controls.style.width = null;
                preview.style.width = null;
                preview.style.flexDirection = 'column';
            });
            rightLayout.addEventListener('click', (event) => {
                updateActive(event.target);
                pens.classList.remove('leftLayout');
                pens.classList.remove('centerLayout');
                pens.classList.add('rightLayout');
                dragBar.classList.remove('topLayout');
                dragBar.classList.add('sideLayout');
                controls.style.height = null;
                preview.style.height = null;
                preview.style.flexDirection = 'row-reverse';
                iframe.style.width = `calc(100vw - ${controls.style.width})`;
            });

            const penClasses = ['none', 'html', 'css', 'htmlcss', 'js', 'htmljs', 'cssjs', undefined];

            function convertToClass(n) {
                return penClasses[n];
            }

            function updatePensClass() {
                const editors = document.querySelectorAll('#pens .pen');
                let count = 0;
                for (let i = 0; i < editors.length; i++) {
                    const editor = editors[i];
                    if (!editor.classList.contains('min')) {
                        count += 2 ** i;
                    }
                }
                penClasses.forEach((className) => {
                    pens.classList.remove(className);
                });
                const newClass = convertToClass(count);
                if (newClass) pens.classList.add(newClass);
            }


            pens.querySelector('div').childNodes.forEach((pen) => {
                const btns = pen.querySelectorAll('button');
                btns[0].addEventListener('click', (event) => {
                    const button = event.target;
                    updateActive(button);
                    button.parentNode.parentNode.parentNode.classList.add('max');
                    button.parentNode.parentNode.parentNode.classList.remove('min');
                    pens.querySelector('div').childNodes.forEach((checkPen, index) => {
                        if (checkPen !== pen) {
                            checkPen.classList.remove('max');
                            checkPen.classList.add('min');
                            const buttons = checkPen.querySelectorAll('.header button');
                            buttons.forEach((button, index) => {
                                button.classList.remove('active');
                                if (index === 2) button.classList.add('active');
                            });
                        }
                    });
                    updatePensClass();
                });
                btns[1].addEventListener('click', (event) => {
                    const button = event.target;
                    updateActive(button);
                    const count = [0, 0, 0];
                    pens.querySelector('div').childNodes.forEach((checkPen, index) => {
                        if (checkPen !== pen) {
                            const buttons = checkPen.querySelectorAll('.header button');
                            buttons.forEach((btn, i) => {
                                if (btn.classList.contains('active')) {
                                    count[i]++;
                                }
                            });
                            if (buttons[0].classList.contains('active')) {
                                checkPen.classList.remove('max');
                                buttons[0].classList.remove('active');
                                buttons[1].classList.add('active');
                            }
                        }
                    });
                    if (count[2] !== 2) {
                        button.parentNode.parentNode.parentNode.classList.remove('max');
                        button.parentNode.parentNode.parentNode.classList.remove('min');
                    } else {
                        button.classList.remove('active');
                        button.previousSibling.classList.add('active');
                        button.parentNode.parentNode.parentNode.classList.add('max');
                        button.parentNode.parentNode.parentNode.classList.remove('min');
                    }
                    updatePensClass();
                });
                btns[2].addEventListener('click', (event) => {
                    const button = event.target;
                    updateActive(button);
                    button.parentNode.parentNode.parentNode.classList.remove('max');
                    button.parentNode.parentNode.parentNode.classList.add('min');
                    let count = 0;
                    pens.querySelector('div').childNodes.forEach((checkPen, index) => {
                        if (checkPen !== pen) {
                            const buttons = checkPen.querySelectorAll('.header button');
                            if (buttons[2].classList.contains('active')) {
                                count++;
                            }
                        }
                    });
                    if (count === 1) {
                        pens.querySelector('div').childNodes.forEach((checkPen, index) => {
                            if (checkPen !== pen) {
                                const buttons = checkPen.querySelectorAll('.header button');
                                if (!(buttons[2].classList.contains('active'))) {
                                    checkPen.classList.add('max');
                                    buttons[1].classList.remove('active');
                                    buttons[0].classList.add('active');
                                }
                            }
                        });
                    }
                    updatePensClass();
                });
            });
        }

        indexOfPen(pen) {
            let index = -1;
            for (let i = 0; i < this.pens.length; i++) {
                if (this.pens[i].id === pen.id) {
                    index = i;
                    break;
                }
            }
            return index;
        }

        indexOfPenInLinked(pen, pens = this.pens) {
            let index = -1;
            for (let i = 0; i < pens.length; i++) {
                if (pens[i].link && pens[i].link.penID === pen.id) {
                    index = i;
                    break;
                }
            }
            return index;
        }

        indexOfLinkedInPens(pen, pens = this.pens) {
            if (!pen.link) {
                return -1;
            }
            let index = -1;
            for (let i = 0; i < pens.length; i++) {
                if (pen.link.penID === pens[i].id) {
                    index = i;
                    break;
                }
            }
            return index;
        }

        receivePromotion(users) {
            this.users = users;
            this.role = 'moderator';
            const confirmModal = document.getElementById('confirm-modal');
            const roomSettings = document.createElement('div');
            roomSettings.id = 'room-settings';
            roomSettings.classList.add('hidden');
            document.body.insertBefore(roomSettings, confirmModal);
            dust.render('partials/creator', {}, (err, out) => {
                roomSettings.innerHTML = out;
            });
            const askForHelp = document.getElementById('raise-hand');
            askForHelp.parentNode.removeChild(askForHelp);
            this.addTogglerListener();
            this.updateUI();
            this.setUpModalListeners();
        }

        receiveDegradation() {
            delete this.users;
            this.role = 'student';
            document.getElementById('room-settings').outerHTML = '';
            const span = document.createElement('span');
            span.innerHTML = 'Ask for help';
            span.id = 'raise-hand';
            span.onclick = ((event) => {
                span.classList.toggle('asking-help');
                this.askForHelp();
            });
            // span.classList.add('info');
            const roomInfo = document.getElementById('room-info').querySelector('.info');
            roomInfo.appendChild(span);
            for (let i = this.pens.length - 1; i >= 0; i--) {
                if (this.pens[i].link) {
                    this.deletePen(i);
                }
            }
        }

        addTogglerListener() {
            if (this.role === 'student') {
                return;
            }
            const roomSettings = document.getElementById('room-settings');
            const toggler = roomSettings.querySelector('.toggler');
            const content = document.getElementById('content');
            const shareOptions = document.getElementById('share-public');

            content.onclick = ((event) => {
                if (!(roomSettings.classList.contains('hidden'))) {
                    roomSettings.classList.add('hidden');
                }
                if (shareOptions && (shareOptions.classList.contains('open'))) {
                    if (!event.target) { return; }
                    const target = event.target;
                    if (target.id === 'share-toggler') { return; }
                    if (target.id === 'share-options') { return; }
                    if (target.className && target.className.split(' ').includes('option-container')) { return; }
                    if (target.type === 'checkbox') { return; }
                    const texts = ['ALL', 'HTML', 'CSS', 'JS'];
                    if (target.tagName === 'SPAN' && texts.includes(target.innerHTML)) { return; }
                    shareOptions.classList.remove('open');
                }
            });

            toggler.onclick = (event) => {
                roomSettings.classList.toggle('hidden');
            };

            toggler.onmouseenter = (event) => {
                document.body.style.cursor = 'pointer';
            };

            toggler.onmouseleave = (event) => {
                document.body.style.cursor = 'default';
            };
        }

        updateUsers(userID, pen, positions, difference, rows) {
            if (this.role === 'student') { return; }
            if (!this.users || !this.users[userID]) { return; }
            const { pens } = this.users[userID];
            for (let i = 0; i < this.pens.length; i++) {
                const storedPen = this.pens[i];
                if (storedPen.link && storedPen.link.penID === pen.id) {
                    const newTitle = `${this.users[userID].user.username} - ${pen.title}`;
                    const titleChanged = newTitle !== storedPen.title;
                    storedPen.title = `${this.users[userID].user.username} - ${pen.title}`;
                    storedPen.html = pen.html;
                    storedPen.css = pen.css;
                    storedPen.js = pen.js;

                    if (this.currentPen === i && titleChanged) {
                        setTimeout(() => {
                            ace.edit('htmlPen').setReadOnly(false);
                            ace.edit('cssPen').setReadOnly(false);
                            ace.edit('jsPen').setReadOnly(false);
                            document.getElementById(storedPen.id).classList.remove('locked');
                        }, 0);
                    }

                    const tab = document.getElementById(storedPen.id).querySelector('span');
                    // const sharePublic = document.getElementById('share-public');
                    tab.innerText = storedPen.title;
                    // sharePublic.querySelector('.info').innerHTML = storedPen.title;

                    if (this.currentPen === i) {
                        this.changeViewContent(positions, difference, rows);
                    }

                    socket.emit('creator.broadcastPen', {
                        roomName: this.room.name,
                        id: this.userID,
                        pen: storedPen,
                    });
                }
            }

            for (let i = 0; i < pens.length; i++) {
                const storedPen = pens[i];
                if (storedPen.id === pen.id) {
                    pens[i] = pen;
                    this.updateUserUI(userID, pen, pen, true);
                    this.checkDiff(userID, pen.id);
                    return;
                }
            }
            this.users[userID].pens.push(pen);
            this.updateUserUI(userID, null, null);
        }

        addSingleUserListener(userID) {
            if (this.role === 'student') {
                return;
            }
            const roomSettings = document.getElementById('room-settings');
            const user = document.getElementById(userID);
            if (!user) {
                return;
            }
            const preview = user.querySelector('img#preview-icon');
            const image = user.querySelector('img.user-icon');
            const kickBanMenu = user.querySelector('.user-remove');
            const kick = user.querySelector('.kick');
            const ban = user.querySelector('.ban');
            const sharePen = user.querySelector('button#share-pen');
            const loadPen = user.querySelector('button#load-pen');
            const promote = user.querySelector('button.promote');
            const select = user.querySelector('select');
            const id = user.id;
            const { pens } = this.users[id];

            if (this.role === 'moderator') {
                promote.parentNode.removeChild(promote);
                loadPen.classList.add('onlyChild');
                sharePen.parentNode.removeChild(sharePen);
            }
            image.onclick = ((event) => {
                if (this.users[id].ping) {
                    this.signalHelp(id);
                    socket.emit('pen.resolveHelp', { id, roomName: this.room.name });
                }
            });
            kickBanMenu.onclick = ((event) => {
                kickBanMenu.classList.toggle('open');
            });
            roomSettings.onclick = ((event) => {
                const kickBanMenu = user.querySelector('.user-remove');
                if (!kickBanMenu) {
                    return;
                }
                if (!(kickBanMenu.contains(event.target)) && kickBanMenu.classList.contains('open')) {
                    kickBanMenu.classList.remove('open');
                }
            });


            kick.onclick = ((event) => {
                event.preventDefault();
                this.setModalContent(`kick ${this.users[id].user.username}`,
                    (() => {
                        const modal = document.getElementById('confirm-modal');
                        modal.classList.toggle('hidden');
                        socket.emit('user.kick', { userID: id });
                    }),
                    (() => {
                        const modal = document.getElementById('confirm-modal');
                        modal.classList.toggle('hidden');
                    }));
            });
            ban.onclick = ((event) => {
                event.preventDefault();
                this.setModalContent(`ban ${this.users[id].user.username}`,
                    (() => {
                        const modal = document.getElementById('confirm-modal');
                        modal.classList.toggle('hidden');
                        if (this.role === 'creator') {
                            this.users[id].state = 'banned';
                        } else if(this.role === 'moderator') {
                            socket.emit('user.ban', { roomName: this.room.name, userID: id });
                        }
                        socket.emit('user.kick', { userID: id });
                    }),
                    (() => {
                        const modal = document.getElementById('confirm-modal');
                        modal.classList.toggle('hidden');
                    }));
            });
            if (this.role === 'creator') {
                sharePen.onclick = ((event) => {
                    event.preventDefault();
                    // const index = findIDInUserPen(this.users[id].currentPen.id, pens);
                    let selectedPen = select.selectedOptions[0].id;
                    if (selectedPen === '') {
                        selectedPen = this.publicPen.id;
                    }
                    const index = this.findIDInUserPen(selectedPen, pens);
                    if (index === -1) {
                        return;
                    }
                    this.setPenContentIntoPen(pens[index], this.publicPen);
                });
            }
            if (this.role === 'creator') {
                loadPen.onclick = ((event) => {
                    event.preventDefault();
                    // const index = findIDInUserPen(this.users[id].currentPen.id, pens);
                    let selectedPen = select.selectedOptions[0].id;
                    if (selectedPen === '') {
                        selectedPen = this.publicPen.id;
                    }

                    const index = this.findIDInUserPen(selectedPen, pens);
                    if (index === -1 || this.isLinked(pens[index])) {
                        return;
                    }
                    this.loadRemotePen(pens[index], id);
                });
                if (this.assistants.includes(id)) {
                    loadPen.onclick = null;
                }
            } else {
                loadPen.onclick = ((event) => {
                    let selectedPen = select.selectedOptions[0].id;
                    if (selectedPen === '') {
                        selectedPen = this.publicPen.id;
                    }
                    const index = this.findIDInUserPen(selectedPen, pens);
                    if (index === -1) {
                        return;
                    }
                    socket.emit('moderator.loadPen', {
                        pen: pens[index],
                        userID: this.userID,
                        roomName: this.room.name,
                        ownerID: id,
                    });
                });
            }

            preview.onclick = ((event) => {
                const modal = document.getElementById('preview-modal');
                const shareModalPen = document.getElementById('modal-share');
                const loadModalPen = document.getElementById('modal-load');
                const iFrame = modal.querySelector('iframe#preview-iframe');

                // const index = findIDInUserPen(this.users[id].currentPen.id, pens);
                let selectedPen = select.selectedOptions[0].id;
                if (selectedPen === '') {
                    selectedPen = this.publicPen.id;
                }
                const index = this.findIDInUserPen(selectedPen, pens);

                if (index === -1) {
                    return;
                }
                modal.classList.toggle('hidden');
                iFrame.src = `/preview/${this.room.name}?penID=${pens[index].id}&userID=${id}`;
                if (shareModalPen) {
                    shareModalPen.onclick = ((event) => {
                        sharePen.click();
                        modal.classList.add('hidden');
                    });
                }
                loadModalPen.onclick = ((event) => {
                    loadPen.click();
                    modal.classList.add('hidden');
                });
            });
            select.onchange = ((event) => {
                this.checkDiff(id);
            });
            if (this.role === 'creator') {
                promote.onclick = ((event) => {
                    event.preventDefault();
                    this.users[id].ping = false;
                    user.classList.remove('help-needed');
                    this.updateRoomSettings();
                    const index = this.assistants.indexOf(id);
                    if (index === -1) {
                        this.assistants.push(id);
                        loadPen.onclick = null;
                        socket.emit('assistant.promotion', {
                            userID: id,
                            users: this.users,
                            assistants: this.assistants,
                            roomName: this.room.name,
                        });
                        promote.innerHTML = 'Demote';
                    } else {
                        this.assistants.splice(index, 1);
                        socket.emit('assistant.degradation', {
                            userID: id,
                            roomName: this.room.name,
                            information: this.users[id],
                        });
                        promote.innerHTML = 'Promote';
                    }
                });
            }
        }

        updateUI() {
            if (this.role === 'student') {
                return;
            }
            const connectedUsers = this.countActive();
            for (const key in connectedUsers) {
                this.updateUserUI(key, this.users[key].currentPen);
            }
            this.updateRoomSettings();
        }

        updateUserUI(id, newPen, oldPen, doNotRefresh) {
            if (this.role === 'student') {
                return;
            }
            if (doNotRefresh) {
                const select = document.getElementById(id).querySelector('select');
                const selected = select.selectedOptions[0].id;
                const index = this.findIDInUserPen(selected, this.users[id].pens);
                if (index !== -1) {
                    this.checkDiff(id, this.users[id].pens[index + 1]);
                }
                return;
            }
            dust.render('partials/user', this.users[id], (err, out) => {
                let userDiv = document.getElementById(id);
                let previousSelected = '';
                if (userDiv) {
                    userDiv.outerHTML = out;
                    previousSelected = `${userDiv.querySelector('select').selectedOptions[0].id}`;
                } else {
                    const roomSettings = document.getElementById('users');
                    const div = document.createElement('div');
                    roomSettings.appendChild(div);
                    div.outerHTML = out;
                }


                let index = -1;

                if (oldPen && previousSelected !== '' && `${oldPen.id}` !== previousSelected) {
                    index = this.findIDInUserPen(previousSelected, this.users[id].pens);
                } else if (newPen) {
                    index = this.findIDInUserPen(newPen.id, this.users[id].pens);
                }


                userDiv = document.getElementById(id);
                userDiv.querySelector('select').options.selectedIndex = index + 1;
                if (this.users[id].ping) {
                    userDiv.classList.add('help-needed');
                }
                this.addSingleUserListener(id);
                if (index === -1) {
                    this.checkDiff(id, this.pens[0]);
                    // const diffProgress = document.getElementById(id).querySelector('.difference-progress');
                    // diffProgress.classList.add('green');
                    // diffProgress.classList.remove('yellow');
                    // diffProgress.classList.remove('red');
                    // diffProgress.style.width = '100%';
                } else {
                    this.checkDiff(id, this.users[id].pens[index + 1]);
                }
                if (this.assistants && this.assistants.includes(id)) {
                    const promote = document.getElementById(id).querySelector('.promote');
                    promote.innerHTML = 'Demote';
                }
            });
        }

        updateRoomSettings() {
            if (this.role === 'student') {
                return;
            }
            const roomSettings = document.getElementById('room-settings');
            const users = Object.keys(this.users);
            let count = 0;
            for (let i = 0; i < users.length; i++) {
                const user = this.users[users[i]];
                if (user.ping === true) count++;
            }
            if (count > 0) {
                roomSettings.classList.add('help-needed');
            } else {
                roomSettings.classList.remove('help-needed');
            }
        }

        findIDInUserPen(currentPenID, pens) {
            if (this.role === 'student') {
                return;
            }
            let index = -1;
            for (let i = 0; i < pens.length; i++) {
                if (`${pens[i].id}` === `${currentPenID}`) {
                    index = i;
                    break;
                }
            }
            return index;
        }


        setModalContent(message, confirmListener, cancelListener) {
            if (this.role === 'student') {
                return;
            }
            const modal = document.getElementById('confirm-modal');
            const paragraph = modal.querySelector('p');
            const confirm = modal.querySelector('.confirm');
            const cancel = modal.querySelector('.cancel');
            modal.classList.toggle('hidden');

            paragraph.innerHTML = `Are you sure you want to ${message}?`;
            confirm.onclick = confirmListener;
            cancel.onclick = cancelListener;
        }


        countActive() {
            if (this.role === 'student') {
                return;
            }
            const connectedUsers = {};
            for (const key in this.users) {
                if (this.users[key].state === 'connected') {
                    connectedUsers[key] = this.users[key];
                }
            }
            return connectedUsers;
        }


        setUpModalListeners() {
            const modals = document.querySelectorAll('.modal');
            const sharePen = document.getElementById('modal-share');
            const loadPen = document.getElementById('modal-load');

            modals.forEach((modal) => {
                const closeModal = modal.querySelector('.close-modal');
                const container = modal.querySelector('.container');
                if (closeModal) {
                    closeModal.addEventListener('click', (event) => {
                        event.preventDefault();
                        modal.classList.add('hidden');
                        sharePen.onclick = null;
                        loadPen.onclick = null;
                    });
                }
                modal.addEventListener('click', (event) => {
                    if ((!container.contains(event.target)) && !(modal.classList.contains('hidden'))) {
                        modal.classList.add('hidden');
                    }
                });
            });
            if (this.role !== 'creator' && sharePen) {
                loadPen.classList.add('onlyChild');
                sharePen.parentNode.removeChild(sharePen);
            }
        }

        setPenContentIntoPen(pen, penToModify, options) {
            if (this.role === 'student') {
                return;
            }
            const iFrame = document.getElementById('iFrame');
            const roomName = this.room.name;
            if (this.getCurrentPen().id === penToModify.id) {
                if (options) {
                    if (options.html) { ace.edit('htmlPen').setValue(pen.html); }
                    if (options.css) { ace.edit('cssPen').setValue(pen.css); }
                    if (options.js) { ace.edit('jsPen').setValue(pen.js); }
                } else {
                    ace.edit('htmlPen').setValue(pen.html);
                    ace.edit('cssPen').setValue(pen.css);
                    ace.edit('jsPen').setValue(pen.js);
                }
                this.setPositions();
            }
            if (options) {
                if (options.html) { penToModify.html = pen.html; }
                if (options.css) { penToModify.css = pen.css; }
                if (options.js) { penToModify.js = pen.js; }
            } else {
                penToModify.html = pen.html;
                penToModify.css = pen.css;
                penToModify.js = pen.js;
            }
            socket.emit('pen.change', { pen: penToModify, roomName });
            socket.emit('pen.preview', { pen: penToModify, roomName });
            setTimeout(() => { iFrame.src = `/preview/${roomName}?penID=${penToModify.id}`; }, 0);
        }

        loadRemotePen(pen, userID) {
            if (this.role === 'student') {
                return;
            }
            this.createPen(() => {
                const newTitle = `${this.users[userID].user.username} - ${pen.title}`;
                this.changePenName(newTitle, this.currentPen, (() => {
                    const tabs = document.getElementById('tabs');
                    const newTab = tabs.childNodes[tabs.childNodes.length - 2];
                    newTab.classList.toggle('shared');
                    newTab.querySelector('span').innerHTML = newTitle;

                    socket.emit('pen.sharedCreated', { userID, penID: pen.id });

                    this.getCurrentPen().link = { userID, penID: pen.id };
                    this.setupTabsHandlers();

                    this.setPenContentIntoPen(pen, this.getCurrentPen());
                    socket.emit('creator.linkEstablished', {
                        id: this.userID,
                        pen: this.pens[this.indexOfPenInLinked(pen)],
                        roomName: this.room.name,
                    });
                }));
            });
        }

        signalHelp(id) {
            if (this.role === 'student') {
                return;
            }
            this.users[id].ping = !this.users[id].ping;
            document.getElementById(id).classList.toggle('help-needed');
            this.updateRoomSettings();
        }

        userConnected(user) {
            if (this.role === 'student') {
                return;
            }
            if (this.role === 'creator') {
                if (this.users[user._id] && this.users[user._id].state === 'banned') {
                    socket.emit('user.kick', { userID: user._id });
                    return;
                }
            }
            this.users[user._id] = {
                user,
                currentPen: this.publicPen,
                pens: [],
                ping: false,
                state: 'connected',
            };
            socket.emit('homePage.updatePopulation', {
                roomName: this.room.name,
                population: `${Object.values(this.countActive()).length}`,
            });
            this.updateUserUI(user._id, this.publicPen);
            this.updateParticipantsCounter();
            if (this.assistants && this.assistants.includes(user._id)) {
                socket.emit('assistant.promotion', {
                    userID: user._id,
                    users: this.users,
                    assistants: this.assistants,
                    roomName: this.room.name,
                });
            }
            setTimeout(() => {
                const current = this.getCurrentPen();
                if (current.link && current.link.userID === user._id) {
                    ace.edit('htmlPen').setReadOnly(false);
                    ace.edit('cssPen').setReadOnly(false);
                    ace.edit('jsPen').setReadOnly(false);
                    document.getElementById(current.id).classList.remove('locked');
                }
            }, 0);
        }

        userDisconnected(user) {
            if (this.role === 'student') {
                return;
            }
            // delete this.users[user];
            if (this.users && this.users[user] && this.users[user].state !== 'banned') {
                this.users[user].state = 'disconnected';
            }
            socket.emit('homePage.updatePopulation', {
                roomName: this.room.name,
                population: `${Object.values(this.countActive()).length}`,
            });

            const element = document.getElementById(user);
            if (!element) {
                return;
            }
            element.outerHTML = '';

            this.updateUI();
            this.updateParticipantsCounter();
        }

        updateUserCurrentPen(userID, newPen) {
            if (this.role === 'student') {
                return;
            }
            if (!this.users || !this.users[userID]) {
                return;
            }
            const oldPen = this.users[userID].currentPen;
            this.users[userID].currentPen = newPen;
            this.updateUserUI(userID, newPen, oldPen);
        // this.updateUI();
        }

        removeUserPen(userID, pen) {
            if (this.role === 'student') { return; }
            if (!this.users || !this.users[userID]) { return; }
            const { pens } = this.users[userID];
            let index = -1;
            for (let i = 0; i < pens.length; i++) {
                if (pens[i].id === pen.id) {
                    index = i;
                    break;
                }
            }

            if (index === -1) { return; }

            pens.splice(index, 1);


            if (this.role === 'creator') {
                for (let i = 0; i < this.assistants.length; i++) {
                    const assistantPens = this.users[this.assistants[i]].pens;
                    const assistantIndex = this.indexOfPenInLinked(pen, assistantPens);
                    if (assistantIndex === -1) { continue; }
                    assistantPens.splice(assistantIndex, 1);
                    this.updateUserUI(this.assistants[i], null, null);
                }
            }

            index = this.indexOfPenInLinked(pen);


            while (index !== -1) {
                doFetchRequest('DELETE', `/room/${this.room.name}/pen/${this.pens[index].id}`, {}, {});
                if (index <= this.currentPen) {
                    this.currentPen--;
                }
                this.pens.splice(index, 1);
                const deletedTab = document.querySelectorAll('.switchTab')[index];
                deletedTab.parentNode.removeChild(deletedTab);
                index = this.indexOfPenInLinked(pen);
            }

            this.setupTabsHandlers();
            this.switchPen(this.currentPen);
        }

        updateParticipantsCounter() {
            if (this.role === 'student') { return; }
            const participants = document.getElementById('participants');
            const connectedUsers = this.countActive();
            const count = Object.values(connectedUsers).length;
            if (participants) {
                participants.innerHTML = `${count}`;
            }
            return connectedUsers;
        }

        handleShareOptions(checkboxs) {
            if (this.role === 'student') {
                return;
            }
            const share = document.getElementById('share-public');
            function updateShare() {
                share.setAttribute('data-html', checkboxs[1].checked);
                share.setAttribute('data-css', checkboxs[2].checked);
                share.setAttribute('data-js', checkboxs[3].checked);
            }

            checkboxs[0].addEventListener('input', (event) => {
                for (let i = 1; i < checkboxs.length; i++) {
                    const checkbox = checkboxs[i];
                    checkbox.checked = event.target.checked;
                }
                updateShare();
            });

            for (let i = 1; i < checkboxs.length; i++) {
                const checkbox = checkboxs[i];
                checkbox.addEventListener('input', (event) => {
                    if (!checkbox.checked) {
                        checkboxs[0].checked = false;
                    } else {
                        let count = 0;
                        for (let j = 1; j < checkboxs.length; j++) {
                            if (!checkboxs[j].checked) {
                                count++;
                            }
                        }
                        if (count === 0) {
                            checkboxs[0].checked = true;
                        }
                    }
                    updateShare();
                });
            }
        }

        setupRoomInfoCreator() {
            const participants = document.getElementById('participants');
            participants.innerHTML = '0';

            const roomName = document.getElementById('room-name');
            roomName.innerHTML = this.room.name;

            const raiseHand = document.getElementById('raise-hand');
            raiseHand.parentNode.removeChild(raiseHand);

            const sharePublic = document.getElementById('share-public');

            sharePublic.classList.add('hidden');
            sharePublic.onclick = ((event) => {
                function parseBoolean(string) {
                    return string === 'true';
                }
                if (event.target.id !== 'share-public') return;
                const { html, css, js } = sharePublic.dataset;
                const options = {
                    html: parseBoolean(html), css: parseBoolean(css), js: parseBoolean(js),
                };

                this.setPenContentIntoPen(this.getCurrentPen(), app.publicPen, options);
                this.switchPen(0);
            });

            const content = document.getElementById('content');
            content.onclick = ((event) => {
                const sharePublic = document.getElementById('share-public');
                if (sharePublic.classList.contains('open')) {
                    if (!sharePublic.contains(event.target)) {
                        sharePublic.classList.remove('open');
                    }
                }
            });

            const shareToggle = document.getElementById('share-toggler');
            shareToggle.onclick = (event) => {
                event.target.parentNode.classList.toggle('open');
            };

            const shareOptions = document.getElementById('share-options');
            const checkboxs = shareOptions.querySelectorAll('input[type="checkbox"]');
            this.handleShareOptions(checkboxs);

            this.setUpModalListeners();
            this.setupStorageOptions();
            this.setUpLayout();
        }

        checkDiff(id, inputPenID) {
            if (this.role === 'student') {
                return;
            }
            const diffProgress = document.getElementById(id).querySelector('.difference-progress');
            const select = document.getElementById(id).querySelector('select');
            const penID = select.selectedOptions[0].id;
            const index = this.findIDInUserPen(penID, this.users[id].pens);
            const creatorPen = this.getCurrentPen();
            const userPen = index === -1 ? this.publicPen : this.users[id].pens[index];

            if (inputPenID && `${inputPenID}` !== `${userPen.id}`) {
                return;
            }

            const htmlDiff = this.checkSingleDiff(creatorPen.html, userPen.html);
            const cssDiff = this.checkSingleDiff(creatorPen.css, userPen.css);
            const javascriptDiff = this.checkSingleDiff(creatorPen.js, userPen.js);
            // const result = Math.round((htmlDiff + cssDiff + javascriptDiff) / 3 * 100);
            const result = 100 - Math.round((htmlDiff + cssDiff + javascriptDiff) / 3 * 100);
            if (result > 66) {
                diffProgress.classList.add('green');
                diffProgress.classList.remove('yellow');
                diffProgress.classList.remove('red');
            } else if (result <= 66 && result > 33) {
                diffProgress.classList.remove('green');
                diffProgress.classList.add('yellow');
                diffProgress.classList.remove('red');
            } else {
                diffProgress.classList.remove('green');
                diffProgress.classList.remove('yellow');
                diffProgress.classList.add('red');
            }
            diffProgress.style.width = `${result}%`;
        }

        checkSingleDiff(mainContent, secondContent) {
            if (this.role === 'student') {
                return;
            }
            const differences = JsDiff.diffWords(mainContent, secondContent);
            let added = 0;
            let removed = 0;
            let equal = 0;
            differences.forEach((difference) => {
                if (difference.added) {
                    added += difference.value.length;
                } else if (difference.removed) {
                    removed += difference.value.length;
                } else {
                    equal += difference.value.length;
                }
            });
            let result = (added + removed) / (added + removed + equal);
            if (Number.isNaN(result)) {
                result = 0;
            }
            return result;
        }
    }


    class CreatorApp extends App {
        constructor(room, id) {
            super(room, id, 'creator');
            this.users = {};
            this.assistants = [];
        }

        isLinked(pen) {
            if (this.indexOfPenInLinked(pen) !== -1) {
                return true;
            }
            for (let i = 0; i < this.assistants.length; i++) {
                const assistant = this.assistants[i];
                const assistantPens = this.users[assistant].pens;
                if (this.indexOfPenInLinked(pen, assistantPens) !== -1) {
                    return true;
                }
            }
            return false;
        }
    }


    // parser
    function startParsing(app) {
        const htmlAce = ace.edit('htmlPen');
        const cssAce = ace.edit('cssPen');
        const jsAce = ace.edit('jsPen');
        const htmlPen = document.querySelector('#htmlPen .ace_text-input');
        const cssPen = document.querySelector('#cssPen .ace_text-input');
        const jsPen = document.querySelector('#jsPen .ace_text-input');

        htmlAce.session.setMode('ace/mode/html');
        cssAce.session.setMode('ace/mode/css');
        jsAce.session.setMode('ace/mode/javascript');

        htmlAce.session.setUseSoftTabs(false);
        cssAce.session.setUseSoftTabs(false);
        jsAce.session.setUseSoftTabs(false);

        const theme = localStorage.website_theme;
        const aceTheme = colorsMap.aceThemes[theme];
        htmlAce.setTheme(`ace/theme/${aceTheme}`);
        cssAce.setTheme(`ace/theme/${aceTheme}`);
        jsAce.setTheme(`ace/theme/${aceTheme}`);

        setAceOptions([htmlAce, cssAce, jsAce]);

        htmlPen.onblur = renderIFrame(app);
        cssPen.onblur = renderIFrame(app);
        jsPen.onblur = renderIFrame(app);

        const timer = createTimer(app, 1000);

        htmlPen.onkeyup = handleKey(app, htmlAce, timer);
        cssPen.onkeyup = handleKey(app, cssAce, timer);
        jsPen.onkeyup = handleKey(app, jsAce, timer);

        htmlAce.on('paste', preventSpam());
        cssAce.on('paste', preventSpam());
        jsAce.on('paste', preventSpam());
    }

    function preventSpam() {
        let previousTimeStamp = 0;

        return function (data) {
            const timeStamp = data.event.timeStamp;
            if (data.text.length > 10000) {
                data.text = '';
            }
            if (timeStamp - previousTimeStamp < 1000) {
                data.text = '';
            } else {
                previousTimeStamp = timeStamp;
            }
        };
    }

    function handleKey(app, ace, timer) {
        return function () {
            timer();
            const mode = ace.session.getMode().$id.split('/').last();
            const value = ace.getValue();
            app.updateCurrentEditor(mode, value);
        };
    }

    function setAceOptions(aces) {
        aces.forEach((ace) => {
            ace.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true,
            });
        });
    }

    function createTimer(app, delay) {
        let timer;

        return function () {
            if (timer) {
                timer = clearTimeout(timer);
            }
            timer = setTimeout(renderIFrame(app), delay);
        };
    }

    function renderIFrame(app) {
        const htmlAce = ace.edit('htmlPen');
        const cssAce = ace.edit('cssPen');
        const jsAce = ace.edit('jsPen');
        const iFrame = document.getElementById('iFrame');

        return function () {
            if (app.currentPen === 0 && app.userID !== app.room.creator) {
                return;
            }
            const html = htmlAce.getValue();
            const css = cssAce.getValue();
            const js = jsAce.getValue();
            const positions = {
                html: htmlAce.getCursorPosition(),
                css: cssAce.getCursorPosition(),
                js: jsAce.getCursorPosition(),
            };

            const roomName = app.room.name;
            doJSONRequest('POST', `/preview/${roomName}`, {}, {
                name: app.getCurrentPen().title,
                penID: app.getCurrentPen().id,
                html,
                css,
                js,
            }).then(() => {
                iFrame.src = `/preview/${roomName}?penID=${app.getCurrentPen().id}`;
                if (app.room.creator === app.userID && app.currentPen === 0) {
                    socket.emit('pen.preview', { pen: app.publicPen, roomName, positions });
                } else if (app.room.creator === app.userID) {
                    socket.emit('pen.preview', { pen: app.getCurrentPen(), positions });
                } else {
                    socket.emit('pen.preview', {
                        pen: app.getCurrentPen(),
                        userID: app.room.creator,
                        moderators: `${roomName}_moderators`,
                    });
                }
            });
        };
    }
    init();
}());
