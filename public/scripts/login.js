function init() {
    const form = document.getElementById('login');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = event.target[0].value;
        const password = event.target[1].value;
        doFetchRequest('POST', '/users/login', {
            'Content-Type': 'application/json',
        }, JSON.stringify({
            username,
            password,
        })).then((res) => {
            if (res.status === 401) {
                alert('Invalid Login');
            } else if (res.status === 200) {
                alert('Authorised');
            }
        });
    });
}
