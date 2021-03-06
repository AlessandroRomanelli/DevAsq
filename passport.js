const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const TokenStrategy = require('passport-remember-me').Strategy;
const bcrypt = require('bcrypt');
const { consumeToken, storeToken } = require('./utils');
const config = require('./config');

const { User } = require('./models');

// Local strategy
passport.use(new LocalStrategy(
    ((username, password, done) => {
        User.findOne({ username }, (err, user) => {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return bcrypt.compare(password, user.password).then((validPassword) => {
                if (validPassword) {
                    return done(null, user);
                }
                return done(null, false);
            });
        });
    }),
));

passport.use(new TokenStrategy(
    (token, done) => {
        consumeToken(token, (err, uid) => {
            if (err) { return done(err); }
            if (!uid) { return done(null, false); }

            User.findById(uid, (err, user) => {
                if (err) return done(err);
                if (!user) return done(null, false);
                console.log('Logged with token!');
                return done(null, user);
            });
        });
    },
    storeToken,
));

// GitHub Strategy setup
passport.use(new GitHubStrategy({
    clientID: config.GIT_CLIENT_ID,
    clientSecret: config.GIT_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/login/github/callback',
},
((accessToken, refreshToken, profile, done) => {
    // Get the information out of profile object
    const {
        id, username, profileUrl, emails,
    } = profile;
    // Transform emails into array of strings
    if (emails) {
        emails.forEach((email, i) => {
            emails[i] = email.value;
        });
    }
    // Look for a user in the database with the provided GitHubID
    User.findOne({ githubID: id }).then((user) => {
        // If it doesn't exist an entry
        if (user === null) {
            // Create a new user
            // Generate a random password (users won't need it anyway)
            const password = Math.random().toString(16).slice(2);
            // Encrpyt it and use the obtained hash to create a new user
            bcrypt.hash(password, config.SALT_ROUNDS).then(hash => User.create({
                githubID: id,
                githubUrl: profileUrl,
                emails,
                username,
                password: hash,
                githubAccessToken: accessToken,
                githubRefreshToken: refreshToken,
            })).then((created) => {
                // Return the created new user
                console.log('Created a new user');
                console.log(created);
                done(null, created);
            });
        } else {
            user.githubAccessToken = accessToken;
            user.githubRefreshToken = refreshToken;
            user.save().then((user) => {
                // Return the found user
                done(null, user);
            });
        }
    }).catch(err => done(err, null));
})));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

module.exports = passport;
