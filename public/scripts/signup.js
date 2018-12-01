function init() {
    const form = document.getElementById('signup');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = event.target[0].value;
        const password = event.target[1].value;
        const strongPassword = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');
        const validPassword = strongPassword.test(password);
        if (!validPassword) {
            alert('Password not strong enough');
            throw new Error('Password not strong enough');
        }
        doFetchRequest('POST', '/signup', {
            'Content-Type': 'application/json',
        }, JSON.stringify({
            username,
            password,
        })).then((res) => {
            if (res.status === 201) {
                alert('New user created');
            } else {
                alert('There was an issue with the creation of a new user');
            }
        });
    });
}
