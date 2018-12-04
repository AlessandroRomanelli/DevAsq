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
        for (let i = 0; i < room.users[id].length; i++) {
            const pen = room.users[id][i];
            this.pens.push(Pen.createFromPen(pen));
        }
        this.setupTabsHandlers();
        this.switchPen(0);
    }

    switchPen(index) {
        this.currentPen = index;
        const html = ace.edit('htmlPen');
        const css = ace.edit('cssPen');
        const js = ace.edit('jsPen');
        const pen = this.pens[this.currentPen];
        html.setValue(pen.html);
        css.setValue(pen.css);
        js.setValue(pen.js);
        console.log(pen);
    }

    getCurrentPen() {
        return this.pens[this.currentPen];
    }

    createPen() {
        doJSONRequest('POST', `/room/${this.room.name}/pen`, {}, {})
            .then((res) => {
                const pen = new Pen(res.title, res.id);
                this.pens.push(pen);
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
        // socket.emit('pen.change', { pen });
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
            });
    }

    setupTabsHandlers() {
        const tabs = document.getElementById('tabs').childNodes;
        const iFrame = document.getElementById("iFrame");
        for (let i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener('click', (event) => {
                event.preventDefault();
                this.switchPen(i);
                iFrame.src = `/preview/${this.room.name}?penID=${this.pens[i].id}`;
            });
        }
    }
}
