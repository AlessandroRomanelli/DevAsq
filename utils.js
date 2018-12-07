const { Token } = require('./models');

function storeToken(uid, done) {
    return Token.create({ uid }).then(created => done(null, created._id))
        .catch(err => done(err, null));
}

function consumeToken(token, done) {
    return Token.findByIdAndDelete(token).then(found => done(null, found.uid))
        .catch(err => done(err, null));
}

module.exports = {
    storeToken,
    consumeToken,
};
