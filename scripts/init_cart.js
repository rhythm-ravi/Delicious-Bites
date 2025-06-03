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
                console.log("Error occurred: " + status + ", " + error);
                console.log(xhr.responseText); // Check the response from the server
            }
        })

    })
}



// only issue rn is if user signs-out and then in OR opens on diff browser, item del, no alert.  (Think)
// The cart is always correct though
function readyCart(menu) {                  ///////////////////   NEED TO REVAMP this function
        console.log("halo");
        window.customElements.define('cart-entry', CartEntry);
        // console.log(system);
        // menu = system.getMenu();    
        
        cartBody = document.querySelector('.cart-table tbody');

        let price = 0;  let i=1;

        let cart = user.getCart();
        console.log(menu);  console.log(cart);
        for (let key in cart) {     // key is item id
            let item = menu[key];
            // if item available in menu
            if (menu[key] && menu[key].availability) {
                entry = document.createElement('tr');
                entry.innerHTML = `
                 <td class="item-id">${i}</td>
                 <td class="item-name">${item.name}</td>
                 <td class="item-price">${item.price}</td>
                 <td class="item-qty">${cart[key]}</td>
                 <td>${item.price * cart[key]}</td>
                `;                
                price += item.price * cart[key];
                cartBody.appendChild(entry);
                i+=1;
            }
            else {
                alert("One or more items added to cart may not be available.");
            }
        }


        const total = document.createElement("tr");
        total.innerHTML =  `
            <td colspan="4" class="summary">Total Amount Payable</td>
            <td class="total-amount">${price ? price : "--"}</td>
        `;
        
        cartBody.appendChild(total);
        cartBody.appendChild(total);

        const temp = new InteractButton(menu[0].id);
        cartBody.appendChild(temp);


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