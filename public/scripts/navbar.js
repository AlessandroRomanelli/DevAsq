function validateForm(formData) {
    const { formName, submitName } = formData;
    const form = document.getElementById(formName);
    const inputs = form.querySelectorAll('fieldset:not(.submit)');
    const submitButton = document.getElementById(submitName);
    let validForm = true;
    inputs.forEach((input) => {
        const valid = input.getAttribute('valid');
        if (!valid || valid === 'false') {
            validForm = false;
        }
    });
    if (validForm) {
        submitButton.removeAttribute('disabled');
    } else {
        submitButton.setAttribute('disabled', true);
    }
}

function updateInputField(isValid, html) {
    if (isValid) {
        html.setAttribute('valid', true);
        html.classList.add('valid');
        html.classList.remove('error');
    } else {
        html.setAttribute('valid', false);
        html.classList.add('error');
        html.classList.remove('valid');
    }
}

function handleError(err, submitName) {
    const { data } = err;
    const submit = document.getElementById(submitName);
    submit.classList.add('error', 'shake-horizontal');
    setTimeout((submit) => { submit.classList.remove('shake-horizontal'); }, 1000, submit);
}

function login(username, password) {
    const modal = document.getElementById('login-signup-modal');
    doFetchRequest('POST', '/login', {
        'Content-Type': 'application/json',
    }, JSON.stringify({
        username,
        password,
    })).then((res) => {
        if (res.status === 200) {
            return res.json();
        }
        const err = new Error('Invalid Login');
        err.data = res;
        throw err;
    }).then((user) => {
        delete user.password;
        localStorage.user = JSON.stringify(user);
        localStorage.userLogin = JSON.stringify({ username, password });
        if (user) {
            dust.render('partials/loggedUser', { loggedUser: user }, (err, output) => {
                const profileNav = document.querySelector('.profile');
                profileNav.innerHTML = output;
                modal.classList.add('hidden');
                handleLogout();
            });
        }
    }).catch((err) => {
        console.error(err);
        handleError(err, 'localLogin');
    });
}

function handleSignupForm() {
    const passwordRegex = new RegExp('^(?=.*[A-z])(?=.*[0-9])(?=.{8,})');
    const modal = document.getElementById('login-signup-modal');
    const signupUsername = document.getElementById('signup-name');
    signupUsername.addEventListener('keyup', (event) => {
        updateInputField(event.target.value !== '', event.target.parentNode);
        validateForm({ formName: 'signupForm', submitName: 'signup-submit' });
    });
    const signupPassword = document.getElementById('signup-password');
    signupPassword.addEventListener('keyup', (event) => {
        updateInputField((passwordRegex.test(event.target.value)), event.target.parentNode);
        validateForm({ formName: 'signupForm', submitName: 'signup-submit' });
    });
    const signupPasswordConfirm = document.getElementById('signup-password-confirm');
    signupPasswordConfirm.addEventListener('keyup', (event) => {
        updateInputField(event.target.value === signupPassword.value, event.target.parentNode);
        validateForm({ formName: 'signupForm', submitName: 'signup-submit' });
    });
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = signupUsername.value;
        const password = signupPassword.value;
        doFetchRequest('POST', '/signup', {
            'Content-Type': 'application/json',
        }, JSON.stringify({
            username,
            password,
        })).then((res) => {
            if (res.status === 201) {
                login(username, password);
            }
        });
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
    const passwordRegex = new RegExp('^(?=.*[A-z])(?=.*[0-9])(?=.{8,})');
    const modal = document.getElementById('login-signup-modal');
    const loginButton = document.getElementById('login');
    if (!loginButton) return;
    loginButton.onclick = (event) => {
        event.preventDefault();
        if (localStorage.userLogin) {
            const { username, password } = JSON.parse(localStorage.userLogin);
            login(username, password);
        } else {
            event.target.classList.toggle('active');
            modal.classList.toggle('hidden');
        }
    };
    const githubLogin = document.getElementById('githubLogin');
    githubLogin.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.pathname = '/login/github';
    });
    const loginUsername = document.getElementById('login-name');
    loginUsername.addEventListener('keyup', (event) => {
        updateInputField(event.target.value !== '', event.target.parentNode);
        validateForm({ formName: 'loginForm', submitName: 'localLogin' });
    });
    const loginPassword = document.getElementById('login-password');
    loginPassword.addEventListener('keyup', (event) => {
        updateInputField((passwordRegex.test(event.target.value)), event.target.parentNode);
        validateForm({ formName: 'loginForm', submitName: 'localLogin' });
    });
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = loginUsername.value;
        const password = loginPassword.value;
        login(username, password);
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

function handleLogout() {
    const logout = document.getElementById('logout');
    if (!logout) return;
    logout.addEventListener('click', (event) => {
        event.preventDefault();
        doFetchRequest('POST', '/logout', {}, '').then((res) => {
            if (res.status === 200) {
                if (window.location.pathname.split('/').includes('room')) {
                    window.location.pathname = '/';
                    return;
                }
                dust.render('partials/loggedUser', {}, (err, output) => {
                    const profileNav = document.querySelector('.profile');
                    profileNav.innerHTML = output;
                    handleLoginForm();
                });
            }
        });
    });
}
