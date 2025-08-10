function signOut() {        // signedIn -> out
    localStorage.clear();

    // // Make api call to end php session (clear logged in user)
    // await fetch('../php/cart_update.php', {
    //     method: 'POST', 
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }   
    //     })
    //     .then(response => response.json())      
    //     .then(data => {
    //         if (data.success) {
    //             console.log("Cart updated successfully:", data.cart);
    //         } else {
    //             console.error("Error updating cart:", data.error);
    //         }
    //     })
    // });
    window.location.href = "home.html";
}