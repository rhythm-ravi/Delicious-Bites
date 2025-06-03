

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
            localStorage.setItem('items', JSON.stringify(data.items));
            console.log(user.getCart());
            user.removeCartItem(0);     // remove the placeholder value, since its job is done.
            console.log(user.getCart());

            // console.log(data.items[2]);
            window.location.href = "success_login.html";

        } else {
            window.location.href = "failure_login.html";
        }
        // else {
        //     alert('The whole php page failed???');
        // }
    })
    .catch(error => console.error('Some sort of error:', error));

}

// handleLogin();