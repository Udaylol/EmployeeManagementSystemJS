// Toggle between login and signup forms
const showLoginBtn = document.getElementById('showLogin');
const showSignupBtn = document.getElementById('showSignup');
const loginContainer = document.getElementById('loginContainer');
const signupContainer = document.getElementById('signupContainer');

showLoginBtn.addEventListener('click', function() {
    showLoginBtn.classList.add('active');
    showSignupBtn.classList.remove('active');
    loginContainer.style.display = '';
    signupContainer.style.display = 'none';
});

showSignupBtn.addEventListener('click', function() {
    showSignupBtn.classList.add('active');
    showLoginBtn.classList.remove('active');
    signupContainer.style.display = '';
    loginContainer.style.display = 'none';
});
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

document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = this.signupUsername.value;
    const password = this.signupPassword.value;
    const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    document.getElementById('signupMessage').textContent = data.message;
});
