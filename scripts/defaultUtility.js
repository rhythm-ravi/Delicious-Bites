
//  just a convenience global const object,   allowing less wordy access to user session dets
const user = {
    getUserName: function() {
        return localStorage.getItem('userName');
    },
    getUserId: function() {
        return localStorage.getItem('userId');
    },
    getCart: function() {
        return JSON.parse(localStorage.getItem('items')) || {};     // return js obj from string stored in local storage
        // return localStorage.getItem('items');
    },
    addQty: function(id, qty) {
        // id = toString(id);
        let cart = this.getCart();

        if (!cart[id]) cart[id] = 0;
        cart[id] += qty;
        if (cart[id]<=0) {
            delete cart[id];
        }

        console.log(id);

        localStorage.setItem("items", JSON.stringify(cart));
        console.log(this.getCart());
        return cart[id];
    },
    addCartItem: function(id, qty) {
        // id = toString(id);
        let cart = this.getCart();
        cart[id] = qty;         // assuming id is a new id
        localStorage.setItem("items", JSON.stringify(cart));
    },
    removeCartItem: function(id) {
        // id = toString(id);
        let cart = this.getCart();
        delete cart[id];
        localStorage.setItem("items", JSON.stringify(cart));
        console.log(user.getCart());
    }

}

// Flushes current cart state to server
function closeWindow() {        
    $(document).ready(function() {
        if (!user.getUserId())      // If not signed in, do nothing
            return;
        const userData = {
            'userId': user.getUserId(),  // Replace with actual user ID
            'userCart': user.getCart()  // Replace with actual cart data
        };

        // console.log(user.getCart()); // Log the user data to ensure it's correct

        $.ajax({
            url: '../php/closer.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(userData),  // Convert the data to a JSON string

            success: function(response) {
              console.log('Response from PHP:', response);
            },
            error: function(xhr, status, error) {
              console.error('Error:', error);
            }
          });
          
    });
}

function signOut() {        // signedIn -> out
    closeWindow();
    localStorage.clear();
    window.location.href = "home.html";
}

