String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

Array.prototype.first = function () {
    return this[0];
};

Array.prototype.last = function () {
    return this[this.length - 1];
};

function handleLogout() {
    const logout = document.getElementById('logout');
    if (!logout) return;
    logout.addEventListener('click', (event) => {
        event.preventDefault();
        doFetchRequest('POST', '/logout', {}, '').then((res) => {
            if (res.status === 200) {
                dust.render('partials/loggedUser', {}, (err, output) => {
                    const profileNav = document.querySelector('.profile');
                    profileNav.innerHTML = output;
                    handleLoginForm();
                });
            }
        });
    });
}

function handleSignupForm() {
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = event.target[1].value;
        const password = event.target[3].value;
        const confirmPassword = event.target[5].value;
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
        } else {
            doFetchRequest('POST', '/signup', {
                'Content-Type': 'application/json',
            }, JSON.stringify({
                username,
                password,
            })).then((res) => {
                if (res.status === 201) {
                    return doFetchRequest('POST', '/login', {
                        'Content-Type': 'application/json',
                    }, JSON.stringify({
                        username,
                        password,
                    }));
                }
            }).then((res) => {
                if (res.status === 200) {
                    return res.json();
                }
            }).then((user) => {
                if (user) {
                    dust.render('partials/loggedUser', { loggedUser: user }, (err, output) => {
                        const profileNav = document.querySelector('.profile');
                        profileNav.innerHTML = output;
                        handleLogout();
                    });
                }
            });
        }
    });

    const loginButton = document.getElementById('loginButton');
    loginButton.addEventListener('click', (event) => {
        event.preventDefault();
        dust.render('partials/loginForm', {}, (err, output) => {
            if (signupForm.parentNode) {
                signupForm.parentNode.innerHTML = output;
                handleLoginForm();
            }
        });
    });
}

function handleLoginForm() {
    const loginButton = document.getElementById('login');
    if (!loginButton) return;
    loginButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.target.nextSibling.classList.toggle('hidden');
    });
    const githubLogin = document.getElementById('githubLogin');
    githubLogin.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.pathname = '/login/github';
    });
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = event.target[1].value;
        const password = event.target[3].value;
        doFetchRequest('POST', '/login', {
            'Content-Type': 'application/json',
        }, JSON.stringify({
            username,
            password,
        })).then((res) => {
            if (res.status === 401) {
                alert('Invalid Login');
            } else if (res.status === 200) {
                return res.json();
            }
        }).then((user) => {
            if (user) {
                dust.render('partials/loggedUser', { loggedUser: user }, (err, output) => {
                    const profileNav = document.querySelector('.profile');
                    profileNav.innerHTML = output;
                    handleLogout();
                });
            }
        });
    });
    const signupButton = document.getElementById('signup');
    signupButton.addEventListener('click', (event) => {
        event.preventDefault();
        dust.render('partials/signupForm', {}, (err, output) => {
            if (loginForm.parentNode) {
                loginForm.parentNode.innerHTML = output;
                handleSignupForm();
            }
        });
    });
}

function init() {
    handleRoomForms();
    handleLoginForm();
    handleLogout();
}
