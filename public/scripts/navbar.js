if (!localStorage.website_theme) {
    localStorage.website_theme = 'dark';
}

const colorsMap = {
    style: {
        light: {
            '--primary-color': '#DE6C2F',
            '--dark-primary-color': '#bc551e',
            '--dark-primary-color2': '#904117',
            '--transparent-primary-color': 'rgba(222, 108, 47, 0.1)',
            '--transparent-primary-color2': 'rgba(222, 108, 47, 0.2)',
            '--transparent-primary-color3': 'rgba(222, 108, 47, 0.5)',
            '--transparent-primary-color4': 'rgba(222, 108, 47, 0.9)',
            '--transparent-primary-color5': 'rgba(222, 108, 47, 0.25)',
            '--transparent-warning': 'rgba(255, 255, 36, 0.8)',
            '--transparent-success': 'rgba(69, 138, 69, 0.8)',
            '--transparent-error': 'rgba(255, 36, 36, 0.8)',
            '--light-primary-color': '#ecaa87',
            '--color-background': '#dddde2',
            '--light-background': 'white',
            '--dark-background': '#dadae0',
            '--dark': '#cfcfd6',
            '--light': '#ebebee',
            '--light2': '#white',
            '--dark-slideron': '#bbc7c1',
            '--dark-slideroff': '#d4bbc1',
            '--text-color': '#4b4b40',
            '--warning': '#ffff57',
            '--success': '#57ab57',
            '--error': '#ff5757',
            '--dark-warning': '#ffff24',
            '--dark-success': '#458a45',
            '--dark-error': '#ff2424',
            '--warning-mix': '#ecec8a',
            '--success-mix': '#7bb67d',
            '--darken-light': '#cfcfd6',
            '--darken-dark': '#c1c1cb',
            '--role-color': '#b4b6ba',
            '--pen-border': 'black',
            '--switch-tab': 'gray',
            '--box-shadow-tab-hover': 'rgba(0, 0, 0, 0.4)',
        },
        dark: {
            '--primary-color': '#DE6C2F',
            '--dark-primary-color': '#bc551e',
            '--dark-primary-color2': '#904117',
            '--transparent-primary-color': 'rgba(222, 108, 47, 0.1)',
            '--transparent-primary-color2': 'rgba(222, 108, 47, 0.2)',
            '--transparent-primary-color3': 'rgba(222, 108, 47, 0.5)',
            '--transparent-primary-color4': 'rgba(222, 108, 47, 0.9)',
            '--transparent-primary-color5': 'rgba(222, 108, 47, 0.25)',
            '--transparent-warning': 'rgba(255, 255, 36, 0.8)',
            '--transparent-success': 'rgba(69, 138, 69, 0.8)',
            '--transparent-error': 'rgba(255, 36, 36, 0.8)',
            '--light-primary-color': '#ecaa87',
            '--color-background': '#1d1f20',
            '--light-background': '#4d5356',
            '--dark-background': '#1b1c1d',
            '--dark': '#111213',
            '--light': '#292c2d',
            '--light2': '#414648',
            '--dark-slideron': '#0f1d11',
            '--dark-slideroff': '#291011',
            '--text-color': 'white',
            '--warning': '#ffff57',
            '--success': '#57ab57',
            '--error': '#ff5757',
            '--dark-warning': '#ffff24',
            '--dark-success': '#458a45',
            '--dark-error': '#ff2424',
            '--warning-mix': '#a0a03c',
            '--success-mix': '#427d42',
            '--darken-light': '#111213',
            '--darken-dark': '#050505',
            '--role-color': '#b4b6ba',
            '--pen-border': 'black',
            '--switch-tab': 'gray',
            '--box-shadow-tab-hover': 'rgba(0, 0, 0, 0.4)',
        },
    },
    aceThemes: {
        dark: 'tomorrow_night',
        light: 'eclipse',
    },
};

function applyTheme() {
    const body = document.querySelector('body');
    const theme = localStorage.website_theme;
    Object.keys(colorsMap.style[theme]).forEach((property) => {
        body.style.setProperty(property, colorsMap.style[theme][property]);
    });
    const controls = document.querySelector('.controls');
    if (controls === null) return;
    const aceTheme = colorsMap.aceThemes[theme];
    ace.edit('htmlPen').setTheme(`ace/theme/${aceTheme}`);
    ace.edit('cssPen').setTheme(`ace/theme/${aceTheme}`);
    ace.edit('jsPen').setTheme(`ace/theme/${aceTheme}`);
}

function switchTheme(event) {
    const theme = localStorage.website_theme || 'dark';
    if (theme === 'dark') {
        localStorage.website_theme = 'light';
        applyTheme();
    } else {
        localStorage.website_theme = 'dark';
        applyTheme();
    }
}

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

function handleError(err, html) {
    console.error(err);
    html.classList.add('error', 'shake-horizontal');
    setTimeout((html) => { html.classList.remove('error', 'shake-horizontal'); }, 1000, html);
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
    }).then((userRes) => {
        if (userRes) {
            user = userRes;
            dust.render('partials/loggedUser', { loggedUser: userRes }, (err, output) => {
                const profileNav = document.querySelector('.profile');
                profileNav.innerHTML = output;
                modal.classList.add('hidden');
                handleLogout();
            });
            dust.render('partials/rooms', { loggedUser: userRes }, (err, output) => {
                const oldExplorer = document.getElementById('room-browser').innerHTML;
                const contentDiv = document.getElementById('content');
                contentDiv.innerHTML = output;
                document.getElementById('room-browser').innerHTML = oldExplorer;
                handleRoomForms();
                addExplorerListener();
            });
        }
    }).catch((err) => {
        console.error(err);
        const loginButton = document.getElementById('localLogin');
        handleError(err, loginButton);
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
            const signupButton = document.getElementById('signup-submit');
            handleError(err, signupButton);
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
                    const oldExplorer = document.getElementById('room-browser').innerHTML;
                    const contentDiv = document.getElementById('content');
                    contentDiv.innerHTML = output;
                    document.getElementById('room-browser').innerHTML = oldExplorer;
                    document.getElementById('room-browser-title').classList.add('hidden');
                    document.getElementById('roomTable').classList.add('hidden');
                });
            }
        });
    });
}

(function () {
    const theme = localStorage.website_theme || 'dark';
    applyTheme(theme);
    const themeChanger = document.querySelector('#themeChanger input');
    themeChanger.checked = theme === 'dark';
    themeChanger.addEventListener('input', event => switchTheme());
}());
