function startParsing() {
    const htmlAce = ace.edit('htmlPen');
    const cssAce = ace.edit('cssPen');
    const jsAce = ace.edit('jsPen');
    const htmlPen = document.querySelector('#htmlPen .ace_text-input');
    const cssPen = document.querySelector('#cssPen .ace_text-input');
    const jsPen = document.querySelector('#jsPen .ace_text-input');

    htmlAce.session.setMode('ace/mode/html');
    cssAce.session.setMode('ace/mode/css');
    jsAce.session.setMode('ace/mode/javascript');

    htmlAce.setTheme('ace/theme/monokai');
    cssAce.setTheme('ace/theme/monokai');
    jsAce.setTheme('ace/theme/monokai');

    setAceOptions([htmlAce, cssAce, jsAce]);

    htmlPen.onblur = renderIFrame;
    cssPen.onblur = renderIFrame;
    jsPen.onblur = renderIFrame;

    const timer = createTimer(1000);

    htmlPen.onkeypress = timer;
    cssPen.onkeypress = timer;
    jsPen.onkeypress = timer;
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

function createTimer(delay) {
    let timer;

    return function () {
        if (timer) {
            timer = clearTimeout(timer);
        }
        timer = setTimeout(renderIFrame, delay);
    };
}

function renderIFrame() {
    const html = ace.edit('htmlPen').getValue();
    const css = ace.edit('cssPen').getValue();
    const js = ace.edit('jsPen').getValue();
    const iFrame = document.getElementById('iFrame');
    let roomName = window.location.pathname.split('/');
    roomName = roomName[roomName.length - 1];
    doJSONRequest('POST', `/preview/${roomName}`, {}, {
        name: 'public',
        html,
        css,
        js,
    }).then(() => {
        // TODO: Add a query to the get request to fetch the currently selected pen
        iFrame.src = `/preview/${roomName}`;
    });
}
