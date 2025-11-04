

function handleLogin(event) {

    event.preventDefault();


    const form = event.target;
    const formData = new FormData(form);

    fetch('../php/login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())          // imp,  else js doesn't interpret it as json despite sending json from php script
    .then(data => {
        console.log(data);
        if (data.success) {                 // login successful
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', data.userName);

            // console.log(data.items[2]);
            alert(`Welcome ${user.getUserName()}!`);
            
            // Redirect to home page
            window.location.href = 'home.html';
        } else {
            console.log(data);
            console.error(data.error);
            alert(data.error);
        }
    })
    .catch(error => console.error('Login API error', error));

}
