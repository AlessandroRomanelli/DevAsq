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
        console.log("Switching from " + this.currentPen + " to " + index);
        const tabs = document.getElementById("tabs").childNodes;
        tabs[this.currentPen].className = "switchTab";
        tabs[index].className = "active switchTab";
        this.currentPen = index;
        const html = ace.edit('htmlPen');
        const css = ace.edit('cssPen');
        const js = ace.edit('jsPen');
        const pen = this.pens[this.currentPen];
        html.setValue(pen.html);
        css.setValue(pen.css);
        js.setValue(pen.js);
        console.log(pen);
        const iFrame = document.getElementById("iFrame");
        iFrame.src = `/preview/${this.room.name}?penID=${this.getCurrentPen().id}`;
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
                li.removeChild(li.lastChild);
            }
        });
    }

    createPen() {
        doJSONRequest('POST', `/room/${this.room.name}/pen`, {}, {})
        .then((res) => {
            const pen = new Pen(res.title, res.id);
            this.pens.push(pen);
            console.log(res);
            this.createTabForPen(res);
            this.setupTabsHandlers();
            this.switchPen(this.pens.length - 1);
        });
    }

    updatePen(mode, value) {
        const pen = this.pens[this.currentPen];
        switch (mode) {
        case 'html':
            pen.html = value;
            break;
        case 'css':
            pen.css = value;
            break;
        case 'js':
            pen.js = value;
            break;
        default:
            break;
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

                span.onblur = ((event) => {
                    event.target.contentEditable = false;
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
}
