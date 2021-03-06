const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');
const kleiDust = require('klei-dust');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const config = require('./config');

const index = require('./routes/index');
const users = require('./routes/users');
const room = require('./routes/room');
const preview = require('./routes/preview');
const pen = require('./routes/pen');

const app = express();

require('./models');

// view engine setup
kleiDust.setOptions({ useHelpers: true });
app.set('views', `${__dirname}/views`);
app.engine('dust', kleiDust.dust);
app.set('view engine', 'dust');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true,
}));

app.use(session({
    secret: 'dreamteam',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));

mongoose.connect(config.MONGODB_URL + config.MONGODB_DBNAME, { useNewUrlParser: true });

app.use(express.static(path.join(__dirname, 'public')));

// Setting up passport
require('./passport');

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));

app.use('/', index);
app.use('/', users);
app.use('/room', room);
app.use('/preview', preview);
app.use('/pen', pen);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
