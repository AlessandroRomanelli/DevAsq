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
            const pen = room.users[id][i];
            this.createTabForPen(pen);
            this.pens.push(Pen.createFromPen(pen));
        }
        this.setupTabsHandlers();
        this.switchPen(0);
    }

    switchPen(index) {
        const tabs = document.getElementById("tabs").childNodes;
        tabs[this.currentPen].classList.toggle("active");
        tabs[index].classList.toggle("active");
        this.currentPen = index;

       this.changeAcesContent();
    }

    changeAcesContent() {
        this.changeViewContent();

        const iFrame = document.getElementById("iFrame");
        iFrame.src = `/preview/${this.room.name}?penID=${this.getCurrentPen().id}`;

        const permission = (this.room.creator === this.userID || this.currentPen !== 0);
        ace.edit('htmlPen').setReadOnly(!permission);
        ace.edit('cssPen').setReadOnly(!permission);
        ace.edit('jsPen').setReadOnly(!permission);
    }

    getCurrentPen() {
        return this.pens[this.currentPen];
    }

    createTabForPen(pen) {
        dust.render("partials/tab", {pen}, function (err, out) {
            let li = document.createElement("li");
            const nodes = document.getElementById("tabs");
            nodes.insertBefore(li, nodes.childNodes[nodes.childNodes.length - 1]);
            li.outerHTML = out;
            if (pen.title === "Public") {
                li = nodes.childNodes[nodes.childNodes.length - 2];
                li.classList.toggle("active");
                li.classList.toggle("locked");
                li.removeChild(li.lastChild);
            }
        });
    }

    createPen() {
        const tabs = document.getElementById("tabs");
        const activeTabs = tabs.childNodes.length;
        if (activeTabs < 7) {
            doJSONRequest('POST', `/room/${this.room.name}/pen`, {}, {})
            .then((res) => {
                const pen = new Pen(res.title, res.id);
                this.pens.push(pen);
                this.createTabForPen(res);
                this.setupTabsHandlers();
                this.switchPen(this.pens.length - 1);
            });
        }
        if (activeTabs === 6) {
            tabs.lastChild.className = "switchTab hidden";
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
        });
    }

    deletePen(index) {
        if (index === 0 || index >= this.pens.length) {
            return;
        }

        const penID = this.pens[index].id;
        doFetchRequest('DELETE', `/room/${this.room.name}/pen/${penID}`, {}, {})
        .then((res) => {
            this.pens.splice(index, 1);
            if (index === this.currentPen) {
                this.switchPen(index - 1);
            }
            const tabs = document.getElementById("tabs");
            tabs.removeChild(tabs.childNodes[index]);
            tabs.lastChild.className = "switchTab";
            this.setupTabsHandlers();
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
                const span = tabs[i].querySelector("span");
                const deleteBtn = tabs[i].querySelector("button");

                span.ondblclick = ((event) => {
                    event.target.contentEditable = true;
                    event.target.focus();
                });

                span.onkeydown = ((event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        event.target.blur();
                    }
                });

                span.onblur = ((event) => {
                    event.target.contentEditable = false;
                    if (event.target.innerHTML === "Public") {
                        event.target.innerHTML = "MyPublic";
                    }
                    this.changePenName(event.target.innerHTML, i);
                });

                deleteBtn.onclick = ((event) => {
                    event.preventDefault();
                    this.deletePen(i);
                })
            }
        }

        plusTab.onclick = this.createPen.bind(this);
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
