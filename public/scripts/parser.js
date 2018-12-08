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

    htmlAce.setTheme('ace/theme/monokai');
    cssAce.setTheme('ace/theme/monokai');
    jsAce.setTheme('ace/theme/monokai');

    setAceOptions([htmlAce, cssAce, jsAce]);

    htmlPen.onblur = renderIFrame(app);
    cssPen.onblur = renderIFrame(app);
    jsPen.onblur = renderIFrame(app);

    const timer = createTimer(app, 1000);

    htmlPen.onkeyup = handleKey(app, htmlAce, timer);
    cssPen.onkeyup = handleKey(app, cssAce, timer);
    jsPen.onkeyup = handleKey(app, jsAce, timer);

    htmlAce.on("paste", preventSpam());
    cssAce.on("paste", preventSpam());
    jsAce.on("paste", preventSpam());
}

function preventSpam() {
    let previousTimeStamp = 0;

    return function (data) {
        const timeStamp = data.event.timeStamp;
        if (data.text.length > 2500) {
            data.text = "";
        }
        if (timeStamp - previousTimeStamp < 1000) {
            data.text = "";
        } else {
            previousTimeStamp = timeStamp;
        }
    }
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
    const htmlAce = ace.edit("htmlPen");
    const cssAce = ace.edit("cssPen");
    const jsAce = ace.edit("jsPen");
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
            js: jsAce.getCursorPosition()
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
            // if (app.room.creator === app.userID && app.currentPen === 0) {
            //     socket.emit('pen.preview', { pen: app.publicPen, roomName, positions });
            // } else if (app.room.creator === app.userID) {
            //     socket.emit('pen.preview', { pen: app.getCurrentPen(), positions });
            // } else {
            //     socket.emit('pen.preview', { pen: app.getCurrentPen(), userID: app.room.creator });
            // }
        });
    };
}
