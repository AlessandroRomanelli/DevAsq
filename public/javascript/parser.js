function init() {
    const htmlTextArea = document.getElementById("htmlTextArea");
    const cssTextArea = document.getElementById("cssTextArea");
    const javascriptTextArea = document.getElementById("javascriptTextArea");
    const iframe = document.getElementById("iframe");

    function listener(event) {
        doJSONRequest("POST", "/preview", {}, {
            html: htmlTextArea.value,
            css: cssTextArea.value,
            javascript: javascriptTextArea.value
        }).then((response) => {
            iframe.src = "/preview";
        })
    }

    htmlTextArea.addEventListener("blur", listener);
    cssTextArea.addEventListener("blur", listener);
    javascriptTextArea.addEventListener("blur", listener);
}