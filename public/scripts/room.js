class Pen {
    constructor(name) {
        this.html = '';
        this.css = '';
        this.js = '';
        this.title = name;
    }
}


class Room {
    constructor() {
        currentPen = null;
        pens = [];
    }
}
