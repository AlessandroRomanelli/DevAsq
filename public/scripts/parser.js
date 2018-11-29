function startParsing() {
    const htmlPen = ace.edit("htmlPen");
    const cssPen = ace.edit("cssPen");
    const jsPen = ace.edit("jsPen");
    // const iFrame = document.getElementById("iFrame");


    // function renderIFrame() {
        // doJSONRequest("PUT", "/preview", {}, {
        //     html: htmlPen.value,
        //     css: cssPen.value,
        //     js: jsPen.value
        // }).then(() => {
        //     iFrame.src = "/preview";
        // })
    // }


    // const timerListener = createTimer(renderIFrame, 2000);
    //
    // htmlPen.onkeydown = timerListener;
    // cssPen.onkeydown = timerListener;
    // jsPen.onkeydown = timerListener;
    //
    // htmlPen.onblur = renderIFrame;
    // cssPen.onblur = renderIFrame;
    // jsPen.onblur = renderIFrame;

    // setInterval(() => {
    //     console.log(getCaretPosition(htmlPen));
    // }, 1000);
}

// function getCaretPosition(target) {
//     const range = document.getSelection().getRangeAt(0);
//     const cloned = range.cloneRange();
//     cloned.selectNodeContents(target);
//     cloned.setEnd(range.endContainer, range.endOffset);
//     console.log("-----------------------------------------------------")
//     console.dir(cloned);
//     console.log(cloned.toString());
//     let result = (cloned.toString()).length;
//     return result
// }
//
//
// function setCaretPosition(target, position) {
//     let node;
//     const nodes = [];
//     const walk = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null, false);
//     while (node = walk.nextNode()) {
//         nodes.push(node);
//     }
//
//     for (let i = 0; i < nodes.length; i++) {
//         if (position > nodes[i].nodeValue.length && nodes[i+1]) {
//             position -= nodes[i].nodeValue.length;
//         } else {
//             node = nodes[i];
//             break;
//         }
//     }
//
//     const selection = window.getSelection();
//     const range = document.createRange();
//     range.setStart(node, position);
//     range.collapse(true);
//     selection.removeAllRanges();
//     selection.addRange(range);
// }
//
// function adjustCaretPosition(target, amount) {
//     const currentPosition = getCaretPosition(target);
//     setCaretPosition(target, currentPosition + amount);
//
// }
//
// function createTimer(callback, delay) {
//     let timer;
//
//     return function (event) {
//         const target = event.target;
//
//         // console.log("BEFORE"+ getCaretPosition(target));
//         if (event.key === "Tab") {
//             event.preventDefault();
//             const tabular = document.createElement("span");
//             tabular.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;";
//             target.appendChild(tabular);
//             adjustCaretPosition(target, 4);
//
//         } else if (event.key === " ") {
//             event.preventDefault();
//             const tabular = document.createElement("span");
//             tabular.innerHTML = "&nbsp;";
//             target.appendChild(tabular);
//             adjustCaretPosition(target, 1);
//
//         } else if (event.key.length === 1) {
//             event.preventDefault();
//             let text;
//             if (target.lastChild) {
//                 const child = target.lastChild;
//                 if (child.innerHTML !== "" && child.innerHTML !== "&nbsp;&nbsp;&nbsp;&nbsp;" && child.innerHTML !== "&nbsp;") {
//                     text = child;
//                 }
//             }
//             if (!text) {text = document.createElement("span");}
//             text.innerHTML = text.innerHTML + event.key;
//             target.appendChild(text);
//             adjustCaretPosition(target, 1);
//         }
//
//         // console.log("AFTER "+ getCaretPosition(target));
//
//         if (timer) {
//             timer = clearTimeout(timer)
//         }
//         timer = setTimeout(callback, delay);
//     }
// }
//
// function fixAllIndentations(event, cursor) {
//     event.preventDefault();
//     const add = !event.shiftKey;
//     let value = event.target.value;
//     let first = 0;
//     let deleted = 0;
//     let firstDeleted = 0;
//
//     const lineStarts = [];
//     for (let i = cursor.start; i < cursor.end; i++) {
//         if (value[i] === "\n") {
//             lineStarts.push(i + 1);
//         }
//     }
//     for (let i = cursor.start; i >= 0; i--) {
//         if (value[i] === "\n" && i + 1 !== lineStarts.first()) {
//             first = i + 1;
//             break;
//         }
//     }
//     lineStarts.unshift(first);
//     for (let i = lineStarts.length - 1; i >= 0; i--) {
//         if (add) {
//             value = value.splice(lineStarts[i], 0, "\t");
//         } else if (value[lineStarts[i]] === "\t") {
//             value = value.splice(lineStarts[i], 1, "");
//             deleted++;
//             if (i === 0) {
//                 firstDeleted = 1;
//             }
//         }
//     }
//     event.target.value = value;
//     if (add) {
//         event.target.selectionStart = cursor.start + 1;
//         event.target.selectionEnd = cursor.end + lineStarts.length;
//     } else {
//         event.target.selectionStart = cursor.start - firstDeleted;
//         event.target.selectionEnd = cursor.end - deleted;
//     }
// }
//
// function backspace(event, cursor, relations) {
//     const previous = event.target.value[cursor.start - 1];
//     const following = event.target.value[cursor.start];
//     if (relations[previous] === following) {
//         event.preventDefault();
//         event.target.value = event.target.value.splice(cursor.start - 1, 2, "");
//         fixPosition(event.target, cursor, -1);
//     }
// }
//
// function newLine(event, cursor) {
//     const relations = {">": "<", "{": "}", "[": "]", "(": ")"};
//     const previous = event.target.value[cursor.start - 1];
//     const following = event.target.value[cursor.start];
//     const indentation = findIndentation(event.target.value, cursor);
//
//     insertSpecialCharacter(event, cursor, `\n${"\t".repeat(indentation)}`);
//     fixPosition(event.target, cursor, indentation);
//
//     const previousTag = findTag(event.target.value, cursor);
//     if (previousTag !== "</>") {
//         if (relations[previous] === following && following) {
//             insertSpecialCharacter(event, cursor, `\t\n${"\t".repeat(indentation)}`);
//         } else if (relations[previous] && (previous !== ">" || previousTag !== "")) {
//             insertSpecialCharacter(event, cursor, "\t");
//         }
//     }
// }
//
// function findIndentation(value, cursor) {
//     const start = cursor.start;
//     let indentation = 0;
//
//     for (let i = start - 1; i >= 0; i--) {
//         if (value[i] === "\n" || i === 0) {
//             if (value[i] === "\t") {
//                 indentation++;
//             }
//             return indentation;
//         } else if (value[i] === "\t") {
//             indentation++;
//         } else {
//             indentation = 0;
//         }
//     }
//     return 0;
// }
//
// function insertSpecialCharacter(event, cursor, value) {
//     const start = cursor.start;
//     const end = cursor.end;
//     event.preventDefault();
//     event.target.value = event.target.value.splice(start, end - start, value);
//     fixPosition(event.target, cursor, 1);
// }
//
// function fixPosition(dom, cursor, amount) {
//     cursor.start += amount;
//     cursor.end += amount;
//     dom.selectionStart = dom.selectionEnd = cursor.start;
// }
//
// function findTag(value, cursor) {
//     const regex = new RegExp(/^[a-z0-9]+$/i);
//     const start = cursor.start - 1;
//     let buffer = "";
//
//     for (let i = start; i >= 0; i--) {
//         if (value[i] === "<") {
//             return closureTag(buffer);
//         } else if (regex.test(value[i])) {
//             buffer = value[i] + buffer;
//         }
//         else {
//             buffer = "";
//         }
//     }
//     return "";
// }
//
// function closureTag(tag) {
//     const tagsWithoutClosure = [
//         "area", "base", "br", "col", "source", "embed", "command", "img",
//         "link", "meta", "hr", "wbr", "keygen", "input", "param",  "track"
//     ];
//     return tagsWithoutClosure.includes(tag) ? "" : `</${tag}>`;
// }