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
        if (user) {
            dust.render('partials/loggedUser', { loggedUser: user }, (err, output) => {
                const profileNav = document.querySelector('.profile');
                profileNav.innerHTML = output;
                modal.classList.add('hidden');
                handleLogout();
            });
            dust.render('partials/rooms', {loggedUser: user}, (err, output) => {
              const contentDiv = document.getElementById('content');
              contentDiv.innerHTML = output;
              handleRoomForms();
            })
        }
    }).catch((err) => {
        console.error(err);
        handleError(err, 'localLogin');
    });
}

function addMultiListeners(events, element, fn) {
    events.split(' ').forEach(event => element.addEventListener(event, fn, false));
}

function handleSignupForm() {
    const passwordRegex = new RegExp('^(?=.*[A-z])(?=.*[0-9])(?=.{8,})');
    const modal = document.getElementById('login-signup-modal');
    const signupUsername = document.getElementById('signup-name');
    addMultiListeners('blur keyup change click paste', signupUsername, (event) => {
        console.log(event.target.value);
        updateInputField(event.target.value !== '', event.target.parentNode);
        validateForm({ formName: 'signupForm', submitName: 'signup-submit' });
    });
    const signupPassword = document.getElementById('signup-password');
    addMultiListeners('blur keyup change click paste', signupPassword, (event) => {
        updateInputField((passwordRegex.test(event.target.value)), event.target.parentNode);
        validateForm({ formName: 'signupForm', submitName: 'signup-submit' });
    });
    const signupPasswordConfirm = document.getElementById('signup-password-confirm');
    addMultiListeners('blur keyup change click paste', signupPasswordConfirm, (event) => {
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
            } else {
                const err = new Error('Unable to signup');
                err.data = res;
                throw err;
            }
        }).catch((err) => {
            console.error(err);
            handleError(err, 'signup-submit');
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
        event.target.classList.toggle('active');
        modal.classList.toggle('hidden');
    };
    const githubLogin = document.getElementById('githubLogin');
    githubLogin.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.pathname = '/login/github';
    });
    const loginUsername = document.getElementById('login-name');
    const loginPassword = document.getElementById('login-password');
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
                dust.render('partials/about', {}, (err, output) => {
                  const contentDiv = document.getElementById("content");
                  contentDiv.innerHTML = output;
                })

            }
        });
    });
}
