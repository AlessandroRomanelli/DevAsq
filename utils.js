const fetch = require('node-fetch');
const { Token } = require('./models');

function storeToken(uid, done) {
    return Token.create({ uid }).then(created => done(null, created._id))
        .catch(err => done(err, null));
}

function consumeToken(token, done) {
    return Token.findByIdAndDelete(token).then((found) => {
        if (!found) return done(null, false);
        return done(null, found.uid);
    })
        .catch(err => done(err, null));
}


function doFetchRequest(method, url, headers, body) {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];

    if (arguments.length !== 4) { throw new Error(); }
    if (!(methods.includes(method))) { throw new Error(); }
    if ((method === 'POST' || method === 'PUT') && body !== null && typeof body !== 'string') { throw new Error(); }
    if (method === 'GET' && body !== undefined && body !== null) { throw new Error(); }

    const parameters = { method, headers };
    if (method === 'POST' || method === 'PUT') {
        parameters.body = body;
    }
    return fetch(url, parameters);
}

function doJSONRequest(method, url, headers, body) {
    if (arguments.length !== 4) { throw new Error(); }
    if (headers['Content-Type'] && headers['Content-Type'] !== 'application/json') { throw new Error(); }

    headers.Accept = 'application/json';
    if (method === 'POST' || method === 'PUT') {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(body);
    }

    return doFetchRequest(method, url, headers, body).then(result => result.json());
}

function parseHTML(html) {
    let parsedHtml = html.split('\n');
    parsedHtml.splice(3, 0, "<link rel='stylesheet' href='./style.css'/>");
    parsedHtml = parsedHtml.join('\n');
    parsedHtml = parsedHtml.split('</body>');
    parsedHtml[0] += '<script charset="utf-8" src="./app.js"></script>\n\t';
    parsedHtml = parsedHtml.join('</body>');
    console.log(parsedHtml);
    return parsedHtml;
}

module.exports = {
    storeToken,
    consumeToken,
    doFetchRequest,
    doJSONRequest,
    parseHTML,
};
