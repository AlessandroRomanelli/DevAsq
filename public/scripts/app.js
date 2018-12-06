class Pen {
    constructor(title, id, html, css, js) {
        this.id = id;
        this.title = title;
        this.html = html || '';
        this.css = css || '';
        this.js = js || '';
    }

    static createFromPen(pen) {
        return new Pen(pen.title, pen.id, pen.html, pen.css, pen.js);
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
        tabs[this.currentPen].classList.toggle('active');
        tabs[index].classList.toggle('active');
        this.currentPen = index;

        socket.emit('creator.switchPen', {
            roomName: this.room.name,
            id: this.userID,
            newPen: this.getCurrentPen(),
        });

        this.changeAcesContent();
    }

    changeAcesContent() {
        const html = ace.edit('htmlPen');
        const css = ace.edit('cssPen');
        const js = ace.edit('jsPen');
        const pen = this.getCurrentPen();
        html.setValue(pen.html);
        css.setValue(pen.css);
        js.setValue(pen.js);
        const iFrame = document.getElementById('iFrame');

        iFrame.src = `/preview/${this.room.name}?penID=${this.getCurrentPen().id}`;

        const permission = (this.room.creator === this.userID || this.currentPen !== 0);
        html.setReadOnly(!permission);
        css.setReadOnly(!permission);
        js.setReadOnly(!permission);
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
                li.classList.toggle('locked');
                li.removeChild(li.lastChild);
            }
        });
    }

    createPen() {
        const tabs = document.getElementById('tabs');
        const activeTabs = tabs.childNodes.length;
        if (activeTabs < 7) {
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
                });
        }
        if (activeTabs === 6) {
            tabs.lastChild.className = 'switchTab hidden';
        }
    }

    updateCurrentEditor(mode, value) {
        const pen = this.getCurrentPen();
        switch (mode) {
        case 'html':
            pen.html = value;
            break;
        case 'css':
            pen.css = value;
            break;
        case 'javascript':
            pen.js = value;
            break;
        default:
            break;
        }
        socket.emit('pen.change', { pen, roomName: this.room.name });
    }

    changeViewContent() {
        const pen = this.getCurrentPen();
        ace.edit('htmlPen').setValue(pen.html);
        ace.edit('cssPen').setValue(pen.css);
        ace.edit('jsPen').setValue(pen.js);
    }

    updatePen(pen) {
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
            this.changeViewContent();
        }
    }


    changePenName(name, index) {
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

    setupTabsHandlers() {
        const tabBar = document.getElementById('tabs');
        const tabs = tabBar.childNodes;
        const plusTab = tabBar.lastChild;

        for (let i = 0; i < tabs.length - 1; i++) {
            tabs[i].onclick = ((event) => {
                event.preventDefault();
                this.switchPen(i);
            });

            if (i !== 0) {
                const span = tabs[i].querySelector('span');
                const deleteBtn = tabs[i].querySelector('button');

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

                deleteBtn.onclick = ((event) => {
                    event.preventDefault();
                    this.deletePen(i);
                });
            }
        }

        plusTab.onclick = this.createPen.bind(this);
    }

    setupRoomInfo() {
        const participants = document.getElementById('participants');
        const roomName = document.getElementById('room-name');
        const raiseHand = document.getElementById('raise-hand');

        participants.parentNode.parentNode.removeChild(participants.parentNode);
        roomName.innerHTML = this.room.name;
        raiseHand.onclick = (() => {
            raiseHand.classList.toggle('asking-help');
            this.askForHelp();
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
}


class CreatorApp extends App {
    constructor(room, id) {
        super(room, id);
        this.users = {};
    }

    userConnected(user) {
        this.users[user._id] = {
            user,
            currentPen: this.publicPen,
            pens: [],
            ping: false,
        };
        this.updateUI();
    }

    updateUsers(userID, pen) {
        const { pens } = this.users[userID];
        for (let i = 0; i < pens.length; i++) {
            const storedPen = pens[i];
            if (storedPen.id === pen.id) {
                pens[i] = pen;
                console.log(pens);
                return;
            }
        }
        this.users[userID].pens.push(pen);
        console.log(pens);
    }

    updateUserCurrentPen(userID, newPen) {
        this.users[userID].currentPen = newPen;
        this.updateUI();
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
        console.log(this.users[userID]);
        pens.splice(index, 1);
        console.log(this.users[userID]);
    }

    signalHelp(id) {
        this.users[id].ping = !this.users[id].ping;
        document.getElementById(id).classList.toggle('help-needed');
    }

    updateUI() {
        const participants = document.getElementById('participants');
        participants.innerHTML = `${Object.keys(this.users).length + 1}`;
        const roomSettings = document.getElementById('room-settings');
        console.log(Object.values(this.users));
        dust.render('partials/creator', { users: Object.values(this.users) }, ((err, out) => {
            roomSettings.innerHTML = out;
            this.addTogglerListener();
            this.addUsersPing();
            this.addUsersListener();
        }));
    }

    addUsersPing() {
        for (const user in this.users) {
            if (this.users[user].ping) {
                this.signalHelp(user);
            }
        }
    }

    addUsersListener() {
        const users = document.getElementById('users').childNodes;
        users.forEach((user) => {
            const image = user.querySelector('img.user-icon');
            const signal = user.querySelector('.signal');
            const id = user.id;
            image.onclick = ((event) => {
                if (this.users[id].ping) {
                    this.signalHelp(id);
                }
            });
            signal.onclick = ((event) => {
                if (this.users[id].ping) {
                    this.signalHelp(id);
                }
            });
        });
    }

    addTogglerListener() {
        const roomSettings = document.getElementById('room-settings');
        const toggler = roomSettings.querySelector('.toggler');
        toggler.onclick = ((event) => {
            roomSettings.classList.toggle('hidden');
        });

        toggler.onmouseenter = ((event) => {
            document.body.style.cursor = 'pointer';
        });

        toggler.onmouseleave = ((event) => {
            document.body.style.cursor = 'default';
        });
    }

    setupRoomInfo() {
        const participants = document.getElementById('participants');
        const roomName = document.getElementById('room-name');
        const raiseHand = document.getElementById('raise-hand');

        participants.innerHTML = '1';
        roomName.innerHTML = this.room.name;
        raiseHand.parentNode.removeChild(raiseHand);
    }
}
