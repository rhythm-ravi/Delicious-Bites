// const req = require( "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" );
// import "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";

function renderCart() {
    $(document).ready(function() {
        console.log("halo");
        $.ajax({
            method: 'POST',
            url: 'php/helper.php',
            dataType: 'JSON',
            success: function(response) {
                console.log(response);
                readyCart(response);
            },
            error: function(xhr, status, error) {
                alert("Unable to render cart at the moment. Please try later.");
                console.log("Error occurred: " + status + ", " + error);
                console.log(xhr.responseText); // Check the response from the server
            }
        })

    })
}



// only issue rn is if user signs-out and then in OR opens on diff browser, item del, no alert.  (Think)
// The cart is always correct though
function readyCart(menu) {
        console.log("halo");
        window.customElements.define('cart-entry', CartEntry);
        window.customElements.define('item-interact', CartItemInteract);

        let price = 0;  let i=1;

        let cart = user.getCart();
        console.log(menu);  console.log(cart);
        
        const cartContainer = document.querySelector(".cart");
        const checkoutDiv = document.querySelector(".checkout");
        
        // Check if cart is empty
        if (Object.keys(cart).length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any items yet!</p>
                    <a href="home.html" class="item-btn">Browse Menu</a>
                </div>
            `;
            checkoutDiv.style.display = 'none';
            return;
        }
        
        for (let key in cart) {     // key is item id
            let item = menu[key];
            // if item available in menu
            if (menu[key] && menu[key].availability) {
                entry = new CartEntry(key, item.name, item.price);             
                price += item.price * cart[key];
                cartContainer.appendChild(entry);
                i+=1;
            }
            else {
                alert("One or more items added to cart may not be available.");
            }
        }

        // Add total amount display
        const totalDiv = document.createElement("div");
        totalDiv.className = "cart-total-section";
        totalDiv.innerHTML = `
            <div class="cart-total-row">
                <span class="total-label">Total Amount:</span>
                <span class="total-amount">$${price.toFixed(2)}</span>
            </div>
        `;
        cartContainer.appendChild(totalDiv);
}

        // menu.forEach(item => {
        //     if (user.getCart()[[item.id]]) {    // +ve int
        //         //////////////////////////////////////
        //         // entry = document.createElement('cart-entry');
        //         // entry.item = item;  entry.qty = user.getCart()[item.id];
        //         // price += entry.item.price * entry.qty;
        //         // // console.log(`${item.name}, ${item.price}`);

        //         // // const tr = document.createElement("tr");    tr.appendChild(entry);
        //         // // cartBody.appendChild(entry);
        //         //////////////////////////////////////
        //         entry = document.createElement('tr');
        //         entry.innerHTML = `
        //          <td class="item-id">${i}</td>
        //          <td class="item-name">${item.name}</td>
        //          <td class="item-price">${item.price}</td>
        //          <td class="item-qty">${user.getCart()[item.id]}</td>
        //          <td>${item.price * user.getCart()[item.id]}</td>
        //         `;                
        //         price += item.price * user.getCart()[item.id];
        //         cartBody.appendChild(entry);
        //         i+=1;
        //     }
        // });