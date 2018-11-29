function startParsing() {
    const htmlAce = ace.edit("htmlPen");
    const cssAce = ace.edit("cssPen");
    const jsAce = ace.edit("jsPen");
    const htmlPen = document.querySelector("#htmlPen .ace_text-input");
    const cssPen = document.querySelector("#cssPen .ace_text-input");
    const jsPen = document.querySelector("#jsPen .ace_text-input");

    htmlAce.session.setMode("ace/mode/html");
    cssAce.session.setMode("ace/mode/css");
    jsAce.session.setMode("ace/mode/javascript");

    htmlPen.onblur = renderIFrame;
    cssPen.onblur = renderIFrame;
    jsPen.onblur = renderIFrame;

    const timer = createTimer(1000);

    htmlPen.onkeypress = timer;
    cssPen.onkeypress = timer;
    jsPen.onkeypress = timer;

}

function createTimer(delay) {
    let timer;

    return function () {
        if (timer) {
            timer = clearTimeout(timer);
        }
        timer = setTimeout(renderIFrame, delay);
    }
}

function renderIFrame() {
    const htmlText = document.querySelector("#htmlPen .ace_scroller").innerText;
    const cssText = document.querySelector("#cssPen .ace_scroller").innerText;
    const jsText= document.querySelector("#jsPen .ace_scroller").innerText;
    const iFrame = document.getElementById("iFrame");

    doJSONRequest("PUT", "/preview", {}, {
        html: htmlText,
        css: cssText,
        js: jsText
    }).then(() => {
        iFrame.src = "/preview";
    })
}