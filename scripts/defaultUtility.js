
const platform = {
    setMenuTimestamp: function(ts) {
        localStorage.setItem('menuTimestamp', ts);
    },
    getMenuTimestamp: function() {
        return localStorage.getItem('menuTimestamp');
    },

    getMenu: async function() {        
        const clientTimestamp = this.getMenuTimestamp();
        let url = 'php/menu.php';
        // url += '?timestamp=' + encodeURIComponent(clientTimestamp);     // Append client timestamp to the URL
        if (clientTimestamp) {
            url += '?timestamp=' + encodeURIComponent(clientTimestamp);     // Append client timestamp to the URL
        }

        await fetch(url)
            .then(response => response.json())
            .then(data => {
                if (!data.success) {        // Failed to fetch menu data ie couldn't connect to database
                    console.error("Couldn't connect to db:", data.error);
                    return;
                }


                this.setMenuTimestamp(data.timestamp);

                if (data.unchanged) {
                    // If menu unchanged, you may skip re-rendering if desired
                    console.log("Menu unchanged, using cached version.");
                    return;
                }
                // data.items contains the menu
                localStorage.setItem('menu', JSON.stringify(data.items));  // Store menu in local storage
                console.log("Menu fetched successfully:", data.items);      // DEBUG
            })
            .catch(error => {       // could not reach server
                console.error("Error occurred (Couldn't connect to menu.php):", error);
            });

    }
}

//  just a convenience global const object,   allowing less wordy access to user session dets
const user = {
    getUserName: function() {
        return localStorage.getItem('userName');
    },
    getUserId: function() {
        return localStorage.getItem('userId');
    },
    getCart: function() {
        return JSON.parse(localStorage.getItem('cart')) || {};
    },
    getCartTimestamp: function() {
        return localStorage.getItem('cartTimestamp');
    },
    fetchCart: async function() {
        await fetch('php/cart_read.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_timestamp: this.getCartTimestamp(),
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (!data.unchanged) {
                    // If cart has changed, update local storage
                    console.log("Cart fetched successfully:", data.cart);
                    localStorage.setItem('cart', JSON.stringify(data.cart));
                    localStorage.setItem('cartTimestamp', data.timestamp);
                }
                // else cart is the same as before, no need to update
            } else {
                console.error("Error fetching cart:", data.error);
                // If server-side session expired
                if (data.error === "Authentication required.") {
                    alert("Session Expired. Please sign in again.");
                    localStorage.clear();  // Clear local storage on authentication error
                    window.location.href = "home.html";  // Redirect to home page
                }
            }
        })
        .catch(error => {
            console.error("Error occurred (Couldn't connect to cart_read.php):", error)
        });
    },
    updateItem: async function(id, delQty) {
        const cart = this.getCart();
        let qty = ( cart[id] || 0 ) + delQty;  // Get current quantity or 0 if not present
        if (qty < 0) {
            qty = 0;  // Ensure quantity is not negative
        }
        console.log(qty);

        await fetch ('php/cart_update.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: this.getUserId(),
                itemId: id,
                quantity: qty,
                timestamp: this.getCartTimestamp()  // Send current cart timestamp
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {     // update pushed to server
                console.log("Cart updated successfully:", data);
                if (!data.timestamp) {     // couldn't get new timestamp after update or could read that but cart changed by more than just this update
                                            // ie we don't have current timestamp or client may be outdated
                                            // so we sync cart and also get current server timestamp
                    console.log("Timestamp: " + data.timestamp);    // DEBUG
                    location.reload();  // Reload the page to get the latest cart state and display it
                    return;
                }
                // Update local storage cart
                let newCart = this.getCart();
                newCart[id] = qty;
                if (qty <= 0) {
                    delete newCart[id];  // Remove item if quantity is zero
                }
                localStorage.setItem('cart', JSON.stringify(newCart));
                localStorage.setItem('cartTimestamp', data.timestamp);  // Update cart timestamp
            } else {
                console.error("Error updating cart:", data.error);

                // If server-side session expired
                if (data.error === "Authentication required.") {
                    alert("Session Expired. Please sign in again.");
                    localStorage.clear();  // Clear local storage on authentication error
                    window.location.href = "home.html";  // Redirect to home page
                }
                
                if (data.error === "outdated_cart") {
                    alert("Your cart is outdated. Please refresh the page to get the latest cart state.");
                    location.reload();  // Reload the page to get the latest cart state
                }
            }
        })
        .catch(error => {
            console.error("Error occurred (Couldn't connect to cart_update.php):", error);
        });
    }
}




// // Flushes current cart state to server
// function closeWindow() {        
//     $(document).ready(function() {
//         if (!user.getUserId())      // If not signed in, do nothing
//             return;
//         const userData = {
//             'userId': user.getUserId(),  // Replace with actual user ID
//             'userCart': user.getCart()  // Replace with actual cart data
//         };

//         // console.log(user.getCart()); // Log the user data to ensure it's correct

//         $.ajax({
//             url: '../php/closer.php',
//             type: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify(userData),  // Convert the data to a JSON string

//             success: function(response) {
//               console.log('Response from PHP:', response);
//             },
//             error: function(xhr, status, error) {
//               console.error('Error:', error);
//             }
//           });
          
//     });
// }

function signOut() {        // signedIn -> out
    // closeWindow();
    localStorage.clear();
    window.location.href = "home.html";
}

