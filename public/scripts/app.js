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
    constructor(room, id) {
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
            // sharePublic.querySelector('.info').innerHTML = this.getCurrentPen().title;
            if (this.currentPen === 0) {
                sharePublic.classList.add('hidden');
            } else {
                sharePublic.classList.remove('hidden');
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
            console.log(tab);
            if (!tab.classList.contains('locked')) {
                htmlAce.setReadOnly(false);
                cssAce.setReadOnly(false);
                jsAce.setReadOnly(false);
            }
        }

        const pen = this.getCurrentPen();
        let userPen;
        console.log(pen);
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
                console.log('BREAKING');
                return;
            }
            differenceLength = value.length - pen.html.length;
            differenceRows -= this.countLines(pen.html);
            pen.html = value;
            if (userPen) { userPen.html = value; }
            break;
        case 'css':
            if (cssAce.getReadOnly()) {
                console.log('BREAKING');
                return;
            }
            differenceLength = value.length - pen.css.length;
            differenceRows -= this.countLines(pen.css);
            pen.css = value;
            if (userPen) { userPen.css = value; }
            break;
        case 'javascript':
            if (jsAce.getReadOnly()) {
                console.log('BREAKING');
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

    resolveHelp() {
        const raiseHand = document.getElementById('raise-hand');
        raiseHand.classList.remove('asking-help');
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
            if (!(this instanceof CreatorApp) || !(this.pens[i].link)) {
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
        const participants = document.getElementById('participants');
        const roomName = document.getElementById('room-name');
        const raiseHand = document.getElementById('raise-hand');
        const sharePublic = document.getElementById('share-public');
        const modal = document.getElementById('preview-modal');

        participants.parentNode.parentNode.removeChild(participants.parentNode);
        roomName.innerHTML = this.room.name;
        raiseHand.onclick = (() => {
            raiseHand.classList.toggle('asking-help');
            this.askForHelp();
        });
        sharePublic.parentNode.removeChild(sharePublic);
        modal.parentNode.removeChild(modal);

        this.setUpLayout();
    }

    setUpLayout() {
        const leftLayout = document.getElementById('leftLayout');
        const centerLayout = document.getElementById('centerLayout');
        const rightLayout = document.getElementById('rightLayout');
        const pens = document.getElementById('pens');

        leftLayout.addEventListener('click', () => {
            console.log('calledLeft');
            pens.classList.add('leftLayout');
            pens.classList.remove('centerLayout');
            pens.classList.remove('rightLayout');
        });
        centerLayout.addEventListener('click', () => {
            console.log('calledCenter');
            pens.classList.remove('leftLayout');
            pens.classList.add('centerLayout');
            pens.classList.remove('rightLayout');
        });
        rightLayout.addEventListener('click', () => {
            console.log('calledRight');
            pens.classList.remove('leftLayout');
            pens.classList.remove('centerLayout');
            pens.classList.add('rightLayout');
        });

        pens.querySelector('div').childNodes.forEach((pen) => {
           const btns = pen.querySelectorAll('button');
           btns[0].addEventListener('click', (event) => {
               event.target.parentNode.parentNode.classList.add('max');
               event.target.parentNode.parentNode.classList.remove('min');
               pens.querySelector('div').childNodes.forEach((checkPen) => {
                   if (checkPen !== pen) {
                       checkPen.classList.remove('max');
                       checkPen.classList.add('min');
                   }
               });
           });
           btns[1].addEventListener('click', (event) => {
               event.target.parentNode.parentNode.classList.remove('max');
               event.target.parentNode.parentNode.classList.add('min');
           });
           btns[2].addEventListener('click', (event) => {
               event.target.parentNode.parentNode.classList.remove('max');
               event.target.parentNode.parentNode.classList.remove('min');
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

    indexOfPenInLinked(pen) {
        let index = -1;
        for (let i = 0; i < this.pens.length; i++) {
            if (this.pens[i].link && this.pens[i].link.penID === pen.id) {
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
}


class CreatorApp extends App {
    constructor(room, id) {
        super(room, id);
        this.users = {};
    }

    userConnected(user) {
        console.log('User: ', user._id, ' joined the room');
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
    }

    userDisconnected(user) {
        console.log('User: ', user, ' left the room');
        console.log(this.room.users);
        // delete this.users[user];
        if (this.users[user].state !== 'banned') {
            this.users[user].state = 'disconnected';
        }
        console.log(this.room.users);
        socket.emit('homePage.updatePopulation', {
            roomName: this.room.name,
            population: `${Object.values(this.countActive()).length}`,
        });

        document.getElementById(user).outerHTML = '';

        this.updateUI();
    }

    updateUsers(userID, pen, positions, difference, rows) {
        const { pens } = this.users[userID];

        for (let i = 0; i < this.pens.length; i++) {
            const storedPen = this.pens[i];
            if (storedPen.link && storedPen.link.penID === pen.id) {
                storedPen.title = `${this.users[userID].user.username} - ${pen.title}`;
                storedPen.html = pen.html;
                storedPen.css = pen.css;
                storedPen.js = pen.js;

                const tab = document.getElementById(storedPen.id).querySelector('span');
                // const sharePublic = document.getElementById('share-public');
                tab.innerText = storedPen.title;
                // sharePublic.querySelector('.info').innerHTML = storedPen.title;

                if (this.currentPen === i) {
                    this.changeViewContent(positions, difference, rows);
                }
            }
        }

        for (let i = 0; i < pens.length; i++) {
            const storedPen = pens[i];
            if (storedPen.id === pen.id) {
                pens[i] = pen;
                return;
            }
        }
        this.users[userID].pens.push(pen);
    }

    updateUserCurrentPen(userID, newPen) {
        const oldPen = this.users[userID].currentPen;
        this.users[userID].currentPen = newPen;
        this.updateUserUI(userID, newPen, oldPen);
        // this.updateUI();
    }


    updateUserUI(id, newPen, oldPen) {
        console.log(this.users[id]);
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
            } else {
                index = this.findIDInUserPen(newPen.id, this.users[id].pens);
            }

            console.log('index', index);

            userDiv = document.getElementById(id);
            userDiv.querySelector('select').options.selectedIndex = index + 1;
            if (this.users[id].ping) {
                userDiv.classList.add('help-needed');
            }
            this.addSingleUserListener(id);
        });
    }

    removeUserPen(userID, pen) {
        const { pens } = this.users[userID];
        let index = -1;
        for (let i = 0; i < pens.length; i++) {
            if (pens[i].id === pen.id) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            return;
        }

        pens.splice(index, 1);

        index = this.indexOfPenInLinked(pen);

        while (index !== -1) {
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

    signalHelp(id) {
        this.users[id].ping = !this.users[id].ping;
        document.getElementById(id).classList.toggle('help-needed');
        this.updateRoomSettings();
    }

    countActive() {
        const connectedUsers = {};
        for (const key in this.users) {
            if (this.users[key].state === 'connected') {
                connectedUsers[key] = this.users[key];
            }
        }
        return connectedUsers;
    }

    updateParticipantsCounter() {
        const participants = document.getElementById('participants');
        const connectedUsers = this.countActive();
        const count = Object.values(connectedUsers).length;
        console.log("Count", count);
        participants.innerHTML = `${count}`;
        return connectedUsers;
    }

    updateUI() {
        const connectedUsers = this.updateParticipantsCounter();
        for (const key in connectedUsers) {
            this.updateUserUI(key, this.users[key].currentPen);
        }
        this.updateRoomSettings();
    }

    updateRoomSettings() {
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
        let index = -1;
        for (let i = 0; i < pens.length; i++) {
            if (`${pens[i].id}` === `${currentPenID}`) {
                index = i;
                break;
            }
        }
        return index;
    }

    addSingleUserListener(userID) {
        const roomSettings = document.getElementById('room-settings');
        const user = document.getElementById(userID);
        const preview = user.querySelector('img#preview-icon');
        const image = user.querySelector('img.user-icon');
        const kickBanMenu = user.querySelector('.user-remove');
        const kick = user.querySelector('.kick');
        const ban = user.querySelector('.ban');
        const sharePen = user.querySelector('button#share-pen');
        const loadPen = user.querySelector('button#load-pen');
        const select = document.querySelector('select');
        const id = user.id;
        const { pens } = this.users[id];

        image.onclick = ((event) => {
            if (this.users[id].ping) {
                this.signalHelp(id);
            }
            socket.emit('pen.resolveHelp', { id });
        });
        kickBanMenu.onclick = ((event) => {
            kickBanMenu.classList.toggle('open');
        });
        roomSettings.addEventListener('click', (event) => {
            console.log('Clicking content');
            const kickBanMenu = document.getElementById(userID).querySelector('.user-remove');
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
                    console.log('sending kick request', id);
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
                    this.users[id].state = 'banned';
                    socket.emit('user.kick', { userID: id });
                }),
                (() => {
                    const modal = document.getElementById('confirm-modal');
                    modal.classList.toggle('hidden');
                }));
        });
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
        loadPen.onclick = ((event) => {
            event.preventDefault();
            // const index = findIDInUserPen(this.users[id].currentPen.id, pens);
            let selectedPen = select.selectedOptions[0].id;
            if (selectedPen === '') {
                selectedPen = this.publicPen.id;
            }
            const index = this.findIDInUserPen(selectedPen, pens);
            if (index === -1 || this.indexOfPenInLinked(pens[index]) !== -1) {
                return;
            }
            this.loadRemotePen(pens[index], id);
        });
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
            shareModalPen.onclick = sharePen.onclick;
            loadModalPen.onclick = loadPen.onclick;
        });
    }

    setModalContent(message, confirmListener, cancelListener) {
        const modal = document.getElementById('confirm-modal');
        const paragraph = modal.querySelector('p');
        const confirm = modal.querySelector('.confirm');
        const cancel = modal.querySelector('.cancel');
        modal.classList.toggle('hidden');

        paragraph.innerHTML = `Are you sure you want to ${message}?`;
        confirm.onclick = confirmListener;
        cancel.onclick = cancelListener;
    }

    setPenContentIntoPen(pen, penToModify, options) {
        const iFrame = document.getElementById('iFrame');
        const roomName = this.room.name;
        if (this.getCurrentPen().id === penToModify.id) {
            if (options) {
                console.log(options);
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
            }));
        });
    }

    addTogglerListener() {
        const roomSettings = document.getElementById('room-settings');
        const toggler = roomSettings.querySelector('.toggler');
        const content = document.getElementById('content');

        content.addEventListener('click', () => {
            if (!(roomSettings.classList.contains('hidden'))) {
                roomSettings.classList.add('hidden');
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

    decodeSharingOptions(code) {
        const html = [1, 3, 5, 7].includes(code);
        const css = [2, 3, 6, 7].includes(code);
        const js = [4, 5, 6, 7].includes(code);
        return { html, css, js };
    }

    handleShareOptions(checkboxs) {
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
                updateShare();
            });
        }
    }

    setupRoomInfo() {
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
        content.addEventListener('click', (event) => {
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
        this.setUpLayout();
    }

    setUpModalListeners() {
        const modal = document.getElementById('preview-modal');
        const closeModal = document.getElementById('close-modal');
        const sharePen = document.getElementById('modal-share');
        const loadPen = document.getElementById('modal-load');
        closeModal.onclick = ((event) => {
            event.preventDefault();
            modal.classList.toggle('hidden');
            sharePen.onclick = null;
            loadPen.onclick = null;
        });
    }
}
