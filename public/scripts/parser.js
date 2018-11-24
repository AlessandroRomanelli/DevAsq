function startParsing() {
    const htmlPen = document.getElementById("htmlPen");
    const cssPen = document.getElementById("cssPen");
    const jsPen = document.getElementById("jsPen");
    const iframe = document.getElementById("iframe");

    let indentations = {htmlPen: 0, cssPen: 0, javascriptPen: 0};

    function renderIframe() {
        doJSONRequest("PUT", "/preview", {}, {
            html: htmlPen.value,
            css: cssPen.value,
            js: jsPen.value
        }).then(() => {
            iframe.src = "/preview";
        })
    }

    const timerListener = createTimer(renderIframe, 2500, indentations);

    htmlPen.addEventListener("keydown", timerListener);
    cssPen.addEventListener("keydown", timerListener);
    jsPen.addEventListener("keydown", timerListener);

    htmlPen.addEventListener("blur", renderIframe);
    cssPen.addEventListener("blur", renderIframe);
    jsPen.addEventListener("blur", renderIframe);
}

function createTimer(callback, delay, indentations) {
    let timer;

    return function (event) {
        if (event.which === 9) {
            event.preventDefault();
            event.target.value = event.target.value + "\t";
        } else if (event.which === 13) {
            event.preventDefault();
            const indentation = indentations[event.target.id];
            event.target.value = event.target.value + "\n" + ("\t".repeat(indentation));
        }
        if (timer) {
            timer = clearTimeout(timer)
        }
        timer = setTimeout(callback, delay);
    }
}