function handleLogin(user_id, username) {

    // stored in localStorage, so persists across sessions
    localStorage.setItem('user_id', user_id);
    localStorage.setItem('username', username);

    // window.location.href = "home.html";
}