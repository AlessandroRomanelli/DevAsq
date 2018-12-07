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
            sharePublic.querySelector('.info').innerHTML = this.getCurrentPen().title;
            if (this.currentPen === 0) {
                sharePublic.classList.add('hidden');
            } else {
                sharePublic.classList.remove('hidden');
            }
        }
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

    indexOfLinkedInPens(pen) {
        if (!pen.link) {
            return -1;
        }
        let index = -1;
        for (let i = 0; i < this.pens.length; i++) {
            if (pen.link.penID === this.pens[i].id) {
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

        for (let i = 0; i < this.pens.length; i++) {
            const storedPen = this.pens[i];
            if (storedPen.link && storedPen.link.penID === pen.id) {
                storedPen.title = `${this.users[userID].user.username} - ${pen.title}`;
                storedPen.html = pen.html;
                storedPen.css = pen.css;
                storedPen.js = pen.js;

                const tab = document.getElementById(storedPen.id).querySelector('span');
                tab.innerText = storedPen.title;

                if (this.currentPen === i) {
                    this.changeViewContent();
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
    }

    updateUI() {
        const participants = document.getElementById('participants');
        participants.innerHTML = `${Object.keys(this.users).length + 1}`;
        const roomSettings = document.getElementById('room-settings');
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
        function findIDInUserPen(currentPenID, pens) {
            let index = -1;
            for (let i = 0; i < pens.length; i++) {
                if (pens[i].id === currentPenID) {
                    index = i;
                    break;
                }
            }
            return index;
        }
        const users = document.getElementById('users').childNodes;
        users.forEach((user) => {
            const preview = user.querySelector('img#preview-icon');
            const image = user.querySelector('img.user-icon');
            const sharePen = user.querySelector('button#share-pen');
            const loadPen = user.querySelector('button#load-pen');
            const id = user.id;
            const { pens } = this.users[id];
            image.onclick = ((event) => {
                if (this.users[id].ping) {
                    this.signalHelp(id);
                }
                socket.emit('pen.resolveHelp', { id });
            });
            sharePen.onclick = ((event) => {
                event.preventDefault();
                const index = findIDInUserPen(this.users[id].currentPen.id, pens);
                if (index === -1) {
                    return;
                }
                this.setPenContentIntoPen(pens[index], this.publicPen);
            });
            loadPen.onclick = ((event) => {
                event.preventDefault();
                const index = findIDInUserPen(this.users[id].currentPen.id, pens);
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

                const index = findIDInUserPen(this.users[id].currentPen.id, pens);
                if (index === -1) {
                    return;
                }
                modal.classList.toggle('hidden');
                iFrame.src = `/preview/${this.room.name}?penID=${pens[index].id}&userID=${id}`;
                shareModalPen.onclick = sharePen.onclick;
                loadModalPen.onclick = loadPen.onclick;
            });
        });
    }

    setPenContentIntoPen(pen, penToModify) {
        const iFrame = document.getElementById('iFrame');
        const roomName = this.room.name;
        ace.edit('htmlPen').setValue(pen.html);
        ace.edit('cssPen').setValue(pen.css);
        ace.edit('jsPen').setValue(pen.js);
        penToModify.html = pen.html;
        penToModify.css = pen.css;
        penToModify.js = pen.js;
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
        const sharePublic = document.getElementById('share-public');

        participants.innerHTML = '1';
        roomName.innerHTML = this.room.name;
        raiseHand.parentNode.removeChild(raiseHand);
        sharePublic.classList.add('hidden');
        sharePublic.onclick = ((event) => {
            this.setPenContentIntoPen(this.getCurrentPen(), app.publicPen);
        });

        this.setUpModalListeners();
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
