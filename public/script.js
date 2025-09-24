// Admin login functionality
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = this.loginUsername.value;
    const password = this.loginPassword.value;
    const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.message === 'Login successful!') {
        window.location.href = '/home';
    } else {
        document.getElementById('loginMessage').textContent = data.message;
    }
});

